

export default function WordDisplay({ word, guesses }) {
    const displayGuesses = guesses || [];
    return (
        <div className="flex justify-center gap-2 sm:gap-4 my-6">
            {word.split('').map((letter, index) => (
                <div key={index} className="flex items-center justify-center h-12 w-10 sm:h-16 sm:w-12 bg-white/80 rounded-lg shadow-inner">
                    <span className="text-3xl sm:text-4xl font-bold text-gray-800">
                        {displayGuesses.includes(letter) ? letter : ''}
                    </span>
                </div>
            ))}
        </div>
    );
}