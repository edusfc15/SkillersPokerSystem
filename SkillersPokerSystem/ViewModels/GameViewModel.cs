using SkillersPokerSystem.Data.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SkillersPokerSystem.ViewModels
{
    public class GameViewModel
    {
        public int Id { get; set; }
        public int GameId { get; set; }
        public DateTime Date { get; set; }
        public int NumberOfPlayers { get; set; }
        public int Total { get; set; }
        public string Winner { get; set; }
        public string Status { get; set; }

    }
}
