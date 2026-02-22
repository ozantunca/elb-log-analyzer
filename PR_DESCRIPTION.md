## Summary

Remediates minimatch ReDoS vulnerability (CVE-2026-26996).

### Vulnerability Overview

- **CVE:** CVE-2026-26996
- **Package:** minimatch (via glob)
- **Type:** Regular Expression Denial of Service (ReDoS)
- **Severity:** HIGH (CVSS 8.7)

The vulnerability occurs when glob patterns contain multiple consecutive `*` wildcards followed by a literal that doesn't match. This causes exponential backtracking—patterns with N≈15 `*` can take ~2 seconds per match; N≈34 can hang indefinitely.

**Impact:** `collectFileNames` passes user-supplied file paths/patterns to glob. Malicious patterns (e.g. `**********x`) could cause denial of service.

### Remediation

- Upgraded `glob` from `^8.0.3` to `^13.0.6` (uses patched minimatch 10.2.2)
- Updated `collectFileNames` to use glob v13 native promise API (v9+ removed callbacks)
- Added `skipLibCheck: true` for glob v13 type compatibility

**Result:** Direct runtime path `glob@13.0.6` → `minimatch@10.2.2` (patched). Dev dependencies (Jest, ESLint) still use vulnerable minimatch but do not affect production.
