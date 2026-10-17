import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { InspectionData, InspectionSection, PhotoSlot, ExtraPhoto, VehicleCustomerInfo } from './src/types/inspection';
import { StorageService } from './src/services/storageService';
import { Header } from './src/components/Header';
import { VehicleInfoCard } from './src/components/VehicleInfoCard';
import { SectionAccordion } from './src/components/SectionAccordion';
import { PhotoSlotCard } from './src/components/PhotoSlotCard';
import { ExtraPhotosSection } from './src/components/ExtraPhotosSection';
import { RemarksCard } from './src/components/RemarksCard';
import { PdfExportModal } from './src/components/PdfExportModal';
import { Colors } from './src/theme/colors';
import { triggerHaptic } from './src/utils/haptics';

type ActiveTab = 'checkpoints' | 'photos' | 'remarks';

export default function App() {
  const [data, setData] = useState<InspectionData | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('checkpoints');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const scrollRef = useRef<ScrollView>(null);

  // Load saved inspection from local storage on app launch
  useEffect(() => {
    (async () => {
      try {
        const loaded = await StorageService.loadInspection();
        setData(loaded);
      } catch (e) {
        console.error('Error loading data:', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Auto-save changes locally to AsyncStorage
  const updateData = (newData: InspectionData) => {
    setData(newData);
    StorageService.saveInspection(newData);
  };

  // Reset to empty inspection
  const handleReset = async () => {
    const initial = StorageService.createInitialInspection();
    updateData(initial);
    setSearchQuery('');
    setActiveTab('checkpoints');
    scrollRef.current?.scrollTo({ y: 0, animated: true });
    Alert.alert('Inspection Reset', 'The application has been reset and is ready for a new inspection.');
  };

  // Load sample data matching the reference report
  const handleLoadSample = async () => {
    const sample = StorageService.createSampleInspection();
    updateData(sample);
    setSearchQuery('');
    setActiveTab('checkpoints');
    scrollRef.current?.scrollTo({ y: 0, animated: true });
    Alert.alert('Sample Loaded', 'Loaded inspection data matching the Tigor reference report.');
  };

  // Automatically reset the complete application after PDF is generated
  const handleResetAfterPdfGeneration = async () => {
    const initial = StorageService.createInitialInspection();
    updateData(initial);
    setSearchQuery('');
    setActiveTab('checkpoints');
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  // Update vehicle info
  const handleUpdateInfo = (info: VehicleCustomerInfo) => {
    if (!data) return;
    updateData({ ...data, info });
  };

  // Update a single section
  const handleUpdateSection = (updatedSection: InspectionSection) => {
    if (!data) return;
    const updatedSections = data.sections.map((s) =>
      s.id === updatedSection.id ? updatedSection : s
    );
    updateData({ ...data, sections: updatedSections });
  };

  // Update a photo slot
  const handleUpdatePhotoSlot = (updatedSlot: PhotoSlot) => {
    if (!data) return;
    const updatedSlots = data.standardPhotos.map((p) =>
      p.id === updatedSlot.id ? updatedSlot : p
    );
    updateData({ ...data, standardPhotos: updatedSlots });
  };

  // Add extra photo
  const handleAddExtraPhoto = (newPhoto: ExtraPhoto) => {
    if (!data) return;
    updateData({ ...data, extraPhotos: [...data.extraPhotos, newPhoto] });
  };

  // Remove extra photo
  const handleRemoveExtraPhoto = (id: string) => {
    if (!data) return;
    updateData({ ...data, extraPhotos: data.extraPhotos.filter((p) => p.id !== id) });
  };

  // Update remarks
  const handleUpdateRemarks = (remarks: string) => {
    if (!data) return;
    updateData({ ...data, remarks });
  };

  const handleTabSwitch = (tab: ActiveTab) => {
    triggerHaptic('light');
    setActiveTab(tab);
  };

  if (isLoading || !data) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.accent.primary} />
        <Text style={styles.loadingTitle}>INSPECT AUTOCAR</Text>
        <Text style={styles.loadingText}>Initializing Inspection Database...</Text>
      </View>
    );
  }

  // Calculate live statistics
  const stats = {
    ok: 0,
    attention: 0,
    failed: 0,
    totalItems: 0,
    photos: data.standardPhotos.filter((p) => p.uri).length,
    totalPhotos: data.standardPhotos.length,
  };

  let completedSectionsCount = 0;

  data.sections.forEach((sec) => {
    let sectionDone = true;
    sec.items.forEach((item) => {
      stats.totalItems++;
      if (item.status === 'OK') stats.ok++;
      else if (item.status === 'Attention') stats.attention++;
      else if (item.status === 'Failed') stats.failed++;
      else sectionDone = false; // item is not yet checked
    });
    if (sectionDone && sec.items.length > 0) {
      completedSectionsCount++;
    }
  });

  const percentProgress = Math.round(
    ((stats.ok + stats.attention + stats.failed) / Math.max(stats.totalItems, 1)) * 100
  );

  // Filter sections by search query
  const filteredSections = data.sections.filter((sec) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      sec.title.toLowerCase().includes(q) ||
      sec.items.some((item) => item.name.toLowerCase().includes(q) || item.observation.toLowerCase().includes(q))
    );
  });

  // Jump to next section with issues or unreviewed checkpoints
  const handleJumpNext = () => {
    triggerHaptic('medium');
    if (activeTab !== 'checkpoints') {
      setActiveTab('checkpoints');
    }
    // Scroll down to the content area
    scrollRef.current?.scrollTo({ y: 350, animated: true });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background.primary} />

      {/* Modern Automotive Header with Live Health Score Dial */}
      <Header
        onReset={handleReset}
        onLoadSample={handleLoadSample}
        stats={stats}
        totalSections={data.sections.length}
        completedSections={completedSectionsCount}
      />

      {/* Segmented Tab Bar */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'checkpoints' && styles.tabBtnActive]}
          activeOpacity={0.8}
          onPress={() => handleTabSwitch('checkpoints')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'checkpoints' && styles.tabBtnTextActive]}>
            📋 36 Sections
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'photos' && styles.tabBtnActive]}
          activeOpacity={0.8}
          onPress={() => handleTabSwitch('photos')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'photos' && styles.tabBtnTextActive]}>
            📸 Studio ({stats.photos}/{stats.totalPhotos})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'remarks' && styles.tabBtnActive]}
          activeOpacity={0.8}
          onPress={() => handleTabSwitch('remarks')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'remarks' && styles.tabBtnTextActive]}>
            📝 Remarks
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Scrollable Content */}
      <ScrollView
        ref={scrollRef}
        style={styles.contentScroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {activeTab === 'checkpoints' && (
          <View>
            {/* Customer & Vehicle Info Card */}
            <VehicleInfoCard info={data.info} onChangeInfo={handleUpdateInfo} />

            {/* High-tech Search Bar */}
            <View style={styles.searchBarContainer}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                placeholder="Search checkpoint or part (e.g. Bumper, Brakes, AC)..."
                placeholderTextColor="#64748b"
                onChangeText={setSearchQuery}
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
                  <Text style={styles.clearSearchText}>✕</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Inspection Category Accordions */}
            <View style={styles.sectionsList}>
              {filteredSections.map((sec, idx) => (
                <SectionAccordion
                  key={sec.id}
                  section={sec}
                  defaultOpen={idx === 0}
                  onUpdateSection={handleUpdateSection}
                />
              ))}
            </View>
          </View>
        )}

        {activeTab === 'photos' && (
          <View style={styles.photosWrapper}>
            <View style={styles.photoHeaderBox}>
              <View style={styles.photoHeaderTop}>
                <Text style={styles.photoHeading}>Vehicle Camera Studio</Text>
                <View style={styles.photoProgressPill}>
                  <Text style={styles.photoProgressText}>
                    {stats.photos} of {stats.totalPhotos} Slots Captured
                  </Text>
                </View>
              </View>
              <Text style={styles.photoSubheading}>
                Capture standard angle silhouettes, evaluate paint condition, and append defect annotations.
              </Text>
            </View>

            <View style={styles.photoSlotsContainer}>
              {data.standardPhotos.map((slot) => (
                <PhotoSlotCard
                  key={slot.id}
                  slot={slot}
                  onUpdateSlot={handleUpdatePhotoSlot}
                />
              ))}
            </View>

            {/* Extra Defect & Paint Gauge Section */}
            <ExtraPhotosSection
              photos={data.extraPhotos}
              onAddPhoto={handleAddExtraPhoto}
              onRemovePhoto={handleRemoveExtraPhoto}
            />
          </View>
        )}

        {activeTab === 'remarks' && (
          <View>
            <RemarksCard remarks={data.remarks} onChangeRemarks={handleUpdateRemarks} />
          </View>
        )}

        {/* Safe spacing for bottom dock */}
        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Floating Glassmorphism Bottom Action Dock */}
      <View style={styles.floatingDock}>
        <View style={styles.dockInfoCol}>
          <View style={styles.dockProgressRow}>
            <Text style={styles.dockPercentText}>{percentProgress}% Complete</Text>
            <Text style={styles.dockDefectsText}>
              • {stats.failed + stats.attention} Issues Noted
            </Text>
          </View>
          <Text style={styles.dockVehicleText} numberOfLines={1}>
            {data.info.vehicleModel || 'Vehicle'} • {data.info.registrationNumber || 'No Plate'}
          </Text>
        </View>

        <View style={styles.dockBtnRow}>
          <TouchableOpacity
            style={styles.jumpBtn}
            activeOpacity={0.8}
            onPress={handleJumpNext}
          >
            <Text style={styles.jumpBtnText}>Next ➔</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.mergeBtn}
            activeOpacity={0.8}
            onPress={() => {
              triggerHaptic('medium');
              setShowExportModal(true);
            }}
          >
            <Text style={styles.mergeBtnText}>Export PDF 🚀</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* PDF Export & Share Modal */}
      <PdfExportModal
        visible={showExportModal}
        onClose={() => setShowExportModal(false)}
        data={data}
        onReportGenerated={handleResetAfterPdfGeneration}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1,
    marginTop: 8,
  },
  loadingText: {
    fontSize: 13,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#0c1322',
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background.border,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#131e32',
    borderWidth: 1,
    borderColor: '#1e2d48',
  },
  tabBtnActive: {
    backgroundColor: '#9a3412',
    borderColor: Colors.accent.primary,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
  },
  tabBtnTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
  contentScroll: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 10,
    backgroundColor: '#121c2e',
    borderRadius: 10,
    borderWidth: 1.2,
    borderColor: '#223450',
    paddingHorizontal: 12,
  },
  searchIcon: {
    fontSize: 13,
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 9,
    fontSize: 12.5,
    color: Colors.text.primary,
  },
  clearSearchBtn: {
    padding: 6,
  },
  clearSearchText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '700',
  },
  sectionsList: {
    marginTop: 2,
  },
  photosWrapper: {
    paddingHorizontal: 16,
  },
  photoHeaderBox: {
    padding: 14,
    backgroundColor: Colors.background.surface,
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: Colors.background.border,
    marginTop: 10,
    marginBottom: 14,
  },
  photoHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  photoHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
  photoProgressPill: {
    backgroundColor: '#0a101d',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#233652',
  },
  photoProgressText: {
    color: Colors.accent.secondary,
    fontSize: 10,
    fontWeight: '700',
  },
  photoSubheading: {
    fontSize: 11,
    color: Colors.text.muted,
    lineHeight: 15,
  },
  photoSlotsContainer: {
    marginTop: 4,
  },

  /* Floating Dock */
  floatingDock: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    right: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.94)',
    borderWidth: 1.2,
    borderColor: '#2b3f63',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  dockInfoCol: {
    flex: 1,
    marginRight: 10,
  },
  dockProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dockPercentText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.status.ok.text,
  },
  dockDefectsText: {
    fontSize: 11,
    color: Colors.status.attention.text,
    fontWeight: '600',
  },
  dockVehicleText: {
    fontSize: 11.5,
    color: '#94a3b8',
    fontWeight: '600',
    marginTop: 2,
  },
  dockBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  jumpBtn: {
    backgroundColor: '#162238',
    borderWidth: 1,
    borderColor: '#2b3f63',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
  },
  jumpBtnText: {
    color: '#cbd5e1',
    fontSize: 11.5,
    fontWeight: '700',
  },
  mergeBtn: {
    backgroundColor: '#ea580c',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f97316',
    shadowColor: '#ea580c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  mergeBtnText: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '800',
  },
});
