param(
    [string]$IdentityApiBaseUrl = 'https://sflow-kong.salmonwave-4030412c.southeastasia.azurecontainerapps.io/identity/api/v1/identity',
    [string]$AdminEmail = 'admin@demo.gov.bn',
    [string]$ClientId = 'collabdoc-ui-spa',
    [string]$DisplayName = 'CollabDoc UI',
    [string]$Audience = 'govstack.workflow',
    [string[]]$RedirectUris = @(
        'http://localhost:3000/auth/callback',
        'http://localhost:3001/auth/callback',
        'https://collabdocweb-fresh.azurewebsites.net/auth/callback'
    ),
    [string[]]$Scopes = @(
        'openid',
        'profile',
        'email',
        'roles',
        'offline_access',
        'govstack.workflow'
    ),
    [string[]]$GrantTypes = @(
        'authorization_code',
        'refresh_token'
    ),
    [switch]$UpdateExisting
)

$ErrorActionPreference = 'Stop'

function ConvertTo-PlainText {
    param([securestring]$SecureString)

    $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecureString)
    try {
        return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
    }
    finally {
        if ($bstr -ne [IntPtr]::Zero) {
            [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
        }
    }
}

function Get-ErrorBody {
    param($ErrorRecord)

    $response = $ErrorRecord.Exception.Response
    if (-not $response) {
        return $ErrorRecord.Exception.Message
    }

    try {
        $stream = $response.GetResponseStream()
        if (-not $stream) {
            return $ErrorRecord.Exception.Message
        }

        $reader = [System.IO.StreamReader]::new($stream)
        return $reader.ReadToEnd()
    }
    catch {
        return $ErrorRecord.Exception.Message
    }
}

function Invoke-IdentityJson {
    param(
        [Parameter(Mandatory = $true)][string]$Method,
        [Parameter(Mandatory = $true)][string]$Uri,
        [hashtable]$Headers,
        $Body
    )

    $parameters = @{
        Method = $Method
        Uri = $Uri
        ContentType = 'application/json'
    }

    if ($Headers) {
        $parameters.Headers = $Headers
    }

    if ($null -ne $Body) {
        $parameters.Body = ($Body | ConvertTo-Json -Depth 10)
    }

    return Invoke-RestMethod @parameters
}

function Get-ClientToken {
    param($LoginResponse)

    foreach ($property in @('token', 'accessToken', 'access_token')) {
        if ($LoginResponse.PSObject.Properties.Name -contains $property -and $LoginResponse.$property) {
            return $LoginResponse.$property
        }
    }

    return $null
}

$IdentityApiBaseUrl = $IdentityApiBaseUrl.TrimEnd('/')
$securePassword = Read-Host -AsSecureString "Password for $AdminEmail"
$password = ConvertTo-PlainText $securePassword

try {
    $login = Invoke-IdentityJson -Method Post -Uri "$IdentityApiBaseUrl/auth/login" -Body @{
        email = $AdminEmail
        password = $password
    }
}
finally {
    $password = $null
}

$token = Get-ClientToken $login
if (-not $token) {
    throw 'Login succeeded, but the response did not include token, accessToken, or access_token.'
}

$headers = @{ Authorization = "Bearer $token" }
$clientUrl = "$IdentityApiBaseUrl/clients/$ClientId"
$payload = @{
    clientId = $ClientId
    displayName = $DisplayName
    description = 'CollabDoc browser application using SFlow Identity PKCE'
    audience = $Audience
    redirectUris = $RedirectUris
    scopes = $Scopes
    grantTypes = $GrantTypes
    type = 1
    createdBy = 'collabdoc-setup'
}

$existingClient = $null
try {
    $existingClient = Invoke-IdentityJson -Method Get -Uri $clientUrl -Headers $headers
}
catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -ne 404) {
        throw "Failed to check existing client: $(Get-ErrorBody $_)"
    }
}

if ($existingClient) {
    if ($UpdateExisting) {
        Write-Warning 'Updating existing clients may rewrite redirectUris using the SFlow update endpoint. Prefer creating a fresh client if authorization starts failing.'
        Invoke-IdentityJson -Method Put -Uri $clientUrl -Headers $headers -Body @{
            displayName = $DisplayName
            description = $payload.description
            redirectUris = $RedirectUris
            scopes = $Scopes
            grantTypes = $GrantTypes
            isActive = $true
        } | Out-Null

        $action = 'updated'
    }
    else {
        $action = 'exists'
    }
}
else {
    Invoke-IdentityJson -Method Post -Uri "$IdentityApiBaseUrl/clients" -Headers $headers -Body $payload | Out-Null
    $action = 'created'
}

$verified = Invoke-IdentityJson -Method Get -Uri $clientUrl -Headers $headers

[pscustomobject]@{
    ok = $true
    action = $action
    clientId = $verified.clientId
    displayName = $verified.displayName
    audience = $verified.audience
    redirectUris = $verified.redirectUris
    scopes = $verified.scopes
    grantTypes = $verified.grantTypes
    type = $verified.type
    isActive = $verified.isActive
    hasClientSecret = $verified.hasClientSecret
} | ConvertTo-Json -Depth 10