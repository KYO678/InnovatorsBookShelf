import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import HeroSection from "@/components/HeroSection";
import BookCard from "@/components/BookCard";
import RecommenderCard from "@/components/RecommenderCard";
import { Book, Recommender } from "@shared/schema";

const Home = () => {
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("books");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("title");

  // Fetch books
  const { data: books = [], isLoading: isLoadingBooks } = useQuery({
    queryKey: ["/api/books"],
  });

  // Fetch recommenders
  const { data: recommenders = [], isLoading: isLoadingRecommenders } = useQuery({
    queryKey: ["/api/recommenders"],
  });

  // Handle tab switching
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle sort change
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };

  // Sort and filter books
  const filteredBooks = books
    .filter((book: Book) => 
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a: Book, b: Book) => {
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      } else if (sortBy === "author") {
        return a.author.localeCompare(b.author);
      }
      return 0;
    });

  // Sort and filter recommenders
  const filteredRecommenders = recommenders
    .filter((recommender: Recommender) => 
      recommender.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (recommender.organization && recommender.organization.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a: Recommender, b: Recommender) => {
      return a.name.localeCompare(b.name);
    });

  return (
    <div>
      <HeroSection />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tabs Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex -mb-px space-x-8">
            <button
              onClick={() => handleTabChange("books")}
              className={`whitespace-nowrap py-4 px-1 font-medium text-lg ${
                activeTab === "books" ? "tab-active" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <i className="ri-book-2-line mr-2"></i>書籍一覧
            </button>
            <button
              onClick={() => handleTabChange("recommenders")}
              className={`whitespace-nowrap py-4 px-1 font-medium text-lg ${
                activeTab === "recommenders" ? "tab-active" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <i className="ri-user-star-line mr-2"></i>推薦者一覧
            </button>
          </nav>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
          <div className="relative md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="ri-search-line text-gray-400"></i>
            </div>
            <input
              type="text"
              className="search-input block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none"
              placeholder={activeTab === "books" ? "タイトルまたは著者名で検索" : "推薦者名または所属で検索"}
              value={searchQuery}
              onChange={handleSearch}
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
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <i className="ri-arrow-down-s-line"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Books Tab Content */}
        {activeTab === "books" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoadingBooks ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
              ))
            ) : filteredBooks.length > 0 ? (
              filteredBooks.map((book: Book) => (
                <BookCard key={book.id} book={book} />
              ))
            ) : (
              <div className="col-span-3 text-center py-10">
                <p className="text-gray-500">該当する書籍が見つかりませんでした。</p>
              </div>
            )}
          </div>
        )}
        
        {/* Recommenders Tab Content */}
        {activeTab === "recommenders" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoadingRecommenders ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
              ))
            ) : filteredRecommenders.length > 0 ? (
              filteredRecommenders.map((recommender: Recommender) => (
                <RecommenderCard key={recommender.id} recommender={recommender} />
              ))
            ) : (
              <div className="col-span-3 text-center py-10">
                <p className="text-gray-500">該当する推薦者が見つかりませんでした。</p>
              </div>
            )}
          </div>
        )}
        
        {/* View All Buttons */}
        <div className="mt-10 flex justify-center">
          {activeTab === "books" && filteredBooks.length > 0 && (
            <button
              onClick={() => setLocation("/books")}
              className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              すべての書籍を見る
            </button>
          )}
          
          {activeTab === "recommenders" && filteredRecommenders.length > 0 && (
            <button
              onClick={() => setLocation("/recommenders")}
              className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              すべての推薦者を見る
            </button>
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;
