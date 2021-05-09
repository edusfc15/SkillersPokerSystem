using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using SkillersPokerSystem.Data;
using SkillersPokerSystem.Data.Models;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace SkillersPokerSystem.Controllers
{
    [Route("api/[controller]")]
    public class BaseApiController : Controller
    {
        #region Constructor
        public BaseApiController(
            ApplicationDbContext context,
            RoleManager<IdentityRole> roleManager,
            UserManager<ApplicationUser> userManager,
            IConfiguration configuration
            )
        {
            // Instantiate the required classes through DI
            DbContext = context;
            RoleManager = roleManager;
            UserManager = userManager;
            Configuration = configuration;

            // Instantiate a single JsonSerializerSettings object
            // that can be reused multiple times.
            JsonSettings = new JsonSerializerOptions()
            {
                WriteIndented = true,
            };

        }
        #endregion

        [HttpGet("SetActive")]
        public IActionResult SetActive()
        {
            var lastGames = DbContext
                .GameDetails
                .Select( g => new { g.GameId})
                .Distinct()
                .OrderByDescending( g => g.GameId)
                .Take(5)
                .Select( g => g.GameId)
                .ToList();

            var activePlayers = DbContext.GameDetails
                .Where(a => lastGames.Contains( a.GameId))
                .GroupBy(a => a.PlayerId)
                .Select(a => a.Key)
                .ToList()
                ;

            DbContext.Database.ExecuteSqlInterpolated($"UPDATE Players SET IsActive = 0");

            foreach (var player in activePlayers)
            {

                var tmpPlayer = DbContext.Players.Where(x => x.Id == player).FirstOrDefault();

                tmpPlayer.IsActive = true;
                DbContext.SaveChanges();

            }

            return new OkResult();
        }

        #region Shared Properties
        protected ApplicationDbContext DbContext { get; private set; }
        protected RoleManager<IdentityRole> RoleManager { get; private set; }
        protected UserManager<ApplicationUser> UserManager { get; private set; }
        protected IConfiguration Configuration { get; private set; }
        protected JsonSerializerOptions JsonSettings { get; private set; }
        #endregion
    }
}
