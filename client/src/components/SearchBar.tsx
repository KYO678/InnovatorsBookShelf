import { useRef, useEffect } from "react";

interface SearchBarProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const SearchBar = ({ placeholder, value, onChange, className = "" }: SearchBarProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle click outside to hide results
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        // If we need to hide suggestions in the future
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={`flex items-center bg-white rounded-lg overflow-hidden ${className}`}>
      <div className="w-full">
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="search-input w-full py-3 px-4 outline-none text-gray-700 focus:ring-2 focus:ring-accent transition-all"
        />
      </div>
      <button 
        className="bg-accent hover:bg-accent-dark text-white px-6 py-3 transition-colors"
        onClick={() => {
          if (inputRef.current) {
            onChange(inputRef.current.value);
          }
        }}
      >
        <i className="ri-search-line text-xl"></i>
      </button>
    </div>
  );
};

export default SearchBar;
