const { XMLParser, XMLValidator } = require('fast-xml-parser');

const SOAP_FAULT_TEMPLATE = (code, string, detail) => `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
  <soapenv:Body>
    <soapenv:Fault>
      <faultcode>${code}</faultcode>
      <faultstring>${string}</faultstring>
      <detail>${detail || ''}</detail>
    </soapenv:Fault>
  </soapenv:Body>
</soapenv:Envelope>`;

const SOAP_RESPONSE_TEMPLATE = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:web="http://tempuri.org/">
  <soapenv:Body>
    <web:GetProjectInfoResponse>
      <web:Status>Active</web:Status>
      <web:Version>1.0.0</web:Version>
      <web:Milestones>10</web:Milestones>
    </web:GetProjectInfoResponse>
  </soapenv:Body>
</soapenv:Envelope>`;

exports.handleSoapRequest = (req, res) => {
  res.setHeader('Content-Type', 'text/xml');

  // 1. SOAP Request body checks
  if (typeof req.body !== 'string' || !req.body.trim()) {
    return res.status(500).send(SOAP_FAULT_TEMPLATE('Client.MalformedXML', 'Request body is empty'));
  }

  const rawBody = req.body;

  // 2. SOAP Request body payload size exceeds threshold limit (e.g. 50KB)
  if (Buffer.byteLength(rawBody) > 50000) {
    return res.status(500).send(SOAP_FAULT_TEMPLATE('Client.PayloadTooLarge', 'Payload size exceeds limit of 50KB'));
  }

  // 3. SOAP XSS sanitization: case-insensitive, onerror, onload, script, etc.
  const lowercaseBody = rawBody.toLowerCase();
  const hasXSS = /<script/i.test(rawBody) ||
                 /javascript:/i.test(rawBody) ||
                 /onerror/i.test(rawBody) ||
                 /onload/i.test(rawBody) ||
                 /\bon[a-z]+\s*=/i.test(rawBody);
  if (hasXSS) {
    return res.status(500).send(SOAP_FAULT_TEMPLATE('Client.SecurityFault', 'XSS attempt detected'));
  }

  // 4. SOAP XML validation
  const xmlValidation = XMLValidator.validate(rawBody);
  if (xmlValidation !== true) {
    return res.status(500).send(SOAP_FAULT_TEMPLATE('Client.MalformedXML', 'Invalid XML structure'));
  }

  // 5. Parse XML using fast-xml-parser
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_"
  });
  
  let parsed;
  try {
    parsed = parser.parse(rawBody);
  } catch (err) {
    return res.status(500).send(SOAP_FAULT_TEMPLATE('Client.MalformedXML', 'Invalid XML structure'));
  }

  // 6. SOAP Request with missing SOAP Envelope element returns SOAP Fault
  const rootKey = Object.keys(parsed).find(k => k.endsWith('Envelope'));
  if (!rootKey) {
    return res.status(500).send(SOAP_FAULT_TEMPLATE('Client.MissingEnvelope', 'SOAP Envelope element missing'));
  }

  const envelope = parsed[rootKey];
  
  // 7. SOAP Request with empty SOAP Body element returns SOAP Fault
  const bodyKey = Object.keys(envelope).find(k => k.endsWith('Body'));
  if (!bodyKey) {
    return res.status(500).send(SOAP_FAULT_TEMPLATE('Client.MissingBody', 'SOAP Body element missing'));
  }

  const body = envelope[bodyKey];
  if (!body || Object.keys(body).length === 0) {
    return res.status(500).send(SOAP_FAULT_TEMPLATE('Client.EmptyBody', 'SOAP Body is empty'));
  }

  // 8. SOAP Request with incorrect action namespace returns SOAP Fault
  const reqKey = Object.keys(body).find(k => k.endsWith('GetProjectInfoRequest'));
  if (!reqKey) {
    return res.status(500).send(SOAP_FAULT_TEMPLATE('Client.InvalidAction', 'Request element GetProjectInfoRequest missing'));
  }

  // 9. SOAP Namespace validation: verify elements and namespaces correctly to reject comment-based bypasses
  const getAttributes = (obj) => {
    if (!obj || typeof obj !== 'object') return {};
    const attrs = {};
    for (const key of Object.keys(obj)) {
      if (key.startsWith('@_')) {
        attrs[key] = obj[key];
      }
    }
    return attrs;
  };

  const envAttrs = getAttributes(envelope);
  const bodyAttrs = getAttributes(body);
  const reqElement = body[reqKey];
  const reqAttrs = getAttributes(reqElement);
  
  const combinedAttrs = { ...envAttrs, ...bodyAttrs, ...reqAttrs };
  
  const prefix = reqKey.includes(':') ? reqKey.split(':')[0] : null;
  let hasValidNamespace = false;
  if (prefix) {
    if (combinedAttrs[`@_xmlns:${prefix}`] === 'http://tempuri.org/') {
      hasValidNamespace = true;
    }
  } else {
    if (combinedAttrs['@_xmlns'] === 'http://tempuri.org/') {
      hasValidNamespace = true;
    }
  }

  if (!hasValidNamespace) {
    return res.status(500).send(SOAP_FAULT_TEMPLATE('Client.InvalidNamespace', 'Incorrect namespace for SOAP action. Expected http://tempuri.org/'));
  }

  // Successful response
  return res.status(200).send(SOAP_RESPONSE_TEMPLATE);
};
