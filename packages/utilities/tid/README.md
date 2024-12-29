# @atcute/tid

atproto timestamp identifier codec library

```ts
import * as TID from '@atcute/tid';

const tidString = TID.now();
//    ^? "3l25zusnsfctk"

const result = TID.parse(tidString);
//    ^? { timestamp: 1724171495793000, clockid: 816 }
```
