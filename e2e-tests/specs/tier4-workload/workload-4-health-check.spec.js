const assert = require('assert');
const { parseXml } = require('../../utils/xml-helper');

const SOAP_ENVELOPE = `
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:web="http://tempuri.org/">
   <soapenv:Body>
      <web:GetProjectInfoRequest/>
   </soapenv:Body>
</soapenv:Envelope>
`;

module.exports = {
  'TC-T4-04': {
    name: 'Workload 4: SOAP and REST API integration health check',
    run: async ({ agent }) => {
      // 1. Query SOAP service for project statistics
      const soapRes = await agent
        .post('/api/soap/info')
        .set('Content-Type', 'text/xml')
        .send(SOAP_ENVELOPE);
      
      assert.strictEqual(soapRes.statusCode, 200);
      assert.match(soapRes.headers['content-type'], /xml/);
      
      // Parse version and status
      const xml = parseXml(soapRes.text);
      const envelope = xml['soapenv:Envelope'] || xml['Envelope'];
      const body = envelope['soapenv:Body'] || envelope['Body'];
      const response = body['web:GetProjectInfoResponse'] || body['GetProjectInfoResponse'];
      
      const status = response['web:Status'] || response['Status'];
      const version = response['web:Version'] || response['Version'];
      
      assert.strictEqual(status, 'Active');
      assert.strictEqual(version, '1.0.0');
      
      // 2. Fetch catalog REST endpoint and verify it is active
      const restRes = await agent.get('/api/catalog');
      assert.strictEqual(restRes.statusCode, 200);
      assert.ok(Array.isArray(restRes.body));
      assert.ok(restRes.body.length >= 20);
    }
  }
};
