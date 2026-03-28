import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRCodeSVG from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';

interface QRCodeProps {
  value: string;
  size?: number;
  backgroundColor?: string;
  foregroundColor?: string;
}

/**
 * QR Code Component — generates QR codes locally using react-native-qrcode-svg.
 * No external API calls; works offline and keeps poll URLs private.
 */
export const QRCode: React.FC<QRCodeProps> = ({
  value,
  size = 200,
  backgroundColor = colors.white,
  foregroundColor = colors.gray[900],
}) => {
  try {
    return (
      <View style={[styles.container, { width: size, height: size, backgroundColor }]}>
        <QRCodeSVG
          value={value}
          size={size - 4}
          backgroundColor={backgroundColor}
          color={foregroundColor}
          ecl="M"
        />
      </View>
    );
  } catch {
    return (
      <View style={[styles.container, { width: size, height: size, backgroundColor }]}>
        <Ionicons name="qr-code" size={size * 0.5} color={foregroundColor} />
        <Text style={[styles.placeholderText, { color: foregroundColor }]}>
          QR Code
        </Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.gray[200],
    overflow: 'hidden',
  },
  placeholderText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
});
