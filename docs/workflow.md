# Lead Capture Automation Workflow

## 1. Overview

The SolveX Lead Capture & CRM Automation streamlines how business enquiries are received, recorded, and communicated to the SolveX team.

## 2. Workflow Stages

### Stage 1: Lead Submission
A prospective client completes the SolveX Business Enquiry Form built with Tally.

The form collects:
- Full name
- Email address
- Phone number
- Business name
- Service required
- Project budget
- Project description
- Discovery source

### Stage 2: Webhook Reception
Tally sends the submitted enquiry to a custom webhook in Make.com.

### Stage 3: Data Processing
Make.com processes the incoming submission and passes the relevant lead information to the CRM.

### Stage 4: CRM Storage
Google Sheets stores the enquiry in the SolveX Lead Management CRM.

### Stage 5: Email Notification
Gmail sends an email notification to the SolveX team when a new enquiry is received.

## 3. Workflow Diagram

```text
Prospective Client
       |
       v
   Tally Form
       |
       v
 Make.com Webhook
       |
       v
 Google Sheets CRM
       |
       v
 Gmail Notification
```

## 4. Business Benefits

- Centralized lead collection
- Reduced manual data entry
- Faster awareness of new enquiries
- Organized customer information
- Better lead management

## 5. Project Ownership

Developed by SolveX — AI Automation & Digital Solutions.

Website: https://solvex.com.ng

Innovate. Automate. Elevate.
