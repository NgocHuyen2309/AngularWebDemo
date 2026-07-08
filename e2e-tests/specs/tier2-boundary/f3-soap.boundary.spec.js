const assert = require('assert');
const { parseXml } = require('../../utils/xml-helper');

module.exports = {
  'TC-T2-F3-01': {
    name: 'SOAP Request - Missing Envelope (500 Fault)',
    run: async ({ agent }) => {
      const payload = `<soapenv:Body><web:GetProjectInfoRequest/></soapenv:Body>`;
      const res = await agent
        .post('/api/soap/info')
        .set('Content-Type', 'text/xml')
        .send(payload);
      
      assert.strictEqual(res.statusCode, 500);
      const xml = parseXml(res.text);
      const envelope = xml['soapenv:Envelope'] || xml['Envelope'];
      const body = envelope['soapenv:Body'] || envelope['Body'];
      const fault = body['soapenv:Fault'] || body['Fault'];
      assert.strictEqual(fault.faultcode, 'Client.MissingEnvelope');
    }
  },
  'TC-T2-F3-02': {
    name: 'SOAP Request - Empty Body (500 Fault)',
    run: async ({ agent }) => {
      const payload = `
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
          <soapenv:Body></soapenv:Body>
        </soapenv:Envelope>
      `;
      const res = await agent
        .post('/api/soap/info')
        .set('Content-Type', 'text/xml')
        .send(payload);
      
      assert.strictEqual(res.statusCode, 500);
      const xml = parseXml(res.text);
      const envelope = xml['soapenv:Envelope'] || xml['Envelope'];
      const body = envelope['soapenv:Body'] || envelope['Body'];
      const fault = body['soapenv:Fault'] || body['Fault'];
      assert.ok(fault.faultcode.includes('Body'));
    }
  },
  'TC-T2-F3-03': {
    name: 'SOAP Request - Incorrect Action Namespace (500 Fault)',
    run: async ({ agent }) => {
      const payload = `
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:web="http://wrong-namespace.org/">
          <soapenv:Body>
            <web:GetProjectInfoRequest/>
          </soapenv:Body>
        </soapenv:Envelope>
      `;
      const res = await agent
        .post('/api/soap/info')
        .set('Content-Type', 'text/xml')
        .send(payload);
      
      assert.strictEqual(res.statusCode, 500);
      const xml = parseXml(res.text);
      const envelope = xml['soapenv:Envelope'] || xml['Envelope'];
      const body = envelope['soapenv:Body'] || envelope['Body'];
      const fault = body['soapenv:Fault'] || body['Fault'];
      assert.strictEqual(fault.faultcode, 'Client.InvalidNamespace');
    }
  },
  'TC-T2-F3-04': {
    name: 'SOAP Request - Payload Size Exceeds Limit (500 Fault)',
    run: async ({ agent }) => {
      // Create a payload larger than 50KB (51200 bytes)
      const bigText = 'A'.repeat(55000);
      const payload = `
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:web="http://tempuri.org/">
          <soapenv:Body>
            <web:GetProjectInfoRequest>${bigText}</web:GetProjectInfoRequest>
          </soapenv:Body>
        </soapenv:Envelope>
      `;
      const res = await agent
        .post('/api/soap/info')
        .set('Content-Type', 'text/xml')
        .send(payload);
      
      assert.strictEqual(res.statusCode, 500);
      const xml = parseXml(res.text);
      const envelope = xml['soapenv:Envelope'] || xml['Envelope'];
      const body = envelope['soapenv:Body'] || envelope['Body'];
      const fault = body['soapenv:Fault'] || body['Fault'];
      assert.strictEqual(fault.faultcode, 'Client.PayloadTooLarge');
    }
  },
  'TC-T2-F3-05': {
    name: 'SOAP Request - Raw Script Payload XSS (500 Fault)',
    run: async ({ agent }) => {
      const payload = `
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:web="http://tempuri.org/">
          <soapenv:Body>
            <web:GetProjectInfoRequest>
              <script>alert("xss")</script>
            </web:GetProjectInfoRequest>
          </soapenv:Body>
        </soapenv:Envelope>
      `;
      const res = await agent
        .post('/api/soap/info')
        .set('Content-Type', 'text/xml')
        .send(payload);
      
      assert.strictEqual(res.statusCode, 500);
      const xml = parseXml(res.text);
      const envelope = xml['soapenv:Envelope'] || xml['Envelope'];
      const body = envelope['soapenv:Body'] || envelope['Body'];
      const fault = body['soapenv:Fault'] || body['Fault'];
      assert.strictEqual(fault.faultcode, 'Client.SecurityFault');
    }
  }
};
