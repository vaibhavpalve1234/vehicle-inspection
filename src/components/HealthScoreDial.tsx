import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

interface HealthScoreDialProps {
  score: number;
  stats: {
    ok: number;
    attention: number;
    failed: number;
    photos: number;
    totalPhotos: number;
  };
}

export const HealthScoreDial: React.FC<HealthScoreDialProps> = ({ score, stats }) => {
  // Determine Grade and Theme colors based on score
  let grade = 'A+';
  let gradeDesc = 'EXCELLENT';
  let accentColor = Colors.status.ok.text;
  let bgGlow = Colors.status.ok.glow;
  let borderColor = Colors.status.ok.border;

  if (score < 60) {
    grade = 'D';
    gradeDesc = 'CRITICAL DEFECTS';
    accentColor = Colors.status.failed.text;
    bgGlow = Colors.status.failed.glow;
    borderColor = Colors.status.failed.border;
  } else if (score < 75) {
    grade = 'C';
    gradeDesc = 'FAIR / NEEDS WORK';
    accentColor = Colors.status.attention.text;
    bgGlow = Colors.status.attention.glow;
    borderColor = Colors.status.attention.border;
  } else if (score < 90) {
    grade = 'B';
    gradeDesc = 'GOOD / MINOR WEAR';
    accentColor = Colors.accent.secondary;
    bgGlow = 'rgba(56, 189, 248, 0.2)';
    borderColor = '#0284c7';
  }

  return (
    <View style={[styles.container, { borderColor }]}>
      {/* Left side: Circular Condition Badge */}
      <View style={[styles.dialCircle, { borderColor: accentColor, backgroundColor: bgGlow }]}>
        <Text style={[styles.scoreValue, { color: accentColor }]}>{score}</Text>
        <Text style={styles.scoreMax}>/100</Text>
      </View>

      {/* Middle side: Condition Rating & Breakdown */}
      <View style={styles.detailsArea}>
        <View style={styles.gradeBadgeRow}>
          <View style={[styles.gradeTag, { backgroundColor: borderColor }]}>
            <Text style={styles.gradeTagText}>GRADE {grade}</Text>
          </View>
          <Text style={[styles.gradeDesc, { color: accentColor }]}>{gradeDesc}</Text>
        </View>

        {/* Live metric mini-chips */}
        <View style={styles.miniStatsRow}>
          <View style={[styles.metricChip, { borderColor: Colors.status.ok.border }]}>
            <Text style={[styles.metricDot, { color: Colors.status.ok.text }]}>●</Text>
            <Text style={styles.metricText}>{stats.ok} Pass</Text>
          </View>
          <View style={[styles.metricChip, { borderColor: Colors.status.attention.border }]}>
            <Text style={[styles.metricDot, { color: Colors.status.attention.text }]}>●</Text>
            <Text style={styles.metricText}>{stats.attention} Attn</Text>
          </View>
          <View style={[styles.metricChip, { borderColor: Colors.status.failed.border }]}>
            <Text style={[styles.metricDot, { color: Colors.status.failed.text }]}>●</Text>
            <Text style={styles.metricText}>{stats.failed} Fail</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#111a2c',
    borderRadius: 14,
    borderWidth: 1.2,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
  },
  dialCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreValue: {
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 24,
  },
  scoreMax: {
    fontSize: 9,
    color: '#94a3b8',
    fontWeight: '700',
  },
  detailsArea: {
    flex: 1,
  },
  gradeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  gradeTag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  gradeTagText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  gradeDesc: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  miniStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metricChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a101d',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 4,
  },
  metricDot: {
    fontSize: 8,
  },
  metricText: {
    color: '#cbd5e1',
    fontSize: 10,
    fontWeight: '600',
  },
});
