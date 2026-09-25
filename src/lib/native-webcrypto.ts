import type { CryptoDigestAlgorithm } from 'expo-crypto';

export type NativeCryptoProvider = Pick<typeof import('expo-crypto'), 'digest' | 'getRandomValues' | 'randomUUID'>;

export function installNativeWebCrypto(
  target: { crypto?: Crypto; TextEncoder?: typeof TextEncoder },
  provider: NativeCryptoProvider,
): void {
  const current = target.crypto;
  if (!current?.subtle) {
    const subtle = {
      digest: ((algorithm: AlgorithmIdentifier, data: BufferSource) =>
        provider.digest(algorithm as CryptoDigestAlgorithm, data)) as SubtleCrypto['digest'],
    } as SubtleCrypto;

    const crypto = {
      ...(current ?? {}),
      getRandomValues: current?.getRandomValues?.bind(current) ?? provider.getRandomValues,
      randomUUID: current?.randomUUID?.bind(current) ?? provider.randomUUID,
      subtle,
    } as Crypto;

    try {
      Object.defineProperty(target, 'crypto', {
        configurable: true,
        enumerable: true,
        value: crypto,
        writable: true,
      });
    } catch {
      if (current) {
        try {
          Object.assign(current, { getRandomValues: crypto.getRandomValues, randomUUID: crypto.randomUUID, subtle });
        } catch {
          // Keep the app running if the JavaScript runtime freezes its global crypto object.
        }
      }
    }
  }

  if (!target.TextEncoder) {
    class NativeTextEncoder {
      readonly encoding = 'utf-8';

      encode(input = ''): Uint8Array {
        const encoded = encodeURIComponent(input);
        const bytes: number[] = [];
        for (let index = 0; index < encoded.length; index += 1) {
          if (encoded[index] === '%') {
            bytes.push(Number.parseInt(encoded.slice(index + 1, index + 3), 16));
            index += 2;
          } else {
            bytes.push(encoded.charCodeAt(index));
          }
        }
        return Uint8Array.from(bytes);
      }
    }
    Object.defineProperty(target, 'TextEncoder', { configurable: true, value: NativeTextEncoder });
  }
}
