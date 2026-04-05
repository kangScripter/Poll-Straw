import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

function safe(fn: () => void) {
  if (Platform.OS === 'web') return;
  try {
    fn();
  } catch {
    // Haptics unavailable on some simulators / older devices
  }
}

export function hapticLightImpact() {
  safe(() => void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
}

export function hapticMediumImpact() {
  safe(() => void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
}

export function hapticSelection() {
  safe(() => void Haptics.selectionAsync());
}

export function hapticSuccess() {
  safe(() => void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
}

export function hapticWarning() {
  safe(() => void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
}
