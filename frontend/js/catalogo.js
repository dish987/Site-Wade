const API_URL = 'http://localhost:3000';
let todosProdutos = [];

function obterDadosDownload() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const linkAndroid = "https://play.google.com/store/apps/details?id=com.wadebrasil.wade_mobile_android&hl=pt_BR";
    const linkIOS = "https://apps.apple.com/br/app/wade/id6751115079";

    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        return {
            href: linkIOS,
            texto: "Baixar na App Store"
        };
    }
    
    return {
        href: linkAndroid,
        texto: "Baixar na Play Store"
    };
}

function getClasseTag(nomeEmpresa) {
    if (!nomeEmpresa) return 'tag-default';
    const nomeFormatado = nomeEmpresa.toLowerCase();
    if (nomeFormatado.includes('wade')) return 'tag-wade';
    if (nomeFormatado.includes('befarm')) return 'tag-befarm';
    if (nomeFormatado.includes('bluesafe')) return 'tag-bluesafe';
    return 'tag-default';
}

function renderizarProdutos(lista) {
    const grid = document.getElementById('gridProdutos');
    const btnVerMais = document.getElementById('btnVerMais');
    if (!grid) return;

    if (!Array.isArray(lista) || lista.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; width: 100%; color: #595959; font-size: 1.1rem;">Nenhum produto disponível nesta categoria.</p>';
        if (btnVerMais) btnVerMais.style.display = 'none';
        return;
    }

    const infoDownload = obterDadosDownload();
    let htmlFinal = '';

    lista.forEach(produto => {
        const tagClass = getClasseTag(produto.nome_empresa);
        
        htmlFinal += `
            <div class="product-card">
                <img src="${produto.link_visualizacao}" alt="${produto.titulo}" class="card-image">
                <div class="card-body">
                    <span class="card-tag ${tagClass}">${produto.nome_empresa || 'Geral'}</span>
                    <h2 class="card-title">${produto.titulo}</h2>
                    <p class="card-description">${produto.descricao}</p>
                    <a href="${infoDownload.href}" class="card-btn btn-download-dinamico" target="_blank">${infoDownload.texto}</a>
                </div>
            </div>
        `;
    });

    grid.innerHTML = htmlFinal;

    if (btnVerMais) {
        if (lista.length <= 9) {
            btnVerMais.style.display = 'none';
        } else if (grid.classList.contains('recolhido')) {
            btnVerMais.style.display = 'block';
        }
    }
}

async function carregarCatalogo() {
    const grid = document.getElementById('gridProdutos');
    try {
        const response = await fetch(`${API_URL}/produtos`);
        if (!response.ok) throw new Error(`Status: ${response.status}`);

        todosProdutos = await response.json();
        aplicarFiltroAtual();

    } catch (error) {
        console.error('Erro ao carregar catálogo:', error);
        if (grid) grid.innerHTML = '<p style="color: red;">Erro ao carregar os produtos.</p>';
    }
}

function aplicarFiltroAtual() {
    const botaoAtivo = document.querySelector('.tagsButton button.ativo');
    const empresaSelecionada = botaoAtivo ? botaoAtivo.getAttribute('data-empresa') : 'todos';

    if (empresaSelecionada === 'todos') {
        renderizarProdutos(todosProdutos);
    } else {
        const produtosFiltrados = todosProdutos.filter(produto => {
            const nomeEmpresa = (produto.nome_empresa || '').toLowerCase();
            return nomeEmpresa.includes(empresaSelecionada);
        });
        renderizarProdutos(produtosFiltrados);
    }
}

function inicializarEventos() {
    const botoesTag = document.querySelectorAll('.tagsButton button');
    botoesTag.forEach(botao => {
        botao.addEventListener('click', () => {
            botoesTag.forEach(b => b.classList.remove('ativo'));
            botao.classList.add('ativo');
            aplicarFiltroAtual();
        });
    });

    const btnVerMais = document.getElementById('btnVerMais');
    const gridProdutos = document.getElementById('gridProdutos');
    if (btnVerMais && gridProdutos) {
        btnVerMais.addEventListener('click', function() {
            gridProdutos.classList.remove('recolhido');
            btnVerMais.style.display = 'none';
        });
    }
}

const searchInput = document.querySelector('.search-input');
const searchButton = document.getElementById('search-button');

function filtrarCards() {
    const termo = searchInput.value.toLowerCase().trim();
    const cards = document.querySelectorAll('.product-card');

    cards.forEach(card => {
        const titulo = card.querySelector('.card-title')?.textContent.toLowerCase() || '';
        const descricao = card.querySelector('.card-description')?.textContent.toLowerCase() || '';
        const tag = card.querySelector('.card-tag')?.textContent.toLowerCase() || '';

        const match = titulo.includes(termo) || descricao.includes(termo) || tag.includes(termo);

        if (match) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
}

searchInput.addEventListener('input', filtrarCards);
searchButton.addEventListener('click', filtrarCards);

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        filtrarCards();
    }
});


inicializarEventos();
carregarCatalogo();