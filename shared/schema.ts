import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Books table
export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  category: text("category"),
  imageUrl: text("image_url"), // 書籍のサムネイル画像URL
  publishYear: text("publish_year"), // 出版年
  description: text("description"), // 書籍の説明
});

// Book relations
export const booksRelations = relations(books, ({ many }) => ({
  recommendations: many(recommendations),
}));

// Book categories (to help with filtering)
export type BookCategory = 
  | "ビジネス" 
  | "社会科学" 
  | "歴史" 
  | "SF" 
  | "科学" 
  | "小説" 
  | "投資" 
  | "経営" 
  | "自己啓発" 
  | "哲学";

// Recommenders table
export const recommenders = pgTable("recommenders", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  organization: text("organization"),
  industry: text("industry"),
  imageUrl: text("image_url"), // 推薦者のプロフィール画像URL
});

// Recommender relations
export const recommendersRelations = relations(recommenders, ({ many }) => ({
  recommendations: many(recommendations),
}));

// Recommendations table (many-to-many relationship)
export const recommendations = pgTable("recommendations", {
  id: serial("id").primaryKey(),
  bookId: integer("book_id").notNull().references(() => books.id),
  recommenderId: integer("recommender_id").notNull().references(() => recommenders.id),
  comment: text("comment"),
  recommendationDate: text("recommendation_date"),
  recommendationMedium: text("recommendation_medium"),
  source: text("source"), // 推薦の出所情報（イベント、インタビュー、記事など）
  sourceUrl: text("source_url"), // 出所のURL
  reason: text("reason"),
});

// Recommendation relations
export const recommendationsRelations = relations(recommendations, ({ one }) => ({
  book: one(books, {
    fields: [recommendations.bookId],
    references: [books.id],
  }),
  recommender: one(recommenders, {
    fields: [recommendations.recommenderId],
    references: [recommenders.id],
  }),
}));

// Insert schemas
export const insertBookSchema = createInsertSchema(books).pick({
  title: true,
  author: true,
  category: true,
  imageUrl: true,
  publishYear: true,
  description: true,
});

export const insertRecommenderSchema = createInsertSchema(recommenders).pick({
  name: true,
  organization: true,
  industry: true,
  imageUrl: true,
});

export const insertRecommendationSchema = createInsertSchema(recommendations).pick({
  bookId: true,
  recommenderId: true,
  comment: true,
  recommendationDate: true,
  recommendationMedium: true,
  source: true,
  sourceUrl: true,
  reason: true,
});

// Combined schema for single-action insert with front-end form
export const combinedInsertSchema = z.object({
  title: z.string().min(1, { message: "書籍タイトルは必須です" }),
  author: z.string().min(1, { message: "著者名は必須です" }),
  category: z.string().optional(),
  imageUrl: z.string().optional(),
  publishYear: z.string().optional(),
  description: z.string().optional(),
  recommenderName: z.string().min(1, { message: "推薦者名は必須です" }),
  recommenderOrg: z.string().optional(),
  industry: z.string().optional(),
  comment: z.string().optional(),
  recommendationDate: z.string().optional(),
  recommendationMedium: z.string().optional(),
  source: z.string().optional(), // 推薦の出所情報
  sourceUrl: z.string().optional(), // 出所のURL
  reason: z.string().optional(),
});

// Types for our models
export type Book = typeof books.$inferSelect;
export type InsertBook = z.infer<typeof insertBookSchema>;

export type Recommender = typeof recommenders.$inferSelect;
export type InsertRecommender = z.infer<typeof insertRecommenderSchema>;

export type Recommendation = typeof recommendations.$inferSelect;
export type InsertRecommendation = z.infer<typeof insertRecommendationSchema>;

export type CombinedInsert = z.infer<typeof combinedInsertSchema>;

// Complete recommendation with book and recommender data
export type CompleteRecommendation = Recommendation & {
  book: Book;
  recommender: Recommender;
};

// CSV data type for importing
// CSV data type for importing
export type BookRecommendationCSV = {
  title: string;
  author: string;
  recommenderName: string;
  recommenderOrg: string;
  comment: string;
  recommendationDate: string;
  reason: string;
  category?: string;
  imageUrl?: string;
  publishYear?: string;
  description?: string;
  source?: string;
  sourceUrl?: string;
};

// スキーマの編集用
export const editBookSchema = z.object({
  title: z.string().min(1, { message: "タイトルは必須です" }),
  author: z.string().min(1, { message: "著者名は必須です" }),
  category: z.string().optional(),
  publishYear: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
});

export const editRecommenderSchema = z.object({
  name: z.string().min(1, { message: "名前は必須です" }),
  organization: z.string().optional(),
  industry: z.string().optional(),
  imageUrl: z.string().optional(),
});

export type EditBookFormValues = z.infer<typeof editBookSchema>;
export type EditRecommenderFormValues = z.infer<typeof editRecommenderSchema>;

export type BookRecommendationCSV = {
  title: string;
  author: string;
  recommenderName: string;
  recommenderOrg: string;
  comment: string;
  recommendationDate: string;
  reason: string;
  category?: string;
  imageUrl?: string;
  publishYear?: string;
  description?: string;
  source?: string;
  sourceUrl?: string;
};
