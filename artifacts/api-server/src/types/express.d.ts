export {};

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number | null;
        email: string;
        display_name: string;
        role: string;
        tid?: string;
        scp?: string;
      };
    }
  }
}
