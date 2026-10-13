import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { CheckpointItem, CheckpointStatus } from '../types/inspection';

interface CheckpointRowProps {
  item: CheckpointItem;
  onChangeStatus: (newStatus: CheckpointStatus) => void;
  onChangeObservation: (obs: string) => void;
}

export const CheckpointRow: React.FC<CheckpointRowProps> = ({
  item,
  onChangeStatus,
  onChangeObservation,
}) => {
  const [showObsInput, setShowObsInput] = useState<boolean>(
    Boolean(item.observation) || item.status === 'Attention' || item.status === 'Failed'
  );

  const statuses: CheckpointStatus[] = ['OK', 'Attention', 'Failed', 'NA'];

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.nameText} numberOfLines={2}>
          {item.name}
        </Text>

        <View style={styles.statusButtonsContainer}>
          {statuses.map((status) => {
            const isSelected = item.status === status;
            return (
              <TouchableOpacity
                key={status}
                onPress={() => {
                  onChangeStatus(status);
                  if (status === 'Attention' || status === 'Failed') {
                    setShowObsInput(true);
                  }
                }}
                style={[
                  styles.statusBtn,
                  status === 'OK' && (isSelected ? styles.btnOkActive : styles.btnOkInactive),
                  status === 'Attention' && (isSelected ? styles.btnAttnActive : styles.btnAttnInactive),
                  status === 'Failed' && (isSelected ? styles.btnFailedActive : styles.btnFailedInactive),
                  status === 'NA' && (isSelected ? styles.btnNaActive : styles.btnNaInactive),
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    isSelected ? styles.statusTextActive : styles.statusTextInactive,
                    isSelected && status === 'OK' && { color: '#15803d' },
                    isSelected && status === 'Attention' && { color: '#b45309' },
                    isSelected && status === 'Failed' && { color: '#b91c1c' },
                    isSelected && status === 'NA' && { color: '#475569' },
                  ]}
                >
                  {status}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Observation Line / Input */}
      {showObsInput || item.observation ? (
        <View style={styles.obsContainer}>
          <TextInput
            style={styles.obsInput}
            value={item.observation}
            placeholder="Add observation (e.g. Repainted, Corrosion, Bend)..."
            placeholderTextColor="#94a3b8"
            onChangeText={onChangeObservation}
          />
        </View>
      ) : (
        <TouchableOpacity
          style={styles.addObsBtn}
          onPress={() => setShowObsInput(true)}
        >
          <Text style={styles.addObsText}>+ Observation note</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  nameText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
  },
  statusButtonsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  statusBtn: {
    paddingVertical: 5,
    paddingHorizontal: 7,
    borderRadius: 6,
    borderWidth: 1,
    minWidth: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnOkActive: {
    backgroundColor: '#dcfce7',
    borderColor: '#86efac',
  },
  btnOkInactive: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
  },
  btnAttnActive: {
    backgroundColor: '#fef3c7',
    borderColor: '#fcd34d',
  },
  btnAttnInactive: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
  },
  btnFailedActive: {
    backgroundColor: '#fee2e2',
    borderColor: '#fca5a5',
  },
  btnFailedInactive: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
  },
  btnNaActive: {
    backgroundColor: '#e2e8f0',
    borderColor: '#cbd5e1',
  },
  btnNaInactive: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statusTextActive: {
    fontWeight: '800',
  },
  statusTextInactive: {
    color: '#94a3b8',
  },
  obsContainer: {
    marginTop: 6,
  },
  obsInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 11,
    color: '#334155',
  },
  addObsBtn: {
    alignSelf: 'flex-start',
    marginTop: 3,
  },
  addObsText: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '500',
  },
});
