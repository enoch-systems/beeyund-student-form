# Authentication Setup Guide

## Overview
This guide will help you set up authentication for the admin dashboard using Supabase Auth.

## Your Credentials
- **Email**: enochc.official@gmail.com
- **Password**: 090Zinny

## Setup Steps

### Step 1: Create Auth User in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Users**
3. Click **Add user** → **Create new user**
4. Enter the following:
   - **Email**: enochc.official@gmail.com
   - **Password**: 090Zinny
   - **Auto-confirm email**: ✅ (check this box)
5. Click **Create user**

### Step 2: Run Admin Setup SQL

1. In Supabase, go to **SQL Editor**
2. Click **New query**
3. Copy and paste the contents of `supabase/admin-setup.sql`
4. Click **Run** to execute

This SQL will:
- Create a `profiles` table to store user roles
- Automatically assign the admin role to enochc.official@gmail.com
- Set up Row Level Security policies
- Create functions for admin checks

### Step 3: Configure Environment Variables

Create a `.env.local` file in your project root (if you haven't already):

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**Where to find these:**
- Go to Supabase → **Settings** → **API**
- Copy **Project URL** and **anon public** key

### Step 4: Test the Login

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to: `http://localhost:3000/login`

3. Login with:
   - **Email**: enochc.official@gmail.com
   - **Password**: 090Zinny

4. You should be redirected to `/dashboard`

## How It Works

### Authentication Flow
1. User visits `/login`
2. Enters email and password
3. Supabase Auth validates credentials
4. If valid, user is redirected to `/dashboard`
5. Dashboard layout checks for active session
6. If no session, redirects back to `/login`

### Admin Role System
- The `profiles` table stores user roles
- Your email is automatically assigned the 'admin' role
- Future users can be added with different roles
- Admin checks are done via the `is_admin()` function

### Protected Routes
- `/dashboard` and all its sub-pages are protected
- The layout component checks authentication on mount
- Auth state changes are monitored in real-time
- Unauthenticated users are redirected to `/login`

## Features

### Login Page (`/login`)
- ✅ Matching beeyund Labs glassmorphism design
- ✅ Email and password fields
- ✅ Show/hide password toggle
- ✅ Loading state during login
- ✅ Error handling with toast notifications
- ✅ Auto-redirect if already logged in

### Dashboard Protection
- ✅ Authentication check on page load
- ✅ Real-time auth state monitoring
- ✅ Automatic redirect to login if logged out
- ✅ Session persistence across browser refreshes

### Logout
- ✅ Secure logout via Supabase Auth
- ✅ Redirects to login page
- ✅ Clears session
- ✅ Toast notification on success

## Security Notes

### Current Setup (Development)
- Single admin user with hardcoded credentials
- No additional authentication layers
- Suitable for personal use

### Production Recommendations
1. **Add Email Confirmation**: Require email verification
2. **Implement 2FA**: Add two-factor authentication
3. **Add Rate Limiting**: Prevent brute force attacks
4. **Use Stronger Passwords**: Enforce password policies
5. **Add Session Management**: Set session expiration
6. **Implement OAuth**: Add Google/GitHub login options
7. **Add Audit Logs**: Track login attempts and actions

## Troubleshooting

### "Invalid email or password"
- Verify credentials are correct
- Check that user is confirmed in Supabase Auth
- Ensure environment variables are set correctly

### "Please login to access the dashboard"
- Clear browser localStorage
- Check that `.env.local` exists with correct credentials
- Verify Supabase project is running

### Redirect Loop
- Check that Supabase credentials are correct
- Verify the profiles table exists
- Check browser console for errors

### Build Error: "supabaseUrl is required"
- Ensure `.env.local` file exists
- Check that variables start with `NEXT_PUBLIC_`
- Restart development server after adding env variables

## Next Steps

After setup is complete:

1. **Test the full flow**:
   - Login at `/login`
   - View dashboard at `/dashboard`
   - Logout and verify redirect

2. **Add more admin users** (optional):
   - Create user in Supabase Auth
   - Run this SQL to make them admin:
   ```sql
   INSERT INTO profiles (id, email, full_name, role)
   SELECT id, email, email, 'admin'
   FROM auth.users 
   WHERE email = 'new-admin@example.com'
   ON CONFLICT (id) DO UPDATE SET role = 'admin';
   ```

3. **Customize the login page**:
   - Update colors in `app/login/page.tsx`
   - Add company branding
   - Modify form fields if needed

4. **Deploy to production**:
   - Add environment variables to hosting platform
   - Enable email confirmation in Supabase
   - Set up proper security policies

## File Structure

```
beeyund-student-form/
├── app/
│   ├── login/
│   │   └── page.tsx          # Login page
│   ├── dashboard/
│   │   ├── layout.tsx        # Auth protection
│   │   └── page.tsx          # Dashboard
│   └── page.tsx              # Landing page
├── lib/
│   └── supabase.ts           # Supabase client
├── supabase/
│   ├── schema.sql            # Registrations table
│   └── admin-setup.sql       # Auth & profiles setup
└── .env.local                # Your credentials
```

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify Supabase logs in the dashboard
3. Ensure all SQL scripts ran successfully
4. Confirm environment variables are correct