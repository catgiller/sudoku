import React from 'react';
import { BoardData } from '../types';

interface SudokuBoardProps {
    board: BoardData;
    selectedCell: [number, number] | null;
    onCellClick: (r: number, c: number) => void;
    animatingRow?: number | null;
    animatingCol?: number | null;
    koBoxIndex?: number | null;
    cartoonTexts?: {id: number, text: string, r: number, c: number}[];
}

export const SudokuBoard: React.FC<SudokuBoardProps> = ({ 
    board, 
    selectedCell, 
    onCellClick,
    animatingRow,
    animatingCol,
    koBoxIndex,
    cartoonTexts = []
}) => {
    
    const isSelected = (r: number, c: number) => selectedCell?.[0] === r && selectedCell?.[1] === c;
    
    const isRelated = (r: number, c: number) => {
        if (!selectedCell) return false;
        const [sr, sc] = selectedCell;
        return r === sr || c === sc || (Math.floor(r / 3) === Math.floor(sr / 3) && Math.floor(c / 3) === Math.floor(sc / 3));
    };

    const isSameValue = (r: number, c: number) => {
        if (!selectedCell) return false;
        const selectedValue = board[selectedCell[0]][selectedCell[1]].value;
        return selectedValue !== 0 && board[r][c].value === selectedValue;
    };

    return (
        <div className="w-full max-w-md aspect-square bg-slate-950 rounded-xl p-1 shadow-2xl border-4 border-slate-800 relative">
            
            {/* K.O. Overlay - Centered, Horizontal, Red/Yellow, Flaming */}
            {koBoxIndex !== null && koBoxIndex !== undefined && (
                <div className="absolute top-1/2 left-1/2 z-40 pointer-events-none flex items-center justify-center w-4/5 h-32 animate-ko-pop">
                    <div className="w-full h-full bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 rounded-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center overflow-hidden relative">
                        <span className="font-cartoon text-6xl sm:text-7xl text-white animate-flame tracking-widest">K.O.</span>
                    </div>
                </div>
            )}

            {/* Floating Cartoon Texts */}
            {cartoonTexts.map(ct => (
                <div 
                    key={ct.id}
                    className="absolute z-50 pointer-events-none animate-float-text flex items-center justify-center"
                    style={{
                        top: `${(ct.r / 9) * 100 + 5}%`,
                        left: `${(ct.c / 9) * 100 + 5}%`,
                    }}
                >
                    {ct.text === "7_EATS_6" ? (
                        <div className="flex items-center gap-1 font-cartoon text-5xl sm:text-6xl">
                            <span className="text-brand-400 animate-chomp-attacker inline-block" style={{ textShadow: '3px 3px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}>7</span>
                            <span className="text-slate-300 animate-chomp-victim inline-block" style={{ textShadow: '3px 3px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}>6</span>
                        </div>
                    ) : (
                        <span className="font-cartoon text-3xl sm:text-4xl text-brand-400 whitespace-nowrap" style={{ textShadow: '2px 2px 0 #ca8a04, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}>
                            {ct.text}
                        </span>
                    )}
                </div>
            ))}

            <div className="w-full h-full grid grid-cols-9 grid-rows-9 gap-[1px] bg-slate-600 border-4 border-slate-950 relative z-10">
                {board.map((row, r) => (
                    row.map((cell, c) => {
                        const borderRight = c % 3 === 2 && c !== 8 ? 'border-r-[4px] border-r-slate-950' : '';
                        const borderBottom = r % 3 === 2 && r !== 8 ? 'border-b-[4px] border-b-slate-950' : '';
                        
                        let bgColor = 'bg-slate-800';
                        if (isSelected(r, c)) {
                            bgColor = 'bg-brand-600';
                        } else if (isSameValue(r, c)) {
                            bgColor = 'bg-brand-800/60';
                        } else if (isRelated(r, c)) {
                            bgColor = 'bg-slate-700';
                        }

                        let textColor = 'text-slate-200';
                        if (cell.isError) {
                            textColor = 'text-red-400 font-bold';
                            bgColor = isSelected(r,c) ? 'bg-red-900/80' : 'bg-red-950/50';
                        } else if (!cell.isFixed) {
                            textColor = 'text-brand-300';
                        }

                        const isAnimating = animatingRow === r || animatingCol === c;
                        const animationClass = isAnimating ? 'animate-pop-cell' : '';

                        return (
                            <div
                                key={`${r}-${c}`}
                                onClick={() => onCellClick(r, c)}
                                className={`
                                    flex items-center justify-center text-xl sm:text-2xl font-semibold
                                    cursor-pointer transition-colors duration-150 select-none relative
                                    ${bgColor} ${textColor} ${borderRight} ${borderBottom} ${animationClass}
                                    hover:bg-slate-600
                                `}
                            >
                                {cell.value !== 0 ? (
                                    cell.value
                                ) : cell.notes.length > 0 ? (
                                    <div className="grid grid-cols-3 grid-rows-3 w-full h-full p-0.5 pointer-events-none">
                                        {[1,2,3,4,5,6,7,8,9].map(n => (
                                            <div key={n} className="flex items-center justify-center text-[8px] sm:text-[10px] text-slate-400 leading-none">
                                                {cell.notes.includes(n) ? n : ''}
                                            </div>
                                        ))}
                                    </div>
                                ) : ''}
                            </div>
                        );
                    })
                ))}
            </div>
        </div>
    );
};
