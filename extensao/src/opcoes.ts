import { chromeExtensao } from "./chrome.ts";
import { BASE_PADRAO } from "./config.ts";

void iniciar();

async function iniciar() {
    const campo = document.querySelector<HTMLInputElement>("#base");
    const aviso = document.querySelector("#aviso");
    const formulario = document.querySelector("form");
    if (!campo || !aviso || !formulario) {
        return;
    }

    const salvo = await chromeExtensao().storage.local.get({ base: BASE_PADRAO });
    campo.value = salvo.base || BASE_PADRAO;

    formulario.addEventListener("submit", (evento) => {
        evento.preventDefault();
        const base = campo.value.trim().replace(/\/$/, "");
        void chromeExtensao()
            .storage.local.set({ base })
            .then(() => {
                aviso.textContent = "Endereço salvo.";
            });
    });
}
