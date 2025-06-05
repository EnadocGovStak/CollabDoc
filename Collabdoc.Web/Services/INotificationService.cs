namespace Collabdoc.Web.Services
{
    public interface INotificationService
    {
        Task ShowSuccessAsync(string message, string? title = null);
        Task ShowErrorAsync(string message, string? details = null);
        Task ShowWarningAsync(string message, string? title = null);
        Task ShowInfoAsync(string message, string? title = null);
        Task<bool> ShowConfirmAsync(string title, string message);
    }
} 