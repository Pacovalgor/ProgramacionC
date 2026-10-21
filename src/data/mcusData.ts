export type MCUId = 'atmega328p' | 'stm32f401' | 'esp32c3' | 'nrf52840' | 'rp2040';

export interface BitFieldDef {
  name: string;
  bits: string; // e.g. "11:10" or "5"
  msb: number;
  lsb: number;
  description: string;
  values?: { [val: string]: string };
}

export interface RegisterDef {
  id: string;
  name: string;
  address: string;
  offset: string;
  width: 8 | 32;
  resetValue: number;
  access: 'R/W' | 'RO' | 'WO' | 'W1S' | 'W1C';
  peripheral: string;
  summary: string;
  whyItMatters: string;
  cMacroExample: string;
  rawPointerExample: string;
  fields: BitFieldDef[];
}

export interface PinDef {
  number: number;
  name: string;
  side: 'left' | 'right' | 'top' | 'bottom';
  type: 'gpio' | 'power' | 'gnd' | 'reset' | 'clock' | 'analog';
  functions: string[];
  defaultRole: string;
  voltageTolerance: string;
  internalRegisterBit?: string;
  description: string;
}

export interface MemoryBlock {
  region: string;
  startAddr: string;
  endAddr: string;
  size: string;
  bus: string;
  type: 'flash' | 'sram' | 'peripherals' | 'system';
  cStorageExample: string;
  description: string;
}

export interface MCUProfile {
  id: MCUId;
  name: string;
  manufacturer: string;
  tagline: string;
  badge: string;
  architecture: string;
  isa: string;
  bitWidth: 8 | 32;
  clockSpeed: string;
  flash: string;
  ram: string;
  operatingVoltage: string;
  packageType: string;
  requiresClockGating: boolean;
  clockGateRegister?: string;
  clockGateCode?: string;
  atomicSetMechanism: string;
  industryUseCases: string[];
  pedagogicalRole: string;
  pros: string[];
  cons: string[];
  pins: PinDef[];
  memoryMap: MemoryBlock[];
  registers: RegisterDef[];
  gpioComparison: {
    rawPointer: string;
    vendorCmsis: string;
    proDriver: string;
    assemblyOutput: string;
    cyclesCount: string;
    explanation: string;
  };
}

export const MCU_CATALOG: Record<MCUId, MCUProfile> = {
  atmega328p: {
    id: 'atmega328p',
    name: 'ATmega328P',
    manufacturer: 'Microchip (Atmel)',
    tagline: 'El Clásico de 8 bits — Ideal para entender registros puros sin capas ocultas',
    badge: '8-Bit AVR • Base Didáctica',
    architecture: 'AVR RISC 8-bit (Harvard Puro: buses separados para Flash y RAM)',
    isa: 'AVR 8-bit',
    bitWidth: 8,
    clockSpeed: '16 MHz (hasta 20 MHz)',
    flash: '32 KB',
    ram: '2 KB SRAM + 1 KB EEPROM',
    operatingVoltage: '1.8V – 5.5V (Estándar 5V)',
    packageType: 'DIP-28 (28 pines)',
    requiresClockGating: false,
    atomicSetMechanism: 'Instrucciones SBI / CBI dedicadas para los primeros 32 registros I/O',
    industryUseCases: [
      'Control industrial simple y electrodomésticos robustos de 5V',
      'Sensores remotos tolerantes a ruido eléctrico',
      'Educación base y prototipado rápido (corazón del Arduino UNO)'
    ],
    pedagogicalRole:
      'Es el punto de partida perfecto: sus registros tienen solo 8 bits (1 byte = 8 pines), no exige configurar complejos árboles de relojes para encender un LED y te permite ver qué hace realmente digitalWrite() por debajo.',
    pros: [
      '1 bit en el registro equivale exactamente a 1 pin físico (relación 1:1 directa)',
      'Opera a 5V nativos, muy resistente a errores de cableado',
      'Hoja de datos muy fácil de leer para principiantes'
    ],
    cons: [
      'Sin DMA ni controlador de interrupciones con prioridades multinivel (NVIC)',
      'Solo 2 KB de RAM y operaciones de 32 bits lentas (requieren varias instrucciones)',
      'Arquitectura Harvard pura: leer constantes de Flash exige usar PROGMEM'
    ],
    pins: [
      { number: 1, name: 'PC6 / RESET', side: 'left', type: 'reset', functions: ['RESET', 'PCINT14'], defaultRole: 'Reset Activo en Bajo', voltageTolerance: '5V', description: 'Si se lleva a 0V (GND), reinicia el contador de programa (PC = 0x0000).' },
      { number: 2, name: 'PD0 / RXD', side: 'left', type: 'gpio', functions: ['GPIO PD0', 'USART_RX', 'PCINT16'], defaultRole: 'UART RX', voltageTolerance: '5V', internalRegisterBit: 'PORTD bit 0', description: 'Entrada de recepción serie UART por hardware o GPIO del Puerto D.' },
      { number: 3, name: 'PD1 / TXD', side: 'left', type: 'gpio', functions: ['GPIO PD1', 'USART_TX', 'PCINT17'], defaultRole: 'UART TX', voltageTolerance: '5V', internalRegisterBit: 'PORTD bit 1', description: 'Salida de transmisión serie UART por hardware o GPIO del Puerto D.' },
      { number: 4, name: 'PD2 / INT0', side: 'left', type: 'gpio', functions: ['GPIO PD2', 'INT0 (Ext IRQ 0)', 'PCINT18'], defaultRole: 'Interrupción Externa 0', voltageTolerance: '5V', internalRegisterBit: 'PORTD bit 2', description: 'Pin con disparo dedicado de interrupción externa por flanco o nivel.' },
      { number: 5, name: 'PD3 / OC2B', side: 'left', type: 'gpio', functions: ['GPIO PD3', 'INT1', 'PWM OC2B'], defaultRole: 'PWM Timer 2B / INT1', voltageTolerance: '5V', internalRegisterBit: 'PORTD bit 3', description: 'Salida de comparación PWM del Timer 2 e Interrupción Externa 1.' },
      { number: 6, name: 'PD4 / T0', side: 'left', type: 'gpio', functions: ['GPIO PD4', 'Timer0 Ext Clk'], defaultRole: 'GPIO Digital', voltageTolerance: '5V', internalRegisterBit: 'PORTD bit 4', description: 'Pin de entrada/salida general del Puerto D (Bit 4).' },
      { number: 7, name: 'VCC', side: 'left', type: 'power', functions: ['Alimentación Digital +5V'], defaultRole: '+5V Power', voltageTolerance: '5.5V máx', description: 'Alimentación principal de la CPU y puertos digitales.' },
      { number: 8, name: 'GND', side: 'left', type: 'gnd', functions: ['Tierra Digital (0V)'], defaultRole: '0V Referencia', voltageTolerance: '0V', description: 'Referencia común de tensión (Tierra).' },
      { number: 9, name: 'PB6 / XTAL1', side: 'right', type: 'clock', functions: ['XTAL1 (Cristal 16MHz)', 'GPIO PB6'], defaultRole: 'Entrada Oscilador', voltageTolerance: '5V', internalRegisterBit: 'PORTB bit 6', description: 'Entrada del cristal de cuarzo externo que marca el ritmo de la CPU.' },
      { number: 10, name: 'PB5 / SCK', side: 'right', type: 'gpio', functions: ['GPIO PB5', 'SPI_SCK', 'LED Built-in (Pin 13)'], defaultRole: 'GPIO / SPI Clock', voltageTolerance: '5V', internalRegisterBit: 'PORTB bit 5 (DDRB5 / PORTB5)', description: '¡El famoso Pin 13 de Arduino! Conectado al bit 5 del Puerto B (direccion 0x25).' },
      { number: 11, name: 'PB4 / MISO', side: 'right', type: 'gpio', functions: ['GPIO PB4', 'SPI_MISO', 'PCINT4'], defaultRole: 'SPI Master In Slave Out', voltageTolerance: '5V', internalRegisterBit: 'PORTB bit 4', description: 'Línea de entrada de datos SPI o GPIO del Puerto B.' },
      { number: 12, name: 'PB3 / MOSI', side: 'right', type: 'gpio', functions: ['GPIO PB3', 'SPI_MOSI', 'PWM OC2A'], defaultRole: 'SPI Master Out / PWM', voltageTolerance: '5V', internalRegisterBit: 'PORTB bit 3', description: 'Línea de salida de datos SPI o salida PWM del Timer 2.' },
      { number: 13, name: 'PB1 / OC1A', side: 'right', type: 'gpio', functions: ['GPIO PB1', 'PWM 16-bit OC1A'], defaultRole: 'PWM Precisión 16-bit', voltageTolerance: '5V', internalRegisterBit: 'PORTB bit 1', description: 'Salida del Timer 1 de 16 bits, ideal para control de servomotores.' },
      { number: 14, name: 'PC5 / SCL', side: 'right', type: 'analog', functions: ['ADC5 (Canal Analógico 5)', 'I2C_SCL', 'GPIO PC5'], defaultRole: 'I2C Clock / ADC5', voltageTolerance: '5V', internalRegisterBit: 'PORTC bit 5', description: 'Pin híbrido: entrada del conversor analógico-digital (ADC5) o reloj I2C (TWI).' },
      { number: 15, name: 'PC4 / SDA', side: 'right', type: 'analog', functions: ['ADC4 (Canal Analógico 4)', 'I2C_SDA', 'GPIO PC4'], defaultRole: 'I2C Data / ADC4', voltageTolerance: '5V', internalRegisterBit: 'PORTC bit 4', description: 'Pin híbrido: datos bidireccionales I2C (Open-Drain) o entrada analógica ADC4.' },
      { number: 16, name: 'PC0 / ADC0', side: 'right', type: 'analog', functions: ['ADC0 (10-bit SAR)', 'GPIO PC0'], defaultRole: 'Entrada Analógica A0', voltageTolerance: '5V', internalRegisterBit: 'PORTC bit 0', description: 'Canal 0 del ADC de 10 bits (convierte 0V-5V en un entero de 0 a 1023).' }
    ],
    memoryMap: [
      {
        region: '32 Registros CPU (R0-R31)',
        startAddr: '0x0000',
        endAddr: '0x001F',
        size: '32 Bytes',
        bus: 'Bus Interno CPU',
        type: 'system',
        cStorageExample: 'Variables locales optimizadas en registros (register uint8_t i)',
        description: 'Conectados directamente a la ALU. Las operaciones aritméticas ocurren aquí en 1 solo ciclo.'
      },
      {
        region: 'Registros I/O Estándar (GPIO, Timers, Status)',
        startAddr: '0x0020',
        endAddr: '0x005F',
        size: '64 Bytes',
        bus: 'Bus I/O Directo',
        type: 'peripherals',
        cStorageExample: '*(volatile uint8_t *)0x25 |= (1 << 5); // PORTB',
        description: 'Aquí viven PINB (0x23), DDRB (0x24) y PORTB (0x25). Accesibles con instrucciones atómicas SBI/CBI.'
      },
      {
        region: 'Registros I/O Extendidos (UART0, ADC, Timers)',
        startAddr: '0x0060',
        endAddr: '0x00FF',
        size: '160 Bytes',
        bus: 'Bus de Datos Mapeado',
        type: 'peripherals',
        cStorageExample: 'UDR0 = 0x41; // Registro de datos UART en 0x00C6',
        description: 'Periféricos adicionales que solo pueden leerse/escribirse con instrucciones de memoria LDS/STS.'
      },
      {
        region: 'Memoria SRAM Interna (.data, .bss, Stack)',
        startAddr: '0x0100',
        endAddr: '0x08FF',
        size: '2 KB (2048 Bytes)',
        bus: 'Bus de Datos SRAM',
        type: 'sram',
        cStorageExample: 'uint32_t sensor_buffer[64]; // Vive en RAM',
        description: 'Variables globales, estáticas y la Pila (Stack) que crece desde 0x08FF hacia abajo.'
      },
      {
        region: 'Memoria Flash de Programa (Bus Harvard Separado)',
        startAddr: '0x0000 (Flash)',
        endAddr: '0x7FFF (Flash)',
        size: '32 KB',
        bus: 'Bus de Instrucciones Flash',
        type: 'flash',
        cStorageExample: 'const uint8_t tabla[] PROGMEM = {1, 2, 3};',
        description: 'Almacena el código compilado y la tabla de vectores de interrupción al inicio.'
      }
    ],
    registers: [
      {
        id: 'DDRB',
        name: 'DDRB (Data Direction Register B)',
        address: '0x0024',
        offset: '+0x04',
        width: 8,
        resetValue: 0x00,
        access: 'R/W',
        peripheral: 'GPIOB',
        summary: 'Define si cada pin del Puerto B actúa como ENTRADA (0) o SALIDA (1).',
        whyItMatters: 'Por defecto al encender el chip vale 0x00 (todos los pines en entrada de alta impedancia) para evitar cortocircuitos.',
        cMacroExample: 'DDRB |= (1U << 5); // Configura PB5 como SALIDA',
        rawPointerExample: '*(volatile uint8_t *)0x24 |= (1U << 5);',
        fields: [
          { name: 'DDB7:DDB6', bits: '7:6', msb: 7, lsb: 6, description: 'Dirección de pines de cristal PB7/PB6 (0=Entrada, 1=Salida)' },
          { name: 'DDB5 (Pin 13)', bits: '5', msb: 5, lsb: 5, description: 'Dirección del Pin PB5 / SCK: 0 = Entrada (Hi-Z), 1 = Salida Push-Pull', values: { '0': 'Entrada (Input)', '1': 'Salida (Output)' } },
          { name: 'DDB4:DDB0', bits: '4:0', msb: 4, lsb: 0, description: 'Dirección de los pines PB4 a PB0 (0=Entrada, 1=Salida)' }
        ]
      },
      {
        id: 'PORTB',
        name: 'PORTB (Port B Data Register)',
        address: '0x0025',
        offset: '+0x05',
        width: 8,
        resetValue: 0x00,
        access: 'R/W',
        peripheral: 'GPIOB',
        summary: 'Si el pin es SALIDA: escribe 0V (0) o 5V (1). Si el pin es ENTRADA: activa la resistencia Pull-Up interna (1).',
        whyItMatters: 'En AVR este mismo registro cumple doble función según lo que hayas puesto en DDRB.',
        cMacroExample: 'PORTB |= (1U << 5); // Pone PB5 a 5V (HIGH)',
        rawPointerExample: '*(volatile uint8_t *)0x25 |= (1U << 5);',
        fields: [
          { name: 'PORTB7:6', bits: '7:6', msb: 7, lsb: 6, description: 'Nivel de salida o Pull-Up para PB7 y PB6' },
          { name: 'PORTB5 (LED)', bits: '5', msb: 5, lsb: 5, description: 'Con DDB5=1: 1 enciende el transistor P-MOS (5V), 0 enciende el N-MOS (0V). Con DDB5=0: 1 activa Pull-Up.', values: { '0': '0V (LOW) / Pull-Up Off', '1': '5V (HIGH) / Pull-Up On' } },
          { name: 'PORTB4:0', bits: '4:0', msb: 4, lsb: 0, description: 'Nivel de salida o Pull-Up para PB4..PB0' }
        ]
      },
      {
        id: 'PINB',
        name: 'PINB (Port B Input Pins Address)',
        address: '0x0023',
        offset: '+0x03',
        width: 8,
        resetValue: 0x00,
        access: 'R/W',
        peripheral: 'GPIOB',
        summary: 'Lee el voltaje real físico presente en los pines del Puerto B (después del Schmitt Trigger).',
        whyItMatters: 'Truco de experto del Datasheet: ¡Escribir un 1 en PINB invierte (toggle) automáticamente el bit correspondiente en PORTB en 1 solo ciclo!',
        cMacroExample: 'uint8_t estado = (PINB & (1U << 5)); // Lee pin físico PB5',
        rawPointerExample: 'uint8_t estado = (*(volatile uint8_t *)0x23) & (1U << 5);',
        fields: [
          { name: 'PINB7:6', bits: '7:6', msb: 7, lsb: 6, description: 'Lectura física de PB7 y PB6' },
          { name: 'PINB5', bits: '5', msb: 5, lsb: 5, description: 'Estado eléctrico real en la patilla PB5 (0 = <1.5V, 1 = >3.0V)' },
          { name: 'PINB4:0', bits: '4:0', msb: 4, lsb: 0, description: 'Lectura física de PB4 a PB0' }
        ]
      }
    ],
    gpioComparison: {
      rawPointer: `// 1. Nivel Puntero Crudo (Direcciones físicas del Datasheet ATmega328P)
#define DDRB_REG   (*(volatile uint8_t *)0x24)
#define PORTB_REG  (*(volatile uint8_t *)0x25)

void led_init_and_on(void) {
    DDRB_REG  |= (1U << 5);  // Bit 5 en 1 -> PB5 como Salida
    PORTB_REG |= (1U << 5);  // Bit 5 en 1 -> PB5 entrega 5V
}`,
      vendorCmsis: `// 2. Nivel Oficial Fabricante (<avr/io.h>)
#include <avr/io.h>

void led_init_and_on(void) {
    DDRB  |= (1U << DDB5);   // Configura pin PB5 como salida
    PORTB |= (1U << PORTB5); // Pone a nivel ALTO (5V) el pin PB5
}`,
      proDriver: `// 3. Nivel Driver Profesional en C (Desacoplado y Reutilizable)
typedef struct {
    volatile uint8_t *ddr;
    volatile uint8_t *port;
    uint8_t pin_mask;
} gpio_pin_t;

void gpio_write_high(const gpio_pin_t *gpio) {
    *(gpio->ddr)  |= gpio->pin_mask;
    *(gpio->port) |= gpio->pin_mask;
}`,
      assemblyOutput: `; Compilado con avr-gcc -O2:
sbi 0x04, 5   ; Set Bit in I/O Register DDRB (Bit 5) -> 2 ciclos
sbi 0x05, 5   ; Set Bit in I/O Register PORTB (Bit 5) -> 2 ciclos
ret`,
      cyclesCount: '2 ciclos de reloj por instrucción (125 ns a 16 MHz) frente a ~56 ciclos que tarda digitalWrite() en Arduino.',
      explanation: 'Mientras que digitalWrite(13, HIGH) busca en tablas Flash, desactiva timers PWM y tarda más de 3.5 microsegundos, el acceso directo a registros en C se traduce en una única instrucción máquina (SBI) de 125 nanosegundos.'
    }
  },

  stm32f401: {
    id: 'stm32f401',
    name: 'STM32F401RE',
    manufacturer: 'STMicroelectronics',
    tagline: 'El Estándar Industrial #1 — ARM Cortex-M4F con Buses AHB/APB, RCC, NVIC y DMA',
    badge: '32-Bit ARM Cortex-M4F • Rey Industrial',
    architecture: 'ARMv7E-M (32-bit RISC + FPU de punto flotante + DSP)',
    isa: 'Thumb-2 (16/32-bit)',
    bitWidth: 32,
    clockSpeed: '84 MHz',
    flash: '512 KB',
    ram: '96 KB SRAM',
    operatingVoltage: '1.7V – 3.6V (Estándar 3.3V, pines tolerantes a 5V)',
    packageType: 'LQFP-64 (64 pines)',
    requiresClockGating: true,
    clockGateRegister: 'RCC->AHB1ENR (0x40023830)',
    clockGateCode: 'RCC->AHB1ENR |= (1U << 0); // ¡Obligatorio! Enciende el reloj de GPIOA',
    atomicSetMechanism: 'Registro dedicado GPIOx->BSRR (Bits 0..15 ponen a 1, Bits 16..31 ponen a 0 sin leer antes)',
    industryUseCases: [
      'Controladores de vuelo (drones), robótica industrial y PLC',
      'Automoción (ECUs secundarias), inversores solares y control de motores FOC',
      'Dispositivos médicos e instrumentación de precisión'
    ],
    pedagogicalRole:
      'Es el microcontrolador que te convierte en ingeniero de firmware profesional. Aquí aprendes por qué los periféricos están apagados al arrancar (Clock Gating en RCC), cómo funcionan los campos de 2 bits en MODER y por qué usar BSRR evita condiciones de carrera.',
    pros: [
      'Mapa de memoria lineal unificado de 4 GB (Flash, RAM y Periféricos usan los mismos punteros C)',
      'Controlador de interrupciones NVIC ultra-rápido con prioridades por hardware y DMA de doble buffer',
      'Estándar CMSIS compartido con cualquier fabricante ARM (NXP, TI, Infineon, Nordic)'
    ],
    cons: [
      'Si olvidas habilitar el reloj en RCC antes de escribir en un periférico, el registro ignora tus órdenes',
      'Configurar un pin requiere ajustar campos de 2 bits en MODER, PUPDR y OSPEEDR'
    ],
    pins: [
      { number: 1, name: 'VDD', side: 'left', type: 'power', functions: ['Alimentación +3.3V'], defaultRole: '+3.3V Supply', voltageTolerance: '3.6V máx', description: 'Alimentación lógica de 3.3V del microcontrolador.' },
      { number: 2, name: 'PC13 / B1', side: 'left', type: 'gpio', functions: ['GPIO PC13', 'EXTI13 (Botón Usuario)', 'RTC_AF1'], defaultRole: 'Botón Usuario (EXTI13)', voltageTolerance: '5V FT', internalRegisterBit: 'GPIOC->IDR bit 13', description: 'Conectado al pulsador azul en placas Nucleo y a la línea de interrupción externa EXTI13.' },
      { number: 3, name: 'PA0 / WKUP', side: 'left', type: 'analog', functions: ['GPIO PA0', 'ADC1_IN0', 'TIM2_CH1', 'SYS_WKUP'], defaultRole: 'ADC1 Canal 0 / Wakeup', voltageTolerance: '3.3V', internalRegisterBit: 'GPIOA bit 0', description: 'Pin capaz de despertar al microcontrolador del modo Standby y entrada analógica de 12 bits.' },
      { number: 4, name: 'PA2 / USART2_TX', side: 'left', type: 'gpio', functions: ['GPIO PA2', 'AF7: USART2_TX', 'AF1: TIM2_CH3', 'ADC1_IN2'], defaultRole: 'UART2 TX (Consola ST-Link)', voltageTolerance: '5V FT', internalRegisterBit: 'GPIOA bit 2 (AF7)', description: 'Línea de transmisión UART conectada al depurador utilizando la Función Alternativa 7 (AF7).' },
      { number: 5, name: 'PA3 / USART2_RX', side: 'left', type: 'gpio', functions: ['GPIO PA3', 'AF7: USART2_RX', 'AF1: TIM2_CH4', 'ADC1_IN3'], defaultRole: 'UART2 RX', voltageTolerance: '5V FT', internalRegisterBit: 'GPIOA bit 3 (AF7)', description: 'Línea de recepción UART mediante el multiplexor de Función Alternativa AF7.' },
      { number: 6, name: 'PA5 / LD2', side: 'left', type: 'gpio', functions: ['GPIO PA5', 'AF5: SPI1_SCK', 'AF1: TIM2_CH1', 'ADC1_IN5'], defaultRole: 'LED Usuario LD2 / SPI1_SCK', voltageTolerance: '3.3V', internalRegisterBit: 'GPIOA->MODER[11:10] / ODR[5]', description: 'Pin estrella en STM32: controlado por los bits 11:10 de GPIOA_MODER y el bit 5 de ODR/BSRR.' },
      { number: 7, name: 'PB6 / I2C1_SCL', side: 'right', type: 'gpio', functions: ['GPIO PB6', 'AF4: I2C1_SCL', 'AF2: TIM4_CH1', 'AF7: USART1_TX'], defaultRole: 'I2C1 Clock (Open-Drain)', voltageTolerance: '5V FT', internalRegisterBit: 'GPIOB bit 6 (OTYPER6=1)', description: 'Reloj I2C1; requiere activar el modo Open-Drain en GPIOB->OTYPER.' },
      { number: 8, name: 'PB7 / I2C1_SDA', side: 'right', type: 'gpio', functions: ['GPIO PB7', 'AF4: I2C1_SDA', 'AF2: TIM4_CH2', 'AF7: USART1_RX'], defaultRole: 'I2C1 Data (Open-Drain)', voltageTolerance: '5V FT', internalRegisterBit: 'GPIOB bit 7 (OTYPER7=1)', description: 'Línea de datos bidireccional I2C1 en el bus APB1.' },
      { number: 9, name: 'PA13 / SWDIO', side: 'right', type: 'clock', functions: ['SYS_JTMS-SWDIO', 'GPIO PA13'], defaultRole: 'Depuración SWD Datos', voltageTolerance: '5V FT', description: 'Línea de datos del depurador Serial Wire Debug (SWD). ¡Cuidado si la reconfiguras como GPIO, perderás el debugger!' },
      { number: 10, name: 'PA14 / SWCLK', side: 'right', type: 'clock', functions: ['SYS_JTCK-SWCLK', 'GPIO PA14'], defaultRole: 'Depuración SWD Reloj', voltageTolerance: '5V FT', description: 'Reloj de depuración en tiempo real SWD.' },
      { number: 11, name: 'NRST', side: 'right', type: 'reset', functions: ['System Reset Activo en Bajo'], defaultRole: 'Hardware Reset', voltageTolerance: '3.3V', description: 'Reinicia el núcleo Cortex-M4 y devuelve todos los registros a su Reset Value.' },
      { number: 12, name: 'VSS / GND', side: 'right', type: 'gnd', functions: ['Referencia 0V'], defaultRole: 'Tierra Común', voltageTolerance: '0V', description: 'Tierra del sistema.' }
    ],
    memoryMap: [
      {
        region: 'Memoria Flash Principal (.text, .rodata, Vector Table)',
        startAddr: '0x0800_0000',
        endAddr: '0x0807_FFFF',
        size: '512 KB',
        bus: 'I-Code / D-Code Bus (ART Accelerator)',
        type: 'flash',
        cStorageExample: 'const uint32_t lut[256] = { ... }; // Se queda en Flash sin gastar RAM',
        description: 'En 0x08000000 está el valor inicial del Stack Pointer (MSP), seguido del Reset_Handler y el código máquina.'
      },
      {
        region: 'Memoria SRAM Interna (.data, .bss, Heap, Stack)',
        startAddr: '0x2000_0000',
        endAddr: '0x2001_7FFF',
        size: '96 KB',
        bus: 'System Bus / Matriz AHB',
        type: 'sram',
        cStorageExample: 'static uint32_t dma_rx_buf[128]; // En SRAM accesible por CPU y DMA',
        description: 'RAM de alta velocidad sin estados de espera. El Stack crece desde 0x20018000 hacia abajo.'
      },
      {
        region: 'Periféricos Bus APB1 y APB2 (Timers, UART, I2C, SPI, ADC)',
        startAddr: '0x4000_0000',
        endAddr: '0x4001_FFFF',
        size: '128 KB Ventana MMIO',
        bus: 'Puentes APB1 (42 MHz) y APB2 (84 MHz)',
        type: 'peripherals',
        cStorageExample: 'USART2->DR = 0x55; // Dirección física 0x40004404',
        description: 'Periféricos de velocidad media y alta mapeados directamente como direcciones de memoria.'
      },
      {
        region: 'Periféricos Bus AHB1 (GPIOA..H, RCC, DMA1, DMA2)',
        startAddr: '0x4002_0000',
        endAddr: '0x4002_3BFF',
        size: 'Ventana AHB1 de Alta Velocidad',
        bus: 'Bus AHB1 (84 MHz)',
        type: 'peripherals',
        cStorageExample: 'GPIOA->ODR |= (1U << 5); // Dirección física 0x40020014',
        description: 'GPIOA empieza exactamente en 0x40020000 y el controlador de relojes RCC en 0x40023800.'
      },
      {
        region: 'Periféricos Internos del Núcleo ARM Cortex-M4 (NVIC, SysTick, SCB)',
        startAddr: '0xE000_0000',
        endAddr: '0xE00F_FFFF',
        size: '1 MB Espacio Privado PPB',
        bus: 'Private Peripheral Bus (ARM Core)',
        type: 'system',
        cStorageExample: 'SysTick->LOAD = 84000 - 1; NVIC_EnableIRQ(EXTI15_10_IRQn);',
        description: 'Estándar idéntico en todos los Cortex-M del planeta: gestor de interrupciones NVIC, SysTick y FPU.'
      }
    ],
    registers: [
      {
        id: 'RCC_AHB1ENR',
        name: 'RCC_AHB1ENR (AHB1 Peripheral Clock Enable Register)',
        address: '0x40023830',
        offset: '+0x30',
        width: 32,
        resetValue: 0x00000000,
        access: 'R/W',
        peripheral: 'RCC',
        summary: 'Interruptor maestro de reloj para los puertos GPIOA..GPIOH y controladores DMA.',
        whyItMatters: '¡El error #1 al pasar a ARM! Para ahorrar energía, todos los puertos GPIO nacen con el reloj desconectado (muertos). Si no pones el bit 0 en 1 aquí, escribir en GPIOA no tendrá ningún efecto.',
        cMacroExample: 'RCC->AHB1ENR |= (1U << 0); // Conecta el reloj a GPIOA',
        rawPointerExample: '*(volatile uint32_t *)0x40023830 |= (1U << 0);',
        fields: [
          { name: 'DMA2EN / DMA1EN', bits: '22:21', msb: 22, lsb: 21, description: 'Habilita el reloj de los controladores DMA2 y DMA1' },
          { name: 'GPIOCEN', bits: '2', msb: 2, lsb: 2, description: 'Reloj del Puerto C (0 = Apagado/Congelado, 1 = Reloj Activo)' },
          { name: 'GPIOBEN', bits: '1', msb: 1, lsb: 1, description: 'Reloj del Puerto B (0 = Apagado/Congelado, 1 = Reloj Activo)' },
          { name: 'GPIOAEN', bits: '0', msb: 0, lsb: 0, description: 'Reloj del Puerto A (¡Imprescindible poner a 1 antes de usar PA5!)', values: { '0': 'Reloj Cortado (GPIOA Muerto)', '1': 'Reloj Activo (GPIOA Operativo)' } }
        ]
      },
      {
        id: 'GPIOA_MODER',
        name: 'GPIOA_MODER (GPIO Port Mode Register)',
        address: '0x40020000',
        offset: '+0x00',
        width: 32,
        resetValue: 0x0C000000,
        access: 'R/W',
        peripheral: 'GPIOA',
        summary: 'Configura la función de los 16 pines del Puerto A usando 2 bits por cada pin.',
        whyItMatters: 'A diferencia de AVR (1 bit por pin), un STM32 tiene 4 modos por pin: Entrada (00), Salida (01), Función Alternativa como UART/SPI/PWM (10) y Analógico ADC (11).',
        cMacroExample: 'GPIOA->MODER = (GPIOA->MODER & ~(3U << 10)) | (1U << 10); // PA5 = 01 (Salida)',
        rawPointerExample: '*(volatile uint32_t *)0x40020000 = (*(volatile uint32_t *)0x40020000 & ~(3U << 10)) | (1U << 10);',
        fields: [
          { name: 'MODER15..6', bits: '31:12', msb: 31, lsb: 12, description: '2 bits de modo para cada pin desde PA15 hasta PA6' },
          { name: 'MODER5[1:0] (Pin PA5)', bits: '11:10', msb: 11, lsb: 10, description: 'Modo del Pin PA5 (2 bits: pin 5 * 2 = posición 10): 00=Entrada, 01=Salida, 10=Función Alternativa, 11=Analógico', values: { '00': '00: Entrada Digital', '01': '01: Salida General (Output)', '10': '10: Función Alternativa (SPI/PWM)', '11': '11: Modo Analógico (ADC)' } },
          { name: 'MODER4..0', bits: '9:0', msb: 9, lsb: 0, description: '2 bits de modo para cada pin desde PA4 hasta PA0' }
        ]
      },
      {
        id: 'GPIOA_ODR',
        name: 'GPIOA_ODR (GPIO Port Output Data Register)',
        address: '0x40020014',
        offset: '+0x14',
        width: 32,
        resetValue: 0x00000000,
        access: 'R/W',
        peripheral: 'GPIOA',
        summary: 'Contiene el estado de salida (0V o 3.3V) de los 16 pines de GPIOA (bits 0 al 15).',
        whyItMatters: 'Permite leer y modificar el estado de salida con |= o ^= pero requiere 3 pasos en la CPU (Leer -> Modificar -> Escribir).',
        cMacroExample: 'GPIOA->ODR |= (1U << 5); // Pone PA5 a 3.3V',
        rawPointerExample: '*(volatile uint32_t *)0x40020014 |= (1U << 5);',
        fields: [
          { name: 'Reservado', bits: '31:16', msb: 31, lsb: 16, description: 'Bits reservados (siempre mantener en 0)' },
          { name: 'ODR5 (LED PA5)', bits: '5', msb: 5, lsb: 5, description: 'Nivel lógico en PA5: 0 = Activa MOSFET N (0V), 1 = Activa MOSFET P (3.3V)', values: { '0': '0V (LOW)', '1': '3.3V (HIGH)' } },
          { name: 'ODR4..0', bits: '4:0', msb: 4, lsb: 0, description: 'Estado de salida de los pines PA4 a PA0' }
        ]
      },
      {
        id: 'GPIOA_BSRR',
        name: 'GPIOA_BSRR (Bit Set/Reset Register — Atómico)',
        address: '0x40020018',
        offset: '+0x18',
        width: 32,
        resetValue: 0x00000000,
        access: 'WO',
        peripheral: 'GPIOA',
        summary: 'Registro de escritura atómica: escribir un 1 en bits 0..15 enciende el pin; escribir un 1 en bits 16..31 lo apaga.',
        whyItMatters: '¡Estándar de oro en la industria! Usa asignación directa (= en vez de |=). Los bits en 0 se ignoran en hardware y es imposible que una interrupción corrompa otros pines del mismo puerto.',
        cMacroExample: 'GPIOA->BSRR = (1U << 5); // Enciende PA5 en 1 sola instrucción atómica',
        rawPointerExample: '*(volatile uint32_t *)0x40020018 = (1U << 5); // (1U << (5 + 16)) para apagarlo',
        fields: [
          { name: 'BR15..BR0 (Reset Bits)', bits: '31:16', msb: 31, lsb: 16, description: 'Escribir 1 en BR5 (bit 21) apaga PA5 inmediatamente. Escribir 0 no hace nada.' },
          { name: 'BS5 (Set PA5)', bits: '5', msb: 5, lsb: 5, description: 'Escribir 1 enciende PA5 de forma atómica sin leer ODR', values: { '0': 'Sin efecto', '1': 'Fuerza ODR5 = 1 (3.3V)' } },
          { name: 'BS4..BS0', bits: '4:0', msb: 4, lsb: 0, description: 'Escribir 1 pone a HIGH los pines PA4..PA0' }
        ]
      }
    ],
    gpioComparison: {
      rawPointer: `// 1. Nivel Puntero Crudo (Direcciones físicas del Reference Manual RM0368)
#define RCC_AHB1ENR   (*(volatile uint32_t *)0x40023830UL)
#define GPIOA_MODER   (*(volatile uint32_t *)0x40020000UL)
#define GPIOA_BSRR    (*(volatile uint32_t *)0x40020018UL)

void led_init_and_on(void) {
    RCC_AHB1ENR |= (1U << 0);                        // 1. Encender reloj de GPIOA
    GPIOA_MODER  = (GPIOA_MODER & ~(3U << 10)) | (1U << 10); // 2. PA5 modo 01 (Salida)
    GPIOA_BSRR   = (1U << 5);                        // 3. Escritura atómica: PA5 = HIGH
}`,
      vendorCmsis: `// 2. Nivel Estándar Industrial CMSIS (stm32f401xe.h)
#include "stm32f4xx.h"

void led_init_and_on(void) {
    RCC->AHB1ENR |= RCC_AHB1ENR_GPIOAEN;             // Habilita reloj en Bus AHB1
    GPIOA->MODER &= ~(3UL << (5U * 2U));             // Limpia bits 11:10
    GPIOA->MODER |=  (1UL << (5U * 2U));             // Modo 01: Output Push-Pull
    GPIOA->BSRR   = GPIO_BSRR_BS5;                   // Atómico: pone PA5 a 3.3V
}`,
      proDriver: `// 3. Nivel Driver Profesional en C (Mapeo de Struct de Hardware + API limpia)
typedef struct {
    volatile uint32_t MODER, OTYPER, OSPEEDR, PUPDR, IDR, ODR, BSRR;
} GPIO_Regs_t;

static inline void hal_gpio_set_atomic(GPIO_Regs_t *port, uint8_t pin) {
    port->BSRR = (1UL << pin); // 1 sola escritura, seguro ante interrupciones (ISR-safe)
}`,
      assemblyOutput: `; Compilado con arm-none-eabi-gcc -O2 (Usando BSRR vs ODR):
ldr r3, =0x40020000     ; Carga dirección base de GPIOA
movs r2, #32            ; Máscara (1 << 5) = 32
str r2, [r3, #24]       ; Escribe directo en offset +0x18 (BSRR) en 1 sola operación STR!`,
      cyclesCount: '1 instrucción de escritura en bus (STR) con BSRR vs 3 instrucciones (LDR + ORR + STR) con ODR |=',
      explanation: 'En sistemas industriales con interrupciones y RTOS, usar GPIOA->BSRR garantiza que ninguna interrupción pueda colarse entre la lectura y la escritura del puerto.'
    }
  },

  esp32c3: {
    id: 'esp32c3',
    name: 'ESP32-C3',
    manufacturer: 'Espressif Systems',
    tagline: 'La Revolución RISC-V en IoT Industrial — Matriz de Pines Flexible y Registros W1TS',
    badge: '32-Bit RISC-V • Estándar IoT',
    architecture: 'RISC-V 32-bit Single-Core (RV32IMC) con Matriz de Periféricos Cualquier-Pin',
    isa: 'RISC-V RV32IMC',
    bitWidth: 32,
    clockSpeed: '160 MHz',
    flash: '4 MB QSPI Flash (Mapeada en caché)',
    ram: '400 KB SRAM',
    operatingVoltage: '3.0V – 3.6V (3.3V nominal)',
    packageType: 'QFN-32 (32 pines)',
    requiresClockGating: false,
    atomicSetMechanism: 'Registros gemelos GPIO_OUT_W1TS_REG (Write 1 to Set) y GPIO_OUT_W1TC_REG (Write 1 to Clear)',
    industryUseCases: [
      'Nodos IoT industriales conectados (Wi-Fi 4 + Bluetooth 5 LE)',
      'Domótica comercial (Matter / Zigbee / Thread gateways)',
      'Transición de la industria hacia arquitecturas abiertas RISC-V sin regalías'
    ],
    pedagogicalRole:
      'Te enseña dos conceptos modernos cruciales: la arquitectura abierta RISC-V y la "GPIO Matrix" (una centralita telefónica interna que permite conectar casi cualquier UART, SPI o PWM a cualquier pin físico).',
    pros: [
      'Matriz de enrutado flexible: puedes asignar UART, I2C, SPI o PWM a prácticamente cualquier pin por software',
      'Arquitectura RISC-V limpia y moderna con registros W1TS/W1TC de limpieza y activación atómica',
      'Alta velocidad (160 MHz) y gran cantidad de RAM (400 KB) con conectividad integrada'
    ],
    cons: [
      'La ruta desde el registro hasta el pin pasa por dos bloques: la GPIO Matrix y el IO_MUX',
      'El ADC presenta menor linealidad en los extremos comparado con un STM32'
    ],
    pins: [
      { number: 1, name: 'VDDA / 3V3', side: 'left', type: 'power', functions: ['Alimentación 3.3V Analógica/RF'], defaultRole: '3.3V Power', voltageTolerance: '3.6V', description: 'Alimentación para el bloque de radiofrecuencia y conversores.' },
      { number: 2, name: 'GPIO2 (Strapping)', side: 'left', type: 'gpio', functions: ['GPIO2', 'ADC1_CH2', 'FSPIQ'], defaultRole: 'GPIO2 / Strapping Pin', voltageTolerance: '3.3V', internalRegisterBit: 'GPIO_OUT bit 2', description: 'Pin de uso general y pin de configuración de arranque (Strapping).' },
      { number: 3, name: 'GPIO3 / ADC1_CH3', side: 'left', type: 'analog', functions: ['GPIO3', 'ADC1_CH3'], defaultRole: 'Entrada Analógica / GPIO3', voltageTolerance: '3.3V', internalRegisterBit: 'GPIO_OUT bit 3', description: 'Pin con capacidad analógica SAR ADC de 12 bits y matriz digital.' },
      { number: 4, name: 'GPIO4 / MTMS', side: 'left', type: 'gpio', functions: ['GPIO4', 'ADC1_CH4', 'FSPIHD', 'JTAG MTMS'], defaultRole: 'GPIO4 (Configurable Matrix)', voltageTolerance: '3.3V', internalRegisterBit: 'GPIO_OUT bit 4', description: 'Puede enrutarse internamente a cualquier señal periférica mediante GPIO_FUNC4_OUT_SEL_CFG.' },
      { number: 5, name: 'GPIO5 / LED', side: 'left', type: 'gpio', functions: ['GPIO5', 'ADC2_CH0', 'FSPIWP', 'PWM LEDC'], defaultRole: 'GPIO5 Salida Digital / PWM', voltageTolerance: '3.3V', internalRegisterBit: 'GPIO_OUT_W1TS bit 5', description: 'Controlado por el bit 5 de GPIO_ENABLE_W1TS_REG y GPIO_OUT_W1TS_REG.' },
      { number: 6, name: 'CHIP_EN', side: 'left', type: 'reset', functions: ['Chip Enable / Reset (Activo en Bajo)'], defaultRole: 'Enable / Reset', voltageTolerance: '3.3V', description: 'Poner a 0V apaga por completo el SoC; poner a 3.3V arranca el núcleo RISC-V.' },
      { number: 7, name: 'GPIO8 (RGB/Boot)', side: 'right', type: 'gpio', functions: ['GPIO8', 'Strapping Boot Mode', 'I2C SDA (vía Matrix)'], defaultRole: 'LED Placa / Strapping', voltageTolerance: '3.3V', internalRegisterBit: 'GPIO_OUT bit 8', description: 'Usado en muchas placas DevKit como LED de estado y selector de modo Bootloader junto a GPIO9.' },
      { number: 8, name: 'GPIO9 / BOOT', side: 'right', type: 'gpio', functions: ['GPIO9', 'Botón BOOT (Download Mode)'], defaultRole: 'Botón Boot / Entrada', voltageTolerance: '3.3V', internalRegisterBit: 'GPIO_IN bit 9', description: 'Si está a 0V durante el reset, el chip entra en modo descarga de firmware por USB/UART.' },
      { number: 9, name: 'GPIO18 / USB_D-', side: 'right', type: 'clock', functions: ['USB Serial/JTAG D-', 'GPIO18'], defaultRole: 'USB Nativo + JTAG D-', voltageTolerance: '3.3V', description: 'Permite depurar el procesador RISC-V con OpenOCD directamente por un cable USB sin adaptador externo.' },
      { number: 10, name: 'GPIO19 / USB_D+', side: 'right', type: 'clock', functions: ['USB Serial/JTAG D+', 'GPIO19'], defaultRole: 'USB Nativo + JTAG D+', voltageTolerance: '3.3V', description: 'Línea positiva del depurador JTAG/Serial integrado en el silicio.' },
      { number: 11, name: 'GPIO20 / U0RXD', side: 'right', type: 'gpio', functions: ['U0RXD', 'GPIO20'], defaultRole: 'UART0 RX', voltageTolerance: '3.3V', internalRegisterBit: 'GPIO_IN bit 20', description: 'Recepción serie por defecto de UART0.' },
      { number: 12, name: 'GPIO21 / U0TXD', side: 'right', type: 'gpio', functions: ['U0TXD', 'GPIO21'], defaultRole: 'UART0 TX', voltageTolerance: '3.3V', internalRegisterBit: 'GPIO_OUT bit 21', description: 'Transmisión serie por defecto de UART0.' }
    ],
    memoryMap: [
      {
        region: 'SRAM Interna de Datos (DRAM)',
        startAddr: '0x3FC8_0000',
        endAddr: '0x3FCD_FFFF',
        size: '384 KB',
        bus: 'Bus de Datos RISC-V',
        type: 'sram',
        cStorageExample: 'uint8_t wifi_packet[512];',
        description: 'Memoria RAM principal para datos, pilas de tareas FreeRTOS y buffers DMA.'
      },
      {
        region: 'SRAM de Instrucciones (IRAM — Ejecución Rápida)',
        startAddr: '0x4038_0000',
        endAddr: '0x403D_FFFF',
        size: 'Ventana Ejecutable SRAM',
        bus: 'Bus de Instrucciones RISC-V',
        type: 'sram',
        cStorageExample: 'void IRAM_ATTR gpio_isr_handler(void) { ... }',
        description: 'En ESP32, las rutinas de interrupción críticas se colocan en IRAM para no esperar a la memoria Flash externa.'
      },
      {
        region: 'Memoria Flash Mapeada en Caché (DROM / IROM)',
        startAddr: '0x3C00_0000',
        endAddr: '0x3C7F_FFFF',
        size: 'Hasta 8 MB Ventana MMU',
        bus: 'Caché SPI1 / MMU',
        type: 'flash',
        cStorageExample: 'const char *mensaje = "Hola RISC-V";',
        description: 'La MMU traduce lecturas a estas direcciones en transferencias QSPI transparentes desde la Flash.'
      },
      {
        region: 'Periféricos Mapeados en Memoria (GPIO, UART, SPI, Timers)',
        startAddr: '0x6000_0000',
        endAddr: '0x600D_FFFF',
        size: 'Bloque APB / Periféricos',
        bus: 'Bus Periféricos 80 MHz',
        type: 'peripherals',
        cStorageExample: '*(volatile uint32_t *)0x60004008 = (1U << 5); // GPIO_OUT_W1TS',
        description: 'El bloque GPIO comienza en 0x60004000 y el bloque IO_MUX en 0x60009000.'
      }
    ],
    registers: [
      {
        id: 'GPIO_ENABLE_W1TS_REG',
        name: 'GPIO_ENABLE_W1TS_REG (Output Enable Write-1-to-Set)',
        address: '0x60004024',
        offset: '+0x0024',
        width: 32,
        resetValue: 0x00000000,
        access: 'W1S',
        peripheral: 'GPIO',
        summary: 'Habilita el driver de salida del pin escribiendo un 1 en el bit correspondiente (sin tocar los demás).',
        whyItMatters: 'Sustituye al clásico DDRB |= (1<<5) por una operación atómica de una sola escritura.',
        cMacroExample: 'GPIO.enable_w1ts.val = (1U << 5); // Habilita salida en GPIO5',
        rawPointerExample: '*(volatile uint32_t *)0x60004024 = (1U << 5);',
        fields: [
          { name: 'Reservado', bits: '31:22', msb: 31, lsb: 22, description: 'No implementado en ESP32-C3 (tiene 22 pines GPIO: 0..21)' },
          { name: 'ENABLE_W1TS[5]', bits: '5', msb: 5, lsb: 5, description: 'Escribir 1 activa el buffer de salida de GPIO5', values: { '0': 'Sin cambios', '1': 'Habilita Salida en GPIO5' } },
          { name: 'ENABLE_W1TS[4:0]', bits: '4:0', msb: 4, lsb: 0, description: 'Habilita salida para GPIO4..GPIO0' }
        ]
      },
      {
        id: 'GPIO_OUT_W1TS_REG',
        name: 'GPIO_OUT_W1TS_REG (GPIO Output Write-1-to-Set)',
        address: '0x60004008',
        offset: '+0x0008',
        width: 32,
        resetValue: 0x00000000,
        access: 'W1S',
        peripheral: 'GPIO',
        summary: 'Pone a nivel ALTO (3.3V) cualquier pin cuyo bit escribas como 1.',
        whyItMatters: 'Equivalente al BSRR de STM32: evita condiciones de carrera entre los dos hilos de FreeRTOS o interrupciones.',
        cMacroExample: 'GPIO.out_w1ts.val = (1U << 5); // GPIO5 = 3.3V (HIGH)',
        rawPointerExample: '*(volatile uint32_t *)0x60004008 = (1U << 5);',
        fields: [
          { name: 'OUT_W1TS[21:6]', bits: '21:6', msb: 21, lsb: 6, description: 'Pone en HIGH los pines GPIO21..GPIO6' },
          { name: 'OUT_W1TS[5]', bits: '5', msb: 5, lsb: 5, description: 'Escribir 1 fuerza el registro de salida GPIO_OUT[5] a 1 (3.3V)', values: { '0': 'Sin efecto', '1': 'Pone GPIO5 a 3.3V (HIGH)' } },
          { name: 'OUT_W1TS[4:0]', bits: '4:0', msb: 4, lsb: 0, description: 'Pone en HIGH los pines GPIO4..GPIO0' }
        ]
      },
      {
        id: 'GPIO_OUT_W1TC_REG',
        name: 'GPIO_OUT_W1TC_REG (GPIO Output Write-1-to-Clear)',
        address: '0x6000400C',
        offset: '+0x000C',
        width: 32,
        resetValue: 0x00000000,
        access: 'W1C',
        peripheral: 'GPIO',
        summary: 'Pone a nivel BAJO (0V) cualquier pin cuyo bit escribas como 1.',
        whyItMatters: 'En vez de hacer &= ~(1 << 5), escribes directamente (1 << 5) en este registro gemelo de limpieza.',
        cMacroExample: 'GPIO.out_w1tc.val = (1U << 5); // GPIO5 = 0V (LOW)',
        rawPointerExample: '*(volatile uint32_t *)0x6000400C = (1U << 5);',
        fields: [
          { name: 'OUT_W1TC[21:6]', bits: '21:6', msb: 21, lsb: 6, description: 'Limpia a 0V los pines GPIO21..GPIO6' },
          { name: 'OUT_W1TC[5]', bits: '5', msb: 5, lsb: 5, description: 'Escribir 1 limpia el bit 5 de salida poniendo 0V en el pin', values: { '0': 'Sin efecto', '1': 'Pone GPIO5 a 0V (LOW)' } },
          { name: 'OUT_W1TC[4:0]', bits: '4:0', msb: 4, lsb: 0, description: 'Limpia a 0V los pines GPIO4..GPIO0' }
        ]
      }
    ],
    gpioComparison: {
      rawPointer: `// 1. Nivel Puntero Crudo (Technical Reference Manual ESP32-C3)
#define GPIO_OUT_W1TS_REG     (*(volatile uint32_t *)0x60004008UL)
#define GPIO_ENABLE_W1TS_REG  (*(volatile uint32_t *)0x60004024UL)

void led_init_and_on(void) {
    GPIO_ENABLE_W1TS_REG = (1UL << 5); // Activa buffer de salida en GPIO5
    GPIO_OUT_W1TS_REG    = (1UL << 5); // Pone GPIO5 a 3.3V atómicamente
}`,
      vendorCmsis: `// 2. Nivel Estructuras de Bajo Nivel ESP-IDF (soc/gpio_struct.h)
#include "soc/gpio_struct.h"

void led_init_and_on(void) {
    GPIO.enable_w1ts.val = (1UL << 5);
    GPIO.out_w1ts.val    = (1UL << 5);
}`,
      proDriver: `// 3. Nivel Driver / HAL Portable
static inline void hal_gpio_write(uint32_t pin, bool level) {
    if (level) {
        *(volatile uint32_t *)0x60004008UL = (1UL << pin); // W1TS
    } else {
        *(volatile uint32_t *)0x6000400CUL = (1UL << pin); // W1TC
    }
}`,
      assemblyOutput: `; Compilado con riscv32-esp-elf-gcc -O2 (ISA RISC-V):
lui  a5, 0x60004        ; Carga dirección superior 0x60004000 en registro a5
li   a4, 32             ; Carga inmediato 32 (1 << 5) en registro a4
sw   a4, 36(a5)         ; Store Word en offset +0x24 (GPIO_ENABLE_W1TS_REG)
sw   a4, 8(a5)          ; Store Word en offset +0x08 (GPIO_OUT_W1TS_REG)
ret`,
      cyclesCount: 'Instrucciones RISC-V puras Load-Store (lui + li + sw) sin bloqueos de lectura-modificación.',
      explanation: 'RISC-V es una arquitectura Load-Store minimalista: al tener registros separados para encender (W1TS) y apagar (W1TC), el procesador solo ejecuta una escritura directa (SW).'
    }
  },

  nrf52840: {
    id: 'nrf52840',
    name: 'nRF52840',
    manufacturer: 'Nordic Semiconductor',
    tagline: 'El Rey del Ultra-Low-Power — Arquitectura de Tareas, Eventos y PPI sin despertar la CPU',
    badge: 'ARM Cortex-M4F • Ultra-Low-Power & PPI',
    architecture: 'ARM Cortex-M4F + Sistema Autónomo de Eventos/Tareas (PPI)',
    isa: 'Thumb-2 (16/32-bit)',
    bitWidth: 32,
    clockSpeed: '64 MHz',
    flash: '1 MB',
    ram: '256 KB SRAM',
    operatingVoltage: '1.7V – 5.5V (Regulador DCDC integrado)',
    packageType: 'AQFN-73 (P0.00 a P1.15)',
    requiresClockGating: false,
    atomicSetMechanism: 'Registros independientes OUTSET (0x508) y OUTCLR (0x50C) + Registro PIN_CNF[n] individual por pin',
    industryUseCases: [
      'Dispositivos médicos implantables y monitores continuos de glucosa/ECG',
      'Wearables deportivos, relojes inteligentes y periféricos inalámbricos de baja latencia',
      'Sensores industriales que deben durar 5-10 años con una sola batería de litio'
    ],
    pedagogicalRole:
      'Te enseña el diseño de registros más elegante y limpio de la industria: cada pin tiene su propio registro de configuración completo (PIN_CNF[n]) y los periféricos se comunican mediante Tareas (TASKS) y Eventos (EVENTS) por el bus PPI mientras la CPU duerme.',
    pros: [
      'Diseño de registros ultra-intuitivo: un array PIN_CNF[0..31] donde configuras todo un pin de una sola vez',
      'Interconexión PPI: un Timer o un comparador analógico puede disparar un GPIO o transferencia DMA con la CPU apagada',
      'EasyDMA integrado en todos los periféricos serie (UART, SPI, I2C, ADC)'
    ],
    cons: [
      'Entender el paradigma orientado a Eventos/Tareas y los canales PPI requiere cambiar el chip mental clásico'
    ],
    pins: [
      { number: 1, name: 'VDD', side: 'left', type: 'power', functions: ['Alimentación 1.7V - 3.6V'], defaultRole: ' Alimentación Principal', voltageTolerance: '3.6V', description: 'Entrada del regulador interno de ultra bajo consumo (consume solo 1.5 µA en sueño).' },
      { number: 2, name: 'P0.05 / AIN3', side: 'left', type: 'analog', functions: ['GPIO P0.05', 'SAADC AIN3', 'GPIOTE Canal'], defaultRole: 'GPIO P0.05 / Entrada ADC', voltageTolerance: '3.3V', internalRegisterBit: 'NRF_P0->PIN_CNF[5]', description: 'Configurado íntegramente mediante el elemento 5 del array NRF_P0->PIN_CNF[5].' },
      { number: 3, name: 'P0.06 / TXD', side: 'left', type: 'gpio', functions: ['GPIO P0.06', 'UARTE0 TXD (Cualquier pin vía PSEL)'], defaultRole: 'UART TX (Ruteable)', voltageTolerance: '3.3V', internalRegisterBit: 'NRF_P0->OUT bit 6', description: 'En Nordic cualquier periférico elige su pin escribiendo el número de pin en su registro PSEL.TXD.' },
      { number: 4, name: 'P0.08 / RXD', side: 'left', type: 'gpio', functions: ['GPIO P0.08', 'UARTE0 RXD'], defaultRole: 'UART RX (Ruteable)', voltageTolerance: '3.3V', internalRegisterBit: 'NRF_P0->IN bit 8', description: 'Asignado al receptor UART con EasyDMA escribiendo 8 en NRF_UARTE0->PSEL.RXD.' },
      { number: 5, name: 'P0.11 / BTN1', side: 'left', type: 'gpio', functions: ['GPIO P0.11', 'GPIOTE EVENTS_IN[0]'], defaultRole: 'Botón -> Evento Hardware', voltageTolerance: '3.3V', internalRegisterBit: 'NRF_P0->IN bit 11', description: 'Al pulsarlo genera un EVENT_IN que puede viajar por el bus PPI sin ejecutar ni una línea de código en la CPU.' },
      { number: 6, name: 'P0.13 / LED1', side: 'right', type: 'gpio', functions: ['GPIO P0.13', 'GPIOTE TASKS_OUT[0]', 'PWM0 CH0'], defaultRole: 'LED 1 / Tarea Hardware', voltageTolerance: '3.3V', internalRegisterBit: 'NRF_P0->OUTSET bit 13', description: 'Conmutable tanto por software (OUTSET/OUTCLR) como automáticamente mediante una tarea TASKS_OUT.' },
      { number: 7, name: 'P0.26 / SDA', side: 'right', type: 'gpio', functions: ['GPIO P0.26', 'TWIM0 SDA (S0D1 Open-Drain)'], defaultRole: 'I2C SDA', voltageTolerance: '3.3V', internalRegisterBit: 'PIN_CNF[26].DRIVE = S0D1', description: 'En Nordic el modo Open-Drain se llama S0D1 (Standard 0, Disconnect 1) en el campo DRIVE.' },
      { number: 8, name: 'P0.27 / SCL', side: 'right', type: 'gpio', functions: ['GPIO P0.27', 'TWIM0 SCL'], defaultRole: 'I2C SCL', voltageTolerance: '3.3V', internalRegisterBit: 'PIN_CNF[27].DRIVE = S0D1', description: 'Reloj del maestro I2C con transferencia directa desde RAM.' },
      { number: 9, name: 'SWDIO', side: 'right', type: 'clock', functions: ['Serial Wire Debug Data'], defaultRole: 'SWD Debug Data', voltageTolerance: '3.3V', description: 'Interfaz de depuración ARM CoreSight.' },
      { number: 10, name: 'VSS / GND', side: 'right', type: 'gnd', functions: ['Tierra 0V'], defaultRole: 'GND', voltageTolerance: '0V', description: 'Referencia de tierra.' }
    ],
    memoryMap: [
      {
        region: 'Flash Interna de Código',
        startAddr: '0x0000_0000',
        endAddr: '0x000F_FFFF',
        size: '1 MB',
        bus: 'ICode / DCode Bus con Caché NVMC',
        type: 'flash',
        cStorageExample: 'const ble_uuid_t service_uuid = { ... };',
        description: 'A diferencia del STM32 (que mapea la Flash en 0x08000000), el nRF52840 empieza directamente en 0x00000000.'
      },
      {
        region: 'Data RAM (8 Bancos con retención selectiva en Sleep)',
        startAddr: '0x2000_0000',
        endAddr: '0x2003_FFFF',
        size: '256 KB',
        bus: 'AHB Multilayer Bus (Accesible por EasyDMA)',
        type: 'sram',
        cStorageExample: 'uint8_t tx_dma_buf[64]; // EasyDMA lee directo de aquí',
        description: 'Puedes apagar bancos individuales de RAM por software para ahorrar nanoamperios durante el modo sueño.'
      },
      {
        region: 'Periféricos e Interconexión PPI (P0, GPIOTE, TIMER, SAADC, PPI)',
        startAddr: '0x4000_0000',
        endAddr: '0x5000_0FFF',
        size: 'Ventana APB / AHB Periféricos',
        bus: 'Bus de Periféricos + Matriz de Eventos PPI',
        type: 'peripherals',
        cStorageExample: 'NRF_P0->OUTSET = (1UL << 5); // 0x50000508',
        description: 'El puerto GPIO P0 reside en 0x50000000 para acceso de alta velocidad desde el procesador.'
      }
    ],
    registers: [
      {
        id: 'P0_PIN_CNF5',
        name: 'NRF_P0->PIN_CNF[5] (Configuración Integral del Pin 5)',
        address: '0x50000714',
        offset: '+0x714',
        width: 32,
        resetValue: 0x00000002,
        access: 'R/W',
        peripheral: 'GPIO P0',
        summary: '¡Un registro de 32 bits dedicado exclusivamente a configurar todas las propiedades eléctricas del Pin P0.05!',
        whyItMatters: 'En vez de repartir la configuración de un pin en 4 registros distintos como STM32, Nordic dedica un registro entero por pin (PIN_CNF[0]..PIN_CNF[31]).',
        cMacroExample: 'NRF_P0->PIN_CNF[5] = (1U << 0) | (1U << 1); // DIR=Output, Input buffer desconectado',
        rawPointerExample: '*(volatile uint32_t *)0x50000714 = 0x00000003UL;',
        fields: [
          { name: 'SENSE[1:0]', bits: '17:16', msb: 17, lsb: 16, description: 'Detector de nivel en sueño profundo (Wake-on-Pin)' },
          { name: 'DRIVE[2:0]', bits: '10:8', msb: 10, lsb: 8, description: 'Fuerza de los transistores: 000=Estándar (S0S1), 011=Alta Corriente (H0H1), 110=Open-Drain (S0D1)', values: { '000': 'S0S1: Push-Pull Estándar', '011': 'H0H1: Alta Corriente (High Drive)', '110': 'S0D1: Open-Drain (para I2C)' } },
          { name: 'PULL[1:0]', bits: '3:2', msb: 3, lsb: 2, description: 'Resistencia interna: 00=Ninguna, 01=Pull-Down, 11=Pull-Up', values: { '00': 'Sin Pull', '01': 'Pull-Down (13 kΩ a GND)', '11': 'Pull-Up (13 kΩ a VDD)' } },
          { name: 'INPUT', bits: '1', msb: 1, lsb: 1, description: '0 = Conecta buffer de entrada Schmitt Trigger, 1 = Desconecta buffer para ahorrar energía' },
          { name: 'DIR', bits: '0', msb: 0, lsb: 0, description: 'Dirección del Pin: 0 = Entrada, 1 = Salida', values: { '0': 'Entrada (Input)', '1': 'Salida (Output)' } }
        ]
      },
      {
        id: 'P0_OUTSET',
        name: 'NRF_P0->OUTSET (Set Individual Bits in GPIO Port)',
        address: '0x50000508',
        offset: '+0x508',
        width: 32,
        resetValue: 0x00000000,
        access: 'R/W',
        peripheral: 'GPIO P0',
        summary: 'Escribir un 1 en cualquier bit pone ese pin a nivel ALTO (VDD) de manera atómica.',
        whyItMatters: 'Al leerlo devuelve el estado actual del registro OUT; al escribirlo solo enciende los bits puestos a 1.',
        cMacroExample: 'NRF_P0->OUTSET = (1UL << 5); // Pone P0.05 a HIGH',
        rawPointerExample: '*(volatile uint32_t *)0x50000508 = (1UL << 5);',
        fields: [
          { name: 'PIN31..PIN6', bits: '31:6', msb: 31, lsb: 6, description: 'Pone a HIGH los pines P0.31 a P0.06' },
          { name: 'PIN5', bits: '5', msb: 5, lsb: 5, description: 'Escribir 1 pone P0.05 a nivel ALTO (VDD)', values: { '0': 'Sin efecto', '1': 'P0.05 = HIGH' } },
          { name: 'PIN4..PIN0', bits: '4:0', msb: 4, lsb: 0, description: 'Pone a HIGH los pines P0.04 a P0.00' }
        ]
      },
      {
        id: 'P0_OUTCLR',
        name: 'NRF_P0->OUTCLR (Clear Individual Bits in GPIO Port)',
        address: '0x5000050C',
        offset: '+0x50C',
        width: 32,
        resetValue: 0x00000000,
        access: 'R/W',
        peripheral: 'GPIO P0',
        summary: 'Escribir un 1 en cualquier bit pone ese pin a nivel BAJO (0V) de manera atómica.',
        whyItMatters: 'Complemento atómico de OUTSET: apaga pines sin necesidad de usar &= ~.',
        cMacroExample: 'NRF_P0->OUTCLR = (1UL << 5); // Pone P0.05 a LOW (0V)',
        rawPointerExample: '*(volatile uint32_t *)0x5000050C = (1UL << 5);',
        fields: [
          { name: 'PIN31..PIN6', bits: '31:6', msb: 31, lsb: 6, description: 'Limpia a 0V los pines P0.31 a P0.06' },
          { name: 'PIN5', bits: '5', msb: 5, lsb: 5, description: 'Escribir 1 pone P0.05 a 0V (GND)', values: { '0': 'Sin efecto', '1': 'P0.05 = LOW (0V)' } },
          { name: 'PIN4..PIN0', bits: '4:0', msb: 4, lsb: 0, description: 'Limpia a 0V los pines P0.04 a P0.00' }
        ]
      }
    ],
    gpioComparison: {
      rawPointer: `// 1. Nivel Puntero Crudo (Product Specification nRF52840)
#define P0_OUTSET     (*(volatile uint32_t *)0x50000508UL)
#define P0_DIRSET     (*(volatile uint32_t *)0x50000518UL)

void led_init_and_on(void) {
    P0_DIRSET = (1UL << 5); // Configura P0.05 como salida atómicamente
    P0_OUTSET = (1UL << 5); // Pone P0.05 en HIGH atómicamente
}`,
      vendorCmsis: `// 2. Nivel Oficial Nordic MDK (nrf52840.h)
#include "nrf.h"

void led_init_and_on(void) {
    NRF_P0->PIN_CNF[5] = (GPIO_PIN_CNF_DIR_Output << GPIO_PIN_CNF_DIR_Pos) |
                         (GPIO_PIN_CNF_INPUT_Disconnect << GPIO_PIN_CNF_INPUT_Pos);
    NRF_P0->OUTSET = (1UL << 5);
}`,
      proDriver: `// 3. Nivel Automatización por Hardware PPI (¡0% uso de CPU!)
void connect_button_to_led_via_ppi(void) {
    // El evento del botón dispara la tarea del LED por un canal de hardware PPI:
    NRF_PPI->CH[0].EEP = (uint32_t)&NRF_GPIOTE->EVENTS_IN[0];
    NRF_PPI->CH[0].TEP = (uint32_t)&NRF_GPIOTE->TASKS_OUT[1];
    NRF_PPI->CHENSET   = (1UL << 0); // ¡La CPU puede dormir con __WFE() para siempre!
}`,
      assemblyOutput: `; Con PPI activo, el bucle principal en ensamblador es literalmente:
loop:
  wfe                   ; Wait For Event -> CPU apagada consumiendo 1.5 microamperios
  b loop                ; El hardware conmuta el pin sin ejecutar código en la CPU`,
      cyclesCount: '1 ciclo para OUTSET por CPU, o 0 ciclos de CPU cuando se enlaza mediante PPI.',
      explanation: 'La arquitectura de Nordic enseña cómo se diseña el hardware de ultra-bajo consumo actual: desacoplando los eventos físicos de la CPU.'
    }
  },

  rp2040: {
    id: 'rp2040',
    name: 'RP2040',
    manufacturer: 'Raspberry Pi Ltd',
    tagline: 'Arquitectura Dual-Core Simétrica, Bus SIO de 1 Ciclo y Aliases Atómicos en Hardware',
    badge: 'Dual Cortex-M0+ • Multicore & PIO',
    architecture: 'Dual-Core ARM Cortex-M0+ + Bus SIO (Single-Cycle I/O) + 8 Máquinas de Estado PIO',
    isa: 'ARMv6-M Thumb',
    bitWidth: 32,
    clockSpeed: '133 MHz',
    flash: '2 MB – 16 MB QSPI Externa con Caché XIP',
    ram: '264 KB Multi-Bank SRAM (6 bancos independientes)',
    operatingVoltage: '1.8V – 3.3V',
    packageType: 'QFN-56 (GPIO0 a GPIO29)',
    requiresClockGating: false,
    atomicSetMechanism: 'Bus SIO con registros dedicados (GPIO_OUT_SET, CLR, XOR) + Aliases atómicos universales (+0x1000 XOR, +0x2000 SET, +0x3000 CLR) para todos los periféricos',
    industryUseCases: [
      'Control determinista de alta velocidad, analizadores lógicos e interfaces industriales a medida (PIO)',
      'Sistemas embebidos de doble núcleo (Core 0 para comunicaciones y UI, Core 1 para control en tiempo real)',
      'Instrumentación digital y generación de protocolos propietarios sin jitter'
    ],
    pedagogicalRole:
      'Es una joya de ingeniería moderna: te enseña cómo dos núcleos comparten memoria y periféricos (SIO, Spinlocks y FIFOs), y tiene el truco de hardware más genial: cualquier registro de periférico tiene 3 direcciones alias (+0x1000, +0x2000, +0x3000) que ejecutan XOR, SET o CLEAR automáticamente en el puente de bus.',
    pros: [
      'Puerto SIO conectado directamente a los dos núcleos: cambia o invierte pines en exactamente 1 ciclo de reloj (7.5 ns)',
      'Registro GPIO_OUT_XOR dedicado para invertir pines sin leer su estado previo',
      '6 bancos de SRAM que permiten que Core 0, Core 1 y el DMA accedan a RAM en paralelo sin colisionar'
    ],
    cons: [
      'Núcleo Cortex-M0+ no tiene unidad de punto flotante (FPU) por hardware (usa rutinas optimizadas en ROM)'
    ],
    pins: [
      { number: 1, name: 'GPIO0 / UART0_TX', side: 'left', type: 'gpio', functions: ['SIO (F5)', 'UART0_TX (F2)', 'I2C0_SDA (F3)', 'PWM0_A (F4)', 'PIO0 (F6)'], defaultRole: 'GPIO0 / UART0 TX', voltageTolerance: '3.3V', internalRegisterBit: 'SIO->GPIO_OUT bit 0', description: 'Para usar un pin como GPIO controlado por la CPU, su registro CTRL debe seleccionarse en la Función 5 (SIO).' },
      { number: 2, name: 'GPIO1 / UART0_RX', side: 'left', type: 'gpio', functions: ['SIO (F5)', 'UART0_RX (F2)', 'I2C0_SCL (F3)', 'PWM0_B (F4)'], defaultRole: 'GPIO1 / UART0 RX', voltageTolerance: '3.3V', internalRegisterBit: 'SIO->GPIO_IN bit 1', description: 'Pin digital multifunción con multiplexor de 9 funciones.' },
      { number: 3, name: 'GPIO4 / I2C0_SDA', side: 'left', type: 'gpio', functions: ['SIO (F5)', 'I2C0_SDA (F3)', 'SPI0_RX (F1)'], defaultRole: 'I2C0 SDA / SPI0 MISO', voltageTolerance: '3.3V', internalRegisterBit: 'SIO bit 4', description: 'Línea de datos para periférico I2C0 o SPI0.' },
      { number: 4, name: 'GPIO5 / LED_EXT', side: 'left', type: 'gpio', functions: ['SIO (F5)', 'I2C0_SCL (F3)', 'PWM2_B (F4)', 'PIO0/PIO1'], defaultRole: 'GPIO5 Control SIO 1-Ciclo', voltageTolerance: '3.3V', internalRegisterBit: 'SIO->GPIO_OUT_SET bit 5', description: 'Controlable en un solo ciclo de reloj a través de la dirección 0xD0000014.' },
      { number: 5, name: 'GPIO25 / LED', side: 'right', type: 'gpio', functions: ['SIO (F5)', 'PWM4_B (F4)', 'PIO0/PIO1'], defaultRole: 'LED Integrado Pico (GPIO25)', voltageTolerance: '3.3V', internalRegisterBit: 'SIO bit 25', description: 'El famoso LED integrado en la Raspberry Pi Pico.' },
      { number: 6, name: 'GPIO26 / ADC0', side: 'right', type: 'analog', functions: ['ADC0 (12-bit 500ksps)', 'SIO (F5)', 'I2C1_SDA'], defaultRole: 'ADC Canal 0', voltageTolerance: '3.3V', internalRegisterBit: 'ADC->CSAIN = 0', description: 'Entrada analógica de 12 bits a 500.000 muestras por segundo con FIFO para DMA.' },
      { number: 7, name: 'RUN (Reset)', side: 'right', type: 'reset', functions: ['Global Asynchronous Reset'], defaultRole: 'Pin RUN / Reset', voltageTolerance: '3.3V', description: 'Llevar a GND detiene ambos núcleos Cortex-M0+.' },
      { number: 8, name: 'GND', side: 'right', type: 'gnd', functions: ['Referencia 0V'], defaultRole: 'Tierra', voltageTolerance: '0V', description: 'Tierra común.' }
    ],
    memoryMap: [
      {
        region: 'Boot ROM Interna (Rutinas Flotantes y Bootloader UF2)',
        startAddr: '0x0000_0000',
        endAddr: '0x0000_3FFF',
        size: '16 KB ROM',
        bus: 'AHB-Lite Crossbar',
        type: 'flash',
        cStorageExample: 'rom_func_lookup(...);',
        description: 'Grabada en fábrica: incluye funciones matemáticas rápidas y el gestor de carga por USB.'
      },
      {
        region: 'Flash Externa XIP (Execute-In-Place con Caché)',
        startAddr: '0x1000_0000',
        endAddr: '0x10FF_FFFF',
        size: 'Hasta 16 MB',
        bus: 'Bus QSPI + Caché XIP de 16 KB',
        type: 'flash',
        cStorageExample: 'const uint16_t audio_sample[] = { ... };',
        description: 'El código C vive aquí y se ejecuta al vuelo gracias a la caché XIP.'
      },
      {
        region: 'SRAM Multi-Banco (6 Bancos AHB Paralelos)',
        startAddr: '0x2000_0000',
        endAddr: '0x2004_1FFF',
        size: '264 KB',
        bus: 'Crossbar 4x4 sin cuellos de botella',
        type: 'sram',
        cStorageExample: 'uint32_t core1_stack[512];',
        description: 'Permite que Core 0, Core 1 y el DMA lean/escriban en bancos distintos en el mismo ciclo de reloj.'
      },
      {
        region: 'Periféricos APB con Aliases Atómicos (+0x1000 XOR, +0x2000 SET, +0x3000 CLR)',
        startAddr: '0x4000_0000',
        endAddr: '0x4FFF_FFFF',
        size: 'Ventana APB con Decodificador Atómico',
        bus: 'Puente APB',
        type: 'peripherals',
        cStorageExample: 'hw_set_bits(&timer_hw->inte, 1U); // Escribe en addr + 0x2000',
        description: 'Cualquier registro periférico tiene 4 direcciones: Normal (+0x0000), XOR (+0x1000), SET (+0x2000) y CLEAR (+0x3000).'
      },
      {
        region: 'Bloque SIO (Single-Cycle I/O — Exclusivo de CPU)',
        startAddr: '0xD000_0000',
        endAddr: '0xD000_017F',
        size: 'Registros Ultra-Rápidos de 1 Ciclo',
        bus: 'Puerto Directo IOPORT de los Cortex-M0+',
        type: 'peripherals',
        cStorageExample: 'sio_hw->gpio_set = (1UL << 5); // 0xD0000014',
        description: 'Contiene el identificador de núcleo (CPUID), FIFOs inter-core, Spinlocks y control GPIO de 1 ciclo.'
      }
    ],
    registers: [
      {
        id: 'SIO_GPIO_OE_SET',
        name: 'SIO_GPIO_OE_SET (Output Enable Set — 1 Ciclo)',
        address: '0xD0000024',
        offset: '+0x024',
        width: 32,
        resetValue: 0x00000000,
        access: 'WO',
        peripheral: 'SIO',
        summary: 'Habilita como SALIDA cualquier pin cuyo bit escribas como 1 en el puerto SIO de ciclo único.',
        whyItMatters: 'Funciona sin pasar por el puente de bus APB, directamente en el puerto local de alta velocidad del procesador.',
        cMacroExample: 'sio_hw->gpio_oe_set = (1UL << 5); // Habilita salida en GPIO5',
        rawPointerExample: '*(volatile uint32_t *)0xD0000024UL = (1UL << 5);',
        fields: [
          { name: 'GPIO_OE_SET[29:6]', bits: '29:6', msb: 29, lsb: 6, description: 'Activa salida para GPIO29..GPIO6' },
          { name: 'GPIO_OE_SET[5]', bits: '5', msb: 5, lsb: 5, description: 'Escribir 1 activa el driver de salida para GPIO5', values: { '0': 'Sin efecto', '1': 'GPIO5 = Output Enabled' } },
          { name: 'GPIO_OE_SET[4:0]', bits: '4:0', msb: 4, lsb: 0, description: 'Activa salida para GPIO4..GPIO0' }
        ]
      },
      {
        id: 'SIO_GPIO_OUT_SET',
        name: 'SIO_GPIO_OUT_SET (GPIO Output Atomic Set)',
        address: '0xD0000014',
        offset: '+0x014',
        width: 32,
        resetValue: 0x00000000,
        access: 'WO',
        peripheral: 'SIO',
        summary: 'Pone a 3.3V (HIGH) los pines seleccionados en 1 solo ciclo de reloj (7.5 ns a 133 MHz).',
        whyItMatters: 'Es seguro incluso si Core 0 y Core 1 intentan controlar distintos pines del mismo puerto al mismo tiempo.',
        cMacroExample: 'sio_hw->gpio_set = (1UL << 5); // GPIO5 = HIGH',
        rawPointerExample: '*(volatile uint32_t *)0xD0000014UL = (1UL << 5);',
        fields: [
          { name: 'GPIO_OUT_SET[29:6]', bits: '29:6', msb: 29, lsb: 6, description: 'Pone a HIGH GPIO29..GPIO6' },
          { name: 'GPIO_OUT_SET[5]', bits: '5', msb: 5, lsb: 5, description: 'Escribir 1 pone GPIO5 a 3.3V en 1 ciclo de reloj', values: { '0': 'Sin efecto', '1': 'GPIO5 = 3.3V (HIGH)' } },
          { name: 'GPIO_OUT_SET[4:0]', bits: '4:0', msb: 4, lsb: 0, description: 'Pone a HIGH GPIO4..GPIO0' }
        ]
      },
      {
        id: 'SIO_GPIO_OUT_XOR',
        name: 'SIO_GPIO_OUT_XOR (GPIO Output Atomic Toggle)',
        address: '0xD000001C',
        offset: '+0x01C',
        width: 32,
        resetValue: 0x00000000,
        access: 'WO',
        peripheral: 'SIO',
        summary: 'Invierte (Toggle) el estado de cualquier pin escribiendo un 1 en su posición de bit.',
        whyItMatters: 'En STM32 el registro BSRR permite encender o apagar, pero para invertir hay que leer ODR. En RP2040 tienes un registro XOR en hardware.',
        cMacroExample: 'sio_hw->gpio_togl = (1UL << 5); // Invierte GPIO5 en 1 ciclo',
        rawPointerExample: '*(volatile uint32_t *)0xD000001CUL = (1UL << 5);',
        fields: [
          { name: 'GPIO_OUT_XOR[29:6]', bits: '29:6', msb: 29, lsb: 6, description: 'Invierte los pines GPIO29..GPIO6' },
          { name: 'GPIO_OUT_XOR[5]', bits: '5', msb: 5, lsb: 5, description: 'Escribir 1 invierte el estado actual de GPIO5 (0->1 o 1->0)', values: { '0': 'Sin efecto', '1': 'Invierte (Toggle) GPIO5' } },
          { name: 'GPIO_OUT_XOR[4:0]', bits: '4:0', msb: 4, lsb: 0, description: 'Invierte los pines GPIO4..GPIO0' }
        ]
      }
    ],
    gpioComparison: {
      rawPointer: `// 1. Nivel Puntero Crudo (Datasheet RP2040 - Single-Cycle I/O Block)
#define IO_BANK0_GPIO5_CTRL  (*(volatile uint32_t *)0x4001402CUL)
#define SIO_GPIO_OE_SET      (*(volatile uint32_t *)0xD0000024UL)
#define SIO_GPIO_OUT_SET     (*(volatile uint32_t *)0xD0000014UL)

void led_init_and_on(void) {
    IO_BANK0_GPIO5_CTRL = 5;           // Función 5 = Conectar pin al bloque SIO
    SIO_GPIO_OE_SET     = (1UL << 5);  // Habilitar salida en 1 ciclo
    SIO_GPIO_OUT_SET    = (1UL << 5);  // Poner a 3.3V en 1 ciclo
}`,
      vendorCmsis: `// 2. Nivel Oficial Raspberry Pi Pico SDK (hardware/structs/sio.h)
#include "hardware/structs/sio.h"
#include "hardware/structs/iobank0.h"

void led_init_and_on(void) {
    iobank0_hw->io[5].ctrl = GPIO_FUNC_SIO;
    sio_hw->gpio_oe_set    = (1UL << 5);
    sio_hw->gpio_set       = (1UL << 5);
}`,
      proDriver: `// 3. Nivel Aliases Atómicos de Hardware RP2040 (+0x2000 = SET, +0x3000 = CLR)
#define REG_ALIAS_SET_BITS(addr) (*(volatile uint32_t *)((uintptr_t)(addr) | 0x2000UL))

void atomic_peripheral_bit_set(volatile uint32_t *reg, uint32_t mask) {
    // El puente de bus del RP2040 hace el OR en hardware sin que la CPU lea el registro:
    REG_ALIAS_SET_BITS(reg) = mask;
}`,
      assemblyOutput: `; Compilado con arm-none-eabi-gcc -O2 (Cortex-M0+ Single-Cycle IOPORT):
ldr  r3, =0xd0000000    ; Base del puerto SIO
movs r2, #32            ; (1 << 5)
str  r2, [r3, #20]      ; Escribe en SIO_GPIO_OUT_SET (+0x14) en 1 solo ciclo de reloj!`,
      cyclesCount: '1 ciclo de reloj en el bus IOPORT (7.5 nanosegundos a 133 MHz).',
      explanation: 'El RP2040 demuestra cómo un bus dedicado de ciclo único (SIO) y registros atómicos en hardware permiten que dos núcleos trabajen en paralelo sin pisarse.'
    }
  }
};

export const MCU_LIST: MCUProfile[] = [
  MCU_CATALOG.atmega328p,
  MCU_CATALOG.stm32f401,
  MCU_CATALOG.esp32c3,
  MCU_CATALOG.nrf52840,
  MCU_CATALOG.rp2040
];
