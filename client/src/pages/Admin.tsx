import { useState, useEffect } from "react";
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
  EditRecommenderFormValues
} from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { importBooksFromCSV } from "@/lib/csv-parser";
import { useToast } from "@/hooks/use-toast";

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
import AdminBookForm from "@/components/AdminBookForm";
import EditBookForm from "@/components/EditBookForm";
import EditRecommenderForm from "@/components/EditRecommenderForm";

const Admin = () => {
  const { toast } = useToast();
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  
  // State for edit dialogs
  const [isEditBookDialogOpen, setIsEditBookDialogOpen] = useState(false);
  const [isEditRecommenderDialogOpen, setIsEditRecommenderDialogOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedRecommender, setSelectedRecommender] = useState<Recommender | null>(null);
  
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
      queryClient.invalidateQueries({ queryKey: ['/api/books'] });
      queryClient.invalidateQueries({ queryKey: ['/api/recommenders'] });
      toast({
        title: "インポートに成功しました",
        description: `${data.count}冊の書籍をインポートしました。`,
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
      
      <Tabs defaultValue="add-book">
        <TabsList className="mb-6">
          <TabsTrigger value="add-book">書籍の追加</TabsTrigger>
          <TabsTrigger value="import-csv">CSVインポート</TabsTrigger>
          <TabsTrigger value="manage-books">書籍の管理</TabsTrigger>
          <TabsTrigger value="manage-recommenders">推薦者の管理</TabsTrigger>
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
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditBookDialog(book)}
                            >
                              編集
                            </Button>
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
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditRecommenderDialog(recommender)}
                            >
                              編集
                            </Button>
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
    </main>
  );
};

export default Admin;
