#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { parseArgs } = require("node:util");
const { csvToJson } = require("./csvToJson");

const USAGE = `
typed-ctj — convert a CSV to JSON using a typed schema

Usage:
  ./convert.js --input=<csv> --schema=<schema> [--output=<json>] [--key=<column>]

Options:
  -i, --input    Path to the input CSV file (required)
  -s, --schema   Schema name (e.g. "hardware-specs" → schemas/hardware-specs.json) or path to a JSON file (required)
  -o, --output   Path to the output JSON file (default: output/<input-basename>.json)
  -k, --key      Optional column. If set, output is { row[key]: row } instead of an array.
  -h, --help     Show this help message

Schema format:
  A JSON object mapping column names to typed: "string" | "number" | "float" | "boolean".
  Columns not listed in the schema are passed through as strings.
`.trim();

const ALLOWED_typed = new Set(["string", "number", "float", "boolean"]);

function fail(message) {
  console.error(`Error: ${message}\n`);
  console.error(USAGE);
  process.exit(1);
}

function resolveSchemaPath(arg) {
  if (arg.includes("/") || arg.includes("\\")) return arg;
  if (arg.endsWith(".json")) return path.join("schemas", arg);
  return path.join("schemas", `${arg}.json`);
}

let parsed;
try {
  parsed = parseArgs({
    options: {
      input: { type: "string", short: "i" },
      schema: { type: "string", short: "s" },
      output: { type: "string", short: "o" },
      key: { type: "string", short: "k" },
      help: { type: "boolean", short: "h" },
    },
    strict: true,
  });
} catch (err) {
  fail(err.message);
}

const { values } = parsed;

if (values.help) {
  console.log(USAGE);
  process.exit(0);
}

if (!values.input) fail("--input is required");
if (!values.schema) fail("--schema is required");

const inputPath = values.input;
if (!fs.existsSync(inputPath)) fail(`input file not found: ${inputPath}`);
if (path.extname(inputPath).toLowerCase() === ".json") {
  fail(
    `--input expects a CSV file but got ${inputPath} (.json). Point --input at the source CSV; --schema is the JSON file.`,
  );
}

const schemaPath = resolveSchemaPath(values.schema);
if (!fs.existsSync(schemaPath)) fail(`schema file not found: ${schemaPath}`);

let schema;
try {
  schema = JSON.parse(fs.readFileSync(schemaPath, "utf-8"));
} catch (err) {
  fail(`could not parse schema ${schemaPath}: ${err.message}`);
}

if (schema === null || typeof schema !== "object" || Array.isArray(schema)) {
  fail(
    `schema ${schemaPath} must be a JSON object mapping column names to typed`,
  );
}

for (const [col, type] of Object.entries(schema)) {
  if (!ALLOWED_typed.has(type)) {
    fail(
      `schema ${schemaPath}: column "${col}" has unsupported type "${type}". Allowed: ${[...ALLOWED_typed].join(", ")}`,
    );
  }
}

const outputPath =
  values.output ??
  path.join(
    "output",
    `${path.basename(inputPath, path.extname(inputPath))}.json`,
  );

try {
  csvToJson(inputPath, outputPath, schema, { keyField: values.key });
} catch (err) {
  fail(err.message);
}
