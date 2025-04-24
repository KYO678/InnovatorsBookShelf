import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage as dataStorage } from "./storage";
import { z } from "zod";
import { combinedInsertSchema, BookRecommendationCSV, InsertRecommendation } from "@shared/schema";
import { parse } from "csv-parse/sync";
import fs from "fs-extra";
import path from "path";
import multer from "multer";

export async function registerRoutes(app: Express): Promise<Server> {
  // Load initial data from CSV
  try {
    const csvPath = path.resolve(process.cwd(), "attached_assets", "books.csv");
    const csvData = fs.readFileSync(csvPath, 'utf8');
    
    // Skip the header row and parse CSV
    const records = parse(csvData, {
      columns: [
        'title', 'author', 'recommenderName', 'comment', 'recommendationDate', 'reason'
      ],
      from_line: 2
    });
    
    // Process each record to split recommender name and organization
    const processedRecords = records.map((record: any) => {
      const recommenderParts = record.recommenderName.split('(');
      const name = recommenderParts[0].trim();
      const org = recommenderParts.length > 1 
        ? recommenderParts[1].replace(')', '').trim() 
        : '';
        
      // Map category based on content if possible
      let category = '';
      const titleLower = record.title.toLowerCase();
      if (titleLower.includes('business') || titleLower.includes('management')) {
        category = 'ビジネス';
      } else if (titleLower.includes('sapiens') || titleLower.includes('factfulness')) {
        category = '社会科学';
      } else if (titleLower.includes('hitchhiker')) {
        category = 'SF';
      } else if (titleLower.includes('structures')) {
        category = '科学';
      } else if (titleLower.includes('day') || titleLower.includes('remains')) {
        category = '小説';
      } else if (titleLower.includes('investor') || titleLower.includes('investment')) {
        category = '投資';
      }
      
      return {
        title: record.title,
        author: record.author,
        recommenderName: name,
        recommenderOrg: org,
        comment: record.comment,
        recommendationDate: record.recommendationDate,
        reason: record.reason,
        category: category
      };
    });
    
    await dataStorage.importFromCSV(processedRecords);
    console.log('Initial data loaded from CSV');
  } catch (error) {
    console.error('Error loading initial data from CSV:', error);
  }

  // Books API
  app.get('/api/books', async (req: Request, res: Response) => {
    try {
      const books = await dataStorage.getAllBooks();
      res.json(books);
    } catch (error) {
      console.error('Error fetching books:', error);
      res.status(500).json({ message: 'Error fetching books' });
    }
  });

  app.get('/api/books/search', async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.json(await dataStorage.getAllBooks());
      }
      const books = await dataStorage.searchBooks(query);
      res.json(books);
    } catch (error) {
      console.error('Error searching books:', error);
      res.status(500).json({ message: 'Error searching books' });
    }
  });

  app.get('/api/books/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid book ID' });
      }
      
      const book = await dataStorage.getBookById(id);
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }
      
      res.json(book);
    } catch (error) {
      console.error('Error fetching book:', error);
      res.status(500).json({ message: 'Error fetching book' });
    }
  });
  
  app.get('/api/books/:id/recommenders', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid book ID' });
      }
      
      const book = await dataStorage.getBookById(id);
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }
      
      const recommendations = await dataStorage.getCompleteRecommendationsByBookId(id);
      res.json(recommendations);
    } catch (error) {
      console.error('Error fetching book recommenders:', error);
      res.status(500).json({ message: 'Error fetching book recommenders' });
    }
  });

  // Recommenders API
  app.get('/api/recommenders', async (req: Request, res: Response) => {
    try {
      const recommenders = await dataStorage.getAllRecommenders();
      res.json(recommenders);
    } catch (error) {
      console.error('Error fetching recommenders:', error);
      res.status(500).json({ message: 'Error fetching recommenders' });
    }
  });

  app.get('/api/recommenders/search', async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.json(await dataStorage.getAllRecommenders());
      }
      const recommenders = await dataStorage.searchRecommenders(query);
      res.json(recommenders);
    } catch (error) {
      console.error('Error searching recommenders:', error);
      res.status(500).json({ message: 'Error searching recommenders' });
    }
  });

  app.get('/api/recommenders/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid recommender ID' });
      }
      
      const recommender = await dataStorage.getRecommenderById(id);
      if (!recommender) {
        return res.status(404).json({ message: 'Recommender not found' });
      }
      
      res.json(recommender);
    } catch (error) {
      console.error('Error fetching recommender:', error);
      res.status(500).json({ message: 'Error fetching recommender' });
    }
  });
  
  app.get('/api/recommenders/:id/books', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid recommender ID' });
      }
      
      const recommender = await dataStorage.getRecommenderById(id);
      if (!recommender) {
        return res.status(404).json({ message: 'Recommender not found' });
      }
      
      const recommendations = await dataStorage.getCompleteRecommendationsByRecommenderId(id);
      res.json(recommendations);
    } catch (error) {
      console.error('Error fetching recommender books:', error);
      res.status(500).json({ message: 'Error fetching recommender books' });
    }
  });

  // Admin API
  app.post('/api/admin/books', async (req: Request, res: Response) => {
    try {
      const result = combinedInsertSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: 'Invalid data', 
          errors: result.error.errors 
        });
      }
      
      const completeRecommendation = await dataStorage.createCompleteRecommendation(result.data);
      res.status(201).json(completeRecommendation);
    } catch (error) {
      console.error('Error creating book recommendation:', error);
      res.status(500).json({ message: 'Error creating book recommendation' });
    }
  });
  
  // CSV import endpoint
  app.post('/api/admin/import-csv', async (req: Request, res: Response) => {
    try {
      const items = req.body as BookRecommendationCSV[];
      
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'Invalid CSV data format or empty array' });
      }
      
      console.log(`Attempting to import ${items.length} items from CSV`);
      
      // Use the importFromCSV method to process all items at once and get detailed import results
      const result = await dataStorage.importFromCSV(items);
      
      res.status(201).json({ 
        message: `Successfully imported ${result.count} book recommendations, skipped ${result.skipped}`,
        count: result.count,
        total: result.total,
        skipped: result.skipped
      });
    } catch (error) {
      console.error('Error importing from CSV:', error);
      res.status(500).json({ message: 'Error importing from CSV' });
    }
  });

  // Book update endpoint
  app.put('/api/admin/books/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid book ID' });
      }
      
      const book = await dataStorage.updateBook(id, req.body);
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }
      
      res.json(book);
    } catch (error) {
      console.error('Error updating book:', error);
      res.status(500).json({ message: 'Error updating book' });
    }
  });

  // Recommender update endpoint
  app.put('/api/admin/recommenders/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid recommender ID' });
      }
      
      const recommender = await dataStorage.updateRecommender(id, req.body);
      if (!recommender) {
        return res.status(404).json({ message: 'Recommender not found' });
      }
      
      res.json(recommender);
    } catch (error) {
      console.error('Error updating recommender:', error);
      res.status(500).json({ message: 'Error updating recommender' });
    }
  });
  
  // Book delete endpoint
  app.delete('/api/admin/books/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid book ID' });
      }
      
      const success = await dataStorage.deleteBook(id);
      if (!success) {
        return res.status(404).json({ message: 'Book not found' });
      }
      
      res.json({ success: true, message: 'Book deleted successfully' });
    } catch (error) {
      console.error('Error deleting book:', error);
      res.status(500).json({ message: 'Error deleting book' });
    }
  });
  
  // Recommender delete endpoint
  app.delete('/api/admin/recommenders/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid recommender ID' });
      }
      
      const success = await dataStorage.deleteRecommender(id);
      if (!success) {
        return res.status(404).json({ message: 'Recommender not found' });
      }
      
      res.json({ success: true, message: 'Recommender deleted successfully' });
    } catch (error) {
      console.error('Error deleting recommender:', error);
      res.status(500).json({ message: 'Error deleting recommender' });
    }
  });
  
  // Create recommendation endpoint (link book and recommender)
  app.post('/api/admin/recommendations', async (req: Request, res: Response) => {
    try {
      const data = req.body as InsertRecommendation;
      
      // データの検証
      if (!data.bookId || !data.recommenderId) {
        return res.status(400).json({ message: 'Book ID and recommender ID are required' });
      }
      
      // 本と推薦者の存在確認
      const book = await dataStorage.getBookById(data.bookId);
      const recommender = await dataStorage.getRecommenderById(data.recommenderId);
      
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }
      
      if (!recommender) {
        return res.status(404).json({ message: 'Recommender not found' });
      }
      
      // 推薦情報を作成
      const recommendation = await dataStorage.createRecommendation(data);
      
      // 完全な推薦情報を作成して返す
      const completeRecommendation = {
        ...recommendation,
        book,
        recommender
      };
      
      res.status(201).json(completeRecommendation);
    } catch (error) {
      console.error('Error creating recommendation:', error);
      res.status(500).json({ message: 'Error creating recommendation' });
    }
  });

  // 推薦情報更新エンドポイント
  app.put('/api/admin/recommendations/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      
      // IDの検証
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid recommendation ID' });
      }
      
      // 推薦情報の存在確認
      const existingRecommendation = await dataStorage.getRecommendationById(id);
      if (!existingRecommendation) {
        return res.status(404).json({ message: 'Recommendation not found' });
      }
      
      // 更新データから必要なフィールドを抽出
      const {
        bookId,
        recommenderId,
        comment,
        recommendationDate,
        recommendationMedium,
        source,
        sourceUrl,
        reason
      } = updateData;
      
      // 推薦情報を更新
      const updatedRecommendation = await dataStorage.updateRecommendation(id, {
        bookId,
        recommenderId,
        comment,
        recommendationDate,
        recommendationMedium,
        source,
        sourceUrl,
        reason
      });
      
      if (!updatedRecommendation) {
        return res.status(404).json({ message: 'Failed to update recommendation' });
      }
      
      // 本と推薦者の情報を取得して完全な推薦情報を作成
      const book = await dataStorage.getBookById(updatedRecommendation.bookId);
      const recommender = await dataStorage.getRecommenderById(updatedRecommendation.recommenderId);
      
      const completeRecommendation = {
        ...updatedRecommendation,
        book,
        recommender
      };
      
      res.json(completeRecommendation);
    } catch (error) {
      console.error('Error updating recommendation:', error);
      res.status(500).json({ message: 'Error updating recommendation' });
    }
  });

  // Setup multer for image uploads
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  fs.ensureDirSync(uploadsDir); // Make sure the uploads directory exists

  const multerStorage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (_req, file, cb) => {
      // Generate unique filename with timestamp
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, uniqueSuffix + ext);
    }
  });

  const upload = multer({ 
    storage: multerStorage,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (_req, file, cb) => {
      // Accept only image files
      if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Only image files are allowed'));
      }
      cb(null, true);
    }
  });

  // Image upload endpoint
  app.post('/api/admin/upload', upload.single('image'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No image file uploaded' });
      }

      const type = req.body.type as 'book' | 'recommender';
      const entityId = req.body.entityId ? parseInt(req.body.entityId) : undefined;
      
      // Generate relative URL for the image
      const imageUrl = `/uploads/${req.file.filename}`;
      
      // Update entity with new image URL if ID is provided
      if (entityId && !isNaN(entityId)) {
        if (type === 'book') {
          await dataStorage.updateBook(entityId, { imageUrl });
        } else if (type === 'recommender') {
          await dataStorage.updateRecommender(entityId, { imageUrl });
        }
      }
      
      res.json({ 
        imageUrl,
        message: 'Image uploaded successfully'
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      res.status(500).json({ message: 'Error uploading image' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
