using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Finalproj.Migrations
{
    /// <inheritdoc />
    public partial class ProdutoDataRegisto : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DataRegisto",
                table: "Produtos",
                type: "datetime2",
                nullable: true);

            migrationBuilder.Sql(
                """
                UPDATE Produtos
                SET DataRegisto = SYSUTCDATETIME()
                WHERE DataRegisto IS NULL
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DataRegisto",
                table: "Produtos");
        }
    }
}
