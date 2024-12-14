# Update header
$package = (ConvertFrom-Json (Get-Content ./package.json -Raw))
Set-Content ./src/pow.js -Value ((Get-Content ./src/pow.js -Raw) -replace '@version\s+\d+\.\d+\.\d+', "@version $($package.version)") -NoNewline

# Count LOCs (winget install AlDanial.Cloc)
cloc src/pow.js

## Build
yarn terser src/pow.js -c -m -o dist/pow.min.js --source-map --toplevel
Set-Content ./dist/pow.min.js -Value ((Get-Content ./dist/pow.min.js -Raw) -replace '\bconst\b', 'let') -NoNewline

# Minified size
$len = ((Get-Content ./dist/pow.min.js -Raw) -replace '(?s)/\*.*\*/', '').Trim().Length
Write-Host "> $len bytes ($($len / 1024) KiB)"