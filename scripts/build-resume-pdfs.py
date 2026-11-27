#!/usr/bin/env python3
"""Build the three two-page PDFs from lib/resume-data.json and the retained layout.
Requires lxml, pdfplumber and macOS Pages. Run with the configured Codex Python.
The website build verifies the resulting source/PDF hashes; it never runs Pages.
"""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from copy import deepcopy
from lxml import etree as E
import argparse, json, hashlib, subprocess
import pdfplumber

ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser();parser.add_argument('--work-dir',type=Path,required=True);args=parser.parse_args()
work=args.work_dir.resolve();work.mkdir(parents=True,exist_ok=True);(ROOT/'resumes').mkdir(exist_ok=True)
data_file=ROOT/'lib/resume-data.json';data=json.loads(data_file.read_text());template=ROOT/'assets/resume-layout.docx'
ns={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'};w='{'+ns['w']+'}';rn='http://schemas.openxmlformats.org/officeDocument/2006/relationships'
months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
def date(s):return months[int(s[5:7])-1]+' '+s[:4] if s else 'Present'
def period(o):return date(o['start'])+'-'+date(o['end'])
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def resolve_url(link):
 if link.get('url'):return link['url']
 if link.get('work'):return data['workLinks'][link['work']]['url']
 field='publications' if link.get('publication') else 'projects'
 id=link.get('publication') or link.get('project')
 return next(item['url'] for item in data[field] if item['id']==id)
outputs={}
for key,view in data['views'].items():
 z=ZipFile(template);root=E.fromstring(z.read('word/document.xml'));body=root.find('w:body',ns)
 slots={''.join(p.xpath('.//w:t/text()',namespaces=ns))[2:-2]:deepcopy(p) for p in body.findall('w:p',ns)}
 for p in body.findall('w:p',ns):body.remove(p)
 rels=E.fromstring(z.read('word/_rels/document.xml.rels'))
 def add(p):body.insert(len(body)-1,p);return p
 def fill(p,text,bold=(),links=()):
  rp=p.find('.//w:r/w:rPr',ns);rp=deepcopy(rp) if rp is not None else E.Element(w+'rPr')
  for tag in ['b','bCs']:
   for e in rp.findall('w:'+tag,ns):rp.remove(e)
  for c in list(p):
   if c.tag!=w+'pPr':p.remove(c)
  ranges=[];cuts={0,len(text)}
  for label in bold:
   a=text.find(label)
   if a<0:continue
   b=a+len(label)
   if any(a<end and b>start for start,end in ranges):continue
   ranges.append((a,b));cuts.update([a,b])
  linked=[]
  for link in links:
   a=text.find(link['label']);b=a+len(link['label'])
   if a<0 or any(a<end and b>start for start,end,url in linked):continue
   linked.append((a,b,resolve_url(link)));cuts.update([a,b])
  cuts=sorted(cuts);last_link=None;container=p
  for a,b in zip(cuts,cuts[1:]):
   active=next(((start,end,url) for start,end,url in linked if a>=start and b<=end),None)
   if active:
    if last_link!=active:
     rid='rIdPdf'+str(len(rels)+1);rel=E.SubElement(rels,'{http://schemas.openxmlformats.org/package/2006/relationships}Relationship')
     for k,v in {'Id':rid,'Type':rn+'/hyperlink','Target':active[2],'TargetMode':'External'}.items():rel.set(k,v)
     container=E.SubElement(p,w+'hyperlink');container.set('{'+rn+'}id',rid);container.set(w+'history','1')
   else:container=p
   last_link=active
   r=E.SubElement(container,w+'r');pr=deepcopy(rp)
   if any(a>=start and b<=end for start,end in ranges):
    for tag in ['b','bCs']:E.SubElement(pr,w+tag).set(w+'val','1')
   r.append(pr)
   for i,t in enumerate(text[a:b].split('\n')):
    if i:E.SubElement(r,w+'br')
    if t:
     el=E.SubElement(r,w+'t');el.set('{http://www.w3.org/XML/1998/namespace}space','preserve');el.text=t
  return p
 def para(slot,text='',bold=(),links=()):return fill(deepcopy(slots[slot]),text,bold,links)
 def spacing(p,kind,val):
  pr=p.find('w:pPr',ns);sp=pr.find('w:spacing',ns)
  if sp is None:sp=E.SubElement(pr,w+'spacing')
  sp.set(w+kind,str(val))
 def link(p,label,url):
  run=next(r for r in p.findall('w:r',ns) if ''.join(r.xpath('.//w:t/text()',namespaces=ns))==label)
  rid='rIdPdf'+str(len(rels)+1);rel=E.SubElement(rels,'{http://schemas.openxmlformats.org/package/2006/relationships}Relationship')
  for k,v in {'Id':rid,'Type':rn+'/hyperlink','Target':url,'TargetMode':'External'}.items():rel.set(k,v)
  h=E.Element(w+'hyperlink');h.set('{'+rn+'}id',rid);h.set(w+'history','1');idx=p.index(run);p.remove(run);h.append(run);p.insert(idx,h)
 def heading(text):
  p=deepcopy(slots['heading'])
  ts=p.findall('.//w:t',ns)
  for i,t in enumerate(ts):t.text=text+' ' if i==0 else ''
  add(p)
 def gap(kind='jobGap'):add(para(kind))
 def company(job):
  p=para('company');base=deepcopy(p.find('w:pPr/w:rPr',ns))
  if base is None:base=E.Element(w+'rPr')
  for content,size,is_tab in [(job['pdfCompany'],22,False),(' | '+(job.get('team') or job.get('location',''))+' ',21,False),('',21,True),(period(job),21,False)]:
   run=E.SubElement(p,w+'r');pr=deepcopy(base)
   for tag in ['sz','szCs']:
    for el in pr.findall('w:'+tag,ns):pr.remove(el)
    E.SubElement(pr,w+tag).set(w+'val',str(size))
   run.append(pr)
   if is_tab:E.SubElement(run,w+'tab')
   else:
    t=E.SubElement(run,w+'t');t.set('{http://www.w3.org/XML/1998/namespace}space','preserve');t.text=content
  add(p);add(para('role',job['title'],[job['title']]))
 def render_job(job):
  company(job)
  overview=job.get('pdfOverview',job.get('overview',''))
  if overview:add(para('overview',overview,job.get('pdfEmphasis',[]),job.get('links',[])))
  ids=view['pdf']['bullets'].get(job['id'])
  bullets=job['bullets'] if ids is None else [next(b for b in job['bullets'] if b['id']==id) for id in ids]
  for bullet in bullets:add(para('bullet',bullet.get('pdfText',bullet['text']),bullet.get('emphasis',[]),bullet.get('pdfLinks',bullet.get('links',[]))))
 person=data['person'];add(para('name',person['name'],[person['name']]))
 contact=f"{person['phone']} | {person['email']} | linkedin.com/in/dgabeau | DavidGabeau.com | github.com/primitives-xyz | {person['location']}"
 labels=[person['phone'],person['email'],'linkedin.com/in/dgabeau','DavidGabeau.com','github.com/primitives-xyz']
 p=para('contact',contact,labels)
 # Contact text stays regular-weight at the retained 8 pt size.
 for pr in p.findall('w:r/w:rPr',ns):
  for tag in ['b','bCs']:
   for el in pr.findall('w:'+tag,ns):pr.remove(el)
 for label,url in zip(labels,[person['phoneUrl'],'mailto:'+person['email'],person['linkedin'],person['website'],person['github']]):link(p,label,url)
 add(p);gap('blank')
 headline=view['pdf']['headline'];add(para('headline',headline,[headline]))
 metrics=' · '.join(data['metrics'][id]['pdf'] for id in view['metrics']);add(para('metrics',metrics,[metrics]))
 add(para('summary',view['pdf']['summary'],links=data.get('summaryLinks',[])))
 heading('CORE SKILLS')
 for id in view['pdf']['skills']:
  skill=next(s for s in data['skills'] if s['id']==id);label=skill['name']+':';add(para('skill',label+' '+skill['pdf'],[label],skill.get('links',[])))
 gap('gap');heading('EXPERIENCE');gap('afterHeading')
 for i,job in enumerate(data['experience'][:3]):
  if i:gap()
  render_job(job)
 gap('pageBreak')
 for i,job in enumerate(data['experience'][3:]):
  if i:gap()
  render_job(job)
 gap('gap');heading('INDEPENDENT PROJECTS')
 for i,id in enumerate(view['projects']):
  project=next(p for p in data['projects'] if p['id']==id)
  text=f"{project['name']} | {project['role']} | {period(project)}\n{project['pdfText']}"
  p=para('project',text,[project['name']]);spacing(p,'before',0 if i==0 else 120);link(p,project['name'],project['url']);add(p)
 gap('gap');heading('SELECTED INVESTMENT & TECHNOLOGY RESEARCH')
 for i,id in enumerate(view['pdf']['publications']):
  item=next(p for p in data['publications'] if p['id']==id);publisher=item.get('pdfPublisher');text=item['title']+' | '+(publisher+' | ' if publisher else '')+date(item['date'])
  p=para('writing',text,[item['title']]);spacing(p,'before',0 if i==0 else 80);link(p,item['title'],item['url']);add(p)
 gap('gap');heading('EDUCATION & CERTIFICATION');gap('afterHeading')
 for item in data['education']:add(para('overview',item['institution']+' | '+item['qualification'],[item['institution']]))
 for item in data['certifications']:add(para('overview',item['name']+' | '+item['issuer']+' | Certificate issued '+date(item['issued']),[item['name']]))
 gap('gap');heading('SPEAKING & COMMUNITY');gap('afterHeading')
 speaking='Speaking: '+ '; '.join(item['event'] for item in data['speaking'])+'.'
 add(para('overview',speaking,['Speaking:'],[{'label':item['event'],'url':item['url']} for item in data['speaking'] if item.get('url')]))
 for item in data['community']:add(para('overview',item['organization']+' | '+item['title']+' | '+period(item),[item['organization']]))
 xml=E.tostring(root,xml_declaration=True,encoding='UTF-8',standalone=True)
 assert '\u2014' not in xml.decode() and '\u2013' not in xml.decode()
 parts={'word/document.xml':xml,'word/_rels/document.xml.rels':E.tostring(rels,xml_declaration=True,encoding='UTF-8',standalone=True)}
 stem=Path(view['pdf']['filename']).stem
 doc=work/(stem+'.docx');pages=work/(stem+'.pages');pdf=ROOT/'resumes'/view['pdf']['filename']
 with ZipFile(doc,'w',ZIP_DEFLATED) as out:
  for item in z.infolist():out.writestr(item,parts.get(item.filename,z.read(item.filename)))
 applescript=f'''tell application "Pages"
set d to open POSIX file {json.dumps(str(doc))}
save d in POSIX file {json.dumps(str(pages))}
export d to POSIX file {json.dumps(str(pdf))} as PDF
set pageCount to count pages of d
close d
return pageCount
end tell'''
 result=subprocess.run(['osascript','-'],input=applescript,text=True,capture_output=True,timeout=120,check=True)
 with pdfplumber.open(pdf) as p:
  count=len(p.pages);all_text='\n'.join(page.extract_text() for page in p.pages)
  assert all(x not in all_text for x in ['\u2014','\u2013'])
  outputs[key]={'file':str(pdf.relative_to(ROOT)),'pages':count,'sha256':sha(pdf)}
 print(f'{key}: {count} pages - {pdf}',flush=True)
 if count!=2:print(f'WARNING: {key} must be fitted to two pages before publishing.',flush=True)
assert all(item['pages']==2 for item in outputs.values()),'PDF layout needs review'
# The legacy filenames remain useful bookmarks and always match Combined.
for alias in ['David_Gabeau_Resume.pdf','resume.pdf']:
 (ROOT/alias).write_bytes((ROOT/outputs['combined']['file']).read_bytes())
manifest={'dataSha256':sha(data_file),'templateSha256':sha(template),'builderSha256':sha(Path(__file__)),'pdfs':outputs}
(ROOT/'resumes/manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('Built all three two-page PDFs and saved source/PDF provenance hashes.',flush=True)
