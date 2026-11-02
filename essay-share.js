(() => {
  const button = document.querySelector('.essay-share');
  if (!button) return;
  const label = button.querySelector('span');
  const status = document.querySelector('.essay-share-status');
  const url = document.querySelector('link[rel="canonical"]').href;
  const title = document.querySelector('.article-title').textContent.trim();
  let resetTimer;
  button.hidden = false;

  async function copyLink() {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(url);
        return;
      } catch { /* Try the selection-based fallback when clipboard access is blocked. */ }
    }
    const field = document.createElement('textarea');
    field.value = url;
    field.setAttribute('readonly', '');
    field.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
    document.body.append(field);
    field.select();
    try {
      if (!document.execCommand('copy')) throw new Error('Copy failed');
    } finally {
      field.remove();
      button.focus({ preventScroll: true });
    }
  }

  button.addEventListener('click', async () => {
    clearTimeout(resetTimer);
    status.textContent = '';
    button.disabled = true;
    try {
      if (navigator.share) {
        try {
          await navigator.share({ title, url });
          return;
        } catch (error) {
          if (error.name === 'AbortError') return;
        }
      }
      await copyLink();
      label.textContent = 'Link copied';
      status.textContent = 'Essay link copied to clipboard.';
    } catch {
      label.textContent = 'Try again';
      status.textContent = 'Could not copy the link. You can copy it from the address bar.';
    } finally {
      button.disabled = false;
      resetTimer = setTimeout(() => { label.textContent = 'Share'; }, 2500);
    }
  });
})();
