import { BookRecommendationCSV } from "@shared/schema";
import { apiRequest } from "./queryClient";

/**
 * Parse a CSV string into an array of book recommendation objects
 */
export async function parseCSV(csvString: string): Promise<BookRecommendationCSV[]> {
  // Skip the header row
  const rows = csvString.trim().split("\n").slice(1);
  
  return rows.map(row => {
    const columns = row.split(",");
    
    // Check if we have enough columns
    if (columns.length < 6) {
      throw new Error("Invalid CSV format: not enough columns");
    }
    
    // Extract recommender name and organization
    const recommenderFull = columns[2];
    const recommenderMatches = recommenderFull.match(/(.+)\((.+)\)/);
    
    let recommenderName = recommenderFull;
    let recommenderOrg = "";
    
    if (recommenderMatches && recommenderMatches.length >= 3) {
      recommenderName = recommenderMatches[1].trim();
      recommenderOrg = recommenderMatches[2].trim();
    }
    
    // Try to determine category based on the book title
    let category = "";
    const title = columns[0].toLowerCase();
    
    if (title.includes("business") || title.includes("management")) {
      category = "ビジネス";
    } else if (title.includes("sapiens") || title.includes("factfulness")) {
      category = "社会科学";
    } else if (title.includes("hitchhiker")) {
      category = "SF";
    } else if (title.includes("structures")) {
      category = "科学";
    } else if (title.includes("day") || title.includes("remains")) {
      category = "小説";
    } else if (title.includes("investor") || title.includes("investment")) {
      category = "投資";
    }
    
    return {
      title: columns[0],
      author: columns[1],
      recommenderName,
      recommenderOrg,
      comment: columns[3],
      recommendationDate: columns[4],
      reason: columns[5],
      category
    };
  }).filter(item => item.title && item.author); // Filter out empty rows
}

/**
 * Import books from a CSV file
 */
export async function importBooksFromCSV(file: File): Promise<BookRecommendationCSV[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const csvString = e.target?.result as string;
        if (!csvString) {
          return reject(new Error("Failed to read CSV file"));
        }
        
        const books = await parseCSV(csvString);
        resolve(books);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error("Failed to read CSV file"));
    };
    
    reader.readAsText(file);
  });
}
