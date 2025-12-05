import React from "react";

interface LoaderFallbackProps {
  message?: string;
}

const LoaderFallback: React.FC<LoaderFallbackProps> = ({ message }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      
      <div className="flex flex-col items-center mb-4">
        <img
          src="/assets/logo.png"
          alt="ServoFixo Logo"
          className="h-16 w-16 animate-[float_3s_ease-in-out_infinite]"
        />
      </div>


      <div className="relative w-40 h-2 rounded-full bg-gray-200 overflow-hidden mb-4">
        <div className="absolute inset-0 bg-blue-500 animate-[shimmer_1.4s_infinite] rounded-full"></div>
      </div>


      <p className="text-gray-700 font-medium text-lg tracking-wide">
        {message || "Loading…"}
      </p>


      <p className="text-gray-400 text-sm mt-1">
        Please wait a moment.
      </p>

      <style>
        {`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        `}
      </style>
    </div>
  );
};

export default LoaderFallback;
