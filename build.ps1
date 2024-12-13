# Count LOCs (winget install AlDanial.Cloc)
cloc src/pow.js

## Build
yarn terser src/pow.js -c -m -o dist/pow.min.js --source-map
Set-Content ./dist/pow.min.js -Value ((Get-Content ./dist/pow.min.js -Raw) -replace '\bconst\b', 'let')

# Minified size
$len = ((Get-Content ./dist/pow.min.js -Raw) -replace '(?s)/\*.*\*/', '').Trim().Length
Write-Host "> $len bytes ($($len / 1024) KiB)"