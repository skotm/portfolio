import type { MouseEvent } from 'react';
import GlassPanel from './GlassPanel';

type Section = 'top' | 'projects' | 'about';

const GITHUB_PATH = "M12 .9a11.1 11.1 0 0 0-3.51 21.63c.56.1.76-.24.76-.54v-2.1c-3.1.67-3.76-1.32-3.76-1.32-.51-1.3-1.24-1.65-1.24-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1 1.71 2.62 1.22 3.26.93.1-.73.39-1.22.71-1.5-2.48-.28-5.09-1.24-5.09-5.52 0-1.22.44-2.22 1.16-3-.12-.29-.5-1.42.11-2.96 0 0 .95-.3 3.05 1.15a10.6 10.6 0 0 1 5.55 0c2.1-1.45 3.05-1.15 3.05-1.15.61 1.54.23 2.67.11 2.96.72.78 1.16 1.78 1.16 3 0 4.29-2.62 5.23-5.11 5.51.4.35.76 1.03.76 2.08v3.1c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z";
const X_PATH = "M18.9 2H22l-6.78 7.75L23.2 22h-6.25l-4.9-7.36L5.6 22H2.46l7.25-8.28L1.8 2h6.4l4.43 6.77L18.9 2Zm-1.1 17.9h1.73L7.27 3.98H5.41L17.8 19.9Z";

/** トップページ用のヘッダー。.shell直下に置かれるガラス対象（インスタンスA）。 */
export default function GlassNavigation({ onNavigate }: { onNavigate: (section: Section) => void }) {
  const go = (section: Section) => (event: MouseEvent) => { event.preventDefault(); onNavigate(section); };
  return (
    <GlassPanel as="header" className="nav">
      <a className="logo" href="#top" onClick={go('top')}>skotm</a>
      <nav aria-label="メインナビゲーション">
        <a href="#projects" onClick={go('projects')}>Projects</a>
        <a href="#about" onClick={go('about')}>About</a>
      </nav>
      <div className="social-links">
        <a className="gh social-icon" href="https://github.com/skotm" target="_blank" rel="noreferrer" aria-label="GitHub" title="GitHub">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d={GITHUB_PATH} /></svg>
        </a>
        <a className="gh social-icon x-icon" href="https://x.com/skotm_0423?s=11" target="_blank" rel="noreferrer" aria-label="X" title="X">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d={X_PATH} /></svg>
        </a>
      </div>
    </GlassPanel>
  );
}
