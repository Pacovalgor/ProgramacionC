# ProgramacionC — Reglas y Contexto del Proyecto

Este repositorio contiene **ProgramacionC**, una plataforma interactiva y libro de texto técnico en español para aprender **Programación en C Embebido, Arquitectura de Microcontroladores y Normativa Aeroespacial/Defensa (ECSS / NASA / DO-178C / MISRA-C)** desde cero (`Módulo 0`) hasta nivel Senior (`Módulo 11`).

## Reglas Estrictas de Diseño y Comportamiento para el Agente

1. **Idioma:** Todo el contenido pedagógico, interfaz, comentarios de código, explicaciones de hardware y respuestas al usuario deben estar siempre en **español**.
2. **Orientación a Cuaderno Físico (Prohibido añadir zonas de notas digitales):**
   - El usuario estudia escribiendo sus apuntes a mano en un **cuaderno físico de papel** porque al escribir a mano retiene los conceptos.
   - **NUNCA** añadas áreas de texto (`<textarea>`), editores de notas ni casillas de verificación ("Ya lo copié") para tomar apuntes en la web.
   - Presenta la teoría, definiciones, reglas de oro, fórmulas matemáticas, tablas comparativas, esquemas para dibujar a mano y ejemplos paso a paso de forma limpia en pantalla para que el usuario los estudie y transcriba a su cuaderno físico.
3. **Política de No Sobrescritura (Adición Incremental):**
   - Al ampliar módulos, capítulos, reglas, retos o laboratorios, **NUNCA sobrescribas ni elimines contenido existente**. Añade nuevas reglas, apartados, capítulos o módulos conservando íntegro el material previo.
4. **Cobertura Multi-Arquitectura (5 Microcontroladores Reales):**
   - Todos los módulos de código (`COURSE_MODULES` en `src/data/curriculumData.ts`) muestran implementaciones para los 5 chips del catálogo (`atmega328p`, `stm32f401`, `esp32c3`, `nrf52840`, `rp2040`) en 3 niveles de abstracción:
     1. `rawPointer`: Punteros crudos a registros (`*(volatile uint32_t *)0x...`).
     2. `cmsisStruct`: Estructuras oficiales del fabricante (`GPIOA->BSRR`, `NRF_P0->OUTSET`, `sio_hw->gpio_set`).
     3. `proDriver`: Abstracción profesional / HAL / algoritmos de producción.
5. **Mantenibilidad y Comentarios de Código:**
   - Mantén todo el código TypeScript/React y los bloques de datos perfectamente documentados mediante comentarios JSDoc y encabezados de sección claros en español.

## Mapa de Archivos de la Arquitectura

- `src/data/mcusData.ts`: Especificaciones técnicas, mapa de pines, mapa de memoria y registros reales de los 5 microcontroladores (**ATmega328P**, **STM32F401RE**, **ESP32-C3**, **nRF52840** y **RP2040**).
- `src/data/curriculumData.ts`: Los **12 Módulos del Curso (`Módulo 0` a `Módulo 11`)**, con el puente pedagógico (Mito superficial vs Datasheet vs Puente real), código en 3 niveles para los 5 MCUs y reto principal.
- `src/data/deepTheoryData.ts`: **26 Capítulos de Teoría Profunda** estilo libro de texto de ingeniería (`DEEP_THEORY_BY_MODULE`), con párrafos detallados, fórmulas destacadas (`formulas`), tablas de referencia (`table`), casos prácticos resueltos paso a paso (`workedExample`) y errores críticos de producción (`pitfalls`).
- `src/data/notebookAndExercisesData.ts`: Diccionario de definiciones con realidad en silicio (`definitions`), reglas de oro y referencias normativas ECSS/NASA (`goldenRules`), guía de dibujo de esquemas (`sketchDiagramSteps`), código canónico comentado (`annotatedCodeToCopy`), **36 retos prácticos de programación C** en 3 niveles por módulo (`codingChallenges`) y **55 preguntas de autoevaluación** (`extraQuizzes`).
- `src/components/InteractiveLabs.tsx`: Motor evaluador determinista de expresiones C (`evaluateEmbeddedCCode`) y las **10 Estaciones de Laboratorio Interactivo (`Lab 0` a `Lab 9`)**:
  - `Lab 0` (`c-memory-pointers`): Base C — Variables, Punteros (`&` / `*`), Endianness, Padding y Structs (`->`).
  - `Lab 1` (`gpio-xray`): Pinout & Rayos X — Transistores MOSFET P/N, Push-Pull vs Open-Drain, Ley de Ohm, Rebotes y RCC.
  - `Lab 2` (`register-gym`): Datasheet & Bits — Manipulación bit a bit en registros reales de 8 y 32 bits.
  - `Lab 3` (`c-live-editor`): Editor C en Vivo — Sandbox libre para evaluar sentencias C paso a paso.
  - `Lab 4` (`memory-bus`): Memoria, DMA & ISR — Mapa Flash/SRAM/MMIO, ráfagas DMA, Stack de ISR y Ring Buffer FIFO.
  - `Lab 5` (`compiler-volatile`): Compilador & `volatile` — Optimización `-O0` vs `-O2` y Condición de Carrera (`ODR |=` vs `BSRR =`).
  - `Lab 6` (`logic-analyzer`): Analizador Lógico & PWM — Osciloscopio digital para PWM (`PSC`, `ARR`, `CCR`) y tramas `UART`, `I2C`, `SPI`.
  - `Lab 7` (`peripherals-adc-wdg`): Periféricos — Conversor `SAR ADC` de 12 bits, Árbol de Reloj `PLL` y `Watchdog Timer (IWDG)`.
  - `Lab 8` (`multi-file-toolchain`): Librerías, Linker & Boot — Proyectos `.h`/`.c`, librerías `.a`, `const`/`union` y salto `Bootloader -> App (SCB->VTOR)`.
  - `Lab 9` (`space-defense-ecss`): Normativa Espacial `ECSS`/`NASA` & `Rad-Hard` — Simulador de radiación cósmica (`SEU`), votador `TMR 2-de-3`, `Memory Scrubbing`, calculadora oficial `ECSS Annex M` (`margin_memory` y Factor `S`) y certificador interactivo `100% MC/DC`.
- `src/App.tsx`: Interfaz principal unificada con barra de progreso persistente en `localStorage`, comparador de los 5 MCUs y vista simultánea de los 5 chips.
