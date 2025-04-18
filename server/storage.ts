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

export const storage = new MemStorage();
