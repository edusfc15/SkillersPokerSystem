using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Mapster;
using Microsoft.AspNetCore.Hosting;
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
    public class PlayerController : BaseApiController
    {
        private IHostingEnvironment _environment;

        public PlayerController(
            ApplicationDbContext context,
            RoleManager<IdentityRole> roleManager,
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            IConfiguration configuration,
            IHostingEnvironment environment
            )
            : base(context, roleManager, userManager, configuration)
        {
            _environment = environment;
        }

        [HttpGet("{id}")]
        public IActionResult Get(int id)
        {
            var player = DbContext.Players.Where(i => i.Id == id)
                .FirstOrDefault();

            if (player == null)
            {
                return NotFound(new
                {
                    Error = String.Format("Player ID {0} has not been found", id)
                });
            }

            return new JsonResult(
                player.Adapt<PlayerViewModel>(),
                JsonSettings);
        }

        [HttpGet("SetActive")]
        public IActionResult SetActive()
        {
            var lastGames = DbContext
                .GameDetails
                .GroupBy(g => new { g.GameId })
                .OrderByDescending(s => s.Max().CreatedDate)
                .Take(5)
                .Select(x => x.Key.GameId)
                .ToList();

            var activePlayers = DbContext.GameDetails
                .Where(a => lastGames.Contains(a.GameId))
                .GroupBy(a => a.PlayerId)
                .Select(a => a.Key)
                .ToList()
                ;
            
            DbContext.Database.ExecuteSqlCommand("UPDATE Players SET IsActive = 0");

            var random = new Random();

            foreach (var player in activePlayers)
            {

                var tmpPlayer = DbContext.Players.Where(x => x.Id == player).FirstOrDefault();
                
                tmpPlayer.IsActive = true;
                DbContext.SaveChanges();

            }

            return new OkResult();
        }


        [HttpGet("Active/")]
        public IActionResult Active()
        {
            var active = DbContext.Players
                .Include( g => g.GameDetails)
                .Where( p => p.IsActive )
                .ToArray();
            return new JsonResult(
                active.Adapt<PlayerViewModel[]>(),
                JsonSettings);
        }

        [HttpGet("All/")]
        public IActionResult All()
        {
            
            var all = DbContext.Players
                .Include(g => g.GameDetails)
                .GroupBy(x => new { x.Id, x.Name, x.IsActive })
                .Select(x => new {
                    x.Key.Id,
                    x.Key.Name,
                    x.Key.IsActive,
                    FirstGameDate = (DateTime?) null,
                    LastGameDate = (DateTime?) null,
                    CreatedDate = x.Max( s => s.CreatedDate)
                } )
                //.OrderByDescending( s => s.LastGameDate )
                .ToArray();
            return new JsonResult(
                all.Adapt<PlayerViewModel[]>(),
                JsonSettings);
        }


        public IActionResult Put([FromBody]PlayerViewModel model)
        {

            if (model == null) return new StatusCodeResult(500);


            var player = model.Adapt<Player>();

            var authorId = DbContext.Users
                .Where(u => u.UserName == "Admin")
                .FirstOrDefault()
                .Id;

            player.CreatedDate = DateTime.UtcNow;
            player.LastModifiedDate = player.CreatedDate;

            player.UserId = authorId;
            player.ImageUrl = "/players/avatar_" + "png";

            // retrieve the current user's Id
            //player.UserId = User.FindFirst(ClaimTypes.NameIdentifier).Value;

            DbContext.Players.Add(player);
            DbContext.SaveChanges();

            return new JsonResult(player.Adapt<PlayerViewModel>()
                , JsonSettings);
        }

        [HttpPost]

        public IActionResult Post([FromBody]PlayerViewModel model)
        {

            if (model == null) return new StatusCodeResult(500);


            var player = DbContext.Players.Where(q => q.Id ==
                        model.Id).FirstOrDefault();

            if (player == null)
            {
                return NotFound(new
                {
                    Error = String.Format("Player ID {0} has not been found", model.Id)
                });
            }

            player.Name = model.Name;
            player.IsActive = model.IsActive;
            player.ImageUrl = model.ImageUrl;
            player.LastModifiedDate = DateTime.UtcNow;

            DbContext.SaveChanges();

            return new JsonResult(player.Adapt<PlayerViewModel>()
                , JsonSettings);
        }

    }
}
