/**
 * @file CheatSheetsCatalog.tsx
 * @description Catálogo de Fichas Técnicas de Síntesis ("Cheat Sheets" Imprimibles de 1 Página).
 *
 * Proporciona láminas de referencia rápida para los 5 microcontroladores del catálogo:
 * - ATmega328P (8-bit AVR RISC)
 * - STM32F401RE (32-bit ARM Cortex-M4F)
 * - ESP32-C3 (32-bit RISC-V RV32IMC)
 * - nRF52840 (32-bit ARM Cortex-M4F + BLE)
 * - RP2040 (Dual 32-bit ARM Cortex-M0+ + PIO)
 *
 * Cada ficha incluye:
 * 1. Mapa de Memoria de Silicio (Flash, SRAM, MMIO, Boot ROM).
 * 2. Registros GPIO Canónicos con Acceso Atómico (Set/Clear sin carreras).
 * 3. Tabla Universal de Equivalencias entre los 5 Chips.
 * 4. Fórmulas de Temporización & Baudrate UART.
 * 5. Parámetros Eléctricos Críticos (Corrientes máx, VDD, Pull-ups).
 *
 * Optimizado para impresión física en 1 página A4 (`window.print()`).
 */

import React, { useState } from 'react';
import {
  Printer,
  X,
  Cpu,
  Binary,
  Layers,
  Zap,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { MCU_CATALOG, MCUId, MCUProfile } from '../data/mcusData';

interface CheatSheetsCatalogProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMcuId?: MCUId;
}

export const CheatSheetsCatalog: React.FC<CheatSheetsCatalogProps> = ({
  isOpen,
  onClose,
  defaultMcuId = 'stm32f401'
}) => {
  const [selectedMcuId, setSelectedMcuId] = useState<MCUId>(defaultMcuId);

  if (!isOpen) return null;

  const mcu = MCU_CATALOG[selectedMcuId];

  // Specific memory & register data for the cheat sheet
  const cheatDataByMcu: Record<
    MCUId,
    {
      flashRange: string;
      sramRange: string;
      periphBase: string;
      gpioRegs: { name: string; offset: string; function: string; atomic: boolean }[];
      uartFormula: string;
      timerFormula: string;
      maxPinCurrent: string;
      pullUpRange: string;
      uniqueAdvantage: string;
    }
  > = {
    atmega328p: {
      flashRange: '0x0000 - 0x7FFF (32 KB)',
      sramRange: '0x0100 - 0x08FF (2 KB)',
      periphBase: '0x0020 - 0x005F (I/O) / 0x0060 - 0x00FF (Ext I/O)',
      gpioRegs: [
        { name: 'DDRB / DDRC / DDRD', offset: '0x04 / 0x07 / 0x0A', function: 'Dirección: 1=Salida, 0=Entrada', atomic: false },
        { name: 'PORTB / PORTC / PORTD', offset: '0x05 / 0x08 / 0x0B', function: 'Salida de datos / Pull-up enable', atomic: false },
        { name: 'PINB / PINC / PIND', offset: '0x03 / 0x06 / 0x09', function: 'Lectura física; escribir 1 conmuta (Toggle)', atomic: true }
      ],
      uartFormula: 'UBRR = (F_CPU / (16 * BAUD)) - 1',
      timerFormula: 'f_OC = F_CPU / (2 * N * (1 + OCRnA))',
      maxPinCurrent: '40 mA máximo absoluto (20 mA recomendado)',
      pullUpRange: '20 kΩ - 50 kΩ internas',
      uniqueAdvantage: 'Aritmética nativa a 5V con tolerancia a ruido eléctrico en entornos industriales sucios.'
    },
    stm32f401: {
      flashRange: '0x08000000 - 0x0807FFFF (512 KB)',
      sramRange: '0x20000000 - 0x20017FFF (96 KB)',
      periphBase: '0x40000000 (APB1) / 0x40010000 (APB2) / 0x40020000 (AHB1)',
      gpioRegs: [
        { name: 'GPIOx->MODER', offset: '0x00', function: 'Modo: 00=In, 01=Out, 10=AltFunc, 11=Analog (2b/pin)', atomic: false },
        { name: 'GPIOx->BSRR', offset: '0x18', function: 'Set atómico [0..15] / Reset atómico [16..31]', atomic: true },
        { name: 'GPIOx->IDR', offset: '0x10', function: 'Lectura del estado lógico de los pines de entrada', atomic: false },
        { name: 'RCC->AHB1ENR', offset: '0x30 (RCC)', function: 'Bit 0=GPIOA, 1=GPIOB... Habilitación obligatoria de reloj', atomic: false }
      ],
      uartFormula: 'USARTDIV = f_CK / (8 * (2 - OVER8) * Baud)',
      timerFormula: 'f_PWM = f_TIM / ((PSC + 1) * (ARR + 1))',
      maxPinCurrent: '25 mA máximo absoluto (8 mA recomendado)',
      pullUpRange: '30 kΩ - 50 kΩ internas',
      uniqueAdvantage: 'FPU Cortex-M4 con instrucciones DSP y registros atómicos BSRR inmunes a carreras de interrupción.'
    },
    esp32c3: {
      flashRange: '0x42000000 (Mapeada por SPI Flash Cache, 4 MB)',
      sramRange: '0x3FC80000 - 0x3FCE0000 (SRAM 400 KB)',
      periphBase: '0x60000000 (Periféricos del sistema)',
      gpioRegs: [
        { name: 'GPIO.enable', offset: '0x60004020', function: 'Máscara de 32 bits de pines habilitados como salida', atomic: false },
        { name: 'GPIO.out_w1ts', offset: '0x60004008', function: 'Escribir 1 pone el pin a HIGH de forma atómica', atomic: true },
        { name: 'GPIO.out_w1tc', offset: '0x6000400C', function: 'Escribir 1 pone el pin a LOW de forma atómica', atomic: true },
        { name: 'GPIO.in', offset: '0x6000403C', function: 'Lectura de estado lógico de los 22 pines GPIO', atomic: false }
      ],
      uartFormula: 'CLKDIV = (f_APB / Baud) con mantisa entera y fracción',
      timerFormula: 'Timer tick = 80 MHz / Prescaler (16 bits)',
      maxPinCurrent: '40 mA máximo por pin (12 mA recomendado)',
      pullUpRange: '45 kΩ internas',
      uniqueAdvantage: 'Núcleo abierto RISC-V RV32IMC con WiFi 4 + Bluetooth 5 LE y acelerador SHA/RSA en silicio.'
    },
    nrf52840: {
      flashRange: '0x00000000 - 0x000FFFFF (1024 KB Flash)',
      sramRange: '0x20000000 - 0x2003FFFF (256 KB SRAM)',
      periphBase: '0x40000000 (AHB Peripherals)',
      gpioRegs: [
        { name: 'NRF_P0->PIN_CNF[n]', offset: '0x700 + 4*n', function: 'Configuración individual: DIR, INPUT, PULL, DRIVE', atomic: false },
        { name: 'NRF_P0->OUTSET', offset: '0x508', function: 'Escribir 1 pone el pin a HIGH de forma atómica', atomic: true },
        { name: 'NRF_P0->OUTCLR', offset: '0x50C', function: 'Escribir 1 pone el pin a LOW de forma atómica', atomic: true },
        { name: 'NRF_P0->IN', offset: '0x510', function: 'Lectura del bus de 32 pines del puerto', atomic: false }
      ],
      uartFormula: 'BAUDRATE = (Baud * 2^32) / 16.000.000',
      timerFormula: 'f_TIMER = 16 MHz / 2^PRESCALER (0..9)',
      maxPinCurrent: '15 mA en modo High Drive (H0H1)',
      pullUpRange: '11 kΩ - 16 kΩ internas',
      uniqueAdvantage: 'Sistema de eventos PPI (Programmable Peripheral Interconnect): periféricos comunicándose sin CPU.'
    },
    rp2040: {
      flashRange: '0x10000000 - 0x11FFFFFF (XIP QSPI Flash hasta 16 MB)',
      sramRange: '0x20000000 - 0x20041FFF (264 KB Striped SRAM)',
      periphBase: '0x40000000 (Periféricos del sistema) / 0xD0000000 (SIO)',
      gpioRegs: [
        { name: 'sio_hw->gpio_oe_set / clr', offset: '0xD0000024 / 0x28', function: 'Habilitación atómica de salida en el bus SIO', atomic: true },
        { name: 'sio_hw->gpio_set', offset: '0xD0000014', function: 'Escribir 1 pone el pin a HIGH en 1 ciclo de reloj', atomic: true },
        { name: 'sio_hw->gpio_clr', offset: '0xD0000018', function: 'Escribir 1 pone el pin a LOW en 1 ciclo de reloj', atomic: true },
        { name: 'sio_hw->gpio_in', offset: '0xD0000004', function: 'Lectura directa de los 30 pines sin espera de bus', atomic: false }
      ],
      uartFormula: 'BAUDDIV = 125 MHz / (16 * Baud) (IBRD entero + FBRD 6-bit)',
      timerFormula: 'f_PWM = 125 MHz / (DIV_INT + DIV_FRAC/16) / (TOP + 1)',
      maxPinCurrent: '12 mA por pin con slew rate configurable',
      pullUpRange: '50 kΩ - 80 kΩ internas',
      uniqueAdvantage: 'Periférico PIO (Programmable I/O): 8 máquinas de estado que emulan cualquier protocolo hardware.'
    }
  };

  const currCheat = cheatDataByMcu[selectedMcuId];

  // Universal Equivalences Table across all 5 chips
  const universalEquivalences = [
    {
      action: 'Configurar Pin como Salida',
      avr: 'DDRB |= (1 << 5);',
      stm32: 'GPIOA->MODER |= (1 << (5*2));',
      esp32: 'GPIO.enable |= (1 << 2);',
      nrf52: 'NRF_P0->PIN_CNF[13] = 1;',
      rp2040: 'sio_hw->gpio_oe_set = (1 << 25);'
    },
    {
      action: 'Poner Pin a HIGH (Atómico)',
      avr: 'PORTB |= (1 << 5); // No atómico',
      stm32: 'GPIOA->BSRR = (1 << 5);',
      esp32: 'GPIO.out_w1ts = (1 << 2);',
      nrf52: 'NRF_P0->OUTSET = (1 << 13);',
      rp2040: 'sio_hw->gpio_set = (1 << 25);'
    },
    {
      action: 'Poner Pin a LOW (Atómico)',
      avr: 'PORTB &= ~(1 << 5); // No atómico',
      stm32: 'GPIOA->BSRR = (1 << (5+16));',
      esp32: 'GPIO.out_w1tc = (1 << 2);',
      nrf52: 'NRF_P0->OUTCLR = (1 << 13);',
      rp2040: 'sio_hw->gpio_clr = (1 << 25);'
    },
    {
      action: 'Leer Estado Lógico del Pin',
      avr: 'val = (PINB >> 5) & 1;',
      stm32: 'val = (GPIOA->IDR >> 5) & 1;',
      esp32: 'val = (GPIO.in >> 2) & 1;',
      nrf52: 'val = (NRF_P0->IN >> 13) & 1;',
      rp2040: 'val = (sio_hw->gpio_in >> 25) & 1;'
    },
    {
      action: 'Habilitar Reloj de Hardware',
      avr: 'No necesario (Siempre activo)',
      stm32: 'RCC->AHB1ENR |= (1 << 0);',
      esp32: 'DPORT_PERIP_CLK_EN_REG',
      nrf52: 'Automático con POWER->TASKS',
      rp2040: 'resets_hw->reset &= ~(1 << 5);'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-2 sm:p-4 print:p-0 print:bg-white print:fixed">
      <div className="bg-slate-950 border-2 border-amber-400 text-slate-100 flex flex-col shadow-2xl w-full max-w-5xl h-[94vh] max-h-[900px] rounded-xl overflow-hidden print:border-none print:shadow-none print:w-full print:h-auto print:max-h-none print:rounded-none">
        {/* Header Bar */}
        <div className="bg-[#1a1205] border-b-2 border-amber-500/60 px-4 py-2.5 flex items-center justify-between gap-3 text-xs font-pixel shrink-0 print:hidden">
          <div className="flex items-center gap-2 text-amber-300">
            <span className="px-2 py-0.5 bg-amber-400 text-slate-950 font-bold border border-black">
              CHEAT SHEET // 1 PÁGINA
            </span>
            <span>FICHA TÉCNICA DE REFERENCIA RÁPIDA</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              title="Imprimir esta ficha técnica A4 para el cuaderno"
              className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded flex items-center gap-1.5 font-mono text-xs shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Ficha A4</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded bg-rose-950/60 hover:bg-rose-900 border border-rose-500/60 text-rose-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MCU Selector Bar */}
        <div className="bg-slate-900 border-b border-slate-800 p-2 flex flex-wrap items-center justify-between gap-2 shrink-0 print:hidden">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-mono text-slate-400 mr-1">Seleccionar Chip:</span>
            {Object.values(MCU_CATALOG).map((chip) => {
              const active = chip.id === selectedMcuId;
              return (
                <button
                  key={chip.id}
                  onClick={() => setSelectedMcuId(chip.id)}
                  className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all ${
                    active
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {chip.name}
                </button>
              );
            })}
          </div>
          <span className="text-[11px] font-mono text-cyan-300">
            {mcu.bitWidth}-Bit • {mcu.clockSpeed} • {mcu.operatingVoltage}
          </span>
        </div>

        {/* Printable Cheat Sheet Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 font-mono text-xs print:p-2 print:text-black print:overflow-visible">
          {/* Header of the Cheat Sheet */}
          <div className="border-b-2 border-amber-400 pb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-pixel text-white print:text-black">
                  FICHA TÉCNICA: {mcu.name.toUpperCase()}
                </h2>
                <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 text-[10px] font-bold">
                  {mcu.architecture.toUpperCase()}
                </span>
              </div>
              <p className="text-slate-400 text-[11px] mt-0.5 print:text-slate-600">
                {mcu.manufacturer} • Flash: {mcu.flash} • RAM: {mcu.ram} • Frecuencia Máx: {mcu.clockSpeed}
              </p>
            </div>

            <div className="text-right text-[11px] text-amber-300 print:text-slate-800">
              <div>Tensión Operativa: <strong>{mcu.operatingVoltage}</strong></div>
              <div>Ventaja Clave: <em>{currCheat.uniqueAdvantage}</em></div>
            </div>
          </div>

          {/* Section 1: Memory Map & Registers Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Memory Map Card */}
            <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-lg space-y-2 print:bg-white print:border-slate-400">
              <div className="text-xs font-bold text-cyan-300 uppercase flex items-center gap-1.5 print:text-black">
                <HardDrive className="w-3.5 h-3.5" /> 1. Mapa de Memoria en Silicio
              </div>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between p-1.5 rounded bg-black/60 print:bg-slate-100">
                  <span className="text-slate-400 print:text-slate-700">Flash Programa:</span>
                  <span className="text-white font-bold print:text-black">{currCheat.flashRange}</span>
                </div>
                <div className="flex justify-between p-1.5 rounded bg-black/60 print:bg-slate-100">
                  <span className="text-slate-400 print:text-slate-700">SRAM Datos:</span>
                  <span className="text-emerald-300 font-bold print:text-black">{currCheat.sramRange}</span>
                </div>
                <div className="flex justify-between p-1.5 rounded bg-black/60 print:bg-slate-100">
                  <span className="text-slate-400 print:text-slate-700">Base Periféricos:</span>
                  <span className="text-amber-300 font-bold print:text-black">{currCheat.periphBase}</span>
                </div>
              </div>
            </div>

            {/* Electrical Rules */}
            <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-lg space-y-2 print:bg-white print:border-slate-400">
              <div className="text-xs font-bold text-amber-300 uppercase flex items-center gap-1.5 print:text-black">
                <Zap className="w-3.5 h-3.5" /> 2. Parámetros Eléctricos de Silicio
              </div>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between p-1.5 rounded bg-black/60 print:bg-slate-100">
                  <span className="text-slate-400 print:text-slate-700">Corriente Máx Pin:</span>
                  <span className="text-rose-300 font-bold print:text-black">{currCheat.maxPinCurrent}</span>
                </div>
                <div className="flex justify-between p-1.5 rounded bg-black/60 print:bg-slate-100">
                  <span className="text-slate-400 print:text-slate-700">Resistencias Pull-up:</span>
                  <span className="text-cyan-300 font-bold print:text-black">{currCheat.pullUpRange}</span>
                </div>
                <div className="flex justify-between p-1.5 rounded bg-black/60 print:bg-slate-100">
                  <span className="text-slate-400 print:text-slate-700">Desacoplo VDD:</span>
                  <span className="text-white font-bold print:text-black">100 nF cerámico por pin</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Canonical GPIO Registers for this MCU */}
          <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-lg space-y-2 print:bg-white print:border-slate-400">
            <div className="text-xs font-bold text-emerald-300 uppercase flex items-center gap-1.5 print:text-black">
              <Binary className="w-3.5 h-3.5" /> 3. Registros de Control GPIO & Operaciones Atómicas
            </div>
            <table className="w-full text-left text-[11px] border border-slate-800 print:border-slate-400">
              <thead className="bg-black text-cyan-300 print:bg-slate-200 print:text-black">
                <tr>
                  <th className="p-2 border-r border-slate-800 print:border-slate-400">Registro</th>
                  <th className="p-2 border-r border-slate-800 print:border-slate-400">Offset / Dirección</th>
                  <th className="p-2 border-r border-slate-800 print:border-slate-400">Función en Hardware</th>
                  <th className="p-2 text-center">¿Atómico?</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-slate-300">
                {currCheat.gpioRegs.map((reg, idx) => (
                  <tr key={idx} className="hover:bg-slate-950">
                    <td className="p-2 font-bold text-white print:text-black border-r border-slate-800 print:border-slate-400">
                      {reg.name}
                    </td>
                    <td className="p-2 text-slate-400 print:text-slate-700 border-r border-slate-800 print:border-slate-400">
                      {reg.offset}
                    </td>
                    <td className="p-2 text-slate-200 print:text-black border-r border-slate-800 print:border-slate-400">
                      {reg.function}
                    </td>
                    <td className="p-2 text-center">
                      {reg.atomic ? (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 print:text-black">
                          SÍ (BSRR/SET)
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 print:text-black">
                          NO (R-M-W)
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 3: Universal Equivalences Table Across 5 MCUs */}
          <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-lg space-y-2 print:bg-white print:border-slate-400">
            <div className="text-xs font-bold text-purple-300 uppercase flex items-center gap-1.5 print:text-black">
              <Layers className="w-3.5 h-3.5" /> 4. Tabla Universal de Equivalencias de Registros (Los 5 Chips)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[10px] font-mono border border-slate-800 print:border-slate-400">
                <thead className="bg-black text-amber-300 print:bg-slate-200 print:text-black">
                  <tr>
                    <th className="p-1.5 border-r border-slate-800 print:border-slate-400">Acción Clave</th>
                    <th className="p-1.5 border-r border-slate-800 print:border-slate-400">ATmega328P</th>
                    <th className="p-1.5 border-r border-slate-800 print:border-slate-400">STM32F401RE</th>
                    <th className="p-1.5 border-r border-slate-800 print:border-slate-400">ESP32-C3</th>
                    <th className="p-1.5 border-r border-slate-800 print:border-slate-400">nRF52840</th>
                    <th className="p-1.5">RP2040</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-slate-300 text-slate-200 print:text-black">
                  {universalEquivalences.map((eq, i) => (
                    <tr key={i} className="hover:bg-slate-950">
                      <td className="p-1.5 font-bold text-cyan-300 print:text-black border-r border-slate-800 print:border-slate-400">
                        {eq.action}
                      </td>
                      <td className="p-1.5 border-r border-slate-800 print:border-slate-400 text-amber-200 print:text-black">
                        {eq.avr}
                      </td>
                      <td className="p-1.5 border-r border-slate-800 print:border-slate-400 text-emerald-200 print:text-black font-semibold">
                        {eq.stm32}
                      </td>
                      <td className="p-1.5 border-r border-slate-800 print:border-slate-400 text-sky-200 print:text-black">
                        {eq.esp32}
                      </td>
                      <td className="p-1.5 border-r border-slate-800 print:border-slate-400 text-rose-200 print:text-black">
                        {eq.nrf52}
                      </td>
                      <td className="p-1.5 text-lime-200 print:text-black">
                        {eq.rp2040}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Critical Formulas Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-1 print:bg-white print:border-slate-400">
              <span className="text-[11px] font-bold text-cyan-300 print:text-black">Fórmula Baudrate UART:</span>
              <div className="p-2 rounded bg-black text-cyan-200 font-bold text-center border border-slate-800 print:bg-slate-100 print:text-black">
                {currCheat.uartFormula}
              </div>
            </div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-1 print:bg-white print:border-slate-400">
              <span className="text-[11px] font-bold text-amber-300 print:text-black">Fórmula Temporizador / PWM:</span>
              <div className="p-2 rounded bg-black text-amber-200 font-bold text-center border border-slate-800 print:bg-slate-100 print:text-black">
                {currCheat.timerFormula}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
