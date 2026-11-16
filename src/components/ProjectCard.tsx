import type { Project } from '../types/project';
import GlassButton from './GlassButton';
import GlassPanel from './GlassPanel';
import ProjectImage from './ProjectImage';

type Props = {
  project: Project;
  /** 0始まりの通し番号（全プロジェクト中の位置） */
  index: number;
  eager?: boolean;
  /** true: owner/repoが揃うときだけ操作ボタンを出す（トップ） / false: urlがあれば出す（All Projects） */
  requireRepo?: boolean;
  onOpen: (project: Project) => void;
};

export default function ProjectCard({ project, index, eager = false, requireRepo = false, onOpen }: Props) {
  const number = String(index + 1).padStart(2, '0');
  const hasActions = requireRepo ? Boolean(project.url && project.owner && project.repo) : Boolean(project.url);
  const media = project.image ? (
    <>
      <ProjectImage src={project.image} eager={eager} />
      <span className="project-image-shade" aria-hidden="true" />
      <span className="project-image-number">{number}</span>
      <span className="project-image-caption">
        <span className="project-image-title">{project.name}</span>
        <span className="project-image-tags">
          <span>{project.category}</span>
          {project.status && <span>{project.status}</span>}
        </span>
      </span>
    </>
  ) : null;

  return (
    <GlassPanel as="article" className="project">
      <div className="project-meta">
        {!project.image && <span>{number}</span>}
        {!project.image && project.status && <span>{project.status}</span>}
      </div>
      {project.image && (
        project.url ? (
          <a className="project-image-link" href={project.url} target="_blank" rel="noreferrer" aria-label={project.name + ' のGitHubリポジトリを開く'}>{media}</a>
        ) : (
          <div className="project-image-link">{media}</div>
        )
      )}
      {!project.image && <>
        <h3>{project.name}</h3>
        <p className="project-category">{project.category}</p>
      </>}
      <p>{project.description}</p>
      {hasActions && <div className="project-actions">
        <GlassButton tone="solid" className="details-button" onClick={() => onOpen(project)}>詳細 <span>↗</span></GlassButton>
        <GlassButton as="a" className="repo-pill" href={project.url} target="_blank" rel="noreferrer" aria-label={project.name + ' のGitHubリポジトリ'}>
          <span>GitHub repository</span><span aria-hidden="true">↗</span>
        </GlassButton>
      </div>}
    </GlassPanel>
  );
}
