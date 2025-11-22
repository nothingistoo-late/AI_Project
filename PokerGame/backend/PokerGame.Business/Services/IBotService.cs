using PokerGame.Domain.Entities;

namespace PokerGame.Business.Services;

public interface IBotService
{
    PlayerAction DecideAction(Player bot, GameState gameState, List<Card> holeCards, List<Card> communityCards);
}

public class PlayerAction
{
    public ActionType Type { get; set; }
    public int? RaiseAmount { get; set; }
    public string? Reasoning { get; set; } // For debugging/logging
}

public enum ActionType
{
    Fold,
    Check,
    Call,
    Raise
}

