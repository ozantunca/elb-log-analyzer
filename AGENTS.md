# AGENTS.md

## Cursor Cloud specific instructions

This is a **Node.js CLI tool** (`elb-log-analyzer`) that parses AWS Elastic Load Balancer access logs and outputs statistics. There are no external services, databases, or Docker containers required.

### Key commands

All standard commands are in `package.json` scripts:

| Action | Command |
|--------|---------|
| Install deps | `npm install` |
| Lint | `npm run lint` |
| Build | `npm run build` |
| Test (lint + build + jest) | `npm test` |
| Run CLI | `node dist/cli.js logs/` |

### Non-obvious notes

- **Build before test or run**: The project compiles TypeScript to `dist/`. You must run `npm run build` before using the CLI (`node dist/cli.js`). The `npm test` script already includes lint + build + jest in sequence.
- **`.npmrc` auth token**: The `.npmrc` references `${NPM_TOKEN}` for publishing to npm. This does not affect `npm install` for development — it only matters for `npm publish`. You can safely ignore warnings about it.
- **Sample logs**: The `logs/` directory contains sample ELB log files used by both tests and for manual CLI testing.
- **Jest config**: Jest is configured with `ts-jest` preset and `rootDir: "test"` in `package.json`. Tests run against compiled output in `dist/`.
- **Node.js version**: Requires Node.js >= 20 (see `engines` in `package.json`).
