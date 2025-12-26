import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-red-500 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">D</span>
                            </div>
                            <span className="font-bold text-xl text-white">FreeWahala</span>
                        </div>
                        <p className="text-sm text-gray-400">
                            Ghana's #1 no-broker rental platform. Connect directly with landlords and save on agent fees.
                        </p>
                    </div>

                    {/* For Tenants */}
                    <div>
                        <h3 className="font-semibold text-white mb-4">For Tenants</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/" className="hover:text-white transition-colors">Browse Properties</Link></li>
                            <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing Plans</Link></li>
                            <li><Link href="/agreements" className="hover:text-white transition-colors">Rental Agreements</Link></li>
                            <li><Link href="/services" className="hover:text-white transition-colors">Home Services</Link></li>
                        </ul>
                    </div>

                    {/* For Landlords */}
                    <div>
                        <h3 className="font-semibold text-white mb-4">For Landlords</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/list-property" className="hover:text-white transition-colors">List Property</Link></li>
                            <li><Link href="/pricing" className="hover:text-white transition-colors">Landlord Plans</Link></li>
                            <li><Link href="/agreements" className="hover:text-white transition-colors">Create Agreement</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="font-semibold text-white mb-4">Support</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/report" className="hover:text-white transition-colors">Report a Problem</Link></li>
                            <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                            <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-gray-500">
                        © {new Date().getFullYear()} FreeWahala Ghana. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-sm">
                        <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms</Link>
                        <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy</Link>
                        <Link href="/cookies" className="text-gray-400 hover:text-white transition-colors">Cookies</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
