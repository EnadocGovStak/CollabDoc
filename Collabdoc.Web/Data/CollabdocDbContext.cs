using Microsoft.EntityFrameworkCore;
using Collabdoc.Web.Data.Entities;

namespace Collabdoc.Web.Data
{
    public class CollabdocDbContext : DbContext
    {
        public CollabdocDbContext(DbContextOptions<CollabdocDbContext> options) : base(options)
        {
        }

        // DbSets
        public DbSet<Document> Documents { get; set; }
        public DbSet<DocumentVersion> DocumentVersions { get; set; }
        public DbSet<DocumentShare> DocumentShares { get; set; }
        public DbSet<DocumentComment> DocumentComments { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Document configuration
            modelBuilder.Entity<Document>(entity =>
            {
                entity.HasIndex(e => e.DocumentId).IsUnique();
                entity.HasIndex(e => e.Name);
                entity.HasIndex(e => e.CreatedAt);
                entity.HasIndex(e => e.LastModified);
                entity.HasIndex(e => e.Category);
                entity.HasIndex(e => e.Status);

                entity.Property(e => e.Content).HasColumnType("TEXT");
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("datetime('now')");
                entity.Property(e => e.LastModified).HasDefaultValueSql("datetime('now')");
            });

            // DocumentVersion configuration
            modelBuilder.Entity<DocumentVersion>(entity =>
            {
                entity.HasIndex(e => new { e.DocumentId, e.VersionNumber }).IsUnique();
                entity.HasIndex(e => e.CreatedAt);

                entity.Property(e => e.Content).HasColumnType("TEXT");
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("datetime('now')");

                entity.HasOne(d => d.Document)
                    .WithMany(p => p.Versions)
                    .HasForeignKey(d => d.DocumentId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // DocumentShare configuration
            modelBuilder.Entity<DocumentShare>(entity =>
            {
                entity.HasIndex(e => new { e.DocumentId, e.SharedWith }).IsUnique();
                entity.HasIndex(e => e.SharedWith);
                entity.HasIndex(e => e.SharedAt);

                entity.Property(e => e.SharedAt).HasDefaultValueSql("datetime('now')");

                entity.HasOne(d => d.Document)
                    .WithMany(p => p.Shares)
                    .HasForeignKey(d => d.DocumentId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // DocumentComment configuration
            modelBuilder.Entity<DocumentComment>(entity =>
            {
                entity.HasIndex(e => e.DocumentId);
                entity.HasIndex(e => e.CreatedAt);
                entity.HasIndex(e => e.Author);

                entity.Property(e => e.CreatedAt).HasDefaultValueSql("datetime('now')");

                entity.HasOne(d => d.Document)
                    .WithMany(p => p.Comments)
                    .HasForeignKey(d => d.DocumentId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(d => d.ParentComment)
                    .WithMany(p => p.Replies)
                    .HasForeignKey(d => d.ParentCommentId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Seed data
            SeedData(modelBuilder);
        }

        private void SeedData(ModelBuilder modelBuilder)
        {
            // Seed sample documents
            modelBuilder.Entity<Document>().HasData(
                new Document
                {
                    Id = 1,
                    DocumentId = "welcome-doc-001",
                    Name = "Welcome to Collabdoc",
                    Description = "A welcome document introducing users to the platform",
                    FileType = "SFDT",
                    Size = 1024,
                    Content = GetWelcomeDocumentContent(),
                    CreatedBy = "System",
                    LastModifiedBy = "System",
                    CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                    LastModified = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                    Status = "Active",
                    Category = "Guide",
                    Tags = "welcome,guide,tutorial",
                    IsTemplate = false,
                    IsPublic = true,
                    Version = 1
                },
                new Document
                {
                    Id = 2,
                    DocumentId = "sample-template-001",
                    Name = "Business Letter Template",
                    Description = "Professional business letter template",
                    FileType = "SFDT",
                    Size = 512,
                    Content = GetBusinessLetterTemplate(),
                    CreatedBy = "System",
                    LastModifiedBy = "System",
                    CreatedAt = new DateTime(2024, 1, 3, 0, 0, 0, DateTimeKind.Utc),
                    LastModified = new DateTime(2024, 1, 3, 0, 0, 0, DateTimeKind.Utc),
                    Status = "Active",
                    Category = "Template",
                    Tags = "business,letter,template",
                    IsTemplate = true,
                    IsPublic = true,
                    Version = 1
                }
            );
        }

        private string GetWelcomeDocumentContent()
        {
            return @"{
                ""sfdt"": ""Welcome Document Content"",
                ""sections"": [
                    {
                        ""sectionFormat"": {
                            ""pageWidth"": 612,
                            ""pageHeight"": 792,
                            ""leftMargin"": 72,
                            ""rightMargin"": 72,
                            ""topMargin"": 72,
                            ""bottomMargin"": 72
                        },
                        ""blocks"": [
                            {
                                ""paragraphFormat"": {
                                    ""styleName"": ""Heading 1""
                                },
                                ""inlines"": [
                                    {
                                        ""text"": ""Welcome to Collabdoc""
                                    }
                                ]
                            },
                            {
                                ""paragraphFormat"": {
                                    ""styleName"": ""Normal""
                                },
                                ""inlines"": [
                                    {
                                        ""text"": ""Welcome to Collabdoc, your comprehensive document management platform. This system provides powerful document editing, collaboration, and management features.""
                                    }
                                ]
                            },
                            {
                                ""paragraphFormat"": {
                                    ""styleName"": ""Heading 2""
                                },
                                ""inlines"": [
                                    {
                                        ""text"": ""Key Features:""
                                    }
                                ]
                            },
                            {
                                ""paragraphFormat"": {
                                    ""styleName"": ""Normal"",
                                    ""leftIndent"": 36
                                },
                                ""inlines"": [
                                    {
                                        ""text"": ""• Rich text editing with Microsoft Word-like interface""
                                    }
                                ]
                            },
                            {
                                ""paragraphFormat"": {
                                    ""styleName"": ""Normal"",
                                    ""leftIndent"": 36
                                },
                                ""inlines"": [
                                    {
                                        ""text"": ""• Document versioning and history tracking""
                                    }
                                ]
                            },
                            {
                                ""paragraphFormat"": {
                                    ""styleName"": ""Normal"",
                                    ""leftIndent"": 36
                                },
                                ""inlines"": [
                                    {
                                        ""text"": ""• Real-time collaboration and commenting""
                                    }
                                ]
                            },
                            {
                                ""paragraphFormat"": {
                                    ""styleName"": ""Normal"",
                                    ""leftIndent"": 36
                                },
                                ""inlines"": [
                                    {
                                        ""text"": ""• Template management and document sharing""
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }";
        }

        private string GetBusinessLetterTemplate()
        {
            return @"{
                ""sfdt"": ""Business Letter Template"",
                ""sections"": [
                    {
                        ""sectionFormat"": {
                            ""pageWidth"": 612,
                            ""pageHeight"": 792,
                            ""leftMargin"": 72,
                            ""rightMargin"": 72,
                            ""topMargin"": 72,
                            ""bottomMargin"": 72
                        },
                        ""blocks"": [
                            {
                                ""paragraphFormat"": {
                                    ""styleName"": ""Normal"",
                                    ""textAlignment"": ""Right""
                                },
                                ""inlines"": [
                                    {
                                        ""text"": ""[Your Company Name]""
                                    }
                                ]
                            },
                            {
                                ""paragraphFormat"": {
                                    ""styleName"": ""Normal"",
                                    ""textAlignment"": ""Right""
                                },
                                ""inlines"": [
                                    {
                                        ""text"": ""[Your Address]""
                                    }
                                ]
                            },
                            {
                                ""paragraphFormat"": {
                                    ""styleName"": ""Normal"",
                                    ""textAlignment"": ""Right""
                                },
                                ""inlines"": [
                                    {
                                        ""text"": ""[City, State ZIP Code]""
                                    }
                                ]
                            },
                            {
                                ""paragraphFormat"": {
                                    ""styleName"": ""Normal"",
                                    ""afterSpacing"": 24
                                },
                                ""inlines"": [
                                    {
                                        ""text"": """"
                                    }
                                ]
                            },
                            {
                                ""paragraphFormat"": {
                                    ""styleName"": ""Normal""
                                },
                                ""inlines"": [
                                    {
                                        ""text"": ""[Date]""
                                    }
                                ]
                            },
                            {
                                ""paragraphFormat"": {
                                    ""styleName"": ""Normal"",
                                    ""afterSpacing"": 24
                                },
                                ""inlines"": [
                                    {
                                        ""text"": """"
                                    }
                                ]
                            },
                            {
                                ""paragraphFormat"": {
                                    ""styleName"": ""Normal""
                                },
                                ""inlines"": [
                                    {
                                        ""text"": ""[Recipient Name]""
                                    }
                                ]
                            },
                            {
                                ""paragraphFormat"": {
                                    ""styleName"": ""Normal""
                                },
                                ""inlines"": [
                                    {
                                        ""text"": ""[Title]""
                                    }
                                ]
                            },
                            {
                                ""paragraphFormat"": {
                                    ""styleName"": ""Normal""
                                },
                                ""inlines"": [
                                    {
                                        ""text"": ""[Company Name]""
                                    }
                                ]
                            },
                            {
                                ""paragraphFormat"": {
                                    ""styleName"": ""Normal""
                                },
                                ""inlines"": [
                                    {
                                        ""text"": ""[Address]""
                                    }
                                ]
                            },
                            {
                                ""paragraphFormat"": {
                                    ""styleName"": ""Normal"",
                                    ""afterSpacing"": 24
                                },
                                ""inlines"": [
                                    {
                                        ""text"": """"
                                    }
                                ]
                            },
                            {
                                ""paragraphFormat"": {
                                    ""styleName"": ""Normal""
                                },
                                ""inlines"": [
                                    {
                                        ""text"": ""Dear [Recipient Name],""
                                    }
                                ]
                            },
                            {
                                ""paragraphFormat"": {
                                    ""styleName"": ""Normal"",
                                    ""afterSpacing"": 12
                                },
                                ""inlines"": [
                                    {
                                        ""text"": """"
                                    }
                                ]
                            },
                            {
                                ""paragraphFormat"": {
                                    ""styleName"": ""Normal""
                                },
                                ""inlines"": [
                                    {
                                        ""text"": ""[Your message content goes here. Replace this text with your actual letter content.]""
                                    }
                                ]
                            },
                            {
                                ""paragraphFormat"": {
                                    ""styleName"": ""Normal"",
                                    ""afterSpacing"": 24
                                },
                                ""inlines"": [
                                    {
                                        ""text"": """"
                                    }
                                ]
                            },
                            {
                                ""paragraphFormat"": {
                                    ""styleName"": ""Normal""
                                },
                                ""inlines"": [
                                    {
                                        ""text"": ""Sincerely,""
                                    }
                                ]
                            },
                            {
                                ""paragraphFormat"": {
                                    ""styleName"": ""Normal"",
                                    ""afterSpacing"": 48
                                },
                                ""inlines"": [
                                    {
                                        ""text"": """"
                                    }
                                ]
                            },
                            {
                                ""paragraphFormat"": {
                                    ""styleName"": ""Normal""
                                },
                                ""inlines"": [
                                    {
                                        ""text"": ""[Your Name]""
                                    }
                                ]
                            },
                            {
                                ""paragraphFormat"": {
                                    ""styleName"": ""Normal""
                                },
                                ""inlines"": [
                                    {
                                        ""text"": ""[Your Title]""
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }";
        }
    }
} 