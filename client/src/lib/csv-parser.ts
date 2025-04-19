import { BookRecommendationCSV } from "@shared/schema";
import { apiRequest } from "./queryClient";

/**
 * Parse a CSV string into an array of book recommendation objects
 */
export async function parseCSV(csvString: string): Promise<BookRecommendationCSV[]> {
  // Split the CSV into lines and detect the header row
  const lines = csvString.trim().split("\n");
  const headerRow = lines[0].split(",");
  
  // Create a mapping of header names to indexes
  const headerIndexes: Record<string, number> = {};
  headerRow.forEach((header, index) => {
    const cleanHeader = header.trim();
    // Map standard column names to their positions
    switch (cleanHeader) {
      case "書籍タイトル":
        headerIndexes["title"] = index;
        break;
      case "著者名":
        headerIndexes["author"] = index;
        break;
      case "推薦者（所属）":
        headerIndexes["recommender"] = index;
        break;
      case "推薦コメント":
        headerIndexes["comment"] = index;
        break;
      case "推薦時期・媒体":
        headerIndexes["recommendationDate"] = index;
        break;
      case "推薦理由・背景":
        headerIndexes["reason"] = index;
        break;
      case "カテゴリ":
        headerIndexes["category"] = index;
        break;
      case "画像URL":
        headerIndexes["imageUrl"] = index;
        break;
      case "出版年":
        headerIndexes["publishYear"] = index;
        break;
      case "書籍の説明":
        headerIndexes["description"] = index;
        break;
      case "出所情報":
        headerIndexes["source"] = index;
        break;
      case "出所URL":
        headerIndexes["sourceUrl"] = index;
        break;
      default:
        // Optional: handle other custom headers
        headerIndexes[cleanHeader.toLowerCase()] = index;
    }
  });
  
  // Ensure required columns exist
  if (!('title' in headerIndexes) || !('author' in headerIndexes) || !('recommender' in headerIndexes)) {
    throw new Error("必須列（書籍タイトル、著者名、推薦者）が見つかりません");
  }
  
  // Process all rows after the header
  return lines.slice(1).map(row => {
    const columns = row.split(",");
    
    // Skip empty rows
    if (columns.length <= 1) return null;
    
    // Extract values based on header positions
    const getValue = (key: string) => {
      const index = headerIndexes[key];
      return index !== undefined && index < columns.length ? columns[index].trim() : "";
    };
    
    // Extract recommender name and organization
    const recommenderFull = getValue("recommender");
    const recommenderMatches = recommenderFull.match(/(.+)\((.+)\)/);
    
    let recommenderName = recommenderFull;
    let recommenderOrg = "";
    
    if (recommenderMatches && recommenderMatches.length >= 3) {
      recommenderName = recommenderMatches[1].trim();
      recommenderOrg = recommenderMatches[2].trim();
    }
    
    // Try to determine category if not specified in CSV
    let category = getValue("category");
    if (!category) {
      const title = getValue("title").toLowerCase();
      
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
    }
    
    return {
      title: getValue("title"),
      author: getValue("author"),
      recommenderName,
      recommenderOrg,
      comment: getValue("comment"),
      recommendationDate: getValue("recommendationDate"),
      reason: getValue("reason"),
      category,
      imageUrl: getValue("imageUrl"),
      publishYear: getValue("publishYear"),
      description: getValue("description"),
      source: getValue("source"),
      sourceUrl: getValue("sourceUrl")
    };
  }).filter(item => item && item.title && item.author) as BookRecommendationCSV[]; // Filter out empty rows
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
