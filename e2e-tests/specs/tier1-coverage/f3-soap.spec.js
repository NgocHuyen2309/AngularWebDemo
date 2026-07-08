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
  'TC-T1-F3-01': {
    name: 'SOAP Request - Success (200 OK & XML Headers)',
    run: async ({ agent }) => {
      const res = await agent
        .post('/api/soap/info')
        .set('Content-Type', 'text/xml')
        .send(SOAP_ENVELOPE);
      
      assert.strictEqual(res.statusCode, 200);
      assert.match(res.headers['content-type'], /xml/);
    }
  },
  'TC-T1-F3-02': {
    name: 'SOAP Response - Status Active Verification',
    run: async ({ agent }) => {
      const res = await agent
        .post('/api/soap/info')
        .set('Content-Type', 'text/xml')
        .send(SOAP_ENVELOPE);
      
      const xml = parseXml(res.text);
      const envelope = xml['soapenv:Envelope'] || xml['Envelope'];
      const body = envelope['soapenv:Body'] || envelope['Body'];
      const response = body['web:GetProjectInfoResponse'] || body['GetProjectInfoResponse'];
      const status = response['web:Status'] || response['Status'];
      assert.strictEqual(status, 'Active');
    }
  },
  'TC-T1-F3-03': {
    name: 'SOAP Response - Version 1.0.0 Verification',
    run: async ({ agent }) => {
      const res = await agent
        .post('/api/soap/info')
        .set('Content-Type', 'text/xml')
        .send(SOAP_ENVELOPE);
      
      const xml = parseXml(res.text);
      const envelope = xml['soapenv:Envelope'] || xml['Envelope'];
      const body = envelope['soapenv:Body'] || envelope['Body'];
      const response = body['web:GetProjectInfoResponse'] || body['GetProjectInfoResponse'];
      const version = response['web:Version'] || response['Version'];
      assert.strictEqual(version, '1.0.0');
    }
  },
  'TC-T1-F3-04': {
    name: 'SOAP Response - Milestone Count (10) Verification',
    run: async ({ agent }) => {
      const res = await agent
        .post('/api/soap/info')
        .set('Content-Type', 'text/xml')
        .send(SOAP_ENVELOPE);
      
      const xml = parseXml(res.text);
      const envelope = xml['soapenv:Envelope'] || xml['Envelope'];
      const body = envelope['soapenv:Body'] || envelope['Body'];
      const response = body['web:GetProjectInfoResponse'] || body['GetProjectInfoResponse'];
      const milestones = Number(response['web:Milestones'] || response['Milestones']);
      assert.strictEqual(milestones, 10);
    }
  },
  'TC-T1-F3-05': {
    name: 'SOAP Request - Malformed XML returns SOAP Fault',
    run: async ({ agent }) => {
      const res = await agent
        .post('/api/soap/info')
        .set('Content-Type', 'text/xml')
        .send('<soapenv:Envelope><soapenv:Body><web:GetProjectInfoRequest></soapenv:Envelope>'); // incomplete tags
      
      assert.strictEqual(res.statusCode, 500);
      assert.match(res.headers['content-type'], /xml/);
      const xml = parseXml(res.text);
      const envelope = xml['soapenv:Envelope'] || xml['Envelope'];
      const body = envelope['soapenv:Body'] || envelope['Body'];
      const fault = body['soapenv:Fault'] || body['Fault'];
      const faultcode = fault['faultcode'];
      const faultstring = fault['faultstring'];
      assert.strictEqual(faultcode, 'Client.MalformedXML');
      assert.ok(faultstring);
    }
  }
};
