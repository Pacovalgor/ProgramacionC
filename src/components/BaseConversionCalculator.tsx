/**
 * @file BaseConversionCalculator.tsx
 * @description Calculadora interactiva pedagógica de conversión entre Decimal, Binario y Hexadecimal
 * diseñada específicamente para estudiantes de C embebido y arquitectura de microcontroladores.
 *
 * Características pedagógicas:
 * 1. Sincronización bidireccional inmediata en tiempo real: Decimal (con/sin signo), Hexadecimal y Binario.
 * 2. Selector de ancho de palabra de silicio: 8 bits (uint8_t/int8_t), 16 bits (uint16_t/int16_t) y 32 bits (uint32_t/int32_t).
 * 3. Matriz de bits interactiva e interactuable (click para conmutar cada pin/bit individualmente).
 * 4. Desglose en Nibbles (grupos de 4 bits) con su dígito hexadecimal asociado.
 * 5. Visualizador del bit de signo (MSB) y desglose paso a paso del Complemento a Dos.
 * 6. Simulador de operaciones de registro embebido: Desplazamientos (<< 1, >> 1 lógico y aritmético) e inversión bit a bit (~).
 * 7. Presets de silicio típicos (0x00, 0xFF, 0x55, 0xAA, patrón de comprobación de memoria 'walking ones').
 * 8. Orientación estricta a cuaderno físico: muestra el procedimiento paso a paso para transcribir a mano sin áreas de notas digitales.
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
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

type BitWidth = 8 | 16 | 32;

export const BaseConversionCalculator: React.FC = () => {
  const [bitWidth, setBitWidth] = useState<BitWidth>(8);
  const [currentValue, setCurrentValue] = useState<bigint>(BigInt(42));
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  // Mapeo de máscaras y rangos según el ancho de palabra seleccionado
  const maxUnsigned = (BigInt(1) << BigInt(bitWidth)) - BigInt(1);
  const signBitMask = BigInt(1) << BigInt(bitWidth - 1);
  const minSigned = -signBitMask;
  const maxSigned = signBitMask - BigInt(1);

  // Normalizar valor dentro del rango de bits
  const normalizedUnsigned = ((currentValue % (maxUnsigned + BigInt(1))) + (maxUnsigned + BigInt(1))) % (maxUnsigned + BigInt(1));

  // Calcular valor con signo (Complemento a Dos)
  const isNegative = (normalizedUnsigned & signBitMask) !== BigInt(0);
  const signedValue = isNegative
    ? -((maxUnsigned - normalizedUnsigned) + BigInt(1))
    : normalizedUnsigned;

  // Representaciones en string
  const binaryString = normalizedUnsigned.toString(2).padStart(bitWidth, '0');
  const hexPadding = bitWidth / 4;
  const hexString = normalizedUnsigned.toString(16).toUpperCase().padStart(hexPadding, '0');
  const unsignedDecString = normalizedUnsigned.toString(10);
  const signedDecString = signedValue.toString(10);

  // Manejo de cambio desde input Decimal
  const handleDecimalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.trim();
    if (raw === '' || raw === '-') {
      setCurrentValue(BigInt(0));
      return;
    }
    try {
      const val = BigInt(raw);
      setCurrentValue(val);
    } catch {
      // Ignorar entrada inválida temporal
    }
  };

  // Manejo de cambio desde input Hexadecimal
  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.trim().replace(/^0x/i, '');
    if (raw === '') {
      setCurrentValue(BigInt(0));
      return;
    }
    // Filtrar caracteres no hex
    raw = raw.replace(/[^0-9a-fA-F]/g, '');
    try {
      const val = BigInt('0x' + raw);
      setCurrentValue(val);
    } catch {
      // Ignorar entrada inválida
    }
  };

  // Manejo de cambio desde input Binario
  const handleBinaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.trim().replace(/^0b/i, '').replace(/\s+/g, '');
    if (raw === '') {
      setCurrentValue(BigInt(0));
      return;
    }
    raw = raw.replace(/[^01]/g, '');
    try {
      const val = BigInt('0b' + raw);
      setCurrentValue(val);
    } catch {
      // Ignorar
    }
  };

  // Conmutar un bit individual en la cuadrícula de pines
  const toggleBit = (bitIndex: number) => {
    const mask = BigInt(1) << BigInt(bitIndex);
    const newVal = normalizedUnsigned ^ mask;
    setCurrentValue(newVal);
  };

  // Operaciones de registro embebido
  const applyShiftLeft = () => {
    setCurrentValue((normalizedUnsigned << BigInt(1)) & maxUnsigned);
  };

  const applyLogicalShiftRight = () => {
    setCurrentValue(normalizedUnsigned >> BigInt(1));
  };

  const applyArithmeticShiftRight = () => {
    if (isNegative) {
      const shifted = (normalizedUnsigned >> BigInt(1)) | signBitMask;
      setCurrentValue(shifted);
    } else {
      setCurrentValue(normalizedUnsigned >> BigInt(1));
    }
  };

  const applyBitwiseNot = () => {
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

  // Generar IDs únicos y estables para los campos de entrada
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
            SILICIO REAL
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6 bg-slate-950/95 text-slate-100">
        {/* Cabecera explicativa y selector de ancho */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h4 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              Calculadora de Silicio: Decimal ⟷ Binario ⟷ Hexadecimal
            </h4>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Experimenta cómo cada número se descompone en <strong>transistores (bits)</strong>, 
              <strong> nibbles (4 bits / 1 dígito Hex)</strong> y cómo opera el <strong>Complemento a Dos</strong> con signo.
              Escribe en cualquier campo o haz clic directamente sobre los bits para conmutarlos:
            </p>
          </div>

          {/* Selector de Ancho de Palabra (uint8_t, uint16_t, uint32_t) */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700 p-1.5 rounded-xl shrink-0 self-start md:self-center">
            <span className="text-[11px] font-mono text-slate-400 px-2 font-bold flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-cyan-400" /> Tipo C:
            </span>
            {([8, 16, 32] as BitWidth[]).map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => {
                  setBitWidth(w);
                  setCurrentValue((prev) => prev & ((BigInt(1) << BigInt(w)) - BigInt(1)));
                }}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-extrabold transition-all ${
                  bitWidth === w
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/40'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {w} bits ({w === 8 ? 'uint8_t' : w === 16 ? 'uint16_t' : 'uint32_t'})
              </button>
            ))}
          </div>
        </div>

        {/* 3 Inputs interactivos sincronizados: Decimal, Hexadecimal, Binario */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Input Decimal */}
          <div className="bg-slate-900/80 border border-cyan-500/30 rounded-xl p-3.5 relative focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400 transition-all">
            <div className="flex items-center justify-between text-xs font-mono mb-1.5">
              <label htmlFor={decInputId} className="text-cyan-300 font-bold flex items-center gap-1.5 cursor-pointer">
                <Hash className="w-3.5 h-3.5 text-cyan-400" /> Base 10 (Decimal)
              </label>
              <button
                type="button"
                onClick={() => copyToClipboard(unsignedDecString, 'dec')}
                className="text-[10px] text-slate-400 hover:text-cyan-300 flex items-center gap-1"
                title="Copiar decimal sin signo"
              >
                {copiedFormat === 'dec' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedFormat === 'dec' ? 'Copiado' : 'Copiar'}
              </button>
            </div>
            <input
              id={decInputId}
              type="text"
              value={signedValue.toString(10)}
              onChange={handleDecimalChange}
              placeholder={`Ej: ${bitWidth === 8 ? '-5 o 250' : '1024'}`}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-base font-mono font-bold text-white focus:outline-none focus:border-cyan-400"
            />
            <div className="mt-2 text-[11px] font-mono text-slate-400 flex justify-between">
              <span>Sin signo: <strong className="text-amber-300">{unsignedDecString}</strong></span>
              <span>Con signo: <strong className={isNegative ? 'text-rose-400' : 'text-emerald-400'}>{signedDecString}</strong></span>
            </div>
          </div>

          {/* Input Hexadecimal */}
          <div className="bg-slate-900/80 border border-amber-500/30 rounded-xl p-3.5 relative focus-within:border-amber-400 focus-within:ring-1 focus-within:ring-amber-400 transition-all">
            <div className="flex items-center justify-between text-xs font-mono mb-1.5">
              <label htmlFor={hexInputId} className="text-amber-300 font-bold flex items-center gap-1.5 cursor-pointer">
                <Cpu className="w-3.5 h-3.5 text-amber-400" /> Base 16 (Hexadecimal C)
              </label>
              <button
                type="button"
                onClick={() => copyToClipboard(`0x${hexString}`, 'hex')}
                className="text-[10px] text-slate-400 hover:text-amber-300 flex items-center gap-1"
                title="Copiar literal hexadecimal C"
              >
                {copiedFormat === 'hex' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedFormat === 'hex' ? 'Copiado' : 'Copiar'}
              </button>
            </div>
            <div className="flex items-center bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 focus-within:border-amber-400">
              <span className="text-amber-400 font-mono font-bold mr-1 select-none">0x</span>
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
              <span>Literal C: <code className="text-amber-300 font-bold">0x{hexString}</code></span>
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

        {/* Matriz Visual de Bits Interactiva (Click para conmutar) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-xs sm:text-sm font-extrabold text-white">
                Matriz de Transistores / Registros (Haz clic en cualquier bit para conmutar 0 ⟷ 1):
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span> MSB (Bit {bitWidth - 1})
              </span>
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
                    <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
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
                          borderColor = 'border-rose-500 shadow-md shadow-rose-950/60';
                          bgColor = 'bg-rose-500/25 text-rose-300 font-extrabold hover:bg-rose-500/35';
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
                          title={`Bit ${bit.index} (Peso: 2^${bit.index} = ${BigInt(1) << BigInt(bit.index)}) — Clic para alternar`}
                        >
                          <span
                            className={`text-[9px] font-mono font-bold leading-none ${
                              isMsb
                                ? 'text-rose-400'
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
                title="Desplazamiento lógico a la derecha: val >> 1 (Divide sin signo por 2)"
              >
                &gt;&gt; 1 Lógico (/2)
              </button>
              <button
                type="button"
                onClick={applyArithmeticShiftRight}
                className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-amber-950 hover:text-amber-300 border border-slate-700 text-slate-200 text-xs font-mono font-bold transition-all"
                title="Desplazamiento aritmético a la derecha: conserva el bit de signo MSB"
              >
                &gt;&gt; 1 Aritmético
              </button>
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
                onClick={() => setCurrentValue(BigInt(0))}
                className="px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-rose-950 hover:text-rose-300 border border-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1 transition-all"
                title="Poner todo a 0 (Limpiar registro)"
              >
                <RotateCcw className="w-3 h-3" /> Poner a 0
              </button>
              <button
                type="button"
                onClick={() => setCurrentValue(maxUnsigned)}
                className="px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-emerald-950 hover:text-emerald-300 border border-slate-700 text-slate-300 text-xs font-mono transition-all"
                title="Poner todos los bits a 1"
              >
                Poner a 1 (0x{maxUnsigned.toString(16).toUpperCase()})
              </button>
            </div>
          </div>
        </div>

        {/* Panel Didáctico: Desglose de Complemento a Dos y Silicio */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Tarjeta de Complemento a Dos */}
          <div className="lg:col-span-7 bg-slate-900/80 border border-cyan-500/20 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                Análisis de Complemento a Dos en {bitWidth} bits
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                  isNegative
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}
              >
                MSB = {binaryString[0]} ({isNegative ? 'NEGATIVO' : 'POSITIVO'})
              </span>
            </div>

            <div className="text-xs text-slate-300 leading-relaxed space-y-2">
              <p>
                En arquitectura de microcontroladores (ARM Cortex-M, AVR, RISC-V), los números negativos no tienen un símbolo &quot;-&quot; en silicio. 
                Se almacenan aplicando la regla matemática del <strong>Complemento a Dos</strong>:
              </p>

              {isNegative ? (
                <div className="bg-slate-950/90 border border-rose-500/30 rounded-lg p-3 space-y-2 font-mono text-xs">
                  <div className="text-rose-300 font-bold">
                    El valor actual representa un entero negativo en silicio:
                  </div>
                  <div className="text-slate-300">
                    1. Valor absoluto / Magnitud positiva: <span className="text-emerald-400">+{Math.abs(Number(signedValue))}</span> (0b{Math.abs(Number(signedValue)).toString(2).padStart(bitWidth, '0')})
                  </div>
                  <div className="text-slate-300">
                    2. Invertir todos los bits (~): <span className="text-amber-300">0b{(~BigInt(Math.abs(Number(signedValue))) & maxUnsigned).toString(2).padStart(bitWidth, '0')}</span>
                  </div>
                  <div className="text-slate-300">
                    3. Sumar 1 (+1): <span className="text-cyan-300 font-bold">0b{binaryString}</span> = <span className="text-rose-400 font-bold">{signedDecString}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                    💡 Si lees este registro como <code>uint{bitWidth}_t</code> obtienes <strong>{unsignedDecString}</strong>. Si lo interpretas como <code>int{bitWidth}_t</code> obtienes <strong>{signedDecString}</strong>. ¡El silicio tiene exactamente los mismos bits!
                  </div>
                </div>
              ) : (
                <div className="bg-slate-950/90 border border-emerald-500/30 rounded-lg p-3 space-y-1 font-mono text-xs">
                  <div className="text-emerald-300 font-bold">
                    El bit MSB es 0 (Número positivo):
                  </div>
                  <div className="text-slate-300">
                    Como el bit {bitWidth - 1} vale 0, el valor con signo y sin signo coincide: <strong>{unsignedDecString}</strong> (0x{hexString}).
                  </div>
                  <div className="text-[11px] text-slate-400 pt-1">
                    Rango con signo representable en {bitWidth} bits: [<strong>{minSigned.toString()}</strong> .. <strong>+{maxSigned.toString()}</strong>].
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tarjeta de Código C y Presets Típicos de Silicio */}
          <div className="lg:col-span-5 bg-slate-900/80 border border-amber-500/20 rounded-xl p-4 space-y-3 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Valores Clave de Silicio (Presets)
              </div>
              <p className="text-[11px] text-slate-300 mb-3 leading-relaxed">
                Pulsa estos valores recurrentes en hojas de datos (datasheets) y registros de periféricos:
              </p>

              <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setCurrentValue(BigInt(0))}
                  className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/60 text-left hover:bg-slate-800 transition-all"
                >
                  <div className="text-cyan-300 font-bold">0x00</div>
                  <div className="text-[10px] text-slate-400">Todo Ceros (Reset)</div>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentValue(bitWidth === 8 ? BigInt(0xFF) : bitWidth === 16 ? BigInt(0xFFFF) : BigInt(0xFFFFFFFF))}
                  className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-amber-500/60 text-left hover:bg-slate-800 transition-all"
                >
                  <div className="text-amber-300 font-bold">0x{bitWidth === 8 ? 'FF' : bitWidth === 16 ? 'FFFF' : 'FFFFFFFF'}</div>
                  <div className="text-[10px] text-slate-400">Todo Unos (-1 con signo)</div>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentValue(bitWidth === 8 ? BigInt(0x55) : bitWidth === 16 ? BigInt(0x5555) : BigInt(0x55555555))}
                  className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-500/60 text-left hover:bg-slate-800 transition-all"
                >
                  <div className="text-emerald-300 font-bold">0x{bitWidth === 8 ? '55' : bitWidth === 16 ? '5555' : '55555555'}</div>
                  <div className="text-[10px] text-slate-400">Patrón 01010101 (Test RAM)</div>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentValue(bitWidth === 8 ? BigInt(0xAA) : bitWidth === 16 ? BigInt(0xAAAA) : BigInt(0xAAAAAAAA))}
                  className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-purple-500/60 text-left hover:bg-slate-800 transition-all"
                >
                  <div className="text-purple-300 font-bold">0x{bitWidth === 8 ? 'AA' : bitWidth === 16 ? 'AAAA' : 'AAAAAAAA'}</div>
                  <div className="text-[10px] text-slate-400">Patrón 10101010 (Crosstalk)</div>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentValue(signBitMask)}
                  className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-rose-500/60 text-left hover:bg-slate-800 transition-all"
                >
                  <div className="text-rose-300 font-bold">1UL &lt;&lt; {bitWidth - 1}</div>
                  <div className="text-[10px] text-slate-400">Solo Bit Signo ({minSigned.toString()})</div>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentValue(maxSigned)}
                  className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/60 text-left hover:bg-slate-800 transition-all"
                >
                  <div className="text-cyan-300 font-bold">MAX_INT ({maxSigned.toString()})</div>
                  <div className="text-[10px] text-slate-400">Mayor Positivo con Signo</div>
                </button>
              </div>
            </div>

            {/* Equivalente en Declaración C */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-lg p-2.5 font-mono text-[11px] space-y-1">
              <div className="text-slate-400 flex items-center justify-between">
                <span>Cómo se escribe en C:</span>
                <span className="text-cyan-400 font-bold">std_types</span>
              </div>
              <div className="text-emerald-300 font-bold">
                uint{bitWidth}_t reg = 0x{hexString};
              </div>
              <div className="text-amber-300">
                int{bitWidth}_t val = {signedDecString};
              </div>
            </div>
          </div>
        </div>

        {/* Guía para el Cuaderno Físico (Sin campos editables) */}
        <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-4 text-xs space-y-2">
          <div className="flex items-center gap-2 text-amber-300 font-bold">
            <Info className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Procedimiento Manual para tu Cuaderno Físico (Regla de Oro de Exámenes y Entrevistas):</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-200 leading-relaxed pt-1">
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3">
              <strong className="text-amber-200 block mb-1">1. Conversión Binario ⟷ Hexadecimal (Por Nibbles):</strong>
              Agrupa los bits de derecha a izquierda en bloques de exactamente 4 bits (nibbles). Reemplaza cada bloque por su cifra hexadecimal (0..9, A=10, B=11, C=12, D=13, E=14, F=15). ¡Nunca conviertas pasando por decimal!
            </div>
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3">
              <strong className="text-amber-200 block mb-1">2. Cálculo de Negativo a Mano (Complemento a 2):</strong>
              Para codificar un número negativo como <code>-N</code>: primero escribe <code>N</code> en binario positivo, invierte cada 0 por 1 y cada 1 por 0 (operación <code>~N</code>), y finalmente suma 1 a mano al resultado binario.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
