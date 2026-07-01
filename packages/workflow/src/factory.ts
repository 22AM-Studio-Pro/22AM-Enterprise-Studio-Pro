import { WorkflowEngine, TaskHandler } from './engine'
import * as handlers from './handlers'

export function createEngine(dbPath?: string, maxConcurrent = 2) {
  const eng = new WorkflowEngine(dbPath, { maxConcurrent })
  // register example handlers
  eng.registerTask('echo', handlers.echo as TaskHandler)
  eng.registerTask('delay', handlers.delayHandler as TaskHandler)
  eng.registerTask('fileRead', handlers.fileRead as TaskHandler)
  eng.registerTask('fileWrite', handlers.fileWrite as TaskHandler)
  eng.registerTask('httpRequest', handlers.httpRequestMock as TaskHandler)
  return eng
}
