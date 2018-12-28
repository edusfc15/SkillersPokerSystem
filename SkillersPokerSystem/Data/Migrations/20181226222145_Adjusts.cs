using Microsoft.EntityFrameworkCore.Migrations;

namespace SkillersPokerSystem.Data.Migrations
{
    public partial class Adjusts : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<decimal>(
                name: "ChipsTotal",
                table: "GameDetails",
                nullable: false,
                oldClrType: typeof(int));
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "ChipsTotal",
                table: "GameDetails",
                nullable: false,
                oldClrType: typeof(decimal));
        }
    }
}
