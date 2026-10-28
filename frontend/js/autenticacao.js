document.addEventListener('DOMContentLoaded', () => {
    const btnAdmin = document.getElementById('botaoADMIN');
    const token = localStorage.getItem('wade_token');

    if (!token) {
        btnAdmin.style.display = 'none'; 
    } else {
        btnAdmin.style.display = 'flex';
    }

    btnAdmin.addEventListener('click', (event) => {
        event.preventDefault();

        const currentToken = localStorage.getItem('wade_token');

        if (currentToken) {
            window.location.href = 'dashboard.html';
        } else {
            alert('Acesso restrito. Faça o login primeiro.');
        }
    });
});