function iniciarCarrossel() {
    const track = document.getElementById('track');
    const slides = document.querySelectorAll('.carrossel-slide'); 
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const indicatorsContainer = document.getElementById('indicador'); 
    const container = document.querySelector('.carrossel-container'); // Pegamos o container aqui em cima

    if (!track || slides.length === 0) return;

    let currentIndex = 0;
    const totalSlides = slides.length;

    function generateIndicators() {
        if (!indicatorsContainer) return;

        indicatorsContainer.innerHTML = '';

        slides.forEach((_, index) => {
            const indicator = document.createElement('span');
            indicator.classList.add('indicador');
            if (index === 0) indicator.classList.add('active'); 
            indicator.setAttribute('data-index', index);

            indicator.addEventListener('click', () => {
                currentIndex = index;
                updateCarousel();
            });

            indicatorsContainer.appendChild(indicator);
        });
    }

    generateIndicators();

    function updateCarousel() {
        track.style.transform = `translateX(-${currentIndex * 100}%)`;

        const indicators = indicatorsContainer ? indicatorsContainer.querySelectorAll('.indicador') : [];
        indicators.forEach((indicator, index) => {
            if (index === currentIndex) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    }

    if (nextBtn) {
        nextBtn.onclick = () => {
            currentIndex = (currentIndex + 1) % totalSlides;
            updateCarousel();
        };
    }

    if (prevBtn) {
        prevBtn.onclick = () => {
            currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
            updateCarousel();
        };
    }

    // NOVA LÓGICA: Clique nas laterais do carrossel
    if (container) {
        container.addEventListener('click', (e) => {
            // Se clicou em um botão (seta) ou bolinha, não faz nada (deixa a função deles rodar)
            if (e.target.closest('button') || e.target.classList.contains('indicador') || e.target.closest('.carrossel-btn')) {
                return;
            }

            const rect = container.getBoundingClientRect();
            
            const clickX = e.clientX - rect.left;
            
            const containerWidth = rect.width;

            if (clickX < containerWidth / 2) {
                currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
            } else {
                currentIndex = (currentIndex + 1) % totalSlides;
            }
            updateCarousel();
        });
    }

    let autoPlay = setInterval(() => {
        currentIndex = (currentIndex + 1) % totalSlides;
        updateCarousel();
    }, 5000);

    if (container) {
        container.addEventListener('mouseenter', () => clearInterval(autoPlay)); 
        container.addEventListener('mouseleave', () => {
            autoPlay = setInterval(() => {
                currentIndex = (currentIndex + 1) % totalSlides;
                updateCarousel();
            }, 5000);
        });
    }
}

getProdutosBeFarm();