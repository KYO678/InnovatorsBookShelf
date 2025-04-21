import React, { useState } from 'react';
import { z } from 'zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Book, CompleteRecommendation, Recommender } from '@shared/schema';
import { Loader2, PlusCircle, X } from 'lucide-react';

// 出所情報用のスキーマ
const sourceItemSchema = z.object({
  source: z.string().optional().nullable(),
  sourceUrl: z.string().optional().nullable(),
});

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
  sources: z.array(sourceItemSchema).optional(),
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

  // 既存のsourceとsourceUrlから複数の出所情報を初期化
  const initializeSources = () => {
    const sources = [];
    
    // 最初のエントリは既存のsourceとsourceUrl
    if (recommendation.source || recommendation.sourceUrl) {
      sources.push({
        source: recommendation.source || '',
        sourceUrl: recommendation.sourceUrl || ''
      });
    }
    
    // 既存のsourceが |（パイプ）で区切られている場合、追加のエントリを作成
    if (recommendation.source && recommendation.source.includes('|')) {
      const splitSources = recommendation.source.split('|').map(s => s.trim());
      const splitUrls = recommendation.sourceUrl ? recommendation.sourceUrl.split('|').map(u => u.trim()) : [];
      
      // 最初のエントリは既に追加されているので、1からスタート
      for (let i = 1; i < splitSources.length; i++) {
        sources.push({
          source: splitSources[i] || '',
          sourceUrl: splitUrls[i] || ''
        });
      }
    }
    
    return sources.length > 0 ? sources : [{ source: '', sourceUrl: '' }];
  };

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
      sources: initializeSources(),
    }
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "sources"
  });

  const handleSubmit = (data: EditRecommendationFormValues) => {
    // 複数の出所情報があれば、区切り文字で連結してsourceとsourceUrlにセットする
    if (data.sources && data.sources.length > 0) {
      // 空の項目を除外
      const validSources = data.sources.filter(s => s.source || s.sourceUrl);
      
      if (validSources.length > 0) {
        // 複数の出所情報を |（パイプ）で区切って保存
        data.source = validSources.map(s => s.source).join(' | ');
        data.sourceUrl = validSources.map(s => s.sourceUrl).join(' | ');
      }
    }
    
    // sourcesフィールドはバックエンドに送らない
    const { sources, ...submitData } = data;
    console.log('送信データ:', submitData);
    onSubmit(submitData);
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

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FormLabel className="text-base">複数の推薦出所（オプション）</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ source: '', sourceUrl: '' })}
              className="text-sm"
            >
              <PlusCircle className="h-4 w-4 mr-1" /> 出所を追加
            </Button>
          </div>
          
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="p-4 border rounded-md bg-paper relative">
                {index > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    className="absolute top-2 right-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                
                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name={`sources.${index}.source`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>推薦出所 {index + 1}</FormLabel>
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
                    name={`sources.${index}.sourceUrl`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>出所URL {index + 1}</FormLabel>
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
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="border-t pt-4 text-sm text-gray-500">
          <p>※ 元の「推薦出所」と「出所URL」フィールドは下位互換性のために残されています。</p>
          <p>上の「複数の推薦出所」を使用することをお勧めします。</p>
        </div>
        
        <FormField
          control={form.control}
          name="source"
          render={({ field }) => (
            <FormItem>
              <FormLabel>元の推薦出所（非推奨）</FormLabel>
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
              <FormLabel>元の出所URL（非推奨）</FormLabel>
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