using PokerGame.Domain.Entities;

namespace PokerGame.Business.Services;

public class OddsCalculator : IOddsCalculator
{
    private readonly IHandEvaluator _handEvaluator;

    public OddsCalculator(IHandEvaluator handEvaluator)
    {
        _handEvaluator = handEvaluator;
    }

    public int CalculateOuts(List<Card> holeCards, List<Card> communityCards)
    {
        if (communityCards.Count == 0) return 0; // Pre-flop, can't calculate outs accurately

        var currentHand = _handEvaluator.EvaluateHand(holeCards, communityCards);
        var allCards = new HashSet<string>();
        holeCards.ForEach(c => allCards.Add($"{c.Rank}_{c.Suit}"));
        communityCards.ForEach(c => allCards.Add($"{c.Rank}_{c.Suit}"));

        var outs = 0;
        var deck = GenerateDeck();
        var availableCards = deck.Where(c => !allCards.Contains($"{c.Rank}_{c.Suit}")).ToList();

        foreach (var card in availableCards)
        {
            var testCommunity = new List<Card>(communityCards) { card };
            var newHand = _handEvaluator.EvaluateHand(holeCards, testCommunity);
            
            if (CompareHands(newHand, currentHand) > 0)
            {
                outs++;
            }
        }

        return outs;
    }

    public double CalculateWinRate(List<Card> holeCards, List<Card> communityCards, int numberOfOpponents)
    {
        if (numberOfOpponents == 0) return 1.0;

        // Monte Carlo simulation (simplified)
        var simulations = 1000;
        var wins = 0;
        var allCards = new HashSet<string>();
        holeCards.ForEach(c => allCards.Add($"{c.Rank}_{c.Suit}"));
        communityCards.ForEach(c => allCards.Add($"{c.Rank}_{c.Suit}"));

        var random = new Random();

        for (int i = 0; i < simulations; i++)
        {
            var deck = GenerateDeck();
            var availableCards = deck.Where(c => !allCards.Contains($"{c.Rank}_{c.Suit}")).ToList();
            
            // Shuffle
            availableCards = availableCards.OrderBy(x => random.Next()).ToList();

            var opponentHands = new List<List<Card>>();
            var cardIndex = 0;

            // Deal to opponents
            for (int j = 0; j < numberOfOpponents; j++)
            {
                opponentHands.Add(new List<Card>
                {
                    availableCards[cardIndex++],
                    availableCards[cardIndex++]
                });
            }

            // Complete community cards if needed
            var testCommunity = new List<Card>(communityCards);
            while (testCommunity.Count < 5)
            {
                testCommunity.Add(availableCards[cardIndex++]);
            }

            var myHand = _handEvaluator.EvaluateHand(holeCards, testCommunity);
            var bestOpponentHand = opponentHands
                .Select(h => _handEvaluator.EvaluateHand(h, testCommunity))
                .OrderByDescending(h => h.Type)
                .ThenByDescending(h => h.Strength)
                .First();

            if (CompareHands(myHand, bestOpponentHand) >= 0)
            {
                wins++;
            }
        }

        return (double)wins / simulations;
    }

    public double CalculatePotOdds(int pot, int betAmount)
    {
        if (betAmount == 0) return 0;
        return (double)betAmount / (pot + betAmount);
    }

    public double CalculateEquity(List<Card> holeCards, List<Card> communityCards, int numberOfOpponents)
    {
        return CalculateWinRate(holeCards, communityCards, numberOfOpponents);
    }

    private List<Card> GenerateDeck()
    {
        var deck = new List<Card>();
        foreach (Suit suit in Enum.GetValues<Suit>())
        {
            foreach (Rank rank in Enum.GetValues<Rank>())
            {
                deck.Add(new Card(suit, rank));
            }
        }
        return deck;
    }

    private int CompareHands(HandRank hand1, HandRank hand2)
    {
        if (hand1.Type != hand2.Type)
            return hand1.Type.CompareTo(hand2.Type);

        if (hand1.Strength != hand2.Strength)
            return hand1.Strength.CompareTo(hand2.Strength);

        return 0;
    }
}


