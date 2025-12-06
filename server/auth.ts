
import bcrypt from "bcrypt";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

const SALT_ROUNDS = 10;

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export async function registerUser(data: RegisterData) {
  // Check if user already exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, data.email.toLowerCase()),
  });

  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

  // Create user
  const [newUser] = await db.insert(users).values({
    email: data.email.toLowerCase(),
    password: hashedPassword,
    firstName: data.firstName,
    lastName: data.lastName || null,
  }).returning();

  return newUser;
}

export async function loginUser(data: LoginData) {
  // Find user by email
  const user = await db.query.users.findFirst({
    where: eq(users.email, data.email.toLowerCase()),
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  if (!user.password) {
    throw new Error("Invalid email or password");
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(data.password, user.password);

  if (!isValidPassword) {
    throw new Error("Invalid email or password");
  }

  return user;
}

export async function getUserById(userId: string) {
  return db.query.users.findFirst({
    where: eq(users.id, userId),
  });
}
