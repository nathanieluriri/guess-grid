export interface CurrentUser {
  id: string;
  username: string;
  email: string;
  is_guest: boolean;
  expires_at: number | null;
  is_email_verified: boolean;
  avatar_url?: string | null;
}
