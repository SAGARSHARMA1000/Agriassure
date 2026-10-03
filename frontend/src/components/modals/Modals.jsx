import React, { useState } from 'react';
import { X, Sprout, Briefcase, ShieldCheck, FileSignature, PenTool, CheckCircle, Lock, AlertCircle, CreditCard } from 'lucide-react';

export const RegistrationModal = ({ isOpen, onClose, onRegister }) => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState(null);
  const [formData, setFormData] = useState({ name: '', location: '', phone: '', cropSpecialty: '', businessName: '' });

  if (!isOpen) return null;

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setStep(2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onRegister({ ...formData, role, id: Date.now().toString() });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="bg-green-700 p-4 flex justify-between items-center">
          <h3 className="text-white font-bold text-lg">
            {step === 1 ? 'Choose Account Type' : `Register as ${role?.charAt(0).toUpperCase() + role?.slice(1)}`}
          </h3>
          <button onClick={onClose} className="text-green-100 hover:text-white"><X size={24} /></button>
        </div>

        <div className="p-8">
          {step === 1 ? (
            <div className="grid gap-4">
              <button onClick={() => handleRoleSelect('farmer')} className="flex items-center p-4 border-2 border-green-100 rounded-xl hover:border-green-500 hover:bg-green-50 transition group">
                <div className="bg-green-100 p-3 rounded-full mr-4"><Sprout className="text-green-700" /></div>
                <span className="block font-bold text-gray-800">I am a Farmer</span>
              </button>
              <button onClick={() => handleRoleSelect('buyer')} className="flex items-center p-4 border-2 border-blue-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition group">
                <div className="bg-blue-100 p-3 rounded-full mr-4"><Briefcase className="text-blue-700" /></div>
                <span className="block font-bold text-gray-800">I am a Buyer/Trader</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input required type="text" className="w-full border rounded-lg p-2.5" placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <input required type="tel" className="w-full border rounded-lg p-2.5" placeholder="Phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              <input required type="text" className="w-full border rounded-lg p-2.5" placeholder="Location" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
              {role === 'farmer' && <input type="text" className="w-full border rounded-lg p-2.5" placeholder="Primary Crops" value={formData.cropSpecialty} onChange={e => setFormData({...formData, cropSpecialty: e.target.value})} />}
              {role === 'buyer' && <input type="text" className="w-full border rounded-lg p-2.5" placeholder="Business Name" value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} />}
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setStep(1)} className="w-1/3 py-2.5 border rounded-lg">Back</button>
                <button type="submit" className="w-2/3 py-2.5 bg-green-600 text-white rounded-lg font-bold">Register</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export const ContractSignModal = ({ isOpen, onClose, contract, onSign, userRole }) => {
  if (!isOpen || !contract) return null;
  const alreadySigned = (userRole === 'farmer' && contract.signatures?.farmer) || (userRole === 'buyer' && contract.signatures?.buyer);

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="bg-gray-100 p-4 border-b flex justify-between items-center rounded-t-xl">
          <h3 className="font-bold text-lg flex items-center gap-2"><FileSignature size={20}/> Digital Contract Agreement</h3>
          <button onClick={onClose}><X size={20}/></button>
        </div>
        <div className="p-6 overflow-y-auto grow bg-gray-50">
          <div className="bg-white p-8 shadow-sm border border-gray-200 min-h-[500px] text-sm relative">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-serif font-bold text-gray-800">AGRIASSURE COMMODITY AGREEMENT</h2>
              <p className="text-gray-500">Ref: #{contract.id}</p>
            </div>
            <div className="space-y-6 font-serif">
              <p><strong>PARTIES:</strong> {contract.buyerName} (Buyer) AND {contract.listing.seller} (Seller).</p>
              <p><strong>TERMS:</strong> {contract.quantity} of {contract.commodity} at ₹{contract.price}/Qtl.</p>
              <p><strong>PAYMENT:</strong> Funds to be held in Escrow.</p>
            </div>
            <div className="mt-12 pt-8 border-t-2 border-dashed border-gray-300 flex justify-between">
               <div className="text-center">
                  <p className="font-dancing-script text-xl text-blue-800">{contract.signatures?.buyer ? contract.buyerName : 'Pending'}</p>
                  <p className="text-xs uppercase font-bold mt-2">Buyer Signature</p>
               </div>
               <div className="text-center">
                  <p className="font-dancing-script text-xl text-green-800">{contract.signatures?.farmer ? contract.listing.seller : 'Pending'}</p>
                  <p className="text-xs uppercase font-bold mt-2">Seller Signature</p>
               </div>
            </div>
          </div>
        </div>
        <div className="p-4 border-t bg-white rounded-b-xl flex justify-between items-center">
          <div className="text-xs text-gray-500 flex items-center gap-1"><ShieldCheck size={14}/> Legally Binding</div>
          {!alreadySigned ? (
             <button onClick={() => onSign(contract.id)} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 animate-pulse"><PenTool size={16}/> Sign Digitally</button>
          ) : (
             <button disabled className="px-6 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm font-bold flex items-center gap-2"><CheckCircle size={16}/> Signed</button>
          )}
        </div>
      </div>
    </div>
  );
};

export const PaymentModal = ({ isOpen, onClose, contract, onPay }) => {
  const [method, setMethod] = useState('stripe');
  if (!isOpen || !contract) return null;
  const total = parseInt(contract.price) * parseInt(contract.quantity.split(' ')[0] || 1);

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <div className="bg-green-700 p-6 rounded-t-xl text-white"><h3 className="font-bold text-xl flex items-center gap-2"><Lock size={22}/> Secure Escrow Deposit</h3></div>
        <div className="p-6">
          <div className="mb-6 bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex items-start gap-3"><AlertCircle className="text-yellow-600" size={20}/><div className="text-sm text-yellow-800">Funds held in regulated escrow until delivery.</div></div>
          <div className="space-y-3 mb-6">
            <button onClick={() => setMethod('stripe')} className={`w-full flex items-center justify-between p-4 rounded-xl border-2 ${method === 'stripe' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}><div className="flex items-center gap-3"><CreditCard className="text-blue-600"/><p className="font-bold">Stripe Connect</p></div>{method === 'stripe' && <CheckCircle className="text-blue-600"/>}</button>
            <button onClick={() => setMethod('upi')} className={`w-full flex items-center justify-between p-4 rounded-xl border-2 ${method === 'upi' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}><div className="flex items-center gap-3"><span className="font-bold text-green-600 border border-green-600 rounded px-1 text-xs">UPI</span><p className="font-bold">UPI / Bank</p></div>{method === 'upi' && <CheckCircle className="text-green-600"/>}</button>
          </div>
          <div className="flex justify-between items-center pt-4 border-t"><div><p className="text-xs text-gray-500">Total Payable</p><p className="text-2xl font-bold">₹{total}</p></div><button onClick={onPay} className="px-8 py-3 bg-green-700 text-white rounded-lg font-bold flex items-center gap-2"><Lock size={16}/> Deposit</button></div>
        </div>
      </div>
    </div>
  );
};