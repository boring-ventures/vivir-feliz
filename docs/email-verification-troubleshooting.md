# Email Verification Troubleshooting Guide

## Overview

This guide helps troubleshoot issues with email verification not working during user sign-up.

## Common Issues and Solutions

### 1. Supabase Email Configuration

#### Check Email Provider Settings

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** > **Providers**
3. Ensure **Email** is enabled
4. Check if you have SMTP configured or are using Supabase's default email service

#### Configure Email Templates

1. Go to **Authentication** > **Email Templates**
2. Update the **Confirm signup** template:

```html
<h2>Confirma tu cuenta</h2>
<p>Haz clic en el siguiente enlace para confirmar tu cuenta:</p>
<p><a href="{{ .ConfirmationURL }}">Confirmar Cuenta</a></p>
<p>Si no solicitaste esta cuenta, puedes ignorar este email.</p>
```

#### Set Up Redirect URLs

1. Go to **Authentication** > **URL Configuration**
2. Add your redirect URLs:
   - Development: `http://localhost:3000/auth/callback`
   - Production: `https://yourdomain.com/auth/callback`

### 2. Environment Variables

Ensure your `.env.local` file has:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. SMTP Configuration (Recommended for Production)

#### Using Custom SMTP

1. Go to **Authentication** > **Settings**
2. Configure SMTP settings:
   - **SMTP Host**: Your email provider's SMTP server
   - **SMTP Port**: Usually 587 or 465
   - **SMTP User**: Your email username
   - **SMTP Pass**: Your email password or app password
   - **Sender Email**: The "from" address for emails

#### Popular SMTP Providers

- **Gmail**: smtp.gmail.com:587 (requires app password)
- **SendGrid**: smtp.sendgrid.net:587
- **Mailgun**: smtp.mailgun.org:587
- **AWS SES**: email-smtp.region.amazonaws.com:587

### 4. Testing Email Delivery

#### Check Email Logs

1. Go to **Authentication** > **Users**
2. Look for recent sign-up attempts
3. Check if users appear with `email_confirmed: false`

#### Test with Different Email Providers

Try signing up with different email providers:

- Gmail
- Yahoo
- Outlook
- Custom domain emails

### 5. Debugging Steps

#### Enable Console Logging

The updated sign-up process now includes detailed logging. Check browser console for:

- "Sign up successful:" messages
- "Sign up error:" messages
- Any authentication-related errors

#### Check Network Tab

1. Open browser DevTools
2. Go to Network tab
3. Attempt sign-up
4. Look for `/auth/v1/signup` request
5. Check response status and body

### 6. Common Error Messages

#### "Email not confirmed"

- **Cause**: User hasn't clicked verification link
- **Solution**: Check spam folder, resend verification

#### "Invalid email or password"

- **Cause**: Supabase configuration issue
- **Solution**: Check email provider settings

#### "Rate limit exceeded"

- **Cause**: Too many sign-up attempts
- **Solution**: Wait and try again later

### 7. Password Hashing Fix

The application has been updated to fix a password hashing issue that was interfering with email verification:

- Sign-up now uses plain passwords (Supabase handles hashing)
- Password middleware only applies to sign-in operations
- Clean auth client used for sign-up operations

### 8. Manual Testing Steps

1. **Clear browser storage**: Clear localStorage and cookies
2. **Use incognito/private mode**: Eliminates caching issues
3. **Check Supabase dashboard**: Verify user creation in real-time
4. **Test email delivery**: Use a test email service like MailHog

### 9. Production Checklist

Before deploying to production:

- [ ] SMTP provider configured
- [ ] Custom domain verified
- [ ] Email templates customized
- [ ] Rate limiting configured
- [ ] Email deliverability tested
- [ ] Spam filter compliance checked

### 10. Getting Help

If issues persist:

1. Check Supabase documentation
2. Review Supabase status page
3. Contact Supabase support
4. Check community forums

## Recent Changes Made

The following changes were made to fix email verification issues:

1. **Updated password middleware**: Excluded sign-up operations to prevent interference
2. **Added clean auth client**: Separate client without middleware for sign-up
3. **Fixed sign-up form**: Removed password hashing for initial sign-up
4. **Added detailed logging**: Better error tracking and debugging

These changes should resolve most email verification issues. If problems persist, follow the debugging steps above.
