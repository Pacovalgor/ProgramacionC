/**
 * @file BaseConversionCalculator.tsx
 * @description Calculadora interactiva pedagógica de conversión entre Decimal, Binario y Hexadecimal
 * para estudiantes de C embebido y arquitectura de procesadores.
 *
 * Características pedagógicas y arquitectónicas:
 * 1. Soporte explícito para tipos con signo (int8_t, int16_t, int32_t) y sin signo (uint8_t, uint16_t, uint32_t).
 * 2. Comportamiento fiel al estándar C (<stdint.h>) y a la normativa MISRA-C:
 *    - En tipos `uint`: el bit MSB NO es signo, sino magnitud (+128, +32768, +2147483648); no hay números negativos.
 *    - En tipos `int`: el bit MSB es el bit de signo en Complemento a Dos; soporta enteros negativos (-128..+127).
 * 3. Selector inmediato de tipos C agrupados en "Sin Signo (uint)" y "Con Signo (int)".
 * 4. Botón de conmutación directa "¿Cómo ve el silicio este valor en uint vs int?" para entender que los bits son idénticos.
 * 5. Matriz interactiva de bits (clic para alternar transistores) con desglose en Nibbles (grupos de 4 bits).
 * 6. Simulador de operadores C: desplazamientos (<<, >> lógico, >> aritmético) e inversión (~).
 * 7. Presets de silicio adaptados al tipo elegido (0x00, 0xFF, 0x55, 0xAA, MIN_INT, MAX_INT, MAX_UINT, -1).
 * 8. Orientación a cuaderno físico: muestra fórmulas y reglas para transcribir a mano sin áreas de notas digitales.
 */

import React, { useState, useId } from 'react';
import {
  Binary,
  Hash,
  Cpu,
  Layers,
  ArrowRightLeft,
  RotateCcw,
  Sparkles,
  Info,
  Check,
  Copy,
  ShieldCheck,
  Zap,
  HelpCircle
} from 'lucide-react';

export type CIntegerType = 'uint8_t' | 'uint16_t' | 'uint32_t' | 'int8_t' | 'int16_t' | 'int32_t';

interface TypeConfig {
  name: CIntegerType;
  bitWidth: 8 | 16 | 32;
  isSigned: boolean;
  min: bigint;
  max: bigint;
  typicalUsage: string;
}

const TYPE_CONFIGS: Record<CIntegerType, TypeConfig> = {
  'uint8_t': {
    name: 'uint8_t',
    bitWidth: 8,
    isSigned: false,
    min: BigInt(0),
    max: BigInt(255),
    typicalUsage: 'Registros de 8 bits (AVR), bytes de tramas UART/SPI/I2C, contadores cortos.'
  },
  'uint16_t': {
    name: 'uint16_t',
    bitWidth: 16,
    isSigned: false,
    min: BigInt(0),
    max: BigInt(65535),
    typicalUsage: 'Muestras de ADC (10/12/16 bits), registros de recarga de Timers (ARR/PSC).'
  },
  'uint32_t': {
    name: 'uint32_t',
    bitWidth: 32,
    isSigned: false,
    min: BigInt(0),
    max: BigInt('4294967295'),
    typicalUsage: 'Registros de 32 bits (ARM Cortex-M/RISC-V/ESP32), punteros MMIO, ticks de SysTick/FreeRTOS.'
  },
  'int8_t': {
    name: 'int8_t',
    bitWidth: 8,
    isSigned: true,
    min: BigInt(-128),
    max: BigInt(127),
    typicalUsage: 'Offsets pequeños, diferencias de temperatura (-40°C a +125°C), deltas de control.'
  },
  'int16_t': {
    name: 'int16_t',
    bitWidth: 16,
    isSigned: true,
    min: BigInt(-32768),
    max: BigInt(32767),
    typicalUsage: 'Lecturas de acelerómetros y giróscopos IMU (±2g, ±2000°/s), muestras de audio PCM, errores PID.'
  },
  'int32_t': {
    name: 'int32_t',
    bitWidth: 32,
    isSigned: true,
    min: BigInt('-2147483648'),
    max: BigInt('2147483647'),
    typicalUsage: 'Cálculos de odometría, encoders de posición, acumuladores de filtros digitales (DSP/IIR).'
  }
};

export const BaseConversionCalculator: React.FC = () => {
  const [selectedType, setSelectedType] = useState<CIntegerType>('uint8_t');
  const [currentValue, setCurrentValue] = useState<bigint>(BigInt(42));
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [inputErrorNotice, setInputErrorNotice] = useState<string | null>(null);

  const config = TYPE_CONFIGS[selectedType];
  const { bitWidth, isSigned } = config;

  // Mapeo de máscaras de silicio según ancho de bits
  const maxUnsigned = (BigInt(1) << BigInt(bitWidth)) - BigInt(1);
  const signBitMask = BigInt(1) << BigInt(bitWidth - 1);
  const minSigned = -signBitMask;
  const maxSigned = signBitMask - BigInt(1);

  // Normalizar valor dentro del rango estricto de bits del silicio (modulo 2^N)
  const normalizedUnsigned = ((currentValue % (maxUnsigned + BigInt(1))) + (maxUnsigned + BigInt(1))) % (maxUnsigned + BigInt(1));

  // Cálculo del valor con signo (interpretación matemática en Complemento a Dos)
  const msbIsSet = (normalizedUnsigned & signBitMask) !== BigInt(0);
  const signedValue = msbIsSet
    ? -((maxUnsigned - normalizedUnsigned) + BigInt(1))
    : normalizedUnsigned;

  // Valor decimal efectivo según si el tipo seleccionado es signed o unsigned
  const effectiveDecimal = isSigned ? signedValue : normalizedUnsigned;

  // Representaciones textuales canónicas
  const binaryString = normalizedUnsigned.toString(2).padStart(bitWidth, '0');
  const hexPadding = bitWidth / 4;
  const hexString = normalizedUnsigned.toString(16).toUpperCase().padStart(hexPadding, '0');
  const unsignedDecString = normalizedUnsigned.toString(10);
  const signedDecString = signedValue.toString(10);

  // Cambio de tipo de dato
  const handleTypeSelect = (newType: CIntegerType) => {
    setSelectedType(newType);
    setInputErrorNotice(null);
    const newConfig = TYPE_CONFIGS[newType];
    const newMaxUnsigned = (BigInt(1) << BigInt(newConfig.bitWidth)) - BigInt(1);
    setCurrentValue((prev) => prev & newMaxUnsigned);
  };

  // Alternar rápidamente entre contraparte con y sin signo (ej: uint8_t <-> int8_t)
  const toggleSignedness = () => {
    setInputErrorNotice(null);
    if (selectedType === 'uint8_t') setSelectedType('int8_t');
    else if (selectedType === 'int8_t') setSelectedType('uint8_t');
    else if (selectedType === 'uint16_t') setSelectedType('int16_t');
    else if (selectedType === 'int16_t') setSelectedType('uint16_t');
    else if (selectedType === 'uint32_t') setSelectedType('int32_t');
    else if (selectedType === 'int32_t') setSelectedType('uint32_t');
  };

  // Manejo de cambio desde input Decimal
  const handleDecimalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputErrorNotice(null);
    const raw = e.target.value.trim();

    if (raw === '' || raw === '+') {
      setCurrentValue(BigInt(0));
      return;
    }

    if (raw === '-') {
      if (!isSigned) {
        setInputErrorNotice(`⚠️ ${selectedType} es un tipo SIN SIGNO (uint). No admite signo negativo. Cambia a ${selectedType.replace('uint', 'int')} para usar números negativos.`);
        return;
      }
      setCurrentValue(BigInt(0));
      return;
    }

    try {
      const val = BigInt(raw);

      // Verificación de rango según el tipo C activo
      if (!isSigned) {
        if (val < BigInt(0)) {
          setInputErrorNotice(`⚠️ Los tipos "uint" no admiten signo negativo. Para usar ${val}, selecciona la pestaña "Con Signo (int)".`);
          return;
        }
        if (val > maxUnsigned) {
          setInputErrorNotice(`⚠️ Desbordamiento: ${val} supera el máximo de ${selectedType} (${maxUnsigned}).`);
          setCurrentValue(maxUnsigned);
          return;
        }
        setCurrentValue(val);
      } else {
        if (val < minSigned) {
          setInputErrorNotice(`⚠️ Desbordamiento por debajo: ${val} es menor que ${minSigned} (${selectedType}).`);
          setCurrentValue(minSigned);
          return;
        }
        if (val > maxSigned) {
          setInputErrorNotice(`⚠️ Desbordamiento por arriba: ${val} supera ${maxSigned} (${selectedType}).`);
          setCurrentValue(maxSigned);
          return;
        }
        // En Complemento a Dos, si es negativo se normaliza al patrón de bits equivalente
        if (val < BigInt(0)) {
          const bitPattern = (maxUnsigned + BigInt(1)) + val;
          setCurrentValue(bitPattern);
        } else {
          setCurrentValue(val);
        }
      }
    } catch {
      // Ignorar entrada inválida temporal
    }
  };

  // Manejo de cambio desde input Hexadecimal
  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputErrorNotice(null);
    let raw = e.target.value.trim().replace(/^0x/i, '');
    if (raw === '') {
      setCurrentValue(BigInt(0));
      return;
    }
    raw = raw.replace(/[^0-9a-fA-F]/g, '');
    try {
      const val = BigInt('0x' + raw);
      setCurrentValue(val & maxUnsigned);
    } catch {
      // Ignorar entrada inválida
    }
  };

  // Manejo de cambio desde input Binario
  const handleBinaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputErrorNotice(null);
    let raw = e.target.value.trim().replace(/^0b/i, '').replace(/\s+/g, '');
    if (raw === '') {
      setCurrentValue(BigInt(0));
      return;
    }
    raw = raw.replace(/[^01]/g, '');
    try {
      const val = BigInt('0b' + raw);
      setCurrentValue(val & maxUnsigned);
    } catch {
      // Ignorar
    }
  };

  // Conmutar un bit individual en la cuadrícula de pines/transistores
  const toggleBit = (bitIndex: number) => {
    setInputErrorNotice(null);
    const mask = BigInt(1) << BigInt(bitIndex);
    const newVal = normalizedUnsigned ^ mask;
    setCurrentValue(newVal);
  };

  // Operaciones de registro embebido
  const applyShiftLeft = () => {
    setInputErrorNotice(null);
    setCurrentValue((normalizedUnsigned << BigInt(1)) & maxUnsigned);
  };

  const applyLogicalShiftRight = () => {
    setInputErrorNotice(null);
    setCurrentValue(normalizedUnsigned >> BigInt(1));
  };

  const applyArithmeticShiftRight = () => {
    setInputErrorNotice(null);
    if (isSigned && msbIsSet) {
      // Conservar el bit MSB de signo
      const shifted = (normalizedUnsigned >> BigInt(1)) | signBitMask;
      setCurrentValue(shifted);
    } else {
      setCurrentValue(normalizedUnsigned >> BigInt(1));
    }
  };

  const applyBitwiseNot = () => {
    setInputErrorNotice(null);
    setCurrentValue((~normalizedUnsigned) & maxUnsigned);
  };

  // Copiar al portapapeles
  const copyToClipboard = (text: string, formatId: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedFormat(formatId);
    setTimeout(() => setCopiedFormat(null), 1500);
  };

  // Generación de grupos de 4 bits (nibbles) para la cuadrícula visual
  const nibbleCount = bitWidth / 4;
  const nibbles: { nibbleIndex: number; bits: { index: number; value: string }[]; hexChar: string }[] = [];

  for (let n = nibbleCount - 1; n >= 0; n--) {
    const bitsInNibble: { index: number; value: string }[] = [];
    for (let b = 3; b >= 0; b--) {
      const bitIdx = n * 4 + b;
      const bitChar = binaryString[bitWidth - 1 - bitIdx] || '0';
      bitsInNibble.push({ index: bitIdx, value: bitChar });
    }
    const nibbleVal = (normalizedUnsigned >> BigInt(n * 4)) & BigInt(0xF);
    nibbles.push({
      nibbleIndex: n,
      bits: bitsInNibble,
      hexChar: nibbleVal.toString(16).toUpperCase()
    });
  }

  // IDs estables para inputs
  const decInputId = useId();
  const hexInputId = useId();
  const binInputId = useId();

  return (
    <div className="retro-window overflow-hidden border-2 border-cyan-500/50 shadow-2xl shadow-cyan-950/40 my-8">
      {/* Barra de título retro */}
      <div className="retro-titlebar px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs font-pixel bg-gradient-to-r from-slate-900 via-cyan-950/60 to-slate-900 border-b border-cyan-500/30">
        <div className="flex items-center gap-2">
          <Binary className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="text-cyan-300 font-bold tracking-wider">
            ╔══ [ HERRAMIENTA_INTERACTIVA // CONVERSOR_HEX_BIN_DEC_EMBEBIDO ] ══╗
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-amber-300 font-mono font-bold">
            ENTRE CAPÍTULOS 0.1 Y 0.2
          </span>
          <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px] border border-cyan-500/40">
            SILICIO REAL &lt;stdint.h&gt;
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6 bg-slate-950/95 text-slate-100">
        {/* Cabecera explicativa */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h4 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              Calculadora de Silicio: Decimal ⟷ Binario ⟷ Hexadecimal
            </h4>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Comprueba cómo los mismos transistores físicos cambian de significado según si usas un tipo 
              <strong> Sin Signo (uint)</strong> o <strong> Con Signo (int en Complemento a Dos)</strong>.
            </p>
          </div>

          {/* Botón de alternancia rápida uint <-> int */}
          <button
            type="button"
            onClick={toggleSignedness}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-300 hover:bg-amber-500/10 hover:border-amber-400 text-xs font-mono font-bold transition-all shadow-sm shrink-0 self-start lg:self-center"
            title="Alternar entre la versión con signo y sin signo del mismo ancho de bits"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
            <span>Ver mismos bits en {isSigned ? selectedType.replace('int', 'uint') : selectedType.replace('uint', 'int')}</span>
          </button>
        </div>

        {/* SELECTOR DE TIPO C: DIVIDIDO CLARAMENTE EN "SIN SIGNO (uint)" Y "CON SIGNO (int)" */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-cyan-400" />
              Selecciona el Tipo C Exacto de &lt;stdint.h&gt;:
            </span>
            <span className="text-[11px] font-mono text-cyan-400">
              Tipo Activo: <strong className="text-white text-xs">{selectedType}</strong> ({bitWidth} bits, {isSigned ? 'Con Signo / Complemento a 2' : 'Sin Signo / Magnitud Pura'})
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* GRUPO 1: TIPOS SIN SIGNO (uint) */}
            <div className={`p-3 rounded-xl border transition-all ${
              !isSigned 
                ? 'bg-cyan-950/25 border-cyan-500/50 shadow-md shadow-cyan-950/30 ring-1 ring-cyan-500/30' 
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-extrabold text-cyan-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  Tipos Sin Signo (uint) — ¡Sin signo negativo!
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  MSB = Magnitud
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mb-2.5">
                Para registros de hardware, periféricos (GPIO, SPI, UART, ADC) y máscaras de bits.
              </p>
              <div className="grid grid-cols-3 gap-1.5 font-mono text-xs">
                {(['uint8_t', 'uint16_t', 'uint32_t'] as CIntegerType[]).map((t) => {
                  const isActive = selectedType === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleTypeSelect(t)}
                      className={`p-2 rounded-lg font-bold text-center border transition-all ${
                        isActive
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/40'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div>{t}</div>
                      <div className={`text-[9px] font-normal ${isActive ? 'text-slate-900 font-semibold' : 'text-slate-500'}`}>
                        {t === 'uint8_t' ? '0..255' : t === 'uint16_t' ? '0..65k' : '0..4.2G'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* GRUPO 2: TIPOS CON SIGNO (int) */}
            <div className={`p-3 rounded-xl border transition-all ${
              isSigned 
                ? 'bg-amber-950/25 border-amber-500/50 shadow-md shadow-amber-950/30 ring-1 ring-amber-500/30' 
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-extrabold text-amber-300 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-amber-400" />
                  Tipos Con Signo (int) — Complemento a Dos
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  MSB = Signo (-/+)
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mb-2.5">
                Para magnitudes físicas con signo (temperatura, aceleración, errores PID, deltas).
              </p>
              <div className="grid grid-cols-3 gap-1.5 font-mono text-xs">
                {(['int8_t', 'int16_t', 'int32_t'] as CIntegerType[]).map((t) => {
                  const isActive = selectedType === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleTypeSelect(t)}
                      className={`p-2 rounded-lg font-bold text-center border transition-all ${
                        isActive
                          ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md shadow-amber-400/40'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div>{t}</div>
                      <div className={`text-[9px] font-normal ${isActive ? 'text-slate-900 font-semibold' : 'text-slate-500'}`}>
                        {t === 'int8_t' ? '-128..+127' : t === 'int16_t' ? '±32k' : '±2.1G'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-300 bg-slate-950/80 border border-slate-800 rounded-lg p-2.5 flex items-start gap-2">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <strong>Uso habitual de {selectedType}:</strong> {config.typicalUsage}
              <span className="text-slate-400 ml-1">Rango representable: [<strong>{config.min.toString()}</strong> .. <strong>+{config.max.toString()}</strong>].</span>
            </div>
          </div>
        </div>

        {/* Aviso de error o restricción de tipo si el usuario intenta algo no soportado */}
        {inputErrorNotice && (
          <div className="bg-rose-950/30 border border-rose-500/50 rounded-xl p-3 text-xs text-rose-300 flex items-center justify-between gap-2 animate-fadeIn">
            <div className="flex items-center gap-2">
              <span className="font-bold">Nota de Tipo:</span> {inputErrorNotice}
            </div>
            <button
              type="button"
              onClick={() => setInputErrorNotice(null)}
              className="text-xs text-rose-400 hover:text-white underline font-mono shrink-0"
            >
              Entendido
            </button>
          </div>
        )}

        {/* 3 INPUTS INTERACTIVOS SINCRONIZADOS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Input Decimal */}
          <div className={`bg-slate-900/80 border rounded-xl p-3.5 relative transition-all ${
            isSigned 
              ? 'border-amber-500/30 focus-within:border-amber-400 focus-within:ring-1 focus-within:ring-amber-400' 
              : 'border-cyan-500/30 focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400'
          }`}>
            <div className="flex items-center justify-between text-xs font-mono mb-1.5">
              <label htmlFor={decInputId} className="font-bold flex items-center gap-1.5 cursor-pointer text-white">
                <Hash className={`w-3.5 h-3.5 ${isSigned ? 'text-amber-400' : 'text-cyan-400'}`} />
                Base 10 Decimal {isSigned ? '(Con Signo)' : '(Sin Signo uint)'}
              </label>
              <button
                type="button"
                onClick={() => copyToClipboard(effectiveDecimal.toString(), 'dec')}
                className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
                title="Copiar decimal"
              >
                {copiedFormat === 'dec' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedFormat === 'dec' ? 'Copiado' : 'Copiar'}
              </button>
            </div>
            <input
              id={decInputId}
              type="text"
              value={effectiveDecimal.toString()}
              onChange={handleDecimalChange}
              placeholder={isSigned ? `Ej: -5, 42, ${config.min}` : `Ej: 0, 42, ${config.max}`}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-base font-mono font-bold text-white focus:outline-none focus:border-cyan-400"
            />
            <div className="mt-2 text-[11px] font-mono text-slate-400 flex justify-between">
              <span>Tipo activo: <strong className={isSigned ? 'text-amber-300' : 'text-cyan-300'}>{selectedType}</strong></span>
              <span>
                {isSigned ? (
                  <span>Signo: <strong className={msbIsSet ? 'text-rose-400' : 'text-emerald-400'}>{msbIsSet ? 'NEGATIVO (-)' : 'POSITIVO (+)'}</strong></span>
                ) : (
                  <span className="text-slate-400">Sin signo (0..{config.max.toString()})</span>
                )}
              </span>
            </div>
          </div>

          {/* Input Hexadecimal */}
          <div className="bg-slate-900/80 border border-purple-500/30 rounded-xl p-3.5 relative focus-within:border-purple-400 focus-within:ring-1 focus-within:ring-purple-400 transition-all">
            <div className="flex items-center justify-between text-xs font-mono mb-1.5">
              <label htmlFor={hexInputId} className="text-purple-300 font-bold flex items-center gap-1.5 cursor-pointer">
                <Cpu className="w-3.5 h-3.5 text-purple-400" /> Base 16 (Hexadecimal C)
              </label>
              <button
                type="button"
                onClick={() => copyToClipboard(`0x${hexString}`, 'hex')}
                className="text-[10px] text-slate-400 hover:text-purple-300 flex items-center gap-1"
                title="Copiar literal hexadecimal C"
              >
                {copiedFormat === 'hex' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedFormat === 'hex' ? 'Copiado' : 'Copiar'}
              </button>
            </div>
            <div className="flex items-center bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 focus-within:border-purple-400">
              <span className="text-purple-400 font-mono font-bold mr-1 select-none">0x</span>
              <input
                id={hexInputId}
                type="text"
                value={hexString}
                onChange={handleHexChange}
                placeholder="2A"
                maxLength={bitWidth / 4}
                className="w-full bg-transparent font-mono font-bold text-base text-white focus:outline-none uppercase"
              />
            </div>
            <div className="mt-2 text-[11px] font-mono text-slate-400 flex justify-between">
              <span>Literal C: <code className="text-purple-300 font-bold">0x{hexString}</code></span>
              <span>Nibbles: <strong className="text-slate-300">{nibbleCount}</strong></span>
            </div>
          </div>

          {/* Input Binario */}
          <div className="bg-slate-900/80 border border-emerald-500/30 rounded-xl p-3.5 relative focus-within:border-emerald-400 focus-within:ring-1 focus-within:ring-emerald-400 transition-all">
            <div className="flex items-center justify-between text-xs font-mono mb-1.5">
              <label htmlFor={binInputId} className="text-emerald-300 font-bold flex items-center gap-1.5 cursor-pointer">
                <Binary className="w-3.5 h-3.5 text-emerald-400" /> Base 2 (Binario Puro)
              </label>
              <button
                type="button"
                onClick={() => copyToClipboard(`0b${binaryString}`, 'bin')}
                className="text-[10px] text-slate-400 hover:text-emerald-300 flex items-center gap-1"
                title="Copiar literal binario C"
              >
                {copiedFormat === 'bin' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedFormat === 'bin' ? 'Copiado' : 'Copiar'}
              </button>
            </div>
            <div className="flex items-center bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 focus-within:border-emerald-400">
              <span className="text-emerald-400 font-mono font-bold mr-1 select-none">0b</span>
              <input
                id={binInputId}
                type="text"
                value={binaryString}
                onChange={handleBinaryChange}
                placeholder="00101010"
                maxLength={bitWidth}
                className="w-full bg-transparent font-mono font-bold text-sm sm:text-base text-white focus:outline-none tracking-widest"
              />
            </div>
            <div className="mt-2 text-[11px] font-mono text-slate-400 flex justify-between">
              <span>Literal GCC: <code className="text-emerald-300 font-bold">0b{binaryString}</code></span>
              <span>Longitud: <strong className="text-slate-300">{bitWidth} bits</strong></span>
            </div>
          </div>
        </div>

        {/* MATRIZ DE BITS / TRANSISTORES INTERACTIVA */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-xs sm:text-sm font-extrabold text-white">
                Matriz de Transistores / Registros ({selectedType}):
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              {isSigned ? (
                <span className="flex items-center gap-1 text-slate-300">
                  <span className={`w-2.5 h-2.5 rounded-full inline-block ${msbIsSet ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
                  MSB (Bit {bitWidth - 1} de Signo: {msbIsSet ? 'NEGATIVO' : 'POSITIVO'})
                </span>
              ) : (
                <span className="flex items-center gap-1 text-cyan-300 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block"></span>
                  MSB (Bit {bitWidth - 1}: Magnitud pura +{signBitMask.toString()})
                </span>
              )}
              <span className="flex items-center gap-1 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> LSB (Bit 0)
              </span>
            </div>
          </div>

          {/* Cuadrícula de Nibbles y Bits */}
          <div className="overflow-x-auto pb-2">
            <div className="flex items-center justify-start sm:justify-center gap-2 sm:gap-3 min-w-max p-2 bg-slate-950/80 rounded-xl border border-slate-800/80">
              {nibbles.map((nibble) => (
                <div
                  key={nibble.nibbleIndex}
                  className="flex flex-col items-center bg-slate-900/80 border border-slate-700/80 rounded-xl p-2 sm:p-2.5 shadow-sm"
                >
                  {/* Encabezado del Nibble con su dígito Hex */}
                  <div className="text-[10px] font-mono text-cyan-400 mb-1.5 flex items-center gap-1 font-bold">
                    <span>Nibble {nibble.nibbleIndex}</span>
                    <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-mono">
                      = 0x{nibble.hexChar}
                    </span>
                  </div>

                  {/* 4 Bits del Nibble */}
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    {nibble.bits.map((bit) => {
                      const isBitSet = bit.value === '1';
                      const isMsb = bit.index === bitWidth - 1;
                      const isLsb = bit.index === 0;

                      let borderColor = 'border-slate-700';
                      let bgColor = 'bg-slate-950 text-slate-500 hover:border-slate-500';

                      if (isBitSet) {
                        if (isMsb) {
                          if (isSigned) {
                            borderColor = 'border-rose-500 shadow-md shadow-rose-950/60';
                            bgColor = 'bg-rose-500/25 text-rose-300 font-extrabold hover:bg-rose-500/35';
                          } else {
                            borderColor = 'border-cyan-400 shadow-md shadow-cyan-950/60';
                            bgColor = 'bg-cyan-500/25 text-cyan-300 font-extrabold hover:bg-cyan-500/35';
                          }
                        } else {
                          borderColor = 'border-emerald-500 shadow-md shadow-emerald-950/60';
                          bgColor = 'bg-emerald-500/25 text-emerald-300 font-extrabold hover:bg-emerald-500/35';
                        }
                      }

                      return (
                        <button
                          key={bit.index}
                          type="button"
                          onClick={() => toggleBit(bit.index)}
                          className={`w-8 h-12 sm:w-9 sm:h-14 rounded-lg border flex flex-col items-center justify-between p-1 transition-all select-none cursor-pointer group ${borderColor} ${bgColor}`}
                          title={`Bit ${bit.index} (Peso: 2^${bit.index} = ${BigInt(1) << BigInt(bit.index)}) — ${isMsb ? (isSigned ? 'Bit de Signo' : 'MSB Magnitud') : 'Magnitud'}`}
                        >
                          <span
                            className={`text-[9px] font-mono font-bold leading-none ${
                              isMsb
                                ? isSigned ? 'text-rose-400' : 'text-cyan-400'
                                : isLsb
                                ? 'text-emerald-400'
                                : 'text-slate-400 group-hover:text-cyan-300'
                            }`}
                          >
                            b{bit.index}
                          </span>

                          <span className="text-base sm:text-lg font-mono font-black leading-none">
                            {bit.value}
                          </span>

                          <span className="w-1.5 h-1.5 rounded-full transition-all duration-300 bg-current opacity-70"></span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Operaciones rápidas de Registro Embebido */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
              <span className="text-slate-400 text-[11px] font-bold mr-1 flex items-center gap-1">
                <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400" /> Operadores C:
              </span>
              <button
                type="button"
                onClick={applyShiftLeft}
                className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-cyan-950 hover:text-cyan-300 border border-slate-700 text-slate-200 text-xs font-mono font-bold transition-all"
                title="Desplazamiento a la izquierda: val << 1 (Multiplica por 2)"
              >
                &lt;&lt; 1 (*2)
              </button>
              <button
                type="button"
                onClick={applyLogicalShiftRight}
                className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-cyan-950 hover:text-cyan-300 border border-slate-700 text-slate-200 text-xs font-mono font-bold transition-all"
                title="Desplazamiento lógico a la derecha: val >> 1 (Introduce 0 por la izquierda)"
              >
                &gt;&gt; 1 Lógico (/2)
              </button>
              {isSigned && (
                <button
                  type="button"
                  onClick={applyArithmeticShiftRight}
                  className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-amber-950 hover:text-amber-300 border border-slate-700 text-slate-200 text-xs font-mono font-bold transition-all"
                  title="Desplazamiento aritmético a la derecha: conserva el bit de signo MSB"
                >
                  &gt;&gt; 1 Aritmético (Conserva Signo)
                </button>
              )}
              <button
                type="button"
                onClick={applyBitwiseNot}
                className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-emerald-950 hover:text-emerald-300 border border-slate-700 text-slate-200 text-xs font-mono font-bold transition-all"
                title="Inversión bit a bit NOT: ~val"
              >
                ~ Invertir (NOT)
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setInputErrorNotice(null);
                  setCurrentValue(BigInt(0));
                }}
                className="px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-rose-950 hover:text-rose-300 border border-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1 transition-all"
                title="Poner todo a 0 (Limpiar registro)"
              >
                <RotateCcw className="w-3 h-3" /> Poner a 0
              </button>
              <button
                type="button"
                onClick={() => {
                  setInputErrorNotice(null);
                  setCurrentValue(maxUnsigned);
                }}
                className="px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-emerald-950 hover:text-emerald-300 border border-slate-700 text-slate-300 text-xs font-mono transition-all"
                title="Poner todos los bits a 1"
              >
                Poner a 1 (0x{maxUnsigned.toString(16).toUpperCase()})
              </button>
            </div>
          </div>
        </div>

        {/* COMPARADOR Y ANÁLISIS DE ARQUITECTURA: UINT VS INT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Tarjeta de interpretación de silicio */}
          <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                ¿Cómo interpreta el Microcontrolador este patrón de {bitWidth} bits?
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                0x{hexString} • 0b{binaryString}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono text-xs">
              {/* Vista como uint */}
              <div className={`p-3 rounded-xl border ${
                !isSigned
                  ? 'bg-cyan-950/30 border-cyan-500/50 text-cyan-200 ring-1 ring-cyan-500/40'
                  : 'bg-slate-950/70 border-slate-800 text-slate-300'
              }`}>
                <div className="text-[11px] font-extrabold text-cyan-400 mb-1 flex items-center justify-between">
                  <span>uint{bitWidth}_t (Sin Signo):</span>
                  {!isSigned && <span className="text-[9px] px-1.5 rounded bg-cyan-500/30 text-cyan-300">ACTIVO</span>}
                </div>
                <div className="text-lg font-black text-white">{unsignedDecString}</div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Magnitud pura. Bit {bitWidth - 1} aporta <strong>+{signBitMask.toString()}</strong>. Rango: 0..{maxUnsigned.toString()}.
                </div>
              </div>

              {/* Vista como int */}
              <div className={`p-3 rounded-xl border ${
                isSigned
                  ? 'bg-amber-950/30 border-amber-500/50 text-amber-200 ring-1 ring-amber-500/40'
                  : 'bg-slate-950/70 border-slate-800 text-slate-300'
              }`}>
                <div className="text-[11px] font-extrabold text-amber-400 mb-1 flex items-center justify-between">
                  <span>int{bitWidth}_t (Con Signo):</span>
                  {isSigned && <span className="text-[9px] px-1.5 rounded bg-amber-500/30 text-amber-300">ACTIVO</span>}
                </div>
                <div className={`text-lg font-black ${msbIsSet ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {signedDecString}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Complemento a Dos. Bit {bitWidth - 1} = <strong>{msbIsSet ? '1 (Negativo)' : '0 (Positivo)'}</strong>. Rango: {minSigned.toString()}..+{maxSigned.toString()}.
                </div>
              </div>
            </div>

            {/* Explicación según el modo actual */}
            {isSigned ? (
              <div className="bg-slate-950/90 border border-amber-500/30 rounded-lg p-3 space-y-2 text-xs">
                <div className="font-bold text-amber-300">
                  {msbIsSet ? '📐 Desglose de Complemento a Dos para este número negativo:' : '📐 El bit MSB es 0 (Número positivo):'}
                </div>
                {msbIsSet ? (
                  <div className="space-y-1 font-mono text-[11px] text-slate-300">
                    <div>1. Valor positivo correspondiente: <span className="text-emerald-400">+{Math.abs(Number(signedValue))}</span></div>
                    <div>2. Invertir bits (~): <span className="text-amber-300">0b{(~BigInt(Math.abs(Number(signedValue))) & maxUnsigned).toString(2).padStart(bitWidth, '0')}</span></div>
                    <div>3. Sumar 1 (+1): <span className="text-cyan-300 font-bold">0b{binaryString}</span> = <span className="text-rose-400 font-bold">{signedDecString}</span></div>
                  </div>
                ) : (
                  <p className="text-slate-300 text-xs">
                    Como el bit {bitWidth - 1} es 0, no hay polaridad negativa: el valor coincide exactamente con el valor sin signo (<strong>{unsignedDecString}</strong>).
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-slate-950/90 border border-cyan-500/30 rounded-lg p-3 space-y-1.5 text-xs text-slate-300">
                <div className="font-bold text-cyan-300">
                  🛡️ Regla de Oro MISRA-C 10.1 &amp; Sistemas Embebidos:
                </div>
                <p>
                  En <code>uint{bitWidth}_t</code> no existe el concepto de signo. Todos los bits son positivos. 
                  Por eso, <strong>todos los registros de microcontroladores (GPIO, UART, DMA, PLL) son uint32_t o uint8_t</strong>: 
                  un registro no puede ser &quot;negativo&quot;, es simplemente un mapa de 32 o 8 interruptores físicos.
                </p>
              </div>
            )}
          </div>

          {/* Tarjeta de Código C y Presets Típicos adaptados al tipo */}
          <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Valores Clave para {selectedType}
              </div>
              <p className="text-[11px] text-slate-300 mb-3 leading-relaxed">
                Haz clic para cargar patrones estándar de silicio en {selectedType}:
              </p>

              <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => {
                    setInputErrorNotice(null);
                    setCurrentValue(BigInt(0));
                  }}
                  className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/60 text-left hover:bg-slate-800 transition-all"
                >
                  <div className="text-cyan-300 font-bold">0x00</div>
                  <div className="text-[10px] text-slate-400">Cero (Estado Reset)</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setInputErrorNotice(null);
                    setCurrentValue(maxUnsigned);
                  }}
                  className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-amber-500/60 text-left hover:bg-slate-800 transition-all"
                >
                  <div className="text-amber-300 font-bold">0x{hexString.length > 0 ? maxUnsigned.toString(16).toUpperCase() : 'FF'}</div>
                  <div className="text-[10px] text-slate-400">{isSigned ? '-1 (Todo unos)' : `MAX (${maxUnsigned})`}</div>
                </button>

                {isSigned ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setInputErrorNotice(null);
                        setCurrentValue(signBitMask);
                      }}
                      className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-rose-500/60 text-left hover:bg-slate-800 transition-all"
                    >
                      <div className="text-rose-300 font-bold">MIN_INT ({minSigned.toString()})</div>
                      <div className="text-[10px] text-slate-400">Solo bit de signo a 1</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setInputErrorNotice(null);
                        setCurrentValue(maxSigned);
                      }}
                      className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-500/60 text-left hover:bg-slate-800 transition-all"
                    >
                      <div className="text-emerald-300 font-bold">MAX_INT (+{maxSigned.toString()})</div>
                      <div className="text-[10px] text-slate-400">Mayor entero positivo</div>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setInputErrorNotice(null);
                        setCurrentValue(signBitMask);
                      }}
                      className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/60 text-left hover:bg-slate-800 transition-all"
                    >
                      <div className="text-cyan-300 font-bold">1UL &lt;&lt; {bitWidth - 1}</div>
                      <div className="text-[10px] text-slate-400">Bit MSB = +{signBitMask.toString()}</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setInputErrorNotice(null);
                        setCurrentValue(maxUnsigned / BigInt(2));
                      }}
                      className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-purple-500/60 text-left hover:bg-slate-800 transition-all"
                    >
                      <div className="text-purple-300 font-bold">Mitad ({(maxUnsigned / BigInt(2)).toString()})</div>
                      <div className="text-[10px] text-slate-400">0x{(maxUnsigned / BigInt(2)).toString(16).toUpperCase()}</div>
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setInputErrorNotice(null);
                    setCurrentValue(bitWidth === 8 ? BigInt(0x55) : bitWidth === 16 ? BigInt(0x5555) : BigInt('0x55555555'));
                  }}
                  className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-500/60 text-left hover:bg-slate-800 transition-all"
                >
                  <div className="text-emerald-300 font-bold">0x{bitWidth === 8 ? '55' : bitWidth === 16 ? '5555' : '55555555'}</div>
                  <div className="text-[10px] text-slate-400">Patrón 01010101 (Test RAM)</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setInputErrorNotice(null);
                    setCurrentValue(bitWidth === 8 ? BigInt(0xAA) : bitWidth === 16 ? BigInt(0xAAAA) : BigInt('0xAAAAAAAA'));
                  }}
                  className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-purple-500/60 text-left hover:bg-slate-800 transition-all"
                >
                  <div className="text-purple-300 font-bold">0x{bitWidth === 8 ? 'AA' : bitWidth === 16 ? 'AAAA' : 'AAAAAAAA'}</div>
                  <div className="text-[10px] text-slate-400">Patrón 10101010 (Crosstalk)</div>
                </button>
              </div>
            </div>

            {/* Declaración canónica en C */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-lg p-2.5 font-mono text-[11px] space-y-1">
              <div className="text-slate-400 flex items-center justify-between">
                <span>Declaración en C Embebido:</span>
                <span className="text-cyan-400 font-bold">&lt;stdint.h&gt;</span>
              </div>
              <div className="text-emerald-300 font-bold">
                {selectedType} valor = {isSigned ? signedDecString : `0x${hexString}`};
              </div>
              <div className="text-slate-400 text-[10px]">
                Literal hexadecimal: <code className="text-purple-300">0x{hexString}</code> • Binario: <code className="text-emerald-300">0b{binaryString}</code>
              </div>
            </div>
          </div>
        </div>

        {/* Guía para el Cuaderno Físico (Sin campos de edición) */}
        <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-4 text-xs space-y-2">
          <div className="flex items-center gap-2 text-amber-300 font-bold">
            <Info className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Reglas de Silicio para tu Cuaderno Físico (Entrevistas de Firmware &amp; MISRA-C):</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-200 leading-relaxed pt-1">
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3">
              <strong className="text-cyan-300 block mb-1">1. ¿Por qué los registros siempre son uint?:</strong>
              Un pin o un periférico solo conoce voltajes (0V o 3.3V). Nunca uses <code>int</code> para registros o máscaras de bits: en C, el desbordamiento con signo (signed overflow) es Comportamiento Indefinido (UB), mientras que en <code>uint</code> el estándar garantiza aritmética modular módulo $2^N$.
            </div>
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3">
              <strong className="text-amber-300 block mb-1">2. Los transistores no tienen signo:</strong>
              El patrón de bits <code>0xFF</code> en 8 transistores es exactamente el mismo si lo lees como <code>uint8_t</code> (vale 255) o como <code>int8_t</code> (vale -1). El signo es una interpretación matemática del compilador, no una propiedad física de la celda de memoria.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
