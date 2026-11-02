async function getProdutosBeFarm() {
    try {
        const response = await fetch('http://localhost:3000/getProdutosBeFarm');

        if (!response.ok) {
            console.error('Erro ao buscar produtos:', response.statusText);
            return;
        }

        const divDesejada = document.getElementById('track');
        
        if (!divDesejada) {
            console.error('Elemento track não encontrado.');
            return;
        }

        const produtos = await response.json();
        
        divDesejada.innerHTML = '';

        produtos.forEach(produto => {
            divDesejada.innerHTML += `
                <div class="carrossel-slide"> 
                    <img class="produto-imagem" src="${produto.link_visualizacao}" alt="${produto.titulo}">
                    <div class="produto-info">
                        <h2 class="produto-titulo">${produto.titulo}</h2>
                        <p class="produto-descricao">${produto.descricao}</p>
                    </div>
                </div>
            `;
        });

        iniciarCarrossel();

    } catch(err) {
        console.error('Erro ao buscar produtos:', err);
    }
}

function iniciarCarrossel() {
    const track = document.getElementById('track');
    const slides = document.querySelectorAll('.carrossel-slide'); 
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const indicatorsContainer = document.getElementById('indicador'); 

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

    let autoPlay = setInterval(() => {
        currentIndex = (currentIndex + 1) % totalSlides;
        updateCarousel();
    }, 5000);

    const container = document.querySelector('.carrossel-container');
    if (container) {
        container.onmouseenter = () => clearInterval(autoPlay); 
        container.onmouseleave = () => {
            autoPlay = setInterval(() => {
                currentIndex = (currentIndex + 1) % totalSlides;
                updateCarousel();
            }, 5000);
        };
    }
}

getProdutosBeFarm();