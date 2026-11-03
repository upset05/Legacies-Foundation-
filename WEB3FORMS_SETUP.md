# Web3Forms Setup - Simple & Free! 🎉

## Quick Setup (2 Minutes)

### Step 1: Get Your Access Key

1. Go to **[https://web3forms.com/](https://web3forms.com/)**
2. Scroll down to **"Get Started Free"**
3. Enter your email: `legacies@legacies.global`
4. Click **"Create Access Key"**
5. **Copy the Access Key** (looks like: `a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6`)

### Step 2: Add Access Key to Your Code

1. Open `script.js`
2. Find this line at the top:
   ```javascript
   const WEB3FORMS_ACCESS_KEY = 'YOUR_ACCESS_KEY_HERE';
   ```
3. Replace `YOUR_ACCESS_KEY_HERE` with your actual access key:
   ```javascript
   const WEB3FORMS_ACCESS_KEY = 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6';
   ```
4. Save the file

### Step 3: Verify Email

1. Check inbox at `legacies@legacies.global`
2. Look for verification email from Web3Forms
3. Click the verification link
4. Done! ✅

### Step 4: Test It!

1. Open `index.html` in your browser
2. Fill out the form
3. Upload a test resume
4. Click "Submit Application"
5. Check `legacies@legacies.global` inbox - you should receive the email with the resume attached!

## What You Get with Web3Forms

✅ **Completely FREE** - No paid plans needed  
✅ **File attachments included** - Resume files automatically attached  
✅ **250 submissions/month** free tier  
✅ **No SMTP errors** - Works reliably  
✅ **No complex setup** - Just one access key  
✅ **No templates to configure** - Works out of the box  

## Email Format

When someone submits an application, you'll receive:

**Subject:** Career Application: [Role Name]

**Body:**
```
New Career Application

Position: Website Developer
Applicant: John Doe
Email: john@example.com
Resume: resume.pdf

Please find the resume attached to this email.
```

**Attachment:** The actual resume file (PDF, DOC, or DOCX)

## Troubleshooting

**Email not arriving?**
- Check spam folder
- Verify the access key is correct in script.js
- Make sure you verified your email with Web3Forms
- Check Web3Forms dashboard for submission logs

**File not attaching?**
- Ensure file is under 5MB
- Supported formats: PDF, DOC, DOCX
- Check browser console (F12) for errors

## Need More Submissions?

Free tier: 250 emails/month  
Paid tier: $4/month for 5,000 emails  

For a careers page, 250/month should be plenty!

## HTML Form Structure

Your careers page uses this form structure:

### Form Fields

```html
<form id="careerForm" class="career-form">
    <!-- Full Name Input -->
    <div class="form-group">
        <label for="fullName">Full Name</label>
        <input type="text" id="fullName" name="fullName" required 
               placeholder="Enter your full name">
    </div>

    <!-- Email Input -->
    <div class="form-group">
        <label for="email">Email Address</label>
        <input type="email" id="email" name="email" required 
               placeholder="your.email@example.com">
    </div>

    <!-- Role Selection Dropdown -->
    <div class="form-group">
        <label for="role">Select Role</label>
        <select id="role" name="role" required>
            <option value="">Choose a position...</option>
            <option value="Website Developer">Website Developer</option>
            <option value="Website & Domain Admin">Website & Domain Admin</option>
            <option value="Technical Support Admin">Technical Support Admin</option>
            <option value="Website Developer/Website & Domain Admin/Technical Support Admin">
                Website Developer/Website & Domain Admin/Technical Support Admin
            </option>
        </select>
    </div>

    <!-- Resume File Upload -->
    <div class="form-group file-upload-group">
        <label for="resume">Upload Resume</label>
        <div class="file-upload-wrapper">
            <input type="file" id="resume" name="resume" 
                   accept=".pdf,.doc,.docx" required>
            <label for="resume" class="file-upload-label">
                <!-- Upload icon SVG and text -->
                <span class="file-upload-text">Choose file or drag here</span>
                <span class="file-name"></span>
            </label>
        </div>
        <small class="file-info">PDF, DOC, or DOCX (Max 5MB)</small>
    </div>

    <!-- Submit Button -->
    <button type="submit" class="submit-btn">
        <span class="btn-text">Submit Application</span>
        <span class="btn-icon">→</span>
    </button>
</form>
```

### Form Features

- **Dark theme** with glassmorphism effects
- **Drag-and-drop** file upload support
- **File validation**: PDF, DOC, DOCX only, 5MB max
- **Responsive design** for all screen sizes
- **Smooth animations** on interactions
- **Success message** shown after submission

## That's It!

Web3Forms is much simpler than EmailJS and has no limitations on file attachments in the free tier. Just add your access key and you're done! 🚀
