## README.md

# HTML Transformer

A lightweight, client-side HTML transformation tool designed for AstraZeneca's email marketing assets. Transform HTML files with various automated modifications including browser version handling, unsubscribe link management, and personalization token insertion.

## Features

### 🎯 Target-Specific Transformations
- **HCP (Healthcare Professional)** and **DTC (Direct to Consumer)** modes
- Different transformation logic based on target audience

### 🔗 Browser Version Handling
- Automatically locates anchor elements with "Browser version" text or title
- Updates href attributes with mirror page URL template
- Supports multiple matches in a single document

### 📧 Unsubscribe Link Management
- **DTC Mode**: Simple href replacement with consumer unsubscribe URL
- **HCP Mode**: Advanced template replacement system
  - Distinguishes between header and footer unsubscribe links
  - Customizable styling options (bold footer, no underline header)
  - Complete element replacement with AstraZeneca templates

### 👤 Personalization Handling
- Detects greeting paragraphs with name placeholders
- Configurable field inclusion (Title, First Name, Last Name)
- Target-specific token generation (recipient.* for HCP, consumer.* for DTC)
- Preserves original greeting text and formatting

### 🎨 User Interface
- **Drag & drop** or click-to-upload file selection
- **Side-by-side preview** (Original vs. Modified)
- **Real-time configuration** with instant validation
- **Zoom controls** for better preview readability
- **Undo functionality** to revert changes
- **Configuration presets** for common transformation sets

### 💾 Data Management
- **Client-side only** - no server uploads required
- **Local storage** for configuration presets
- **Secure processing** - files never leave your browser
- **Download support** for transformed HTML files

## Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No additional software installation required

### Installation
1. Download or clone this repository
2. No build process required - all files are ready to use

### Running the Application

#### Option 1: Direct File Opening
1. Double-click `index.html` to open in your default browser
2. Start uploading and transforming HTML files immediately

#### Option 2: Local Server (Recommended for development)
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8000

Then open `http://localhost:8000` in your browser.

#### Option 3: VS Code Live Server
1. Install the "Live Server" extension in VS Code
2. Right-click `index.html` and select "Open with Live Server"

## Usage Guide

### 1. Upload HTML File
- **Drag and drop** an HTML file onto the upload area, or
- **Click** the upload area to select a file from your computer
- Only `.html` and `.htm` files are accepted

### 2. Configure Transformations
- **Target Type**: Select HCP or DTC (required for other transformations)
- **Browser Version**: Enable to update browser version links
- **Unsubscribe Links**: Enable with optional HCP styling preferences
- **Personalization**: Enable with field selection (Title, First Name, Last Name)

### 3. Apply Changes
- Click **"Apply Transformations"** to process your HTML
- View results in the side-by-side preview
- Use **zoom controls** to inspect details

### 4. Review and Download
- Compare original and modified versions
- Use **"Undo Changes"** if needed
- **"Download HTML"** to save the transformed file

### 5. Save Time with Presets
- **"Save Preset"** to store frequently used configurations
- **"Load Preset"** to quickly apply saved settings

## Transformation Details

### Browser Version Links
**Target Elements:**
- Anchor tags (`<a>`) with text content "Browser version"
- Anchor tags with `title="Browser version"` attribute

**Transformation:**
```html
<!-- Before -->
<a href="old-url" title="Browser version">Browser version</a>

<!-- After -->
<a href="<%@ include view='MirrorPageUrl' %>" title="Browser version">Browser version</a>
```

### Unsubscribe Links - DTC Mode
**Target Elements:**
- Anchor tags with text content "Unsubscribe"
- Anchor tags with `title="Unsubscribe"` attribute

**Transformation:**
```html
<!-- Before -->
<a href="old-url">Unsubscribe</a>

<!-- After -->
<a href="<%@ include view='aznConsumerUnsubsUrlProgrameAstrazenecaUs' %>">Unsubscribe</a>
```

### Unsubscribe Links - HCP Mode
**Logic:**
- Last matched anchor = Footer unsubscribe
- All other matches = Header unsubscribes
- Complete element replacement with templates

**Templates:**
- **Header (normal)**: `<% var color='#000000'; var fsize='12'; %> <%@ include view='aznUsHcpUnsubscribeWithVariable' %>`
- **Header (no underline)**: `<% var color='#000000'; var fsize='12'; %> <%@ include view='aznUsHcpUnsubscribeWithVariablenNoUnderline' %>`
- **Footer (default)**: `<% var color='#000000'; var fsize='12'; %> <%@ include view='aznUsHcpUnsubscribeWithSmalluAndVariable' %>`
- **Footer (bold)**: `<% var color='#6D9DB9'; var fsize='12px'; %> <%@ include view='aznUsHcpUnsubscribeBoldWithSmalluAndVariable' %>`

### Personalization
**Target Pattern:**
```html
<p>Dear <span>[Name]</span>,</p>
```

**Field Options:**
- Title/Salutation
- First Name  
- Last Name

**Output Examples:**
```html
<!-- HCP with all fields -->
<p>Dear <%= recipient.salutation %> <%= recipient.firstName %> <%= recipient.lastName %>,</p>

<!-- DTC with first name only -->
<p>Hi <%= consumer.firstName %>,</p>
```

## File Structure

```
html-transformer/
├── index.html              # Main application interface
├── js/
│   ├── app.js             # Main application controller
│   ├── transforms.js      # Transformation logic
│   └── utils.js           # Helper utilities
├── css/
│   └── styles.css         # Custom styling
├── assets/
│   └── (optional logos/icons)
├── examples/
│   └── sample.html        # Test HTML file
└── README.md              # This file
```

## Browser Compatibility

### Supported Browsers
- **Chrome** 80+
- **Firefox** 75+
- **Safari** 13+
- **Edge** 80+

### Required Features
- ES6+ JavaScript support
- FileReader API
- DOMParser API
- Local Storage API
- CSS Grid and Flexbox

## Security & Privacy

### Client-Side Processing
- **No server uploads** - all processing happens in your browser
- **No data transmission** - files never leave your computer
- **No tracking** - no analytics or external connections
- **Local storage only** - presets saved locally in your browser

### File Handling
- Only HTML files accepted (`.html`, `.htm`)
- Content validation and sanitization
- Safe DOM manipulation practices
- No external script execution

## Troubleshooting

### Common Issues

**File won't upload:**
- Ensure file has `.html` or `.htm` extension
- Check file isn't corrupted or empty
- Try refreshing the page and uploading again

**Transformations not working:**
- Verify target type is selected
- Check that target elements exist in your HTML
- Review browser console for error messages

**Preview not displaying:**
- Check if HTML contains relative links to external resources
- Ensure HTML is well-formed and valid
- Try a different zoom level

**Download not working:**
- Check browser's download settings
- Ensure pop-ups aren't blocked
- Try using a different browser

### Getting Help
1. Check browser console for error messages
2. Verify HTML file structure matches expected patterns
3. Test with the provided sample HTML file
4. Clear browser cache and try again

## Development

### Local Development Setup
1. Clone the repository
2. Use VS Code with Live Server extension for best experience
3. No build process or dependencies required

### Code Structure
- **Modular design** with separated concerns
- **ES6+ JavaScript** with modern browser APIs
- **Tailwind CSS** for styling via CDN
- **Vanilla JavaScript** - no frameworks required

### Contributing
This is an internal AstraZeneca tool. For modifications or enhancements, please follow internal development guidelines.

## Version History

### v1.0.0 (Current)
- Initial release with core transformation features
- Support for HCP/DTC target types
- Browser version, unsubscribe, and personalization handling
- Side-by-side preview with zoom controls
- Configuration presets and undo functionality

## License

Internal AstraZeneca tool - see LICENSE file for details.

---

**AstraZeneca HTML Transformer** - Streamlining email asset transformations with precision and ease.