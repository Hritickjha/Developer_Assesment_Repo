# Candidate Instructions

## Overview

You have been given access to a small internal web application — the **Microsoft Client Operations Portal** — built by a fictional early-stage B2B SaaS company.

Your task is to review the codebase and record a **20-minute Loom video** walking through your findings.

You have **up to 20 minutes to prepare** before you record. You do not need to run the app, but you may if you wish — setup instructions are in `README.md`.

---

## What the App Does

An internal staff tool for managing client Microsoft 365 accounts. Features include:

- Microsoft login (MSAL-style)
- Client account list and detail views with status management
- Microsoft 365 user sync from Azure AD (mocked)
- Client onboarding workflow trigger
- Microsoft tenant integration settings
- Audit log of staff activity

---

## What We Are Assessing

We are not asking you to fix anything or write any code. We want to see how you **think** about backend systems, security, and production readiness.

We are looking for:

- Can you reason about how auth and identity actually work in a Microsoft context?
- Can you spot security or architecture problems that would matter in production?
- Can you communicate what you find with appropriate specificity and priority?
- Can you distinguish between something worth flagging now versus something to note and move on?

---

## Your Loom — Six Topics to Cover

Structure your 20-minute recording around these six topics. Suggested timing is a guide, not a rule.

### 1. What the app is trying to do  *(~2 min)*

Orient yourself and your audience. Describe the app's purpose, who uses it, and what the key backend flows are. Name the main components and how they fit together.

### 2. Auth and security issues  *(~5 min)*

Walk through how authentication works end-to-end — from the login screen to the API. Identify the specific problems you see with how identity is established and trusted. Be precise: name the files, name the mechanism, explain the attack.

### 3. Backend architecture concerns  *(~4 min)*

Look at the API layer. How is the code organised? What is missing structurally? What would make this harder to maintain, test, or extend as the team grows?

### 4. Microsoft integration risks  *(~4 min)*

Focus on the Microsoft-specific flows: the sync operation, the Graph API calls, tenant handling. What could go wrong in production that would not be visible in a local demo?

### 5. What you would fix first  *(~3 min)*

If you were joining this team on Monday, what would you address in the first week and why? Prioritise by risk, not by ease. Explain your reasoning.

### 6. Questions you would ask before working on it  *(~2 min)*

What do you not know yet that would change your approach? What would you ask the team, the product owner, or the security lead?

---

## Ground Rules

- Treat this as a **senior code review**, not a quiz. We want your judgement, not a checklist.
- **Be specific.** Identify the relevant file, behavior, risk, and impact instead of using a vague label.
- Point out what is working as well as what is not. Most early codebases have both.
- Do not spend time on formatting, typos, or naming conventions. Focus on things that matter in production.
- Honest uncertainty is fine — "I'm not sure if this is intentional, but..." is better than confident incorrectness.

---

## What We Are Not Looking For

- A rewrite proposal
- A list of every TODO or minor code smell
- Nitpicking of variable names, file layout, or style
- Perfection — 20 minutes is not enough to catch everything, and we know it

---

## Submission

Send your Loom link to your recruiter contact within **48 hours** of receiving this repo.

We are looking forward to seeing how you think.
