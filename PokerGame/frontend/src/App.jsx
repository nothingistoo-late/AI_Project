import { useState, useEffect } from 'react';
import { gameApi } from './services/api';
import PokerTable from './components/PokerTable';
import GameControls from './components/GameControls';
import PlayerInfo from './components/PlayerInfo';
import GameLog from './components/GameLog';
import WinnerOverlay from './components/WinnerOverlay';
import ChipStack from './components/ChipStack';

function App() {
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBotCards, setShowBotCards] = useState(false);
  const [humanPlayerSeat, setHumanPlayerSeat] = useState(0); // Default to seat 0
  const [showWinnerOverlay, setShowWinnerOverlay] = useState(false);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Start game
      const response = await gameApi.startGame(10, 20);
      setGameState(response.data);
      
      // Add human player to seat 0
      try {
        const addPlayerResponse = await gameApi.addPlayer('You', 0);
        setGameState(addPlayerResponse.data);
        setHumanPlayerSeat(0);
      } catch (playerErr) {
        console.error('Error adding player:', playerErr);
        // If player already exists, just set the seat
        if (response.data.players && response.data.players.length > 0) {
          const existingPlayer = response.data.players.find(p => p.seatNumber === 0 && !p.isBot);
          if (existingPlayer) {
            setHumanPlayerSeat(0);
          }
        }
      }
    } catch (err) {
      console.error('Error initializing game:', err);
      setError(err.response?.data?.error || err.message || 'Failed to initialize game');
    } finally {
      setLoading(false);
    }
  };

  const refreshGameState = async () => {
    try {
      const response = await gameApi.getState();
      setGameState(response.data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddBot = async (botLevel, seatNumber) => {
    try {
      const response = await gameApi.addBot(botLevel, seatNumber);
      setGameState(response.data);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  useEffect(() => {
    if (gameState?.isShowdown && gameState?.winners && gameState.winners.length > 0) {
      setShowWinnerOverlay(true);
    }
  }, [gameState?.isShowdown, gameState?.winners]);

  const handleStartHand = async () => {
    try {
      const response = await gameApi.startNewHand();
      setGameState(response.data);
      
      // Auto-process bot turns if it's a bot's turn
      setTimeout(() => {
        processBotTurns();
      }, 1000);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  const handlePlayerAction = async (action, raiseAmount = null) => {
    if (!humanPlayerSeat) return;
    
    try {
      const response = await gameApi.playerAction(humanPlayerSeat, action, raiseAmount);
      setGameState(response.data);
      
      // Auto-process bot turns
      setTimeout(() => {
        processBotTurns();
      }, 1000);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  const processBotTurns = async () => {
    try {
      let response = await gameApi.processBotTurns();
      setGameState(response.data);
      
      // Keep processing until it's human's turn or game is finished
      const currentPlayer = response.data.players[response.data.currentPlayerIndex];
      if (currentPlayer && currentPlayer.isBot && 
          response.data.phase !== 'Showdown' && 
          response.data.phase !== 'Finished') {
        setTimeout(() => {
          processBotTurns();
        }, 1000);
      } else if (response.data.phase === 'River' || response.data.phase === 'Turn' || response.data.phase === 'Flop') {
        // Check if betting round is complete, then evaluate
        const allActed = response.data.players
          .filter(p => p.isActive && !p.isFolded)
          .every(p => p.currentBet === response.data.currentBet || p.isAllIn);
        
        if (allActed) {
          // Move to next phase or evaluate
          if (response.data.phase === 'River') {
            setTimeout(async () => {
              const evalResponse = await gameApi.evaluateWinners();
              setGameState(evalResponse.data);
            }, 1000);
          }
        }
      }
    } catch (err) {
      console.error('Error processing bot turns:', err);
    }
  };

  const handleReset = async () => {
    try {
      const response = await gameApi.resetGame();
      setGameState(response.data);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        <div className="text-2xl">Loading game...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        <div className="text-2xl">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-4">
          <h1 className="text-4xl font-bold text-white mb-2">Texas Hold'em Poker</h1>
          <div className="flex items-center justify-center gap-4">
            <label className="flex items-center gap-2 text-white">
              <input
                type="checkbox"
                checked={showBotCards}
                onChange={(e) => setShowBotCards(e.target.checked)}
                className="w-4 h-4"
              />
              Show Bot Cards
            </label>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Reset Game
            </button>
          </div>
        </div>

        <PokerTable
          gameState={gameState}
          showBotCards={showBotCards}
          humanPlayerSeat={humanPlayerSeat}
        />

        <GameControls
          gameState={gameState}
          humanPlayerSeat={humanPlayerSeat ?? 0}
          onAction={handlePlayerAction}
          onStartHand={handleStartHand}
          onAddBot={handleAddBot}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PlayerInfo gameState={gameState} humanPlayerSeat={humanPlayerSeat} />
          <GameLog actionHistory={gameState?.actionHistory || []} />
        </div>

        {showWinnerOverlay && (
          <WinnerOverlay
            winners={gameState?.winners || []}
            onClose={() => setShowWinnerOverlay(false)}
          />
        )}
      </div>
    </div>
  );
}

export default App;

