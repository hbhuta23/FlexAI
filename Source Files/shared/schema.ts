import { pgTable, text, serial, integer, boolean, jsonb, timestamp, date, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("firstName").notNull(),
  email: text("email"),
  profileImage: text("profileImage"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  firstName: true,
  email: true,
  profileImage: true,
});

// User preferences model
export const userPreferences = pgTable("userPreferences", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id),
  goals: text("goals").array().notNull(),
  experienceLevel: text("experienceLevel").notNull(),
  availableEquipment: text("availableEquipment").notNull(),
  workoutDuration: integer("workoutDuration"),
  daysPerWeek: integer("daysPerWeek"),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id],
  }),
}));

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).pick({
  userId: true,
  goals: true,
  experienceLevel: true,
  availableEquipment: true,
  workoutDuration: true,
  daysPerWeek: true,
});

// Workout model
export const workouts = pgTable("workouts", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  duration: integer("duration"),
  level: text("level"),
  type: text("type"),
  imageUrl: text("imageUrl"),
  exercises: jsonb("exercises").notNull(),
  aiGenerated: boolean("aiGenerated").default(true),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const workoutsRelations = relations(workouts, ({ one, many }) => ({
  user: one(users, {
    fields: [workouts.userId],
    references: [users.id],
  }),
  logs: many(workoutLogs),
}));

export const insertWorkoutSchema = createInsertSchema(workouts).pick({
  userId: true,
  title: true,
  description: true,
  duration: true,
  level: true,
  type: true,
  imageUrl: true,
  exercises: true,
  aiGenerated: true,
});

// Workout logs model
export const workoutLogs = pgTable("workoutLogs", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id),
  workoutId: integer("workoutId").notNull().references(() => workouts.id),
  completed: boolean("completed").default(false),
  startedAt: timestamp("startedAt").defaultNow(),
  completedAt: timestamp("completedAt"),
  feedback: text("feedback"),
  rating: integer("rating"),
  caloriesBurned: integer("caloriesBurned"),
});

export const workoutLogsRelations = relations(workoutLogs, ({ one }) => ({
  user: one(users, {
    fields: [workoutLogs.userId],
    references: [users.id],
  }),
  workout: one(workouts, {
    fields: [workoutLogs.workoutId],
    references: [workouts.id],
  }),
}));

export const insertWorkoutLogSchema = createInsertSchema(workoutLogs).pick({
  userId: true,
  workoutId: true,
  completed: true,
  startedAt: true,
  completedAt: true,
  feedback: true,
  rating: true,
  caloriesBurned: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;

export type Workout = typeof workouts.$inferSelect;
export type InsertWorkout = z.infer<typeof insertWorkoutSchema>;

export type WorkoutLog = typeof workoutLogs.$inferSelect;
export type InsertWorkoutLog = z.infer<typeof insertWorkoutLogSchema>;

// Goal options
export const fitnessGoals = [
  "Build Muscle",
  "Lose Weight",
  "Improve Endurance",
  "Increase Flexibility",
  "Improve Strength",
  "Stress Relief",
  "Better Posture",
  "Rehabilitation"
];

// Experience levels
export const experienceLevels = [
  "Beginner",
  "Intermediate",
  "Advanced"
];

// Equipment options
export const equipmentOptions = [
  "No Equipment (Bodyweight only)",
  "Basic Equipment (Dumbbells, Resistance Bands)",
  "Full Gym Access"
];

// Nutrition Plans model
export const nutritionPlans = pgTable("nutritionPlans", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  calorieTarget: integer("calorieTarget"),
  proteinTarget: integer("proteinTarget"),
  carbTarget: integer("carbTarget"),
  fatTarget: integer("fatTarget"),
  recommendations: jsonb("recommendations").notNull(),
  aiGenerated: boolean("aiGenerated").default(true),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const nutritionPlansRelations = relations(nutritionPlans, ({ one, many }) => ({
  user: one(users, {
    fields: [nutritionPlans.userId],
    references: [users.id],
  }),
  mealEntries: many(mealEntries),
}));

export const insertNutritionPlanSchema = createInsertSchema(nutritionPlans).pick({
  userId: true,
  title: true,
  description: true,
  calorieTarget: true,
  proteinTarget: true,
  carbTarget: true,
  fatTarget: true,
  recommendations: true,
  aiGenerated: true,
});

// Meal Entries model
export const mealEntries = pgTable("mealEntries", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id),
  planId: integer("planId").references(() => nutritionPlans.id),
  mealType: text("mealType").notNull(), // Breakfast, Lunch, Dinner, Snack
  name: text("name").notNull(),
  calories: integer("calories"),
  protein: decimal("protein", { precision: 5, scale: 1 }),
  carbs: decimal("carbs", { precision: 5, scale: 1 }),
  fat: decimal("fat", { precision: 5, scale: 1 }),
  foodItems: jsonb("foodItems"),
  imageUrl: text("imageUrl"),
  entryDate: date("entryDate").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const mealEntriesRelations = relations(mealEntries, ({ one }) => ({
  user: one(users, {
    fields: [mealEntries.userId],
    references: [users.id],
  }),
  plan: one(nutritionPlans, {
    fields: [mealEntries.planId],
    references: [nutritionPlans.id],
  }),
}));

export const insertMealEntrySchema = createInsertSchema(mealEntries).pick({
  userId: true,
  planId: true,
  mealType: true,
  name: true,
  calories: true,
  protein: true,
  carbs: true,
  fat: true,
  foodItems: true,
  imageUrl: true,
  entryDate: true,
});

// Nutrition types
export type NutritionPlan = typeof nutritionPlans.$inferSelect;
export type InsertNutritionPlan = z.infer<typeof insertNutritionPlanSchema>;

export type MealEntry = typeof mealEntries.$inferSelect;
export type InsertMealEntry = z.infer<typeof insertMealEntrySchema>;

// Meal types
export const mealTypes = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Snack"
];

// Diet types
export const dietTypes = [
  "Regular",
  "Vegetarian",
  "Vegan",
  "Keto",
  "Paleo",
  "Mediterranean",
  "Low-Carb",
  "Low-Fat"
];

// Now add the user relations after all table definitions
export const usersRelations = relations(users, ({ one, many }) => ({
  preferences: one(userPreferences, {
    fields: [users.id],
    references: [userPreferences.userId],
  }),
  workouts: many(workouts),
  workoutLogs: many(workoutLogs),
  nutritionPlans: many(nutritionPlans),
  mealEntries: many(mealEntries),
}));
