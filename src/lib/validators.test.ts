import test from 'node:test';
import assert from 'node:assert';
import { validateApiKey } from './validators.ts';

test('validateApiKey', async (t) => {
  await t.test('should return null for valid API keys', () => {
    assert.strictEqual(validateApiKey('valid_api_key_123'), null);
    assert.strictEqual(validateApiKey('abc-123.xyz_789'), null);
    assert.strictEqual(validateApiKey('12345678'), null);
  });

  await t.test('should return error for keys shorter than 8 characters', () => {
    const expectedError = 'API key must be at least 8 characters long.';
    assert.strictEqual(validateApiKey(''), expectedError);
    assert.strictEqual(validateApiKey('1234567'), expectedError);
    assert.strictEqual(validateApiKey('short'), expectedError);
  });

  await t.test('should return error for invalid characters', () => {
    const expectedError = 'API key contains invalid characters. Use only letters, numbers, dots, hyphens, or underscores.';
    assert.strictEqual(validateApiKey('api key with spaces'), expectedError);
    assert.strictEqual(validateApiKey('api_key!@#'), expectedError);
    assert.strictEqual(validateApiKey('api_key$'), expectedError);
    assert.strictEqual(validateApiKey('api_key*'), expectedError);
  });
});
