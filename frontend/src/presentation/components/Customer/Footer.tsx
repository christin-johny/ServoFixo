import React from "react";
import { Twitter, Facebook, Instagram, Linkedin } from "lucide-react";

const Footer: React.FC = () => {
  return (
    // ✅ Visible only on desktop
    <footer className="hidden md:block bg-[#cfe6f6] border-t border-blue-200 text-gray-900 mt-auto">
      <div className="max-w-[1400px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
          
          {/* Logo */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <img src="/assets/logo.png" alt="ServoFixo" className="w-12 h-12 object-contain" />
              <div><h3 className="text-lg font-semibold">ServoFixo</h3><p className="text-xs text-gray-600">service at home</p></div>
            </div>
          </div>

          {/* Links Sections (Simplified for brevity) */}
          <div>
            <h4 className="text-base font-semibold mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li><a className="hover:underline" href="/about">About us</a></li>
              <li><a className="hover:underline" href="/terms">Terms &amp; conditions</a></li>
            </ul>
          </div>
          {/* ... other columns ... */}
          
          {/* Social */}
          <div>
            <h4 className="text-base font-semibold mb-3">Social Media</h4>
            <div className="flex items-center gap-3">
               {/* ... icons ... */}
               <Twitter size={20} className="text-blue-500 cursor-pointer"/>
               <Instagram size={20} className="text-pink-500 cursor-pointer"/>
            </div>
          </div>
        </div>
        
        <div className="mt-8 border-t border-white/60"></div>
        <div className="mt-6 text-center text-sm text-gray-700">© Copyright {new Date().getFullYear()} ServoFixo</div>
      </div>
    </footer>
  );
};

export default Footer;