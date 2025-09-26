# GitHub App Setup for Glacier

This guide will help you set up a GitHub App for Glacier to enable repository management and code generation features.

## 1. Create a GitHub App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New GitHub App"
3. Fill in the following details:

### Basic Information
- **GitHub App name**: `Glacier AI Coding Tool`
- **Homepage URL**: `https://xglacier.vercel.app`
- **User authorization callback URL**: `https://xglacier.vercel.app/api/github/auth/callback`
- **Webhook URL**: `https://xglacier.vercel.app/api/github/webhook`
- **Webhook secret**: Generate a random string (save this!)

### Permissions

#### Repository permissions:
- **Contents**: Read and write
- **Metadata**: Read
- **Pull requests**: Write
- **Issues**: Write
- **Repository hooks**: Write

#### User permissions:
- **User**: Read
- **User email**: Read

### Events
Subscribe to these events:
- Repository
- Pull request
- Push
- Issues
- Issue comment

### Installation
- **Where can this GitHub App be installed?**: Any account

## 2. Generate Private Key

1. After creating the app, scroll down to "Private keys"
2. Click "Generate a private key"
3. Download the `.pem` file
4. Convert it to a single-line string for environment variables

## 3. Environment Variables

Add these to your `.env.local` file:

```bash
# GitHub App Configuration
GITHUB_APP_ID=your_app_id
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END RSA PRIVATE KEY-----"
GITHUB_WEBHOOK_SECRET=your_webhook_secret

# For Vercel deployment, add these to your Vercel environment variables
```

## 4. Install the App

1. Go to your GitHub App settings
2. Click "Install App"
3. Choose which repositories to install on
4. Complete the installation

## 5. Test the Integration

1. Start your development server: `npm run dev`
2. Go to the GitHub mode in Glacier
3. Enter your GitHub Personal Access Token
4. Test creating repositories and managing files

## 6. Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add the environment variables in Vercel dashboard
4. Deploy

## 7. Update GitHub App URLs

After deployment, update your GitHub App settings with the production URLs:
- Homepage URL: `https://xglacier.vercel.app`
- Callback URL: `https://xglacier.vercel.app/api/github/auth/callback`
- Webhook URL: `https://xglacier.vercel.app/api/github/webhook`

## Features Enabled

With the GitHub App set up, users can:

- ✅ Create new repositories
- ✅ Browse existing repositories
- ✅ View and edit files
- ✅ Create pull requests
- ✅ Manage issues
- ✅ Clone repositories
- ✅ Generate code directly to GitHub

## Security Notes

- Never commit your private key or secrets to version control
- Use environment variables for all sensitive data
- Regularly rotate your webhook secret
- Monitor your app's usage and permissions

## Troubleshooting

### Common Issues:

1. **"Bad credentials" error**: Check your GitHub token and permissions
2. **Webhook not working**: Verify the webhook URL and secret
3. **Permission denied**: Ensure the app has the correct repository permissions
4. **Rate limiting**: GitHub has API rate limits; consider implementing caching

### Getting Help:

- Check GitHub's [App documentation](https://docs.github.com/en/developers/apps)
- Review the [Octokit documentation](https://octokit.github.io/rest.js/)
- Check the browser console for detailed error messages
