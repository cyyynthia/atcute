# @atcute/crypto

lightweight atproto cryptographic library, supporting its two "blessed" elliptic curve cryptography
systems:

- `p256`: uses WebCrypto API.
- `secp256k1`: uses `node:crypto` on Node.js, [`@noble/secp256k1`][noble-secp256k1] everywhere else
  (browsers, Bun, Deno).

[noble-secp256k1]: https://github.com/paulmillr/noble-secp256k1

```ts
import { Secp256k1PrivateKeyExportable, verifySigWithDidKey } from './index.js';

const keypair = await Secp256k1PrivateKeyExportable.createKeypair();

// `.sign()` hashes the data and signs it
const data = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
const sig = await keypair.sign(data);

// `.exportPublicKey()` exports the public key in various formats
// e.g. `did:key:zQ3shVRtgqTRHC7Lj4DYScoDgReNpsDp3HBnuKBKt1FSXKQ38`
const didPublicKey = await keypair.exportPublicKey('did');

// `.verify()` can be used to check if the signature is valid, but to save the
// hassle of figuring out the key type, we can use `verifySigWithDidKey()`
const ok = await verifySigWithDidKey(didPublicKey, sig, data);

expect(ok).toBe(true);
```
