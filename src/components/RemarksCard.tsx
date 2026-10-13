import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';

interface RemarksCardProps {
  remarks: string;
  onChangeRemarks: (text: string) => void;
}

export const RemarksCard: React.FC<RemarksCardProps> = ({ remarks, onChangeRemarks }) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Overall Inspection Remarks</Text>
        <Text style={styles.subtitle}>Summary of key issues, repaints, and major observations</Text>
      </View>
      <TextInput
        style={styles.input}
        multiline
        numberOfLines={4}
        value={remarks}
        placeholder="1) Fire wall major rusted&#10;2) Back panel major rusted&#10;3) Dicky floor bend dent..."
        placeholderTextColor="#94a3b8"
        onChangeText={onChangeRemarks}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  header: {
    marginBottom: 8,
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
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 10,
    fontSize: 12,
    color: '#0f172a',
    minHeight: 90,
    textAlignVertical: 'top',
  },
});
