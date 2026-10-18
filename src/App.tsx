import { useMemo, useState } from 'react';
const projects = [
 ['01','MeteoQuake','Monitoring','地震・気象の情報を横断し、変化を見つけるためのモニタリングツール。','React · Real-time data · 防災'],
 ['02','JMA XML Monitor','Data tools','気象庁防災情報XMLを取得し、情報種別ごとに整理・解析するビューア。','TypeScript · XML · Visualization'],
 ['03','Terrain Flow Simulator','Simulation','地形・水流・侵食の相互作用をブラウザ上で観察する実験環境。','Three.js · Physics · WebGL'],
 ['04','Earthquake & Tsunami Simulator','Simulation','断層による海底変位から津波伝播までを段階的に扱う統合シミュレータ構想。','Geophysics · Numerical methods'],
 ['05','Design AI Studio','Creative tools','アイデアをUIの構造と、開発へ引き継げる仕様へつなぐデザインツール。','UI design · Prototyping'],
 ['06','Earthquake Data API','Infrastructure','地震イベントを蓄積・配信するための軽量APIとデータ形式を設計。','API · Cloudflare · Data engineering'],
];
const notes = [
 {date:'2026.10.17',category:'開発ログ',title:'地震・津波統合シミュレータの設計を固める',text:'断層中心を基準にした矩形断層モデルから始め、広域の津波計算へつなぐ。精度と実装可能性を段階的に両立させる。',tags:'Simulation Geophysics'},
 {date:'2026.10.15',category:'技術ノート',title:'防災情報XMLを、読めるデータにする',text:'情報種別ごとに異なるXMLを共通構造で扱いつつ、地震・津波・気象の詳細解析をどう設計するか。',tags:'XML TypeScript'},
 {date:'2026.10.12',category:'研究ノート',title:'シミュレーションは何を省略できるか',text:'何を残し、何を近似するか。モデルの境界を明示することから始める。',tags:'Modeling Research'},
 {date:'2026.10.08',category:'開発ログ',title:'地形と水流をブラウザで動かす',text:'浅水流モデルを起点に、地形編集・水源・侵食の関係を試せる実験環境を組み立てる。',tags:'Three.js Physics'},
 {date:'2026.10.03',category:'技術ノート',title:'小さく作る、観測できるAPI',text:'イベントID、履歴取得、配信データの圧縮。あとから検証できる仕組みを最初から組み込む。',tags:'API Cloudflare'},
];
const filters = ['すべて','開発ログ','研究ノート','技術ノート'];
export default function App() {
 const [filter,setFilter] = useState('すべて'); const [query,setQuery] = useState('');
 const visible = useMemo(()=>notes.filter(n=>(filter==='すべて'||n.category===filter)&&`${n.title} ${n.text} ${n.tags}`.toLowerCase().includes(query.toLowerCase())),[filter,query]);
 return <div className="shell"><header className="nav"><a className="logo" href="#top">skotm<span>®</span></a><nav><a href="#work">Projects</a><a href="#journal">Journal</a><a href="#about">About</a></nav><a className="gh" href="https://github.com/skotm" target="_blank" rel="noreferrer">GitHub ↗</a></header>
 <main id="top"><section className="hero"><div className="kicker"><i/> INDEPENDENT RESEARCH & DEVELOPMENT <span>2026 —</span></div><div className="planet"><div/><b>OBSERVE → MODEL</b></div><h1>Curiosity into<br/><em>working systems.</em></h1><div className="hero-bottom"><p>地球の動き、データ、ソフトウェア。<br/>観察からはじめて、考え、つくり、確かめる。</p><a className="down" href="#work">↓</a><small>A personal lab for<br/>earth science & software.</small></div></section>
 <section className="intro"><span className="eyebrow">01 / APPROACH</span><p>I build tools that make complex systems <em>easier to observe.</em></p><span>↘</span></section>
 <section className="section" id="work"><div className="heading"><div><span className="eyebrow">02 / SELECTED WORK</span><h2>Projects<sup>06</sup></h2></div><p>研究のための道具から、<br/>動くプロトタイプまで。</p></div><div className="projects">{projects.map(p=><article className="project" key={p[0]}><div className="project-meta"><span>{p[0]} / {p[2]}</span><span>IN DEVELOPMENT</span></div><div className={`art art-${p[0]}`}><div className="grid"/><strong>{['〰','⌁','∿','≈','✳','↗'][Number(p[0])-1]}</strong><small>SK / {p[0]}</small></div><h3>{p[1]}</h3><p>{p[3]}</p><div className="tags">{p[4].split(' · ').map(t=><span key={t}>{t}</span>)}</div><div className="project-foot">CONCEPT → PROTOTYPE <span>↗</span></div></article>)}</div></section>
 <section className="journal" id="journal"><div className="heading"><div><span className="eyebrow">03 / NOTES & PROCESS</span><h2>Journal<sup>{String(visible.length).padStart(2,'0')}</sup></h2></div><p>完成品だけでなく、<br/>途中の考えも記録する。</p></div><div className="tools"><div className="filters">{filters.map(f=><button key={f} className={filter===f?'selected':''} onClick={()=>setFilter(f)}>{f}</button>)}</div><label className="search">⌕ <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="ノートを検索" aria-label="ノートを検索"/></label></div><div className="notes">{visible.map((n,i)=><article className="note" key={n.title}><span className="note-no">{String(i+1).padStart(2,'0')}</span><div><div className="note-meta"><time>{n.date}</time><span>{n.category}</span></div><h3>{n.title}</h3><p>{n.text}</p><div className="note-tags">{n.tags.split(' ').map(t=><span key={t}>#{t}</span>)}</div></div><span className="arrow">↗</span></article>)}{!visible.length&&<p className="empty">該当するノートはありません。</p>}</div><p className="sample-note">※ Journalはプロジェクトの設計・検討過程を紹介するサンプル記事です。</p></section>
 <section className="about" id="about"><span className="eyebrow">04 / ABOUT</span><div className="about-grid"><h2>Stay curious.<br/><em>Make it tangible.</em></h2><div><p>自然現象の複雑さと、ソフトウェアで仕組みをつくる面白さ。その交点を探しながら、観測・解析・可視化のための道具を開発しています。</p><p>完成したものだけでなく、試行錯誤やモデルの限界も含めて記録する。小さく実装し、検証し、次の問いにつなげることを大切にしています。</p><a className="about-link" href="https://github.com/skotm" target="_blank" rel="noreferrer">GitHubで開発を見る <span>↗</span></a></div></div><div className="principles"><div><span>01</span><b>Observe first</b><p>現象とデータを丁寧に見る。</p></div><div><span>02</span><b>Model with intent</b><p>仮定と限界を明らかにする。</p></div><div><span>03</span><b>Build to learn</b><p>つくることで理解を深める。</p></div></div></section></main><footer><a className="logo" href="#top">skotm<span>®</span></a><small>INDEPENDENTLY MADE · 2026</small><a href="#top">BACK TO TOP ↑</a></footer></div>;
}
