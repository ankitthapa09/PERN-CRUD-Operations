export type AuthUser = {
  id: number;
  email: string;
  createdAt: string;
};

export type AuthResponse = {
  user: AuthUser;
};
