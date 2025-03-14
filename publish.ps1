param (
    [switch]$GoLive
)

# Copy items to IO
$dest = "$PSScriptRoot/../ifyates.github.io/pow.js"
@('coverage', 'examples') | ForEach-Object {
    Remove-Item -Path "$dest/$_" -Recurse -Force
    Copy-Item -Path "$PSScriptRoot/$_" -Recurse -Destination "$dest/$_"
}

# Keep version
$package = (ConvertFrom-Json (Get-Content "$PSScriptRoot/package.json" -Raw))
$version = $package.version.Split('.')[0..1] -join '.'
Remove-Item -Path "$dest/v$version" -Recurse -Force -ErrorAction Ignore
New-Item -Path "$dest/v$version" -ItemType Directory | Out-Null
Copy-Item -Path "$PSScriptRoot/src/*" -Recurse -Destination "$dest/v$version"
Copy-Item -Path "$PSScriptRoot/dist/*" -Recurse -Destination "$dest/v$version"
Remove-Item -Path "$dest/latest" -Recurse -Force
New-Item -Path "$dest/latest" -ItemType Directory | Out-Null
Copy-Item -Path "$PSScriptRoot/src/*" -Recurse -Destination "$dest/latest"
Copy-Item -Path "$PSScriptRoot/dist/*" -Recurse -Destination "$dest/latest"

# Documentation
Remove-Item -Path "$dest/docs" -Recurse -Force
Copy-Item -Path "$PSScriptRoot/docs" -Recurse -Destination "$dest/docs"

# NPM
if ($GoLive) {
    npm publish
} else {
    npm publish --dry-run
}