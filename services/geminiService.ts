import { GoogleGenAI, Type, Modality } from "@google/genai";
import type {
  Recipe,
  RecipeRequest,
  MealPlan,
  MealPlanRequest,
  ShoppingList,
} from "../types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;
export const ai = new GoogleGenAI({ apiKey });

// Schemas (unchanged)
const recipeSchema = {
  type: Type.OBJECT,
  properties: {
    recipeName: {
      type: Type.STRING,
      description: "Creative and appealing name of the recipe.",
    },
    description: {
      type: Type.STRING,
      description: "A short, enticing description of the dish (2-3 sentences).",
    },
    prepTime: {
      type: Type.STRING,
      description: 'Estimated preparation time, e.g., "15 minutes".',
    },
    cookTime: {
      type: Type.STRING,
      description: 'Estimated cooking time, e.g., "25 minutes".',
    },
    servings: {
      type: Type.STRING,
      description: 'Number of servings the recipe makes, e.g., "4 servings".',
    },
    ingredients: {
      type: Type.ARRAY,
      description: "List of all necessary ingredients for the recipe.",
      items: {
        type: Type.OBJECT,
        properties: {
          quantity: {
            type: Type.STRING,
            description:
              'The amount of the ingredient, e.g., "1 cup" or "2 tbsp".',
          },
          name: {
            type: Type.STRING,
            description:
              'The name of the ingredient, e.g., "all-purpose flour".',
          },
        },
        required: ["quantity", "name"],
      },
    },
    instructions: {
      type: Type.ARRAY,
      description: "Step-by-step instructions to prepare the dish.",
      items: {
        type: Type.STRING,
        description: "A single, clear step in the cooking process.",
      },
    },
  },
  required: [
    "recipeName",
    "description",
    "prepTime",
    "cookTime",
    "servings",
    "ingredients",
    "instructions",
  ],
};

const mealPlanSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "A catchy title for the meal plan.",
    },
    summary: {
      type: Type.STRING,
      description:
        "A brief summary of the meal plan's focus (e.g., high-protein, vegetarian).",
    },
    dailyPlans: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day: {
            type: Type.STRING,
            description: "The day of the plan, e.g., 'Day 1'.",
          },
          breakfast: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
            },
          },
          lunch: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
            },
          },
          dinner: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
            },
          },
        },
        required: ["day", "breakfast", "lunch", "dinner"],
      },
    },
  },
  required: ["title", "summary", "dailyPlans"],
};

const shoppingListSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "A title for the shopping list, e.g., 'Weekly Groceries'.",
    },
    categories: {
      type: Type.ARRAY,
      description: "A list of food categories.",
      items: {
        type: Type.OBJECT,
        properties: {
          categoryName: {
            type: Type.STRING,
            description:
              "Name of the category, e.g., 'Produce', 'Dairy', 'Meat'.",
          },
          items: {
            type: Type.ARRAY,
            description: "List of items in this category.",
            items: { type: Type.STRING },
          },
        },
        required: ["categoryName", "items"],
      },
    },
  },
  required: ["title", "categories"],
};

export const generateRecipe = async (
  request: RecipeRequest
): Promise<Recipe> => {
  const { ingredients, mealType, cuisine, dietary } = request;
  const prompt = `
    You are a creative chef. Generate a complete recipe based on the following:
    - Available Ingredients: ${ingredients}
    - Meal Type: ${mealType}
    - Cuisine: ${cuisine}
    - Dietary Restrictions: ${dietary}
    
    Prioritize the provided ingredients, but you can include common pantry staples.
    Ensure the entire response is a single, valid JSON object that strictly adheres to the provided schema. Do not include any markdown.
  `;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: recipeSchema,
        temperature: 0.7,
      },
    });
    const jsonText = response.text.trim();
    const recipeData = JSON.parse(jsonText);
    if (
      !recipeData.recipeName ||
      !recipeData.ingredients ||
      !recipeData.instructions
    ) {
      throw new Error("Invalid recipe format received from API.");
    }
    return recipeData as Recipe;
  } catch (error) {
    console.error("Error generating recipe with Gemini:", error);
    throw error;
  }
};

export const generateMealPlan = async (
  request: MealPlanRequest
): Promise<MealPlan> => {
  const { duration, dietaryNeeds, otherRequests } = request;
  const prompt = `
    You are an expert nutritionist and meal planner. Create a detailed meal plan for ${duration}.
    - Dietary Focus: ${dietaryNeeds}
    - Other requirements: ${otherRequests || "None"}.
    
    The plan should include breakfast, lunch, and dinner for each day. For each meal, provide a name and a short description.
    Ensure the entire response is a single, valid JSON object that strictly adheres to the provided schema. Do not include any markdown.
  `;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: mealPlanSchema,
        temperature: 0.8,
      },
    });
    const jsonText = response.text.trim();
    const mealPlanData = JSON.parse(jsonText);
    if (!mealPlanData.title || !mealPlanData.dailyPlans) {
      throw new Error("Invalid meal plan format received from API.");
    }
    return mealPlanData as MealPlan;
  } catch (error) {
    console.error("Error generating meal plan with Gemini:", error);
    throw error;
  }
};

export const generateImage = async (prompt: string): Promise<string> => {
  const fullPrompt = `A vibrant, photorealistic, professionally shot image of a delicious plate of ${prompt}. Studio lighting, high detail, extremely appetizing presentation, epic food photography.`;
  try {
    const response = await fetch(
      "https://api.freepik.com/v1/ai/image-relight",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "x-freepik-api-key": import.meta.env.VITE_FREEPIK_API_KEY,
        },
        body: JSON.stringify({
          prompt: fullPrompt,
          num_results: 1,
          width: 1024,
          height: 576, // 16:9 aspect ratio to match DishVisualizer
        }),
      }
    );
    if (!response.ok) {
      throw new Error(
        `Freepik API error: ${response.status} ${response.statusText}`
      );
    }
    const data = await response.json();
    if (!data.data || !data.data[0]?.url) {
      throw new Error("No image generated by Freepik");
    }
    return data.data[0].url; // Returns image URL for DishVisualizer
  } catch (error) {
    console.error("Error generating image with Freepik:", error);
    throw error;
  }
};

export const editImage = async (
  base64ImageData: string,
  mimeType: string,
  prompt: string
): Promise<string> => {
  try {
    const response = await fetch(
      "https://api.freepik.com/v1/ai/image-relight",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "x-freepik-api-key": import.meta.env.VITE_FREEPIK_API_KEY,
        },
        body: JSON.stringify({
          image: base64ImageData,
          mime_type: mimeType,
          prompt: prompt,
        }),
      }
    );
    if (!response.ok) {
      throw new Error(
        `Freepik API error: ${response.status} ${response.statusText}`
      );
    }
    const data = await response.json();
    if (!data.data || !data.data[0]?.url) {
      throw new Error("No edited image generated by Freepik");
    }
    return data.data[0].url; // Returns edited image URL
  } catch (error) {
    console.error("Error editing image with Freepik:", error);
    throw error;
  }
};

export const identifyIngredientsFromImage = async (
  base64ImageData: string,
  mimeType: string
): Promise<string> => {
  const imagePart = {
    inlineData: { data: base64ImageData, mimeType },
  };
  const textPart = {
    text: "Identify all the food ingredients in this image. List them as a comma-separated string. If there are no identifiable food items, return an empty string.",
  };
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: [imagePart, textPart] },
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error identifying ingredients from image:", error);
    throw error;
  }
};

export const getRecipeFromImage = async (
  base64ImageData: string,
  mimeType: string
): Promise<Recipe> => {
  const imagePart = {
    inlineData: { data: base64ImageData, mimeType },
  };
  const textPart = {
    text: "First, identify the dish in this image. Then, generate a detailed recipe for it. Ensure the entire response is a single, valid JSON object that strictly adheres to the provided schema. Do not include any markdown.",
  };
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: recipeSchema,
      },
    });
    const jsonText = response.text.trim();
    const recipeData = JSON.parse(jsonText);
    return recipeData as Recipe;
  } catch (error) {
    console.error("Error generating recipe from image:", error);
    throw error;
  }
};

export const generateShoppingList = async (
  mealPlan: MealPlan
): Promise<ShoppingList> => {
  const prompt = `
    You are an expert shopping list creator. Based on the following meal plan, generate a consolidated and categorized shopping list.
    Omit common pantry staples like salt, pepper, and cooking oil unless specified in large amounts.
    Meal Plan: ${JSON.stringify(mealPlan)}
    Ensure the entire response is a single, valid JSON object that strictly adheres to the provided schema. Do not include any markdown.
  `;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: shoppingListSchema,
      },
    });
    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as ShoppingList;
  } catch (error) {
    console.error("Error generating shopping list:", error);
    throw error;
  }
};
