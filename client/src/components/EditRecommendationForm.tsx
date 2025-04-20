import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Book, CompleteRecommendation, Recommender } from '@shared/schema';
import { Loader2 } from 'lucide-react';

// 推薦編集用のスキーマ
const editRecommendationSchema = z.object({
  id: z.number(),
  bookId: z.number(),
  recommenderId: z.number(),
  comment: z.string().optional().nullable(),
  reason: z.string().optional().nullable(),
  recommendationDate: z.string().optional().nullable(),
  recommendationMedium: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
  sourceUrl: z.string().optional().nullable(),
});

export type EditRecommendationFormValues = z.infer<typeof editRecommendationSchema>;

interface EditRecommendationFormProps {
  recommendation: CompleteRecommendation;
  books: Book[];
  recommenders: Recommender[];
  onSubmit: (data: EditRecommendationFormValues) => void;
  isSubmitting: boolean;
}

const EditRecommendationForm = ({ 
  recommendation,
  books, 
  recommenders, 
  onSubmit, 
  isSubmitting 
}: EditRecommendationFormProps) => {
  const [loading, setLoading] = useState(false);

  const form = useForm<EditRecommendationFormValues>({
    resolver: zodResolver(editRecommendationSchema),
    defaultValues: {
      id: recommendation.id,
      bookId: recommendation.bookId,
      recommenderId: recommendation.recommenderId,
      comment: recommendation.comment || '',
      reason: recommendation.reason || '',
      recommendationDate: recommendation.recommendationDate || '',
      recommendationMedium: recommendation.recommendationMedium || '',
      source: recommendation.source || '',
      sourceUrl: recommendation.sourceUrl || '',
    }
  });

  const handleSubmit = (data: EditRecommendationFormValues) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium mb-2">書籍:</p>
            <p className="text-sm">{recommendation.book.title} - {recommendation.book.author}</p>
          </div>
          <div>
            <p className="text-sm font-medium mb-2">推薦者:</p>
            <p className="text-sm">{recommendation.recommender.name} {recommendation.recommender.organization ? `(${recommendation.recommender.organization})` : ''}</p>
          </div>
        </div>

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
                  value={field.value || ''}
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
                  value={field.value || ''}
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
                  value={field.value || ''}
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
                  value={field.value || ''}
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
                  value={field.value || ''}
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
                  value={field.value || ''}
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
              更新中...
            </>
          ) : (
            '推薦を更新'
          )}
        </Button>
      </form>
    </Form>
  );
};

export default EditRecommendationForm;