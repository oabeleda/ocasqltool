// License system constants

// Trial duration in days
const TRIAL_DURATION_DAYS = 30;

// License tiers and their features
const LICENSE_TIERS = {
  trial: {
    name: 'Trial',
    maxRows: 1000,
    exportExcel: true,
    sqlHistory: true,
    maxConnections: 3,
  },
  professional: {
    name: 'Professional',
    maxRows: Infinity,
    exportExcel: true,
    sqlHistory: true,
    maxConnections: 10,
  },
  enterprise: {
    name: 'Enterprise',
    maxRows: Infinity,
    exportExcel: true,
    sqlHistory: true,
    maxConnections: Infinity,
  },
};

// RSA Public Key for license validation
// This will be generated when you run the generator script for the first time
// The private key stays with you, this public key is embedded in the app
const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAy2kKMf34bqZrFlYZRrBT
+mmkTohEcDsH6sUNTaeASHya84Do5GwQnS/qbEjX/g7sRqqCjMzqwe3/q93GkADP
S+5kASYKesXNqB4Zfm++dp6AcJTJ3Rzy2UwcNX7yZuMCF8iH7FdoeVYwy7ig7Jk4
2prF+nDp4lWvA097o/+cDwP9bbVQ3RLvSdh2m1C6rtjIxXkrM2NT2hKoiFc83hQa
62c8izSl+bJlsFZj3Q8PTOEdfcBFek/nSuk/MV96YhUyB+DQwdHTQrdwbOQo+FyF
sOQEyf+qMVDx9C1/C3v6lN0qtPxWUyhdamyfJ6gDzU6BwYK66PAOyvPtgNs/H3JH
1wIDAQAB
-----END PUBLIC KEY-----
`;

// License file version (for future compatibility)
const LICENSE_VERSION = 1;


const _k = "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";
const _p1 = "OCAQu";
const _p2 = "eryTo";
const _p3 = "ol2024";
const _p4 = "Secret";
const _p5 = "Mask!@#";

// Decode function
function _d(e, m) {
  const d = Buffer.from(e, 'base64');
  const k = Buffer.from(m, 'utf8');
  const r = Buffer.alloc(d.length);
  for (let i = 0; i < d.length; i++) {
    r[i] = d[i] ^ k[i % k.length];
  }
  return r.toString('utf8');
}

// Get the trial private key (decoded at runtime)
function getTrialPrivateKey() {
  return _d(_k, _p1 + _p2 + _p3 + _p4 + _p5);
}

// Trial public key (for verifying trial signatures)
const TRIAL_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAzCF1ILs9XGARCAjPlF2e
Zdlh6iyTziQ/8WtMipGoE6EM6lFYYkvWcCMOAZ7NnnR0muZOLC76r1iJ43DFxVyS
haSgcMG/hvAQ6Hvnv0PP/zyYfcCqmXUoalgEqqpACLLKeuy9QBK2M+9S1ZSteK19
eOZ9nJyuMvbgTmY22bqrHtoJMBNCtV8ZqWnHi0rmaJfgs2/hC/mPnxEJkxKC8GFQ
xqOQULl7eTUTmiIzcqvmDyLDM7DYGSGFJEOyls4EjKTufOiwfKbfkFTg0XAWxJ37
+/C/HbquV+pVYbMVZ3HwQ6oT7UfJ0ior/8i1bq/pNZztiR0zzpe397jH2tjfX43j
QwIDAQAB
-----END PUBLIC KEY-----`;

module.exports = {
  TRIAL_DURATION_DAYS,
  LICENSE_TIERS,
  PUBLIC_KEY,
  LICENSE_VERSION,
  getTrialPrivateKey,
  TRIAL_PUBLIC_KEY,
};
