import { Groq } from "groq-sdk";

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Vision-based image processing using Groq
export interface VisionAnalysisResult {
  imageInfo: {
    description: string;
    tags: string[];
    searchTerms: string[];
    categories: string[];
  };
}

/**
 * Analyzes an image URL using Groq's vision capabilities
 * @param imageUrl URL of the image to analyze
 * @param prompt Custom prompt for the analysis
 * @returns Structured information about the image
 */
export const analyzeImageWithVision = async (
  imageUrl: string,
  prompt: string = "Analyze this travel image and describe what you see."
): Promise<VisionAnalysisResult> => {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `${prompt} Please provide a JSON response with the following structure: 
              {
                "description": "A detailed description of what's in the image",
                "tags": ["tag1", "tag2", "tag3"], 
                "searchTerms": ["term1", "term2", "term3"],
                "categories": ["category1", "category2"]
              }`,
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      temperature: 0.3,
      max_completion_tokens: 1024,
      response_format: { type: "json_object" },
    });

    const content = chatCompletion.choices[0].message.content;

    // Parse the JSON response
    const result = JSON.parse(content ?? '{}');

    return {
      imageInfo: {
        description: result.description || "Image description not available",
        tags: result.tags || [],
        searchTerms: result.searchTerms || [],
        categories: result.categories || [],
      },
    };
  } catch (error) {
    console.error("Error analyzing image with Groq Vision:", error);
    return {
      imageInfo: {
        description: "Failed to analyze image",
        tags: [],
        searchTerms: [],
        categories: [],
      },
    };
  }
};

/**
 * Enhanced image search using Groq Vision for more intelligent queries
 * This function combines Unsplash search with Vision capabilities
 * @param imageUrl URL of an example image to use as a reference
 * @param destination Travel destination
 * @returns Enhanced search query terms to use with Unsplash
 */
export const enhanceSearchWithVision = async (
  imageUrl: string,
  destination: string
): Promise<string[]> => {
  try {
    const prompt = `This is a travel image${
      destination ? ` related to ${destination}` : ""
    }. 
    Analyze this image and provide me with 5-7 specific search terms I could use to find similar travel images.
    Focus on visual elements, scenery type, landmarks, architectural styles, or natural features visible in the image.`;

    const analysis = await analyzeImageWithVision(imageUrl, prompt);

    // Combine the generated search terms with the destination if provided
    let searchTerms = analysis.imageInfo.searchTerms;

    if (destination && searchTerms.length > 0) {
      searchTerms = searchTerms.map((term) =>
        term.toLowerCase().includes(destination.toLowerCase())
          ? term
          : `${destination} ${term}`
      );
    }

    return searchTerms;
  } catch (error) {
    console.error("Error enhancing search with Vision:", error);
    return destination
      ? [`${destination} travel`, `${destination} tourism`]
      : ["travel destination", "tourism"];
  }
};
