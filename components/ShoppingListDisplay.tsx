import React from 'react';
import type { ShoppingList } from '../types';

interface ShoppingListDisplayProps {
    shoppingList: ShoppingList;
}

export const ShoppingListDisplay: React.FC<ShoppingListDisplayProps> = ({ shoppingList }) => {
    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden p-8 animate-[fadeIn_0.5s_ease-in-out]">
            <h2 className="text-3xl font-bold text-green-800 mb-2">{shoppingList.title}</h2>
            <p className="text-gray-600 mb-6 italic">Your personalized shopping list is ready!</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {shoppingList.categories.map((category) => (
                    <div key={category.categoryName}>
                        <h3 className="text-xl font-bold text-gray-700 mb-4 border-b-2 border-green-200 pb-2">{category.categoryName}</h3>
                        <ul className="space-y-3">
                            {category.items.map((item, index) => (
                                <li key={index} className="flex items-center">
                                    <input
                                        id={`${category.categoryName}-${index}`}
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                    />
                                    <label htmlFor={`${category.categoryName}-${index}`} className="ml-3 text-sm text-gray-700">
                                        {item}
                                    </label>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};
