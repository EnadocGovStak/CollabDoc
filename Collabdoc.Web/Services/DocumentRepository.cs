using Microsoft.EntityFrameworkCore;
using Collabdoc.Web.Data;
using Collabdoc.Web.Data.Entities;

namespace Collabdoc.Web.Services
{
    public class DocumentRepository : IDocumentRepository
    {
        private readonly CollabdocDbContext _context;
        private readonly ILogger<DocumentRepository> _logger;

        public DocumentRepository(CollabdocDbContext context, ILogger<DocumentRepository> logger)
        {
            _context = context;
            _logger = logger;
        }

        #region Document CRUD Operations

        public async Task<Document?> GetDocumentByIdAsync(int id)
        {
            try
            {
                return await _context.Documents
                    .Include(d => d.Versions)
                    .Include(d => d.Shares)
                    .Include(d => d.Comments)
                    .FirstOrDefaultAsync(d => d.Id == id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting document by ID {DocumentId}", id);
                return null;
            }
        }

        public async Task<Document?> GetDocumentByDocumentIdAsync(string documentId)
        {
            try
            {
                return await _context.Documents
                    .Include(d => d.Versions)
                    .Include(d => d.Shares)
                    .Include(d => d.Comments)
                    .FirstOrDefaultAsync(d => d.DocumentId == documentId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting document by DocumentId {DocumentId}", documentId);
                return null;
            }
        }

        public async Task<IEnumerable<Document>> GetDocumentsAsync(int pageNumber = 1, int pageSize = 20)
        {
            try
            {
                return await _context.Documents
                    .Where(d => d.Status == "Active" && !d.IsTemplate)
                    .OrderByDescending(d => d.LastModified)
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting documents");
                return new List<Document>();
            }
        }

        public async Task<IEnumerable<Document>> GetRecentDocumentsAsync(int count = 10)
        {
            try
            {
                return await _context.Documents
                    .Where(d => d.Status == "Active" && !d.IsTemplate)
                    .OrderByDescending(d => d.LastModified)
                    .Take(count)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent documents");
                return new List<Document>();
            }
        }

        public async Task<IEnumerable<Document>> GetDocumentsByUserAsync(string userId, int pageNumber = 1, int pageSize = 20)
        {
            try
            {
                return await _context.Documents
                    .Where(d => d.CreatedBy == userId && d.Status == "Active" && !d.IsTemplate)
                    .OrderByDescending(d => d.LastModified)
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting documents for user {UserId}", userId);
                return new List<Document>();
            }
        }

        public async Task<IEnumerable<Document>> GetTemplatesAsync()
        {
            try
            {
                return await _context.Documents
                    .Where(d => d.IsTemplate && d.Status == "Active")
                    .OrderBy(d => d.Name)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting templates");
                return new List<Document>();
            }
        }

        public async Task<IEnumerable<Document>> SearchDocumentsAsync(string searchTerm, int pageNumber = 1, int pageSize = 20)
        {
            try
            {
                return await _context.Documents
                    .Where(d => d.Status == "Active" && !d.IsTemplate &&
                           (d.Name.Contains(searchTerm) || 
                            d.Description!.Contains(searchTerm) || 
                            d.Tags!.Contains(searchTerm)))
                    .OrderByDescending(d => d.LastModified)
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching documents with term {SearchTerm}", searchTerm);
                return new List<Document>();
            }
        }

        public async Task<Document> CreateDocumentAsync(Document document)
        {
            try
            {
                document.CreatedAt = DateTime.UtcNow;
                document.LastModified = DateTime.UtcNow;
                
                _context.Documents.Add(document);
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Document created: {DocumentId} - {DocumentName}", document.DocumentId, document.Name);
                return document;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating document {DocumentId}", document.DocumentId);
                throw;
            }
        }

        public async Task<Document> UpdateDocumentAsync(Document document)
        {
            try
            {
                document.LastModified = DateTime.UtcNow;
                
                _context.Documents.Update(document);
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Document updated: {DocumentId} - {DocumentName}", document.DocumentId, document.Name);
                return document;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating document {DocumentId}", document.DocumentId);
                throw;
            }
        }

        public async Task<bool> DeleteDocumentAsync(int id)
        {
            try
            {
                var document = await _context.Documents.FindAsync(id);
                if (document == null)
                    return false;

                document.Status = "Deleted";
                document.LastModified = DateTime.UtcNow;
                
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Document deleted: {DocumentId}", document.DocumentId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting document {DocumentId}", id);
                return false;
            }
        }

        public async Task<bool> DocumentExistsAsync(string documentId)
        {
            try
            {
                return await _context.Documents
                    .AnyAsync(d => d.DocumentId == documentId && d.Status != "Deleted");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if document exists {DocumentId}", documentId);
                return false;
            }
        }

        public async Task<int> GetTotalDocumentCountAsync()
        {
            try
            {
                return await _context.Documents
                    .CountAsync(d => d.Status == "Active" && !d.IsTemplate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting total document count");
                return 0;
            }
        }

        #endregion

        #region Version Management

        public async Task<IEnumerable<DocumentVersion>> GetDocumentVersionsAsync(int documentId)
        {
            try
            {
                return await _context.DocumentVersions
                    .Where(v => v.DocumentId == documentId)
                    .OrderByDescending(v => v.VersionNumber)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting versions for document {DocumentId}", documentId);
                return new List<DocumentVersion>();
            }
        }

        public async Task<DocumentVersion?> GetDocumentVersionAsync(int documentId, int versionNumber)
        {
            try
            {
                return await _context.DocumentVersions
                    .FirstOrDefaultAsync(v => v.DocumentId == documentId && v.VersionNumber == versionNumber);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting version {VersionNumber} for document {DocumentId}", versionNumber, documentId);
                return null;
            }
        }

        public async Task<DocumentVersion> CreateDocumentVersionAsync(DocumentVersion version)
        {
            try
            {
                version.CreatedAt = DateTime.UtcNow;
                
                _context.DocumentVersions.Add(version);
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Document version created: {DocumentId} v{VersionNumber}", version.DocumentId, version.VersionNumber);
                return version;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating version for document {DocumentId}", version.DocumentId);
                throw;
            }
        }

        public async Task<bool> DeleteDocumentVersionAsync(int versionId)
        {
            try
            {
                var version = await _context.DocumentVersions.FindAsync(versionId);
                if (version == null)
                    return false;

                _context.DocumentVersions.Remove(version);
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Document version deleted: {VersionId}", versionId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting version {VersionId}", versionId);
                return false;
            }
        }

        #endregion

        #region Sharing and Permissions

        public async Task<IEnumerable<DocumentShare>> GetDocumentSharesAsync(int documentId)
        {
            try
            {
                return await _context.DocumentShares
                    .Where(s => s.DocumentId == documentId && s.IsActive)
                    .OrderByDescending(s => s.SharedAt)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting shares for document {DocumentId}", documentId);
                return new List<DocumentShare>();
            }
        }

        public async Task<DocumentShare> CreateDocumentShareAsync(DocumentShare share)
        {
            try
            {
                share.SharedAt = DateTime.UtcNow;
                
                _context.DocumentShares.Add(share);
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Document shared: {DocumentId} with {SharedWith}", share.DocumentId, share.SharedWith);
                return share;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating share for document {DocumentId}", share.DocumentId);
                throw;
            }
        }

        public async Task<bool> UpdateDocumentShareAsync(DocumentShare share)
        {
            try
            {
                _context.DocumentShares.Update(share);
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Document share updated: {ShareId}", share.Id);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating share {ShareId}", share.Id);
                return false;
            }
        }

        public async Task<bool> DeleteDocumentShareAsync(int shareId)
        {
            try
            {
                var share = await _context.DocumentShares.FindAsync(shareId);
                if (share == null)
                    return false;

                share.IsActive = false;
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Document share deleted: {ShareId}", shareId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting share {ShareId}", shareId);
                return false;
            }
        }

        public async Task<bool> HasDocumentAccessAsync(int documentId, string userId, string permission = "Read")
        {
            try
            {
                var document = await _context.Documents.FindAsync(documentId);
                if (document == null)
                    return false;

                // Owner has full access
                if (document.CreatedBy == userId)
                    return true;

                // Check if document is public and permission is Read
                if (document.IsPublic && permission == "Read")
                    return true;

                // Check explicit shares
                return await _context.DocumentShares
                    .AnyAsync(s => s.DocumentId == documentId && 
                                  s.SharedWith == userId && 
                                  s.IsActive &&
                                  (s.ExpiresAt == null || s.ExpiresAt > DateTime.UtcNow) &&
                                  (permission == "Read" || s.Permission == permission || s.Permission == "Admin"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking access for document {DocumentId} and user {UserId}", documentId, userId);
                return false;
            }
        }

        #endregion

        #region Comments and Collaboration

        public async Task<IEnumerable<DocumentComment>> GetDocumentCommentsAsync(int documentId)
        {
            try
            {
                return await _context.DocumentComments
                    .Where(c => c.DocumentId == documentId)
                    .Include(c => c.Replies)
                    .OrderByDescending(c => c.CreatedAt)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting comments for document {DocumentId}", documentId);
                return new List<DocumentComment>();
            }
        }

        public async Task<DocumentComment> CreateDocumentCommentAsync(DocumentComment comment)
        {
            try
            {
                comment.CreatedAt = DateTime.UtcNow;
                
                _context.DocumentComments.Add(comment);
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Comment created for document {DocumentId}", comment.DocumentId);
                return comment;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating comment for document {DocumentId}", comment.DocumentId);
                throw;
            }
        }

        public async Task<DocumentComment> UpdateDocumentCommentAsync(DocumentComment comment)
        {
            try
            {
                comment.UpdatedAt = DateTime.UtcNow;
                
                _context.DocumentComments.Update(comment);
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Comment updated: {CommentId}", comment.Id);
                return comment;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating comment {CommentId}", comment.Id);
                throw;
            }
        }

        public async Task<bool> DeleteDocumentCommentAsync(int commentId)
        {
            try
            {
                var comment = await _context.DocumentComments.FindAsync(commentId);
                if (comment == null)
                    return false;

                _context.DocumentComments.Remove(comment);
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Comment deleted: {CommentId}", commentId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting comment {CommentId}", commentId);
                return false;
            }
        }

        #endregion

        #region Statistics

        public async Task<int> GetUserDocumentCountAsync(string userId)
        {
            try
            {
                return await _context.Documents
                    .CountAsync(d => d.CreatedBy == userId && d.Status == "Active");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting document count for user {UserId}", userId);
                return 0;
            }
        }

        public async Task<int> GetSharedDocumentCountAsync(string userId)
        {
            try
            {
                return await _context.DocumentShares
                    .Where(s => s.SharedWith == userId && s.IsActive)
                    .Select(s => s.DocumentId)
                    .Distinct()
                    .CountAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting shared document count for user {UserId}", userId);
                return 0;
            }
        }

        public async Task<Dictionary<string, int>> GetDocumentStatsByStatusAsync()
        {
            try
            {
                return await _context.Documents
                    .GroupBy(d => d.Status)
                    .ToDictionaryAsync(g => g.Key, g => g.Count());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting document stats by status");
                return new Dictionary<string, int>();
            }
        }

        public async Task<Dictionary<string, int>> GetDocumentStatsByCategoryAsync()
        {
            try
            {
                return await _context.Documents
                    .Where(d => d.Status == "Active" && d.Category != null)
                    .GroupBy(d => d.Category!)
                    .ToDictionaryAsync(g => g.Key, g => g.Count());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting document stats by category");
                return new Dictionary<string, int>();
            }
        }

        #endregion

        public async Task<bool> TestDatabaseConnectionAsync()
        {
            try
            {
                var count = await _context.Documents.CountAsync();
                _logger.LogInformation($"Database connection test successful. Found {count} documents.");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Database connection test failed");
                return false;
            }
        }
    }
} 