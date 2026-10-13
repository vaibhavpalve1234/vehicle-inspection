import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { InspectionData } from '../types/inspection';
import { DEFAULT_INSPECTION_SECTIONS } from '../data/defaultCheckpoints';
import { DEFAULT_PHOTO_SLOTS, DEFAULT_VEHICLE_INFO, DEFAULT_REMARKS } from '../data/defaultPhotos';

const STORAGE_KEY = '@vehicle_inspection_active_v1';
const PHOTO_DIR = (FileSystem.documentDirectory || '') + 'vehicle_photos/';

export class StorageService {
  /**
   * Ensure directory exists on local mobile filesystem
   */
  static async initStorage(): Promise<void> {
    try {
      if (FileSystem.documentDirectory) {
        const dirInfo = await FileSystem.getInfoAsync(PHOTO_DIR);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(PHOTO_DIR, { intermediates: true });
        }
      }
    } catch (err) {
      console.warn('Error creating local photo directory:', err);
    }
  }

  /**
   * Save an uploaded image permanently to device local storage
   */
  static async savePhotoLocally(sourceUri: string, prefix = 'photo'): Promise<string> {
    try {
      await this.initStorage();

      // On web or in-memory blobs, return uri directly
      if (!FileSystem.documentDirectory) {
        return sourceUri;
      }

      const ext = sourceUri.split('.').pop()?.split('?')[0] || 'jpg';
      const cleanExt = ['jpg', 'jpeg', 'png', 'webp', 'heic'].includes(ext.toLowerCase()) ? ext : 'jpg';
      const fileName = `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${cleanExt}`;
      const destinationUri = `${PHOTO_DIR}${fileName}`;

      await FileSystem.copyAsync({
        from: sourceUri,
        to: destinationUri,
      });

      return destinationUri;
    } catch (err) {
      console.warn('Fallback to original URI due to copy error:', err);
      return sourceUri;
    }
  }

  /**
   * Convert local photo to base64 for embedding into offline PDF
   */
  static async getPhotoBase64(uri: string): Promise<string | null> {
    if (!uri) return null;
    try {
      // If already a base64 or remote/blob
      if (uri.startsWith('data:image')) {
        return uri;
      }

      if (FileSystem.documentDirectory && uri.startsWith('file://')) {
        const base64Data = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const ext = uri.split('.').pop()?.toLowerCase() || 'jpeg';
        const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
        return `data:${mimeType};base64,${base64Data}`;
      }

      // Fallback for fetchable uris
      const res = await fetch(uri);
      const blob = await res.blob();
      return await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.warn('Failed converting image to base64:', e);
      return uri; // Return uri as fallback
    }
  }

  /**
   * Load current active inspection from mobile AsyncStorage
   */
  static async loadInspection(): Promise<InspectionData> {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      if (json) {
        const parsed = JSON.parse(json);
        return parsed;
      }
    } catch (e) {
      console.error('Error loading inspection:', e);
    }

    return this.createInitialInspection();
  }

  /**
   * Save inspection data to AsyncStorage
   */
  static async saveInspection(data: InspectionData): Promise<void> {
    try {
      data.updatedAt = Date.now();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving inspection:', e);
    }
  }

  /**
   * Reset / Create new inspection
   */
  static createInitialInspection(): InspectionData {
    return {
      id: 'insp-' + Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      info: { ...DEFAULT_VEHICLE_INFO },
      sections: JSON.parse(JSON.stringify(DEFAULT_INSPECTION_SECTIONS)),
      standardPhotos: JSON.parse(JSON.stringify(DEFAULT_PHOTO_SLOTS)),
      extraPhotos: [],
      remarks: DEFAULT_REMARKS,
    };
  }

  /**
   * Clear storage
   */
  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Error clearing:', e);
    }
  }
}
