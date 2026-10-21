/**
 * @file main.tsx
 * @description Punto de entrada de la aplicación React (ProgramacionC).
 * Inicializa el árbol de renderizado en modo estricto (`React.StrictMode`)
 * e importa la hoja de estilos global con utilidades de Tailwind CSS.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

// Montaje de la aplicación principal sobre el nodo #root definido en index.html
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
