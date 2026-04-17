/**
 * Configuration Manager
 * Updates environment variables based on UI configuration input
 */

function updateConfig(configData) {
    Object.keys(configData).forEach(key => {
        // Convert string 'true'/'false' to actual booleans where needed
        let value = configData[key];

        if (value === 'true') {
            value = true;
        } else if (value === 'false') {
            value = false;
        }

        // Set to process.env with string values
        process.env[key] = String(value);
    });
}

module.exports = { updateConfig };
