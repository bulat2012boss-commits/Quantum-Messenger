// simple-json-fix.js - Простой фикс JSON ошибок

// Самая простая защита JSON.parse
const originalJSONParse = JSON.parse;
JSON.parse = function(text, reviver) {
    if (text === undefined || text === null || text === 'undefined' || text === 'null') {
        return null;
    }
    try {
        return originalJSONParse.call(this, text, reviver);
    } catch (e) {
        return null;
    }
};

// Защита localStorage
const originalGetItem = localStorage.getItem;
localStorage.getItem = function(key) {
    try {
        const value = originalGetItem.call(this, key);
        return value === 'undefined' ? null : value;
    } catch (e) {
        return null;
    }
};

console.log('✅ Simple JSON fix applied');