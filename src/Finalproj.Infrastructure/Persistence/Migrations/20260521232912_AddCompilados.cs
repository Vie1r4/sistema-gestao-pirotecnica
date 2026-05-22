using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Finalproj.Migrations
{
    /// <inheritdoc />
    public partial class AddCompilados : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Compilados",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nome = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Compilados", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CompiladoItens",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompiladoId = table.Column<int>(type: "int", nullable: false),
                    ProdutoId = table.Column<int>(type: "int", nullable: false),
                    QuantidadePorUnidade = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompiladoItens", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CompiladoItens_Compilados_CompiladoId",
                        column: x => x.CompiladoId,
                        principalTable: "Compilados",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CompiladoItens_Produtos_ProdutoId",
                        column: x => x.ProdutoId,
                        principalTable: "Produtos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CompiladoItens_CompiladoId_ProdutoId",
                table: "CompiladoItens",
                columns: new[] { "CompiladoId", "ProdutoId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CompiladoItens_ProdutoId",
                table: "CompiladoItens",
                column: "ProdutoId");

            migrationBuilder.CreateIndex(
                name: "IX_Compilados_Nome",
                table: "Compilados",
                column: "Nome");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CompiladoItens");

            migrationBuilder.DropTable(
                name: "Compilados");
        }
    }
}
