export type Difficulty = 'easy' | 'medium' | 'hard';

export type GameMode = 'solo' | 'race';

export interface CellData {
    value: number;
    isFixed: boolean;
    isError: boolean;
    notes: number[];
}

export type BoardData = CellData[][];

export type GameStatus = 'menu' | 'matchmaking' | 'playing' | 'won' | 'lost' | 'out_of_lives' | 'watching_ad';

export interface Opponent {
    name: string;
    progress: number; // Number of cells filled correctly
    target: number;   // Total cells needed to win
}
