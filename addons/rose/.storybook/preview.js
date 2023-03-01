/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import handlebars from 'react-syntax-highlighter/dist/esm/languages/prism/handlebars';
import scss from 'react-syntax-highlighter/dist/esm/languages/prism/scss';

// Registers and enables language support
SyntaxHighlighter.registerLanguage('handlebars', handlebars);
SyntaxHighlighter.registerLanguage('scss', scss);
