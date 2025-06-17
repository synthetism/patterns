import { createClient as createSupabseClient } from "@supabase/supabase-js"
import { SUPABASE_SERVICE_ROLE, SUPABASE_URL } from "../utils/env"

export const supabase = createSupabseClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
	auth: {
		autoRefreshToken: false,
		persistSession: false,
	},
})
