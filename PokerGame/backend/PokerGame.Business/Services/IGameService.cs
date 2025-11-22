using PokerGame.Domain.Entities;

namespace PokerGame.Business.Services;

public interface IGameService
{
    GameState CreateGame(int smallBlind = 10, int bigBlind = 20);
    GameState AddPlayer(string name, int seatNumber);
    GameState AddBot(string botLevel, int seatNumber);
    GameState RemovePlayer(int seatNumber);
    GameState StartNewHand();
    GameState PlayerAction(int seatNumber, string action, int? raiseAmount = null);
    GameState ProcessBotTurns();
    GameState EvaluateWinners();
    GameState GetGameState();
    GameState ResetGame();
}


