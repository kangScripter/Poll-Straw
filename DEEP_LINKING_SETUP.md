# Deep Linking Setup Guide

This guide explains how deep linking works in AppVote, allowing share links to open the app directly to a specific poll.

## How It Works

1. **User shares a poll link**: `https://pollstraw.com/poll/abc123`
2. **Recipient clicks the link**:
   - **If app is installed**: Opens directly to the poll in the app
   - **If app is not installed**: Shows a landing page with install options

## Current Implementation

### Mobile App (`mobile/`)

#### 1. URL Scheme Configuration (`app.json`)

```json
{
  "expo": {
    "scheme": "appvote",
    "ios": {
      "associatedDomains": ["applinks:pollstraw.com"]
    },
    "android": {
      "intentFilters": [...]
    }
  }
}
```

#### 2. Navigation Deep Link Config (`AppNavigator.tsx`)

The app handles these deep link patterns:
- `pollstraw://poll/{pollId}` - Opens poll detail
- `https://pollstraw.com/poll/{shareUrl}` - Opens poll detail
- `pollstraw://home` - Opens home screen
- `pollstraw://create` - Opens create poll screen

### Backend (`backend/`)

#### 1. Poll Redirect Route (`app.ts`)

When someone visits `https://pollstraw.com/poll/{shareUrl}`:
1. Backend serves `poll-redirect.html`
2. Page attempts to open the app using deep link
3. If app doesn't open within 2.5s, shows install options

#### 2. Universal Links Config

The backend serves:
- `/.well-known/apple-app-site-association` - For iOS Universal Links
- `/.well-known/assetlinks.json` - For Android App Links

## Setup for Production

### 1. iOS Universal Links

1. **Get your Apple Team ID** from developer.apple.com
2. **Update `app.json`**:
   ```json
   "ios": {
     "associatedDomains": ["applinks:yourdomain.com"]
   }
   ```
3. **Update backend** `apple-app-site-association`:
   ```json
   {
     "applinks": {
       "details": [{
         "appID": "TEAMID.com.appvote.mobile",
         "paths": ["/poll/*"]
       }]
     }
   }
   ```
4. **Host the file** at `https://yourdomain.com/.well-known/apple-app-site-association`

### 2. Android App Links

1. **Get SHA256 fingerprint** of your signing key:
   ```bash
   keytool -list -v -keystore your-keystore.jks -alias your-alias
   ```
2. **Update backend** `assetlinks.json`:
   ```json
   [{
     "relation": ["delegate_permission/common.handle_all_urls"],
     "target": {
       "namespace": "android_app",
       "package_name": "com.appvote.mobile",
       "sha256_cert_fingerprints": ["YOUR_SHA256_FINGERPRINT"]
     }
   }]
   ```
3. **Host the file** at `https://yourdomain.com/.well-known/assetlinks.json`

### 3. App Store URLs

Update the landing page (`poll-redirect.html`) with your actual app store URLs:
- iOS App Store: `https://apps.apple.com/app/appvote/id0000000000`
- Google Play Store: `https://play.google.com/store/apps/details?id=com.appvote.mobile`

## Testing Deep Links

### Local Testing with Expo

1. Start the app:
   ```bash
   cd mobile
   npm start
   ```

2. Test with Expo CLI:
   ```bash
   # Open specific poll
   npx uri-scheme open "pollstraw://poll/abc123" --android
   npx uri-scheme open "pollstraw://poll/abc123" --ios
   ```

### Test in Browser

Visit: `http://localhost:3000/poll/your-share-url`

This will show the landing page that attempts to open the app.

## Share URL Format

When creating/sharing a poll, the app generates:
- **Development**: `http://localhost:3000/poll/{shareUrl}`
- **Production**: `https://pollstraw.com/poll/{shareUrl}`

The `shareUrl` is a unique identifier for each poll (e.g., `abc123xyz`).

## Troubleshooting

### App doesn't open from link

1. **Check URL scheme**: Ensure `pollstraw://` is configured in `app.json`
2. **Verify associated domains**: For Universal Links, ensure domain verification
3. **Clear browser cache**: Some browsers cache redirect behavior
4. **Test with custom URL scheme first**: `pollstraw://poll/test`

### Universal Links not working

1. **HTTPS required**: Universal Links only work over HTTPS
2. **JSON must be valid**: Check `.well-known/` files are valid JSON
3. **Content-Type**: Must be `application/json`
4. **No redirects**: Files must be served directly, not via redirect

### Android App Links not working

1. **Verify fingerprint**: SHA256 must match exactly
2. **Auto-verify**: Intent filter must have `autoVerify: true`
3. **Check logs**: `adb logcat | grep -i applink`

## File Locations

```
AppVote/
├── mobile/
│   ├── app.json                          # Deep link scheme config
│   └── src/navigation/AppNavigator.tsx   # Deep link handling
├── backend/
│   ├── src/app.ts                        # Redirect route & .well-known
│   └── src/public/poll-redirect.html     # Landing page for web
└── DEEP_LINKING_SETUP.md                 # This file
```

## Summary

| Scenario | What Happens |
|----------|--------------|
| App installed + click link | App opens to poll |
| App not installed + click link | Shows install page |
| Direct `pollstraw://` URL | App opens (if installed) |
| QR code scan | Opens browser → tries app → shows install |
