'use client';

import { useUIStore } from '@/store/ui-store';
import { Separator } from '@/components/ui/separator';

const footerLinks = {
  about: [
    { label: 'About Us', action: () => {} },
    { label: 'Careers', action: () => {} },
    { label: 'Press', action: () => {} },
    { label: 'Corporate Information', action: () => {} },
  ],
  help: [
    { label: 'FAQ', action: () => {} },
    { label: 'Shipping Information', action: () => {} },
    { label: 'Returns & Refunds', action: () => {} },
    { label: 'Contact Us', action: () => {} },
  ],
  policy: [
    { label: 'Privacy Policy', action: () => {} },
    { label: 'Terms of Use', action: () => {} },
    { label: 'Security', action: () => {} },
    { label: 'Sitemap', action: () => {} },
  ],
  social: [
    { label: 'Facebook', action: () => {} },
    { label: 'Twitter', action: () => {} },
    { label: 'Instagram', action: () => {} },
    { label: 'YouTube', action: () => {} },
  ],
};

export default function Footer() {
  const { navigate } = useUIStore();

  return (
    <footer className="mt-auto bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* About */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">About</h3>
            <ul className="space-y-2">
              {footerLinks.about.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={link.action}
                    className="text-sm text-gray-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Help</h3>
            <ul className="space-y-2">
              {footerLinks.help.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={link.action}
                    className="text-sm text-gray-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Policy */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Policy</h3>
            <ul className="space-y-2">
              {footerLinks.policy.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={link.action}
                    className="text-sm text-gray-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Social</h3>
            <ul className="space-y-2">
              {footerLinks.social.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={link.action}
                    className="text-sm text-gray-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-gray-700" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('home')}
              className="text-lg font-bold text-white"
            >
              G-Ecom
            </button>
          </div>
          <p className="text-sm text-gray-400">
            &copy; 2025 G-Ecom. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
