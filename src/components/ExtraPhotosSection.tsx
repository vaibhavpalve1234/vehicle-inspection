import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ExtraPhoto } from '../types/inspection';
import { StorageService } from '../services/storageService';

interface ExtraPhotosSectionProps {
  photos: ExtraPhoto[];
  onAddPhoto: (photo: ExtraPhoto) => void;
  onRemovePhoto: (id: string) => void;
}

export const ExtraPhotosSection: React.FC<ExtraPhotosSectionProps> = ({
  photos,
  onAddPhoto,
  onRemovePhoto,
}) => {
  const pickExtraPhoto = async (useCamera: boolean) => {
    try {
      const permission = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert('Permission required', 'Please grant permission to take/select photos.');
        return;
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.7,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.7,
          });

      if (!result.canceled && result.assets && result.assets[0]) {
        const sourceUri = result.assets[0].uri;
        const localPath = await StorageService.savePhotoLocally(sourceUri, 'extra');

        const newPhoto: ExtraPhoto = {
          id: 'extra-' + Date.now(),
          uri: localPath,
          localPath,
          title: `Extra #${photos.length + 1} (Paint/Tyre/Detail)`,
          timestamp: Date.now(),
        };

        onAddPhoto(newPhoto);
      }
    } catch (err: any) {
      Alert.alert('Upload Error', err?.message || 'Could not upload extra photo');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Extra Photos & Paint Gauge Readings</Text>
          <Text style={styles.subtitle}>
            Paint readings, tyre tread gauges, scratches, and closeups ({photos.length} added)
          </Text>
        </View>

        <View style={styles.btnRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.cameraBtn]}
            onPress={() => pickExtraPhoto(true)}
          >
            <Text style={styles.actionBtnText}>📷 Add</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.galleryBtn]}
            onPress={() => pickExtraPhoto(false)}
          >
            <Text style={styles.actionBtnText}>🖼️ Gallery</Text>
          </TouchableOpacity>
        </View>
      </View>

      {photos.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>
            No extra photos added yet. Tap buttons above to capture paint meter readings or defect closeups.
          </Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {photos.map((p, index) => (
            <View key={p.id} style={styles.gridItem}>
              <Image source={{ uri: p.uri }} style={styles.gridImage} resizeMode="cover" />
              <View style={styles.overlay}>
                <Text style={styles.tagText} numberOfLines={1}>
                  #{index + 1}
                </Text>
                <TouchableOpacity
                  style={styles.delBtn}
                  onPress={() => onRemovePhoto(p.id)}
                >
                  <Text style={styles.delText}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 6,
  },
  actionBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },
  cameraBtn: {
    backgroundColor: '#f8fafc',
    borderColor: '#cbd5e1',
  },
  galleryBtn: {
    backgroundColor: '#fff7ed',
    borderColor: '#fed7aa',
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1e293b',
  },
  emptyBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridItem: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#f1f5f9',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 4,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  tagText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '700',
  },
  delBtn: {
    backgroundColor: 'rgba(239,68,68,0.8)',
    borderRadius: 10,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  delText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
});
