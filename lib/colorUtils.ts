import chroma from 'chroma-js';

export function convertToBrightness(color: string, brightness: number): string {
  try {
    const labColor = chroma(color).lab();
    labColor[0] = brightness;
    return chroma.lab(labColor).hex();
  } catch (error) {
    console.error('Failed to parse color:', color, error);
    return '#333333';
  }
}
