using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Finalproj.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class ServicoZonasLancamentoEventoCampos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CoordenadorPirotecnicoId",
                table: "Servicos",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NomeEvento",
                table: "Servicos",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Categoria",
                table: "Produtos",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NumeroCredencial",
                table: "Funcionarios",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Nome",
                table: "Encomendas",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ServicoZonasLancamento",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ServicoId = table.Column<int>(type: "int", nullable: false),
                    Designacao = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    CoordenadasLat = table.Column<decimal>(type: "decimal(18,9)", precision: 18, scale: 9, nullable: true),
                    CoordenadasLng = table.Column<decimal>(type: "decimal(18,9)", precision: 18, scale: 9, nullable: true),
                    RaioPublico = table.Column<int>(type: "int", nullable: true),
                    ResponsavelPirotecnicoId = table.Column<int>(type: "int", nullable: true),
                    Observacoes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServicoZonasLancamento", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ServicoZonasLancamento_Funcionarios_ResponsavelPirotecnicoId",
                        column: x => x.ResponsavelPirotecnicoId,
                        principalTable: "Funcionarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ServicoZonasLancamento_Servicos_ServicoId",
                        column: x => x.ServicoId,
                        principalTable: "Servicos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ServicoZonaDistanciasSeguranca",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ZonaId = table.Column<int>(type: "int", nullable: false),
                    TipoReferencia = table.Column<int>(type: "int", nullable: false),
                    DescricaoReferencia = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    DistanciaMinima_m = table.Column<int>(type: "int", nullable: false),
                    DistanciaMedida_m = table.Column<int>(type: "int", nullable: true),
                    Observacoes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServicoZonaDistanciasSeguranca", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ServicoZonaDistanciasSeguranca_ServicoZonasLancamento_ZonaId",
                        column: x => x.ZonaId,
                        principalTable: "ServicoZonasLancamento",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ServicoZonaLinhas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ZonaId = table.Column<int>(type: "int", nullable: false),
                    Data = table.Column<DateTime>(type: "datetime2", nullable: false),
                    HoraInicio = table.Column<TimeSpan>(type: "time", nullable: true),
                    HoraFim = table.Column<TimeSpan>(type: "time", nullable: true),
                    ProdutoId = table.Column<int>(type: "int", nullable: false),
                    Quantidade = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServicoZonaLinhas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ServicoZonaLinhas_Produtos_ProdutoId",
                        column: x => x.ProdutoId,
                        principalTable: "Produtos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ServicoZonaLinhas_ServicoZonasLancamento_ZonaId",
                        column: x => x.ZonaId,
                        principalTable: "ServicoZonasLancamento",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Servicos_CoordenadorPirotecnicoId",
                table: "Servicos",
                column: "CoordenadorPirotecnicoId");

            migrationBuilder.CreateIndex(
                name: "IX_ServicoZonaDistanciasSeguranca_ZonaId",
                table: "ServicoZonaDistanciasSeguranca",
                column: "ZonaId");

            migrationBuilder.CreateIndex(
                name: "IX_ServicoZonaLinhas_ProdutoId",
                table: "ServicoZonaLinhas",
                column: "ProdutoId");

            migrationBuilder.CreateIndex(
                name: "IX_ServicoZonaLinhas_ZonaId",
                table: "ServicoZonaLinhas",
                column: "ZonaId");

            migrationBuilder.CreateIndex(
                name: "IX_ServicoZonasLancamento_ResponsavelPirotecnicoId",
                table: "ServicoZonasLancamento",
                column: "ResponsavelPirotecnicoId");

            migrationBuilder.CreateIndex(
                name: "IX_ServicoZonasLancamento_ServicoId",
                table: "ServicoZonasLancamento",
                column: "ServicoId");

            migrationBuilder.AddForeignKey(
                name: "FK_Servicos_Funcionarios_CoordenadorPirotecnicoId",
                table: "Servicos",
                column: "CoordenadorPirotecnicoId",
                principalTable: "Funcionarios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Servicos_Funcionarios_CoordenadorPirotecnicoId",
                table: "Servicos");

            migrationBuilder.DropTable(
                name: "ServicoZonaDistanciasSeguranca");

            migrationBuilder.DropTable(
                name: "ServicoZonaLinhas");

            migrationBuilder.DropTable(
                name: "ServicoZonasLancamento");

            migrationBuilder.DropIndex(
                name: "IX_Servicos_CoordenadorPirotecnicoId",
                table: "Servicos");

            migrationBuilder.DropColumn(
                name: "CoordenadorPirotecnicoId",
                table: "Servicos");

            migrationBuilder.DropColumn(
                name: "NomeEvento",
                table: "Servicos");

            migrationBuilder.DropColumn(
                name: "Categoria",
                table: "Produtos");

            migrationBuilder.DropColumn(
                name: "NumeroCredencial",
                table: "Funcionarios");

            migrationBuilder.DropColumn(
                name: "Nome",
                table: "Encomendas");
        }
    }
}
