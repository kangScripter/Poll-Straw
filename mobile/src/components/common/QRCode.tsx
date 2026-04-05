import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRCodeSVG from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';

interface QRCodeProps {
  value: string;
  size?: number;
  backgroundColor?: string;
  foregroundColor?: string;
}

export const QRCode: React.FC<QRCodeProps> = ({
  value,
  size = 200,
  backgroundColor,
  foregroundColor,
}) => {
  const { theme, isDark } = useTheme();

  const bg = backgroundColor ?? (isDark ? theme.surface : '#FFFFFF');
  const fg = foregroundColor ?? (isDark ? '#FFFFFF' : theme.textPrimary);

  try {
    return (
      <View style={[styles.container, { width: size, height: size, backgroundColor: bg }]}>
        <QRCodeSVG
          value={value}
          size={size - 4}
          backgroundColor={bg}
          color={fg}
          ecl="M"
        />
      </View>
    );
  } catch {
    return (
      <View style={[styles.container, { width: size, height: size, backgroundColor: bg }]}>
        <Ionicons name="qr-code" size={size * 0.5} color={fg} />
        <Text style={[styles.placeholderText, { color: fg }]}>QR Code</Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    overflow: 'hidden',
  },
  placeholderText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
});
