/**
 * Cast a string value to a specified data type.
 *
 * @param {string} value - The value from the CSV cell.
 * @param {string} dataType - The desired data type ("string", "number", "boolean").
 * @returns {string|number|boolean|null} - The casted value.
 */
function castValue(value, dataType) {
  // Handle empty strings (you may want to convert them to null or keep them as empty string)
  if (value === "") {
    // For non-string typed, some prefer to set it to null. Adjust as needed:
    return dataType === "string" ? "" : null;
  }

  switch (dataType) {
    case "number":
      return Number(value);
    case "boolean":
      // Customize how you interpret "true"/"false". Here is a simple example:
      return ["true", "1", "yes", "on"].includes(value.toLowerCase());
    case "float":
      return parseFloat(value);
    default:
      // Default to returning the string as-is
      return value;
  }
}

module.exports = { castValue };
