import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';
import PortfolioView from '../components/PortfolioView.jsx';

export default function PublicPage() {
  const { profileId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getPublicProfile(profileId)
      .then(setData)
      .catch((err) => setError(err.message));
  }, [profileId]);

  if (error) {
    return (
      <div className="portfolio">
        <div className="p-empty-portfolio">
          <h2>This portfolio isn't available</h2>
          <p>It may be private, or the link may be incorrect.</p>
        </div>
      </div>
    );
  }
  if (!data) return <div className="loading-screen">Loading…</div>;

  return <PortfolioView data={data} showContactForm profileId={profileId} />;
}
