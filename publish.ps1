# Copy items to IO
$dest = "$PSScriptRoot/../ifyates.github.io/pow.js"
Remove-Item -Path "$dest/*" -Recurse -Force
@('coverage', 'dist', 'examples', 'src') | ForEach-Object {
    Copy-Item -Path $_ -Recurse -Destination "$dest/$_"
}

# NPM
npm publish