# Post-contenido — Unidad 4: JavaScript Básico

## Descripción
Repositorio del laboratorio de la Unidad 4 de Programación Web. Contiene dos
partes que forman un mismo sistema interno de equipo: un **tablero de tareas**
(`parte-1-tablero-tareas/`) que organiza las tareas del equipo con
manipulación del DOM y eventos, y un **formulario de registro de
colaborador** (`parte-2-formulario-colaborador/`) que registra a quienes las
tomarían, con validación manual y la Constraint Validation API nativa del
navegador.

Ambas partes están escritas en JavaScript puro (sin librerías externas), usan
`const`/`let` en todo momento (nunca `var`) y aplican ES6 (arrow functions,
destructuring, template literals) de forma consistente.

## Parte 1 — Tablero de tareas del equipo
Tablero interactivo que permite:
- Crear tareas con título, descripción y prioridad.
- Avanzar el estado de una tarea (`pendiente → en-progreso → completada`) y
  eliminarla, con un **único listener delegado** en el tablero que distingue
  la acción a través del atributo `data-action`.
- Filtrar de forma **combinada** por estado y por prioridad al mismo tiempo.
- Ver estadísticas en tiempo real (`reduce()` para contar tareas por estado,
  `for...of` para recorrerlas siempre en el mismo orden).
- Un `switch` centraliza la clase CSS y la etiqueta visible de cada
  prioridad.

Ver `parte-1-tablero-tareas/`.

## Parte 2 — Formulario de registro de colaborador
Formulario con validación completa del lado del cliente:
- Campos de texto validados con la Constraint Validation API
  (`valueMissing`, `tooShort`, `typeMismatch`).
- Nombre de usuario validado reutilizando el atributo `pattern` del HTML
  (`patternMismatch`), sin duplicar la regla en una regex manual.
- Contraseña validada con reglas independientes (mayúscula, número, carácter
  especial) y un indicador visual de fortaleza en tiempo real.
- Campo condicional **"Equipo a cargo"**, que solo aparece y se exige cuando
  el rol elegido es *Líder de equipo*.
- Campo numérico de horas disponibles validado con `rangeUnderflow` y
  `rangeOverflow`.
- Checkbox de términos validado con `.checked` (no con `.value`).
- Control completo del evento `submit`: se cancela el envío por defecto, se
  ejecutan todas las validaciones y solo si todas pasan se muestra el
  mensaje de éxito y se limpia el formulario.

Ver `parte-2-formulario-colaborador/`.

## Decisiones de diseño

### Parte 1 — Generador de ID
**Estrategia elegida: A — closure / patrón módulo.**
`crearGeneradorId()` encapsula el contador en una variable local (`contador`)
que solo es accesible a través de la función `generarId()` que devuelve.
Se eligió esta estrategia porque el estado de la aplicación (`tareas`,
`filtroEstado`, `filtroPrioridad`) ya vive expuesto a nivel de módulo, y el
contador de IDs es distinto: nadie más en el archivo necesita leerlo ni
modificarlo directamente, solo pedir el siguiente valor. Encapsularlo en un
closure evita que un error en otra parte del código (por ejemplo, reasignar
o decrementar la variable por accidente) corrompa la generación de IDs, sin
sacrificar nada de simplicidad de uso: el resto del laboratorio solo llama a
`generarId()` igual que si fuera una variable global.

### Parte 1 — Actualización del DOM al avanzar estado
**Estrategia elegida: A — actualización dirigida (targeted update).**
Al avanzar el estado de una tarea, `actualizarEstadoEnDOM()` localiza
únicamente el nodo de esa tarea con `querySelector('[data-id="..."]')` y
modifica solo su clase de estado y el texto de su badge, sin tocar el resto
del tablero. Se eligió esta estrategia sobre la reconstrucción completa
porque, en un tablero que puede llegar a tener muchas tareas, recrear todos
los nodos del DOM en cada clic es trabajo innecesario cuando en realidad solo
cambió una tarjeta. El costo es que `actualizarEstadoEnDOM()` debe mantenerse
sincronizada manualmente con la estructura HTML que genera
`crearElementoTarea()` (si esa plantilla cambia, hay que recordar actualizar
también esta función), pero para el tamaño y la complejidad de este
laboratorio ese costo es menor que el de re-renderizar todo en cada acción.

### Parte 2 — Validación de contraseña
**Estrategia elegida: B — validaciones independientes encadenadas.**
`validarPassword()` revisa por separado si falta una mayúscula, un número o
un carácter especial, y muestra un mensaje distinto para cada caso. Se
eligió esta estrategia en lugar de la regex compuesta porque este es un
formulario que un colaborador real llenaría una sola vez: decirle
exactamente qué regla le falta ("Falta al menos un número") reduce la
cantidad de intentos fallidos frente a un mensaje genérico como "la
contraseña no es válida", que obligaría a adivinar cuál de las tres
condiciones no se cumplió. El costo en líneas de código adicionales se
considera aceptable a cambio de esa mejora en la experiencia de uso.

### Parte 2 — Campo condicional "equipo a cargo"
**Estrategia elegida: A — alternar el atributo `required` nativo.**
En el listener de `change` de `#rol` se asigna
`document.querySelector("#equipo").required = esLider`. Se eligió esta
estrategia porque, al dejar que el propio atributo `required` refleje si el
campo aplica o no, tanto `checkValidity()` como
`campo.validity.valueMissing` quedan sincronizados automáticamente con la
Constraint Validation API en cualquier punto del formulario, sin necesidad
de repetir la condición `rol === "lider"` en cada lugar donde se necesite
saber si el campo es obligatorio. Esto aprovecha la API del navegador tal
como está pensada, en vez de reimplementar a mano una lógica que el propio
`required` ya resuelve.


[luis Eduardo Herrera sperandio ]
