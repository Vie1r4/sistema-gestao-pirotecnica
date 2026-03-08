using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Finalproj.Migrations
{
    /// <inheritdoc />
    public partial class RemoveSgifrFromServico : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SgifirFonte",
                table: "Servicos");

            migrationBuilder.DropColumn(
                name: "SgifirIndice",
                table: "Servicos");

            migrationBuilder.DropColumn(
                name: "SgifirVerificadoEm",
                table: "Servicos");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "SgifirFonte",
                table: "Servicos",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SgifirIndice",
                table: "Servicos",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "SgifirVerificadoEm",
                table: "Servicos",
                type: "datetime2",
                nullable: true);
        }
    }
}
