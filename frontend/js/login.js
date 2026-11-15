lucide.createIcons();

function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.getElementById('eyeIcon');

    if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    eyeIcon.setAttribute('data-lucide', 'eye-off');
    } else {
    passwordInput.type = 'password';
    eyeIcon.setAttribute('data-lucide', 'eye');
    }
    lucide.createIcons();
}

async function handleSubmit(event) {
    event.preventDefault();

    const nome = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('password').value;
    const submitBtn = document.getElementById('submitBtn');

    submitBtn.classList.add('loading');

    try {
    const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nome, email, senha })
    });

    const data = await response.json();

    if (response.ok && data.success) {
        localStorage.setItem('wade_token', data.token);
        localStorage.setItem('wade_admin', JSON.stringify(data.admin));

        window.location.href = 'dashboard.html';
    } else {
        alert('Credenciais inválidas. Verifique os dados informados.');
    }

    } catch (error) {
    console.error('Erro de conexão:', error);
    alert('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
    } finally {
    submitBtn.classList.remove('loading');
    }
}