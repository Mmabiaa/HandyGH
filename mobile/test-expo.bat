@echo off
REM Script to test the app on Expo Go (Windows)
REM This clears cache and starts Expo with tunnel mode

echo Clearing Metro bundler cache...
if exist .expo rmdir /s /q .expo
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo Starting Expo with tunnel mode...
npx expo start --clear --tunnel

REM Alternative commands if the above doesn't work:
REM npx expo start --clear --go
REM npm start -- --reset-cache --tunnel
