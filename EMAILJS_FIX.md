# Fix EmailJS Template - Remove Duplicates & Add Attachments

## Problem
- Email content is duplicated
- Resume file is not attached

## Solution

### Step 1: Update Your EmailJS Template

Go to your EmailJS dashboard → Email Templates → Edit `template_3l8y92j`

**Replace the entire template with this:**

#### Subject Line:
```
Career Application: {{role}}
```

#### Email Body (HTML):
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
    <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #333; margin-top: 0;">New Career Application</h2>
        
        <div style="background-color: #667eea; color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin: 0;">Position: {{role}}</h3>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; width: 150px;">Applicant Name:</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">{{from_name}}</td>
            </tr>
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Email Address:</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;"><a href="mailto:{{from_email}}">{{from_email}}</a></td>
            </tr>
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Resume File:</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">{{resume_name}}</td>
            </tr>
        </table>
        
        <div style="background-color: #f0f0f0; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0;">
            <p style="margin: 0; color: #666; font-size: 14px;">
                <strong>Note:</strong> Please reply to this email to request the resume file from the applicant at {{from_email}}
            </p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        
        <p style="color: #999; font-size: 12px; margin: 0;">
            This application was submitted via Legacies.global careers page
        </p>
    </div>
</div>
```

**IMPORTANT:** Remove the `{{message}}` variable completely - that's causing the duplication!

### Step 2: File Attachments - EmailJS Limitation

⚠️ **EmailJS Free Tier Limitation:** EmailJS doesn't support file attachments in the free tier when using base64 encoding.

**You have 3 options:**

#### Option A: Upgrade EmailJS (Recommended if you want automatic attachments)
- Go to EmailJS dashboard → Billing
- Upgrade to a paid plan ($15/month) which supports file attachments
- The current code will then work automatically

#### Option B: Use Form with Reply Workflow (Free)
Keep the free tier and ask applicants to send their resume in a follow-up email. I'll update the success message to inform them.

#### Option C: Use a File Upload Service (Free but requires setup)
- Use Cloudinary, AWS S3, or similar
- Upload file first, get URL
- Send URL in email instead of file

**Which option would you prefer?** 

For now, let me implement **Option B** (free solution) - the email will show the applicant's contact info, and you can reply to request their resume.
