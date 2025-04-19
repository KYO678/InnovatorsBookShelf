import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Recommender, CompleteRecommendation } from "@shared/schema";
import BookSpine from "@/components/BookSpine";

const RecommenderDetail = () => {
  const { id } = useParams();
  const [_, setLocation] = useLocation();
  const recommenderId = parseInt(id || "0");

  // Fetch recommender details
  const { data: recommender, isLoading: isLoadingRecommender } = useQuery<Recommender>({
    queryKey: [`/api/recommenders/${recommenderId}`],
    enabled: !isNaN(recommenderId) && recommenderId > 0,
  });

  // Fetch recommender's books
  const { data: recommendations = [], isLoading: isLoadingRecommendations } = useQuery<CompleteRecommendation[]>({
    queryKey: [`/api/recommenders/${recommenderId}/books`],
    enabled: !isNaN(recommenderId) && recommenderId > 0,
  });

  if (isNaN(recommenderId)) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-serif font-bold text-gray-900 mb-4">
            無効な推薦者ID
          </h1>
          <p className="text-gray-500 mb-6">
            申し訳ありませんが、指定された推薦者IDは無効です。
          </p>
          <Button onClick={() => setLocation("/recommenders")}>
            推薦者一覧に戻る
          </Button>
        </div>
      </div>
    );
  }

  if (isLoadingRecommender || isLoadingRecommendations) {
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

  if (!recommender) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-serif font-bold text-gray-900 mb-4">
            推薦者が見つかりません
          </h1>
          <p className="text-gray-500 mb-6">
            申し訳ありませんが、指定された推薦者は見つかりませんでした。
          </p>
          <Button onClick={() => setLocation("/recommenders")}>
            推薦者一覧に戻る
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
          onClick={() => setLocation("/recommenders")}
          className="text-gray-600"
        >
          <i className="ri-arrow-left-line mr-2"></i>
          推薦者一覧に戻る
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="w-full h-28 bg-primary-light bg-opacity-20 relative">
          <div className="absolute -bottom-10 left-6">
            <div className="w-20 h-20 rounded-full border-4 border-white shadow-md bg-primary-light text-white flex items-center justify-center">
              <span className="text-3xl">{recommender?.name?.charAt(0) || '?'}</span>
            </div>
          </div>
        </div>
        
        <div className="pt-12 p-6">
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-1">
            {recommender?.name || '不明な推薦者'}
          </h1>
          
          {recommender?.organization && (
            <p className="text-xl text-gray-600 mb-4">{recommender.organization}</p>
          )}
          
          {recommender?.industry && (
            <div className="mb-6">
              <span className="bg-secondary text-primary text-sm font-medium px-3 py-1 rounded-full">
                {recommender.industry}
              </span>
            </div>
          )}
          
          <div className="flex items-center mb-6">
            <div className="bg-secondary text-primary text-sm font-medium px-3 py-1 rounded-full">
              <i className="ri-book-mark-line mr-1"></i> 推薦書籍: {recommendations?.length || 0}冊
            </div>
          </div>
          
          <h2 className="font-serif text-xl font-bold text-gray-800 mb-4">推薦書籍一覧</h2>
          
          <ScrollArea className="h-[500px] rounded-md border">
            <div className="p-4 space-y-6">
              {recommendations && recommendations.length > 0 ? (
                recommendations.map((rec: CompleteRecommendation) => (
                  <div key={`${rec.bookId}_${rec.recommenderId}_${rec.id}`} className="bg-paper rounded-lg p-4">
                    <div className="md:flex">
                      <div className="md:w-1/4 mb-4 md:mb-0">
                        <div 
                          className="relative h-32 w-24 mx-auto md:mx-0 cursor-pointer"
                          onClick={() => setLocation(`/books/${rec.book.id}`)}
                        >
                          <BookSpine title={rec.book.title} />
                        </div>
                      </div>
                      
                      <div className="md:w-3/4">
                        <h3 
                          className="font-serif text-lg font-bold text-gray-800 hover:text-accent cursor-pointer"
                          onClick={() => setLocation(`/books/${rec.book.id}`)}
                        >
                          {rec.book.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">{rec.book.author}</p>
                        
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
                          {rec.reason && (
                            <div>
                              <div className="text-sm font-medium text-gray-600">推薦理由・背景:</div>
                              <p className="text-gray-800">{rec.reason}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500">この推薦者による書籍の推薦はまだありません。</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </main>
  );
};

export default RecommenderDetail;
