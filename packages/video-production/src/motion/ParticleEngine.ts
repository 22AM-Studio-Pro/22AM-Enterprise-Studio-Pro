export type ParticleEffect = 'confetti' | 'sparks' | 'dust' | 'snow' | 'fire' | 'stars' | 'bokeh' | 'smoke';

export interface ParticleSpec {
  sceneId: string;
  effect: ParticleEffect;
  density: 'low' | 'medium' | 'high';
  color?: string;
  durationSeconds: number;
  blend: 'screen' | 'add' | 'overlay' | 'normal';
  opacity: number;
}

const EFFECT_BLEND: Record<ParticleEffect, ParticleSpec['blend']> = {
  confetti: 'normal',
  sparks: 'add',
  dust: 'screen',
  snow: 'screen',
  fire: 'add',
  stars: 'screen',
  bokeh: 'screen',
  smoke: 'overlay',
};

export class ParticleEngine {
  build(sceneId: string, effect: ParticleEffect, duration: number, density: ParticleSpec['density'] = 'medium'): ParticleSpec {
    return {
      sceneId,
      effect,
      density,
      durationSeconds: duration,
      blend: EFFECT_BLEND[effect],
      opacity: density === 'low' ? 0.3 : density === 'high' ? 0.8 : 0.5,
    };
  }

  buildAmbient(sceneId: string, sceneTone: string, duration: number): ParticleSpec {
    const toneMap: Record<string, ParticleEffect> = {
      dramatic: 'smoke',
      inspirational: 'stars',
      exciting: 'sparks',
      calm: 'bokeh',
      serious: 'dust',
    };
    const effect = toneMap[sceneTone.toLowerCase()] ?? 'bokeh';
    return this.build(sceneId, effect, duration, 'low');
  }
}
