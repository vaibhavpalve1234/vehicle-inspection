export type CheckpointStatus = 'OK' | 'Attention' | 'Failed' | 'NA';

export interface CheckpointItem {
  id: string;
  name: string;
  status: CheckpointStatus;
  observation: string;
}

export interface InspectionSection {
  id: string;
  sectionNumber: number;
  title: string;
  items: CheckpointItem[];
}

export interface PhotoSlot {
  id: string;
  title: string;
  uri?: string;
  localPath?: string;
  observation?: string;
  status?: CheckpointStatus;
  timestamp?: number;
}

export interface ExtraPhoto {
  id: string;
  uri: string;
  localPath: string;
  title: string;
  observation?: string;
  timestamp: number;
}

export interface VehicleCustomerInfo {
  customerName: string;
  mobile: string;
  vehicleModel: string;
  registrationNumber: string;
  vin: string;
  odometer: string;
  inspectionType: string;
  inspectionDate: string;
  inspectorName: string;
}

export interface InspectionData {
  id: string;
  createdAt: number;
  updatedAt: number;
  info: VehicleCustomerInfo;
  sections: InspectionSection[];
  standardPhotos: PhotoSlot[];
  extraPhotos: ExtraPhoto[];
  remarks: string;
}
