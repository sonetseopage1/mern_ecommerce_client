'use client';

// Embeds a parsed video (see lib/video.js) – only YouTube / Google Drive / direct files are ever rendered
export default function VideoPlayer({ video, title = 'Product video' }) {
  return (
    <div className="card aspect-square overflow-hidden bg-black">
      {video.type === 'file'
        ? <video src={video.embed} controls playsInline preload="metadata" className="h-full w-full" />
        : <iframe src={video.embed} title={title} loading="lazy" className="h-full w-full border-0" referrerPolicy="strict-origin-when-cross-origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen />}
    </div>
  );
}
