import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { CheckpointItem, CheckpointStatus } from '../types/inspection';
import { Colors } from '../theme/colors';
import { triggerHaptic } from '../utils/haptics';

interface CheckpointRowProps {
  item: CheckpointItem;
  onChangeStatus: (newStatus: CheckpointStatus) => void;
  onChangeObservation: (obs: string) => void;
}

// Preset common inspection defect tags for rapid 1-tap entry without typing
const COMMON_TAGS = [
  'Scratched',
  'Dented',
  'Repainted',
  'Rusted',
  'Corrosion',
  'Oil Leak',
  'Broken',
  'Loose',
  'Abnormal Noise',
  'Worn Out',
];

export const CheckpointRow: React.FC<CheckpointRowProps> = ({
  item,
  onChangeStatus,
  onChangeObservation,
}) => {
  const [showObsInput, setShowObsInput] = useState<boolean>(
    Boolean(item.observation) || item.status === 'Attention' || item.status === 'Failed'
  );

  const statuses: { key: CheckpointStatus; label: string; icon: string }[] = [
    { key: 'OK', label: 'Pass', icon: '✓' },
    { key: 'Attention', label: 'Attn', icon: '⚠️' },
    { key: 'Failed', label: 'Fail', icon: '✕' },
    { key: 'NA', label: 'N/A', icon: '—' },
  ];

  const handleStatusSelect = (status: CheckpointStatus) => {
    if (status === 'Failed') triggerHaptic('error');
    else if (status === 'Attention') triggerHaptic('warning');
    else triggerHaptic('light');

    onChangeStatus(status);
    if (status === 'Attention' || status === 'Failed') {
      setShowObsInput(true);
    }
  };

  const handleToggleTag = (tag: string) => {
    triggerHaptic('light');
    const currentTags = item.observation
      ? item.observation.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    let newTags: string[];
    if (currentTags.includes(tag)) {
      newTags = currentTags.filter((t) => t !== tag);
    } else {
      newTags = [...currentTags, tag];
    }
    onChangeObservation(newTags.join(', '));
  };

  const currentTagsList = item.observation
    ? item.observation.split(',').map((t) => t.trim())
    : [];

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.titleArea}>
          <Text style={styles.nameText} numberOfLines={2}>
            {item.name}
          </Text>
          {item.observation ? (
            <Text style={styles.summaryObsText} numberOfLines={1}>
              Note: {item.observation}
            </Text>
          ) : null}
        </View>

        {/* Tactile Status Pills */}
        <View style={styles.statusButtonsContainer}>
          {statuses.map(({ key, label, icon }) => {
            const isSelected = item.status === key;
            return (
              <TouchableOpacity
                key={key}
                activeOpacity={0.7}
                onPress={() => handleStatusSelect(key)}
                style={[
                  styles.statusBtn,
                  key === 'OK' && (isSelected ? styles.btnOkActive : styles.btnOkInactive),
                  key === 'Attention' && (isSelected ? styles.btnAttnActive : styles.btnAttnInactive),
                  key === 'Failed' && (isSelected ? styles.btnFailedActive : styles.btnFailedInactive),
                  key === 'NA' && (isSelected ? styles.btnNaActive : styles.btnNaInactive),
                ]}
              >
                <Text
                  style={[
                    styles.statusIcon,
                    isSelected && key === 'OK' && { color: Colors.status.ok.text },
                    isSelected && key === 'Attention' && { color: Colors.status.attention.text },
                    isSelected && key === 'Failed' && { color: Colors.status.failed.text },
                    isSelected && key === 'NA' && { color: Colors.status.na.text },
                  ]}
                >
                  {icon}
                </Text>
                <Text
                  style={[
                    styles.statusText,
                    isSelected ? styles.statusTextActive : styles.statusTextInactive,
                    isSelected && key === 'OK' && { color: Colors.status.ok.text },
                    isSelected && key === 'Attention' && { color: Colors.status.attention.text },
                    isSelected && key === 'Failed' && { color: Colors.status.failed.text },
                    isSelected && key === 'NA' && { color: Colors.status.na.text },
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Observation Section & Fast-Touch Chips */}
      {showObsInput || item.observation ? (
        <View style={styles.obsWrapper}>
          {/* 1-Tap Quick Tags Bar for high-speed field inspection */}
          <Text style={styles.tagsHeaderLabel}>QUICK OBSERVATION CHIPS (1-TAP):</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsScroll}>
            {COMMON_TAGS.map((tag) => {
              const active = currentTagsList.includes(tag);
              return (
                <TouchableOpacity
                  key={tag}
                  activeOpacity={0.7}
                  onPress={() => handleToggleTag(tag)}
                  style={[styles.tagChip, active && styles.tagChipActive]}
                >
                  <Text style={[styles.tagChipText, active && styles.tagChipTextActive]}>
                    {active ? '✓ ' : '+ '}
                    {tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Detailed Input Field */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.obsInput}
              value={item.observation}
              placeholder="Custom observation details or specs..."
              placeholderTextColor="#64748b"
              onChangeText={onChangeObservation}
            />
            {item.observation ? (
              <TouchableOpacity
                onPress={() => onChangeObservation('')}
                style={styles.clearBtn}
              >
                <Text style={styles.clearBtnText}>✕</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.addObsBtn}
          onPress={() => {
            triggerHaptic('light');
            setShowObsInput(true);
          }}
        >
          <Text style={styles.addObsText}>+ Add Observation / Defect Note</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background.border,
    backgroundColor: 'transparent',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  titleArea: {
    flex: 1,
    marginRight: 6,
  },
  nameText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: Colors.text.primary,
    letterSpacing: -0.2,
  },
  summaryObsText: {
    fontSize: 11,
    color: Colors.accent.primary,
    marginTop: 2,
    fontWeight: '500',
  },
  statusButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 9,
    borderRadius: 8,
    borderWidth: 1.2,
    minWidth: 48,
    gap: 3,
  },
  statusIcon: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusTextActive: {
    fontWeight: '800',
  },
  statusTextInactive: {
    color: '#64748b',
  },
  btnOkActive: {
    backgroundColor: Colors.status.ok.bg,
    borderColor: Colors.status.ok.border,
  },
  btnOkInactive: {
    backgroundColor: '#0d1928',
    borderColor: '#1e2d44',
  },
  btnAttnActive: {
    backgroundColor: Colors.status.attention.bg,
    borderColor: Colors.status.attention.border,
  },
  btnAttnInactive: {
    backgroundColor: '#0d1928',
    borderColor: '#1e2d44',
  },
  btnFailedActive: {
    backgroundColor: Colors.status.failed.bg,
    borderColor: Colors.status.failed.border,
  },
  btnFailedInactive: {
    backgroundColor: '#0d1928',
    borderColor: '#1e2d44',
  },
  btnNaActive: {
    backgroundColor: Colors.status.na.bg,
    borderColor: Colors.status.na.border,
  },
  btnNaInactive: {
    backgroundColor: '#0d1928',
    borderColor: '#1e2d44',
  },
  obsWrapper: {
    marginTop: 10,
    backgroundColor: '#0c1322',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1e2d44',
  },
  tagsHeaderLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  tagsScroll: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tagChip: {
    backgroundColor: '#162238',
    borderWidth: 1,
    borderColor: '#293a56',
    borderRadius: 14,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: 6,
  },
  tagChipActive: {
    backgroundColor: '#9a3412',
    borderColor: Colors.accent.primary,
  },
  tagChipText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
  },
  tagChipTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111a2e',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#243550',
    paddingHorizontal: 8,
  },
  obsInput: {
    flex: 1,
    paddingVertical: 6,
    fontSize: 12,
    color: Colors.text.primary,
  },
  clearBtn: {
    padding: 4,
  },
  clearBtnText: {
    color: '#64748b',
    fontSize: 12,
  },
  addObsBtn: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingVertical: 3,
    paddingHorizontal: 6,
  },
  addObsText: {
    color: Colors.accent.secondary,
    fontSize: 11,
    fontWeight: '600',
  },
});
