// String-based utility functions for HTML transformation

const StringUtils = {
    /**
     * Find and replace href attributes in anchor tags containing specific text
     */
    replaceHrefInAnchorsWithText(html, searchText, newHref) {
        const results = {
            html: html,
            matchCount: 0,
            matches: []
        };

        // Pattern to match anchor tags with attributes (added 's' flag for dotall mode)
        const anchorPattern = /<a\s+([^>]+)>(.*?)<\/a>/gis;

        results.html = html.replace(anchorPattern, (fullMatch, attributes, content) => {
            // Normalize content for better matching (collapse whitespace)
            const normalizedContent = content.replace(/\s+/g, ' ').trim();

            // More flexible pattern that handles various whitespace scenarios
            const browserVersionPattern = /Browser[\s\n\r\t]+version/i;

            console.log('Checking anchor:', {
                originalContent: JSON.stringify(content),
                normalizedContent: normalizedContent,
                matches: browserVersionPattern.test(content)
            }); // DEBUG

            if (browserVersionPattern.test(content)) {
                // Extract old href with more robust pattern
                const hrefMatch = attributes.match(/href\s*=\s*["']([^"']*?)["']/i);
                const oldHref = hrefMatch ? hrefMatch[1] : '';

                console.log('Found match! Old href:', oldHref); // DEBUG

                // Replace href in attributes
                let newAttributes = attributes.trim();
                if (hrefMatch) {
                    // Replace existing href
                    newAttributes = attributes.replace(
                        /href\s*=\s*["'][^"']*?["']/i,
                        `href="${newHref}"`
                    );
                } else {
                    // Add href if it doesn't exist
                    newAttributes = `href="${newHref}" ${attributes}`;
                }

                results.matchCount++;
                results.matches.push({
                    oldHref: oldHref,
                    newHref: newHref,
                    content: normalizedContent,
                    originalContent: content,
                    fullMatch: fullMatch
                });

                return `<a ${newAttributes}>${content}</a>`;
            }

            return fullMatch;
        });

        return results;
    },

    /**
     * Find and replace href attributes in anchor tags with specific title
     */
    replaceHrefInAnchorsWithTitle(html, titleText, newHref) {
        const results = {
            html: html,
            matchCount: 0,
            matches: []
        };

        // Pattern to match anchor tags with attributes
        const anchorPattern = /<a\s+([^>]+)>(.*?)<\/a>/gi;

        results.html = html.replace(anchorPattern, (fullMatch, attributes, content) => {
            // Check if attributes contain our title
            const titleMatch = attributes.match(/title=["']([^"']*?)["']/i);

            console.log('Checking title:', {
                attributes: attributes,
                titleMatch: titleMatch,
                lookingFor: titleText
            }); // DEBUG

            if (titleMatch && titleMatch[1].toLowerCase() === titleText.toLowerCase()) {
                // Extract old href
                const hrefMatch = attributes.match(/href=["']([^"']*?)["']/i);
                const oldHref = hrefMatch ? hrefMatch[1] : '';

                console.log('Found title match! Old href:', oldHref); // DEBUG

                // Replace href in attributes
                let newAttributes = attributes;
                if (hrefMatch) {
                    newAttributes = attributes.replace(
                        /href=["'][^"']*?["']/i,
                        `href="${newHref}"`
                    );
                } else {
                    // Add href if it doesn't exist
                    newAttributes = `href="${newHref}" ${attributes}`;
                }

                results.matchCount++;
                results.matches.push({
                    oldHref: oldHref,
                    newHref: newHref,
                    title: titleMatch[1]
                });

                return `<a ${newAttributes}>${content}</a>`;
            }

            // Return unchanged if no match
            return fullMatch;
        });

        return results;
    },

    /**
     * Find and replace href attributes in anchor tags containing "Unsubscribe" text
     */
    replaceHrefInUnsubscribeAnchors(html, newHref) {
        const results = {
            html: html,
            matchCount: 0,
            matches: []
        };

        // Pattern to match anchor tags with attributes
        const anchorPattern = /<a\s+([^>]+)>(.*?)<\/a>/gis;

        results.html = html.replace(anchorPattern, (fullMatch, attributes, content) => {
            // Normalize content for better matching
            const normalizedContent = content.replace(/\s+/g, ' ').trim();

            // Pattern for "Unsubscribe" with flexible whitespace
            const unsubscribePattern = /Unsubscribe/i;

            console.log('Checking unsubscribe anchor:', {
                originalContent: JSON.stringify(content),
                normalizedContent: normalizedContent,
                matches: unsubscribePattern.test(content)
            }); // DEBUG

            if (unsubscribePattern.test(content)) {
                // Extract old href
                const hrefMatch = attributes.match(/href\s*=\s*["']([^"']*?)["']/i);
                const oldHref = hrefMatch ? hrefMatch[1] : '';

                console.log('Found unsubscribe match! Old href:', oldHref); // DEBUG

                // Replace href in attributes
                let newAttributes = attributes.trim();
                if (hrefMatch) {
                    newAttributes = attributes.replace(
                        /href\s*=\s*["'][^"']*?["']/i,
                        `href="${newHref}"`
                    );
                } else {
                    newAttributes = `href="${newHref}" ${attributes}`;
                }

                results.matchCount++;
                results.matches.push({
                    oldHref: oldHref,
                    newHref: newHref,
                    content: normalizedContent,
                    originalContent: content,
                    fullMatch: fullMatch
                });

                return `<a ${newAttributes}>${content}</a>`;
            }

            return fullMatch;
        });

        return results;
    }
};