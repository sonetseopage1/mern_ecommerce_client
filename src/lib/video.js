// Turns a pasted YouTube / Google Drive / direct video link into something we can embed.
// Returns null for anything else (same rules as server/src/utils/video.js).
export function parseVideo(input) {
  let u;
  try { u = new URL(String(input || '').trim()); } catch { return null; }
  if (!/^https?:$/.test(u.protocol)) return null;
  const host = u.hostname.replace(/^(www|m)\./, '');
  let id = null;

  if (host === 'youtu.be') id = u.pathname.slice(1).split('/')[0];
  else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    if (u.pathname === '/watch') id = u.searchParams.get('v');
    else id = (u.pathname.match(/^\/(?:embed|shorts|live|v)\/([\w-]{6,15})/) || [])[1];
  }
  if (id && /^[\w-]{6,15}$/.test(id)) {
    return { type: 'youtube', id, url: u.toString(), label: 'YouTube', embed: `https://www.youtube-nocookie.com/embed/${id}?rel=0`, thumb: `https://img.youtube.com/vi/${id}/hqdefault.jpg` };
  }
  if (host === 'drive.google.com') {
    id = (u.pathname.match(/\/file\/d\/([\w-]+)/) || [])[1] || u.searchParams.get('id');
    if (id && /^[\w-]{10,}$/.test(id)) {
      return { type: 'drive', id, url: u.toString(), label: 'Google Drive', embed: `https://drive.google.com/file/d/${id}/preview`, thumb: `https://drive.google.com/thumbnail?id=${id}&sz=w640` };
    }
  }
  if (/\.(mp4|webm|ogg)$/i.test(u.pathname)) return { type: 'file', url: u.toString(), label: 'Video file', embed: u.toString(), thumb: null };
  return null;
}
