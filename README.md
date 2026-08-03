# beeyund Student Form

A modern, responsive student registration system with a landing page and admin dashboard built with Next.js and Supabase.

## Features

### Landing Page (/)
- Modern glassmorphism design matching beeyund Labs aesthetics
- Student registration form with:
  - Full name
  - WhatsApp number
  - Email address
- Real-time form validation
- Success/error notifications
- Animated UI elements

### Admin Dashboard (/dashboard)
- **Student Management**
  - View all registered students
  - Copy email and phone numbers with one click
  - Search by name, email, or phone number
  - Sort by registration date or name (A-Z/Z-A)
  - Pagination (12 students per page)

- **Responsive Design**
  - Mobile-first approach
  - Hamburger menu on mobile/tablet
  - Full sidebar on desktop
  - Card-based layout on mobile, table on desktop

- **Dark/Light Mode**
  - Toggle in sidebar (admin only)
  - Persists in localStorage
  - Doesn't affect landing page

- **Statistics**
  - Total registrations
  - Last 24 hours registrations
  - Currently showing count

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Styling**: Tailwind CSS v4 with custom animations
- **Database**: Supabase
- **Icons**: Lucide React
- **Notifications**: Sonner
- **Theme**: next-themes

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd beeyund-student-form
```

2. Install dependencies:
```bash
npm install
```

3. Set up Supabase:
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to SQL Editor and run the schema from `supabase/schema.sql`
   - Get your project URL and anon key from Settings → API

4. Create `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) to view the landing page
7. Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard) to view the admin dashboard

## Database Schema

### Table: `registrations`

| Column | Type | Description |
|--------|------|-------------|
| `id` | BIGSERIAL | Auto-incrementing primary key |
| `full_name` | TEXT | Student's full name |
| `email` | TEXT | Student's email address |
| `phone_number` | TEXT | Student's phone number |
| `created_at` | TIMESTAMPTZ | Registration timestamp (auto-set) |

## Project Structure

```
beeyund-student-form/
├── app/
│   ├── dashboard/
│   │   └── page.tsx          # Admin dashboard
│   ├── globals.css           # Global styles and theme variables
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Landing page
├── components/
│   └── polar/
│       ├── brand-badge.tsx   # Logo component
│       ├── registration-form.tsx  # Form component
│       └── footer-links.tsx  # Footer component
├── lib/
│   └── supabase.ts           # Supabase client configuration
├── supabase/
│   └── schema.sql            # Database schema
├── .env.example              # Environment variables template
└── package.json
```

## Key Features Explained

### Pagination Logic
- Shows 12 students per page
- Maximum 3 page numbers visible at a time
- Ellipsis (...) for skipped pages
- Only appears when there are more than 12 students
- Chevron left/right navigation

### Sorting
- **By Date**: Newest registrations appear first (default)
- **By Name**: Alphabetical order (A-Z or Z-A)
- Toggle between ascending and descending

### Search
- Real-time filtering
- Searches across name, email, and phone number
- Case-insensitive

### Copy Functionality
- Click copy icon next to email or phone
- Shows checkmark and "Copied to clipboard!" toast
- Auto-resets after 2 seconds

### Dark Mode
- Toggle in sidebar bottom
- Saved to localStorage
- Only affects admin dashboard
- Uses CSS custom properties for theming

## Design System

### Colors
- **Primary**: Sky blue gradient (#0ea5e9 to #2563eb)
- **Background**: Slate grays (light/dark modes)
- **Text**: White on dark, slate-900 on light
- **Accents**: Green (success), Red (logout), Purple (stats)

### Typography
- **Font**: Plus Jakarta Sans
- **Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### Spacing
- Consistent 8px grid system
- Rounded corners: 0.625rem (10px) default
- Card padding: 24px (p-6)

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

### Deploy to Netlify

1. Push your code to GitHub
2. Import project in Netlify
3. Add environment variables
4. Set build command: `npm run build`
5. Set publish directory: `.next`

## Security Considerations

⚠️ **Current Setup (Development)**
- Public read/write access to registrations table
- No authentication required
- Suitable for testing and development

🔒 **Production Recommendations**
- Add Supabase Auth for admin authentication
- Implement Row Level Security (RLS) policies
- Add admin-only access controls
- Consider rate limiting for form submissions
- Add CAPTCHA to prevent spam

## Customization

### Change Items Per Page
Edit `app/dashboard/page.tsx`:
```typescript
const itemsPerPage = 12 // Change this number
```

### Modify Colors
Update CSS variables in `app/globals.css`:
```css
:root {
  --primary: oklch(0.65 0.2 220); /* Sky blue */
  /* ... other variables */
}
```

### Add Form Fields
1. Update `FormData` interface in `components/polar/registration-form.tsx`
2. Add input field in JSX
3. Update Supabase insert in `handleSubmit`
4. Update database schema in `supabase/schema.sql`

## Troubleshooting

### Build Error: "supabaseUrl is required"
- Ensure `.env.local` file exists with correct credentials
- Check that environment variables are prefixed with `NEXT_PUBLIC_`

### Form Not Submitting
- Verify Supabase schema is executed
- Check browser console for errors
- Ensure RLS policies allow inserts

### Dashboard Not Loading Data
- Verify Supabase credentials
- Check that registrations table exists
- Ensure RLS policies allow selects

## Next Steps

- [ ] Add admin authentication
- [ ] Export registrations to CSV
- [ ] Email notifications for new registrations
- [ ] Student detail view
- [ ] Bulk actions (delete, export)
- [ ] Advanced filtering
- [ ] Registration analytics charts

## Support

For issues or questions, please refer to:
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## License

MIT