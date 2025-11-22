using PokerGame.Domain.Entities;

namespace PokerGame.Business.Services;

public interface IOddsCalculator
{
    int CalculateOuts(List<Card> holeCards, List<Card> communityCards);
    double CalculateWinRate(List<Card> holeCards, List<Card> communityCards, int numberOfOpponents);
    double CalculatePotOdds(int pot, int betAmount);
    double CalculateEquity(List<Card> holeCards, List<Card> communityCards, int numberOfOpponents);
}


