import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';

const RESOURCES = ['education', 'experience', 'skills', 'tech-stack', 'social-links', 'testimonials'];

export function usePortfolioData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refetch = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [profile, education, experience, skills, techStack, socialLinks, testimonials, projects, messages] = await Promise.all([
        api.getProfile(),
        api.list('education'),
        api.list('experience'),
        api.list('skills'),
        api.list('tech-stack'),
        api.list('social-links'),
        api.list('testimonials'),
        api.list('projects'),
        api.getMessages()
      ]);
      setData({
        profile,
        education,
        experience,
        skills,
        tech_stack: techStack,
        social_link: socialLinks,
        testimonial: testimonials,
        project: projects,
        messages
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  return { data, loading, error, refetch };
}

export { RESOURCES };
