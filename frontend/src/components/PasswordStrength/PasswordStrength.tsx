 
import React from "react";
import { usePasswordStrength } from "./usePasswordStrength";

interface Props {
  password: string;
 
  showFailed?: boolean;
  className?: string;
}

const PasswordStrength: React.FC<Props> = ({ password, showFailed = false, className = "" }) => {
  const { checks, strength, messages, failed } = usePasswordStrength(password);

  if (!password) return null;

  return (
    <div className={`mt-3 space-y-2 ${className}`}>
      {/* Strength bar */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              level <= strength
                ? strength <= 2
                  ? "bg-red-500"
                  : strength <= 3
                  ? "bg-yellow-500"
                  : strength <= 4
                  ? "bg-blue-500"
                  : "bg-green-500"
                : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      {/* Requirements checklist */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {(Object.keys(messages) as Array<keyof typeof messages>).map((key) => {
          const passed = checks[key];
          return (
            <div
              key={key}
              className={`flex items-center gap-1.5 ${passed ? "text-green-600" : "text-gray-500"} ${key === "special" ? "col-span-2" : ""}`}
            >
              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passed ? "bg-green-100" : "bg-gray-100"}`}>
                {passed ? (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <circle cx="10" cy="10" r="2" />
                  </svg>
                )}
              </div>
              <span>{messages[key]}</span>
            </div>
          );
        })}
      </div>

      {/* Optional textual failed messages (useful on registration) */}
      {showFailed && failed.length > 0 && (
        <div className="mt-2 text-sm text-red-600 space-y-1">
          {failed.map((msg) => (
            <div key={msg} className="flex items-start gap-2">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zM9 6a1 1 0 10-2 0v4a1 1 0 102 0V6z" clipRule="evenodd" />
              </svg>
              <span>{msg}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PasswordStrength;
