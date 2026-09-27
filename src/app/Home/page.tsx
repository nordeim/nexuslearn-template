import { redirect } from "next/navigation";

// The original app's logo links to /Home; canonical landing lives at `/`.
export default function HomeAlias() {
  redirect("/");
}
