using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Collabdoc.Web.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialSQLiteCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Documents",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    DocumentId = table.Column<string>(type: "TEXT", maxLength: 36, nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 255, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    FileType = table.Column<string>(type: "TEXT", maxLength: 10, nullable: false),
                    Size = table.Column<long>(type: "INTEGER", nullable: false),
                    Content = table.Column<string>(type: "TEXT", nullable: false),
                    CreatedBy = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    LastModifiedBy = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "datetime('now')"),
                    LastModified = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "datetime('now')"),
                    Status = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    Category = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    Tags = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    IsTemplate = table.Column<bool>(type: "INTEGER", nullable: false),
                    IsPublic = table.Column<bool>(type: "INTEGER", nullable: false),
                    Version = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Documents", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DocumentComments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    DocumentId = table.Column<int>(type: "INTEGER", nullable: false),
                    Content = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: false),
                    Author = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "datetime('now')"),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    IsResolved = table.Column<bool>(type: "INTEGER", nullable: false),
                    ParentCommentId = table.Column<int>(type: "INTEGER", nullable: true),
                    ElementId = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DocumentComments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DocumentComments_DocumentComments_ParentCommentId",
                        column: x => x.ParentCommentId,
                        principalTable: "DocumentComments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DocumentComments_Documents_DocumentId",
                        column: x => x.DocumentId,
                        principalTable: "Documents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DocumentShares",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    DocumentId = table.Column<int>(type: "INTEGER", nullable: false),
                    SharedWith = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Permission = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    SharedBy = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    SharedAt = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "datetime('now')"),
                    ExpiresAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DocumentShares", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DocumentShares_Documents_DocumentId",
                        column: x => x.DocumentId,
                        principalTable: "Documents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DocumentVersions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    DocumentId = table.Column<int>(type: "INTEGER", nullable: false),
                    VersionNumber = table.Column<int>(type: "INTEGER", nullable: false),
                    Content = table.Column<string>(type: "TEXT", nullable: false),
                    ChangeDescription = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    CreatedBy = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "datetime('now')"),
                    Size = table.Column<long>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DocumentVersions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DocumentVersions_Documents_DocumentId",
                        column: x => x.DocumentId,
                        principalTable: "Documents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Documents",
                columns: new[] { "Id", "Category", "Content", "CreatedAt", "CreatedBy", "Description", "DocumentId", "FileType", "IsPublic", "IsTemplate", "LastModified", "LastModifiedBy", "Name", "Size", "Status", "Tags", "Version" },
                values: new object[,]
                {
                    { 1, "Guide", "{\r\n                \"sfdt\": \"Welcome Document Content\",\r\n                \"sections\": [\r\n                    {\r\n                        \"sectionFormat\": {\r\n                            \"pageWidth\": 612,\r\n                            \"pageHeight\": 792,\r\n                            \"leftMargin\": 72,\r\n                            \"rightMargin\": 72,\r\n                            \"topMargin\": 72,\r\n                            \"bottomMargin\": 72\r\n                        },\r\n                        \"blocks\": [\r\n                            {\r\n                                \"paragraphFormat\": {\r\n                                    \"styleName\": \"Heading 1\"\r\n                                },\r\n                                \"inlines\": [\r\n                                    {\r\n                                        \"text\": \"Welcome to Collabdoc\"\r\n                                    }\r\n                                ]\r\n                            },\r\n                            {\r\n                                \"paragraphFormat\": {\r\n                                    \"styleName\": \"Normal\"\r\n                                },\r\n                                \"inlines\": [\r\n                                    {\r\n                                        \"text\": \"Welcome to Collabdoc, your comprehensive document management platform. This system provides powerful document editing, collaboration, and management features.\"\r\n                                    }\r\n                                ]\r\n                            },\r\n                            {\r\n                                \"paragraphFormat\": {\r\n                                    \"styleName\": \"Heading 2\"\r\n                                },\r\n                                \"inlines\": [\r\n                                    {\r\n                                        \"text\": \"Key Features:\"\r\n                                    }\r\n                                ]\r\n                            },\r\n                            {\r\n                                \"paragraphFormat\": {\r\n                                    \"styleName\": \"Normal\",\r\n                                    \"leftIndent\": 36\r\n                                },\r\n                                \"inlines\": [\r\n                                    {\r\n                                        \"text\": \"• Rich text editing with Microsoft Word-like interface\"\r\n                                    }\r\n                                ]\r\n                            },\r\n                            {\r\n                                \"paragraphFormat\": {\r\n                                    \"styleName\": \"Normal\",\r\n                                    \"leftIndent\": 36\r\n                                },\r\n                                \"inlines\": [\r\n                                    {\r\n                                        \"text\": \"• Document versioning and history tracking\"\r\n                                    }\r\n                                ]\r\n                            },\r\n                            {\r\n                                \"paragraphFormat\": {\r\n                                    \"styleName\": \"Normal\",\r\n                                    \"leftIndent\": 36\r\n                                },\r\n                                \"inlines\": [\r\n                                    {\r\n                                        \"text\": \"• Real-time collaboration and commenting\"\r\n                                    }\r\n                                ]\r\n                            },\r\n                            {\r\n                                \"paragraphFormat\": {\r\n                                    \"styleName\": \"Normal\",\r\n                                    \"leftIndent\": 36\r\n                                },\r\n                                \"inlines\": [\r\n                                    {\r\n                                        \"text\": \"• Template management and document sharing\"\r\n                                    }\r\n                                ]\r\n                            }\r\n                        ]\r\n                    }\r\n                ]\r\n            }", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", "A welcome document introducing users to the platform", "welcome-doc-001", "SFDT", true, false, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", "Welcome to Collabdoc", 1024L, "Active", "welcome,guide,tutorial", 1 },
                    { 2, "Template", "{\r\n                \"sfdt\": \"Business Letter Template\",\r\n                \"sections\": [\r\n                    {\r\n                        \"sectionFormat\": {\r\n                            \"pageWidth\": 612,\r\n                            \"pageHeight\": 792,\r\n                            \"leftMargin\": 72,\r\n                            \"rightMargin\": 72,\r\n                            \"topMargin\": 72,\r\n                            \"bottomMargin\": 72\r\n                        },\r\n                        \"blocks\": [\r\n                            {\r\n                                \"paragraphFormat\": {\r\n                                    \"styleName\": \"Normal\",\r\n                                    \"textAlignment\": \"Right\"\r\n                                },\r\n                                \"inlines\": [\r\n                                    {\r\n                                        \"text\": \"[Your Company Name]\"\r\n                                    }\r\n                                ]\r\n                            },\r\n                            {\r\n                                \"paragraphFormat\": {\r\n                                    \"styleName\": \"Normal\",\r\n                                    \"textAlignment\": \"Right\"\r\n                                },\r\n                                \"inlines\": [\r\n                                    {\r\n                                        \"text\": \"[Your Address]\"\r\n                                    }\r\n                                ]\r\n                            },\r\n                            {\r\n                                \"paragraphFormat\": {\r\n                                    \"styleName\": \"Normal\",\r\n                                    \"textAlignment\": \"Right\"\r\n                                },\r\n                                \"inlines\": [\r\n                                    {\r\n                                        \"text\": \"[City, State ZIP Code]\"\r\n                                    }\r\n                                ]\r\n                            },\r\n                            {\r\n                                \"paragraphFormat\": {\r\n                                    \"styleName\": \"Normal\",\r\n                                    \"afterSpacing\": 24\r\n                                },\r\n                                \"inlines\": [\r\n                                    {\r\n                                        \"text\": \"\"\r\n                                    }\r\n                                ]\r\n                            },\r\n                            {\r\n                                \"paragraphFormat\": {\r\n                                    \"styleName\": \"Normal\"\r\n                                },\r\n                                \"inlines\": [\r\n                                    {\r\n                                        \"text\": \"[Date]\"\r\n                                    }\r\n                                ]\r\n                            },\r\n                            {\r\n                                \"paragraphFormat\": {\r\n                                    \"styleName\": \"Normal\",\r\n                                    \"afterSpacing\": 24\r\n                                },\r\n                                \"inlines\": [\r\n                                    {\r\n                                        \"text\": \"\"\r\n                                    }\r\n                                ]\r\n                            },\r\n                            {\r\n                                \"paragraphFormat\": {\r\n                                    \"styleName\": \"Normal\"\r\n                                },\r\n                                \"inlines\": [\r\n                                    {\r\n                                        \"text\": \"[Recipient Name]\"\r\n                                    }\r\n                                ]\r\n                            },\r\n                            {\r\n                                \"paragraphFormat\": {\r\n                                    \"styleName\": \"Normal\"\r\n                                },\r\n                                \"inlines\": [\r\n                                    {\r\n                                        \"text\": \"[Title]\"\r\n                                    }\r\n                                ]\r\n                            },\r\n                            {\r\n                                \"paragraphFormat\": {\r\n                                    \"styleName\": \"Normal\"\r\n                                },\r\n                                \"inlines\": [\r\n                                    {\r\n                                        \"text\": \"[Company Name]\"\r\n                                    }\r\n                                ]\r\n                            },\r\n                            {\r\n                                \"paragraphFormat\": {\r\n                                    \"styleName\": \"Normal\"\r\n                                },\r\n                                \"inlines\": [\r\n                                    {\r\n                                        \"text\": \"[Address]\"\r\n                                    }\r\n                                ]\r\n                            },\r\n                            {\r\n                                \"paragraphFormat\": {\r\n                                    \"styleName\": \"Normal\",\r\n                                    \"afterSpacing\": 24\r\n                                },\r\n                                \"inlines\": [\r\n                                    {\r\n                                        \"text\": \"\"\r\n                                    }\r\n                                ]\r\n                            },\r\n                            {\r\n                                \"paragraphFormat\": {\r\n                                    \"styleName\": \"Normal\"\r\n                                },\r\n                                \"inlines\": [\r\n                                    {\r\n                                        \"text\": \"Dear [Recipient Name],\"\r\n                                    }\r\n                                ]\r\n                            },\r\n                            {\r\n                                \"paragraphFormat\": {\r\n                                    \"styleName\": \"Normal\",\r\n                                    \"afterSpacing\": 12\r\n                                },\r\n                                \"inlines\": [\r\n                                    {\r\n                                        \"text\": \"\"\r\n                                    }\r\n                                ]\r\n                            },\r\n                            {\r\n                                \"paragraphFormat\": {\r\n                                    \"styleName\": \"Normal\"\r\n                                },\r\n                                \"inlines\": [\r\n                                    {\r\n                                        \"text\": \"[Your message content goes here. Replace this text with your actual letter content.]\"\r\n                                    }\r\n                                ]\r\n                            },\r\n                            {\r\n                                \"paragraphFormat\": {\r\n                                    \"styleName\": \"Normal\",\r\n                                    \"afterSpacing\": 24\r\n                                },\r\n                                \"inlines\": [\r\n                                    {\r\n                                        \"text\": \"\"\r\n                                    }\r\n                                ]\r\n                            },\r\n                            {\r\n                                \"paragraphFormat\": {\r\n                                    \"styleName\": \"Normal\"\r\n                                },\r\n                                \"inlines\": [\r\n                                    {\r\n                                        \"text\": \"Sincerely,\"\r\n                                    }\r\n                                ]\r\n                            },\r\n                            {\r\n                                \"paragraphFormat\": {\r\n                                    \"styleName\": \"Normal\",\r\n                                    \"afterSpacing\": 48\r\n                                },\r\n                                \"inlines\": [\r\n                                    {\r\n                                        \"text\": \"\"\r\n                                    }\r\n                                ]\r\n                            },\r\n                            {\r\n                                \"paragraphFormat\": {\r\n                                    \"styleName\": \"Normal\"\r\n                                },\r\n                                \"inlines\": [\r\n                                    {\r\n                                        \"text\": \"[Your Name]\"\r\n                                    }\r\n                                ]\r\n                            },\r\n                            {\r\n                                \"paragraphFormat\": {\r\n                                    \"styleName\": \"Normal\"\r\n                                },\r\n                                \"inlines\": [\r\n                                    {\r\n                                        \"text\": \"[Your Title]\"\r\n                                    }\r\n                                ]\r\n                            }\r\n                        ]\r\n                    }\r\n                ]\r\n            }", new DateTime(2024, 1, 3, 0, 0, 0, 0, DateTimeKind.Utc), "System", "Professional business letter template", "sample-template-001", "SFDT", true, true, new DateTime(2024, 1, 3, 0, 0, 0, 0, DateTimeKind.Utc), "System", "Business Letter Template", 512L, "Active", "business,letter,template", 1 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_DocumentComments_Author",
                table: "DocumentComments",
                column: "Author");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentComments_CreatedAt",
                table: "DocumentComments",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentComments_DocumentId",
                table: "DocumentComments",
                column: "DocumentId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentComments_ParentCommentId",
                table: "DocumentComments",
                column: "ParentCommentId");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_Category",
                table: "Documents",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_CreatedAt",
                table: "Documents",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_DocumentId",
                table: "Documents",
                column: "DocumentId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Documents_LastModified",
                table: "Documents",
                column: "LastModified");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_Name",
                table: "Documents",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_Status",
                table: "Documents",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentShares_DocumentId_SharedWith",
                table: "DocumentShares",
                columns: new[] { "DocumentId", "SharedWith" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DocumentShares_SharedAt",
                table: "DocumentShares",
                column: "SharedAt");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentShares_SharedWith",
                table: "DocumentShares",
                column: "SharedWith");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentVersions_CreatedAt",
                table: "DocumentVersions",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentVersions_DocumentId_VersionNumber",
                table: "DocumentVersions",
                columns: new[] { "DocumentId", "VersionNumber" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DocumentComments");

            migrationBuilder.DropTable(
                name: "DocumentShares");

            migrationBuilder.DropTable(
                name: "DocumentVersions");

            migrationBuilder.DropTable(
                name: "Documents");
        }
    }
}
