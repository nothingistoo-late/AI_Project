using PokerGame.Domain.Entities;

namespace PokerGame.Business.Services;

public class BotService : IBotService
{
    private readonly IHandEvaluator _handEvaluator;
    private readonly IOddsCalculator _oddsCalculator;
    private readonly IPokerMathService _pokerMath;
    private readonly Random _random;

    public BotService(IHandEvaluator handEvaluator, IOddsCalculator oddsCalculator, IPokerMathService pokerMath)
    {
        _handEvaluator = handEvaluator;
        _oddsCalculator = oddsCalculator;
        _pokerMath = pokerMath;
        _random = new Random();
    }

    public PlayerAction DecideAction(Player bot, GameState gameState, List<Card> holeCards, List<Card> communityCards)
    {
        return bot.BotLevel.ToLower() switch
        {
            "easy" => DecideEasy(bot, gameState, holeCards, communityCards),
            "medium" => DecideMedium(bot, gameState, holeCards, communityCards),
            "hard" => DecideHard(bot, gameState, holeCards, communityCards),
            "random" => DecideEasy(bot, gameState, holeCards, communityCards), // Fallback
            _ => DecideEasy(bot, gameState, holeCards, communityCards)
        };
    }

    private PlayerAction DecideEasy(Player bot, GameState gameState, List<Card> holeCards, List<Card> communityCards)
    {
        var handStrength = _pokerMath.CalculateHandStrength(holeCards, communityCards) / 100.0;
        var toCall = gameState.CurrentBet - bot.CurrentBet;
        var minRaise = gameState.CurrentBet + (gameState.LastRaiseAmount > 0 ? gameState.LastRaiseAmount : gameState.BigBlind);

        // Easy bot: Simple rules with some randomness
        var randomFactor = _random.NextDouble();

        // Fold bad hands
        if (handStrength < 0.25 && toCall > bot.Chips * 0.15)
        {
            return new PlayerAction { Type = ActionType.Fold };
        }

        // Raise strong hands
        if (handStrength > 0.65 && randomFactor > 0.2)
        {
            var raiseAmount = Math.Min(bot.Chips, (int)(minRaise * (1.5 + randomFactor)));
            return new PlayerAction { Type = ActionType.Raise, RaiseAmount = raiseAmount };
        }

        // Check if possible
        if (toCall == 0)
        {
            if (handStrength > 0.4 && randomFactor > 0.5)
            {
                var betAmount = Math.Min(bot.Chips, (int)(gameState.Pot * 0.3));
                return new PlayerAction { Type = ActionType.Raise, RaiseAmount = betAmount };
            }
            return new PlayerAction { Type = ActionType.Check };
        }

        // Call with decent hands
        if (handStrength > 0.35 || toCall < bot.Chips * 0.1)
        {
            return new PlayerAction { Type = ActionType.Call };
        }

        return new PlayerAction { Type = ActionType.Fold };
    }

    private PlayerAction DecideMedium(Player bot, GameState gameState, List<Card> holeCards, List<Card> communityCards)
    {
        var handStrength = _pokerMath.CalculateHandStrength(holeCards, communityCards) / 100.0;
        var toCall = gameState.CurrentBet - bot.CurrentBet;
        var potOdds = _pokerMath.CalculatePotOdds(gameState.Pot, toCall);
        var equity = _pokerMath.CalculateEquity(holeCards, communityCards, 
            gameState.Players.Count(p => p.IsActive && !p.IsFolded && !p.IsBot) - 1);
        var minRaise = gameState.CurrentBet + (gameState.LastRaiseAmount > 0 ? gameState.LastRaiseAmount : gameState.BigBlind);

        // Medium bot: Uses hand strength + pot odds + equity
        if (toCall == 0)
        {
            // Can check - bet for value with strong hands
            if (equity > 0.55 && handStrength > 0.5)
            {
                var betAmount = Math.Min(bot.Chips, (int)(gameState.Pot * (0.4 + equity * 0.2)));
                return new PlayerAction { Type = ActionType.Raise, RaiseAmount = betAmount };
            }
            return new PlayerAction { Type = ActionType.Check };
        }

        // Fold if equity < pot odds and bet is significant
        if (equity < potOdds && toCall > bot.Chips * 0.2)
        {
            return new PlayerAction { Type = ActionType.Fold };
        }

        // Raise with strong hands
        if (equity > 0.6 || handStrength > 0.7)
        {
            var raiseAmount = Math.Min(bot.Chips, (int)(minRaise * (1.5 + equity * 0.5)));
            return new PlayerAction { Type = ActionType.Raise, RaiseAmount = raiseAmount };
        }

        // Call with positive expected value
        if (equity >= potOdds || handStrength > 0.45)
        {
            return new PlayerAction { Type = ActionType.Call };
        }

        return new PlayerAction { Type = ActionType.Fold };
    }

    private PlayerAction DecideHard(Player bot, GameState gameState, List<Card> holeCards, List<Card> communityCards)
    {
        var handStrength = _pokerMath.CalculateHandStrength(holeCards, communityCards) / 100.0;
        var toCall = gameState.CurrentBet - bot.CurrentBet;
        var potOdds = _pokerMath.CalculatePotOdds(gameState.Pot, toCall);
        var equity = _pokerMath.CalculateEquity(holeCards, communityCards, 
            gameState.Players.Count(p => p.IsActive && !p.IsFolded && !p.IsBot) - 1);
        var outs = _pokerMath.CalculateOuts(holeCards, communityCards);
        var minRaise = gameState.CurrentBet + (gameState.LastRaiseAmount > 0 ? gameState.LastRaiseAmount : gameState.BigBlind);
        
        // Position awareness
        var position = CalculatePosition(bot, gameState);
        var isLatePosition = position > 0.6;
        var isEarlyPosition = position < 0.4;

        // Board texture analysis
        var boardTexture = AnalyzeBoardTexture(communityCards);
        var bluffFrequency = CalculateBluffFrequency(boardTexture, position, equity);

        // Hard bot: Advanced logic with positional awareness and bluffing
        if (toCall == 0)
        {
            // Can check - sophisticated betting strategy
            if (equity > 0.58 && handStrength > 0.5)
            {
                var betSize = CalculateOptimalBetSize(equity, handStrength, gameState.Pot, isLatePosition);
                var betAmount = Math.Min(bot.Chips, (int)betSize);
                return new PlayerAction { Type = ActionType.Raise, RaiseAmount = betAmount };
            }
            
            // Bluff opportunity
            if (bluffFrequency > 0.3 && isLatePosition && _random.NextDouble() < bluffFrequency)
            {
                var bluffAmount = Math.Min(bot.Chips, (int)(gameState.Pot * 0.4));
                return new PlayerAction { Type = ActionType.Raise, RaiseAmount = bluffAmount };
            }
            
            return new PlayerAction { Type = ActionType.Check };
        }

        // Implied odds consideration
        var cardsRemaining = 5 - communityCards.Count;
        var impliedOdds = _pokerMath.CalculateImpliedOdds(gameState.Pot, toCall, outs, cardsRemaining * 2);

        // Fold decision with multiple factors
        if (equity < potOdds && toCall > bot.Chips * 0.25 && !(impliedOdds > potOdds * 1.5))
        {
            return new PlayerAction { Type = ActionType.Fold };
        }

        // Strong hand - value bet
        if (equity > 0.65 || handStrength > 0.75)
        {
            var raiseAmount = Math.Min(bot.Chips, (int)(minRaise * (2.0 + equity * 0.5)));
            return new PlayerAction { Type = ActionType.Raise, RaiseAmount = raiseAmount };
        }

        // Semi-bluff with draws
        if (outs >= 8 && equity > 0.35 && isLatePosition && _random.NextDouble() < 0.4)
        {
            var semiBluffAmount = Math.Min(bot.Chips, (int)(minRaise * 1.5));
            return new PlayerAction { Type = ActionType.Raise, RaiseAmount = semiBluffAmount };
        }

        // Call with positive EV or implied odds
        if (equity >= potOdds || impliedOdds > potOdds * 1.2 || handStrength > 0.5)
        {
            return new PlayerAction { Type = ActionType.Call };
        }

        // Tight fold in early position
        if (isEarlyPosition && equity < potOdds * 1.1)
        {
            return new PlayerAction { Type = ActionType.Fold };
        }

        return new PlayerAction { Type = ActionType.Fold };
    }

    private double CalculatePosition(Player bot, GameState gameState)
    {
        var activePlayers = gameState.Players.Where(p => p.IsActive && !p.IsFolded).OrderBy(p => p.SeatNumber).ToList();
        var botIndex = activePlayers.FindIndex(p => p.Id == bot.Id);
        var totalPlayers = activePlayers.Count;
        
        if (totalPlayers == 0) return 0.5;
        return (double)botIndex / totalPlayers;
    }

    private string AnalyzeBoardTexture(List<Card> communityCards)
    {
        if (communityCards.Count == 0) return "preflop";
        
        var ranks = communityCards.Select(c => c.Rank).ToList();
        var suits = communityCards.Select(c => c.Suit).ToList();
        
        var pairCount = ranks.GroupBy(r => r).Count(g => g.Count() >= 2);
        var flushDraw = suits.GroupBy(s => s).Any(g => g.Count() >= 3);
        var straightDraw = HasStraightDraw(ranks);
        
        if (pairCount > 0) return "paired";
        if (flushDraw) return "flushy";
        if (straightDraw) return "straighty";
        return "dry";
    }

    private bool HasStraightDraw(List<Rank> ranks)
    {
        var values = ranks.Select(r => (int)r).OrderBy(v => v).ToList();
        for (int i = 0; i < values.Count - 1; i++)
        {
            if (values[i + 1] - values[i] <= 2) return true;
        }
        return false;
    }

    private double CalculateBluffFrequency(string boardTexture, double position, double equity)
    {
        var baseFrequency = 0.15;
        
        if (boardTexture == "dry" && position > 0.6) baseFrequency += 0.2;
        if (equity < 0.3 && position > 0.7) baseFrequency += 0.15;
        if (equity > 0.5) baseFrequency -= 0.1; // Don't bluff with good equity
        
        return Math.Max(0, Math.Min(0.5, baseFrequency));
    }

    private double CalculateOptimalBetSize(double equity, double handStrength, int pot, bool isLatePosition)
    {
        var baseSize = pot * 0.5;
        if (equity > 0.7) baseSize = pot * 0.75;
        if (isLatePosition && handStrength > 0.6) baseSize *= 1.2;
        return baseSize;
    }
}

