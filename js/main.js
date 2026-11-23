// ===== Menú móvil =====
const toggle = document.querySelector('.nav__toggle');
const menu = document.querySelector('.nav__menu');

function setMenu(open) {
    menu.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
}

toggle.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

// ===== Header al hacer scroll + barra de progreso =====
const header = document.getElementById('header');
const progress = document.getElementById('progress');

function onScroll() {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 20);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ===== Resaltar la sección visible en el menú =====
const links = [...menu.querySelectorAll('a[href^="#"]')];
const sectionObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            links.forEach((a) =>
                a.classList.toggle('is-active', a.getAttribute('href') === `#${entry.target.id}`)
            );
        });
    },
    { rootMargin: '-45% 0px -50% 0px' }
);
document.querySelectorAll('main section[id]').forEach((s) => sectionObserver.observe(s));

// ===== Animación de aparición =====
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
        (entries, obs) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                obs.unobserve(entry.target);
            });
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
} else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
}

// ===== Año actual =====
document.getElementById('year').textContent = new Date().getFullYear();
