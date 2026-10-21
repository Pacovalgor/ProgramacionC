/**
 * @file App.tsx
 * @description Componente principal de la plataforma interactiva de Programación C en Sistemas Embebidos.
 *
 * Responsabilidades arquitectónicas:
 * 1. Gestión del estado global del microcontrolador activo (`selectedMcuId` entre los 5 chips reales).
 * 2. Navegación entre los 18 Módulos del curso (`Módulo 0` a `Módulo 17`) y sincronización automática
 *    con la estación de laboratorio recomendada (`activeLab`).
 * 3. Persistencia local en `localStorage` del progreso de módulos superados (`programacion_c_completed_modules`).
 * 4. Coordinación del motor de retos de programación C en 3 niveles por módulo mediante `evaluateEmbeddedCCode`.
 * 5. Renderizado estructurado orientado a estudio en cuaderno físico: Puente Pedagógico, Capítulos de
 *    Teoría Profunda, Diccionario Técnico, Fórmulas, Esquemas para dibujar, Código en 3 niveles de abstracción,
 *    Laboratorios Interactivos y Baterías de Autoevaluación.
 */

import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Award,
  Sparkles,
  Code2,
  ChevronRight,
  ChevronLeft,
  Terminal,
  ShieldCheck,
  GitCompare,
  Zap,
  CheckCircle2,
  XCircle,
  BookMarked,
  BookOpen,
  AlertTriangle
} from 'lucide-react';
import { MCU_CATALOG, MCU_LIST, MCUId } from './data/mcusData';
import { COURSE_MODULES } from './data/curriculumData';
import { MODULE_EXTENDED_DATA } from './data/notebookAndExercisesData';
import { DEEP_THEORY_BY_MODULE } from './data/deepTheoryData';
import {
  InteractiveLabs,
  ExtendedLabViewType,
  evaluateEmbeddedCCode
} from './components/InteractiveLabs';
import { CCodeBlock, CInlineCode, CLiveCodeEditor } from './components/CSyntaxCodeBlock';

/** Clave utilizada en `localStorage` para persistir los IDs de los módulos completados por el estudiante. */
const COMPLETED_MODULES_STORAGE_KEY = 'programacion_c_completed_modules';

/**
 * Icono SVG en Pixel-Art puro (rejilla 16x16 con `crispEdges`) que representa
 * un microprocesador cerámico DIP de los años 80 con pines dorados y dado de silicio brillante.
 */
function PixelChip8BitIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      className="w-9 h-9 shrink-0"
      aria-hidden="true"
    >
      {/* Pines metálicos izquierda y derecha (Dorado/Ámbar P3) */}
      <rect x="1" y="3" width="2" height="1" fill="#ffb000" />
      <rect x="1" y="6" width="2" height="1" fill="#ffb000" />
      <rect x="1" y="9" width="2" height="1" fill="#ffb000" />
      <rect x="1" y="12" width="2" height="1" fill="#ffb000" />
      <rect x="13" y="3" width="2" height="1" fill="#ffb000" />
      <rect x="13" y="6" width="2" height="1" fill="#ffb000" />
      <rect x="13" y="9" width="2" height="1" fill="#ffb000" />
      <rect x="13" y="12" width="2" height="1" fill="#ffb000" />
      {/* Pines metálicos arriba y abajo */}
      <rect x="4" y="1" width="1" height="2" fill="#ffb000" />
      <rect x="7" y="1" width="2" height="2" fill="#ffb000" />
      <rect x="11" y="1" width="1" height="2" fill="#ffb000" />
      <rect x="4" y="13" width="1" height="2" fill="#ffb000" />
      <rect x="7" y="13" width="2" height="2" fill="#ffb000" />
      <rect x="11" y="13" width="1" height="2" fill="#ffb000" />
      {/* Encapsulado cerámico negro/cian de 8-bit */}
      <rect x="3" y="2" width="10" height="12" fill="#07131d" />
      <rect x="3" y="2" width="10" height="1" fill="#00f0ff" />
      <rect x="3" y="13" width="10" height="1" fill="#00f0ff" />
      <rect x="3" y="2" width="1" height="12" fill="#00f0ff" />
      <rect x="12" y="2" width="1" height="12" fill="#00f0ff" />
      {/* Muesca de orientación Pin 1 (Arriba) */}
      <rect x="7" y="2" width="2" height="2" fill="#ffb000" />
      {/* Dado central de Silicio (Fósforo Verde P31) */}
      <rect x="5" y="5" width="6" height="6" fill="#00ff66" />
      <rect x="6" y="6" width="4" height="4" fill="#051b11" />
      <rect x="7" y="7" width="2" height="2" fill="#00f0ff" />
    </svg>
  );
}

export function App() {
  // Microcontrolador activo seleccionado en la cabecera (por defecto STM32F401RE)
  const [selectedMcuId, setSelectedMcuId] = useState<MCUId>('stm32f401');
  // Paleta de color ochentera activa (Turbo C MS-DOS, Pixel 8-Bit Arcade, Fósforo Ámbar P3 o Fósforo Verde P31)
  const [retroTheme, setRetroTheme] = useState<'theme-turboc' | 'theme-arcade' | 'theme-amber' | 'theme-green'>('theme-turboc');
  // Interruptor de líneas de escaneo de monitor CRT ochentero (desactivado por defecto para máxima nitidez de texto)
  const [crtScanlines, setCrtScanlines] = useState<boolean>(false);
  // Módulo activo del plan de estudios (0 = Base C .. 11 = Normativa ECSS/NASA)
  const [activeModuleId, setActiveModuleId] = useState<number>(0);
  // Nivel de abstracción del código C mostrado (Puntero crudo, Struct CMSIS/SDK o Driver Profesional)
  const [abstractionLevel, setAbstractionLevel] = useState<'rawPointer' | 'cmsisStruct' | 'proDriver'>('cmsisStruct');
  // Alterna la vista simultánea del código en los 5 microcontroladores en paralelo
  const [compareAllMcusCode, setCompareAllMcusCode] = useState<boolean>(false);
  // Muestra/oculta la matriz técnica desplegable comparando los 5 chips
  const [showSpecsMatrix, setShowSpecsMatrix] = useState<boolean>(false);
  // Estación activa del Laboratorio Interactivo (Lab 0 a Lab 9)
  const [activeLab, setActiveLab] = useState<ExtendedLabViewType>('c-memory-pointers');

  // Estado de respuestas seleccionadas en los retos tipo test y módulos completados
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [completedModules, setCompletedModules] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(COMPLETED_MODULES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Estado de los 3 retos prácticos de programación C por módulo (Nivel 1, Nivel 2 y Nivel 3)
  const [selectedChallengeIdx, setSelectedChallengeIdx] = useState<number>(0);
  const [challengeCodeInput, setChallengeCodeInput] = useState<string>('');
  const [showChallengeHint, setShowChallengeHint] = useState<boolean>(false);
  const [showChallengeSolution, setShowChallengeSolution] = useState<boolean>(false);
  const [solvedChallengeKeys, setSolvedChallengeKeys] = useState<Record<string, boolean>>({});

  // Resolución de datos derivados para el microcontrolador y módulo actuales
  const currentMcu = MCU_CATALOG[selectedMcuId];
  const currentModule = COURSE_MODULES.find((m) => m.id === activeModuleId) || COURSE_MODULES[0];
  const currentExtended = MODULE_EXTENDED_DATA[currentModule.id] || MODULE_EXTENDED_DATA[0];
  const currentDeepChapters = DEEP_THEORY_BY_MODULE[currentModule.id] || [];
  const currentCodingChallenge =
    currentExtended.codingChallenges[selectedChallengeIdx] || currentExtended.codingChallenges[0];
  const moduleCodeForMcu = currentModule.mcuCode[selectedMcuId];

  // Al cambiar de módulo, reinicia el selector de reto práctico al Nivel 1 (índice 0)
  useEffect(() => {
    setSelectedChallengeIdx(0);
    const firstChallenge = (MODULE_EXTENDED_DATA[activeModuleId] || MODULE_EXTENDED_DATA[0]).codingChallenges[0];
    setChallengeCodeInput(firstChallenge.starterCode);
    setShowChallengeHint(false);
    setShowChallengeSolution(false);
  }, [activeModuleId]);

  /**
   * Cambia entre los 3 niveles de dificultad del reto de código C dentro del módulo activo.
   */
  const handleSelectChallengeLevel = (idx: number) => {
    setSelectedChallengeIdx(idx);
    const ch = currentExtended.codingChallenges[idx];
    if (ch) {
      setChallengeCodeInput(ch.starterCode);
      setShowChallengeHint(false);
      setShowChallengeSolution(false);
    }
  };

  // Sincroniza la lista de módulos completados con localStorage
  useEffect(() => {
    try {
      localStorage.setItem(COMPLETED_MODULES_STORAGE_KEY, JSON.stringify(completedModules));
    } catch {
      // Ignorar errores de cuota o modo privado del navegador
    }
  }, [completedModules]);

  /**
   * Selecciona un módulo del temario y conmuta automáticamente a su estación de laboratorio recomendada.
   */
  const handleSelectModule = (modId: number) => {
    setActiveModuleId(modId);
    const mod = COURSE_MODULES.find((m) => m.id === modId);
    if (mod) {
      setActiveLab(mod.recommendedLab);
    }
  };

  /**
   * Registra la respuesta del usuario a una pregunta de diagnóstico o test.
   * Si corresponde al reto principal del módulo (`marksModule = true`) y es correcta, marca el módulo como completado.
   */
  const handleAnswerQuiz = (quizKey: string, optionId: string, isCorrect: boolean, marksModule = false) => {
    setSelectedAnswers((prev) => ({ ...prev, [quizKey]: optionId }));
    if (marksModule && isCorrect && !completedModules.includes(currentModule.id)) {
      setCompletedModules((prev) => [...prev, currentModule.id]);
    }
  };

  // Evaluación determinista en tiempo real del código C escrito por el usuario en el reto activo
  const challengeEval = evaluateEmbeddedCCode(
    challengeCodeInput,
    currentCodingChallenge.initialRegValue,
    currentCodingChallenge.regWidth
  );
  const isCodingChallengeSolved =
    challengeEval.success &&
    (challengeEval.finalValue >>> 0) === (currentCodingChallenge.expectedRegValue >>> 0);

  // Marca automáticamente el nivel del reto práctico como superado cuando el registro alcanza el valor esperado
  useEffect(() => {
    const key = `${currentModule.id}-${selectedChallengeIdx}`;
    if (isCodingChallengeSolved && !solvedChallengeKeys[key]) {
      setSolvedChallengeKeys((prev) => ({ ...prev, [key]: true }));
    }
  }, [isCodingChallengeSolved, currentModule.id, selectedChallengeIdx, solvedChallengeKeys]);

  const progressPercent = Math.round((completedModules.length / COURSE_MODULES.length) * 100);

  return (
    <div
      className={`min-h-screen ${retroTheme} retro-cad-grid text-slate-100 flex flex-col ${
        crtScanlines ? 'crt-scanlines' : ''
      }`}
    >
      {/* ===================================================================
          CINTA TELEMÉTRICA SUPERIOR: SELECTOR DE PALETA DE COLOR AÑOS 80
         =================================================================== */}
      <div className="bg-black border-b-2 border-[var(--border-strong)] px-4 py-1.5 text-[11px] font-mono text-emerald-400">
        <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 bg-[var(--accent-primary)] text-black font-pixel font-bold text-[10px]">
              PALETA 80s:
            </span>
            {[
              { id: 'theme-turboc', label: '1. TURBO C (AZUL DOS)' },
              { id: 'theme-arcade', label: '2. PIXEL 8-BIT (ARCADE)' },
              { id: 'theme-amber', label: '3. CRT ÁMBAR (VT220)' },
              { id: 'theme-green', label: '4. CRT VERDE (IBM 5151)' }
            ].map((t) => {
              const isAct = retroTheme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setRetroTheme(t.id as typeof retroTheme)}
                  className={`px-2.5 py-0.5 text-[10px] font-pixel transition-all ${
                    isAct
                      ? 'bg-cyan-400 text-black font-bold border-white'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden lg:inline text-amber-300">
              BELL LABS K&amp;R C • ROM_MOD: 0x0{currentModule.id.toString(16).toUpperCase()}
            </span>
            <button
              onClick={() => setCrtScanlines(!crtScanlines)}
              className={`px-2 py-0.5 text-[10px] font-pixel border ${
                crtScanlines
                  ? 'bg-emerald-400 text-black border-white font-bold'
                  : 'bg-slate-900 text-slate-300 border-slate-700'
              }`}
              title="Activar o desactivar las líneas de escaneo de monitor CRT"
            >
              SCANLINES: {crtScanlines ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================================
          BARRA SUPERIOR: IDENTIDAD DEL PROYECTO + SELECTOR GLOBAL DE MCU
         =================================================================== */}
      <header className="sticky top-0 z-30 bg-[var(--bg-window)] border-b-4 border-[var(--border-strong)] px-4 py-3 shadow-lg">
        <div className="max-w-[1600px] mx-auto flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-black border-2 border-[var(--border-strong)] flex items-center justify-center shadow-pixel">
                <PixelChip8BitIcon />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-sm sm:text-base font-pixel font-bold tracking-tight text-white uppercase">
                    PROGRAMACIÓN_C.EXE <span className="text-[var(--accent-primary)]">// EMBEBIDOS &amp; SILICIO</span>
                  </h1>
                  <span className="hidden sm:inline-block text-[10px] font-pixel uppercase px-2 py-0.5 bg-[var(--accent-primary)] text-black font-bold border border-black">
                    EDICIÓN RETRO K&amp;R 80s
                  </span>
                </div>
                <p className="text-xs text-[var(--text-body)] font-mono">
                  &gt; De fundamentos de C a Ingeniería Aeroespacial (ECSS / NASA) enlazando Código, Datasheet, Registros y Transistores
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowSpecsMatrix(!showSpecsMatrix)}
              className="xl:hidden px-3 py-1.5 bg-black border-2 border-[var(--border-strong)] text-xs font-pixel text-[var(--accent-primary)]"
            >
              {showSpecsMatrix ? '[X] CERRAR' : '[5 CHIPS]'}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-pixel uppercase text-[var(--accent-primary)] mr-1 hidden sm:inline">
              CHIP_SELECT:
            </span>
            {MCU_LIST.map((mcu) => {
              const active = mcu.id === selectedMcuId;
              return (
                <button
                  key={mcu.id}
                  onClick={() => setSelectedMcuId(mcu.id)}
                  className={`px-3 py-1.5 text-xs font-pixel transition-all flex items-center gap-1.5 border-2 ${
                    active
                      ? 'bg-[var(--accent-primary)] text-black font-bold border-white'
                      : 'bg-[var(--bg-card-inner)] text-white border-[var(--border-card)] hover:bg-black'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>{mcu.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 border ${
                      active
                        ? 'bg-black text-[var(--accent-primary)] border-black'
                        : 'bg-black text-amber-300 border-slate-800'
                    }`}
                  >
                    {mcu.bitWidth}b
                  </span>
                </button>
              );
            })}

            <button
              onClick={() => setShowSpecsMatrix(!showSpecsMatrix)}
              className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 bg-black hover:bg-slate-900 border-2 border-[var(--accent-primary)] text-xs font-pixel text-[var(--accent-primary)] transition-all ml-1"
            >
              <GitCompare className="w-3.5 h-3.5" />
              {showSpecsMatrix ? '[OCULTAR MATRIZ]' : '[COMPARAR 5 CHIPS]'}
            </button>
          </div>
        </div>
      </header>

      {/* ===================================================================
          COLLAPSIBLE 5-MCU INDUSTRIAL COMPARISON MATRIX
         =================================================================== */}
      {showSpecsMatrix && (
        <div className="bg-slate-900/95 border-b border-slate-800 px-4 py-5">
          <div className="max-w-[1600px] mx-auto">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <GitCompare className="w-4 h-4 text-amber-400" />
                  Matriz Comparativa de Arquitecturas Industriales (Haz clic en cualquiera para activarlo)
                </h2>
                <p className="text-xs text-slate-400">
                  Observa cómo cambia la arquitectura de buses, el ancho de registro y el mecanismo de escritura atómica en cada familia:
                </p>
              </div>
              <button
                onClick={() => setShowSpecsMatrix(false)}
                className="text-xs text-slate-400 hover:text-white font-mono px-2 py-1 rounded bg-slate-800"
              >
                Cerrar [X]
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-3">
              {MCU_LIST.map((m) => {
                const isCurrent = m.id === selectedMcuId;
                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMcuId(m.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isCurrent
                        ? 'bg-slate-800/90 border-cyan-400 ring-2 ring-cyan-400/40'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-extrabold text-white font-mono">{m.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300">
                        {m.badge}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{m.manufacturer}</div>

                    <div className="mt-3 space-y-1 text-xs font-mono border-t border-slate-800 pt-2">
                      <div>
                        <span className="text-slate-500">ISA:</span> <span className="text-slate-200">{m.isa}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Reloj:</span>{' '}
                        <span className="text-emerald-300">{m.clockSpeed}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Memoria:</span>{' '}
                        <span className="text-slate-200">
                          {m.flash} Flash / {m.ram}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Clock Gate:</span>{' '}
                        <span className={m.requiresClockGating ? 'text-amber-300' : 'text-slate-300'}>
                          {m.requiresClockGating ? 'Obligatorio (RCC)' : 'Activo al arrancar'}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-300 mt-2.5 leading-relaxed border-t border-slate-800/80 pt-2">
                      {m.pedagogicalRole}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          MAIN BODY: LEFT CURRICULUM SIDEBAR + RIGHT INTERACTIVE WORKSPACE
         =================================================================== */}
      <div className="max-w-[1600px] w-full mx-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 sm:p-6">
        {/* LEFT COLUMN: 18-MODULE COURSE CURRICULUM & MCU SUMMARY CARD */}
        <aside className="lg:col-span-3 space-y-5">
          <div className="retro-window overflow-hidden">
            <div className="retro-titlebar px-3 py-1.5 flex items-center justify-between text-[11px] font-pixel text-cyan-300">
              <span>╔═ [ TEMARIO_ROM.DIR ]</span>
              <span className="text-emerald-400">[00..17]</span>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-pixel uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Award className="w-4 h-4" /> Ruta 0 a Experto
                </span>
                <span className="text-xs font-pixel font-bold text-emerald-400">
                  {completedModules.length}/{COURSE_MODULES.length} ({progressPercent}%)
                </span>
              </div>

              {/* Barra de Progreso Pixel-Art de 18 Segmentos LED (1 bloque por módulo) */}
              <div className="flex gap-1 bg-black p-1.5 border-2 border-slate-800">
                {COURSE_MODULES.map((m) => {
                  const done = completedModules.includes(m.id);
                  const active = m.id === activeModuleId;
                  return (
                    <div
                      key={m.id}
                      title={`Módulo ${m.id}: ${done ? 'Completado' : active ? 'En curso' : 'Pendiente'}`}
                      className={`flex-1 h-3 border ${
                        done
                          ? 'bg-emerald-400 border-emerald-200'
                          : active
                          ? 'bg-cyan-400 border-white animate-pulse'
                          : 'bg-slate-900 border-slate-800'
                      }`}
                    />
                  );
                })}
              </div>

              <nav className="mt-4 space-y-2">
                {COURSE_MODULES.map((mod) => {
                  const isCurrent = mod.id === activeModuleId;
                  const isDone = completedModules.includes(mod.id);
                  const levelColor =
                    mod.level === 'Fundamentos'
                      ? 'text-cyan-300 border-cyan-500/40 bg-cyan-500/10'
                      : mod.level === 'Intermedio'
                      ? 'text-emerald-300 border-emerald-500/40 bg-emerald-500/10'
                      : mod.level === 'Avanzado'
                      ? 'text-amber-300 border-amber-500/40 bg-amber-500/10'
                      : 'text-purple-300 border-purple-500/40 bg-purple-500/10';

                  return (
                    <button
                      key={mod.id}
                      onClick={() => handleSelectModule(mod.id)}
                      className={`w-full text-left p-2.5 border-2 transition-all flex items-start gap-2.5 ${
                        isCurrent
                          ? 'bg-[#0e2235] border-cyan-400 shadow-pixel-cyan'
                          : 'bg-[#050a10] border-slate-800 hover:bg-slate-900 hover:border-slate-600'
                      }`}
                    >
                      <div
                        className={`mt-0.5 w-6 h-6 border flex items-center justify-center text-[11px] font-pixel font-bold shrink-0 ${
                          isDone
                            ? 'bg-emerald-400 text-slate-950 border-black'
                            : isCurrent
                            ? 'bg-cyan-400 text-slate-950 border-white'
                            : 'bg-slate-900 text-slate-400 border-slate-700'
                        }`}
                      >
                        {isDone ? '✓' : mod.id}
                      </div>
                      <div className="min-w-0 flex-1 font-mono">
                        <div className="text-xs font-bold text-slate-100 leading-snug">
                          {mod.title.replace(/^Módulo \d+:\s*/, '')}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] font-pixel px-1.5 py-0.2 border ${levelColor}`}>
                            {mod.level}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{mod.duration}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Active Microcontroller Datasheet Summary Card */}
          <div className="retro-window overflow-hidden">
            <div className="retro-titlebar px-3 py-1.5 flex items-center justify-between text-[11px] font-pixel text-amber-300">
              <span>╔═ [ DATASHEET_CHIP.INF ]</span>
              <span>[{currentMcu.bitWidth}B]</span>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-pixel uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4" /> Ficha Silicio
                </span>
                <span className="text-xs font-pixel font-bold text-white bg-slate-950 px-2 py-0.5 border border-amber-400/50">
                  {currentMcu.name}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{currentMcu.tagline}</p>

              <div className="bg-black border-2 border-slate-800 p-3 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Arquitectura:</span>
                  <span className="text-cyan-300 text-right">{currentMcu.isa}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Ancho de Bus:</span>
                  <span className="text-white">{currentMcu.bitWidth} bits</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Frecuencia:</span>
                  <span className="text-emerald-300">{currentMcu.clockSpeed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Flash / RAM:</span>
                  <span className="text-white">
                    {currentMcu.flash} / {currentMcu.ram}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Voltaje Lógico:</span>
                  <span className="text-amber-300">{currentMcu.operatingVoltage}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-pixel uppercase tracking-wider text-amber-300 font-bold block mb-1">
                  Por qué estudiar este chip:
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">{currentMcu.pedagogicalRole}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT COLUMN: MODULE LESSON + NOTEBOOK + CODE + LABS + EXERCISES */}
        <main className="lg:col-span-9 space-y-6">
          {/* Module Header Banner */}
          <section className="retro-window overflow-hidden">
            <div className="retro-titlebar px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs font-pixel">
              <span className="text-cyan-300">
                ╔══ [ SECTOR_ROM_0x0{currentModule.id.toString(16).toUpperCase()} // PUENTE_PEDAGÓGICO.C ] ══╗
              </span>
              <span className="text-emerald-400 font-mono">
                CHIP_ACTIVO: {currentMcu.name} [─][□][×]
              </span>
            </div>

            <div className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 text-xs font-pixel font-bold bg-cyan-400 text-slate-950 border border-white">
                    MÓDULO {currentModule.id} (0..{COURSE_MODULES.length - 1}) • {currentModule.level}
                  </span>
                  <span className="text-xs font-mono text-emerald-300">
                    &gt; TARGET: <strong className="text-white">{currentMcu.name}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={currentModule.id <= 0}
                    onClick={() => handleSelectModule(currentModule.id - 1)}
                    className="px-2.5 py-1 bg-slate-950 border-2 border-slate-700 text-xs font-pixel text-slate-200 disabled:opacity-40 hover:bg-slate-800 flex items-center gap-1"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> ANTERIOR
                  </button>
                  <button
                    disabled={currentModule.id >= COURSE_MODULES.length - 1}
                    onClick={() => handleSelectModule(currentModule.id + 1)}
                    className="px-2.5 py-1 bg-cyan-400 text-slate-950 font-pixel font-bold text-xs border-2 border-white disabled:opacity-40 hover:bg-cyan-300 flex items-center gap-1"
                  >
                    SIGUIENTE <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h2 className="text-lg sm:text-xl font-pixel font-bold text-white tracking-tight">
                {currentModule.title}
                <span className="cursor-80s" />
              </h2>
              <p className="text-sm text-amber-200/90 mt-1 font-mono">{currentModule.subtitle}</p>

              {/* THE PEDAGOGICAL BRIDGE: 3 COLUMNS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-5">
                <div className="bg-rose-950/25 border-2 border-rose-500/50 p-3.5 shadow-sm">
                  <div className="text-xs font-pixel font-bold uppercase tracking-wider text-rose-300 mb-1">
                    1. El Extremo Superficial (Lo que ocultan los cursos básicos)
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">{currentModule.superficialMyth}</p>
                </div>

                <div className="bg-amber-950/25 border-2 border-amber-500/50 p-3.5 shadow-sm">
                  <div className="text-xs font-pixel font-bold uppercase tracking-wider text-amber-300 mb-1">
                    2. El Extremo Abrumador (Lo que suelta el Datasheet sin filtro)
                  </div>
                  <p className="text-xs text-amber-100 leading-relaxed font-mono">
                    {currentModule.overwhelmingDatasheet}
                  </p>
                </div>

                <div className="bg-emerald-950/30 border-2 border-emerald-400/60 p-3.5 shadow-sm">
                  <div className="text-xs font-pixel font-bold uppercase tracking-wider text-emerald-300 mb-1 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> 3. El Puente Real (Cómo se conecta todo)
                  </div>
                  <p className="text-xs text-slate-100 leading-relaxed">{currentModule.theBridgeExplanation}</p>
                </div>
              </div>
            </div>
          </section>

          {/* =================================================================
              CAPÍTULOS DE TEORÍA PROFUNDA (LIBRO DE TEXTO TÉCNICO)
             ================================================================= */}
          {currentDeepChapters.length > 0 && (
            <section className="retro-window overflow-hidden">
              <div className="retro-titlebar px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs font-pixel">
                <span className="text-cyan-300">
                  ╔══ [ MANUAL_TÉCNICO_K&amp;R // TEORÍA_PROFUNDA_M{currentModule.id}.DOC ] ══╗
                </span>
                <span className="text-amber-300 font-mono">
                  MODO: CUADERNO_FÍSICO ({currentDeepChapters.length} CAPÍTULOS)
                </span>
              </div>
              <div className="p-5 space-y-6">
              <div className="border-b-2 border-slate-800 pb-3.5 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-base font-extrabold text-white tracking-tight">
                      Capítulos de Teoría Profunda y Casos Resueltos — Módulo {currentModule.id}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Desarrollo teórico completo con tablas de referencia, ejemplos paso a paso y errores típicos de ingeniería para estudiar y transcribir a tu cuaderno físico:
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold">
                  {currentDeepChapters.length} Capítulos Técnicos
                </span>
              </div>

              <div className="space-y-6">
                {currentDeepChapters.map((chapter) => (
                  <article
                    key={chapter.id}
                    className="bg-slate-950/90 border border-slate-800 rounded-2xl p-5 space-y-4"
                  >
                    <div>
                      <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        {chapter.chapterNumber}
                      </span>
                      <h4 className="text-base sm:text-lg font-extrabold text-white mt-2">
                        {chapter.title}
                      </h4>
                      <p className="text-xs text-amber-300/90 font-medium mt-0.5">{chapter.subtitle}</p>
                    </div>

                    {/* Explanatory Paragraphs */}
                    <div className="space-y-2.5 text-xs sm:text-sm text-slate-200 leading-relaxed">
                      {chapter.paragraphs.map((p, pIdx) => (
                        <p key={pIdx}>{p}</p>
                      ))}
                    </div>

                    {/* Highlighted Formulas for Physical Notebook */}
                    {chapter.formulas && chapter.formulas.length > 0 && (
                      <div className="space-y-2.5">
                        {chapter.formulas.map((f, fIdx) => (
                          <div
                            key={fIdx}
                            className="bg-amber-950/20 border border-amber-500/40 rounded-xl p-3.5 space-y-1"
                          >
                            <div className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                              📐 Fórmula / Ley para el Cuaderno: {f.name}
                            </div>
                            <div className="font-mono text-xs sm:text-sm font-extrabold text-white bg-slate-950/90 border border-slate-800 rounded-lg px-3 py-2">
                              {f.expression}
                            </div>
                            <p className="text-xs text-slate-300">{f.explanation}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reference Table for Notebook */}
                    {chapter.table && (
                      <div className="overflow-x-auto border border-slate-800 rounded-xl">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-900 border-b border-slate-800 text-cyan-300 font-mono">
                              {chapter.table.headers.map((h, hIdx) => (
                                <th key={hIdx} className="p-2.5 font-bold">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/80">
                            {chapter.table.rows.map((row, rIdx) => (
                              <tr key={rIdx} className="bg-slate-950/60 hover:bg-slate-900/50">
                                {row.map((cell, cIdx) => (
                                  <td
                                    key={cIdx}
                                    className={`p-2.5 ${
                                      cIdx === 0
                                        ? 'font-mono font-bold text-amber-300'
                                        : 'text-slate-200'
                                    }`}
                                  >
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Worked Step-by-Step Example */}
                    <div className="bg-slate-900/90 border border-emerald-500/30 rounded-xl p-4 space-y-3">
                      <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-300">
                        📐 {chapter.workedExample.title}
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed">
                        <strong>Planteamiento:</strong> {chapter.workedExample.problemStatement}
                      </p>
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
                        <div className="lg:col-span-6 space-y-1.5">
                          {chapter.workedExample.steps.map((st, sIdx) => (
                            <div
                              key={sIdx}
                              className="text-xs text-slate-200 bg-slate-950/80 border border-slate-800 rounded-lg p-2 leading-relaxed"
                            >
                              {st}
                            </div>
                          ))}
                        </div>
                        <div className="lg:col-span-6">
                          <CCodeBlock
                            code={chapter.workedExample.codeOrMath}
                            title={`ejemplo_resuelto_${chapter.id}.c`}
                          />
                        </div>
                      </div>
                      <div className="text-xs text-emerald-300 font-medium bg-emerald-950/30 border border-emerald-500/30 rounded-lg p-2.5">
                        <strong>Conclusión para tu cuaderno:</strong> {chapter.workedExample.conclusion}
                      </div>
                    </div>

                    {/* Novice Pitfalls vs Senior Fixes */}
                    <div className="grid grid-cols-1 gap-2.5">
                      {chapter.pitfalls.map((pit, pitIdx) => (
                        <div
                          key={pitIdx}
                          className="bg-rose-950/15 border border-rose-500/30 rounded-xl p-3.5 text-xs space-y-1.5"
                        >
                          <div className="font-bold text-rose-300 flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            <span>Error Típico: {pit.mistake}</span>
                          </div>
                          <p className="text-slate-300 leading-relaxed">
                            <strong>Por qué falla en el silicio:</strong> {pit.whyItFails}
                          </p>
                          <p className="text-emerald-300 leading-relaxed">
                            <strong>Solución de Ingeniero Senior:</strong> {pit.seniorFix}
                          </p>
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
              </div>
            </section>
          )}

          {/* =================================================================
              FUNDAMENTOS TEÓRICOS, DEFINICIONES, FÓRMULAS Y EJEMPLOS DESGLOSADOS
             ================================================================= */}
          <section className="retro-window overflow-hidden">
            <div className="retro-titlebar px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs font-pixel">
              <span className="text-amber-300">
                ╔══ [ DICCIONARIO_SILICIO.DAT // DEFINICIONES_Y_FÓRMULAS_M{currentModule.id} ] ══╗
              </span>
              <span className="text-cyan-300 font-mono">
                ENTRADAS: {currentExtended.definitions.length} • REGLAS: {currentExtended.goldenRules.length}
              </span>
            </div>
            <div className="p-5 space-y-5">
            <div className="border-b-2 border-slate-800 pb-3.5">
              <div className="flex items-center gap-2">
                <BookMarked className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-extrabold text-white tracking-tight">
                  Diccionario Técnico ({currentExtended.definitions.length} Términos), Fórmulas y Esquemas — Módulo {currentModule.id}
                </h3>
              </div>
              <p className="text-xs text-slate-300 mt-1">{currentExtended.whyWriteThisDown}</p>
            </div>

            {/* 1. Formal Definitions & Hardware Reality */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-2.5">
                1. Definiciones Fundamentales y Qué Ocurre en el Hardware
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentExtended.definitions.map((def, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border bg-slate-950/85 border-slate-800 flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-xs font-extrabold text-cyan-300 font-mono block">
                        {idx + 1}. {def.term}
                      </span>
                      <p className="text-xs text-slate-200 mt-1.5 leading-relaxed">
                        <strong>Definición:</strong> {def.definition}
                      </p>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        <strong>En el Silicio:</strong> {def.siliconReality}
                      </p>
                    </div>
                    <CInlineCode code={def.exampleToCopy} className="mt-2.5" />
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Golden Rules / Formulas + 3. Conceptual Architecture Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-6 bg-slate-950/90 border border-amber-500/30 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  2. Fórmulas Matemáticas y Reglas de Oro
                </h4>
                <div className="space-y-2.5">
                  {currentExtended.goldenRules.map((rule, idx) => (
                    <div key={idx} className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
                      <div className="text-xs font-bold text-white">{rule.title}</div>
                      <CInlineCode code={rule.formulaOrRule} className="my-1.5" />
                      <p className="text-xs text-slate-300 leading-relaxed">{rule.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-6 bg-slate-950/90 border border-cyan-500/30 rounded-xl p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300 mb-2.5">
                  3. Estructura Física y Esquema Conceptual Paso a Paso
                </h4>
                <ol className="space-y-2 text-xs text-slate-200 list-decimal list-inside leading-relaxed">
                  {currentExtended.sketchDiagramSteps.map((step, i) => (
                    <li key={i} className="bg-slate-900/80 border border-slate-800 rounded-lg p-2.5">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* 4. Annotated Code Example Line-by-Line */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
                4. Ejemplo Canónico en C Explicado Línea por Línea
              </h4>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                <div className="lg:col-span-7">
                  <CCodeBlock
                    code={currentExtended.annotatedCodeToCopy.code}
                    title={`canonico_modulo_${currentModule.id}.c`}
                  />
                </div>
                <div className="lg:col-span-5 space-y-2">
                  <span className="text-[11px] font-bold uppercase text-slate-400 block">
                    Desglose detallado de cada expresión:
                  </span>
                  {currentExtended.annotatedCodeToCopy.lineNotes.map((note, idx) => (
                    <div
                      key={idx}
                      className="text-xs text-slate-300 bg-slate-900/70 border border-slate-800 rounded-lg p-2.5 leading-relaxed"
                    >
                      • {note}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            </div>
          </section>

          {/* =================================================================
              EVOLUTIONARY 3-LEVEL C CODE VIEWER (SYNCED WITH ACTIVE MCU)
             ================================================================= */}
          <section className="retro-window overflow-hidden">
            <div className="retro-titlebar px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs font-pixel">
              <span className="text-cyan-300">
                ╔══ [ TURBO_C_EDITOR.C // 3_CAPAS_DE_ABSTRACCIÓN :: {currentMcu.name} ] ══╗
              </span>
              <span className="text-emerald-400 font-mono">
                F2:SAVE • F9:MAKE • ALT+X:EXIT
              </span>
            </div>
            <div className="bg-slate-950/90 border-b-2 border-slate-800 p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                    Código C en 3 Capas de Abstracción — <span className="text-cyan-400">{currentMcu.name}</span>
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Compara cómo se escribe exactamente la misma operación desde la dirección hexadecimal desnuda hasta un driver profesional:
                </p>
              </div>

              <button
                onClick={() => setCompareAllMcusCode(!compareAllMcusCode)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all ${
                  compareAllMcusCode
                    ? 'bg-amber-400 text-slate-950 border-amber-300'
                    : 'bg-slate-900 text-amber-300 border-amber-500/40 hover:bg-slate-800'
                }`}
              >
                {compareAllMcusCode ? 'Ver Solo MCU Activo' : 'Comparar los 5 Chips Lado a Lado'}
              </button>
            </div>

            {!compareAllMcusCode ? (
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    {
                      id: 'rawPointer',
                      title: 'Nivel A: Puntero Crudo (Bare-Metal)',
                      sub: 'Direcciones físicas directas del Datasheet'
                    },
                    {
                      id: 'cmsisStruct',
                      title: 'Nivel B: Estándar Fabricante / CMSIS',
                      sub: 'Structs mapeados a registros oficiales'
                    },
                    {
                      id: 'proDriver',
                      title: 'Nivel C: Driver / Arquitectura Senior',
                      sub: 'Código modular, limpio y portable'
                    }
                  ].map((lvl) => {
                    const active = abstractionLevel === lvl.id;
                    return (
                      <button
                        key={lvl.id}
                        onClick={() => setAbstractionLevel(lvl.id as typeof abstractionLevel)}
                        className={`text-left p-3 rounded-xl border transition-all ${
                          active
                            ? 'bg-cyan-500/15 border-cyan-400 text-white'
                            : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:bg-slate-950'
                        }`}
                      >
                        <div className="text-xs font-bold font-mono">{lvl.title}</div>
                        <div className="text-[11px] opacity-80 mt-0.5">{lvl.sub}</div>
                      </button>
                    );
                  })}
                </div>

                <CCodeBlock
                  code={moduleCodeForMcu[abstractionLevel]}
                  title={`${currentMcu.id}_modulo_${currentModule.id}_${abstractionLevel}.c`}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3.5">
                    <div className="text-xs font-bold text-purple-300 uppercase mb-1 flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5" /> Bajo el Capó (Ensamblador y Ciclos de CPU)
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{moduleCodeForMcu.asmInsight}</p>
                  </div>
                  <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3.5">
                    <div className="text-xs font-bold text-amber-300 uppercase mb-1 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" /> Nota de Silicio ({currentMcu.name})
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{moduleCodeForMcu.hardwareNote}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 grid grid-cols-1 xl:grid-cols-2 gap-4">
                {MCU_LIST.map((m) => (
                  <div key={m.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-cyan-300 font-mono">
                        {m.name} ({m.isa})
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400">
                        {m.badge}
                      </span>
                    </div>
                    <CCodeBlock
                      code={currentModule.mcuCode[m.id][abstractionLevel]}
                      title={`${m.id}_${abstractionLevel}.c`}
                    />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* =================================================================
              INTERACTIVE SILICON & HARDWARE INSTRUMENTATION STATION (8 LABS)
             ================================================================= */}
          <InteractiveLabs mcu={currentMcu} activeLab={activeLab} onSelectLab={setActiveLab} />

          {/* =================================================================
              3-LEVEL HANDS-ON C CODING CHALLENGES + MULTI-EXERCISE BATTERY
             ================================================================= */}
          <section className="retro-window overflow-hidden">
            <div className="retro-titlebar px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs font-pixel">
              <span className="text-emerald-300">
                ╔══ [ VALIDACIÓN_SILICIO.EXE // RETOS_C_Y_DIAGNÓSTICO_M{currentModule.id} ] ══╗
              </span>
              <span className="text-cyan-300 font-mono">
                EVALUADOR_BITWISE: ACTIVO
              </span>
            </div>
            <div className="p-5 space-y-6">
            {/* Part A: 3-Level Escalera de Retos Prácticos de Código C */}
            <div className="bg-slate-950 border-2 border-cyan-500/40 p-4 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-extrabold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                    <Code2 className="w-4 h-4" /> Escalera de 3 Retos Prácticos de Programación C (Módulo {currentModule.id})
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Supera los 3 niveles de dificultad escribiendo código C real evaluado bit a bit:
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {currentExtended.codingChallenges.map((ch, idx) => {
                    const isSelected = idx === selectedChallengeIdx;
                    const isSolved = Boolean(solvedChallengeKeys[`${currentModule.id}-${idx}`]);
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectChallengeLevel(idx)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow'
                            : isSolved
                            ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span>{isSolved ? '✓' : `${idx + 1}.`}</span>
                        <span>{ch.levelLabel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-sm font-bold text-white">{currentCodingChallenge.title}</h4>
                {isCodingChallengeSolved ? (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs font-mono font-bold">
                    ✓ ¡Reto {selectedChallengeIdx + 1} Validado en Silicio!
                  </span>
                ) : (
                  <span className="text-xs font-mono text-slate-400">
                    Objetivo: 0x
                    {(currentCodingChallenge.expectedRegValue >>> 0)
                      .toString(16)
                      .toUpperCase()
                      .padStart(8, '0')}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-200 leading-relaxed">
                {currentCodingChallenge.instruction}
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
                <div className="lg:col-span-7 space-y-2">
                  <CLiveCodeEditor
                    rows={4}
                    value={challengeCodeInput}
                    onChange={(nextVal) => setChallengeCodeInput(nextVal)}
                    fileName={`reto_m${currentModule.id}_nivel_${selectedChallengeIdx + 1}.c`}
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setShowChallengeHint(!showChallengeHint)}
                      className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-xs font-mono text-amber-300 hover:bg-slate-800"
                    >
                      {showChallengeHint ? 'Ocultar Pista' : '💡 Ver Pista'}
                    </button>
                    <button
                      onClick={() => {
                        setShowChallengeSolution(!showChallengeSolution);
                        if (!showChallengeSolution) {
                          setChallengeCodeInput(currentCodingChallenge.solutionCode);
                        }
                      }}
                      className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-300 hover:bg-slate-800"
                    >
                      {showChallengeSolution ? 'Ocultar Solución' : 'Ver Solución Explicada'}
                    </button>
                    {isCodingChallengeSolved &&
                      selectedChallengeIdx < currentExtended.codingChallenges.length - 1 && (
                        <button
                          onClick={() => handleSelectChallengeLevel(selectedChallengeIdx + 1)}
                          className="px-3 py-1 rounded bg-emerald-500 text-slate-950 font-bold text-xs font-mono hover:bg-emerald-400"
                        >
                          Siguiente Nivel ({currentExtended.codingChallenges[selectedChallengeIdx + 1].levelLabel}) →
                        </button>
                      )}
                  </div>
                </div>

                <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Valor Inicial REG:</span>
                    <span className="text-slate-200">
                      0x
                      {(currentCodingChallenge.initialRegValue >>> 0)
                        .toString(16)
                        .toUpperCase()
                        .padStart(8, '0')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tu Resultado Actual:</span>
                    <span className={isCodingChallengeSolved ? 'text-emerald-400 font-bold' : 'text-amber-300'}>
                      {challengeEval.success
                        ? '0x' + (challengeEval.finalValue >>> 0).toString(16).toUpperCase().padStart(8, '0')
                        : 'Error de Sintaxis'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Valor Esperado:</span>
                    <span className="text-cyan-300">
                      0x
                      {(currentCodingChallenge.expectedRegValue >>> 0)
                        .toString(16)
                        .toUpperCase()
                        .padStart(8, '0')}
                    </span>
                  </div>
                </div>
              </div>

              {showChallengeHint && (
                <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200 font-mono">
                  💡 Pista: {currentCodingChallenge.hint}
                </div>
              )}

              {(showChallengeSolution || isCodingChallengeSolved) && (
                <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/40 text-xs text-emerald-200">
                  <strong>Explicación de Ingeniería:</strong> {currentCodingChallenge.explanation}
                </div>
              )}
            </div>

            {/* Part B: Multiple-Choice Engineering Challenges (Main + 4 Extra Quizzes = 5 Quizzes per Module) */}
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    Batería de {1 + currentExtended.extraQuizzes.length} Ejercicios de Diagnóstico y Traza (Módulo {currentModule.id})
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Incluye ejercicios de Traza Mental de Código C, Lectura de Datasheet y Caza del Bug en Hardware:
                  </p>
                </div>
                {completedModules.includes(currentModule.id) && (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold">
                    ✓ Módulo Superado
                  </span>
                )}
              </div>

              {/* Exercise 1: Main Scenario Challenge */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300 uppercase">
                    Ejercicio 1: {currentModule.challenge.question}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    Caso Real de Laboratorio
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {currentModule.challenge.scenario}
                </p>
                <div className="space-y-2">
                  {currentModule.challenge.options.map((opt) => {
                    const quizKey = `main-${currentModule.id}`;
                    const picked = selectedAnswers[quizKey] === opt.id;
                    return (
                      <div key={opt.id}>
                        <button
                          onClick={() => handleAnswerQuiz(quizKey, opt.id, opt.isCorrect, true)}
                          className={`w-full text-left p-3 rounded-xl border font-mono text-xs transition-all flex items-center justify-between ${
                            picked
                              ? opt.isCorrect
                                ? 'bg-emerald-950/50 border-emerald-400 text-emerald-200'
                                : 'bg-rose-950/50 border-rose-500 text-rose-200'
                              : 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800/70'
                          }`}
                        >
                          <span>{opt.label}</span>
                          {picked &&
                            (opt.isCorrect ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                            ) : (
                              <XCircle className="w-4 h-4 text-rose-400 shrink-0 ml-2" />
                            ))}
                        </button>
                        {picked && (
                          <div
                            className={`mt-1.5 p-2.5 rounded-lg text-xs ${
                              opt.isCorrect
                                ? 'bg-emerald-950/30 text-emerald-300 border border-emerald-500/30'
                                : 'bg-rose-950/30 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {opt.feedback}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Extra Exercises for the Module */}
              {currentExtended.extraQuizzes.map((quiz, qIdx) => {
                const badgeStyle =
                  quiz.difficulty === 'Caza del Bug'
                    ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                    : quiz.difficulty === 'Lectura Datasheet'
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    : 'bg-purple-500/15 text-purple-300 border-purple-500/30';
                return (
                  <div key={quiz.id} className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300 uppercase">
                        Ejercicio {qIdx + 2}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${badgeStyle}`}>
                        {quiz.difficulty}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{quiz.question}</p>
                    <div className="space-y-2">
                      {quiz.options.map((opt) => {
                        const picked = selectedAnswers[quiz.id] === opt.id;
                        return (
                          <div key={opt.id}>
                            <button
                              onClick={() => handleAnswerQuiz(quiz.id, opt.id, opt.isCorrect, false)}
                              className={`w-full text-left p-3 rounded-xl border font-mono text-xs transition-all flex items-center justify-between ${
                                picked
                                  ? opt.isCorrect
                                    ? 'bg-emerald-950/50 border-emerald-400 text-emerald-200'
                                    : 'bg-rose-950/50 border-rose-500 text-rose-200'
                                  : 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800/70'
                              }`}
                            >
                              <span>{opt.label}</span>
                              {picked &&
                                (opt.isCorrect ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-rose-400 shrink-0 ml-2" />
                                ))}
                            </button>
                            {picked && (
                              <div
                                className={`mt-1.5 p-2.5 rounded-lg text-xs ${
                                  opt.isCorrect
                                    ? 'bg-emerald-950/30 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-rose-950/30 text-rose-300 border border-rose-500/30'
                                }`}
                              >
                                {opt.feedback}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            </div>
          </section>
        </main>
      </div>

      {/* ===================================================================
          PIE DE PÁGINA RETRO OCHENTERO: HOMENAJE A BELL LABS Y K&R C (1978/1989)
         =================================================================== */}
      <footer className="bg-black border-t-2 border-cyan-500/40 px-4 py-3 mt-6 text-xs font-mono text-slate-400">
        <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-emerald-400 font-pixel text-[11px]">
            <span>EOF // BELL LABS UNIX &amp; K&amp;R C SPIRIT (1972–1989)</span>
          </div>
          <div className="text-[11px] text-slate-400">
            ATmega328P • STM32F401RE • ESP32-C3 • nRF52840 • RP2040 — Normativa Aeroespacial ECSS / NASA / MISRA-C
          </div>
        </div>
      </footer>
    </div>
  );
}
