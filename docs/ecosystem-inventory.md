# Browserless agent ecosystem inventory

Snapshot date: 2026-09-24

This document distinguishes what is shipped by this repository, what is
provided by the hosted Browserless MCP server, and what is merely a useful
adjacent integration. That boundary matters: this repository configures the
client experience, but it does not contain the Browserless server
implementation.

## Executive conclusions

1. **The durable product asset is the remote MCP endpoint.** The same
   `https://mcp.browserless.io/mcp` endpoint can serve Cursor, ChatGPT/Codex,
   Claude, and any client that supports remote Streamable HTTP MCP.
2. **The repository was Cursor-first, not inherently Cursor-only.** The
   manifest is Cursor-specific, while the endpoint, tool schemas, examples,
   and the Agent Skill format are portable.
3. **The highest-value capability is orchestration, not raw scraping.**
   `browserless_agent` plus `browserless_skill` covers stateful, authenticated,
   multi-step browser work; the one-shot tools remain cheaper and simpler when
   interaction is unnecessary.
4. **The safest default is progressive escalation:** search/map, then scrape,
   then crawl, and only then use an interactive agent or arbitrary Puppeteer
   code.
5. **Authentication is the main adoption boundary.** Marketplace installs use
   OAuth; manual clients can use OAuth discovery where supported or a Bearer
   token supplied outside version control.
6. **Documentation drift is the main maintenance risk.** Tool schemas come
   from the live server and can change independently of this repository.
   `tools/list` is authoritative; the checked-in list is a readable snapshot.

## Repository inventory

| Artifact | Purpose | Reuse value |
|---|---|---|
| `.cursor-plugin/plugin.json` | Cursor Marketplace metadata and component discovery | Cursor distribution |
| `mcp.json` | Remote MCP endpoint without embedded credentials | Reusable MCP connection definition |
| `README.md` | Product overview, install path, safety boundary, examples | Main entry point |
| `docs/install-cursor.md` | Cursor Marketplace and manual setup | Cursor onboarding |
| `docs/install-openai-claude.md` | ChatGPT, Codex, Claude, and Claude Code setup | Cross-client onboarding |
| `docs/auth.md` | OAuth and Bearer-token behavior | Security and operations |
| `docs/tools.md` | Human-readable tool and resource catalog | Prompt design and discovery |
| `docs/ecosystem-inventory.md` | Architecture, capability, skill, and opportunity inventory | Product planning |
| `examples/agent-research.md` | Stateful research workflow | Reusable prompt pattern |
| `examples/scrape-pricing.md` | One-shot extraction workflow | Reusable prompt pattern |
| `skills/browserless-web-research/SKILL.md` | Portable Agent Skill for routing and safe execution | Cursor, Claude, Codex, and compatible agents |
| `scripts/verify-mcp.mjs` | MCP initialize/list/optional execution smoke test | Release verification |
| `scripts/build-deeplinks.mjs` | Deterministic Cursor deeplink generator | Documentation maintenance |
| `scripts/validate-repo.mjs` | Dependency-free manifest, skill, and link checks | Local and CI quality gate |
| `.github/workflows/validate.yml` | Runs syntax and repository validation on pushes and pull requests | Continuous verification |
| `AGENTS.md` | Repository instructions for Codex and compatible coding agents | Consistent maintenance |
| `CLAUDE.md` | Claude Code entry point | Consistent maintenance |
| `assets/logo.svg` | Marketplace identity | Distribution |
| `.gitignore` | Excludes dependencies, logs, and local environment files | Secret and workspace hygiene |
| `LICENSE` | MIT terms for repository content | Reuse and distribution |

There is no application runtime, package manifest, test framework, CI workflow,
or server source in this repository. The two Node scripts intentionally rely
only on built-in Node APIs.

## Hosted MCP capability inventory

The live server is authoritative. Run
`BROWSERLESS_TOKEN=... node scripts/verify-mcp.mjs --json` to refresh the
observed schemas.

### Content acquisition

| Tool | Best use | Avoid when |
|---|---|---|
| `browserless_smartscraper` | One known URL; markdown, HTML, links, screenshot, or PDF | A whole site or multi-step UI is required |
| `browserless_map` | Discover and rank URLs before selecting pages | Page content itself is needed |
| `browserless_crawl` | Bounded multi-page collection | One page or an unbounded domain would suffice |
| `browserless_export` | Native HTML/PDF/image or offline ZIP with assets | Structured text extraction is the goal |
| `browserless_function` | Custom Puppeteer logic with typed output | A purpose-built tool can do the job |

### Search and interaction

| Tool | Best use | Important control |
|---|---|---|
| `browserless_search` | Web/news/image discovery with geo and time filters | Preserve source URLs for evidence |
| `browserless_agent` | Stateful navigation, forms, authenticated workflows, dynamic UIs | Snapshot before acting, restrict domains, close the session |
| `browserless_skill` | Load Browserless recipes and interaction guidance on demand | Load only the relevant recipe |

### Audit and operations

| Tool | Best use | Mutation risk |
|---|---|---|
| `browserless_performance` | Lighthouse accessibility, performance, SEO, PWA, and budget checks | Read-only audit |
| `browserless_account` | Plan, balance, billing period, key names | Read-only |
| `browserless_usage` | Consumption, errors, queueing, concurrency, proxy usage | Read-only |
| `browserless_logs` | Diagnose server-side request failures | Read-only; logs may contain sensitive URLs |
| `browserless_sessions` | Inspect active/persistent sessions, replays, integrations | Read-only; replays can contain sensitive UI state |
| `browserless_profiles` | List saved profile names and metadata | Read-only; profile names still reveal context |

### MCP resources

| URI | Value |
|---|---|
| `browserless://status` | Current service status in JSON |
| `browserless://api-docs` | Server-provided API documentation in Markdown |

## Browserless runtime skill inventory

These are remote, on-demand recipes exposed through `browserless_skill`; they
are not files shipped by this repository.

| Skill | Useful for |
|---|---|
| `shadow-dom` | Finding and operating elements inside shadow roots |
| `cookie-consent` | Handling consent banners before extraction |
| `modals` | Dismissing or navigating obstructive dialogs |
| `snapshot-misses` | Recovering when the accessibility snapshot omits a target |
| `dynamic-content` | Waiting for or revealing asynchronously loaded content |
| `screenshots` | Capturing useful visual evidence |
| `vision-fallback` | Using visual inspection when semantic selectors fail |
| `tabs` | Managing multi-tab workflows |
| `autonomous-login` | Assisted sign-in flows |
| `captchas` | Handling supported anti-bot challenges |
| `file-transfers` | Upload and download workflows |
| Site recipes | Host-specific interaction sequences discovered with `{ site: "<host>" }` |

The checked-in `browserless-web-research` skill complements these runtime
skills. It teaches a client how to choose tools, preserve evidence, and apply
safety controls; it does not duplicate site recipes.

## Cross-agent portability

| Surface | MCP connection | Reusable instructions |
|---|---|---|
| Cursor | Marketplace plugin or `mcp.json` | Plugin `skills/` directory |
| ChatGPT | Custom MCP app/connector in Developer Mode | Package as an app/plugin where supported |
| Codex CLI/IDE | `~/.codex/config.toml` or `codex mcp add` | `.agents/skills/` and `AGENTS.md` |
| Claude web/Desktop | Custom remote connector | Connector plus account/workspace instructions |
| Claude Code | `claude mcp add --transport http` or `.mcp.json` | Plugin `skills/`, `.claude/skills/`, and `CLAUDE.md` |
| Other MCP clients | Remote Streamable HTTP configuration | Open Agent Skills `SKILL.md` where supported |

See [install-openai-claude.md](install-openai-claude.md) for concrete setup
commands and current plan/surface caveats.

## Complementary development toolbox

These are useful alongside Browserless, but are not repository dependencies
and should not be bundled without a concrete product need.

| Category | Candidate tools | Contribution |
|---|---|---|
| Web-data redundancy | Bright Data, Firecrawl, Context, Apify | Alternative extraction, structured platform data, monitoring, and batch work |
| Agent standards | Agent Skills, MCP Inspector/client tests | Portable workflows and protocol-level validation |
| Model clients | Cursor, Codex/OpenAI, Claude | Cross-model testing of tool descriptions and approval behavior |
| Deployment | Netlify or Vercel functions/edge runtimes | Host companion APIs, callbacks, or UI; not needed for this remote server plugin |
| Data | Postgres via Netlify Database, Neon, or Supabase | Persist structured results, jobs, and audit metadata |
| Observability | Browserless logs plus Grafana | Correlate client failures, server requests, latency, and cost |
| Collaboration | GitHub, Slack, Gmail/Outlook, task systems | Deliver reports and trigger workflows after explicit user approval |

Use one provider per role until reliability or coverage proves a need for a
second. Multiple scraping backends increase cost, policy surface, and routing
complexity.

### Repository-relevant agent skills

The current development environment also exposes reusable skills that can
accelerate this plugin. They are external capabilities, not bundled
dependencies:

| Skill family | Use in this project |
|---|---|
| Plugin scaffold and submission review | Validate manifest shape, component paths, metadata, scope, and Marketplace readiness |
| Browserless web research | Route acquisition and interaction through the shipped MCP tools |
| Bright Data search/scrape/browser | Independent fallback or comparative extraction testing |
| Firecrawl search/scrape/crawl/parse | Alternative crawl and structured extraction experiments |
| Context search/scrape/extract/monitor | Web intelligence, parsing, and change-monitoring experiments |
| Apify actor development and integration | Package repeatable scraping workloads when an Actor is the required delivery unit |
| Netlify/Vercel deployment skills | Build companion APIs or UIs only when the product expands beyond an MCP configuration plugin |
| Supabase/Neon database skills | Add structured persistence only for concrete history, job, or audit requirements |
| Grafana observability skills | Instrument operational dashboards when request telemetry becomes available |
| Documentation and review skills | Produce durable architecture docs and focused PR reviews |

The repository should adopt an external skill only when its workflow repeats
or becomes a release gate. Copying every available skill into the plugin would
inflate discovery context and blur the product boundary.

## Recommended roadmap

### P0 — maintain correctness

- Run `node scripts/validate-repo.mjs` and syntax checks on every change; CI
  now enforces both.
- Run `verify-mcp.mjs --json` before releases when credentials are available.
- Compare the live tool/resource list with `docs/tools.md`; update docs and
  examples together.
- Never commit tokens, generated session data, replays, or scraped private
  content.

### P1 — prove portability

- Smoke-test OAuth and tool discovery in Cursor, ChatGPT, Codex, Claude, and
  Claude Code.
- Record client/version/date and whether OAuth discovery, tool approvals,
  resources, screenshots, PDFs, and long-running calls work.
- Add CI for syntax, JSON parsing, internal Markdown links, and secret scans.

### P2 — improve agent outcomes

- Add task-focused skills only after a workflow repeats: competitive research,
  accessibility audits, authenticated QA, and monitored extraction are strong
  candidates.
- Add structured output examples and evaluation fixtures for tool-routing
  decisions.
- Define cost/latency budgets that prefer map/search/scrape over agent/function.

### P3 — product integrations

- Persist scheduled research or audit results only when a real workflow needs
  history.
- Add observability dashboards keyed by request ID, tool, outcome, duration,
  and units.
- Introduce notifications or write actions only with explicit approval,
  scoped credentials, idempotency, and audit logs.

## Evidence and limitations

- Repository claims were checked against every tracked non-Git file present on
  the snapshot date.
- Live tool discovery and execution require `BROWSERLESS_TOKEN`; without it,
  the checked-in documentation cannot prove the current server version.
- Client features and plan availability change independently. Re-check the
  linked official sources before release:
  - [Cursor Agent Skills](https://cursor.com/docs/skills)
  - [Cursor Plugins reference](https://cursor.com/docs/reference/plugins)
  - [OpenAI Codex MCP](https://developers.openai.com/codex/mcp)
  - [OpenAI Codex Agent Skills](https://developers.openai.com/codex/skills)
  - [ChatGPT Developer Mode and MCP apps](https://help.openai.com/en/articles/12584461)
  - [Claude Code MCP](https://docs.anthropic.com/en/docs/claude-code/mcp)
  - [Claude Code skills](https://docs.anthropic.com/en/docs/claude-code/skills)
  - [Claude custom remote connectors](https://support.anthropic.com/en/articles/11175166-getting-started-with-custom-connectors-using-remote-mcp)
  - [Agent Skills specification](https://agentskills.io/specification)
