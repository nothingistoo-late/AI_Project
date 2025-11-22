using PokerGame.Domain.Entities;

namespace PokerGame.Business.Services;

public class HandEvaluator : IHandEvaluator
{
    public HandRank EvaluateHand(List<Card> holeCards, List<Card> communityCards)
    {
        var allCards = new List<Card>(holeCards);
        allCards.AddRange(communityCards);

        if (allCards.Count < 5)
        {
            return new HandRank
            {
                Type = HandType.HighCard,
                Description = "Insufficient cards",
                Strength = 0,
                Cards = allCards.OrderByDescending(c => c.GetValue()).Take(5).ToList()
            };
        }

        // Check for Royal Flush
        var royalFlush = CheckRoyalFlush(allCards);
        if (royalFlush != null) return royalFlush;

        // Check for Straight Flush
        var straightFlush = CheckStraightFlush(allCards);
        if (straightFlush != null) return straightFlush;

        // Check for Four of a Kind
        var fourOfAKind = CheckFourOfAKind(allCards);
        if (fourOfAKind != null) return fourOfAKind;

        // Check for Full House
        var fullHouse = CheckFullHouse(allCards);
        if (fullHouse != null) return fullHouse;

        // Check for Flush
        var flush = CheckFlush(allCards);
        if (flush != null) return flush;

        // Check for Straight
        var straight = CheckStraight(allCards);
        if (straight != null) return straight;

        // Check for Three of a Kind
        var threeOfAKind = CheckThreeOfAKind(allCards);
        if (threeOfAKind != null) return threeOfAKind;

        // Check for Two Pair
        var twoPair = CheckTwoPair(allCards);
        if (twoPair != null) return twoPair;

        // Check for Pair
        var pair = CheckPair(allCards);
        if (pair != null) return pair;

        // High Card
        return CheckHighCard(allCards);
    }

    public int CompareHands(HandRank hand1, HandRank hand2)
    {
        if (hand1.Type != hand2.Type)
            return hand1.Type.CompareTo(hand2.Type);

        // Same hand type, compare by strength
        if (hand1.Strength != hand2.Strength)
            return hand1.Strength.CompareTo(hand2.Strength);

        // Compare kickers
        for (int i = 0; i < Math.Min(hand1.Kickers.Count, hand2.Kickers.Count); i++)
        {
            var comparison = hand1.Kickers[i].GetValue().CompareTo(hand2.Kickers[i].GetValue());
            if (comparison != 0) return comparison;
        }

        return 0;
    }

    private HandRank? CheckRoyalFlush(List<Card> cards)
    {
        var straightFlush = CheckStraightFlush(cards);
        if (straightFlush != null && straightFlush.Cards.Any(c => c.Rank == Rank.Ace))
        {
            return new HandRank
            {
                Type = HandType.RoyalFlush,
                Description = "Royal Flush",
                Strength = 10,
                Cards = straightFlush.Cards
            };
        }
        return null;
    }

    private HandRank? CheckStraightFlush(List<Card> cards)
    {
        var suits = Enum.GetValues<Suit>();
        foreach (var suit in suits)
        {
            var suitedCards = cards.Where(c => c.Suit == suit).OrderBy(c => c.GetValue()).ToList();
            if (suitedCards.Count >= 5)
            {
                var straight = FindStraight(suitedCards);
                if (straight != null && straight.Count >= 5)
                {
                    return new HandRank
                    {
                        Type = HandType.StraightFlush,
                        Description = "Straight Flush",
                        Strength = straight.Max(c => c.GetValue()),
                        Cards = straight.Take(5).ToList()
                    };
                }
            }
        }
        return null;
    }

    private HandRank? CheckFourOfAKind(List<Card> cards)
    {
        var groups = cards.GroupBy(c => c.Rank).Where(g => g.Count() >= 4).ToList();
        if (groups.Any())
        {
            var fourKind = groups.OrderByDescending(g => g.Key).First();
            var kicker = cards.Where(c => c.Rank != fourKind.Key).OrderByDescending(c => c.GetValue()).First();
            return new HandRank
            {
                Type = HandType.FourOfAKind,
                Description = $"Four {fourKind.Key}s",
                Strength = fourKind.First().GetValue(),
                Cards = fourKind.Take(4).ToList(),
                Kickers = new List<Card> { kicker }
            };
        }
        return null;
    }

    private HandRank? CheckFullHouse(List<Card> cards)
    {
        var groups = cards.GroupBy(c => c.Rank).OrderByDescending(g => g.Count()).ThenByDescending(g => g.Key).ToList();
        var threeKind = groups.FirstOrDefault(g => g.Count() >= 3);
        if (threeKind != null)
        {
            var pair = groups.FirstOrDefault(g => g.Count() >= 2 && g.Key != threeKind.Key);
            if (pair != null)
            {
                return new HandRank
                {
                    Type = HandType.FullHouse,
                    Description = $"{threeKind.Key}s full of {pair.Key}s",
                    Strength = threeKind.First().GetValue() * 100 + pair.First().GetValue(),
                    Cards = threeKind.Take(3).Concat(pair.Take(2)).ToList()
                };
            }
        }
        return null;
    }

    private HandRank? CheckFlush(List<Card> cards)
    {
        var suits = Enum.GetValues<Suit>();
        foreach (var suit in suits)
        {
            var suitedCards = cards.Where(c => c.Suit == suit).OrderByDescending(c => c.GetValue()).ToList();
            if (suitedCards.Count >= 5)
            {
                return new HandRank
                {
                    Type = HandType.Flush,
                    Description = $"{suit} Flush",
                    Strength = suitedCards.Take(5).Sum(c => c.GetValue()),
                    Cards = suitedCards.Take(5).ToList()
                };
            }
        }
        return null;
    }

    private HandRank? CheckStraight(List<Card> cards)
    {
        var distinctCards = cards.GroupBy(c => c.Rank).Select(g => g.First()).OrderBy(c => c.GetValue()).ToList();
        var straight = FindStraight(distinctCards);
        if (straight != null && straight.Count >= 5)
        {
            return new HandRank
            {
                Type = HandType.Straight,
                Description = "Straight",
                Strength = straight.Max(c => c.GetValue()),
                Cards = straight.Take(5).ToList()
            };
        }
        return null;
    }

    private List<Card>? FindStraight(List<Card> sortedCards)
    {
        if (sortedCards.Count < 5) return null;

        // Check for regular straight
        for (int i = sortedCards.Count - 5; i >= 0; i--)
        {
            var sequence = new List<Card> { sortedCards[i] };
            for (int j = i + 1; j < sortedCards.Count; j++)
            {
                if (sortedCards[j].GetValue() == sequence.Last().GetValue() + 1)
                {
                    sequence.Add(sortedCards[j]);
                    if (sequence.Count == 5) return sequence;
                }
                else if (sortedCards[j].GetValue() != sequence.Last().GetValue())
                {
                    break;
                }
            }
        }

        // Check for A-2-3-4-5 straight (wheel)
        var ace = sortedCards.FirstOrDefault(c => c.Rank == Rank.Ace);
        if (ace != null)
        {
            var lowCards = sortedCards.Where(c => c.Rank <= Rank.Five).ToList();
            if (lowCards.Count >= 4 && lowCards.Any(c => c.Rank == Rank.Two))
            {
                var wheel = new List<Card> { ace };
                wheel.AddRange(lowCards.OrderBy(c => c.GetValue()).Take(4));
                if (wheel.Count == 5) return wheel;
            }
        }

        return null;
    }

    private HandRank? CheckThreeOfAKind(List<Card> cards)
    {
        var groups = cards.GroupBy(c => c.Rank).Where(g => g.Count() >= 3).ToList();
        if (groups.Any())
        {
            var threeKind = groups.OrderByDescending(g => g.Key).First();
            var kickers = cards.Where(c => c.Rank != threeKind.Key).OrderByDescending(c => c.GetValue()).Take(2).ToList();
            return new HandRank
            {
                Type = HandType.ThreeOfAKind,
                Description = $"Three {threeKind.Key}s",
                Strength = threeKind.First().GetValue(),
                Cards = threeKind.Take(3).ToList(),
                Kickers = kickers
            };
        }
        return null;
    }

    private HandRank? CheckTwoPair(List<Card> cards)
    {
        var pairs = cards.GroupBy(c => c.Rank).Where(g => g.Count() >= 2).OrderByDescending(g => g.Key).ToList();
        if (pairs.Count >= 2)
        {
            var kicker = cards.Where(c => c.Rank != pairs[0].Key && c.Rank != pairs[1].Key)
                .OrderByDescending(c => c.GetValue()).First();
            return new HandRank
            {
                Type = HandType.TwoPair,
                Description = $"{pairs[0].Key}s and {pairs[1].Key}s",
                Strength = pairs[0].First().GetValue() * 100 + pairs[1].First().GetValue(),
                Cards = pairs[0].Take(2).Concat(pairs[1].Take(2)).ToList(),
                Kickers = new List<Card> { kicker }
            };
        }
        return null;
    }

    private HandRank? CheckPair(List<Card> cards)
    {
        var pairs = cards.GroupBy(c => c.Rank).Where(g => g.Count() >= 2).ToList();
        if (pairs.Any())
        {
            var pair = pairs.OrderByDescending(g => g.Key).First();
            var kickers = cards.Where(c => c.Rank != pair.Key).OrderByDescending(c => c.GetValue()).Take(3).ToList();
            return new HandRank
            {
                Type = HandType.Pair,
                Description = $"Pair of {pair.Key}s",
                Strength = pair.First().GetValue(),
                Cards = pair.Take(2).ToList(),
                Kickers = kickers
            };
        }
        return null;
    }

    private HandRank CheckHighCard(List<Card> cards)
    {
        var topCards = cards.OrderByDescending(c => c.GetValue()).Take(5).ToList();
        return new HandRank
        {
            Type = HandType.HighCard,
            Description = $"{topCards[0].Rank} high",
            Strength = topCards[0].GetValue(),
            Cards = topCards
        };
    }
}


