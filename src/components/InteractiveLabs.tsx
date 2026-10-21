/**
 * @file InteractiveLabs.tsx
 * @description Motor evaluador determinista de expresiones C (`evaluateEmbeddedCCode`)
 * y conjunto de las 10 Estaciones del Laboratorio Interactivo de Hardware (`Lab 0` a `Lab 9`):
 *
 * - `Lab 0` (`c-memory-pointers`): Base C — Variables, Punteros (`&` / `*`), Endianness, Padding y Structs (`->`).
 * - `Lab 1` (`gpio-xray`): Pinout & Rayos X — Transistores MOSFET P/N, Push-Pull vs Open-Drain, Ley de Ohm, Rebotes y RCC.
 * - `Lab 2` (`register-gym`): Datasheet & Bits — Manipulación bit a bit en registros reales de 8 y 32 bits.
 * - `Lab 3` (`c-live-editor`): Editor C en Vivo — Sandbox libre para evaluar sentencias C paso a paso.
 * - `Lab 4` (`memory-bus`): Memoria, DMA & ISR — Mapa Flash/SRAM/MMIO, ráfagas DMA, Stack de ISR y Ring Buffer FIFO.
 * - `Lab 5` (`compiler-volatile`): Compilador & `volatile` — Optimización `-O0` vs `-O2` y Condición de Carrera (`ODR |=` vs `BSRR =`).
 * - `Lab 6` (`logic-analyzer`): Analizador Lógico & PWM — Osciloscopio digital para PWM (`PSC`, `ARR`, `CCR`) y tramas `UART`, `I2C`, `SPI`.
 * - `Lab 7` (`peripherals-adc-wdg`): Periféricos — Conversor `SAR ADC` de 12 bits, Árbol de Reloj `PLL` y `Watchdog Timer (IWDG)`.
 * - `Lab 8` (`multi-file-toolchain`): Librerías, Linker & Boot — Proyectos `.h`/`.c`, librerías `.a`, `const`/`union` y salto `Bootloader -> App (SCB->VTOR)`.
 * - `Lab 9` (`space-defense-ecss`): Normativa Espacial `ECSS`/`NASA` & `Rad-Hard` — Simulador de radiación cósmica (`SEU`), votador `TMR 2-de-3`, `Memory Scrubbing`, calculadora `ECSS Annex M` y certificador `100% MC/DC`.
 */

import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Zap,
  Binary,
  HardDrive,
  Activity,
  Play,
  RotateCcw,
  ShieldAlert,
  Lock,
  Unlock,
  Sparkles,
  Code,
  Gauge,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { MCUProfile } from '../data/mcusData';
import { LabViewType } from '../data/curriculumData';

/** Unión de identificadores de las 10 estaciones de laboratorio interactivo disponibles. */
export type ExtendedLabViewType =
  | LabViewType
  | 'c-live-editor'
  | 'peripherals-adc-wdg'
  | 'multi-file-toolchain'
  | 'space-defense-ecss';

/**
 * Representa la traza de ejecución de una única sentencia C sobre un registro hardware simulado.
 */
export interface CStatementStep {
  /** Sentencia en C tal como fue ejecutada (ej. `REG |= (1UL << 5);`). */
  statement: string;
  /** Valor numérico sin signo del registro antes de ejecutar la sentencia. */
  beforeVal: number;
  /** Valor numérico sin signo del registro después de ejecutar la sentencia. */
  afterVal: number;
  /** Lista de índices de bit (`0..7` o `0..31`) cuyo estado conmutó en este paso. */
  changedBits: number[];
  /** Explicación en español del operador bit a bit aplicado y su máscara hexadecimal. */
  explanation: string;
}

/**
 * Resultado devuelto por el evaluador de código C embebido (`evaluateEmbeddedCCode`).
 */
export interface CEvalResult {
  /** Indica si todas las sentencias se analizaron y ejecutaron sin errores de sintaxis. */
  success: boolean;
  /** Valor final del registro tras aplicar todas las sentencias secuencialmente. */
  finalValue: number;
  /** Desglose paso a paso de cada sentencia ejecutada. */
  steps: CStatementStep[];
  /** Mensaje de diagnóstico en caso de error de sintaxis o símbolo no permitido. */
  error?: string;
}

/**
 * Evaluador determinista y seguro de expresiones y sentencias bit a bit en C para registros embebidos.
 *
 * Arquitectura del evaluador:
 * 1. Limpia comentarios de bloque (`/* ... *\/`) y de línea (`// ...`).
 * 2. Divide el bloque de código en sentencias individuales separadas por punto y coma (`;`).
 * 3. Sustituye desreferencias de punteros MMIO (`*(volatile uint32_t *)0x...`) y nombres de registros
 *    reales (`GPIOA->ODR`, `NRF_P0->OUTSET`, `sio_hw->gpio_set`, `DDRB`, `REG`, etc.) por el valor
 *    numérico actual del registro en ese instante de la traza.
 * 4. Elimina sufijos enteros de C (`U`, `UL`, `L`) para compatibilidad con el motor aritmético JS
 *    y valida mediante lista blanca estricta que solo existan literales numéricos y operadores bit a bit.
 * 5. Fuerza aritmética sin signo de 32 bits (`>>> 0`) y aplica la máscara de anchura (`0xFF` o `0xFFFFFFFF`)
 *    para emular con exactitud el desbordamiento y truncamiento de un registro físico en silicio.
 *
 * @param code Bloque de una o varias sentencias en C separadas por `;`.
 * @param initialReg Valor inicial del registro antes de ejecutar la primera sentencia.
 * @param width Anchura en bits del registro (`8` para AVR o `32` para ARM/RISC-V).
 * @returns Objeto `CEvalResult` con el valor final, traza de pasos y estado de éxito.
 */
export function evaluateEmbeddedCCode(
  code: string,
  initialReg: number,
  width: 8 | 32 = 32
): CEvalResult {
  const maxMask = width === 8 ? 0xff : 0xffffffff;
  let currentReg = (initialReg >>> 0) & maxMask;
  const steps: CStatementStep[] = [];

  // Strip block and line comments
  const cleanCode = code
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '')
    .trim();

  if (!cleanCode) {
    return {
      success: false,
      finalValue: currentReg,
      steps: [],
      error: 'Escribe al menos una expresión o sentencia en C (ej: REG |= (1 << 5);).'
    };
  }

  const rawStatements = cleanCode
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const sanitizeCExpr = (expr: string, regVal: number): string => {
    let e = expr.trim();
    // Replace pointer dereferences like *(volatile uint32_t *)0x... with REG
    e = e.replace(/\*\s*\(\s*volatile\s+uint(8|16|32)_t\s*\*\s*\)\s*0x[0-9a-fA-F]+[uUlL]*/g, String(regVal >>> 0));
    // Replace common register identifiers with current numeric value
    e = e.replace(
      /\b(GPIO[A-Z]->(MODER|OTYPER|OSPEEDR|PUPDR|IDR|ODR|BSRR)|NRF_P0->(OUT|OUTSET|OUTCLR|DIRSET|PIN_CNF\[\d+\])|sio_hw->(gpio_out|gpio_set|gpio_clr|gpio_togl|gpio_oe_set)|GPIO\.(out_w1ts|out_w1tc|enable_w1ts)\.val|RCC->AHB1ENR|DDR[BCD]|PORT[BCD]|PIN[BCD]|REG)\b/g,
      String(regVal >>> 0)
    );
    // Strip integer suffixes like UL, U, L after hex/bin/dec numbers
    e = e.replace(/\b(0x[0-9a-fA-F]+|0b[01]+|\d+)[uUlL]+\b/g, '$1');

    // Validate allowed characters (numbers, hex, bitwise ops, parens, spaces)
    if (!/^[0-9a-fA-FxXbB\s|&^~<>+\-*/()%]+$/.test(e)) {
      throw new Error(`Símbolo no reconocido en la expresión: "${expr}". Usa REG y operadores C (|, &, ^, ~, <<, >>).`);
    }
    return e;
  };

  try {
    for (const stmt of rawStatements) {
      const before = currentReg;
      let after = currentReg;
      let opDesc = '';

      // Match compound or direct assignment to any register name
      const assignMatch = stmt.match(
        /^([A-Za-z0-9_.\->[\]*()\s]+?)\s*(\|=|&=|\^=|<<=|>>=|=)\s*(.+)$/
      );

      if (assignMatch && !stmt.startsWith('(')) {
        const op = assignMatch[2];
        const rhsRaw = assignMatch[3];
        const sanitizedRhs = sanitizeCExpr(rhsRaw, currentReg);
        const rhsVal = (Number(new Function(`return (${sanitizedRhs}) >>> 0;`)()) >>> 0) & maxMask;

        if (op === '|=') {
          after = ((currentReg | rhsVal) >>> 0) & maxMask;
          opDesc = `OR inclusivo (|=): aplica máscara 0x${rhsVal.toString(16).toUpperCase()} para ENCENDER bits en 1.`;
        } else if (op === '&=') {
          after = ((currentReg & rhsVal) >>> 0) & maxMask;
          opDesc = `AND de limpieza (&=): aplica máscara 0x${rhsVal.toString(16).toUpperCase()} conservando solo donde hay 1.`;
        } else if (op === '^=') {
          after = ((currentReg ^ rhsVal) >>> 0) & maxMask;
          opDesc = `XOR de inversión (^=): conmuta los bits activos en la máscara 0x${rhsVal.toString(16).toUpperCase()}.`;
        } else if (op === '<<=') {
          after = ((currentReg << rhsVal) >>> 0) & maxMask;
          opDesc = `Desplazamiento a la izquierda (<<=) de ${rhsVal} posiciones.`;
        } else if (op === '>>=') {
          after = ((currentReg >>> rhsVal) >>> 0) & maxMask;
          opDesc = `Desplazamiento a la derecha (>>=) de ${rhsVal} posiciones.`;
        } else {
          after = rhsVal;
          opDesc = `Asignación directa (=): carga el valor 0x${rhsVal.toString(16).toUpperCase()} en el registro.`;
        }
      } else {
        // Pure expression evaluation
        const sanitized = sanitizeCExpr(stmt, currentReg);
        after = (Number(new Function(`return (${sanitized}) >>> 0;`)()) >>> 0) & maxMask;
        opDesc = `Evaluación directa de expresión C -> resultado 0x${after.toString(16).toUpperCase()}.`;
      }

      const diffMask = (before ^ after) >>> 0;
      const changedBits: number[] = [];
      for (let b = 0; b < width; b++) {
        if (((diffMask >>> b) & 1) === 1) {
          changedBits.push(b);
        }
      }

      steps.push({
        statement: stmt + ';',
        beforeVal: before,
        afterVal: after,
        changedBits,
        explanation: opDesc
      });

      currentReg = after;
    }

    return {
      success: true,
      finalValue: currentReg,
      steps
    };
  } catch (err: unknown) {
    return {
      success: false,
      finalValue: currentReg,
      steps,
      error: err instanceof Error ? err.message : 'Error de sintaxis en la expresión C.'
    };
  }
}

/**
 * Propiedades de entrada del componente `InteractiveLabs`.
 */
interface InteractiveLabsProps {
  /** Perfil del microcontrolador actualmente seleccionado en la barra superior. */
  mcu: MCUProfile;
  /** Identificador de la estación de laboratorio activa (`Lab 0` a `Lab 9`). */
  activeLab: ExtendedLabViewType;
  /** Callback para cambiar de estación de laboratorio desde las pestañas superiores. */
  onSelectLab: (lab: ExtendedLabViewType) => void;
}

/**
 * Componente principal de las 10 Estaciones del Laboratorio Interactivo.
 * Sincroniza automáticamente los registros, pines y buses mostrados cuando el usuario
 * conmuta entre los 5 microcontroladores (`ATmega328P`, `STM32F401`, `ESP32-C3`, `nRF52840`, `RP2040`).
 */
export const InteractiveLabs: React.FC<InteractiveLabsProps> = ({
  mcu,
  activeLab,
  onSelectLab
}) => {
  // --- STATE FOR LAB 0: C MEMORY, VARIABLES, POINTERS & STRUCTS ---
  const [cVarA, setCVarA] = useState<number>(42);
  const [cVarB, setCVarB] = useState<number>(100);
  const [ptrTarget, setPtrTarget] = useState<'varA' | 'varB' | 'structODR'>('varA');
  const [structModer, setStructModer] = useState<number>(0x00000400);
  const [structOdr, setStructOdr] = useState<number>(0x00000020);
  const [lastPointerAction, setLastPointerAction] = useState<string>(
    'uint32_t *ptr = &velocidad; // ptr apunta a la dirección 0x20000000'
  );
  const [endianHexValue, setEndianHexValue] = useState<number>(0x12345678);
  const [structLayoutOptimized, setStructLayoutOptimized] = useState<boolean>(false);

  // --- STATE FOR LAB 1: GPIO X-RAY & PINOUT ---
  const [selectedPinNumber, setSelectedPinNumber] = useState<number>(
    mcu.pins.find((p) => p.type === 'gpio')?.number || 1
  );
  const [clockEnabled, setClockEnabled] = useState<boolean>(true);
  const [pinDirection, setPinDirection] = useState<'output' | 'input'>('output');
  const [outputMode, setOutputMode] = useState<'push-pull' | 'open-drain'>('push-pull');
  const [pullResistor, setPullResistor] = useState<'none' | 'pull-up' | 'pull-down'>('none');
  const [outputBit, setOutputBit] = useState<0 | 1>(1);
  const [externalButtonPressed, setExternalButtonPressed] = useState<boolean>(false);
  const [debounceHistoryByte, setDebounceHistoryByte] = useState<number>(0xff);
  const [ledForwardVoltage, setLedForwardVoltage] = useState<number>(2.0);
  const [ledResistorOhms, setLedResistorOhms] = useState<number>(330);

  // --- STATE FOR LAB 2: REGISTER GYM ---
  const [selectedRegIndex, setSelectedRegIndex] = useState<number>(0);
  const [regValue, setRegValue] = useState<number>(mcu.registers[0]?.resetValue ?? 0);
  const [targetBit, setTargetBit] = useState<number>(5);
  const [lastBitwiseOp, setLastBitwiseOp] = useState<string>('Valor de Reset tras encender el MCU');

  // --- STATE FOR LAB 3: LIVE C EXPRESSION SANDBOX ---
  const [customCCode, setCustomCCode] = useState<string>(
    `// Escribe tus propias sentencias en C aquí y pulsa Ejecutar:\nREG |= (1UL << 5);                  // Enciende bit 5\nREG = (REG & ~(3UL << 10)) | (2UL << 10); // Escribe 10 en bits [11:10]\nREG ^= (1UL << 0);                  // Invierte bit 0`
  );
  const [sandboxInitialReg, setSandboxInitialReg] = useState<number>(0x00000c01);
  const [cEvalResult, setCEvalResult] = useState<CEvalResult>(() =>
    evaluateEmbeddedCCode(
      `REG |= (1UL << 5);\nREG = (REG & ~(3UL << 10)) | (2UL << 10);\nREG ^= (1UL << 0);`,
      0x00000c01,
      32
    )
  );

  // --- STATE FOR LAB 4: MEMORY, BUS & DMA/ISR ---
  const [selectedMemIndex, setSelectedMemIndex] = useState<number>(0);
  const [dmaSamples, setDmaSamples] = useState<number[]>([2048, 2410, 2890, 3120, 2750, 1980, 1420, 1024]);
  const [dmaTransferCount, setDmaTransferCount] = useState<number>(0);
  const [isrActive, setIsrActive] = useState<boolean>(false);
  const [rbCells, setRbCells] = useState<string[]>(['A', 'T', '+', 'O', 'K', '·', '·', '·']);
  const [rbHead, setRbHead] = useState<number>(5);
  const [rbTail, setRbTail] = useState<number>(0);
  const [rbStatusMsg, setRbStatusMsg] = useState<string>(
    'Buffer circular de 8 casillas (Máscara & 7): 5 bytes pendientes de leer por main()'
  );

  // --- STATE FOR LAB 5: COMPILER, VOLATILE & RACE CONDITION ---
  const [useVolatile, setUseVolatile] = useState<boolean>(true);
  const [optLevel, setOptLevel] = useState<'-O0' | '-O2'>('-O2');
  const [ramFlagValue, setRamFlagValue] = useState<0 | 1>(0);
  const [raceMode, setRaceMode] = useState<'rmw-odr' | 'atomic-bsrr'>('rmw-odr');
  const [raceStep, setRaceStep] = useState<number>(0);

  // --- STATE FOR LAB 6: LOGIC ANALYZER (PWM & SERIAL) ---
  const [analyzerMode, setAnalyzerMode] = useState<'pwm' | 'uart' | 'i2c' | 'spi'>('pwm');
  const [pwmDuty, setPwmDuty] = useState<number>(40);
  const [pwmPrescaler, setPwmPrescaler] = useState<number>(83);
  const [pwmArr, setPwmArr] = useState<number>(999);
  const [serialByte, setSerialByte] = useState<number>(0x41);
  const [i2cAddress] = useState<number>(0x3c);
  const [i2cAck, setI2cAck] = useState<boolean>(true);

  // --- STATE FOR LAB 7: SAR ADC, CLOCK TREE PLL & WATCHDOG ---
  const [analogVoltageMv, setAnalogVoltageMv] = useState<number>(2150); // 0..3300 mV
  const [crystalMhz, setCrystalMhz] = useState<number>(8);
  const [pllMult, setPllMult] = useState<number>(21);
  const [pllDiv, setPllDiv] = useState<number>(2);
  const [apb1Div, setApb1Div] = useState<number>(2);
  const [wdgCounter, setWdgCounter] = useState<number>(100);
  const [wdgCpuHung, setWdgCpuHung] = useState<boolean>(false);
  const [wdgResetTriggered, setWdgResetTriggered] = useState<boolean>(false);

  // Sync when MCU changes
  useEffect(() => {
    const defaultGpio = mcu.pins.find((p) => p.name.includes('5') || p.type === 'gpio') || mcu.pins[0];
    setSelectedPinNumber(defaultGpio.number);
    setClockEnabled(true);
    setSelectedRegIndex(0);
    setRegValue(mcu.registers[0]?.resetValue ?? 0);
    setLastBitwiseOp(
      `Registro inicializado a su Reset Value (${formatHex(
        mcu.registers[0]?.resetValue ?? 0,
        mcu.registers[0]?.width ?? 32
      )})`
    );
    setSelectedMemIndex(0);
  }, [mcu]);

  const currentReg = mcu.registers[selectedRegIndex] || mcu.registers[0];
  const selectedPin = mcu.pins.find((p) => p.number === selectedPinNumber) || mcu.pins[0];

  function formatHex(val: number, width: 8 | 32): string {
    const unsigned = val >>> 0;
    const digits = width === 8 ? 2 : 8;
    return '0x' + unsigned.toString(16).toUpperCase().padStart(digits, '0');
  }

  const vccLabel = mcu.id === 'atmega328p' ? '5.0V' : '3.3V';
  const isClockBlocked = mcu.requiresClockGating && !clockEnabled;

  let pMosConducting = false;
  let nMosConducting = false;
  let pinElectricalState: 'HIGH' | 'LOW' | 'HI-Z' = 'HI-Z';
  let pinVoltageDisplay = 'Flotante (Hi-Z ⚠️)';
  let schmittTriggerRead: 0 | 1 = 0;

  if (!isClockBlocked) {
    if (pinDirection === 'output') {
      if (outputMode === 'push-pull') {
        pMosConducting = outputBit === 1;
        nMosConducting = outputBit === 0;
        pinElectricalState = outputBit === 1 ? 'HIGH' : 'LOW';
        pinVoltageDisplay =
          outputBit === 1 ? `${vccLabel} (Push-Pull P-MOS Activo)` : '0.0V (GND vía N-MOS Activo)';
        schmittTriggerRead = outputBit;
      } else {
        pMosConducting = false;
        nMosConducting = outputBit === 0;
        if (outputBit === 0) {
          pinElectricalState = 'LOW';
          pinVoltageDisplay = '0.0V (Open-Drain N-MOS tira a GND)';
          schmittTriggerRead = 0;
        } else if (pullResistor === 'pull-up') {
          pinElectricalState = 'HIGH';
          pinVoltageDisplay = `${vccLabel} (Subido por Resistencia Pull-Up)`;
          schmittTriggerRead = 1;
        } else {
          pinElectricalState = 'HI-Z';
          pinVoltageDisplay = 'Alta Impedancia (¡Falta Pull-Up para subir a VCC!)';
          schmittTriggerRead = 0;
        }
      }
    } else {
      pMosConducting = false;
      nMosConducting = false;
      if (externalButtonPressed) {
        pinElectricalState = 'LOW';
        pinVoltageDisplay = '0.0V (Pulsador externo conecta el pin a GND)';
        schmittTriggerRead = 0;
      } else if (pullResistor === 'pull-up') {
        pinElectricalState = 'HIGH';
        pinVoltageDisplay = `${vccLabel} (Mantenido estable por Pull-Up interna)`;
        schmittTriggerRead = 1;
      } else if (pullResistor === 'pull-down') {
        pinElectricalState = 'LOW';
        pinVoltageDisplay = '0.0V (Mantenido estable por Pull-Down interna)';
        schmittTriggerRead = 0;
      } else {
        pinElectricalState = 'HI-Z';
        pinVoltageDisplay = 'Ruido Flotante ⚠️ (Antena sin Pull-Up ni Pull-Down)';
        schmittTriggerRead = 0;
      }
    }
  } else {
    pinVoltageDisplay = 'Reloj RCC Apagado — Periférico Congelado en Hi-Z';
  }

  const getLiveXRayCCode = (): string => {
    if (mcu.id === 'atmega328p') {
      const ddrLine =
        pinDirection === 'output'
          ? 'DDRB |= (1U << 5);   // Bit 5 = 1 (Salida Push-Pull)'
          : 'DDRB &= ~(1U << 5);  // Bit 5 = 0 (Entrada de Alta Impedancia)';
      const portLine =
        pinDirection === 'output'
          ? outputBit === 1
            ? 'PORTB |= (1U << 5);  // Cierra P-MOS -> Pin entrega 5.0V'
            : 'PORTB &= ~(1U << 5); // Cierra N-MOS -> Pin drena a 0.0V'
          : pullResistor === 'pull-up'
          ? 'PORTB |= (1U << 5);  // Con DDRB5=0, activa resistencia Pull-Up a 5V'
          : 'PORTB &= ~(1U << 5); // Entrada sin Pull-Up (Flotante)';
      return `// Código en vivo para ATmega328P:\n${ddrLine}\n${portLine}\nuint8_t lectura = (PINB >> 5) & 1U; // Lee Schmitt Trigger -> ${schmittTriggerRead}`;
    }

    if (mcu.id === 'stm32f401') {
      const rccLine = clockEnabled
        ? 'RCC->AHB1ENR |= (1UL << 0); // Reloj AHB1 activo para GPIOA'
        : '// ⚠️ ERROR: Olvidaste RCC->AHB1ENR |= (1UL << 0); ¡GPIOA ignora todo!';
      const moderLine =
        pinDirection === 'output'
          ? 'GPIOA->MODER = (GPIOA->MODER & ~(3UL << 10)) | (1UL << 10); // 01: Salida'
          : 'GPIOA->MODER &= ~(3UL << 10); // 00: Entrada Digital';
      const otyperLine =
        outputMode === 'open-drain'
          ? 'GPIOA->OTYPER |= (1UL << 5);  // 1: Open-Drain (Desconecta P-MOS)'
          : 'GPIOA->OTYPER &= ~(1UL << 5); // 0: Push-Pull (P-MOS + N-MOS)';
      const pupdVal = pullResistor === 'pull-up' ? 1 : pullResistor === 'pull-down' ? 2 : 0;
      const pupdrLine = `GPIOA->PUPDR = (GPIOA->PUPDR & ~(3UL << 10)) | (${pupdVal}UL << 10); // Pull: ${pullResistor}`;
      const outLine =
        pinDirection === 'output'
          ? outputBit === 1
            ? 'GPIOA->BSRR = (1UL << 5);        // Atómico: BS5 -> 3.3V'
            : 'GPIOA->BSRR = (1UL << (5 + 16)); // Atómico: BR5 -> 0.0V'
          : `uint32_t pin_state = (GPIOA->IDR >> 5) & 1UL; // IDR5 = ${schmittTriggerRead}`;
      return `${rccLine}\n${moderLine}\n${otyperLine}\n${pupdrLine}\n${outLine}`;
    }

    if (mcu.id === 'esp32c3') {
      return `// Código en vivo para ESP32-C3 (RISC-V):\n${
        outputMode === 'open-drain'
          ? 'GPIO.pin[5].pad_driver = 1; // 1 = Open-Drain'
          : 'GPIO.pin[5].pad_driver = 0; // 0 = Push-Pull'
      }\n${
        pullResistor === 'pull-up'
          ? 'IO_MUX.gpio[5].fun_wpu = 1; // Pull-Up activa'
          : 'IO_MUX.gpio[5].fun_wpu = 0;'
      }\n${
        pinDirection === 'output'
          ? `GPIO.enable_w1ts.val = (1UL << 5);\n${
              outputBit === 1
                ? 'GPIO.out_w1ts.val = (1UL << 5); // Write 1 to Set -> 3.3V'
                : 'GPIO.out_w1tc.val = (1UL << 5); // Write 1 to Clear -> 0V'
            }`
          : `GPIO.enable_w1tc.val = (1UL << 5); // Modo Entrada\nuint32_t in_val = (GPIO.in.val >> 5) & 1UL; // -> ${schmittTriggerRead}`
      }`;
    }

    if (mcu.id === 'nrf52840') {
      const dirVal = pinDirection === 'output' ? 1 : 0;
      const pullVal = pullResistor === 'pull-up' ? 3 : pullResistor === 'pull-down' ? 1 : 0;
      const driveVal = outputMode === 'open-drain' ? 6 : 0;
      return `// Código en vivo para nRF52840 (Registro unificado PIN_CNF[5]):\nNRF_P0->PIN_CNF[5] = (${dirVal}UL << 0)  /* DIR: ${pinDirection} */\n                   | (0UL << 1)  /* INPUT: Schmitt Trigger Conectado */\n                   | (${pullVal}UL << 2)  /* PULL: ${pullResistor} */\n                   | (${driveVal}UL << 8); /* DRIVE: ${
        outputMode === 'open-drain' ? 'S0D1 Open-Drain' : 'S0S1 Push-Pull'
      } */\n${
        pinDirection === 'output'
          ? outputBit === 1
            ? 'NRF_P0->OUTSET = (1UL << 5); // P0.05 = 3.3V'
            : 'NRF_P0->OUTCLR = (1UL << 5); // P0.05 = 0.0V'
          : `uint32_t estado = (NRF_P0->IN >> 5) & 1UL; // -> ${schmittTriggerRead}`
      }`;
    }

    return `// Código en vivo para RP2040 (Bloque SIO de 1 Ciclo):\niobank0_hw->io[5].ctrl = GPIO_FUNC_SIO; // Función 5 = SIO\npadsbank0_hw->io[5] = ${
      pullResistor === 'pull-up'
        ? '(1UL << 3) /* PUE */'
        : pullResistor === 'pull-down'
        ? '(1UL << 2) /* PDE */'
        : '0x52UL'
    };\n${
      pinDirection === 'output'
        ? `sio_hw->gpio_oe_set = (1UL << 5);\n${
            outputBit === 1
              ? 'sio_hw->gpio_set = (1UL << 5); // 3.3V en 1 ciclo (7.5 ns)'
              : 'sio_hw->gpio_clr = (1UL << 5); // 0.0V en 1 ciclo'
          }`
        : `sio_hw->gpio_oe_clr = (1UL << 5);\nuint32_t in_bit = (sio_hw->gpio_in >> 5) & 1UL; // -> ${schmittTriggerRead}`
    }`;
  };

  const handleSelectRegister = (idx: number) => {
    setSelectedRegIndex(idx);
    const reg = mcu.registers[idx];
    if (reg) {
      setRegValue(reg.resetValue);
      setLastBitwiseOp(`Cargado ${reg.name} en dirección ${reg.address}`);
    }
  };

  const toggleBitInReg = (bitIndex: number) => {
    const mask = (1 << bitIndex) >>> 0;
    const nextVal = ((regValue ^ mask) >>> 0) & (currentReg.width === 8 ? 0xff : 0xffffffff);
    setRegValue(nextVal);
    const isNowOne = ((nextVal >>> bitIndex) & 1) === 1;
    setTargetBit(bitIndex);
    setLastBitwiseOp(
      isNowOne
        ? `Bit ${bitIndex} puesto a 1 -> Equivalente en C: REG |= (1U << ${bitIndex});`
        : `Bit ${bitIndex} limpiado a 0 -> Equivalente en C: REG &= ~(1U << ${bitIndex});`
    );
  };

  const applyBitwiseOperation = (op: 'set' | 'clear' | 'toggle' | 'field01' | 'reset') => {
    const maxMask = currentReg.width === 8 ? 0xff : 0xffffffff;
    if (op === 'set') {
      const next = ((regValue | (1 << targetBit)) >>> 0) & maxMask;
      setRegValue(next);
      setLastBitwiseOp(
        `Ejecutado: REG |= (1UL << ${targetBit})  [Máscara OR: ${formatHex(1 << targetBit, currentReg.width)}]`
      );
    } else if (op === 'clear') {
      const next = ((regValue & ~(1 << targetBit)) >>> 0) & maxMask;
      setRegValue(next);
      setLastBitwiseOp(
        `Ejecutado: REG &= ~(1UL << ${targetBit}) [Máscara AND NOT: ${formatHex(
          ~(1 << targetBit) & maxMask,
          currentReg.width
        )}]`
      );
    } else if (op === 'toggle') {
      const next = ((regValue ^ (1 << targetBit)) >>> 0) & maxMask;
      setRegValue(next);
      setLastBitwiseOp(
        `Ejecutado: REG ^= (1UL << ${targetBit})  [Máscara XOR: ${formatHex(1 << targetBit, currentReg.width)}]`
      );
    } else if (op === 'field01') {
      const alignedBit = Math.min(targetBit, currentReg.width - 2);
      const cleared = (regValue & ~(3 << alignedBit)) >>> 0;
      const next = ((cleared | (1 << alignedBit)) >>> 0) & maxMask;
      setRegValue(next);
      setLastBitwiseOp(
        `Campo de 2 bits [${alignedBit + 1}:${alignedBit}] = 01 -> REG = (REG & ~(3UL << ${alignedBit})) | (1UL << ${alignedBit})`
      );
    } else {
      setRegValue(currentReg.resetValue);
      setLastBitwiseOp(`Reset de hardware aplicado -> Valor = ${formatHex(currentReg.resetValue, currentReg.width)}`);
    }
  };

  const runLiveCSandbox = (codeToRun = customCCode, initVal = sandboxInitialReg) => {
    const res = evaluateEmbeddedCCode(codeToRun, initVal, mcu.bitWidth);
    setCEvalResult(res);
  };

  const triggerDmaBurst = () => {
    const nextSamples = dmaSamples.map(() => Math.floor(800 + Math.random() * 3100));
    setDmaSamples(nextSamples);
    setDmaTransferCount((c) => c + 8);
  };

  const getBitsLSBFirst = (byte: number): number[] => {
    return Array.from({ length: 8 }, (_, i) => (byte >> i) & 1);
  };
  const getBitsMSBFirst = (byte: number, length = 8): number[] => {
    return Array.from({ length }, (_, i) => (byte >> (length - 1 - i)) & 1);
  };

  // Compute SAR ADC 12-bit binary search steps for Lab 7
  const adcRaw12Bit = Math.min(4095, Math.max(0, Math.round((analogVoltageMv * 4095) / 3300)));
  const sarSteps = Array.from({ length: 12 }, (_, idx) => {
    const bitPos = 11 - idx;
    const bitVal = (adcRaw12Bit >> bitPos) & 1;
    return { bitPos, bitVal };
  });

  // Compute Clock Tree frequencies
  const sysclkMhz = Math.round((crystalMhz * pllMult) / pllDiv);
  const apb1Mhz = Math.round(sysclkMhz / apb1Div);

  // Watchdog step simulation
  const advanceWatchdogTime = () => {
    if (wdgCounter <= 20) {
      setWdgCounter(100);
      setWdgResetTriggered(true);
    } else {
      setWdgCounter((prev) => Math.max(0, prev - 25));
      setWdgResetTriggered(false);
    }
  };

  const feedTheWatchdog = () => {
    if (!wdgCpuHung) {
      setWdgCounter(100);
      setWdgResetTriggered(false);
    }
  };

  const labTabs: { id: ExtendedLabViewType; label: string; shortDesc: string; icon: React.ReactNode }[] = [
    {
      id: 'c-memory-pointers',
      label: '0. Base C: Punteros & Structs',
      shortDesc: 'Variables, & / * y operador flecha ->',
      icon: <BookOpen className="w-4 h-4 text-amber-300" />
    },
    {
      id: 'gpio-xray',
      label: '1. Pinout & Rayos X',
      shortDesc: 'MOSFETs P/N, Open-Drain y RCC',
      icon: <Zap className="w-4 h-4 text-amber-400" />
    },
    {
      id: 'register-gym',
      label: '2. Datasheet & Bits',
      shortDesc: 'Registros 8/32-bit interactivos',
      icon: <Binary className="w-4 h-4 text-cyan-400" />
    },
    {
      id: 'c-live-editor',
      label: '3. Editor C en Vivo',
      shortDesc: 'Escribe expresiones C a mano',
      icon: <Code className="w-4 h-4 text-sky-400" />
    },
    {
      id: 'memory-bus',
      label: '4. Memoria, DMA & ISR',
      shortDesc: 'Flash, SRAM, MMIO y Pila',
      icon: <HardDrive className="w-4 h-4 text-emerald-400" />
    },
    {
      id: 'compiler-volatile',
      label: '5. Compilador & volatile',
      shortDesc: '-O0 vs -O2 y ODR vs BSRR',
      icon: <Cpu className="w-4 h-4 text-purple-400" />
    },
    {
      id: 'logic-analyzer',
      label: '6. Analizador & PWM',
      shortDesc: 'Timers, UART, I2C y SPI',
      icon: <Activity className="w-4 h-4 text-rose-400" />
    },
    {
      id: 'peripherals-adc-wdg',
      label: '7. ADC SAR, PLL & WDG',
      shortDesc: 'Diagramas de nuevos periféricos',
      icon: <Gauge className="w-4 h-4 text-lime-400" />
    },
    {
      id: 'multi-file-toolchain',
      label: '8. Librerías, Linker & Boot',
      shortDesc: 'Archivos .h/.c, .a, union y OTA',
      icon: <Code className="w-4 h-4 text-cyan-300" />
    },
    {
      id: 'space-defense-ecss',
      label: '9. ECSS/NASA & Rad-Hard',
      shortDesc: 'TMR, SEU, MC/DC y Márgenes',
      icon: <ShieldAlert className="w-4 h-4 text-rose-300" />
    }
  ];

  // --- STATE FOR LAB 8: MULTI-FILE PROJECTS, LIBRARIES (.h/.c/.a), UNION & BOOTLOADER ---
  const [selectedProjectFile, setSelectedProjectFile] = useState<'header' | 'source' | 'main' | 'makefile'>('header');
  const [putVarInHeaderBug, setPutVarInHeaderBug] = useState<boolean>(false);
  const [forgetLinkLibBug, setForgetLinkLibBug] = useState<boolean>(false);
  const [useConstLookupTable, setUseConstLookupTable] = useState<boolean>(true);
  const [unionTempDecimas, setUnionTempDecimas] = useState<number>(254); // 25.4 C
  const [unionRpmVal, setUnionRpmVal] = useState<number>(1800);
  const [bootloaderUpdatedVtor, setBootloaderUpdatedVtor] = useState<boolean>(true);
  const [bootloaderPhase, setBootloaderPhase] = useState<'boot' | 'running-app' | 'irq-fired'>('boot');

  // --- STATE FOR LAB 9: SPACE & DEFENSE (ECSS-E-ST-40C / Q-ST-80C / NASA JPL / RAD-HARD TMR / MC/DC) ---
  const [tmrCopyA, setTmrCopyA] = useState<number>(0x5a);
  const [tmrCopyB, setTmrCopyB] = useState<number>(0x5a);
  const [tmrCopyC, setTmrCopyC] = useState<number>(0x5a);
  const [seuScrubCount, setSeuScrubCount] = useState<number>(0);
  const [ecssTotalRamKb, setEcssTotalRamKb] = useState<number>(256);
  const [ecssUsedRamKb, setEcssUsedRamKb] = useState<number>(96);
  const [ecssWcetUs, setEcssWcetUs] = useState<number>(2500);
  const [ecssInterfUs, setEcssInterfUs] = useState<number>(1800);
  const [ecssBlockUs, setEcssBlockUs] = useState<number>(700);
  const [ecssDeadlineUs, setEcssDeadlineUs] = useState<number>(10000);
  const [mcdcSelectedTests, setMcdcSelectedTests] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true
  });
  const [normativeFilter, setNormativeFilter] = useState<'ALL' | 'SHALL_NOT' | 'SHALL' | 'SHOULD_NOT'>('ALL');

  const leftPins = mcu.pins.filter((p) => p.side === 'left');
  const rightPins = mcu.pins.filter((p) => p.side === 'right');

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Lab Navigation Header */}
      <div className="bg-slate-950/90 border-b border-slate-800 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-cyan-500/20 text-cyan-400 text-xs font-bold">
              LAB
            </span>
            <h3 className="text-sm font-bold text-slate-100 tracking-wide uppercase">
              Estación de Instrumentación, Editor C en Vivo y Diagramas de Silicio —{' '}
              <span className="text-cyan-400">{mcu.name}</span>
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Arquitectura activa: {mcu.bitWidth}-bit • {mcu.isa} • {mcu.clockSpeed}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-10 gap-2">
          {labTabs.map((tab) => {
            const active = activeLab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectLab(tab.id)}
                className={`text-left p-2.5 rounded-xl border transition-all ${
                  active
                    ? 'bg-slate-800/95 border-cyan-500/60 shadow-lg shadow-cyan-950/40'
                    : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold text-xs text-slate-100">
                  {tab.icon}
                  <span className="truncate">{tab.label}</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 truncate">{tab.shortDesc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* =====================================================================
          LAB 0: BASE DEL LENGUAJE C (VARIABLES, PUNTEROS &/* Y STRUCT ->)
         ===================================================================== */}
      {activeLab === 'c-memory-pointers' && (
        <div className="p-5 space-y-5">
          <div className="bg-amber-950/25 border border-amber-500/30 rounded-xl p-4 text-xs text-slate-200 leading-relaxed">
            <div className="font-bold text-amber-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" /> Explicación del Panel: Cómo funcionan las Variables, los Punteros (<code>&amp;</code> y <code>*</code>) y las Estructuras (<code>struct</code> y <code>-&gt;</code>)
            </div>
            Toda variable en C vive en una <strong>dirección física de memoria</strong>. Un <strong>puntero</strong> (<code>uint32_t *ptr</code>) es simplemente otra casilla de memoria que guarda dentro la dirección de tu variable. Cuando usas <code>&amp;variable</code> obtienes su dirección; cuando usas <code>*ptr = valor</code> sigues la flecha hasta esa dirección y modificas su contenido. Y cuando agrupas varios registros en un <code>struct</code>, el operador flecha (<code>pGPIO-&gt;ODR</code>) suma automáticamente el desplazamiento (offset) de ese miembro a la dirección base.
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: Interactive RAM Boxes & Pointer Controls */}
            <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase text-cyan-400">
                  1. Simulador Visual de Punteros en Memoria (<code>&amp;</code> Dirección vs <code>*</code> Contenido)
                </h4>
                <span className="text-[11px] font-mono text-amber-300">{lastPointerAction}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
                {/* Variable A Box */}
                <div
                  className={`p-3 rounded-xl border transition-all ${
                    ptrTarget === 'varA'
                      ? 'bg-cyan-500/15 border-cyan-400 ring-2 ring-cyan-400/30'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Dirección RAM:</span>
                    <span className="text-amber-300 font-bold">0x20000000</span>
                  </div>
                  <div className="text-xs font-bold text-white mt-1">uint32_t velocidad</div>
                  <div className="my-2 text-lg font-extrabold text-emerald-400">{cVarA}</div>
                  <div className="text-[10px] text-slate-400">Hex: {formatHex(cVarA, 32)}</div>
                </div>

                {/* Variable B Box */}
                <div
                  className={`p-3 rounded-xl border transition-all ${
                    ptrTarget === 'varB'
                      ? 'bg-cyan-500/15 border-cyan-400 ring-2 ring-cyan-400/30'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Dirección RAM:</span>
                    <span className="text-amber-300 font-bold">0x20000004</span>
                  </div>
                  <div className="text-xs font-bold text-white mt-1">uint32_t limite_rpm</div>
                  <div className="my-2 text-lg font-extrabold text-emerald-400">{cVarB}</div>
                  <div className="text-[10px] text-slate-400">Hex: {formatHex(cVarB, 32)}</div>
                </div>

                {/* Pointer Box */}
                <div className="p-3 rounded-xl border bg-purple-950/30 border-purple-400/60">
                  <div className="flex justify-between text-[10px] text-purple-300">
                    <span>Puntero en:</span>
                    <span className="font-bold">0x20000008</span>
                  </div>
                  <div className="text-xs font-bold text-white mt-1">uint32_t *ptr</div>
                  <div className="my-2 text-sm font-extrabold text-amber-300">
                    {ptrTarget === 'varA'
                      ? '0x20000000'
                      : ptrTarget === 'varB'
                      ? '0x20000004'
                      : '0x40020014'}
                  </div>
                  <div className="text-[10px] text-purple-200">
                    *ptr lee:{' '}
                    <strong>
                      {ptrTarget === 'varA' ? cVarA : ptrTarget === 'varB' ? cVarB : formatHex(structOdr, 32)}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Interactive C Statement Buttons */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <span className="text-xs text-slate-300 font-semibold block">
                  Haz clic en una sentencia C para ejecutarla y ver qué cambia en las casillas de arriba:
                </span>
                <div className="flex flex-wrap gap-2 font-mono text-xs">
                  <button
                    onClick={() => {
                      setPtrTarget('varA');
                      setLastPointerAction('ptr = &velocidad; -> Ahora ptr guarda la dirección 0x20000000');
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-cyan-300"
                  >
                    1. ptr = &amp;velocidad;
                  </button>
                  <button
                    onClick={() => {
                      setPtrTarget('varB');
                      setLastPointerAction('ptr = &limite_rpm; -> Ahora ptr guarda la dirección 0x20000004');
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-cyan-300"
                  >
                    2. ptr = &amp;limite_rpm;
                  </button>
                  <button
                    onClick={() => {
                      setPtrTarget('structODR');
                      setLastPointerAction(
                        'ptr = (uint32_t *)0x40020014; -> ¡El puntero ahora apunta a un Registro de Hardware!'
                      );
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-amber-500/40 hover:border-amber-400 text-amber-300"
                  >
                    3. ptr = (uint32_t *)0x40020014;
                  </button>
                  <button
                    onClick={() => {
                      if (ptrTarget === 'varA') setCVarA((v) => v + 10);
                      else if (ptrTarget === 'varB') setCVarB((v) => v + 10);
                      else setStructOdr((v) => (v ^ (1 << 5)) >>> 0);
                      setLastPointerAction(
                        ptrTarget === 'structODR'
                          ? '*ptr ^= (1 << 5); -> ¡Cambiaste el bit 5 del registro físico a través del puntero!'
                          : '*ptr = *ptr + 10; -> ¡Entraste a la dirección apuntada y sumaste +10!'
                      );
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-bold"
                  >
                    {ptrTarget === 'structODR' ? '4. *ptr ^= (1 << 5);' : '4. *ptr = *ptr + 10;'}
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Struct Memory Layout & Arrow Operator (->) */}
            <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase text-emerald-400">
                2. Cómo se superpone un <code>struct</code> en Memoria y el Operador Flecha (<code>-&gt;</code>)
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Cuando defines <code>GPIO_TypeDef *GPIOA = (GPIO_TypeDef *)0x40020000;</code>, C coloca cada miembro <code>uint32_t</code> de 4 en 4 bytes a partir de la dirección base:
              </p>

              <div className="space-y-2 font-mono text-xs">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-amber-300">0x40020000 (+0x00)</span>
                    <span className="block text-white font-bold">GPIOA-&gt;MODER</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-300">{formatHex(structModer, 32)}</span>
                    <button
                      onClick={() => setStructModer((m) => (m ^ (1 << 10)) >>> 0)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-emerald-300"
                    >
                      ^= (1&lt;&lt;10)
                    </button>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800/60 text-slate-500 flex items-center justify-between">
                  <span>0x40020004..0x40020010 (+0x04..+0x10)</span>
                  <span>OTYPER, OSPEEDR, PUPDR, IDR</span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-cyan-500/40 flex items-center justify-between">
                  <div>
                    <span className="text-amber-300">0x40020014 (+0x14)</span>
                    <span className="block text-white font-bold">GPIOA-&gt;ODR</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-300 font-bold">{formatHex(structOdr, 32)}</span>
                    <button
                      onClick={() => setStructOdr((o) => (o ^ (1 << 5)) >>> 0)}
                      className="px-2 py-1 rounded bg-cyan-500/20 border border-cyan-400 text-[11px] text-cyan-200"
                    >
                      ^= (1&lt;&lt;5)
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
                <code>GPIOA-&gt;ODR</code> es 100% equivalente a escribir <code>(*GPIOA).ODR</code> y accede a la dirección <code>0x40020000 + 0x14 = 0x40020014</code>.
              </div>
            </div>
          </div>

          {/* Row 2 of Lab 0: Little-Endian Inspector + Struct Padding Visualizer */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Little-Endian Byte Order Visualizer */}
            <div className="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-xs font-bold uppercase text-amber-300">
                  3. Inspector Little-Endian: Cómo se guardan 32 bits en 4 casillas de 1 Byte
                </h4>
                <div className="flex items-center gap-1.5 font-mono text-xs">
                  {[0x12345678, 0xdeadbeef, 0x000003e8].map((val) => (
                    <button
                      key={val}
                      onClick={() => setEndianHexValue(val)}
                      className={`px-2 py-0.5 rounded border ${
                        endianHexValue === val
                          ? 'bg-amber-400 text-slate-950 font-bold border-amber-300'
                          : 'bg-slate-900 text-slate-300 border-slate-800'
                      }`}
                    >
                      {formatHex(val, 32)}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                En ARM Cortex-M, RISC-V y AVR (<strong>Little-Endian</strong>), el byte menos significativo (<strong>LSB</strong>) se guarda siempre en la dirección más baja de RAM:
              </p>
              <div className="grid grid-cols-4 gap-2 font-mono text-center">
                {[0, 1, 2, 3].map((offset) => {
                  const byteVal = ((endianHexValue >>> (offset * 8)) & 0xff)
                    .toString(16)
                    .toUpperCase()
                    .padStart(2, '0');
                  return (
                    <div
                      key={offset}
                      className="p-2.5 rounded-xl bg-slate-900 border border-amber-500/40"
                    >
                      <div className="text-[10px] text-slate-400">0x2000000{offset}</div>
                      <div className="text-base font-extrabold text-amber-300 my-1">0x{byteVal}</div>
                      <div className="text-[10px] text-cyan-300">
                        {offset === 0 ? 'LSB (Byte 0)' : offset === 3 ? 'MSB (Byte 3)' : `Byte ${offset}`}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                Si apuntas <code>uint8_t *p = (uint8_t *)&amp;valor;</code>, entonces <code>p[0]</code> lee{' '}
                <strong className="text-emerald-300">
                  0x{((endianHexValue & 0xff) >>> 0).toString(16).toUpperCase().padStart(2, '0')}
                </strong>{' '}
                y <code>p[3]</code> lee{' '}
                <strong className="text-emerald-300">
                  0x{(((endianHexValue >>> 24) & 0xff) >>> 0).toString(16).toUpperCase().padStart(2, '0')}
                </strong>.
              </div>
            </div>

            {/* Struct Alignment & Padding Visualizer */}
            <div className="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-xs font-bold uppercase text-purple-300">
                  4. Rayos X de Padding en <code>struct</code> y Tamaño Real (<code>sizeof</code>)
                </h4>
                <button
                  onClick={() => setStructLayoutOptimized(!structLayoutOptimized)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${
                    structLayoutOptimized
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                      : 'bg-rose-500/20 border-rose-400 text-rose-300'
                  }`}
                >
                  {structLayoutOptimized
                    ? '✅ Ordenado de Mayor a Menor (8 Bytes)'
                    : '⚠️ Desordenado con Huecos (12 Bytes)'}
                </button>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Un <code>uint32_t</code> exige vivir en una dirección múltiplo de 4. Mira cómo cambia la RAM ocupada por los mismos 3 campos (<code>id</code>, <code>timestamp</code>, <code>crc</code>):
              </p>

              {!structLayoutOptimized ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-1 font-mono text-[10px] text-center">
                    <div className="col-span-1 p-2 rounded bg-cyan-500/30 border border-cyan-400 text-white font-bold">
                      id (1B)
                    </div>
                    <div className="col-span-3 p-2 rounded bg-rose-950/60 border border-rose-500/50 text-rose-300">
                      3B Padding (Basura)
                    </div>
                    <div className="col-span-4 p-2 rounded bg-emerald-500/30 border border-emerald-400 text-white font-bold">
                      timestamp (4B)
                    </div>
                    <div className="col-span-1 p-2 rounded bg-amber-500/30 border border-amber-400 text-white font-bold">
                      crc (1B)
                    </div>
                    <div className="col-span-3 p-2 rounded bg-rose-950/60 border border-rose-500/50 text-rose-300">
                      3B Padding
                    </div>
                  </div>
                  <div className="text-[11px] font-mono text-rose-300">
                    <code>struct &#123; uint8_t id; uint32_t timestamp; uint8_t crc; &#125;</code> →{' '}
                    <strong>sizeof = 12 bytes</strong> (¡6 bytes desperdiciados en huecos!)
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-8 gap-1 font-mono text-[10px] text-center">
                    <div className="col-span-4 p-2 rounded bg-emerald-500/30 border border-emerald-400 text-white font-bold">
                      timestamp (4B) [Offset 0..3]
                    </div>
                    <div className="col-span-1 p-2 rounded bg-cyan-500/30 border border-cyan-400 text-white font-bold">
                      id (1B)
                    </div>
                    <div className="col-span-1 p-2 rounded bg-amber-500/30 border border-amber-400 text-white font-bold">
                      crc (1B)
                    </div>
                    <div className="col-span-2 p-2 rounded bg-slate-900 border border-slate-700 text-slate-400">
                      2B Align
                    </div>
                  </div>
                  <div className="text-[11px] font-mono text-emerald-300">
                    <code>struct &#123; uint32_t timestamp; uint8_t id; uint8_t crc; &#125;</code> →{' '}
                    <strong>sizeof = 8 bytes</strong> (Ahorras un 33% de RAM solo ordenando de mayor a menor).
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          LAB 1: PINOUT FÍSICO & RAYOS X DEL TRANSISTOR DEL PIN
         ===================================================================== */}
      {activeLab === 'gpio-xray' && (
        <div className="p-5 space-y-5">
          {/* Detailed Didactic Explanation Banner */}
          <div className="bg-cyan-950/25 border border-cyan-500/30 rounded-xl p-4 text-xs text-slate-200 leading-relaxed">
            <div className="font-bold text-cyan-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" /> Explicación Profunda del Panel: ¿Cómo funciona un pin GPIO por dentro?
            </div>
            Un pin físico nunca está conectado directamente a la CPU; pasa por una <strong>celda de Entrada/Salida (I/O Pad)</strong> formada por:
            <ul className="list-disc list-inside mt-1.5 space-y-1 text-slate-300">
              <li>
                <strong>Dos transistores MOSFET de salida:</strong> El superior (<strong>P-MOS</strong>) conecta el pin al voltaje positivo (+VDD) cuando conmuta; el inferior (<strong>N-MOS</strong>) conecta el pin a Tierra (0V GND). En modo <em>Open-Drain</em> el P-MOS se desactiva para que varios chips puedan compartir un cable sin cortocircuito.
              </li>
              <li>
                <strong>Dos resistencias internas conmutables (Pull-Up y Pull-Down, ~40 kΩ):</strong> Evitan que un pin configurado como entrada quede "flotando" como una antena ante el ruido electromagnético.
              </li>
              <li>
                <strong>Disparador Schmitt (Schmitt Trigger) de entrada:</strong> Limpia el voltaje analógico ruidoso del exterior convirtiéndolo en un <code>0</code> o <code>1</code> digital limpio antes de guardarlo en el registro de entrada (<code>IDR</code> / <code>PINx</code>).
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Left Column: Interactive Chip Package & Pin Selector */}
            <div className="xl:col-span-5 bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                    Encapsulado Interactivo ({mcu.packageType})
                  </span>
                  <span className="text-[11px] text-slate-400">Haz clic en cualquier pin</span>
                </div>

                {/* Visual IC Chip Package */}
                <div className="my-4 flex items-center justify-center">
                  <div className="flex items-center gap-1 w-full max-w-md">
                    {/* Left Pins */}
                    <div className="flex flex-col gap-1.5 flex-1">
                      {leftPins.map((pin) => {
                        const isSelected = pin.number === selectedPin.number;
                        const badgeColor =
                          pin.type === 'power'
                            ? 'border-red-500/50 text-red-300'
                            : pin.type === 'gnd'
                            ? 'border-slate-600 text-slate-400'
                            : pin.type === 'analog'
                            ? 'border-emerald-500/50 text-emerald-300'
                            : 'border-cyan-500/40 text-cyan-200';
                        return (
                          <button
                            key={pin.number}
                            onClick={() => setSelectedPinNumber(pin.number)}
                            className={`group flex items-center justify-between px-2 py-1.5 rounded-l-lg border text-[11px] font-mono transition-all ${
                              isSelected
                                ? 'bg-cyan-500/20 border-cyan-400 text-white font-bold shadow-sm'
                                : `bg-slate-900/90 hover:bg-slate-800 ${badgeColor}`
                            }`}
                          >
                            <span className="truncate">{pin.name}</span>
                            <span className="ml-1.5 px-1 rounded bg-slate-950 text-[10px] text-slate-400">
                              #{pin.number}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Silicon Die Body */}
                    <div className="w-28 sm:w-32 self-stretch bg-gradient-to-b from-slate-800 via-slate-900 to-slate-850 border-2 border-slate-700 rounded-lg flex flex-col items-center justify-between p-2.5 shadow-inner relative">
                      <div className="w-6 h-3 rounded-b-full bg-slate-950 border-b border-x border-slate-700 -mt-2.5" />
                      <div className="text-center my-4">
                        <Cpu className="w-7 h-7 text-cyan-400 mx-auto mb-1.5 opacity-90" />
                        <div className="text-xs font-extrabold text-slate-100 tracking-tight leading-tight">
                          {mcu.name}
                        </div>
                        <div className="text-[10px] text-cyan-400 font-mono mt-1">{mcu.bitWidth}-BIT SILICON</div>
                        <div className="text-[9px] text-slate-400 mt-1">{mcu.clockSpeed}</div>
                      </div>
                      <div className="text-[9px] text-slate-500 font-mono uppercase">
                        {mcu.manufacturer.split(' ')[0]}
                      </div>
                    </div>

                    {/* Right Pins */}
                    <div className="flex flex-col gap-1.5 flex-1">
                      {rightPins.map((pin) => {
                        const isSelected = pin.number === selectedPin.number;
                        const badgeColor =
                          pin.type === 'power'
                            ? 'border-red-500/50 text-red-300'
                            : pin.type === 'gnd'
                            ? 'border-slate-600 text-slate-400'
                            : pin.type === 'analog'
                            ? 'border-emerald-500/50 text-emerald-300'
                            : 'border-cyan-500/40 text-cyan-200';
                        return (
                          <button
                            key={pin.number}
                            onClick={() => setSelectedPinNumber(pin.number)}
                            className={`group flex items-center justify-between px-2 py-1.5 rounded-r-lg border text-[11px] font-mono transition-all ${
                              isSelected
                                ? 'bg-cyan-500/20 border-cyan-400 text-white font-bold shadow-sm'
                                : `bg-slate-900/90 hover:bg-slate-800 ${badgeColor}`
                            }`}
                          >
                            <span className="mr-1.5 px-1 rounded bg-slate-950 text-[10px] text-slate-400">
                              #{pin.number}
                            </span>
                            <span className="truncate">{pin.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Selected Pin Details Card */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white font-mono">
                    Pin #{selectedPin.number}: {selectedPin.name}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-mono">
                    Tolerancia: {selectedPin.voltageTolerance}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{selectedPin.description}</p>
                {selectedPin.internalRegisterBit && (
                  <div className="mt-2 text-[11px] font-mono text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded px-2 py-1">
                    Enlace de Registro: {selectedPin.internalRegisterBit}
                  </div>
                )}
                <div className="mt-2.5">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                    Funciones Multiplexadas en este Pin (Alternate Functions):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPin.functions.map((fn, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-700 text-slate-200"
                      >
                        {fn}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Transistor X-Ray & Live Circuit Simulator */}
            <div className="xl:col-span-7 flex flex-col gap-4">
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-400" />
                      Rayos X del Interior del Pin (Transistores MOSFET P-MOS / N-MOS)
                    </h4>
                    <p className="text-xs text-slate-400">
                      Cambia los interruptores de registro para ver cómo fluye la corriente hacia el pin físico
                    </p>
                  </div>

                  {mcu.requiresClockGating && (
                    <button
                      onClick={() => setClockEnabled(!clockEnabled)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
                        clockEnabled
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                          : 'bg-rose-500/20 border-rose-500/60 text-rose-300 animate-pulse'
                      }`}
                    >
                      {clockEnabled ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                      {clockEnabled ? 'Reloj RCC: ACTIVO (1)' : 'Reloj RCC: APAGADO (0)'}
                    </button>
                  )}
                </div>

                {/* Controls Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5">
                    <span className="text-[10px] uppercase text-slate-400 font-semibold block mb-1.5">
                      1. Dirección (MODER/DDR)
                    </span>
                    <div className="grid grid-cols-2 gap-1">
                      <button
                        onClick={() => setPinDirection('output')}
                        className={`py-1 rounded text-xs font-mono font-bold ${
                          pinDirection === 'output'
                            ? 'bg-cyan-500 text-slate-950'
                            : 'bg-slate-950 text-slate-400 hover:text-white'
                        }`}
                      >
                        SALIDA
                      </button>
                      <button
                        onClick={() => setPinDirection('input')}
                        className={`py-1 rounded text-xs font-mono font-bold ${
                          pinDirection === 'input'
                            ? 'bg-cyan-500 text-slate-950'
                            : 'bg-slate-950 text-slate-400 hover:text-white'
                        }`}
                      >
                        ENTRADA
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5">
                    <span className="text-[10px] uppercase text-slate-400 font-semibold block mb-1.5">
                      2. Etapa MOSFET (OTYPER)
                    </span>
                    <div className="grid grid-cols-2 gap-1">
                      <button
                        disabled={pinDirection === 'input'}
                        onClick={() => setOutputMode('push-pull')}
                        className={`py-1 rounded text-[11px] font-mono font-bold ${
                          pinDirection === 'input'
                            ? 'opacity-40 bg-slate-950 text-slate-600'
                            : outputMode === 'push-pull'
                            ? 'bg-amber-400 text-slate-950'
                            : 'bg-slate-950 text-slate-400'
                        }`}
                      >
                        Push-Pull
                      </button>
                      <button
                        disabled={pinDirection === 'input'}
                        onClick={() => setOutputMode('open-drain')}
                        className={`py-1 rounded text-[11px] font-mono font-bold ${
                          pinDirection === 'input'
                            ? 'opacity-40 bg-slate-950 text-slate-600'
                            : outputMode === 'open-drain'
                            ? 'bg-amber-400 text-slate-950'
                            : 'bg-slate-950 text-slate-400'
                        }`}
                      >
                        Open-Drain
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5">
                    <span className="text-[10px] uppercase text-slate-400 font-semibold block mb-1.5">
                      3. Resistencia (PUPDR)
                    </span>
                    <div className="grid grid-cols-3 gap-1">
                      {(['none', 'pull-up', 'pull-down'] as const).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setPullResistor(mode)}
                          className={`py-1 rounded text-[10px] font-mono font-bold ${
                            pullResistor === mode
                              ? 'bg-emerald-400 text-slate-950'
                              : 'bg-slate-950 text-slate-400 hover:text-white'
                          }`}
                        >
                          {mode === 'none' ? 'Off' : mode === 'pull-up' ? 'Up' : 'Down'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5">
                    <span className="text-[10px] uppercase text-slate-400 font-semibold block mb-1.5">
                      {pinDirection === 'output' ? '4. Bit Salida (ODR/BSRR)' : '4. Botón Físico Externo'}
                    </span>
                    {pinDirection === 'output' ? (
                      <div className="grid grid-cols-2 gap-1">
                        <button
                          onClick={() => setOutputBit(1)}
                          className={`py-1 rounded text-xs font-mono font-bold ${
                            outputBit === 1 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-950 text-slate-400'
                          }`}
                        >
                          1 (HIGH)
                        </button>
                        <button
                          onClick={() => setOutputBit(0)}
                          className={`py-1 rounded text-xs font-mono font-bold ${
                            outputBit === 0 ? 'bg-rose-500 text-white' : 'bg-slate-950 text-slate-400'
                          }`}
                        >
                          0 (LOW)
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setExternalButtonPressed(!externalButtonPressed)}
                        className={`w-full py-1 rounded text-xs font-mono font-bold transition-all ${
                          externalButtonPressed
                            ? 'bg-rose-500 text-white shadow-inner'
                            : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                        }`}
                      >
                        {externalButtonPressed ? 'PULSADO (Conecta GND)' : 'SUELTO (Abierto)'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Electronic Transistor Diagram */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-900/90 border border-slate-800 rounded-xl p-4">
                  <div className="border border-slate-800 rounded-lg p-3 bg-slate-950/70">
                    <div className="text-[11px] font-bold text-slate-300 uppercase mb-2">
                      Etapa 1: Transistores de Salida
                    </div>
                    <div
                      className={`p-2 rounded border mb-2 text-xs font-mono ${
                        pMosConducting
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200'
                          : 'bg-slate-900 border-slate-800 text-slate-500'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>P-MOS (Hacia +{vccLabel})</span>
                        <span className="font-bold">
                          {outputMode === 'open-drain'
                            ? 'DESCONECTADO'
                            : pMosConducting
                            ? 'CERRADO (ON)'
                            : 'ABIERTO (OFF)'}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`p-2 rounded border text-xs font-mono ${
                        nMosConducting
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-200'
                          : 'bg-slate-900 border-slate-800 text-slate-500'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>N-MOS (Hacia 0V GND)</span>
                        <span className="font-bold">{nMosConducting ? 'CERRADO (ON)' : 'ABIERTO (OFF)'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border border-slate-800 rounded-lg p-3 bg-slate-950/70 flex flex-col justify-between">
                    <div className="text-[11px] font-bold text-slate-300 uppercase">
                      Etapa 2: Patilla Física y Pull
                    </div>
                    <div className="my-2 text-center">
                      <div
                        className={`inline-block px-3 py-1.5 rounded-lg font-mono text-xs font-bold border ${
                          pinElectricalState === 'HIGH'
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-lg shadow-emerald-950'
                            : pinElectricalState === 'LOW'
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                            : 'bg-amber-500/20 border-amber-400 text-amber-300'
                        }`}
                      >
                        {pinVoltageDisplay}
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono text-center">
                      Lectura Schmitt Trigger (IDR/PIN):{' '}
                      <span className="text-white font-bold">{schmittTriggerRead}</span>
                    </div>
                  </div>

                  <div className="border border-slate-800 rounded-lg p-3 bg-slate-950/70 flex flex-col items-center justify-center text-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                        pinElectricalState === 'HIGH'
                          ? 'bg-emerald-400 border-emerald-200 shadow-[0_0_25px_#34d399] text-slate-950'
                          : 'bg-slate-900 border-slate-700 text-slate-600'
                      }`}
                    >
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold mt-2 text-slate-200">
                      {pinElectricalState === 'HIGH'
                        ? 'LED EXTERNO ENCENDIDO'
                        : pinElectricalState === 'LOW'
                        ? 'LED APAGADO (0.0V)'
                        : 'PIN EN ALTA IMPEDANCIA (Hi-Z)'}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      {outputMode === 'open-drain' && outputBit === 1 && pullResistor !== 'pull-up'
                        ? 'Activa la resistencia Pull-Up para subir el voltaje en Open-Drain'
                        : 'Respuesta eléctrica en tiempo real'}
                    </span>
                  </div>
                </div>

                {/* Live Generated C Code */}
                <div className="mt-4 bg-slate-950 border border-slate-800 rounded-xl p-3.5">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                    <span className="font-semibold text-cyan-400">
                      Código C Equivalente en Tiempo Real ({mcu.name}):
                    </span>
                    <span className="font-mono text-[11px]">Sincronizado con los interruptores</span>
                  </div>
                  <pre className="text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
                    {getLiveXRayCCode()}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2 of Lab 1: Switch Bounce Filter Simulator + Pin Ohm's Law Calculator */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Switch Debounce Shift Register Simulator */}
            <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-xs font-bold uppercase text-amber-300">
                  Simulador de Rebote Mecánico (Bounce) y Filtro Digital por Historial en C
                </h4>
                <span className="text-xs font-mono text-cyan-300">
                  historial = 0x{debounceHistoryByte.toString(16).toUpperCase().padStart(2, '0')} (0b
                  {debounceHistoryByte.toString(2).padStart(8, '0')})
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Cada vez que pasa el Timer de 5 ms ejecutamos{' '}
                <code>historial = (historial &lt;&lt; 1) | pin_actual;</code>. Prueba a inyectar muestras de rebote (<code>0</code> y <code>1</code> alternados) frente a mantener pulsado (<code>0</code> estable) hasta ver cómo se valida el flanco limpio en <code>0x80</code> o <code>0x00</code>:
              </p>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-2 font-mono text-xs">
                  <button
                    onClick={() => setDebounceHistoryByte((h) => ((h << 1) | 0) & 0xff)}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-400 text-cyan-200 font-bold"
                  >
                    Muestrear Pin = 0 (Pulsado)
                  </button>
                  <button
                    onClick={() => setDebounceHistoryByte((h) => ((h << 1) | 1) & 0xff)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200"
                  >
                    Muestrear Pin = 1 (Suelto / Rebote)
                  </button>
                  <button
                    onClick={() => setDebounceHistoryByte(0xff)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400"
                  >
                    Reset (0xFF)
                  </button>
                </div>

                <div
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border ${
                    debounceHistoryByte === 0x80
                      ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300'
                      : debounceHistoryByte === 0x00
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                      : debounceHistoryByte === 0xff
                      ? 'bg-slate-900 border-slate-800 text-slate-400'
                      : 'bg-amber-500/20 border-amber-400 text-amber-300'
                  }`}
                >
                  {debounceHistoryByte === 0x80
                    ? '✓ ¡FLANCO LIMPIO DETECTADO (0x80)!'
                    : debounceHistoryByte === 0x00
                    ? '✓ BOTÓN ESTABLE PULSADO (0x00 - 40 ms)'
                    : debounceHistoryByte === 0xff
                    ? 'REPOSO ESTABLE (0xFF)'
                    : '⚠️ FILTRANDO REBOTE TRANSITORIO...'}
                </div>
              </div>
            </div>

            {/* Pin Ohm's Law & Current Limit Calculator */}
            <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase text-emerald-300">
                Calculadora Eléctrica del Pin (Ley de Ohm y Límite de Corriente)
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div>
                  <label className="text-slate-400 block mb-1">Voltaje LED (V_led): {ledForwardVoltage.toFixed(1)}V</label>
                  <input
                    type="range"
                    min={1.6}
                    max={3.0}
                    step={0.1}
                    value={ledForwardVoltage}
                    onChange={(e) => setLedForwardVoltage(Number(e.target.value))}
                    className="w-full accent-emerald-400"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Resistencia (R): {ledResistorOhms} Ω</label>
                  <input
                    type="range"
                    min={47}
                    max={1000}
                    step={10}
                    value={ledResistorOhms}
                    onChange={(e) => setLedResistorOhms(Number(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>
              </div>
              {(() => {
                const vdd = mcu.id === 'atmega328p' ? 5.0 : 3.3;
                const maxSafeMa = mcu.id === 'atmega328p' ? 20 : 12;
                const currentMa = Math.max(0, ((vdd - ledForwardVoltage) / ledResistorOhms) * 1000);
                const overLimit = currentMa > maxSafeMa;
                return (
                  <div
                    className={`p-2.5 rounded-lg border text-xs font-mono ${
                      overLimit
                        ? 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                        : 'bg-slate-900 border-slate-800 text-slate-200'
                    }`}
                  >
                    <div>
                      Fórmula: <code>I = ({vdd.toFixed(1)}V - {ledForwardVoltage.toFixed(1)}V) / {ledResistorOhms}Ω</code> ={' '}
                      <strong className={overLimit ? 'text-rose-400' : 'text-emerald-300'}>
                        {currentMa.toFixed(1)} mA
                      </strong>
                    </div>
                    <div className="text-[11px] mt-1">
                      {overLimit
                        ? `⚠️ ¡PELIGRO! Supera los ${maxSafeMa} mA seguros del pin en ${mcu.name}. Sube la resistencia o usa un MOSFET externo.`
                        : `✅ Corriente segura para el transistor interno del ${mcu.name} (Máx recomendado: ${maxSafeMa} mA).`}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          LAB 2: DATASHEET VIVO & GIMNASIO DE REGISTROS BIT A BIT
         ===================================================================== */}
      {activeLab === 'register-gym' && currentReg && (
        <div className="p-5 space-y-5">
          {/* Detailed Didactic Explanation Banner */}
          <div className="bg-cyan-950/25 border border-cyan-500/30 rounded-xl p-4 text-xs text-slate-200 leading-relaxed">
            <div className="font-bold text-cyan-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" /> Explicación del Panel: ¿Cómo se lee una tabla de registros de un Datasheet?
            </div>
            En cualquier hoja de datos industrial verás tres datos clave en la cabecera de cada registro:
            <strong> Address Offset</strong> (cuántos bytes hay que sumar a la dirección base del periférico),{' '}
            <strong>Reset Value</strong> (qué bits vienen encendidos o apagados de fábrica al alimentar el chip) y el tipo de permiso (<strong>R/W</strong> lectura y escritura, <strong>RO</strong> solo lectura, <strong>W1S/W1C</strong> escribir un 1 para encender o limpiar atómicamente).
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/80 border border-slate-800 rounded-xl p-3.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase text-slate-400 mr-1">
                Registros del Datasheet ({mcu.name}):
              </span>
              {mcu.registers.map((reg, idx) => (
                <button
                  key={reg.id}
                  onClick={() => handleSelectRegister(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
                    selectedRegIndex === idx
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {reg.id} <span className="opacity-75">({reg.address})</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-cyan-300">
                HEX: <strong>{formatHex(regValue, currentReg.width)}</strong>
              </span>
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-emerald-300">
                DEC: <strong>{regValue >>> 0}</strong>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-slate-950/70 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white font-mono">{currentReg.name}</h4>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Acceso: {currentReg.access} • {currentReg.width} Bits
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1.5">{currentReg.summary}</p>
              <p className="text-xs text-cyan-300/90 mt-2 bg-cyan-950/30 border border-cyan-800/40 rounded-lg p-2.5">
                <strong>Por qué es clave en la industria:</strong> {currentReg.whyItMatters}
              </p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
              <div className="text-xs font-bold text-slate-300 uppercase mb-2">
                Cómo se escribe en C ({mcu.name})
              </div>
              <div className="space-y-2">
                <div>
                  <span className="text-[10px] text-slate-400 block">Estructuras / CMSIS:</span>
                  <code className="text-[11px] font-mono text-emerald-300 bg-slate-900 px-2 py-1 rounded block overflow-x-auto">
                    {currentReg.cMacroExample}
                  </code>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Puntero Crudo a Dirección Física:</span>
                  <code className="text-[11px] font-mono text-amber-300 bg-slate-900 px-2 py-1 rounded block overflow-x-auto">
                    {currentReg.rawPointerExample}
                  </code>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <span className="text-xs font-bold text-slate-200">
                Haz clic en cualquier bit para conmutarlo en vivo (MSB a la izquierda, LSB Bit 0 a la derecha):
              </span>
              <span className="text-xs font-mono text-cyan-400">{lastBitwiseOp}</span>
            </div>

            <div
              className={`grid gap-1.5 ${
                currentReg.width === 8 ? 'grid-cols-8 max-w-xl mx-auto' : 'grid-cols-8 sm:grid-cols-16'
              }`}
            >
              {Array.from({ length: currentReg.width }, (_, i) => currentReg.width - 1 - i).map((bitPos) => {
                const bitVal = (regValue >>> bitPos) & 1;
                const isTarget = bitPos === targetBit;
                return (
                  <button
                    key={bitPos}
                    onClick={() => toggleBitInReg(bitPos)}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg border font-mono transition-all ${
                      bitVal === 1
                        ? 'bg-cyan-500/25 border-cyan-400 text-white shadow-sm shadow-cyan-950'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    } ${isTarget ? 'ring-2 ring-amber-400' : ''}`}
                  >
                    <span className="text-[10px] text-slate-400">b{bitPos}</span>
                    <span className="text-sm font-extrabold mt-0.5">{bitVal}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300">Bit objetivo seleccionado:</span>
                <select
                  value={targetBit}
                  onChange={(e) => setTargetBit(Number(e.target.value))}
                  className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-amber-300"
                >
                  {Array.from({ length: currentReg.width }, (_, i) => (
                    <option key={i} value={i}>
                      Bit {i} (Máscara {formatHex(1 << i, currentReg.width)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => applyBitwiseOperation('set')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono hover:bg-emerald-500/30"
                >
                  |= (1U &lt;&lt; {targetBit}) [Set]
                </button>
                <button
                  onClick={() => applyBitwiseOperation('clear')}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-mono hover:bg-rose-500/30"
                >
                  &amp;= ~(1U &lt;&lt; {targetBit}) [Clear]
                </button>
                <button
                  onClick={() => applyBitwiseOperation('toggle')}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-mono hover:bg-cyan-500/30"
                >
                  ^= (1U &lt;&lt; {targetBit}) [Toggle]
                </button>
                {currentReg.width === 32 && (
                  <button
                    onClick={() => applyBitwiseOperation('field01')}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono hover:bg-amber-500/30"
                  >
                    Campo 2-Bits = 01
                  </button>
                )}
                <button
                  onClick={() => applyBitwiseOperation('reset')}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-mono hover:bg-slate-700 flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {currentReg.fields.map((field, i) => {
              const mask = ((1 << (field.msb - field.lsb + 1)) - 1) >>> 0;
              const fieldVal = (regValue >>> field.lsb) & mask;
              const fieldBin = fieldVal.toString(2).padStart(field.msb - field.lsb + 1, '0');
              return (
                <div key={i} className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold font-mono text-cyan-300">{field.name}</span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 text-amber-300 border border-slate-700">
                      Bits [{field.bits}] = 0b{fieldBin} ({fieldVal})
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{field.description}</p>
                  {field.values && field.values[fieldBin] && (
                    <div className="mt-2 text-[11px] font-mono text-emerald-300 bg-emerald-950/40 border border-emerald-700/40 rounded px-2 py-1">
                      Estado Activo: {field.values[fieldBin]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================================
          LAB 3: EDITOR C LIBRE EN VIVO (EVALUADOR PASO A PASO)
         ===================================================================== */}
      {activeLab === 'c-live-editor' && (
        <div className="p-5 space-y-5">
          <div className="bg-sky-950/25 border border-sky-500/30 rounded-xl p-4 text-xs text-slate-200 leading-relaxed">
            <div className="font-bold text-sky-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Code className="w-4 h-4" /> Editor y Evaluador Libre de Expresiones C en Tiempo Real
            </div>
            Escribe a mano cualquier combinación de sentencias C sobre <code>REG</code> (o usando nombres reales como{' '}
            <code>GPIOA-&gt;MODER</code>, <code>GPIOA-&gt;ODR</code>, <code>DDRB</code>, <code>PORTB</code>) con operadores{' '}
            <code>|=</code>, <code>&amp;=</code>, <code>^=</code>, <code>~</code>, <code>&lt;&lt;</code>,{' '}
            <code>&gt;&gt;</code> y números en hexadecimal (<code>0x...</code>), binario (<code>0b...</code>) o decimal. El motor ejecutará tu código línea por línea mostrando qué bits cambiaron.
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: Free C Code Editor */}
            <div className="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase text-cyan-400 font-mono">
                  sandbox_register.c ({mcu.bitWidth}-bit {mcu.name})
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Valor inicial REG:</span>
                  <select
                    value={sandboxInitialReg}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setSandboxInitialReg(val);
                      runLiveCSandbox(customCCode, val);
                    }}
                    className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-amber-300"
                  >
                    <option value={0x00000000}>0x00000000 (Todos en 0)</option>
                    <option value={0x00000c01}>0x00000C01 (Bits 11, 10 y 0 en 1)</option>
                    <option value={0x000000ff}>0x000000FF (Byte bajo en 1)</option>
                    <option value={0xffffffff}>0xFFFFFFFF (Todos en 1)</option>
                  </select>
                </div>
              </div>

              <textarea
                value={customCCode}
                onChange={(e) => setCustomCCode(e.target.value)}
                rows={7}
                spellCheck={false}
                className="w-full bg-slate-900/90 border border-slate-700 focus:border-cyan-400 focus:outline-none rounded-xl p-3.5 text-xs sm:text-sm font-mono text-emerald-300 leading-relaxed"
                placeholder="Escribe tus expresiones en C aquí, ej: REG |= (1 << 5);"
              />

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => {
                      const snippet = `REG |= (1UL << 5);\nREG |= (1UL << 12);`;
                      setCustomCCode(snippet);
                      runLiveCSandbox(snippet, sandboxInitialReg);
                    }}
                    className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-[11px] font-mono text-slate-300"
                  >
                    Ejemplo: Encender 2 bits
                  </button>
                  <button
                    onClick={() => {
                      const snippet = `// Limpiar bits [11:10] y escribir 01 (Salida en MODER5):\nREG &= ~(3UL << 10);\nREG |=  (1UL << 10);`;
                      setCustomCCode(snippet);
                      runLiveCSandbox(snippet, sandboxInitialReg);
                    }}
                    className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-[11px] font-mono text-slate-300"
                  >
                    Ejemplo: Campo 2-bits MODER
                  </button>
                  <button
                    onClick={() => {
                      const snippet = `// Extraer un nibble y desplazar:\nREG = (0xABCDUL & 0x0F00UL) >> 8;`;
                      setCustomCCode(snippet);
                      runLiveCSandbox(snippet, sandboxInitialReg);
                    }}
                    className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-[11px] font-mono text-slate-300"
                  >
                    Ejemplo: Extraer Bytes
                  </button>
                </div>

                <button
                  onClick={() => runLiveCSandbox()}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs font-mono flex items-center gap-1.5 shadow-lg shadow-cyan-950"
                >
                  <Play className="w-4 h-4" /> Ejecutar Código C
                </button>
              </div>
            </div>

            {/* Right: Step-by-Step Execution Trace & Bit Diff */}
            <div className="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-emerald-400">
                  Resultado y Traza Paso a Paso en el Silicio
                </span>
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-cyan-300">
                  Valor Final: <strong>{formatHex(cEvalResult.finalValue, mcu.bitWidth)}</strong> ({cEvalResult.finalValue >>> 0})
                </span>
              </div>

              {cEvalResult.error ? (
                <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/50 text-xs text-rose-200 font-mono">
                  ⚠️ {cEvalResult.error}
                </div>
              ) : (
                <>
                  {/* Bit representation of final value */}
                  <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
                    <div className="text-[11px] text-slate-400 font-mono mb-2">
                      Estado binario resultante ({mcu.bitWidth} bits):
                    </div>
                    <div
                      className={`grid gap-1 ${
                        mcu.bitWidth === 8 ? 'grid-cols-8' : 'grid-cols-8 sm:grid-cols-16'
                      }`}
                    >
                      {Array.from({ length: mcu.bitWidth }, (_, i) => mcu.bitWidth - 1 - i).map((b) => {
                        const val = (cEvalResult.finalValue >>> b) & 1;
                        return (
                          <div
                            key={b}
                            className={`text-center py-1 rounded border font-mono text-xs ${
                              val === 1
                                ? 'bg-cyan-500/25 border-cyan-400 text-white font-bold'
                                : 'bg-slate-950 border-slate-800 text-slate-500'
                            }`}
                          >
                            <div className="text-[9px] opacity-70">b{b}</div>
                            <div>{val}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step by step trace */}
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {cEvalResult.steps.map((st, i) => (
                      <div key={i} className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs">
                        <div className="flex items-center justify-between font-mono">
                          <span className="text-amber-300 font-bold">
                            Paso {i + 1}: {st.statement}
                          </span>
                          <span className="text-emerald-300">
                            {formatHex(st.beforeVal, mcu.bitWidth)} → {formatHex(st.afterVal, mcu.bitWidth)}
                          </span>
                        </div>
                        <p className="text-slate-300 mt-1">{st.explanation}</p>
                        <div className="text-[11px] font-mono text-cyan-400 mt-1">
                          {st.changedBits.length > 0
                            ? `Bits que cambiaron de estado: [${st.changedBits.join(', ')}]`
                            : 'Ningún bit cambió (ya tenían ese estado)'}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          LAB 4: MAPA DE MEMORIA, BUSES, DMA Y STACK FRAME ISR
         ===================================================================== */}
      {activeLab === 'memory-bus' && (
        <div className="p-5 space-y-5">
          <div className="bg-emerald-950/25 border border-emerald-500/30 rounded-xl p-4 text-xs text-slate-200 leading-relaxed">
            <div className="font-bold text-emerald-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" /> Explicación del Panel: Cómo conviven Flash, RAM, Periféricos, DMA y el Stack
            </div>
            El procesador no distingue entre "memoria" y "periféricos": solo pone un número de dirección en el bus de direcciones. Si la dirección empieza por <code>0x0800...</code> lee instrucciones de la <strong>Flash</strong>; si empieza por <code>0x2000...</code> lee variables de la <strong>SRAM</strong>; si empieza por <code>0x4000...</code> acciona los interruptores de un <strong>Periférico (MMIO)</strong>. El <strong>Stack (Pila)</strong> vive al final de la SRAM y crece hacia abajo cada vez que entras en una función o salta una interrupción (ISR).
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-emerald-400" />
                Mapa de Direcciones y Buses Físicos — {mcu.name}
              </h4>
              <div className="space-y-2">
                {mcu.memoryMap.map((mem, idx) => {
                  const isSelected = selectedMemIndex === idx;
                  const colorStyles =
                    mem.type === 'flash'
                      ? 'border-amber-500/40 bg-amber-500/10 text-amber-200'
                      : mem.type === 'sram'
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                      : mem.type === 'peripherals'
                      ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-200'
                      : 'border-purple-500/40 bg-purple-500/10 text-purple-200';
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedMemIndex(idx)}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        isSelected
                          ? `${colorStyles} ring-2 ring-cyan-400`
                          : 'bg-slate-950/80 border-slate-800 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-bold text-white">{mem.region}</span>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-700">
                          {mem.startAddr} → {mem.endAddr} ({mem.size})
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 font-mono">Bus: {mem.bus}</div>
                      {isSelected && (
                        <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 space-y-1.5">
                          <p className="text-xs text-slate-200">{mem.description}</p>
                          <code className="block text-[11px] font-mono bg-slate-950 p-2 rounded text-emerald-300">
                            {mem.cStorageExample}
                          </code>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-6 space-y-4">
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                    Simulador de Transferencia Autónoma DMA (0% Uso de CPU)
                  </h4>
                  <button
                    onClick={triggerDmaBurst}
                    className="px-3 py-1 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 hover:bg-cyan-400 transition-all"
                  >
                    <Play className="w-3.5 h-3.5" /> Disparar Ráfaga ADC → DMA → SRAM
                  </button>
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  El controlador DMA lee el registro fijo del ADC (<code>PAR</code>) y copia cada muestra al array en RAM (<code>M0AR++</code>) mientras la CPU ejecuta <code>main()</code> sin interrupciones:
                </p>

                <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                  {dmaSamples.map((sample, i) => (
                    <div key={i} className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-center font-mono">
                      <span className="text-[10px] text-slate-400 block">buf[{i}]</span>
                      <span className="text-xs font-bold text-emerald-400">{sample}</span>
                      <span className="text-[9px] text-slate-500 block">
                        {((sample * 3.3) / 4095).toFixed(2)}V
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-[11px] font-mono text-slate-400 flex justify-between">
                  <span>Origen Fijo: ADC_DR (PINC=0) | Destino Incremental: SRAM (MINC=1)</span>
                  <span className="text-cyan-400">Muestras movidas: {dmaTransferCount}</span>
                </div>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Rayos X de la Pila (Stack Frame) al Saltar una Interrupción (ISR)
                  </h4>
                  <button
                    onClick={() => setIsrActive(!isrActive)}
                    className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                      isrActive
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-slate-800 text-amber-300 border border-amber-500/40 hover:bg-slate-700'
                    }`}
                  >
                    {isrActive ? 'Salir de la ISR (BX LR)' : 'Simular Disparo de Interrupción'}
                  </button>
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  {isrActive
                    ? '¡INTERRUPCIÓN ACTIVA! El hardware de la CPU congeló main(), restó 32 bytes al Stack Pointer (SP) y guardó los 8 registros de trabajo en SRAM automáticamente:'
                    : 'Ejecutando hilo principal main(). Pulsa el botón para ver qué guarda el procesador en la memoria SRAM (Stack) antes de saltar al vector de interrupción:'}
                </p>

                <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 font-mono text-center">
                  {['xPSR', 'PC (Ret)', 'LR', 'R12', 'R3', 'R2', 'R1', 'R0'].map((regName, idx) => (
                    <div
                      key={regName}
                      className={`p-2 rounded-lg border text-xs transition-all ${
                        isrActive
                          ? 'bg-amber-500/20 border-amber-400 text-amber-200 scale-105'
                          : 'bg-slate-900 border-slate-800 text-slate-500'
                      }`}
                    >
                      <div className="text-[10px] opacity-75">SP+{28 - idx * 4}</div>
                      <div className="font-bold mt-0.5">{regName}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ring Buffer (Circular FIFO) Interactive Visualizer */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Simulador de Ring Buffer Circular en C (ISR UART Productor → main() Consumidor)
                  </h4>
                  <span className="text-[11px] font-mono text-cyan-300">
                    head={rbHead} | tail={rbTail} | máscara=(idx + 1) &amp; 7
                  </span>
                </div>
                <p className="text-xs text-slate-300">{rbStatusMsg}</p>

                <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 font-mono text-center">
                  {rbCells.map((ch, idx) => {
                    const isHead = idx === rbHead;
                    const isTail = idx === rbTail;
                    return (
                      <div
                        key={idx}
                        className={`p-2 rounded-lg border text-xs transition-all ${
                          isHead && isTail
                            ? 'bg-purple-500/25 border-purple-400 text-white'
                            : isHead
                            ? 'bg-amber-500/25 border-amber-400 text-amber-200'
                            : isTail
                            ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200'
                            : 'bg-slate-900 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="text-[9px] text-slate-400">rb[{idx}]</div>
                        <div className="text-sm font-extrabold my-0.5">'{ch}'</div>
                        <div className="text-[9px] font-bold">
                          {isHead && isTail ? 'H=T' : isHead ? 'HEAD(W)' : isTail ? 'TAIL(R)' : '\u00A0'}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-wrap gap-2 font-mono text-xs">
                  <button
                    onClick={() => {
                      const nextHead = (rbHead + 1) & 7;
                      if (nextHead === rbTail) {
                        setRbStatusMsg('⚠️ ¡Buffer Lleno! (head + 1) & 7 == tail -> La ISR descarta el byte para no pisar datos.');
                        return;
                      }
                      const sampleChars = ['G', 'P', 'S', '$', '1', '9', 'Z', '#'];
                      const newChar = sampleChars[(rbHead + rbTail) & 7];
                      const nextArr = [...rbCells];
                      nextArr[rbHead] = newChar;
                      setRbCells(nextArr);
                      setRbHead(nextHead);
                      setRbStatusMsg(
                        `ISR ejecutó: rb.buf[${rbHead}] = '${newChar}'; rb.head = (${rbHead} + 1) & 7 = ${nextHead};`
                      );
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-400 text-amber-200 font-bold"
                  >
                    + ISR UART Recibe Byte (Avanza HEAD)
                  </button>
                  <button
                    onClick={() => {
                      if (rbHead === rbTail) {
                        setRbStatusMsg('ℹ️ Buffer Vacío (head == tail): main() no tiene bytes nuevos que leer.');
                        return;
                      }
                      const readChar = rbCells[rbTail];
                      const nextTail = (rbTail + 1) & 7;
                      setRbTail(nextTail);
                      setRbStatusMsg(
                        `main() leyó '${readChar}' en rb.buf[${rbTail}] -> rb.tail = (${rbTail} + 1) & 7 = ${nextTail};`
                      );
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-400 text-emerald-200 font-bold"
                  >
                    → main() Consume Byte (Avanza TAIL)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          LAB 5: COMPILADOR, VOLATILE Y CONDICIÓN DE CARRERA (ODR vs BSRR)
         ===================================================================== */}
      {activeLab === 'compiler-volatile' && (
        <div className="p-5 space-y-5">
          <div className="bg-purple-950/25 border border-purple-500/30 rounded-xl p-4 text-xs text-slate-200 leading-relaxed">
            <div className="font-bold text-purple-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" /> Explicación del Panel: El Optimizador del Compilador y la Concurrencia Hardware
            </div>
            Cuando compilas con optimización <code>-O2</code> o <code>-Os</code> (el estándar en productos comerciales), el compilador analiza el código buscando lecturas de memoria redundantes. Si una variable se lee mil veces en un bucle <code>while</code> y ninguna línea dentro del bucle la modifica, el compilador asume que jamás cambiará y elimina la instrucción de lectura de memoria (<code>LDRB</code>). La palabra clave <code>volatile</code> le informa al compilador de que esa dirección puede cambiar fuera del flujo normal por una interrupción o un periférico físico.
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  Demostrador del Compilador: ¿Por qué hace falta <code>volatile</code>?
                </h4>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setUseVolatile(!useVolatile)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border ${
                    useVolatile
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                      : 'bg-rose-500/20 border-rose-500 text-rose-300'
                  }`}
                >
                  {useVolatile ? '✅ Con "volatile uint8_t flag"' : '❌ Sin "volatile" (uint8_t flag)'}
                </button>

                <button
                  onClick={() => setOptLevel(optLevel === '-O0' ? '-O2' : '-O0')}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-slate-900 border border-slate-700 text-cyan-300"
                >
                  Optimización GCC: {optLevel} ({optLevel === '-O2' ? 'Producción' : 'Sin optimizar'})
                </button>

                <button
                  onClick={() => setRamFlagValue(ramFlagValue === 0 ? 1 : 0)}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-amber-500/20 border border-amber-400 text-amber-200"
                >
                  ISR cambia flag en RAM a: {ramFlagValue}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                  <span className="text-[10px] uppercase text-slate-400 font-bold block mb-1">
                    Código Fuente en C:
                  </span>
                  <pre className="text-xs font-mono text-slate-200 leading-relaxed">
{`${useVolatile ? 'volatile ' : ''}uint8_t flag = 0;

void ISR_Boton(void) {
    flag = 1; // En RAM vale ${ramFlagValue}
}

void esperar_evento(void) {
    while (flag == 0) {
        // Esperando...
    }
}`}
                  </pre>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                  <span className="text-[10px] uppercase text-slate-400 font-bold block mb-1">
                    Ensamblador Generado ({optLevel}):
                  </span>
                  {useVolatile || optLevel === '-O0' ? (
                    <pre className="text-xs font-mono text-emerald-300 leading-relaxed">
{`.L2_bucle:
  ldr r3, =flag_addr
  ldrb r3, [r3]  ; ¡Lee la RAM en cada vuelta!
  cmp r3, #0
  beq .L2_bucle  ; Sale en cuanto flag == 1
  bx lr`}
                    </pre>
                  ) : (
                    <pre className="text-xs font-mono text-rose-300 leading-relaxed">
{`  ldr r3, =flag_addr
  ldrb r3, [r3]  ; ¡Lee la RAM UNA SOLA VEZ!
  cmp r3, #0
  bne .L_fin
.L2_trampa_infinita:
  b .L2_trampa_infinita ; ¡CONGELADO PARA SIEMPRE!`}
                    </pre>
                  )}
                </div>
              </div>

              <div
                className={`p-3 rounded-lg border text-xs ${
                  !useVolatile && optLevel === '-O2'
                    ? 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                    : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                }`}
              >
                {!useVolatile && optLevel === '-O2' ? (
                  <span>
                    <strong>🚨 BUG CRÍTICO REPRODUCIDO:</strong> Aunque la interrupción haya cambiado{' '}
                    <code>flag = 1</code> en la memoria RAM, el compilador eliminó la lectura <code>ldrb</code> de dentro del bucle porque asumió que nadie modificaba <code>flag</code> dentro del <code>while</code>.
                  </span>
                ) : (
                  <span>
                    <strong>✅ FUNCIONAMIENTO CORRECTO:</strong> El procesador emite la instrucción de carga{' '}
                    <code>ldrb</code> en cada iteración del bucle y detecta inmediatamente cuando la ISR escribe{' '}
                    <code>flag = {ramFlagValue}</code> en la RAM.
                  </span>
                )}
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                Simulador de Condición de Carrera: <code>ODR |=</code> vs <code>BSRR</code> Atómico
              </h4>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setRaceMode('rmw-odr');
                    setRaceStep(0);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border ${
                    raceMode === 'rmw-odr'
                      ? 'bg-rose-500/20 border-rose-400 text-rose-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  Modo 1: GPIOA-&gt;ODR |= (1&lt;&lt;5) (3 Pasos)
                </button>
                <button
                  onClick={() => {
                    setRaceMode('atomic-bsrr');
                    setRaceStep(0);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border ${
                    raceMode === 'atomic-bsrr'
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  Modo 2: GPIOA-&gt;BSRR = (1&lt;&lt;5) (Atómico)
                </button>
              </div>

              {raceMode === 'rmw-odr' ? (
                <div className="space-y-2">
                  {[
                    {
                      step: 0,
                      title: 'Paso 1 (LDR): main() lee ODR completo en el registro R0',
                      desc: 'En ese instante PA6=0 y PA5=0 -> R0 guarda 0b00000000.'
                    },
                    {
                      step: 1,
                      title: '⚡ ¡Salta una Interrupción a mitad de camino!',
                      desc: 'La ISR enciende el motor de emergencia en PA6 -> ODR pasa a valer 0b01000000 (PA6=1).'
                    },
                    {
                      step: 2,
                      title: 'Paso 2 y 3 (ORR + STR): main() reanuda con su R0 viejo y machaca ODR',
                      desc: 'main() hace R0 |= (1<<5) sobre su copia vieja (0b00100000) y la guarda en ODR -> ¡Acaba de APAGAR por accidente el pin PA6 de la ISR!'
                    }
                  ].map((item) => (
                    <div
                      key={item.step}
                      onClick={() => setRaceStep(item.step)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        raceStep === item.step
                          ? 'bg-rose-950/40 border-rose-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="text-xs font-bold font-mono">{item.title}</div>
                      <div className="text-xs mt-1">{item.desc}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/50 space-y-2">
                  <div className="text-xs font-bold font-mono text-emerald-300">
                    Operación en 1 Sola Instrucción: STR R2, [GPIOA_BSRR]
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    Al usar <code>GPIOA-&gt;BSRR = (1UL &lt;&lt; 5)</code> (o <code>W1TS</code> en ESP32 /{' '}
                    <code>OUTSET</code> en Nordic / <code>SIO_GPIO_OUT_SET</code> en RP2040), la CPU{' '}
                    <strong>no lee el registro antes de escribir</strong>. Envía directamente la máscara al silicio en 1 sola instrucción indivisible, por lo que es imposible que una interrupción corrompa el puerto.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          LAB 6: ANALIZADOR LÓGICO DIGITAL (PWM, UART, I2C, SPI)
         ===================================================================== */}
      {activeLab === 'logic-analyzer' && (
        <div className="p-5 space-y-5">
          <div className="bg-rose-950/25 border border-rose-500/30 rounded-xl p-4 text-xs text-slate-200 leading-relaxed">
            <div className="font-bold text-rose-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" /> Explicación del Panel: Cómo ver el Tiempo y los Bits en el Cable
            </div>
            Cuando trabajas con hardware real, un <strong>Osciloscopio</strong> o un <strong>Analizador Lógico</strong> es tu par de ojos para ver qué está saliendo realmente por las patillas del chip. En <strong>PWM</strong> controlas la potencia variando qué porcentaje del periodo pasa el pin en ALTO (<code>CNT &lt; CCR1</code>). En <strong>UART, I2C y SPI</strong> los periféricos serializan un byte de 8 bits sacando cada bit en serie por el cable.
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/80 border border-slate-800 rounded-xl p-3.5">
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'pwm', label: 'Osciloscopio Timer PWM (PSC / ARR / CCR)' },
                { id: 'uart', label: 'Trama Serie UART (8N1 LSB-First)' },
                { id: 'i2c', label: 'Trama Bus I2C (Start + Addr + ACK)' },
                { id: 'spi', label: 'Trama Síncrona SPI (SCK + MOSI + MISO)' }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setAnalyzerMode(m.id as typeof analyzerMode)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
                    analyzerMode === m.id
                      ? 'bg-rose-500 text-white border-rose-400'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {analyzerMode === 'pwm' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
                <h4 className="text-xs font-bold uppercase text-cyan-400">
                  Registros del Timer Hardware ({mcu.name})
                </h4>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span>Ciclo de Trabajo (Registro CCR1):</span>
                    <span className="text-amber-300 font-bold">
                      {pwmDuty}% (CCR1 = {Math.round(((pwmArr + 1) * pwmDuty) / 100)})
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={pwmDuty}
                    onChange={(e) => setPwmDuty(Number(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Prescaler (PSC)</span>
                    <input
                      type="number"
                      min={0}
                      max={65535}
                      value={pwmPrescaler}
                      onChange={(e) => setPwmPrescaler(Math.max(0, Number(e.target.value)))}
                      className="mt-1 w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-cyan-300"
                    />
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Auto-Reload (ARR)</span>
                    <input
                      type="number"
                      min={10}
                      max={65535}
                      value={pwmArr}
                      onChange={(e) => setPwmArr(Math.max(10, Number(e.target.value)))}
                      className="mt-1 w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-emerald-300"
                    />
                  </div>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 text-xs font-mono space-y-1">
                  <div>
                    Frecuencia PWM:{' '}
                    <strong className="text-emerald-400">
                      {(84000000 / ((pwmPrescaler + 1) * (pwmArr + 1))).toFixed(1)} Hz
                    </strong>
                  </div>
                  <div>
                    Tiempo en ALTO (CNT &lt; CCR1): <strong className="text-cyan-300">{pwmDuty}% del periodo</strong>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                  <span>FORMA DE ONDA EN EL PIN FÍSICO (2 Periodos Completos)</span>
                  <span className="text-emerald-400">V_max = {vccLabel}</span>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4">
                  <svg viewBox="0 0 600 140" className="w-full h-36">
                    <line x1="0" y1="25" x2="600" y2="25" stroke="#1e293b" strokeDasharray="4" />
                    <line x1="0" y1="115" x2="600" y2="115" stroke="#1e293b" strokeDasharray="4" />
                    <line x1="300" y1="10" x2="300" y2="130" stroke="#334155" strokeDasharray="4" />

                    {[0, 300].map((offset) => {
                      const highWidth = (pwmDuty / 100) * 300;
                      return (
                        <g key={offset}>
                          {pwmDuty > 0 && (
                            <polyline
                              fill="none"
                              stroke="#22d3ee"
                              strokeWidth="3"
                              points={`${offset},115 ${offset},25 ${offset + highWidth},25 ${
                                pwmDuty < 100 ? `${offset + highWidth},115 300,115` : ''
                              }`}
                            />
                          )}
                          {pwmDuty < 100 && (
                            <line
                              x1={offset + highWidth}
                              y1="115"
                              x2={offset + 300}
                              y2="115"
                              stroke="#22d3ee"
                              strokeWidth="3"
                            />
                          )}
                        </g>
                      );
                    })}
                    <text x="8" y="20" fill="#94a3b8" fontSize="10" fontFamily="monospace">
                      HIGH ({vccLabel}) — CNT &lt; CCR1
                    </text>
                    <text x="8" y="132" fill="#94a3b8" fontSize="10" fontFamily="monospace">
                      LOW (0.0V) — CNT &gt;= CCR1
                    </text>
                  </svg>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-300">
                  <span>
                    Brillo efectivo en LED / Potencia entregada: <strong>{pwmDuty}%</strong>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">LED Virtual:</span>
                    <div
                      className="w-6 h-6 rounded-full border border-emerald-300"
                      style={{
                        backgroundColor: `rgba(52, 211, 153, ${Math.max(0.08, pwmDuty / 100)})`,
                        boxShadow: `0 0 ${pwmDuty / 4}px rgba(52, 211, 153, ${pwmDuty / 100})`
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <label className="text-xs text-slate-300 font-semibold">
                    Dato a Transmitir en el Registro <code>DR</code>:
                  </label>
                  <select
                    value={serialByte}
                    onChange={(e) => setSerialByte(Number(e.target.value))}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-cyan-300"
                  >
                    <option value={0x41}>0x41 ('A' ASCII = 0b01000001)</option>
                    <option value={0x55}>0x55 ('U' Patrón Reloj = 0b01010101)</option>
                    <option value={0xaa}>0xAA (Alternado = 0b10101010)</option>
                    <option value={0x35}>0x35 ('5' ASCII = 0b00110101)</option>
                    <option value={0xff}>0xFF (Todos 1 = 0b11111111)</option>
                    <option value={0x00}>0x00 (Todos 0 = 0b00000000)</option>
                  </select>
                </div>

                {analyzerMode === 'i2c' && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400">Dirección Sensor I2C: 0x3C</span>
                    <button
                      onClick={() => setI2cAck(!i2cAck)}
                      className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                        i2cAck ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      9º Pulso: {i2cAck ? 'ACK (0V Sensor Responde)' : 'NACK (3.3V Sin Respuesta)'}
                    </button>
                  </div>
                )}
              </div>

              {analyzerMode === 'uart' && (
                <div className="space-y-2">
                  <div className="text-xs text-slate-400 font-mono">
                    Trama UART 8N1 — Orden de salida en el cable:{' '}
                    <strong className="text-amber-300">LSB Primero (Bit 0 → Bit 7)</strong>
                  </div>
                  <div className="grid grid-cols-11 gap-1.5 font-mono text-center">
                    <div className="p-2 rounded bg-slate-900 border border-slate-700">
                      <span className="text-[10px] text-slate-400 block">IDLE</span>
                      <span className="text-xs font-bold text-emerald-400">1 (3.3V)</span>
                    </div>
                    <div className="p-2 rounded bg-amber-500/20 border border-amber-400">
                      <span className="text-[10px] text-amber-300 block">START</span>
                      <span className="text-xs font-bold text-white">0 (0V)</span>
                    </div>
                    {getBitsLSBFirst(serialByte).map((b, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded border ${
                          b === 1
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        <span className="text-[10px] block">Bit {idx}</span>
                        <span className="text-sm font-extrabold">{b}</span>
                      </div>
                    ))}
                    <div className="p-2 rounded bg-emerald-500/20 border border-emerald-400">
                      <span className="text-[10px] text-emerald-300 block">STOP</span>
                      <span className="text-xs font-bold text-white">1 (3.3V)</span>
                    </div>
                  </div>
                </div>
              )}

              {analyzerMode === 'i2c' && (
                <div className="space-y-2">
                  <div className="text-xs text-slate-400 font-mono">
                    Trama I2C (Open-Drain): Condición START + Dirección 7-bit (0x3C, MSB First) + Bit R/W (0=Write) + Bit ACK del Esclavo
                  </div>
                  <div className="grid grid-cols-11 gap-1.5 font-mono text-center">
                    <div className="p-2 rounded bg-amber-500/20 border border-amber-400">
                      <span className="text-[10px] text-amber-300 block">START</span>
                      <span className="text-xs font-bold">SDA↓</span>
                    </div>
                    {getBitsMSBFirst(i2cAddress, 7).map((b, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded bg-slate-900 border border-cyan-500/40 text-cyan-200"
                      >
                        <span className="text-[10px] block">A{6 - idx}</span>
                        <span className="text-sm font-bold">{b}</span>
                      </div>
                    ))}
                    <div className="p-2 rounded bg-purple-500/20 border border-purple-400">
                      <span className="text-[10px] text-purple-300 block">R/W</span>
                      <span className="text-xs font-bold">0 (W)</span>
                    </div>
                    <div
                      className={`p-2 rounded border ${
                        i2cAck
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                          : 'bg-rose-500/20 border-rose-400 text-rose-200'
                      }`}
                    >
                      <span className="text-[10px] block">{i2cAck ? 'ACK' : 'NACK'}</span>
                      <span className="text-xs font-bold">{i2cAck ? '0 (OK)' : '1 (ERR)'}</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-700">
                      <span className="text-[10px] text-slate-400 block">STOP</span>
                      <span className="text-xs font-bold">SDA↑</span>
                    </div>
                  </div>
                </div>
              )}

              {analyzerMode === 'spi' && (
                <div className="space-y-2">
                  <div className="text-xs text-slate-400 font-mono">
                    Trama SPI Full-Duplex (CS Activo en Bajo 0V): 8 Pulsos de Reloj SCK intercambian 8 bits en MOSI y MISO a la vez (MSB First)
                  </div>
                  <div className="grid grid-cols-10 gap-1.5 font-mono text-center">
                    <div className="p-2 rounded bg-amber-500/20 border border-amber-400">
                      <span className="text-[10px] text-amber-300 block">CS / SS</span>
                      <span className="text-xs font-bold">0 (LOW)</span>
                    </div>
                    {getBitsMSBFirst(serialByte, 8).map((b, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded bg-slate-900 border border-cyan-500/40 text-cyan-200"
                      >
                        <span className="text-[10px] text-slate-400 block">SCK #{idx + 1}</span>
                        <span className="text-xs font-bold block">MOSI: {b}</span>
                      </div>
                    ))}
                    <div className="p-2 rounded bg-slate-900 border border-slate-700">
                      <span className="text-[10px] text-slate-400 block">CS / SS</span>
                      <span className="text-xs font-bold">1 (HIGH)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          LAB 7: DIAGRAMAS DE NUEVOS PERIFÉRICOS (SAR ADC, ÁRBOL PLL Y WATCHDOG)
         ===================================================================== */}
      {activeLab === 'peripherals-adc-wdg' && (
        <div className="p-5 space-y-6">
          <div className="bg-lime-950/25 border border-lime-500/30 rounded-xl p-4 text-xs text-slate-200 leading-relaxed">
            <div className="font-bold text-lime-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Gauge className="w-4 h-4" /> Diagramas Interactivos de Periféricos Clave: SAR ADC, Multiplicador de Reloj PLL y Watchdog (IWDG)
            </div>
            Explora tres bloques que aparecen en todos los proyectos reales: 1) Cómo un <strong>ADC de Aproximación Sucesiva (SAR)</strong> descubre el voltaje analógico bit a bit como una balanza romana, 2) Cómo el <strong>Árbol de Relojes (PLL)</strong> multiplica un cristal de 8 MHz hasta 84/160 MHz, y 3) Cómo el <strong>Watchdog Timer (Perro Guardián)</strong> rescata al microcontrolador cuando un fallo bloquea el software.
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* 1. SAR ADC 12-Bit Interactive Diagram */}
            <div className="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase text-emerald-400">
                  1. Diagrama SAR ADC de 12 Bits (Búsqueda Binaria Analógica)
                </h4>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300">
                  ADC-&gt;DR = {adcRaw12Bit} (0x{adcRaw12Bit.toString(16).toUpperCase().padStart(3, '0')})
                </span>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span>Voltaje Analógico en el Pin (Sensor / Potenciómetro):</span>
                  <span className="text-cyan-300 font-bold">
                    {(analogVoltageMv / 1000).toFixed(2)} V ({analogVoltageMv} mV de 3300 mV)
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={3300}
                  step={10}
                  value={analogVoltageMv}
                  onChange={(e) => setAnalogVoltageMv(Number(e.target.value))}
                  className="w-full accent-emerald-400"
                />
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
                <div className="text-[11px] text-slate-400 mb-2">
                  Los 12 pasos del registro de aproximación sucesiva (del Bit 11 MSB al Bit 0 LSB):
                </div>
                <div className="grid grid-cols-6 sm:grid-cols-12 gap-1 font-mono text-center">
                  {sarSteps.map((s) => (
                    <div
                      key={s.bitPos}
                      className={`p-1.5 rounded border text-xs ${
                        s.bitVal === 1
                          ? 'bg-emerald-500/25 border-emerald-400 text-white font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-500'
                      }`}
                    >
                      <div className="text-[9px] opacity-70">b{s.bitPos}</div>
                      <div>{s.bitVal}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-[11px] font-mono text-slate-300 bg-slate-950 p-2 rounded border border-slate-800">
                  Fórmula en C sin float: <code>uint32_t mv = ({adcRaw12Bit}UL * 3300UL) / 4095UL;</code> →{' '}
                  <strong className="text-emerald-300">{Math.round((adcRaw12Bit * 3300) / 4095)} mV</strong>
                </div>
              </div>
            </div>

            {/* 2. Clock Tree PLL & Watchdog Timer (IWDG) */}
            <div className="lg:col-span-6 space-y-4">
              {/* Clock Tree PLL */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase text-cyan-400">
                  2. Diagrama del Árbol de Relojes (Cristal → PLL → Buses AHB / APB)
                </h4>
                <div className="grid grid-cols-4 gap-2 text-xs font-mono text-center">
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-2">
                    <span className="text-[10px] text-slate-400 block">Cristal HSE</span>
                    <select
                      value={crystalMhz}
                      onChange={(e) => setCrystalMhz(Number(e.target.value))}
                      className="mt-1 bg-slate-950 border border-slate-700 rounded px-1 py-0.5 text-amber-300 w-full text-center"
                    >
                      <option value={8}>8 MHz</option>
                      <option value={16}>16 MHz</option>
                      <option value={25}>25 MHz</option>
                    </select>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-2">
                    <span className="text-[10px] text-slate-400 block">Mult PLL (×N)</span>
                    <input
                      type="number"
                      min={2}
                      max={64}
                      value={pllMult}
                      onChange={(e) => setPllMult(Math.max(2, Number(e.target.value)))}
                      className="mt-1 bg-slate-950 border border-slate-700 rounded px-1 py-0.5 text-cyan-300 w-full text-center"
                    />
                  </div>
                  <div className="bg-slate-900 border border-cyan-500/40 rounded-lg p-2">
                    <span className="text-[10px] text-cyan-300 block">SYSCLK / AHB</span>
                    <span className="text-sm font-extrabold text-white block mt-1">{sysclkMhz} MHz</span>
                  </div>
                  <div className="bg-slate-900 border border-emerald-500/40 rounded-lg p-2">
                    <span className="text-[10px] text-emerald-300 block">Bus APB1 (÷{apb1Div})</span>
                    <span className="text-sm font-extrabold text-emerald-300 block mt-1">{apb1Mhz} MHz</span>
                  </div>
                </div>
              </div>

              {/* Watchdog Timer Simulator */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase text-amber-400">
                    3. Simulador de Perro Guardián (Independent Watchdog — IWDG)
                  </h4>
                  <span className="text-xs font-mono text-slate-300">
                    Cuenta atrás: <strong>{wdgCounter}%</strong>
                  </span>
                </div>

                <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all duration-300 ${
                      wdgCounter > 50 ? 'bg-emerald-400' : wdgCounter > 25 ? 'bg-amber-400' : 'bg-rose-500'
                    }`}
                    style={{ width: `${wdgCounter}%` }}
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={advanceWatchdogTime}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200"
                    >
                      Avanzar Tiempo (-25%)
                    </button>
                    <button
                      disabled={wdgCpuHung}
                      onClick={feedTheWatchdog}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs font-mono font-bold disabled:opacity-40"
                    >
                      IWDG-&gt;KR = 0xAAAA (Refrescar)
                    </button>
                  </div>

                  <button
                    onClick={() => setWdgCpuHung(!wdgCpuHung)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border ${
                      wdgCpuHung
                        ? 'bg-rose-500 text-white border-rose-400'
                        : 'bg-slate-900 text-rose-300 border-rose-500/40'
                    }`}
                  >
                    {wdgCpuHung ? '🔥 CPU Colgada (while infinito)' : 'Simular Cuelgue de CPU'}
                  </button>
                </div>

                {wdgResetTriggered && (
                  <div className="p-2.5 rounded-lg bg-amber-500/20 border border-amber-400 text-xs text-amber-200 font-mono flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 shrink-0" />
                    ¡WATCHDOG RESET DISPARADO! El contador llegó a 0 porque la CPU no escribió 0xAAAA a tiempo y el hardware reinició el microcontrolador para salvar el equipo.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          LAB 8: PROYECTOS MULTI-ARCHIVO (.h/.c), LIBRERÍAS (.a), UNION Y BOOTLOADER
         ===================================================================== */}
      {activeLab === 'multi-file-toolchain' && (
        <div className="p-5 space-y-6">
          <div className="bg-cyan-950/25 border border-cyan-500/30 rounded-xl p-4 text-xs text-slate-200 leading-relaxed">
            <div className="font-bold text-cyan-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" /> Explicación del Panel: Arquitectura Multi-Archivo (.h y .c), Empaquetado de Librerías (.a), Uniones y Bootloaders
            </div>
            Aquí puedes experimentar en vivo con las herramientas de un <strong>Senior Embedded C Developer</strong>: inspecciona cómo se divide un proyecto real en varios archivos (<code>motor_lib.h</code>, <code>motor_lib.c</code>, <code>main.c</code> y <code>Makefile</code>), simula los errores reales del Linker (<code>multiple definition</code> y <code>undefined reference</code>), comprueba cómo <code>const</code> mueve tablas de la SRAM a la Flash, serializa paquetes con <code>union</code> y simula el salto de un <strong>Bootloader</strong> a la Aplicación con <code>SCB-&gt;VTOR</code>.
          </div>

          {/* 1. Multi-File Library Explorer & Linker Simulator */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: 4-File Project Inspector */}
            <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-xs font-bold uppercase text-cyan-400">
                  1. Explorador de Proyecto Multi-Archivo y Creación de Librería Estática (.a)
                </h4>
                <div className="flex flex-wrap gap-1.5 font-mono text-xs">
                  {[
                    { id: 'header', label: '📄 motor_lib.h' },
                    { id: 'source', label: '⚙️ motor_lib.c' },
                    { id: 'main', label: '🚀 main.c' },
                    { id: 'makefile', label: '🛠️ Makefile' }
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedProjectFile(f.id as typeof selectedProjectFile)}
                      className={`px-2.5 py-1 rounded-lg border transition-all ${
                        selectedProjectFile === f.id
                          ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-300'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interactive Bug / Optimization Toggles */}
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={() => setPutVarInHeaderBug(!putVarInHeaderBug)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border ${
                    putVarInHeaderBug
                      ? 'bg-rose-500/20 border-rose-400 text-rose-300'
                      : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  }`}
                >
                  {putVarInHeaderBug
                    ? '❌ BUG: Definir "uint32_t rpm_global = 0;" dentro de motor_lib.h'
                    : '✅ CORRECTO: Variable encapsulada con "static" en motor_lib.c'}
                </button>

                <button
                  onClick={() => setForgetLinkLibBug(!forgetLinkLibBug)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border ${
                    forgetLinkLibBug
                      ? 'bg-rose-500/20 border-rose-400 text-rose-300'
                      : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  }`}
                >
                  {forgetLinkLibBug
                    ? '❌ BUG: Olvidar enlazar libmotor.a en el comando del Linker'
                    : '✅ CORRECTO: Enlazar -lmotor (motor_lib.o) en el Linker'}
                </button>

                <button
                  onClick={() => setUseConstLookupTable(!useConstLookupTable)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border ${
                    useConstLookupTable
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                      : 'bg-amber-500/20 border-amber-400 text-amber-200'
                  }`}
                >
                  {useConstLookupTable
                    ? '💎 Con "static const" en Tabla Curva (0 Bytes de RAM)'
                    : '⚠️ Sin "const" en Tabla Curva (Come 1024 Bytes de SRAM)'}
                </button>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
                {selectedProjectFile === 'header' && (
                  <pre className="text-xs font-mono text-cyan-200 overflow-x-auto leading-relaxed">
{`/* === ARCHIVO: include/motor_lib.h (Contrato Público de la Librería) === */
#ifndef MOTOR_LIB_H
#define MOTOR_LIB_H

#include <stdint.h>
#include <stdbool.h>

typedef void (*motor_alarm_cb_t)(uint16_t rpm_exceso);

typedef struct {
    uint8_t          pwm_channel;
    uint16_t         max_rpm;
    motor_alarm_cb_t on_overspeed; // Callback de usuario
} motor_handle_t;

${
  putVarInHeaderBug
    ? '// ❌ ¡ERROR GRAVE! Definir variable con memoria en un .h:\nuint32_t rpm_global = 0; // Se duplicará en motor_lib.o y en main.o!'
    : '// ✅ Solo declaraciones (prototipos): cero reserva de memoria en el .h'
}
void     motor_init(motor_handle_t *hmotor, uint8_t ch, uint16_t max_rpm);
uint16_t motor_apply_curve(const motor_handle_t *hmotor, uint16_t target_rpm);

#endif /* MOTOR_LIB_H */`}
                  </pre>
                )}

                {selectedProjectFile === 'source' && (
                  <pre className="text-xs font-mono text-emerald-200 overflow-x-auto leading-relaxed">
{`/* === ARCHIVO: src/motor_lib.c (Implementación Privada de la Librería) === */
#include "motor_lib.h"

// "static" hace que esta variable sea 100% privada e invisible fuera de motor_lib.c:
static uint32_t s_total_comandos = 0U;

// Tabla de 512 elementos (1024 bytes):
${
  useConstLookupTable
    ? '// ✅ Con "const": Vive en Flash (.rodata) -> ¡Gasta 0 bytes de SRAM!\nstatic const uint16_t CURVA_LINEALIZACION[512] = { 0, 12, 28, 45, /* ... */ };'
    : '// ⚠️ Sin "const": ¡Se copia entera a la SRAM (.data) gastando 1024 bytes de RAM!\nstatic uint16_t CURVA_LINEALIZACION[512] = { 0, 12, 28, 45, /* ... */ };'
}

void motor_init(motor_handle_t *hmotor, uint8_t ch, uint16_t max_rpm) {
    if (hmotor == 0) return;
    hmotor->pwm_channel = ch;
    hmotor->max_rpm     = max_rpm;
}

uint16_t motor_apply_curve(const motor_handle_t *hmotor, uint16_t target_rpm) {
    s_total_comandos++;
    if ((target_rpm > hmotor->max_rpm) && (hmotor->on_overspeed != 0)) {
        hmotor->on_overspeed(target_rpm); // Dispara Callback hacia main.c!
    }
    return CURVA_LINEALIZACION[target_rpm & 511U];
}`}
                  </pre>
                )}

                {selectedProjectFile === 'main' && (
                  <pre className="text-xs font-mono text-amber-200 overflow-x-auto leading-relaxed">
{`/* === ARCHIVO: src/main.c (Aplicación que Usa la Librería) === */
#include "motor_lib.h" // Conoce los tipos y prototipos públicos

// Dos instancias independientes manejadas por la misma librería:
static motor_handle_t s_motor_izquierdo;
static motor_handle_t s_motor_derecho;

static void alerta_sobrevelocidad(uint16_t rpm) {
    (void)rpm;
    // Cortar puente H por seguridad
}

int main(void) {
    motor_init(&s_motor_izquierdo, 1U, 3000U);
    motor_init(&s_motor_derecho,   2U, 3000U);
    s_motor_izquierdo.on_overspeed = alerta_sobrevelocidad;

    while (1) {
        (void)motor_apply_curve(&s_motor_izquierdo, 1800U);
    }
}`}
                  </pre>
                )}

                {selectedProjectFile === 'makefile' && (
                  <pre className="text-xs font-mono text-purple-200 overflow-x-auto leading-relaxed">
{`# === ARCHIVO: Makefile Profesional (Compilación Separada + Librería .a) ===
CC      = arm-none-eabi-gcc
AR      = arm-none-eabi-ar
CFLAGS  = -mcpu=cortex-m4 -mthumb -Os -Wall -Wextra -Iinclude -ffunction-sections -fdata-sections
LDFLAGS = -T stm32_flash.ld -Wl,--gc-sections -Wl,-Map=firmware.map

# Paso 1: Compilar motor_lib.c por separado a objeto motor_lib.o
motor_lib.o: src/motor_lib.c include/motor_lib.h
\t$(CC) $(CFLAGS) -c src/motor_lib.c -o motor_lib.o

# Paso 2: Empaquetar motor_lib.o dentro de la Librería Estática libmotor.a
libmotor.a: motor_lib.o
\t$(AR) rcs libmotor.a motor_lib.o

# Paso 3: Compilar main.c y enlazarlo con libmotor.a
firmware.elf: src/main.c libmotor.a
\t$(CC) $(CFLAGS) -c src/main.c -o main.o
\t$(CC) main.o ${forgetLinkLibBug ? '# (Olvidaste poner -L. -lmotor)' : '-L. -lmotor'} $(LDFLAGS) -o firmware.elf`}
                  </pre>
                )}
              </div>
            </div>

            {/* Right: Live Compiler, Archiver & Linker Output + Memory Map Audit */}
            <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase text-emerald-400">
                  Salida en Vivo del Toolchain (Compilador .o → Archiver .a → Linker .elf)
                </h4>

                {putVarInHeaderBug ? (
                  <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/50 text-xs font-mono text-rose-200 space-y-1.5">
                    <div className="font-bold text-rose-300">❌ ERROR CRÍTICO DEL LINKER (ld):</div>
                    <div>
                      <code>
                        arm-none-eabi-ld: main.o:(.bss.rpm_global+0x0): multiple definition of `rpm_global&apos;;
                        motor_lib.o:(.bss.rpm_global+0x0): first defined here
                      </code>
                    </div>
                    <p className="text-slate-300 font-sans pt-1">
                      <strong>Por qué ocurrió:</strong> Al definir <code>uint32_t rpm_global = 0;</code> en{' '}
                      <code>motor_lib.h</code>, tanto <code>motor_lib.o</code> como <code>main.o</code> crearon una variable global con ese nombre.
                    </p>
                  </div>
                ) : forgetLinkLibBug ? (
                  <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/50 text-xs font-mono text-rose-200 space-y-1.5">
                    <div className="font-bold text-rose-300">❌ ERROR CRÍTICO DEL LINKER (ld):</div>
                    <div>
                      <code>
                        arm-none-eabi-ld: main.o: in function `main&apos;: main.c:(.text.main+0x12): undefined reference to `motor_init&apos;
                      </code>
                    </div>
                    <p className="text-slate-300 font-sans pt-1">
                      <strong>Por qué ocurrió:</strong> <code>main.c</code> compiló bien porque vio el prototipo en{' '}
                      <code>motor_lib.h</code>, pero al enlazar no pasaste <code>motor_lib.o</code> ni <code>-lmotor</code>.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-emerald-950/25 border border-emerald-500/40 text-xs font-mono text-emerald-200 space-y-1">
                    <div className="font-bold text-emerald-300">
                      ✓ COMPILACIÓN Y ENLAZADO EXITOSOS (firmware.elf + firmware.map)
                    </div>
                    <div className="text-[11px] text-slate-300">
                      1. <code>motor_lib.c</code> → <code>motor_lib.o</code> → empaquetado en <code>libmotor.a</code>
                    </div>
                    <div className="text-[11px] text-slate-300">
                      2. <code>main.o</code> + <code>libmotor.a</code> → símbolos resueltos en <code>firmware.elf</code>
                    </div>
                  </div>
                )}

                {/* Memory Map (.map & size) Live Inspector */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2 font-mono text-xs">
                  <div className="text-[11px] font-bold text-amber-300 uppercase">
                    Auditoría de Memoria (arm-none-eabi-size firmware.elf):
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-400">.text + .rodata (Flash)</div>
                      <div className="text-sm font-bold text-cyan-300">
                        {useConstLookupTable ? '2,480 B' : '1,456 B'}
                      </div>
                    </div>
                    <div className="p-2 rounded bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-400">.data (Flash + SRAM)</div>
                      <div className="text-sm font-bold text-amber-300">
                        {useConstLookupTable ? '0 B' : '1,024 B'}
                      </div>
                    </div>
                    <div className="p-2 rounded bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-400">.bss (SRAM en 0)</div>
                      <div className="text-sm font-bold text-emerald-300">28 B</div>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-300 pt-1">
                    {useConstLookupTable ? (
                      <span>
                        Con <code>static const</code>, los 1.024 bytes de <code>CURVA_LINEALIZACION</code> viven en{' '}
                        <strong className="text-cyan-300">.rodata (Flash)</strong>. SRAM total usada: solo{' '}
                        <strong className="text-emerald-300">28 bytes</strong>.
                      </span>
                    ) : (
                      <span>
                        Sin <code>const</code>, la tabla se copia a <strong className="text-rose-300">.data (SRAM)</strong>{' '}
                        al arrancar. SRAM total usada: <strong className="text-rose-300">1.052 bytes</strong>.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-mono">
                Comando para crear una librería estática: <code>arm-none-eabi-ar rcs libmotor.a motor_lib.o</code>
              </div>
            </div>
          </div>

          {/* 2. Union Byte-Packer + 3. Bootloader VTOR Jump Simulator */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Union Serializer & Checksum */}
            <div className="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase text-amber-300">
                2. Serializador Binario en Vivo con <code>union</code> (0 Ciclos de Conversión) + Checksum XOR
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Modifica los campos de la estructura dentro de la <code>union</code> y observa cómo los mismos 4 bytes físicos de RAM se ven automáticamente como un array <code>uint8_t raw_bytes[4]</code> listo para enviar por UART/SPI/CAN:
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div>
                  <label className="text-slate-400 block mb-1">
                    pkt.campos.temp ({(unionTempDecimas / 10).toFixed(1)} °C = {unionTempDecimas}):
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={1000}
                    step={5}
                    value={unionTempDecimas}
                    onChange={(e) => setUnionTempDecimas(Number(e.target.value))}
                    className="w-full accent-amber-400"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">pkt.campos.rpm ({unionRpmVal} RPM):</label>
                  <input
                    type="range"
                    min={0}
                    max={6000}
                    step={50}
                    value={unionRpmVal}
                    onChange={(e) => setUnionRpmVal(Number(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>
              </div>

              {(() => {
                const b0 = unionTempDecimas & 0xff;
                const b1 = (unionTempDecimas >>> 8) & 0xff;
                const b2 = unionRpmVal & 0xff;
                const b3 = (unionRpmVal >>> 8) & 0xff;
                const xorChecksum = (b0 ^ b1 ^ b2 ^ b3) & 0xff;
                return (
                  <div className="grid grid-cols-5 gap-2 font-mono text-center text-xs">
                    {[
                      { label: 'raw[0] (Temp L)', val: b0 },
                      { label: 'raw[1] (Temp H)', val: b1 },
                      { label: 'raw[2] (RPM L)', val: b2 },
                      { label: 'raw[3] (RPM H)', val: b3 },
                      { label: 'Checksum XOR', val: xorChecksum, isCrc: true }
                    ].map((cell, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded-xl border ${
                          cell.isCrc
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                            : 'bg-slate-900 border-slate-800 text-cyan-200'
                        }`}
                      >
                        <div className="text-[10px] opacity-80">{cell.label}</div>
                        <div className="text-sm font-extrabold my-0.5">
                          0x{cell.val.toString(16).toUpperCase().padStart(2, '0')}
                        </div>
                        <div className="text-[10px] text-slate-400">{cell.val}</div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Bootloader Jump & VTOR Relocation Simulator */}
            <div className="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-xs font-bold uppercase text-purple-300">
                  3. Simulador de Bootloader (0x08000000) → Salto a App (0x08008000) y SCB-&gt;VTOR
                </h4>
                <button
                  onClick={() => {
                    setBootloaderUpdatedVtor(!bootloaderUpdatedVtor);
                    setBootloaderPhase('boot');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border ${
                    bootloaderUpdatedVtor
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                      : 'bg-rose-500/20 border-rose-400 text-rose-300'
                  }`}
                >
                  {bootloaderUpdatedVtor
                    ? '✅ Con SCB->VTOR = 0x08008000'
                    : '❌ Olvidar SCB->VTOR (Se queda en 0x08000000)'}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 font-mono text-xs text-center">
                <div
                  className={`p-2.5 rounded-xl border ${
                    bootloaderPhase === 'boot'
                      ? 'bg-cyan-500/25 border-cyan-400 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="text-[10px] text-amber-300">0x08000000 (32 KB)</div>
                  <div className="font-bold mt-0.5">1. Bootloader</div>
                  <div className="text-[10px] mt-1">Verifica CRC32</div>
                </div>

                <div
                  className={`p-2.5 rounded-xl border ${
                    bootloaderPhase === 'running-app'
                      ? 'bg-emerald-500/25 border-emerald-400 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="text-[10px] text-amber-300">0x08008000 (192 KB)</div>
                  <div className="font-bold mt-0.5">2. App Activa</div>
                  <div className="text-[10px] mt-1">MSP + Reset_App()</div>
                </div>

                <div
                  className={`p-2.5 rounded-xl border ${
                    bootloaderPhase === 'irq-fired'
                      ? bootloaderUpdatedVtor
                        ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200'
                        : 'bg-rose-500/30 border-rose-400 text-rose-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="text-[10px] text-amber-300">Evento Asíncrono</div>
                  <div className="font-bold mt-0.5">3. Salta IRQ SysTick</div>
                  <div className="text-[10px] mt-1">
                    VTOR: {bootloaderUpdatedVtor ? '0x08008000' : '0x08000000'}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex gap-2 font-mono text-xs">
                  <button
                    onClick={() => setBootloaderPhase('boot')}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200"
                  >
                    1. Encender Chip
                  </button>
                  <button
                    onClick={() => setBootloaderPhase('running-app')}
                    className="px-2.5 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-400 text-cyan-200 font-bold"
                  >
                    2. Saltar a App (0x08008004)
                  </button>
                  <button
                    onClick={() => setBootloaderPhase('irq-fired')}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 border border-amber-400 text-amber-200 font-bold"
                  >
                    3. Disparar Interrupción
                  </button>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
                {bootloaderPhase === 'boot' && (
                  <span className="text-cyan-300">
                    Bootloader activo en <code>0x08000000</code>: comprueba CRC32 de la App en <code>0x08008000</code>.
                  </span>
                )}
                {bootloaderPhase === 'running-app' && (
                  <span className="text-emerald-300">
                    ¡Salto completado! SP cargado desde <code>0x08008000</code> y ejecutando <code>main()</code> de la App.
                  </span>
                )}
                {bootloaderPhase === 'irq-fired' &&
                  (bootloaderUpdatedVtor ? (
                    <span className="text-emerald-300">
                      ✅ Como actualizaste <code>SCB-&gt;VTOR = 0x08008000</code>, la CPU busca el vector en{' '}
                      <code>0x0800803C</code> y ejecuta el <code>SysTick_Handler</code> de tu Aplicación sin fallos.
                    </span>
                  ) : (
                    <span className="text-rose-300">
                      🔥 ¡CRASH / HARDFAULT! Olvidaste cambiar <code>SCB-&gt;VTOR</code>: la CPU buscó el vector de interrupción en <code>0x0800003C</code> (dentro del Bootloader) en vez de en tu Aplicación.
                    </span>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          LAB 9: NORMATIVA ESPACIAL Y DEFENSA (ECSS-E-ST-40C / Q-ST-80C / NASA JPL) & HARDWARE RAD-HARD
         ===================================================================== */}
      {activeLab === 'space-defense-ecss' && (() => {
        const tmrVoted = ((tmrCopyA & tmrCopyB) | (tmrCopyB & tmrCopyC) | (tmrCopyA & tmrCopyC)) & 0xff;
        const hasBitFlipA = tmrCopyA !== tmrVoted;
        const hasBitFlipB = tmrCopyB !== tmrVoted;
        const hasBitFlipC = tmrCopyC !== tmrVoted;
        const anyDiscrepancy = tmrCopyA !== tmrCopyB || tmrCopyB !== tmrCopyC;

        const freeRamKb = Math.max(0, ecssTotalRamKb - ecssUsedRamKb);
        const marginMemoryPct = ecssTotalRamKb > 0 ? Math.round((freeRamKb * 100) / ecssTotalRamKb) : 0;
        const totalResponseUs = ecssWcetUs + ecssInterfUs + ecssBlockUs;
        const schedFactorPct = ecssDeadlineUs > 0 ? Math.round((totalResponseUs * 100) / ecssDeadlineUs) : 999;

        // MC/DC Independence checks on decision: (A || B) && C
        // Test 1: A=0, B=1, C=1 -> Out=1
        // Test 2: A=0, B=0, C=1 -> Out=0
        // Test 3: A=0, B=1, C=0 -> Out=0
        // Test 4: A=1, B=0, C=1 -> Out=1
        const condAVerified = Boolean(mcdcSelectedTests[2] && mcdcSelectedTests[4]);
        const condBVerified = Boolean(mcdcSelectedTests[1] && mcdcSelectedTests[2]);
        const condCVerified = Boolean(mcdcSelectedTests[1] && mcdcSelectedTests[3]);
        const mcdcPct = Math.round(
          ((Number(condAVerified) + Number(condBVerified) + Number(condCVerified)) / 3) * 100
        );

        const normativeRulesList = [
          {
            level: 'SHALL_NOT' as const,
            badge: 'PROHIBIDO (SHALL NOT)',
            rule: 'Memoria dinámica (malloc, calloc, free) tras la inicialización o fugas de memoria',
            euroRef: 'ECSS-E-ST-40C 5.5.2.5d-e & Annex U.2 #12',
            usRef: 'NASA JPL Rule 3 / MISRA-C 21.3',
            reason: 'Fragmentación determinista imposible de acotar en vuelos de larga duración sin MMU.'
          },
          {
            level: 'SHALL_NOT' as const,
            badge: 'PROHIBIDO (SHALL NOT)',
            rule: 'Recursividad (directa o indirecta) y saltos no estructurados (goto, setjmp/longjmp)',
            euroRef: 'ECSS-Q-ST-80C 6.2.6.2',
            usRef: 'NASA JPL Rule 1 / MISRA-C 17.2',
            reason: 'Impide calcular estáticamente la cota máxima del Stack (riesgo de Stack Overflow catastrófico).'
          },
          {
            level: 'SHALL_NOT' as const,
            badge: 'PROHIBIDO (SHALL NOT)',
            rule: 'Bucles de espera (while) sin límite superior fijo de iteraciones (Timeout Hardware)',
            euroRef: 'ECSS-E-ST-40C Annex U.2 #3',
            usRef: 'NASA JPL Rule 2 (Fixed Loop Bounds)',
            reason: 'Si un periférico o sensor externo falla eléctricamente, un bucle sin cota cuelga el computador de vuelo.'
          },
          {
            level: 'SHALL_NOT' as const,
            badge: 'PROHIBIDO (SHALL NOT)',
            rule: 'Entregar direcciones de variables locales (Stack) a controladores DMA o ISRs asíncronas',
            euroRef: 'ECSS-E-ST-40C Annex U.2 #6 (Lifetime)',
            usRef: 'MISRA-C 18.6 / CERT-C DCL30-C',
            reason: 'Al retornar la función, el marco de pila se reutiliza y el DMA corrompe la memoria activa.'
          },
          {
            level: 'SHALL' as const,
            badge: 'OBLIGATORIO (SHALL)',
            rule: 'Calificar con volatile todo registro MMIO y variable compartida con ISRs + Exclusión Mutua',
            euroRef: 'ECSS-E-ST-40C 5.5.2.5c & Annex U.2 #8, #14',
            usRef: 'BARR-C / CERT-C CON43-C',
            reason: 'Evita que el optimizador (-O2) cachee registros en la CPU y previene condiciones de carrera.'
          },
          {
            level: 'SHALL' as const,
            badge: 'OBLIGATORIO (SHALL)',
            rule: '100% Cobertura MC/DC, Statement y Decision en Categoría A + Pruebas en Frontera (n-1, n, n+1)',
            euroRef: 'ECSS-E-ST-40C 5.5.3.2c & 5.8.3.5b',
            usRef: 'RTCA DO-178C DAL A / NASA-STD-8739.8',
            reason: 'Demuestra que cada condición booleana afecta independientemente a la decisión y valida los límites exactos.'
          },
          {
            level: 'SHALL' as const,
            badge: 'OBLIGATORIO (SHALL)',
            rule: 'Re-ejecutar validación sobre código NO instrumentado y sanitizar memorias con puntero volatile',
            euroRef: 'ECSS-Q-ST-80C 6.2.3.7 & E-ST-40C 5.11.5.6g',
            usRef: 'DO-178C Sec. 6.4 / MIL-STD',
            reason: 'Garantiza que las sondas de test no alteren el WCET real y que el compilador no elimine el borrado de claves.'
          },
          {
            level: 'SHOULD_NOT' as const,
            badge: 'NO SE DEBE (SHOULD NOT)',
            rule: 'Superar 60 líneas por función, usar >1 nivel de puntero (**p) o ignorar valores de retorno',
            euroRef: 'ECSS-Q-ST-80C 6.3.5.12 & Annex U.2 #5, #13',
            usRef: 'NASA JPL Rules 4, 7, 9',
            reason: 'Mantiene la complejidad ciclomática baja y facilita el análisis estático formal al 100%.'
          }
        ].filter((item) => normativeFilter === 'ALL' || item.level === normativeFilter);

        return (
          <div className="p-5 space-y-5">
            <div className="bg-rose-950/25 border border-rose-500/30 rounded-xl p-4 text-xs text-slate-200 leading-relaxed">
              <div className="font-bold text-rose-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" /> Estación Aeroespacial y Defensa: ECSS-E-ST-40C Rev.1 / ECSS-Q-ST-80C Rev.2 (Europa) vs NASA JPL / DO-178C (EE.UU.)
              </div>
              Experimenta en vivo con los tres pilares de un computador de vuelo espacial: <strong>1) Tolerancia a Radiación Cósmica (SEU Bit-Flips) mediante Votación Triple Modular (TMR 2-de-3) y Memory Scrubbing</strong>; <strong>2) Calculadora Oficial de Presupuestos Técnicos ECSS (<code>margin_memory</code> y Factor de Planificabilidad <code>S</code>)</strong>; y <strong>3) Certificador Interactivo de Cobertura <code>100% MC/DC</code> y Auditor Normativo</strong>.
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Station 1: Radiation SEU Bit-Flip, TMR Voter & Scrubbing */}
              <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-xs font-bold uppercase text-cyan-400">
                    1. Simulador de Radiación Cósmica (SEU Bit-Flip), Votador TMR 2-de-3 y Memory Scrubbing
                  </h4>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-500/15 border border-rose-500/40 text-rose-300">
                    SEUs Corregidos por Scrubbing: {seuScrubCount}
                  </span>
                </div>

                <p className="text-xs text-slate-300">
                  Haz clic sobre cualquier bit de las 3 copias en SRAM (<code>copy_a</code>, <code>copy_b</code>, <code>copy_c</code>) o dispara un protón cósmico aleatorio para provocar un <strong>Single Event Upset (SEU)</strong>. Observa cómo la ecuación en C <code>(a &amp; b) | (b &amp; c) | (a &amp; c)</code> mantiene la salida intacta.
                </p>

                <div className="space-y-2.5 font-mono">
                  {[
                    { label: 'SRAM copy_a', val: tmrCopyA, setter: setTmrCopyA, corrupted: hasBitFlipA },
                    { label: 'SRAM copy_b', val: tmrCopyB, setter: setTmrCopyB, corrupted: hasBitFlipB },
                    { label: 'SRAM copy_c', val: tmrCopyC, setter: setTmrCopyC, corrupted: hasBitFlipC }
                  ].map((replica) => (
                    <div
                      key={replica.label}
                      className={`p-2.5 rounded-xl border flex flex-wrap items-center justify-between gap-2 ${
                        replica.corrupted
                          ? 'bg-rose-950/30 border-rose-500/60'
                          : 'bg-slate-900 border-slate-800'
                      }`}
                    >
                      <div>
                        <span className="text-xs font-bold text-white">{replica.label}</span>
                        <span className="ml-2 text-xs text-amber-300">{formatHex(replica.val, 8)}</span>
                        {replica.corrupted && (
                          <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-rose-500/30 text-rose-200 font-bold">
                            ⚠️ SEU Bit-Flip!
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1">
                        {[7, 6, 5, 4, 3, 2, 1, 0].map((bitPos) => {
                          const bitVal = (replica.val >> bitPos) & 1;
                          const votedBit = (tmrVoted >> bitPos) & 1;
                          const isBitFlipped = bitVal !== votedBit;
                          return (
                            <button
                              key={bitPos}
                              onClick={() => replica.setter((prev) => (prev ^ (1 << bitPos)) & 0xff)}
                              title={`Invertir bit ${bitPos} en ${replica.label} (Simular SEU)`}
                              className={`w-7 h-8 rounded text-xs font-bold border transition-all flex flex-col items-center justify-center ${
                                isBitFlipped
                                  ? 'bg-rose-600 text-white border-rose-300 ring-2 ring-rose-400/50'
                                  : bitVal === 1
                                  ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200'
                                  : 'bg-slate-950 border-slate-700 text-slate-400'
                              }`}
                            >
                              <span>{bitVal}</span>
                              <span className="text-[8px] opacity-60">b{bitPos}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* TMR Majority Output Box */}
                <div className="p-3 rounded-xl bg-emerald-950/25 border border-emerald-500/40 flex flex-wrap items-center justify-between gap-3 font-mono">
                  <div>
                    <div className="text-[10px] uppercase text-emerald-300 font-bold">
                      Salida del Votador Mayoritario TMR 2-de-3: (a &amp; b) | (b &amp; c) | (a &amp; c)
                    </div>
                    <div className="text-lg font-extrabold text-white mt-0.5">
                      Valor Votado Entregado a la CPU: <span className="text-emerald-400">{formatHex(tmrVoted, 8)}</span>{' '}
                      <span className="text-xs text-slate-400">
                        (0b{tmrVoted.toString(2).padStart(8, '0')})
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        const whichCopy = Math.floor(Math.random() * 3);
                        const whichBit = Math.floor(Math.random() * 8);
                        if (whichCopy === 0) setTmrCopyA((v) => (v ^ (1 << whichBit)) & 0xff);
                        else if (whichCopy === 1) setTmrCopyB((v) => (v ^ (1 << whichBit)) & 0xff);
                        else setTmrCopyC((v) => (v ^ (1 << whichBit)) & 0xff);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-rose-500/20 border border-rose-400 text-rose-200 text-xs font-bold hover:bg-rose-500/30"
                    >
                      ☄️ Inyectar Protón Cósmico (SEU)
                    </button>
                    <button
                      onClick={() => {
                        if (anyDiscrepancy) {
                          setSeuScrubCount((c) => c + 1);
                        }
                        setTmrCopyA(tmrVoted);
                        setTmrCopyB(tmrVoted);
                        setTmrCopyC(tmrVoted);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/25 border border-emerald-400 text-emerald-200 text-xs font-bold hover:bg-emerald-500/35"
                    >
                      🛡️ Ejecutar Memory Scrubbing (Curar RAM)
                    </button>
                  </div>
                </div>
              </div>

              {/* Station 2: Official ECSS Technical Budgets Calculator (Annex M <5.2> & <5.3>) */}
              <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
                <h4 className="text-xs font-bold uppercase text-amber-300">
                  2. Calculadora Oficial de Presupuestos Técnicos ECSS (ECSS-E-ST-40C Annex M &lt;5.2&gt; y &lt;5.3&gt;)
                </h4>

                {/* Memory Margin Calculator */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">
                      A) Margen de Memoria: <code>margin_memory = free / total</code>
                    </span>
                    <span
                      className={`font-mono font-bold px-2 py-0.5 rounded ${
                        marginMemoryPct >= 50
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : marginMemoryPct >= 25
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      Libre: {marginMemoryPct}% ({freeRamKb} KB)
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <label className="block">
                      <span className="text-slate-400">SRAM Total: {ecssTotalRamKb} KB</span>
                      <input
                        type="range"
                        min={64}
                        max={512}
                        step={32}
                        value={ecssTotalRamKb}
                        onChange={(e) => setEcssTotalRamKb(Number(e.target.value))}
                        className="w-full accent-cyan-400 mt-1"
                      />
                    </label>
                    <label className="block">
                      <span className="text-slate-400">SRAM Usada (.data+.bss+Stack): {ecssUsedRamKb} KB</span>
                      <input
                        type="range"
                        min={16}
                        max={ecssTotalRamKb}
                        step={8}
                        value={ecssUsedRamKb}
                        onChange={(e) => setEcssUsedRamKb(Number(e.target.value))}
                        className="w-full accent-amber-400 mt-1"
                      />
                    </label>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {marginMemoryPct >= 50
                      ? '✅ Cumple el margen preliminar estándar ESA PDR (>= 50% de memoria libre).'
                      : marginMemoryPct >= 25
                      ? '⚠️ Aceptable en fase final CDR (>= 25%), pero insuficiente en fase preliminar PDR.'
                      : '❌ Riesgo crítico de agotamiento de memoria: reduce tablas en RAM usando "const" (.rodata).'}
                  </p>
                </div>

                {/* Schedulability Factor Calculator */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">
                      B) Planificabilidad: <code>S = (C + I + B) / D</code>
                    </span>
                    <span
                      className={`font-mono font-bold px-2 py-0.5 rounded ${
                        schedFactorPct <= 70
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : schedFactorPct <= 100
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      S = {(schedFactorPct / 100).toFixed(2)} ({schedFactorPct}%)
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <label>
                      <span className="text-slate-400">WCET Tarea (C): {ecssWcetUs} µs</span>
                      <input
                        type="range"
                        min={500}
                        max={6000}
                        step={100}
                        value={ecssWcetUs}
                        onChange={(e) => setEcssWcetUs(Number(e.target.value))}
                        className="w-full accent-cyan-400"
                      />
                    </label>
                    <label>
                      <span className="text-slate-400">Interferencia ISR (I): {ecssInterfUs} µs</span>
                      <input
                        type="range"
                        min={0}
                        max={5000}
                        step={100}
                        value={ecssInterfUs}
                        onChange={(e) => setEcssInterfUs(Number(e.target.value))}
                        className="w-full accent-purple-400"
                      />
                    </label>
                    <label>
                      <span className="text-slate-400">Bloqueo Mutex (B): {ecssBlockUs} µs</span>
                      <input
                        type="range"
                        min={0}
                        max={3000}
                        step={100}
                        value={ecssBlockUs}
                        onChange={(e) => setEcssBlockUs(Number(e.target.value))}
                        className="w-full accent-amber-400"
                      />
                    </label>
                    <label>
                      <span className="text-slate-400">Deadline (D): {ecssDeadlineUs} µs</span>
                      <input
                        type="range"
                        min={4000}
                        max={20000}
                        step={500}
                        value={ecssDeadlineUs}
                        onChange={(e) => setEcssDeadlineUs(Number(e.target.value))}
                        className="w-full accent-emerald-400"
                      />
                    </label>
                  </div>

                  <div className="text-[11px] font-mono text-slate-300">
                    Tiempo Peor Caso (C+I+B) = <strong>{totalResponseUs} µs</strong> vs Deadline ={' '}
                    <strong>{ecssDeadlineUs} µs</strong> —{' '}
                    {schedFactorPct <= 100 ? (
                      <span className="text-emerald-300">✅ Tarea Planificable (S &lt;= 1.0)</span>
                    ) : (
                      <span className="text-rose-300">🔥 ¡VIOLACIÓN DE DEADLINE (S &gt; 1.0)!</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Station 3: Interactive 100% MC/DC Inspector & ECSS Annex U.2 vs NASA JPL Auditor */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left: 100% MC/DC Coverage Verifier */}
              <div className="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase text-emerald-400">
                    3. Certificador Interactivo de Cobertura 100% MC/DC (ECSS 5.8.3.5b / DO-178C DAL A)
                  </h4>
                  <span
                    className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded ${
                      mcdcPct === 100
                        ? 'bg-emerald-500/20 border border-emerald-400 text-emerald-300'
                        : 'bg-amber-500/20 border border-amber-400 text-amber-300'
                    }`}
                  >
                    Cobertura MC/DC: {mcdcPct}%
                  </span>
                </div>

                <p className="text-xs text-slate-300">
                  Decisión bajo prueba en C: <code>if ((sensor_A || sensor_B) &amp;&amp; arm_switch_C)</code>. Activa o desactiva los 4 vectores de test (<code>N + 1 = 4</code>) para comprobar cómo se demuestran los <strong>Pares de Independencia MC/DC</strong> de cada condición:
                </p>

                <div className="space-y-1.5 font-mono text-xs">
                  {[
                    { id: 1, a: 0, b: 1, c: 1, out: 1, pairNote: 'Par con #2 (verifica B) y Par con #3 (verifica C)' },
                    { id: 2, a: 0, b: 0, c: 1, out: 0, pairNote: 'Base de comparación para verificar A (con #4) y B (con #1)' },
                    { id: 3, a: 0, b: 1, c: 0, out: 0, pairNote: 'Par con #1: mantiene A=0, B=1 y cambia solo C -> cambia salida' },
                    { id: 4, a: 1, b: 0, c: 1, out: 1, pairNote: 'Par con #2: mantiene B=0, C=1 y cambia solo A -> cambia salida' }
                  ].map((vec) => {
                    const checked = Boolean(mcdcSelectedTests[vec.id]);
                    return (
                      <button
                        key={vec.id}
                        onClick={() =>
                          setMcdcSelectedTests((prev) => ({ ...prev, [vec.id]: !prev[vec.id] }))
                        }
                        className={`w-full text-left p-2 rounded-lg border transition-all flex items-center justify-between gap-2 ${
                          checked
                            ? 'bg-slate-900 border-cyan-500/50 text-slate-100'
                            : 'bg-slate-950/60 border-slate-800 text-slate-500'
                        }`}
                      >
                        <div>
                          <span className="font-bold text-cyan-300">
                            [{checked ? '✓' : ' '}] Test #{vec.id}:
                          </span>{' '}
                          A={vec.a}, B={vec.b}, C={vec.c} &rarr;{' '}
                          <span className={vec.out === 1 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                            Salida={vec.out}
                          </span>
                          <div className="text-[10px] text-slate-400 mt-0.5">{vec.pairNote}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs pt-1">
                  <div
                    className={`p-2 rounded-lg border ${
                      condAVerified
                        ? 'bg-emerald-500/15 border-emerald-400 text-emerald-300'
                        : 'bg-rose-500/15 border-rose-400 text-rose-300'
                    }`}
                  >
                    Condición A: {condAVerified ? '✅ Par (#2,#4)' : '❌ Falta Par'}
                  </div>
                  <div
                    className={`p-2 rounded-lg border ${
                      condBVerified
                        ? 'bg-emerald-500/15 border-emerald-400 text-emerald-300'
                        : 'bg-rose-500/15 border-rose-400 text-rose-300'
                    }`}
                  >
                    Condición B: {condBVerified ? '✅ Par (#1,#2)' : '❌ Falta Par'}
                  </div>
                  <div
                    className={`p-2 rounded-lg border ${
                      condCVerified
                        ? 'bg-emerald-500/15 border-emerald-400 text-emerald-300'
                        : 'bg-rose-500/15 border-rose-400 text-rose-300'
                    }`}
                  >
                    Condición C: {condCVerified ? '✅ Par (#1,#3)' : '❌ Falta Par'}
                  </div>
                </div>
              </div>

              {/* Right: Filterable Normative Checklist (ECSS Annex U.2 vs NASA JPL Power of Ten) */}
              <div className="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-xs font-bold uppercase text-purple-300">
                    4. Matriz Rápida de Auditoría: Qué SE PUEDE / NO SE DEBE / ESTÁ PROHIBIDO
                  </h4>
                  <div className="flex gap-1 text-[10px] font-mono">
                    {[
                      { id: 'ALL' as const, label: 'Todas' },
                      { id: 'SHALL_NOT' as const, label: 'Prohibido (SHALL NOT)' },
                      { id: 'SHALL' as const, label: 'Obligatorio (SHALL)' },
                      { id: 'SHOULD_NOT' as const, label: 'No se debe (SHOULD NOT)' }
                    ].map((btn) => (
                      <button
                        key={btn.id}
                        onClick={() => setNormativeFilter(btn.id)}
                        className={`px-2 py-1 rounded border ${
                          normativeFilter === btn.id
                            ? 'bg-purple-500/25 border-purple-400 text-purple-200 font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {normativeRulesList.map((item, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1">
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                            item.level === 'SHALL_NOT'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : item.level === 'SHALL'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {item.badge}
                        </span>
                        <span className="text-[10px] font-mono text-cyan-300">
                          🇪🇺 {item.euroRef} • 🇺🇸 {item.usRef}
                        </span>
                      </div>
                      <div className="font-semibold text-slate-100">{item.rule}</div>
                      <div className="text-[11px] text-slate-400">{item.reason}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
