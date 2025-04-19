import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ImageUploaderProps {
  initialImageUrl?: string;
  onImageUploaded: (imageUrl: string) => void;
  type: "book" | "recommender";
  entityId?: number;
}

const ImageUploader = ({ 
  initialImageUrl, 
  onImageUploaded, 
  type, 
  entityId 
}: ImageUploaderProps) => {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(initialImageUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [directUrl, setDirectUrl] = useState<string>(initialImageUrl || "");

  useEffect(() => {
    // 初期画像URLが変更された場合にプレビューを更新
    if (initialImageUrl) {
      setPreview(initialImageUrl);
      setDirectUrl(initialImageUrl);
    }
  }, [initialImageUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 画像ファイルのバリデーション (5MB以下, 画像形式のみ)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "ファイルサイズが大きすぎます",
        description: "5MB以下のファイルを選択してください。",
        variant: "destructive",
      });
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast({
        title: "画像ファイルを選択してください",
        description: "対応形式: JPEG, PNG, GIF, WebP",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("type", type);
    if (entityId) {
      formData.append("entityId", entityId.toString());
    }

    try {
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("アップロードに失敗しました");
      }

      const data = await response.json();
      
      setPreview(data.imageUrl);
      onImageUploaded(data.imageUrl);
      
      toast({
        title: "画像アップロード成功",
        description: "画像を正常にアップロードしました。",
      });
    } catch (error) {
      toast({
        title: "アップロードエラー",
        description: error instanceof Error ? error.message : "アップロード中にエラーが発生しました。",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDirectUrl(e.target.value);
  };

  const handleUrlSubmit = () => {
    if (!directUrl) return;
    
    setPreview(directUrl);
    onImageUploaded(directUrl);
    
    toast({
      title: "URL設定完了",
      description: "画像URLを設定しました。",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center mb-4">
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="プレビュー"
              className="max-h-48 max-w-full rounded-md border border-gray-200 shadow-sm"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-1 right-1 bg-white rounded-full h-6 w-6 p-0 flex items-center justify-center"
              onClick={() => {
                setPreview(null);
                setSelectedFile(null);
                onImageUploaded("");
              }}
            >
              <i className="ri-close-line"></i>
            </Button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-md h-48 w-full max-w-xs flex items-center justify-center text-gray-500">
            <div className="text-center p-4">
              <i className="ri-image-add-line text-3xl mb-2"></i>
              <p className="text-sm">画像をアップロードするか、URLを入力してください</p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium">方法1: ファイルをアップロード</div>
        <div className="flex space-x-2">
          <Input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            className="flex-1"
          />
          <Button 
            onClick={handleUpload} 
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? "アップロード中..." : "アップロード"}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium">方法2: 画像URLを指定</div>
        <div className="flex space-x-2">
          <Input 
            type="url" 
            placeholder="https://example.com/image.jpg" 
            value={directUrl}
            onChange={handleUrlChange}
            className="flex-1"
          />
          <Button 
            onClick={handleUrlSubmit} 
            disabled={!directUrl}
          >
            URLを設定
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;