using SyncfusionDocumentConverter.DTOs;

namespace Collabdoc.Web.Services
{
    public class RecordManagementService : IRecordManagementService
    {
        private readonly ILogger<RecordManagementService> _logger;
        private static readonly List<DocumentRecord> _records = new();
        private static readonly List<RecordRetentionPolicy> _policies = GetDefaultPolicies();

        public RecordManagementService(ILogger<RecordManagementService> logger)
        {
            _logger = logger;
        }

        public async Task<ApiResponse<DocumentRecord>> CreateRecordAsync(CreateDocumentRecordRequest request)
        {
            try
            {
                var record = new DocumentRecord
                {
                    Id = _records.Count + 1,
                    DocumentId = request.DocumentId,
                    DocumentName = request.DocumentName,
                    RecordType = request.RecordType,
                    Classification = request.Classification,
                    RetentionPeriod = request.RetentionPeriod,
                    Description = request.Description,
                    CreatedBy = request.CreatedBy,
                    CreatedAt = DateTime.Now,
                    Status = "Active",
                    Metadata = request.Metadata,
                    RequiresApproval = request.Classification.Contains("Confidential") || request.Classification.Contains("Restricted"),
                    RetentionDate = CalculateRetentionDate(request.RetentionPeriod)
                };

                record.Actions.Add(new RecordAction
                {
                    Id = 1,
                    Action = "Record Created",
                    PerformedBy = request.CreatedBy,
                    PerformedAt = DateTime.Now,
                    Notes = $"Document record created with classification: {request.Classification}"
                });

                _records.Add(record);

                await Task.Delay(100); // Simulate async operation

                return new ApiResponse<DocumentRecord>
                {
                    Success = true,
                    Data = record,
                    Message = "Document record created successfully"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating document record");
                return new ApiResponse<DocumentRecord>
                {
                    Success = false,
                    Error = ex.Message
                };
            }
        }

        public async Task<ApiResponse<IEnumerable<DocumentRecord>>> GetRecordsAsync()
        {
            await Task.Delay(100);
            return new ApiResponse<IEnumerable<DocumentRecord>>
            {
                Success = true,
                Data = _records.OrderByDescending(r => r.CreatedAt),
                Message = "Records retrieved successfully"
            };
        }

        public async Task<ApiResponse<DocumentRecord>> GetRecordAsync(int id)
        {
            await Task.Delay(100);
            var record = _records.FirstOrDefault(r => r.Id == id);
            
            if (record == null)
            {
                return new ApiResponse<DocumentRecord>
                {
                    Success = false,
                    Error = "Record not found"
                };
            }

            return new ApiResponse<DocumentRecord>
            {
                Success = true,
                Data = record,
                Message = "Record retrieved successfully"
            };
        }

        public async Task<ApiResponse<bool>> UpdateRecordAsync(int id, UpdateDocumentRecordRequest request)
        {
            try
            {
                var record = _records.FirstOrDefault(r => r.Id == id);
                if (record == null)
                {
                    return new ApiResponse<bool>
                    {
                        Success = false,
                        Error = "Record not found"
                    };
                }

                if (!string.IsNullOrEmpty(request.RecordType))
                    record.RecordType = request.RecordType;
                
                if (!string.IsNullOrEmpty(request.Classification))
                    record.Classification = request.Classification;
                
                if (!string.IsNullOrEmpty(request.RetentionPeriod))
                {
                    record.RetentionPeriod = request.RetentionPeriod;
                    record.RetentionDate = CalculateRetentionDate(request.RetentionPeriod);
                }
                
                if (!string.IsNullOrEmpty(request.Description))
                    record.Description = request.Description;
                
                if (request.Metadata != null)
                    record.Metadata = request.Metadata;

                record.Actions.Add(new RecordAction
                {
                    Id = record.Actions.Count + 1,
                    Action = "Record Updated",
                    PerformedBy = "System", // In real implementation, get from current user
                    PerformedAt = DateTime.Now,
                    Notes = "Record information updated"
                });

                await Task.Delay(100);

                return new ApiResponse<bool>
                {
                    Success = true,
                    Data = true,
                    Message = "Record updated successfully"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating record {RecordId}", id);
                return new ApiResponse<bool>
                {
                    Success = false,
                    Error = ex.Message
                };
            }
        }

        public async Task<ApiResponse<bool>> DeleteRecordAsync(int id)
        {
            try
            {
                var record = _records.FirstOrDefault(r => r.Id == id);
                if (record == null)
                {
                    return new ApiResponse<bool>
                    {
                        Success = false,
                        Error = "Record not found"
                    };
                }

                _records.Remove(record);
                await Task.Delay(100);

                return new ApiResponse<bool>
                {
                    Success = true,
                    Data = true,
                    Message = "Record deleted successfully"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting record {RecordId}", id);
                return new ApiResponse<bool>
                {
                    Success = false,
                    Error = ex.Message
                };
            }
        }

        public async Task<ApiResponse<bool>> ArchiveRecordAsync(int id)
        {
            try
            {
                var record = _records.FirstOrDefault(r => r.Id == id);
                if (record == null)
                {
                    return new ApiResponse<bool>
                    {
                        Success = false,
                        Error = "Record not found"
                    };
                }

                record.Status = "Archived";
                record.Actions.Add(new RecordAction
                {
                    Id = record.Actions.Count + 1,
                    Action = "Record Archived",
                    PerformedBy = "System",
                    PerformedAt = DateTime.Now,
                    Notes = "Record archived due to retention policy"
                });

                await Task.Delay(100);

                return new ApiResponse<bool>
                {
                    Success = true,
                    Data = true,
                    Message = "Record archived successfully"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error archiving record {RecordId}", id);
                return new ApiResponse<bool>
                {
                    Success = false,
                    Error = ex.Message
                };
            }
        }

        public async Task<ApiResponse<IEnumerable<RecordRetentionPolicy>>> GetRetentionPoliciesAsync()
        {
            await Task.Delay(100);
            return new ApiResponse<IEnumerable<RecordRetentionPolicy>>
            {
                Success = true,
                Data = _policies,
                Message = "Retention policies retrieved successfully"
            };
        }

        public async Task<ApiResponse<IEnumerable<DocumentRecord>>> GetRecordsNearingRetentionAsync()
        {
            await Task.Delay(100);
            var nearingRetention = _records.Where(r => 
                r.RetentionDate.HasValue && 
                r.RetentionDate.Value <= DateTime.Now.AddDays(30) && 
                r.Status == "Active"
            );

            return new ApiResponse<IEnumerable<DocumentRecord>>
            {
                Success = true,
                Data = nearingRetention,
                Message = "Records nearing retention retrieved successfully"
            };
        }

        public async Task<ApiResponse<bool>> ApplyRetentionPolicyAsync(int recordId, string policyId)
        {
            try
            {
                var record = _records.FirstOrDefault(r => r.Id == recordId);
                var policy = _policies.FirstOrDefault(p => p.Id == policyId);

                if (record == null || policy == null)
                {
                    return new ApiResponse<bool>
                    {
                        Success = false,
                        Error = "Record or policy not found"
                    };
                }

                record.RetentionPeriod = policy.Period;
                record.Classification = policy.Classification;
                record.RetentionDate = CalculateRetentionDate(policy.Period);
                record.RequiresApproval = policy.RequireApproval;

                record.Actions.Add(new RecordAction
                {
                    Id = record.Actions.Count + 1,
                    Action = "Retention Policy Applied",
                    PerformedBy = "System",
                    PerformedAt = DateTime.Now,
                    Notes = $"Applied policy: {policy.Name}"
                });

                await Task.Delay(100);

                return new ApiResponse<bool>
                {
                    Success = true,
                    Data = true,
                    Message = "Retention policy applied successfully"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error applying retention policy");
                return new ApiResponse<bool>
                {
                    Success = false,
                    Error = ex.Message
                };
            }
        }

        private DateTime? CalculateRetentionDate(string retentionPeriod)
        {
            if (string.IsNullOrEmpty(retentionPeriod) || retentionPeriod == "Permanent")
                return null;

            var now = DateTime.Now;
            return retentionPeriod switch
            {
                "1 Year" => now.AddYears(1),
                "3 Years" => now.AddYears(3),
                "5 Years" => now.AddYears(5),
                "7 Years" => now.AddYears(7),
                "10 Years" => now.AddYears(10),
                _ => now.AddYears(7) // Default to 7 years
            };
        }

        private static List<RecordRetentionPolicy> GetDefaultPolicies()
        {
            return new List<RecordRetentionPolicy>
            {
                new()
                {
                    Id = "policy-general",
                    Name = "General Business Records",
                    Description = "Standard retention for general business documents",
                    Period = "7 Years",
                    Classification = "Internal",
                    AutoArchive = true,
                    RequireApproval = false
                },
                new()
                {
                    Id = "policy-financial",
                    Name = "Financial Records",
                    Description = "Retention policy for financial and accounting documents",
                    Period = "10 Years",
                    Classification = "Confidential",
                    AutoArchive = true,
                    RequireApproval = true
                },
                new()
                {
                    Id = "policy-legal",
                    Name = "Legal Documents",
                    Description = "Retention policy for contracts and legal documents",
                    Period = "Permanent",
                    Classification = "Restricted",
                    AutoArchive = false,
                    RequireApproval = true
                },
                new()
                {
                    Id = "policy-hr",
                    Name = "HR Documents",
                    Description = "Employee records and HR documentation",
                    Period = "5 Years",
                    Classification = "Confidential",
                    AutoArchive = true,
                    RequireApproval = true
                }
            };
        }
    }
} 