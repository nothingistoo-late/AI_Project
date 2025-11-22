namespace PokerGame.Domain.Entities;

public class Player
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool IsBot { get; set; }
    public string BotLevel { get; set; } = "easy"; // easy, medium, hard
    public int SeatNumber { get; set; }
    public int Chips { get; set; }
    public int CurrentBet { get; set; }
    public bool IsFolded { get; set; }
    public bool IsAllIn { get; set; }
    public List<Card> HoleCards { get; set; } = new();
    public bool IsDealer { get; set; }
    public bool IsSmallBlind { get; set; }
    public bool IsBigBlind { get; set; }
    public bool IsActive { get; set; } // Currently in the hand
    public HandRank? BestHand { get; set; } // Evaluated hand at showdown
}

