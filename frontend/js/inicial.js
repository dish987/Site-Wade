(() => {
    const SPEED = 280;
    const GAP = 250;    
    const STAGGER = 200;
    const INTRO = 400;
    const ORDER = ['black', 'purple', 'teal'];

    const art = document.querySelector('.hero-art');
    if (!art) return;

    const lines = ORDER.map(cor =>
        [...art.querySelectorAll(`.wave[data-cor="${cor}"]`)]
            .sort((a, b) => a.dataset.parte - b.dataset.parte)
    );
    const all = lines.flat();
    const showAll = () => all.forEach(p => { p.style.opacity = 1; });

    function fluxo() {
        const DASH = 46;
        const VEL = 190;   
        const PAUSA = 900;
        lines.forEach((parts, i) => {
            const durs = parts.map(p => ((p.getTotalLength() + DASH) / VEL) * 1000);
            const ciclo = durs[0] + GAP + durs[1] + PAUSA;
            parts.forEach((p, j) => {
                const len = p.getTotalLength();
                const brilho = p.cloneNode();
                brilho.removeAttribute('data-cor');
                brilho.classList.remove('wave');
                brilho.classList.add('wave-flow');
                brilho.style.strokeDasharray = `${DASH} ${len + DASH}`;
                p.after(brilho);

                const ini = j === 0 ? 0 : (durs[0] + GAP) / ciclo;
                const fim = ini + durs[j] / ciclo;
                const keyframes = j === 0
                    ? [
                        { strokeDashoffset: DASH, offset: 0, easing: 'ease-in-out' },
                        { strokeDashoffset: -len, offset: fim },
                        { strokeDashoffset: -len, offset: 1 },
                    ]
                    : [
                        { strokeDashoffset: DASH, offset: 0 },
                        { strokeDashoffset: DASH, offset: ini, easing: 'ease-in-out' },
                        { strokeDashoffset: -len, offset: fim },
                        { strokeDashoffset: -len, offset: 1 },
                    ];
                brilho.animate(keyframes, { duration: ciclo, iterations: Infinity, delay: i * 350 });
            });
        });
    }

    function play() {
        art.classList.add('is-visible');
        try {
            all.forEach(p => {
                const len = p.getTotalLength();
                p.style.strokeDasharray = len;
                p.style.strokeDashoffset = len;
                p.style.opacity = 1;
            });
        } catch {
            return showAll();
        }

        const desenhos = [];
        lines.forEach((parts, i) => {
            let start = INTRO + i * STAGGER;
            parts.forEach((p, j) => {
                const len = p.getTotalLength();
                const dur = (len / SPEED) * 1000;
                desenhos.push(p.animate(
                    [{ strokeDashoffset: len }, { strokeDashoffset: 0 }],
                    { duration: dur, delay: start, fill: 'forwards', easing: j === 0 ? 'ease-in' : 'ease-out' }
                ));
                start += dur + GAP;
            });
        });
        Promise.all(desenhos.map(a => a.finished)).then(fluxo).catch(() => {});
    }

    window.WadeOndas = { play };

    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return showAll();

    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) { play(); io.disconnect(); }
        }, { threshold: 0.4 });
        io.observe(art);
    } else {
        play();
    }
})();

(() => {
    const SO_UM_ABERTO = true;

    const lista = document.querySelector('.FAQ_QUESTIONS');
    if (!lista) return;

    const itens = [...lista.querySelectorAll('.faq-item')];

    function definir(item, aberto) {
        item.classList.toggle('is-open', aberto);
        item.querySelector('.faq-question').setAttribute('aria-expanded', String(aberto));
    }

    lista.addEventListener('click', e => {
        const botao = e.target.closest('.faq-question');
        if (!botao) return;

        const item = botao.closest('.faq-item');
        const abrir = !item.classList.contains('is-open');

        if (SO_UM_ABERTO && abrir) {
            itens.forEach(outro => { if (outro !== item) definir(outro, false); });
        }
        definir(item, abrir);
    });

    itens.forEach(item => definir(item, false));
})();

(() => {
    window.__animReady = true;
    const html = document.documentElement;
    if (!html.classList.contains('anim')) return;

    const GRUPOS = [
        ['.Timeline_buttonbox', 'up'],
        ['.App_Esquerda', 'left'],
        ['.App_Direita', 'right'],
    ];

    const alvos = [];
    GRUPOS.forEach(([seletor, variante]) => {
        document.querySelectorAll(seletor).forEach(el => {
            el.dataset.reveal = variante;
            alvos.push(el);
        });
    });

    document.querySelectorAll('.MM').forEach((el, i) => el.style.setProperty('--i', i));
    const timeline = document.querySelector('.Sub_Timeline');
    if (timeline) alvos.push(timeline);

    const io = new IntersectionObserver(entradas => {
        entradas
            .filter(e => e.isIntersecting)
            .forEach((e, i) => {
                if (e.target.dataset.reveal !== undefined) e.target.style.setProperty('--i', i);
                e.target.classList.add('is-visible');
                io.unobserve(e.target);
            });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

    alvos.forEach(el => io.observe(el));
})();
