# API Configuration Guide

## Network Error Troubleshooting

If you're experiencing network errors when submitting forms, it's likely because the mobile app can't reach the backend server. Here's how to fix it:

## Quick Fixes

### For Android Emulator
The app automatically uses `10.0.2.2` which maps to your host machine's `localhost`. Make sure:
1. Your backend is running on `http://localhost:3000`
2. The backend accepts connections from the emulator

### For iOS Simulator
The app uses `localhost` which should work. Make sure:
1. Your backend is running on `http://localhost:3000`
2. No firewall is blocking the connection

### For Physical Devices
You need to use your computer's IP address instead of `localhost`.

## Step-by-Step: Using Physical Device

### 1. Find Your Computer's IP Address

**Windows:**
```bash
ipconfig
# Look for "IPv4 Address" under your active network adapter
# Example: 192.168.1.100
```

**Mac/Linux:**
```bash
ifconfig | grep "inet "
# Or
ip addr show
# Look for your local network IP (usually 192.168.x.x or 10.x.x.x)
```

### 2. Update app.json

Edit `mobile/app.json` and replace `localhost` with your IP address:

```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://192.168.1.100:3000/api",
      "socketUrl": "http://192.168.1.100:3000"
    }
  }
}
```

**Replace `192.168.1.100` with your actual IP address!**

### 3. Update Backend CORS

Make sure your backend allows connections from your mobile device. Edit `backend/src/app.ts`:

```typescript
app.use(cors({
  origin: [
    'http://localhost:8081',  // Expo default
    'http://192.168.1.100:8081',  // Your IP
    'exp://192.168.1.100:8081',  // Expo protocol
  ],
  credentials: true,
}));
```

Or for development, you can temporarily allow all origins:

```typescript
app.use(cors({
  origin: true,  // Allow all origins (development only!)
  credentials: true,
}));
```

### 4. Restart Everything

1. Stop your Expo app
2. Restart Expo: `npm start` or `expo start`
3. Rebuild/reload the app on your device

## Alternative: Environment Variable

You can also set the API URL via environment variable. Create a `.env` file in the `mobile/` directory:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000/api
EXPO_PUBLIC_SOCKET_URL=http://192.168.1.100:3000
```

Then update `mobile/src/utils/constants.ts` to read from environment:

```typescript
export const API_URL = process.env.EXPO_PUBLIC_API_URL || getApiUrl();
export const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || getSocketUrl();
```

## Verify Backend is Running

Make sure your backend server is running:

```bash
cd backend
npm run dev
```

You should see:
```
✅ Database connected successfully
✅ Redis connected successfully
✅ Server running on port 3000
```

## Test Connection

You can test if the backend is reachable from your device:

1. Open a browser on your device
2. Navigate to: `http://YOUR_IP:3000/api/health`
3. You should see a JSON response

## Common Issues

### "Network request failed"
- Backend not running
- Wrong IP address
- Firewall blocking connection
- Device and computer not on same network

### "Connection refused"
- Backend not listening on the correct interface
- Port 3000 is blocked
- Backend crashed

### "CORS error"
- Backend CORS not configured for your device's origin
- Update CORS settings in `backend/src/app.ts`

## Development Tips

1. **Use Android Emulator** - Easiest setup, automatically uses `10.0.2.2`
2. **Use iOS Simulator** - Works with `localhost`
3. **Physical Device** - Requires IP address configuration
4. **Hot Reload** - After changing `app.json`, restart Expo

## Production

For production builds, make sure to:
1. Use your production API URL
2. Configure proper CORS
3. Use HTTPS
4. Set up proper environment variables
