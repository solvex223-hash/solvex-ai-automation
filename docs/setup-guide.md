# SolveX Lead Capture & CRM Automation — Setup Guide

## 1. Project Requirements

The following accounts and tools are required:

- Tally account
- Make.com account
- Google account
- Google Sheets
- Gmail

## 2. Create the Lead Capture Form

1. Sign in to Tally.
2. Create a business enquiry form.
3. Add fields for customer contact information, business details, requested services, project budget, and project description.
4. Configure the form submission webhook to connect to Make.com.

## 3. Configure Make.com

1. Create a new scenario.
2. Add a Custom Webhook module.
3. Copy its webhook URL.
4. Connect the Tally form to the webhook.
5. Add a Google Sheets module to store submitted lead information.
6. Add a Gmail module to send new lead notifications.
7. Map the incoming form fields to the appropriate CRM columns.
8. Test the complete workflow.
9. Activate the scenario.

## 4. Configure Google Sheets CRM

1. Create a spreadsheet for lead management.
2. Add columns for lead information, service requirements, source, and status.
3. Configure status tracking and other CRM management fields.
4. Connect the spreadsheet to Make.com.

## 5. Test the Automation

Submit a test enquiry through the Tally form.

Verify that:

- Make.com receives the submission.
- Google Sheets records the lead.
- Gmail sends the notification.
- The submitted information appears correctly.

## 6. Security Notes

- Never publish private webhook URLs.
- Never commit API keys, passwords, or access tokens.
- Use sample customer information in public demonstrations.
- Keep customer records private.

## 7. Technology Stack

Tally · Make.com · Google Sheets · Gmail

## Developed By

SolveX — AI Automation & Digital Solutions

Website: https://solvex.com.ng

Innovate. Automate. Elevate.
