import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Sistema de Habilidades
export const skills = pgTable("skills", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  subcategory: text("subcategory"),
  maxLevel: integer("max_level").notNull().default(100),
  tier: integer("tier").notNull().default(1),
  baseCost: integer("base_cost").notNull().default(0),
  prerequisites: text("prerequisites").default("[]"), // JSON array of skill IDs
  unlocks: text("unlocks").default("[]"), // JSON array of unlock descriptions
  position: text("position").notNull(), // JSON {x, y}
  connections: text("connections").default("[]"), // JSON array of connected skill IDs
});

export const playerSkills = pgTable("player_skills", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  skillId: text("skill_id").notNull(),
  currentLevel: integer("current_level").notNull().default(0),
  currentExperience: integer("current_experience").notNull().default(0),
  isUnlocked: boolean("is_unlocked").notNull().default(false),
});

export const playerResources = pgTable("player_resources", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  famePoints: integer("fame_points").notNull().default(0),
  silver: integer("silver").notNull().default(0),
});

export const insertSkillSchema = createInsertSchema(skills);
export const insertPlayerSkillSchema = createInsertSchema(playerSkills);
export const insertPlayerResourcesSchema = createInsertSchema(playerResources);

export type Skill = typeof skills.$inferSelect;
export type PlayerSkill = typeof playerSkills.$inferSelect;
export type PlayerResources = typeof playerResources.$inferSelect;
export type InsertSkill = z.infer<typeof insertSkillSchema>;
export type InsertPlayerSkill = z.infer<typeof insertPlayerSkillSchema>;
export type InsertPlayerResources = z.infer<typeof insertPlayerResourcesSchema>;
