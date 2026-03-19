import { LngLat, StyleSpecification } from 'maplibre-gl';
import MAP_STYLE from './map-style-basic-v8.json';

interface Coordenadas {
  latitud: number;
  longitud: number;
}

const lat = Number(((Math.random() * 180) - 90).toFixed(6));  // Rango: [-90, 90]
const lng = Number(((Math.random() * 360) - 180).toFixed(6));

export const DEFAULT_MAP_LOCATION = new LngLat(-5.92265, 37.281534);

export const TEST_MAP_LOCATION = new LngLat(lng, lat);

export const DEFAULT_MAP_STYLE: StyleSpecification = {
  ...(MAP_STYLE as StyleSpecification),
};
