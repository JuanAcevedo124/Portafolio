// Menú móvil
const toggle = document.querySelector('.nav__toggle');
const menu = document.querySelector('.nav__menu');

toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
});

menu.querySelectorAll('a').forEach((link) =>
    link.addEventListener('click', () => {
        menu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
    })
);

// Resaltar la sección visible en el menú
const links = [...menu.querySelectorAll('a[href^="#"]')];
const observer = new IntersectionObserver(
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
document.querySelectorAll('main section[id]').forEach((s) => observer.observe(s));

// Año actual en el pie de página
document.getElementById('year').textContent = new Date().getFullYear();
