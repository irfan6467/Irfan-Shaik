
export enum Gender {
  MEN = 'Men',
  WOMEN = 'Women',
  UNISEX = 'Unisex'
}

export enum GarmentType {
  SHIRT = 'Shirt',
  DRESS = 'Dress',
  PANTS = 'Pants',
  HOODIE = 'Hoodie',
  JACKET = 'Jacket'
}

export enum FabricType {
  COTTON = 'Organic Surat Cotton',
  SILK = 'Surat Art Silk',
  LINEN = 'Hemp-Linen Blend',
  RECYCLED_POLY = 'Recycled Polyester',
  HEMP = 'Pure Hemp'
}

export enum FitType {
  SLIM = 'Slim Fit',
  REGULAR = 'Regular Fit',
  OVERSIZED = 'Oversized (Gen Z)',
  TAILORED = 'Tailored'
}

export enum NecklineType {
  CREW = 'Crew Neck',
  V_NECK = 'V-Neck',
  COLLAR = 'Collared',
  BOAT = 'Boat Neck',
  MOCK = 'Mock Neck',
  COWL = 'Cowl Neck'
}

export enum PatternType {
  NONE = 'Solid',
  STRIPES = 'Classic Stripes',
  DOTS = 'Polka Dots',
  FLORAL = 'Floral Bloom',
  CHECKERED = 'Modern Grid',
  ABSTRACT = 'Abstract Waves',
  WATER = 'Ocean Ripples',
  STARS = 'Starry Night',
  VINTAGE_FLORAL = 'Vintage Garden'
}

export enum GraphicType {
  NONE = 'No Graphic',
  VINTAGE_LOGO = 'Vintage Emblem',
  MINIMAL_TEXT = 'Minimal Text',
  ECO_BADGE = 'Eco Badge',
  CUSTOM = 'Custom Upload'
}

export enum PrintMethod {
  SCREEN = 'Screen Print',
  DTG = 'Vintage DTG',
  PUFF = '3D Puff Print',
  EMBROIDERY = 'Satin Stitch Embroidery'
}

export enum HardwareType {
  STANDARD = 'Standard Plastic',
  ANTIQUE_BRASS = 'Antique Brass',
  INVISIBLE = 'Invisible Zipper',
  COCONUT = 'Sustainable Coconut',
  PEARL = 'Mother of Pearl'
}

export type AspectRatio = '1:1' | '2:3' | '3:2' | '3:4' | '4:3' | '9:16' | '16:9' | '21:9';

export interface CustomizationState {
  gender: Gender;
  type: GarmentType;
  color: string;
  fabric: FabricType;
  fit: FitType;
  neckline: NecklineType;
  hasPockets: boolean;
  sleeveLength: 'short' | 'long';
  pattern: PatternType;
  graphic: GraphicType;
  printMethod: PrintMethod;
  hardware: HardwareType;
  customGraphicUrl?: string;
  textureOpacity: number;
  textureScale: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isTyping?: boolean;
  image?: string;
  groundingSources?: { uri: string; title: string; type: 'web' | 'map' }[];
}

// --- DATABASE TYPES ---

export type UserRole = 'customer' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export interface SavedDesign {
  id: string;
  userId: string;
  name: string;
  createdAt: number;
  state: CustomizationState;
  previewImage?: string; // Base64 thumbnail
}

export interface Order {
  id: string;
  userId: string;
  items: SavedDesign[];
  totalAmount: number;
  status: 'pending' | 'production' | 'shipped' | 'delivered';
  createdAt: number;
  shippingAddress: any;
}
