import React from "react";
import { Twitter, Facebook, Instagram, Linkedin } from "lucide-react";

const Footer: React.FC = () => {
  return ( 
    <footer className="hidden md:block bg-[#cfe6f6] border-t border-blue-200 text-gray-900 mt-auto">
      <div className="max-w-[1400px] mx-auto px-6 py-12">
        {/* top columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
          {/* Logo / Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <img
                src="/assets/logo.png"
                alt="ServoFixo"
                className="w-20 h-20 object-contain"
              />
              <div>
                <h3 className="text-lg font-bold text-gray-900">ServoFixo</h3>
              </div>
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-base font-bold mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-gray-800">
              <li>
                <a href="/about" className="hover:underline">
                  About us
                </a>
              </li>
              <li>
                <a href="/terms" className="hover:underline">
                  Terms &amp; conditions
                </a>
              </li>
              <li>
                <a href="/privacy" className="hover:underline">
                  Privacy policy
                </a>
              </li>
              <li>
                <a href="/careers" className="hover:underline">
                  Careers
                </a>
              </li>
            </ul>
          </div>

          {/* For customers / For Professionals (kept as two logical columns within one grid cell) */}
          <div className="flex flex-col md:flex-row gap-6 md:gap-12">
            <div>
              <h4 className="text-base font-bold mb-3">For customers</h4>
              <ul className="space-y-2 text-sm text-gray-800">
                <li>
                  <a href="/zones" className="hover:underline">
                    Zones near you
                  </a>
                </li>
                <li>
                  <a href="/contact" className="hover:underline">
                    Contact us
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-base font-bold mb-3">For Professionals</h4>
              <ul className="space-y-2 text-sm text-gray-800">
                <li>
                  <a href="/register-pro" className="hover:underline">
                    Register as a Professional
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="text-base font-bold mb-3">Social Media</h4>
            <div className="flex items-center gap-3">
              <a
                href="#"
                aria-label="Twitter"
                className="w-8 h-8 rounded-md bg-white flex items-center justify-center shadow-sm"
              >
                <Twitter size={14} className="text-blue-500" />
              </a>

              <a
                href="#"
                aria-label="Facebook"
                className="w-8 h-8 rounded-md bg-white flex items-center justify-center shadow-sm"
              >
                <Facebook size={14} className="text-blue-600" />
              </a>

              <a
                href="#"
                aria-label="Instagram"
                className="w-8 h-8 rounded-md bg-white flex items-center justify-center shadow-sm"
              >
                <Instagram size={14} className="text-gradient" />
              </a>

              <a
                href="#"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-md bg-white flex items-center justify-center shadow-sm"
              >
                <Linkedin size={14} className="text-blue-700" />
              </a>
            </div>
          </div>
        </div>

        {/* thin divider */}
        <div className="mt-8 border-t border-white/60" />

        {/* copyright centered */}
        <div className="mt-6 text-center text-sm text-gray-800">
          © Copyright {new Date().getFullYear()}&nbsp;&nbsp;ServoFixo
        </div>
      </div>
    </footer>
  );
};

export default Footer;
