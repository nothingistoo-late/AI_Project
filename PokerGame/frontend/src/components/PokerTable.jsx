import { motion } from 'framer-motion';
import PlayerSeat from './PlayerSeat';
import Card from './Card';
import DealerButton from './DealerButton';

const PokerTable = ({ gameState, showBotCards, humanPlayerSeat }) => {
  if (!gameState) return null;

  const getPhaseName = (phase) => {
    if (typeof phase === 'string') return phase;
    const phaseMap = {
      0: 'Waiting',
      1: 'PreFlop',
      2: 'Flop',
      3: 'Turn',
      4: 'River',
      5: 'Showdown',
      6: 'Finished'
    };
    return phaseMap[phase] || phase;
  };

  const seats = [
    { number: 0, position: 'bottom-4 left-1/2' },      // Bottom center
    { number: 1, position: 'left-4 top-1/2' },         // Left
    { number: 2, position: 'top-4 left-1/2' },         // Top center
    { number: 3, position: 'right-4 top-1/2' },        // Right
  ];

  const getPlayerAtSeat = (seatNumber) => {
    return gameState.players.find(p => p.seatNumber === seatNumber);
  };

  const getCurrentPlayer = () => {
    if (gameState.currentPlayerIndex >= 0 && gameState.currentPlayerIndex < gameState.players.length) {
      return gameState.players[gameState.currentPlayerIndex];
    }
    return null;
  };

  const currentPlayer = getCurrentPlayer();
  const winners = gameState.winners || [];

  return (
    <div className="relative w-full max-w-6xl mx-auto mb-8">
      {/* Poker Table */}
      <div className="relative w-full aspect-[16/10] bg-gradient-to-br from-green-900 to-green-800 rounded-full border-8 border-amber-900 shadow-2xl">
        {/* Table felt pattern */}
        <div className="absolute inset-0 rounded-full bg-green-700 opacity-30" 
             style={{ backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.1) 1px, transparent 1px)', 
                      backgroundSize: '20px 20px' }}></div>

        {/* Dealer Button */}
        {gameState.dealerPosition !== undefined && (
          <DealerButton dealerPosition={gameState.dealerPosition} seats={seats} />
        )}

        {/* Community Cards */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="flex flex-col items-center gap-4">
            <div className="text-white text-center mb-2">
              <div className="text-2xl font-bold">Pot: ${gameState.pot}</div>
              {gameState.currentBet > 0 && (
                <div className="text-lg">Current Bet: ${gameState.currentBet}</div>
              )}
              <div className="text-sm text-gray-300 mt-1">
                Phase: {getPhaseName(gameState.phase)}
              </div>
            </div>
            
            <div className="flex gap-2">
              {gameState.communityCards && gameState.communityCards.length > 0 ? (
                gameState.communityCards.map((card, index) => (
                  <Card
                    key={index}
                    card={card}
                    isFaceUp={true}
                    isDealing={false}
                    delay={index * 0.1}
                  />
                ))
              ) : (
                Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="w-16 h-24 bg-gray-800 rounded-lg border-2 border-gray-700"></div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Player Seats */}
        {seats.map((seat) => {
          const player = getPlayerAtSeat(seat.number);
          const isCurrentPlayer = currentPlayer && currentPlayer.seatNumber === seat.number;
          const isWinner = winners.some(w => w.seatNumber === seat.number);
          
          return (
            <PlayerSeat
              key={seat.number}
              player={player}
              seatNumber={seat.number}
              isCurrentPlayer={isCurrentPlayer}
              showCards={showBotCards || (player && !player.isBot)}
              isWinner={isWinner}
              position={seat.position}
            />
          );
        })}

        {/* Add Bot Button on Empty Seats */}
        {seats.map((seat) => {
          const player = getPlayerAtSeat(seat.number);
          if (!player) {
            return (
              <motion.button
                key={`add-${seat.number}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`absolute ${seat.position} transform -translate-x-1/2 -translate-y-1/2 
                  bg-blue-600 hover:bg-blue-700 text-white rounded-full w-12 h-12 flex items-center justify-center
                  text-2xl font-bold shadow-lg z-10`}
                onClick={() => {
                  // This will be handled by parent component
                  const event = new CustomEvent('addBot', { detail: { seatNumber: seat.number } });
                  window.dispatchEvent(event);
                }}
              >
                +
              </motion.button>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

export default PokerTable;

