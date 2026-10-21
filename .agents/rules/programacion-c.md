---
trigger: always_on
description: Reglas de arquitectura, estilo pedagógico orientado a cuaderno físico, mantenibilidad y política de no sobrescritura para ProgramacionC.
---

# Reglas Activas del Proyecto (`ProgramacionC`)

1. **Idioma Español:** Mantén siempre explicaciones, código comentado, teoría y laboratorios en español técnico claro.
2. **Cuaderno Físico (Sin Textareas de Notas):** El usuario toma apuntes en un cuaderno físico real. Nunca agregues cajas de texto para tomar notas en la interfaz; muestra definiciones, fórmulas, tablas y esquemas listos para transcribir a mano.
3. **Prohibido Sobrescribir Contenido Existente:** Cualquier ampliación futura de módulos, teoría, normativa (ECSS / NASA / DO-178C / MISRA-C), quizzes o retos debe añadirse de forma aditiva sin eliminar el contenido previo.
4. **Mantenibilidad y Comentarios:** Todo nuevo componente, interfaz o bloque de datos debe incluir documentación JSDoc y comentarios explicativos claros.
5. **Verificación de Compilación:** Tras cualquier cambio en `src/`, verifica siempre con `npm run build` (`tsc && vite build`) que existen `0` errores de TypeScript.
