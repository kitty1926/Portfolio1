import { useState } from 'react';
import { BASE_URL, api } from '../lib/api';

function fmtDate(d) {
  if (!d) return '';
  const date = new Date(d);
  if (isNaN(date)) return d;
  return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
}

export default function PortfolioView({ data, showContactForm, profileId }) {
  if (!data) return null;
  const p = data.profile;
  const fullName = [p.first_name, p.middle_name, p.last_name].filter(Boolean).join(' ') || 'Your name';
  const hasAnything = p.first_name || p.last_name || (data.experience || []).length || (data.project || []).length;

  if (!hasAnything) {
    return (
      <div className="portfolio">
        <div className="p-empty-portfolio">
          <h2>Nothing to preview yet</h2>
          <p>Fill in your profile and a project or two, and your portfolio will appear here.</p>
        </div>
      </div>
    );
  }

  const approvedTestimonials = (data.testimonial || []).filter((t) => t.is_approved);

  return (
    <div className="portfolio">
      <section className="p-hero">
        <div className="eyebrow-line" />
        <div className="p-hero-top">
          {p.photo_url && <div className="p-avatar"><img src={`${BASE_URL}${p.photo_url}`} alt={fullName} /></div>}
          <div>
            <h1>{fullName}</h1>
            {p.headline && <div className="headline">{p.headline}</div>}
          </div>
        </div>
        {p.bio && <p className="bio">{p.bio}</p>}
        {(data.social_link || []).length > 0 && (
          <div className="p-social">
            {data.social_link.map((s) => (
              <a key={s.social_link_id} href={s.url} target="_blank" rel="noopener noreferrer">{s.platform_name}</a>
            ))}
          </div>
        )}
      </section>

      {(data.experience || []).length > 0 && (
        <Section title="Experience">
          {data.experience.map((e) => (
            <div className="p-entry" key={e.experience_id}>
              <div className="dates">{fmtDate(e.start_date)} — {e.is_current ? 'Present' : (fmtDate(e.end_date) || '—')}</div>
              <div>
                <div className="role">{e.job_title}</div>
                <div className="org">{e.company_name}</div>
                {e.description && <div className="desc">{e.description}</div>}
              </div>
            </div>
          ))}
        </Section>
      )}

      {(data.project || []).length > 0 && (
        <Section title="Projects">
          <div className="p-projects">
            {data.project.map((pr) => {
              const media = (pr.media || []).filter((m) => m.media_url).sort((a, b) => a.display_order - b.display_order);
              const initials = (pr.title || '?').slice(0, 2).toUpperCase();
              return (
                <div className="p-project" key={pr.project_id}>
                  <div className="thumb" style={{ background: '#3E6B4C' }}>
                    {media.length ? <img src={media[0].media_url} alt={pr.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
                  </div>
                  <div className="body">
                    <div className="title-row">
                      <h3>{pr.title}</h3>
                      {pr.is_featured && <span className="featured-badge">Featured</span>}
                    </div>
                    {pr.description && <p>{pr.description}</p>}
                    {pr.demo_url && <a className="demo-link" href={pr.demo_url} target="_blank" rel="noopener noreferrer">View project →</a>}
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {((data.skills || []).length > 0 || (data.tech_stack || []).length > 0) && (
        <Section title="Skills & tools">
          {(data.skills || []).length > 0 && (
            <div className="p-skill-group">
              <h4>Skills</h4>
              <div className="p-tags">
                {data.skills.map((s) => (
                  <span className={`p-tag ${s.certification ? 'cert' : ''}`} key={s.skill_id}>{s.category}</span>
                ))}
              </div>
            </div>
          )}
          {(data.tech_stack || []).length > 0 && (
            <div className="p-skill-group">
              <h4>Tech stack</h4>
              <div className="p-tags">
                {data.tech_stack.map((t) => (
                  <span className="p-tag" key={t.tech_stack_id}>{t.technology_name} <span className="lvl">· {t.proficiency_level}</span></span>
                ))}
              </div>
            </div>
          )}
        </Section>
      )}

      {(data.education || []).length > 0 && (
        <Section title="Education">
          {data.education.map((e) => (
            <div className="p-entry" key={e.education_id}>
              <div className="dates">{fmtDate(e.start_date)} — {fmtDate(e.end_date) || 'Present'}</div>
              <div>
                <div className="role">{e.degree}{e.field_of_study ? `, ${e.field_of_study}` : ''}</div>
                <div className="org">{e.institution_name}</div>
                {e.description && <div className="desc">{e.description}</div>}
              </div>
            </div>
          ))}
        </Section>
      )}

      {approvedTestimonials.length > 0 && (
        <Section title="What people say">
          {approvedTestimonials.map((t) => (
            <div className="p-testimonial" key={t.testimonial_id}>
              <p className="quote">"{t.content}"</p>
              <div className="attribution">{t.author_name}{t.author_title ? `, ${t.author_title}` : ''}</div>
            </div>
          ))}
        </Section>
      )}

      {showContactForm && <ContactForm profileId={profileId} />}

      <div className="p-footer">
        <span>{fullName}</span>
        <span>Built with Folio</span>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="p-section">
      <div className="p-section-head"><h2>{title}</h2><div className="rule" /></div>
      {children}
    </section>
  );
}

function ContactForm({ profileId }) {
  const [form, setForm] = useState({ sender_name: '', sender_email: '', subject: '', message_content: '' });
  const [status, setStatus] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('sending');
    try {
      await api.sendContactMessage(profileId, form);
      setStatus('sent');
      setForm({ sender_name: '', sender_email: '', subject: '', message_content: '' });
    } catch (err) {
      setStatus('error');
    }
  }

  return (
    <section className="p-section">
      <div className="p-contact">
        <h2>Get in touch</h2>
        <p className="lead">Send a message — it'll go straight to the portfolio owner's inbox.</p>
        {status === 'sent' ? (
          <p>Thanks — your message is on its way.</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Your name" required value={form.sender_name} onChange={(e) => setForm({ ...form, sender_name: e.target.value })} />
            <input type="email" placeholder="Your email" required value={form.sender_email} onChange={(e) => setForm({ ...form, sender_email: e.target.value })} />
            <input type="text" placeholder="Subject (optional)" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            <textarea placeholder="Your message" required value={form.message_content} onChange={(e) => setForm({ ...form, message_content: e.target.value })} />
            <button type="submit" className="primary-btn" style={{ justifySelf: 'start' }} disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending…' : 'Send message'}
            </button>
            {status === 'error' && <p style={{ color: 'var(--danger)', fontSize: 13 }}>Something went wrong — try again.</p>}
          </form>
        )}
      </div>
    </section>
  );
}
