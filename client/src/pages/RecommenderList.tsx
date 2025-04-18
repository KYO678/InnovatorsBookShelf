import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import RecommenderCard from "@/components/RecommenderCard";
import { Button } from "@/components/ui/button";
import { Recommender } from "@shared/schema";

const RecommenderList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [industryFilter, setIndustryFilter] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const recommendersPerPage = 9;

  // Fetch recommenders
  const { data: recommenders = [], isLoading } = useQuery({
    queryKey: ["/api/recommenders"],
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

  // Get unique industries for filter options
  const industries = Array.from(
    new Set(
      recommenders
        .map((r: Recommender) => r.industry)
        .filter(Boolean) as string[]
    )
  );

  // Toggle industry filter
  const toggleIndustryFilter = (industry: string) => {
    setIndustryFilter(prev => 
      prev.includes(industry) 
        ? prev.filter(i => i !== industry) 
        : [...prev, industry]
    );
    setCurrentPage(1); // Reset to first page on filter change
  };

  // Filter and sort recommenders
  const filteredRecommenders = recommenders
    .filter((recommender: Recommender) => {
      // Apply text search
      const matchesSearch = 
        recommender.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (recommender.organization && recommender.organization.toLowerCase().includes(searchQuery.toLowerCase()));
        
      // Apply industry filter
      const matchesIndustry = 
        industryFilter.length === 0 || // No industries selected
        (recommender.industry && industryFilter.includes(recommender.industry));
        
      return matchesSearch && matchesIndustry;
    })
    .sort((a: Recommender, b: Recommender) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "organization") {
        return (a.organization || "").localeCompare(b.organization || "");
      }
      return 0;
    });
    
  // Pagination
  const totalPages = Math.ceil(filteredRecommenders.length / recommendersPerPage);
  const indexOfLastRecommender = currentPage * recommendersPerPage;
  const indexOfFirstRecommender = indexOfLastRecommender - recommendersPerPage;
  const currentRecommenders = filteredRecommenders.slice(indexOfFirstRecommender, indexOfLastRecommender);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">
        推薦者一覧
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
            placeholder="推薦者名または所属で検索"
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
              <option value="name">名前順</option>
              <option value="organization">所属順</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <i className="ri-arrow-down-s-line"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Industry filters */}
      {industries.length > 0 && (
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-2">業界でフィルター:</p>
          <div className="flex flex-wrap gap-2">
            {industries.map(industry => (
              <button
                key={industry}
                onClick={() => toggleIndustryFilter(industry)}
                className={`px-3 py-1 rounded-full text-sm ${
                  industryFilter.includes(industry)
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                {industry}
              </button>
            ))}
            {industryFilter.length > 0 && (
              <button 
                onClick={() => setIndustryFilter([])}
                className="text-gray-500 hover:text-gray-700 text-sm underline ml-2"
              >
                フィルターをクリア
              </button>
            )}
          </div>
        </div>
      )}

      {/* Recommenders Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(9).fill(0).map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      ) : currentRecommenders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentRecommenders.map((recommender: Recommender) => (
            <RecommenderCard key={recommender.id} recommender={recommender} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500">該当する推薦者が見つかりませんでした。</p>
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
    </main>
  );
};

export default RecommenderList;
