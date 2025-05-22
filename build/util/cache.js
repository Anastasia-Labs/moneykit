"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.set = exports.get = void 0;
const node_cache_1 = __importDefault(require("node-cache"));
const cache = new node_cache_1.default();
const get = (key) => cache.get(key);
exports.get = get;
const set = (key, val, ttlSec) => cache.set(key, val, ttlSec);
exports.set = set;
