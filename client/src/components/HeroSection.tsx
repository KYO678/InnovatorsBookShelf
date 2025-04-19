import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Book, Recommender } from "@shared/schema";
import SearchBar from "./SearchBar";

const HeroSection = () => {
  const [_, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{
    books: Book[];
    recommenders: Recommender[];
  }>({ books: [], recommenders: [] });
  const [showResults, setShowResults] = useState(false);

  // Fetch books for search
  const { data: books = [] } = useQuery({
    queryKey: ["/api/books"],
  });

  // Fetch recommenders for search
  const { data: recommenders = [] } = useQuery({
    queryKey: ["/api/recommenders"],
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (query.trim() === "") {
      setShowResults(false);
      return;
    }

    const filteredBooks = books.filter((book: Book) =>
      book.title.toLowerCase().includes(query.toLowerCase()) ||
      book.author.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);

    const filteredRecommenders = recommenders.filter((recommender: Recommender) =>
      recommender.name.toLowerCase().includes(query.toLowerCase()) ||
      (recommender.organization && recommender.organization.toLowerCase().includes(query.toLowerCase()))
    ).slice(0, 5);

    setSearchResults({
      books: filteredBooks,
      recommenders: filteredRecommenders,
    });

    setShowResults(true);
  };

  const handleClickSearchResult = (type: "book" | "recommender", id: number) => {
    setShowResults(false);
    setSearchQuery("");
    if (type === "book") {
      setLocation(`/books/${id}`);
    } else {
      setLocation(`/recommenders/${id}`);
    }
  };

  return (
    <section className="relative bg-gradient-to-r from-primary-dark via-primary to-primary-light py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="md:w-1/2 md:pr-8">
            <div className="bg-primary-dark bg-opacity-75 p-4 rounded-lg shadow-lg inline-block">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-white leading-tight">
                著名人が<span className="text-secondary">推薦する</span>書籍を<br />
                <span className="text-secondary">見つける</span>ことができる<br />
                特別なコレクション
              </h2>
              <p className="mt-4 text-white md:text-lg">
                ビジネスリーダーや影響力のある人々が推薦する本をまとめたデータベースです。
                書籍から推薦者、推薦者から書籍へと、双方向に探索してみましょう。
              </p>
            </div>

            <div className="mt-8 relative">
              <SearchBar
                placeholder="書籍名または推薦者名で検索..."
                value={searchQuery}
                onChange={handleSearch}
                className="shadow-lg"
              />

              {showResults && (searchResults.books.length > 0 || searchResults.recommenders.length > 0) && (
                <div className="absolute mt-2 w-full bg-white rounded-lg shadow-lg z-10">
                  {searchResults.books.length > 0 && (
                    <div className="p-2">
                      <div className="text-xs font-medium text-gray-500 px-3 py-1">書籍</div>
                      {searchResults.books.map((book) => (
                        <div
                          key={`book-${book.id}`}
                          className="px-3 py-2 hover:bg-gray-50 rounded cursor-pointer flex items-center"
                          onClick={() => handleClickSearchResult("book", book.id)}
                        >
                          <div className="w-6 h-10 bg-primary-light rounded-sm mr-2 flex-shrink-0">
                            <div className="h-full w-1 bg-primary-dark"></div>
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">{book.title}</div>
                            <div className="text-sm text-gray-600">{book.author}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {searchResults.recommenders.length > 0 && (
                    <div className="p-2">
                      <div className="text-xs font-medium text-gray-500 px-3 py-1">推薦者</div>
                      {searchResults.recommenders.map((recommender) => (
                        <div
                          key={`recommender-${recommender.id}`}
                          className="px-3 py-2 hover:bg-gray-50 rounded cursor-pointer flex items-center"
                          onClick={() => handleClickSearchResult("recommender", recommender.id)}
                        >
                          <div className="w-8 h-8 rounded-full bg-primary-light text-white flex items-center justify-center mr-2 flex-shrink-0">
                            {recommender.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">{recommender.name}</div>
                            {recommender.organization && (
                              <div className="text-sm text-gray-600">{recommender.organization}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center space-x-2 text-secondary-light">
              <span>人気の検索:</span>
              <a 
                href="#" 
                className="text-secondary hover:text-white underline"
                onClick={(e) => {
                  e.preventDefault();
                  handleSearch("Bill Gates");
                }}
              >
                Bill Gates
              </a>
              <a 
                href="#" 
                className="text-secondary hover:text-white underline"
                onClick={(e) => {
                  e.preventDefault();
                  handleSearch("Warren Buffett");
                }}
              >
                Warren Buffett
              </a>
              <a 
                href="#" 
                className="text-secondary hover:text-white underline"
                onClick={(e) => {
                  e.preventDefault();
                  handleSearch("Sapiens");
                }}
              >
                Sapiens
              </a>
            </div>
          </div>

          <div className="hidden md:block md:w-1/2 mt-8 md:mt-0">
            <div className="relative">
              <div className="absolute top-0 right-0 w-64 h-80 bg-accent-dark rounded-lg transform rotate-6 opacity-20"></div>
              <div className="absolute top-10 right-10 w-64 h-80 bg-primary-light rounded-lg transform -rotate-3 opacity-30"></div>
              <div className="relative w-72 h-96 mx-auto bg-white rounded-lg shadow-xl overflow-hidden border-t-8 border-accent">
                <div className="h-full p-6 flex flex-col">
                  <div className="text-center mb-4">
                    <h3 className="font-serif text-xl font-bold text-primary">著名人のおすすめ書籍</h3>
                    <p className="text-sm text-gray-600">知識と知恵の宝庫</p>
                  </div>

                  {/* Book list preview */}
                  <div className="space-y-4 flex-grow overflow-hidden">
                    {books.slice(0, 3).map((book: Book) => (
                      <div 
                        key={book.id}
                        className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded transition-colors cursor-pointer"
                        onClick={() => setLocation(`/books/${book.id}`)}
                      >
                        <div className="flex-shrink-0 w-10 h-14 bg-primary-light rounded relative">
                          <div className="absolute left-0 top-0 w-1 h-full bg-primary-dark"></div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800 line-clamp-1">{book.title}</h4>
                          <p className="text-sm text-gray-600">by {book.author}</p>
                          {book.id && (
                            <p className="text-xs text-accent">推薦者: {
                              books.find(b => b.id === book.id)?.id ? "1名" : "複数名"
                            }</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 text-center">
                    <a 
                      href="#books" 
                      className="text-accent hover:text-accent-dark font-medium inline-flex items-center"
                      onClick={(e) => {
                        e.preventDefault();
                        setLocation("/books");
                      }}
                    >
                      すべて見る <i className="ri-arrow-right-line ml-1"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
