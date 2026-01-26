# Environment Variables Setup

This project uses `dotenv` with `app.config.js` to load environment variables from `.env` file.

## Installation

If you haven't installed `dotenv` yet, run:

```bash
cd mobile
npm install --save-dev dotenv
```

## Configuration

The `.env` file is already configured in the project root (`mobile/.env`).

The `app.config.js` file reads from `.env` and exposes the variables via `expo-constants`.

### Current `.env` file:

```env
API_URL=http://api.pollstraw.com/api
SOCKET_URL=http://api.pollstraw.com
```

## Usage

Environment variables are automatically loaded via `expo-constants`:

```typescript
import Constants from 'expo-constants';

const apiUrl = Constants.expoConfig?.extra?.apiUrl;
const socketUrl = Constants.expoConfig?.extra?.socketUrl;
```

The `constants.ts` file already handles this for you.

## Development vs Production

### Development (Local)
Update `.env` for local development:
```env
API_URL=http://localhost:3000/api
SOCKET_URL=http://localhost:3000
```

### Production
Update `.env` for production:
```env
API_URL=https://api.pollstraw.com/api
SOCKET_URL=https://api.pollstraw.com
```

## Platform-Specific Fallbacks

The `constants.ts` file includes platform-specific fallbacks:
- **Android Emulator**: Uses `10.0.2.2:3000` (maps to host machine)
- **iOS Simulator**: Uses `localhost:3000`
- **Physical Device**: Uses the URL from `.env` file

## Important Notes

1. **Restart Required**: After changing `.env`, restart the Expo dev server:
   ```bash
   npx expo start --clear
   ```

2. **Git**: The `.env` file should be in `.gitignore` (already configured)

3. **Configuration**: The `app.config.js` reads from `.env` and exposes via `expo-constants`

4. **No Babel Plugin Needed**: This approach uses Expo's built-in configuration system

## Troubleshooting

### Variables not loading?
- Make sure `react-native-dotenv` is installed
- Restart Metro bundler with `--clear` flag
- Check that `.env` file is in the `mobile/` directory root

### TypeScript errors?
- Ensure `src/types/env.d.ts` exists
- Check `tsconfig.json` includes the `@env` path mapping
