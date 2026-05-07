import { NextResponse } from "next/server";
import { serverFileStorage } from "lib/file-storage";
import { parseCsvPreview, formatCsvPreviewText } from "lib/file-ingest/csv";
import { storageKeyFromUrl } from "lib/file-storage/storage-utils";

type Body = {
  key?: string; // storage key (preferred)
  url?: string; // will be converted to key if possible
  type?: "csv" | "auto";
  maxRows?: number;
  maxCols?: number;
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const key = body.key || (body.url ? storageKeyFromUrl(body.url) : undefined);
  if (!key) {
    return NextResponse.json(
      { error: "Missing 'key' or 'url'" },
      { status: 400 },
    );
  }

  // Infer type from extension when auto
  const type = body.type || "auto";
  const isCsv =
    type === "csv" ||
    /\.(csv)$/i.test(key) ||
    /(^|[?&])contentType=text\/csv(&|$)/i.test(body.url || "");

  const isTextBased =
    isCsv ||
    /\.(txt|md|json)$/i.test(key) ||
    /(^|[?&])contentType=(text\/plain|text\/markdown|application\/json)(&|$)/i.test(
      body.url || "",
    );

  if (!isTextBased) {
    return NextResponse.json(
      {
        error: "Unsupported file type for ingest",
        solution:
          "Currently supported: CSV, TXT, MD, JSON. Convert your file to one of these formats.",
      },
      { status: 400 },
    );
  }

  const buf = await serverFileStorage.download(key);

  if (isCsv) {
    const preview = parseCsvPreview(buf, {
      maxRows: Math.min(200, Math.max(1, body.maxRows ?? 50)),
      maxCols: Math.min(40, Math.max(1, body.maxCols ?? 12)),
    });

    const text = formatCsvPreviewText(key, preview);
    return NextResponse.json({ ok: true, type: "csv", key, preview, text });
  }

  // Handle generic text files (TXT, MD, JSON)
  const textContent = buf.toString("utf-8");
  // Limit to reasonable size to prevent massive prompts (e.g. ~50k chars)
  const truncatedText =
    textContent.length > 50000
      ? textContent.slice(0, 50000) + "\n...[Content truncated due to length]"
      : textContent;

  const fileName = key.split("/").pop() || "file.txt";
  const formattedText = `File: ${fileName}\n\n${truncatedText}`;

  return NextResponse.json({
    ok: true,
    type: "text",
    key,
    text: formattedText,
  });
}

