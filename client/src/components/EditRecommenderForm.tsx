import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Recommender } from "@shared/schema";
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
import ImageUploader from "@/components/ImageUploader";

// 推薦者編集用のスキーマ
const editRecommenderSchema = z.object({
  name: z.string().min(1, { message: "名前は必須です" }),
  organization: z.string().optional(),
  industry: z.string().optional(),
  imageUrl: z.string().optional(),
});

export type EditRecommenderFormValues = z.infer<typeof editRecommenderSchema>;

interface EditRecommenderFormProps {
  recommender: Recommender;
  onSubmit: (data: EditRecommenderFormValues) => void;
  isSubmitting: boolean;
}

const EditRecommenderForm = ({ recommender, onSubmit, isSubmitting }: EditRecommenderFormProps) => {
  const form = useForm<EditRecommenderFormValues>({
    resolver: zodResolver(editRecommenderSchema),
    defaultValues: {
      name: recommender.name,
      organization: recommender.organization || "",
      industry: recommender.industry || "",
      imageUrl: recommender.imageUrl || "",
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
            name="name"
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
            name="organization"
            render={({ field }) => (
              <FormItem>
                <FormLabel>所属組織</FormLabel>
                <FormControl>
                  <Input placeholder="会社名や役職など" {...field} />
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
                  <Input placeholder="例：テクノロジー、金融、教育" {...field} />
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
                <FormLabel>プロフィール画像</FormLabel>
                <FormControl>
                  <div className="mt-2">
                    <ImageUploader
                      initialImageUrl={field.value}
                      onImageUploaded={handleImageUploaded}
                      type="recommender"
                      entityId={recommender.id}
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

export default EditRecommenderForm;