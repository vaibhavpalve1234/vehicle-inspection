import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { VehicleCustomerInfo } from '../types/inspection';

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

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.header}
        activeOpacity={0.8}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>Vehicle & Customer Details</Text>
          <Text style={styles.headerSubtitle}>
            {info.vehicleModel || 'Vehicle'} • {info.registrationNumber || 'No Plate'}
          </Text>
        </View>
        <View style={styles.toggleBtn}>
          <Text style={styles.toggleText}>{isExpanded ? 'Hide ▲' : 'Edit ▼'}</Text>
        </View>
      </TouchableOpacity>

      {isExpanded ? (
        <View style={styles.body}>
          <View style={styles.row}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Customer Name</Text>
              <TextInput
                style={styles.input}
                value={info.customerName}
                placeholder="e.g. Manoj Kalokhe"
                placeholderTextColor="#94a3b8"
                onChangeText={(val) => updateField('customerName', val)}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mobile Number</Text>
              <TextInput
                style={styles.input}
                value={info.mobile}
                keyboardType="phone-pad"
                placeholder="+91 98765 43210"
                placeholderTextColor="#94a3b8"
                onChangeText={(val) => updateField('mobile', val)}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Vehicle Model</Text>
              <TextInput
                style={styles.input}
                value={info.vehicleModel}
                placeholder="e.g. Tata Tigor"
                placeholderTextColor="#94a3b8"
                onChangeText={(val) => updateField('vehicleModel', val)}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Registration No.</Text>
              <TextInput
                style={styles.input}
                value={info.registrationNumber}
                autoCapitalize="characters"
                placeholder="MH01DE3629"
                placeholderTextColor="#94a3b8"
                onChangeText={(val) => updateField('registrationNumber', val)}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>VIN / Chassis No.</Text>
              <TextInput
                style={styles.input}
                value={info.vin}
                placeholder="17 Digit VIN"
                placeholderTextColor="#94a3b8"
                onChangeText={(val) => updateField('vin', val)}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Odometer (km)</Text>
              <TextInput
                style={styles.input}
                value={info.odometer}
                keyboardType="numeric"
                placeholder="e.g. 18411"
                placeholderTextColor="#94a3b8"
                onChangeText={(val) => updateField('odometer', val)}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Inspection Type & Date</Text>
              <TextInput
                style={styles.input}
                value={info.inspectionDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#94a3b8"
                onChangeText={(val) => updateField('inspectionDate', val)}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Inspector Name</Text>
              <TextInput
                style={styles.input}
                value={info.inspectorName}
                placeholder="Navin Salve"
                placeholderTextColor="#94a3b8"
                onChangeText={(val) => updateField('inspectorName', val)}
              />
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.compactSummary}>
          <Text style={styles.summaryText}>
            Customer: <Text style={styles.bold}>{info.customerName || '—'}</Text> • ODO:{' '}
            <Text style={styles.bold}>{info.odometer ? `${info.odometer} km` : '—'}</Text> • Inspector:{' '}
            <Text style={styles.bold}>{info.inspectorName || '—'}</Text>
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitleBox: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  toggleBtn: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  toggleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  body: {
    padding: 14,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  inputGroup: {
    flex: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 13,
    color: '#0f172a',
  },
  compactSummary: {
    padding: 10,
    backgroundColor: '#ffffff',
  },
  summaryText: {
    fontSize: 12,
    color: '#64748b',
  },
  bold: {
    fontWeight: '700',
    color: '#1e293b',
  },
});
