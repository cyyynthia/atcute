import { describe, expect, it } from 'bun:test';

import { fromBase58Btc, fromBase64 } from '@atcute/multibase';

import { parseDidKey } from '../multibase.js';
import { createP256Keypair, P256PrivateKey, P256PublicKey } from './p256.js';

it('can create a new keypair and reimport it', () => {
	const keypair = createP256Keypair();
	const privateKeyBytes = keypair.export('bytes');

	const imported = new P256PrivateKey(privateKeyBytes);

	expect(imported.did()).toBe(keypair.did());
});

it('produces valid signatures', async () => {
	const keypair = createP256Keypair();

	const data = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
	const sig = await keypair.sign(data);

	const isValidSig = await keypair.verify(sig, data);

	expect(isValidSig).toBe(true);
});

describe('interop tests', () => {
	it('handles valid low-S signature', async () => {
		const payload = {
			message: `oWVoZWxsb2V3b3JsZA`,
			sig: `2vZNsG3UKvvO/CDlrdvyZRISOFylinBh0Jupc6KcWoJWExHptCfduPleDbG3rko3YZnn9Lw0IjpixVmexJDegg`,
			didKey: `did:key:zDnaembgSGUhZULN2Caob4HLJPaxBh92N7rtH21TErzqf8HQo`,
		};

		const messageBytes = fromBase64(payload.message);
		const sigBytes = fromBase64(payload.sig);

		const parsed = parseDidKey(payload.didKey);
		expect(parsed.type).toBe('p256');

		const keypair = new P256PublicKey(parsed.publicKey);
		const isValidSig = await keypair.verify(sigBytes, messageBytes);

		expect(isValidSig).toBe(true);
	});

	it('throws on non-low-S signature', async () => {
		const payload = {
			message: `oWVoZWxsb2V3b3JsZA`,
			sig: `2vZNsG3UKvvO/CDlrdvyZRISOFylinBh0Jupc6KcWoKp7O4VS9giSAah8k5IUbXIW00SuOrjfEqQ9HEkN9JGzw`,
			didKey: `did:key:zDnaembgSGUhZULN2Caob4HLJPaxBh92N7rtH21TErzqf8HQo`,
		};

		const messageBytes = fromBase64(payload.message);
		const sigBytes = fromBase64(payload.sig);

		const parsed = parseDidKey(payload.didKey);
		expect(parsed.type).toBe('p256');

		const keypair = new P256PublicKey(parsed.publicKey);
		const isValidSig = await keypair.verify(sigBytes, messageBytes);

		expect(isValidSig).toBe(false);
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

		const keypair = new P256PublicKey(parsed.publicKey);
		const isValidSig = await keypair.verify(sigBytes, messageBytes);

		expect(isValidSig).toBe(false);
	});

	it('exports the expected keys', async () => {
		const inputs = [
			{
				privateKeyBytesBase58: '9p4VRzdmhsnq869vQjVCTrRry7u4TtfRxhvBFJTGU2Cp',
				publicDidKey: 'did:key:zDnaeTiq1PdzvZXUaMdezchcMJQpBdH2VN4pgrrEhMCCbmwSb',
			},
		];

		for (const { privateKeyBytesBase58, publicDidKey } of inputs) {
			const privateKeyBytes = fromBase58Btc(privateKeyBytesBase58);
			const keypair = new P256PrivateKey(privateKeyBytes);

			expect<string>(keypair.did()).toBe(publicDidKey);
		}
	});
});
