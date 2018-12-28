using Microsoft.EntityFrameworkCore.Migrations;

namespace SkillersPokerSystem.Data.Migrations
{
    public partial class atualizaPlayer : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "isActive",
                table: "Players",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "isActive",
                table: "Players");
        }
    }
}
