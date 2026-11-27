(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const items = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduce.matches) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }});
    }, {threshold: 0.07, rootMargin: '0px 0px -42px 0px'});
    items.forEach(el => io.observe(el));
  } else items.forEach(el => el.classList.add('is-visible'));
  const toggle = document.querySelector('#menuToggle');
  const nav = document.querySelector('#navMenu');
  const closeMenu = () => { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); toggle.textContent = '☰'; };
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? '✕' : '☰';
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if(e.key==='Escape') closeMenu(); });
  document.addEventListener('click', e => { if(!nav.contains(e.target) && !toggle.contains(e.target)) closeMenu(); });
  const links = [...nav.querySelectorAll('a[href^="#"]')];
  const anchors = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(entries => { entries.forEach(e => {
      if(e.isIntersecting) links.forEach(a => a.classList.toggle('active', a.hash === '#'+e.target.id));
    }); }, {rootMargin:'-30% 0px -58% 0px'});
    anchors.forEach(s => spy.observe(s));
  }
})();