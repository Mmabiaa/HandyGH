# Expo Go Setup Guide

## Issue: "Could not connect to server"

When scanning the QR code with Expo Go, you might see `exp://127.0.0.1:8081` which won't work because your phone can't reach `127.0.0.1` (localhost).

## Solution

### Option 1: Use Tunnel Mode (Easiest)

Stop the current server (Ctrl+C) and restart with tunnel mode:

```bash
npx expo start --tunnel
```

This creates a public URL that works from anywhere. Scan the new QR code.

### Option 2: Use LAN Mode (Faster)

Make sure your phone and computer are on the **same WiFi network**, then:

1. Stop the current server (Ctrl+C)
2. Start with:
   ```bash
   npx expo start --lan
   ```
3. Scan the new QR code

Your computer's IP address is: **172.20.80.1**

The QR code should show: `exp://172.20.80.1:8081`

### Option 3: Manual Connection

If the QR code still doesn't work:

1. Open Expo Go app
2. Tap "Enter URL manually"
3. Enter: `exp://172.20.80.1:8081`
4. Tap "Connect"

## Troubleshooting

### Phone and Computer Not on Same Network?

- Make sure both devices are connected to the same WiFi
- Disable VPN on your computer if running
- Check if your router allows device-to-device communication

### Firewall Blocking Connection?

Windows Firewall might block the connection. Allow Node.js through:

1. Open Windows Defender Firewall
2. Click "Allow an app through firewall"
3. Find "Node.js" and check both Private and Public
4. Click OK

### Still Not Working?

Use tunnel mode (Option 1) - it always works but is slightly slower.

## Current Status

Your Expo server is running on:
- **Local**: http://127.0.0.1:8081 (only works on this computer)
- **LAN**: http://172.20.80.1:8081 (works on same network)

To use on your phone, restart with `--tunnel` or `--lan` flag.
