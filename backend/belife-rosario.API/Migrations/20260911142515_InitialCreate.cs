using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace belife_rosario.API.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_administrador_nombre",
                table: "administrador",
                column: "nombre",
                unique: true);

            migrationBuilder.AddCheckConstraint(
                name: "ck_producto_precio_actual",
                table: "producto",
                sql: "precio_actual >= 0");

            migrationBuilder.AddCheckConstraint(
                name: "ck_producto_stock",
                table: "producto",
                sql: "stock >= 0");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_producto_precio_actual",
                table: "producto");

            migrationBuilder.DropCheckConstraint(
                name: "ck_producto_stock",
                table: "producto");

            migrationBuilder.DropIndex(
                name: "IX_administrador_nombre",
                table: "administrador");
        }
    }
}