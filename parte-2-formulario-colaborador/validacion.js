"use strict";

/* ==========================================================================
   FUNCIONES DE RETROALIMENTACIÓN VISUAL
   ========================================================================== */

function mostrarError(campoId, mensaje) {
  const campo = document.querySelector(`#${campoId}`);
  const span = document.querySelector(`#error-${campoId}`);

  campo.classList.add("invalido");
  campo.classList.remove("valido");
  span.textContent = mensaje;
  span.classList.add("visible");
}

function limpiarError(campoId) {
  const campo = document.querySelector(`#${campoId}`);
  const span = document.querySelector(`#error-${campoId}`);

  campo.classList.remove("invalido");
  campo.classList.add("valido");
  span.textContent = "";
  span.classList.remove("visible");
}

function limpiarTodo() {
  ["nombre", "email", "username", "password", "confirmar", "rol", "equipo", "horas", "terminos"]
    .forEach(id => limpiarError(id));
}

/* ==========================================================================
   VALIDACIÓN DE NOMBRE, CORREO Y USUARIO
   ========================================================================== */

function validarNombre() {
  const campo = document.querySelector("#nombre");
  if (campo.validity.valueMissing) {
    mostrarError("nombre", "El nombre es obligatorio.");
    return false;
  }
  if (campo.validity.tooShort) {
    mostrarError("nombre", `El nombre debe tener al menos ${campo.minLength} caracteres.`);
    return false;
  }
  limpiarError("nombre");
  return true;
}

function validarEmail() {
  const campo = document.querySelector("#email");
  if (campo.validity.valueMissing) {
    mostrarError("email", "El correo es obligatorio.");
    return false;
  }
  if (campo.validity.typeMismatch) {
    mostrarError("email", "El formato del correo no es válido.");
    return false;
  }
  limpiarError("email");
  return true;
}

// Checkpoint de comprensión: se reutiliza el atributo pattern nativo del
// HTML (en vez de repetir la misma regla como una expresión regular
// manual aquí en JS) porque el navegador ya bloquea el envío nativo con
// ese mismo patrón; reutilizar la misma fuente de verdad evita que la
// regla de formato quede duplicada en dos lugares que podrían
// desincronizarse si alguno se edita y el otro no.
function validarUsername() {
  const campo = document.querySelector("#username");
  if (campo.validity.valueMissing) {
    mostrarError("username", "El nombre de usuario es obligatorio.");
    return false;
  }
  if (campo.validity.patternMismatch) {
    mostrarError("username", "Use 4 a 20 caracteres: letras, números o guion bajo, sin espacios.");
    return false;
  }
  limpiarError("username");
  return true;
}

/* ==========================================================================
   DECISIÓN DE DISEÑO 3 — Validación de contraseña
   Estrategia elegida: B (validaciones independientes encadenadas)
   Justificación: se documenta en el README, sección "Decisiones de diseño".
   Cada regla (mayúscula, número, carácter especial) se revisa por
   separado y con su propio mensaje, para que el colaborador sepa
   exactamente qué falta en vez de recibir un mensaje genérico.
   ========================================================================== */
function validarPassword() {
  const campo = document.querySelector("#password");
  const valor = campo.value;

  if (campo.validity.valueMissing) {
    mostrarError("password", "La contraseña es obligatoria.");
    return false;
  }
  if (campo.validity.tooShort) {
    mostrarError("password", "La contraseña debe tener al menos 8 caracteres.");
    return false;
  }
  if (!/[A-Z]/.test(valor)) {
    mostrarError("password", "Falta al menos una letra mayúscula.");
    return false;
  }
  if (!/[0-9]/.test(valor)) {
    mostrarError("password", "Falta al menos un número.");
    return false;
  }
  if (!/[^A-Za-z0-9]/.test(valor)) {
    mostrarError("password", "Falta al menos un carácter especial (por ejemplo: # ! % &).");
    return false;
  }

  limpiarError("password");
  return true;
}

function validarConfirmar() {
  const password = document.querySelector("#password").value;
  const confirmar = document.querySelector("#confirmar").value;
  if (!confirmar) {
    mostrarError("confirmar", "La confirmación es obligatoria.");
    return false;
  }
  if (password !== confirmar) {
    mostrarError("confirmar", "Las contraseñas no coinciden.");
    return false;
  }
  limpiarError("confirmar");
  return true;
}

/* ==========================================================================
   VALIDACIÓN DE ROL Y CAMPO CONDICIONAL "EQUIPO A CARGO"
   ========================================================================== */

function validarRol() {
  const campo = document.querySelector("#rol");
  if (campo.validity.valueMissing) {
    mostrarError("rol", "Seleccione un rol.");
    return false;
  }
  limpiarError("rol");
  return true;
}

const selectRol = document.querySelector("#rol");
const grupoEquipo = document.querySelector("#grupo-equipo");

/* ==========================================================================
   DECISIÓN DE DISEÑO 4 — Campo condicional "equipo a cargo"
   Estrategia elegida: A (alternar el atributo required nativo)
   Justificación: se documenta en el README, sección "Decisiones de diseño".
   Al cambiar el rol se asigna document.querySelector("#equipo").required,
   así checkValidity() y campo.validity.valueMissing reflejan
   automáticamente si el campo aplica, aprovechando la Constraint
   Validation API tal como está pensada en vez de reimplementar la
   condición a mano.
   ========================================================================== */
selectRol.addEventListener("change", () => {
  const esLider = selectRol.value === "lider";
  grupoEquipo.classList.toggle("oculto", !esLider);
  document.querySelector("#equipo").required = esLider;

  if (!esLider) limpiarError("equipo");
  validarRol();
});

function validarEquipo() {
  const campo = document.querySelector("#equipo");
  if (!campo.required) return true; // el campo no aplica si el rol no es Líder

  if (campo.validity.valueMissing) {
    mostrarError("equipo", "Indique el equipo a cargo para el rol de Líder.");
    return false;
  }
  limpiarError("equipo");
  return true;
}

/* ==========================================================================
   VALIDACIÓN DE HORAS DISPONIBLES
   ========================================================================== */

function validarHoras() {
  const campo = document.querySelector("#horas");
  if (campo.validity.valueMissing) {
    mostrarError("horas", "Indique las horas disponibles por semana.");
    return false;
  }
  if (campo.validity.rangeUnderflow) {
    mostrarError("horas", `Debe disponer al menos de ${campo.min} horas semanales.`);
    return false;
  }
  if (campo.validity.rangeOverflow) {
    mostrarError("horas", `No puede superar las ${campo.max} horas semanales.`);
    return false;
  }
  limpiarError("horas");
  return true;
}

/* ==========================================================================
   VALIDACIÓN DEL CHECKBOX DE TÉRMINOS
   ========================================================================== */

function validarTerminos() {
  const campo = document.querySelector("#terminos");
  if (!campo.checked) {
    mostrarError("terminos", "Debe aceptar los términos para continuar.");
    return false;
  }
  limpiarError("terminos");
  return true;
}

/* ==========================================================================
   VALIDACIÓN EN TIEMPO REAL POR CAMPO
   ========================================================================== */

document.querySelector("#nombre").addEventListener("blur", validarNombre);
document.querySelector("#email").addEventListener("blur", validarEmail);
document.querySelector("#username").addEventListener("blur", validarUsername);
document.querySelector("#password").addEventListener("blur", validarPassword);
document.querySelector("#confirmar").addEventListener("blur", validarConfirmar);
document.querySelector("#rol").addEventListener("change", validarRol);
document.querySelector("#equipo").addEventListener("blur", validarEquipo);
document.querySelector("#horas").addEventListener("blur", validarHoras);
document.querySelector("#terminos").addEventListener("change", validarTerminos);

// Limpiar error al comenzar a escribir la confirmación
document.querySelector("#confirmar").addEventListener("input", () => {
  if (document.querySelector("#confirmar").value) limpiarError("confirmar");
});

/* ==========================================================================
   INDICADOR DE FORTALEZA DE CONTRASEÑA (mejora visual, Paso 10)
   ========================================================================== */

function evaluarFortaleza(valor) {
  let puntos = 0;
  if (valor.length >= 8) puntos++;
  if (/[A-Z]/.test(valor)) puntos++;
  if (/[0-9]/.test(valor)) puntos++;
  if (/[^A-Za-z0-9]/.test(valor)) puntos++;

  const niveles = ["", "Débil", "Regular", "Buena", "Fuerte"];
  const colores = ["", "#e11d48", "#f59e0b", "#3b82f6", "#10b981"];

  return { nivel: niveles[puntos], color: colores[puntos], puntos };
}

const campoPassword = document.querySelector("#password");
const indicadorFortaleza = document.querySelector("#fortaleza");

campoPassword.addEventListener("input", () => {
  const { nivel, color, puntos } = evaluarFortaleza(campoPassword.value);
  indicadorFortaleza.textContent = puntos > 0 ? `Contraseña: ${nivel}` : "";
  indicadorFortaleza.style.color = color;
});

/* ==========================================================================
   CONTROL DEL EVENTO submit
   ========================================================================== */

const form = document.querySelector("#form-registro");

form.addEventListener("submit", (e) => {
  e.preventDefault(); // Siempre prevenir el envío por defecto

  const resultados = [
    validarNombre(),
    validarEmail(),
    validarUsername(),
    validarPassword(),
    validarConfirmar(),
    validarRol(),
    validarEquipo(),
    validarHoras(),
    validarTerminos(),
  ];

  const todoValido = resultados.every(r => r === true);

  if (todoValido) {
    const mensajeExito = document.querySelector("#mensaje-exito");
    mensajeExito.classList.remove("oculto");
    mensajeExito.classList.add("visible");

    setTimeout(() => {
      form.reset();
      limpiarTodo();
      grupoEquipo.classList.add("oculto");
      document.querySelector("#equipo").required = false;
      indicadorFortaleza.textContent = "";
      mensajeExito.classList.remove("visible");
      mensajeExito.classList.add("oculto");
    }, 2000);
  } else {
    const primerInvalido = form.querySelector(".invalido");
    if (primerInvalido) primerInvalido.focus();
  }
});
