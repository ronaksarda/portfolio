import sys
from docx import Document
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_TAB_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

OUT = sys.argv[1]
FONT, BODY = 'Calibri', 10

d = Document()
s = d.sections[0]
s.page_width, s.page_height = Inches(8.5), Inches(11)
s.left_margin = s.right_margin = Inches(0.5)
s.top_margin = s.bottom_margin = Inches(0.4)
RIGHT = s.page_width - s.left_margin - s.right_margin

for name in ('Normal', 'List Bullet'):
    st = d.styles[name]
    st.font.name, st.font.size = FONT, Pt(BODY)
    st.element.rPr.rFonts.set(qn('w:eastAsia'), FONT)
    pf = st.paragraph_format
    pf.space_before, pf.space_after, pf.line_spacing = Pt(0), Pt(0), 1.0
d.styles['List Bullet'].paragraph_format.left_indent = Inches(0.2)
d.styles['List Bullet'].paragraph_format.first_line_indent = Inches(-0.15)


def para(text='', bold=False, size=None, align=None, after=0):
    p = d.add_paragraph()
    if text:
        r = p.add_run(text)
        r.bold = bold
        if size:
            r.font.size = Pt(size)
    if align is not None:
        p.alignment = align
    p.paragraph_format.space_after = Pt(after)
    return p


def heading(text):
    p = para(text, bold=True, size=11.5)
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(1)
    # bottom border rule (paragraph border, not a shape, so ATS ignores it)
    pPr = p._p.get_or_add_pPr()
    bdr = OxmlElement('w:pBdr')
    b = OxmlElement('w:bottom')
    for k, v in (('val', 'single'), ('sz', '6'), ('space', '1'), ('color', '000000')):
        b.set(qn('w:' + k), v)
    bdr.append(b)
    pPr.append(bdr)


def line(left, right='', bold_left=True):
    p = para()
    p.paragraph_format.tab_stops.add_tab_stop(RIGHT, WD_TAB_ALIGNMENT.RIGHT)
    p.add_run(left).bold = bold_left
    if right:
        p.add_run('\t' + right)
    return p


def sub(text):
    p = para()
    p.add_run(text).italic = True


def bullets(items):
    for t in items:
        bp = d.add_paragraph('• ' + t)
        bp.paragraph_format.left_indent = Inches(0.18)
        bp.paragraph_format.first_line_indent = Inches(-0.12)


def labeled(label, text):
    p = para()
    p.add_run(label + ': ').bold = True
    p.add_run(text)


# Contact (in body, not header, so ATS reads it)
para('RONAK SARDA', bold=True, size=18, align=1)
para('Hyderabad, Telangana, India | +91 93904 17137 | rockysarda18@gmail.com', align=1)
para('linkedin.com/in/ronak-sarda05 | github.com/ronaksarda | ronaksarda.github.io | leetcode.com/u/ronnie0524', align=1)

heading('SUMMARY')
para('Information Technology undergraduate and Founding Head of Engineering at FschoolAI building LLM applications, AI agents and '
     'full-stack web products in Python, TypeScript and C++. Shipped streaming LLM features to production, built RAG and '
     'semantic search pipelines, and ranked in the top 2% of 13,000+ in an open-source coding program.')

heading('EXPERIENCE')
line('FschoolAI (fschoolai.com)', 'Sep 2026 - Present')
sub('Founding Head of Engineering (intern) | San Francisco, CA (Remote) | TypeScript, React, Supabase, LLM APIs')
bullets([
    'Lead MVP delivery for an AI study platform, setting priorities for a team of 8 shipping an AI tutor, live AI whiteboard rooms and an LLM Course Maker in TypeScript and React.',
    'Cut AI tutor time-to-first-token from 14.9 s to 1.5 s by picking models from measurement (Haiku 0.7 s vs Gemini Flash-Lite 5.6 s), turning off thinking on streamed turns, and routing turns with a rule-based planner instead of a model call.',
    'Fixed RAG grounding: course material reached only 0.1% of room turns because embeddings were built from prompt boilerplate and the search skipped the course corpus.',
    'Built per-student LLM cost ledgers ($4/month cap, $0.27 mean) that drop heavy users to a cheaper model tier instead of cutting them off, with TTFT and cost-per-user monitoring.',
    'Built cross-provider LLM failover with stream rescue, so one provider outage no longer breaks a session.',
    'Shipped a Course Maker that turns a Canvas syllabus into a full course, an onboarding interview saved to student memory, and a safety filter that keeps self-harm language out of memory without a model call.',
])

heading('PROJECTS')
line('Mr. Couch - Desktop AI Agent | TypeScript, Electron, Gemma 4, Mastra', 'github.com/ronaksarda/couch')
bullets([
    'Built a voice and text AI agent for Windows that opens files, plays media, reads the screen and controls smart-home devices.',
    'Designed a tiered safety policy in code: read-only actions run, changes need user confirmation, destructive actions do not exist.',
])
line('GitSpace | JavaScript, Node.js, Express, PostgreSQL, C++17, HTML5 Canvas', 'gitspace.me')
bullets([
    'Built and deployed a full-stack web app that renders any GitHub account as an interactive 2D world; live on Render, 30+ users.',
    'Wrote a C++17 spatial layout engine with a JavaScript fallback at 60 FPS; raised tested capacity from 2,500 to 80,000+ repos.',
])
line('Candidate Ranker - Hack2Skill Hackathon | Python, Sentence-Transformers, MiniLM', 'github.com/ronaksarda/candidate-ranker')
bullets([
    'Built a solo, offline ML pipeline that ranks 100,000 applicants against a job description in under 5 minutes on one CPU.',
    'Designed a 3-stage funnel: keyword filter to top 3,000, MiniLM semantic embeddings, then weighted scoring.',
])
line('LabelSure AI - Smart India Hackathon | Python, FastAPI, Vision LLM, Tesseract OCR', 'github.com/ronaksarda/SIH-Project')
bullets([
    'Built a compliance checker that audits product labels and e-commerce listings against 14+ Legal Metrology rules.',
    'Cut LLM hallucination by running a vision LLM and OCR in parallel, cross-checking key fields before a rules engine.',
])

heading('EDUCATION')
line('Chaitanya Bharathi Institute of Technology (CBIT)', 'Aug 2025 - May 2029 (expected)')
sub('B.E. Information Technology | Hyderabad, India | CGPA: 8.68 / 10 (first year)')
line('Stanford University (Stanford Online)', '2026 - Present')
sub('Probability for AI (in progress)')

heading('TECHNICAL SKILLS')
labeled('Languages', 'Python, TypeScript, JavaScript, C++, C, SQL, HTML, CSS')
labeled('AI and ML', 'LLM APIs, AI Agents, RAG, MCP, Hugging Face, Sentence-Transformers, Embeddings, OpenCV, NumPy, Pandas')
labeled('Web and Databases', 'React, Node.js, Express.js, FastAPI, Electron, PostgreSQL, Supabase, Firebase, REST APIs')
labeled('Cloud and Tools', 'Microsoft Azure, Google Cloud, Git, GitHub, Linux, Render, VS Code')

heading('CERTIFICATIONS')
bullets([
    'Microsoft Certified: Azure Fundamentals | GitHub Foundations | Microsoft Applied Skills: Agents in Microsoft Foundry',
    'Google Cloud Skill Badges (34 earned, Google Cloud Facilitator 2026) | Hugging Face: Fundamentals of Agents | CS50x (Harvard)',
])

heading('LEADERSHIP AND ACHIEVEMENTS')
bullets([
    "ECSoC '26: ranked 138 of 13,000+ | HackerRank Orchestrate: ranked 329 of 1,773 | CBIT COSC HackWeek: Top 7 of 800+",
    'Hacktoberfest 2026, NIAT Hyderabad: Top 15 (solo) | ViCoDathon 2026: Top 10 | Google Cloud Facilitator 2026',
    'Organizer, HackIndia Spark11 (1,600+ builders, 529 teams); Coordinator, SIH internal round (150+ teams, 1,000+ students).',
    'LeetCode: 334+ problems solved | HackerRank Gold Badges in C and C++ | Reached Round 2 interview at Citadel Securities.',
])

d.core_properties.title = 'Ronak Sarda Resume'
d.core_properties.author = 'Ronak Sarda'
d.save(OUT)
