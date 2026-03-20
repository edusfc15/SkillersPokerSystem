using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace SkillersPokerSystem.Data.Models
{
    public class Rake
    {
        [Key]
        [Required]
        public int Id { get; set; }
        [Required]
        public DateTime EndDate { get; set; }

        public virtual List<Game> Games { get; set; }
        public virtual List<RakeDetail> RakeDetails{ get; set; }


    }
}
