import { 
  books, 
  recommenders, 
  recommendations, 
  type Book, 
  type InsertBook, 
  type Recommender, 
  type InsertRecommender,
  type Recommendation,
  type InsertRecommendation,
  type CompleteRecommendation,
  type CombinedInsert,
  type BookRecommendationCSV
} from "@shared/schema";
import { eq, sql, or } from "drizzle-orm";
import { db } from "./db";

// Storage interface
export interface IStorage {
  // Book operations
  getAllBooks(): Promise<Book[]>;
  getBookById(id: number): Promise<Book | undefined>;
  getBookByTitle(title: string): Promise<Book | undefined>;
  createBook(book: InsertBook): Promise<Book>;
  searchBooks(query: string): Promise<Book[]>;
  
  // Recommender operations
  getAllRecommenders(): Promise<Recommender[]>;
  getRecommenderById(id: number): Promise<Recommender | undefined>;
  getRecommenderByName(name: string): Promise<Recommender | undefined>;
  createRecommender(recommender: InsertRecommender): Promise<Recommender>;
  searchRecommenders(query: string): Promise<Recommender[]>;
  
  // Recommendation operations
  getAllRecommendations(): Promise<Recommendation[]>;
  getRecommendationById(id: number): Promise<Recommendation | undefined>;
  createRecommendation(recommendation: InsertRecommendation): Promise<Recommendation>;
  
  // Combined operations
  getBooksByRecommenderId(recommenderId: number): Promise<Book[]>;
  getRecommendersByBookId(bookId: number): Promise<Recommender[]>;
  getCompleteRecommendationsByBookId(bookId: number): Promise<CompleteRecommendation[]>;
  getCompleteRecommendationsByRecommenderId(recommenderId: number): Promise<CompleteRecommendation[]>;

  // Create a complete book recommendation in one step
  createCompleteRecommendation(data: CombinedInsert): Promise<CompleteRecommendation>;
  
  // Import from CSV
  importFromCSV(items: BookRecommendationCSV[]): Promise<void>;
}

export class MemStorage implements IStorage {
  private booksMap: Map<number, Book>;
  private recommendersMap: Map<number, Recommender>;
  private recommendationsMap: Map<number, Recommendation>;
  private bookIdCounter: number;
  private recommenderIdCounter: number;
  private recommendationIdCounter: number;

  constructor() {
    this.booksMap = new Map();
    this.recommendersMap = new Map();
    this.recommendationsMap = new Map();
    this.bookIdCounter = 1;
    this.recommenderIdCounter = 1;
    this.recommendationIdCounter = 1;
  }

  // Book operations
  async getAllBooks(): Promise<Book[]> {
    return Array.from(this.booksMap.values());
  }

  async getBookById(id: number): Promise<Book | undefined> {
    return this.booksMap.get(id);
  }

  async getBookByTitle(title: string): Promise<Book | undefined> {
    return Array.from(this.booksMap.values()).find(
      (book) => book.title.toLowerCase() === title.toLowerCase()
    );
  }

  async createBook(book: InsertBook): Promise<Book> {
    const id = this.bookIdCounter++;
    const newBook: Book = { ...book, id };
    this.booksMap.set(id, newBook);
    return newBook;
  }

  async searchBooks(query: string): Promise<Book[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.booksMap.values()).filter(
      (book) => 
        book.title.toLowerCase().includes(lowerQuery) ||
        book.author.toLowerCase().includes(lowerQuery)
    );
  }

  // Recommender operations
  async getAllRecommenders(): Promise<Recommender[]> {
    return Array.from(this.recommendersMap.values());
  }

  async getRecommenderById(id: number): Promise<Recommender | undefined> {
    return this.recommendersMap.get(id);
  }

  async getRecommenderByName(name: string): Promise<Recommender | undefined> {
    return Array.from(this.recommendersMap.values()).find(
      (recommender) => recommender.name.toLowerCase() === name.toLowerCase()
    );
  }

  async createRecommender(recommender: InsertRecommender): Promise<Recommender> {
    const id = this.recommenderIdCounter++;
    const newRecommender: Recommender = { ...recommender, id };
    this.recommendersMap.set(id, newRecommender);
    return newRecommender;
  }

  async searchRecommenders(query: string): Promise<Recommender[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.recommendersMap.values()).filter(
      (recommender) => 
        recommender.name.toLowerCase().includes(lowerQuery) ||
        (recommender.organization && recommender.organization.toLowerCase().includes(lowerQuery))
    );
  }

  // Recommendation operations
  async getAllRecommendations(): Promise<Recommendation[]> {
    return Array.from(this.recommendationsMap.values());
  }

  async getRecommendationById(id: number): Promise<Recommendation | undefined> {
    return this.recommendationsMap.get(id);
  }

  async createRecommendation(recommendation: InsertRecommendation): Promise<Recommendation> {
    const id = this.recommendationIdCounter++;
    const newRecommendation: Recommendation = { ...recommendation, id };
    this.recommendationsMap.set(id, newRecommendation);
    return newRecommendation;
  }

  // Combined operations
  async getBooksByRecommenderId(recommenderId: number): Promise<Book[]> {
    const bookIds = Array.from(this.recommendationsMap.values())
      .filter(rec => rec.recommenderId === recommenderId)
      .map(rec => rec.bookId);
    
    return Array.from(this.booksMap.values())
      .filter(book => bookIds.includes(book.id));
  }

  async getRecommendersByBookId(bookId: number): Promise<Recommender[]> {
    const recommenderIds = Array.from(this.recommendationsMap.values())
      .filter(rec => rec.bookId === bookId)
      .map(rec => rec.recommenderId);
    
    return Array.from(this.recommendersMap.values())
      .filter(recommender => recommenderIds.includes(recommender.id));
  }

  async getCompleteRecommendationsByBookId(bookId: number): Promise<CompleteRecommendation[]> {
    const recommendations = Array.from(this.recommendationsMap.values())
      .filter(rec => rec.bookId === bookId);
    
    return Promise.all(recommendations.map(async rec => {
      const book = await this.getBookById(rec.bookId);
      const recommender = await this.getRecommenderById(rec.recommenderId);
      
      if (!book || !recommender) {
        throw new Error(`Missing book or recommender for recommendation ${rec.id}`);
      }
      
      return {
        ...rec,
        book,
        recommender
      };
    }));
  }

  async getCompleteRecommendationsByRecommenderId(recommenderId: number): Promise<CompleteRecommendation[]> {
    const recommendations = Array.from(this.recommendationsMap.values())
      .filter(rec => rec.recommenderId === recommenderId);
    
    return Promise.all(recommendations.map(async rec => {
      const book = await this.getBookById(rec.bookId);
      const recommender = await this.getRecommenderById(rec.recommenderId);
      
      if (!book || !recommender) {
        throw new Error(`Missing book or recommender for recommendation ${rec.id}`);
      }
      
      return {
        ...rec,
        book,
        recommender
      };
    }));
  }

  // Create a complete book recommendation in one step
  async createCompleteRecommendation(data: CombinedInsert): Promise<CompleteRecommendation> {
    // Check if book already exists
    let book = await this.getBookByTitle(data.title);
    if (!book) {
      // Create new book
      book = await this.createBook({
        title: data.title,
        author: data.author,
        category: data.category
      });
    }

    // Check if recommender already exists
    let recommender = await this.getRecommenderByName(data.recommenderName);
    if (!recommender) {
      // Create new recommender
      recommender = await this.createRecommender({
        name: data.recommenderName,
        organization: data.recommenderOrg,
        industry: data.industry
      });
    }

    // Create the recommendation
    const recommendation = await this.createRecommendation({
      bookId: book.id,
      recommenderId: recommender.id,
      comment: data.comment,
      recommendationDate: data.recommendationDate,
      recommendationMedium: data.recommendationMedium,
      reason: data.reason
    });

    // Return complete recommendation
    return {
      ...recommendation,
      book,
      recommender
    };
  }

  // Import from CSV
  async importFromCSV(items: BookRecommendationCSV[]): Promise<void> {
    for (const item of items) {
      try {
        await this.createCompleteRecommendation({
          title: item.title,
          author: item.author,
          category: item.category,
          recommenderName: item.recommenderName,
          recommenderOrg: item.recommenderOrg,
          industry: undefined, // CSV doesn't have this field
          comment: item.comment,
          recommendationDate: item.recommendationDate.split(" ")[0], // Extract year
          recommendationMedium: item.recommendationDate.split(" ")[1], // Extract medium
          reason: item.reason
        });
      } catch (error) {
        console.error(`Error importing item: ${JSON.stringify(item)}`, error);
      }
    }
  }
}

export class DatabaseStorage implements IStorage {
  // Book operations
  async getAllBooks(): Promise<Book[]> {
    const result = await db.select().from(books);
    return result;
  }

  async getBookById(id: number): Promise<Book | undefined> {
    const [book] = await db.select().from(books).where(eq(books.id, id));
    return book;
  }

  async getBookByTitle(title: string): Promise<Book | undefined> {
    const [book] = await db
      .select()
      .from(books)
      .where(sql`LOWER(${books.title}) = LOWER(${title})`);
    return book;
  }

  async createBook(book: InsertBook): Promise<Book> {
    // nullに変換して型の整合性を保つ
    const processedBook = {
      title: book.title,
      author: book.author,
      category: book.category || null,
      imageUrl: book.imageUrl || null,
      publishYear: book.publishYear || null,
      description: book.description || null
    };
    
    const [newBook] = await db.insert(books).values(processedBook).returning();
    return newBook;
  }

  async searchBooks(query: string): Promise<Book[]> {
    return db
      .select()
      .from(books)
      .where(
        or(
          sql`${books.title} ILIKE ${`%${query}%`}`,
          sql`${books.author} ILIKE ${`%${query}%`}`
        )
      );
  }

  // Recommender operations
  async getAllRecommenders(): Promise<Recommender[]> {
    return db.select().from(recommenders);
  }

  async getRecommenderById(id: number): Promise<Recommender | undefined> {
    const [recommender] = await db
      .select()
      .from(recommenders)
      .where(eq(recommenders.id, id));
    return recommender;
  }

  async getRecommenderByName(name: string): Promise<Recommender | undefined> {
    const [recommender] = await db
      .select()
      .from(recommenders)
      .where(sql`LOWER(${recommenders.name}) = LOWER(${name})`);
    return recommender;
  }

  async createRecommender(recommender: InsertRecommender): Promise<Recommender> {
    // nullに変換して型の整合性を保つ
    const processedRecommender = {
      name: recommender.name,
      organization: recommender.organization || null,
      industry: recommender.industry || null
    };
    
    const [newRecommender] = await db
      .insert(recommenders)
      .values(processedRecommender)
      .returning();
    return newRecommender;
  }

  async searchRecommenders(query: string): Promise<Recommender[]> {
    return db
      .select()
      .from(recommenders)
      .where(
        or(
          sql`${recommenders.name} ILIKE ${`%${query}%`}`,
          sql`${recommenders.organization} ILIKE ${`%${query}%`}`
        )
      );
  }

  // Recommendation operations
  async getAllRecommendations(): Promise<Recommendation[]> {
    return db.select().from(recommendations);
  }

  async getRecommendationById(id: number): Promise<Recommendation | undefined> {
    const [recommendation] = await db
      .select()
      .from(recommendations)
      .where(eq(recommendations.id, id));
    return recommendation;
  }

  async createRecommendation(recommendation: InsertRecommendation): Promise<Recommendation> {
    // nullに変換して型の整合性を保つ
    const processedRecommendation = {
      bookId: recommendation.bookId,
      recommenderId: recommendation.recommenderId,
      comment: recommendation.comment || null,
      recommendationDate: recommendation.recommendationDate || null,
      recommendationMedium: recommendation.recommendationMedium || null,
      source: recommendation.source || null,
      sourceUrl: recommendation.sourceUrl || null,
      reason: recommendation.reason || null
    };
    
    const [newRecommendation] = await db
      .insert(recommendations)
      .values(processedRecommendation)
      .returning();
    return newRecommendation;
  }

  // Combined operations
  async getBooksByRecommenderId(recommenderId: number): Promise<Book[]> {
    // Use JOIN to get books by recommender ID
    const result = await db
      .select({
        book: books
      })
      .from(recommendations)
      .innerJoin(books, eq(recommendations.bookId, books.id))
      .where(eq(recommendations.recommenderId, recommenderId));
    
    return result.map(r => r.book);
  }

  async getRecommendersByBookId(bookId: number): Promise<Recommender[]> {
    // Use JOIN to get recommenders by book ID
    const result = await db
      .select({
        recommender: recommenders
      })
      .from(recommendations)
      .innerJoin(recommenders, eq(recommendations.recommenderId, recommenders.id))
      .where(eq(recommendations.bookId, bookId));
    
    return result.map(r => r.recommender);
  }

  async getCompleteRecommendationsByBookId(bookId: number): Promise<CompleteRecommendation[]> {
    // Use multiple JOINs to get complete recommendations
    const result = await db
      .select({
        id: recommendations.id,
        bookId: recommendations.bookId,
        recommenderId: recommendations.recommenderId,
        comment: recommendations.comment,
        recommendationDate: recommendations.recommendationDate,
        recommendationMedium: recommendations.recommendationMedium,
        reason: recommendations.reason,
        book: books,
        recommender: recommenders
      })
      .from(recommendations)
      .innerJoin(books, eq(recommendations.bookId, books.id))
      .innerJoin(recommenders, eq(recommendations.recommenderId, recommenders.id))
      .where(eq(recommendations.bookId, bookId));
    
    // フィルタリング: recommenderId ごとにユニークな推薦を保持する
    const uniqueRecommendations: CompleteRecommendation[] = [];
    const seenRecommenderIds = new Set<number>();
    
    for (const rec of result as CompleteRecommendation[]) {
      if (!seenRecommenderIds.has(rec.recommenderId)) {
        seenRecommenderIds.add(rec.recommenderId);
        uniqueRecommendations.push(rec);
      }
    }
    
    return uniqueRecommendations;
  }

  async getCompleteRecommendationsByRecommenderId(recommenderId: number): Promise<CompleteRecommendation[]> {
    // Use multiple JOINs to get complete recommendations
    const result = await db
      .select({
        id: recommendations.id,
        bookId: recommendations.bookId,
        recommenderId: recommendations.recommenderId,
        comment: recommendations.comment,
        recommendationDate: recommendations.recommendationDate,
        recommendationMedium: recommendations.recommendationMedium,
        reason: recommendations.reason,
        book: books,
        recommender: recommenders
      })
      .from(recommendations)
      .innerJoin(books, eq(recommendations.bookId, books.id))
      .innerJoin(recommenders, eq(recommendations.recommenderId, recommenders.id))
      .where(eq(recommendations.recommenderId, recommenderId));
    
    // フィルタリング: bookId ごとにユニークな推薦を保持する
    const uniqueRecommendations: CompleteRecommendation[] = [];
    const seenBookIds = new Set<number>();
    
    for (const rec of result as CompleteRecommendation[]) {
      if (!seenBookIds.has(rec.bookId)) {
        seenBookIds.add(rec.bookId);
        uniqueRecommendations.push(rec);
      }
    }
    
    return uniqueRecommendations;
  }

  // Create a complete book recommendation in one step
  async createCompleteRecommendation(data: CombinedInsert): Promise<CompleteRecommendation> {
    // Use a transaction to ensure atomicity
    return await db.transaction(async (tx) => {
      // Check if book already exists or create a new one
      let book = await this.getBookByTitle(data.title);
      if (!book) {
        const [newBook] = await tx
          .insert(books)
          .values({
            title: data.title,
            author: data.author,
            category: data.category || null,
            imageUrl: data.imageUrl || null,
            publishYear: data.publishYear || null,
            description: data.description || null
          })
          .returning();
        book = newBook;
      } else if (data.imageUrl && !book.imageUrl) {
        // 画像が追加された場合、既存の本の情報を更新
        const [updatedBook] = await tx
          .update(books)
          .set({ 
            imageUrl: data.imageUrl,
            publishYear: data.publishYear || book.publishYear,
            description: data.description || book.description
          })
          .where(eq(books.id, book.id))
          .returning();
        book = updatedBook;
      }

      // Check if recommender already exists or create a new one
      let recommender = await this.getRecommenderByName(data.recommenderName);
      if (!recommender) {
        const [newRecommender] = await tx
          .insert(recommenders)
          .values({
            name: data.recommenderName,
            organization: data.recommenderOrg || null,
            industry: data.industry || null
          })
          .returning();
        recommender = newRecommender;
      }

      // Create the recommendation
      const [recommendation] = await tx
        .insert(recommendations)
        .values({
          bookId: book.id,
          recommenderId: recommender.id,
          comment: data.comment || null,
          recommendationDate: data.recommendationDate || null,
          recommendationMedium: data.recommendationMedium || null,
          source: data.source || null,
          sourceUrl: data.sourceUrl || null,
          reason: data.reason || null
        })
        .returning();

      // Return complete recommendation
      return {
        ...recommendation,
        book,
        recommender
      };
    });
  }

  // Import from CSV
  async importFromCSV(items: BookRecommendationCSV[]): Promise<void> {
    for (const item of items) {
      try {
        await this.createCompleteRecommendation({
          title: item.title,
          author: item.author,
          category: item.category,
          imageUrl: item.imageUrl,
          publishYear: item.publishYear,
          description: item.description,
          recommenderName: item.recommenderName,
          recommenderOrg: item.recommenderOrg,
          industry: undefined, // CSVに含まれていない場合は別途設定
          comment: item.comment,
          recommendationDate: item.recommendationDate ? 
            item.recommendationDate.split(" ")[0] : undefined, // Extract year
          recommendationMedium: item.recommendationDate ? 
            item.recommendationDate.split(" ").slice(1).join(" ") : undefined, // Extract medium
          source: item.source,
          sourceUrl: item.sourceUrl,
          reason: item.reason
        });
      } catch (error) {
        console.error(`Error importing item: ${JSON.stringify(item)}`, error);
      }
    }
  }
}

// Replace MemStorage with DatabaseStorage
// export const storage = new MemStorage();
export const storage = new DatabaseStorage();
