
export enum GarmentType {
  SHIRT = 'Shirt',
  DRESS = 'Dress',
  PANTS = 'Pants'
}

export enum FabricType {
  COTTON = 'Organic Cotton',
  SILK = 'Ethical Silk',
  LINEN = 'Pure Linen',
  RECYCLED_POLY = 'Recycled Polyester',
  HEMP = 'Hemp Blend'
}

export enum FitType {
  SLIM = 'Slim Fit',
  REGULAR = 'Regular Fit',
  OVERSIZED = 'Oversized',
  TAILORED = 'Tailored'
}

export enum NecklineType {
  CREW = 'Crew Neck',
  V_NECK = 'V-Neck',
  COLLAR = 'Collared',
  BOAT = 'Boat Neck'
}

export interface CustomizationState {
  type: GarmentType;
  color: string;
  fabric: FabricType;
  fit: FitType;
  neckline: NecklineType;
  hasPockets: boolean;
  sleeveLength: 'short' | 'long';
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isTyping?: boolean;
  image?: string;
}
