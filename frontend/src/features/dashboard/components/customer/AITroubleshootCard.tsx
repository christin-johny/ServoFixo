import React from "react";
import { useNavigate } from "react-router-dom";

const AITroubleshootCard: React.FC = () => {
  const navigate = useNavigate();

  const handleChatNavigation = () => {
    navigate("/assistant");
  };

  return (
    <section className="scroll-mt-40">
      <div
        className="
          bg-white rounded-xl shadow-sm overflow-hidden
          md:flex md:items-center md:gap-10
          p-6 md:py-12 md:px-10
          border border-gray-200
          -mx-4 px-4 md:mx-0 md:px-0
        "
      >
        {/* Left Image */}
        <div className="flex-shrink-0 flex items-center justify-center md:w-1/2">
          <div className="rounded-lg p-2 md:p-4">
            <img
              src="/assets/ai-tech.png"
              alt="AI Technician"
              className="
                w-40 h-40
                sm:w-48 sm:h-48
                md:w-72 md:h-72      /* Bigger on desktop */
                lg:w-80 lg:h-80      /* Even larger for big screens */
                object-contain
              "
            />
          </div>
        </div>

        {/* Right Content */}
        <div className="mt-6 md:mt-0 md:w-1/2">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
            Want to try out AI TroubleShooting
          </h2>

          <p className="mt-4 text-gray-600 text-base sm:text-lg">
            The AI Technician is your smart assistant for quick, safe troubleshooting
            of common home or vehicle issues. Just chat to get step-by-step guidance
            for simple fixes. If the problem requires real help, you can instantly
            book a verified technician in your zone.
          </p>

          <div className="mt-8">
            <button
              onClick={handleChatNavigation}
              className="
                px-6 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                text-white font-semibold text-lg rounded-2xl shadow-lg
                transition
              "
            >
              Chat now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AITroubleshootCard;