/**
 * @file StudySlidesDeck.tsx
 * @description Modo "Slides de Estudio" (Pizarra Técnica de Diapositivas para Cuaderno Físico).
 *
 * Transforma el contenido del módulo actual en una secuencia de láminas técnicas limpias
 * diseñadas específicamente para que el usuario estudie a su ritmo y transcriba
 * cómodamente esquemas, fórmulas, tablas y código canónico a su cuaderno de papel.
 *
 * Estructura de cada mazo (5 Láminas por Módulo):
 * - Lámina 1: Silicio & Definición Nuclear (Mito desmentido y Glosario físico).
 * - Lámina 2: Esquema Técnico para Dibujar a Mano (con guía paso a paso y fondo milimetrado).
 * - Lámina 3: Fórmulas Matemáticas de Ingeniería & Tabla de Referencia.
 * - Lámina 4: Código C Canónico Comentado Línea a Línea.
 * - Lámina 5: Reglas de Oro Normativas (ECSS / NASA / MISRA) & Trampa Mortal de Producción.
 */

import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Grid,
  BookOpen,
  Sparkles,
  ShieldAlert,
  Code,
  Binary,
  Layers,
  X,
  Printer
} from 'lucide-react';
import { CourseModule } from '../data/curriculumData';
import { ModuleExtendedContent } from '../data/notebookAndExercisesData';
import { DeepTheoryChapter } from '../data/deepTheoryData';
import { MCUProfile } from '../data/mcusData';
import { CCodeBlock } from './CSyntaxCodeBlock';

interface StudySlidesDeckProps {
  module: CourseModule;
  extended: ModuleExtendedContent;
  chapters: DeepTheoryChapter[];
  mcu: MCUProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const StudySlidesDeck: React.FC<StudySlidesDeckProps> = ({
  module,
  extended,
  chapters,
  mcu,
  isOpen,
  onClose
}) => {
  const [slideIndex, setSlideIndex] = useState<number>(0);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);

  // Keyboard navigation: Left/Right arrows and ESC to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        setSlideIndex((prev) => Math.min(4, prev + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        setSlideIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'Escape') {
        if (isFullScreen) {
          setIsFullScreen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isFullScreen, onClose]);

  // Reset to slide 0 when module changes
  useEffect(() => {
    setSlideIndex(0);
  }, [module.id]);

  if (!isOpen) return null;

  const totalSlides = 5;
  const slideTitles = [
    '1. Silicio & Definición Nuclear',
    '2. Esquema para Dibujar a Mano',
    '3. Fórmulas & Tablas Técnicas',
    '4. Código Canónico Línea a Línea',
    '5. Regla de Oro & Trampa Mortal'
  ];

  // Derive relevant chapter data
  const mainChapter = chapters[0];
  const secondChapter = chapters[1] || chapters[0];
  const firstDef = extended.definitions[0];
  const secondDef = extended.definitions[1] || extended.definitions[0];
  const firstRule = extended.goldenRules[0];
  const firstPitfall = mainChapter?.pitfalls?.[0];

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-2 sm:p-4 transition-all ${
        isFullScreen ? 'p-0' : ''
      }`}
    >
      <div
        className={`bg-slate-950 border-2 border-cyan-400 text-slate-100 flex flex-col shadow-2xl transition-all overflow-hidden ${
          isFullScreen
            ? 'w-screen h-screen rounded-none border-none'
            : 'w-full max-w-5xl h-[92vh] max-h-[850px] rounded-xl'
        }`}
      >
        {/* Retro Header Bar */}
        <div className="bg-[#0b1b2b] border-b-2 border-cyan-500/60 px-4 py-2.5 flex items-center justify-between gap-3 text-xs font-pixel shrink-0">
          <div className="flex items-center gap-2 text-cyan-300">
            <span className="px-2 py-0.5 bg-cyan-400 text-slate-950 font-bold border border-black">
              SLIDES // CUADERNO
            </span>
            <span className="truncate">
              MÓDULO {module.id}: {module.title.replace(/^Módulo \d+:\s*/, '')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGrid(!showGrid)}
              title="Alternar fondo de cuadrícula milimetrada para dibujo"
              className={`p-1.5 rounded border text-xs font-mono flex items-center gap-1 transition-all ${
                showGrid
                  ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cuadrícula</span>
            </button>

            <button
              onClick={() => window.print()}
              title="Imprimir lámina actual para el cuaderno"
              className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>

            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              title={isFullScreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
              className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white"
            >
              {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={onClose}
              title="Cerrar modo diapositivas"
              className="p-1.5 rounded bg-rose-950/60 hover:bg-rose-900 border border-rose-500/60 text-rose-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Slide Progress Indicator Bar */}
        <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-1.5 flex items-center justify-between text-xs font-mono shrink-0">
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-0.5">
            {slideTitles.map((title, idx) => (
              <button
                key={idx}
                onClick={() => setSlideIndex(idx)}
                className={`px-2 py-0.5 rounded text-[11px] whitespace-nowrap transition-all ${
                  slideIndex === idx
                    ? 'bg-cyan-400 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {title}
              </button>
            ))}
          </div>
          <span className="text-[11px] font-bold text-cyan-300 font-pixel pl-2 shrink-0">
            LÁMINA {slideIndex + 1}/{totalSlides}
          </span>
        </div>

        {/* Main Slide Canvas */}
        <div
          className={`flex-1 overflow-y-auto p-4 sm:p-8 relative ${
            showGrid
              ? 'bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] bg-slate-950'
              : 'bg-slate-950'
          }`}
        >
          {/* =================================================================
              SLIDE 1: SILICIO & DEFINICIÓN NUCLEAR
             ================================================================= */}
          {slideIndex === 0 && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                  Lámina 1 // Fundamento Nuclear para tu Cuaderno
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-pixel text-white mt-1">
                  {module.title}
                </h3>
                <p className="text-sm font-mono text-amber-300 mt-1">{module.subtitle}</p>
              </div>

              {/* Mito vs Realidad en Silicio */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-rose-950/20 border-2 border-rose-500/40 space-y-2">
                  <div className="text-xs font-pixel font-bold text-rose-300 uppercase">
                    ❌ El Mito Superficial (Lo que debes tachar)
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-mono">
                    "{module.superficialMyth}"
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-950/25 border-2 border-emerald-400/50 space-y-2">
                  <div className="text-xs font-pixel font-bold text-emerald-300 uppercase flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> ✔️ La Realidad del Silicio (Lo que debes copiar)
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-mono">
                    {module.overwhelmingDatasheet}
                  </p>
                </div>
              </div>

              {/* Glosario de Realidad Física en Silicio */}
              {firstDef && (
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="text-xs font-bold font-mono text-amber-300 uppercase flex items-center gap-2">
                    <BookOpen className="w-4 h-4" /> Definición Canónica para la Libreta
                  </div>
                  <div className="p-3 bg-black/70 rounded-lg border border-slate-800 space-y-2">
                    <div className="text-sm font-bold text-white font-mono">{firstDef.term}</div>
                    <div className="text-xs text-slate-300 leading-normal">{firstDef.definition}</div>
                    <div className="text-xs text-cyan-300 font-mono bg-cyan-950/30 p-2 rounded border border-cyan-800/40">
                      ⚡ <strong>En silicio:</strong> {firstDef.siliconReality}
                    </div>
                  </div>
                  {secondDef && secondDef !== firstDef && (
                    <div className="p-3 bg-black/70 rounded-lg border border-slate-800 space-y-2">
                      <div className="text-sm font-bold text-white font-mono">{secondDef.term}</div>
                      <div className="text-xs text-slate-300 leading-normal">{secondDef.definition}</div>
                      <div className="text-xs text-cyan-300 font-mono bg-cyan-950/30 p-2 rounded border border-cyan-800/40">
                        ⚡ <strong>En silicio:</strong> {secondDef.siliconReality}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* =================================================================
              SLIDE 2: ESQUEMA TÉCNICO PARA DIBUJAR A MANO
             ================================================================= */}
          {slideIndex === 1 && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                  Lámina 2 // Guía de Dibujo Técnico Manual
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-pixel text-white mt-1">
                  Esquema de Hardware para Trazar en Papel
                </h3>
                <p className="text-sm font-mono text-slate-300 mt-1">
                  Toma tu regla y lápiz. Sigue esta secuencia para plasmar el circuito en tu cuaderno físico.
                </p>
              </div>

              {/* Canvas SVG de Esquema Técnico */}
              <div className="p-6 rounded-xl bg-black border-2 border-cyan-500/40 flex flex-col items-center justify-center min-h-[220px]">
                <div className="w-full max-w-lg p-4 bg-slate-950 border border-slate-800 rounded-lg font-mono text-xs text-slate-300 space-y-3">
                  <div className="flex items-center justify-between text-cyan-300 border-b border-slate-800 pb-1.5 font-bold">
                    <span>MICROCONTROLADOR ({mcu.name})</span>
                    <span>BUS INTERNO ({mcu.bitWidth}-BIT)</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                    <div className="p-2 bg-slate-900 border border-slate-700 rounded text-amber-300">
                      NÚCLEO CPU<br />
                      <span className="text-[9px] text-slate-400">{mcu.architecture}</span>
                    </div>
                    <div className="p-2 bg-cyan-950/40 border border-cyan-600 rounded text-cyan-300 flex items-center justify-center font-bold">
                      ◄─ BUS AHB/APB ─►
                    </div>
                    <div className="p-2 bg-slate-900 border border-slate-700 rounded text-emerald-300">
                      REGISTRO MMIO<br />
                      <span className="text-[9px] text-slate-400">Pines & Periférico</span>
                    </div>
                  </div>
                  <div className="p-2 rounded bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 text-center">
                    Cotas: Resistencia Pull-Up: 10 kΩ • Corriente máxima pin: 20 mA • Tensión lógica: {mcu.operatingVoltage}
                  </div>
                </div>
              </div>

              {/* Guía Paso a Paso de Dibujo */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="text-xs font-bold font-mono text-cyan-300 uppercase flex items-center gap-2">
                  <Layers className="w-4 h-4" /> Pasos Recomendados para tu Libreta
                </div>
                <div className="space-y-2">
                  {extended.sketchDiagramSteps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-xs font-mono text-slate-200">
                      <span className="w-6 h-6 rounded bg-cyan-400 text-slate-950 font-bold flex items-center justify-center shrink-0 text-xs">
                        {idx + 1}
                      </span>
                      <p className="pt-0.5 leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              SLIDE 3: FÓRMULAS & TABLAS TÉCNICAS
             ================================================================= */}
          {slideIndex === 2 && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                  Lámina 3 // Fórmulas & Tablas Comparativas
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-pixel text-white mt-1">
                  Relaciones Matemáticas & Registros Clave
                </h3>
                <p className="text-sm font-mono text-slate-300 mt-1">
                  Copia estas fórmulas y tablas en una página dedicada de tu cuaderno para consulta rápida.
                </p>
              </div>

              {/* Fórmulas Destacadas */}
              {mainChapter?.formulas && mainChapter.formulas.length > 0 && (
                <div className="space-y-3">
                  <div className="text-xs font-bold font-mono text-amber-300 uppercase">
                    Fórmulas de Ingeniería Fundamentales
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {mainChapter.formulas.map((form, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-slate-900 border-2 border-amber-500/40 space-y-2">
                        <div className="text-xs font-mono font-bold text-amber-300">{form.name}</div>
                        <div className="p-2.5 rounded bg-black font-mono text-sm text-cyan-300 font-bold border border-slate-800 text-center">
                          {form.expression}
                        </div>
                        <p className="text-xs text-slate-300 leading-normal">{form.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tabla Técnica de Referencia */}
              {mainChapter?.table && (
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 overflow-x-auto">
                  <div className="text-xs font-bold font-mono text-cyan-300 uppercase">
                    Tabla de Datos para Transcribir
                  </div>
                  <table className="w-full text-left font-mono text-xs border border-slate-800">
                    <thead className="bg-black text-cyan-300 border-b border-slate-800">
                      <tr>
                        {mainChapter.table.headers.map((h, i) => (
                          <th key={i} className="p-2.5 border-r border-slate-800 last:border-r-0 font-bold">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-200">
                      {mainChapter.table.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-950/80">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="p-2.5 border-r border-slate-800 last:border-r-0 text-[11px]">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* =================================================================
              SLIDE 4: CÓDIGO CANÓNICO COMENTADO LÍNEA A LÍNEA
             ================================================================= */}
          {slideIndex === 3 && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                  Lámina 4 // Código C Canónico para Transcribir
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-pixel text-white mt-1">
                  Implementación para {mcu.name}
                </h3>
                <p className="text-sm font-mono text-slate-300 mt-1">
                  Escribe a mano cada instrucción en tu cuaderno prestando atención a los tipos enteros exactos y los operadores a nivel de bit.
                </p>
              </div>

              {/* Bloque de Código con Sintaxis VSCode */}
              <div className="rounded-xl overflow-hidden border-2 border-slate-800 shadow-xl">
                <div className="bg-[#1e1e1e] px-4 py-2 flex items-center justify-between border-b border-slate-800 text-xs font-mono text-slate-400">
                  <span className="flex items-center gap-1.5 text-cyan-300">
                    <Code className="w-4 h-4" /> firmware_canonico.c
                  </span>
                  <span>Target: {mcu.name}</span>
                </div>
                <div className="p-3 bg-[#1e1e1e] overflow-x-auto">
                  <CCodeBlock code={extended.annotatedCodeToCopy.code} />
                </div>
              </div>

              {/* Nota de Arquitectura y Ensamblador */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-cyan-300 font-bold block">💡 Ensamblador generado:</span>
                  <p className="text-slate-300 leading-normal">{module.mcuCode[mcu.id].asmInsight}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-amber-300 font-bold block">⚡ Realidad de hardware:</span>
                  <p className="text-slate-300 leading-normal">{module.mcuCode[mcu.id].hardwareNote}</p>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              SLIDE 5: REGLA DE ORO & TRAMPA MORTAL DE PRODUCCIÓN
             ================================================================= */}
          {slideIndex === 4 && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider">
                  Lámina 5 // Reglas de Oro & Prevención de Fallos
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-pixel text-white mt-1">
                  Seguridad Crítica & Normativa Aeroespacial
                </h3>
                <p className="text-sm font-mono text-slate-300 mt-1">
                  El sello de un ingeniero senior: saber qué está terminantemente prohibido para evitar caídas del sistema en producción.
                </p>
              </div>

              {/* Regla de Oro con Referencia Normativa */}
              {firstRule && (
                <div className="p-5 rounded-xl bg-purple-950/25 border-2 border-purple-500/50 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-800/40 pb-2">
                    <span className="text-xs font-pixel font-bold text-purple-300 uppercase flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4" /> REGLA DE ORO OBLIGATORIA
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-900 text-purple-200 border border-purple-700">
                      NORMATIVA / REGLA
                    </span>
                  </div>
                  <div className="text-sm font-bold text-white font-mono leading-snug">
                    {firstRule.title}: "{firstRule.formulaOrRule}"
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-mono">
                    <strong>Justificación Técnica:</strong> {firstRule.explanation}
                  </p>
                </div>
              )}

              {/* Trampa Mortal de Producción */}
              {firstPitfall && (
                <div className="p-5 rounded-xl bg-rose-950/25 border-2 border-rose-500/50 space-y-3">
                  <div className="text-xs font-pixel font-bold text-rose-400 uppercase flex items-center gap-1.5">
                    ⚠️ TRAMPA MORTAL EN PRODUCCIÓN (A EVITAR A TODA COSTA)
                  </div>
                  <div className="p-3 rounded-lg bg-black/70 border border-rose-900/60 space-y-1.5">
                    <div className="text-xs font-bold text-rose-300 font-mono">
                      Error: {firstPitfall.mistake}
                    </div>
                    <div className="text-xs text-slate-300 leading-normal">
                      <strong>Por qué falla físicamente:</strong> {firstPitfall.whyItFails}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/40 space-y-1">
                    <div className="text-xs font-bold text-emerald-300 font-mono">
                      ✓ La Solución Senior Definitiva:
                    </div>
                    <div className="text-xs text-slate-200 leading-normal">
                      {firstPitfall.seniorFix}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Slide Navigation Footer Bar */}
        <div className="bg-[#0b1b2b] border-t-2 border-slate-800 p-3 sm:px-6 flex items-center justify-between gap-3 text-xs font-mono shrink-0">
          <button
            onClick={() => setSlideIndex((i) => Math.max(0, i - 1))}
            disabled={slideIndex === 0}
            className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 disabled:opacity-30 border border-slate-700 text-slate-200 flex items-center gap-1.5 font-bold transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Lámina Anterior</span>
          </button>

          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSlides }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setSlideIndex(idx)}
                className={`w-3 h-3 rounded-full transition-all ${
                  slideIndex === idx ? 'bg-cyan-400 scale-125' : 'bg-slate-700 hover:bg-slate-500'
                }`}
                title={`Ir a lámina ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={() => setSlideIndex((i) => Math.min(totalSlides - 1, i + 1))}
            disabled={slideIndex === totalSlides - 1}
            className="px-3 py-1.5 rounded bg-cyan-400 hover:bg-cyan-300 disabled:opacity-30 text-slate-950 font-bold flex items-center gap-1.5 transition-all"
          >
            <span className="hidden sm:inline">Siguiente Lámina</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
