// String-based HTML Transformer Application

/**
 * String-based Application state
 */
const StringAppState = {
    originalHtmlContent: null,
    modifiedHtmlContent: null,
    uploadedFile: null,
    currentConfig: {},
    undoStack: [],
    isProcessing: false
};

/**
 * String-based HTML Transformer App
 */
class StringHTMLTransformerApp {
    constructor() {
        this.initializeEventListeners();
        this.initializeUI();
    }

    /**
     * Initialize all event listeners
     */
    initializeEventListeners() {
        // File upload events
        this.setupFileUpload();

        // Configuration events
        this.setupConfigurationEvents();

        // Action button events
        this.setupActionButtons();

        // Preview events
        this.setupPreviewEvents();

        // Preset events
        this.setupPresetEvents();
    }

    /**
     * Setup file upload functionality
     */
    setupFileUpload() {
        const dropZone = document.getElementById('drop-zone');
        const fileInput = document.getElementById('file-input');

        // Click to upload
        dropZone.addEventListener('click', () => {
            fileInput.click();
        });

        // File input change
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileUpload(e.target.files[0]);
            }
        });

        // Drag and drop events
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('border-blue-400', 'bg-blue-50');
        });

        dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dropZone.classList.remove('border-blue-400', 'bg-blue-50');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('border-blue-400', 'bg-blue-50');

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileUpload(files[0]);
            }
        });
    }

    /**
     * Handle file upload
     */
    async handleFileUpload(file) {
        // Validate file type
        if (!FileUtils.isValidHtmlFile(file)) {
            NotificationUtils.show('Please select a valid HTML file (.html or .htm)', 'error');
            return;
        }

        // Show progress
        this.showUploadProgress();

        try {
            // Read file content
            const content = await FileUtils.readFileAsText(file);

            // Store in app state
            StringAppState.originalHtmlContent = content;
            StringAppState.modifiedHtmlContent = content;
            StringAppState.uploadedFile = file;
            StringAppState.undoStack = [];

            // Show file info
            this.showFileInfo(file);

            // Show configuration section
            this.showConfigurationSection();

            // Show initial preview
            this.showPreviewSection();
            this.updatePreview();

            NotificationUtils.show('File uploaded successfully', 'success');

        } catch (error) {
            NotificationUtils.show('Failed to read file: ' + error.message, 'error');
        } finally {
            this.hideUploadProgress();
        }
    }

    /**
     * Setup configuration event listeners
     */
    setupConfigurationEvents() {
        // Enable/disable target type
        const enableTarget = document.getElementById('enable-target');
        const targetType = document.getElementById('target-type');

        enableTarget.addEventListener('change', (e) => {
            targetType.disabled = !e.target.checked;
            this.updateConfigState();
        });

        targetType.addEventListener('change', () => {
            this.updateConfigState();
            this.updateUnsubscribeOptions();
        });

        // Browser version handling
        document.getElementById('enable-browser').addEventListener('change', () => {
            this.updateConfigState();
        });

        // Unsubscribe handling
        const enableUnsubscribe = document.getElementById('enable-unsubscribe');
        const unsubscribeOptions = document.getElementById('unsubscribe-options');

        enableUnsubscribe.addEventListener('change', (e) => {
            unsubscribeOptions.classList.toggle('hidden', !e.target.checked);
            this.updateConfigState();
            this.updateUnsubscribeOptions();
        });

        // Unsubscribe options
        document.getElementById('bold-footer').addEventListener('change', () => {
            this.updateConfigState();
        });

        document.getElementById('no-underline-header').addEventListener('change', () => {
            this.updateConfigState();
        });

        // Personalization handling
        const enablePersonalization = document.getElementById('enable-personalization');
        const personalizationOptions = document.getElementById('personalization-options');

        enablePersonalization.addEventListener('change', (e) => {
            personalizationOptions.classList.toggle('hidden', !e.target.checked);
            this.updateConfigState();
        });

        // Personalization options
        document.getElementById('include-title').addEventListener('change', () => {
            this.updateConfigState();
        });

        document.getElementById('include-firstname').addEventListener('change', () => {
            this.updateConfigState();
        });

        document.getElementById('include-lastname').addEventListener('change', () => {
            this.updateConfigState();
        });
    }

    /**
     * Setup action button events
     */
    setupActionButtons() {
        // Apply transformations
        document.getElementById('apply-btn').addEventListener('click', () => {
            this.applyStringTransformations();
        });

        // Reset all configurations
        document.getElementById('reset-btn').addEventListener('click', () => {
            this.resetConfiguration();
        });

        // Undo changes
        document.getElementById('undo-btn').addEventListener('click', () => {
            this.undoChanges();
        });

        // Download HTML
        document.getElementById('download-btn').addEventListener('click', () => {
            this.downloadHTML();
        });
    }

    /**
     * Setup preview events
     */
    setupPreviewEvents() {
        // Zoom level change
        document.getElementById('zoom-level').addEventListener('change', (e) => {
            this.updatePreviewZoom(e.target.value);
        });
    }

    /**
     * Setup preset events
     */
    setupPresetEvents() {
        // Save preset
        document.getElementById('preset-save').addEventListener('click', () => {
            this.savePreset();
        });

        // Load preset
        document.getElementById('preset-load').addEventListener('click', () => {
            this.loadPreset();
        });
    }

    /**
     * Initialize UI state
     */
    initializeUI() {
        // Hide sections initially
        document.getElementById('config-section').classList.add('hidden');
        document.getElementById('preview-section').classList.add('hidden');

        // Disable apply button initially
        document.getElementById('apply-btn').disabled = true;

        // Add indicator that we're in string mode
        const title = document.querySelector('h1');
        title.textContent = 'AZ HTML Configuration Tool';
    }

    /**
     * Show upload progress
     */
    showUploadProgress() {
        document.getElementById('upload-progress').classList.remove('hidden');
    }

    /**
     * Hide upload progress
     */
    hideUploadProgress() {
        document.getElementById('upload-progress').classList.add('hidden');
    }

    /**
     * Show file information
     */
    showFileInfo(file) {
        const fileInfo = document.getElementById('file-info');
        const fileName = document.getElementById('file-name');
        const fileSize = document.getElementById('file-size');

        fileName.textContent = file.name;
        fileSize.textContent = `(${FileUtils.formatFileSize(file.size)})`;

        fileInfo.classList.remove('hidden');
    }

    /**
     * Show configuration section
     */
    showConfigurationSection() {
        document.getElementById('config-section').classList.remove('hidden');
    }

    /**
     * Show preview section
     */
    showPreviewSection() {
        document.getElementById('preview-section').classList.remove('hidden');
    }

    /**
     * Update configuration state
     */
    updateConfigState() {
        const config = {
            enableTarget: document.getElementById('enable-target').checked,
            targetType: document.getElementById('target-type').value,
            enableBrowser: document.getElementById('enable-browser').checked,
            enableUnsubscribe: document.getElementById('enable-unsubscribe').checked,
            boldFooter: document.getElementById('bold-footer').checked,
            noUnderlineHeader: document.getElementById('no-underline-header').checked,
            enablePersonalization: document.getElementById('enable-personalization').checked,
            includeTitle: document.getElementById('include-title').checked,
            includeFirstname: document.getElementById('include-firstname').checked,
            includeLastname: document.getElementById('include-lastname').checked
        };

        StringAppState.currentConfig = config;

        // Enable/disable apply button based on configuration
        this.updateApplyButton();
    }

    /**
     * Update unsubscribe options visibility based on target type
     */
    updateUnsubscribeOptions() {
        const targetType = document.getElementById('target-type').value;
        const boldFooter = document.getElementById('bold-footer').parentElement;
        const noUnderlineHeader = document.getElementById('no-underline-header').parentElement;

        if (targetType === 'HCP') {
            boldFooter.classList.remove('hidden');
            noUnderlineHeader.classList.remove('hidden');
        } else {
            boldFooter.classList.add('hidden');
            noUnderlineHeader.classList.add('hidden');
        }
    }

    /**
     * Update apply button state
     */
    updateApplyButton() {
        const config = StringAppState.currentConfig;
        const applyBtn = document.getElementById('apply-btn');

        // Check if at least one transformation is selected
        const hasSelection = (
            (config.enableTarget && config.enableBrowser) ||
            (config.enableTarget && config.enableUnsubscribe) ||
            (config.enableTarget && config.enablePersonalization &&
                (config.includeTitle || config.includeFirstname || config.includeLastname))
        );

        applyBtn.disabled = !hasSelection || StringAppState.isProcessing;
    }

    /**
     * Apply string-based transformations
     */
    async applyStringTransformations() {
        if (StringAppState.isProcessing) return;

        const config = StringAppState.currentConfig;

        // Validate configuration
        if (!this.validateConfiguration(config)) {
            return;
        }

        StringAppState.isProcessing = true;
        this.showProcessingState();

        try {
            // Save current state to undo stack
            StringAppState.undoStack.push({
                html: StringAppState.modifiedHtmlContent,
                config: {
                    ...config
                }
            });

            let modifiedHTML = StringAppState.modifiedHtmlContent;
            const allResults = {
                success: true,
                messages: [],
                changes: []
            };

            // Apply browser version transformation
            if (config.enableTarget && config.enableBrowser) {
                console.log('Applying browser version transformation...');
                const result = StringTransforms.transformBrowserVersion(modifiedHTML);
                modifiedHTML = result.html;
                allResults.messages.push(...result.messages);
                allResults.changes.push(...result.changes);
            }

            // Apply unsubscribe transformation
            if (config.enableTarget && config.enableUnsubscribe) {
                console.log(`Applying ${config.targetType} unsubscribe transformation...`);
                const result = StringTransforms.transformUnsubscribe(modifiedHTML, config);
                modifiedHTML = result.html;
                allResults.messages.push(...result.messages);
                allResults.changes.push(...result.changes);
            }

            // Apply personalization transformation
            if (config.enableTarget && config.enablePersonalization) {
                console.log('Applying personalization transformation...');
                const result = StringTransforms.transformPersonalization(modifiedHTML, config);
                modifiedHTML = result.html;
                allResults.messages.push(...result.messages);
                allResults.changes.push(...result.changes);
            }

            // Update modified content
            StringAppState.modifiedHtmlContent = modifiedHTML;

            // Update preview
            this.updatePreview();

            // Show undo button
            document.getElementById('undo-btn').classList.remove('hidden');

            // Show result messages
            allResults.messages.forEach(message => {
                NotificationUtils.show(message.text, message.type);
            });

            if (allResults.messages.length > 0) {
                NotificationUtils.show('Transformations completed!', 'success');
            }

        } catch (error) {
            NotificationUtils.show('Failed to apply transformations: ' + error.message, 'error');
            console.error('String transformation error:', error);
        } finally {
            StringAppState.isProcessing = false;
            this.hideProcessingState();
        }
    }

    /**
     * Validate configuration before applying
     */
    validateConfiguration(config) {
        // Check if target type is enabled for other transformations
        if ((config.enableBrowser || config.enableUnsubscribe || config.enablePersonalization) && !config.enableTarget) {
            NotificationUtils.show('Target type must be selected for Configuring', 'error');
            return false;
        }

        // Check if at least one transformation is selected
        const hasTransformation = config.enableBrowser || config.enableUnsubscribe || config.enablePersonalization;

        if (!hasTransformation) {
            NotificationUtils.show('Please select at least one configuration option', 'error');
            return false;
        }

        // Check personalization fields
        if (config.enablePersonalization) {
            const hasPersonalizationField = config.includeTitle || config.includeFirstname || config.includeLastname;
            if (!hasPersonalizationField) {
                NotificationUtils.show('Please select at least one personalization field', 'error');
                return false;
            }
        }

        return true;
    }

    /**
     * Reset all configurations
     */
    resetConfiguration() {
        // Reset all checkboxes and selects
        document.getElementById('enable-target').checked = false;
        document.getElementById('target-type').disabled = true;
        document.getElementById('target-type').value = 'HCP';
        document.getElementById('enable-browser').checked = false;
        document.getElementById('enable-unsubscribe').checked = false;
        document.getElementById('enable-personalization').checked = false;

        // Hide option panels
        document.getElementById('unsubscribe-options').classList.add('hidden');
        document.getElementById('personalization-options').classList.add('hidden');

        // Reset sub-options
        document.getElementById('bold-footer').checked = false;
        document.getElementById('no-underline-header').checked = false;
        document.getElementById('include-title').checked = false;
        document.getElementById('include-firstname').checked = false;
        document.getElementById('include-lastname').checked = false;

        // Reset modified content to original
        if (StringAppState.originalHtmlContent) {
            StringAppState.modifiedHtmlContent = StringAppState.originalHtmlContent;
            StringAppState.undoStack = [];
            this.updatePreview();
            document.getElementById('undo-btn').classList.add('hidden');
        }

        // Update state
        this.updateConfigState();

        NotificationUtils.show('Configuration reset', 'info');
    }

    /**
     * Undo last changes
     */
    undoChanges() {
        if (StringAppState.undoStack.length === 0) {
            NotificationUtils.show('Nothing to undo', 'info');
            return;
        }

        // Restore previous state
        const previousState = StringAppState.undoStack.pop();
        StringAppState.modifiedHtmlContent = previousState.html;

        // Update preview
        this.updatePreview();

        // Hide undo button if no more undo states
        if (StringAppState.undoStack.length === 0) {
            document.getElementById('undo-btn').classList.add('hidden');
        }

        NotificationUtils.show('Changes undone', 'info');
    }

    /**
     * Update preview iframes
     */
    updatePreview() {
        const originalPreview = document.getElementById('original-preview');
        const modifiedPreview = document.getElementById('modified-preview');

        if (StringAppState.originalHtmlContent) {
            originalPreview.srcdoc = StringAppState.originalHtmlContent;
        }

        if (StringAppState.modifiedHtmlContent) {
            modifiedPreview.srcdoc = StringAppState.modifiedHtmlContent;
        }
    }

    /**
     * Update preview zoom level
     */
    updatePreviewZoom(zoomLevel) {
        const originalPreview = document.getElementById('original-preview');
        const modifiedPreview = document.getElementById('modified-preview');

        const zoomStyle = `transform: scale(${zoomLevel}); transform-origin: top left; width: ${100 / zoomLevel}%; height: ${100 / zoomLevel}%;`;

        originalPreview.style.cssText = zoomStyle;
        modifiedPreview.style.cssText = zoomStyle;
    }

    /**
     * Show processing state
     */
    showProcessingState() {
        const applyBtn = document.getElementById('apply-btn');
        applyBtn.disabled = true;
        applyBtn.innerHTML = `
            <div class="flex items-center">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing (String)...
            </div>
        `;
    }

    /**
     * Hide processing state
     */
    hideProcessingState() {
        const applyBtn = document.getElementById('apply-btn');
        applyBtn.innerHTML = 'Configuration options';
        this.updateApplyButton();
    }

    /**
     * Download transformed HTML
     */
    downloadHTML() {
        if (!StringAppState.modifiedHtmlContent) {
            NotificationUtils.show('No content to download', 'error');
            return;
        }

        try {
            const originalName = StringAppState.uploadedFile ? StringAppState.uploadedFile.name : 'transformed.html';
            const fileName = originalName.replace(/\.(html|htm)$/i, '_string_transformed.$1');

            DownloadUtils.downloadHTML(StringAppState.modifiedHtmlContent, fileName);
            NotificationUtils.show('File downloaded successfully', 'success');

        } catch (error) {
            NotificationUtils.show('Failed to download file: ' + error.message, 'error');
        }
    }

    /**
     * Save current configuration as preset
     */
    savePreset() {
        const presetName = prompt('Enter preset name:');
        if (!presetName) return;

        const config = StringAppState.currentConfig;
        const success = StorageUtils.savePreset(presetName + '_string', config);

        if (success) {
            NotificationUtils.show(`Preset "${presetName}" saved`, 'success');
        } else {
            NotificationUtils.show('Failed to save preset', 'error');
        }
    }

    /**
     * Load configuration preset
     */
    loadPreset() {
        const presets = StorageUtils.getPresets();
        const stringPresets = Object.keys(presets).filter(name => name.endsWith('_string'));

        if (stringPresets.length === 0) {
            NotificationUtils.show('No presets available', 'info');
            return;
        }

        const presetName = prompt(`Available presets:\n${stringPresets.join('\n')}\n\nEnter preset name to load:`);
        if (!presetName) return;

        const fullPresetName = presetName.endsWith('_string') ? presetName : presetName + '_string';
        const preset = StorageUtils.loadPreset(fullPresetName);

        if (preset) {
            this.applyConfigurationFromPreset(preset);
            NotificationUtils.show(`Preset "${presetName}" loaded`, 'success');
        } else {
            NotificationUtils.show('Preset not found', 'error');
        }
    }

    /**
     * Apply configuration from preset
     */
    applyConfigurationFromPreset(preset) {
        // Apply all configuration values
        document.getElementById('enable-target').checked = preset.enableTarget || false;
        document.getElementById('target-type').value = preset.targetType || 'HCP';
        document.getElementById('target-type').disabled = !preset.enableTarget;
        document.getElementById('enable-browser').checked = preset.enableBrowser || false;
        document.getElementById('enable-unsubscribe').checked = preset.enableUnsubscribe || false;
        document.getElementById('enable-personalization').checked = preset.enablePersonalization || false;

        // Sub-options
        document.getElementById('bold-footer').checked = preset.boldFooter || false;
        document.getElementById('no-underline-header').checked = preset.noUnderlineHeader || false;
        document.getElementById('include-title').checked = preset.includeTitle || false;
        document.getElementById('include-firstname').checked = preset.includeFirstname || false;
        document.getElementById('include-lastname').checked = preset.includeLastname || false;

        // Show/hide option panels
        document.getElementById('unsubscribe-options').classList.toggle('hidden', !preset.enableUnsubscribe);
        document.getElementById('personalization-options').classList.toggle('hidden', !preset.enablePersonalization);

        // Update state
        this.updateConfigState();
        this.updateUnsubscribeOptions();
    }
}

// Initialize the string-based application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new StringHTMLTransformerApp();
});