using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Finalproj.Migrations
{
    /// <inheritdoc />
    public partial class ServicoLicencaOrigemRegisto : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                IF OBJECT_ID(N'[dbo].[ServicoLicencas]', N'U') IS NOT NULL
                   AND COL_LENGTH(N'ServicoLicencas', N'OrigemRegisto') IS NULL
                BEGIN
                    ALTER TABLE [ServicoLicencas] ADD [OrigemRegisto] TINYINT NOT NULL CONSTRAINT DF_ServicoLicencas_OrigemRegisto DEFAULT 1;
                END
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                IF OBJECT_ID(N'[dbo].[ServicoLicencas]', N'U') IS NOT NULL
                   AND COL_LENGTH(N'ServicoLicencas', N'OrigemRegisto') IS NOT NULL
                BEGIN
                    DECLARE @ConstraintName NVARCHAR(128);
                    SELECT @ConstraintName = dc.name
                    FROM sys.default_constraints dc
                    INNER JOIN sys.columns c ON c.default_object_id = dc.object_id
                    INNER JOIN sys.tables t ON t.object_id = c.object_id
                    WHERE t.name = N'ServicoLicencas' AND c.name = N'OrigemRegisto';

                    IF @ConstraintName IS NOT NULL
                    BEGIN
                        EXEC(N'ALTER TABLE [ServicoLicencas] DROP CONSTRAINT [' + @ConstraintName + N']');
                    END

                    ALTER TABLE [ServicoLicencas] DROP COLUMN [OrigemRegisto];
                END
                """);
        }
    }
}
