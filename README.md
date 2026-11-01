# SolveX Lead Capture & CRM Automation

**An automated lead management system built by SolveX to capture business enquiries, organize leads, send email notifications, and support follow-ups.**

## Overview

The SolveX Lead Capture & CRM Automation system streamlines how businesses receive and manage enquiries.

It connects a Tally enquiry form to Make.com, Google Sheets, and Gmail, creating an automated workflow that reduces manual data entry and keeps incoming leads organized.

## Key Features

- **Lead Capture:** Collects enquiries through a structured Tally form.
- **Workflow Automation:** Processes form submissions through Make.com.
- **CRM Management:** Stores and organizes lead information in Google Sheets.
- **Email Notifications:** Sends Gmail notifications when new enquiries arrive.
- **Lead Status Tracking:** Tracks leads through different stages of the sales process.
- **Follow-up Management:** Records follow-up dates and contact history.
- **CRM Dashboard:** Provides an overview of lead activity and performance.

## System Architecture

```text
Potential Customer
       |
       v
Tally Enquiry Form
       |
       v
Make.com Webhook
       |
       v
Google Sheets CRM
       |
       +------> Gmail Notification
       |
       v
Lead Tracking & Follow-up
       |
       v
CRM Dashboard
```

## Technology Stack

| Technology | Purpose |
|---|---|
| Tally | Lead capture form |
| Make.com | Workflow automation |
| Google Sheets | CRM and lead database |
| Gmail | Email notifications |

## Workflow

1. A potential customer submits the SolveX enquiry form.
2. Tally sends the submission to a Make.com webhook.
3. Make.com processes the submitted information.
4. The lead is added to the Google Sheets CRM.
5. Gmail sends a notification about the new enquiry.
6. The lead is tracked and managed through the CRM.

## Project Screenshots

### Tally Enquiry Form
![Tally Form](screenshots/tally-form.png)

### Make.com Automation Workflow
![Make Workflow](screenshots/make-workflow.png)

### Google Sheets CRM
![Google Sheets CRM](screenshots/google-sheets-crm.png)

### Gmail Notification
![Gmail Notification](screenshots/gmail-notification.png)

### CRM Dashboard
![CRM Dashboard](screenshots/crm-dashboard.png)

## Project Structure

```text
solvex-ai-automation/
├── README.md
├── docs/
│   ├── architecture.md
│   ├── workflow.md
│   └── setup-guide.md
├── screenshots/
│   ├── tally-form.png
│   ├── make-workflow.png
│   ├── google-sheets-crm.png
│   ├── gmail-notification.png
│   └── crm-dashboard.png
└── examples/
```

## Business Value

This solution helps businesses:

- Respond to new enquiries more efficiently.
- Reduce repetitive administrative work.
- Keep lead information organized.
- Monitor sales opportunities.
- Maintain a more consistent follow-up process.

## Built By

**SolveX — AI Automation & Digital Solutions**

*Innovate. Automate. Elevate.*

Website: https://solvex.com.ng

GitHub: https://github.com/solvex223-hash

---

*This repository documents a SolveX lead capture and CRM automation project. Screenshots use demonstration data; sensitive customer information and credentials should never be published.*
