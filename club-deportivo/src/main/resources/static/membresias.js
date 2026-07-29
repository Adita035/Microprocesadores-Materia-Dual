const tokenKey = "clubDeportivoJwt";
const userKey = "clubDeportivoUser";
const toast = document.querySelector("#toast");

function getToken() {
    return localStorage.getItem(tokenKey) || "";
}

function getUser() {
    const storedUser = localStorage.getItem(userKey);
    if (!storedUser) return null;
    try {
        return JSON.parse(storedUser);
    } catch {
        localStorage.removeItem(userKey);
        return null;
    }
}

function showToast(message) {
    toast.textContent = message;
    toast.classList.remove("hidden");
    window.setTimeout(() => toast.classList.add("hidden"), 5000);
}

document.querySelectorAll("[data-membership]").forEach((button) => {
    button.addEventListener("click", () => {
        const membership = button.dataset.membership;
        const user = getUser();

        if (!getToken() || !user) {
            showToast("Inicia sesion desde la pagina principal para seleccionar una membresia.");
            return;
        }

        if (user.rol === "ADMINISTRADOR") {
            showToast("Los administradores gestionan membresias desde administracion; no necesitan seleccionar una.");
            return;
        }

        showToast(`Membresia seleccionada: ${membership}. Falta conectar este paso con MySQL.`);
    });
});
