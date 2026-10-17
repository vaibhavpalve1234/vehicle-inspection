import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, LayoutAnimation } from 'react-native';
import { VehicleCustomerInfo } from '../types/inspection';
import { Colors } from '../theme/colors';
import { triggerHaptic } from '../utils/haptics';

interface VehicleInfoCardProps {
  info: VehicleCustomerInfo;
  onChangeInfo: (updated: VehicleCustomerInfo) => void;
}

export const VehicleInfoCard: React.FC<VehicleInfoCardProps> = ({ info, onChangeInfo }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const updateField = (field: keyof VehicleCustomerInfo, value: string) => {
    onChangeInfo({
      ...info,
      [field]: value,
    });
  };

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    triggerHaptic('light');
    setIsExpanded(!isExpanded);
  };

  const inspectionTypes = ['PDI', 'Used Car PPI', 'Insurance', 'Valuation'];

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.header}
        activeOpacity={0.8}
        onPress={toggleExpand}
      >
        <View style={styles.headerLeft}>
          <View style={styles.carIconBox}>
            <Text style={styles.carIcon}>🚘</Text>
          </View>
          <View style={styles.headerTitleBox}>
            <Text style={styles.headerTitle}>Vehicle & Customer Profile</Text>
            <Text style={styles.headerSubtitle}>
              {info.vehicleModel || 'Vehicle Model'} • {info.registrationNumber || 'No Plate'}
            </Text>
          </View>
        </View>
        <View style={styles.toggleBtn}>
          <Text style={styles.toggleText}>{isExpanded ? 'Hide ▲' : 'Edit ▼'}</Text>
        </View>
      </TouchableOpacity>

      {isExpanded ? (
        <View style={styles.body}>
          {/* Quick Inspection Type Selector */}
          <Text style={styles.fieldSectionLabel}>INSPECTION TYPE</Text>
          <View style={styles.typeSelectorRow}>
            {inspectionTypes.map((t) => {
              const active = info.inspectionType === t;
              return (
                <TouchableOpacity
                  key={t}
                  activeOpacity={0.7}
                  onPress={() => {
                    triggerHaptic('light');
                    updateField('inspectionType', t);
                  }}
                  style={[styles.typeChip, active && styles.typeChipActive]}
                >
                  <Text style={[styles.typeChipText, active && styles.typeChipTextActive]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Customer & Mobile */}
          <View style={styles.row}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Customer / Client Name</Text>
              <TextInput
                style={styles.input}
                value={info.customerName}
                placeholder="e.g. Manoj Kalokhe"
                placeholderTextColor="#64748b"
                onChangeText={(val) => updateField('customerName', val)}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contact Mobile</Text>
              <TextInput
                style={styles.input}
                value={info.mobile}
                keyboardType="phone-pad"
                placeholder="+91 98765 43210"
                placeholderTextColor="#64748b"
                onChangeText={(val) => updateField('mobile', val)}
              />
            </View>
          </View>

          {/* Model & Reg */}
          <View style={styles.row}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Vehicle Model & Trim</Text>
              <TextInput
                style={styles.input}
                value={info.vehicleModel}
                placeholder="e.g. Tata Tigor XZ+"
                placeholderTextColor="#64748b"
                onChangeText={(val) => updateField('vehicleModel', val)}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Registration Number</Text>
              <TextInput
                style={[styles.input, styles.plateInput]}
                value={info.registrationNumber}
                autoCapitalize="characters"
                placeholder="MH 01 DE 3629"
                placeholderTextColor="#64748b"
                onChangeText={(val) => updateField('registrationNumber', val)}
              />
            </View>
          </View>

          {/* VIN & Odometer */}
          <View style={styles.row}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>VIN / Chassis Number</Text>
              <TextInput
                style={styles.input}
                value={info.vin}
                autoCapitalize="characters"
                placeholder="17 Digit Chassis No."
                placeholderTextColor="#64748b"
                onChangeText={(val) => updateField('vin', val)}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Odometer Reading (km)</Text>
              <TextInput
                style={styles.input}
                value={info.odometer}
                keyboardType="numeric"
                placeholder="e.g. 48,250"
                placeholderTextColor="#64748b"
                onChangeText={(val) => updateField('odometer', val)}
              />
            </View>
          </View>

          {/* Inspector name & Date */}
          <View style={styles.row}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Inspector Name</Text>
              <TextInput
                style={styles.input}
                value={info.inspectorName}
                placeholder="e.g. Certified Auto Engineer"
                placeholderTextColor="#64748b"
                onChangeText={(val) => updateField('inspectorName', val)}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Inspection Date</Text>
              <TextInput
                style={styles.input}
                value={info.inspectionDate}
                placeholder="DD/MM/YYYY"
                placeholderTextColor="#64748b"
                onChangeText={(val) => updateField('inspectionDate', val)}
              />
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background.surface,
    borderRadius: 14,
    marginHorizontal: 16,
    marginVertical: 10,
    borderWidth: 1.2,
    borderColor: Colors.background.border,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#1b263b',
    borderBottomWidth: 1,
    borderBottomColor: Colors.background.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  carIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#0c1322',
    borderWidth: 1,
    borderColor: '#23344d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  carIcon: {
    fontSize: 16,
  },
  headerTitleBox: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: Colors.text.primary,
  },
  headerSubtitle: {
    fontSize: 11,
    color: Colors.accent.secondary,
    fontWeight: '600',
    marginTop: 1,
  },
  toggleBtn: {
    backgroundColor: '#202e46',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  toggleText: {
    color: '#94a3b8',
    fontSize: 10.5,
    fontWeight: '700',
  },
  body: {
    padding: 14,
    backgroundColor: '#0f172a',
  },
  fieldSectionLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  typeChip: {
    flex: 1,
    backgroundColor: '#162238',
    borderWidth: 1,
    borderColor: '#243550',
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  typeChipActive: {
    backgroundColor: '#9a3412',
    borderColor: Colors.accent.primary,
  },
  typeChipText: {
    fontSize: 10.5,
    color: '#94a3b8',
    fontWeight: '700',
  },
  typeChipTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  inputGroup: {
    flex: 1,
  },
  label: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#141e32',
    borderWidth: 1,
    borderColor: '#243552',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 12,
    color: Colors.text.primary,
  },
  plateInput: {
    fontWeight: '700',
    color: Colors.accent.primary,
  },
});
