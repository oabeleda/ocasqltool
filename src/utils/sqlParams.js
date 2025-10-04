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

// Replace parameters in SQL with their values
export const replaceParameters = (sql, paramValues) => {
    let result = sql;

    Object.entries(paramValues).forEach(([param, value]) => {
        // Replace all occurrences of :param with the value
        const regex = new RegExp(`:${param}\\b`, 'g');
        // If value is a number, use it directly; otherwise wrap in quotes
        const replacementValue = isNaN(value) ? `'${value}'` : value;
        result = result.replace(regex, replacementValue);
    });

    return result;
};
