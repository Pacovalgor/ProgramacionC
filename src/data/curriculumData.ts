import { MCUId } from './mcusData';

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
  | 'space-defense-ecss';

export interface ModuleCodeByMCU {
  rawPointer: string;
  cmsisStruct: string;
  proDriver: string;
  asmInsight: string;
  hardwareNote: string;
}

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

export interface CourseModule {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  level: 'Fundamentos' | 'Intermedio' | 'Avanzado' | 'Experto Industrial';
  duration: string;
  recommendedLab: LabViewType;
  superficialMyth: string;
  overwhelmingDatasheet: string;
  theBridgeExplanation: string;
  keyTakeaways: {
    title: string;
    concept: string;
    codeSnippet: string;
  }[];
  mcuCode: Record<MCUId, ModuleCodeByMCU>;
  challenge: ModuleChallenge;
}

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
        title: '2. Las 4 Jugadas Maestras de Bits (Bitwise Idioms)',
        concept: 'Nunca machaques un registro entero con "=" si solo quieres cambiar un pin, o apagarás otros periféricos que comparten ese registro. Usa máscaras con desplazamiento (1U << bit).',
        codeSnippet: `REG |=  (1U << 5);          // 1. ENCENDER bit 5 (Set)\nREG &= ~(1U << 5);          // 2. APAGAR bit 5 (Clear)\nREG ^=  (1U << 5);          // 3. INVERTIR bit 5 (Toggle)\nREG = (REG & ~(3U << 10)) | (2U << 10); // 4. Campo de 2 bits en pos 10`
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
  }
];
