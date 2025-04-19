import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Book, Recommender } from "@shared/schema";

interface BookCardProps {
  book: Book;
}

const BookCard = ({ book }: BookCardProps) => {
  const [_, setLocation] = useLocation();

  // Fetch recommenders for this book
  const { data: recommenders = [], isLoading } = useQuery({
    queryKey: [`/api/books/${book.id}/recommenders`],
  });

  const handleCardClick = () => {
    setLocation(`/books/${book.id}`);
  };

  return (
    <div className="book-card relative bg-white rounded-lg overflow-hidden">
      <div className="book-spine" aria-hidden="true"></div>
      <div className="p-5 pl-8">
        <div className="flex items-start mb-2">
          {book.imageUrl && (
            <div className="mr-3 flex-shrink-0">
              <img 
                src={book.imageUrl} 
                alt={`${book.title}の表紙`} 
                className="w-16 h-20 object-cover rounded shadow-sm" 
              />
            </div>
          )}
          <div className="flex-grow">
            <h3 
              className="font-serif text-xl font-bold text-gray-800 mb-1 hover:text-accent cursor-pointer"
              onClick={handleCardClick}
            >
              {book.title}
            </h3>
            <p className="text-gray-600 mb-1">{book.author}</p>
            {book.publishYear && (
              <p className="text-gray-500 text-sm">{book.publishYear}</p>
            )}
          </div>
        </div>
        <div>
          {book.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{book.description}</p>
          )}
        </div>
        
        <div className="flex items-center mb-3">
          {book.category && (
            <div className="bg-secondary-dark text-accent-dark text-xs font-medium px-2 py-1 rounded">
              {book.category}
            </div>
          )}
          <div className="ml-2 flex items-center text-sm text-gray-500">
            <i className="ri-user-star-line mr-1"></i> 推薦者: {isLoading ? "..." : recommenders.length}名
          </div>
        </div>
        
        <div className="mb-4">
          {isLoading ? (
            <div className="h-8 bg-gray-100 rounded animate-pulse"></div>
          ) : recommenders.length > 0 ? (
            <>
              <div className="font-medium text-sm text-gray-700 mb-1">主な推薦者:</div>
              <div className="flex -space-x-2 overflow-hidden">
                {recommenders.slice(0, 3).map((rec: any) => (
                  <div
                    key={rec.recommender.id}
                    className="recommender-avatar inline-block h-8 w-8 rounded-full ring-2 ring-white bg-primary-light text-white flex items-center justify-center"
                    title={rec.recommender.name}
                    onClick={(e) => {
                      e.stopPropagation();
                      setLocation(`/recommenders/${rec.recommender.id}`);
                    }}
                  >
                    <span>{rec.recommender.name.charAt(0)}</span>
                  </div>
                ))}
                {recommenders.length > 3 && (
                  <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-400 text-white flex items-center justify-center">
                    <span>+{recommenders.length - 3}</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="font-medium text-sm text-gray-500">推薦者情報はありません</div>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          {recommenders.length > 0 && recommenders[0].recommendationDate && (
            <div className="text-sm text-gray-500">
              <i className="ri-calendar-line mr-1"></i> 推薦時期: {recommenders[0].recommendationDate}
            </div>
          )}
          <button 
            className="text-accent hover:text-accent-dark font-medium text-sm flex items-center transition-colors"
            onClick={handleCardClick}
          >
            詳細を見る
            <i className="ri-arrow-right-line ml-1"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
