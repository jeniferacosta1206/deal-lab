# Deal Lab

Housing finance calculators for sale, rent, gap financing, and rent vs. sale comparison.

An educational tool by Acosta Development.

## What's Inside

- **For Rent calculator**: NOI, cap rate, DSCR, cash-on-cash, full operating statement
- **For Sale calculator**: Development proforma with profit, margin, return on cost
- **Gap Financing calculator**: Capital stack analysis with flexible subsidy sources
- **Rent vs Sale comparison**: Side-by-side hold vs. sell analysis with hold-period modeling
- **Save/Load**: Deals persist in the visitor's browser (localStorage)
- **Terms of Use modal**: Required acceptance on first visit, viewable anytime
- **Email capture modal**: Optional email signup after terms acceptance

## Tech Stack

- React 18 + Vite
- Tailwind CSS
- lucide-react icons
- No backend required

## Running Locally

**Prerequisites:** Node.js 18 or higher. Download from [nodejs.org](https://nodejs.org) if needed.

```bash
# Install dependencies
npm install

# Start dev server (opens at http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

## Deploying to Vercel

1. Push this project to a new GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/deal-lab.git
   git push -u origin main
   ```

2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click **Add New > Project** and import your `deal-lab` repo
4. Vercel auto-detects Vite. Click **Deploy**
5. You'll get a URL like `deal-lab-abc123.vercel.app` within a minute

### Custom Domain (optional)

1. In Vercel project settings, go to **Domains**
2. Add `deallab.acostadevelopment.com` (or your preferred subdomain)
3. Vercel gives you DNS records to add at your domain registrar (GoDaddy, Namecheap, etc.)
4. Wait a few minutes for DNS to propagate. Vercel auto-provisions the SSL cert

## Email Capture Setup

The app shows an email capture modal after Terms acceptance. To actually collect emails:

1. Sign up at [formspree.io](https://formspree.io) (free tier: 50 submissions/month)
2. Create a new form, copy the endpoint URL (looks like `https://formspree.io/f/xyzabc123`)
3. In Vercel, go to **Settings > Environment Variables** and add:
   - Name: `VITE_FORMSPREE_ENDPOINT`
   - Value: your Formspree endpoint URL
4. Redeploy (Vercel does this automatically when you save env vars)

**Alternatives to Formspree:** ConvertKit, Mailchimp, Buttondown, any service with a webhook. Update the `EmailCaptureModal` component's `handleSubmit` to match the new service's API.

**To test locally:** Create a `.env.local` file with `VITE_FORMSPREE_ENDPOINT=your-url-here`. The `.env.local` file is gitignored.

## Customization

### Brand Colors

All colors are defined as CSS variables in `src/App.jsx` inside the `GlobalStyles` component. Current palette:

- Navy `#434A60`
- Slate blue `#9AAAB1`
- Cream `#E8E5DE`
- Charcoal `#383736`

Search for any hex code in `App.jsx` to change it globally.

### Fonts

Currently uses Cormorant Garamond (display) and Open Sans (body) via Google Fonts. To swap, edit the `@import` URL at the top of `GlobalStyles` and update the `font-display` and `font-body` CSS classes.

### Calculator Logic

All calculation functions are standalone and easy to modify:
- `calcRent()` — rental property returns
- `calcSale()` — development proforma
- `calcGap()` — capital stack gap analysis
- `calcComparison()` — rent vs. sale scenarios

Default values are in the `defaultRent`, `defaultSale`, `defaultGap`, `defaultComp` objects near the top of each calculator section.

### Terms of Use

Edit the text inside the `TermsModal` component. **Have a Michigan attorney review before public launch**, especially the limitation of liability and governing law clauses.

## File Structure

```
deal-lab/
├── public/
│   └── favicon.svg
├── src/
│   ├── App.jsx        # All app logic and UI
│   ├── main.jsx       # React entry point
│   └── index.css      # Tailwind directives
├── .env.example       # Copy to .env.local for local dev
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vercel.json
└── vite.config.js
```

## License

© Acosta Development. All rights reserved.
