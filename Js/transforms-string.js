// String-based transformation functions

const StringTransforms = {
    /**
     * Transform browser version links using string replacement
     */
    transformBrowserVersion(html) {
        const results = {
            success: true,
            messages: [],
            changes: [],
            html: html
        };

        let modifiedHTML = html;
        let totalMatches = 0;

        try {
            console.log('Starting browser version transformation (String method)'); // DEBUG

            // Step 1: Handle anchors with "Browser version" text
            const textResult = StringUtils.replaceHrefInAnchorsWithText(
                modifiedHTML,
                "Browser version",
                "<%@ include view='MirrorPageUrl' %>"
            );

            modifiedHTML = textResult.html;
            totalMatches += textResult.matchCount;

            console.log('Text search results:', textResult); // DEBUG

            // Add changes to results
            textResult.matches.forEach((match, index) => {
                results.changes.push({
                    type: 'browser-version-text',
                    element: `Text match ${index + 1}`,
                    oldValue: match.oldHref,
                    newValue: match.newHref
                });
            });

            // Step 2: Handle anchors with title="Browser version"
            const titleResult = StringUtils.replaceHrefInAnchorsWithTitle(
                modifiedHTML,
                "Browser version",
                "<%@ include view='MirrorPageUrl' %>"
            );

            modifiedHTML = titleResult.html;
            totalMatches += titleResult.matchCount;

            console.log('Title search results:', titleResult); // DEBUG

            // Add changes to results
            titleResult.matches.forEach((match, index) => {
                results.changes.push({
                    type: 'browser-version-title',
                    element: `Title match ${index + 1}`,
                    oldValue: match.oldHref,
                    newValue: match.newHref
                });
            });

            // Add summary message
            if (totalMatches === 0) {
                results.messages.push({
                    type: 'info',
                    text: 'No browser version links found'
                });
            } else {
                results.messages.push({
                    type: 'success',
                    text: `Browser version links updated: ${totalMatches} found`
                });
            }

            console.log('Final transformation results:', results); // DEBUG

        } catch (error) {
            results.success = false;
            results.messages.push({
                type: 'error',
                text: `String transformation failed: ${error.message}`
            });
            console.error('String transformation error:', error); // DEBUG
        }

        return {
            ...results,
            html: modifiedHTML
        };
    },
    /**
     * Transform DTC unsubscribe links using string replacement
     */
    transformDTCUnsubscribe(html) {
        const results = {
            success: true,
            messages: [],
            changes: [],
            html: html
        };

        try {
            console.log('Starting DTC unsubscribe transformation (String method)'); // DEBUG

            const unsubResult = StringUtils.replaceHrefInUnsubscribeAnchors(
                html,
                "<%@ include view='aznConsumerUnsubsUrlProgrameAstrazenecaUs' %>"
            );

            console.log('DTC unsubscribe results:', unsubResult); // DEBUG

            // Add changes to results
            unsubResult.matches.forEach((match, index) => {
                results.changes.push({
                    type: 'unsubscribe-dtc-string',
                    element: `Unsubscribe ${index + 1}`,
                    oldValue: match.oldHref,
                    newValue: match.newHref
                });
            });

            // Add summary message
            if (unsubResult.matchCount === 0) {
                results.messages.push({
                    type: 'info',
                    text: 'No unsubscribe links found'
                });
            } else {
                results.messages.push({
                    type: 'success',
                    text: `DTC unsubscribe links updated: ${unsubResult.matchCount} found`
                });
            }

            return {
                ...results,
                html: unsubResult.html
            };

        } catch (error) {
            results.success = false;
            results.messages.push({
                type: 'error',
                text: `DTC unsubscribe transformation failed: ${error.message}`
            });
            console.error('DTC unsubscribe error:', error); // DEBUG
        }

        return results;
    },
    /**
     * Transform HCP unsubscribe links using string replacement
     */
    transformHCPUnsubscribe(html, config) {
        const results = {
            success: true,
            messages: [],
            changes: [],
            html: html
        };

        try {
            console.log('Starting HCP unsubscribe transformation (String method)'); // DEBUG

            // Step 1: Find all unsubscribe anchors first
            const unsubscribeMatches = [];
            const anchorPattern = /<a\s+([^>]+)>(.*?)<\/a>/gis;
            
            let match;
            while ((match = anchorPattern.exec(html)) !== null) {
                const [fullMatch, attributes, content] = match;
                const unsubscribePattern = /Unsubscribe/i;
                
                if (unsubscribePattern.test(content)) {
                    unsubscribeMatches.push({
                        fullMatch: fullMatch,
                        attributes: attributes,
                        content: content,
                        startIndex: match.index,
                        endIndex: match.index + fullMatch.length
                    });
                }
            }

            console.log('Found unsubscribe matches:', unsubscribeMatches.length); // DEBUG

            if (unsubscribeMatches.length === 0) {
                results.messages.push({
                    type: 'info',
                    text: 'No unsubscribe links found'
                });
                return { ...results, html: html };
            }

            // Step 2: Determine header vs footer
            // Last match = footer, all others = header
            const footerMatch = unsubscribeMatches[unsubscribeMatches.length - 1];
            const headerMatches = unsubscribeMatches.slice(0, -1);

            console.log('Header matches:', headerMatches.length, 'Footer matches:', 1); // DEBUG

            // Step 3: Replace from end to beginning (to preserve indices)
            let modifiedHTML = html;
            
            // Replace footer first
            const footerTemplate = config.boldFooter
                ? "<% var color='#6D9DB9'; var fsize='12px'; %> <%@ include view='aznUsHcpUnsubscribeBoldWithSmalluAndVariable' %>"
                : "<% var color='#000000'; var fsize='12'; %> <%@ include view='aznUsHcpUnsubscribeWithSmalluAndVariable' %>";

            modifiedHTML = this.replaceMatchAtIndex(modifiedHTML, footerMatch, footerTemplate);
            
            results.changes.push({
                type: 'unsubscribe-hcp-footer-string',
                element: 'Footer',
                oldValue: footerMatch.fullMatch,
                newValue: footerTemplate
            });

            // Replace headers (from end to beginning to preserve indices)
            const headerTemplate = config.noUnderlineHeader
                ? "<% var color='#000000'; var fsize='12'; %> <%@ include view='aznUsHcpUnsubscribeWithVariablenNoUnderline' %>"
                : "<% var color='#000000'; var fsize='12'; %> <%@ include view='aznUsHcpUnsubscribeWithVariable' %>";

            for (let i = headerMatches.length - 1; i >= 0; i--) {
                const headerMatch = headerMatches[i];
                modifiedHTML = this.replaceMatchAtIndex(modifiedHTML, headerMatch, headerTemplate);
                
                results.changes.push({
                    type: 'unsubscribe-hcp-header-string',
                    element: `Header ${i + 1}`,
                    oldValue: headerMatch.fullMatch,
                    newValue: headerTemplate
                });
            }

            results.messages.push({
                type: 'success',
                text: `HCP unsubscribe links updated: ${unsubscribeMatches.length} found (${headerMatches.length} header, 1 footer)`
            });

            return { ...results, html: modifiedHTML };

        } catch (error) {
            results.success = false;
            results.messages.push({
                type: 'error',
                text: `HCP unsubscribe transformation failed: ${error.message}`
            });
            console.error('HCP unsubscribe error:', error); // DEBUG
        }

        return results;
    },

    /**
     * Helper: Replace match at specific index
     */
    replaceMatchAtIndex(html, match, replacement) {
        return html.substring(0, match.startIndex) + 
            replacement + 
            html.substring(match.endIndex);
    },

    /**
     * Combined unsubscribe transformation (DTC + HCP)
     */
    transformUnsubscribe(html, config) {
        if (config.targetType === 'DTC') {
            return this.transformDTCUnsubscribe(html);
        } else if (config.targetType === 'HCP') {
            return this.transformHCPUnsubscribe(html, config);
        } else {
            return {
                success: false,
                messages: [{ type: 'error', text: 'Invalid target type' }],
                changes: [],
                html: html
            };
        }
    },
    /**
     * Transform personalization greetings using string replacement
     */
    transformPersonalization(html, config) {
        const results = {
            success: true,
            messages: [],
            changes: [],
            html: html
        };

        try {
            console.log('Starting personalization transformation'); // DEBUG

            // Build tokens based on config
            const tokens = this.buildPersonalizationTokens(config);
            
            if (tokens.length === 0) {
                results.messages.push({
                    type: 'error',
                    text: 'No personalization fields selected'
                });
                return { ...results, html: html };
            }

            let modifiedHTML = html;
            let matchCount = 0;

            // Pattern 1: <p><span>Greeting [anything]</span>,</p>
            const pattern1 = /<p([^>]*?)><span([^>]*?)>(.*?)(Dear|Hi|Hello|Greetings)[\s\n\r\t]+[^<]*?<\/span>[\s\n\r\t]*,[\s\n\r\t]*(.*?)<\/p>/gis;
            
            modifiedHTML = modifiedHTML.replace(pattern1, (fullMatch, pAttributes, spanAttributes, beforeGreeting, greeting, afterGreeting) => {
                console.log('Found Pattern 1 greeting:', {
                    greeting: greeting,
                    fullMatch: fullMatch
                }); // DEBUG

                const newGreeting = `${greeting} ${tokens.join(' ')},`;
                const replacement = `<p${pAttributes}>${beforeGreeting}${newGreeting}${afterGreeting}</p>`;
                
                results.changes.push({
                    type: 'personalization-pattern1',
                    element: `Greeting ${++matchCount}`,
                    oldValue: fullMatch,
                    newValue: replacement
                });

                return replacement;
            });

            // Pattern 2: <p>Greeting <span>[anything]</span>,</p>
            const pattern2 = /<p([^>]*?)>(.*?)(Dear|Hi|Hello|Greetings)[\s\n\r\t]+<span([^>]*?)>[^<]*?<\/span>[\s\n\r\t]*,[\s\n\r\t]*(.*?)<\/p>/gis;
            
            modifiedHTML = modifiedHTML.replace(pattern2, (fullMatch, pAttributes, beforeGreeting, greeting, spanAttributes, afterGreeting) => {
                console.log('Found Pattern 2 greeting:', {
                    greeting: greeting,
                    fullMatch: fullMatch
                }); // DEBUG

                const newGreeting = `${greeting} ${tokens.join(' ')},`;
                const replacement = `<p${pAttributes}>${beforeGreeting}${newGreeting}${afterGreeting}</p>`;
                
                results.changes.push({
                    type: 'personalization-pattern2',
                    element: `Greeting ${++matchCount}`,
                    oldValue: fullMatch,
                    newValue: replacement
                });

                return replacement;
            });

            if (matchCount === 0) {
                results.messages.push({
                    type: 'info',
                    text: 'No personalization greeting detected'
                });
            } else {
                results.messages.push({
                    type: 'success',
                    text: `Personalization greetings updated: ${matchCount} found`
                });
            }

            return { ...results, html: modifiedHTML };

        } catch (error) {
            results.success = false;
            results.messages.push({
                type: 'error',
                text: `Personalization transformation failed: ${error.message}`
            });
            console.error('Personalization error:', error); // DEBUG
        }

        return results;
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