using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace SkillersPokerSystem.Data.Models
{
    public class GameDTO
    {
        public GameDTO() { }
        public int Id { get; set; }
        public DateTime CreatedDate { get; set; }
        public string Status { get; set; }

        public int NumberOfPlayers { get; set; }

        public Decimal Total { get; set; }
        public string Winner { get; set; }

    }
}
