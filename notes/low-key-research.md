# Low-Key research: what the primary sources say

Compiled 2026-11-01 for Ronak (solo founder, Hyderabad), for the YC Winter 2027 application (deadline Nov 2, 8pm PT).

How to read this file:
- Every claim has a URL next to it. Sources are official docs, terms, statutes, gazette text and the products' own sites. Anything that came only from a secondary source is marked "unverified".
- "Not found" means I fetched the page (or searched) and it did not say it. It does not mean the thing is false.
- Most pages were read through a fetch tool that summarises the page, so quotes are short and should be re-read on the page before you rely on them in the application. The DPDP Act and DPDP Rules I downloaded as PDFs and read the actual text.
- This is a research summary, not legal advice (see section 5).
- Nothing was built, registered or sent.

## (a) Top findings that change the design

1. LinkedIn sign-in gives you only a "lite profile": name, given/family name, photo URL, locale, optional email. No headline, about, experience or connections in the OIDC userinfo. https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/sign-in-with-linkedin-v2
2. LinkedIn's own access page says only three permissions are open to everyone (profile, email, post-on-behalf). Talent, Sales and Marketing data need approved partner programs. https://learn.microsoft.com/en-us/linkedin/shared/authentication/getting-access
3. So "answer 3 intent questions" is not optional polish. It is your only source of what someone does, because LinkedIn will not give you the profile text. Treat the answers as the profile.
4. LinkedIn API terms bar showing one member's LinkedIn data beyond what the Application's own users need, and say employment-type decisions need separate written permission. A recruiter view built on LinkedIn data is not allowed on the self-serve product. https://www.linkedin.com/legal/l/api-terms-of-use
5. GitHub's API terms say you may not use the API to download data to sell users' personal information "to recruiters". A recruiter view must not be built from GitHub profile data either. https://docs.github.com/en/site-policy/github-terms/github-terms-of-service (section H)
6. GitHub public profile data (bio, company, location, public repos, languages) needs no special scope, 5,000 requests/hour per authenticated user. This is enough for matching in a dev event. https://docs.github.com/en/rest/users/users?apiVersion=2022-11-28
7. Competitors already do matchmaking plus sponsor lead scanning (Brella, Grip, Whova, Swapcard). Luma is the cheap, free-tier check-in tool. Your gap is "only people physically checked in" plus intent answers, not matchmaking in general.
8. DPDP Rules were notified in November 2025. Notice (Rule 3) and children's consent (Rule 10) come into force 18 months after publication, about May 2027 (my calculation). So v1 is legally in a grace window, but any design you ship now will have to meet them. https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf
9. Sharing attendee data with recruiters needs its own specific, separate, withdrawable consent (Act sections 5, 6). Do not bundle it into registration. https://www.meity.gov.in/static/uploads/2024/06/2bf1f0e9f04e6fb4f8fef35e82c42aa5.pdf
10. In-browser QR scanning works: getUserMedia is widely available, but BarcodeDetector is Chromium-only on Android per MDN/WICG. A PWA can do door check-in if you ship a JS decoder fallback and have a manual lookup fallback. Alternative with no scanner at all: the attendee shows a QR, volunteer scans it with a phone camera app.

## 1. LinkedIn

### 1.1 Exactly what Sign In with LinkedIn using OpenID Connect returns
Source: https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/sign-in-with-linkedin-v2 (page metadata says updated 2024-08-08)
- Scopes: `openid` (required for OIDC), `profile` ("lite profile including their id, name, and profile picture"), `email`.
- Claims supported in the discovery document: iss, aud, iat, exp, sub, name, given_name, family_name, picture, email, email_verified, locale. Discovery doc: https://www.linkedin.com/oauth/.well-known/openid-configuration
- Userinfo endpoint `GET https://api.linkedin.com/v2/userinfo` returns: sub, name, given_name, family_name, picture, locale, and optionally email and email_verified. The page says email may be absent and your app must handle that.
- The `sub` subject type is "pairwise" in the discovery doc, so the id is per-app and you cannot match people across apps by it.
- The page says OIDC sign-in "does not verify user identities and should not be marketed as such".
- Inconsistency to know about: the access page https://learn.microsoft.com/en-us/linkedin/shared/authentication/getting-access says the `profile` permission retrieves "name, headline, and photo". The OIDC page and its userinfo schema list no headline field. I could not confirm headline is returned. Treat headline as unverified until you test with a real token.

### 1.2 Fields that need partner or restricted programs
Source: https://learn.microsoft.com/en-us/linkedin/shared/authentication/getting-access (updated 2026-06-03 per metadata)
- "Open Permissions" available to all developers without special approval: Sign in with LinkedIn using OIDC (profile, email) and Share on LinkedIn (`w_member_social`). That is the whole self-serve list.
- Sales: Sales Navigator Application Platform (SNAP) partners only (`r_sales_nav_profiles` etc.).
- Talent: Recruiter System Connect, Apply Connect, Apply with LinkedIn, Premium Job Posting, by partner application.
- Marketing: Advertising API, requires approval.
- Compliance: closed, cannot be requested.
- Headline, about, experience, positions, connections: no self-serve scope is listed on that page. Not found as a self-serve permission.

### 1.3 Any self-serve way to get more than lite profile?
Closest thing I found: "Verified on LinkedIn" Profile Details API, `GET /rest/identityMe`. Source: https://learn.microsoft.com/en-us/linkedin/consumer/integrations/verified-on-linkedin/api-reference/identity-me
- Development tier: only works for LinkedIn accounts that are admins of your developer app. Testing only.
- Lite tier (production): `r_profile_basicinfo` gives name, email, photo, profile URL. Limits 5,000 calls/day per app, 500/day per member.
- Plus tier: adds `r_most_recent_education` and `r_primary_current_experience` (current job title, company, start date and most recent education). Plus rate limits "customized based on partnership agreement".
- Not included at any tier on that page: headline, about/summary, full experience list, connections.
- How to get Lite or Plus (application process, approval, whether Lite is self-serve): the upgrade guide page was not fetched. Not found.
- Another related product, Member Data Portability / Member Snapshot API, my fetch returned HTTP 404 and search did not surface its page. Whether it lets an app read a member's profile summary: not found. Do not assume it does.

### 1.4 Terms on storing and showing member data
Source: https://www.linkedin.com/legal/l/api-terms-of-use (fetched via summariser; re-read before relying)
- Section 4.1: Content may not be stored except in the specified circumstances; where stored it must be identifiable, segregable and deletable; store only as long as necessary to provide the service.
- Section 4.3: Profile Data may be stored only where required by law, with member consent; refresh only while the member is using your app, not on an automated schedule.
- Section 4.4: delete immediately when a member asks or closes their account.
- Section 3.1(8) and 3.1(9): do not share Content with third parties except making it available to Users within your Application, and use Content only to let your Users use it in your Application.
- Section 3.1(3): may not let third parties, including other members, see information obtained from another member's network (connections).
- Section 3.1(17): do not use Content as an input to decisions about employment or similar unless LinkedIn permits in writing under separate terms.
- Section 1.4: self-serve use may not be for advertising.
- Recruiting is not named directly, but 3.1(17) and 3.1(8) cover it.
- What this means: showing a checked-in member's name and photo to other attendees inside your app looks like "Users within the Application", but whether showing it to other attendees (as opposed to the member themselves) is allowed for the lite profile should be confirmed with LinkedIn. I found no explicit sentence about it. Unverified.
- Platform terms: https://www.linkedin.com/legal/l/platform-terms returned HTTP 404 to my fetch. Not found.

## 2. GitHub and dev.to

### 2.1 GitHub after OAuth
- Minimal scope: none. A token with no scope "grants read-only access to public information" (public profile, public repo info, gists). https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/scopes-for-oauth-apps
- `read:user` grants reading the user's profile data (including private-profile fields). `user:email` is separate and gives email addresses. Same page. If you only want to log them in and read public profile, request no scope; ask `user:email` only if you need email.
- Public profile fields from `GET /users/{username}` and `GET /user` (public response needs no scope): login, id, name, company, blog, location, email (only if public), bio, hireable, twitter_username, avatar_url, html_url, public_repos, public_gists, followers, following, created_at, updated_at. https://docs.github.com/en/rest/users/users?apiVersion=2022-11-28
- Repos: `GET /users/{username}/repos` lists public repos with language (primary), topics, description, stargazers_count. https://docs.github.com/en/rest/repos/repos#list-repositories-for-a-user . That page does not name a scope for public repos.
- Languages per repo: `GET /repos/{owner}/{repo}/languages`, bytes per language. Same page.
- Rate limits (REST): unauthenticated 60/hour per IP; authenticated user 5,000/hour (shared across tokens and apps acting for that user); OAuth app 5,000/hour for public data with client id/secret; GitHub App installation 5,000/hour minimum up to 12,500; Enterprise Cloud orgs 15,000. https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api
- Terms: Section H of the Terms of Service says do not use the API to download data for spamming, "including for the purposes of selling GitHub users' personal information, such as to recruiters"; do not share tokens to exceed rate limits. Section D.8 says the Terms do not restrict lawful access to the contents of public repositories. https://docs.github.com/en/site-policy/github-terms/github-terms-of-service
- GitHub Privacy Statement and Acceptable Use Policies are referenced by section H and I did not read them. Not verified.

### 2.2 dev.to (Forem)
- Auth: "All endpoints can be accessed with the 'api-key' header and a accept header, but some of them are accessible publicly without authentication." https://developers.forem.com/api/v1 . Which specific user endpoints are public: not confirmed from what I read.
- Public user fields seen in objects embedded in responses: name, username, twitter_username, github_username, website_url, profile_image, profile_image_90. Organization user listings also show summary, location, joined_at. Same page. The full `GET /api/users/{id}` response schema: not found in the part of the page I read.
- Article fields: type_of, id, title, description, cover_image, readable_publish_date, social_image, tag_list, tags, slug, path, url, canonical_url, positive_reactions_count, public_reactions_count, created_at, edited_at, crossposted_at, published_at, last_comment_at, published_timestamp, reading_time_minutes, user, flare_tag, organization. Same page.
- Rate limits: not found in the API v1 page. Do not assume a number.
- Terms (https://dev.to/terms, as summarised): Section 2 Use License restricts modifying, copying or mirroring the materials and use "for any commercial purpose"; Section 11 Content Policy bars content designed mainly for promotion. No API-specific or scraping-specific clause found. Using dev.to articles to profile people for recruiters is not addressed; ask them.

## 3. Competitors (from their own sites)

| Product | Attendee matching / list | Check-in | Pricing published? | Recruiter / sponsor access |
|---|---|---|---|---|
| Luma | Not described on the home page or pricing page. Not found. https://luma.com/ | Check-in listed on the free plan; Plus adds a "check-in manager" role. https://luma.com/pricing | Yes. Free plan with 5% platform fee on paid events plus Stripe fees; Plus $59/month billed annually, 0% platform fee. CSV export of guests on free plan. Same page. | Sponsor features not mentioned. Not found. |
| Brella | "Intent-based, customizable matchmaking that highlights attendee interests and goals". https://www.brella.io/ | Not mentioned on the page. | No, "Contact sales". | Yes: "Built in lead and contact scanning", sponsor matchmaking, AI prospecting. Ownership: not stated on page. |
| Swapcard | "Personalized recommendations" via Sherlock; networking tools not detailed. https://www.swapcard.com/ | Onsite staff check-in and badging services; no self-service tool described. | No. | Exhibitor lead capture and analytics; agents rank booth leads by intent. |
| Whova | Networking features claimed ("build two times more connections") but no matching feature described. https://whova.com/ | "kiosk self check-in" and badge generation; QR check-in not confirmed. | No, request a quote. | Yes: sponsor/exhibitor lead tools, business card and QR scanning, "lead retrieval". |
| Grip | "AI-powered matchmaking engine" generating mutual matches. https://www.grip.events/ | "Entrance Scanning" product, badge printing, access control. | No. Demo and custom proposal. | Yes: Lead Retrieval for exhibitors, badge scanning in the app. |
| LinkedIn events | Event attendee list: not found. My attempt to fetch LinkedIn help pages for events returned unrelated pages. | LinkedIn has a personal QR code: each member has one, you scan it in the app and land on their profile where you can invite or connect. https://www.linkedin.com/help/linkedin/answer/a525286/using-a-linkedin-qr-code-to-connect-with-members | n/a | not found |

LinkedIn "Find Nearby": the official help page for it was not found. Third-party LinkedIn posts say it used Bluetooth and one March 2022 post says it seemed removed. That is secondary and anecdotal, so treat as unverified that it is gone, and unverified that it works.

Huddle: several unrelated products share the name. From the App Store listings (titles and the search snippets only; I did not open each store page):
- Huddle Social, a campus events app, developer listed as Yashvardhan Khaitan, college email required. https://apps.apple.com/us/app/huddle-social/id6449878483
- Huddle: Social Discovery, activity-first app for meeting people at offline plans, developer Basenode Solutions. https://apps.apple.com/pl/app/huddle-social-discovery/id6797194913
- Huddl (Rootspace), curated gatherings where hosts approve requests. https://apps.apple.com/ca/app/huddl/id6799994523
- Huddle Connect with Experts, Huddle Find Your Game (sports), Huddle Sports Club Manager, Huddle community and e-learning, Huddle: Easier together (accountability), plus a conference call app at https://www.huddle.team/apps. Not opened.
- huddletogether.app describes a friends-and-family in-person social app; maker not stated. https://huddletogether.app/
- I could not identify any "Huddle" that is event check-in plus attendee matching. If you meant a specific one, tell me where you saw it.

## 4. MLH check-in

- MLH's organizer guide describes check-in as a manual desk process: volunteers check names against the registration list, "a simple ctrl+f for the name in a google spreadsheet with a column to mark with an X is an easy way to set up check-in"; optional ID check; badges and swag; late registrants use a separate form. https://guide.mlh.com/general-information/managing-registrations/check-in-process
- That page does not mention check-in codes, QR codes or OrganizerHQ. "Check-in code": not found in the guide text I read (about 290k characters; I read all but the last part). QR codes appear only as an example of one team using QR scans at check-in and meals, and for engagement challenges. https://guide.mlh.com/llms-full.txt
- Policy: "Your event must have a process for checking in hackers on the day of the event." After check-in, organizers send MLH the registration data plus a column marking whether each person attended. https://github.com/MLH/mlh-policies/blob/main/member-event-guidelines.md
- Resume book: not found in MLH's guide, policies or privacy policy. https://www.mlh.com/privacy says it does not sell or share personal information by default, with exceptions for event organizers, service providers and Partner Companies, and it does not mention resumes or recruiters.
- Sponsor access to attendee data: the organizer guide suggests, as a sponsor perk, that "if you're providing resumes in advance, your recruiters may be interested in interviewing your hackers" (Potential Sponsor Perks, Recruiting) and that registration data should not be shared "until you get specific permission from your hackers" (Registrations). https://guide.mlh.com/llms-full.txt
- MLH policy: "We do not collect, utilize, or share any personal information without an attendee's opt-in." Required checkboxes: Code of Conduct and Event Logistics ("share my application/registration information with Major League Hacking for event administration"); optional checkbox for marketing emails. https://github.com/MLH/mlh-policies/blob/main/member-event-guidelines.md
- Optional participant field in the guide mentions a LinkedIn field "to be able to connect with partners post-event for potential job opportunities". https://guide.mlh.com/llms-full.txt
- The guide says attendees must be at least 13 "due to child privacy laws". Same file.
- So the pattern MLH itself follows is: check-in is a list, sponsor access to data needs specific permission from the participant. It does not publish a standard resume book process.

## 5. India privacy law (summary of the primary text, not legal advice)

Texts I read: the DPDP Act, 2023 (Act 22 of 2023, Gazette of India, Aug 11 2023) https://www.meity.gov.in/static/uploads/2024/06/2bf1f0e9f04e6fb4f8fef35e82c42aa5.pdf and the DPDP Rules, 2025 (Gazette notification G.S.R. 846(E) dated 13 November 2025) https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf . PIB's explainer says the Rules were notified on 14 November 2025 (the gazette text I read is dated 13 November; I do not know why the two differ). https://www.pib.gov.in/PressReleasePage.aspx?PRID=2190014

### 5.1 Status and dates
- Rule 1(2): Rules 1, 2 and 17 to 21 in force on publication in the Gazette.
- Rule 1(3): Rule 4 (consent managers) one year after publication, so around November 2026.
- Rule 1(4): Rules 3, 5 to 16, 22 and 23 eighteen months after publication, so around May 2027 (my arithmetic from the notification date, not a date the document states).
- Act section 1(2): the Act comes into force on the date the Central Government notifies. Which Act sections are in force today and from when: not found (I did not locate the commencement notification). The Rules' own commencement dates above are what I could confirm.
- A MeitY listing of 2026 documents appeared in search results but returned HTTP 403, so whether anything was amended after the Rules: not found. Check MeitY before relying on these dates.

### 5.2 What it asks of Low-Key (name, photo, profession, shared with other attendees and recruiters)
- Applies to digital personal data processed in India, and to data outside India if connected to offering goods or services to people in India (section 3(a), 3(b)). You are a Data Fiduciary (section 2) for what you collect.
- Lawful basis: consent or "certain legitimate uses" (section 4). Section 7(a) covers processing for the specified purpose for which the person voluntarily provided the data and has not said they do not consent. My reading: this plausibly covers showing "here now" cards to other checked-in attendees if the notice says so. It is a stretch for recruiters. That is a lawyer's question.
- Notice (section 5(1)): the notice must come with or before the consent request and tell the person what data, for what purpose, how to exercise rights (section 6(4) and 13), and how to complain to the Data Protection Board. Section 5(3): offer it in English or any Eighth Schedule language.
- Rule 3: notice must be understandable on its own, in plain language, with "an itemised description" of the data and "the specified purpose or purposes", the link to your site or app, and how the person can withdraw consent "with the ease of doing so being comparable to that with which such consent was given". (Rule 3 reaches in force about May 2027.)
- Consent (section 6(1)): "free, specific, informed, unconditional and unambiguous with a clear affirmative action", limited to personal data "necessary for such specified purpose". The Act's own illustration says asking for extra data not needed for the service, such as a phone contact list, limits consent to the necessary part. For you: showing profile to attendees and sharing with recruiters are different purposes, so separate unticked consents.
- Section 6(10): you must be able to prove notice and consent were given.
- Withdrawal (section 6(4), 6(5), 6(6)): can withdraw any time, as easily as given; processing before withdrawal stays lawful; after withdrawal you must stop, and make your processors stop, unless law requires otherwise.
- Purpose limitation: consent covers "the specified purpose" (section 2(za), 6(1)). Using attendee data for recruiter DMs when the notice only said "networking at this event" would fall outside it. My reading, not a quote.
- Retention (section 8(7)): erase when consent is withdrawn or "as soon as it is reasonable to assume that the specified purpose is no longer being served", unless law requires retention; make processors erase too. Section 8(8): purpose deemed served if the person does not approach you or exercise rights for a prescribed period. Rule 8 and the Third Schedule set those periods only for e-commerce (2 crore plus users), online gaming (50 lakh plus) and social media intermediaries (2 crore plus), so a small event app is not in those classes (I read the start of the schedule; confirm). Rule 8(3) separately requires keeping personal data and processing logs for at least one year for the Seventh Schedule purposes. No event-specific retention period found.
- Accuracy (section 8(3)): where data is disclosed to another Data Fiduciary (such as a recruiting company) you must ensure completeness, accuracy and consistency.
- Security and breach (section 8(5), 8(6); Rule 7): reasonable security safeguards; tell the Board and each affected person; Rule 7(2) requires detailed information to the Board within 72 hours. Penalty up to 250 crore for failing safeguards, up to 200 crore for breach-notice failure or children's obligations, up to 50 crore for other breaches (PIB explainer). https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/nov/doc20251117695301.pdf
- Grievance and contact (section 8(9), 8(10); Rule 9, Rule 14(3)): publish contact details of a DPO or answering person; run a grievance process responding within a reasonable period not exceeding ninety days.
- Rights (sections 11 to 14): access, correction, erasure, grievance, nomination. Rule 14 requires publishing how to make requests.
- Children (section 2(f), 9; Rule 10): a child is under 18. Before processing a child's data you need verifiable consent of the parent or guardian (section 9(1)); no tracking or behavioural monitoring of children and no targeted advertising to children (section 9(3)); no processing likely to harm a child's well-being (section 9(2)). Rule 10 describes how you check the parent is an adult. Exemptions are by class and purpose (section 9(4)); I did not map them to events.
- Data already public: section 3(c)(ii) says the Act does not apply to personal data made public by the person themselves. Whether pulling a public GitHub bio counts is not clear to me. Do not rely on it, and GitHub's terms are a separate limit.
- Not legal advice. This is my reading of the statute and Rules text. Get an Indian privacy lawyer before launching the recruiter feature.

## 6. Technical feasibility

- getUserMedia: only works in a secure context (HTTPS, localhost); the browser must ask permission at least the first time; denied access gives `NotAllowedError`. MDN lists it as Baseline "Widely available" since September 2017. `facingMode: "environment"` prefers the rear camera. https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia (per-browser table not in the text I read, and nothing on iOS specifics: not found)
- BarcodeDetector: MDN labels it "Limited availability" and "Experimental", not Baseline. Secure context only. Formats include `qr_code`; the supported list is platform dependent, check `BarcodeDetector.getSupportedFormats()`. https://developer.mozilla.org/en-US/docs/Web/API/Barcode_Detection_API
- Spec status: Draft Community Group Report from WICG, not a W3C standard. The fetched page shows Chrome for Android from version 83 and other engines unsupported or unconfirmed. https://wicg.github.io/shape-detection-api/ I could not read the per-browser table, so exact Safari and Firefox status is not verified here.
- PWA: MDN describes a PWA as web tech that can be installed, work offline and integrate with the device. The page does not mention camera access. https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps . Camera access inside an installed PWA on iOS: not found in official docs I fetched.
- Conclusion supported by the docs: a mobile web page can open the camera over HTTPS and, where BarcodeDetector exists, decode QR. Where it does not exist you would add a JavaScript QR decoder library (not checked; a package choice, not an official doc claim). A native app is not required by anything I read, but I did not find proof of PWA camera behaviour on iOS.

## (c) Not verified / not found

- LinkedIn: whether `profile` really returns headline (docs disagree). Whether Lite tier of Verified on LinkedIn is self-serve. Member Data Portability / Member Snapshot API (404). LinkedIn platform terms page (404). Whether showing lite-profile data to other attendees is allowed (no explicit sentence found). Quotes from API terms came via a summariser.
- LinkedIn Find Nearby status: only secondary posts; unverified. LinkedIn event attendee list features: not found.
- dev.to: rate limits; public vs key-required per endpoint; full user response schema; any rule against profiling users for recruiters.
- GitHub: Privacy Statement and Acceptable Use limits not read.
- Competitors: Swapcard home page returned an error at first and was read on the www host; Luma matching and sponsor features not stated; Huddle identity not resolved; Brella ownership not stated on its page.
- MLH: no resume book process found; no check-in code or QR instruction found in the guide; OrganizerHQ check-in not documented in what I read; last part of the guide text not read.
- DPDP: Act commencement notification; whether anything changed after November 2025 (MeitY 2026 pages gave 403); exact English phrasing of Fourth Schedule exemptions for children; the official Gazette number of the Rules beyond G.S.R. 846(E); reasons for 13 vs 14 November.
- Tech: per-browser support tables (MDN pages came through without them); iOS PWA camera behaviour; JavaScript QR decoder library choice.

## (d) What this means for v1

1. Login with GitHub for the developer events (no scope, or `read:user`; `user:email` only if you need email). Use LinkedIn only for name, photo and email. Do not promise headline or experience.
2. Make the 3 intent answers the product. The matcher reads those answers (plus public GitHub languages/bio for dev events), not LinkedIn profile text.
3. Check-in: do the simplest thing that matches MLH's own practice, a list with a mark. Attendee shows a QR from the page, volunteer scans with any phone camera or the web scanner; add a "search by name" fallback.
4. Build the scanner as a web page first (HTTPS, getUserMedia, BarcodeDetector where available, a fallback decoder). Do not start a native app before you have seen the iOS camera behaviour on a real phone.
5. Only checked-in people appear as "here now", and only to other checked-in people. Show what they chose to answer, nothing scraped.
6. Ask for age. For v1 allow 18 and over only (DPDP section 9, Rule 10 make parental consent for under 18 heavy). Say so on the event page.
7. Put a plain notice with the itemised data and purposes on the registration step, and a one-click "delete my data / leave this event" that stops processing and erases (sections 5, 6(4), 8(7); Rule 3 and 14 once in force). Publish a contact for questions.
8. Do not build the recruiter or sponsor view in v1. If you show it on the roadmap, state that it is opt-in per attendee, separate from registration, and that LinkedIn and GitHub profile data will not feed it, per LinkedIn API terms 3.1 and GitHub terms section H. Only data attendees enter directly in Low-Key can go there.
9. Pricing story for the application: organizers pay per event (Luma shows a free tier plus $59/month, so differentiate on "who is in the room right now", not on check-in alone). Sponsor and recruiter revenue is later and depends on consent design.
10. Before launching the sponsor/recruiter feature, spend money on an Indian privacy lawyer and ask LinkedIn and GitHub directly whether your use is allowed. Re-check DPDP commencement dates on MeitY first, since I could not confirm anything after November 2025.
