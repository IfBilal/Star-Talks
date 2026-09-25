import { installNativeWebCrypto, type NativeCryptoProvider } from './native-webcrypto';

describe('installNativeWebCrypto', () => {
  it('provides a SHA-256 subtle digest and secure random helpers when unavailable', async () => {
    const digest = jest.fn(async () => new Uint8Array([1, 2, 3]).buffer);
    const getRandomValues = jest.fn((value: Uint8Array) => value);
    const randomUUID = jest.fn(() => 'secure-id');
    const provider = { digest, getRandomValues, randomUUID } as unknown as NativeCryptoProvider;
    const target: { crypto?: Crypto; TextEncoder?: typeof TextEncoder } = {};

    installNativeWebCrypto(target, provider);

    const input = new Uint8Array([9, 8, 7]);
    await expect(target.crypto!.subtle.digest('SHA-256', input)).resolves.toEqual(new Uint8Array([1, 2, 3]).buffer);
    expect(digest).toHaveBeenCalledWith('SHA-256', input);
    const random = new Uint8Array(4);
    expect(target.crypto!.getRandomValues(random)).toBe(random);
    expect(randomUUID()).toBe('secure-id');
    expect(new target.TextEncoder!().encode('Star Talks')).toEqual(new Uint8Array([83, 116, 97, 114, 32, 84, 97, 108, 107, 115]));
    expect(new target.TextEncoder!().encode('☾')).toEqual(new Uint8Array([226, 152, 190]));
  });

  it('leaves a complete WebCrypto implementation untouched', () => {
    const subtle = { digest: jest.fn() } as unknown as SubtleCrypto;
    const current = { subtle } as Crypto;
    const target = { crypto: current };
    const provider = {} as NativeCryptoProvider;

    installNativeWebCrypto(target, provider);

    expect(target.crypto).toBe(current);
  });
});
