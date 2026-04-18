import React, { useState, useEffect, useCallback } from 'react';
import { Clock, User, Zap, ArrowLeft, RefreshCw, Gamepad2, AlertCircle, PlaySquare } from 'lucide-react';
import { Difficulty, GameStatus, BoardData, Opponent, GameMode } from './types';
import { generatePuzzle, checkErrors, isBoardFullAndCorrect } from './utils/sudoku';
import { SudokuBoard } from './components/SudokuBoard';
import { Numpad } from './components/Numpad';
import { Matchmaking } from './components/Matchmaking';
import { AdBanner } from './components/AdBanner';

const CARTOON_PHRASES = ["7_EATS_6", "7_EATS_6", "BAM!", "POW!", "CRUNCH!", "ZAP!", "BOOM!"];

const App: React.FC = () => {
    const [status, setStatus] = useState<GameStatus>('menu');
    const [gameMode, setGameMode] = useState<GameMode>('solo');
    const [difficulty, setDifficulty] = useState<Difficulty>('medium');
    
    const [board, setBoard] = useState<BoardData>([]);
    const [solution, setSolution] = useState<number[][]>([]);
    const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
    
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [opponent, setOpponent] = useState<Opponent | null>(null);
    const [playerProgress, setPlayerProgress] = useState(0);
    const [targetProgress, setTargetProgress] = useState(0);

    // --- Solo Mode Error Tracking ---
    const [errors, setErrors] = useState(0);
    const [maxErrors, setMaxErrors] = useState(3);

    // --- Note Mode ---
    const [isNoteMode, setIsNoteMode] = useState(false);

    // --- Animation Tracking ---
    const [completedRows, setCompletedRows] = useState<Set<number>>(new Set());
    const [completedCols, setCompletedCols] = useState<Set<number>>(new Set());
    const [completedBoxes, setCompletedBoxes] = useState<Set<number>>(new Set());
    
    const [animatingRow, setAnimatingRow] = useState<number | null>(null);
    const [animatingCol, setAnimatingCol] = useState<number | null>(null);
    const [koBoxIndex, setKoBoxIndex] = useState<number | null>(null);
    const [cartoonTexts, setCartoonTexts] = useState<{id: number, text: string, r: number, c: number}[]>([]);

    // --- Timer Logic ---
    useEffect(() => {
        let timer: number;
        if (status === 'playing') {
            timer = window.setInterval(() => {
                setTimeElapsed(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [status]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    // --- Opponent Simulation Logic ---
    useEffect(() => {
        let simInterval: number;
        if (status === 'playing' && gameMode === 'race' && opponent) {
            let minDelay = 6000, maxDelay = 12000;
            if (difficulty === 'easy') { minDelay = 8000; maxDelay = 16000; }
            if (difficulty === 'hard') { minDelay = 5000; maxDelay = 10000; }

            const simulateOpponentMove = () => {
                setOpponent(prev => {
                    if (!prev) return prev;
                    const newProgress = prev.progress + 1;
                    if (newProgress >= prev.target) {
                        setStatus('lost');
                    }
                    return { ...prev, progress: newProgress };
                });

                if (status === 'playing') {
                    const nextDelay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
                    simInterval = window.setTimeout(simulateOpponentMove, nextDelay);
                }
            };

            const initialDelay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
            simInterval = window.setTimeout(simulateOpponentMove, initialDelay);
        }
        return () => clearTimeout(simInterval);
    }, [status, difficulty, gameMode, opponent?.target]);


    // --- Game Actions ---
    const startGame = (selectedDiff: Difficulty) => {
        setDifficulty(selectedDiff);
        
        if (gameMode === 'solo') {
            const { puzzle, solution: newSolution } = generatePuzzle(selectedDiff);
            let emptyCells = 0;
            puzzle.forEach(row => row.forEach(cell => { if (cell.value === 0) emptyCells++; }));

            setBoard(puzzle);
            setSolution(newSolution);
            setSelectedCell(null);
            setTimeElapsed(0);
            setPlayerProgress(0);
            setTargetProgress(emptyCells);
            setOpponent(null);
            setErrors(0);
            setMaxErrors(selectedDiff === 'easy' ? 3 : selectedDiff === 'medium' ? 2 : 1);
            
            // Reset animations
            setCompletedRows(new Set());
            setCompletedCols(new Set());
            setCompletedBoxes(new Set());
            setCartoonTexts([]);
            
            setStatus('playing');
        } else {
            setStatus('matchmaking');
        }
    };

    const handleMatchFound = useCallback((opponentName: string) => {
        const { puzzle, solution: newSolution } = generatePuzzle(difficulty);
        let emptyCells = 0;
        puzzle.forEach(row => row.forEach(cell => { if (cell.value === 0) emptyCells++; }));

        setBoard(puzzle);
        setSolution(newSolution);
        setSelectedCell(null);
        setTimeElapsed(0);
        setPlayerProgress(0);
        setTargetProgress(emptyCells);
        setOpponent({ name: opponentName, progress: 0, target: emptyCells });
        
        setCompletedRows(new Set());
        setCompletedCols(new Set());
        setCompletedBoxes(new Set());
        setCartoonTexts([]);

        setStatus('playing');
    }, [difficulty]);

    const triggerCartoonText = (r: number, c: number) => {
        const text = CARTOON_PHRASES[Math.floor(Math.random() * CARTOON_PHRASES.length)];
        const id = Date.now() + Math.random();
        setCartoonTexts(prev => [...prev, { id, text, r, c }]);
        setTimeout(() => {
            setCartoonTexts(prev => prev.filter(t => t.id !== id));
        }, 1500);
    };

    const handleNumberInput = useCallback((num: number) => {
        if (status !== 'playing' || !selectedCell) return;
        const [r, c] = selectedCell;
        
        if (board[r][c].isFixed) return;

        const newBoard = [...board];
        newBoard[r] = [...newBoard[r]];

        if (isNoteMode) {
            const cell = newBoard[r][c];
            if (cell.value !== 0) return; // Don't add notes to filled cells
            
            let newNotes = [...cell.notes];
            if (newNotes.includes(num)) {
                newNotes = newNotes.filter(n => n !== num);
            } else {
                newNotes.push(num);
                newNotes.sort();
            }
            newBoard[r][c] = { ...cell, notes: newNotes };
            setBoard(newBoard);
            return;
        }

        // Normal input mode
        const isWrong = num !== solution[r][c];
        newBoard[r][c] = { ...newBoard[r][c], value: num, notes: [] }; // Clear notes on fill
        
        const checkedBoard = checkErrors(newBoard, solution);
        setBoard(checkedBoard);

        if (isWrong && gameMode === 'solo') {
            const newErrors = errors + 1;
            setErrors(newErrors);
            if (newErrors >= maxErrors) {
                setStatus('out_of_lives');
                return;
            }
        }

        // Check for completions if correct
        if (!isWrong) {
            // Check Row
            const isRowComplete = checkedBoard[r].every((cell, idx) => cell.value === solution[r][idx]);
            if (isRowComplete && !completedRows.has(r)) {
                setCompletedRows(prev => new Set(prev).add(r));
                setAnimatingRow(r);
                triggerCartoonText(r, 4); // Center of row
                setTimeout(() => setAnimatingRow(null), 600);
            }

            // Check Col
            const isColComplete = checkedBoard.every((row, idx) => row[c].value === solution[idx][c]);
            if (isColComplete && !completedCols.has(c)) {
                setCompletedCols(prev => new Set(prev).add(c));
                setAnimatingCol(c);
                triggerCartoonText(4, c); // Center of col
                setTimeout(() => setAnimatingCol(null), 600);
            }

            // Check Box
            const boxR = Math.floor(r / 3);
            const boxC = Math.floor(c / 3);
            const boxIdx = boxR * 3 + boxC;
            let isBoxComplete = true;
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if (checkedBoard[boxR * 3 + i][boxC * 3 + j].value !== solution[boxR * 3 + i][boxC * 3 + j]) {
                        isBoxComplete = false;
                    }
                }
            }
            if (isBoxComplete && !completedBoxes.has(boxIdx)) {
                setCompletedBoxes(prev => new Set(prev).add(boxIdx));
                setKoBoxIndex(boxIdx);
                setTimeout(() => setKoBoxIndex(null), 2500);
            }
        }

        // Update progress
        let correctCount = 0;
        checkedBoard.forEach((row, i) => {
            row.forEach((cell, j) => {
                if (!cell.isFixed && cell.value === solution[i][j]) {
                    correctCount++;
                }
            });
        });
        setPlayerProgress(correctCount);

        if (isBoardFullAndCorrect(checkedBoard, solution)) {
            setStatus('won');
        }
    }, [status, selectedCell, board, solution, errors, maxErrors, gameMode, isNoteMode, completedRows, completedCols, completedBoxes]);

    const handleErase = useCallback(() => {
        if (status !== 'playing' || !selectedCell) return;
        const [r, c] = selectedCell;
        
        if (board[r][c].isFixed) return;

        const newBoard = [...board];
        newBoard[r] = [...newBoard[r]];
        newBoard[r][c] = { ...newBoard[r][c], value: 0, isError: false, notes: [] };
        
        setBoard(newBoard);
        
        let correctCount = 0;
        newBoard.forEach((row, i) => {
            row.forEach((cell, j) => {
                if (!cell.isFixed && cell.value === solution[i][j]) {
                    correctCount++;
                }
            });
        });
        setPlayerProgress(correctCount);
    }, [status, selectedCell, board, solution]);

    const handleCellClick = (r: number, c: number) => {
        if (status !== 'playing') return;
        setSelectedCell([r, c]);
    };

    // --- Keyboard Support ---
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (status !== 'playing' || !selectedCell) return;

            if (e.key >= '1' && e.key <= '9') {
                handleNumberInput(parseInt(e.key, 10));
            } else if (e.key === 'Backspace' || e.key === 'Delete') {
                handleErase();
            } else if (e.key === 'n' || e.key === 'N') {
                setIsNoteMode(prev => !prev);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedCell(([r, c]) => [Math.max(0, r - 1), c]);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedCell(([r, c]) => [Math.min(8, r + 1), c]);
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                setSelectedCell(([r, c]) => [r, Math.max(0, c - 1)]);
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                setSelectedCell(([r, c]) => [r, Math.min(8, c + 1)]);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [status, selectedCell, handleNumberInput, handleErase]);

    const handleWatchAd = () => {
        setStatus('watching_ad');
        setTimeout(() => {
            setErrors(0);
            setStatus('playing');
        }, 2500);
    };

    const returnToMenu = () => {
        setStatus('menu');
        setOpponent(null);
    };

    const renderProgressBar = (label: string, progress: number, target: number, colorClass: string, isOpponent: boolean = false) => {
        const percentage = Math.min(100, Math.max(0, (progress / target) * 100));
        return (
            <div className="w-full space-y-1">
                <div className="flex justify-between text-xs font-medium text-slate-400">
                    <span className="flex items-center gap-1">
                        {isOpponent ? <User size={14} /> : <Zap size={14} />}
                        {label}
                    </span>
                    <span>{progress} / {target}</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                        className={`h-full ${colorClass} transition-all duration-500 ease-out`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>
        );
    };

    const isGameActive = ['playing', 'won', 'lost', 'out_of_lives', 'watching_ad'].includes(status);

    return (
        <div className="min-h-screen flex flex-col items-center p-4 sm:p-8 w-full overflow-x-hidden">
            
            <header className="w-full max-w-6xl flex items-center justify-between mb-8 mt-2 sm:mt-6">
                <div className="flex-1 hidden md:block"></div>

                <h1 
                    className="text-4xl sm:text-5xl md:text-6xl font-cartoon text-brand-400 flex items-center justify-center gap-3 sm:gap-4 shrink-0 tracking-widest"
                    style={{ textShadow: '3px 3px 0 #ca8a04' }}
                >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-brand-400 text-black rounded-xl flex items-center justify-center transform -rotate-12 border-4 border-brand-600 shadow-[4px_4px_0px_0px_#ca8a04]">
                        <span className="text-2xl sm:text-3xl font-cartoon mt-1">9</span>
                    </div>
                    PLACE ME
                </h1>

                <div className="flex-1 flex justify-end gap-2">
                    {isGameActive && gameMode === 'solo' && (
                        <div className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg border transition-colors ${errors >= maxErrors ? 'bg-red-900/50 border-red-700' : 'bg-slate-800 border-slate-700'}`}>
                            <AlertCircle size={16} className={errors >= maxErrors ? "text-red-400" : "text-brand-400"} />
                            <span className="font-mono text-xs sm:text-sm font-semibold">{errors}/{maxErrors}</span>
                        </div>
                    )}
                    {isGameActive && (
                        <div className="flex items-center gap-1.5 bg-slate-800 px-2 sm:px-3 py-1.5 rounded-lg border border-slate-700">
                            <Clock size={16} className="text-brand-400" />
                            <span className="font-mono text-xs sm:text-sm font-semibold">{formatTime(timeElapsed)}</span>
                        </div>
                    )}
                </div>
            </header>

            <div className="w-full max-w-7xl flex-1 flex justify-center gap-6 lg:gap-12">
                
                {status === 'menu' && (
                    <div className="hidden lg:flex w-72 flex-col pt-4 animate-in fade-in slide-in-from-left-8 duration-700">
                        <AdBanner type="vertex" />
                    </div>
                )}

                <main className="w-full max-w-md flex flex-col items-center">
                    
                    {status === 'menu' && (
                        <div className="w-full flex flex-col items-center justify-center space-y-8 mt-6 animate-in fade-in zoom-in-95 duration-500">
                            <div className="text-center space-y-4 mb-4">
                                <h2 className="text-4xl font-cartoon tracking-wider text-slate-100" style={{ textShadow: '2px 2px 0 #ca8a04' }}>Play Place Me!</h2>
                                <p className="text-slate-400">Choose your mode and difficulty.</p>
                            </div>

                            <div className="w-full flex gap-4 bg-slate-800/50 p-2 rounded-2xl border border-slate-700">
                                <button
                                    onClick={() => setGameMode('solo')}
                                    className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${gameMode === 'solo' ? 'bg-brand-600 text-black shadow-lg shadow-brand-500/20 scale-100' : 'text-slate-400 hover:text-brand-300 hover:bg-slate-700/50 scale-95'}`}
                                >
                                    <Gamepad2 size={20} />
                                    Solo
                                </button>
                                <button
                                    onClick={() => setGameMode('race')}
                                    className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${gameMode === 'race' ? 'bg-brand-600 text-black shadow-lg shadow-brand-500/20 scale-100' : 'text-slate-400 hover:text-brand-300 hover:bg-slate-700/50 scale-95'}`}
                                >
                                    <User size={20} />
                                    Race
                                </button>
                            </div>
                            
                            <div className="w-full space-y-4">
                                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider text-center mb-2">Select Difficulty</p>
                                {(['easy', 'medium', 'hard'] as Difficulty[]).map(diff => (
                                    <button
                                        key={diff}
                                        onClick={() => startGame(diff)}
                                        className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-brand-500 text-slate-200 font-bold py-4 rounded-xl shadow-lg transition-all transform hover:-translate-y-1 flex justify-between items-center px-6 group"
                                    >
                                        <span className="capitalize text-lg">{diff}</span>
                                        <Zap className="text-slate-500 group-hover:text-brand-400 transition-colors" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {status === 'matchmaking' && (
                        <Matchmaking difficulty={difficulty} onMatchFound={handleMatchFound} />
                    )}

                    {isGameActive && (
                        <div className="w-full flex flex-col items-center animate-in fade-in duration-500 relative">
                            
                            <div className="w-full bg-slate-800/50 p-4 rounded-xl border border-slate-700 mb-6 space-y-4">
                                {renderProgressBar(gameMode === 'solo' ? 'Progress' : 'You', playerProgress, targetProgress, 'bg-brand-500')}
                                {gameMode === 'race' && opponent && renderProgressBar(opponent.name, opponent.progress, opponent.target, 'bg-red-500', true)}
                            </div>

                            {status === 'out_of_lives' && (
                                <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 rounded-xl">
                                    <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 text-center max-w-sm w-full shadow-2xl transform transition-all scale-100">
                                        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <AlertCircle size={40} className="text-red-400" />
                                        </div>
                                        <h2 className="text-3xl font-bold text-white mb-2">Game Over</h2>
                                        <p className="text-slate-300 mb-6">You made {maxErrors} mistakes.</p>
                                        
                                        <div className="space-y-3">
                                            <button 
                                                onClick={handleWatchAd}
                                                className="w-full bg-brand-600 hover:bg-brand-500 text-black font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                                            >
                                                <PlaySquare size={20} />
                                                Watch Ad to Continue
                                            </button>
                                            <button 
                                                onClick={() => startGame(difficulty)}
                                                className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                                            >
                                                <RefreshCw size={20} />
                                                Try Again
                                            </button>
                                            <button 
                                                onClick={returnToMenu}
                                                className="w-full text-slate-400 hover:text-brand-300 font-bold py-2 px-4 rounded-lg transition-colors text-sm mt-2"
                                            >
                                                Back to Menu
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {status === 'watching_ad' && (
                                <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 rounded-xl">
                                    <div className="text-center space-y-4">
                                        <PlaySquare size={48} className="text-brand-400 animate-pulse mx-auto" />
                                        <h2 className="text-2xl font-bold text-white">Playing Advertisement...</h2>
                                        <p className="text-slate-400">Please wait to receive your extra life.</p>
                                    </div>
                                </div>
                            )}

                            {(status === 'won' || status === 'lost') && (
                                <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 rounded-xl">
                                    <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 text-center max-w-sm w-full shadow-2xl transform transition-all scale-100">
                                        {status === 'won' ? (
                                            <>
                                                <div className="w-20 h-20 bg-brand-400 text-black rounded-2xl flex items-center justify-center transform -rotate-12 border-4 border-brand-600 shadow-[6px_6px_0px_0px_#ca8a04] mx-auto mb-6">
                                                    <span className="text-5xl font-cartoon mt-2">1</span>
                                                </div>
                                                <h2 className="text-3xl font-bold text-white mb-2">
                                                    {gameMode === 'solo' ? 'Puzzle Solved!' : 'Victory!'}
                                                </h2>
                                                <p className="text-slate-300 mb-6">
                                                    {gameMode === 'solo' 
                                                        ? `You finished in ${formatTime(timeElapsed)}.` 
                                                        : `You beat ${opponent?.name} in ${formatTime(timeElapsed)}.`}
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <User size={40} className="text-red-400" />
                                                </div>
                                                <h2 className="text-3xl font-bold text-white mb-2">Defeat</h2>
                                                <p className="text-slate-300 mb-6">{opponent?.name} finished first.</p>
                                            </>
                                        )}
                                        
                                        <button 
                                            onClick={returnToMenu}
                                            className="w-full bg-brand-600 hover:bg-brand-500 text-black font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                                        >
                                            <RefreshCw size={20} />
                                            Play Again
                                        </button>
                                    </div>
                                </div>
                            )}

                            <SudokuBoard 
                                board={board} 
                                selectedCell={selectedCell} 
                                onCellClick={handleCellClick}
                                animatingRow={animatingRow}
                                animatingCol={animatingCol}
                                koBoxIndex={koBoxIndex}
                                cartoonTexts={cartoonTexts}
                            />
                            
                            <Numpad 
                                onNumberClick={handleNumberInput} 
                                onEraseClick={handleErase}
                                isNoteMode={isNoteMode}
                                onNoteToggle={() => setIsNoteMode(!isNoteMode)}
                            />

                            <button 
                                onClick={returnToMenu}
                                className="mt-8 text-slate-500 hover:text-brand-300 flex items-center gap-2 text-sm transition-colors"
                            >
                                <ArrowLeft size={16} />
                                {gameMode === 'solo' ? 'Back to Menu' : 'Forfeit & Leave'}
                            </button>
                        </div>
                    )}

                </main>

                {status === 'menu' && (
                    <div className="hidden lg:flex w-72 flex-col pt-4 animate-in fade-in slide-in-from-right-8 duration-700">
                        <AdBanner type="gcp" />
                    </div>
                )}

            </div>
        </div>
    );
};

export default App;
