using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace SkillersPokerSystem.Data.Migrations
{
    public partial class Playerdata : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RakeDetails_Rakes_RakeId",
                table: "RakeDetails");

            migrationBuilder.RenameColumn(
                name: "isActive",
                table: "Players",
                newName: "IsActive");

            migrationBuilder.AlterColumn<int>(
                name: "RakeId",
                table: "RakeDetails",
                nullable: false,
                oldClrType: typeof(int),
                oldNullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedDate",
                table: "Players",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddForeignKey(
                name: "FK_RakeDetails_Rakes_RakeId",
                table: "RakeDetails",
                column: "RakeId",
                principalTable: "Rakes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RakeDetails_Rakes_RakeId",
                table: "RakeDetails");

            migrationBuilder.DropColumn(
                name: "CreatedDate",
                table: "Players");

            migrationBuilder.RenameColumn(
                name: "IsActive",
                table: "Players",
                newName: "isActive");

            migrationBuilder.AlterColumn<int>(
                name: "RakeId",
                table: "RakeDetails",
                nullable: true,
                oldClrType: typeof(int));

            migrationBuilder.AddForeignKey(
                name: "FK_RakeDetails_Rakes_RakeId",
                table: "RakeDetails",
                column: "RakeId",
                principalTable: "Rakes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
