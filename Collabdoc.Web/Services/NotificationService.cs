using Microsoft.JSInterop;

namespace Collabdoc.Web.Services
{
    public class NotificationService : INotificationService
    {
        private readonly IJSRuntime _jsRuntime;
        private readonly ILogger<NotificationService> _logger;

        public NotificationService(IJSRuntime jsRuntime, ILogger<NotificationService> logger)
        {
            _jsRuntime = jsRuntime;
            _logger = logger;
        }

        public async Task ShowSuccessAsync(string message, string? title = null)
        {
            try
            {
                await _jsRuntime.InvokeVoidAsync("showNotification", "success", title ?? "Success", message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error showing success notification");
            }
        }

        public async Task ShowErrorAsync(string message, string? details = null)
        {
            try
            {
                var fullMessage = string.IsNullOrEmpty(details) ? message : $"{message}\n\nDetails: {details}";
                await _jsRuntime.InvokeVoidAsync("showNotification", "error", "Error", fullMessage);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error showing error notification");
            }
        }

        public async Task ShowWarningAsync(string message, string? title = null)
        {
            try
            {
                await _jsRuntime.InvokeVoidAsync("showNotification", "warning", title ?? "Warning", message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error showing warning notification");
            }
        }

        public async Task ShowInfoAsync(string message, string? title = null)
        {
            try
            {
                await _jsRuntime.InvokeVoidAsync("showNotification", "info", title ?? "Information", message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error showing info notification");
            }
        }

        public async Task<bool> ShowConfirmAsync(string title, string message)
        {
            try
            {
                return await _jsRuntime.InvokeAsync<bool>("confirm", $"{title}\n\n{message}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error showing confirmation dialog");
                return false;
            }
        }
    }
} 