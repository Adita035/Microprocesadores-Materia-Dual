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
const trainerScheduleGrid = document.querySelector("#trainerScheduleGrid");
let assignedActivities = [];
let availableMaterials = [];
let currentMaterialRequests = [];

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

function messageText(data, fallback = "Operacion procesada.") {
    if (!data) return fallback;
    if (typeof data === "string") return data;
    if (data.mensaje) return data.mensaje;
    if (data.message) return data.message;
    if (data.error) return data.error;
    return fallback;
}

function showToast(message, fallback = "Operacion procesada.") {
    trainerToast.textContent = messageText(message, fallback);
    trainerToast.classList.remove("hidden");
    window.setTimeout(() => trainerToast.classList.add("hidden"), 4500);
}

function hiddenMaterialRequestsKey() {
    const user = getUser();
    return `clubHiddenMaterialRequests:${user?.correo || "trainer"}`;
}

function getHiddenMaterialRequestIds() {
    const storedIds = localStorage.getItem(hiddenMaterialRequestsKey());
    if (!storedIds) return [];
    try {
        return JSON.parse(storedIds);
    } catch {
        localStorage.removeItem(hiddenMaterialRequestsKey());
        return [];
    }
}

function setHiddenMaterialRequestIds(ids) {
    localStorage.setItem(hiddenMaterialRequestsKey(), JSON.stringify(Array.from(new Set(ids))));
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
    currentMaterialRequests = requests;
    const hiddenIds = getHiddenMaterialRequestIds();
    const visibleRequests = requests.filter((request) => !hiddenIds.includes(request.id));

    if (!visibleRequests.length) {
        materialRequestsPanel.innerHTML = `
            <article class="resultEmpty">
                <span class="moduleIcon">0</span>
                <div>
                    <h3>No tienes solicitudes</h3>
                    <p>Cuando solicites materiales, apareceran aqui. Si limpiaste el historial, solo se oculto en este panel.</p>
                </div>
            </article>
        `;
        return;
    }

    materialRequestsPanel.innerHTML = `
        <div class="resultGrid">
            ${visibleRequests.map((request) => `
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

function clearMaterialRequestsPanel() {
    const hiddenIds = getHiddenMaterialRequestIds();
    const visibleIds = currentMaterialRequests
        .map((request) => request.id)
        .filter((id) => !hiddenIds.includes(id));

    if (!visibleIds.length) {
        showToast("No hay solicitudes visibles para limpiar.");
        return;
    }

    setHiddenMaterialRequestIds([...hiddenIds, ...visibleIds]);
    renderMaterialRequests(currentMaterialRequests);
    showToast("Historial limpiado del panel. Los registros siguen guardados en la base de datos.");
}

function renderSchedule(container, schedules) {
    if (!schedules.length) {
        container.innerHTML = '<article class="emptyState">No tienes horarios registrados.</article>';
        return;
    }

    container.innerHTML = schedules.map((schedule) => `
        <article class="resultCard">
            <div class="resultCardHeader">
                <div>
                    <p class="eyebrow">${schedule.usuario.rol}</p>
                    <h3>${schedule.diaSemana || "Dia por definir"}</h3>
                </div>
                <span class="pill green">Activo</span>
            </div>
            <div class="resultMeta">
                <span>Entrada: ${schedule.horaEntrada || "--:--"}</span>
                <span>Salida: ${schedule.horaSalida || "--:--"}</span>
            </div>
        </article>
    `).join("");
}

async function loadSchedule() {
    const result = await request("/api/horarios/mis-horarios");
    if (result.ok) {
        renderSchedule(trainerScheduleGrid, result.body || []);
        return;
    }
    trainerScheduleGrid.innerHTML = `<article class="emptyState">${result.body?.mensaje || "No se pudo cargar tu horario."}</article>`;
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
        await loadMaterials();
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
document.querySelector("#clearMaterialRequestsBtn").addEventListener("click", clearMaterialRequestsPanel);
document.querySelector("#reloadTrainerScheduleBtn").addEventListener("click", loadSchedule);
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
    loadSchedule();
}
