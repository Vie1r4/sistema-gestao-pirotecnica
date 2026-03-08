using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Finalproj.Migrations
{
    /// <inheritdoc />
    public partial class ServicoLocalizacaoCampos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "CoordenadasLat",
                table: "Servicos",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "CoordenadasLng",
                table: "Servicos",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Distrito",
                table: "Servicos",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MoradaCompleta",
                table: "Servicos",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Municipio",
                table: "Servicos",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RaioPublico",
                table: "Servicos",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CoordenadasLat",
                table: "Servicos");

            migrationBuilder.DropColumn(
                name: "CoordenadasLng",
                table: "Servicos");

            migrationBuilder.DropColumn(
                name: "Distrito",
                table: "Servicos");

            migrationBuilder.DropColumn(
                name: "MoradaCompleta",
                table: "Servicos");

            migrationBuilder.DropColumn(
                name: "Municipio",
                table: "Servicos");

            migrationBuilder.DropColumn(
                name: "RaioPublico",
                table: "Servicos");
        }
    }
}
