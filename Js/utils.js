// Utility functions for HTML Transformer

/**
 * File validation utilities
 */
const FileUtils = {
    /**
     * Validate if file is HTML
     */
    isValidHtmlFile(file) {
        const validExtensions = ['.html', '.htm'];
        const fileName = file.name.toLowerCase();
        return validExtensions.some(ext => fileName.endsWith(ext));
    },

    /**
     * Format file size for display
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    /**
     * Read file as text
     */
    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }
};

/**
 * DOM manipulation utilities
 */
const DOMUtils = {
    /**
     * Parse HTML string into document
     */
    parseHTML(htmlString) {
        const parser = new DOMParser();
        return parser.parseFromString(htmlString, 'text/html');
    },

    /**
     * Serialize document back to HTML string (preserving template tags)
     */
    serializeHTML(document) {
        // Get the raw HTML and avoid double-encoding
        let htmlString = document.documentElement.outerHTML;

        // Decode any encoded template tags
        htmlString = htmlString
            .replace(/&lt;%/g, '<%')
            .replace(/%&gt;/g, '%>')
            .replace(/&lt;=/g, '<=')
            .replace(/=&gt;/g, '=>');

        return '<!DOCTYPE html>\n' + htmlString;
    },

    /**
     * Create a deep clone of HTML content
     */
    cloneHTML(htmlString) {
        return htmlString;
    },

    /**
     * Find elements by text content (case-insensitive, whitespace-tolerant)
     */
    findElementsByText(document, tagName, searchText) {
        const elements = Array.from(document.querySelectorAll(tagName));
        const normalizedSearch = searchText.toLowerCase().trim();

        return elements.filter(el => {
            // Skip elements inside script or style tags
            if (this.isInsideIgnoredTag(el)) return false;

            const textContent = el.textContent.toLowerCase().trim();
            return textContent === normalizedSearch;
        });
    },

    /**
     * Find elements by title attribute
     */
    findElementsByTitle(document, tagName, titleText) {
        const elements = Array.from(document.querySelectorAll(tagName));
        const normalizedTitle = titleText.toLowerCase().trim();

        return elements.filter(el => {
            if (this.isInsideIgnoredTag(el)) return false;

            const title = (el.getAttribute('title') || '').toLowerCase().trim();
            return title === normalizedTitle;
        });
    },

    /**
     * Check if element is inside script or style tags
     */
    isInsideIgnoredTag(element) {
        let parent = element.parentElement;
        while (parent) {
            if (['SCRIPT', 'STYLE'].includes(parent.tagName)) {
                return true;
            }
            parent = parent.parentElement;
        }
        return false;
    },

    /**
     * Replace element with HTML string
     */
    replaceElementWithHTML(element, htmlString) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlString;

        // Replace with all child nodes
        const fragment = document.createDocumentFragment();
        while (tempDiv.firstChild) {
            fragment.appendChild(tempDiv.firstChild);
        }

        element.parentNode.replaceChild(fragment, element);
    }
};

/**
 * Notification system
 */
const NotificationUtils = {
    /**
     * Show notification
     */
    show(message, type = 'info', duration = 5000) {
        const container = document.getElementById('notifications');
        const notification = this.createNotification(message, type);

        container.appendChild(notification);

        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => {
                this.remove(notification);
            }, duration);
        }

        return notification;
    },

    /**
     * Create notification element
     */
    createNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${this.getTypeClasses(type)} transform transition-all duration-300 translate-x-full`;

        notification.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center">
                    ${this.getTypeIcon(type)}
                    <span class="ml-2 text-sm font-medium">${message}</span>
                </div>
                <button class="ml-4 text-gray-400 hover:text-gray-600" onclick="NotificationUtils.remove(this.parentElement.parentElement)">
                    <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    </svg>
                </button>
            </div>
        `;

        // Trigger animation
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 10);

        return notification;
    },

    /**
     * Remove notification
     */
    remove(notification) {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    },

    /**
     * Get CSS classes for notification type
     */
    getTypeClasses(type) {
        const classes = {
            success: 'bg-green-50 border border-green-200 text-green-800',
            error: 'bg-red-50 border border-red-200 text-red-800',
            warning: 'bg-yellow-50 border border-yellow-200 text-yellow-800',
            info: 'bg-blue-50 border border-blue-200 text-blue-800'
        };
        return `${classes[type] || classes.info} rounded-lg shadow-sm p-3 max-w-sm`;
    },

    /**
     * Get icon for notification type
     */
    getTypeIcon(type) {
        const icons = {
            success: '<svg class="h-4 w-4 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>',
            error: '<svg class="h-4 w-4 text-red-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>',
            warning: '<svg class="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>',
            info: '<svg class="h-4 w-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>'
        };
        return icons[type] || icons.info;
    }
};

/**
 * Local storage utilities for presets
 */
const StorageUtils = {
    /**
     * Save configuration preset
     */
    savePreset(name, config) {
        try {
            const presets = this.getPresets();
            presets[name] = {
                ...config,
                savedAt: new Date().toISOString()
            };
            localStorage.setItem('htmlTransformerPresets', JSON.stringify(presets));
            return true;
        } catch (error) {
            console.error('Failed to save preset:', error);
            return false;
        }
    },

    /**
     * Load configuration preset
     */
    loadPreset(name) {
        try {
            const presets = this.getPresets();
            return presets[name] || null;
        } catch (error) {
            console.error('Failed to load preset:', error);
            return null;
        }
    },

    /**
     * Get all presets
     */
    getPresets() {
        try {
            const stored = localStorage.getItem('htmlTransformerPresets');
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            console.error('Failed to get presets:', error);
            return {};
        }
    },

    /**
     * Delete preset
     */
    deletePreset(name) {
        try {
            const presets = this.getPresets();
            delete presets[name];
            localStorage.setItem('htmlTransformerPresets', JSON.stringify(presets));
            return true;
        } catch (error) {
            console.error('Failed to delete preset:', error);
            return false;
        }
    }
};

/**
 * Download utilities
 */
const DownloadUtils = {
    /**
     * Download HTML content as file
     */
    downloadHTML(content, filename = 'transformed.html') {
        const blob = new Blob([content], {
            type: 'text/html;charset=utf-8'
        });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up the URL object
        URL.revokeObjectURL(url);
    }
};