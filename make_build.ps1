Write-Debug "Make Build for Marble Fall"

if (Test-Path "../helios-build") {
    Remove-Item "../helios-build" -Recurse -Force
}
if (Test-Path "../helios-build.zip") {
    Remove-Item "../helios-build.zip" -Force
}

New-Item "../helios-build" -ItemType "directory"


Copy-Item -Path "./*" -Destination "../helios-build/" -Recurse -Force -Exclude ".git", "src", "lib", "work", ".vscode"

New-Item "../helios-build/lib" -ItemType "directory"
New-Item "../helios-build/lib/nabu" -ItemType "directory"
Copy-Item -Path "./lib/nabu/nabu.js" -Destination "../helios-build/lib/nabu/nabu.js"
New-Item "../helios-build/lib/mummu" -ItemType "directory"
Copy-Item -Path "./lib/mummu/mummu.js" -Destination "../helios-build/lib/mummu/mummu.js"
New-Item "../helios-build/lib/kulla-grid" -ItemType "directory"
Copy-Item -Path "./lib/kulla-grid/kulla-grid.js" -Destination "../helios-build/lib/kulla-grid/kulla-grid.js"

Copy-Item -Path "./lib/babylon.js" -Destination "../helios-build/lib/babylon.js"
Copy-Item -Path "./lib/babylonjs.loaders.js" -Destination "../helios-build/lib/babylonjs.loaders.js"

Get-ChildItem -Path "../helios-build/" "*.blend" -Recurse | ForEach-Object { Remove-Item -Path $_.FullName }
Get-ChildItem -Path "../helios-build/" "*.blend1" -Recurse | ForEach-Object { Remove-Item -Path $_.FullName }
Get-ChildItem -Path "../helios-build/" "*.babylon.manifest" -Recurse | ForEach-Object { Remove-Item -Path $_.FullName }
Get-ChildItem -Path "../helios-build/" "*.log" -Recurse | ForEach-Object { Remove-Item -Path $_.FullName }
Get-ChildItem -Path "../helios-build/" "*.xcf" -Recurse | ForEach-Object { Remove-Item -Path $_.FullName }
Get-ChildItem -Path "../helios-build/" "*.d.ts" -Recurse | ForEach-Object { Remove-Item -Path $_.FullName }
Get-ChildItem -Path "../helios-build/" "*.pdn" -Recurse | ForEach-Object { Remove-Item -Path $_.FullName }
Get-ChildItem -Path "../helios-build/" "*.kra" -Recurse | ForEach-Object { Remove-Item -Path $_.FullName }
Get-ChildItem -Path "../helios-build/" "*.*~" -Recurse | ForEach-Object { Remove-Item -Path $_.FullName }

Remove-Item -Path "../helios-build/.gitignore"
Remove-Item -Path "../helios-build/make_build.ps1"
Remove-Item -Path "../helios-build/tsconfig.json"

(Get-Content "../helios-build/index.js").Replace('./lib/babylon.max.js', './lib/babylon.js') | Set-Content "../helios-build/index.js"
(Get-Content "../helios-build/helios.js").Replace('this.DEBUG_MODE = true', 'this.DEBUG_MODE = false') | Set-Content "../helios-build/helios.js"
(Get-Content "../helios-build/helios.js").Replace('this.DEBUG_USE_LOCAL_STORAGE = true', 'this.DEBUG_USE_LOCAL_STORAGE = false') | Set-Content "../helios-build/helios.js"