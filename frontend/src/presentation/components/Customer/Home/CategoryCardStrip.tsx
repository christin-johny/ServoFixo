import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface Category {
  id: string;
  name: string;
  iconUrl?: string;
}

interface Props {
  categories: Category[];
  loading: boolean;
  images?: string[];  
}

const CategoryCardStrip: React.FC<Props> = ({ categories, loading, images }) => {
  const navigate = useNavigate();
  const displayed = (categories || []).slice(0, 6);
 
  const imgs = images && images.length >= 3 ? images : [
    "/assets/m1.jpg",
    "/assets/m2.jpeg",
    "/assets/m3.jpg",
  ];

  return (
    <section className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* LEFT: Category Card */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 md:p-10">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-6">
            What are you looking for?
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="w-full bg-gray-50 rounded-xl p-4 flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg animate-pulse" />
                    <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))
              : displayed.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => navigate(`/services?categoryId=${cat.id}`)}
                    className="w-full bg-gray-50 rounded-xl p-4 flex flex-col items-center gap-3 hover:bg-blue-50 transition"
                  >
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-xl shadow p-2 flex items-center justify-center">
                      <img 
                        src={cat.iconUrl || "/assets/category-placeholder.png"} 
                        alt={cat.name} 
                        className="w-full h-full object-contain" 
                      />
                    </div>

                    <p className="text-xs md:text-sm font-medium text-gray-800 text-center line-clamp-2">
                      {cat.name}
                    </p>
                  </button>
                ))}
          </div>

          {(!loading && categories && categories.length >= 6) && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => navigate('/services')}
                className="px-6 py-3 bg-blue-600 text-white rounded-full font-semibold shadow hover:bg-blue-700 transition flex items-center gap-2"
              >
                See more
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* RIGHT: photo mosaic */}
        <div className="grid grid-cols-2 grid-rows-2 gap-4 h-full">
          {/* Big left vertical image */}
          <img src={imgs[0]} alt="m1" className="col-span-1 row-span-2 w-full h-full object-cover rounded-xl" />

          {/* two stacked on right */}
          <img src={imgs[1]} alt="m2" className="col-span-1 row-span-1 object-cover w-full h-full rounded-xl" />
          <img src={imgs[2]} alt="m3" className="col-span-1 row-span-1 object-cover w-full h-full rounded-xl" />
        </div>
      </div>
    </section>
  );
};

export default CategoryCardStrip;