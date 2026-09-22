import { useEffect, useState } from 'react';
import { api } from '../lib/api';

const NEW_PROJECT = { title: '', description: '', demo_url: '', is_featured: false, display_order: 0 };

export default function ProjectsPanel() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.list('projects').then(setProjects).finally(() => setLoading(false));
  }, []);

  async function addProject() {
    const created = await api.create('projects', { ...NEW_PROJECT, display_order: projects.length });
    setProjects((prev) => [...prev, { ...created, media: [] }]);
  }

  async function removeProject(id) {
    await api.remove('projects', id);
    setProjects((prev) => prev.filter((p) => p.project_id !== id));
  }

  function updateLocal(id, field, value) {
    setProjects((prev) => prev.map((p) => (p.project_id === id ? { ...p, [field]: value } : p)));
  }

  async function persistField(id, field, value) {
    const updated = await api.update('projects', id, { [field]: value });
    setProjects((prev) => prev.map((p) => (p.project_id === id ? { ...updated, media: p.media } : p)));
  }

  async function addMedia(projectId) {
    const project = projects.find((p) => p.project_id === projectId);
    const nextOrder = project.media.length ? Math.max(...project.media.map((m) => m.display_order)) + 1 : 0;
    const created = await api.addMedia(projectId, { media_url: '', display_order: nextOrder });
    setProjects((prev) => prev.map((p) => (p.project_id === projectId ? { ...p, media: [...p.media, created] } : p)));
  }

  async function updateMediaUrl(projectId, mediaId, value) {
    setProjects((prev) => prev.map((p) => p.project_id === projectId
      ? { ...p, media: p.media.map((m) => (m.project_media_id === mediaId ? { ...m, media_url: value } : m)) }
      : p));
  }

  async function persistMediaUrl(projectId, mediaId, value) {
    await api.updateMedia(projectId, mediaId, { media_url: value });
  }

  async function removeMedia(projectId, mediaId) {
    await api.removeMedia(projectId, mediaId);
    setProjects((prev) => prev.map((p) => p.project_id === projectId
      ? { ...p, media: p.media.filter((m) => m.project_media_id !== mediaId) }
      : p));
  }

  async function moveMedia(projectId, mediaId, dir) {
    const project = projects.find((p) => p.project_id === projectId);
    const sorted = [...project.media].sort((a, b) => a.display_order - b.display_order);
    const idx = sorted.findIndex((m) => m.project_media_id === mediaId);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const a = sorted[idx], b = sorted[swapIdx];
    const [aOrder, bOrder] = [a.display_order, b.display_order];
    await Promise.all([
      api.updateMedia(projectId, a.project_media_id, { display_order: bOrder }),
      api.updateMedia(projectId, b.project_media_id, { display_order: aOrder })
    ]);
    setProjects((prev) => prev.map((p) => p.project_id === projectId
      ? { ...p, media: p.media.map((m) => {
          if (m.project_media_id === a.project_media_id) return { ...m, display_order: bOrder };
          if (m.project_media_id === b.project_media_id) return { ...m, display_order: aOrder };
          return m;
        }) }
      : p));
  }

  if (loading) return <div className="empty-note">Loading…</div>;

  return (
    <div>
      <div className="panel-head">
        <h2>Projects</h2>
        <p>The work you want visitors to see first.</p>
      </div>
      {projects.length === 0 && <div className="empty-note">No projects yet — this is usually the section people look at first.</div>}
      {projects.map((project) => (
        <div className="card-form" key={project.project_id}>
          <div className="card-form-head">
            <span className="badge">{project.title || 'New project'}</span>
            <button className="remove-btn" onClick={() => removeProject(project.project_id)}>Remove</button>
          </div>
          <div className="field-row">
            <label>Title</label>
            <input
              type="text" defaultValue={project.title || ''}
              onChange={(e) => updateLocal(project.project_id, 'title', e.target.value)}
              onBlur={(e) => persistField(project.project_id, 'title', e.target.value)}
            />
          </div>
          <div className="field-row">
            <label>Description</label>
            <textarea
              defaultValue={project.description || ''}
              onChange={(e) => updateLocal(project.project_id, 'description', e.target.value)}
              onBlur={(e) => persistField(project.project_id, 'description', e.target.value)}
            />
          </div>
          <div className="field-grid cols-2">
            <div className="field-row">
              <label>Link (optional)</label>
              <input
                type="url" placeholder="https://…" defaultValue={project.demo_url || ''}
                onChange={(e) => updateLocal(project.project_id, 'demo_url', e.target.value)}
                onBlur={(e) => persistField(project.project_id, 'demo_url', e.target.value)}
              />
            </div>
            <div className="field-row">
              <label className="check-row">
                <input
                  type="checkbox" checked={!!project.is_featured}
                  onChange={(e) => { updateLocal(project.project_id, 'is_featured', e.target.checked); persistField(project.project_id, 'is_featured', e.target.checked); }}
                />
                Feature this project
              </label>
            </div>
          </div>

          <div className="media-editor">
            <label>Media (images for this project)</label>
            {project.media.length === 0 && <div className="media-empty">No images added — the preview will show initials instead.</div>}
            {[...project.media].sort((a, b) => a.display_order - b.display_order).map((m, i, arr) => (
              <div className="media-row" key={m.project_media_id}>
                <input
                  type="url" placeholder="https://… image URL" defaultValue={m.media_url || ''}
                  onChange={(e) => updateMediaUrl(project.project_id, m.project_media_id, e.target.value)}
                  onBlur={(e) => persistMediaUrl(project.project_id, m.project_media_id, e.target.value)}
                />
                <button type="button" className="media-move" disabled={i === 0} onClick={() => moveMedia(project.project_id, m.project_media_id, -1)}>↑</button>
                <button type="button" className="media-move" disabled={i === arr.length - 1} onClick={() => moveMedia(project.project_id, m.project_media_id, 1)}>↓</button>
                <button type="button" className="remove-btn" onClick={() => removeMedia(project.project_id, m.project_media_id)}>Remove</button>
              </div>
            ))}
            <button type="button" className="add-btn small" onClick={() => addMedia(project.project_id)}>+ Add image URL</button>
          </div>
        </div>
      ))}
      <button className="add-btn" onClick={addProject}>+ Add project</button>
    </div>
  );
}
