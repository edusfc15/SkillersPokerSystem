using Microsoft.EntityFrameworkCore.Migrations;

namespace SkillersPokerSystem.Data.Migrations
{
    public partial class NumberOfHandsandIsPaidcollumnsadd : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "NumberOfHands",
                table: "Games",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsPaid",
                table: "GameDetails",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NumberOfHands",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "IsPaid",
                table: "GameDetails");
        }
    }
}
