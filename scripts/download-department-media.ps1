param(
  [string]$OutputRoot = "apps/web/public/images/departments"
)

$ErrorActionPreference = "Stop"
$api = "https://commons.wikimedia.org/w/api.php"
$items = @(
  @{ Department = "beni"; Kind = "lugares"; Slug = "llanos-de-moxos"; Query = "Llanos de Moxos Bolivia" },
  @{ Department = "beni"; Kind = "platos"; Slug = "masaco"; Query = "Masaco Bolivia food" },
  @{ Department = "chuquisaca"; Kind = "lugares"; Slug = "sucre"; Query = "Sucre Bolivia plaza city" },
  @{ Department = "chuquisaca"; Kind = "platos"; Slug = "mondongo"; Query = "Mondongo Bolivia" },
  @{ Department = "cochabamba"; Kind = "lugares"; Slug = "cochabamba"; Query = "Cochabamba Bolivia city landscape" },
  @{ Department = "cochabamba"; Kind = "platos"; Slug = "silpancho"; Query = "Silpancho Bolivia" },
  @{ Department = "la-paz"; Kind = "lugares"; Slug = "illimani"; Query = "Illimani La Paz Bolivia" },
  @{ Department = "la-paz"; Kind = "platos"; Slug = "plato-paceno"; Query = "Plato paceno Bolivia" },
  @{ Department = "oruro"; Kind = "lugares"; Slug = "sajama"; Query = "Sajama Oruro Bolivia" },
  @{ Department = "oruro"; Kind = "platos"; Slug = "charque Oruro Bolivia" },
  @{ Department = "pando"; Kind = "lugares"; Slug = "amazonia-pandina"; Query = "Pando Bolivia Amazon rainforest" },
  @{ Department = "pando"; Kind = "platos"; Slug = "pescado-amazonico"; Query = "Amazon fish food Bolivia" },
  @{ Department = "potosi"; Kind = "lugares"; Slug = "cerro-rico"; Query = "Cerro Rico Potosi Bolivia" },
  @{ Department = "potosi"; Kind = "platos"; Slug = "kalapurka"; Query = "Kalapurca Bolivia" },
  @{ Department = "santa-cruz"; Kind = "lugares"; Slug = "amboro"; Query = "Amboro National Park Bolivia" },
  @{ Department = "santa-cruz"; Kind = "platos"; Slug = "majadito"; Query = "Majao Bolivia food" },
  @{ Department = "tarija"; Kind = "lugares"; Slug = "valle-central"; Query = "Tarija Bolivia vineyard valley" },
  @{ Department = "tarija"; Kind = "platos"; Slug = "saice"; Query = "Saice Bolivia" }
)

$manifest = @()
function Save-RemoteImage([string]$Uri, [string]$Destination) {
  for ($attempt = 1; $attempt -le 5; $attempt += 1) {
    try {
      Invoke-WebRequest -Uri $Uri -OutFile $Destination -Headers @{
        "User-Agent" = "SaraProject/0.1 (educational Bolivia catalog; contact: project repository)"
        "Accept" = "image/avif,image/webp,image/png,image/jpeg,*/*"
      }
      return
    } catch {
      if ($attempt -eq 5) { throw }
      Start-Sleep -Seconds (3 * $attempt)
    }
  }
}

function Get-CommonsResult([string]$Uri) {
  for ($attempt = 1; $attempt -le 5; $attempt += 1) {
    try {
      return Invoke-RestMethod -Uri $Uri -Headers @{ "User-Agent" = "SaraProject/0.1 educational-media-catalog" }
    } catch {
      if ($attempt -eq 5) { throw }
      Start-Sleep -Seconds (5 * $attempt)
    }
  }
}

foreach ($item in $items) {
  $params = @{
    action = "query"
    format = "json"
    generator = "search"
    gsrsearch = $item.Query
    gsrnamespace = 6
    gsrlimit = 8
    prop = "imageinfo"
    iiprop = "url|mime|extmetadata"
    iiurlwidth = 1400
  }
  $query = ($params.GetEnumerator() | ForEach-Object {
    "{0}={1}" -f [uri]::EscapeDataString($_.Key), [uri]::EscapeDataString([string]$_.Value)
  }) -join "&"
  $response = Get-CommonsResult -Uri "$api`?$query"
  $pages = @($response.query.pages.PSObject.Properties.Value)
  $page = $pages | Where-Object {
    $_ -and $_.imageinfo -and $_.imageinfo[0] -and
      $_.imageinfo[0].mime -match '^image/(jpeg|png|webp)$' -and $_.imageinfo[0].thumburl
  } | Select-Object -First 1
  if (-not $page) {
    Write-Warning "Sin resultado: $($item.Department) / $($item.Kind)"
    continue
  }

  $info = $page.imageinfo[0]
  $extension = if ($info.thumbmime -eq "image/png") { "png" } else { "jpg" }
  $directory = Join-Path $OutputRoot (Join-Path $item.Department $item.Kind)
  New-Item -ItemType Directory -Force -Path $directory | Out-Null
  $relativePath = "$($item.Department)/$($item.Kind)/$($item.Slug).$extension"
  $destination = Join-Path $OutputRoot $relativePath
  Save-RemoteImage -Uri $info.thumburl -Destination $destination

  $metadata = $info.extmetadata
  $manifest += [ordered]@{
    department = $item.Department
    category = $item.Kind
    subject = $item.Slug
    file = "/images/departments/$relativePath"
    title = $page.title -replace '^File:', ''
    author = $metadata.Artist.value
    license = $metadata.LicenseShortName.value
    licenseUrl = $metadata.LicenseUrl.value
    source = $info.descriptionurl
  }
  Write-Host "Descargado: $relativePath"
  Start-Sleep -Seconds 4
}

$manifestPath = Join-Path $OutputRoot "media-manifest.json"
$manifest | ConvertTo-Json -Depth 6 | Set-Content -Encoding utf8 $manifestPath
Write-Host "Manifiesto: $manifestPath ($($manifest.Count) recursos)"
