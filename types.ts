
export enum Screen {
  HOME = 'HOME',
  MISSION = 'MISSION',
  INVENTORY = 'INVENTORY',
  MAP = 'MAP',
  HINTS = 'HINTS',
  PROFILE = 'PROFILE',
  DASHBOARD = 'DASHBOARD',
  COMPLETED = 'COMPLETED'
}

export enum PuzzleType {
  ORDERING = 'ORDERING',
  ODD_ONE_OUT = 'ODD_ONE_OUT',
  MATH = 'MATH',
  MATCHING = 'MATCHING'
}

export interface Puzzle {
  id: number;
  type: PuzzleType;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  location: string;
  data: any;
  correctAnswer: any;
}

export interface GameState {
  currentEnigmaIndex: number;
  xp: number;
  timeSpent: number; // in seconds
  errors: number;
  completed: boolean;
}
