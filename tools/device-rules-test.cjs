/**
 * The telestrator harness's shared helpers (tools/device.mjs) on the JVM-free side of the device: how a tool finds
 * the pairing PIN in logcat, which of this machine's addresses a Stick should dial back to, and the one argv parser
 * every tool uses. Each of these decides what a device run does before anything reaches the device, and none of them
 * had a test. Pure: no adb, no device, no network, no model. Run with npm test in desk/ (directly: node
 * tools/device-rules-test.cjs).
 */
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const { test } = require('node:test');

const load = () => import(pathToFileURL(path.join(__dirname, 'device.mjs')).href);
const nic = (address, extra = {}) => ({ address, family: 'IPv4', internal: false, ...extra });

test('pinFromLogcat takes the PIN of the LAST pairing line, from ?pin= or &pin=', async () => {
  const { pinFromLogcat } = await load();
  const twoLaunches = [
    'I Telestrator: transport=lan pairing=http://10.0.0.142:8765/?pin=1111',
    'I Telestrator: transport=relay pairing=http://10.0.0.140:9787/?session=a&pin=2222',
  ].join('\n');
  assert.equal(pinFromLogcat(twoLaunches), '2222');
  assert.equal(pinFromLogcat('I Telestrator: transport=lan pairing=http://10.0.0.142:8765/?pin=4821'), '4821');
  assert.equal(pinFromLogcat('I Telestrator: listening on http://10.0.0.142:8765/?pin=9999'), undefined, 'only a pairing= line counts');
  assert.equal(pinFromLogcat(''), undefined);
});

test('pairingPin takes --pin without touching adb', async () => {
  const { pairingPin } = await load();
  const adb = () => { throw new Error('adb must not run when --pin is given'); };
  assert.equal(pairingPin({ pin: '4821' }, 't', adb), '4821');
});

test('pairingPin reads the PIN out of logcat when no --pin is given', async () => {
  const { pairingPin } = await load();
  const adb = (...a) => {
    assert.deepEqual(a, ['logcat', '-d', '-s', 'Telestrator:I']);
    return Buffer.from('I Telestrator: transport=lan pairing=http://10.0.0.142:8765/?pin=3141\n');
  };
  assert.equal(pairingPin({}, 't', adb), '3141');
});

test('hostAddressForDevice: the emulator dials its fixed host alias', async () => {
  const { hostAddressForDevice } = await load();
  assert.equal(hostAddressForDevice('127.0.0.1:8765', {}), '10.0.2.2');
  assert.equal(hostAddressForDevice('localhost:8765', {}), '10.0.2.2');
});

test('hostAddressForDevice: a Stick gets the interface on its own subnet, not a virtual switch listed first', async () => {
  const { hostAddressForDevice } = await load();
  const interfaces = {
    'vEthernet (WSL)': [nic('172.20.112.1')],
    'Loopback': [nic('127.0.0.1', { internal: true })],
    'Docker': [nic('10.1.5.1')],
    'Wi-Fi': [nic('fe80::1', { family: 'IPv6' }), nic('10.0.0.140')],
  };
  assert.equal(hostAddressForDevice('10.0.0.142:8765', interfaces), '10.0.0.140');
});

test('hostAddressForDevice: TV_RELAY_HOST overrides the guess', async () => {
  const { hostAddressForDevice } = await load();
  process.env.TV_RELAY_HOST = '192.168.1.5';
  try {
    assert.equal(hostAddressForDevice('10.0.0.142:8765', { 'Wi-Fi': [nic('10.0.0.140')] }), '192.168.1.5');
  } finally {
    delete process.env.TV_RELAY_HOST;
  }
});

test('hostAddressForDevice: no non-loopback IPv4 address is a sentence, not a wrong address', async () => {
  const { hostAddressForDevice } = await load();
  assert.throws(() => hostAddressForDevice('10.0.0.142:8765', { Loopback: [nic('127.0.0.1', { internal: true })] }), /no non-loopback IPv4/);
});

test('parseArgs reads --name value pairs; a trailing flag is undefined', async () => {
  const { parseArgs } = await load();
  assert.deepEqual(parseArgs(['--host', '10.0.0.142:8765', '--seconds', '6', '--pin']), {
    host: '10.0.0.142:8765',
    seconds: '6',
    pin: undefined,
  });
  assert.deepEqual(parseArgs([]), {});
});

test('every harness tool takes its argv from parseArgs, none keeps its own parser', () => {
  const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
  const tools = ['live-ui-test', 'relay-test', 'relay-stub', 'pen-sim', 'latency-probe', 'tail-diag'];
  for (const t of tools) {
    const src = strip(fs.readFileSync(path.join(__dirname, `${t}.mjs`), 'utf8'));
    assert.match(src, /const args = parseArgs\(\);/, `${t}.mjs does not call parseArgs()`);
    assert.doesNotMatch(src, /process\.argv\.slice\(2\)/, `${t}.mjs parses argv itself`);
  }
});

// README states how many checks each device harness makes; two commits in a row added checks and left the number
// behind (605b0f9b to live-ui-test, 3b2ac640 to relay-test). The figure is derived here from the check() calls a
// full run makes: every call site, less the ones that only record a failure (a literal `false` verdict).
test('README check counts match the check() calls of a full live-ui-test and relay-test run', () => {
  const readme = fs.readFileSync(path.join(__dirname, '..', 'README.md'), 'utf8');
  for (const [tool, label] of [['live-ui-test', 'live-ui-test.mjs'], ['relay-test', 'relay-test.mjs']]) {
    const src = fs.readFileSync(path.join(__dirname, `${tool}.mjs`), 'utf8');
    const calls = (src.match(/(^|[^\w.])check\(/gm) || []).length - (src.match(/function check\(/g) || []).length;
    const failOnly = (src.match(/(^|[^\w.])check\([^;]*?,\s*false\s*,/gm) || []).length;
    const row = readme.split('\n').find((l) => l.startsWith('| `tools/`')) || '';
    const at = row.indexOf(label);
    const stated = Number((/(\d+) checks/.exec(row.slice(at)) || [])[1]);
    assert.ok(at >= 0, `README's tools row does not name ${label}`);
    assert.equal(stated, calls - failOnly, `README says ${stated} checks for ${label}; a full run makes ${calls - failOnly}`);
  }
});
