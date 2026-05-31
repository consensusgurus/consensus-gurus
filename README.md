# Consensus Gurus

Top ten lists from every angle. AI Optimized, Consensus, named publications, and reader votes.

Next.js 14 + Supabase. Runs on Vercel's hobby tier and Supabase's free tier.

---

## Features

- 25 built-in lists across food, travel, entertainment, tech, products, and city-specific places
- Multiple ranking sources per list (AI Optimized, Consensus, IMDB, RTINGS, Eater, etc.)
- Reader voting with up and down arrows
- Reader-submitted lists with **moderation queue** (admin must approve before they go public)
- Per-item affiliate links (Amazon, Booking, Maps, IMDB, etc.) with per-list URL overrides
- Search and filter by category
- Static-generated detail pages for each built-in list (great SEO)
- Privacy policy, terms of service, and affiliate disclosure pages built in
- Editor's desk admin dashboard at `/admin`

---

## What you need before starting

1. **Node.js 18 or newer.** Check with `node --version`. Install from [nodejs.org](https://nodejs.org) if needed.
2. **A GitHub account.** Sign up at [github.com](https://github.com).
3. **A Vercel account.** Sign up at [vercel.com](https://vercel.com) using your GitHub login.
4. **A Supabase account.** Sign up at [supabase.com](https://supabase.com).
5. **A domain.** Buy from [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/) or [Porkbun](https://porkbun.com).

---

## Step 1: Local setup

```bash
cd consensus-gurus
npm install
```

### Create Supabase project

1. Log into Supabase and click **New project**.
2. Name it `consensus-gurus`, set a strong database password (save it), pick a region, click **Create new project**. Wait about 2 minutes.
3. In the left sidebar click **SQL Editor** then **New query**.
4. Open `supabase/schema.sql` from this project, copy all of it, paste into the SQL editor, click **Run**. You should see "Success. No rows returned."

### Get your project URL and API keys

Supabase reorganized their dashboard in 2025. The keys live in a different place than older tutorials describe. Here is the current path:

**Step A: Get your Project URL**

Click the **Connect** button at the top of your project page. A dialog opens showing your project URL (looks like `https://abcxyz.supabase.co`). Copy it.

You can also find it under **Project Settings** → **Data API** → "Project URL".

**Step B: Get your two keys**

In the left sidebar click **Project Settings** (the gear icon), then **API Keys**.

You will see two tabs. **What you copy depends on which tab has keys for you**:

- **If the "API Keys" tab has keys**: copy the **Publishable key** (starts with `sb_publishable_...`). Then copy the **Secret key** (starts with `sb_secret_...`). You may need to click "Reveal" to see the Secret key.
- **If the "API Keys" tab is empty**: click the **Legacy API Keys** tab. Copy the **anon** key and the **service_role** key (long strings starting with `eyJ...`). The service_role needs to be revealed.

Either set of keys works with this project. Newer Supabase accounts get the publishable/secret system; older ones still have the legacy keys. They behave identically for our purposes.

In `.env.local`:

- Paste your **Publishable key** (or legacy `anon` key) into `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Paste your **Secret key** (or legacy `service_role` key) into `SUPABASE_SERVICE_ROLE_KEY`.

The env var names in our code don't change — only the values you paste in.

### Set environment variables

Copy the example file:

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://abcxyz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ADMIN_PASSWORD=some-long-random-string
```

Generate a strong admin password with:
```bash
openssl rand -base64 32
```

### Run it

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000). Vote on something, refresh, see that it persists.

Visit [http://localhost:3000/admin](http://localhost:3000/admin) to see the editor's desk. Sign in with the `ADMIN_PASSWORD` you set.

---

## Step 2: Test the submission and moderation flow

1. Go to `/submit` and create a test list.
2. Hit submit — you'll land on a "Thanks, your list is in the queue" page.
3. The list does NOT appear on the home page yet.
4. Go to `/admin`, sign in, and you'll see your submission in the Pending tab.
5. Click **Publish**. The list is now live on the home page.

That's the moderation loop. Use the **Unpublish** button to pull a list back, or **Delete** to remove it entirely.

---

## Step 3: Push to GitHub

1. Go to [github.com/new](https://github.com/new). Name the repo `consensus-gurus`. Don't initialize with a README.
2. In your terminal:

```bash
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/consensus-gurus.git
git push -u origin main
```

---

## Step 4: Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new).
2. Import your `consensus-gurus` repo.
3. Expand **Environment Variables** and add all four:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_PASSWORD`
4. Click **Deploy**. About a minute later you have a live URL.

---

## Step 5: Custom domain

1. Buy your domain at Cloudflare Registrar or Porkbun (~$10–15/year).
2. In Vercel: **Settings** → **Domains**, type your domain, click **Add**.
3. Copy the DNS records Vercel shows.
4. At your registrar's DNS panel, add those records.
5. Wait 5–60 minutes for DNS to propagate. SSL is automatic.

---

## Step 6: Apply for Amazon Associates

1. Go to [affiliate-program.amazon.com](https://affiliate-program.amazon.com).
2. Apply with your live domain. Approval takes a day or two.
3. Once approved, replace `cgurus-20` in `lib/data.js` with your real tracking ID if it differs (or leave it if Amazon kept the same ID).
4. Amazon requires 3 qualifying sales within 180 days to stay enrolled.

The affiliate disclosure footer and `/disclosure` page already contain the required Amazon language.

---

## Step 7: Customize legal pages

The privacy, terms, and disclosure pages have placeholders you should edit before going live:

- `app/privacy/page.js` — replace `hello@your-domain.com` with your real contact email
- `app/terms/page.js` — replace `[your state or country]` with your jurisdiction, and update the contact email
- `app/disclosure/page.js` — update the contact email

Then commit and push. Vercel rebuilds automatically.

---

## Admin dashboard at /admin

- **Login** at `/admin/login` with your `ADMIN_PASSWORD`
- **Pending tab** shows all submissions waiting for review
- **Published tab** shows everything currently live (you can unpublish or delete)
- Sessions last 30 days via a secure HTTP-only cookie
- Sign out via the **Sign out** button in the corner

The admin URL is `noindex,nofollow` so it won't appear in search engines, but pick a strong password regardless.

---

## File layout

```
consensus-gurus/
├── app/
│   ├── layout.js              # Root layout with fonts and meta
│   ├── globals.css            # Base CSS
│   ├── Grain.jsx              # Shared SVG grain texture
│   ├── Footer.jsx             # Shared footer with affiliate disclosure + legal links
│   ├── LegalLayout.jsx        # Shared layout for legal pages
│   ├── page.js                # Home (server)
│   ├── HomeClient.jsx         # Home interactivity
│   ├── list/[id]/
│   │   ├── page.js            # Detail page server with metadata
│   │   └── DetailClient.jsx   # Detail interactivity
│   ├── submit/
│   │   ├── page.js
│   │   ├── SubmitClient.jsx
│   │   └── thanks/page.js     # "Submitted, awaiting review"
│   ├── admin/
│   │   ├── page.js            # Admin dashboard (server, checks cookie)
│   │   ├── AdminClient.jsx
│   │   └── login/
│   │       ├── page.js
│   │       └── LoginClient.jsx
│   ├── privacy/page.js
│   ├── terms/page.js
│   ├── disclosure/page.js
│   └── api/
│       ├── bootstrap/route.js     # Returns published data
│       ├── votes/route.js
│       ├── views/route.js
│       ├── extras/route.js
│       ├── lists/route.js         # Inserts as published=false
│       └── admin/
│           ├── login/route.js
│           ├── logout/route.js
│           ├── approve/route.js
│           ├── unpublish/route.js
│           └── reject/route.js
├── lib/
│   ├── data.js                # LISTS, TYPES, COLORS, affiliate config
│   ├── helpers.js             # buildItemLink, getSources, voteKey
│   ├── supabase.js            # Anon client (used everywhere)
│   ├── supabase-server.js     # Service-role client (admin only)
│   ├── admin-auth.js          # Cookie validation
│   └── api.js                 # Browser-side fetch wrappers
├── supabase/
│   ├── schema.sql             # Fresh install schema (includes moderation)
│   └── migrations/
│       └── 01_add_moderation.sql  # Run only if you deployed earlier without moderation
├── package.json
├── next.config.js
├── jsconfig.json
└── .env.local.example
```

---

## Adding new lists

In `lib/data.js`, copy an existing entry in the `LISTS` array and edit:

- `id` — short slug, no spaces (`'headphones-overear'`)
- `publishedDate` / `publishedAt` — **use the actual current timestamp** (e.g. `date -u +"%Y-%m-%dT%H:%M:%SZ"`), not a rounded or guessed time. The home page sorts newest-first by `publishedAt`, so a timestamp earlier than an existing list will make a brand-new list appear behind it.
- `title`
- `category` — short tag
- `type` — one of: `food`, `stores`, `travel`, `entertainment`, `tech`, `product`, `other`
- `linkType` — one of: `amazon`, `imdb`, `mapsCity`, `maps`, `booking`, `tripadvisor`, `steam`, `goodreads`, `wiki`, `search`
- `blurb` — one-line description
- `sources` — at least an `ai` source with items
- `vote.items` — starting order of the vote tab

For `mode: 'scores'` chain lists (e.g. Cava, McDonald's, Sweetgreen), the `ai` source is the composite ranking and the platform sources (`google`, `yelp`) appear as chips. **Rule:** when only ONE platform backs the composite (Google *or* Yelp, not both), the composite and that platform are identical data, so the UI shows a single chip instead of two redundant ones. Provide both `google` and `yelp` only when you actually have two distinct rankings to blend.
- `links` (optional) — map of `'Item Name': 'https://url'` for per-item overrides

Commit and push. Vercel rebuilds automatically.

---

## Common problems

**Admin login redirects in a loop:** Your `ADMIN_PASSWORD` env var isn't set in Vercel. Add it under Settings → Environment Variables and redeploy.

**Pending submissions don't appear in admin:** Confirm `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel (no `NEXT_PUBLIC_` prefix). The dashboard uses this key to read all rows including unpublished ones.

**Approved lists don't appear on home:** Check the bootstrap response in DevTools Network tab. If `userLists` is empty, the published flag isn't being filtered correctly. Confirm the schema was applied (`published` column exists on `user_lists`).

**Votes don't save:** Open DevTools → Network, vote on something, look for `POST /api/votes`. 500 = Supabase project is down or the RPC isn't installed. 400 = validation error in the response body.

**"Module not found" locally:** Run `npm install` again.

---

## Costs

- Domain: ~$10–15/year
- Vercel hobby: $0 (covers ~100k visitors/month)
- Supabase free: $0 (500MB database)
- Total: ~$1/month

---

## What's still not built (next steps you might want)

- **Anti-bot rate limiting** on the vote/submit endpoints (e.g., via [Upstash Ratelimit](https://upstash.com/docs/oss/sdks/ts/ratelimit/overview))
- **Analytics** (Vercel Analytics is one click in the dashboard, or use [Plausible](https://plausible.io))
- **Email notifications** to you when a new submission arrives (Resend has a free tier)
- **Cookie consent banner** if you target EU traffic and add tracking later
- **Sitemap.xml** for SEO (Next.js can generate one automatically)
