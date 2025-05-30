import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Book, Recommender } from '@shared/schema';
import { Loader2 } from 'lucide-react';

// 推薦作成用のスキーマ
const createRecommendationSchema = z.object({
  bookId: z.string().min(1, '書籍は必須です'),
  recommenderId: z.string().min(1, '推薦者は必須です'),
  comment: z.string().optional(),
  reason: z.string().optional(),
  recommendationDate: z.string().optional(),
  recommendationMedium: z.string().optional(),
  source: z.string().optional(),
  sourceUrl: z.string().optional(),
});

type FormValues = z.infer<typeof createRecommendationSchema>;

interface CreateRecommendationFormProps {
  books: Book[];
  recommenders: Recommender[];
  onSubmit: (data: FormValues) => void;
  isSubmitting: boolean;
}

const CreateRecommendationForm = ({ 
  books, 
  recommenders, 
  onSubmit, 
  isSubmitting 
}: CreateRecommendationFormProps) => {
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(createRecommendationSchema),
    defaultValues: {
      bookId: '',
      recommenderId: '',
      comment: '',
      reason: '',
      recommendationDate: '',
      recommendationMedium: '',
      source: '',
      sourceUrl: '',
    }
  });

  const handleSubmit = (data: FormValues) => {
    onSubmit({
      ...data,
      bookId: data.bookId,
      recommenderId: data.recommenderId,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="bookId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>書籍</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="書籍を選択" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {books.map((book) => (
                    <SelectItem key={book.id} value={book.id.toString()}>
                      {book.title} - {book.author}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="recommenderId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>推薦者</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="推薦者を選択" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {recommenders.map((recommender) => (
                    <SelectItem key={recommender.id} value={recommender.id.toString()}>
                      {recommender.name} {recommender.organization ? `(${recommender.organization})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>推薦コメント（オプション）</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="推薦者のコメントをここに入力"
                  {...field}
                  className="h-20"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>推薦理由・背景（オプション）</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="推薦理由をここに入力"
                  {...field}
                  className="h-20"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="recommendationDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>推薦時期（オプション）</FormLabel>
              <FormControl>
                <input 
                  type="text"
                  placeholder="例: 2023年5月, 2020年インタビュー"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  {...field}
                />
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
              <FormLabel>推薦メディア・方法（オプション）</FormLabel>
              <FormControl>
                <input 
                  type="text"
                  placeholder="例: 書籍, インタビュー, ポッドキャスト, Twitterなど"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="source"
          render={({ field }) => (
            <FormItem>
              <FormLabel>推薦出所（オプション）</FormLabel>
              <FormControl>
                <input 
                  type="text"
                  placeholder="例: インタビュー記事名, イベント名, 番組名など"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  {...field}
                />
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
              <FormLabel>出所URL（オプション）</FormLabel>
              <FormControl>
                <input 
                  type="url"
                  placeholder="例: https://example.com/interview"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              送信中...
            </>
          ) : (
            '推薦を作成'
          )}
        </Button>
      </form>
    </Form>
  );
};

export default CreateRecommendationForm;