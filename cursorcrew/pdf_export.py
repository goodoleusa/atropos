"""
PDF export functionality for OSINT investigations.
Converts markdown reports to nicely formatted PDFs without visible markdown syntax.
"""
import os
import re
from datetime import date
from pathlib import Path
from typing import Optional


def markdown_to_html(markdown_content: str, title: str = "") -> str:
    """Convert markdown to HTML with nice styling."""
    try:
        import markdown
        from markdown.extensions import tables, fenced_code
        
        # Remove YAML frontmatter if present
        content = markdown_content
        if content.startswith("---"):
            parts = content.split("---", 2)
            if len(parts) >= 3:
                content = parts[2].strip()
        
        # Convert markdown to HTML
        html_content = markdown.markdown(
            content,
            extensions=["tables", "fenced_code", "codehilite", "nl2br"],
        )
        
        # Wrap in styled HTML document
        html_doc = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>{title or "OSINT Investigation Report"}</title>
    <style>
        @page {{
            margin: 2cm;
            size: A4;
        }}
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 100%;
            margin: 0;
            padding: 0;
        }}
        h1 {{
            color: #1a1a1a;
            border-bottom: 3px solid #4a90e2;
            padding-bottom: 10px;
            margin-top: 0;
            font-size: 28px;
        }}
        h2 {{
            color: #2c3e50;
            border-bottom: 2px solid #e0e0e0;
            padding-bottom: 8px;
            margin-top: 30px;
            font-size: 22px;
        }}
        h3 {{
            color: #34495e;
            margin-top: 25px;
            font-size: 18px;
        }}
        h4 {{
            color: #555;
            margin-top: 20px;
            font-size: 16px;
        }}
        table {{
            border-collapse: collapse;
            width: 100%;
            margin: 20px 0;
            font-size: 14px;
        }}
        table th {{
            background-color: #4a90e2;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: bold;
        }}
        table td {{
            padding: 10px;
            border: 1px solid #ddd;
        }}
        table tr:nth-child(even) {{
            background-color: #f9f9f9;
        }}
        code {{
            background-color: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            font-size: 13px;
        }}
        pre {{
            background-color: #f4f4f4;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            border-left: 4px solid #4a90e2;
        }}
        pre code {{
            background-color: transparent;
            padding: 0;
        }}
        ul, ol {{
            margin: 15px 0;
            padding-left: 30px;
        }}
        li {{
            margin: 8px 0;
        }}
        p {{
            margin: 12px 0;
        }}
        blockquote {{
            border-left: 4px solid #4a90e2;
            margin: 20px 0;
            padding: 10px 20px;
            background-color: #f9f9f9;
            font-style: italic;
        }}
        .footer {{
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #777;
            text-align: center;
        }}
    </style>
</head>
<body>
    {html_content}
    <div class="footer">
        <p>Generated on {date.today().isoformat()} | OSINT Investigation Tool</p>
    </div>
</body>
</html>"""
        return html_doc
    except ImportError:
        # Fallback: simple HTML if markdown library not available
        html_content = markdown_content.replace("\n", "<br>\n")
        html_content = re.sub(r"^# (.+)$", r"<h1>\1</h1>", html_content, flags=re.MULTILINE)
        html_content = re.sub(r"^## (.+)$", r"<h2>\1</h2>", html_content, flags=re.MULTILINE)
        html_content = re.sub(r"^### (.+)$", r"<h3>\1</h3>", html_content, flags=re.MULTILINE)
        return f"<html><body>{html_content}</body></html>"


def html_to_pdf(html_content: str, output_path: str) -> bool:
    """Convert HTML to PDF using weasyprint."""
    try:
        from weasyprint import HTML
        
        HTML(string=html_content).write_pdf(output_path)
        return True
    except ImportError:
        # Fallback: try reportlab if weasyprint not available
        try:
            from reportlab.lib.pagesizes import A4
            from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
            from reportlab.lib.styles import getSampleStyleSheet
            from reportlab.lib.units import inch
            from html.parser import HTMLParser
            
            # Simple HTML to PDF conversion (basic)
            doc = SimpleDocTemplate(output_path, pagesize=A4)
            styles = getSampleStyleSheet()
            story = []
            
            # Extract text from HTML (simplified)
            text = re.sub(r"<[^>]+>", "", html_content)
            for line in text.split("\n"):
                if line.strip():
                    story.append(Paragraph(line.strip(), styles["Normal"]))
                    story.append(Spacer(1, 0.2 * inch))
            
            doc.build(story)
            return True
        except ImportError:
            return False


def export_investigation_to_pdf(
    investigation_path: str,
    investigation_id: str,
    investigation_name: str,
    output_path: Optional[str] = None,
) -> Optional[str]:
    """
    Export investigation markdown file to PDF.
    
    Args:
        investigation_path: Path to investigation folder
        investigation_id: Investigation ID
        investigation_name: Investigation name
        output_path: Optional output PDF path (default: investigation folder)
    
    Returns:
        Path to generated PDF or None on error
    """
    # Find investigation markdown file
    inv_file = None
    for file in os.listdir(investigation_path):
        if file.endswith(".md") and "Investigation" in file:
            inv_file = os.path.join(investigation_path, file)
            break
    
    if not inv_file or not os.path.exists(inv_file):
        return None
    
    # Read markdown content
    with open(inv_file, "r", encoding="utf-8") as f:
        markdown_content = f.read()
    
    # Convert to HTML
    html_content = markdown_to_html(markdown_content, investigation_name)
    
    # Determine output path
    if not output_path:
        output_path = os.path.join(investigation_path, f"{investigation_id}_report.pdf")
    
    # Convert HTML to PDF
    if html_to_pdf(html_content, output_path):
        return output_path
    return None


def export_entities_to_pdf(
    investigation_path: str,
    investigation_id: str,
    output_path: Optional[str] = None,
) -> Optional[str]:
    """
    Export all entity markdown files to a single PDF.
    
    Args:
        investigation_path: Path to investigation folder
        investigation_id: Investigation ID
        output_path: Optional output PDF path
    
    Returns:
        Path to generated PDF or None on error
    """
    entity_types = ["domain", "ip", "asn", "organization", "person", "threat_actor", "technique", "vulnerability"]
    all_content = []
    
    # Collect all entity markdown files
    for entity_type in entity_types:
        entity_dir = os.path.join(investigation_path, entity_type)
        if not os.path.exists(entity_dir):
            continue
        
        for file in os.listdir(entity_dir):
            if file.endswith(".md"):
                file_path = os.path.join(entity_dir, file)
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                    all_content.append(f"\n\n---\n\n# {entity_type.upper()}: {file}\n\n---\n\n{content}")
    
    if not all_content:
        return None
    
    # Combine all content
    combined_markdown = "\n".join(all_content)
    html_content = markdown_to_html(combined_markdown, f"Entities - {investigation_id}")
    
    # Determine output path
    if not output_path:
        output_path = os.path.join(investigation_path, f"{investigation_id}_entities.pdf")
    
    # Convert to PDF
    if html_to_pdf(html_content, output_path):
        return output_path
    return None


def export_archived_materials(
    investigation_path: str,
    investigation_id: str,
    output_path: Optional[str] = None,
) -> Optional[str]:
    """
    Export archived materials (HTML files) to a ZIP archive.
    
    Args:
        investigation_path: Path to investigation folder
        investigation_id: Investigation ID
        output_path: Optional output ZIP path
    
    Returns:
        Path to generated ZIP or None on error
    """
    archive_dir = os.path.join(investigation_path, "archived_content")
    if not os.path.exists(archive_dir):
        return None
    
    try:
        import zipfile
        
        # Determine output path
        if not output_path:
            output_path = os.path.join(investigation_path, f"{investigation_id}_archived_materials.zip")
        
        # Create ZIP archive
        with zipfile.ZipFile(output_path, "w", zipfile.ZIP_DEFLATED) as zipf:
            for root, dirs, files in os.walk(archive_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    arc_name = os.path.relpath(file_path, investigation_path)
                    zipf.write(file_path, arc_name)
        
        return output_path
    except ImportError:
        return None


def export_full_investigation(
    investigation_path: str,
    investigation_id: str,
    investigation_name: str,
    include_entities: bool = True,
    include_archived: bool = True,
) -> dict[str, Optional[str]]:
    """
    Export full investigation including report, entities, and archived materials.
    
    Returns:
        Dict with keys: 'report_pdf', 'entities_pdf', 'archived_zip'
    """
    results = {
        "report_pdf": None,
        "entities_pdf": None,
        "archived_zip": None,
    }
    
    # Export investigation report
    results["report_pdf"] = export_investigation_to_pdf(
        investigation_path, investigation_id, investigation_name
    )
    
    # Export entities if requested
    if include_entities:
        results["entities_pdf"] = export_entities_to_pdf(
            investigation_path, investigation_id
        )
    
    # Export archived materials if requested
    if include_archived:
        results["archived_zip"] = export_archived_materials(
            investigation_path, investigation_id
        )
    
    return results
