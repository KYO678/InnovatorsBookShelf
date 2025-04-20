import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  combinedInsertSchema, 
  CombinedInsert, 
  Book, 
  BookRecommendationCSV, 
  Recommender,
  EditBookFormValues,
  EditRecommenderFormValues,
  CompleteRecommendation,
  Recommendation
} from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { importBooksFromCSV } from "@/lib/csv-parser";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Edit } from "lucide-react";
import CreateRecommendationForm from "@/components/CreateRecommendationForm";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import AdminBookForm from "@/components/AdminBookForm";
import EditBookForm from "@/components/EditBookForm";
import EditRecommenderForm from "@/components/EditRecommenderForm";
import EditRecommendationForm from "@/components/EditRecommendationForm";

const Admin = () => {
  const { toast } = useToast();
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  
  // State for edit dialogs
  const [isEditBookDialogOpen, setIsEditBookDialogOpen] = useState(false);
  const [isEditRecommenderDialogOpen, setIsEditRecommenderDialogOpen] = useState(false);
  const [isCreateRecommendationDialogOpen, setIsCreateRecommendationDialogOpen] = useState(false);
  const [isEditRecommendationDialogOpen, setIsEditRecommendationDialogOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedRecommender, setSelectedRecommender] = useState<Recommender | null>(null);
  const [selectedRecommendation, setSelectedRecommendation] = useState<CompleteRecommendation | null>(null);
  
  // Search state for recommendations
  const [searchRecommendationQuery, setSearchRecommendationQuery] = useState('');
  
  // Search state
  const [searchBookQuery, setSearchBookQuery] = useState('');
  const [searchRecommenderQuery, setSearchRecommenderQuery] = useState('');

  // Fetch all books and recommenders for the table
  const { data: books = [], isLoading: isLoadingBooks } = useQuery<Book[]>({
    queryKey: ['/api/books'],
  });
  
  const { data: recommenders = [], isLoading: isLoadingRecommenders } = useQuery<Recommender[]>({
    queryKey: ['/api/recommenders'],
  });
  
  // 全書籍の推薦情報を取得
  const { data: allRecommendations = [], isLoading: isLoadingRecommendations } = useQuery<CompleteRecommendation[]>({
    queryKey: ['/api/books/all/recommendations'],
    queryFn: async () => {
      // すべての書籍から推薦情報を取得
      const bookPromises = books.map(async (book) => {
        const response = await fetch(`/api/books/${book.id}/recommenders`);
        const recommendations = await response.json();
        return recommendations.map((rec: any) => ({
          ...rec,
          book,
          recommender: recommenders.find(r => r.id === rec.recommenderId)
        }));
      });
      
      const allRecs = await Promise.all(bookPromises);
      return allRecs.flat();
    },
    enabled: books.length > 0 && recommenders.length > 0,
  });
  
  // Filter books and recommenders based on search queries
  const filteredBooks = books.filter((book) => {
    if (!searchBookQuery) return true;
    const query = searchBookQuery.toLowerCase();
    return (
      book.title.toLowerCase().includes(query) || 
      book.author.toLowerCase().includes(query) ||
      (book.category && book.category.toLowerCase().includes(query))
    );
  });
  
  const filteredRecommenders = recommenders.filter((recommender) => {
    if (!searchRecommenderQuery) return true;
    const query = searchRecommenderQuery.toLowerCase();
    return (
      recommender.name.toLowerCase().includes(query) || 
      (recommender.organization && recommender.organization.toLowerCase().includes(query)) ||
      (recommender.industry && recommender.industry.toLowerCase().includes(query))
    );
  });
  
  // 推薦情報のフィルタリング
  const filteredRecommendations = allRecommendations.filter((recommendation) => {
    if (!searchRecommendationQuery) return true;
    const query = searchRecommendationQuery.toLowerCase();
    return (
      recommendation.book?.title.toLowerCase().includes(query) || 
      recommendation.book?.author.toLowerCase().includes(query) ||
      recommendation.recommender?.name.toLowerCase().includes(query) ||
      (recommendation.comment && recommendation.comment.toLowerCase().includes(query)) ||
      (recommendation.reason && recommendation.reason.toLowerCase().includes(query))
    );
  });
  
  // Book update mutation
  const updateBookMutation = useMutation({
    mutationFn: async (data: EditBookFormValues & { id: number }) => {
      const { id, ...bookData } = data;
      const response = await apiRequest('PUT', `/api/admin/books/${id}`, bookData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/books'] });
      setIsEditBookDialogOpen(false);
      toast({
        title: "書籍の更新に成功しました",
        description: "書籍情報が更新されました。",
      });
    },
    onError: (error: any) => {
      toast({
        title: "エラーが発生しました",
        description: error.message || "書籍の更新中にエラーが発生しました。",
        variant: "destructive",
      });
    },
  });
  
  // Recommender update mutation
  const updateRecommenderMutation = useMutation({
    mutationFn: async (data: EditRecommenderFormValues & { id: number }) => {
      const { id, ...recommenderData } = data;
      const response = await apiRequest('PUT', `/api/admin/recommenders/${id}`, recommenderData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recommenders'] });
      setIsEditRecommenderDialogOpen(false);
      toast({
        title: "推薦者の更新に成功しました",
        description: "推薦者情報が更新されました。",
      });
    },
    onError: (error: any) => {
      toast({
        title: "エラーが発生しました",
        description: error.message || "推薦者の更新中にエラーが発生しました。",
        variant: "destructive",
      });
    },
  });
  
  // Handlers for opening edit dialogs
  const openEditBookDialog = (book: Book) => {
    setSelectedBook(book);
    setIsEditBookDialogOpen(true);
  };
  
  const openEditRecommenderDialog = (recommender: Recommender) => {
    setSelectedRecommender(recommender);
    setIsEditRecommenderDialogOpen(true);
  };
  
  // Handlers for submitting edits
  const handleBookUpdate = (data: EditBookFormValues) => {
    if (selectedBook) {
      updateBookMutation.mutate({ ...data, id: selectedBook.id });
    }
  };
  
  const handleRecommenderUpdate = (data: EditRecommenderFormValues) => {
    if (selectedRecommender) {
      updateRecommenderMutation.mutate({ ...data, id: selectedRecommender.id });
    }
  };
  
  // Book delete mutation
  const deleteBookMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/admin/books/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/books'] });
      toast({
        title: "書籍の削除に成功しました",
        description: "書籍および関連する推薦情報が削除されました。",
      });
    },
    onError: (error: any) => {
      toast({
        title: "エラーが発生しました",
        description: error.message || "書籍の削除中にエラーが発生しました。",
        variant: "destructive",
      });
    },
  });
  
  // Recommender delete mutation
  const deleteRecommenderMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/admin/recommenders/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recommenders'] });
      toast({
        title: "推薦者の削除に成功しました",
        description: "推薦者および関連する推薦情報が削除されました。",
      });
    },
    onError: (error: any) => {
      toast({
        title: "エラーが発生しました",
        description: error.message || "推薦者の削除中にエラーが発生しました。",
        variant: "destructive",
      });
    },
  });
  
  // Create recommendation mutation
  const createRecommendationMutation = useMutation({
    mutationFn: async (data: { bookId: string; recommenderId: string; comment?: string; reason?: string }) => {
      const payload = {
        bookId: parseInt(data.bookId),
        recommenderId: parseInt(data.recommenderId),
        comment: data.comment || null,
        reason: data.reason || null
      };
      const response = await apiRequest('POST', '/api/admin/recommendations', payload);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/books'] });
      queryClient.invalidateQueries({ queryKey: ['/api/recommenders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/books/all/recommendations'] });
      setIsCreateRecommendationDialogOpen(false);
      toast({
        title: "推薦の作成に成功しました",
        description: "書籍と推薦者の紐づけが完了しました。",
      });
    },
    onError: (error: any) => {
      toast({
        title: "エラーが発生しました",
        description: error.message || "推薦の作成中にエラーが発生しました。",
        variant: "destructive",
      });
    },
  });
  
  // Update recommendation mutation
  const updateRecommendationMutation = useMutation({
    mutationFn: async (data: any) => {
      const { id, ...recommendationData } = data;
      const response = await apiRequest('PUT', `/api/admin/recommendations/${id}`, recommendationData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/books'] });
      queryClient.invalidateQueries({ queryKey: ['/api/recommenders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/books/all/recommendations'] });
      setIsEditRecommendationDialogOpen(false);
      toast({
        title: "推薦情報の更新に成功しました",
        description: "推薦情報が更新されました。",
      });
    },
    onError: (error: any) => {
      toast({
        title: "エラーが発生しました",
        description: error.message || "推薦情報の更新中にエラーが発生しました。",
        variant: "destructive",
      });
    },
  });
  
  // Handler for creating a recommendation
  const handleCreateRecommendation = (data: any) => {
    createRecommendationMutation.mutate(data);
  };
  
  // Handler for opening edit recommendation dialog
  const openEditRecommendationDialog = (recommendation: CompleteRecommendation) => {
    setSelectedRecommendation(recommendation);
    setIsEditRecommendationDialogOpen(true);
  };
  
  // Handler for updating a recommendation
  const handleRecommendationUpdate = (data: any) => {
    if (selectedRecommendation) {
      updateRecommendationMutation.mutate({ ...data, id: selectedRecommendation.id });
    }
  };

  // Add book mutation
  const addBookMutation = useMutation({
    mutationFn: async (data: CombinedInsert) => {
      const response = await apiRequest('POST', '/api/admin/books', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/books'] });
      queryClient.invalidateQueries({ queryKey: ['/api/recommenders'] });
      form.reset();
      toast({
        title: "書籍の追加に成功しました",
        description: "新しい書籍とその推薦情報が登録されました。",
      });
    },
    onError: (error: any) => {
      toast({
        title: "エラーが発生しました",
        description: error.message || "書籍の追加中にエラーが発生しました。",
        variant: "destructive",
      });
    },
  });

  // Import CSV books
  const importCsvMutation = useMutation({
    mutationFn: async (data: BookRecommendationCSV[]) => {
      const response = await apiRequest('POST', '/api/admin/import-csv', data);
      return response.json();
    },
    onSuccess: (data) => {
      // インポート結果から適切なメッセージを表示
      const importCount = data.count || 0;
      const totalCount = data.total || data.count || 0;
      const skippedCount = data.skipped || 0;
      
      let description = `${importCount}冊の書籍をインポートしました。`;
      if (skippedCount > 0) {
        description += ` ${skippedCount}冊は重複のためスキップされました。`;
      }
      
      // キャッシュを徹底的に無効化して最新データを取得する
      queryClient.invalidateQueries();
      
      toast({
        title: "インポートに成功しました",
        description: description,
      });
      setCsvFile(null);
    },
    onError: (error: any) => {
      toast({
        title: "インポートエラー",
        description: error.message || "CSVファイルのインポート中にエラーが発生しました。",
        variant: "destructive",
      });
    }
  });
  
  const handleCsvImport = async () => {
    if (!csvFile) {
      toast({
        title: "ファイルが選択されていません",
        description: "CSVファイルを選択してください。",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    try {
      const books = await importBooksFromCSV(csvFile);
      await importCsvMutation.mutateAsync(books);
    } catch (error: any) {
      toast({
        title: "インポートエラー",
        description: error.message || "CSVファイルのインポート中にエラーが発生しました。",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  // Form for adding a new book
  const form = useForm<CombinedInsert>({
    resolver: zodResolver(combinedInsertSchema),
    defaultValues: {
      title: "",
      author: "",
      category: "",
      recommenderName: "",
      recommenderOrg: "",
      industry: "",
      comment: "",
      recommendationDate: "",
      recommendationMedium: "",
      reason: "",
    },
  });

  const onSubmit = (data: CombinedInsert) => {
    addBookMutation.mutate(data);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">
        管理者ページ
      </h1>
      
      <div className="flex justify-between items-center mb-6">
        <div className="w-auto"></div>
        
        <Button onClick={() => setIsCreateRecommendationDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          書籍と推薦者を紐づける
        </Button>
      </div>

      <Tabs defaultValue="add-book">
        <TabsList className="mb-6">
          <TabsTrigger value="add-book">書籍の追加</TabsTrigger>
          <TabsTrigger value="import-csv">CSVインポート</TabsTrigger>
          <TabsTrigger value="manage-books">書籍の管理</TabsTrigger>
          <TabsTrigger value="manage-recommenders">推薦者の管理</TabsTrigger>
          <TabsTrigger value="manage-recommendations">推薦情報の管理</TabsTrigger>
        </TabsList>
        
        <TabsContent value="add-book">
          <Card>
            <CardHeader>
              <CardTitle>新しい書籍の追加</CardTitle>
              <CardDescription>
                新しい書籍と推薦情報を追加します。必須項目を入力してください。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdminBookForm 
                form={form} 
                onSubmit={onSubmit} 
                isSubmitting={addBookMutation.isPending} 
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="import-csv">
          <Card>
            <CardHeader>
              <CardTitle>CSVファイルからインポート</CardTitle>
              <CardDescription>
                書籍データをCSVファイルからインポートします。CSVファイルは以下のフォーマットにしてください:
                書籍タイトル,著者名,推薦者（所属）,推薦コメント,推薦時期・媒体,推薦理由・背景
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Input
                    type="file"
                    accept=".csv"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setCsvFile(e.target.files[0]);
                      }
                    }}
                  />
                  <Button 
                    onClick={handleCsvImport} 
                    disabled={!csvFile || isImporting}
                  >
                    {isImporting ? "インポート中..." : "インポート"}
                  </Button>
                </div>
                
                {csvFile && (
                  <div className="text-sm text-gray-500">
                    選択されたファイル: {csvFile.name} ({(csvFile.size / 1024).toFixed(2)} KB)
                  </div>
                )}
                
                <div className="bg-secondary p-4 rounded-md text-sm">
                  <h3 className="font-medium mb-2">CSVフォーマット例:</h3>
                  <code className="block whitespace-pre-wrap">
                    書籍タイトル,著者名,推薦者（所属）,推薦コメント,推薦時期・媒体,推薦理由・背景<br/>
                    Business Adventures,John Brooks,Bill Gates (Microsoft創業者),1991年にウォーレン・バフェットから勧められて以来、今でも最高のビジネス書だ。,2014年 Gates Blog,バフェットから紹介され、ゲイツが"最も愛読する経営書"として再三言及
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="manage-books">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>書籍の管理</CardTitle>
                <CardDescription>
                  登録されているすべての書籍を表示・編集します。
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Input 
                  placeholder="書籍を検索..." 
                  className="max-w-xs"
                  value={searchBookQuery}
                  onChange={(e) => setSearchBookQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingBooks ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ) : books.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>表紙</TableHead>
                        <TableHead>タイトル</TableHead>
                        <TableHead>著者</TableHead>
                        <TableHead>カテゴリー</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBooks.map((book: Book) => (
                        <TableRow key={book.id}>
                          <TableCell>{book.id}</TableCell>
                          <TableCell>
                            {book.imageUrl ? (
                              <img 
                                src={book.imageUrl} 
                                alt={book.title} 
                                className="w-12 h-16 object-cover rounded border border-gray-200"
                              />
                            ) : (
                              <div className="w-12 h-16 bg-gray-100 flex items-center justify-center rounded text-gray-400 text-xs">
                                No Image
                              </div>
                            )}
                          </TableCell>
                          <TableCell>{book.title}</TableCell>
                          <TableCell>{book.author}</TableCell>
                          <TableCell>{book.category || '-'}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditBookDialog(book)}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                編集
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  if (confirm(`"${book.title}"を削除してもよろしいですか？関連する推薦情報もすべて削除されます。`)) {
                                    deleteBookMutation.mutate(book.id);
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                削除
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500">書籍が登録されていません。</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
          
        <TabsContent value="manage-recommenders">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>推薦者の管理</CardTitle>
                <CardDescription>
                  登録されているすべての推薦者を表示・編集します。
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Input 
                  placeholder="推薦者を検索..." 
                  className="max-w-xs"
                  value={searchRecommenderQuery}
                  onChange={(e) => setSearchRecommenderQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingRecommenders ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ) : recommenders.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>プロフィール</TableHead>
                        <TableHead>名前</TableHead>
                        <TableHead>所属</TableHead>
                        <TableHead>業界</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecommenders.map((recommender: Recommender) => (
                        <TableRow key={recommender.id}>
                          <TableCell>{recommender.id}</TableCell>
                          <TableCell>
                            {recommender.imageUrl ? (
                              <img 
                                src={recommender.imageUrl} 
                                alt={recommender.name} 
                                className="w-10 h-10 object-cover rounded-full border border-gray-200"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gray-100 flex items-center justify-center rounded-full text-gray-400 text-xs">
                                No Image
                              </div>
                            )}
                          </TableCell>
                          <TableCell>{recommender.name}</TableCell>
                          <TableCell>{recommender.organization || '-'}</TableCell>
                          <TableCell>{recommender.industry || '-'}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditRecommenderDialog(recommender)}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                編集
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  if (confirm(`"${recommender.name}"を削除してもよろしいですか？関連する推薦情報もすべて削除されます。`)) {
                                    deleteRecommenderMutation.mutate(recommender.id);
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                削除
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500">推薦者が登録されていません。</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="manage-recommendations">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>推薦情報の管理</CardTitle>
                <CardDescription>
                  すべての書籍と推薦者の紐づけを表示・編集します。
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Input 
                  placeholder="推薦情報を検索..." 
                  className="max-w-xs"
                  value={searchRecommendationQuery}
                  onChange={(e) => setSearchRecommendationQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingBooks || isLoadingRecommenders || isLoadingRecommendations ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ) : allRecommendations.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>書籍</TableHead>
                        <TableHead>推薦者</TableHead>
                        <TableHead>コメント</TableHead>
                        <TableHead>推薦時期</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecommendations.map((recommendation: CompleteRecommendation) => (
                        <TableRow key={recommendation.id}>
                          <TableCell>{recommendation.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {recommendation.book?.imageUrl ? (
                                <img 
                                  src={recommendation.book.imageUrl} 
                                  alt={recommendation.book?.title} 
                                  className="w-8 h-12 object-cover rounded border border-gray-200"
                                />
                              ) : null}
                              <span className="font-medium text-sm">{recommendation.book?.title}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {recommendation.recommender?.imageUrl ? (
                                <img 
                                  src={recommendation.recommender.imageUrl} 
                                  alt={recommendation.recommender?.name} 
                                  className="w-8 h-8 object-cover rounded-full border border-gray-200"
                                />
                              ) : null}
                              <span>{recommendation.recommender?.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {recommendation.comment || '-'}
                          </TableCell>
                          <TableCell>
                            {recommendation.recommendationDate || '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditRecommendationDialog(recommendation)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              詳細編集
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500">推薦情報が登録されていません。</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 書籍編集ダイアログ */}
      <Dialog open={isEditBookDialogOpen} onOpenChange={setIsEditBookDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>書籍情報の編集</DialogTitle>
            <DialogDescription>
              書籍の情報を更新します。変更後、「更新」ボタンをクリックしてください。
            </DialogDescription>
          </DialogHeader>
          
          {selectedBook && (
            <EditBookForm 
              book={selectedBook} 
              onSubmit={handleBookUpdate} 
              isSubmitting={updateBookMutation.isPending} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* 推薦者編集ダイアログ */}
      <Dialog open={isEditRecommenderDialogOpen} onOpenChange={setIsEditRecommenderDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>推薦者情報の編集</DialogTitle>
            <DialogDescription>
              推薦者の情報を更新します。変更後、「更新」ボタンをクリックしてください。
            </DialogDescription>
          </DialogHeader>
          
          {selectedRecommender && (
            <EditRecommenderForm 
              recommender={selectedRecommender} 
              onSubmit={handleRecommenderUpdate} 
              isSubmitting={updateRecommenderMutation.isPending} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* 推薦作成ダイアログ */}
      <Dialog open={isCreateRecommendationDialogOpen} onOpenChange={setIsCreateRecommendationDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>書籍と推薦者の紐づけ</DialogTitle>
            <DialogDescription>
              既存の書籍と推薦者を関連付けて新しい推薦を作成します。
            </DialogDescription>
          </DialogHeader>
          
          <CreateRecommendationForm 
            books={books}
            recommenders={recommenders}
            onSubmit={handleCreateRecommendation}
            isSubmitting={createRecommendationMutation.isPending}
          />
        </DialogContent>
      </Dialog>
      
      {/* 推薦情報編集ダイアログ */}
      <Dialog open={isEditRecommendationDialogOpen} onOpenChange={setIsEditRecommendationDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>推薦情報の詳細編集</DialogTitle>
            <DialogDescription>
              推薦情報の詳細を編集します。コメント、推薦時期、媒体、理由などを更新できます。
            </DialogDescription>
          </DialogHeader>
          
          {selectedRecommendation && (
            <EditRecommendationForm 
              recommendation={selectedRecommendation}
              books={books}
              recommenders={recommenders}
              onSubmit={handleRecommendationUpdate}
              isSubmitting={updateRecommendationMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default Admin;