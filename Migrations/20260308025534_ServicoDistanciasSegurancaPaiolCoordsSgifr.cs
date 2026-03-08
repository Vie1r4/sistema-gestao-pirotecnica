using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Finalproj.Migrations
{
    /// <inheritdoc />
    public partial class ServicoDistanciasSegurancaPaiolCoordsSgifr : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<decimal>(
                name: "CoordenadasLng",
                table: "Servicos",
                type: "decimal(18,9)",
                precision: 18,
                scale: 9,
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "CoordenadasLat",
                table: "Servicos",
                type: "decimal(18,9)",
                precision: 18,
                scale: 9,
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)",
                oldNullable: true);

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

            migrationBuilder.AddColumn<decimal>(
                name: "CoordenadasLat",
                table: "Paiol",
                type: "decimal(18,9)",
                precision: 18,
                scale: 9,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "CoordenadasLng",
                table: "Paiol",
                type: "decimal(18,9)",
                precision: 18,
                scale: 9,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ServicoDistanciasSeguranca",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ServicoId = table.Column<int>(type: "int", nullable: false),
                    TipoReferencia = table.Column<int>(type: "int", nullable: false),
                    DescricaoReferencia = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    DistanciaMinima_m = table.Column<int>(type: "int", nullable: false),
                    DistanciaMedida_m = table.Column<int>(type: "int", nullable: true),
                    Observacoes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServicoDistanciasSeguranca", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ServicoDistanciasSeguranca_Servicos_ServicoId",
                        column: x => x.ServicoId,
                        principalTable: "Servicos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ServicoDistanciasSeguranca_ServicoId",
                table: "ServicoDistanciasSeguranca",
                column: "ServicoId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ServicoDistanciasSeguranca");

            migrationBuilder.DropColumn(
                name: "SgifirFonte",
                table: "Servicos");

            migrationBuilder.DropColumn(
                name: "SgifirIndice",
                table: "Servicos");

            migrationBuilder.DropColumn(
                name: "SgifirVerificadoEm",
                table: "Servicos");

            migrationBuilder.DropColumn(
                name: "CoordenadasLat",
                table: "Paiol");

            migrationBuilder.DropColumn(
                name: "CoordenadasLng",
                table: "Paiol");

            migrationBuilder.AlterColumn<decimal>(
                name: "CoordenadasLng",
                table: "Servicos",
                type: "decimal(18,2)",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,9)",
                oldPrecision: 18,
                oldScale: 9,
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "CoordenadasLat",
                table: "Servicos",
                type: "decimal(18,2)",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,9)",
                oldPrecision: 18,
                oldScale: 9,
                oldNullable: true);
        }
    }
}
