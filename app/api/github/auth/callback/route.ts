import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}?error=${error}`);
  }

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}?error=no_code`);
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      throw new Error(tokenData.error_description || 'Failed to get access token');
    }

    // Get user info
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    const userData = await userResponse.json();

    // Create a response that sets the token in localStorage
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>GitHub Authentication</title>
        </head>
        <body>
          <script>
            localStorage.setItem('github_token', '${tokenData.access_token}');
            localStorage.setItem('github_user', JSON.stringify(${JSON.stringify(userData)}));
            window.close();
            if (window.opener) {
              window.opener.location.reload();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Authentication successful! You can close this window.</p>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}?error=auth_failed`);
  }
}
