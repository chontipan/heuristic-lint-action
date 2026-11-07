with open(r"C:\Users\Chontipan-PC\.gemini\antigravity\brain\b21f9d40-ea82-4a4f-b61d-89629eb13dfb\scratch\rewrite_master_manuscript.py", "r", encoding="utf-8") as f:
    text = f.read()

import re
p = text.find('5.2. Multi-Stage Triangulation and Defect Synthesis Workflow')
print(text[p:p+2000])
