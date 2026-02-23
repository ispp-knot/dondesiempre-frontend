import { LngLat, StyleSpecification } from 'maplibre-gl';
import MAP_STYLE from './map-style-basic-v8.json';

export const DEFAULT_MAP_LOCATION = new LngLat(-3.7492, 40.4637);

export const DEFAULT_MAP_STYLE: StyleSpecification = {
  ...(MAP_STYLE as StyleSpecification),
};
