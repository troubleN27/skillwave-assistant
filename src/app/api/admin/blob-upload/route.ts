import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { FILE_CONTENT_TYPES, MAX_FILE_SIZE } from "@/lib/rag/file-types";

const ALLOWED_CONTENT_TYPES = [...new Set(Object.values(FILE_CONTENT_TYPES).flat())];

/** Issues client tokens for direct browser uploads to Vercel Blob (admins only). */
export async function POST(request: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Хранилище файлов не настроено (BLOB_READ_WRITE_TOKEN)" },
      { status: 503 },
    );
  }

  const body = (await request.json()) as HandleUploadBody;

  if (body.type === "blob.generate-client-token") {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
    }
  }

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.startsWith("knowledge/")) {
          throw new Error("Недопустимый путь файла");
        }
        return {
          allowedContentTypes: ALLOWED_CONTENT_TYPES,
          maximumSizeInBytes: MAX_FILE_SIZE,
          addRandomSuffix: true,
        };
      },
      // Documents are created by a Server Action right after the upload,
      // so the completion webhook (unreachable on localhost) is not needed.
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Не удалось загрузить файл" },
      { status: 400 },
    );
  }
}
