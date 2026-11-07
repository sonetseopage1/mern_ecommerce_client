// Renders HTML written in the admin rich-text editor (sanitized on the server). Plain text still works.
export default function RichContent({ html, className = '' }) {
  if (!html) return null;
  if (!/<[a-z][\s\S]*>/i.test(html)) return <p className={`whitespace-pre-line leading-relaxed ${className}`}>{html}</p>;
  // eslint-disable-next-line react/no-danger
  return <div className={`rich ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}

// plain-text version for meta tags / JSON-LD
export const stripHtml = (html = '') => String(html).replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
