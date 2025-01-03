import * as CBOR from '@atcute/cbor';
import * as CID from '@atcute/cid';
import { toSha256, verifySigWithDidKey } from '@atcute/crypto';
import { fromBase64Url, toBase32 } from '@atcute/multibase';

import * as err from './errors.js';
import * as t from './types.js';
import { normalizeOp } from './utils.js';

export const isSignedOperationValid = async (
	allowedKeys: t.DidKeyString[],
	op: t.CompatibleOperationOrTombstone,
): Promise<t.DidKeyString | null> => {
	const { sig, ...unsignedOp } = op;

	const sigBytes = fromBase64Url(sig);
	const opBytes = CBOR.encode(unsignedOp);

	for (const key of allowedKeys) {
		const ok = await verifySigWithDidKey(key, sigBytes, opBytes);

		if (ok) {
			return key;
		}
	}

	return null;
};

export const validateIndexedOperation = async (
	did: t.DidPlcString,
	history: t.IndexedOperation[],
	proposed: t.IndexedOperation,
): Promise<{ prev: string | null; ops: t.IndexedOperation[]; nullified: t.IndexedOperation[] }> => {
	if (history.length === 0) {
		if (proposed.operation.type === 'plc_tombstone') {
			throw new err.ImproperOperationError(proposed, `expected genesis op to not be tombstone`);
		}

		if (proposed.operation.prev !== null) {
			throw new err.ImproperOperationError(proposed, `expected null prev on genesis op`);
		}

		// Check if CID and DID matches
		{
			const opBytes = CBOR.encode(proposed.operation);

			const expectedDid = `did:plc:${toBase32(await toSha256(opBytes)).slice(0, 24)}`;
			if (expectedDid !== did) {
				throw new err.GenesisHashError(proposed, did);
			}

			const expectedCid = CID.toString(await CID.create(CID.CODEC_DCBOR, opBytes));
			if (expectedCid !== proposed.cid) {
				throw new err.InvalidHashError(proposed, expectedCid);
			}
		}

		// Check if signature is valid
		{
			const { rotationKeys } = normalizeOp(proposed.operation);

			const ok = isSignedOperationValid(rotationKeys, proposed.operation);
			if (!ok) {
				throw new err.InvalidSignatureError(proposed);
			}
		}

		return { nullified: [], prev: null, ops: [proposed] };
	}

	// Grab the previous reference
	const proposedPrev = proposed.operation.prev;
	if (!proposedPrev) {
		throw new err.ImproperOperationError(proposed, `expected prev op`);
	}

	const indexOfPrev = history.findIndex((op) => op.cid === proposedPrev);
	if (indexOfPrev === -1) {
		throw new err.ImproperOperationError(proposed, `prev op not in history`);
	}

	// Check if the CID matches
	{
		const opBytes = CBOR.encode(proposed.operation);
		const expectedCid = CID.toString(await CID.create(CID.CODEC_DCBOR, opBytes));
		if (expectedCid !== proposed.cid) {
			throw new err.InvalidHashError(proposed, expectedCid);
		}
	}

	// Get the proposed canonical history
	const alteredHistory = history.slice(0, indexOfPrev + 1);

	const nullified = history.slice(indexOfPrev + 1);
	const lastOp = alteredHistory.at(-1);

	if (!lastOp) {
		throw new err.ImproperOperationError(proposed, `missing last op`);
	}
	if (lastOp.operation.type === 'plc_tombstone') {
		throw new err.ImproperOperationError(proposed, `did is tombstoned`);
	}

	const lastOpNormalized = normalizeOp(lastOp.operation);
	const firstNullified = nullified[0];

	// We're not nullifying, check if the signature is valid and move on
	if (!firstNullified) {
		const ok = await isSignedOperationValid(lastOpNormalized.rotationKeys, proposed.operation);
		if (!ok) {
			throw new err.InvalidSignatureError(proposed);
		}

		return { nullified: [], prev: proposedPrev, ops: [...history, proposed] };
	}

	// The indexed log should say that all of the nullified has `nullified: true`
	for (let idx = 0, len = nullified.length; idx < len; idx++) {
		const op = nullified[idx];

		if (!op.nullified) {
			throw new err.ImproperOperationError(op, `expected nullified prop to be true`);
		}
	}

	// Check if operation within the recovery window
	{
		const SECOND = 1e3;
		const MINUTE = 60 * SECOND;
		const HOUR = 60 * MINUTE;

		const RECOVERY_WINDOW = 72 * HOUR;
		const lapsed = proposed.createdAt.getTime() - firstNullified.createdAt.getTime();

		if (lapsed > RECOVERY_WINDOW) {
			throw new err.LateRecoveryError(proposed, lapsed);
		}
	}

	// Check if the dispute is valid
	{
		const disputedSigner = await isSignedOperationValid(
			lastOpNormalized.rotationKeys,
			firstNullified.operation,
		);
		if (!disputedSigner) {
			throw new err.InvalidSignatureError(firstNullified);
		}

		const indexOfSigner = lastOpNormalized.rotationKeys.indexOf(disputedSigner);
		const morePowerfulKeys = lastOpNormalized.rotationKeys.slice(0, indexOfSigner);

		const ok = await isSignedOperationValid(morePowerfulKeys, proposed.operation);
		if (!ok) {
			throw new err.InvalidSignatureError(proposed);
		}
	}

	return { nullified: nullified, prev: proposedPrev, ops: [...alteredHistory, proposed] };
};

/**
 * Validate the logs returned from `/<did_identifier>/log/audit`
 */
export const validateIndexedOperationLog = async (
	did: t.DidPlcString,
	ops: t.IndexedOperationLog,
): Promise<{ canonical: t.IndexedOperation[]; nullified: t.IndexedOperation[] }> => {
	let nullified: t.IndexedOperation[] = [];
	let canonical: t.IndexedOperation[] = [];

	for (const operation of ops) {
		const result = await validateIndexedOperation(did, canonical, operation);
		canonical = result.ops;

		if (result.nullified.length > 0) {
			nullified = nullified.concat(result.nullified);
		}
	}

	return { canonical, nullified };
};
