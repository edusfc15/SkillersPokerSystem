using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SkillersPokerSystem.ViewModels
{
    [JsonObject(MemberSerialization.OptOut)]
    public class UserViewModel
    {
        public string UserName { get; set; }
        public string Password { get; set; }
        public string OldPassword { get; set; }
        public string ConfirmPassword { get; set; }
        public string Email { get; set; }
        public string DisplayName { get; set; }

    }
}
