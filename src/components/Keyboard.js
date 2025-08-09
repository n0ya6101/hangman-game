import React from 'react';

function Keyboard({ onGuess, guesses }) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const displayGuesses = guesses || [];
    return (
        <div className="flex flex-wrap justify-center gap-2 mt-4 max-w-md h-auto">
            {alphabet.map(letter => {
                const isGuessed = displayGuesses.includes(letter);
                return (
                    <button key={letter} onClick={() => onGuess(letter)} disabled={isGuessed} className={`w-10 h-10 sm:w-12 sm:h-12 text-lg sm:text-xl font-bold rounded-lg shadow-md transition-all duration-200 transform ${isGuessed ? 'bg-gray-400 text-gray-600' : 'bg-white hover:bg-sky-100 hover:scale-110'}`}>
                        {letter}
                    </button>
                );
            })}
        </div>
    );
}

export default Keyboard;