using Collabdoc.Web.Data.Entities;

namespace Collabdoc.Web.Services
{
    public interface IDocumentRepository
    {
        // Document CRUD operations
        Task<Document?> GetDocumentByIdAsync(int id);
        Task<Document?> GetDocumentByDocumentIdAsync(string documentId);
        Task<IEnumerable<Document>> GetDocumentsAsync(int pageNumber = 1, int pageSize = 20);
        Task<IEnumerable<Document>> GetRecentDocumentsAsync(int count = 10);
        Task<IEnumerable<Document>> GetDocumentsByUserAsync(string userId, int pageNumber = 1, int pageSize = 20);
        Task<IEnumerable<Document>> GetTemplatesAsync();
        Task<IEnumerable<Document>> SearchDocumentsAsync(string searchTerm, int pageNumber = 1, int pageSize = 20);
        Task<Document> CreateDocumentAsync(Document document);
        Task<Document> UpdateDocumentAsync(Document document);
        Task<bool> DeleteDocumentAsync(int id);
        Task<bool> DocumentExistsAsync(string documentId);
        Task<int> GetTotalDocumentCountAsync();

        // Version management
        Task<IEnumerable<DocumentVersion>> GetDocumentVersionsAsync(int documentId);
        Task<DocumentVersion?> GetDocumentVersionAsync(int documentId, int versionNumber);
        Task<DocumentVersion> CreateDocumentVersionAsync(DocumentVersion version);
        Task<bool> DeleteDocumentVersionAsync(int versionId);

        // Sharing and permissions
        Task<IEnumerable<DocumentShare>> GetDocumentSharesAsync(int documentId);
        Task<DocumentShare> CreateDocumentShareAsync(DocumentShare share);
        Task<bool> UpdateDocumentShareAsync(DocumentShare share);
        Task<bool> DeleteDocumentShareAsync(int shareId);
        Task<bool> HasDocumentAccessAsync(int documentId, string userId, string permission = "Read");

        // Comments and collaboration
        Task<IEnumerable<DocumentComment>> GetDocumentCommentsAsync(int documentId);
        Task<DocumentComment> CreateDocumentCommentAsync(DocumentComment comment);
        Task<DocumentComment> UpdateDocumentCommentAsync(DocumentComment comment);
        Task<bool> DeleteDocumentCommentAsync(int commentId);

        // Statistics
        Task<int> GetUserDocumentCountAsync(string userId);
        Task<int> GetSharedDocumentCountAsync(string userId);
        Task<Dictionary<string, int>> GetDocumentStatsByStatusAsync();
        Task<Dictionary<string, int>> GetDocumentStatsByCategoryAsync();

        // Testing
        Task<bool> TestDatabaseConnectionAsync();
    }
} 