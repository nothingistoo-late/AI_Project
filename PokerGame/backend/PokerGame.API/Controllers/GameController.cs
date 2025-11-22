using Microsoft.AspNetCore.Mvc;
using PokerGame.API.DTOs;
using PokerGame.Business.Services;
using PokerGame.Domain.Entities;

namespace PokerGame.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GameController : ControllerBase
{
    private readonly IGameService _gameService;

    public GameController(IGameService gameService)
    {
        _gameService = gameService;
    }

    [HttpGet("state")]
    public ActionResult<GameState> GetGameState()
    {
        return Ok(_gameService.GetGameState());
    }

    [HttpPost("start")]
    public ActionResult<GameState> StartGame([FromQuery] int smallBlind = 10, [FromQuery] int bigBlind = 20)
    {
        var gameState = _gameService.CreateGame(smallBlind, bigBlind);
        return Ok(gameState);
    }

    [HttpPost("player")]
    public ActionResult<GameState> AddPlayer([FromBody] AddPlayerDto dto)
    {
        try
        {
            var gameState = _gameService.AddPlayer(dto.Name, dto.SeatNumber);
            return Ok(gameState);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("add-bot")]
    public ActionResult<GameState> AddBot([FromBody] AddBotDto dto)
    {
        try
        {
            var gameState = _gameService.AddBot(dto.BotLevel, dto.SeatNumber);
            return Ok(gameState);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpDelete("player/{seatNumber}")]
    public ActionResult<GameState> RemovePlayer(int seatNumber)
    {
        var gameState = _gameService.RemovePlayer(seatNumber);
        return Ok(gameState);
    }

    [HttpPost("hand/start")]
    public ActionResult<GameState> StartNewHand()
    {
        try
        {
            var gameState = _gameService.StartNewHand();
            return Ok(gameState);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("next-stage")]
    public ActionResult<GameState> NextStage()
    {
        try
        {
            // This is auto-triggered, but can be called manually for testing
            var gameState = _gameService.ProcessBotTurns();
            return Ok(gameState);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("toggle-bot-cards")]
    public ActionResult<bool> ToggleBotCards()
    {
        // This is a dev feature - in real implementation, would toggle a setting
        return Ok(true);
    }

    [HttpPost("action")]
    public ActionResult<GameState> PlayerAction([FromBody] PlayerActionDto dto)
    {
        try
        {
            var gameState = _gameService.PlayerAction(dto.SeatNumber, dto.Action, dto.RaiseAmount);
            return Ok(gameState);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("bots/process")]
    public ActionResult<GameState> ProcessBotTurns()
    {
        var gameState = _gameService.ProcessBotTurns();
        return Ok(gameState);
    }

    [HttpPost("evaluate")]
    public ActionResult<GameState> EvaluateWinners()
    {
        var gameState = _gameService.EvaluateWinners();
        return Ok(gameState);
    }

    [HttpPost("reset")]
    public ActionResult<GameState> ResetGame()
    {
        var gameState = _gameService.ResetGame();
        return Ok(gameState);
    }
}

