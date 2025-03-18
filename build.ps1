# Update header
$package = (ConvertFrom-Json (Get-Content ./package.json -Raw))
(Get-Content ./src/pow.js -Raw) -replace '@version\s+\d+\.\d+\.\d+',"@version $($package.version)" | Set-Content ./src/pow.js -NoNewline
(Get-Content ./src/pow.safe.js -Raw) -replace '@version\s+\d+\.\d+\.\d+',"@version $($package.version)" | Set-Content ./src/pow.safe.js -NoNewline

# Count LOCs (winget install AlDanial.Cloc)
cloc src --by-file

# Extra minification
function Get-Minified ([Parameter(ValueFromPipeline=$true)][string]$InputObject) {
    $props = @(
        #'apply'
        'attributes'
        #'call'
        'innerHTML'
        'nextElementSibling'
        'outerHTML'
        #'refresh'
        'replace'
        'replaceWith'
        #'slice'
    )
    $vars = ""
    for ($i = 0; $i -lt $props.Length; $i++) {
        $vars += "PH$i='$($props[$i])',"
        $InputObject = $InputObject -replace "\?\.$($props[$i])\b","?.[PH$i]" `
            -replace "\.$($props[$i])\b","[PH$i]" `
            -replace "([{,\s])$($props[$i])\s*:","$1[PH$i]:"
    }

    return $InputObject -replace ' \*/'," */`r`nconst $($vars.Trim(','));" `
        -replace '\bconst\b','var'
}

## Build
Get-Content ./src/pow.js -Raw | Get-Minified | yarn terser -c -m -o dist/pow.min.js --source-map --toplevel
$len1 = ((Get-Content ./dist/pow.min.js -Raw) -replace '(?s)/\*.*\*/', '').Trim().Length
Write-Host "pow.min.js> $len1 bytes ($($len1 / 1024) KiB)"

Get-Content ./src/pow.safe.js -Raw | Get-Minified | yarn terser -c -m -o dist/pow.safe.min.js --source-map --toplevel
(Get-Content ./dist/pow.safe.min.js -Raw) -replace 'pow.js','pow.min.js' | Set-Content ./dist/pow.safe.min.js -NoNewline
$len2 = ((Get-Content ./dist/pow.safe.min.js -Raw) -replace '(?s)/\*.*\*/', '').Trim().Length
Write-Host "pow.safe.min.js> $len2 bytes ($($len2 / 1024) KiB)"

$len = $len1 + $len2
Write-Host "Total> $len bytes ($($len / 1024) KiB)"