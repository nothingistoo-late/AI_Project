const PlayerInfo = ({ gameState, humanPlayerSeat }) => {
  if (!gameState || !gameState.players) return null;

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

  const humanPlayer = gameState.players.find(p => p.seatNumber === humanPlayerSeat);

  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <h3 className="text-white text-xl font-bold mb-4">Game Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Your Hand Info */}
        {humanPlayer && humanPlayer.holeCards && humanPlayer.holeCards.length > 0 && (
          <div className="bg-gray-800 rounded p-4">
            <h4 className="text-white font-bold mb-2">Your Hand</h4>
            <div className="text-gray-300 text-sm">
              {humanPlayer.holeCards.map((card, index) => {
                const rankMap = {
                  0: '2', 1: '3', 2: '4', 3: '5', 4: '6', 5: '7', 6: '8', 7: '9', 8: '10',
                  9: 'Jack', 10: 'Queen', 11: 'King', 12: 'Ace'
                };
                const suitMap = {
                  0: 'Clubs', 1: 'Diamonds', 2: 'Hearts', 3: 'Spades'
                };
                const rank = typeof card.rank === 'number' ? rankMap[card.rank] : card.rank;
                const suit = typeof card.suit === 'number' ? suitMap[card.suit] : card.suit;
                return (
                  <span key={index} className="mr-2">
                    {rank} of {suit}
                  </span>
                );
              })}
            </div>
            {humanPlayer.bestHand && (
              <div className="text-green-400 mt-2 font-bold">
                Best Hand: {humanPlayer.bestHand.description}
              </div>
            )}
          </div>
        )}

        {/* Game Phase Info */}
        <div className="bg-gray-800 rounded p-4">
          <h4 className="text-white font-bold mb-2">Game Phase</h4>
          <div className="text-gray-300">
            <div>Phase: {getPhaseName(gameState.phase)}</div>
            <div>Pot: ${gameState.pot}</div>
            <div>Current Bet: ${gameState.currentBet}</div>
            <div>Small Blind: ${gameState.smallBlind}</div>
            <div>Big Blind: ${gameState.bigBlind}</div>
          </div>
        </div>
      </div>

      {/* All Players */}
      <div className="mt-4">
        <h4 className="text-white font-bold mb-2">Players</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {gameState.players.map((player) => (
            <div key={player.seatNumber} className="bg-gray-800 rounded p-2">
              <div className="text-white font-bold text-sm">{player.name}</div>
              <div className="text-yellow-400 text-xs">${player.chips}</div>
              {player.isFolded && (
                <div className="text-red-400 text-xs">Folded</div>
              )}
              {player.isAllIn && (
                <div className="text-orange-400 text-xs">All In</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlayerInfo;

