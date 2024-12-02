Write-Debug "Make Build for Marble Fall"

$build_name = "monkey-mind-build"

$containsString = Select-String -Path "./index.js" -Pattern "USE_POKI_SDK = true" -Quiet
if ($containsString) {
    $build_name = $build_name + "_poki";
}
else {
    $build_name = $build_name + "_common";
}

$containsString = Select-String -Path "./index.js" -Pattern "OFFLINE_MODE = true" -Quiet
if ($containsString) {
    $build_name = $build_name + "_offline";
}
else {
    $build_name = $build_name + "_online";
}

$containsString = Select-String -Path "./index.js" -Pattern "ADVENT_CAL = true" -Quiet
if ($containsString) {
    $build_name = $build_name + "_advent_calendar";
}

if (Test-Path ("../" + $build_name + "")) {
    Remove-Item ("../" + $build_name + "") -Recurse -Force
}
if (Test-Path ("../" + $build_name + ".zip")) {
    Remove-Item ("../" + $build_name + ".zip") -Force
}

New-Item ("../" + $build_name + "") -ItemType "directory"


Copy-Item -Path "./*" -Destination ("../" + $build_name + "/") -Recurse -Force -Exclude ".git", "src", "lib", "work", ".vscode"

New-Item ("../" + $build_name + "/lib") -ItemType "directory"
New-Item ("../" + $build_name + "/lib/nabu") -ItemType "directory"
Copy-Item -Path "./lib/nabu/nabu.js" -Destination ("../" + $build_name + "/lib/nabu/nabu.js")
New-Item ("../" + $build_name + "/lib/mummu") -ItemType "directory"
Copy-Item -Path "./lib/mummu/mummu.js" -Destination ("../" + $build_name + "/lib/mummu/mummu.js")

Copy-Item -Path "./lib/babylon.js" -Destination ("../" + $build_name + "/lib/babylon.js")
Copy-Item -Path "./lib/babylonjs.loaders.js" -Destination ("../" + $build_name + "/lib/babylonjs.loaders.js")

Get-ChildItem -Path ("../" + $build_name + "/") "*.blend" -Recurse | ForEach-Object { Remove-Item -Path $_.FullName }
Get-ChildItem -Path ("../" + $build_name + "/") "*.blend1" -Recurse | ForEach-Object { Remove-Item -Path $_.FullName }
Get-ChildItem -Path ("../" + $build_name + "/") "*.babylon.manifest" -Recurse | ForEach-Object { Remove-Item -Path $_.FullName }
Get-ChildItem -Path ("../" + $build_name + "/") "*.log" -Recurse | ForEach-Object { Remove-Item -Path $_.FullName }
Get-ChildItem -Path ("../" + $build_name + "/") "*.xcf" -Recurse | ForEach-Object { Remove-Item -Path $_.FullName }
Get-ChildItem -Path ("../" + $build_name + "/") "*.d.ts" -Recurse | ForEach-Object { Remove-Item -Path $_.FullName }
Get-ChildItem -Path ("../" + $build_name + "/") "*.pdn" -Recurse | ForEach-Object { Remove-Item -Path $_.FullName }
Get-ChildItem -Path ("../" + $build_name + "/") "*.kra" -Recurse | ForEach-Object { Remove-Item -Path $_.FullName }
Get-ChildItem -Path ("../" + $build_name + "/") "*.*~" -Recurse | ForEach-Object { Remove-Item -Path $_.FullName }

Remove-Item -Path ("../" + $build_name + "/.gitignore")
Remove-Item -Path ("../" + $build_name + "/make_build.ps1")
Remove-Item -Path ("../" + $build_name + "/tsconfig.json")

(Get-Content ("../" + $build_name + "/index.js")).Replace('./lib/babylon.max.js', './lib/babylon.js') | Set-Content ("../" + $build_name + "/index.js")
(Get-Content ("../" + $build_name + "/fluid-x.js")).Replace('this.DEBUG_MODE = true', 'this.DEBUG_MODE = false') | Set-Content ("../" + $build_name + "/fluid-x.js")
(Get-Content ("../" + $build_name + "/fluid-x.js")).Replace('this.DEBUG_USE_LOCAL_STORAGE = true', 'this.DEBUG_USE_LOCAL_STORAGE = false') | Set-Content ("../" + $build_name + "/fluid-x.js")