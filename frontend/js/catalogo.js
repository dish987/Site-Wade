document.addEventListener("DOMContentLoaded", function() {
    const gridProdutos = document.getElementById("gridProdutos");
    const btnVerMais = document.getElementById("btnVerMais");
    
    const totalProdutos = gridProdutos.querySelectorAll(".product-card").length;

    if (totalProdutos <= 9) {
        btnVerMais.style.display = "none";
    }

    btnVerMais.addEventListener("click", function() {
        gridProdutos.classList.remove("recolhido");
        btnVerMais.style.display = "none";
    });

    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const botoesDownload = document.querySelectorAll(".btn-download-dinamico");

    const linkAndroid = "https://play.google.com/store/apps/details?id=com.wadebrasil.wade_mobile_android&hl=pt_BR";
    const linkIOS = "https://apps.apple.com/br/app/wade/id6751115079";
    botoesDownload.forEach(function(btn) {
        if (/android/i.test(userAgent)) {
            btn.href = linkAndroid;
            btn.innerHTML = "Baixar na Play Store";
        } 
        else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
            btn.href = linkIOS;
            btn.innerHTML = "Baixar na App Store";
        } 
        else{
            btn.href = linkAndroid;
            btn.innerHTML = "Baixar na Play Store";
        }
    });
});