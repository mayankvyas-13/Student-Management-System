import { redirect } from "next/navigation";

/** The home page simply sends visitors to the student list. */
export default function HomePage() {
  redirect("/students");
}
