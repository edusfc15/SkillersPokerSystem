using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using System;
using System.Linq;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Identity;
using System.Threading.Tasks;
using SkillersPokerSystem.Data.Models;
using System.Collections.Generic;

namespace SkillersPokerSystem.Data
{
    public static class DbSeeder
    {
        #region Public Methods
        public static void Seed(
            ApplicationDbContext dbContext,
            RoleManager<IdentityRole> roleManager,
            UserManager<ApplicationUser> userManager
            )
        {
            // Create default Users (if there are none)
            if (!dbContext.Users.Any())
            {
                CreateUsers(dbContext, roleManager, userManager)
                    .GetAwaiter()
                    .GetResult();
            }

            if(!dbContext.RakeDetails.Any()) CreateRake(dbContext);

            // Create default players (if there are none)
            if (!dbContext.Players.Any()) CreatePlayers(dbContext);
            if (!dbContext.Games.Any()) CreateGames(dbContext);

        }





        #endregion

        #region Seed Methods
        private static async Task CreateUsers(
            ApplicationDbContext dbContext,
            RoleManager<IdentityRole> roleManager,
            UserManager<ApplicationUser> userManager)
        {
            // local variables
            DateTime createdDate = new DateTime(2018, 03, 01, 12, 30, 00);
            DateTime lastModifiedDate = DateTime.Now;

            string role_Administrator = "Administrator";
            string role_RegisteredUser = "RegisteredUser";

            //Create Roles (if they doesn't exist yet)
            if (!await roleManager.RoleExistsAsync(role_Administrator))
            {
                await roleManager.CreateAsync(new IdentityRole(role_Administrator));
            }
            if (!await roleManager.RoleExistsAsync(role_RegisteredUser))
            {
                await roleManager.CreateAsync(new IdentityRole(role_RegisteredUser));
            }

            // Create the "Admin" ApplicationUser account
            var user_Admin = new ApplicationUser()
            {
                SecurityStamp = Guid.NewGuid().ToString(),
                UserName = "Admin",
                Email = "admin@testmakerfree.com",
                CreatedDate = createdDate,
                LastModifiedDate = lastModifiedDate
            };
            // Insert "Admin" into the Database and assign the "Administrator" and "Registered" roles to him.
            if (await userManager.FindByIdAsync(user_Admin.Id) == null)
            {
                await userManager.CreateAsync(user_Admin, "Pass4Admin");
                await userManager.AddToRoleAsync(user_Admin, role_RegisteredUser);
                await userManager.AddToRoleAsync(user_Admin, role_Administrator);
                // Remove Lockout and E-Mail confirmation.
                user_Admin.EmailConfirmed = true;
                user_Admin.LockoutEnabled = false;
            }




        }

        private static void CreateGames(ApplicationDbContext dbContext)
        {
            DateTime createdDate = new DateTime(2018, 08, 08, 12, 30, 00);
            DateTime lastModifiedDate = DateTime.Now;
            // retrieve the admin user, which we'll use as default author.
            var authorId = dbContext.Users
                .Where(u => u.UserName == "Admin")
                .FirstOrDefault()
                .Id;

#if DEBUG
            // create 47 sample games with auto-generated data
            // (including gamedetail, and rakes)
            var num = 47;
            for (int i = 1; i <= num; i++)
            {
                CreateSampleGame(
                    dbContext,
                    i,
                    authorId,
                    num - i,
                    20,
                    3,
                    3,
                    createdDate.AddDays(-num));
            }
#endif
        }

        private static void CreatePlayers(ApplicationDbContext dbContext)
        {

            DateTime createdDate = new DateTime(2018, 08, 08, 12, 30, 00);
            // retrieve the admin user, which we'll use as default author.
            var authorId = dbContext.Users
                .Where(u => u.UserName == "Admin")
                .FirstOrDefault()
                .Id;

#if DEBUG
            // create 47 sample players with auto-generated data
            var num = 47;
            for (int i = 1; i <= num; i++)
            {
                CreateSamplePlayer(
                    dbContext,
                    i,
                    authorId,
                    num - i,
                    createdDate.AddDays(-num));
            }
#endif

        }
        #endregion

        private static void CreateSamplePlayer(
           ApplicationDbContext dbContext,
           int num,
           string authorId,
           int viewCount,
           DateTime createdDate)
        {
            var player = new Player()
            {
                UserId = authorId,
                Name = String.Format("Player {0} ", num),
                ViewCount = viewCount,
                FirstGameDate = createdDate,
                LastModifiedDate = createdDate
            };
            dbContext.Players.Add(player);
            dbContext.SaveChanges();

        }

        private static void CreateRake(ApplicationDbContext dbContext)
        {
            var rake = new Rake()
            {
                EndDate = DateTime.MaxValue
            };

            dbContext.Rakes.Add(rake);
            dbContext.SaveChanges();

            var rakeDetails = new RakeDetail()
            {
                Percent = 10,
                Value = 999,
                RakeId = rake.Id
            };

        }


        private static void CreateSampleGame(
            ApplicationDbContext dbContext,
            int num,
            string authorId,
            int viewCount,
            int numberOfGameDetails,
            int numberOfAnswersPerQuestion,
            int numberOfResults,
            DateTime createdDate)
        {

            Random random = new Random();
            List<Player> tablePlayers = new List<Player>();
            tablePlayers = dbContext.Players.Take(9).ToList();

            var game = new Game()
            {
                UserId = authorId,
                Date = createdDate,
                RakeId = 1,
                ViewCount = viewCount,
                CreatedDate = createdDate,
                LastModifiedDate = createdDate,
                Status = StatusEnum.Encerrado
            };
            dbContext.Games.Add(game);
            dbContext.SaveChanges();

            for (int i = 0; i < numberOfGameDetails; i++)
            {
                var gameDetail = new GameDetail()
                {
                    GameId = game.Id,
                    PlayerId = tablePlayers[random.Next(tablePlayers.Count)].Id,
                    Value = 5,
                    CreatedDate = createdDate,
                    LastModifiedDate = createdDate
                };
                dbContext.GameDetails.Add(gameDetail);
                dbContext.SaveChanges();

            }


            dbContext.SaveChanges();
        }
    }
}