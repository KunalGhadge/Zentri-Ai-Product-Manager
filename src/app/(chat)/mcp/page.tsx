import MCPDashboard from "@/components/mcp-dashboard";
import { IS_VERCEL_ENV } from "lib/const";
import { getTranslations } from "next-intl/server";
import { getSession } from "auth/server";
import { redirect } from "next/navigation";

// Force dynamic rendering to avoid static generation issues with session
export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await getSession();
  if (!session?.user) {
    return redirect("/sign-in");
  }

  let message: string | undefined;

  try {
    const t = await getTranslations("Info");
    if (IS_VERCEL_ENV) {
      message = t("vercelSyncDelay");
    }
  } catch (error) {
    console.error("Error loading translations on MCP page:", error);
  }

  return <MCPDashboard message={message} user={session.user} />;
}
