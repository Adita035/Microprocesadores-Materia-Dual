const tokenKey = "clubDeportivoJwt";
const userKey = "clubDeportivoUser";
const output = document.querySelector("#output");
const tokenView = document.querySelector("#tokenView");
const sessionStatus = document.querySelector("#sessionStatus");
const sessionCard = document.querySelector(".sessionCard");
const publicActivitiesGrid = document.querySelector("#publicActivitiesGrid");
const activityDetail = document.querySelector("#activityDetail");
const loginModal = document.querySelector("#loginModal");
const adminHeroBannerTrack = document.querySelector("#adminHeroBannerTrack");
let selectedActivityId = null;
let pendingEnrollmentId = null;
let adminHeroSlideIndex = 0;

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

function hasAdminAccess() {
    return Boolean(getToken()) && getUser()?.rol === "ADMINISTRADOR";
}

if (!hasAdminAccess()) {
    window.location.replace("/");
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
    renderToken();
}

function setToken(token) {
    setSession(token, getUser());
}

function renderToken() {
    const token = getToken();
    const user = getUser();
    tokenView.value = token;
    sessionStatus.textContent = token ? (user ? `${user.nombre} ${user.apellido}` : "Token activo") : "Sin sesion";
    sessionCard.classList.toggle("active", Boolean(token));
}

function moveAdminHeroSlide(direction) {
    adminHeroSlideIndex = (adminHeroSlideIndex + direction + 3) % 3;
    adminHeroBannerTrack.style.transform = `translateX(-${adminHeroSlideIndex * 100}%)`;
}

function formToJson(form) {
    const data = new FormData(form);
    return Object.fromEntries(
        Array.from(data.entries())
            .filter(([, value]) => String(value).trim() !== "")
            .map(([key, value]) => {
                const normalizedValue = String(value).trim();
                if (["usuarioId", "actividadId", "entrenadorId"].includes(key)) {
                    return [key, Number(normalizedValue)];
                }
                return [key, normalizedValue];
            }),
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
                statusText: "JWT requerido",
                contentType: "application/json",
                body: {
                    mensaje: "Primero inicia sesion para obtener un token JWT.",
                },
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

    return {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get("content-type"),
        body,
    };
}

function printResult(title, result) {
    output.innerHTML = renderResult(title, result);
}

function printError(title, error) {
    output.innerHTML = renderMessageCard(title, error.message || String(error), false);
}

function renderResult(title, result) {
    if (!result.ok) {
        return renderMessageCard(title, result.body?.mensaje || result.statusText || "No se pudo completar la operacion.", false);
    }

    if (Array.isArray(result.body)) {
        return renderListResult(title, result.body);
    }

    return renderMessageCard(title, successMessage(title, result.body), true, result.body);
}

function renderListResult(title, items) {
    if (!items.length) {
        return renderMessageCard(title, "No hay registros para mostrar.", true);
    }

    if (title.includes("usuarios") || title.includes("administradores")) {
        return renderUsers(title, items);
    }
    if (title.includes("entrenadores")) {
        return renderTrainers(title, items);
    }
    if (title.includes("actividades")) {
        return renderActivitiesResult(title, items);
    }

    return `
        ${renderSummaryHeader(title, `${items.length} registros encontrados`, true)}
        <div class="resultGrid">
            ${items.map((item) => renderGenericCard(item)).join("")}
        </div>
    `;
}

function renderUsers(title, users) {
    return `
        ${renderSummaryHeader(title, `${users.length} usuarios encontrados`, true)}
        <div class="resultGrid">
            ${users.map((user) => `
                <article class="resultCard">
                    <div class="resultCardHeader">
                        <div>
                            <p class="eyebrow">${user.rol || "USUARIO"}</p>
                            <h3>${user.nombre} ${user.apellido}</h3>
                        </div>
                        <span class="pill ${user.tieneMembresia ? "green" : "coral"}">
                            ${user.tieneMembresia ? "Con membresia" : "Sin membresia"}
                        </span>
                    </div>
                    <p>${user.correo}</p>
                    <div class="resultMeta">
                        <span>Telefono: ${user.telefono || "Sin telefono"}</span>
                        <span>Plan: ${user.membresia || "No asignado"}</span>
                        <span>Renovacion: ${formatRenewal(user)}</span>
                    </div>
                </article>
            `).join("")}
        </div>
    `;
}

function renderTrainers(title, trainers) {
    return `
        ${renderSummaryHeader(title, `${trainers.length} entrenadores encontrados`, true)}
        <div class="resultGrid">
            ${trainers.map((trainer) => `
                <article class="resultCard">
                    <div class="resultCardHeader">
                        <div>
                            <p class="eyebrow">${trainer.especialidad || "Especialidad"}</p>
                            <h3>${trainer.usuario?.nombre || "Entrenador"} ${trainer.usuario?.apellido || ""}</h3>
                        </div>
                        <span class="pill green">Activo</span>
                    </div>
                    <p>${trainer.usuario?.correo || "Sin correo"}</p>
                    <div class="resultMeta">
                        <span>ID entrenador: ${trainer.id}</span>
                        <span>Telefono: ${trainer.usuario?.telefono || "Sin telefono"}</span>
                    </div>
                </article>
            `).join("")}
        </div>
    `;
}

function renderActivitiesResult(title, activities) {
    return `
        ${renderSummaryHeader(title, `${activities.length} actividades encontradas`, true)}
        <div class="resultGrid">
            ${activities.map((activity) => `
                <article class="resultCard">
                    <div class="resultCardHeader">
                        <div>
                            <p class="eyebrow">${activity.estado || "PENDIENTE"}</p>
                            <h3>${activity.nombre}</h3>
                        </div>
                        <span class="pill green">${activity.entrenadores?.length || 0} entrenador(es)</span>
                    </div>
                    <p>${activity.descripcion || "Sin descripcion"}</p>
                    <div class="resultMeta">
                        <span>${formatSchedule(activity)}</span>
                        <span>${trainerNames(activity)}</span>
                    </div>
                </article>
            `).join("")}
        </div>
    `;
}

function renderMessageCard(title, message, ok, body = null) {
    return `
        ${renderSummaryHeader(title, message, ok)}
        ${body ? `<article class="resultCard">${renderGenericDetails(body)}</article>` : ""}
    `;
}

function renderSummaryHeader(title, message, ok) {
    return `
        <article class="resultSummary ${ok ? "success" : "error"}">
            <span class="moduleIcon">${ok ? "OK" : "!"}</span>
            <div>
                <p class="eyebrow">${title}</p>
                <h3>${message}</h3>
            </div>
        </article>
    `;
}

function renderGenericCard(item) {
    return `<article class="resultCard">${renderGenericDetails(item)}</article>`;
}

function renderGenericDetails(item) {
    if (!item || typeof item !== "object") {
        return `<p>${item || "Operacion completada"}</p>`;
    }

    return Object.entries(item)
        .filter(([, value]) => value !== null && value !== undefined && typeof value !== "object")
        .map(([key, value]) => `
            <div class="resultLine">
                <span>${labelFor(key)}</span>
                <strong>${value}</strong>
            </div>
        `).join("") || "<p>Operacion completada correctamente.</p>";
}

function successMessage(title, body) {
    if (body?.mensaje) return body.mensaje;
    if (title.includes("Crear")) return "Registro creado correctamente.";
    if (title.includes("Login")) return "Sesion iniciada correctamente.";
    if (title.includes("Health")) return "La API esta disponible.";
    return "Operacion completada correctamente.";
}

function labelFor(key) {
    return key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (letter) => letter.toUpperCase());
}

function formatRenewal(user) {
    if (!user.tieneMembresia) return "Sin membresia";
    if (user.diasParaRenovar === null || user.diasParaRenovar === undefined) return "Sin fecha";
    if (user.diasParaRenovar === 0) return "Renovar hoy";
    return `${user.diasParaRenovar} dias`;
}

function activityImageUrl() {
    return "url('/assets/club-luxury-hero.png')";
}

function formatSchedule(activity) {
    const date = activity.fecha || "Fecha por confirmar";
    const start = activity.horaInicio || "--:--";
    const end = activity.horaFin || "--:--";
    return `${date} · ${start} - ${end}`;
}

function trainerNames(activity) {
    if (!activity.entrenadores?.length) {
        return "Sin entrenador asignado";
    }
    return activity.entrenadores
        .map((trainer) => `${trainer.usuario.nombre} ${trainer.usuario.apellido}`)
        .join(", ");
}

function renderActivities(activities) {
    if (!activities.length) {
        publicActivitiesGrid.innerHTML = '<article class="emptyState">Aun no hay actividades registradas.</article>';
        return;
    }

    publicActivitiesGrid.innerHTML = activities.map((activity) => `
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
                <button type="button" class="button primary" data-activity-id="${activity.id}">Ver actividad</button>
            </div>
        </article>
    `).join("");

    publicActivitiesGrid.querySelectorAll("[data-activity-id]").forEach((button) => {
        button.addEventListener("click", () => openActivityDetail(Number(button.dataset.activityId)));
    });
}

async function loadPublicActivities() {
    try {
        const result = await request("/api/actividades/publicas", { auth: false });
        if (result.ok) {
            renderActivities(result.body || []);
        } else {
            publicActivitiesGrid.innerHTML = `<article class="emptyState">${result.body?.mensaje || "No se pudieron cargar actividades."}</article>`;
        }
    } catch (error) {
        publicActivitiesGrid.innerHTML = `<article class="emptyState">${error.message || String(error)}</article>`;
    }
}

async function openActivityDetail(activityId) {
    selectedActivityId = activityId;
    const result = await request(`/api/actividades/publicas/${activityId}`, { auth: false });
    if (!result.ok) {
        printResult("Detalle de actividad", result);
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

function openLoginModal(activityId = null) {
    pendingEnrollmentId = activityId;
    loginModal.classList.remove("hidden");
}

function closeLoginModal() {
    loginModal.classList.add("hidden");
}

async function enrollActivity(activityId) {
    if (!getToken()) {
        openLoginModal(activityId);
        return;
    }

    const result = await request(`/api/actividades/${activityId}/inscripcion`, {
        method: "POST",
    });
    printResult("Inscripcion a actividad", result);
    if (result.ok) {
        closeActivityDetail();
    }
}

document.querySelector("#adminForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const title = "Crear administrador";
    try {
        const result = await request("/api/usuarios/admin", {
            method: "POST",
            auth: false,
            body: formToJson(event.currentTarget),
        });
        printResult(title, result);
    } catch (error) {
        printError(title, error);
    }
});

document.querySelector("#loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const title = "Login";
    try {
        const result = await request("/api/auth/login", {
            method: "POST",
            auth: false,
            body: formToJson(event.currentTarget),
        });
        if (result.ok && result.body?.token) {
            if (result.body.usuario?.rol !== "ADMINISTRADOR") {
                printResult(title, {
                    ...result,
                    ok: false,
                    body: { mensaje: "Tu cuenta no tiene permisos de administrador." },
                });
                return;
            }
            setSession(result.body.token, result.body.usuario);
        }
        printResult(title, result);
    } catch (error) {
        printError(title, error);
    }
});

document.querySelector("#modalLoginForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const title = "Login usuario";
    try {
        const result = await request("/api/auth/login", {
            method: "POST",
            auth: false,
            body: formToJson(event.currentTarget),
        });
        if (result.ok && result.body?.token) {
            setSession(result.body.token, result.body.usuario);
            closeLoginModal();
            if (pendingEnrollmentId) {
                await enrollActivity(pendingEnrollmentId);
                pendingEnrollmentId = null;
            }
        }
        printResult(title, result);
    } catch (error) {
        printError(title, error);
    }
});

document.querySelector("#additionalAdminForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const title = "Crear administrador adicional";
    try {
        const result = await request("/api/usuarios/administradores", {
            method: "POST",
            body: formToJson(event.currentTarget),
        });
        printResult(title, result);
    } catch (error) {
        printError(title, error);
    }
});

document.querySelector("#userForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const title = "Crear usuario";
    try {
        const result = await request("/api/usuarios", {
            method: "POST",
            body: formToJson(event.currentTarget),
        });
        printResult(title, result);
    } catch (error) {
        printError(title, error);
    }
});

document.querySelector("#trainerForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const title = "Crear entrenador";
    try {
        const result = await request("/api/entrenadores/registro", {
            method: "POST",
            body: formToJson(event.currentTarget),
        });
        printResult(title, result);
    } catch (error) {
        printError(title, error);
    }
});

document.querySelector("#activityForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const title = "Crear actividad";
    try {
        const result = await request("/api/actividades", {
            method: "POST",
            body: formToJson(event.currentTarget),
        });
        printResult(title, result);
    } catch (error) {
        printError(title, error);
    }
});

document.querySelector("#assignTrainerForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const title = "Asignar entrenador";
    const data = formToJson(event.currentTarget);
    try {
        const result = await request(`/api/actividades/${data.actividadId}/entrenadores`, {
            method: "POST",
            body: { entrenadorId: data.entrenadorId },
        });
        printResult(title, result);
    } catch (error) {
        printError(title, error);
    }
});

document.querySelector("#healthBtn").addEventListener("click", async () => {
    const title = "Health";
    try {
        printResult(title, await request("/actuator/health", { auth: false }));
    } catch (error) {
        printError(title, error);
    }
});

document.querySelector("#usersBtn").addEventListener("click", async () => {
    const title = "Listar usuarios";
    try {
        printResult(title, await request("/api/usuarios"));
    } catch (error) {
        printError(title, error);
    }
});

document.querySelector("#adminsBtn").addEventListener("click", async () => {
    const title = "Listar administradores";
    try {
        printResult(title, await request("/api/usuarios/administradores/listar"));
    } catch (error) {
        printError(title, error);
    }
});

document.querySelector("#trainersBtn").addEventListener("click", async () => {
    const title = "Listar entrenadores";
    try {
        printResult(title, await request("/api/entrenadores"));
    } catch (error) {
        printError(title, error);
    }
});

document.querySelector("#activitiesBtn").addEventListener("click", async () => {
    const title = "Listar actividades";
    try {
        printResult(title, await request("/api/actividades"));
    } catch (error) {
        printError(title, error);
    }
});

document.querySelector("#prevAdminHeroSlideBtn").addEventListener("click", () => moveAdminHeroSlide(-1));
document.querySelector("#nextAdminHeroSlideBtn").addEventListener("click", () => moveAdminHeroSlide(1));

document.querySelector("#enrollBtn").addEventListener("click", () => {
    if (selectedActivityId) {
        enrollActivity(selectedActivityId);
    }
});

document.querySelector("#closeDetailBtn").addEventListener("click", closeActivityDetail);
document.querySelector("#closeLoginModalBtn").addEventListener("click", closeLoginModal);

document.querySelector("#clearTokenBtn").addEventListener("click", () => {
    setSession("");
    output.innerHTML = renderMessageCard("Sesion", "Token eliminado. Vuelve a iniciar sesion para usar el panel.", true);
    window.location.replace("/");
});

tokenView.addEventListener("input", () => {
    setToken(tokenView.value.trim());
});

renderToken();
loadPublicActivities();
