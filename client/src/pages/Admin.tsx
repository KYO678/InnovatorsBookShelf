import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { combinedInsertSchema, CombinedInsert, Book, BookRecommendationCSV } from "@shared/schema";
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
import AdminBookForm from "@/components/AdminBookForm";

const Admin = () => {
  const { toast } = useToast();
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Fetch all books for the table
  const { data: books = [], isLoading: isLoadingBooks } = useQuery({
    queryKey: ['/api/books'],
  });

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
      
      // Submit each book one by one
      for (const book of books) {
        await addBookMutation.mutateAsync({
          title: book.title,
          author: book.author,
          category: book.category,
          recommenderName: book.recommenderName,
          recommenderOrg: book.recommenderOrg,
          industry: undefined,
          comment: book.comment,
          recommendationDate: book.recommendationDate.split(' ')[0], // Extract year
          recommendationMedium: book.recommendationDate.split(' ').slice(1).join(' '), // Extract medium
          reason: book.reason,
        });
      }
      
      toast({
        title: "インポートに成功しました",
        description: `${books.length}冊の書籍をインポートしました。`,
      });
      setCsvFile(null);
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
            <CardHeader>
              <CardTitle>書籍の管理</CardTitle>
              <CardDescription>
                登録されているすべての書籍を表示します。
              </CardDescription>
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
                        <TableHead>タイトル</TableHead>
                        <TableHead>著者</TableHead>
                        <TableHead>カテゴリー</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {books.map((book: Book) => (
                        <TableRow key={book.id}>
                          <TableCell>{book.id}</TableCell>
                          <TableCell>{book.title}</TableCell>
                          <TableCell>{book.author}</TableCell>
                          <TableCell>{book.category || '-'}</TableCell>
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
      </Tabs>
    </main>
  );
};

export default Admin;
