import re


def extract_links_from_file(file_path):
    try:
        # Read the HTML file
        with open(file_path, 'r', encoding='utf-8') as file:
            html_string = file.read()

        # Pattern to match <a> tags with attributes and content
        pattern = r'<a\s+([^>]+)>(.*?)</a>'

        # Find all matches
        matches = re.findall(pattern, html_string, re.IGNORECASE | re.DOTALL)

        # Print each match
        c = 0
        for i, (attributes, content) in enumerate(matches, 1):
            # print(f'{i}:')
            # print(content.lower().strip())
            # print()
            if re.search(r'Browser\s+Version', content, re.IGNORECASE):
                c += 1
                print(f"Match {c}:")
                print(f"  Attributes: {attributes}")
                print(f"  Content: {content}")
                print()

    except FileNotFoundError:
        print(f"Error: File '{file_path}' not found.")
    except Exception as e:
        print(f"Error reading file: {e}")

# Usage examples:
# For Windows: extract_links_from_file(r"C:\path\to\your\file.html")
# For Mac/Linux: extract_links_from_file("/path/to/your/file.html")
# Relative path: extract_links_from_file("./index.html")


# Test run
options = {1: r"../Examples/US-101488.html",
           2: r"../Examples/US-102341-AFD.html"}
# Replace with your actual file path
file_path = options[int(input("Enter file option (1/2): "))]
extract_links_from_file(file_path)
