# Agents

## Cursor Cloud specific instructions

**elb-log-analyzer** is a Node.js CLI tool and library for analyzing AWS ELB/ALB access log files. It is a single-package TypeScript project (not a monorepo) with no external service dependencies.

### Key commands

All standard dev commands are in `package.json` scripts:

| Task | Command |
|------|---------|
| Install deps | `npm install` |
| Lint | `npm run lint` |
| Build | `npm run build` |
| Test (lint+build+jest) | `npm test` |
| Run CLI | `node dist/cli.js <path-to-logs>` |

### Non-obvious notes

- **Build before test**: Tests import from `dist/`, so `npm run build` must succeed before `npx jest`. The `npm test` script chains lint → build → jest automatically.
- **Sample logs**: The `logs/` directory and `test/fixtures/` contain sample ELB log files used by the test suite. Do not remove them.
- **Node version**: Requires Node.js >= 20 (`engines` field in `package.json`). CI uses Node 24.x.
- **No `.nvmrc`**: There is no `.nvmrc` or `.tool-versions` file; the environment just needs any Node >= 20.
