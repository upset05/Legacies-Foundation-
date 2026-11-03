# EmailJS SMTP Error Fix

## Error You're Seeing
```
SMTP: Mail command failed: 501 Syntax error in parameters or arguments
Status: 412
```

## What This Means
The EmailJS service can't send emails because of a configuration issue with your email service setup.

## Solutions (Try in Order)

### Solution 1: Verify Email Service Settings ⭐ Most Common Fix

1. Go to [EmailJS Dashboard](https://dashboard.emailjs.com/) → **Email Services**
2. Click on your service (`service_oakn1kk`)
3. **Check these settings:**
   - ✅ Service is **Connected** (green status)
   - ✅ Email address is correct: `legacies@legacies.global`
   - ✅ No typos in the email address
   
4. **If status is not "Connected":**
   - Click **"Reconnect"** or **"Test Connection"**
   - Re-authorize your email account
   - Save the service

### Solution 2: Recreate the Email Service

Sometimes the service gets corrupted. Start fresh:

1. Go to **Email Services** → Delete `service_oakn1kk`
2. Click **"Add New Service"**
3. Choose **Gmail** (recommended - easiest setup)
4. **Connect your email account:**
   - If using Gmail: Sign in with Google
   - If using custom domain (legacies@legacies.global): Choose "Other" → Set up SMTP manually
5. After creating, **copy the new Service ID**
6. Update `script.js` with the new Service ID

### Solution 3: Use Gmail Instead (Recommended)

If `legacies@legacies.global` is hard to configure, use Gmail as a workaround:

1. Create a Gmail account (e.g., `legacies.global@gmail.com`)
2. Set up Gmail forwarding:
   - Gmail Settings → Forwarding → Add `legacies@legacies.global`
3. In EmailJS, create a new service using this Gmail
4. Update your template to say: **Reply-To: {{from_email}}**

### Solution 4: Check Template Variables

Make sure your template uses ONLY these variables:
- `{{from_name}}`
- `{{from_email}}`
- `{{role}}`
- `{{resume_name}}`

**DO NOT USE:**
- `{{to_email}}` - EmailJS handles recipient automatically
- `{{message}}` - We removed this to fix duplicates
- `{{resume_data}}` - Not supported in free tier

### Solution 5: Verify Template Format

Go to your template and make sure:

1. **Subject** is simple:
   ```
   Career Application: {{role}}
   ```

2. **Reply-To field** in template settings (optional but recommended):
   ```
   {{from_email}}
   ```

3. **To Email** field should be:
   ```
   legacies@legacies.global
   ```
   Or leave it to use the service default

## Quick Test

After making changes, test in EmailJS dashboard:

1. Go to **Email Templates** → `template_3l8y92j`
2. Click **"Test"** button
3. Fill in test values:
   - `from_name`: Test User
   - `from_email`: test@example.com
   - `role`: Website Developer
   - `resume_name`: resume.pdf
4. Click **"Send Test"**
5. Check if email arrives at `legacies@legacies.global`

## Still Not Working?

Try the **Alternative Solution: Web3Forms** (Completely Free & Easier)

Web3Forms is simpler and doesn't have EmailJS's limitations.

### Quick Setup:

1. Go to [https://web3forms.com/](https://web3forms.com/)
2. Enter `legacies@legacies.global`
3. Get your Access Key
4. I'll update the code to use Web3Forms instead

**Would you like me to switch to Web3Forms?** It's much simpler and supports file attachments for free.
