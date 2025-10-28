import re

html = '''<a href="#" target="_blank"
                rel="noopener" title="Browser version"
                style="color: rgb(0, 104, 165); text-decoration: underline;">Browser
                version</a>'''

pattern = r'<a\s+([^>]+)>(.*?)</a>'
matches = re.findall(pattern, html, re.IGNORECASE | re.DOTALL)

for i, (attributes, content) in enumerate(matches, 1):
    print(f"Match {i}:")
    print(f"  Attributes: {attributes}")
    print(f"  Content: '{content}'")  # Note the quotes to see whitespace
    
    # Your condition check:
    if re.search(r'Browser\s+version', content, re.IGNORECASE):
        print("  ✓ Matches 'Browser\\s+version' pattern!")
    print()