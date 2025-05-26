@echo off
echo Starting Volt Platform Development Servers...
echo.

REM Start backend in a new terminal
echo Starting Backend Server...
start cmd /k "cd backend && cargo run"

REM Wait a moment for backend to start
timeout /t 3 /nobreak > nul

REM Start frontend
echo Starting Frontend Server...
cd frontend
npm run dev
