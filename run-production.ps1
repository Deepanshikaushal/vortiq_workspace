# VortiQ Studio Production Executable Script
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " Launching VortiQ Studio Production Build " -ForegroundColor Green
Write-Host " Core Java Spring Boot + Embedded React  " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

$jarPath = "backend\target\vortiq-backend-0.0.1-SNAPSHOT.jar"

if (Test-Path $jarPath) {
    Write-Host "Starting JAR server on http://localhost:8080 ..." -ForegroundColor Yellow
    java -jar $jarPath
} else {
    Write-Host "Error: Executable JAR not found at $jarPath" -ForegroundColor Red
    Write-Host "Please package the build first by running: mvn clean package -DskipTests in backend/" -ForegroundColor Yellow
}
