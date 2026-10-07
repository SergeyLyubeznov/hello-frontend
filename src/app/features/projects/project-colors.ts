export interface ProjectColor {
  id: string;
  name: string;
  color: string;
}

// The color choices from the "New project" design.
export const PROJECT_COLORS: ProjectColor[] = [
  { id: 'indigo', name: 'Indigo', color: '#4250C4' },
  { id: 'teal', name: 'Teal', color: '#0F766E' },
  { id: 'orange', name: 'Orange', color: '#B45309' },
  { id: 'purple', name: 'Purple', color: '#7C3AED' },
  { id: 'pink', name: 'Pink', color: '#BE185D' },
  { id: 'gray', name: 'Gray', color: '#4B5563' },
];
