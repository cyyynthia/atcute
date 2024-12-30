import * as t from './types.js';

export class PlcError extends Error {}

export class MisorderedOperationError extends Error {
	constructor(operation: t.IndexedOperation, index: number) {
		super(`incorrectly ordered operation; index=${index}; cid=${operation.cid}`);
	}
}

export class ImproperOperationError extends Error {
	constructor(operation: t.IndexedOperation, reason: string) {
		super(`incorrectly formatted operation; cid=${operation.cid}; reason=${reason}`);
	}
}

export class InvalidSignatureError extends Error {
	constructor(operation: t.IndexedOperation) {
		super(`invalid signature; cid=${operation.cid}`);
	}
}

export class GenesisHashError extends Error {
	constructor(operation: t.IndexedOperation, did: t.DidPlcString) {
		super(`mismatching genesis hash; did=${did}; cid=${operation.cid}`);
	}
}

export class OperationHashError extends Error {
	constructor(operation: t.IndexedOperation, expected: string) {
		super(`invalid cid hash; expected=${expected}; got=${operation.cid}`);
	}
}

export class LateRecoveryError extends Error {
	constructor(operation: t.IndexedOperation, lapsed: number) {
		super(`recovery operation occured outside of recovery window; cid=${operation.cid}; lapsed=${lapsed}`);
	}
}
