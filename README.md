# Civic Voice AI

Build: CivicConnect AI — Smart Civic Issue Reporting & Resolution Platform

1. PROJECT OVERVIEW

Build a production-quality, responsive full-stack web application called CivicConnect AI for SIH25031 — Crowdsourced Civic Issue Reporting and Resolution System.

The platform allows citizens to report civic problems such as:

Garbage accumulation

Potholes and damaged roads

Broken streetlights

Water leakage

Drainage blockage

Waterlogging

Fallen trees

Damaged public infrastructure

Illegal dumping

Other municipal issues

The platform uses AI to:

Analyze uploaded images.

Understand the citizen's description.

Automatically classify the issue.

Estimate severity/priority.

Recommend the responsible department.

Detect potentially duplicate complaints.

Generate concise summaries for administrators.

Help citizens track complaints through an AI assistant.

The application must have two primary roles:

Citizen

Administrator / Government Officer

Build the application as a real working product, not as a static UI mockup.

2. CORE PRODUCT WORKFLOW

The main workflow must be:

Citizen reports issue
→ Upload photo
→ Capture/select location
→ Enter description
→ AI analyzes issue
→ AI predicts category
→ AI estimates priority
→ AI recommends department
→ Complaint created
→ Admin receives complaint
→ Admin assigns/updates status
→ Field worker/department resolves issue
→ Citizen receives status updates
→ Citizen verifies resolution
→ Analytics are updated

3. DESIGN SYSTEM — IMPORTANT

Visual Style: PREMIUM CLAYMORPHISM

Use a modern claymorphism-inspired UI.

Do NOT make it look childish, cartoonish, or overly colorful.

The design should feel like:

Government technology + modern SaaS + soft 3D clay interface.

Use:

Large rounded corners

Soft raised surfaces

Subtle inner shadows

Soft outer shadows

Slightly inflated cards

Smooth gradients

Layered surfaces

Large whitespace

Friendly but professional typography

Soft icons

Gentle hover animations

Micro-interactions

Avoid:

Excessive glassmorphism

Excessive neon

Very dark cyberpunk styling

Flat Bootstrap-style cards

Excessive gradients

Excessive shadows

Childish illustrations

Too many colors

4. COLOR PALETTE

Use a sophisticated civic-tech palette.

Primary

Deep Teal:
#176B68

Secondary Teal:
#2A8C87

Background

Warm Off-White:
#F5F7F4

Soft Mint:
#E7F2EE

Accent

Coral:
#F27C6B

Use coral sparingly for important actions and warnings.

Success

Soft Green:
#4E9F72

Warning

Amber:
#E8A84E

Critical

Red:
#D95C5C

Text

Primary:
#243536

Secondary:
#657776

Muted:
#91A09E

The overall UI should feel calm, trustworthy, environmentally conscious, and modern.

5. CLAYMORPHISM COMPONENT STYLE

Cards should look slightly inflated.

Example visual treatment:

Border radius: 22–32px

Soft outer shadow

Very subtle inner highlight

Background slightly lighter than page background

No harsh borders

Buttons should look like soft clay objects

Hover should slightly lift the component

Active state should appear slightly pressed inward

Use shadows carefully.

The UI must remain accessible and readable.

6. TYPOGRAPHY

Use a modern font such as:

Inter

Manrope

Plus Jakarta Sans

Prefer:

Manrope

for the primary UI.

Headings should be bold but not excessively heavy.

Use clear hierarchy:

H1 → 36–48px
H2 → 28–32px
H3 → 20–24px
Body → 14–16px

7. APPLICATION STRUCTURE

Create the following main routes:

Public

/

Landing page

/login

Login

/register

Citizen registration

Citizen

/citizen/dashboard

Citizen dashboard

/citizen/report

Report an issue

/citizen/issues

My reported issues

/citizen/issues/:id

Complaint details

/citizen/map

Nearby civic issues

/citizen/profile

Profile/settings

Admin

/admin/dashboard

Admin overview

/admin/issues

All complaints

/admin/issues/:id

Complaint management

/admin/map

Civic issue map

/admin/analytics

Analytics

/admin/departments

Departments

/admin/users

Users

8. LANDING PAGE

Create a premium landing page.

Hero section:

Headline:

"Smarter Cities Start With Your Voice."

Subheading:

"Report civic issues in seconds. Let AI route, prioritize, and track them until they're resolved."

Primary CTA:

Report an Issue

Secondary CTA:

Explore Dashboard

Hero visual:

Create a soft 3D clay-style illustration/dashboard preview showing:

City map

Civic issue markers

Complaint cards

AI analysis panel

Do not use generic stock imagery.

9. LANDING PAGE SECTIONS

Include:

Hero

Large headline + CTA + product preview.

How It Works

Show 4 steps:

Report

AI Analyze

Government Acts

Citizen Verifies

Use soft clay-style icons.

AI Features

Show:

Image Recognition

Smart Classification

Priority Detection

Department Routing

Duplicate Detection

AI Summaries

Civic Categories

Show attractive cards for:

Roads

Waste

Water

Electricity

Environment

Drainage

Impact Section

Show sample statistics:

12,480 Issues Reported

9,842 Issues Resolved

78% Average Resolution Rate

94% AI Classification Accuracy

These are DEMO values and must be clearly treated as sample/demo data.

Footer

Include:

CivicConnect AI

SIH25031

Smart Civic Issue Reporting & Resolution Platform

10. CITIZEN DASHBOARD

Create a welcoming dashboard.

Top section:

Good morning, [Citizen Name] 👋

Subtitle:

"Let's make your neighborhood better, one report at a time."

Show statistics:

Reports Submitted

In Progress

Resolved

Pending Verification

Use clay cards.

Quick Action

Large highlighted card:

Found a civic issue?

Button:

+ Report an Issue

Recent Reports

Display complaint cards with:

Issue image

Category

Location

Date

Priority

Status

Complaint ID

Example:

Pothole Detected

📍 Main Road, Ward 12

Priority: High

Status: In Progress

#CIV-1024

11. REPORT ISSUE PAGE

This is one of the most important screens.

Design it as a clean multi-step process.

Step 1 — Upload

Large clay dropzone:

Drop an image here

or

Take Photo

Support:

JPG

PNG

Camera input

Show image preview.

Step 2 — Location

Show map.

Automatically attempt to obtain the user's current location.

Display:

Current Location

Latitude / longitude

Allow the user to adjust the marker.

Step 3 — Description

Text area:

"Tell us what happened..."

Example placeholder:

"Large pothole near the school entrance."

Step 4 — AI Analysis

After the user uploads the image and description, show an AI processing state:

Analyzing your report...

Use a subtle animated AI indicator.

Then show:

AI Analysis

Detected Issue:

Road Damage / Pothole

Confidence:

94%

Priority:

High

Recommended Department:

Roads & Infrastructure

Possible Duplicate:

2 nearby reports found

12. AI ANALYSIS RESULT CARD

Use a beautiful clay card.

Example:

AI INSIGHT

Pothole detected

94% confidence

Priority:
🔴 High

Department:
Roads & Infrastructure

Location:
Main Road, Ward 12

Potential duplicates:
2

Button:

Submit Report

13. COMPLAINT DETAILS PAGE

Show:

Complaint #CIV-1024

Pothole near Main Road

Status:

In Progress

Use a timeline:

Reported
↓
AI Analyzed
↓
Assigned
↓
In Progress
↓
Resolved
↓
Citizen Verified

Each stage should have a visual indicator.

Details

Show:

Original image

AI classification

Description

Location map

Department

Priority

Assigned officer

Created date

Last update

14. CITIZEN RESOLUTION VERIFICATION

When an issue is marked resolved, show:

"Is this issue actually fixed?"

Two large clay buttons:

✓ Yes, issue resolved

✕ No, issue still exists

If the citizen selects "No":

Allow them to upload a new image and comment.

This should reopen the complaint.

15. ADMIN DASHBOARD

The admin dashboard should look significantly more data-oriented while maintaining the same design system.

Header:

Civic Operations Center

Subtitle:

"Monitor, prioritize and resolve civic issues across the city."

Top statistics:

Total Issues

New Today

High Priority

In Progress

Resolved

Awaiting Verification

16. ADMIN ISSUE TABLE

Create a professional responsive table.

Columns:

Complaint ID

Issue

Category

Location

Priority

Department

Status

Date

Actions

Example:

CIV-1024 | Pothole | Roads | Ward 12 | High | Roads Dept | In Progress

Use colored status badges.

17. ADMIN ISSUE DETAILS

When an administrator opens an issue, show:

Left side:

Issue image

Location map

Citizen description

Right side:

AI Analysis

Category:
Pothole

Confidence:
94%

Severity:
High

Recommended Department:
Roads

Duplicate Probability:
82%

Admin Actions

Buttons:

Assign Department

Assign Officer

Change Priority

Change Status

Add Update

Mark Resolved

18. AI EXPLANATION

Include an expandable section:

"Why was this issue classified as High Priority?"

Example:

"The uploaded image indicates significant road damage. The reported location is near a school, which may increase potential safety impact. Similar reports were also submitted within a 200-meter radius."

This is DEMO reasoning and should be clearly presented as AI-generated decision support.

19. ADMIN MAP

Create an interactive map.

Use:

Leaflet + OpenStreetMap

Display issue markers.

Marker colors:

Green → Low

Amber → Medium

Red → High

Dark Red → Critical

Clicking a marker opens:

Complaint ID

Issue type

Priority

Status

Location

20. HEATMAP

Add a heatmap mode.

Allow the admin to visualize:

Complaint Density

Areas with many reports should appear as hotspots.

Add filters:

Category

Priority

Status

Date

Department

21. ANALYTICS PAGE

Create a beautiful analytics dashboard.

Charts:

Issues by Category

Bar chart.

Issues by Priority

Donut chart.

Resolution Rate

Progress visualization.

Issues Over Time

Line chart.

Department Performance

Bar chart.

Average Resolution Time

Metric cards.

22. AI INSIGHTS PANEL

This should be a major feature.

Create a section:

AI Civic Insights

Example:

⚠ Waste Management Hotspot

"Ward 12 has experienced a 34% increase in waste-related complaints over the last 7 days."

⚠ Repeated Road Issue

"23 reports appear to refer to similar road damage near Main Road."

✓ Resolution Improvement

"Road-related complaints are currently being resolved faster than the previous reporting period."

These should be generated from the application's actual stored demo data.

Do not fabricate real government statistics.

23. DUPLICATE DETECTION

When a citizen submits a complaint, compare:

Location

Image similarity

Description similarity

Time

If a potential duplicate is found, display:

Possible Duplicate

"We found 2 similar reports within 250 meters."

Show:

Existing complaint ID

Distance

Similarity score

Status

Allow the admin to merge or link complaints.

24. AI CHAT ASSISTANT

Create a floating AI assistant accessible throughout the application.

Name:

Civi

Example citizen questions:

"Where is my complaint?"

"What does In Progress mean?"

"How do I report garbage?"

"Show my unresolved complaints."

Admin questions:

"How many high-priority road complaints are pending?"

"Which ward has the most complaints?"

"Summarize today's major civic issues."

The assistant should use the application's database/context where possible.

Do not allow it to invent complaint information.

25. AI IMPLEMENTATION

Separate AI responsibilities.

Vision AI

For uploaded images:

Pothole

Garbage

Water leakage

Broken streetlight

Fallen tree

Damaged infrastructure

LLM

For:

Text classification

Severity reasoning

Department recommendation

Summarization

Natural-language commands

Chat assistant

Similarity / Embeddings

For:

Duplicate complaint detection

Semantic search

Do not train large models from scratch.

Use existing AI models/APIs.

26. BACKEND

Use:

FastAPI + Python

Create APIs such as:

POST /api/auth/register

POST /api/auth/login

POST /api/issues

GET /api/issues

GET /api/issues/{id}

PATCH /api/issues/{id}

POST /api/issues/{id}/analyze

POST /api/issues/{id}/updates

POST /api/issues/{id}/verify

GET /api/analytics

GET /api/map/issues

POST /api/ai/chat

27. DATABASE

Use PostgreSQL.

Tables:

users

id

name

email

password_hash

role

created_at

issues

id

complaint_number

user_id

description

image_url

latitude

longitude

address

category

priority

ai_confidence

department_id

status

created_at

updated_at

departments

id

name

description

issue_updates

id

issue_id

user_id

status

message

created_at

ai_analysis

id

issue_id

detected_category

confidence

severity

recommended_department

duplicate_probability

explanation

created_at

duplicate_links

id

issue_id

related_issue_id

similarity_score

28. AUTHENTICATION

Implement role-based authentication.

Roles:

Citizen

Can:

Report issues

View own issues

Track issues

Verify resolution

Use AI assistant

Admin

Can:

View all issues

Assign departments

Update status

View analytics

View map

Manage users

Manage departments

Use AI assistant

Never expose admin functionality to citizens.

29. RESPONSIVE DESIGN

The application must work on:

Desktop

Laptop

Tablet

Mobile

The citizen reporting experience should be mobile-first.

The admin dashboard can prioritize desktop/tablet.

30. MICRO-INTERACTIONS

Add subtle animations:

Button hover

Card lift

Page transitions

Modal appearance

AI processing animation

Success confirmation

Status timeline animation

Map marker hover

Skeleton loaders

Keep animations professional.

Do not over-animate the interface.

31. ACCESSIBILITY

Ensure:

Good color contrast

Keyboard navigation

Proper labels

Accessible forms

Clear error messages

Visible focus states

Don't rely only on color to communicate status

32. SECURITY

Implement basic production-quality security:

Password hashing

JWT/session authentication

Role-based authorization

Input validation

File type validation

File size limits

API authentication

Rate limiting where appropriate

For AI processing, consider PII redaction before sending text to an external AI provider.

33. DEMO DATA

Create a seed script with realistic fictional data.

Generate:

50 citizens

5 administrators

8 departments

100 civic complaints

Multiple locations

Different categories

Different priorities

Different statuses

Use fictional/demo data only.

Clearly label analytics as Demo Data.

34. SAMPLE DEPARTMENTS

Create:

Roads & Infrastructure

Waste Management

Water Supply

Electrical Maintenance

Drainage & Sanitation

Parks & Environment

Public Works

General Municipal Services

35. SAMPLE ISSUE CATEGORIES

Create:

Pothole

Road Damage

Garbage

Water Leakage

Drainage Blockage

Streetlight

Fallen Tree

Waterlogging

Illegal Dumping

Public Infrastructure Damage

Other

36. ERROR HANDLING

Every action should have useful feedback.

Examples:

If location is unavailable:

"Location access is unavailable. Please select your location manually."

If image upload fails:

"Unable to upload this image. Please use JPG or PNG under 10 MB."

If AI analysis fails:

"AI analysis is temporarily unavailable. Your complaint can still be submitted and manually categorized by an administrator."

Never block the entire complaint system because an AI service fails.

37. IMPORTANT PRODUCT PRINCIPLE

AI must be decision support, not autonomous government decision-making.

The system should always allow authorized administrators to:

Correct AI classification

Change priority

Change department

Override AI recommendations

Show an indicator:

AI Recommendation

rather than:

Final Decision

38. FINAL UI QUALITY REQUIREMENT

The application must look like a polished startup/government-tech product.

Do NOT produce:

Generic Bootstrap UI

Plain white forms

Default browser inputs

Generic dashboard templates

Excessive gradients

Random colors

Huge amounts of text

Unstyled tables

Poor spacing

Use:

Claymorphic cards

Premium typography

Consistent spacing

Soft 3D surfaces

Strong information hierarchy

Elegant charts

Beautiful maps

Professional icons

Responsive layouts

The final visual impression should be:

"A modern smart-city platform built by a professional product team."

39. DEVELOPMENT ORDER

Build in this order:

Phase 1

Design system + layout + routing

Phase 2

Authentication

Phase 3

Citizen reporting

Phase 4

Complaint database

Phase 5

Admin dashboard

Phase 6

Complaint status workflow

Phase 7

Map integration

Phase 8

AI classification

Phase 9

AI priority + department recommendation

Phase 10

Duplicate detection

Phase 11

Analytics

Phase 12

AI assistant

Phase 13

Polish + responsive design + animations

Do not build all features as fake static screens.

Every major button should perform a real action.

40. MOST IMPORTANT REQUIREMENT

Build a functioning MVP first.

The core loop must work end-to-end:

Citizen

→ Upload photo

→ Enter description

→ Select location

→ AI analyzes

→ Submit complaint

→ Complaint appears in database

→ Admin sees complaint

→ Admin assigns department

→ Admin changes status

→ Citizen sees updated status

→ Admin marks resolved

→ Citizen verifies resolution

Only after this complete flow works should you implement advanced AI features.

41. FINAL PRODUCT NAME

Use:

CivicConnect AI

Subtitle:

"Report. Resolve. Improve."

Alternative tagline:

"Turning Citizen Reports Into Smarter Civic Action."

Use the SIH problem identifier subtly in the About/Footer section:

SIH25031 — Crowdsourced Civic Issue Reporting and Resolution System

Do not make SIH branding dominate the application.

42. OUTPUT EXPECTATION

Generate:

Complete frontend

Complete backend

Database schema

Authentication

Seed/demo data

AI service abstraction

Responsive UI

Admin dashboard

Citizen dashboard

Interactive map

Analytics

Complaint workflow

AI assistant

README with setup instructions

.env.example

API documentation

The project must run locally with clear setup instructions.

Prioritize working functionality over unnecessary complexity.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://citizen-civic-ai.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8c5d3162-70c9-4806-91d1-d257d0516358).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
