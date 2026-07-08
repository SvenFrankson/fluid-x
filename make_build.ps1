Write-Debug "Make Build for Carillion"

$build_name = "carillion-build"

$isPokiVersion = Select-String -Path "./index.js" -Pattern "USE_POKI_SDK = true" -Quiet
if ($isPokiVersion) {
    $build_name = $build_name + "_poki";
}
else {
    $isCrazyGamesVersion = Select-String -Path "./index.js" -Pattern "USE_CG_SDK = true" -Quiet
    if ($isCrazyGamesVersion) {
        $build_name = $build_name + "_crazygames";
    }
    else {
        $isWaveDashVersion = Select-String -Path "./index.js" -Pattern "USE_WAVEDASH_SDK = true" -Quiet
        if ($isWaveDashVersion) {
            $build_name = $build_name + "_wavedash";
        }
        else {
            $build_name = $build_name + "_common";
        }
    }
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

$noVertexDataLoader = Select-String -Path "./index.js" -Pattern "NO_VERTEX_DATA_LOADER = true" -Quiet

if (Test-Path ("./dist/" + $build_name + "")) {
    Remove-Item ("./dist/" + $build_name + "") -Recurse -Force
}
if (Test-Path ("./dist/" + $build_name + ".zip")) {
    Remove-Item ("./dist/" + $build_name + ".zip") -Force
}

New-Item ("./dist/" + $build_name + "") -ItemType "directory"


Copy-Item -Path "./*" -Destination ("./dist/" + $build_name + "/") -Recurse -Force -Exclude ".git", "src", "lib", "work", ".vscode", "dist"

New-Item ("./dist/" + $build_name + "/lib") -ItemType "directory"
New-Item ("./dist/" + $build_name + "/lib/nabu") -ItemType "directory"
Copy-Item -Path "./lib/nabu/nabu.js" -Destination ("./dist/" + $build_name + "/lib/nabu/nabu.js")
New-Item ("./dist/" + $build_name + "/lib/mummu") -ItemType "directory"
Copy-Item -Path "./lib/mummu/mummu.js" -Destination ("./dist/" + $build_name + "/lib/mummu/mummu.js")

Copy-Item -Path "./lib/babylon.js" -Destination ("./dist/" + $build_name + "/lib/babylon.js")
if (!$noVertexDataLoader) {
    Copy-Item -Path "./lib/babylonjs.loaders.js" -Destination ("./dist/" + $build_name + "/lib/babylonjs.loaders.js")
}

Get-ChildItem -Path ("./dist/" + $build_name + "/") "*.blend" -Recurse | ForEach-Object { Remove-Item -Path $_.FullName }
Get-ChildItem -Path ("./dist/" + $build_name + "/") "*.blend1" -Recurse | ForEach-Object { Remove-Item -Path $_.FullName }
Get-ChildItem -Path ("./dist/" + $build_name + "/") "*.babylon.manifest" -Recurse | ForEach-Object { Remove-Item -Path $_.FullName }
Get-ChildItem -Path ("./dist/" + $build_name + "/") "*.log" -Recurse | ForEach-Object { Remove-Item -Path $_.FullName }
Get-ChildItem -Path ("./dist/" + $build_name + "/") "*.xcf" -Recurse | ForEach-Object { Remove-Item -Path $_.FullName }
Get-ChildItem -Path ("./dist/" + $build_name + "/") "*.d.ts" -Recurse | ForEach-Object { Remove-Item -Path $_.FullName }
Get-ChildItem -Path ("./dist/" + $build_name + "/") "*.pdn" -Recurse | ForEach-Object { Remove-Item -Path $_.FullName }
Get-ChildItem -Path ("./dist/" + $build_name + "/") "*.kra" -Recurse | ForEach-Object { Remove-Item -Path $_.FullName }
Get-ChildItem -Path ("./dist/" + $build_name + "/") "*.*~" -Recurse | ForEach-Object { Remove-Item -Path $_.FullName }
if ($noVertexDataLoader) {
    Get-ChildItem -Path ("./dist/" + $build_name + "/") "*.babylon" -Recurse | ForEach-Object { Remove-Item -Path $_.FullName }
}

Remove-Item -Path ("./dist/" + $build_name + "/.gitignore")
Remove-Item -Path ("./dist/" + $build_name + "/make_build.ps1")
Remove-Item -Path ("./dist/" + $build_name + "/tsconfig.json")
Remove-Item -Path ("./dist/" + $build_name + "/wavedash.toml")

(Get-Content ("./dist/" + $build_name + "/index.js")).Replace('./lib/babylon.max.js', './lib/babylon.js') | Set-Content ("./dist/" + $build_name + "/index.js")
(Get-Content ("./dist/" + $build_name + "/fluid-x.js")).Replace('this.DEBUG_MODE = true', 'this.DEBUG_MODE = false') | Set-Content ("./dist/" + $build_name + "/fluid-x.js")
(Get-Content ("./dist/" + $build_name + "/fluid-x.js")).Replace('this.DEBUG_USE_LOCAL_STORAGE = true', 'this.DEBUG_USE_LOCAL_STORAGE = false') | Set-Content ("./dist/" + $build_name + "/fluid-x.js")