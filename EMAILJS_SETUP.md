# EmailJS Setup Instructions

## Quick Setup (5 minutes)

To enable automatic email forwarding for the careers page, follow these steps:

### Step 1: Create EmailJS Account
1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Click **"Sign Up Free"**
3. Create an account (Google sign-in is fastest)

### Step 2: Add Email Service
1. After logging in, go to **"Email Services"**
2. Click **"Add New Service"**
3. Choose your email provider (Gmail, Outlook, etc.)
4. Connect your `legacies@legacies.global` email account
5. Click **"Create Service"**
6. **Copy the Service ID** (e.g., `service_abc123`)

### Step 3: Create Email Template
1. Go to **"Email Templates"**
2. Click **"Create New Template"**
3. Set up the template:

**Template Name:** Career Application

**Subject:** New Career Application: {{role}}

**Content (HTML):**
```html
<h2>New Career Application</h2>
<p><strong>Position:</strong> {{role}}</p>
<p><strong>Applicant Name:</strong> {{from_name}}</p>
<p><strong>Email:</strong> {{from_email}}</p>
<p><strong>Resume:</strong> {{resume_name}}</p>

<hr>

<p>{{message}}</p>
```

4. Click **"Save"**
5. **Copy the Template ID** (e.g., `template_xyz789`)

### Step 4: Get Your Public Key
1. Go to **"Account"** → **"General"**
2. Find your **"Public Key"** (e.g., `1a2B3c4D5e6F7g8H9`)
3. **Copy this key**

### Step 5: Update script.js
Open `C:\Users\USER\Documents\projects\legacies-careers\script.js` and replace these three lines:

```javascript
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';  // Paste your Public Key here
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';  // Paste your Service ID here
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID'; // Paste your Template ID here
```

**Example:**
```javascript
const EMAILJS_PUBLIC_KEY = '1a2B3c4D5e6F7g8H9';
const EMAILJS_SERVICE_ID = 'service_abc123';
const EMAILJS_TEMPLATE_ID = 'template_xyz789';
```

### Step 6: Test It!
1. Open `index.html` in your browser
2. Fill out the form
3. Upload a resume
4. Click "Submit Application"
5. Check `legacies@legacies.global` inbox

## Features
✅ **Automatic email sending** - No email client required  
✅ **Resume attachments** - Files sent as base64 encoded attachments  
✅ **Free tier** - 200 emails per month included  
✅ **Fallback support** - If EmailJS isn't configured, falls back to mailto  

## Troubleshooting

**Email not arriving?**
- Check EmailJS dashboard for delivery status
- Verify Service ID, Template ID, and Public Key are correct
- Check spam folder
- Ensure email service is properly connected

**Getting errors?**
- Check browser console (F12) for error messages
- Verify you replaced all three credentials in script.js
- Make sure the template variables match: `{{from_name}}`, `{{from_email}}`, `{{role}}`, `{{message}}`, `{{resume_name}}`

## Alternative: Use Gmail SMTP
If you prefer, you can also connect Gmail directly through EmailJS's Gmail service option. This is usually the easiest setup.
