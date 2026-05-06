import LandingPage from "@/components/landing/LandingPage";
import { getSession } from "auth/server";
import { redirect } from "next/navigation";

export default async function RootPage() {
  let session = null;
  try {
    session = await getSession();
  } catch (_error) {
    console.warn("Database connection unavailable, showing landing page.");
  }

  if (session) {
    redirect("/chat");
  }

  return <LandingPage />;
}
