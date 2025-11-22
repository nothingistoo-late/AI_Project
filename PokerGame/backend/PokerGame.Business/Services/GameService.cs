using PokerGame.Domain.Entities;

namespace PokerGame.Business.Services;

public class GameService : IGameService
{
    private GameState _gameState;
    private readonly IHandEvaluator _handEvaluator;
    private readonly IBotService _botService;
    private readonly Random _random;

    public GameService(IHandEvaluator handEvaluator, IBotService botService)
    {
        _handEvaluator = handEvaluator;
        _botService = botService;
        _random = new Random();
        _gameState = new GameState();
    }

    public GameState CreateGame(int smallBlind = 10, int bigBlind = 20)
    {
        _gameState = new GameState
        {
            SmallBlind = smallBlind,
            BigBlind = bigBlind,
            Phase = GamePhase.Waiting,
            Players = new List<Player>()
        };
        return _gameState;
    }

    public GameState AddPlayer(string name, int seatNumber)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new InvalidOperationException("Player name cannot be empty");

        if (seatNumber < 0 || seatNumber >= 4)
            throw new InvalidOperationException("Seat number must be between 0 and 3");

        if (_gameState.Players == null)
            _gameState.Players = new List<Player>();

        if (_gameState.Players.Any(p => p.SeatNumber == seatNumber))
            throw new InvalidOperationException($"Seat {seatNumber} is already occupied");

        var player = new Player
        {
            Id = _gameState.Players.Count + 1,
            Name = name,
            IsBot = false,
            BotLevel = "easy",
            SeatNumber = seatNumber,
            Chips = 1000,
            IsActive = false
        };

        _gameState.Players.Add(player);
        return _gameState;
    }

    public GameState AddBot(string botLevel, int seatNumber)
    {
        if (string.IsNullOrWhiteSpace(botLevel))
            botLevel = "easy";

        var validLevels = new[] { "easy", "medium", "hard" };
        if (!validLevels.Contains(botLevel.ToLower()))
            throw new InvalidOperationException($"Invalid bot level. Must be one of: {string.Join(", ", validLevels)}");

        if (seatNumber < 0 || seatNumber >= 4)
            throw new InvalidOperationException("Seat number must be between 0 and 3");

        if (_gameState.Players == null)
            _gameState.Players = new List<Player>();

        if (_gameState.Players.Any(p => p.SeatNumber == seatNumber))
            throw new InvalidOperationException($"Seat {seatNumber} is already occupied");

        var bot = new Player
        {
            Id = _gameState.Players.Count + 1,
            Name = $"Bot {botLevel}",
            IsBot = true,
            BotLevel = botLevel.ToLower(),
            SeatNumber = seatNumber,
            Chips = 1000,
            IsActive = false
        };

        _gameState.Players.Add(bot);
        return _gameState;
    }

    public GameState RemovePlayer(int seatNumber)
    {
        var player = _gameState.Players.FirstOrDefault(p => p.SeatNumber == seatNumber);
        if (player != null)
        {
            _gameState.Players.Remove(player);
        }
        return _gameState;
    }

    public GameState StartNewHand()
    {
        if (_gameState.Players.Count < 2)
            throw new InvalidOperationException("Need at least 2 players to start");

        // Reset hand state
        _gameState.CommunityCards.Clear();
        _gameState.Pot = 0;
        _gameState.CurrentBet = 0;
        _gameState.LastRaiseAmount = _gameState.BigBlind;
        _gameState.LastRaisePlayerIndex = -1;
        _gameState.IsShowdown = false;
        _gameState.Winners.Clear();

        // Create and shuffle deck
        _gameState.Deck = GenerateDeck();
        ShuffleDeck(_gameState.Deck);
        _gameState.DeckIndex = 0;

        // Reset players
        foreach (var player in _gameState.Players)
        {
            player.HoleCards.Clear();
            player.CurrentBet = 0;
            player.IsFolded = false;
            player.IsAllIn = false;
            player.IsActive = true;
            player.BestHand = null;
        }

        // Deal hole cards
        for (int i = 0; i < 2; i++)
        {
            foreach (var player in _gameState.Players.Where(p => p.IsActive))
            {
                player.HoleCards.Add(DealCard());
            }
        }

        // Set dealer, blinds
        SetDealerAndBlinds();

        // Post blinds
        PostBlinds();

        // Set current player
        _gameState.Phase = GamePhase.PreFlop;
        var bigBlindPlayer = _gameState.Players.FirstOrDefault(p => p.IsBigBlind);
        if (bigBlindPlayer != null)
        {
            var bigBlindIndex = _gameState.Players.IndexOf(bigBlindPlayer);
            _gameState.CurrentPlayerIndex = GetNextActivePlayer(bigBlindIndex);
        }

        return _gameState;
    }

    public GameState PlayerAction(int seatNumber, string action, int? raiseAmount = null)
    {
        if (_gameState.Players == null || _gameState.Players.Count == 0)
            throw new InvalidOperationException("No players in game");

        var player = _gameState.Players.FirstOrDefault(p => p.SeatNumber == seatNumber);
        if (player == null)
            throw new InvalidOperationException($"Player at seat {seatNumber} not found");

        if (!player.IsActive)
            throw new InvalidOperationException("Player is not active");

        if (player.IsFolded)
            throw new InvalidOperationException("Player has already folded");

        var playerIndex = _gameState.Players.IndexOf(player);
        if (playerIndex < 0)
            throw new InvalidOperationException("Player index not found");

        if (_gameState.CurrentPlayerIndex != playerIndex)
            throw new InvalidOperationException($"Not player's turn. Current player index: {_gameState.CurrentPlayerIndex}");

        ExecuteAction(player, action, raiseAmount);
        AdvanceGame();

        return _gameState;
    }

    public GameState ProcessBotTurns()
    {
        if (_gameState.Players == null || _gameState.Players.Count == 0)
            return _gameState;

        var maxIterations = 100; // Prevent infinite loops
        var iterations = 0;

        while (_gameState.Phase != GamePhase.Showdown && 
               _gameState.Phase != GamePhase.Finished && 
               iterations < maxIterations)
        {
            iterations++;

            if (_gameState.CurrentPlayerIndex < 0 || _gameState.CurrentPlayerIndex >= _gameState.Players.Count)
                break;

            var currentPlayer = _gameState.Players[_gameState.CurrentPlayerIndex];
            
            if (currentPlayer == null)
                break;

            if (currentPlayer.IsBot && currentPlayer.IsActive && !currentPlayer.IsFolded)
            {
                try
                {
                    var action = _botService.DecideAction(currentPlayer, _gameState, currentPlayer.HoleCards, _gameState.CommunityCards);
                    ExecuteAction(currentPlayer, action.Type.ToString().ToLower(), action.RaiseAmount);
                    AdvanceGame();
                }
                catch (Exception ex)
                {
                    // Log error and break to prevent infinite loop
                    Console.WriteLine($"Error processing bot action: {ex.Message}");
                    break;
                }
            }
            else if (!currentPlayer.IsBot)
            {
                // Human player's turn, wait for input
                break;
            }
            else
            {
                // Player is folded or inactive, advance to next
                AdvanceGame();
            }
        }

        return _gameState;
    }

    public GameState EvaluateWinners()
    {
        var activePlayers = _gameState.Players.Where(p => p.IsActive && !p.IsFolded).ToList();
        
        if (activePlayers.Count == 1)
        {
            _gameState.Winners.Add(activePlayers[0]);
            _gameState.Winners[0].Chips += _gameState.Pot;
            _gameState.Phase = GamePhase.Finished;
            return _gameState;
        }

        // Evaluate all hands
        foreach (var player in activePlayers)
        {
            player.BestHand = _handEvaluator.EvaluateHand(player.HoleCards, _gameState.CommunityCards);
        }

        // Find winner(s)
        var bestHand = activePlayers
            .OrderByDescending(p => p.BestHand!.Type)
            .ThenByDescending(p => p.BestHand!.Strength)
            .First();

        var winners = activePlayers
            .Where(p => p.BestHand!.Type == bestHand.BestHand!.Type && 
                       p.BestHand!.Strength == bestHand.BestHand!.Strength)
            .ToList();

        // Compare kickers if needed
        if (winners.Count > 1)
        {
            winners = CompareKickers(winners);
        }

        _gameState.Winners = winners;
        var potPerWinner = _gameState.Pot / winners.Count;
        foreach (var winner in winners)
        {
            winner.Chips += potPerWinner;
        }

        _gameState.IsShowdown = true;
        _gameState.Phase = GamePhase.Finished;

        return _gameState;
    }

    public GameState GetGameState()
    {
        return _gameState;
    }

    public GameState ResetGame()
    {
        foreach (var player in _gameState.Players)
        {
            player.Chips = 1000;
            player.HoleCards.Clear();
            player.CurrentBet = 0;
            player.IsFolded = false;
            player.IsAllIn = false;
            player.IsActive = false;
            player.BestHand = null;
        }

        _gameState.CommunityCards.Clear();
        _gameState.Pot = 0;
        _gameState.CurrentBet = 0;
        _gameState.Phase = GamePhase.Waiting;
        _gameState.IsShowdown = false;
        _gameState.Winners.Clear();

        return _gameState;
    }

    private void ExecuteAction(Player player, string action, int? raiseAmount)
    {
        var toCall = _gameState.CurrentBet - player.CurrentBet;

        switch (action.ToLower())
        {
            case "fold":
                player.IsFolded = true;
                player.IsActive = false;
                break;

            case "check":
                if (toCall > 0)
                    throw new InvalidOperationException("Cannot check, must call or fold");
                break;

            case "call":
                var callAmount = Math.Min(toCall, player.Chips);
                player.Chips -= callAmount;
                player.CurrentBet += callAmount;
                _gameState.Pot += callAmount;
                if (player.Chips == 0) player.IsAllIn = true;
                break;

            case "raise":
                var minRaise = _gameState.CurrentBet + Math.Max(_gameState.LastRaiseAmount, _gameState.BigBlind);
                if (raiseAmount == null || raiseAmount < minRaise)
                    throw new InvalidOperationException($"Invalid raise amount. Minimum raise is ${minRaise}");
                
                var totalBet = raiseAmount.Value;
                var additionalBet = totalBet - player.CurrentBet;
                var actualBet = Math.Min(additionalBet, player.Chips);
                
                if (actualBet <= 0)
                    throw new InvalidOperationException("Raise amount must be greater than current bet");
                
                player.Chips -= actualBet;
                player.CurrentBet += actualBet;
                _gameState.Pot += actualBet;
                
                // Update current bet and last raise amount
                var previousBet = _gameState.CurrentBet;
                _gameState.CurrentBet = player.CurrentBet;
                _gameState.LastRaiseAmount = player.CurrentBet - previousBet;
                _gameState.LastRaisePlayerIndex = _gameState.Players.IndexOf(player);
                
                if (player.Chips == 0) player.IsAllIn = true;
                break;
        }
    }

    private void AdvanceGame()
    {
        // Check if betting round is complete
        var activePlayers = _gameState.Players.Where(p => p.IsActive && !p.IsFolded).ToList();
        if (activePlayers.Count <= 1)
        {
            EvaluateWinners();
            return;
        }

        // Check if all players have acted and bets are equal
        var allActed = activePlayers.All(p => p.CurrentBet == _gameState.CurrentBet || p.IsAllIn);
        var allBetsEqual = activePlayers.Select(p => p.CurrentBet).Distinct().Count() <= 1;

        if (allActed && allBetsEqual)
        {
            // Move to next phase
            switch (_gameState.Phase)
            {
                case GamePhase.PreFlop:
                    DealFlop();
                    break;
                case GamePhase.Flop:
                    DealTurn();
                    break;
                case GamePhase.Turn:
                    DealRiver();
                    break;
                case GamePhase.River:
                    EvaluateWinners();
                    return;
            }

            // Reset betting
            foreach (var player in activePlayers)
            {
                player.CurrentBet = 0;
            }
            _gameState.CurrentBet = 0;
            _gameState.LastRaiseAmount = _gameState.BigBlind;
            _gameState.LastRaisePlayerIndex = -1;

            // Set current player to first active player after dealer
            var dealerPlayer = _gameState.Players.FirstOrDefault(p => p.IsDealer);
            if (dealerPlayer != null)
            {
                var dealerIndex = _gameState.Players.IndexOf(dealerPlayer);
                _gameState.CurrentPlayerIndex = GetNextActivePlayer(dealerIndex);
            }
        }
        else
        {
            // Move to next player
            _gameState.CurrentPlayerIndex = GetNextActivePlayer(_gameState.CurrentPlayerIndex);
        }
    }

    private void DealFlop()
    {
        _gameState.Phase = GamePhase.Flop;
        DealCard(); // Burn card
        _gameState.CommunityCards.Add(DealCard());
        _gameState.CommunityCards.Add(DealCard());
        _gameState.CommunityCards.Add(DealCard());
    }

    private void DealTurn()
    {
        _gameState.Phase = GamePhase.Turn;
        DealCard(); // Burn card
        _gameState.CommunityCards.Add(DealCard());
    }

    private void DealRiver()
    {
        _gameState.Phase = GamePhase.River;
        DealCard(); // Burn card
        _gameState.CommunityCards.Add(DealCard());
    }

    private void SetDealerAndBlinds()
    {
        var activePlayers = _gameState.Players.Where(p => p.IsActive).OrderBy(p => p.SeatNumber).ToList();
        
        foreach (var player in _gameState.Players)
        {
            player.IsDealer = false;
            player.IsSmallBlind = false;
            player.IsBigBlind = false;
        }

        _gameState.DealerPosition = activePlayers[0].SeatNumber;
        activePlayers[0].IsDealer = true;

        if (activePlayers.Count >= 2)
        {
            activePlayers[1].IsSmallBlind = true;
            _gameState.SmallBlindPosition = activePlayers[1].SeatNumber;
        }

        if (activePlayers.Count >= 3)
        {
            activePlayers[2].IsBigBlind = true;
            _gameState.BigBlindPosition = activePlayers[2].SeatNumber;
        }
        else if (activePlayers.Count == 2)
        {
            activePlayers[1].IsBigBlind = true;
            _gameState.BigBlindPosition = activePlayers[1].SeatNumber;
        }
    }

    private void PostBlinds()
    {
        var smallBlindPlayer = _gameState.Players.FirstOrDefault(p => p.IsSmallBlind);
        var bigBlindPlayer = _gameState.Players.FirstOrDefault(p => p.IsBigBlind);

        if (smallBlindPlayer != null)
        {
            var sbAmount = Math.Min(_gameState.SmallBlind, smallBlindPlayer.Chips);
            smallBlindPlayer.Chips -= sbAmount;
            smallBlindPlayer.CurrentBet = sbAmount;
            _gameState.Pot += sbAmount;
            if (smallBlindPlayer.Chips == 0) smallBlindPlayer.IsAllIn = true;
        }

        if (bigBlindPlayer != null)
        {
            var bbAmount = Math.Min(_gameState.BigBlind, bigBlindPlayer.Chips);
            bigBlindPlayer.Chips -= bbAmount;
            bigBlindPlayer.CurrentBet = bbAmount;
            _gameState.Pot += bbAmount;
            _gameState.CurrentBet = bbAmount;
            if (bigBlindPlayer.Chips == 0) bigBlindPlayer.IsAllIn = true;
        }
    }

    private int GetNextActivePlayer(int startIndex)
    {
        if (_gameState.Players == null || _gameState.Players.Count == 0)
            return 0;
            
        var players = _gameState.Players;
        var activePlayers = players.Where(p => p.IsActive && !p.IsFolded && !p.IsAllIn).ToList();
        
        if (activePlayers.Count == 0)
            return 0;
        
        if (startIndex < 0 || startIndex >= players.Count)
            startIndex = 0;
            
        var currentIndex = startIndex;
        var attempts = 0;
        var maxAttempts = players.Count;
        
        do
        {
            currentIndex = (currentIndex + 1) % players.Count;
            var player = players[currentIndex];
            
            if (player.IsActive && !player.IsFolded && !player.IsAllIn)
            {
                return currentIndex;
            }
            
            attempts++;
        } while (currentIndex != startIndex && attempts < maxAttempts);

        // Fallback: return first active player
        var firstActive = players.FindIndex(p => p.IsActive && !p.IsFolded && !p.IsAllIn);
        return firstActive >= 0 ? firstActive : 0;
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

    private void ShuffleDeck(List<Card> deck)
    {
        for (int i = deck.Count - 1; i > 0; i--)
        {
            int j = _random.Next(i + 1);
            (deck[i], deck[j]) = (deck[j], deck[i]);
        }
    }

    private Card DealCard()
    {
        if (_gameState.DeckIndex >= _gameState.Deck.Count)
            throw new InvalidOperationException("Deck is empty");

        return _gameState.Deck[_gameState.DeckIndex++];
    }

    private List<Player> CompareKickers(List<Player> players)
    {
        // Simple comparison - in real poker, this is more complex
        return players.OrderByDescending(p => 
            p.BestHand!.Kickers.Sum(k => k.GetValue())).ToList();
    }
}

