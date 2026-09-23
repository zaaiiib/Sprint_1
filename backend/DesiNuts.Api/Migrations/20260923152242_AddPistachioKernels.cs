using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DesiNuts.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddPistachioKernels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Products",
                columns: new[] { "Id", "ImageUrl", "Name", "Price1000g", "Price100g", "Price2000g", "Price250g", "Price5000g", "Price500g" },
                values: new object[] { 4, "assets/item4img.png", "Pistachio Kernels (Peeled)", 1250m, 145m, 2440m, 340m, 5950m, 650m });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 4);
        }
    }
}
