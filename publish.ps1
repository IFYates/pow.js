param (
    [switch]$GoLive
)

# Copy items to IO
$dest = "$PSScriptRoot/../ifyates.github.io/pow.js"
@('coverage', 'examples', 'src') | ForEach-Object {
    Remove-Item -Path "$dest/$_" -Recurse -Force
    Copy-Item -Path "$PSScriptRoot/$_" -Recurse -Destination "$dest/$_"
}

# Keep version
$package = (ConvertFrom-Json (Get-Content "$PSScriptRoot/package.json" -Raw))
Remove-Item -Path "$dest/v$($package.version)" -Recurse -Force -ErrorAction Ignore
Copy-Item -Path "$PSScriptRoot/dist" -Recurse -Destination "$dest/v$($package.version)"
Remove-Item -Path "$dest/latest" -Recurse -Force
Copy-Item -Path "$PSScriptRoot/dist" -Recurse -Destination "$dest/latest"

# Documentation
Remove-Item -Path "$dest/docs" -Recurse -Force
Copy-Item -Path "$PSScriptRoot/docs" -Recurse -Destination "$dest/docs"

# NPM
if ($GoLive) {
    npm publish
} else {
    npm publish --dry-run
}