import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { InspectionData } from '../types/inspection';
import { PdfGeneratorService } from '../services/pdfGenerator';
import { SharingService } from '../services/sharingService';

interface PdfExportModalProps {
  visible: boolean;
  onClose: () => void;
  data: InspectionData;
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  visible,
  onClose,
  data,
}) => {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedPdfUri, setGeneratedPdfUri] = useState<string | null>(null);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      const uri = await PdfGeneratorService.generateReportPdf(data);
      setGeneratedPdfUri(uri);
    } catch (err: any) {
      Alert.alert('PDF Generation Failed', err?.message || 'Could not compile report PDF.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedPdfUri) return;
    await SharingService.downloadPdf(generatedPdfUri);
  };

  const handleShareWhatsApp = async () => {
    if (!generatedPdfUri) return;
    await SharingService.shareOnWhatsApp(generatedPdfUri, {
      vehicleModel: data.info.vehicleModel,
      reg: data.info.registrationNumber,
    });
  };

  const handleShareInstagram = async () => {
    if (!generatedPdfUri) return;
    await SharingService.shareOnInstagram(generatedPdfUri);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Generate Inspection PDF</Text>
              <Text style={styles.subtitle}>
                Tables first, followed by high-resolution photos & remarks
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Report Summary Card */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>
              {data.info.vehicleModel || 'Vehicle'} • {data.info.registrationNumber || 'No Plate'}
            </Text>
            <Text style={styles.summarySubtitle}>
              Customer: {data.info.customerName || '—'} | Inspector: {data.info.inspectorName || '—'}
            </Text>
            <View style={styles.statsRow}>
              <Text style={styles.statPill}>
                📋 {data.sections.reduce((acc, s) => acc + s.items.length, 0)} Checkpoints
              </Text>
              <Text style={styles.statPill}>
                📸 {data.standardPhotos.filter((p) => p.uri).length + data.extraPhotos.length} Photos Attached
              </Text>
            </View>
          </View>

          {!generatedPdfUri ? (
            <View style={styles.generateBox}>
              <Text style={styles.generateHint}>
                Ready to merge inspection tables and all uploaded vehicle pictures into the official "Inspect AutoCar" PDF.
              </Text>

              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <View style={styles.loadingRow}>
                    <ActivityIndicator color="#ffffff" size="small" />
                    <Text style={styles.primaryBtnText}>Merging Checkpoints & Photos...</Text>
                  </View>
                ) : (
                  <Text style={styles.primaryBtnText}>⚡ Generate & Merge PDF Now</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.actionsContainer}>
              <View style={styles.successBadge}>
                <Text style={styles.successBadgeText}>✓ PDF Ready & Merged Successfully</Text>
              </View>

              <TouchableOpacity
                style={[styles.actionBtn, styles.downloadBtn]}
                onPress={handleDownload}
              >
                <Text style={styles.downloadBtnText}>📥 Download / Save PDF</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.whatsappBtn]}
                onPress={handleShareWhatsApp}
              >
                <Text style={styles.whatsappBtnText}>💬 Share on WhatsApp</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.instagramBtn]}
                onPress={handleShareInstagram}
              >
                <Text style={styles.instagramBtnText}>📸 Share on Instagram / Apps</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.regenerateBtn}
                onPress={handleGenerate}
                disabled={isGenerating}
              >
                <Text style={styles.regenerateBtnText}>↻ Re-generate with latest edits</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  summaryCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  summarySubtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statPill: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  generateBox: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  generateHint: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 18,
    lineHeight: 18,
  },
  primaryBtn: {
    backgroundColor: '#ea580c',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  actionsContainer: {
    gap: 10,
  },
  successBadge: {
    backgroundColor: '#dcfce7',
    borderColor: '#86efac',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    marginBottom: 6,
  },
  successBadgeText: {
    color: '#15803d',
    fontSize: 12,
    fontWeight: '700',
  },
  actionBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadBtn: {
    backgroundColor: '#0f172a',
  },
  downloadBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  whatsappBtn: {
    backgroundColor: '#25D366',
  },
  whatsappBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  instagramBtn: {
    backgroundColor: '#E1306C',
  },
  instagramBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  regenerateBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  regenerateBtnText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
  },
});
