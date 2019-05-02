using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Mapster;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using SkillersPokerSystem.Data;
using SkillersPokerSystem.Data.Models;
using SkillersPokerSystem.ViewModels;

namespace SkillersPokerSystem.Controllers
{
    [Route("api/[controller]")]
    public class GameDetailController : BaseApiController
    {
        public GameDetailController(
            ApplicationDbContext context,
            RoleManager<IdentityRole> roleManager,
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            IConfiguration configuration
            )
            : base(context, roleManager, userManager, configuration)
        {
        }

        [HttpGet("All/{gameId}")]
        public IActionResult All(int gameId)
        {
            var gameDetails = DbContext.GameDetails
                .Where(q => q.GameId == gameId)
                .Include(p => p.Player)
                .Include( g=> g.Game.Rake.RakeDetails)
                .GroupBy(p => p.Player.Name)
                .Select(p => new {
                    Name = p.Key,
                    Value = p.Sum(i => i.Value),
                    ChipsTotal = p.Sum(i => i.ChipsTotal),
                    Result = p.Sum(i => i.ChipsTotal) - p.Sum(i => i.Value),
                    Rake =  p.Sum(i => i.ChipsTotal) * (p.Max( s => s.Game.Rake.RakeDetails.Where( a=> a.Value > p.Sum(i => i.Value) ).FirstOrDefault().Percent  )/100),
                    RakePercent = p.Max(s => s.Game.Rake.RakeDetails.Where(a => a.Value > p.Sum(i => i.Value)).FirstOrDefault().Percent),
                    Total = p.Sum(i => i.ChipsTotal) - (p.Sum(i => i.ChipsTotal) * (p.Max(s => s.Game.Rake.RakeDetails.Where(a => a.Value > p.Sum(i => i.Value)).FirstOrDefault().Percent) / 100)),
                    ProfitOrLoss = p.Sum(i => i.ChipsTotal) - (p.Sum(i => i.ChipsTotal) * (p.Max(s => s.Game.Rake.RakeDetails.Where(a => a.Value > p.Sum(i => i.Value)).FirstOrDefault().Percent) / 100)) - p.Sum(i => i.Value),
                    PlayerId = p.Max( x => x.PlayerId),
                    PlayerImgUrl = p.Max( x => x.Player.ImageUrl)
                })
                .OrderByDescending( x => x.ProfitOrLoss )
                .ToArray();
                

            return new JsonResult(
                gameDetails.Adapt<GameDetailViewModel[]>()
                ,
                JsonSettings);
        }


        [HttpPut]
        [Authorize]
        public IActionResult Put([FromBody]List<GameDetailViewModel> model)
        {

            //if (model == null) return new StatusCodeResult(500);


            var authorId = User.FindFirst(ClaimTypes.NameIdentifier).Value;

            base.SetActive();


            var game = new Game()
            {
                UserId = authorId,
                CreatedDate = DateTime.UtcNow,
                RakeId = DbContext.Rakes.LastOrDefault().Id,
                ViewCount = 0,
                Status = StatusEnum.Aberto
            };


            DbContext.Games.Add(game);

            DbContext.SaveChanges();

            foreach (var gameDetailvm in model)
            {
                var gameDetail = gameDetailvm.Adapt<GameDetail>();
                gameDetail.CreatedDate = DateTime.UtcNow;
                gameDetail.GameId = game.Id;
                DbContext.GameDetails.Add(gameDetail);
                DbContext.SaveChanges();
            }

            return new JsonResult(game.Adapt<GameViewModel>()
                , JsonSettings);
        }

        [HttpPut]
        [Route("AddDetail/{gameId}")]
        [Authorize]
        public IActionResult AddDetail(int gameId, [FromBody]List<GameDetailViewModel> model)
        {

            if (model == null) return new StatusCodeResult(500);


            foreach (var gameDetailvm in model)
            {
                var gameDetail = gameDetailvm.Adapt<GameDetail>();
                gameDetail.CreatedDate = DateTime.UtcNow;
                gameDetail.GameId = gameId;
                DbContext.GameDetails.Add(gameDetail);
                DbContext.SaveChanges();
            }

            return new OkResult();
        }

        [HttpGet("Detail/{gameId}")]
        public IActionResult Detail(int gameId)
        {

            var gameDetails = DbContext.GameDetails
                .Where(q => q.GameId == gameId)
                .Include(p => p.Player)
                .ToArray();

            TypeAdapterConfig<GameDetail, GameDetailViewModel>.NewConfig()
                .Map(dest => dest.Name, src => src.Player.Name);


            return new JsonResult(
                gameDetails.Adapt<GameDetailViewModel[]>()
                ,
                JsonSettings);
        }

        [HttpDelete("{id}")]
        [Authorize]
        public IActionResult Delete(int id)
        {
            var gameDetail = DbContext.GameDetails.Where(i => i.Id == id)
                .FirstOrDefault();

            if (gameDetail == null) return NotFound(new
            {
                Error = String.Format("GameDetail ID {0} has not been found", id)
            });

            DbContext.GameDetails.Remove(gameDetail);
            DbContext.SaveChanges();

            return new NoContentResult();
        }
    }
}
