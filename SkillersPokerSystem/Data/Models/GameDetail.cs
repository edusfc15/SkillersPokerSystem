using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace SkillersPokerSystem.Data.Models
{
    public class GameDetail
    {
        [Key]
        [Required]
        public int Id { get; set; }

        [Required]
        public int GameId { get; set; }

        [Required]
        public int PlayerId { get; set; }

        [Required]
        public decimal Value { get; set; }

        [Required]
        public decimal ChipsTotal { get; set; }

        [Required]
        public DateTime CreatedDate { get; set; }

        public DateTime LastModifiedDate { get; set; }
               
        [ForeignKey("GameId")]
        public virtual Game Game { get; set; }

        [ForeignKey("PlayerId")]
        public virtual Player Player { get; set; }

    }
}
