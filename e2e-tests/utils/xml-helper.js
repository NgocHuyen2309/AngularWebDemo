const { XMLParser } = require('fast-xml-parser');

function parseXml(xmlText) {
  if (!xmlText || typeof xmlText !== 'string') {
    throw new Error('XML content must be a non-empty string');
  }
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_"
  });
  return parser.parse(xmlText);
}

module.exports = {
  parseXml
};
