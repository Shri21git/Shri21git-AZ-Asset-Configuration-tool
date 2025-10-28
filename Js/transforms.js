// Transformation functions for HTML content

/**
 * Main transformation controller
 */
const Transforms = {
    /**
     * Apply all enabled transformations
     */
    applyTransformations(htmlContent, config) {
        let modifiedHTML = htmlContent;
        const results = {
            success: true,
            messages: [],
            changes: []
        };

        try {
            // Parse HTML once for all transformations
            const doc = DOMUtils.parseHTML(modifiedHTML);

            // Apply each transformation if enabled
            if (config.enableTarget && config.enableBrowser) {
                const browserResult = this.transformBrowserVersion(doc);
                results.messages.push(...browserResult.messages);
                results.changes.push(...browserResult.changes);
            }

            if (config.enableTarget && config.enableUnsubscribe) {
                const unsubResult = this.transformUnsubscribeLinks(doc, config);
                results.messages.push(...unsubResult.messages);
                results.changes.push(...unsubResult.changes);
            }

            if (config.enableTarget && config.enablePersonalization) {
                const personalResult = this.transformPersonalization(doc, config);
                results.messages.push(...personalResult.messages);
                results.changes.push(...personalResult.changes);
            }

            // Serialize back to HTML
            modifiedHTML = DOMUtils.serializeHTML(doc);

        } catch (error) {
            results.success = false;
            results.messages.push({
                type: 'error',
                text: `Transformation failed: ${error.message}`
            });
        }

        return {
            ...results,
            html: modifiedHTML
        };
    },

    /**
     * Transform browser version links
     */
    transformBrowserVersion(doc) {
        const results = {
            messages: [],
            changes: []
        };

        try {
            // Find anchors by text content
            const textMatches = DOMUtils.findElementsByText(doc, 'a', 'Browser version');

            // Find anchors by title attribute
            const titleMatches = DOMUtils.findElementsByTitle(doc, 'a', 'Browser version');

            // Combine and deduplicate
            const allMatches = [...new Set([...textMatches, ...titleMatches])];

            if (allMatches.length === 0) {
                results.messages.push({
                    type: 'info',
                    text: 'No browser version links found'
                });
                return results;
            }

            // Transform each match
            allMatches.forEach((anchor, index) => {
                const oldHref = anchor.getAttribute('href') || '';
                // Use direct assignment instead of setAttribute to avoid encoding
                anchor.href = "<%@ include view='MirrorPageUrl' %>";

                results.changes.push({
                    type: 'browser-version',
                    element: `Anchor ${index + 1}`,
                    oldValue: oldHref,
                    newValue: "<%@ include view='MirrorPageUrl' %>"
                });
            });

            results.messages.push({
                type: 'success',
                text: `Browser version links updated (${allMatches.length} found)`
            });

        } catch (error) {
            results.messages.push({
                type: 'error',
                text: `Browser version transformation failed: ${error.message}`
            });
        }

        return results;
    },

    /**
     * Transform unsubscribe links
     */
    transformUnsubscribeLinks(doc, config) {
        const results = {
            messages: [],
            changes: []
        };

        try {
            // Find anchors by text content
            const textMatches = DOMUtils.findElementsByText(doc, 'a', 'Unsubscribe');

            // Find anchors by title attribute  
            const titleMatches = DOMUtils.findElementsByTitle(doc, 'a', 'Unsubscribe');

            // Combine, prioritize title matches, and deduplicate
            const titleElements = new Set(titleMatches);
            const allMatches = [
                ...titleMatches,
                ...textMatches.filter(el => !titleElements.has(el))
            ];

            if (allMatches.length === 0) {
                results.messages.push({
                    type: 'info',
                    text: 'No unsubscribe links found'
                });
                return results;
            }

            if (config.targetType === 'DTC') {
                // DTC: Simple href replacement
                allMatches.forEach((anchor, index) => {
                    const oldHref = anchor.getAttribute('href') || '';
                    // Use direct assignment to avoid encoding
                    anchor.href = "<%@ include view='aznConsumerUnsubsUrlProgrameAstrazenecaUs' %>";

                    results.changes.push({
                        type: 'unsubscribe-dtc',
                        element: `Anchor ${index + 1}`,
                        oldValue: oldHref,
                        newValue: "<%@ include view='aznConsumerUnsubsUrlProgrameAstrazenecaUs' %>"
                    });
                });

                results.messages.push({
                    type: 'success',
                    text: `DTC unsubscribe links updated (${allMatches.length} found)`
                });

            } else if (config.targetType === 'HCP') {
                // HCP: Complex replacement with templates
                this.transformHCPUnsubscribe(doc, allMatches, config, results);
            }

        } catch (error) {
            results.messages.push({
                type: 'error',
                text: `Unsubscribe transformation failed: ${error.message}`
            });
        }

        return results;
    },

    /**
     * Transform HCP unsubscribe links with templates
     */
    transformHCPUnsubscribe(doc, matches, config, results) {
        if (matches.length === 0) return;

        // Determine header and footer anchors
        const footerAnchor = matches[matches.length - 1]; // Last one is footer
        const headerAnchors = matches.slice(0, -1); // All others are headers

        // If only one match, treat as footer
        if (matches.length === 1) {
            this.replaceWithFooterTemplate(footerAnchor, config, results);
        } else {
            // Replace header anchors
            headerAnchors.forEach((anchor, index) => {
                this.replaceWithHeaderTemplate(anchor, config, results, index + 1);
            });

            // Replace footer anchor
            this.replaceWithFooterTemplate(footerAnchor, config, results);
        }

        results.messages.push({
            type: 'success',
            text: `HCP unsubscribe links transformed (${matches.length} found: ${headerAnchors.length} header, 1 footer)`
        });
    },

    /**
     * Replace anchor with header template
     */
    replaceWithHeaderTemplate(anchor, config, results, index) {
        const template = config.noUnderlineHeader ?
            "<% var color='#000000'; var fsize='12'; %> <%@ include view='aznUsHcpUnsubscribeWithVariablenNoUnderline' %>" :
            "<% var color='#000000'; var fsize='12'; %> <%@ include view='aznUsHcpUnsubscribeWithVariable' %>";

        const oldHTML = anchor.outerHTML;

        // Create text node to avoid HTML encoding
        const textNode = document.createTextNode(template);
        anchor.parentNode.replaceChild(textNode, anchor);

        results.changes.push({
            type: 'unsubscribe-hcp-header',
            element: `Header ${index}`,
            oldValue: oldHTML,
            newValue: template
        });
    },

    /**
     * Replace anchor with footer template
     */
    replaceWithFooterTemplate(anchor, config, results) {
        const template = config.boldFooter ?
            "<% var color='#6D9DB9'; var fsize='12px'; %> <%@ include view='aznUsHcpUnsubscribeBoldWithSmalluAndVariable' %>" :
            "<% var color='#000000'; var fsize='12'; %> <%@ include view='aznUsHcpUnsubscribeWithSmalluAndVariable' %>";

        const oldHTML = anchor.outerHTML;

        // Create text node to avoid HTML encoding
        const textNode = document.createTextNode(template);
        anchor.parentNode.replaceChild(textNode, anchor);

        results.changes.push({
            type: 'unsubscribe-hcp-footer',
            element: 'Footer',
            oldValue: oldHTML,
            newValue: template
        });
    },

    /**
     * Transform personalization greetings
     */
    transformPersonalization(doc, config) {
        const results = {
            messages: [],
            changes: []
        };

        try {
            // Find greeting paragraphs with span-wrapped names
            const greetingPattern = this.findGreetingParagraphs(doc);

            if (greetingPattern.length === 0) {
                results.messages.push({
                    type: 'info',
                    text: 'No personalization greeting detected'
                });
                return results;
            }

            // Transform each greeting
            greetingPattern.forEach((match, index) => {
                const transformResult = this.transformGreeting(match, config);
                if (transformResult.success) {
                    results.changes.push({
                        type: 'personalization',
                        element: `Greeting ${index + 1}`,
                        oldValue: transformResult.oldHTML,
                        newValue: transformResult.newHTML
                    });
                }
            });

            results.messages.push({
                type: 'success',
                text: `Personalization greetings updated (${greetingPattern.length} found)`
            });

        } catch (error) {
            results.messages.push({
                type: 'error',
                text: `Personalization transformation failed: ${error.message}`
            });
        }

        return results;
    },

    /**
     * Find greeting paragraphs with pattern: <p>Greeting <span>[Name]</span>,</p>
     */
    findGreetingParagraphs(doc) {
        const paragraphs = doc.querySelectorAll('p');
        const matches = [];

        paragraphs.forEach(p => {
            // Skip if inside script or style
            if (DOMUtils.isInsideIgnoredTag(p)) return;

            const spans = p.querySelectorAll('span');
            spans.forEach(span => {
                // Check if span contains placeholder-like content
                const spanText = span.textContent.trim();
                if (this.isNamePlaceholder(spanText)) {
                    // Check if paragraph starts with greeting
                    const fullText = p.textContent.trim();
                    const greetingMatch = this.extractGreeting(fullText);

                    if (greetingMatch) {
                        matches.push({
                            paragraph: p,
                            span: span,
                            greeting: greetingMatch.greeting,
                            fullText: fullText
                        });
                    }
                }
            });
        });

        return matches;
    },

    /**
     * Check if text looks like a name placeholder
     */
    isNamePlaceholder(text) {
        // Look for patterns like [Name], {Name}, Name, etc.
        const patterns = [
            /^\[.*\]$/, // [Name]
            /^\{.*\}$/, // {Name}
            /^[A-Z][a-z]+$/, // Name (capitalized word)
            /^\[.*Name.*\]$/i, // [FirstName], [LastName], etc.
            /^\{.*Name.*\}$/i // {FirstName}, {LastName}, etc.
        ];

        return patterns.some(pattern => pattern.test(text.trim()));
    },

    /**
     * Extract greeting from paragraph text
     */
    extractGreeting(fullText) {
        const greetingPatterns = [
            /^(Dear|Hi|Hello|Greetings)\s+/i
        ];

        for (const pattern of greetingPatterns) {
            const match = fullText.match(pattern);
            if (match) {
                return {
                    greeting: match[1],
                    fullMatch: match[0]
                };
            }
        }

        return null;
    },

    /**
     * Transform individual greeting
     */
    transformGreeting(match, config) {
        const {
            paragraph,
            span,
            greeting
        } = match;
        const oldHTML = paragraph.innerHTML;

        try {
            // Build new greeting based on selected fields
            const tokens = this.buildPersonalizationTokens(config);

            if (tokens.length === 0) {
                return {
                    success: false,
                    message: 'No personalization fields selected'
                };
            }

            // Create complete new greeting text (replace entire content)
            const newGreetingText = `${greeting} ${tokens.join(' ')},`;

            // Use textContent to avoid HTML encoding of template tags
            paragraph.textContent = newGreetingText;

            return {
                success: true,
                oldHTML: oldHTML,
                newHTML: paragraph.innerHTML
            };

        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    },

    /**
     * Build personalization tokens based on config
     */
    buildPersonalizationTokens(config) {
        const tokens = [];
        const prefix = config.targetType === 'HCP' ? 'recipient' : 'consumer';

        // Fixed order: Title, FirstName, LastName
        if (config.includeTitle) {
            tokens.push(`<%= ${prefix}.salutation %>`);
        }

        if (config.includeFirstname) {
            tokens.push(`<%= ${prefix}.firstName %>`);
        }

        if (config.includeLastname) {
            tokens.push(`<%= ${prefix}.lastName %>`);
        }

        return tokens;
    }

};

/**
 * Change highlighting utilities
 */
const ChangeHighlighter = {
    /**
     * Highlight changes in HTML content
     */
    highlightChanges(originalHTML, modifiedHTML, changes) {
        // This is a simplified version - in a real implementation,
        // you might want to use a more sophisticated diff algorithm

        let highlightedHTML = modifiedHTML;

        changes.forEach(change => {
            if (change.newValue && typeof change.newValue === 'string') {
                // Wrap new values with highlight spans
                const highlightedValue = `<span class="bg-yellow-200 border border-yellow-400 rounded px-1">${change.newValue}</span>`;
                highlightedHTML = highlightedHTML.replace(change.newValue, highlightedValue);
            }
        });

        return highlightedHTML;
    },

    /**
     * Remove highlights from HTML
     */
    removeHighlights(html) {
        return html.replace(/<span class="bg-yellow-200[^>]*>(.*?)<\/span>/g, '$1');
    }
};