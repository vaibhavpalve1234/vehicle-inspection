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
import { Colors } from '../theme/colors';
import { triggerHaptic } from '../utils/haptics';

interface PdfExportModalProps {
  visible: boolean;
  onClose: () => void;
  data: InspectionData;
  onReportGenerated?: () => void;
}

interface ReportSnapshot {
  vehicleModel: string;
  reg: string;
  customerName: string;
  inspectorName: string;
  score: number;
  okCount: number;
  attnCount: number;
  failCount: number;
  photosCount: number;
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  visible,
  onClose,
  data,
  onReportGenerated,
}) => {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedPdfUri, setGeneratedPdfUri] = useState<string | null>(null);
  const [reportSnapshot, setReportSnapshot] = useState<ReportSnapshot | null>(null);

  // Calculate live stats for preview summary
  let okCount = 0;
  let attnCount = 0;
  let failCount = 0;
  data.sections.forEach((s) => {
    s.items.forEach((item) => {
      if (item.status === 'OK') okCount++;
      else if (item.status === 'Attention') attnCount++;
      else if (item.status === 'Failed') failCount++;
    });
  });

  const calculatedScore = Math.max(
    10,
    Math.round(100 - failCount * 3.5 - attnCount * 1.2)
  );

  const displayModel = reportSnapshot ? reportSnapshot.vehicleModel : (data.info.vehicleModel || 'Vehicle');
  const displayReg = reportSnapshot ? reportSnapshot.reg : (data.info.registrationNumber || 'No Plate Entered');
  const displayCustomer = reportSnapshot ? reportSnapshot.customerName : (data.info.customerName || 'Client Name');
  const displayInspector = reportSnapshot ? reportSnapshot.inspectorName : (data.info.inspectorName || 'Inspector');
  const displayScore = reportSnapshot ? reportSnapshot.score : calculatedScore;
  const displayOk = reportSnapshot ? reportSnapshot.okCount : okCount;
  const displayAttn = reportSnapshot ? reportSnapshot.attnCount : attnCount;
  const displayFail = reportSnapshot ? reportSnapshot.failCount : failCount;
  const displayPhotos = reportSnapshot
    ? reportSnapshot.photosCount
    : (data.standardPhotos.filter((p) => p.uri).length + data.extraPhotos.length);

  const handleGenerate = async () => {
    try {
      triggerHaptic('medium');
      setIsGenerating(true);

      // Snapshot current report before reset so the modal preview remains accurate
      const snapshot: ReportSnapshot = {
        vehicleModel: data.info.vehicleModel || 'Vehicle',
        reg: data.info.registrationNumber || 'No Plate Entered',
        customerName: data.info.customerName || 'Client Name',
        inspectorName: data.info.inspectorName || 'Inspector',
        score: calculatedScore,
        okCount,
        attnCount,
        failCount,
        photosCount: data.standardPhotos.filter((p) => p.uri).length + data.extraPhotos.length,
      };
      setReportSnapshot(snapshot);

      const uri = await PdfGeneratorService.generateReportPdf(data);
      setGeneratedPdfUri(uri);
      triggerHaptic('light');

      // Reset complete application and clear previous data for new report
      if (onReportGenerated) {
        onReportGenerated();
      }
    } catch (err: any) {
      triggerHaptic('error');
      Alert.alert('PDF Generation Failed', err?.message || 'Could not compile report PDF.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    setGeneratedPdfUri(null);
    setReportSnapshot(null);
    onClose();
  };

  const handleDownload = async () => {
    if (!generatedPdfUri) return;
    triggerHaptic('light');
    await SharingService.downloadPdf(generatedPdfUri);
  };

  const handleShareWhatsApp = async () => {
    if (!generatedPdfUri) return;
    triggerHaptic('light');
    await SharingService.shareOnWhatsApp(generatedPdfUri, {
      vehicleModel: displayModel,
      reg: displayReg,
    });
  };

  const handleShareGeneral = async () => {
    if (!generatedPdfUri) return;
    triggerHaptic('light');
    await SharingService.shareOnInstagram(generatedPdfUri);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Export Vehicle Report PDF</Text>
              <Text style={styles.subtitle}>
                Official "Inspect AutoCar" Format • High-Res Photos Included
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Report Summary Card with Health Score */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryTop}>
              <View style={styles.summaryVehicleBox}>
                <Text style={styles.summaryTitle} numberOfLines={1}>
                  {displayModel}
                </Text>
                <Text style={styles.summaryPlate}>
                  {displayReg}
                </Text>
              </View>

              <View style={styles.scoreBadge}>
                <Text style={styles.scoreNumber}>{displayScore}</Text>
                <Text style={styles.scoreLabel}>SCORE</Text>
              </View>
            </View>

            <View style={styles.metaRow}>
              <Text style={styles.metaItem}>
                👤 {displayCustomer}
              </Text>
              <Text style={styles.metaItem}>
                🔧 {displayInspector}
              </Text>
            </View>

            <View style={styles.statsRow}>
              <Text style={[styles.statPill, styles.statOk]}>
                ✓ {displayOk} Pass
              </Text>
              <Text style={[styles.statPill, styles.statAttn]}>
                ⚠️ {displayAttn} Attn
              </Text>
              <Text style={[styles.statPill, styles.statFail]}>
                ✕ {displayFail} Fail
              </Text>
              <Text style={styles.statPhotos}>
                📸 {displayPhotos} Photos
              </Text>
            </View>
          </View>

          {!generatedPdfUri ? (
            <View style={styles.generateBox}>
              <Text style={styles.generateHint}>
                Compiles all 36 inspection tables, condition ratings, observation notes, and high-resolution vehicle photos into a single PDF document.
              </Text>

              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleGenerate}
                disabled={isGenerating}
                activeOpacity={0.8}
              >
                {isGenerating ? (
                  <View style={styles.loadingRow}>
                    <ActivityIndicator color="#ffffff" size="small" />
                    <Text style={styles.primaryBtnText}>Merging Checkpoints & Photos...</Text>
                  </View>
                ) : (
                  <Text style={styles.primaryBtnText}>⚡ Generate Official Report PDF</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.actionsContainer}>
              <View style={styles.successBadge}>
                <Text style={styles.successBadgeEmoji}>🎉</Text>
                <View style={styles.successBadgeTextBox}>
                  <Text style={styles.successBadgeText}>Report PDF Generated Successfully!</Text>
                  <Text style={styles.successBadgeSubtext}>
                    All previous data cleared & app reset for a new report.
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.actionBtn, styles.whatsappBtn]}
                onPress={handleShareWhatsApp}
                activeOpacity={0.8}
              >
                <Text style={styles.whatsappBtnText}>💬 Instant Share on WhatsApp</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.downloadBtn]}
                onPress={handleDownload}
                activeOpacity={0.8}
              >
                <Text style={styles.downloadBtnText}>📥 Download / Save PDF Document</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.shareBtn]}
                onPress={handleShareGeneral}
                activeOpacity={0.8}
              >
                <Text style={styles.shareBtnText}>📤 AirDrop / Email / Other Apps</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.newReportBtn}
                onPress={handleClose}
                activeOpacity={0.8}
              >
                <Text style={styles.newReportBtnText}>✨ Start New Inspection (App Ready)</Text>
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
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 20,
    paddingBottom: 38,
    borderWidth: 1.2,
    borderColor: '#243552',
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
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 11,
    color: Colors.text.muted,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '700',
  },
  summaryCard: {
    backgroundColor: '#162238',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.2,
    borderColor: '#243552',
    marginBottom: 16,
  },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryVehicleBox: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  summaryPlate: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.accent.primary,
    marginTop: 2,
  },
  scoreBadge: {
    backgroundColor: '#0c1322',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.status.ok.border,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.status.ok.text,
  },
  scoreLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#94a3b8',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#243552',
    paddingVertical: 8,
  },
  metaItem: {
    fontSize: 11.5,
    color: '#cbd5e1',
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statPill: {
    fontSize: 10.5,
    fontWeight: '700',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  statOk: {
    backgroundColor: Colors.status.ok.bg,
    borderColor: Colors.status.ok.border,
    color: Colors.status.ok.text,
  },
  statAttn: {
    backgroundColor: Colors.status.attention.bg,
    borderColor: Colors.status.attention.border,
    color: Colors.status.attention.text,
  },
  statFail: {
    backgroundColor: Colors.status.failed.bg,
    borderColor: Colors.status.failed.border,
    color: Colors.status.failed.text,
  },
  statPhotos: {
    fontSize: 11,
    color: Colors.accent.secondary,
    fontWeight: '700',
    marginLeft: 'auto',
  },
  generateBox: {
    gap: 12,
  },
  generateHint: {
    fontSize: 11.5,
    color: '#94a3b8',
    lineHeight: 16,
    textAlign: 'center',
  },
  primaryBtn: {
    backgroundColor: '#ea580c',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionsContainer: {
    gap: 10,
  },
  successBadge: {
    backgroundColor: '#064e3b',
    borderColor: '#059669',
    borderWidth: 1.2,
    padding: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  successBadgeEmoji: {
    fontSize: 22,
  },
  successBadgeTextBox: {
    flex: 1,
  },
  successBadgeText: {
    color: '#34d399',
    fontSize: 13,
    fontWeight: '800',
  },
  successBadgeSubtext: {
    color: '#a7f3d0',
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  actionBtn: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  whatsappBtn: {
    backgroundColor: '#15803d',
    borderColor: '#22c55e',
  },
  whatsappBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  downloadBtn: {
    backgroundColor: '#1e293b',
    borderColor: '#38bdf8',
  },
  downloadBtnText: {
    color: '#38bdf8',
    fontSize: 13,
    fontWeight: '700',
  },
  shareBtn: {
    backgroundColor: '#1b263b',
    borderColor: '#334155',
  },
  shareBtnText: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '600',
  },
  newReportBtn: {
    backgroundColor: '#0284c7',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#38bdf8',
  },
  newReportBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
