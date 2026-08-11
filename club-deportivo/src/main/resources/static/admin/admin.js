const tokenKey = "clubDeportivoJwt";
const userKey = "clubDeportivoUser";
const output = document.querySelector("#output");
const sessionStatus = document.querySelector("#sessionStatus");
const sessionCard = document.querySelector(".sessionCard");
const adminHeroBannerTrack = document.querySelector("#adminHeroBannerTrack");
const facilityNameSelect = document.querySelector("#facilityNameSelect");
const membershipNameSelect = document.querySelector("#membershipNameSelect");
const assignActivitySelect = document.querySelector("#assignActivitySelect");
const assignTrainerSelect = document.querySelector("#assignTrainerSelect");
const deleteConfirmModal = document.querySelector("#deleteConfirmModal");
const deleteConfirmTitle = document.querySelector("#deleteConfirmTitle");
const deleteConfirmMessage = document.querySelector("#deleteConfirmMessage");
const confirmDeleteBtn = document.querySelector("#confirmDeleteBtn");
const deleteTypeSelect = document.querySelector("#deleteTypeSelect");
const deleteItemSelect = document.querySelector("#deleteItemSelect");
const adminLogoutBtn = document.querySelector("#adminLogoutBtn");
let adminHeroSlideIndex = 0;
let pendingDelete = null;
let deleteCatalogs = {
    usuario: [],
    entrenador: [],
    actividad: [],
    instalacion: [],
    membresia: [],
};

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

function renderToken() {
    const token = getToken();
    const user = getUser();
    sessionStatus.textContent = token ? (user ? `${user.nombre} ${user.apellido}` : "Token activo") : "Sin sesion";
    sessionCard.classList.toggle("active", Boolean(token));
}

function logoutAdmin() {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(userKey);
    window.location.href = "/";
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
                if (["usuarioId", "actividadId", "entrenadorId", "membresiaId", "duracionDias", "instalacionId", "capacidad"].includes(key)) {
                    return [key, Number(normalizedValue)];
                }
                if (key === "precio") {
                    return [key, Number(normalizedValue)];
                }
                if (["activa", "disponible"].includes(key)) {
                    return [key, normalizedValue === "true"];
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
    if (title.includes("membresias")) {
        return renderMemberships(title, items);
    }
    if (title.includes("instalaciones") || title.includes("disponibles")) {
        return renderFacilities(title, items);
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
                    ${user.rol === "ADMINISTRADOR" ? "" : renderDeleteAction("usuario", user.id, `${user.nombre} ${user.apellido}`)}
                </article>
            `).join("")}
        </div>
    `;
}

function renderMemberships(title, memberships) {
    return `
        ${renderSummaryHeader(title, `${memberships.length} membresias encontradas`, true)}
        <div class="resultGrid">
            ${memberships.map((membership) => `
                <article class="resultCard">
                    <div class="resultCardHeader">
                        <div>
                            <p class="eyebrow">${membership.activa ? "ACTIVA" : "INACTIVA"}</p>
                            <h3>${membership.nombre}</h3>
                        </div>
                        <span class="pill ${membership.activa ? "green" : "coral"}">
                            ${membership.activa ? "Visible" : "Oculta"}
                        </span>
                    </div>
                    <p>${membership.descripcion || "Sin descripcion"}</p>
                    <div class="resultMeta">
                        <span>ID: ${membership.id}</span>
                        <span>Precio: ${money(membership.precio)}</span>
                        <span>Duracion: ${membership.duracionDias || 0} dias</span>
                    </div>
                    ${renderDeleteAction("membresia", membership.id, membership.nombre)}
                </article>
            `).join("")}
        </div>
    `;
}

function renderFacilities(title, facilities) {
    return `
        ${renderSummaryHeader(title, `${facilities.length} instalaciones encontradas`, true)}
        <div class="resultGrid">
            ${facilities.map((facility) => `
                <article class="resultCard">
                    <div class="resultCardHeader">
                        <div>
                            <p class="eyebrow">${facility.disponible ? "DISPONIBLE" : "NO DISPONIBLE"}</p>
                            <h3>${facility.nombre}</h3>
                        </div>
                        <span class="pill ${facility.disponible ? "green" : "coral"}">
                            ${facility.disponible ? "Operativa" : "Bloqueada"}
                        </span>
                    </div>
                    <p>${facility.descripcion || "Sin descripcion"}</p>
                    <div class="resultMeta">
                        <span>ID: ${facility.id}</span>
                        <span>Capacidad: ${facility.capacidad || 0}</span>
                    </div>
                    ${renderDeleteAction("instalacion", facility.id, facility.nombre)}
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
                    ${renderDeleteAction("entrenador", trainer.id, `${trainer.usuario?.nombre || "Entrenador"} ${trainer.usuario?.apellido || ""}`.trim())}
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
                    ${renderDeleteAction("actividad", activity.id, activity.nombre)}
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

function renderDeleteAction(type, id, name) {
    return `
        <div class="resultActions">
            <button
                type="button"
                class="button compact danger"
                data-delete-type="${type}"
                data-delete-id="${id}"
                data-delete-name="${escapeHtml(name)}"
            >
                Eliminar
            </button>
        </div>
    `;
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

function money(value) {
    return Number(value || 0).toLocaleString("es-MX", {
        style: "currency",
        currency: "MXN",
    });
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
        const result = await request("/api/actividades/asignaciones/por-nombre", {
            method: "POST",
            body: {
                actividad: data.actividad,
                entrenador: data.entrenador,
            },
        });
        printResult(title, result);
    } catch (error) {
        printError(title, error);
    }
});

document.querySelector("#membershipForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const title = "Crear membresia";
    try {
        const result = await request("/api/membresias", {
            method: "POST",
            body: formToJson(event.currentTarget),
        });
        printResult(title, result);
    } catch (error) {
        printError(title, error);
    }
});

document.querySelector("#membershipStatusForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const title = "Actualizar membresia";
    const data = formToJson(event.currentTarget);
    try {
        const result = await request("/api/membresias/por-nombre/estado", {
            method: "PATCH",
            body: {
                nombre: data.nombre,
                activa: data.activa,
            },
        });
        printResult(title, result);
    } catch (error) {
        printError(title, error);
    }
});

document.querySelector("#facilityForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const title = "Crear instalacion";
    try {
        const result = await request("/api/instalaciones", {
            method: "POST",
            body: formToJson(event.currentTarget),
        });
        printResult(title, result);
    } catch (error) {
        printError(title, error);
    }
});

document.querySelector("#facilityStatusForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const title = "Actualizar instalacion";
    const data = formToJson(event.currentTarget);
    try {
        const result = await request("/api/instalaciones/por-nombre/disponibilidad", {
            method: "PATCH",
            body: {
                nombre: data.nombre,
                disponible: data.disponible,
            },
        });
        printResult(title, result);
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

document.querySelector("#usersByRoleForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = formToJson(event.currentTarget);
    const title = `Listar usuarios ${data.rol}`;
    try {
        printResult(title, await request(`/api/usuarios/rol/${data.rol}`));
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

async function listMemberships(title = "Listar membresias") {
    try {
        printResult(title, await request("/api/membresias"));
    } catch (error) {
        printError(title, error);
    }
}

document.querySelector("#membershipsBtn").addEventListener("click", () => listMemberships());
document.querySelector("#membershipsQuickBtn").addEventListener("click", () => listMemberships());

document.querySelector("#membershipUsersBtn").addEventListener("click", async () => {
    const title = "Usuarios con membresia";
    try {
        const result = await request("/api/usuarios");
        if (result.ok && Array.isArray(result.body)) {
            printResult(title, { ...result, body: result.body.filter((user) => user.tieneMembresia) });
        } else {
            printResult(title, result);
        }
    } catch (error) {
        printError(title, error);
    }
});

async function listFacilities(title = "Listar instalaciones", onlyAvailable = false) {
    try {
        const path = onlyAvailable ? "/api/instalaciones/disponibles" : "/api/instalaciones";
        printResult(title, await request(path));
    } catch (error) {
        printError(title, error);
    }
}

document.querySelector("#facilitiesBtn").addEventListener("click", () => listFacilities());
document.querySelector("#facilitiesQuickBtn").addEventListener("click", () => listFacilities());
document.querySelector("#availableFacilitiesBtn").addEventListener("click", () => listFacilities("Listar instalaciones disponibles", true));

document.querySelector("#prevAdminHeroSlideBtn").addEventListener("click", () => moveAdminHeroSlide(-1));
document.querySelector("#nextAdminHeroSlideBtn").addEventListener("click", () => moveAdminHeroSlide(1));
adminLogoutBtn.addEventListener("click", logoutAdmin);

output.addEventListener("click", (event) => {
    const button = event.target.closest("[data-delete-type]");
    if (!button) return;

    openDeleteConfirm({
        type: button.dataset.deleteType,
        id: button.dataset.deleteId,
        name: button.dataset.deleteName,
    });
});

document.querySelector("#closeDeleteConfirmBtn").addEventListener("click", closeDeleteConfirm);
document.querySelector("#cancelDeleteBtn").addEventListener("click", closeDeleteConfirm);
confirmDeleteBtn.addEventListener("click", executePendingDelete);
deleteTypeSelect.addEventListener("change", () => loadDeleteCatalogForType(deleteTypeSelect.value));
document.querySelector("#refreshDeleteItemsBtn").addEventListener("click", () => loadDeleteCatalogForType(deleteTypeSelect.value));

document.querySelector("#deleteItemForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const type = deleteTypeSelect.value;
    const id = deleteItemSelect.value;
    const selectedItem = deleteCatalogs[type].find((item) => String(item.id) === String(id));

    if (!selectedItem) {
        printResult("Eliminar elemento", {
            ok: false,
            statusText: "Seleccion requerida",
            body: { mensaje: "Selecciona un elemento para eliminar." },
        });
        return;
    }

    openDeleteConfirm({
        type,
        id,
        name: selectedItem.name,
    });
});

async function loadAdminSelects() {
    await Promise.all([
        loadFacilitiesSelect(),
        loadMembershipsSelect(),
        loadActivitiesSelect(),
        loadTrainersSelect(),
    ]);
    await loadDeleteCatalogForType(deleteTypeSelect.value);
}

async function loadFacilitiesSelect() {
    const result = await request("/api/instalaciones");
    if (!result.ok || !Array.isArray(result.body)) return;
    facilityNameSelect.innerHTML = `
        <option value="">Selecciona una instalacion</option>
        ${result.body.map((facility) => `<option value="${escapeHtml(facility.nombre)}">${escapeHtml(facility.nombre)}</option>`).join("")}
    `;
}

async function loadActivitiesSelect() {
    const result = await request("/api/actividades");
    if (!result.ok || !Array.isArray(result.body)) return;
    assignActivitySelect.innerHTML = `
        <option value="">Selecciona una actividad</option>
        ${result.body.map((activity) => `<option value="${escapeHtml(activity.nombre)}">${escapeHtml(activity.nombre)}</option>`).join("")}
    `;
}

async function loadMembershipsSelect() {
    const result = await request("/api/membresias");
    if (!result.ok || !Array.isArray(result.body)) return;
    membershipNameSelect.innerHTML = `
        <option value="">Selecciona una membresia</option>
        ${result.body.map((membership) => `<option value="${escapeHtml(membership.nombre)}">${escapeHtml(membership.nombre)}</option>`).join("")}
    `;
}

async function loadTrainersSelect() {
    const result = await request("/api/entrenadores");
    if (!result.ok || !Array.isArray(result.body)) return;
    assignTrainerSelect.innerHTML = `
        <option value="">Selecciona un entrenador</option>
        ${result.body.map((trainer) => {
            const fullName = `${trainer.usuario?.nombre || ""} ${trainer.usuario?.apellido || ""}`.trim();
            return `<option value="${escapeHtml(fullName)}">${escapeHtml(fullName)}</option>`;
        }).join("")}
    `;
}

async function loadDeleteCatalogForType(type) {
    deleteItemSelect.innerHTML = '<option value="">Cargando elementos...</option>';
    const result = await request(deleteListPath(type));
    deleteCatalogs[type] = normalizeDeleteCatalog(type, result);
    renderDeleteItemOptions();
}

function deleteListPath(type) {
    const paths = {
        usuario: "/api/usuarios",
        entrenador: "/api/entrenadores",
        actividad: "/api/actividades",
        instalacion: "/api/instalaciones",
        membresia: "/api/membresias",
    };
    return paths[type];
}

function normalizeDeleteCatalog(type, result) {
    if (type === "usuario") return normalizeDeleteUsers(result);
    if (type === "entrenador") return normalizeDeleteTrainers(result);
    return normalizeDeleteItems(result, "nombre");
}

function normalizeDeleteUsers(result) {
    if (!result.ok || !Array.isArray(result.body)) return [];
    return result.body
        .filter((user) => user.rol !== "ADMINISTRADOR")
        .map((user) => ({
            id: user.id,
            name: `${user.nombre} ${user.apellido} - ${user.rol}`,
        }));
}

function normalizeDeleteTrainers(result) {
    if (!result.ok || !Array.isArray(result.body)) return [];
    return result.body.map((trainer) => ({
        id: trainer.id,
        name: `${trainer.usuario?.nombre || "Entrenador"} ${trainer.usuario?.apellido || ""}`.trim(),
    }));
}

function normalizeDeleteItems(result, nameKey) {
    if (!result.ok || !Array.isArray(result.body)) return [];
    return result.body.map((item) => ({
        id: item.id,
        name: item[nameKey] || `Registro ${item.id}`,
    }));
}

function renderDeleteItemOptions() {
    const type = deleteTypeSelect.value;
    const items = deleteCatalogs[type] || [];
    if (!items.length) {
        deleteItemSelect.innerHTML = '<option value="">No hay elementos disponibles</option>';
        return;
    }

    deleteItemSelect.innerHTML = `
        <option value="">Selecciona un elemento</option>
        ${items.map((item) => `<option value="${item.id}">${escapeHtml(item.name)}</option>`).join("")}
    `;
}

function openDeleteConfirm(item) {
    pendingDelete = item;
    deleteConfirmTitle.textContent = `Eliminar ${deleteLabel(item.type)}`;
    deleteConfirmMessage.textContent = `Estas por eliminar "${item.name}". Confirma solo si estas seguro de continuar.`;
    deleteConfirmModal.classList.remove("hidden");
}

function closeDeleteConfirm() {
    pendingDelete = null;
    deleteConfirmModal.classList.add("hidden");
}

async function executePendingDelete() {
    if (!pendingDelete) return;

    const item = pendingDelete;
    const title = `Eliminar ${deleteLabel(item.type)}`;
    closeDeleteConfirm();

    try {
        const result = await request(deletePath(item), { method: "DELETE" });
        printResult(title, result.ok ? { ...result, body: { mensaje: `${deleteLabel(item.type)} eliminado correctamente.` } } : result);
        if (result.ok) {
            await loadAdminSelects();
        }
    } catch (error) {
        printError(title, error);
    }
}

function deletePath(item) {
    const paths = {
        usuario: `/api/usuarios/${item.id}`,
        entrenador: `/api/entrenadores/${item.id}`,
        actividad: `/api/actividades/${item.id}`,
        instalacion: `/api/instalaciones/${item.id}`,
        membresia: `/api/membresias/${item.id}`,
    };
    return paths[item.type];
}

function deleteLabel(type) {
    const labels = {
        usuario: "usuario",
        entrenador: "entrenador",
        actividad: "actividad",
        instalacion: "instalacion",
        membresia: "membresia",
    };
    return labels[type] || "elemento";
}

function escapeHtml(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

renderToken();
loadAdminSelects().catch((error) => printError("Cargar catalogos", error));
