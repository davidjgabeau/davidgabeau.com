import resume from './resume-data.json' with { type: 'json' };

const origin = resume.person.website;
const canonical = `${origin}/resume`;
export const resumeMetadata = {
  title: resume.views.combined.title,
  description: resume.views.combined.description,
  url: canonical,
  modified: resume.updated,
};
export const resumeData = resume;
export const escapeHtml = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const e = escapeHtml;
export function normalizeView(value) {
  const key = typeof value === 'string' ? value.toLowerCase() : '';
  return Object.hasOwn(resume.views, key) ? key : 'combined';
}
export const viewUrl = key => key === 'combined' ? '/resume' : `/resume?view=${key}`;
export const pdfUrl = key => `/resumes/${resume.views[normalizeView(key)].pdf.filename}`;
export function ordered(items, ids = []) {
  const ranked = ids.map(id => items.find(item => item.id === id)).filter(Boolean);
  return [...ranked, ...items.filter(item => !ids.includes(item.id))];
}
export function dateLabel(value) {
  if (!value) return 'Present';
  const [year, month] = value.split('-');
  return `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][Number(month) - 1]} ${year}`;
}
const date = value => value ? `<time datetime="${e(value)}">${dateLabel(value)}</time>` : 'Present';
const period = item => `${date(item.start)} - ${date(item.end)}`;
function rich(text, emphasis = [], links = []) {
  const spans = [];
  for (const label of emphasis) {
    const start = text.indexOf(label);
    if (start >= 0) spans.push({ start, end: start + label.length, label, tag: 'strong' });
  }
  for (const link of links) {
    const start = text.indexOf(link.label);
    if (start >= 0) spans.push({ start, end: start + link.label.length, label: link.label, tag: 'a', url: link.url });
  }
  spans.sort((a,b) => a.start - b.start || b.end - a.end);
  let cursor = 0, output = '';
  for (const span of spans) {
    if (span.start < cursor) continue;
    output += e(text.slice(cursor, span.start));
    output += span.tag === 'a' ? `<a href="${e(span.url)}">${e(span.label)}</a>` : `<strong>${e(span.label)}</strong>`;
    cursor = span.end;
  }
  return output + e(text.slice(cursor));
}
function section(id, title, content) {
  return `<section class="resume-section" aria-labelledby="${id}-title"><h2 id="${id}-title">${e(title)}</h2>${content}</section>`;
}
function renderJob(job, view) {
  const bullets = ordered(job.bullets, view.priorities[job.id]);
  return `<article class="resume-job" id="experience-${job.id}">
  <header class="resume-job-header"><div><h3>${e(job.company)}</h3><p class="resume-role">${e(job.title)}</p><p class="resume-location">${e(job.team || job.location)}</p></div><p class="resume-period">${period(job)}</p></header>
  <p>${rich(job.overview, [], job.links)}</p>
  ${bullets.length ? `<ul>${bullets.map(bullet => `<li data-accomplishment="${job.id}-${bullet.id}">${rich(bullet.text, bullet.emphasis)}</li>`).join('')}</ul>` : ''}
</article>`;
}
export function renderResume(requestedView = 'combined') {
  const key = normalizeView(requestedView), view = resume.views[key], person = resume.person;
  const currentJob = resume.experience[0], address = person.address;
  const url = origin + viewUrl(key);
  const download = `<a class="resume-download" href="${pdfUrl(key)}" download="${e(view.pdf.filename)}">Download ${e(view.label)} Resume PDF <span aria-hidden="true">↓</span></a>`;
  const schema = {
    '@context': 'https://schema.org', '@graph': [
      { '@type': 'Person', '@id': `${origin}/#person`, name: person.name, url: `${origin}/`,
        jobTitle: resume.experience[0].title,
        description: resume.views.combined.description,
        worksFor: { '@type': 'Organization', '@id': `${origin}/#a16z`, name: currentJob.organizationName, alternateName: currentJob.organizationAlias, url: currentJob.organizationUrl },
        homeLocation: { '@type': 'Place', name: address.name, address: { '@type': 'PostalAddress', addressLocality: address.city, addressRegion: address.region, addressCountry: address.country } },
        sameAs: person.sameAs,
        knowsAbout: person.knowsAbout,
      },
      { '@type': 'ProfilePage', '@id': `${canonical}#webpage`, url: canonical, name: view.title, description: view.description,
        dateModified: resume.updated, inLanguage: 'en', mainEntity: { '@id': `${origin}/#person` },
        isPartOf: { '@type': 'WebSite', '@id': `${origin}/#website`, url: `${origin}/`, name: person.name },
        associatedMedia: { '@type': 'MediaObject', name: `${person.name} ${view.label} Resume PDF`, contentUrl: origin + pdfUrl(key), encodingFormat: 'application/pdf' },
      },
    ],
  };
  const contacts = [
    [`mailto:${person.email}`, 'Email'], [person.phoneUrl, person.phone], [person.linkedin, 'LinkedIn'], [person.github, 'GitHub'], [person.website, 'DavidGabeau.com'],
  ];
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${e(view.title)}</title>
  <meta name="description" content="${e(view.description)}">
  <meta name="author" content="${e(person.name)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="profile">
  <meta property="og:site_name" content="${e(person.name)}">
  <meta property="og:title" content="${e(view.title)}">
  <meta property="og:description" content="${e(view.description)}">
  <meta property="og:url" content="${e(url)}">
  <meta property="og:image" content="${origin}/images/social/home-animated-v3.png">
  <meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="David Gabeau's notebook-style personal website">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${e(view.title)}">
  <meta name="twitter:description" content="${e(view.description)}">
  <meta name="twitter:image" content="${origin}/images/social/home-animated-v3.png">
  <link rel="icon" href="/favicon-notebook.png?v=2" type="image/png" sizes="32x32">
  <link rel="icon" href="/favicon.svg?v=20261009-notebook" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=2">
  <meta name="theme-color" content="#f8f7f3">
  <link rel="stylesheet" href="/notebook.css?v=20261101-sf-link">
  <link rel="stylesheet" href="/typography.css?v=20261009-exeter-caption">
  <link rel="stylesheet" href="/resume.css?v=20261126-views">
  <link rel="alternate" type="text/plain" title="Site guide" href="/llms.txt">
  <script type="application/ld+json">${JSON.stringify(schema).replaceAll('<', '\\u003c')}</script>
</head>
<body class="resume-page" data-resume-view="${key}">
<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header">
  <a class="wordmark" href="/">David Gabeau</a>
  <nav aria-label="Main navigation"><a href="/#writing">Writing</a><a href="/#projects">Projects</a><a href="https://blog.usetapestry.dev" target="_blank" rel="noopener noreferrer">Newsletter <span aria-hidden="true">↗</span></a></nav>
</header>
<main id="main" class="resume-main">
  <header class="resume-intro">
    <p class="section-label">Resume · ${e(person.location)}</p>
    <h1>${e(person.name)}</h1>
    <p class="resume-position">${e(view.headline)}</p>
    <nav class="resume-views" aria-label="Resume view">${Object.entries(resume.views).map(([id, item]) => `<a href="${viewUrl(id)}"${key === id ? ' aria-current="page"' : ''}>${e(item.label)}</a>`).join('')}</nav>
    <div class="resume-actions">${download}<span class="resume-file-details">PDF · 2 pages</span></div>
    <ul class="resume-contact" aria-label="Contact and profiles">${contacts.map(([href,label]) => `<li><a href="${e(href)}">${e(label)}</a></li>`).join('')}</ul>
    <p class="resume-summary">${e(view.summary)}</p>
    <ul class="resume-metrics" aria-label="Selected outcomes">${view.metrics.map(id => `<li>${e(resume.metrics[id].text)}</li>`).join('')}</ul>
  </header>
  ${section('skills', 'Core skills', `<dl class="resume-skills">${ordered(resume.skills, view.skills).map(skill => `<div data-skill="${skill.id}"><dt>${e(skill.name)}</dt><dd>${e(skill.items.join(', '))}</dd></div>`).join('')}</dl>`)}
  ${section('experience', 'Experience', resume.experience.map(job => renderJob(job,view)).join(''))}
  ${section('projects', 'Independent projects', ordered(resume.projects, view.projects).map(project => `<article class="resume-project"><h3><a href="${e(project.url)}">${e(project.name)}</a></h3><p class="resume-period">${e(project.role)} · ${period(project)}</p><p>${e(project.description)}</p></article>`).join(''))}
  ${section('writing', 'Investment & technology research', ordered(resume.publications, view.publications).map(publication => `<article class="resume-writing"><h3><a href="${e(publication.url)}">${e(publication.title)}</a></h3><p class="resume-period">${e(publication.publisher)} · ${date(publication.date)}</p><p>${e(publication.description)}</p></article>`).join(''))}
  ${section('speaking', 'Speaking', `<ul class="resume-speaking">${resume.speaking.map(talk => `<li><strong>${e(talk.event)}</strong><span>${e(talk.title)}</span></li>`).join('')}</ul>`)}
  ${section('education', 'Education & certification', `${resume.education.map(item => `<p><strong>${e(item.institution)}</strong> · ${e(item.qualification)}</p>`).join('')}${resume.certifications.map(item => `<p class="resume-certification"><strong>${e(item.name)}</strong> · ${e(item.issuer)} · Certificate issued ${date(item.issued)}</p>`).join('')}`)}
  ${section('community', 'Community', resume.community.map(item => `<p><strong>${e(item.organization)}</strong> · ${e(item.title)} · ${period(item)}</p>`).join(''))}
  <p class="resume-bottom-download"><a href="${pdfUrl(key)}" download="${e(view.pdf.filename)}">Download ${e(view.label)} Resume PDF ↓</a></p>
</main>
<footer class="site-footer"><a class="wordmark" href="/">David Gabeau</a><nav aria-label="Footer navigation"><a href="/">Home</a><a href="/writing">Writing</a><a href="/resume" aria-current="page">Resume</a><a href="mailto:${e(person.email)}">Email</a><a href="${e(person.linkedin)}">LinkedIn</a></nav><p>© ${resume.updated.slice(0,4)} David Gabeau</p></footer>
</body>
</html>\n`;
}
