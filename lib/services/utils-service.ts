import { jsPDF } from "jspdf";

// Types for PDF generation
export interface PdfOptions {
  destination: string;
  dates: string;
  itineraryText: string;
  preferences: string[];
  questions: string[];
}

// PDF Generation Function
export const generatePDF = (options: PdfOptions): Blob => {
  const { destination, dates, itineraryText, preferences, questions } = options;

  // Create PDF document
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(24);
  doc.setTextColor(33, 53, 85);
  doc.text(`Travel Itinerary for ${destination}`, 105, 20, { align: "center" });

  // Add subtitle with dates
  doc.setFontSize(14);
  doc.setTextColor(70, 70, 70);
  doc.text(dates, 105, 30, { align: "center" });

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);

  // Add Trip Details
  doc.setFontSize(18);
  doc.setTextColor(33, 53, 85);
  doc.text("Trip Details", 20, 50);

  // Add preferences
  let y = 60;
  for (let i = 0; i < questions.length; i++) {
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(questions[i], 20, y);
    y += 5;

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(preferences[i], 20, y);
    y += 10;

    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  }

  // Add Itinerary Section
  doc.addPage();
  doc.setFontSize(18);
  doc.setTextColor(33, 53, 85);
  doc.text("Detailed Itinerary", 20, 20);

  // Format and add itinerary text
  const sections = itineraryText.split("\n\n");
  y = 30;

  for (const section of sections) {
    if (section.trim()) {
      if (section.toUpperCase() === section) {
        // This is a section header
        if (y > 250) {
          doc.addPage();
          y = 20;
        }
        doc.setFontSize(16);
        doc.setTextColor(33, 53, 85);
        doc.text(section, 20, y);
        y += 8;
      } else {
        // This is content
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);

        // Split content into lines to respect page boundaries
        const textLines = doc.splitTextToSize(section, 170);

        // Check if we need a new page
        if (y + textLines.length * 6 > 280) {
          doc.addPage();
          y = 20;
        }

        doc.text(textLines, 20, y);
        y += textLines.length * 6 + 4;
      }
    }
  }

  // Save PDF
  return doc.output("blob");
};

// Image search service
export interface UnsplashImage {
  url: string;
  thumb: string;
  alt: string;
  credit: string;
  category: string;
}

export const searchImages = async (
  query: string,
  destination: string
): Promise<UnsplashImage[]> => {
  try {
    // Get Access Key from environment variables
    const accessKey = process.env.UNSPLASH_ACCESS_KEY;
    if (!accessKey) {
      console.error("Missing Unsplash access key");
      return [];
    }

    // Enhance search query based on content type and destination
    let enhancedQuery = query;
    if (
      destination &&
      !query.toLowerCase().includes(destination.toLowerCase())
    ) {
      if (/hotel|resort|hostel|airbnb/i.test(query)) {
        enhancedQuery = `${destination} ${query} hotel building exterior`;
      } else if (/food|dish|cuisine|restaurant/i.test(query)) {
        enhancedQuery = `${destination} ${query} traditional food cuisine`;
      } else {
        // Assume it's a place/destination
        enhancedQuery = `${destination} ${query} landmark destination`;
      }
    }

    // Make request to Unsplash API
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        enhancedQuery
      )}&per_page=6&orientation=landscape&content_filter=high&client_id=${accessKey}`
    );

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }

    const data = await response.json();

    // Format and categorize images
    return data.results.map((photo: { urls: { regular: string; thumb: string }; alt_description: string; user: { name: string } }) => {
      let category = "Place";
      if (/hotel/i.test(enhancedQuery)) {
        category = destination ? `Hotels in ${destination}` : "Hotel";
      } else if (/food/i.test(enhancedQuery)) {
        category = destination ? `Food from ${destination}` : "Food";
      } else {
        category = destination ? `Places in ${destination}` : "Place";
      }

      return {
        url: photo.urls.regular,
        thumb: photo.urls.thumb,
        alt: photo.alt_description || query,
        credit: photo.user.name,
        category,
      };
    });
  } catch (error) {
    console.error("Error searching images:", error);
    return [];
  }
};
