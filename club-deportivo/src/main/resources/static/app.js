const tokenKey = "clubDeportivoJwt";
const publicActivitiesGrid = document.querySelector("#publicActivitiesGrid");
const myActivitiesGrid = document.querySelector("#myActivitiesGrid");
const publicSessionStatus = document.querySelector("#publicSessionStatus");
const activityDetail = document.querySelector("#activityDetail");
const authModal = document.querySelector("#authModal");
const toast = document.querySelector("#toast");
let selectedActivityId = null;
let pendingEnrollmentId = null;

function getToken() {
    return localStorage.getItem(tokenKey) || "";
}

function setToken(token) {
    if (token) {
        localStorage.setItem(tokenKey, token);
    } else {
        localStorage.removeItem(tokenKey);
    }
    renderSession();
}

function renderSession() {
    publicSessionStatus.textContent = getToken() ? "Sesion activa" : "Sin sesion";
    publicSessionStatus.classList.toggle("green", Boolean(getToken()));
}

function showToast(data) {
    toast.textContent = typeof data === "string" ? data : JSON.stringify(data, null, 2);
    toast.classList.remove("hidden");
    window.setTimeout(() => toast.classList.add("hidden"), 5000);
}

function formToJson(form) {
    const data = new FormData(form);
    return Object.fromEntries(
        Array.from(data.entries())
            .filter(([, value]) => String(value).trim() !== "")
            .map(([key, value]) => [key, String(value).trim()]),
    );
}

async function request(path, options = {}) {
    const headers = new Headers(options.headers || {});
    if (options.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    if (options.auth !== false) {
        const token = getToken();
        if (token) {
            headers.set("Authorization", `Bearer ${token}`);
        } else {
            return {
                ok: false,
                status: 401,
                body: { mensaje: "Inicia sesion para continuar." },
            };
        }
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

function activityImageUrl(activity) {
    const key = `${activity.nombre || ""}`.toLowerCase();
    if (key.includes("yoga")) return "linear-gradient(135deg, #5CBD73, #00608B)";
    if (key.includes("fuerza")) return "linear-gradient(135deg, #F2664A, #101820)";
    if (key.includes("natacion")) return "url('/assets/club-luxury-hero.png')";
    return "url('/assets/club-luxury-hero.png')";
}

function formatSchedule(activity) {
    const date = activity.fecha || "Fecha por confirmar";
    const start = activity.horaInicio || "--:--";
    const end = activity.horaFin || "--:--";
    return `${date} · ${start} - ${end}`;
}

function trainerNames(activity) {
    if (!activity.entrenadores?.length) return "Sin entrenador asignado";
    return activity.entrenadores
        .map((trainer) => `${trainer.usuario.nombre} ${trainer.usuario.apellido}`)
        .join(", ");
}

function renderActivities(container, activities, emptyText) {
    if (!activities.length) {
        container.innerHTML = `<article class="emptyState">${emptyText}</article>`;
        return;
    }

    container.innerHTML = activities.map((activity) => `
        <article class="activityCard">
            <div class="activityThumb" style="--activity-image: ${activityImageUrl(activity)}"></div>
            <div class="activityBody">
                <span class="pill green">${activity.estado || "PENDIENTE"}</span>
                <h3>${activity.nombre}</h3>
                <p class="muted">${activity.descripcion || "Descripcion pendiente."}</p>
                <div class="activityMeta">
                    <span>${formatSchedule(activity)}</span>
                    <span>${trainerNames(activity)}</span>
                </div>
                <button type="button" class="button primary" data-activity-id="${activity.id}">Ver detalle</button>
            </div>
        </article>
    `).join("");

    container.querySelectorAll("[data-activity-id]").forEach((button) => {
        button.addEventListener("click", () => openActivityDetail(Number(button.dataset.activityId)));
    });
}

async function loadPublicActivities() {
    const result = await request("/api/actividades/publicas", { auth: false });
    if (result.ok) {
        renderActivities(publicActivitiesGrid, result.body || [], "Aun no hay actividades disponibles.");
    } else {
        renderActivities(publicActivitiesGrid, [], result.body?.mensaje || "No se pudieron cargar actividades.");
    }
}

async function loadMyActivities() {
    if (!getToken()) {
        openAuthModal();
        return;
    }
    const result = await request("/api/actividades/mis-inscripciones");
    if (result.ok) {
        renderActivities(myActivitiesGrid, result.body || [], "Todavia no tienes actividades inscritas.");
        window.location.hash = "#mis-actividades";
    } else {
        showToast(result.body || "No se pudieron cargar tus actividades.");
    }
}

async function openActivityDetail(activityId) {
    selectedActivityId = activityId;
    const result = await request(`/api/actividades/publicas/${activityId}`, { auth: false });
    if (!result.ok) {
        showToast(result.body || "No se pudo cargar la actividad.");
        return;
    }

    const activity = result.body;
    document.querySelector("#activityTitle").textContent = activity.nombre;
    document.querySelector("#activityState").textContent = activity.estado || "PENDIENTE";
    document.querySelector("#activityDescription").textContent = activity.descripcion || "Descripcion pendiente.";
    document.querySelector("#activitySchedule").textContent = formatSchedule(activity);
    document.querySelector("#activityTrainer").textContent = trainerNames(activity);
    document.querySelector("#activityImage").style.backgroundImage =
        `linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.35)), ${activityImageUrl(activity)}`;
    activityDetail.classList.remove("hidden");
}

function closeActivityDetail() {
    activityDetail.classList.add("hidden");
    selectedActivityId = null;
}

function openAuthModal(activityId = null, mode = "login") {
    pendingEnrollmentId = activityId;
    setAuthMode(mode);
    authModal.classList.remove("hidden");
}

function closeAuthModal() {
    authModal.classList.add("hidden");
}

function setAuthMode(mode) {
    document.querySelector("#publicLoginForm").classList.toggle("hidden", mode !== "login");
    document.querySelector("#publicRegisterForm").classList.toggle("hidden", mode !== "register");
}

async function enrollActivity(activityId) {
    if (!getToken()) {
        openAuthModal(activityId);
        return;
    }
    const result = await request(`/api/actividades/${activityId}/inscripcion`, { method: "POST" });
    showToast(result.body || "Solicitud procesada.");
    if (result.ok) {
        closeActivityDetail();
        await loadMyActivities();
    }
}

document.querySelector("#openAuthBtn").addEventListener("click", () => openAuthModal());
document.querySelector("#heroRegisterBtn").addEventListener("click", () => openAuthModal(null, "register"));
document.querySelector("#myActivitiesBtn").addEventListener("click", loadMyActivities);
document.querySelector("#closeDetailBtn").addEventListener("click", closeActivityDetail);
document.querySelector("#closeAuthModalBtn").addEventListener("click", closeAuthModal);
document.querySelector("#showLoginBtn").addEventListener("click", () => setAuthMode("login"));
document.querySelector("#showRegisterBtn").addEventListener("click", () => setAuthMode("register"));
document.querySelector("#enrollBtn").addEventListener("click", () => {
    if (selectedActivityId) enrollActivity(selectedActivityId);
});

document.querySelector("#publicLoginForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const result = await request("/api/auth/login", {
        method: "POST",
        auth: false,
        body: formToJson(event.currentTarget),
    });
    if (result.ok && result.body?.token) {
        setToken(result.body.token);
        closeAuthModal();
        showToast("Sesion iniciada correctamente.");
        if (pendingEnrollmentId) {
            const activityId = pendingEnrollmentId;
            pendingEnrollmentId = null;
            await enrollActivity(activityId);
        }
    } else {
        showToast(result.body || "No se pudo iniciar sesion.");
    }
});

document.querySelector("#publicRegisterForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = formToJson(event.currentTarget);
    const result = await request("/api/usuarios/registro", {
        method: "POST",
        auth: false,
        body: data,
    });
    if (!result.ok) {
        showToast(result.body || "No se pudo crear la cuenta.");
        return;
    }

    const login = await request("/api/auth/login", {
        method: "POST",
        auth: false,
        body: { correo: data.correo, password: data.password },
    });
    if (login.ok && login.body?.token) {
        setToken(login.body.token);
        closeAuthModal();
        showToast("Cuenta creada e iniciada correctamente.");
        if (pendingEnrollmentId) {
            const activityId = pendingEnrollmentId;
            pendingEnrollmentId = null;
            await enrollActivity(activityId);
        }
    } else {
        showToast("Cuenta creada. Inicia sesion para continuar.");
        setAuthMode("login");
    }
});

renderSession();
loadPublicActivities();
