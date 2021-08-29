using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Mapster;
using Microsoft.AspNetCore.Authorization;
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
        private IWebHostEnvironment _environment;

        public PlayerController(
            ApplicationDbContext context,
            RoleManager<IdentityRole> roleManager,
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            IConfiguration configuration,
            IWebHostEnvironment environment
            )
            : base(context, roleManager, userManager, configuration)
        {
            _environment = environment;
        }

        [HttpGet("{id}")]
        public IActionResult Get(int id)
        {
            var player = DbContext.Players
                .Include(g => g.GameDetails)
                .Where(i => i.Id == id)
                .Select(x => new
                {
                    x.Id,
                    x.ImageUrl,
                    x.Name,
                    x.IsActive,
                    ShowUpCount = x.GameDetails.GroupBy(a => a.GameId).Count(),
                    FirstGameDate = x.GameDetails.OrderBy(a => a.Game.CreatedDate).FirstOrDefault().Game.CreatedDate == null
                    ? (DateTime?)null
                    : x.GameDetails.OrderBy(a => a.Game.CreatedDate).FirstOrDefault().Game.CreatedDate,
                    LastGameDate = x.GameDetails.OrderByDescending(a => a.Game.CreatedDate).FirstOrDefault().Game.CreatedDate == null
                    ? (DateTime?)null
                    : x.GameDetails.OrderByDescending(a => a.Game.CreatedDate).FirstOrDefault().Game.CreatedDate,

                })
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


        [HttpGet("Active/")]
        public IActionResult Active()
        {
            var active = DbContext.Players
                .Include(g => g.GameDetails)
                .Where(p => p.IsActive)
                .ToArray();
            return new JsonResult(
                active.Adapt<PlayerViewModel[]>(),
                JsonSettings);
        }

        [HttpGet("All/")]
        public async Task<ActionResult<ApiResult<PlayerDTO>>> NewAll(
                int pageIndex = 0,
                int pageSize = 10,
                string sortColumn = null,
                string sortOrder = null,
                string filterColumn = null,
                string filterQuery = null)
        {
            return await ApiResult<PlayerDTO>.CreateAsync(
                    DbContext.Players
                        .Select(x => new PlayerDTO()
                        {
                            Id = x.Id,
                            ImageUrl = x.ImageUrl,
                            Name = x.Name,
                            IsActive = x.IsActive,
                            ShowUpCount = x.GameDetails.GroupBy(a => a.GameId).Count(),
                            FirstGameDate = x.GameDetails.OrderBy(a => a.Game.CreatedDate).FirstOrDefault().Game.CreatedDate,
                            LastGameDate = x.GameDetails.OrderByDescending(a => a.Game.CreatedDate).FirstOrDefault().Game.CreatedDate
                        }),
                    pageIndex,
                    pageSize,
                    sortColumn,
                    sortOrder,
                    filterColumn,
                    filterQuery);
        }


        [Authorize]
        public IActionResult Put([FromBody] PlayerViewModel model)
        {

            if (model == null) return new StatusCodeResult(500);

            var player = model.Adapt<Player>();

            var authorId = User.FindFirst(ClaimTypes.NameIdentifier).Value;

            player.CreatedDate = DateTime.UtcNow;
            player.LastModifiedDate = player.CreatedDate;
            player.IsActive = true;
            player.UserId = authorId;
            player.ImageUrl = "/players/avatar_" + ".png";

            DbContext.Players.Add(player);
            DbContext.SaveChanges();

            return new JsonResult(player.Adapt<PlayerViewModel>()
                , JsonSettings);
        }

        [HttpPost]
        [Authorize]

        public IActionResult Post([FromBody] PlayerViewModel model)
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
