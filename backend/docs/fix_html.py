import re

file_path = 'AI_Vendor_Discovery_Agent_Professional_Documentation.html'
with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Replace Cross Reference Card in Section 62
old_card = """    <div class="cross-reference-card">
        <h4 class="card-title">Cross References</h4>
        <div class="card-grid">
            <div class="card-item">
                <span class="card-label">Related Files:</span>
                <span class="card-value">backend/docs/</span>
            </div>
            <div class="card-item">
                <span class="card-label">Related APIs:</span>
                <span class="card-value">System-wide APIs</span>
            </div>
            <div class="card-item">
                <span class="card-label">Related Database Tables:</span>
                <span class="card-value">All Core Tables</span>
            </div>
            <div class="card-item">
                <span class="card-label">Dependencies:</span>
                <span class="card-value">Deployment Guide, API Documentation, AI Workflow Documentation</span>
            </div>
            <div class="card-item">
                <span class="card-label">Used By:</span>
                <span class="card-value">Future Development, Maintenance, Knowledge Transfer</span>
            </div>
        </div>
    </div>"""

new_card = """        <div class="metadata-block">
            <div class="metadata-title">Cross References</div>
            <div class="metadata-grid">
                <div><strong>Related Files:</strong> <code>backend/docs/</code></div>
                <div><strong>Related APIs:</strong> System-wide APIs</div>
                <div><strong>Related Database Tables:</strong> All Core Tables</div>
                <div><strong>Dependencies:</strong> Deployment Guide, API Documentation, AI Workflow Documentation</div>
                <div><strong>Used By:</strong> Future Development, Maintenance, Knowledge Transfer</div>
            </div>
        </div>
        </div>"""

if old_card in html:
    html = html.replace(old_card, new_card)
else:
    print("WARNING: Old card not found exactly as written. Using regex replacement.")
    # More robust replacement using regex in case of slight indentation differences
    regex_card = r'<div class="cross-reference-card">.*?</div>\s*</div>\s*</div>'
    html = re.sub(regex_card, new_card, html, flags=re.DOTALL)


# 2. Add Breadcrumb to JavaScript
# Search for: "known-limitations": ["Project Handover", "Known Limitations"],
js_breadcrumb_search = r'("known-limitations": \["Project Handover", "Known Limitations"\],)'
js_breadcrumb_insert = r'\1\n            "pending-work-current-development-status": ["Project Handover", "Pending Work & Current Development Status"],'

if '"known-limitations":' in html:
    html = re.sub(js_breadcrumb_search, js_breadcrumb_insert, html)
else:
    print("WARNING: JS breadcrumb location not found!")


with open(file_path, 'w', encoding='utf-8') as f:
    f.write(html)

print("HTML fixed successfully.")
