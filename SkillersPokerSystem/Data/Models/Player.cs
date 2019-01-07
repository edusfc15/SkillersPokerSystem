using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace SkillersPokerSystem.Data.Models
{
    public class Player
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string Name { get; set; }
        [Required]
        public DateTime CreatedDate { get; set; }

        public DateTime FirstGameDate { get; set; }

        public DateTime LastModifiedDate { get; set; }

        public string ImageUrl { get; set; }

        [Required]
        public int ViewCount { get; set; }

        [Required]
        public string UserId { get; set; }

        [ForeignKey("UserId")]
        public virtual ApplicationUser User { get; set; }

        public virtual List<GameDetail> GameDetails { get; set; }

        public bool IsActive { get; set; }


    }
}
