export type PackagingType = 'smd' | 'gob' | 'cob' | 'mip';
export type SimulationMode = 'surface' | 'venue' | 'moire' | 'split';
export type TestPatternType = 'dashboard' | 'studio' | 'text' | 'gradient';

export interface OpticalCalculations {
  pitchMm: number;
  ppi: number;
  pxPerSqMeter: number;
  pxPerSqFoot: number;
  retinaDistanceM: number;
  retinaDistanceFt: number;
  minDistanceM: number;
  minDistanceFt: number;
  comfortDistanceM: number;
  comfortDistanceFt: number;
  angularSubtenseArcmin: number;
  ppd: number;
  fovHorizontalDeg: number;
  gridContrast: number;
  acuityVerdict: 'retina' | 'comfortable' | 'noticeable';
}

export type CabinetPreset =
  | '600x337.5'
  | '640x480'
  | '480x480'
  | '400x300'
  | '500x250'
  | '250x250'
  | '1000x250'
  | '1200x337.5'
  | '500x500'
  | '500x1000'
  | '1000x1000'
  | 'custom';

export interface IndoorCabinetSpecs {
  modelName: string;
  series: string;
  moduleWidthMm: number;
  moduleHeightMm: number;
  modulesPerCabX: number;
  modulesPerCabY: number;
  serviceType: 'front_magnetic' | 'front_rear' | 'rear_only';
  chassisMaterial: string;
  flatnessToleranceMm: number;
  fanlessSilent: boolean;
  noiseDba: number;
  protectionFront: string;
  hdrStandards: string[];
  grayscaleBitDepth: number;
  refreshRateHz: number;
}

export type EnvironmentType =
  | 'indoor_fine'
  | 'indoor_corporate'
  | 'indoor_studio'
  | 'rental_staging'
  | 'outdoor';

export interface CabinetCalculations {
  cols: number;
  rows: number;
  totalCabinets: number;
  cabinetWidthMm: number;
  cabinetHeightMm: number;
  totalWidthM: number;
  totalHeightM: number;
  totalAreaSqM: number;
  totalAreaSqFt: number;
  diagonalInches: number;
  aspectRatio: string;
  cabResX: number;
  cabResY: number;
  totalResX: number;
  totalResY: number;
  totalPixels: number;
  avgPowerKw: number;
  peakPowerKw: number;
  hvacBtuHr: number;
  breakers110V: number;
  breakers230V: number;
  weightKg: number;
  weightLbs: number;
  fovDegAtViewer: number;
  thxCompliant: boolean;
  smpteCompliant: boolean;
}

export type ControllerCategory = 'hseries' | 'coex1g' | 'coex5g' | 'vx' | 'mctrl' | 'taurus' | 'tuseries';
export type SoftwarePlatform = 'VMP' | 'NovaLCT' | 'Web GUI' | 'ViPlex' | 'Kompass';
export type Ecosystem = 'coex' | 'traditional' | 'hseries';

export interface ControllerModel {
  id: string;
  name: string;
  category: ControllerCategory;
  eco: Ecosystem;
  software: string;
  input: string;
  output: string;
  load: string;
  loadNum: number; // in Millions of pixels
  app: string;
  mrv: boolean;
  dh: boolean;
  br: boolean;
  armor: boolean;
  caxa: boolean;
  ncp: boolean;
  description: string;
  formFactor: string;
  redundancySupport: string;
  maxResolution?: string;
  layers?: string;
}

export interface ReceivingCardModel {
  id: string;
  name: string;
  series: string;
  eco: string;
  interface: string;
  maxPx: string;
  maxPxNum: number;
  booster: string;
  coex: boolean;
  is5g: boolean;
  description: string;
}

export interface ProductDirectoryItem {
  id: string;
  category: string;
  categoryLabel: string;
  model: string;
  desc: string;
  input: string;
  output: string;
  load: string;
  loadNum: number;
  app: string;
  eco: string;
  software: string;
  formFactor?: string;
  highlights?: string[];
}

export interface PortSpecifierResult {
  totalPixels: number;
  megapixels: number;
  uncompressedGbps: number;
  portCapacity1G: number;
  portCapacity5G: number;
  primary1GPorts: number;
  total1GPorts: number;
  primary5GPorts: number;
  total5GPorts: number;
  cableReductionPct: number;
  optical10GTrunks: number;
  optical40GTrunks: number;
  approxCabinets: number;
  approxAreaM2: number;
  bom: {
    recommendedController: string;
    controllerSeries: string;
    controllerDetails: string;
    recommendedReceivingCards: string;
    cardDetails: string;
    transceivers: string;
    software: string;
  };
}
