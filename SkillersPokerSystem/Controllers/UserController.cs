using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Mapster;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using SkillersPokerSystem.Data;
using SkillersPokerSystem.Data.Models;
using SkillersPokerSystem.ViewModels;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace SkillersPokerSystem.Controllers
{
    public class UserController : BaseApiController
    {
        public UserController(
            ApplicationDbContext context,
            RoleManager<IdentityRole> roleManager,
            UserManager<ApplicationUser> userManager,
            IConfiguration configuration
            )
            : base(context, roleManager, userManager, configuration) { }

        [HttpGet("GetAll")]
        public  IActionResult GetAll()
        {
            var users = DbContext.Users.ToList();

            return new JsonResult(
                users.Adapt<UserViewModel[]>(), JsonSettings
                );
        }

        [HttpPut()]
        public async Task<IActionResult> Put([FromBody]UserViewModel model)
        {
            // return a generic HTTP Status 500 (Server Error)
            // if the client payload is invalid.
            if (model == null) return new StatusCodeResult(500);

            // check if the Username/Email already exists
            ApplicationUser user = await UserManager.FindByNameAsync(model.UserName);
            if (user != null) return BadRequest("Username already exists");

            user = await UserManager.FindByEmailAsync(model.Email);
            if (user != null) return BadRequest("Email already exists.");

            if (!PasswordCheck.IsValidPassword(model.Password, UserManager.Options.Password)) return BadRequest("Password is too weak.");


            var now = DateTime.Now;

            // create a new Item with the client-sent json data
            user = new ApplicationUser()
            {
                SecurityStamp = Guid.NewGuid().ToString(),
                UserName = model.UserName,
                Email = model.Email,
                DisplayName = model.DisplayName,
                CreatedDate = now,
                LastModifiedDate = now
            };

            // Add the user to the Db with the choosen password
            await UserManager.CreateAsync(user, model.Password);

            // Assign the user to the 'RegisteredUser' role.
            await UserManager.AddToRoleAsync(user, "RegisteredUser");

            // Remove Lockout and E-Mail confirmation
            user.EmailConfirmed = true;
            user.LockoutEnabled = false;

            // persist the changes into the Database.
            DbContext.SaveChanges();

            // return the newly-created User to the client.
            return Json(user.Adapt<UserViewModel>(),
                JsonSettings);
        }

        public async Task<IActionResult> ChangePassword([FromBody]UserViewModel model)
        {

            ApplicationUser user = await UserManager.FindByNameAsync(model.UserName);

            if (user == null) new StatusCodeResult(500);

            IdentityResult result = await UserManager.ChangePasswordAsync(user, model.Password, model.ConfirmPassword);

            if (!result.Succeeded)
            {
                return new BadRequestResult();
            }


            return new OkResult();
        }


    }
}
