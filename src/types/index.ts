export type MachineType =
  | 'SNLS'
  | 'DNLS'
  | 'OL-4D'
  | 'OL-5D'
  | 'FL'
  | 'KANSAI'
  | 'FEED-OFF-ARM'
  | 'BARTACK'
  | 'BUTTON_HOLE'
  | 'BUTTON_ATTACH'
  | 'MANUAL'
  | 'IRON'
  | 'QC';

export type SectionType =
  | 'Component'
  | 'Front'
  | 'Back'
  | 'Collar & Cuff'
  | 'Assembly'
  | 'Finishing'
  | 'Packaging';

export interface Operation {
  id: string;
  seq: number;
  name: string;
  machine: MachineType;
  section: SectionType;
  smv: number; // Standard Minute Value / SAM in minutes
  ops: number; // Allocated operators (e.g. 1, 1.5, 2)
  isManual?: boolean;
  remarks?: string;
}

export interface TimeStudyLap {
  id: string;
  lapNumber: number;
  timeSeconds: number;
  isOutlier: boolean;
  timestamp: string;
  note?: string;
}

export interface DowntimeLog {
  id: string;
  hour: number;
  minutesLost: number;
  reason: 'Machine Breakdown' | 'Needle Break' | 'Fabric Defect' | 'Thread Breakage' | 'Operator Absence' | 'Quality Rework' | 'Other';
  note?: string;
}

export interface GarmentStyle {
  id: string;
  name: string;
  styleCode: string;
  lineNo: string;
  buyer?: string;
  targetHourly: number;
  workingHours: number;
  targetEfficiency: number;
  operations: Operation[];
  hourlyOutputs: number[];
  downtimeLogs?: DowntimeLog[];
}

export type ActiveTab = 'breakdown' | 'timestudy' | 'balancing' | 'production' | 'reports';
