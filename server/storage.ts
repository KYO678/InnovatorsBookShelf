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
  updateBook(id: number, bookData: Partial<InsertBook>): Promise<Book | undefined>;
  deleteBook(id: number): Promise<boolean>;
  searchBooks(query: string): Promise<Book[]>;
  
  // Recommender operations
  getAllRecommenders(): Promise<Recommender[]>;
  getRecommenderById(id: number): Promise<Recommender | undefined>;
  getRecommenderByName(name: string): Promise<Recommender | undefined>;
  createRecommender(recommender: InsertRecommender): Promise<Recommender>;
  updateRecommender(id: number, recommenderData: Partial<InsertRecommender>): Promise<Recommender | undefined>;
  deleteRecommender(id: number): Promise<boolean>;
  searchRecommenders(query: string): Promise<Recommender[]>;
  
  // Recommendation operations
  getAllRecommendations(): Promise<Recommendation[]>;
  getRecommendationById(id: number): Promise<Recommendation | undefined>;
  createRecommendation(recommendation: InsertRecommendation): Promise<Recommendation>;
  updateRecommendation(id: number, recommendationData: Partial<InsertRecommendation>): Promise<Recommendation | undefined>;
  
  // Combined operations
  getBooksByRecommenderId(recommenderId: number): Promise<Book[]>;
  getRecommendersByBookId(bookId: number): Promise<Recommender[]>;
  getCompleteRecommendationsByBookId(bookId: number): Promise<CompleteRecommendation[]>;
  getCompleteRecommendationsByRecommenderId(recommenderId: number): Promise<CompleteRecommendation[]>;

  // Create a complete book recommendation in one step
  createCompleteRecommendation(data: CombinedInsert): Promise<CompleteRecommendation>;
  
  // Import from CSV
  importFromCSV(items: BookRecommendationCSV[]): Promise<{count: number, skipped: number, total: number}>;
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
  
  async updateBook(id: number, bookData: Partial<InsertBook>): Promise<Book | undefined> {
    const book = this.booksMap.get(id);
    if (!book) return undefined;
    
    const updatedBook: Book = {
      ...book,
      ...bookData,
      id
    };
    
    this.booksMap.set(id, updatedBook);
    return updatedBook;
  }
  
  async deleteBook(id: number): Promise<boolean> {
    // 本が存在するか確認
    if (!this.booksMap.has(id)) {
      return false;
    }
    
    // その本に関連する推薦も削除
    const relatedRecommendationIds: number[] = [];
    this.recommendationsMap.forEach((rec, recId) => {
      if (rec.bookId === id) {
        relatedRecommendationIds.push(recId);
      }
    });
    
    // 関連推薦を削除
    relatedRecommendationIds.forEach(recId => {
      this.recommendationsMap.delete(recId);
    });
    
    // 本を削除
    this.booksMap.delete(id);
    return true;
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
  
  async updateRecommender(id: number, recommenderData: Partial<InsertRecommender>): Promise<Recommender | undefined> {
    const recommender = this.recommendersMap.get(id);
    if (!recommender) return undefined;
    
    const updatedRecommender: Recommender = {
      ...recommender,
      ...recommenderData,
      id
    };
    
    this.recommendersMap.set(id, updatedRecommender);
    return updatedRecommender;
  }
  
  async deleteRecommender(id: number): Promise<boolean> {
    // 推薦者が存在するか確認
    if (!this.recommendersMap.has(id)) {
      return false;
    }
    
    // その推薦者に関連する推薦も削除
    const relatedRecommendationIds: number[] = [];
    this.recommendationsMap.forEach((rec, recId) => {
      if (rec.recommenderId === id) {
        relatedRecommendationIds.push(recId);
      }
    });
    
    // 関連推薦を削除
    relatedRecommendationIds.forEach(recId => {
      this.recommendationsMap.delete(recId);
    });
    
    // 推薦者を削除
    this.recommendersMap.delete(id);
    return true;
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
  
  async updateRecommendation(id: number, recommendationData: Partial<InsertRecommendation>): Promise<Recommendation | undefined> {
    const recommendation = this.recommendationsMap.get(id);
    if (!recommendation) return undefined;
    
    const updatedRecommendation: Recommendation = {
      ...recommendation,
      ...recommendationData,
      id
    };
    
    this.recommendationsMap.set(id, updatedRecommendation);
    return updatedRecommendation;
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
  async importFromCSV(items: BookRecommendationCSV[]): Promise<{count: number, skipped: number, total: number}> {
    let successCount = 0;
    let skippedCount = 0;
    const processedBooks = new Set<string>();
    
    // まず全ての推薦者を取得して、既存の推薦者のマップを作成
    const allRecommenders = await this.getAllRecommenders();
    const recommenderMap = new Map<string, Recommender>();
    allRecommenders.forEach(recommender => {
      recommenderMap.set(recommender.name.toLowerCase(), recommender);
    });
    
    for (const item of items) {
      try {
        // Create a unique key for this book+recommender combination to prevent duplicates
        const uniqueKey = `${item.title.toLowerCase()}_${item.recommenderName.toLowerCase()}`;
        
        // Skip if we've already processed this book+recommender combination
        if (processedBooks.has(uniqueKey)) {
          console.log(`Skipping duplicate import: ${item.title} by ${item.recommenderName}`);
          skippedCount++;
          continue;
        }
        
        // カスタムマップを使用して既存の推薦者をチェック（大文字小文字を区別しないように）
        let existingRecommender = null;
        if (recommenderMap.has(item.recommenderName.toLowerCase())) {
          existingRecommender = recommenderMap.get(item.recommenderName.toLowerCase());
          console.log(`Found existing recommender: ${existingRecommender.name} (ID: ${existingRecommender.id})`);
        }
        
        // For MemStorage, we'll just count each successfully imported item
        await this.createCompleteRecommendation({
          title: item.title,
          author: item.author,
          category: item.category,
          recommenderName: item.recommenderName,
          recommenderOrg: item.recommenderOrg,
          industry: undefined, // CSV doesn't have this field
          comment: item.comment,
          recommendationDate: item.recommendationDate ? item.recommendationDate.split(" ")[0] : undefined, // Extract year
          recommendationMedium: item.recommendationDate ? item.recommendationDate.split(" ").slice(1).join(" ") : undefined, // Extract medium
          reason: item.reason
        });
        
        // Mark as processed and increment success counter
        processedBooks.add(uniqueKey);
        successCount++;
      } catch (error) {
        console.error(`Error importing item: ${JSON.stringify(item)}`, error);
        skippedCount++;
      }
    }
    
    return {
      count: successCount,
      skipped: skippedCount,
      total: items.length
    };
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

  async updateBook(id: number, bookData: Partial<InsertBook>): Promise<Book | undefined> {
    // 既存のBookをまず確認
    const existingBook = await this.getBookById(id);
    if (!existingBook) {
      return undefined;
    }

    // nullに変換して型の整合性を保つ
    const processedData: Partial<Book> = {};
    if (bookData.title !== undefined) processedData.title = bookData.title;
    if (bookData.author !== undefined) processedData.author = bookData.author;
    if (bookData.category !== undefined) processedData.category = bookData.category || null;
    if (bookData.imageUrl !== undefined) processedData.imageUrl = bookData.imageUrl || null;
    if (bookData.publishYear !== undefined) processedData.publishYear = bookData.publishYear || null;
    if (bookData.description !== undefined) processedData.description = bookData.description || null;
    
    const [updatedBook] = await db
      .update(books)
      .set(processedData)
      .where(eq(books.id, id))
      .returning();
    
    return updatedBook;
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
  
  async deleteBook(id: number): Promise<boolean> {
    // まず本が存在するか確認
    const book = await this.getBookById(id);
    if (!book) {
      return false;
    }
    
    try {
      // トランザクションを開始
      await db.transaction(async (tx) => {
        // この本に関連する推薦を先に削除
        await tx
          .delete(recommendations)
          .where(eq(recommendations.bookId, id));
        
        // 本を削除
        await tx
          .delete(books)
          .where(eq(books.id, id));
      });
      
      return true;
    } catch (error) {
      console.error(`Error deleting book with ID ${id}:`, error);
      return false;
    }
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
      industry: recommender.industry || null,
      imageUrl: recommender.imageUrl || null
    };
    
    const [newRecommender] = await db
      .insert(recommenders)
      .values(processedRecommender)
      .returning();
    return newRecommender;
  }

  async updateRecommender(id: number, recommenderData: Partial<InsertRecommender>): Promise<Recommender | undefined> {
    // 既存のRecommenderをまず確認
    const existingRecommender = await this.getRecommenderById(id);
    if (!existingRecommender) {
      return undefined;
    }

    // nullに変換して型の整合性を保つ
    const processedData: Partial<Recommender> = {};
    if (recommenderData.name !== undefined) processedData.name = recommenderData.name;
    if (recommenderData.organization !== undefined) processedData.organization = recommenderData.organization || null;
    if (recommenderData.industry !== undefined) processedData.industry = recommenderData.industry || null;
    if (recommenderData.imageUrl !== undefined) processedData.imageUrl = recommenderData.imageUrl || null;
    
    const [updatedRecommender] = await db
      .update(recommenders)
      .set(processedData)
      .where(eq(recommenders.id, id))
      .returning();
    
    return updatedRecommender;
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
  
  async deleteRecommender(id: number): Promise<boolean> {
    // まず推薦者が存在するか確認
    const recommender = await this.getRecommenderById(id);
    if (!recommender) {
      return false;
    }
    
    try {
      // トランザクションを開始
      await db.transaction(async (tx) => {
        // この推薦者に関連する推薦を先に削除
        await tx
          .delete(recommendations)
          .where(eq(recommendations.recommenderId, id));
        
        // 推薦者を削除
        await tx
          .delete(recommenders)
          .where(eq(recommenders.id, id));
      });
      
      return true;
    } catch (error) {
      console.error(`Error deleting recommender with ID ${id}:`, error);
      return false;
    }
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

  async updateRecommendation(id: number, recommendationData: Partial<InsertRecommendation>): Promise<Recommendation | undefined> {
    // 既存の推薦情報を確認
    const existingRecommendation = await this.getRecommendationById(id);
    if (!existingRecommendation) {
      return undefined;
    }

    // デバッグログ
    console.log(`Updating recommendation with ID ${id} with data:`, recommendationData);

    // nullに変換して型の整合性を保つ
    const processedData: Partial<Recommendation> = {};
    if (recommendationData.bookId !== undefined) processedData.bookId = recommendationData.bookId;
    if (recommendationData.recommenderId !== undefined) processedData.recommenderId = recommendationData.recommenderId;
    if (recommendationData.comment !== undefined) processedData.comment = recommendationData.comment || null;
    if (recommendationData.recommendationDate !== undefined) processedData.recommendationDate = recommendationData.recommendationDate || null;
    if (recommendationData.recommendationMedium !== undefined) processedData.recommendationMedium = recommendationData.recommendationMedium || null;
    if (recommendationData.source !== undefined) processedData.source = recommendationData.source || null;
    if (recommendationData.sourceUrl !== undefined) processedData.sourceUrl = recommendationData.sourceUrl || null;
    if (recommendationData.reason !== undefined) processedData.reason = recommendationData.reason || null;
    
    try {
      // デバッグログ
      console.log(`Processed data for update:`, processedData);
      
      const [updatedRecommendation] = await db
        .update(recommendations)
        .set(processedData)
        .where(eq(recommendations.id, id))
        .returning();
      
      console.log(`Successfully updated recommendation:`, updatedRecommendation);
      return updatedRecommendation;
    } catch (error) {
      console.error(`Error updating recommendation with ID ${id}:`, error);
      return undefined;
    }
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
        source: recommendations.source,
        sourceUrl: recommendations.sourceUrl,
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
        source: recommendations.source,
        sourceUrl: recommendations.sourceUrl,
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

      // 全ての既存の推薦者を取得して、名前で検索（大文字小文字を区別せず）
      const allRecommenders = await tx.select().from(recommenders);
      let recommender = allRecommenders.find(
        r => r.name.toLowerCase() === data.recommenderName.toLowerCase()
      );
      
      // 推薦者が存在しない場合のみ新規作成
      if (!recommender) {
        console.log(`Creating new recommender: ${data.recommenderName}`);
        const [newRecommender] = await tx
          .insert(recommenders)
          .values({
            name: data.recommenderName,
            organization: data.recommenderOrg || null,
            industry: data.industry || null,
            imageUrl: null
          })
          .returning();
        recommender = newRecommender;
      } else {
        console.log(`Using existing recommender: ${recommender.name} (ID: ${recommender.id})`);
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
  async importFromCSV(items: BookRecommendationCSV[]): Promise<{count: number, skipped: number, total: number}> {
    let successCount = 0;
    let skippedCount = 0;
    const processedBooks = new Set<string>();
    
    // まず全ての推薦者を取得して、既存の推薦者のマップを作成
    const allRecommenders = await this.getAllRecommenders();
    const recommenderMap = new Map<string, Recommender>();
    allRecommenders.forEach(recommender => {
      recommenderMap.set(recommender.name.toLowerCase(), recommender);
    });
    
    for (const item of items) {
      try {
        // Create a unique key for this book+recommender combination to prevent duplicates
        const uniqueKey = `${item.title.toLowerCase()}_${item.recommenderName.toLowerCase()}`;
        
        // Skip if we've already processed this book+recommender combination
        if (processedBooks.has(uniqueKey)) {
          console.log(`Skipping duplicate import: ${item.title} by ${item.recommenderName}`);
          skippedCount++;
          continue;
        }
        
        // Check if this book already exists
        const existingBook = await this.getBookByTitle(item.title);
        let existingRecommender = null;
        
        // カスタムマップを使用して既存の推薦者をチェック（大文字小文字を区別しないように）
        if (recommenderMap.has(item.recommenderName.toLowerCase())) {
          existingRecommender = recommenderMap.get(item.recommenderName.toLowerCase());
        }
        
        // If both book and recommender exist, check if recommendation exists
        if (existingBook && existingRecommender) {
          // Get all recommendations for this book
          const bookRecommendations = await this.getCompleteRecommendationsByBookId(existingBook.id);
          
          // Check if a recommendation from this recommender already exists
          const hasRecommendation = bookRecommendations.some(
            rec => rec.recommenderId === existingRecommender!.id
          );
          
          if (hasRecommendation) {
            console.log(`Skipping existing recommendation: ${item.title} by ${item.recommenderName}`);
            continue;
          }
        }
        
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
        
        // Mark as processed and increment success counter
        processedBooks.add(uniqueKey);
        successCount++;
      } catch (error) {
        console.error(`Error importing item: ${JSON.stringify(item)}`, error);
        skippedCount++;
      }
    }
    
    return {
      count: successCount,
      skipped: skippedCount,
      total: items.length
    };
  }
}

// Replace MemStorage with DatabaseStorage
// export const storage = new MemStorage();
export const storage = new DatabaseStorage();
