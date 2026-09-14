# ==============================================================================
# Tern Clean-URL Static & API Web Server (PowerShell Native)
# Zero external dependencies. Fully handles clean URLs, static assets, and APIs.
# ==============================================================================

param(
    [int]$Port = 3000
)

$ErrorActionPreference = "Continue"
$rootDir = $PSScriptRoot
if (-not $rootDir) { $rootDir = Get-Location }

$listener = New-Object System.Net.HttpListener
$prefix = "http://localhost:$Port/"
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
} catch {
    Write-Error "Failed to start HttpListener on $prefix : $_"
    exit 1
}

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Tern Web Application running!" -ForegroundColor Green
Write-Host "  URL: $prefix" -ForegroundColor Yellow
Write-Host "  Serving from: $rootDir" -ForegroundColor DarkGray
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$mimeTypes = @{
    ".html"  = "text/html; charset=utf-8"
    ".js"    = "application/javascript; charset=utf-8"
    ".mjs"   = "application/javascript; charset=utf-8"
    ".css"   = "text/css; charset=utf-8"
    ".json"  = "application/json; charset=utf-8"
    ".png"   = "image/png"
    ".jpg"   = "image/jpeg"
    ".jpeg"  = "image/jpeg"
    ".webp"  = "image/webp"
    ".svg"   = "image/svg+xml"
    ".ico"   = "image/x-icon"
    ".mp4"   = "video/mp4"
    ".woff2" = "font/woff2"
    ".woff"  = "font/woff"
    ".ttf"   = "font/ttf"
}

# Sample live prices for API
$marketPricesJson = @"
{
  "ETH": { "symbol": "ETH", "name": "Ether", "kind": "crypto", "price": 2478.50, "change24h": 0.0182, "high24h": 2511.40, "low24h": 2463.00, "funding1h": "0.0118%", "poolTvl": "$12.4M", "logo": "/logos/ETH.png" },
  "BTC": { "symbol": "BTC", "name": "Bitcoin", "kind": "crypto", "price": 96240.00, "change24h": -0.0064, "high24h": 97100.00, "low24h": 95400.00, "funding1h": "0.0092%", "poolTvl": "$28.5M", "logo": "/logos/BTC.png" },
  "SOL": { "symbol": "SOL", "name": "Solana", "kind": "crypto", "price": 102.92, "change24h": -0.0158, "high24h": 105.10, "low24h": 101.30, "funding1h": "0.0142%", "poolTvl": "$16.2M", "logo": "/logos/SOL.svg" },
  "USDT": { "symbol": "USDT", "name": "Tether USD", "kind": "crypto", "price": 1.00, "change24h": 0.0002, "high24h": 1.001, "low24h": 0.999, "funding1h": "0.0010%", "poolTvl": "$42.1M", "logo": "/logos/USDT.svg" },
  "USDC": { "symbol": "USDC", "name": "USD Coin", "kind": "crypto", "price": 1.00, "change24h": 0.0000, "high24h": 1.000, "low24h": 0.999, "funding1h": "0.0010%", "poolTvl": "$38.4M", "logo": "/logos/USDC.svg" },
  "NVDA": { "symbol": "NVDA", "name": "NVIDIA", "kind": "rwa", "price": 229.80, "change24h": 0.0241, "high24h": 232.50, "low24h": 226.10, "funding1h": "0.0205%", "poolTvl": "$3.82M", "logo": "/logos/NVDA.svg" },
  "SPY": { "symbol": "SPY", "name": "S&P 500 ETF", "kind": "rwa", "price": 766.40, "change24h": 0.0037, "high24h": 769.00, "low24h": 763.20, "funding1h": "0.0041%", "poolTvl": "$5.14M", "logo": "/logos/SPY.svg" }
}
"@

function Send-Response {
    param(
        $Response,
        [int]$StatusCode,
        [string]$ContentType,
        [byte[]]$ContentBytes
    )
    try {
        $Response.StatusCode = $StatusCode
        $Response.ContentType = $ContentType
        $Response.AddHeader("Access-Control-Allow-Origin", "*")
        $Response.AddHeader("Cache-Control", "no-cache, no-store, must-revalidate")
        $Response.ContentLength64 = $ContentBytes.Length
        $output = $Response.OutputStream
        $output.Write($ContentBytes, 0, $ContentBytes.Length)
        $output.Close()
    } catch {
        # Client may have aborted
    }
}

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $rawUrl = $request.Url.AbsolutePath
        $decodedUrl = [System.Uri]::UnescapeDataString($rawUrl)

        # CORS preflight
        if ($request.HttpMethod -eq "OPTIONS") {
            $response.StatusCode = 204
            $response.AddHeader("Access-Control-Allow-Origin", "*")
            $response.AddHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            $response.AddHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")
            $response.OutputStream.Close()
            continue
        }

        # API Routes
        if ($decodedUrl -eq "/api/market-prices") {
            $bytes = [System.Text.Encoding]::UTF8.GetBytes($marketPricesJson)
            Send-Response -Response $response -StatusCode 200 -ContentType "application/json; charset=utf-8" -ContentBytes $bytes
            continue
        }

        if ($decodedUrl -eq "/api/ticker") {
            $tickerObj = '{"symbol":"ETHUSDT","price":2478.50,"change24h":0.0182,"high24h":2511.40,"low24h":2463.00,"volume":124500}'
            $bytes = [System.Text.Encoding]::UTF8.GetBytes($tickerObj)
            Send-Response -Response $response -StatusCode 200 -ContentType "application/json; charset=utf-8" -ContentBytes $bytes
            continue
        }

        # Clean URLs routing
        $targetFile = $null

        if ($decodedUrl -eq "/" -or $decodedUrl -eq "/index.html") {
            $targetFile = Join-Path $rootDir "index.html"
        }
        elseif ($decodedUrl -eq "/radar") {
            $targetFile = Join-Path $rootDir "pages\radar.html"
        }
        elseif ($decodedUrl -like "/trade*" -or $decodedUrl -eq "/trade/ETH") {
            $targetFile = Join-Path $rootDir "pages\trade_eth.html"
        }
        elseif ($decodedUrl -eq "/portfolio") {
            $targetFile = Join-Path $rootDir "pages\portfolio.html"
        }
        elseif ($decodedUrl -eq "/yield") {
            $targetFile = Join-Path $rootDir "pages\yield.html"
        }
        elseif ($decodedUrl -eq "/theses") {
            $targetFile = Join-Path $rootDir "pages\theses.html"
        }
        elseif ($decodedUrl -eq "/recharge") {
            $targetFile = Join-Path $rootDir "pages\recharge.html"
        }
        elseif ($decodedUrl -eq "/launch") {
            $targetFile = Join-Path $rootDir "pages\launch.html"
        }
        elseif ($decodedUrl -eq "/docs") {
            $targetFile = Join-Path $rootDir "pages\docs.html"
        }
        elseif ($decodedUrl -like "/docs/*") {
            $slug = $decodedUrl.Substring(6).Trim("/")
            $docPath = Join-Path $rootDir "pages\docs\$slug.html"
            if (Test-Path $docPath) {
                $targetFile = $docPath
            } else {
                $targetFile = Join-Path $rootDir "pages\docs.html"
            }
        }
        elseif ($decodedUrl -like "/logos/*") {
            $logoName = [System.IO.Path]::GetFileName($decodedUrl)
            $possible = @(
                (Join-Path $rootDir "logos\$logoName"),
                (Join-Path $rootDir "public\logos\$logoName")
            )
            foreach ($p in $possible) {
                if (Test-Path $p) { $targetFile = $p; break }
            }
            if (-not $targetFile) {
                # Dynamic SVG badge fallback
                $sym = [System.IO.Path]::GetFileNameWithoutExtension($logoName).ToUpper()
                $svg = @"
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="30" fill="#ff5500" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>
  <text x="32" y="38" text-anchor="middle" fill="#ffffff" font-family="-apple-system,BlinkMacSystemFont,Inter,sans-serif" font-weight="700" font-size="14">$sym</text>
</svg>
"@
                $bytes = [System.Text.Encoding]::UTF8.GetBytes($svg)
                Send-Response -Response $response -StatusCode 200 -ContentType "image/svg+xml" -ContentBytes $bytes
                continue
            }
        }
        else {
            # Try direct file resolution
            $relPath = $decodedUrl.TrimStart("/").Replace("/", "\")
            $candidates = @(
                (Join-Path $rootDir $relPath),
                (Join-Path $rootDir "public\$relPath"),
                (Join-Path $rootDir "pages\$relPath")
            )
            foreach ($c in $candidates) {
                if ((Test-Path -Path $c -PathType Leaf)) {
                    $targetFile = $c
                    break
                }
            }
        }

        if ($targetFile -and (Test-Path -Path $targetFile -PathType Leaf)) {
            $ext = [System.IO.Path]::GetExtension($targetFile).ToLower()
            $mime = "application/octet-stream"
            if ($mimeTypes.ContainsKey($ext)) {
                $mime = $mimeTypes[$ext]
            }
            $fileBytes = [System.IO.File]::ReadAllBytes($targetFile)
            Send-Response -Response $response -StatusCode 200 -ContentType $mime -ContentBytes $fileBytes
        }
        else {
            $notFoundHtml = "<h1>404 Not Found</h1><p><a href='/'>Return to Tern</a></p>"
            $bytes = [System.Text.Encoding]::UTF8.GetBytes($notFoundHtml)
            Send-Response -Response $response -StatusCode 404 -ContentType "text/html; charset=utf-8" -ContentBytes $bytes
        }
    } catch {
        # Loop continues
    }
}
