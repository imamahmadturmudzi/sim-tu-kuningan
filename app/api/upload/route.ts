import { google } from "googleapis";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const fileName = formData.get("fileName") as string;

    if (!file) return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });

    // Inisialisasi Robot (Service Account)
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/drive.file"],
    });

    const drive = google.drive({ version: "v3", auth });

    // Konversi file ke format yang dimengerti Google
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileMetadata = {
      name: fileName || file.name,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID!],
    };
    const media = {
      mimeType: file.type,
      body: require("stream").Readable.from(buffer),
    };

    // Proses Antar ke Google Drive
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id, webViewLink",
    });

    return NextResponse.json({ 
      success: true, 
      fileId: response.data.id,
      link: response.data.webViewLink 
    });

  } catch (error: any) {
    console.error("Gagal kirim ke Drive:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}