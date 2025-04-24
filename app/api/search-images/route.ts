import { NextRequest, NextResponse } from "next/server";
import { searchImages } from "@/lib/services/utils-service";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const { query, destination, referenceImageUrl } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: "Missing query parameter" },
        { status: 400 }
      );
    }

    // Search for images, potentially using vision capabilities if referenceImageUrl is provided
    const images = await searchImages(
      query,
      destination || "",
      referenceImageUrl
    );

    return NextResponse.json({ images });
  } catch (error) {
    console.error("Error searching images:", error);
    return NextResponse.json(
      { error: "Failed to search images", details: (error as Error).message },
      { status: 500 }
    );
  }
}
