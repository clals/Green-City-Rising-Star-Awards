# Emergency Vote Storage Using Google Sheets

This document explains how to run the temporary vote backend:

React App -> Vercel API submitVote -> Google Apps Script -> Google Sheet

## 1) Google Sheet Setup

1. Create a Google Sheet.
2. Rename the first tab to Votes.
3. Add this header row in row 1:
   - Timestamp
   - Contestant ID
   - Contestant Name
   - Category
   - Voting Code
   - IP
   - User Agent
4. Keep this sheet open; Apps Script will append rows here.

## 2) Apps Script Project

Project files are included in this repo:
- google-apps-script/Code.gs
- google-apps-script/appsscript.json

How to deploy:

1. In your Google Sheet, open Extensions -> Apps Script.
2. Replace the default script with the contents of google-apps-script/Code.gs.
3. Open Project Settings and ensure V8 runtime is enabled (or copy appsscript.json settings manually).
4. Click Deploy -> New deployment.
5. Select type: Web app.
6. Execute as: Me.
7. Who has access: Anyone.
8. Deploy and copy the Web app URL.

Behavior implemented by doPost(e):
- Parses incoming JSON safely.
- Validates required fields:
  - contestant_id
  - contestant_name
  - category
  - vote_code
  - timestamp
- Rejects invalid JSON.
- Rejects duplicate voting codes by checking the Voting Code column.
- Appends one row per accepted vote with IP and User Agent when provided.
- Returns JSON:
  - {"success": true}
  - or {"success": false, "message": "..."}

## 3) Vercel Configuration

Set this environment variable in Vercel Project Settings -> Environment Variables:

- GOOGLE_SCRIPT_URL = your Google Apps Script Web App URL

The Vercel API route used is:
- api/submitVote.ts
- api/getVotes.ts

Important:
- Do not expose GOOGLE_SCRIPT_URL in frontend code.
- The browser only calls /api/submitVote.

## 4) Frontend Integration

No UI changes were made.

Only vote submission service was changed:
- db.ts

Current behavior:
1. Keeps existing loading and success flow.
2. Sends vote rows to /api/submitVote.
3. If backend is unavailable, throws:
   - Unable to record your vote. Please try again.
4. Admin analytics reads live votes from Google Sheets through /api/getVotes.

## 5) Quick Test Checklist

1. Start local dev:
   - npm run dev
2. Run Vercel functions locally when testing API routes:
   - npx vercel dev
3. Ensure GOOGLE_SCRIPT_URL is set in environment.
4. Open the app and submit a vote.
5. Confirm response success in UI.
6. Confirm new row(s) appear in Google Sheet.
7. Open the admin dashboard and verify counts update from sheet-backed votes.
8. Test duplicate voting code protection:
   - Re-send the same payload vote_code manually to the function endpoint.
   - Confirm response: {"success": false, "message": "Voting code already used."}
9. Temporarily break GOOGLE_SCRIPT_URL or disable Apps Script deployment and submit vote.
   - Confirm UI error: Unable to record your vote. Please try again.

## 6) Production Deployment

1. Commit and push changes.
2. In Vercel, set GOOGLE_SCRIPT_URL.
3. Trigger deploy.
4. Submit a real test vote and verify it appears in the Votes sheet.

## 7) Notes

- Active write endpoint: /api/submitVote
- Active admin read endpoint: /api/getVotes
