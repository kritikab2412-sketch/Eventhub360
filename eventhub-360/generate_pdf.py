import os
from fpdf import FPDF

class EventHubPDF(FPDF):
    def header(self):
        if self.page_no() > 1:
            self.set_font("helvetica", "I", 8)
            self.set_text_color(120, 120, 120)
            self.cell(0, 10, "EventHub 360 - Database ERD & UI/UX System Design Specification", align="L", new_x="LEFT", new_y="NEXT")
            self.line(10, 18, 200, 18)
            self.ln(5)

    def footer(self):
        if self.page_no() > 0:
            self.set_y(-15)
            self.set_font("helvetica", "I", 8)
            self.set_text_color(120, 120, 120)
            self.cell(0, 10, f"Page {self.page_no()} | Confidential - Internal Use Only", align="C")

def build_pdf():
    pdf = EventHubPDF()
    pdf.set_margins(15, 20, 15)
    pdf.set_auto_page_break(auto=True, margin=20)
    
    # ---------------- PAGE 1: COVER PAGE ----------------
    pdf.add_page()
    pdf.set_fill_color(11, 15, 25) # Dark Blue canvas
    pdf.rect(0, 0, 210, 297, "F")
    
    pdf.ln(40)
    # Accent badge
    pdf.set_font("helvetica", "B", 10)
    pdf.set_text_color(0, 242, 254) # Accent Cyan
    pdf.cell(0, 10, "ENTERPRISE SPECIFICATION", align="C", new_x="LEFT", new_y="NEXT")
    
    pdf.ln(15)
    # Title
    pdf.set_font("helvetica", "B", 36)
    pdf.set_text_color(255, 215, 0) # Accent Gold
    pdf.cell(0, 15, "EventHub 360", align="C", new_x="LEFT", new_y="NEXT")
    
    # Subtitle
    pdf.ln(5)
    pdf.set_font("helvetica", "B", 14)
    pdf.set_text_color(248, 250, 252) # White
    pdf.cell(0, 10, "Unified Database Schema (ERD) & UI/UX Console Specifications", align="C", new_x="LEFT", new_y="NEXT")
    
    pdf.ln(8)
    pdf.set_font("helvetica", "", 11)
    pdf.set_text_color(148, 163, 184) # Muted Gray
    pdf.cell(0, 8, "A complete enquiry-to-profitability lifecycle design across twenty integrated modules.", align="C", new_x="LEFT", new_y="NEXT")
    
    # Divider line
    pdf.ln(25)
    pdf.set_draw_color(0, 242, 254)
    pdf.set_line_width(0.8)
    pdf.line(40, pdf.get_y(), 170, pdf.get_y())
    
    pdf.ln(60)
    # Metadata block
    pdf.set_font("helvetica", "", 10)
    pdf.set_text_color(248, 250, 252)
    pdf.cell(0, 6, "PREPARED BY: Product & Solution Architecture Team", align="C", new_x="LEFT", new_y="NEXT")
    pdf.cell(0, 6, "DATE: June 2026", align="C", new_x="LEFT", new_y="NEXT")
    pdf.cell(0, 6, "STATUS: Baseline Release v1.0", align="C", new_x="LEFT", new_y="NEXT")
    
    # ---------------- PAGE 2: TABLE OF CONTENTS ----------------
    pdf.add_page()
    pdf.set_text_color(0, 0, 0)
    pdf.set_font("helvetica", "B", 18)
    pdf.cell(0, 10, "Table of Contents", new_x="LEFT", new_y="NEXT")
    pdf.ln(5)
    
    pdf.set_font("helvetica", "", 11)
    toc_items = [
        ("1. Executive Summary & Project Scope", 3),
        ("2. Visual Design System & UI/UX Tokens", 4),
        ("3. High-Fidelity UI/UX Dashboard Mockup", 5),
        ("4. System Wireframes & Interface Blueprints", 6),
        ("5. Normalized Database Entity Relationship Diagram (ERD)", 7),
        ("6. Database Table Schemas (Detailed Tables)", 8),
        ("7. Database Performance Indexes & Audit Triggers", 10),
    ]
    
    for item, page in toc_items:
        pdf.cell(140, 10, item, border=0)
        pdf.cell(40, 10, f"Page {page}", border=0, align="R", new_x="LEFT", new_y="NEXT")
        pdf.line(15, pdf.get_y(), 195, pdf.get_y())
        pdf.ln(2)
        
    # ---------------- PAGE 3: EXECUTIVE SUMMARY ----------------
    pdf.add_page()
    pdf.set_font("helvetica", "B", 16)
    pdf.set_text_color(16, 44, 87)
    pdf.cell(0, 10, "1. Executive Summary & Project Scope", new_x="LEFT", new_y="NEXT")
    pdf.ln(5)
    
    pdf.set_font("helvetica", "", 10)
    summary_text = (
        "EventHub 360 is an enterprise ERP platform that unifies the entire event, wedding, hospitality, "
        "and tourism business into a single role-based, multi-tenant system. In this sector, organizations "
        "typically rely on highly fragmented tools like spreadsheets, messaging chains, and separate accounting "
        "packages. This fragmentation leads to booking collisions, pricing margin leakages, and manual coordination errors.\n\n"
        "This specification consolidates 20 functional modules into a normalized relational database design and a premium "
        "glassmorphic visual interface framework. Finance, invoicing, and auditing are handled as core entities to support "
        "per-event profit and loss calculation, automated gateway reconciliation, and compliance."
    )
    pdf.multi_cell(0, 6, summary_text)
    
    pdf.ln(8)
    pdf.set_font("helvetica", "B", 12)
    pdf.cell(0, 8, "Scope Metrics at a Glance:", new_x="LEFT", new_y="NEXT")
    pdf.ln(2)
    
    pdf.set_font("helvetica", "", 10)
    metrics = [
        ("Functional Modules", "20 Modules (CRM, Quoting, Booking, Hotel PMS, AI, Marketplace, etc.)"),
        ("Database Tables", "136+ Tables mapping cross-functional entity layers"),
        ("API Endpoints", "480+ OpenAPI-compliant REST endpoints"),
        ("User Roles", "15 standard operational roles governed by RBAC rules"),
    ]
    for label, desc in metrics:
        pdf.set_font("helvetica", "B", 10)
        pdf.cell(45, 8, f"{label}:", border=0)
        pdf.set_font("helvetica", "", 10)
        pdf.cell(0, 8, desc, border=0, new_x="LEFT", new_y="NEXT")

    # ---------------- PAGE 4: UI/UX TOKENS ----------------
    pdf.add_page()
    pdf.set_font("helvetica", "B", 16)
    pdf.cell(0, 10, "2. Visual Design System & UI/UX Tokens", new_x="LEFT", new_y="NEXT")
    pdf.ln(5)
    
    pdf.set_font("helvetica", "", 10)
    design_system_intro = (
        "To deliver a premium, modern experience, the UI/UX architecture implements a glassmorphic visual style "
        "based on high contrast dark background surfaces. Blur filters and translucent panels give depth and focus, "
        "while colored highlights emphasize state changes and metrics."
    )
    pdf.multi_cell(0, 6, design_system_intro)
    pdf.ln(5)
    
    # Table of tokens
    pdf.set_font("helvetica", "B", 10)
    pdf.set_fill_color(240, 240, 240)
    pdf.cell(45, 10, "Token Name", border=1, fill=True)
    pdf.cell(45, 10, "Hex Value", border=1, fill=True)
    pdf.cell(90, 10, "Application Scope", border=1, fill=True, new_x="LEFT", new_y="NEXT")
    
    tokens = [
        ("Primary BG", "#0B0F19", "Main application canvas backdrop"),
        ("Secondary BG", "rgba(22, 28, 45, 0.65)", "Glassmorphic overlay panels (blur filter)"),
        ("Accent Cyan", "#00F2FE", "Active highlights, buttons, key indicators"),
        ("Accent Gold", "#FFD700", "VIP statuses, key metrics summaries"),
        ("Text Primary", "#F8FAFC", "Headers, focus copy, high-readability lists"),
        ("Success Green", "#10B981", "Approved quotations, active rooms, confirmed bookings"),
        ("Pending Amber", "#F59E0B", "Tentative holds, review alerts, warning bounds"),
    ]
    
    pdf.set_font("helvetica", "", 10)
    for name, hexval, scope in tokens:
        pdf.cell(45, 8, name, border=1)
        pdf.cell(45, 8, hexval, border=1)
        pdf.cell(90, 8, scope, border=1, new_x="LEFT", new_y="NEXT")
        
    pdf.ln(8)
    pdf.set_font("helvetica", "B", 11)
    pdf.cell(0, 8, "Typography Specifications:", new_x="LEFT", new_y="NEXT")
    pdf.set_font("helvetica", "", 10)
    pdf.cell(0, 6, "- Headings: Google Font 'Outfit' (Vibrant, geometric curves for premium visual identity)", new_x="LEFT", new_y="NEXT")
    pdf.cell(0, 6, "- Body/Data Tables: Google Font 'Inter' (Optimized for data density and numerical scanning)", new_x="LEFT", new_y="NEXT")

    # ---------------- PAGE 5: DASHBOARD MOCKUP ----------------
    pdf.add_page()
    pdf.set_font("helvetica", "B", 16)
    pdf.cell(0, 10, "3. High-Fidelity UI/UX Dashboard Mockup", new_x="LEFT", new_y="NEXT")
    pdf.ln(5)
    
    pdf.set_font("helvetica", "", 10)
    pdf.multi_cell(0, 6, "Below is the rendered concept mockup of the EventHub 360 Web Console, showing the sidebar navigation and metric charts:")
    pdf.ln(10)
    
    # Embed image
    image_path = r"C:\Users\IDEAL\.gemini\antigravity\brain\0f2604e3-019b-4590-8826-ca80031a4932\eventhub_professional_dashboard_mockup_1781588727897.png"
    if os.path.exists(image_path):
        pdf.image(image_path, x=20, y=pdf.get_y(), w=170, h=120)
    else:
        pdf.set_draw_color(200, 200, 200)
        pdf.rect(20, pdf.get_y(), 170, 120)
        pdf.cell(0, 120, "Dashboard Mockup Image (Not Found)", align="C")

    # ---------------- PAGE 6: SYSTEM WIREFRAMES ----------------
    pdf.add_page()
    pdf.set_font("helvetica", "B", 16)
    pdf.cell(0, 10, "4. System Wireframes & Interface Blueprints", new_x="LEFT", new_y="NEXT")
    pdf.ln(5)
    
    pdf.set_font("helvetica", "B", 12)
    pdf.cell(0, 8, "Layout Structure: Main Workspace Console", new_x="LEFT", new_y="NEXT")
    pdf.set_font("helvetica", "", 10)
    pdf.cell(0, 6, "- Collapsible sidebar menu providing access to CRM, Proposals, Bookings, PMS, and Financial modules.", new_x="LEFT", new_y="NEXT")
    pdf.cell(0, 6, "- Main canvas displaying metric counts cards (Pipeline, Active Bookings, Room blocks).", new_x="LEFT", new_y="NEXT")
    pdf.cell(0, 6, "- Persistent notification dashboard showing database audit actions and workflow approvals.", new_x="LEFT", new_y="NEXT")
    
    pdf.ln(5)
    pdf.set_font("helvetica", "B", 12)
    pdf.cell(0, 8, "Layout Structure: Lead pipeline Kanban Board", new_x="LEFT", new_y="NEXT")
    pdf.set_font("helvetica", "", 10)
    pdf.cell(0, 6, "- Drag-and-drop pipeline cards separating leads by status: 'New', 'Qualified', 'Proposal', 'Won'.", new_x="LEFT", new_y="NEXT")
    pdf.cell(0, 6, "- Live budget totals recalculated dynamically as cards are dragged between stages.", new_x="LEFT", new_y="NEXT")
    
    pdf.ln(5)
    pdf.set_font("helvetica", "B", 12)
    pdf.cell(0, 8, "Layout Structure: Catalog-Driven Quotation Builder", new_x="LEFT", new_y="NEXT")
    pdf.set_font("helvetica", "", 10)
    pdf.cell(0, 6, "- Left side menu showing venue lists and pricing items catalogs.", new_x="LEFT", new_y="NEXT")
    pdf.cell(0, 6, "- Right side details sheet computing discounts, GST taxes, and margins dynamically.", new_x="LEFT", new_y="NEXT")

    # ---------------- PAGE 7: DATABASE ERD ----------------
    pdf.add_page()
    pdf.set_font("helvetica", "B", 16)
    pdf.cell(0, 10, "5. Database Entity Relationship Diagram (ERD)", new_x="LEFT", new_y="NEXT")
    pdf.ln(5)
    
    pdf.set_font("helvetica", "", 10)
    erd_intro = (
        "The relational schema is mapped to model the full business lifecycle. Relationships are enforced "
        "using foreign keys with cascade policies where applicable. Scoping constraints isolate tenant data "
        "transparently across all modules."
    )
    pdf.multi_cell(0, 6, erd_intro)
    pdf.ln(5)
    
    pdf.set_font("helvetica", "B", 11)
    pdf.cell(0, 8, "Core Structural Schema Paths:", new_x="LEFT", new_y="NEXT")
    pdf.set_font("helvetica", "", 10)
    paths = [
        ("Tenant Scoping", "tenant (1) -> (N) company -> (N) branch -> (N) venue / room"),
        ("Sales Ingestion", "contact (1) -> (N) lead -> (N) quotation -> (1) booking"),
        ("Event Scheduling", "booking (1) -> (1) event -> (N) event_tasks / guest list / vendor hires"),
        ("Hotel PMS Blocks", "event (1) -> (N) room_block -> (N) reservation -> (1) hotel_room"),
        ("Financial Ledger", "booking (1) -> (N) invoice -> (N) payment / receipts"),
    ]
    for name, path_desc in paths:
        pdf.set_font("helvetica", "B", 10)
        pdf.cell(40, 8, f"{name}:", border=0)
        pdf.set_font("helvetica", "", 10)
        pdf.cell(0, 8, path_desc, border=0, new_x="LEFT", new_y="NEXT")

    # ---------------- PAGE 8: TABLE SCHEMAS PART 1 ----------------
    pdf.add_page()
    pdf.set_font("helvetica", "B", 16)
    pdf.cell(0, 10, "6. Database Table Schemas", new_x="LEFT", new_y="NEXT")
    pdf.ln(5)
    
    pdf.set_font("helvetica", "", 10)
    pdf.multi_cell(0, 6, "Below is the specification of core database tables detailing primary keys, types, and references:")
    pdf.ln(5)
    
    table_headers = ["Column Name", "PostgreSQL Type", "Key", "Description / Constraints"]
    
    def render_table_header():
        pdf.set_font("helvetica", "B", 9)
        pdf.set_fill_color(230, 230, 230)
        pdf.cell(30, 8, table_headers[0], border=1, fill=True)
        pdf.cell(35, 8, table_headers[1], border=1, fill=True)
        pdf.cell(15, 8, table_headers[2], border=1, fill=True)
        pdf.cell(100, 8, table_headers[3], border=1, fill=True, new_x="LEFT", new_y="NEXT")

    # Table: tenant
    pdf.set_font("helvetica", "B", 11)
    pdf.cell(0, 8, "Table 1: tenant (Multi-tenant system root boundary)", new_x="LEFT", new_y="NEXT")
    render_table_header()
    pdf.set_font("helvetica", "", 9)
    tenant_cols = [
        ("tenant_id", "BIGSERIAL", "PK", "Unique tenant system ID"),
        ("name", "VARCHAR(150)", "", "Company brand name"),
        ("subdomain", "VARCHAR(80)", "UQ", "Tenant subdomain routing parameter"),
        ("plan", "VARCHAR(20)", "", "System plan tier ('Starter', 'Enterprise')"),
    ]
    for col, type_name, key, desc in tenant_cols:
        pdf.cell(30, 6, col, border=1)
        pdf.cell(35, 6, type_name, border=1)
        pdf.cell(15, 6, key, border=1)
        pdf.cell(100, 6, desc, border=1, new_x="LEFT", new_y="NEXT")
        
    pdf.ln(5)
    # Table: lead
    pdf.set_font("helvetica", "B", 11)
    pdf.cell(0, 8, "Table 2: lead (CRM Sales Pipeline)", new_x="LEFT", new_y="NEXT")
    render_table_header()
    pdf.set_font("helvetica", "", 9)
    lead_cols = [
        ("lead_id", "BIGSERIAL", "PK", "Unique lead ID"),
        ("company_id", "BIGINT", "FK", "REFERENCES company(company_id) ON CASCADE"),
        ("contact_id", "BIGINT", "FK", "REFERENCES contact(contact_id) ON CASCADE"),
        ("stage", "VARCHAR(20)", "", "Pipeline stage ('New', 'Proposal', 'Won')"),
        ("budget", "DECIMAL(14,2)", "", "Customer budget projection"),
    ]
    for col, type_name, key, desc in lead_cols:
        pdf.cell(30, 6, col, border=1)
        pdf.cell(35, 6, type_name, border=1)
        pdf.cell(15, 6, key, border=1)
        pdf.cell(100, 6, desc, border=1, new_x="LEFT", new_y="NEXT")

    # ---------------- PAGE 9: TABLE SCHEMAS PART 2 ----------------
    pdf.add_page()
    # Table: quotation
    pdf.set_font("helvetica", "B", 11)
    pdf.cell(0, 8, "Table 3: quotation (CRM Pricing proposal)", new_x="LEFT", new_y="NEXT")
    render_table_header()
    pdf.set_font("helvetica", "", 9)
    quote_cols = [
        ("quotation_id", "BIGSERIAL", "PK", "Unique quotation identifier"),
        ("lead_id", "BIGINT", "FK", "REFERENCES lead(lead_id) ON CASCADE"),
        ("total", "DECIMAL(14,2)", "", "Total quotation value inclusive of taxes"),
        ("margin", "DECIMAL(14,2)", "", "Profit margin calculated (sell - cost)"),
        ("status", "VARCHAR(15)", "", "Quotation status ('Draft', 'Accepted')"),
    ]
    for col, type_name, key, desc in quote_cols:
        pdf.cell(30, 6, col, border=1)
        pdf.cell(35, 6, type_name, border=1)
        pdf.cell(15, 6, key, border=1)
        pdf.cell(100, 6, desc, border=1, new_x="LEFT", new_y="NEXT")
        
    pdf.ln(5)
    # Table: booking
    pdf.set_font("helvetica", "B", 11)
    pdf.cell(0, 8, "Table 4: booking (Contract holds)", new_x="LEFT", new_y="NEXT")
    render_table_header()
    pdf.set_font("helvetica", "", 9)
    booking_cols = [
        ("booking_id", "BIGSERIAL", "PK", "Unique booking ID"),
        ("booking_ref", "VARCHAR(30)", "UQ", "Human-readable invoice reference prefix"),
        ("quotation_id", "BIGINT", "FK", "REFERENCES quotation(quotation_id) ON RESTRICT"),
        ("status", "VARCHAR(15)", "", "Status ('Tentative', 'Confirmed')"),
    ]
    for col, type_name, key, desc in booking_cols:
        pdf.cell(30, 6, col, border=1)
        pdf.cell(35, 6, type_name, border=1)
        pdf.cell(15, 6, key, border=1)
        pdf.cell(100, 6, desc, border=1, new_x="LEFT", new_y="NEXT")

    # ---------------- PAGE 10: INDEXES & TRIGGERS ----------------
    pdf.add_page()
    pdf.set_font("helvetica", "B", 16)
    pdf.cell(0, 10, "7. Database Performance Indexes & Audit Triggers", new_x="LEFT", new_y="NEXT")
    pdf.ln(5)
    
    pdf.set_font("helvetica", "B", 12)
    pdf.cell(0, 8, "Performance Indices", new_x="LEFT", new_y="NEXT")
    pdf.set_font("helvetica", "", 10)
    pdf.cell(0, 6, "- 'idx_lead_stage_date': Speeds up dashboard pipeline rendering.", new_x="LEFT", new_y="NEXT")
    pdf.cell(0, 6, "- 'idx_audit_entity': Optimizes trace queries for audit log checks.", new_x="LEFT", new_y="NEXT")
    pdf.cell(0, 6, "- 'idx_booking_ref': Ensures fast contract status lookup queries.", new_x="LEFT", new_y="NEXT")
    
    pdf.ln(5)
    pdf.set_font("helvetica", "B", 12)
    pdf.cell(0, 8, "Tamper-Evident Audit Triggers", new_x="LEFT", new_y="NEXT")
    pdf.set_font("helvetica", "", 10)
    triggers_desc = (
        "Every write operation (INSERT, UPDATE, DELETE) on core transactional tables triggers "
        "the 'log_audit_change()' database trigger function. This function copies old and new row states "
        "into the 'audit_log' table as JSONB datasets, ensuring an immutable compliance log."
    )
    pdf.multi_cell(0, 6, triggers_desc)
    
    # Save PDF
    output_filename = "EventHub360_System_Design.pdf"
    pdf.output(output_filename)
    print(f"PDF saved successfully as {output_filename}")

if __name__ == "__main__":
    build_pdf()
