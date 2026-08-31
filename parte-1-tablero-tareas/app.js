"use strict";

/* ==========================================================================
   ESTADO DE LA APLICACIÓN
   ========================================================================== */

// Estado central de la aplicación
let tareas = [];
let filtroEstado = "todas";
let filtroPrioridad = "todas";

// Secuencia de estados posibles, en el orden en que una tarea avanza
const SECUENCIA_ESTADOS = ["pendiente", "en-progreso", "completada"];

// Obtiene el valor de un campo de texto y lo limpia
const leerCampo = (selector) => {
  const campo = document.querySelector(selector);
  const valor = campo.value.trim();
  campo.value = "";
  return valor;
};

// Referencia al contenedor del tablero
const tablero = document.querySelector("#tablero");

/* ==========================================================================
   DECISIÓN DE DISEÑO 1 — Generador de ID
   Estrategia elegida: A (closure / patrón módulo)
   Justificación: se documenta en el README, sección "Decisiones de diseño".
   El contador queda encapsulado dentro del closure y solo es accesible
   a través de la función generarId() que crearGeneradorId() devuelve;
   ninguna otra parte del archivo puede leerlo ni reasignarlo por error.
   ========================================================================== */
function crearGeneradorId() {
  let contador = 1; // variable privada, solo visible dentro del closure
  return () => contador++;
}
const generarId = crearGeneradorId();

/* ==========================================================================
   CONFIGURACIÓN DE PRIORIDAD (switch) Y CREACIÓN DE ELEMENTOS DEL DOM
   ========================================================================== */

// Checkpoint de comprensión: se usa switch en vez de if/else-if porque
// todas las ramas comparan la MISMA variable (prioridad) contra valores
// discretos ya conocidos ("alta", "media", "baja"). No hay rangos ni
// condiciones compuestas que evaluar, así que switch deja la intención
// del código más clara que una cadena de if/else-if equivalente.
function obtenerConfigPrioridad(prioridad) {
  switch (prioridad) {
    case "alta":
      return { clase: "prioridad-alta", etiqueta: "Alta" };
    case "media":
      return { clase: "prioridad-media", etiqueta: "Media" };
    case "baja":
      return { clase: "prioridad-baja", etiqueta: "Baja" };
    default:
      return { clase: "prioridad-media", etiqueta: "Media" };
  }
}

function crearElementoTarea({ id, titulo, descripcion, prioridad, estado }) {
  const { clase: clasePrioridad, etiqueta: etiquetaPrioridad } = obtenerConfigPrioridad(prioridad);

  const tarea = document.createElement("article");
  tarea.classList.add("tarea", `estado-${estado}`, clasePrioridad);
  tarea.dataset.id = id;

  const puedeAvanzar = estado !== "completada";

  tarea.innerHTML = `
    <span class="badge-prioridad">${etiquetaPrioridad}</span>
    <span class="badge-estado">${estado}</span>
    <h3>${titulo}</h3>
    <p>${descripcion}</p>
    <div class="acciones-tarea">
      ${puedeAvanzar
        ? `<button class="btn-avanzar" data-id="${id}" data-action="avanzar">Avanzar estado</button>`
        : ""}
      <button class="btn-eliminar" data-id="${id}" data-action="eliminar">Eliminar</button>
    </div>
  `;

  return tarea;
}

/* ==========================================================================
   AGREGAR TAREAS
   ========================================================================== */

function agregarTarea() {
  const titulo = leerCampo("#input-titulo");
  const descripcion = leerCampo("#input-descripcion");
  const prioridad = document.querySelector("#select-prioridad").value;

  // Validación básica: título y descripción son obligatorios
  if (!titulo || !descripcion) {
    alert("El título y la descripción son obligatorios.");
    return;
  }

  // Crear objeto tarea y agregarlo al estado
  const nuevaTarea = { id: generarId(), titulo, descripcion, prioridad, estado: "pendiente" };
  tareas.push(nuevaTarea);

  // Crear el elemento DOM y añadirlo al tablero
  const elemento = crearElementoTarea(nuevaTarea);
  tablero.appendChild(elemento);

  actualizarStats();
}

document.querySelector("#btn-agregar").addEventListener("click", agregarTarea);

/* ==========================================================================
   ESTADÍSTICAS con reduce() y for...of
   ========================================================================== */

function actualizarStats() {
  // reduce: construye un objeto { estado: cantidad } a partir del array de tareas
  const conteos = tareas.reduce((acumulador, tarea) => {
    acumulador[tarea.estado] = (acumulador[tarea.estado] || 0) + 1;
    return acumulador;
  }, {});

  // for...of: recorre SECUENCIA_ESTADOS para mantener siempre el mismo orden
  const partes = [];
  for (const estado of SECUENCIA_ESTADOS) {
    const cantidad = conteos[estado] || 0;
    partes.push(`${cantidad} ${estado}`);
  }

  document.querySelector("#stats").textContent =
    `Tareas: ${partes.join(" · ")} (total ${tareas.length})`;
}

actualizarStats();

/* ==========================================================================
   DECISIÓN DE DISEÑO 2 — Actualización del DOM al avanzar estado
   Estrategia elegida: A (actualización dirigida / targeted update)
   Justificación: se documenta en el README, sección "Decisiones de diseño".
   Se localiza únicamente el nodo de la tarea que cambió y se modifican
   solo su clase de estado y el texto de su badge, sin reconstruir el
   resto del tablero.
   ========================================================================== */
function actualizarEstadoEnDOM(id, nuevoEstado) {
  const elementoTarea = tablero.querySelector(`[data-id="${id}"]`);
  if (!elementoTarea) return;

  SECUENCIA_ESTADOS.forEach(estado => elementoTarea.classList.remove(`estado-${estado}`));
  elementoTarea.classList.add(`estado-${nuevoEstado}`);

  const badgeEstado = elementoTarea.querySelector(".badge-estado");
  badgeEstado.textContent = nuevoEstado;

  // Si ya no se puede avanzar más, se quita el botón "Avanzar estado"
  if (nuevoEstado === "completada") {
    const btnAvanzar = elementoTarea.querySelector(".btn-avanzar");
    if (btnAvanzar) btnAvanzar.remove();
  }
}

/* ==========================================================================
   AVANZAR ESTADO Y ELIMINAR — Delegación de eventos con múltiples acciones
   ========================================================================== */

// Delegación: un solo listener en el tablero para ambas acciones (avanzar y eliminar)
tablero.addEventListener("click", (e) => {
  const boton = e.target.closest("button[data-action]");
  if (!boton) return;

  const id = Number(boton.dataset.id);

  if (boton.dataset.action === "eliminar") {
    tareas = tareas.filter(t => t.id !== id);
    boton.closest(".tarea").remove();
    actualizarStats();
    return;
  }

  if (boton.dataset.action === "avanzar") {
    const tarea = tareas.find(t => t.id === id);
    const indiceActual = SECUENCIA_ESTADOS.indexOf(tarea.estado);
    tarea.estado = SECUENCIA_ESTADOS[indiceActual + 1];

    actualizarEstadoEnDOM(id, tarea.estado);
    actualizarStats();
  }
});

/* ==========================================================================
   FILTRADO COMBINADO POR ESTADO Y PRIORIDAD
   ========================================================================== */

const btnsFiltroEstado = document.querySelectorAll(".btn-filtro-estado");

btnsFiltroEstado.forEach(btn => {
  btn.addEventListener("click", () => {
    btnsFiltroEstado.forEach(b => b.classList.remove("activo"));
    btn.classList.add("activo");
    filtroEstado = btn.dataset.estado;
    aplicarFiltros();
  });
});

document.querySelector("#select-filtro-prioridad").addEventListener("change", (e) => {
  filtroPrioridad = e.target.value;
  aplicarFiltros();
});

function aplicarFiltros() {
  const todasLasTareas = tablero.querySelectorAll(".tarea");

  todasLasTareas.forEach(elementoTarea => {
    const id = Number(elementoTarea.dataset.id);
    const tarea = tareas.find(t => t.id === id);

    const coincideEstado = filtroEstado === "todas" || tarea.estado === filtroEstado;
    const coincidePrioridad = filtroPrioridad === "todas" || tarea.prioridad === filtroPrioridad;

    elementoTarea.classList.toggle("oculta", !(coincideEstado && coincidePrioridad));
  });
}
