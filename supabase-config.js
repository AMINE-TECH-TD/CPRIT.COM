
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://ytkqcsvisspfuqmjxevz.supabase.co';

const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_9Pxc_AVW4Hn1CWBRVdODWA_LpDuiwLY';

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);
