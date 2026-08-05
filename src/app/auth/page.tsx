import { redirect } from "next/navigation";

export default function AuthRootPage() {
    return redirect("/auth/sign-in", "replace");
}
