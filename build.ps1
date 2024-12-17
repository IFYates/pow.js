# Update header
$package = (ConvertFrom-Json (Get-Content ./package.json -Raw))
(Get-Content ./src/pow.js -Raw) -replace '@version\s+\d+\.\d+\.\d+',"@version $($package.version)" | Set-Content ./src/pow.js -NoNewline
(Get-Content ./src/pow.safe.js -Raw) -replace '@version\s+\d+\.\d+\.\d+',"@version $($package.version)" | Set-Content ./src/pow.safe.js -NoNewline

# Count LOCs (winget install AlDanial.Cloc)
cloc src --by-file

## Build
yarn terser src/pow.js -c -m -o dist/pow.min.js --source-map --toplevel
(Get-Content ./dist/pow.min.js -Raw) -replace '\bconst\b','let' | Set-Content ./dist/pow.min.js -NoNewline
$len1 = ((Get-Content ./dist/pow.min.js -Raw) -replace '(?s)/\*.*\*/', '').Trim().Length
Write-Host "pow.min.js> $len1 bytes ($($len1 / 1024) KiB)"

yarn terser src/pow.safe.js -c -m -o dist/pow.safe.min.js --source-map --toplevel
(Get-Content ./dist/pow.safe.min.js -Raw) -replace '\bconst\b','let' -replace 'pow.js','pow.min.js' | Set-Content ./dist/pow.safe.min.js -NoNewline
$len2 = ((Get-Content ./dist/pow.safe.min.js -Raw) -replace '(?s)/\*.*\*/', '').Trim().Length
Write-Host "pow.safe.min.js> $len2 bytes ($($len2 / 1024) KiB)"

$len = $len1 + $len2
Write-Host "Total> $len bytes ($($len / 1024) KiB)"