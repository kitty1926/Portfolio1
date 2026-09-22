import { useRef, useState } from 'react';
import { api, BASE_URL } from '../lib/api';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProfilePanel({ views }) {
  const { profile, setProfile } = useAuth();
  const fileInput = useRef(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 1600);
  }

  async function save(field, value) {
    setProfile((p) => ({ ...p, [field]: value }));
    setSaving(true);
    try {
      const updated = await api.updateProfile({ [field]: value });
      setProfile(updated);
      showToast('Saved');
    } catch (err) {
      showToast(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('photo', file);
    try {
      const updated = await api.uploadPhoto(formData);
      setProfile(updated);
      showToast('Photo updated');
    } catch (err) {
      showToast(err.message);
    }
    e.target.value = '';
  }

  async function removePhoto() {
    try {
      const updated = await api.removePhoto();
      setProfile(updated);
    } catch (err) {
      showToast(err.message);
    }
  }

  if (!profile) return null;
  const initials = `${(profile.first_name || '')[0] || ''}${(profile.last_name || '')[0] || ''}`;
  const photoSrc = profile.photo_url ? `${BASE_URL}${profile.photo_url}` : '';

  return (
    <div>
      <div className="stat-row">
        <div className="stat-card"><div className="num">{views ?? 0}</div><div className="label">Portfolio views</div></div>
      </div>
      <div className="panel-head">
        <h2>Profile</h2>
        <p>This is the top of your portfolio — your name, what you do, and a short bio.</p>
      </div>

      <div className="photo-row">
        <div className="photo-preview">
          {profile.photo_url ? <img src={photoSrc} alt="" /> : <span>{initials || '＋'}</span>}
        </div>
        <div className="photo-actions">
          <button type="button" className="ghost-btn" onClick={() => fileInput.current.click()}>
            {profile.photo_url ? 'Change photo' : 'Upload photo'}
          </button>
          {profile.photo_url && <button type="button" className="remove-btn" onClick={removePhoto}>Remove</button>}
          <input ref={fileInput} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
        </div>
      </div>

      <div className="field-grid cols-2">
        <div className="field-row">
          <label>First name</label>
          <input type="text" defaultValue={profile.first_name || ''} onBlur={(e) => save('first_name', e.target.value)} />
        </div>
        <div className="field-row">
          <label>Last name</label>
          <input type="text" defaultValue={profile.last_name || ''} onBlur={(e) => save('last_name', e.target.value)} />
        </div>
      </div>
      <div className="field-row" style={{ maxWidth: 'calc(50% - 7px)' }}>
        <label>Middle name (optional)</label>
        <input type="text" defaultValue={profile.middle_name || ''} onBlur={(e) => save('middle_name', e.target.value)} />
      </div>
      <div className="field-row">
        <label>Bio</label>
        <textarea defaultValue={profile.bio || ''} onBlur={(e) => save('bio', e.target.value)} />
      </div>
      <div className="field-row">
        <label className="check-row">
          <input type="checkbox" checked={!!profile.is_public} onChange={(e) => save('is_public', e.target.checked)} />
          Make my portfolio public
        </label>
      </div>

      {profile.is_public && (
        <div className="public-link-box">
          Your public link: <code>{`${window.location.origin}/p/${profile.profile_id}`}</code>
        </div>
      )}
      {toast && <div className="save-bar"><span className="save-dot" /> {toast}</div>}
    </div>
  );
}
