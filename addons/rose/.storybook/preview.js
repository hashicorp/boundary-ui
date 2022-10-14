import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import handlebars from 'react-syntax-highlighter/dist/esm/languages/prism/handlebars';

// Registers and enables handlebars language support
SyntaxHighlighter.registerLanguage('handlebars', handlebars);
