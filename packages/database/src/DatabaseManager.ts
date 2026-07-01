import { DatabaseConnection } from './Database';
import { JobRepository } from './repositories/JobRepository';
import { WorkflowRepository } from './repositories/WorkflowRepository';
import { AssetRepository } from './repositories/AssetRepository';
import { PluginRepository } from './repositories/PluginRepository';
import { SettingsRepository } from './repositories/SettingsRepository';

export class DatabaseManager {
  private db: DatabaseConnection;
  private _jobs: JobRepository | null = null;
  private _workflows: WorkflowRepository | null = null;
  private _assets: AssetRepository | null = null;
  private _plugins: PluginRepository | null = null;
  private _settings: SettingsRepository | null = null;

  constructor(dbPath: string) {
    this.db = new DatabaseConnection(dbPath);
  }

  /**
   * Initialize the database and repositories
   */
  async initialize(): Promise<void> {
    await this.db.initialize();
  }

  /**
   * Get the jobs repository
   */
  get jobs(): JobRepository {
    if (!this._jobs) {
      this._jobs = new JobRepository(this.db);
    }
    return this._jobs;
  }

  /**
   * Get the workflows repository
   */
  get workflows(): WorkflowRepository {
    if (!this._workflows) {
      this._workflows = new WorkflowRepository(this.db);
    }
    return this._workflows;
  }

  /**
   * Get the assets repository
   */
  get assets(): AssetRepository {
    if (!this._assets) {
      this._assets = new AssetRepository(this.db);
    }
    return this._assets;
  }

  /**
   * Get the plugins repository
   */
  get plugins(): PluginRepository {
    if (!this._plugins) {
      this._plugins = new PluginRepository(this.db);
    }
    return this._plugins;
  }

  /**
   * Get the settings repository
   */
  get settings(): SettingsRepository {
    if (!this._settings) {
      this._settings = new SettingsRepository(this.db);
    }
    return this._settings;
  }

  /**
   * Close all connections
   */
  close(): void {
    this.db.close();
  }
}
