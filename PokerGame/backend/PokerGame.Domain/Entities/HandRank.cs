namespace PokerGame.Domain.Entities;

public class HandRank
{
    public HandType Type { get; set; }
    public string Description { get; set; } = string.Empty;
    public int Strength { get; set; } // Higher is better
    public List<Card> Cards { get; set; } = new();
    public List<Card> Kickers { get; set; } = new();
}

public enum HandType
{
    HighCard = 1,
    Pair = 2,
    TwoPair = 3,
    ThreeOfAKind = 4,
    Straight = 5,
    Flush = 6,
    FullHouse = 7,
    FourOfAKind = 8,
    StraightFlush = 9,
    RoyalFlush = 10
}


