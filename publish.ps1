param (
    [switch]$GoLive
)

# Copy items to IO
$dest = "$PSScriptRoot/../ifyates.github.io/pow.js"
@('coverage', 'examples', 'src') | ForEach-Object {
    Remove-Item -Path "$dest/$_" -Recurse -Force
    Copy-Item -Path $_ -Recurse -Destination "$dest/$_"
}

# Keep version
$package = (ConvertFrom-Json (Get-Content ./package.json -Raw))
Remove-Item -Path "$dest/v$($package.version)" -Recurse -Force
Copy-Item -Path "dist" -Recurse -Destination "$dest/v$($package.version)"
Remove-Item -Path "$dest/latest" -Recurse -Force
Copy-Item -Path "dist" -Recurse -Destination "$dest/latest"

# NPM
if ($GoLive) {
    npm publish
} else {
    npm publish --dry-run
}