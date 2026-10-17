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
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { PhotoSlot, CheckpointStatus } from '../types/inspection';
import { StorageService } from '../services/storageService';
import { Colors } from '../theme/colors';
import { triggerHaptic } from '../utils/haptics';

interface PhotoSlotCardProps {
  slot: PhotoSlot;
  onUpdateSlot: (updated: PhotoSlot) => void;
}

export const PhotoSlotCard: React.FC<PhotoSlotCardProps> = ({ slot, onUpdateSlot }) => {
  const [showOptionsModal, setShowOptionsModal] = useState<boolean>(false);
  const [showLightbox, setShowLightbox] = useState<boolean>(false);
  const [tempStatus, setTempStatus] = useState<CheckpointStatus>(slot.status || 'OK');
  const [tempObs, setTempObs] = useState<string>(slot.observation || '');

  // Detect angle guide helper based on title
  const getAngleGuide = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('front')) return { icon: '🚘', label: 'Front 45° Angle Framing' };
    if (t.includes('rear') || t.includes('back')) return { icon: '🚗', label: 'Rear 45° & Tail Section' };
    if (t.includes('engine')) return { icon: '⚙️', label: 'Engine Bay Top Overhead' };
    if (t.includes('interior') || t.includes('dash') || t.includes('meter'))
      return { icon: '💺', label: 'Driver Cockpit & Console' };
    if (t.includes('tyre') || t.includes('wheel')) return { icon: '🛞', label: 'Tire Tread & Rim Profile' };
    if (t.includes('underbody') || t.includes('dicky')) return { icon: '🔧', label: 'Boot / Underbody Floor' };
    return { icon: '📷', label: 'Standard Angle Framing' };
  };

  const angleGuide = getAngleGuide(slot.title);

  const pickImage = async (useCamera: boolean) => {
    try {
      triggerHaptic('light');
      const permission = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permission required',
          `Please grant ${useCamera ? 'camera' : 'gallery'} permission to take vehicle photos.`
        );
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
        const localPath = await StorageService.savePhotoLocally(sourceUri, slot.id);

        const updated: PhotoSlot = {
          ...slot,
          uri: localPath,
          localPath,
          timestamp: Date.now(),
          status: slot.status || 'OK',
        };

        onUpdateSlot(updated);
        setTempStatus(updated.status || 'OK');
        setTempObs(updated.observation || '');
        setShowOptionsModal(true);
      }
    } catch (err: any) {
      Alert.alert('Upload Error', err?.message || 'Could not upload photo');
    }
  };

  const removePhoto = () => {
    triggerHaptic('warning');
    Alert.alert('Remove Photo', `Remove photo for "${slot.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          triggerHaptic('heavy');
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
    triggerHaptic('medium');
    onUpdateSlot({
      ...slot,
      status: tempStatus,
      observation: tempObs,
    });
    setShowOptionsModal(false);
  };

  const quickTags = [
    'Original Paint',
    'Repainted',
    'Dent Noted',
    'Deep Scratch',
    'Replaced Panel',
    'Rusting',
    'Cracked',
    'Clear / Normal',
  ];

  return (
    <View style={styles.card}>
      {/* Top Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleWithGuide}>
          <Text style={styles.guideIcon}>{angleGuide.icon}</Text>
          <Text style={styles.slotTitle} numberOfLines={1}>
            {slot.title}
          </Text>
        </View>

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
                slot.status === 'OK' && { color: Colors.status.ok.text },
                slot.status === 'Attention' && { color: Colors.status.attention.text },
                slot.status === 'Failed' && { color: Colors.status.failed.text },
                slot.status === 'NA' && { color: Colors.status.na.text },
              ]}
            >
              {slot.status === 'OK' ? '✓ PASS' : slot.status === 'Attention' ? '⚠️ ATTN' : slot.status === 'Failed' ? '✕ FAIL' : '— NA'}
            </Text>
          </View>
        )}
      </View>

      {/* Main Image or Guide Placeholder */}
      {slot.uri ? (
        <View style={styles.previewContainer}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => {
              triggerHaptic('light');
              setShowLightbox(true);
            }}
          >
            <Image source={{ uri: slot.uri }} style={styles.previewImage} resizeMode="cover" />
            <View style={styles.zoomHintBadge}>
              <Text style={styles.zoomHintText}>🔍 Tap to Zoom</Text>
            </View>
          </TouchableOpacity>

          {slot.observation ? (
            <View style={styles.obsBar}>
              <Text style={styles.obsLabel}>OBSERVATION:</Text>
              <Text style={styles.obsText} numberOfLines={2}>
                {slot.observation}
              </Text>
            </View>
          ) : null}

          {/* Action toolbar */}
          <View style={styles.imageActionButtons}>
            <TouchableOpacity
              style={styles.optionsBtn}
              activeOpacity={0.7}
              onPress={() => {
                triggerHaptic('light');
                setTempStatus(slot.status || 'OK');
                setTempObs(slot.observation || '');
                setShowOptionsModal(true);
              }}
            >
              <Text style={styles.optionsBtnText}>⚙️ Edit Tags & Status</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.replaceBtn}
              activeOpacity={0.7}
              onPress={() => pickImage(true)}
            >
              <Text style={styles.replaceBtnText}>Retake 📷</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteBtn}
              activeOpacity={0.7}
              onPress={removePhoto}
            >
              <Text style={styles.deleteBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          {/* Wireframe Framing Guide */}
          <View style={styles.wireframeBox}>
            <Text style={styles.wireframeIcon}>{angleGuide.icon}</Text>
            <Text style={styles.wireframeLabel}>{angleGuide.label}</Text>
            <Text style={styles.wireframeHint}>Frame vehicle clearly with sufficient lighting</Text>
          </View>

          <View style={styles.uploadButtonsRow}>
            <TouchableOpacity
              style={[styles.uploadBtn, styles.cameraBtn]}
              activeOpacity={0.8}
              onPress={() => pickImage(true)}
            >
              <Text style={styles.cameraBtnText}>📷 Open Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.uploadBtn, styles.galleryBtn]}
              activeOpacity={0.8}
              onPress={() => pickImage(false)}
            >
              <Text style={styles.galleryBtnText}>🖼️ Choose Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Full-Screen Zoom Lightbox Modal */}
      <Modal visible={showLightbox} transparent animationType="fade">
        <View style={styles.lightboxOverlay}>
          <View style={styles.lightboxHeader}>
            <Text style={styles.lightboxTitle}>{slot.title}</Text>
            <TouchableOpacity
              style={styles.lightboxCloseBtn}
              onPress={() => setShowLightbox(false)}
            >
              <Text style={styles.lightboxCloseText}>✕ Close</Text>
            </TouchableOpacity>
          </View>

          {slot.uri && (
            <Image
              source={{ uri: slot.uri }}
              style={styles.lightboxImage}
              resizeMode="contain"
            />
          )}

          <View style={styles.lightboxFooter}>
            <Text style={styles.lightboxStatus}>Status: {slot.status || 'OK'}</Text>
            {slot.observation ? (
              <Text style={styles.lightboxObs}>Notes: {slot.observation}</Text>
            ) : null}
          </View>
        </View>
      </Modal>

      {/* Post-Upload Options Selection Modal */}
      <Modal visible={showOptionsModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalTopBar}>
              <View>
                <Text style={styles.modalTitle}>Photo Assessment</Text>
                <Text style={styles.modalSubtitle}>{slot.title}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowOptionsModal(false)}
                style={styles.modalCloseIcon}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSectionLabel}>CONDITION STATUS</Text>
            <View style={styles.modalStatusRow}>
              {(['OK', 'Attention', 'Failed', 'NA'] as CheckpointStatus[]).map((st) => (
                <TouchableOpacity
                  key={st}
                  activeOpacity={0.7}
                  style={[
                    styles.modalStatusBtn,
                    tempStatus === st && styles.modalStatusBtnActive,
                    tempStatus === st && st === 'OK' && { borderColor: Colors.status.ok.border, backgroundColor: Colors.status.ok.bg },
                    tempStatus === st && st === 'Attention' && { borderColor: Colors.status.attention.border, backgroundColor: Colors.status.attention.bg },
                    tempStatus === st && st === 'Failed' && { borderColor: Colors.status.failed.border, backgroundColor: Colors.status.failed.bg },
                    tempStatus === st && st === 'NA' && { borderColor: Colors.status.na.border, backgroundColor: Colors.status.na.bg },
                  ]}
                  onPress={() => {
                    triggerHaptic('light');
                    setTempStatus(st);
                  }}
                >
                  <Text
                    style={[
                      styles.modalStatusText,
                      tempStatus === st && { fontWeight: '800', color: '#ffffff' },
                    ]}
                  >
                    {st === 'OK' ? '✓ Pass' : st === 'Attention' ? '⚠️ Attn' : st === 'Failed' ? '✕ Fail' : '— NA'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalSectionLabel}>RAPID OBSERVATION TAGS (1-TAP)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.modalChipsScroll}>
              {quickTags.map((tag) => {
                const isSelected = tempObs.includes(tag);
                return (
                  <TouchableOpacity
                    key={tag}
                    style={[styles.modalTagChip, isSelected && styles.modalTagChipActive]}
                    onPress={() => {
                      triggerHaptic('light');
                      if (isSelected) {
                        setTempObs(
                          tempObs
                            .split(',')
                            .map((t) => t.trim())
                            .filter((t) => t !== tag)
                            .join(', ')
                        );
                      } else {
                        setTempObs((prev) => (prev ? `${prev}, ${tag}` : tag));
                      }
                    }}
                  >
                    <Text style={[styles.modalTagChipText, isSelected && styles.modalTagChipTextActive]}>
                      {isSelected ? '✓ ' : '+ '}
                      {tag}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text style={styles.modalSectionLabel}>CUSTOM NOTES</Text>
            <TextInput
              style={styles.modalInput}
              value={tempObs}
              placeholder="e.g. Minor scratches near edge, original factory paint..."
              placeholderTextColor="#64748b"
              onChangeText={setTempObs}
            />

            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowOptionsModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSaveOptions}>
                <Text style={styles.modalSaveText}>Save Evaluation ✓</Text>
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
    backgroundColor: Colors.background.surface,
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: Colors.background.border,
    overflow: 'hidden',
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#1b263b',
    borderBottomWidth: 1,
    borderBottomColor: Colors.background.border,
  },
  titleWithGuide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  guideIcon: {
    fontSize: 16,
  },
  slotTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.text.primary,
    flex: 1,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  pillOk: { backgroundColor: Colors.status.ok.bg, borderColor: Colors.status.ok.border },
  pillAttn: { backgroundColor: Colors.status.attention.bg, borderColor: Colors.status.attention.border },
  pillFailed: { backgroundColor: Colors.status.failed.bg, borderColor: Colors.status.failed.border },
  pillNa: { backgroundColor: Colors.status.na.bg, borderColor: Colors.status.na.border },

  /* Empty state & wireframe */
  emptyContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0c1322',
  },
  wireframeBox: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#243552',
    borderRadius: 12,
    width: '100%',
    paddingVertical: 24,
    marginBottom: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
  },
  wireframeIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  wireframeLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  wireframeHint: {
    fontSize: 10.5,
    color: Colors.text.muted,
    marginTop: 2,
  },
  uploadButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  uploadBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  cameraBtn: {
    backgroundColor: '#ea580c',
    borderColor: '#f97316',
  },
  cameraBtnText: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '800',
  },
  galleryBtn: {
    backgroundColor: '#162238',
    borderColor: '#293a56',
  },
  galleryBtnText: {
    color: '#cbd5e1',
    fontSize: 12.5,
    fontWeight: '700',
  },

  /* Preview */
  previewContainer: {
    position: 'relative',
    backgroundColor: '#080c14',
  },
  previewImage: {
    width: '100%',
    height: 190,
  },
  zoomHintBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  zoomHintText: {
    color: '#f8fafc',
    fontSize: 10,
    fontWeight: '600',
  },
  obsBar: {
    backgroundColor: '#111a2c',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.background.border,
  },
  obsLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.accent.secondary,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  obsText: {
    fontSize: 11.5,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  imageActionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#131e32',
    borderTopWidth: 1,
    borderTopColor: Colors.background.border,
    gap: 8,
  },
  optionsBtn: {
    backgroundColor: '#1e2d48',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#2b3f63',
  },
  optionsBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#cbd5e1',
  },
  replaceBtn: {
    backgroundColor: '#203352',
    borderWidth: 1,
    borderColor: '#38bdf8',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 7,
  },
  replaceBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#38bdf8',
  },
  deleteBtn: {
    backgroundColor: '#450a0a',
    borderWidth: 1,
    borderColor: '#991b1b',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 7,
  },
  deleteBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#f87171',
  },

  /* Lightbox */
  lightboxOverlay: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
  },
  lightboxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
  },
  lightboxTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  lightboxCloseBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#1e293b',
    borderRadius: 6,
  },
  lightboxCloseText: {
    color: '#f87171',
    fontWeight: '700',
    fontSize: 12,
  },
  lightboxImage: {
    width: '100%',
    height: '70%',
  },
  lightboxFooter: {
    padding: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
  },
  lightboxStatus: {
    color: '#38bdf8',
    fontSize: 13,
    fontWeight: '700',
  },
  lightboxObs: {
    color: '#cbd5e1',
    fontSize: 12,
    marginTop: 4,
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#243552',
  },
  modalTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  modalCloseIcon: {
    padding: 6,
  },
  modalCloseText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  modalSectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.accent.secondary,
    letterSpacing: 0.8,
    marginTop: 10,
    marginBottom: 6,
  },
  modalStatusRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modalStatusBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#162238',
    borderWidth: 1.5,
    borderColor: '#283c5e',
  },
  modalStatusBtnActive: {
    borderColor: Colors.accent.primary,
  },
  modalStatusText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '700',
  },
  modalChipsScroll: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  modalTagChip: {
    backgroundColor: '#16233a',
    borderWidth: 1,
    borderColor: '#263b60',
    borderRadius: 12,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 6,
  },
  modalTagChipActive: {
    backgroundColor: '#9a3412',
    borderColor: Colors.accent.primary,
  },
  modalTagChipText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
  modalTagChipTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
  modalInput: {
    backgroundColor: '#141e32',
    borderWidth: 1,
    borderColor: '#243552',
    borderRadius: 8,
    padding: 10,
    color: '#ffffff',
    fontSize: 12,
    marginTop: 4,
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: '#1e293b',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#94a3b8',
    fontWeight: '700',
    fontSize: 13,
  },
  modalSaveBtn: {
    flex: 2,
    backgroundColor: '#ea580c',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalSaveText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 13,
  },
});
