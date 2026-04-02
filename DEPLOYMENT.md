# Deploying Summit Prep

The fastest production setup for this project is:

- frontend on Vercel
- backend on a Node host
- MongoDB Atlas for the database

## Why this is the best fit

The frontend is a Vite app and is ready for static deployment.

The backend is a standalone Express server that runs as its own Node process, so it fits best on a backend host instead of being dropped directly into a static frontend deployment.

## Architecture

- Frontend: public website people visit
- Backend: API server the frontend talks to
- Database: MongoDB Atlas

## 1. Put the code on GitHub

1. Create a GitHub repository.
2. Push this project to GitHub.

## 2. Deploy the backend

Use a Node host such as Render, Railway, or Fly.io.

Set these backend environment variables:

```env
PORT=4000
DATABASE_PROVIDER=mongodb
MONGODB_URI=your_atlas_connection_string
CORS_ORIGINS=https://*.vercel.app,https://yourdomain.com,https://www.yourdomain.com
AUTH_PROVIDER=local
SESSION_SECRET=replace-this-with-a-long-random-secret
AI_MODE=local
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
```

If you want OpenAI-powered features in production:

```env
AI_MODE=openai
OPENAI_API_KEY=your_openai_key
```

After deployment, copy the backend URL. It will look something like:

```text
https://summit-prep-api.example.com
```

## 3. Deploy the frontend to Vercel

1. Import the GitHub repository into Vercel.
2. Set the root directory to `frontend`.
3. Let Vercel detect the framework as Vite.
4. The project includes a `vercel.json` rewrite that forwards `/api/*` requests to `https://summit-prep.onrender.com/api/*`.
5. If you keep using that Render URL, you do not need `VITE_API_BASE_URL` on Vercel.
6. If your backend URL changes, update `frontend/vercel.json` and redeploy.
7. Optionally add this environment variable if you prefer explicit frontend configuration:

```env
VITE_API_BASE_URL=https://your-backend-url.example.com/api
```

8. Deploy.

## 4. Add your custom domain

In Vercel, add your domain and follow the DNS instructions.

Then go back to your backend host and make sure `CORS_ORIGINS` includes:

- your `vercel.app` URL or `https://*.vercel.app`
- your final custom domain
- the `www` version if you use it

## 5. Test the live site

1. Open the frontend URL.
2. Create an account.
3. Generate a question.
4. Finish a test.
5. Check MongoDB Atlas to confirm live data is saving.

## Production checklist

- Change `SESSION_SECRET` from the local default.
- Keep `MONGODB_URI` private.
- Make sure Atlas network access allows your backend host to connect.
- Use HTTPS URLs for both frontend and backend.
