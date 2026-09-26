type AuthCodeExchanger = {
  exchangeCodeForSession: (code: string) => Promise<{ error: Error | null }>;
};

function queryParameter(url: string, name: string) {
  const queryStart = url.indexOf('?');
  if (queryStart < 0) return undefined;
  const query = url.slice(queryStart + 1).split('#', 1)[0];
  const entry = query.split('&').find(part => part.slice(0, part.indexOf('=')) === name);
  if (!entry) return undefined;
  const value = entry.slice(entry.indexOf('=') + 1).replace(/\+/g, ' ');
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export async function exchangeOAuthCallback(auth: AuthCodeExchanger, callbackUrl: string) {
  const code = queryParameter(callbackUrl, 'code');
  const authError = queryParameter(callbackUrl, 'error_description') ?? queryParameter(callbackUrl, 'error');

  if (typeof code !== 'string' || code.length === 0) {
    throw new Error(typeof authError === 'string' ? authError : 'Google sign-in returned without an authorization code.');
  }

  const { error } = await auth.exchangeCodeForSession(code);
  if (error) throw error;
}
