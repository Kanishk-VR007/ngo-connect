# MongoDB Setup Script for NGO Connect App
# This script helps set up MongoDB for your application

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "   NGO Connect - MongoDB Setup Wizard" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Choose your MongoDB setup option:" -ForegroundColor Yellow
Write-Host "1. Use MongoDB Atlas (Free Cloud Database - Recommended)" -ForegroundColor Green
Write-Host "2. Install MongoDB Community Server Locally" -ForegroundColor Green
Write-Host "3. I already have MongoDB - just start the service" -ForegroundColor Green
Write-Host ""

$choice = Read-Host "Enter your choice (1, 2, or 3)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "Setting up MongoDB Atlas (Cloud Database)..." -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Steps to set up MongoDB Atlas:" -ForegroundColor Yellow
        Write-Host "1. Go to: https://www.mongodb.com/cloud/atlas/register" -ForegroundColor White
        Write-Host "2. Create a free account (no credit card required)" -ForegroundColor White
        Write-Host "3. Create a FREE cluster (M0 Sandbox)" -ForegroundColor White
        Write-Host "4. Create a database user with password" -ForegroundColor White
        Write-Host "5. Add your IP address to whitelist (or use 0.0.0.0/0 for all IPs)" -ForegroundColor White
        Write-Host "6. Click 'Connect' > 'Connect your application'" -ForegroundColor White
        Write-Host "7. Copy the connection string" -ForegroundColor White
        Write-Host ""
        Write-Host "Once you have your connection string, paste it here:" -ForegroundColor Green
        $atlasUri = Read-Host "MongoDB Atlas Connection String"
        
        if ($atlasUri) {
            # Update .env file
            $envContent = Get-Content ".env" -Raw
            $envContent = $envContent -replace 'MONGODB_URI=.*', "MONGODB_URI=$atlasUri"
            Set-Content ".env" -Value $envContent
            
            Write-Host ""
            Write-Host "✓ MongoDB Atlas configured successfully!" -ForegroundColor Green
            Write-Host "✓ .env file updated with your connection string" -ForegroundColor Green
            Write-Host ""
            Write-Host "You can now run: npm run dev" -ForegroundColor Cyan
        }
    }
    "2" {
        Write-Host ""
        Write-Host "Installing MongoDB Community Server..." -ForegroundColor Cyan
        Write-Host ""
        
        # Check if Chocolatey is installed
        if (Get-Command choco -ErrorAction SilentlyContinue) {
            Write-Host "Installing MongoDB via Chocolatey..." -ForegroundColor Yellow
            choco install mongodb -y
            
            Write-Host ""
            Write-Host "✓ MongoDB installed successfully!" -ForegroundColor Green
            Write-Host "Starting MongoDB service..." -ForegroundColor Yellow
            
            Start-Service MongoDB -ErrorAction SilentlyContinue
            
            Write-Host "✓ MongoDB service started!" -ForegroundColor Green
            Write-Host ""
            Write-Host "You can now run: npm run dev" -ForegroundColor Cyan
        } else {
            Write-Host "Chocolatey package manager not found." -ForegroundColor Red
            Write-Host ""
            Write-Host "Option 1 - Install via Chocolatey (Recommended):" -ForegroundColor Yellow
            Write-Host "1. Install Chocolatey from: https://chocolatey.org/install" -ForegroundColor White
            Write-Host "2. Run this script again" -ForegroundColor White
            Write-Host ""
            Write-Host "Option 2 - Manual Installation:" -ForegroundColor Yellow
            Write-Host "1. Download MongoDB from: https://www.mongodb.com/try/download/community" -ForegroundColor White
            Write-Host "2. Run the installer" -ForegroundColor White
            Write-Host "3. Choose 'Complete' installation" -ForegroundColor White
            Write-Host "4. Install MongoDB as a service" -ForegroundColor White
            Write-Host "5. Run: net start MongoDB" -ForegroundColor White
        }
    }
    "3" {
        Write-Host ""
        Write-Host "Starting MongoDB service..." -ForegroundColor Cyan
        
        try {
            Start-Service MongoDB -ErrorAction Stop
            Write-Host "✓ MongoDB service started successfully!" -ForegroundColor Green
            Write-Host ""
            Write-Host "You can now run: npm run dev" -ForegroundColor Cyan
        } catch {
            Write-Host "Failed to start MongoDB service." -ForegroundColor Red
            Write-Host "Error: $_" -ForegroundColor Red
            Write-Host ""
            Write-Host "Try running manually:" -ForegroundColor Yellow
            Write-Host "net start MongoDB" -ForegroundColor White
            Write-Host ""
            Write-Host "Or start MongoDB manually:" -ForegroundColor Yellow
            Write-Host "mongod --dbpath C:\data\db" -ForegroundColor White
        }
    }
    default {
        Write-Host "Invalid choice. Please run the script again." -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "For more help, see INSTALLATION_GUIDE.md" -ForegroundColor White
Write-Host "===========================================" -ForegroundColor Cyan
