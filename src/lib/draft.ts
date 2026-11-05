"use client";

// Borrador anónimo (7 días) en localStorage. Sin cuenta no hay datos en
// servidor; al registrarse, el cliente vincula el borrador a la cuenta
// (sin duplicación) y lo limpia. Caducidad efectiva al leer.

import { DRAFT_TTL_DAYS } from "@/lib/constants";

const ENTREPRENEUR_KEY = "ml_draft_entrepreneur_v1";
const OWNER_KEY = "ml_draft_owner_v1";
const TTL_MS = DRAFT_TTL_DAYS * 24 * 60 * 60 * 1000;

interface Envelope<T> {
  savedAt: number;
  data: T;
}

function load<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const env = JSON.parse(raw) as Envelope<T>;
    if (!env?.savedAt || Date.now() - env.savedAt > TTL_MS) {
      localStorage.removeItem(key); // caducidad efectiva y limpieza
      return null;
    }
    return env.data;
  } catch {
    return null;
  }
}

function save<T>(key: string, data: T): void {
  try {
    const env: Envelope<T> = { savedAt: Date.now(), data };
    localStorage.setItem(key, JSON.stringify(env));
  } catch {
    // almacenamiento no disponible: el flujo sigue sin borrador
  }
}

function clear(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* noop */
  }
}

export const entrepreneurDraft = {
  load: <T>() => load<T>(ENTREPRENEUR_KEY),
  save: <T>(d: T) => save(ENTREPRENEUR_KEY, d),
  clear: () => clear(ENTREPRENEUR_KEY),
};

export const ownerDraft = {
  load: <T>() => load<T>(OWNER_KEY),
  save: <T>(d: T) => save(OWNER_KEY, d),
  clear: () => clear(OWNER_KEY),
};
