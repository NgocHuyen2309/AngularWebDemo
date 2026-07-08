const request = require('supertest');
const app = require('../app');
const dbHelper = require('./helpers/db.helper');

const SOAP_ENVELOPE = `
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:web="http://tempuri.org/">
   <soapenv:Body>
      <web:GetProjectInfoRequest/>
   </soapenv:Body>
</soapenv:Envelope>
`;

beforeAll(async () => {
  await dbHelper.connect();
});

afterAll(async () => {
  await dbHelper.close();
});

beforeEach(async () => {
  await dbHelper.clear();
});

describe('SOAP Web Service API', () => {
  test('POST /api/soap/info - success', async () => {
    const res = await request(app)
      .post('/api/soap/info')
      .set('Content-Type', 'text/xml')
      .send(SOAP_ENVELOPE);
    
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/xml/);
    expect(res.text).toContain('<web:Status>Active</web:Status>');
    expect(res.text).toContain('<web:Version>1.0.0</web:Version>');
    expect(res.text).toContain('<web:Milestones>10</web:Milestones>');
  });

  test('POST /api/soap/info - missing envelope', async () => {
    const res = await request(app)
      .post('/api/soap/info')
      .set('Content-Type', 'text/xml')
      .send('<soapenv:Body><web:GetProjectInfoRequest/></soapenv:Body>');
    expect(res.statusCode).toBe(500);
    expect(res.text).toContain('<faultcode>Client.MissingEnvelope</faultcode>');
  });

  test('POST /api/soap/info - invalid namespace', async () => {
    const res = await request(app)
      .post('/api/soap/info')
      .set('Content-Type', 'text/xml')
      .send(`
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
          <soapenv:Body>
            <GetProjectInfoRequest/>
          </soapenv:Body>
        </soapenv:Envelope>
      `);
    expect(res.statusCode).toBe(500);
    expect(res.text).toContain('<faultcode>Client.InvalidNamespace</faultcode>');
  });

  test('POST /api/soap/info - comment bypass rejected', async () => {
    const res = await request(app)
      .post('/api/soap/info')
      .set('Content-Type', 'text/xml')
      .send(`
        <!-- xmlns:web="http://tempuri.org/" -->
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
          <soapenv:Body>
            <web:GetProjectInfoRequest/>
          </soapenv:Body>
        </soapenv:Envelope>
      `);
    expect(res.statusCode).toBe(500);
    expect(res.text).toContain('<faultcode>Client.InvalidNamespace</faultcode>');
  });

  test('POST /api/soap/info - payload too large (50KB threshold)', async () => {
    const largeBody = 'a'.repeat(51000);
    const res = await request(app)
      .post('/api/soap/info')
      .set('Content-Type', 'text/xml')
      .send(largeBody);
    
    expect(res.statusCode).toBe(500);
    expect(res.text).toContain('<faultcode>Client.PayloadTooLarge</faultcode>');
    expect(res.text).toContain('Payload size exceeds limit of 50KB');
  });

  test('POST /api/soap/info - XSS security fault', async () => {
    // Check script tag
    let res = await request(app)
      .post('/api/soap/info')
      .set('Content-Type', 'text/xml')
      .send('<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:web="http://tempuri.org/"><soapenv:Body><web:GetProjectInfoRequest><script>alert(1)</script></web:GetProjectInfoRequest></soapenv:Body></soapenv:Envelope>');
    expect(res.statusCode).toBe(500);
    expect(res.text).toContain('<faultcode>Client.SecurityFault</faultcode>');
    expect(res.text).toContain('XSS attempt detected');

    // Check event handler in lowercase/uppercase
    res = await request(app)
      .post('/api/soap/info')
      .set('Content-Type', 'text/xml')
      .send('<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:web="http://tempuri.org/"><soapenv:Body><web:GetProjectInfoRequest onerror="alert(1)"/></soapenv:Body></soapenv:Envelope>');
    expect(res.statusCode).toBe(500);
    expect(res.text).toContain('<faultcode>Client.SecurityFault</faultcode>');

    res = await request(app)
      .post('/api/soap/info')
      .set('Content-Type', 'text/xml')
      .send('<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:web="http://tempuri.org/"><soapenv:Body><web:GetProjectInfoRequest OnLoad="alert(1)"/></soapenv:Body></soapenv:Envelope>');
    expect(res.statusCode).toBe(500);
    expect(res.text).toContain('<faultcode>Client.SecurityFault</faultcode>');
  });

  test('POST /api/soap/info - malformed XML fault codes', async () => {
    // Unclosed tag
    let res = await request(app)
      .post('/api/soap/info')
      .set('Content-Type', 'text/xml')
      .send('<soapenv:Envelope><soapenv:Body></soapenv:Envelope>');
    expect(res.statusCode).toBe(500);
    expect(res.text).toContain('<faultcode>Client.MalformedXML</faultcode>');
    expect(res.text).toContain('Invalid XML structure');

    // Empty body
    res = await request(app)
      .post('/api/soap/info')
      .set('Content-Type', 'text/xml')
      .send('   ');
    expect(res.statusCode).toBe(500);
    expect(res.text).toContain('<faultcode>Client.MalformedXML</faultcode>');
    expect(res.text).toContain('Request body is empty');
  });
});
