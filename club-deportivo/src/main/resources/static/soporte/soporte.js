const tokenKey = "clubDeportivoJwt";
const userKey = "clubDeportivoUser";
const supportUserBadge = document.querySelector("#supportUserBadge");
const supportIncidentsPanel = document.querySelector("#supportIncidentsPanel");
const supportToast = document.querySelector("#supportToast");
const incidentCount = document.querySelector("#incidentCount");
const pendingIncidentCount = document.querySelector("#pendingIncidentCount");
const resolvedIncidentCount = document.querySelector("#resolvedIncidentCount");
const supportScheduleGrid = document.querySelector("#supportScheduleGrid");
const incidentHistoryPanel = document.querySelector("#incidentHistoryPanel");
let latestIncidents = [];
let historyVisible = false;

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

function requireSupportSession() {
    const user = getUser();
    if (!getToken() || user?.rol !== "SOPORTE_TECNICO") {
        window.location.replace("/");
        return null;
    }
    supportUserBadge.textContent = `${user.nombre || ""} ${user.apellido || ""}`.trim() || "Soporte tecnico";
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
    supportToast.textContent = messageText(message, fallback);
    supportToast.classList.remove("hidden");
    window.setTimeout(() => supportToast.classList.add("hidden"), 4500);
}

function formToJson(form) {
    const data = new FormData(form);
    return Object.fromEntries(
        Array.from(data.entries())
            .filter(([, value]) => String(value).trim() !== "")
            .map(([key, value]) => [key, key === "incidenciaId" ? Number(value) : String(value).trim()]),
    );
}

function formatDateTime(value) {
    if (!value) return "Sin fecha";
    return String(value).replace("T", " ").slice(0, 16);
}

function renderIncidents(incidents) {
    const activeIncidents = incidents.filter((item) => item.estado !== "RESUELTA");
    incidentCount.textContent = incidents.length;
    pendingIncidentCount.textContent = incidents.filter((item) => item.estado === "PENDIENTE" || item.estado === "EN_PROCESO").length;
    resolvedIncidentCount.textContent = incidents.filter((item) => item.estado === "RESUELTA").length;

    if (!activeIncidents.length) {
        supportIncidentsPanel.innerHTML = `
            <article class="resultEmpty">
                <span class="moduleIcon">0</span>
                <div>
                    <h3>No hay incidencias activas</h3>
                    <p>Las incidencias resueltas se conservan en el historial.</p>
                </div>
            </article>
        `;
        if (historyVisible) renderIncidentHistory(incidents);
        return;
    }

    supportIncidentsPanel.innerHTML = `
        <div class="resultGrid">
            ${activeIncidents.map((incident) => `
                <article class="resultCard">
                    <div class="resultCardHeader">
                        <div>
                            <p class="eyebrow">${incident.estado || "PENDIENTE"}</p>
                            <h3>${incident.titulo || "Incidencia sin titulo"}</h3>
                        </div>
                        <span class="pill ${incident.estado === "RESUELTA" ? "green" : "coral"}">ID ${incident.id}</span>
                    </div>
                    <p>${incident.descripcion || "Sin descripcion"}</p>
                    <div class="resultMeta">
                        <span>Usuario: ${incident.usuario.nombre} ${incident.usuario.apellido}</span>
                        <span>Correo: ${incident.usuario.correo}</span>
                        <span>Reporte: ${formatDateTime(incident.fechaReporte)}</span>
                    </div>
                    ${renderHistory(incident.historial || [])}
                </article>
            `).join("")}
        </div>
    `;
    if (historyVisible) renderIncidentHistory(incidents);
}

function renderHistory(history) {
    if (!history.length) {
        return '<p class="muted">Sin comentarios de seguimiento.</p>';
    }

    return `
        <div class="resultMeta">
            ${history.map((item) => `<span>${formatDateTime(item.fecha)}: ${item.comentario}</span>`).join("")}
        </div>
    `;
}

function renderIncidentHistory(incidents) {
    const resolvedIncidents = incidents.filter((incident) => incident.estado === "RESUELTA");
    const history = resolvedIncidents.flatMap((incident) =>
        (incident.historial || []).map((item) => ({
            ...item,
            incidenciaId: incident.id,
            titulo: incident.titulo || "Incidencia sin titulo",
            estado: incident.estado,
        })),
    );

    if (!history.length) {
        incidentHistoryPanel.innerHTML = '<article class="emptyState">Aun no hay incidencias resueltas con historial guardado.</article>';
        return;
    }

    incidentHistoryPanel.innerHTML = history
        .sort((a, b) => String(b.fecha || "").localeCompare(String(a.fecha || "")))
        .map((item) => `
            <article class="resultCard">
                <div class="resultCardHeader">
                    <div>
                        <p class="eyebrow">Incidencia ${item.incidenciaId} - ${item.estado}</p>
                        <h3>${item.titulo}</h3>
                    </div>
                    <span class="pill green">${formatDateTime(item.fecha)}</span>
                </div>
                <p>${item.comentario || "Sin comentario"}</p>
            </article>
        `).join("");
}

function renderSchedule(schedules) {
    if (!schedules.length) {
        supportScheduleGrid.innerHTML = '<article class="emptyState">No tienes horarios registrados.</article>';
        return;
    }

    supportScheduleGrid.innerHTML = schedules.map((schedule) => `
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

async function loadIncidents() {
    const result = await request("/api/incidencias");
    if (result.ok) {
        latestIncidents = result.body || [];
        renderIncidents(latestIncidents);
        return;
    }
    supportIncidentsPanel.innerHTML = `<article class="emptyState">${result.body?.mensaje || "No se pudieron cargar las incidencias."}</article>`;
}

async function loadSchedule() {
    const result = await request("/api/horarios/mis-horarios");
    if (result.ok) {
        renderSchedule(result.body || []);
        return;
    }
    supportScheduleGrid.innerHTML = `<article class="emptyState">${result.body?.mensaje || "No se pudo cargar tu horario."}</article>`;
}

async function updateIncidentStatus(event) {
    event.preventDefault();
    const data = formToJson(event.currentTarget);
    const result = await request(`/api/incidencias/${data.incidenciaId}/estado`, {
        method: "PATCH",
        body: {
            estado: data.estado,
            comentario: data.comentario,
        },
    });

    if (result.ok) {
        showToast(data.comentario ? "Estado actualizado y comentario guardado." : "Estado de incidencia actualizado.");
        event.currentTarget.reset();
        await loadIncidents();
        return;
    }
    showToast(result.body?.mensaje || "No se pudo actualizar la incidencia.");
}

document.querySelector("#reloadIncidentsBtn").addEventListener("click", loadIncidents);
document.querySelector("#showIncidentHistoryBtn").addEventListener("click", async () => {
    historyVisible = true;
    await loadIncidents();
    renderIncidentHistory(latestIncidents);
});
document.querySelector("#reloadSupportScheduleBtn").addEventListener("click", loadSchedule);
document.querySelector("#incidentStatusForm").addEventListener("submit", updateIncidentStatus);
document.querySelector("#supportLogoutBtn").addEventListener("click", () => {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(userKey);
    window.location.replace("/");
});

if (requireSupportSession()) {
    loadIncidents();
    loadSchedule();
}
