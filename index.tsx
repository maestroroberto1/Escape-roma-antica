
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log("Roma Aeterna: Inizializzazione sistema...");

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("Errore fatale: Elemento root non trovato nel DOM.");
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log("Roma Aeterna: Applicazione montata con successo.");
