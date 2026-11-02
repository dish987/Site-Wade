document.addEventListener('DOMContentLoaded', async () => {
    const btnAdmin = document.getElementById('botaoADMIN');
    const token = localStorage.getItem('wade_token');

    if (!token) {
        btnAdmin.style.display = 'none';
    } else {
        try {
            const response = await fetch('http://localhost:3000/verificar-token', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                btnAdmin.style.display = 'flex';
            } else {
                localStorage.removeItem('wade_token');
                btnAdmin.style.display = 'none';
            }
        } catch (error) {
            console.error('Erro ao conectar com a API:', error);
            btnAdmin.style.display = 'none';
        }
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