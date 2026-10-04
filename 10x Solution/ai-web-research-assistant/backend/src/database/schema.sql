CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS research_projects (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question TEXT NOT NULL CHECK (char_length(question) BETWEEN 10 AND 2000),
  status TEXT NOT NULL CHECK (status IN ('queued', 'researching', 'analyzing', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS research_projects_user_created_idx ON research_projects(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS sources (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES research_projects(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT,
  fetched_at TIMESTAMPTZ,
  content_hash TEXT,
  UNIQUE(project_id, url)
);
CREATE INDEX IF NOT EXISTS sources_project_idx ON sources(project_id);

CREATE TABLE IF NOT EXISTS source_contents (
  source_id UUID PRIMARY KEY REFERENCES sources(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  cached_until TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS research_reports (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL UNIQUE REFERENCES research_projects(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  key_findings JSONB NOT NULL DEFAULT '[]',
  important_facts JSONB NOT NULL DEFAULT '[]',
  comparison_points JSONB NOT NULL DEFAULT '[]',
  pros JSONB NOT NULL DEFAULT '[]',
  cons JSONB NOT NULL DEFAULT '[]',
  limitations JSONB NOT NULL DEFAULT '[]',
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS research_citations (
  id UUID PRIMARY KEY,
  report_id UUID NOT NULL REFERENCES research_reports(id) ON DELETE CASCADE,
  source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  claim TEXT NOT NULL
);
