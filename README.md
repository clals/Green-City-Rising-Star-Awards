# Prestige Awards Online Voting Platform

A modern, secure, and responsive temporary online voting platform for award ceremonies. This platform allows attendees to enter a unique one-time code, view award categories and nominees with rich profiles, and submit their ballots with absolute, guaranteed anonymity. 

The system features an automated **Sandbox Fallback Mode** that enables immediate, interactive evaluation inside local previews using a local storage cache and seeded nominees. Adding Supabase credentials instantly activates the live, production-grade cloud database.

---

## 🌟 Key Features

1. **Elegant Landing Experience**: Featuring an animated display, voting guides, and a live countdown timer tied to administrative opening/closing gates.
2. **One-Time Code Verification**: Restricts double-voting. Codes are securely validated on the server/sandbox layer and burned upon a single submission.
3. **Double-Blind Anonymity**: Votes are registered as isolated database rows (Contestant ID, Category, Timestamp). No connections or metadata link votes back to specific access codes, keeping choices fully anonymous.
4. **Interactive Ballot Stepper**: Guided category carousel allowing attendees to swipe, inspect large candidate photographs, read profiles, and review their ballot before submitting.
5. **Secure Administrative Command Center**: Locked by an administrative PIN code. Includes:
   - **Live Analytics**: Donut chart detailing category shares, and real-time horizontal progress charts showing nominee rank.
   - **Nominees Editor (CRUD)**: Add, edit, or delete contestants with real-time profile uploads.
   - **Categories Ledger (CRUD)**: Create or destroy custom award categories.
   - **Passcode Generator**: Create dozens of custom guest or VIP access codes with customizable prefixes.
   - **Schedule Clocks**: Precise date-time calendars defining voting open/close windows.
   - **Destructive Factory Reset**: Safety-walled mechanism requiring typing confirmation to wipe records and reset tickets.
6. **Executive Export Utility**:
   - **Export to CSV**: Instant compilation and download of all vote tallies and nominee stats.
   - **Export to PDF**: Custom print-media styles that automatically strip dark layouts, hide buttons, and produce a pristine black-and-white executive paper dossier.

---

## 🛠️ Technology Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling & Theme**: Tailwind CSS (Midnight Prestige Black & Gold Theme)
- **Routing**: React Router DOM (Hash-based for maximum iframe & SPA host compatibility)
- **Database**: Supabase PostgreSQL (Production) / Client-side Cache Sandbox (Evaluation fallback)
- **Serverless**: Netlify Serverless Functions (Node.js)
- **Animations**: Framer Motion (micro-interactions & page entries)

---

## 📁 Clean Codebase Directory Structure

```text
/
├── netlify/
│   └── functions/
│       └── submit-vote.ts        # Netlify Serverless anonymous vote controller
├── src/
│   ├── components/
│   │   ├── AnalyticsCharts.tsx    # Responsive vector charts (bars, donut, leaders)
│   │   ├── CountdownTimer.tsx     # Luxury countdown clock
│   │   ├── DatabaseConfigNotice.tsx# Collapsible setup guide and status banner
│   │   ├── ConfettiEffect.tsx     # Celebrate successful ballots on HTML5 Canvas
│   │   └── Navbar.tsx             # Luxury navigation bar
│   ├── context/
│   │   └── VotingContext.tsx      # Global state engine, validations, and admin actions
│   ├── pages/
│   │   ├── LandingPage.tsx        # Event details, step guides, and code verification
│   │   ├── VotingPage.tsx         # Progressive category ballot sheet
│   │   └── AdminDashboard.tsx     # Secured results, CRUD editors, and CSV/PDF exporters
│   ├── services/
│   │   └── db.ts                  # Unified Database Service (Pivots to Supabase/Sandbox)
│   ├── App.tsx                    # Main App router
│   ├── main.tsx                   # App Entry point
│   ├── index.css                  # Tailwinds directives and print style overrides
│   └── types.ts                   # Types definitions
├── supabase/
│   └── schema.sql                 # Production SQL and Row Level Security rules
├── netlify.toml                   # Netlify environment builder configurations
├── package.json                   # Project packages configuration
└── tsconfig.json                  # Strict TypeScript parameters configuration
```

---

## 🚀 Step 1: Configuring Supabase

1. **Create a Free Account**: Visit [Supabase](https://supabase.com/) and create a new PostgreSQL project.
2. **Initialize Database Tables**: Go to the **SQL Editor** tab inside your Supabase dashboard, click "New Query", paste the entire contents of `/supabase/schema.sql`, and press **Run**. This will create your tables (`categories`, `contestants`, `voting_codes`, `votes`, `settings`), establish cascading foreign keys, insert sample gala nominees, and activate secure Row Level Security.
3. **Retrieve Credentials**: Visit **Project Settings** -> **API** and copy your `Project URL` and `anon public` key.

---

## 🌐 Step 2: Deploying to Netlify

### Method A: Single-Click Netlify CLI
1. Install the Netlify CLI globally:
   ```bash
   npm install -g netlify-cli
   ```
2. Log in and deploy:
   ```bash
   netlify login
   netlify deploy --prod
   ```

### Method B: Git Integration (Recommended)
1. Push this project folder to your GitHub / GitLab account.
2. Log in to [Netlify](https://www.netlify.com/), click **Add New Site** -> **Import from Git**, and authorize your repository.
3. Netlify automatically reads the `/netlify.toml` file and pre-configures your build command as `npm run build` and directory as `dist`.

### Configure Environment Secrets
Add these variables under your Site's **Environment Variables** panel in Netlify (or your AI Studio Secrets panel) to link your live database:

| Secret Key | Description / Example |
| :--- | :--- |
| `VITE_SUPABASE_URL` | Your Supabase Project URL (`https://your-id.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase Public Anon Key (`eyJhbGciOiJIUzI1NiIsInR5...`) |

---

## 💻 Local Workspace Development

To test and modify this application locally:

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Start Local Server**:
   ```bash
   npm run dev
   ```
3. **Compile Code for Build**:
   ```bash
   npm run build
   ```
