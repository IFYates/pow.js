# Update header
$package = (ConvertFrom-Json (Get-Content ./package.json -Raw))
(Get-Content ./src/pow.js -Raw) -replace '@version\s+\d+\.\d+\.\d+',"@version $($package.version)" | Set-Content ./src/pow.js -NoNewline

# Count LOCs (winget install AlDanial.Cloc)
cloc src/pow.js

## Build
yarn terser src/pow.js -c -m -o dist/pow.min.js --source-map --toplevel
(Get-Content ./dist/pow.min.js -Raw) -replace '\bconst\b','let' | Set-Content ./dist/pow.min.js -NoNewline

yarn terser src/pow.safe.js -c -m -o dist/pow.safe.min.js --source-map --toplevel
(Get-Content ./dist/pow.safe.min.js -Raw) -replace '\bconst\b','let' -replace 'pow.js','pow.min.js' | Set-Content ./dist/pow.safe.min.js -NoNewline

# Minified size
$len = ((Get-Content ./dist/pow.min.js -Raw) -replace '(?s)/\*.*\*/', '').Trim().Length
Write-Host "> $len bytes ($($len / 1024) KiB)"