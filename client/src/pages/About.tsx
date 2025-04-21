import { Card, CardContent } from "@/components/ui/card";

const About = () => {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">
        Innovator's Book Shelf について
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-serif font-bold text-gray-800 mb-4">
                プロジェクトの概要
              </h2>
              
              <div className="prose max-w-none">
                <p>
                  Innovator's Book Shelfは、ビジネスリーダーやイノベーターなど影響力のある著名人が推薦する書籍をまとめたデータベースです。
                  ビル・ゲイツ、イーロン・マスク、ウォーレン・バフェットなどの革新者たちが読んできた本を知ることで、
                  あなたも彼らの知識と知恵に触れることができます。
                </p>
                
                <p>
                  このサイトの特徴は、書籍から推薦者、推薦者から書籍へと双方向に探索できることです。
                  気になる書籍を見つけたら、その本を推薦した著名人を知ることができ、
                  尊敬するイノベーターがいれば、その人が推薦する書籍をすべて見ることができます。
                </p>
                
                <p>
                  Innovator's Book Shelfは、読書好きな方々、自己啓発に取り組む方々、
                  イノベーターたちの思考を理解したい方々にとって、
                  新たな読書体験と発見の場を提供します。
                </p>
              </div>
              
              <h2 className="text-2xl font-serif font-bold text-gray-800 mt-8 mb-4">
                利用方法
              </h2>
              
              <div className="prose max-w-none">
                <h3>書籍から探す</h3>
                <p>
                  「書籍一覧」から気になるタイトルを見つけて、クリックすると詳細ページが開きます。
                  そこでは、その本を推薦している著名人とその推薦コメントを見ることができます。
                </p>
                
                <h3>推薦者から探す</h3>
                <p>
                  「推薦者一覧」から興味のある著名人を選び、その人が推薦するすべての書籍を見ることができます。
                  各推薦者のページでは、その人が推薦した理由や背景も確認できます。
                </p>
                
                <h3>検索機能を活用する</h3>
                <p>
                  特定の書籍や著者、推薦者を探したい場合は、トップページの検索ボックスを使用してください。
                  キーワードを入力するだけで、関連する書籍や推薦者を素早く見つけることができます。
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-serif font-bold text-gray-800 mb-4">
                統計情報
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">総書籍数</h3>
                  <p className="text-3xl font-bold text-primary">16+</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">総推薦者数</h3>
                  <p className="text-3xl font-bold text-primary">10+</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">カテゴリー数</h3>
                  <p className="text-3xl font-bold text-primary">8+</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">推薦数</h3>
                  <p className="text-3xl font-bold text-primary">16+</p>
                </div>
              </div>
              
              <div className="mt-8">
                <h2 className="text-xl font-serif font-bold text-gray-800 mb-4">
                  お問い合わせ
                </h2>
                
                <p className="text-sm text-gray-600 mb-4">
                  質問、フィードバック、または新しい推薦情報の提供がございましたら、
                  以下の方法でお問い合わせください。
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center">
                    <i className="ri-mail-line text-primary mr-2"></i>
                    <span className="text-sm">info@innovators-bookshelf.example.com</span>
                  </div>
                  <div className="flex items-center">
                    <i className="ri-twitter-x-line text-primary mr-2"></i>
                    <span className="text-sm">@InnovatorsBooks</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-serif font-bold text-gray-800 mb-4">
                  更新履歴
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">2023年12月</h3>
                    <p className="text-sm text-gray-600">サイト公開</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">2024年1月</h3>
                    <p className="text-sm text-gray-600">新たな推薦データを追加</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">2024年3月</h3>
                    <p className="text-sm text-gray-600">UI/UXの改善</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
};

export default About;
