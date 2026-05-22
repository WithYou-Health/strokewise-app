import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }

  const { data, error } = await supabase
    .from('subscribers')
    .select('status, plan')
    .eq('email', email)
    .single();

  if (error || !data) {
    return res.status(200).json({ isPremium: false });
  }

  const isPremium = ['trialing', 'active'].includes(data.status);

  res.status(200).json({ isPremium, status: data.status });
}