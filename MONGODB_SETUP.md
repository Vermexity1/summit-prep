# MongoDB Atlas Setup For Summit Prep

This guide is for the current project in `C:\Users\prave\Downloads\SATCodex`.

## What this changes

Right now the app can save data in a local JSON file.

When MongoDB is connected, Summit Prep will instead save users, sessions, question history, practice attempts, and test results in your Atlas database.

## Before you start

Make sure these two files already exist:

- `C:\Users\prave\Downloads\SATCodex\backend\.env`
- `C:\Users\prave\Downloads\SATCodex\backend\.env.example`

## Step 1: Create a free Atlas account

1. Go to [MongoDB Atlas](https://www.mongodb.com/products/platform/atlas-database).
2. Click the option to start free.
3. Create your account and verify your email if Atlas asks for it.

## Step 2: Create your first cluster

1. In Atlas, create a new project if it asks.
2. Create a free cluster.
3. Pick any cloud provider and region close to you.
4. Wait until Atlas says the cluster is ready.

## Step 3: Create a database username and password

1. In Atlas, open the database security section for database access.
2. Create a new database user.
3. Choose a username you will remember.
4. Generate or type a strong password.
5. Save that password somewhere safe. You will need it in the connection string.

## Step 4: Allow your computer to connect

1. In Atlas, open the network access or IP access list section.
2. Add your current IP address.
3. For testing only, you can allow `0.0.0.0/0`, which means any IP.
4. If you use `0.0.0.0/0`, tighten it later before production.

## Step 5: Get the Node.js connection string

1. In Atlas, click `Connect` on your cluster.
2. Choose `Drivers`.
3. Choose `Node.js` if Atlas asks.
4. Copy the `mongodb+srv://...` connection string.
5. Replace `<password>` with the database user's real password.
6. If the URI includes `<dbName>`, replace it with a database name like `summitprep`.

Example format:

```text
mongodb+srv://myUser:myPassword@cluster-name.xxxxx.mongodb.net/summitprep?retryWrites=true&w=majority&appName=Cluster0
```

## Step 6: Paste it into the project

Open `C:\Users\prave\Downloads\SATCodex\backend\.env` and set:

```env
DATABASE_PROVIDER=mongodb
MONGODB_URI=your_full_atlas_connection_string
```

Leave the other values as they are unless you want to customize them.

## Step 7: Test the connection

From the project root, run:

```bash
npm run check:mongo --workspace backend
```

If it works, you should see a success message.

If it fails:

- Check that the password in the URI is correct.
- Check that your IP address was added in Atlas.
- Check that the database user exists.
- Check that you copied the full `mongodb+srv://` string.

## Step 8: Start the app

Run:

```bash
npm run dev
```

The backend will connect to MongoDB automatically on startup.

## Step 9: Confirm your data is in Atlas

1. Sign up or log in inside Summit Prep.
2. Answer a practice question or finish a test.
3. Go back to Atlas and open the collections view.
4. You should see collections like:
   - `users`
   - `sessions`
   - `practiceAttempts`
   - `testResults`
   - `issuedQuestions`
   - `mockTests`

## What I already did for you

- Created `C:\Users\prave\Downloads\SATCodex\backend\.env`
- Set the project so it is ready to switch to MongoDB as soon as you paste a real URI
- Added a connection test command: `npm run check:mongo --workspace backend`

## What I cannot do from here

I cannot create your Atlas account, cluster, username, or secret password for you because those belong to your personal cloud account.

I can finish the project-side setup immediately once you paste your connection string into `backend/.env`, or if you send me the URI and want me to place it for you.
