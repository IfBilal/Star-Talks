import * as SecureStore from 'expo-secure-store';

const CHUNK_SIZE = 1800;
const AFTER_UNLOCK = SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY;

export const secureSessionStorage = {
  async getItem(key: string): Promise<string | null> {
    const countValue = await SecureStore.getItemAsync(`${key}.chunks`);
    if (!countValue) return SecureStore.getItemAsync(key);
    const count = Number(countValue);
    if (!Number.isInteger(count) || count < 1 || count > 20) return null;
    const chunks = await Promise.all(Array.from({ length: count }, (_, index) => SecureStore.getItemAsync(`${key}.${index}`)));
    return chunks.every((chunk): chunk is string => chunk !== null) ? chunks.join('') : null;
  },
  async setItem(key: string, value: string): Promise<void> {
    const countKey = `${key}.chunks`;
    const priorCount = Number(await SecureStore.getItemAsync(countKey) ?? 0);
    const chunks = value.match(new RegExp(`[\\s\\S]{1,${CHUNK_SIZE}}`, 'g')) ?? [''];
    await Promise.all(chunks.map((chunk, index) => SecureStore.setItemAsync(`${key}.${index}`, chunk, { keychainAccessible: AFTER_UNLOCK })));
    await SecureStore.setItemAsync(countKey, String(chunks.length), { keychainAccessible: AFTER_UNLOCK });
    await Promise.all(Array.from({ length: Math.max(0, priorCount - chunks.length) }, (_, offset) => SecureStore.deleteItemAsync(`${key}.${chunks.length + offset}`)));
    await SecureStore.deleteItemAsync(key);
  },
  async removeItem(key: string): Promise<void> {
    const count = Number(await SecureStore.getItemAsync(`${key}.chunks`) ?? 0);
    await Promise.all([
      SecureStore.deleteItemAsync(key),
      SecureStore.deleteItemAsync(`${key}.chunks`),
      ...Array.from({ length: Math.min(count, 20) }, (_, index) => SecureStore.deleteItemAsync(`${key}.${index}`)),
    ]);
  },
};
