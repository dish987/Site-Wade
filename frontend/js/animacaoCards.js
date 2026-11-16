document.addEventListener("DOMContentLoaded", () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('aparecer');
                observer.unobserve(entry.target); 
            }
        });
    }, {
        threshold: 0.15
    });

    const cards = document.querySelectorAll('.card, .cardsRotina');
    
    cards.forEach(card => observer.observe(card));
});