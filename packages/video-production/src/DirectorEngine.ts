import {
  DirectorOutput,
  DirectorRequest,
  ProviderSelection,
} from './DirectorContext';
import { DirectorPlanner } from './DirectorPlanner';
import { StoryboardGenerator } from './StoryboardGenerator';
import { ConsistencyManager } from './ConsistencyManager';
import { VisualStyleManager } from './VisualStyleManager';
import { PromptOptimizer } from './PromptOptimizer';
import { NarrationPlanner } from './NarrationPlanner';
import { MusicPlanner } from './MusicPlanner';
import { QualityController } from './QualityController';
import { ScenePlanner } from './ScenePlanner';
import { SceneScheduler } from './SceneScheduler';

const DEFAULT_PROVIDERS: ProviderSelection = {
  imageProvider: 'openai-images',
  videoProvider: 'runway',
  narrationProvider: 'elevenlabs',
  musicProvider: 'musicbed',
};

export class DirectorEngine {
  constructor(
    private readonly directorPlanner: DirectorPlanner,
    private readonly storyboardGenerator: StoryboardGenerator,
    private readonly consistencyManager: ConsistencyManager,
    private readonly visualStyleManager: VisualStyleManager,
    private readonly promptOptimizer: PromptOptimizer,
    private readonly narrationPlanner: NarrationPlanner,
    private readonly musicPlanner: MusicPlanner,
    private readonly qualityController: QualityController,
  ) {}

  createProductionPlan(request: DirectorRequest): DirectorOutput {
    const providers = this.selectProviders(request);
    const visualStyle = this.visualStyleManager.resolveStyle(request);
    const chapters = this.directorPlanner.generateOutline(request);

    const initialStoryboard = this.storyboardGenerator.generate(chapters, request);
    const consistentScenes = this.consistencyManager.maintainVisualConsistency(initialStoryboard.scenes, visualStyle);
    const optimizedScenes = this.promptOptimizer.optimizeScenes(consistentScenes);
    const narratedScenes = this.narrationPlanner.optimizeNarration(optimizedScenes, request);
    const scoredScenes = this.musicPlanner.assignMusicCues(narratedScenes);

    const storyboard = {
      ...initialStoryboard,
      scenes: scoredScenes,
    };

    return {
      request,
      providers,
      visualStyle,
      storyboard,
      qualityChecks: this.qualityController.runChecks(storyboard, request),
    };
  }

  private selectProviders(request: DirectorRequest): ProviderSelection {
    return {
      imageProvider: request.providers?.imageProvider ?? DEFAULT_PROVIDERS.imageProvider,
      videoProvider: request.providers?.videoProvider ?? DEFAULT_PROVIDERS.videoProvider,
      narrationProvider: request.providers?.narrationProvider ?? DEFAULT_PROVIDERS.narrationProvider,
      musicProvider: request.providers?.musicProvider ?? DEFAULT_PROVIDERS.musicProvider,
    };
  }

  static createDefault(): DirectorEngine {
    return new DirectorEngine(
      new DirectorPlanner(),
      new StoryboardGenerator(new ScenePlanner(), new SceneScheduler()),
      new ConsistencyManager(),
      new VisualStyleManager(),
      new PromptOptimizer(),
      new NarrationPlanner(),
      new MusicPlanner(),
      new QualityController(),
    );
  }
}
