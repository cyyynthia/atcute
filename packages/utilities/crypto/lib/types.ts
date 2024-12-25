/**
 * Represents a public cryptographic key
 */
export interface PublicKey {
	/** Returns the public key bytes */
	bytes(): Uint8Array;
	/** Returns a did:key representation of the public key */
	did(): `did:key:${string}`;
	/** Verifies a signature against a provided data */
	verify(sig: Uint8Array, data: Uint8Array, options?: VerifyOptions): Promise<boolean>;
}

/**
 * Represents a private cryptographic key
 */
export interface PrivateKey extends PublicKey {
	/** Signs provided data using the private key */
	sign(data: Uint8Array): Promise<Uint8Array>;
}

/**
 * Represents an exportable private cryptographic key
 */
export interface PrivateKeyExportable extends PrivateKey {
	/** Exports the private key */
	export(type: 'hex' | 'multikey'): string;
	export(type: 'bytes'): Uint8Array;
}

export interface VerifyOptions {
	allowMalleableSig?: boolean;
}
