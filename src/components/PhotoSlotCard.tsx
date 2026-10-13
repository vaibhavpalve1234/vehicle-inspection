import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { PhotoSlot, CheckpointStatus } from '../types/inspection';
import { StorageService } from '../services/storageService';

interface PhotoSlotCardProps {
  slot: PhotoSlot;
  onUpdateSlot: (updated: PhotoSlot) => void;
}

export const PhotoSlotCard: React.FC<PhotoSlotCardProps> = ({ slot, onUpdateSlot }) => {
  const [showOptionsModal, setShowOptionsModal] = useState<boolean>(false);
  const [tempStatus, setTempStatus] = useState<CheckpointStatus>(slot.status || 'OK');
  const [tempObs, setTempObs] = useState<string>(slot.observation || '');

  const pickImage = async (useCamera: boolean) => {
    try {
      const permission = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permission required',
          `Please grant ${useCamera ? 'camera' : 'gallery'} permission to upload vehicle photos.`
        );
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
        // Save permanently to device local file system
        const localPath = await StorageService.savePhotoLocally(sourceUri, slot.id);

        const updated: PhotoSlot = {
          ...slot,
          uri: localPath,
          localPath,
          timestamp: Date.now(),
          status: slot.status || 'OK',
        };

        onUpdateSlot(updated);
        // Automatically open the options selector modal right after upload as requested by user!
        setTempStatus(updated.status || 'OK');
        setTempObs(updated.observation || '');
        setShowOptionsModal(true);
      }
    } catch (err: any) {
      Alert.alert('Upload Error', err?.message || 'Could not upload photo');
    }
  };

  const removePhoto = () => {
    Alert.alert('Remove Photo', `Remove photo for "${slot.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          onUpdateSlot({
            ...slot,
            uri: undefined,
            localPath: undefined,
            observation: '',
            status: 'OK',
          });
        },
      },
    ]);
  };

  const handleSaveOptions = () => {
    onUpdateSlot({
      ...slot,
      status: tempStatus,
      observation: tempObs,
    });
    setShowOptionsModal(false);
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.slotTitle} numberOfLines={1}>
          {slot.title}
        </Text>
        {slot.uri && (
          <View
            style={[
              styles.statusPill,
              slot.status === 'OK' && styles.pillOk,
              slot.status === 'Attention' && styles.pillAttn,
              slot.status === 'Failed' && styles.pillFailed,
              slot.status === 'NA' && styles.pillNa,
            ]}
          >
            <Text
              style={[
                styles.statusPillText,
                slot.status === 'OK' && { color: '#15803d' },
                slot.status === 'Attention' && { color: '#b45309' },
                slot.status === 'Failed' && { color: '#b91c1c' },
                slot.status === 'NA' && { color: '#64748b' },
              ]}
            >
              {slot.status || 'OK'}
            </Text>
          </View>
        )}
      </View>

      {slot.uri ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: slot.uri }} style={styles.previewImage} resizeMode="cover" />

          {slot.observation ? (
            <View style={styles.obsBar}>
              <Text style={styles.obsText} numberOfLines={2}>
                📝 {slot.observation}
              </Text>
            </View>
          ) : null}

          <View style={styles.imageActionButtons}>
            <TouchableOpacity
              style={styles.optionsBtn}
              onPress={() => {
                setTempStatus(slot.status || 'OK');
                setTempObs(slot.observation || '');
                setShowOptionsModal(true);
              }}
            >
              <Text style={styles.optionsBtnText}>⚙️ Edit Options</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.replaceBtn} onPress={() => pickImage(false)}>
              <Text style={styles.replaceBtnText}>Replace</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteBtn} onPress={removePhoto}>
              <Text style={styles.deleteBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyPrompt}>No photo uploaded yet</Text>
          <View style={styles.uploadButtonsRow}>
            <TouchableOpacity
              style={[styles.uploadBtn, styles.cameraBtn]}
              onPress={() => pickImage(true)}
            >
              <Text style={styles.uploadBtnText}>📷 Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.uploadBtn, styles.galleryBtn]}
              onPress={() => pickImage(false)}
            >
              <Text style={styles.uploadBtnText}>🖼️ Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Post-Upload Options Selection Modal */}
      <Modal visible={showOptionsModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Evaluation & Options</Text>
            <Text style={styles.modalSubtitle}>{slot.title}</Text>

            <Text style={styles.modalSectionLabel}>Inspection Status</Text>
            <View style={styles.modalStatusRow}>
              {(['OK', 'Attention', 'Failed', 'NA'] as CheckpointStatus[]).map((st) => (
                <TouchableOpacity
                  key={st}
                  style={[
                    styles.modalStatusBtn,
                    tempStatus === st && styles.modalStatusBtnActive,
                    tempStatus === st && st === 'OK' && { borderColor: '#22c55e', backgroundColor: '#dcfce7' },
                    tempStatus === st && st === 'Attention' && { borderColor: '#f59e0b', backgroundColor: '#fef3c7' },
                    tempStatus === st && st === 'Failed' && { borderColor: '#ef4444', backgroundColor: '#fee2e2' },
                    tempStatus === st && st === 'NA' && { borderColor: '#94a3b8', backgroundColor: '#e2e8f0' },
                  ]}
                  onPress={() => setTempStatus(st)}
                >
                  <Text
                    style={[
                      styles.modalStatusText,
                      tempStatus === st && { fontWeight: '800', color: '#0f172a' },
                    ]}
                  >
                    {st}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalSectionLabel}>Observation / Notes</Text>
            <TextInput
              style={styles.modalInput}
              value={tempObs}
              placeholder="e.g. Repainted, Minor scratch, Clear, Dent..."
              placeholderTextColor="#94a3b8"
              onChangeText={setTempObs}
            />

            <View style={styles.quickTagsRow}>
              {['Repainted', 'Original', 'Dent', 'Scratch', 'Replaced', 'Rusting'].map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={styles.tagChip}
                  onPress={() => setTempObs((prev) => (prev ? `${prev}, ${tag}` : tag))}
                >
                  <Text style={styles.tagChipText}>+{tag}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowOptionsModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSaveOptions}>
                <Text style={styles.modalSaveText}>Save Options</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  slotTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
  },
  statusPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  pillOk: { backgroundColor: '#dcfce7', borderColor: '#86efac' },
  pillAttn: { backgroundColor: '#fef3c7', borderColor: '#fcd34d' },
  pillFailed: { backgroundColor: '#fee2e2', borderColor: '#fca5a5' },
  pillNa: { backgroundColor: '#f1f5f9', borderColor: '#cbd5e1' },
  emptyContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  emptyPrompt: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 10,
  },
  uploadButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  uploadBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
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
  uploadBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
  },
  previewContainer: {
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#f1f5f9',
  },
  obsBar: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  obsText: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '500',
  },
  imageActionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 8,
    gap: 8,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  optionsBtn: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginRight: 'auto',
  },
  optionsBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  replaceBtn: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  replaceBtnText: {
    fontSize: 11,
    color: '#475569',
  },
  deleteBtn: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  deleteBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ef4444',
  },
  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 20,
    paddingBottom: 32,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#ea580c',
    fontWeight: '600',
    marginTop: 2,
    marginBottom: 16,
  },
  modalSectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  modalStatusRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  modalStatusBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
    alignItems: 'center',
  },
  modalStatusBtnActive: {
    borderWidth: 2,
  },
  modalStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  modalInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0f172a',
  },
  quickTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
    marginBottom: 20,
  },
  tagChip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagChipText: {
    fontSize: 11,
    color: '#475569',
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  modalSaveBtn: {
    flex: 2,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#ea580c',
  },
  modalSaveText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
});
