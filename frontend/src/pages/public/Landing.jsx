import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Sparkles, Zap, ArrowRight, CheckCircle2, UserCheck, Briefcase, Award } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  const handleCTA = (role) => {
    navigate(`/register?role=${role}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900 selection:bg-green-100 selection:text-green-800">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-150 transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 bg-green-600 rounded-xl flex items-center justify-center text-white font-extrabold text-xl shadow-md shadow-green-200">
              B
            </div>
            <span className="text-2xl font-black tracking-tight text-gray-900">
              Bidzy<span className="text-green-600">.</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="text-sm font-bold text-gray-600 hover:text-gray-900 transition px-3 py-2 rounded-lg"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="text-sm font-bold bg-green-600 hover:bg-green-700 text-white transition px-5 py-2.5 rounded-xl shadow-sm shadow-green-100"
            >
              Join Bidzy
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100">
              <Sparkles className="h-3.5 w-3.5" /> Real-time Local Service Marketplace
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-none">
              Get the best price for any <span className="text-green-600">local service</span>.
            </h1>
            <p className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
              Post your job in seconds, watch local verified service providers place real-time competitive bids, and choose the perfect offer with safe escrow protection.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={() => handleCTA('customer')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-extrabold rounded-2xl shadow-lg shadow-green-100 hover:shadow-xl transition-all duration-150 text-base"
              >
                Post a Job<ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleCTA('provider')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-white border border-gray-250 hover:bg-gray-50 text-gray-700 font-bold rounded-2xl transition duration-150 text-base"
              >
                Earn as Provider
              </button>
            </div>
          </div>

          {/* Graphical Mockup representation of bidding */}
          <div className="relative flex justify-center">
            <div className="w-full max-w-md bg-white border border-gray-200 rounded-3xl p-6 shadow-xl relative z-10">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Kitchen Plumbing Fix</h3>
                  <p className="text-xs text-gray-400 font-semibold mt-0.5">Urgent Plumbing Service</p>
                </div>
                <span className="px-2.5 py-0.5 bg-red-50 text-red-600 border border-red-100 text-xs font-bold rounded-full">
                  High Urgency
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-3 border border-green-150 bg-green-50/50 rounded-2xl flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 bg-green-600 text-white font-bold rounded-xl flex items-center justify-center text-sm">
                      JD
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">Plumbers</p>
                      <p className="text-xs text-gray-400 font-semibold">★ 4.9 (18 reviews)</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-black text-green-700">₹850</p>
                    <span className="text-[10px] bg-green-100 text-green-800 font-bold px-1.5 py-0.5 rounded-full">
                      Lowest Bid
                    </span>
                  </div>
                </div>

                <div className="p-3 border border-gray-100 rounded-2xl flex justify-between items-center opacity-80">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 bg-gray-200 text-gray-700 font-bold rounded-xl flex items-center justify-center text-sm">
                      AS
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">Apex Services</p>
                      <p className="text-xs text-gray-400 font-semibold">★ 4.7 (42 reviews)</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold text-gray-700">₹1,100</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Background glowing circle */}
            <div className="absolute inset-0 bg-gradient-to-tr from-green-300/20 to-teal-300/20 rounded-full blur-3xl filter -z-10 transform scale-110" />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">How Bidzy Works</h2>
          <p className="text-sm text-gray-400 font-semibold mt-1">Experience the new way to book local help in 3 simple steps</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="p-6 bg-gray-50 border border-gray-200 rounded-2xl text-center space-y-4">
              <div className="h-12 w-12 bg-green-100 text-green-700 rounded-xl flex items-center justify-center mx-auto text-xl font-bold">
                1
              </div>
              <h3 className="font-bold text-gray-950 text-lg">Post Your Job</h3>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                Describe what you need, choose a category, and set your urgency level. It takes less than a minute.
              </p>
            </div>

            <div className="p-6 bg-gray-50 border border-gray-200 rounded-2xl text-center space-y-4">
              <div className="h-12 w-12 bg-green-100 text-green-700 rounded-xl flex items-center justify-center mx-auto text-xl font-bold">
                2
              </div>
              <h3 className="font-bold text-gray-950 text-lg">Receive Live Bids</h3>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                Verified local professionals place real-time competitive bids to win your job. Compare reviews and prices instantly.
              </p>
            </div>

            <div className="p-6 bg-gray-50 border border-gray-200 rounded-2xl text-center space-y-4">
              <div className="h-12 w-12 bg-green-100 text-green-700 rounded-xl flex items-center justify-center mx-auto text-xl font-bold">
                3
              </div>
              <h3 className="font-bold text-gray-950 text-lg">Secure Booking & Escrow</h3>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                Accept the best bid, pay securely into escrow, and release the funds only when the job is completed to your satisfaction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits / Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Built For Safety & Speed</h2>
              <p className="text-sm text-gray-500 font-semibold">Every feature designed to make hiring reliable and risk-free.</p>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="shrink-0 p-1.5 bg-green-100 text-green-700 rounded-lg h-9 w-9 flex items-center justify-center">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Escrow Account Protection</h4>
                    <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">Your funds are held securely by Bidzy and only released to the service provider after you confirm completion.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="shrink-0 p-1.5 bg-green-100 text-green-700 rounded-lg h-9 w-9 flex items-center justify-center">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Real-Time Bidding Room</h4>
                    <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">Watch the bids drop live as providers compete to give you the best deal in our bidding lounge.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="shrink-0 p-1.5 bg-green-100 text-green-700 rounded-lg h-9 w-9 flex items-center justify-center">
                    <UserCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Verified Local Pros</h4>
                    <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">All providers are fully vetted with verification document checks, keeping our marketplace safe and trustworthy.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Provider Section */}
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-3xl p-8 text-white space-y-6 shadow-xl shadow-green-100">
              <div className="flex items-center gap-3">
                <Award className="h-10 w-10 text-green-200" />
                <h3 className="text-2xl font-black tracking-tight !text-white">Are you a Local Professional?</h3>
              </div>
              <p className="text-sm text-green-100 leading-relaxed font-medium">
                Find local customers instantly, place competitive bids, chat, manage bookings, and get paid securely. Bidzy connects you with clients directly without expensive leads.
              </p>
              <button
                onClick={() => handleCTA('provider')}
                className="w-full py-3 bg-white text-green-700 font-extrabold rounded-xl hover:bg-green-50 transition shadow-sm"
              >
                Sign Up as Provider
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center items-center">
          <p className="text-xs text-gray-400 font-semibold">
            © {new Date().getFullYear()} Bidzy Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
