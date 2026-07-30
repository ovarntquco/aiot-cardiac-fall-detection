import { env } from './env.js';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY, {
  db: { schema: 'cfd_system' }
});

supabase.channel(env.SUPABASE_PRIVATE_CHANNEL).subscribe((status, error) => {
  if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
    console.log(error.message);
  }
  console.log(status);
})

export default supabase;