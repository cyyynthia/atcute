import { describe, expect, it } from 'bun:test';

import { fromBase58Btc, fromBase64 } from '@atcute/multibase';
import { p256 } from '@noble/curves/p256';

import { parseDidKey } from '../multibase.js';
import { toSha256 } from '../utils.js';

import { P256PrivateKey, P256PrivateKeyExportable, P256PublicKey } from './p256.js';

it('can create a new keypair and reimport it', async () => {
	const keypair = await P256PrivateKeyExportable.createKeypair();
	const privateKeyBytes = await keypair.exportPrivateKey('raw');

	const imported = await P256PrivateKey.importRaw(privateKeyBytes);

	expect(await imported.exportPublicKey('did')).toBe(await keypair.exportPublicKey('did'));
});

it('produces valid signatures', async () => {
	const keypair = await P256PrivateKeyExportable.createKeypair();

	const data = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
	const sig = await keypair.sign(data);

	const hash = await toSha256(data);

	const isValidSigNoble = p256.verify(sig, hash, await keypair.exportPublicKey('raw'));
	const isValidSigSelf = await keypair.verify(sig, data);

	expect(isValidSigNoble).toBe(true);
	expect(isValidSigSelf).toBe(true);
});

describe('.importCryptoKey()', () => {
	it('imports public keys', async () => {
		const { publicKey } = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, [
			'sign',
			'verify',
		]);

		expect(P256PublicKey.importCryptoKey(publicKey)).resolves.toBeInstanceOf(P256PublicKey);
	});

	it('imports private keys without specifying public key', async () => {
		const { privateKey } = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, [
			'sign',
			'verify',
		]);

		expect(P256PrivateKey.importCryptoKey(privateKey)).resolves.toBeInstanceOf(P256PrivateKey);
	});

	it('imports keypairs', async () => {
		const cryptoKeyPair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, [
			'sign',
			'verify',
		]);

		expect(P256PrivateKey.importCryptoKeyPair(cryptoKeyPair)).resolves.toBeInstanceOf(P256PrivateKey);
	});

	it('throws on mismatching public/private keys', async () => {
		const { publicKey } = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, [
			'sign',
			'verify',
		]);
		const { privateKey } = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, [
			'sign',
			'verify',
		]);

		expect(P256PrivateKey.importCryptoKey(privateKey, publicKey)).rejects.toThrowError(TypeError);
	});
});

describe('.importRaw()', () => {
	it('throws on mismatching public/private keys', async () => {
		const [key1, key2] = await Promise.all([
			P256PrivateKeyExportable.createKeypair(),
			P256PrivateKeyExportable.createKeypair(),
		]);

		const publicKeyBytes = await key1.exportPublicKey('raw');
		const privateKeyBytes = await key2.exportPrivateKey('raw');

		expect(P256PrivateKey.importRaw(privateKeyBytes, publicKeyBytes)).rejects.toThrowError(TypeError);
	});
});

describe('interop tests', () => {
	it('handles low-S signature', async () => {
		const payload = {
			message: `oWVoZWxsb2V3b3JsZA`,
			sig: `2vZNsG3UKvvO/CDlrdvyZRISOFylinBh0Jupc6KcWoJWExHptCfduPleDbG3rko3YZnn9Lw0IjpixVmexJDegg`,
			didKey: `did:key:zDnaembgSGUhZULN2Caob4HLJPaxBh92N7rtH21TErzqf8HQo`,
		};

		const messageBytes = fromBase64(payload.message);
		const sigBytes = fromBase64(payload.sig);

		const parsed = parseDidKey(payload.didKey);
		expect(parsed.type).toBe('p256');

		const keypair = await P256PublicKey.importRaw(parsed.publicKeyBytes);
		const isValidSig = await keypair.verify(sigBytes, messageBytes);

		expect(isValidSig).toBe(true);
	});

	it('throws on high-S signature by default', async () => {
		const payload = {
			message: `oWVoZWxsb2V3b3JsZA`,
			sig: `2vZNsG3UKvvO/CDlrdvyZRISOFylinBh0Jupc6KcWoKp7O4VS9giSAah8k5IUbXIW00SuOrjfEqQ9HEkN9JGzw`,
			didKey: `did:key:zDnaembgSGUhZULN2Caob4HLJPaxBh92N7rtH21TErzqf8HQo`,
		};

		const messageBytes = fromBase64(payload.message);
		const sigBytes = fromBase64(payload.sig);

		const parsed = parseDidKey(payload.didKey);
		expect(parsed.type).toBe('p256');

		const keypair = await P256PublicKey.importRaw(parsed.publicKeyBytes);
		const isValidSig = await keypair.verify(sigBytes, messageBytes);

		expect(isValidSig).toBe(false);
	});

	it('handles high-S signature when specified', async () => {
		const payload = {
			message: `oWVoZWxsb2V3b3JsZA`,
			sig: `2vZNsG3UKvvO/CDlrdvyZRISOFylinBh0Jupc6KcWoKp7O4VS9giSAah8k5IUbXIW00SuOrjfEqQ9HEkN9JGzw`,
			didKey: `did:key:zDnaembgSGUhZULN2Caob4HLJPaxBh92N7rtH21TErzqf8HQo`,
		};

		const messageBytes = fromBase64(payload.message);
		const sigBytes = fromBase64(payload.sig);

		const parsed = parseDidKey(payload.didKey);
		expect(parsed.type).toBe('p256');

		const keypair = await P256PublicKey.importRaw(parsed.publicKeyBytes);
		const isValidSig = await keypair.verify(sigBytes, messageBytes, { allowMalleableSig: true });

		expect(isValidSig).toBe(true);
	});

	it('throws on DER-encoded signature', async () => {
		const payload = {
			message: `oWVoZWxsb2V3b3JsZA`,
			sig: `MEQCIFxYelWJ9lNcAVt+jK0y/T+DC/X4ohFZ+m8f9SEItkY1AiACX7eXz5sgtaRrz/SdPR8kprnbHMQVde0T2R8yOTBweA`,
			didKey: `did:key:zDnaeT6hL2RnTdUhAPLij1QBkhYZnmuKyM7puQLW1tkF4Zkt8`,
		};

		const messageBytes = fromBase64(payload.message);
		const sigBytes = fromBase64(payload.sig);

		const parsed = parseDidKey(payload.didKey);
		expect(parsed.type).toBe('p256');

		const keypair = await P256PublicKey.importRaw(parsed.publicKeyBytes);
		const isValidSig = await keypair.verify(sigBytes, messageBytes);

		expect(isValidSig).toBe(false);
	});

	it('derives the expected did:key', async () => {
		const inputs = [
			{
				privateKeyBytesBase58: '9p4VRzdmhsnq869vQjVCTrRry7u4TtfRxhvBFJTGU2Cp',
				publicDidKey: 'did:key:zDnaeTiq1PdzvZXUaMdezchcMJQpBdH2VN4pgrrEhMCCbmwSb',
			},
		];

		for (const { privateKeyBytesBase58, publicDidKey } of inputs) {
			const privateKeyBytes = fromBase58Btc(privateKeyBytesBase58);
			const keypair = await P256PrivateKey.importRaw(privateKeyBytes);

			expect<string>(await keypair.exportPublicKey('did')).toBe(publicDidKey);
		}
	});
});
