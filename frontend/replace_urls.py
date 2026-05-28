import os
import glob

base_dir = r"C:\Users\Utilizador\Desktop\PROJETO WEB TEST\frontend\src"
files = glob.glob(os.path.join(base_dir, "**", "*.jsx"), recursive=True)

old_url = "http://localhost:8000"
new_url = "https://manutweb-app.onrender.com"

for filepath in files:
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    if old_url in content:
        content = content.replace(old_url, new_url)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated {filepath}")
