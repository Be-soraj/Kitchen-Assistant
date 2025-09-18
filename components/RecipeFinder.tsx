import React, { useState, useRef } from "react";
import { getRecipeFromImage } from "../services/geminiService";
import type { Recipe } from "../types";
import { fileToBase64 } from "../utils/imageUtils";
import { RecipeCard } from "./RecipeCard";
import { RecipeCardSkeleton } from "./RecipeCardSkeleton";
import { Loader } from "./Loader";

export const RecipeFinder: React.FC = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Display the image preview immediately
    const previewUrl = URL.createObjectURL(file);
    setUploadedImage(previewUrl);

    setIsLoading(true);
    setError(null);
    setGeneratedRecipe(null);

    try {
      const { data, mimeType } = await fileToBase64(file);
      const recipe = await getRecipeFromImage(data, mimeType);
      setGeneratedRecipe(recipe);
    } catch (err) {
      setError(
        "We couldn't identify this dish or generate a recipe. Please try a different image."
      );
      console.error(err);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          className="hidden"
          accept="image/*"
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <h2 className="mt-4 text-2xl md:text-3xl font-bold text-gray-700">
          Find Recipe from Image
        </h2>
        <p className="mt-2 text-gray-500">
          Have a photo of a delicious meal? Upload it and we'll find the recipe
          for you!
        </p>
        <button
          type="button"
          onClick={triggerFileUpload}
          disabled={isLoading}
          className="mt-6 bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-500 focus:ring-opacity-50 transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 mx-auto"
        >
          {isLoading ? (
            <>
              <Loader /> Searching...
            </>
          ) : (
            "Upload a Dish Photo"
          )}
        </button>
      </div>

      <div className="mt-10">
        {uploadedImage && !isLoading && !generatedRecipe && !error && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <img
              src={uploadedImage}
              alt="Uploaded dish"
              className="w-full h-auto max-h-96 object-cover"
            />
          </div>
        )}
        {isLoading && <RecipeCardSkeleton />}
        {error && (
          <div
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg"
            role="alert"
          >
            <p className="font-bold">Oops!</p>
            <p>{error}</p>
          </div>
        )}
        {generatedRecipe && <RecipeCard recipe={generatedRecipe} />}
      </div>
    </div>
  );
};
