const roll = document.querySelector('#camera-roll');
if (roll) {
  const form = roll.querySelector('form');
  const input = form.querySelector('input');
  const submit = form.querySelector('button');
  const error = roll.querySelector('#camera-error');
  const status = roll.querySelector('#camera-status');
  const track = roll.querySelector('#camera-track');
  const veil = roll.querySelector('.camera-veil');
  const close = roll.querySelector('.camera-close');
  const controls = roll.querySelector('.scroll-controls');
  const hint = roll.querySelector('#camera-hint');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let pending = false;

  async function openRoll(celebrate = false) {
    const images = [...track.querySelectorAll('img[data-src]')];
    for (const image of images) image.src = image.dataset.src;
    // Decode the first pair before lifting the veil; the rest retain lazy loading.
    images.slice(0, 2).forEach(image => { image.loading = 'eager'; });
    await Promise.race([
      Promise.allSettled(images.slice(0, 2).map(image => image.decode())),
      new Promise(resolve => setTimeout(resolve, 3000))
    ]);
    roll.dataset.cameraState = 'open';
    track.inert = false;
    track.removeAttribute('aria-hidden');
    controls.inert = false;
    veil.inert = true;
    veil.setAttribute('aria-hidden', 'true');
    close.hidden = false;
    hint.textContent = 'you’re among friends ↘';
    status.textContent = celebrate ? 'Camera roll unlocked. Make yourself at home. Eleven photographs to explore.' : 'Camera roll open. Eleven photographs to explore.';
    roll.dispatchEvent(new Event('camera:unlocked'));
    if (celebrate) {
      track.focus({ preventScroll: true });
      if (!reduced.matches) {
        [...track.querySelectorAll('.photo-reveal')].slice(0, 4).forEach((photo, index) => {
          photo.animate([
            { opacity: 0, transform: 'translateY(8px)' },
            { opacity: 1, transform: 'translateY(0)' }
          ], { duration: 260, delay: index * 45, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
        });
      }
    }
  }

  function lockRoll() {
    roll.dataset.cameraState = 'locked';
    track.inert = true;
    track.setAttribute('aria-hidden', 'true');
    controls.inert = true;
    controls.querySelectorAll('button').forEach(button => { button.disabled = true; });
    veil.inert = false;
    veil.removeAttribute('aria-hidden');
    close.hidden = true;
    hint.innerHTML = 'a closer look <span aria-hidden="true">↘</span>';
    track.querySelectorAll('img').forEach(image => image.removeAttribute('src'));
    input.value = '';
    input.focus({ preventScroll: true });
    status.textContent = 'Camera roll closed.';
  }

  input.addEventListener('input', () => {
    input.removeAttribute('aria-invalid');
    error.textContent = '';
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (pending) return;
    error.textContent = '';
    if (!input.value.trim()) {
      error.textContent = 'Enter my number, including the area code.';
      input.setAttribute('aria-invalid', 'true');
      input.focus();
      return;
    }
    pending = true;
    submit.disabled = true;
    form.setAttribute('aria-busy', 'true');
    submit.setAttribute('aria-label', 'Opening camera roll');
    status.textContent = 'Opening the camera roll.';
    try {
      const response = await fetch('/api/camera-roll', {
        method: 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: input.value })
      });
      const result = await response.json();
      if (!response.ok || !result.authenticated) {
        error.textContent = result.error || 'Couldn’t open the roll. Please try again.';
        if (response.status === 401) input.setAttribute('aria-invalid', 'true');
        status.textContent = '';
        input.focus({ preventScroll: true });
      } else {
        input.value = '';
        await openRoll(true);
      }
    } catch {
      error.textContent = 'Couldn’t connect. Give it another try in a moment.';
      status.textContent = '';
    } finally {
      pending = false;
      submit.disabled = false;
      form.removeAttribute('aria-busy');
      submit.setAttribute('aria-label', 'Open camera roll');
    }
  });
  close.addEventListener('click', async () => {
    close.disabled = true;
    try {
      const response = await fetch('/api/camera-roll', { method: 'DELETE', credentials: 'same-origin' });
      if (response.ok) lockRoll();
      else status.textContent = 'Couldn’t close the roll. Please try again.';
    } catch { status.textContent = 'Couldn’t connect. Please try again.'; }
    finally { close.disabled = false; }
  });
  // HttpOnly cookie remembers the visit; the phone number is never stored here.
  fetch('/api/camera-roll', { credentials: 'same-origin', cache: 'no-store' })
    .then(response => response.ok ? response.json() : null)
    .then(result => { if (result?.authenticated && !pending) return openRoll(); })
    .catch(() => {});
}
