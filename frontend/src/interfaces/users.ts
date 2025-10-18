export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username: string;
  image?: string;
  bio?: string;
  color: string;
  emailVerified: boolean;
}
