export interface LabelColor {
  id: string;
  name: string;
  textColor: string;
  backgroundColor: string;
}

// The color choices from the "New label" design.
export const LABEL_COLORS: LabelColor[] = [
  { id: 'indigo', name: 'Indigo', textColor: '#3730A3', backgroundColor: '#E3E7FB' },
  { id: 'teal', name: 'Teal', textColor: '#0B5E57', backgroundColor: '#D9F2EE' },
  { id: 'orange', name: 'Orange', textColor: '#8A3B0A', backgroundColor: '#FDEBD3' },
  { id: 'purple', name: 'Purple', textColor: '#5B2A9E', backgroundColor: '#EEE3FB' },
  { id: 'pink', name: 'Pink', textColor: '#9D174D', backgroundColor: '#FCE4EF' },
  { id: 'gray', name: 'Gray', textColor: '#3E4856', backgroundColor: '#ECEEF1' },
];
