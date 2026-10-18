import { useEffect, useState } from 'react';

type Project = {
  name: string;
  category: string;
  description: string;
  status: string;
  image?: string;
  url: string;
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
    description: '強震モニタの観測情報を可視化するビューワー。',
    status: '',
    image: 'https://github.com/user-attachments/assets/6f18089b-818d-495b-9cc3-c3103e849489',
    url: 'https://github.com/skotm/MeteoQuake-KyoshinViewer',
    owner: 'skotm',
    repo: 'MeteoQuake-KyoshinViewer',
  },
  {
    name: 'WIS Viewer',
    category: '気象情報可視化',
    description: '気象庁の公開データを使い、気温・降水量・風・台風・警報・雨雲レーダーなどを地図上に表示するツール。',
    status: '',
    url: 'https://github.com/skotm/wis-viewer',
    owner: 'skotm',
    repo: 'wis-viewer',
  },
  {
    name: 'EQS Viewer',
    category: '地震情報可視化',
    description: '地震情報や観測データをリアルタイムで表示するWebアプリケーション。',
    status: '',
    url: 'https://github.com/skotm/eqs-viewer',
    owner: 'skotm',
    repo: 'eqs-viewer',
  },
  {
    name: 'EQS',
    category: '地震シミュレーション',
    description: '仮想地震の発生から揺れの伝播までを再現するシミュレーションツール。',
    status: '',
    url: 'https://github.com/skotm/eqs',
    owner: 'skotm',
    repo: 'eqs',
  },
];

function sanitizeReadmeHtml(html: string): string {
  const document = new DOMParser().parseFromString(html, 'text/html');
  document.querySelectorAll('script, style, iframe, object, embed, form, input, button').forEach((node) => node.remove());
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
  return document.body.innerHTML;
}

function ReadmeContent({ html }: { html: string }) {
  return <div className="readme-content" dangerouslySetInnerHTML={{ __html: sanitizeReadmeHtml(html) }} />;
}
function ProjectDetails({ project, onClose }: { project: Project; onClose: () => void }) {
  const [readme, setReadme] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    return () => controller.abort();
  }, [project.owner, project.repo]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className="details-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="details-dialog" role="dialog" aria-modal="true" aria-labelledby="details-title">
        <div className="details-header">
          <div>
            <span className="eyebrow">REPOSITORY DETAILS</span>
            <h2 id="details-title">{project.name}</h2>
            <p>{project.category}</p>
          </div>
          <button className="details-close" onClick={onClose} aria-label="詳細を閉じる">×</button>
        </div>
        <p className="details-description">{project.description}</p>
        <div className="readme-heading">
          <h3>README</h3>
          <a href={project.url + '#readme'} target="_blank" rel="noreferrer">GitHubで開く ↗</a>
        </div>
        <div className="readme-panel">
          {loading && <p className="readme-state">READMEを読み込み中…</p>}
          {!loading && error && <div className="readme-state"><p>{error}</p><a href={project.url + '#readme'} target="_blank" rel="noreferrer">GitHubでREADMEを見る ↗</a></div>}
          {!loading && !error && readme && <ReadmeContent html={readme} />}
        </div>
        <div className="details-footer">
          <span>READMEはGitHubから取得しています</span>
          <a className="repo-pill" href={project.url} target="_blank" rel="noreferrer">リポジトリを開く <span>↗</span></a>
        </div>
      </section>
    </div>
  );
}

export default function App() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  return (
    <div className="shell" id="top">
      <header className="nav">
        <a className="logo" href="#top">skotm</a>
        <nav aria-label="メインナビゲーション">
          <a href="#projects">Projects</a>
          <a href="#about">About</a>
        </nav>
        <div className="social-links">
          <a className="gh" href="https://github.com/skotm" target="_blank" rel="noreferrer">GitHub ↗</a>
          <a className="gh" href="https://x.com/skotm_0423?s=11" target="_blank" rel="noreferrer">X ↗</a>
        </div>
      </header>

      <main>
        <section className="hero">
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
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  {project.status && <span>{project.status}</span>}
                </div>
                {project.image && (
                  <a className="project-image-link" href={project.url} target="_blank" rel="noreferrer" aria-label={project.name + ' のプレビュー'}>
                    <img className="project-image" src={project.image} alt={project.name + ' のプレビュー'} loading="lazy" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
                  </a>
                )}
                <h3>{project.name}</h3>
                <p className="project-category">{project.category}</p>
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
                <a className="about-link" href="https://github.com/skotm" target="_blank" rel="noreferrer">GitHubプロフィール <span>↗</span></a>
                <a className="about-link" href="https://x.com/skotm_0423?s=11" target="_blank" rel="noreferrer">Xプロフィール <span>↗</span></a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <a className="logo" href="#top">skotm</a>
        <a href="#top">ページ上部へ ↑</a>
      </footer>
      {selectedProject && <ProjectDetails project={selectedProject} onClose={() => setSelectedProject(null)} />}
    </div>
  );
}
