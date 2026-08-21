import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  ShieldCheck,
  Building2,
  DollarSign,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Receipt
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QRCodeSVG } from 'qrcode.react';
import { PaymentMethod, Currency, DriverProfile } from '../../types';
import { store } from '../../services/store';

interface DriverDebtSettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  driver: DriverProfile;
  currency: Currency;
}

export const DriverDebtSettlementModal: React.FC<DriverDebtSettlementModalProps> = ({
  isOpen,
  onClose,
  driver,
  currency: defaultCurrency
}) => {
  const state = store.getState();
  const exchangeRate = state.settings.exchangeRateUSDToZWG || 26.85;

  const currentDebtUSD = driver.walletBalance < 0 ? Math.abs(driver.walletBalance) : 0;
  const initialAmount = currentDebtUSD > 0 ? Number(currentDebtUSD.toFixed(2)) : 10.0;

  const [amountUSD, setAmountUSD] = useState<number>(initialAmount);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(defaultCurrency);
  const [method, setMethod] = useState<PaymentMethod>('ecocash');

  // Channel specific inputs
  const [phone, setPhone] = useState<string>(driver.phone || '0771234567');
  const [innbucksCode, setInnbucksCode] = useState<string>(`IB-${Math.floor(100000 + Math.random() * 900000)}`);
  const [cardHolder, setCardHolder] = useState<string>(driver.name);
  const [cardNumber, setCardNumber] = useState<string>('4000 1234 5678 9010');
  const [cardExpiry, setCardExpiry] = useState<string>('12/28');
  const [cardCvv, setCardCvv] = useState<string>('789');
  const [zipitRef, setZipitRef] = useState<string>(`ZP-${Date.now().toString().slice(-6)}`);

  // Processing state
  const [step, setStep] = useState<'input' | 'processing' | 'success'>('input');
  const [processingMsg, setProcessingMsg] = useState<string>('');
  const [completedTxRef, setCompletedTxRef] = useState<string>('');

  if (!isOpen) return null;

  const amountZWG = Math.ceil(amountUSD * exchangeRate);

  const formatDisplayAmount = (usd: number) => {
    if (selectedCurrency === 'ZWG') {
      return `${Math.ceil(usd * exchangeRate)} ZiG`;
    }
    return `$${usd.toFixed(2)} USD`;
  };

  const handleStartPayment = () => {
    if (amountUSD <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }

    setStep('processing');

    if (method === 'ecocash') {
      setProcessingMsg(`Sending EcoCash USSD prompt to ${phone}... Please check your phone.`);
    } else if (method === 'onemoney') {
      setProcessingMsg(`Sending OneMoney *111# PIN push prompt to ${phone}...`);
    } else if (method === 'innbucks') {
      setProcessingMsg(`Verifying InnBucks authorization voucher ${innbucksCode}...`);
    } else if (method === 'card') {
      setProcessingMsg(`Encrypting 3D-Secure transaction with ZimSwitch / VISA gateway...`);
    } else if (method === 'clicknpay') {
      setProcessingMsg(`Connecting to ClicknPay OpenAPI gateway...`);
    } else if (method === 'zipit_bank') {
      setProcessingMsg(`Verifying ZIPIT interbank settlement with ref: ${zipitRef}...`);
    } else {
      setProcessingMsg(`Authorizing payment with RideZW automated settlement desk...`);
    }

    // Interactive realistic simulation
    setTimeout(() => {
      const txRef = `SETTLE-${method.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
      store.driverSettleDebt(driver.id, amountUSD, method);
      setCompletedTxRef(txRef);
      setStep('success');
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    }, 1800);
  };

  const handleFinish = () => {
    setStep('input');
    onClose();
  };

  const paymentOptions: { id: PaymentMethod; label: string; desc: string; icon: any; color: string }[] = [
    {
      id: 'ecocash',
      label: 'EcoCash Mobile Money',
      desc: 'Instant USSD PIN push (USD & ZiG)',
      icon: Smartphone,
      color: 'border-blue-500 bg-blue-50 text-blue-900'
    },
    {
      id: 'onemoney',
      label: 'OneMoney NetOne',
      desc: '*111# Instant mobile wallet prompt',
      icon: Smartphone,
      color: 'border-emerald-500 bg-emerald-50 text-emerald-900'
    },
    {
      id: 'innbucks',
      label: 'InnBucks USD Express',
      desc: 'Simbisa till barcode / 8-digit express code',
      icon: QrCode,
      color: 'border-amber-500 bg-amber-50 text-amber-900'
    },
    {
      id: 'card',
      label: 'ZimSwitch / Bank Card',
      desc: 'VISA, Mastercard & Local Bank Cards',
      icon: CreditCard,
      color: 'border-indigo-500 bg-indigo-50 text-indigo-900'
    },
    {
      id: 'clicknpay',
      label: 'ClicknPay (OpenAPI)',
      desc: 'Aggregated multi-channel payment rail',
      icon: Sparkles,
      color: 'border-purple-500 bg-purple-50 text-purple-900'
    },
    {
      id: 'zipit_bank',
      label: 'ZIPIT Instant Bank',
      desc: 'Direct account interbank transfer',
      icon: Building2,
      color: 'border-slate-500 bg-slate-50 text-slate-900'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-xs">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Settle Cash Debt & Top Up</h3>
              <p className="text-xs text-slate-400">
                Pay platform levy using EcoCash, OneMoney, InnBucks, Cards & Bank Rails
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {step === 'input' && (
            <>
              {/* Current Debt Card */}
              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between ${
                  driver.walletBalance < 0
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}
              >
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider block opacity-75">
                    {driver.walletBalance < 0 ? 'Outstanding Platform Debt' : 'Current Wallet Balance'}
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-xl font-mono font-black">
                      ${Math.abs(driver.walletBalance).toFixed(2)} USD
                    </span>
                    <span className="text-xs font-semibold opacity-80">
                      ≈ {Math.ceil(Math.abs(driver.walletBalance) * exchangeRate)} ZiG
                    </span>
                  </div>
                  {driver.isBlockedDueToDebt && (
                    <div className="flex items-center gap-1 text-[11px] text-rose-700 font-bold mt-1">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>Account paused (exceeds $15.00 limit). Settle now to reactivate!</span>
                    </div>
                  )}
                </div>

                {currentDebtUSD > 0 && (
                  <button
                    onClick={() => setAmountUSD(Number(currentDebtUSD.toFixed(2)))}
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-rose-300 text-rose-700 font-bold text-xs shadow-2xs hover:bg-rose-100 cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Amount Selection & Presets */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">Payment Amount (USD)</label>
                  {/* Currency Switcher */}
                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10px] font-bold">
                    <button
                      onClick={() => setSelectedCurrency('USD')}
                      className={`px-2 py-0.5 rounded ${
                        selectedCurrency === 'USD' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                      }`}
                    >
                      USD ($)
                    </button>
                    <button
                      onClick={() => setSelectedCurrency('ZWG')}
                      className={`px-2 py-0.5 rounded ${
                        selectedCurrency === 'ZWG' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                      }`}
                    >
                      ZiG (ZWG)
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold text-sm">
                    $
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    value={amountUSD}
                    onChange={(e) => setAmountUSD(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-7 pr-24 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-black text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500">
                    ≈ {amountZWG} ZiG
                  </span>
                </div>

                {/* Preset Pills */}
                <div className="flex flex-wrap gap-1.5">
                  {currentDebtUSD > 0 && (
                    <button
                      onClick={() => setAmountUSD(Number(currentDebtUSD.toFixed(2)))}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                        amountUSD === currentDebtUSD
                          ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-2xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Exact Debt (${currentDebtUSD.toFixed(2)})
                    </button>
                  )}
                  {[5, 10, 15, 20, 50].map((val) => (
                    <button
                      key={val}
                      onClick={() => setAmountUSD(val)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                        amountUSD === val
                          ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-2xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      ${val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Methods Grid */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">Select Payment Rail</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {paymentOptions.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = method === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setMethod(opt.id)}
                        className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                          isSelected
                            ? `${opt.color} ring-2 ring-amber-400 shadow-xs`
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-white/80' : 'bg-slate-100'} shrink-0 mt-0.5`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold leading-tight truncate">{opt.label}</p>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">{opt.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Method-Specific Input Fields */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
                {/* EcoCash / OneMoney Fields */}
                {(method === 'ecocash' || method === 'onemoney') && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                      <span>{method === 'ecocash' ? 'EcoCash' : 'OneMoney'} Registered Mobile Number</span>
                      <span className="text-[10px] text-slate-500 font-mono">+263</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="077 123 4567"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <p className="text-[10px] text-slate-500">
                      A real-time prompt will be pushed to your handset. Simply input your mobile PIN to approve payment.
                    </p>
                  </div>
                )}

                {/* InnBucks Fields */}
                {method === 'innbucks' && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800">InnBucks Express Voucher Code</label>
                      <button
                        type="button"
                        onClick={() => setInnbucksCode(`IB-${Math.floor(100000 + Math.random() * 900000)}`)}
                        className="text-[10px] text-amber-700 font-bold hover:underline flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Generate Code</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={innbucksCode}
                      onChange={(e) => setInnbucksCode(e.target.value.toUpperCase())}
                      placeholder="IB-849201"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 tracking-wider"
                    />
                    <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-lg flex items-center gap-3">
                      <QRCodeSVG value={`INNDRIVER:${driver.id}:${amountUSD}:${innbucksCode}`} size={56} />
                      <div className="text-[10px] text-amber-900 space-y-0.5">
                        <p className="font-bold">Scan at any Simbisa Till / InnBucks App</p>
                        <p className="text-slate-600">Present code or scan QR code for instant teller deposit.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Card / ZimSwitch Fields */}
                {method === 'card' && (
                  <div className="space-y-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Cardholder Full Name</label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">16-Digit Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">CVV Security Code</label>
                        <input
                          type="password"
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ClicknPay Fields */}
                {method === 'clicknpay' && (
                  <div className="space-y-1.5 text-xs text-slate-600">
                    <p className="font-bold text-slate-800">ClicknPay Unified Zimbabwe Gateway</p>
                    <p className="text-[11px]">
                      Routes securely through ClicknPay's certified switch, accepting Ecocash, OneMoney, ZimSwitch, and Visa with instant automated webhook settlement.
                    </p>
                  </div>
                )}

                {/* ZIPIT Bank Fields */}
                {method === 'zipit_bank' && (
                  <div className="space-y-2">
                    <div className="text-[11px] text-slate-700 space-y-1 bg-white p-2.5 rounded-lg border border-slate-200">
                      <p><strong>Bank:</strong> Stanbic Bank Zimbabwe</p>
                      <p><strong>Account Name:</strong> RideZW Operations Pvt Ltd</p>
                      <p><strong>Account Number:</strong> 9140003847291 (USD / ZiG)</p>
                      <p><strong>Branch:</strong> Harare Nelson Mandela</p>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">ZIPIT / Bank Reference Code</label>
                      <input
                        type="text"
                        value={zipitRef}
                        onChange={(e) => setZipitRef(e.target.value.toUpperCase())}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleStartPayment}
                  className="flex-1 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.01]"
                >
                  <span>Pay {formatDisplayAmount(amountUSD)}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          )}

          {/* Step 2: Processing Animation */}
          {step === 'processing' && (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-amber-100 border-2 border-amber-400 text-amber-600 flex items-center justify-center mx-auto animate-spin">
                <RefreshCw className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900">Processing Payment...</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">{processingMsg}</p>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-mono rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>256-Bit Encrypted Zimbabwean Banking Gateway</span>
              </div>
            </div>
          )}

          {/* Step 3: Success Confirmation */}
          {step === 'success' && (
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 border-2 border-emerald-500 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-black text-slate-900">Payment Succeeded!</h4>
                <p className="text-xs text-emerald-700 font-semibold">
                  Successfully credited {formatDisplayAmount(amountUSD)} to your driver wallet.
                </p>
              </div>

              {/* Receipt Summary */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-left text-xs space-y-2 text-slate-700">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold flex items-center gap-1">
                    <Receipt className="w-3.5 h-3.5 text-slate-500" />
                    <span>Transaction Receipt</span>
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">{new Date().toLocaleTimeString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Transaction Ref:</span>
                  <span className="font-mono font-bold text-slate-900">{completedTxRef}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Rail:</span>
                  <span className="font-bold text-slate-900 uppercase">{method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">New Net Balance:</span>
                  <span className="font-mono font-black text-emerald-700">
                    ${driver.walletBalance.toFixed(2)} USD
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Dispatch Status:</span>
                  <span className="font-bold text-emerald-700">
                    {driver.isBlockedDueToDebt ? 'Re-activating...' : 'Active (Good Standing)'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleFinish}
                className="w-full py-3 rounded-xl bg-slate-950 hover:bg-slate-900 text-amber-400 font-black text-xs shadow-md transition-all cursor-pointer"
              >
                Return to Driver Cockpit
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
