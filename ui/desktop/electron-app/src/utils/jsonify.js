// Convert to json
const jsonify = (data) => {
  if (typeof data !== 'string') data = JSON.stringify(data);
  try {
    return JSON.parse(data);
  } catch (e) {
    // Ignore parse errors
  }
};

module.exports = jsonify;
