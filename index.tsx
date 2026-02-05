
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

console.log("Roma Aeterna: Apertura dei cancelli dell'Urbe...");

const rootElement = document.getElementById('root');
if (rootElement) {
  try {
    const root = ReactDOM.createRoot(rootElement);
    // Render diretto per evitare doppi cicli di caricamento in dev/demo
    root.render(<App />);
    console.log("Roma Aeterna: Sistema pronto.");
  } catch (error) {
    console.error("Errore durante il montaggio dell'applicazione:", error);
    rootElement.innerHTML = `
      <div style="color: #d4af37; text-align: center; padding: 50px; font-family: serif;">
        <h2>Errore Fatale</h2>
        <p>Il sistema non è riuscito a caricare l'Urbe. Verifica la console del browser.</p>
      </div>
    `;
  }
}
