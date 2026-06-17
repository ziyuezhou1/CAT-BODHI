param(
  [Parameter(Mandatory = $true)]
  [string]$AccessKey,

  [Parameter(Mandatory = $true)]
  [string]$SecretKey,

  [string]$Endpoint = "s3.xiteng.site",
  [string]$Bucket = "models",
  [string]$Prefix = "sprite_alpha_seg",
  [string]$Region = "us-east-1",
  [string]$ModelRoot = "D:\sprite_alpha_seg_pytorch",
  [ValidateSet("all", "requirements", "script", "source", "sourceFlat", "checkpoint", "checkpointFlat")]
  [string]$Only = "all"
)

$ErrorActionPreference = "Stop"
$Service = "s3"
$Endpoint = $Endpoint -replace "^https?://", ""

function Get-HexSha256Bytes([byte[]]$Bytes) {
  $sha = [System.Security.Cryptography.SHA256]::Create()
  try {
    return ([System.BitConverter]::ToString($sha.ComputeHash($Bytes))).Replace("-", "").ToLowerInvariant()
  } finally {
    $sha.Dispose()
  }
}

function Get-HmacSha256([byte[]]$Key, [string]$Data) {
  $hmac = [System.Security.Cryptography.HMACSHA256]::new($Key)
  try {
    return $hmac.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($Data))
  } finally {
    $hmac.Dispose()
  }
}

function Invoke-S3PutBytes([string]$CanonicalUri, [byte[]]$Content, [string]$Label) {
  $date = (Get-Date).ToUniversalTime()
  $dateStamp = $date.ToString("yyyyMMdd")
  $amzDate = $date.ToString("yyyyMMddTHHmmssZ")
  $contentHash = Get-HexSha256Bytes $Content
  $canonicalHeaders = "host:$Endpoint`nx-amz-content-sha256:$contentHash`nx-amz-date:$amzDate`n"
  $signedHeaders = "host;x-amz-content-sha256;x-amz-date"
  $canonicalRequest = "PUT`n$CanonicalUri`n`n$canonicalHeaders`n$signedHeaders`n$contentHash"
  $canonicalRequestHash = Get-HexSha256Bytes ([System.Text.Encoding]::UTF8.GetBytes($canonicalRequest))
  $stringToSign = "AWS4-HMAC-SHA256`n$amzDate`n$dateStamp/$Region/$Service/aws4_request`n$canonicalRequestHash"

  $kSecret = [System.Text.Encoding]::UTF8.GetBytes("AWS4$SecretKey")
  $kDate = Get-HmacSha256 $kSecret $dateStamp
  $kRegion = Get-HmacSha256 $kDate $Region
  $kService = Get-HmacSha256 $kRegion $Service
  $kSigning = Get-HmacSha256 $kService "aws4_request"
  $signature = ([System.BitConverter]::ToString((Get-HmacSha256 $kSigning $stringToSign))).Replace("-", "").ToLowerInvariant()
  $auth = "AWS4-HMAC-SHA256 Credential=$AccessKey/$dateStamp/$Region/$Service/aws4_request, SignedHeaders=$signedHeaders, Signature=$signature"

  $headers = @{
    "x-amz-date" = $amzDate
    "x-amz-content-sha256" = $contentHash
    "Authorization" = $auth
  }

  $url = "https://$Endpoint$CanonicalUri"
  try {
    $request = @{
      Uri = $url
      Method = "Put"
      Body = $Content
      Headers = $headers
      TimeoutSec = 300
      UseBasicParsing = $true
    }
    if ((Get-Command Invoke-WebRequest).Parameters.ContainsKey("SkipHeaderValidation")) {
      $request.SkipHeaderValidation = $true
    }
    $response = Invoke-WebRequest @request
    Write-Host "Uploaded: $Label -> HTTP $($response.StatusCode)"
  } catch {
    $status = $_.Exception.Response.StatusCode.value__
    if ($Label -eq "bucket $Bucket" -and ($status -eq 409 -or $status -eq 200)) {
      Write-Host "Bucket exists: $Bucket"
      return
    }
    throw
  }
}

function Invoke-S3UploadFile([string]$Key, [string]$LocalFile) {
  if (-not (Test-Path -LiteralPath $LocalFile)) {
    throw "Missing file: $LocalFile"
  }
  $content = [System.IO.File]::ReadAllBytes($LocalFile)
  Invoke-S3PutBytes "/$Bucket/$Key" $content $Key
}

$uploads = @(
  @{ Name = "script"; Key = "$Prefix/infer_spritesheet_hybrid.py"; Path = (Join-Path $ModelRoot "infer_spritesheet_hybrid.py") },
  @{ Name = "requirements"; Key = "$Prefix/requirements.txt"; Path = (Join-Path $ModelRoot "requirements.txt") },
  @{ Name = "source"; Key = "$Prefix/src/model_unet.py"; Path = (Join-Path $ModelRoot "src\model_unet.py") },
  @{ Name = "checkpoint"; Key = "$Prefix/checkpoints/unet_sprite_ft.pt"; Path = (Join-Path $ModelRoot "checkpoints\unet_sprite_ft.pt") },
  @{ Name = "sourceFlat"; Key = "$Prefix/model_unet.py"; Path = (Join-Path $ModelRoot "src\model_unet.py") },
  @{ Name = "checkpointFlat"; Key = "$Prefix/unet_sprite_ft.pt"; Path = (Join-Path $ModelRoot "checkpoints\unet_sprite_ft.pt") }
)

Invoke-S3PutBytes "/$Bucket" ([byte[]]::new(0)) "bucket $Bucket"
foreach ($upload in $uploads) {
  if ($Only -eq "all" -or $Only -eq $upload.Name) {
    Invoke-S3UploadFile $upload.Key $upload.Path
  }
}

Write-Host "Done. Uploaded sprite model package selection '$Only' to s3://$Bucket/$Prefix/"
