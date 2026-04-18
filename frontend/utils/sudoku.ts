import { BoardData, Difficulty } from '../types';

// A valid, solved seed board
const SEED_BOARD = [
    [1, 2, 3, 4, 5, 6, 7, 8, 9],
    [4, 5, 6, 7, 8, 9, 1, 2, 3],
    [7, 8, 9, 1, 2, 3, 4, 5, 6],
    [2, 3, 1, 5, 6, 4, 8, 9, 7],
    [5, 6, 4, 8, 9, 7, 2, 3, 1],
    [8, 9, 7, 2, 3, 1, 5, 6, 4],
    [3, 1, 2, 6, 4, 5, 9, 7, 8],
    [6, 4, 5, 9, 7, 8, 3, 1, 2],
    [9, 7, 8, 3, 1, 2, 6, 4, 5]
];

// Utility to get a random integer between min and max (inclusive)
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Shuffle functions to create variations from the seed
const shuffleNumbers = (board: number[][]) => {
    const newBoard = board.map(row => [...row]);
    for (let i = 1; i <= 9; i++) {
        const num1 = i;
        const num2 = getRandomInt(1, 9);
        if (num1 !== num2) {
            for (let r = 0; r < 9; r++) {
                for (let c = 0; c < 9; c++) {
                    if (newBoard[r][c] === num1) newBoard[r][c] = num2;
                    else if (newBoard[r][c] === num2) newBoard[r][c] = num1;
                }
            }
        }
    }
    return newBoard;
};

const swapRows = (board: number[][], r1: number, r2: number) => {
    const temp = board[r1];
    board[r1] = board[r2];
    board[r2] = temp;
};

const swapCols = (board: number[][], c1: number, c2: number) => {
    for (let r = 0; r < 9; r++) {
        const temp = board[r][c1];
        board[r][c1] = board[r][c2];
        board[r][c2] = temp;
    }
};

const shuffleRowsWithinBlocks = (board: number[][]) => {
    for (let block = 0; block < 3; block++) {
        const start = block * 3;
        const r1 = start + getRandomInt(0, 2);
        const r2 = start + getRandomInt(0, 2);
        if (r1 !== r2) swapRows(board, r1, r2);
    }
};

const shuffleColsWithinBlocks = (board: number[][]) => {
    for (let block = 0; block < 3; block++) {
        const start = block * 3;
        const c1 = start + getRandomInt(0, 2);
        const c2 = start + getRandomInt(0, 2);
        if (c1 !== c2) swapCols(board, c1, c2);
    }
};

const swapRowBlocks = (board: number[][], b1: number, b2: number) => {
    for (let i = 0; i < 3; i++) {
        swapRows(board, b1 * 3 + i, b2 * 3 + i);
    }
};

const swapColBlocks = (board: number[][], b1: number, b2: number) => {
    for (let i = 0; i < 3; i++) {
        swapCols(board, b1 * 3 + i, b2 * 3 + i);
    }
};

const shuffleBlocks = (board: number[][]) => {
    const b1 = getRandomInt(0, 2);
    const b2 = getRandomInt(0, 2);
    if (b1 !== b2) {
        swapRowBlocks(board, b1, b2);
        swapColBlocks(board, getRandomInt(0, 2), getRandomInt(0, 2));
    }
};

export const generatePuzzle = (difficulty: Difficulty): { puzzle: BoardData, solution: number[][] } => {
    // 1. Generate a valid solved board
    let solution = SEED_BOARD.map(row => [...row]);
    solution = shuffleNumbers(solution);
    shuffleRowsWithinBlocks(solution);
    shuffleColsWithinBlocks(solution);
    shuffleBlocks(solution);

    // 2. Determine how many cells to remove based on difficulty
    let cellsToRemove = 0;
    switch (difficulty) {
        case 'easy': cellsToRemove = 30; break; // 51 clues
        case 'medium': cellsToRemove = 45; break; // 36 clues
        case 'hard': cellsToRemove = 55; break; // 26 clues
    }

    // 3. Create the puzzle board
    const puzzle: BoardData = solution.map(row => 
        row.map(val => ({ value: val, isFixed: true, isError: false, notes: [] }))
    );

    // 4. Remove cells randomly
    let removed = 0;
    while (removed < cellsToRemove) {
        const r = getRandomInt(0, 8);
        const c = getRandomInt(0, 8);
        if (puzzle[r][c].value !== 0) {
            puzzle[r][c].value = 0;
            puzzle[r][c].isFixed = false;
            removed++;
        }
    }

    return { puzzle, solution };
};

export const checkErrors = (board: BoardData, solution: number[][]): BoardData => {
    return board.map((row, r) => 
        row.map((cell, c) => ({
            ...cell,
            isError: cell.value !== 0 && !cell.isFixed && cell.value !== solution[r][c]
        }))
    );
};

export const isBoardFullAndCorrect = (board: BoardData, solution: number[][]): boolean => {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (board[r][c].value !== solution[r][c]) {
                return false;
            }
        }
    }
    return true;
};
