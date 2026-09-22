// Each entry describes one profile-scoped list: which API resource it maps
// to, the id field the API returns, and the form fields to render.
export const SCHEMAS = {
  social_link: {
    resource: 'social-links', idField: 'social_link_id',
    title: 'Social links', desc: 'The places people can find you elsewhere — GitHub, Facebook, and email are added automatically when you sign up, just fill in the URLs.',
    fields: [
      { name: 'platform_name', label: 'Platform', type: 'text', placeholder: 'GitHub, LinkedIn, Email…', half: true },
      { name: 'url', label: 'URL', type: 'url', placeholder: 'https://…', half: true }
    ],
    empty: 'No links yet.',
    summary: (it) => it.platform_name || 'New link'
  },
  experience: {
    resource: 'experience', idField: 'experience_id',
    title: 'Experience', desc: 'Where you have worked, most recent first.',
    fields: [
      { name: 'job_title', label: 'Job title', type: 'text', half: true },
      { name: 'company_name', label: 'Company', type: 'text', half: true },
      { name: 'start_date', label: 'Start date', type: 'date', half: true },
      { name: 'end_date', label: 'End date', type: 'date', half: true, disabledIf: 'is_current' },
      { name: 'is_current', label: 'I currently work here', type: 'checkbox' },
      { name: 'description', label: 'Description', type: 'textarea' }
    ],
    empty: 'No roles yet — add where you have worked.',
    summary: (it) => it.job_title || 'New role'
  },
  education: {
    resource: 'education', idField: 'education_id',
    title: 'Education', desc: 'Schools, programs, and what you studied.',
    fields: [
      { name: 'institution_name', label: 'Institution', type: 'text', half: true },
      { name: 'degree', label: 'Degree', type: 'text', half: true },
      { name: 'field_of_study', label: 'Field of study', type: 'text', half: true },
      { name: 'start_date', label: 'Start date', type: 'date', half: true },
      { name: 'end_date', label: 'End date', type: 'date', half: true },
      { name: 'description', label: 'Description', type: 'textarea' }
    ],
    empty: 'Nothing here yet — add a school or program.',
    summary: (it) => it.institution_name || 'New entry'
  },
  skills: {
    resource: 'skills', idField: 'skill_id',
    title: 'Skills', desc: 'The things you are good at — shown as tags on your portfolio.',
    fields: [
      { name: 'category', label: 'Skill', type: 'text', placeholder: 'e.g. User Research', half: true },
      { name: 'year_acquired', label: 'Year acquired', type: 'text', placeholder: '2020', half: true },
      { name: 'certification', label: 'Certification (optional)', type: 'text' }
    ],
    empty: 'Add the skills you want visitors to see first.',
    summary: (it) => it.category || 'New skill'
  },
  'tech-stack': {
    resource: 'tech-stack', idField: 'tech_stack_id',
    title: 'Tech stack', desc: 'The tools and technologies you work with.',
    fields: [
      { name: 'technology_name', label: 'Technology', type: 'text', placeholder: 'e.g. React', half: true },
      { name: 'category', label: 'Category', type: 'text', placeholder: 'e.g. Frontend', half: true },
      { name: 'proficiency_level', label: 'Proficiency', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] }
    ],
    empty: 'Add the tools and technologies you use.',
    summary: (it) => it.technology_name || 'New technology'
  },
  testimonials: {
    resource: 'testimonials', idField: 'testimonial_id',
    title: 'Testimonials', desc: 'Quotes from people you have worked with.',
    fields: [
      { name: 'author_name', label: 'Author name', type: 'text', half: true },
      { name: 'author_title', label: 'Author title', type: 'text', half: true },
      { name: 'content', label: 'Quote', type: 'textarea' },
      { name: 'date_given', label: 'Date given', type: 'date', half: true },
      { name: 'is_approved', label: 'Show on my portfolio', type: 'checkbox', half: true }
    ],
    empty: 'Add a quote from someone you have worked with.',
    summary: (it) => it.author_name || 'New testimonial'
  }
};

export const NEW_ITEM_DEFAULTS = {
  social_link: { platform_name: '', url: '' },
  experience: { job_title: '', company_name: '', start_date: '', end_date: '', is_current: false, description: '' },
  education: { institution_name: '', degree: '', field_of_study: '', start_date: '', end_date: '', description: '' },
  skills: { category: '', year_acquired: '', certification: '' },
  'tech-stack': { technology_name: '', category: '', proficiency_level: 'Intermediate' },
  testimonials: { author_name: '', author_title: '', content: '', date_given: '', is_approved: true }
};
