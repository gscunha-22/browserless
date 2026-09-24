# Use Browserless with OpenAI and Claude

The hosted Browserless endpoint uses remote Streamable HTTP MCP:

```text
https://mcp.browserless.io/mcp
```

Prefer OAuth when the client offers an interactive sign-in. For clients that
require a token, keep `BROWSERLESS_TOKEN` in the environment or the client's
secret store. Never commit a token.

## ChatGPT

ChatGPT exposes remote MCP servers as custom apps/connectors. Availability and
write permissions depend on the current plan and workspace policy.

1. Enable Developer Mode if your plan and role require it.
2. Open the Apps/Connectors settings and add a custom MCP app.
3. Use `https://mcp.browserless.io/mcp` as the server URL.
4. Complete OAuth, review the discovered tools, and keep only the permissions
   needed by the workflow.
5. Test with a read-only prompt:

   > Use Browserless to fetch `https://example.com` as markdown and cite the
   > source URL.

Workspace owners/admins may need to review and publish the app before other
members can use it. Consult [Developer mode and MCP apps in
ChatGPT](https://help.openai.com/en/articles/12584461) because plan controls
change independently of this repository.

## Codex CLI and IDE

### OAuth

```bash
codex mcp add browserless --url https://mcp.browserless.io/mcp
codex mcp login browserless
```

### Bearer token

```bash
export BROWSERLESS_TOKEN="..."
codex mcp add browserless \
  --url https://mcp.browserless.io/mcp \
  --bearer-token-env-var BROWSERLESS_TOKEN
```

Equivalent `~/.codex/config.toml`:

```toml
[mcp_servers.browserless]
url = "https://mcp.browserless.io/mcp"
bearer_token_env_var = "BROWSERLESS_TOKEN"
```

Codex discovers repository skills under `.agents/skills/`. The skill shipped
in `skills/browserless-web-research/` can be copied there for direct
repository use, or distributed with this plugin where Agent Plugin support is
available.

Official references:

- [Codex MCP](https://developers.openai.com/codex/mcp)
- [Codex Agent Skills](https://developers.openai.com/codex/skills)
- [Codex `AGENTS.md`](https://developers.openai.com/codex/guides/agents-md)

## Claude web and Desktop

1. Open **Customize → Connectors**.
2. Select **Add custom connector**.
3. Enter a name and `https://mcp.browserless.io/mcp`.
4. Complete OAuth and review the tools before enabling the connector.

Remote connectors are reached from Anthropic's cloud even when the user is in
Claude Desktop. Browserless is already public HTTPS, so a local tunnel is not
required.

See [Claude custom remote
connectors](https://support.anthropic.com/en/articles/11175166-getting-started-with-custom-connectors-using-remote-mcp)
for current plan, role, and network requirements.

## Claude Code

### OAuth

```bash
claude mcp add --transport http browserless https://mcp.browserless.io/mcp
```

Claude Code starts the OAuth flow when the server is first used. Check the
connection with:

```bash
claude mcp list
```

### Bearer token

Avoid writing a literal token into shell history. If a non-OAuth setup is
required, generate the configuration from a secure local secret mechanism
rather than committing `.mcp.json`.

The underlying JSON shape is:

```json
{
  "mcpServers": {
    "browserless": {
      "type": "http",
      "url": "https://mcp.browserless.io/mcp",
      "headers": {
        "Authorization": "Bearer ${BROWSERLESS_TOKEN}"
      }
    }
  }
}
```

Confirm how the installed Claude Code version expands environment variables
before relying on the placeholder. The CLI's OAuth path is safer and simpler.

Claude Code can load plugin skills from `skills/` and project skills from
`.claude/skills/`. See [Claude Code
MCP](https://docs.anthropic.com/en/docs/claude-code/mcp) and [Claude Code
skills](https://docs.anthropic.com/en/docs/claude-code/skills).

## Verification matrix

Run the smallest useful check on each client:

| Check | Expected result |
|---|---|
| Authentication | OAuth consent completes or Bearer token is accepted |
| Discovery | 14 tools are visible in the documented snapshot |
| Read-only call | `browserless_smartscraper` returns example.com content |
| Stateful call | Agent can `goto`, `snapshot`, and `close` |
| Resource support | Client can read `browserless://status`, if it exposes MCP resources |
| Safety | Client asks before consequential interaction or arbitrary code |

The tool count is a snapshot, not a protocol invariant. If discovery differs,
capture `tools/list` with `scripts/verify-mcp.mjs --json` and update
`docs/tools.md` before assuming the server is broken.
