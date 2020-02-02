using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using System.Linq;
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

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace SkillersPokerSystem.Controllers
{
    [Route("api/[controller]")]
    public class GameController : BaseApiController
    {

        public GameController(
            ApplicationDbContext context,
            RoleManager<IdentityRole> roleManager,
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            IConfiguration configuration
            )
            : base(context, roleManager, userManager, configuration)
        {
        }

        [HttpGet("{id}")]
        public IActionResult Get(int id)
        {
            var game = DbContext.Games.Where(i => i.Id == id)
                .FirstOrDefault();

            // handle requests asking for non-existing games
            if (game == null)
            {
                return NotFound(new
                {
                    Error = String.Format("Game ID {0} has not been found", id)
                });
            }

            return new JsonResult(
                game.Adapt<GameViewModel>(),
                JsonSettings);
        }

        [HttpGet("Active")]
        public IActionResult Active()
        {
            var active = DbContext.Games.Where(s => s.Status == StatusEnum.Aberto)
                .OrderBy(x => x.Id)
                .FirstOrDefault();

            return new JsonResult(
                active.Adapt<GameViewModel>(), JsonSettings
                );

        }

        [HttpGet("Latest/{num:int?}")]
        public IActionResult Latest(int num = 10)
        {


            /* var winnerQuery = "WITH winner AS(" +
                 "                                   SELECT  gd.GameId, p.Id, SUM(gd.ChipsTotal) - SUM(gd.Value) TOTAL," +
                 "                                         ROW_NUMBER() OVER(PARTITION BY GameId ORDER BY gd.GameId DESC, SUM(gd.ChipsTotal) - SUM(gd.Value) DESC) AS rn" +
                 "                                    FROM GameDetails gd" +
                 "                                    INNER JOIN Players p ON p.Id = gd.PlayerId" +
                 "                                    GROUP BY gd.GameId, p.Id" +
                 "                                ) SELECT * FROM winner WHERE rn = 1";*/


            var latest = DbContext.GameDetails
                .Include(g => g.Game)
                .GroupBy(g => new { g.GameId, g.Game.CreatedDate, g.Game.Status })
                .Select(a => new
                {
                    a.Key.GameId,
                    a.Key.CreatedDate,
                    a.Key.Status,
                    NumberOfPlayers = a.GroupBy(s => s.PlayerId).Count(),
                    Total = a.Sum(i => i.Value),
                    Winner =
                       a.GroupBy(t => t.Player.Name)
                       .Select(n => new { Name = n.Key, Vencedor = (n.Sum(y => y.ChipsTotal) - n.Sum(y => y.Value)) })
                       .OrderByDescending(u => u.Vencedor)
                       .Take(1).ElementAt(0).Name
                }


                )
                .OrderByDescending(x => x.CreatedDate)
                .Take(num)
                .ToArray();


            return new JsonResult(
                latest.Adapt<GameViewModel[]>(),
                JsonSettings);
        }


        [HttpGet("Ranking")]
        public IActionResult Ranking(string year = null, string month = null, string realProfit = null)
        {

            int yearForRanking = int.Parse(year);
            int monthForRanking = int.Parse(month);
            Boolean realProfitForRanking = bool.Parse(realProfit);

            IOrderedQueryable model;

            if (yearForRanking == DateTime.UtcNow.Year && monthForRanking != 0)
            {

                var a1 = DbContext.GameDetails
                .Where(d => d.Game.CreatedDate.Year == yearForRanking && d.Game.CreatedDate.Month == monthForRanking && d.Game.Status == StatusEnum.Encerrado && d.PlayerId > 0)
                .GroupBy(x => new { x.GameId, x.Game.RakeId, x.Player.Name, x.CreatedDate.Year }).ToList().AsQueryable()
                .Select(x => new
                {
                    x.Key.Name,
                    Month = 13,
                    x.Key.Year,
                    BuyIns = x.Sum(s => s.Value),
                    Cashout = x.Sum(c => c.ChipsTotal),
                    RakeId = x.Key.RakeId
                })
                 .OrderBy(s => (s.Name))
                 ;

                var a2 = a1.Select(
                    x => new
                    {
                        Name = x.Name,
                        Month = x.Month,
                        Year = x.Year,
                        RakeId = x.RakeId,
                        Buyins = x.BuyIns,
                        Total = realProfitForRanking ? x.Cashout -
                    (x.Cashout *
                    DbContext.RakeDetails.Where(rd => rd.RakeId == x.RakeId && rd.Value > x.BuyIns).First().Percent
                    / 100)
                    - x.BuyIns : x.Cashout - x.BuyIns
                    }
                ).OrderBy(s => (s.Name));

                var a3 = a2.GroupBy(x => new { x.Name, x.Month, x.Year })
                .Select(s => new { s.Key.Name, s.Key.Month, s.Key.Year, Total = s.Sum(f => f.Total) })
                .OrderByDescending(s => s.Total)
                ;

                model = a3;
            }

            else if (yearForRanking == DateTime.UtcNow.Year)
            {

                var a1 = DbContext.GameDetails
                .Where(d => d.Game.CreatedDate.Year == yearForRanking && d.Player.IsActive == true && d.Game.Status == StatusEnum.Encerrado && d.PlayerId > 0)
                .GroupBy(x => new { x.GameId, x.Game.RakeId, x.Player.Name, x.CreatedDate.Year }).ToList().AsQueryable()
                .Select(x => new
                {
                    x.Key.Name,
                    Month = 13,
                    x.Key.Year,
                    BuyIns = x.Sum(s => s.Value),
                    Cashout = x.Sum(c => c.ChipsTotal),
                    RakeId = x.Key.RakeId
                })
                 .OrderBy(s => (s.Name))
                 ;

                var a2 = a1.Select(
                    x => new
                    {
                        Name = x.Name,
                        Month = x.Month,
                        Year = x.Year,
                        RakeId = x.RakeId,
                        Buyins = x.BuyIns,
                        Total = realProfitForRanking ? x.Cashout -
                    (x.Cashout *
                    DbContext.RakeDetails.Where(rd => rd.RakeId == x.RakeId && rd.Value > x.BuyIns).First().Percent
                    / 100)
                    - x.BuyIns : x.Cashout - x.BuyIns
                    }
                ).OrderBy(s => (s.Name));

                var a3 = a2.GroupBy(x => new { x.Name, x.Month, x.Year })
                .Select(s => new { s.Key.Name, s.Key.Month, s.Key.Year, Total = s.Sum(f => f.Total) })
                .OrderByDescending(s => s.Total)
                ;

                var b1 = DbContext.GameDetails
               .Where(d => d.Game.CreatedDate.Year == yearForRanking && d.Player.IsActive == true && d.Game.Status == StatusEnum.Encerrado && d.PlayerId > 0)
               .GroupBy(x => new { x.GameId, x.Game.RakeId, x.Player.Name, x.CreatedDate.Year, x.Game.CreatedDate.Month }).ToList().AsQueryable()
               .Select(x => new
               {
                   x.Key.Name,
                   x.Key.Month,
                   x.Key.Year,
                   BuyIns = x.Sum(s => s.Value),
                   Cashout = x.Sum(c => c.ChipsTotal),
                   RakeId = x.Key.RakeId
               })
                .OrderBy(s => (s.Name))
                ;

                var b2 = b1.Select(
                    x => new
                    {
                        Name = x.Name,
                        Month = x.Month,
                        Year = x.Year,
                        RakeId = x.RakeId,
                        Buyins = x.BuyIns,
                        Total = realProfitForRanking ? x.Cashout -
                    (x.Cashout *
                    DbContext.RakeDetails.Where(rd => rd.RakeId == x.RakeId && rd.Value > x.BuyIns).First().Percent
                    / 100)
                    - x.BuyIns : x.Cashout - x.BuyIns
                    }
                ).OrderBy(s => (s.Name));

                var b3 = b2.GroupBy(x => new { x.Name, x.Month, x.Year })
                .Select(s => new { s.Key.Name, s.Key.Month, s.Key.Year, Total = s.Sum(f => f.Total) })
                .Union(a3)
                .OrderBy(s => s.Year).ThenBy(s => s.Month)
                ;

                model = b3;
            }
            else
            {

                var a1 = DbContext.GameDetails
                .Where(d => d.Game.CreatedDate.Year == yearForRanking && d.PlayerId > 0)
                .GroupBy(x => new { x.GameId, x.Game.RakeId, x.Player.Name, x.CreatedDate.Year }).ToList().AsQueryable()
                .Select(x => new
                {
                    x.Key.Name,
                    Month = 13,
                    x.Key.Year,
                    BuyIns = x.Sum(s => s.Value),
                    Cashout = x.Sum(c => c.ChipsTotal),
                    RakeId = x.Key.RakeId
                })
                 .OrderBy(s => (s.Name))
                 ;

                var a2 = a1.Select(
                    x => new
                    {
                        Name = x.Name,
                        Month = x.Month,
                        Year = x.Year,
                        RakeId = x.RakeId,
                        Buyins = x.BuyIns,
                        Total = realProfitForRanking ? x.Cashout -
                    (x.Cashout *
                    DbContext.RakeDetails.Where(rd => rd.RakeId == x.RakeId && rd.Value > x.BuyIns).First().Percent
                    / 100)
                    - x.BuyIns : x.Cashout - x.BuyIns
                    }
                ).OrderBy(s => (s.Name));

                var a3 = a2.GroupBy(x => new { x.Name, x.Month, x.Year })
                .Select(s => new { s.Key.Name, s.Key.Month, s.Key.Year, Total = s.Sum(f => f.Total) })
                .OrderByDescending(s => s.Total)
                ;

                var b1 = DbContext.GameDetails
               .Where(d => d.Game.CreatedDate.Year == yearForRanking)
               .GroupBy(x => new { x.GameId, x.Game.RakeId, x.Player.Name, x.CreatedDate.Year, x.Game.CreatedDate.Month }).ToList().AsQueryable()
               .Select(x => new
               {
                   x.Key.Name,
                   x.Key.Month,
                   x.Key.Year,
                   BuyIns = x.Sum(s => s.Value),
                   Cashout = x.Sum(c => c.ChipsTotal),
                   RakeId = x.Key.RakeId
               })
                .OrderBy(s => (s.Name))
                ;

                var b2 = b1.Select(
                    x => new
                    {
                        Name = x.Name,
                        Month = x.Month,
                        Year = x.Year,
                        RakeId = x.RakeId,
                        Buyins = x.BuyIns,
                        Total = realProfitForRanking ? x.Cashout -
                    (x.Cashout *
                    DbContext.RakeDetails.Where(rd => rd.RakeId == x.RakeId && rd.Value > x.BuyIns).First().Percent
                    / 100)
                    - x.BuyIns : x.Cashout - x.BuyIns
                    }
                ).OrderBy(s => (s.Name));

                var b3 = b2.GroupBy(x => new { x.Name, x.Month, x.Year })
                .Select(s => new { s.Key.Name, s.Key.Month, s.Key.Year, Total = s.Sum(f => f.Total) })
                .Union(a3)
                .OrderBy(s => s.Year).ThenBy(s => s.Month)
                ;

                model = b3;

            }



            return new JsonResult(model.Adapt<RankingViewModel[]>(), JsonSettings);
        }

        [HttpPost]
        [Route("EndGame")]
        [Authorize]
        public IActionResult EndGame([FromBody]GameViewModel model)
        {
            var game = DbContext.Games.Where(i => i.Id == model.Id)
                .First();

            if (game == null)
            {
                return NotFound(new
                {
                    Error = String.Format("Game ID {0} nao foi encontrado", model.Id)
                });
            }


            game.Status = StatusEnum.Encerrado;
            game.LastModifiedDate = DateTime.UtcNow;


            DbContext.SaveChanges();

            return new JsonResult(game.Adapt<GameViewModel>(), JsonSettings);


        }




    }
}
