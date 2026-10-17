import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Colors } from '../theme/colors';
import { triggerHaptic } from '../utils/haptics';
import { HealthScoreDial } from './HealthScoreDial';

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
  totalSections?: number;
  completedSections?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onReset,
  onLoadSample,
  stats,
  totalSections = 36,
  completedSections = 0,
}) => {
  // Calculate dynamic 0-100 Vehicle Condition Health Score
  // Base 100 with deduction weights per failed (-3.5) and attention (-1.2)
  const calculatedScore = Math.max(
    10,
    Math.round(100 - stats.failed * 3.5 - stats.attention * 1.2)
  );

  const confirmReset = () => {
    triggerHaptic('warning');
    Alert.alert(
      'Reset Inspection',
      'Are you sure you want to start a fresh inspection? All unsaved data will be cleared.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            triggerHaptic('heavy');
            onReset();
          },
        },
      ]
    );
  };

  const handleSample = () => {
    triggerHaptic('medium');
    onLoadSample();
  };

  return (
    <View style={styles.container}>
      {/* Top Brand & Actions Bar */}
      <View style={styles.topRow}>
        <View>
          <View style={styles.brandRow}>
            <View style={styles.brandIconBox}>
              <Text style={styles.brandIcon}>⚡</Text>
            </View>
            <Text style={styles.brandText}>INSPECT </Text>
            <Text style={styles.brandAccent}>AUTOCAR</Text>
          </View>
          <Text style={styles.subtitle}>PDI & Comprehensive Vehicle Condition Report</Text>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.pillBtn} onPress={handleSample} activeOpacity={0.7}>
            <Text style={styles.pillBtnText}>Sample</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.pillBtn, styles.resetBtn]} onPress={confirmReset} activeOpacity={0.7}>
            <Text style={[styles.pillBtnText, styles.resetBtnText]}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Dynamic Health Score & Rating Dial */}
      <HealthScoreDial score={calculatedScore} stats={stats} />

      {/* Categories Progress Bar */}
      <View style={styles.categoryProgressRow}>
        <Text style={styles.categoryProgressText}>
          Inspection Progress: {completedSections} of {totalSections} Categories Reviewed
        </Text>
        <Text style={styles.photoCountBadge}>
          📸 {stats.photos}/{stats.totalPhotos} Photos
        </Text>
      </View>

      <View style={styles.progressBarTrack}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${Math.min(Math.round((completedSections / Math.max(totalSections, 1)) * 100), 100)}%` },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.primary,
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: Colors.background.border,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandIconBox: {
    backgroundColor: '#FF6B00',
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  brandIcon: {
    fontSize: 12,
  },
  brandText: {
    color: Colors.text.primary,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  brandAccent: {
    color: Colors.accent.primary,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: Colors.text.muted,
    fontSize: 10.5,
    fontWeight: '500',
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pillBtn: {
    backgroundColor: '#162238',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#243550',
  },
  pillBtnText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
  },
  resetBtn: {
    borderColor: '#7f1d1d',
    backgroundColor: '#450a0a',
  },
  resetBtnText: {
    color: '#f87171',
  },
  categoryProgressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  categoryProgressText: {
    fontSize: 10.5,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  photoCountBadge: {
    fontSize: 10.5,
    color: Colors.accent.secondary,
    fontWeight: '700',
  },
  progressBarTrack: {
    height: 3,
    backgroundColor: '#1b2537',
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.accent.primary,
  },
});
