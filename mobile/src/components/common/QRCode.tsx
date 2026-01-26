import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';

interface QRCodeProps {
  value: string;
  size?: number;
  backgroundColor?: string;
  foregroundColor?: string;
}

/**
 * QR Code Component
 * 
 * Uses an external QR code API to generate QR codes.
 * This avoids package conflicts and works immediately.
 * 
 * Alternative: To use a local library instead, install:
 * npm install react-native-qrcode-svg
 * (Note: May require fixing expo-font override conflicts)
 */
export const QRCode: React.FC<QRCodeProps> = ({
  value,
  size = 200,
  backgroundColor = colors.white,
  foregroundColor = colors.gray[900],
}) => {
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateQRCode();
  }, [value, size, backgroundColor, foregroundColor]);

  const generateQRCode = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use QR Server API (free, no API key required)
      // Alternative APIs: qrcode.tec-it.com, api.qrserver.com
      // Convert hex colors to format without # for API
      const bgColor = backgroundColor.replace('#', '');
      const fgColor = foregroundColor.replace('#', '');
      
      const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&bgcolor=${bgColor}&color=${fgColor}&margin=1&ecc=M`;
      
      setQrImageUrl(apiUrl);
      setLoading(false);
    } catch (err: any) {
      console.error('QR Code generation error:', err);
      setError('Failed to generate QR code');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { width: size, height: size, backgroundColor }]}>
        <ActivityIndicator size="large" color={foregroundColor} />
        <Text style={[styles.loadingText, { color: foregroundColor }]}>
          Generating QR Code...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { width: size, height: size, backgroundColor }]}>
        <Ionicons name="alert-circle-outline" size={size * 0.3} color={colors.error} />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!qrImageUrl) {
    return (
      <View style={[styles.container, { width: size, height: size, backgroundColor }]}>
        <Ionicons name="qr-code" size={size * 0.5} color={foregroundColor} />
        <Text style={[styles.placeholderText, { color: foregroundColor }]}>
          QR Code
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { width: size, height: size, backgroundColor }]}>
      <Image
        source={{ uri: qrImageUrl }}
        style={{ width: size, height: size }}
        resizeMode="contain"
        onError={() => {
          setError('Failed to load QR code image');
        }}
      />
    </View>
  );
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
  loadingText: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
});
