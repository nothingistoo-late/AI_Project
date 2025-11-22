import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw, X, Check, DollarSign, TrendingUp } from 'lucide-react';

const GameControls = ({ gameState, humanPlayerSeat, onAction, onStartHand, onAddBot }) => {
  const [raiseAmount, setRaiseAmount] = useState(0);

  if (!gameState) return null;

  const humanPlayer = gameState.players?.find(p => p.seatNumber === humanPlayerSeat);
  const currentPlayer = gameState.players && gameState.currentPlayerIndex >= 0 && gameState.currentPlayerIndex < gameState.players.length 
    ? gameState.players[gameState.currentPlayerIndex] 
    : null;
  
  // Check if it's human's turn - compare by seat number
  const isHumanTurn = currentPlayer && humanPlayerSeat !== null && currentPlayer.seatNumber === humanPlayerSeat;
  
  const toCall = gameState.currentBet - (humanPlayer?.currentBet || 0);
  const canCheck = toCall === 0;
  const minRaise = gameState.currentBet + Math.max(gameState.lastRaiseAmount || 0, gameState.bigBlind || 20);
  
  // Debug log (can remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('GameControls Debug:', {
      phase: gameState.phase,
      currentPlayerIndex: gameState.currentPlayerIndex,
      currentPlayer: currentPlayer?.name,
      humanPlayerSeat,
      isHumanTurn,
      humanPlayer: humanPlayer?.name,
      isFolded: humanPlayer?.isFolded,
      players: gameState.players?.map(p => ({ name: p.name, seat: p.seatNumber }))
    });
  }

  const handleAction = (action) => {
    if (action === 'raise') {
      if (raiseAmount >= minRaise && raiseAmount <= (humanPlayer?.chips || 0)) {
        onAction(action, raiseAmount);
        setRaiseAmount(0);
      } else {
        alert(`Raise amount must be between ${minRaise} and ${humanPlayer?.chips || 0}`);
      }
    } else {
      onAction(action);
    }
  };

  const handleAddBotClick = (seatNumber, botLevel) => {
    onAddBot(botLevel, seatNumber);
  };

  // Listen for add bot events from table
  useEffect(() => {
    const handleAddBotEvent = (e) => {
      const botLevel = prompt('Enter bot level (Easy/Medium/Hard):', 'Medium');
      if (botLevel && ['easy', 'medium', 'hard'].includes(botLevel.toLowerCase())) {
        handleAddBotClick(e.detail.seatNumber, botLevel.toLowerCase());
      } else if (botLevel) {
        alert('Invalid bot level. Please enter: Easy, Medium, or Hard');
      }
    };
    window.addEventListener('addBot', handleAddBotEvent);
    return () => window.removeEventListener('addBot', handleAddBotEvent);
  }, [onAddBot]);

  return (
    <div className="bg-gray-900 rounded-lg p-6 mb-4">
      <div className="flex flex-col gap-4">
        {/* Game Status */}
        <div className="text-center text-white">
          <div className="text-xl font-bold mb-2">
            {(gameState.phase === 'Waiting' || gameState.phase === 0) && 'Ready to start a new hand'}
            {gameState.phase !== 'Waiting' && gameState.phase !== 0 && gameState.phase !== 'Finished' && gameState.phase !== 6 && 
              (isHumanTurn ? 'Your Turn!' : `Waiting for ${currentPlayer?.name || 'player'}...`)}
            {(gameState.phase === 'Finished' || gameState.phase === 6) && 'Hand Finished'}
          </div>
          {humanPlayer && (
            <div className="text-sm text-gray-400">
              Your Chips: ${humanPlayer.chips} | 
              {toCall > 0 ? ` To Call: $${toCall}` : ' You can check'}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {(gameState.phase === 'Waiting' || gameState.phase === 0) && (
          <div className="flex justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStartHand}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 shadow-lg flex items-center gap-2"
            >
              <Play className="w-5 h-5" />
              Start New Hand
            </motion.button>
          </div>
        )}

        {/* Always show buttons if it's human's turn, regardless of phase check */}
        {isHumanTurn && humanPlayer && !humanPlayer.isFolded && humanPlayerSeat !== null && (
          <div className="flex flex-wrap justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAction('fold')}
              className="px-6 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 shadow-lg flex items-center gap-2"
            >
              <X className="w-5 h-5" />
              Fold
            </motion.button>

            {canCheck ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAction('check')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-lg flex items-center gap-2"
              >
                <Check className="w-5 h-5" />
                Check
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAction('call')}
                className="px-6 py-3 bg-yellow-600 text-white rounded-lg font-bold hover:bg-yellow-700 shadow-lg flex items-center gap-2"
              >
                <DollarSign className="w-5 h-5" />
                Call ${toCall}
              </motion.button>
            )}

            {humanPlayer && (
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  min={minRaise}
                  max={humanPlayer.chips}
                  value={raiseAmount || ''}
                  onChange={(e) => setRaiseAmount(parseInt(e.target.value) || 0)}
                  className="w-32 px-3 py-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-purple-500 focus:outline-none"
                  placeholder={`Min: ${minRaise}`}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAction('raise')}
                  disabled={!raiseAmount || raiseAmount < minRaise || raiseAmount > humanPlayer.chips}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <TrendingUp className="w-5 h-5" />
                  Raise
                </motion.button>
              </div>
            )}
          </div>
        )}

        {/* Winners Display */}
        {(gameState.isShowdown || gameState.phase === 'Showdown' || gameState.phase === 5) && gameState.winners && gameState.winners.length > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center"
          >
            <div className="text-2xl font-bold text-yellow-400 mb-2">
              Winner{gameState.winners.length > 1 ? 's' : ''}: {gameState.winners.map(w => w.name).join(', ')}
            </div>
            {gameState.winners.map(winner => (
              <div key={winner.seatNumber} className="text-green-400">
                {winner.name} - {winner.bestHand?.description || 'Unknown'}
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default GameControls;

