export type ChartType = 'bar' | 'line' | 'pie' | 'donut' | 'timeline' | 'area';

export interface DataPoint { label: string; value: number }

export interface ChartSpec {
  id: string;
  sceneId: string;
  chartType: ChartType;
  title: string;
  dataPoints: DataPoint[];
  durationSeconds: number;
  animationType: 'grow' | 'draw' | 'fade-in' | 'count-up';
  colorPalette: string[];
}

export interface InfographicTemplate {
  id: string;
  name: string;
  slots: { key: string; type: 'text' | 'number' | 'icon' | 'image' }[];
}

export interface InfographicSpec {
  id: string;
  sceneId: string;
  templateId: string;
  data: Record<string, string | number>;
  durationSeconds: number;
  animationIn: 'fade' | 'slide-up' | 'pop';
}

const TEMPLATES: InfographicTemplate[] = [
  { id: 'stats-3col', name: '3-Column Stats', slots: [{ key: 'stat1', type: 'number' }, { key: 'stat2', type: 'number' }, { key: 'stat3', type: 'number' }] },
  { id: 'comparison', name: 'Side-by-Side Comparison', slots: [{ key: 'left', type: 'text' }, { key: 'right', type: 'text' }] },
  { id: 'timeline-steps', name: 'Timeline Steps', slots: [{ key: 'step1', type: 'text' }, { key: 'step2', type: 'text' }, { key: 'step3', type: 'text' }, { key: 'step4', type: 'text' }] },
];

const DEFAULT_PALETTE = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export class InfographicEngine {
  buildChart(sceneId: string, chartType: ChartType, title: string, dataPoints: DataPoint[], durationSeconds = 8): ChartSpec {
    return {
      id: `chart-${sceneId}`,
      sceneId,
      chartType,
      title,
      dataPoints,
      durationSeconds,
      animationType: chartType === 'bar' ? 'grow' : chartType === 'line' ? 'draw' : 'fade-in',
      colorPalette: DEFAULT_PALETTE,
    };
  }

  buildInfographic(sceneId: string, templateId: string, data: Record<string, string | number>): InfographicSpec {
    return {
      id: `infographic-${sceneId}`,
      sceneId,
      templateId,
      data,
      durationSeconds: 8,
      animationIn: 'slide-up',
    };
  }

  getTemplates(): InfographicTemplate[] {
    return TEMPLATES;
  }

  getTemplate(id: string): InfographicTemplate | undefined {
    return TEMPLATES.find((t) => t.id === id);
  }
}
