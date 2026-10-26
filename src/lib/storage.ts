// localStorage へのアクセスはこのファイルだけで行う。
// 本番では Firebase（Firestore）に差し替える想定のため、公開するのは CRUD 関数だけにする。
import type { CaseStudy, Log, Project } from '../types';

type CollectionMap = {
  projects: Project;
  logs: Log;
  'case-studies': CaseStudy;
};

export type CollectionName = keyof CollectionMap;

type SystemFields = 'id' | 'createdAt' | 'updatedAt';
export type CreateInput<K extends CollectionName> = Omit<CollectionMap[K], SystemFields>;
export type UpdateInput<K extends CollectionName> = Partial<CreateInput<K>>;

const KEY_PREFIX = 'rationale-log:';

// 読み込んだデータを保持する。localStorage が使えない環境でも、開いている間は動くようにする
const cache: Partial<Record<CollectionName, unknown[]>> = {};

function isEntity(value: unknown): value is { id: string } {
  return typeof value === 'object' && value !== null && typeof (value as { id?: unknown }).id === 'string';
}

function read<K extends CollectionName>(name: K): CollectionMap[K][] {
  const cached = cache[name];
  if (cached) return cached as CollectionMap[K][];

  let items: CollectionMap[K][] = [];
  try {
    const raw = localStorage.getItem(KEY_PREFIX + name);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        items = parsed.filter(isEntity) as CollectionMap[K][];
      }
    }
  } catch {
    // パース失敗・localStorage が使えない場合は空データにフォールバックする
    items = [];
  }
  cache[name] = items;
  return items;
}

function write<K extends CollectionName>(name: K, items: CollectionMap[K][]): void {
  cache[name] = items;
  try {
    localStorage.setItem(KEY_PREFIX + name, JSON.stringify(items));
  } catch {
    // 保存できない環境ではメモリ上のデータだけで動かす
  }
}

function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function list<K extends CollectionName>(name: K): CollectionMap[K][] {
  return [...read(name)];
}

export function get<K extends CollectionName>(name: K, id: string): CollectionMap[K] | null {
  return read(name).find((item) => item.id === id) ?? null;
}

export function create<K extends CollectionName>(name: K, input: CreateInput<K>): CollectionMap[K] {
  const now = new Date().toISOString();
  const item = { ...input, id: newId(), createdAt: now, updatedAt: now } as CollectionMap[K];
  write(name, [...read(name), item]);
  return item;
}

export function update<K extends CollectionName>(
  name: K,
  id: string,
  patch: UpdateInput<K>,
): CollectionMap[K] | null {
  const items = read(name);
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const updated: CollectionMap[K] = { ...items[index], ...patch, id, updatedAt: new Date().toISOString() };
  write(name, items.map((item, i) => (i === index ? updated : item)));
  return updated;
}

export function remove<K extends CollectionName>(name: K, id: string): void {
  write(
    name,
    read(name).filter((item) => item.id !== id),
  );
}
