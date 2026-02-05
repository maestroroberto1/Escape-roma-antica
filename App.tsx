
import React, { useState, useEffect } from 'react';
import { Screen, PuzzleType, GameState } from './types';
import { PUZZLES } from './constants';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

  // Mostra una notifica temporanea (Toast)
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
          setGameState(prev => ({ 
            ...prev, 
            xp: prev.xp + 250,
            currentEnigmaIndex: prev.currentEnigmaIndex + 1 
          }));
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
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        showToast("Link copiato negli appunti!", "info");
      }).catch(() => {
        showToast("Impossibile copiare automaticamente.", "error");
      });
    } else {
      showToast("Copia manuale: " + url, "info");
    }
  };

  const shareGame = async () => {
    const text = `Riuscirai a fuggire dall'Antica Roma? Accetta la sfida di Roma Aeterna! 🏛️🔥`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Roma Aeterna',
          text: text,
          url: window.location.href
        });
      } catch (err) {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
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

  const handleMatch = (leftId: string, rightId: string) => {
    setUserAnswer((prev: any) => ({ ...prev, [leftId]: rightId }));
  };

  const Navigation = () => (
    <nav className="fixed bottom-0 left-0 right-0 bg-background-dark/95 backdrop-blur-xl border-t border-primary/20 p-4 z-50 flex justify-around items-center ios-blur">
      <button onClick={() => setScreen(Screen.MAP)} className={`flex flex-col items-center gap-1 transition-all ${screen === Screen.MAP ? 'text-primary scale-110' : 'text-slate-500 hover:text-slate-300'}`}>
        <span className="material-symbols-outlined text-3xl">map</span>
        <span className="text-[10px] font-bold uppercase tracking-widest">Mappa</span>
      </button>
      <button onClick={() => setScreen(Screen.MISSION)} className={`flex flex-col items-center gap-1 transition-all ${screen === Screen.MISSION ? 'text-primary scale-110' : 'text-slate-500 hover:text-slate-300'}`}>
        <span className="material-symbols-outlined text-3xl">swords</span>
        <span className="text-[10px] font-bold uppercase tracking-widest">Enigma</span>
      </button>
      
      {/* Tasto Share Centrale */}
      <button 
        onClick={() => setShowShareDialog(true)} 
        className="flex flex-col items-center gap-1 -translate-y-4 group"
      >
        <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-background-dark shadow-[0_0_20px_rgba(212,175,55,0.4)] group-hover:scale-110 transition-transform">
          <span className="material-symbols-outlined text-3xl">share</span>
        </div>
        <span className="text-[10px] font-black uppercase text-primary tracking-widest mt-1">Invita</span>
      </button>

      <button onClick={() => setScreen(Screen.INVENTORY)} className={`flex flex-col items-center gap-1 transition-all ${screen === Screen.INVENTORY ? 'text-primary scale-110' : 'text-slate-500 hover:text-slate-300'}`}>
        <span className="material-symbols-outlined text-3xl">inventory_2</span>
        <span className="text-[10px] font-bold uppercase tracking-widest">Zaino</span>
      </button>
      <button onClick={() => setScreen(Screen.DASHBOARD)} className={`flex flex-col items-center gap-1 transition-all ${screen === Screen.DASHBOARD ? 'text-primary scale-110' : 'text-slate-500 hover:text-slate-300'}`}>
        <span className="material-symbols-outlined text-3xl">leaderboard</span>
        <span className="text-[10px] font-bold uppercase tracking-widest">Status</span>
      </button>
    </nav>
  );

  if (screen === Screen.HOME) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center p-6 bg-[url('https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/75"></div>
        <div className="relative z-10 text-center space-y-8 max-w-3xl animate-in fade-in zoom-in-95 duration-700">
          <div className="space-y-2">
            <h1 className="text-8xl md:text-[10rem] font-display text-primary tracking-tighter drop-shadow-[0_0_30px_rgba(212,175,55,0.3)]">ROMA</h1>
            <h2 className="text-3xl md:text-5xl font-display text-white tracking-[0.5em] opacity-80">AETERNA</h2>
          </div>
          <p className="text-xl md:text-2xl font-body text-slate-300 italic leading-relaxed">
            "Le pietre parlano a chi sa ascoltare. Risolvi gli enigmi della Città Eterna e conquista la tua libertà."
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button 
              onClick={() => setScreen(Screen.MAP)}
              className="px-12 py-5 bg-primary text-background-dark font-display font-black text-xl rounded-sm hover:scale-105 active:scale-95 transition-all shadow-2xl"
            >
              INIZIA L'AVVENTURA
            </button>
            <button 
              onClick={() => setShowShareDialog(true)}
              className="px-8 py-5 border-2 border-primary/50 text-primary font-display font-bold text-lg rounded-sm hover:bg-primary/10 transition-all flex items-center justify-center gap-3"
            >
              <span className="material-symbols-outlined">share</span>
              CONDIVIDI
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-body marble-texture pb-28">
      
      {/* Toast Notification System */}
      {feedback.message && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-top-4 duration-300">
          <div className={`px-8 py-4 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] border-2 font-display font-bold text-sm uppercase tracking-widest flex items-center gap-4 ${
            feedback.type === 'success' ? 'bg-green-600 text-white border-green-400' :
            feedback.type === 'error' ? 'bg-red-600 text-white border-red-400' :
            'bg-primary text-background-dark border-primary/50'
          }`}>
            <span className="material-symbols-outlined text-2xl">
              {feedback.type === 'success' ? 'verified' : feedback.type === 'error' ? 'gavel' : 'info'}
            </span>
            {feedback.message}
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareDialog && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-slate-900 border-2 border-primary/40 p-10 rounded-[3rem] max-w-sm w-full text-center space-y-8 shadow-[0_0_100px_rgba(212,175,55,0.2)] relative">
            <button onClick={() => setShowShareDialog(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
              <span className="material-symbols-outlined text-3xl">close</span>
            </button>
            <div className="space-y-2">
              <h3 className="font-display text-3xl text-primary uppercase tracking-tighter">Gloria Publica</h3>
              <p className="text-xs text-slate-400 uppercase tracking-widest">Invita altri a sfidare la storia</p>
            </div>
            
            <div className="bg-white p-6 rounded-3xl inline-block shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] group">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.href)}&color=101622`} 
                alt="QR Code Sharing" 
                className="w-44 h-44 group-hover:scale-105 transition-transform"
              />
            </div>

            <div className="space-y-4">
              <button 
                onClick={shareGame}
                className="w-full py-5 bg-primary text-background-dark font-display font-black text-lg rounded-2xl flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20"
              >
                <span className="material-symbols-outlined">send</span>
                CONDIVIDI LINK
              </button>
              <button 
                onClick={handleCopyLink}
                className="w-full py-4 border-2 border-primary/30 text-primary font-display font-bold rounded-2xl hover:bg-primary/5 transition-all flex items-center justify-center gap-3"
              >
                <span className="material-symbols-outlined">content_copy</span>
                COPIA INDIRIZZO
              </button>
            </div>
            <p className="text-[10px] text-slate-500 italic font-body">"Verba volant, scripta manent. Condividi la tua ascesa."</p>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-50 bg-background-dark/95 backdrop-blur-md border-b border-primary/20 px-6 py-4 ios-blur">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-full border-2 border-primary/50 flex items-center justify-center bg-primary/10">
              <span className="font-display text-primary text-xl">{gameState.currentEnigmaIndex + 1}</span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest leading-none mb-1">Status</p>
              <h4 className="font-display text-sm truncate max-w-[120px]">{currentPuzzle?.location || "Roma"}</h4>
            </div>
          </div>
          <div className="px-5 py-2 bg-primary text-background-dark rounded-sm flex items-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.3)]">
            <span className="material-symbols-outlined text-sm font-black">token</span>
            <span className="font-display font-black text-lg">{gameState.xp}</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {screen === Screen.MAP && (
          <div className="space-y-8 py-4 animate-in zoom-in-95 duration-700">
            <div className="text-center space-y-2">
              <h1 className="text-5xl font-display text-primary uppercase tracking-tighter">Mappa dell'Urbe</h1>
              <p className="text-slate-500 font-body italic">"Tutte le strade portano a Roma, ma solo una conduce alla libertà."</p>
            </div>
            <div className="relative aspect-[16/10] bg-slate-900 rounded-3xl overflow-hidden border-4 border-primary/20 shadow-2xl">
              <img src="https://images.unsplash.com/photo-1541411132692-04e43f114e91?auto=format&fit=crop&q=1200" className="w-full h-full object-cover opacity-40 grayscale" alt="Map" />
              {PUZZLES.map((p, idx) => (
                <div key={p.id} className="absolute transform -translate-x-1/2 -translate-y-1/2" style={{ left: `${15 + idx * 23}%`, top: `${40 + (idx % 2) * 20}%` }}>
                  <button 
                    disabled={idx > gameState.currentEnigmaIndex}
                    onClick={() => { setGameState(prev => ({ ...prev, currentEnigmaIndex: idx })); setScreen(Screen.MISSION); }}
                    className={`flex flex-col items-center gap-2 ${idx > gameState.currentEnigmaIndex ? 'opacity-40 cursor-not-allowed' : 'opacity-100'}`}
                  >
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 shadow-xl ${idx < gameState.currentEnigmaIndex ? 'bg-green-500 border-green-300' : idx === gameState.currentEnigmaIndex ? 'bg-primary border-white animate-bounce' : 'bg-slate-800 border-slate-700'}`}>
                      <span className="material-symbols-outlined text-white">
                        {idx < gameState.currentEnigmaIndex ? 'check' : idx === gameState.currentEnigmaIndex ? 'explore' : 'lock'}
                      </span>
                    </div>
                    <span className={`px-2 py-1 bg-black/60 rounded text-[8px] font-bold text-white uppercase tracking-widest ${idx === gameState.currentEnigmaIndex ? 'text-primary' : ''}`}>{p.location}</span>
                  </button>
                </div>
              ))}
            </div>
            <div className="flex justify-center">
              <button onClick={() => setScreen(Screen.MISSION)} className="px-10 py-4 bg-primary text-background-dark font-display font-bold text-lg rounded-full flex items-center gap-3 hover:scale-105 transition-all">
                PROSEGUI <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {screen === Screen.MISSION && currentPuzzle && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 py-4">
            <div className="lg:col-span-7 space-y-8 animate-in slide-in-from-left-10">
              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl aspect-video group">
                <img src={currentPuzzle.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt={currentPuzzle.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent"></div>
                <div className="absolute bottom-10 left-10">
                  <h1 className="text-5xl font-display text-white mb-2 leading-none">{currentPuzzle.title}</h1>
                  <p className="text-xl text-primary/70 font-display italic">{currentPuzzle.subtitle}</p>
                </div>
              </div>
              <div className="bg-slate-900/40 p-10 rounded-[2rem] border border-white/5">
                <p className="text-2xl text-slate-300 leading-relaxed first-letter:text-5xl first-letter:text-primary first-letter:font-display first-letter:mr-2 first-letter:float-left">{currentPuzzle.description}</p>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-8 animate-in slide-in-from-right-10">
              <div className="bg-slate-900 border border-primary/20 p-10 rounded-[2rem] shadow-2xl">
                <h3 className="text-3xl font-display text-primary border-b border-primary/20 pb-6 mb-8 uppercase flex items-center gap-3">
                   <span className="material-symbols-outlined text-4xl">edit_note</span>
                   Solutio
                </h3>
                <div className="min-h-[300px]">
                  {currentPuzzle.type === PuzzleType.MATH && (
                    <div className="space-y-8">
                      <div className="grid grid-cols-2 gap-4">
                        {currentPuzzle.data.map((item: any, i: number) => (
                          <div key={i} className="bg-slate-800/40 p-5 rounded-2xl border border-white/5 text-center">
                            <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">{item.label}</span>
                            <span className="text-3xl font-display text-primary">{item.value}</span>
                          </div>
                        ))}
                      </div>
                      <input 
                        type="number" 
                        value={userAnswer || ''} 
                        onChange={(e) => setUserAnswer(e.target.value)}
                        className="w-full bg-black/40 border-2 border-primary/20 rounded-2xl p-6 font-display text-4xl text-center text-white focus:border-primary outline-none transition-all" 
                        placeholder="..."
                      />
                    </div>
                  )}
                  {currentPuzzle.type === PuzzleType.ODD_ONE_OUT && (
                    <div className="grid grid-cols-2 gap-5">
                      {currentPuzzle.data.map((item: any) => (
                        <button key={item.id} onClick={() => setUserAnswer(item.id)} className={`relative aspect-square rounded-[1.5rem] overflow-hidden border-2 transition-all ${userAnswer === item.id ? 'border-primary ring-8 ring-primary/10 scale-95' : 'border-slate-800 grayscale hover:grayscale-0'}`}>
                          <img src={item.img} className="w-full h-full object-cover" alt={item.label} />
                          <div className="absolute bottom-0 inset-x-0 bg-black/80 p-2 text-[8px] font-bold text-center text-white uppercase tracking-widest">{item.label}</div>
                        </button>
                      ))}
                    </div>
                  )}
                  {currentPuzzle.type === PuzzleType.ORDERING && Array.isArray(userAnswer) && (
                    <div className="space-y-3">
                      {userAnswer.map((item: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-4 bg-slate-800/30 p-4 rounded-xl border border-white/5 hover:border-primary/30 transition-all">
                          <span className="text-primary/40 font-display text-xl w-6">{idx + 1}</span>
                          <span className="flex-1 text-sm text-slate-300 font-body">{item}</span>
                          <div className="flex flex-col">
                            <button onClick={() => moveItem(idx, 'up')} disabled={idx === 0} className="material-symbols-outlined text-sm hover:text-primary disabled:opacity-0">expand_less</button>
                            <button onClick={() => moveItem(idx, 'down')} disabled={idx === userAnswer.length - 1} className="material-symbols-outlined text-sm hover:text-primary disabled:opacity-0">expand_more</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {currentPuzzle.type === PuzzleType.MATCHING && userAnswer && (
                    <div className="space-y-4">
                      {currentPuzzle.data.left.map((l: any) => (
                        <div key={l.id} className="bg-slate-800/20 p-4 rounded-xl border border-white/5">
                          <span className="font-display text-primary text-xs uppercase block mb-2">{l.label}</span>
                          <select value={userAnswer[l.id] || ''} onChange={(e) => handleMatch(l.id, e.target.value)} className="w-full bg-slate-950 border border-primary/20 rounded-lg p-2 text-white text-xs outline-none focus:border-primary">
                            <option value="">Seleziona Arma...</option>
                            {currentPuzzle.data.right.map((r: any) => <option key={r.id} value={r.id}>{r.label}</option>)}
                          </select>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={checkAnswer} className="w-full mt-10 py-6 bg-primary text-background-dark font-display font-black text-xl rounded-2xl uppercase tracking-[0.3em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                  Consegna Prova
                </button>
              </div>

              <div className="bg-imperial/5 border border-imperial/20 p-8 rounded-[2rem] space-y-4 group">
                <div className="flex justify-between items-center">
                  <h5 className="font-display text-imperial/90 text-sm tracking-widest uppercase flex items-center gap-2">
                    <span className="material-symbols-outlined">auto_awesome</span>
                    Consilium Senatoris
                  </h5>
                  <button onClick={getAiHint} disabled={isAiLoading} className="px-3 py-1 bg-imperial/10 rounded-full text-[10px] font-black uppercase text-imperial hover:bg-imperial hover:text-white transition-all">
                    {isAiLoading ? 'Invocazione...' : 'Aiuto'}
                  </button>
                </div>
                {aiHint && <p className="text-slate-300 italic text-lg leading-relaxed border-l-4 border-imperial/40 pl-6 animate-in slide-in-from-left-4">"{aiHint}"</p>}
              </div>
            </div>
          </div>
        )}

        {screen === Screen.COMPLETED && (
          <div className="min-h-[80vh] flex items-center justify-center animate-in fade-in duration-1000">
            <div className="scroll-effect w-full max-w-2xl p-12 text-center space-y-8">
              <span className="material-symbols-outlined text-[#8b4513] text-8xl">workspace_premium</span>
              <h2 className="text-6xl font-display text-[#8b4513] uppercase tracking-tighter border-b-2 border-[#8b4513]/10 pb-4">Civis Romanus Sum</h2>
              <div className="space-y-4 font-body italic text-[#5d2e0a] text-xl">
                <p>Per volere del Senato e del Popolo di Roma,</p>
                <p>hai dimostrato ingegno degno di un imperatore.</p>
                <p className="font-bold text-3xl pt-6">S.P.Q.R.</p>
              </div>
              <div className="grid grid-cols-2 gap-8 py-8 border-y-2 border-[#8b4513]/10">
                <div><p className="text-[10px] uppercase font-bold text-[#8b4513]/60">Meritum</p><p className="text-5xl font-display text-[#5d2e0a]">{gameState.xp}</p></div>
                <div><p className="text-[10px] uppercase font-bold text-[#8b4513]/60">Tempus</p><p className="text-5xl font-display text-[#5d2e0a]">{formatTime(gameState.timeSpent)}</p></div>
              </div>
              <div className="flex flex-col gap-4">
                <button onClick={() => setShowShareDialog(true)} className="w-full py-5 bg-primary text-background-dark font-display font-black text-xl rounded shadow-xl flex items-center justify-center gap-4 hover:scale-105 transition-all">
                  <span className="material-symbols-outlined">share</span> 
                  RENDI PUBBLICA LA VITTORIA
                </button>
                <button onClick={() => window.location.reload()} className="w-full py-4 bg-[#8b4513] text-parchment font-display font-bold text-lg rounded hover:opacity-90">REINIZIA</button>
              </div>
            </div>
          </div>
        )}

        {screen === Screen.INVENTORY && (
           <div className="py-8 space-y-12 animate-in fade-in duration-700">
             <div className="text-center space-y-2">
               <h1 className="text-6xl font-display text-primary uppercase">Zaino del Viaggiatore</h1>
               <p className="text-slate-500 font-body italic">Reliquie raccolte nel tuo cammino verso la cittadinanza.</p>
             </div>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {PUZZLES.map((p, idx) => {
                  const isUnlocked = unlockedItems.includes(p.title);
                  return (
                    <div key={idx} className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-4 text-center ${isUnlocked ? 'bg-slate-900 border-primary' : 'bg-slate-950 border-slate-800 opacity-40'}`}>
                      <span className="material-symbols-outlined text-5xl text-primary">{isUnlocked ? 'auto_stories' : 'lock'}</span>
                      <h3 className="font-display text-sm uppercase">{p.title}</h3>
                      {isUnlocked && <span className="text-[8px] text-green-400 font-bold uppercase tracking-widest">Sbloccato</span>}
                    </div>
                  )
                })}
             </div>
           </div>
        )}

        {screen === Screen.DASHBOARD && (
          <div className="py-8 space-y-12 animate-in fade-in duration-700">
            <div className="text-center space-y-2">
              <h1 className="text-6xl font-display text-primary uppercase">Status Sociale</h1>
              <p className="text-slate-500 font-body italic">"La tua ascesa nel Cursus Honorum."</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-slate-900 p-8 rounded-[2rem] border border-white/5 text-center space-y-2">
                <span className="material-symbols-outlined text-5xl text-primary">stars</span>
                <p className="text-xs uppercase font-bold text-slate-500">Merito Totale</p>
                <p className="text-6xl font-display text-white">{gameState.xp}</p>
              </div>
              <div className="bg-slate-900 p-8 rounded-[2rem] border border-white/5 text-center space-y-2">
                <span className="material-symbols-outlined text-5xl text-blue-400">schedule</span>
                <p className="text-xs uppercase font-bold text-slate-500">Tempo Trascorso</p>
                <p className="text-6xl font-display text-white">{formatTime(gameState.timeSpent)}</p>
              </div>
              <div className="bg-slate-900 p-8 rounded-[2rem] border border-white/5 text-center space-y-2">
                <span className="material-symbols-outlined text-5xl text-red-400">gavel</span>
                <p className="text-xs uppercase font-bold text-slate-500">Errori</p>
                <p className="text-6xl font-display text-white">{gameState.errors}</p>
              </div>
            </div>
          </div>
        )}
      </main>

      <Navigation />
    </div>
  );
};

export default App;
