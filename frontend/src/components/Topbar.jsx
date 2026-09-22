import { useAuth } from '../context/AuthContext.jsx';

export default function Topbar({ mode, setMode }) {
  const { logout } = useAuth();
  return (
    <div className="topbar">
      <div className="topbar-inner">
        <div className="brand">
          <span className="brand-mark">My Portfolio</span>
        </div>
        <div className="mode-switch" role="tablist" aria-label="View mode">
          <button className={mode === 'edit' ? 'active' : ''} onClick={() => setMode('edit')}>Edit</button>
          <button className={mode === 'preview' ? 'active' : ''} onClick={() => setMode('preview')}>Preview</button>
        </div>
        <div className="topbar-actions">
          <button className="icon-btn logout-link" onClick={logout}>Log out</button>
        </div>
      </div>
    </div>
  );
}
