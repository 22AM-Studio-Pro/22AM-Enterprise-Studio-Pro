import { DirectorRequest, QualityCheck, Storyboard } from './DirectorContext';

export class QualityController {
  runChecks(storyboard: Storyboard, request: DirectorRequest): QualityCheck[] {
    const checks: QualityCheck[] = [];

    checks.push(this.runtimeCheck(storyboard, request.targetDurationMinutes));
    checks.push(this.sceneCountCheck(storyboard));
    checks.push(this.transitionCoverageCheck(storyboard));

    return checks;
  }

  private runtimeCheck(storyboard: Storyboard, targetMinutes: number): QualityCheck {
    const runtimeMinutes = storyboard.estimatedRuntimeSeconds / 60;
    const tolerance = targetMinutes >= 60 ? 8 : 5;
    const delta = Math.abs(runtimeMinutes - targetMinutes);

    return {
      check: 'runtime-target',
      passed: delta <= tolerance,
      details: `Estimated runtime ${runtimeMinutes.toFixed(1)}m, target ${targetMinutes}m, tolerance ±${tolerance}m.`,
    };
  }

  private sceneCountCheck(storyboard: Storyboard): QualityCheck {
    const sceneCount = storyboard.scenes.length;

    return {
      check: 'scene-density',
      passed: sceneCount >= 40,
      details: `Storyboard generated ${sceneCount} scenes.`,
    };
  }

  private transitionCoverageCheck(storyboard: Storyboard): QualityCheck {
    const scenesWithTransitions = storyboard.scenes.filter((scene) => scene.transition.length > 0).length;

    return {
      check: 'transition-coverage',
      passed: scenesWithTransitions === storyboard.scenes.length,
      details: `${scenesWithTransitions}/${storyboard.scenes.length} scenes include transitions.`,
    };
  }
}
