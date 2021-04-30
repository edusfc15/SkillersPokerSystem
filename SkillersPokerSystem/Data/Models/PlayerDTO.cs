using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace SkillersPokerSystem.Data.Models
{
    public class PlayerDTO
    {
        public PlayerDTO() { }
        public int Id { get; set; }
        public string Name { get; set; }
        public DateTime? FirstGameDate { get; set; }
        public DateTime? LastGameDate { get; set; }
        public int ShowUpCount { get; set;}
        public string ImageUrl { get; set; }
        public int ViewCount { get; set; }
        public bool IsActive { get; set; }

    }
}
