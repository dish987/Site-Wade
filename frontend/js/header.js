const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('direitoH');

menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
});