# SiliconBridge — Curso Interactivo y Laboratorio de C Embebido, Hardware y Normativa Aeroespacial (ECSS / NASA)

**SiliconBridge** es una plataforma educativa e interactiva en español diseñada para aprender **Programación en C Embebido y Arquitectura de Microcontroladores** desde los fundamentos del lenguaje C (`Módulo 0`) hasta la ingeniería de misión crítica espacial y de defensa (`Módulo 11`), combinando:

- **5 Microcontroladores Reales en Paralelo:**
  1. **ATmega328P** (8-bit AVR RISC — Arduino Uno)
  2. **STM32F401RE** (32-bit ARM Cortex-M4F — Estándar Industrial)
  3. **ESP32-C3** (32-bit RISC-V — IoT / Wi-Fi / BLE)
  4. **nRF52840** (32-bit ARM Cortex-M4F — Ultra-Low-Power, PPI & EasyDMA)
  5. **RP2040** (Dual-Core ARM Cortex-M0+ — SIO de 1 ciclo & máquinas PIO)
- **Teoría pensada para tomar apuntes en Cuaderno Físico:** Definiciones con su realidad física en silicio (transistores, biestables, buses), reglas de oro, fórmulas enmarcadas, tablas de referencia, esquemas paso a paso para dibujar a mano y casos prácticos resueltos.
- **Normativa Oficial Espacial y de Defensa Integrada:**
  - **Europa (ESA ECSS — Revisiones del 30 de abril de 2025):** `ECSS-E-ST-40C Rev.1` (Ingeniería de Software, incluidos los 14 Checks de verificación de código C del `Annex U.2` y las fórmulas de márgenes del `Annex M`) y `ECSS-Q-ST-80C Rev.2` (Aseguramiento de Producto Software, Categorías `A`, `B`, `C`, `D`, `HSIA`, propagación de criticidad y cobertura `100% MC/DC`).
  - **Estados Unidos (NASA / Aviónica / Defensa):** `NASA JPL Power of Ten` (10 Reglas de Gerard Holzmann), `NASA-STD-8739.8`, `RTCA DO-178C` (`DAL A..E`), `MIL-STD-882E` y `MISRA-C:2012`.

---

## Estructura del Curso (12 Módulos: `Módulo 0` a `Módulo 11`)

| Módulo | Título y Contenidos Clave | Laboratorio Asociado |
| :--- | :--- | :--- |
| **Módulo 0** | **Teoría Base de C Orientada a Hardware:** Variables, Hexadecimal (`0x`), Complemento a Dos, Endianness, Funciones, Punteros (`&` y `*`), Padding y Estructuras (`struct` y `->`). | `Lab 0: Base C: Punteros & Structs` |
| **Módulo 1** | **Aritmética de Bits, Máscaras y Punteros a Registros:** Operadores `&`, `\|`, `^`, `~`, `<<`, `>>`, `<stdint.h>` y anatomía de `*(volatile uint32_t *)0x...`. | `Lab 2` y `Lab 3: Editor C en Vivo` |
| **Módulo 2** | **Arquitectura de Memoria y Buses:** Mapa de 32 bits (`Flash`, `SRAM`, `MMIO`), secciones `.text`, `.rodata`, `.data`, `.bss`, `Stack` y *Clock Gating* (`RCC`). | `Lab 4: Memoria, DMA & ISR` |
| **Módulo 3** | **Electrónica Interna del Pin GPIO:** Transistores MOSFET P-MOS y N-MOS, *Push-Pull* vs *Open-Drain*, Alta Impedancia (`Hi-Z`), *Schmitt Trigger* y registros atómicos (`BSRR` / `W1TS` / `OUTSET`). | `Lab 1: Pinout & Rayos X` |
| **Módulo 4** | **El Compilador, `volatile` e Interrupciones (`ISR`):** Optimización `-O0` vs `-O2`, controlador `NVIC`, *Hardware Stacking Frame*, secciones críticas y eventos `PPI`. | `Lab 5: Compilador & volatile` |
| **Módulo 5** | **Temporizadores Hardware (`Timers`) y `PWM`:** Relojes, Prescaler (`PSC`), Auto-Reload (`ARR`), Capture/Compare (`CCR`), registros sombra (*Preload*) y bloques `PIO`. | `Lab 6: Analizador & PWM` |
| **Módulo 6** | **Protocolos de Comunicación Serie (`UART`, `I2C`, `SPI`):** Tramas físicas, *Baudrate*, colector abierto con `ACK/NACK`, modos `CPOL/CPHA` y *Ring Buffers FIFO*. | `Lab 6: Analizador & PWM` |
| **Módulo 7** | **Conversión Analógica-Digital (`SAR ADC`) y `DMA`:** Búsqueda binaria SAR, cuantización en coma fija sin `float`, filtrado digital EMA y transferencias `DMA` circulares. | `Lab 7: ADC SAR, PLL & WDG` |
| **Módulo 8** | **Arquitectura de Firmware Senior:** Capas `HAL`, Máquinas de Estados Finitos (`FSM`), `Watchdog Timer (IWDG)`, `RTOS` (Mutex, tareas) y modos de bajo consumo (`__WFI`). | `Lab 7: ADC SAR, PLL & WDG` |
| **Módulo 9** | **Proyectos Multi-Archivo y Librerías:** Organización `.h` vs `.c`, *Include Guards*, `static` (interno vs local), `const` en Flash, `union`, librerías `.a`, *Makefile* y *Linker Script* (`.ld` / `.map`). | `Lab 8: Librerías, Linker & Boot` |
| **Módulo 10** | **Nivel Senior Industrial:** Bootloaders y particionado `OTA` A/B (`SCB->VTOR`), diagnóstico forense de `HardFault` (`addr2line`, *Stack Painting* `0xDEADBEEF`), `MISRA-C`, control `PID` en coma fija Q8 y testing *Off-Target*. | `Lab 8: Librerías, Linker & Boot` |
| **Módulo 11** | **Normativa Aeroespacial y Defensa (`ECSS` vs `NASA`/`DO-178C`) y Hardware `Rad-Hard`:** Qué **SE PUEDE (`MAY`)**, **NO SE DEBE (`SHOULD NOT`)** y **ESTÁ PROHIBIDO (`SHALL NOT`)**, los 14 Checks `ECSS Annex U.2`, cobertura `100% MC/DC`, `HSIA`, radiación cósmica (`SEU`, `SEL`), memoria `EDAC Hamming`, `Memory Scrubbing`, votación `TMR 2-de-3` y fórmulas `ECSS Annex M`. | `Lab 9: ECSS/NASA & Rad-Hard` |

---

## Instalación y Ejecución Local

```bash
# 1. Instalar dependencias
npm install

# 2. Arrancar el servidor de desarrollo (http://localhost:5173)
npm run dev

# 3. Verificar tipos TypeScript y generar build de producción
npm run build
```
