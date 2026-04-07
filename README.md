# Summit Prep

Summit Prep is a full-stack SAT and PSAT training site built for local testing.

It ships with:

- Unlimited random practice questions in Math, Reading, and Writing
- Full-length SAT and PSAT mock test generation
- Step-by-step explanations with a local generator and optional OpenAI integration
- Learn mode with strategy guides and worked examples
- Adaptive weakness tracking and targeted recommendations
- A progress dashboard with trends, mastery, and time tracking
- Local demo authentication out of the box, plus optional Firebase social sign-in support
- Local file-backed persistence out of the box, plus optional MongoDB support

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Copy env files if you want to customize settings:

```bash
copy backend\\.env.example backend\\.env
copy frontend\\.env.example frontend\\.env
```

3. Start both apps:

```bash
npm run dev
```

You can also use:

```bash
npm start
```

That now launches both the backend and frontend for local testing.

4. Open the frontend:

- `http://localhost:5173`

5. Backend status page:

- `http://localhost:4000`
- The API itself lives under `http://localhost:4000/api/...`

5. Demo login:

- Email: `demo@summitprep.dev`
- Password: `demo1234`

## Folder Structure

```text
SummitPrep/
  backend/
    src/
      config/
      data/
      middleware/
      repositories/
      routes/
      services/
      utils/
  frontend/
    src/
      api/
      auth/
      components/
      pages/
```

## Local-First Defaults

To make the project runnable immediately without extra setup:

- Auth defaults to local email/password sessions
- Data defaults to a JSON file store
- AI defaults to a local explanation/question generator

Optional integrations:

- OpenAI: set `AI_MODE=openai` and `OPENAI_API_KEY`
- Firebase social sign-in: set frontend and backend Firebase env vars, enable the Google provider in Firebase Auth, and switch `VITE_AUTH_MODE` to `firebase` so the Google button appears while email/password auth stays local
- MongoDB: set `DATABASE_PROVIDER=mongodb` and `MONGODB_URI`
- To import old local accounts and history from the JSON store into MongoDB, run `npm run migrate:mongo --workspace backend`

## MongoDB Atlas Setup

If you're new to MongoDB, use the beginner guide in [MONGODB_SETUP.md](/C:/Users/prave/Downloads/SATCodex/MONGODB_SETUP.md).

Short version:

1. Create a free MongoDB Atlas account and cluster.
2. Create a database user.
3. Add your IP address, or use `0.0.0.0/0` only for testing.
4. Copy the Node.js connection string.
5. Put it in [backend/.env](/C:/Users/prave/Downloads/SATCodex/backend/.env) as `MONGODB_URI`.
6. Run `npm run check:mongo --workspace backend`.
7. Start the app with `npm run dev`.

## Notes

- Practice content is original and generated for training use.
- Mock tests follow the current digital SAT/PSAT structure of 98 questions total.
- Score reports are training estimates, not official College Board score reports.
