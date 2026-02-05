
import { Puzzle, PuzzleType } from './types';

export const PUZZLES: Puzzle[] = [
  {
    id: 1,
    type: PuzzleType.MATH,
    title: "I Segreti del Mercato",
    subtitle: "Conti del Mercante Liberto",
    description: "Ti trovi tra le grida dei venditori del Macellum di Roma. Un mercante liberto ti sfida: 'Se vuoi passare, devi calcolare il valore esatto di questo carico'. I numeri sono incisi sulla pietra, somma la saggezza dei romani.",
    image: "https://images.unsplash.com/photo-1605333396915-47ed6b68a00e?q=80&w=1200&auto=format&fit=crop",
    location: "Macellum (Mercato)",
    data: [
      { label: "Anfora di Vino", value: "V" },
      { label: "Sacco di Grano", value: "X" },
      { label: "Tunica di Seta", value: "L" },
      { label: "Lampada ad Olio", value: "II" }
    ],
    correctAnswer: "67" // 5+10+50+2
  },
  {
    id: 2,
    type: PuzzleType.ODD_ONE_OUT,
    title: "Culína - La Cucina",
    subtitle: "L'Anacronismo del Banchetto",
    description: "Ti sei intrufolato nelle cucine della Domus Aurea. Il cuoco imperiale sta allestendo un banchetto, ma un nemico dell'impero ha inserito un ingrediente che non appartiene a questo secolo. Qual è l'intruso?",
    image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=1200&auto=format&fit=crop",
    location: "Cucina Imperiale",
    data: [
      { id: 'pomo', label: "Pomodori", img: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=400&auto=format&fit=crop" },
      { id: 'garum', label: "Salsa Garum", img: "https://images.unsplash.com/photo-1544070078-a212eda27b49?q=80&w=400&auto=format&fit=crop" },
      { id: 'pane', label: "Pane di Farro", img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=400&auto=format&fit=crop" },
      { id: 'miele', label: "Miele di Fiori", img: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=400&auto=format&fit=crop" }
    ],
    correctAnswer: "pomo"
  },
  {
    id: 3,
    type: PuzzleType.ORDERING,
    title: "L'Arte dell'Acquedotto",
    subtitle: "Ingegneria Vitruviana",
    description: "L'acqua è la linfa di Roma. L'acquedotto ha subito un crollo. Come architetto, devi coordinare la ricostruzione seguendo l'ordine logico tramandato dai grandi costruttori.",
    image: "https://images.unsplash.com/photo-1529154036614-a60975f5c760?q=80&w=1200&auto=format&fit=crop",
    location: "Acquedotto Claudio",
    data: [
      "Costruzione dei pilastri portanti",
      "Posa degli archi di sostegno",
      "Scavo dello speco (canale)",
      "Rivestimento in cocciopesto impermeabile",
      "Inaugurazione del flusso idrico"
    ],
    correctAnswer: [
      "Costruzione dei pilastri portanti",
      "Posa degli archi di sostegno",
      "Scavo dello speco (canale)",
      "Rivestimento in cocciopesto impermeabile",
      "Inaugurazione del flusso idrico"
    ]
  },
  {
    id: 4,
    type: PuzzleType.MATCHING,
    title: "I Gladiatori dell'Imperatore",
    subtitle: "Munera Gladitoria",
    description: "L'Anfiteatro Flavio ruggisce! Per dare inizio agli spettacoli, devi assegnare correttamente le armi ai gladiatori secondo la loro classe. Un errore nell'arena segnerà il destino della prova.",
    image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=1200&auto=format&fit=crop",
    location: "Colosseo",
    data: {
      left: [
        { id: 'retiarius', label: 'Retiarius' },
        { id: 'murmillo', label: 'Murmillo' },
        { id: 'thraex', label: 'Thraex' },
        { id: 'dimachaerus', label: 'Dimachaerus' }
      ],
      right: [
        { id: 'w1', label: 'Rete e Tridente' },
        { id: 'w2', label: 'Scudo e Gladius' },
        { id: 'w3', label: 'Sica e Parmula' },
        { id: 'w4', label: 'Due Spade Corte' }
      ]
    },
    correctAnswer: {
      'retiarius': 'w1',
      'murmillo': 'w2',
      'thraex': 'w3',
      'dimachaerus': 'w4'
    }
  }
];
