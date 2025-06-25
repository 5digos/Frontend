export function initScrollToTop({
  btnSelector = '#scrollToTopBtn',
  showAfter = 300,
  scrollDuration = 600
} = {}) {
  const btn = document.querySelector(btnSelector);
  if (!btn) return;
  const container = document.getElementById('main') || window;
  
  container.addEventListener('scroll', () => {
    const scrollTop = container === window ? window.pageYOffset : container.scrollTop;
    btn.classList[scrollTop > showAfter ? 'add' : 'remove']('show');
  });
  
  btn.addEventListener('click', () => {
    const startY = container === window ? window.pageYOffset : container.scrollTop;
    let startTime = null;
    const easeInQuad = t => t * t;

    function animate(time) {
      if (!startTime) startTime = time;
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / scrollDuration, 1);
      const y = startY - startY * easeInQuad(progress);
      if (container === window) window.scrollTo(0, y);
      else container.scrollTo(0, y);
      if (elapsed < scrollDuration) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  });
}