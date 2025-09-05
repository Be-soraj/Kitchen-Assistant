import React, { useState, useCallback } from "react";
import { generateImage, editImage } from "../services/geminiService";
import { Loader } from "./Loader";

// Utility to handle both base64 data URLs and direct image URLs
const parseImageData = async (
  imageInput: string
): Promise<{ data: string; mimeType: string }> => {
  if (imageInput.startsWith("data:image/")) {
    // Handle base64 data URL
    const parts = imageInput.split(",");
    const meta = parts[0].split(":")[1].split(";")[0];
    return { data: parts[1], mimeType: meta };
  } else {
    // Handle direct URL by fetching as blob
    try {
      const response = await fetch(imageInput, {
        method: "GET",
        headers: {
          Accept: "image/*",
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      const blob = await response.blob();
      const mimeType = blob.type || "image/jpeg";
      const arrayBuffer = await blob.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      );
      return { data: base64, mimeType };
    } catch (error) {
      throw new Error(`Error converting image URL to base64: ${error}`);
    }
  }
};

export const DishVisualizer: React.FC = () => {
  const [prompt, setPrompt] = useState<string>("");
  const [editPrompt, setEditPrompt] = useState<string>("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      if (!prompt.trim() || isLoading) return;

      setIsLoading(true);
      setError(null);
      setGeneratedImage(null);

      try {
        const imageUrl = await generateImage(prompt);
        setGeneratedImage(imageUrl);
      } catch (err) {
        setError(
          "Failed to visualize dish. Check your Freepik API key or daily limit (20 images/day)."
        );
        console.error("Error in handleSubmit:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [prompt, isLoading]
  );

  const handleEdit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      if (!editPrompt.trim() || !generatedImage || isEditing) return;

      setIsEditing(true);
      setError(null);
      try {
        const { data, mimeType } = await parseImageData(generatedImage);
        const newImageUrl = await editImage(data, mimeType, editPrompt);
        setGeneratedImage(newImageUrl);
        setEditPrompt("");
      } catch (err) {
        setError(
          "Failed to edit image. Check your Freepik API key or daily limit."
        );
        console.error("Error in handleEdit:", err);
      } finally {
        setIsEditing(false);
      }
    },
    [editPrompt, generatedImage, isEditing]
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-700 mb-2">
          Visualize Your Dish
        </h2>
        <p className="text-gray-500 mb-6">
          Describe a dish, and our AI will create a photorealistic image of it
          for you.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="prompt"
                className="block text-sm font-semibold text-gray-600 mb-2"
              >
                Dish Description
              </label>
              <input
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., spicy Thai green curry with chicken and jasmine rice"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200 bg-white"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || isEditing}
              className="w-full bg-orange-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-500 focus:ring-opacity-50 transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader /> Visualizing...
                </>
              ) : (
                "Visualize Dish"
              )}
            </button>
          </div>
        </form>
      </div>
      <div className="mt-10">
        {isLoading && (
          <div className="w-full aspect-video bg-gray-200 rounded-2xl flex items-center justify-center animate-pulse">
            <div className="text-gray-500">The AI is painting your dish...</div>
          </div>
        )}
        {error && (
          <div
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg"
            role="alert"
          >
            <p className="font-bold">Creative Block!</p>
            <p>{error}</p>
          </div>
        )}
        {generatedImage && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-[fadeIn_0.5s_ease-in-out]">
            <div className="relative">
              <img
                src={generatedImage}
                alt={prompt}
                className="w-full h-auto object-cover"
              />
              {isEditing && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="flex items-center gap-2 text-white">
                    <Loader />
                    <span>Refining image...</span>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 bg-gray-50">
              <form
                onSubmit={handleEdit}
                className="flex flex-col sm:flex-row gap-3"
              >
                <input
                  type="text"
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  placeholder="Describe your changes... e.g., 'add a sprig of parsley'"
                  className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200"
                  disabled={isEditing}
                />
                <button
                  type="submit"
                  disabled={isEditing || !editPrompt.trim()}
                  className="bg-green-600 text-white font-bold py-3 px-5 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isEditing ? (
                    <Loader />
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  )}
                  Refine
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
