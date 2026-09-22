import { useState, useEffect } from 'react';
import Topbar from '../components/Topbar.jsx';
import ProfilePanel from '../components/ProfilePanel.jsx';
import RepeatablePanel from '../components/RepeatablePanel.jsx';
import ProjectsPanel from '../components/ProjectsPanel.jsx';
import InboxPanel from '../components/InboxPanel.jsx';
import PortfolioView from '../components/PortfolioView.jsx';
import { usePortfolioData } from '../hooks/usePortfolioData.js';
import { api } from '../lib/api';

const NAV = [
  { key: 'profile', label: 'Profile' },
  { key: 'social_link', label: 'Social links' },
  { key: 'experience', label: 'Experience' },
  { key: 'education', label: 'Education' },
  { key: 'skills', label: 'Skills' },
  { key: 'tech-stack', label: 'Tech stack' },
  { key: 'project', label: 'Projects' },
  { key: 'testimonials', label: 'Testimonials' },
  { key: 'inbox', label: 'Messages' }
];

export default function EditorPage() {
  const [mode, setMode] = useState('edit');
  const [section, setSection] = useState('profile');
  const [views, setViews] = useState(0);

  useEffect(() => {
    api.getAnalytics().then((a) => setViews(a.viewers_collect || 0)).catch(() => {});
  }, []);

  return (
    <div id="app">
      <Topbar mode={mode} setMode={setMode} />
      <main>
        {mode === 'edit' ? (
          <EditView section={section} setSection={setSection} views={views} />
        ) : (
          <PreviewView />
        )}
      </main>
    </div>
  );
}

function EditView({ section, setSection, views }) {
  return (
    <>
      <div className="builder-tabs-mobile">
        {NAV.map((n) => (
          <button key={n.key} className={section === n.key ? 'active' : ''} onClick={() => setSection(n.key)}>{n.label}</button>
        ))}
      </div>
      <div className="builder">
        <nav className="builder-nav">
          {NAV.map((n) => (
            <button key={n.key} className={section === n.key ? 'active' : ''} onClick={() => setSection(n.key)}>
              <span>{n.label}</span>
            </button>
          ))}
        </nav>
        <div className="builder-panel">
          {section === 'profile' && <ProfilePanel views={views} />}
          {section === 'project' && <ProjectsPanel />}
          {section === 'inbox' && <InboxPanel />}
          {['social_link', 'experience', 'education', 'skills', 'tech-stack', 'testimonials'].includes(section) && (
            <RepeatablePanel schemaKey={section} />
          )}
        </div>
      </div>
    </>
  );
}

function PreviewView() {
  const { data, loading } = usePortfolioData();
  if (loading) return <div className="loading-screen">Loading your portfolio…</div>;
  return <PortfolioView data={data} showContactForm={false} />;
}
