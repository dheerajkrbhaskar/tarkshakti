import crypto from "node:crypto";
import { getAdminAuth } from "@/lib/services/admin/auth.service";

function buildSignature(timestamp: number, apiSecret: string) {
  const payload = `timestamp=${timestamp}${apiSecret}`;
  return crypto.createHash("sha1").update(payload).digest("hex");
}

export async function POST(request: Request) {
  try {
    const auth = await getAdminAuth();

    if (!auth) {
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!auth.isAdmin) {
      return Response.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return Response.json({ success: false, error: "Missing Cloudinary server configuration" }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return Response.json({ success: false, error: "File is required" }, { status: 400 });
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const signature = buildSignature(timestamp, apiSecret);

    const uploadFormData = new FormData();
    uploadFormData.append("file", file);
    uploadFormData.append("api_key", apiKey);
    uploadFormData.append("timestamp", String(timestamp));
    uploadFormData.append("signature", signature);

    const cloudinaryResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: uploadFormData,
    });

    const payload = await cloudinaryResponse.json();

    if (!cloudinaryResponse.ok || !payload?.secure_url) {
      return Response.json(
        {
          success: false,
          error: payload?.error?.message || "Cloudinary upload failed",
        },
        { status: 400 }
      );
    }

    return Response.json(
      {
        success: true,
        secure_url: payload.secure_url,
        public_id: payload.public_id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin upload failed", error);
    return Response.json({ success: false, error: "Failed to upload image" }, { status: 500 });
  }
}
