import React from 'react';
import { Eraser, Pencil } from 'lucide-react';

interface NumpadProps {
    onNumberClick: (num: number) => void;
    onEraseClick: () => void;
    isNoteMode?: boolean;
    onNoteToggle?: () => void;
}

export const Numpad: React.FC<NumpadProps> = ({ onNumberClick, onEraseClick, isNoteMode = false, onNoteToggle }) => {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    return (
        <div className="w-full max-w-md mt-6">
            <div className="grid grid-cols-5 gap-2 sm:gap-3 mb-2 sm:mb-3">
                {numbers.slice(0, 5).map(num => (
                    <button
                        key={num}
                        onClick={() => onNumberClick(num)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-2xl font-bold py-3 sm:py-4 rounded-lg shadow-md border border-slate-700 transition-transform active:scale-95"
                    >
                        {num}
                    </button>
                ))}
            </div>
            <div className="grid grid-cols-6 gap-2 sm:gap-3">
                {numbers.slice(5, 9).map(num => (
                    <button
                        key={num}
                        onClick={() => onNumberClick(num)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-2xl font-bold py-3 sm:py-4 rounded-lg shadow-md border border-slate-700 transition-transform active:scale-95"
                    >
                        {num}
                    </button>
                ))}
                <button
                    onClick={onNoteToggle}
                    className={`flex items-center justify-center py-3 sm:py-4 rounded-lg shadow-md border transition-transform active:scale-95 ${isNoteMode ? 'bg-brand-500 text-black border-brand-400' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}
                    aria-label="Toggle Notes"
                >
                    <Pencil size={24} />
                </button>
                <button
                    onClick={onEraseClick}
                    className="bg-red-900/50 hover:bg-red-800/60 text-red-200 flex items-center justify-center py-3 sm:py-4 rounded-lg shadow-md border border-red-900/50 transition-transform active:scale-95"
                    aria-label="Erase"
                >
                    <Eraser size={24} />
                </button>
            </div>
        </div>
    );
};
