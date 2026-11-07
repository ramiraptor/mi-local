# Despliegue a producción en Netlify usando token (sin `netlify login`).
# Lee SOLO las variables NETLIFY_* desde .env.ops (gitignoreado, nunca en el repo).
# Uso:  .\scripts\deploy.ps1
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

$opsFile = Join-Path $root ".env.ops"
if (-not (Test-Path $opsFile)) { throw "No existe $opsFile (ahí van NETLIFY_AUTH_TOKEN y NETLIFY_SITE_ID)." }

Get-Content $opsFile | ForEach-Object {
  if ($_ -match '^\s*(NETLIFY_[A-Z_]+)\s*=\s*(.+?)\s*$') {
    Set-Item -Path "env:$($Matches[1])" -Value $Matches[2]
  }
}
if (-not $env:NETLIFY_AUTH_TOKEN -or -not $env:NETLIFY_SITE_ID) {
  throw "Faltan NETLIFY_AUTH_TOKEN o NETLIFY_SITE_ID en .env.ops"
}

# .next corrupto por builds concurrentes rompe el deploy: siempre partir limpio
Remove-Item -Recurse -Force (Join-Path $root ".next") -ErrorAction SilentlyContinue

Push-Location $root
try {
  npx netlify deploy --build --prod
} finally {
  Pop-Location
}
