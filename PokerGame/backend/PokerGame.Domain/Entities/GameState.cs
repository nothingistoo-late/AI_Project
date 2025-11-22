namespace PokerGame.Domain.Entities;

public class GameState
{
    public string GameId { get; set; } = Guid.NewGuid().ToString();
    public List<Player> Players { get; set; } = new();
    public List<Card> CommunityCards { get; set; } = new();
    public int Pot { get; set; }
    public int CurrentBet { get; set; }
    public int SmallBlind { get; set; } = 10;
    public int BigBlind { get; set; } = 20;
    public int DealerPosition { get; set; }
    public int SmallBlindPosition { get; set; }
    public int BigBlindPosition { get; set; }
    public GamePhase Phase { get; set; } = GamePhase.Waiting;
    public int CurrentPlayerIndex { get; set; }
    public int LastRaiseAmount { get; set; }
    public int LastRaisePlayerIndex { get; set; } = -1;
    public List<Player> Winners { get; set; } = new();
    public bool IsShowdown { get; set; }
    public List<Card> Deck { get; set; } = new();
    public int DeckIndex { get; set; }
    public List<GameAction> ActionHistory { get; set; } = new();
}

public class GameAction
{
    public string PlayerName { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public int? Amount { get; set; }
    public string Phase { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.Now;
}

public enum GamePhase
{
    Waiting,
    PreFlop,
    Flop,
    Turn,
    River,
    Showdown,
    Finished
}

