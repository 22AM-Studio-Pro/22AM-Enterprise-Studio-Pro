# Architecture Overview

## System Design

```
┌─────────────────────────────────────────────────────────────┐
│                     Desktop Application                      │
│  (Asset Library | Pipeline Builder | Publishing Dashboard)  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Core Services                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │Asset Manager │  │Pipeline Eng. │  │Publishing Q. │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Integration Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ AI Providers │  │ Publishers   │  │ Workflow     │      │
│  │ (OpenAI,     │  │ (Facebook,   │  │ Engine       │      │
│  │  Gemini,     │  │  YouTube,    │  │              │      │
│  │  ElevenLabs) │  │  TikTok, etc)│  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Persistence Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Assets DB   │  │ Pipeline DB  │  │Publishing DB │      │
│  │  (SQLite)    │  │  (SQLite)    │  │  (SQLite)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                External Services                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ OpenAI API   │  │Social Media  │  │File Storage  │      │
│  │ Gemini API   │  │ (Facebook,   │  │(Local/Cloud) │      │
│  │ Speech API   │  │ YouTube, etc)│  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### Content Creation Pipeline
1. User creates content via Desktop UI
2. Content stages through Pipeline Engine
3. Each stage calls appropriate AI providers or processing components
4. Generated artifacts stored in Asset Manager
5. Final content enqueued for publishing

### Publishing Flow
1. Content added to Publishing Queue
2. Queue processes immediately or on schedule
3. Publisher interface routes to platform-specific implementation
4. Platform publisher authenticates and uploads
5. Platform ID stored and linked to asset
6. Analytics periodically fetched and stored
7. Dashboard displays real-time status

## Component Interaction

### AssetManager → PipelineEngine
- Pipeline stores generated artifacts in Asset Manager
- Lineage tracked: prompt → script → voice → images → video → final asset

### PipelineEngine → AI Providers
- Pipeline selects provider by capability
- Falls back to secondary provider if primary fails
- Token usage and metrics collected

### PublishingQueue → Publishers
- Queue dequeues jobs and invokes platform publisher
- Publisher handles OAuth, uploads, and metadata
- Failures recorded for retry scheduling

### Dashboard → All Components
- Dashboard aggregates metrics from all subsystems
- Real-time progress from ExecutionMonitor
- Analytics from PublishingDashboard and AnalyticsCollector

## Extensibility

### Adding a New AI Provider
1. Implement AIProvider interface
2. Register with AIProviderFactory
3. Pipeline automatically uses for matching capabilities

### Adding a New Publishing Platform
1. Implement Publisher interface (IPublisher)
2. Register with PublisherFactory
3. Dashboard automatically discovers and supports

### Adding a New Pipeline Stage
1. Create stage handler implementing PipelineStage interface
2. Register with PipelineRegistry
3. Use in pipeline definitions

## Performance Characteristics

### Asset Operations
- Create asset: O(1) - direct DB insert
- List assets: O(n) - full scan or indexed query
- Search assets: O(n) - LIKE scan or FTS
- Duplicate detection: O(1) - hash lookup
- Thumbnail generation: O(file_size) - I/O bound

### Pipeline Operations
- Validate pipeline: O(stages²) - dependency DAG traversal
- Execute pipeline: O(stages) - sequential
- Execute stage: O(1) - stage handler invocation

### Publishing Operations
- Enqueue: O(1)
- Dequeue: O(queue_size) - linear scan for ready items
- Update status: O(1)
- Query history: O(n) - filter scan

## Scalability Considerations

### Current Limitations
- Single process execution
- In-memory queue (no distributed queue)
- SQLite (single-writer)
- No horizontal scaling

### Production Scaling
- Move to distributed queue (RabbitMQ, AWS SQS)
- Use PostgreSQL or similar for concurrent access
- Implement message-driven architecture
- Add caching layer (Redis)
- Use job worker pool with load balancing
- Implement circuit breakers for external APIs
