// End-to-End Test Configuration
export const E2E_TEST_CONFIG = {
  timeouts: {
    short: 5000,
    medium: 15000,
    long: 60000
  },
  retries: {
    default: 3,
    database: 5
  },
  mock: {
    aiProvider: {
      enabled: true,
      responseTime: 100 // ms
    },
    publishingProvider: {
      enabled: true,
      responseTime: 50 // ms
    },
    assetStorage: {
      enabled: true,
      path: './test/assets'
    }
  }
}

export const createMockWorkflow = () => ({
  id: `test-wf-${Date.now()}`,
  name: 'Test Workflow',
  description: 'Auto-generated test workflow',
  nodes: [
    { id: 'n1', type: 'input', label: 'Input', position: { x: 0, y: 0 }, data: { prompt: 'Test prompt' } },
    { id: 'n2', type: 'ai', label: 'Generate', position: { x: 100, y: 0 }, data: { model: 'gpt-4' } },
    { id: 'n3', type: 'asset', label: 'Store', position: { x: 200, y: 0 }, data: {} },
    { id: 'n4', type: 'publishing', label: 'Publish', position: { x: 300, y: 0 }, data: { platforms: ['twitter'] } }
  ],
  edges: [
    { id: 'e1', source: 'n1', target: 'n2' },
    { id: 'e2', source: 'n2', target: 'n3' },
    { id: 'e3', source: 'n3', target: 'n4' }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
})

export const createMockAIProvider = () => ({
  generateText: async (prompt: string) => `Mock response to: ${prompt}`,
  generateImage: async (prompt: string) => `data:image/png;base64,mock`,
  generateVoice: async (text: string) => new Uint8Array()
})

export const createMockPublishingProvider = () => ({
  publish: async (content: string, platform: string) => ({
    platform,
    postId: `mock-post-${Date.now()}`,
    url: `https://${platform}.com/mock-post`,
    timestamp: new Date().toISOString()
  })
})
