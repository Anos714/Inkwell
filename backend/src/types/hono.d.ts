import "hono";

declare module "hono" {
  interface Env {
    Variables: {
      user: {
        id: string;
        role: string;
      };
    };
  }

  interface ContextVariableMap {
    user: {
      id: string;
      role: string;
    };
  }
}
