# @atcute/multibase

multibase utilities, only supports a limited set of codecs.

```ts
import { toBase32 } from '@atcute/multibase';

const utf8 = new TextEncoder();
const base32 = toBase32(utf8.encode('lorem ipsum'));
//    ^? "nrxxezlnebuxa43vnu"
```
