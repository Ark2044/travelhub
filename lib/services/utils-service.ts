import { jsPDF } from "jspdf";

// Types for PDF generation
export interface PdfOptions {
  destination: string;
  dates: string;
  itineraryText: string;
  preferences: string[];
  questions: string[];
}

// Enhanced PDF Generation Function
export const generatePDF = (options: PdfOptions): Blob => {
  const { destination, dates, itineraryText, preferences, questions } = options;

  // Create PDF document with improved formatting
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Add custom brand styling
  const primaryColor = [0, 91, 187]; // RGB blue
  const secondaryColor = [33, 53, 85]; // RGB dark blue
  const accentColor = [70, 130, 180]; // Steel blue
  const textColor = [50, 50, 50]; // Dark grey

  // Add header with brand styling
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 40, "F");

  // Add TravelHub logo text
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(255, 255, 255); // White
  doc.text("TravelHub", 20, 20);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Your Personalized Travel Experience", 20, 28);

  // Add date
  const today = new Date();
  doc.setFontSize(10);
  doc.text(`Created: ${today.toLocaleDateString()}`, 170, 28, {
    align: "right",
  });

  // Add title with destination
  doc.setFillColor(245, 245, 245); // Light gray background
  doc.rect(0, 40, 210, 25, "F");

  doc.setFontSize(24);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFont("helvetica", "bold");
  doc.text(`Travel Itinerary: ${destination}`, 105, 55, { align: "center" });

  // Add subtitle with dates
  doc.setFontSize(14);
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.setFont("helvetica", "italic");
  doc.text(dates, 105, 62, { align: "center" });

  // Add Trip Details section
  let y = 75;

  doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.rect(15, y, 180, 10, "F");

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255); // White
  doc.text("Trip Details", 105, y + 7, { align: "center" });

  y += 15;

  // Create a two-column layout for preferences
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);

  // Only show if we have questions and preferences
  if (questions && questions.length && preferences && preferences.length) {
    const maxQuestionsPerPage = 4; // Adjust based on content length

    for (let i = 0; i < Math.min(questions.length, preferences.length); i++) {
      // Check if we need a new page
      if (i > 0 && i % maxQuestionsPerPage === 0) {
        doc.addPage();
        y = 25;
      }

      // Question label in blue
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);

      // Handle long questions by wrapping text
      const questionLines = doc.splitTextToSize(questions[i], 160);
      doc.text(questionLines, 20, y);

      y += questionLines.length * 5;

      // Response text in black
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);

      // Add border around answer
      doc.setDrawColor(220, 220, 220); // Light gray border
      doc.roundedRect(20, y - 4, 170, 10, 2, 2, "S");

      // Handle long answers
      const answerLines = doc.splitTextToSize(
        preferences[i] || "Not specified",
        160
      );
      doc.text(answerLines, 25, y + 2);

      y += Math.max(10, answerLines.length * 5) + 10;

      // Check if we're running out of space
      if (y > 250) {
        doc.addPage();
        y = 25;
      }
    }
  }

  // Add Itinerary Section on new page
  doc.addPage();

  // Add header
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 15, "F");

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("TravelHub Itinerary", 20, 10);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(destination, 170, 10, { align: "right" });

  // Section heading
  y = 25;
  doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.rect(15, y, 180, 10, "F");

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("Detailed Itinerary", 105, y + 7, { align: "center" });

  y += 20;

  // Format and add itinerary text with better styling
  const sections = itineraryText.split("\n\n");
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);

  let dayCount = 1; // For tracking days

  for (const section of sections) {
    if (section.trim()) {
      // Check if it's a heading (all uppercase)
      if (section.trim() === section.trim().toUpperCase()) {
        // This is a section header - add some spacing
        if (y > 250) {
          doc.addPage();

          // Add header to new page
          doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
          doc.rect(0, 0, 210, 15, "F");

          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(255, 255, 255);
          doc.text("TravelHub Itinerary", 20, 10);

          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.text(destination, 170, 10, { align: "right" });

          y = 25;
        }

        // Style based on the section type
        if (section.includes("DAY")) {
          // Day header with special formatting
          doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
          doc.roundedRect(15, y - 5, 180, 10, 3, 3, "F");

          doc.setFontSize(14);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(255, 255, 255);
          doc.text(`Day ${dayCount}: ${section}`, 105, y + 2, {
            align: "center",
          });

          dayCount++;
        } else {
          // Regular section header (like ACCOMMODATION, DINING, etc.)
          doc.setFillColor(240, 240, 240);
          doc.rect(15, y - 5, 180, 10, "F");

          doc.setFontSize(14);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
          doc.text(section, 20, y + 2);
        }

        y += 12;
      } else {
        // This is content text
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);

        // Split content into lines to respect page boundaries
        const textLines = doc.splitTextToSize(section, 170);

        // Check if we need a new page
        if (y + textLines.length * 5.5 > 280) {
          doc.addPage();

          // Add header to new page
          doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
          doc.rect(0, 0, 210, 15, "F");

          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(255, 255, 255);
          doc.text("TravelHub Itinerary", 20, 10);

          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.text(destination, 170, 10, { align: "right" });

          y = 25;
        }

        // If paragraph starts with "Morning:", "Afternoon:", or "Evening:", make it bold
        if (
          section.trim().startsWith("Morning:") ||
          section.trim().startsWith("Afternoon:") ||
          section.trim().startsWith("Evening:")
        ) {
          const parts = section.split(":");
          doc.setFont("helvetica", "bold");
          doc.text(parts[0] + ":", 20, y);
          doc.setFont("helvetica", "normal");
          const contentLines = doc.splitTextToSize(
            parts.slice(1).join(":"),
            160
          );
          doc.text(contentLines, 30, y + 5.5);
          y += contentLines.length * 5.5 + 5;
        } else {
          // Regular content paragraph
          doc.text(textLines, 20, y);
          y += textLines.length * 5.5 + 3;
        }
      }
    }
  }

  // Add footer with page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${pageCount} | TravelHub.com`, 105, 290, {
      align: "center",
    });
  }

  // Save PDF
  return doc.output("blob");
};

// Enhanced image search service
export interface UnsplashImage {
  url: string;
  thumb: string;
  alt: string;
  credit: string;
  category: string;
}

// Fallback images in case API fails
const FALLBACK_IMAGES: UnsplashImage[] = [
  {
    url: "https://images.unsplash.com/photo-1500835556837-99ac94a94552",
    thumb: "https://images.unsplash.com/photo-1500835556837-99ac94a94552?w=200",
    alt: "Travel destination with mountains and ocean",
    credit: "Unsplash",
    category: "Travel Landscape",
  },
  {
    url: "https://images.unsplash.com/photo-1530789253388-582c481c54b0",
    thumb: "https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=200",
    alt: "City architecture and streets",
    credit: "Unsplash",
    category: "City Exploration",
  },
  {
    url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1",
    thumb: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=200",
    alt: "Scenic landscape view",
    credit: "Unsplash",
    category: "Landscape",
  },
  {
    url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
    thumb: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200",
    alt: "Restaurant interior",
    credit: "Unsplash",
    category: "Dining",
  },
  {
    url: "https://images.unsplash.com/photo-1566073771259-6a8506099945",
    thumb: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200",
    alt: "Luxury hotel room",
    credit: "Unsplash",
    category: "Accommodation",
  },
];

// Optimize search queries for better image results
const createOptimizedQuery = (query: string, destination: string): string => {
  // Clean and normalize the inputs
  const cleanQuery = query.trim().toLowerCase();
  const cleanDestination = destination.trim();

  // Detect query categories
  const isHotel = /hotel|resort|hostel|airbnb|accommodation|stay|lodge/i.test(
    cleanQuery
  );
  const isFood =
    /food|dish|cuisine|restaurant|dining|eat|meal|breakfast|lunch|dinner/i.test(
      cleanQuery
    );
  const isAttraction =
    /museum|landmark|park|garden|temple|church|cathedral|palace|castle|monument/i.test(
      cleanQuery
    );
  const isBeach = /beach|coast|ocean|sea|shore/i.test(cleanQuery);
  const isMountain = /mountain|hill|peak|hiking|trekking/i.test(cleanQuery);
  const isActivity = /tour|adventure|excursion|activity|experience/i.test(
    cleanQuery
  );

  // Build query with specific qualifiers based on categories
  if (
    cleanDestination &&
    !cleanQuery.includes(cleanDestination.toLowerCase())
  ) {
    if (isHotel) {
      return `${cleanDestination} ${cleanQuery} hotel accommodation building architecture`;
    } else if (isFood) {
      return `${cleanDestination} ${cleanQuery} traditional food cuisine authentic`;
    } else if (isAttraction) {
      return `${cleanDestination} ${cleanQuery} attraction landmark tourist`;
    } else if (isBeach) {
      return `${cleanDestination} ${cleanQuery} scenic beach coastline ocean`;
    } else if (isMountain) {
      return `${cleanDestination} ${cleanQuery} mountains landscape scenic`;
    } else if (isActivity) {
      return `${cleanDestination} ${cleanQuery} travel tourism adventure`;
    } else {
      // Default for places/destinations
      return `${cleanDestination} ${cleanQuery} travel tourism destination landmark scenic`;
    }
  }

  // If no destination or already included
  return `${cleanQuery} travel tourism destination scenic`;
};

// Interface for Unsplash photo API response
interface UnsplashPhoto {
  urls: {
    regular: string;
    thumb: string;
  };
  alt_description?: string;
  user: {
    name: string;
  };
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
      return FALLBACK_IMAGES;
    }

    // Create optimized search query
    const enhancedQuery = createOptimizedQuery(query, destination);

    // Set a timeout for the API request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    try {
      // Make request to Unsplash API with improved parameters
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
          enhancedQuery
        )}&per_page=8&orientation=landscape&content_filter=high&client_id=${accessKey}`,
        { signal: controller.signal }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        console.log("No images found, using fallbacks");
        return FALLBACK_IMAGES;
      }

      // Determine category based on query and create proper attribution
      const getCategoryFromQuery = (q: string): string => {
        if (/hotel|resort|hostel|airbnb|accommodation|stay/i.test(q)) {
          return "Accommodation";
        } else if (/food|dish|cuisine|restaurant|dining|eat/i.test(q)) {
          return "Food & Dining";
        } else if (/beach|coast|ocean|sea|shore/i.test(q)) {
          return "Beaches & Coasts";
        } else if (/mountain|hill|peak|hiking|trekking/i.test(q)) {
          return "Mountains & Nature";
        } else if (/museum|landmark|attraction|monument/i.test(q)) {
          return "Attractions";
        } else if (/tour|adventure|excursion|activity/i.test(q)) {
          return "Activities & Experiences";
        } else {
          return destination ? `Places in ${destination}` : "Destinations";
        }
      };

      // Format and categorize images
      return data.results.map((photo: UnsplashPhoto) => ({
        url: photo.urls.regular,
        thumb: photo.urls.thumb,
        alt: photo.alt_description || `${destination} ${query}`.trim(),
        credit: `Photo by ${photo.user.name} on Unsplash`,
        category: getCategoryFromQuery(query),
      }));
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error("Fetch error during image search:", fetchError);
      // If it's an abort error (timeout) or other fetch error, use fallbacks
      return FALLBACK_IMAGES;
    }
  } catch (error) {
    console.error("Error searching images:", error);
    return FALLBACK_IMAGES;
  }
};
