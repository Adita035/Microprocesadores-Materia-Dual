const tokenKey = "clubDeportivoJwt";
const userKey = "clubDeportivoUser";
const publicActivitiesGrid = document.querySelector("#publicActivitiesGrid");
const myActivitiesGrid = document.querySelector("#myActivitiesGrid");
const myMembershipSummary = document.querySelector("#myMembershipSummary");
const publicSessionStatus = document.querySelector("#publicSessionStatus");
const publicUserBadge = document.querySelector("#publicUserBadge");
const openAuthBtn = document.querySelector("#openAuthBtn");
const logoutBtn = document.querySelector("#logoutBtn");
const activityDetail = document.querySelector("#activityDetail");
const authModal = document.querySelector("#authModal");
const adminPromptModal = document.querySelector("#adminPromptModal");
const membershipRequiredModal = document.querySelector("#membershipRequiredModal");
const adminPromptActions = document.querySelector("#adminPromptActions");
const adminLoginForm = document.querySelector("#adminLoginForm");
const myActivitiesBtn = document.querySelector("#myActivitiesBtn");
const myActivitiesSection = document.querySelector("#mis-actividades");
const heroBannerTrack = document.querySelector("#heroBannerTrack");
const enrollBtn = document.querySelector("#enrollBtn");
const heroMyActivitiesBtn = document.querySelector("#heroMyActivitiesBtn");
const toast = document.querySelector("#toast");
let selectedActivityId = null;
let pendingEnrollmentId = null;
let heroSlideIndex = 0;
const heroSlideCount = 5;

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

function setSession(token, user = null) {
    if (token) {
        localStorage.setItem(tokenKey, token);
    } else {
        localStorage.removeItem(tokenKey);
    }

    if (user) {
        localStorage.setItem(userKey, JSON.stringify(user));
    } else {
        localStorage.removeItem(userKey);
    }
    renderSession();
}

function renderSession() {
    const user = getUser();
    const hasSession = Boolean(getToken());
    const isAdmin = user?.rol === "ADMINISTRADOR";
    const fullName = user ? `${user.nombre || ""} ${user.apellido || ""}`.trim() : "";

    publicSessionStatus.textContent = hasSession ? "Sesion activa" : "Sin sesion";
    publicSessionStatus.classList.toggle("green", hasSession);
    publicUserBadge.textContent = fullName || "Usuario activo";
    publicUserBadge.classList.toggle("hidden", !hasSession);
    logoutBtn.classList.toggle("hidden", !hasSession);
    openAuthBtn.classList.toggle("hidden", hasSession);
    document.querySelector("#adminAccessBtn").textContent = isAdmin ? "Panel admin" : "Administracion";
    myActivitiesBtn.classList.toggle("hidden", isAdmin);
    heroMyActivitiesBtn.classList.toggle("hidden", isAdmin);
    myActivitiesSection.classList.toggle("hidden", isAdmin);
    enrollBtn.classList.toggle("hidden", isAdmin);
}

function messageText(data, fallback = "Operacion procesada.") {
    if (!data) return fallback;
    if (typeof data === "string") return data;
    if (data.mensaje) return data.mensaje;
    if (data.message) return data.message;
    if (data.error) return data.error;
    return fallback;
}

function showToast(data, fallback = "Operacion procesada.") {
    toast.textContent = messageText(data, fallback);
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

function renderActivities(container, activities, emptyText, options = {}) {
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
                ${options.cancelable ? `<button type="button" class="button compact" data-cancel-activity-id="${activity.id}">Cancelar inscripcion</button>` : ""}
            </div>
        </article>
    `).join("");

    container.querySelectorAll("[data-activity-id]").forEach((button) => {
        button.addEventListener("click", () => openActivityDetail(Number(button.dataset.activityId)));
    });

    container.querySelectorAll("[data-cancel-activity-id]").forEach((button) => {
        button.addEventListener("click", () => cancelEnrollment(Number(button.dataset.cancelActivityId)));
    });
}

function renderMembershipSummary(data) {
    if (!data) {
        myMembershipSummary.classList.add("hidden");
        myMembershipSummary.innerHTML = "";
        return;
    }

    myMembershipSummary.innerHTML = `
        <span class="pill green">${data.estado || "ACTIVA"}</span>
        <div>
            <p class="eyebrow">Mi membresia</p>
            <h2>${data.membresia.nombre}</h2>
            <p>Vigencia: ${data.fechaInicio || "Sin fecha"} a ${data.fechaFin || "Sin fecha"}</p>
        </div>
    `;
    myMembershipSummary.classList.remove("hidden");
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
    const membership = await request("/api/membresias/mi-membresia");
    renderMembershipSummary(membership.ok ? membership.body : null);

    const result = await request("/api/actividades/mis-inscripciones");
    if (result.ok) {
        renderActivities(myActivitiesGrid, result.body || [], "Todavia no tienes actividades inscritas.", { cancelable: true });
        window.location.hash = "#mis-actividades";
    } else {
        showToast(result.body, "No se pudieron cargar tus actividades.");
    }
}

async function openActivityDetail(activityId) {
    selectedActivityId = activityId;
    const result = await request(`/api/actividades/publicas/${activityId}`, { auth: false });
    if (!result.ok) {
        showToast(result.body, "No se pudo cargar la actividad.");
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

function openAdminPromptModal() {
    const user = getUser();
    if (getToken() && user?.rol === "ADMINISTRADOR") {
        window.location.href = "/admin/admin.html";
        return;
    }

    adminPromptActions.classList.remove("hidden");
    adminLoginForm.classList.add("hidden");
    adminPromptModal.classList.remove("hidden");
}

function closeAdminPromptModal() {
    adminPromptModal.classList.add("hidden");
}

function openMembershipRequiredModal() {
    membershipRequiredModal.classList.remove("hidden");
}

function closeMembershipRequiredModal() {
    membershipRequiredModal.classList.add("hidden");
}

function showAdminLoginForm() {
    adminPromptActions.classList.add("hidden");
    adminLoginForm.classList.remove("hidden");
}

function setAuthMode(mode) {
    document.querySelector("#publicLoginForm").classList.toggle("hidden", mode !== "login");
    document.querySelector("#publicRegisterForm").classList.toggle("hidden", mode !== "register");
}

function moveHeroSlide(direction) {
    heroSlideIndex = (heroSlideIndex + direction + heroSlideCount) % heroSlideCount;
    heroBannerTrack.style.transform = `translateX(-${heroSlideIndex * 100}%)`;
}

async function enrollActivity(activityId) {
    if (getUser()?.rol === "ADMINISTRADOR") {
        showToast("Los administradores crean y asignan actividades; no pueden inscribirse.");
        return;
    }

    if (!getToken()) {
        openAuthModal(activityId);
        return;
    }
    const result = await request(`/api/actividades/${activityId}/inscripcion`, { method: "POST" });
    showToast(result.body, "Solicitud procesada.");
    if (!result.ok && messageText(result.body).toLowerCase().includes("membresia")) {
        openMembershipRequiredModal();
        return;
    }
    if (result.ok) {
        closeActivityDetail();
        await loadMyActivities();
    }
}

async function cancelEnrollment(activityId) {
    const result = await request(`/api/actividades/${activityId}/inscripcion`, { method: "DELETE" });
    showToast(result.body, "Solicitud procesada.");
    if (result.ok) {
        await loadMyActivities();
    }
}

openAuthBtn.addEventListener("click", () => openAuthModal());
document.querySelector("#heroRegisterBtn").addEventListener("click", () => openAuthModal(null, "register"));
myActivitiesBtn.addEventListener("click", loadMyActivities);
heroMyActivitiesBtn.addEventListener("click", loadMyActivities);
document.querySelector("#closeDetailBtn").addEventListener("click", closeActivityDetail);
document.querySelector("#closeAuthModalBtn").addEventListener("click", closeAuthModal);
document.querySelector("#showLoginBtn").addEventListener("click", () => setAuthMode("login"));
document.querySelector("#showRegisterBtn").addEventListener("click", () => setAuthMode("register"));
logoutBtn.addEventListener("click", () => {
    setSession("");
    renderMembershipSummary(null);
    myActivitiesGrid.innerHTML = '<article class="emptyState">Inicia sesion para consultar tus actividades inscritas.</article>';
    showToast("Sesion cerrada.");
});
document.querySelector("#adminAccessBtn").addEventListener("click", openAdminPromptModal);
document.querySelector("#closeAdminPromptBtn").addEventListener("click", closeAdminPromptModal);
document.querySelector("#cancelAdminLoginBtn").addEventListener("click", closeAdminPromptModal);
document.querySelector("#showAdminLoginBtn").addEventListener("click", showAdminLoginForm);
document.querySelector("#closeMembershipRequiredBtn").addEventListener("click", closeMembershipRequiredModal);
document.querySelector("#cancelMembershipRequiredBtn").addEventListener("click", closeMembershipRequiredModal);
document.querySelector("#prevHeroSlideBtn").addEventListener("click", () => moveHeroSlide(-1));
document.querySelector("#nextHeroSlideBtn").addEventListener("click", () => moveHeroSlide(1));
enrollBtn.addEventListener("click", () => {
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
        setSession(result.body.token, result.body.usuario);
        closeAuthModal();
        showToast("Sesion iniciada correctamente.");
        if (result.body.usuario?.rol === "ENTRENADOR") {
            window.location.href = "/entrenador/entrenador.html";
            return;
        }
        if (result.body.usuario?.rol === "TRABAJADOR") {
            window.location.href = "/trabajador/trabajador.html";
            return;
        }
        if (result.body.usuario?.rol === "SOPORTE_TECNICO") {
            window.location.href = "/soporte/soporte.html";
            return;
        }
        if (pendingEnrollmentId) {
            const activityId = pendingEnrollmentId;
            pendingEnrollmentId = null;
            await enrollActivity(activityId);
        }
    } else {
        showToast(result.body, "No se pudo iniciar sesion.");
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
        showToast(result.body, "No se pudo crear la cuenta.");
        return;
    }

    const login = await request("/api/auth/login", {
        method: "POST",
        auth: false,
        body: { correo: data.correo, password: data.password },
    });
    if (login.ok && login.body?.token) {
        setSession(login.body.token, login.body.usuario);
        closeAuthModal();
        showToast("Cuenta creada e iniciada correctamente.");
        if (login.body.usuario?.rol === "ENTRENADOR") {
            window.location.href = "/entrenador/entrenador.html";
            return;
        }
        if (login.body.usuario?.rol === "TRABAJADOR") {
            window.location.href = "/trabajador/trabajador.html";
            return;
        }
        if (login.body.usuario?.rol === "SOPORTE_TECNICO") {
            window.location.href = "/soporte/soporte.html";
            return;
        }
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

adminLoginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const result = await request("/api/auth/login", {
        method: "POST",
        auth: false,
        body: formToJson(event.currentTarget),
    });

    if (!result.ok || !result.body?.token) {
        showToast(result.body, "No se pudo iniciar sesion administrativa.");
        return;
    }

    if (result.body.usuario?.rol !== "ADMINISTRADOR") {
        showToast("Tu cuenta no tiene permisos de administrador.");
        return;
    }

    setSession(result.body.token, result.body.usuario);
    window.location.href = "/admin/admin.html";
});

renderSession();
loadPublicActivities();
