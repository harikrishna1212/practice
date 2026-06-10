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

// GET /admin/queries — submitted queries only; Drafts are not visible to
// Admins (BRD assumption #5: the Admin status list excludes Draft).
export async function getAdminQueries() {
  return delay(
    loadStore().filter((q) => !q.deleted && q.status !== QUERY_STATUS.DRAFT)
  );
}

function resolveQuery(id, changes) {
  const queries = loadStore();
  const index = queries.findIndex((q) => q.id === Number(id));
  if (index === -1) throw new Error(`Query ${id} was not found.`);
  queries[index] = {
    ...queries[index],
    ...changes,
    dateResolved: new Date().toISOString(),
  };
  saveStore(queries);
  return queries[index];
}

// PUT /admin/query/{id}/approve — BRD: approval generates the unique numeric
// Query ID used by callers (MicroAutomation) to execute the query.
export async function approveQuery(id, notes) {
  const queries = loadStore();
  const maxUid = queries.reduce((max, q) => Math.max(max, q.uniqueQueryId || 100000), 100000);
  return delay(
    resolveQuery(id, {
      status: QUERY_STATUS.APPROVED,
      uniqueQueryId: maxUid + 1,
      notes: notes || '',
    })
  );
}

// PUT /admin/query/{id}/reject
export async function rejectQuery(id, notes) {
  return delay(resolveQuery(id, { status: QUERY_STATUS.REJECTED, notes: notes || '' }));
}

// PUT /admin/query/{id}/disable
export async function disableQuery(id, notes) {
  return delay(resolveQuery(id, { status: QUERY_STATUS.DISABLED, notes: notes || '' }));
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
