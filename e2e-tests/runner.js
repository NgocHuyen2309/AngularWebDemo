const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../backend/config/db');
const http = require('http');
const app = require('../backend/app');
const fs = require('fs');
const path = require('path');

const specs = {
  'Tier 1: Feature Coverage': [
    require('./specs/tier1-coverage/f1-user.spec'),
    require('./specs/tier1-coverage/f2-catalog.spec'),
    require('./specs/tier1-coverage/f3-soap.spec'),
    require('./specs/tier1-coverage/f4-layout.spec'),
    require('./specs/tier1-coverage/f5-catalog-ui.spec'),
    require('./specs/tier1-coverage/f6-vanilla.spec')
  ],
  'Tier 2: Boundary & Corner Cases': [
    require('./specs/tier2-boundary/f1-user.boundary.spec'),
    require('./specs/tier2-boundary/f2-catalog.boundary.spec'),
    require('./specs/tier2-boundary/f3-soap.boundary.spec'),
    require('./specs/tier2-boundary/f4-layout.boundary.spec'),
    require('./specs/tier2-boundary/f5-catalog-ui.boundary.spec'),
    require('./specs/tier2-boundary/f6-vanilla.boundary.spec')
  ],
  'Tier 3: Cross-Feature Interactions': [
    require('./specs/tier3-cross/cross-feature.spec')
  ],
  'Tier 4: Real-World Scenarios': [
    require('./specs/tier4-workload/workload-1-browse.spec'),
    require('./specs/tier4-workload/workload-2-double-reg.spec'),
    require('./specs/tier4-workload/workload-3-update-optout.spec'),
    require('./specs/tier4-workload/workload-4-health-check.spec'),
    require('./specs/tier4-workload/workload-5-interactive.spec')
  ]
};

let mongoServer;
let server;
const PORT = 3000;

async function setup() {
  console.log('========================================');
  console.log(' Setting up E2E Test Environment');
  console.log('========================================');
  
  console.log('Starting Mongo Memory Server...');
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  process.env.MONGODB_URI = uri;
  process.env.PORT = PORT;
  
  console.log('Connecting to database...');
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  await connectDB();
  
  console.log('Starting Express server...');
  return new Promise((resolve) => {
    server = app.listen(PORT, () => {
      console.log(`Express server is listening on http://localhost:${PORT}`);
      resolve();
    });
  });
}

async function teardown() {
  console.log('\n========================================');
  console.log(' Tearing down E2E Test Environment');
  console.log('========================================');
  if (server) {
    console.log('Stopping Express server...');
    await new Promise((resolve) => server.close(resolve));
  }
  console.log('Disconnecting from database...');
  await disconnectDB();
  if (mongoServer) {
    console.log('Stopping Mongo Memory Server...');
    await mongoServer.stop();
  }
  console.log('Teardown complete.');
}

async function run() {
  try {
    await setup();
    
    const results = [];
    let passedCount = 0;
    let failedCount = 0;
    
    const { createJSDOMContext } = require('./utils/dom-helper');
    const { getAgent } = require('./utils/api-helper');
    
    const context = {
      agent: getAgent(),
      createJSDOMContext
    };
    
    for (const [tierName, specList] of Object.entries(specs)) {
      console.log(`\nRunning ${tierName}...`);
      for (const specModule of specList) {
        for (const [testId, testCase] of Object.entries(specModule)) {
          const start = Date.now();
          let passed = true;
          let error = null;
          
          try {
            await testCase.run(context);
            passedCount++;
            console.log(`  ✓ [${testId}] ${testCase.name} (${Date.now() - start}ms)`);
          } catch (err) {
            passed = false;
            error = err;
            failedCount++;
            console.error(`  ✗ [${testId}] ${testCase.name} (${Date.now() - start}ms)`);
            console.error(`      Error: ${err.message}\n${err.stack}`);
          }
          
          results.push({
            id: testId,
            name: testCase.name,
            tier: tierName,
            passed,
            error: error ? error.stack || error.message : null,
            duration: Date.now() - start
          });
        }
      }
    }
    
    // Print checklist report
    printChecklistReport(results);
    
    // Write report.json
    fs.writeFileSync(
      path.join(__dirname, 'report.json'),
      JSON.stringify({
        summary: {
          total: results.length,
          passed: passedCount,
          failed: failedCount
        },
        results
      }, null, 2)
    );
    
    // Write junit.xml
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<testsuites>\n';
    xml += `  <testsuite name="E2E Testing Track" tests="${results.length}" failures="${failedCount}">\n`;
    for (const r of results) {
      xml += `    <testcase classname="${r.tier.replace(/\s+/g, '')}" name="[${r.id}] ${r.name}" time="${r.duration / 1000}">\n`;
      if (!r.passed) {
        xml += `      <failure message="${(r.error || '').split('\n')[0].replace(/"/g, '&quot;').replace(/</g, '&lt;')}"><![CDATA[${r.error}]]></failure>\n`;
      }
      xml += `    </testcase>\n`;
    }
    xml += '  </testsuite>\n</testsuites>\n';
    fs.writeFileSync(path.join(__dirname, 'junit.xml'), xml);
    
    await teardown();
    
    if (failedCount > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (error) {
    console.error('E2E Runner failed with fatal error:', error);
    if (server) server.close();
    await disconnectDB();
    if (mongoServer) await mongoServer.stop();
    process.exit(1);
  }
}

function printChecklistReport(results) {
  console.log(`\n======================================================================`);
  console.log(`                    E2E TEST SUMMARY COVERAGE REPORT`);
  console.log(`======================================================================`);
  
  const getFeatureMark = (resList, tier, feat) => {
    let output = '';
    let count = 0;
    for (let i = 1; i <= 5; i++) {
      const tid = `TC-${tier}-${feat}-0${i}`;
      const found = resList.find(r => r.id === tid);
      if (found) {
        if (found.passed) {
          output += '[✓]';
          count++;
        } else {
          output += '[✗]';
        }
      } else {
        output += '[ ]';
      }
    }
    return { marks: output, count };
  };

  const getCrossMark = (resList) => {
    let output = '';
    let count = 0;
    for (let i = 1; i <= 6; i++) {
      const tid = `TC-T3-0${i}`;
      const found = resList.find(r => r.id === tid);
      if (found) {
        if (found.passed) {
          output += '[✓]';
          count++;
        } else {
          output += '[✗]';
        }
      } else {
        output += '[ ]';
      }
    }
    return { marks: output, count };
  };

  const getWorkloadMark = (resList) => {
    let output = '';
    let count = 0;
    for (let i = 1; i <= 5; i++) {
      const tid = `TC-T4-0${i}`;
      const found = resList.find(r => r.id === tid);
      if (found) {
        if (found.passed) {
          output += '[✓]';
          count++;
        } else {
          output += '[✗]';
        }
      } else {
        output += '[ ]';
      }
    }
    return { marks: output, count };
  };

  // Tier 1
  console.log('\n[Tier 1: Feature Coverage]');
  const t1f1 = getFeatureMark(results, 'T1', 'F1');
  const t1f2 = getFeatureMark(results, 'T1', 'F2');
  const t1f3 = getFeatureMark(results, 'T1', 'F3');
  const t1f4 = getFeatureMark(results, 'T1', 'F4');
  const t1f5 = getFeatureMark(results, 'T1', 'F5');
  const t1f6 = getFeatureMark(results, 'T1', 'F6');
  console.log(` - F1 User Profile Management (REST):   ${t1f1.marks} ${t1f1.count}/5`);
  console.log(` - F2 Catalog API & DB Seeding (REST):   ${t1f2.marks} ${t1f2.count}/5`);
  console.log(` - F3 SOAP Info Service (SOAP):          ${t1f3.marks} ${t1f3.count}/5`);
  console.log(` - F4 Responsive Layout (BEM/Grid):      ${t1f4.marks} ${t1f4.count}/5`);
  console.log(` - F5 Catalog UI Filtering/Sorting:      ${t1f5.marks} ${t1f5.count}/5`);
  console.log(` - F6 Vanilla JS Showcase (DOM):         ${t1f6.marks} ${t1f6.count}/5`);
  
  // Tier 2
  console.log('\n[Tier 2: Boundary & Corner Cases]');
  const t2f1 = getFeatureMark(results, 'T2', 'F1');
  const t2f2 = getFeatureMark(results, 'T2', 'F2');
  const t2f3 = getFeatureMark(results, 'T2', 'F3');
  const t2f4 = getFeatureMark(results, 'T2', 'F4');
  const t2f5 = getFeatureMark(results, 'T2', 'F5');
  const t2f6 = getFeatureMark(results, 'T2', 'F6');
  console.log(` - F1 User Profile Management (REST):   ${t2f1.marks} ${t2f1.count}/5`);
  console.log(` - F2 Catalog API & DB Seeding (REST):   ${t2f2.marks} ${t2f2.count}/5`);
  console.log(` - F3 SOAP Info Service (SOAP):          ${t2f3.marks} ${t2f3.count}/5`);
  console.log(` - F4 Responsive Layout (BEM/Grid):      ${t2f4.marks} ${t2f4.count}/5`);
  console.log(` - F5 Catalog UI Filtering/Sorting:      ${t2f5.marks} ${t2f5.count}/5`);
  console.log(` - F6 Vanilla JS Showcase (DOM):         ${t2f6.marks} ${t2f6.count}/5`);

  // Tier 3
  console.log('\n[Tier 3: Cross-Feature Interactions]');
  const t3 = getCrossMark(results);
  console.log(` - Cross-Feature Workflows:              ${t3.marks} ${t3.count}/6`);

  // Tier 4
  console.log('\n[Tier 4: Real-World Scenarios]');
  const t4 = getWorkloadMark(results);
  console.log(` - Scenario Workloads:                   ${t4.marks} ${t4.count}/5`);

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  console.log(`\n======================================================================`);
  console.log(` TOTAL CASES: ${results.length} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log(`======================================================================\n`);
}

run();
