import React from "react";
import { ShieldCheck, TrendingUp, Truck } from "lucide-react";

const Features = () => {
  return (
    <div className="py-16 bg-linear-to-br from-emerald-50 via-teal-50 to-slate-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Everything You Need, In One Place
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
           From secure payments to fair pricing to hassle-free delivery —
  Agriassure covers the entire trade, end to end.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Secure Payments */}
          <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition border-b-4 border-green-500">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
              <ShieldCheck className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-800">
              Secure Payments
            </h3>
            <p className="text-gray-600">
              Guaranteed payments through escrow. Funds are released only after
              successful delivery.
            </p>
          </div>

          {/* Best Market Price */}
          <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition border-b-4 border-yellow-500">
            <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
              <TrendingUp className="h-8 w-8 text-yellow-600" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-800">
              Best Market Price
            </h3>
            <p className="text-gray-600">
              Access live mandi rates and negotiate directly with buyers for
              maximum profit.
            </p>
          </div>

          {/* Logistics */}
          <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition border-b-4 border-blue-500">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
              <Truck className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-800">
              End-to-End Logistics
            </h3>
            <p className="text-gray-600">
              Hassle-free pickup and delivery with trusted logistics partners.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;
