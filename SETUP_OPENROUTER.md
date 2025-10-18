# OpenRouter API Setup Guide

This guide will help you configure the OpenRouter API for your Process Automation application.

## What Changed?

The application has been refactored to use a **secure server-side API route** instead of calling OpenRouter directly from the client. This keeps your API key safe and never exposes it to the browser.

## Setup Steps

### 1. Get Your OpenRouter API Key

1. Visit [OpenRouter](https://openrouter.ai/)
2. Sign up or log in to your account
3. Navigate to [API Keys](https://openrouter.ai/keys)
4. Create a new API key and copy it

### 2. Create Environment File

Create a file named `.env.local` in the **root directory** of your project (same level as `package.json`):

```bash
# On Windows (PowerShell)
New-Item -Path ".env.local" -ItemType File

# On macOS/Linux
touch .env.local
```

### 3. Add Your API Key

Open `.env.local` and add your OpenRouter API key:

```env
OPEN_ROUTER_API_KEY=your_actual_api_key_here
```

Replace `your_actual_api_key_here` with the API key you copied from OpenRouter.

### 4. Restart Your Development Server

After creating the `.env.local` file, restart your Next.js development server:

```bash
# Stop the current server (Ctrl+C)
# Then restart it:
npm run dev
```

## How It Works

### Architecture

```
Client (Browser)
    ↓
Next.js API Route (/api/openrouter)
    ↓
OpenRouter API
```

**Benefits:**
- ✅ API key is never exposed to the browser
- ✅ More secure
- ✅ Can implement rate limiting and caching
- ✅ Better error handling

### Files Modified

1. **`src/app/api/openrouter/route.ts`** (NEW)
   - Server-side API route
   - Handles OpenRouter API calls
   - Validates API key before making requests

2. **`src/lib/openRouter.ts`** (UPDATED)
   - Now calls the internal API route instead of OpenRouter directly
   - Simpler client-side code

## Testing

To verify the setup works:

1. Start your development server: `npm run dev`
2. Navigate to the "Process Questions" page
3. Enter a question about process automation
4. Click "Get Recommendations"

If configured correctly, you should receive AI-generated recommendations!

## Troubleshooting

### Error: "Open Router API key not configured"

**Solution:** Make sure:
- `.env.local` exists in the project root (not in `src/` folder)
- The file contains `OPEN_ROUTER_API_KEY=your_key`
- You've restarted the development server after creating the file

### Error: "API error: 401 Unauthorized"

**Solution:** 
- Your API key is invalid or expired
- Get a new key from [OpenRouter](https://openrouter.ai/keys)
- Update `.env.local` with the new key
- Restart the server

### Error: "API error: 429 Too Many Requests"

**Solution:**
- You've exceeded your rate limit
- Wait a few minutes before trying again
- Consider upgrading your OpenRouter plan

## Model Configuration

The default model is `anthropic/claude-3-haiku:beta`. To use a different model:

1. Open `src/lib/openRouter.ts`
2. Change the `model` parameter in the `queryOpenRouter` function
3. Available models: https://openrouter.ai/models

Example models:
- `anthropic/claude-3-haiku:beta` (fast, cost-effective)
- `anthropic/claude-3-sonnet` (balanced)
- `anthropic/claude-3-opus` (most capable)
- `openai/gpt-4-turbo`
- `openai/gpt-3.5-turbo`

## Security Notes

- ⚠️ **Never commit `.env.local` to Git** - It's already in `.gitignore`
- ⚠️ **Don't share your API key** publicly
- ✅ Each team member should have their own `.env.local` file
- ✅ For production, use environment variables in your hosting platform (Vercel, etc.)

## Cost Management

OpenRouter charges based on usage. To manage costs:

1. Set up credits at [OpenRouter Settings](https://openrouter.ai/settings/credits)
2. Monitor usage at [OpenRouter Activity](https://openrouter.ai/activity)
3. Use cost-effective models like `claude-3-haiku` for development
4. Consider implementing caching for repeated queries

## Support

- OpenRouter Documentation: https://openrouter.ai/docs
- OpenRouter Discord: https://discord.gg/openrouter
- Project Issues: [Create an issue in your repository]

