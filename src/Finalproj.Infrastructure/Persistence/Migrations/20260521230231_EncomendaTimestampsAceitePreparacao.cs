using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Finalproj.Migrations
{
    /// <inheritdoc />
    public partial class EncomendaTimestampsAceitePreparacao : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DataAceite",
                table: "Encomendas",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DataEmPreparacao",
                table: "Encomendas",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "DataAceite", table: "Encomendas");
            migrationBuilder.DropColumn(name: "DataEmPreparacao", table: "Encomendas");
        }
    }
}
