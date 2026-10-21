/**
 * @file deepTheoryData.ts
 * @description Capítulos de Teoría Profunda estilo libro de texto de ingeniería (`DEEP_THEORY_BY_MODULE`).
 * Diseñados específicamente para su estudio detallado y transcripción en cuaderno físico de papel.
 *
 * Cada módulo (`0` a `11`) cuenta con múltiples capítulos técnicos que incluyen:
 * - Desarrollo teórico progresivo (`paragraphs`).
 * - Fórmulas matemáticas y leyes físicas/normativas destacadas (`formulas`).
 * - Tablas de referencia rápida para copiar al cuaderno (`table`).
 * - Problemas de ingeniería resueltos paso a paso con cálculos y código (`workedExample`).
 * - Errores críticos habituales en producción y cómo los evita un ingeniero Senior (`pitfalls`).
 */

/** Estructura de una tabla técnica comparativa o de referencia para el cuaderno. */
export interface TheoryTable {
  headers: string[];
  rows: string[][];
}

/** Caso práctico de ingeniería resuelto paso a paso (cálculo de registros, tiempos o márgenes). */
export interface WorkedExample {
  title: string;
  problemStatement: string;
  steps: string[];
  codeOrMath: string;
  conclusion: string;
}

/** Error típico de programación embebida, causa física del fallo y solución profesional. */
export interface PitfallItem {
  mistake: string;
  whyItFails: string;
  seniorFix: string;
}

/** Capítulo individual de teoría profunda asociado a un módulo del curso. */
export interface DeepTheoryChapter {
  /** Identificador único del capítulo (ej. `'m0-c1'`, `'m11-c4'`). */
  id: string;
  /** Numeración visible del capítulo (ej. `'Capítulo 11.4'`). */
  chapterNumber: string;
  /** Título técnico del capítulo. */
  title: string;
  /** Subtítulo explicativo del alcance del capítulo. */
  subtitle: string;
  /** Párrafos de desarrollo teórico. */
  paragraphs: string[];
  /** Fórmulas matemáticas o ecuaciones de diseño enmarcadas para el cuaderno físico. */
  formulas?: {
    name: string;
    expression: string;
    explanation: string;
  }[];
  /** Tabla de referencia opcional. */
  table?: TheoryTable;
  /** Problema de ingeniería resuelto paso a paso. */
  workedExample: WorkedExample;
  /** Lista de antipatrones/errores frecuentes y su corrección. */
  pitfalls: PitfallItem[];
}

/**
 * Mapa de capítulos de teoría profunda indexado por el `id` del módulo (`0` a `11`).
 * Política de mantenimiento: añadir siempre nuevos capítulos o apartados de forma incremental,
 * sin eliminar ni sobrescribir los capítulos existentes.
 */
export const DEEP_THEORY_BY_MODULE: Record<number, DeepTheoryChapter[]> = {
  // =========================================================================
  // MÓDULO 0: TEORÍA BASE DE C ORIENTADA A HARDWARE
  // =========================================================================
  0: [
    {
      id: 'm0-c1',
      chapterNumber: 'Capítulo 0.1',
      title: 'Representación de Datos en Memoria: Bits, Bytes, Complemento a Dos y Endianness',
      subtitle: 'Cómo se guardan realmente los números positivos, negativos y de 32 bits dentro de las celdas de SRAM',
      paragraphs: [
        'En el interior de un microcontrolador no existen números decimales ni letras: solo existen transistores que están apagados (0V -> Bit 0) o encendidos (3.3V/5V -> Bit 1). La unidad mínima direccionable en memoria es el Byte (8 bits). Cada byte tiene una dirección única consecutiva (0x20000000, 0x20000001, 0x20000002...).',
        'Para representar números negativos en tipos con signo (int8_t, int16_t, int32_t), todos los procesadores modernos utilizan el sistema de Complemento a Dos: el bit más a la izquierda (MSB) actúa como bit de signo (0 = positivo, 1 = negativo). Para obtener el negativo de un número en binario, se invierten todos sus bits (~) y se suma 1.',
        'Cuando una variable ocupa más de 1 byte (por ejemplo, un uint32_t de 4 bytes como 0x12345678), surge una pregunta física: ¿en qué orden se guardan esos 4 bytes en las 4 casillas de memoria consecutivas? Las arquitecturas ARM Cortex-M, RISC-V y AVR son Little-Endian (el byte menos significativo, 0x78, se guarda en la dirección más baja).'
      ],
      table: {
        headers: ['Tipo C (<stdint.h>)', 'Bits / Bytes', 'Rango Exacto de Valores', 'Uso Típico en Sistemas Embebidos'],
        rows: [
          ['uint8_t', '8 bits (1 Byte)', '0 a 255 (0x00 a 0xFF)', 'Registros de 8 bits (AVR), tramas UART/I2C/SPI, contadores cortos'],
          ['int8_t', '8 bits (1 Byte)', '-128 a +127', 'Temperaturas bajo cero pequeñas, desplazamientos relativos'],
          ['uint16_t', '16 bits (2 Bytes)', '0 a 65.535 (0x0000 a 0xFFFF)', 'Lecturas de ADC (10/12 bits), contadores de Timers de 16 bits'],
          ['int16_t', '16 bits (2 Bytes)', '-32.768 a +32.767', 'Acelerómetros IMU, muestras de audio, errores de control PID'],
          ['uint32_t', '32 bits (4 Bytes)', '0 a 4.294.967.295 (0x00000000 a 0xFFFFFFFF)', 'Registros de 32 bits (ARM/RISC-V), direcciones de memoria, ticks de tiempo']
        ]
      },
      workedExample: {
        title: 'Ejemplo Resuelto: ¿Cómo se guarda 0x12345678 en RAM Little-Endian y cómo funciona el Complemento a Dos?',
        problemStatement:
          'Declaras uint32_t firma = 0x12345678UL; en la dirección 0x20000000 de un STM32 o ESP32, y declaras int8_t temp = -5; Calcula qué valor hexadecimal hay en cada byte de la RAM.',
        steps: [
          '1. Dividimos 0x12345678 en sus 4 bytes individuales: Byte MSB = 0x12, luego 0x34, luego 0x56, y Byte LSB (menos significativo) = 0x78.',
          '2. En arquitectura Little-Endian ("el pequeño va primero"), el byte LSB (0x78) se coloca en la primera dirección (0x20000000) y el MSB (0x12) en la última (0x20000003).',
          '3. Para int8_t temp = -5: tomamos el +5 en binario de 8 bits (0b00000101), invertimos todos sus bits (0b11111010) y sumamos +1 -> 0b11111011, que en hexadecimal es 0xFB.'
        ],
        codeOrMath: `Dirección 0x20000000 -> 0x78 (LSB)\nDirección 0x20000001 -> 0x56\nDirección 0x20000002 -> 0x34\nDirección 0x20000003 -> 0x12 (MSB)\n\nint8_t temp = -5; // En memoria se guarda el byte 0xFB (0b11111011)`,
        conclusion:
          'Si envías un uint32_t byte a byte por UART haciendo un puntero (uint8_t *)&firma, el primer byte que saldrá por el cable será 0x78 por ser Little-Endian.'
      },
      pitfalls: [
        {
          mistake: 'Usar uint8_t en un bucle for (uint8_t i = 0; i < 300; i++)',
          whyItFails:
            'Como un uint8_t solo llega hasta 255, al sumar 255 + 1 sufre un desbordamiento (overflow) y vuelve a 0. ¡La condición i < 300 será verdadera para siempre y tendrás un bucle infinito!',
          seniorFix: 'Comprueba siempre el valor máximo del contador; si supera 255 usa uint16_t o uint32_t.'
        },
        {
          mistake: 'Restar dos tiempos con signo o usar int para contadores',
          whyItFails: 'El desbordamiento de enteros con signo (int) es Comportamiento Indefinido (Undefined Behavior) en C.',
          seniorFix: 'Usa siempre tipos sin signo (uint32_t) para contadores, máscaras de bits y marcas de tiempo.'
        }
      ]
    },
    {
      id: 'm0-c2',
      chapterNumber: 'Capítulo 0.2',
      title: 'El Preprocesador de C: #define, Macros Parametrizadas Seguras y Header Guards',
      subtitle: 'Cómo se transforma tu texto antes de compilar y cómo organizar archivos .h y .c como un profesional',
      paragraphs: [
        'Antes de que el compilador traduzca tu código C a ensamblador, entra en acción el Preprocesador. Todas las líneas que empiezan por almohadilla (#include, #define, #ifdef, #ifndef) son órdenes de reemplazo de texto puro que no gastan ni un solo byte de memoria RAM ni Flash.',
        'En sistemas embebidos usamos #define para dar nombres legibles a direcciones físicas de registros, posiciones de bits y constantes matemáticas. Además, las macros con parámetros permiten crear pequeñas operaciones en línea (como BIT_SET o MIN/MAX), pero exigen rodear cada parámetro entre paréntesis para evitar errores graves de prioridad de operadores.',
        'Cuando divides un proyecto real en varios archivos (ej. main.c, hal_gpio.c, hal_gpio.h), todo archivo de cabecera (.h) debe protegerse con "Header Guards" (#ifndef ... #define ... #endif) para evitar que el compilador dé error de "símbolo duplicado" si se incluye dos veces.'
      ],
      table: {
        headers: ['Directiva', 'Qué hace en el Preprocesador', 'Ejemplo Correcto en Firmware'],
        rows: [
          ['#define CONSTANTE', 'Sustitución textual directa antes de compilar', '#define F_CPU_HZ (84000000UL)'],
          ['#define MACRO(x)', 'Macro parametrizada (exige paréntesis en cada argumento)', '#define BIT(n) (1UL << (n))'],
          ['#ifndef / #define / #endif', 'Header Guard: evita incluir el mismo archivo .h dos veces', '#ifndef HAL_GPIO_H ... #endif'],
          ['#ifdef / #else / #endif', 'Compilación condicional según el chip o modo Debug', '#ifdef TARGET_STM32F4 ... #endif']
        ]
      },
      workedExample: {
        title: 'Ejemplo Resuelto: El Bug Clásico de una Macro sin Paréntesis',
        problemStatement:
          'Un programador escribe #define DOBLE(x) x * 2 y otro escribe #define MASCARA_BIT(n) 1UL << n. ¿Qué desastre ocurre cuando llaman a 10 / DOBLE(2 + 3) o a MASCARA_BIT(1 + 2)?',
        steps: [
          '1. El preprocesador NO calcula nada; solo pega texto. En DOBLE(2 + 3) pega literalmente: 10 / 2 + 3 * 2.',
          '2. Por jerarquía matemática, primero se hace la división (10/2 = 5) y la multiplicación (3*2 = 6), dando 5 + 6 = 11 (¡cuando esperabas 10 / 10 = 1!).',
          '3. Para blindar una macro, se pone paréntesis alrededor de CADA parámetro (x) y alrededor de TODA la expresión: #define DOBLE(x) ((x) * 2).'
        ],
        codeOrMath: `// ❌ MACRO PELIGROSA:\n#define BIT_BAD(n)   1UL << n\n\n// ✅ MACRO INDUSTRIAL BLINDADA:\n#define BIT_SAFE(n)  (1UL << (n))\n#define SET_BIT(r,b) ((r) |= (1UL << (b)))`,
        conclusion:
          'En tu cuaderno anota esta ley: en todo #define con operaciones o parámetros, pon paréntesis a cada variable y al conjunto completo.'
      },
      pitfalls: [
        {
          mistake: 'Poner punto y coma (;) al final de un #define: #define PIN_LED 5;',
          whyItFails:
            'Al usar (1UL << PIN_LED), el preprocesador lo reemplaza por (1UL << 5;), provocando un error de sintaxis incomprensible.',
          seniorFix: 'Las directivas #define jamás llevan punto y coma al final.'
        },
        {
          mistake: 'Definir variables globales con memoria dentro de un archivo .h sin "extern"',
          whyItFails:
            'Si incluyes ese .h en tres archivos .c, el Linker creará 3 variables con el mismo nombre y fallará con "multiple definition of...".',
          seniorFix: 'En el .h solo se declara el prototipo (extern uint32_t ticks;) y la variable real se define en un único archivo .c.'
        }
      ]
    },
    {
      id: 'm0-c3',
      chapterNumber: 'Capítulo 0.3',
      title: 'Punteros a Fondo, Aritmética de Direcciones y Funciones en Sistemas Embebidos',
      subtitle: 'Desmitificando *, &, punteros void*, arrays y cómo viajan los parámetros en los registros de la CPU',
      paragraphs: [
        'Un puntero no tiene ningún misterio cuando lo ves a nivel de hardware: es simplemente una variable que guarda un número de dirección de memoria. La única diferencia entre un uint8_t *p1 y un uint32_t *p2 es cuántos bytes lee el procesador cuando usas el asterisco (*p1 lee 1 byte; *p2 lee 4 bytes consecutivos) y cuántos bytes avanza al sumar +1.',
        'En C, los arrays y los punteros están íntimamente ligados: cuando declaras uint16_t muestras[8]; el identificador "muestras" equivale a la dirección del primer elemento (&muestras[0]). Escribir muestras[3] es exactamente lo mismo para el compilador que escribir *(muestras + 3).',
        'Cuando llamas a una función en arquitecturas modernas (ARM AAPCS o RISC-V), los primeros 4 argumentos se pasan ultrarrápido dentro de los registros internos de la CPU (R0, R1, R2 y R3 en ARM; a0..a3 en RISC-V) y el valor de retorno vuelve en R0. Por eso pasar un puntero a una estructura cuesta solo 1 ciclo de reloj.'
      ],
      table: {
        headers: ['Expresión en C', 'Cómo se lee en Español', 'Qué hace en la Memoria RAM'],
        rows: [
          ['uint32_t x = 50;', 'Entero de 32 bits llamado x con valor 50', 'Reserva 4 bytes en RAM (ej. 0x20000000) y guarda 50'],
          ['uint32_t *p = &x;', 'Puntero p inicializado con la dirección de x', 'Guarda el número 0x20000000 dentro de la variable p'],
          ['*p = 99;', 'Al contenido apuntado por p asígnale 99', 'Viaja a la dirección 0x20000000 y sobrescribe el 50 por un 99'],
          ['p = p + 1;', 'Avanza el puntero p al siguiente elemento', 'Suma sizeof(uint32_t) = 4 bytes a la dirección (pasa a 0x20000004)']
        ]
      },
      workedExample: {
        title: 'Ejemplo Resuelto: Aritmética de Punteros sobre un Buffer en RAM',
        problemStatement:
          'Tienes un array uint16_t adc_buf[4] = { 100, 200, 300, 400 }; que empieza en la dirección 0x20000100, y declaras uint16_t *ptr = adc_buf; ¿A qué dirección apunta (ptr + 2) y qué devuelve *(ptr + 2)?',
        steps: [
          '1. Como ptr es de tipo uint16_t* (cada elemento ocupa 2 bytes), sumar +1 a ptr avanza 2 bytes en memoria.',
          '2. Por tanto, (ptr + 2) calcula la dirección: 0x20000100 + (2 * 2 bytes) = 0x20000104.',
          '3. Al aplicar el asterisco *(ptr + 2), leemos los 2 bytes almacenados en 0x20000104, que corresponden a adc_buf[2] = 300.'
        ],
        codeOrMath: `ptr       -> 0x20000100  (*ptr       == 100)\nptr + 1   -> 0x20000102  (*(ptr + 1) == 200)\nptr + 2   -> 0x20000104  (*(ptr + 2) == 300)\nptr + 3   -> 0x20000106  (*(ptr + 3) == 400)`,
        conclusion:
          'Sumar K a cualquier puntero tipo T* multiplica automáticamente K * sizeof(T) bytes en la dirección física.'
      },
      pitfalls: [
        {
          mistake: 'Desreferenciar un puntero sin inicializar (Wild Pointer) o NULL (0x00000000)',
          whyItFails:
            'Si declaras uint32_t *p; sin darle dirección y haces *p = 10;, escribirás en una dirección basura aleatoria o dispararás una excepción HardFault en el procesador.',
          seniorFix: 'Inicializa siempre tus punteros a NULL ((void *)0) o a una dirección válida y verifica if (p != NULL) en los drivers.'
        }
      ]
    },
    {
      id: 'm0-c4',
      chapterNumber: 'Capítulo 0.4',
      title: 'Estructuras (struct), Alineación en Memoria (Padding), Uniones y el Operador Flecha (->)',
      subtitle: 'Cómo diseña un ingeniero senior los tipos de datos compuestos para registros y protocolos de comunicación',
      paragraphs: [
        'Una estructura (struct) permite agrupar varias variables relacionadas bajo un solo bloque de memoria. En sistemas embebidos tiene dos usos vitales: 1) Mapear los registros consecutivos de un periférico de hardware (como GPIO_TypeDef), y 2) Empaquetar mensajes de sensores o tramas de comunicación.',
        'Existe un detalle físico de suma importancia llamado Alineación de Memoria (Memory Alignment): un procesador de 32 bits lee palabras de 32 bits (4 bytes) mucho más rápido si su dirección es múltiplo de 4 (terminada en 0, 4, 8 o C). Por eso, si pones un uint8_t (1 byte) seguido de un uint32_t (4 bytes) dentro de un struct, el compilador insertará silenciosamente 3 bytes vacíos en medio (Padding) para que el uint32_t caiga en una dirección múltiplo de 4.',
        'Una unión (union), a diferencia de un struct, coloca a todos sus miembros empezando en la MISMA dirección de memoria (el tamaño total de la union es el de su miembro más grande). Esto es utilísimo para ver un mismo registro como un entero de 32 bits completo o desglosado en sus bytes/bits.'
      ],
      table: {
        headers: ['Construcción C', 'Disposición en Memoria', 'Tamaño Total (sizeof)', 'Cómo se accede'],
        rows: [
          ['struct MalOrdenado { uint8_t a; uint32_t b; uint8_t c; }', '1B (a) + 3B hueco + 4B (b) + 1B (c) + 3B hueco', '12 Bytes (¡6 bytes desperdiciados!)', 's.a / ptr->a'],
          ['struct BienOrdenado { uint32_t b; uint8_t a; uint8_t c; }', '4B (b) + 1B (a) + 1B (c) + 2B hueco final', '8 Bytes (Óptimo y alineado)', 's.b / ptr->b'],
          ['union Dual32 { uint32_t word; uint8_t bytes[4]; }', 'Ambos comparten los mismos 4 bytes', '4 Bytes exactos', 'u.word o u.bytes[0]']
        ]
      },
      workedExample: {
        title: 'Ejemplo Resuelto: Cómo ahorra RAM ordenar los miembros de un struct de mayor a menor',
        problemStatement:
          'Necesitas guardar en un array en SRAM 100 muestras de telemetría. Cada muestra tiene un uint8_t id, un uint32_t timestamp y un uint8_t estado. Compara cuánta RAM gastan según el orden de los campos.',
        steps: [
          '1. Si los pones en el orden { uint8_t id; uint32_t timestamp; uint8_t estado; }, el compilador inserta 3 bytes de padding tras id y 3 bytes tras estado -> sizeof = 12 bytes * 100 = 1.200 bytes de RAM.',
          '2. Si pones primero el de 32 bits: { uint32_t timestamp; uint8_t id; uint8_t estado; }, ocupan 4 + 1 + 1 = 6 bytes (+ 2 de alineación final = 8 bytes) -> 800 bytes de RAM (¡400 bytes ahorrados gratis!).'
        ],
        codeOrMath: `// Regla de diseño de structs en C Embebido:\n// Coloca siempre primero los uint64_t / uint32_t, luego los uint16_t y al final los uint8_t.`,
        conclusion:
          'Nunca asumas que sizeof(struct) es la suma simple de sus campos sin tener en cuenta la alineación de 4 bytes.'
      },
      pitfalls: [
        {
          mistake: 'Enviar un struct con padding directamente por UART/SPI usando sizeof(mi_struct)',
          whyItFails: 'Estarás enviando por el cable bytes ocultos de relleno (padding) que el otro dispositivo no espera.',
          seniorFix: 'Serializa byte a byte en un buffer uint8_t o usa __attribute__((packed)) en structs de protocolo de red.'
        }
      ]
    }
  ],

  // =========================================================================
  // MÓDULO 1: C PARA HARDWARE — MANIPULACIÓN DE BITS Y PUNTEROS MMIO
  // =========================================================================
  1: [
    {
      id: 'm1-c1',
      chapterNumber: 'Capítulo 1.1',
      title: 'Álgebra Booleana a Nivel de Bits vs Operadores Lógicos',
      subtitle: 'Por qué confundir & con && o | con || es uno de los errores más frecuentes al empezar en embebidos',
      paragraphs: [
        'En el lenguaje C existen dos familias de operadores que se parecen visualmente pero hacen cosas radicalmente distintas en la ALU del procesador: los Operadores Lógicos (&&, ||, !) y los Operadores a Nivel de Bits (&, |, ^, ~, <<, >>).',
        'Los operadores lógicos (&&, ||, !) tratan a todo el número como un único valor de verdad ("Cero es Falso, cualquier otra cosa es Verdadero = 1"). Por ejemplo, (0xF0 && 0x0F) devuelve simplemente 1, y (!0x05) devuelve 0.',
        'Por el contrario, los operadores a nivel de bits (&, |, ^, ~) operan columna por columna sobre los 8, 16 o 32 bits en paralelo de manera independiente. Así, (0xF0 & 0x0F) compara cada bit con su pareja y devuelve 0x00, mientras que (~0x00) invierte los 32 ceros convirtiéndolos en 0xFFFFFFFF.'
      ],
      table: {
        headers: ['Operador Bitwise', 'Símbolo', 'Regla Bit a Bit', 'Para qué se usa en Registros de Hardware'],
        rows: [
          ['AND Bit a Bit', '&', 'Solo da 1 si AMBOS bits son 1', 'Apagar bits (con ~máscara) y leer/comprobar el estado de un bit'],
          ['OR Inclusivo', '|', 'Da 1 si CUALQUIERA de los bits es 1', 'Encender (poner a 1) bits específicos sin borrar los demás'],
          ['XOR Exclusivo', '^', 'Da 1 si los bits son DISTINTOS', 'Invertir (conmutar / toggle) el estado de un pin o calcular checksums'],
          ['NOT (Complemento a 1)', '~', 'Invierte todos los bits (0->1 y 1->0)', 'Crear máscaras de borrado: ~(1UL << 5) pone un 0 solo en el bit 5'],
          ['Shift Left / Right', '<< / >>', 'Desplaza los bits multiplicando o dividiendo por 2^n', 'Posicionar una máscara o un valor en el bit exacto del registro']
        ]
      },
      workedExample: {
        title: 'Ejemplo Resuelto: Modificación Quirúrgica de un Campo de 3 Bits en un Registro',
        problemStatement:
          'El registro SPI_CR1 (16 bits) vale actualmente 0x0034 (0b0000_0000_0011_0100). Los bits [5:3] definen el divisor de reloj BR[2:0] (actualmente valen 110 = 6). Quieres cambiar BR[2:0] al valor 011 (3) sin alterar el bit 2 ni ningún otro bit.',
        steps: [
          '1. Identificamos el ancho del campo: son 3 bits, cuya máscara llena de unos es 0b111 = 7 (o 0x7U).',
          '2. Desplazamos la máscara a la posición inicial del campo (bit 3): (7U << 3) = 0b0011_1000 (0x38).',
          '3. Invertimos la máscara para crear el "molde de borrado": ~(7U << 3) = 0xFFC7. Al hacer 0x0034 & 0xFFC7 obtenemos 0x0004 (¡los bits 5:3 quedaron limpios en 000 y el bit 2 sigue intacto en 1!).',
          '4. Ahora insertamos el nuevo valor 3 (0b011) desplazado a la posición 3: 0x0004 | (3U << 3) = 0x0004 | 0x0018 = 0x001C.'
        ],
        codeOrMath: `SPI1->CR1 = (SPI1->CR1 & ~(7U << 3)) | (3U << 3);\n// Antes:   0b00000000_00110_100 (0x0034 -> BR=6, Bit2=1)\n// Después: 0b00000000_00011_100 (0x001C -> BR=3, Bit2=1)`,
        conclusion:
          'El patrón REG = (REG & ~(MASK << POS)) | (VAL << POS) funciona para cualquier campo de cualquier registro en cualquier microcontrolador.'
      },
      pitfalls: [
        {
          mistake: 'Usar ! en lugar de ~ para borrar un bit: REG &= !(1U << 5);',
          whyItFails:
            'Como (1U << 5) es distinto de cero, el negador lógico !(1U << 5) vale exactamente 0x00000000. Al hacer REG &= 0, ¡acabas de borrar todo el registro a cero!',
          seniorFix: 'Para invertir bits usa siempre la virgulilla (~): REG &= ~(1UL << 5);'
        },
        {
          mistake: 'Escribir (1 << 31) sin el sufijo UL en una expresión de 32 bits',
          whyItFails:
            'El literal "1" a secas es de tipo int con signo. Desplazar un 1 hasta el bit de signo (bit 31) provoca desbordamiento con signo (Undefined Behavior).',
          seniorFix: 'Acostúmbrate a escribir siempre (1UL << n) o (1U << n).'
        }
      ]
    },
    {
      id: 'm1-c2',
      chapterNumber: 'Capítulo 1.2',
      title: 'Construcción de Headers de Hardware desde Cero (Cómo nace CMSIS)',
      subtitle: 'De una tabla de direcciones en PDF a una librería de estructuras y punteros lista para producción',
      paragraphs: [
        'Cuando un fabricante como ST, Nordic o Espressif diseña un chip, publica en el Reference Manual la "Dirección Base" de cada periférico (por ejemplo, GPIOA empieza en 0x40020000, GPIOB en 0x40020400) y el "Offset" (desplazamiento en bytes) de cada uno de sus registros internos.',
        'En lugar de definir cien macros sueltas para cada registro de cada puerto, los ingenieros crean una única estructura C (struct) cuyos campos uint32_t siguen el mismo orden que la tabla de offsets del manual. Después, basta con convertir la dirección base de cada puerto en un puntero a esa estructura.',
        'Además, qué calificadores se ponen a cada campo del struct depende de los permisos del registro en el Datasheet: en CMSIS verás __IO (que es un #define de volatile para registros R/W), __I (que es volatile const para registros de solo lectura como IDR) y __O (volatile para registros de solo escritura como BSRR).'
      ],
      table: {
        headers: ['Macro CMSIS', 'Definición Real en C', 'Cuándo se usa en el struct del Periférico'],
        rows: [
          ['__IO', 'volatile', 'Registros de Lectura y Escritura (MODER, ODR, CR1)'],
          ['__I', 'volatile const', 'Registros de Solo Lectura (IDR, SR): el compilador da error si intentas escribir en ellos, pero sabe que cambian solos'],
          ['__O', 'volatile', 'Registros de Solo Escritura (BSRR, W1TS)']
        ]
      },
      workedExample: {
        title: 'Ejemplo Resuelto: Crear tu propio mini-CMSIS para un Periférico con Huecos Reservados',
        problemStatement:
          'Un periférico Timer empieza en la dirección base 0x40001000. Su registro CTRL está en el offset +0x00, su registro COUNT está en +0x04, pero su registro COMPARE salta hasta el offset +0x10 (hay 8 bytes reservados sin usar entre +0x08 y +0x0F). ¿Cómo escribes el struct en C?',
        steps: [
          '1. CTRL ocupa +0x00..+0x03 (1 uint32_t). COUNT ocupa +0x04..+0x07 (1 uint32_t).',
          '2. Entre +0x08 y +0x10 hay 8 bytes de diferencia, lo que equivale exactamente a dos enteros uint32_t (2 * 4 = 8 bytes).',
          '3. Insertamos uint32_t RESERVED[2]; para rellenar esos 8 bytes y que COMPARE caiga exactamente en el offset +0x10.'
        ],
        codeOrMath: `typedef struct {\n    volatile uint32_t CTRL;        // Offset +0x00 (0x40001000)\n    volatile uint32_t COUNT;       // Offset +0x04 (0x40001004)\n    uint32_t          RESERVED[2]; // Offset +0x08 y +0x0C (8 bytes de hueco)\n    volatile uint32_t COMPARE;     // Offset +0x10 (0x40001010 ¡Exacto!)\n} MiTimer_TypeDef;\n\n#define TIMER0 ((MiTimer_TypeDef *)0x40001000UL)`,
        conclusion:
          'Si olvidas poner el array RESERVED[2], el campo COMPARE apuntaría por error a +0x08 en lugar de +0x10.'
      },
      pitfalls: [
        {
          mistake: 'Usar bitfields de C (struct { uint32_t bit0:1; }) sobre registros que exigen acceso de 32 bits',
          whyItFails:
            'El estándar C no garantiza en qué orden empaqueta los bitfields ni qué instrucción máquina (8, 16 o 32 bits) usará el compilador para escribirlos, lo cual falla en muchos buses periféricos.',
          seniorFix: 'Usa registros uint32_t explícitos y máscaras de bits desplazadas, que son 100% deterministas y portables.'
        }
      ]
    }
  ],

  // =========================================================================
  // MÓDULO 2: ARQUITECTURA DEL CHIP, MAPA DE MEMORIA Y RELOJES (RCC)
  // =========================================================================
  2: [
    {
      id: 'm2-c1',
      chapterNumber: 'Capítulo 2.1',
      title: 'El Proceso de Compilación, el Linker Script (.ld) y el Código de Arranque (Reset_Handler)',
      subtitle: 'Qué ocurre desde que pulsas "Compilar" hasta el instante exacto en que se ejecuta la primera línea de main()',
      paragraphs: [
        'Muchos cursos te hacen creer que el microcontrolador empieza ejecutando la función main(). En realidad, cuando conectas la alimentación o sueltas el pin de Reset, el hardware del núcleo ARM Cortex-M hace dos cosas automáticas en los primeros dos ciclos de reloj: 1) Lee los primeros 4 bytes de la memoria Flash (0x08000000) y los carga en el puntero de pila (MSP - Main Stack Pointer), y 2) Lee los siguientes 4 bytes (0x08000004), donde está la dirección de la función Reset_Handler, y salta a ella.',
        '¿Qué hace el Reset_Handler antes de llamar a tu main()? Como la memoria SRAM empieza llena de valores aleatorios (basura eléctrica) al encender el chip, el Reset_Handler ejecuta dos pequeños bucles: primero copia los valores iniciales de tus variables globales con valor (sección .data) desde la Flash hacia la SRAM, y segundo llena de ceros (0x00) toda la zona de variables globales no inicializadas (sección .bss). ¡Solo entonces llama a main()!',
        '¿Y quién decide en qué dirección empieza la Flash y la SRAM de cada microcontrolador? El archivo Linker Script (.ld), que actúa como el plano arquitectónico que le dice al enlazador dónde colocar cada sección.'
      ],
      table: {
        headers: ['Sección ELF', 'Dónde se Almacena', 'Qué Variables o Código Contiene', 'Quién la Inicializa'],
        rows: [
          ['.isr_vector', 'Inicio de Flash (0x08000000)', 'Puntero inicial del Stack + Direcciones de todas las ISR y Reset_Handler', 'Grabado con el programador ST-Link / J-Link'],
          ['.text', 'Flash', 'Todas las instrucciones máquina compiladas de tus funciones C', 'Grabado en Flash'],
          ['.rodata', 'Flash', 'Constantes declaradas con "const" y cadenas de texto literales', 'Grabado en Flash (¡0 bytes de gasto en RAM!)'],
          ['.data', 'Flash (copia) + SRAM (ejecución)', 'Variables globales/static con valor inicial distinto de 0 (ej. int x = 5;)', 'El Reset_Handler la copia de Flash a SRAM al arrancar'],
          ['.bss', 'SRAM', 'Variables globales/static inicializadas a 0 o sin valor inicial', 'El Reset_Handler la pone a 0 al arrancar'],
          ['Stack (Pila)', 'Final de SRAM (crece hacia abajo)', 'Variables locales de funciones, parámetros y registros salvados en ISR', 'Gestionado dinámicamente por el registro SP']
        ]
      },
      workedExample: {
        title: 'Ejemplo Resuelto: Auditoría de Consumo de Memoria Flash y RAM',
        problemStatement:
          'En un microcontrolador con solo 2 KB de RAM (2048 bytes) declaras: uint8_t imagen_logo[1500] = { 0xFF, 0x81, ... }; que nunca se modifica durante el programa. ¿Por qué es un grave error y cómo se corrige con una sola palabra?',
        steps: [
          '1. Sin la palabra "const", el compilador asume que imagen_logo puede modificarse en tiempo de ejecución, por lo que la mete en la sección .data.',
          '2. Al estar en .data, ocupa 1.500 bytes en la memoria Flash (para recordar los valores iniciales) Y ADEMÁS el Reset_Handler la copia a la memoria SRAM ocupando 1.500 de tus 2.048 bytes disponibles.',
          '3. Al añadir "const uint8_t imagen_logo[1500]", pasa a la sección .rodata: vive únicamente en Flash y gasta 0 bytes de SRAM.'
        ],
        codeOrMath: `// ❌ Gasta 1500 bytes de Flash + 1500 bytes de RAM (.data):\nuint8_t imagen_logo[1500] = { 0xFF, 0x81 };\n\n// ✅ Gasta 1500 bytes de Flash + 0 bytes de RAM (.rodata):\nconst uint8_t imagen_logo[1500] = { 0xFF, 0x81 };`,
        conclusion:
          'Poner "const" a todas las tablas de consulta, fuentes tipográficas y estructuras de configuración es la optimización de RAM más importante en embebidos.'
        },
      pitfalls: [
        {
          mistake: 'Declarar un array local enorme dentro de una función: void f(void) { uint8_t buf[4096]; }',
          whyItFails:
            'Las variables locales sin static se reservan en el Stack (Pila). Si el Stack configurado en el Linker Script es de 2 KB, reservar 4 KB de golpe provoca un Stack Overflow que machaca la sección .bss/.data contigua.',
          seniorFix: 'Los buffers grandes deben ser globales/static (para que el Linker avise al compilar si no caben en RAM) y dimensionados con cuidado.'
        }
      ]
    },
    {
      id: 'm2-c2',
      chapterNumber: 'Capítulo 2.2',
      title: 'Árbol de Relojes (Clock Tree), PLL y Puertas de Reloj (Clock Gating)',
      subtitle: 'De dónde sale el pulso que mueve al procesador y por qué existen distintos buses de velocidad (AHB, APB1, APB2)',
      paragraphs: [
        'Todo microcontrolador necesita un "metrónomo" (una señal cuadrada de reloj) para dar cada paso. Al encenderse, la mayoría de los chips arrancan usando un oscilador RC interno (llamado HSI en STM32) porque arranca en pocos microsegundos, aunque tiene una imprecisión del ±1%. Para comunicaciones exactas como USB o Ethernet, el código conmuta a un cristal de cuarzo externo de alta precisión (HSE, típicamente de 8, 16 o 25 MHz).',
        '¿Cómo consigue un procesador correr a 84 MHz o 160 MHz si el cristal externo es de solo 8 MHz? Gracias al bloque PLL (Phase-Locked Loop): un multiplicador de frecuencia electrónico configurable por registros que multiplica la frecuencia del cristal.',
        'Finalmente, la señal de reloj se reparte por la Matriz de Buses mediante divisores (Prescalers): el núcleo y los puertos GPIO reciben la máxima velocidad en el bus AHB (HCLK), mientras que los periféricos lentos reciben un reloj dividido en los buses APB1 y APB2, pasando por su respectiva puerta de reloj (Clock Gate en RCC).'
      ],
      table: {
        headers: ['Sigla del Reloj', 'Nombre Completo', 'Características y Uso en la Industria'],
        rows: [
          ['HSI / HFINT', 'High-Speed Internal RC', 'Oscilador interno gratuito (ej. 16 MHz). Arranca al instante pero varía ligeramente con la temperatura'],
          ['HSE / HFXO', 'High-Speed External Crystal', 'Cristal de cuarzo externo (ej. 8–32 MHz). Altísima precisión (±10 ppm), imprescindible para USB y Radio BLE'],
          ['LSE / LFXO', 'Low-Speed External (32.768 kHz)', 'Cristal de reloj de pulsera: consume menos de 1 microamperio y mantiene la hora (RTC) en modo sueño'],
          ['PLL', 'Phase-Locked Loop', 'Multiplica la frecuencia de HSI o HSE para alcanzar la velocidad máxima de la CPU (84 MHz, 160 MHz, etc.)']
        ]
      },
      workedExample: {
        title: 'Ejemplo Resuelto: Por qué el Cristal de Bajo Consumo mide exactamente 32.768 Hz',
        problemStatement:
          'En todos los Datasheets del mundo verás que el cristal del reloj en tiempo real (RTC) tiene una frecuencia aparentemente extraña: 32.768 Hz (32,768 kHz). ¿Por qué se eligió ese número exacto?',
        steps: [
          '1. Calcula cuánto es 2 elevado a 15 (2^15): 2^10 es 1.024, y 1.024 * 32 = ¡32.768!',
          '2. Eso significa que si metes una señal de 32.768 Hz en un contador binario simple de 15 bits (Prescaler = 32767), el bit 15 se desbordará exactamente 1 vez cada 1,000000 segundos.'
        ],
        codeOrMath: `32.768 Hz = 2^15 pulsos por segundo\n32.768 / 2^15 = 1 Hz exacto (1 segundo para el reloj RTC con hardware mínimo)`,
        conclusion:
          'En ingeniería de hardware ningún número es casualidad: 32.768 Hz permite contar segundos exactos con una simple cadena de 15 flip-flops divisores por 2.'
      },
      pitfalls: [
        {
          mistake: 'Subir la frecuencia de la CPU con el PLL sin aumentar los "Flash Wait States" ( estados de espera de Flash)',
          whyItFails:
            'La memoria Flash física solo puede leerse a unos ~30 MHz directos. Si subes la CPU a 84 MHz o 168 MHz sin configurar el registro FLASH->ACR (Wait States + Prefetch Cache), la CPU leerá instrucciones corruptas y se colgará al instante.',
          seniorFix: 'Antes de conmutar SYSCLK al PLL de alta velocidad, configura siempre la latencia de Flash (FLASH_ACR_LATENCY) que indica la tabla del Datasheet.'
        }
      ]
    }
  ],

  // =========================================================================
  // MÓDULO 3: DOMINANDO GPIO A NIVEL DE SILICIO
  // =========================================================================
  3: [
    {
      id: 'm3-c1',
      chapterNumber: 'Capítulo 3.1',
      title: 'Ingeniería Eléctrica del Pin para Programadores: Ley de Ohm, Corriente Máxima y Niveles Lógicos',
      subtitle: 'Cuántos miliamperios soporta un pin, cómo calcular resistencias y cuándo necesitas un transistor externo',
      paragraphs: [
        'Aunque controles un pin con una línea de código C, por ese pin circula corriente eléctrica real sujeta a la Ley de Ohm (V = I * R). En el capítulo "Electrical Characteristics" de cualquier Datasheet encontrarás dos límites sagrados: la corriente máxima por un pin individual (típicamente 8 mA a 20 mA en un STM32/ESP32, o 40 mA máx en un ATmega328P) y la corriente máxima total sumando todos los pines del chip (ej. 120 mA).',
        'Por eso puedes encender un LED indicador directamente desde un pin (con su resistencia limitadora en serie de 220 Ω a 1 kΩ para limitar la corriente a ~5 mA), pero JAMÁS puedes conectar un motor, un relé o una tira de potencia directamente al pin: quemarías el diminuto transistor MOSFET interno del silicio.',
        'Asimismo, debes conocer los umbrales de voltaje del Schmitt Trigger de entrada: un microcontrolador de 3.3V no necesita exactamente 3.30V para leer un 1 lógico; cualquier voltaje por encima de V_IH (Input High Voltage, ~2.0V) se lee como 1, y cualquier voltaje por debajo de V_IL (Input Low Voltage, ~0.8V) se lee como 0.'
      ],
      table: {
        headers: ['Parámetro del Datasheet', 'Significado Físico', 'Valor Típico (MCU 3.3V)', 'Regla de Diseño'],
        rows: [
          ['V_OH / V_OL', 'Voltaje real entregado en Salida Alta / Baja', '~3.1V (HIGH) / ~0.2V (LOW)', 'Cae ligeramente si pides mucha corriente al pin'],
          ['V_IH / V_IL', 'Umbral de Entrada para reconocer un 1 o un 0', '> 2.0V es 1  |  < 0.8V es 0', 'Evita siempre dejar voltajes intermedios (0.9V..1.9V) en pines digitales'],
          ['I_IO (Max Pin Current)', 'Corriente máxima continua por 1 patilla', '8 mA – 20 mA', 'Para cargas > 15 mA usa siempre un MOSFET o driver externo'],
          ['R_PU / R_PD', 'Valor de las resistencias Pull-Up/Down internas', '30 kΩ – 50 kΩ (Débiles)', 'Para I2C de alta velocidad (400 kHz) añade resistencias externas más fuertes (4.7 kΩ)']
        ]
      },
      workedExample: {
        title: 'Ejemplo Resuelto: Cálculo de la Resistencia de un LED y Corriente de una Pull-Up',
        problemStatement:
          'Conectas un LED rojo (caída de tensión V_led = 1.8V) a un pin de 3.3V de tu STM32 y quieres que circulen exactamente 5 mA (0.005 A) para no forzar el pin. ¿Qué resistencia debes poner en serie? ¿Y cuánta corriente gasta una Pull-Up interna de 40 kΩ cuando el botón está pulsado a GND?',
        steps: [
          '1. Para el LED: la resistencia debe absorber la diferencia de tensión entre el pin (3.3V) y el LED (1.8V): V_r = 3.3V - 1.8V = 1.5V.',
          '2. Por la Ley de Ohm: R = V_r / I = 1.5V / 0.005 A = 300 Ω (puedes usar el valor comercial estándar de 330 Ω).',
          '3. Para la Pull-Up de 40 kΩ conectada a 3.3V cuando el botón une el pin a 0V: I = 3.3V / 40.000 Ω = 0.0000825 A = 82.5 microamperios (µA).'
        ],
        codeOrMath: `R_led = (V_pin - V_led) / I_deseada = (3.3V - 1.8V) / 0.005A = 300 Ohmios\nI_pullup = 3.3V / 40.000 Ohmios = 82.5 uA`,
        conclusion:
          'En dispositivos a batería, si un interruptor puede quedarse cerrado durante meses, una Pull-Up de 40 kΩ gastaría 82 µA continuos; por eso en Ultra-Low-Power activamos la Pull-Up por software solo en el instante de leer.'
      },
      pitfalls: [
        {
          mistake: 'Conectar una señal de 5V de un sensor clásico a un pin de 3.3V que NO es tolerante a 5V (No FT)',
          whyItFails:
            'El diodo de protección superior del pin conducirá desde 5V hacia la línea de 3.3V del microcontrolador, pudiendo destruir el chip.',
          seniorFix: 'Revisa en la tabla de Pinout del Datasheet si el pin tiene la marca "FT" (Five-volt Tolerant) o usa un divisor resistivo / conversor de nivel.'
        }
      ]
    },
    {
      id: 'm3-c2',
      chapterNumber: 'Capítulo 3.2',
      title: 'El Rebote Mecánico (Switch Bounce) y Algoritmos de Filtrado (Debouncing en C)',
      subtitle: 'Por qué al pulsar un botón una sola vez tu microcontrolador cuenta 20 pulsaciones y cómo solucionarlo sin bloquear la CPU',
      paragraphs: [
        'En el mundo físico, cuando aprietas un pulsador metálico, las dos láminas de cobre no hacen un contacto limpio instantáneo: rebotan microscópicamente una contra otra durante entre 2 y 15 milisegundos antes de estabilizarse.',
        'Como tu microcontrolador ejecuta millones de instrucciones por segundo, mientras tu dedo cree haber hecho "1 clic", el pin físico ha subido y bajado de 3.3V a 0V una docena de veces. Si usas ese pin para sumar +1 a un menú o cambiar el estado de una máquina, verás que salta erráticamente.',
        'La solución amateur es meter un delay_ms(50) que congela todo el microcontrolador durante 50 millones de nanosegundos. La solución profesional en C consiste en muestrear el pin periódicamente (por ejemplo cada 5 ms con un Timer) o usar un registro de desplazamiento de 8 lecturas consecutivas.'
      ],
      table: {
        headers: ['Técnica de Debounce', 'Cómo Funciona', 'Calidad en Producción'],
        rows: [
          ['delay_ms(50) bloqueante', 'Detiene toda la CPU tras detectar el primer cambio', '❌ Mala: bloquea el resto del firmware y sufre ante ruido eléctrico'],
          ['Filtro RC por Hardware', 'Resistencia + Condensador (ej. 10kΩ + 100nF) antes del pin Schmitt Trigger', '✅ Excelente si tienes espacio y presupuesto en el PCB'],
          ['Registro de Desplazamiento en C', 'Desplaza la lectura cada 5 ms: hist = (hist << 1) | pin; valida cuando hist == 0xFF o 0x00', '🏆 Estándar de Oro en Firmware: 0 bloqueos y filtra rebotes y picos de ruido']
        ]
      },
      workedExample: {
        title: 'Ejemplo Resuelto: El Algoritmo Profesional de Debounce por Registro de Historial de 8 Bits',
        problemStatement:
          'Escribe una función llamada cada 5 ms que lea un botón activo en bajo y solo confirme la pulsación cuando el botón lleve 8 muestras seguidas (8 * 5 ms = 40 ms) estable en 0.',
        steps: [
          '1. Mantenemos una variable static uint8_t historial = 0xFF; donde cada bit guarda una lectura de hace 5, 10, 15... 40 ms.',
          '2. En cada llamada desplazamos historial 1 bit a la izquierda y metemos en el bit 0 la lectura actual del pin: historial = (historial << 1) | pin_actual;',
          '3. Si las últimas 7 lecturas eran 0 y la primera era 1 (historial == 0b10000000 = 0x80), detectamos el flanco limpio de pulsación.'
        ],
        codeOrMath: `bool boton_pulsado_limpio(uint8_t pin_bit_actual) {\n    static uint8_t historial = 0xFFU;\n    historial = (uint8_t)((historial << 1) | (pin_bit_actual & 1U));\n    return (historial == 0x80U); // Flanco limpio tras 7 lecturas estables en 0!\n}`,
        conclusion:
          'Con 4 líneas de C y 1 byte de RAM acabas de crear un filtro digital antirrebotes inmune a ruidos y sin usar ni un solo delay().'
      },
      pitfalls: [
        {
          mistake: 'Conectar un botón con rebotes directamente a una interrupción externa (EXTI) sin filtro ni validación temporal',
          whyItFails: 'El rebote mecánico disparará la ISR decenas de veces en ráfaga saturando la CPU.',
          seniorFix: 'Para botones pulsados por humanos (que duran > 50 ms), es mucho más limpio y seguro muestrearlos desde un Timer periódico de 5-10 ms.'
        }
      ]
    }
  ],

  // =========================================================================
  // MÓDULO 4: INTERRUPCIONES (ISR), NVIC, VOLATILE Y CONCURRENCIA
  // =========================================================================
  4: [
    {
      id: 'm4-c1',
      chapterNumber: 'Capítulo 4.1',
      title: 'Arquitectura del Controlador NVIC: Prioridades de Preempción, Anidamiento y Tail-Chaining',
      subtitle: 'Cómo decide el procesador qué interrupción entra primero y qué pasa si llega una más urgente a mitad de otra',
      paragraphs: [
        'En microcontroladores sencillos de 8 bits (como el ATmega328P), cuando el procesador entra en una interrupción (ISR), desactiva todas las demás hasta que termina. En cambio, en arquitecturas industriales de 32 bits (ARM Cortex-M con el controlador NVIC), las interrupciones tienen niveles de prioridad programables y soportan Anidamiento (Interrupt Nesting).',
        'Si la CPU está ejecutando una ISR de baja prioridad (ej. Prioridad 4, atendiendo un botón) y en ese instante llega una interrupción de alta prioridad (ej. Prioridad 0, protección de sobrecorriente de un motor), el NVIC congela inmediatamente la primera ISR, apila su contexto en el Stack, ejecuta la ISR urgente de Prioridad 0 y al terminar retoma la ISR de Prioridad 4.',
        'Además, el hardware Cortex-M incluye una optimización brillante llamada Tail-Chaining (Encadenamiento de Cola): si mientras estás dentro de la ISR A salta otra interrupción B de igual o menor prioridad, al terminar A la CPU NO pierde 12 ciclos desapilando y otros 12 ciclos volviendo a apilar los registros en RAM, sino que salta directamente de A a B en solo 6 ciclos.'
      ],
      table: {
        headers: ['Registro NVIC (Cortex-M)', 'Función en el Silicio', 'Función CMSIS Equivalente'],
        rows: [
          ['NVIC->ISER[0..7]', 'Interrupt Set-Enable Registers: Habilita la línea IRQ escribiendo un 1', 'NVIC_EnableIRQ(USART2_IRQn);'],
          ['NVIC->ICER[0..7]', 'Interrupt Clear-Enable Registers: Deshabilita la línea IRQ escribiendo un 1', 'NVIC_DisableIRQ(USART2_IRQn);'],
          ['NVIC->ISPR / ICPR', 'Set/Clear Pending: Permite disparar por software o borrar una IRQ pendiente', 'NVIC_ClearPendingIRQ(USART2_IRQn);'],
          ['NVIC->IP[0..239]', 'Interrupt Priority Registers: Define la urgencia (0 = Máxima urgencia)', 'NVIC_SetPriority(USART2_IRQn, 2);']
        ]
      },
      workedExample: {
        title: 'Ejemplo Resuelto: Cálculo del Banco y Bit en NVIC->ISER[n]',
        problemStatement:
          'Cada registro NVIC->ISER[n] tiene 32 bits y controla 32 líneas de interrupción. Si en el Datasheet de tu STM32 ves que la interrupción EXTI15_10 tiene el número de posición IRQ = 40, ¿en qué elemento del array ISER[n] y en qué bit exacto se habilita?',
        steps: [
          '1. Dividimos el número de IRQ entre 32 (división entera): 40 / 32 = 1 -> Corresponde al registro NVIC->ISER[1] (que controla las IRQs de la 32 a la 63).',
          '2. Calculamos el resto (módulo 32): 40 % 32 = 8 -> Corresponde al Bit 8 dentro de NVIC->ISER[1].',
          '3. En C a nivel de bits, dividir entre 32 es (irq >> 5) y el módulo 32 es (irq & 0x1F).'
        ],
        codeOrMath: `uint32_t irq_num = 40U;\nNVIC->ISER[irq_num >> 5U] = (1UL << (irq_num & 0x1FU));\n// Equivale a: NVIC->ISER[1] = (1UL << 8);`,
        conclusion:
          'Si abres el código fuente oficial de CMSIS (core_cm4.h), verás exactamente esa línea dentro de NVIC_EnableIRQ().'
      },
      pitfalls: [
        {
          mistake: 'Llamar a printf() o funciones lentas dentro de una ISR de alta prioridad',
          whyItFails:
            'Un printf() por UART a 9600 baudios puede tardar 20 milisegundos. Durante esos 20 ms estarás bloqueando todas las interrupciones de menor o igual prioridad del sistema.',
          seniorFix: 'Dentro de la ISR solo guarda el dato en un buffer RAM, levanta una bandera volatile y deja que main() formatee e imprima los textos.'
        }
      ]
    },
    {
      id: 'm4-c2',
      chapterNumber: 'Capítulo 4.2',
      title: 'Atomicidad de Datos Compartidos y Diseño de Secciones Críticas',
      subtitle: 'Por qué "volatile" NO basta para proteger variables grandes o estructuras compartidas con una ISR',
      paragraphs: [
        'Existe un mito muy peligroso entre programadores intermedios: creer que poner la palabra "volatile" delante de una variable o estructura resuelve automáticamente todos los problemas de concurrencia con las interrupciones. ¡Falso! "volatile" solo obliga al compilador a leer/escribir en memoria, pero NO hace que una operación de varios pasos sea atómica.',
        'Por ejemplo, en un microcontrolador de 8 bits (ATmega328P), leer una variable uint32_t requiere 4 instrucciones de lectura de 1 byte cada una. Si la ISR salta cuando el bucle principal lleva leídos 2 de los 4 bytes y cambia la variable, el bucle principal terminará leyendo mitad del número viejo y mitad del número nuevo.',
        'Incluso en un procesador de 32 bits (ARM/RISC-V), si compartes una estructura con varios campos (ej. { int16_t x; int16_t y; }) o haces una operación de incremento (contador++) tanto en main() como en la ISR, necesitas envolver el acceso en una Sección Crítica deshabilitando las interrupciones durante esos pocos ciclos.'
      ],
      table: {
        headers: ['Operación en C', '¿Es Atómica en 8-bit (AVR)?', '¿Es Atómica en 32-bit (ARM/RISC-V)?', 'Cómo Hacerla 100% Segura'],
        rows: [
          ['Leer un uint8_t', '✅ Sí (1 instrucción LDS)', '✅ Sí (1 instrucción LDRB)', 'Basta con calificarla como volatile'],
          ['Leer un uint32_t', '❌ No (4 instrucciones de 8 bits)', '✅ Sí (1 instrucción LDR alineada)', 'En 8-bit exige Sección Crítica (cli/sei)'],
          ['Incrementar (x++) entre main e ISR', '❌ No (Read-Modify-Write)', '❌ No (3 instrucciones: LDR, ADD, STR)', 'Exige Sección Crítica o instrucción atómica LDREX/STREX'],
          ['Leer un struct de varios campos', '❌ No', '❌ No (Múltiples lecturas LDR)', 'Copiar el struct dentro de una Sección Crítica']
        ]
      },
      workedExample: {
        title: 'Ejemplo Resuelto: Patrón Industrial de Sección Crítica con Restauración de Estado (PRIMASK)',
        problemStatement:
          '¿Por qué hacer simplemente __disable_irq(); ... __enable_irq(); puede ser peligroso si llamas a una función dentro de otra que ya tenía las interrupciones desactivadas, y cómo se hace correctamente?',
        steps: [
          '1. Si la Función A desactiva las interrupciones y llama a la Función B, y la Función B al terminar ejecuta __enable_irq() a ciegas, ¡habrá reactivado las interrupciones antes de que la Función A termine su sección crítica!',
          '2. El patrón correcto lee primero el registro de máscara de interrupciones (PRIMASK en ARM o SREG en AVR), desactiva las interrupciones, hace la copia rápida y al final restaura el valor original de PRIMASK.'
        ],
        codeOrMath: `uint32_t primask_previo = __get_PRIMASK(); // 1. Guarda estado actual\n__disable_irq();                           // 2. Cierra interrupciones\nmi_copia_local = datos_compartidos_isr;    // 3. Copia rápida en pocos ciclos\n__set_PRIMASK(primask_previo);             // 4. Restaura estado previo exacto`,
        conclusion:
          'Guardar y restaurar PRIMASK (o SREG en AVR / mstatus en RISC-V) permite anidar funciones seguras sin activar interrupciones por accidente.'
      },
      pitfalls: [
        {
          mistake: 'Mantener las interrupciones desactivadas durante milisegundos enteros',
          whyItFails:
            'Mientras las interrupciones están desactivadas, los bytes que lleguen por UART o los pulsos de temporización no podrán ser atendidos a tiempo, causando pérdida de tramas (Overrun Error).',
          seniorFix: 'Una sección crítica solo debe contener un par de asignaciones de memoria en RAM (menos de 1 microsegundo) y salir inmediatamente.'
        }
      ]
    }
  ],

  // =========================================================================
  // MÓDULO 5: TIMERS, CONTADORES Y PWM POR HARDWARE
  // =========================================================================
  5: [
    {
      id: 'm5-c1',
      chapterNumber: 'Capítulo 5.1',
      title: 'Los 3 Modos Maestros de un Timer: Time-Base, Input Capture y Output Compare (PWM)',
      subtitle: 'Cómo un mismo contador de hardware sirve para medir tiempos, medir la anchura de un pulso entrante o generar ondas',
      paragraphs: [
        'Un periférico Timer es mucho más que un simple generador de retardos. En la industria lo utilizamos en tres modos fundamentales que resuelven el 90% de los problemas de tiempo real sin usar la CPU:',
        '1) Modo Base de Tiempos (Time-Base): El contador CNT sube desde 0 hasta ARR y genera una interrupción periódica exacta (por ejemplo, cada 1 ms para el reloj del sistema). 2) Modo Captura de Entrada (Input Capture): Cuando un sensor externo (como un sensor ultrasónico, un receptor infrarrojo o un tacómetro de motor) cambia de 0 a 1 en el pin físico, el hardware "fotografía" instantáneamente el valor actual del contador CNT y lo guarda en el registro CCR1. Restando dos capturas conoces la duración del pulso con precisión de nanosegundos.',
        '3) Modo Comparación de Salida / PWM (Output Compare): El hardware compara continuamente CNT con el valor que tú escribiste en CCR1 y conmuta el pin físico automáticamente para regular el brillo de pantallas, la velocidad de motores DC o el ángulo de servomotores.'
      ],
      table: {
        headers: ['Modo del Timer', 'Dirección del Pin', 'Qué hace el Registro CCR1', 'Aplicación Industrial Típica'],
        rows: [
          ['Time-Base (Contador Puro)', 'Sin pin físico', 'No se usa (solo se usan PSC y ARR)', 'Tick de 1 ms para máquinas de estado y muestreo periódico'],
          ['Input Capture (Captura)', 'Pin en Entrada (AF)', 'Guarda una copia automática de CNT cuando ocurre un flanco en el pin', 'Medir RPM de motores, decodificar mandos IR, medir eco ultrasónico'],
          ['Output Compare / PWM', 'Pin en Salida (AF)', 'Actúa como umbral: Pin=HIGH si CNT < CCR1; Pin=LOW si CNT >= CCR1', 'Control de motores, convertidores DC-DC, inversores, servomotores']
        ]
      },
      workedExample: {
        title: 'Ejemplo Resuelto: Medición de Velocidad con Input Capture sin usar la CPU',
        problemStatement:
          'Configuras un Timer con un reloj de 1 MHz (1 tick = 1 µs) en modo Input Capture. El flanco de subida de un pulso guarda en CCR1 el valor 12.400, y el flanco de bajada guarda en CCR1 el valor 13.900. ¿Cuánto duró el pulso en alto?',
        steps: [
          '1. Restamos el valor capturado en el flanco de bajada menos el del flanco de subida: 13.900 - 12.400 = 1.500 ticks.',
          '2. Como cada tick del Timer equivale a 1 microsegundo, el pulso duró exactamente 1.500 µs (1,5 milisegundos).',
          '3. Incluso si la CPU tardó 50 µs en entrar a leer el registro CCR1, ¡la medida sigue siendo exacta al microsegundo porque la captura la hizo el silicio en el instante del flanco!'
        ],
        codeOrMath: `uint32_t ancho_pulso_us = captura_bajada - captura_subida; // 13900 - 12400 = 1500 us`,
        conclusion:
          'Nunca midas pulsos rápidos leyendo un pin por software en un bucle; usa siempre un canal Input Capture del Timer.'
      },
      pitfalls: [
        {
          mistake: 'En STM32, asumir que el reloj del Timer en APB1 es igual a la frecuencia de APB1 cuando el divisor APB1 es distinto de 1',
          whyItFails:
            'En la arquitectura STM32, si el divisor del bus APB1 es /2, /4, etc., el árbol de relojes multiplica automáticamente por x2 la frecuencia entregada a los Timers (ej. si APB1 va a 42 MHz, los Timers de APB1 reciben 84 MHz).',
          seniorFix: 'Comprueba siempre la regla "If APB prescaler != 1, TIMCLK = 2 * PCLK" en el diagrama de relojes del Datasheet.'
        }
      ]
    },
    {
      id: 'm5-c2',
      chapterNumber: 'Capítulo 5.2',
      title: 'Registros Sombra (Shadow Registers / Preload) y Sincronización sin Glitches en PWM',
      subtitle: 'Por qué existe el bit OC1PE / ARPE en los Datasheets y qué ocurre si cambias el periodo o ciclo de trabajo a mitad de cuenta',
      paragraphs: [
        'Cuando abres el capítulo de Timers de un Datasheet profesional (STM32, AVR, RP2040), verás que los registros ARR (Auto-Reload) y CCRx (Capture/Compare) aparecen dibujados con una doble caja sombreada detrás llamada "Shadow Register" (Registro Sombra) controlada por los bits ARPE (Auto-Reload Preload Enable) y OC1PE (Output Compare 1 Preload Enable).',
        '¿Por qué el fabricante gasta transistores duplicando estos registros? Imagina que el contador CNT va por 800 (camino de ARR = 999) y tu software decide cambiar ARR a 500 de golpe sin Preload activo. Como CNT (800) ya es mayor que el nuevo ARR (500), ¡el contador no se reiniciará en 500, sino que seguirá contando hasta el límite físico del registro (65.535 o 4.294.967.295) antes de dar la vuelta, provocando un pulso gigante corrupto en tu motor o fuente de alimentación!',
        'Cuando activas el bit Preload (ARPE = 1 y OC1PE = 1), cualquier valor nuevo que escribas desde C entra en el Registro de Precarga (Buffer), pero el comparador físico sigue usando el Registro Sombra antiguo hasta que termina el ciclo actual (Update Event, cuando CNT vuelve a 0). En ese instante exacto, el hardware copia el nuevo valor al Registro Sombra garantizando transiciones 100% limpias.'
      ],
      table: {
        headers: ['Bit de Control', 'Registro donde Vive', 'Efecto con Bit = 0 (Directo)', 'Efecto con Bit = 1 (Preload Activo — Recomendado)'],
        rows: [
          ['OC1PE (Output Compare Preload)', 'TIMx->CCMR1 (Bit 3)', 'Cambiar CCR1 altera el pulso inmediatamente a mitad de ciclo', 'El nuevo Duty Cycle entra en vigor limpiamente al empezar el siguiente periodo'],
          ['ARPE (Auto-Reload Preload)', 'TIMx->CR1 (Bit 7)', 'Reducir ARR por debajo de CNT puede causar desbordamiento largo', 'El nuevo Periodo se aplica de forma segura cuando CNT termina el ciclo actual'],
          ['UG (Update Generation)', 'TIMx->EGR (Bit 0)', 'No fuerza recarga inmediata', 'Escribir un 1 copia al instante todos los registros Preload a los Shadow Registers']
        ]
      },
      workedExample: {
        title: 'Ejemplo Resuelto: Actualización Segura de Frecuencia y Duty Cycle en Caliente',
        problemStatement:
          'Quieres inicializar un canal PWM de forma que cualquier cambio futuro en ARR o CCR1 se sincronice automáticamente con el final del periodo sin producir pulsos espurios.',
        steps: [
          '1. Activamos el Preload del comparador CCR1 encendiendo el bit OC1PE (bit 3) en TIM2->CCMR1.',
          '2. Activamos el Preload del periodo ARR encendiendo el bit ARPE (bit 7) en TIM2->CR1.',
          '3. Forzamos una carga inicial inmediata escribiendo un 1 en el bit UG (bit 0) de TIM2->EGR antes de arrancar el contador.'
        ],
        codeOrMath: `TIM2->CCMR1 = (6UL << 4) | (1UL << 3); // PWM Mode 1 + OC1PE (Bit 3) = 1\nTIM2->CR1  |= (1UL << 7);              // ARPE (Bit 7) = 1 (Preload de ARR)\nTIM2->EGR   = (1UL << 0);              // UG = 1: Copia Preload -> Shadow ahora\nTIM2->CR1  |= (1UL << 0);              // CEN = 1: Arranca el Timer`,
        conclusion:
          'Activar siempre OCxPE y ARPE en señales PWM es una marca distintiva de código industrial frente a código de principiante.'
      },
      pitfalls: [
        {
          mistake: 'Configurar un pin como GPIO de Salida Normal esperando que salga la señal PWM del Timer',
          whyItFails:
            'El registro ODR del GPIO y la salida del Timer son dos circuitos distintos dentro del chip; el pin físico solo se conecta al Timer cuando el multiplexor del pin se pone en modo Alternate Function (AF).',
          seniorFix: 'Configura siempre el pin en modo Alternate Function (MODER = 10 en STM32, FUNCSEL en RP2040) y selecciona el número de AF correcto según la tabla del Datasheet.'
        }
      ]
    }
  ],

  // =========================================================================
  // MÓDULO 6: PROTOCOLOS DE COMUNICACIÓN EN SERIE (UART, I2C, SPI)
  // =========================================================================
  6: [
    {
      id: 'm6-c1',
      chapterNumber: 'Capítulo 6.1',
      title: 'Diseño de un Ring Buffer (Buffer Circular) en C para Recepción UART por Interrupción',
      subtitle: 'La estructura de datos más importante de los sistemas embebidos explicada paso a paso',
      paragraphs: [
        'Cuando tu microcontrolador recibe una trama de datos por UART (por ejemplo, un comando JSON o una respuesta AT de un módem celular a 115.200 baudios), llega un nuevo byte cada 86 microsegundos. Si tu código principal está ocupado actualizando una pantalla y no lee el registro UART->DR antes de que llegue el siguiente byte, el segundo byte aplastará al primero provocando un error de hardware llamado Overrun.',
        '¿Cómo se resuelve esto en todos los firmwares profesionales del mundo? Combinando la interrupción RXNE del UART con un Ring Buffer (Buffer Circular o Cola FIFO) en memoria RAM.',
        'Un Ring Buffer es un array fijo (ej. uint8_t buf[64]) acompañado de dos índices: "head" (cabeza, donde la interrupción escribe cada byte recién llegado) y "tail" (cola, desde donde tu función main() va leyendo los bytes a su propio ritmo). Cuando cualquiera de los índices llega al final del array (63), da la vuelta a la posición 0 usando el operador módulo (% 64) o una máscara binaria (& 63).'
      ],
      table: {
        headers: ['Elemento del Ring Buffer', 'Quién lo Modifica', 'Condición Lógica', 'Significado'],
        rows: [
          ['head (Índice de Escritura)', 'Solo la ISR de recepción UART', 'next_head = (head + 1) & (SIZE - 1)', 'Apunta a la siguiente casilla libre donde se guardará el próximo byte'],
          ['tail (Índice de Lectura)', 'Solo el hilo principal main()', 'tail = (tail + 1) & (SIZE - 1)', 'Apunta al byte más antiguo pendiente de ser procesado por la aplicación'],
          ['head == tail', 'Lectura', 'Buffer Vacío', 'No hay datos nuevos pendientes de leer'],
          ['(head + 1) % SIZE == tail', 'Lectura en ISR', 'Buffer Lleno', 'La aplicación no ha leído a tiempo y el buffer se llenó']
        ]
      },
      workedExample: {
        title: 'Ejemplo Resuelto: Implementación Completa y Ultrarrápida de un Ring Buffer en C',
        problemStatement:
          'Diseña un Ring Buffer de tamaño potencia de 2 (64 bytes) para que el avance circular se haga con una máscara AND (& 63) en 1 ciclo de reloj en lugar de una división lenta (%).',
        steps: [
          '1. Elegimos un tamaño potencia de dos: 64 bytes (2^6). Así, (indice + 1) % 64 es idéntico a (indice + 1) & 63U.',
          '2. Como un único productor (la ISR) modifica "head" y un único consumidor (main) modifica "tail", ¡ni siquiera necesitamos desactivar interrupciones para insertar o sacar un byte!'
        ],
        codeOrMath: `#define RB_SIZE 64U // Potencia de 2\n#define RB_MASK (RB_SIZE - 1U) // 63 (0x3F)\n\ntypedef struct {\n    uint8_t  buffer[RB_SIZE];\n    volatile uint8_t head; // Escrito por la ISR\n    volatile uint8_t tail; // Escrito por main()\n} ring_buffer_t;\n\nstatic inline bool rb_push_from_isr(ring_buffer_t *rb, uint8_t byte) {\n    uint8_t next = (rb->head + 1U) & RB_MASK;\n    if (next == rb->tail) return false; // Buffer lleno\n    rb->buffer[rb->head] = byte;\n    rb->head = next;\n    return true;\n}`,
        conclusion:
          'Este código exacto de 12 líneas debería estar en tu cuaderno: lo usarás en prácticamente todos los proyectos de comunicaciones de tu carrera.'
      },
      pitfalls: [
        {
          mistake: 'En I2C, confundir la dirección de 7 bits del Datasheet (ej. 0x3C) con la dirección desplazada de 8 bits (0x78)',
          whyItFails:
            'En el cable I2C, los 7 bits superiores del primer byte son la dirección y el bit 0 es R/W (0=Escribir, 1=Leer). Algunas librerías piden 0x3C y hacen el desplazamiento (addr << 1) por ti, mientras que escribir directo en el registro de datos exige poner (0x3C << 1) = 0x78.',
          seniorFix: 'Comprueba siempre si el registro o función espera la dirección de 7 bits alineada a la derecha o ya desplazada 1 bit a la izquierda.'
        }
      ]
    },
    {
      id: 'm6-c2',
      chapterNumber: 'Capítulo 6.2',
      title: 'Los 4 Modos de Reloj en SPI (CPOL y CPHA) y Recuperación de Bloqueo en Bus I2C',
      subtitle: 'Cómo leer los cronogramas de polaridad/fase de SPI en un Datasheet y cómo rescatar un bus I2C atascado en 0V',
      paragraphs: [
        'Cuando conectas un dispositivo SPI (una memoria Flash W25Q, un acelerómetro IMU o una pantalla TFT), el Datasheet siempre especifica qué "Modo SPI" (Modo 0, 1, 2 o 3) exige el chip. Estos 4 modos nacen de combinar dos bits de configuración en el registro de control SPI_CR1: CPOL (Clock Polarity) y CPHA (Clock Phase).',
        'CPOL define el estado de reposo de la línea de reloj SCK cuando no hay transmisión (CPOL=0: SCK reposa en 0V; CPOL=1: SCK reposa en 3.3V). CPHA define en cuál de los dos flancos del pulso de reloj se captura (muestrea) el bit de datos (CPHA=0: se captura en el primer flanco; CPHA=1: se captura en el segundo flanco). El 90% de los chips usan Modo 0 (CPOL=0, CPHA=0) o Modo 3 (CPOL=1, CPHA=1).',
        'Por su parte, el protocolo I2C tiene un fallo físico famoso en la industria llamado "I2C Bus Lockup": si tu microcontrolador se reinicia (por ejemplo, al reprogramarlo o por un corte breve) justo cuando un sensor esclavo estaba enviando un bit 0 (tirando de SDA a tierra), el sensor se queda esperando a que terminen los pulsos de SCL y mantiene la línea SDA bloqueada en 0V para siempre. La solución profesional antes de inicializar el periférico I2C consiste en poner el pin SCL como salida GPIO y generar 9 pulsos de reloj manuales para que el esclavo suelte la línea SDA.'
      ],
      table: {
        headers: ['Modo SPI', 'Bit CPOL (Polaridad)', 'Bit CPHA (Fase)', 'Reposo de SCK y Flanco donde se Lee el Dato'],
        rows: [
          ['Modo 0 (El más común)', 'CPOL = 0', 'CPHA = 0', 'SCK reposa en BAJO (0V) y el bit se captura en el Flanco de SUBIDA'],
          ['Modo 1', 'CPOL = 0', 'CPHA = 1', 'SCK reposa en BAJO (0V) y el bit se captura en el Flanco de BAJADA'],
          ['Modo 2', 'CPOL = 1', 'CPHA = 0', 'SCK reposa en ALTO (3.3V) y el bit se captura en el Flanco de BAJADA'],
          ['Modo 3 (Muy común en IMUs)', 'CPOL = 1', 'CPHA = 1', 'SCK reposa en ALTO (3.3V) y el bit se captura en el Flanco de SUBIDA']
        ]
      },
      workedExample: {
        title: 'Ejemplo Resuelto:Lectura de un Registro Interno por SPI (Bit MSB = 1 para Lectura)',
        problemStatement:
          'En la mayoría de sensores SPI (como el giroscopio BMI270 o el barómetro BMP280), el primer byte enviado indica la dirección del registro (bits 6:0) y el bit 7 indica si quieres Leer (1) o Escribir (0). Escribe la función para leer el registro WHO_AM_I (0x0F).',
        steps: [
          '1. Bajamos el pin Chip Select (CS) del sensor a 0V para activar su interfaz SPI.',
          '2. Enviamos la dirección del registro con el bit 7 puesto a 1: (0x0F | 0x80) = 0x8F.',
          '3. Enviamos un segundo byte dummy (0x00) para generar otros 8 pulsos de reloj y recogemos el byte de respuesta que entra por MISO; finalmente subimos CS a 3.3V.'
        ],
        codeOrMath: `uint8_t spi_read_sensor_reg(uint8_t reg_addr) {\n    cs_pin_low();\n    spi_transfer_byte(reg_addr | 0x80U); // Bit 7 = 1 indica operación READ\n    uint8_t val = spi_transfer_byte(0x00U); // 8 pulsos SCK para recibir respuesta\n    cs_pin_high();\n    return val;\n}`,
        conclusion:
          'Recuerda siempre levantar el pin CS (Chip Select) a 3.3V al terminar la transacción; si lo dejas en 0V, el sensor creerá que sigues enviándole datos de la misma trama.'
      },
      pitfalls: [
        {
          mistake: 'Levantar el pin CS (Chip Select) en SPI inmediatamente después de escribir en SPI->DR sin esperar a que termine la transmisión física',
          whyItFails:
            'Escribir en SPI->DR solo mete el byte en el buffer de salida; los 8 bits tardan varios microsegundos en salir por el cable. Si subes CS antes de que la bandera BSY (Busy) baje a 0, cortarás el byte por la mitad.',
          seniorFix: 'Espera siempre a que RXNE=1 y BSY=0 antes de volver a poner el pin CS en nivel alto.'
        }
      ]
    }
  ],

  // =========================================================================
  // MÓDULO 7: CONVERSIÓN ANALÓGICA-DIGITAL (ADC) Y DMA
  // =========================================================================
  7: [
    {
      id: 'm7-c1',
      chapterNumber: 'Capítulo 7.1',
      title: 'Aritmética en Coma Fija, Filtrado Digital de Sensores (Media Móvil / EMA) y Teorema de Nyquist',
      subtitle: 'Cómo limpiar el ruido analógico de un sensor en C sin gastar ciclos en números de coma flotante (float)',
      paragraphs: [
        'En el mundo real, la señal analógica que entra al pin de un ADC desde un sensor de temperatura, presión o batería siempre viene acompañada de pequeñas fluctuaciones de ruido eléctrico (±5 a ±20 cuentas de ADC). Si muestras el valor crudo directamente en una pantalla o lo metes a un control PID, verás que el último dígito baila sin parar.',
        'Para suavizar la señal en C sin almacenar cientos de muestras en RAM ni usar operaciones en punto flotante (float), los ingenieros de sistemas embebidos utilizan dos filtros digitales ultraligeros: 1) Promedio de Potencia de 2 (sumar 8 o 16 muestras y desplazar a la derecha >> 3 o >> 4), y 2) Filtro de Media Móvil Exponencial (EMA / IIR de primer orden) usando aritmética entera.',
        'Además, al configurar la velocidad de disparo del ADC con DMA debes respetar siempre el Teorema de Muestreo de Nyquist-Shannon: la frecuencia a la que tomas muestras (F_s) debe ser como mínimo el DOBLE de la frecuencia máxima de la señal física que quieres medir (y en la práctica industrial, entre 5 y 10 veces mayor).'
      ],
      table: {
        headers: ['Técnica de Filtrado en C', 'Fórmula en Enteros (Sin float)', 'RAM Requerida', 'Ventaja Principal'],
        rows: [
          ['Promedio de 16 Muestras', 'media = suma_16_muestras >> 4;', '2 o 4 bytes', 'Dividir entre 16 con ">> 4" cuesta 1 solo ciclo de CPU'],
          ['Filtro Exponencial EMA (α = 1/8)', 'filtrado = filtrado - (filtrado >> 3) + (nuevo >> 3);', '2 o 4 bytes', 'Suaviza el ruido continuo guardando un único acumulador estático'],
          ['Doble Buffer DMA (Ping-Pong)', 'CPU filtra mitad [0..31] mientras DMA llena [32..63]', 'Array de N muestras', '0% de pérdida de datos a cientos de kHz']
        ]
      },
      workedExample: {
        title: 'Ejemplo Resuelto: Filtro Paso-Bajo Exponencial (EMA) en 1 Línea de C Entero',
        problemStatement:
          'Quieres aplicar un filtro que dé un 75% de peso al valor histórico acumulado y un 25% (1/4) de peso a la nueva lectura del ADC, sin usar variables float ni divisiones lentas.',
        steps: [
          '1. La ecuación matemática del filtro EMA es: Y_nuevo = (3 * Y_viejo + 1 * X_actual) / 4.',
          '2. Como dividir entre 4 en binario es simplemente desplazar 2 bits a la derecha (>> 2), la operación entera se ejecuta en nanosegundos.'
        ],
        codeOrMath: `uint16_t filtro_ema_adc(uint16_t nueva_lectura) {\n    static uint32_t filtrado = 2048UL; // Estado persistente\n    filtrado = ((filtrado * 3UL) + nueva_lectura) >> 2U; // Divide entre 4 en 1 ciclo!\n    return (uint16_t)filtrado;\n}`,
        conclusion:
          'Multiplicar y desplazar bits (>> N) te permite implementar filtros digitales de alta precisión incluso en microcontroladores sin unidad de punto flotante (FPU).'
      },
      pitfalls: [
        {
          mistake: 'Medir un sensor de alta impedancia (como un divisor resistivo de 1 MΩ) sin aumentar el Sampling Time (Tiempo de Muestreo) del ADC',
          whyItFails:
            'Dentro del ADC SAR hay un pequeño condensador (Sample & Hold, ~5 pF) que debe cargarse al voltaje del pin. Si la resistencia externa es muy alta y el tiempo de muestreo configurado en ADC_SMPR es muy corto, el condensador no llega a cargarse y leerás un voltaje falso más bajo.',
          seniorFix: 'Para sensores con impedancia > 10 kΩ, aumenta los ciclos de muestreo en el registro ADC_SMPR o añade un condensador de 100 nF en el pin.'
        }
      ]
    },
    {
      id: 'm7-c2',
      chapterNumber: 'Capítulo 7.2',
      title: 'Configuración de Anchos de Palabra en DMA (PSIZE / MSIZE) y Referencia Interna VREFINT',
      subtitle: 'Cómo evitar que el DMA corrompa arrays en RAM y cómo medir el voltaje real de una batería cuando cae VDD',
      paragraphs: [
        'Al configurar un canal DMA entre un periférico y un array en memoria RAM, hay tres parámetros en el registro de control del DMA que deben coincidir exactamente con tu código C: 1) PSIZE (Peripheral Data Size: ancho del registro del periférico, ej. 16 bits para ADC->DR o 8 bits para UART->DR), 2) MSIZE (Memory Data Size: tipo del array en C, ej. uint16_t o uint8_t), y 3) Los bits de auto-incremento PINC (Peripheral Increment = 0, porque la dirección de ADC->DR es siempre fija) y MINC (Memory Increment = 1, para que el DMA avance por las casillas buf[0], buf[1], buf[2]...).',
        'Si defines tu array en C como uint16_t adc_buf[16]; (2 bytes por elemento) pero configuras por error MSIZE en 32 bits (Word), ¡cada transferencia del DMA escribirá 4 bytes aplastando dos elementos a la vez y provocando un desbordamiento de buffer (Buffer Overflow) al llegar a la mitad de la cuenta!',
        'Otro secreto industrial clave en los ADC es el canal interno VREFINT (Voltaje de Referencia Interno Bandgap, típicamente 1.21V fijos independientes de la pila). Como el ADC mide en proporción a su alimentación VDD, si tu producto va conectado directamente a una pila que se está agotando (bajando de 3.3V a 2.7V), no puedes asumir que V_ref es 3300 mV: primero mides el canal interno VREFINT para calcular a qué voltaje real está trabajando el chip hoy, y con ese dato corriges todas las demás lecturas.'
      ],
      table: {
        headers: ['Parámetro del Canal DMA', 'Configuración para ADC -> Array RAM', 'Configuración para Array RAM -> UART TX', 'Por qué es Así'],
        rows: [
          ['Dirección (DIR)', 'Peripheral-to-Memory (00)', 'Memory-to-Peripheral (01)', 'Define quién es la fuente y quién el destino'],
          ['PINC (Incremento Periférico)', '0 (Fijo)', '0 (Fijo)', 'El registro de datos ADC->DR o UART->DR está siempre en la misma dirección'],
          ['MINC (Incremento Memoria)', '1 (Activado)', '1 (Activado)', 'Queremos recorrer secuencialmente las casillas del array en RAM'],
          ['PSIZE y MSIZE (Tamaño)', '16-bit Half-Word (uint16_t)', '8-bit Byte (uint8_t)', 'Debe coincidir exactamente con el sizeof() del tipo del array en C']
        ]
      },
      workedExample: {
        title: 'Ejemplo Resuelto: Cálculo del Voltaje Real de Alimentación (VDD) usando el Canal Interno VREFINT',
        problemStatement:
          'El canal interno VREFINT de tu STM32 genera siempre 1210 mV fijos. Al leer ese canal con el ADC de 12 bits obtienes el número raw_vref = 1640. ¿Cuál es el voltaje real VDD al que está alimentado el microcontrolador en este instante?',
        steps: [
          '1. Sabemos que: raw_vref = (1210 mV * 4095) / VDD_mV.',
          '2. Despejamos VDD_mV pasando VDD_mV a la izquierda y raw_vref dividiendo: VDD_mV = (1210 * 4095) / raw_vref.',
          '3. Calculamos: (1210 * 4095) / 1640 = 4.954.950 / 1640 = 3021 mV (3,02 Voltios).'
        ],
        codeOrMath: `uint32_t calcular_vdd_real_mv(uint16_t raw_vrefint) {\n    if (raw_vrefint == 0U) return 3300UL;\n    return (1210UL * 4095UL) / (uint32_t)raw_vrefint; // Ej: 3021 mV\n}`,
        conclusion:
          'Así es como los dispositivos IoT miden el porcentaje exacto de su propia batería sin añadir componentes externos.'
      },
      pitfalls: [
        {
          mistake: 'Pasar al registro de dirección de memoria del DMA (DMA->M0AR) un puntero a una variable local declarada dentro de una función que termina enseguida',
          whyItFails:
            'En cuanto la función retorna, esa zona del Stack es reutilizada por otras funciones, pero el controlador DMA sigue escribiendo datos del ADC encima de la pila corrompiendo direcciones de retorno y colgando la CPU.',
          seniorFix: 'Los buffers usados por el DMA deben ser siempre globales o declarados con la palabra clave "static" para que vivan permanentemente en la sección .bss/.data de SRAM.'
        }
      ]
    }
  ],

  // =========================================================================
  // MÓDULO 8: ARQUITECTURA DE FIRMWARE PROFESIONAL, FSM, LOW-POWER Y RTOS
  // =========================================================================
  8: [
    {
      id: 'm8-c1',
      chapterNumber: 'Capítulo 8.1',
      title: 'Arquitectura en Capas (Clean Embedded Architecture) y Diseño de Drivers Opacos en C',
      subtitle: 'Cómo estructuran sus carpetas y archivos .h/.c las empresas de automoción, aeroespacial y dispositivos médicos',
      paragraphs: [
        'La diferencia entre un aficionado y un Ingeniero de Firmware Senior no está solo en saber qué bit encender, sino en cómo organiza un proyecto de 20.000 líneas de C para que sea mantenible, testeable y portable entre distintos microcontroladores.',
        'Todo proyecto profesional se divide en 3 o 4 capas estrictas donde las dependencias solo apuntan hacia abajo: 1) Capa de Aplicación (app/): contiene las máquinas de estado (FSM) y reglas del producto; no sabe ni qué microcontrolador existe debajo. 2) Capa de Drivers de Dispositivos Externos (drivers/): ej. bme280.c o ssd1306_oled.c; recibe por inyección de dependencias un puntero a la interfaz I2C/SPI para no depender de un chip concreto. 3) Capa de Abstracción de Hardware (hal/ o bsp/): el único lugar donde se incluyen los headers de registros del fabricante (stm32f4xx.h, nrf.h, etc.).',
        'Para lograr esto en C estándar utilizamos Inyección de Dependencias mediante Estructuras de Punteros a Funciones: el driver del sensor pide una estructura con las funciones (*i2c_write) y (*i2c_read), permitiéndote incluso simular el sensor en tu PC con tests unitarios antes de tener el hardware físico.'
      ],
      table: {
        headers: ['Capa del Proyecto', 'Archivos Ejemplo', '¿Puede tocar Registros del MCU?', 'Portabilidad al cambiar de Chip'],
        rows: [
          ['1. Aplicación (App / Domain)', 'app_thermostat_fsm.c', '❌ PROHIBIDO', '100% Reutilizable sin cambiar ni una línea'],
          ['2. Drivers de Componentes (Middleware)', 'sensor_sht31.c, ring_buffer.c', '❌ PROHIBIDO (Usa interfaz HAL)', '100% Reutilizable en cualquier arquitectura'],
          ['3. Board Support / HAL (Port)', 'bsp_board.c, hal_i2c_stm32.c', '✅ SÍ (Aquí vive el código bare-metal)', 'Se reescribe solo esta capa al migrar de MCU']
        ]
      },
      workedExample: {
        title: 'Ejemplo Resuelto: Driver de Sensor I2C 100% Independiente del Microcontrolador',
        problemStatement:
          'Diseña la estructura de un driver en C para un sensor de temperatura I2C de modo que el mismo archivo sensor.c funcione en un ATmega328P, un STM32F4 y un ESP32-C3 sin usar #ifdef.',
        steps: [
          '1. Definimos en sensor.h un tipo de estructura que contiene un puntero a la función de lectura I2C y la dirección de 7 bits del sensor.',
          '2. En main.c conectamos esa estructura a la función I2C real de nuestro microcontrolador actual.'
        ],
        codeOrMath: `// En sensor_temp.h (100% agnóstico del hardware):\ntypedef struct {\n    uint8_t i2c_addr;\n    bool (*i2c_read_reg)(uint8_t addr, uint8_t reg, uint8_t *data, uint16_t len);\n} temp_sensor_dev_t;\n\nbool temp_sensor_get_celsius(const temp_sensor_dev_t *dev, int16_t *out_temp) {\n    uint8_t raw[2];\n    if (!dev->i2c_read_reg(dev->i2c_addr, 0x00U, raw, 2U)) return false;\n    *out_temp = (int16_t)((raw[0] << 8) | raw[1]);\n    return true;\n}`,
        conclusion:
          'Con esta técnica (Inyección de Dependencias en C), tu librería de sensores es eterna y puedes probarla pasando una función "mock" falsa desde un test en PC.'
      },
      pitfalls: [
        {
          mistake: 'Abusar de variables globales extern compartidas entre 10 archivos .c distintos',
          whyItFails:
            'Cualquier archivo puede modificar el estado en cualquier momento, haciendo casi imposible rastrear quién corrompió un valor.',
          seniorFix: 'Declara el estado interno de cada módulo como "static" dentro de su archivo .c y expón únicamente funciones limpias en el .h.'
        }
      ]
    },
    {
      id: 'm8-c2',
      chapterNumber: 'Capítulo 8.2',
      title: 'Planificación en Tiempo Real: Superloop Cooperativo con FSM vs RTOS Preemptivo (FreeRTOS / Zephyr)',
      subtitle: 'Cuándo usar un bucle de máquinas de estado y cuándo necesitas un RTOS con semáforos, mutex y colas',
      paragraphs: [
        'Existen dos grandes arquitecturas de ejecución para un sistema embebido: 1) Arquitectura Superloop No-Bloqueante (Time-Triggered / Event-Driven con FSM), donde un único hilo main() recorre en microsegundos cada máquina de estados y luego duerme la CPU con __WFI() hasta la próxima interrupción; y 2) Un Sistema Operativo en Tiempo Real (RTOS), donde el programa se divide en varios hilos independientes (Tasks), cada uno con su propio bucle while(1) y su propia pila (Stack) privada en RAM.',
        'En un RTOS Preemptivo, el planificador (Scheduler) interrumpe automáticamente la tarea actual cuando se desbloquea una tarea de mayor prioridad (por ejemplo, porque llegó un dato a una Cola xQueue o se liberó un Semáforo desde una ISR).',
        'Sin embargo, usar varios hilos en un RTOS introduce riesgos clásicos que todo experto debe dominar: si dos tareas acceden al mismo periférico I2C a la vez, sus bytes se mezclarán en el cable; por eso en un RTOS protegemos los buses compartidos con un Mutex (Mutual Exclusion).'
      ],
      table: {
        headers: ['Primitiva de RTOS', 'Para qué sirve exactamente', 'Regla de Uso en Ingeniería'],
        rows: [
          ['Task (Tarea / Hilo)', 'Función con su propio Stack independiente y nivel de prioridad', 'Dimensiona su Stack con margen y nunca la bloquees con bucles activos (usa vTaskDelay)'],
          ['Queue (Cola FIFO Segura)', 'Enviar datos o eventos de una ISR a una Tarea o entre dos Tareas', 'Es la forma más limpia de comunicar hilos sin usar variables globales sueltas'],
          ['Binary Semaphore', 'Despertar a una Tarea cuando termina una interrupción de hardware (ISR -> Task)', 'La ISR da el semáforo (GiveFromISR) y la tarea se despierta al instante (Take)'],
          ['Mutex (Exclusión Mutua)', 'Llave de baño para proteger un recurso compartido (ej. Bus SPI/I2C) entre tareas', 'Incluye Priority Inheritance para evitar el bug de Inversión de Prioridad; nunca se usa en ISR']
        ]
      },
      workedExample: {
        title: 'Ejemplo Resuelto: Sincronización Perfecta entre una Interrupción DMA y una Tarea RTOS',
        problemStatement:
          'Quieres que una tarea de procesamiento permanezca dormida (consumiendo 0% de CPU) mientras el DMA recibe 128 bytes por UART, y que se despierte en el microsegundo exacto en que termina la transferencia.',
        steps: [
          '1. La tarea llama a xSemaphoreTake(sem_dma, portMAX_DELAY); y el RTOS la saca de la CPU poniéndola en estado Blocked.',
          '2. Cuando el DMA termina de copiar los 128 bytes a RAM, salta la interrupción DMA_IRQHandler, la cual llama a xSemaphoreGiveFromISR(sem_dma, &despertar_tarea_urgente).',
          '3. Al salir de la ISR, el planificador salta directamente a tu tarea para procesar el paquete con latencia de pocos microsegundos.'
        ],
        codeOrMath: `void DMA1_Stream5_IRQHandler(void) {\n    BaseType_t xHigherPriorityTaskWoken = pdFALSE;\n    DMA1->HIFCR = DMA_HIFCR_CTCIF5; // Limpia bandera hardware\n    xSemaphoreGiveFromISR(sem_rx_listo, &xHigherPriorityTaskWoken);\n    portYIELD_FROM_ISR(xHigherPriorityTaskWoken); // Cambia de contexto al salir!\n}`,
        conclusion:
          'Este patrón (Hardware DMA -> Interrupción -> Semáforo -> Tarea RTOS) es la columna vertebral de los sistemas industriales de alto rendimiento.'
      },
      pitfalls: [
        {
          mistake: 'Usar un Mutex normal dentro de una rutina de interrupción (ISR)',
          whyItFails:
            'Un Mutex está diseñado para que una tarea espere (se bloquee) si está ocupado, pero una ISR jamás puede bloquearse ni dormir ni tiene un Task Control Block (TCB).',
          seniorFix: 'Dentro de una ISR solo se pueden usar funciones terminadas en FromISR (como xQueueSendFromISR o xSemaphoreGiveFromISR).'
        }
      ]
    }
  ],

  // =========================================================================
  // MÓDULO 9: PROYECTOS MULTI-ARCHIVO (.h/.c), CREACIÓN DE LIBRERÍAS Y TOOLCHAIN
  // =========================================================================
  9: [
    {
      id: 'm9-c1',
      chapterNumber: 'Capítulo 9.1',
      title: 'Cómo Dividir un Programa en Múltiples Archivos (.h y .c): Declaración vs Definición y "static / extern / const"',
      subtitle: 'La anatomía exacta de un módulo en C profesional y cómo evitar los errores "multiple definition" y "undefined reference"',
      paragraphs: [
        'Cuando pasas de programar pequeños ejercicios en un único archivo main.c a trabajar en un producto industrial con 30 o 50 archivos, lo primero que debes dominar es el concepto de "Unidad de Traducción" (Translation Unit). Para el compilador de C (gcc), los archivos .h NO se compilan por sí solos: el compilador toma cada archivo .c por separado (main.c, motor.c, uart.c), pega dentro de él el texto de los .h que haya incluido con #include y genera un archivo objeto independiente (main.o, motor.o, uart.o).',
        'Por eso existe una distinción sagrada entre DECLARACIÓN (lo que va en el archivo .h: anunciar que una función o tipo existe, sin reservar memoria) y DEFINICIÓN (lo que va en el archivo .c: el código real de la función y las variables que reservan bytes en RAM/Flash). Si pones "int contador = 0;" dentro de un archivo .h y ese .h es incluido por main.c y por motor.c, ¡tanto main.o como motor.o reservarán su propia variable "contador", y cuando el Linker intente unirlos explotará con el error "multiple definition of `contador`"!.',
        'Además, un Senior utiliza tres calificadores esenciales en cada librería: 1) "static" delante de variables globales o funciones auxiliares dentro del .c para hacerlas 100% privadas a ese archivo (Linkage Interno), 2) "extern" en el .h solo en los raros casos en que una variable global deba ser vista desde fuera, y 3) "const" para forzar a que las tablas y estructuras de configuración se almacenen en la memoria Flash (.rodata) y gasten 0 bytes de memoria SRAM.'
      ],
      table: {
        headers: ['Elemento de C', '¿Dónde se Escribe?', 'Palabra Clave', 'Dónde Vive en el Silicio y Visibilidad'],
        rows: [
          ['Prototipo de función pública', 'En mi_libreria.h', 'void motor_init(void);', 'Visible para cualquier .c que haga #include "mi_libreria.h"'],
          ['Cuerpo de función pública', 'En mi_libreria.c', 'void motor_init(void) { ... }', 'Código máquina en Flash (.text), exportado al Linker'],
          ['Función o variable privada del módulo', 'Solo en mi_libreria.c', 'static uint32_t estado_interno;', 'Oculta dentro de mi_libreria.o (imposible tocarla desde main.c)'],
          ['Tabla constante de solo lectura', 'En mi_libreria.c', 'static const uint16_t LUT[64] = {...};', 'Vive en Flash (.rodata) -> ¡Ahorra un 100% de memoria SRAM!'],
          ['Función pequeña ultrarrápida en .h', 'En mi_libreria.h', 'static inline uint8_t leer_bit(void) {...}', 'Única excepción con cuerpo en .h: se incrusta en 1 ciclo sin colisión']
        ]
      },
      workedExample: {
        title: 'Ejemplo Resuelto: Plantilla Canónica de una Librería en C (bateria_lib.h + bateria_lib.c + main.c)',
        problemStatement:
          'Diseña una librería limpia llamada "bateria_lib" que oculte su contador interno de lecturas para que ningún otro archivo pueda corromperlo, use una tabla constante en Flash y exponga solo dos funciones limpias hacia main.c.',
        steps: [
          '1. Creamos bateria_lib.h con sus guardas #ifndef BATERIA_LIB_H y únicamente los prototipos públicos.',
          '2. Creamos bateria_lib.c incluyendo "bateria_lib.h", declarando el estado interno como "static" y la tabla de calibración como "static const".',
          '3. En main.c incluimos "bateria_lib.h" y llamamos a las funciones públicas.'
        ],
        codeOrMath: `/* === 1. bateria_lib.h (Contrato Público) === */\n#ifndef BATERIA_LIB_H\n#define BATERIA_LIB_H\n#include <stdint.h>\nvoid     bateria_init(void);\nuint8_t  bateria_calcular_porcentaje(uint16_t mv);\n#endif\n\n/* === 2. bateria_lib.c (Implementación Privada) === */\n#include "bateria_lib.h"\nstatic uint32_t s_num_lecturas = 0U;            // Privada en SRAM (.bss)\nstatic const uint16_t UMBRALES_MV[3] = {3300U, 3700U, 4150U}; // En Flash (.rodata)!\n\nvoid bateria_init(void) { s_num_lecturas = 0U; }\nuint8_t bateria_calcular_porcentaje(uint16_t mv) {\n    s_num_lecturas++;\n    if (mv >= UMBRALES_MV[2]) return 100U;\n    if (mv <= UMBRALES_MV[0]) return 0U;\n    return 50U;\n}`,
        conclusion:
          'Copia esta estructura (.h público con #ifndef + .c privado con static y static const) en tu cuaderno: es el ladrillo fundamental con el que se construyen todos los firmwares profesionales.'
      },
      pitfalls: [
        {
          mistake: 'Olvidar poner "static" a una función auxiliar común (ej. void delay_interno(void)) dentro de dos archivos .c distintos',
          whyItFails:
            'En C, toda función sin la palabra "static" tiene visibilidad global (External Linkage) por defecto. Si sensor_a.c y sensor_b.c tienen una función interna con el mismo nombre y sin static, el Linker dará error de "multiple definition".',
          seniorFix: 'Pon SIEMPRE "static" delante de todas las funciones y variables globales de un archivo .c que no formen parte del archivo .h.'
        }
      ]
    },
    {
      id: 'm9-c2',
      chapterNumber: 'Capítulo 9.2',
      title: 'Diseño de Librerías Multi-Instancia, Callbacks con Punteros a Funciones y Serialización con "union"',
      subtitle: 'Cómo crear librerías orientadas a objetos en C puro y cómo empaquetar tramas de comunicación sin esfuerzo',
      paragraphs: [
        'Imagina que escribes una librería para controlar un filtro digital o un botón antirrebotes. Si guardas el historial en una única variable global dentro de boton.c, ¡tu librería solo servirá para 1 botón! Si la placa tiene 4 botones, ¿tendrías que copiar y pegar el archivo 4 veces? ¡Jamás! En C profesional diseñamos Librerías Multi-Instancia (el equivalente en C a las Clases y Objetos).',
        '¿Cómo se hace? Definimos en el .h un typedef struct (llamado "Handle", "Context" o "Instance") que contiene los datos de estado de UN objeto (su pin, su historial de rebote y su puntero a función Callback). Luego, todas las funciones de la librería reciben como primer parámetro un puntero a esa estructura: boton_update(boton_t *me, uint8_t lectura). Así puedes declarar 10 botones en main.c y manejarlos con el mismo código en Flash.',
        'Además, cuando tu librería de comunicaciones necesita convertir números de 16 o 32 bits (o un float) en bytes individuales para enviarlos por UART, SPI o CAN, el lenguaje C ofrece la herramienta "union": a diferencia de un struct (donde cada miembro va uno detrás de otro), en una "union" todos los miembros empiezan en el byte 0 y comparten la misma caja física de RAM.'
      ],
      table: {
        headers: ['Construcción de C Avanzado', 'Sintaxis Clave', 'Cuánta Memoria Ocupa', 'Caso de Uso Industrial'],
        rows: [
          ['struct de Instancia (Handle)', 'typedef struct { uint8_t pin; uint8_t hist; } btn_t;', 'Suma de sus miembros (+ padding)', 'Tener N sensores, N motores o N filtros usando una sola librería'],
          ['Callback (Puntero a Función)', 'typedef void (*evento_cb_t)(uint8_t id);', '4 bytes en 32-bit (2 bytes en AVR)', 'La librería avisa a main.c cuando ocurre un evento sin acoplarse'],
          ['union (Unión de Memoria)', 'typedef union { uint32_t u32; uint8_t b[4]; } conv_u;', 'El tamaño de su miembro MÁS GRANDE (4B)', 'Despiezar un uint32_t o float en 4 bytes (b[0..3]) instantáneamente'],
          ['enum ( Máquina de Estados)', 'typedef enum { ST_OK = 0, ST_ERR_TIMEOUT } status_e;', '1 a 4 bytes entero', 'Códigos de retorno legibles en todas las funciones de tu librería']
        ]
      },
      workedExample: {
        title: 'Ejemplo Resuelto: Librería de Botón Multi-Instancia con Callback de Evento',
        problemStatement:
          'Diseña una librería en C capaz de gestionar cualquier número de botones independientes y que llame automáticamente a una función de usuario cuando detecte una pulsación limpia.',
        steps: [
          '1. Definimos el tipo puntero a función "btn_callback_t" y la estructura de instancia "btn_instance_t".',
          '2. La función btn_poll() actualiza el historial del botón apuntado por "me" y, si vale 0x80 (flanco limpio), invoca me->on_press(me->id).'
        ],
        codeOrMath: `typedef void (*btn_callback_t)(uint8_t boton_id);\n\ntypedef struct {\n    uint8_t        id;\n    uint8_t        historial;\n    btn_callback_t on_press; // Puntero a función Callback!\n} btn_instance_t;\n\nvoid btn_poll_5ms(btn_instance_t *me, uint8_t pin_level) {\n    me->historial = (uint8_t)((me->historial << 1U) | (pin_level & 1U));\n    if ((me->historial == 0x80U) && (me->on_press != 0)) {\n        me->on_press(me->id); // ¡Dispara el Callback registrado por main.c!\n    }\n}`,
        conclusion:
          'Combinar un struct de instancia (*me) con un puntero a función callback (me->on_press) es el patrón más elegante y profesional de la programación en C embebido.'
      },
      pitfalls: [
        {
          mistake: 'Llamar a un puntero a función Callback sin comprobar antes si es distinto de NULL (0)',
          whyItFails:
            'Si el usuario de tu librería olvidó registrar el callback y el puntero vale 0x00000000, hacer me->on_press() saltará a la dirección 0 provocando un reinicio o un HardFault inmediato.',
          seniorFix: 'Comprueba siempre "if (me->on_press != NULL)" antes de invocar cualquier puntero a función.'
        }
      ]
    },
    {
      id: 'm9-c3',
      chapterNumber: 'Capítulo 9.3',
      title: 'El Pipeline Completo del Toolchain: De Múltiples .c a Objetos (.o), Librerías Estáticas (.a), Linker (.elf) y Mapa (.map)',
      subtitle: 'Qué ocurre exactamente cuando ejecutas make y cómo empaquetar y auditar librerías profesionales',
      paragraphs: [
        'Cuando trabajas en un entorno profesional sin depender del botón mágico de Arduino, tu sistema de construcción (Makefile o CMake) ejecuta 4 herramientas del Toolchain (como arm-none-eabi-gcc) en cadena:',
        '1) Compilación separada (-c): Cada archivo .c se compila a su propio archivo objeto binario (.o), por ejemplo "arm-none-eabi-gcc -c motor.c -o motor.o". Si tienes 50 archivos .c y solo modificas 1 línea en main.c, ¡la herramienta "make" solo recompila main.c en 0,2 segundos y reutiliza los otros 49 archivos .o ya compilados!',
        '2) Creación de Librerías Estáticas (.a): Si quieres distribuir tu librería a un cliente o compartirla entre varios proyectos (incluso sin entregar el código fuente .c, entregando solo el .h y el binario), usas la herramienta Archiver ("arm-none-eabi-ar rcs libmidriver.a motor.o filtro.o"). Un archivo .a es un paquete indexado de archivos .o.',
        '3) Enlazado (Linker) y Auditoría del Archivo .map: Finalmente, el Linker une main.o con tus librerías (-L. -lmidriver) siguiendo el Linker Script (-T chip.ld) y genera dos archivos cruciales: el ejecutable "firmware.elf" (del que objcopy extrae el "firmware.bin" para grabar en Flash) y el informe "firmware.map", donde puedes ver exactamente cuántos bytes ocupa cada función y cada variable en Flash y SRAM.'
      ],
      table: {
        headers: ['Etapa / Herramienta', 'Comando Real de Terminal', 'Archivo de Entrada -> Salida', 'Qué Hace por Dentro'],
        rows: [
          ['1. Compilador (gcc -c)', 'arm-none-eabi-gcc -mcpu=cortex-m4 -Os -c drv.c -o drv.o', 'drv.c + drv.h -> drv.o', 'Traduce C a código máquina con direcciones provisionales (Símbolos)'],
          ['2. Empaquetador (ar rcs)', 'arm-none-eabi-ar rcs libdrv.a drv.o util.o', 'Varios .o -> libdrv.a', 'Empaqueta varios objetos en una Librería Estática reutilizable'],
          ['3. Enlazador (gcc / ld)', 'arm-none-eabi-gcc main.o -L. -ldrv -T mcu.ld -Wl,-Map=fw.map -o fw.elf', 'main.o + libdrv.a -> fw.elf + fw.map', 'Resuelve llamadas entre archivos y asigna direcciones reales Flash/RAM'],
          ['4. Extractor Binario y Tamaño', 'arm-none-eabi-objcopy -O binary fw.elf fw.bin && arm-none-eabi-size fw.elf', 'fw.elf -> fw.bin', 'Extrae la imagen cruda para quemar en el silicio y muestra text/data/bss']
        ]
      },
      workedExample: {
        title: 'Ejemplo Resuelto: Cómo Leer la Salida de "arm-none-eabi-size" para Calcular Flash y RAM',
        problemStatement:
          'Al terminar de compilar tu proyecto multi-archivo, la herramienta "size" imprime: text = 14200, data = 120, bss = 2048. ¿Cuántos bytes exactos ocupará tu programa en la memoria Flash y cuántos en la memoria SRAM?',
        steps: [
          '1. Memoria Flash ocupada = text (código + constantes const .rodata) + data (valores iniciales de variables globales) = 14.200 + 120 = 14.320 bytes de Flash.',
          '2. Memoria SRAM estática ocupada = data (copiada a RAM al arrancar) + bss (variables globales inicializadas a cero) = 120 + 2.048 = 2.168 bytes de SRAM.'
        ],
        codeOrMath: `   text\t   data\t    bss\t    dec\t    hex\tfilename\n  14200\t    120\t   2048\t  16368\t   3ff0\tfirmware.elf\n\n// Flash Total = text + data = 14.320 bytes\n// SRAM Total  = data + bss  =  2.168 bytes (+ margen para el Stack)`,
        conclusion:
          'Anota esas dos fórmulas (Flash = text + data | RAM = data + bss) en tu cuaderno: las usarás a diario al compilar cualquier proyecto profesional.'
      },
      pitfalls: [
        {
          mistake: 'Compilar una librería enorme sin las banderas -ffunction-sections -fdata-sections y -Wl,--gc-sections',
          whyItFails:
            'Por defecto, el Linker incluye el archivo .o entero aunque solo llames a 1 de sus 30 funciones, llenando la memoria Flash de código muerto que nunca se ejecuta.',
          seniorFix: 'Añade siempre -ffunction-sections -fdata-sections al compilar y -Wl,--gc-sections al enlazar para que el Linker elimine automáticamente cualquier función o tabla no referenciada.'
        }
      ]
    }
  ],

  // =========================================================================
  // MÓDULO 10: INGENIERÍA DE FIRMWARE SENIOR EN PRODUCCIÓN
  // =========================================================================
  10: [
    {
      id: 'm10-c1',
      chapterNumber: 'Capítulo 10.1',
      title: 'Diseño de Bootloaders, Particionado de Flash, Verificación CRC32 y Actualizaciones OTA',
      subtitle: 'Cómo dividir la memoria Flash de un microcontrolador para que pueda actualizarse a sí mismo sin quedar nunca inservible',
      paragraphs: [
        'En un producto comercial moderno (un cargador de coche eléctrico, un equipo médico o un nodo industrial), tener que abrir la carcasa y conectar un programador físico para actualizar un bug es inaceptable. Todos los dispositivos profesionales utilizan un Bootloader (Gestor de Arranque) alojado en los primeros sectores de la memoria Flash.',
        'La memoria Flash se divide como mínimo en tres zonas: 1) Bootloader (ej. 0x08000000, 32 KB), que es el programa que arranca siempre al encender el chip; 2) Partición de Aplicación Activa (Slot A, ej. 0x08008000, 192 KB); y 3) Partición de Descarga / Backup (Slot B, ej. 0x08038000, 192 KB) donde la aplicación descarga la nueva versión recibida por UART, CAN, BLE o WiFi.',
        'Al arrancar el microcontrolador, el Bootloader comprueba si hay una imagen nueva en el Slot B, verifica su firma criptográfica o su suma de comprobación CRC32 (para asegurarse de que no se cortó un cable a mitad de descarga), la copia al Slot A y realiza el "Salto a la Aplicación": desactiva interrupciones, apunta el registro SCB->VTOR a 0x08008000, carga el nuevo puntero de pila MSP desde 0x08008000 y salta a la dirección contenida en 0x08008004.'
      ],
      table: {
        headers: ['Dirección en Flash (Ejemplo STM32)', 'Región / Partición', 'Contenido en los Primeros Bytes', 'Responsabilidad en el Producto'],
        rows: [
          ['0x08000000 .. 0x08007FFF (32 KB)', 'Bootloader Primario', '[0x00]: MSP_Boot | [0x04]: Reset_Boot', 'Verifica integridad CRC32, gestiona actualizaciones y salta a la App'],
          ['0x08008000 .. 0x08037FFF (192 KB)', 'Slot A: Aplicación Activa', '[0x00]: MSP_App  | [0x04]: Reset_App', 'Contiene el firmware de producción con su propia Vector Table desplazada'],
          ['0x08038000 .. 0x08067FFF (192 KB)', 'Slot B: Imagen OTA Nueva', 'Cabecera Metadatos (Versión + CRC32)', 'Almacena temporalmente el nuevo binario antes de validarlo'],
          ['0x08068000 .. 0x0807FFFF (96 KB)', 'Sector NVS / Configuración', 'Parámetros calibrados + Crash Logs', 'Guarda datos no volátiles que sobreviven al apagar el equipo']
        ]
      },
      workedExample: {
        title: 'Ejemplo Resuelto: La Secuencia Exacta en C para Saltar del Bootloader a la Aplicación',
        problemStatement:
          'Escribe la función en C que ejecuta un Bootloader en 0x08000000 para ceder el control limpiamente a la Aplicación compilada para empezar en 0x08008000.',
        steps: [
          '1. Leemos la primera palabra de 32 bits en 0x08008000 (el valor inicial del Main Stack Pointer de la aplicación) y la segunda palabra en 0x08008004 (la dirección del Reset_Handler de la aplicación).',
          '2. Desactivamos interrupciones y apagamos SysTick para que ninguna interrupción salte a mitad de la transición.',
          '3. Actualizamos SCB->VTOR = 0x08008000UL, cargamos el registro MSP y llamamos a la dirección de entrada convirtiéndola en un puntero a función.'
        ],
        codeOrMath: `typedef void (*app_entry_t)(void);\n\nvoid jump_to_application(uint32_t app_addr) {\n    uint32_t app_sp    = *(volatile uint32_t *)(app_addr + 0U);\n    uint32_t app_reset = *(volatile uint32_t *)(app_addr + 4U);\n    __disable_irq();\n    SysTick->CTRL = 0U;          // Detiene SysTick del Bootloader\n    SCB->VTOR     = app_addr;    // ¡Vital! Apunta Vector Table a 0x08008000\n    __set_MSP(app_sp);           // Carga Stack Pointer de la App\n    ((app_entry_t)app_reset)();  // Salta al Reset_Handler de la App\n}`,
        conclusion:
          'Recuerda que para compilar la Aplicación debes cambiar en su Linker Script (.ld) la línea FLASH ORIGIN = 0x08008000 para que todas sus direcciones coincidan con su nueva casa.'
      },
      pitfalls: [
        {
          mistake: 'Dejar un periférico (como UART, Timer o DMA) encendido en el Bootloader antes de saltar a la Aplicación',
          whyItFails:
            'En cuanto la Aplicación reactive las interrupciones globales al arrancar, ese periférico heredado del Bootloader puede disparar una interrupción antes de que la Aplicación haya inicializado sus propios buffers, provocando un cuelgue inmediato.',
          seniorFix: 'Antes de saltar a la aplicación, detén el SysTick y resetea los periféricos que haya utilizado el Bootloader.'
        }
      ]
    },
    {
      id: 'm10-c2',
      chapterNumber: 'Capítulo 10.2',
      title: 'Diagnóstico Forense de Cuelgues (HardFault_Handler), Registros CFSR/BFAR y "Stack Painting"',
      subtitle: 'Cómo encontrar en 2 minutos la línea exacta de C que colgó un microcontrolador sin adivinar a ciegas',
      paragraphs: [
        'Un programador junior entra en pánico cuando el microcontrolador cae en la excepción HardFault_Handler() y empieza a comentar código al azar. Un Ingeniero Senior sabe que el procesador dejó todas las pruebas del crimen apiladas en la memoria SRAM justo antes de saltar a HardFault.',
        'Cuando ocurre un fallo grave (desreferenciar un puntero inválido, escribir en una dirección inexistente, ejecutar un puntero a función corrupto o dividir entre 0), el hardware apila automáticamente 8 registros en el Stack: R0, R1, R2, R3, R12, LR (Link Register: qué función hizo la llamada), PC (Program Counter: la dirección exacta de la instrucción máquina que causó el fallo) y xPSR.',
        'Si pasas el valor de ese PC apilado (por ejemplo 0x08001A42) al comando del Toolchain "arm-none-eabi-addr2line -e firmware.elf 0x08001A42", ¡la terminal te responde con el nombre del archivo .c y el número de línea exacto donde ocurrió el bug! Además, leyendo el registro SCB->CFSR (Configurable Fault Status Register) y SCB->BFAR (Bus Fault Address Register) sabes la dirección exacta que intentó tocar el puntero corrupto.'
      ],
      table: {
        headers: ['Pista Forense en el Silicio', 'Dónde Leerla en C / Debugger', 'Qué te Revela Exactamente'],
        rows: [
          ['Stacked PC (stack_frame[6])', 'Séptima palabra apilada en SP al entrar a HardFault', 'Dirección de la instrucción máquina exacta que disparó la excepción'],
          ['Stacked LR (stack_frame[5])', 'Sexta palabra apilada en SP', 'Dirección de retorno de la función desde la que se llamó al código roto'],
          ['SCB->CFSR (0xE000ED28)', 'Configurable Fault Status Register', 'Bits que indican si fue División por 0, Acceso Desalineado, Bus Error o Instrucción Ilegal'],
          ['SCB->BFAR / MMFAR', 'Bus / Memory Management Fault Address', 'Contiene la dirección de memoria inválida exacta que tu puntero intentó leer/escribir'],
          ['Patrón 0xDEADBEEF en Stack', 'Pintado al final de la SRAM al arrancar', 'Te dice cuántos bytes libres de Stack quedaron nunca pisados (High-Water Mark)']
        ]
      },
      workedExample: {
        title: 'Ejemplo Resuelto: Uso de addr2line y Técnica de "Stack Painting" (0xDEADBEEF)',
        problemStatement:
          'Tu firmware entra en HardFault y al inspeccionar el Stack Frame ves que stack[6] (PC) vale 0x080004B8 y SCB->BFAR vale 0x90000000. ¿Cómo averiguas qué línea de C intentó acceder a 0x90000000?',
        steps: [
          '1. Sabemos por SCB->BFAR que un puntero intentó acceder a la dirección inexistente 0x90000000.',
          '2. Ejecutamos en terminal: arm-none-eabi-addr2line -f -e firmware.elf 0x080004B8.',
          '3. La herramienta busca 0x080004B8 en la tabla de símbolos del .elf y nos imprime: "sensor_read_calib en drivers/sensor.c:84". ¡Bug cazado en segundos!'
        ],
        codeOrMath: `# Comando forense en terminal con el archivo .elf:\n$ arm-none-eabi-addr2line -f -p -e firmware.elf 0x080004B8\nsensor_read_calib at /proyecto/drivers/sensor.c:84`,
        conclusion:
          'Guarda siempre el archivo .elf y el .map correspondientes a cada versión de firmware que lances a producción: son tu caja negra de aviación.'
      },
      pitfalls: [
        {
          mistake: 'Dimensionar el Stack a ojo sin medir nunca cuánta pila consumen realmente tus funciones e interrupciones anidadas',
          whyItFails:
            'Si ocurre la peor combinación de llamadas e interrupciones y el Stack invade la sección .bss, corromperá variables globales silenciosamente sin avisar.',
          seniorFix: 'Pinta siempre la región del Stack con 0xDEADBEEF al arrancar y usa la bandera de GCC "-fstack-usage" (que genera un archivo .su indicando cuántos bytes de pila gasta cada función).'
        }
      ]
    },
    {
      id: 'm10-c3',
      chapterNumber: 'Capítulo 10.3',
      title: 'Normativa Industrial MISRA-C, Control PID Discreto y Testing Unitario Off-Target en PC',
      subtitle: 'Las reglas de oro para escribir código C de misión crítica y cómo verificarlo con tests automatizados',
      paragraphs: [
        'Cuando haces una entrevista técnica para un puesto de Senior Embedded C Developer en automoción (ISO 26262), ferroviario, aeroespacial o dispositivos médicos, te preguntarán por el estándar MISRA-C (Motor Industry Software Reliability Association). Aunque el lenguaje C te permite hacer cualquier locura con punteros y conversiones implícitas, MISRA-C define un subconjunto estricto y determinista de C donde los comportamientos indefinidos quedan prohibidos.',
        'Las reglas más importantes de MISRA-C que debes aplicar en todos tus proyectos son: 1) Prohibido usar memoria dinámica (malloc, calloc, free) tras la inicialización, porque en un microcontrolador sin MMU el Heap se fragmenta con los días hasta devolver NULL en mitad de una maniobra crítica; 2) Prohibido usar recursión (para que el uso máximo de Stack sea 100% calculable en tiempo de compilación); 3) Usar siempre tipos de ancho fijo (<stdint.h>) y sufijos explícitos (U/UL) en máscaras; y 4) Comprobar siempre la validez de los punteros recibidos en las funciones públicas de tus librerías.',
        'Finalmente, un Senior diseña sus librerías (como un controlador PID de temperatura/motores, un parser de tramas o una máquina de estados) de forma que puedan compilarse con el GCC de su propio ordenador (Testing Off-Target con Unity o CTest) pasando registros simulados (Mocks) antes de grabar nada en el microcontrolador.'
      ],
      table: {
        headers: ['Regla / Práctica Senior', 'Práctica Peligrosa (Rechazada en Industria)', 'Estándar Senior / MISRA-C', 'Por qué es Crítico en Sistemas Embebidos'],
        rows: [
          ['Memoria Dinámica (Regla 21.3)', 'p = malloc(128); ... free(p);', 'static uint8_t pool_buffer[128];', 'Elimina el riesgo de Fragmentación del Heap y fallos tras semanas encendido'],
          ['Recursión (Regla 17.2)', 'void fn(int n) { fn(n-1); }', 'Bucles iterativos con límite máximo fijo', 'Garantiza que el Stack jamás crezca de forma impredecible'],
          ['Bucles de Espera Hardware', 'while (!(UART->SR & RXNE)) {}', 'while (!(UART->SR & RXNE) && (--timeout > 0U)) {}', 'Si un sensor externo se rompe o se suelta un cable, tu CPU no se cuelga para siempre'],
          ['Verificación en Compilación', 'Asumir que un struct mide 8 bytes', '_Static_assert(sizeof(pkt_t) == 8U, "Error");', 'Si alguien añade un campo y rompe el protocolo, el compilador avisa al instante']
        ]
      },
      workedExample: {
        title: 'Ejemplo Resuelto: Espera de Hardware Defensiva con Timeout (Inmune a Fallos de Cableado)',
        problemStatement:
          'Transforma un bucle bloqueante peligroso while (!(I2C1->SR1 & BIT_ADDR)) {} en una función profesional que devuelva un código de error limpio si el sensor externo no responde en 10.000 ciclos.',
        steps: [
          '1. Definimos un enum claro para los códigos de estado de nuestra librería (STATUS_OK, STATUS_ERR_TIMEOUT).',
          '2. Añadimos un contador decreciente al bucle while. Si llega a 0 antes de que el bit de hardware se active, abortamos limpiamente y devolvemos STATUS_ERR_TIMEOUT.'
        ],
        codeOrMath: `typedef enum {\n    DRV_OK = 0,\n    DRV_ERR_TIMEOUT,\n    DRV_ERR_NULL_PTR\n} drv_status_t;\n\ndrv_status_t i2c_wait_flag_safe(volatile const uint32_t *reg, uint32_t mask) {\n    if (reg == 0) return DRV_ERR_NULL_PTR; // Regla MISRA: Validar punteros\n    uint32_t timeout = 10000UL;\n    while (((*reg & mask) == 0UL) && (timeout > 0UL)) {\n        timeout--;\n    }\n    return (timeout > 0UL) ? DRV_OK : DRV_ERR_TIMEOUT;\n}`,
        conclusion:
          'Nunca escribas un bucle while() esperando un bit de un sensor externo sin un contador de timeout: los cables se rompen, pero tu firmware jamás debe colgarse.'
      },
      pitfalls: [
        {
          mistake: 'Escribir un bucle while infinito esperando a un sensor externo (I2C/SPI/UART) sin mecanismo de Timeout',
          whyItFails:
            'Basta con que una soldadura del sensor falle o haya un pico de ruido en el cable para que toda la CPU se quede atrapada eternamente en esa línea.',
          seniorFix: 'Toda espera sobre un periférico externo debe llevar un timeout máximo y devolver un código de estado (enum) para que la máquina de estados pueda reintentar o activar una alarma.'
        }
      ]
    }
  ],

  // =========================================================================
  // MÓDULO 11: NORMATIVA ESPACIAL Y DEFENSA (EUROPA ECSS vs AMÉRICA NASA/DO-178C) Y HARDWARE RAD-HARD
  // =========================================================================
  11: [
    {
      id: 'm11-c1',
      chapterNumber: 'Capítulo 11.1',
      title: 'Marco Normativo Espacial y de Defensa: Europa (ECSS-E-ST-40C / Q-ST-80C) frente a América (NASA JPL / DO-178C)',
      subtitle: 'Nomenclatura legal (SHALL / SHOULD / MAY), Categorías de Criticidad (A, B, C, D) vs DAL (A..E) y Regla de Propagación de Fallos',
      paragraphs: [
        'En el sector aeroespacial (satélites, lanzadores, sondas interplanetarias) y de defensa/aviación, el software embebido se rige por estándares de ingeniería y aseguramiento de calidad de cumplimiento estricto. En Europa, todas las misiones de la Agencia Espacial Europea (ESA) y la industria espacial europea (Airbus Defence & Space, Thales Alenia Space, GMV, Sener, Indra, PLD Space) se rigen por las normas ECSS (European Cooperation for Space Standardization): concretamente ECSS-E-ST-40C Rev.1 (Space Engineering — Software, 30 de abril de 2025) y ECSS-Q-ST-80C Rev.2 (Space Product Assurance — Software Product Assurance, 30 de abril de 2025). En Estados Unidos, los equivalentes son NASA-STD-8739.8, el estándar de codificación C de laboratorio "The Power of Ten: Rules for Developing Safety-Critical Code" de NASA JPL (Jet Propulsion Laboratory), RTCA DO-178C (en aviación civil y militar) y MIL-STD-882E.',
        'Lo primero que todo ingeniero senior debe anotar en su cuaderno es la nomenclatura verbal obligatoria definida en la Cláusula 3.4 de ambas normas ECSS: 1) "SHALL" (DEBE / OBLIGATORIO) expresa un requisito vinculante cuyo cumplimiento hay que demostrar con evidencias formales; lo opuesto ("SHALL NOT") indica lo que ESTÁ ESTRICTAMENTE PROHIBIDO; 2) "SHOULD" (DEBERÍA / RECOMENDACIÓN) expresa una regla que NO SE DEBE incumplir: durante la fase de adaptación del proyecto (tailoring) cada "should" se convierte en requisito obligatorio o exige una justificación técnica formal aprobada por el cliente; 3) "MAY" / "NEED NOT" indica lo que SE PUEDE hacer libremente (permiso opcional); y 4) "CAN" describe una capacidad física o posibilidad material.',
        'El rigor exigido al código C depende de la Categoría de Criticidad del Software (definida en ECSS-Q-ST-80C Rev.2 Anexo D, Tabla D-1, págs. 101-102). Se asigna según la severidad de las consecuencias de un fallo del software sobre el sistema y la existencia o no de provisiones compensatorias (inhibiciones hardware independientes). Y atención a la cláusula ECSS-Q-ST-80C 6.2.2.10 y 6.2.10.1 (Segregación y Propagación de Fallos): si tienes un módulo de software de Categoría D (menor) corriendo en el mismo procesador que un módulo de Categoría A (catastrófico) y ambos comparten memoria RAM o recursos sin aislamiento garantizado por hardware (MPU/MMU y particionado temporal/espacial), ¡la normativa obliga a clasificar y verificar TODO el software como Categoría A!'
      ],
      formulas: [
        {
          name: 'Ley de Propagación de Criticidad por Recursos Compartidos (ECSS-Q-ST-80C 6.2.2.10)',
          expression: 'Si Módulo(Cat_D) comparte RAM/CPU sin aislamiento con Módulo(Cat_A)  ==>  Criticidad_Total = Cat_A',
          explanation: 'Para evitar tener que certificar el 100% del código como Categoría A, la arquitectura debe aislar físicamente los módulos en procesadores separados o usar una MPU/MMU con particionado espacial y temporal certificado (Time and Space Partitioning - TSP).'
        }
      ],
      table: {
        headers: ['Categoría Europea (ECSS-Q-ST-80C Tabla D-1)', 'Equivalente EE.UU. (DO-178C / NASA)', 'Consecuencia del Fallo en el Sistema', 'Exigencia de Cobertura de Código (ECSS-E-ST-40C 5.8.3.5b)'],
        rows: [
          ['Categoría A (Catastrophic)', 'DO-178C DAL A / NASA Class A (Human-Rated)', 'Pérdida de vidas humanas, destrucción del lanzador o plataforma sin provisión compensatoria', '100% Sentencias + 100% Decisiones + 100% MC/DC (+ Cobertura Código Objeto si -O2)'],
          ['Categoría B (Critical)', 'DO-178C DAL B / NASA Class B ( Unmanned Mission)', 'Pérdida de la misión espacial o degradación grave sin provisión compensatoria (o Cat I con compensación HW)', '100% Cobertura de Sentencias (Statement) + 100% Cobertura de Decisiones (Branch)'],
          ['Categoría C (Major)', 'DO-178C DAL C / NASA Class C', 'Degradación significativa de la misión o pérdida parcial de datos científicos recuperables', 'Cobertura de Sentencias y Decisiones acordada con el cliente (típicamente >= 80-90%)'],
          ['Categoría D (Minor / Negligible)', 'DO-178C DAL D / NASA Class D (CubeSat / Experimento)', 'Inconveniente menor sin impacto en la seguridad ni en el éxito principal de la misión', 'Pruebas funcionales y de validación de requisitos sin exigencia de MC/DC']
        ]
      },
      workedExample: {
        title: 'Ejemplo Resuelto: Qué pasa con el Código Generado por IA y el Código Desactivado según ECSS 2025',
        problemStatement:
          'Dos dudas reales de auditoría con la nueva revisión de abril de 2025: 1) ¿Qué dice ECSS-E-ST-40C Rev.1 si generas una función en C con una IA generativa? 2) ¿La rama "default:" de un switch donde atrapas estados imposibles se considera "código muerto / desactivado" prohibido por la norma?',
        steps: [
          '1. Sobre IA Generativa: La Cláusula 3.2.2 (Nota 2, pág. 16 de ECSS-E-ST-40C Rev.1) establece textualmente: "Code issued from generative artificial intelligence is considered manually generated code". Es decir, NO cuenta como generador automático calificado (tipo SCADE/Simulink cualificado), por lo que debe pasar el 100% de revisiones manuales, análisis estático MISRA y cobertura unitaria.',
          '2. Sobre Programación Defensiva vs Código Desactivado: La Cláusula 6.2.3.6 de ECSS-Q-ST-80C exige eliminar el código inalcanzable (unreachable code), PERO la Cláusula 3.2.9 (Nota 1, pág. 16 de ECSS-Q-ST-80C Rev.2) aclara explícitamente: "Code related to defensive programming is not considered as deactivated code". Por tanto, poner un default: defensivo para recuperarse de un bit-flip es totalmente legal y obligatorio.'
        ],
        codeOrMath: `/* ECSS-E-ST-40C Rev.1 Cláusula 3.2.2 Note 2:\n   "Code issued from generative AI is considered manually generated code."\n\n   ECSS-Q-ST-80C Rev.2 Cláusula 3.2.9 Note 1:\n   "Code related to defensive programming is not considered as deactivated code." */`,
        conclusion:
          'Conocer estas dos notas textuales de la revisión de abril de 2025 demuestra un dominio actualizado al día de la normativa espacial europea.'
      },
      pitfalls: [
        {
          mistake: 'Mezclar en el mismo binario C funciones críticas de control de vuelo (Cat A/B) con funciones no críticas (Cat D) usando variables globales compartidas',
          whyItFails:
            'El auditor de calidad (PA Manager) aplicará inmediatamente la cláusula ECSS-Q-ST-80C 6.2.2.10, obligándote a pasar 100% de cobertura MC/DC y documentación exhaustiva también al código no crítico.',
          seniorFix: 'Aísla las funciones críticas en su propia partición protegida por MPU (Memory Protection Unit) y comunícalas únicamente mediante colas de mensajes validadas con límite estricto de longitud.'
        }
      ]
    },
    {
      id: 'm11-c2',
      chapterNumber: 'Capítulo 11.2',
      title: 'Lo que SE PUEDE, NO SE DEBE y ESTÁ PROHIBIDO: ECSS Annex U.2 (14 Checks) vs NASA JPL Power of Ten',
      subtitle: 'La guía definitiva para tu cuaderno de las reglas de codificación C en misiones espaciales y de defensa',
      paragraphs: [
        'Tanto la normativa europea (ECSS-E-ST-40C Rev.1 Cláusula 5.5.2.5 y Anexo U.2 "Software code verification", pág. 252) como la normativa estadounidense (NASA JPL "Power of Ten" de Gerard Holzmann y MISRA-C:2012) coinciden en un objetivo fundamental: transformar el lenguaje C en un lenguaje 100% determinista, predecible en memoria y analizable estáticamente antes del lanzamiento.',
        'En el Anexo U.2 de ECSS-E-ST-40C Rev.1 se listan los 14 puntos obligatorios que deben verificarse sobre todo código fuente de vuelo: (1) Mecanismos de protección numérica (contra overflow, underflow y división por cero); (2) Cero accesos fuera de límites (underrun/overrun de arrays, buffers o strings); (3) Ningún bucle infinito salvo el bucle principal de tareas cíclicas; (4) Uso apropiado de operadores aritméticos/bitwise (&, |, ~) frente a lógicos (&&, ||, !); (5) Conversiones implícitas de tipo sin errores aritméticos; (6) Tiempo de vida (lifetime) de variables consistente con su uso (jamás entregar la dirección de una variable local del Stack a un DMA o tarea asíncrona); (7) Uso correcto de static para imponer visibilidad mínima; (8) Uso obligatorio de volatile en todo acceso asíncrono o registro hardware; (9) Cero accesos inválidos a memoria (desreferencia de punteros NULL); (10) Cero accesos a variables sin inicializar; (11) Cero asignaciones sin usar (salvo lecturas dummy para disparar efectos laterales de hardware); (12) Cero fugas de memoria; (13) Aritmética de punteros justificada y consistente en tipos; y (14) Ausencia de condiciones de carrera.',
        'Por su parte, las 10 Reglas de NASA JPL ("Power of Ten", utilizadas en los rovers de Marte Curiosity y Perseverance) añaden restricciones cuantitativas muy fáciles de memorizar en tu cuaderno: prohibido goto/setjmp/recursión (Regla 1), todo bucle debe tener un límite fijo de iteraciones (Regla 2), prohibido malloc/free tras la inicialización (Regla 3), ninguna función debe superar las 60 líneas de código (Regla 4), densidad mínima de 2 aserciones defensivas por función (Regla 5), declarar variables en el ámbito más reducido posible (Regla 6), comprobar siempre el valor de retorno de toda función no-void y validar parámetros (Regla 7), restringir el preprocesador a #include y macros simples sin macros recursivas ni compilación condicional excesiva (Regla 8), restringir el uso de punteros a un máximo de 1 nivel de desreferencia (*p sí, pero **pp o punteros a funciones arbitrarios restringidos, Regla 9), y compilar desde el día 1 con todas las advertencias activadas (-Wall -Wextra -Werror) y 0 warnings en analizadores estáticos (Regla 10).'
      ],
      table: {
        headers: ['Clasificación Normativa', 'Qué Regula en C Embebido', 'Referencia Europea (ECSS 2025)', 'Referencia Americana (NASA JPL / MISRA)'],
        rows: [
          ['PROHIBIDO (SHALL NOT)', 'Usar malloc() / free() dinámico tras el arranque o tener fugas de memoria', 'ECSS-E-ST-40C 5.5.2.5d-e & Annex U.2 #12', 'NASA JPL Rule 3 / MISRA-C Rule 21.3'],
          ['PROHIBIDO (SHALL NOT)', 'Usar recursión (directa o indirecta) o saltos goto / longjmp', 'ECSS-Q-ST-80C 6.2.6.2 (Restricciones de lenguaje)', 'NASA JPL Rule 1 / MISRA-C Rule 17.2'],
          ['PROHIBIDO (SHALL NOT)', 'Bucles de espera (while) sin contador de límite superior fijo (Timeout)', 'ECSS-E-ST-40C Annex U.2 #3', 'NASA JPL Rule 2 (Fixed Loop Bounds)'],
          ['PROHIBIDO (SHALL NOT)', 'Pasar punteros de variables locales (Stack) a DMA o ISRs asíncronas', 'ECSS-E-ST-40C Annex U.2 #6 (Variable Lifetime)', 'MISRA-C Rule 18.6 / CERT-C DCL30-C'],
          ['PROHIBIDO (SHALL NOT)', 'Omitir volatile en registros MMIO o variables compartidas, o tener Race Conditions', 'ECSS-E-ST-40C 5.5.2.5c & Annex U.2 #8, #14', 'BARR-C / CERT-C CON43-C'],
          ['NO SE DEBE (SHOULD NOT)', 'Usar conversión implícita de signo, aritmética de punteros o >1 nivel de puntero (**p)', 'ECSS-E-ST-40C Annex U.2 #5, #13', 'NASA JPL Rule 9 / MISRA-C Rule 10.x, 18.4'],
          ['NO SE DEBE (SHOULD NOT)', 'Ignorar el valor de retorno de una función o escribir funciones de >60 líneas', 'ECSS-Q-ST-80C 6.3.5.12 (Métricas de complejidad)', 'NASA JPL Rule 4 & Rule 7'],
          ['SE PUEDE (MAY / OBLIGATORIO)', 'Lecturas dummy (void)REG para limpiar hardware y rama default: defensiva en switch', 'ECSS Annex U.2 #11 & ECSS-Q-ST-80C 3.2.9 Note 1', 'MISRA-C Rule 16.4 (default obligatorio)']
        ]
      },
      workedExample: {
        title: 'Ejemplo Resuelto: Reescribiendo una Función C Rechazada en Auditoría para que Cumpla ECSS Annex U.2 y NASA JPL',
        problemStatement:
          'Un ingeniero junior escribe: void leer_bus(int *p) { while (!(SPI1->SR & 1)); *p = SPI1->DR; }. Señala los 4 incumplimientos normativos de esa línea y reescríbela cumpliendo ECSS-E-ST-40C Annex U.2 y NASA JPL.',
        steps: [
          '1. Incumplimiento 1 (Annex U.2 #9 y NASA Rule 7): No comprueba si el puntero p es NULL antes de desreferenciarlo (*p).',
          '2. Incumplimiento 2 (Annex U.2 #3 y NASA Rule 2): El bucle while (!(SPI1->SR & 1)); no tiene cota máxima (si el bus SPI falla, cuelga el satélite para siempre).',
          '3. Incumplimiento 3 (Annex U.2 #5 y MISRA): Usa el tipo ambiguo "int" en lugar de enteros de ancho fijo <stdint.h> (uint16_t / uint32_t).',
          '4. Incumplimiento 4 (NASA Rule 7): Devuelve void en vez de devolver un código de estado que informe al llamador si hubo timeout o error.'
        ],
        codeOrMath: `// VERSIÓN CERTIFICABLE (Cumple ECSS-E-ST-40C Annex U.2 #3, #5, #8, #9 y NASA JPL Rules 2, 5, 7):\n#include <stdint.h>\n\n#define SPI_MAX_POLL_ITERATIONS  5000UL\n\ntypedef enum {\n    BUS_STATUS_OK       = 0,\n    BUS_STATUS_NULL_PTR = 1,\n    BUS_STATUS_TIMEOUT  = 2\n} bus_status_t;\n\nbus_status_t spi_read_word_certified(uint16_t *out_data) {\n    if (out_data == (uint16_t *)0) {\n        return BUS_STATUS_NULL_PTR; // Check #9: Protección contra NULL\n    }\n\n    uint32_t iter = 0UL;\n    while (((SPI1->SR & 1UL) == 0UL) && (iter < SPI_MAX_POLL_ITERATIONS)) {\n        iter++; // NASA Rule 2 & ECSS Check #3: Bucle acotado estáticamente\n    }\n\n    if (iter >= SPI_MAX_POLL_ITERATIONS) {\n        return BUS_STATUS_TIMEOUT;  // HSIA: Reporta fallo de hardware sin colgar la CPU\n    }\n\n    *out_data = (uint16_t)(SPI1->DR & 0xFFFFUL);\n    return BUS_STATUS_OK;\n}`,
        conclusion:
          'Esta estructura (Validación de punteros -> Bucle con cota fija -> Retorno de estado explícito) es el patrón estándar de toda rutina de bajo nivel en la industria espacial europea y americana.'
      },
      pitfalls: [
        {
          mistake: 'Usar memset(clave, 0, 32) al final de una función para borrar datos sensibles en RAM pensando que el compilador siempre lo ejecutará',
          whyItFails:
            'Si la variable local "clave" no vuelve a leerse después del memset, el optimizador de C (-O2) aplica "Dead-Store Elimination" y elimina por completo el borrado, incumpliendo la cláusula de sanitización ECSS-E-ST-40C 5.11.5.6g.',
          seniorFix: 'Realiza siempre el borrado de seguridad a través de un puntero calificado como volatile (volatile uint8_t *p = ...) o mediante memset_explicit() / explicit_bzero().'
        }
      ]
    },
    {
      id: 'm11-c3',
      chapterNumber: 'Capítulo 11.3',
      title: 'Verificación Crítica: Cobertura 100% MC/DC, Valores Frontera (n-1, n, n+1), Código Objeto y HSIA',
      subtitle: 'Cómo se prueba y certifica el software de Categoría A y B según ECSS-E-ST-40C (5.5.3.2c / 5.8.3.5) y ECSS-Q-ST-80C (6.2.2.8 / 6.2.3.7)',
      paragraphs: [
        'En el desarrollo espacial y aeronáutico, escribir código limpio es solo la mitad del trabajo; la otra mitad es demostrar matemáticamente que cada línea y cada condición booleana ha sido verificada. La cláusula ECSS-E-ST-40C 5.8.3.5b establece tres niveles progresivos de cobertura estructural de código durante las pruebas: 1) Cobertura de Sentencias (Statement Coverage): cada línea ejecutable de C se ha ejecutado al menos una vez; 2) Cobertura de Decisiones o Ramas (Decision / Branch Coverage): cada estructura condicional (if, while, switch) ha sido evaluada tanto a VERDADERO como a FALSO; y 3) Cobertura MC/DC (Modified Condition and Decision Coverage), obligatoria al 100% para Categoría A (y DO-178C DAL A).',
        '¿Qué significa exactamente 100% MC/DC y por qué es la pregunta estrella en entrevistas de aviónica y espacio? Si tienes una decisión con varias condiciones unidas por && y ||, como if ((A || B) && C), para lograr cobertura de Ramas (Branch) te bastaría con 2 casos de prueba (uno donde todo el if dé True y otro donde dé False). Pero eso no demuestra que las 3 variables funcionen bien por separado. MC/DC exige encontrar pares de vectores de test ("Independence Pairs") para CADA condición individual (A, B y C) de modo que, manteniendo fijas las demás condiciones, cambiar únicamente esa condición cambie el resultado final de la decisión. Para N condiciones booleanas en una decisión, MC/DC no requiere los 2^N casos de una tabla de verdad exhaustiva, sino únicamente un mínimo de (N + 1) casos de prueba cuidadosamente elegidos.',
        'Además, la normativa ECSS impone cuatro requisitos de verificación fundamentales: 1) Pruebas de Frontera (Cláusula 5.5.3.2c): todo límite numérico N debe probarse en (n - 1), (n) y (n + 1), además de entradas fuera de rango; 2) Trazabilidad de Código Objeto (Cláusula 5.8.3.5e): en Categoría A, si el compilador con optimizaciones genera instrucciones o saltos en ensamblador que no son directamente trazables desde el código fuente C, debes medir y justificar el 100% de cobertura sobre el propio ensamblador (Object Code); 3) Pruebas sobre Código No Instrumentado (ECSS-Q-ST-80C 6.2.3.7 y 6.3.5.20): como las herramientas de cobertura insertan sondas que alteran los tiempos del código, la validación final debe re-ejecutarse sobre el binario limpio de vuelo sin instrumentación ni parches; y 4) Análisis HSIA (Hardware-Software Interaction Analysis, ECSS-Q-ST-80C 6.2.2.8): verificar cómo reacciona el software cuando cualquier componente hardware falla (cortocircuito en pin, sensor mudo, memoria corrupta).'
      ],
      formulas: [
        {
          name: 'Número Mínimo de Casos de Prueba para lograr 100% de Cobertura MC/DC',
          expression: 'N_tests_minimo = N_condiciones + 1     (frente a 2^N de la tabla de verdad completa)',
          explanation: 'Por ejemplo, si un if crítico combina 4 sensores booleanos, la tabla de verdad tendría 2^4 = 16 combinaciones, pero con MC/DC bastan 4 + 1 = 5 vectores de prueba bien seleccionados para demostrar el efecto independiente de cada sensor.'
        },
        {
          name: 'Tripleta de Prueba en Valores Frontera (ECSS-E-ST-40C Cláusula 5.5.3.2c)',
          expression: 'Casos_Frontera(Límite N) = { N - 1,  N,  N + 1 }  +  { Min_Tipo, Max_Tipo }',
          explanation: 'Caza instantáneamente el error más común en condicionales C: confundir menor estricto (<) con menor o igual (<=) (Off-by-one error).'
        }
      ],
      table: {
        headers: ['Vector Test', 'Condición A (Sensor 1)', 'Condición B (Sensor 2)', 'Condición C (Armado)', 'Resultado: (A || B) && C', 'Par de Independencia MC/DC que Demuestra'],
        rows: [
          ['Test #1', '0 (False)', '1 (True)', '1 (True)', '1 (TRUE)', 'Junto con Test #2 demuestra B; junto con Test #3 demuestra C'],
          ['Test #2', '0 (False)', '0 (False)', '1 (True)', '0 (FALSE)', 'Par con Test #1 (cambia solo B -> cambia salida) y Par con Test #4 (cambia solo A)'],
          ['Test #3', '0 (False)', '1 (True)', '0 (False)', '0 (FALSE)', 'Par con Test #1: A=0 y B=1 fijos, cambia solo C (1->0) y la decisión cambia (1->0)'],
          ['Test #4', '1 (True)', '0 (False)', '1 (True)', '1 (TRUE)', 'Par con Test #2: B=0 y C=1 fijos, cambia solo A (0->1) y la decisión cambia (0->1)']
        ]
      },
      workedExample: {
        title: 'Ejemplo Resuelto: Selección de los 4 Vectores para Certificar 100% MC/DC en una Decisión de 3 Variables',
        problemStatement:
          'Tienes la condición de disparo de separación de etapa de un cohete: salida = (A || B) && C. Demuestra cómo con los 4 tests de la tabla superior (#1: 011->1, #2: 001->0, #3: 010->0, #4: 101->1) logras 100% MC/DC para A, B y C.',
        steps: [
          '1. Prueba de independencia de A: Comparamos Test #2 (A=0, B=0, C=1 -> Salida=0) con Test #4 (A=1, B=0, C=1 -> Salida=1). B y C permanecieron fijos, cambió solo A y cambió la salida. ¡Condición A verificada!',
          '2. Prueba de independencia de B: Comparamos Test #2 (A=0, B=0, C=1 -> Salida=0) con Test #1 (A=0, B=1, C=1 -> Salida=1). A y C permanecieron fijos, cambió solo B y cambió la salida. ¡Condición B verificada!',
          '3. Prueba de independencia de C: Comparamos Test #3 (A=0, B=1, C=0 -> Salida=0) con Test #1 (A=0, B=1, C=1 -> Salida=1). A y B permanecieron fijos, cambió solo C y cambió la salida. ¡Condición C verificada (100% MC/DC completado)!'
        ],
        codeOrMath: `// Los 4 vectores unitarios que logran 100% MC/DC sobre (A || B) && C:\nassert(decision_vuelo(false, true,  true)  == true);  // Test #1 (0,1,1) -> 1\nassert(decision_vuelo(false, false, true)  == false); // Test #2 (0,0,1) -> 0\nassert(decision_vuelo(false, true,  false) == false); // Test #3 (0,1,0) -> 0\nassert(decision_vuelo(true,  false, true)  == true);  // Test #4 (1,0,1) -> 1`,
        conclusion:
          'En el Laboratorio Interactivo 9 puedes pulsar estos mismos vectores de prueba en vivo y ver cómo el auditor MC/DC ilumina cada condición independiente.'
      },
      pitfalls: [
        {
          mistake: 'Entregar informes de tiempos (WCET) y pruebas de validación medidos únicamente con el binario instrumentado por gcov',
          whyItFails:
            'La instrumentación de cobertura añade instrucciones en cada rama que hinchan la Flash y alteran la temporización real de las interrupciones, violando las cláusulas ECSS-Q-ST-80C 6.2.3.7 y 6.2.3.8.',
          seniorFix: 'Usa el binario instrumentado para medir cobertura estructural, pero ejecuta siempre la validación temporal y funcional definitiva sobre el binario de vuelo limpio (non-instrumented code).'
        }
      ]
    },
    {
      id: 'm11-c4',
      chapterNumber: 'Capítulo 11.4',
      title: 'Fundamentos de Hardware Espacial (Rad-Hard): Radiación Cósmica (SEU / SEL), EDAC, Scrubbing, TMR y Márgenes ECSS',
      subtitle: 'Qué le hacen los protones y partículas pesadas al silicio en órbita y las fórmulas oficiales de memoria y CPU de ECSS-E-ST-40C Annex M',
      paragraphs: [
        'Fuera de la atmósfera protectora de la Tierra (o a gran altitud en aviación), los microcontroladores son bombardeados constantemente por protones atrapados en los cinturones de Van Allen, vientos solares e iones pesados de rayos cósmicos galácticos. Cuando una partícula cargada atraviesa el silicio de un chip, deposita una nube de carga eléctrica (par electrón-hueco) que provoca Efectos de Evento Único (SEE — Single Event Effects). Todo ingeniero de firmware espacial debe conocer los tres efectos principales: 1) SEU (Single Event Upset): la partícula golpea un transistor de una celda SRAM o un Flip-Flop de un registro y conmuta su estado lógico de 0 a 1 o de 1 a 0 (un "Bit-Flip" suave que no daña el chip físicamente pero corrompe tus variables o punteros); 2) MBU (Multiple Bit Upset): un solo impacto invierte 2 o más bits adyacentes; y 3) SEL (Single Event Latch-up): la partícula dispara un tiristor parásito interno entre VDD y GND creando un cortocircuito destructivo que funde el chip en milisegundos salvo que un circuito limitador de corriente corte y reinicie la alimentación.',
        '¿Cómo se defiende el hardware y el software frente a los Bit-Flips (SEU)? Con tres barreras complementarias: 1) Memoria EDAC (Error Detection And Correction) con códigos Hamming SEC-DED (Single Error Correction, Double Error Detection): por cada palabra de 32 bits de datos en SRAM se almacenan 7 u 8 bits extra de paridad que corrigen al vuelo cualquier error de 1 bit y detectan errores de 2 bits lanzando una interrupción; 2) Memory Scrubbing (Barrido de Memoria): si un SEU invierte 1 bit en una dirección de RAM que la CPU no lee en horas, podría caer un segundo protón en esa misma palabra convirtiéndolo en un error incorregible de 2 bits. Por eso una tarea o motor hardware de Scrubbing lee periódicamente toda la RAM en segundo plano y reescribe las palabras corregidas; y 3) TMR (Triple Modular Redundancy — Votación 2-de-3): tanto a nivel de transistores en procesadores Rad-Hard (como LEON3FT / GR712RC / GR740 / Vorago Cortex-M) como en software C guardando 3 copias de cada variable crítica y aplicando el votador booleano: (a & b) | (b & c) | (a & c).',
        'Finalmente, la norma ECSS-E-ST-40C Rev.1 (Cláusulas 5.3.8.2, 5.8.3.11 y Anexo M <5.2> y <5.3>, págs. 187-188) exige calcular y mantener en el informe de presupuestos técnicos (Technical Budget Report) dos ecuaciones matemáticas fundamentales: el Margen de Memoria (margin_memory) y el Factor de Planificabilidad de CPU (Schedulability Factor S) para cada tarea en tiempo real.'
      ],
      formulas: [
        {
          name: 'Ecuación Booleana de Votación Mayoritaria 2-de-3 (TMR — Triple Modular Redundancy)',
          expression: 'Voto_Mayoría(A, B, C) = (A & B) | (B & C) | (A & C)',
          explanation: 'Evalúa los 32 bits de las tres copias en paralelo sin usar condicionales (branchless). Si cualquier copia (A, B o C) sufre un bit-flip por radiación, las otras dos ganan la votación y restauran el bit original.'
        },
        {
          name: 'Fórmula Oficial del Margen de Memoria (ECSS-E-ST-40C Annex M <5.2>, pág. 187)',
          expression: 'margin_memory = free_size / total_size     (En porcentaje: (free_size * 100) / total_size)',
          explanation: 'Donde free_size = total_size - used_size. En las revisiones preliminares de diseño (PDR) de la ESA se exige típicamente un margen libre >= 50% de Flash y SRAM para absorber el crecimiento del proyecto.'
        },
        {
          name: 'Fórmula Oficial del Factor de Planificabilidad Temporal (ECSS-E-ST-40C Annex M <5.3>, pág. 188)',
          expression: 'S_i = (C_i + I_i + B_i) / D_i   <= 1.0',
          explanation: 'Donde C_i es el Tiempo de Ejecución en el Peor Caso (WCET) de la tarea i, I_i es la interferencia máxima por preempción de tareas/ISRs más prioritarias, B_i es el bloqueo máximo esperando recursos compartidos (Mutex/Secciones Críticas) y D_i es el Deadline. Para que el sistema sea planificable en tiempo real duro, S_i jamás debe superar 1.0 (100%).'
        }
      ],
      table: {
        headers: ['Fenómeno / Técnica Espacial', 'Significado Físico en Silicio', 'Efecto sobre tu Programa en C', 'Mitigación Normativa (ECSS / NASA)'],
        rows: [
          ['SEU (Single Event Upset)', 'Un protón o ion pesado invierte 1 bit en una celda SRAM o registro (0->1 o 1->0)', 'Una variable cambia de valor sola o un estado de FSM toma un valor ilegal', 'EDAC Hamming SEC-DED + Votación TMR 2-de-3 + Memory Scrubbing periódico + default: defensivo'],
          ['MBU (Multiple Bit Upset)', 'Una partícula energética invierte 2 o más bits físicamente vecinos en la misma palabra', 'Supera la corrección simple SEC de 1 bit; el hardware EDAC levanta excepción de doble error', 'Entrelazado físico de bits (Bit Interleaving) + Reinicio controlado en Modo Seguro (Safe Mode)'],
          ['SEL (Single Event Latch-up)', 'Cortocircuito parásito de alta corriente entre VDD y GND inducido por radiación', 'Calentamiento extremo y destrucción permanente del microcontrolador en milisegundos', 'Hardware Rad-Hard (tecnología SOI / Epitaxial) o sensor de sobrecorriente que corta VDD al instante'],
          ['EDAC + Memory Scrubbing', 'Lectura y corrección periódica de toda la memoria SRAM en segundo plano', 'Evita que se acumulen dos SEUs distintos en la misma palabra con el paso de las horas', 'Tarea cíclica de baja prioridad o controlador DMA/EDAC dedicado que barre la RAM cada pocos segundos']
        ]
      },
      workedExample: {
        title: 'Ejemplo Resuelto: Cálculo de Certificación ECSS de Margen de Memoria y Factor de Planificabilidad S',
        problemStatement:
          'Tu computador de a bordo tiene 256 KB de SRAM total y el firmware usa 102,4 KB. Además, la tarea crítica de Control de Actitud (AOCS) tiene un Deadline D = 10 ms (10.000 µs), su WCET medido es C = 2.500 µs, sufre una interferencia máxima de ISRs de mayor prioridad I = 1.800 µs y un bloqueo máximo por secciones críticas B = 700 µs. Calcula margin_memory y el Factor S según ECSS-E-ST-40C Annex M.',
        steps: [
          '1. Cálculo del Margen de Memoria (ECSS Annex M <5.2>): free_size = 256 KB - 102,4 KB = 153,6 KB libres. Aplicamos la fórmula: margin_memory = 153,6 / 256 = 0,60 (60% de memoria libre). ¡Cumple holgadamente el requisito espacial >= 50%!',
          '2. Cálculo del Tiempo de Respuesta en Peor Caso (Worst-Case Response Time): R = C + I + B = 2.500 + 1.800 + 700 = 5.000 µs (5 ms).',
          '3. Cálculo del Factor de Planificabilidad S (ECSS Annex M <5.3>): S = (C + I + B) / D = 5.000 µs / 10.000 µs = 0,50 (50% del Deadline). Como S <= 1.0 (y deja un 50% de margen temporal), la tarea es 100% planificable y determinista.'
        ],
        codeOrMath: `// Fórmulas ECSS-E-ST-40C Annex M <5.2> y <5.3> para tu cuaderno:\nmargin_memory = free_size / total_size = (256 - 102.4) / 256 = 0.60 (60% Libre)\n\nS_aocs = (C + I + B) / D = (2500 us + 1800 us + 700 us) / 10000 us = 5000 / 10000 = 0.50 (<= 1.0 OK)`,
        conclusion:
          'Con estas dos fórmulas del Anexo M de ECSS-E-ST-40C Rev.1 puedes defender numéricamente el dimensionamiento de RAM, Flash y tiempo real de cualquier proyecto aeroespacial.'
        },
      pitfalls: [
        {
          mistake: 'Confiar únicamente en que la memoria tiene corrección EDAC sin activar nunca el barrido periódico (Memory Scrubbing)',
          whyItFails:
            'El circuito EDAC solo corrige un bit invertido cuando la CPU LEE esa dirección. Si una tabla en RAM pasa días sin leerse y recibe dos impactos de radiación seguidos en la misma palabra (2 bits corruptos), el código SEC-DED ya no podrá corregirlo cuando por fin intentes leerla.',
          seniorFix: 'Implementa siempre un bucle de Scrubbing en segundo plano que lea (y fuerce la reescritura corregida si hubo SEU) unos cuantos kilobytes de SRAM en cada ciclo hasta recorrer toda la memoria cada pocos segundos.'
        }
      ]
    }
  ]
};
