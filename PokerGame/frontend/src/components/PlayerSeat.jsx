import { motion } from 'framer-motion';
import Card from './Card';

const PlayerSeat = ({ 
  player, 
  seatNumber, 
  isCurrentPlayer, 
  showCards, 
  isWinner,
  position 
}) => {
  if (!player) {
    return (
      <div className={`absolute ${position} transform -translate-x-1/2 -translate-y-1/2`}>
        <div className="w-32 h-40 bg-gray-800 rounded-lg border-2 border-gray-600 flex items-center justify-center opacity-50">
          <div className="text-gray-500 text-sm">Empty</div>
        </div>
      </div>
    );
  }

  const isActive = player.isActive && !player.isFolded;
  const glowColor = isWinner ? 'gold' : isCurrentPlayer ? 'blue' : 'transparent';

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ 
        scale: isCurrentPlayer ? 1.1 : 1,
        opacity: 1,
        boxShadow: isCurrentPlayer || isWinner 
          ? `0 0 20px ${isWinner ? '#ffd700' : '#3b82f6'}` 
          : 'none'
      }}
      transition={{ duration: 0.3 }}
      className={`absolute ${position} transform -translate-x-1/2 -translate-y-1/2`}
    >
      <div className={`relative bg-gray-900 rounded-lg p-3 border-2 ${
        isCurrentPlayer ? 'border-blue-500' : isWinner ? 'border-yellow-500' : 'border-gray-700'
      } ${isActive ? '' : 'opacity-60'}`}>
        {/* Player Info */}
        <div className="text-center mb-2">
          <div className="text-white font-bold text-sm">{player.name}</div>
          <div className="text-yellow-400 text-xs">${player.chips}</div>
          {player.currentBet > 0 && (
            <div className="text-green-400 text-xs">Bet: ${player.currentBet}</div>
          )}
          {player.isFolded && (
            <div className="text-red-400 text-xs font-bold">FOLDED</div>
          )}
          {player.isAllIn && (
            <div className="text-orange-400 text-xs font-bold">ALL IN</div>
          )}
          {player.isDealer && (
            <div className="absolute -top-2 -left-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full">
              D
            </div>
          )}
          {player.isSmallBlind && (
            <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              SB
            </div>
          )}
          {player.isBigBlind && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              BB
            </div>
          )}
        </div>

        {/* Cards */}
        <div className="flex gap-1 justify-center">
          {player.holeCards && player.holeCards.length > 0 ? (
            player.holeCards.map((card, index) => (
              <Card
                key={index}
                card={showCards || !player.isBot ? card : null}
                isFaceUp={showCards || !player.isBot}
                delay={index * 0.1}
              />
            ))
          ) : (
            <>
              <div className="w-12 h-16 bg-gray-800 rounded border border-gray-700"></div>
              <div className="w-12 h-16 bg-gray-800 rounded border border-gray-700"></div>
            </>
          )}
        </div>

        {/* Hand Rank */}
        {player.bestHand && (
          <div className="text-center mt-2">
            <div className="text-green-400 text-xs font-bold">
              {player.bestHand.description}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PlayerSeat;


