import { describe, it, expect } from 'vitest'
import { ExecutionLogger } from '../src/ExecutionLogger'

describe('ExecutionLogger', () => {
  it('logs and retrieves execution logs', () => {
    const logger = new ExecutionLogger()
    logger.log('exec-1', 'info', 'Stage started', 'stage1')
    logger.log('exec-1', 'error', 'Stage failed', 'stage1')
    const logs = logger.getExecutionLogs('exec-1')
    expect(logs.length).toBe(2)
    expect(logs[0].message).toBe('Stage started')
  })

  it('filters logs by level', () => {
    const logger = new ExecutionLogger()
    logger.log('exec-1', 'info', 'Info message', 'stage1')
    logger.log('exec-1', 'error', 'Error message', 'stage1')
    const errors = logger.getExecutionLogs('exec-1', 'error')
    expect(errors.length).toBe(1)
    expect(errors[0].level).toBe('error')
  })
})
