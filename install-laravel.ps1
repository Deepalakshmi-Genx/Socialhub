$ErrorActionPreference = "Stop"

Write-Host "Initializing Laravel framework skeleton..." -ForegroundColor Cyan

# 1. Create a fresh Laravel project in a temporary directory
Write-Host "Downloading fresh Laravel installation..."
# We use --no-install first to just get the files fast, we'll install later
composer create-project laravel/laravel temp-laravel --no-install

# 2. Intelligently merge the files
Write-Host "Merging framework files with our custom code..."
# We want to copy everything EXCEPT what we already customized
# Specifically, we don't want to overwrite our app/, database/migrations, routes, resources, package.json, vite.config.js

Get-ChildItem -Path "temp-laravel" | ForEach-Object {
    $itemName = $_.Name
    $destPath = ".\$itemName"
    
    # Check if this is a file/folder we want to skip replacing if it exists
    $skipOverwrite = @("app", "database", "routes", "resources", "package.json", "vite.config.js", ".env.example", "README.md")

    if ($skipOverwrite -contains $itemName) {
        # It's a protected folder. We'll only copy things INSIDE it that don't exist
        if ($_.PSIsContainer) {
            Get-ChildItem -Path $_.FullName -Recurse | ForEach-Object {
                $relPath = $_.FullName.Substring($_.FullName.IndexOf("temp-laravel") + 13)
                $targetFile = ".\$relPath"
                
                if (-not (Test-Path $targetFile)) {
                    if ($_.PSIsContainer) {
                        New-Item -ItemType Directory -Path $targetFile -Force | Out-Null
                    } else {
                        Copy-Item -Path $_.FullName -Destination $targetFile -Force
                    }
                }
            }
        }
    } else {
        # Safe to overwrite / copy entirely (like artisan, composer.json, bootstrap/, config/)
        Copy-Item -Path $_.FullName -Destination $destPath -Recurse -Force
    }
}

# 3. Cleanup
Write-Host "Cleaning up temporary files..."
Remove-Item -Path "temp-laravel" -Recurse -Force

Write-Host "Laravel framework initialization complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Now you can run the standard setup commands:" -ForegroundColor Yellow
Write-Host "composer install"
Write-Host "cp .env.example .env"
Write-Host "php artisan key:generate"
