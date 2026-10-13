import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

interface HeaderProps {
  onReset: () => void;
  onLoadSample: () => void;
  stats: {
    ok: number;
    attention: number;
    failed: number;
    photos: number;
    totalPhotos: number;
  };
}

export const Header: React.FC<HeaderProps> = ({ onReset, onLoadSample, stats }) => {
  const confirmReset = () => {
    Alert.alert(
      'Reset Inspection',
      'Are you sure you want to start a fresh inspection? All unsaved data will be cleared.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: onReset },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View>
          <View style={styles.brandRow}>
            <Text style={styles.brandText}>Inspect </Text>
            <Text style={styles.brandAccent}>AutoCar</Text>
          </View>
          <Text style={styles.subtitle}>PDI / PPI Live Inspection Report</Text>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.pillBtn} onPress={onLoadSample}>
            <Text style={styles.pillBtnText}>Load Sample</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.pillBtn, styles.resetBtn]} onPress={confirmReset}>
            <Text style={[styles.pillBtnText, styles.resetBtnText]}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Status Counter Bar */}
      <View style={styles.counterBar}>
        <View style={[styles.counterBadge, styles.badgeOk]}>
          <Text style={styles.counterNum}>{stats.ok}</Text>
          <Text style={styles.counterLabel}>OK</Text>
        </View>
        <View style={[styles.counterBadge, styles.badgeAttn]}>
          <Text style={styles.counterNum}>{stats.attention}</Text>
          <Text style={styles.counterLabel}>Attention</Text>
        </View>
        <View style={[styles.counterBadge, styles.badgeFailed]}>
          <Text style={styles.counterNum}>{stats.failed}</Text>
          <Text style={styles.counterLabel}>Failed</Text>
        </View>
        <View style={[styles.counterBadge, styles.badgePhotos]}>
          <Text style={styles.counterNum}>{stats.photos}/{stats.totalPhotos}</Text>
          <Text style={styles.counterLabel}>Photos</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0f172a',
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 3,
    borderBottomColor: '#ea580c',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  brandAccent: {
    color: '#ea580c',
    fontSize: 20,
    fontWeight: '800',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pillBtn: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  pillBtnText: {
    color: '#e2e8f0',
    fontSize: 11,
    fontWeight: '600',
  },
  resetBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#ef4444',
  },
  resetBtnText: {
    color: '#f87171',
  },
  counterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  counterBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 6,
    gap: 4,
  },
  badgeOk: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.4)',
  },
  badgeAttn: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  badgeFailed: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  badgePhotos: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  counterNum: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  counterLabel: {
    color: '#cbd5e1',
    fontSize: 10,
    fontWeight: '600',
  },
});
