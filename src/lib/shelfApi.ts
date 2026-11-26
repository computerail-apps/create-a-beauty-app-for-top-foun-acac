import type { SavedFoundation, WearTest } from '@/lib/foundation';

export type SaveInput = Omit<SavedFoundation, 'id'>;
export type WearInput = Omit<WearTest, 'id' | 'tested_on'>;

// Phase 2 replaces these bodies with real Supabase writes.
export async function saveFoundation(_input: SaveInput): Promise<void> {
  throw new Error('Saving is not wired to the database yet.');
}

export async function logWearTest(_input: WearInput): Promise<void> {
  throw new Error('Wear-test logging is not wired to the database yet.');
}
