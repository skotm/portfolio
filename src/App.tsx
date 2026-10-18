const projects = [
  {
    name: 'MeteoQuake',
    category: '地震・気象・防災',
    description: '地震・気象・防災情報を扱うアプリケーション。',
    status: '開発中',
    image: 'https://github-production-user-asset-6210df.s3.amazonaws.com/260800475/623613404-c5297fdd-1c50-4b18-bb80-b0be32356a59.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAVCODYLSA53PQK4ZA%2F20261018%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20261018T073002Z&X-Amz-Expires=300&X-Amz-Signature=a1ac69e210c365110862dc4a9e0e3968909bc331ed1d8677401b16af938292c0&X-Amz-SignedHeaders=host&response-content-type=image%2Fpng',
    url: 'https://github.com/skotm/MeteoQuake',
  },
  {
    name: 'MeteoQuake-KyoshinViewer',
    category: '強震モニタ可視化',
    description: '強震モニタの観測情報を可視化するビューワー。',
    status: '',
    image: 'https://github.com/user-attachments/assets/6f18089b-818d-495b-9cc3-c3103e849489',
    url: 'https://github.com/skotm/MeteoQuake-KyoshinViewer',
  },
  {
    name: 'WIS Viewer',
    category: '気象情報可視化',
    description: '気象庁の公開データを使い、気温・降水量・風・台風・警報・雨雲レーダーなどを地図上に表示するツール。',
    status: '',
    url: 'https://github.com/skotm/wis-viewer',
  },
  {
    name: 'EQS Viewer',
    category: '地震情報可視化',
    description: '地震情報や観測データをリアルタイムで表示するWebアプリケーション。',
    status: '',
    url: 'https://github.com/skotm/eqs-viewer',
  },
  {
    name: 'EQS',
    category: '地震シミュレーション',
    description: '仮想地震の発生から揺れの伝播までを再現するシミュレーションツール。',
    status: '',
    url: 'https://github.com/skotm/eqs',
  },
];

export default function App() {
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
            <a className="down" href="#projects" aria-label="プロジェクト一覧へ">↓</a>
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
                    <img className="project-image" src={project.image} alt={project.name + ' のスクリーンショット'} loading="lazy" />
                  </a>
                )}
                <h3>{project.name}</h3>
                <p className="project-category">{project.category}</p>
                <p>{project.description}</p>
                <div className="project-foot">
                  <a className="repo-pill" href={project.url} target="_blank" rel="noreferrer" aria-label={project.name + ' のGitHubリポジトリ'}>
                    <span>GitHub repository</span>
                    <span aria-hidden="true">↗</span>
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
    </div>
  );
}
