/**
 * tools/desk-dev-https.cjs --cert-only, in a scratch directory under the OS temp dir: it makes the LAN certificate once,
 * keeps a good one, and makes a new one when the one on disk is about to expire (or cannot be read), so a phone is never
 * sent to a desk whose certificate has lapsed. Needs an openssl (Git for Windows ships one; Linux has it); without one the
 * cases skip. Pure: no network, no model, no next dev.
 * Run with npm test in desk/ (directly: node tools/desk-dev-https-test.cjs).
 */
const fs = require('node:fs'), os = require('node:os'), path = require('node:path'), crypto = require('node:crypto'), assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { test, after } = require('node:test');

const SCRIPT = path.join(__dirname, 'desk-dev-https.cjs');
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'desk-https-'));
after(() => { try { fs.rmSync(dir, { recursive: true, force: true }); } catch {} });

const IFACES = JSON.stringify({ eth0: [{ address: '192.168.1.50', family: 'IPv4', internal: false }] });
const env = { ...process.env, DESK_PHONE_HOST: '', DESK_FAKE_INTERFACES: IFACES };
const certs = path.join(dir, 'certificates'), cert = path.join(certs, 'desk-192.168.1.50.pem'), key = path.join(certs, 'desk-192.168.1.50-key.pem');
const certOnly = () => spawnSync(process.execPath, [SCRIPT, '--cert-only'], { cwd: dir, env, encoding: 'utf8' });
const daysLeft = () => (Date.parse(new crypto.X509Certificate(fs.readFileSync(cert)).validTo) - Date.now()) / 864e5;

const openssl = ['openssl', 'C:/Program Files/Git/mingw64/bin/openssl.exe', 'C:/Program Files/Git/usr/bin/openssl.exe']
  .find(c => { const r = spawnSync(c, ['version'], { encoding: 'utf8' }); return !r.error && r.status === 0; });

test('a first run makes a certificate good for about a year', (t) => {
  if (!openssl) return t.skip('no openssl on this machine');
  const r = certOnly();
  assert.equal(r.status, 0, r.stderr);
  assert.ok(fs.existsSync(key));
  assert.ok(daysLeft() > 300, `${daysLeft()} days left`);
});

test('a good certificate is kept as it is', (t) => {
  if (!openssl) return t.skip('no openssl on this machine');
  if (!fs.existsSync(cert)) assert.equal(certOnly().status, 0);
  const before = fs.readFileSync(cert, 'utf8');
  assert.equal(certOnly().status, 0);
  assert.equal(fs.readFileSync(cert, 'utf8'), before);
});

test('a certificate with a day left is made again, good for about a year', (t) => {
  if (!openssl) return t.skip('no openssl on this machine');
  fs.mkdirSync(certs, { recursive: true });
  const r0 = spawnSync(openssl, ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-sha256', '-days', '1', '-keyout', key, '-out', cert, '-subj', '/CN=Study Desk'], { encoding: 'utf8' });
  assert.equal(r0.status, 0, r0.stderr);
  assert.ok(daysLeft() < 2);
  const r = certOnly();
  assert.equal(r.status, 0, r.stderr);
  assert.ok(daysLeft() > 300, `still ${daysLeft().toFixed(1)} days left: the expiring certificate was kept`);
});

test('a certificate file that is not a certificate is made again', (t) => {
  if (!openssl) return t.skip('no openssl on this machine');
  fs.mkdirSync(certs, { recursive: true });
  fs.writeFileSync(cert, 'not a pem');
  const r = certOnly();
  assert.equal(r.status, 0, r.stderr);
  assert.ok(daysLeft() > 300);
});
