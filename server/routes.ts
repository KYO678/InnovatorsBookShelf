import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { combinedInsertSchema } from "@shared/schema";
import { parse } from "csv-parse/sync";
import fs from "fs";
import path from "path";

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
    
    await storage.importFromCSV(processedRecords);
    console.log('Initial data loaded from CSV');
  } catch (error) {
    console.error('Error loading initial data from CSV:', error);
  }

  // Books API
  app.get('/api/books', async (req: Request, res: Response) => {
    try {
      const books = await storage.getAllBooks();
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
        return res.json(await storage.getAllBooks());
      }
      const books = await storage.searchBooks(query);
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
      
      const book = await storage.getBookById(id);
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
      
      const book = await storage.getBookById(id);
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }
      
      const recommendations = await storage.getCompleteRecommendationsByBookId(id);
      res.json(recommendations);
    } catch (error) {
      console.error('Error fetching book recommenders:', error);
      res.status(500).json({ message: 'Error fetching book recommenders' });
    }
  });

  // Recommenders API
  app.get('/api/recommenders', async (req: Request, res: Response) => {
    try {
      const recommenders = await storage.getAllRecommenders();
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
        return res.json(await storage.getAllRecommenders());
      }
      const recommenders = await storage.searchRecommenders(query);
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
      
      const recommender = await storage.getRecommenderById(id);
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
      
      const recommender = await storage.getRecommenderById(id);
      if (!recommender) {
        return res.status(404).json({ message: 'Recommender not found' });
      }
      
      const recommendations = await storage.getCompleteRecommendationsByRecommenderId(id);
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
      
      const completeRecommendation = await storage.createCompleteRecommendation(result.data);
      res.status(201).json(completeRecommendation);
    } catch (error) {
      console.error('Error creating book recommendation:', error);
      res.status(500).json({ message: 'Error creating book recommendation' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
