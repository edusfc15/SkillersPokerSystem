using SkillersPokerSystem.Data.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SkillersPokerSystem.ViewModels
{//
    public class GameDetailViewModel
    {
        public int Id { get; set; }
        public int PlayerId { get; set; }
        public int GameId { get; set; }
        public string Name { get; set; }
        public DateTime CreatedDate { get; set; }
        public decimal Value { get; set; }
        public decimal ChipsTotal { get; set; }
        public decimal Result { get; set; }
        public decimal Rake { get; set; }
        public decimal Total { get; set; }
        public decimal ProfitOrLoss { get; set; }

    }
}
