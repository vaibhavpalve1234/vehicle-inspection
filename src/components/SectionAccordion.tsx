import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { InspectionSection, CheckpointStatus } from '../types/inspection';
import { CheckpointRow } from './CheckpointRow';
import { Colors } from '../theme/colors';
import { triggerHaptic } from '../utils/haptics';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface SectionAccordionProps {
  section: InspectionSection;
  onUpdateSection: (updated: InspectionSection) => void;
  defaultOpen?: boolean;
}

export const SectionAccordion: React.FC<SectionAccordionProps> = ({
  section,
  onUpdateSection,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);

  const stats = section.items.reduce(
    (acc, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const totalItems = section.items.length;
  const okItems = stats['OK'] || 0;
  const attentionCount = stats['Attention'] || 0;
  const failedCount = stats['Failed'] || 0;
  const percentComplete = Math.round(
    ((okItems + attentionCount + failedCount + (stats['NA'] || 0)) / totalItems) * 100
  );

  const toggleOpen = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    triggerHaptic('light');
    setIsOpen(!isOpen);
  };

  const handleUpdateItemStatus = (itemId: string, newStatus: CheckpointStatus) => {
    const updatedItems = section.items.map((item) =>
      item.id === itemId ? { ...item, status: newStatus } : item
    );
    onUpdateSection({ ...section, items: updatedItems });
  };

  const handleUpdateItemObs = (itemId: string, newObs: string) => {
    const updatedItems = section.items.map((item) =>
      item.id === itemId ? { ...item, observation: newObs } : item
    );
    onUpdateSection({ ...section, items: updatedItems });
  };

  const handleMarkAllOk = () => {
    triggerHaptic('medium');
    const updatedItems = section.items.map((item) => ({
      ...item,
      status: 'OK' as CheckpointStatus,
    }));
    onUpdateSection({ ...section, items: updatedItems });
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={[styles.header, isOpen && styles.headerOpen]}
        activeOpacity={0.8}
        onPress={toggleOpen}
      >
        <View style={styles.titleArea}>
          <View style={styles.titleRow}>
            <Text style={styles.sectionNumBadge}>#{section.sectionNumber}</Text>
            <Text style={styles.titleText}>{section.title}</Text>
          </View>

          <View style={styles.statsBadgesRow}>
            {failedCount > 0 && (
              <View style={[styles.miniBadge, styles.badgeFailed]}>
                <Text style={styles.badgeFailedText}>✕ {failedCount} Failed</Text>
              </View>
            )}
            {attentionCount > 0 && (
              <View style={[styles.miniBadge, styles.badgeAttn]}>
                <Text style={styles.badgeAttnText}>⚠️ {attentionCount} Attn</Text>
              </View>
            )}
            {failedCount === 0 && attentionCount === 0 && okItems === totalItems && (
              <View style={[styles.miniBadge, styles.badgeAllOk]}>
                <Text style={styles.badgeAllOkText}>✓ All Pass</Text>
              </View>
            )}
            <Text style={styles.itemCountText}>
              {okItems}/{totalItems} Checked
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <View style={styles.chevronCircle}>
            <Text style={styles.arrowText}>{isOpen ? '▲' : '▼'}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Progress Line */}
      <View style={styles.progressBarTrack}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${Math.min(percentComplete, 100)}%` },
            failedCount > 0
              ? { backgroundColor: Colors.status.failed.text }
              : attentionCount > 0
              ? { backgroundColor: Colors.status.attention.text }
              : { backgroundColor: Colors.accent.primary },
          ]}
        />
      </View>

      {isOpen && (
        <View style={styles.body}>
          {/* Quick Action Toolbar */}
          <View style={styles.actionsBar}>
            <Text style={styles.categorySummary}>
              Reviewing {totalItems} checkpoint items
            </Text>
            <TouchableOpacity
              style={styles.quickActionBtn}
              activeOpacity={0.7}
              onPress={handleMarkAllOk}
            >
              <Text style={styles.quickActionText}>✓ Mark All OK</Text>
            </TouchableOpacity>
          </View>

          {/* List of items */}
          {section.items.map((item) => (
            <CheckpointRow
              key={item.id}
              item={item}
              onChangeStatus={(status) => handleUpdateItemStatus(item.id, status)}
              onChangeObservation={(obs) => handleUpdateItemObs(item.id, obs)}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background.surface,
    borderRadius: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: Colors.background.border,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: Colors.background.surface,
  },
  headerOpen: {
    backgroundColor: '#1b263b',
  },
  titleArea: {
    flex: 1,
    paddingRight: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionNumBadge: {
    backgroundColor: '#1e293b',
    color: Colors.accent.secondary,
    fontSize: 11,
    fontWeight: '800',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },
  titleText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: Colors.text.primary,
    letterSpacing: -0.2,
    flex: 1,
  },
  statsBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  miniBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
  },
  badgeAttn: {
    backgroundColor: Colors.status.attention.bg,
    borderColor: Colors.status.attention.border,
  },
  badgeAttnText: {
    color: Colors.status.attention.text,
    fontSize: 10,
    fontWeight: '700',
  },
  badgeFailed: {
    backgroundColor: Colors.status.failed.bg,
    borderColor: Colors.status.failed.border,
  },
  badgeFailedText: {
    color: Colors.status.failed.text,
    fontSize: 10,
    fontWeight: '700',
  },
  badgeAllOk: {
    backgroundColor: Colors.status.ok.bg,
    borderColor: Colors.status.ok.border,
  },
  badgeAllOkText: {
    color: Colors.status.ok.text,
    fontSize: 10,
    fontWeight: '700',
  },
  itemCountText: {
    fontSize: 11,
    color: Colors.text.muted,
    fontWeight: '500',
  },
  headerRight: {
    marginLeft: 8,
  },
  chevronCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#202d42',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: 11,
    color: Colors.text.secondary,
    fontWeight: '700',
  },
  progressBarTrack: {
    height: 2.5,
    backgroundColor: '#1b2537',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
  },
  body: {
    backgroundColor: '#0f172a',
  },
  actionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#131e30',
    borderBottomWidth: 1,
    borderBottomColor: Colors.background.border,
  },
  categorySummary: {
    fontSize: 11,
    color: Colors.text.muted,
  },
  quickActionBtn: {
    backgroundColor: '#064e3b',
    borderWidth: 1,
    borderColor: '#059669',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  quickActionText: {
    color: '#34d399',
    fontSize: 11,
    fontWeight: '700',
  },
});
