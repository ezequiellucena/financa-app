import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Deletes the authenticated user's account.
 * If other users share the same data, only the user's account/profile is removed.
 * Otherwise, the user's data is also removed.
 *
 * In this project there is currently no data-sharing concept beyond the
 * per-user `profiles` row, so we treat the caller as the sole owner and
 * cascade-delete their auth user (which removes the profile via the
 * `on delete cascade` FK).
 */
export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Detect whether other users share the caller's data.
    // Today there are no shared tables, so the user is always sole owner.
    const hasSharedAccess = false;

    if (hasSharedAccess) {
      // Scenario 1: remove only the user's account, keep shared data.
      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (error) throw new Error(error.message);
      return { scenario: "account_only" as const };
    }

    // Scenario 2: remove the account and all data linked to it.
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) throw new Error(error.message);
    return { scenario: "account_and_data" as const };
  });

/**
 * Returns whether the caller is the sole owner of their data.
 * Used to decide which confirmation modal to show on the profile screen.
 */
export const checkAccountDeletionScope = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    // No data-sharing concept yet — caller is always sole owner.
    return { sharedWithOthers: false };
  });