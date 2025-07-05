# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/9958c938-1186-4eea-88de-4aebb3858150

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/9958c938-1186-4eea-88de-4aebb3858150) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run
npm install -g prisma bun
prisma init
# update the .env file with your database connection string as DATABASE_URL="postgresql://user:pass@localhost:5433/idea_dashboard?schema=public"
# Step 5: Install the following libs if you haven't already.
npm install next-auth@beta @auth/supabase-adapter @supabase/supabase-js bcryptjs @types/bcryptjs @auth/prisma-adapter @prisma/client --save-dev @types/node
# generate a secret key for your application. https://generate-secret.vercel.app/32
# Add it to .env as AUTH_SECRET=your-secret-key
# create or update the schema.prisma file with your database schema
npx prisma generate
# Step 5: Run the Prisma migrations to set up your database schema.
npx prisma db push
#or
npx prisma migrate dev --name "migration_name"
# Step 6: Start the development server.
# terminal1:
npm run start
# terminal2:
npm run dev
# and regularly do this
npx update-browserslist-db@latest
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/9958c938-1186-4eea-88de-4aebb3858150) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
