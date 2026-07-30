import { env } from './env.js';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY, {
  db: { schema: 'cfd_system' }
});

export default supabase;