import { 
  User, InsertUser, 
  UserPreferences, InsertUserPreferences, 
  Workout, InsertWorkout, 
  WorkoutLog, InsertWorkoutLog,
  NutritionPlan, InsertNutritionPlan,
  MealEntry, InsertMealEntry,
  users,
  userPreferences,
  workouts,
  workoutLogs,
  nutritionPlans,
  mealEntries
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // User Preferences methods
  getUserPreferences(userId: number): Promise<UserPreferences | undefined>;
  createUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences>;
  updateUserPreferences(id: number, preferences: Partial<InsertUserPreferences>): Promise<UserPreferences | undefined>;
  
  // Workout methods
  getWorkout(id: number): Promise<Workout | undefined>;
  getWorkoutsByUserId(userId: number): Promise<Workout[]>;
  createWorkout(workout: InsertWorkout): Promise<Workout>;
  updateWorkout(id: number, workout: Partial<InsertWorkout>): Promise<Workout | undefined>;
  
  // Workout Log methods
  getWorkoutLog(id: number): Promise<WorkoutLog | undefined>;
  getWorkoutLogsByUserId(userId: number): Promise<WorkoutLog[]>;
  getWorkoutLogsByWorkoutId(workoutId: number): Promise<WorkoutLog[]>;
  createWorkoutLog(log: InsertWorkoutLog): Promise<WorkoutLog>;
  updateWorkoutLog(id: number, log: Partial<InsertWorkoutLog>): Promise<WorkoutLog | undefined>;
  
  // Nutrition Plan methods
  getNutritionPlan(id: number): Promise<NutritionPlan | undefined>;
  getNutritionPlansByUserId(userId: number): Promise<NutritionPlan[]>;
  createNutritionPlan(plan: InsertNutritionPlan): Promise<NutritionPlan>;
  updateNutritionPlan(id: number, plan: Partial<InsertNutritionPlan>): Promise<NutritionPlan | undefined>;
  
  // Meal Entry methods
  getMealEntry(id: number): Promise<MealEntry | undefined>;
  getMealEntriesByUserId(userId: number): Promise<MealEntry[]>;
  getMealEntriesByPlanId(planId: number): Promise<MealEntry[]>;
  getMealEntriesByDate(userId: number, date: Date): Promise<MealEntry[]>;
  createMealEntry(entry: InsertMealEntry): Promise<MealEntry>;
  updateMealEntry(id: number, entry: Partial<InsertMealEntry>): Promise<MealEntry | undefined>;
  deleteMealEntry(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result.length > 0 ? result[0] : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // User Preferences methods
  async getUserPreferences(userId: number): Promise<UserPreferences | undefined> {
    const result = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId));
    return result.length > 0 ? result[0] : undefined;
  }

  async createUserPreferences(insertPreferences: InsertUserPreferences): Promise<UserPreferences> {
    const result = await db.insert(userPreferences).values(insertPreferences).returning();
    return result[0];
  }

  async updateUserPreferences(id: number, updateData: Partial<InsertUserPreferences>): Promise<UserPreferences | undefined> {
    const result = await db
      .update(userPreferences)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(userPreferences.id, id))
      .returning();
    
    return result.length > 0 ? result[0] : undefined;
  }

  // Workout methods
  async getWorkout(id: number): Promise<Workout | undefined> {
    const result = await db.select().from(workouts).where(eq(workouts.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async getWorkoutsByUserId(userId: number): Promise<Workout[]> {
    return await db.select().from(workouts).where(eq(workouts.userId, userId));
  }

  async createWorkout(insertWorkout: InsertWorkout): Promise<Workout> {
    const result = await db.insert(workouts).values(insertWorkout).returning();
    return result[0];
  }

  async updateWorkout(id: number, updateData: Partial<InsertWorkout>): Promise<Workout | undefined> {
    const result = await db
      .update(workouts)
      .set(updateData)
      .where(eq(workouts.id, id))
      .returning();
    
    return result.length > 0 ? result[0] : undefined;
  }

  // Workout Log methods
  async getWorkoutLog(id: number): Promise<WorkoutLog | undefined> {
    const result = await db.select().from(workoutLogs).where(eq(workoutLogs.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async getWorkoutLogsByUserId(userId: number): Promise<WorkoutLog[]> {
    return await db.select().from(workoutLogs).where(eq(workoutLogs.userId, userId));
  }

  async getWorkoutLogsByWorkoutId(workoutId: number): Promise<WorkoutLog[]> {
    return await db.select().from(workoutLogs).where(eq(workoutLogs.workoutId, workoutId));
  }

  async createWorkoutLog(insertLog: InsertWorkoutLog): Promise<WorkoutLog> {
    const result = await db.insert(workoutLogs).values(insertLog).returning();
    return result[0];
  }

  async updateWorkoutLog(id: number, updateData: Partial<InsertWorkoutLog>): Promise<WorkoutLog | undefined> {
    const result = await db
      .update(workoutLogs)
      .set(updateData)
      .where(eq(workoutLogs.id, id))
      .returning();
    
    return result.length > 0 ? result[0] : undefined;
  }

  // Nutrition Plan methods
  async getNutritionPlan(id: number): Promise<NutritionPlan | undefined> {
    const result = await db.select().from(nutritionPlans).where(eq(nutritionPlans.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async getNutritionPlansByUserId(userId: number): Promise<NutritionPlan[]> {
    return await db
      .select()
      .from(nutritionPlans)
      .where(eq(nutritionPlans.userId, userId))
      .orderBy(desc(nutritionPlans.createdAt));
  }

  async createNutritionPlan(insertPlan: InsertNutritionPlan): Promise<NutritionPlan> {
    const result = await db.insert(nutritionPlans).values(insertPlan).returning();
    return result[0];
  }

  async updateNutritionPlan(id: number, updateData: Partial<InsertNutritionPlan>): Promise<NutritionPlan | undefined> {
    const result = await db
      .update(nutritionPlans)
      .set(updateData)
      .where(eq(nutritionPlans.id, id))
      .returning();
    
    return result.length > 0 ? result[0] : undefined;
  }

  // Meal Entry methods
  async getMealEntry(id: number): Promise<MealEntry | undefined> {
    const result = await db.select().from(mealEntries).where(eq(mealEntries.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async getMealEntriesByUserId(userId: number): Promise<MealEntry[]> {
    return await db
      .select()
      .from(mealEntries)
      .where(eq(mealEntries.userId, userId))
      .orderBy(desc(mealEntries.entryDate), desc(mealEntries.createdAt));
  }

  async getMealEntriesByPlanId(planId: number): Promise<MealEntry[]> {
    return await db
      .select()
      .from(mealEntries)
      .where(eq(mealEntries.planId, planId))
      .orderBy(desc(mealEntries.entryDate), desc(mealEntries.createdAt));
  }

  async getMealEntriesByDate(userId: number, date: Date): Promise<MealEntry[]> {
    // Convert date to ISO string and extract the date part only
    const dateStr = date.toISOString().split('T')[0];
    
    return await db
      .select()
      .from(mealEntries)
      .where(
        and(
          eq(mealEntries.userId, userId),
          eq(mealEntries.entryDate, dateStr)
        )
      )
      .orderBy(desc(mealEntries.createdAt));
  }

  async createMealEntry(insertEntry: InsertMealEntry): Promise<MealEntry> {
    const result = await db.insert(mealEntries).values(insertEntry).returning();
    return result[0];
  }

  async updateMealEntry(id: number, updateData: Partial<InsertMealEntry>): Promise<MealEntry | undefined> {
    const result = await db
      .update(mealEntries)
      .set(updateData)
      .where(eq(mealEntries.id, id))
      .returning();
    
    return result.length > 0 ? result[0] : undefined;
  }

  async deleteMealEntry(id: number): Promise<boolean> {
    const result = await db
      .delete(mealEntries)
      .where(eq(mealEntries.id, id))
      .returning();
    
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
