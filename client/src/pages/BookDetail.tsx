import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import BookSpine from "@/components/BookSpine";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Book, CompleteRecommendation } from "@shared/schema";

const BookDetail = () => {
  const { id } = useParams();
  const [_, setLocation] = useLocation();
  const bookId = parseInt(id);

  // Fetch book details
  const { data: book, isLoading: isLoadingBook } = useQuery({
    queryKey: [`/api/books/${bookId}`],
    enabled: !isNaN(bookId),
  });

  // Fetch book recommendations
  const { data: recommendations = [], isLoading: isLoadingRecommendations } = useQuery({
    queryKey: [`/api/books/${bookId}/recommenders`],
    enabled: !isNaN(bookId),
  });

  // Find related books (books recommended by the same recommenders)
  const { data: allBooks = [] } = useQuery({
    queryKey: ["/api/books"],
  });

  const relatedBooks = recommendations.length > 0
    ? allBooks.filter((b: Book) => 
        b.id !== bookId && 
        recommendations.some((rec: CompleteRecommendation) => 
          allBooks.some((book: Book) => 
            book.id !== bookId && 
            recommendations.some((r: CompleteRecommendation) => 
              r.recommenderId === rec.recommenderId && book.id === r.bookId
            )
          )
        )
      )
    : [];

  if (isNaN(bookId)) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-serif font-bold text-gray-900 mb-4">
            無効な書籍ID
          </h1>
          <p className="text-gray-500 mb-6">
            申し訳ありませんが、指定された書籍IDは無効です。
          </p>
          <Button onClick={() => setLocation("/books")}>
            書籍一覧に戻る
          </Button>
        </div>
      </div>
    );
  }

  if (isLoadingBook || isLoadingRecommendations) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded-lg mb-6"></div>
          <div className="h-8 bg-gray-200 rounded mb-2 w-1/4"></div>
          <div className="h-24 bg-gray-200 rounded mb-6"></div>
          <div className="h-8 bg-gray-200 rounded mb-2 w-1/4"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-serif font-bold text-gray-900 mb-4">
            書籍が見つかりません
          </h1>
          <p className="text-gray-500 mb-6">
            申し訳ありませんが、指定された書籍は見つかりませんでした。
          </p>
          <Button onClick={() => setLocation("/books")}>
            書籍一覧に戻る
          </Button>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => setLocation("/books")}
          className="text-gray-600"
        >
          <i className="ri-arrow-left-line mr-2"></i>
          書籍一覧に戻る
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="p-6">
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
            {book.title}
          </h1>
          <p className="text-xl text-gray-600 mb-6">{book.author}</p>
          
          <div className="md:flex">
            <div className="md:w-1/3 mb-6 md:mb-0 md:pr-6">
              <div className="bg-secondary-light p-6 rounded-lg shadow-inner flex items-center justify-center">
                {book.imageUrl ? (
                  <img 
                    src={book.imageUrl} 
                    alt={`${book.title}の表紙`} 
                    className="w-32 h-auto max-h-48 object-contain shadow-md rounded" 
                  />
                ) : (
                  <div className="relative w-32 h-48">
                    <BookSpine title={book.title} />
                  </div>
                )}
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center">
                  <div className="w-24 text-sm font-medium text-gray-600">タイトル:</div>
                  <div className="text-gray-800">{book.title}</div>
                </div>
                <div className="flex items-center">
                  <div className="w-24 text-sm font-medium text-gray-600">著者:</div>
                  <div className="text-gray-800">{book.author}</div>
                </div>
                {book.publishYear && (
                  <div className="flex items-center">
                    <div className="w-24 text-sm font-medium text-gray-600">出版年:</div>
                    <div className="text-gray-800">{book.publishYear}</div>
                  </div>
                )}
                {book.category && (
                  <div className="flex items-center">
                    <div className="w-24 text-sm font-medium text-gray-600">カテゴリ:</div>
                    <div className="text-gray-800">
                      <span className="bg-secondary-dark text-accent-dark text-xs font-medium px-2 py-1 rounded">
                        {book.category}
                      </span>
                    </div>
                  </div>
                )}
                <div className="flex items-center">
                  <div className="w-24 text-sm font-medium text-gray-600">推薦者数:</div>
                  <div className="text-gray-800">{recommendations.length}名</div>
                </div>
                
                {book.description && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-sm font-medium text-gray-600 mb-1">書籍の説明:</div>
                    <div className="text-gray-800">{book.description}</div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="md:w-2/3">
              <h2 className="font-serif text-xl font-bold text-gray-800 mb-4">推薦情報</h2>
              
              <ScrollArea className="h-[400px] rounded-md border p-4">
                <div className="space-y-6">
                  {recommendations.length > 0 ? (
                    recommendations.map((rec: CompleteRecommendation) => (
                      <div key={rec.id} className="bg-paper rounded-lg p-4">
                        <div className="flex items-center mb-3">
                          <div className="w-12 h-12 rounded-full bg-primary-light text-white flex items-center justify-center overflow-hidden mr-4">
                            <span className="text-xl">{rec.recommender.name.charAt(0)}</span>
                          </div>
                          <div>
                            <h3 
                              className="font-medium text-gray-800 hover:text-accent cursor-pointer"
                              onClick={() => setLocation(`/recommenders/${rec.recommender.id}`)}
                            >
                              {rec.recommender.name}
                            </h3>
                            <p className="text-sm text-gray-600">{rec.recommender.organization}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          {rec.comment && (
                            <div>
                              <div className="text-sm font-medium text-gray-600">推薦コメント:</div>
                              <p className="text-gray-800">{rec.comment}</p>
                            </div>
                          )}
                          {rec.recommendationDate && (
                            <div className="flex">
                              <div className="text-sm font-medium text-gray-600 mr-2">推薦時期・媒体:</div>
                              <p className="text-gray-800">
                                {rec.recommendationDate}
                                {rec.recommendationMedium && ` ${rec.recommendationMedium}`}
                              </p>
                            </div>
                          )}
                          
                          {rec.source && (
                            <div className="flex">
                              <div className="text-sm font-medium text-gray-600 mr-2">出所情報:</div>
                              <p className="text-gray-800">
                                {rec.source}
                                {rec.sourceUrl && (
                                  <a 
                                    href={rec.sourceUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="ml-2 text-accent hover:text-accent-dark underline"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <i className="ri-external-link-line"></i> リンク
                                  </a>
                                )}
                              </p>
                            </div>
                          )}
                          {rec.reason && (
                            <div>
                              <div className="text-sm font-medium text-gray-600">推薦理由・背景:</div>
                              <p className="text-gray-800">{rec.reason}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-gray-500">この書籍の推薦情報はまだありません。</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
              
              {relatedBooks.length > 0 && (
                <div className="mt-6">
                  <h2 className="font-serif text-xl font-bold text-gray-800 mb-4">関連書籍</h2>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {relatedBooks.slice(0, 3).map((relatedBook: Book) => (
                      <div 
                        key={relatedBook.id} 
                        className="bg-secondary-light rounded-lg p-3 text-center cursor-pointer hover:bg-secondary-dark transition-colors"
                        onClick={() => setLocation(`/books/${relatedBook.id}`)}
                      >
                        {relatedBook.imageUrl ? (
                          <div className="w-full h-24 mb-2 rounded overflow-hidden">
                            <img 
                              src={relatedBook.imageUrl} 
                              alt={`${relatedBook.title}の表紙`} 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                        ) : (
                          <div className="w-full h-20 bg-primary-light mb-2 rounded relative overflow-hidden">
                            <div className="absolute left-0 top-0 w-3 h-full bg-primary-dark rounded-l"></div>
                            <div className="h-full flex items-center justify-center">
                              <span className="text-white text-sm font-medium px-2">{relatedBook.title}</span>
                            </div>
                          </div>
                        )}
                        <div className="text-sm font-medium text-gray-800 truncate">{relatedBook.title}</div>
                        <div className="text-xs text-gray-600">{relatedBook.author}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default BookDetail;
