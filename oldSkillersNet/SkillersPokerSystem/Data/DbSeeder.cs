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
using System.IO;

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
            DateTime lastModifiedDate = DateTime.UtcNow;

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
                Email = "admin@skillerspokerclub.com.br",
                CreatedDate = createdDate,
                LastModifiedDate = lastModifiedDate
            };
            // Insert "Admin" into the Database and assign the "Administrator" and "Registered" roles to him.
            if (await userManager.FindByIdAsync(user_Admin.Id) == null)
            {
                await userManager.CreateAsync(user_Admin, "@SkillerS19");
                await userManager.AddToRoleAsync(user_Admin, role_RegisteredUser);
                await userManager.AddToRoleAsync(user_Admin, role_Administrator);
                // Remove Lockout and E-Mail confirmation.
                user_Admin.EmailConfirmed = true;
                user_Admin.LockoutEnabled = false;
            }




        }

        private static void CreateGames(ApplicationDbContext dbContext)
        {

            dbContext.Database.SetCommandTimeout(360);

            DateTime lastModifiedDate = DateTime.UtcNow;
            // retrieve the admin user, which we'll use as default author.
            var authorId = dbContext.Users
                .Where(u => u.UserName == "Admin")
                .FirstOrDefault()
                .Id;


            var gameList = new List<Array>();

            using( var reader = new StreamReader(@"wwwroot\ImportFiles\games.csv"))
            {
                while (!reader.EndOfStream)
                {
                    var line = reader.ReadLine();
                    var values = line.Split(';');
                    var tempGameList = new List<string>
                {
                    values[0],
                    values[1],
                    values[2],
                    values[3],
                    values[4]
                };

                    gameList.Add(tempGameList.ToArray());

                    tempGameList.Clear();
                }
            }

            var createGame = true;
            var game = new Game();


            foreach (var gameItem in gameList)
            {

                var gameId = Convert.ToInt32(gameItem.GetValue(0));
                var createdDate = DateTime.FromOADate(Convert.ToDouble(gameItem.GetValue(2)));
                

                if (gameId != game.Id && game.Id > 0 )
                {
                    game = new Game();
                    createGame = true;

                }
                
                if (createGame)
                {

                    game.Id = gameId;
                    game.CreatedDate = createdDate;
                    game.LastModifiedDate = lastModifiedDate;
                    game.RakeId = dbContext.Rakes.LastOrDefault().Id;
                    game.UserId = authorId;
                    game.Status = StatusEnum.Encerrado;


                    dbContext.Games.Add(game);
                    dbContext.Database.OpenConnection();

                    dbContext.Database.ExecuteSqlInterpolated($"SET IDENTITY_INSERT Games ON");
                    dbContext.SaveChanges();
                    dbContext.Database.ExecuteSqlInterpolated($"SET IDENTITY_INSERT Games OFF");

                    dbContext.Database.CloseConnection();

                    createGame = false;
                }

                var gameDetailRebuy = new GameDetail()
                {
                    CreatedDate = createdDate,
                    GameId = gameId,
                    LastModifiedDate = lastModifiedDate,
                    PlayerId = Convert.ToInt32(gameItem.GetValue(1)),
                    Value = Convert.ToDecimal(gameItem.GetValue(3))

                };

                dbContext.GameDetails.Add(gameDetailRebuy);
                dbContext.SaveChanges();

                var cashOut = Convert.ToDecimal(gameItem.GetValue(4));

                if (cashOut > 0)
                {
                    var gameDetailCashOut = new GameDetail()
                    {
                        CreatedDate = createdDate,
                        GameId = gameId,
                        LastModifiedDate = lastModifiedDate,
                        PlayerId = Convert.ToInt32(gameItem.GetValue(1)),
                        ChipsTotal = cashOut
                    };

                    dbContext.GameDetails.Add(gameDetailCashOut);
                    dbContext.SaveChanges();

                }


            }



        }

        private static void CreatePlayers(ApplicationDbContext dbContext)
        {

            var playersList = new List<Array>();

            using( var reader = new StreamReader(@"wwwroot\ImportFiles\players.csv"))
            {
                while (!reader.EndOfStream)
                {
                    var line = reader.ReadLine();
                    var values = line.Split(';');
                    var tempPlayerList = new List<string>
                    {
                        values[0],
                        values[1],
                        values[2]
                    };

                    playersList.Add(tempPlayerList.ToArray());

                    tempPlayerList.Clear();
                }
            }

            foreach (var player in playersList)
            {

                var thePlayer = new Player();

                var adminId = dbContext.Users
                .Where(u => u.UserName == "Admin")
                .FirstOrDefault()
                .Id;

                thePlayer.Id = Convert.ToInt32(player.GetValue(0));
                 thePlayer.Name = (string)player.GetValue(1);
                var CreateDate = DateTime.FromOADate(Convert.ToDouble(player.GetValue(2)));
                 thePlayer.CreatedDate = CreateDate;
                thePlayer.ViewCount = 0;
                thePlayer.UserId = adminId;
                thePlayer.LastModifiedDate = DateTime.UtcNow;

                dbContext.Database.OpenConnection();
                dbContext.Add(thePlayer);
                dbContext.Database.ExecuteSqlInterpolated($"SET IDENTITY_INSERT Players ON");
                dbContext.SaveChanges();
                dbContext.Database.ExecuteSqlInterpolated($"SET IDENTITY_INSERT Players OFF");
                dbContext.Database.CloseConnection();

            }

        }
        #endregion

    

        private static void CreateRake(ApplicationDbContext dbContext)
        {



            var rake = new Rake()
            {
                EndDate = new DateTime(2017,2,19)
            };

            dbContext.Rakes.Add(rake);
            dbContext.SaveChanges();

            var rakeDetail1 = new RakeDetail()
            {
                Percent = 20,
                Value = (decimal)29.99,
                RakeId = rake.Id
            };

            var rakeDetail2 = new RakeDetail()
            {
                Percent = 10,
                Value = 999,
                RakeId = rake.Id
            };


            dbContext.RakeDetails.Add(rakeDetail1);
            dbContext.RakeDetails.Add(rakeDetail2);
            dbContext.SaveChanges();

            rake = new Rake()
            {
                EndDate = new DateTime(2017, 2, 18,23,59,59)
            };

            dbContext.Rakes.Add(rake);
            dbContext.SaveChanges();

            rakeDetail1 = new RakeDetail()
            {
                Percent = 10,
                Value = (decimal)999,
                RakeId = rake.Id
            };

            dbContext.RakeDetails.Add(rakeDetail1);
            dbContext.SaveChanges();


            rake= new Rake()
            {
                EndDate = new DateTime(2017,4, 1,23,59,59)
            };

            dbContext.Rakes.Add(rake);
            dbContext.SaveChanges();

            rakeDetail1 = new RakeDetail()
            {
                Percent = 10,
                Value = (decimal)999,
                RakeId = rake.Id
            };

            dbContext.RakeDetails.Add(rakeDetail1);
            dbContext.SaveChanges();

            rake = new Rake()
            {
                EndDate = new DateTime(2017, 6, 9, 23, 59, 59)
            };

            dbContext.Rakes.Add(rake);
            dbContext.SaveChanges();

            rakeDetail1 = new RakeDetail()
            {
                Percent = 20,
                Value = (decimal)29.99,
                RakeId = rake.Id
            };

            rakeDetail2 = new RakeDetail()
            {
                Percent = 10,
                Value = (decimal)999,
                RakeId = rake.Id
            };

            dbContext.RakeDetails.Add(rakeDetail1);
            dbContext.RakeDetails.Add(rakeDetail2);
            dbContext.SaveChanges();

            rake = new Rake()
            {
                EndDate = new DateTime(2017, 9, 3, 23, 59, 59)
            };

            dbContext.Rakes.Add(rake);
            dbContext.SaveChanges();


            rakeDetail1 = new RakeDetail()
            {
                Percent = 20,
                Value = (decimal)29.99,
                RakeId = rake.Id
            };

            rakeDetail2 = new RakeDetail()
            {
                Percent = 10,
                Value = (decimal)999,
                RakeId = rake.Id
            };

            dbContext.RakeDetails.Add(rakeDetail1);
            dbContext.RakeDetails.Add(rakeDetail2);
            dbContext.SaveChanges();


            rake = new Rake()
            {
                EndDate = new DateTime(2017, 9, 23, 23, 59, 59)
            };

            dbContext.Rakes.Add(rake);
            dbContext.SaveChanges();



            rakeDetail1 = new RakeDetail()
            {
                Percent = 20,
                Value = (decimal)999,
                RakeId = rake.Id
            };

            dbContext.RakeDetails.Add(rakeDetail1);
            dbContext.SaveChanges();

            rake = new Rake()
            {
                EndDate = new DateTime(2017, 9, 24, 23, 59, 59)
            };

            dbContext.Rakes.Add(rake);
            dbContext.SaveChanges();



            rakeDetail1 = new RakeDetail()
            {
                Percent = 10,
                Value = (decimal)999,
                RakeId = rake.Id
            };

            dbContext.RakeDetails.Add(rakeDetail1);
            dbContext.SaveChanges();

            rake = new Rake()
            {
                EndDate = new DateTime(2017, 9, 29, 23, 59, 59)
            };

            dbContext.Rakes.Add(rake);
            dbContext.SaveChanges();



            rakeDetail1 = new RakeDetail()
            {
                Percent = 20,
                Value = (decimal)999,
                RakeId = rake.Id
            };

            dbContext.RakeDetails.Add(rakeDetail1);
            dbContext.SaveChanges();

            rake = new Rake()
            {
                EndDate = new DateTime(2017, 10, 8, 23, 59, 59)
            };

            dbContext.Rakes.Add(rake);
            dbContext.SaveChanges();



            rakeDetail1 = new RakeDetail()
            {
                Percent = 10,
                Value = (decimal)999,
                RakeId = rake.Id
            };

            dbContext.RakeDetails.Add(rakeDetail1);
            dbContext.SaveChanges();

            rake = new Rake()
            {
                EndDate = new DateTime(2017, 10, 14, 23, 59, 59)
            };

            dbContext.Rakes.Add(rake);
            dbContext.SaveChanges();



            rakeDetail1 = new RakeDetail()
            {
                Percent = 20,
                Value = (decimal)999,
                RakeId = rake.Id
            };

            dbContext.RakeDetails.Add(rakeDetail1);
            dbContext.SaveChanges();

            rake = new Rake()
            {
                EndDate = new DateTime(2017, 10, 22, 23, 59, 59)
            };

            dbContext.Rakes.Add(rake);
            dbContext.SaveChanges();



            rakeDetail1 = new RakeDetail()
            {
                Percent = 10,
                Value = (decimal)999,
                RakeId = rake.Id
            };

            dbContext.RakeDetails.Add(rakeDetail1);
            dbContext.SaveChanges();

            rake = new Rake()
            {
                EndDate = new DateTime(2017, 11, 5, 23, 59, 59)
            };

            dbContext.Rakes.Add(rake);
            dbContext.SaveChanges();



            rakeDetail1 = new RakeDetail()
            {
                Percent = 20,
                Value = (decimal)999,
                RakeId = rake.Id
            };

            dbContext.RakeDetails.Add(rakeDetail1);
            dbContext.SaveChanges();

            rake = new Rake()
            {
                EndDate = new DateTime(2017, 11, 11, 23, 59, 59)
            };

            dbContext.Rakes.Add(rake);
            dbContext.SaveChanges();



            rakeDetail1 = new RakeDetail()
            {
                Percent = 10,
                Value = (decimal)999,
                RakeId = rake.Id
            };

            dbContext.RakeDetails.Add(rakeDetail1);
            dbContext.SaveChanges();

            rake = new Rake()
            {
                EndDate = new DateTime(2017, 11, 15, 23, 59, 59)
            };

            dbContext.Rakes.Add(rake);
            dbContext.SaveChanges();



            rakeDetail1 = new RakeDetail()
            {
                Percent = 20,
                Value = (decimal)999,
                RakeId = rake.Id
            };

            dbContext.RakeDetails.Add(rakeDetail1);
            dbContext.SaveChanges();

            rake = new Rake()
            {
                EndDate = new DateTime(2018, 4, 6, 23, 59, 59)
            };

            dbContext.Rakes.Add(rake);
            dbContext.SaveChanges();



            rakeDetail1 = new RakeDetail()
            {
                Percent = 10,
                Value = (decimal)999,
                RakeId = rake.Id
            };

            dbContext.RakeDetails.Add(rakeDetail1);
            dbContext.SaveChanges();


            rake = new Rake()
            {
                EndDate = new DateTime(2018, 4, 7, 23, 59, 59)
            };

            dbContext.Rakes.Add(rake);
            dbContext.SaveChanges();



            rakeDetail1 = new RakeDetail()
            {
                Percent = 20,
                Value = (decimal)999,
                RakeId = rake.Id
            };

            dbContext.RakeDetails.Add(rakeDetail1);
            dbContext.SaveChanges();

            rake = new Rake()
            {
                EndDate = new DateTime(2018, 5, 31, 23, 59, 59)
            };

            dbContext.Rakes.Add(rake);
            dbContext.SaveChanges();



            rakeDetail1 = new RakeDetail()
            {
                Percent = 10,
                Value = (decimal)999,
                RakeId = rake.Id
            };

            dbContext.RakeDetails.Add(rakeDetail1);
            dbContext.SaveChanges();

            rake = new Rake()
            {
                EndDate = new DateTime(2018, 6, 19, 23, 59, 59)
            };

            dbContext.Rakes.Add(rake);
            dbContext.SaveChanges();



            rakeDetail1 = new RakeDetail()
            {
                Percent = 20,
                Value = (decimal)999,
                RakeId = rake.Id
            };

            dbContext.RakeDetails.Add(rakeDetail1);
            dbContext.SaveChanges();

            rake = new Rake()
            {
                EndDate = DateTime.MaxValue
            };

            dbContext.Rakes.Add(rake);
            dbContext.SaveChanges();



            rakeDetail1 = new RakeDetail()
            {
                Percent = 10,
                Value = (decimal)999,
                RakeId = rake.Id
            };

            dbContext.RakeDetails.Add(rakeDetail1);
            dbContext.SaveChanges();

        }

    }
}