import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { InspectionSection, CheckpointStatus } from '../types/inspection';
import { CheckpointRow } from './CheckpointRow';

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
    const updatedItems = section.items.map((item) => ({
      ...item,
      status: 'OK' as CheckpointStatus,
    }));
    onUpdateSection({ ...section, items: updatedItems });
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.header}
        activeOpacity={0.8}
        onPress={() => setIsOpen(!isOpen)}
      >
        <View style={styles.titleArea}>
          <Text style={styles.titleText}>{section.title}</Text>
          <View style={styles.statsBadgesRow}>
            {stats['Attention'] ? (
              <View style={[styles.miniBadge, styles.badgeAttn]}>
                <Text style={styles.badgeAttnText}>{stats['Attention']} Attention</Text>
              </View>
            ) : null}
            {stats['Failed'] ? (
              <View style={[styles.miniBadge, styles.badgeFailed]}>
                <Text style={styles.badgeFailedText}>{stats['Failed']} Failed</Text>
              </View>
            ) : null}
            <Text style={styles.itemCountText}>{section.items.length} items</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <Text style={styles.arrowText}>{isOpen ? '▲' : '▼'}</Text>
        </View>
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.body}>
          <View style={styles.actionsBar}>
            <TouchableOpacity style={styles.quickActionBtn} onPress={handleMarkAllOk}>
              <Text style={styles.quickActionText}>✓ Mark Section as All OK</Text>
            </TouchableOpacity>
          </View>

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
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#0f172a',
  },
  titleArea: {
    flex: 1,
  },
  titleText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#ffffff',
  },
  statsBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  miniBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  badgeAttn: {
    backgroundColor: 'rgba(245, 158, 11, 0.25)',
  },
  badgeAttnText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#fbbf24',
  },
  badgeFailed: {
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
  },
  badgeFailedText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#f87171',
  },
  itemCountText: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '500',
  },
  headerRight: {
    marginLeft: 10,
  },
  arrowText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  body: {
    backgroundColor: '#ffffff',
  },
  actionsBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  quickActionBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
  },
  quickActionText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#334155',
  },
});
