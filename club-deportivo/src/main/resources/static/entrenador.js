const tokenKey = "clubDeportivoJwt";
const userKey = "clubDeportivoUser";
const trainerActivitiesGrid = document.querySelector("#trainerActivitiesGrid");
const studentsPanel = document.querySelector("#studentsPanel");
const trainerUserBadge = document.querySelector("#trainerUserBadge");
const trainerActivityCount = document.querySelector("#trainerActivityCount");
const selectedActivityLabel = document.querySelector("#selectedActivityLabel");
const studentCount = document.querySelector("#studentCount");
const studentsStatus = document.querySelector("#studentsStatus");
const trainerToast = document.querySelector("#trainerToast");
const materialSelect = document.querySelector("#materialSelect");
const materialRequestsPanel = document.querySelector("#materialRequestsPanel");
let assignedActivities = [];
let availableMaterials = [];

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

function requireTrainerSession() {
    const user = getUser();
    if (!getToken() || user?.rol !== "ENTRENADOR") {
        window.location.replace("/");
        return null;
    }
    trainerUserBadge.textContent = `${user.nombre || ""} ${user.apellido || ""}`.trim() || "Entrenador";
    return user;
}

async function request(path, options = {}) {
    const headers = new Headers(options.headers || {});
    headers.set("Authorization", `Bearer ${getToken()}`);
    if (options.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
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

function showToast(message) {
    trainerToast.textContent = message;
    trainerToast.classList.remove("hidden");
    window.setTimeout(() => trainerToast.classList.add("hidden"), 4500);
}

function activityImageUrl(activity) {
    const key = `${activity.nombre || ""}`.toLowerCase();
    if (key.includes("yoga")) return "linear-gradient(135deg, #5CBD73, #00608B)";
    if (key.includes("fuerza")) return "linear-gradient(135deg, #F2664A, #101820)";
    if (key.includes("natacion")) return "url('/assets/club-luxury-hero.png')";
    return "linear-gradient(135deg, #00608B, #5CBD73)";
}

function formatSchedule(activity) {
    const date = activity.fecha || "Fecha por confirmar";
    const start = activity.horaInicio || "--:--";
    const end = activity.horaFin || "--:--";
    return `${date} - ${start} a ${end}`;
}

function renderActivities(activities) {
    assignedActivities = activities;
    trainerActivityCount.textContent = activities.length;

    if (!activities.length) {
        trainerActivitiesGrid.innerHTML = '<article class="emptyState">Todavia no tienes actividades asignadas.</article>';
        return;
    }

    trainerActivitiesGrid.innerHTML = activities.map((activity) => `
        <article class="activityCard">
            <div class="activityThumb" style="--activity-image: ${activityImageUrl(activity)}"></div>
            <div class="activityBody">
                <span class="pill green">${activity.estado || "PENDIENTE"}</span>
                <h3>${activity.nombre}</h3>
                <p class="muted">${activity.descripcion || "Descripcion pendiente."}</p>
                <div class="activityMeta">
                    <span>${formatSchedule(activity)}</span>
                    <span>ID actividad: ${activity.id}</span>
                </div>
                <button type="button" class="button primary" data-students-activity-id="${activity.id}" data-activity-name="${activity.nombre}">
                    Ver alumnos
                </button>
            </div>
        </article>
    `).join("");

    trainerActivitiesGrid.querySelectorAll("[data-students-activity-id]").forEach((button) => {
        button.addEventListener("click", () => loadStudents(Number(button.dataset.studentsActivityId), button.dataset.activityName));
    });
}

function renderMaterialOptions() {
    if (!availableMaterials.length) {
        materialSelect.innerHTML = '<option value="">Sin materiales disponibles</option>';
        return;
    }

    materialSelect.innerHTML = availableMaterials.map((material) => `
        <option value="${material.id}">${material.nombre} (${material.cantidadDisponible} disponibles)</option>
    `).join("");
}

function renderStudents(activityName, students) {
    selectedActivityLabel.textContent = activityName || "-";
    studentCount.textContent = students.length;
    studentsStatus.textContent = activityName || "Actividad";
    studentsStatus.classList.add("green");

    if (!students.length) {
        studentsPanel.innerHTML = `
            <article class="resultEmpty">
                <span class="moduleIcon">0</span>
                <div>
                    <h3>No hay alumnos inscritos</h3>
                    <p>Cuando un usuario se inscriba desde la vista publica, aparecera en esta lista.</p>
                </div>
            </article>
        `;
        return;
    }

    studentsPanel.innerHTML = `
        <article class="resultSummary success">
            <span class="moduleIcon">OK</span>
            <div>
                <p class="eyebrow">${activityName}</p>
                <h3>${students.length} alumno(s) inscrito(s)</h3>
            </div>
        </article>
        <div class="resultGrid">
            ${students.map(({ usuario, fechaInscripcion }) => `
                <article class="resultCard">
                    <div class="resultCardHeader">
                        <div>
                            <p class="eyebrow">${usuario.rol || "USUARIO"}</p>
                            <h3>${usuario.nombre} ${usuario.apellido}</h3>
                        </div>
                        <span class="pill green">Inscrito</span>
                    </div>
                    <p>${usuario.correo}</p>
                    <div class="resultMeta">
                        <span>Telefono: ${usuario.telefono || "Sin telefono"}</span>
                        <span>Fecha: ${formatDateTime(fechaInscripcion)}</span>
                    </div>
                </article>
            `).join("")}
        </div>
    `;
}

function formatDateTime(value) {
    if (!value) return "Sin fecha";
    return String(value).replace("T", " ").slice(0, 16);
}

async function loadTrainerActivities() {
    const result = await request("/api/entrenadores/mis-actividades");
    if (result.ok) {
        renderActivities(result.body || []);
        return;
    }
    trainerActivitiesGrid.innerHTML = `<article class="emptyState">${result.body?.mensaje || "No se pudieron cargar tus actividades."}</article>`;
}

async function loadMaterials() {
    const result = await request("/api/materiales");
    if (result.ok) {
        availableMaterials = result.body || [];
        renderMaterialOptions();
        return;
    }
    materialSelect.innerHTML = '<option value="">No se pudieron cargar materiales</option>';
    showToast(result.body?.mensaje || "No se pudieron cargar los materiales.");
}

function renderMaterialRequests(requests) {
    if (!requests.length) {
        materialRequestsPanel.innerHTML = `
            <article class="resultEmpty">
                <span class="moduleIcon">0</span>
                <div>
                    <h3>No tienes solicitudes</h3>
                    <p>Cuando solicites materiales para una actividad, apareceran aqui.</p>
                </div>
            </article>
        `;
        return;
    }

    materialRequestsPanel.innerHTML = `
        <div class="resultGrid">
            ${requests.map((request) => `
                <article class="resultCard">
                    <div class="resultCardHeader">
                        <div>
                            <p class="eyebrow">${request.estado || "PENDIENTE"}</p>
                            <h3>${request.material.nombre}</h3>
                        </div>
                        <span class="pill green">${request.cantidad} pieza(s)</span>
                    </div>
                    <p>${request.material.descripcion || "Sin descripcion"}</p>
                    <div class="resultMeta">
                        <span>Fecha: ${formatDateTime(request.fechaSolicitud)}</span>
                    </div>
                </article>
            `).join("")}
        </div>
    `;
}

async function loadMaterialRequests() {
    const result = await request("/api/materiales/mis-solicitudes");
    if (result.ok) {
        renderMaterialRequests(result.body || []);
        return;
    }
    materialRequestsPanel.innerHTML = `<article class="emptyState">${result.body?.mensaje || "No se pudieron cargar tus solicitudes."}</article>`;
}

function formToJson(form) {
    const data = new FormData(form);
    return Object.fromEntries(
        Array.from(data.entries())
            .filter(([, value]) => String(value).trim() !== "")
            .map(([key, value]) => [key, Number(value)]),
    );
}

async function submitMaterialRequest(event) {
    event.preventDefault();
    const result = await request("/api/materiales/solicitudes", {
        method: "POST",
        body: formToJson(event.currentTarget),
    });

    if (result.ok) {
        showToast("Solicitud de material enviada correctamente.");
        event.currentTarget.reset();
        renderMaterialOptions();
        await loadMaterialRequests();
        return;
    }
    showToast(result.body?.mensaje || "No se pudo enviar la solicitud.");
}

async function loadStudents(activityId, activityName) {
    const result = await request(`/api/entrenadores/actividades/${activityId}/alumnos`);
    if (result.ok) {
        renderStudents(activityName, result.body || []);
        window.location.hash = "#alumnos";
        return;
    }
    showToast(result.body?.mensaje || "No se pudieron cargar los alumnos.");
}

document.querySelector("#reloadTrainerActivitiesBtn").addEventListener("click", loadTrainerActivities);
document.querySelector("#reloadMaterialRequestsBtn").addEventListener("click", loadMaterialRequests);
document.querySelector("#materialRequestForm").addEventListener("submit", submitMaterialRequest);
document.querySelector("#trainerLogoutBtn").addEventListener("click", () => {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(userKey);
    window.location.replace("/");
});

if (requireTrainerSession()) {
    loadTrainerActivities();
    loadMaterials();
    loadMaterialRequests();
}
