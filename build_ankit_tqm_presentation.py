import os
import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.dml.color import RGBColor

def create_presentation(output_path):
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Color Palette Definitions
    COLOR_BG_LIGHT = RGBColor(248, 250, 252)       # #F8FAFC
    COLOR_WHITE = RGBColor(255, 255, 255)          # #FFFFFF
    COLOR_PRIMARY = RGBColor(115, 15, 25)          # #730F19 (Deep Burgundy)
    COLOR_PRIMARY_DARK = RGBColor(74, 0, 4)        # #4A0004
    COLOR_ACCENT_GOLD = RGBColor(217, 119, 6)      # #D97706 (Amber Gold)
    COLOR_ACCENT_BG = RGBColor(254, 243, 199)      # #FEF3C7
    COLOR_TEXT_DARK = RGBColor(15, 23, 42)         # #0F172A (Charcoal)
    COLOR_TEXT_MUTED = RGBColor(71, 85, 105)       # #475569 (Slate Gray)
    COLOR_BORDER = RGBColor(226, 232, 240)         # #E2E8F0
    COLOR_SUCCESS = RGBColor(5, 150, 105)          # #059669
    COLOR_ALERT = RGBColor(220, 38, 38)            # #DC2626
    COLOR_CARD_HEADER = RGBColor(241, 245, 249)    # #F1F5F9

    FONT_FAMILY = "Calibri"

    def set_slide_background(slide, color):
        background = slide.background
        fill = background.fill
        fill.solid()
        fill.fore_color.rgb = color

    def add_header(slide, badge_text, title_text, subtitle_text):
        # Header Container
        header_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.733), Inches(1.3))
        tf = header_box.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        # Badge paragraph
        p_badge = tf.paragraphs[0]
        p_badge.text = badge_text.upper()
        p_badge.font.name = FONT_FAMILY
        p_badge.font.size = Pt(12)
        p_badge.font.bold = True
        p_badge.font.color.rgb = COLOR_ACCENT_GOLD
        p_badge.space_after = Pt(2)

        # Title paragraph
        p_title = tf.add_paragraph()
        p_title.text = title_text
        p_title.font.name = FONT_FAMILY
        p_title.font.size = Pt(26)
        p_title.font.bold = True
        p_title.font.color.rgb = COLOR_PRIMARY
        p_title.space_after = Pt(2)

        # Subtitle paragraph
        p_sub = tf.add_paragraph()
        p_sub.text = subtitle_text
        p_sub.font.name = FONT_FAMILY
        p_sub.font.size = Pt(14)
        p_sub.font.color.rgb = COLOR_TEXT_MUTED

    def add_card(slide, left, top, width, height, border_color=COLOR_BORDER, fill_color=COLOR_WHITE):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = fill_color
        card.line.color.rgb = border_color
        card.line.width = Pt(1.5)
        return card

    # =========================================================================
    # SLIDE 1: TITLE SLIDE (COVER)
    # =========================================================================
    slide1 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide1, COLOR_BG_LIGHT)

    # Top Decorative Banner Accent
    top_bar = slide1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(0.3))
    top_bar.fill.solid()
    top_bar.fill.fore_color.rgb = COLOR_PRIMARY
    top_bar.line.fill.background()

    # Main Center Card
    main_card = add_card(slide1, Inches(1.0), Inches(0.8), Inches(11.333), Inches(5.9), COLOR_BORDER, COLOR_WHITE)

    # Content Box
    title_box = slide1.shapes.add_textbox(Inches(1.5), Inches(1.2), Inches(10.333), Inches(3.2))
    tf1 = title_box.text_frame
    tf1.word_wrap = True
    tf1.margin_left = tf1.margin_top = tf1.margin_right = tf1.margin_bottom = 0

    p_course = tf1.paragraphs[0]
    p_course.text = "BBAT104 — FUNDAMENTALS OF TOTAL QUALITY MANAGEMENT"
    p_course.font.name = FONT_FAMILY
    p_course.font.size = Pt(13)
    p_course.font.bold = True
    p_course.font.color.rgb = COLOR_ACCENT_GOLD
    p_course.space_after = Pt(10)

    p_maintitle = tf1.add_paragraph()
    p_maintitle.text = "RESTAURANT BILLING & SURVEILLANCE SYSTEM"
    p_maintitle.font.name = FONT_FAMILY
    p_maintitle.font.size = Pt(32)
    p_maintitle.font.bold = True
    p_maintitle.font.color.rgb = COLOR_PRIMARY
    p_maintitle.space_after = Pt(8)

    p_goal = tf1.add_paragraph()
    p_goal.text = "TQM QUALITY GOAL Q01: IMPROVE RELIABILITY"
    p_goal.font.name = FONT_FAMILY
    p_goal.font.size = Pt(18)
    p_goal.font.bold = True
    p_goal.font.color.rgb = COLOR_TEXT_DARK
    p_goal.space_after = Pt(14)

    p_pillars = tf1.add_paragraph()
    p_pillars.text = "Process Control   •   Poka-Yoke Error Prevention   •   Traceability & Audit Surveillance   •   Zero Revenue Leaks"
    p_pillars.font.name = FONT_FAMILY
    p_pillars.font.size = Pt(14)
    p_pillars.font.color.rgb = COLOR_SUCCESS

    # Student & Project Details Card
    student_box = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.5), Inches(4.5), Inches(10.333), Inches(1.8))
    student_box.fill.solid()
    student_box.fill.fore_color.rgb = COLOR_CARD_HEADER
    student_box.line.color.rgb = COLOR_BORDER
    student_box.line.width = Pt(1)

    stf = student_box.text_frame
    stf.word_wrap = True
    stf.margin_left = Inches(0.4)
    stf.margin_top = Inches(0.25)
    stf.margin_right = Inches(0.4)
    stf.margin_bottom = Inches(0.2)

    sp1 = stf.paragraphs[0]
    sp1.text = "STUDENT & COURSE REGISTRATION DETAILS"
    sp1.font.name = FONT_FAMILY
    sp1.font.size = Pt(13)
    sp1.font.bold = True
    sp1.font.color.rgb = COLOR_PRIMARY
    sp1.space_after = Pt(6)

    sp2 = stf.add_paragraph()
    sp2.text = "Student Name: Ankit Majumdar      |      Roll Number: 2410301003      |      Section: A"
    sp2.font.name = FONT_FAMILY
    sp2.font.size = Pt(14)
    sp2.font.bold = True
    sp2.font.color.rgb = COLOR_TEXT_DARK
    sp2.space_after = Pt(4)

    sp3 = stf.add_paragraph()
    sp3.text = "Course: BBAT104 • Amrapali University, Haldwani      |      Session: 2026–2027      |      Reviews 1 & 2"
    sp3.font.name = FONT_FAMILY
    sp3.font.size = Pt(13)
    sp3.font.color.rgb = COLOR_TEXT_MUTED

    # =========================================================================
    # SLIDE 2: PROJECT OVERVIEW & QUALITY GOAL
    # =========================================================================
    slide2 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide2, COLOR_BG_LIGHT)
    add_header(slide2, "02 | Project Overview", "Operational Problem & TQM Quality Goal Q01",
               "A dependable restaurant billing & surveillance system engineered to eliminate manual calculation errors and untracked voids.")

    # 4 Cards Layout (2x2 grid)
    cards_data = [
        {
            "title": "THE OPERATIONAL CHALLENGE",
            "subtitle": "Risks of Manual Billing & Untracked Transactions",
            "color": COLOR_ALERT,
            "bullets": [
                "Manual paper billing results in frequent mathematical calculation mistakes and tax mismatches.",
                "Discounts, cancellations, and voided orders lack transparency, enabling unaccounted revenue leakage.",
                "Lack of role isolation exposes sensitive financial summaries and configuration settings to cashiers."
            ]
        },
        {
            "title": "TQM QUALITY GOAL: Q01 IMPROVE RELIABILITY",
            "subtitle": "Core Quality Philosophy: Prevent Errors Proactively",
            "color": COLOR_SUCCESS,
            "bullets": [
                "Primary Objective: Ensure 100% dependable billing accuracy, non-repudiation, and audit traceability.",
                "Error Prevention Early: Input validations and poka-yoke gates stop invalid data at entry, not post-billing.",
                "Continuous Assurance: Built-in verification controls monitor staff actions, void logs, and system integrity."
            ]
        },
        {
            "title": "CORE ENGINEERING APPROACH",
            "subtitle": "Robust Technical & Operational Safeguards",
            "color": COLOR_PRIMARY,
            "bullets": [
                "Poka-Yoke Validation: Prevents item overselling, invalid price entry, and unverified discount applications.",
                "Granular Role-Based Access Control (RBAC): Distinct portals for Owner, Admin, Cashier, and Kitchen Staff.",
                "Tamper-Evident Audit Trails: Records user IDs, timestamps, and action details for every critical event.",
                "Backup & Disaster Recovery: Automated and on-demand database snapshots ensure zero business downtime."
            ]
        },
        {
            "title": "GOLDEN DESIGN PRINCIPLE",
            "subtitle": "Strict 3-Tier Architecture & Separation of Concerns",
            "color": COLOR_ACCENT_GOLD,
            "bullets": [
                "The presentation screen must never talk directly to the database or execute direct SQL queries.",
                "Architecture Flow: Client UI (React SPA)  →  Service Layer (Express.js)  →  Persistence (MySQL).",
                "Centralized Business Logic: Financial rounding, GST computation, and security rules execute exclusively on the server.",
                "Modularity Benefit: Dramatically accelerates debugging, simplifies unit testing, and hardens security."
            ]
        }
    ]

    col_w = Inches(5.7)
    row_h = Inches(2.55)
    xs = [Inches(0.8), Inches(6.8)]
    ys = [Inches(1.85), Inches(4.55)]

    for idx, c in enumerate(cards_data):
        cx = xs[idx % 2]
        cy = ys[idx // 2]
        add_card(slide2, cx, cy, col_w, row_h)

        tb = slide2.shapes.add_textbox(cx + Inches(0.25), cy + Inches(0.2), col_w - Inches(0.5), row_h - Inches(0.4))
        ctf = tb.text_frame
        ctf.word_wrap = True
        ctf.margin_left = ctf.margin_top = ctf.margin_right = ctf.margin_bottom = 0

        p1 = ctf.paragraphs[0]
        p1.text = c["title"]
        p1.font.name = FONT_FAMILY
        p1.font.size = Pt(15)
        p1.font.bold = True
        p1.font.color.rgb = c["color"]
        p1.space_after = Pt(2)

        p2 = ctf.add_paragraph()
        p2.text = c["subtitle"]
        p2.font.name = FONT_FAMILY
        p2.font.size = Pt(13)
        p2.font.bold = True
        p2.font.color.rgb = COLOR_TEXT_MUTED
        p2.space_after = Pt(6)

        for b in c["bullets"]:
            bp = ctf.add_paragraph()
            bp.text = f"•  {b}"
            bp.font.name = FONT_FAMILY
            bp.font.size = Pt(13)
            bp.font.color.rgb = COLOR_TEXT_DARK
            bp.space_after = Pt(3)

    # =========================================================================
    # SLIDE 3: END-TO-END RESTAURANT PROCESS FLOW
    # =========================================================================
    slide3 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide3, COLOR_BG_LIGHT)
    add_header(slide3, "03 | Process Flow", "End-to-End Restaurant Billing & Order Pipeline",
               "Quality checks and poka-yoke controls are embedded directly into each step of the daily workflow.")

    steps = [
        {"num": "01", "name": "Order Intake", "desc": "Cashier inputs table #, guest name, and chooses active dishes from catalog."},
        {"num": "02", "name": "Poka-Yoke Check", "desc": "Server validates dish availability, blocks unavailable items, verifies rates."},
        {"num": "03", "name": "KDS Dispatch", "desc": "Order items route live to Kitchen Staff queue for cooking without price exposure."},
        {"num": "04", "name": "Tax & Calculation", "desc": "Server auto-applies CGST (2.5%) + SGST (2.5%) & approved discount codes."},
        {"num": "05", "name": "Payment Settlement", "desc": "Cashier settles bill via Cash (change due), Card, or dynamic UPI QR code."},
        {"num": "06", "name": "Audit & Print", "desc": "Bill is immutably saved, audit log written, and 80mm GST invoice printed."}
    ]

    card_w = Inches(1.8)
    card_gap = Inches(0.18)
    card_h = Inches(3.2)
    start_x = Inches(0.8)

    for i, s in enumerate(steps):
        sx = start_x + i * (card_w + card_gap)
        add_card(slide3, sx, Inches(1.9), card_w, card_h)

        tb = slide3.shapes.add_textbox(sx + Inches(0.12), Inches(2.05), card_w - Inches(0.24), card_h - Inches(0.3))
        stf = tb.text_frame
        stf.word_wrap = True
        stf.margin_left = stf.margin_top = stf.margin_right = stf.margin_bottom = 0

        p_num = stf.paragraphs[0]
        p_num.text = s["num"]
        p_num.font.name = FONT_FAMILY
        p_num.font.size = Pt(22)
        p_num.font.bold = True
        p_num.font.color.rgb = COLOR_ACCENT_GOLD
        p_num.space_after = Pt(4)

        p_name = stf.add_paragraph()
        p_name.text = s["name"]
        p_name.font.name = FONT_FAMILY
        p_name.font.size = Pt(15)
        p_name.font.bold = True
        p_name.font.color.rgb = COLOR_PRIMARY
        p_name.space_after = Pt(8)

        p_desc = stf.add_paragraph()
        p_desc.text = s["desc"]
        p_desc.font.name = FONT_FAMILY
        p_desc.font.size = Pt(13)
        p_desc.font.color.rgb = COLOR_TEXT_DARK

    # Bottom Quality Control Points Banner
    ctrl_box = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(5.35), Inches(11.733), Inches(1.5))
    ctrl_box.fill.solid()
    ctrl_box.fill.fore_color.rgb = COLOR_CARD_HEADER
    ctrl_box.line.color.rgb = COLOR_BORDER
    ctrl_box.line.width = Pt(1.5)

    ctf = ctrl_box.text_frame
    ctf.word_wrap = True
    ctf.margin_left = Inches(0.35)
    ctf.margin_top = Inches(0.2)
    ctf.margin_right = Inches(0.35)
    ctf.margin_bottom = Inches(0.15)

    cp1 = ctf.paragraphs[0]
    cp1.text = "BUILT-IN QUALITY CONTROL POINTS (POKA-YOKE CHECKS)"
    cp1.font.name = FONT_FAMILY
    cp1.font.size = Pt(14)
    cp1.font.bold = True
    cp1.font.color.rgb = COLOR_PRIMARY
    cp1.space_after = Pt(4)

    cp2 = ctf.add_paragraph()
    cp2.text = "• Point 1 (Order Entry): Menu items checked against active database records; inactive items strictly hard-blocked."
    cp2.font.name = FONT_FAMILY
    cp2.font.size = Pt(13)
    cp2.font.color.rgb = COLOR_TEXT_DARK
    cp2.space_after = Pt(2)

    cp3 = ctf.add_paragraph()
    cp3.text = "• Point 2 (Settlement): Subtotal, CGST, SGST, and Grand Total calculated exclusively on server; zero client math manipulation."
    cp3.font.name = FONT_FAMILY
    cp3.font.size = Pt(13)
    cp3.font.color.rgb = COLOR_TEXT_DARK
    cp3.space_after = Pt(2)

    cp4 = ctf.add_paragraph()
    cp4.text = "• Point 3 (Post-Bill Surveillance): Finalized bills become permanently read-only; Owner audits records without edit/delete tampering."
    cp4.font.name = FONT_FAMILY
    cp4.font.size = Pt(13)
    cp4.font.color.rgb = COLOR_TEXT_DARK

    # =========================================================================
    # SLIDE 4: STAKEHOLDERS & SIPOC ANALYSIS
    # =========================================================================
    slide4 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide4, COLOR_BG_LIGHT)
    add_header(slide4, "04 | Stakeholder Architecture", "Stakeholder Hierarchy & SIPOC Process Model",
               "Aligning daily operational inputs, controls, and outputs with distinct organizational stakeholders.")

    # Left Column: Stakeholder Cards (Width: 5.7 in)
    sh_box = add_card(slide4, Inches(0.8), Inches(1.85), Inches(5.7), Inches(5.1))
    s_tf = sh_box.text_frame
    s_tf.word_wrap = True
    s_tf.margin_left = Inches(0.3)
    s_tf.margin_top = Inches(0.2)
    s_tf.margin_right = Inches(0.3)
    s_tf.margin_bottom = Inches(0.2)

    sp1 = s_tf.paragraphs[0]
    sp1.text = "CORE PROJECT STAKEHOLDERS"
    sp1.font.name = FONT_FAMILY
    sp1.font.size = Pt(15)
    sp1.font.bold = True
    sp1.font.color.rgb = COLOR_PRIMARY
    sp1.space_after = Pt(8)

    stakeholders = [
        ("Restaurant Owner", "Monitors high-level KPIs, sales reports, operating expenses, and estimated P&L. Zero billing tampering."),
        ("Administrator", "Manages staff accounts, menu items, prices, backups, and audit logs. Strictly cannot delete the Owner."),
        ("Cashier", "Handles rapid table billing, item quantities, discounts, cash/card/UPI payments, and 80mm receipt printing."),
        ("Kitchen Staff", "Views real-time preparation queue (KDS), updates dish status (Preparing → Ready) without financial access."),
        ("Dining Customer", "Receives accurate itemized billing, GST tax transparency, dynamic UPI QR payments, and clean receipts."),
        ("Tax / Business Auditor", "Verifies GSTIN compliance, 5% GST split, non-repudiation audit trails, and data reliability.")
    ]

    for title, desc in stakeholders:
        p_t = s_tf.add_paragraph()
        p_t.text = f"•  {title}:"
        p_t.font.name = FONT_FAMILY
        p_t.font.size = Pt(14)
        p_t.font.bold = True
        p_t.font.color.rgb = COLOR_TEXT_DARK

        p_d = s_tf.add_paragraph()
        p_d.text = f"    {desc}"
        p_d.font.name = FONT_FAMILY
        p_d.font.size = Pt(13)
        p_d.font.color.rgb = COLOR_TEXT_MUTED
        p_d.space_after = Pt(4)

    # Right Column: SIPOC Matrix Card (Width: 5.7 in)
    sipoc_box = add_card(slide4, Inches(6.8), Inches(1.85), Inches(5.7), Inches(5.1))
    sip_tf = sipoc_box.text_frame
    sip_tf.word_wrap = True
    sip_tf.margin_left = Inches(0.3)
    sip_tf.margin_top = Inches(0.2)
    sip_tf.margin_right = Inches(0.3)
    sip_tf.margin_bottom = Inches(0.2)

    sipp1 = sip_tf.paragraphs[0]
    sipp1.text = "SIPOC PROCESS ARCHITECTURE AT A GLANCE"
    sipp1.font.name = FONT_FAMILY
    sipp1.font.size = Pt(15)
    sipp1.font.bold = True
    sipp1.font.color.rgb = COLOR_ACCENT_GOLD
    sipp1.space_after = Pt(8)

    sipoc_elements = [
        ("S — Suppliers", "Kitchen Inventory, Raw Material Vendors, Dining Guests, Cashier Desk"),
        ("I — Inputs", "Table #, Food Items, Quantities, Unit Rates, Discount Vouchers, Staff Credentials"),
        ("P — Process", "Order Placement  →  Poka-Yoke Validation  →  Kitchen KDS Dispatch  →  Tax/Discount Math  →  Payment Recording  →  Invoice Generation"),
        ("O — Outputs", "80mm GST Tax Invoice, KDS Preparation Ticket, Realized Revenue Entry, Immutable Audit Log Record"),
        ("C — Customers", "Dining Guests, Cashiers, Kitchen Chefs, System Admin, Restaurant Owner, GST Auditor")
    ]

    for label, content in sipoc_elements:
        p_l = sip_tf.add_paragraph()
        p_l.text = label
        p_l.font.name = FONT_FAMILY
        p_l.font.size = Pt(14)
        p_l.font.bold = True
        p_l.font.color.rgb = COLOR_PRIMARY

        p_c = sip_tf.add_paragraph()
        p_c.text = content
        p_c.font.name = FONT_FAMILY
        p_c.font.size = Pt(13)
        p_c.font.color.rgb = COLOR_TEXT_DARK
        p_c.space_after = Pt(6)

    # =========================================================================
    # SLIDE 5: SRS WITH STAKEHOLDER MAPPING (CRITICAL USER REQUEST)
    # =========================================================================
    slide5 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide5, COLOR_BG_LIGHT)
    add_header(slide5, "05 | SRS Specification", "Software Requirements Specification (SRS) Mapped to Stakeholders",
               "Direct mapping of functional specifications, access boundaries, and business rules across project roles.")

    srs_cards = [
        {
            "role": "RESTAURANT OWNER",
            "subtitle": "Section 2 • Executive Surveillance & Audit",
            "color": COLOR_PRIMARY,
            "items": [
                "SRS-OWN-01: Executive KPI overview (Today's gross sales, completed bills, voided bills, monthly trends).",
                "SRS-OWN-02: Comprehensive Sales Reports (Gross, discounts, 5% GST, net sales, export to CSV/print).",
                "SRS-OWN-03: Real-time Operating Profit & Loss statement based on sales minus recorded expenses.",
                "SRS-OWN-04: Read-Only Bill Surveillance: Access full receipt copy; zero permission to edit or delete."
            ]
        },
        {
            "role": "ADMINISTRATOR (ADMIN)",
            "subtitle": "Section 3 • Operational System Configuration",
            "color": COLOR_ACCENT_GOLD,
            "items": [
                "SRS-ADM-01: Staff account lifecycle (create, update, activate/deactivate Cashier and Kitchen accounts).",
                "SRS-ADM-02: Owner Protection Invariant: Strictly blocked from deleting, demoting, or deactivating Owner.",
                "SRS-ADM-03: Menu Catalog Management: Add dishes, set prices, assign categories, toggle live availability.",
                "SRS-ADM-04: Reliability Maintenance: On-demand database backups, system error review, audit inspection."
            ]
        },
        {
            "role": "CASHIER",
            "subtitle": "Section 4 • Point of Sale & Order Billing",
            "color": COLOR_SUCCESS,
            "items": [
                "SRS-CSH-01: High-speed POS billing: Select table, choose dishes, adjust quantities, view live subtotal.",
                "SRS-CSH-02: Poka-Yoke check: Inactive items blocked from bill addition; negative values rejected.",
                "SRS-CSH-03: Multi-payment settlement: Cash (auto change due calculation), Card, and dynamic UPI QR code.",
                "SRS-CSH-04: Receipt generation: Print standard 80mm thermal receipt; duplicate copy marked with watermark."
            ]
        },
        {
            "role": "KITCHEN STAFF (CHEF)",
            "subtitle": "Section 5 • Kitchen Display System (KDS)",
            "color": COLOR_ALERT,
            "items": [
                "SRS-KIT-01: Real-time KDS queue showing incoming order items, quantities, table #, and special instructions.",
                "SRS-KIT-02: Finite workflow state transitions: Mark items as 'Preparing' then 'Ready for Service'.",
                "SRS-KIT-03: State Invariant: Ready orders cannot transition backwards to New through standard buttons.",
                "SRS-KIT-04: Information Hiding: Kitchen displays exclude bill amounts, payment methods, and customer phone."
            ]
        }
    ]

    for idx, c in enumerate(srs_cards):
        cx = xs[idx % 2]
        cy = ys[idx // 2]
        add_card(slide5, cx, cy, col_w, row_h)

        tb = slide5.shapes.add_textbox(cx + Inches(0.25), cy + Inches(0.18), col_w - Inches(0.5), row_h - Inches(0.35))
        ctf = tb.text_frame
        ctf.word_wrap = True
        ctf.margin_left = ctf.margin_top = ctf.margin_right = ctf.margin_bottom = 0

        p1 = ctf.paragraphs[0]
        p1.text = c["role"]
        p1.font.name = FONT_FAMILY
        p1.font.size = Pt(15)
        p1.font.bold = True
        p1.font.color.rgb = c["color"]
        p1.space_after = Pt(2)

        p2 = ctf.add_paragraph()
        p2.text = c["subtitle"]
        p2.font.name = FONT_FAMILY
        p2.font.size = Pt(13)
        p2.font.bold = True
        p2.font.color.rgb = COLOR_TEXT_MUTED
        p2.space_after = Pt(6)

        for item in c["items"]:
            ip = ctf.add_paragraph()
            ip.text = f"•  {item}"
            ip.font.name = FONT_FAMILY
            ip.font.size = Pt(13)
            ip.font.color.rgb = COLOR_TEXT_DARK
            ip.space_after = Pt(3)

    # =========================================================================
    # SLIDE 6: MEASURABLE QUALITY REQUIREMENTS (TQM TABLE)
    # =========================================================================
    slide6 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide6, COLOR_BG_LIGHT)
    add_header(slide6, "06 | TQM Quality Metrics", "Measurable Quality Requirements & Target Benchmarks",
               "Every quality promise in the project is linked directly to an empirical metric, target, and verification rule.")

    # Table Layout
    table_shape = slide6.shapes.add_table(7, 4, Inches(0.8), Inches(1.85), Inches(11.733), Inches(4.5))
    table = table_shape.table

    # Column Widths
    table.columns[0].width = Inches(2.2)
    table.columns[1].width = Inches(4.333)
    table.columns[2].width = Inches(1.8)
    table.columns[3].width = Inches(3.4)

    headers = ["QUALITY AREA", "MEASURABLE QUALITY METRIC", "TARGET", "VERIFICATION MECHANISM"]
    for j, h in enumerate(headers):
        cell = table.cell(0, j)
        cell.fill.solid()
        cell.fill.fore_color.rgb = COLOR_PRIMARY
        p = cell.text_frame.paragraphs[0]
        p.text = h
        p.font.name = FONT_FAMILY
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = COLOR_WHITE
        p.alignment = PP_ALIGN.CENTER

    table_data = [
        ("Billing Calculation Accuracy", "Mathematical calculation discrepancies on finalized customer bills", "0 Discrepancies\n(100% Precision)", "Automated server-side decimal math & unit test suite"),
        ("GST Statutory Compliance", "CGST (2.5%) and SGST (2.5%) calculation & itemized tax display", "100% Compliance\n(Exact 5.0% GST)", "Tax engine validation across gross subtotal transactions"),
        ("RBAC Role Isolation", "Unauthorized attempts by Admin to delete/deactivate Owner account", "0 Violations\n(100% Blocked)", "Route-level RBAC middleware returning HTTP 403 Forbidden"),
        ("Audit Non-Repudiation", "System logs capturing user, role, action, and timestamp on events", "100% Coverage\n(Zero Blindspots)", "Automatic relational logging to MySQL `audit_logs` table"),
        ("Real-Time KDS Latency", "Time delay from POS checkout to live Kitchen Display queue update", "< 1.5 Seconds", "Optimized MySQL indexing & lightweight REST polling/fetch"),
        ("Data Recoverability", "Daily database backup creation & verified restoration test cycle", "100% Backup\nVerifiability", "Automated SQL dump utility generating timestamped backups")
    ]

    for i, row in enumerate(table_data, start=1):
        for j, val in enumerate(row):
            cell = table.cell(i, j)
            cell.fill.solid()
            cell.fill.fore_color.rgb = COLOR_WHITE if i % 2 == 1 else COLOR_CARD_HEADER
            p = cell.text_frame.paragraphs[0]
            p.text = val
            p.font.name = FONT_FAMILY
            p.font.size = Pt(13)
            p.font.color.rgb = COLOR_TEXT_DARK
            if j == 0:
                p.font.bold = True
                p.alignment = PP_ALIGN.LEFT
            elif j == 2:
                p.font.bold = True
                p.font.color.rgb = COLOR_SUCCESS if "0" in val or "100" in val or "<" in val else COLOR_TEXT_DARK
                p.alignment = PP_ALIGN.CENTER
            else:
                p.alignment = PP_ALIGN.LEFT

    # Bottom Note
    note_box = slide6.shapes.add_textbox(Inches(0.8), Inches(6.5), Inches(11.733), Inches(0.5))
    ntf = note_box.text_frame
    np = ntf.paragraphs[0]
    np.text = "Note: Empirical metrics are verified through continuous testing and audit log review to sustain the PDCA reliability cycle."
    np.font.name = FONT_FAMILY
    np.font.size = Pt(13)
    np.font.italic = True
    np.font.color.rgb = COLOR_TEXT_MUTED

    # =========================================================================
    # SLIDE 7: SYSTEM ARCHITECTURE & MODULAR DESIGN
    # =========================================================================
    slide7 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide7, COLOR_BG_LIGHT)
    add_header(slide7, "07 | System Architecture", "4-Tier Modular Architecture & Engineering Structure",
               "Strict architectural decoupling ensures clean separation of concerns, testability, and high operational reliability.")

    # Left Side: 4 Horizontal Architecture Tiers (Width: 6.8 in)
    tiers = [
        {"title": "TIER 1: CLIENT PRESENTATION LAYER (React 18 SPA + Vite)",
         "desc": "Single Page Application • Role-Based Dashboards (Owner, Admin, Cashier, Kitchen) • POS Billing Terminal • Monospace 80mm Thermal Receipt Engine"},
        {"title": "TIER 2: API GATEWAY & ROUTING LAYER (Express.js)",
         "desc": "REST Endpoints: /api/auth, /api/owner, /api/orders, /api/users, /api/menu • JWT Bearer Authentication • RBAC Route Protection Guards"},
        {"title": "TIER 3: BUSINESS RULES & SECURITY SERVICES",
         "desc": "Poka-Yoke Input Validators • Automated GST Tax Calculator • Audit Logging Service • MySQL Dump Backup & Restore Utility"},
        {"title": "TIER 4: RELATIONAL DATA PERSISTENCE (MySQL / MariaDB)",
         "desc": "Relational Schema (10 Normalized Tables) • Foreign Key Constraints • ACID Transaction Rollbacks • Timestamped Backup Storage"}
    ]

    tier_h = Inches(1.15)
    tier_gap = Inches(0.12)
    start_ty = Inches(1.85)

    for i, t in enumerate(tiers):
        ty = start_ty + i * (tier_h + tier_gap)
        tier_card = add_card(slide7, Inches(0.8), ty, Inches(6.8), tier_h)

        tb = slide7.shapes.add_textbox(Inches(1.0), ty + Inches(0.12), Inches(6.4), tier_h - Inches(0.24))
        ttf = tb.text_frame
        ttf.word_wrap = True
        ttf.margin_left = ttf.margin_top = ttf.margin_right = ttf.margin_bottom = 0

        p1 = ttf.paragraphs[0]
        p1.text = t["title"]
        p1.font.name = FONT_FAMILY
        p1.font.size = Pt(14)
        p1.font.bold = True
        p1.font.color.rgb = COLOR_PRIMARY
        p1.space_after = Pt(2)

        p2 = ttf.add_paragraph()
        p2.text = t["desc"]
        p2.font.name = FONT_FAMILY
        p2.font.size = Pt(13)
        p2.font.color.rgb = COLOR_TEXT_DARK

    # Right Side: Why Modular? Benefits Card (Width: 4.6 in)
    why_box = add_card(slide7, Inches(7.9), Inches(1.85), Inches(4.6), Inches(4.95))
    wtf = why_box.text_frame
    wtf.word_wrap = True
    wtf.margin_left = Inches(0.3)
    wtf.margin_top = Inches(0.25)
    wtf.margin_right = Inches(0.3)
    wtf.margin_bottom = Inches(0.25)

    wp1 = wtf.paragraphs[0]
    wp1.text = "WHY MODULAR ARCHITECTURE?"
    wp1.font.name = FONT_FAMILY
    wp1.font.size = Pt(16)
    wp1.font.bold = True
    wp1.font.color.rgb = COLOR_ACCENT_GOLD
    wp1.space_after = Pt(10)

    why_points = [
        ("Zero Direct Database Access", "Frontend components never execute SQL directly; all interactions route through authenticated REST controllers."),
        ("Strict Security Boundaries", "JWT and RBAC middleware centrally evaluate permissions before business rules execute."),
        ("Fault Isolation & Containment", "An issue in receipt printing or UI layout cannot crash the database or disrupt Kitchen KDS order dispatching."),
        ("Maintainability & Testability", "Each module has a single responsibility, enabling independent unit testing and clean version control tracking.")
    ]

    for title, desc in why_points:
        wp_t = wtf.add_paragraph()
        wp_t.text = f"•  {title}:"
        wp_t.font.name = FONT_FAMILY
        wp_t.font.size = Pt(14)
        wp_t.font.bold = True
        wp_t.font.color.rgb = COLOR_TEXT_DARK

        wp_d = wtf.add_paragraph()
        wp_d.text = f"    {desc}"
        wp_d.font.name = FONT_FAMILY
        wp_d.font.size = Pt(13)
        wp_d.font.color.rgb = COLOR_TEXT_MUTED
        wp_d.space_after = Pt(6)

    # =========================================================================
    # SLIDE 8: TQM CONTROLS BUILT INTO THE SYSTEM
    # =========================================================================
    slide8 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide8, COLOR_BG_LIGHT)
    add_header(slide8, "08 | TQM Controls", "Built-in TQM Reliability & Mistake-Proofing (Poka-Yoke)",
               "Quality assurance is integrated into daily operational software mechanisms, not left to post-billing manual inspections.")

    tqm_controls = [
        ("Poka-Yoke Input Validation", "Rejects empty dish names, negative quantities, invalid GST rates, and out-of-stock items before checkout is allowed."),
        ("Owner RBAC Invariant Barrier", "Structural security guard: Admin cannot delete, deactive, demote, or force-reset the Restaurant Owner account (HTTP 403)."),
        ("Tamper-Evident Audit Logging", "Automatically records user ID, IP address, timestamp, and details for every login, void, and role change in `audit_logs`."),
        ("Atomic ACID Transactions", "Database commits orders and order line items together inside atomic transactions; rolls back completely on any failure."),
        ("Automated & On-Demand Backup", "One-click SQL dump utility creates point-in-time database archives with verified restoration for disaster recovery."),
        ("Continuous Improvement (PDCA)", "Audit and error logs provide empirical data to identify recurring operational friction, feeding the Plan-Do-Check-Act loop.")
    ]

    for idx, (title, desc) in enumerate(tqm_controls):
        cx = xs[idx % 2]
        cy = Inches(1.85) + (idx // 2) * Inches(1.65)
        add_card(slide8, cx, cy, col_w, Inches(1.5))

        tb = slide8.shapes.add_textbox(cx + Inches(0.25), cy + Inches(0.15), col_w - Inches(0.5), Inches(1.2))
        ctf = tb.text_frame
        ctf.word_wrap = True
        ctf.margin_left = ctf.margin_top = ctf.margin_right = ctf.margin_bottom = 0

        p1 = ctf.paragraphs[0]
        p1.text = f"{idx + 1}.  {title}"
        p1.font.name = FONT_FAMILY
        p1.font.size = Pt(15)
        p1.font.bold = True
        p1.font.color.rgb = COLOR_PRIMARY
        p1.space_after = Pt(4)

        p2 = ctf.add_paragraph()
        p2.text = desc
        p2.font.name = FONT_FAMILY
        p2.font.size = Pt(13)
        p2.font.color.rgb = COLOR_TEXT_DARK

    # =========================================================================
    # SLIDE 9: DATABASE ARCHITECTURE & RELATIONAL DATA MODEL
    # =========================================================================
    slide9 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide9, COLOR_BG_LIGHT)
    add_header(slide9, "09 | Data Architecture", "Relational Database Schema & Reliability Entities",
               "Normalized MySQL data model with referential integrity, foreign key constraints, and dedicated surveillance tables.")

    # Two Main Cards (Operational vs Reliability/Surveillance)
    card1 = add_card(slide9, Inches(0.8), Inches(1.85), Inches(5.7), Inches(5.1))
    c1_tf = card1.text_frame
    c1_tf.word_wrap = True
    c1_tf.margin_left = Inches(0.3)
    c1_tf.margin_top = Inches(0.2)
    c1_tf.margin_right = Inches(0.3)
    c1_tf.margin_bottom = Inches(0.2)

    c1_p1 = c1_tf.paragraphs[0]
    c1_p1.text = "CORE OPERATIONAL ENTITIES"
    c1_p1.font.name = FONT_FAMILY
    c1_p1.font.size = Pt(15)
    c1_p1.font.bold = True
    c1_p1.font.color.rgb = COLOR_PRIMARY
    c1_p1.space_after = Pt(8)

    op_tables = [
        ("users", "PK id, username, password_hash, role (Owner/Admin/Cashier/Kitchen), status, must_change_password"),
        ("categories", "PK id, name, description, created_at"),
        ("menu_items", "PK id, category_id [FK], name, price, is_available, created_at"),
        ("orders", "PK id, bill_number, table_number, customer_name, subtotal, tax_amount, discount_amount, total, payment_method, order_status, created_by [FK]"),
        ("order_items", "PK id, order_id [FK], menu_item_id [FK], item_name, price, quantity, subtotal")
    ]

    for tbl, fields in op_tables:
        p_t = c1_tf.add_paragraph()
        p_t.text = f"•  Table: {tbl}"
        p_t.font.name = FONT_FAMILY
        p_t.font.size = Pt(14)
        p_t.font.bold = True
        p_t.font.color.rgb = COLOR_TEXT_DARK

        p_f = c1_tf.add_paragraph()
        p_f.text = f"    {fields}"
        p_f.font.name = FONT_FAMILY
        p_f.font.size = Pt(13)
        p_f.font.color.rgb = COLOR_TEXT_MUTED
        p_f.space_after = Pt(4)

    card2 = add_card(slide9, Inches(6.8), Inches(1.85), Inches(5.7), Inches(5.1))
    c2_tf = card2.text_frame
    c2_tf.word_wrap = True
    c2_tf.margin_left = Inches(0.3)
    c2_tf.margin_top = Inches(0.2)
    c2_tf.margin_right = Inches(0.3)
    c2_tf.margin_bottom = Inches(0.2)

    c2_p1 = c2_tf.paragraphs[0]
    c2_p1.text = "RELIABILITY & SURVEILLANCE ENTITIES"
    c2_p1.font.name = FONT_FAMILY
    c2_p1.font.size = Pt(15)
    c2_p1.font.bold = True
    c2_p1.font.color.rgb = COLOR_ACCENT_GOLD
    c2_p1.space_after = Pt(8)

    rel_tables = [
        ("audit_logs", "PK id, user_id [FK], action, details, ip_address, timestamp (Immutable security trail)"),
        ("expenses", "PK id, category, amount, description, expense_date, recorded_by [FK] (Owner P&L accounting)"),
        ("restaurant_settings", "PK id, setting_key, setting_value (Store name, GSTIN, CGST/SGST rates, footer)"),
        ("error_logs", "PK id, error_message, stack_trace, context, timestamp (System debugging records)"),
        ("backup_logs", "PK id, file_name, file_size, created_by [FK], status, created_at (Backup tracking)")
    ]

    for tbl, fields in rel_tables:
        p_t = c2_tf.add_paragraph()
        p_t.text = f"•  Table: {tbl}"
        p_t.font.name = FONT_FAMILY
        p_t.font.size = Pt(14)
        p_t.font.bold = True
        p_t.font.color.rgb = COLOR_TEXT_DARK

        p_f = c2_tf.add_paragraph()
        p_f.text = f"    {fields}"
        p_f.font.name = FONT_FAMILY
        p_f.font.size = Pt(13)
        p_f.font.color.rgb = COLOR_TEXT_MUTED
        p_f.space_after = Pt(4)

    # =========================================================================
    # SLIDE 10: CONCLUSION & QUALITY ASSURANCE IMPACT
    # =========================================================================
    slide10 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide10, COLOR_BG_LIGHT)
    add_header(slide10, "10 | Conclusion & Impact", "Reliability Achievements & Quality Assurance Impact",
               "Demonstrating tangible TQM reliability outcomes through disciplined software architecture and mistake-proofing.")

    # 3 High-Impact Cards Layout
    summary_cards = [
        {
            "title": "ZERO FINANCIAL LEAKAGE",
            "color": COLOR_SUCCESS,
            "bullets": [
                "Automated server-side GST tax & discount math eliminates human cashier calculation mistakes.",
                "Read-only Owner surveillance safeguards prevent unauthorized edits or unmonitored bill voids.",
                "Verified payment recording ensures cash change accuracy and instant UPI QR verification."
            ]
        },
        {
            "title": "TOTAL PROCESS TRACEABILITY",
            "color": COLOR_PRIMARY,
            "bullets": [
                "Every business event—from bill generation to role modifications—is permanently logged in audit trails.",
                "Non-repudiation guarantees complete accountability across Owner, Admin, Cashier, and Chef roles.",
                "Detailed sales reports and P&L statements are exportable to CSV/PDF with date-time stamps."
            ]
        },
        {
            "title": "HIGH OPERATIONAL RELIABILITY",
            "color": COLOR_ACCENT_GOLD,
            "bullets": [
                "Decoupled 4-tier architecture ensures client rendering issues never corrupt database transactions.",
                "On-demand and scheduled MySQL backups safeguard business records against data loss or damage.",
                "Real-time KDS state transitions streamline kitchen communication without financial exposure."
            ]
        }
    ]

    c_w = Inches(3.75)
    c_gap = Inches(0.24)
    start_cx = Inches(0.8)

    for i, sc in enumerate(summary_cards):
        cx = start_cx + i * (c_w + c_gap)
        add_card(slide10, cx, Inches(1.85), c_w, Inches(3.6))

        tb = slide10.shapes.add_textbox(cx + Inches(0.2), Inches(2.05), c_w - Inches(0.4), Inches(3.2))
        stf = tb.text_frame
        stf.word_wrap = True
        stf.margin_left = stf.margin_top = stf.margin_right = stf.margin_bottom = 0

        p1 = stf.paragraphs[0]
        p1.text = sc["title"]
        p1.font.name = FONT_FAMILY
        p1.font.size = Pt(16)
        p1.font.bold = True
        p1.font.color.rgb = sc["color"]
        p1.space_after = Pt(8)

        for b in sc["bullets"]:
            bp = stf.add_paragraph()
            bp.text = f"•  {b}"
            bp.font.name = FONT_FAMILY
            bp.font.size = Pt(13)
            bp.font.color.rgb = COLOR_TEXT_DARK
            bp.space_after = Pt(6)

    # Bottom Closing Quality Commitment Banner
    bottom_banner = slide10.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(5.65), Inches(11.733), Inches(1.4))
    bottom_banner.fill.solid()
    bottom_banner.fill.fore_color.rgb = COLOR_PRIMARY
    bottom_banner.line.fill.background()

    btf = bottom_banner.text_frame
    btf.word_wrap = True
    btf.margin_left = Inches(0.4)
    btf.margin_top = Inches(0.2)
    btf.margin_right = Inches(0.4)
    btf.margin_bottom = Inches(0.2)

    bp1 = btf.paragraphs[0]
    bp1.text = "TQM COMMITMENT: QUALITY AS AN OPERATIONAL INVARIANT"
    bp1.font.name = FONT_FAMILY
    bp1.font.size = Pt(15)
    bp1.font.bold = True
    bp1.font.color.rgb = COLOR_ACCENT_BG
    bp1.space_after = Pt(4)

    bp2 = btf.add_paragraph()
    bp2.text = "The Restaurant Billing & Surveillance System fulfills the BBAT104 Course Quality Mandate (Q01: Improve Reliability) by transitioning quality management from an afterthought into automated, self-enforcing software architecture."
    bp2.font.name = FONT_FAMILY
    bp2.font.size = Pt(13)
    bp2.font.color.rgb = COLOR_WHITE

    prs.save(output_path)
    print(f"Successfully generated 10-slide presentation at: {output_path}")

if __name__ == "__main__":
    out = r"C:\Users\Ankit\Downloads\Ankit_Restaurant_Billing_System_TQM_Updated.pptx"
    create_presentation(out)
