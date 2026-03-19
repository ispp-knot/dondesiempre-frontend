import chroma from 'chroma-js';

export function convertToBrightness(color: string, brightness: number, alpha = 1): string {
  try {
    const labColor = chroma(color).lab();
    labColor[0] = brightness;
    return chroma
      .lab(...labColor)
      .alpha(alpha)
      .hex();
  } catch (error) {
    console.error('Failed to parse color:', color, error);
    return '#333333';
  }
}
