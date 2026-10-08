// Native links and disclosures work without JavaScript; motion is progressive enhancement.
const track = document.querySelector('#camera-track');
const controls = [...document.querySelectorAll('[data-scroll]')];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
function updateControls() {
  if (!track) return;
  const max = track.scrollWidth - track.clientWidth;
  for (const button of controls) {
    button.disabled = Number(button.dataset.scroll) < 0 ? track.scrollLeft <= 2 : track.scrollLeft >= max - 2;
  }
}
for (const button of controls) {
  button.addEventListener('click', () => {
    track.scrollBy({left: Number(button.dataset.scroll) * track.clientWidth * .75, behavior: reducedMotion.matches ? 'instant' : 'smooth'});
  });
}
if (track) {
  track.addEventListener('scroll', updateControls, {passive:true});
  new ResizeObserver(updateControls).observe(track);
  updateControls();
}
const photos = [...document.querySelectorAll('.photo-reveal')];
function setPhotoReveal(button, reveal) {
  button.setAttribute('aria-pressed', String(reveal));
  button.setAttribute('aria-label', `${reveal ? 'Show sketch' : 'Reveal photograph'}: ${button.dataset.caption}`);
}
for (const button of photos) {
  button.addEventListener('click', () => {
    const reveal = button.getAttribute('aria-pressed') !== 'true';
    // A deliberate tap takes precedence over automatic reveals.
    mobileRevealed.add(button);
    photoObserver?.unobserve(button);
    setPhotoReveal(button, reveal);
  });
}

// A single observer gives the notebook a gentle, one-time arrival as it is read.
// Content stays visible if JavaScript, observers, or animation are unavailable.
const motionSelector = '.intro h1, .intro-copy, .contact-links, .editorial-section > .section-label, .editorial-section > .section-body, .timeline-entry, .margin-study img, .camera-heading, .photo-reveal';
const motionTargets = [...document.querySelectorAll(motionSelector)];
const arrived = new WeakSet();
const activeMotion = new Set();
let arrivalObserver;

function playNotebookMotion(element, frames, options) {
  if (reducedMotion.matches || typeof element.animate !== 'function') return;
  const animation = element.animate(frames, options);
  activeMotion.add(animation);
  const cleanup = () => activeMotion.delete(animation);
  animation.addEventListener('finish', cleanup, {once: true});
  animation.addEventListener('cancel', cleanup, {once: true});
}

function observeArrivals() {
  arrivalObserver?.disconnect();
  if (reducedMotion.matches || !('IntersectionObserver' in window)) return;
  arrivalObserver = new IntersectionObserver(entries => {
    let sequence = 0;
    for (const entry of entries) {
      if (!entry.isIntersecting || arrived.has(entry.target)) continue;
      const element = entry.target;
      arrived.add(element);
      arrivalObserver.unobserve(element);
      // A keyboard or anchor jump should land on immediately usable content.
      if (element.contains(document.activeElement) || element.matches(':target')) continue;
      const study = element.matches('.margin-study img');
      playNotebookMotion(element, [
        {opacity: 0, transform: study ? 'translateY(7px) rotate(-1.5deg)' : 'translateY(12px)'},
        {opacity: 1, transform: 'none'}
      ], {
        duration: study ? 950 : 620,
        delay: Math.min(sequence++ * 45, 135),
        easing: 'cubic-bezier(.22,1,.36,1)',
        fill: 'backwards'
      });
    }
  }, {threshold: 0.08});
  motionTargets.forEach(element => {
    if (!arrived.has(element)) arrivalObserver.observe(element);
  });
}

for (const disclosure of document.querySelectorAll('.archive')) {
  const summary = disclosure.querySelector('summary');
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'archive-close';
  close.textContent = 'Show less';
  close.setAttribute('aria-label', `Show less ${disclosure.closest('#writing') ? 'writing' : 'projects'}`);
  disclosure.append(close);
  disclosure.classList.add('archive-enhanced');
  close.addEventListener('click', () => {
    disclosure.open = false;
    summary.focus({preventScroll: true});
    // Keep the restored opener on screen after a long list collapses.
    const bounds = summary.getBoundingClientRect();
    if (bounds.top < 0 || bounds.bottom > window.innerHeight) summary.scrollIntoView({block: 'nearest'});
  });
  disclosure.addEventListener('toggle', () => {
    const content = disclosure.querySelector('.archive-content');
    if (disclosure.open && content) {
      if (document.activeElement === summary) content.querySelector('a, button')?.focus({preventScroll: true});
      playNotebookMotion(content, [
        {opacity: 0.3, transform: 'translateY(-5px)'},
        {opacity: 1, transform: 'none'}
      ], {duration: 260, easing: 'ease-out'});
    }
  });
}

reducedMotion.addEventListener('change', () => {
  for (const animation of activeMotion) animation.cancel();
  observeArrivals();
});
document.addEventListener('focusin', event => {
  for (const animation of activeMotion) {
    if (animation.effect?.target?.contains(event.target)) animation.cancel();
  }
});
// Never leave motion running in a background tab.
document.addEventListener('visibilitychange', () => {
  if (document.hidden) for (const animation of activeMotion) animation.finish();
});
observeArrivals();

// On small screens, scrolling replaces hover: each photograph develops once
// when most of it is visible, including while swiping the horizontal camera roll.
const mobileView = window.matchMedia('(max-width: 700px)');
const mobileRevealed = new WeakSet();
let photoObserver;
function observeMobilePhotos() {
  photoObserver?.disconnect();
  if (!mobileView.matches || reducedMotion.matches || !('IntersectionObserver' in window)) return;
  photoObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting || entry.intersectionRatio < .65 || mobileRevealed.has(entry.target)) continue;
      mobileRevealed.add(entry.target);
      photoObserver.unobserve(entry.target);
      setPhotoReveal(entry.target, true);
    }
  }, {threshold: .65});
  photos.forEach(photo => {
    if (!mobileRevealed.has(photo)) photoObserver.observe(photo);
  });
}
mobileView.addEventListener('change', observeMobilePhotos);
reducedMotion.addEventListener('change', observeMobilePhotos);
observeMobilePhotos();
