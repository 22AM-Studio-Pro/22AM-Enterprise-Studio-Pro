import crypto from 'crypto'

export class DuplicateDetector {
  detectBySHA256(filePath: string, fs: any): string {
    const content = fs.readFileSync(filePath)
    return crypto.createHash('sha256').update(content).digest('hex')
  }

  findDuplicate(checksum: string, repository: any): string | undefined {
    // Search for assets with the same checksum
    const stmt = (repository as any).db.prepare('SELECT id FROM assets WHERE checksum = ?')
    const row = stmt.get(checksum) as any
    return row ? row.id : undefined
  }
}
