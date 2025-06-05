using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Collabdoc.Web.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddClassificationPolicy : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ClassificationPolicy",
                table: "Documents",
                type: "TEXT",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ExpiryDate",
                table: "Documents",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "RequiresApproval",
                table: "Documents",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "RetentionPolicy",
                table: "Documents",
                type: "TEXT",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TemplateId",
                table: "Documents",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Documents",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "ClassificationPolicy", "ExpiryDate", "RequiresApproval", "RetentionPolicy", "TemplateId" },
                values: new object[] { null, null, false, null, null });

            migrationBuilder.UpdateData(
                table: "Documents",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "ClassificationPolicy", "ExpiryDate", "RequiresApproval", "RetentionPolicy", "TemplateId" },
                values: new object[] { null, null, false, null, null });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ClassificationPolicy",
                table: "Documents");

            migrationBuilder.DropColumn(
                name: "ExpiryDate",
                table: "Documents");

            migrationBuilder.DropColumn(
                name: "RequiresApproval",
                table: "Documents");

            migrationBuilder.DropColumn(
                name: "RetentionPolicy",
                table: "Documents");

            migrationBuilder.DropColumn(
                name: "TemplateId",
                table: "Documents");
        }
    }
}
