import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import BookCard from "@/components/BookCard";
import FilterModal from "@/components/FilterModal";
import { Button } from "@/components/ui/button";
import { Book } from "@shared/schema";

const BookList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("title");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 9;

  const { data: books = [], isLoading } = useQuery({
    queryKey: ["/api/books"],
  });

  // Handle search change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  // Handle sort change
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };

  // Filter and sort books
  const filteredBooks = books
    .filter((book: Book) => {
      // Apply text search
      const matchesSearch = 
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase());
        
      // Apply category filter
      const matchesCategory = 
        categories.length === 0 || // No categories selected
        (book.category && categories.includes(book.category));
        
      return matchesSearch && matchesCategory;
    })
    .sort((a: Book, b: Book) => {
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      } else if (sortBy === "author") {
        return a.author.localeCompare(b.author);
      } else if (sortBy === "category") {
        return (a.category || "").localeCompare(b.category || "");
      }
      return 0;
    });
    
  // Pagination
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);
  
  // Handle filter apply
  const handleFilterApply = (selectedCategories: string[]) => {
    setCategories(selectedCategories);
    setShowFilterModal(false);
    setCurrentPage(1); // Reset to first page on filter change
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">
        書籍一覧
      </h1>

      {/* Search and Filter Bar */}
      <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div className="relative md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i className="ri-search-line text-gray-400"></i>
          </div>
          <input
            type="text"
            className="search-input block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none"
            placeholder="タイトルまたは著者名で検索"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <select
              className="appearance-none block pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none bg-white"
              value={sortBy}
              onChange={handleSortChange}
            >
              <option value="title">タイトル順</option>
              <option value="author">著者名順</option>
              <option value="category">カテゴリー順</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <i className="ri-arrow-down-s-line"></i>
            </div>
          </div>
          
          <Button
            onClick={() => setShowFilterModal(true)}
            variant="outline"
            className="inline-flex items-center"
          >
            <i className="ri-filter-3-line mr-2"></i>
            フィルター
            {categories.length > 0 && (
              <span className="ml-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {categories.length}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Active filters */}
      {categories.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map(category => (
            <div key={category} className="bg-secondary-dark text-accent-dark text-xs font-medium px-2 py-1 rounded flex items-center">
              {category}
              <button 
                onClick={() => setCategories(categories.filter(c => c !== category))}
                className="ml-1 text-gray-500 hover:text-gray-700"
              >
                <i className="ri-close-line"></i>
              </button>
            </div>
          ))}
          <button 
            onClick={() => setCategories([])}
            className="text-gray-500 hover:text-gray-700 text-xs underline"
          >
            すべてクリア
          </button>
        </div>
      )}

      {/* Books Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(9).fill(0).map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      ) : currentBooks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentBooks.map((book: Book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500">該当する書籍が見つかりませんでした。</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-10 flex justify-center">
          <nav className="inline-flex rounded-md shadow-sm" aria-label="Pagination">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border"
            >
              <span className="sr-only">前のページ</span>
              <i className="ri-arrow-left-s-line"></i>
            </Button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "outline"}
                onClick={() => setCurrentPage(page)}
                className="relative inline-flex items-center px-4 py-2 border"
              >
                {page}
              </Button>
            ))}
            
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border"
            >
              <span className="sr-only">次のページ</span>
              <i className="ri-arrow-right-s-line"></i>
            </Button>
          </nav>
        </div>
      )}

      {/* Filter Modal */}
      <FilterModal 
        isOpen={showFilterModal} 
        onClose={() => setShowFilterModal(false)}
        onApply={handleFilterApply}
        initialCategories={categories}
      />
    </main>
  );
};

export default BookList;
