using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace SkillersPokerSystem.Data.Models
{
    public class RakeDetail
    {
        [Key]
        [Required]
        public int Id { get; set; }
        [Required]
        public int RakeId { get; set; }
        [Required]
        public decimal Value { get; set; }
        public decimal Percent { get; set; }

        [ForeignKey("RakeId")]
        public virtual Rake Rake { get; set; }
    }
}
