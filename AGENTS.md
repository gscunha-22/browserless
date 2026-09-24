# Repository guidance

This repository packages the hosted Browserless MCP endpoint for agent
clients. It does not contain the Browserless server implementation.

## Source of truth

- `.cursor-plugin/plugin.json`: Cursor plugin metadata.
- `mcp.json`: shipped remote MCP configuration.
- Live MCP `tools/list`: authoritative tool schemas.
- `docs/tools.md`: readable snapshot of those schemas.
- `skills/`: portable Agent Skills shipped with the plugin.

## Change rules

- Keep the plugin focused on Browserless MCP.
- Keep all manifest paths relative and inside the repository.
- Every skill must live at `skills/<name>/SKILL.md`; its YAML `name` must match
  the directory and its `description` must say when to use it.
- Never commit API tokens, OAuth credentials, cookies, profiles, replays, or
  scraped private content.
- Prefer OAuth in user-facing setup. Use environment-backed Bearer tokens only
  as a fallback.
- When the live server changes, update `docs/tools.md`, README claims,
  examples, and the changelog together.
- Do not claim live compatibility unless it was tested; state the client,
  version, date, and authentication method.

## Verification

Run local checks:

```bash
node --check scripts/verify-mcp.mjs
node --check scripts/build-deeplinks.mjs
node --check scripts/validate-repo.mjs
node scripts/validate-repo.mjs
node scripts/build-deeplinks.mjs
```

With a test account:

```bash
BROWSERLESS_TOKEN=... node scripts/verify-mcp.mjs --json
BROWSERLESS_TOKEN=... node scripts/verify-mcp.mjs --exec
```

The first live command verifies discovery; the second consumes Browserless
units and must only be run when an execution test is intended.
