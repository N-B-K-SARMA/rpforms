# RPForms — Complete Installation, Configuration & Administration Guide

## 1. RPForms Overview
RPForms is a modern, open-source Discord application framework designed for roleplay communities. It provides a robust architecture for users to submit allowlist (or other) applications via Discord, which are stored securely in a MariaDB database and reviewed by staff in a dedicated review channel. 

**Core Workflow:**
```text
Applicant
   ↓
Discord Form
   ↓
RPForms
   ↓
Application Database
   ↓
Staff Review Panel
   ↓
Approve / Reject / Needs Review
   ↓
Database State
   ├── Result Log (Staff channel)
   └── Applicant DM (User facing)
```

## 2. Requirements

- **Node.js**: v16+ (or standard modern LTS versions).
- **TypeScript**: Handled via `npm run build`.
- **Database**: MariaDB / MySQL.
- **Discord Bot**: Requires a Discord Developer Application.
- **Discord Intents**: Standard intents (No special privileged intents are strictly required unless your specific forms rely on message content parsing).
- **Discord Permissions**:
  - View Channels
  - Send Messages
  - Embed Links
  - Use Application Commands (for `/rpforms`)

## 3. Installation

### 1. Clone/Download Project
Clone the repository to your local machine or server.

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
Create a `.env` file in the root directory and configure the environment variables:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_db_password
DB_NAME=daddys_roleplay
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_discord_application_client_id
```

> **Note:** Never commit this `.env` file to public repositories or share your `DISCORD_TOKEN` with anyone.

## 4. Discord Bot Setup
1. Go to the [Discord Developer Portal](https://discord.com/developers/applications).
2. Create a New Application.
3. Navigate to the **Bot** tab, generate a token, and paste it into `DISCORD_TOKEN` in your `.env`.
4. Copy the Application ID into `CLIENT_ID` in your `.env`.
5. Under OAuth2 > URL Generator, select `bot` and `applications.commands`.
6. Select permissions (Send Messages, Embed Links, View Channels).
7. Copy the generated URL and invite the bot to your server.

## 5. Database Setup
RPForms uses MariaDB to store application state. The schema initializes automatically via `src/database/init.ts` on startup.

**Tables created:**
- `settings`
- `users`
- `applications`
- `application_answers`
- `application_logs`
- `application_reviews`

**Application States:**
- `pending`: Application submitted, waiting for review.
- `review`: Staff has requested changes / application is locked for review.
- `approved`: Staff approved the application.
- `rejected`: Staff rejected the application.
- `closed`: Application was manually closed without a final decision.

### State Protection Architecture
RPForms uses an **authoritative atomic state transition**. When staff review an application, the SQL engine enforces the transition:
```sql
UPDATE applications 
SET status = ? 
WHERE id = ? 
AND status IN ('pending', 'review');
```
This guarantees that an application cannot be approved if it has already been finalized by another staff member, protecting against race conditions.

## 6. Form Configuration

RPForms forms are configured via JSON files in the `config/forms/` directory.

Example `config/forms/allowlist.json`:
```json
{
  "metadata": {
    "id": "allowlist",
    "title": "Whitelist Application",
    "description": "Apply for whitelist access.",
    "version": "1.0.0"
  },
  "button": {
    "label": "Apply for Whitelist",
    "style": "Primary"
  },
  "review": {
    "channelId": "1531281025760497824",
    "reviewerRoles": ["1531279940677271573"]
  },
  "actions": {
    "onApprove": {
      "addRoles": ["1531280202020290762"],
      "removeRoles": ["1504806859121361028"],
      "sendDM": true,
      "logChannelId": "1531280859376914552"
    },
    "onReject": {
      "cooldownHours": 24,
      "sendDM": true,
      "logChannelId": "1531280859376914552"
    }
  },
  "questions": [
    {
      "id": 1,
      "type": "text",
      "label": "Character Name",
      "question": "What is your Character Name?",
      "required": true
    },
    {
      "id": 2,
      "type": "paragraph",
      "label": "Backstory",
      "question": "Tell us about your character's backstory.",
      "required": true
    }
  ],
  "runtime": {
    "enabled": true,
    "resumeApplications": true,
    "timeoutMinutes": 60
  }
}
```

### Important Fields
- **metadata.id**: The unique identifier for the form.
- **review.channelId**: The channel where staff will see submitted applications.
- **actions.onApprove.logChannelId**: Where the final Staff Result Log is sent.
- **actions.onReject.cooldownHours**: Time before a rejected user can apply again.

## 7. How to Create a New Form
1. Create a new `.json` file in `config/forms/` (e.g., `police.json`).
2. Define the metadata and button configuration.
3. Add your questions. Use stable, numerical or string IDs for questions (`id: 1`). **Do not change question IDs once the form is live**, as they map to database records.
4. Configure the `onApprove` and `onReject` actions with the correct Discord Channel IDs.
5. Restart the bot (`npm run build && npm run start`).

## 8. Character Name Handling
RPForms creates Staff Result Logs automatically. To extract the applicant's character name, RPForms searches the `form.questions` array for a label or question containing `"Character Name"`. 
It does **not** rely on `answers[0]`, meaning you can reorder your questions or omit the Character Name entirely, and the bot will safely adapt.

## 9. Application Submission Flow
```text
User
 ↓
Clicks Apply Button (Discord UI)
 ↓
Fills out Modal / Text Inputs
 ↓
Submits Application
 ↓
RPForms validates data
 ↓
Stored in MariaDB (status: pending)
 ↓
Review Panel Embed generated in Staff Channel
```

## 10. Staff Review UI
The review panel provides a clean, professional interface inside Discord.

- **Applicant & Discord ID**: Cleanly separated.
- **History**: Quick snapshot of total applications, approvals, and rejections.
- **Answers**: Truncated securely at 1000 characters and displayed inside clean blockquotes (`>`) to respect Discord's 1024-character field limit.

**Buttons:**
- 🟢 **Approve**: Approves the application.
- 🔴 **Reject**: Prompts a rejection reason modal.
- 🟡 **Needs Review**: Flags the application for changes, DMs the applicant.
- 🔵 **View History**: Ephemeral readout of the user's past applications.
- ⚫ **Close**: Silently archives the application.

## 11. Approval Workflow
```text
Approve clicked
 ↓
Validate application state (Must be 'pending' or 'review')
 ↓
Atomic database update (UPDATE applications SET status = 'approved'...)
 ↓
Update review UI (Buttons disabled, embed turns green)
 ↓
Send result log (to config logChannelId)
 ↓
Send applicant DM (if sendDM is true)
```

## 12. Rejection Workflow
- Staff clicks **Reject**.
- A Discord Modal appears prompting for a **Rejection Reason**.
- Upon submission, the atomic database update marks the application as `rejected`.
- The UI turns red and buttons are disabled.
- The applicant is DM'd the reason.
- The Staff Result Log explicitly logs the reason and reviewer.

## 13. Needs Review
Clicking **Needs Review** flags the application and DMs the user that changes are required, providing the reason.
- **Actionability**: The application is **not** finalized. It transitions to `review` status, meaning staff can still eventually Approve or Reject it.

## 14. Result Logs
Result Logs are internal records sent to a specified channel (`actions.onApprove.logChannelId`). 

**Staff Result Log Example:**
```text
Application Approved
Applicant: @User
Application: #4
Reviewed By: @StaffMember
Character: John Doe
Status: 🟢 Approved
```
This is **completely separate** from the Applicant DM.

## 15. Applicant DMs
The user receives a stylized embed in their Direct Messages:
- **Approval DM**: *"Congratulations! Your allow-list application has been accepted."*
- **Rejection DM**: *"Unfortunately, your allow-list application has been rejected. Reason: ..."*

> **Failure Safety**: If an applicant has DMs disabled, RPForms logs the failure to the console but **does not roll back the database decision**. The application remains finalized.

## 16. Error Handling

- **Missing Log Channel**: If a configured `logChannelId` is invalid, the staff member interacting receives an ephemeral warning (*"⚠️ The application was approved, but the configured response log channel could not be found."*). The decision is securely saved in the database regardless.
- **Discord Limits**: Answers over 1000 characters are gracefully truncated before being sent to Discord to prevent `Invalid Form Body` API crashes.
- **Duplicate Interactions**: If two staff members click simultaneously, the bot immediately blocks the second action with an ephemeral `"This application is currently being processed"` or `"This application has already been finalized"` message.

## 17. Race Condition Protection
RPForms is secured by three layers of protection:
1. **UI Protection**: Final-action buttons disable themselves immediately upon success.
2. **In-Memory Mutex**: Prevents two rapid clicks in the same Node.js process from executing DB queries simultaneously.
3. **Database Protection**: The ultimate source of truth. MariaDB's atomic `UPDATE ... WHERE status IN ('pending', 'review')` query guarantees that distributed bot instances cannot corrupt the finalized state.

## 18. Permissions Table

| Permission | Why RPForms Needs It |
| :--- | :--- |
| **View Channel** | Required to see staff channels and applicant contexts. |
| **Send Messages** | Required to post result logs and system notifications. |
| **Embed Links** | All review panels and logs utilize Discord Embeds. |
| **Use Application Commands** | Needed if RPForms registers slash commands (e.g. `/rpforms`). |

## 19. Production Deployment
To deploy RPForms to production:
1. Ensure `.env` is configured for your live database.
2. Run the build script to compile TypeScript:
   ```bash
   npm run build
   ```
3. Start the bot (preferably using a process manager like PM2 or Docker):
   ```bash
   npm run start
   ```
   *(or `node dist/index.js`)*

## 20. Development Workflow
1. Make your code changes in `src/`.
2. Compile and watch for changes during development:
   ```bash
   npm run dev
   ```
3. Test interactions in your test server.
4. Run `npm run lint` and `npm run format` before pushing to production.

## 21. Troubleshooting

- **Bot won't start:** Check `.env` token and ensure MariaDB is running on the specified `DB_PORT`.
- **Form does not load / Invalid JSON:** Run your JSON file through a linter. Ensure `id` fields match the expected types.
- **Result log doesn't appear:** Ensure the `logChannelId` exists and the bot has **Send Messages** permission in that channel.
- **Application says already finalized:** Another staff member processed it, or the database status was manually altered.
- **Applicant doesn't receive DM:** The applicant's Discord privacy settings prohibit direct messages from server members.

## 22. Backup & Maintenance
Always backup your `config/forms/` directory and your `.env` structure. 
Schedule regular dumps of the MariaDB database to preserve application history. **Never commit secrets or your database to public GitHub repositories.**

## 23. Security
- Use the Principle of Least Privilege: RPForms does not need Administrator access.
- Restrict your Staff Review channels so regular members cannot view or click the interaction buttons.

## 24. Quick Reference
- **Forms Config Dir**: `config/forms/`
- **Build Command**: `npm run build`
- **Application States**: `pending`, `review`, `approved`, `rejected`, `closed`
- **Approval Log Config Path**: `actions.onApprove.logChannelId`
