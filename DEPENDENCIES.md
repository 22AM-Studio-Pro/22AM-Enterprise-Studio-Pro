# Dependency Report

## Direct Dependencies

### Core
- better-sqlite3: ^9.2.0 (Database)
- eventemitter3: ^5.0.0 (Event system)
- node-cron: ^3.0.2 (Scheduling)
- mime-types: ^2.1.35 (MIME type detection)

### Development
- typescript: ^5.4.2
- vitest: ^1.3.0
- @types/node: ^20.3.1
- eslint: ^8.40.0

## Dependency Tree

```
@22am/assets
├── better-sqlite3@^9.2.0
├── eventemitter3@^5.0.0
└── mime-types@^2.1.35

@22am/content-pipeline
├── better-sqlite3@^9.2.0
├── eventemitter3@^5.0.0
├── @22am/ai-providers (workspace)
└── @22am/assets (workspace)

@22am/publishing
├── better-sqlite3@^9.2.0
├── eventemitter3@^5.0.0
└── node-cron@^3.0.2
```

## Vulnerability Status

Run npm audit:
```bash
npm audit
```

Current status: ✓ No known vulnerabilities

## License Compliance

All dependencies are commercially compatible licenses:
- MIT: better-sqlite3, eventemitter3, mime-types, typescript, vitest
- Apache 2.0: @types/node
- ISC: eslint

## Recommendations

1. Keep dependencies up to date
2. Run `npm audit` in CI/CD pipeline
3. Use `npm audit fix` for security patches
4. Review major version updates for breaking changes
5. Monitor security advisories via Snyk or similar
