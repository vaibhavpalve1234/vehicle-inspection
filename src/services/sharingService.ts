import * as Sharing from 'expo-sharing';
import { Linking, Platform, Alert } from 'react-native';

export class SharingService {
  /**
   * Save / Download PDF locally or open system save dialog
   */
  static async downloadPdf(pdfUri: string): Promise<boolean> {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(pdfUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Save / Download Inspection PDF',
          UTI: 'com.adobe.pdf',
        });
        return true;
      } else {
        Alert.alert('File Saved', `PDF generated at:\n${pdfUri}`);
        return true;
      }
    } catch (e: any) {
      Alert.alert('Download Error', e?.message || 'Could not save PDF');
      return false;
    }
  }

  /**
   * Share on WhatsApp
   * Shares the PDF file directly via share sheet or text summary link
   */
  static async shareOnWhatsApp(pdfUri: string, vehicleInfo: { vehicleModel: string; reg: string }): Promise<void> {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        // Triggers the native share sheet where WhatsApp is a primary target
        await Sharing.shareAsync(pdfUri, {
          mimeType: 'application/pdf',
          dialogTitle: `Share ${vehicleInfo.vehicleModel} Report on WhatsApp`,
          UTI: 'com.adobe.pdf',
        });
      } else {
        // Fallback message
        const text = encodeURIComponent(
          `Live Vehicle Inspection Report for ${vehicleInfo.vehicleModel} (${vehicleInfo.reg}) has been generated.`
        );
        const url = `whatsapp://send?text=${text}`;
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
        } else {
          Alert.alert('WhatsApp Not Installed', 'Please install WhatsApp or use standard sharing.');
        }
      }
    } catch (err: any) {
      Alert.alert('Share Error', err?.message || 'Failed to share on WhatsApp');
    }
  }

  /**
   * Share on Instagram or other apps
   */
  static async shareOnInstagram(pdfUri: string): Promise<void> {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(pdfUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share Inspection Report to Instagram / Apps',
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('Share Not Available', 'System sharing is not available on this device.');
      }
    } catch (err: any) {
      Alert.alert('Share Error', err?.message || 'Failed to share report');
    }
  }
}
