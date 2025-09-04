export interface RecipeIngredient {
  quantity: string;
  name: string;
}

export interface Recipe {
  recipeName: string;
  description: string;
  prepTime: string;
  cookTime: string;
  servings: string;
  ingredients: RecipeIngredient[];
  instructions: string[];
}

export interface RecipeRequest {
  ingredients: string;
  mealType: string;
  cuisine: string;
  dietary: string;
}


// Meal Planner Types
export interface Meal {
  name: string;
  description: string;
}

export interface DailyPlan {
  day: string;
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
}

export interface MealPlan {
  title: string;
  summary: string;
  dailyPlans: DailyPlan[];
}

export interface MealPlanRequest {
  dietaryNeeds: string;
  duration: string;
  otherRequests: string;
}

// Shopping List Types
export interface ShoppingListItem {
    categoryName: string;
    items: string[];
}

export interface ShoppingList {
    title: string;
    categories: ShoppingListItem[];
}


// User Authentication Types
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Stored for demo purposes; use hashing in production
}
