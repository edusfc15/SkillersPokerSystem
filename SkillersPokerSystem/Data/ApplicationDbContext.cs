using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SkillersPokerSystem.Data.Models;
using System;

namespace SkillersPokerSystem.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        #region Constructor
        public ApplicationDbContext(DbContextOptions options) : base(options)
        {
        }
        #endregion Constructor

        #region Methods
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<ApplicationUser>().ToTable("Users");
            modelBuilder.Entity<ApplicationUser>().HasMany(u => u.Tokens).WithOne(i => i.User);
                        
            modelBuilder.Entity<Game>().ToTable("Games")
                .Property(e => e.Status).HasConversion(
                                            v => v.ToString(),
                                            v => (StatusEnum)Enum.Parse(typeof(StatusEnum), v)
                                        );
            modelBuilder.Entity<Game>().Property(i => i.Id).ValueGeneratedOnAdd();
            modelBuilder.Entity<Game>().HasOne(i => i.User).WithMany(u => u.Games);
            modelBuilder.Entity<Game>().HasMany(i => i.GameDetails).WithOne(c => c.Game);

            modelBuilder.Entity<GameDetail>().ToTable("GameDetails");
            modelBuilder.Entity<GameDetail>().Property(i => i.Id).ValueGeneratedOnAdd();
            modelBuilder.Entity<GameDetail>().HasOne(i => i.Game).WithMany(u => u.GameDetails).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Player>().ToTable("Players");
            modelBuilder.Entity<Player>().Property(i => i.Id).ValueGeneratedOnAdd();
            modelBuilder.Entity<Player>().HasMany(i => i.GameDetails).WithOne(c => c.Player);
            modelBuilder.Entity<Player>().HasOne(i => i.User).WithMany(u => u.Players);

            modelBuilder.Entity<Rake>().ToTable("Rakes");
            modelBuilder.Entity<Rake>().Property(i => i.Id).ValueGeneratedOnAdd();
            modelBuilder.Entity<Rake>().HasMany(i => i.Games).WithOne(t => t.Rake);
            modelBuilder.Entity<Rake>().HasMany(i => i.RakeDetails).WithOne(c => c.Rake);

            modelBuilder.Entity<RakeDetail>().ToTable("RakeDetails");
            modelBuilder.Entity<RakeDetail>().Property(i => i.Id).ValueGeneratedOnAdd();
            modelBuilder.Entity<RakeDetail>().HasOne(i => i.Rake).WithMany(u => u.RakeDetails);

            modelBuilder.Entity<Token>().ToTable("Tokens");
            modelBuilder.Entity<Token>().Property(i => i.Id).ValueGeneratedOnAdd();
            modelBuilder.Entity<Token>().HasOne(i => i.User).WithMany(u => u.Tokens);
        }
        #endregion Methods

        #region Properties
        public DbSet<Token> Tokens { get; set; }
        public DbSet<Player> Players { get; set; }
        public DbSet<Game> Games { get; set; }
        public DbSet<GameDetail> GameDetails { get; set; }
        public DbSet<Rake> Rakes { get; set; }
        public DbSet<RakeDetail> RakeDetails { get; set; }

        #endregion Properties
    }
}
