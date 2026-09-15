const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

function hasCredentials(body) {
  return body && typeof body.email === 'string' && body.email.trim() &&
    typeof body.password === 'string' && body.password;
}

exports.signup = async (req, res, next) => {
  if (!hasCredentials(req.body)) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password
  });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(201).json({ user: data.user });
};

exports.login = async (req, res, next) => {
  if (!hasCredentials(req.body)) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password
  });

  if (error || !data.session) {
    return res.status(401).json({ error: 'Invalid login credentials' });
  }

  return res.status(200).json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token
  });
};

exports.logout = async (req, res, next) => {
  const requestClient = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        headers: {
          Authorization: `Bearer ${req.accessToken}`
        }
      }
    }
  );

  const { error } = await requestClient.auth.signOut();

  if (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  return res.status(204).send();
};

exports.profile = async (req, res) => {
  const { id, email, created_at: createdAt } = req.user;
  return res.status(200).json({ id, email, created_at: createdAt });
};

exports.dashboard = async (req, res) => {
  return res.status(200).json({
    message: 'Welcome to your protected dashboard',
    user_id: req.user.id
  });
};