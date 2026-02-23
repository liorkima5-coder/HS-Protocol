import { NextResponse } from "next/server";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import ImageModule from "docxtemplater-image-module-free";
import fs from "fs";
import path from "path";

export const runtime = "nodejs"; // חובה כדי ש-fs יעבוד

// המרת dataURL ל-Buffer
function dataUrlToBuffer(dataUrl) {
  if (!dataUrl || typeof dataUrl !== "string") {
    return Buffer.alloc(0);
  }

  const base64 = dataUrl.replace(
    /^data:image\/[a-zA-Z0-9+.-]+;base64,/,
    ""
  );

  return Buffer.from(base64, "base64");
}

export async function POST(req) {
  try {
    const body = await req.json();

    // התאמה ללולאת התמונות בתבנית
    const data = {
      ...body,
      images: Array.isArray(body.images)
        ? body.images.map((img) => ({ image: img }))
        : [],
    };

    // נתיב לתבנית
    const templatePath = path.join(
      process.cwd(),
      "public",
      "template.docx"
    );

    const content = fs.readFileSync(templatePath, "binary");
    const zip = new PizZip(content);

    // מודול תמונות (Docxtemplater v4)
    const imageModule = new ImageModule({
      getImage: (tagValue) => dataUrlToBuffer(tagValue),
      getSize: () => [500, 300], // אפשר לשנות גודל
    });

    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      modules: [imageModule], // 👈 חשוב! לא משתמשים ב-attachModule ב-v4
    });

    doc.render(data);

    const buffer = doc.getZip().generate({
      type: "nodebuffer",
    });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition":
          'attachment; filename="generated.docx"',
      },
    });
  } catch (error) {
    console.error("DOCX ERROR:", error);
    console.error("DOCX PROPS:", error?.properties);

    return NextResponse.json(
      {
        ok: false,
        message: error?.message ?? "Unknown error",
        properties: error?.properties ?? null,
      },
      { status: 500 }
    );
  }
}