import ChatBot from "@/components/chat-bot";
import { generateUUID } from "lib/utils";
import { getSession } from "auth/server";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const _session = await getSession();
  const id = generateUUID();
  return <ChatBot initialMessages={[]} threadId={id} key={id} />;
}
