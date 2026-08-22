$ErrorActionPreference = "Stop"

$root = Join-Path $PSScriptRoot "..\..\apps\web\public\images\departments\gallery"
$api = "https://commons.wikimedia.org/w/api.php"
$departments = [ordered]@{
  "beni" = @("Llanos de Moxos Bolivia", "Trinidad Beni Bolivia", "Laguna Suarez Beni", "Rurrenabaque Bolivia landscape", "Beni Bolivia savanna")
  "chuquisaca" = @("Sucre Bolivia panorama", "Maragua crater Bolivia", "Tarabuco Bolivia", "Valle de Cinti Bolivia", "Castillo de La Glorieta Bolivia")
  "cochabamba" = @("Cochabamba Bolivia panorama", "Cristo de la Concordia", "Tunari Bolivia", "Incallajta Bolivia", "Torotoro Bolivia canyon")
  "la-paz" = @("La Paz Bolivia Illimani panorama", "Valle de la Luna La Paz Bolivia", "Tiwanaku Bolivia", "Lake Titicaca Bolivia", "Yungas Bolivia landscape")
  "oruro" = @("Sajama Bolivia", "Oruro Bolivia city", "Carnaval de Oruro", "Salar de Coipasa Bolivia", "Termas de Sajama Bolivia")
  "pando" = @("Cobija Bolivia", "Pando Bolivia rainforest", "Tahuamanu river Bolivia", "Bolivian Amazon rainforest", "Manuripi Bolivia")
  "potosi" = @("Cerro Rico Potosi Bolivia", "Uyuni salt flat Bolivia", "Potosi Bolivia colonial", "Laguna Colorada Bolivia", "Eduardo Avaroa reserve Bolivia")
  "santa-cruz" = @("Santa Cruz de la Sierra Bolivia plaza", "Amboro National Park Bolivia", "Samaipata Bolivia ruins", "Chiquitos Bolivia church", "Noel Kempff Mercado Bolivia")
  "tarija" = @("Tarija Bolivia panorama", "Valle de la Concepcion Tarija", "Casa Dorada Tarija", "San Jacinto Tarija Bolivia", "Cordillera de Sama Bolivia")
}

$manifest = @()
function Invoke-CommonsDownload([string]$Uri, [string]$Destination) {
  if (Test-Path -LiteralPath $Destination) { return }
  for ($attempt = 1; $attempt -le 6; $attempt++) {
    try {
      Invoke-WebRequest -Uri $Uri -OutFile $Destination -Headers @{ "User-Agent" = "SaraProject/1.0 (educational contact: local-project)" }
      return
    } catch {
      if ($attempt -eq 6) { throw }
      Start-Sleep -Seconds ([Math]::Min(12, $attempt * 2))
    }
  }
}
foreach ($department in $departments.Keys) {
  $directory = Join-Path $root $department
  New-Item -ItemType Directory -Force -Path $directory | Out-Null
  $index = 0
  foreach ($search in $departments[$department]) {
    $index++
    $params = @{
      action = "query"; format = "json"; generator = "search"; gsrsearch = $search
      gsrnamespace = 6; gsrlimit = 12; prop = "imageinfo"; iiprop = "url|mime|size|extmetadata"
      iiurlwidth = 1600
    }
    $response = Invoke-RestMethod -Uri $api -Body $params -Method Get -Headers @{ "User-Agent" = "SaraProject/1.0 (educational Bolivia gallery)" }
    $candidates = @($response.query.pages.PSObject.Properties.Value) | Where-Object {
      $_.imageinfo[0].mime -match '^image/(jpeg|png)$' -and $_.imageinfo[0].width -ge 900 -and $_.imageinfo[0].height -ge 550
    }
    $page = $candidates | Select-Object -First 1
    if (-not $page) { throw "No se encontró una fotografía válida para: $search" }
    $info = $page.imageinfo[0]
    $extension = if ($info.mime -eq "image/png") { "png" } else { "jpg" }
    $filename = "{0:d2}.$extension" -f $index
    $destination = Join-Path $directory $filename
    Invoke-CommonsDownload -Uri $info.thumburl -Destination $destination
    Start-Sleep -Milliseconds 650
    $metadata = $info.extmetadata
    $manifest += [ordered]@{
      department = $department
      query = $search
      file = "/images/departments/gallery/$department/$filename"
      title = $page.title -replace '^File:', ''
      source = $info.descriptionurl
      author = $metadata.Artist.value -replace '<[^>]+>', ''
      license = $metadata.LicenseShortName.value
      licenseUrl = $metadata.LicenseUrl.value
    }
  }
}

$manifestPath = Join-Path $root "gallery-manifest.json"
$manifest | ConvertTo-Json -Depth 5 | Set-Content -Encoding utf8 $manifestPath
Write-Host "Descargadas $($manifest.Count) imágenes en $root"
