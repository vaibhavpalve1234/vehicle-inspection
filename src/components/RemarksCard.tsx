import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Colors } from '../theme/colors';
import { triggerHaptic } from '../utils/haptics';

interface RemarksCardProps {
  remarks: string;
  onChangeRemarks: (text: string) => void;
}

const COMMON_REMARKS = [
  'Fire wall rusted / repaired',
  'Back panel major dented',
  'Dicky / Boot floor bend dent',
  'All 4 tyres tread good condition',
  'Engine oil seepage observed',
  'Front windshield original glass',
  'Air conditioning cooling normal',
  'Chassis frame accident free',
];

export const RemarksCard: React.FC<RemarksCardProps> = ({ remarks, onChangeRemarks }) => {
  const appendRemark = (note: string) => {
    triggerHaptic('light');
    if (!remarks) {
      onChangeRemarks(`1) ${note}`);
    } else {
      const lines = remarks.split('\n').filter(Boolean);
      const nextNum = lines.length + 1;
      onChangeRemarks(`${remarks}\n${nextNum}) ${note}`);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Text style={styles.icon}>📝</Text>
        </View>
        <View>
          <Text style={styles.title}>Overall Vehicle Inspection Remarks</Text>
          <Text style={styles.subtitle}>
            Executive summary of major damages, repaints, repairs, or warranty notes
          </Text>
        </View>
      </View>

      {/* Rapid Add Remark Chips */}
      <Text style={styles.quickHeader}>ONE-TAP EXECUTIVE REMARK CHIPS:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
        {COMMON_REMARKS.map((note) => (
          <TouchableOpacity
            key={note}
            style={styles.chip}
            activeOpacity={0.7}
            onPress={() => appendRemark(note)}
          >
            <Text style={styles.chipText}>+ {note}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TextInput
        style={styles.input}
        multiline
        numberOfLines={6}
        value={remarks}
        placeholder="1) Fire wall major rusted&#10;2) Back panel major rusted&#10;3) Dicky floor bend dent..."
        placeholderTextColor="#64748b"
        onChangeText={onChangeRemarks}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background.surface,
    borderRadius: 14,
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 14,
    borderWidth: 1.2,
    borderColor: Colors.background.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#0c1322',
    borderWidth: 1,
    borderColor: '#243550',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 16,
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
  quickHeader: {
    fontSize: 9.5,
    fontWeight: '800',
    color: Colors.accent.secondary,
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  chipsScroll: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  chip: {
    backgroundColor: '#162238',
    borderWidth: 1,
    borderColor: '#293a56',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: 6,
  },
  chipText: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#0c1322',
    borderWidth: 1,
    borderColor: '#243552',
    borderRadius: 10,
    padding: 12,
    fontSize: 12.5,
    color: Colors.text.primary,
    minHeight: 120,
    textAlignVertical: 'top',
    lineHeight: 18,
  },
});
