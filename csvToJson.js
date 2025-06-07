const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");
const { castValue } = require("./castValue");

/**
 * Convert a CSV file to JSON with type enforcement based on a given schema.
 *
 * @param {string} csvFilePath - Path to the input CSV file.
 * @param {string} jsonFilePath - Path where the output JSON file will be written.
 * @param {Object} schema - { columnName: "string" | "number" | "float" | "boolean" }.
 * @param {Object} [options]
 * @param {string} [options.keyField] - If set, output is keyed by row[keyField] instead of an array.
 */
function csvToJson(csvFilePath, jsonFilePath, schema, options = {}) {
  const { keyField } = options;

  const fileContent = fs.readFileSync(csvFilePath, { encoding: "utf-8" });

  const records = parse(fileContent, {
    columns: true,
    trim: true,
    skip_empty_lines: true,
  });

  const rows = records.map((row) => {
    const converted = {};
    for (const colName in row) {
      converted[colName] = schema[colName]
        ? castValue(row[colName], schema[colName])
        : row[colName];
    }
    return converted;
  });

  let payload;
  if (keyField) {
    payload = {};
    for (const row of rows) {
      if (!row[keyField]) continue;
      payload[row[keyField]] = row;
    }
  } else {
    payload = rows;
  }

  const outputDir = path.dirname(jsonFilePath);
  if (outputDir && outputDir !== ".") {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(jsonFilePath, `${JSON.stringify(payload, null, 2)}\n`, "utf-8");
  console.log(`JSON file saved to ${jsonFilePath}`);
}

module.exports = { csvToJson };
