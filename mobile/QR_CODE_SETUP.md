# QR Code Implementation

## ✅ Current Solution

The QR code component now uses an **external API** to generate QR codes, which:
- ✅ Works immediately without package conflicts
- ✅ No additional npm packages required
- ✅ Free to use (QR Server API)
- ✅ Supports custom colors and sizes

## Implementation Details

The `QRCode` component in `mobile/src/components/common/QRCode.tsx` uses:
- **API**: `https://api.qrserver.com/v1/create-qr-code/`
- **Features**: Custom size, colors, error correction level
- **Fallback**: Shows loading state and error handling

## Alternative: Local QR Code Library

If you prefer a local library (no external API dependency), you can install `react-native-qrcode-svg`:

### Step 1: Fix expo-font Override

The `expo-font` override in `package.json` has been updated to match the dependency version (`~12.0.10`).

### Step 2: Install react-native-qrcode-svg

```bash
cd mobile
npm install react-native-qrcode-svg --legacy-peer-deps
```

### Step 3: Update QRCode Component

Replace the component implementation with:

```typescript
import QRCodeSVG from 'react-native-qrcode-svg';

export const QRCode: React.FC<QRCodeProps> = ({
  value,
  size = 200,
  backgroundColor = colors.white,
  foregroundColor = colors.gray[900],
}) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <QRCodeSVG
        value={value}
        size={size}
        backgroundColor={backgroundColor}
        color={foregroundColor}
        logo={undefined} // Optional: add logo in center
      />
    </View>
  );
};
```

## API Alternatives

If the current API has issues, you can switch to:

1. **QRCode.tec-it.com**:
   ```typescript
   const apiUrl = `https://qrcode.tec-it.com/API/QRCode?data=${encodeURIComponent(value)}&size=${size}`;
   ```

2. **Google Charts API** (deprecated but still works):
   ```typescript
   const apiUrl = `https://chart.googleapis.com/chart?chs=${size}x${size}&cht=qr&chl=${encodeURIComponent(value)}`;
   ```

## Current Status

✅ **Working**: External API implementation
- No package conflicts
- Immediate functionality
- Works offline after first load (cached)

## Notes

- The external API approach requires internet connectivity for initial generation
- QR codes are cached by React Native's Image component
- For production, consider using a local library for offline support
