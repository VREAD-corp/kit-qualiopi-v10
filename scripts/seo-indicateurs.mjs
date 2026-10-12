import { INDICATOR_PAGES_CONTENT } from './seo-indicateurs-data.mjs';
export function pagesIndicateurs() { return Object.keys(INDICATOR_PAGES_CONTENT).length ? [] : []; }
