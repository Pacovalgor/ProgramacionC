/**
 * @file CSyntaxCodeBlock.tsx
 * @description Componentes de visualización (`CCodeBlock`, `CInlineCode`) y edición interactiva en vivo
 * (`CLiveCodeEditor`) con resaltado de sintaxis estilo IDE profesional (paleta VS Code Dark+ C/C++).
 *
 * Colorea de forma determinista:
 * - Comentarios de línea (`// ...`), de bloque (`/* ... *\/`), ensamblador (`; ...`) y Makefile (`# ...`) -> Verde `#6A9955`
 * - Directivas del preprocesador (`#include`, `#define`, `#ifndef`, `#endif`) -> Púrpura `#C586C0`
 * - Palabras clave de control (`if`, `else`, `while`, `for`, `return`, `switch`) -> Púrpura `#C586C0`
 * - Modificadores de hardware y almacenamiento (`volatile`, `const`, `static`, `struct`, `union`, `typedef`) -> Azul `#569CD6`
 * - Tipos `<stdint.h>` y C (`uint32_t`, `uint16_t`, `uint8_t`, `int8_t`, `void`, `int`, `*_t`) -> Turquesa `#4EC9B0`
 * - Registros MMIO y periféricos (`GPIOA`, `MODER`, `ODR`, `BSRR`, `RCC`, `DDRB`, `PORTB`, `REG`, `sio_hw`) -> Celeste `#4FC1FF`
 * - Literales hexadecimales (`0x40020000UL`), binarios (`0b1010`) y enteros (`1UL`) -> Verde numérico `#B5CEA8` / Ámbar `#FFCC66`
 * - Funciones y rutinas (`main`, `ISR`, etc.) -> Amarillo función `#DCDCAA`
 * - Operadores bit a bit y punteros (`|=`, `&=`, `^=`, `<<`, `>>`, `~`, `->`) -> Cian brillante `#55FFFF`
 */

import React, { useRef } from 'react';

/** Conjunto de palabras clave de control de flujo en C (color `#C586C0` en VS Code Dark+). */
const CONTROL_KEYWORDS = new Set([
  'if',
  'else',
  'for',
  'while',
  'do',
  'switch',
  'case',
  'default',
  'break',
  'continue',
  'return',
  'goto'
]);

/** Conjunto de palabras clave de almacenamiento, calificadores y estructuras en C (color `#569CD6` en VS Code Dark+). */
const STORAGE_KEYWORDS = new Set([
  'volatile',
  'const',
  'static',
  'extern',
  'inline',
  'register',
  'auto',
  'struct',
  'union',
  'enum',
  'typedef',
  'sizeof',
  '__attribute__',
  'packed',
  'aligned',
  'section',
  'weak',
  'interrupt',
  '__IO',
  '__I',
  '__O',
  'true',
  'false',
  'NULL'
]);

/** Conjunto de tipos nativos y estándar `<stdint.h>` en C embebido (color `#4EC9B0` en VS Code Dark+). */
const TYPE_KEYWORDS = new Set([
  'void',
  'char',
  'short',
  'int',
  'long',
  'float',
  'double',
  'signed',
  'unsigned',
  'bool',
  '_Bool',
  'uint8_t',
  'uint16_t',
  'uint32_t',
  'uint64_t',
  'int8_t',
  'int16_t',
  'int32_t',
  'int64_t',
  'size_t',
  'uintptr_t',
  'intptr_t',
  'ptrdiff_t',
  'GPIO_TypeDef',
  'RCC_TypeDef',
  'TIM_TypeDef',
  'ADC_TypeDef',
  'USART_TypeDef',
  'SPI_TypeDef',
  'I2C_TypeDef',
  'SCB_Type',
  'IWDG_TypeDef'
]);

/** Conjunto de registros y periféricos conocidos de los 5 microcontroladores e instrucciones ASM comunes. */
const HARDWARE_REGISTERS = new Set([
  'REG',
  'DDRB',
  'PORTB',
  'PINB',
  'DDRC',
  'PORTC',
  'PINC',
  'DDRD',
  'PORTD',
  'PIND',
  'TCCR0A',
  'TCCR0B',
  'TCNT0',
  'OCR0A',
  'TIMSK0',
  'ADMUX',
  'ADCSRA',
  'ADC',
  'UDR0',
  'UCSR0A',
  'UCSR0B',
  'WDTCSR',
  'SREG',
  'GPIOA',
  'GPIOB',
  'GPIOC',
  'MODER',
  'OTYPER',
  'OSPEEDR',
  'PUPDR',
  'IDR',
  'ODR',
  'BSRR',
  'AFRL',
  'AFRH',
  'RCC',
  'AHB1ENR',
  'APB1ENR',
  'APB2ENR',
  'CR',
  'PLLCFGR',
  'CFGR',
  'TIM2',
  'PSC',
  'ARR',
  'CCR1',
  'CNT',
  'SR',
  'DIER',
  'CR1',
  'ADC1',
  'SQR3',
  'SMPR2',
  'DR',
  'USART2',
  'BRR',
  'IWDG',
  'KR',
  'PR',
  'RLR',
  'SCB',
  'VTOR',
  'AIRCR',
  'NVIC',
  'DMA2',
  'NRF_P0',
  'OUT',
  'OUTSET',
  'OUTCLR',
  'IN',
  'DIR',
  'DIRSET',
  'DIRCLR',
  'PIN_CNF',
  'GPIO',
  'IO_MUX',
  'sio_hw',
  'iobank0_hw',
  'padsbank0_hw'
]);

/** Instrucciones de ensamblador ARM/AVR para colorear bloques de inspección bajo el capó. */
const ASM_INSTRUCTIONS = new Set([
  'ldr',
  'ldrb',
  'ldrh',
  'str',
  'strb',
  'mov',
  'movs',
  'orr',
  'bic',
  'and',
  'eor',
  'cmp',
  'beq',
  'bne',
  'b',
  'bl',
  'bx',
  'push',
  'pop',
  'sbi',
  'cbi',
  'in',
  'out',
  'ldi',
  'sts',
  'lds',
  'rjmp',
  'reti',
  'nop',
  'wfi',
  'cpsid',
  'cpsie'
]);

/**
 * Expresión regular maestra que divide una línea de código C/ASM/Makefile en tokens semánticos
 * manteniendo intactos los espacios y caracteres originales.
 */
const TOKEN_REGEX =
  /(\/\*[\s\S]*?\*\/|\/\/.*$|^\s*#[a-zA-Z_]+|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|<[a-zA-Z0-9_./+-]+\.h>|0[xX][0-9a-fA-F]+[uUlL]*|0[bB][01]+[uUlL]*|\b\d+(?:\.\d+)?[uUlLfF]*\b|\b[a-zA-Z_][a-zA-Z0-9_]*\b|->|<<=?|>>=?|[|&^~!=<>+-]=?|[(){}[\].,:;*?])/gm;

/**
 * Tokeniza y devuelve los nodos React coloreados estilo VS Code Dark+ para todo un bloque de código.
 */
export function highlightCCodeToNodes(code: string): React.ReactNode[] {
  const lines = code.split('\n');

  return lines.map((line, lineIdx) => {
    // Caso especial: línea de comentario Makefile que empieza por '# ' (y no es directiva C)
    if (/^\s*#\s+/.test(line)) {
      return (
        <React.Fragment key={lineIdx}>
          <span className="text-[#6A9955] italic">{line}</span>
          {lineIdx < lines.length - 1 ? '\n' : null}
        </React.Fragment>
      );
    }

    // Si hay comentario de ensamblador '; ...' fuera de C (ej: bloques ASM)
    const nodes: React.ReactNode[] = [];
    let lastIndex = 0;
    const regex = new RegExp(TOKEN_REGEX.source, 'gm');
    let match: RegExpExecArray | null;

    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        nodes.push(line.slice(lastIndex, match.index));
      }

      const token = match[0];
      const afterToken = line.slice(regex.lastIndex);

      if (token.startsWith('//') || token.startsWith('/*')) {
        // Comentario C en verde VS Code
        nodes.push(
          <span key={match.index} className="text-[#6A9955] italic">
            {token}
          </span>
        );
      } else if (/^\s*#[a-zA-Z_]+/.test(token)) {
        // Directiva de preprocesador (#include, #define, #ifndef...)
        nodes.push(
          <span key={match.index} className="text-[#C586C0] font-bold">
            {token}
          </span>
        );
      } else if (
        token.startsWith('"') ||
        token.startsWith("'") ||
        (token.startsWith('<') && token.endsWith('.h>'))
      ) {
        // Literales de cadena, caracteres o cabeceras <stdint.h>
        nodes.push(
          <span key={match.index} className="text-[#CE9178]">
            {token}
          </span>
        );
      } else if (/^0[xX][0-9a-fA-F]+[uUlL]*$/.test(token) || /^0[bB][01]+[uUlL]*$/.test(token)) {
        // Literales hexadecimales (0x40020000UL) y binarios (0b00100000)
        nodes.push(
          <span key={match.index} className="text-[#FFCC66] font-semibold">
            {token}
          </span>
        );
      } else if (/^\d+(?:\.\d+)?[uUlLfF]*$/.test(token)) {
        // Literales numéricos decimales (1UL, 5, 1024)
        nodes.push(
          <span key={match.index} className="text-[#B5CEA8] font-semibold">
            {token}
          </span>
        );
      } else if (CONTROL_KEYWORDS.has(token)) {
        // Palabras clave de control (if, while, for, return...)
        nodes.push(
          <span key={match.index} className="text-[#C586C0] font-bold">
            {token}
          </span>
        );
      } else if (STORAGE_KEYWORDS.has(token)) {
        // Palabras clave de hardware/almacenamiento (volatile, const, static, struct...)
        nodes.push(
          <span key={match.index} className="text-[#569CD6] font-bold">
            {token}
          </span>
        );
      } else if (TYPE_KEYWORDS.has(token) || /_(t|TypeDef|Type)$/.test(token)) {
        // Tipos de datos (uint32_t, uint8_t, void, motor_handle_t...)
        nodes.push(
          <span key={match.index} className="text-[#4EC9B0] font-bold">
            {token}
          </span>
        );
      } else if (
        HARDWARE_REGISTERS.has(token) ||
        (/^[A-Z][A-Z0-9_]{2,}$/.test(token) && !CONTROL_KEYWORDS.has(token))
      ) {
        // Registros MMIO y constantes/macros en mayúsculas (GPIOA, BSRR, MODER, DDRB...)
        nodes.push(
          <span key={match.index} className="text-[#4FC1FF] font-bold">
            {token}
          </span>
        );
      } else if (ASM_INSTRUCTIONS.has(token.toLowerCase()) && /^\s*[a-zA-Z]+/.test(line)) {
        // Mnemónicos de ensamblador cuando el bloque es ASM
        nodes.push(
          <span key={match.index} className="text-[#569CD6] font-bold">
            {token}
          </span>
        );
      } else if (/^\s*\(/.test(afterToken)) {
        // Llamadas o declaraciones de función (main, ISR, motor_init...)
        nodes.push(
          <span key={match.index} className="text-[#DCDCAA] font-semibold">
            {token}
          </span>
        );
      } else if (/^(->|<<=?|>>=?|[|&^~!=<>+-]=?|\*)$/.test(token)) {
        // Operadores bit a bit, desreferencia y flecha de struct
        nodes.push(
          <span key={match.index} className="text-[#55FFFF] font-bold">
            {token}
          </span>
        );
      } else if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(token)) {
        // Variables e identificadores locales
        nodes.push(
          <span key={match.index} className="text-[#9CDCFE]">
            {token}
          </span>
        );
      } else {
        // Paréntesis, llaves, punto y coma
        nodes.push(
          <span key={match.index} className="text-[#FFD700]/90">
            {token}
          </span>
        );
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < line.length) {
      nodes.push(line.slice(lastIndex));
    }

    return (
      <React.Fragment key={lineIdx}>
        {nodes}
        {lineIdx < lines.length - 1 ? '\n' : null}
      </React.Fragment>
    );
  });
}

interface CCodeBlockProps {
  /** Código fuente en C, ensamblador o Makefile a resaltar. */
  code: string;
  /** Título opcional de la pestaña del archivo en la barra superior del visor IDE (ej: `main.c`). */
  title?: string;
  /** Muestra números de línea a la izquierda como en VS Code (por defecto `true`). */
  showLineNumbers?: boolean;
  /** Clases CSS adicionales para el contenedor exterior. */
  className?: string;
}

/**
 * Bloque de código con estética de editor IDE (VS Code Dark+) y numeración de líneas.
 */
export function CCodeBlock({
  code,
  title,
  showLineNumbers = true,
  className = ''
}: CCodeBlockProps) {
  const cleanCode = code.replace(/\n$/, '');
  const lines = cleanCode.split('\n');

  return (
    <div
      className={`ide-code-container bg-[#14161a] border-2 border-[var(--border-strong)] shadow-pixel overflow-hidden ${className}`}
    >
      {title && (
        <div className="bg-[#1f242d] border-b-2 border-[#2d3542] px-3 py-1.5 flex items-center justify-between text-[11px] font-mono">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 bg-[#ff5f56] border border-black" />
            <span className="inline-block w-2.5 h-2.5 bg-[#ffbd2e] border border-black" />
            <span className="inline-block w-2.5 h-2.5 bg-[#27c93f] border border-black" />
            <span className="ml-1 text-[#9CDCFE] font-bold">{title}</span>
          </div>
          <span className="text-[10px] text-[#6A9955] font-pixel">C99 / BARE-METAL</span>
        </div>
      )}

      <div className="flex overflow-x-auto bg-[#14161a] p-3 text-xs sm:text-sm font-mono leading-relaxed">
        {showLineNumbers && (
          <div
            aria-hidden="true"
            className="select-none pr-3 mr-3 border-r border-[#2d3542] text-right text-[#636d83] font-mono shrink-0"
          >
            {lines.map((_, idx) => (
              <div key={idx}>{idx + 1}</div>
            ))}
          </div>
        )}
        <pre className="ide-syntax-pre !bg-transparent !border-0 !shadow-none !p-0 !m-0 text-[#D4D4D4] font-mono leading-relaxed overflow-visible flex-1">
          <code>{highlightCCodeToNodes(cleanCode)}</code>
        </pre>
      </div>
    </div>
  );
}

/**
 * Fragmento compacto de una línea o expresión corta en C coloreada como en VS Code.
 */
export function CInlineCode({ code, className = '' }: { code: string; className?: string }) {
  return (
    <code
      className={`ide-inline-code block font-mono text-[11px] sm:text-xs bg-[#14161a] px-2.5 py-1.5 border border-[#3b4659] text-[#D4D4D4] overflow-x-auto ${className}`}
    >
      {highlightCCodeToNodes(code)}
    </code>
  );
}

interface CLiveCodeEditorProps {
  /** Código C actual en el editor interactivo. */
  value: string;
  /** Callback invocado cada vez que el estudiante modifica el código. */
  onChange: (nextCode: string) => void;
  /** Número de filas visibles del editor. */
  rows?: number;
  /** Nombre del archivo mostrado en la pestaña superior del IDE. */
  fileName?: string;
  /** Texto de ayuda cuando el editor está vacío. */
  placeholder?: string;
}

/**
 * Editor de código C interactivo en tiempo real con resaltado de sintaxis estilo VS Code,
 * numeración de líneas sincronizada y barra de estado inferior.
 */
export function CLiveCodeEditor({
  value,
  onChange,
  rows = 5,
  fileName = 'reto_silicio.c',
  placeholder = 'Escribe tus expresiones en C aquí, ej: REG |= (1UL << 5);'
}: CLiveCodeEditorProps) {
  const preRef = useRef<HTMLPreElement | null>(null);
  const gutterRef = useRef<HTMLDivElement | null>(null);

  const lines = (value || '').split('\n');
  const lineCount = Math.max(lines.length, rows);
  const minHeightPx = rows * 24 + 24;

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    if (preRef.current) {
      preRef.current.scrollTop = target.scrollTop;
      preRef.current.scrollLeft = target.scrollLeft;
    }
    if (gutterRef.current) {
      gutterRef.current.scrollTop = target.scrollTop;
    }
  };

  return (
    <div className="ide-live-editor border-2 border-[var(--border-strong)] bg-[#14161a] shadow-pixel overflow-hidden">
      {/* Barra de pestaña superior estilo VS Code */}
      <div className="bg-[#1f242d] border-b-2 border-[#2d3542] px-3 py-1.5 flex items-center justify-between text-[11px] font-mono">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 bg-[#ff5f56] border border-black" />
          <span className="inline-block w-2.5 h-2.5 bg-[#ffbd2e] border border-black" />
          <span className="inline-block w-2.5 h-2.5 bg-[#27c93f] border border-black" />
          <span className="ml-1 px-2 py-0.5 bg-[#14161a] text-[#4FC1FF] font-bold border-t-2 border-[#55ffff]">
            {fileName}
          </span>
        </div>
        <span className="text-[10px] text-[#B5CEA8] font-pixel">EDITOR C EN VIVO • VS CODE DARK+</span>
      </div>

      {/* Cuerpo del editor con columna de líneas + capa de sintaxis + textarea transparente sincronizado */}
      <div className="relative flex bg-[#14161a]" style={{ minHeight: `${minHeightPx}px` }}>
        {/* Columna izquierda de números de línea */}
        <div
          ref={gutterRef}
          aria-hidden="true"
          className="select-none py-3 px-2.5 bg-[#111317] border-r border-[#2d3542] text-right text-[#636d83] font-mono text-xs sm:text-sm leading-6 overflow-hidden shrink-0"
          style={{ minWidth: '2.75rem' }}
        >
          {Array.from({ length: lineCount }).map((_, idx) => (
            <div key={idx} className="leading-6">
              {idx + 1}
            </div>
          ))}
        </div>

        {/* Superficie de edición superpuesta */}
        <div className="relative flex-1 overflow-hidden">
          <pre
            ref={preRef}
            aria-hidden="true"
            className="ide-syntax-pre pointer-events-none !bg-transparent !border-0 !shadow-none !m-0 p-3 font-mono text-xs sm:text-sm leading-6 text-[#D4D4D4] whitespace-pre overflow-hidden w-full h-full"
            style={{ minHeight: `${minHeightPx}px` }}
          >
            <code>{highlightCCodeToNodes(value + '\n')}</code>
          </pre>

          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onScroll={handleScroll}
            rows={rows}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            placeholder={placeholder}
            className="absolute inset-0 w-full h-full resize-none bg-transparent text-transparent caret-[#55ffff] selection:bg-[#264f78]/70 p-3 font-mono text-xs sm:text-sm leading-6 focus:outline-none whitespace-pre overflow-auto"
            style={{ minHeight: `${minHeightPx}px` }}
          />
        </div>
      </div>

      {/* Barra de estado inferior estilo VS Code */}
      <div className="bg-[#007acc] text-white px-3 py-1 flex items-center justify-between text-[10px] font-mono">
        <div className="flex items-center gap-3">
          <span className="font-bold">C (ISO C99 / Embedded)</span>
          <span>Líneas: {lines.length}</span>
        </div>
        <div className="flex items-center gap-3">
          <span>UTF-8</span>
          <span className="hidden sm:inline">Evaluador Bit a Bit en Tiempo Real</span>
        </div>
      </div>
    </div>
  );
}
