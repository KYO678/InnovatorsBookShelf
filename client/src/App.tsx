import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";

import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import BookList from "@/pages/BookList";
import RecommenderList from "@/pages/RecommenderList";
import BookDetail from "@/pages/BookDetail";
import RecommenderDetail from "@/pages/RecommenderDetail";
import About from "@/pages/About";
import Admin from "@/pages/Admin";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <div className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/books" component={BookList} />
          <Route path="/books/:id" component={BookDetail} />
          <Route path="/recommenders" component={RecommenderList} />
          <Route path="/recommenders/:id" component={RecommenderDetail} />
          <Route path="/about" component={About} />
          <Route path="/admin" component={Admin} />
          <Route component={NotFound} />
        </Switch>
      </div>
      
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="legends-bookshelf-theme">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
