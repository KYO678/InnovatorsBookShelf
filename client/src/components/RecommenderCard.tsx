import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Recommender, Book, CompleteRecommendation } from "@shared/schema";

interface RecommenderCardProps {
  recommender: Recommender;
}

const RecommenderCard = ({ recommender }: RecommenderCardProps) => {
  const [_, setLocation] = useLocation();

  // Fetch books for this recommender
  const { data: recommendations = [], isLoading } = useQuery<CompleteRecommendation[]>({
    queryKey: [`/api/recommenders/${recommender.id}/books`],
  });

  const handleCardClick = () => {
    setLocation(`/recommenders/${recommender.id}`);
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      <div className="w-full h-28 bg-primary-light bg-opacity-20 relative">
        <div className="absolute -bottom-10 left-6">
          {recommender.imageUrl ? (
            <div 
              className="w-20 h-20 rounded-full border-4 border-white shadow-md bg-white flex items-center justify-center cursor-pointer overflow-hidden"
              onClick={handleCardClick}
            >
              <img 
                src={recommender.imageUrl} 
                alt={recommender.name} 
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div 
              className="w-20 h-20 rounded-full border-4 border-white shadow-md bg-primary-light text-white flex items-center justify-center cursor-pointer hover:bg-primary transition-colors"
              onClick={handleCardClick}
            >
              <span className="text-3xl font-medium">{recommender.name.charAt(0)}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="pt-12 p-6">
        <h3 
          className="font-serif text-xl font-bold text-gray-800 mb-1 hover:text-accent cursor-pointer"
          onClick={handleCardClick}
        >
          {recommender.name}
        </h3>
        <p className="text-gray-600 mb-3">{recommender.organization}</p>
        
        <div className="flex items-center mb-4">
          <div className="px-2 py-1 rounded bg-secondary text-primary text-xs font-medium">
            推薦書籍: {isLoading ? "..." : recommendations.length}冊
          </div>
          
          {recommender.industry && (
            <div className="ml-2 px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs">
              {recommender.industry}
            </div>
          )}
        </div>
        
        {isLoading ? (
          <div className="space-y-2 mb-4">
            <div className="h-5 bg-gray-100 rounded animate-pulse"></div>
            <div className="h-5 bg-gray-100 rounded animate-pulse"></div>
            <div className="h-5 bg-gray-100 rounded animate-pulse"></div>
          </div>
        ) : recommendations.length > 0 ? (
          <div className="space-y-2 mb-4">
            {recommendations.slice(0, 3).map((rec: CompleteRecommendation) => (
              <div 
                key={rec.id} 
                className="text-sm hover:text-accent cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setLocation(`/books/${rec.book.id}`);
                }}
              >
                <i className="ri-book-mark-line mr-1 text-primary"></i> {rec.book.title}
              </div>
            ))}
            {recommendations.length > 3 && (
              <div className="text-sm text-gray-500">
                他{recommendations.length - 3}冊...
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-gray-500 mb-4">
            推薦書籍はありません
          </div>
        )}
        
        <button 
          className="w-full mt-2 bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded transition-colors"
          onClick={handleCardClick}
        >
          推薦書籍をすべて見る
        </button>
      </div>
    </div>
  );
};

export default RecommenderCard;
