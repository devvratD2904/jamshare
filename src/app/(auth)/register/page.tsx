import { RegisterForm } from "@/components/auth/RegisterForm";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sign Up | JamShare",
    description: "Create a new JamShare account",
};

export default function RegisterPage() {
    return <RegisterForm />;
}
