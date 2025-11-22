namespace PokerGame.API.DTOs;

public class PlayerActionDto
{
    public int SeatNumber { get; set; }
    public string Action { get; set; } = string.Empty; // fold, check, call, raise
    public int? RaiseAmount { get; set; }
}

public class AddPlayerDto
{
    public string Name { get; set; } = string.Empty;
    public int SeatNumber { get; set; }
}

public class AddBotDto
{
    public string BotLevel { get; set; } = "random"; // random, basic, smart
    public int SeatNumber { get; set; }
}


