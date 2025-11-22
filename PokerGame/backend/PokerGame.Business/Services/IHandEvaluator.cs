using PokerGame.Domain.Entities;

namespace PokerGame.Business.Services;

public interface IHandEvaluator
{
    HandRank EvaluateHand(List<Card> holeCards, List<Card> communityCards);
    int CompareHands(HandRank hand1, HandRank hand2);
}


