#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const errors = [];

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

function parseJson(path) {
  try {
    return JSON.parse(read(path));
  } catch (error) {
    errors.push(`${path}: invalid JSON (${error.message})`);
    return {};
  }
}

const manifest = parseJson(".cursor-plugin/plugin.json");
const mcp = parseJson("mcp.json");
const development = parseJson("package.json");

if (!manifest.name) errors.push(".cursor-plugin/plugin.json: missing name");
if (!/^\d+\.\d+\.\d+$/.test(manifest.version ?? "")) {
  errors.push(".cursor-plugin/plugin.json: version must be semantic x.y.z");
}
if (manifest.mcpServers) {
  const paths = Array.isArray(manifest.mcpServers)
    ? manifest.mcpServers
    : [manifest.mcpServers];
  for (const path of paths.filter((value) => typeof value === "string")) {
    if (path.startsWith("/") || path.split("/").includes("..")) {
      errors.push(`manifest MCP path must stay inside plugin: ${path}`);
    } else if (!existsSync(join(root, path))) {
      errors.push(`manifest MCP path does not exist: ${path}`);
    }
  }
}
if (!mcp.mcpServers?.browserless?.url) {
  errors.push("mcp.json: missing browserless URL");
}
if (development.version !== manifest.version) {
  errors.push("package.json: version must match the plugin manifest");
}
if (!development.engines?.node) {
  errors.push("package.json: missing Node.js engine requirement");
}

const skillsRoot = join(root, "skills");
if (existsSync(skillsRoot)) {
  for (const entry of readdirSync(skillsRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const skillPath = join(skillsRoot, entry.name, "SKILL.md");
    if (!existsSync(skillPath)) {
      errors.push(`skills/${entry.name}: missing SKILL.md`);
      continue;
    }
    const content = readFileSync(skillPath, "utf8");
    const frontmatter = content.match(/^---\n([\s\S]*?)\n---\n/);
    if (!frontmatter) {
      errors.push(`skills/${entry.name}/SKILL.md: missing YAML frontmatter`);
      continue;
    }
    const name = frontmatter[1].match(/^name:\s*(.+)$/m)?.[1]?.trim();
    const description = frontmatter[1]
      .match(/^description:\s*(.+)$/m)?.[1]
      ?.trim();
    if (name !== entry.name) {
      errors.push(
        `skills/${entry.name}/SKILL.md: name must match directory`
      );
    }
    if (!description) {
      errors.push(`skills/${entry.name}/SKILL.md: missing description`);
    }
  }
}

function markdownFiles(directory = root) {
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === "node_modules") continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...markdownFiles(path));
    else if (entry.isFile() && entry.name.endsWith(".md")) files.push(path);
  }
  return files;
}

const linkPattern = /(?<!!)\[[^\]]+\]\(([^)]+)\)/g;
for (const file of markdownFiles()) {
  const content = readFileSync(file, "utf8");
  for (const match of content.matchAll(linkPattern)) {
    const target = match[1].split("#")[0];
    if (
      !target ||
      /^(https?:|cursor:|mailto:)/.test(target) ||
      target.includes("${")
    ) {
      continue;
    }
    const linkedPath = resolve(dirname(file), target);
    if (!existsSync(linkedPath)) {
      errors.push(
        `${relative(root, file)}: unresolved internal link ${match[1]}`
      );
    }
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("Repository validation passed.");
