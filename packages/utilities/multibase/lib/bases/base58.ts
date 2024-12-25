import { createRfc4648Decode, createRfc4648Encode } from '../utils.js';

const BASE58BTC_CHARSET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

export const fromBase58Btc = /*#__PURE__*/ createRfc4648Decode(BASE58BTC_CHARSET, 5, false);

export const toBase58Btc = /*#__PURE__*/ createRfc4648Encode(BASE58BTC_CHARSET, 5, false);
