# Vehicle Inspection Mobile App (React Native / Expo)

A complete offline React Native mobile application for Vehicle Inspections (PDI / PPI) modeled after the **Inspect AutoCar** Live Vehicle Inspection report.

---

## 🌟 Key Features

1. **100% Offline & No Backend Needed**
   - All customer data, inspection checkpoints, and notes are saved in device local storage via `@react-native-async-storage/async-storage`.
   - All uploaded photos are saved permanently to the device local file system via `expo-file-system/legacy`.
   - Offline PDF generation using `expo-print` with embedded Base64 photos.

2. **Full 36-Section Checkpoint Evaluation (Tables First)**
   - Includes all checkpoints extracted from your sample report:
     - Front Exterior, Lights, Front Structure, Chassis
     - Rear Exterior, Rear Structure & Roof
     - Front Right / Rear Right / Rear Left / Front Left (Exterior, Structure, Mechanical)
     - Engine Compartment, Engine & Road Test
     - Transmission & Drivetrain, Suspension & Steering
     - Brakes, Wheels & Tyres, Battery & Electrical
     - Interior & Comfort, Air Conditioning & Heating
     - Safety Features, Connectivity & Infotainment, ADAS
     - Underbody & Fluid Leaks, BS6 Emission System, EV Powertrain, Final Documentation & Tools
   - Interactive status buttons: `OK` (Green), `Attention` (Yellow), `Failed` (Red), `NA` (Gray).
   - Observation text field with quick tag chips for each checkpoint.
   - "Mark Section as All OK" quick-action button for rapid inspections.

3. **18 Predefined Vehicle Photo Slots + Extra Photos**
   - Matches the standard photo angles in your PDF report:
     1. Front side full view
     2. Front underbody view
     3. Front right corner view
     4. Right side full view
     5. Front seat view
     6. Rear seat view
     7. Dashboard view
     8. Gear shifter view
     9. Rear right corner view
     10. Rear side full view
     11. Dicky inside view
     12. Rear underbody view
     13. Rear left corner view
     14. Left side full view
     15. Front left corner view
     16. Engine compartment view
     17. Battery view
     18. Additional Extra pic
   - **Post-Upload Option Selector**: Immediately after picking an image from Camera or Gallery, an evaluation modal opens automatically to select the status and type observations (e.g. *Repainted*, *Minor dent*, *Replaced*).
   - **Extra Photos Gallery**: Unlimited additional slots for paint thickness gauge readings, tyre tread depth gauges, and damage closeups.

4. **PDF Merging & Generation**
   - Exact replica of the **Inspect AutoCar** layout:
     1. Header: Logo, title, customer details, vehicle details, odometer, inspector name.
     2. Structured checkpoint tables (Sections 1 to 36) with colored status badges and observation notes.
     3. Labeled Vehicle Photos grid (18 slots).
     4. Extra Photos grid (paint thickness gauge readings).
     5. Inspection Remarks box.
     6. Company footer with contact numbers and website.

5. **Download & Share Options**
   - 📥 **Download PDF**: Saves the generated PDF directly to device files.
   - 💬 **Share on WhatsApp**: Opens WhatsApp with the PDF attached and customer details pre-filled.
   - 📸 **Share on Instagram / Other Apps**: Triggers the system native share sheet to send via Instagram, Gmail, AirDrop, Bluetooth, Drive, etc.

---

## 📱 How to Run the App

### Prerequisites
Make sure Node.js is installed.

### Start the Expo Development Server
```bash
cd /Users/octoboticstech/.gemini/antigravity-ide/scratch/vehicle-inspection-app
npx expo start
```

### Run on Your Mobile Phone:
1. Install **Expo Go** from the Google Play Store (Android) or Apple App Store (iOS).
2. Scan the QR code displayed in the terminal using your phone camera or the Expo Go app.
3. The app will launch directly on your physical mobile device!

---

## 📁 Project Architecture

```
vehicle-inspection-app/
├── App.tsx                              # Main navigation & state management
├── src/
│   ├── types/
│   │   └── inspection.ts                # TypeScript data interfaces & types
│   ├── data/
│   │   ├── defaultCheckpoints.ts        # 34 categories & 150+ inspection checkpoints
│   │   └── defaultPhotos.ts             # 18 standard photo view slots & sample info
│   ├── services/
│   │   ├── storageService.ts            # Local storage & offline file system manager
│   │   ├── pdfGenerator.ts              # HTML PDF compiler with base64 embedded photos
│   │   └── sharingService.ts            # Download, WhatsApp & Instagram sharing
│   └── components/
│       ├── Header.tsx                   # Top branding & real-time issue statistics
│       ├── VehicleInfoCard.tsx          # Customer & car metadata form
│       ├── CheckpointRow.tsx            # OK/Attention/Failed/NA buttons & observation input
│       ├── SectionAccordion.tsx         # Expandable category with "Mark All OK"
│       ├── PhotoSlotCard.tsx            # Camera/gallery upload + post-upload options modal
│       ├── ExtraPhotosSection.tsx       # Paint thickness gauge & extra photos grid
│       ├── RemarksCard.tsx              # Final summary observations editor
│       └── PdfExportModal.tsx           # PDF merge progress, download & share actions
```
