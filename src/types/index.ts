export type LayerType = 'rect' | 'circle' | 'ellipse' | 'polygon' | 'star' | 'line' | 'arrow' | 'text' | 'path' | 'group';

export type ToolType = 'select' | 'rect' | 'circle' | 'ellipse' | 'polygon' | 'star' | 'line' | 'arrow' | 'text' | 'pen' | 'pencil' | 'hand';

export type FillType = 'solid' | 'linear-gradient' | 'radial-gradient' | 'image' | 'none';

export type LineCap = 'butt' | 'round' | 'square';
export type LineJoin = 'miter' | 'round' | 'bevel';
export type ShadowType = 'drop' | 'inner';
export type BlendMode = 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten' | 'color-dodge' | 'color-burn';

export interface FillStyle {
  type: FillType;
  color?: string;
  gradientStops?: { color: string; offset: number }[];
  gradientAngle?: number;
  imageUrl?: string;
}

export interface StrokeStyle {
  enabled: boolean;
  color: string;
  width: number;
  dashArray?: number[];
  lineCap: LineCap;
  lineJoin: LineJoin;
}

export interface ShadowStyle {
  enabled: boolean;
  type: ShadowType;
  color: string;
  offsetX: number;
  offsetY: number;
  blur: number;
  spread: number;
}

export interface Layer {
  id: string;
  type: LayerType;
  name: string;
  visible: boolean;
  locked: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  blendMode: BlendMode;
  fill: FillStyle;
  stroke: StrokeStyle;
  shadow: ShadowStyle;
  radius: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
  text?: string;
  textAlign?: 'left' | 'center' | 'right';
  lineHeight?: number;
  letterSpacing?: number;
  children?: Layer[];
}

export interface Artboard {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  backgroundColor: string;
  layers: Layer[];
}

export interface DesignFile {
  id: string;
  name: string;
  thumbnail: string;
  createdAt: number;
  updatedAt: number;
  isFavorite: boolean;
  artboards: Artboard[];
  width: number;
  height: number;
}

export interface CanvasState {
  zoom: number;
  panX: number;
  panY: number;
  showRulers: boolean;
  showGrid: boolean;
  snapToGrid: boolean;
  smartGuides: boolean;
}

export interface HistoryState {
  past: string[];
  present: string;
  future: string[];
  maxHistory: number;
}

export interface PresetSize {
  name: string;
  category: 'mobile' | 'tablet' | 'desktop' | 'social';
  width: number;
  height: number;
  icon: string;
}

export const PRESET_SIZES: PresetSize[] = [
  { name: 'iPhone 14 Pro', category: 'mobile', width: 393, height: 852, icon: 'smartphone' },
  { name: 'iPhone 14', category: 'mobile', width: 390, height: 844, icon: 'smartphone' },
  { name: 'Samsung S23', category: 'mobile', width: 360, height: 780, icon: 'smartphone' },
  { name: 'iPad Pro 12.9"', category: 'tablet', width: 1024, height: 1366, icon: 'tablet' },
  { name: 'iPad Air', category: 'tablet', width: 820, height: 1180, icon: 'tablet' },
  { name: 'MacBook Pro 16"', category: 'desktop', width: 1536, height: 960, icon: 'monitor' },
  { name: 'Desktop 1920', category: 'desktop', width: 1920, height: 1080, icon: 'monitor' },
  { name: 'Desktop 1440', category: 'desktop', width: 1440, height: 900, icon: 'monitor' },
  { name: 'Instagram Post', category: 'social', width: 1080, height: 1080, icon: 'image' },
  { name: 'Instagram Story', category: 'social', width: 1080, height: 1920, icon: 'image' },
  { name: 'Twitter Post', category: 'social', width: 1200, height: 675, icon: 'image' },
  { name: 'Facebook Cover', category: 'social', width: 820, height: 312, icon: 'image' },
];
