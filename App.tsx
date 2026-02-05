
import React, { useState, useEffect } from 'react';
import { Screen, PuzzleType, GameState } from './types.ts';
import { PUZZLES } from './constants.tsx';
import { GoogleGenAI } from "@google/genai";

// Protezione contro API_KEY mancante per evitare crash su GitHub
const apiKey = (typeof process !== 'undefined' && process.env.API_KEY) ? process.env.API_KEY : "DEMO_MODE";
const ai = new GoogleGenAI({ apiKey: apiKey });

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>(Screen.HOME);
  const [gameState, setGameState] = useState<GameState>({
    currentEnigmaIndex: 0,
    xp: 0,
    timeSpent: 0,
    errors: 0,
    completed: false
  });
  const [userAnswer, setUserAnswer] = useState<any>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info' | null, message: string }>({ type: null, message: '' });
  const [aiHint, setAiHint] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [unlockedItems, setUnlockedItems] = useState<string[]>([]);
  const [showShareDialog, setShowShareDialog] = useState(false);

  const currentPuzzle = PUZZLES[gameState.currentEnigmaIndex];

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback({ type: null, message: '' }), 3000);
  };

  useEffect(() => {
    if (currentPuzzle && screen === Screen.MISSION) {
      if (currentPuzzle.type === PuzzleType.ORDERING) {
        const shuffled = [...currentPuzzle.data].sort(() => Math.random() - 0.5);
        setUserAnswer(shuffled);
      } else if (currentPuzzle.type === PuzzleType.MATCHING) {
        setUserAnswer({});
      } else {
        setUserAnswer('');
      }
      setAiHint(null);
    }
  }, [gameState.currentEnigmaIndex, screen]);

  useEffect(() => {
    let interval: number;
    if (!gameState.completed && screen !== Screen.HOME && screen !== Screen.COMPLETED) {
      interval = window.setInterval(() => {
        setGameState(prev => ({ ...prev, timeSpent: prev.timeSpent + 1 }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [screen, gameState.completed]);

  const getAiHint = async () => {
    if (apiKey === "DEMO_MODE") {
      setAiHint("Gli dèi sono silenti in modalità demo.");
      return;
    }
    if (isAiLoading) return;
    setIsAiLoading(true);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Sei un Senatore Romano. Aiuta il giocatore a risolvere questo enigma: "${currentPuzzle.title}". Descrizione: ${currentPuzzle.description}. Luogo: ${currentPuzzle.location}. La risposta corretta è ${JSON.stringify(currentPuzzle.correctAnswer)}. Fornisci un indizio criptico e solenne senza svelare la risposta.`,
        config: { temperature: 0.8 }
      });
      setAiHint(response.text || "La saggezza degli antichi ti illuminerà.");
    } catch (e) {
      setAiHint("Gli dèi non rispondono. Usa il tuo ingegno.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const isAnswerCorrect = () => {
    if (!currentPuzzle || userAnswer === null) return false;
    if (currentPuzzle.type === PuzzleType.ORDERING) {
      return Array.isArray(userAnswer) && 
             userAnswer.every((val, index) => val === currentPuzzle.correctAnswer[index]);
    } 
    if (currentPuzzle.type === PuzzleType.MATCHING) {
      const keys = Object.keys(currentPuzzle.correctAnswer);
      return keys.length === Object.keys(userAnswer).length && 
             keys.every(k => userAnswer[k] === currentPuzzle.correctAnswer[k]);
    }
    return String(userAnswer).trim().toLowerCase() === String(currentPuzzle.correctAnswer).trim().toLowerCase();
  };

  const checkAnswer = () => {
    if (isAnswerCorrect()) {
      showToast('Optime! Prova superata.', 'success');
      setUnlockedItems(prev => Array.from(new Set([...prev, currentPuzzle.title])));
      setTimeout(() => {
        if (gameState.currentEnigmaIndex < PUZZLES.length - 1) {
          setGameState(prev => ({ ...prev, xp: prev.xp + 250, currentEnigmaIndex: prev.currentEnigmaIndex + 1 }));
          setScreen(Screen.MAP);
        } else {
          setGameState(prev => ({ ...prev, xp: prev.xp + 250, completed: true }));
          setScreen(Screen.COMPLETED);
        }
      }, 1500);
    } else {
      showToast('Vae Victis! Errore commesso.', 'error');
      setGameState(prev => ({ ...prev, errors: prev.errors + 1, xp: Math.max(0, prev.xp - 50) }));
    }
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => showToast("Link copiato!", "info"))
      .catch(() => showToast("Copia manuale: " + url, "error"));
  };

  const shareGame = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Roma Aeterna', text: 'Sfida la storia!', url: window.location.href });
      } catch (err) { handleCopyLink(); }
    } else { handleCopyLink(); }
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (!Array.isArray(userAnswer)) return;
    const newAnswer = [...userAnswer];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newAnswer.length) return;
    [newAnswer[index], newAnswer[targetIndex]] = [newAnswer[targetIndex], newAnswer[index]];
    setUserAnswer(newAnswer);
  };

  const Navigation = () => (
    <nav className="fixed bottom-0 left-0 right-0 bg-background-dark/95 backdrop-blur-xl border-t border-primary/20 p-4 z-50 flex justify-around items-center ios-blur">
      <button onClick={() => setScreen(Screen.MAP)} className={`flex flex-col items-center gap-1 ${screen === Screen.MAP ? 'text-primary' : 'text-slate-500'}`}>
        <span className="material-symbols-outlined text-3xl">map</span>
        <span className="text-[10px] font-bold uppercase">Mappa</span>
      </button>
      <button onClick={() => setScreen(Screen.MISSION)} className={`flex flex-col items-center gap-1 ${screen === Screen.MISSION ? 'text-primary' : 'text-slate-500'}`}>
        <span className="material-symbols-outlined text-3xl">swords</span>
        <span className="text-[10px] font-bold uppercase">Enigma</span>
      </button>
      <button onClick={() => setShowShareDialog(true)} className="flex flex-col items-center gap-1 -translate-y-4">
        <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-background-dark shadow-xl"><span className="material-symbols-outlined">share</span></div>
      </button>
      <button onClick={() => setScreen(Screen.INVENTORY)} className={`flex flex-col items-center gap-1 ${screen === Screen.INVENTORY ? 'text-primary' : 'text-slate-500'}`}>
        <span className="material-symbols-outlined text-3xl">inventory_2</span>
        <span className="text-[10px] font-bold uppercase">Zaino</span>
      </button>
      <button onClick={() => setScreen(Screen.DASHBOARD)} className={`flex flex-col items-center gap-1 ${screen === Screen.DASHBOARD ? 'text-primary' : 'text-slate-500'}`}>
        <span className="material-symbols-outlined text-3xl">leaderboard</span>
        <span className="text-[10px] font-bold uppercase">Status</span>
      </button>
    </nav>
  );

  if (screen === Screen.HOME) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center p-6 bg-[url('https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/75"></div>
        <div className="relative z-10 text-center space-y-8 max-w-3xl">
          <h1 className="text-8xl md:text-[10rem] font-display text-primary tracking-tighter drop-shadow-2xl">ROMA</h1>
          <h2 className="text-3xl md:text-5xl font-display text-white tracking-[0.5em] opacity-80">AETERNA</h2>
          <button onClick={() => setScreen(Screen.MAP)} className="px-12 py-5 bg-primary text-background-dark font-display font-black text-xl rounded-sm hover:scale-105 transition-all">INIZIA L'AVVENTURA</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-dark text-white font-body marble-texture pb-28">
      {feedback.message && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200]">
          <div className={`px-8 py-4 rounded-2xl shadow-2xl border-2 font-display font-bold text-sm uppercase tracking-widest flex items-center gap-4 ${feedback.type === 'success' ? 'bg-green-600 border-green-400' : feedback.type === 'error' ? 'bg-red-600 border-red-400' : 'bg-primary text-background-dark border-primary/50'}`}>
            <span className="material-symbols-outlined">{feedback.type === 'success' ? 'verified' : feedback.type === 'error' ? 'gavel' : 'info'}</span>
            {feedback.message}
          </div>
        </div>
      )}

      {showShareDialog && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
          <div className="bg-slate-900 border-2 border-primary/40 p-10 rounded-[3rem] max-w-sm w-full text-center space-y-8 relative">
            <button onClick={() => setShowShareDialog(false)} className="absolute top-6 right-6 text-slate-500"><span className="material-symbols-outlined text-3xl">close</span></button>
            <h3 className="font-display text-3xl text-primary uppercase">Gloria Publica</h3>
            <div className="bg-white p-6 rounded-3xl inline-block">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.href)}&color=101622`} alt="QR" className="w-44 h-44" />
            </div>
            <button onClick={shareGame} className="w-full py-5 bg-primary text-background-dark font-display font-black text-lg rounded-2xl flex items-center justify-center gap-4">
              <span className="material-symbols-outlined">send</span> CONDIVIDI LINK
            </button>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-50 bg-background-dark/95 border-b border-primary/20 px-6 py-4 ios-blur flex justify-between items-center">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 rounded-full border-2 border-primary/50 flex items-center justify-center bg-primary/10">
            <span className="font-display text-primary text-xl">{gameState.currentEnigmaIndex + 1}</span>
          </div>
          <h4 className="font-display text-sm uppercase">{currentPuzzle?.location}</h4>
        </div>
        <div className="px-5 py-2 bg-primary text-background-dark rounded-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">token</span>
          <span className="font-display font-black">{gameState.xp}</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {screen === Screen.MAP && (
          <div className="space-y-8 py-4">
            <h1 className="text-5xl font-display text-primary text-center uppercase tracking-tighter">Mappa dell'Urbe</h1>
            <div className="relative aspect-[16/10] bg-slate-900 rounded-3xl overflow-hidden border-4 border-primary/20">
              <img src="https://images.unsplash.com/photo-1541411132692-04e43f114e91?auto=format&fit=crop&q=1200" className="w-full h-full object-cover opacity-40 grayscale" />
              {PUZZLES.map((p, idx) => (
                <div key={p.id} className="absolute transform -translate-x-1/2 -translate-y-1/2" style={{ left: `${15 + idx * 23}%`, top: `${40 + (idx % 2) * 20}%` }}>
                  <button onClick={() => { if(idx <= gameState.currentEnigmaIndex) { setGameState(prev => ({ ...prev, currentEnigmaIndex: idx })); setScreen(Screen.MISSION); } }} className={`w-14 h-14 rounded-full flex items-center justify-center border-2 ${idx < gameState.currentEnigmaIndex ? 'bg-green-500 border-green-300' : idx === gameState.currentEnigmaIndex ? 'bg-primary border-white animate-bounce' : 'bg-slate-800 border-slate-700 opacity-40'}`}>
                    <span className="material-symbols-outlined text-white">{idx < gameState.currentEnigmaIndex ? 'check' : idx === gameState.currentEnigmaIndex ? 'explore' : 'lock'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {screen === Screen.MISSION && currentPuzzle && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-7 space-y-8">
              <div className="relative rounded-[2rem] overflow-hidden aspect-video">
                <img src={currentPuzzle.image} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-background-dark"></div>
                <div className="absolute bottom-10 left-10"><h1 className="text-5xl font-display text-white">{currentPuzzle.title}</h1></div>
              </div>
              <div className="bg-slate-900/40 p-10 rounded-[2rem] border border-white/5"><p className="text-2xl text-slate-300">{currentPuzzle.description}</p></div>
            </div>
            <div className="lg:col-span-5 bg-slate-900 border border-primary/20 p-10 rounded-[2rem]">
              <h3 className="text-3xl font-display text-primary border-b border-primary/20 pb-6 mb-8 uppercase">Solutio</h3>
              <div className="min-h-[300px]">
                {currentPuzzle.type === PuzzleType.MATH && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-4">{currentPuzzle.data.map((item: any, i: number) => (<div key={i} className="bg-slate-800/40 p-5 rounded-2xl text-center"><span className="text-[10px] uppercase font-bold text-slate-500 block">{item.label}</span><span className="text-3xl font-display text-primary">{item.value}</span></div>))}</div>
                    <input type="number" value={userAnswer || ''} onChange={(e) => setUserAnswer(e.target.value)} className="w-full bg-black/40 border-2 border-primary/20 rounded-2xl p-6 font-display text-4xl text-center text-white" />
                  </div>
                )}
                {currentPuzzle.type === PuzzleType.ORDERING && Array.isArray(userAnswer) && (
                  <div className="space-y-3">{userAnswer.map((item: string, idx: number) => (<div key={idx} className="flex items-center gap-4 bg-slate-800/30 p-4 rounded-xl border border-white/5"><span className="text-primary/40 font-display text-xl w-6">{idx + 1}</span><span className="flex-1 text-sm text-slate-300">{item}</span><div className="flex flex-col"><button onClick={() => moveItem(idx, 'up')} className="material-symbols-outlined text-sm">expand_less</button><button onClick={() => moveItem(idx, 'down')} className="material-symbols-outlined text-sm">expand_more</button></div></div>))}</div>
                )}
              </div>
              <button onClick={checkAnswer} className="w-full mt-10 py-6 bg-primary text-background-dark font-display font-black text-xl rounded-2xl uppercase tracking-widest shadow-xl">Consegna Prova</button>
            </div>
          </div>
        )}
      </main>
      <Navigation />
    </div>
  );
};

export default App;
