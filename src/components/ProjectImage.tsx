import { useState } from 'react';

function isCrossOrigin(src: string): boolean {
  try { return new URL(src, window.location.href).origin !== window.location.origin; } catch { return false; }
}

/**
 * Canvas取り込みに備え、外部画像には crossOrigin="anonymous" を付ける。
 * 配信元がCORS非対応で読み込めない場合は、属性なしで再試行して画像表示を優先する。
 */
export default function ProjectImage({ src, eager = false }: { src: string; eager?: boolean }) {
  const [useCors, setUseCors] = useState(() => isCrossOrigin(src));
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <img
      key={useCors ? 'cors' : 'plain'}
      className="project-image"
      src={src}
      alt=""
      crossOrigin={useCors ? 'anonymous' : undefined}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : 'auto'}
      onError={() => { if (useCors) setUseCors(false); else setFailed(true); }}
    />
  );
}
