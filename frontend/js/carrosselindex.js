(() => {
    'use strict';

    const INTERVALO = 5000; 

    const root = document.querySelector('.carrossel-container');
    if (!root) return;

    const track = root.querySelector('.carrossel-track');
    const prevBtn = root.querySelector('.prev-btn');
    const nextBtn = root.querySelector('.next-btn');
    const dotsBox = root.querySelector('.carrossel-indicador');
    root.style.setProperty('--intervalo', `${INTERVALO}ms`);
    const reduzirMovimento = matchMedia('(prefers-reduced-motion: reduce)');

    let slides = [];
    let dots = [];
    let index = 0;
    let timer = null;
    let pausado = false;

    function ir(novoIndex) {
        index = (novoIndex + slides.length) % slides.length;
        track.style.setProperty('--slide', index);

        slides.forEach((slide, i) => {
            slide.classList.toggle('is-active', i === index);
            slide.setAttribute('aria-hidden', String(i !== index));
        });
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
            if (i === index) dot.setAttribute('aria-current', 'true');
            else dot.removeAttribute('aria-current');
        });
    }

    function parar() {
        clearInterval(timer);
        timer = null;
        root.classList.remove('is-playing');
    }

    function iniciar() {
        parar();
        if (slides.length < 2 || pausado || document.hidden || reduzirMovimento.matches) return;
        root.classList.add('is-playing');
        timer = setInterval(() => mover(index + 1), INTERVALO);
    }

    function mover(novoIndex) {
        root.style.setProperty('--dx', novoIndex > index ? '48px' : '-48px');
        ir(novoIndex);
    }

    function navegar(novoIndex) {
        mover(novoIndex);
        iniciar();
    }

    function criarIndicadores() {
        dotsBox.replaceChildren(...slides.map((_, i) => {
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'indicador';
            dot.setAttribute('aria-label', `Ir para o slide ${i + 1}`);
            dot.addEventListener('click', () => navegar(i));
            return dot;
        }));
        dots = [...dotsBox.children];
    }

    function eventos() {
        prevBtn.addEventListener('click', () => navegar(index - 1));
        nextBtn.addEventListener('click', () => navegar(index + 1));

        root.addEventListener('keydown', e => {
            if (e.key === 'ArrowLeft') { navegar(index - 1); e.preventDefault(); }
            if (e.key === 'ArrowRight') { navegar(index + 1); e.preventDefault(); }
        });

        root.addEventListener('pointerenter', e => {
            if (e.pointerType === 'mouse') { pausado = true; parar(); }
        });
        root.addEventListener('pointerleave', e => {
            if (e.pointerType === 'mouse') { pausado = root.matches(':focus-within'); iniciar(); }
        });
        root.addEventListener('focusin', () => { pausado = true; parar(); });
        root.addEventListener('focusout', e => {
            if (!root.contains(e.relatedTarget)) { pausado = false; iniciar(); }
        });
        document.addEventListener('visibilitychange', iniciar);
        reduzirMovimento.addEventListener('change', iniciar);

        let inicioX = 0;
        let inicioY = 0;
        let arrastando = false;
        let acabouDeArrastar = false;
        root.addEventListener('pointerdown', e => {
            if (e.target.closest('button')) return;
            arrastando = true;
            inicioX = e.clientX;
            inicioY = e.clientY;
        });
        root.addEventListener('pointerup', e => {
            if (!arrastando) return;
            arrastando = false;
            const dx = e.clientX - inicioX;
            const dy = e.clientY - inicioY;
            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
                navegar(index + (dx < 0 ? 1 : -1));
                acabouDeArrastar = true;
                setTimeout(() => { acabouDeArrastar = false; }, 0);
            }
        });
        root.addEventListener('pointercancel', () => { arrastando = false; });

        root.addEventListener('click', e => {
            if (acabouDeArrastar || e.target.closest('button')) return;
            const slide = e.target.closest('.carrossel-slide');
            const alvo = slides.indexOf(slide);
            if (alvo !== -1 && alvo !== index) navegar(alvo);
        });
    }

    function init() {
        slides = [...track.querySelectorAll('.carrossel-slide')];
        if (slides.length === 0) return;

        if (slides.length < 2) {
            slides[0].classList.add('is-active');
            root.classList.add('is-single');
            return;
        }

        criarIndicadores();
        eventos();
        ir(0);
        iniciar();
    }

    init();
})();