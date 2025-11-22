using PokerGame.Domain.Entities;

namespace PokerGame.Business.Services;

public class PokerMathService : IPokerMathService
{
    private readonly IHandEvaluator _handEvaluator;

    public PokerMathService(IHandEvaluator handEvaluator)
    {
        _handEvaluator = handEvaluator;
    }

    public double CalculateHandStrength(List<Card> holeCards, List<Card> communityCards)
    {
        if (communityCards.Count == 0)
        {
            // Pre-flop hand strength (0-100%)
            return CalculatePreFlopStrength(holeCards);
        }

        var hand = _handEvaluator.EvaluateHand(holeCards, communityCards);
        var baseStrength = ((int)hand.Type / 10.0) * 100; // 0-100 scale
        var rankStrength = (hand.Strength / 1000.0) * 10; // Additional 0-10 points
        
        return Math.Min(baseStrength + rankStrength, 100.0);
    }

    public int CalculateOuts(List<Card> holeCards, List<Card> communityCards)
    {
        if (communityCards.Count == 0) return 0;

        var currentHand = _handEvaluator.EvaluateHand(holeCards, communityCards);
        var allCards = new HashSet<string>();
        holeCards.ForEach(c => allCards.Add($"{c.Rank}_{c.Suit}"));
        communityCards.ForEach(c => allCards.Add($"{c.Rank}_{c.Suit}"));

        var outs = 0;
        var deck = GenerateDeck();
        var availableCards = deck.Where(c => !allCards.Contains($"{c.Rank}_{c.Suit}")).ToList();

        foreach (var card in availableCards)
        {
            var testCommunity = new List<Card>(communityCards);
            if (testCommunity.Count < 5)
            {
                testCommunity.Add(card);
            }
            else
            {
                testCommunity[testCommunity.Count - 1] = card;
            }
            
            var newHand = _handEvaluator.EvaluateHand(holeCards, testCommunity);
            
            if (CompareHands(newHand, currentHand) > 0)
            {
                outs++;
            }
        }

        return outs;
    }

    public double CalculateWinProbability(List<Card> holeCards, List<Card> communityCards, int numberOfOpponents, int simulations = 5000)
    {
        if (numberOfOpponents == 0) return 1.0;

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
        return CalculateWinProbability(holeCards, communityCards, numberOfOpponents, 3000);
    }

    public double CalculateImpliedOdds(int pot, int betAmount, int outs, int cardsRemaining)
    {
        if (cardsRemaining == 0 || outs == 0) return 0;
        
        var immediateOdds = (double)outs / cardsRemaining;
        var potOdds = CalculatePotOdds(pot, betAmount);
        
        // Implied odds consider future betting rounds
        return immediateOdds + (potOdds * 0.3); // Simplified calculation
    }

    private double CalculatePreFlopStrength(List<Card> holeCards)
    {
        var highCard = Math.Max(holeCards[0].GetValue(), holeCards[1].GetValue());
        var lowCard = Math.Min(holeCards[0].GetValue(), holeCards[1].GetValue());
        var isPair = holeCards[0].Rank == holeCards[1].Rank;
        var isSuited = holeCards[0].Suit == holeCards[1].Suit;
        var gap = Math.Abs(highCard - lowCard);

        if (isPair)
        {
            // Pair strength: 30-85%
            return 30 + (highCard / 14.0) * 55;
        }

        // High card strength
        var strength = (highCard / 14.0) * 40 + (lowCard / 14.0) * 20;
        
        if (isSuited) strength += 8;
        if (gap <= 4) strength += 5; // Connected
        if (gap == 0) strength += 10; // Same rank (pair already handled)
        
        return Math.Min(strength, 85);
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


