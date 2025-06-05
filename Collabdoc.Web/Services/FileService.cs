using System.Security.Cryptography;
using System.Text;

namespace Collabdoc.Web.Services
{
    public class FileService : IFileService
    {
        private readonly ILogger<FileService> _logger;
        private readonly IConfiguration _configuration;

        public FileService(ILogger<FileService> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
        }

        public async Task<byte[]> ReadFileAsync(string filePath)
        {
            try
            {
                return await File.ReadAllBytesAsync(filePath);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reading file: {FilePath}", filePath);
                throw;
            }
        }

        public async Task WriteFileAsync(string filePath, byte[] content)
        {
            try
            {
                var directory = Path.GetDirectoryName(filePath);
                if (!string.IsNullOrEmpty(directory) && !Directory.Exists(directory))
                {
                    Directory.CreateDirectory(directory);
                }

                await File.WriteAllBytesAsync(filePath, content);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error writing file: {FilePath}", filePath);
                throw;
            }
        }

        public async Task<bool> FileExistsAsync(string filePath)
        {
            try
            {
                return await Task.FromResult(File.Exists(filePath));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking file existence: {FilePath}", filePath);
                return false;
            }
        }

        public async Task DeleteFileAsync(string filePath)
        {
            try
            {
                if (await FileExistsAsync(filePath))
                {
                    File.Delete(filePath);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting file: {FilePath}", filePath);
                throw;
            }
        }

        public async Task<string> GetTempFilePathAsync(string extension)
        {
            try
            {
                var tempPath = Path.GetTempPath();
                var fileName = $"{Guid.NewGuid()}{extension}";
                return await Task.FromResult(Path.Combine(tempPath, fileName));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating temp file path");
                throw;
            }
        }

        public async Task<long> GetFileSizeAsync(string filePath)
        {
            try
            {
                var fileInfo = new FileInfo(filePath);
                return await Task.FromResult(fileInfo.Length);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting file size: {FilePath}", filePath);
                throw;
            }
        }

        public async Task<string> GetFileHashAsync(byte[] content)
        {
            try
            {
                using var sha256 = SHA256.Create();
                var hash = await Task.Run(() => sha256.ComputeHash(content));
                return Convert.ToHexString(hash);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error computing file hash");
                throw;
            }
        }

        public bool IsValidFileExtension(string fileName, string[] allowedExtensions)
        {
            try
            {
                var extension = GetFileExtension(fileName);
                return allowedExtensions.Contains(extension, StringComparer.OrdinalIgnoreCase);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating file extension: {FileName}", fileName);
                return false;
            }
        }

        public string GetFileExtension(string fileName)
        {
            try
            {
                return Path.GetExtension(fileName).ToLowerInvariant();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting file extension: {FileName}", fileName);
                return string.Empty;
            }
        }

        public string GetSafeFileName(string fileName)
        {
            try
            {
                var invalidChars = Path.GetInvalidFileNameChars();
                var safeFileName = new StringBuilder();

                foreach (var c in fileName)
                {
                    if (!invalidChars.Contains(c))
                    {
                        safeFileName.Append(c);
                    }
                    else
                    {
                        safeFileName.Append('_');
                    }
                }

                return safeFileName.ToString();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating safe file name: {FileName}", fileName);
                return "unknown_file";
            }
        }
    }
} 