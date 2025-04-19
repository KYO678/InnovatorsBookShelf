import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Book } from "@shared/schema";
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
import ImageUploader from "@/components/ImageUploader";

// 書籍編集用のスキーマ
const editBookSchema = z.object({
  title: z.string().min(1, { message: "タイトルは必須です" }),
  author: z.string().min(1, { message: "著者名は必須です" }),
  category: z.string().optional(),
  publishYear: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
});

export type EditBookFormValues = z.infer<typeof editBookSchema>;

interface EditBookFormProps {
  book: Book;
  onSubmit: (data: EditBookFormValues) => void;
  isSubmitting: boolean;
}

const EditBookForm = ({ book, onSubmit, isSubmitting }: EditBookFormProps) => {
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

  const form = useForm<EditBookFormValues>({
    resolver: zodResolver(editBookSchema),
    defaultValues: {
      title: book.title,
      author: book.author,
      category: book.category || "",
      publishYear: book.publishYear || "",
      description: book.description || "",
      imageUrl: book.imageUrl || "",
    },
  });

  const handleImageUploaded = (imageUrl: string) => {
    form.setValue("imageUrl", imageUrl);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
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

          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>書籍サムネイル画像</FormLabel>
                <FormControl>
                  <div className="mt-2">
                    <ImageUploader
                      initialImageUrl={field.value}
                      onImageUploaded={handleImageUploaded}
                      type="book"
                      entityId={book.id}
                    />
                  </div>
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
            キャンセル
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "保存中..." : "更新"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EditBookForm;