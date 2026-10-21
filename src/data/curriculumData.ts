/**
 * @file curriculumData.ts
 * @description Plan de estudios estructurado en 12 Módulos (`Módulo 0` a `Módulo 11`),
 * desde los fundamentos de memoria, punteros y estructuras en C hasta arquitectura de
 * periféricos, linker scripts, bootloaders y normativa aeroespacial/defensa (ECSS / NASA / DO-178C).
 *
 * Estructura pedagógica de cada módulo (`CourseModule`):
 * 1. Puente Pedagógico en 3 columnas:
 *    - `superficialMyth`: Qué ocultan los tutoriales básicos tipo Arduino.
 *    - `overwhelmingDatasheet`: Extracto técnico real del Datasheet o estándar oficial.
 *    - `theBridgeExplanation`: Conexión física clara entre código C, registros y transistores.
 * 2. Implementación multi-arquitectura (`mcuCode`) para los 5 microcontroladores en 3 niveles:
 *    - `rawPointer`: Punteros `volatile` directos a direcciones hexadecimales MMIO.
 *    - `cmsisStruct`: Estructuras estándar CMSIS / SDK oficial del fabricante.
 *    - `proDriver`: Abstracción de producción desacoplada, segura y certificable.
 * 3. Escenario de diagnóstico práctico (`challenge`) basado en fallos reales de ingeniería.
 */

import { MCUId } from './mcusData';

/**
 * Identificador de la estación del Laboratorio Interactivo asociada a cada módulo.
 */
export type LabViewType =
  | 'c-memory-pointers'
  | 'gpio-xray'
  | 'register-gym'
  | 'c-live-editor'
  | 'memory-bus'
  | 'compiler-volatile'
  | 'logic-analyzer'
  | 'peripherals-adc-wdg'
  | 'multi-file-toolchain'
  | 'space-defense-ecss'
  | 'senior-rtos-can-pid-fault';

/**
 * Código C específico de un microcontrolador en los 3 niveles de abstracción industriales,
 * junto con la traducción a ensamblador (`asmInsight`) y notas de hardware (`hardwareNote`).
 */
export interface ModuleCodeByMCU {
  /** Nivel 1: Puntero crudo desreferenciado (`*(volatile uint32_t *)0x...`). */
  rawPointer: string;
  /** Nivel 2: Acceso mediante estructuras oficiales CMSIS / SDK (`GPIOA->BSRR`, `sio_hw->gpio_set`). */
  cmsisStruct: string;
  /** Nivel 3: Driver profesional modularizado y seguro para producción. */
  proDriver: string;
  /** Instrucciones máquina / ensamblador reales generadas por el compilador (`gcc -O2`). */
  asmInsight: string;
  /** Nota crítica sobre el comportamiento eléctrico o de bus en ese microcontrolador concreto. */
  hardwareNote: string;
}

/**
 * Reto principal de diagnóstico de ingeniería al final de cada módulo.
 */
export interface ModuleChallenge {
  question: string;
  scenario: string;
  options: {
    id: string;
    label: string;
    isCorrect: boolean;
    feedback: string;
  }[];
}

/**
 * Definición completa de un Módulo del curso.
 */
export interface CourseModule {
  /** Índice numérico secuencial del módulo (`0` a `11`). */
  id: number;
  /** Identificador legible para URLs o referencias internas. */
  slug: string;
  /** Título completo del módulo. */
  title: string;
  /** Subtítulo descriptivo de los temas abordados. */
  subtitle: string;
  /** Nivel de profundidad técnica del módulo. */
  level: 'Fundamentos' | 'Intermedio' | 'Avanzado' | 'Experto Industrial';
  /** Tiempo estimado de estudio y transcripción al cuaderno físico. */
  duration: string;
  /** Estación de laboratorio interactivo que se selecciona automáticamente al abrir el módulo. */
  recommendedLab: LabViewType;
  /** Columna 1 del puente pedagógico: el mito superficial. */
  superficialMyth: string;
  /** Columna 2 del puente pedagógico: la jerga abrumadora del Datasheet/normativa. */
  overwhelmingDatasheet: string;
  /** Columna 3 del puente pedagógico: la explicación real que conecta software y hardware. */
  theBridgeExplanation: string;
  /** Puntos clave resumidos con fragmento de código representativo. */
  keyTakeaways: {
    title: string;
    concept: string;
    codeSnippet: string;
  }[];
  /** Diccionario con las implementaciones en C para cada uno de los 5 microcontroladores. */
  mcuCode: Record<MCUId, ModuleCodeByMCU>;
  /** Caso práctico de resolución de un bug de hardware/firmware. */
  challenge: ModuleChallenge;
}

/**
 * Lista ordenada de los 12 módulos del programa formativo (`Módulo 0` a `Módulo 11`).
 * Nota de mantenimiento: añadir nuevos módulos siempre al final del array conservando intactos los previos.
 */
export const COURSE_MODULES: CourseModule[] = [
  {
    id: 0,
    slug: 'fundamentos-lenguaje-c-variables-funciones-punteros-structs',
    title: 'Módulo 0: Teoría Base de C — Variables, Funciones, Punteros y Estructuras',
    subtitle: 'Cómo funcionan de verdad en memoria las variables, el sistema hexadecimal, las funciones, los punteros (& y *) y las estructuras (struct y ->) antes de tocar el hardware',
    level: 'Fundamentos',
    duration: '60 min',
    recommendedLab: 'c-memory-pointers',
    superficialMyth:
      'En los cursos de C de escritorio te enseñan variables, punteros y structs con ejemplos abstractos de "alumnos y notas" usando printf() y scanf(), sin mostrarte jamás cómo ocupan bytes reales en las direcciones de memoria.',
    overwhelmingDatasheet:
      'Cuando abres código embebido ves ((GPIO_TypeDef *)0x40020000UL)->ODR |= (1U << 5); o funciones void hal_init(const uart_cfg_t *cfg) y parece otro idioma porque nadie te enlazó la sintaxis de C con las direcciones físicas.',
    theBridgeExplanation:
      'Toda la magia de C se resume en una sola idea: la memoria del microcontrolador es un casillero gigante numerado byte a byte (en hexadecimal: 0x00, 0x01, 0x02...). 1) Una VARIABLE es ponerle nombre humano a una casilla. 2) Una FUNCIÓN es un bloque de instrucciones reutilizable al que es mejor pasarle la dirección de los datos (un puntero) que copiar cientos de bytes. 3) Un PUNTERO es simplemente una variable que guarda el número de casilla (la dirección) de otra variable: con "&" preguntas en qué casilla vive y con "*" abres esa casilla. 4) Un STRUCT es un molde de varias casillas seguidas, y la flecha "->" sirve para acceder a una casilla del molde a través de un puntero.',
    keyTakeaways: [
      {
        title: '1. Variables, Bytes y Hexadecimal (Por qué usamos 0x...)',
        concept: 'Cada byte tiene 8 bits. Escribir 32 bits en binario (0b0100000000000010...) es propenso a errores humanos. Como 4 bits (1 nibble) van de 0 a 15 (0..9, A..F), 1 dígito hexadecimal representa exactamente 4 bits, y 2 dígitos hexadecimales (ej. 0xFF) representan exactamente 1 byte (8 bits).',
        codeSnippet: `uint8_t  un_byte     = 0xFFU;        // 8 bits  (1 byte  en RAM, 0..255)\nuint16_t dos_bytes   = 0x1234U;      // 16 bits (2 bytes en RAM, 0..65535)\nuint32_t cuatro_bytes = 0x40020014UL; // 32 bits (4 bytes en RAM)`
      },
      {
        title: '2. Punteros y Funciones: Operador Dirección (&) vs Contenido (*)',
        concept: 'Si pasas una variable normal a una función, C hace una copia temporal (Paso por Valor) y no cambia la original. Si le pasas su dirección con "&" (Paso por Referencia mediante Puntero), la función usa "*" para modificar la variable original directamente en su casilla de RAM.',
        codeSnippet: `void triplicar_en_sitio(uint32_t *p_num) {\n    *p_num = (*p_num) * 3U; // '*' entra en la dirección y cambia el valor real\n}\n\nvoid main_demo(void) {\n    uint32_t rpm = 100U;\n    triplicar_en_sitio(&rpm); // '&' entrega la dirección donde vive 'rpm'\n    // ¡Ahora rpm vale 300!\n}`
      },
      {
        title: '3. Estructuras (struct), typedef y el Operador Flecha (->)',
        concept: 'Un struct agrupa varias variables en direcciones contiguas de memoria. Cuando tienes la estructura usas el punto (sensor.temp), pero cuando tienes un PUNTERO a la estructura usas la flecha (p_sensor->temp). ¡Así es exactamente como se controlan los periféricos en C!',
        codeSnippet: `typedef struct {\n    uint32_t MODER; // Offset +0 bytes\n    uint32_t ODR;   // Offset +4 bytes\n} Puerto_t;\n\nPuerto_t mi_puerto;\nPuerto_t *ptr = &mi_puerto;\nmi_puerto.ODR = 1U; // Acceso directo con PUNTO (.)\nptr->ODR      = 1U; // Acceso por puntero con FLECHA (->) ¡Equivale a (*ptr).ODR!`
      },
      {
        title: '4. Sufijos de Literales (U, UL) y las 6 Operaciones Sagradas de Bits',
        concept:
          'En C estándar, un número sin sufijo (como 1) es un entero con signo (signed int). Desplazarlo al bit 31 (1 << 31) provoca desbordamiento de signo y Comportamiento Indefinido (Undefined Behavior). Por eso en sistemas embebidos SIEMPRE usamos sufijos: "U" (Unsigned) y "UL" (Unsigned Long, 32 bits garantizados en cualquier arquitectura). Con ellos dominas las 6 operaciones elementales sobre cualquier registro.',
        codeSnippet: `// Las 6 Operaciones Sagradas para copiar en el Cuaderno Físico:\nREG |=  (1UL << n);             // 1. SET: Poner bit n a 1 (x | 0 = x)\nREG &= ~(1UL << n);             // 2. CLEAR: Poner bit n a 0 con NOT (~)\nREG ^=  (1UL << n);             // 3. TOGGLE: Conmutar bit n (0->1 o 1->0 con XOR)\nuint32_t b = (REG >> n) & 1UL;  // 4. READ: Extraer el valor del bit (devuelve 0 o 1)\nif ((REG & (1UL << n)) != 0UL)  // 5. TEST 1: Comprobar si el bit está activo\nif ((REG & (1UL << n)) == 0UL)  // 6. TEST 0: Comprobar si el bit está en bajo (ej. pulsador)`
      }
    ],
    mcuCode: {
      atmega328p: {
        rawPointer: `// ATmega328P (8-bit): Tamaño de Punteros y Variables en SRAM
#include <stdint.h>

// 1. Variable global (vive en SRAM a partir de la dirección 0x0100):
uint8_t velocidad_motor = 50U;

void actualizar_velocidad(uint8_t *p_vel, uint8_t nueva) {
    // p_vel ocupa 2 bytes (16 bits) porque el mapa de RAM de AVR tiene direcciones de 16 bits
    *p_vel = nueva; // Escribe 'nueva' dentro de la dirección apuntada por p_vel
}

void demo_avr(void) {
    actualizar_velocidad(&velocidad_motor, 120U);
}`,
        cmsisStruct: `// Agrupando un puerto de 8 bits de AVR con un struct C:
#include <stdint.h>

typedef struct {
    volatile uint8_t PIN;   // Offset +0 (ej. 0x23 PINB)
    volatile uint8_t DDR;   // Offset +1 (ej. 0x24 DDRB)
    volatile uint8_t PORT;  // Offset +2 (ej. 0x25 PORTB)
} AVR_Port_t;

void configurar_puerto_con_flecha(void) {
    // Creamos un puntero que apunta a donde empieza el Puerto B (0x23):
    AVR_Port_t * const puerto_b = (AVR_Port_t *)0x23U;

    puerto_b->DDR  |= (1U << 5); // Accede a 0x23 + 1 = 0x24 (DDRB)
    puerto_b->PORT |= (1U << 5); // Accede a 0x23 + 2 = 0x25 (PORTB)
}`,
        proDriver: `// Paso de estructuras de configuración por puntero constante (const struct *):
typedef struct {
    uint16_t baudrate;
    uint8_t  paridad;
    uint8_t  bits_datos;
} uart_config_t;

// Al usar 'const uart_config_t *cfg', solo pasamos 2 bytes de dirección en vez de copiar todo el struct:
void uart_init(const uart_config_t *cfg) {
    uint16_t b = cfg->baudrate; // Leemos con el operador flecha (->)
    (void)b;
}`,
        asmInsight: 'En el ATmega328P los punteros miden 16 bits (2 bytes) y se cargan en las parejas de registros X (R27:R26), Y (R29:R28) o Z (R31:R30).',
        hardwareNote: 'Entender que puerto_b->PORT simplemente suma el offset +2 a la dirección base 0x23 te desvela cómo funcionan todas las librerías de hardware.'
      },
      stm32f401: {
        rawPointer: `// STM32F401 (32-bit ARM): Variables, Punteros de 32 bits y Aritmética de Direcciones
#include <stdint.h>

uint32_t lectura_sensor = 1024UL; // Ocupa 4 bytes en SRAM (ej. 0x20000000..0x20000003)

void modificar_por_puntero(void) {
    // 1. Declaramos un puntero p que guarda la dirección de 'lectura_sensor':
    uint32_t *p = &lectura_sensor;

    // 2. Desreferenciamos con '*' para cambiar el contenido de esa dirección:
    *p = 2048UL; // Ahora lectura_sensor vale 2048
}`,
        cmsisStruct: `// El secreto mejor guardado de STM32 (CMSIS): ¿Qué es realmente "GPIOA->ODR"?
#include <stdint.h>

typedef struct {
    volatile uint32_t MODER;   // +0x00 (4 bytes)
    volatile uint32_t OTYPER;  // +0x04 (4 bytes)
    volatile uint32_t OSPEEDR; // +0x08 (4 bytes)
    volatile uint32_t PUPDR;   // +0x0C (4 bytes)
    volatile uint32_t IDR;     // +0x10 (4 bytes)
    volatile uint32_t ODR;     // +0x14 (4 bytes -> 20 en decimal)
    volatile uint32_t BSRR;    // +0x18 (4 bytes -> 24 en decimal)
} GPIO_TypeDef;

// GPIOA es simplemente la dirección 0x40020000 convertida en puntero a ese struct:
#define GPIOA  ((GPIO_TypeDef *)0x40020000UL)

void encender_led(void) {
    // Al usar la flecha (->), C suma automáticamente 0x40020000 + 0x14 = 0x40020014:
    GPIOA->ODR |= (1UL << 5);
}`,
        proDriver: `// Uso de "static" en C Embebido (Encapsulación y Estado Persistente):
static uint32_t llamadas_totales = 0UL; // 'static' fuera de función = privada a este archivo .c

uint32_t contar_pulsos(void) {
    static uint32_t acumulado = 0UL; // 'static' dentro de función = no se borra al salir!
    acumulado++;
    return acumulado;
}`,
        asmInsight: 'En un procesador de 32 bits como ARM Cortex-M4, todos los punteros (uint8_t *, uint32_t *, struct *) ocupan exactamente 4 bytes (32 bits).',
        hardwareNote: 'Fíjate cómo en GPIO_TypeDef cada uint32_t ocupa 4 bytes, por eso los offsets van de 4 en 4 (+0x00, +0x04, +0x08, +0x0C, +0x10, +0x14).'
      },
      esp32c3: {
        rawPointer: `// ESP32-C3 (32-bit RISC-V): Arrays, Punteros y Recorrido de Buffers
#include <stdint.h>

void procesar_trama_bytes(const uint8_t *buffer, uint32_t longitud) {
    // En C, el nombre de un array es la dirección de su primer elemento (&buffer[0])
    for (uint32_t i = 0; i < longitud; i++) {
        uint8_t byte_actual = *(buffer + i); // Idéntico a escribir buffer[i]
        (void)byte_actual;
    }
}`,
        cmsisStruct: `// En ESP-IDF se combinan 'struct' y 'union' para acceder o bien al registro entero
// de 32 bits (.val) o bien a un campo individual de bits:
#include <stdint.h>

typedef union {
    struct {
        uint32_t pin0_out : 1; // 1 bit
        uint32_t pin1_out : 1; // 1 bit
        uint32_t resto    : 30;
    };
    uint32_t val;              // Los 32 bits completos en la misma dirección
} registro_dual_t;`,
        proDriver: `// Retorno de códigos de estado (esp_err_t) + salida por puntero:
typedef int32_t err_t;

err_t leer_temperatura_i2c(int16_t *p_resultado_out) {
    if (p_resultado_out == (void *)0) {
        return -1; // ¡Siempre verificar que el puntero no sea NULL antes de usar *!
    }
    *p_resultado_out = 245; // 24.5 °C escritos en la variable del llamador
    return 0;               // 0 = Éxito (ESP_OK)
}`,
        asmInsight: 'En C una función solo puede devolver 1 valor con return; por eso en la industria devolvemos el código de error por return y entregamos los datos leídos a través de punteros.',
        hardwareNote: 'La unión (union) permite que dos miembros compartan exactamente la misma dirección de memoria.'
      },
      nrf52840: {
        rawPointer: `// nRF52840: Punteros y Arrays en Registros de Configuración
#include <stdint.h>

void array_y_punteros_demo(void) {
    uint32_t mediciones[4] = { 100UL, 200UL, 300UL, 400UL };
    uint32_t *ptr = mediciones; // Apunta a mediciones[0]

    // Como ptr es uint32_t* (4 bytes), sumar 1 a ptr avanza 4 bytes en RAM:
    uint32_t segundo = *(ptr + 1); // Lee mediciones[1] (200)
    (void)segundo;
}`,
        cmsisStruct: `// En Nordic, el puerto GPIO usa un array dentro de un struct:
typedef struct {
    volatile uint32_t OUT;         // +0x504
    volatile uint32_t OUTSET;      // +0x508
    volatile uint32_t OUTCLR;      // +0x50C
    volatile uint32_t IN;          // +0x510
    volatile uint32_t DIR;         // +0x514
    volatile uint32_t PIN_CNF[32]; // Array de 32 registros (uno por cada pin P0.00..P0.31)
} NRF_GPIO_Mini_t;`,
        proDriver: `// Punteros a Funciones (Callbacks de Eventos en BLE y Sensores):
typedef void (*evento_callback_t)(uint8_t pin, uint32_t timestamp);

void registrar_manejador(evento_callback_t cb) {
    if (cb != 0) {
        cb(13U, 10500UL); // Invoca la función cuya dirección nos pasaron por parámetro!
    }
}`,
        asmInsight: '¡Regla clave de aritmética de punteros!: sumar +1 a un uint8_t* suma 1 byte a la dirección, pero sumar +1 a un uint32_t* suma 4 bytes a la dirección.',
        hardwareNote: 'Los punteros a funciones permiten que un driver avise a tu aplicación cuando llega un paquete Bluetooth sin acoplar ambos archivos.'
      },
      rp2040: {
        rawPointer: `// RP2040: Punteros Constantes vs Punteros a Datos Constantes
#include <stdint.h>

void diferencias_const_punteros(void) {
    uint32_t dato = 10UL;

    // 1. Puntero a constante (No puedes cambiar *p1, pero sí a dónde apunta p1):
    const uint32_t *p1 = &dato;

    // 2. Puntero constante (Siempre apunta a la misma dirección física, ej. un periférico):
    volatile uint32_t * const reg_sio = (volatile uint32_t *)0xD0000014UL;
    *reg_sio = (1UL << 5);
    (void)p1;
}`,
        cmsisStruct: `// En el SDK de Raspberry Pi Pico, cada periférico tiene su struct terminado en _hw_t:
typedef struct {
    volatile uint32_t ctrl;
    volatile uint32_t status;
} io_pin_ctrl_t;

typedef struct {
    io_pin_ctrl_t io[30]; // Array de 30 structs (uno por cada pin GPIO0..GPIO29)
} iobank0_hw_t;

#define iobank0_hw ((iobank0_hw_t *)0x40014000UL)
// Uso combinando flecha (->), array ([5]) y punto (.):
// iobank0_hw->io[5].ctrl = 5UL;`,
        proDriver: `// Empaquetado y Alineación de Estructuras en Memoria (Padding):
typedef struct {
    uint32_t id_mensaje; // 4 bytes
    uint16_t crc;        // 2 bytes
    uint8_t  tipo;       // 1 byte
    uint8_t  longitud;   // 1 byte -> Total = 8 bytes exactos sin huecos (padding)!
} trama_can_t;`,
        asmInsight: 'Ordenar los miembros de un struct de mayor a menor tamaño (uint32_t primero, luego uint16_t y al final uint8_t) evita que el compilador inserte bytes vacíos de relleno (padding) en RAM.',
        hardwareNote: 'Mira la expresión iobank0_hw->io[5].ctrl: usa "->" porque iobank0_hw es un puntero, y luego usa "." porque io[5] ya es el struct en sí.'
      }
    },
    challenge: {
      question: 'Reto de Fundamentos C — Punteros (& vs *) y el Operador Flecha (->)',
      scenario:
        'Tienes definida una estructura typedef struct { volatile uint32_t MODER; volatile uint32_t ODR; } GPIO_t; y declaras un puntero que apunta a la dirección base del Puerto A: GPIO_t *puertoA = (GPIO_t *)0x40020000UL; ¿Cuáles dos expresiones son 100% equivalentes y correctas en C para escribir en el miembro ODR a través de ese puntero?',
      options: [
        {
          id: 'a',
          label: 'puertoA.ODR = 0x20;  y  &puertoA->ODR = 0x20;',
          isCorrect: false,
          feedback: 'Como puertoA es un PUNTERO a struct (no el struct directo), no puedes usar el punto (puertoA.ODR) directamente sin desreferenciarlo antes.'
        },
        {
          id: 'b',
          label: 'puertoA->ODR = 0x20;  y  (*puertoA).ODR = 0x20;',
          isCorrect: true,
          feedback: '¡Exacto! El operador flecha (puertoA->ODR) existe en C precisamente como un atajo limpio y legible para desreferenciar el puntero y acceder al campo: (*puertoA).ODR.'
        },
        {
          id: 'c',
          label: '*puertoA.ODR = 0x20;  y  puertoA = 0x20;',
          isCorrect: false,
          feedback: 'Cuidado con la precedencia de operadores: en *puertoA.ODR el punto tiene más prioridad que el asterisco, por lo que son obligatorios los paréntesis (*puertoA).ODR o usar la flecha ->.'
        }
      ]
    }
  },
  {
    id: 1,
    slug: 'c-para-hardware-bits-y-punteros',
    title: 'Módulo 1: C para Hardware — El Eslabón Perdido',
    subtitle: 'Tipos de ancho fijo (stdint.h), Gimnasio de Bits, Máscaras y cómo un número hexadecimal se convierte en un puntero al silicio',
    level: 'Fundamentos',
    duration: '45 min',
    recommendedLab: 'register-gym',
    superficialMyth:
      'En los cursos básicos usan "int" para todo, evitan los operadores de bits (&, |, ^, ~, <<) y te dicen que los punteros solo sirven para arrays dinámicos con malloc().',
    overwhelmingDatasheet:
      'Abres un código industrial y ves: *(volatile uint32_t *)0x40020000 = (*(volatile uint32_t *)0x40020000 & ~(3UL << 10)) | (1UL << 10); sin ninguna explicación.',
    theBridgeExplanation:
      'En sistemas embebidos NO existe un sistema operativo intermediario: un "registro de hardware" no es más que una dirección física de memoria cuyos bits están soldados físicamente a cables y transistores dentro del chip. Si dominas 4 operaciones de bits y entiendes cómo convertir una dirección del Datasheet (ej. 0x40020014) en un puntero de C, puedes controlar cualquier chip del mundo.',
    keyTakeaways: [
      {
        title: '1. Por qué prohibimos "int" y usamos <stdint.h>',
        concept: 'Un "int" mide 16 bits en un ATmega328P pero 32 bits en un STM32 o ESP32. En hardware, el tamaño del registro es fijo (8 o 32 bits), por lo que siempre usamos uint8_t, uint16_t y uint32_t.',
        codeSnippet: `#include <stdint.h>\nuint8_t  reg_avr   = 0x25U;        // Exactamente 8 bits (1 byte)\nuint32_t reg_stm32 = 0x40020014UL; // Exactamente 32 bits (4 bytes)`
      },
      {
        title: '2. Campos Multi-Bit y Librería de Macros Blindada (MISRA-C)',
        concept:
          'Cuando un registro agrupa 2, 3 o 4 bits juntos (como los modos de entrada/salida de GPIOx->MODER), aplicamos la técnica Clear & Insert: primero se limpian los bits con la máscara invertida y luego se inserta el valor nuevo. Además, protegemos las macros de bit-banging con dobles paréntesis para evitar trampas mortales de precedencia de operadores.',
        codeSnippet: `// 1. Modificación de Campo Multi-Bit (Clear & Insert):\nREG = (REG & ~(0x03UL << 10)) | ((nuevo_modo & 0x03UL) << 10);\n\n// 2. Macros Blindadas según Norma MISRA-C:2012:\n#define BIT(n)                     ((1UL) << (n))\n#define BIT_SET(reg, n)            ((reg) |= BIT(n))\n#define BIT_CLEAR(reg, n)          ((reg) &= ~BIT(n))\n#define FIELD_WRITE(reg, msk, pos, val) \\\n    ((reg) = ((reg) & ~((msk) << (pos))) | (((val) & (msk)) << (pos)))`
      },
      {
        title: '3. Anatomía de un Puntero a Registro Físico',
        concept: 'Cuando el Datasheet dice "GPIOA_ODR está en 0x40020014", le decimos al compilador C: trata ese número como la dirección de un entero sin signo de 32 bits volátil y accede a su contenido con el asterisco (*).',
        codeSnippet: `#define GPIOA_ODR  (*(volatile uint32_t *)0x40020014UL)\n// Ahora puedes escribir en el hardware como si fuera una variable:\nGPIOA_ODR |= (1UL << 5);`
      }
    ],
    mcuCode: {
      atmega328p: {
        rawPointer: `// ATmega328P: Registros de 8 bits (uint8_t)
// Dirección física de PORTB en memoria de datos: 0x0025
#include <stdint.h>

void bit_operations_demo(void) {
    // 1. Encender bit 5 sin alterar los bits 0..4 ni 6..7:
    *(volatile uint8_t *)0x25 |= (1U << 5);

    // 2. Apagar bit 5 usando máscara invertida (~(1 << 5) = 0b11011111):
    *(volatile uint8_t *)0x25 &= (uint8_t)~(1U << 5);

    // 3. Invertir (Toggle) bit 5 con XOR:
    *(volatile uint8_t *)0x25 ^= (1U << 5);
}`,
        cmsisStruct: `// Cómo lo define <avr/io.h> por debajo:
#define _MMIO_BYTE(mem_addr) (*(volatile uint8_t *)(mem_addr))
#define PORTB _MMIO_BYTE(0x25)
#define PB5   5

void bit_operations_demo(void) {
    PORTB |=  (1U << PB5); // Set bit 5
    PORTB &= ~(1U << PB5); // Clear bit 5
}`,
        proDriver: `// Macros industriales seguras para cualquier registro de 8/32 bits:
#define BIT_SET(reg, bit)      ((reg) |=  (1UL << (bit)))
#define BIT_CLEAR(reg, bit)    ((reg) &= ~(1UL << (bit)))
#define BIT_TOGGLE(reg, bit)   ((reg) ^=  (1UL << (bit)))
#define BIT_READ(reg, bit)     (((reg) >> (bit)) & 1UL)`,
        asmInsight: 'En AVR de 8 bits, (1U << 5) se calcula en tiempo de compilación (constante 0x20 = 0b00100000). No cuesta ni un ciclo de reloj en ejecución.',
        hardwareNote: 'En el ATmega328P cada bit de PORTB controla directamente 1 patilla física (relación 1:1).'
      },
      stm32f401: {
        rawPointer: `// STM32F401: Registros de 32 bits (uint32_t)
// GPIOA_MODER vive en 0x40020000 y usa 2 bits por cada pin
#include <stdint.h>

void configure_pa5_field(void) {
    volatile uint32_t * const pMODER = (volatile uint32_t *)0x40020000UL;

    // El pin 5 ocupa los bits [11:10] (5 * 2 = 10).
    // Paso 1: Limpiar ambos bits con ~(3UL << 10) (3 en binario es 11)
    // Paso 2: Escribir 01 en binario (1UL << 10)
    *pMODER = (*pMODER & ~(3UL << 10)) | (1UL << 10);
}`,
        cmsisStruct: `// Cómo mapea ARM CMSIS todos los registros de un puerto con un struct C:
typedef struct {
    volatile uint32_t MODER;   // Offset 0x00 (Dirección 0x40020000)
    volatile uint32_t OTYPER;  // Offset 0x04 (Dirección 0x40020004)
    volatile uint32_t OSPEEDR; // Offset 0x08 (Dirección 0x40020008)
    volatile uint32_t PUPDR;   // Offset 0x0C (Dirección 0x4002000C)
    volatile uint32_t IDR;     // Offset 0x10 (Dirección 0x40020010)
    volatile uint32_t ODR;     // Offset 0x14 (Dirección 0x40020014)
    volatile uint32_t BSRR;    // Offset 0x18 (Dirección 0x40020018)
} GPIO_TypeDef;

#define GPIOA ((GPIO_TypeDef *)0x40020000UL)`,
        proDriver: `// Función limpia para modificar cualquier campo multi-bit en registros de 32 bits:
static inline void reg32_write_field(volatile uint32_t *reg, uint8_t pos, uint32_t mask, uint32_t val) {
    *reg = (*reg & ~(mask << pos)) | ((val & mask) << pos);
}
// Uso: reg32_write_field(&GPIOA->MODER, 10U, 0x3UL, 0x1UL);`,
        asmInsight: 'Al usar un puntero a struct (GPIOA->ODR), el compilador ARM usa direccionamiento con desplazamiento inmediato: str r2, [r3, #20] (+0x14 bytes desde la base).',
        hardwareNote: 'Observa cómo una estructura C (struct) cuyos miembros son uint32_t encaja byte a byte con la tabla de offsets del Reference Manual de ST.'
      },
      esp32c3: {
        rawPointer: `// ESP32-C3 (RISC-V 32-bit): Registros mapeados desde 0x60004000
#include <stdint.h>

void esp32_raw_bit_demo(void) {
    // Registro de salida tradicional GPIO_OUT_REG en 0x60004004:
    *(volatile uint32_t *)0x60004004UL |= (1UL << 5);

    // Registro atómico Write-1-to-Set en 0x60004008:
    *(volatile uint32_t *)0x60004008UL = (1UL << 5);
}`,
        cmsisStruct: `// En ESP-IDF se usan uniones C (union + struct bitfields) sobre la dirección física:
typedef union {
    struct {
        uint32_t bt_select: 32;
    };
    uint32_t val;
} gpio_out_w1ts_reg_t;`,
        proDriver: `#define REG_WRITE(addr, val)    (*(volatile uint32_t *)(addr) = (uint32_t)(val))
#define REG_SET_BIT(addr, bit)  (*(volatile uint32_t *)(addr) |= (1UL << (bit)))`,
        asmInsight: 'En RISC-V las constantes de dirección de 32 bits se cargan con la instrucción LUI (Load Upper Immediate) seguida de LW/SW.',
        hardwareNote: 'Siempre añade el sufijo UL (Unsigned Long) al desplazar bits en registros de 32 bits: (1UL << 31) evita desbordamiento de entero con signo.'
      },
      nrf52840: {
        rawPointer: `// nRF52840: Array de registros PIN_CNF[32] a partir de 0x50000700
#include <stdint.h>

void nrf_configure_pin5(void) {
    // Cada pin tiene su propio uint32_t: Pin 5 está en 0x50000700 + (5 * 4) = 0x50000714
    volatile uint32_t * const pPIN_CNF = (volatile uint32_t *)0x50000700UL;
    pPIN_CNF[5] = (1UL << 0) | (3UL << 2); // DIR=Output (bit 0), PULL=PullUp (bits 3:2)
}`,
        cmsisStruct: `typedef struct {
    volatile uint32_t RESERVED0[321];
    volatile uint32_t OUT;          // 0x504
    volatile uint32_t OUTSET;       // 0x508
    volatile uint32_t OUTCLR;       // 0x50C
    volatile uint32_t IN;           // 0x510
    volatile uint32_t DIR;          // 0x514
    volatile uint32_t DIRSET;       // 0x518
    volatile uint32_t DIRCLR;       // 0x51C
    volatile uint32_t LATCH;        // 0x520
    volatile uint32_t DETECTMODE;   // 0x524
    volatile uint32_t RESERVED1[118];
    volatile uint32_t PIN_CNF[32];  // 0x700..0x77C (¡Un array en hardware!)
} NRF_GPIO_Type;`,
        proDriver: `static inline void nrf_pin_cfg_output(uint8_t pin) {
    NRF_P0->PIN_CNF[pin] = 0x00000003UL;
}`,
        asmInsight: 'Indexar un array en C sobre un puntero a periférico (NRF_P0->PIN_CNF[pin]) calcula automáticamente base + (pin * 4) en una sola instrucción.',
        hardwareNote: 'Fíjate en los arrays RESERVED dentro del struct: sirven de relleno (padding) para que los campos coincidan con los huecos de direcciones del chip.'
      },
      rp2040: {
        rawPointer: `// RP2040: Control de pines en 0xD0000000 (SIO) y Aliases Atómicos
#include <stdint.h>

void rp2040_bit_magic(void) {
    // Encender bit 5 en SIO_GPIO_OUT_SET (0xD0000014):
    *(volatile uint32_t *)0xD0000014UL = (1UL << 5);
}`,
        cmsisStruct: `typedef struct {
    volatile uint32_t cpuid;        // 0x000
    volatile uint32_t gpio_in;      // 0x004
    volatile uint32_t gpio_hi_in;   // 0x008
    uint32_t _pad0;
    volatile uint32_t gpio_out;     // 0x010
    volatile uint32_t gpio_set;     // 0x014
    volatile uint32_t gpio_clr;     // 0x018
    volatile uint32_t gpio_togl;    // 0x01C
} sio_hw_t;
#define sio_hw ((sio_hw_t *)0xD0000000UL)`,
        proDriver: `// Uso de los Aliases de Hardware del RP2040 para modificar bits sin que la CPU lea:
#define hw_set_alias_untyped(addr) ((void *)((uintptr_t)(addr) | 0x2000u))
#define hw_clear_alias_untyped(addr) ((void *)((uintptr_t)(addr) | 0x3000u))`,
        asmInsight: 'El RP2040 intercepta las direcciones con el bit 0x2000 activo en el decodificador de bus y realiza la operación OR directamente en silicio.',
        hardwareNote: 'Entender punteros en C te permite aprovechar estos alias de hardware que serían imposibles de expresar en lenguajes de alto nivel.'
      }
    },
    challenge: {
      question: 'Reto de Ingeniería — Limpieza y Escritura de un Campo de 2 Bits',
      scenario:
        'En el registro GPIOA_MODER (32 bits), el Pin PA5 se configura con los bits [11:10]. Actualmente esos bits valen 11 (Modo Analógico) y quieres cambiarlos a 01 (Modo Salida) SIN alterar ningún otro pin del puerto. ¿Cuál es la línea de C correcta?',
      options: [
        {
          id: 'a',
          label: 'GPIOA->MODER = (1UL << 10);',
          isCorrect: false,
          feedback: '¡Peligro! Al usar "=" directo borraste a 0 la configuración de los otros 15 pines del Puerto A (incluidos los pines de depuración SWD PA13 y PA14).'
        },
        {
          id: 'b',
          label: 'GPIOA->MODER |= (1UL << 10);',
          isCorrect: false,
          feedback: '¡Trampa clásica! Como los bits [11:10] valían 11 en binario, hacer OR con 01 deja los bits en 11 (porque 1 | 0 sigue siendo 1). Primero debes limpiar ambos bits.'
        },
        {
          id: 'c',
          label: 'GPIOA->MODER = (GPIOA->MODER & ~(3UL << 10)) | (1UL << 10);',
          isCorrect: true,
          feedback: '¡Exacto! ~(3UL << 10) pone a 0 únicamente los bits 11 y 10 (porque 3 en binario es 11), respetando los otros 30 bits, y luego | (1UL << 10) escribe el valor 01.'
        }
      ]
    }
  },

  {
    id: 2,
    slug: 'arquitectura-mapa-memoria-y-relojes-rcc',
    title: 'Módulo 2: Mapa de Memoria, Buses y el Secreto del Reloj (RCC)',
    subtitle: 'Dónde viven Flash, RAM y Periféricos, y por qué un chip industrial de 32 bits ignora tu código si no activas el Clock Gate',
    level: 'Fundamentos',
    duration: '50 min',
    recommendedLab: 'memory-bus',
    superficialMyth:
      'En Arduino o PC escribes variables y llamas funciones sin preguntarte si viven en Flash o RAM, ni qué bus las transporta, porque el entorno inicializa todo a máxima potencia por detrás.',
    overwhelmingDatasheet:
      'El capítulo 2 del Reference Manual te muestra un diagrama críptico de "System Architecture: I-Bus, D-Bus, S-Bus, AHB1, APB1, APB2" y una tabla de memoria desde 0x00000000 hasta 0xFFFFFFFF.',
    theBridgeExplanation:
      'Imagina el procesador como una oficina central y la memoria como una avenida con números de portal (direcciones). Del portal 0x08000000 al 0x0807FFFF está el archivo permanente (Flash, donde viven tu código y constantes "const"). Del 0x20000000 en adelante está tu mesa de trabajo temporal (SRAM, variables y Stack). Y a partir del 0x40000000 NO hay memoria: ¡esos portales están conectados por autopistas (buses AHB/APB) a los interruptores de los periféricos (MMIO)! Además, en chips modernos cada periférico tiene una llave de paso de reloj (RCC) apagada de fábrica para no gastar batería.',
    keyTakeaways: [
      {
        title: '1. Flash vs SRAM: El poder de la palabra clave "const"',
        concept: 'En un microcontrolador tienes mucha más Flash que RAM. Si declaras una tabla grande sin "const", el código de arranque la copia a la preciada RAM. Con "const", se queda en Flash.',
        codeSnippet: `// MAL: Gasta 1024 bytes de preciosa SRAM:\nuint32_t tabla_seno[256] = { 0, 12, 25, ... };\n\n// BIEN: "const" la deja grabada en Flash (0 bytes de SRAM):\nconst uint32_t tabla_seno[256] = { 0, 12, 25, ... };`
      },
      {
        title: '2. El Secreto #1 de ARM: Clock Gating (RCC)',
        concept: 'Un transistor CMOS solo consume energía cuando cambia de estado (conmuta con el reloj). Por eso, al encender un STM32, todos los periféricos tienen el reloj desconectado. Antes de tocar un GPIO o UART, debes activar su bit en el registro RCC.',
        codeSnippet: `// Si escribes en GPIOA sin encender antes su reloj en RCC, ¡no pasa nada!\nRCC->AHB1ENR |= (1UL << 0); // 1º Abre la llave de reloj del Puerto A\n(void)RCC->AHB1ENR;         // 2º Lectura dummy para esperar 2 ciclos a que estabilice`
      },
      {
        title: '3. Buses de Alta Velocidad (AHB/SIO) vs Periféricos Lentos (APB)',
        concept: 'Los pines GPIO necesitan conmutar a decenas de MHz, por lo que van conectados al bus rápido AHB1 (STM32) o directamente al puerto de 1 ciclo SIO (RP2040). Periféricos lentos como I2C o UART van en el bus APB.',
        codeSnippet: `// En STM32F4:\n// GPIOA está en AHB1 (84 MHz) -> 0x40020000\n// USART2 está en APB1 (42 MHz) -> 0x40004400`
      }
    ],
    mcuCode: {
      atmega328p: {
        rawPointer: `// ATmega328P: Relojes activos por defecto + Arquitectura Harvard Separada
#include <avr/pgmspace.h>

// En AVR, la Flash y la RAM están en buses separados (ambos empiezan en 0x0000).
// Para guardar constantes en Flash sin gastar los 2KB de RAM se usa PROGMEM:
const uint8_t lut_flash[4] PROGMEM = { 0x10, 0x20, 0x40, 0x80 };

uint8_t leer_constante(uint8_t idx) {
    return pgm_read_byte(&lut_flash[idx]); // Usa la instrucción especial LPM
}`,
        cmsisStruct: `// En AVR puedes apagar relojes manualmente en el Power Reduction Register (PRR):
#include <avr/io.h>

void disable_unused_peripherals(void) {
    PRR |= (1U << PRADC) | (1U << PRTIM1); // Apaga reloj de ADC y Timer1 para ahorrar mA
}`,
        proDriver: `// Mapa de secciones en el Linker de AVR:
// .text   -> Flash (Código e instrucciones)
// .data   -> variables globales con valor inicial (copiadas de Flash a RAM al arrancar)
// .bss    -> variables globales inicializadas a 0`,
        asmInsight: 'Como AVR es Harvard puro, una instrucción normal LD (Load) siempre busca en SRAM. Para leer Flash el compilador debe emitir la instrucción LPM (Load Program Memory).',
        hardwareNote: 'En el ATmega328P los puertos GPIO siempre tienen reloj desde el primer ciclo tras el reset.'
      },
      stm32f401: {
        rawPointer: `// STM32F401: Activación obligatoria de reloj en RCC antes de configurar el periférico
#define RCC_AHB1ENR   (*(volatile uint32_t *)0x40023830UL)
#define RCC_APB1ENR   (*(volatile uint32_t *)0x40023840UL)

void system_clocks_enable(void) {
    RCC_AHB1ENR |= (1UL << 0);  // Bit 0: Habilita reloj de GPIOA en bus AHB1 (84 MHz)
    RCC_APB1ENR |= (1UL << 17); // Bit 17: Habilita reloj de USART2 en bus APB1 (42 MHz)
}`,
        cmsisStruct: `#include "stm32f4xx.h"

void system_clocks_enable(void) {
    RCC->AHB1ENR |= RCC_AHB1ENR_GPIOAEN;
    __DSB(); // Data Synchronization Barrier: asegura que el reloj llegó al silicio
}`,
        proDriver: `// Tabla constante en Flash (0x0800xxxx) gracias a la arquitectura unificada ARM:
static const uint16_t gamma_table[8] = { 0, 4, 16, 64, 128, 256, 512, 1023 };
// En ARM Cortex-M un puntero normal lee Flash directamente por el D-Code Bus sin macros especiales!`,
        asmInsight: 'En ARM Cortex-M existe un solo mapa de 4 GB: la instrucción LDR lee tanto de Flash (0x08000000), como de RAM (0x20000000) o de un periférico (0x40020000).',
        hardwareNote: 'Activa o desactiva el interruptor de reloj RCC en el simulador de abajo para ver cómo el periférico queda aislado cuando el reloj vale 0.'
      },
      esp32c3: {
        rawPointer: `// ESP32-C3: Registro de habilitación de relojes periféricos SYSTEM_PERIP_CLK_EN0_REG
#define SYSTEM_PERIP_CLK_EN0_REG (*(volatile uint32_t *)0x600C0010UL)

void enable_timers_and_uart_clk(void) {
    SYSTEM_PERIP_CLK_EN0_REG |= (1UL << 2) | (1UL << 13); // UART0 y TimerGroup0
}`,
        cmsisStruct: `// En ESP32 las funciones críticas se colocan en RAM de Instrucciones (IRAM):
#include "esp_attr.h"

// Constante en Flash mapeada por caché (0x3C000000):
const uint32_t calibration_factors[4] = { 100, 200, 300, 400 };`,
        proDriver: `// El controlador de sistema permite hacer Reset + Clock Gate a cada periférico:
static inline void periph_ll_enable_clk(uint32_t mask) {
    SYSTEM.perip_clk_en0.val |= mask;
    SYSTEM.perip_rst_en0.val &= ~mask; // Saca al periférico del estado de Reset
}`,
        asmInsight: 'Además del Clock Gate, muchos chips industriales tienen un registro de Reset por periférico (PERIP_RST_EN) para reiniciar un bloque I2C/SPI colgado sin reiniciar la CPU.',
        hardwareNote: 'En ESP32-C3 el bloque GPIO básico ya nace con el reloj habilitado por el ROM Bootloader.'
      },
      nrf52840: {
        rawPointer: `// nRF52840: Gestión automática de relojes bajo demanda (On-Demand Clock Request)
#define CLOCK_TASKS_HFCLKSTART (*(volatile uint32_t *)0x40000000UL)
#define CLOCK_EVENTS_HFCLKSTARTED (*(volatile uint32_t *)0x40000100UL)

void start_high_freq_crystal(void) {
    CLOCK_TASKS_HFCLKSTART = 1UL; // Dispara la tarea de arranque del cristal de 64 MHz
    while (CLOCK_EVENTS_HFCLKSTARTED == 0UL) { } // Espera al evento de estabilización
}`,
        cmsisStruct: `// En Nordic el hardware enciende el reloj del bus de un periférico automáticamente
// cuando escribes ENABLE = 1 en ese periférico, y lo apaga cuando entra en reposo:
NRF_UARTE0->ENABLE = UARTE_ENABLE_ENABLE_Enabled;`,
        proDriver: `// Control de retención de bancos de RAM en sueño profundo:
void power_configure_ram_retention(void) {
    NRF_POWER->RAM[0].POWER = 0x0003FFFFUL; // Mantiene encendidas las secciones necesarias
}`,
        asmInsight: 'Esta gestión automática de relojes por hardware es la razón por la que el nRF52840 domina el sector médico y wearable.',
        hardwareNote: 'Solo necesitas encender manualmente el cristal externo HFCLK cuando vas a usar la radio Bluetooth o USB.'
      },
      rp2040: {
        rawPointer: `// RP2040: Subsistema RESETS — cada periférico nace en estado de Reset hasta que lo liberas
#define RESETS_RESET       (*(volatile uint32_t *)0x4000C000UL)
#define RESETS_RESET_DONE  (*(volatile uint32_t *)0x4000C008UL)

void unreset_io_bank0(void) {
    RESETS_RESET &= ~(1UL << 5); // Quita el reset del bloque IO_BANK0 (bit 5)
    while ((RESETS_RESET_DONE & (1UL << 5)) == 0UL) { } // Espera confirmación de hardware
}`,
        cmsisStruct: `#include "hardware/regs/resets.h"
#include "hardware/structs/resets.h"

void init_gpio_subsystem(void) {
    hw_clear_bits(&resets_hw->reset, RESETS_RESET_IO_BANK0_BITS);
    while (!(resets_hw->reset_done & RESETS_RESET_IO_BANK0_BITS))tight_loop_contents();
}`,
        proDriver: `// Colocar una función crítica en SRAM para evitar latencia de caché QSPI XIP:
void __not_in_flash_func(fast_control_loop)(void) {
    sio_hw->gpio_togl = (1UL << 5);
}`,
        asmInsight: 'En RP2040, el SDK de C libera el reset de IO_BANK0 en el runtime_init antes de entrar en main(), pero en bare-metal puro debes liberar el bit 5 de RESETS_RESET.',
        hardwareNote: 'La ventana 0x20000000 de SRAM está dividida en 6 bancos paralelos para que los 2 núcleos no compitan por el mismo bus.'
      }
    },
    challenge: {
      question: 'Reto de Diagnóstico Real — "Mi código compila sin errores pero el pin no hace nada"',
      scenario:
        'Acabas de migrar de Arduino a un STM32F401 en C bare-metal. Escribes en main(): GPIOA->MODER |= (1U << 10); y GPIOA->ODR |= (1U << 5); El programa compila con 0 warnings, lo cargas en la placa y el pin PA5 sigue muerto en 0V. Al mirar con el depurador, los registros de GPIOA siguen todos en 0x00000000. ¿Por qué?',
      options: [
        {
          id: 'a',
          label: 'Porque el pin PA5 está quemado o necesita una resistencia externa.',
          isCorrect: false,
          feedback: 'Incluso sin nada conectado al pin, el registro interno GPIOA->MODER debería haber guardado el valor escrito si el periférico estuviera recibiendo reloj.'
        },
        {
          id: 'b',
          label: 'Olvidaste habilitar el reloj del periférico GPIOA en el bus AHB1 (RCC->AHB1ENR |= (1U << 0)).',
          isCorrect: true,
          feedback: '¡Exacto! Sin reloj en el bus AHB1, los flip-flops internos de los registros de GPIOA no conmutan e ignoran cualquier escritura de la CPU.'
        },
        {
          id: 'c',
          label: 'Porque en STM32 no se puede usar el operador |= sobre registros.',
          isCorrect: false,
          feedback: 'Sí se puede usar |= sobre MODER y ODR siempre que el reloj del puerto haya sido habilitado previamente en RCC.'
        }
      ]
    }
  },

  {
    id: 3,
    slug: 'gpio-a-nivel-silicio-transistores-y-atomicidad',
    title: 'Módulo 3: GPIO a Nivel de Silicio — MOSFETs, Open-Drain y Escritura Atómica',
    subtitle: 'Qué ocurre eléctricamente dentro del pin (Push-Pull vs Open-Drain, Pull-Up/Down) y cómo evitar corromper puertos con BSRR / W1TS',
    level: 'Intermedio',
    duration: '60 min',
    recommendedLab: 'gpio-xray',
    superficialMyth:
      'Te dicen que un pin es simplemente "INPUT" o "OUTPUT" y que entrega 1 o 0 por arte de magia.',
    overwhelmingDatasheet:
      'El Datasheet te muestra un esquemático lleno de transistores P-MOS, N-MOS, diodos de clamping, resistencias conmutadas, Schmitt Trigger y registros OTYPER, OSPEEDR, PUPDR y BSRR.',
    theBridgeExplanation:
      'Un pin digital tiene por dentro DOS interruptores electrónicos (transistores MOSFET): uno arriba conectado a +VCC (P-MOS) y otro abajo conectado a Tierra GND (N-MOS). En modo "Push-Pull", escribir un 1 cierra el P-MOS (empuja corriente hacia afuera a 3.3V/5V) y escribir un 0 cierra el N-MOS (absorbe corriente hacia 0V). En cambio, en modo "Open-Drain", ¡el transistor P-MOS de arriba se desconecta para siempre! Así el pin solo puede tirar la línea a 0V o soltarla en alta impedancia (vital para buses compartidos como I2C).',
    keyTakeaways: [
      {
        title: '1. Salida Push-Pull vs Open-Drain (Colector Abierto)',
        concept: 'Push-Pull conduce tanto hacia 3.3V como hacia 0V (ideal para LEDs, SPI, UART). Open-Drain solo conecta a 0V cuando escribes 0 y queda flotando cuando escribes 1, permitiendo que varios chips compartan un mismo cable con una resistencia Pull-Up sin hacer cortocircuito.',
        codeSnippet: `// Configurar PB6/PB7 como Open-Drain para I2C en STM32:\nGPIOB->OTYPER |= (1UL << 6) | (1UL << 7); // 0 = Push-Pull, 1 = Open-Drain\nGPIOB->PUPDR  |= (1UL << 12) | (1UL << 14); // Activa Pull-Up interna`
      },
      {
        title: '2. Entradas Flotantes y por qué existen Pull-Up / Pull-Down',
        concept: 'Un pin configurado como entrada tiene una impedancia altísima (megaohmios) y actúa como una antena que capta ruido electromagnético del aire (cambiando entre 0 y 1 al azar). Una resistencia Pull-Up lo mantiene suave en 3.3V hasta que el botón lo conecta a GND (0V).',
        codeSnippet: `// Botón conectado entre Pin y GND (Activo en Bajo):\n// Pin suelto = 1 (por Pull-Up) | Botón pulsado = 0 (conectado a GND)\nif ((GPIOC->IDR & (1UL << 13)) == 0UL) {\n    // ¡Botón presionado!\n}`
      },
      {
        title: '3. Operaciones Atómicas: Por qué ODR |= (1<<5) es peligroso con Interrupciones',
        concept: 'Hacer ODR |= (1<<5) obliga a la CPU a: 1) Leer ODR en un registro temporal, 2) Hacer OR, 3) Escribir en ODR. Si una interrupción salta entre el paso 1 y el 3 y modifica otro pin del Puerto A, al volver al paso 3 machacarás el cambio de la interrupción. Los registros BSRR / W1TS / OUTSET hacen el cambio en 1 solo golpe atómico.',
        codeSnippet: `// PELIGROSO si una interrupción usa otro pin de GPIOA:\nGPIOA->ODR |= (1UL << 5);          // 3 instrucciones (Read-Modify-Write)\n\n// SEGURO E INDUSTRIAL (1 sola instrucción de escritura):\nGPIOA->BSRR = (1UL << 5);          // Enciende PA5\nGPIOA->BSRR = (1UL << (5U + 16U)); // Apaga PA5 (bit 21)`
      }
    ],
    mcuCode: {
      atmega328p: {
        rawPointer: `// ATmega328P: Entrada con Pull-Up en PD2 y Salida Push-Pull en PB5
#define DDRB_REG   (*(volatile uint8_t *)0x24)
#define PORTB_REG  (*(volatile uint8_t *)0x25)
#define DDRD_REG   (*(volatile uint8_t *)0x2A)
#define PORTD_REG  (*(volatile uint8_t *)0x2B)
#define PIND_REG   (*(volatile uint8_t *)0x29)

void gpio_button_to_led(void) {
    DDRB_REG  |= (1U << 5);   // PB5 como Salida
    DDRD_REG  &= ~(1U << 2);  // PD2 como Entrada (0)
    PORTD_REG |= (1U << 2);   // Con DDRD2=0, poner PORTD2=1 activa la Pull-Up interna!

    if ((PIND_REG & (1U << 2)) == 0U) { // Botón pulsado lleva el pin a GND (0)
        PORTB_REG |= (1U << 5);         // Enciende LED
    }
}`,
        cmsisStruct: `#include <avr/io.h>

// Truco hardware AVR para simular Open-Drain:
// Mantén PORTx bit en 0 y conmuta DDRx entre 1 (tira a GND) y 0 (suelta en Hi-Z):
void open_drain_low(void)  { DDRB |=  (1U << DDB5); } // N-MOS conduce a 0V
void open_drain_high(void) { DDRB &= ~(1U << DDB5); } // Alta impedancia (Pull-Up sube a 5V)`,
        proDriver: `// Toggle atómico en 1 ciclo usando el hardware de PINB en ATmega328P:
static inline void avr_fast_toggle_pb5(void) {
    PINB = (1U << 5); // ¡Escribir 1 en PINx invierte PORTx en hardware sin hacer XOR!
}`,
        asmInsight: 'Para los puertos B, C y D (direcciones 0x20..0x3F), el compilador AVR emite la instrucción atómica SBI/CBI cuando modificas 1 solo bit.',
        hardwareNote: 'El ATmega328P no tiene registro OTYPER para Open-Drain nativo en GPIO general; se emula conmutando el registro de dirección DDRx.'
      },
      stm32f401: {
        rawPointer: `// STM32F401: Configuración completa de PA5 (Salida) y PC13 (Entrada con Pull-Up)
#define RCC_AHB1ENR  (*(volatile uint32_t *)0x40023830UL)
#define GPIOA_MODER  (*(volatile uint32_t *)0x40020000UL)
#define GPIOA_BSRR   (*(volatile uint32_t *)0x40020018UL)
#define GPIOC_MODER  (*(volatile uint32_t *)0x40020800UL)
#define GPIOC_PUPDR  (*(volatile uint32_t *)0x4002080CUL)
#define GPIOC_IDR    (*(volatile uint32_t *)0x40020810UL)

void gpio_industrial_init(void) {
    RCC_AHB1ENR |= (1UL << 0) | (1UL << 2); // Reloj para GPIOA (bit 0) y GPIOC (bit 2)
    GPIOA_MODER = (GPIOA_MODER & ~(3UL << 10)) | (1UL << 10); // PA5 = 01 (Output)
    GPIOC_MODER &= ~(3UL << 26);                              // PC13 = 00 (Input)
    GPIOC_PUPDR = (GPIOC_PUPDR & ~(3UL << 26)) | (1UL << 26); // PC13 = 01 (Pull-Up)
}`,
        cmsisStruct: `#include "stm32f4xx.h"

void gpio_atomic_control(void) {
    if ((GPIOC->IDR & GPIO_IDR_ID13) == 0UL) {
        GPIOA->BSRR = GPIO_BSRR_BS5; // Pone PA5 a 3.3V (bit 5)
    } else {
        GPIOA->BSRR = GPIO_BSRR_BR5; // Pone PA5 a 0V (bit 21 = 5 + 16)
    }
}`,
        proDriver: `typedef enum { GPIO_PULL_NONE = 0U, GPIO_PULL_UP = 1U, GPIO_PULL_DOWN = 2U } gpio_pull_t;

void hal_gpio_set_pull(GPIO_TypeDef *port, uint8_t pin, gpio_pull_t pull) {
    uint8_t pos = pin * 2U;
    port->PUPDR = (port->PUPDR & ~(3UL << pos)) | ((uint32_t)pull << pos);
}`,
        asmInsight: 'Escribir en GPIOA->BSRR utiliza "=" (no "|="), porque el hardware de BSRR ignora todos los bits que escribas en 0.',
        hardwareNote: 'Usa el laboratorio "Rayos X del Pin" abajo para conmutar entre Push-Pull y Open-Drain y ver cómo responden los MOSFET P y N.'
      },
      esp32c3: {
        rawPointer: `// ESP32-C3: Control atómico mediante W1TS (Set) y W1TC (Clear) + Pull-Up en IO_MUX
#define GPIO_ENABLE_W1TS_REG (*(volatile uint32_t *)0x60004024UL)
#define GPIO_OUT_W1TS_REG    (*(volatile uint32_t *)0x60004008UL)
#define GPIO_OUT_W1TC_REG    (*(volatile uint32_t *)0x6000400CUL)
#define GPIO_PIN5_REG        (*(volatile uint32_t *)0x60004088UL)

void esp32_gpio5_setup(bool open_drain) {
    if (open_drain) {
        GPIO_PIN5_REG |= (1UL << 2); // Bit 2 (PAD_DRIVER) = 1 -> Modo Open-Drain
    }
    GPIO_ENABLE_W1TS_REG = (1UL << 5);
    GPIO_OUT_W1TS_REG    = (1UL << 5);
}`,
        cmsisStruct: `#include "soc/gpio_struct.h"
#include "soc/io_mux_struct.h"

void esp32_set_input_pullup(uint8_t pin) {
    IO_MUX.gpio[pin].fun_ie = 1; // Habilita Input Buffer (Schmitt Trigger)
    IO_MUX.gpio[pin].fun_wpu = 1; // Habilita Weak Pull-Up interna
}`,
        proDriver: `static inline void esp_gpio_fast_set(uint8_t pin)   { GPIO.out_w1ts.val = (1UL << pin); }
static inline void esp_gpio_fast_clear(uint8_t pin) { GPIO.out_w1tc.val = (1UL << pin); }`,
        asmInsight: 'Tener registros separados W1TS y W1TC permite limpiar o encender cualquiera de los 22 pines con una sola instrucción SW en RISC-V.',
        hardwareNote: 'En ESP32 el control de dirección y salida vive en el bloque GPIO, mientras que las resistencias Pull-Up/Down físicas viven en el bloque IO_MUX.'
      },
      nrf52840: {
        rawPointer: `// nRF52840: Configuración integral en PIN_CNF y conmutación con OUTSET/OUTCLR
#define NRF_P0_OUTSET   (*(volatile uint32_t *)0x50000508UL)
#define NRF_P0_OUTCLR   (*(volatile uint32_t *)0x5000050CUL)
#define NRF_P0_IN       (*(volatile uint32_t *)0x50000510UL)
#define NRF_P0_PIN_CNF  ((volatile uint32_t *)0x50000700UL)

void nrf_gpio_setup(void) {
    // P0.11 como entrada con Pull-Up (DIR=0, INPUT=0 conectado, PULL=3 Pull-Up):
    NRF_P0_PIN_CNF[11] = (0UL << 0) | (0UL << 1) | (3UL << 2);
    // P0.13 como salida de alta corriente (DIR=1, INPUT=1 desconectado, DRIVE=3 H0H1):
    NRF_P0_PIN_CNF[13] = (1UL << 0) | (1UL << 1) | (3UL << 8);
}`,
        cmsisStruct: `#include "nrf.h"

void nrf_poll_button(void) {
    if ((NRF_P0->IN & (1UL << 11)) == 0UL) {
        NRF_P0->OUTCLR = (1UL << 13); // En placas Nordic DK los LEDs son activos en bajo
    } else {
        NRF_P0->OUTSET = (1UL << 13);
    }
}`,
        proDriver: `// Configuración Open-Drain en Nordic (Modo S0D1 = Standard 0, Disconnect 1):
static inline void nrf_set_open_drain(uint8_t pin) {
    NRF_P0->PIN_CNF[pin] = (1UL << 0) | (6UL << 8); // DRIVE = 6 (S0D1)
}`,
        asmInsight: 'El modo S0D1 desconecta físicamente el transistor P-MOS superior cuando el bit vale 1, igual que OTYPER en STM32.',
        hardwareNote: 'Nordic permite desconectar el Schmitt Trigger de entrada (bit INPUT=1) en pines de salida o analógicos para eliminar corrientes de fuga.'
      },
      rp2040: {
        rawPointer: `// RP2040: Bloques PADS_BANK0 (eléctrico), IO_BANK0 (multiplexor) y SIO (lógico)
#define PADS_BANK0_GPIO5     (*(volatile uint32_t *)0x4001C018UL)
#define IO_BANK0_GPIO5_CTRL  (*(volatile uint32_t *)0x4001402CUL)
#define SIO_GPIO_OE_SET      (*(volatile uint32_t *)0xD0000024UL)
#define SIO_GPIO_OUT_XOR     (*(volatile uint32_t *)0xD000001CUL)

void rp2040_gpio5_init(void) {
    PADS_BANK0_GPIO5 = (1UL << 6) | (1UL << 4) | (1UL << 1); // IE=1, Drive=4mA, Schmitt=1
    IO_BANK0_GPIO5_CTRL = 5UL;      // Conecta el pad al bloque SIO
    SIO_GPIO_OE_SET = (1UL << 5);   // Activa salida
    SIO_GPIO_OUT_XOR = (1UL << 5);  // Invierte el estado en 1 ciclo!
}`,
        cmsisStruct: `#include "hardware/structs/sio.h"
#include "hardware/structs/padsbank0.h"

void rp2040_enable_pullup(uint8_t pin) {
    hw_set_bits(&padsbank0_hw->io[pin], PADS_BANK0_GPIO0_PUE_BITS);
    hw_clear_bits(&padsbank0_hw->io[pin], PADS_BANK0_GPIO0_PDE_BITS);
}`,
        proDriver: `static inline void rp2040_toggle_mask(uint32_t mask) {
    sio_hw->gpio_togl = mask; // Operación XOR nativa en el bloque SIO
}`,
        asmInsight: 'Tener un registro XOR en hardware (0xD000001C) permite invertir un pin en 1 sola escritura STR sin leer el estado anterior.',
        hardwareNote: 'El RP2040 separa limpiamente la física eléctrica del pad (PADS_BANK0) de la lógica digital (SIO).'
      }
    },
    challenge: {
      question: 'Reto de Diseño Electrónico y Firmware — Bus Compartido y Condición de Carrera',
      scenario:
        'En tu proyecto industrial, el bucle main() enciende el pin PA5 mientras una interrupción de alta frecuencia (ISR) conmuta el pin PA6 en el mismo puerto GPIOA de un STM32. Si en main() escribes GPIOA->ODR |= (1U << 5); ¿qué problema crítico puede ocurrir?',
      options: [
        {
          id: 'a',
          label: 'Ninguno, porque son pines distintos (PA5 y PA6).',
          isCorrect: false,
          feedback: '¡Falso! Aunque sean pines distintos, comparten el mismo registro de 32 bits GPIOA->ODR. La CPU lee los 32 bits a la vez en un registro R0, y si la ISR salta antes de que main() guarde R0 de vuelta en ODR, main() sobrescribirá el cambio que hizo la ISR en PA6.'
        },
        {
          id: 'b',
          label: 'Una condición de carrera (Race Condition) por operación Read-Modify-Write; se soluciona usando GPIOA->BSRR = (1U << 5);',
          isCorrect: true,
          feedback: '¡Brillante! BSRR no lee el estado anterior del puerto: ejecuta una única escritura atómica donde los bits en 0 se ignoran en hardware, siendo 100% inmune a interrupciones.'
        },
        {
          id: 'c',
          label: 'Se quema el transistor P-MOS del pin PA5.',
          isCorrect: false,
          feedback: 'Es un fallo lógico de concurrencia en el registro, no un cortocircuito eléctrico.'
        }
      ]
    }
  },

  {
    id: 4,
    slug: 'compilador-volatile-interrupciones-nvic-y-stack',
    title: 'Módulo 4: El Misterio de "volatile", Interrupciones (ISR) y el NVIC',
    subtitle: 'Por qué el compilador con -O2 rompe tu código si olvidas volatile, y qué ocurre exactamente en la pila (Stack) cuando salta una interrupción',
    level: 'Intermedio',
    duration: '65 min',
    recommendedLab: 'compiler-volatile',
    superficialMyth:
      'Te dicen "pon volatile delante de la variable si usas interrupciones porque sí" sin mostrarte jamás el código ensamblador que genera el compilador con y sin volatile.',
    overwhelmingDatasheet:
      'El manual de programación ARM Cortex-M habla de "Exception Entry Automatic Hardware Stacking of R0-R3, R12, LR, PC, xPSR, Tail-Chaining, EXC_RETURN 0xFFFFFFF9 y prioridades NVIC IPR".',
    theBridgeExplanation:
      'El compilador de C es extremadamente listo pero "ciego" al mundo exterior: si ve un bucle while(flag == 0) y dentro del bucle nadie modifica "flag", al optimizar (-O2) lee "flag" UNA sola vez a un registro interno de la CPU y se queda dando vueltas para siempre sin volver a mirar la memoria RAM ni el registro del periférico. La palabra "volatile" le ordena al compilador: "¡Prohibido cachear esto en un registro de la CPU! Haz una lectura real (LDR) de la dirección de memoria en cada vuelta porque un periférico o una interrupción (ISR) puede cambiarla por detrás".',
    keyTakeaways: [
      {
        title: '1. Cuándo es OBLIGATORIO usar "volatile" en C Embebido',
        concept: 'Existen exactamente 3 sitios donde debes usar volatile siempre: 1) Punteros a registros de hardware (MMIO), 2) Variables globales compartidas entre una interrupción (ISR) y main(), y 3) Variables compartidas entre dos núcleos o con el controlador DMA.',
        codeSnippet: `volatile uint8_t boton_pulsado_flag = 0; // Compartida entre ISR y main()\n\nvoid EXTI15_10_IRQHandler(void) {\n    EXTI->PR = (1UL << 13);   // ¡Siempre limpiar la bandera de interrupción en hardware!\n    boton_pulsado_flag = 1;   // Avisa a main() y sal rápido\n}`
      },
      {
        title: '2. Qué pasa en la CPU cuando salta una Interrupción (Stack Frame)',
        concept: 'En cuanto llega la señal eléctrica al controlador NVIC: 1) La CPU termina la instrucción actual, 2) Guarda automáticamente 8 registros en el Stack (R0, R1, R2, R3, R12, LR, PC, xPSR) en 12 ciclos, 3) Busca la dirección de tu ISR en la Vector Table (Flash) y salta a ella.',
        codeSnippet: `// Regla de oro de las ISR:\n// ¡Nunca pongas delay_ms() ni printf() dentro de una ISR!\n// Haz el trabajo mínimo (leer registro / levantar flag) y sal en microsegundos.`
      },
      {
        title: '3. Limpiar el "Pending Bit" o sufrirás una Tormenta Infinita de Interrupciones',
        concept: 'Si entras a una interrupción y olvidas borrar la bandera del periférico (ej. EXTI->PR = (1<<13)), en el mismo nanosegundo en que la ISR termine, el NVIC verá la bandera todavía activa y volverá a entrar en bucle infinito congelando tu main().',
        codeSnippet: `// Limpieza Write-1-to-Clear (W1C) en el registro Pending de EXTI:\nEXTI->PR = (1UL << 13); // Se escribe un 1 (¡no un 0!) para limpiar la bandera`
      }
    ],
    mcuCode: {
      atmega328p: {
        rawPointer: `// ATmega328P: Configuración de Interrupción Externa INT0 (Pin PD2) y SREG
#define EICRA_REG  (*(volatile uint8_t *)0x69)
#define EIMSK_REG  (*(volatile uint8_t *)0x3D)
#define SREG_REG   (*(volatile uint8_t *)0x5F)

volatile uint32_t pulsos_contador = 0;

void ext_irq0_init(void) {
    EICRA_REG |= (1U << 1);  // ISC01=1, ISC00=0 -> Flanco de bajada en PD2
    EIMSK_REG |= (1U << 0);  // Habilita interrupción externa INT0
    SREG_REG  |= (1U << 7);  // Bit I = 1 (Habilita interrupciones globales -> sei())
}`,
        cmsisStruct: `#include <avr/io.h>
#include <avr/interrupt.h>

volatile uint8_t irq_event = 0;

ISR(INT0_vect) {
    irq_event = 1; // En AVR la bandera EIFR se limpia sola al entrar en INT0_vect
}`,
        proDriver: `// Sección crítica en AVR para leer una variable de 32 bits sin que la ISR la parta por la mitad:
uint32_t read_counter_safe(void) {
    uint8_t sreg_backup = SREG; // Guarda estado actual de interrupciones
    cli();                      // Desactiva interrupciones temporalmente
    uint32_t copy = pulsos_contador;
    SREG = sreg_backup;         // Restaura estado previo
    return copy;
}`,
        asmInsight: '¡Ojo en 8 bits! Leer un uint32_t en un ATmega328P requiere 4 instrucciones de 8 bits (LDS). Si una ISR salta tras leer el byte 2, leerás un número corrupto a menos que uses una sección crítica.',
        hardwareNote: 'En AVR, al entrar en una ISR el hardware apaga automáticamente el bit global de interrupciones (no hay anidamiento salvo que lo reactives).'
      },
      stm32f401: {
        rawPointer: `// STM32F401: Configuración de EXTI13 (Botón PC13) + Controlador NVIC (0xE000E100)
#define SYSCFG_EXTICR4 (*(volatile uint32_t *)0x40013814UL)
#define EXTI_IMR       (*(volatile uint32_t *)0x40013C00UL)
#define EXTI_FTSR      (*(volatile uint32_t *)0x40013C0CUL)
#define EXTI_PR        (*(volatile uint32_t *)0x40013C14UL)
#define NVIC_ISER1     (*(volatile uint32_t *)0xE000E104UL)

void exti13_baremetal_init(void) {
    SYSCFG_EXTICR4 = (SYSCFG_EXTICR4 & ~(0xFUL << 4)) | (2UL << 4); // Conecta Puerto C a EXTI13
    EXTI_FTSR |= (1UL << 13); // Disparo por flanco de bajada (Falling Trigger)
    EXTI_IMR  |= (1UL << 13); // Desenmascara línea 13
    NVIC_ISER1 = (1UL << (40 - 32)); // IRQ #40 (EXTI15_10) en banco ISER[1]
}`,
        cmsisStruct: `#include "stm32f4xx.h"

volatile uint32_t button_presses = 0;

void EXTI15_10_IRQHandler(void) {
    if (EXTI->PR & EXTI_PR_PR13) {
        EXTI->PR = EXTI_PR_PR13; // Limpia bandera escribiendo un 1 (W1C)
        button_presses++;
    }
}`,
        proDriver: `// Configuración de prioridad en el NVIC (Menor número = Mayor urgencia en ARM!):
void nvic_configure_priority(void) {
    NVIC_SetPriority(EXTI15_10_IRQn, 2U); // Prioridad 2 (0 es la máxima urgencia)
    NVIC_EnableIRQ(EXTI15_10_IRQn);
}`,
        asmInsight: 'En ARM Cortex-M las funciones ISR son funciones C normales (no necesitan atributos especiales) porque el hardware apila R0-R3 y LR automáticamente antes de entrar.',
        hardwareNote: '¡Recuerda que en ARM Cortex-M la prioridad 0 es MÁS urgente que la prioridad 5!'
      },
      esp32c3: {
        rawPointer: `// ESP32-C3: Configuración de Interrupción por flanco en GPIO_PIN9_REG
#define GPIO_PIN9_REG       (*(volatile uint32_t *)0x60004098UL)
#define GPIO_STATUS_W1TC    (*(volatile uint32_t *)0x6000404CUL)

void esp32_gpio9_irq_setup(void) {
    // Bits [9:7] = INT_TYPE (2 = Flanco de bajada), Bit 13 = INT_ENA para CPU
    GPIO_PIN9_REG = (GPIO_PIN9_REG & ~(7UL << 7)) | (2UL << 7) | (1UL << 13);
}`,
        cmsisStruct: `#include "esp_attr.h"
#include "soc/gpio_struct.h"

volatile bool event_ready = false;

void IRAM_ATTR gpio_isr_handler(void) {
    GPIO.status_w1tc.val = (1UL << 9); // Limpia bandera del pin 9
    event_ready = true;
}`,
        proDriver: `// En RISC-V el registro CSR mstatus controla las interrupciones globales (bit MIE):
static inline uint32_t riscv_enter_critical(void) {
    uint32_t prev;
    __asm__ volatile ("csrrci %0, mstatus, 8" : "=r"(prev)); // Limpia bit MIE (bit 3)
    return prev;
}`,
        asmInsight: 'En ESP32 colocamos IRAM_ATTR en la ISR para que el código viva en SRAM (0x40380000) y pueda ejecutarse incluso si la memoria Flash está ocupada.',
        hardwareNote: 'El controlador de interrupciones del ESP32-C3 permite mapear hasta 62 fuentes de periféricos a las 31 líneas de interrupción del núcleo RISC-V.'
      },
      nrf52840: {
        rawPointer: `// nRF52840: Periférico GPIOTE (GPIO Tasks and Events) en 0x40006000
#define GPIOTE_EVENTS_IN0  (*(volatile uint32_t *)0x40006100UL)
#define GPIOTE_INTENSET    (*(volatile uint32_t *)0x40006304UL)
#define GPIOTE_CONFIG0     (*(volatile uint32_t *)0x40006510UL)

void nrf_gpiote_irq_init(void) {
    // Modo=1 (Event), PSEL=11 (Pin P0.11), POLARITY=2 (HiToLo flanco bajada)
    GPIOTE_CONFIG0  = (1UL << 0) | (11UL << 8) | (2UL << 16);
    GPIOTE_INTENSET = (1UL << 0); // Habilita interrupción para canal 0
}`,
        cmsisStruct: `#include "nrf.h"

void GPIOTE_IRQHandler(void) {
    if (NRF_GPIOTE->EVENTS_IN[0] != 0UL) {
        NRF_GPIOTE->EVENTS_IN[0] = 0UL; // En Nordic los eventos se limpian escribiendo 0
        (void)NRF_GPIOTE->EVENTS_IN[0]; // Dummy read para sincronizar el puente APB
        NRF_P0->OUTSET = (1UL << 13);
    }
}`,
        proDriver: `// Bucle principal de ultra bajo consumo despertado por eventos:
void main_low_power_loop(void) {
    while (1) {
        __WFE(); // Duerme la CPU (1.5 uA) hasta que ocurra un evento o interrupción
    }
}`,
        asmInsight: 'Fíjate en la lectura dummy (void)NRF_GPIOTE->EVENTS_IN[0]: asegura que la escritura de limpieza haya atravesado el bus APB antes de que la CPU salga de la ISR.',
        hardwareNote: 'A diferencia de STM32 (donde limpias con un 1), en Nordic los registros EVENTS_xxx se limpian escribiendo un 0.'
      },
      rp2040: {
        rawPointer: `// RP2040: Interrupción por flanco en IO_BANK0 para el Core 0
#define IO_BANK0_PROC0_INTE0 (*(volatile uint32_t *)0x40014100UL)
#define IO_BANK0_INTR0       (*(volatile uint32_t *)0x400140F0UL)

void rp2040_enable_gpio5_falling_irq(void) {
    // Cada pin tiene 4 bits de evento (Level Low, Level High, Edge Low, Edge High)
    // Pin 5 * 4 = bit 20; Edge Low es el bit +2 -> bit 22
    IO_BANK0_PROC0_INTE0 |= (1UL << 22);
}`,
        cmsisStruct: `#include "hardware/structs/iobank0.h"

void isr_io_bank0(void) {
    // Limpia el evento Edge Low del Pin 5 escribiendo 1 (W1C):
    iobank0_hw->intr[0] = (1UL << 22);
}`,
        proDriver: `// Como el RP2040 tiene dos núcleos, tiene registros de interrupción separados
// para Core 0 (proc0_irq_ctrl) y Core 1 (proc1_irq_ctrl)!`,
        asmInsight: 'Tener matrices de interrupción separadas por núcleo permite dedicar el Core 1 exclusivamente a atender sensores en tiempo real sin molestar al Core 0.',
        hardwareNote: 'En RP2040 puedes elegir qué núcleo (Core 0 o Core 1) recibe la interrupción de cada pin.'
      }
    },
    challenge: {
      question: 'Reto del Compilador — El Bucle que Funciona en Debug (-O0) pero se Congela en Producción (-O2)',
      scenario:
        'Tienes uint8_t datos_listos = 0; que se pone a 1 dentro de la interrupción UART_IRQHandler(). En main() escribes: while (datos_listos == 0) { } Al compilar sin optimización (-O0) funciona, pero al activar optimización de producción (-O2) el programa se queda colgado en el while para siempre aunque la interrupción sí se ejecute. ¿Qué ocurrió a nivel ensamblador?',
      options: [
        {
          id: 'a',
          label: 'El nivel -O2 desactiva las interrupciones del microcontrolador.',
          isCorrect: false,
          feedback: 'El optimizador del compilador nunca desactiva las interrupciones de hardware.'
        },
        {
          id: 'b',
          label: 'Sin "volatile", el compilador con -O2 leyó "datos_listos" de la RAM una sola vez antes del bucle a un registro R3 y convirtió el bucle en un salto infinito comparando R3 consigo mismo.',
          isCorrect: true,
          feedback: '¡Exacto! Puedes comprobarlo ahora mismo en la pestaña "Compilador & volatile" de abajo: sin volatile, el compilador elimina la instrucción LDR de dentro del bucle.'
        },
        {
          id: 'c',
          label: 'La memoria RAM dejó de funcionar por exceso de velocidad.',
          isCorrect: false,
          feedback: 'La RAM sí tiene el valor 1 actualizado por la ISR, pero la CPU nunca vuelve a emitir una instrucción de lectura hacia la RAM.'
        }
      ]
    }
  },

  {
    id: 5,
    slug: 'timers-contadores-y-pwm-por-hardware',
    title: 'Módulo 5: Timers, Prescalers y PWM 100% por Hardware',
    subtitle: 'Por qué usar delay() es un pecado en la industria y cómo generar señales precisas al microsegundo con PSC, ARR y CCR',
    level: 'Avanzado',
    duration: '55 min',
    recommendedLab: 'logic-analyzer',
    superficialMyth:
      'Te enseñan a parpadear LEDs o medir tiempos con delay(1000) (bloqueando millones de ciclos de CPU) y a usar analogWrite() creyendo que el pin saca un voltaje analógico continuo.',
    overwhelmingDatasheet:
      'El diagrama de bloques del Timer general muestra docenas de flechas: CK_PSC, Prescaler 16-bit, Up/Down Counter CNT, Auto-Reload Register ARR, Capture/Compare CCR1..4 y Output Compare Mode OC1M = 110.',
    theBridgeExplanation:
      'Un Timer de hardware no es más que un cuentakilómetros electrónico independiente que suma +1 con cada pulso del reloj del bus sin usar la CPU. Tiene 3 registros que debes conocer: 1) Prescaler (PSC): divide la velocidad del reloj (ej. convierte 84 MHz en 1 MHz = 1 ticket por microsegundo), 2) Auto-Reload (ARR): el tope de la cuenta (cuando el contador CNT llega a ARR, vuelve a 0 y marca el Periodo de la señal), y 3) Capture/Compare (CCR): el punto de corte (mientras CNT < CCR el pin vale 3.3V, y cuando CNT >= CCR el pin baja a 0V). ¡Así nace el PWM por hardware con 0% de uso de CPU!',
    keyTakeaways: [
      {
        title: '1. La Fórmula Universal del Timer (Frecuencia y Periodo)',
        concept: 'Todos los microcontroladores del mercado cumplen la misma ecuación matemática para calcular la frecuencia de desbordamiento o PWM:',
        codeSnippet: `// F_timer = F_bus / ((PSC + 1) * (ARR + 1))\n// Ejemplo a 84 MHz para tener 1 kHz exacto (Periodo = 1000 us):\nTIM2->PSC = 84 - 1;   // 84 MHz / 84 = 1 MHz (1 cuenta cada 1 microsegundo)\nTIM2->ARR = 1000 - 1; // Cuenta de 0 a 999 (1000 microsegundos = 1 ms = 1 kHz)`
      },
      {
        title: '2. Cómo funciona el Ciclo de Trabajo (Duty Cycle) con CCR',
        concept: 'El comparador digital del Timer compara en cada ciclo el contador actual (CNT) contra tu registro CCR1. Si ARR = 999 y pones CCR1 = 250, el pin estará en ALTO el 25% del tiempo y en BAJO el 75%.',
        codeSnippet: `TIM2->CCR1 = 250; // 25% Duty Cycle\nTIM2->CCR1 = 750; // 75% Duty Cycle (el hardware conmuta el pin solo!)`
      },
      {
        title: '3. Cómo conectar el Timer al Pin Físico (Multiplexor AF)',
        concept: 'Para que la señal del Timer salga por la patilla física sin intervención de la CPU, cambiamos el modo del pin de "GPIO Output" a "Alternate Function" (AF) seleccionando el canal del Timer.',
        codeSnippet: `// En STM32F4, PA5 puede conectarse a TIM2_CH1 seleccionando AF1:\nGPIOA->MODER = (GPIOA->MODER & ~(3UL << 10)) | (2UL << 10); // 10 = Alternate Function\nGPIOA->AFR[0] = (GPIOA->AFR[0] & ~(0xFUL << 20)) | (1UL << 20); // AF1 = TIM2`
      }
    ],
    mcuCode: {
      atmega328p: {
        rawPointer: `// ATmega328P: Timer 0 en modo Fast PWM sobre el pin PD6 (OC0A)
#define DDRD_REG   (*(volatile uint8_t *)0x2A)
#define TCCR0A_REG (*(volatile uint8_t *)0x44)
#define TCCR0B_REG (*(volatile uint8_t *)0x45)
#define OCR0A_REG  (*(volatile uint8_t *)0x47)

void avr_pwm_init(uint8_t duty_0_to_255) {
    DDRD_REG   |= (1U << 6);                  // PD6 (OC0A) como salida
    TCCR0A_REG  = (1U << 7) | (1U << 1) | (1U << 0); // Non-inverting Fast PWM
    TCCR0B_REG  = (1U << 1) | (1U << 0);      // Prescaler = 64 (16MHz / 64 / 256 = 976.5 Hz)
    OCR0A_REG   = duty_0_to_255;              // Registro de comparación CCR (0..255)
}`,
        cmsisStruct: `#include <avr/io.h>

void set_pwm_duty(uint8_t duty) {
    OCR0A = duty; // El hardware actualiza la onda en el siguiente ciclo de desbordamiento
}`,
        proDriver: `// Timer 1 de 16 bits para control de Servomotor industrial (50 Hz = 20.000 us):
void servo_pwm_init_16bit(void) {
    ICR1  = 39999; // TOP (ARR) = 20 ms con Prescaler 8 a 16 MHz (0.5 us por paso)
    OCR1A = 3000;  // Pulso de 1.5 ms (Posición central 90 grados)
}`,
        asmInsight: 'Una vez configurado TCCR0A/B, puedes detener o dormir la CPU: el contador TCNT0 sigue generando la onda cuadrada en silicio con 0 instrucciones ejecutadas.',
        hardwareNote: 'Timer0 y Timer2 son de 8 bits (cuentan de 0 a 255), mientras que Timer1 es de 16 bits (0 a 65535).'
      },
      stm32f401: {
        rawPointer: `// STM32F401: Generación de PWM de 1 kHz en PA5 usando TIM2_CH1 (Bus APB1)
#define RCC_APB1ENR  (*(volatile uint32_t *)0x40023840UL)
#define TIM2_CR1     (*(volatile uint32_t *)0x40000000UL)
#define TIM2_CCMR1   (*(volatile uint32_t *)0x40000018UL)
#define TIM2_CCER    (*(volatile uint32_t *)0x40000020UL)
#define TIM2_PSC     (*(volatile uint32_t *)0x40000028UL)
#define TIM2_ARR     (*(volatile uint32_t *)0x4000002CUL)
#define TIM2_CCR1    (*(volatile uint32_t *)0x40000034UL)

void tim2_pwm_pa5_init(uint32_t duty_percent) {
    RCC_APB1ENR |= (1UL << 0);        // 1. Habilitar reloj de TIM2
    TIM2_PSC     = 84UL - 1UL;        // 2. 84 MHz / 84 = 1 MHz (1 us por tick)
    TIM2_ARR     = 1000UL - 1UL;      // 3. Periodo = 1000 us (1 kHz)
    TIM2_CCR1    = duty_percent * 10UL; // 4. Comparación (ej. 50% -> 500 us)
    TIM2_CCMR1   = (6UL << 4) | (1UL << 3); // Modo PWM 1 (110) + Preload Enable
    TIM2_CCER   |= (1UL << 0);        // Conecta salida del comparador al pin CH1
    TIM2_CR1    |= (1UL << 0);        // CEN = 1: ¡Arranca el contador!
}`,
        cmsisStruct: `#include "stm32f4xx.h"

void tim2_set_duty_us(uint32_t high_time_us) {
    TIM2->CCR1 = high_time_us; // Actualización limpia amortiguada por el registro Preload
}`,
        proDriver: `typedef struct {
    TIM_TypeDef *tim;
    uint32_t period_ticks;
} pwm_channel_t;

void pwm_set_ratio(const pwm_channel_t *ch, uint8_t percent) {
    ch->tim->CCR1 = (ch->period_ticks * percent) / 100UL;
}`,
        asmInsight: 'Activar el bit OC1PE (Preload Enable) en CCMR1 evita glitches: si cambias CCR1 a mitad de un pulso, el nuevo valor se carga limpiamente al empezar el siguiente periodo.',
        hardwareNote: 'En STM32F4, TIM2 y TIM5 tienen contadores de 32 bits reales (pueden contar hasta 4.294 millones de microsegundos sin desbordarse).'
      },
      esp32c3: {
        rawPointer: `// ESP32-C3: Periférico LEDC (Hardware PWM Controller) + Enrutado por GPIO Matrix
#define LEDC_CH0_CONF0_REG  (*(volatile uint32_t *)0x60019000UL)
#define LEDC_CH0_DUTY_REG   (*(volatile uint32_t *)0x60019008UL)
#define LEDC_TIMER0_CONF    (*(volatile uint32_t *)0x600190A0UL)

void esp32_ledc_pwm_setup(uint32_t duty) {
    LEDC_CH0_DUTY_REG  = (duty << 4); // Los 4 bits inferiores son fraccionales
    LEDC_CH0_CONF0_REG |= (1UL << 4); // Dispara actualización de parámetros (PARA_UP)
}`,
        cmsisStruct: `// En ESP32 cualquier pin puede recibir la señal del PWM usando la GPIO Matrix:
#include "soc/gpio_sig_map.h"
// Conecta la señal LEDC_LS_SIG_OUT0_IDX (índice 45) al pin GPIO5:
GPIO.func_out_sel_cfg[5].func_sel = LEDC_LS_SIG_OUT0_IDX;`,
        proDriver: `// El bloque LEDC incluye generador de Fade por hardware:
// ¡Puede subir o bajar el Duty Cycle gradualmente en silicio sin interrumpir la CPU!`,
        asmInsight: 'Gracias a la GPIO Matrix, no estás atado a un pin fijo para un canal de Timer como ocurre en chips antiguos.',
        hardwareNote: 'Además de LEDC, la familia ESP32 cuenta con periféricos MCPWM dedicados a control de motores trifásicos con tiempo muerto (Dead-Time).'
      },
      nrf52840: {
        rawPointer: `// nRF52840: Periférico PWM con EasyDMA (Lee secuencias de Duty Cycle directo de la RAM!)
#define PWM0_ENABLE        (*(volatile uint32_t *)0x4001C500UL)
#define PWM0_COUNTERTOP    (*(volatile uint32_t *)0x4001C508UL)
#define PWM0_PRESCALER     (*(volatile uint32_t *)0x4001C50CUL)
#define PWM0_SEQ0_PTR      (*(volatile uint32_t *)0x4001C520UL)
#define PWM0_PSEL_OUT0     (*(volatile uint32_t *)0x4001C560UL)
#define PWM0_TASKS_SEQSTART0 (*(volatile uint32_t *)0x4001C008UL)

static uint16_t pwm_ram_sequence[1] = { 500U }; // Valor en RAM leído por DMA

void nrf_pwm_dma_start(void) {
    PWM0_PSEL_OUT0  = 13UL;        // Enruta la salida al Pin P0.13
    PWM0_PRESCALER  = 4UL;         // Divide 16 MHz / 16 = 1 MHz
    PWM0_COUNTERTOP = 1000UL;      // Top (ARR) = 1000 us (1 kHz)
    PWM0_SEQ0_PTR   = (uint32_t)pwm_ram_sequence;
    PWM0_ENABLE     = 1UL;
    PWM0_TASKS_SEQSTART0 = 1UL;    // ¡Arranca secuencia autónoma desde RAM!
}`,
        cmsisStruct: `#include "nrf.h"
// Para hacer un efecto "respiración" en un LED, solo le pasas un array en RAM
// y el PWM de Nordic recorre toda la curva con la CPU dormida!`,
        proDriver: `// También puedes conectar un TIMER + GPIOTE mediante PPI para crear un PWM en cualquier pin.`,
        asmInsight: '¡Observa que pwm_ram_sequence es static! Si fuera una variable local en el Stack y la función termina, el DMA leería basura de la pila.',
        hardwareNote: 'Regla crítica de DMA: nunca pases la dirección de una variable local efímera a un registro PTR de EasyDMA.'
      },
      rp2040: {
        rawPointer: `// RP2040: 8 Slices de PWM de 16 bits con canales A y B cada uno
#define PWM_CH2_CSR  (*(volatile uint32_t *)0x40050028UL)
#define PWM_CH2_DIV  (*(volatile uint32_t *)0x4005002CUL)
#define PWM_CH2_TOP  (*(volatile uint32_t *)0x40050038UL)
#define PWM_CH2_CC   (*(volatile uint32_t *)0x40050034UL)

void rp2040_pwm_slice2_init(uint16_t duty) {
    PWM_CH2_DIV = (133UL << 4);       // Divisor entero 133.0 (bits 11:4) -> 1 MHz
    PWM_CH2_TOP = 999UL;              // Periodo = 1000 us (1 kHz)
    PWM_CH2_CC  = ((uint32_t)duty << 16); // Canal B (GPIO5) ocupa los bits [31:16]
    PWM_CH2_CSR = (1UL << 0);         // Habilita el Slice 2
}`,
        cmsisStruct: `#include "hardware/structs/pwm.h"

void rp2040_set_pwm_b(uint16_t cc_val) {
    pwm_hw->slice[2].cc = (pwm_hw->slice[2].cc & 0x0000FFFFUL) | ((uint32_t)cc_val << 16);
}`,
        proDriver: `// El divisor de reloj de los PWM del RP2040 es fraccional (8 bits enteros + 4 bits fraccionales)
// permitiendo ajustar frecuencias intermedias con altísima precisión.`,
        asmInsight: 'En el RP2040 cada registro CC de 32 bits agrupa dos canales de 16 bits: Canal A en [15:0] y Canal B en [31:16].',
        hardwareNote: 'GPIO5 pertenece al Slice 2 Canal B (Función Alternativa 4 en IO_BANK0).'
      }
    },
    challenge: {
      question: 'Reto de Cálculo de Timer Industrial — Precisión de 1 kHz',
      scenario:
        'Tu microcontrolador tiene un reloj de bus de Timer de 84 MHz (84.000.000 Hz). Quieres que el contador sume 1 tick cada 1 microsegundo (1 MHz) y que el periodo total de la señal PWM sea de 1 milisegundo (1000 microsegundos = 1 kHz) con un ciclo de trabajo del 30%. ¿Qué valores debes escribir en PSC, ARR y CCR1?',
      options: [
        {
          id: 'a',
          label: 'PSC = 84, ARR = 1000, CCR1 = 30',
          isCorrect: false,
          feedback: '¡Casi! Recuerda que el hardware divide entre (PSC + 1) y cuenta desde 0 hasta ARR inclusive (ARR + 1 pasos). Además, el 30% de 1000 cuentas es 300, no 30.'
        },
        {
          id: 'b',
          label: 'PSC = 83 (84 - 1), ARR = 999 (1000 - 1), CCR1 = 300',
          isCorrect: true,
          feedback: '¡Exacto! 84 MHz / (83 + 1) = 1 MHz (1 us por cuenta). Contar de 0 a 999 son exactamente 1000 microsegundos (1 kHz), y CCR1 = 300 mantiene el pin en ALTO durante 300 us (30%).'
        },
        {
          id: 'c',
          label: 'Usar un bucle for() dentro de main() esperando 300 microsegundos.',
          isCorrect: false,
          feedback: 'Un bucle por software se verá interrumpido por cualquier ISR causando jitter en la señal y desperdiciando el 100% de la CPU.'
        }
      ]
    }
  },

  {
    id: 6,
    slug: 'protocolos-serie-uart-i2c-spi',
    title: 'Módulo 6: Protocolos de Comunicación en Serie (UART, I2C, SPI)',
    subtitle: 'Cómo viajan los bytes bit a bit por el cable, registros de desplazamiento (Shift Registers) y banderas TXE / RXNE / ACK',
    level: 'Avanzado',
    duration: '70 min',
    recommendedLab: 'logic-analyzer',
    superficialMyth:
      'Usas Serial.println(), Wire.write() o SPI.transfer() como cajas negras sin saber qué aspecto tiene la señal eléctrica ni cómo diagnosticar por qué un sensor I2C no responde.',
    overwhelmingDatasheet:
      'Tablas de temporización de nanosegundos, diagramas de fases CPOL/CPHA, cálculo de divisores fraccionales USART_BRR y máquinas de estado I2C EV5, EV6, EV8_2.',
    theBridgeExplanation:
      'Dentro de cualquier periférico UART, I2C o SPI hay un "Registro de Desplazamiento" (Shift Register): tú escribes un byte entero de 8 bits en paralelo en el registro de datos (DR) en 1 ciclo de CPU, y el periférico se encarga de empujar esos 8 bits uno detrás de otro por el pin físico al ritmo exacto del reloj acordado. Mientras el periférico está sacando los bits por el cable, levanta una bandera en su Registro de Estado (SR). Cuando el buffer queda libre para otro byte, el hardware pone a 1 la bandera TXE (Transmit Data Register Empty).',
    keyTakeaways: [
      {
        title: '1. UART (Asíncrono): Sin cable de reloj, sincronizado por Bit de Start',
        concept: 'La línea TX reposa en ALTO (3.3V). Para avisar que empieza un byte, cae a 0V durante 1 tiempo de bit (Start Bit), luego salen los 8 bits del dato empezando por el menos significativo (LSB First: bit 0 al bit 7), y termina subiendo a 3.3V en el Stop Bit.',
        codeSnippet: `void uart2_send_byte(uint8_t byte) {\n    // 1. Esperar a que el registro de transmisión esté vacío (Bit 7 TXE == 1):\n    while ((USART2->SR & (1UL << 7)) == 0UL) { }\n    // 2. Entregar el byte al hardware (él añadirá Start y Stop bit solo):\n    USART2->DR = byte;\n}`
      },
      {
        title: '2. I2C (Síncrono Bus Compartido): 2 Cables (SDA + SCL) en Open-Drain',
        concept: 'Permite conectar hasta 127 sensores en los mismos 2 cables. Empieza con una condición START (SDA baja mientras SCL está alto), envía los 7 bits de dirección del sensor + 1 bit R/W, y en el 9º pulso de reloj suelta el cable SDA para comprobar si el sensor tira la línea a 0V (bit ACK).',
        codeSnippet: `// Si ningún sensor tira SDA a 0V en el 9º pulso de reloj, recibes un NACK:\n// Causas reales del 99% de fallos I2C:\n// 1) Olvidar resistencias Pull-Up (4.7k) | 2) Dirección desplazada (7-bit vs 8-bit)`
      },
      {
        title: '3. SPI (Síncrono Alta Velocidad Full-Duplex): Intercambio Circular',
        concept: 'En SPI no existe "solo enviar" o "solo recibir": cada vez que el Maestro genera 8 pulsos en SCK, empuja 8 bits por MOSI hacia el Esclavo y simultáneamente recibe 8 bits por MISO desde el Esclavo.',
        codeSnippet: `uint8_t spi1_transfer(uint8_t tx_byte) {\n    while (!(SPI1->SR & SPI_SR_TXE)) { }\n    SPI1->DR = tx_byte;                  // Inicia 8 pulsos de reloj SCK\n    while (!(SPI1->SR & SPI_SR_RXNE)) { } // Espera a que entren los 8 bits de MISO\n    return (uint8_t)SPI1->DR;            // Devuelve el byte recibido simultáneamente\n}`
      }
    ],
    mcuCode: {
      atmega328p: {
        rawPointer: `// ATmega328P: Transmisión UART0 por registros directos (0xC0..0xC6)
#define UCSR0A_REG (*(volatile uint8_t *)0xC0)
#define UCSR0B_REG (*(volatile uint8_t *)0xC1)
#define UBRR0L_REG (*(volatile uint8_t *)0xC4)
#define UDR0_REG   (*(volatile uint8_t *)0xC6)

void avr_uart_init_9600(void) {
    UBRR0L_REG = 103U;       // 16MHz / (16 * 9600) - 1 = 103
    UCSR0B_REG = (1U << 3);  // TXEN0 = 1: Habilita transmisor UART
}

void avr_uart_putc(char c) {
    while ((UCSR0A_REG & (1U << 5)) == 0U) { } // Espera UDRE0 (Data Register Empty)
    UDR0_REG = (uint8_t)c;
}`,
        cmsisStruct: `#include <avr/io.h>

uint8_t avr_spi_transfer(uint8_t data) {
    SPDR = data;                      // Escribir en SPDR inicia los 8 pulsos de SCK
    while (!(SPSR & (1U << SPIF))) {} // Espera bandera de fin de transferencia
    return SPDR;                      // Lee el byte que entró por MISO
}`,
        proDriver: `void uart_print_str(const char *s) {
    while (*s) {
        avr_uart_putc(*s++);
    }
}`,
        asmInsight: 'Observa que UDR0 (0xC6) tiene la misma dirección física para leer y escribir, pero internamente apunta a dos buffers separados: TXB al escribir y RXB al leer.',
        hardwareNote: 'Puedes inspeccionar las tramas reales de UART, I2C y SPI bit a bit en el Analizador Lógico de abajo.'
      },
      stm32f401: {
        rawPointer: `// STM32F401: Inicialización y envío en USART2 (42 MHz Bus APB1 -> 115200 baudios)
#define USART2_SR   (*(volatile uint32_t *)0x40004400UL)
#define USART2_DR   (*(volatile uint32_t *)0x40004404UL)
#define USART2_BRR  (*(volatile uint32_t *)0x40004408UL)
#define USART2_CR1  (*(volatile uint32_t *)0x4000440CUL)

void stm32_usart2_init(void) {
    // Divisor = 42.000.000 / (16 * 115200) = 22.786 -> Mantisa=22 (0x16), Fracción=13 (0xD)
    USART2_BRR = (22UL << 4) | 13UL;
    USART2_CR1 = (1UL << 13) | (1UL << 3) | (1UL << 2); // UE=1 (Enable), TE=1 (TX), RE=1 (RX)
}

void stm32_usart2_putc(uint8_t ch) {
    while ((USART2_SR & (1UL << 7)) == 0UL) { } // Bit 7 = TXE
    USART2_DR = ch;
}`,
        cmsisStruct: `#include "stm32f4xx.h"

uint8_t stm32_usart2_getc(void) {
    while ((USART2->SR & USART_SR_RXNE) == 0UL) { } // Bit 5 = RXNE (Read Data Not Empty)
    return (uint8_t)(USART2->DR & 0xFFUL);
}`,
        proDriver: `// Interfaz genérica polimórfica en C usando punteros a funciones (Estilo Industrial):
typedef struct {
    bool (*write)(const uint8_t *data, uint16_t len);
    bool (*read)(uint8_t *data, uint16_t len);
} serial_bus_i;`,
        asmInsight: 'Leer USART2->DR limpia automáticamente la bandera RXNE en hardware sin necesidad de escribir en SR.',
        hardwareNote: 'No olvides configurar los pines PA2 y PA3 en Modo Función Alternativa AF7 (MODER = 10, AFR[0] = 7).'
      },
      esp32c3: {
        rawPointer: `// ESP32-C3: UART0 con FIFO de Hardware de 128 bytes (0x60000000)
#define UART0_FIFO_REG   (*(volatile uint32_t *)0x60000000UL)
#define UART0_STATUS_REG (*(volatile uint32_t *)0x6000001CUL)

void esp32_uart0_write_byte(uint8_t b) {
    // Bits [23:16] de STATUS indican cuántos bytes ocupan la TX FIFO (máx 128):
    while (((UART0_STATUS_REG >> 16) & 0xFFUL) >= 126UL) { }
    UART0_FIFO_REG = b;
}`,
        cmsisStruct: `#include "soc/uart_struct.h"

void esp32_uart0_send_burst(const uint8_t *buf, uint32_t len) {
    for (uint32_t i = 0; i < len; i++) {
        UART0.fifo.rw_byte = buf[i]; // Entra directo en la cola FIFO de 128 bytes
    }
}`,
        proDriver: `// La FIFO de 128 bytes en silicio permite enviar un mensaje entero de 100 caracteres
// de golpe en microsegundos sin esperar a que salgan por el cable.`,
        asmInsight: 'Tener una FIFO profunda en el periférico reduce drásticamente el número de interrupciones por segundo.',
        hardwareNote: 'Además de la FIFO, el ESP32-C3 cuenta con un motor GDMA para tramas grandes de SPI y UART.'
      },
      nrf52840: {
        rawPointer: `// nRF52840: UARTE0 con EasyDMA integrado (No necesitas empujar byte a byte!)
#define UARTE0_TASKS_STARTTX (*(volatile uint32_t *)0x40002008UL)
#define UARTE0_EVENTS_ENDTX  (*(volatile uint32_t *)0x40002120UL)
#define UARTE0_ENABLE        (*(volatile uint32_t *)0x40002500UL)
#define UARTE0_PSEL_TXD      (*(volatile uint32_t *)0x4000250CUL)
#define UARTE0_BAUDRATE      (*(volatile uint32_t *)0x40002524UL)
#define UARTE0_TXD_PTR       (*(volatile uint32_t *)0x40002544UL)
#define UARTE0_TXD_MAXCNT    (*(volatile uint32_t *)0x40002548UL)

void nrf_uarte_dma_send(const uint8_t *ram_buffer, uint32_t length) {
    UARTE0_TXD_PTR       = (uint32_t)ram_buffer; // Dirección en SRAM
    UARTE0_TXD_MAXCNT    = length;               // Cuántos bytes enviar
    UARTE0_EVENTS_ENDTX  = 0UL;
    UARTE0_TASKS_STARTTX = 1UL;                  // ¡El hardware lee la RAM y transmite todo!
}`,
        cmsisStruct: `#include "nrf.h"

void nrf_twim_i2c_read_sensor(uint8_t i2c_addr7, uint8_t *rx_buf, uint32_t len) {
    NRF_TWIM0->ADDRESS       = i2c_addr7; // Dirección de 7 bits limpia
    NRF_TWIM0->RXD.PTR       = (uint32_t)rx_buf;
    NRF_TWIM0->RXD.MAXCNT    = len;
    NRF_TWIM0->TASKS_STARTRX = 1UL;
}`,
        proDriver: `// En Nordic todos los periféricos con sufijo "E" o "M" (UARTE, SPIM, TWIM)
// operan exclusivamente mediante punteros EasyDMA a memoria RAM.`,
        asmInsight: 'Para enviar 255 bytes por UART en un chip clásico haces 255 escrituras de CPU; en el nRF52840 haces 1 sola tarea TASKS_STARTTX.',
        hardwareNote: 'Asegúrate de que el buffer pasado a TXD.PTR esté en SRAM (0x2000xxxx) y no en Flash.'
      },
      rp2040: {
        rawPointer: `// RP2040: UART0 (PrimeCell PL011 de ARM) con FIFOs de 32 bytes (0x40034000)
#define UART0_DR  (*(volatile uint32_t *)0x40034000UL)
#define UART0_FR  (*(volatile uint32_t *)0x40034018UL)

void rp2040_uart0_putc(char c) {
    // Bit 5 de FR (Flag Register) es TXFF (Transmit FIFO Full):
    while ((UART0_FR & (1UL << 5)) != 0UL) { }
    UART0_DR = (uint32_t)c;
}`,
        cmsisStruct: `#include "hardware/structs/uart.h"

bool rp2040_uart0_readable(void) {
    return (uart0_hw->fr & UART_UARTFR_RXFE_BITS) == 0UL; // RX FIFO Not Empty
}`,
        proDriver: `// Y si necesitas un 3er UART o un protocolo industrial a medida, las máquinas PIO
// del RP2040 implementan un transmisor UART completo en solo 4 instrucciones PIO!`,
        asmInsight: 'El bloque UART del RP2040 es la IP oficial ARM PrimeCell PL011, muy común también en SoCs industriales Cortex-A.',
        hardwareNote: 'La bandera en PL011 funciona al revés que en STM32: miras que TXFF (FIFO Full) sea 0 antes de escribir.'
      }
    },
    challenge: {
      question: 'Reto de Analizador Lógico — Decodificando una Trama en el Cable',
      scenario:
        'Conectas un analizador lógico a una línea UART (8N1: 8 bits de datos, sin paridad, 1 bit de parada) para enviar el carácter ASCII \'A\' (0x41 = 0b01000001). Sabiendo que UART transmite primero el bit menos significativo (LSB first), ¿en qué orden exacto salen los bits por el pin TX después del Start Bit (0)?',
      options: [
        {
          id: 'a',
          label: 'Start(0) -> 0, 1, 0, 0, 0, 0, 0, 1 -> Stop(1)',
          isCorrect: false,
          feedback: 'Ese sería el orden MSB-first (el más significativo primero, que se usa en I2C). UART siempre envía el bit 0 (LSB) primero.'
        },
        {
          id: 'b',
          label: 'Start(0) -> 1, 0, 0, 0, 0, 0, 1, 0 -> Stop(1)',
          isCorrect: true,
          feedback: '¡Exacto! En 0x41 (0b01000001), el bit 0 vale 1, los bits 1..5 valen 0, el bit 6 vale 1 y el bit 7 vale 0. Puedes verlo dibujado en vivo en la pestaña "Analizador Lógico".'
        },
        {
          id: 'c',
          label: 'Envía los 8 bits a la vez por un solo cable usando distintos niveles de voltaje.',
          isCorrect: false,
          feedback: 'UART es binario digital (0V y 3.3V/5V): envía un bit detrás de otro en el tiempo.'
        }
      ]
    }
  },

  {
    id: 7,
    slug: 'adc-y-acceso-directo-a-memoria-dma',
    title: 'Módulo 7: Mundo Analógico (ADC) y Acceso Directo a Memoria (DMA)',
    subtitle: 'Cómo digitalizar sensores analógicos con un ADC SAR y mover miles de muestras por segundo a la RAM con 0% de intervención de la CPU',
    level: 'Experto Industrial',
    duration: '60 min',
    recommendedLab: 'memory-bus',
    superficialMyth:
      'En proyectos básicos llaman a analogRead(A0) en cada vuelta del loop, bloqueando la CPU durante más de 100 microsegundos por muestra.',
    overwhelmingDatasheet:
      'El capítulo de DMA habla de "Streams, Channels, Circular Buffer Mode, Memory-to-Peripheral, Peripheral-to-Memory, Half-Transfer IRQ y Bus Matrix Arbitration".',
    theBridgeExplanation:
      'El ADC mide un voltaje analógico (ej. de 0.0V a 3.3V) comparándolo con una escalera interna de condensadores (Aproximación Sucesiva SAR) y te devuelve un número entero (de 0 a 4095 en 12 bits). Pero si necesitas leer 10.000 muestras por segundo de un micrófono o sensor de corriente, la CPU no tendría tiempo para nada más si tuviera que copiar cada muestra a mano. Aquí entra el DMA (Direct Memory Access): un "coprocesador de mudanzas" al que le dices: "Cada vez que el ADC termine una conversión, copia tú mismo el valor desde la dirección fija ADC1->DR (0x4001204C) hacia mi array en RAM e incrementa el puntero de RAM en +1". ¡La CPU queda 100% libre!',
    keyTakeaways: [
      {
        title: '1. Ecuación de Conversión Analógica a Digital (SAR ADC)',
        concept: 'Un ADC de N bits divide el voltaje de referencia (Vref, típicamente 3.3V) en (2^N - 1) escalones discretos. En 10 bits son 1023 escalones; en 12 bits son 4095 escalones (resolución de ~0.8 milivoltios por paso).',
        codeSnippet: `// Convertir lectura cruda del ADC de 12 bits (0..4095) a milivoltios sin usar float:\nuint32_t adc_raw = ADC1->DR;\nuint32_t millivolts = (adc_raw * 3300UL) / 4095UL; // Aritmética entera rápida!`
      },
      {
        title: '2. Anatomía de una Transferencia DMA (Origen, Destino, Contador)',
        concept: 'Cualquier controlador DMA del mundo se configura con 4 datos: 1) Dirección Origen (PAR), 2) Dirección Destino (M0AR), 3) Número de elementos a copiar (NDTR), y 4) Quién incrementa su dirección (el periférico queda fijo, la RAM se auto-incrementa).',
        codeSnippet: `DMA2_Stream0->PAR  = (uint32_t)&ADC1->DR;       // Origen fijo: registro del ADC\nDMA2_Stream0->M0AR = (uint32_t)adc_ram_buffer;  // Destino: nuestro array en SRAM\nDMA2_Stream0->NDTR = 64U;                       // Copiar 64 muestras automáticamente`
      },
      {
        title: '3. Modo Circular (Ring Buffer en Hardware)',
        concept: 'Al activar el Modo Circular en el DMA, cuando termina de llenar la posición 63 de tu array en RAM, vuelve automáticamente a la posición 0 sin detenerse jamás. Así tienes siempre las últimas N lecturas de todos los sensores actualizadas en RAM sin escribir ni una línea de código en el bucle principal.',
        codeSnippet: `volatile uint16_t sensores_live[4]; // El DMA actualiza este array en segundo plano!\n// En main() simplemente lees sensores_live[0] como una variable normal.`
      }
    ],
    mcuCode: {
      atmega328p: {
        rawPointer: `// ATmega328P: ADC de 10 bits (0..1023) — Sin controlador DMA (requiere CPU o ISR)
#define ADMUX_REG  (*(volatile uint8_t *)0x7C)
#define ADCSRA_REG (*(volatile uint8_t *)0x7A)
#define ADC_WORD   (*(volatile uint16_t *)0x78)

uint16_t avr_adc_read_ch0(void) {
    ADMUX_REG  = (1U << 6) | 0U;              // Referencia AVCC (5V), Canal 0 (PC0)
    ADCSRA_REG = (1U << 7) | (1U << 6) | 7U;  // ADEN=1, ADSC=1 (Start), Prescaler=128
    while (ADCSRA_REG & (1U << 6)) { }        // Espera a que el bit ADSC vuelva a 0
    return ADC_WORD;                          // Devuelve resultado de 10 bits (0..1023)
}`,
        cmsisStruct: `#include <avr/io.h>
#include <avr/interrupt.h>

// Como AVR no tiene DMA, para no bloquear main() usamos la interrupción ADC_vect:
volatile uint16_t ultima_muestra_adc = 0;
ISR(ADC_vect) {
    ultima_muestra_adc = ADC;
}`,
        proDriver: `// Comparar el ATmega328P con un chip con DMA te demuestra por qué en aplicaciones
// de audio o control rápido de motores es imprescindible contar con un controlador DMA.`,
        asmInsight: 'Cada conversión del ADC en el ATmega328P tarda 13 ciclos del reloj ADC (~104 microsegundos), equivalentes a 1.664 ciclos de CPU.',
        hardwareNote: 'La ausencia de DMA en el ATmega328P obliga a la CPU a intervenir en cada muestra.'
      },
      stm32f401: {
        rawPointer: `// STM32F401: Configuración de DMA2_Stream0 para copiar de ADC1->DR a SRAM en Modo Circular
#define DMA2_S0CR   (*(volatile uint32_t *)0x40026410UL)
#define DMA2_S0NDTR (*(volatile uint32_t *)0x40026414UL)
#define DMA2_S0PAR  (*(volatile uint32_t *)0x40026418UL)
#define DMA2_S0M0AR (*(volatile uint32_t *)0x4002641CUL)
#define ADC1_DR_ADDR 0x4001204CUL

volatile uint16_t adc_dma_buf[16];

void stm32_dma2_adc1_circular_init(void) {
    DMA2_S0CR   &= ~(1UL << 0);             // 1. Asegurar que el Stream esté deshabilitado
    DMA2_S0PAR   = ADC1_DR_ADDR;            // 2. Dirección del registro periférico ADC1->DR
    DMA2_S0M0AR  = (uint32_t)adc_dma_buf;   // 3. Dirección del array en SRAM
    DMA2_S0NDTR  = 16UL;                    // 4. 16 transferencias de 16 bits
    // Canal 0, Tamaño 16-bit (MSIZE=01, PSIZE=01), Incremento RAM (MINC=1), Circular (CIRC=1):
    DMA2_S0CR    = (1UL << 13) | (1UL << 11) | (1UL << 10) | (1UL << 8) | (1UL << 0);
}`,
        cmsisStruct: `#include "stm32f4xx.h"

void adc1_start_continuous_dma(void) {
    ADC1->CR2 |= ADC_CR2_DMA | ADC_CR2_DDS | ADC_CR2_CONT | ADC_CR2_ADON;
    ADC1->CR2 |= ADC_CR2_SWSTART; // Arranca el flujo perpetuo ADC -> DMA -> RAM
}`,
        proDriver: `// Técnica Industrial "Ping-Pong Buffer" (Half-Transfer + Transfer-Complete IRQ):
// Mientras la CPU procesa la primera mitad del array [0..7], el DMA llena [8..15]!`,
        asmInsight: 'La matriz de buses AHB del STM32F4 arbitra el acceso entre la CPU y el DMA2 para que ambos puedan trabajar sin bloquearse.',
        hardwareNote: 'Recuerda declarar el buffer de destino como volatile cuando lo leas desde el hilo principal.'
      },
      esp32c3: {
        rawPointer: `// ESP32-C3: Controlador GDMA (General Direct Memory Access) con Descriptores Enlazados
#define GDMA_IN_LINK_CH0_REG (*(volatile uint32_t *)0x6003F020UL)

typedef struct {
    uint32_t size : 12;
    uint32_t length : 12;
    uint32_t reversed : 6;
    uint32_t eof : 1;
    uint32_t owner : 1; // 1 = Propiedad del hardware DMA, 0 = CPU
    uint8_t *buf;
    void *next;
} dma_descriptor_t;`,
        cmsisStruct: `// En ESP32 el DMA usa listas enlazadas de descriptores en RAM (scatter-gather):
// Puedes encadenar múltiples buffers en anillo apuntando desc.next = &desc;`,
        proDriver: `// El ADC continuo (DIG ADC) enía muestras directamente al motor GDMA a alta velocidad.`,
        asmInsight: 'Los descriptores enlazados (Scatter-Gather DMA) permiten recolectar o transmitir paquetes fragmentados en memoria en una sola operación.',
        hardwareNote: 'Los descriptores de GDMA deben estar alineados a 4 bytes en la memoria SRAM interna.'
      },
      nrf52840: {
        rawPointer: `// nRF52840: SAADC (Successive Approximation ADC de 12 bits) con EasyDMA nativo
#define SAADC_RESULT_PTR    (*(volatile uint32_t *)0x4000762CUL)
#define SAADC_RESULT_MAXCNT (*(volatile uint32_t *)0x40007630UL)
#define SAADC_TASKS_START   (*(volatile uint32_t *)0x40007000UL)
#define SAADC_TASKS_SAMPLE  (*(volatile uint32_t *)0x40007004UL)

volatile int16_t saadc_ram_samples[8];

void nrf_saadc_dma_setup(void) {
    SAADC_RESULT_PTR    = (uint32_t)saadc_ram_samples;
    SAADC_RESULT_MAXCNT = 8UL;
    SAADC_TASKS_START   = 1UL; // Prepara el puntero DMA en hardware
}`,
        cmsisStruct: `#include "nrf.h"

// Combo maestro industrial en Nordic:
// Un Timer dispara SAADC->TASKS_SAMPLE mediante un canal PPI cada 1 ms mientras la CPU duerme.
// Solo cuando el DMA llena las 8 muestras en RAM se despierta la CPU una vez!`,
        proDriver: `void connect_timer_to_adc_ppi(void) {
    NRF_PPI->CH[1].EEP = (uint32_t)&NRF_TIMER1->EVENTS_COMPARE[0];
    NRF_PPI->CH[1].TEP = (uint32_t)&NRF_SAADC->TASKS_SAMPLE;
    NRF_PPI->CHENSET   = (1UL << 1);
}`,
        asmInsight: 'Combinar Timer + PPI + SAADC EasyDMA reduce el consumo de batería en un 95% frente a despertar la CPU en cada muestra.',
        hardwareNote: 'El SAADC de Nordic devuelve enteros con signo de 16 bits (int16_t) porque soporta mediciones diferenciales.'
      },
      rp2040: {
        rawPointer: `// RP2040: ADC con FIFO + Controlador DMA de 12 canales (0x50000000)
#define ADC_CS              (*(volatile uint32_t *)0x4004C000UL)
#define ADC_FCS             (*(volatile uint32_t *)0x4004C008UL)
#define ADC_FIFO_ADDR       0x4004C00CUL
#define DMA_CH0_READ_ADDR   (*(volatile uint32_t *)0x50000000UL)
#define DMA_CH0_WRITE_ADDR  (*(volatile uint32_t *)0x50000004UL)
#define DMA_CH0_TRANS_COUNT (*(volatile uint32_t *)0x50000008UL)
#define DMA_CH0_CTRL_TRIG   (*(volatile uint32_t *)0x5000000CUL)

void rp2040_adc_dma_burst(uint16_t *dst_ram, uint32_t count) {
    DMA_CH0_READ_ADDR   = ADC_FIFO_ADDR;
    DMA_CH0_WRITE_ADDR  = (uint32_t)dst_ram;
    DMA_CH0_TRANS_COUNT = count;
    // DREQ_ADC = 36 (marca el ritmo del DMA según el ADC), INCR_WRITE=1, DATA_SIZE=16-bit:
    DMA_CH0_CTRL_TRIG   = (36UL << 15) | (1UL << 5) | (1UL << 2) | (1UL << 0);
}`,
        cmsisStruct: `#include "hardware/structs/dma.h"
// Escribir en el registro _TRIG del canal DMA arma e inicia la transferencia en 1 instrucción.`,
        proDriver: `// En RP2040 también puedes encadenar dos canales DMA (CHAIN_TO):
// El Canal 0 llena el buffer y al terminar dispara automáticamente al Canal 1 que lo reinicia.`,
        asmInsight: 'El DMA del RP2040 puede mover hasta 1 palabra de 32 bits por cada ciclo de reloj (532 MB/s a 133 MHz).',
        hardwareNote: 'El campo TREQ_SEL (DREQ_ADC = 36) es el semáforo que evita que el DMA lea el ADC antes de que haya una muestra nueva.'
      }
    },
    challenge: {
      question: 'Reto de Arquitectura DMA — Configuración de Incremento de Punteros',
      scenario:
        'Estás configurando un canal DMA para transferir 100 muestras consecutivas desde el registro de datos del conversor analógico-digital (ADC1->DR, ubicado en la dirección fija 0x4001204C) hacia un array uint16_t buffer[100] en memoria RAM. ¿Cómo debes configurar el auto-incremento de direcciones del DMA?',
      options: [
        {
          id: 'a',
          label: 'Incrementar tanto la dirección de Periférico (PINC=1) como la de Memoria (MINC=1).',
          isCorrect: false,
          feedback: '¡Error grave! Si incrementas la dirección del periférico, la primera lectura será en ADC1->DR (0x4001204C), pero la segunda leerá en 0x4001204E (que es otro registro distinto o memoria reservada).'
        },
        {
          id: 'b',
          label: 'Dirección de Periférico FIJA (PINC=0) y Dirección de Memoria RAM INCREMENTAL (MINC=1).',
          isCorrect: true,
          feedback: '¡Exacto! Todas las muestras nacen en la misma ventanilla de hardware (ADC1->DR), pero queremos guardarlas una detrás de otra en las casillas buffer[0], buffer[1]... buffer[99] de la RAM.'
        },
        {
          id: 'c',
          label: 'Ambas direcciones fijas (PINC=0 y MINC=0).',
          isCorrect: false,
          feedback: 'Si no incrementas la dirección de memoria, las 100 muestras se machacarán todas sobre buffer[0] y el resto del array quedará vacío.'
        }
      ]
    }
  },

  {
    id: 8,
    slug: 'arquitectura-firmware-profesional-fsm-hal-rtos',
    title: 'Módulo 8: Arquitectura de Firmware Experto — Drivers, FSM, Low-Power y RTOS',
    subtitle: 'Cómo estructurar código C de nivel industrial: Tablas de Punteros a Funciones, Máquinas de Estados Finitos, Diseño de HAL Portable y Cambio de Contexto en RTOS',
    level: 'Experto Industrial',
    duration: '75 min',
    recommendedLab: 'compiler-volatile',
    superficialMyth:
      'En los cursos amateurs todo el programa es un archivo main.c gigante lleno de if/else anidados, variables globales caóticas y llamadas directas a registros mezcladas con la lógica de negocio.',
    overwhelmingDatasheet:
      'Ves un repositorio industrial con carpetas /hal, /bsp, /drivers, /app, structs llenos de punteros a funciones (*init)(void), tablas de transición de estados y ensamblador PendSV_Handler de FreeRTOS.',
    theBridgeExplanation:
      'Aquí es donde te graduas como Experto. Un ingeniero senior de sistemas embebidos aplica 3 pilares en C: 1) Desacoplamiento (HAL / BSP): tu lógica de negocio (ej. "alarma_activar()") jamás toca un registro como GPIOA->ODR directamente; llama a una interfaz abstracta para que si mañana hay escasez de chips y cambias de STM32 a ESP32 o Nordic, solo reescribas el archivo hal_gpio.c en 20 minutos. 2) Máquinas de Estados Finitos (FSM) no bloqueantes: ninguna función se queda esperando; cada periférico avanza de estado según eventos. 3) Comprensión real del RTOS: entender que una "Tarea" de FreeRTOS es simplemente una función con su propio trozo de Stack en RAM, y el planificador solo cambia el registro Stack Pointer (SP) de una tarea a otra cada 1 milisegundo.',
    keyTakeaways: [
      {
        title: '1. Polimorfismo en C: Interfaces con Punteros a Funciones (Driver Limpio)',
        concept: 'Aunque C no tiene "class" ni "interface" como C++, en la industria logramos el mismo desacoplamiento limpio definiendo un struct de punteros a funciones. Así el código de aplicación funciona igual en los 5 microcontroladores.',
        codeSnippet: `typedef struct {\n    void (*init)(void);\n    void (*set_high)(uint8_t pin);\n    void (*set_low)(uint8_t pin);\n    bool (*read)(uint8_t pin);\n} hal_gpio_driver_t;\n\n// Tu aplicación recibe un puntero constante al driver del chip actual:\nvoid app_run(const hal_gpio_driver_t *gpio) {\n    gpio->set_high(5); // ¡100% independiente de si es AVR, STM32, ESP32, Nordic o RP2040!\n}`
      },
      {
        title: '2. Máquina de Estados Finitos (FSM) Basada en Tabla',
        concept: 'En lugar de espagueti de switch/if con banderas booleanas sueltas, modela tu sistema con estados explícitos (enum), eventos y una tabla constante en Flash.',
        codeSnippet: `typedef enum { STATE_IDLE, STATE_MEASURING, STATE_TX_DATA, STATE_ERROR } sys_state_t;\ntypedef enum { EVT_TIMER_TICK, EVT_ADC_DONE, EVT_TX_COMPLETE, EVT_FAULT } sys_event_t;\n\ntypedef struct {\n    sys_state_t current_state;\n    sys_event_t event;\n    sys_state_t next_state;\n    void (*action)(void);\n} fsm_transition_t;`
      },
      {
        title: '3. Cómo funciona un RTOS (FreeRTOS) por dentro sin magia',
        concept: 'Cuando el temporizador SysTick salta cada 1 ms, la interrupción PendSV guarda los registros R4-R11 de la Tarea A en la pila de la Tarea A, guarda el puntero de pila (PSP) en el bloque TCB de la Tarea A, carga el PSP de la Tarea B, restaura R4-R11 de la Tarea B y retorna. ¡Acabas de cambiar de hilo!',
        codeSnippet: `// Esqueleto real del cambio de contexto en ARM Cortex-M (PendSV):\n// 1. MRS R0, PSP          (Lee Stack Pointer de la tarea saliente)\n// 2. STMDB R0!, {R4-R11}  (Guarda registros en su pila RAM)\n// 3. Cambia al TCB de la siguiente tarea de mayor prioridad lista\n// 4. LDMIA R0!, {R4-R11}  (Recupera registros de la nueva tarea)\n// 5. MSR PSP, R0          (Actualiza el Stack Pointer y salta a ella!)`
      }
    ],
    mcuCode: {
      atmega328p: {
        rawPointer: `// Implementación del Driver Unificado para ATmega328P (hal_gpio_avr.c)
#include <stdint.h>
#include <stdbool.h>

static void avr_init(void)            { *(volatile uint8_t *)0x24 |= (1U << 5); }
static void avr_set_high(uint8_t pin) { *(volatile uint8_t *)0x25 |= (1U << pin); }
static void avr_set_low(uint8_t pin)  { *(volatile uint8_t *)0x25 &= ~(1U << pin); }
static bool avr_read(uint8_t pin)     { return (*(volatile uint8_t *)0x23 & (1U << pin)) != 0U; }`,
        cmsisStruct: `// Tabla de interfaz exportada (vive en Flash con const):
const hal_gpio_driver_t HAL_GPIO_AVR = {
    .init     = avr_init,
    .set_high = avr_set_high,
    .set_low  = avr_set_low,
    .read     = avr_read
};`,
        proDriver: `// En un chip de solo 2 KB de RAM como ATmega328P, en vez de un RTOS pesado (que gasta
// ~150 bytes de Stack por cada tarea), la práctica experta es un Planificador Cooperativo
// basado en un Timer Tick de 1 ms + Máquinas de Estados Finitos (Superloop No-Bloqueante).`,
        asmInsight: 'Una llamada a través de un puntero a función en AVR se traduce en la instrucción ICALL (Indirect Call to Z pointer).',
        hardwareNote: 'Con este patrón arquitectónico, tu lógica de aplicación compila sin cambiar ni una coma en los 5 chips.'
      },
      stm32f401: {
        rawPointer: `// Implementación del mismo Driver Unificado para STM32F401 (hal_gpio_stm32.c)
static void stm32_init(void) {
    *(volatile uint32_t *)0x40023830UL |= (1UL << 0); // RCC GPIOA
    *(volatile uint32_t *)0x40020000UL = (*(volatile uint32_t *)0x40020000UL & ~(3UL << 10)) | (1UL << 10);
}
static void stm32_set_high(uint8_t pin) { *(volatile uint32_t *)0x40020018UL = (1UL << pin); }
static void stm32_set_low(uint8_t pin)  { *(volatile uint32_t *)0x40020018UL = (1UL << (pin + 16U)); }
static bool stm32_read(uint8_t pin)     { return (*(volatile uint32_t *)0x40020010UL & (1UL << pin)) != 0UL; }`,
        cmsisStruct: `const hal_gpio_driver_t HAL_GPIO_STM32 = {
    .init     = stm32_init,
    .set_high = stm32_set_high,
    .set_low  = stm32_set_low,
    .read     = stm32_read
};`,
        proDriver: `// En Cortex-M4, el hardware tiene dos punteros de pila físicos:
// MSP (Main Stack Pointer): Usado por el Kernel del RTOS y todas las Interrupciones (ISR)
// PSP (Process Stack Pointer): Usado por las tareas de usuario de FreeRTOS / Zephyr`,
        asmInsight: 'Tener MSP y PSP separados en el silicio de ARM Cortex-M evita que las interrupciones anidadas desborden la pequeña pila de una tarea.',
        hardwareNote: 'Además incluye el periférico MPU (Memory Protection Unit) para aislar regiones de memoria entre tareas.'
      },
      esp32c3: {
        rawPointer: `// Implementación del mismo Driver Unificado para ESP32-C3 (hal_gpio_esp32c3.c)
static void esp32_init(void)            { *(volatile uint32_t *)0x60004024UL = (1UL << 5); }
static void esp32_set_high(uint8_t pin) { *(volatile uint32_t *)0x60004008UL = (1UL << pin); }
static void esp32_set_low(uint8_t pin)  { *(volatile uint32_t *)0x6000400CUL = (1UL << pin); }
static bool esp32_read(uint8_t pin)     { return (*(volatile uint32_t *)0x6000403CUL & (1UL << pin)) != 0UL; }`,
        cmsisStruct: `const hal_gpio_driver_t HAL_GPIO_ESP32C3 = {
    .init     = esp32_init,
    .set_high = esp32_set_high,
    .set_low  = esp32_set_low,
    .read     = esp32_read
};`,
        proDriver: `// En ESP-IDF, FreeRTOS viene integrado de serie:
void sensor_task(void *pvParameters) {
    const hal_gpio_driver_t *hal = (const hal_gpio_driver_t *)pvParameters;
    while (1) {
        hal->set_high(5);
        vTaskDelay(pdMS_TO_TICKS(500)); // Duerme la tarea y cede la CPU a Wi-Fi/BLE
    }
}`,
        asmInsight: 'Cuando llamas a vTaskDelay(), la tarea pasa de la lista Ready a la lista Delayed y el planificador pone la CPU en bajo consumo si no hay otras tareas listas.',
        hardwareNote: 'Nunca uses bucles vacíos de espera cuando trabajes con un stack de radiofrecuencia como Wi-Fi o Bluetooth.'
      },
      nrf52840: {
        rawPointer: `// Implementación del mismo Driver Unificado para nRF52840 (hal_gpio_nrf52.c)
static void nrf_init(void)            { *(volatile uint32_t *)0x50000518UL = (1UL << 5); }
static void nrf_set_high(uint8_t pin) { *(volatile uint32_t *)0x50000508UL = (1UL << pin); }
static void nrf_set_low(uint8_t pin)  { *(volatile uint32_t *)0x5000050CUL = (1UL << pin); }
static bool nrf_read(uint8_t pin)     { return (*(volatile uint32_t *)0x50000510UL & (1UL << pin)) != 0UL; }`,
        cmsisStruct: `const hal_gpio_driver_t HAL_GPIO_NRF52 = {
    .init     = nrf_init,
    .set_high = nrf_set_high,
    .set_low  = nrf_set_low,
    .read     = nrf_read
};`,
        proDriver: `// En Nordic el ecosistema industrial moderno utiliza Zephyr RTOS con modo Tickless Idle:
// Si la próxima tarea debe ejecutarse dentro de 4 segundos, el RTOS apaga incluso el SysTick
// y programa el RTC de ultra-bajo consumo (32.768 kHz) para despertar dentro de 4 segundos.`,
        asmInsight: 'El modo Tickless Idle evita despertar a la CPU 1000 veces por segundo cuando el dispositivo está en reposo.',
        hardwareNote: 'Así es como un sensor industrial con RTOS logra funcionar años con una pila CR2032.'
      },
      rp2040: {
        rawPointer: `// Implementación del mismo Driver Unificado para RP2040 (hal_gpio_rp2040.c)
static void rp2040_init(void) {
    *(volatile uint32_t *)0x4001402CUL = 5UL;
    *(volatile uint32_t *)0xD0000024UL = (1UL << 5);
}
static void rp2040_set_high(uint8_t pin) { *(volatile uint32_t *)0xD0000014UL = (1UL << pin); }
static void rp2040_set_low(uint8_t pin)  { *(volatile uint32_t *)0xD0000018UL = (1UL << pin); }
static bool rp2040_read(uint8_t pin)     { return (*(volatile uint32_t *)0xD0000004UL & (1UL << pin)) != 0UL; }`,
        cmsisStruct: `const hal_gpio_driver_t HAL_GPIO_RP2040 = {
    .init     = rp2040_init,
    .set_high = rp2040_set_high,
    .set_low  = rp2040_set_low,
    .read     = rp2040_read
};`,
        proDriver: `// Comunicación segura entre Core 0 y Core 1 mediante la FIFO hardware del bloque SIO:
void send_msg_to_core1(uint32_t cmd) {
    while ((sio_hw->fifo_st & SIO_FIFO_ST_RDY_BITS) == 0UL) { } // Espera hueco en FIFO
    sio_hw->fifo_wr = cmd;
    __sev(); // Send Event: despierta al otro núcleo si estaba en WFE
}`,
        asmInsight: 'La instrucción ARM __sev() (Send Event) despierta instantáneamente al segundo núcleo que esté esperando en una instrucción __wfe().',
        hardwareNote: 'Además de FreeRTOS SMP (Symmetric Multiprocessing), puedes correr una FSM determinista en Core 1 y el protocolo de comunicaciones en Core 0.'
      }
    },
    challenge: {
      question: 'Reto de Graduación Experto — Diseño de Firmware Industrial Portable y Robusto',
      scenario:
        'Tu empresa fabrica un controlador industrial con un STM32F4, pero por rotura de stock debes soportar también placas con ESP32-C3 y nRF52840 manteniendo exactamente la misma lógica de control de estados (FSM). ¿Cuál es la arquitectura de software en C recomendada en la industria?',
      options: [
        {
          id: 'a',
          label: 'Duplicar todo el proyecto en 3 carpetas distintas y reescribir la máquina de estados desde cero con los registros de cada chip.',
          isCorrect: false,
          feedback: 'Cualquier corrección de un bug en la lógica del producto obligaría a mantener 3 bases de código divergentes, multiplicando los errores.'
        },
        {
          id: 'b',
          label: 'Separar la capa de aplicación (FSM pura) de la capa de hardware (HAL/Driver) mediante una interfaz de structs y punteros a funciones, donde solo cambia la implementación de bajo nivel de cada MCU.',
          isCorrect: true,
          feedback: '¡Enhorabuena, piensas como un Arquitecto de Firmware Senior! La máquina de estados y las reglas del producto son 100% agnósticas del silicio, y el driver encapsula los registros específicos de cada fabricante.'
        },
        {
          id: 'c',
          label: 'Llenar cada línea de cada función de negocio con decenas de #ifdef STM32 ... #elif ESP32 ... #endif mezclados con la lógica.',
          isCorrect: false,
          feedback: 'Abusar de #ifdef dentro de la lógica de aplicación hace que el código sea ilegible e imposible de probar en tests unitarios.'
        }
      ]
    }
  },

  {
    id: 9,
    slug: 'proyectos-multi-archivo-creacion-librerias-const-union-y-toolchain',
    title: 'Módulo 9: Proyectos Multi-Archivo (.h y .c), Creación de Librerías, "static/const/union" y Toolchain',
    subtitle: 'Cómo dividir un programa en varios archivos, crear tus propias librerías reutilizables, dominar static/extern/const/union y entender qué hacen el Compilador (.o), el Archiver (.a) y el Linker (.elf / .map)',
    level: 'Experto Industrial',
    duration: '80 min',
    recommendedLab: 'multi-file-toolchain',
    superficialMyth:
      'Los cursos básicos escriben todo el programa en un único archivo gigante main.c o te dicen "pon los prototipos en el .h y el código en el .c" sin explicar por qué salen los errores "multiple definition of..." o "undefined reference to...", cómo encapsular con static o cómo empaquetar una librería real.',
    overwhelmingDatasheet:
      'Los manuales de GNU Toolchain (arm-none-eabi-gcc / avr-gcc / riscv32-esp-elf-gcc) hablan de "Translation Units, Internal vs External Linkage, .rodata section placement, Archive Symbol Table ranlib y Garbage Collection of unused input sections (--gc-sections)".',
    theBridgeExplanation:
      'En el mundo real jamás se escribe un producto en un solo archivo. Cada módulo funcional (ej. motor, sensor, protocolo) es una Librería compuesta por dos archivos: 1) El archivo de cabecera (.h), que es el "menú del restaurante" o contrato público (solo contiene guardas #ifndef, tipos typedef y declaraciones de funciones sin cuerpo), y 2) El archivo de código (.c), que es la "cocina privada" donde vive la implementación real y las variables internas ocultas con la palabra "static". El compilador traduce cada archivo .c por separado a un archivo objeto (.o) y finalmente el Enlazador (Linker) une todos los .o y las librerías (.a) en el binario final (.elf / .bin).',
    keyTakeaways: [
      {
        title: '1. La Regla de Oro entre el Archivo .h (Contrato Público) y el .c (Cocina Privada)',
        concept: 'En el archivo .h NUNCA se definen variables con reserva de memoria ni funciones normales con cuerpo (salvo static inline), porque si dos archivos .c incluyen ese .h, ambos crearán una copia de la misma variable y el Linker fallará con "multiple definition". En el .h solo van declaraciones; en el .c van las definiciones.',
        codeSnippet: `/* === En motor_lib.h (Público) === */\n#ifndef MOTOR_LIB_H\n#define MOTOR_LIB_H\n#include <stdint.h>\nvoid motor_set_rpm(uint16_t rpm); // Declaración (Prototipo)\n#endif\n\n/* === En motor_lib.c (Privado) === */\n#include "motor_lib.h"\nstatic uint16_t rpm_actual = 0;   // "static": Invisible fuera de motor_lib.c!\nvoid motor_set_rpm(uint16_t rpm) {\n    rpm_actual = rpm;\n}`
      },
      {
        title: '2. "static", "extern" y "const" en Sistemas Embebidos (Flash vs RAM)',
        concept: '1) "static" fuera de una función oculta esa variable o función dentro de ese archivo .c (Encapsulación). 2) "extern" en un .h anuncia que una variable existe en algún .c sin volver a crearla. 3) "const" en una tabla o configuración ordena al Linker guardarla en la memoria Flash (.rodata) en lugar de gastar tu preciada memoria SRAM.',
        codeSnippet: `// ¡En un MCU con poca RAM, "const" es vital!\n// Sin const -> Gasta 256 bytes de Flash Y 256 bytes de RAM (.data)\n// Con const -> Vive solo en Flash (.rodata) y gasta 0 bytes de RAM:\nstatic const uint16_t TABLA_CURVA_NTC[64] = { 4090, 3980, 3810, /* ... */ };`
      },
      {
        title: '3. "union" para Serialización Binaria y Creación de Librerías Estáticas (.a)',
        concept: 'Una "union" permite que varios tipos (ej. un uint32_t y un array uint8_t bytes[4]) compartan exactamente los mismos 4 bytes físicos de RAM, ideal para empaquetar tramas de comunicación. Y cuando tu librería (.c) está lista, puedes compilarla a .o y empaquetarla en un archivo .a con "ar rcs libmidriver.a".',
        codeSnippet: `typedef union {\n    uint32_t valor_32b;\n    uint8_t  bytes[4]; // Comparte los mismos 4 bytes en RAM!\n} paquete_32b_t;\n\n// Comandos reales para crear una librería estática .a:\n// arm-none-eabi-gcc -c motor_lib.c -o motor_lib.o\n// arm-none-eabi-ar rcs libmotor.a motor_lib.o`
      }
    ],
    mcuCode: {
      atmega328p: {
        rawPointer: `// === ARCHIVO 1: led_lib.h (Interfaz Pública para ATmega328P) ===
#ifndef LED_LIB_H
#define LED_LIB_H
#include <stdint.h>

typedef struct {
    volatile uint8_t *ddr_reg;
    volatile uint8_t *port_reg;
    uint8_t           pin_num;
} led_handle_t;

void led_init(const led_handle_t *hled);
void led_toggle(const led_handle_t *hled);
#endif`,
        cmsisStruct: `// === ARCHIVO 2: led_lib.c (Implementación Privada) ===
#include "led_lib.h"

// Variable privada oculta a main.c gracias a "static":
static uint32_t total_conmutaciones = 0;

void led_init(const led_handle_t *hled) {
    *(hled->ddr_reg) |= (uint8_t)(1U << hled->pin_num);
}

void led_toggle(const led_handle_t *hled) {
    *(hled->port_reg) ^= (uint8_t)(1U << hled->pin_num);
    total_conmutaciones++;
}`,
        proDriver: `// === ARCHIVO 3: main.c + Comandos de Compilación avr-gcc ===
#include <avr/io.h>
#include "led_lib.h"

// "const" guarda el objeto de configuración de solo lectura:
static const led_handle_t led_placa = { &DDRB, &PORTB, 5 };

int main(void) {
    led_init(&led_placa);
    while (1) { led_toggle(&led_placa); }
}
/* Compilación multi-archivo en terminal:
   avr-gcc -mmcu=atmega328p -Os -c led_lib.c -o led_lib.o
   avr-gcc -mmcu=atmega328p -Os -c main.c -o main.o
   avr-gcc -mmcu=atmega328p main.o led_lib.o -o firmware.elf */`,
        asmInsight: 'Gracias a -ffunction-sections y -Wl,--gc-sections, si tu librería tiene 20 funciones pero main.c solo llama a 2, el Linker elimina las otras 18 del archivo .elf ahorrando Flash.',
        hardwareNote: 'En AVR de 8 bits, para que una tabla constante no se copie a los 2 KB de RAM al arrancar se acompaña const con el atributo PROGMEM (<avr/pgmspace.h>).'
      },
      stm32f401: {
        rawPointer: `// === ARCHIVO 1: gpio_lib.h (Contrato Público para STM32F4) ===
#ifndef GPIO_LIB_H
#define GPIO_LIB_H
#include <stdint.h>
#include <stdbool.h>

typedef void (*boton_evento_cb_t)(uint8_t pin); // Tipo Puntero a Función Callback

typedef struct {
    uint32_t port_base_addr;
    uint8_t  pin_number;
} gpio_pin_t;

void gpio_lib_output_init(const gpio_pin_t *pin);
void gpio_lib_write(const gpio_pin_t *pin, bool high);
void gpio_lib_register_callback(boton_evento_cb_t cb);
#endif`,
        cmsisStruct: `// === ARCHIVO 2: gpio_lib.c (Implementación Oculta y Encapsulada) ===
#include "gpio_lib.h"
#include "stm32f4xx.h"

// Estado privado del módulo: ningún otro archivo .c puede tocarlo directamente
static boton_evento_cb_t s_user_callback = 0;

void gpio_lib_output_init(const gpio_pin_t *pin) {
    GPIO_TypeDef *port = (GPIO_TypeDef *)pin->port_base_addr;
    port->MODER = (port->MODER & ~(3UL << (pin->pin_number * 2U)))
                | (1UL << (pin->pin_number * 2U));
}

void gpio_lib_write(const gpio_pin_t *pin, bool high) {
    GPIO_TypeDef *port = (GPIO_TypeDef *)pin->port_base_addr;
    port->BSRR = high ? (1UL << pin->pin_number) : (1UL << (pin->pin_number + 16U));
}

void gpio_lib_register_callback(boton_evento_cb_t cb) {
    s_user_callback = cb;
}`,
        proDriver: `// === ARCHIVO 3: main.c + Empaquetado en Librería Estática (.a) ===
#include "gpio_lib.h"

// "const" en ARM Cortex-M deja esta estructura en Flash (0x0800xxxx) gastando 0 bytes de SRAM:
static const gpio_pin_t LED_ALARMA = { 0x40020000UL, 5U };

static void al_pulsar_emergencia(uint8_t pin) {
    (void)pin;
    gpio_lib_write(&LED_ALARMA, true);
}

int main(void) {
    gpio_lib_output_init(&LED_ALARMA);
    gpio_lib_register_callback(al_pulsar_emergencia);
    while (1) { }
}
/* Crear librería estática libgpio.a y enlazar con Mapa de Memoria (.map):
   arm-none-eabi-gcc -mcpu=cortex-m4 -mthumb -Os -c gpio_lib.c -o gpio_lib.o
   arm-none-eabi-ar rcs libgpio.a gpio_lib.o
   arm-none-eabi-gcc -mcpu=cortex-m4 -mthumb main.c -L. -lgpio -T stm32f4.ld -Wl,-Map=firmware.map -o firmware.elf */`,
        asmInsight: 'En ARM Cortex-M (arquitectura de bus unificado), cualquier variable global marcada como "const" se coloca automáticamente en la sección .rodata de la memoria Flash y se lee directamente sin gastar ni 1 byte de SRAM.',
        hardwareNote: 'El archivo generado firmware.map te muestra byte a byte cuánta Flash (.text / .rodata) y cuánta RAM (.data / .bss) consume cada archivo .o y cada librería .a.'
      },
      esp32c3: {
        rawPointer: `// === Estructura de Componente Reusable en ESP32-C3 (sensor_pkt.h) ===
#ifndef SENSOR_PKT_H
#define SENSOR_PKT_H
#include <stdint.h>

// Unión para serializar un uint32_t en 4 bytes sin desplazamientos manuales:
typedef union {
    struct {
        uint16_t temp_decimas;
        uint16_t hum_decimas;
    } campos;
    uint32_t palabra_32b;
    uint8_t  raw_bytes[4];
} trama_clima_u;

uint8_t sensor_pkt_calc_crc8(const uint8_t *data, uint8_t len);
#endif`,
        cmsisStruct: `// === Implementación Privada en sensor_pkt.c ===
#include "sensor_pkt.h"

// Función auxiliar privada ("static") invisible fuera de sensor_pkt.c:
static uint8_t crc8_step(uint8_t crc, uint8_t byte) {
    crc ^= byte;
    for (uint8_t i = 0; i < 8U; i++) {
        crc = (crc & 0x80U) ? (uint8_t)((crc << 1U) ^ 0x07U) : (uint8_t)(crc << 1U);
    }
    return crc;
}

uint8_t sensor_pkt_calc_crc8(const uint8_t *data, uint8_t len) {
    uint8_t crc = 0x00U;
    for (uint8_t i = 0; i < len; i++) {
        crc = crc8_step(crc, data[i]);
    }
    return crc;
}`,
        proDriver: `// === Registro del Componente como Librería en CMakeLists.txt (ESP-IDF) ===
/* En components/sensor_pkt/CMakeLists.txt:
   idf_component_register(
       SRCS "sensor_pkt.c"
       INCLUDE_DIRS "include"
   )
*/
#include "sensor_pkt.h"

void enviar_telemetria(void) {
    trama_clima_u pkt;
    pkt.campos.temp_decimas = 245U; // 24.5 ºC
    pkt.campos.hum_decimas  = 600U; // 60.0 %
    uint8_t crc = sensor_pkt_calc_crc8(pkt.raw_bytes, 4U);
    (void)crc;
}`,
        asmInsight: 'Al escribir en pkt.campos.temp_decimas y leer pkt.raw_bytes[0..3], el procesador RISC-V accede a las mismas direcciones de memoria en 1 ciclo.',
        hardwareNote: 'En el ecosistema profesional del ESP32-C3 (ESP-IDF), cada librería propia se guarda en una subcarpeta dentro de components/ con su propio CMakeLists.txt.'
      },
      nrf52840: {
        rawPointer: `// === Librería Multi-Instancia con Puntero Opaco en nRF52840 (pwm_led.h) ===
#ifndef PWM_LED_H
#define PWM_LED_H
#include <stdint.h>

typedef struct {
    uint8_t  pin;
    uint16_t brillo_actual;
} pwm_led_t;

void pwm_led_init(pwm_led_t *instancia, uint8_t pin);
void pwm_led_set_brillo(pwm_led_t *instancia, uint16_t porcentaje);
#endif`,
        cmsisStruct: `// === Implementación en pwm_led.c ===
#include "pwm_led.h"
#include "nrf.h"

void pwm_led_init(pwm_led_t *instancia, uint8_t pin) {
    instancia->pin = pin;
    instancia->brillo_actual = 0U;
    NRF_P0->DIRSET = (1UL << pin);
}

void pwm_led_set_brillo(pwm_led_t *instancia, uint16_t porcentaje) {
    instancia->brillo_actual = (porcentaje > 100U) ? 100U : porcentaje;
}`,
        proDriver: `// === Uso de Múltiples Instancias Independientes en main.c ===
#include "pwm_led.h"

// Tres objetos independientes gestionados por la misma librería en C:
static pwm_led_t led_rojo;
static pwm_led_t led_verde;
static pwm_led_t led_azul;

void app_init(void) {
    pwm_led_init(&led_rojo,  13U);
    pwm_led_init(&led_verde, 14U);
    pwm_led_init(&led_azul,  15U);
    pwm_led_set_brillo(&led_verde, 80U);
}`,
        asmInsight: 'Pasar un puntero a la estructura de estado (pwm_led_t *instancia) como primer argumento es exactamente como funcionan los objetos ("this" o "self") por debajo en C++ o Rust.',
        hardwareNote: 'En el SDK de Nordic (nRF5 SDK y Zephyr), absolutamente todos los drivers utilizan este patrón de instancias por estructura.'
      },
      rp2040: {
        rawPointer: `// === Librería con Funciones Inline Ultrarrápidas en Header (sio_fast.h) ===
#ifndef SIO_FAST_H
#define SIO_FAST_H
#include <stdint.h>

// Excepción a la regla: "static inline" SÍ puede llevar cuerpo en un .h
// porque el compilador la incrusta en cada llamada sin exportar símbolo global:
static inline void sio_fast_pin_high(uint8_t pin) {
    *(volatile uint32_t *)0xD0000014UL = (1UL << pin);
}

static inline void sio_fast_pin_low(uint8_t pin) {
    *(volatile uint32_t *)0xD0000018UL = (1UL << pin);
}
#endif`,
        cmsisStruct: `// === CMakeLists.txt Profesional en Pico SDK (RP2040) ===
/*
cmake_minimum_required(VERSION 3.13)
include(pico_sdk_import.cmake)
project(mi_firmware_pro C CXX ASM)
pico_sdk_init()

# Creamos nuestra librería reutilizable:
add_library(mi_driver_motor STATIC
    drivers/motor_control.c
)
target_include_directories(mi_driver_motor PUBLIC drivers/include)

# Creamos el ejecutable y le enlazamos nuestra librería:
add_executable(app_robot main.c)
target_link_libraries(app_robot pico_stdlib mi_driver_motor)
pico_add_extra_outputs(app_robot) # Genera .uf2, .bin, .hex y .dis
*/`,
        proDriver: `// Colocación explícita de una función crítica de librería en SRAM en RP2040:
#include "sio_fast.h"

// En RP2040 la Flash es externa (QSPI). Si una función de tu librería es ultra-crítica,
// la macro __not_in_flash_func() la coloca en SRAM para ejecutarse en 1 ciclo sin caché:
void __attribute__((section(".time_critical"))) pulso_nanosegundos(uint8_t pin) {
    sio_fast_pin_high(pin);
    sio_fast_pin_low(pin);
}`,
        asmInsight: 'Las funciones declaradas como "static inline" en un .h sustituyen la llamada CALL/BL por la instrucción directa en 1 ciclo y nunca provocan error de "multiple definition".',
        hardwareNote: 'El comando pico_add_extra_outputs() genera además el archivo .dis (desensamblado completo de tu proyecto) y el .map.'
      }
    },
    challenge: {
      question: 'Reto de Ingeniería 9 — El Clásico Error de Enlazado al Crear una Librería (.h / .c)',
      scenario:
        'Estás creando tu primera librería "sensor.h" y "sensor.c". Dentro del archivo de cabecera "sensor.h" escribes: int32_t ultima_temperatura = 25; y luego incluyes #include "sensor.h" tanto en "sensor.c" como en "main.c". Al compilar el proyecto, el Linker falla con el error: "multiple definition of `ultima_temperatura`". ¿Por qué ocurre y cómo lo arregla un Senior?',
      options: [
        {
          id: 'a',
          label: 'Porque #include copia y pega el texto de sensor.h en ambos archivos .c, creando dos variables globales con el mismo nombre en sensor.o y main.o. Se arregla definiendo la variable en sensor.c (idealmente "static" con una función getter, o poniendo solo "extern int32_t ultima_temperatura;" en el .h).',
          isCorrect: true,
          feedback: '¡Exacto! Jamás se debe definir una variable global con reserva de memoria dentro de un archivo .h. En el .c se define la variable real (o se encapsula con static) y en el .h solo se ponen declaraciones.'
        },
        {
          id: 'b',
          label: 'Porque falta quitar #ifndef SENSOR_H del archivo de cabecera.',
          isCorrect: false,
          feedback: 'Las guardas #ifndef evitan que un mismo archivo .c incluya dos veces el .h, pero sensor.c y main.c se compilan en unidades de traducción separadas (.o), por lo que ambos crean la variable.'
        },
        {
          id: 'c',
          label: 'Porque en C no se permite incluir el mismo archivo .h en más de un archivo .c.',
          isCorrect: false,
          feedback: 'Precisamente el propósito de un archivo .h es ser incluido por tantos archivos .c como necesiten usar esa librería.'
        }
      ]
    }
  },

  {
    id: 10,
    slug: 'ingenieria-senior-bootloaders-ota-hardfault-misra-c-pid-y-testing',
    title: 'Módulo 10: Nivel Senior Industrial — Bootloaders (OTA), Depuración HardFault, MISRA-C, PID y Testing',
    subtitle: 'Lo que separa a un programador de un Ingeniero Senior: particionado de Flash y salto de Bootloader, diagnóstico forense de cuelgues (HardFault), reglas MISRA-C, control PID en coma fija y Tests Unitarios',
    level: 'Experto Industrial',
    duration: '90 min',
    recommendedLab: 'multi-file-toolchain',
    superficialMyth:
      'Casi ningún curso explica cómo se actualiza un producto en el campo (Bootloader + OTA), cómo averiguar por qué un microcontrolador se colgó en HardFault, qué exige la norma industrial MISRA-C o cómo probar tu código C en el PC antes de tener la placa.',
    overwhelmingDatasheet:
      'Los manuales de arquitectura ARMv7-M y normas ISO 26262 / MISRA-C:2012 exigen "Vector Table Offset Register (SCB->VTOR) relocation, Fault Status Registers (CFSR, HFSR, MMFAR, BFAR), prohibition of dynamic heap allocation (Rule 21.3) y deterministic fixed-point control loops".',
    theBridgeExplanation:
      'Cuando trabajas como Senior Embedded C Developer en la industria, tu firmware no vive conectado a tu PC en el escritorio: vive dentro de miles de máquinas, vehículos o sensores remotos. Eso exige dominar 4 pilares finales: 1) Diseñar un Bootloader que pueda actualizar la aplicación en Flash y saltar a ella reubicando la tabla de vectores (VTOR); 2) Diagnosticar cualquier cuelgue leyendo los registros de fallo (HardFault) y pintando el Stack; 3) Escribir código C determinista bajo reglas MISRA-C (cero malloc/free dinámico, tipos fijos, asserts); y 4) Implementar lazos de control reales (como un PID discreto) verificados con Tests Unitarios.',
    keyTakeaways: [
      {
        title: '1. Cómo Funciona un Bootloader y el Salto a la Aplicación en C',
        concept: 'En un producto actualizable, la Flash se divide en al menos dos regiones: el Bootloader al inicio (ej. 0x08000000, 32 KB) y la Aplicación principal más adelante (ej. 0x08008000). Al encender el chip arranca el Bootloader, comprueba el CRC de la aplicación y salta a ella cargando el nuevo Stack Pointer (MSP), cambiando SCB->VTOR = 0x08008000 y llamando al Reset_Handler de la aplicación mediante un puntero a función.',
        codeSnippet: `typedef void (*p_function_t)(void);\n\nvoid bootloader_jump_to_app(uint32_t app_flash_addr) {\n    uint32_t app_sp    = *(volatile uint32_t *)(app_flash_addr + 0U);\n    uint32_t app_entry = *(volatile uint32_t *)(app_flash_addr + 4U);\n    __disable_irq();\n    SCB->VTOR = app_flash_addr; // Reubica la Tabla de Vectores de la App!\n    __set_MSP(app_sp);          // Carga el Stack Pointer de la App\n    ((p_function_t)app_entry)(); // Salta al Reset_Handler de la App!\n}`
      },
      {
        title: '2. Diagnóstico Forense de HardFault y "Stack Painting" (0xDEADBEEF)',
        concept: 'Cuando la CPU intenta desreferenciar un puntero inválido, dividir entre 0 o ejecutar memoria corrupta, salta a HardFault_Handler(). Antes de saltar, el hardware apiló en el Stack la dirección exacta de la instrucción culpable (PC) y la función que la llamó (LR). Además, rellenando la RAM del Stack al arrancar con el patrón 0xDEADBEEF podemos medir hasta dónde ha crecido la pila en el peor caso (High-Water Mark).',
        codeSnippet: `// Leyendo en HardFault qué instrucción exacta (PC) rompió el sistema:\nvoid HardFault_Analyze(uint32_t *stack_frame) {\n    uint32_t r0  = stack_frame[0];\n    uint32_t lr  = stack_frame[5]; // Función desde la que veníamos\n    uint32_t pc  = stack_frame[6]; // ¡Dirección exacta de la línea C que falló!\n    uint32_t cfsr = SCB->CFSR;     // Motivo físico del fallo en silicio\n    (void)r0; (void)lr; (void)pc; (void)cfsr;\n    while (1) { } // Parada segura con actuadores apagados\n}`
      },
      {
        title: '3. Reglas de Oro MISRA-C y Controlador PID en Coma Fija',
        concept: 'En firmware crítico (MISRA-C) está prohibido usar malloc()/free() en tiempo de ejecución porque fragmenta la pequeña RAM hasta agotar el Heap de forma impredecible: toda la memoria se reserva estáticamente. Y para controlar motores, calefactores o fuentes de potencia se usa un lazo PID discreto ejecutado a intervalo fijo.',
        codeSnippet: `// Regla MISRA-C 21.3: Cero malloc() dinámico; usa siempre buffers estáticos.\n// Verificación en tiempo de compilación (C11 _Static_assert):\n_Static_assert(sizeof(trama_can_t) == 8U, "Error: La trama CAN debe medir 8 bytes exactos");`
      }
    ],
    mcuCode: {
      atmega328p: {
        rawPointer: `// ATmega328P: Salto desde Bootloader (Sección BLS) a la Aplicación en 0x0000
// y lectura del motivo del último Reset en el registro MCUSR (Dirección 0x54)
#define MCUSR_REG (*(volatile uint8_t *)0x54)

typedef void (*app_start_t)(void);

void bootloader_check_and_jump(void) {
    uint8_t causa_reset = MCUSR_REG;
    MCUSR_REG = 0x00U; // Limpia banderas (Power-On, Brown-Out, Watchdog, External)
    (void)causa_reset;
    app_start_t jump_to_zero = (app_start_t)0x0000;
    jump_to_zero(); // Salta al inicio de la Flash de aplicación
}`,
        cmsisStruct: `#include <avr/io.h>
#include <avr/wdt.h>

// Diagnóstico de causa de reinicio al arrancar main():
uint8_t inspect_reset_cause(void) {
    uint8_t mcusr_copy = MCUSR;
    MCUSR = 0;
    wdt_disable(); // Importante en AVR: tras un reset por Watchdog, el WDT sigue activo!
    if (mcusr_copy & (1U << WDRF)) {
        // ¡El sistema se recuperó de un cuelgue gracias al Watchdog!
    }
    return mcusr_copy;
}`,
        proDriver: `// Controlador Proporcional-Integral (PI) en Enteros de 16/32 bits para AVR (Sin float):
int16_t pi_controller_step(int16_t setpoint, int16_t medida_actual) {
    static int32_t integral_acc = 0;
    int16_t error = setpoint - medida_actual;
    integral_acc += (int32_t)error * 4L; // Ki escalado
    // Anti-Windup: saturamos el acumulador integral para que nunca desborde:
    if (integral_acc > 16000L)  integral_acc = 16000L;
    if (integral_acc < -16000L) integral_acc = -16000L;
    int32_t salida = ((int32_t)error * 12L + integral_acc) >> 4; // Divide entre 16
    return (int16_t)salida;
}`,
        asmInsight: 'En el ATmega328P, una operación float en software ocupa más de 100 ciclos de reloj, mientras que el controlador PI en coma fija con >> 4 tarda menos de 20 ciclos.',
        hardwareNote: 'Los fusibles BOOTSZ y BOOTRST del ATmega328P deciden si al encender el chip la CPU empieza a ejecutar en 0x0000 (App) o al final de la Flash (Bootloader).'
      },
      stm32f401: {
        rawPointer: `// STM32F401: Salto Completo de Bootloader (0x08000000) a Aplicación (0x08008000)
#define APP_FLASH_BASE   0x08008000UL
#define SCB_VTOR_REG     (*(volatile uint32_t *)0xE000ED08UL)

typedef void (*app_reset_fn_t)(void);

void stm32_bootloader_jump(void) {
    uint32_t app_stack_ptr = *(volatile uint32_t *)(APP_FLASH_BASE + 0x00UL);
    uint32_t app_reset_vec = *(volatile uint32_t *)(APP_FLASH_BASE + 0x04UL);

    // 1. Verifica que en 0x08008000 hay un Stack Pointer válido apuntando a SRAM (0x2000xxxx):
    if ((app_stack_ptr & 0x2FFE0000UL) == 0x20000000UL) {
        __asm volatile ("cpsid i");          // Desactiva interrupciones
        SCB_VTOR_REG = APP_FLASH_BASE;       // Reubica Vector Table a 0x08008000
        __asm volatile ("msr msp, %0" : : "r" (app_stack_ptr)); // Nuevo Stack Pointer
        ((app_reset_fn_t)app_reset_vec)();   // ¡Salta a la Aplicación!
    }
}`,
        cmsisStruct: `#include "stm32f4xx.h"

// Inspector de Causa de Reset en el registro RCC->CSR (Vital en Producción):
void log_system_reset_reason(void) {
    uint32_t csr = RCC->CSR;
    if (csr & RCC_CSR_IWDGRSTF) {
        // Reinicio provocado por Watchdog -> Guardar diagnóstico en Flash/EEPROM
    } else if (csr & RCC_CSR_BORRSTF) {
        // Caída de tensión en la fuente de alimentación (Brown-Out Reset)
    }
    RCC->CSR |= RCC_CSR_RMVF; // Limpia las banderas de causa de reset
}`,
        proDriver: `// Controlador PID Industrial Discreto con Anti-Windup y Límites de Salida (MISRA-C Clean):
typedef struct {
    int32_t kp_q8;        // Ganancia Proporcional escalada x256 (Q8)
    int32_t ki_q8;        // Ganancia Integral escalada x256
    int32_t kd_q8;        // Ganancia Derivativa escalada x256
    int32_t integral_acc;
    int32_t prev_error;
    int32_t out_max;
} pid_ctrl_t;

int32_t pid_compute_q8(pid_ctrl_t *pid, int32_t setpoint, int32_t measurement) {
    int32_t err = setpoint - measurement;
    pid->integral_acc += (err * pid->ki_q8) >> 8;
    if (pid->integral_acc > pid->out_max)  pid->integral_acc = pid->out_max;
    if (pid->integral_acc < -pid->out_max) pid->integral_acc = -pid->out_max;
    int32_t deriv = ((err - pid->prev_error) * pid->kd_q8) >> 8;
    pid->prev_error = err;
    int32_t out = ((err * pid->kp_q8) >> 8) + pid->integral_acc + deriv;
    return (out > pid->out_max) ? pid->out_max : (out < 0 ? 0 : out);
}`,
        asmInsight: 'La comprobación ((app_stack_ptr & 0x2FFE0000) == 0x20000000) evita saltar a una región de Flash vacía (0xFFFFFFFF) que provocaría un HardFault instantáneo.',
        hardwareNote: 'Si olvidas actualizar SCB->VTOR = 0x08008000 antes de saltar a la aplicación, en cuanto ocurra la primera interrupción (SysTick) la CPU buscará el vector en 0x08000000 (el Bootloader) en lugar de en la aplicación.'
      },
      esp32c3: {
        rawPointer: `// ESP32-C3 (RISC-V): Lectura del Registro de Causa de Excepción/Fallo (mcause)
static inline uint32_t riscv_read_mcause(void) {
    uint32_t mcause_val;
    __asm volatile ("csrr %0, mcause" : "=r"(mcause_val));
    return mcause_val; // Indica si fue instrucción ilegal, acceso nulo, etc.
}

static inline uint32_t riscv_read_mepc(void) {
    uint32_t mepc_val;
    __asm volatile ("csrr %0, mepc" : "=r"(mepc_val));
    return mepc_val;   // Dirección exacta de la instrucción C que causó el fallo!
}`,
        cmsisStruct: `// Tabla de Particiones OTA (Over-The-Air) típica en ESP32-C3:
// nvs,      data, nvs,      0x9000,   0x6000
// otadata,  data, ota,      0xf000,   0x2000
// ota_0,    app,  ota_0,    0x10000,  0x180000 (1.5 MB - Firmware A)
// ota_1,    app,  ota_1,    0x190000, 0x180000 (1.5 MB - Firmware B)`,
        proDriver: `// Patrón de Actualización OTA con Rollback Automático si el Nuevo Firmware Falla:
void app_verify_self_test_on_boot(bool sensors_healthy) {
    if (sensors_healthy) {
        // Confirmamos al Bootloader que la nueva versión OTA funciona bien:
        // esp_ota_mark_app_valid_cancel_rollback();
    } else {
        // Si el auto-test falla tras actualizar, reiniciamos y el Bootloader
        // vuelve automáticamente a la partición anterior (ota_0)!
        // esp_ota_mark_app_invalid_rollback_and_reboot();
    }
}`,
        asmInsight: 'En arquitectura RISC-V, el registro CSR "mepc" (Machine Exception Program Counter) cumple el mismo papel forense que el PC apilado en ARM Cortex-M.',
        hardwareNote: 'El sistema de doble partición A/B (ota_0 y ota_1) garantiza que un dispositivo jamás quede inutilizado ("bricked") aunque se corte la electricidad a mitad de una descarga.'
      },
      nrf52840: {
        rawPointer: `// nRF52840: Registro RESETREAS (0x40000400) y Técnica de Stack Painting (0xDEADBEEF)
#define NRF_POWER_RESETREAS (*(volatile uint32_t *)0x40000400UL)

void paint_stack_memory(uint32_t *stack_bottom, uint32_t words) {
    for (uint32_t i = 0; i < words; i++) {
        stack_bottom[i] = 0xDEADBEEFUL; // Pintamos la pila con patrón conocido
    }
}

uint32_t measure_unused_stack_bytes(const uint32_t *stack_bottom, uint32_t words) {
    uint32_t free_words = 0U;
    while (free_words < words && stack_bottom[free_words] == 0xDEADBEEFUL) {
        free_words++;
    }
    return free_words * 4U; // Margen real que nunca llegó a ser pisado por el Stack
}`,
        cmsisStruct: `#include "nrf.h"

// Assert Defensivo de Producción (Guarda línea y archivo antes de reiniciar de forma segura):
typedef struct {
    const char *file;
    uint32_t    line;
    uint32_t    error_code;
} crash_log_t;

volatile crash_log_t g_last_crash __attribute__((section(".noinit")));

#define FIRMWARE_ASSERT(cond) do { \\
    if (!(cond)) { \\
        g_last_crash.file = __FILE__; \\
        g_last_crash.line = __LINE__; \\
        NVIC_SystemReset(); \\
    } \\
} while (0)`,
        proDriver: `// Uso de sección .noinit en SRAM para conservar el diagnóstico tras un Reset por Software/Watchdog:
void check_previous_crash_on_boot(void) {
    if (NRF_POWER->RESETREAS & POWER_RESETREAS_SREQ_Msk) {
        // El chip se reinició por nuestro FIRMWARE_ASSERT!
        // Podemos enviar g_last_crash.file y g_last_crash.line por BLE/UART al servidor.
    }
    NRF_POWER->RESETREAS = 0xFFFFFFFFUL; // Limpia registro escribiendo 1s
}`,
        asmInsight: 'Una variable ubicada en la sección ".noinit" de SRAM NO es borrada a 0 por el Reset_Handler al reiniciar, conservando intactos los datos del fallo ocurrido un milisegundo antes del Reset.',
        hardwareNote: 'Esta técnica (.noinit crash log + RESETREAS) es el estándar utilizado en dispositivos médicos y wearables comerciales para diagnosticar fallos remotos.'
      },
      rp2040: {
        rawPointer: `// RP2040: Arranque en 2 Etapas (Boot2 de 256 bytes en SRAM + CRC32) y Watchdog Scratch
// El RP2040 incluye 8 registros "Scratch" en el Watchdog (0x4005800C..0x40058028)
// que sobreviven a reinicios para pasar comandos al Bootloader:
#define WDG_SCRATCH0_REG (*(volatile uint32_t *)0x4005800CUL)
#define BOOTLOADER_MAGIC 0xB007C0DEUL

void request_bootloader_ota_mode(void) {
    WDG_SCRATCH0_REG = BOOTLOADER_MAGIC; // Deja mensaje persistente para el Bootloader
    // Dispara reset inmediato:
    *(volatile uint32_t *)0xE000ED0CUL = (0x5FAUL << 16) | (1UL << 2); // AIRCR SYSRESETREQ
}`,
        cmsisStruct: `// En el arranque del Bootloader del RP2040:
bool should_stay_in_bootloader(void) {
    if (watchdog_hw->scratch[0] == 0xB007C0DEUL) {
        watchdog_hw->scratch[0] = 0UL; // Limpia la bandera
        return true; // Quedarse esperando nuevo firmware por USB/UART
    }
    return false; // Saltar a la aplicación normal
}`,
        proDriver: `// Test Unitario Off-Target (Ejecutable en tu PC con GCC antes de tener el RP2040):
#include <assert.h>
#include <stdint.h>

// Mock del registro en memoria de tu PC:
static uint32_t mock_gpio_set_reg = 0;

void driver_bajo_prueba_encender_pin(uint32_t *reg_set, uint8_t pin) {
    if (reg_set == 0 || pin > 29U) return; // Protección defensiva MISRA-C
    *reg_set = (1UL << pin);
}

void test_driver_en_pc(void) {
    mock_gpio_set_reg = 0;
    driver_bajo_prueba_encender_pin(&mock_gpio_set_reg, 5U);
    assert(mock_gpio_set_reg == (1UL << 5)); // ¡Verifica tu lógica en milisegundos!
    driver_bajo_prueba_encender_pin(&mock_gpio_set_reg, 99U); // Pin inválido -> No debe tocar el registro
    assert(mock_gpio_set_reg == (1UL << 5));
}`,
        asmInsight: 'Al inyectar la dirección del registro como parámetro (o mediante una estructura HAL), puedes compilar y correr miles de tests en tu ordenador en 0.1 segundos usando RAM normal como Mock.',
        hardwareNote: 'Escribir 0x05FA en los bits [31:16] (VECTKEY) y un 1 en el bit 2 (SYSRESETREQ) del registro ARM SCB->AIRCR reinicia limpiamente cualquier procesador Cortex-M.'
      }
    },
    challenge: {
      question: 'Reto de Graduación Senior 10 — El Bug del Bootloader que Congela la Primera Interrupción',
      scenario:
        'Has programado un Bootloader en la dirección 0x08000000 y tu Aplicación principal en la dirección 0x08008000. Tu Bootloader carga el nuevo Stack Pointer (MSP) y salta al Reset_Handler de la Aplicación. La aplicación arranca bien y entra en main(), pero en el exacto milisegundo en que salta la primera interrupción del Timer SysTick, el microcontrolador se cuelga o vuelve al Bootloader. ¿Qué línea crítica olvidaste antes de saltar?',
      options: [
        {
          id: 'a',
          label: 'Olvidaste actualizar el registro SCB->VTOR = 0x08008000UL; por lo que al ocurrir la interrupción SysTick, el hardware sigue buscando la Tabla de Vectores en la dirección 0x08000000 (la del Bootloader).',
          isCorrect: true,
          feedback: '¡Diagnóstico de Ingeniero Senior 10/10! Al saltar desde un Bootloader a una aplicación desplazada en Flash, es obligatorio apuntar SCB->VTOR a la nueva tabla de vectores de la aplicación.'
        },
        {
          id: 'b',
          label: 'Olvidaste borrar la memoria Flash del Bootloader después de saltar.',
          isCorrect: false,
          feedback: 'El Bootloader nunca debe borrarse a sí mismo; debe permanecer en el primer sector para futuros arranques y actualizaciones.'
        },
        {
          id: 'c',
          label: 'No se pueden usar interrupciones cuando un programa se carga con un Bootloader.',
          isCorrect: false,
          feedback: 'Por supuesto que se usan interrupciones; basta con reubicar el registro SCB->VTOR al inicio de la partición de la aplicación.'
        }
      ]
    }
  },
  // =========================================================================
  // MÓDULO 11: NORMATIVA ESPACIAL Y DEFENSA (EUROPA ECSS vs AMÉRICA NASA/DO-178C) Y HARDWARE RAD-HARD
  // =========================================================================
  {
    id: 11,
    slug: 'normativa-espacial-defensa-ecss-nasa-do178c-radhard-mcdc',
    title: 'Módulo 11: Normativa Aeroespacial y Defensa — Europa (ECSS-E-ST-40C / Q-ST-80C) vs América (NASA JPL / DO-178C) y Hardware Rad-Hard',
    subtitle: 'Lo que SE PUEDE, NO SE DEBE y ESTÁ PROHIBIDO en firmware crítico, Categorías A-D, los 14 Checks Annex U.2, Cobertura 100% MC/DC, HSIA y Radiación Cósmica (SEU / TMR / EDAC)',
    level: 'Experto Industrial',
    duration: '180 min',
    recommendedLab: 'space-defense-ecss',
    superficialMyth:
      '«Si mi código C compila sin errores y funciona en la mesa del laboratorio, ya sirve para volar en un satélite, un avión o un sistema de defensa».',
    overwhelmingDatasheet:
      '«ECSS-E-ST-40C Rev.1 Clause 5.8.3.5b & Annex U.2 / ECSS-Q-ST-80C Rev.2 Clause 6.2.2.8 & Table D-1: Category A software shall achieve 100% MC/DC and Object Code coverage; HSIA shall verify failure modes; S_i = (C_i + I_i + B_i) / D_i <= 1.0».',
    theBridgeExplanation:
      'En el espacio y en defensa te enfrentas a dos enemigos que no existen en proyectos domésticos: la física de la radiación cósmica (protones e iones pesados que invierten bits en la SRAM al azar provocando Single Event Upsets - SEU) y la imposibilidad de pulsar el botón de Reset a 36.000 km de altura. Por eso la Agencia Espacial Europea (ECSS-E-ST-40C Rev.1 y ECSS-Q-ST-80C Rev.2 de abril de 2025) y EE.UU. (NASA JPL Power of Ten y DO-178C) imponen reglas matemáticas estrictas sobre qué está PROHIBIDO (SHALL NOT: malloc, recursión, bucles sin cota, código muerto), qué es OBLIGATORIO (SHALL: 14 Checks del Anexo U.2, 100% MC/DC en Cat A, fronteras n-1/n/n+1, HSIA, márgenes de memoria y CPU) y cómo proteger los datos en RAM mediante Votación Triple Modular (TMR 2-de-3), EDAC Hamming y Memory Scrubbing.',
    keyTakeaways: [
      {
        title: '1. Nomenclatura ECSS (SHALL / SHOULD / MAY), Categorías A-D y Propagación de Criticidad',
        concept:
          'En ECSS (Cláusula 3.4), SHALL es obligatorio, SHOULD es recomendación fuerte y MAY es permiso. La Tabla D-1 de ECSS-Q-ST-80C clasifica el software en Cat A (Catastrófico), B (Crítico), C (Mayor) y D (Menor). Según la cláusula 6.2.2.10, si un módulo Cat D comparte RAM o CPU con uno Cat A sin aislamiento físico o MPU, ¡todo el software se eleva obligatoriamente a Categoría A!',
        codeSnippet: `// Ley de Segregación ECSS-Q-ST-80C 6.2.2.10:\n// Sin MPU/Particionado: Cat_D + Cat_A en misma RAM => ¡Todo es Cat_A (Exige 100% MC/DC)!`
      },
      {
        title: '2. Los 14 Checks de ECSS-E-ST-40C Annex U.2 y las 10 Reglas de NASA JPL',
        concept:
          'Prohibido usar malloc/free dinámico tras arrancar (Check #12 / NASA Rule 3), prohibida la recursión (NASA Rule 1), prohibido cualquier bucle while() de espera hardware sin límite superior fijo de iteraciones (Check #3 / NASA Rule 2), prohibido pasar variables locales del Stack a DMA/ISR (Check #6) y obligatorio usar volatile y exclusión mutua (Checks #8 y #14).',
        codeSnippet: `uint32_t iter = 0UL; // Cumple ECSS Annex U.2 #3 y NASA JPL Rule 2:\nwhile (((SPI1->SR & 1UL) == 0UL) && (iter < 5000UL)) { iter++; }`
      },
      {
        title: '3. Radiación Cósmica (SEU), Votación TMR 2-de-3, Cobertura 100% MC/DC y Márgenes ECSS Annex M',
        concept:
          'Para sobrevivir a bit-flips por radiación (SEU) se usa memoria EDAC Hamming, Memory Scrubbing periódico y Votación Triple Modular TMR: (a & b) | (b & c) | (a & c). Además, se auditan las dos fórmulas oficiales del Anexo M de ECSS-E-ST-40C: margin_memory = free / total y el Factor de Planificabilidad S = (C + I + B) / D <= 1.0.',
        codeSnippet: `// Votador Mayoritario TMR 2-de-3 en 1 línea sin saltos condicionales:\nuint32_t sano = (copia_a & copia_b) | (copia_b & copia_c) | (copia_a & copia_c);`
      }
    ],
    mcuCode: {
      atmega328p: {
        rawPointer: `// Normativa ECSS-E-ST-40C Annex U.2 (#14 Race Conditions & #8 volatile) en AVR 8-bit:
#include <stdint.h>

#define SREG_REG   (*(volatile uint8_t *)0x5FU)
#define PORTB_REG  (*(volatile uint8_t *)0x25U)

// Lectura atómica de telemetría de 32 bits compartida con ISR (Cumple Annex U.2 #6, #8, #14):
static volatile uint32_t s_mission_ticks = 0UL;

uint32_t ecss_safe_read_ticks(void) {
    uint8_t sreg_backup = SREG_REG;        // Guarda estado previo de interrupciones
    __asm__ volatile ("cli" ::: "memory"); // Sección crítica obligatoria en CPU de 8 bits
    uint32_t snapshot = s_mission_ticks;   // Copia coherente de los 4 bytes
    SREG_REG = sreg_backup;                // Restaura estado exacto
    return snapshot;
}`,
        cmsisStruct: `// Regla NASA JPL #2 y ECSS Annex U.2 #3: Prohibido cualquier bucle sin cota fija (Fixed Loop Bound)
#include <avr/io.h>
#include <stdint.h>

#define MAX_SPI_WAIT_CYCLES  1000U

typedef enum {
    ECSS_OK = 0,
    ECSS_ERR_HW_TIMEOUT = 1
} ecss_status_t;

ecss_status_t spi_wait_transfer_bounded(void) {
    uint16_t bound_counter = 0U;
    // Cumple NASA Rule 2: Límite superior explícito y verificable estáticamente
    while (((SPSR & (1U << SPIF)) == 0U) && (bound_counter < MAX_SPI_WAIT_CYCLES)) {
        bound_counter++;
    }
    return (bound_counter < MAX_SPI_WAIT_CYCLES) ? ECSS_OK : ECSS_ERR_HW_TIMEOUT;
}`,
        proDriver: `// Votación Triple Modular (TMR 2-de-3) contra Radiación Cósmica (Single Event Upset - SEU):
// Si un protón espacial invierte 1 bit en una de las 3 copias en RAM, esta ecuación
// bit a bit corrige el valor instantáneamente sin usar condicionales (if/else):
static volatile uint8_t s_modo_vuelo_A = 0x5AU;
static volatile uint8_t s_modo_vuelo_B = 0x5AU;
static volatile uint8_t s_modo_vuelo_C = 0x5AU;

uint8_t tmr_vote_and_scrub_u8(void) {
    uint8_t a = s_modo_vuelo_A;
    uint8_t b = s_modo_vuelo_B;
    uint8_t c = s_modo_vuelo_C;
    // Mayoría 2-de-3 en paralelo para los 8 bits:
    uint8_t majority = (uint8_t)((a & b) | (b & c) | (a & c));
    // Memory Scrubbing: repara en RAM cualquier copia que haya sufrido un bit-flip:
    s_modo_vuelo_A = majority;
    s_modo_vuelo_B = majority;
    s_modo_vuelo_C = majority;
    return majority;
}`,
        asmInsight: 'La expresión booleana de mayoría TMR ((a & b) | (b & c) | (a & c)) se compila en 5 instrucciones lógicas sin saltos condicionales (branchless), por lo que su Worst-Case Execution Time (WCET) es 100% constante.',
        hardwareNote: 'En satélites CubeSat basados en microcontroladores comerciales (COTS) sin memoria ECC dedicada, el TMR por software + Scrubbing periódico protege las variables críticas de estado frente a partículas ionizantes.'
      },
      stm32f401: {
        rawPointer: `// ECSS-E-ST-40C Annex U.2 Check #11 (Lectura Dummy con Efecto Lateral Hardware Justificado):
// En STM32, para limpiar la bandera Overrun (ORE) o FE en USART, el silicio exige leer SR
// seguido de leer DR aunque no uses el dato leído.
#include <stdint.h>

#define USART2_SR  (*(volatile uint32_t *)0x40004400UL)
#define USART2_DR  (*(volatile uint32_t *)0x40004404UL)

void ecss_clear_uart_overrun_fault(void) {
    // El cast explícito a (void) documenta para el analizador estático (MISRA / ECSS Annex U.2 #11)
    // que la lectura no usada se realiza deliberadamente por su efecto lateral en el hardware:
    volatile uint32_t dummy_sr = USART2_SR;
    volatile uint32_t dummy_dr = USART2_DR;
    (void)dummy_sr;
    (void)dummy_dr;
}`,
        cmsisStruct: `#include "stm32f4xx.h"

// ECSS-Q-ST-80C Cláusula 3.2.9 y 6.2.6.5: Programación Defensiva en Máquinas de Estados
// NOTA OFICIAL ECSS: La rama 'default:' de programación defensiva NO se considera
// "código desactivado" (deactivated code) y es obligatoria para atrapar corrupción de RAM (SEU).
typedef enum {
    FLIGHT_ST_INIT    = 0x11U,
    FLIGHT_ST_NOMINAL = 0x22U,
    FLIGHT_ST_SAFE    = 0x44U
} flight_state_t;

void flight_fsm_step(flight_state_t *p_state) {
    if (p_state == (flight_state_t *)0) { return; } // Annex U.2 #9: Validación NULL

    switch (*p_state) {
        case FLIGHT_ST_INIT:
            *p_state = FLIGHT_ST_NOMINAL;
            break;
        case FLIGHT_ST_NOMINAL:
            break;
        case FLIGHT_ST_SAFE:
            break;
        default:
            // Protección contra Bit-Flip (SEU): fuerza transición a Modo Seguro (Safe Mode)
            *p_state = FLIGHT_ST_SAFE;
            break;
    }
}`,
        proDriver: `// ECSS-Q-ST-80C Cláusula 6.2.2.8 (HSIA — Hardware-Software Interaction Analysis):
// Inhibición por Hardware + Doble Comando Armado/Disparo para evitar activación accidental
// de propulsores o pirotecnia ante un fallo simple de software o bit-flip:
#define ARM_MAGIC_KEY   0xA55A3CC3UL
#define PIN_ARM_INHIBIT (1UL << 4)  // PA4 habilita alimentación del relé de potencia
#define PIN_FIRE_VALVE  (1UL << 5)  // PA5 abre la válvula propulsora

static volatile uint32_t s_arm_token = 0UL;

void thruster_hsia_safe_fire(uint32_t command_key) {
    // Requiere que el estado previo haya sido armado Y que la clave coincida bit a bit:
    if ((s_arm_token == ARM_MAGIC_KEY) && (command_key == ARM_MAGIC_KEY)) {
        GPIOA->BSRR = PIN_ARM_INHIBIT; // 1º Levanta inhibición hardware
        GPIOA->BSRR = PIN_FIRE_VALVE;  // 2º Activa actuador
    } else {
        // Reacción segura HSIA: corta inhibición y asegura válvula cerrada (Reset bits +16)
        GPIOA->BSRR = (PIN_ARM_INHIBIT << 16U) | (PIN_FIRE_VALVE << 16U);
    }
    s_arm_token = 0UL; // Desarma inmediatamente tras la ejecución
}`,
        asmInsight: 'Codificar los estados críticos con distancia de Hamming >= 2 (ej. 0x11, 0x22, 0x44 en vez de 0, 1, 2) garantiza que un bit-flip simple por radiación nunca salte a otro estado válido sino al bloque defensivo default:.',
        hardwareNote: 'La versión espacial del Cortex-M/R/FT (como el Vorago VA41630 o los procesadores europeos LEON3FT/GR712RC y GR740 de Cobham Gaisler) incorpora corrección EDAC Hamming en hardware sobre la SRAM y registros con flip-flops TMR.'
      },
      esp32c3: {
        rawPointer: `// ECSS-E-ST-40C Rev.1 Cláusula 5.11.5.6g y ECSS-Q-ST-80C 6.2.9 (Sanitización Segura de Memoria):
// Al borrar claves criptográficas o parámetros sensibles en RAM/Flash, un memset() normal
// puede ser ELIMINADO por el optimizador (-O2 Dead-Store Elimination) si el buffer no se vuelve a leer.
#include <stdint.h>
#include <stddef.h>

void ecss_secure_zeroize_memory(void *secret_buf, size_t num_bytes) {
    if (secret_buf == (void *)0) { return; }
    // Convertimos a puntero 'volatile uint8_t *' para obligar al compilador RISC-V / ARM
    // a emitir físicamente cada instrucción SB (Store Byte) de borrado a cero:
    volatile uint8_t *p = (volatile uint8_t *)secret_buf;
    for (size_t i = 0U; i < num_bytes; i++) {
        p[i] = 0x00U;
    }
}`,
        cmsisStruct: `// ECSS-E-ST-40C Annex U.2 Check #1 (Protección Numérica contra Overflow y División por Cero):
#include <stdint.h>

typedef struct {
    int32_t  quotient;
    uint8_t  valid;
} safe_math_res_t;

// Suma con saturación (evita Integer Overflow / Wrap-around en lazos de control de vuelo):
uint16_t ecss_add_u16_saturate(uint16_t a, uint16_t b) {
    uint32_t sum = (uint32_t)a + (uint32_t)b;
    return (sum > 65535UL) ? 65535U : (uint16_t)sum;
}

// División protegida contra denominador 0 y contra INT32_MIN / -1:
safe_math_res_t ecss_div_s32_protected(int32_t num, int32_t den) {
    safe_math_res_t res = { 0, 0U };
    if ((den == 0) || ((num == (-2147483647 - 1)) && (den == -1))) {
        return res; // valid = 0 (Error numérico atrapado sin provocar excepción hardware)
    }
    res.quotient = num / den;
    res.valid    = 1U;
    return res;
}`,
        proDriver: `// ECSS-Q-ST-80C Cláusula 6.2.2.10 y 6.2.10.1 (Segregación de Criticidad y Particionado):
// Si una tarea de telemetría no crítica (Cat D) comparte un buffer con el control de actitud (Cat A),
// la tarea Cat A NUNCA debe recibir un puntero mutable ni confiar en el índice enviado por Cat D:
#define TELEMETRY_MAX_LEN  32U
static uint8_t s_cat_a_isolated_buf[TELEMETRY_MAX_LEN];

uint8_t cat_a_copy_to_untrusted_cat_d(uint8_t *out_cat_d_buf, uint8_t requested_len) {
    if (out_cat_d_buf == (uint8_t *)0) { return 0U; } // Check #9: Puntero no nulo
    // Check #2: Protección estricta contra Out-of-Bounds (Overrun)
    uint8_t safe_len = (requested_len > TELEMETRY_MAX_LEN) ? TELEMETRY_MAX_LEN : requested_len;
    for (uint8_t i = 0U; i < safe_len; i++) {
        out_cat_d_buf[i] = s_cat_a_isolated_buf[i]; // Copia unidireccional segura
    }
    return safe_len;
}`,
        asmInsight: 'En complemento a dos de 32 bits, dividir INT32_MIN (-2147483648) entre -1 produce +2147483648, que no cabe en un int32_t (máximo +2147483647) y causa comportamiento indefinido o excepción de hardware.',
        hardwareNote: 'La cláusula ECSS-E-ST-40C 5.11.5.6g exige documentar y verificar un procedimiento de sanitización de datos para cualquier memoria permanente o no volátil antes de retirar un equipo o clave.'
      },
      nrf52840: {
        rawPointer: `// ECSS-E-ST-40C Cláusula 5.3.8.2 y 5.8.3.11 (Auditoría del Margen de Memoria en Tiempo Real):
// Fórmula oficial ECSS Annex M <5.2>: margin_memory = free_size / total_size
// En fase de diseño preliminar de vuelo se exige típicamente >= 50% de margen libre en RAM y Flash.
#include <stdint.h>

#define TOTAL_SRAM_BYTES   (256UL * 1024UL) // 262.144 bytes en nRF52840

// Calcula el porcentaje de margen de memoria entero (0..100%) sin usar punto flotante:
uint32_t ecss_compute_memory_margin_percent(uint32_t used_bytes) {
    if (used_bytes >= TOTAL_SRAM_BYTES) {
        return 0UL; // Margen agotado (Violación de presupuesto técnico)
    }
    uint32_t free_size = TOTAL_SRAM_BYTES - used_bytes;
    return (free_size * 100UL) / TOTAL_SRAM_BYTES;
}`,
        cmsisStruct: `#include "nrf.h"

// ECSS-E-ST-40C Annex M <5.3>: Factor de Planificabilidad de CPU (Schedulability Factor S)
// Fórmula oficial para cada tarea periódica i:
//     S_i = (C_i + I_i + B_i) / D_i
// Donde:
//   C_i = Worst-Case Execution Time (WCET) de la tarea i (en microsegundos)
//   I_i = Interferencia máxima por preempción de tareas/ISRs de mayor prioridad
//   B_i = Tiempo máximo de bloqueo esperando recursos protegidos (Mutex / Sección Crítica)
//   D_i = Deadline (Plazo máximo permitido para terminar la tarea i)
// Si S_i <= 1.0 (o <= 100%), la tarea CUMPLE su Deadline en el peor caso posible.

uint32_t ecss_calc_schedulability_percent(uint32_t wcet_us, uint32_t interf_us, uint32_t block_us, uint32_t deadline_us) {
    if (deadline_us == 0UL) { return 999UL; } // Evita división por cero
    uint32_t total_worst_response_us = wcet_us + interf_us + block_us;
    return (total_worst_response_us * 100UL) / deadline_us;
}`,
        proDriver: `// Medición Empírica de WCET (Worst-Case Execution Time) usando el Contador de Ciclos DWT:
// Exigido en ECSS-E-ST-40C 5.5.3.2 y 5.8.3.5 para demostrar determinismo temporal en el target real:
static uint32_t s_max_observed_cycles = 0UL;

void ecss_profile_critical_task_wcet(void (*task_fn)(void)) {
    if (task_fn == (void (*)(void))0) { return; } // NASA JPL Rule 5 / ECSS Annex U.2 #9
    CoreDebug->DEMCR |= CoreDebug_DEMCR_TRCENA_Msk;
    DWT->CTRL        |= DWT_CTRL_CYCCNTENA_Msk;

    uint32_t start_cyc = DWT->CYCCNT;
    task_fn(); // Ejecuta la tarea crítica bajo prueba
    uint32_t elapsed_cyc = DWT->CYCCNT - start_cyc;

    if (elapsed_cyc > s_max_observed_cycles) {
        s_max_observed_cycles = elapsed_cyc; // Actualiza la marca de agua del WCET
    }
}`,
        asmInsight: 'Según ECSS-Q-ST-80C 6.2.3.7 y 6.2.3.8, una vez medido el código con instrumentación, las pruebas finales de validación DEBEN repetirse sobre el binario limpio NO instrumentado que volará realmente.',
        hardwareNote: 'En sistemas espaciales críticos (Cat A/B), el margen de carga de CPU (CPU Load Margin) debe mantenerse por debajo del 70% en el peor escenario para garantizar determinismo.'
      },
      rp2040: {
        rawPointer: `// Memoria con Código de Corrección de Errores (EDAC / Hamming SEC-DED) y Memory Scrubbing:
// En el espacio, un rayo cósmico provoca Single Event Upsets (SEU: 1 bit invertido en SRAM).
// Un algoritmo de Scrubbing recorre periódicamente las estructuras críticas en segundo plano,
// verifica su paridad/CRC o réplicas TMR y reescribe el dato sano antes de que ocurra un 2º bit-flip (MBU).
#include <stdint.h>

typedef struct {
    uint32_t copy_a;
    uint32_t copy_b;
    uint32_t copy_c;
    uint32_t seu_SingleFaultCount;
} radhard_register_t;

uint32_t radhard_scrub_and_read(volatile radhard_register_t *reg) {
    uint32_t a = reg->copy_a;
    uint32_t b = reg->copy_b;
    uint32_t c = reg->copy_c;
    uint32_t voted = (a & b) | (b & c) | (a & c); // Votador 2-de-3 a nivel de 32 bits

    if ((a != b) || (b != c)) {
        // ¡Detectado un Bit-Flip por radiación (SEU)! Corregimos las 3 copias en SRAM:
        reg->copy_a = voted;
        reg->copy_b = voted;
        reg->copy_c = voted;
        reg->seu_SingleFaultCount++; // Telemetría de tasa de radiación para control de tierra
    }
    return voted;
}`,
        cmsisStruct: `// ECSS-E-ST-40C 5.8.3.5b y RTCA DO-178C DAL A: Cobertura Estructural 100% MC/DC
// (Modified Condition and Decision Coverage)
// En una decisión con 3 condiciones booleanas:
//     if ((sensor_a_ok || sensor_b_ok) && arm_switch_active)
// La cobertura de Ramas (Branch Coverage) se conformaría con 2 tests (1 True y 1 False).
// Pero MC/DC exige demostrar que CADA una de las 3 variables puede cambiar por sí sola
// el resultado final manteniendo fijas las otras, requiriendo N + 1 = 4 vectores de test:
#include <stdbool.h>

bool evaluate_pyro_release_decision(bool sensor_a_ok, bool sensor_b_ok, bool arm_switch_active) {
    // Para facilitar la trazabilidad de Código Objeto (-O2) exigida por ECSS 5.8.3.5e,
    // las expresiones críticas se mantienen simples y explícitas:
    bool redundant_sensors_valid = sensor_a_ok || sensor_b_ok;
    return redundant_sensors_valid && arm_switch_active;
}`,
        proDriver: `// ECSS-E-ST-40C Cláusula 5.5.3.2c (Pruebas Unitarias de Valores Frontera: n-1, n, n+1):
// Todo requisito numérico con límite N debe probarse obligatoriamente en N-1, N y N+1,
// además de valores fuera de rango y entradas singulares.
#include <assert.h>
#include <stdint.h>
#include <stdbool.h>

#define THRUSTER_MAX_TEMP_C  120U

bool is_thruster_temp_nominal(uint16_t temp_c) {
    return (temp_c <= THRUSTER_MAX_TEMP_C);
}

void ecss_unit_test_boundary_thruster_temp(void) {
    // Prueba en frontera exacta exigida por ECSS-E-ST-40C 5.5.3.2c:
    assert(is_thruster_temp_nominal(119U) == true);  // Frontera n - 1 (119 °C) -> Nominal
    assert(is_thruster_temp_nominal(120U) == true);  // Frontera n     (120 °C) -> Nominal
    assert(is_thruster_temp_nominal(121U) == false); // Frontera n + 1 (121 °C) -> Alarma!
    assert(is_thruster_temp_nominal(0U)   == true);  // Límite inferior extremo
    assert(is_thruster_temp_nominal(65535U) == false); // Fuera de rango extremo
}`,
        asmInsight: 'Si compilas con optimizaciones agresivas y el compilador añade ramas en ensamblador que no existen en tu C, la cláusula ECSS-E-ST-40C 5.8.3.5e exige realizar análisis de cobertura directamente sobre el Código Objeto (ensamblador) para Categoría A.',
        hardwareNote: 'El RP2040 dispone de dos núcleos Cortex-M0+ simétricos que pueden configurarse para verificar cálculos críticos en paralelo y comparar sus resultados antes de accionar periféricos.'
      }
    },
    challenge: {
      question: 'Reto de Certificación Espacial ECSS / NASA — Propagación de Criticidad y Cobertura Cat A',
      scenario:
        'Estás diseñando el software de a bordo (OBSW) de un satélite de la Agencia Espacial Europea (ESA) bajo ECSS-Q-ST-80C Rev.2 y ECSS-E-ST-40C Rev.1. Tienes un módulo de Control de Órbita y Propulsión clasificado como Categoría A (fallo catastrófico) y un módulo experimental de procesado de cámara clasificado inicialmente como Categoría D (fallo menor). Para ahorrar costes, decides ejecutar ambos módulos en el mismo microcontrolador compartiendo la misma memoria SRAM global sin unidad de protección de memoria (MPU) ni particionado estricto. ¿Qué dictamina obligatoriamente la normativa ECSS (Cláusulas 6.2.2.10 y 5.8.3.5b) ante esta decisión?',
      options: [
        {
          id: 'a',
          label: 'Al compartir recursos y memoria sin aislamiento garantizado, el módulo de cámara puede corromper al de propulsión; por tanto, TODO el software (incluida la cámara) pasa a ser clasificado obligatoriamente como Categoría A, exigiendo 100% de cobertura MC/DC, Statement y Decision.',
          isCorrect: true,
          feedback: '¡Auditoría ECSS impecable! Según ECSS-Q-ST-80C Rev.2 cláusula 6.2.2.10 (y 6.2.10.1), si un componente de menor criticidad puede propagar fallos a uno de mayor criticidad por compartir memoria o recursos sin aislamiento probado, todos los componentes involucrados DEBEN clasificarse en la categoría más alta (Cat A).'
        },
        {
          id: 'b',
          label: 'La normativa permite hacer la media entre Categoría A y Categoría D, dejando todo el proyecto en Categoría C sin necesidad de pruebas MC/DC.',
          isCorrect: false,
          feedback: 'En seguridad aeroespacial jamás se promedia la criticidad: un puntero desbocado en una rutina Cat D que comparte RAM con Cat A puede destruir la misión entera.'
        },
        {
          id: 'c',
          label: 'Basta con añadir un comentario en el código pidiendo a los programadores de la cámara que tengan cuidado con los punteros.',
          isCorrect: false,
          feedback: 'Para mantener categorías separadas en el mismo procesador es obligatorio demostrar particionado temporal y espacial por hardware (MPU/MMU e hipervisor certificado como TSP / ARINC 653).'
        }
      ]
    }
  },

  // =========================================================================
  // MÓDULO 12: RTOS (FREERTOS / ZEPHYR / RTEMS) A NIVEL DE SILICIO
  // =========================================================================
  {
    id: 12,
    slug: 'rtos-freertos-zephyr-cambio-contexto-mutex-colas',
    title: 'Módulo 12: Sistemas Operativos de Tiempo Real (RTOS: FreeRTOS / Zephyr / RTEMS)',
    subtitle: 'Cómo funciona un Cambio de Contexto en ensamblador (PendSV / SysTick), el Bloque de Control de Tarea (TCB), la Inversión de Prioridad y la sincronización segura con Mutex, Semáforos y Colas Estáticas',
    level: 'Experto Industrial',
    duration: '120 min',
    recommendedLab: 'senior-rtos-can-pid-fault',
    superficialMyth:
      'En cursos superficiales enseñan un RTOS como si el microcontrolador tuviera "varios procesadores mágicos" ejecutando varios bucles while(1) al mismo tiempo, y usan xTaskCreate() con malloc dinámico sin preocuparse del Stack.',
    overwhelmingDatasheet:
      'El manual de arquitectura ARMv7-M y la documentación de FreeRTOS/RTEMS hablan de "PSP vs MSP Stack Pointers, PendSV Exception Tail-Chaining, TCB_t pxTopOfStack, Priority Inheritance Protocol (PIP), Priority Ceiling y xTaskCreateStatic".',
    theBridgeExplanation:
      'Un microcontrolador de un solo núcleo solo puede ejecutar UNA instrucción en cada ciclo de reloj. ¿Cómo logra entonces un RTOS que parezca que 5 tareas corren a la vez? Mediante un truco brillante de Pila (Stack) y Punteros: cada tarea tiene su propio array de pila privado en SRAM y una estructura TCB (Task Control Block) que guarda dónde se quedó su puntero de pila (pxTopOfStack). Cuando salta el reloj SysTick (ej. cada 1 ms) o una tarea se duerme esperando un sensor, se dispara la interrupción de mínima prioridad PendSV: el código guarda los registros actuales de la CPU (R4..R11) en la pila de la Tarea A, cambia el registro PSP (Process Stack Pointer) de la CPU para que apunte a la pila de la Tarea B, restaura los registros R4..R11 de la Tarea B y retorna. ¡Al retornar de la interrupción, la CPU aterriza mágicamente en medio del código de la Tarea B!',
    keyTakeaways: [
      {
        title: '1. Anatomía del Cambio de Contexto (Stack Frame Hardware + Software)',
        concept: 'En ARM Cortex-M, al entrar a una interrupción el hardware apila automáticamente 8 registros (R0, R1, R2, R3, R12, LR, PC, xPSR). La rutina PendSV_Handler del RTOS solo tiene que empujar por software los otros 8 registros (R4..R11) en la pila de la tarea saliente, guardar el puntero PSP en current_tcb->sp, cargar el PSP desde next_tcb->sp y desapilar R4..R11.',
        codeSnippet: `// Estructura real de un Bloque de Control de Tarea (TCB) en C:\ntypedef struct tcb_node {\n    uint32_t        *pxTopOfStack; // ¡SIEMPRE el primer campo (offset 0) para acceso desde ASM!\n    uint32_t         priority;     // Prioridad de la tarea (mayor número = más urgente)\n    uint32_t         state;        // READY, RUNNING, BLOCKED\n} tcb_t;`
      },
      {
        title: '2. Inversión de Prioridad (El Bug del Mars Pathfinder 1997) y Mutex con Herencia',
        concept: 'Si una Tarea Baja (Prio 1) toma un recurso compartido (ej. bus I2C) con un simple semáforo binario y despierta una Tarea Alta (Prio 3) que necesita el I2C, la Tarea Alta se bloquea. Si en ese instante entra una Tarea Media (Prio 2) que no usa el I2C, ¡preempta a la Tarea Baja e impide indirectamente que la Tarea Alta se ejecute! La solución es usar un Mutex con Priority Inheritance: el RTOS eleva temporalmente la Tarea Baja a Prioridad 3 hasta que suelte el Mutex.',
        codeSnippet: `// Regla de Oro RTOS: Para proteger un periférico compartido (I2C/SPI) usa SIEMPRE Mutex\n// (que tiene Dueño y Herencia de Prioridad), NUNCA un Semáforo Binario.\nxSemaphoreTake(i2c_bus_mutex, portMAX_DELAY);\ni2c_read_imu_frame(&imu_data);\nxSemaphoreGive(i2c_bus_mutex);`
      },
      {
        title: '3. Asignación 100% Estática en RTOS Críticos (Cero Heap / Cero Fragmentación)',
        concept: 'Bajo MISRA-C, NASA JPL y ECSS Cat A/B, usar xTaskCreate() (que llama a pvPortMalloc internamente) está prohibido tras el arranque. Los RTOS profesionales permiten declarar la pila (StackType_t[]) y el TCB (StaticTask_t) como arrays estáticos globales en SRAM (.bss) usando xTaskCreateStatic().',
        codeSnippet: `static StackType_t  s_telemetry_stack[512]; // Pila fija de 2048 bytes en .bss\nstatic StaticTask_t s_telemetry_tcb;        // TCB estático sin usar Heap\n\nxTaskCreateStatic(vTelemetryTask, "TLM", 512U, NULL, 3U, s_telemetry_stack, &s_telemetry_tcb);`
      }
    ],
    mcuCode: {
      atmega328p: {
        rawPointer: `// ATmega328P: Planificador Cooperativo / Corrutinas Ligeras sin gasto de RAM de 32 registros
// En AVR (solo 2 KB de SRAM), apilar los 32 registros (R0..R31 + SREG + PC = 35 bytes por tarea)
// consume mucha RAM. La técnica bare-metal clásica usa una tabla de tareas con Tick de Timer0:
#include <stdint.h>

typedef struct {
    void (*task_fn)(void);
    uint16_t period_ticks;
    uint16_t last_run;
} avr_rtos_task_t;

volatile uint16_t g_avr_tick_ms = 0U;

void avr_scheduler_step(avr_rtos_task_t *tasks, uint8_t count) {
    uint16_t now = g_avr_tick_ms;
    for (uint8_t i = 0U; i < count; i++) {
        if ((uint16_t)(now - tasks[i].last_run) >= tasks[i].period_ticks) {
            tasks[i].last_run = now;
            tasks[i].task_fn();
        }
    }
}`,
        cmsisStruct: `// En FreeRTOS para AVR (port.c), el cambio de contexto guarda R0..R31 y SREG
// y escribe los registros físicos SPL (0x3D) y SPH (0x3E) del Stack Pointer:
#include <avr/io.h>

static inline void avr_switch_stack_pointer(uint16_t new_sp_addr) {
    uint8_t sreg_backup = SREG;
    __builtin_avr_cli();
    SPL = (uint8_t)(new_sp_addr & 0xFFU);
    SPH = (uint8_t)((new_sp_addr >> 8) & 0xFFU);
    SREG = sreg_backup;
}`,
        proDriver: `// En microcontroladores de 8 bits con <= 2 KB de RAM, un planificador cooperativo
// determinista o Protothreads suele ser más seguro que un RTOS preemptivo pesado.`,
        asmInsight: 'Un cambio de contexto completo en AVR ejecuta 32 instrucciones PUSH + IN SREG + 32 instrucciones POP + RETI (~140 ciclos de reloj).',
        hardwareNote: 'Al cambiar el Stack Pointer de 16 bits en AVR (SPL y SPH), es obligatorio deshabilitar interrupciones entre ambas escrituras.'
      },
      stm32f401: {
        rawPointer: `// STM32F401 (ARM Cortex-M4F): Disparo del Cambio de Contexto en SCB->ICSR (Bit 28: PENDSVSET)
// Dirección de SCB->ICSR (Interrupt Control and State Register): 0xE000ED04
#define SCB_ICSR_REG   (*(volatile uint32_t *)0xE000ED04UL)
#define PENDSVSET_BIT  (1UL << 28)

// Cuando SysTick o vTaskDelay() decide cambiar de tarea, NO hace el cambio dentro de SysTick;
// levanta el bit PENDSVSET para que PendSV (prioridad mínima 0xFF) haga el cambio al terminar todas las ISRs:
static inline void rtos_trigger_context_switch(void) {
    SCB_ICSR_REG = PENDSVSET_BIT; // Solicita excepción PendSV asíncrona
}`,
        cmsisStruct: `#include "stm32f4xx.h"

// Inicialización del Stack Frame falso para una tarea nueva en Cortex-M:
uint32_t *rtos_init_task_stack(uint32_t *stack_top, void (*task_entry)(void *), void *arg) {
    stack_top--; *stack_top = 0x01000000UL;          // xPSR (Bit 24 Thumb = 1 obligatorio!)
    stack_top--; *stack_top = (uint32_t)task_entry;  // PC (Punto de entrada de la tarea)
    stack_top--; *stack_top = 0xFFFFFFFDUL;          // LR (EXC_RETURN: volver a modo Thread con PSP)
    stack_top -= 5;                                  // R12, R3, R2, R1 = 0
    *stack_top = (uint32_t)arg;                      // R0 (Primer argumento pvParameters)
    stack_top -= 8;                                  // R11, R10, R9, R8, R7, R6, R5, R4 = 0
    return stack_top;                                // Nuevo pxTopOfStack guardado en el TCB
}`,
        proDriver: `// Diseño de Tarea Periódica de Control Exacto sin Deriva Temporal (vTaskDelayUntil):
// NUNCA uses vTaskDelay(10) para un lazo de control, porque suma 10 ms al instante en que
// termina tu código (acumulando jitter). Usa siempre vTaskDelayUntil(&xLastWakeTime, 10):
void vControlLoopTask(void *pvParameters) {
    (void)pvParameters;
    uint32_t xLastWakeTime = rtos_get_tick_count();
    for (;;) {
        ejecutar_control_pid_100hz();
        rtos_delay_until(&xLastWakeTime, 10U); // Despierta en t = 10, 20, 30, 40 ms exactos!
    }
}`,
        asmInsight: 'En Cortex-M4F, PendSV ejecuta: MRS R0, PSP -> STMDB R0!, {R4-R11} -> STR R0, [R1] -> LDR R0, [R2] -> LDMIA R0!, {R4-R11} -> MSR PSP, R0 -> BX LR.',
        hardwareNote: 'Si la tarea usa la FPU (float), el procesador activa Lazy Stacking (bit FPCA en CONTROL) apilando S0..S31 bajo demanda.'
      },
      esp32c3: {
        rawPointer: `// ESP32-C3 (RISC-V): Interrupción Software de Cambio de Contexto en el periférico SYSTEM
// En RISC-V sin PendSV de ARM, FreeRTOS dispara una interrupción software dedicada (CPU_INTR_FROM_CPU_0):
#define SYSTEM_CPU_INTR_FROM_CPU_0_REG (*(volatile uint32_t *)0x600C0028UL)

static inline void riscv_rtos_yield_core0(void) {
    SYSTEM_CPU_INTR_FROM_CPU_0_REG = 1UL; // Dispara ISR de cambio de contexto en RISC-V
}`,
        cmsisStruct: `// En ESP-IDF (que integra FreeRTOS de serie en la ROM/Flash), la cola estática sin malloc
// es el mecanismo canónico para enviar eventos desde una ISR hacia una Tarea:
#include <stdint.h>
#include <stdbool.h>

typedef struct {
    uint32_t sensor_id;
    uint32_t raw_value;
} sensor_msg_t;

// Dentro de la ISR usamos SIEMPRE la variante terminada en "FromISR":
// xQueueSendFromISR(q_handle, &msg, &xHigherPriorityTaskWoken);
// portYIELD_FROM_ISR(xHigherPriorityTaskWoken);`,
        proDriver: `// Regla crítica en FreeRTOS / ESP-IDF: Jamás llames a xQueueSend() o printf() normal
// dentro de una ISR. Usa exclusivamente las APIs terminadas en "...FromISR()".`,
        asmInsight: 'En RISC-V RV32IMC, el cambio de contexto guarda los 28 registros de propósito general (x1, x5..x31) más mepc y mstatus en el marco de pila de la tarea.',
        hardwareNote: 'El ESP32-C3 incluye registros hardware de guarda de pila (Assist-Debug SP Monitor) que lanzan una excepción instantánea antes de que una tarea desborde su Stack.'
      },
      nrf52840: {
        rawPointer: `// nRF52840 (Zephyr RTOS / FreeRTOS Tickless Idle con RTC1 a 32.768 kHz):
// En dispositivos a batería (BLE), mantener SysTick despertando la CPU 1000 veces por segundo
// arruina la batería. Los RTOS en Nordic usan RTC1 en modo "Tickless Idle":
#define RTC1_TASKS_START  (*(volatile uint32_t *)0x40011000UL)
#define RTC1_CC0_REG      (*(volatile uint32_t *)0x40011540UL)

void nrf_rtos_program_next_wakeup_ticks(uint32_t sleep_rtc_ticks) {
    RTC1_CC0_REG = sleep_rtc_ticks & 0x00FFFFFFUL; // Programa comparador de 24 bits del RTC1
    RTC1_TASKS_START = 1UL;
}`,
        cmsisStruct: `// En nRF Connect SDK (basado en Zephyr RTOS), los hilos y colas se declaran
// en tiempo de compilación mediante macros estáticas que reservan memoria en el Linker:
/*
K_THREAD_DEFINE(sensor_tid, 1024, sensor_thread_fn, NULL, NULL, NULL, 5, 0, 0);
K_MSGQ_DEFINE(adc_msgq, sizeof(uint16_t), 16, 4);
*/`,
        proDriver: `// Modo Tickless Idle en RTOS: Si la próxima tarea no tiene que ejecutarse hasta dentro
// de 500 ms, el RTOS apaga el SysTick, programa el RTC para dentro de 500 ms y duerme la CPU.`,
        asmInsight: 'Con Tickless Idle sobre RTC1, la CPU del nRF52840 pasa el 99.8% del tiempo dormida consumiendo ~1.9 uA con toda la RAM retenida.',
        hardwareNote: 'El SysTick del Cortex-M4 se detiene cuando el reloj HFCLK se apaga en modo Sleep profundo; por eso el RTOS en nRF52 usa el periférico RTC1 (LFCLK 32.768 kHz).'
      },
      rp2040: {
        rawPointer: `// RP2040 (FreeRTOS SMP Multicore): Sincronización entre Core 0 y Core 1 con Spinlocks Hardware
// Dirección de SIO_SPINLOCK0: 0xD0000100 (32 Spinlocks físicos en silicio)
#define SIO_SPINLOCK0 (*(volatile uint32_t *)0xD0000100UL)

// Leer SIO_SPINLOCK0 intenta reclamar el candado atómicamente en 1 ciclo:
// Devuelve != 0 si lo lograste adquirir; devuelve 0 si el otro núcleo ya lo tiene tomado:
static inline void rp2040_rtos_acquire_spinlock0(void) {
    while (SIO_SPINLOCK0 == 0UL) { /* Espera activa de pocos ciclos entre núcleos */ }
}

static inline void rp2040_rtos_release_spinlock0(void) {
    SIO_SPINLOCK0 = 1UL; // Escribir cualquier valor libera el Spinlock hardware
}`,
        cmsisStruct: `#include "hardware/structs/sio.h"

// Además de Spinlocks, el RP2040 incluye 2 colas FIFO hardware entre núcleos (8 palabras de 32 bits):
void rp2040_notify_other_core(uint32_t event_code) {
    while ((sio_hw->fifo_st & SIO_FIFO_ST_RDY_BITS) == 0UL) { }
    sio_hw->fifo_wr = event_code;
    __asm volatile ("sev"); // Send Event: despierta al otro núcleo si estaba en WFE!
}`,
        proDriver: `// En un MCU Dual-Core como el RP2040, deshabilitar interrupciones (__disable_irq) en el Core 0
// NO impide que el Core 1 modifique la misma estructura en RAM. Hace falta un Spinlock hardware.`,
        asmInsight: 'El periférico SIO del RP2040 arbitra el acceso a los 32 registros SPINLOCK en 1 solo ciclo de reloj sin instrucciones LDREX/STREX.',
        hardwareNote: 'FreeRTOS SMP utiliza un Spinlock de SIO para proteger las listas internas del planificador cuando Core 0 y Core 1 cambian de tarea a la vez.'
      }
    },
    challenge: {
      question: 'Reto de Arquitectura RTOS — El Caso Real de Inversión de Prioridad (Mars Pathfinder)',
      scenario:
        'En tu firmware con RTOS tienes tres tareas: Tarea_Control (Prioridad 3, Alta), Tarea_Comunicaciones (Prioridad 2, Media) y Tarea_Log (Prioridad 1, Baja). Tarea_Log y Tarea_Control comparten el bus SPI protegidas por un Semáforo Binario simple (sin herencia de prioridad). En t=0, Tarea_Log toma el semáforo para escribir en la memoria Flash SPI. En t=1 ms, despierta Tarea_Control e intenta tomar el semáforo SPI, quedando bloqueada. En t=2 ms, despierta Tarea_Comunicaciones (que NO usa el bus SPI) y se pone a procesar paquetes durante 500 ms. ¿Qué ocurre en el sistema?',
      options: [
        {
          id: 'a',
          label: 'Se produce una Inversión de Prioridad no acotada: Tarea_Comunicaciones (Prio 2) preempta a Tarea_Log (Prio 1), impidiendo que Tarea_Log termine de usar el SPI y dejando congelada a Tarea_Control (Prio 3, la más crítica del sistema) hasta que salte el Watchdog.',
          isCorrect: true,
          feedback: '¡Diagnóstico digno del JPL de la NASA! Exactamente este fallo reiniciaba la sonda Mars Pathfinder en Marte en julio de 1997. Al sustituir el Semáforo Binario por un Mutex con Herencia de Prioridad (Priority Inheritance), en cuanto Tarea_Control (Prio 3) pide el Mutex, el RTOS sube temporalmente a Tarea_Log a Prioridad 3 para que Tarea_Comunicaciones (Prio 2) no pueda interrumpirla.'
        },
        {
          id: 'b',
          label: 'Tarea_Control (Prio 3) le arrebata el bus SPI a mitad de byte a Tarea_Log sin esperar al semáforo.',
          isCorrect: false,
          feedback: 'Si rompiera el bloqueo del semáforo corrompería la trama SPI en curso.'
        },
        {
          id: 'c',
          label: 'Un Semáforo Binario y un Mutex son 100% idénticos en un RTOS.',
          isCorrect: false,
          feedback: 'Un Semáforo Binario es para señalización (ej. una ISR despierta a una tarea) y no tiene concepto de "dueño" ni herencia de prioridad; un Mutex es para exclusión mutua y sí implementa Priority Inheritance.'
        }
      ]
    }
  },

  // =========================================================================
  // MÓDULO 13: BUSES INDUSTRIALES/ESPACIALES (CAN / SPACEWIRE) Y CRC HARDWARE
  // =========================================================================
  {
    id: 13,
    slug: 'buses-industriales-can-bus-spacewire-mil1553-crc-hardware',
    title: 'Módulo 13: Buses Industriales y Aeroespaciales (CAN Bus / SpaceWire / MIL-STD-1553) y Cálculo de CRC',
    subtitle: 'Cómo transmitir datos a través de metros de cable con ruido electromagnético extremo usando pares diferenciales, arbitraje no destructivo por ID y verificación polinómica CRC en C y en Silicio',
    level: 'Experto Industrial',
    duration: '120 min',
    recommendedLab: 'senior-rtos-can-pid-fault',
    superficialMyth:
      'Quien solo ha usado UART o I2C en una protoboard cree que puede tirar dos cables de 5 metros junto a un motor trifásico o dentro de un coche/satélite y que los bytes llegarán intactos sumando los bytes con un simple checksum.',
    overwhelmingDatasheet:
      'Las especificaciones ISO 11898 (CAN) y ECSS-E-ST-50-12C (SpaceWire) hablan de "Differential Signaling CAN_H/CAN_L, Non-Destructive Bitwise Arbitration, Dominant (0) vs Recessive (1), Hardware Acceptance Filters/Masks, Bit Stuffing y Generador Polinómico CRC-15 / CRC-32".',
    theBridgeExplanation:
      'En UART o I2C el voltaje se mide respecto a tierra (GND). Si un motor cercano induce un pico de +2V en el cable de tierra, un 0 lógico parece un 1. El bus CAN resuelve esto usando un Par Diferencial trenzado (CAN_H y CAN_L): el receptor resta físicamente (V_CANH - V_CANL). Si el ruido electromagnético sube ambos cables +2V a la vez, ¡la resta sigue dando exactamente lo mismo! Además, en CAN no hay Maestro/Esclavo: todos los nodos escuchan el cable mientras transmiten su ID. El bit 0 ("Dominante") pisa eléctricamente al bit 1 ("Recesivo"). Si dos chips hablan a la vez, el que tenga el ID más bajo (más ceros al principio, mayor prioridad) gana el bus sin que se pierda ni un solo bit.',
    keyTakeaways: [
      {
        title: '1. Arbitraje No Destructivo por Prioridad de ID en Bus CAN',
        concept: 'En CAN (Estándar de 11 bits de ID o Extendido de 29 bits), el Identificador NO es la dirección del nodo destino, sino qué dato contiene el mensaje y su urgencia. Un bit 0 es Dominante (transistores activos, V_diff = 2V) y un bit 1 es Recesivo (bus en reposo por resistencias de 120 ohmios, V_diff = 0V). Por tanto, el ID 0x001 (Freno de Emergencia) gana siempre el bus frente al ID 0x7FF (Temperatura del Aire Acondicionado).',
        codeSnippet: `// Estructura canónica de una Trama CAN 2.0A/2.0B (máximo 8 bytes de carga útil):\ntypedef struct {\n    uint32_t id;        // 11-bit Standard ID (0x000..0x7FF) -> Menor valor = Mayor prioridad!\n    uint8_t  dlc;       // Data Length Code (0..8 bytes)\n    uint8_t  data[8];   // Payload determinista de hasta 64 bits\n} can_frame_t;`
      },
      {
        title: '2. Filtros de Aceptación y Máscaras en Hardware (Cero Carga de CPU)',
        concept: 'En un coche o satélite circulan miles de tramas CAN por segundo. Si tu microcontrolador recibiera una interrupción por cada mensaje del bus, la CPU colapsaría. Los controladores CAN incluyen bancos de Filtros Hardware con dos registros: Filter_ID y Filter_Mask. Solo si ((ID_Recibido & Mask) == (Filter_ID & Mask)), el hardware guarda la trama en el FIFO y despierta a tu CPU.',
        codeSnippet: `// Regla de Filtrado Hardware CAN en Silicio:\n// Bit de Máscara en 1 = "Este bit del ID DEBE coincidir obligatoriamente"\n// Bit de Máscara en 0 = "No importa (Don't Care)"\nbool can_hw_filter_match(uint16_t rx_id, uint16_t filter_id, uint16_t mask) {\n    return ((rx_id & mask) == (filter_id & mask));\n}`
      },
      {
        title: '3. Verificación de Redundancia Cíclica (CRC) vs Checksum Simple',
        concept: 'Un Checksum simple (sumar los bytes) falla estrepitosamente si un pico de ruido suma +1 a un byte y resta -1 al siguiente (la suma da igual). El algoritmo CRC trata toda tu trama como un número binario gigante y calcula el resto de dividirlo (con XOR sin acarreo) entre un polinomio generador (ej. 0x07 en CRC-8, 0x1021 en CRC-16-CCITT o 0x04C11DB7 en CRC-32). Muchos MCUs de 32 bits tienen un periférico CRC hardware que calcula 32 bits en 1 solo ciclo de reloj.',
        codeSnippet: `// Cálculo de CRC-8 (Polinomio 0x07) bit a bit en C puro para tramas de sensores:\nuint8_t crc8_compute_byte(uint8_t crc, uint8_t data) {\n    crc ^= data;\n    for (uint8_t b = 0U; b < 8U; b++) {\n        crc = (crc & 0x80U) ? (uint8_t)((crc << 1U) ^ 0x07U) : (uint8_t)(crc << 1U);\n    }\n    return crc;\n}`
      }
    ],
    mcuCode: {
      atmega328p: {
        rawPointer: `// ATmega328P: Controlador CAN externo MCP2515 por SPI + Cálculo de CRC-16-CCITT en C
// Como el ATmega328P no tiene periférico CAN ni CRC interno, en la industria se conecta a un
// controlador CAN MCP2515 por SPI y se calcula el CRC-16 usando instrucciones de rotación:
#include <stdint.h>

uint16_t avr_crc16_ccitt(const uint8_t *buf, uint16_t len) {
    uint16_t crc = 0xFFFFU;
    for (uint16_t i = 0U; i < len; i++) {
        crc ^= (uint16_t)((uint16_t)buf[i] << 8U);
        for (uint8_t b = 0U; b < 8U; b++) {
            crc = (crc & 0x8000U) ? (uint16_t)((crc << 1U) ^ 0x1021U) : (uint16_t)(crc << 1U);
        }
    }
    return crc;
}`,
        cmsisStruct: `#include <avr/io.h>
#include <util/crc16.h> // Librería optimizada en ensamblador AVR para CRC

uint16_t avr_fast_frame_crc(const uint8_t *data, uint8_t len) {
    uint16_t crc = 0xFFFFU;
    for (uint8_t i = 0U; i < len; i++) {
        crc = _crc_ccitt_update(crc, data[i]); // ~17 ciclos de CPU por byte en ASM
    }
    return crc;
}`,
        proDriver: `// En buses industriales RS-485 (Modbus RTU) sobre el UART del ATmega328P, cada trama
// termina obligatoriamente con 2 bytes de CRC-16 (polinomio 0xA001 reflejado).`,
        asmInsight: 'La función _crc_ccitt_update de <util/crc16.h> usa la instrucción SWAP de nibbles del AVR para evitar el bucle de 8 iteraciones por bit.',
        hardwareNote: 'Para conectar un microcontrolador al cable físico CAN_H/CAN_L siempre hace falta un chip Transceptor Diferencial externo (ej. TJA1050 / SN65HVD230).'
      },
      stm32f401: {
        rawPointer: `// STM32F4: Unidad Hardware de Cálculo CRC-32 en el Bus AHB1 (Dirección base 0x40023000)
// ¡Calcula el CRC-32 (Polinomio Ethernet/Espacial 0x04C11DB7) de una palabra de 32 bits en 4 ciclos!
#define RCC_AHB1ENR_REG (*(volatile uint32_t *)0x40023830UL)
#define CRC_DR_REG      (*(volatile uint32_t *)0x40023000UL)
#define CRC_CR_REG      (*(volatile uint32_t *)0x40023008UL)

uint32_t stm32_hw_crc32_compute(const uint32_t *words, uint32_t count) {
    RCC_AHB1ENR_REG |= (1UL << 12); // 1. Habilitar reloj del periférico CRC en AHB1
    CRC_CR_REG       = (1UL << 0);  // 2. Bit RESET=1 -> Carga semilla inicial 0xFFFFFFFF
    for (uint32_t i = 0UL; i < count; i++) {
        CRC_DR_REG = words[i];      // 3. Escribir dato -> El silicio divide por 0x04C11DB7 al vuelo!
    }
    return CRC_DR_REG;              // 4. Leer CRC_DR devuelve el resto polinómico acumulado
}`,
        cmsisStruct: `#include "stm32f4xx.h"

// Empaquetado de un identificador CAN de 11 bits y solicitud de transmisión en un buzón bxCAN:
uint32_t stm32_can_pack_tir_register(uint16_t std_id_11b) {
    // En bxCAN de STM32, el Standard ID de 11 bits vive en los bits [31:21] de TI0R,
    // y el bit 0 (TXRQ) solicita el envío al bus:
    return ((uint32_t)(std_id_11b & 0x7FFU) << 21U) | (1UL << 0U);
}`,
        proDriver: `// En satélites (ECSS-E-ST-50-12C SpaceWire y ECSS-E-ST-70-41C PUS Telemetry),
// cada paquete de telemetría lleva un campo PEC (Packet Error Control) de 16 bits (CRC-16-CCITT)
// calculado al construir la trama y verificado antes de ejecutar cualquier telecomando.`,
        asmInsight: 'Calcular el CRC-32 por software de 256 KB de Flash tarda ~18 millones de ciclos; con el periférico CRC hardware del STM32 tarda solo ~260.000 ciclos (68x más rápido).',
        hardwareNote: 'Recuerda habilitar el bit 12 (CRCEN) en RCC->AHB1ENR antes de escribir en CRC->DR.'
      },
      esp32c3: {
        rawPointer: `// ESP32-C3: Controlador TWAI Hardware Integrado (Two-Wire Automotive Interface = CAN 2.0B)
// El ESP32-C3 tiene un controlador CAN 2.0B completo en silicio en la dirección 0x6002B000!
#define TWAI_MODE_REG   (*(volatile uint32_t *)0x6002B000UL)
#define TWAI_CMD_REG    (*(volatile uint32_t *)0x6002B004UL)
#define TWAI_STATUS_REG (*(volatile uint32_t *)0x6002B008UL)

void esp32c3_twai_request_tx(void) {
    // Si el bit 2 de STATUS (Transmit Buffer Status) indica que el buzón está libre:
    if ((TWAI_STATUS_REG & (1UL << 2)) != 0UL) {
        TWAI_CMD_REG = (1UL << 0); // Bit 0: TX_REQ (Dispara arbitraje y transmisión CAN)
    }
}`,
        cmsisStruct: `// Además, la ROM interna del ESP32-C3 incluye rutinas CRC-16 y CRC-32 grabadas en fábrica
// que no ocupan ni 1 byte de tu memoria Flash:
#include <stdint.h>
extern uint32_t esp_rom_crc32_le(uint32_t crc, const uint8_t *buf, uint32_t len);`,
        proDriver: `// El controlador TWAI del ESP32-C3 mantiene contadores hardware de errores (TEC y REC):
// si un nodo falla repetidamente, pasa solo a estado "Error Passive" y luego "Bus-Off"
// desconectándose automáticamente para no tumbar el bus del vehículo.`,
        asmInsight: 'Las funciones esp_rom_crc32_le llaman a tablas precalculadas en la Mask ROM del chip (0x40000000).',
        hardwareNote: 'Aunque el ESP32-C3 incluye el controlador lógico CAN (TWAI), debes conectar sus pines TX/RX a un transceptor físico de 3.3V como el SN65HVD230.'
      },
      nrf52840: {
        rawPointer: `// nRF52840: Motor Hardware CRC de 24/16/8 bits integrado en el Periférico RADIO (0x40001000)
#define RADIO_CRCCNF_REG  (*(volatile uint32_t *)0x40001534UL)
#define RADIO_CRCPOLY_REG (*(volatile uint32_t *)0x40001538UL)
#define RADIO_CRCINIT_REG (*(volatile uint32_t *)0x4000153CUL)
#define RADIO_CRCSTATUS   (*(volatile uint32_t *)0x40001400UL)

void nrf_radio_configure_hw_crc16(void) {
    RADIO_CRCCNF_REG  = 2UL;        // Longitud de CRC = 2 bytes (16 bits)
    RADIO_CRCPOLY_REG = 0x11021UL;  // Polinomio x^16 + x^12 + x^5 + 1 (CRC-16-CCITT)
    RADIO_CRCINIT_REG = 0xFFFFUL;   // Semilla inicial 0xFFFF
}`,
        cmsisStruct: `#include "nrf.h"

bool nrf_radio_last_packet_crc_ok(void) {
    // El hardware comprueba el CRC al recibir el paquete por antena y actualiza CRCSTATUS:
    return (NRF_RADIO->CRCSTATUS == 1UL);
}`,
        proDriver: `// En comunicaciones inalámbricas industriales (BLE / IEEE 802.15.4 / Propulsión),
// jamás proceses un paquete recibido sin verificar primero que NRF_RADIO->CRCSTATUS == 1.`,
        asmInsight: 'El LFSR (Linear Feedback Shift Register) del bloque RADIO calcula el CRC en serie a medida que cada bit entra por el demodulador de 2.4 GHz (0 ciclos de CPU).',
        hardwareNote: 'El registro CRCPOLY en el nRF52840 permite programar cualquier polinomio generador de hasta 24 bits.'
      },
      rp2040: {
        rawPointer: `// RP2040: Sniffer Hardware de CRC-32 integrado en el Controlador DMA (0x50000400)
// ¡El DMA del RP2040 tiene un calculador CRC-32/CRC-16 en silicio que espía los datos mientras los copia!
#define DMA_SNIFF_CTRL (*(volatile uint32_t *)0x50000434UL)
#define DMA_SNIFF_DATA (*(volatile uint32_t *)0x50000438UL)

void rp2040_dma_enable_crc32_sniffer(uint32_t dma_channel) {
    DMA_SNIFF_DATA = 0xFFFFFFFFUL; // Semilla inicial CRC-32
    // Bit 0 (EN=1), Bits [4:1] = canal DMA a espiar, Bits [8:5] = 0 (Modo CRC-32 IEEE802.3):
    DMA_SNIFF_CTRL = ((dma_channel & 0x0FUL) << 1U) | (1UL << 0U);
}`,
        cmsisStruct: `#include "hardware/structs/dma.h"

uint32_t rp2040_read_dma_sniffed_crc(void) {
    return dma_hw->sniff_data; // Resultado CRC calculado en 0 ciclos de CPU durante el DMA!
}`,
        proDriver: `// Además, gracias a las máquinas de estados PIO del RP2040, existen implementaciones
// como "can2040" que convierten dos pines GPIO en un controlador CAN 2.0B completo a 1 Mbps.`,
        asmInsight: 'Mientras un canal DMA copia una imagen de firmware de Flash a RAM, el Sniffer calcula su CRC-32 gratis en el mismo bus.',
        hardwareNote: 'Solo un canal DMA a la vez puede usar el hardware Sniffer del RP2040, seleccionado mediante el campo DMACH en SNIFF_CTRL.'
      }
    },
    challenge: {
      question: 'Reto de Bus CAN — Colisión y Arbitraje Bit a Bit en el Cable',
      scenario:
        'En el bus CAN de un vehículo industrial o satélite, tres microcontroladores empiezan a transmitir una trama exactamente en el mismo microsegundo tras detectar el bus libre: el Nodo A transmite el ID 0x2A0 (0b01010100000), el Nodo B transmite el ID 0x150 (0b00101010000) y el Nodo C transmite el ID 0x140 (0b00101000000). Sabiendo que el bit 0 es Dominante y el bit 1 es Recesivo y que el ID se transmite MSB-first (del bit 10 al bit 0), ¿qué ocurre en el cable?',
      options: [
        {
          id: 'a',
          label: 'El Nodo C (ID 0x140) gana el arbitraje y termina de enviar su trama completa sin que se corrompa ni un solo bit; los Nodos A y B detectan que pusieron un 1 recesivo pero leyeron un 0 dominante en el bus, por lo que callan inmediatamente y reintentan cuando termine el Nodo C.',
          isCorrect: true,
          feedback: '¡Exacto! En el bit 9 el Nodo A pone un 1 mientras B y C ponen un 0 -> el Nodo A pierde y se retira. Los Nodos B (0x150) y C (0x140) empatan hasta el bit 4, donde B pone un 1 recesivo y C pone un 0 dominante -> el Nodo B se retira y el Nodo C gana limpiamente sin colisión destructiva.'
        },
        {
          id: 'b',
          label: 'Las tres tramas chocan, se destruyen eléctricamente y los tres nodos tienen que esperar un tiempo aleatorio como en Ethernet antiguo.',
          isCorrect: false,
          feedback: 'A diferencia de Ethernet CSMA/CD antiguo, el bus CAN utiliza CSMA/NBA (Non-Destructive Bitwise Arbitration): el mensaje más prioritario jamás se destruye ni se retrasa.'
        },
        {
          id: 'c',
          label: 'Gana el Nodo A porque 0x2A0 es el número más grande.',
          isCorrect: false,
          feedback: 'En el bus CAN el bit 0 es Dominante (gana al 1), por lo que cuanto MENOR es el número del ID, MAYOR es su prioridad.'
        }
      ]
    }
  },

  // =========================================================================
  // MÓDULO 14: ARITMÉTICA DE PUNTO FIJO (Q15/Q31) Y CONTROL PID DISCRETO
  // =========================================================================
  {
    id: 14,
    slug: 'aritmetica-punto-fijo-q15-q31-control-pid-discreto-anti-windup',
    title: 'Módulo 14: Aritmética de Punto Fijo (Q15 / Q31) y Control PID Discreto en Tiempo Real',
    subtitle: 'Cómo hacer matemáticas con decimales a velocidad de entero sin usar float (FPU) y cómo programar un controlador PID industrial con saturación y Anti-Windup',
    level: 'Experto Industrial',
    duration: '120 min',
    recommendedLab: 'senior-rtos-can-pid-fault',
    superficialMyth:
      'El principiante declara variables float o double para cualquier cálculo con decimales, sin saber que en un chip sin FPU (ATmega328P, RP2040, ESP32-C3) cada multiplicación float invoca cientos de instrucciones de emulación software y en sistemas críticos el IEEE-754 puede producir NaN o Infinito.',
    overwhelmingDatasheet:
      'Los manuales de DSP y CMSIS-DSP hablan de "Fractional Fixed-Point Representation Q1.15 and Q1.31, MAC (Multiply-Accumulate), Saturation Arithmetic (__SSAT), Quantization Noise, Discrete Z-Transform y Integrator Anti-Windup Clamping".',
    theBridgeExplanation:
      'Imagina que quieres guardar "25.75 grados" pero tu CPU solo sabe operar con números enteros. Si acuerdas contigo mismo que tu variable entera guarda "centésimas de grado" (2575), ya estás usando Punto Fijo decimal. En ingeniería digital hacemos lo mismo pero en potencias de 2 (para poder multiplicar y dividir usando desplazamientos de bits << y >> de 1 ciclo): en el formato Q15 (sobre un int16_t), decidimos que el factor de escala es 2^15 = 32768. Así, 0.5 se guarda como el entero 16384, y -0.5 como -16384. ¡La ALU entera del chip suma y multiplica tus números decimales en 1 solo ciclo de reloj sin necesitar hardware de coma flotante!',
    keyTakeaways: [
      {
        title: '1. Formato de Punto Fijo Q15 (int16_t) y Multiplicación con Desplazamiento (>> 15)',
        concept: 'En Q15 (también llamado Q1.15), usamos un int16_t donde 1 bit es el signo y los otros 15 bits son la parte fraccionaria (escala = 32768). Al multiplicar dos números Q15 entre sí, el resultado intermedio tiene escala 2^30 (Q30) y puede ocupar hasta 32 bits, por lo que es obligatorio hacer el cast a int32_t antes de multiplicar y luego desplazar 15 bits a la derecha (>> 15).',
        codeSnippet: `typedef int16_t q15_t; // Rango [-1.0, +0.999969] -> Escala: 1.0 equivaldría a 32768\n\nstatic inline q15_t q15_mul(q15_t a, q15_t b) {\n    int32_t prod = (int32_t)a * (int32_t)b; // Producto en 32 bits (Q30) para no desbordar!\n    return (q15_t)(prod >> 15);             // Volvemos a escala Q15 dividiendo entre 32768\n}`
      },
      {
        title: '2. Aritmética de Saturación vs Desbordamiento Circular (Wrap-Around)',
        concept: 'En enteros normales de C, si sumas 30000 + 5000 en un int16_t (máximo +32767), el resultado da la vuelta por abajo a -30536 (Wrap-Around). ¡Si eso es el mando de un motor o el timón de un cohete, invertirá la dirección bruscamente! En control y DSP usamos siempre Aritmética de Saturación: si el resultado supera +32767 se clava en +32767, y si baja de -32768 se clava en -32768.',
        codeSnippet: `static inline q15_t q15_add_sat(q15_t a, q15_t b) {\n    int32_t sum = (int32_t)a + (int32_t)b;\n    if (sum > 32767L)  return 32767;\n    if (sum < -32768L) return -32768;\n    return (q15_t)sum;\n}`
      },
      {
        title: '3. Lazo de Control PID Discreto con Anti-Windup de Integrador',
        concept: 'Un controlador PID calcula en cada instante de muestreo Ts el error e[k] = Consigna - Medida_ADC, y suma tres acciones: Proporcional (Kp * e[k]), Integral (acumula Ki * e[k] para eliminar el error estacionario) y Derivativa (Kd * (e[k] - e[k-1]) para frenar oscilaciones). Si el actuador (PWM) ya está al 100% porque el motor está bloqueado y sigues sumando al integrador, se produce el "Integral Windup" (el integrador crece a millones y tarda segundos en descargarse). El Anti-Windup congela o recorta el integrador en los límites físicos del PWM.',
        codeSnippet: `// Ecuación en diferencias de un Controlador PID Discreto con Clamping Anti-Windup:\nerror = setpoint - measurement;\nintegral += (ki * error);\nif (integral > OUT_MAX) integral = OUT_MAX; // Anti-Windup!\nif (integral < OUT_MIN) integral = OUT_MIN;\nout = (kp * error) + integral + (kd * (error - prev_error));\nprev_error = error;`
      }
    ],
    mcuCode: {
      atmega328p: {
        rawPointer: `// ATmega328P: Multiplicador Hardware 8x8 de 2 ciclos (MUL / MULS) aplicado a Punto Fijo Q8.8
// El AVR NO tiene FPU: un "float * float" tarda ~140 ciclos, pero en Punto Fijo Q8.8 tarda ~12 ciclos!
#include <stdint.h>

typedef int16_t q8_8_t; // 8 bits enteros + 8 bits fraccionarios (Escala = 256)

q8_8_t avr_pid_step_q8_8(q8_8_t setpoint, q8_8_t measured, q8_8_t *integ, q8_8_t *prev_err) {
    q8_8_t err = setpoint - measured;
    *integ += (err >> 2); // Ki = 0.25 (división exacta por desplazamiento!)
    if (*integ > 25500) *integ = 25500;
    if (*integ < 0)     *integ = 0;
    q8_8_t deriv = err - *prev_err;
    *prev_err = err;
    return (err * 2) + *integ + (deriv >> 1); // Kp=2.0, Ki=0.25, Kd=0.5 sin un solo float!
}`,
        cmsisStruct: `#include <avr/io.h>

// Aplicación directa de la salida del PID (recortada a 0..255) al registro PWM OCR0A:
void avr_apply_pid_to_pwm(int16_t pid_out_raw) {
    if (pid_out_raw > 255) pid_out_raw = 255;
    if (pid_out_raw < 0)   pid_out_raw = 0;
    OCR0A = (uint8_t)pid_out_raw;
}`,
        proDriver: `// En el ATmega328P, sustituir float por punto fijo Q8.8 o Q15 no solo multiplica por 10x
// la velocidad del lazo PID, sino que ahorra más de 1.5 KB de Flash de la librería libm.`,
        asmInsight: 'La CPU AVR incluye instrucciones dedicadas FMUL y FMULS (Fractional Multiply) pensadas específicamente para punto fijo Q1.7.',
        hardwareNote: 'Ejecuta siempre el cálculo del PID dentro de una bandera disparada por una interrupción de Timer con periodo fijo Ts (ej. cada 1 ms exacto).'
      },
      stm32f401: {
        rawPointer: `// STM32F401 (Cortex-M4 DSP): Instrucción Hardware de Saturación en 1 Ciclo (__SSAT)
// El núcleo Cortex-M4 incluye extensiones DSP en silicio que saturan un entero a N bits en 1 ciclo!
#include <stdint.h>

static inline int16_t stm32_ssat_q15(int32_t val) {
    int32_t res;
    // Instrucción ensamblador SSAT: recorta automáticamente al rango [-32768, +32767] en 1 ciclo:
    __asm volatile ("ssat %0, %1, %2" : "=r" (res) : "I" (16), "r" (val));
    return (int16_t)res;
}`,
        cmsisStruct: `#include "stm32f4xx.h"

// Filtro exponencial IIR (EMA) en Punto Fijo Q15 para limpiar lecturas ruidosas del ADC:
// Formula: y[n] = alpha * x[n] + (1 - alpha) * y[n-1]   (con alpha = 0.25 -> 8192 en Q15)
int16_t stm32_ema_filter_q15(int16_t new_sample, int16_t prev_filtered) {
    int32_t acc = ((int32_t)8192 * new_sample) + ((int32_t)24576 * prev_filtered);
    return (int16_t)(acc >> 15);
}`,
        proDriver: `// Aunque el STM32F401 tiene FPU de precisión simple (float de 32 bits), el uso de Q15/Q31
// con instrucciones SIMD del Cortex-M4 (SMLAD: dos multiplicaciones de 16 bits + suma en 1 ciclo)
// permite procesar 2 muestras en paralelo en un solo ciclo de reloj.`,
        asmInsight: 'La instrucción SSAT R0, #16, R0 evita los dos saltos condicionales (CMP + BGT + BLT), eliminando los vaciados del pipeline de la CPU.',
        hardwareNote: 'Si decides usar la FPU en STM32F4, recuerda habilitar los bits CP10 y CP11 en el registro SCB->CPACR ((3UL << 20) | (3UL << 22)) al arrancar.'
      },
      esp32c3: {
        rawPointer: `// ESP32-C3 (RISC-V RV32IMC): Multiplicador Hardware MUL de 1 ciclo (Extensión "M") Sin FPU
// ¡El ESP32-C3 NO tiene FPU hardware! Usar "float" llama a rutinas lentas en software (__mulsf3),
// pero tiene multiplicador entero de 32x32->64 bits (instrucciones MUL y MULH) en 1 ciclo:
#include <stdint.h>

typedef int32_t q16_16_t; // 16 bits enteros + 16 bits fraccionarios (Escala = 65536)

static inline q16_16_t riscv_q16_mul(q16_16_t a, q16_16_t b) {
    int64_t prod = (int64_t)a * (int64_t)b; // Usa MUL + MULH del RISC-V en silicio
    return (q16_16_t)(prod >> 16);
}`,
        cmsisStruct: `// Controlador PID completo en Q16.16 para el ESP32-C3 (100% determinista en ~15 ciclos):
typedef struct {
    q16_16_t kp;
    q16_16_t ki;
    q16_16_t kd;
    q16_16_t integral;
    q16_16_t prev_error;
    q16_16_t out_max;
    q16_16_t out_min;
} pid_q16_t;`,
        proDriver: `// Saber que el ESP32-C3 carece de FPU pero posee la extensión "M" de RISC-V es lo que
// diferencia a un ingeniero de firmware Senior: en Q16.16 tu lazo de control vuela.`,
        asmInsight: 'En RV32IMC, (int64_t)a * b compila en solo 2 instrucciones máquina (MUL y MULH) seguidas de SRLI/SLLI.',
        hardwareNote: 'A diferencia del ESP32 original (Xtensa con FPU), el ESP32-C3 es RV32IMC puro (Integer + Multiply + Compressed).'
      },
      nrf52840: {
        rawPointer: `// nRF52840: Conversión de Temperatura Interna en Punto Fijo Q30.2 (0.25 °C por LSB)
// El periférico TEMP del nRF52840 (0x4000C000) ya entrega la temperatura en Punto Fijo nativo!
#define TEMP_TASKS_START (*(volatile uint32_t *)0x4000C000UL)
#define TEMP_EVENTS_DATARDY (*(volatile uint32_t *)0x4000C100UL)
#define TEMP_VALUE_REG   (*(volatile int32_t *)0x4000C508UL)

// TEMP_VALUE_REG devuelve unidades de 0.25 °C (formato Q30.2).
// Para convertirlo a décimas de grado (ej. 25.5 °C -> 255) sin usar float:
int32_t nrf_temp_to_deci_celsius(int32_t raw_q2) {
    return (raw_q2 * 10L) >> 2; // Multiplica por 10 y divide entre 4 (>> 2)
}`,
        cmsisStruct: `#include "nrf.h"

int32_t nrf_read_die_temp_centi_c(void) {
    // Cada LSB vale 0.25 °C = 25 centésimas de grado:
    return NRF_TEMP->TEMP * 25L;
}`,
        proDriver: `// Muchos sensores digitales industriales (TMP102, DS18B20, INA219, periférico TEMP de Nordic)
// entregan sus registros directamente en Punto Fijo (ej. Q12.4 o Q30.2).`,
        asmInsight: 'Convertir Q30.2 a centésimas de grado es una sola instrucción MUL por 25, evitando encender la FPU y ahorrando energía.',
        hardwareNote: 'Mantener la FPU apagada en el nRF52840 reduce el tamaño del marco de pila en las interrupciones de radio BLE.'
      },
      rp2040: {
        rawPointer: `// RP2040: Coprocesador Hardware "INTERP0 / INTERP1" en el bloque SIO (0xD0000080)
// ¡El RP2040 NO tiene FPU, pero incluye 2 Interpoladores Hardware en el SIO que hacen
// desplazamientos, máscaras, sumas y saturación (clamping) en 1 solo ciclo de reloj!
#define SIO_INTERP0_ACCUM0   (*(volatile int32_t *)0xD0000080UL)
#define SIO_INTERP0_BASE0    (*(volatile int32_t *)0xD0000088UL)
#define SIO_INTERP0_PEEK0    (*(volatile int32_t *)0xD00000A0UL)
#define SIO_INTERP0_CTRL0    (*(volatile uint32_t *)0xD00000ACUL)

// En modo CLAMP (Bit 22 de CTRL0), INTERP0 satura automáticamente ACCUM0 entre BASE0 y BASE1:
int32_t rp2040_hw_clamp_anti_windup(int32_t value, int32_t min_limit, int32_t max_limit) {
    if (value > max_limit) return max_limit;
    if (value < min_limit) return min_limit;
    return value;
}`,
        cmsisStruct: `#include "hardware/structs/interp.h"

void rp2040_interp0_setup_clamp(int32_t min_val, int32_t max_val) {
    interp0_hw->ctrl[0] = (1UL << 22) | (1UL << 15); // CLAMP=1, SIGNED=1
    interp0_hw->base[0] = (uint32_t)min_val;
    interp0_hw->base[1] = (uint32_t)max_val;
}`,
        proDriver: `// Una vez configurado interp0_hw en modo CLAMP, basta con escribir tu integrador PID en
// interp0_hw->accum[0] y leer interp0_hw->peek[0] para obtener el valor saturado en 1 ciclo!`,
        asmInsight: 'El coprocesador INTERP vive en el bus SIO de ciclo único del RP2040, compensando con creces la ausencia de instrucciones DSP en el Cortex-M0+.',
        hardwareNote: 'Cada núcleo del RP2040 tiene su propio par de interpoladores dedicados (INTERP0 e INTERP1).'
      }
    },
    challenge: {
      question: 'Reto de Control Industrial — Saturación del Integrador (Integral Windup)',
      scenario:
        'Has programado un controlador PID para regular la velocidad de un brazo robótico con consigna de 1000 RPM. Mientras el robot opera, un operario sujeta el brazo durante 5 segundos impidiendo que se mueva (medida = 0 RPM, error = +1000 RPM). Como el término integral suma (Ki * error) cada milisegundo sin límite, el acumulador integral sube hasta +5.000.000 aunque el registro del PWM físico ya estaba a tope (100%). Cuando el operario suelta el brazo, ¿qué ocurre si tu PID NO tiene protección Anti-Windup?',
      options: [
        {
          id: 'a',
          label: 'El brazo sale disparado a máxima potencia (100% PWM) y sobrepasa violentamente las 1000 RPM (Overshoot peligroso) porque, aunque el error pase a ser negativo al superar la consigna, tarda varios segundos en restar y vaciar los +5.000.000 acumulados en el integrador.',
          isCorrect: true,
          feedback: '¡Exacto! Ese fenómeno es el temido "Integral Windup". La solución obligatoria en cualquier PID de producción es aplicar Clamping Anti-Windup: recortar el acumulador integral inmediatamente a los límites físicos de salida [OUT_MIN, OUT_MAX] en cada iteración.'
        },
        {
          id: 'b',
          label: 'El brazo se detiene suavemente en 1000 RPM sin sobreoscilación porque el término proporcional anula instantáneamente cualquier valor del integrador.',
          isCorrect: false,
          feedback: 'Mientras el integrador valga millones por encima del máximo del PWM, la suma P + I + D seguirá saturada al 100% mucho después de haber superado la consigna.'
        },
        {
          id: 'c',
          label: 'El término integral solo sirve para amplificar el ruido de alta frecuencia del ADC.',
          isCorrect: false,
          feedback: 'Quien amplifica el ruido de alta frecuencia es el término Derivativo (D); el término Integral (I) elimina el error en régimen permanente.'
        }
      ]
    }
  },

  // =========================================================================
  // MÓDULO 15: DEPURACIÓN HARDWARE (SWD/JTAG) Y ANÁLISIS FORENSE DE HARDFAULT
  // =========================================================================
  {
    id: 15,
    slug: 'depuracion-hardware-swd-jtag-analisis-forense-hardfault-cfsr-stack',
    title: 'Módulo 15: Depuración Hardware (SWD / JTAG) y Análisis Forense de Fallos (HardFault)',
    subtitle: 'Cómo leer los registros de autopsia del procesador (SCB->CFSR, HFSR, BFAR, MMFAR) y reconstruir el Stack Frame para encontrar la instrucción exacta en C que colgó el microcontrolador',
    level: 'Experto Industrial',
    duration: '120 min',
    recommendedLab: 'senior-rtos-can-pid-fault',
    superficialMyth:
      'Cuando un microcontrolador se cuelga y entra en HardFault_Handler(), el programador novato llena el código de printf("llego aqui 1"), printf("llego aqui 2") o reinicia a ciegas sin saber que la CPU guarda una "caja negra" exacta del accidente.',
    overwhelmingDatasheet:
      'El ARMv7-M Architecture Reference Manual habla de "Configurable Fault Status Register (SCB->CFSR: UFSR, BFSR, MMFSR), BusFault Address Register (BFAR), Exception Stack Frame Unwinding, CoreSight DWT Cycle Counter y SWD Breakpoint Unit (FPB)".',
    theBridgeExplanation:
      'Cuando tu código C comete un delito grave en silicio (escribir en una dirección de memoria que no existe como 0x99999999, dividir entre cero, ejecutar una instrucción corrupta o saltar a un puntero de función NULL), el hardware de la CPU detiene la ejecución en seco, apila automáticamente los 8 registros del momento exacto del choque en la RAM (incluyendo el PC —la dirección exacta de la instrucción culpable— y el LR —quién llamó a esa función—) y anota el motivo del fallo en el registro SCB->CFSR. ¡Si programas un HardFault_Handler inteligente que lea esa pila y el registro CFSR, el propio chip te dice el nombre del error, la dirección prohibida que intentaste tocar y la línea exacta de tu código C!',
    keyTakeaways: [
      {
        title: '1. El Marco de Pila del Accidente (Exception Stack Frame: R0..R3, R12, LR, PC, xPSR)',
        concept: 'Justo antes de saltar a HardFault_Handler, el hardware de ARM Cortex-M empuja 8 palabras de 32 bits en la pila activa (MSP o PSP). La palabra en el índice [6] (sp[6]) es el Program Counter (PC) exacto de la instrucción que causó el fallo, y sp[5] es el Link Register (LR) con la dirección de retorno de la función.',
        codeSnippet: `// Estructura exacta de los 8 registros apilados por el silicio al ocurrir un HardFault:\ntypedef struct {\n    uint32_t r0, r1, r2, r3, r12;\n    uint32_t lr;   // sp[5]: Quién llamó a la función donde ocurrió el accidente\n    uint32_t pc;   // sp[6]: ¡DIRECCIÓN EXACTA DE LA INSTRUCCIÓN QUE EXPLOTÓ!\n    uint32_t xpsr; // sp[7]: Banderas de la ALU y bit Thumb\n} fault_stack_frame_t;`
      },
      {
        title: '2. Los Registros de Diagnóstico de Fallo (SCB->CFSR, SCB->BFAR y SCB->MMFAR)',
        concept: 'En Cortex-M3/M4/M7, el registro de 32 bits SCB->CFSR (0xE000ED28) se divide en tres sub-registros: 1) MMFSR (bits 7..0, fallos de protección de memoria MPU), 2) BFSR (bits 15..8, BusFault por acceder a una dirección física inexistente, guardada en SCB->BFAR si BFARVALID=1) y 3) UFSR (bits 31..16, UsageFault como división por cero DIVBYZERO, acceso desalineado UNALIGNED o instrucción indefinida UNDEFINSTR).',
        codeSnippet: `uint32_t cfsr = SCB->CFSR; // 0xE000ED28: Registro de Estado de Fallo Configurable\nif (cfsr & (1UL << 15)) {  // Bit 15 (BFARVALID): ¡SCB->BFAR tiene la dirección culpable!\n    uint32_t bad_addr = SCB->BFAR; // Dirección exacta que causó el BusFault\n}`
      },
      {
        title: '3. Medición de Ciclos Exactos de CPU con el Contador Hardware DWT->CYCCNT',
        concept: 'Dentro del bloque de depuración CoreSight (Data Watchpoint and Trace — DWT), los procesadores Cortex-M3/M4/M7 integran un contador libre de 32 bits (DWT->CYCCNT en 0xE0001004) que se incrementa en +1 con cada ciclo de reloj de la CPU. Permite medir el WCET (Worst-Case Execution Time) de cualquier función en C con precisión de nanosegundos sin gastar ningún Timer periférico.',
        codeSnippet: `CoreDebug->DEMCR |= CoreDebug_DEMCR_TRCENA_Msk; // Habilita bloque de traza CoreSight\nDWT->CYCCNT = 0UL;\nDWT->CTRL  |= DWT_CTRL_CYCCNTENA_Msk;          // Arranca contador de ciclos de CPU\nuint32_t t0 = DWT->CYCCNT;\nejecutar_algoritmo_critico();\nuint32_t ciclos_exactos = DWT->CYCCNT - t0;     // ¡Precisión de 1 ciclo de CPU!`
      }
    ],
    mcuCode: {
      atmega328p: {
        rawPointer: `// ATmega328P: Registro MCUSR (0x54) + Canario de Pila (Stack Canary 0xC5) en SRAM
// El AVR no tiene excepción HardFault, pero tiene el registro MCUSR que te dice POR QUÉ
// se reinició el chip (Bit 3: WDRF Watchdog, Bit 2: BORF Brown-Out caída de tensión):
#define MCUSR_REG (*(volatile uint8_t *)0x54)

// Y para detectar si la Pila (Stack) creció tanto que aplastó tus variables (.bss),
// pintamos una palabra mágica ("Canario" 0xDEAD) al final de .bss y la vigilamos:
extern uint8_t __bss_end;
#define STACK_CANARY_ADDR ((volatile uint16_t *)&__bss_end)

void avr_init_stack_canary(void) {
    *STACK_CANARY_ADDR = 0xDEADU;
}

uint8_t avr_check_stack_overflow(void) {
    return (*STACK_CANARY_ADDR != 0xDEADU) ? 1U : 0U; // 1 = ¡La pila pisó el canario!
}`,
        cmsisStruct: `#include <avr/io.h>

uint8_t avr_capture_reset_cause_early(void) {
    uint8_t cause = MCUSR;
    MCUSR = 0U; // Limpiar MCUSR al arrancar para distinguir el próximo reinicio
    return cause;
}`,
        proDriver: `// Técnica clásica en GCC ("Stack Painting"): rellenar toda la RAM libre con 0xAA55 al arrancar
// permite medir el "High-Water Mark" (uso máximo histórico de pila) buscando hasta dónde se borró 0xAA55.`,
        asmInsight: 'En el ATmega328P, la interfaz de depuración física en un solo pin es debugWIRE (usando el propio pin RESET).',
        hardwareNote: 'Guarda siempre el valor de MCUSR en una sección .noinit de RAM antes de saltar a tu diagnóstico para saber si hubo caída de batería (BORF) o cuelgue (WDRF).'
      },
      stm32f401: {
        rawPointer: `// STM32F401 (Cortex-M4): Lectura Forense de SCB->CFSR (0xE000ED28) y SCB->BFAR (0xE000ED38)
#define SCB_CFSR_REG  (*(volatile uint32_t *)0xE000ED28UL)
#define SCB_HFSR_REG  (*(volatile uint32_t *)0xE000ED2CUL)
#define SCB_MMFAR_REG (*(volatile uint32_t *)0xE000ED34UL)
#define SCB_BFAR_REG  (*(volatile uint32_t *)0xE000ED38UL)
#define SCB_CCR_REG   (*(volatile uint32_t *)0xE000ED14UL)

void stm32_enable_div_by_zero_and_unaligned_traps(void) {
    // Por defecto Cortex-M4 devuelve 0 al dividir por 0 en silencio!
    // Activamos bit 4 (DIV_0_TRP) y bit 3 (UNALIGN_TRP) en SCB->CCR para cazar el bug al vuelo:
    SCB_CCR_REG |= (1UL << 4) | (1UL << 3);
}`,
        cmsisStruct: `#include "stm32f4xx.h"

// Manejador C que recibe el puntero exacto al marco de pila (MSP o PSP) donde explotó el código:
void hardfault_forensic_c_handler(const uint32_t *fault_sp) {
    volatile uint32_t crashed_pc  = fault_sp[6]; // Dirección de la instrucción culpable
    volatile uint32_t caller_lr   = fault_sp[5]; // Función que la llamó
    volatile uint32_t cfsr_status = SCB->CFSR;   // Qué tipo de delito cometió
    volatile uint32_t bus_addr    = SCB->BFAR;   // Dirección prohibida leída/escrita
    (void)crashed_pc; (void)caller_lr; (void)cfsr_status; (void)bus_addr;
    __BKPT(0); // Detiene el depurador SWD inmediatamente en esta línea!
}`,
        proDriver: `// Cómo convertir "crashed_pc = 0x080014A2" en el archivo y número de línea exacto de tu C:
// Ejecuta en tu terminal:
//   arm-none-eabi-addr2line -e firmware.elf -f -p 0x080014A2
// Y te responderá: "motor_apply_curve at src/motor_lib.c:42"!`,
        asmInsight: 'El prólogo en ensamblador de HardFault_Handler hace: TST LR, #4 -> ITE EQ -> MRSEQ R0, MSP -> MRSNE R0, PSP -> B hardfault_forensic_c_handler.',
        hardwareNote: 'Comprobar el bit 2 del registro LR (EXC_RETURN & 4) te dice si el fallo ocurrió en modo Handler/Main (MSP) o dentro de una tarea de RTOS (PSP).'
      },
      esp32c3: {
        rawPointer: `// ESP32-C3 (RISC-V): Registros CSR de Autopsia de Excepciones (mcause, mepc y mtval)
// En arquitectura RISC-V no existe SCB->CFSR; la CPU tiene 3 registros CSR dedicados al fallo:
// - mepc   : Machine Exception Program Counter (Dirección exacta de la instrucción que falló)
// - mcause : Código numérico de la causa (ej. 2=Instrucción ilegal, 5=Load Fault, 7=Store Fault)
// - mtval  : Machine Trap Value (Dirección de memoria inválida que intentaste leer/escribir)
#include <stdint.h>

static inline uint32_t riscv_read_mepc(void) {
    uint32_t val;
    __asm volatile ("csrr %0, mepc" : "=r"(val));
    return val;
}`,
        cmsisStruct: `static inline uint32_t riscv_read_mcause(void) {
    uint32_t val;
    __asm volatile ("csrr %0, mcause" : "=r"(val));
    return val;
}

static inline uint32_t riscv_read_mtval(void) {
    uint32_t val;
    __asm volatile ("csrr %0, mtval" : "=r"(val));
    return val;
}`,
        proDriver: `// El ESP32-C3 incluye un depurador JTAG USB nativo en los pines GPIO18 (D-) y GPIO19 (D+)
// sin necesitar un adaptador externo FTDI o ST-Link!`,
        asmInsight: 'La instrucción CSRR (Control and Status Register Read) lee mepc, mcause y mtval en 1 ciclo.',
        hardwareNote: 'Cuando ocurre un pánico en ESP-IDF, el volcado "Guru Meditation Error" imprime exactamente mepc, mcause y mtval por UART.'
      },
      nrf52840: {
        rawPointer: `// nRF52840: Contador de Ciclos DWT->CYCCNT (0xE0001004) y Registro de Causa RESETREAS
#define CoreDebug_DEMCR_REG (*(volatile uint32_t *)0xE000EDFCUL)
#define DWT_CTRL_REG        (*(volatile uint32_t *)0xE0001000UL)
#define DWT_CYCCNT_REG      (*(volatile uint32_t *)0xE0001004UL)
#define POWER_RESETREAS_REG (*(volatile uint32_t *)0x40000400UL)

void nrf_dwt_cycle_counter_init(void) {
    CoreDebug_DEMCR_REG |= (1UL << 24); // Bit 24: TRCENA (Habilita bloque CoreSight DWT)
    DWT_CYCCNT_REG       = 0UL;
    DWT_CTRL_REG        |= (1UL << 0);  // Bit 0: CYCCNTENA (Incrementa 64.000.000 veces/s)
}`,
        cmsisStruct: `#include "nrf.h"

// El bit 3 de NRF_POWER->RESETREAS (LOCKUP) indica si el chip se reinició porque el núcleo
// ARM entró en estado "Core Lockup" (un fallo grave dentro del propio HardFault_Handler):
bool nrf_did_reboot_from_lockup(void) {
    return (NRF_POWER->RESETREAS & POWER_RESETREAS_LOCKUP_Msk) != 0UL;
}`,
        proDriver: `// En sistemas desplegados en campo (donde no tienes un cable SWD conectado), el HardFault_Handler
// guarda {PC, LR, CFSR, BFAR} en una estructura en RAM .noinit o Flash y reinicia el chip.`,
        asmInsight: 'DWT->CYCCNT permite verificar que ninguna sección crítica bloquee las interrupciones de la radio BLE más de los microsegundos permitidos.',
        hardwareNote: 'El registro NRF_POWER->RESETREAS es acumulativo: debes limpiarlo escribiendo un 1 en sus bits tras leerlo al arrancar.'
      },
      rp2040: {
        rawPointer: `// RP2040 (ARMv6-M Cortex-M0+): Depuración SWD Multicore e Instrucción de Breakpoint (BKPT)
// En Cortex-M0+ (ARMv6-M) no existe SCB->CFSR detallado; todos los fallos de bus o instrucción
// escalan directamente a HardFault_Handler, donde inspeccionamos el Stack Frame en MSP/PSP:
#include <stdint.h>

typedef struct {
    uint32_t r0, r1, r2, r3, r12, lr, pc, xpsr;
} armv6m_exception_frame_t;

void rp2040_software_breakpoint(void) {
    __asm volatile ("bkpt #0"); // Detiene el núcleo actual si hay sonda SWD conectada
}`,
        cmsisStruct: `#include "hardware/structs/psm.h"

// El registro FRCE_OFF del Power-on State Machine (PSM) permite reiniciar un subsistema
// colgado sin perder el estado de depuración SWD.`,
        proDriver: `// En el RP2040, el bus SWD (pines SWCLK y SWDIO) utiliza el protocolo ADIv5 multi-drop,
// permitiendo conectar GDB al Core 0 y al Core 1 simultáneamente con dos hilos de depuración.`,
        asmInsight: 'En Cortex-M0+ cualquier acceso de 32 bits (LDR/STR) a una dirección no múltiplo de 4 dispara un HardFault inmediato en silicio.',
        hardwareNote: 'Cuidado con hacer casts de (uint8_t *) a (uint32_t *) sobre un buffer desalineado en el RP2040: en Cortex-M4 funciona pero en Cortex-M0+ lanza HardFault.'
      }
    },
    challenge: {
      question: 'Reto Forense de HardFault — Autopsia de un Cuelgue en Producción',
      scenario:
        'Un equipo médico basado en un ARM Cortex-M4 (STM32F4 / nRF52840) sufre un reinicio esporádico cada 48 horas. Tu manejador forense de HardFault captura y guarda en memoria el marco de pila del accidente antes de reiniciar: sp[5] (LR) = 0x08002105, sp[6] (PC) = 0x08002148, SCB->CFSR = 0x00008200 (Bit 9 PRECISERR = 1 y Bit 15 BFARVALID = 1) y SCB->BFAR = 0x00000004. ¿Qué ocurrió exactamente en tu código C?',
      options: [
        {
          id: 'a',
          label: 'La instrucción situada en la dirección de Flash 0x08002148 (llamada desde 0x08002104) intentó desreferenciar un puntero NULL a una estructura accediendo a su segundo campo de 32 bits (offset +4 -> dirección 0x00000004), provocando un BusFault preciso.',
          isCorrect: true,
          feedback: '¡Autopsia forense magistral! Cuando tienes un puntero nulo (ptr = NULL = 0x00000000) y haces ptr->segundo_campo (que está en el offset +4 bytes), la CPU intenta leer o escribir en la dirección 0x00000004. Eso queda grabado en SCB->BFAR = 0x00000004 y el PC (0x08002148) te da la línea exacta al pasarlo por addr2line.'
        },
        {
          id: 'b',
          label: 'El programa dividió un número entre 4 en la dirección 0x00008200.',
          isCorrect: false,
          feedback: '0x00008200 es el valor de las banderas del registro SCB->CFSR (PRECISERR | BFARVALID), y 0x00000004 en BFAR es la dirección de memoria que causó el fallo de bus.'
        },
        {
          id: 'c',
          label: 'Es imposible saber dónde falló sin conectar una sonda JTAG en el momento exacto del fallo.',
          isCorrect: false,
          feedback: 'Precisamente para eso existen el Stack Frame de excepción y los registros SCB->CFSR y SCB->BFAR: puedes guardarlos en Flash/EEPROM antes de reiniciar y analizar el fallo en el laboratorio.'
        }
      ]
    }
  },

  // =========================================================================
  // MÓDULO 16: ULTRA-BAJO CONSUMO (SLEEP / STOP / DEEP-SLEEP) Y BATERÍAS
  // =========================================================================
  {
    id: 16,
    slug: 'modos-ultra-bajo-consumo-sleep-deep-sleep-wfi-wfe-baterias',
    title: 'Módulo 16: Modos de Ultra-Bajo Consumo (Sleep, Stop, Deep-Sleep) y Diseño con Batería',
    subtitle: 'Cómo reducir el consumo de un microcontrolador de 20 mA a 2 µA usando las instrucciones __WFI() / __WFE(), apagado selectivo de dominios de reloj, pines flotantes y presupuesto energético',
    level: 'Experto Industrial',
    duration: '120 min',
    recommendedLab: 'senior-rtos-can-pid-fault',
    superficialMyth:
      'En proyectos de iniciación dejan la CPU dando millones de vueltas por segundo en un bucle while(1) vacío esperando un botón o un timer, agotando una pila de botón CR2032 (220 mAh) en menos de 18 horas.',
    overwhelmingDatasheet:
      'Las hojas de datos hablan de "System Control Register SCB->SCR (SLEEPDEEP, SLEEPONEXIT), Wait For Interrupt (WFI), Wait For Event (WFE), Voltage Regulator Low-Power Mode, SRAM Retention Domains, Wake-up Sources (EXTI/RTC) y fugas por pines en High-Z".',
    theBridgeExplanation:
      'Cada vez que un transistor CMOS cambia de 0 a 1 dentro de tu microcontrolador, carga un pequeño condensador parásito gastando energía: la potencia dinámica sigue la ley física P = C * V^2 * f. Si tu CPU corre a 84 MHz ejecutando un bucle vacío, sus millones de transistores conmutan 84 millones de veces por segundo para no hacer nada. Cuando ejecutas la instrucción ensamblador WFI (Wait For Interrupt), una puerta lógica detiene en seco el reloj del núcleo (f = 0 Hz para la CPU) mientras los periféricos (UART, Timer, EXTI) siguen despiertos. En cuanto llega un byte por UART o se pulsa un botón, el controlador de interrupciones vuelve a abrir la compuerta del reloj en pocos microsegundos y la CPU continúa en la línea siguiente!',
    keyTakeaways: [
      {
        title: '1. La Ley Física del Consumo CMOS (P = C · V² · f + I_leak · V) y el Ciclo de Trabajo',
        concept: 'El consumo medio de un nodo IoT o espacial viene dado por la media ponderada entre el tiempo que pasa despierto (I_run, miliamperios) y el tiempo que pasa dormido (I_sleep, microamperios): I_avg = (I_run * T_run + I_sleep * T_sleep) / (T_run + T_sleep). Si tu sensor mide durante 5 ms (a 10 mA) y duerme durante 995 ms (a 2 µA), tu corriente media cae de 10 mA a solo 52 µA (¡la batería dura 190 veces más!).',
        codeSnippet: `// Cálculo de autonomía de batería (en horas) a partir de la corriente media en microamperios:\n// Capacidad_uAh = Capacidad_mAh * 1000\nuint32_t battery_life_hours(uint32_t capacity_mah, uint32_t i_avg_ua) {\n    return (capacity_mah * 1000UL) / (i_avg_ua > 0UL ? i_avg_ua : 1UL);\n}`
      },
      {
        title: '2. Sleep Normal vs Deep-Sleep (SCB->SCR: SLEEPDEEP y SLEEPONEXIT)',
        concept: 'En ARM Cortex-M, el registro SCB->SCR (0xE000ED10) tiene dos bits clave: 1) Bit 1 (SLEEPONEXIT): al terminar una ISR, la CPU vuelve a dormirse automáticamente sin regresar siquiera al hilo main() (ideal para aplicaciones 100% guiadas por interrupciones); y 2) Bit 2 (SLEEPDEEP): si vale 0, __WFI() entra en modo Sleep ligero (solo apaga el reloj de la CPU); si vale 1, __WFI() entra en modo Stop/Deep-Sleep (apaga también el PLL de alta frecuencia y reguladores principales, dejando solo el oscilador lento de 32 kHz del RTC y la retención de SRAM).',
        codeSnippet: `#define SCB_SCR_SLEEPONEXIT (1UL << 1)\n#define SCB_SCR_SLEEPDEEP   (1UL << 2)\n\nvoid enter_deep_sleep_stop_mode(void) {\n    SCB->SCR |= SCB_SCR_SLEEPDEEP; // Selecciona modo Stop / Deep-Sleep\n    __DSB();                       // Asegura que la escritura en SCB->SCR se complete\n    __WFI();                       // Detiene el reloj hasta la próxima interrupción EXTI/RTC!\n}`
      },
      {
        title: '3. El Enemigo Oculto del Bajo Consumo: Pines GPIO Flotantes y Pull-Ups Contra Tierra',
        concept: 'Puedes configurar el modo Deep-Sleep más avanzado del mundo, pero si dejas un pin GPIO como Entrada Digital sin resistencia Pull-Up/Pull-Down (flotante a ~1.65V), los dos transistores del inversor de entrada (Schmitt Trigger) conducen a la vez desde VCC a GND gastando hasta 200 µA por pin. Del mismo modo, dejar un pin en Analógico o con Pull desconectado según indique el fabricante es vital antes de dormir.',
        codeSnippet: `// En STM32, configurar los pines NO utilizados en modo Analógico (MODER = 0b11, PUPDR = 0b00)\n// desconecta el Schmitt Trigger de entrada, reduciendo la fuga de cada pin a 0.00 uA:\nGPIOA->MODER |= (3UL << (pin * 2U)); // Modo 11: Analógico (Schmitt Trigger apagado)`
      }
    ],
    mcuCode: {
      atmega328p: {
        rawPointer: `// ATmega328P: Registro SMCR (Sleep Mode Control Register, 0x53) y PRR (Power Reduction, 0x64)
#define SMCR_REG   (*(volatile uint8_t *)0x53)
#define PRR_REG    (*(volatile uint8_t *)0x64)
#define ADCSRA_REG (*(volatile uint8_t *)0x7A)

void avr_enter_power_down_sleep(void) {
    // 1. ¡TRAMPA CLÁSICA AVR!: Si no apagas ADEN (Bit 7 de ADCSRA), el ADC sigue gastando 250 uA dormido!
    ADCSRA_REG &= ~(1U << 7);
    // 2. Apagar relojes de periféricos en PRR:
    PRR_REG = 0xFFU;
    // 3. Modo Power-Down (SM[2:0] = 010 -> Bit 2 = 1) + Sleep Enable (Bit 0 SE = 1):
    SMCR_REG = (2U << 1) | (1U << 0);
    __asm volatile ("sleep"); // Instrucción SLEEP: baja el consumo del chip a ~0.5 uA!
    SMCR_REG &= ~(1U << 0);   // Limpiar bit SE al despertar
}`,
        cmsisStruct: `#include <avr/io.h>
#include <avr/sleep.h>

void avr_sleep_until_int0_button(void) {
    set_sleep_mode(SLEEP_MODE_PWR_DOWN);
    sleep_enable();
    sleep_bod_disable(); // Desactiva Brown-Out Detector durante el sueño (~15 uA menos)
    sleep_cpu();
    sleep_disable();
}`,
        proDriver: `// Apagar ADCSRA (ADEN=0) y el BOD antes de ejecutar "sleep" en el ATmega328P es la diferencia
// entre consumir 280 uA (pila muerta en 1 mes) o 0.4 uA (pila viva durante 10 años).`,
        asmInsight: 'La instrucción SLEEP del AVR detiene el oscilador principal en modo Power-Down; solo INT0/INT1, PCINT o el Watchdog pueden despertarlo.',
        hardwareNote: 'El bit SE (Sleep Enable) de SMCR debe ponerse a 1 justo antes de la instrucción SLEEP y limpiarse a 0 nada más despertar.'
      },
      stm32f401: {
        rawPointer: `// STM32F401: Modo STOP con Regulador en Bajo Consumo (PWR->CR en 0x40007000 + SCB->SCR)
#define PWR_CR_REG  (*(volatile uint32_t *)0x40007000UL)
#define SCB_SCR_REG (*(volatile uint32_t *)0xE000ED10UL)

void stm32_enter_stop_low_power_mode(void) {
    // 1. En PWR->CR: limpiar PDDS (Bit 1 = 0 -> Modo Stop, no Standby) y poner LPDS (Bit 0 = 1 -> Regulador LP):
    PWR_CR_REG = (PWR_CR_REG & ~(1UL << 1)) | (1UL << 0) | (1UL << 9); // Bit 9: FPDS (Flash Power-Down)
    // 2. Activar SLEEPDEEP (Bit 2) en el registro SCB->SCR del núcleo ARM:
    SCB_SCR_REG |= (1UL << 2);
    // 3. Barrera de sincronización de datos + Instrucción Wait For Interrupt:
    __asm volatile ("dsb");
    __asm volatile ("wfi");
    // 4. Al despertar por EXTI o RTC, limpiar SLEEPDEEP:
    SCB_SCR_REG &= ~(1UL << 2);
}`,
        cmsisStruct: `#include "stm32f4xx.h"

// Modo SLEEPONEXIT: La CPU duerme el 100% del tiempo y solo se despierta para ejecutar ISRs:
void stm32_enable_sleep_on_exit(void) {
    SCB->SCR &= ~SCB_SCR_SLEEPDEEP_Msk;
    SCB->SCR |= SCB_SCR_SLEEPONEXIT_Msk; // Al salir de cualquier ISR, vuelve a dormir sola!
    __DSB();
    __WFI();
}`,
        proDriver: `// Atención al despertar del modo STOP en STM32: cuando el chip despierta de STOP, el reloj
// del sistema vuelve por defecto al oscilador HSI interno (16 MHz). Tu código tras __WFI()
// debe volver a encender el HSE y el PLL si necesitas de nuevo los 84 MHz.`,
        asmInsight: 'La secuencia DSB + WFI vacía el buffer de escritura del bus antes de cortar el reloj del procesador.',
        hardwareNote: 'En modo STOP del STM32F401 se conserva el 100% de los 96 KB de SRAM y el estado de todos los registros GPIO.'
      },
      esp32c3: {
        rawPointer: `// ESP32-C3: Controlador de Energía RTC_CNTL (0x60008000) — Light-Sleep y Deep-Sleep (5 uA)
#define RTC_CNTL_STATE0_REG      (*(volatile uint32_t *)0x60008018UL)
#define RTC_CNTL_WAKEUP_STATE_REG (*(volatile uint32_t *)0x60008038UL)
#define RTC_CNTL_SLP_TIMER0_REG  (*(volatile uint32_t *)0x60008008UL)

void esp32c3_trigger_rtc_sleep(uint32_t wakeup_Mask) {
    RTC_CNTL_WAKEUP_STATE_REG = (wakeup_Mask & 0xFFFFUL) << 15U;
    RTC_CNTL_STATE0_REG |= (1UL << 31); // Bit 31: SLEEP_EN -> Apaga CPU y Wi-Fi/BLE!
}`,
        cmsisStruct: `// En el ESP32-C3, en modo Deep-Sleep los 400 KB de SRAM normal se apagan (consumo = 5 uA),
// pero existen 8 KB de "RTC FAST Memory" que NO se borran al despertar de Deep-Sleep:
#include <stdint.h>

// Variable que sobrevive al reinicio de Deep-Sleep en la memoria del dominio RTC:
__attribute__((section(".rtc.data"))) static uint32_t s_boot_count_rtc = 0U;`,
        proDriver: `// Patrón industrial de Telemetría por Batería: Despertar de Deep-Sleep -> Leer sensor en 10 ms ->
// Guardar en RTC RAM -> Transmitir en ráfaga -> Volver a Deep-Sleep de 5 uA.`,
        asmInsight: 'Al despertar de Deep-Sleep, el ESP32-C3 ejecuta un reinicio rápido desde el vector de arranque conservando los 8 KB de RTC RAM.',
        hardwareNote: 'Con Wi-Fi activo el ESP32-C3 consume picos de >250 mA; en Light-Sleep baja a 130 uA y en Deep-Sleep a solo 5 uA.'
      },
      nrf52840: {
        rawPointer: `// nRF52840: El Rey del Ultra-Bajo Consumo — System ON Idle (1.5 uA) y System OFF (0.4 uA)
#define POWER_SYSTEMOFF_REG (*(volatile uint32_t *)0x40000500UL)
#define GPIO_PIN_CNF_BASE   ((volatile uint32_t *)0x50000700UL)

void nrf_enter_system_off_deepest_sleep(uint32_t wake_pin) {
    // Configurar el pin de despertar con detector SENSE en nivel bajo (Bits [17:16] = 3):
    GPIO_PIN_CNF_BASE[wake_pin] = (0UL << 0) | (3UL << 2) | (3UL << 16);
    // Escribir 1 en SYSTEMOFF apaga TODO el chip (consumo 0.4 uA) hasta que wake_pin cambie!
    POWER_SYSTEMOFF_REG = 1UL;
    while (1) { }
}`,
        cmsisStruct: `#include "nrf.h"

// En modo normal ("System ON"), en el nRF52840 NO tienes que tocar ningún registro de reloj:
// basta con ejecutar __WFE() / __WFI() y el regulador interno apaga automáticamente HFCLK:
void nrf_system_on_idle_sleep(void) {
    __SEV();
    __WFE(); // Limpia el registro de eventos interno
    __WFE(); // Duerme la CPU a ~1.5 uA manteniendo RAM y RTC activos!
}`,
        proDriver: `// En el nRF52840, la secuencia canónica de sueño por eventos es: __SEV(); __WFE(); __WFE();
// para asegurarse de consumir cualquier evento pendiente antes de dormir.`,
        asmInsight: 'Gracias a la gestión automática de relojes de Nordic, la CPU pasa de 1.5 uA a 64 MHz en menos de 3 microsegundos al saltar un evento.',
        hardwareNote: 'Puedes apagar bancos individuales de 4 KB o 32 KB de los 256 KB de SRAM en NRF_POWER->RAM[n].POWER para ahorrar aún más corriente de retención.'
      },
      rp2040: {
        rawPointer: `// RP2040: Registro SLEEP_EN0 / SLEEP_EN1 en el Controlador CLOCKS (0x400080A0)
// En el RP2040 tú decides exactamente qué dominios de reloj permanecen encendidos cuando
// ambos núcleos ejecutan la instrucción WFI:
#define CLOCKS_WAKE_EN0_REG  (*(volatile uint32_t *)0x400080A0UL)
#define CLOCKS_SLEEP_EN0_REG (*(volatile uint32_t *)0x400080ACUL)
#define CLOCKS_SLEEP_EN1_REG (*(volatile uint32_t *)0x400080B0UL)

void rp2040_sleep_only_rtc_alive(void) {
    // Apagar todos los relojes periféricos durante WFI excepto el reloj del RTC (Bit 25 de SLEEP_EN0):
    CLOCKS_SLEEP_EN0_REG = (1UL << 25);
    CLOCKS_SLEEP_EN1_REG = 0x00000000UL;
    __asm volatile ("wfi");
}`,
        cmsisStruct: `#include "hardware/structs/clocks.h"
#include "hardware/structs/scb.h"

void rp2040_enter_dormant_mode_ info(void) {
    // Además de SLEEP_EN, el RP2040 tiene el modo DORMANT en XOSC/ROSC que detiene
    // por completo los osciladores hasta que un pin GPIO reciba un flanco externo.
    scb_hw->scr |= M0PLUS_SCR_SLEEPDEEP_BITS;
}`,
        proDriver: `// En el RP2040, apagar los relojes de SRAM innecesarios y los buses USB/ADC en SLEEP_EN0/1
// reduce el consumo en sueño en más de un 90%.`,
        asmInsight: 'Los registros SLEEP_EN0 y SLEEP_EN1 actúan como máscaras automáticas de Clock Gating que solo se aplican mientras la CPU está en WFI/WFE.',
        hardwareNote: 'En un sistema Dual-Core como el RP2040, el chip entra en estado de sueño profundo cuando AMBOS núcleos (Core 0 y Core 1) están en WFI/WFE.'
      }
    },
    challenge: {
      question: 'Reto de Presupuesto Energético — ¿Por Qué la Batería Dura 15 Días en Lugar de 3 Años?',
      scenario:
        'Diseñas un nodo sensor alimentado por una pila de litio de 240 mAh. Tu firmware despierta cada 1 segundo, lee un sensor en 2 ms (consumiendo 10 mA) y vuelve a entrar en modo Deep-Sleep durante los otros 998 ms. Según el Datasheet, el microcontrolador en Deep-Sleep consume solo 2 µA, por lo que calculaste una corriente media de ~22 µA (~1,2 años de vida). Sin embargo, al medir la placa con un amperímetro en Deep-Sleep descubres que consume 680 µA continuos. ¿Cuál es la causa física más común en el código de configuración?',
      options: [
        {
          id: 'a',
          label: 'Dejaste varios pines GPIO sin usar configurados como Entrada Digital flotante (con el Schmitt Trigger a media tensión conduciendo corriente entre VCC y GND), o dejaste un pin con resistencia Pull-Up interna conectado a una señal externa en estado LOW (0V) tirando corriente continua por la resistencia de 40 kΩ.',
          isCorrect: true,
          feedback: '¡Exacto! Un solo pin con Pull-Up interna (40 kΩ a 3.3V) conectado a un dispositivo externo que está en 0V drena por Ley de Ohm: I = 3.3V / 40.000 Ω = 82,5 µA las 24 horas del día, y un pin digital flotante puede drenar más de 150 µA en su buffer de entrada. Antes de entrar en Deep-Sleep hay que auditar el estado de cada pin GPIO y apagar periféricos analógicos como el ADC.'
        },
        {
          id: 'b',
          label: 'La instrucción __WFI() aumenta la frecuencia del reloj de la CPU al doble.',
          isCorrect: false,
          feedback: '__WFI() detiene el reloj de la CPU (0 Hz).'
        },
        {
          id: 'c',
          label: 'Las variables declaradas como const en la memoria Flash consumen 600 µA cada una.',
          isCorrect: false,
          feedback: 'La memoria Flash es no volátil (transistores de puerta flotante) y no consume corriente por tener constantes grabadas.'
        }
      ]
    }
  },

  // =========================================================================
  // MÓDULO 17: SEGURIDAD HARDWARE (MPU, SECURE BOOT, SHA-256 Y TRNG)
  // =========================================================================
  {
    id: 17,
    slug: 'seguridad-hardware-mpu-aislamiento-secure-boot-sha256-trng',
    title: 'Módulo 17: Seguridad Hardware (MPU, Aislamiento de Memoria, Secure Boot y Criptografía)',
    subtitle: 'Cómo blindar la memoria RAM y los periféricos con la Unidad de Protección de Memoria (MPU), prevenir ejecución de código en la Pila (XN) y verificar firmas de firmware con SHA-256 / TRNG',
    level: 'Experto Industrial',
    duration: '120 min',
    recommendedLab: 'senior-rtos-can-pid-fault',
    superficialMyth:
      'Mucha gente cree que en un microcontrolador sin Linux (sin MMU virtual) cualquier función o tarea puede leer, escribir o ejecutar cualquier dirección de la RAM y de los periféricos sin que el hardware pueda impedirlo.',
    overwhelmingDatasheet:
      'Los manuales técnicos y la norma ECSS-Q-ST-80C hablan de "Memory Protection Unit (MPU->RBAR, MPU->RASR), Execute Never (XN Bit 28), Privileged vs Unprivileged Thread Mode (CONTROL Register), Spatial Partitioning, True Random Number Generator (TRNG), Constant-Time Comparison y ECDSA / SHA-256 Secure Boot".',
    theBridgeExplanation:
      'Aunque un microcontrolador no tenga memoria virtual (MMU), los chips modernos incluyen un guardián físico en el bus llamado MPU (Memory Protection Unit) —o PMP en RISC-V—. La MPU te permite definir hasta 8 o 16 "vallas electrónicas" (Regiones de Memoria) con permisos estrictos de Lectura/Escritura/Ejecución. Por ejemplo: puedes marcar la Pila (Stack) como "Execute Never (XN=1)" para que ningún ataque de Buffer Overflow pueda inyectar y ejecutar instrucciones desde la RAM; y puedes ejecutar una tarea de comunicaciones en modo No-Privilegiado dándole permiso únicamente a su propio array de RAM. Si esa tarea sufre un bug e intenta escribir en la RAM de la tarea de Propulsión o tocar el registro de un motor, ¡la MPU corta el acceso en el mismo ciclo de reloj y dispara una excepción MemManage_Handler antes de que el dato toque la memoria!',
    keyTakeaways: [
      {
        title: '1. La Unidad de Protección de Memoria (MPU) y el Bit Execute-Never (XN)',
        concept: 'En ARM Cortex-M, cada región de la MPU se configura con dos registros en 0xE000ED9C: MPU->RBAR (Base Address: dónde empieza la región) y MPU->RASR (Attribute and Size: tamaño potencia de 2, permisos de acceso AP[2:0] para modo Privilegiado/No-Privilegiado y el Bit 28 XN = Execute Never). Activar XN=1 en toda la región de SRAM (0x20000000) impide por hardware que la CPU pueda saltar a ejecutar código malicioso inyectado en un buffer de RAM.',
        codeSnippet: `// Configuración del registro MPU->RASR en ARM Cortex-M:\n// Bit 28 (XN=1: Prohibido ejecutar código aquí!), Bits [26:24] AP (Permisos R/W),\n// Bits [5:1] SIZE (Tamaño de la región = 2^(SIZE + 1)), Bit 0 (ENABLE=1):\n#define MPU_RASR_XN_BIT     (1UL << 28)\n#define MPU_RASR_AP_RW_PRIV (1UL << 24) // RW en Privilegiado, Prohibido en No-Privilegiado`
      },
      {
        title: '2. Comparación Criptográfica en Tiempo Constante (Defensa contra Side-Channel Timing Attack)',
        concept: 'Si verificas un Hash SHA-256, un MAC o una clave en un Bootloader usando memcmp() o un bucle que hace "if (a[i] != b[i]) return false;", la función tarda pocos nanosegundos si falla en el primer byte (i=0) y muchos más si acierta los primeros 15 bytes y falla en el byte 16. Un atacante con un osciloscopio o midiendo el tiempo de respuesta por UART puede adivinar la firma byte a byte en pocos minutos! La solución obligatoria es acumular el XOR de TODOS los bytes en tiempo constante sin ningún return temprano.',
        codeSnippet: `// Comparación de 32 bytes (Hash SHA-256 / HMAC) en TIEMPO CONSTANTE (0 saltos condicionales):\nbool crypto_constant_time_equal(const uint8_t *a, const uint8_t *b, uint32_t len) {\n    volatile uint8_t diff = 0U;\n    for (uint32_t i = 0UL; i < len; i++) {\n        diff |= (uint8_t)(a[i] ^ b[i]); // Acumula diferencias con XOR y OR en cada byte\n    }\n    return (diff == 0U); // ¡Tarda exactamente los mismos ciclos acierte 0 bytes o 31 bytes!\n}`
      },
      {
        title: '3. Generador de Números Aleatorios Verdaderos por Ruido Térmico (Hardware TRNG)',
        concept: 'La función rand() de la librería estándar de C es un generador pseudoaleatorio (PRNG): si arranca con la misma semilla, produce exactamente la misma secuencia en cada encendido (fatal para generar nonces o claves criptográficas). Los microcontroladores modernos integran un periférico TRNG (True Random Number Generator) que digitaliza el ruido térmico cuántico de osciladores en anillo o diodos internos para entregar entropía física real.',
        codeSnippet: `// Jamás uses rand() para seguridad; lee el registro de entropía física del periférico TRNG:\nuint32_t hw_trng_get_entropy_word(void);`
      }
    ],
    mcuCode: {
      atmega328p: {
        rawPointer: `// ATmega328P: Registro SPMCSR (0x57) y Bits de Bloqueo de Seguridad de Flash (Lock Bits)
// Aunque el AVR no tiene MPU de RAM, protege su firmware mediante los Lock Bits hardware
// (LB1, LB2, BLB0, BLB1) que bloquean la lectura externa de la Flash por el conector ISP
// e impiden que la aplicación pueda sobrescribir el sector del Bootloader:
#define SPMCSR_REG (*(volatile uint8_t *)0x57)

// Comparación de token de autenticación de 16 bytes en tiempo constante en AVR:
uint8_t avr_verify_token_constant_time(const uint8_t *rx_tok, const uint8_t *secret_tok) {
    volatile uint8_t diff = 0U;
    for (uint8_t i = 0U; i < 16U; i++) {
        diff |= (uint8_t)(rx_tok[i] ^ secret_tok[i]);
    }
    return (diff == 0U) ? 1U : 0U;
}`,
        cmsisStruct: `#include <avr/io.h>
#include <avr/boot.h>

// En producción se programan los Lock Bits a 0xFC (Modo 3) para impedir que alguien
// conecte un programador USBasp y extraiga tu binario .hex con avrdude:
// LOCKBITS = (LB_MODE_3 & BLB0_MODE_2 & BLB1_MODE_2);`,
        proDriver: `// Borrado Seguro de Claves en RAM (Zeroization): Si usas memset(key, 0, 16) al final de una función,
// el compilador con -O2 lo elimina porque la variable key ya no se vuelve a usar ("Dead Store Elimination").
// Usa siempre un puntero volatile para borrar claves criptográficas de la SRAM!`,
        asmInsight: 'La función avr_verify_token_constant_time ejecuta exactamente 16 iteraciones de LD + LD + EOR + OR sin ninguna rama intermedia.',
        hardwareNote: 'Una vez activados los Lock Bits LB1=0 y LB2=0 en el ATmega328P, la única forma de desbloquearlos es ejecutar un Chip Erase completo que destruye toda la Flash.'
      },
      stm32f401: {
        rawPointer: `// STM32F401 (Cortex-M4): Configuración de la MPU Hardware (0xE000ED90) para Blindar la SRAM
#define MPU_CTRL_REG (*(volatile uint32_t *)0xE000ED94UL)
#define MPU_RNR_REG  (*(volatile uint32_t *)0xE000ED98UL)
#define MPU_RBAR_REG (*(volatile uint32_t *)0xE000ED9CUL)
#define MPU_RASR_REG (*(volatile uint32_t *)0xE000EDA0UL)

void stm32_mpu_lock_sram_execute_never(void) {
    MPU_CTRL_REG = 0UL;             // 1. Deshabilitar MPU antes de configurar regiones
    MPU_RNR_REG  = 0UL;             // 2. Seleccionar Región 0
    MPU_RBAR_REG = 0x20000000UL;    // 3. Base de la SRAM (0x20000000)
    // 4. Bit 28 (XN=1: Prohibido ejecutar código en RAM!), AP=011 (RW), SIZE=16 (2^(16+1) = 128 KB), ENABLE=1:
    MPU_RASR_REG = (1UL << 28) | (3UL << 24) | (16UL << 1) | (1UL << 0);
    // 5. Habilitar MPU con PRIVDEFENA (Bit 2 = 1) y Enable (Bit 0 = 1):
    MPU_CTRL_REG = (1UL << 2) | (1UL << 0);
    __asm volatile ("dsb");
    __asm volatile ("isb");
}`,
        cmsisStruct: `#include "stm32f4xx.h"

// Creación de una "Guarda de Fondo de Pila" (Stack Guard Region) de 32 bytes Sin Acceso (AP=000):
// Si la pila crece demasiado y toca esos 32 bytes, la MPU dispara MemManage_Handler al instante!
void stm32_mpu_set_stack_guard_32bytes(uint32_t stack_bottom_aligned32) {
    MPU->RNR  = 1UL;
    MPU->RBAR = stack_bottom_aligned32;
    MPU->RASR = (1UL << 28) | (0UL << 24) /* AP=000 No Access! */ | (4UL << 1) /* 2^(4+1)=32B */ | 1UL;
}`,
        proDriver: `// Para cumplir con la cláusula ECSS-Q-ST-80C 6.2.2.10 (evitar que una tarea Categoría D corrompa
// a una tarea Categoría A en el mismo chip), FreeRTOS-MPU reconfigura las regiones de la MPU
// en cada cambio de contexto para que cada tarea solo pueda tocar su propia partición de SRAM.`,
        asmInsight: 'Tras escribir en MPU->CTRL es obligatorio ejecutar la pareja de barreras DSB + ISB para que el pipeline aplique los nuevos permisos desde la siguiente instrucción.',
        hardwareNote: 'La dirección base (RBAR) de cualquier región MPU en ARMv7-M debe estar alineada a un múltiplo exacto de su propio tamaño.'
      },
      esp32c3: {
        rawPointer: `// ESP32-C3 (RISC-V): PMP (Physical Memory Protection), TRNG (0x600260B0) y Acelerador SHA-256
// El ESP32-C3 incluye un Generador Físico de Números Aleatorios (TRNG) en 0x600260B0
// y hasta 16 regiones de protección de memoria física PMP en los registros CSR pmpcfg / pmpaddr!
#define RNG_DATA_REG (*(volatile uint32_t *)0x600260B0UL)

uint32_t esp32c3_hw_trng_read(void) {
    return RNG_DATA_REG; // Devuelve 32 bits de entropía física real!
}`,
        cmsisStruct: `// Además, el ESP32-C3 incluye aceleradores criptográficos hardware en silicio para
// SHA-256, AES-128/256, RSA y ECDSA Secure Boot v2, más cifrado transparente de Flash (XTS-AES):
#include <stdint.h>

// Borrado seguro de un buffer de clave en RAM impidiendo que el compilador optimice el bucle:
void esp32c3_secure_zeroize(void *secret_buf, uint32_t len) {
    volatile uint8_t *p = (volatile uint8_t *)secret_buf;
    while (len-- > 0UL) {
        *p++ = 0U;
    }
}`,
        proDriver: `// En el ESP32-C3, "Secure Boot v2" graba el hash de tu clave pública RSA-3072 / ECDSA en los
// eFuses de una sola escritura del silicio: el ROM Bootloader verifica la firma antes de arrancar.`,
        asmInsight: 'En RISC-V, la protección de memoria física (PMP) usa los registros CSR pmpcfg0..3 y pmpaddr0..15 con bits R, W, X y bloqueo permanente (L).',
        hardwareNote: 'Para que RNG_DATA_REG tenga máxima entropía física en el ESP32-C3, el oscilador RC de alta frecuencia o el ADC SAR deben estar encendidos.'
      },
      nrf52840: {
        rawPointer: `// nRF52840: Periférico TRNG Físico (NRF_RNG en 0x4000D000) y Unidad ACL de Protección de Flash
#define RNG_TASKS_START   (*(volatile uint32_t *)0x4000D000UL)
#define RNG_EVENTS_VALRDY (*(volatile uint32_t *)0x4000D100UL)
#define RNG_CONFIG_REG    (*(volatile uint32_t *)0x4000D504UL)
#define RNG_VALUE_REG     (*(volatile uint32_t *)0x4000D508UL)

uint8_t nrf_trng_get_random_byte(void) {
    RNG_CONFIG_REG    = 1UL; // Bit 0 (DERCEN=1): Activa corrección digital de sesgo (Bias Correction)
    RNG_EVENTS_VALRDY = 0UL;
    RNG_TASKS_START   = 1UL;
    while (RNG_EVENTS_VALRDY == 0UL) { }
    return (uint8_t)(RNG_VALUE_REG & 0xFFUL);
}`,
        cmsisStruct: `#include "nrf.h"

// El nRF52840 incorpora además el bloque periférico ACL (Access Control Lists) para bloquear
// la escritura/borrado del Bootloader en Flash y un coprocesador ARM CryptoCell-310 completo!
void nrf_acl_lock_bootloader_flash(uint32_t boot_addr, uint32_t boot_size) {
    NRF_ACL->ACL[0].ADDR = boot_addr;
    NRF_ACL->ACL[0].SIZE = boot_size;
    NRF_ACL->ACL[0].PERM = (1UL << 1); // Bit 1 (WRITE=1): Prohibido escribir o borrar esta región!
}`,
        proDriver: `// Una vez configurado un registro de la unidad ACL en el nRF52840, queda bloqueado en silicio
// y ni siquiera el código en modo Privilegiado puede desactivar esa protección hasta el próximo Reset.`,
        asmInsight: 'El coprocesador ARM CryptoCell-310 integrado en el nRF52840 ejecuta SHA-256, AES-CCM y firmas de curva elíptica Ed25519/ECDSA P-256 en hardware.',
        hardwareNote: 'Activa siempre el bit DERCEN (Digital Error Correction) en NRF_RNG->CONFIG para eliminar cualquier correlación estadística del ruido térmico.'
      },
      rp2040: {
        rawPointer: `// RP2040 (Cortex-M0+): MPU de 8 Regiones (0xE000ED90) y Entropía del Oscilador en Anillo (ROSC)
#define ROSC_RANDOMBIT_REG (*(volatile uint32_t *)0x4006001CUL)
#define M0PLUS_MPU_CTRL    (*(volatile uint32_t *)0xE000ED94UL)

uint32_t rp2040_rosc_collect_32_random_bits(void) {
    uint32_t rnd = 0UL;
    for (uint32_t i = 0UL; i < 32UL; i++) {
        rnd = (rnd << 1U) | (ROSC_RANDOMBIT_REG & 1UL);
    }
    return rnd;
}`,
        cmsisStruct: `#include "hardware/structs/mpu.h"

// Cada uno de los dos núcleos Cortex-M0+ del RP2040 tiene su propia MPU independiente de 8 regiones,
// permitiendo aislar completamente la memoria que puede tocar el Core 1 respecto al Core 0!
void rp2040_enable_core_mpu(void) {
    mpu_hw->ctrl = M0PLUS_MPU_CTRL_PRIVDEFENA_BITS | M0PLUS_MPU_CTRL_ENABLE_BITS;
}`,
        proDriver: `// Aislar el Core 1 con su propia MPU en el RP2040 permite ejecutar código de terceros o de
// menor criticidad en el segundo núcleo con la garantía física de que no puede corromper al Core 0.`,
        asmInsight: 'En Cortex-M0+ (ARMv6-M), el tamaño mínimo de región MPU es de 256 bytes (a diferencia de los 32 bytes de ARMv7-M).',
        hardwareNote: 'En el RP2040, si una instrucción viola la MPU de su núcleo, el procesador salta inmediatamente a HardFault_Handler.'
      }
    },
    challenge: {
      question: 'Reto de Ciberseguridad Embebida — Ataque de Canal Lateral por Tiempo (Timing Attack) y Stack Execution',
      scenario:
        'En el Bootloader de un dispositivo industrial recibes por UART una imagen de firmware junto con su código de autenticación HMAC-SHA256 de 32 bytes. Para comprobar si la firma es auténtica, tu compañero escribe: if (memcmp(hmac_recibido, hmac_calculado, 32) == 0) { actualizar_flash(); }. Además, el buffer donde se recibe el paquete vive en la pila (Stack en SRAM) sin la MPU activada. ¿Qué dos vulnerabilidades críticas de seguridad acaba de introducir?',
      options: [
        {
          id: 'a',
          label: '1) memcmp() se detiene en el primer byte que no coincide, permitiendo a un atacante medir con precisión de microsegundos cuánto tarda el Bootloader en rechazar el paquete y adivinar los 32 bytes del HMAC uno por uno (Timing Attack); y 2) Sin la MPU con el bit XN (Execute Never) en la SRAM, un desbordamiento del buffer en la pila permite saltar a ejecutar código malicioso directamente desde la RAM.',
          isCorrect: true,
          feedback: '¡Auditoría de seguridad de nivel experto! Toda comparación de hashes, MACs o contraseñas debe hacerse siempre con una función en tiempo constante (acumulando a[i] ^ b[i] en los 32 bytes sin salir antes), y la SRAM debe tener activo el bit 28 (XN = Execute Never) en el registro MPU->RASR.'
        },
        {
          id: 'b',
          label: 'memcmp() es 100% seguro contra ataques de tiempo porque examina los 32 bytes en paralelo en un microcontrolador.',
          isCorrect: false,
          feedback: 'memcmp() compara byte a byte (o palabra a palabra) y retorna en cuanto encuentra la primera discrepancia, filtrando cuántos bytes iniciales eran correctos.'
        },
        {
          id: 'c',
          label: 'Los procesadores ARM Cortex-M prohíben por defecto ejecutar instrucciones desde la SRAM (0x20000000) sin necesidad de configurar la MPU.',
          isCorrect: false,
          feedback: 'Por defecto la región SRAM (0x20000000) SI es ejecutable en Cortex-M; tienes que activar explícitamente el bit XN (Bit 28 de MPU->RASR) en la MPU para prohibirlo.'
        }
      ]
    }
  }
];
