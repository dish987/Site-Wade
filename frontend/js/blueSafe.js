const videoFundo = document.querySelector("#video-fundo");
if (videoFundo) {
  videoFundo.playbackRate = 0.5;
  videoFundo.defaultPlaybackRate = 0.5;
  videoFundo.addEventListener("loadedmetadata", () => {
    videoFundo.playbackRate = 0.5;
  });
}

const abas = document.querySelectorAll(".aba");
const statusCategoria = document.querySelector(".categoria-status");

abas.forEach((aba) => {
  aba.addEventListener("click", () => {
    abas.forEach((item) => {
      item.classList.remove("ativa");
      item.setAttribute("aria-selected", "false");
    });

    aba.classList.add("ativa");
    aba.setAttribute("aria-selected", "true");
    statusCategoria.innerHTML = `Categoria selecionada: <strong>${aba.dataset.tipo}</strong>`;
  });
});

