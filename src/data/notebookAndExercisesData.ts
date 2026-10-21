/**
 * @file notebookAndExercisesData.ts
 * @description Diccionario técnico, reglas de oro (incluyendo cláusulas oficiales ECSS, NASA JPL,
 * DO-178C y MISRA-C), guías de dibujo de esquemas para cuaderno físico, plantillas de código C
 * comentadas línea a línea, retos prácticos de programación C evaluados en tiempo real
 * (`codingChallenges`) y baterías de preguntas de autoevaluación (`extraQuizzes`).
 *
 * Política de mantenimiento:
 * - Nunca eliminar definiciones, reglas, retos ni preguntas existentes; ampliar siempre de forma aditiva.
 * - Los retos `codingChallenges` son verificados por `evaluateEmbeddedCCode` comparando el valor
 *   final sin signo (`>>> 0`) contra `expectedRegValue`.
 */

/**
 * Definición formal de un concepto de C o de arquitectura hardware junto con su realidad en silicio.
 */
export interface NotebookDefinition {
  /** Término técnico (ej. `Calificador volatile`, `Single Event Upset (SEU)`). */
  term: string;
  /** Definición teórica rigurosa para transcribir al cuaderno. */
  definition: string;
  /** Qué ocurre físicamente en los transistores, buses, biestables o registros de la CPU. */
  siliconReality: string;
  /** Línea o bloque breve de código C canónico que ejemplifica el término. */
  exampleToCopy: string;
}

/**
 * Regla de oro, fórmula matemática de diseño o requisito normativo (ECSS / NASA / MISRA-C).
 */
export interface NotebookGoldenRule {
  /** Título de la regla o referencia normativa. */
  title: string;
  /** Expresión matemática, patrón de código C o mandato normativo (`SHALL` / `SHALL NOT`). */
  formulaOrRule: string;
  /** Explicación detallada de por qué existe la regla y qué fallo previene. */
  explanation: string;
}

/**
 * Reto práctico de escritura de expresiones C evaluado en vivo sobre un registro de 8 o 32 bits.
 */
export interface CodingChallengeDef {
  /** Nivel de dificultad dentro de la progresión de 3 retos del módulo. */
  levelLabel: 'Nivel 1: Base' | 'Nivel 2: Intermedio' | 'Nivel 3: Experto';
  /** Título descriptivo del ejercicio. */
  title: string;
  /** Enunciado con los bits o campos exactos que deben modificarse. */
  instruction: string;
  /** Valor inicial del registro (`REG`) antes de ejecutar el código del usuario. */
  initialRegValue: number;
  /** Anchura en bits del registro simulado (`8` o `32`). */
  regWidth: 8 | 32;
  /** Valor numérico exacto que debe contener `REG` tras evaluar las sentencias C para dar por superado el reto. */
  expectedRegValue: number;
  /** Código inicial que aparece precargado en el editor del reto. */
  starterCode: string;
  /** Pista opcional paso a paso. */
  hint: string;
  /** Solución canónica en C embebido. */
  solutionCode: string;
  /** Explicación de las máscaras y desplazamientos empleados en la solución. */
  explanation: string;
}

/**
 * Pregunta adicional de autoevaluación categorizada por habilidad cognitiva.
 */
export interface ExtraQuizItem {
  id: string;
  difficulty: 'Traza Mental' | 'Lectura Datasheet' | 'Caza del Bug';
  question: string;
  options: {
    id: string;
    label: string;
    isCorrect: boolean;
    feedback: string;
  }[];
}

/**
 * Contenido extendido de estudio, cuaderno físico y práctica para un módulo del curso.
 */
export interface ModuleExtendedContent {
  moduleId: number;
  notebookSummaryTitle: string;
  whyWriteThisDown: string;
  definitions: NotebookDefinition[];
  goldenRules: NotebookGoldenRule[];
  sketchDiagramSteps: string[];
  annotatedCodeToCopy: {
    code: string;
    lineNotes: string[];
  };
  codingChallenges: CodingChallengeDef[];
  extraQuizzes: ExtraQuizItem[];
}

/**
 * Diccionario indexado por `moduleId` (`0` a `11`) con todo el material de referencia,
 * retos prácticos de código C en 3 niveles y preguntas de autoevaluación.
 */
export const MODULE_EXTENDED_DATA: Record<number, ModuleExtendedContent> = {
  // =========================================================================
  // MÓDULO 0
  // =========================================================================
  0: {
    moduleId: 0,
    notebookSummaryTitle: 'Teoría Módulo 0: Variables, Hexadecimal, Funciones, Punteros (& / *) y Estructuras (struct / ->)',
    whyWriteThisDown:
      'Estos conceptos son los cimientos de todo el lenguaje C. Tener claras las diferencias entre valor y dirección (&), desreferencia (*), punto (.) y flecha (->) hace que el código de sistemas embebidos sea transparente.',
    definitions: [
      {
        term: 'Variable y Dirección de Memoria',
        definition:
          'Una variable es un nombre simbólico asignado a una o varias celdas contiguas de memoria RAM. Toda variable en C posee 4 atributos: Nombre, Tipo (cuántos bytes ocupa), Valor (qué número guarda dentro) y Dirección (en qué número de casilla vive).',
        siliconReality:
          'El procesador ignora el nombre de la variable; al compilar, cada variable se traduce en su dirección hexadecimal de memoria (ej. 0x20000004).',
        exampleToCopy: 'uint16_t rpm = 1500U; // Ocupa 2 bytes en RAM (ej. en 0x20000004)'
      },
      {
        term: 'Sistema Hexadecimal (Prefijo 0x) y Binario (Prefijo 0b)',
        definition:
          'Sistema de numeración en base 16 (dígitos 0..9 y A..F, donde A=10 y F=15). Cada dígito hexadecimal representa exactamente 4 bits (1 nibble), por lo que 2 dígitos hexadecimales representan exactamente 1 byte (8 bits).',
        siliconReality:
          '0xFF en binario es 1111_1111 (todos los bits encendidos). 0x00 es 0000_0000. Las direcciones de memoria y máscaras se escriben siempre en hexadecimal por compacidad.',
        exampleToCopy: 'uint8_t mask = 0xA5U; // 0xA (1010) y 0x5 (0101) -> 0b10100101'
      },
      {
        term: 'Puntero (*ptr) y Operador Dirección (&)',
        definition:
          'Un puntero es una variable cuyo contenido NO es un dato normal, sino la DIRECCIÓN de memoria donde vive otra variable o un registro de hardware. Con "&variable" obtenemos su dirección; con "*puntero" entramos a esa dirección para leer o cambiar su valor.',
        siliconReality:
          'En un MCU de 32 bits (ARM Cortex-M o RISC-V), cualquier puntero ocupa siempre 4 bytes porque las direcciones tienen 32 bits.',
        exampleToCopy: 'uint32_t x = 10; uint32_t *p = &x; *p = 20; // Ahora x vale 20'
      },
      {
        term: 'Funciones: Paso por Valor vs Paso por Referencia (Puntero)',
        definition:
          'En C todos los argumentos se pasan por valor (haciendo una copia temporal en la pila Stack). Para que una función modifique la variable original del llamador o para evitar copiar estructuras grandes, se pasa un puntero con su dirección.',
        siliconReality:
          'Pasar un puntero (const MiStruct *cfg) envía la dirección en un único registro de la CPU (R0) en 1 ciclo de reloj en lugar de clonar decenas de bytes en RAM.',
        exampleToCopy: 'void calibrar(int16_t *p_offset) { *p_offset = 0; }'
      },
      {
        term: 'Estructura (struct), typedef y Operador Flecha (->)',
        definition:
          'Un struct empaqueta varias variables (miembros) en un bloque continuo de memoria. Con "typedef" le damos un nombre de tipo limpio. Si accedemos desde una variable struct usamos el punto (.); si accedemos desde un PUNTERO al struct usamos la flecha (->).',
        siliconReality:
          'Los fabricantes definen un struct con todos los registros de un periférico y apuntan un puntero a la dirección base del periférico (ej. GPIOA->ODR).',
        exampleToCopy: 'p_sensor->temperatura = 25; // Equivalente a (*p_sensor).temperatura = 25;'
      },
      {
        term: 'Palabra clave "static" en C Embebido',
        definition:
          'Tiene dos usos fundamentales: 1) Dentro de una función, hace que la variable local conserve su valor en memoria SRAM entre llamadas sin destruirse al salir. 2) Fuera de las funciones, hace que la variable o función sea privada a ese archivo .c.',
        siliconReality:
          'Una variable local normal vive temporalmente en el Stack; una variable local "static" vive permanentemente en la sección .data/.bss de la SRAM.',
        exampleToCopy: 'static uint32_t contador_ciclos = 0UL; // Privada y persistente'
      },
      {
        term: 'Sufijos de Tipos Literales (U, UL, ULL) en Silicio',
        definition:
          'En C estándar, un número desnudo como 1 es un entero con signo (signed int). Los sufijos indican explícitamente al compilador el tipo del literal: "U" (Unsigned, sin signo), "L" (Long, al menos 32 bits), "UL" (Unsigned Long de 32 bits) y "ULL" (Unsigned Long Long de 64 bits).',
        siliconReality:
          'En procesadores de 32 bits, el bit 31 es el bit de signo negativo. Desplazar un entero con signo al bit 31 (1 << 31) provoca desbordamiento de signo y Comportamiento Indefinido (Undefined Behavior). Usar 1UL garantiza aritmética sin signo limpia.',
        exampleToCopy: 'uint32_t bit31 = (1UL << 31); // 0x80000000 seguro y sin signo'
      },
      {
        term: 'Las 6 Operaciones Sagradas de Bits (Bitwise Idioms)',
        definition:
          'Las 6 fórmulas universales de álgebra de Boole para manipular registros: 1) SET con OR (|=), 2) CLEAR con AND y NOT complementario (&= ~), 3) TOGGLE con XOR (^=), 4) READ con desplazamiento y AND (>> n & 1UL), 5) TEST 1 (& (1<<n) != 0), y 6) TEST 0 (& (1<<n) == 0).',
        siliconReality:
          'Se ejecutan directamente en la Unidad Aritmético-Lógica (ALU) del microcontrolador en 1 ciclo de reloj de máquina.',
        exampleToCopy: 'REG |= (1UL << 5);  REG &= ~(1UL << 5);  REG ^= (1UL << 5);'
      },
      {
        term: 'Despiece del Puntero MMIO (*(volatile uint32_t *)0x...) en 3 Capas',
        definition:
          'El modismo canónico para controlar registros de hardware desde C: Capa 1: Dirección física hexadecimal (0x40020014UL). Capa 2: Casteo a puntero volátil (volatile uint32_t *). Capa 3: Operador exterior de desreferencia (*) para escribir o leer en silicio.',
        siliconReality:
          'El número de la Capa 1 viaja directamente por las pistas del bus de direcciones AHB/APB activando los transistores del periférico.',
        exampleToCopy: '#define GPIOA_ODR (*(volatile uint32_t *)0x40020014UL)'
      },
      {
        term: 'Calificador "volatile" Básico en Registros de Silicio',
        definition:
          'Instrucción al compilador que prohíbe optimizar, almacenar en caché interna de la CPU (R0..R12) o eliminar lecturas y escrituras consecutivas sobre una dirección de memoria.',
        siliconReality:
          'Sin volatile, el optimizador (-O2) elimina escrituras consecutivas considerándolas "código muerto" o cachea una lectura, impidiendo detectar cambios externos en los pines.',
        exampleToCopy: 'volatile uint32_t *p_pin_status = (volatile uint32_t *)0x40020010UL;'
      },
      {
        term: 'Punteros con const: const T * vs T * const',
        definition:
          'La posición de "const" respecto al asterisco fija qué elemento no puede cambiar: "const uint8_t *p" indica que el dato apuntado es constante (memoria Flash ROM), mientras que "uint32_t * const p" indica que la dirección de memoria es fija y permanente (dirección de un registro MMIO).',
        siliconReality:
          'const T * protege datos grabados en Flash de ser sobrescritos. T * const asegura que el puntero siempre señale al periférico sin desviarse por accidente.',
        exampleToCopy: 'const uint8_t *lut = &sin_table[0];  uint32_t * const reg = (uint32_t *)0x40020014UL;'
      },
      {
        term: 'Instrucción (void)variable (Silenciamiento y Dummy Read)',
        definition:
          'Técnica que cumple dos objetivos: 1) Silenciar advertencias del compilador (-Wunused-variable o -Wunused-parameter) en interfaces estrictas. 2) Forzar lecturas dummy en buses de silicio (APB/AHB) para asegurar la propagación de reloj tras activar un periférico en RCC.',
        siliconReality:
          'Una lectura dummy como (void)RCC->AHB1ENR fuerza a la CPU a esperar 2 ciclos de bus hasta que la señal de reloj llega físicamente al periférico antes de usarlo.',
        exampleToCopy: '(void)unused_arg;  (void)RCC->AHB1ENR; // Espera de bus obligatoria'
      },
      {
        term: 'Operador sizeof() en Tiempo de Compilación',
        definition:
          'Operador intrínseco del compilador que devuelve el tamaño en bytes de un tipo o variable. NO es una función y se resuelve íntegramente al compilar.',
        siliconReality:
          'Cuesta 0 ciclos de CPU y 0 bytes de RAM en tiempo de ejecución: el compilador inserta directamente el número constante (ej. un 4 para uint32_t).',
        exampleToCopy: 'uint32_t len = sizeof(uint32_t); // El compilador escribe un 4 literal'
      }
    ],
    goldenRules: [
      {
        title: 'Regla MISRA-C 10.1: Sufijo "UL" Obligatorio en Desplazamientos de Bits',
        formulaOrRule: '(1UL << n)   [NUNCA: (1 << n)]',
        explanation: 'En procesadores de 32 bits, desplazar un entero con signo al bit 31 produce desbordamiento de signo (Undefined Behavior). Usa siempre 1UL para garantizar que el cálculo se evalúe sin signo.'
      },
      {
        title: 'Las 6 Operaciones Sagradas de Bits para Copiar a la Libreta',
        formulaOrRule: 'SET: |= (1UL<<n) | CLEAR: &= ~(1UL<<n) | TOGGLE: ^= (1UL<<n) | READ: (>>n)&1UL | TEST_1: (&(1UL<<n))!=0 | TEST_0: (&(1UL<<n))==0',
        explanation: 'Aprende de memoria este sexteto: son las únicas 6 operaciones que necesitas para escribir cualquier driver de periféricos en el mundo.'
      },
      {
        title: 'Despiece de las 3 Capas del Puntero MMIO',
        formulaOrRule: '*(volatile uint32_t *)0x40020014UL  ===>  [Capa 3: * Acceso] [Capa 2: (volatile uint32_t *) Molde] [Capa 1: 0x40020014UL Dirección]',
        explanation: 'La Capa 1 es la dirección física de silicio, la Capa 2 es el casteo a puntero volátil que prohíbe la caché en registros, y la Capa 3 es el asterisco de desreferencia para leer o escribir.'
      },
      {
        title: 'Regla Mnemotécnica de const con Punteros (Lee de Derecha a Izquierda)',
        formulaOrRule: 'const T * p  (p es puntero a dato const)   vs   T * const p  (p es puntero const a dato variable)',
        explanation: 'Si const está antes de *, el dato está congelado (en Flash ROM). Si const está después de *, el puntero está congelado (dirección física fija de silicio).'
      },
      {
        title: 'Uso de (void) para Dummy Reads en Buses APB/AHB',
        formulaOrRule: 'RCC->AHB1ENR |= (1UL << 0);   (void)RCC->AHB1ENR;',
        explanation: 'Tras habilitar el reloj de un periférico, se requiere una lectura dummy forzada para consumir 2 ciclos de bus antes de acceder a los registros del periférico y evitar HardFault.'
      },
      {
        title: 'sizeof() Cuesta Cero Ciclos de CPU y Cero RAM',
        formulaOrRule: 'sizeof(tipo_o_variable)  ===>  Evaluado 100% por el Compilador',
        explanation: 'Nunca temas usar sizeof() en bucles o comprobaciones de límites: el compilador reemplaza la expresión por una constante entera inmediata en tiempo de compilación.'
      },
      {
        title: 'Tabla de Conversión Rápida Hexadecimal <-> Binario (Nibble de 4 bits)',
        formulaOrRule: '0x0=0000 | 0x1=0001 | 0x2=0010 | 0x4=0100 | 0x8=1000 | 0xA=1010 | 0xC=1100 | 0xF=1111',
        explanation: 'Observa que las potencias de dos dentro de cada grupo de 4 bits son siempre 1 (bit 0), 2 (bit 1), 4 (bit 2) y 8 (bit 3).'
      },
      {
        title: 'Regla de Oro de los Punteros (& vs *)',
        formulaOrRule: '& = "¿En qué dirección vives?"   |   * = "Entra en esa dirección y accede al contenido"',
        explanation: 'En una declaración (uint32_t *p;) el asterisco indica que p es de tipo puntero. En una expresión (*p = 5;) el asterisco desreferencia el puntero.'
      },
      {
        title: 'Regla del Punto (.) frente a la Flecha (->) en Estructuras',
        formulaOrRule: 'variable_struct.campo   <===>   puntero_a_struct->campo   <===>   (*puntero_a_struct).campo',
        explanation: 'Siempre que tengas una variable normal usa punto (.); siempre que tengas un puntero (dirección de memoria) usa flecha (->).'
      },
      {
        title: 'Regla de Macros Seguras en el Preprocesador (#define)',
        formulaOrRule: '#define MACRO(a, b)  ( ((a) + (b)) * 2U )',
        explanation: 'Rodea siempre cada parámetro con paréntesis individuales y toda la macro con un paréntesis exterior.'
      },
      {
        title: 'Normativa Espacial ECSS-E-ST-40C (Annex U.2 #9, #10, #13) & NASA JPL (Reglas 6, 8, 9)',
        formulaOrRule: 'PROHIBIDO: Variables sin inicializar, >1 nivel de puntero (**p) o desreferenciar sin comprobar p != NULL.',
        explanation: 'En software espacial/defensa toda variable se inicializa al declararse, el preprocesador se limita a constantes/macros simples y todo puntero recibido por una función se valida contra NULL antes de usar *p o p->.'
      }
    ],
    sketchDiagramSteps: [
      'Dibuja el despiece del puntero MMIO en 3 capas horizontales: 1) Capa inferior: 0x40020014UL (coordenada física). 2) Capa intermedia: (volatile uint32_t *) (molde de puntero a 32 bits volátil). 3) Capa superior: * (llave que abre la casilla para leer o escribir).',
      'Dibuja dos cajas en la memoria RAM: la Caja A en la dirección 0x2000_0000 llamada "voltaje" con el valor 3300 dentro.',
      'Al lado dibuja la Caja B en la dirección 0x2000_0004 llamada "ptr" (un puntero) y escribe dentro de ella el número 0x2000_0000.',
      'Dibuja una flecha desde la Caja B ("ptr") apuntando a la Caja A ("voltaje"): escribe encima de la flecha "*ptr = 5000 cambia el contenido de la Caja A".',
      'Debajo dibuja un bloque grande llamado "struct GPIO_TypeDef" dividido en casillas de 4 bytes: +0x00 MODER, +0x04 OTYPER, +0x14 ODR.'
    ],
    annotatedCodeToCopy: {
      code: `#include <stdint.h>

// 1. Definimos el molde de una estructura de hardware o datos:
typedef struct {
    uint32_t MODO;      // Offset +0 bytes
    uint32_t SALIDA;    // Offset +4 bytes
} Periferico_t;

// 2. Función que recibe un PUNTERO a la estructura:
void activar_periferico(Periferico_t *p_dev, uint32_t valor) {
    p_dev->MODO   = 1UL;     // Usa '->' porque p_dev es un puntero
    p_dev->SALIDA = valor;   // Modifica la memoria original sin hacer copias
}

void ejemplo_completo(void) {
    Periferico_t motor = { 0UL, 0UL };
    activar_periferico(&motor, 0xFFUL); // '&' pasa la dirección de 'motor'
}`,
      lineNotes: [
        'typedef struct { ... } Periferico_t;: Crea un nuevo tipo de dato para no tener que repetir la palabra struct cada vez.',
        'Periferico_t *p_dev: Recibe únicamente la dirección de memoria donde empieza la estructura.',
        '&motor: El operador ampersand (&) obtiene la dirección en RAM de la estructura motor y se la entrega a la función.'
      ]
    },
    codingChallenges: [
      {
        levelLabel: 'Nivel 1: Base',
        title: 'Reto 0.1 — Literales Hexadecimales y Bytes en un Registro',
        instruction:
          'Asigna al registro REG el valor hexadecimal cuyo byte alto [15:8] sea 0xAB y cuyo byte bajo [7:0] sea 0xCD (Resultado esperado: 0x0000ABCD).',
        initialRegValue: 0x00000000,
        regWidth: 32,
        expectedRegValue: 0x0000abcd,
        starterCode: 'REG = 0x0000;',
        hint: 'Escribe directamente: REG = 0xABCD;',
        solutionCode: 'REG = 0xABCD;',
        explanation:
          'En hexadecimal cada par de dígitos representa 1 byte (8 bits): 0xAB ocupa los bits [15:8] y 0xCD ocupa los bits [7:0].'
      },
      {
        levelLabel: 'Nivel 2: Intermedio',
        title: 'Reto 0.2 — Empaquetar 2 Bytes Separados en una Palabra de 16 Bits',
        instruction:
          'Tienes dos bytes recibidos de un sensor: byte_alto = 0x12 y byte_bajo = 0x34. Desplaza 0x12 ocho bits a la izquierda y únelo con 0x34 usando OR para guardar 0x00001234 en REG.',
        initialRegValue: 0x00000000,
        regWidth: 32,
        expectedRegValue: 0x00001234,
        starterCode: 'REG = (0x12 << 4) | 0x34;',
        hint: 'Un byte tiene 8 bits, así que debes desplazar 8 posiciones: REG = (0x12 << 8) | 0x34;',
        solutionCode: 'REG = (0x12 << 8) | 0x34;',
        explanation:
          '(0x12 << 8) se convierte en 0x1200. Al hacer OR con 0x34 obtenemos la palabra de 16 bits reconstituida: 0x1234.'
      },
      {
        levelLabel: 'Nivel 3: Experto',
        title: 'Reto 0.3 — Cálculo de Dirección Física de un Miembro de struct',
        instruction:
          'El periférico GPIOA empieza en 0x40020000. Su registro ODR es el 6º elemento uint32_t del struct (índice 5, por lo que su offset es 5 * 4 bytes = 20 = 0x14). Escribe la suma en C para dejar en REG la dirección exacta de GPIOA->ODR (0x40020014).',
        initialRegValue: 0x00000000,
        regWidth: 32,
        expectedRegValue: 0x40020014,
        starterCode: 'REG = 0x40020000 + (5 * 1);',
        hint: 'Multiplica el índice 5 por los 4 bytes que ocupa cada uint32_t: REG = 0x40020000 + (5 * 4);',
        solutionCode: 'REG = 0x40020000 + (5 * 4);',
        explanation:
          '5 * 4 bytes = 20 en decimal, que en hexadecimal es 0x14. Por eso GPIOA->ODR vive exactamente en 0x40020014.'
      }
    ],
    extraQuizzes: [
      {
        id: 'm0-q1',
        difficulty: 'Traza Mental',
        question: 'Si ejecutas: uint8_t a = 10; uint8_t *p = &a; *p = 25; ¿qué valor tiene la variable "a" al terminar?',
        options: [
          {
            id: 'a',
            label: 'a vale 25, porque p apuntaba a la dirección de "a" y *p = 25 modificó el contenido de esa dirección.',
            isCorrect: true,
            feedback: '¡Exacto! p guardó la dirección de memoria de "a" (&a), y al hacer *p = 25 escribimos directamente en la casilla de memoria de "a".'
          },
          {
            id: 'b',
            label: 'a sigue valiendo 10 porque solo cambiamos el puntero p.',
            isCorrect: false,
            feedback: 'Si hubiéramos escrito p = ... habríamos cambiado el puntero, pero al poner el asterisco (*p = 25) cambiamos la variable apuntada.'
          }
        ]
      },
      {
        id: 'm0-q2',
        difficulty: 'Lectura Datasheet',
        question: 'En una estructura typedef struct { uint32_t A; uint32_t B; uint32_t C; } Regs_t; que empieza en la dirección base 0x40000000, ¿en qué dirección física exacta vive el miembro C?',
        options: [
          {
            id: 'a',
            label: 'En 0x40000008 (porque cada uint32_t ocupa 4 bytes: A en +0x00, B en +0x04 y C en +0x08).',
            isCorrect: true,
            feedback: '¡Brillante! Como cada uint32_t tiene 32 bits (4 bytes), las direcciones avanzan de 4 en 4 bytes.'
          },
          {
            id: 'b',
            label: 'En 0x40000002.',
            isCorrect: false,
            feedback: 'Las direcciones de memoria se numeran byte a byte, y cada uint32_t ocupa 4 bytes (32 bits / 8 bits por byte = 4).'
          }
        ]
      },
      {
        id: 'm0-q3',
        difficulty: 'Caza del Bug',
        question: 'Un compañero escribe: for (uint8_t i = 0; i <= 255; i++) { procesar(i); } ¿Qué ocurre al ejecutar este bucle en el microcontrolador?',
        options: [
          {
            id: 'a',
            label: 'Es un bucle infinito: cuando i vale 255 y hace i++, sufre overflow en 8 bits y vuelve a 0, por lo que i <= 255 es SIEMPRE verdadero.',
            isCorrect: true,
            feedback: '¡Cazado! Un uint8_t jamás puede valer 256 para romper la condición i <= 255. Al sumar 1 a 255 da la vuelta a 0.'
          },
          {
            id: 'b',
            label: 'Se ejecuta 256 veces y termina limpiamente.',
            isCorrect: false,
            feedback: 'Para recorrer de 0 a 255 inclusive necesitas un contador uint16_t.'
          }
        ]
      },
      {
        id: 'm0-q4',
        difficulty: 'Traza Mental',
        question: 'En un procesador ARM Cortex-M o RISC-V (Little-Endian), guardas uint32_t x = 0xAABBCCDD; en la dirección 0x20000000. Si lees solo el primer byte con *(uint8_t *)0x20000000, ¿qué obtienes?',
        options: [
          {
            id: 'a',
            label: '0xDD (el byte menos significativo se guarda en la primera dirección en arquitecturas Little-Endian).',
            isCorrect: true,
            feedback: '¡Exacto! En Little-Endian el byte menos significativo (0xDD) ocupa la dirección más baja (0x20000000).'
          },
          {
            id: 'b',
            label: '0xAA.',
            isCorrect: false,
            feedback: '0xAA estaría en 0x20000000 solo en una arquitectura Big-Endian.'
          }
        ]
      },
      {
        id: 'm0-q5',
        difficulty: 'Caza del Bug',
        question: 'Defines la macro #define CUADRADO(x) x * x y llamas a uint32_t r = CUADRADO(3 + 2); ¿Qué valor guarda "r"?',
        options: [
          {
            id: 'a',
            label: '11 (porque el preprocesador expande literalmente 3 + 2 * 3 + 2 = 3 + 6 + 2 = 11 por falta de paréntesis).',
            isCorrect: true,
            feedback: '¡Exacto! Por eso la macro correcta siempre debe escribirse #define CUADRADO(x) ((x) * (x)).'
          },
          {
            id: 'b',
            label: '25.',
            isCorrect: false,
            feedback: 'Solo daría 25 si hubieras puesto paréntesis alrededor de cada parámetro (x).'
          }
        ]
      }
    ]
  },

  // =========================================================================
  // MÓDULO 1
  // =========================================================================
  1: {
    moduleId: 1,
    notebookSummaryTitle: 'Apuntes Módulo 1: Manipulación de Bits y Registros de Hardware (MMIO)',
    whyWriteThisDown:
      'Escribir a mano la tabla de verdad de AND (&), OR (|), XOR (^) y NOT (~) junto con la anatomía del puntero *(volatile uint32_t *) fija para siempre la base de todo el curso.',
    definitions: [
      {
        term: 'Registro de Hardware (Peripheral Register)',
        definition:
          'Casilla de memoria de 8, 16 o 32 bits ubicada en una dirección física fija cuyos bits están conectados físicamente a circuitos electrónicos del chip (pines, relojes, temporizadores).',
        siliconReality:
          'Cada bit del registro es un biestable (Flip-Flop D) hecho con transistores que retiene un voltaje alto (1) o bajo (0).',
        exampleToCopy: '#define GPIOA_ODR (*(volatile uint32_t *)0x40020014UL)'
      },
      {
        term: 'Máscara de Bits (Bitmask)',
        definition:
          'Patrón binario construido con desplazamientos (1U << n) que actúa como una plantilla para seleccionar qué bits de un registro queremos modificar y cuáles queremos proteger.',
        siliconReality:
          'La ALU del procesador aplica la máscara sobre los 32 bits en paralelo en 1 solo ciclo de reloj.',
        exampleToCopy: '(1UL << 5)  // Crea la máscara 0b00100000 (0x20)'
      },
      {
        term: 'Enteros de Ancho Fijo (<stdint.h>)',
        definition:
          'Tipos de datos del estándar C99 que garantizan el número exacto de bits en cualquier arquitectura (uint8_t, uint16_t, uint32_t, int32_t).',
        siliconReality:
          'Evita que un código escrito en 32 bits falle al compilarse en un micro de 8 o 16 bits donde "int" cambia de tamaño.',
        exampleToCopy: 'uint32_t mascara = (1UL << 31); // Siempre 32 bits sin signo'
      },
      {
        term: 'Operación Read-Modify-Write (Leer-Modificar-Escribir)',
        definition:
          'Secuencia de 3 pasos que ejecuta la CPU cuando usas |=, &= o ^=: 1) Lee el registro a la CPU, 2) Modifica los bits en la ALU, 3) Escribe el resultado de vuelta al registro.',
        siliconReality:
          'En ensamblador ARM se traduce en 3 instrucciones: LDR (Load), ORR/BIC (Bitwise) y STR (Store).',
        exampleToCopy: 'REG = (REG & ~(3UL << 10)) | (1UL << 10);'
      },
      {
        term: 'Desplazamiento Lógico vs Desplazamiento Aritmético (Shift >>)',
        definition:
          'El operador >> actúa según el signo: en tipos sin signo (uint32_t) ejecuta un Desplazamiento Lógico (LSR) rellenando con CEROS (0s) por la izquierda; en tipos con signo (int32_t) negativos ejecuta un Desplazamiento Aritmético (ASR) propagando el bit de signo y rellenando con UNOS (1s).',
        siliconReality:
          'Usar un tipo con signo para leer un registro con el bit 31 activo inunda de unos los bits superiores (0x80000000 >> 4 = 0xF8000000), corrompiendo la máscara.',
        exampleToCopy: 'uint32_t mask = (0x80000000UL >> 4); // 0x08000000 (Limpio y correcto)'
      }
    ],
    goldenRules: [
      {
        title: 'Regla 1: Encender un bit (SET) sin tocar los demás',
        formulaOrRule: 'REG |= (1UL << n);',
        explanation: 'Porque X | 1 = 1 (enciende el bit n) y X | 0 = X (deja intactos todos los demás bits).'
      },
      {
        title: 'Regla 2: Apagar un bit (CLEAR) sin tocar los demás',
        formulaOrRule: 'REG &= ~(1UL << n);',
        explanation: 'Porque ~(1 << n) pone un 0 en el bit n y un 1 en todos los demás. X & 0 = 0 (apaga n) y X & 1 = X (respeta el resto).'
      },
      {
        title: 'Regla 3: Invertir un bit (TOGGLE)',
        formulaOrRule: 'REG ^= (1UL << n);',
        explanation: 'Porque el operador XOR (^) invierte el bit donde la máscara vale 1 (0^1=1, 1^1=0) y conserva donde vale 0.'
      },
      {
        title: 'Regla 4: Escribir un valor V en un campo multi-bit de máscara M en la posición P',
        formulaOrRule: 'REG = (REG & ~(M << P)) | ((V & M) << P);',
        explanation: 'Primero limpia el hueco con AND NOT ~(M << P) y luego inserta el nuevo valor desplazado con OR.'
      },
      {
        title: 'Regla de Oro del Shift >>: Tipos Sin Signo Obligatorios (uint32_t / UL)',
        formulaOrRule: 'uint32_t campo = (reg_u32 >> pos) & mascara;   [NUNCA con int32_t]',
        explanation: 'El desplazamiento lógico (LSR) rellena con ceros preservando el campo. El desplazamiento aritmético (ASR) sobre tipos con signo negativos rellena con unos destruyendo la máscara.'
      },
      {
        title: 'Regla MISRA-C 19.10: Blindaje de Macros con Dobles Paréntesis Obligatorios',
        formulaOrRule: '#define BIT(n) ((1UL) << (n))   |   #define FIELD_WRITE(reg, msk, pos, val) ((reg) = ((reg) & ~((msk) << (pos))) | (((val) & (msk)) << (pos)))',
        explanation: 'Rodea siempre con paréntesis cada parámetro individual (pos) y la macro entera ((...)). Sin ellos, expresiones como BIT(1 + 2) o BIT(3) * 2 alteran la prioridad de los operadores (+ y * tienen mayor precedencia que <<) rompiendo la lógica en vuelo.'
      },
      {
        title: 'Normativa Espacial ECSS-E-ST-40C (Annex U.2 #4 y #5) & MISRA-C (Reglas 10.1 y 12.2)',
        formulaOrRule: 'PROHIBIDO: Mezclar operadores bit a bit (&, |, ~) con lógicos (&&, ||, !) o desplazar enteros con signo.',
        explanation: 'En normativa aeroespacial todas las máscaras y desplazamientos deben realizarse exclusivamente sobre tipos sin signo de ancho fijo (uint8_t, uint32_t) con sufijo explícito U/UL y sin superar jamás el ancho en bits del tipo.'
      }
    ],
    sketchDiagramSteps: [
      'Dibuja una fila de 8 cajitas numeradas de derecha a izquierda: Bit 7, Bit 6, Bit 5, Bit 4, Bit 3, Bit 2, Bit 1, Bit 0.',
      'Debajo del Bit 5 dibuja una flecha que sale hacia afuera hasta un pin llamado PB5 / PA5.',
      'A la izquierda escribe la dirección hexadecimal (ej. 0x40020014) apuntando a toda la fila de cajitas: eso es el puntero (volatile uint32_t *).',
      'Escribe al lado: "Asterisco (*) al principio = Entrar dentro de la dirección para leer o cambiar los bits".'
    ],
    annotatedCodeToCopy: {
      code: `#include <stdint.h>

/* ====================================================================
   LIBRERÍA DE MACROS DE BITS BLINDADA (NORMA MISRA-C:2012)
   Regla de Oro: Todo parámetro individual (n) y la macro entera ((...))
   deben ir obligatoriamente entre paréntesis dobles.
   ==================================================================== */

#define BIT(n)                     ((1UL) << (n))
#define BIT_SET(reg, n)            ((reg) |= BIT(n))
#define BIT_CLEAR(reg, n)          ((reg) &= ~BIT(n))
#define BIT_TOGGLE(reg, n)         ((reg) ^= BIT(n))
#define BIT_READ(reg, n)           (((reg) >> (n)) & 1UL)
#define BIT_IS_SET(reg, n)         (((reg) & BIT(n)) != 0UL)
#define BIT_IS_CLEAR(reg, n)       (((reg) & BIT(n)) == 0UL)

/* Macro para modificar un campo de múltiples bits de forma segura: */
#define FIELD_WRITE(reg, msk, pos, val) \\
    ((reg) = ((reg) & ~((msk) << (pos))) | (((val) & (msk)) << (pos)))

#define FIELD_READ(reg, msk, pos) \\
    (((reg) >> (pos)) & (msk))

#define PERIPH_REG  (*(volatile uint32_t *)0x40020000UL)

void configurar_registro(void) {
    BIT_SET(PERIPH_REG, 5);                      // 1. Enciende bit 5 (1UL << 5)
    BIT_CLEAR(PERIPH_REG, 3);                    // 2. Apaga bit 3 (~(1UL << 3))
    FIELD_WRITE(PERIPH_REG, 0x03UL, 10, 0x02UL); // 3. Escribe '10' en bits [11:10]
}`,
      lineNotes: [
        '0x40020000UL: El sufijo UL indica Unsigned Long (32 bits sin signo garantizados).',
        '#define BIT(n) ((1UL) << (n)): Doble paréntesis obligatorio para evitar fallos de precedencia.',
        'BIT_CLEAR usa ~(1UL << n): Invierte los bits para que solo el bit deseado valga 0.',
        'FIELD_WRITE aplica Clear & Insert: Primero borra el hueco y luego inserta el nuevo valor acotado.'
      ]
    },
    codingChallenges: [
      {
        levelLabel: 'Nivel 1: Base',
        title: 'Reto 1.1 — Encender y Limpiar Bits Individuales',
        instruction:
          'El registro REG empieza con el valor 0x00000009 (Bits 0 y 3 encendidos). Escribe una sentencia en C que APAGUE el bit 3 y ENCIENDA el bit 5 (dejando el bit 0 intacto). Valor esperado: 0x00000021.',
        initialRegValue: 0x00000009,
        regWidth: 32,
        expectedRegValue: 0x00000021,
        starterCode: 'REG = (REG & ~(1 << 3)) | (1 << 5);',
        hint: 'Haz REG &= ~(1 << 3); REG |= (1 << 5);',
        solutionCode: 'REG &= ~(1 << 3); REG |= (1 << 5);',
        explanation:
          'REG &= ~(1 << 3) apaga el bit 3 pasando de 0x09 a 0x01, y REG |= (1 << 5) suma 0x20 obteniendo 0x21.'
      },
      {
        levelLabel: 'Nivel 2: Intermedio',
        title: 'Reto 1.2 — Modificar un Campo de 2 Bits en MODER sin Borrar Otros Pines',
        instruction:
          'El registro GPIOA_MODER (REG) vale 0x00000C01 (PA0 está en salida = 01 y PA5 tiene los bits [11:10] en 11 = Analógico). Limpia los bits [11:10] y escribe en ellos 01 (Salida), conservando intacto el bit 0. Valor esperado: 0x00000401.',
        initialRegValue: 0x00000c01,
        regWidth: 32,
        expectedRegValue: 0x00000401,
        starterCode: 'REG = (REG & ~(3 << 10));',
        hint: 'Añade | (1 << 10) tras limpiar: REG = (REG & ~(3 << 10)) | (1 << 10);',
        solutionCode: 'REG = (REG & ~(3 << 10)) | (1 << 10);',
        explanation:
          '~(3 << 10) limpia los bits 11 y 10 dejando 0x00000001, y | (1 << 10) activa el bit 10 dando 0x00000401.'
      },
      {
        levelLabel: 'Nivel 3: Experto',
        title: 'Reto 1.3 — Configurar Función Alternativa AF7 (4 bits) en GPIOA_AFRL',
        instruction:
          'En STM32, cada pin tiene un campo de 4 bits en el registro AFRL para elegir su Función Alternativa (AF0..AF15). Para el pin PA2, su campo ocupa los bits [11:8] (actualmente valen 0xF = 1111 en REG = 0x00000F01). Cámbialo a AF7 (valor 7 = 0111) respetando el bit 0. Valor esperado: 0x00000701.',
        initialRegValue: 0x00000f01,
        regWidth: 32,
        expectedRegValue: 0x00000701,
        starterCode: 'REG = (REG & ~(0xF << 8));',
        hint: 'Limpia los 4 bits con ~(0xF << 8) e inserta el 7 con | (7 << 8).',
        solutionCode: 'REG = (REG & ~(0xF << 8)) | (7 << 8);',
        explanation:
          'Un campo de 4 bits tiene máscara 0xF (15 = 0b1111). Limpiamos [11:8] con ~(0xF << 8) e insertamos AF7 con | (7 << 8).'
      }
    ],
    extraQuizzes: [
      {
        id: 'm1-q1',
        difficulty: 'Traza Mental',
        question: '¿Qué valor hexadecimal tiene la expresión (1U << 7) | (1U << 0) en un registro de 8 bits?',
        options: [
          {
            id: 'a',
            label: '0x81 (en binario 0b10000001)',
            isCorrect: true,
            feedback: '¡Correcto! (1 << 7) es 128 (0x80) y (1 << 0) es 1 (0x01). Juntos forman 0x81 (0b10000001).'
          },
          {
            id: 'b',
            label: '0x71 (en binario 0b01110001)',
            isCorrect: false,
            feedback: 'Recuerda que (1 << 7) coloca un 1 en la posición 7 (el octavo bit), que equivale a 0x80.'
          }
        ]
      },
      {
        id: 'm1-q2',
        difficulty: 'Lectura Datasheet',
        question: 'Si quieres comprobar en un if() si el bit 4 del registro STATUS está en 1, ¿cuál es la expresión correcta?',
        options: [
          {
            id: 'a',
            label: 'if ((STATUS & (1U << 4)) != 0U)',
            isCorrect: true,
            feedback: '¡Perfecto! El operador AND (&) aísla únicamente el bit 4. Si ese bit es 1, el resultado es distinto de cero.'
          },
          {
            id: 'b',
            label: 'if (STATUS | (1U << 4))',
            isCorrect: false,
            feedback: '¡Cuidado! Usar OR (|) siempre dará verdadero (distinto de cero) porque estás forzando un 1 en la expresión.'
          }
        ]
      },
      {
        id: 'm1-q3',
        difficulty: 'Caza del Bug',
        question: 'Un programador quiere apagar el bit 5 de PORTB y escribe por error: PORTB &= !(1U << 5); (usando ! en vez de ~). ¿Qué ocurre en el puerto?',
        options: [
          {
            id: 'a',
            label: 'Se apagan TODOS los 8 pines del puerto a 0x00, porque !(1U << 5) evalúa a 0 lógico y X & 0 = 0.',
            isCorrect: true,
            feedback: '¡Exacto! El operador lógico ! convierte cualquier número distinto de cero en 0. Para invertir bits siempre hay que usar ~.'
          },
          {
            id: 'b',
            label: 'Apaga únicamente el bit 5 igual que ~.',
            isCorrect: false,
            feedback: '! es negación booleana (devuelve 0 o 1), mientras que ~ es inversión bit a bit.'
          }
        ]
      },
      {
        id: 'm1-q4',
        difficulty: 'Traza Mental',
        question: 'Si un registro de 8 bits vale 0xAA (0b10101010) y ejecutas REG ^= 0xFF; ¿qué valor queda en REG?',
        options: [
          {
            id: 'a',
            label: '0x55 (0b01010101), porque hacer XOR con todos unos invierte exactamente todos los bits.',
            isCorrect: true,
            feedback: '¡Correcto! Hacer XOR con 1 invierte el bit, por lo que 0b10101010 ^ 0b11111111 = 0b01010101 (0x55).'
          },
          {
            id: 'b',
            label: '0xFF.',
            isCorrect: false,
            feedback: '0xFF sería el resultado de hacer OR (|= 0xFF), no XOR (^= 0xFF).'
          }
        ]
      }
    ]
  },

  // =========================================================================
  // MÓDULO 2
  // =========================================================================
  2: {
    moduleId: 2,
    notebookSummaryTitle: 'Apuntes Módulo 2: Mapa de Memoria, Secciones del Compilador y Clock Gating (RCC)',
    whyWriteThisDown:
      'Anotar en tu cuaderno qué va en Flash (.text, .rodata) y qué va en SRAM (.data, .bss, Stack) te permitirá entender los errores de falta de memoria y los Linker Scripts.',
    definitions: [
      {
        term: 'Memory-Mapped I/O (MMIO)',
        definition:
          'Técnica de arquitectura donde los registros de todos los periféricos (GPIO, UART, Timers) comparten el mismo espacio de direcciones que la memoria RAM y Flash.',
        siliconReality:
          'Un decodificador de direcciones en el bus detecta cuando la CPU accede a >= 0x40000000 y desvía la lectura/escritura hacia los periféricos en lugar de la SRAM.',
        exampleToCopy: '// 0x20000000 = SRAM  |  0x40020000 = Periférico GPIOA'
      },
      {
        term: 'Clock Gating (Puerta de Reloj — RCC)',
        definition:
          'Interruptor electrónico que desconecta la señal de reloj de un periférico cuando no se usa para reducir el consumo dinámico de energía a cero.',
        siliconReality:
          'Una compuerta AND bloquea el paso del reloj del bus hacia los flip-flops del periférico hasta que activas su bit en el registro RCC.',
        exampleToCopy: 'RCC->AHB1ENR |= (1UL << 0); // Abre compuerta de reloj de GPIOA'
      },
      {
        term: 'Secciones de Memoria (.text, .rodata, .data, .bss)',
        definition:
          'Divisiones estándar donde el compilador y el enlazador (Linker) organizan tu código ejecutable, constantes y variables.',
        siliconReality:
          '.text y .rodata viven en Flash (no volátil); .data y .bss viven en SRAM (volátil, pierden su valor al apagar).',
        exampleToCopy: 'const uint32_t Version = 10; // Va a .rodata (Flash, gasta 0 bytes de RAM)'
      }
    ],
    goldenRules: [
      {
        title: 'Regla de Oro de la Memoria en Sistemas Embebidos',
        formulaOrRule: 'Toda tabla o configuración que no cambie en ejecución DEBE llevar "const".',
        explanation: 'Un microcontrolador suele tener entre 4 y 16 veces más Flash que RAM. Poner "const" evita que el compilador copie esos datos a la memoria SRAM.'
      },
      {
        title: 'Regla del Orden de Inicialización en ARM / SoCs Modernos',
        formulaOrRule: '1º Habilitar Reloj (RCC) -> 2º Configurar Pines/Periférico -> 3º Activar Periférico.',
        explanation: 'Si inviertes el paso 1 y el paso 2, las escrituras en los registros del periférico se pierden porque sus biestables no tienen reloj.'
      },
      {
        title: 'Normativa Espacial ECSS-E-ST-40C (Cláusula 5.3.8.2 y Annex M <5.2>) & NASA JPL (Regla 3)',
        formulaOrRule: 'margin_memory = free_size / total_size   |   PROHIBIDO malloc()/free() tras inicialización y Recursión.',
        explanation: 'La ESA exige controlar matemáticamente el margen libre de Flash y SRAM (típicamente >= 50% en diseño preliminar), prohibiendo el Heap dinámico y la recursividad para garantizar 0% de riesgo de Stack/Heap Collision.'
      }
    ],
    sketchDiagramSteps: [
      'Dibuja una columna vertical grande dividida en 3 pisos (el Mapa de Memoria de 32 bits):',
      'Piso Inferior (0x0800_0000): Escribe "FLASH (No Volátil)" -> Aquí viven .text (tu código C) y .rodata (variables const).',
      'Piso Intermedio (0x2000_0000): Escribe "SRAM (Volátil)" -> Abajo están .data y .bss (globales), y desde el techo baja una flecha llamada "STACK (Variables locales)".',
      'Piso Superior (0x4000_0000): Escribe "MMIO PERIFÉRICOS" -> Dibuja una llave de paso llamada "RCC Clock Gate" antes de entrar a GPIOA / UART.'
    ],
    annotatedCodeToCopy: {
      code: `// Dónde vive cada variable en el silicio:
const uint16_t tabla_calibracion[128] = { 10, 20, 30 }; // -> FLASH (.rodata)
uint32_t contador_global = 500;                         // -> SRAM (.data)
uint32_t buffer_vacio[64];                              // -> SRAM (.bss, puesto a 0)

void inicializar_puerto(void) {
    uint8_t variable_temporal = 1;                      // -> SRAM (Stack / Registro CPU)
    RCC->AHB1ENR |= (1UL << 0);                         // -> MMIO (0x40023830)
}`,
      lineNotes: [
        '.rodata (Read-Only Data): Grabada en Flash en fábrica, no ocupa ni un byte de RAM.',
        '.data: El valor inicial (500) se guarda en Flash y el código Startup (Reset_Handler) lo copia a SRAM antes de entrar a main().',
        '.bss: El código Startup limpia a 0 toda esta zona de SRAM con un bucle antes de llamar a main().'
      ]
    },
    codingChallenges: [
      {
        levelLabel: 'Nivel 1: Base',
        title: 'Reto 2.1 — Encender Relojes de GPIOA (Bit 0) y GPIOC (Bit 2) en RCC',
        instruction:
          'El registro RCC_AHB1ENR (REG) empieza en 0x00000000. Escribe la expresión en C para habilitar simultáneamente el reloj de GPIOA (bit 0) y GPIOC (bit 2). Valor esperado: 0x00000005.',
        initialRegValue: 0x00000000,
        regWidth: 32,
        expectedRegValue: 0x00000005,
        starterCode: 'REG |= (1 << 0);',
        hint: 'Une ambos desplazamientos con OR: REG |= (1 << 0) | (1 << 2);',
        solutionCode: 'REG |= (1 << 0) | (1 << 2);',
        explanation:
          '(1 << 0) vale 1 y (1 << 2) vale 4. Al unirlos con | obtenemos 5 (0x05), activando ambos puertos a la vez.'
      },
      {
        levelLabel: 'Nivel 2: Intermedio',
        title: 'Reto 2.2 — Habilitar Reloj de DMA2 (Bit 22) y GPIOB (Bit 1)',
        instruction:
          'En RCC_AHB1ENR (REG = 0x00000001, con GPIOA ya activo), enciende sin apagar GPIOA los relojes del controlador DMA2 (bit 22) y del puerto GPIOB (bit 1). Valor esperado: 0x00400003.',
        initialRegValue: 0x00000001,
        regWidth: 32,
        expectedRegValue: 0x00400003,
        starterCode: 'REG |= (1 << 1);',
        hint: 'Usa |= para conservar el bit 0 y añade (1 << 22) | (1 << 1).',
        solutionCode: 'REG |= (1 << 22) | (1 << 1);',
        explanation:
          'Al usar |= conservamos el bit 0 (0x01) y encendemos el bit 1 (0x02) y el bit 22 (0x00400000), sumando 0x00400003.'
      },
      {
        levelLabel: 'Nivel 3: Experto',
        title: 'Reto 2.3 — Liberar el Reset de IO_BANK0 (Bit 5) en RP2040',
        instruction:
          'En el RP2040, el registro RESETS_RESET nace con todos los periféricos en estado de reset (REG = 0x000000FF). Para despertar IO_BANK0 debes poner a 0 el bit 5 dejando los demás bits en 1. Valor esperado: 0x000000DF.',
        initialRegValue: 0x000000ff,
        regWidth: 32,
        expectedRegValue: 0x000000df,
        starterCode: 'REG &= ~(1 << 0);',
        hint: 'Limpia el bit 5 con: REG &= ~(1 << 5);',
        solutionCode: 'REG &= ~(1 << 5);',
        explanation:
          '0xFF menos el bit 5 (0x20) deja 0xDF (0b11011111), sacando a IO_BANK0 del estado de Reset.'
      }
    ],
    extraQuizzes: [
      {
        id: 'm2-q1',
        difficulty: 'Traza Mental',
        question: '¿Qué ocurre con el contenido de la memoria SRAM (.data, .bss, Stack) cuando desconectas la batería del microcontrolador?',
        options: [
          {
            id: 'a',
            label: 'Se pierde por completo porque las celdas SRAM son transistores volátiles.',
            isCorrect: true,
            feedback: '¡Exacto! Solo la memoria Flash (y EEPROM) retiene la información sin alimentación eléctrica.'
          },
          {
            id: 'b',
            label: 'Se conserva intacto hasta la próxima vez que reprogrames el chip.',
            isCorrect: false,
            feedback: 'Esa es la memoria Flash. La SRAM pierde sus datos en milisegundos al caer la tensión.'
          }
        ]
      },
      {
        id: 'm2-q2',
        difficulty: 'Lectura Datasheet',
        question: '¿Quién se encarga de copiar los valores iniciales de las variables globales (.data) desde la Flash hacia la RAM antes de que empiece tu función main()?',
        options: [
          {
            id: 'a',
            label: 'El código de arranque (Startup Code / Reset_Handler) que se ejecuta nada más salir del Reset.',
            isCorrect: true,
            feedback: '¡Brillante! Antes de llamar a main(), el procesador ejecuta el Reset_Handler (normalmente en startup_stm32.s o crt0.s) que copia .data de Flash a RAM y pone a cero .bss.'
          },
          {
            id: 'b',
            label: 'Se copian solos por arte de magia sin ejecutar instrucciones.',
            isCorrect: false,
            feedback: 'En sistemas embebidos nada ocurre por magia: siempre lo hace el Reset_Handler usando las direcciones definidas en el Linker Script.'
          }
        ]
      },
      {
        id: 'm2-q3',
        difficulty: 'Caza del Bug',
        question: 'Declaras dentro de una función void enviar_foto(void) { uint8_t buffer_temporal[16384]; ... } en un microcontrolador cuyo Stack es de 4 KB. ¿Qué ocurre al llamar a la función?',
        options: [
          {
            id: 'a',
            label: 'Desbordamiento de Pila (Stack Overflow): el puntero SP baja 16 KB de golpe, aplastando variables globales en SRAM y causando un HardFault.',
            isCorrect: true,
            feedback: '¡Exacto! Las variables locales no estáticas viven en el Stack. Nunca declares arrays gigantes como variables locales automáticas.'
          },
          {
            id: 'b',
            label: 'El array se guarda automáticamente en la memoria Flash.',
            isCorrect: false,
            feedback: 'Las variables locales sin const se reservan dinámicamente en la pila (Stack) en SRAM.'
          }
        ]
      }
    ]
  },

  // =========================================================================
  // MÓDULO 3
  // =========================================================================
  3: {
    moduleId: 3,
    notebookSummaryTitle: 'Apuntes Módulo 3: Electrónica Interna del Pin GPIO y Registros Atómicos',
    whyWriteThisDown:
      'Dibujar los dos transistores (P-MOS arriba y N-MOS abajo) en tu cuaderno te hará entender para siempre qué es Push-Pull, qué es Open-Drain y por qué el protocolo I2C necesita resistencias Pull-Up.',
    definitions: [
      {
        term: 'Salida Push-Pull (Totem-Pole)',
        definition:
          'Configuración de salida donde el pin usa dos transistores complementarios: un P-MOS conectado a VCC para empujar corriente (HIGH) y un N-MOS conectado a GND para absorber corriente (LOW).',
        siliconReality:
          'Nunca conducen los dos a la vez. Con bit=1 se cierra el P-MOS (3.3V/5V); con bit=0 se cierra el N-MOS (0V).',
        exampleToCopy: 'GPIOA->OTYPER &= ~(1UL << 5); // 0 = Modo Push-Pull'
      },
      {
        term: 'Salida Open-Drain (Drenador Abierto)',
        definition:
          'Configuración donde el transistor superior P-MOS queda desconectado permanentemente. El pin solo puede conectar a 0V (cuando escribes 0) o quedar desconectado en Alta Impedancia (cuando escribes 1).',
        siliconReality:
          'Evita cortocircuitos cuando varios chips hablan por el mismo cable (si uno pone 0 y otro pone 1, no hay choque entre VCC y GND). Requiere resistencia Pull-Up.',
        exampleToCopy: 'GPIOB->OTYPER |= (1UL << 6); // 1 = Modo Open-Drain (para I2C)'
      },
      {
        term: 'Alta Impedancia (Hi-Z / Pin Flotante)',
        definition:
          'Estado eléctrico en el que ni el transistor P-MOS ni el N-MOS conducen y no hay resistencias Pull conectadas; el pin ofrece una resistencia de megaohmios.',
        siliconReality:
          'Si lees un pin de entrada en estado Hi-Z sin nada conectado, leerás 0 y 1 aleatorios provocados por el ruido eléctrico ambiental.',
        exampleToCopy: 'GPIOC->PUPDR |= (1UL << (13 * 2)); // Evita Hi-Z activando Pull-Up'
      },
      {
        term: 'Registro de Modificación Atómica (BSRR / W1TS / OUTSET)',
        definition:
          'Registro especial de solo escritura donde escribir un 1 enciende o apaga un pin directamente en el hardware sin necesidad de leer antes el valor del puerto.',
        siliconReality:
          'Sustituye la secuencia de 3 instrucciones (LDR-ORR-STR) por 1 sola instrucción indivisible (STR), eliminando las condiciones de carrera con interrupciones.',
        exampleToCopy: 'GPIOA->BSRR = (1UL << 5); // Enciende PA5 en 1 ciclo atómico'
      },
      {
        term: 'Tipos Enumerados (enum) en Drivers de Hardware',
        definition:
          'Tipo de dato definido por el usuario que restringe una variable a un conjunto acotado de constantes con nombres legibles (por defecto 0, 1, 2...). Sustituye números mágicos abstractos por contratos verificables por el compilador.',
        siliconReality:
          'Se almacena internamente en un registro de la CPU o variable entera en RAM/Flash, pero permite que el compilador active advertencias con -Wswitch-enum si falta algún estado.',
        exampleToCopy: 'typedef enum { GPIO_PULL_NONE = 0U, GPIO_PULL_UP = 1U, GPIO_PULL_DOWN = 2U } gpio_pull_t;'
      }
    ],
    goldenRules: [
      {
        title: 'Regla de Oro de Entradas Digitales (Pulsadores y Sensores)',
        formulaOrRule: 'Prohibido dejar un pin de entrada flotando sin Pull-Up o Pull-Down.',
        explanation: 'Si conectas un botón entre el Pin y Tierra (GND), debes activar siempre la resistencia Pull-Up para que cuando el botón esté suelto el pin lea un 1 sólido.'
      },
      {
        title: 'Regla del Registro BSRR en STM32 (32 bits)',
        formulaOrRule: 'Bits [15:0] = SET (Ponen a 3.3V)  |  Bits [31:16] = RESET (Ponen a 0V).',
        explanation: 'Para encender el pin N escribes (1UL << N). Para apagar el pin N escribes (1UL << (N + 16)). Siempre con "=" directo, nunca con "|=".'
      },
      {
        title: 'Regla MISRA-C 10.1: Cero Números Mágicos con enum Tipados',
        formulaOrRule: 'void gpio_set_pull(uint8_t pin, gpio_pull_t mode);   [NUNCA: void gpio_set_pull(uint8_t pin, uint8_t mode)]',
        explanation: 'Tipar los parámetros de hardware con typedef enum impide pasar números arbitrarios inválidos y hace que el driver sea 100% autodocumentado.'
      },
      {
        title: 'Normativa Espacial ECSS-Q-ST-80C (Cláusula 6.2.2.8 HSIA) & ECSS-E-ST-40C (Annex U.2 #14)',
        formulaOrRule: 'OBLIGATORIO (SHALL): Usar registros atómicos (BSRR/W1TS) e Inhibiciones Hardware en actuadores críticos.',
        explanation: 'El análisis de interacción Hardware-Software (HSIA) prohíbe dejar pines en estado flotante indeterminado al arrancar y exige operaciones atómicas indivisibles en puertos compartidos con interrupciones.'
      }
    ],
    sketchDiagramSteps: [
      'Dibuja una línea vertical: arriba pon "+3.3V (VDD)" y abajo del todo pon "0V (GND)".',
      'En la mitad superior dibuja un interruptor llamado "Transistor P-MOS" y en la mitad inferior otro interruptor llamado "Transistor N-MOS".',
      'Del punto medio entre ambos interruptores saca una línea hacia la derecha: esa es la "Patilla Física del Pin".',
      'Anota: "Push-Pull = Usa ambos interruptores. Open-Drain = Corta con tijeras el P-MOS de arriba y añade una resistencia Pull-Up hacia +3.3V".'
    ],
    annotatedCodeToCopy: {
      code: `// Encendido y apagado atómico en STM32 con BSRR:
#define PIN_LED  5U

void led_on_atomic(void) {
    GPIOA->BSRR = (1UL << PIN_LED);         // Bit 5  -> Pone PA5 a 3.3V
}

void led_off_atomic(void) {
    GPIOA->BSRR = (1UL << (PIN_LED + 16U)); // Bit 21 -> Pone PA5 a 0.0V
}`,
      lineNotes: [
        'Usamos "=" en lugar de "|=" porque los bits escritos con 0 en BSRR son ignorados por el hardware.',
        'PIN_LED + 16U desplaza el 1 a la mitad superior del registro (Reset Register BR5 = bit 21).',
        'En ESP32 el equivalente es GPIO.out_w1ts.val = (1UL << 5) y GPIO.out_w1tc.val = (1UL << 5).'
      ]
    },
    codingChallenges: [
      {
        levelLabel: 'Nivel 1: Base',
        title: 'Reto 3.1 — Apagar el Pin PA5 de Forma Atómica usando BSRR',
        instruction:
          'En un STM32, los bits [15:0] de BSRR encienden los pines y los bits [31:16] los apagan. Escribe la sentencia en C sobre REG para apagar atómicamente el pin 5 (activar el bit 5 + 16 = bit 21). Valor esperado: 0x00200000.',
        initialRegValue: 0x00000000,
        regWidth: 32,
        expectedRegValue: 0x00200000,
        starterCode: 'REG = (1 << 5);',
        hint: 'Desplaza el 1 veintuna posiciones: REG = (1 << 21); o REG = (1 << (5 + 16));',
        solutionCode: 'REG = (1 << (5 + 16));',
        explanation:
          'El bit 21 corresponde a BR5 (Bit Reset 5) dentro de BSRR. Al escribir (1 << 21) = 0x00200000, el hardware apaga PA5 instantáneamente.'
      },
      {
        levelLabel: 'Nivel 2: Intermedio',
        title: 'Reto 3.2 — Encender PA0 y Apagar PA5 en un Solo Golpe Atómico de BSRR',
        instruction:
          'Una ventaja brutal de BSRR es que puedes encender unos pines y apagar otros en la misma instrucción. Escribe en REG el valor para ENCENDER el pin 0 (bit 0) y APAGAR el pin 5 (bit 21) simultáneamente. Valor esperado: 0x00200001.',
        initialRegValue: 0x00000000,
        regWidth: 32,
        expectedRegValue: 0x00200001,
        starterCode: 'REG = (1 << 0);',
        hint: 'Combina BS0 y BR5 con OR: REG = (1 << 0) | (1 << 21);',
        solutionCode: 'REG = (1 << 0) | (1 << 21);',
        explanation:
          'En 1 solo ciclo de reloj del bus AHB1, el hardware pone PA0 en 3.3V y PA5 en 0V de forma 100% síncrona.'
      },
      {
        levelLabel: 'Nivel 3: Experto',
        title: 'Reto 3.3 — Configurar P0.05 en nRF52840 como Salida Open-Drain (S0D1) con Pull-Up',
        instruction:
          'En el registro PIN_CNF[5] de Nordic (REG), pon el bit 0 (DIR) en 1 (Salida), los bits [3:2] (PULL) en 3 (Pull-Up = 0b11) y los bits [10:8] (DRIVE) en 6 (S0D1 Open-Drain = 0b110). Valor esperado: 0x0000060D.',
        initialRegValue: 0x00000000,
        regWidth: 32,
        expectedRegValue: 0x0000060d,
        starterCode: 'REG = (1 << 0) | (3 << 2);',
        hint: 'Añade el campo DRIVE en la posición 8: REG = (1 << 0) | (3 << 2) | (6 << 8);',
        solutionCode: 'REG = (1 << 0) | (3 << 2) | (6 << 8);',
        explanation:
          '(1 << 0) = 0x1, (3 << 2) = 0xC y (6 << 8) = 0x600. Juntos forman 0x0000060D en un único registro.'
      }
    ],
    extraQuizzes: [
      {
        id: 'm3-q1',
        difficulty: 'Lectura Datasheet',
        question: 'Si configuras un pin como salida Open-Drain y escribes un 1 en su registro de salida pero NO hay resistencia Pull-Up interna ni externa, ¿qué voltaje habrá en el pin?',
        options: [
          {
            id: 'a',
            label: 'Quedará flotando en Alta Impedancia (Hi-Z) sin poder entregar corriente ni subir a 3.3V.',
            isCorrect: true,
            feedback: '¡Exacto! Como en Open-Drain el transistor P-MOS superior está desconectado, el pin necesita una resistencia Pull-Up para subir el voltaje cuando el N-MOS se abre.'
          },
          {
            id: 'b',
            label: 'Entregará 3.3V con total normalidad.',
            isCorrect: false,
            feedback: 'Eso solo ocurre en modo Push-Pull donde el transistor P-MOS conecta el pin a VDD.'
          }
        ]
      },
      {
        id: 'm3-q2',
        difficulty: 'Caza del Bug',
        question: 'Conectas un pulsador entre el pin PA0 y Tierra (GND), configuras PA0 como Entrada Digital SIN resistencia Pull-Up ni Pull-Down, y tu programa hace cosas aleatorias cuando nadie toca el botón. ¿Por qué?',
        options: [
          {
            id: 'a',
            label: 'Porque con el botón abierto el pin queda en Alta Impedancia (flotando) y actúa como una antena captando ruido eléctrico de 50/60 Hz del ambiente.',
            isCorrect: true,
            feedback: '¡Exacto! Un botón conectado a GND exige siempre una resistencia Pull-Up para mantener el pin en 3.3V cuando está suelto.'
          },
          {
            id: 'b',
            label: 'Porque los botones no pueden conectarse a GND.',
            isCorrect: false,
            feedback: 'Conectar botones a GND es la práctica más común en la industria, siempre acompañada de una resistencia Pull-Up.'
          }
        ]
      }
    ]
  },

  // =========================================================================
  // MÓDULO 4
  // =========================================================================
  4: {
    moduleId: 4,
    notebookSummaryTitle: 'Apuntes Módulo 4: Modificador "volatile", Interrupciones (ISR) y Controlador NVIC',
    whyWriteThisDown:
      'Las 3 reglas de "volatile" y la secuencia de entrada/salida de una interrupción son las preguntas #1 en todas las entrevistas técnicas de Firmware e Ingeniería Embebida.',
    definitions: [
      {
        term: 'Calificador "volatile" en C',
        definition:
          'Instrucción para el compilador que prohíbe optimizar o cachear una variable en registros internos de la CPU, obligando a realizar una lectura/escritura física en memoria en cada acceso.',
        siliconReality:
          'Garantiza que el compilador emita siempre las instrucciones máquina LDR (Load) y STR (Store) hacia la dirección real de SRAM o MMIO.',
        exampleToCopy: 'volatile uint8_t flag_sensor_listo = 0;'
      },
      {
        term: 'ISR (Interrupt Service Routine)',
        definition:
          'Función especial apuntada por la Tabla de Vectores de Interrupción que el hardware invoca automáticamente como respuesta a un evento físico asíncrono.',
        siliconReality:
          'No recibe parámetros ni devuelve valores. La CPU guarda el contexto actual en el Stack antes de ejecutarla.',
        exampleToCopy: 'void EXTI15_10_IRQHandler(void) { EXTI->PR = (1UL << 13); }'
      },
      {
        term: 'Sección Crítica (Critical Section)',
        definition:
          'Bloque corto de código donde se desactivan temporalmente las interrupciones para leer o modificar estructuras de datos compartidas sin riesgo de que una ISR las deje a medias.',
        siliconReality:
          'En ARM Cortex-M se ejecuta la instrucción CPSID i (__disable_irq) al entrar y CPSIE i (__enable_irq) al salir.',
        exampleToCopy: '__disable_irq(); copia = contador_64bits; __enable_irq();'
      },
      {
        term: 'NVIC (Nested Vectored Interrupt Controller)',
        definition:
          'Controlador de hardware integrado dentro del núcleo ARM Cortex-M que gestiona las prioridades, habilitación y anidamiento de hasta 240 líneas de interrupción.',
        siliconReality:
          'Permite que una interrupción urgente (Prioridad 0) congele temporalmente a otra interrupción menos urgente (Prioridad 3).',
        exampleToCopy: 'NVIC_SetPriority(EXTI15_10_IRQn, 1); NVIC_EnableIRQ(EXTI15_10_IRQn);'
      },
      {
        term: 'Hardware Stacking Frame (Marco de Pila de Interrupción)',
        definition:
          'Conjunto de 8 registros del procesador (R0, R1, R2, R3, R12, LR, PC y xPSR = 32 bytes) que el silicio guarda automáticamente en el Stack al saltar una interrupción.',
        siliconReality:
          'Ocurre en 12 ciclos de reloj por hardware sin intervención del compilador, garantizando que main() nunca note que fue interrumpido.',
        exampleToCopy: '// El hardware apila 32 bytes en SP antes de entrar a la ISR'
      },
      {
        term: 'PPI / Sistema de Eventos Hardware (nRF52840)',
        definition:
          'Matriz de interconexión (Programmable Peripheral Interconnect) que conecta el Evento de un periférico directamente con la Tarea de otro sin despertar a la CPU.',
        siliconReality:
          'Permite por ejemplo que un flanco en un pin o un Timer dispare una conversión ADC en 1 ciclo de reloj con 0% de latencia de software.',
        exampleToCopy: 'NRF_PPI->CH[0].EEP = (uint32_t)&NRF_GPIOTE->EVENTS_IN[0];'
      }
    ],
    goldenRules: [
      {
        title: 'Los 3 Lugares Donde SIEMPRE Debes Poner "volatile"',
        formulaOrRule: '1) Registros de Hardware (MMIO)  |  2) Variables compartidas entre ISR y main()  |  3) Buffers de DMA / Multicore.',
        explanation: 'En esos 3 casos el valor en memoria cambia sin que el flujo secuencial de la CPU lo haya escrito.'
      },
      {
        title: 'Las 3 Leyes de Oro de Toda Interrupción (ISR)',
        formulaOrRule: '1) Ser ultra-corta (µs)  |  2) Jamás usar funciones bloqueantes (delay)  |  3) Limpiar siempre la bandera Pending del periférico.',
        explanation: 'Si olvidas limpiar la bandera Pending, el microcontrolador volverá a entrar en la ISR infinitamente nada más salir.'
      },
      {
        title: 'Escala de Prioridades en ARM Cortex-M (¡Inversa!)',
        formulaOrRule: 'Prioridad 0 = MÁXIMA Urgencia   |   Prioridad 15 = MÍNIMA Urgencia',
        explanation: 'Al revés de lo que parece intuitivo, en el controlador NVIC de ARM cuanto menor es el número, más prioritaria es la interrupción.'
      },
      {
        title: 'Fórmula de Habilitación en Bancos NVIC->ISER[n]',
        formulaOrRule: 'Banco = IRQ_Num >> 5 (IRQ / 32)   |   Bit = IRQ_Num & 0x1F (IRQ % 32)',
        explanation: 'Cada registro ISER controla 32 interrupciones: ISER[0] cubre 0..31, ISER[1] cubre 32..63, ISER[2] cubre 64..95.'
      },
      {
        title: 'Normativa Espacial ECSS-E-ST-40C (5.5.2.5c y Annex U.2 #8, #14) — Volatile y Exclusión Mutua',
        formulaOrRule: 'OBLIGATORIO (SHALL): Calificar con "volatile" todo acceso asíncrono (ISR/MMIO) y proteger lecturas no atómicas.',
        explanation: 'El Check #8 y #14 del Anexo U.2 de ECSS exige verificar que toda variable modificada por una ISR o hardware sea volatile y que las estructuras compartidas usen mecanismos de exclusión mutua libres de condiciones de carrera.'
      }
    ],
    sketchDiagramSteps: [
      'Dibuja una línea vertical de tiempo hacia abajo llamada "main() ejecutándose".',
      'A mitad de la línea dibuja un rayo lateral llamado "Evento Físico en Pin -> NVIC".',
      'Dibuja una flecha que sale de main() hacia una cajita lateral: "1. Hardware guarda R0-R3, LR, PC en el Stack -> 2. Ejecuta ISR() -> 3. Limpia Pending Bit -> 4. Restaura Stack y vuelve al punto exacto de main()".'
    ],
    annotatedCodeToCopy: {
      code: `volatile uint32_t ticks_ms = 0; // ¡Obligatorio volatile!

// Se ejecuta automáticamente cada 1 ms por hardware:
void SysTick_Handler(void) {
    ticks_ms++;
}

void esperar_no_bloqueante(void) {
    uint32_t inicio = ticks_ms;
    while ((ticks_ms - inicio) < 500UL) {
        // Puedes hacer otras tareas o dormir con __WFI()
    }
}`,
      lineNotes: [
        'Si quitas "volatile" a ticks_ms, el bucle while((ticks_ms - inicio) < 500) se vuelve infinito al compilar con -O2.',
        'La resta sin signo (ticks_ms - inicio) funciona correctamente incluso cuando ticks_ms da la vuelta a 0xFFFFFFFF.'
      ]
    },
    codingChallenges: [
      {
        levelLabel: 'Nivel 1: Base',
        title: 'Reto 4.1 — Limpiar la Bandera de Interrupción de la Línea 13 (Write-1-to-Clear)',
        instruction:
          'Para limpiar la bandera pendiente de la línea 13 en el registro EXTI_PR (REG), asigna directamente un 1 en el bit 13. Valor esperado: 0x00002000.',
        initialRegValue: 0x00000000,
        regWidth: 32,
        expectedRegValue: 0x00002000,
        starterCode: 'REG = (1 << 0);',
        hint: 'Escribe: REG = (1 << 13);',
        solutionCode: 'REG = (1 << 13);',
        explanation:
          'En registros de banderas Write-1-to-Clear (W1C) como EXTI->PR, se usa asignación directa "=" con (1 << 13).'
      },
      {
        levelLabel: 'Nivel 2: Intermedio',
        title: 'Reto 4.2 — Habilitar la IRQ #40 en el Banco NVIC->ISER[1]',
        instruction:
          'La interrupción #40 pertenece al banco NVIC->ISER[1] (que cubre las IRQs de la 32 a la 63). Calcula su posición de bit restando (40 - 32) y activa ese bit en REG. Valor esperado: 0x00000100.',
        initialRegValue: 0x00000000,
        regWidth: 32,
        expectedRegValue: 0x00000100,
        starterCode: 'REG = (1 << (40 - 32));',
        hint: '40 - 32 = 8. Escribe REG = (1 << 8); o deja REG = (1 << (40 - 32));',
        solutionCode: 'REG = (1 << (40 - 32));',
        explanation:
          'La IRQ 40 se controla mediante el bit 8 (0x100) del segundo registro de habilitación del NVIC (ISER[1]).'
      },
      {
        levelLabel: 'Nivel 3: Experto',
        title: 'Reto 4.3 — Configurar un Canal GPIOTE en nRF52840 (Modo Evento + Pin 11 + Flanco Bajada)',
        instruction:
          'Configura GPIOTE_CONFIG[0] (REG) uniendo con OR: Modo Evento (1 en bit 0), Pin P0.11 (11 en bits [12:8]) y Polaridad HiToLo (2 en bits [17:16]). Valor esperado: 0x00020B01.',
        initialRegValue: 0x00000000,
        regWidth: 32,
        expectedRegValue: 0x00020b01,
        starterCode: 'REG = (1 << 0) | (11 << 8);',
        hint: 'Añade | (2 << 16) al final de la expresión.',
        solutionCode: 'REG = (1 << 0) | (11 << 8) | (2 << 16);',
        explanation:
          '(1 << 0) = 0x01, (11 << 8) = 0x0B00 y (2 << 16) = 0x00020000, formando 0x00020B01.'
      }
    ],
    extraQuizzes: [
      {
        id: 'm4-q1',
        difficulty: 'Lectura Datasheet',
        question: 'En un procesador ARM Cortex-M (como STM32 o nRF52), tienes dos interrupciones: TimerA con prioridad numérica 1 y UART con prioridad numérica 4. Si ocurren a la vez, ¿cuál tiene mayor urgencia?',
        options: [
          {
            id: 'a',
            label: 'TimerA (Prioridad 1), porque en ARM Cortex-M un número menor significa MAYOR prioridad.',
            isCorrect: true,
            feedback: '¡Exacto! En la arquitectura ARM NVIC, la prioridad 0 es la máxima urgencia posible y números más altos tienen menor prioridad.'
          },
          {
            id: 'b',
            label: 'UART (Prioridad 4), porque 4 es mayor que 1.',
            isCorrect: false,
            feedback: '¡Cuidado con esa trampa! En ARM NVIC la escala es inversa: 0 es la prioridad más alta.'
          }
        ]
      },
      {
        id: 'm4-q2',
        difficulty: 'Caza del Bug',
        question: 'Escribes una ISR para atender el botón externo EXTI13, pero olvidas incluir la línea EXTI->PR = (1 << 13); al final de la ISR. ¿Qué síntoma observarás en tu placa?',
        options: [
          {
            id: 'a',
            label: 'En cuanto pulses el botón una vez, el programa principal main() se congelará para siempre porque la CPU re-entrará infinitamente en la ISR al seguir levantada la bandera Pending.',
            isCorrect: true,
            feedback: '¡Exacto! Mientras el bit de estado Pending del periférico siga en 1, el controlador NVIC volverá a disparar la ISR nada más salir de ella.'
          },
          {
            id: 'b',
            label: 'El botón funcionará una sola vez y luego dejará de funcionar pero main() seguirá corriendo.',
            isCorrect: false,
            feedback: 'Como la ISR tiene prioridad sobre main(), re-entrará en bucle infinito impidiendo que main() vuelva a ejecutarse.'
          }
        ]
      },
      {
        id: 'm4-q3',
        difficulty: 'Traza Mental',
        question: 'En un microcontrolador de 8 bits (ATmega328P), compartes una variable "volatile uint32_t contador_pulsos" entre una ISR y main(). ¿Basta con poner "volatile" para que main() lea siempre un valor coherente sin riesgo de corrupción?',
        options: [
          {
            id: 'a',
            label: 'No: como el procesador es de 8 bits, leer un uint32_t requiere 4 instrucciones separadas de 1 byte. Si la ISR salta a mitad de la lectura, main() leerá 2 bytes viejos y 2 bytes nuevos (hace falta Sección Crítica cli/sei).',
            isCorrect: true,
            feedback: '¡Brillante! "volatile" evita que el compilador cachee la variable, pero NO convierte una lectura de 4 pasos en atómica en una CPU de 8 bits.'
          },
          {
            id: 'b',
            label: 'Sí, "volatile" bloquea automáticamente las interrupciones mientras se lee la variable.',
            isCorrect: false,
            feedback: '"volatile" jamás desactiva ni toca las interrupciones del procesador.'
          }
        ]
      },
      {
        id: 'm4-q4',
        difficulty: 'Lectura Datasheet',
        question: '¿Qué ventaja aporta la tecnología "Tail-Chaining" del controlador NVIC en un ARM Cortex-M cuando termina una ISR y hay otra interrupción esperando en cola?',
        options: [
          {
            id: 'a',
            label: 'Evita desapilar (POP) los 8 registros hacia la RAM y volverlos a apilar (PUSH) inmediatamente, saltando de la primera ISR a la segunda en solo 6 ciclos de reloj.',
            isCorrect: true,
            feedback: '¡Exacto! Reduce la latencia entre interrupciones consecutivas de 24 ciclos (12 POP + 12 PUSH) a solo 6 ciclos.'
          },
          {
            id: 'b',
            label: 'Ejecuta las dos interrupciones en paralelo en el mismo núcleo.',
            isCorrect: false,
            feedback: 'Un núcleo ejecuta una instrucción a la vez; lo que ahorra Tail-Chaining es el viaje de ida y vuelta innecesario al Stack.'
          }
        ]
      }
    ]
  },

  // =========================================================================
  // MÓDULO 5
  // =========================================================================
  5: {
    moduleId: 5,
    notebookSummaryTitle: 'Apuntes Módulo 5: Fórmulas de Timers, Prescaler (PSC), Auto-Reload (ARR) y PWM',
    whyWriteThisDown:
      'Tener la fórmula de frecuencia de un Timer y el diagrama de comparación (CNT vs CCR y ARR) en tu cuaderno te permitirá calcular cualquier señal PWM o base de tiempos en segundos.',
    definitions: [
      {
        term: 'Prescaler (PSC — Divisor de Frecuencia)',
        definition:
          'Registro que divide la frecuencia del reloj de entrada del Timer entre (PSC + 1) antes de entregársela al contador principal.',
        siliconReality:
          'Si el bus va a 84 MHz y pones PSC = 83, el contador recibe 84.000.000 / (83 + 1) = 1.000.000 Hz (1 pulso cada 1 microsegundo).',
        exampleToCopy: 'TIM2->PSC = 84UL - 1UL; // 1 tick = 1 us'
      },
      {
        term: 'Auto-Reload Register (ARR / TOP)',
        definition:
          'Valor máximo hasta el que cuenta el Timer antes de reiniciarse a 0 y generar un evento de actualización (Update Event). Define el Periodo de la señal.',
        siliconReality:
          'Como el contador incluye el 0, el número total de pasos por periodo es siempre (ARR + 1).',
        exampleToCopy: 'TIM2->ARR = 1000UL - 1UL; // 1000 pasos de 1 us = 1 ms (1 kHz)'
      },
      {
        term: 'Capture / Compare Register (CCR)',
        definition:
          'Registro cuyo valor se compara continuamente en hardware con el contador actual (CNT) para conmutar el pin de salida PWM de ALTO a BAJO.',
        siliconReality:
          'En modo PWM 1: mientras CNT < CCR el pin entrega 3.3V; en cuanto CNT >= CCR el pin cae a 0V hasta que acaba el periodo.',
        exampleToCopy: 'TIM2->CCR1 = 250UL; // 250 us en ALTO de 1000 us = 25% Duty Cycle'
      },
      {
        term: 'Shadow Register (Registro Sombra / Preload)',
        definition:
          'Copia interna oculta de los registros ARR y CCRx que utiliza realmente el comparador hardware durante el ciclo actual mientras tú escribes un valor nuevo.',
        siliconReality:
          'Con OC1PE=1 y ARPE=1, el nuevo valor solo pasa al Registro Sombra cuando termina el ciclo actual (CNT=0), evitando pulsos partidos.',
        exampleToCopy: 'TIM2->CCMR1 |= (1UL << 3); // OC1PE = 1 (Preload activo)'
      },
      {
        term: 'Input Capture (Modo Captura de Entrada)',
        definition:
          'Modo donde un flanco externo en el pin físico congela una copia instantánea del valor del contador CNT dentro del registro CCRx.',
        siliconReality:
          'Permite medir la duración exacta de un pulso o la velocidad de giro de un motor con resolución de nanosegundos sin intervención de la CPU.',
        exampleToCopy: 'uint32_t delta_ticks = captura_actual - captura_anterior;'
      },
      {
        term: 'PIO (Programmable I/O en RP2040)',
        definition:
          'Bloque de máquinas de estado de hardware deterministas capaces de generar y capturar señales cronometradas al ciclo de reloj exacto en cualquier pin.',
        siliconReality:
          'Cada instrucción PIO tarda exactamente 1 ciclo de reloj, permitiendo crear más canales PWM, lectores de encoders o buses digitales a medida.',
        exampleToCopy: 'pio_sm_set_enabled(pio0, sm, true);'
      }
    ],
    goldenRules: [
      {
        title: 'Fórmula Maestra de Frecuencia del Timer (¡Enmarcar en el cuaderno!)',
        formulaOrRule: 'F_pwm = F_reloj_timer / ( (PSC + 1) * (ARR + 1) )',
        explanation: 'Nunca olvides restar 1 al escribir en los registros PSC y ARR porque el hardware empieza a contar desde el 0.'
      },
      {
        title: 'Fórmula del Ciclo de Trabajo (Duty Cycle %)',
        formulaOrRule: 'Duty (%) = ( CCR / (ARR + 1) ) * 100',
        explanation: 'Si ARR = 999 (1000 pasos en total), cada 10 unidades en CCR equivalen exactamente a un 1% de ciclo de trabajo.'
      },
      {
        title: 'Estándar Universal de Servomotores RC (50 Hz / 20 ms)',
        formulaOrRule: 'Periodo = 20.000 µs (50 Hz)  |  1000 µs = 0°  |  1500 µs = 90°  |  2000 µs = 180°',
        explanation: 'Configurando el Timer a 1 MHz (1 tick = 1 µs) y ARR = 19999, escribes directamente los microsegundos deseados (1000..2000) en CCR1.'
      },
      {
        title: 'Normativa Espacial ECSS-E-ST-40C (Annex M <5.3>) — Factor de Planificabilidad Temporal (S)',
        formulaOrRule: 'S_i = (C_i + I_i + B_i) / D_i  <= 1.0     (C=WCET, I=Interferencia ISR, B=Bloqueo, D=Deadline)',
        explanation: 'En software espacial de tiempo real duro es obligatorio demostrar analítica y empíricamente que el tiempo de respuesta en el peor caso de cada tarea periódica nunca supera su Deadline (S <= 1.0).'
      }
    ],
    sketchDiagramSteps: [
      'Dibuja una gráfica de diente de sierra (una rampa que sube de 0 hasta una línea punteada superior llamada "ARR" y cae vertical a 0): ese es el contador CNT.',
      'Cruza la rampa a media altura con una línea horizontal llamada "CCR1".',
      'Debajo dibuja la señal del pin: mientras la rampa está POR DEBAJO de la línea CCR1, dibuja el pulso en ALTO (3.3V). Cuando la rampa supera CCR1, dibuja la señal en BAJO (0V).'
    ],
    annotatedCodeToCopy: {
      code: `// Receta universal para configurar un PWM por hardware:
TIM2->PSC   = 84UL - 1UL;                 // 1. Reloj: 84 MHz / 84 = 1 MHz (1 us)
TIM2->ARR   = 20000UL - 1UL;              // 2. Periodo: 20.000 us = 20 ms (50 Hz Servo)
TIM2->CCR1  = 1500UL;                     // 3. Pulso en alto: 1.500 us (Posición 90º)
TIM2->CCMR1 = (6UL << 4) | (1UL << 3);    // 4. Modo PWM 1 (110) + Preload activo
TIM2->CCER |= (1UL << 0);                 // 5. Habilita salida hacia el pin físico
TIM2->CR1  |= (1UL << 0);                 // 6. Arranca el contador (CEN = 1)`,
      lineNotes: [
        'Paso 1 (PSC): Ajusta cuánto dura cada paso del reloj (1 microsegundo es ideal para cálculos mentales).',
        'Paso 2 (ARR): Fija cada cuánto se repite el ciclo completo.',
        'Paso 3 (CCR1): Puedes cambiarlo en cualquier momento desde tu código para mover el motor o variar el brillo del LED.'
      ]
    },
    codingChallenges: [
      {
        levelLabel: 'Nivel 1: Base',
        title: 'Reto 5.1 — Configurar Modo PWM 1 (Bits 6:4 = 6) y Preload (Bit 3 = 1)',
        instruction:
          'En el registro TIM2_CCMR1 (REG = 0), escribe la expresión en C para colocar el valor 6 (0b110 = Modo PWM 1) en los bits [6:4] y un 1 en el bit 3 (OC1PE Preload Enable). Valor esperado: 0x00000068.',
        initialRegValue: 0x00000000,
        regWidth: 32,
        expectedRegValue: 0x00000068,
        starterCode: 'REG = (6 << 4);',
        hint: 'Une ambos campos con OR: REG = (6 << 4) | (1 << 3);',
        solutionCode: 'REG = (6 << 4) | (1 << 3);',
        explanation:
          '(6 << 4) coloca 0b110 en los bits 6, 5 y 4 (0x60), y (1 << 3) activa el bit 3 (0x08), sumando 0x68.'
      },
      {
        levelLabel: 'Nivel 2: Intermedio',
        title: 'Reto 5.2 — Calcular y Escribir el Prescaler para Obtener 1 MHz desde 84 MHz',
        instruction:
          'El reloj de entrada del Timer es de 84 MHz y quieres dividirlo entre 84 para tener ticks de 1 microsegundo (1 MHz). Recuerda que el hardware divide entre (PSC + 1). Escribe la resta en C sobre REG para cargar el valor correcto de PSC (83 = 0x53).',
        initialRegValue: 0x00000000,
        regWidth: 32,
        expectedRegValue: 0x00000053,
        starterCode: 'REG = 84;',
        hint: 'Resta 1 al divisor deseado: REG = 84 - 1;',
        solutionCode: 'REG = 84 - 1;',
        explanation:
          'Al escribir 84 - 1 (83 = 0x53), el divisor real en silicio es (83 + 1) = 84, produciendo exactamente 1.000.000 Hz.'
      },
      {
        levelLabel: 'Nivel 3: Experto',
        title: 'Reto 5.3 — Empaquetar Duty Cycle de Canal A (250) y Canal B (750) en RP2040 PWM_CC',
        instruction:
          'En el RP2040, el registro PWM_CH2_CC guarda el comparador del Canal A en los bits [15:0] y el del Canal B en los bits [31:16]. Escribe la sentencia en C para poner Canal A = 250 y Canal B = 750 en REG. Valor esperado: 0x02EE00FA.',
        initialRegValue: 0x00000000,
        regWidth: 32,
        expectedRegValue: 0x02ee00fa,
        starterCode: 'REG = 250;',
        hint: 'Desplaza 750 dieciséis bits a la izquierda y únelo con 250: REG = (750 << 16) | 250;',
        solutionCode: 'REG = (750 << 16) | 250;',
        explanation:
          '750 en hexadecimal es 0x02EE (en los bits [31:16]) y 250 es 0x00FA (en los bits [15:0]), dando 0x02EE00FA.'
      }
    ],
    extraQuizzes: [
      {
        id: 'm5-q1',
        difficulty: 'Traza Mental',
        question: 'Si el reloj de tu Timer es de 16 MHz y configuras PSC = 15 y ARR = 999, ¿cuánto tiempo tarda el Timer en dar una vuelta completa (Periodo)?',
        options: [
          {
            id: 'a',
            label: '1 milisegundo (1000 microsegundos = 1 kHz).',
            isCorrect: true,
            feedback: '¡Cálculo perfecto! 16 MHz / (15 + 1) = 1 MHz (1 us por paso). Y (999 + 1) pasos * 1 us = 1000 us = 1 ms.'
          },
          {
            id: 'b',
            label: '16 milisegundos.',
            isCorrect: false,
            feedback: 'Al dividir 16 MHz entre (15 + 1), cada paso dura exactamente 1 microsegundo.'
          }
        ]
      },
      {
        id: 'm5-q2',
        difficulty: 'Lectura Datasheet',
        question: 'En un Timer de 16 bits (como TIM3 en STM32 o Timer1 en AVR), ¿cuál es el número máximo que puede almacenar el contador antes de desbordarse?',
        options: [
          {
            id: 'a',
            label: '65.535 (0xFFFF = 2^16 - 1).',
            isCorrect: true,
            feedback: '¡Exacto! Un registro de 16 bits sin signo cuenta desde 0 hasta 65.535.'
          },
          {
            id: 'b',
            label: '255 (0xFF).',
            isCorrect: false,
            feedback: '255 es el límite de un Timer de 8 bits (como Timer0 en el ATmega328P).'
          }
        ]
      },
      {
        id: 'm5-q3',
        difficulty: 'Caza del Bug',
        question: 'Tu Timer está contando hacia ARR = 999 sin Preload activo (ARPE = 0). Cuando CNT va por 850, tu código cambia ARR = 500 de golpe. ¿Qué ocurrirá en ese ciclo?',
        options: [
          {
            id: 'a',
            label: 'Como CNT (850) ya superó al nuevo ARR (500), no se reiniciará en 500 sino que seguirá contando hasta el final físico del registro (65.535 o 2^32-1) provocando un pulso gigante.',
            isCorrect: true,
            feedback: '¡Exacto! Por eso siempre se debe activar el bit ARPE (Auto-Reload Preload Enable) cuando se modifica ARR en caliente.'
          },
          {
            id: 'b',
            label: 'El contador retrocederá inmediatamente a 500.',
            isCorrect: false,
            feedback: 'El comparador de igualdad (CNT == ARR) ya quedó atrás, por lo que seguirá subiendo hasta desbordar.'
          }
        ]
      },
      {
        id: 'm5-q4',
        difficulty: 'Traza Mental',
        question: 'Con un Timer configurado a 1 MHz (1 tick = 1 µs) y ARR = 19999 (Periodo = 20 ms = 50 Hz para un servomotor), ¿qué valor debes escribir en CCR1 para producir el pulso central estándar de 1,5 milisegundos?',
        options: [
          {
            id: 'a',
            label: 'CCR1 = 1500 (porque 1500 ticks de 1 µs son exactamente 1,5 ms).',
            isCorrect: true,
            feedback: '¡Así de limpio! Configurar el reloj del Timer a 1 MHz hace que el valor de CCR1 coincida directamente con los microsegundos del pulso.'
          },
          {
            id: 'b',
            label: 'CCR1 = 10000.',
            isCorrect: false,
            feedback: '10000 microsegundos serían 10 ms (50% de Duty Cycle), lo cual está fuera del rango de un servomotor RC estándar (1000..2000 µs).'
          }
        ]
      }
    ]
  },

  // =========================================================================
  // MÓDULO 6
  // =========================================================================
  6: {
    moduleId: 6,
    notebookSummaryTitle: 'Apuntes Módulo 6: Cuadro Comparativo y Tramas de UART, I2C y SPI',
    whyWriteThisDown:
      'Dibujar las tres tramas (UART con Start/Stop, I2C con Dirección+ACK y SPI con CS/SCK/MOSI/MISO) en una página de tu cuaderno es la mejor herramienta de diagnóstico de laboratorio que existe.',
    definitions: [
      {
        term: 'Shift Register (Registro de Desplazamiento)',
        definition:
          'Circuito digital interno de los periféricos serie que recibe un byte de 8 bits en paralelo desde la CPU y lo empuja bit a bit por un único pin al ritmo del reloj.',
        siliconReality:
          'Permite que la CPU escriba el dato en 1 ciclo y se desentienda mientras los 8 bits salen por el cable.',
        exampleToCopy: 'USART2->DR = 0x41; // Carga el registro de desplazamiento'
      },
      {
        term: 'Bandera TXE vs TC en UART',
        definition:
          'TXE (Transmit Data Register Empty) indica que el buzón de entrada está libre para otro byte; TC (Transmission Complete) indica que el último bit ya salió físicamente por el cable.',
        siliconReality:
          'Antes de apagar el transceptor RS-485 o dormir el chip, debes esperar a TC=1 para no cortar el último byte a la mitad.',
        exampleToCopy: 'while (!(USART2->SR & (1UL << 7))) {} // Espera TXE=1'
      },
      {
        term: 'Bit ACK / NACK en I2C',
        definition:
          'Noveno pulso de reloj tras cada byte en I2C donde el emisor suelta la línea SDA y el receptor debe tirarla a 0V (ACK) para confirmar que existe y recibió el byte.',
        siliconReality:
          'Si la línea SDA se queda en 3.3V durante el 9º pulso de SCL, es un NACK (dirección incorrecta o cable suelto).',
        exampleToCopy: '// Dirección 7 bits de OLED SSD1306 = 0x3C'
      },
      {
        term: 'Ring Buffer (Buffer Circular FIFO)',
        definition:
          'Estructura de datos con un array fijo y dos índices (head y tail) donde la ISR de recepción inserta bytes y el bucle principal los consume sin perder ninguno.',
        siliconReality:
          'Si el tamaño es potencia de 2 (ej. 64), el avance circular se calcula en 1 ciclo con (head + 1) & 63.',
        exampleToCopy: 'rb.buf[rb.head] = UART->DR; rb.head = (rb.head + 1U) & 63U;'
      },
      {
        term: 'CPOL y CPHA (Modos SPI 0, 1, 2 y 3)',
        definition:
          'Bits que configuran la polaridad de reposo del reloj SCK (CPOL) y el flanco de captura del dato (CPHA) en el bus SPI.',
        siliconReality:
          'Maestro y Esclavo deben tener exactamente el mismo Modo SPI (normalmente Modo 0 o Modo 3) para no leer los bits desplazados.',
        exampleToCopy: 'SPI1->CR1 |= (1UL << 1) | (1UL << 0); // CPOL=1, CPHA=1 (Modo 3)'
      },
      {
        term: 'Overrun Error (ORE)',
        definition:
          'Error de hardware que salta cuando llega un nuevo byte completo por el cable serie pero el software aún no había leído el byte anterior del registro DR.',
        siliconReality:
          'Se evita usando interrupciones RXNE con un Ring Buffer o delegando la recepción al controlador DMA.',
        exampleToCopy: '// Nunca uses delays largos mientras recibes tramas UART'
      }
    ],
    goldenRules: [
      {
        title: 'Resumen de Cables y Velocidades para tu Cuaderno',
        formulaOrRule: 'UART: 2 cables (TX/RX, Asíncrono, LSB-first) | I2C: 2 cables (SDA/SCL Open-Drain, hasta 127 chips, MSB-first) | SPI: 4 cables (SCK/MOSI/MISO/CS Push-Pull, Full-Duplex, el más rápido).',
        explanation: 'Usa I2C para sensores lentos compartiendo pines; usa SPI para pantallas, memorias Flash y ADCs rápidos; usa UART para consolas de debug y módulos GPS/Celulares.'
      },
      {
        title: 'Fórmula del Tiempo de Transmisión en UART (Trama 8N1 = 10 bits por byte)',
        formulaOrRule: 'T_byte = 10 bits / Baudrate   (Ej. a 115200 baudios: 10 / 115200 = 86,8 µs por cada byte)',
        explanation: 'Cada byte en UART 8N1 ocupa 10 tiempos de bit en el cable: 1 Start Bit (0V) + 8 Data Bits + 1 Stop Bit (3.3V).'
      },
      {
        title: 'Formación del Primer Byte en I2C (Dirección 7 bits + Bit R/W)',
        formulaOrRule: 'Byte_Escritura = (Addr_7bit << 1) | 0   |   Byte_Lectura = (Addr_7bit << 1) | 1',
        explanation: 'Para el sensor 0x3C: escribir envía 0x78 y leer envía 0x79.'
      },
      {
        title: 'Normativa Espacial ECSS-E-ST-40C (Annex U.2 #2, #3, #11) & NASA JPL (Regla 2)',
        formulaOrRule: 'PROHIBIDO: while() esperando flags UART/I2C/SPI sin cota fija de iteraciones o escribir en buffers sin chequear longitud.',
        explanation: 'Todo bucle de polling de hardware debe tener un contador máximo de salida (Timeout) y las lecturas dummy necesarias para limpiar flags de error hardware (Check #11) deben documentarse con (void)dummy;.'
      }
    ],
    sketchDiagramSteps: [
      'Haz una tabla de 3 filas en tu cuaderno: Fila 1 = UART, Fila 2 = I2C, Fila 3 = SPI.',
      'En UART dibuja la línea en alto (Idle=1), baja a 0 en el "Start Bit", dibuja 8 cajitas (Bit 0 a Bit 7) y sube a 1 en el "Stop Bit".',
      'En I2C anota: "Ambos pines Open-Drain con resistencias Pull-Up de 4.7 kΩ hacia 3.3V".',
      'En SPI dibuja un círculo entre la caja "Maestro" y la caja "Esclavo": la flecha de arriba es MOSI y la de abajo es MISO (cuando giran 8 pulsos de reloj SCK, los dos intercambian su byte a la vez).'
    ],
    annotatedCodeToCopy: {
      code: `// Patrón universal Polling para enviar y recibir por Serie:
void uart_send_char(uint8_t c) {
    while ((USART2->SR & (1UL << 7)) == 0UL) { } // 1. Espera TXE == 1
    USART2->DR = c;                              // 2. Escribe byte en DR
}

uint8_t spi_transfer_byte(uint8_t out_byte) {
    while ((SPI1->SR & (1UL << 1)) == 0UL) { }   // 1. Espera TXE == 1
    SPI1->DR = out_byte;                         // 2. Envía por MOSI y genera 8 pulsos SCK
    while ((SPI1->SR & (1UL << 0)) == 0UL) { }   // 3. Espera RXNE == 1
    return (uint8_t)SPI1->DR;                    // 4. Devuelve el byte que entró por MISO
}`,
      lineNotes: [
        'En SPI, incluso si solo quieres LEER un sensor, debes escribir un byte dummy (ej. 0x00 o 0xFF) en SPI1->DR para que el maestro genere los 8 pulsos de reloj SCK.'
      ]
    },
    codingChallenges: [
      {
        levelLabel: 'Nivel 1: Base',
        title: 'Reto 6.1 — Habilitar Transmisor (Bit 3), Receptor (Bit 2) y Periférico UART (Bit 13)',
        instruction:
          'En el registro USART_CR1 (REG = 0), escribe la sentencia en C para encender el bit 13 (UE: UART Enable), el bit 3 (TE: Transmitter Enable) y el bit 2 (RE: Receiver Enable). Valor esperado: 0x0000200C.',
        initialRegValue: 0x00000000,
        regWidth: 32,
        expectedRegValue: 0x0000200c,
        starterCode: 'REG = (1 << 13);',
        hint: 'Une los tres bits con OR: REG = (1 << 13) | (1 << 3) | (1 << 2);',
        solutionCode: 'REG = (1 << 13) | (1 << 3) | (1 << 2);',
        explanation:
          '(1 << 13) es 0x2000, (1 << 3) es 0x08 y (1 << 2) es 0x04, sumando 0x0000200C.'
      },
      {
        levelLabel: 'Nivel 2: Intermedio',
        title: 'Reto 6.2 — Formar el Byte de Dirección I2C de Lectura (7-bit Addr 0x3C + Bit R/W = 1)',
        instruction:
          'Para iniciar una LECTURA I2C del dispositivo con dirección de 7 bits 0x3C, debes desplazar la dirección 1 bit a la izquierda y poner el bit 0 (R/W) en 1. Escribe la expresión en C sobre REG. Valor esperado: 0x00000079.',
        initialRegValue: 0x00000000,
        regWidth: 32,
        expectedRegValue: 0x00000079,
        starterCode: 'REG = (0x3C << 1);',
        hint: 'Añade | 1 para indicar operación de Lectura (Read): REG = (0x3C << 1) | 1;',
        solutionCode: 'REG = (0x3C << 1) | 1;',
        explanation:
          '(0x3C << 1) es 0x78 (dirección de escritura), y al encender el bit 0 con | 1 obtenemos 0x79 (dirección de lectura).'
      },
      {
        levelLabel: 'Nivel 3: Experto',
        title: 'Reto 6.3 — Configurar Divisor de Baudrate Fraccional en USART_BRR (Mantisa=22, Fracción=13)',
        instruction:
          'Para lograr 115.200 baudios con un reloj APB1 de 42 MHz en STM32, la mantisa (22) va en los bits [15:4] y la fracción (13) va en los bits [3:0] del registro USART_BRR (REG). Escribe la expresión en C. Valor esperado: 0x0000016D.',
        initialRegValue: 0x00000000,
        regWidth: 32,
        expectedRegValue: 0x0000016d,
        starterCode: 'REG = (22 << 4);',
        hint: 'Une la mantisa desplazada 4 bits con la fracción 13: REG = (22 << 4) | 13;',
        solutionCode: 'REG = (22 << 4) | 13;',
        explanation:
          '22 en hex es 0x16 -> desplazado 4 bits es 0x160. Más 13 (0xD) da exactamente 0x016D.'
      }
    ],
    extraQuizzes: [
      {
        id: 'm6-q1',
        difficulty: 'Lectura Datasheet',
        question: 'En el protocolo SPI, quieres leer 1 byte de un sensor de presión. ¿Cómo consigues que el sensor te envíe esos 8 bits por la línea MISO?',
        options: [
          {
            id: 'a',
            label: 'Bajando CS a 0V y escribiendo un byte dummy (ej. 0x00) en el registro DR del Maestro para que éste genere los 8 pulsos de reloj en SCK.',
            isCorrect: true,
            feedback: '¡Exacto! En SPI el Esclavo no puede generar el reloj SCK por sí mismo: solo el Maestro genera reloj cuando escribe un byte en su registro de transmisión.'
          },
          {
            id: 'b',
            label: 'Simplemente leyendo el registro DR sin enviar nada.',
            isCorrect: false,
            feedback: 'Si el Maestro no escribe en DR, no salen pulsos por SCK y el Esclavo nunca desplaza sus bits hacia MISO.'
          }
        ]
      },
      {
        id: 'm6-q2',
        difficulty: 'Traza Mental',
        question: 'En un Ring Buffer de tamaño 64 bytes (índices 0 a 63), el índice "head" vale actualmente 63. Si ejecutas head = (head + 1U) & 63U; ¿qué valor toma "head"?',
        options: [
          {
            id: 'a',
            label: '0 (porque 64 en binario es 0b01000000 y 63 es 0b00111111; su AND bit a bit da 0 dando la vuelta circular en 1 ciclo).',
            isCorrect: true,
            feedback: '¡Magia binaria! Por eso los Ring Buffers en sistemas embebidos se dimensionan siempre en potencias de 2 (32, 64, 128, 256).'
          },
          {
            id: 'b',
            label: '64.',
            isCorrect: false,
            feedback: 'La máscara & 63U limpia el bit 6 haciendo que vuelva automáticamente al índice 0.'
          }
        ]
      },
      {
        id: 'm6-q3',
        difficulty: 'Caza del Bug',
        question: 'En un enlace RS-485 o antes de meter el microcontrolador en modo Deep Sleep, escribes el último byte en USART2->DR, esperas solo a que TXE == 1 y apagas inmediatamente el transmisor. El receptor recibe el último carácter corrupto. ¿Por qué?',
        options: [
          {
            id: 'a',
            label: 'Porque TXE == 1 solo indica que el byte pasó del buzón DR al Shift Register interno, pero los 10 bits aún están saliendo por el cable. Hay que esperar a la bandera TC == 1 (Transmission Complete).',
            isCorrect: true,
            feedback: '¡Diagnóstico de ingeniero senior! TXE sirve para encolar más bytes, pero para saber cuándo salió físicamente el último bit Stop por el pin hay que mirar TC (Transmission Complete).'
          },
          {
            id: 'b',
            label: 'Porque el Baudrate cambia al apagar el transmisor.',
            isCorrect: false,
            feedback: 'El problema es apagar el pin antes de que el registro de desplazamiento termine de sacar los 10 bits.'
          }
        ]
      },
      {
        id: 'm6-q4',
        difficulty: 'Lectura Datasheet',
        question: 'El Datasheet de un sensor SPI dice que opera en "SPI Mode 0 (CPOL = 0, CPHA = 0)". ¿En qué nivel lógico reposa el reloj SCK y en qué flanco se captura el dato?',
        options: [
          {
            id: 'a',
            label: 'SCK reposa en 0V (BAJO) y el bit se captura en el flanco de SUBIDA (primer flanco).',
            isCorrect: true,
            feedback: '¡Exacto! CPOL=0 significa reposo en 0V y CPHA=0 significa muestreo en el primer flanco (de 0V a 3.3V).'
          },
          {
            id: 'b',
            label: 'SCK reposa en 3.3V (ALTO) y el bit se captura en el flanco de SUBIDA.',
            isCorrect: false,
            feedback: 'Eso sería SPI Mode 3 (CPOL = 1, CPHA = 1).'
          }
        ]
      }
    ]
  },

  // =========================================================================
  // MÓDULO 7
  // =========================================================================
  7: {
    moduleId: 7,
    notebookSummaryTitle: 'Apuntes Módulo 7: Conversión Analógica-Digital (SAR ADC) y Controlador DMA',
    whyWriteThisDown:
      'Anotar la ecuación de cuantización del ADC y el esquema de punteros del DMA (Origen Fijo vs Destino Incremental) te dará fluidez total en adquisición de señales.',
    definitions: [
      {
        term: 'ADC de Aproximación Sucesiva (SAR ADC)',
        definition:
          'Conversor analógico-digital que descubre el voltaje de entrada mediante búsqueda binaria en N pasos (1 paso por cada bit de resolución) comparando el pin con un DAC interno.',
        siliconReality:
          'En un ADC de 12 bits, empieza probando la mitad del voltaje (Bit 11 = 2048): si V_in es mayor deja el bit en 1, si es menor lo pone en 0, y pasa al Bit 10.',
        exampleToCopy: 'uint32_t mv = (adc_raw * 3300UL) / 4095UL;'
      },
      {
        term: 'DMA (Direct Memory Access)',
        definition:
          'Controlador de hardware capaz de tomar el control del bus de memoria para copiar bloques de datos entre periféricos y SRAM sin ejecutar instrucciones en la CPU.',
        siliconReality:
          'Despierta solo cuando el periférico levanta su línea de petición (DMA Request), copia la palabra en 1-2 ciclos de bus y vuelve a esperar.',
        exampleToCopy: 'DMA2_Stream0->NDTR = 64; // Copiar 64 muestras automáticamente'
      },
      {
        term: 'Buffer Circular / Doble Buffer (Ping-Pong DMA)',
        definition:
          'Modo donde el DMA reinicia su puntero al principio del array al terminar y avisa a la CPU a mitad del buffer (Half-Transfer) y al final (Transfer-Complete).',
        siliconReality:
          'Evita perder muestras en tiempo real (audio, control de motores, osciloscopios) porque la CPU lee la mitad A mientras el DMA rellena la mitad B.',
        exampleToCopy: 'DMA2_Stream0->CR |= DMA_SxCR_CIRC;'
      },
      {
        term: 'Sample & Hold Capacitor (Condensador de Muestreo)',
        definition:
          'Pequeño condensador interno (~5 pF) a la entrada del ADC que se conecta brevemente al pin exterior para copiar su voltaje antes de iniciar la búsqueda binaria SAR.',
        siliconReality:
          'Si el sensor tiene alta impedancia (>10 kΩ), debes aumentar el tiempo de muestreo en el registro ADC_SMPR para que el condensador llegue a cargarse al 100%.',
        exampleToCopy: 'ADC1->SMPR2 |= (7UL << 0); // Máximo tiempo de muestreo (480 ciclos)'
      },
      {
        term: 'Filtro Digital EMA (Exponential Moving Average)',
        definition:
          'Filtro paso-bajo recursivo en C entero que suaviza el ruido de las lecturas del ADC combinando una fracción de la nueva muestra con el promedio histórico.',
        siliconReality:
          'Usando desplazamientos de bits (>> 2 o >> 3) limpia el ruido eléctrico en 3 ciclos de reloj sin usar variables float ni arrays grandes.',
        exampleToCopy: 'acc = ((acc * 7UL) + nuevo_adc) >> 3U; // Filtro EMA 7/8 + 1/8'
      },
      {
        term: 'EasyDMA (Arquitectura DMA Directa en nRF52840)',
        definition:
          'Diseño de Nordic donde cada periférico (SAADC, SPIM, TWIM, UARTE) incluye su propio puntero de RAM (.PTR) y contador (.MAXCNT) integrados.',
        siliconReality:
          'Basta con asignar la dirección de un array en C a NRF_SAADC->RESULT.PTR para que las muestras caigan directas en RAM sin configurar canales DMA complejos.',
        exampleToCopy: 'NRF_SAADC->RESULT.PTR = (uint32_t)mi_buffer_ram;'
      }
    ],
    goldenRules: [
      {
        title: 'Fórmula de Resolución y Voltaje de un ADC de N bits',
        formulaOrRule: 'Escalones = (2^N - 1)   |   V_pin = (Lectura_ADC * V_ref) / (2^N - 1)',
        explanation: 'Para 10 bits: divide entre 1023. Para 12 bits: divide entre 4095. Multiplica primero por 3300 (milivoltios) antes de dividir para no necesitar números decimales float.'
      },
      {
        title: 'Regla de Oro de la Aritmética Entera en C (¡Multiplicar Antes de Dividir!)',
        formulaOrRule: 'CORRECTO: (raw * 3300UL) / 4095UL   |   INCORRECTO: (raw / 4095UL) * 3300UL -> ¡Da 0!',
        explanation: 'En números enteros de C, dividir un número menor entre uno mayor trunca el resultado a 0 inmediatamente.'
      },
      {
        title: 'Teorema de Muestreo de Nyquist-Shannon',
        formulaOrRule: 'F_muestreo >= 2 * F_max_señal   (En la práctica industrial: F_muestreo >= 10 * F_max_señal)',
        explanation: 'Para capturar sin distorsión (aliasing) una onda de 1 kHz necesitas muestrear como mínimo absoluto a >2 kHz, e idealmente a 10 kHz.'
      },
      {
        title: 'Normativa Espacial ECSS-E-ST-40C (Annex U.2 #1 y #6) — Tiempo de Vida en DMA y Protección Numérica',
        formulaOrRule: 'PROHIBIDO: Apuntar un canal DMA a una variable local del Stack o realizar divisiones sin proteger denominador == 0.',
        explanation: 'El Check #6 de ECSS exige que el tiempo de vida (lifetime) de toda variable sea coherente con su uso asíncrono (los buffers DMA deben ser siempre static/globales en SRAM) y el Check #1 exige prevenir overflow/underflow.'
      }
    ],
    sketchDiagramSteps: [
      'Dibuja a la izquierda un periférico "ADC1->DR (Dirección fija 0x4001204C)".',
      'Dibuja a la derecha una fila de casillas en RAM: "buf[0], buf[1], buf[2], buf[3]".',
      'En el centro dibuja un robot llamado "Controlador DMA" que toma cada dato nuevo de ADC1->DR y mueve su brazo una casilla a la derecha en RAM (MINC = 1), mientras arriba la "CPU" está libre o durmiendo.'
    ],
    annotatedCodeToCopy: {
      code: `// Conversión de ADC de 12 bits a milivoltios en coma fija (Sin usar float):
uint32_t adc_to_millivolts(uint16_t raw_12bit) {
    // Multiplicamos primero por 3300 mV (cabe de sobra en un uint32_t)
    // y dividimos al final entre 4095 para no perder precisión entera:
    return ((uint32_t)raw_12bit * 3300UL) / 4095UL;
}`,
      lineNotes: [
        'Si hicieras (raw / 4095) * 3300 en enteros, ¡(raw / 4095) daría siempre 0! En aritmética entera siempre se multiplica primero y se divide después.'
      ]
    },
    codingChallenges: [
      {
        levelLabel: 'Nivel 1: Base',
        title: 'Reto 7.1 — Configurar Canal DMA (Incremento RAM Bit 10 + Modo Circular Bit 8 + Enable Bit 0)',
        instruction:
          'Configura el registro de control DMA_CR (REG) activando el bit 10 (MINC: Memory Increment), el bit 8 (CIRC: Circular Mode) y el bit 0 (EN: Stream Enable). Valor esperado: 0x00000501.',
        initialRegValue: 0x00000000,
        regWidth: 32,
        expectedRegValue: 0x00000501,
        starterCode: 'REG = (1 << 10);',
        hint: 'Escribe: REG = (1 << 10) | (1 << 8) | (1 << 0);',
        solutionCode: 'REG = (1 << 10) | (1 << 8) | (1 << 0);',
        explanation:
          '(1 << 10) = 0x400, (1 << 8) = 0x100 y (1 << 0) = 0x001, dando 0x00000501.'
      },
      {
        levelLabel: 'Nivel 2: Intermedio',
        title: 'Reto 7.2 — Promediar una Suma de 16 Muestras del ADC en 1 Ciclo usando Desplazamiento',
        instruction:
          'Has sumado 16 lecturas del ADC y el total acumulado es 32.768 (0x8000). Divide ese total entre 16 usando el operador de desplazamiento a la derecha (>>) para dejar el promedio (2048 = 0x0800) en REG.',
        initialRegValue: 32768,
        regWidth: 32,
        expectedRegValue: 2048,
        starterCode: 'REG = REG >> 1;',
        hint: 'Como 16 es 2^4, dividir entre 16 equivale a desplazar 4 bits a la derecha: REG = REG >> 4;',
        solutionCode: 'REG = REG >> 4;',
        explanation:
          'Desplazar 4 bits a la derecha (>> 4) divide entre 16 en 1 solo ciclo de reloj sin usar el divisor hardware.'
      },
      {
        levelLabel: 'Nivel 3: Experto',
        title: 'Reto 7.3 — Conversión de Lectura ADC (2048) a Milivoltios en Coma Fija',
        instruction:
          'Con V_ref = 3300 mV y un rango de 4096 pasos, calcula en C entero los milivoltios correspondientes a la lectura 2048 multiplicando por 3300 y dividiendo entre 4096 (>> 12). Valor esperado: 1650 mV (0x00000672).',
        initialRegValue: 0,
        regWidth: 32,
        expectedRegValue: 1650,
        starterCode: 'REG = (2048 * 3300);',
        hint: 'Divide entre 4096 al final: REG = (2048 * 3300) / 4096;',
        solutionCode: 'REG = (2048 * 3300) / 4096;',
        explanation:
          '2048 * 3300 = 6.758.400. Dividido entre 4096 da exactamente 1650 mV (1.65 V, la mitad de 3.30 V).'
      }
    ],
    extraQuizzes: [
      {
        id: 'm7-q1',
        difficulty: 'Traza Mental',
        question: 'En un ADC de 12 bits con voltaje de referencia de 3.3V (3300 mV), si en el pin físico hay exactamente 1.65V (la mitad de 3.3V), ¿qué valor entero aproximado leerás en el registro del ADC?',
        options: [
          {
            id: 'a',
            label: '~2048 (la mitad de 4095).',
            isCorrect: true,
            feedback: '¡Exacto! 2^12 = 4096 niveles (0 a 4095). La mitad de la escala analógica corresponde al bit más significativo (2048).'
          },
          {
            id: 'b',
            label: '~512.',
            isCorrect: false,
            feedback: '512 sería la mitad en un ADC de 10 bits (0..1023), como el del ATmega328P.'
          }
        ]
      },
      {
        id: 'm7-q2',
        difficulty: 'Caza del Bug',
        question: 'Un programador quiere convertir la lectura del ADC (ej. raw = 3000) a milivoltios usando enteros y escribe: uint32_t mv = (raw / 4095) * 3300; Pero "mv" da SIEMPRE 0 (salvo cuando raw vale 4095). ¿Por qué?',
        options: [
          {
            id: 'a',
            label: 'Porque en división entera de C, (3000 / 4095) trunca los decimales y da 0; luego 0 * 3300 = 0. Siempre hay que multiplicar primero: (raw * 3300UL) / 4095UL.',
            isCorrect: true,
            feedback: '¡Clásico bug industrial! En aritmética entera siempre se hace la multiplicación primero y la división al final.'
          },
          {
            id: 'b',
            label: 'Porque C no permite dividir entre 4095.',
            isCorrect: false,
            feedback: 'Sí permite dividir, pero dividir un entero menor entre uno mayor da cociente entero 0.'
          }
        ]
      },
      {
        id: 'm7-q3',
        difficulty: 'Lectura Datasheet',
        question: 'Al configurar un canal DMA para llevar muestras desde el registro único ADC1->DR hasta el array uint16_t buffer[64] en RAM, ¿cómo deben configurarse los bits de auto-incremento de puntero PINC (Periférico) y MINC (Memoria)?',
        options: [
          {
            id: 'a',
            label: 'PINC = 0 (Dirección del periférico fija) y MINC = 1 (Dirección de memoria RAM auto-incremental).',
            isCorrect: true,
            feedback: '¡Exacto! El registro ADC1->DR está siempre en la misma dirección física, mientras que en RAM queremos rellenar buffer[0], buffer[1], buffer[2]...'
          },
          {
            id: 'b',
            label: 'PINC = 1 y MINC = 0.',
            isCorrect: false,
            feedback: 'Si pusieras PINC=1, en la segunda muestra el DMA intentaría leer el registro siguiente a ADC1->DR en vez del registro de datos del ADC.'
          }
        ]
      },
      {
        id: 'm7-q4',
        difficulty: 'Caza del Bug',
        question: 'Declaras un array local uint16_t muestras[32]; dentro de una función iniciar_captura(), le pasas su dirección al DMA en modo continuo y la función iniciar_captura() termina y retorna a main(). Unos milisegundos después el microcontrolador entra en HardFault. ¿Por qué?',
        options: [
          {
            id: 'a',
            label: 'Porque muestras[32] vivía en el Stack temporal de esa función; al retornar la función, esa memoria del Stack es reutilizada por otras llamadas y el DMA machaca las direcciones de retorno de la pila.',
            isCorrect: true,
            feedback: '¡Regla de oro del DMA! Todo buffer usado por el controlador DMA debe ser global o "static" para que tenga una dirección permanente en SRAM.'
          },
          {
            id: 'b',
            label: 'Porque el DMA no puede escribir en la memoria SRAM.',
            isCorrect: false,
            feedback: 'El DMA sí escribe en SRAM, pero nunca debes apuntarlo a una variable local efímera de la pila (Stack).'
          }
        ]
      }
    ]
  },

  // =========================================================================
  // MÓDULO 8
  // =========================================================================
  8: {
    moduleId: 8,
    notebookSummaryTitle: 'Apuntes Módulo 8: Arquitectura de Firmware Senior — HAL, FSM, Watchdog y RTOS',
    whyWriteThisDown:
      'Copiar la plantilla de Máquina de Estados Finitos (FSM) y la estructura de Driver con punteros a funciones en tu cuaderno te servirá como esqueleto para todos los proyectos profesionales que hagas en tu vida.',
    definitions: [
      {
        term: 'HAL (Hardware Abstraction Layer)',
        definition:
          'Capa de software que oculta los registros específicos de un microcontrolador detrás de una interfaz limpia de funciones C para que la aplicación sea portable.',
        siliconReality:
          'Mediante structs de punteros a funciones o funciones static inline en cabeceras, logra portabilidad sin sacrificar rendimiento.',
        exampleToCopy: 'hal_gpio->write(PIN_ALARMA, true);'
      },
      {
        term: 'FSM (Finite State Machine — Máquina de Estados Finitos)',
        definition:
          'Modelo de diseño donde el firmware se encuentra siempre en uno de un número finito de estados bien definidos y solo cambia de estado cuando ocurre un evento.',
        siliconReality:
          'Elimina por completo el código bloqueante (delay), permitiendo que un solo núcleo atienda 10 tareas concurrentes en microsegundos.',
        exampleToCopy: 'switch (estado_actual) { case ESTADO_IDLE: ... }'
      },
      {
        term: 'Watchdog Timer (IWDG — Perro Guardián)',
        definition:
          'Temporizador de hardware independiente (con su propio oscilador interno) que reinicia automáticamente todo el microcontrolador si el software no lo refresca periódicamente.',
        siliconReality:
          'Es el seguro de vida de satélites, coches y equipos industriales: si un ruido electromagnético cuelga la CPU en un bucle infinito, el Watchdog hace un Reset físico y recupera el sistema.',
        exampleToCopy: 'IWDG->KR = 0xAAAAU; // Refresca el Watchdog ("Feed the dog")'
      },
      {
        term: 'Context Switch (Cambio de Contexto en RTOS)',
        definition:
          'Proceso mediante el cual el planificador de un sistema operativo en tiempo real (como FreeRTOS o Zephyr) congela una tarea, guarda sus registros en su pila RAM y restaura los registros de otra tarea.',
        siliconReality:
          'En ARM Cortex-M ocurre dentro de la interrupción PendSV cambiando el registro puntero de pila PSP (Process Stack Pointer).',
        exampleToCopy: 'vTaskDelay(pdMS_TO_TICKS(10)); // Cede la CPU a otras tareas'
      },
      {
        term: 'Mutex (Mutual Exclusion con Herencia de Prioridad)',
        definition:
          'Primitiva de sincronización en un RTOS que actúa como un candado para proteger un recurso compartido (como un bus I2C, SPI o pantalla) entre varias tareas.',
        siliconReality:
          'A diferencia de un semáforo binario, un Mutex incluye "Priority Inheritance": si una tarea baja tiene el Mutex y una tarea alta lo pide, el RTOS sube temporalmente la prioridad de la tarea baja para que termine rápido.',
        exampleToCopy: 'xSemaphoreTake(i2c_mutex, portMAX_DELAY); ... xSemaphoreGive(i2c_mutex);'
      },
      {
        term: 'Instrucción WFI / WFE (Wait For Interrupt / Event)',
        definition:
          'Instrucción máquina nativa que apaga el árbol de reloj de la CPU inmediatamente hasta que cualquier periférico habilitado dispare una interrupción o evento.',
        siliconReality:
          'Colocada al final del bucle principal o en la tarea Idle del RTOS, reduce el consumo del chip de miliamperios a microamperios sin perder capacidad de respuesta.',
        exampleToCopy: '__WFI(); // Duerme el núcleo en 1 ciclo hasta la próxima IRQ'
      },
      {
        term: 'Punteros a Función y Callbacks (typedef void (*cb_t)(void))',
        definition:
          'Variable capaz de almacenar la dirección física de Flash donde inicia una función, permitiendo su ejecución dinámica e indirecta. En arquitectura de drivers, desacopla la interrupción (ISR) de la lógica de aplicación.',
        siliconReality:
          'Ocupa 4 bytes en RAM (dirección de 32 bits de Flash). La CPU invoca la función mediante la instrucción de salto con enlace indirecto BLX (ARM Thumb) o JALR (RISC-V).',
        exampleToCopy: 'typedef void (*isr_callback_t)(uint16_t pin);  void gpio_set_cb(isr_callback_t cb);'
      },
      {
        term: 'Funciones "static inline" en Archivos de Cabecera (.h)',
        definition:
          'Combinación que permite escribir funciones completas en archivos .h: "inline" sugiere incrustar el código máquina eliminando el salto CALL/RET, y "static" le da visibilidad privada (internal linkage) a cada .c, evitando el fallo de Linker por símbolos duplicados.',
        siliconReality:
          'Al compilar, el código de la función se incrusta directamente en el punto de llamada como una macro, pero con control de tipos estricto y sin saltos de CPU.',
        exampleToCopy: 'static inline uint32_t pin_read_fast(volatile const uint32_t *r, uint8_t p) { return (*r >> p) & 1UL; }'
      }
    ],
    goldenRules: [
      {
        title: 'Ley de Arquitectura en Capas (Prohibido Saltarse Capas)',
        formulaOrRule: '[Aplicación / FSM]  --->  [Interfaz Driver / HAL]  --->  [Registros del Silicio]',
        explanation: 'El archivo de aplicación jamás debe incluir registros crudos del fabricante; así puedes probar la lógica de tu producto incluso en tu PC antes de tener la placa física.'
      },
      {
        title: 'Regla de Callbacks: Desacoplamiento entre Driver e Interrupción',
        formulaOrRule: 'if (g_callback != NULL) { g_callback(args); }',
        explanation: 'El driver de hardware jamás debe conocer la lógica de negocio; valida siempre el puntero contra NULL antes de invocar la dirección.'
      },
      {
        title: 'Regla ODR (One Definition Rule): Funciones en .h siempre static inline',
        formulaOrRule: 'static inline tipo_retorno nombre_funcion(params) { ... }',
        explanation: 'Nunca definas una función ordinaria en un archivo .h: generaría el error "multiple definition of symbol" en el Linker al incluirse en más de un archivo .c.'
      },
      {
        title: 'Regla de Oro del Watchdog Industrial',
        formulaOrRule: 'NUNCA refrescar el Watchdog en una ISR de Timer; refrescarlo SOLO en el bucle principal tras verificar la salud de las tareas.',
        explanation: 'Si alimentas al Watchdog dentro de una interrupción de Timer y tu aplicación principal se cuelga, el Timer seguirá alimentando al perro y el sistema jamás se reiniciará.'
      },
      {
        title: 'Ecuación de Autonomía de Batería en Dispositivos IoT (Low-Power)',
        formulaOrRule: 'I_media = (I_activo * T_activo + I_sleep * T_sleep) / (T_activo + T_sleep)   |   Horas = Capacidad_mAh / I_media',
        explanation: 'Si tu chip consume 10 mA durante 1 ms midiendo y 2 µA durante 999 ms durmiendo (__WFI), el consumo medio cae a ~12 µA (¡años de pila!).'
      },
      {
        title: 'Normativa Espacial ECSS-Q-ST-80C (Cláusulas 3.2.9 Note 1, 6.2.2.10 y 6.2.10.1)',
        formulaOrRule: 'OBLIGATORIO: Rama default: defensiva en toda FSM y Aislamiento (Particionado) entre tareas de distinta Criticidad.',
        explanation: 'ECSS aclara que el código de programación defensiva (default: que lleva al satélite a Safe Mode ante un bit-flip) NO es código desactivado, y exige aislar recursos entre tareas Cat A y Cat D.'
      }
    ],
    sketchDiagramSteps: [
      'Dibuja 3 círculos (Estados de una FSM): "IDLE (Reposo)" -> "MIDIENDO (ADC)" -> "TRANSMITIENDO (UART)" y vuelve con una flecha a "IDLE".',
      'Encima de cada flecha escribe el Evento que provoca el salto: "Evento: Timer 100ms", "Evento: DMA Completo", "Evento: TX Vacío".',
      'Abajo dibuja una pirámide de 3 pisos: Base = "Silicio y Registros", Medio = "Drivers HAL en C", Cima = "Lógica de Aplicación / FSM".'
    ],
    annotatedCodeToCopy: {
      code: `// Plantilla Profesional de Máquina de Estados No-Bloqueante en C:
typedef enum {
    ST_IDLE = 0,
    ST_SAMPLING,
    ST_SENDING
} app_state_t;

void app_fsm_step(app_state_t *state, bool timer_ev, bool adc_done_ev) {
    switch (*state) {
        case ST_IDLE:
            if (timer_ev) { adc_start(); *state = ST_SAMPLING; }
            break;
        case ST_SAMPLING:
            if (adc_done_ev) { uart_tx_dma(); *state = ST_SENDING; }
            break;
        case ST_SENDING:
            *state = ST_IDLE;
            break;
    }
}`,
      lineNotes: [
        'Observa que app_fsm_step() tarda menos de 1 microsegundo en ejecutarse: entra, evalúa el estado actual, actúa si hay evento y sale inmediatamente sin bloquear la CPU.'
      ]
    },
    codingChallenges: [
      {
        levelLabel: 'Nivel 1: Base',
        title: 'Reto 8.1 — Alimentar al Perro Guardián (Watchdog Key Register = 0xAAAA)',
        instruction:
          'Para evitar que el Independent Watchdog (IWDG) reinicie el microcontrolador debes escribir la llave hexadecimal 0xAAAA en el registro IWDG_KR (REG) al final de cada ciclo saludable de tu máquina de estados.',
        initialRegValue: 0x00000000,
        regWidth: 32,
        expectedRegValue: 0x0000aaaa,
        starterCode: 'REG = 0x0000;',
        hint: 'Escribe: REG = 0xAAAA;',
        solutionCode: 'REG = 0xAAAA;',
        explanation:
          'En el periférico IWDG, 0xCCCC arranca el Watchdog, 0x5555 desbloquea sus registros y 0xAAAA recarga el contador.'
      },
      {
        levelLabel: 'Nivel 2: Intermedio',
        title: 'Reto 8.2 — Máscara de Eventos (Event Flags Group) en un RTOS / Superloop',
        instruction:
          'Tu tarea espera a que se cumplan 3 banderas de evento antes de transmitir: EVT_ADC_OK (bit 0), EVT_GPS_LOCK (bit 3) y EVT_WIFI_READY (bit 7). Escribe la máscara en C sobre REG que representa las 3 banderas activas a la vez. Valor esperado: 0x00000089.',
        initialRegValue: 0x00000000,
        regWidth: 32,
        expectedRegValue: 0x00000089,
        starterCode: 'REG = (1 << 0) | (1 << 3);',
        hint: 'Añade el bit 7: REG = (1 << 0) | (1 << 3) | (1 << 7);',
        solutionCode: 'REG = (1 << 0) | (1 << 3) | (1 << 7);',
        explanation:
          'Los grupos de banderas de eventos (Event Groups en FreeRTOS) permiten sincronizar una tarea cuando se cumplen múltiples condiciones (0x80 + 0x08 + 0x01 = 0x89).'
      },
      {
        levelLabel: 'Nivel 3: Experto',
        title: 'Reto 8.3 — Configurar Sleep-On-Exit y Deep Sleep (STOP Mode) en el Registro ARM SCB->SCR',
        instruction:
          'En el registro System Control Register (SCB->SCR) de cualquier ARM Cortex-M, el bit 2 (SLEEPDEEP) activa el sueño profundo y el bit 1 (SLEEPONEXIT) duerme la CPU automáticamente al terminar cada ISR sin siquiera volver a main(). Activa ambos bits en REG. Valor esperado: 0x00000006.',
        initialRegValue: 0x00000000,
        regWidth: 32,
        expectedRegValue: 0x00000006,
        starterCode: 'REG = (1 << 2);',
        hint: 'Activa los bits 2 y 1: REG = (1 << 2) | (1 << 1);',
        solutionCode: 'REG = (1 << 2) | (1 << 1);',
        explanation:
          'Con SLEEPONEXIT (bit 1) y SLEEPDEEP (bit 2) activos (0x06), el procesador solo se despierta para ejecutar las ISR y vuelve a dormir en hardware ahorrando el máximo de batería.'
      }
    ],
    extraQuizzes: [
      {
        id: 'm8-q1',
        difficulty: 'Caza del Bug',
        question: '¿Dónde sería un ERROR GRAVE colocar la instrucción que refresca el Watchdog (IWDG->KR = 0xAAAA)?',
        options: [
          {
            id: 'a',
            label: 'Dentro de una interrupción periódica de un Timer de alta prioridad.',
            isCorrect: true,
            feedback: '¡Exacto! Si refrescas el Watchdog dentro de una ISR de Timer y tu bucle principal main() se queda colgado por un bug, la interrupción del Timer seguirá saltando y alimentando al Watchdog, por lo que el chip nunca se reiniciará.'
          },
          {
            id: 'b',
            label: 'En el bucle principal superloop tras verificar que todas las máquinas de estados han respondido a tiempo.',
            isCorrect: false,
            feedback: 'Ese es precisamente el lugar correcto donde debe refrescarse el Watchdog.'
          }
        ]
      },
      {
        id: 'm8-q2',
        difficulty: 'Lectura Datasheet',
        question: 'En FreeRTOS, dos tareas (Tarea_Pantalla y Tarea_Sensor) comparten el mismo bus I2C1. ¿Qué ocurre si no proteges el bus I2C1 con un Mutex y el planificador cambia de tarea a mitad de una transferencia I2C?',
        options: [
          {
            id: 'a',
            label: 'La segunda tarea empezará a escribir sus propios bytes en el registro I2C1->DR corrompiendo la trama de la primera tarea y bloqueando el bus.',
            isCorrect: true,
            feedback: '¡Exacto! Todo periférico físico compartido entre varias tareas de un RTOS debe protegerse con un Mutex (xSemaphoreTake / xSemaphoreGive).'
          },
          {
            id: 'b',
            label: 'El hardware I2C separa automáticamente las tramas de cada tarea.',
            isCorrect: false,
            feedback: 'El periférico I2C no sabe qué tarea de software está corriendo en la CPU; solo ve escrituras al registro DR.'
          }
        ]
      },
      {
        id: 'm8-q3',
        difficulty: 'Traza Mental',
        question: 'Un nodo sensor con nRF52840 alimentado por una pila botón CR2032 (220 mAh) consume 6 mA cuando está despierto durante 2 ms cada segundo, y 2 µA (0.002 mA) durmiendo los otros 998 ms con __WFI(). ¿Cuál es su consumo medio aproximado?',
        options: [
          {
            id: 'a',
            label: '~14 µA (0.014 mA), lo que permite que la pila dure casi 2 años seguidos.',
            isCorrect: true,
            feedback: '¡Cálculo exacto! (6000 µA * 0.002 s) + (2 µA * 0.998 s) = 12 µA + 2 µA = 14 µA de media. ¡Por eso dormir la CPU con __WFI() es vital!'
          },
          {
            id: 'b',
            label: '~3 mA (la mitad de 6 mA).',
            isCorrect: false,
            feedback: 'Como solo está despierto un 0,2% del tiempo (2 ms de cada 1000 ms), el consumo activo se divide entre 500.'
          }
        ]
      },
      {
        id: 'm8-q4',
        difficulty: 'Caza del Bug',
        question: 'En una arquitectura limpia en capas, un compañero incluye #include "stm32f4xx.h" y escribe GPIOA->ODR |= (1<<5); directamente dentro del archivo de lógica de negocio app_termostato.c. ¿Por qué rechazarías ese cambio en una revisión de código profesional?',
        options: [
          {
            id: 'a',
            label: 'Porque acopla la lógica de aplicación a un único fabricante de silicio, impidiendo compilar tests unitarios en PC o migrar a otro microcontrolador sin reescribir la aplicación.',
            isCorrect: true,
            feedback: '¡Exacto! La capa de aplicación debe llamar a una interfaz abstracta (ej. hal_calefactor_encender(true)) y solo la capa HAL/BSP debe tocar registros.'
          },
          {
            id: 'b',
            label: 'Porque el compilador C no permite incluir cabeceras en varios archivos.',
            isCorrect: false,
            feedback: 'El compilador lo permite, pero rompe por completo la arquitectura en capas y la portabilidad del firmware.'
          }
        ]
      }
    ]
  },

  // =========================================================================
  // MÓDULO 9: PROYECTOS MULTI-ARCHIVO (.h/.c), LIBRERÍAS, CONST/UNION Y TOOLCHAIN
  // =========================================================================
  9: {
    moduleId: 9,
    notebookSummaryTitle: 'Apuntes Módulo 9: Proyectos Multi-Archivo (.h y .c), Librerías, "static/const/union" y Linker',
    whyWriteThisDown:
      'Tener en tu cuaderno la tabla de qué va en el .h frente al .c, los dos significados de "static" y el flujo de compilación (.c -> .o -> .a -> .elf) te ahorrará cientos de horas peleando con el compilador y el Linker.',
    definitions: [
      {
        term: 'Unidad de Traducción (Translation Unit)',
        definition:
          'Cada archivo .c individual junto con todos los archivos de cabecera (.h) que se han expandido dentro de él tras pasar por el preprocesador.',
        siliconReality:
          'El compilador traduce cada archivo .c por separado generando un archivo objeto independiente (.o) sin saber aún dónde están las funciones de los otros .c.',
        exampleToCopy: 'arm-none-eabi-gcc -c driver_motor.c -o driver_motor.o'
      },
      {
        term: 'Declaración (.h) vs Definición (.c)',
        definition:
          'Una Declaración anuncia el nombre y tipos de una función o variable sin reservar memoria; una Definición contiene el cuerpo real o reserva los bytes físicos en RAM/Flash.',
        siliconReality:
          'Poner definiciones en un .h incluido por varios .c duplica los símbolos en varios .o y rompe el enlazado con el error "multiple definition".',
        exampleToCopy: '// En .h: void init(void);  |  En .c: void init(void) { ... }'
      },
      {
        term: 'Modificador "static" a Nivel de Archivo (Encapsulación)',
        definition:
          'Colocado delante de una variable global o función dentro de un archivo .c, restringe su visibilidad exclusivamente a ese archivo (Linkage Interno).',
        siliconReality:
          'El símbolo no se exporta en la tabla pública del archivo .o, evitando colisiones de nombres e impidiendo que otros archivos corrompan el estado interno de tu librería.',
        exampleToCopy: 'static uint32_t s_contador_privado = 0U; // Invisible fuera de este .c'
      },
      {
        term: 'Calificador "const" en Microcontroladores (.rodata en Flash)',
        definition:
          'Indica que el dato es de solo lectura tras la compilación, permitiendo al Linker alojarlo directamente en la memoria Flash (.rodata) en lugar de copiarlo a la memoria SRAM.',
        siliconReality:
          'En un microcontrolador con poca RAM, añadir "const" a las tablas de calibración, fuentes de texto y estructuras de configuración ahorra kilobytes enteros de SRAM.',
        exampleToCopy: 'static const uint16_t TABLA_SENO[64] = { 2048, 2248, /* ... */ };'
      },
      {
        term: 'Unión en C (typedef union)',
        definition:
          'Estructura especial donde todos sus miembros se solapan empezando en la misma dirección de memoria física, ocupando únicamente el tamaño de su miembro más grande.',
        siliconReality:
          'Permite escribir un uint32_t o float y leer inmediatamente sus 4 bytes individuales (uint8_t bytes[4]) para transmitirlos por UART, SPI o CAN.',
        exampleToCopy: 'typedef union { uint32_t u32; uint8_t b[4]; } conversor_32b_u;'
      },
      {
        term: 'Librería Estática (.a — Archive Library)',
        definition:
          'Archivo empaquetado mediante la herramienta "ar" que agrupa uno o varios archivos objeto (.o) ya compilados para reutilizarlos o distribuirlos en otros proyectos.',
        siliconReality:
          'Al enlazar con -lmi_driver, el Linker extrae de la librería .a únicamente los módulos .o que tu main.c necesita realmente.',
        exampleToCopy: 'arm-none-eabi-ar rcs libmi_driver.a motor.o filtro_pid.o'
      }
    ],
    goldenRules: [
      {
        title: 'La Ley Sagrada de los Archivos .h y .c',
        formulaOrRule: 'En el .h: #ifndef + typedef + #define + Prototipos   |   En el .c: #include + static (privado) + Cuerpo de Funciones',
        explanation: 'Nunca declares una variable global sin "extern" ni una función normal con cuerpo (salvo "static inline") dentro de un archivo .h.'
      },
      {
        title: 'Los 2 Significados de "static" en C Embebido (¡Pregunta Fija de Entrevista!)',
        formulaOrRule: '1) Dentro de función: Persiste su valor en RAM entre llamadas  |  2) Fuera de función (en .c): Oculta la variable/función al resto de archivos.',
        explanation: 'Dominar ambos usos de "static" es imprescindible para escribir librerías modulares sin variables globales expuestas.'
      },
      {
        title: 'Fórmula de Auditoría de Memoria con "arm-none-eabi-size"',
        formulaOrRule: ' Consumo FLASH = text + data     |     Consumo SRAM Estática = data + bss',
        explanation: 'La sección ".data" cuenta en ambos lados porque sus valores iniciales se guardan en Flash y el Reset_Handler los copia a SRAM al arrancar.'
      },
      {
        title: 'Banderas de Eliminación de Código Muerto en Librerías (Dead-Code Stripping)',
        formulaOrRule: 'CFLAGS: -ffunction-sections -fdata-sections   |   LDFLAGS: -Wl,--gc-sections',
        explanation: 'Coloca cada función de tu librería en su propia sub-sección para que el Linker borre automáticamente del .elf las funciones que nadie llame.'
      },
      {
        title: 'Normativa Espacial ECSS-E-ST-40C (Annex U.2 #7) & ECSS-Q-ST-80C (Cláusula 6.2.3.6)',
        formulaOrRule: 'OBLIGATORIO (SHALL): Visibilidad mínima con "static" en archivos .c y eliminación total de código inalcanzable.',
        explanation: 'El Check #7 del Anexo U.2 obliga a declarar como static toda función o variable que no deba ser visible fuera de su módulo .c, y la cláusula 6.2.3.6 prohíbe dejar código muerto o inalcanzable en el binario de vuelo.'
      }
    ],
    sketchDiagramSteps: [
      'Dibuja a la izquierda dos cajas de código fuente: "main.c" y "motor_lib.c", y arriba en medio una caja "motor_lib.h" con flechas #include hacia ambos .c.',
      'Debajo de cada archivo .c dibuja una flecha "gcc -c (Compilación separada)" que produce "main.o" y "motor_lib.o".',
      'Rodea "motor_lib.o" (y otros .o de drivers) con una caja llamada "ar rcs -> libdrivers.a (Librería Estática)".',
      'Abajo del todo dibuja un embudo grande llamado "Linker (ld) + stm32.ld" que une "main.o" + "libdrivers.a" y saca dos archivos: "firmware.elf (.bin)" y "firmware.map".'
    ],
    annotatedCodeToCopy: {
      code: `/* === ARCHIVO 1: filtro_ema.h (Contrato Público de la Librería) === */
#ifndef FILTRO_EMA_H
#define FILTRO_EMA_H
#include <stdint.h>

typedef struct {
    uint32_t acumulador;
    uint8_t  shift_alpha;
} filtro_ema_t; // Estructura Handle para soportar múltiples sensores!

void     filtro_ema_init(filtro_ema_t *me, uint16_t valor_inicial, uint8_t shift);
uint16_t filtro_ema_step(filtro_ema_t *me, uint16_t nueva_muestra);
#endif

/* === ARCHIVO 2: filtro_ema.c (Implementación Privada) === */
#include "filtro_ema.h"

void filtro_ema_init(filtro_ema_t *me, uint16_t valor_inicial, uint8_t shift) {
    if (me == 0) return;
    me->acumulador  = (uint32_t)valor_inicial;
    me->shift_alpha = shift;
}`,
      lineNotes: [
        'Al guardar "acumulador" dentro del struct filtro_ema_t (*me) en lugar de en una variable global suelta, puedes filtrar 10 sensores distintos a la vez con esta misma librería.',
        'Las guardas #ifndef FILTRO_EMA_H ... #endif impiden errores de redefinición de tipos cuando varios archivos incluyen esta cabecera.'
      ]
    },
    codingChallenges: [
      {
        levelLabel: 'Nivel 1: Base',
        title: 'Reto 9.1 — Empaquetar 2 Bytes de Versión (Mayor=2, Menor=5) en una Unión de 16 bits',
        instruction:
          'Imagina una union { uint16_t word; uint8_t bytes[2]; }. En un procesador Little-Endian, si bytes[0] = 5 (versión menor) y bytes[1] = 2 (versión mayor), ¿qué valor hexadecimal de 16 bits tendrá "word" (REG)? Escribe la expresión en C desplazando y uniendo ambos bytes. Valor esperado: 0x00000205.',
        initialRegValue: 0x00000000,
        regWidth: 32,
        expectedRegValue: 0x00000205,
        starterCode: 'REG = (2 << 8);',
        hint: 'Une el byte alto (2 << 8) con el byte bajo 5: REG = (2 << 8) | 5;',
        solutionCode: 'REG = (2 << 8) | 5;',
        explanation:
          'En una union Little-Endian, bytes[0] ocupa los bits [7:0] (0x05) y bytes[1] ocupa los bits [15:8] (0x02), formando la palabra 0x0205.'
      },
      {
        levelLabel: 'Nivel 2: Intermedio',
        title: 'Reto 9.2 — Calcular el Consumo Total de Memoria Flash a partir del Informe "size"',
        instruction:
          'El comando arm-none-eabi-size informa que tu proyecto compilado con tus librerías tiene: text = 8192 bytes, data = 256 bytes y bss = 1024 bytes. Recuerda que en Flash se guardan tanto "text" (.text + .rodata) como los valores iniciales de "data". Calcula en C sobre REG los bytes totales ocupados en Flash. Valor esperado: 8448 (0x00002100).',
        initialRegValue: 0,
        regWidth: 32,
        expectedRegValue: 8448,
        starterCode: 'REG = 8192;',
        hint: 'Suma text + data: REG = 8192 + 256;',
        solutionCode: 'REG = 8192 + 256;',
        explanation:
          'El consumo de Flash es siempre (text + data) = 8192 + 256 = 8448 bytes (0x2100), porque "bss" no ocupa espacio en el binario Flash (solo se pone a cero en RAM al arrancar).'
      },
      {
        levelLabel: 'Nivel 3: Experto',
        title: 'Reto 9.3 — Calcular un Checksum XOR de 1 Byte para Validar una Trama de tu Librería',
        instruction:
          'Tu librería de protocolo envía una trama de 3 bytes de datos: 0xAA, 0x55 y 0x3C. Calcula en C sobre REG el byte de validación XOR (Checksum = byte0 ^ byte1 ^ byte2). Valor esperado: 0x000000C3.',
        initialRegValue: 0x00000000,
        regWidth: 32,
        expectedRegValue: 0x000000c3,
        starterCode: 'REG = 0xAA ^ 0x55;',
        hint: 'Haz el XOR de los tres bytes: REG = 0xAA ^ 0x55 ^ 0x3C;',
        solutionCode: 'REG = 0xAA ^ 0x55 ^ 0x3C;',
        explanation:
          '0xAA ^ 0x55 = 0xFF. Y 0xFF ^ 0x3C invierte los bits de 0x3C dando exactamente 0xC3.'
      }
    ],
    extraQuizzes: [
      {
        id: 'm9-q1',
        difficulty: 'Caza del Bug',
        question: 'En main.c incluyes #include "motor.h" y llamas a la función motor_arrancar();. El archivo main.c compila sin errores de sintaxis, pero al final el Linker aborta diciendo: "undefined reference to `motor_arrancar`". ¿Cuál es la causa?',
        options: [
          {
            id: 'a',
            label: 'El prototipo sí estaba en motor.h (por eso el compilador no se quejó al compilar main.c), pero olvidaste añadir motor.c (o su librería libmotor.a) en la lista de archivos del Makefile/CMake o nunca escribiste el cuerpo de la función en motor.c.',
            isCorrect: true,
            feedback: '¡Exacto! "Undefined reference" es un error del Linker (no del compilador): significa que main.o tiene una llamada pendiente a un símbolo que ningún otro archivo .o o .a ha proporcionado.'
          },
          {
            id: 'b',
            label: 'Falta un punto y coma en motor.h.',
            isCorrect: false,
            feedback: 'Un punto y coma faltante daría un error de sintaxis del compilador mucho antes de llegar al Linker.'
          }
        ]
      },
      {
        id: 'm9-q2',
        difficulty: 'Lectura Datasheet',
        question: 'Declaras dentro de tu librería de pantalla una fuente tipográfica de 4.096 bytes: uint8_t font_table[4096] = { ... }; en un STM32 o AVR, y de pronto te quedas sin memoria RAM. ¿Qué única palabra clave debes añadir delante para que gaste 0 bytes de RAM y viva solo en la memoria Flash?',
        options: [
          {
            id: 'a',
            label: 'const (es decir: static const uint8_t font_table[4096] = { ... };, más PROGMEM si es un AVR de 8 bits).',
            isCorrect: true,
            feedback: '¡Vital! Sin "const", el compilador asume que podrías querer modificar la tabla en tiempo de ejecución y la copia entera a la sección .data de la memoria SRAM.'
          },
          {
            id: 'b',
            label: 'volatile.',
            isCorrect: false,
            feedback: 'volatile no mueve variables de la RAM a la Flash.'
          }
        ]
      },
      {
        id: 'm9-q3',
        difficulty: 'Traza Mental',
        question: '¿Cuál es la diferencia exacta entre poner "static" delante de una variable LOCAL dentro de una función vs poner "static" delante de una variable o función GLOBAL en un archivo .c?',
        options: [
          {
            id: 'a',
            label: 'Dentro de una función hace que la variable conserve su valor entre llamadas (vive en .data/.bss en vez del Stack); fuera de una función hace que esa variable o función sea privada e invisible para otros archivos .c.',
            isCorrect: true,
            feedback: '¡Respuesta de 10 en cualquier entrevista técnica de C Embebido!'
          },
          {
            id: 'b',
            label: 'En ambos casos significa que la variable es constante y no puede cambiar de valor.',
            isCorrect: false,
            feedback: 'No confundas "static" con "const": una variable static puede cambiar de valor tantas veces como quieras.'
          }
        ]
      },
      {
        id: 'm9-q4',
        difficulty: 'Lectura Datasheet',
        question: '¿Por qué las funciones pequeñas declaradas como "static inline" SÍ pueden escribirse con su cuerpo completo dentro de un archivo de cabecera (.h) sin causar el error "multiple definition" en el Linker?',
        options: [
          {
            id: 'a',
            label: 'Porque "inline" incrusta el código directamente donde se llama y "static" le da visibilidad interna (Internal Linkage) a cada unidad de traducción, por lo que no se exporta ningún símbolo global duplicado hacia el Linker.',
            isCorrect: true,
            feedback: '¡Exacto! Por eso los fabricantes (como ARM en CMSIS core_cm4.h o Raspberry Pi en el SDK del RP2040) implementan miles de funciones pequeñas de acceso a registros como "static inline" dentro de los archivos .h.'
          },
          {
            id: 'b',
            label: 'Porque el preprocesador borra las funciones inline.',
            isCorrect: false,
            feedback: 'Quien procesa "static inline" es el compilador C, no el preprocesador.'
          }
        ]
      }
    ]
  },

  // =========================================================================
  // MÓDULO 10: NIVEL SENIOR INDUSTRIAL — BOOTLOADERS, HARDFAULT, MISRA-C Y PID
  // =========================================================================
  10: {
    moduleId: 10,
    notebookSummaryTitle: 'Apuntes Módulo 10: Bootloaders (OTA + VTOR), Diagnóstico HardFault, MISRA-C y Control PID',
    whyWriteThisDown:
      'Esta última sección de tu cuaderno reúne las herramientas de élite de un Senior Embedded C Developer: cómo saltar de un Bootloader a una App, cómo cazar un HardFault con el PC apilado y las reglas MISRA-C.',
    definitions: [
      {
        term: 'Bootloader y Particionado A/B (OTA)',
        definition:
          'Pequeño programa maestro alojado al inicio de la Flash que arranca primero al encender el chip, verifica la integridad (CRC32 / Firma) de la aplicación y permite actualizar el firmware en campo.',
        siliconReality:
          'Con dos particiones (Slot A Activo y Slot B de Descarga), si se corta la luz durante una actualización el Bootloader conserva intacta la versión anterior.',
        exampleToCopy: 'SCB->VTOR = 0x08008000UL; // Reubica tabla de vectores de la App'
      },
      {
        term: 'SCB->VTOR (Vector Table Offset Register)',
        definition:
          'Registro del núcleo procesador (en 0xE000ED08 en ARM Cortex-M) que indica en qué dirección de memoria empieza la Tabla de Vectores de Interrupción activa.',
        siliconReality:
          'Al saltar del Bootloader (0x08000000) a la Aplicación (0x08008000), es obligatorio actualizar VTOR para que las interrupciones vayan a las ISR de la Aplicación.',
        exampleToCopy: 'SCB->VTOR = APP_FLASH_START_ADDR;'
      },
      {
        term: 'Diagnóstico Forense de HardFault (Stacked PC y CFSR)',
        definition:
          'Técnica de inspección del marco de pila que guarda el hardware al producirse una excepción fatal (puntero inválido, división por 0, bus error).',
        siliconReality:
          'La séptima palabra apilada (stack_frame[6]) contiene el registro PC exacto de la instrucción C que causó el accidente; SCB->CFSR indica la causa física.',
        exampleToCopy: 'arm-none-eabi-addr2line -f -e firmware.elf 0x08001A42'
      },
      {
        term: 'Stack Painting (Marca de Agua 0xDEADBEEF)',
        definition:
          'Técnica industrial que consiste en rellenar toda la región del Stack en SRAM con un valor hexadecimal conocido (ej. 0xDEADBEEF) al arrancar para medir cuánto Stack se ha usado realmente.',
        siliconReality:
          'Inspeccionando hasta qué dirección han desaparecido los 0xDEADBEEF conoces el consumo máximo histórico de pila (High-Water Mark) y previenes desbordamientos.',
        exampleToCopy: 'while (stack_ptr[libres] == 0xDEADBEEFUL) { libres++; }'
      },
      {
        term: 'Estándar MISRA-C (C de Misión Crítica)',
        definition:
          'Conjunto de reglas de codificación segura en C exigido en la industria automotriz, aeroespacial, ferroviaria y médica para eliminar comportamientos indefinidos.',
        siliconReality:
          'Prohíbe el uso de malloc()/free() dinámico (evitando fragmentación del Heap), prohíbe la recursión y exige validación de punteros y timeouts en esperas de hardware.',
        exampleToCopy: '_Static_assert(sizeof(msg_t) == 8U, "Tamaño inválido");'
      },
      {
        term: 'Controlador PID Discreto con Anti-Windup',
        definition:
          'Algoritmo de control en lazo cerrado que calcula la acción sobre un actuador (PWM de motor o calefactor) sumando el término Proporcional al error, su Integral acumulada y su Derivada.',
        siliconReality:
          'En microcontroladores se implementa en coma fija (enteros escalados Q8/Q15) y siempre incluye saturación del acumulador integral (Anti-Windup).',
        exampleToCopy: 'error = setpoint - medida; salida = Kp*error + acumulador_i;'
      }
    ],
    goldenRules: [
      {
        title: 'Los 4 Pasos para Saltar de un Bootloader a la Aplicación',
        formulaOrRule: '1) __disable_irq() y apagar SysTick  |  2) SCB->VTOR = APP_ADDR  |  3) __set_MSP(*(uint32_t*)APP_ADDR)  |  4) Saltar a *(uint32_t*)(APP_ADDR + 4)',
        explanation: 'En cualquier imagen de firmware ARM Cortex-M, los primeros 4 bytes (offset +0) son el Stack Pointer inicial y los siguientes 4 bytes (offset +4) son la dirección del Reset_Handler.'
      },
      {
        title: 'Regla MISRA-C 21.3: Prohibido usar malloc() y free() en Tiempo de Ejecución',
        formulaOrRule: 'NUNCA uses malloc() en el bucle de control -> Usa arrays estáticos o Ring Buffers pre-asignados en .bss',
        explanation: 'En un sistema embebido que debe funcionar meses sin apagarse, pedir y liberar bloques de distinto tamaño fragmenta el Heap hasta que malloc() devuelve NULL y falla el producto.'
      },
      {
        title: 'Regla de Oro de Robustez Hardware: Cero Bucles Infinitos sin Timeout',
        formulaOrRule: 'while (((PERIPH->SR & FLAG) == 0U) && (--timeout > 0U)) { }',
        explanation: 'Si un sensor I2C/SPI externo se desconecta o sufre ruido eléctrico, el contador de timeout permite salir del bucle y reportar el error sin colgar la CPU.'
      },
      {
        title: 'Sección Especial ".noinit" para Guardar Diagnósticos tras un Reinicio',
        formulaOrRule: '__attribute__((section(".noinit"))) volatile crash_info_t ultimo_fallo;',
        explanation: 'El código de arranque no borra a cero las variables marcadas como .noinit, permitiendo leer tras un Reset por Watchdog o HardFault en qué línea exacta estaba el programa.'
      },
      {
        title: 'Normativa Espacial ECSS-E-ST-40C (5.5.3.2c y 5.8.3.5b) & ECSS-Q-ST-80C (6.2.3.7 y 6.3.5.20)',
        formulaOrRule: 'OBLIGATORIO: Tests unitarios en fronteras (n-1, n, n+1), 100% MC/DC en Cat A y re-ejecución en binario NO instrumentado.',
        explanation: 'Para certificar software crítico no basta con pasar tests en PC: hay que probar los límites exactos n-1, n, n+1 y repetir la validación final sobre el ejecutable limpio de vuelo sin instrumentación ni parches.'
      }
    ],
    sketchDiagramSteps: [
      'Dibuja un mapa vertical de la memoria Flash dividido en 3 cajas: Abajo "0x08000000: Bootloader (32 KB)", en el Medio "0x08008000: Aplicación Activa Slot A (192 KB)" y Arriba "0x08038000: Slot B Descarga OTA (192 KB)".',
      'En el inicio de la caja "0x08008000 (Slot A)" dibuja sus dos primeras casillas de 4 bytes: "0x08008000 = Valor MSP Inicial" y "0x08008004 = Dirección Reset_Handler de la App".',
      'Dibuja una flecha curva desde el Bootloader hacia 0x08008004 con la etiqueta: "1. Verifica CRC32 -> 2. SCB->VTOR = 0x08008000 -> 3. Carga MSP -> 4. Salta a App()".'
    ],
    annotatedCodeToCopy: {
      code: `// Salto Profesional de Bootloader a Aplicación + Validación de Puntero de Pila:
#define APP_ADDRESS  0x08008000UL
typedef void (*p_app_entry_t)(void);

void bootloader_jump(void) {
    uint32_t app_sp    = *(volatile uint32_t *)(APP_ADDRESS + 0UL);
    uint32_t app_reset = *(volatile uint32_t *)(APP_ADDRESS + 4UL);

    // Verifica que hay una App válida (su Stack Pointer apunta a la SRAM 0x2000xxxx):
    if ((app_sp & 0x2FFE0000UL) == 0x20000000UL) {
        __disable_irq();
        SysTick->CTRL = 0UL;
        SCB->VTOR     = APP_ADDRESS;     // Reubica Tabla de Vectores
        __set_MSP(app_sp);               // Carga Pila de la Aplicación
        ((p_app_entry_t)app_reset)();    // ¡Salta al Reset_Handler de la App!
    }
}`,
      lineNotes: [
        'Si la partición 0x08008000 estuviera borrada (llena de 0xFFFFFFFF), el if((app_sp & 0x2FFE0000) == 0x20000000) dará falso y el Bootloader no saltará al vacío.',
        'SCB->VTOR = APP_ADDRESS asegura que todas las interrupciones posteriores usen los vectores compilados dentro de la Aplicación.'
      ]
    },
    codingChallenges: [
      {
        levelLabel: 'Nivel 1: Base',
        title: 'Reto 10.1 — Reubicar el Registro SCB->VTOR a la Partición de Aplicación (0x08008000)',
        instruction:
          'Antes de saltar desde tu Bootloader a la Aplicación alojada en la dirección 0x08008000, escribe la sentencia en C para asignar esa dirección base al registro SCB->VTOR (representado por REG). Valor esperado: 0x08008000.',
        initialRegValue: 0x08000000,
        regWidth: 32,
        expectedRegValue: 0x08008000,
        starterCode: 'REG = 0x08000000;',
        hint: 'Asigna directamente la dirección de inicio de la partición de la App: REG = 0x08008000;',
        solutionCode: 'REG = 0x08008000;',
        explanation:
          'Al escribir 0x08008000 en SCB->VTOR, el núcleo ARM Cortex-M busca todas las rutinas de interrupción a partir de 0x08008000 en lugar de 0x08000000.'
      },
      {
        levelLabel: 'Nivel 2: Intermedio',
        title: 'Reto 10.2 — Disparar un Reinicio por Software Limpio en ARM Cortex-M (SCB->AIRCR)',
        instruction:
          'Cuando tu macro FIRMWARE_ASSERT detecta un fallo crítico, guarda el log en .noinit y reinicia el procesador escribiendo en el registro SCB->AIRCR (REG) la llave de seguridad VECTKEY (0x05FA en los bits [31:16]) unida con el bit SYSRESETREQ (bit 2 = 1). Escribe la expresión en C. Valor esperado: 0x05FA0004.',
        initialRegValue: 0x00000000,
        regWidth: 32,
        expectedRegValue: 0x05fa0004,
        starterCode: 'REG = (0x05FA << 16);',
        hint: 'Añade | (1 << 2) para activar el bit SYSRESETREQ: REG = (0x05FA << 16) | (1 << 2);',
        solutionCode: 'REG = (0x05FA << 16) | (1 << 2);',
        explanation:
          'El registro SCB->AIRCR ignora cualquier escritura que no lleve la clave 0x05FA en los 16 bits superiores. Con (0x05FA << 16) | (1 << 2) se obtiene 0x05FA0004 y el chip se reinicia en el acto.'
      },
      {
        levelLabel: 'Nivel 3: Experto',
        title: 'Reto 10.3 — Paso de Control Proporcional en Coma Fija Q8 (Error = 50, Kp_Q8 = 384)',
        instruction:
          'En tu controlador PID en coma fija Q8 (donde 256 equivale a 1.0 y 384 equivale a Kp = 1.5), el error actual (setpoint - medida) es 50. Calcula en C sobre REG la acción proporcional multiplicando el error (50) por Kp_Q8 (384) y desescalando 8 bits a la derecha (>> 8). Valor esperado: 75 (0x0000004B).',
        initialRegValue: 0,
        regWidth: 32,
        expectedRegValue: 75,
        starterCode: 'REG = (50 * 384);',
        hint: 'Desplaza el producto 8 bits a la derecha (dividir entre 256): REG = (50 * 384) >> 8;',
        solutionCode: 'REG = (50 * 384) >> 8;',
        explanation:
          '50 * 1.5 es 75. Usando coma fija Q8: (50 * 384) = 19.200, y al desplazar 8 bits (19200 >> 8) obtenemos exactamente 75 en 2 ciclos de reloj sin usar variables float.'
      }
    ],
    extraQuizzes: [
      {
        id: 'm10-q1',
        difficulty: 'Lectura Datasheet',
        question: 'En cualquier microcontrolador ARM Cortex-M (STM32, nRF52, RP2040), ¿qué contienen exactamente las dos primeras palabras de 32 bits (offset +0x00 y offset +0x04) al principio de una imagen de firmware en Flash?',
        options: [
          {
            id: 'a',
            label: 'En +0x00 está el valor inicial del puntero de pila (Main Stack Pointer - MSP) y en +0x04 está la dirección de entrada del Reset_Handler.',
            isCorrect: true,
            feedback: '¡Exacto! Por eso tanto el hardware al encenderse como cualquier Bootloader leen primero +0x00 para configurar SP y luego saltan a la dirección guardada en +0x04.'
          },
          {
            id: 'b',
            label: 'El nombre del fabricante en código ASCII.',
            isCorrect: false,
            feedback: 'Al inicio de la Flash vive siempre la Tabla de Vectores, empezando por el MSP inicial y el vector de Reset.'
          }
        ]
      },
      {
        id: 'm10-q2',
        difficulty: 'Caza del Bug',
        question: '¿Por qué la normativa industrial MISRA-C (Regla 21.3) prohíbe usar malloc() y free() dinámicos en el bucle de un sistema embebido crítico?',
        options: [
          {
            id: 'a',
            label: 'Porque al reservar y liberar bloques de distintos tamaños durante días se produce Fragmentación del Heap, provocando que malloc() acabe devolviendo NULL de forma impredecible y además su tiempo de ejecución no es determinista.',
            isCorrect: true,
            feedback: '¡Brillante! En sistemas embebidos de misión crítica toda la memoria se dimensiona de forma estática o mediante pools de bloques de tamaño fijo.'
          },
          {
            id: 'b',
            label: 'Porque el lenguaje C estándar no incluye la librería <stdlib.h>.',
            isCorrect: false,
            feedback: 'Sí existe en C estándar, pero su uso dinámico en microcontroladores sin MMU es una fuente clásica de fallos tras días de operación.'
          }
        ]
      },
      {
        id: 'm10-q3',
        difficulty: 'Traza Mental',
        question: 'Tu microcontrolador entra en HardFault_Handler() en el laboratorio. Miras el marco de pila (Stack Frame) que el hardware guardó automáticamente en SP justo al producirse el fallo. ¿Qué elemento del array stack_frame[0..7] te dice la dirección exacta de la instrucción C que causó el accidente?',
        options: [
          {
            id: 'a',
            label: 'stack_frame[6], que corresponde al registro PC (Program Counter) apilado por el hardware.',
            isCorrect: true,
            feedback: '¡Exacto! El orden de apilado hardware en ARM Cortex-M es: [0]=R0, [1]=R1, [2]=R2, [3]=R3, [4]=R12, [5]=LR, [6]=PC y [7]=xPSR.'
          },
          {
            id: 'b',
            label: 'stack_frame[0] (R0).',
            isCorrect: false,
            feedback: 'stack_frame[0] contiene el primer argumento o registro de trabajo R0; la dirección de la instrucción culpable está en stack_frame[6] (PC).'
          }
        ]
      },
      {
        id: 'm10-q4',
        difficulty: 'Caza del Bug',
        question: 'En un controlador PID que regula la velocidad de un motor con PWM (0% a 100%), el rotor se atasca mecánicamente. Como el error sigue siendo positivo durante varios segundos, el término Integral suma hasta valer +5.000.000. Cuando liberas el motor, éste se queda acelerado al 100% durante un minuto entero hasta que la integral baja. ¿Cómo se llama este fenómeno y cómo se evita?',
        options: [
          {
            id: 'a',
            label: 'Se llama "Integral Windup" (Saturación Integral) y se evita aplicando un límite máximo y mínimo ("Anti-Windup Clamping") a la variable acumuladora integral en cada paso.',
            isCorrect: true,
            feedback: '¡Exacto! Jamás implementes un acumulador integral en C sin limitar su rango (clamping) al máximo de salida del actuador.'
          },
          {
            id: 'b',
            label: 'Se llama "Debouncing" y se evita con un condensador.',
            isCorrect: false,
            feedback: 'Debouncing es el filtrado de rebotes de un pulsador; el exceso de acumulación en un lazo PID es el Integral Windup.'
          }
        ]
      }
    ]
  },

  // =========================================================================
  // MÓDULO 11: NORMATIVA AEROESPACIAL Y DEFENSA (ECSS-E-ST-40C / Q-ST-80C vs NASA JPL / DO-178C) Y HARDWARE RAD-HARD
  // =========================================================================
  11: {
    moduleId: 11,
    notebookSummaryTitle: 'Apuntes Módulo 11: Normativa Espacial/Defensa (Europa ECSS vs América NASA/DO-178C), Cobertura MC/DC y Hardware Rad-Hard',
    whyWriteThisDown:
      'Escribir en tu cuaderno la tabla de Categorías A-D, los 14 Checks de ECSS Annex U.2, las 10 Reglas de NASA JPL, las ecuaciones oficiales de Margen/Planificabilidad y el votador TMR te coloca al nivel de las auditorías de vuelo de la ESA, Airbus, GMV y NASA.',
    definitions: [
      {
        term: 'Categorías de Criticidad ECSS (Cat A, B, C, D) vs DO-178C (DAL A..E)',
        definition:
          'Clasificación oficial del software espacial europeo (ECSS-Q-ST-80C Rev.2 Tabla D-1) según la gravedad del fallo: Cat A (Catastrófico: pérdida de vidas o del sistema sin provisión compensatoria), Cat B (Crítico: pérdida de misión), Cat C (Mayor) y Cat D (Menor).',
        siliconReality:
          'Según la cláusula 6.2.2.10, si un módulo Cat D comparte RAM o CPU con uno Cat A sin aislamiento físico o MPU, todo el código se eleva obligatoriamente a Categoría A.',
        exampleToCopy: '// Cat A exige: 100% Statement + 100% Decision + 100% MC/DC'
      },
      {
        term: 'Nomenclatura Legal en Normativa (SHALL / SHOULD / MAY)',
        definition:
          'Verbos con valor jurídico-técnico en la Cláusula 3.4 de ECSS: "SHALL" = Requisito OBLIGATORIO ("SHALL NOT" = PROHIBIDO); "SHOULD" = Recomendación (NO SE DEBE incumplir sin justificación aprobada en el tailoring); "MAY" = Permitido.',
        siliconReality:
          'En una auditoría de vuelo (CDR / QR), cada cláusula "shall" se verifica con una matriz de trazabilidad y pruebas reproducibles.',
        exampleToCopy: '// SHALL NOT: malloc(), recursión, bucles sin timeout, código muerto'
      },
      {
        term: 'Cobertura Estructural 100% MC/DC (Modified Condition and Decision Coverage)',
        definition:
          'Criterio de verificación exigido en ECSS-E-ST-40C 5.8.3.5b (Cat A) y DO-178C (DAL A) donde debe probarse que cada condición booleana individual dentro de un if() compuesto puede cambiar por sí sola el resultado de la decisión manteniendo fijas las demás.',
        siliconReality:
          'Para una decisión con N condiciones booleanas, 100% MC/DC se demuestra con un mínimo de (N + 1) vectores de test ("Pares de Independencia").',
        exampleToCopy: '// if ((A || B) && C) -> Requiere N + 1 = 4 vectores MC/DC'
      },
      {
        term: 'HSIA (Hardware-Software Interaction Analysis — ECSS-Q-ST-80C 6.2.2.8)',
        definition:
          'Análisis formal obligatorio donde se demuestra cómo reacciona el software ante cada modo de fallo del hardware (sensor en cortocircuito, bus colgado, bit-flip en registro) para llevar siempre al sistema a un estado seguro.',
        siliconReality:
          'Exige usar timeouts acotados en todo acceso a periféricos, códigos de estado con distancia de Hamming >= 2 y al menos dos pasos independientes (Armar + Disparar) para accionar propulsores o pirotecnia.',
        exampleToCopy: 'if ((arm_reg == 0xA55AUL) && (cmd == 0xA55AUL)) { fire(); }'
      },
      {
        term: 'SEU (Single Event Upset) vs SEL (Single Event Latch-up)',
        definition:
          'Efectos de la radiación cósmica sobre los transistores: un SEU es la inversión suave de 1 bit en SRAM o registros (Bit-Flip recuperable); un SEL es un cortocircuito parásito destructivo entre VDD y GND que quema el chip si no se corta la corriente.',
        siliconReality:
          'Los SEUs ocurren a diario en órbita terrestre baja (LEO) y cinturones de Van Allen; se mitigan con memoria EDAC Hamming SEC-DED, Memory Scrubbing y votación TMR.',
        exampleToCopy: 'uint32_t sano = (copia_a & copia_b) | (copia_b & copia_c) | (copia_a & copia_c);'
      },
      {
        term: 'EDAC (Hamming SEC-DED) y Memory Scrubbing',
        definition:
          'EDAC añade bits de paridad Hamming a cada palabra de RAM para corregir al vuelo errores de 1 bit (SEC) y detectar errores de 2 bits (DED). El Scrubbing es la tarea que lee y reescribe periódicamente toda la RAM para que no se acumulen 2 SEUs en la misma palabra.',
        siliconReality:
          'Sin Scrubbing periódico, una zona de RAM poco leída puede recibir dos impactos de radiación en horas distintas y convertirse en un error incorregible de doble bit (MBU).',
        exampleToCopy: '// Tarea de fondo: lee bloque de RAM, corrige vía EDAC/TMR y reescribe'
      },
      {
        term: 'Votación Triple Modular (TMR — Triple Modular Redundancy 2-de-3)',
        definition:
          'Arquitectura de tolerancia a fallos (en silicio o en software C) donde cada registro o variable crítica se triplica en 3 copias independientes y un votador lógico elige el valor de la mayoría (2 de 3) bit a bit.',
        siliconReality:
          'La fórmula booleana (a & b) | (b & c) | (a & c) corrige instantáneamente los 32 bits en paralelo en 5 instrucciones de ALU sin un solo salto condicional.',
        exampleToCopy: '#define TMR_VOTE(a, b, c)  ( ((a) & (b)) | ((b) & (c)) | ((a) & (c)) )'
      },
      {
        term: 'Factor de Planificabilidad S y Margen de Memoria (ECSS-E-ST-40C Annex M)',
        definition:
          'Métricas matemáticas obligatorias del presupuesto técnico espacial: margin_memory mide la fracción de RAM/Flash libre, y el Factor S mide qué fracción del Deadline (D) consume una tarea sumando su WCET (C), la interferencia de ISRs (I) y el bloqueo (B).',
        siliconReality:
          'Para que un sistema de tiempo real duro sea certificable bajo ECSS, todas las tareas deben cumplir S_i = (C_i + I_i + B_i) / D_i <= 1.0.',
        exampleToCopy: '// S_i = (WCET + Interferencia + Bloqueo) / Deadline <= 1.0'
      }
    ],
    goldenRules: [
      {
        title: 'Resumen para tu Cuaderno: Lo que ESTÁ PROHIBIDO (SHALL NOT) en ECSS y NASA JPL',
        formulaOrRule: 'PROHIBIDO: 1) malloc/free dinámico | 2) Recursión y goto | 3) Bucles sin timeout fijo | 4) Variables Stack en DMA | 5) Race conditions / omitir volatile',
        explanation: 'Cumplir estas 5 prohibiciones cubre simultáneamente las reglas nucleares de ECSS-E-ST-40C (5.5.2.5 y Annex U.2), ECSS-Q-ST-80C (6.2.6) y NASA JPL Power of Ten (Reglas 1, 2 y 3).'
      },
      {
        title: 'Ecuación Oficial del Margen de Memoria (ECSS-E-ST-40C Annex M <5.2>)',
        formulaOrRule: 'margin_memory = free_size / total_size   =   (total_size - used_size) / total_size',
        explanation: 'En revisiones preliminares de software de vuelo de la ESA se exige típicamente margin_memory >= 0.50 (al menos el 50% de la Flash y de la SRAM libres).'
      },
      {
        title: 'Ecuación Oficial del Factor de Planificabilidad CPU (ECSS-E-ST-40C Annex M <5.3>)',
        formulaOrRule: 'S_i = ( C_i + I_i + B_i ) / D_i   <= 1.0',
        explanation: 'Donde C_i = WCET (peor tiempo de ejecución de la tarea), I_i = Interferencia por tareas/ISRs más prioritarias, B_i = Bloqueo por exclusión mutua y D_i = Deadline.'
      },
      {
        title: 'Ecuación Booleana de Votación Mayoritaria 2-de-3 (TMR Bit-a-Bit sin Saltos)',
        formulaOrRule: 'Voto_TMR(a, b, c) = (a & b) | (b & c) | (a & c)',
        explanation: 'Si una partícula cósmica invierte cualquier bit en una de las 3 copias (a, b o c), las otras dos copias intactas mantienen el bit correcto y curan la memoria.'
      },
      {
        title: 'Regla ECSS de Pruebas en Valores Frontera (Cláusula 5.5.3.2c) y Cobertura MC/DC (5.8.3.5b)',
        formulaOrRule: 'Fronteras obligatorias: { n - 1,  n,  n + 1 }   |   Mínimo de tests MC/DC para N condiciones = N + 1',
        explanation: 'Además, según ECSS-Q-ST-80C 6.2.3.7 y 6.3.5.20, las pruebas de validación críticas DEBEN re-ejecutarse sobre el código final NO instrumentado y sin parches.'
      },
      {
        title: 'Dos Notas Textuales Clave de la Revisión ECSS 2025 (IA Generativa y Programación Defensiva)',
        formulaOrRule: '1) Código de IA = Código Manual (ECSS-E-ST-40C 3.2.2)  |  2) Código Defensivo != Código Desactivado (ECSS-Q-ST-80C 3.2.9)',
        explanation: 'El código escrito con ayuda de IA debe pasar el 100% de verificación manual/MC/DC, y las ramas default: defensivas contra bit-flips están permitidas y recomendadas.'
      }
    ],
    sketchDiagramSteps: [
      'Dibuja a la izquierda un rayo llamado "Protón Cósmico (SEU)" golpeando una de 3 cajas en RAM: "Copia_A = 0x5A", "Copia_B = 0x5E (¡Bit 2 corrupto!)" y "Copia_C = 0x5A".',
      'Une las 3 cajas hacia una compuerta central llamada "Votador TMR 2-de-3: (A&B) | (B&C) | (A&C)" que saca "0x5A (Valor Sano)" y dibuja una flecha de retorno ("Memory Scrubbing") que corrige la Copia_B de vuelta a 0x5A.',
      'A la derecha dibuja un cuadro resumen de dos columnas en tu cuaderno: "PROHIBIDO (SHALL NOT): malloc, recursión, while sin límite, punteros sin validar" vs "OBLIGATORIO (SHALL): volatile, static, fronteras n-1/n/n+1, 100% MC/DC en Cat A".'
    ],
    annotatedCodeToCopy: {
      code: `// Patrón Aeroespacial Completo: Votación TMR 2-de-3 + Scrubbing + Sanitización Segura
#include <stdint.h>
#include <stddef.h>

typedef struct {
    volatile uint32_t copy_a;
    volatile uint32_t copy_b;
    volatile uint32_t copy_c;
} tmr_u32_t;

uint32_t ecss_tmr_read_and_scrub(tmr_u32_t *reg) {
    if (reg == (tmr_u32_t *)0) { return 0UL; } // ECSS Annex U.2 #9: Check NULL
    uint32_t a = reg->copy_a;
    uint32_t b = reg->copy_b;
    uint32_t c = reg->copy_c;
    uint32_t majority = (a & b) | (b & c) | (a & c);
    // Memory Scrubbing: repara cualquier SEU simple antes de que ocurra otro
    reg->copy_a = majority;
    reg->copy_b = majority;
    reg->copy_c = majority;
    return majority;
}`,
      lineNotes: [
        '(a & b) | (b & c) | (a & c): Resuelve la votación mayoritaria de los 32 bits en un solo paso sin saltos condicionales.',
        'Al reescribir las 3 copias con "majority" realizamos Memory Scrubbing activo, evitando que dos impactos de radiación en distintos momentos se acumulen.'
      ]
    },
    codingChallenges: [
      {
        levelLabel: 'Nivel 1: Base',
        title: 'Reto 11.1 — Corregir un Bit-Flip por Radiación Cósmica (SEU) con Votación TMR 2-de-3',
        instruction:
          'Un parámetro crítico de vuelo valía originalmente 0x0000005A en sus tres réplicas TMR de SRAM (A, B y C). Un protón espacial impacta en la Copia B e invierte su bit 2, dejándola corrupta en 0x5E (mientras que A = 0x5A y C = 0x5A siguen intactas). Escribe la ecuación booleana de mayoría TMR ((0x5A & 0x5E) | (0x5E & 0x5A) | (0x5A & 0x5A)) sobre REG para recuperar el valor sano. Valor esperado: 0x0000005A.',
        initialRegValue: 0x0000005e,
        regWidth: 32,
        expectedRegValue: 0x0000005a,
        starterCode: 'REG = (0x5A & 0x5E);',
        hint: 'Completa la ecuación 2-de-3: REG = (0x5A & 0x5E) | (0x5E & 0x5A) | (0x5A & 0x5A);',
        solutionCode: 'REG = (0x5A & 0x5E) | (0x5E & 0x5A) | (0x5A & 0x5A);',
        explanation:
          'Aunque la copia B tenía el bit 2 corrupto (0x5E = 0101_1110), las copias A y C (0x5A = 0101_1010) ganan la votación 2 contra 1 en cada bit y restauran el valor exacto 0x5A.'
      },
      {
        levelLabel: 'Nivel 2: Intermedio',
        title: 'Reto 11.2 — Calcular el Porcentaje de Margen de Memoria Oficial (ECSS-E-ST-40C Annex M <5.2>)',
        instruction:
          'Tu computador de satélite tiene 256 KB de SRAM total (total_size = 256) y tu firmware actual ocupa 64 KB (used_size = 64), por lo que quedan libres 192 KB (free_size = 256 - 64 = 192). Calcula en C entero sobre REG el porcentaje de margen de memoria según la fórmula oficial ECSS: ((256 - 64) * 100) / 256. Valor esperado: 75 (75% de margen libre = 0x0000004B).',
        initialRegValue: 0,
        regWidth: 32,
        expectedRegValue: 75,
        starterCode: 'REG = (256 - 64);',
        hint: 'Multiplica la memoria libre por 100 y divide entre el total 256: REG = ((256 - 64) * 100) / 256;',
        solutionCode: 'REG = ((256 - 64) * 100) / 256;',
        explanation:
          'Según ECSS-E-ST-40C Annex M <5.2>, margin_memory = free_size / total_size = 192 / 256 = 0.75 (75% libre), superando holgadamente el 50% exigido en diseño preliminar.'
      },
      {
        levelLabel: 'Nivel 3: Experto',
        title: 'Reto 11.3 — Calcular el Factor de Planificabilidad Temporal S en % (ECSS-E-ST-40C Annex M <5.3>)',
        instruction:
          'La tarea crítica de navegación tiene un Deadline D = 10000 µs (10 ms). Su tiempo de ejecución en peor caso es C (WCET) = 3200 µs, la interferencia máxima por ISRs más prioritarias es I = 1800 µs, y el tiempo máximo de bloqueo en secciones críticas es B = 1000 µs. Calcula en C sobre REG el Factor de Planificabilidad en porcentaje: ((3200 + 1800 + 1000) * 100) / 10000. Valor esperado: 60 (S = 60% = 0.60 <= 1.0, tarea planificable = 0x0000003C).',
        initialRegValue: 0,
        regWidth: 32,
        expectedRegValue: 60,
        starterCode: 'REG = (3200 + 1800 + 1000);',
        hint: 'Multiplica la suma (C + I + B) por 100 y divide entre el Deadline (10000): REG = ((3200 + 1800 + 1000) * 100) / 10000;',
        solutionCode: 'REG = ((3200 + 1800 + 1000) * 100) / 10000;',
        explanation:
          'El tiempo de respuesta en peor caso es 3200 + 1800 + 1000 = 6000 µs (6 ms). Dividido entre el Deadline de 10000 µs da un Factor S del 60% (0.60 <= 1.0).'
      }
    ],
    extraQuizzes: [
      {
        id: 'm11-q1',
        difficulty: 'Lectura Datasheet',
        question: 'En los estándares europeos ECSS-E-ST-40C y ECSS-Q-ST-80C (Cláusula 3.4), ¿cuál es la diferencia exacta entre una cláusula que usa el verbo "SHALL" y una que usa el verbo "SHOULD"?',
        options: [
          {
            id: 'a',
            label: '"SHALL" expresa un requisito OBLIGATORIO de cumplimiento estricto, mientras que "SHOULD" expresa una RECOMENDACIÓN que no se debe incumplir salvo justificación formal aprobada durante el tailoring del proyecto.',
            isCorrect: true,
            feedback: '¡Exacto! En normativa espacial europea y americana, "shall" es vinculante (y "shall not" es prohibición absoluta), mientras que "should" es una recomendación fuerte auditable.'
          },
          {
            id: 'b',
            label: 'Ambos significan sugerencias opcionales que el programador puede ignorar libremente.',
            isCorrect: false,
            feedback: 'El verbo para permisos opcionales es "MAY" (o "NEED NOT"). "SHALL" y "SHOULD" exigen cumplimiento o justificación formal.'
          }
        ]
      },
      {
        id: 'm11-q2',
        difficulty: 'Caza del Bug',
        question: 'En una auditoría bajo ECSS-E-ST-40C Rev.1 (Cláusula 5.11.5.6g de sanitización de datos), un programador borra una clave criptográfica local al final de una función usando memset(clave, 0, 32); y luego la función retorna sin volver a leer "clave". Al compilar con -O2 y revisar el ensamblador, ¡la llamada a memset ha desaparecido! ¿Por qué y cómo se corrige?',
        options: [
          {
            id: 'a',
            label: 'El optimizador aplicó "Dead-Store Elimination" porque vio que la variable local moría al salir de la función sin leerse; se corrige escribiendo los ceros a través de un puntero calificado como "volatile uint8_t *".',
            isCorrect: true,
            feedback: '¡Brillante! Calificar el puntero de borrado como volatile obliga al compilador a emitir físicamente las instrucciones Store en RAM.'
          },
          {
            id: 'b',
            label: 'Porque memset solo funciona con memoria Flash.',
            isCorrect: false,
            feedback: 'memset opera sobre RAM, pero el compilador puede eliminar escrituras a variables locales cuyo valor ya no vuelve a utilizarse.'
          }
        ]
      },
      {
        id: 'm11-q3',
        difficulty: 'Traza Mental',
        question: 'Según ECSS-E-ST-40C Cláusula 5.8.3.5b (y DO-178C DAL A), para certificar software de Categoría A necesitas alcanzar el 100% de cobertura MC/DC. Si tienes un condicional crítico con 4 condiciones booleanas independientes: if ((A && B) || (C && D)), ¿cuál es el número MÍNIMO teórico de casos de prueba necesarios para demostrar 100% MC/DC?',
        options: [
          {
            id: 'a',
            label: '5 casos de prueba (N + 1 = 4 + 1 = 5), seleccionando los pares de independencia de cada una de las 4 condiciones.',
            isCorrect: true,
            feedback: '¡Exacto! Esa es la gran ventaja matemática de MC/DC frente a probar las 2^N = 16 combinaciones posibles: con N + 1 tests bien elegidos demuestras el efecto independiente de cada condición.'
          },
          {
            id: 'b',
            label: 'Bastan 2 casos de prueba (uno True y otro False).',
            isCorrect: false,
            feedback: 'Con 2 casos solo logras Cobertura de Decisiones/Ramas (Branch Coverage), que es suficiente para Categoría B pero insuficiente para Categoría A (MC/DC).'
          }
        ]
      },
      {
        id: 'm11-q4',
        difficulty: 'Lectura Datasheet',
        question: '¿Qué establecen las notas oficiales de la revisión de 30 de abril de 2025 de ECSS-E-ST-40C (Cláusula 3.2.2) y ECSS-Q-ST-80C (Cláusula 3.2.9) respecto al código generado por IA y respecto al código de programación defensiva?',
        options: [
          {
            id: 'a',
            label: 'El código generado por IA se considera "código generado manualmente" (sujeto al 100% de verificación y cobertura), y el código de programación defensiva (ej. rama default: contra bit-flips) NO se considera "código desactivado".',
            isCorrect: true,
            feedback: '¡Dominio total de la revisión de abril de 2025! Estas dos notas fueron introducidas específicamente para aclarar el uso de IA generativa y proteger las prácticas de programación defensiva.'
          },
          {
            id: 'b',
            label: 'El código generado por IA está exento de pruebas unitarias y las ramas default: están prohibidas.',
            isCorrect: false,
            feedback: 'Es exactamente al revés: el código de IA debe verificarse con todo el rigor del código manual y las ramas defensivas son obligatorias.'
          }
        ]
      },
      {
        id: 'm11-q5',
        difficulty: 'Caza del Bug',
        question: 'En un satélite en órbita baja (LEO), tu microcontrolador cuenta con memoria SRAM protegida por hardware EDAC Hamming (corrige 1 bit erróneo al leer y detecta 2 bits erróneos). Sin embargo, una tabla de parámetros que solo se lee una vez por semana falla con error incorregible de doble bit tras 5 días en órbita. ¿Qué olvidaste implementar?',
        options: [
          {
            id: 'a',
            label: 'Olvidaste implementar una rutina periódica de "Memory Scrubbing" que lea y reescriba toda la SRAM cada pocos segundos/minutos para limpiar los SEUs de 1 bit antes de que caiga una segunda partícula en la misma dirección.',
            isCorrect: true,
            feedback: '¡Exacto! El circuito EDAC corrige los datos cuando pasan por el bus de lectura; si nadie lee esa dirección durante días, los bit-flips individuales (SEUs) se acumulan hasta superar la capacidad de corrección del código Hamming.'
          },
          {
            id: 'b',
            label: 'Olvidaste desactivar el reloj de la memoria SRAM.',
            isCorrect: false,
            feedback: 'Los SEUs por radiación cósmica ocurren en las celdas SRAM aunque el reloj esté detenido; la única cura preventiva es el Memory Scrubbing periódico.'
          }
        ]
      }
    ]
  },

  // =========================================================================
  // MÓDULO 12: RTOS A NIVEL DE SILICIO (FREERTOS / ZEPHYR / RTEMS)
  // =========================================================================
  12: {
    moduleId: 12,
    notebookSummaryTitle: 'Cuaderno Módulo 12: RTOS, Cambio de Contexto en Silicio, TCB y Mutex con Herencia',
    whyWriteThisDown:
      'Comprender cómo se organiza la pila de una tarea en SRAM y cómo se conmutan los punteros MSP y PSP en PendSV es lo que separa a un usuario de librerías de un ingeniero capaz de depurar cuelgues de RTOS en producción.',
    definitions: [
      {
        term: 'TCB (Task Control Block)',
        definition: 'Estructura en memoria SRAM donde el RTOS almacena el puntero de pila actual de la tarea, su prioridad, su estado y sus punteros de lista enlazada.',
        siliconReality: 'El primer miembro del TCB es pxTopOfStack: un puntero de 32 bits a la última dirección de RAM escrita en la pila de esa tarea.',
        exampleToCopy: 'typedef struct tcb { uint32_t *pxTopOfStack; uint32_t priority; } tcb_t;'
      },
      {
        term: 'Excepción PendSV (Pended Servicing)',
        definition: 'Interrupción configurable por software de menor prioridad en ARM Cortex-M utilizada específicamente para realizar el cambio de contexto entre tareas.',
        siliconReality: 'Al disparar el bit 28 en SCB->ICSR (PENDSVSET), el núcleo espera hasta que terminen todas las demás ISRs antes de conmutar las pilas.',
        exampleToCopy: 'SCB->ICSR = (1UL << 28); // Solicita cambio de contexto asíncrono'
      },
      {
        term: 'Herencia de Prioridad (Priority Inheritance)',
        definition: 'Protocolo en el que una tarea de baja prioridad que posee un Mutex hereda temporalmente la prioridad de la tarea más urgente que se bloquea esperando dicho Mutex.',
        siliconReality: 'El planificador del RTOS modifica dinámicamente el campo priority del TCB de la tarea baja para impedir que tareas intermedias la interrumpan.',
        exampleToCopy: 'xSemaphoreTake(xMutexWithInheritance, portMAX_DELAY);'
      },
      {
        term: 'Punteros PSP y MSP en ARM',
        definition: 'Dos registros físicos de puntero de pila independientes: Main Stack Pointer (usado por el kernel e ISRs) y Process Stack Pointer (usado por la tarea activa).',
        siliconReality: 'El bit 1 del registro especial CONTROL conmuta qué registro de pila utiliza la instrucción PUSH/POP en modo hilo.',
        exampleToCopy: '__set_PSP((uint32_t)task_stack_top); __set_CONTROL(__get_CONTROL() | 2U);'
      }
    ],
    goldenRules: [
      {
        title: 'Regla de Oro RTOS: Prohibido Bloquearse en una ISR',
        formulaOrRule: 'SHALL NOT call blocking API from ISR context -> Use only xQueueSendFromISR()',
        explanation: 'Las interrupciones usan la pila MSP compartida y deben durar microsegundos; bloquearse en una ISR paraliza todo el microcontrolador.'
      },
      {
        title: 'Regla de Creación Estática de Tareas (Cero Fragmentación de Heap)',
        formulaOrRule: 'xTaskCreateStatic(pxTaskCode, pcName, ulStackDepth, pvParameters, uxPriority, puxStackBuffer, pxTaskBuffer)',
        explanation: 'En aviónica y automoción la memoria dinámica está prohibida tras la inicialización; reservar pilas y TCBs estáticamente en .bss garantiza predictibilidad.'
      }
    ],
    sketchDiagramSteps: [
      '1. Dibuja un rectángulo vertical para la SRAM de la Tarea A con el puntero PSP_A.',
      '2. Dibuja dentro los 8 registros hardware salvados por el silicio: R0, R1, R2, R3, R12, LR, PC, xPSR.',
      '3. Dibuja debajo los 8 registros software salvados por PendSV: R4, R5, R6, R7, R8, R9, R10, R11.',
      '4. Dibuja una flecha desde pxTopOfStack en el TCB_A apuntando a la última posición R4.',
      '5. Dibuja al lado el cambio del puntero PSP de la CPU apuntando ahora al Stack de la Tarea B.'
    ],
    annotatedCodeToCopy: {
      code: `// Tarea Periódica Determinista sin Jitter con vTaskDelayUntil
void vSensorTask(void *pvParameters) {
    TickType_t xLastWakeTime = xTaskGetTickCount();
    const TickType_t xFrequency = pdMS_TO_TICKS(10U); // 100 Hz exactos

    for (;;) {
        vTaskDelayUntil(&xLastWakeTime, xFrequency);
        leer_sensores_criticos();
    }
}`,
      lineNotes: [
        'Línea 3: xTaskGetTickCount() obtiene el contador de milisegundos actual del sistema.',
        'Línea 4: pdMS_TO_TICKS convierte milisegundos a ranuras de tiempo del temporizador del kernel.',
        'Línea 7: vTaskDelayUntil calcula el siguiente despertar sumando el periodo exacto al tiempo anterior, evitando la deriva temporal acumulada de vTaskDelay.'
      ]
    },
    codingChallenges: [
      {
        levelLabel: 'Nivel 1: Base',
        title: 'Disparo Manual del Cambio de Contexto (PendSV)',
        instruction: 'En el registro de control ICSR (32 bits), levanta el bit 28 (PENDSVSET) para solicitar un cambio de contexto en el planificador sin alterar el resto de banderas.',
        initialRegValue: 0x00000000,
        regWidth: 32,
        expectedRegValue: 0x10000000,
        starterCode: 'REG = 0;',
        hint: 'Aplica una máscara OR con el bit 28: (1UL << 28).',
        solutionCode: 'REG |= (1UL << 28);',
        explanation: 'El bit 28 de ICSR activa la excepción PendSV en el controlador de interrupciones de ARM Cortex-M.'
      },
      {
        levelLabel: 'Nivel 2: Intermedio',
        title: 'Configuración del Registro CONTROL para Activar PSP en Modo Hilo',
        instruction: 'En el registro especial CONTROL de la CPU, activa el bit 1 (SPSEL: 1 = usar Process Stack Pointer PSP) manteniendo el bit 0 (nPRIV).',
        initialRegValue: 0x00000000,
        regWidth: 32,
        expectedRegValue: 0x00000002,
        starterCode: 'REG = 0;',
        hint: 'Aplica una operación bit a bit OR con (1U << 1).',
        solutionCode: 'REG |= (1U << 1);',
        explanation: 'El bit SPSEL commuta el puntero de pila de la CPU entre MSP (0) y PSP (1).'
      },
      {
        levelLabel: 'Nivel 3: Experto',
        title: 'Ajuste de Prioridad Mínima para la Interrupción PendSV en SHPR3',
        instruction: 'En el registro System Handler Priority Register 3 (SHPR3), el campo de prioridad de PendSV ocupa los bits [23:16]. Escribe el valor 0xFF (mínima prioridad) en dicho campo sin modificar los demás bytes.',
        initialRegValue: 0x00000000,
        regWidth: 32,
        expectedRegValue: 0x00FF0000,
        starterCode: 'REG = 0;',
        hint: 'Limpia el campo de 8 bits con una máscara AND y carga 0xFF desplazado 16 bits: REG = (REG & ~(0xFFUL << 16)) | (0xFFUL << 16);',
        solutionCode: 'REG = (REG & ~(0xFFUL << 16)) | (0xFFUL << 16);',
        explanation: 'PendSV debe tener la prioridad más baja para que el cambio de contexto no retrase interrupciones de periféricos.'
      }
    ],
    extraQuizzes: [
      {
        id: 'm12-q1',
        difficulty: 'Traza Mental',
        question: 'Una tarea de prioridad 2 tiene un bucle while(1) sin ninguna función de bloqueo (sin vTaskDelay ni lectura de colas). ¿Qué ocurre con las tareas de prioridad 1 en un planificador preemptivo?',
        options: [
          {
            id: 'a',
            label: 'Las tareas de prioridad 1 jamás se ejecutarán (inanición total o Starvation), porque el planificador solo otorga la CPU a tareas de menor prioridad cuando las de mayor prioridad se bloquean.',
            isCorrect: true,
            feedback: '¡Exacto! En un RTOS de prioridades estrictas, toda tarea debe bloquearse periódicamente para permitir que las tareas menos prioritarias reciban tiempo de procesador.'
          },
          {
            id: 'b',
            label: 'El RTOS reparte el tiempo a partes iguales al 50% entre ambas tareas.',
            isCorrect: false,
            feedback: 'Eso solo ocurriría si tuvieran exactamente la misma prioridad (Round-Robin).'
          }
        ]
      },
      {
        id: 'm12-q2',
        difficulty: 'Lectura Datasheet',
        question: '¿Por qué el primer elemento declarado dentro de la estructura TCB (Task Control Block) de FreeRTOS debe ser obligatoriamente pxTopOfStack?',
        options: [
          {
            id: 'a',
            label: 'Porque el manejador de PendSV en ensamblador accede al puntero de pila con una instrucción de desplazamiento cero LDR R0, [R1] sin necesidad de conocer los offsets internos de la estructura C.',
            isCorrect: true,
            feedback: '¡Excelente conocimiento de bajo nivel! Al estar en el offset 0x00, el código ASM es independiente de si el TCB cambia de tamaño o añade campos de depuración.'
          },
          {
            id: 'b',
            label: 'Por una simple convención de orden alfabético.',
            isCorrect: false,
            feedback: 'En ensamblador el offset cero permite optimizar el número de ciclos de reloj al cargar y guardar registros.'
          }
        ]
      },
      {
        id: 'm12-q3',
        difficulty: 'Caza del Bug',
        question: 'Un firmware experimenta un cuelgue aleatorio tras varias horas. Al inspeccionar la memoria, descubres que el último byte del array de pila de la tarea de red contiene un valor distinto de la constante mágica 0xA5A5A5A5. ¿Qué bug ha ocurrido?',
        options: [
          {
            id: 'a',
            label: 'Un desbordamiento de pila (Stack Overflow): las variables locales y llamadas a funciones superaron el tamaño asignado al array de pila de esa tarea, corrompiendo la memoria adyacente.',
            isCorrect: true,
            feedback: '¡Correcto! FreeRTOS utiliza el patrón 0xA5 como marca de agua (Watermark) para detectar si el Stack Pointer ha superado la frontera de la tarea.'
          },
          {
            id: 'b',
            label: 'Un error de bit invertido por ruido térmico en el bus I2C.',
            isCorrect: false,
            feedback: 'La marca de agua modificada en la pila es la prueba inequívoca de desbordamiento de pila.'
          }
        ]
      },
      {
        id: 'm12-q4',
        difficulty: 'Caza del Bug',
        question: 'Un desarrollador utiliza xSemaphoreGive() convencional dentro de la rutina de interrupción USART1_IRQHandler(). El sistema funciona en pruebas pero sufre HardFault esporádico. ¿Por qué?',
        options: [
          {
            id: 'a',
            label: 'Porque xSemaphoreGive no está preparado para ejecutarse con la pila MSP ni interactuar con las listas del kernel sin protección de secciones críticas de interrupción; debía usarse xSemaphoreGiveFromISR.',
            isCorrect: true,
            feedback: '¡Regla vital de RTOS! Las funciones estándar pueden entrar en secciones críticas que deshabilitan interrupciones de forma incompatible con el contexto de la ISR.'
          },
          {
            id: 'b',
            label: 'Porque USART1 no permite enviar señales a semáforos.',
            isCorrect: false,
            feedback: 'Cualquier periférico puede señalizar un semáforo siempre que use la función con sufijo FromISR.'
          }
        ]
      }
    ]
  },

  // =========================================================================
  // MÓDULO 13: BUSES INDUSTRIALES (CAN / SPACEWIRE / 1553) Y CRC HARDWARE
  // =========================================================================
  13: {
    moduleId: 13,
    notebookSummaryTitle: 'Cuaderno Módulo 13: Bus CAN Diferencial, Arbitraje de Prioridad y Verificación CRC',
    whyWriteThisDown:
      'Comprender cómo se cancela el ruido electromagnético en un par diferencial y cómo funciona la división polinómica binaria en GF(2) es imprescindible para diseñar redes embebidas robustas en automoción, aeroespacial e industria.',
    definitions: [
      {
        term: 'Bit Dominante vs Recesivo en CAN',
        definition: 'En el bus CAN, el bit 0 es Dominante (tensión diferencial de ~2.0V) y el bit 1 es Recesivo (tensión diferencial de 0V pasiva por terminación).',
        siliconReality: 'Si dos transceptores transmiten a la vez, el que polariza los transistores para generar 2.0V impone su nivel en el cable sobre el que no conduce.',
        exampleToCopy: '// Bit 0 domina eléctricamente sobre el bit 1 en el par trenzado CAN'
      },
      {
        term: 'Arbitraje No Destructivo',
        definition: 'Mecanismo por el cual múltiples nodos que intentan transmitir simultáneamente determinan quién continúa transmitiendo en función del identificador de mensaje sin pérdida de tiempo.',
        siliconReality: 'Cada nodo lee el estado físico del cable mientras transmite: si emite un 1 y lee un 0, se retira silenciosamente al perder el arbitraje.',
        exampleToCopy: 'can_frame.id = 0x010U; // Menor identificador numérico = Mayor prioridad de bus'
      },
      {
        term: 'Filtro y Máscara de Aceptación (Filter & Mask)',
        definition: 'Bloque lógico en silicio que compara el identificador de cada trama recibida contra un patrón para decidir si se almacena en el buzón o se descarta.',
        siliconReality: 'La condición de aceptación es: (ID_Recibido & Mask) == (Filter_ID & Mask). Si coincide, la trama se carga en el FIFO del periférico.',
        exampleToCopy: 'CAN1->sFilterRegister[0].FR1 = filter_id; CAN1->sFilterRegister[0].FR2 = filter_mask;'
      },
      {
        term: 'CRC (Cyclic Redundancy Check)',
        definition: 'Código detector de errores basado en el residuo de una división polinómica binaria en GF(2) mediante sumas XOR sin acarreo.',
        siliconReality: 'Un registro de desplazamiento con retroalimentación lineal (LFSR) calcula el residuo en cada flanco de reloj de transmisión.',
        exampleToCopy: 'uint32_t crc = CRC->DR = nueva_palabra_32b;'
      }
    ],
    goldenRules: [
      {
        title: 'Regla de Oro de Terminación de Bus CAN',
        formulaOrRule: 'R_terminacion = 120 ohmios en cada uno de los dos extremos físicos del bus (R_equivalente = 60 ohmios)',
        explanation: 'Las resistencias disipan la energía de la línea y evitan reflexiones de onda que destruirían la temporización de los bits a altas velocidades.'
      },
      {
        title: 'Regla de Selección de ID CAN por Criticidad',
        formulaOrRule: 'ID_emergencia < ID_control < ID_telemetria < ID_diagnostico',
        explanation: 'Cuanto menor es el identificador binario, más ceros iniciales dominantes contiene y mayor es su garantía de ganar el acceso al bus ante contención.'
      }
    ],
    sketchDiagramSteps: [
      '1. Dibuja dos líneas paralelas horizontales etiquetadas como CAN_H y CAN_L.',
      '2. Conecta una resistencia de 120 ohmios entre ambas líneas al principio y otra al final.',
      '3. Dibuja un nodo transmisor con dos transistores: uno P a 3.3V hacia CAN_H y uno N a GND desde CAN_L.',
      '4. Dibuja las tensiones en reposo (recesivo): CAN_H = 2.5V, CAN_L = 2.5V (V_diff = 0V).',
      '5. Dibuja las tensiones en transmisión (dominante): CAN_H = 3.5V, CAN_L = 1.5V (V_diff = 2.0V).'
    ],
    annotatedCodeToCopy: {
      code: `// Cálculo de CRC-8 (Polinomio 0x07) para Verificación de Tramas de Sensores
uint8_t compute_crc8(const uint8_t *data, uint8_t len) {
    uint8_t crc = 0x00U; // Semilla inicial
    for (uint8_t i = 0U; i < len; i++) {
        crc ^= data[i];
        for (uint8_t bit = 0U; bit < 8U; bit++) {
            crc = (crc & 0x80U) ? (uint8_t)((crc << 1U) ^ 0x07U) : (uint8_t)(crc << 1U);
        }
    }
    return crc;
}`,
      lineNotes: [
        'Línea 3: Se inicia el registro con el valor inicial o semilla definido por la norma.',
        'Línea 5: Se introduce el siguiente byte de datos haciendo XOR con el acumulador actual.',
        'Línea 7: Si el bit más significativo (MSB) es 1, se desplaza y se aplica XOR con el polinomio 0x07 (x^8 + x^2 + x + 1).'
      ]
    },
    codingChallenges: [
      {
        levelLabel: 'Nivel 1: Base',
        title: 'Activación del Periférico Hardware CRC en el Bus AHB1',
        instruction: 'En el registro RCC->AHB1ENR, pon a 1 el bit 12 (CRCEN) para suministrar reloj a la unidad de cálculo CRC de 32 bits.',
        initialRegValue: 0x00000000,
        regWidth: 32,
        expectedRegValue: 0x00001000,
        starterCode: 'REG = 0;',
        hint: 'Aplica una máscara OR con (1UL << 12).',
        solutionCode: 'REG |= (1UL << 12);',
        explanation: 'Sin habilitar el bit 12 en el reloj de periféricos, cualquier lectura o escritura en CRC->DR será ignorada por el bus.'
      },
      {
        levelLabel: 'Nivel 2: Intermedio',
        title: 'Reinicio de Semilla del Acelerador Hardware CRC',
        instruction: 'En el registro de control CRC->CR, escribe un 1 en el bit 0 (RESET) para restablecer el acumulador a su valor inicial 0xFFFFFFFF.',
        initialRegValue: 0x00000000,
        regWidth: 32,
        expectedRegValue: 0x00000001,
        starterCode: 'REG = 0;',
        hint: 'Escribe un 1 en el bit 0: REG = 1;',
        solutionCode: 'REG = 1;',
        explanation: 'El bit RESET carga 0xFFFFFFFF en el registro de datos interno para iniciar una nueva secuencia de cálculo.'
      },
      {
        levelLabel: 'Nivel 3: Experto',
        title: 'Configuración de Buzón de Transmisión CAN (Solicitud de Envío TXRQ)',
        instruction: 'En el registro de transmisión CAN_TI0R, configura el identificador estándar 0x120 en los bits [31:21] y activa la solicitud de transmisión poniendo el bit 0 (TXRQ) a 1.',
        initialRegValue: 0x00000000,
        regWidth: 32,
        expectedRegValue: 0x24000001,
        starterCode: 'REG = 0;',
        hint: 'Desplaza el ID 21 posiciones a la izquierda y suma el bit 0: ((0x120UL & 0x7FFUL) << 21) | 1UL.',
        solutionCode: 'REG = ((0x120UL & 0x7FFUL) << 21) | 1UL;',
        explanation: 'En el controlador bxCAN de STM32, el identificador estándar de 11 bits se ubica alineado a la izquierda en los bits 31..21.'
      }
    ],
    extraQuizzes: [
      {
        id: 'm13-q1',
        difficulty: 'Lectura Datasheet',
        question: 'En una red CAN de 1 Mbps con una longitud de cable de 20 metros, un técnico mide una resistencia de 120 ohmios entre CAN_H y CAN_L con el sistema apagado. ¿Es correcto el montaje?',
        options: [
          {
            id: 'a',
            label: 'No: un valor de 120 ohmios indica que solo hay instalada una resistencia de terminación en uno de los extremos; deberían medirse ~60 ohmios por estar dos resistencias de 120 ohmios en paralelo.',
            isCorrect: true,
            feedback: '¡Exacto! Dos resistencias de 120 ohmios en paralelo dan 60 ohmios. Si mides 120 ohmios falta el terminador del otro extremo, lo que provocará errores de bit por reflejos.'
          },
          {
            id: 'b',
            label: 'Sí: 120 ohmios es exactamente el valor de terminación estándar.',
            isCorrect: false,
            feedback: 'Cada resistencia individual es de 120 ohmios, pero al medir en el bus se miden ambas en paralelo.'
          }
        ]
      },
      {
        id: 'm13-q2',
        difficulty: 'Traza Mental',
        question: 'El Nodo 1 transmite el ID 0x301 (0b01100000001) y el Nodo 2 transmite el ID 0x300 (0b01100000000). Ambos inician en el mismo instante. ¿En qué bit se resuelve el arbitraje?',
        options: [
          {
            id: 'a',
            label: 'En el bit 0 (el último bit del ID): ambos transmiten bits idénticos hasta que el Nodo 1 emite un 1 recesivo y el Nodo 2 emite un 0 dominante, ganando el Nodo 2.',
            isCorrect: true,
            feedback: '¡Correcto! Los 10 primeros bits son idénticos; el arbitraje se mantiene hasta la primera discrepancia.'
          },
          {
            id: 'b',
            label: 'En el bit 10 (el primer bit).',
            isCorrect: false,
            feedback: 'Ambos nodos empiezan con 0 en el bit 10, por lo que continúan transmitiendo.'
          }
        ]
      },
      {
        id: 'm13-q3',
        difficulty: 'Caza del Bug',
        question: 'Calculas el CRC de un buffer en C usando un bucle por software y obtienes 0x4B37. Al usar el periférico CRC hardware del STM32 obtienes 0xD19A sobre los mismos bytes. ¿Cuál es la causa técnica más habitual?',
        options: [
          {
            id: 'a',
            label: 'Diferencia en el orden de los bytes (Endianness) al alimentar palabras de 32 bits en el registro CRC->DR frente a iterar byte a byte, o diferente convención de inversión de bits (Bit Reversal).',
            isCorrect: true,
            feedback: '¡Causa clásica de incompatibilidad! El hardware CRC de ARM procesa 32 bits a la vez en orden Little-Endian a menos que se configure la inversión de bits en el registro de control.'
          },
          {
            id: 'b',
            label: 'El silicio hardware tiene un error de cálculo de fábrica.',
            isCorrect: false,
            feedback: 'El hardware cumple estrictamente el polinomio; la discrepancia proviene de la configuración de alineación y orden de bits.'
          }
        ]
      },
      {
        id: 'm13-q4',
        difficulty: 'Lectura Datasheet',
        question: '¿Qué es el mecanismo de "Bit Stuffing" en el bus CAN y por qué añade bits adicionales en la transmisión?',
        options: [
          {
            id: 'a',
            label: 'Inserción automática de un bit opuesto tras 5 bits consecutivos iguales para forzar flancos eléctricos en el cable y mantener sincronizados los relojes de todos los nodos sin cable de reloj dedicado.',
            isCorrect: true,
            feedback: '¡Gran precisión! CAN no tiene cable de reloj (es asíncrono); el bit stuffing garantiza transiciones eléctricas frecuentes para resincronizar los PLLs internos.'
          },
          {
            id: 'b',
            label: 'Un sistema para cifrar el contenido del mensaje.',
            isCorrect: false,
            feedback: 'No tiene relación con criptografía sino con sincronización de capa física.'
          }
        ]
      }
    ]
  },

  // =========================================================================
  // MÓDULO 14: ARITMÉTICA DE PUNTO FIJO (Q15/Q31) Y CONTROL PID DISCRETO
  // =========================================================================
  14: {
    moduleId: 14,
    notebookSummaryTitle: 'Cuaderno Módulo 14: Punto Fijo Q15/Q31, Saturación y Regulador PID con Anti-Windup',
    whyWriteThisDown:
      'Dominar la matemática de punto fijo permite implementar lazos de control ultrarrápidos y filtros digitales en microcontroladores de bajo coste sin FPU, garantizando determinismo estricto sin infinitos ni NaNs.',
    definitions: [
      {
        term: 'Formato Q15 (Q1.15)',
        definition: 'Representación en complemento a dos donde un entero int16_t almacena 1 bit de signo y 15 bits fraccionarios, cubriendo [-1.0, +0.999969] con escala de 32768.',
        siliconReality: 'Un valor entero 16384 en un registro de CPU equivale matemáticamente a 0.5 unidades reales (16384 / 32768).',
        exampleToCopy: 'typedef int16_t q15_t; // 1.0 real equivale a 32768'
      },
      {
        term: 'Aritmética de Saturación',
        definition: 'Operación aritmética en la que el resultado no desborda de forma circular (wrap-around), sino que se clava en los límites máximos o mínimos representables.',
        siliconReality: 'Instrucción hardware dedicada (__SSAT en ARM) que recorta el acumulador de 32 bits a 16 bits en 1 ciclo de reloj.',
        exampleToCopy: 'val_sat = __SSAT(val_32, 16); // Clamping a [-32768, +32767]'
      },
      {
        term: 'Integral Windup',
        definition: 'Fenómeno en el que el término integral de un PID acumula un error masivo mientras el actuador está físicamente saturado en su límite mecánico o eléctrico.',
        siliconReality: 'La variable de integración en RAM crece indefinidamente, causando que el PWM permanezca al 100% mucho después de que el error cambie de signo.',
        exampleToCopy: 'if (pid->integral > MAX_PWM) pid->integral = MAX_PWM; // Anti-windup clamping'
      },
      {
        term: 'Periodo de Muestreo Fijo (Ts)',
        definition: 'Intervalo de tiempo estrictamente constante entre ejecuciones consecutivas del lazo de control discreto.',
        siliconReality: 'El cálculo debe dispararse mediante interrupción periódica de temporizador hardware o tarea periódica con delay estricto.',
        exampleToCopy: '#define TS_SECONDS 0.001f // 1 milisegundo estricto por Timer IRQ'
      }
    ],
    goldenRules: [
      {
        title: 'Regla de Promoción en Multiplicación de Punto Fijo',
        formulaOrRule: 'resultado_Q15 = (q15_t)(((int32_t)a * (int32_t)b) >> 15)',
        explanation: 'Multiplicar dos enteros de 16 bits produce hasta 32 bits; omitir el cast previo provoca desbordamiento destructivo del cálculo.'
      },
      {
        title: 'Regla de Oro Anti-Windup para Actuadores Reales',
        formulaOrRule: 'SHALL clamp PID integral accumulator whenever actuator reaches physical saturation limits',
        explanation: 'Previene sobreoscilaciones peligrosas de motores y calentadores tras perturbaciones escalón o bloqueos mecánicos.'
      }
    ],
    sketchDiagramSteps: [
      '1. Dibuja un sumador circular a la izquierda con la consigna (+) y la realimentación del ADC (-).',
      '2. Saca tres ramas para el error e[k]: Proporcional (Kp), Integral (Ki/s) y Derivativo (Kd*s).',
      '3. Dibuja un bloque de saturación (Anti-Windup) a la salida del bloque integral limitando entre MIN y MAX.',
      '4. Suma las tres ramas en un nodo y pasa la señal resultante por el bloque de saturación del actuador PWM (0% a 100%).',
      '5. Traza una flecha de realimentación desde la saturación hacia el integrador para ilustrar el lazo de frenado de acumulación.'
    ],
    annotatedCodeToCopy: {
      code: `// Regulador PID Discreto en C con Protección Anti-Windup Clamping
int16_t pid_compute_step(int16_t setpoint, int16_t feedback, pid_ctrl_t *ctx) {
    int16_t error = setpoint - feedback;
    int32_t p_out = (int32_t)ctx->kp * error;
    int32_t d_out = (int32_t)ctx->kd * (error - ctx->prev_error);
    
    // Integración con Anti-Windup Clamping:
    ctx->integrator += ((int32_t)ctx->ki * error);
    if (ctx->integrator > ctx->out_max) ctx->integrator = ctx->out_max;
    if (ctx->integrator < ctx->out_min) ctx->integrator = ctx->out_min;

    int32_t total = (p_out >> 8) + (ctx->integrator >> 8) + (d_out >> 8);
    if (total > ctx->out_max) total = ctx->out_max;
    if (total < ctx->out_min) total = ctx->out_min;

    ctx->prev_error = error;
    return (int16_t)total;
}`,
      lineNotes: [
        'Línea 3: Se calcula el error instantáneo restando la medida real a la consigna deseada.',
        'Línea 8: Se actualiza el acumulador integral y se recorta de inmediato contra los límites del actuador.',
        'Línea 12: Se suma la acción de control total y se asegura que el valor devuelto no desborde el registro PWM.'
      ]
    },
    codingChallenges: [
      {
        levelLabel: 'Nivel 1: Base',
        title: 'Conversión de Ganancia a Formato Q15',
        instruction: 'En una variable de 16 bits con signo, almacena la constante fraccionaria +0.5 en formato Q15 multiplicando por la escala 32768.',
        initialRegValue: 0x0000,
        regWidth: 32,
        expectedRegValue: 0x4000,
        starterCode: 'REG = 0;',
        hint: '0.5 * 32768 = 16384 (en hexadecimal: 0x4000).',
        solutionCode: 'REG = 16384;',
        explanation: 'En formato Q15, la unidad 1.0 se representa como 32768; por tanto 0.5 equivale exactamente a 0x4000 (16384).'
      },
      {
        levelLabel: 'Nivel 2: Intermedio',
        title: 'Multiplicación en Punto Fijo con Desplazamiento',
        instruction: 'Multiplica dos coeficientes Q15 (REG inicial contiene 0x4000 = 0.5). Aplica una atenuación de 0.5 multiplicando el registro actual por 16384 en 32 bits y desplazando 15 bits a la derecha.',
        initialRegValue: 0x4000,
        regWidth: 32,
        expectedRegValue: 0x2000,
        starterCode: 'REG = 0x4000;',
        hint: 'Multiplica por 16384 y divide entre 32768 (>> 15): ((int32_t)REG * 16384L) >> 15.',
        solutionCode: 'REG = (uint32_t)(((int32_t)REG * 16384L) >> 15);',
        explanation: '0.5 * 0.5 = 0.25. En Q15, 0.25 se representa como 32768 / 4 = 8192 (0x2000).'
      },
      {
        levelLabel: 'Nivel 3: Experto',
        title: 'Clamping de Salida de Actuador PWM (Límite Máximo)',
        instruction: 'Aplica saturación sobre un valor de actuador que contiene 0x0FFF (4095). Si supera el límite de seguridad de 1000 (0x03E8), recórtalo al valor máximo 1000.',
        initialRegValue: 0x00000FFF,
        regWidth: 32,
        expectedRegValue: 0x000003E8,
        starterCode: 'REG = 0x0FFF;',
        hint: 'Usa una comprobación condicional: if (REG > 1000) REG = 1000;',
        solutionCode: 'if (REG > 1000U) { REG = 1000U; }',
        explanation: 'El clamping de software garantiza que las señales de control no intenten exigir al actuador más allá de sus especificaciones físicas.'
      }
    ],
    extraQuizzes: [
      {
        id: 'm14-q1',
        difficulty: 'Traza Mental',
        question: 'Sumas dos números en formato Q15: a = 20000 (0.61) y b = 20000 (0.61) usando tipos int16_t estándar sin saturación. ¿Qué valor almacena la variable tras la suma?',
        options: [
          {
            id: 'a',
            label: '-25536 (-0.78), porque la suma 40000 supera el valor máximo positivo de un int16_t (+32767) y desborda al rango negativo por el complemento a dos.',
            isCorrect: true,
            feedback: '¡Exacto! El desbordamiento circular de enteros invierte el signo de forma violenta. En control embebido esto invertiría el sentido de giro de un motor, de ahí la necesidad de saturación.'
          },
          {
            id: 'b',
            label: '+32767 (+0.999), porque el compilador recorta automáticamente.',
            isCorrect: false,
            feedback: 'En C estándar los tipos enteros básicos no saturan; desbordan según la aritmética del procesador.'
          }
        ]
      },
      {
        id: 'm14-q2',
        difficulty: 'Caza del Bug',
        question: 'En un control de velocidad PID, el término derivativo produce picos bruscos de PWM cada vez que el operario cambia la consigna de velocidad de golpe, aunque el motor esté quieto. ¿Por qué ocurre y cómo se soluciona?',
        options: [
          {
            id: 'a',
            label: 'Ocurre por "Derivative Kick": una variación escalón en la consigna produce una derivada infinita; se soluciona calculando la derivada sobre la realimentación (-dFeedback/dt) en lugar de sobre el error.',
            isCorrect: true,
            feedback: '¡Diagnóstico de ingeniero de control senior! Calcular la derivada sobre la medida del sensor elimina el pico espurio producido por los cambios bruscos de consigna.'
          },
          {
            id: 'b',
            label: 'Ocurre porque el condensador del filtro analógico se descargó por completo.',
            isCorrect: false,
            feedback: 'Es un problema puramente matemático derivado de derivar una señal escalón.'
          }
        ]
      },
      {
        id: 'm14-q3',
        difficulty: 'Lectura Datasheet',
        question: '¿Qué ventaja tiene la instrucción SIMD SMLAD presente en núcleos ARM Cortex-M4 en comparación con el cálculo secuencial de un filtro FIR o PID?',
        options: [
          {
            id: 'a',
            label: 'Multiplica dos pares de números de 16 bits en paralelo y suma ambos productos a un acumulador de 32 bits en 1 solo ciclo de reloj.',
            isCorrect: true,
            feedback: '¡Gran conocimiento de silicio! SMLAD (Signed Multiply Accumulate Dual) procesa 2 muestras por ciclo duplicando el rendimiento de filtros digitales.'
          },
          {
            id: 'b',
            label: 'Convierte floats a enteros automáticamente.',
            isCorrect: false,
            feedback: 'SMLAD es una instrucción puramente entera/DSP de 16 bits.'
          }
        ]
      },
      {
        id: 'm14-q4',
        difficulty: 'Traza Mental',
        question: '¿Por qué en aplicaciones críticas aeroespaciales (DO-178C / ECSS) se prefiere la aritmética de punto fijo frente a coma flotante para lazos de control de actitud?',
        options: [
          {
            id: 'a',
            label: 'Porque el punto fijo es 100% determinista, bit a bit reproducible en cualquier procesador y exento de anomalías IEEE 754 como NaN, subnormales o infinitos.',
            isCorrect: true,
            feedback: '¡Exacto! El determinismo y la facilidad de prueba exhaustiva hacen del punto fijo la opción preferida en aviónica crítica.'
          },
          {
            id: 'b',
            label: 'Porque los números float solo funcionan en ordenadores de escritorio.',
            isCorrect: false,
            feedback: 'Muchos microcontroladores tienen FPU, pero su complejidad de certificación formal es mayor.'
          }
        ]
      }
    ]
  },

  // =========================================================================
  // MÓDULO 15: DEPURACIÓN HARDWARE Y ANÁLISIS FORENSE DE HARDFAULT
  // =========================================================================
  15: {
    moduleId: 15,
    notebookSummaryTitle: 'Cuaderno Módulo 15: Autopsia de HardFault, Registros SCB->CFSR/BFAR y Depuración SWD',
    whyWriteThisDown:
      'Saber extraer y decodificar el marco de pila de excepción y los registros CFSR/BFAR permite localizar en minutos la línea exacta de C que causó un cuelgue en campo sin necesidad de sondas de laboratorio.',
    definitions: [
      {
        term: 'HardFault_Handler',
        definition: 'Excepción de máxima prioridad en ARM Cortex-M que se dispara cuando ocurre un fallo irrecuperable o cuando un fallo de menor nivel no tiene manejador habilitado.',
        siliconReality: 'La CPU detiene la ejecución, apila automáticamente R0-R3, R12, LR, PC y xPSR en la pila activa y salta a la dirección fija del vector 3 de la tabla VTOR.',
        exampleToCopy: 'void HardFault_Handler(void) { __asm volatile("b hardfault_c_unwind"); }'
      },
      {
        term: 'Registro SCB->CFSR (Configurable Fault Status)',
        definition: 'Registro de 32 bits en 0xE000ED28 que contiene banderas de diagnóstico divididas en UsageFault, BusFault y MemManageFault.',
        siliconReality: 'Banderas de hardware que registran si hubo desalineamiento, división por cero, violación de MPU o fallo en el bus de direcciones.',
        exampleToCopy: 'uint32_t cfsr = SCB->CFSR; // Inspección forense de la causa raíz'
      },
      {
        term: 'Registro SCB->BFAR (Bus Fault Address Register)',
        definition: 'Registro de 32 bits en 0xE000ED38 que guarda la dirección exacta de memoria que la CPU intentaba acceder cuando se produjo un fallo de bus preciso.',
        siliconReality: 'Solo es válido si el bit 15 (BFARVALID) del registro CFSR está en 1.',
        exampleToCopy: 'if (SCB->CFSR & (1UL << 15)) { uint32_t bad_mem = SCB->BFAR; }'
      },
      {
        term: 'Contador de Ciclos DWT->CYCCNT',
        definition: 'Contador libre de 32 bits integrado en el bloque de depuración CoreSight que se incrementa en cada ciclo de reloj del procesador.',
        siliconReality: 'Permite medir tiempos de ejecución en nanosegundos sin gastar ningún periférico temporizador ni alterar la ejecución de la CPU.',
        exampleToCopy: 'DWT->CTRL |= 1UL; uint32_t t = DWT->CYCCNT;'
      }
    ],
    goldenRules: [
      {
        title: 'Regla de Oro de Extracción del Stack Frame en HardFault',
        formulaOrRule: 'sp[6] == PC (instrucción exacta del accidente) | sp[5] == LR (función invocadora)',
        explanation: 'Inspeccionar los índices 6 y 5 del array de pila en el manejador forense revela inmediatamente el punto de impacto sin necesidad de depurador.'
      },
      {
        title: 'Regla de Activación de Trampas de Cero y Desalineamiento',
        formulaOrRule: 'SCB->CCR |= (1UL << 4) | (1UL << 3); // Activa DIV_0_TRP y UNALIGN_TRP',
        explanation: 'Convierte errores silenciosos en excepciones inmediatas capturables durante la fase de desarrollo y pruebas.'
      }
    ],
    sketchDiagramSteps: [
      '1. Dibuja un rectángulo que represente la Pila (Stack) en el momento del fallo.',
      '2. Dibuja 8 bloques de 32 bits etiquetados de abajo hacia arriba: R0, R1, R2, R3, R12, LR, PC, xPSR.',
      '3. Señala con una flecha roja el bloque PC (offset +24 bytes desde el SP): "Dirección de la instrucción culpable".',
      '4. Señala con una flecha azul el bloque LR (offset +20 bytes): "Función que llamó a la que falló".',
      '5. Dibuja al lado el registro SCB->CFSR desglosado en sus 3 octetos: UsageFault, BusFault y MemManage.'
    ],
    annotatedCodeToCopy: {
      code: `// Manejador Forense en C para Captura de HardFault
void hardfault_c_handler(uint32_t *fault_stack) {
    volatile uint32_t stacked_r0  = fault_stack[0];
    volatile uint32_t stacked_lr  = fault_stack[5];
    volatile uint32_t stacked_pc  = fault_stack[6]; // Dirección del cuelgue!
    volatile uint32_t cfsr_val    = SCB->CFSR;
    volatile uint32_t bfar_val    = SCB->BFAR;
    
    // Guardar en estructura de RAM no volátil para telemetría:
    g_blackbox.crashed_pc = stacked_pc;
    g_blackbox.cfsr       = cfsr_val;
    g_blackbox.bad_addr   = bfar_val;
    
    __asm volatile ("bkpt #0"); // Frena si hay sonda conectada
    NVIC_SystemReset();         // Reinicia de forma controlada
}`,
      lineNotes: [
        'Línea 2: Recibe como puntero la dirección del Stack Pointer (MSP o PSP) en el momento del fallo.',
        'Línea 5: fault_stack[6] recupera el Program Counter guardado por el hardware antes del salto de excepción.',
        'Línea 11: Se persisten los datos en una sección .noinit para ser leídos tras el reinicio automático del Watchdog.'
      ]
    },
    codingChallenges: [
      {
        levelLabel: 'Nivel 1: Base',
        title: 'Habilitación de Trampa de División por Cero en SCB->CCR',
        instruction: 'En el registro Configuration and Control (SCB->CCR en 0xE000ED14), activa el bit 4 (DIV_0_TRP) para forzar un UsageFault si ocurre división por cero.',
        initialRegValue: 0x00000000,
        regWidth: 32,
        expectedRegValue: 0x00000010,
        starterCode: 'REG = 0;',
        hint: 'Aplica una máscara OR con (1UL << 4).',
        solutionCode: 'REG |= (1UL << 4);',
        explanation: 'Por defecto Cortex-M devuelve cero al dividir por cero; activar el bit 4 fuerza la excepción para cazar el error.'
      },
      {
        levelLabel: 'Nivel 2: Intermedio',
        title: 'Comprobación de Validez de Dirección en Registro de Fallo de Bus',
        instruction: 'Comprueba si el registro CFSR tiene activa la bandera BFARVALID (bit 15). Si el bit 15 está activo, copia el valor de BFAR (0x20004000) a REG; en caso contrario pon REG a 0.',
        initialRegValue: 0x00008200,
        regWidth: 32,
        expectedRegValue: 0x20004000,
        starterCode: 'uint32_t bfar = 0x20004000;\nif (REG & (1UL << 15)) { REG = bfar; } else { REG = 0; }',
        hint: 'El valor inicial 0x00008200 tiene el bit 15 en 1 (0x8000), por lo que la condición se cumple.',
        solutionCode: 'if ((REG & (1UL << 15)) != 0U) { REG = 0x20004000U; } else { REG = 0U; }',
        explanation: 'Solo cuando BFARVALID (bit 15) es 1 la dirección almacenada en BFAR es confiable.'
      },
      {
        levelLabel: 'Nivel 3: Experto',
        title: 'Limpieza de Banderas de Fallo en SCB->CFSR (Write-1-to-Clear)',
        instruction: 'Las banderas del registro SCB->CFSR se limpian escribiendo un 1 en los bits que se desean borrar (w1c). Limpia las banderas BFARVALID (bit 15) y PRECISERR (bit 9) escribiendo su máscara en el registro.',
        initialRegValue: 0x00008200,
        regWidth: 32,
        expectedRegValue: 0x00008200,
        starterCode: 'REG = 0;',
        hint: 'Escribe la máscara exacta de los bits a borrar: (1UL << 15) | (1UL << 9).',
        solutionCode: 'REG = (1UL << 15) | (1UL << 9);',
        explanation: 'En los registros de estado de excepción de ARM, escribir 1 limpia la bandera; escribir 0 no tiene efecto.'
      }
    ],
    extraQuizzes: [
      {
        id: 'm15-q1',
        difficulty: 'Traza Mental',
        question: 'En un Cortex-M4, una función intenta ejecutar: uint32_t val = *(volatile uint32_t *)0x00000000; sabiendo que en la dirección 0x00000000 reside el valor inicial del MSP en Flash. ¿Provoca esto un HardFault?',
        options: [
          {
            id: 'a',
            label: 'No: la dirección 0x00000000 es perfectamente legible (es el inicio de la Flash mapeada); devolverá el valor numérico del MSP inicial sin ningún fallo de bus.',
            isCorrect: true,
            feedback: '¡Excelente precisión! Leer la dirección 0x0 es legal en Cortex-M; lo que suele fallar es escribir en ella o desreferenciar punteros a registros como ptr->campo en direcciones intermedias no mapeadas.'
          },
          {
            id: 'b',
            label: 'Sí: cualquier acceso a la dirección 0x0 está prohibido por hardware.',
            isCorrect: false,
            feedback: 'En ARM la dirección 0x0 contiene el vector de arranque inicial; no está prohibida su lectura salvo que la MPU lo especifique.'
          }
        ]
      },
      {
        id: 'm15-q2',
        difficulty: 'Lectura Datasheet',
        question: '¿Qué significa el valor 0xFFFFFFFD en el Link Register (LR / EXC_RETURN) al entrar en una rutina de interrupción de ARM Cortex-M?',
        options: [
          {
            id: 'a',
            label: 'Indica que el código interrumpido se estaba ejecutando en modo Hilo (Thread Mode) utilizando el Process Stack Pointer (PSP) y sin marco de coma flotante activo.',
            isCorrect: true,
            feedback: '¡Gran dominio de EXC_RETURN! El bit 2 en 1 indica retorno a PSP; si estuviera en 0 indicaría retorno a MSP.'
          },
          {
            id: 'b',
            label: 'Indica un fallo crítico de memoria Flash.',
            isCorrect: false,
            feedback: 'Los valores 0xFFFFFFFx en LR durante excepciones son códigos mágicos de hardware llamados EXC_RETURN.'
          }
        ]
      },
      {
        id: 'm15-q3',
        difficulty: 'Caza del Bug',
        question: 'Un ingeniero añade una función de depuración printf en HardFault_Handler que a su vez produce un fallo de bus porque el periférico UART no tiene reloj. ¿Qué le ocurre físicamente a la CPU?',
        options: [
          {
            id: 'a',
            label: 'El procesador entra en "Core Lockup": un fallo dentro de un fallo de máxima prioridad congela permanentemente el núcleo de la CPU hasta que un Watchdog externo o la línea RESET reinicien el chip.',
            isCorrect: true,
            feedback: '¡Exacto! El estado de Lockup apaga la conmutación de instrucciones del núcleo ARM. Los manejadores de fallo deben ser extremadamente simples y evitar dependencias de periféricos complejos.'
          },
          {
            id: 'b',
            label: 'El procesador reinicia automáticamente a main().',
            isCorrect: false,
            feedback: 'Sin un Watchdog activo, el Core Lockup deja el microcontrolador completamente congelado.'
          }
        ]
      },
      {
        id: 'm15-q4',
        difficulty: 'Lectura Datasheet',
        question: '¿Para qué sirve el comando addr2line de la cadena de herramientas arm-none-eabi-gcc durante el análisis forense?',
        options: [
          {
            id: 'a',
            label: 'Traduce una dirección numérica de memoria (como el PC extraído de la pila) al archivo fuente .c y número de línea exacto consultando la tabla de símbolos DWARF del binario .elf.',
            isCorrect: true,
            feedback: '¡Herramienta fundamental! "addr2line -e firmware.elf 0x08001234" localiza el bug en segundos sin ejecutar el código.'
          },
          {
            id: 'b',
            label: 'Copia el archivo por el puerto serie.',
            isCorrect: false,
            feedback: 'Es una utilidad estática de desensamblado y mapeo de símbolos de GNU Binutils.'
          }
        ]
      }
    ]
  },

  // =========================================================================
  // MÓDULO 16: ULTRA-BAJO CONSUMO Y GESTIÓN ENERGÉTICA CON BATERÍAS
  // =========================================================================
  16: {
    moduleId: 16,
    notebookSummaryTitle: 'Cuaderno Módulo 16: Física de Ultra-Bajo Consumo, WFI/WFE y Auditoría de Batería',
    whyWriteThisDown:
      'Comprender la diferencia entre potencia dinámica P = C·V²·f y corrientes de fuga parásitas en pines GPIO permite diseñar dispositivos que operen durante años con una simple pila de botón.',
    definitions: [
      {
        term: 'Instrucción __WFI() (Wait For Interrupt)',
        definition: 'Instrucción de la CPU que suspende la ejecución y detiene el reloj del núcleo hasta que una interrupción habilitada sea solicitada en el NVIC.',
        siliconReality: 'Aplica Clock Gating inmediato a la lógica combinacional de la CPU reduciendo el consumo dinámico a cero microamperios en el núcleo.',
        exampleToCopy: '__DSB(); __WFI(); // Detención de reloj segura hasta evento externo'
      },
      {
        term: 'Instrucción __WFE() (Wait For Event)',
        definition: 'Instrucción de bajo consumo que comprueba el registro de eventos de un bit interno de la CPU; si está a cero detiene el reloj sin ejecutar una rutina ISR.',
        siliconReality: 'Permite sincronización de bajísimo consumo entre núcleos o periféricos despertando en la siguiente línea de instrucción.',
        exampleToCopy: '__SEV(); __WFE(); __WFE(); // Secuencia canónica de consumo de eventos'
      },
      {
        term: 'Modo Sleep-on-Exit',
        definition: 'Modo configurado en SCB->SCR (bit 1) que hace que el núcleo vuelva a dormirse automáticamente tras atender una ISR sin retornar al hilo main().',
        siliconReality: 'Ahorra miles de ciclos de conmutación de pila y salto en sistemas guiados puramente por interrupciones periódicas o de sensores.',
        exampleToCopy: 'SCB->SCR |= (1UL << 1); // SLEEPONEXIT = 1'
      },
      {
        term: 'Pin Flotante (High-Z Parasitic Current)',
        definition: 'Estado de un pin GPIO configurado como entrada digital sin resistencia de pull conectada ni señal externa definida.',
        siliconReality: 'La tensión intermedia en la puerta de los MOSFETs complementarios del inversor provoca que ambos conduzcan simultáneamente drenando hasta 200 µA a masa.',
        exampleToCopy: 'GPIOA->MODER |= (3UL << (pin * 2U)); // Modo analógico: desconecta el buffer'
      }
    ],
    goldenRules: [
      {
        title: 'Regla de Oro de Filosofía "Race-to-Sleep"',
        formulaOrRule: 'T_run << T_sleep -> Ejecuta a máxima velocidad el menor tiempo posible y duerme de inmediato',
        explanation: 'Completar el trabajo en 5 ms a 84 MHz y dormir 995 ms consume mucho menos energía total que trabajar a 2 MHz durante 200 ms.'
      },
      {
        title: 'Regla de Configuración de Pines No Usados en Deep-Sleep',
        formulaOrRule: 'SHALL set unused GPIOs to Analog Mode (PUPDR = 0, MODER = 3) before entering Stop mode',
        explanation: 'Desconecta físicamente los transistores del Schmitt Trigger digital eliminando corrientes de fuga parasitarias.'
      }
    ],
    sketchDiagramSteps: [
      '1. Dibuja un gráfico de corriente (eje Y) frente a tiempo (eje X).',
      '2. Dibuja un pico estrecho de 5 ms de duración a 15 mA etiquetado como "T_run: Procesado de sensor y radio".',
      '3. Dibuja una meseta plana y larga de 995 ms de duración a 2 µA etiquetada como "T_sleep: Modo Stop / WFI".',
      '4. Traza una línea discontinua horizontal cerca del fondo a ~77 µA etiquetada como "I_media efectiva".',
      '5. Escribe la fórmula de autonomía: Horas = Capacidad_mAh / I_media_mA.'
    ],
    annotatedCodeToCopy: {
      code: `// Entrada Canónica en Modo STOP de Bajo Consumo con Despertar por RTC/EXTI
void enter_system_stop_mode(void) {
    // 1. Configurar regulador principal en bajo consumo:
    PWR->CR |= PWR_CR_LPDS;
    
    // 2. Activar bit SLEEPDEEP en el núcleo ARM:
    SCB->SCR |= SCB_SCR_SLEEPDEEP_Msk;
    
    // 3. Vaciar buffers de escritura y esperar interrupción:
    __DSB();
    __WFI(); // El microcontrolador duerme aquí consumiendo ~2 uA!
    
    // 4. Código tras despertar: reconfigurar relojes HSE/PLL si se requiere:
    SCB->SCR &= ~SCB_SCR_SLEEPDEEP_Msk;
    system_clock_reconfig_pll();
}`,
      lineNotes: [
        'Línea 3: Selecciona el modo de bajo consumo del regulador interno para apagar los osciladores rápidos.',
        'Línea 6: SLEEPDEEP indica a la CPU que la orden WFI debe activar el modo profundo y no un simple apagado de núcleo.',
        'Línea 10: La CPU se congela físicamente en esta línea; el consumo cae a microamperios hasta el flanco de despertar.'
      ]
    },
    codingChallenges: [
      {
        levelLabel: 'Nivel 1: Base',
        title: 'Habilitación del Bit SLEEPDEEP en SCB->SCR',
        instruction: 'En el registro System Control Register (SCB->SCR en 0xE000ED10), activa el bit 2 (SLEEPDEEP) para ordenar apagado profundo del regulador en el próximo WFI.',
        initialRegValue: 0x00000000,
        regWidth: 32,
        expectedRegValue: 0x00000004,
        starterCode: 'REG = 0;',
        hint: 'Aplica una máscara OR con (1UL << 2).',
        solutionCode: 'REG |= (1UL << 2);',
        explanation: 'El bit SLEEPDEEP conmuta entre modo Sleep simple y modos Stop/Standby de bajo consumo.'
      },
      {
        levelLabel: 'Nivel 2: Intermedio',
        title: 'Configuración de Pin GPIO en Modo Analógico para Evitar Fugas',
        instruction: 'En el registro GPIOA->MODER, configura el pin 5 en Modo Analógico (0b11) en los bits [11:10] sin alterar los demás pines.',
        initialRegValue: 0x00000000,
        regWidth: 32,
        expectedRegValue: 0x00000C00,
        starterCode: 'REG = 0;',
        hint: 'Aplica una máscara OR con (3UL << 10): (3UL << 10) = 0x0C00.',
        solutionCode: 'REG |= (3UL << 10);',
        explanation: 'En modo analógico (11) se desconecta el Schmitt Trigger de entrada, impidiendo corrientes de fuga por tensión flotante.'
      },
      {
        levelLabel: 'Nivel 3: Experto',
        title: 'Activación del Modo Sleep-on-Exit en SCB->SCR',
        instruction: 'Configura el registro SCB->SCR para activar simultáneamente SLEEPONEXIT (bit 1) y limpiar SLEEPDEEP (bit 2) para reposo ligero automático entre interrupciones.',
        initialRegValue: 0x00000004,
        regWidth: 32,
        expectedRegValue: 0x00000002,
        starterCode: 'REG = 4;',
        hint: 'Limpia el bit 2 y levanta el bit 1: (REG & ~(1UL << 2)) | (1UL << 1).',
        solutionCode: 'REG = (REG & ~(1UL << 2)) | (1UL << 1);',
        explanation: 'SLEEPONEXIT evita que la CPU regrese a main(), durmiendo automáticamente al finalizar cada rutina ISR.'
      }
    ],
    extraQuizzes: [
      {
        id: 'm16-q1',
        difficulty: 'Lectura Datasheet',
        question: '¿Por qué al despertar del modo STOP en un microcontrolador STM32F4 la CPU corre a 16 MHz en lugar de sus 84 MHz habituales?',
        options: [
          {
            id: 'a',
            label: 'Porque el hardware apaga el PLL y el oscilador de cuarzo HSE en modo STOP; al despertar, arranca de inmediato con el oscilador RC interno rápido HSI (16 MHz) y es tarea del firmware volver a encender el PLL.',
            isCorrect: true,
            feedback: '¡Exacto! El HSI arranca en microsegundos, permitiendo atender la interrupción de inmediato sin esperar los milisegundos que tarda un cuarzo externo en estabilizarse.'
          },
          {
            id: 'b',
            label: 'Porque el chip sufrió un reinicio en frío.',
            isCorrect: false,
            feedback: 'En modo STOP la SRAM y los registros se conservan intactos; no es un reinicio.'
          }
        ]
      },
      {
        id: 'm16-q2',
        difficulty: 'Caza del Bug',
        question: 'Un dispositivo a batería consume 15 µA en Deep-Sleep en banco de pruebas. Al conectarlo al sensor I2C en la PCB definitiva, el consumo en sueño sube a 350 µA. Descubres que las líneas SDA y SCL tienen resistencias pull-up externas a 3.3V y el sensor mantiene el bus a 0V. ¿Qué ocurre?',
        options: [
          {
            id: 'a',
            label: 'Las resistencias de pull-up (ej. 10 kΩ) conectadas a 3.3V drenan corriente continuamente hacia masa a través de los transistores del sensor: I = 3.3V / 10kΩ = 330 µA de fuga constante.',
            isCorrect: true,
            feedback: '¡Causa clásica de drenaje de batería! Durante el sueño profundo, los buses compartidos deben dejarse en alta impedancia o sin caminos a masa.'
          },
          {
            id: 'b',
            label: 'El condensador de desacoplo de la fuente está roto.',
            isCorrect: false,
            feedback: 'La fuga por resistencias de pull-up externas es una de las trampas más habituales en diseño hardware de bajo consumo.'
          }
        ]
      },
      {
        id: 'm16-q3',
        difficulty: 'Traza Mental',
        question: '¿Qué diferencia práctica existe entre despertar de modo STOP y despertar de modo STANDBY en un microcontrolador Cortex-M?',
        options: [
          {
            id: 'a',
            label: 'En STOP se conserva toda la memoria SRAM y la CPU continúa en la siguiente línea tras __WFI(); en STANDBY se apaga la SRAM interna y el despertar equivale a un reinicio completo desde el vector reset.',
            isCorrect: true,
            feedback: '¡Totalmente correcto! STANDBY consume menos corriente (< 1 µA) pero pierde el contexto de las variables a menos que se guarden en la memoria RTC.'
          },
          {
            id: 'b',
            label: 'Ambos modos son idénticos y solo cambia el nombre en el datasheet.',
            isCorrect: false,
            feedback: 'La retención de la memoria SRAM es la diferencia arquitectónica clave entre Stop y Standby.'
          }
        ]
      },
      {
        id: 'm16-q4',
        difficulty: 'Lectura Datasheet',
        question: '¿Para qué sirve la instrucción __DSB() (Data Synchronization Barrier) inmediatamente antes de invocar __WFI()?',
        options: [
          {
            id: 'a',
            label: 'Garantiza que todas las escrituras pendientes en buffers de bus de los periféricos se hayan completado en el silicio antes de que la CPU detenga su reloj.',
            isCorrect: true,
            feedback: '¡Imprescindible en ARM! Sin la barrera DSB, una orden de apagado de periférico podría quedar en tránsito en el bus mientras la CPU duerme.'
          },
          {
            id: 'b',
            label: 'Reinicia el temporizador de Watchdog.',
            isCorrect: false,
            feedback: 'DSB es una instrucción de sincronización de pipeline y buffers de memoria de la arquitectura ARM.'
          }
        ]
      }
    ]
  },

  // =========================================================================
  // MÓDULO 17: SEGURIDAD HARDWARE (MPU, SECURE BOOT, SHA-256 Y TRNG)
  // =========================================================================
  17: {
    moduleId: 17,
    notebookSummaryTitle: 'Cuaderno Módulo 17: Seguridad Hardware, Aislamiento MPU, Secure Boot y Criptografía',
    whyWriteThisDown:
      'Aprender a blindar la memoria con la MPU contra inyección de código y comprender por qué la comparación memcmp() es vulnerable a ataques de tiempo es la base de la ciberseguridad embebida.',
    definitions: [
      {
        term: 'MPU (Memory Protection Unit)',
        definition: 'Periférico en el bus de la CPU que define regiones de memoria con permisos estrictos de lectura, escritura y ejecución para aislar tareas y proteger el kernel.',
        siliconReality: 'Compara cada dirección del bus de instrucciones y datos en 1 ciclo; si hay violación, aborta el ciclo y lanza MemManage_Handler.',
        exampleToCopy: 'MPU->RBAR = region_base_addr; MPU->RASR = region_attributes;'
      },
      {
        term: 'Bit XN (Execute Never)',
        definition: 'Atributo de seguridad en MPU->RASR (bit 28) que prohíbe que el Program Counter busque o ejecute instrucciones desde esa región de memoria.',
        siliconReality: 'Al aplicarlo sobre toda la SRAM (0x20000000), impide que un atacante ejecute código inyectado mediante un desbordamiento de búfer en la pila.',
        exampleToCopy: '#define MPU_RASR_XN (1UL << 28) // Prohibición física de ejecución en RAM'
      },
      {
        term: 'Comparación en Tiempo Constante',
        definition: 'Algoritmo que compara dos arrays acumulando diferencias mediante XOR sin utilizar sentencias condicionales ni retornos tempranos.',
        siliconReality: 'Ejecuta exactamente el mismo número de ciclos de reloj independientemente de cuántos bytes coincidan, neutralizando los ataques de canal lateral (Timing Attacks).',
        exampleToCopy: 'for (int i=0; i<32; i++) diff |= (a[i] ^ b[i]); return (diff == 0);'
      },
      {
        term: 'TRNG (True Random Number Generator)',
        definition: 'Periférico hardware que genera números aleatorios a partir del ruido térmico y cuántico de osciladores y diodos analógicos en silicio.',
        siliconReality: 'Proporciona entropía física no determinista e impredecible para claves criptográficas y nonces, a diferencia de rand() de C.',
        exampleToCopy: 'uint32_t true_rand = RNG->DR; // Entropía cuántica de silicio'
      }
    ],
    goldenRules: [
      {
        title: 'Regla de Oro de Verificación de Firmas Criptográficas',
        formulaOrRule: 'SHALL NOT use memcmp() or strcmp() to verify MACs, signatures or hashes -> Use constant-time comparison',
        explanation: 'memcmp() retorna en el primer byte discordante, permitiendo a un atacante adivinar firmas completas midiendo tiempos por el puerto serie.'
      },
      {
        title: 'Regla de Borrado Seguro de Claves en SRAM (Zeroization)',
        formulaOrRule: 'SHALL wipe cryptographic keys from RAM using volatile pointers or memset_s()',
        explanation: 'Los optimizadores -O2 eliminan llamadas normales a memset() al final de funciones considerándolas código muerto (Dead Store Elimination).'
      }
    ],
    sketchDiagramSteps: [
      '1. Dibuja el mapa de memoria vertical: Flash (0x08000000), SRAM (0x20000000) y Periféricos (0x40000000).',
      '2. Dibuja una línea roja alrededor de la región SRAM etiquetada: "Región MPU 0: SRAM XN = 1 (Prohibido ejecutar instrucciones)".',
      '3. Dibuja dentro de la SRAM una caja pequeña en la base de la pila etiquetada: "Región MPU 1: Stack Guard (AP = 000 Sin Acceso)".',
      '4. Dibuja un intento de escritura de un puntero desbocado chocando contra el Stack Guard y saliendo una flecha hacia: "MemManage_Handler".',
      '5. Escribe al pie: "Aislamiento espacial garantizado por hardware en 1 ciclo".'
    ],
    annotatedCodeToCopy: {
      code: `// Verificación de Firma HMAC-SHA256 en Tiempo Constante
bool verify_hmac_constant_time(const uint8_t *computed, const uint8_t *received, uint32_t len) {
    volatile uint8_t mismatch = 0U;
    
    // Recorrer obligatoriamente todos los bytes sin salir antes:
    for (uint32_t i = 0U; i < len; i++) {
        mismatch |= (uint8_t)(computed[i] ^ received[i]);
    }
    
    // Retorna verdadero solo si todos los bytes fueron idénticos:
    return (mismatch == 0U);
}`,
      lineNotes: [
        'Línea 2: El calificador volatile en mismatch impide que el compilador optimice o rompa el bucle antes de tiempo.',
        'Línea 6: El operador XOR (^) da cero solo si ambos bytes son iguales; el OR acumulado (|) preserva cualquier discrepancia.',
        'Línea 10: La función tarda idénticos ciclos de CPU tanto si falla en el primer byte como si acierta los 32 bytes.'
      ]
    },
    codingChallenges: [
      {
        levelLabel: 'Nivel 1: Base',
        title: 'Habilitación de la MPU Hardware en MPU->CTRL',
        instruction: 'En el registro MPU->CTRL (0xE000ED94), activa la MPU habilitando el bit 0 (ENABLE) y el bit 2 (PRIVDEFENA) para mantener el mapa de memoria por defecto en modo privilegiado.',
        initialRegValue: 0x00000000,
        regWidth: 32,
        expectedRegValue: 0x00000005,
        starterCode: 'REG = 0;',
        hint: 'Aplica una máscara OR con (1UL << 2) | (1UL << 0) = 0x05.',
        solutionCode: 'REG |= (1UL << 2) | (1UL << 0);',
        explanation: 'PRIVDEFENA permite que el código del kernel privilegiado acceda a los periféricos sin tener que crear una región explícita para cada uno.'
      },
      {
        levelLabel: 'Nivel 2: Intermedio',
        title: 'Configuración del Bit XN (Execute Never) en MPU->RASR',
        instruction: 'En el registro MPU->RASR de una región de memoria, activa el bit 28 (XN) para prohibir la ejecución de instrucciones desde esa área sin alterar los demás bits.',
        initialRegValue: 0x03000021,
        regWidth: 32,
        expectedRegValue: 0x13000021,
        starterCode: 'REG = 0x03000021;',
        hint: 'Aplica una máscara OR con (1UL << 28): 0x10000000.',
        solutionCode: 'REG |= (1UL << 28);',
        explanation: 'El bit 28 (XN) neutraliza ataques de inyección de código bloqueando la búsqueda de instrucciones en esa región de memoria.'
      },
      {
        levelLabel: 'Nivel 3: Experto',
        title: 'Borrado Seguro de Clave Criptográfica en Memoria RAM',
        instruction: 'Simula el borrado forzado de un registro que contiene una clave secreta (0xCAFEBABE). Escribe un cero absoluto mediante un puntero volátil para garantizar que el compilador no descarte la operación.',
        initialRegValue: 0xCAFEBABE,
        regWidth: 32,
        expectedRegValue: 0x00000000,
        starterCode: 'REG = 0xCAFEBABE;',
        hint: 'Escribe cero forzando la asignación: REG = 0U;',
        solutionCode: 'REG = 0U;',
        explanation: 'La puesta a cero con puntero volátil garantiza que la clave desaparezca de la celda de silicio antes de liberar la memoria.'
      }
    ],
    extraQuizzes: [
      {
        id: 'm17-q1',
        difficulty: 'Caza del Bug',
        question: 'Un desarrollador implementa la función de verificación de firmware en un bootloader usando: if (memcmp(hash_calculado, hash_recibido, 32) == 0). Un atacante conectado por UART envía paquetes y mide los microsegundos de respuesta con un analizador lógico. ¿Qué vulnerabilidad tiene el sistema?',
        options: [
          {
            id: 'a',
            label: 'Ataque de canal lateral por tiempo (Timing Attack): memcmp retorna inmediatamente tras el primer byte que no coincide, permitiendo al atacante deducir el hash válido byte a byte en pocos minutos.',
            isCorrect: true,
            feedback: '¡Vulnerabilidad crítica clásica! La diferencia de decenas de nanosegundos al fallar en el byte 0 frente al byte 1 filtra información confidencial al exterior.'
          },
          {
            id: 'b',
            label: 'El microcontrolador no puede ejecutar la función memcmp en Flash.',
            isCorrect: false,
            feedback: 'memcmp funciona perfectamente, pero su tiempo de ejecución depende del contenido de los datos.'
          }
        ]
      },
      {
        id: 'm17-q2',
        difficulty: 'Lectura Datasheet',
        question: '¿Por qué la dirección base (RBAR) de una región MPU en arquitectura ARMv7-M debe ser obligatoriamente un múltiplo de su propio tamaño?',
        options: [
          {
            id: 'a',
            label: 'Porque el decodificador de direcciones hardware en silicio compara solo los bits superiores de la dirección descartando los bits inferiores definidos por el campo SIZE.',
            isCorrect: true,
            feedback: '¡Física de silicio pura! La MPU utiliza máscaras de bits simples para realizar la comparación en 1 ciclo de reloj sin necesidad de sumadores de offset.'
          },
          {
            id: 'b',
            label: 'Por una limitación estética del archivo de cabecera CMSIS.',
            isCorrect: false,
            feedback: 'Es una restricción de diseño del comparador de direcciones en el bus interno del núcleo ARM.'
          }
        ]
      },
      {
        id: 'm17-q3',
        difficulty: 'Traza Mental',
        question: 'Si una tarea que se ejecuta en Modo No-Privilegiado (Unprivileged Thread Mode) intenta escribir en un registro del periférico NVIC (0xE000E100) para deshabilitar una interrupción, ¿qué ocurre en el microcontrolador?',
        options: [
          {
            id: 'a',
            label: 'El hardware bloquea el acceso en el bus y dispara una excepción inmediata MemManage_Handler / HardFault por intento de acceso a espacio del sistema desde modo no privilegiado.',
            isCorrect: true,
            feedback: '¡Aislamiento de seguridad total! El espacio de control del sistema (SCS) en 0xE000E000 solo puede ser accedido en Modo Privilegiado.'
          },
          {
            id: 'b',
            label: 'La interrupción se deshabilita con normalidad.',
            isCorrect: false,
            feedback: 'Las tareas no privilegiadas tienen prohibido por hardware reconfigurar el controlador de interrupciones.'
          }
        ]
      },
      {
        id: 'm17-q4',
        difficulty: 'Lectura Datasheet',
        question: '¿Por qué la función rand() de la librería estándar <stdlib.h> está explícitamente prohibida para generar claves o tokens de seguridad en sistemas embebidos?',
        options: [
          {
            id: 'a',
            label: 'Porque es un generador pseudoaleatorio lineal (PRNG) cuya secuencia es 100% predecible si se conoce el algoritmo o la semilla inicial; para seguridad se debe usar un periférico TRNG.',
            isCorrect: true,
            feedback: '¡Regla fundamental de seguridad! La entropía de seguridad debe provenir de ruido físico aleatorio (TRNG) y no de algoritmos deterministas.'
          },
          {
            id: 'b',
            label: 'Porque rand() consume demasiada memoria Flash.',
            isCorrect: false,
            feedback: 'rand() es muy pequeño, pero su predictibilidad matemática lo hace nulo para criptografía.'
          }
        ]
      }
    ]
  }
};
