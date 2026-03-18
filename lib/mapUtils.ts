import { LngLat, StyleSpecification } from 'maplibre-gl';
import MAP_STYLE from './map-style-basic-v8.json';

export const DEFAULT_MAP_LOCATION = new LngLat(-5.92265, 37.281534);

export const DEFAULT_MAP_STYLE: StyleSpecification = {
  ...(MAP_STYLE as StyleSpecification),
};


