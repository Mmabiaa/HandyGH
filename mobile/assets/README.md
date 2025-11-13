# Assets Directory

This directory contains app assets like icons and splash screens.

## Required Assets (To be added):

- `icon.png` - App icon (1024x1024)
- `splash.png` - Splash screen image
- `adaptive-icon.png` - Android adaptive icon (1024x1024)
- `favicon.png` - Web favicon (48x48 or larger)
- `notification-icon.png` - Notification icon

## Temporary Solution

For development, you can use placeholder images or generate them using:
- https://www.figma.com
- https://www.canva.com
- Or any image editor

## Quick Fix

You can also use Expo's asset generation:
```bash
npx expo prebuild --clean
```

This will generate default assets if they don't exist.
