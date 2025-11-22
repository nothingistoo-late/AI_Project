using PokerGame.Domain.Entities;

namespace PokerGame.Business.Services;

public interface IPokerMathService
{
    double CalculateHandStrength(List<Card> holeCards, List<Card> communityCards);
    int CalculateOuts(List<Card> holeCards, List<Card> communityCards);
    double CalculateWinProbability(List<Card> holeCards, List<Card> communityCards, int numberOfOpponents, int simulations = 5000);
    double CalculatePotOdds(int pot, int betAmount);
    double CalculateEquity(List<Card> holeCards, List<Card> communityCards, int numberOfOpponents);
    double CalculateImpliedOdds(int pot, int betAmount, int outs, int cardsRemaining);
}


