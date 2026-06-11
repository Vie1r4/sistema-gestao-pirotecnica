using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Finalproj.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class ClienteFuncionarioSoftDelete : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "EliminadoEm",
                table: "Funcionarios",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "EliminadoEm",
                table: "Clientes",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EliminadoEm",
                table: "Funcionarios");

            migrationBuilder.DropColumn(
                name: "EliminadoEm",
                table: "Clientes");
        }
    }
}
