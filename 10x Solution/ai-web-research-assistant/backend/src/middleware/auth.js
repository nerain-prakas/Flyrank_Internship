const { createClient } = require('@supabase/supabase-js');
const config = require('../config');

let supabase;
if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

module.exports = async function requireAuth(req, res, next) {
  const match = (req.get('Authorization') || '').match(/^Bearer\s+(\S+)$/i);
  if (!match) return res.status(401).json({ error: 'Access token required' });

  if (supabase) {
    const { data, error } = await supabase.auth.getUser(match[1]);
    if (error || !data.user) return res.status(401).json({ error: 'Invalid or expired token' });
    req.user = { id: data.user.id, email: data.user.email || '' };
  } else if (match[1] === config.devAuthToken) {
    req.user = { id: '00000000-0000-0000-0000-000000000001', email: 'local@example.test' };
  } else {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  return next();
};
