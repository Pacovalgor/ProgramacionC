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

export function App() {
  const [selectedMcuId, setSelectedMcuId] = useState<MCUId>('stm32f401');
  const [activeModuleId, setActiveModuleId] = useState<number>(0);
  const [abstractionLevel, setAbstractionLevel] = useState<'rawPointer' | 'cmsisStruct' | 'proDriver'>('cmsisStruct');
  const [compareAllMcusCode, setCompareAllMcusCode] = useState<boolean>(false);
  const [showSpecsMatrix, setShowSpecsMatrix] = useState<boolean>(false);
  const [activeLab, setActiveLab] = useState<ExtendedLabViewType>('c-memory-pointers');

  // Challenge & extra quizzes state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [completedModules, setCompletedModules] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('siliconbridge_completed_modules');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 3-Level Hands-on C coding challenges state per module
  const [selectedChallengeIdx, setSelectedChallengeIdx] = useState<number>(0);
  const [challengeCodeInput, setChallengeCodeInput] = useState<string>('');
  const [showChallengeHint, setShowChallengeHint] = useState<boolean>(false);
  const [showChallengeSolution, setShowChallengeSolution] = useState<boolean>(false);
  const [solvedChallengeKeys, setSolvedChallengeKeys] = useState<Record<string, boolean>>({});

  const currentMcu = MCU_CATALOG[selectedMcuId];
  const currentModule = COURSE_MODULES.find((m) => m.id === activeModuleId) || COURSE_MODULES[0];
  const currentExtended = MODULE_EXTENDED_DATA[currentModule.id] || MODULE_EXTENDED_DATA[0];
  const currentDeepChapters = DEEP_THEORY_BY_MODULE[currentModule.id] || [];
  const currentCodingChallenge =
    currentExtended.codingChallenges[selectedChallengeIdx] || currentExtended.codingChallenges[0];
  const moduleCodeForMcu = currentModule.mcuCode[selectedMcuId];

  useEffect(() => {
    setSelectedChallengeIdx(0);
    const firstChallenge = (MODULE_EXTENDED_DATA[activeModuleId] || MODULE_EXTENDED_DATA[0]).codingChallenges[0];
    setChallengeCodeInput(firstChallenge.starterCode);
    setShowChallengeHint(false);
    setShowChallengeSolution(false);
  }, [activeModuleId]);

  const handleSelectChallengeLevel = (idx: number) => {
    setSelectedChallengeIdx(idx);
    const ch = currentExtended.codingChallenges[idx];
    if (ch) {
      setChallengeCodeInput(ch.starterCode);
      setShowChallengeHint(false);
      setShowChallengeSolution(false);
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem('siliconbridge_completed_modules', JSON.stringify(completedModules));
    } catch {
      // ignore
    }
  }, [completedModules]);

  const handleSelectModule = (modId: number) => {
    setActiveModuleId(modId);
    const mod = COURSE_MODULES.find((m) => m.id === modId);
    if (mod) {
      setActiveLab(mod.recommendedLab);
    }
  };

  const handleAnswerQuiz = (quizKey: string, optionId: string, isCorrect: boolean, marksModule = false) => {
    setSelectedAnswers((prev) => ({ ...prev, [quizKey]: optionId }));
    if (marksModule && isCorrect && !completedModules.includes(currentModule.id)) {
      setCompletedModules((prev) => [...prev, currentModule.id]);
    }
  };

  // Evaluate the current module's active hands-on C coding challenge
  const challengeEval = evaluateEmbeddedCCode(
    challengeCodeInput,
    currentCodingChallenge.initialRegValue,
    currentCodingChallenge.regWidth
  );
  const isCodingChallengeSolved =
    challengeEval.success &&
    (challengeEval.finalValue >>> 0) === (currentCodingChallenge.expectedRegValue >>> 0);

  useEffect(() => {
    const key = `${currentModule.id}-${selectedChallengeIdx}`;
    if (isCodingChallengeSolved && !solvedChallengeKeys[key]) {
      setSolvedChallengeKeys((prev) => ({ ...prev, [key]: true }));
    }
  }, [isCodingChallengeSolved, currentModule.id, selectedChallengeIdx, solvedChallengeKeys]);

  const progressPercent = Math.round((completedModules.length / COURSE_MODULES.length) * 100);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* ===================================================================
          TOP BAR: BRANDING + GLOBAL MICROCONTROLLER SELECTOR
         =================================================================== */}
      <header className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur border-b border-slate-800 px-4 py-3">
        <div className="max-w-[1600px] mx-auto flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-950">
                <Cpu className="w-6 h-6 text-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-white">
                    SiliconBridge <span className="text-cyan-400">C Embebido & Hardware</span>
                  </h1>
                  <span className="hidden sm:inline-block text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    Curso + Laboratorio + Cuaderno de Apuntes
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  De nociones básicas a Experto Industrial enlazando C, Datasheet, Registros y Transistores
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowSpecsMatrix(!showSpecsMatrix)}
              className="xl:hidden px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-300"
            >
              {showSpecsMatrix ? 'Cerrar Tabla MCU' : 'Comparar 5 Chips'}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-mono uppercase text-slate-400 mr-1 hidden sm:inline">
              Selector de MCU:
            </span>
            {MCU_LIST.map((mcu) => {
              const active = mcu.id === selectedMcuId;
              return (
                <button
                  key={mcu.id}
                  onClick={() => setSelectedMcuId(mcu.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 border ${
                    active
                      ? 'bg-cyan-500 text-slate-950 font-extrabold border-cyan-300 shadow-lg shadow-cyan-950/60'
                      : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>{mcu.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded ${
                      active ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-950 text-slate-400'
                    }`}
                  >
                    {mcu.bitWidth}b
                  </span>
                </button>
              );
            })}

            <button
              onClick={() => setShowSpecsMatrix(!showSpecsMatrix)}
              className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-amber-300 transition-all ml-1"
            >
              <GitCompare className="w-3.5 h-3.5" />
              {showSpecsMatrix ? 'Ocultar Comparativa' : 'Comparar los 5 Chips'}
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
        {/* LEFT COLUMN: 8-MODULE COURSE CURRICULUM & MCU SUMMARY CARD */}
        <aside className="lg:col-span-3 space-y-5">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Award className="w-4 h-4" /> Ruta de 0 a Experto
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {completedModules.length}/{COURSE_MODULES.length} Módulos ({progressPercent}%)
              </span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <nav className="mt-4 space-y-1.5">
              {COURSE_MODULES.map((mod) => {
                const isCurrent = mod.id === activeModuleId;
                const isDone = completedModules.includes(mod.id);
                const levelColor =
                  mod.level === 'Fundamentos'
                    ? 'text-cyan-300 border-cyan-500/30 bg-cyan-500/10'
                    : mod.level === 'Intermedio'
                    ? 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10'
                    : mod.level === 'Avanzado'
                    ? 'text-amber-300 border-amber-500/30 bg-amber-500/10'
                    : 'text-purple-300 border-purple-500/30 bg-purple-500/10';

                return (
                  <button
                    key={mod.id}
                    onClick={() => handleSelectModule(mod.id)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-start gap-2.5 ${
                      isCurrent
                        ? 'bg-slate-800 border-cyan-500/60 shadow-md'
                        : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
                    }`}
                  >
                    <div
                      className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-mono font-bold shrink-0 ${
                        isDone
                          ? 'bg-emerald-500 text-slate-950'
                          : isCurrent
                          ? 'bg-cyan-500 text-slate-950'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isDone ? '✓' : mod.id}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-100 leading-snug">
                        {mod.title.replace(/^Módulo \d+:\s*/, '')}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${levelColor}`}>
                          {mod.level}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{mod.duration}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Active Microcontroller Datasheet Summary Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Cpu className="w-4 h-4" /> Ficha Técnica Activa
              </span>
              <span className="text-xs font-mono font-bold text-white">{currentMcu.name}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{currentMcu.tagline}</p>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-1.5 text-xs font-mono">
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
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
                Por qué estudiar este chip:
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">{currentMcu.pedagogicalRole}</p>
            </div>
          </div>
        </aside>

        {/* RIGHT COLUMN: MODULE LESSON + NOTEBOOK + CODE + LABS + EXERCISES */}
        <main className="lg:col-span-9 space-y-6">
          {/* Module Header Banner */}
          <section className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Módulo {currentModule.id} (Ruta 0 a {COURSE_MODULES.length - 1}) • {currentModule.level}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Viendo en: <strong className="text-white">{currentMcu.name}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentModule.id <= 0}
                  onClick={() => handleSelectModule(currentModule.id - 1)}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 disabled:opacity-40 hover:bg-slate-800 flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Anterior
                </button>
                <button
                  disabled={currentModule.id >= COURSE_MODULES.length - 1}
                  onClick={() => handleSelectModule(currentModule.id + 1)}
                  className="px-2.5 py-1 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs disabled:opacity-40 hover:bg-cyan-400 flex items-center gap-1"
                >
                  Siguiente <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {currentModule.title}
            </h2>
            <p className="text-sm text-slate-300 mt-1">{currentModule.subtitle}</p>

            {/* THE PEDAGOGICAL BRIDGE: 3 COLUMNS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-5">
              <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-3.5">
                <div className="text-xs font-bold uppercase tracking-wider text-rose-300 mb-1">
                  1. El Extremo Superficial (Lo que ocultan los cursos básicos)
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{currentModule.superficialMyth}</p>
              </div>

              <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-3.5">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-1">
                  2. El Extremo Abrumador (Lo que suelta el Datasheet sin filtro)
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-mono">
                  {currentModule.overwhelmingDatasheet}
                </p>
              </div>

              <div className="bg-emerald-950/25 border border-emerald-500/40 rounded-xl p-3.5">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-300 mb-1 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> 3. El Puente Real (Cómo se conecta todo)
                </div>
                <p className="text-xs text-slate-100 leading-relaxed">{currentModule.theBridgeExplanation}</p>
              </div>
            </div>
          </section>

          {/* =================================================================
              CAPÍTULOS DE TEORÍA PROFUNDA (LIBRO DE TEXTO TÉCNICO)
             ================================================================= */}
          {currentDeepChapters.length > 0 && (
            <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-6">
              <div className="border-b border-slate-800 pb-3.5 flex flex-wrap items-center justify-between gap-2">
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
                        <pre className="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-cyan-200 overflow-x-auto leading-relaxed">
                          {chapter.workedExample.codeOrMath}
                        </pre>
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
            </section>
          )}

          {/* =================================================================
              FUNDAMENTOS TEÓRICOS, DEFINICIONES, FÓRMULAS Y EJEMPLOS DESGLOSADOS
             ================================================================= */}
          <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
            <div className="border-b border-slate-800 pb-3.5">
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
                    <code className="mt-2.5 block text-[11px] font-mono bg-slate-900 px-2.5 py-1.5 rounded text-amber-300 border border-slate-800 overflow-x-auto">
                      {def.exampleToCopy}
                    </code>
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
                      <code className="block my-1.5 text-xs font-mono font-bold text-emerald-300 bg-slate-950 px-2.5 py-1.5 rounded border border-emerald-500/30">
                        {rule.formulaOrRule}
                      </code>
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
                <pre className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-xs font-mono text-cyan-200 overflow-x-auto leading-relaxed">
                  {currentExtended.annotatedCodeToCopy.code}
                </pre>
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
          </section>

          {/* =================================================================
              EVOLUTIONARY 3-LEVEL C CODE VIEWER (SYNCED WITH ACTIVE MCU)
             ================================================================= */}
          <section className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="bg-slate-950/90 border-b border-slate-800 p-4 flex flex-wrap items-center justify-between gap-3">
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

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                  <pre className="text-xs sm:text-sm font-mono text-cyan-200 overflow-x-auto leading-relaxed">
                    {moduleCodeForMcu[abstractionLevel]}
                  </pre>
                </div>

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
                    <pre className="text-[11px] font-mono text-slate-200 overflow-x-auto leading-relaxed">
                      {currentModule.mcuCode[m.id][abstractionLevel]}
                    </pre>
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
          <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-6">
            {/* Part A: 3-Level Escalera de Retos Prácticos de Código C */}
            <div className="bg-slate-950 border border-cyan-500/30 rounded-xl p-4 space-y-4">
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
                  <textarea
                    rows={3}
                    value={challengeCodeInput}
                    onChange={(e) => setChallengeCodeInput(e.target.value)}
                    spellCheck={false}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:outline-none rounded-xl p-3 text-xs font-mono text-emerald-300"
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
          </section>
        </main>
      </div>
    </div>
  );
}
