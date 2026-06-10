// Query API service.
//
// Currently backed by a localStorage mock seeded from fixtures so the UI can
// be developed without the Spring Boot backend. Each exported function maps
// 1:1 to a real endpoint (noted above it); switching to the live API means
// replacing the bodies with fetch calls — the call sites stay unchanged.

import { SEED_QUERIES } from '../fixtures/queries';
import { QUERY_STATUS } from '../constants';

const STORAGE_KEY = 'cqs.queries';
const LATENCY_MS = 250;

const delay = (value) =>
  new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS));

function loadStore() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) return JSON.parse(raw);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_QUERIES));
  return [...SEED_QUERIES];
}

function saveStore(queries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queries));
}

function nextId(queries) {
  return queries.reduce((max, q) => Math.max(max, q.id), 0) + 1;
}

// GET /queries
export async function getQueries() {
  return delay(loadStore().filter((q) => !q.deleted));
}

// GET /queries/{id}
export async function getQueryById(id) {
  const query = loadStore().find((q) => q.id === Number(id) && !q.deleted);
  if (!query) throw new Error(`Query ${id} was not found or has been deleted.`);
  return delay(query);
}

// POST /queries
export async function createQuery(payload, { submit = false } = {}) {
  const queries = loadStore();
  const query = {
    ...payload,
    id: nextId(queries),
    version: 1,
    status: submit ? QUERY_STATUS.AWAITING_APPROVAL : QUERY_STATUS.DRAFT,
    dateSubmitted: submit ? new Date().toISOString() : null,
    dateResolved: null,
    notes: '',
    deleted: false,
  };
  saveStore([...queries, query]);
  return delay(query);
}

// PUT /queries
export async function updateQuery(id, changes) {
  const queries = loadStore();
  const index = queries.findIndex((q) => q.id === Number(id));
  if (index === -1) throw new Error(`Query ${id} was not found.`);
  queries[index] = { ...queries[index], ...changes };
  saveStore(queries);
  return delay(queries[index]);
}

// DELETE /queries — BRD: soft delete only
export async function softDeleteQueries(ids) {
  const idSet = new Set(ids.map(Number));
  const queries = loadStore().map((q) =>
    idSet.has(q.id) ? { ...q, deleted: true } : q
  );
  saveStore(queries);
  return delay({ deletedIds: ids });
}
