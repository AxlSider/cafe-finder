/** Preset import areas (center + radius) for the OSM importer. */
export interface ImportArea {
  key: string;
  label: string;
  lat: number;
  lng: number;
  radiusM: number;
}

export const IMPORT_AREAS: ImportArea[] = [
  // Luzon, Philippines
  { key: "baguio", label: "Baguio City", lat: 16.4023, lng: 120.596, radiusM: 5000 },
  { key: "makati", label: "Makati City", lat: 14.5547, lng: 121.0244, radiusM: 4000 },
  { key: "manila", label: "Manila", lat: 14.5995, lng: 120.9842, radiusM: 5000 },
  { key: "quezon", label: "Quezon City", lat: 14.676, lng: 121.0437, radiusM: 6000 },
  { key: "taguig", label: "Taguig (BGC)", lat: 14.5509, lng: 121.0487, radiusM: 4000 },
  { key: "tagaytay", label: "Tagaytay City", lat: 14.1153, lng: 120.9621, radiusM: 6000 },
  { key: "tuguegarao", label: "Tuguegarao City", lat: 17.6132, lng: 121.727, radiusM: 6000 },
  { key: "vigan", label: "Vigan City", lat: 17.5747, lng: 120.3869, radiusM: 5000 },
  { key: "dagupan", label: "Dagupan City", lat: 16.0431, lng: 120.3339, radiusM: 6000 },
  { key: "naga", label: "Naga City", lat: 13.6218, lng: 123.1948, radiusM: 6000 },
  { key: "batangas", label: "Batangas City", lat: 13.7565, lng: 121.0583, radiusM: 6000 },
  // Switzerland
  { key: "zurich", label: "Zürich", lat: 47.3769, lng: 8.5417, radiusM: 4000 },
  { key: "geneva", label: "Genève", lat: 46.2044, lng: 6.1432, radiusM: 4000 },
  { key: "bern", label: "Bern", lat: 46.948, lng: 7.4474, radiusM: 4000 },
  { key: "lucerne", label: "Lucerne", lat: 47.0502, lng: 8.3093, radiusM: 4000 },
];

export function findArea(key: string): ImportArea | undefined {
  return IMPORT_AREAS.find((a) => a.key === key);
}
