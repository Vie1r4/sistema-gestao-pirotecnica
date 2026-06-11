using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Finalproj.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class ProdutoDistanciaSegurancaPublico : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DistanciaSegurancaPublico_m",
                table: "Produtos",
                type: "int",
                nullable: false,
                defaultValue: 50);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DistanciaSegurancaPublico_m",
                table: "Produtos");
        }
    }
}
