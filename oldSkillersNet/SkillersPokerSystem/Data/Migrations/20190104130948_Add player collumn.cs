using Microsoft.EntityFrameworkCore.Migrations;

namespace SkillersPokerSystem.Data.Migrations
{
    public partial class Addplayercollumn : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "Players",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "Players");
        }
    }
}
