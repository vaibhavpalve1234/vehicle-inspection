import { PhotoSlot, VehicleCustomerInfo } from '../types/inspection';

export const DEFAULT_PHOTO_SLOTS: PhotoSlot[] = [
  { id: 'p-1', title: 'Front side full view', observation: '', status: 'OK' },
  { id: 'p-2', title: 'Front underbody view', observation: '', status: 'OK' },
  { id: 'p-3', title: 'Front right corner view', observation: '', status: 'OK' },
  { id: 'p-4', title: 'Right side full view', observation: '', status: 'OK' },
  { id: 'p-5', title: 'Front seat view', observation: '', status: 'OK' },
  { id: 'p-6', title: 'Rear seat view', observation: '', status: 'OK' },
  { id: 'p-7', title: 'Dashboard view', observation: '', status: 'OK' },
  { id: 'p-8', title: 'Gear shifter view', observation: '', status: 'OK' },
  { id: 'p-9', title: 'Rear right corner view', observation: '', status: 'OK' },
  { id: 'p-10', title: 'Rear side full view', observation: '', status: 'OK' },
  { id: 'p-11', title: 'Dicky inside view', observation: '', status: 'OK' },
  { id: 'p-12', title: 'Rear underbody view', observation: '', status: 'OK' },
  { id: 'p-13', title: 'Rear left corner view', observation: '', status: 'OK' },
  { id: 'p-14', title: 'Left side full view', observation: '', status: 'OK' },
  { id: 'p-15', title: 'Front left corner view', observation: '', status: 'OK' },
  { id: 'p-16', title: 'Engine compartment view', observation: '', status: 'OK' },
  { id: 'p-17', title: 'Battery view', observation: '', status: 'OK' },
  { id: 'p-18', title: 'Additional Extra pic', observation: '', status: 'OK' },
];

export const DEFAULT_VEHICLE_INFO: VehicleCustomerInfo = {
  customerName: 'Manoj Kalokhe',
  mobile: '+91 97636 59094',
  vehicleModel: 'Tata Tigor',
  registrationNumber: 'MH01DE3629',
  vin: 'MAT622019NPA1294',
  odometer: '18411',
  inspectionType: 'PPI',
  inspectionDate: '2026-10-10',
  inspectorName: 'Navin Salve',
};

export const DEFAULT_REMARKS = `1) Fire wall major rusted
2) Back panel major rusted
3) Dicky floor bend dent minor rusted
4) Rear windshield glass replace
5) A/C cooling less effective`;

export const CLEAN_VEHICLE_INFO: VehicleCustomerInfo = {
  customerName: '',
  mobile: '',
  vehicleModel: '',
  registrationNumber: '',
  vin: '',
  odometer: '',
  inspectionType: 'PDI',
  inspectionDate: new Date().toISOString().split('T')[0],
  inspectorName: '',
};

export const CLEAN_REMARKS = '';

export const getCleanPhotoSlots = (): PhotoSlot[] => {
  return DEFAULT_PHOTO_SLOTS.map((slot) => ({
    ...slot,
    uri: undefined,
    localPath: undefined,
    observation: '',
    status: 'OK',
  }));
};

