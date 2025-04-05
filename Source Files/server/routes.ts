import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import OpenAI from "openai";
import { z } from "zod";
import {
  insertUserSchema,
  insertUserPreferencesSchema,
  insertWorkoutSchema,
  insertWorkoutLogSchema,
  insertNutritionPlanSchema,
  insertMealEntrySchema,
  fitnessGoals,
  experienceLevels,
  equipmentOptions,
  mealTypes,
  dietTypes
} from "@shared/schema";

// Initialize OpenAI
if (!process.env.OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY environment variable is not set. AI features will not work.");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Helper to catch async errors
  const asyncHandler = (fn: (req: Request, res: Response) => Promise<void>) => 
    (req: Request, res: Response) => {
      fn(req, res).catch(err => {
        console.error("Route error:", err);
        res.status(500).json({ message: err.message || "Internal server error" });
      });
    };

  // User Routes
  app.post("/api/auth/register", asyncHandler(async (req, res) => {
    const validationResult = insertUserSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: "Invalid user data",
        errors: validationResult.error.format() 
      });
    }
    
    const userData = validationResult.data;
    const existingUser = await storage.getUserByUsername(userData.username);
    
    if (existingUser) {
      return res.status(409).json({ message: "Username already exists" });
    }
    
    const user = await storage.createUser(userData);
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  }));

  app.post("/api/auth/login", asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    
    const user = await storage.getUserByUsername(username);
    
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({ user: userWithoutPassword });
  }));

  // User Preferences Routes
  app.post("/api/preferences", asyncHandler(async (req, res) => {
    const validationResult = insertUserPreferencesSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: "Invalid preferences data",
        errors: validationResult.error.format() 
      });
    }
    
    const preferencesData = validationResult.data;
    
    // Validate that user exists
    const user = await storage.getUser(preferencesData.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Check if preferences already exist
    const existingPreferences = await storage.getUserPreferences(preferencesData.userId);
    
    if (existingPreferences) {
      // Update existing preferences
      const updatedPreferences = await storage.updateUserPreferences(
        existingPreferences.id, 
        preferencesData
      );
      return res.json(updatedPreferences);
    }
    
    // Create new preferences
    const preferences = await storage.createUserPreferences(preferencesData);
    res.status(201).json(preferences);
  }));

  app.get("/api/preferences/:userId", asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const preferences = await storage.getUserPreferences(userId);
    
    if (!preferences) {
      return res.status(404).json({ message: "Preferences not found" });
    }
    
    res.json(preferences);
  }));

  // Workout Routes
  app.post("/api/workouts", asyncHandler(async (req, res) => {
    const validationResult = insertWorkoutSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: "Invalid workout data",
        errors: validationResult.error.format() 
      });
    }
    
    const workoutData = validationResult.data;
    
    // Validate that user exists
    const user = await storage.getUser(workoutData.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const workout = await storage.createWorkout(workoutData);
    res.status(201).json(workout);
  }));

  app.get("/api/workouts/:id", asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid workout ID" });
    }
    
    const workout = await storage.getWorkout(id);
    
    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }
    
    res.json(workout);
  }));

  app.get("/api/workouts/user/:userId", asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const workouts = await storage.getWorkoutsByUserId(userId);
    res.json(workouts);
  }));

  // Workout Log Routes
  app.post("/api/workout-logs", asyncHandler(async (req, res) => {
    const validationResult = insertWorkoutLogSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: "Invalid workout log data",
        errors: validationResult.error.format() 
      });
    }
    
    const logData = validationResult.data;
    
    // Validate that user and workout exist
    const user = await storage.getUser(logData.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const workout = await storage.getWorkout(logData.workoutId);
    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }
    
    const log = await storage.createWorkoutLog(logData);
    res.status(201).json(log);
  }));

  app.patch("/api/workout-logs/:id", asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid workout log ID" });
    }
    
    const validationResult = insertWorkoutLogSchema.partial().safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: "Invalid workout log update data",
        errors: validationResult.error.format() 
      });
    }
    
    const updateData = validationResult.data;
    const updatedLog = await storage.updateWorkoutLog(id, updateData);
    
    if (!updatedLog) {
      return res.status(404).json({ message: "Workout log not found" });
    }
    
    res.json(updatedLog);
  }));

  app.get("/api/workout-logs/user/:userId", asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const logs = await storage.getWorkoutLogsByUserId(userId);
    res.json(logs);
  }));

  // AI Workout Generation
  app.post("/api/generate-workout", asyncHandler(async (req, res) => {
    const schema = z.object({
      userId: z.number(),
      goals: z.array(z.string()),
      experienceLevel: z.string(),
      availableEquipment: z.string(),
      workoutDuration: z.number().optional().nullable(),
      focusAreas: z.array(z.string()).optional().nullable(),
    });
    
    const validationResult = schema.safeParse(req.body);
    
    if (!validationResult.success) {
      console.error("Workout generation validation error:", JSON.stringify(validationResult.error.format()));
      console.error("Request body:", JSON.stringify(req.body));
      return res.status(400).json({ 
        message: "Invalid workout generation data",
        errors: validationResult.error.format() 
      });
    }
    
    const { userId, goals, experienceLevel, availableEquipment, workoutDuration, focusAreas } = validationResult.data;
    
    // Validate that user exists
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    try {
      // Use OpenAI to generate workout
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are an expert fitness trainer specialized in creating personalized workout plans. Create workouts that are safe, effective, and tailored to the user's needs."
          },
          {
            role: "user",
            content: `Create a workout plan with the following parameters:
            - Goals: ${goals.join(", ")}
            - Experience level: ${experienceLevel}
            - Available equipment: ${availableEquipment}
            ${workoutDuration ? `- Workout duration: ${workoutDuration} minutes` : ""}
            ${focusAreas && focusAreas.length > 0 ? `- Focus areas: ${focusAreas.join(", ")}` : ""}
            
            Return a JSON object with the following structure:
            {
              "title": "Workout title",
              "description": "Brief workout description",
              "duration": duration in minutes,
              "level": "Beginner/Intermediate/Advanced",
              "type": "Strength/Cardio/HIIT/etc",
              "imageDescription": "Description for an image that would represent this workout",
              "exercises": [
                {
                  "name": "Exercise name",
                  "sets": number of sets,
                  "reps": number of reps,
                  "restTime": rest time in seconds,
                  "instructions": "Step-by-step instructions",
                  "tip": "A helpful tip for proper form"
                }
              ]
            }`
          }
        ],
        response_format: { type: "json_object" }
      });
      
      // Parse the response
      const workoutPlan = JSON.parse(response.choices[0].message.content);
      
      // Create a workout in the storage
      const workout = await storage.createWorkout({
        userId,
        title: workoutPlan.title,
        description: workoutPlan.description,
        duration: workoutPlan.duration,
        level: workoutPlan.level,
        type: workoutPlan.type,
        imageUrl: null, // We would generate an image in a production app
        exercises: workoutPlan.exercises,
        aiGenerated: true,
      });
      
      res.json(workout);
    } catch (error) {
      console.error("OpenAI API error:", error);
      res.status(500).json({ 
        message: "Failed to generate workout plan", 
        error: error.message 
      });
    }
  }));

  // Nutrition Plan Routes
  app.post("/api/nutrition-plans", asyncHandler(async (req, res) => {
    const validationResult = insertNutritionPlanSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: "Invalid nutrition plan data",
        errors: validationResult.error.format() 
      });
    }
    
    const planData = validationResult.data;
    
    // Validate that user exists
    const user = await storage.getUser(planData.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const plan = await storage.createNutritionPlan(planData);
    res.status(201).json(plan);
  }));

  app.get("/api/nutrition-plans/:id", asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid nutrition plan ID" });
    }
    
    const plan = await storage.getNutritionPlan(id);
    
    if (!plan) {
      return res.status(404).json({ message: "Nutrition plan not found" });
    }
    
    res.json(plan);
  }));

  app.get("/api/nutrition-plans/user/:userId", asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const plans = await storage.getNutritionPlansByUserId(userId);
    res.json(plans);
  }));

  app.patch("/api/nutrition-plans/:id", asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid nutrition plan ID" });
    }
    
    const validationResult = insertNutritionPlanSchema.partial().safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: "Invalid nutrition plan update data",
        errors: validationResult.error.format() 
      });
    }
    
    const updateData = validationResult.data;
    const updatedPlan = await storage.updateNutritionPlan(id, updateData);
    
    if (!updatedPlan) {
      return res.status(404).json({ message: "Nutrition plan not found" });
    }
    
    res.json(updatedPlan);
  }));

  // Meal Entry Routes
  app.post("/api/meal-entries", asyncHandler(async (req, res) => {
    const validationResult = insertMealEntrySchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: "Invalid meal entry data",
        errors: validationResult.error.format() 
      });
    }
    
    const entryData = validationResult.data;
    
    // Validate that user exists
    const user = await storage.getUser(entryData.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Validate that plan exists if provided
    if (entryData.planId) {
      const plan = await storage.getNutritionPlan(entryData.planId);
      if (!plan) {
        return res.status(404).json({ message: "Nutrition plan not found" });
      }
    }
    
    const entry = await storage.createMealEntry(entryData);
    res.status(201).json(entry);
  }));

  app.get("/api/meal-entries/:id", asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid meal entry ID" });
    }
    
    const entry = await storage.getMealEntry(id);
    
    if (!entry) {
      return res.status(404).json({ message: "Meal entry not found" });
    }
    
    res.json(entry);
  }));

  app.get("/api/meal-entries/user/:userId", asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const entries = await storage.getMealEntriesByUserId(userId);
    res.json(entries);
  }));

  app.get("/api/meal-entries/plan/:planId", asyncHandler(async (req, res) => {
    const planId = parseInt(req.params.planId);
    
    if (isNaN(planId)) {
      return res.status(400).json({ message: "Invalid plan ID" });
    }
    
    const entries = await storage.getMealEntriesByPlanId(planId);
    res.json(entries);
  }));

  app.get("/api/meal-entries/user/:userId/date/:date", asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.userId);
    const date = new Date(req.params.date);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    if (isNaN(date.getTime())) {
      return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD" });
    }
    
    const entries = await storage.getMealEntriesByDate(userId, date);
    res.json(entries);
  }));

  app.patch("/api/meal-entries/:id", asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid meal entry ID" });
    }
    
    const validationResult = insertMealEntrySchema.partial().safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: "Invalid meal entry update data",
        errors: validationResult.error.format() 
      });
    }
    
    const updateData = validationResult.data;
    const updatedEntry = await storage.updateMealEntry(id, updateData);
    
    if (!updatedEntry) {
      return res.status(404).json({ message: "Meal entry not found" });
    }
    
    res.json(updatedEntry);
  }));

  app.delete("/api/meal-entries/:id", asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid meal entry ID" });
    }
    
    const deleted = await storage.deleteMealEntry(id);
    
    if (!deleted) {
      return res.status(404).json({ message: "Meal entry not found" });
    }
    
    res.status(204).end();
  }));

  // AI Nutrition Plan Generation
  app.post("/api/generate-nutrition-plan", asyncHandler(async (req, res) => {
    const schema = z.object({
      userId: z.number(),
      goals: z.array(z.string()),
      dietType: z.string(),
      calorieTarget: z.number().optional().nullable(),
      allergies: z.array(z.string()).optional().nullable(),
      preferredFoods: z.array(z.string()).optional().nullable(),
    });
    
    const validationResult = schema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: "Invalid nutrition plan generation data",
        errors: validationResult.error.format() 
      });
    }
    
    const { userId, goals, dietType, calorieTarget, allergies, preferredFoods } = validationResult.data;
    
    // Validate that user exists
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    try {
      // Use OpenAI to generate nutrition plan
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are an expert nutritionist specialized in creating personalized meal plans. Create nutrition plans that are healthy, balanced, and tailored to the user's needs."
          },
          {
            role: "user",
            content: `Create a nutrition plan with the following parameters:
            - Goals: ${goals.join(", ")}
            - Diet type: ${dietType}
            ${calorieTarget ? `- Calorie target: ${calorieTarget} calories per day` : ""}
            ${allergies && allergies.length > 0 ? `- Allergies: ${allergies.join(", ")}` : ""}
            ${preferredFoods && preferredFoods.length > 0 ? `- Preferred foods: ${preferredFoods.join(", ")}` : ""}
            
            Return a JSON object with the following structure:
            {
              "title": "Nutrition plan title",
              "description": "Brief nutrition plan description",
              "calorieTarget": target daily calories,
              "proteinTarget": target daily protein in grams,
              "carbTarget": target daily carbohydrates in grams,
              "fatTarget": target daily fat in grams,
              "recommendations": {
                "breakfast": [
                  {
                    "name": "Meal name",
                    "description": "Brief description",
                    "calories": estimated calories,
                    "protein": protein in grams,
                    "carbs": carbs in grams,
                    "fat": fat in grams,
                    "ingredients": ["ingredient 1", "ingredient 2", ...]
                  }
                ],
                "lunch": [
                  {
                    "name": "Meal name",
                    "description": "Brief description",
                    "calories": estimated calories,
                    "protein": protein in grams,
                    "carbs": carbs in grams,
                    "fat": fat in grams,
                    "ingredients": ["ingredient 1", "ingredient 2", ...]
                  }
                ],
                "dinner": [
                  {
                    "name": "Meal name",
                    "description": "Brief description",
                    "calories": estimated calories,
                    "protein": protein in grams,
                    "carbs": carbs in grams,
                    "fat": fat in grams,
                    "ingredients": ["ingredient 1", "ingredient 2", ...]
                  }
                ],
                "snacks": [
                  {
                    "name": "Snack name",
                    "description": "Brief description",
                    "calories": estimated calories,
                    "protein": protein in grams,
                    "carbs": carbs in grams,
                    "fat": fat in grams,
                    "ingredients": ["ingredient 1", "ingredient 2", ...]
                  }
                ]
              }
            }`
          }
        ],
        response_format: { type: "json_object" }
      });
      
      // Parse the response
      const nutritionPlan = JSON.parse(response.choices[0].message.content);
      
      // Create a nutrition plan in the storage
      const plan = await storage.createNutritionPlan({
        userId,
        title: nutritionPlan.title,
        description: nutritionPlan.description,
        calorieTarget: nutritionPlan.calorieTarget,
        proteinTarget: nutritionPlan.proteinTarget,
        carbTarget: nutritionPlan.carbTarget,
        fatTarget: nutritionPlan.fatTarget,
        recommendations: nutritionPlan.recommendations,
        aiGenerated: true,
      });
      
      res.json(plan);
    } catch (error) {
      console.error("OpenAI API error:", error);
      res.status(500).json({ 
        message: "Failed to generate nutrition plan", 
        error: error.message 
      });
    }
  }));

  // Get options for onboarding and nutrition
  app.get("/api/onboarding-options", (req, res) => {
    res.json({
      fitnessGoals,
      experienceLevels,
      equipmentOptions,
      mealTypes,
      dietTypes
    });
  });

  // Check if OpenAI API key is set and working
  app.get("/api/check-openai-key", asyncHandler(async (req, res) => {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return res.json({ valid: false, message: "OpenAI API key is not set. Please add it to the environment variables." });
      }

      // Make a simple request to the OpenAI API to check if the key is valid
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: "Hello, is my API key working?" }
        ],
        max_tokens: 5
      });

      if (response) {
        return res.json({ valid: true, message: "OpenAI API key is valid and working." });
      } else {
        return res.json({ valid: false, message: "Failed to verify OpenAI API key." });
      }
    } catch (error) {
      console.error("Error checking OpenAI API key:", error);
      
      // Handle quota exceeded errors specifically
      if (error.code === 'insufficient_quota') {
        return res.json({
          valid: false,
          quotaExceeded: true,
          message: "Your OpenAI API key quota has been exceeded. Please update your OpenAI account or use a different API key."
        });
      }
      
      return res.json({ 
        valid: false, 
        message: "Error verifying OpenAI API key: " + (error.message || "Unknown error")
      });
    }
  }));

  const httpServer = createServer(app);
  return httpServer;
}
