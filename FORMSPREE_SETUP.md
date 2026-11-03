# Formspree Setup - FREE File Attachments! 🎉

## Why Formspree?

✅ **File attachments in FREE tier** (up to 50MB)  
✅ **50 submissions/month** free  
✅ **Simple setup** - just create a form  
✅ **Reliable** - no SMTP errors  
✅ **No coding required** - works with HTML forms  

## Quick Setup (3 Minutes)

### Step 1: Create Formspree Account

1. Go to **[https://formspree.io/](https://formspree.io/)**
2. Click **"Get Started"** or **"Sign Up"**
3. Sign up with Google or Email (free account)

### Step 2: Create a New Form

1. After logging in, click **"+ New Form"**
2. **Form Name:** `Legacies.global Careers`
3. **Email:** Enter `legacies@legacies.global` (where applications will be sent)
4. Click **"Create Form"**

### Step 3: Get Your Form ID

After creating the form, you'll see your **Form Endpoint**:
```
https://formspree.io/f/YOUR_FORM_ID
```

**Copy the FORM_ID part** (example: `xwkgpqdb`)

### Step 4: Update Your HTML

1. Open `index.html`
2. Find this line (around line 34):
   ```html
   <form id="careerForm" class="career-form" action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
   ```
3. Replace `YOUR_FORM_ID` with your actual Form ID:
   ```html
   <form id="careerForm" class="career-form" action="https://formspree.io/f/xwkgpqdb" method="POST">
   ```
4. Save the file

### Step 5: Test It!

1. Open `index.html` in your browser
2. Fill out the form with test data
3. Upload a test resume
4. Click "Submit Application"
5. **First submission:** Formspree will ask you to confirm your email
6. Check `legacies@legacies.global` and click the confirmation link
7. **After confirmation:** All future submissions work automatically!

## What You Get

### Email Format

**To:** legacies@legacies.global  
**Subject:** Career Application  
**Body:**
```
Full Name: John Doe
Email Address: john@example.com
Select Role: Website Developer
```
**Attachment:** resume.pdf (actual file attached!)

### Free Tier Limits

- ✅ 50 submissions per month
- ✅ File attachments up to 50MB
- ✅ Email notifications
- ✅ Spam filtering
- ✅ Form submission archive

**Need more?** Upgrade to $10/month for 1,000 submissions

## Formspree Dashboard Features

Once set up, you can:
- View all submissions in the dashboard
- Download submission data as CSV
- Enable/disable notifications
- Add custom thank you page redirect
- Enable reCAPTCHA (anti-spam)

## Advanced: Email Notifications

By default, you'll get an email at `legacies@legacies.global` for each submission.

To customize the email format:
1. Go to Formspree Dashboard → Your Form
2. Click **"Settings"**
3. Under **"Email Notifications"**, customize:
   - Subject line template
   - Reply-to address (set to applicant's email)
   - CC/BCC addresses

## Troubleshooting

**Email not arriving?**
- Check spam/junk folder
- Verify the form ID in index.html is correct
- Check Formspree dashboard for submission logs
- Make sure you confirmed your email on first submission

**File not attaching?**
- Ensure file is under 50MB
- Check browser console (F12) for errors
- Verify the file input has `name="resume"` attribute

## Form HTML Structure

Your form uses these important attributes for Formspree:

```html
<form action="https://formspree.io/f/xwkgpqdb" method="POST">
    <input type="text" name="fullName" required>
    <input type="email" name="email" required>
    <select name="role" required>...</select>
    <input type="file" name="resume" accept=".pdf,.doc,.docx" required>
    <button type="submit">Submit</button>
</form>
```

The `name` attributes are sent as field names in the email.

## That's It!

Formspree is the simplest solution that supports file attachments for free. Just add your form ID and you're done! 🚀

No access keys, no templates, no complex configuration - just works!
