import { LoginForm } from "@/components/auth/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Login | JamShare",
    description: "Login to your JamShare account",
};

export default function LoginPage() {
    return <LoginForm />;
}
