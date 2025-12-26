'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Pages that should NOT show the Header/Footer
const AUTH_PAGES = ['/login', '/signup'];

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isAuthPage = AUTH_PAGES.includes(pathname);
    const isAdminPage = pathname.startsWith('/admin');

    // Admin pages have their own layout
    if (isAuthPage || isAdminPage) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
                {children}
            </main>
            <Footer />
        </div>
    );
}
