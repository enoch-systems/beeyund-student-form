# Admin Dashboard Setup Guide

## Overview
This admin dashboard allows you to manage student registrations from your beeyund Labs landing page. It features a modern, responsive design with dark/light mode toggle, search, sort, and pagination.

## Features
- ✅ View all student registrations
- ✅ Copy email and phone numbers with one click
- ✅ Search by name, email, or phone number
- ✅ Sort by registration date or name (ascending/descending)
- ✅ Pagination (12 students per page)
- ✅ Dark/Light mode toggle (admin only, doesn't affect landing page)
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Mobile hamburger menu with logout
- ✅ Real-time stats cards

## Setup Instructions

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully set up

### 2. Get Your Supabase Credentials
1. In your Supabase project, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

### 3. Set Up the Database Schema
1. In Supabase, go to the **SQL Editor**
2. Click **New query**
3. Copy and paste the contents of `supabase/schema.sql`
4. Click **Run** to execute the schema

### 4. Configure Environment Variables
1. Create a `.env.local` file in the root of your project
2. Add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

3. Replace the placeholder values with your actual Supabase credentials

### 5. Install Dependencies (if not already done)
```bash
npm install
```

### 6. Run the Development Server
```bash
npm run dev
```

### 7. Access the Dashboard
Navigate to: `http://localhost:3000/dashboard`

## How It Works

### Registration Flow
1. Students fill out the form on the landing page (`/`)
2. Data is automatically saved to Supabase
3. You can view all registrations in the admin dashboard (`/dashboard`)

### Dashboard Features

#### Search
- Search by student name, email, or phone number
- Real-time filtering as you type

#### Sort
- **Date**: Sort by registration time (newest/oldest first)
- **Name**: Sort alphabetically (A-Z or Z-A)

#### Pagination
- Shows 12 students per page
- Chevron left/right navigation
- Page numbers (max 3 visible at a time)
- Pagination only appears when there are more than 12 students

#### Copy Functionality
- Click the copy icon next to any email or phone number
- Shows "Copied to clipboard!" confirmation
- Icon changes to checkmark when copied

#### Dark/Light Mode
- Toggle in the sidebar (bottom)
- Preference is saved in browser localStorage
- Only affects the admin dashboard, not the landing page

#### Mobile Features
- Hamburger menu (top left) to open sidebar
- Overlay when sidebar is open
- Touch-friendly interface
- Card-based layout for mobile view

## Database Schema

### Table: `registrations`
| Column | Type | Description |
|--------|------|-------------|
| `id` | BIGSERIAL | Auto-incrementing primary key |
| `full_name` | TEXT | Student's full name |
| `email` | TEXT | Student's email address |
| `phone_number` | TEXT | Student's phone number |
| `created_at` | TIMESTAMPTZ | Registration timestamp (auto-set) |

## Security Notes
- The current setup allows public read/write access for simplicity
- For production, consider adding authentication (e.g., Supabase Auth)
- Add admin-only access controls if needed

## Customization

### Change Items Per Page
Edit `app/dashboard/page.tsx` line 42:
```typescript
const itemsPerPage = 12 // Change this number
```

### Modify Colors
The dashboard uses the same color scheme as your landing page:
- Primary: Sky blue (`#0ea5e9` to `#2563eb`)
- Background: Slate grays
- Text: White/dark gray based on mode

### Add More Fields
To add more fields to the registration form:
1. Update the `FormData` interface in `components/polar/registration-form.tsx`
2. Add the input field in the JSX
3. Update the Supabase insert in the `handleSubmit` function
4. Update the database schema in `supabase/schema.sql`

## Troubleshooting

### "Failed to load registrations"
- Check that your Supabase credentials are correct in `.env.local`
- Verify the database schema was executed successfully
- Check the browser console for detailed error messages

### "Failed to submit registration"
- Ensure the `registrations` table exists in Supabase
- Verify Row Level Security policies are set correctly
- Check Supabase logs for errors

### Dark mode not persisting
- Check browser localStorage is enabled
- Clear localStorage and try again

## Support
For issues or questions, refer to the Supabase documentation or Next.js documentation.

## Next Steps
- [ ] Add admin authentication
- [ ] Add export to CSV functionality
- [ ] Add email notifications for new registrations
- [ ] Add student detail view
- [ ] Add bulk actions (delete, export)