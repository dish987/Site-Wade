document.addEventListener('DOMContentLoaded', () => {
    const track = document.getElementById('track');
    const slides = document.querySelectorAll('.carousel-slide');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const indicatorsContainer = document.getElementById('indicators');

    // Validação de segurança caso não haja slides no HTML
    if (!track || slides.length === 0) return;

    let currentIndex = 0;
    const totalSlides = slides.length;

    // 1. GERAÇÃO AUTOMÁTICA DAS BOLINHAS (INDICADORES)
    function generateIndicators() {
        if (!indicatorsContainer) return;

        // Limpa o contêiner de indicadores antes de criar
        indicatorsContainer.innerHTML = '';

        // Cria uma bolinha para cada slide encontrado
        slides.forEach((_, index) => {
            const indicator = document.createElement('span');
            indicator.classList.add('indicator');
            if (index === 0) indicator.classList.add('active'); // Primeira bolinha começa ativa
            indicator.setAttribute('data-index', index);

            // Adiciona evento de clique em cada bolinha gerada
            indicator.addEventListener('click', () => {
                currentIndex = index;
                updateCarousel();
            });

            indicatorsContainer.appendChild(indicator);
        });
    }

    // Executa a criação das bolinhas
    generateIndicators();

    // 2. ATUALIZAÇÃO DO CARROSSEL
    function updateCarousel() {
        // Desloca o trilho
        track.style.transform = `translateX(-${currentIndex * 100}%)`;

        // Atualiza a bolinha ativa
        const indicators = indicatorsContainer ? indicatorsContainer.querySelectorAll('.indicator') : [];
        indicators.forEach((indicator, index) => {
            if (index === currentIndex) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    }

    // Botão Próximo
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % totalSlides;
            updateCarousel();
        });
    }

    // Botão Anterior
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
            updateCarousel();
        });
    }

    // Troca automática a cada 5 segundos (Opcional)
    let autoPlay = setInterval(() => {
        currentIndex = (currentIndex + 1) % totalSlides;
        updateCarousel();
    }, 5000);

    // Pausa a troca automática ao passar o mouse por cima
    const container = document.querySelector('.carousel-container');
    if (container) {
        container.addEventListener('mouseenter', () => clearInterval(autoPlay));
        container.addEventListener('mouseleave', () => {
            autoPlay = setInterval(() => {
                currentIndex = (currentIndex + 1) % totalSlides;
                updateCarousel();
            }, 5000);
        });
    }
});