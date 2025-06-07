# typed-ctj

Generic CLI that converts a CSV file into JSON using a typed schema you define. Each column gets cast to its declared type (`string`, `number`, `float`, `boolean`) so the output is ready to consume — no string-comparing booleans on the other side.

## Install

```bash
npm install
chmod +x convert.js
```

## Usage

```bash
./convert.js --input=<csv> --schema=<schema> [--output=<json>] [--key=<column>]
```

Flags:

- `-i, --input` Path to a CSV file. Required.
- `-s, --schema` Either a bare name (e.g. `hardware-specs.example` → `schemas/hardware-specs.example.json`) or a path to a JSON file. Required.
- `-o, --output` Path for the output JSON. Defaults to `output/<input-basename>.json`.
- `-k, --key` Column name. If set, the output is `{ row[key]: row, ... }` instead of an array. Rows with empty values for that column are skipped.
- `-h, --help` Print usage.

## Schema format

A schema is a JSON file mapping column names (exactly as they appear in the CSV header) to typed:

```json
{
  "id": "number",
  "model": "string",
  "clock_ghz": "float",
  "wifi": "boolean"
}
```

Supported typed:

- `string` — passed through.
- `number` — `Number(value)`.
- `float` — `parseFloat(value)`.
- `boolean` — true if the lowercased value is one of `true`, `1`, `yes`, `on`; otherwise false.

Empty cells become `null` for non-string typed and `""` for string columns. Columns not listed in the schema pass through as strings.

## Conventions

The repo provides three folders as a convention — none is required by the CLI:

- `input/` — drop your CSVs here.
- `output/` — generated JSONs land here.
- `schemas/` — your schema files live here.

Pass any path you like; nothing forces you into these folders.

User data is gitignored so the repo stays clean. The only files committed under `input/` and `schemas/` are the public examples (`*.example.csv`, `*.example.json`). To make your own schema, copy `schemas/hardware-specs.example.json` to `schemas/<your-name>.json` and edit it — your copy will not show up in git.

## Example

Convert the bundled hardware-specs example to an array of typed objects:

```bash
./convert.js \
  --input=input/hardware-specs.example.csv \
  --schema=hardware-specs.example
# → output/hardware-specs.example.json
```

Or produce a JSON object keyed by `id`:

```bash
./convert.js \
  --input=input/hardware-specs.example.csv \
  --schema=hardware-specs.example \
  --key=id \
  --output=output/by-id.json
```

You can also install globally and run as `typed-ctj`:

```bash
npm install -g .
typed-ctj --input=foo.csv --schema=foo
```
