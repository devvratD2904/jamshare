import { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            username: string;
        } & DefaultSession["user"];
    }

    interface User {
        id: string;
        username: string;
        avatar?: string | null;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        username: string;
    }
}
