# FixHub System Documentation

## 1. System Overview

FixHub is a hostel maintenance reporting and tracking system. Students submit maintenance issues, administrators manage and assign those issues, and technicians update the work status. The system stores the operational data in PostgreSQL in production and uses SQLite as a local development fallback.

The main workflow is:

1. A student creates an account or signs in.
2. The student submits a maintenance issue.
3. The system assigns a ticket number and detects an initial priority.
4. An administrator reviews the ticket and may assign a technician or change its priority.
5. The technician works on the ticket and adds progress notes.
6. The technician submits completed work for administrative approval.
7. The administrator approves the resolution.
8. Students and technicians receive in-app and email updates where configured.

## 2. Objectives

- Provide a single place for students to report hostel maintenance problems.
- Give administrators visibility over all reported issues.
- Route work to the correct technician.
- Track issue status from reporting through resolution.
- Keep students informed about progress.
- Provide analytics for categories, priorities, rooms, resolution time, and technician workload.
- Detect potentially urgent and duplicate complaints.

## 3. User Roles

### Student

Students can:

- Register with their name, email, hostel, room number, and password.
- Sign in and manage their profile.
- Submit an issue with a title, description, category, hostel, room, and optional image.
- View their own tickets and ticket progress.
- View the activity timeline for their tickets.
- Receive notifications when an issue is resolved or updated.

Students cannot assign technicians, approve resolutions, or view other students' issues.

### Administrator

Administrators can:

- View all issues.
- View system analytics.
- Assign issues to technicians.
- Change issue priority.
- Move technician submissions from review to resolved.
- View recent activity.
- Manage users and account activation.
- Reset user passwords.
- Add and remove hostels.
- Receive in-app alerts for issues awaiting approval.

### Technician

Technicians can:

- View issues assigned to them.
- Move assigned issues to `in_progress`.
- Add work notes.
- Submit completed work for administrator approval.
- Receive in-app alerts when tickets are assigned or updated.

Technicians cannot approve their own resolutions or manage users and hostels.

## 4. Issue Lifecycle

The issue status values are:

| Status | Meaning | Typical actor |
|---|---|---|
| `reported` | A student has submitted the issue. | Student |
| `assigned` | An administrator has assigned a technician. | Administrator |
| `in_progress` | The technician is working on the issue. | Technician |
| `review` | The technician has submitted completed work for approval. | Technician |
| `resolved` | The administrator has approved the resolution. | Administrator |

A technician selecting resolved does not immediately resolve the issue. The system changes it to `review`, allowing an administrator to verify the work first.

Every meaningful change creates an activity record in the `updates` table.

## 5. Automatic Features

### Priority Detection

The system examines the issue title and description for keywords.

- Urgent terms include fire, smoke, gas leak, flooding, sparking, electric shock, exposed wire, no water, burst pipe, security, and broken lock.
- High-priority terms include leaking, not working, broken, no internet, no heat, mold, infestation, pests, and bed bugs.
- Issues without matching terms receive normal priority.

Administrators can manually change the priority afterward.

### Duplicate Detection

When a student submits an issue, the system checks open issues in the same category. A potential duplicate is identified when:

- The issue is in the same room, or
- The issue title has meaningful word overlap with another open issue.

When a match is found, the new issue stores the matching issue ID in `duplicate_of` and the student-facing response includes a duplicate warning.

### Ticket Numbering

Ticket numbers use the format `HM-0001`. The system finds the highest existing numeric ticket suffix and generates the next number.

## 6. Email Notification System

### Configuration

Email delivery uses SMTP through Nodemailer. Configure these environment variables in the live hosting environment:

| Variable | Purpose |
|---|---|
| `SMTP_HOST` | SMTP server hostname |
| `SMTP_PORT` | SMTP server port, commonly `465` or `587` |
| `SMTP_USER` | SMTP account username |
| `SMTP_PASS` | SMTP account password or provider app password |
| `EMAIL_FROM` | Sender address displayed to recipients |

Email sending is enabled only when all four SMTP connection values are available: host, port, username, and password. `EMAIL_FROM` has a local fallback, but a valid production sender should be configured.

If SMTP is not configured, the application does not fail the maintenance action. It logs that the email was skipped. The database update still completes.

### Email Notification Matrix

| Event | Student email | Technician email | Administrator email |
|---|---:|---:|---:|
| Student registers | No | No | No |
| Student submits a new issue | Yes, confirmation | No | Yes, new issue alert |
| Administrator assigns a technician | Yes, assignment update | Yes, assignment update | No direct email |
| Technician changes status | Yes, status update | Yes when status applies | No direct email |
| Technician adds an internal note | No routine email | No routine email | In-app activity |
| Technician submits work for approval | Yes, status update | Yes, update | Yes, approval-needed email and in-app alert |
| Administrator approves resolution | Yes, resolution update | Yes when the ticket status changes | In-app activity/alert |
| User changes their password | Yes, security alert | Yes, security alert | Yes for the affected user only |
| Administrator resets a password | Yes, security alert | Yes, security alert | Yes for the affected user only |

### Student Email Content

Issue emails contain:

- Student name.
- Ticket number.
- Update summary.
- Issue title.
- Current status.
- Room and hostel.
- A reminder to visit the portal for full details.

A new issue also sends a confirmation email containing the issue title, category, and location.

### Technician Email Content

Technician update emails contain:

- Technician name.
- Ticket number.
- Update summary.
- Issue title.
- Current status.
- Room and hostel.
- A reminder to view the ticket in the portal.

Technicians receive these emails when a ticket is assigned or when a status change concerns their assigned ticket.

### Administrator Notifications

Administrators currently receive workflow notifications through the application rather than direct email:

- New tickets are visible in the admin issue list.
- Tickets submitted for approval appear in the notification bell.
- Recent activity appears in the admin activity view.
- Analytics provide operational summaries.

Administrators receive direct email for newly reported issues and technician submissions awaiting approval. Routine ticket notes and priority-only changes remain in-app to avoid unnecessary email volume.

## 7. In-App Notification Bell

The notification bell refreshes every 30 seconds and also refreshes when opened.

The returned alerts depend on the signed-in role:

- **Administrator:** recent issues with status `review`.
- **Technician:** recent assignment updates for tickets assigned to that technician.
- **Student:** recent administrator status updates marking the student's issue as resolved.

The bell displays a count of alerts that arrived since the user last opened it during the current browser session. It does not persist read/unread state in the database.

## 8. Data Model

### `users`

Stores students, administrators, and technicians.

Important fields:

- `id`
- `name`
- `email`
- `password_hash`
- `role`
- `room`
- `hostel`
- `specialty`
- `avatar_url`
- `phone`
- `bio`
- `is_active`
- `created_at`

Passwords are stored as bcrypt hashes. Passwords are never stored in plain text.

### `hostels`

Stores hostel options used by administration and student registration.

- `id`
- `name`
- `created_at`

The public `/api/hostels` endpoint reads this table for the student registration dropdown. The admin hostel management screen can add or delete records.

### `issues`

Stores maintenance tickets.

Important fields:

- `id`
- `ticket_no`
- `title`
- `description`
- `category`
- `priority`
- `status`
- `room`
- `hostel`
- `image_data`
- `student_id`
- `technician_id`
- `duplicate_of`
- `created_at`
- `updated_at`
- `resolved_at`

### `updates`

Stores the activity timeline for issues.

- `id`
- `issue_id`
- `actor_id`
- `message`
- `created_at`

## 9. Application Components

### Frontend

- `app/page.tsx`: login landing page.
- `app/register/page.tsx`: student registration page and hostel dropdown.
- `app/dashboard/student/page.tsx`: student dashboard.
- `app/dashboard/technician/page.tsx`: technician dashboard.
- `app/dashboard/admin/page.tsx`: administrator dashboard.
- `app/dashboard/admin/users/page.tsx`: user and hostel management.
- `app/dashboard/issue/[id]/page.tsx`: issue detail and activity timeline.
- `components/NotificationBell.tsx`: role-specific in-app notifications.

### Backend API

- `/api/auth/login`: authenticate a user.
- `/api/auth/logout`: clear the session cookie.
- `/api/auth/me`: return the current user.
- `/api/auth/register`: create a student account.
- `/api/hostels`: return hostel options for registration.
- `/api/admin/hostels`: administrator hostel management.
- `/api/admin/users`: administrator user management.
- `/api/issues`: list and create issues.
- `/api/issues/[id]`: view and update one issue.
- `/api/notifications`: return role-specific in-app notifications.
- `/api/analytics`: return administrator analytics.
- `/api/technicians`: return active technicians.
- `/api/admin/activity`: return recent activity.
- `/api/user/profile`: profile and administrator management operations.

## 10. Authentication and Authorization

Authentication uses a signed JWT stored in an HTTP-only cookie named `hostel_session`.

The cookie:

- Is HTTP-only.
- Uses the `lax` same-site policy.
- Applies to the root path.
- Expires after seven days.

The signing key is read from `SESSION_SECRET`. A strong secret must be configured in the live hosting environment.

Authorization is enforced at API and page boundaries:

- Unauthenticated users receive `401` responses or are redirected to the login page.
- Authenticated users without the required role receive `403` responses or are redirected.
- Students can access only their issues.
- Technicians can access only issues assigned to them.
- Administrators can access system-wide management functions.

## 11. Database and Live Hosting Environment

### Live Hosting Environment

A live hosting environment requires a persistent PostgreSQL database configured with either:

- `POSTGRES_URL`, or
- `DATABASE_URL`

The application uses `pg` and initializes the schema when the database is first accessed. Initialization is additive for partially migrated databases: it creates missing tables, adds missing columns, and creates missing indexes. Existing records are preserved.

Default demo data is inserted only when the database has no users. Existing users and hostels are not replaced or reseeded during normal startup.

### Vercel Deployment

The application is deployed to Vercel as a Next.js App Router application. Vercel provides the live hosting environment, while PostgreSQL provides persistent application data storage.

#### Required Vercel Environment Variables

Add the following variables in the Vercel project settings. Configure them for the environments where the application will run, especially **Production**:

| Variable | Required | Purpose |
|---|---:|---|
| `POSTGRES_URL` or `DATABASE_URL` | Yes | Persistent PostgreSQL connection string |
| `SESSION_SECRET` | Yes | Secret used to sign and verify login sessions |
| `SMTP_HOST` | For email | SMTP provider hostname |
| `SMTP_PORT` | For email | SMTP provider port, usually `465` or `587` |
| `SMTP_USER` | For email | SMTP account username |
| `SMTP_PASS` | For email | SMTP account password or app password |
| `EMAIL_FROM` | Recommended | Sender address for system emails |

Secrets must be added as server-only environment variables. They must not use a `NEXT_PUBLIC_` prefix and must not be committed to the repository.

#### Deployment Procedure

1. Push the application source code to the connected Git repository.
2. Import the repository into Vercel as a Next.js project.
3. Add the required environment variables under **Project Settings > Environment Variables**.
4. Select the appropriate scopes, such as Preview and Production.
5. Deploy the project using the default Next.js build settings.
6. Confirm that the deployment build completes successfully.
7. Open the deployed application and test login, registration, hostel loading, issue creation, assignment, status updates, and email delivery.

The application initializes missing PostgreSQL tables and columns when the database is first accessed. Existing migrated tables and records are preserved. The local `node_modules` and `.next` directories are not deployed from Git; Vercel installs dependencies and creates its own build output during deployment.

#### Vercel Verification Checklist

- Confirm the deployment uses the intended Production environment variables.
- Open `/register` and verify the hostel dropdown loads from PostgreSQL.
- Test an existing user login.
- Test a student registration.
- Create and assign a test issue.
- Confirm the technician and administrator notification views update.
- Confirm student and technician emails arrive when SMTP is configured.
- Review Vercel deployment logs and runtime logs for database or email errors.

### Local Development

When no Postgres URL is configured, the application uses Node's built-in `node:sqlite` and stores the local database at `data/hostel.db`.

### Existing SQLite Migration

To copy an existing SQLite database into PostgreSQL:

```bash
POSTGRES_URL="your-postgres-connection-string" npm run migrate:postgres
```

For a different SQLite source path:

```bash
POSTGRES_URL="your-postgres-connection-string" SQLITE_PATH="/path/to/hostel.db" npm run migrate:postgres
```

## 12. Security Controls

The following protections are implemented:

- Passwords are hashed with bcrypt before storage.
- Sessions use signed JWTs in HTTP-only cookies.
- Production session cookies use the `secure` flag.
- Production session creation and verification require `SESSION_SECRET`; the development fallback is not used in production.
- API routes verify authentication and enforce role-based authorization.
- Students can access only their own issues, and technicians can access only assigned issues.
- SQL values use parameterized queries rather than string interpolation.
- Email-disabled logging does not include recipient addresses or email message content.
- Database and SMTP credentials are read from environment variables.
- Add rate limiting and account lockout controls for login and registration.
- Validate uploaded image MIME types, dimensions, and storage size.


## 13. Operational Requirements

Before deploying:

- Configure `POSTGRES_URL` or `DATABASE_URL`.
- Configure a strong `SESSION_SECRET`.
- Configure SMTP variables if email notifications are required.
- Confirm that the Postgres user can create or alter the application tables, or run the schema migration with an appropriately privileged connection.
- Confirm the hosting environment is using the intended environment scope, such as Development, Preview, or Production.
- Deploy after committing the latest source changes.

After deploying:

- Open the registration page and verify hostel options load.
- Register a test student.
- Submit a test issue.
- Verify the ticket appears for the administrator.
- Assign the ticket to a technician.
- Verify the technician sees the assignment.
- Move the ticket through work and approval.
- Confirm the expected email messages arrive when SMTP is enabled.
- Check the hosting environment's runtime logs for database or SMTP errors.

## 14. Error Handling

The API returns JSON errors with appropriate HTTP status codes:

- `400`: invalid or incomplete request.
- `401`: user is not signed in.
- `403`: user lacks permission.
- `404`: requested record does not exist.
- `409`: duplicate account or hostel.
- `500`: server, database, or external-service failure.

Email failures are logged and do not roll back issue changes. This keeps maintenance reporting available even when an email provider is temporarily unavailable.

## 15. Future Enhancements

- Send direct email notifications to administrators.
- Store notification read state in the database.
- Replace base64 image storage with object storage such as S3 or R2.
- Add database migrations with version tracking instead of startup schema changes.
- Generate ticket numbers with a database sequence or transaction-safe counter.
- Add rate limiting to authentication and issue submission endpoints.
- Add automated tests for role permissions, email events, and Postgres schema upgrades.
