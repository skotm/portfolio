const projects = [
  {
    name: 'MeteoQuake',
    category: '地震・気象・防災',
    description: '地震・気象・防災情報を扱うアプリケーション。',
    status: '開発中',
    url: 'https://github.com/skotm/MeteoQuake',
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
                <h3>{project.name}</h3>
                <p className="project-category">{project.category}</p>
                <p>{project.description}</p>
                <div className="project-foot">
                  <span>GitHub repository</span>
                  <a href={project.url} target="_blank" rel="noreferrer" aria-label={project.name + ' のGitHubリポジトリ'}>↗</a>
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
