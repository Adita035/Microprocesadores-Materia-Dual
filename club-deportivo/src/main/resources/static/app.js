const tokenKey = "clubDeportivoJwt";
const output = document.querySelector("#output");
const tokenView = document.querySelector("#tokenView");
const sessionStatus = document.querySelector("#sessionStatus");
const sessionCard = document.querySelector(".sessionCard");

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

document.querySelector("#clearTokenBtn").addEventListener("click", () => {
    setToken("");
    output.textContent = "Token eliminado. Prueba listar usuarios para confirmar que el endpoint protegido responde 401/403.";
});

tokenView.addEventListener("input", () => {
    setToken(tokenView.value.trim());
});

renderToken();
