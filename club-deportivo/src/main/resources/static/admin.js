const tokenKey = "clubDeportivoJwt";
const output = document.querySelector("#output");
const tokenView = document.querySelector("#tokenView");
const sessionStatus = document.querySelector("#sessionStatus");
const sessionCard = document.querySelector(".sessionCard");
const publicActivitiesGrid = document.querySelector("#publicActivitiesGrid");
const activityDetail = document.querySelector("#activityDetail");
const loginModal = document.querySelector("#loginModal");
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
    renderToken();
}

function renderToken() {
    const token = getToken();
    tokenView.value = token;
    sessionStatus.textContent = token ? "Token activo" : "Sin sesion";
    sessionCard.classList.toggle("active", Boolean(token));
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
    output.textContent = JSON.stringify({ prueba: title, ...result }, null, 2);
}

function printError(title, error) {
    output.textContent = JSON.stringify({
        prueba: title,
        error: error.message || String(error),
    }, null, 2);
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
            setToken(result.body.token);
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
            setToken(result.body.token);
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

document.querySelector("#myActivitiesBtn").addEventListener("click", async () => {
    const title = "Mis actividades inscritas";
    if (!getToken()) {
        openLoginModal();
        return;
    }

    try {
        const result = await request("/api/actividades/mis-inscripciones");
        if (result.ok) {
            renderActivities(result.body || []);
            window.location.hash = "#catalogo";
        }
        printResult(title, result);
    } catch (error) {
        printError(title, error);
    }
});

document.querySelector("#enrollBtn").addEventListener("click", () => {
    if (selectedActivityId) {
        enrollActivity(selectedActivityId);
    }
});

document.querySelector("#closeDetailBtn").addEventListener("click", closeActivityDetail);
document.querySelector("#closeLoginModalBtn").addEventListener("click", closeLoginModal);

document.querySelector("#clearTokenBtn").addEventListener("click", () => {
    setToken("");
    output.textContent = "Token eliminado. Prueba listar usuarios para confirmar que el endpoint protegido responde 401/403.";
});

tokenView.addEventListener("input", () => {
    setToken(tokenView.value.trim());
});

renderToken();
loadPublicActivities();
