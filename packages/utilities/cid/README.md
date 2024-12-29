# @atcute/cid

lightweight [DASL CID][dasl-cid] codec library for AT Protocol.

[dasl-cid]: https://dasl.ing/cid.html

```ts
import * as CID from '@atcute/cid';

const cid = CID.fromString('bafyreihffx5a2e7k5uwrmmgofbvzujc5cmw5h4espouwuxt3liqoflx3ee');
//    ^? { version: 1, codec: 113, digest: { ... }, bytes: Uint8Array(36) }

// Creating a CID containing CBOR data
const cid = await CID.create(0x71, buffer);

// Serializing CID into string
CID.toString(cid); // -> bafyrei...
```
