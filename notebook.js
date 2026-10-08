// Native links and disclosures work without JavaScript; only the camera roll needs enhancement.
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
for (const button of document.querySelectorAll('.photo-reveal')) {
  button.addEventListener('click', () => {
    const reveal = button.getAttribute('aria-pressed') !== 'true';
    button.setAttribute('aria-pressed', String(reveal));
    button.setAttribute('aria-label', `${reveal ? 'Show sketch' : 'Reveal photograph'}: ${button.dataset.caption}`);
  });
}
