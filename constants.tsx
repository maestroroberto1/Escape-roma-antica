
import { Puzzle, PuzzleType } from './types.ts';

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
    correctAnswer: "67"
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
  }
];
