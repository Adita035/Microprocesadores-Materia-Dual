const tokenKey = "clubDeportivoJwt";
const userKey = "clubDeportivoUser";
const toast = document.querySelector("#toast");
const membershipPlans = document.querySelector("#membershipPlans");
const currentMembership = document.querySelector("#currentMembership");
const membershipSessionStatus = document.querySelector("#membershipSessionStatus");

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
    toast.textContent = typeof message === "string" ? message : JSON.stringify(message, null, 2);
    toast.classList.remove("hidden");
    window.setTimeout(() => toast.classList.add("hidden"), 5000);
}

async function request(path, options = {}) {
    const headers = new Headers(options.headers || {});
    if (options.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }
    if (options.auth !== false) {
        const token = getToken();
        if (!token) {
            return { ok: false, status: 401, body: { mensaje: "Inicia sesion para continuar." } };
        }
        headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(path, {
        ...options,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
    });
    const text = await response.text();
    let body = text;
    try {
        body = text ? JSON.parse(text) : null;
    } catch {
        body = text;
    }
    return { ok: response.ok, status: response.status, body };
}

function money(value) {
    return Number(value || 0).toLocaleString("es-MX", {
        style: "currency",
        currency: "MXN",
    });
}

function tierName(index) {
    if (index === 0) return "Basica";
    if (index === 1) return "Premium";
    return "Elite";
}

function tierClass(index) {
    if (index === 0) return "starter";
    if (index === 1) return "premium";
    return "elite";
}

function benefits(plan) {
    return [
        `Duracion de ${plan.duracionDias || 30} dias`,
        "Consulta de actividades disponibles",
        "Inscripcion a actividades abiertas",
        plan.nombre === "Club Total" ? "Prioridad en inscripciones" : "Beneficios del club",
    ];
}

function renderPlans(plans) {
    if (!plans.length) {
        membershipPlans.innerHTML = `
            <article class="emptyState">
                No hay membresias activas disponibles en MySQL. Reinicia la aplicacion o inserta planes en la tabla membresias.
            </article>
        `;
        return;
    }

    membershipPlans.innerHTML = plans.map((plan, index) => `
        <article class="membershipPlan ${tierClass(index)} ${index === 1 ? "featured" : ""}">
            <div class="membershipPlanTop">
                <span class="membershipTier">${tierName(index)}</span>
                <span class="membershipDuration">${plan.duracionDias || 30} dias</span>
            </div>
            <div>
                <h2>${plan.nombre}</h2>
                <p>${plan.descripcion || "Beneficios disponibles para socios del club."}</p>
            </div>
            <div class="membershipPrice">
                <strong>${money(plan.precio)}</strong>
                <span>por periodo</span>
            </div>
            <div class="membershipBenefits">
                ${benefits(plan).map((item) => `<span>${item}</span>`).join("")}
            </div>
            <button type="button" class="button ${index === 1 ? "success" : "primary"}" data-membership-id="${plan.id}">
                Seleccionar plan
            </button>
        </article>
    `).join("");

    membershipPlans.querySelectorAll("[data-membership-id]").forEach((button) => {
        button.addEventListener("click", () => selectMembership(Number(button.dataset.membershipId)));
    });
}

function renderCurrentMembership(data) {
    if (!data) {
        currentMembership.classList.add("hidden");
        return;
    }

    currentMembership.innerHTML = `
        <span class="pill green">${data.estado || "ACTIVA"}</span>
        <div>
            <p class="eyebrow">Mi membresia actual</p>
            <h2>${data.membresia.nombre}</h2>
            <p>Vigencia: ${data.fechaInicio || "Sin fecha"} a ${data.fechaFin || "Sin fecha"}</p>
        </div>
    `;
    currentMembership.classList.remove("hidden");
}

function renderSessionStatus() {
    const user = getUser();
    if (!getToken() || !user) {
        membershipSessionStatus.textContent = "Inicia sesion para seleccionar";
        membershipSessionStatus.classList.remove("green");
        return;
    }

    membershipSessionStatus.textContent = `${user.nombre || "Usuario"} ${user.apellido || ""}`.trim();
    membershipSessionStatus.classList.add("green");
}

async function loadMemberships() {
    try {
        const result = await request("/api/membresias/publicas", { auth: false });
        if (result.ok) {
            renderPlans(result.body || []);
        } else {
            membershipPlans.innerHTML = `<article class="emptyState">${result.body?.mensaje || "No se pudieron cargar membresias."}</article>`;
        }
    } catch (error) {
        membershipPlans.innerHTML = `<article class="emptyState">${error.message || "No se pudo conectar con la API de membresias."}</article>`;
    }
}

async function loadCurrentMembership() {
    if (!getToken()) {
        renderCurrentMembership(null);
        return;
    }

    try {
        const result = await request("/api/membresias/mi-membresia");
        renderCurrentMembership(result.ok ? result.body : null);
    } catch {
        renderCurrentMembership(null);
    }
}

async function selectMembership(membershipId) {
    const user = getUser();
    if (!getToken() || !user) {
        showToast("Inicia sesion desde la pagina principal para seleccionar una membresia.");
        return;
    }

    if (user.rol === "ADMINISTRADOR") {
        showToast("Los administradores gestionan membresias desde administracion; no necesitan seleccionar una.");
        return;
    }

    const result = await request("/api/membresias/seleccion", {
        method: "POST",
        body: { membresiaId: membershipId },
    });

    if (result.ok) {
        showToast(result.body?.mensaje || "Membresia seleccionada.");
        renderCurrentMembership(result.body.usuarioMembresia);
    } else {
        showToast(result.body || "No se pudo seleccionar la membresia.");
    }
}

loadMemberships();
loadCurrentMembership();
renderSessionStatus();
