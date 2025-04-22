import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { combinedInsertSchema, CombinedInsert, Recommender } from "@shared/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { PlusCircle, User } from "lucide-react";

interface AdminBookFormProps {
  form: ReturnType<typeof useForm<CombinedInsert>>;
  onSubmit: (data: CombinedInsert) => void;
  isSubmitting: boolean;
  recommenders?: Recommender[];
}

const AdminBookForm = ({ form, onSubmit, isSubmitting, recommenders = [] }: AdminBookFormProps) => {
  // Book categories for select dropdown
  const categories = [
    "ビジネス",
    "社会科学",
    "歴史",
    "SF",
    "科学",
    "小説",
    "投資",
    "経営",
    "自己啓発",
    "哲学",
  ];
  
  // 推薦者の選択タイプ
  const [recommenderType, setRecommenderType] = useState<'existing' | 'new'>('new');
  const [selectedRecommenderId, setSelectedRecommenderId] = useState<string>("");

  // フォーム送信時の処理
  const handleFormSubmit = (data: CombinedInsert) => {
    // 既存の推薦者を選択している場合、recommenderNameを設定
    if (recommenderType === 'existing' && selectedRecommenderId) {
      const selectedRecommender = recommenders.find(r => r.id.toString() === selectedRecommenderId);
      if (selectedRecommender) {
        // 選択された推薦者情報で上書き
        data.recommenderName = selectedRecommender.name;
        data.recommenderOrg = selectedRecommender.organization || '';
        data.industry = selectedRecommender.industry || '';
      }
    }
    
    // 送信
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Book Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800 border-b pb-2">書籍情報</h3>
            
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>書籍タイトル <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="書籍タイトルを入力" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="author"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>著者名 <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="著者名を入力" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>カテゴリー</FormLabel>
                  <FormControl>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...field}
                    >
                      <option value="">カテゴリーを選択</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>書籍サムネイル画像URL</FormLabel>
                  <FormControl>
                    <Input placeholder="画像のURLを入力" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="publishYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>出版年</FormLabel>
                  <FormControl>
                    <Input placeholder="例：2018年" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>書籍の説明</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="書籍の内容や概要を入力"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Recommender Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800 border-b pb-2">推薦者情報</h3>
            
            <Tabs defaultValue="new" onValueChange={(val) => setRecommenderType(val as 'existing' | 'new')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="existing" disabled={recommenders.length === 0}>
                  <User className="w-4 h-4 mr-2" />
                  既存の推薦者を選択
                </TabsTrigger>
                <TabsTrigger value="new">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  新規推薦者を追加
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="existing" className="space-y-4 pt-4">
                {recommenders.length > 0 ? (
                  <div>
                    <FormLabel>推薦者を選択 <span className="text-red-500">*</span></FormLabel>
                    <Select 
                      value={selectedRecommenderId} 
                      onValueChange={(value) => {
                        setSelectedRecommenderId(value);
                        // 選択された推薦者の情報をフォームにセット
                        const selectedRecommender = recommenders.find(r => r.id.toString() === value);
                        if (selectedRecommender) {
                          form.setValue("recommenderName", selectedRecommender.name);
                          form.setValue("recommenderOrg", selectedRecommender.organization || "");
                          form.setValue("industry", selectedRecommender.industry || "");
                        }
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="推薦者を選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        {recommenders.map((recommender) => (
                          <SelectItem key={recommender.id} value={recommender.id.toString()}>
                            {recommender.name} {recommender.organization ? `(${recommender.organization})` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    登録済みの推薦者がありません。新規追加タブから推薦者を登録してください。
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="new" className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="recommenderName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>推薦者名 <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="推薦者の名前を入力" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="recommenderOrg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>推薦者の所属</FormLabel>
                      <FormControl>
                        <Input placeholder="所属組織や役職を入力" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>業界</FormLabel>
                      <FormControl>
                        <Input placeholder="業界を入力（例：テクノロジー、金融）" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Recommendation Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800 border-b pb-2">推薦情報</h3>
          
          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>推薦コメント</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="推薦者のコメントを入力"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="recommendationDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>推薦時期</FormLabel>
                  <FormControl>
                    <Input placeholder="例：2020年" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="recommendationMedium"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>推薦媒体</FormLabel>
                  <FormControl>
                    <Input placeholder="例：インタビュー、ブログ" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>出所情報</FormLabel>
                  <FormControl>
                    <Input placeholder="例：年次株主総会、講演会" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sourceUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>出所URL</FormLabel>
                  <FormControl>
                    <Input placeholder="出所情報のURLを入力" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>推薦理由・背景</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="推薦の背景や理由を入力"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={isSubmitting}
          >
            リセット
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "保存中..." : "書籍を追加"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AdminBookForm;
