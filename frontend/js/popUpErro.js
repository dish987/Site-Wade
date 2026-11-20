export function mostrarErro(status, mensagem) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast-error';

    toast.innerHTML = `
        <div class="toast-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
        </div>
        <div class="toast-content">
            <h4 class="toast-title">Erro <span>${status}</span></h4>
            <p class="toast-message">${mensagem}</p>
        </div>
        <button class="toast-close" aria-label="Fechar">&times;</button>
    `;

    container.appendChild(toast);

    const removerToast = () => {
        toast.classList.add('hide');
        setTimeout(() => {
            toast.remove();
        }, 400); 
    };

    const btnFechar = toast.querySelector('.toast-close');
    btnFechar.addEventListener('click', removerToast);

    setTimeout(() => {
        if (document.body.contains(toast)) {
            removerToast();
        }
    }, 5000);
}