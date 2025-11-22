using Microsoft.AspNetCore.Mvc;
using PokerGame.Business.Services;
using PokerGame.Domain.Entities;

namespace PokerGame.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OddsController : ControllerBase
{
    private readonly IOddsCalculator _oddsCalculator;

    public OddsController(IOddsCalculator oddsCalculator)
    {
        _oddsCalculator = oddsCalculator;
    }

    [HttpPost("outs")]
    public ActionResult<int> CalculateOuts([FromBody] CalculateOutsDto dto)
    {
        var holeCards = dto.HoleCards.Select(c => new Card((Suit)c.Suit, (Rank)c.Rank)).ToList();
        var communityCards = dto.CommunityCards.Select(c => new Card((Suit)c.Suit, (Rank)c.Rank)).ToList();
        
        var outs = _oddsCalculator.CalculateOuts(holeCards, communityCards);
        return Ok(new { outs });
    }

    [HttpPost("winrate")]
    public ActionResult<double> CalculateWinRate([FromBody] CalculateWinRateDto dto)
    {
        var holeCards = dto.HoleCards.Select(c => new Card((Suit)c.Suit, (Rank)c.Rank)).ToList();
        var communityCards = dto.CommunityCards.Select(c => new Card((Suit)c.Suit, (Rank)c.Rank)).ToList();
        
        var winRate = _oddsCalculator.CalculateWinRate(holeCards, communityCards, dto.NumberOfOpponents);
        return Ok(new { winRate });
    }

    [HttpPost("potodds")]
    public ActionResult<double> CalculatePotOdds([FromBody] CalculatePotOddsDto dto)
    {
        var potOdds = _oddsCalculator.CalculatePotOdds(dto.Pot, dto.BetAmount);
        return Ok(new { potOdds });
    }

    [HttpPost("equity")]
    public ActionResult<double> CalculateEquity([FromBody] CalculateEquityDto dto)
    {
        var holeCards = dto.HoleCards.Select(c => new Card((Suit)c.Suit, (Rank)c.Rank)).ToList();
        var communityCards = dto.CommunityCards.Select(c => new Card((Suit)c.Suit, (Rank)c.Rank)).ToList();
        
        var equity = _oddsCalculator.CalculateEquity(holeCards, communityCards, dto.NumberOfOpponents);
        return Ok(new { equity });
    }
}

public class CalculateOutsDto
{
    public List<CardDto> HoleCards { get; set; } = new();
    public List<CardDto> CommunityCards { get; set; } = new();
}

public class CalculateWinRateDto
{
    public List<CardDto> HoleCards { get; set; } = new();
    public List<CardDto> CommunityCards { get; set; } = new();
    public int NumberOfOpponents { get; set; }
}

public class CalculatePotOddsDto
{
    public int Pot { get; set; }
    public int BetAmount { get; set; }
}

public class CalculateEquityDto
{
    public List<CardDto> HoleCards { get; set; } = new();
    public List<CardDto> CommunityCards { get; set; } = new();
    public int NumberOfOpponents { get; set; }
}

public class CardDto
{
    public int Suit { get; set; }
    public int Rank { get; set; }
}


