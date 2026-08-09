const tokenKey = "clubDeportivoJwt";
const userKey = "clubDeportivoUser";
const workerUserBadge = document.querySelector("#workerUserBadge");
const workerRequestsPanel = document.querySelector("#workerRequestsPanel");
const workerMaterialsGrid = document.querySelector("#workerMaterialsGrid");
const workerFacilitiesGrid = document.querySelector("#workerFacilitiesGrid");
const workerToast = document.querySelector("#workerToast");
const requestCount = document.querySelector("#requestCount");
const materialCount = document.querySelector("#materialCount");
const facilityCount = document.querySelector("#facilityCount");

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

function requireWorkerSession() {
    const user = getUser();
    if (!getToken() || user?.rol !== "TRABAJADOR") {
        window.location.replace("/");
        return null;
    }
    workerUserBadge.textContent = `${user.nombre || ""} ${user.apellido || ""}`.trim() || "Trabajador";
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
    workerToast.textContent = message;
    workerToast.classList.remove("hidden");
    window.setTimeout(() => workerToast.classList.add("hidden"), 4500);
}

function formatDateTime(value) {
    if (!value) return "Sin fecha";
    return String(value).replace("T", " ").slice(0, 16);
}

function renderRequests(requests) {
    const activeRequests = requests.filter((item) => item.estado !== "RECHAZADA");
    requestCount.textContent = activeRequests.length;

    if (!activeRequests.length) {
        workerRequestsPanel.innerHTML = `
            <article class="resultEmpty">
                <span class="moduleIcon">0</span>
                <div>
                    <h3>No hay solicitudes</h3>
                    <p>Cuando un entrenador solicite materiales, apareceran aqui.</p>
                </div>
            </article>
        `;
        return;
    }

    workerRequestsPanel.innerHTML = `
        <div class="resultGrid">
            ${activeRequests.map((item) => `
                <article class="resultCard">
                    <div class="resultCardHeader">
                        <div>
                            <p class="eyebrow">${item.estado || "PENDIENTE"}</p>
                            <h3>${item.material.nombre}</h3>
                        </div>
                        <span class="pill ${item.estado === "RECHAZADA" ? "coral" : "green"}">${item.cantidad} pieza(s)</span>
                    </div>
                    <p>${item.material.descripcion || "Sin descripcion"}</p>
                    <div class="resultMeta">
                        <span>Entrenador: ${item.entrenador}</span>
                        <span>Correo: ${item.entrenadorCorreo}</span>
                        <span>Fecha: ${formatDateTime(item.fechaSolicitud)}</span>
                    </div>
                    <div class="quickActions">
                        <button type="button" class="button success" data-request-id="${item.id}" data-status="APROBADA">Aprobar</button>
                        <button type="button" class="button ghost dark" data-request-id="${item.id}" data-status="ENTREGADA">Entregar</button>
                        <button type="button" class="button compact" data-request-id="${item.id}" data-status="RECHAZADA">Rechazar</button>
                    </div>
                </article>
            `).join("")}
        </div>
    `;

    workerRequestsPanel.querySelectorAll("[data-request-id]").forEach((button) => {
        button.addEventListener("click", () => updateRequestStatus(Number(button.dataset.requestId), button.dataset.status));
    });
}

function renderMaterials(materials) {
    materialCount.textContent = materials.length;

    if (!materials.length) {
        workerMaterialsGrid.innerHTML = '<article class="emptyState">No hay materiales registrados.</article>';
        return;
    }

    workerMaterialsGrid.innerHTML = materials.map((material) => `
        <article class="resultCard">
            <div class="resultCardHeader">
                <div>
                    <p class="eyebrow">Disponible</p>
                    <h3>${material.nombre}</h3>
                </div>
                <span class="pill green">${material.cantidadDisponible}</span>
            </div>
            <p>${material.descripcion || "Sin descripcion"}</p>
            <div class="resultMeta">
                <span>ID material: ${material.id}</span>
            </div>
        </article>
    `).join("");
}

function renderFacilities(facilities) {
    facilityCount.textContent = facilities.length;

    if (!facilities.length) {
        workerFacilitiesGrid.innerHTML = '<article class="emptyState">No hay instalaciones registradas.</article>';
        return;
    }

    workerFacilitiesGrid.innerHTML = facilities.map((facility) => `
        <article class="resultCard">
            <div class="resultCardHeader">
                <div>
                    <p class="eyebrow">${facility.disponible ? "DISPONIBLE" : "NO DISPONIBLE"}</p>
                    <h3>${facility.nombre}</h3>
                </div>
                <span class="pill ${facility.disponible ? "green" : "coral"}">${facility.capacidad || 0} lugares</span>
            </div>
            <p>${facility.descripcion || "Sin descripcion"}</p>
            <div class="quickActions">
                <button type="button" class="button ${facility.disponible ? "compact" : "success"}" data-facility-id="${facility.id}" data-available="${!facility.disponible}">
                    ${facility.disponible ? "Marcar no disponible" : "Marcar disponible"}
                </button>
            </div>
        </article>
    `).join("");

    workerFacilitiesGrid.querySelectorAll("[data-facility-id]").forEach((button) => {
        button.addEventListener("click", () => updateFacilityAvailability(Number(button.dataset.facilityId), button.dataset.available === "true"));
    });
}

async function loadRequests() {
    const result = await request("/api/materiales/solicitudes");
    if (result.ok) {
        renderRequests(result.body || []);
        return;
    }
    workerRequestsPanel.innerHTML = `<article class="emptyState">${result.body?.mensaje || "No se pudieron cargar las solicitudes."}</article>`;
}

async function loadMaterials() {
    const result = await request("/api/materiales");
    if (result.ok) {
        renderMaterials(result.body || []);
        return;
    }
    workerMaterialsGrid.innerHTML = `<article class="emptyState">${result.body?.mensaje || "No se pudieron cargar los materiales."}</article>`;
}

async function loadFacilities() {
    const result = await request("/api/instalaciones");
    if (result.ok) {
        renderFacilities(result.body || []);
        return;
    }
    workerFacilitiesGrid.innerHTML = `<article class="emptyState">${result.body?.mensaje || "No se pudieron cargar las instalaciones."}</article>`;
}

async function updateRequestStatus(id, estado) {
    const result = await request(`/api/materiales/solicitudes/${id}/estado`, {
        method: "PATCH",
        body: { estado },
    });

    if (result.ok) {
        showToast(`Solicitud actualizada a ${estado}.`);
        await Promise.all([loadRequests(), loadMaterials()]);
        return;
    }
    showToast(result.body?.mensaje || "No se pudo actualizar la solicitud.");
}

async function updateFacilityAvailability(id, disponible) {
    const result = await request(`/api/instalaciones/${id}/disponibilidad`, {
        method: "PATCH",
        body: { disponible },
    });

    if (result.ok) {
        showToast("Disponibilidad actualizada correctamente.");
        await loadFacilities();
        return;
    }
    showToast(result.body?.mensaje || "No se pudo actualizar la instalacion.");
}

document.querySelector("#reloadRequestsBtn").addEventListener("click", loadRequests);
document.querySelector("#reloadMaterialsBtn").addEventListener("click", loadMaterials);
document.querySelector("#reloadFacilitiesBtn").addEventListener("click", loadFacilities);
document.querySelector("#workerLogoutBtn").addEventListener("click", () => {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(userKey);
    window.location.replace("/");
});

if (requireWorkerSession()) {
    loadRequests();
    loadMaterials();
    loadFacilities();
}
