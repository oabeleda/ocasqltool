// License system constants

// Trial duration in days
export const TRIAL_DURATION_DAYS = 30;

// Warning periods (days before expiration)
export const WARNING_PERIODS = {
  FIRST_WARNING: 30,  // 30 days before expiration
  FINAL_WARNING: 7,   // 7 days before expiration
};

// License tiers and their features
export const LICENSE_TIERS = {
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
export const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAv9TiI8H2c6tFLk437CBS
291hl2CpK0Cj1uXlHh0vh0e4tH+LSMhxepGuDJ4bkeWgdBf9n2IGMctqBbDHnp/g
tTxHix2/UYIkY8/Fu1ucBCwfYptY6TbJB/FM8M+mbsQa6Q7Mb8xM6+LzbexRtGEq
O0NO7jNZuVnyKyr2seUxQiOjBH0apuk90F3wCFvU56LKbYwg/BAp4cO1zZ7mC2vU
8Vq7iEgU+llnQX85hHDNWaAOCCuH5yc1i3Pp14NllW4Ht0EPBaV5bAlngXSmU3sb
f8LEWjoDl/xXi0CJbtxSTbAX8wLpLAb5YuJtMUK4mpgnid4LTrQCbtHnQnA0vnX6
MwIDAQAB
-----END PUBLIC KEY-----
`;

// License file version (for future compatibility)
export const LICENSE_VERSION = 1;
