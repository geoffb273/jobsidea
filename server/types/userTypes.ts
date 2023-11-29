export type User = {
  firstname: string;
  lastname: string;
  email: string;
  username: string;
  password: string;
  type: 'User';
  pic?: string | null;
  resume?: string | null;
  zipCode?: string | null;
  phone?: string | null;
};
