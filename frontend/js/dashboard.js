import { mostrarErro } from "./popUpErro.js";

const API_URL = 'http://localhost:3000';
let produtosGlobais = [];
let empresasGlobais = [];
let paginasGlobais = [];

function alternarSelectCarrosselCadastro(e) {
    const select = document.getElementById('pagina_carrossel_id');
    select.disabled = !e.target.checked;
    select.required = e.target.checked;
    if (!e.target.checked) select.value = ""; 
}

function alternarSelectCarrosselEdicao(e) {
    const select = document.getElementById('edit_pagina_id');
    select.disabled = !e.target.checked;
    select.required = e.target.checked;
    if (!e.target.checked) select.value = ""; 
}

async function carregarDependencias() {
    try {
        const [resEmpresas, resPaginas] = await Promise.all([
            fetch(`${API_URL}/empresas`),
            fetch(`${API_URL}/paginas`)
        ]);

        if (!resEmpresas.ok) {
            const err = await resEmpresas.json().catch(() => ({}));
            mostrarErro(resEmpresas.status, err.message || 'Erro ao carregar empresas.');
            return;
        }

        if (!resPaginas.ok) {
            const err = await resPaginas.json().catch(() => ({}));
            mostrarErro(resPaginas.status, err.message || 'Erro ao carregar páginas.');
            return;
        }

        empresasGlobais = await resEmpresas.json();
        paginasGlobais = await resPaginas.json();

        const preencherSelect = (idSelect, dados, campoValor, campoTexto, textoPadrao) => {
            const select = document.getElementById(idSelect);
            select.innerHTML = `<option value="">${textoPadrao}</option>`;
            dados.forEach(item => {
                select.innerHTML += `<option value="${item[campoValor]}">${item[campoTexto]}</option>`;
            });
        };

        preencherSelect('empresa_id', empresasGlobais, 'id', 'nome', 'Selecione uma Empresa...');
        preencherSelect('edit_empresa_id', empresasGlobais, 'id', 'nome', 'Selecione uma Empresa...');
        preencherSelect('pagina_carrossel_id', paginasGlobais, 'id', 'nome_pagina', 'Selecione a página...');
        preencherSelect('edit_pagina_id', paginasGlobais, 'id', 'nome_pagina', 'Selecione a página...');
    } catch (error) {
        console.error("Erro ao carregar selects:", error);
        mostrarErro(500, 'Falha de conexão ao carregar empresas e páginas.');
    }
}

function getClassPorEmpresa(nome) {
    if (!nome) return 'default';
    const nomF = nome.toLowerCase();
    if (nomF.includes('wade')) return 'wade';
    if (nomF.includes('befarm')) return 'befarm';
    if (nomF.includes('bluesafe')) return 'bluesafe';
    return 'default';
}

function carregarNomeUsuario() {
    const dadosUsuario = localStorage.getItem("wade_admin");
    if (dadosUsuario) {
        const usuario = JSON.parse(dadosUsuario);
        const nomeID = document.getElementById('nome-usuario');
        if (nomeID) {
            nomeID.innerHTML += usuario.nome;
        }
    }
}

async function carregarProdutos() {
    const container = document.getElementById('listaProdutos');
    try {
        const response = await fetch(`${API_URL}/produtos`);
        
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            mostrarErro(response.status, err.message || 'Erro ao carregar produtos.');
            container.innerHTML = '<p class="loading" style="color: red;">Erro ao carregar produtos.</p>';
            return;
        }

        produtosGlobais = await response.json();
        container.innerHTML = '';

        if (produtosGlobais.length === 0) {
            container.innerHTML = '<p class="loading">Nenhum produto cadastrado.</p>';
            return;
        }

        produtosGlobais.forEach(produto => {
            const tagClass = getClassPorEmpresa(produto.nome_empresa);
            let carrosselHtml = produto.exibir_no_carrossel && produto.nome_pagina_carrossel 
                ? `<span class="carousel-badge"> Carrossel: ${produto.nome_pagina_carrossel}</span>` : '';

            container.innerHTML += `
                <div class="product-card">
                    <img src="${produto.link_visualizacao}" alt="${produto.titulo}">
                    <div class="product-info">
                        <span class="tag ${tagClass}">${produto.nome_empresa || 'Sem Tag'}</span>
                        ${carrosselHtml}
                        <h3 class="product-title">${produto.titulo}</h3>
                        <p class="product-desc">${produto.descricao}</p>
                        <div class="card-actions">
                            <button class="btn-action btn-edit" onclick="abrirModalEditar(${produto.id})">Editar</button>
                            <button class="btn-action btn-delete" onclick="excluirProduto(${produto.id})">Excluir</button>
                        </div>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error(error);
        container.innerHTML = '<p class="loading" style="color: red;">Erro ao carregar produtos.</p>';
        mostrarErro(500, 'Servidor indisponível ao buscar produtos.');
    }
}

async function cadastrarNovoProduto(e) {
    e.preventDefault();
    const btnSubmit = document.getElementById('btnSubmit');
    const statusMsg = document.getElementById('statusMsg');
    const formData = new FormData(e.target);
    formData.set('exibir_no_carrossel', document.getElementById('exibir_no_carrossel').checked ? 'true' : 'false');

    const token = localStorage.getItem('wade_token');

    btnSubmit.disabled = true;
    btnSubmit.textContent = 'Enviando...';

    try {
        const response = await fetch(`${API_URL}/produtos`, { 
            method: 'POST', 
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData 
        });
        
        if(!response.ok){
            const errorData = await response.json().catch(() => ({}));
            mostrarErro(response.status, errorData.message || errorData.error || 'Erro ao salvar o produto.');
        }

        statusMsg.textContent = 'Produto salvo!'; 
        statusMsg.style.color = 'green';
        e.target.reset();
        
        const spanNome = document.getElementById('nome-arquivo');
        spanNome.textContent = 'Clique para enviar a imagem';
        spanNome.style.color = '#6B7280';
        spanNome.style.fontWeight = '500';

        document.getElementById('pagina_carrossel_id').disabled = true;
        carregarProdutos();
  
    } catch (error) {
        console.error(error);
        mostrarErro(500, 'Não foi possível conectar ao servidor para enviar o produto.');
    } finally {
        btnSubmit.disabled = false; 
        btnSubmit.textContent = 'Salvar Produto';
        setTimeout(() => statusMsg.textContent = '', 3000);
    }
}

async function salvarEdicaoProduto(e) {
    e.preventDefault();
    const id = document.getElementById('edit_id').value;
    const dadosAtualizados = {
        titulo: document.getElementById('edit_titulo').value,
        descricao: document.getElementById('edit_descricao').value,
        empresa_id: document.getElementById('edit_empresa_id').value,
        exibir_no_carrossel: document.getElementById('edit_exibir_carrossel').checked,
        pagina_carrossel_id: document.getElementById('edit_pagina_id').value || null
    };

    const token = localStorage.getItem('wade_token');

    try {
        const response = await fetch(`${API_URL}/produtos/${id}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(dadosAtualizados)
        });
        
        if(!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            mostrarErro(response.status, errorData.message || errorData.error || 'Acesso negado ou erro ao atualizar o produto.');
        }

        fecharModal();
        carregarProdutos();

    } catch (error) {
        console.error(error);
        mostrarErro(500, 'Erro de conexão ao tentar atualizar o produto.');
    }
}

async function excluirProduto(id) {
    if (!confirm('Tem a certeza que deseja excluir este produto?')) return;
    
    const token = localStorage.getItem('wade_token');

    try {
        const response = await fetch(`${API_URL}/produtos/${id}`, { 
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if(!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            mostrarErro(response.status, errorData.message || errorData.error || 'Acesso negado ou erro ao excluir o produto.');
        }

        carregarProdutos();

    } catch (error) { 
        console.error(error);
        mostrarErro(500, 'Erro de conexão ao tentar excluir o produto.');
    }
}

function atualizarProdutos() {
    carregarProdutos();
}

async function getAdmins() {
    try {
        const response = await fetch(`${API_URL}/api/getAdmin`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('wade_token')}`
            }
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            mostrarErro(response.status, data.message || data.error || 'Erro ao carregar administradores.');
            document.getElementById('listaAdmins').innerHTML = '<p>Erro ao carregar admins.</p>';
            return;
        }

        const container = document.getElementById('listaAdmins');
        container.innerHTML = '';
        
        data.forEach((admin, index) => {
            container.innerHTML += `
                <div class="admin-content">
                    <p class="col-posicao">${index + 1}</p>
                    <input type="text" class="col-texto edit-input" data-id="${admin.id_admin}" data-field="nome" value="${admin.nome}">
                    <input type="email" class="col-texto edit-input" data-id="${admin.id_admin}" data-field="email" value="${admin.email}">
                    
                    <div class="col-acao">
                        <button class="btn-mudar-senha" data-id="${admin.id_admin}" title="Mudar Senha">🔑</button>
                        <button class="btn-excluir-admin" data-id="${admin.id_admin}" title="Excluir Admin">🗑️</button>
                    </div>
                </div>
            `;
        });
    } catch (err) {
        console.error('Erro ao buscar admins: ', err);
        document.getElementById('listaAdmins').innerHTML = '<p>Erro ao carregar admins.</p>';
        mostrarErro(500, 'Servidor indisponível ao buscar administradores.');
    }
}

async function cadastrarNovoAdmin(e) {
    e.preventDefault();

    const nome = document.getElementById('admin_nome').value;
    const email = document.getElementById('admin_email').value;
    const senha = document.getElementById('admin_senha').value;
    const token = localStorage.getItem('wade_token');

    if (!token) {
        mostrarErro(401, 'Você precisa estar logado para cadastrar um administrador.');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/cadastrar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ nome, email, senha })
        });

        const data = await response.json().catch(() => ({}));
        
            
        if(!response.ok) mostrarErro(response.status, data.message || data.error || 'Erro ao cadastrar administrador.');

        alert("Administrador cadastrado com sucesso!");
        document.getElementById('form_cadastrar_admin').reset();
        getAdmins();

    } catch (error) {
        console.error('Error:', error);
        mostrarErro(500, 'Não foi possível conectar ao servidor.');
    }
}

async function editarCampoAdmin(e) {
    if (!e.target.classList.contains('edit-input')) return;

    const id = e.target.getAttribute('data-id');
    const campo = e.target.getAttribute('data-field');
    const novoValor = e.target.value;
    const token = localStorage.getItem('wade_token');

    try {
        const response = await fetch(`${API_URL}/api/atualizarAdmin/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ campo: campo, valor: novoValor })
        });

        const data = await response.json().catch(() => ({}));

        if(!response.ok){
            mostrarErro(response.status, data.message || data.error || 'Erro ao atualizar dados do administrador.');
            getAdmins();
        }

        e.target.style.borderColor = '#10b981';
        setTimeout(() => e.target.style.borderColor = 'transparent', 1500);

    } catch (error) {
        console.error('Erro na requisição de atualização:', error);
        mostrarErro(500, 'Falha ao conectar com o servidor.');
    }
}

async function gerenciarAcoesListaAdmin(e) {
    // Ação: Mudar Senha
    if (e.target.classList.contains('btn-mudar-senha')) {
        const id = e.target.getAttribute('data-id');
        const novaSenha = prompt('Digite a nova senha para este administrador:');
        
        if (novaSenha) {
            const token = localStorage.getItem('wade_token');
            try {
                const response = await fetch(`${API_URL}/api/atualizarSenhaAdmin/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ novaSenha: novaSenha })
                });

                const data = await response.json().catch(() => ({}));

                if (response.ok) {
                    alert('Senha atualizada com sucesso!');
                } else {
                    mostrarErro(response.status, data.message || data.error || 'Erro ao atualizar a senha.');
                }
            } catch (error) {
                console.error('Erro ao mudar senha:', error);
                mostrarErro(500, 'Falha ao conectar com o servidor.');
            }
        }
    }

    // Ação: Excluir Admin
    if (e.target.classList.contains('btn-excluir-admin')) {
        const id = e.target.getAttribute('data-id');
        const confirmacao = confirm('Tem certeza que deseja excluir este administrador? Esta ação não pode ser desfeita.');
        
        if (confirmacao) {
            const token = localStorage.getItem('wade_token');
            try {
                const response = await fetch(`${API_URL}/api/excluirAdmin/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const data = await response.json().catch(() => ({}));

                if (response.ok) {
                    e.target.closest('.admin-content').remove(); 
                    getAdmins();
                } else {
                    mostrarErro(response.status, data.message || data.error || 'Erro ao excluir administrador.');
                }
            } catch (error) {
                console.error('Erro ao excluir admin:', error);
                mostrarErro(500, 'Falha ao conectar com o servidor.');
            }
        }
    }
}

function atualizarAdmins() {
    getAdmins();
}

function abrirModalEditar(id) {
    const produto = produtosGlobais.find(p => p.id === id);
    if (!produto) return;

    document.getElementById('edit_id').value = produto.id;
    document.getElementById('edit_titulo').value = produto.titulo;
    document.getElementById('edit_descricao').value = produto.descricao;
    document.getElementById('edit_empresa_id').value = produto.empresa_id;
    
    const chkCarrossel = document.getElementById('edit_exibir_carrossel');
    const selPagina = document.getElementById('edit_pagina_id');
    
    chkCarrossel.checked = produto.exibir_no_carrossel;
    selPagina.disabled = !produto.exibir_no_carrossel;
    selPagina.value = produto.exibir_no_carrossel ? produto.pagina_carrossel_id : "";

    document.getElementById('modalEditar').style.display = 'flex';
}

function fecharModal() {
    document.getElementById('modalEditar').style.display = 'none';
}

function mostrarNomeArquivo(input) {
    const spanNome = document.getElementById('nome-arquivo');
    
    if (input.files && input.files.length > 0) {
        spanNome.textContent = input.files[0].name;
        spanNome.style.color = '#6366F1';
        spanNome.style.fontWeight = 'bold';
    } else {
        spanNome.textContent = 'Clique para enviar a imagem';
        spanNome.style.color = '#6B7280';
        spanNome.style.fontWeight = '500';
    }
}

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    let overlay = document.querySelector('.menu-overlay');
    
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'menu-overlay';
        document.body.appendChild(overlay);
        overlay.addEventListener('click', toggleSidebar);
    }

    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
}

function mostrarPainel(painel) {
    document.getElementById('panel-add').style.display = painel === 'add' ? 'block' : 'none';
    document.getElementById('panel-list').style.display = painel === 'list' ? 'block' : 'none';
    document.getElementById('painel-admin').style.display = painel === 'admin' ? 'block' : 'none';

    const botoes = document.querySelectorAll('.menu-btn');
    if (botoes[0]) botoes[0].classList.toggle('active', painel === 'add');
    if (botoes[1]) botoes[1].classList.toggle('active', painel === 'list');
    if (botoes[2]) botoes[2].classList.toggle('active', painel === 'admin');

    if (window.innerWidth <= 768) {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.menu-overlay');
        if (sidebar && sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
            if (overlay) overlay.classList.remove('active');
        }
    }
}

// Registro dos listeners
document.getElementById('exibir_no_carrossel').addEventListener('change', alternarSelectCarrosselCadastro);
document.getElementById('edit_exibir_carrossel').addEventListener('change', alternarSelectCarrosselEdicao);
document.getElementById('uploadForm').addEventListener('submit', cadastrarNovoProduto);
document.getElementById('formEditar').addEventListener('submit', salvarEdicaoProduto);
document.getElementById('form_cadastrar_admin').addEventListener('submit', cadastrarNovoAdmin);
document.getElementById('listaAdmins').addEventListener('change', editarCampoAdmin);
document.getElementById('listaAdmins').addEventListener('click', gerenciarAcoesListaAdmin);

// Inicializacao
window.abrirModalEditar = abrirModalEditar;
window.fecharModal = fecharModal;
window.excluirProduto = excluirProduto;
window.atualizarProdutos = atualizarProdutos;
window.atualizarAdmins = atualizarAdmins;
window.mostrarNomeArquivo = mostrarNomeArquivo;
window.toggleSidebar = toggleSidebar;
window.mostrarPainel = mostrarPainel;

// Inicialização da página
carregarDependencias();
carregarProdutos();
carregarNomeUsuario();
getAdmins();