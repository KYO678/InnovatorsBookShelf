import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookCategory } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (categories: string[]) => void;
  initialCategories: string[];
}

const FilterModal = ({ isOpen, onClose, onApply, initialCategories }: FilterModalProps) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategories);

  // Reset selected categories when initial categories change
  useEffect(() => {
    setSelectedCategories(initialCategories);
  }, [initialCategories]);

  // Fetch books to extract all available categories
  const { data: books = [] } = useQuery({
    queryKey: ["/api/books"],
  });

  // Get unique categories from books
  const categories = Array.from(
    new Set(
      books
        .map((book: any) => book.category)
        .filter(Boolean) as string[]
    )
  ).sort();

  // Toggle category selection
  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedCategories([]);
  };

  // Apply filters
  const applyFilters = () => {
    onApply(selectedCategories);
  };

  // Predefined categories if none are found in the books
  const predefinedCategories: BookCategory[] = [
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

  // Use categories from books or fallback to predefined ones
  const displayCategories = categories.length > 0 ? categories : predefinedCategories;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">検索フィルター</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">カテゴリー</h3>
            <div className="space-y-2">
              {displayCategories.map((category) => (
                <div key={category} className="flex items-center">
                  <Checkbox
                    id={`filter-${category}`}
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={() => toggleCategory(category)}
                  />
                  <Label
                    htmlFor={`filter-${category}`}
                    className="ml-2 text-sm text-gray-700 cursor-pointer"
                  >
                    {category}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={resetFilters}
          >
            リセット
          </Button>
          <Button
            onClick={applyFilters}
            className="bg-accent hover:bg-accent-dark text-white"
          >
            適用する
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FilterModal;
