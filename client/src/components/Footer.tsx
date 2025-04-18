import { Link } from "wouter";

const Footer = () => {
  return (
    <footer className="bg-primary-dark text-secondary-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:justify-between">
          <div className="mb-8 md:mb-0">
            <div className="flex items-center">
              <i className="ri-book-open-line text-secondary-light text-3xl"></i>
              <h2 className="text-xl font-serif font-bold ml-2">Legend's Book Shelf</h2>
            </div>
            <p className="mt-2 text-secondary-light text-sm">
              著名人が推薦する書籍をまとめたデータベース。<br />
              知識と知恵の特別なコレクション。
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
                コンテンツ
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/">
                    <a className="text-secondary-light hover:text-white transition-colors">ホーム</a>
                  </Link>
                </li>
                <li>
                  <Link href="/books">
                    <a className="text-secondary-light hover:text-white transition-colors">書籍一覧</a>
                  </Link>
                </li>
                <li>
                  <Link href="/recommenders">
                    <a className="text-secondary-light hover:text-white transition-colors">推薦者一覧</a>
                  </Link>
                </li>
                <li>
                  <Link href="/about">
                    <a className="text-secondary-light hover:text-white transition-colors">サイトについて</a>
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
                サービス
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/admin">
                    <a className="text-secondary-light hover:text-white transition-colors">管理者ログイン</a>
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-secondary-light hover:text-white transition-colors">データ提供</a>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
                サイトについて
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/about">
                    <a className="text-secondary-light hover:text-white transition-colors">プロジェクトについて</a>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-primary-light md:flex md:items-center md:justify-between">
          <div className="flex space-x-6">
            <a href="#" className="text-secondary-light hover:text-white transition-colors">
              <i className="ri-twitter-x-line text-xl"></i>
            </a>
            <a href="#" className="text-secondary-light hover:text-white transition-colors">
              <i className="ri-facebook-circle-line text-xl"></i>
            </a>
            <a href="#" className="text-secondary-light hover:text-white transition-colors">
              <i className="ri-instagram-line text-xl"></i>
            </a>
            <a href="#" className="text-secondary-light hover:text-white transition-colors">
              <i className="ri-github-line text-xl"></i>
            </a>
          </div>
          
          <p className="mt-8 text-sm text-secondary-light md:mt-0">
            &copy; {new Date().getFullYear()} Legend's Book Shelf. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
