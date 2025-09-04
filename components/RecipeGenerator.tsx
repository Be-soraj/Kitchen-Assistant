import React, { useState, useCallback, useRef } from 'react';
import { generateRecipe, identifyIngredientsFromImage } from '../services/geminiService';
import type { Recipe, RecipeRequest } from '../types';
import { MEAL_TYPES, CUISINES, DIETARY_RESTRICTIONS } from '../constants';
import { RecipeCard } from './RecipeCard';
import { Loader } from './Loader';
import { RecipeCardSkeleton } from './RecipeCardSkeleton';
import { fileToBase64 } from '../utils/imageUtils';
import { CookingAssistant } from './CookingAssistant';


export const RecipeGenerator: React.FC = () => {
  const [ingredients, setIngredients] = useState<string>('');
  const [mealType, setMealType] = useState<string>('any');
  const [cuisine, setCuisine] = useState<string>('any');
  const [dietary, setDietary] = useState<string>('none');

  const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAnalyzeImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    setError(null);
    try {
      const base64String = await fileToBase64(file);
      const { data, mimeType } = base64String;
      const identifiedIngredients = await identifyIngredientsFromImage(data, mimeType);
      setIngredients(prev => prev ? `${prev}, ${identifiedIngredients}` : identifiedIngredients);
    } catch (err) {
      setError('Could not analyze the image. Please try again.');
      console.error(err);
    } finally {
      setIsAnalyzing(false);
      // Reset file input
      if(fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    if (!ingredients.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setGeneratedRecipe(null);
    setIsChatOpen(false);

    const recipeRequest: RecipeRequest = {
      ingredients: ingredients.trim(),
      mealType,
      cuisine,
      dietary,
    };

    try {
      const recipe = await generateRecipe(recipeRequest);
      setGeneratedRecipe(recipe);
    } catch (err) {
      setError('An error occurred. Please check your ingredients and try again. The AI chef might be busy.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [ingredients, mealType, cuisine, dietary, isLoading]);

  return (
    <div className="max-w-4xl mx-auto">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-700 mb-2">What's in your pantry?</h2>
        <p className="text-gray-500 mb-6">Enter your ingredients manually or scan them with your camera.</p>

        <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
            <div>
                <div className="flex justify-between items-center mb-2">
                    <label htmlFor="ingredients" className="block text-sm font-semibold text-gray-600">Ingredients</label>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleAnalyzeImage}
                        className="hidden"
                        accept="image/*"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isAnalyzing}
                        className="flex items-center gap-2 text-sm font-semibold text-green-600 hover:text-green-800 disabled:text-gray-400 disabled:cursor-wait transition-colors"
                    >
                         {isAnalyzing ? (
                            <>
                                <Loader /> Analyzing...
                            </>
                        ) : (
                             <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
                                Scan Pantry
                            </>
                        )}
                    </button>
                </div>
                <textarea
                id="ingredients"
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                placeholder="e.g., chicken breast, broccoli, garlic, olive oil"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200 bg-white"
                rows={4}
                required
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                <label htmlFor="mealType" className="block text-sm font-semibold text-gray-600 mb-2">Meal Type</label>
                <select id="mealType" value={mealType} onChange={(e) => setMealType(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200 bg-white">
                    {MEAL_TYPES.map(type => <option key={type} value={type.toLowerCase()}>{type}</option>)}
                </select>
                </div>
                <div>
                <label htmlFor="cuisine" className="block text-sm font-semibold text-gray-600 mb-2">Cuisine</label>
                <select id="cuisine" value={cuisine} onChange={(e) => setCuisine(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200 bg-white">
                    {CUISINES.map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}
                </select>
                </div>
                <div>
                <label htmlFor="dietary" className="block text-sm font-semibold text-gray-600 mb-2">Dietary Needs</label>
                <select id="dietary" value={dietary} onChange={(e) => setDietary(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200 bg-white">
                    {DIETARY_RESTRICTIONS.map(d => <option key={d} value={d.toLowerCase()}>{d}</option>)}
                </select>
                </div>
            </div>

            <button
                type="submit"
                disabled={isLoading || isAnalyzing}
                className="w-full bg-orange-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-500 focus:ring-opacity-50 transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
                {isLoading ? <><Loader /> Generating...</> : 'Generate Recipe'}
            </button>
            </div>
        </form>
        </div>

        <div className="mt-10">
        {isLoading && <RecipeCardSkeleton />}
        {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg" role="alert">
            <p className="font-bold">Oh no!</p>
            <p>{error}</p>
            </div>
        )}
        {generatedRecipe && (
            <>
                <RecipeCard recipe={generatedRecipe} onAskChef={() => setIsChatOpen(true)} />
                {isChatOpen && <CookingAssistant recipe={generatedRecipe} onClose={() => setIsChatOpen(false)} />}
            </>
        )}
        </div>
    </div>
  );
};
