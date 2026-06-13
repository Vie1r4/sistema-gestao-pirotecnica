using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Finalproj.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class CatalogoCalibresMm : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                UPDATE [Produtos] SET [Calibre] = N'20_25_30MM' WHERE [Calibre] IN (N'MuitoPequeno', N'BateriasPadrao');
                UPDATE [Produtos] SET [Calibre] = N'50MM' WHERE [Calibre] = N'BombasPequenas';
                UPDATE [Produtos] SET [Calibre] = N'100MM' WHERE [Calibre] = N'BombasMedias';
                UPDATE [Produtos] SET [Calibre] = N'150MM' WHERE [Calibre] = N'BombasGrandes';
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                UPDATE [Produtos] SET [Calibre] = N'BateriasPadrao' WHERE [Calibre] = N'20_25_30MM';
                UPDATE [Produtos] SET [Calibre] = N'BombasPequenas' WHERE [Calibre] IN (N'50MM', N'65MM', N'75MM');
                UPDATE [Produtos] SET [Calibre] = N'BombasMedias' WHERE [Calibre] IN (N'100MM', N'120MM');
                UPDATE [Produtos] SET [Calibre] = N'BombasGrandes' WHERE [Calibre] = N'150MM';
                """);
        }
    }
}
