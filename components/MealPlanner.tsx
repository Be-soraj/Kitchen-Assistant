import React, { useState, useCallback } from 'react';
import { generateMealPlan, generateShoppingList } from '../services/geminiService';
import type { MealPlan, MealPlanRequest, ShoppingList } from '../types';
import { MEAL_PLAN_DURATIONS, MEAL_PLAN_DIETS } from '../constants';
import { Loader } from './Loader';
import { RecipeCardSkeleton } from './RecipeCardSkeleton';
import { ShoppingListDisplay } from './ShoppingListDisplay';


export const MealPlanner: React.FC = () => {
    const [duration, setDuration] = useState<string>('3 days');
    const [diet, setDiet] = useState<string>('none');
    const [requests, setRequests] = useState<string>('');

    const [generatedPlan, setGeneratedPlan] = useState<MealPlan | null>(null);
    const [shoppingList, setShoppingList] = useState<ShoppingList | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isShoppingListLoading, setIsShoppingListLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateShoppingList = async () => {
        if (!generatedPlan || isShoppingListLoading) return;

        setIsShoppingListLoading(true);
        setError(null);
        try {
            const list = await generateShoppingList(generatedPlan);
            setShoppingList(list);
        } catch (err) {
            setError("Could not generate the shopping list. Please try again.");
            console.error(err);
        } finally {
            setIsShoppingListLoading(false);
        }
    };


    const handleSubmit = useCallback(async (event: React.FormEvent) => {
        event.preventDefault();
        if (isLoading) return;

        setIsLoading(true);
        setError(null);
        setGeneratedPlan(null);
        setShoppingList(null);

        const request: MealPlanRequest = {
            duration,
            dietaryNeeds: diet,
            otherRequests: requests.trim(),
        };

        try {
            const plan = await generateMealPlan(request);
            setGeneratedPlan(plan);
        } catch (err) {
            setError('An error occurred. Please review your selections and try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [duration, diet, requests, isLoading]);

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-700 mb-2">Design Your Weekly Menu</h2>
                <p className="text-gray-500 mb-6">Tell us your goals, and we'll craft a personalized meal plan for you.</p>

                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="duration" className="block text-sm font-semibold text-gray-600 mb-2">Plan Duration</label>
                                <select id="duration" value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200 bg-white">
                                    {MEAL_PLAN_DURATIONS.map(d => <option key={d} value={d.toLowerCase()}>{d}</option>)}
                                </select>
                            </div>
                             <div>
                                <label htmlFor="diet" className="block text-sm font-semibold text-gray-600 mb-2">Dietary Focus</label>
                                <select id="diet" value={diet} onChange={(e) => setDiet(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200 bg-white">
                                    {MEAL_PLAN_DIETS.map(d => <option key={d} value={d.toLowerCase()}>{d}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="requests" className="block text-sm font-semibold text-gray-600 mb-2">Other Requests</label>
                            <input
                                id="requests"
                                value={requests}
                                onChange={(e) => setRequests(e.target.value)}
                                placeholder="e.g., high protein, quick meals, no nuts"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200 bg-white"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-orange-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-500 focus:ring-opacity-50 transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                        >
                            {isLoading ? <><Loader /> Generating Plan...</> : 'Generate Meal Plan'}
                        </button>
                    </div>
                </form>
            </div>
            <div className="mt-10 space-y-10">
                {isLoading && <RecipeCardSkeleton />}
                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg" role="alert">
                        <p className="font-bold">Planning Hiccup!</p>
                        <p>{error}</p>
                    </div>
                )}
                {generatedPlan && (
                     <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden p-8 animate-[fadeIn_0.5s_ease-in-out]">
                        <h2 className="text-3xl font-bold text-green-800 mb-2">{generatedPlan.title}</h2>
                        <p className="text-gray-600 mb-6 italic">{generatedPlan.summary}</p>
                        <div className="space-y-8">
                            {generatedPlan.dailyPlans.map(plan => (
                                <div key={plan.day} className="border border-gray-200 p-6 rounded-xl">
                                    <h3 className="text-xl font-bold text-gray-700 mb-4 border-b-2 border-green-200 pb-2">{plan.day}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-green-50 p-4 rounded-lg">
                                            <h4 className="font-bold text-green-700">Breakfast</h4>
                                            <p className="font-semibold text-gray-800 text-sm">{plan.breakfast.name}</p>
                                            <p className="text-gray-600 text-xs mt-1">{plan.breakfast.description}</p>
                                        </div>
                                         <div className="bg-green-50 p-4 rounded-lg">
                                            <h4 className="font-bold text-green-700">Lunch</h4>
                                            <p className="font-semibold text-gray-800 text-sm">{plan.lunch.name}</p>
                                            <p className="text-gray-600 text-xs mt-1">{plan.lunch.description}</p>
                                        </div>
                                         <div className="bg-green-50 p-4 rounded-lg">
                                            <h4 className="font-bold text-green-700">Dinner</h4>
                                            <p className="font-semibold text-gray-800 text-sm">{plan.dinner.name}</p>
                                            <p className="text-gray-600 text-xs mt-1">{plan.dinner.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 pt-6 border-t border-gray-200">
                             <button
                                type="button"
                                onClick={handleGenerateShoppingList}
                                disabled={isShoppingListLoading}
                                className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-opacity-50 transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                            >
                                {isShoppingListLoading ? <><Loader /> Building List...</> : 'Generate Shopping List'}
                            </button>
                        </div>
                    </div>
                )}
                {isShoppingListLoading && <RecipeCardSkeleton />}
                {shoppingList && <ShoppingListDisplay shoppingList={shoppingList} />}
            </div>
        </div>
    );
};
