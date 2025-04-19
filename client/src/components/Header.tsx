import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Header = () => {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <header className="bg-primary shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer">
                <i className="ri-book-open-line text-secondary-light text-3xl"></i>
                <h1 className="text-secondary-light font-serif text-2xl font-bold">Legend's Book Shelf</h1>
              </div>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/">
              <div className={`text-secondary-light hover:text-white transition-colors ${isActive("/") ? "font-medium" : ""} cursor-pointer`}>
                ホーム
              </div>
            </Link>
            <Link href="/books">
              <div className={`text-secondary-light hover:text-white transition-colors ${isActive("/books") ? "font-medium" : ""} cursor-pointer`}>
                書籍一覧
              </div>
            </Link>
            <Link href="/recommenders">
              <div className={`text-secondary-light hover:text-white transition-colors ${isActive("/recommenders") ? "font-medium" : ""} cursor-pointer`}>
                推薦者一覧
              </div>
            </Link>
            <Link href="/about">
              <div className={`text-secondary-light hover:text-white transition-colors ${isActive("/about") ? "font-medium" : ""} cursor-pointer`}>
                サイトについて
              </div>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-secondary-light hover:text-white">
                    <i className="ri-menu-line text-2xl"></i>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="bg-primary text-secondary-light">
                  <SheetHeader className="mb-6">
                    <SheetTitle className="text-secondary-light">メニュー</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col space-y-4">
                    <Link href="/">
                      <div className="block px-3 py-2 text-secondary-light hover:bg-primary-light rounded-md cursor-pointer" onClick={() => setIsMobileMenuOpen(false)}>
                        ホーム
                      </div>
                    </Link>
                    <Link href="/books">
                      <div className="block px-3 py-2 text-secondary-light hover:bg-primary-light rounded-md cursor-pointer" onClick={() => setIsMobileMenuOpen(false)}>
                        書籍一覧
                      </div>
                    </Link>
                    <Link href="/recommenders">
                      <div className="block px-3 py-2 text-secondary-light hover:bg-primary-light rounded-md cursor-pointer" onClick={() => setIsMobileMenuOpen(false)}>
                        推薦者一覧
                      </div>
                    </Link>
                    <Link href="/about">
                      <div className="block px-3 py-2 text-secondary-light hover:bg-primary-light rounded-md cursor-pointer" onClick={() => setIsMobileMenuOpen(false)}>
                        サイトについて
                      </div>
                    </Link>
                    <Link href="/admin">
                      <div className="block px-3 py-2 text-white bg-accent rounded-md cursor-pointer" onClick={() => setIsMobileMenuOpen(false)}>
                        管理者ログイン
                      </div>
                    </Link>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            
            <Link href="/admin">
              <div className="hidden md:block bg-accent hover:bg-accent-dark text-white font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer">
                <i className="ri-user-settings-line mr-1"></i> 管理者ログイン
              </div>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
