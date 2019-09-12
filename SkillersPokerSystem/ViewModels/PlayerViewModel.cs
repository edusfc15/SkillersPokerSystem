﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
namespace SkillersPokerSystem.ViewModels
{
    public class PlayerViewModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime FirstGameDate { get; set; }
        public DateTime LastGameDate { get; set; }
        public Boolean IsActive { get; set; }
        public string ImageUrl { get; set; }
		public IFormFile File { get; set;}
        public int ShowUpCount { get; set; }
    }
}
