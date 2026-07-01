export interface FadeSpec {
  type: 'in' | 'out' | 'crossfade';
  durationSeconds: number;
  curve: 'linear' | 'exponential' | 'logarithmic';
}

export class FadeController {
  buildFadeInFilter(startTimeSeconds: number, durationSeconds: number, curve: FadeSpec['curve'] = 'linear'): string {
    return `afade=t=in:st=${startTimeSeconds}:d=${durationSeconds}:curve=${curve}`;
  }

  buildFadeOutFilter(startTimeSeconds: number, durationSeconds: number, curve: FadeSpec['curve'] = 'linear'): string {
    return `afade=t=out:st=${startTimeSeconds}:d=${durationSeconds}:curve=${curve}`;
  }

  buildCrossfadeFilter(offset1Seconds: number, durationSeconds: number): string {
    return `acrossfade=d=${durationSeconds}:c1=linear:c2=linear,atrim=start=${offset1Seconds}`;
  }

  buildFiltersForSpec(spec: FadeSpec, atTimeSeconds: number): string[] {
    switch (spec.type) {
      case 'in':
        return [this.buildFadeInFilter(atTimeSeconds, spec.durationSeconds, spec.curve)];
      case 'out':
        return [this.buildFadeOutFilter(atTimeSeconds, spec.durationSeconds, spec.curve)];
      case 'crossfade':
        return [this.buildCrossfadeFilter(atTimeSeconds, spec.durationSeconds)];
    }
  }
}
