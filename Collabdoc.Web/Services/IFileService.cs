namespace Collabdoc.Web.Services
{
    public interface IFileService
    {
        Task<byte[]> ReadFileAsync(string filePath);
        Task WriteFileAsync(string filePath, byte[] content);
        Task<bool> FileExistsAsync(string filePath);
        Task DeleteFileAsync(string filePath);
        Task<string> GetTempFilePathAsync(string extension);
        Task<long> GetFileSizeAsync(string filePath);
        Task<string> GetFileHashAsync(byte[] content);
        bool IsValidFileExtension(string fileName, string[] allowedExtensions);
        string GetFileExtension(string fileName);
        string GetSafeFileName(string fileName);
    }
} 