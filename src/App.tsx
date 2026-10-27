import { useEffect, useRef, useState } from 'react';

type Project = {
  name: string;
  category: string;
  description: string;
  status: string;
  image?: string;
  url?: string;
  demoUrl?: string;
  owner?: string;
  repo?: string;
};

const projects: Project[] = [
  {
    name: 'MeteoQuake',
    category: '地震・気象・防災',
    description: '地震・気象・防災情報を扱うアプリ',
    status: '開発中',
    image: 'https://github.com/user-attachments/assets/c5297fdd-1c50-4b18-bb80-b0be32356a59',
    url: 'https://github.com/skotm/MeteoQuake',
    owner: 'skotm',
    repo: 'MeteoQuake',
  },
  {
    name: 'MeteoQuake-KyoshinViewer',
    category: 'リアルタイム震度',
    description: 'リアルタイム震度ビューアー',
    status: '',
    image: 'https://github.com/user-attachments/assets/6f18089b-818d-495b-9cc3-c3103e849489',
    url: 'https://github.com/skotm/MeteoQuake-KyoshinViewer',
    owner: 'skotm',
    repo: 'MeteoQuake-KyoshinViewer',
  },
  {
    name: 'WIS Viewer',
    category: '気象',
    description: '気象情報を可視化するツール',
    status: '',
    image: 'https://github.com/user-attachments/assets/8e113cd5-9346-4f72-87f2-0cec5d595508',
    url: 'https://github.com/skotm/wis-viewer',
    owner: 'skotm',
    repo: 'wis-viewer',
  },
  {
    name: '地震・津波シミュレータ',
    category: '地震・津波',
    description: '地震による地盤変動と津波の挙動をシミュレーションするツール',
    status: '構想中',
    image: '/portfolio/tunami.jpeg',
  },
];

function sanitizeReadmeHtml(html: string, repositoryUrl?: string): string {
  const document = new DOMParser().parseFromString(html, 'text/html');
  document.querySelectorAll('script, style, iframe, object, embed, form, input, button, a.anchor, .anchor, [class~="octicon-link"]').forEach((node) => node.remove());
  document.querySelectorAll('h1 a, h2 a, h3 a, h4 a, h5 a, h6 a').forEach((node) => { if (node.querySelector('svg') || node.classList.contains('anchor')) node.remove(); });
  document.body.querySelectorAll('*').forEach((element) => {
    Array.from(element.attributes).forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      if (name.startsWith('on') || name === 'srcdoc') element.removeAttribute(attribute.name);
      if (name === 'href' || name === 'src') {
        try {
          const baseUrl = repositoryUrl ? `${repositoryUrl.replace(/\/$/, '')}/blob/HEAD/README.md` : window.location.origin;
          const parsed = new URL(attribute.value, baseUrl);
          if (name === 'src' && parsed.hostname === 'github.com' && parsed.pathname.includes('/blob/')) {
            parsed.hostname = 'raw.githubusercontent.com';
            parsed.pathname = parsed.pathname.replace('/blob/', '/');
          }
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

function ReadmeContent({ html, repositoryUrl }: { html: string; repositoryUrl: string }) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = contentRef.current;
    if (!root) return;
    const images = Array.from(root.querySelectorAll('img'));
    const cleanups = images.map((img) => {
      img.loading = 'lazy';
      img.decoding = 'async';
      let retried = false;
      const onError = () => {
        if (!retried) {
          retried = true;
          const url = new URL(img.src);
          url.searchParams.set('_image_retry', String(Date.now()));
          img.src = url.toString();
          return;
        }
        img.classList.add('readme-image-failed');
        img.alt = '画像を読み込めませんでした。GitHubでREADMEを開いて確認してください。';
      };
      img.addEventListener('error', onError);
      return () => img.removeEventListener('error', onError);
    });
    return () => cleanups.forEach((cleanup) => cleanup());
  }, [html]);

  return <div ref={contentRef} className="readme-content" dangerouslySetInnerHTML={{ __html: sanitizeReadmeHtml(html, repositoryUrl) }} />;
}
function ProjectDetails({ project, headings, setHeadings, setActiveHeading, onBack }: { project: Project; headings: ReadmeHeading[]; setHeadings: (value: ReadmeHeading[]) => void; activeHeading: string; setActiveHeading: (value: string) => void; onBack: () => void }) {
  const [readme, setReadme] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!project.owner || !project.repo) {
      setLoading(false);
      setError('このプロジェクトの詳細ページはまだ用意されていません。');
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError('');
    setReadme('');
    setHeadings([]);
    setActiveHeading('');
    fetch(`https://api.github.com/repos/${project.owner ?? ''}/${project.repo ?? ''}/readme`, {
      headers: { Accept: 'application/vnd.github.html+json' },
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(response.status === 404 ? 'このリポジトリにはREADMEが見つかりませんでした。' : 'READMEを取得できませんでした。時間をおいて再度お試しください。');
        setReadme(await response.text());
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name !== 'AbortError') setError(err.message || 'READMEの取得に失敗しました。');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [project.owner, project.repo, setHeadings, setActiveHeading]);

  useEffect(() => {
    if (!readme) { setHeadings([]); return; }
    const parsed = new DOMParser().parseFromString(sanitizeReadmeHtml(readme), 'text/html');
    const items = Array.from(parsed.querySelectorAll('h1, h2, h3')).map((heading) => ({
      id: heading.id,
      text: heading.textContent?.trim() || '',
      level: Number(heading.tagName.slice(1)) as 1 | 2 | 3,
    })).filter((heading) => heading.id && heading.text);
    setHeadings(items);
    setActiveHeading(items[0]?.id || '');
  }, [readme, setHeadings, setActiveHeading]);

  useEffect(() => {
    if (!readme || headings.length === 0) return;
    const panel = document.querySelector('.readme-panel');
    if (!panel) return;
    const updateActive = () => {
      const targets = headings.map((heading) => panel.querySelector<HTMLElement>('#' + CSS.escape(heading.id))).filter(Boolean) as HTMLElement[];
      let current = targets[0];
      for (const target of targets) {
        if (target.getBoundingClientRect().top <= 150) current = target;
        else break;
      }
      if (current) setActiveHeading(current.id);
    };
    panel.addEventListener('scroll', updateActive, { passive: true });
    updateActive();
    return () => panel.removeEventListener('scroll', updateActive);
  }, [readme, headings, setActiveHeading]);

  return (
    <div className="documentation-page">
      <header className="documentation-header">
        <button className="documentation-back" type="button" onClick={onBack}>← トップページに戻る</button>
        <span className="eyebrow">DOCUMENTATION</span>
        <h1>{project.name}</h1>
        <p>{project.description}</p>
        <div className="documentation-meta"><span>{project.category}</span>{project.status && <span>{project.status}</span>}{project.url && <a href={project.url} target="_blank" rel="noreferrer">GitHubで開く ↗</a>}</div>
      </header>
      <div className="documentation-content">
        <div className="readme-panel">
          {loading && <p className="readme-state">READMEを読み込み中…</p>}
          {!loading && error && <div className="readme-state"><p>{error}</p>{project.url && <a href={project.url + '#readme'} target="_blank" rel="noreferrer">GitHubでREADMEを見る ↗</a>}</div>}
          {!loading && !error && readme && project.url && <ReadmeContent html={readme} repositoryUrl={project.url} />}
        </div>
      </div>
    </div>
  );
}

function projectFromLocation(): Project | null {
  const name = new URLSearchParams(window.location.search).get('project');
  return projects.find((project) => project.name === name) || null;
}

function isProjectDirectoryLocation(): boolean {
  return new URLSearchParams(window.location.search).get('view') === 'projects';
}

export default function App() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(() => projectFromLocation());
  const [showProjectDirectory, setShowProjectDirectory] = useState<boolean>(() => isProjectDirectoryLocation());
  const [projectCategory, setProjectCategory] = useState('すべて');
  const [headings, setHeadings] = useState<ReadmeHeading[]>([]);
  const [activeHeading, setActiveHeading] = useState('');
  const [pendingHomeSection, setPendingHomeSection] = useState<'top' | 'projects' | 'about' | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/portfolio/service-worker.js').catch((error: unknown) => {
      console.warn('画像キャッシュ用Service Workerを登録できませんでした。', error);
    });
  }, []);
  const openProject = (project: Project) => {
    const url = new URL(window.location.href);
    url.searchParams.set('project', project.name);
    window.history.pushState({ portfolioProject: project.name }, '', url);
    setSelectedProject(project);
    window.scrollTo(0, 0);
  };

  const openProjectDirectory = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('project');
    url.searchParams.set('view', 'projects');
    window.history.pushState({ portfolioView: 'projects' }, '', url);
    setSelectedProject(null);
    setShowProjectDirectory(true);
    window.scrollTo(0, 0);
  };

  const returnToProjectDirectory = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('project');
    url.searchParams.delete('view');
    window.history.pushState({}, '', url);
    setSelectedProject(null);
    setShowProjectDirectory(false);
    setPendingHomeSection('top');
  };

  const navigateToHomeSection = (section: 'top' | 'projects' | 'about') => {
    const url = new URL(window.location.href);
    url.searchParams.delete('project');
    url.searchParams.delete('view');
    window.history.pushState({}, '', url);
    setSelectedProject(null);
    setShowProjectDirectory(false);
    setPendingHomeSection(section);
  };

  useEffect(() => {
    if (!pendingHomeSection || selectedProject || showProjectDirectory) return;
    const section = pendingHomeSection;
    const frame = window.requestAnimationFrame(() => {
      if (section === 'top') {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      } else {
        const target = document.getElementById(section);
        if (target) {
          const top = target.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({ top, left: 0, behavior: 'instant' });
        }
      }
      setPendingHomeSection(null);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pendingHomeSection, selectedProject, showProjectDirectory]);

  useEffect(() => {
    // 戻る・進むで画面が切り替わったとき、ブラウザのスクロール位置復元より先頭表示を優先する。
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';

    const onSelectProject = (event: Event) => {
      const name = (event as CustomEvent<string>).detail;
      const project = projects.find((item) => item.name === name);
      if (project) openProject(project);
    };
    const onPopState = () => {
      setSelectedProject(projectFromLocation());
      setShowProjectDirectory(isProjectDirectoryLocation());
      window.requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' }));
    };
    window.addEventListener('portfolio:select-project', onSelectProject);
    window.addEventListener('popstate', onPopState);
    return () => {
      window.removeEventListener('portfolio:select-project', onSelectProject);
      window.removeEventListener('popstate', onPopState);
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  return (
    <div className="shell" id="top">
      {!showProjectDirectory && <header className="nav">
        <a className="logo" href="#top" onClick={(event) => { event.preventDefault(); navigateToHomeSection('top'); }}>skotm</a>
        <nav aria-label="メインナビゲーション">
          <a href="#projects" onClick={(event) => { event.preventDefault(); navigateToHomeSection('projects'); }}>Projects</a>
          <a href="#about" onClick={(event) => { event.preventDefault(); navigateToHomeSection('about'); }}>About</a>
        </nav>
        <div className="social-links">
          <a className="gh social-icon" href="https://github.com/skotm" target="_blank" rel="noreferrer" aria-label="GitHub" title="GitHub">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.56.1.76-.24.76-.54v-2.1c-3.1.67-3.76-1.32-3.76-1.32-.51-1.3-1.24-1.65-1.24-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1 1.71 2.62 1.22 3.26.93.1-.73.39-1.22.71-1.5-2.48-.28-5.09-1.24-5.09-5.52 0-1.22.44-2.22 1.16-3-.12-.29-.5-1.42.11-2.96 0 0 .95-.3 3.05 1.15a10.6 10.6 0 0 1 5.55 0c2.1-1.45 3.05-1.15 3.05-1.15.61 1.54.23 2.67.11 2.96.72.78 1.16 1.78 1.16 3 0 4.29-2.62 5.23-5.11 5.51.4.35.76 1.03.76 2.08v3.1c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z"/></svg>
          </a>
          <a className="gh social-icon x-icon" href="https://x.com/skotm_0423?s=11" target="_blank" rel="noreferrer" aria-label="X" title="X">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.9 2H22l-6.78 7.75L23.2 22h-6.25l-4.9-7.36L5.6 22H2.46l7.25-8.28L1.8 2h6.4l4.43 6.77L18.9 2Zm-1.1 17.9h1.73L7.27 3.98H5.41L17.8 19.9Z"/></svg>
          </a>
        </div>
      </header>}

      <aside className="site-sidebar" aria-label="サイトサイドバー">
        <a className="sidebar-brand" href="#top" onClick={(event) => { event.preventDefault(); navigateToHomeSection('top'); }}>skotm<span>{selectedProject ? 'DOCUMENTATION' : 'PORTFOLIO'}</span></a>
        {!selectedProject ? <>
          <nav className="sidebar-nav" aria-label="ページ内ナビゲーション">
            <a href="#top" onClick={(event) => { event.preventDefault(); navigateToHomeSection('top'); }}><span>01</span> Profile</a>
            <a href="#projects" onClick={(event) => { event.preventDefault(); navigateToHomeSection('projects'); }}><span>02</span> Projects</a>
            <a href="#about" onClick={(event) => { event.preventDefault(); navigateToHomeSection('about'); }}><span>03</span> About</a>
          </nav>
          <div className="sidebar-projects"><span className="sidebar-label">PROJECTS</span>
            {projects.map((project, index) => <a key={project.name} href="#projects" onClick={(event) => { event.preventDefault(); openProject(project); }}><span>{String(index + 1).padStart(2, '0')}</span>{project.name}</a>)}
          </div>
        </> : <>
          <a className="sidebar-back" href="#projects" onClick={(event) => { event.preventDefault(); returnToProjectDirectory(); }}>← トップページに戻る</a>
          <div className="sidebar-projects"><span className="sidebar-label">README CONTENTS</span>
            {headings.map((heading) => <a key={heading.id} className={activeHeading === heading.id ? 'is-active' : ''} href={'#' + heading.id} onClick={(event) => { event.preventDefault(); const target = document.querySelector<HTMLElement>('.readme-content #' + CSS.escape(heading.id)); if (target) { const top = target.getBoundingClientRect().top + window.scrollY - 24; window.scrollTo({ top, left: 0, behavior: 'smooth' }); } setActiveHeading(heading.id); }}><span>{'—'}</span>{heading.text}</a>)}
          </div>
          <div className="sidebar-projects sidebar-other-projects"><span className="sidebar-label">PROJECTS</span>{projects.map((project,index)=><a key={project.name} href="#documentation" onClick={(event)=>{event.preventDefault();openProject(project);}} className={project.name===selectedProject.name?'is-active':''}><span>{String(index+1).padStart(2,'0')}</span>{project.name}</a>)}</div>
        </>}
        <div className="sidebar-socials"><a href="https://github.com/skotm" target="_blank" rel="noreferrer">GitHub ↗</a><a href="https://x.com/skotm_0423?s=11" target="_blank" rel="noreferrer">X ↗</a></div>
      </aside>
      {selectedProject ? <main id="documentation"><ProjectDetails key={selectedProject.name} project={selectedProject} headings={headings} setHeadings={setHeadings} activeHeading={activeHeading} setActiveHeading={setActiveHeading} onBack={() => navigateToHomeSection('top')} /></main> : showProjectDirectory ? <main id="project-directory">
        <section className="project-directory-page">
          <header className="project-directory-header">
            <h1>All Projects</h1>
            <p>開発したアプリケーション、可視化ツールの一覧。</p>
          </header>
          <div className="project-directory-filters" aria-label="カテゴリで絞り込む">
            {['すべて', ...Array.from(new Set(projects.map((project) => project.category)))].map((category) => <button key={category} type="button" className={projectCategory === category ? 'is-active' : ''} aria-pressed={projectCategory === category} onClick={() => setProjectCategory(category)}>{category}</button>)}
          </div>
          <div className="project-directory-grid projects">
            {projects.filter((project) => projectCategory === 'すべて' || project.category === projectCategory).map((project) => (
              <article className="project" key={project.name}>
                <div className="project-meta">
                  {!project.image && <span>{String(projects.indexOf(project) + 1).padStart(2, '0')}</span>}
                  {!project.image && project.status && <span>{project.status}</span>}
                </div>
                {project.image && (
                  project.url ? (
                    <a className="project-image-link" href={project.url} target="_blank" rel="noreferrer" aria-label={project.name + ' のGitHubリポジトリを開く'}>
                      <img className="project-image" src={project.image} alt="" loading="lazy" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
                      <span className="project-image-shade" aria-hidden="true" />
                      <span className="project-image-number">{String(projects.indexOf(project) + 1).padStart(2, '0')}</span>
                      <span className="project-image-caption">
                        <span className="project-image-title">{project.name}</span>
                        <span className="project-image-tags">
                          <span>{project.category}</span>
                          {project.status && <span>{project.status}</span>}
                        </span>
                      </span>
                    </a>
                  ) : (
                    <div className="project-image-link">
                      <img className="project-image" src={project.image} alt="" loading="lazy" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
                      <span className="project-image-shade" aria-hidden="true" />
                      <span className="project-image-number">{String(projects.indexOf(project) + 1).padStart(2, '0')}</span>
                      <span className="project-image-caption">
                        <span className="project-image-title">{project.name}</span>
                        <span className="project-image-tags">
                          <span>{project.category}</span>
                          {project.status && <span>{project.status}</span>}
                        </span>
                      </span>
                    </div>
                  )
                )}
                {!project.image && <>
                  <h3>{project.name}</h3>
                  <p className="project-category">{project.category}</p>
                </>}
                <p>{project.description}</p>
                {project.url && <div className="project-actions">
                  <button className="details-button" onClick={() => openProject(project)}>詳細 <span>↗</span></button>
                  <a className="repo-pill" href={project.url} target="_blank" rel="noreferrer" aria-label={project.name + ' のGitHubリポジトリ'}>
                    <span>GitHub repository</span><span aria-hidden="true">↗</span>
                  </a>
                </div>}
              </article>
            ))}
          </div>
          <button className="directory-home-link" type="button" onClick={() => navigateToHomeSection('top')}>← トップページへ戻る</button>
        </section>
      </main> : <main>
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
          <div className="heading projects-heading">
            <div>
              <h2>Projects</h2>
            </div>
            <a className="view-all-projects" href="?view=projects" onClick={(event) => { event.preventDefault(); openProjectDirectory(); }}>一覧をみる <span aria-hidden="true">→</span></a>
          </div>
          <div className="projects">
            {projects.map((project, index) => (
              <article className="project" key={project.name}>
                <div className="project-meta">
                  {!project.image && <span>{String(index + 1).padStart(2, '0')}</span>}
                  {!project.image && project.status && <span>{project.status}</span>}
                </div>
                {project.image && (
                  project.url ? (
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
                  ) : (
                    <div className="project-image-link">
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
                    </div>
                  )
                )}
                {!project.image && <>
                  <h3>{project.name}</h3>
                  <p className="project-category">{project.category}</p>
                </>}
                <p>{project.description}</p>
                {project.url && project.owner && project.repo && <div className="project-actions">
                  <button className="details-button" onClick={() => openProject(project)}>詳細 <span>↗</span></button>
                  <a className="repo-pill" href={project.url} target="_blank" rel="noreferrer" aria-label={project.name + ' のGitHubリポジトリ'}>
                    <span>GitHub repository</span><span aria-hidden="true">↗</span>
                  </a>
                </div>}
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

      <footer className="site-footer">
        <p>© 2026 skotm. All rights reserved.</p>
      </footer>
    </div>
  );
}
