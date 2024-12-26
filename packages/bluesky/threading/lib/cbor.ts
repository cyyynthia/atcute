import { encode } from '@atcute/cbor';
import { create, toString } from '@atcute/cid';

// Sanity-check by requiring a $type here, this is because the records are
// expected to be encoded with it, even though the PDS accepts record writes
// without the field.
export async function serializeRecordCid(record: { $type: string }): Promise<string> {
	const bytes = encode(record);

	const cid = await create(0x71, bytes);
	const serialized = toString(cid);

	return serialized;
}
