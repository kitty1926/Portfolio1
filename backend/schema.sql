-- Folio database schema
-- Matches the ER diagram: user -> profile -> (education, experience, project -> project_media,
-- skills, tech_stack, social_link, testimonial, analytics, contact_message)
--
-- The only field added beyond the original diagram is profile.photo_url,
-- needed to store the profile picture. Everything else matches the diagram's
-- table and column names exactly, including "viewers_collect" on analytics.

CREATE TABLE IF NOT EXISTS "user" (
  user_id     SERIAL PRIMARY KEY,
  email       VARCHAR(255) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL, -- bcrypt hash, never plain text
  role        VARCHAR(50)  NOT NULL DEFAULT 'user',
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS profile (
  profile_id   SERIAL PRIMARY KEY,
  user_id      INTEGER NOT NULL REFERENCES "user"(user_id) ON DELETE CASCADE,
  last_name    VARCHAR(255),
  first_name   VARCHAR(255),
  middle_name  VARCHAR(255),
  bio          TEXT,
  photo_url    VARCHAR(500), -- added: not in the original diagram, needed for the profile picture
  is_public    BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS education (
  education_id     SERIAL PRIMARY KEY,
  profile_id       INTEGER NOT NULL REFERENCES profile(profile_id) ON DELETE CASCADE,
  institution_name VARCHAR(255),
  degree           VARCHAR(255),
  field_of_study   VARCHAR(255),
  start_date       DATE,
  end_date         DATE,
  description      TEXT
);

CREATE TABLE IF NOT EXISTS experience (
  experience_id  SERIAL PRIMARY KEY,
  profile_id     INTEGER NOT NULL REFERENCES profile(profile_id) ON DELETE CASCADE,
  company_name   VARCHAR(255),
  job_title      VARCHAR(255),
  start_date     DATE,
  end_date       DATE,
  is_current     BOOLEAN NOT NULL DEFAULT false,
  description    TEXT
);

CREATE TABLE IF NOT EXISTS project (
  project_id     SERIAL PRIMARY KEY,
  profile_id     INTEGER NOT NULL REFERENCES profile(profile_id) ON DELETE CASCADE,
  title          VARCHAR(255),
  description    TEXT,
  demo_url       VARCHAR(500),
  is_featured    BOOLEAN NOT NULL DEFAULT false,
  display_order  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS project_media (
  project_media_id  SERIAL PRIMARY KEY,
  project_id        INTEGER NOT NULL REFERENCES project(project_id) ON DELETE CASCADE,
  media_url         VARCHAR(500),
  display_order     INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS skills (
  skill_id       SERIAL PRIMARY KEY,
  profile_id     INTEGER NOT NULL REFERENCES profile(profile_id) ON DELETE CASCADE,
  category       VARCHAR(255),
  year_acquired  INTEGER,
  certification  VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS social_link (
  social_link_id  SERIAL PRIMARY KEY,
  profile_id      INTEGER NOT NULL REFERENCES profile(profile_id) ON DELETE CASCADE,
  platform_name   VARCHAR(255),
  url             VARCHAR(500)
);

CREATE TABLE IF NOT EXISTS tech_stack (
  tech_stack_id      SERIAL PRIMARY KEY,
  profile_id         INTEGER NOT NULL REFERENCES profile(profile_id) ON DELETE CASCADE,
  technology_name    VARCHAR(255),
  category           VARCHAR(255),
  proficiency_level  VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS testimonial (
  testimonial_id  SERIAL PRIMARY KEY,
  profile_id      INTEGER NOT NULL REFERENCES profile(profile_id) ON DELETE CASCADE,
  author_name     VARCHAR(255),
  author_title    VARCHAR(255),
  content         TEXT,
  date_given      DATE,
  is_approved     BOOLEAN NOT NULL DEFAULT false
);

-- One row per profile, updated on every public view: viewers_collect is the
-- running total, visited_time is the most recent visit. (The diagram doesn't
-- specify whether this is a running total or a per-visit log; this backend
-- treats it as a running total, which is the simpler, cheaper-to-query option.)
CREATE TABLE IF NOT EXISTS analytics (
  analytics_id     SERIAL PRIMARY KEY,
  profile_id       INTEGER NOT NULL REFERENCES profile(profile_id) ON DELETE CASCADE,
  viewers_collect  INTEGER NOT NULL DEFAULT 0,
  visited_time     TIMESTAMPTZ,
  UNIQUE(profile_id)
);

CREATE TABLE IF NOT EXISTS contact_message (
  message_id       SERIAL PRIMARY KEY,
  profile_id       INTEGER NOT NULL REFERENCES profile(profile_id) ON DELETE CASCADE,
  sender_name      VARCHAR(255),
  sender_email     VARCHAR(255),
  subject          VARCHAR(255),
  message_content  TEXT,
  sent_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_education_profile      ON education(profile_id);
CREATE INDEX IF NOT EXISTS idx_experience_profile     ON experience(profile_id);
CREATE INDEX IF NOT EXISTS idx_project_profile        ON project(profile_id);
CREATE INDEX IF NOT EXISTS idx_project_media_project  ON project_media(project_id);
CREATE INDEX IF NOT EXISTS idx_skills_profile         ON skills(profile_id);
CREATE INDEX IF NOT EXISTS idx_social_link_profile    ON social_link(profile_id);
CREATE INDEX IF NOT EXISTS idx_tech_stack_profile     ON tech_stack(profile_id);
CREATE INDEX IF NOT EXISTS idx_testimonial_profile    ON testimonial(profile_id);
CREATE INDEX IF NOT EXISTS idx_contact_message_profile ON contact_message(profile_id);
