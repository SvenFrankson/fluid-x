Write-Debug "Make Build for Marble Fall"

if (Test-Path "../carillion-build") {
    Remove-Item "../carillion-build" -Recurse -Force
}
if (Test-Path "../carillion-build.zip") {
    Remove-Item "../carillion-build.zip" -Force
}

New-Item "../carillion-build" -ItemType "directory"


Copy-Item -Path "./*" -Destination "../carillion-build/" -Recurse -Force -Exclude ".git", "src", "lib", "work", ".vscode"

New-Item "../carillion-build/lib" -ItemType "directory"
New-Item "../carillion-build/lib/nabu" -ItemType "directory"
Copy-Item -Path "./lib/nabu/nabu.js" -Destination "../carillion-build/lib/nabu/nabu.js"
New-Item "../carillion-build/lib/mummu" -ItemType "directory"
Copy-Item -Path "./lib/mummu/mummu.js" -Destination "../carillion-build/lib/mummu/mummu.js"

Copy-Item -Path "./lib/babylon.js" -Destination "../carillion-build/lib/babylon.js"
Copy-Item -Path "./lib/babylonjs.loaders.js" -Destination "../carillion-build/lib/babylonjs.loaders.js"

Get-ChildItem -Path "../carillion-build/" "*.blend" -Recurse | ForEach-Object { Remove-Item -Path $_.FullName }
Get-ChildItem -Path "../carillion-build/" "*.blend1" -Recurse | ForEach-Object { Remove-Item -Path $_.FullName }
Get-ChildItem -Path "../carillion-build/" "*.babylon.manifest" -Recurse | ForEach-Object { Remove-Item -Path $_.FullName }
Get-ChildItem -Path "../carillion-build/" "*.log" -Recurse | ForEach-Object { Remove-Item -Path $_.FullName }
Get-ChildItem -Path "../carillion-build/" "*.xcf" -Recurse | ForEach-Object { Remove-Item -Path $_.FullName }
Get-ChildItem -Path "../carillion-build/" "*.d.ts" -Recurse | ForEach-Object { Remove-Item -Path $_.FullName }
Get-ChildItem -Path "../carillion-build/" "*.pdn" -Recurse | ForEach-Object { Remove-Item -Path $_.FullName }
Get-ChildItem -Path "../carillion-build/" "*.kra" -Recurse | ForEach-Object { Remove-Item -Path $_.FullName }
Get-ChildItem -Path "../carillion-build/" "*.*~" -Recurse | ForEach-Object { Remove-Item -Path $_.FullName }

Remove-Item -Path "../carillion-build/.gitignore"
Remove-Item -Path "../carillion-build/make_build.ps1"
Remove-Item -Path "../carillion-build/tsconfig.json"

(Get-Content "../carillion-build/index.js").Replace('./lib/babylon.max.js', './lib/babylon.js') | Set-Content "../carillion-build/index.js"
(Get-Content "../carillion-build/fluid-x.js").Replace('this.DEBUG_MODE = true', 'this.DEBUG_MODE = false') | Set-Content "../carillion-build/fluid-x.js"
(Get-Content "../carillion-build/fluid-x.js").Replace('this.DEBUG_USE_LOCAL_STORAGE = true', 'this.DEBUG_USE_LOCAL_STORAGE = false') | Set-Content "../carillion-build/fluid-x.js"