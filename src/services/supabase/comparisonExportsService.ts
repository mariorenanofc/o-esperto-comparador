import { supabase } from "@/integrations/supabase/client";

interface LogExportInput {
  comparison_id?: string;
  format: string;
  plan?: string;
  file_size_bytes?: number;
  meta?: Record<string, any>;
}

export const comparisonExportsService = {
  async logExport(input: LogExportInput) {
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) throw new Error("Not authenticated");

    const { error } = await supabase.from("comparison_exports").insert({
      user_id: userId,
      comparison_id: input.comparison_id || null,
      format: input.format,
      plan: input.plan || null,
      file_size_bytes: input.file_size_bytes || null,
      meta: input.meta || null,
    });

    if (error) throw error;
  },
};
