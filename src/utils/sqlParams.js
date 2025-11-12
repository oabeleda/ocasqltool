// Extract parameters from SQL query (identified by :paramName)
export const extractParameters = (sql) => {
    // Match :paramName patterns (word characters after colon)
    const regex = /:(\w+)/g;
    const params = new Set();
    let match;

    while ((match = regex.exec(sql)) !== null) {
        params.add(match[1]);
    }

    return Array.from(params);
};

// Validate that all parameters in SQL have values and vice versa
export const validateParameters = (sql, paramValues) => {
    const sqlParams = new Set(extractParameters(sql));
    const providedParams = new Set(Object.keys(paramValues));

    const missing = [...sqlParams].filter(p => !providedParams.has(p));
    const extra = [...providedParams].filter(p => !sqlParams.has(p));

    return {
        valid: missing.length === 0,
        missing,
        extra
    };
};

// Escape single quotes in SQL string values to prevent SQL injection
const escapeSqlString = (value) => {
    return value.replace(/'/g, "''");
};

// Replace parameters in SQL with their values
export const replaceParameters = (sql, paramValues) => {
    let result = sql;

    Object.entries(paramValues).forEach(([param, valueObj]) => {
        // Replace all occurrences of :param with the value
        const regex = new RegExp(`:${param}\\b`, 'g');

        let replacementValue;

        // Handle object format with type and value
        if (valueObj && typeof valueObj === 'object' && 'type' in valueObj) {
            const { type, value } = valueObj;

            if (type === 'null' || value === null || value === undefined) {
                replacementValue = 'NULL';
            } else if (type === 'number') {
                // Parse as number, use NULL if invalid
                const numValue = parseFloat(value);
                replacementValue = isNaN(numValue) ? 'NULL' : numValue;
            } else {
                // String type - escape and wrap in quotes
                const strValue = String(value);
                replacementValue = `'${escapeSqlString(strValue)}'`;
            }
        } else {
            // Backward compatibility: handle legacy string/number values
            const value = valueObj;

            if (value === null || value === undefined || value === '') {
                replacementValue = 'NULL';
            } else if (!isNaN(value) && value !== '') {
                replacementValue = value;
            } else {
                // String value - escape and wrap in quotes
                replacementValue = `'${escapeSqlString(String(value))}'`;
            }
        }

        result = result.replace(regex, replacementValue);
    });

    return result;
};
