import React, { useState, useEffect } from 'react';
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

type ActiveTab = 'checkpoints' | 'photos' | 'remarks';

export default function App() {
  const [data, setData] = useState<InspectionData | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('checkpoints');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
    // Clear out observation values and photos for fresh start
    initial.standardPhotos.forEach((p) => {
      p.uri = undefined;
      p.localPath = undefined;
      p.observation = '';
    });
    initial.extraPhotos = [];
    initial.remarks = '';
    updateData(initial);
  };

  // Load sample data matching the user's PDF report
  const handleLoadSample = async () => {
    const initial = StorageService.createInitialInspection();
    updateData(initial);
    Alert.alert('Sample Loaded', 'Loaded inspection data matching the provided Tigor report.');
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

  if (isLoading || !data) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ea580c" />
        <Text style={styles.loadingText}>Loading Vehicle Inspection Data...</Text>
      </View>
    );
  }

  // Calculate live statistics
  const stats = {
    ok: 0,
    attention: 0,
    failed: 0,
    photos: data.standardPhotos.filter((p) => p.uri).length,
    totalPhotos: data.standardPhotos.length,
  };

  data.sections.forEach((sec) => {
    sec.items.forEach((item) => {
      if (item.status === 'OK') stats.ok++;
      else if (item.status === 'Attention') stats.attention++;
      else if (item.status === 'Failed') stats.failed++;
    });
  });

  // Filter sections by search query
  const filteredSections = data.sections.filter((sec) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      sec.title.toLowerCase().includes(q) ||
      sec.items.some((item) => item.name.toLowerCase().includes(q) || item.observation.toLowerCase().includes(q))
    );
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      {/* Header with live statistics */}
      <Header
        onReset={handleReset}
        onLoadSample={handleLoadSample}
        stats={stats}
      />

      {/* Tab Segment Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'checkpoints' && styles.tabBtnActive]}
          onPress={() => setActiveTab('checkpoints')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'checkpoints' && styles.tabBtnTextActive]}>
            📋 Tables (1-36)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'photos' && styles.tabBtnActive]}
          onPress={() => setActiveTab('photos')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'photos' && styles.tabBtnTextActive]}>
            📸 Photos ({stats.photos}/{stats.totalPhotos})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'remarks' && styles.tabBtnActive]}
          onPress={() => setActiveTab('remarks')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'remarks' && styles.tabBtnTextActive]}>
            📝 Remarks
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Content Area */}
      <ScrollView style={styles.contentScroll} contentContainerStyle={styles.scrollContent}>
        {activeTab === 'checkpoints' && (
          <View>
            {/* Customer & Vehicle Information */}
            <VehicleInfoCard info={data.info} onChangeInfo={handleUpdateInfo} />

            {/* Search Filter Bar */}
            <View style={styles.searchBarContainer}>
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                placeholder="Search checkpoint or section (e.g. Bumper, Brakes, AC)..."
                placeholderTextColor="#94a3b8"
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
          <View>
            <View style={styles.photoHeaderBox}>
              <Text style={styles.photoHeading}>Vehicle Inspection Photo Slots</Text>
              <Text style={styles.photoSubheading}>
                Upload vehicle angles as per report slots. After each upload, you can evaluate status & add observations.
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

            {/* Extra Photos Section (paint meter readings, tyre readings, extra damage closeups) */}
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

        {/* Extra spacing for bottom bar */}
        <View style={{ height: 90 }} />
      </ScrollView>

      {/* Floating Bottom Bar: PDF Merge & Share */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomBarInfo}>
          <Text style={styles.bottomVehicleText} numberOfLines={1}>
            {data.info.vehicleModel || 'Vehicle'} • {data.info.registrationNumber || 'No Plate'}
          </Text>
          <Text style={styles.bottomCountText}>
            {stats.photos} photos uploaded • {stats.failed + stats.attention} issues noted
          </Text>
        </View>

        <TouchableOpacity
          style={styles.mergeBtn}
          onPress={() => setShowExportModal(true)}
        >
          <Text style={styles.mergeBtnText}>Merge & Share PDF 🚀</Text>
        </TouchableOpacity>
      </View>

      {/* PDF Export & Share Modal */}
      <PdfExportModal
        visible={showExportModal}
        onClose={() => setShowExportModal(false)}
        data={data}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
  tabBtnActive: {
    backgroundColor: '#ea580c',
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
  },
  tabBtnTextActive: {
    color: '#ffffff',
  },
  contentScroll: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  searchBarContainer: {
    marginHorizontal: 16,
    marginVertical: 12,
    position: 'relative',
  },
  searchInput: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 14,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0f172a',
  },
  clearSearchBtn: {
    position: 'absolute',
    right: 12,
    top: 9,
  },
  clearSearchText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '700',
  },
  sectionsList: {
    marginTop: 2,
  },
  photoHeaderBox: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    marginBottom: 12,
  },
  photoHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  photoSubheading: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    lineHeight: 16,
  },
  photoSlotsContainer: {
    paddingHorizontal: 16,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  bottomBarInfo: {
    flex: 1,
    marginRight: 10,
  },
  bottomVehicleText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  bottomCountText: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  mergeBtn: {
    backgroundColor: '#ea580c',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    shadowColor: '#ea580c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  mergeBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
});
