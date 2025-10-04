# Auth0 Setup Guide

This guide will help you configure Auth0 authentication for your Sharpeful Portfolio Analytics application.

## Prerequisites

1. An Auth0 account (sign up at https://auth0.com if you don't have one)
2. Access to your Auth0 Dashboard

## Step 1: Create an Auth0 Application

1. Log in to your Auth0 Dashboard
2. Navigate to "Applications" in the sidebar
3. Click "Create Application"
4. Choose "Single Page Web Applications" as the application type
5. Give your application a name (e.g., "Sharpeful Portfolio Analytics")

## Step 2: Configure Application Settings

In your Auth0 application settings, configure the following URLs:

### Allowed Callback URLs
```
http://localhost:5173, https://your-production-domain.com
```

### Allowed Logout URLs
```
http://localhost:5173, https://your-production-domain.com
```

### Allowed Web Origins
```
http://localhost:5173, https://your-production-domain.com
```

### Allowed Origins (CORS)
```
http://localhost:5173, https://your-production-domain.com
```

## Step 3: Get Your Auth0 Configuration

From your Auth0 application settings, copy the following values:

- **Domain**: Found in the "Basic Information" section
- **Client ID**: Found in the "Basic Information" section

## Step 4: Update Environment Variables

Update your `.env` file with your Auth0 configuration:

```env
VITE_AUTH0_DOMAIN=your-actual-auth0-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-actual-client-id
VITE_AUTH0_AUDIENCE=https://your-actual-auth0-domain.auth0.com/api/v2/
VITE_AUTH0_REDIRECT_URI=http://localhost:5173
```

**Important**: The `VITE_AUTH0_AUDIENCE` should be set to your Auth0 Management API identifier, typically `https://YOUR_DOMAIN.auth0.com/api/v2/`. This is required for the application to update user metadata during onboarding.

**Note**: Replace the placeholder values with your actual Auth0 configuration.

## Step 5: Configure Auth0 API (Optional)

If you want to use Auth0's Management API to store user metadata:

1. Go to "APIs" in your Auth0 Dashboard
2. Click on "Auth0 Management API"
3. Go to the "Machine to Machine Applications" tab
4. Authorize your application
5. Grant the following scopes:
   - `read:users`
   - `update:users`
   - `read:user_metadata`
   - `update:user_metadata`

## Step 6: Test the Integration

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:5173`
3. Click "Sign In with Auth0"
4. You should be redirected to Auth0's Universal Login
5. After successful authentication, you'll be redirected back to your application

## User Profile Data Storage

The application stores extended user profile data (investment preferences, risk tolerance, etc.) in Auth0's user metadata. This data is automatically synced when users complete the onboarding process.

## Production Deployment

When deploying to production:

1. Update the callback URLs, logout URLs, and web origins in your Auth0 application settings
2. Update your production environment variables with the correct Auth0 configuration
3. Ensure your production domain is added to all the allowed URL lists

## Troubleshooting

### Common Issues

1. **"Access denied" error**: Check that your domain and client ID are correct
2. **CORS errors**: Ensure your domain is added to "Allowed Web Origins"
3. **Redirect errors**: Verify your callback URLs are correctly configured
4. **User metadata not saving**: Check that your application has the necessary Management API scopes

### Support

For Auth0-specific issues, refer to the [Auth0 Documentation](https://auth0.com/docs) or contact Auth0 support.
