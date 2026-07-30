using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Finalproj.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class CriarIndiceFifoEntradasPaiol : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_EntradasPaiol_PaiolId",
                table: "EntradasPaiol");

            migrationBuilder.CreateIndex(
                name: "IX_EntradasPaiol_PaiolId_ProdutoId_Datas",
                table: "EntradasPaiol",
                columns: new[] { "PaiolId", "ProdutoId", "DataFabrico", "DataEntrada" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_EntradasPaiol_PaiolId_ProdutoId_Datas",
                table: "EntradasPaiol");

            migrationBuilder.CreateIndex(
                name: "IX_EntradasPaiol_PaiolId",
                table: "EntradasPaiol",
                column: "PaiolId");
        }
    }
}
