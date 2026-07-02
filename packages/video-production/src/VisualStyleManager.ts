import { DirectorRequest, VisualStyle } from './DirectorContext';

const DEFAULT_STYLE: VisualStyle = {
  palette: ['#0A192F', '#1F2937', '#E5E7EB', '#F59E0B'],
  typography: 'Inter',
  transitionStyle: 'cinematic-dissolve',
  cameraStyle: ['static', 'pan', 'zoom-in', 'dolly'],
};

export class VisualStyleManager {
  resolveStyle(request: DirectorRequest): VisualStyle {
    const incomingStyle = request.visualStyle;

    return {
      palette: incomingStyle?.palette ?? DEFAULT_STYLE.palette,
      typography: incomingStyle?.typography ?? DEFAULT_STYLE.typography,
      transitionStyle: incomingStyle?.transitionStyle ?? DEFAULT_STYLE.transitionStyle,
      cameraStyle: incomingStyle?.cameraStyle ?? DEFAULT_STYLE.cameraStyle,
    };
  }
}
