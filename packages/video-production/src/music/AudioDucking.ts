export interface VolumeEnvelope {
  timeSeconds: number;
  volumeDb: number;
}

export interface DuckingConfig {
  backgroundVolumeDb: number;
  duckedVolumeDb: number;
  duckAttackSeconds: number;
  duckReleaseSeconds: number;
}

const DEFAULT_DUCKING: DuckingConfig = {
  backgroundVolumeDb: -18,
  duckedVolumeDb: -28,
  duckAttackSeconds: 0.3,
  duckReleaseSeconds: 0.5,
};

export class AudioDucking {
  constructor(private readonly config: DuckingConfig = DEFAULT_DUCKING) {}

  generateEnvelopes(
    narrationSegments: { startTimeSeconds: number; durationSeconds: number }[],
  ): VolumeEnvelope[] {
    const envelopes: VolumeEnvelope[] = [{ timeSeconds: 0, volumeDb: this.config.backgroundVolumeDb }];

    for (const seg of narrationSegments) {
      const duckStart = Math.max(0, seg.startTimeSeconds - this.config.duckAttackSeconds);
      const duckEnd = seg.startTimeSeconds + seg.durationSeconds;
      const releaseEnd = duckEnd + this.config.duckReleaseSeconds;

      envelopes.push(
        { timeSeconds: duckStart, volumeDb: this.config.backgroundVolumeDb },
        { timeSeconds: seg.startTimeSeconds, volumeDb: this.config.duckedVolumeDb },
        { timeSeconds: duckEnd, volumeDb: this.config.duckedVolumeDb },
        { timeSeconds: releaseEnd, volumeDb: this.config.backgroundVolumeDb },
      );
    }

    return envelopes.sort((a, b) => a.timeSeconds - b.timeSeconds);
  }

  buildFfmpegFilter(envelopes: VolumeEnvelope[]): string {
    const points = envelopes.map((e) => `${e.timeSeconds}/${Math.pow(10, e.volumeDb / 20).toFixed(4)}`).join(':');
    return `volume='${points}'`;
  }
}
