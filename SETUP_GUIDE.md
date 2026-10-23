# Portfolio setup and deployment

This guide covers local setup, Supabase, project image uploads, contact alerts, and publishing
the portfolio on Vercel. The site is built with React, Vite, and Tailwind CSS.

## 1. Run the site locally

Install the current Node.js LTS release, open this folder in VS Code, then run:

```powershell
npm install
npm run dev
```

Open the Local URL printed in the terminal, usually `http://localhost:5173`.

## 2. Create and connect Supabase

1. Create a project at [supabase.com](https://supabase.com) and wait for it to finish setting up.
2. In Supabase, open **SQL Editor → New query**. For a brand-new database, paste and run the
   full `supabase_schema.sql` file. It creates the content tables, row-level security policies,
   and the project-image bucket.
3. For an existing database that already has the portfolio schema, run these two migrations
   instead, in this order:
   - `migration_projects_media.sql` adds project image, live site, GitHub, and video fields.
   - `migration_contact_security.sql` routes public contact submissions through the Edge
     Function and enables its request limit.
4. Go to **Authentication → Users → Add user** and create the admin account
   `dhruvshrivastava1803@gmail.com`. Set a strong password and confirm the account.
5. Open **Project Settings → API** and copy the Project URL and the `anon` public key.
   The `service_role` key is private; never put it in the website or send it to anyone.
6. In this folder, copy `.env.example` to `.env` and fill in:

   ```env
   VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR_ANON_PUBLIC_KEY
   ```

7. Stop and restart the local Vite server. The Demo mode notice should disappear. Test the
   Admin link at the bottom of the site by signing in with the admin account.

### Reuse an existing Supabase project

You can point the site at your current project by using its URL and anon public key in `.env`;
this does not change your project or its existing Edge Functions. The site expects the
portfolio tables and columns in `supabase_schema.sql`. Project image and link editing also
requires `migration_projects_media.sql`. The current contact form calls an Edge Function named
`contact-message`; an existing function can stay untouched if it already exposes the same
request/response behavior. Otherwise, the form will need to call your function's name and
payload format, or the contact feature will need its own function.

The public key is intended for the browser; Supabase row-level security policies protect
editing. Do not put private provider credentials in `VITE_` variables.

## 3. Add project images and links

After running `migration_projects_media.sql`, sign in through the site's Admin page. In each
project you can set its live website, GitHub repository, demo video, and a JPG, PNG, WebP, or
AVIF cover image up to 5 MB. Save the project to publish the updates. YouTube and Vimeo links
open in the site's video viewer; direct MP4 links work as well.

## 4. Deploy the site to Vercel

### Push the project to GitHub

1. Create a new empty repository on [GitHub](https://github.com). Do not add a README or
   `.gitignore` there; this project already has those files.
2. In VS Code, open **Terminal → New Terminal** in the project folder. If this folder is not
   already a Git repository, run `git init` once.
3. Run the following, replacing the URL with your new GitHub repository URL:

   ```powershell
   git add .
   git commit -m "Prepare portfolio for deployment"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
   git push -u origin main
   ```

   If Git says `origin` already exists, skip the `git remote add origin` line. The `.gitignore`
   excludes `.env`, `node_modules`, and `dist`; confirm `.env` is not listed by `git status`
   before pushing.

### Import the GitHub repository into Vercel

1. Sign in at [vercel.com](https://vercel.com) and choose **Add New → Project**.
2. Connect GitHub if asked, find this repository, and choose **Import**.
3. Vercel should detect Vite. Use these build settings if it asks:
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Output directory: `dist`
4. In **Environment Variables**, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` with
   the same values as your local `.env`. Enable them for Production and Preview as needed.
5. Choose **Deploy**. When it finishes, open the Vercel URL and check the site and Admin login.

For later changes, commit and push to GitHub; Vercel will build and publish the update.

### Set Supabase's allowed site URLs

After Vercel gives you a URL, open **Supabase → Authentication → URL Configuration**. Set
**Site URL** to the live site URL and add that URL to the allowed redirect URLs. Add
`http://localhost:5173/**` too if you want to test authentication locally. If you add a custom
domain in Vercel, add that domain in Supabase as well.

## 5. Enable SMS and WhatsApp contact alerts

The contact form stores messages in Supabase. To send alerts to your phone by both channels,
create/configure SMS and WhatsApp senders in Twilio. Trial accounts generally require verified
recipients; WhatsApp Sandbox recipients must opt in. Production WhatsApp delivery needs the
appropriate Twilio/WhatsApp setup.

After the Vercel deployment is live, install/use the Supabase CLI from the project folder and
run:

```powershell
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase secrets set SITE_ORIGIN=https://YOUR_VERCEL_DOMAIN CONTACT_ALERT_PHONE=YOUR_PHONE_IN_E164 TWILIO_ACCOUNT_SID=YOUR_TWILIO_ACCOUNT_SID TWILIO_AUTH_TOKEN=YOUR_TWILIO_AUTH_TOKEN TWILIO_FROM_NUMBER=YOUR_TWILIO_SMS_SENDER TWILIO_WHATSAPP_FROM=YOUR_TWILIO_WHATSAPP_SENDER
npx supabase functions deploy contact-message
```

Use your exact live site origin for `SITE_ORIGIN`, without a trailing slash. Set the alert
phone in international format, such as `+91...`. Use your own Twilio sender numbers; the
WhatsApp sender value is the number only, without the `whatsapp:` prefix. Keep Twilio values
in Supabase secrets only. Do not put them in GitHub, `.env`, Vercel environment variables, or
frontend code.

Submit a test message from the live site. Confirm it appears in the Admin messages section
and that both alerts arrive. Messages are saved even if Twilio cannot deliver an alert.

## 6. Edit the live portfolio

Open the site and choose **Admin** in the footer. Sign in with the admin account to edit your
profile, project links and images, skills, experience, certificates, and contact messages.
Changes to content are stored in Supabase; code changes are published by pushing them to
GitHub for Vercel to build.

## Troubleshooting

- **Demo mode still appears:** check the Vercel `VITE_SUPABASE_URL` and
  `VITE_SUPABASE_ANON_KEY` values, then redeploy.
- **Project uploads fail:** confirm `migration_projects_media.sql` ran successfully and that
  you are signed into Admin with the authorized account.
- **Contact form fails:** confirm `migration_contact_security.sql` ran and the Edge Function is
  deployed with all required Supabase and Twilio secrets. Check Supabase **Edge Function Logs**.
- **Build fails on Vercel:** check the deployment build log and make sure the build command is
  `npm run build` and output directory is `dist`.

The security of the deployed site depends on the Supabase policies, deployment settings, and
keeping private keys secret. No setup can guarantee that a site passes every possible security
test.
