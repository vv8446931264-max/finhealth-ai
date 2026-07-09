@echo off
echo ============================================
echo  FinHealth AI - Firebase Hosting Deploy
echo  GCP Production Deployment
echo ============================================
echo.

cd /d "%~dp0"

echo [1/3] Checking Node.js...
node --version || (echo ERROR: Node.js not found. Install from nodejs.org && pause && exit /b 1)

echo.
echo [2/3] Installing firebase-tools...
npm install -g firebase-tools

echo.
echo [3/3] Deploying to Firebase Hosting...
echo.
echo NOTE: A browser window will open for Google login.
echo       After login, the deploy will complete automatically.
echo.
firebase login
firebase deploy --only hosting

echo.
echo ============================================
echo  Deploy complete! Your app is live on GCP.
echo ============================================
pause
