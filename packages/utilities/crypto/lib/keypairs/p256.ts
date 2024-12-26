import { toBase16, toBase58Btc } from '@atcute/multibase';

import type { PrivateKey, PrivateKeyExportable, PublicKey, VerifyOptions } from '../types.js';
import { concatBuffers } from '../utils.js';

const ECDSA_ALG: EcdsaParams & EcKeyImportParams = { name: 'ECDSA', namedCurve: 'P-256', hash: 'sha256' };

// https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-186.pdf § 3.2.1.3. P-256
const P256_CURVE_ORDER = BigInt('0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551');
const P256_HALF_CURVE_ORDER = P256_CURVE_ORDER >> 1n;

// https://lapo.it/asn1js/#MEECAQAwEwYHKoZIzj0CAQYIKoZIzj0DAQcEJzAlAgEBBCAf4zlQxfRhEkrpksK9_fHHOxYV9XG9Vn5g0Zqh9IzfQg
const PCKS8_PRIVATE_KEY_PREFIX = Uint8Array.from([
	//   PrivateKeyInfo SEQUENCE (3 elem)  // prettier-ignore
	/**/ 0x30, 0x41,
	//     version Version INTEGER 0  // prettier-ignore
	/****/ 0x02, 0x01, 0x00,
	//     privateKeyAlgorithm AlgorithmIdentifier SEQUENCE (2 elem)  // prettier-ignore
	/****/ 0x30, 0x13,
	//       algorithm OBJECT IDENTIFIER 1.2.840.10045.2.1 ecPublicKey (ANSI X9.62 public key type)
	// prettier-ignore
	/******/ 0x06, 0x07, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02, 0x01, 0x06, 0x08, 0x2a,
	//       parameters ANY OBJECT IDENTIFIER 1.2.840.10045.3.1.7 prime256v1 (ANSI X9.62 named elliptic curve)
	// prettier-ignore
	/******/ 0x86, 0x48, 0xce, 0x3d, 0x03, 0x01, 0x07,
	//     privateKey PrivateKey OCTET STRING (39 byte)  // prettier-ignore
	/****/ 0x04, 0x27,
	//       SEQUENCE (2 elem)  // prettier-ignore
	/******/ 0x30, 0x25,
	//          INTEGER 1  // prettier-ignore
	/********/ 0x02, 0x01, 0x01,
	//          OCTET STRING (32 byte)  // prettier-ignore
	/********/ 0x04, 0x20 /* ... */,
]);

// https://atproto.com/specs/cryptography#public-key-encoding
export const P256_PUBLIC_PREFIX = Uint8Array.from([0x80, 0x24]);
export const P256_PRIVATE_PREFIX = Uint8Array.from([0x86, 0x26]);

function getSignatureS(sig: Uint8Array): bigint {
	// A signature in its compact form is simply the concatenation of R and S, both exactly 32 bytes.
	let s = 0n;
	for (let i = 0; i < 32; i++) {
		s |= BigInt(sig[63 - i]) << BigInt(8 * i);
	}
	return s;
}

function setSignatureS(sig: Uint8Array, s: bigint) {
	// A signature in its compact form is simply the concatenation of R and S, both exactly 32 bytes.
	for (let i = 0; i < 32; i++) {
		sig[63 - i] = Number((s >> BigInt(8 * i)) & 0xffn);
	}
}

function isLowS(sig: Uint8Array): boolean {
	// Assumption: sig is 64 bytes
	// Spec: https://github.com/bitcoin/bips/blob/665712c/bip-0146.mediawiki#low_s
	// Upper bound is inclusive
	return getSignatureS(sig) <= P256_HALF_CURVE_ORDER;
}

function ensureLowS(sig: Uint8Array) {
	// CT soundness: irrelevant, signature is already generated.
	const s = getSignatureS(sig);

	// Upper bound is inclusive
	if (s > P256_HALF_CURVE_ORDER) {
		// SEC 1, ver. 2.0, §4.1.3 Signing Operation -- https://www.secg.org/sec1-v2.pdf
		// "The signer may replace (r, s) with (r, −s mod n), because this is an equivalent signature."
		// Note that JS's modulo is weird and is not strictly positive. We need to work around it.
		setSignatureS(sig, ((-s % P256_CURVE_ORDER) + P256_CURVE_ORDER) % P256_CURVE_ORDER);
	}
}

export class P256PublicKey implements PublicKey {
	readonly type = 'p256';

	/** @internal */
	protected _publicKey: CryptoKey;

	protected constructor(publicKey: CryptoKey) {
		this._publicKey = publicKey;
	}

	async bytes(): Promise<Uint8Array> {
		const buffer = await crypto.subtle.exportKey('raw', this._publicKey);
		let array = new Uint8Array(buffer);

		// WebCrypto spits out the uncompressed EC point.
		// Thankfully the compression algorithm is quite trivial, given most of the work has been done already.
		// SEC 1, ver. 2.0, §2.3.3 Elliptic-Curve-Point-to-Octet-String Conversion, Action 2.3 -- https://www.secg.org/sec1-v2.pdf
		if (array[0] === 4) {
			array[0] = 2 + (array[64] & 1);
			array = array.slice(0, 33);
		}

		return array;
	}

	async did(): Promise<`did:key:${string}`> {
		const pubkey = await this.bytes();
		const encoded = toBase58Btc(concatBuffers([P256_PUBLIC_PREFIX, pubkey]));
		return `did:key:z${encoded}`;
	}

	async verify(sig: Uint8Array, data: Uint8Array, options?: VerifyOptions): Promise<boolean> {
		if (sig.length !== 64) {
			// Invalid signature: not in its compact-form
			return false;
		}

		if (!options?.allowMalleableSig && !isLowS(sig)) {
			// Invalid signature: not low-S normalized
			return false;
		}

		return crypto.subtle.verify(ECDSA_ALG, this._publicKey, sig, data);
	}

	static async fromPublicKeyBytes(publicKeyBytes: Uint8Array): Promise<P256PublicKey> {
		const publicKey = await crypto.subtle.importKey('raw', publicKeyBytes, ECDSA_ALG, true, ['verify']);
		return new P256PublicKey(publicKey);
	}

	static async fromPublicCryptoKey(publicKey: CryptoKey): Promise<P256PublicKey> {
		return new P256PublicKey(publicKey);
	}
}

export class P256PrivateKey extends P256PublicKey implements PrivateKey {
	/** @internal */
	protected _privateKey: CryptoKey;

	protected constructor(publicKey: CryptoKey, privateKey: CryptoKey) {
		super(publicKey);
		this._privateKey = privateKey;
	}

	async sign(data: Uint8Array): Promise<Uint8Array> {
		const rawSig = await crypto.subtle.sign(ECDSA_ALG, this._privateKey, data);
		const sig = new Uint8Array(rawSig);

		ensureLowS(sig); // Will mutate the buffer if needed
		return sig;
	}

	static async fromKeypairBytes(publicKeyBytes: Uint8Array, privateKeyBytes: Uint8Array) {
		const pkcs8 = concatBuffers([PCKS8_PRIVATE_KEY_PREFIX, privateKeyBytes]);
		const publicKey = await crypto.subtle.importKey('raw', publicKeyBytes, ECDSA_ALG, true, ['verify']);
		const privateKey = await crypto.subtle.importKey('pkcs8', pkcs8, ECDSA_ALG, false, ['sign']);
		return P256PrivateKey.fromKeypair(publicKey, privateKey);
	}

	static async fromKeypair(publicKey: CryptoKey, privateKey: CryptoKey) {
		const obj = new P256PrivateKey(publicKey, privateKey);

		// Verify we have a true keypair
		const challenge = new Uint8Array([
			0x62, 0x6e, 0x75, 0x79, 0x20, 0x72, 0x20, 0x71, 0x74, 0x20, 0x3a, 0x33,
		]);
		const sig = await obj.sign(challenge);
		const ok = await obj.verify(sig, challenge);
		if (!ok) {
			throw new TypeError('The provided keys are not part of a keypair!');
		}

		return obj;
	}

	static async fromPrivateKeyBytes(privateKeyBytes: Uint8Array) {
		const pkcs8 = concatBuffers([PCKS8_PRIVATE_KEY_PREFIX, privateKeyBytes]);

		const privateKeyExportable = await crypto.subtle.importKey('pkcs8', pkcs8, ECDSA_ALG, true, ['sign']);
		const privateKey = await crypto.subtle.importKey('pkcs8', pkcs8, ECDSA_ALG, false, ['sign']);

		const jwk = await crypto.subtle.exportKey('jwk', privateKeyExportable);
		delete jwk.d;
		jwk.key_ops = ['verify'];
		const publicKey = await crypto.subtle.importKey('jwk', jwk, ECDSA_ALG, true, ['verify']);
		return new P256PrivateKey(publicKey, privateKey);
	}
}

export class P256PrivateKeyExportable extends P256PrivateKey implements PrivateKeyExportable {
	private constructor(keypair: CryptoKeyPair) {
		super(keypair.publicKey, keypair.privateKey);
	}

	async export(type: 'hex' | 'multikey'): Promise<string>;
	async export(type: 'bytes'): Promise<Uint8Array>;
	async export(type: 'bytes' | 'hex' | 'multikey'): Promise<string | Uint8Array> {
		const privateKeyBuffer = await crypto.subtle.exportKey('pkcs8', this._privateKey);
		const privateKey = new Uint8Array(
			privateKeyBuffer.slice(PCKS8_PRIVATE_KEY_PREFIX.length + 1, PCKS8_PRIVATE_KEY_PREFIX.length + 33),
		);

		switch (type) {
			case 'bytes': {
				return privateKey;
			}
			case 'hex': {
				return toBase16(privateKey);
			}
			case 'multikey': {
				const encoded = toBase58Btc(concatBuffers([P256_PRIVATE_PREFIX, privateKey]));
				return `z${encoded}`;
			}
		}

		throw new Error(`unknown "${type}" export type`);
	}

	static async createKeypair(): Promise<P256PrivateKeyExportable> {
		const keypair = await crypto.subtle.generateKey(ECDSA_ALG, true, ['sign', 'verify']);
		return new P256PrivateKeyExportable(keypair);
	}
}
