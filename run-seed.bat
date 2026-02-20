@echo off
echo ================================================
echo         NGO Connect - Database Seeder
echo ================================================
echo.
echo This will:
echo  - Clear existing data in the database
echo  - Create 8 sample NGOs
echo  - Create 3 sample users
echo  - Create 1 admin user
echo  - Create 12 service requests
echo  - Create 20 donations
echo.
echo ================================================
echo.
node seed.js
echo.
echo ================================================
echo Press any key to close...
pause >nul
