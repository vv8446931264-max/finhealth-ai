@echo off
echo ============================================
echo  FinHealth AI - Push to GitHub
echo ============================================
echo.

cd /d "%~dp0"

echo [1/6] Removing old broken .git folder...
rmdir /s /q .git 2>nul

echo [2/6] Initializing fresh git repo...
git init
git config user.email "mah56nan@gmail.com"
git config user.name "Mahesh"

echo [3/6] Adding all files...
git add .
git status

echo [4/6] Committing...
git commit -m "Add Gemini AI integration, Vite 5 stack, hash router, Node.js server

- Replaced Vite 6 + Tailwind v4 (broken) with Vite 5 + Tailwind v3
- Added Gemini 1.5 Flash AI integration (src/lib/gemini.ts)
  - AI financial recommendations
  - AI score narrative
  - AI chat advisor
- Replaced react-router-dom with custom hash router (zero deps)
- Added pure Node.js HTTP server (server.js) for Replit/hosting
- Added Firebase hosting config (firebase.json, .firebaserc)
- Added GitHub Actions CI/CD (.github/workflows/firebase-deploy.yml)
- Pre-built dist/ folder included
- Live URLs:
  - Replit: https://finhealth-ai--mah56nan.replit.app
  - GCP/Lovable: https://idbi-finscore-hub.lovable.app"

echo [5/6] Renaming branch to main...
git branch -M main

echo [6/6] Pushing to GitHub...
git remote add origin https://github.com/vv8446931264-max/finhealth-ai.git
git push -u origin main --force

echo.
echo ============================================
echo  Done! Check: https://github.com/vv8446931264-max/finhealth-ai
echo ============================================
pause
