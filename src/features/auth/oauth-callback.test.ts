import { exchangeOAuthCallback } from './oauth-callback';

describe('exchangeOAuthCallback', () => {
  it('exchanges only the authorization code from a native callback URL', async () => {
    const exchangeCodeForSession = jest.fn().mockResolvedValue({ error: null });

    await exchangeOAuthCallback(
      { exchangeCodeForSession },
      'exp://192.168.1.20:8081/--/auth/callback?code=oauth-code-123',
    );

    expect(exchangeCodeForSession).toHaveBeenCalledTimes(1);
    expect(exchangeCodeForSession).toHaveBeenCalledWith('oauth-code-123');
  });

  it('surfaces OAuth callback errors instead of attempting an empty code exchange', async () => {
    const exchangeCodeForSession = jest.fn();

    await expect(exchangeOAuthCallback(
      { exchangeCodeForSession },
      'startalks://auth/callback?error=access_denied&error_description=User%20cancelled',
    )).rejects.toThrow('User cancelled');

    expect(exchangeCodeForSession).not.toHaveBeenCalled();
  });
});
