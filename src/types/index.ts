// Shared row shape returned by the Supabase content_runs table
export interface ContentRun {
  id: string;
  user_id: string;
  run_date: string;
  status: "pending" | "running" | "completed" | "error";
  started_at: string;
  completed_at: string | null;
  error_message: string | null;
  current_step: string | null;
  step_progress: Record<string, unknown> | null;
  linkedin_post: string | null;
  instagram_post: string | null;
  facebook_post: string | null;
  x_post: string | null;
  image_prompt: string | null;
  linkedin_image_path: string | null;
  instagram_image_path: string | null;
  facebook_image_path: string | null;
  x_image_path: string | null;
  linkedin_posted: boolean;
  instagram_posted: boolean;
  facebook_posted: boolean;
  x_posted: boolean;
  linkedin_post_url: string | null;
  instagram_post_url: string | null;
  facebook_post_url: string | null;
  x_post_url: string | null;
}

export interface PlatformConnection {
  id: string;
  platform: string;
  status: "connected" | "disconnected" | "error";
  platform_username: string | null;
  connected_at: string;
}

export interface SheetConnection {
  id: string;
  sheet_url: string | null;
  sheet_id: string | null;
  sheet_name: string | null;
  connected_at: string;
}

export interface UserSettings {
  anthropic_key: string | null;
  image_model_key: string | null;
  image_model_provider: string;
  auto_run_enabled: boolean;
  auto_run_time: string;
  ai_model: string;
}
