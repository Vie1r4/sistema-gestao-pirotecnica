using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Finalproj.Migrations
{
    /// <inheritdoc />
    public partial class PaiolCoordenadasPrecision14 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<decimal>(
                name: "CoordenadasLng",
                table: "Paiol",
                type: "decimal(18,14)",
                precision: 18,
                scale: 14,
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,9)",
                oldPrecision: 18,
                oldScale: 9,
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "CoordenadasLat",
                table: "Paiol",
                type: "decimal(18,14)",
                precision: 18,
                scale: 14,
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,9)",
                oldPrecision: 18,
                oldScale: 9,
                oldNullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<decimal>(
                name: "CoordenadasLng",
                table: "Paiol",
                type: "decimal(18,9)",
                precision: 18,
                scale: 9,
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,14)",
                oldPrecision: 18,
                oldScale: 14,
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "CoordenadasLat",
                table: "Paiol",
                type: "decimal(18,9)",
                precision: 18,
                scale: 9,
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,14)",
                oldPrecision: 18,
                oldScale: 14,
                oldNullable: true);
        }
    }
}
