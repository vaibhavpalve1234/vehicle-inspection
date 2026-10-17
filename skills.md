---
name: vehicle-inspection-ui-ux-revamp
description: >-
  Comprehensive guide and operational runbook for revamping the UI and UX of the Vehicle Inspection App.
  Use this skill whenever improving the application's mobile interface, visual design hierarchy,
  haptic feedback, tactile animations, inspection workflows, camera studio, and PDF export preview.
---

# Vehicle Inspection App: UI/UX Revamp Specification & Runbook

This skill provides an end-to-end blueprint, design system, and component-by-component implementation guide to transform the **Vehicle Inspection App** into an ultra-modern, intuitive, and tactile automotive inspection mobile experience.

---

## 1. Project Context & Current Audit

### Environment
- **Framework**: React Native 0.86 / Expo SDK 57 / TypeScript
- **Target Users**: Automotive inspectors, PDI (Pre-Delivery Inspection) mechanics, used car evaluators, and workshop technicians using mobile devices in daylight, garages, and on lot floors.

### Current Friction Points & UI/UX Bottlenecks
1. **Flat & Monolithic Layout**: All tabs, lists, and states reside in `App.tsx` with basic flat borders (`#334155`, `#e2e8f0`) and minimal visual hierarchy.
2. **High-Effort Data Entry**: Inspecting 36 categories with hundreds of items requires constant manual typing for observations ("Repainted", "Dented", "Scratch"). Inspectors on mobile need single-tap observation chips.
3. **No Visual Health Score**: Header only displays raw counters (`OK: 28, Attention: 4, Failed: 2`). Inspectors and clients expect an overall **Vehicle Condition Score** (e.g. `87/100`, `Grade: A-`).
4. **Static Photo Uploads**: Plain rectangular cards without angle guidance wireframes, zoomable lightbox preview, or upload progress states.
5. **Lack of Haptic / Tactile Feedback**: Tapping status buttons lacks native haptic response (`expo-haptics`), reducing confidence during quick multi-point taps.
6. **Bottom Action Bar**: Standard fixed bottom bar without floating glassmorphism or smart "Jump to Next Incomplete Section" automation.

---

## 2. Design System & Visual Aesthetics ("Hyper-Spec Automotive")

### 2.1 Color Palette
Use a sophisticated **Titanium Obsidian Dark Theme** engineered for outdoor sunlight contrast and sleek executive presentation:

```typescript
// src/theme/colors.ts
export const Colors = {
  background: {
    primary: '#080C14',     // Deep obsidian canvas
    secondary: '#0F172A',   // Dark slate surface
    surface: '#162032',     // Elevated card background
    elevated: '#1E2B42',    // Interactive raised elements
    border: '#24334D',      // Subtle dividers
  },
  accent: {
    primary: '#FF6B00',     // Dynamic Hyper-Orange (brand identity)
    primaryGlow: 'rgba(255, 107, 0, 0.25)',
    secondary: '#3B82F6',   // High-tech Electric Blue
  },
  status: {
    ok: {
      bg: '#052E16',
      border: '#15803D',
      text: '#4ADE80',
      glow: 'rgba(74, 222, 128, 0.2)',
    },
    attention: {
      bg: '#451A03',
      border: '#B45309',
      text: '#FBBF24',
      glow: 'rgba(251, 191, 36, 0.2)',
    },
    failed: {
      bg: '#450A0A',
      border: '#B91C1C',
      text: '#F87171',
      glow: 'rgba(248, 113, 113, 0.2)',
    },
    na: {
      bg: '#1E293B',
      border: '#475569',
      text: '#94A3B8',
    },
  },
  text: {
    primary: '#F8FAFC',
    secondary: '#94A3B8',
    muted: '#64748B',
    inverse: '#080C14',
  },
};
```

### 2.2 Typography Hierarchy
- **Display / Score**: 32px / 28px — Bold, tabular digits for quick odometer and score reading.
- **Section Headers**: 17px — SemiBold, letter-spacing -0.3px.
- **Item Titles**: 14px — Medium, high-contrast white.
- **Labels & Micro-Badges**: 11px / 10px — Bold uppercase with subtle letter spacing (+0.5px).

### 2.3 Tactile Haptics & Motion
- Add `expo-haptics` (`Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)`) when toggling statuses.
- Heavy haptic feedback on `Failed` status selection to prevent accidental fails.
- Smooth collapse/expand transitions for the 36 section accordions using React Native's `LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)`.

---

## 3. UI/UX Revamp Architecture & Component Blueprint

```
src/
├── theme/
│   ├── colors.ts              # Unified color tokens
│   ├── shadows.ts             # Depth, elevations, and glows
│   └── typography.ts          # Font weights, sizes, and line heights
├── components/
│   ├── Header/
│   │   ├── Header.tsx         # Modern header with Health Score Ring
│   │   └── HealthScoreDial.tsx# Dynamic circular score (0-100) & grade badge
│   ├── Checkpoints/
│   │   ├── SectionAccordion.tsx # Glassmorphism card with progress ring
│   │   ├── CheckpointRow.tsx    # Tactile status buttons + 1-tap quick tags
│   │   └── QuickTagsBar.tsx     # Chips for ["Scratch", "Dent", "Repaint", "Corrosion", "Oil Leak"]
│   ├── Photos/
│   │   ├── PhotoSlotCard.tsx    # Card with vehicle angle guide silhouette
│   │   ├── PhotoGuideModal.tsx  # Example photo overlay & framing tips
│   │   └── PhotoLightbox.tsx    # Pinch-to-zoom fullscreen inspection
│   ├── VehicleInfo/
│   │   └── VehicleInfoCard.tsx  # Compact summary chip + modal/sheet editor
│   ├── Navigation/
│   │   ├── SegmentedTabBar.tsx  # Animated active tab indicator pill
│   │   └── FloatingDock.tsx     # Floating quick-action bar with jump button
│   └── Export/
│       └── PdfExportModal.tsx   # Visual PDF carousel preview + instant share
```

---

## 4. Key Revamp Features & Step-by-Step Upgrades

### Step 1: Install UI & Haptic Dependencies
Install compatible Expo modules:
```bash
npx expo install expo-haptics
```

### Step 2: Vehicle Health Score Dial in Header
Replace static text counters with an interactive **Inspection Health Score**:
- Formula: `Score = 100 - (failedCount * 3.5) - (attentionCount * 1.2)`.
- Rating Badges:
  - `90 - 100`: **A+ Excellent** (Emerald glow)
  - `75 - 89`: **B Good / Minor Wear** (Sky blue glow)
  - `60 - 74`: **C Fair / Attention Required** (Amber glow)
  - `< 60`: **D Critical Defects** (Crimson glow)
- Progress metric: `X / 36 Categories Completed` with a thin animated bar across the bottom of the header.

### Step 3: Fast-Touch Observation Chips (Greasy Hand Optimization)
Inspectors shouldn't type repetitively on virtual keyboards. Add contextual Quick Tags:
- **Body & Exterior**: `["Minor Scratch", "Deep Scratch", "Dented", "Repainted", "Replaced", "Rusting"]`
- **Engine & Mechanical**: `["Oil Leakage", "Abnormal Noise", "Belt Worn", "Coolant Low", "Vibration"]`
- **Tyres & Brakes**: `["Tread < 2mm", "Uneven Wear", "Pad Worn", "Disc Grooved", "Bulge"]`
- **Electrical**: `["Not Working", "Warning Light On", "Flickering", "Blown Fuse"]`

Tapping a tag instantly appends or removes it from `item.observation`.

### Step 4: Photo Studio with Angle Wireframes & Lightbox
1. **Silhouette Guides**: Show a low-opacity icon/wireframe for each of the standard photo slots:
   - Front 45° Left
   - Front 45° Right
   - Rear Profile
   - Engine Bay Top
   - Driver Seat / Cockpit / Dashboard
   - Underbody / Dicky Floor
2. **Status Badge Overlay**: Once uploaded, overlay a mini pill on the top-right of the photo:
   - 🟢 `OK` | 🟡 `Defect Logged` | 🔴 `Failed`
3. **Full-Screen Lightbox**: Tapping the thumbnail opens an interactive zoomable modal with timestamp, GPS watermark preview, and note editing.

### Step 5: Floating Bottom Action Dock (Smart Navigator)
Instead of a static fixed bar, implement a floating pill dock:
- **Current Completion**: `84% Complete`
- **Smart Jump Button**: `Next Defect ➔` or `Next Unchecked ➔` (auto-scrolls to the first unfinished category or item requiring attention).
- **Primary CTA**: Glowing orange button `Generate Report PDF (🚀)`.

### Step 6: Interactive PDF Export Experience
Elevate the PDF export modal:
- **Visual Document Thumbnails**: Show a carousel preview of the generated document pages.
- **Branding Controls**: Switch to toggle "Include High-Res Photos", "Include Inspector Signature", and "Watermark Report".
- **Instant Actions**:
  - One-tap WhatsApp Share with pre-formatted message:
    `"Hello! Here is the vehicle inspection report for Tata Tigor (MH01DE3629). Overall Score: 92/100."`
  - Print / Save to Files / AirDrop.

---

## 5. Implementation Runbook & Checklist

Execute the revamp using the following structured phases:

- [ ] **Phase 1: Theme & Haptic Setup**
  - Create `src/theme/colors.ts`, `src/theme/typography.ts`, `src/theme/shadows.ts`.
  - Add helper `src/utils/haptics.ts` wrapping `expo-haptics`.
- [ ] **Phase 2: Checkpoint Row & Quick Tags**
  - Update `CheckpointRow.tsx` with high-contrast pill selectors, vibration feedback, and Quick Observation Chips.
- [ ] **Phase 3: Category Accordions & Progress Visualization**
  - Update `SectionAccordion.tsx` to show individual section completion rates (e.g., `8/8 completed`) and animated chevron indicators.
- [ ] **Phase 4: Header & Health Score**
  - Upgrade `Header.tsx` to include the automotive condition badge, health score calculation, and category progress bar.
- [ ] **Phase 5: Photo Studio Cards**
  - Upgrade `PhotoSlotCard.tsx` with angle wireframe placeholders, photo thumbnail status badges, and quick retake gestures.
- [ ] **Phase 6: Floating Dock Navigation**
  - Revamp bottom bar in `App.tsx` into a modern floating action island with smart jump and quick stats.
- [ ] **Phase 7: Typecheck & Quality Assurance**
  - Run `npx tsc --noEmit` to ensure 0 TypeScript errors.
  - Test responsiveness across standard screen widths (360dp to 430dp).
