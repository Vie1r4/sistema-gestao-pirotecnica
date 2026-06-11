using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Finalproj.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class ServicoPaiolDataRegisto : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Batches separados: SQL Server valida referências à coluna antes de executar o batch.
            migrationBuilder.Sql(
                """
                IF OBJECT_ID(N'[dbo].[Servicos]', N'U') IS NOT NULL
                   AND COL_LENGTH(N'Servicos', N'DataRegisto') IS NULL
                BEGIN
                    ALTER TABLE [Servicos] ADD [DataRegisto] DATETIME2 NULL;
                END
                """);

            migrationBuilder.Sql(
                """
                UPDATE [Servicos]
                SET [DataRegisto] = CAST([DataServico] AS DATETIME2)
                WHERE [DataRegisto] IS NULL;
                """);

            migrationBuilder.Sql(
                """
                IF OBJECT_ID(N'[dbo].[Paiol]', N'U') IS NOT NULL
                   AND COL_LENGTH(N'Paiol', N'DataRegisto') IS NULL
                BEGIN
                    ALTER TABLE [Paiol] ADD [DataRegisto] DATETIME2 NULL;
                END
                """);

            migrationBuilder.Sql(
                """
                UPDATE [Paiol]
                SET [DataRegisto] = CAST('2000-01-01' AS DATETIME2)
                WHERE [DataRegisto] IS NULL;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DataRegisto",
                table: "Servicos");

            migrationBuilder.DropColumn(
                name: "DataRegisto",
                table: "Paiol");
        }
    }
}
