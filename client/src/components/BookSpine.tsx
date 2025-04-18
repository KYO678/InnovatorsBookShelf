interface BookSpineProps {
  title: string;
  color?: string;
}

const BookSpine = ({ title, color = "primary-light" }: BookSpineProps) => {
  // Truncate very long titles
  const displayTitle = title.length > 20 ? `${title.substring(0, 18)}...` : title;

  return (
    <div className="relative w-full h-full">
      {/* Book spine */}
      <div className="absolute left-0 top-0 w-3 h-full bg-primary-dark rounded-l"></div>
      
      {/* Book cover */}
      <div className={`absolute left-3 top-0 right-0 bottom-0 bg-${color} rounded-r flex items-center justify-center`}>
        <div className="px-2 text-center">
          <span className="font-serif text-white font-bold text-lg leading-tight">{displayTitle}</span>
        </div>
      </div>
    </div>
  );
};

export default BookSpine;
