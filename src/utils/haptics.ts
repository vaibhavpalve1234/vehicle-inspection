import { Vibration, Platform } from 'react-native';

export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'warning' | 'error' = 'light') => {
  if (Platform.OS === 'web') return;

  switch (type) {
    case 'light':
      // Very light tap
      Vibration.vibrate(12);
      break;
    case 'medium':
      Vibration.vibrate(25);
      break;
    case 'heavy':
      Vibration.vibrate(45);
      break;
    case 'warning':
      // Subtle double tap
      Vibration.vibrate([0, 20, 40, 20]);
      break;
    case 'error':
      // Noticeable double tap
      Vibration.vibrate([0, 30, 50, 40]);
      break;
    default:
      Vibration.vibrate(15);
  }
};
