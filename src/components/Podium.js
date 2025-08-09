import {TrophyIcon} from './Icon';


export default function Podium({ players, onPlayAgain, isAdmin }) {
    const topThree = players.slice(0, 3);
    const firstPlace = topThree[0];
    const secondPlace = topThree[1];
    const thirdPlace = topThree[2];

    const PodiumBlock = ({ player, height, color, rank, icon }) => {
        if (!player) return <div className="w-1/3"></div>;
        return (
            <div className="w-1/3 flex flex-col items-center">
                <div className="text-white font-bold text-xl">{player.name}</div>
                <div className="text-amber-300 font-bold text-2xl">{player.score}</div>
                <div className={`flex items-center justify-center text-white font-extrabold text-4xl rounded-t-lg w-full ${height} ${color}`}>
                    {icon || rank}
                </div>
            </div>
        );
    };

    return (
        <div className="text-center flex flex-col items-center w-full">
            <h2 className="text-5xl font-bold mt-4 mb-6 text-white" style={{ fontFamily: "'Comic Sans MS', 'cursive'" }}>Game Over!</h2>
            <div className="flex items-end justify-center gap-2 w-full max-w-md">
                <PodiumBlock player={thirdPlace} height="h-24" color="bg-orange-400" rank="3" />
                <PodiumBlock player={firstPlace} height="h-48" color="bg-amber-400" icon={<TrophyIcon />} />
                <PodiumBlock player={secondPlace} height="h-32" color="bg-slate-400" rank="2" />
            </div>
            {isAdmin && <button onClick={onPlayAgain} className="mt-8 bg-blue-500 text-white font-bold py-3 px-8 rounded-lg text-xl shadow-lg transform hover:scale-105 transition-all">Play Again</button>}
        </div>
    );
}