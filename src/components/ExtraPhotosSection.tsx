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
import { Colors } from '../theme/colors';
import { triggerHaptic } from '../utils/haptics';

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
      triggerHaptic('light');
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
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
          });

      if (!result.canceled && result.assets && result.assets[0]) {
        triggerHaptic('medium');
        const sourceUri = result.assets[0].uri;
        const localPath = await StorageService.savePhotoLocally(sourceUri, 'extra');

        const newPhoto: ExtraPhoto = {
          id: 'extra-' + Date.now(),
          uri: localPath,
          localPath,
          title: `Gauge/Defect #${photos.length + 1}`,
          timestamp: Date.now(),
        };

        onAddPhoto(newPhoto);
      }
    } catch (err: any) {
      Alert.alert('Upload Error', err?.message || 'Could not upload extra photo');
    }
  };

  const confirmRemove = (id: string) => {
    triggerHaptic('warning');
    Alert.alert('Delete Extra Photo', 'Are you sure you want to remove this photo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          triggerHaptic('heavy');
          onRemovePhoto(id);
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.titleArea}>
          <Text style={styles.title}>Defect Closeups & Gauge Readings</Text>
          <Text style={styles.subtitle}>
            Paint thickness gauge readings, tire tread depth, & specific damage ({photos.length} captured)
          </Text>
        </View>

        <View style={styles.btnRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.cameraBtn]}
            onPress={() => pickExtraPhoto(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.cameraBtnText}>📷 Snap</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.galleryBtn]}
            onPress={() => pickExtraPhoto(false)}
            activeOpacity={0.8}
          >
            <Text style={styles.galleryBtnText}>🖼️ Gallery</Text>
          </TouchableOpacity>
        </View>
      </View>

      {photos.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>🔬</Text>
          <Text style={styles.emptyTitle}>No Extra Gauge/Defect Photos</Text>
          <Text style={styles.emptyText}>
            Use buttons above to record paint meter readings (microns/mils), tire gauge readings, or magnified defect closeups.
          </Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {photos.map((item, idx) => (
            <View key={item.id} style={styles.card}>
              <Image source={{ uri: item.uri }} style={styles.image} resizeMode="cover" />
              <View style={styles.cardFooter}>
                <Text style={styles.photoLabel} numberOfLines={1}>
                  #{idx + 1} {item.title}
                </Text>
                <TouchableOpacity
                  style={styles.delBtn}
                  onPress={() => confirmRemove(item.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.delBtnText}>✕</Text>
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
    backgroundColor: Colors.background.surface,
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: Colors.background.border,
    padding: 14,
    marginVertical: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleArea: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.text.primary,
  },
  subtitle: {
    fontSize: 11,
    color: Colors.text.muted,
    marginTop: 2,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 6,
  },
  actionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  cameraBtn: {
    backgroundColor: '#9a3412',
    borderColor: Colors.accent.primary,
  },
  cameraBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  galleryBtn: {
    backgroundColor: '#1b263b',
    borderColor: '#2b3d5c',
  },
  galleryBtnText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: '#0c1322',
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#20304a',
  },
  emptyIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text.secondary,
  },
  emptyText: {
    fontSize: 10.5,
    color: Colors.text.muted,
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  card: {
    width: '48%',
    backgroundColor: '#0c1322',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#20304a',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 110,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 6,
    backgroundColor: '#111a2d',
  },
  photoLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.text.primary,
    flex: 1,
  },
  delBtn: {
    backgroundColor: '#450a0a',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  delBtnText: {
    color: '#f87171',
    fontSize: 10,
    fontWeight: '800',
  },
});
