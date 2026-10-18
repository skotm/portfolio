import { useEffect, useState } from 'react';

type Project = {
  name: string;
  category: string;
  description: string;
  status: string;
  image?: string;
  url: string;
  demoUrl?: string;
  owner: string;
  repo: string;
};

const projects: Project[] = [
  {
    name: 'MeteoQuake',
    category: '地震・気象・防災',
    description: '地震・気象・防災情報を扱うアプリケーション。',
    status: '開発中',
    image: 'https://github.com/user-attachments/assets/c5297fdd-1c50-4b18-bb80-b0be32356a59',
    url: 'https://github.com/skotm/MeteoQuake',
    owner: 'skotm',
    repo: 'MeteoQuake',
  },
  {
    name: 'MeteoQuake-KyoshinViewer',
    category: '強震モニタ可視化',
    description: 'リアルタイム震度ビューアー',
    status: '',
    image: 'https://github.com/user-attachments/assets/6f18089b-818d-495b-9cc3-c3103e849489',
    url: 'https://github.com/skotm/MeteoQuake-KyoshinViewer',
    owner: 'skotm',
    repo: 'MeteoQuake-KyoshinViewer',
  },
  {
    name: 'WIS Viewer',
    category: '気象情報可視化',
    description: '気象情報を可視化するツール',
    status: '',
    image: 'https://github.com/user-attachments/assets/8e113cd5-9346-4f72-87f2-0cec5d595508',
    url: 'https://github.com/skotm/wis-viewer',
    owner: 'skotm',
    repo: 'wis-viewer',
  },
];

function sanitizeReadmeHtml(html: string): string {
  const document = new DOMParser().parseFromString(html, 'text/html');
  document.querySelectorAll('script, style, iframe, object, embed, form, input, button, a.anchor, .anchor, [class~="octicon-link"]').forEach((node) => node.remove());
  document.querySelectorAll('h1 a, h2 a, h3 a, h4 a, h5 a, h6 a').forEach((node) => { if (node.querySelector('svg') || node.classList.contains('anchor')) node.remove(); });
  document.body.querySelectorAll('*').forEach((element) => {
    Array.from(element.attributes).forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      if (name.startsWith('on') || name === 'srcdoc') element.removeAttribute(attribute.name);
      if (name === 'href' || name === 'src') {
        try {
          const parsed = new URL(attribute.value, window.location.origin);
          if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') element.removeAttribute(attribute.name);
          else if (name === 'href') { element.setAttribute('target', '_blank'); element.setAttribute('rel', 'noreferrer'); }
        } catch { element.removeAttribute(attribute.name); }
      }
    });
  });
  const usedIds = new Set<string>();
  document.body.querySelectorAll('h1, h2, h3').forEach((heading) => {
    const text = heading.textContent?.trim() || 'section';
    const base = heading.id || text.toLowerCase().normalize('NFKD').replace(/[\\u0300-\\u036f]/g, '').replace(/[^\\w\\u0080-\\uFFFF-]+/g, '-').replace(/^-+|-+$/g, '') || 'section';
    let id = base;
    let suffix = 2;
    while (usedIds.has(id)) id = `${base}-${suffix++}`;
    usedIds.add(id);
    heading.id = id;
  });
  return document.body.innerHTML;
}

type ReadmeHeading = { id: string; text: string; level: 1 | 2 | 3 };

function ReadmeContent({ html }: { html: string }) {
  return <div className="readme-content" dangerouslySetInnerHTML={{ __html: sanitizeReadmeHtml(html) }} />;
}
function ProjectDetails({ project }: { project: Project }) {
  const [readme, setReadme] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [headings, setHeadings] = useState<ReadmeHeading[]>([]);
  const [activeHeading, setActiveHeading] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    setReadme('');
    fetch(`https://api.github.com/repos/${project.owner}/${project.repo}/readme`, {
      headers: { Accept: 'application/vnd.github.html+json' },
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(response.status === 404 ? 'このリポジトリにはREADMEが見つかりませんでした。' : 'READMEを取得できませんでした。時間をおいて再度お試しください。');
        const html = await response.text();
        setReadme(html);
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name !== 'AbortError') setError(err.message || 'READMEの取得に失敗しました。');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return (
    <div className="documentation-page">
      <header className="documentation-header">
        <span className="eyebrow">DOCUMENTATION</span>
        <h1>{project.name}</h1>
        <p>{project.description}</p>
        <div className="documentation-meta"><span>{project.category}</span>{project.status && <span>{project.status}</span>}<a href={project.url} target="_blank" rel="noreferrer">GitHubで開く ↗</a></div>
      </header>
      <div className="documentation-content">
        <div className="readme-panel">
          {loading && <p className="readme-state">READMEを読み込み中…</p>}
          {!loading && error && <div className="readme-state"><p>{error}</p><a href={project.url + '#readme'} target="_blank" rel="noreferrer">GitHubでREADMEを見る ↗</a></div>}
          {!loading && !error && readme && <ReadmeContent html={readme} />}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  useEffect(() => {
    const onSelectProject = (event: Event) => {
      const name = (event as CustomEvent<string>).detail;
      const project = projects.find((item) => item.name === name);
      if (project) setSelectedProject(project);
    };
    window.addEventListener('portfolio:select-project', onSelectProject);
    return () => window.removeEventListener('portfolio:select-project', onSelectProject);
  }, []);

  return (
    <div className="shell" id="top">
      <header className="nav">
        <a className="logo" href="#top">skotm</a>
        <nav aria-label="メインナビゲーション">
          <a href="#projects">Projects</a>
          <a href="#about">About</a>
        </nav>
        <div className="social-links">
          <a className="gh social-icon" href="https://github.com/skotm" target="_blank" rel="noreferrer" aria-label="GitHub" title="GitHub">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.56.1.76-.24.76-.54v-2.1c-3.1.67-3.76-1.32-3.76-1.32-.51-1.3-1.24-1.65-1.24-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1 1.71 2.62 1.22 3.26.93.1-.73.39-1.22.71-1.5-2.48-.28-5.09-1.24-5.09-5.52 0-1.22.44-2.22 1.16-3-.12-.29-.5-1.42.11-2.96 0 0 .95-.3 3.05 1.15a10.6 10.6 0 0 1 5.55 0c2.1-1.45 3.05-1.15 3.05-1.15.61 1.54.23 2.67.11 2.96.72.78 1.16 1.78 1.16 3 0 4.29-2.62 5.23-5.11 5.51.4.35.76 1.03.76 2.08v3.1c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z"/></svg>
          </a>
          <a className="gh social-icon x-icon" href="https://x.com/skotm_0423?s=11" target="_blank" rel="noreferrer" aria-label="X" title="X">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.9 2H22l-6.78 7.75L23.2 22h-6.25l-4.9-7.36L5.6 22H2.46l7.25-8.28L1.8 2h6.4l4.43 6.77L18.9 2Zm-1.1 17.9h1.73L7.27 3.98H5.41L17.8 19.9Z"/></svg>
          </a>
        </div>
      </header>

      <aside className="site-sidebar" aria-label="サイトサイドバー">
        <a className="sidebar-brand" href="#top" onClick={() => setSelectedProject(null)}>skotm<span>{selectedProject ? 'DOCUMENTATION' : 'PORTFOLIO'}</span></a>
        {!selectedProject ? <>
          <nav className="sidebar-nav" aria-label="ページ内ナビゲーション">
            <a href="#top"><span>01</span> Profile</a>
            <a href="#projects"><span>02</span> Projects</a>
            <a href="#about"><span>03</span> About</a>
          </nav>
          <div className="sidebar-projects"><span className="sidebar-label">PROJECTS</span>
            {projects.map((project, index) => <a key={project.name} href="#projects" onClick={(event) => { event.preventDefault(); setSelectedProject(project); }}><span>{String(index + 1).padStart(2, '0')}</span>{project.name}</a>)}
          </div>
        </> : <>
          <a className="sidebar-back" href="#projects" onClick={(event) => { event.preventDefault(); setSelectedProject(null); }}>← Projects に戻る</a>
          <div className="sidebar-projects"><span className="sidebar-label">README CONTENTS</span>
            {headings.map((heading) => <a key={heading.id} className={activeHeading === heading.id ? 'is-active' : ''} href={'#' + heading.id} onClick={(event) => { event.preventDefault(); document.querySelector('.readme-panel #' + CSS.escape(heading.id))?.scrollIntoView({behavior:'smooth',block:'start'}); setActiveHeading(heading.id); }}><span>{'—'}</span>{heading.text}</a>)}
          </div>
          <div className="sidebar-projects sidebar-other-projects"><span className="sidebar-label">PROJECTS</span>{projects.map((project,index)=><a key={project.name} href="#documentation" onClick={(event)=>{event.preventDefault();setSelectedProject(project);}} className={project.name===selectedProject.name?'is-active':''}><span>{String(index+1).padStart(2,'0')}</span>{project.name}</a>)}</div>
        </>}
        <div className="sidebar-socials"><a href="https://github.com/skotm" target="_blank" rel="noreferrer">GitHub ↗</a><a href="https://x.com/skotm_0423?s=11" target="_blank" rel="noreferrer">X ↗</a></div>
      </aside>
      {selectedProject ? <main id="documentation"><ProjectDetails key={selectedProject.name} project={selectedProject} /></main> : <main>
        <section className="hero">
          <div className="profile-cover" aria-hidden="true">
            <img src="/portfolio/sakura.jpg" alt="" fetchPriority="high" />
          </div>
          <p className="eyebrow">PROFILE</p>
          <h1>skotm</h1>
          <div className="hero-bottom">
            <p>気象・地震・防災情報の可視化ツールを開発しています。<br />主に JavaScript を用いて、リアルタイムデータの取得・解析・地図上への可視化を行っています。</p>
          </div>
        </section>

        <section className="section" id="projects">
          <div className="heading">
            <div>
              <span className="eyebrow">PROJECTS</span>
              <h2>Projects <sup>{String(projects.length).padStart(2, '0')}</sup></h2>
            </div>
          </div>
          <div className="projects">
            {projects.map((project, index) => (
              <article className="project" key={project.name}>
                <div className="project-meta">
                  {!project.image && <span>{String(index + 1).padStart(2, '0')}</span>}
                  {!project.image && project.status && <span>{project.status}</span>}
                </div>
                {project.image && (
                  <a className="project-image-link" href={project.url} target="_blank" rel="noreferrer" aria-label={project.name + ' のGitHubリポジトリを開く'}>
                    <img className="project-image" src={project.image} alt="" loading={index === 0 ? "eager" : "lazy"} fetchPriority={index === 0 ? "high" : "auto"} onError={(event) => { event.currentTarget.style.display = 'none'; }} />
                    <span className="project-image-shade" aria-hidden="true" />
                    <span className="project-image-number">{String(index + 1).padStart(2, '0')}</span>
                    <span className="project-image-caption">
                      <span className="project-image-title">{project.name}</span>
                      <span className="project-image-tags">
                        <span>{project.category}</span>
                        {project.status && <span>{project.status}</span>}
                      </span>
                    </span>
                  </a>
                )}
                {!project.image && <>
                  <h3>{project.name}</h3>
                  <p className="project-category">{project.category}</p>
                </>}
                <p>{project.description}</p>
                <div className="project-actions">
                  <button className="details-button" onClick={() => setSelectedProject(project)}>詳細 <span>↗</span></button>
                  <a className="repo-pill" href={project.url} target="_blank" rel="noreferrer" aria-label={project.name + ' のGitHubリポジトリ'}>
                    <span>GitHub repository</span><span aria-hidden="true">↗</span>
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="about" id="about">
          <span className="eyebrow">ABOUT</span>
          <div className="about-grid">
            <h2>About</h2>
            <div>
              <p>気象・地震・防災情報を、より分かりやすく可視化することを目標に開発しています。</p>
              <p>公開データの取得や解析、地図上での表示、現象のシミュレーションなどに取り組んでいます。</p>
              <div className="about-socials">
                <a className="about-link about-icon-link" href="https://github.com/skotm" target="_blank" rel="noreferrer" aria-label="GitHubプロフィール" title="GitHub">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.56.1.76-.24.76-.54v-2.1c-3.1.67-3.76-1.32-3.76-1.32-.51-1.3-1.24-1.65-1.24-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1 1.71 2.62 1.22 3.26.93.1-.73.39-1.22.71-1.5-2.48-.28-5.09-1.24-5.09-5.52 0-1.22.44-2.22 1.16-3-.12-.29-.5-1.42.11-2.96 0 0 .95-.3 3.05 1.15a10.6 10.6 0 0 1 5.55 0c2.1-1.45 3.05-1.15 3.05-1.15.61 1.54.23 2.67.11 2.96.72.78 1.16 1.78 1.16 3 0 4.29-2.62 5.23-5.11 5.51.4.35.76 1.03.76 2.08v3.1c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z"/></svg>
                </a>
                <a className="about-link about-icon-link x-icon" href="https://x.com/skotm_0423?s=11" target="_blank" rel="noreferrer" aria-label="Xプロフィール" title="X">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.9 2H22l-6.78 7.75L23.2 22h-6.25l-4.9-7.36L5.6 22H2.46l7.25-8.28L1.8 2h6.4l4.43 6.77L18.9 2Zm-1.1 17.9h1.73L7.27 3.98H5.41L17.8 19.9Z"/></svg>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>}

      <footer>
        <a className="logo" href="#top">skotm</a>
        <a href="#top">ページ上部へ ↑</a>
      </footer>
    </div>
  );
}
