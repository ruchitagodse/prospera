import { redirect } from "next/navigation";

// Previous illustrative portfolio entries now lead to the actual project index.
export default function LegacyProjectPage() {
  redirect("/work");
}
