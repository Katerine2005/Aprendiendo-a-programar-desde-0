import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  Check, 
  Globe, 
  Zap, 
  Layers,
  Code2
} from 'lucide-react';

import { CourseId } from '../types';
import { 
  PaymentGatewayType, 
  processStripePayment, 
  processPayPalPayment, 
  processPaddlePayment,
  PaymentPayload,
  PAYPAL_CONFIG,
  STRIPE_CONFIG
} from '../services/paymentGateways';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { recordNewPurchase } from '../services/transactionService';
import { getActiveUserSession } from '../services/authService';
import { supabaseService } from '../services/supabaseService';

export interface PlanDetails {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  badge?: string;
  features: string[];
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: PlanDetails | null;
  courseId?: CourseId | null;
  courseTitle?: string | null;
  onSuccessPay?: (planName: string) => void;
  onCourseUnlocked?: (courseId: CourseId) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  selectedPlan,
  courseId,
  courseTitle,
  onSuccessPay,
  onCourseUnlocked
}) => {
  const [selectedGateway, setSelectedGateway] = useState<PaymentGatewayType>('paypal');
  const [customerEmail, setCustomerEmail] = useState('estudiante@codex.edu.hn');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');
  const [savePayment, setSavePayment] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [completedTxId, setCompletedTxId] = useState<string>('');
  const [completedGateway, setCompletedGateway] = useState<PaymentGatewayType>('paypal');

  if (!isOpen || !selectedPlan) return null;

  const numericAmount = parseFloat(selectedPlan.price.replace(/[^0-9.]/g, '')) || 5.00;

  const handleExecutePayment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsProcessing(true);

    const payload: PaymentPayload = {
      planId: selectedPlan.id,
      planName: selectedPlan.name,
      amount: numericAmount,
      currency: 'USD',
      courseId,
      courseTitle,
      customerEmail
    };

    try {
      let result;
      if (selectedGateway === 'stripe') {
        result = await processStripePayment(payload);
      } else if (selectedGateway === 'paddle') {
        result = await processPaddlePayment(payload);
      } else {
        result = await processPayPalPayment(payload);
      }

      if (result.success) {
        const session = getActiveUserSession();
        const recorded = recordNewPurchase({
          studentName: session?.fullName || 'Estudiante CODEX',
          studentEmail: customerEmail.trim() || session?.email || 'estudiante@codex.edu.hn',
          planName: selectedPlan.name,
          amount: selectedPlan.price,
          method: selectedGateway,
          courseId: courseId || null,
          cardLast4: selectedGateway === 'stripe' ? (cardNumber.replace(/\s+/g, '').slice(-4) || '4242') : undefined
        });

        // Registrar en Supabase
        supabaseService.recordTransaction(recorded, session?.id).catch(err => {
          console.warn('Error syncing purchase to Supabase:', err);
        });

        setCompletedTxId(result.transactionId || recorded.id);
        setCompletedGateway(selectedGateway);
        setIsProcessing(false);
        setIsSuccess(true);
        if (courseId && onCourseUnlocked) {
          onCourseUnlocked(courseId);
        }
        if (onSuccessPay) {
          onSuccessPay(selectedPlan.name);
        }
      }
    } catch (err) {
      console.error('Error al procesar con pasarela:', err);
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto"
        >
          {/* HEADER */}
          <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <button
              onClick={() => {
                setIsSuccess(false);
                onClose();
              }}
              className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors cursor-pointer text-sm font-bold"
            >
              <ArrowLeft className="w-5 h-5 text-indigo-400" />
              <span className="text-base font-extrabold text-white">Pasarela de Pagos Oficial CODEX</span>
            </button>

            <span className="flex items-center space-x-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 font-semibold">
              <Lock className="w-3.5 h-3.5" />
              <span>Conexión Encriptada SSL 256-bit</span>
            </span>
          </div>

          {/* MAIN CHECKOUT BODY */}
          {isSuccess ? (
            <div className="p-8 sm:p-12 text-center space-y-6">
              <div className="w-20 h-20 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="text-2xl font-black text-white">
                  {courseId ? '¡Curso Desbloqueado con Éxito!' : '¡Plan Adquirido Exitosamente!'}
                </h3>
                <p className="text-sm text-slate-300">
                  {courseId ? (
                    <>
                      Has adquirido la licencia de <strong className="text-indigo-400">{courseTitle || selectedPlan.name}</strong> por {selectedPlan.price}. Ya puedes acceder a todas las lecciones prácticas, retos interactivos y al compilador en tiempo real.
                    </>
                  ) : (
                    <>
                      Has adquirido el <strong className="text-indigo-400">{selectedPlan.name}</strong> por {selectedPlan.price}. Tu estado de membresía se ha actualizado en tu perfil.
                    </>
                  )}
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-slate-400 max-w-lg mx-auto space-y-2 text-left">
                <div className="flex items-center justify-between text-emerald-400 font-bold">
                  <span className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Transacción Aprobada</span>
                  </span>
                  <span className="uppercase text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Vía {completedGateway}
                  </span>
                </div>
                <p className="font-mono text-[11px] text-slate-300">
                  ID Transacción: <span className="text-white font-bold">{completedTxId}</span>
                </p>
                <p>
                  El acceso permanente ha sido vinculado a tu cuenta institucional en CODEX Edu.
                </p>
              </div>

              <button
                onClick={() => {
                  setIsSuccess(false);
                  onClose();
                }}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-600/30"
              >
                {courseId ? 'Comenzar a Aprender Ahora' : 'Volver a Mi Perfil'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              
              {/* LEFT COLUMN: 3 PAYMENT GATEWAYS (PAYPAL, PADDLE, STRIPE) */}
              <div className="lg:col-span-7 p-6 sm:p-8 space-y-6 border-b lg:border-b-0 lg:border-r border-slate-800">
                
                {/* GATEWAYS SELECTION TABS */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Selecciona la Pasarela de Pago
                    </label>
                    <span className="text-[10px] text-indigo-400 font-semibold">3 Métodos Oficiales</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    {/* 1. PAYPAL BUTTON */}
                    <button
                      type="button"
                      onClick={() => setSelectedGateway('paypal')}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-1 ${
                        selectedGateway === 'paypal'
                          ? 'bg-blue-600/15 border-[#0070BA] ring-2 ring-[#0070BA]/40 text-white shadow-lg'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-[#003087]/20 border border-[#0070BA]/30 flex items-center justify-center text-[#0070BA] font-black text-sm">
                        P
                      </div>
                      <span className="text-xs font-bold text-white">PayPal</span>
                      <span className="text-[10px] text-slate-400">Saldo & Cards</span>
                    </button>

                    {/* 2. PADDLE BUTTON */}
                    <button
                      type="button"
                      onClick={() => setSelectedGateway('paddle')}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-1 ${
                        selectedGateway === 'paddle'
                          ? 'bg-emerald-600/15 border-emerald-500 ring-2 ring-emerald-500/40 text-white shadow-lg'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-sm">
                        <Layers className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-white">Paddle</span>
                      <span className="text-[10px] text-slate-400">Billing Global</span>
                    </button>

                    {/* 3. STRIPE BUTTON */}
                    <button
                      type="button"
                      onClick={() => setSelectedGateway('stripe')}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-1 ${
                        selectedGateway === 'stripe'
                          ? 'bg-indigo-600/15 border-[#635BFF] ring-2 ring-[#635BFF]/40 text-white shadow-lg'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-[#635BFF]/20 border border-[#635BFF]/30 flex items-center justify-center text-[#635BFF] font-black text-sm">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-white">Stripe</span>
                      <span className="text-[10px] text-slate-400">Tarjetas & Pay</span>
                    </button>
                  </div>
                </div>

                {/* GATEWAY 1: PAYPAL VIEW */}
                {selectedGateway === 'paypal' && (
                  <div className="space-y-4 pt-1">
                    <div className="bg-[#0070BA]/10 border border-[#0070BA]/30 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-[#0070BA] flex items-center space-x-1.5">
                          <Globe className="w-4 h-4" />
                          <span>PayPal Checkout</span>
                        </span>
                        <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                          Protección al Comprador
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Paga con tu saldo PayPal, cuenta bancaria o cualquier tarjeta de débito/crédito vinculada en un entorno de máxima seguridad internacional.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">Correo para recibo de compra</label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#0070BA]"
                        placeholder="tu@correo.com"
                      />
                    </div>

                    {/* DEDICATED PAYPAL BUTTON */}
                    {PAYPAL_CONFIG.clientId && PAYPAL_CONFIG.clientId !== 'tu_paypal_client_id_aqui' ? (
                      <div className="pt-2">
                        <PayPalScriptProvider options={{ clientId: PAYPAL_CONFIG.clientId, currency: PAYPAL_CONFIG.currency || 'USD' }}>
                          <PayPalButtons
                            style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay' }}
                            createOrder={(data, actions) => {
                              return actions.order.create({
                                intent: 'CAPTURE',
                                purchase_units: [
                                  {
                                    description: selectedPlan.name,
                                    amount: {
                                      currency_code: PAYPAL_CONFIG.currency || 'USD',
                                      value: numericAmount.toFixed(2),
                                    },
                                  },
                                ],
                              });
                            }}
                            onApprove={async (data, actions) => {
                              if (actions.order) {
                                const details = await actions.order.capture();
                                const session = getActiveUserSession();
                                const recorded = recordNewPurchase({
                                  studentName: session?.fullName || 'Estudiante CODEX',
                                  studentEmail: customerEmail.trim() || session?.email || 'estudiante@codex.edu.hn',
                                  planName: selectedPlan.name,
                                  amount: selectedPlan.price,
                                  method: 'paypal',
                                  courseId: courseId || null,
                                });
                                supabaseService.recordTransaction(recorded, session?.id).catch(err => {
                                  console.warn('Error syncing purchase to Supabase:', err);
                                });
                                setCompletedTxId(details.id || recorded.id);
                                setCompletedGateway('paypal');
                                setIsSuccess(true);
                                if (courseId && onCourseUnlocked) onCourseUnlocked(courseId);
                                if (onSuccessPay) onSuccessPay(selectedPlan.name);
                              }
                            }}
                          />
                        </PayPalScriptProvider>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleExecutePayment()}
                        disabled={isProcessing}
                        className="w-full py-3.5 px-6 rounded-2xl bg-[#FFC439] hover:bg-[#ffbe25] text-[#003087] font-black text-sm sm:text-base transition-all cursor-pointer shadow-lg shadow-amber-400/20 flex items-center justify-center space-x-2.5 disabled:opacity-50"
                      >
                        <span className="font-extrabold text-base italic">PayPal</span>
                        <span>• Pagar {selectedPlan.price} (Modo Prueba)</span>
                      </button>
                    )}

                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center space-x-2 text-[11px] text-slate-400">
                      <Code2 className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>
                        {PAYPAL_CONFIG.clientId && PAYPAL_CONFIG.clientId !== 'tu_paypal_client_id_aqui' ? (
                          <span className="text-emerald-400 font-semibold">
                            ✅ PayPal SDK activo en vivo ({PAYPAL_CONFIG.clientId.slice(0, 10)}...)
                          </span>
                        ) : (
                          <span>
                            Conector listo: Añade <code className="text-sky-300">VITE_PAYPAL_CLIENT_ID</code> en tu <code className="text-sky-300">.env</code> o Vercel para activar los botones en vivo.
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                )}

                {/* GATEWAY 2: PADDLE VIEW */}
                {selectedGateway === 'paddle' && (
                  <div className="space-y-4 pt-1">
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-emerald-400 flex items-center space-x-1.5">
                          <Layers className="w-4 h-4" />
                          <span>Paddle Billing (Merchant of Record)</span>
                        </span>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          Soporte Global & Facturación
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Checkout unificado con cálculo automático de impuestos locales, retenciones e IVA internacional adaptado a tu país de residencia.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">Correo para facturación electrónica</label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                        placeholder="tu@correo.com"
                      />
                    </div>

                    {/* DEDICATED PADDLE BUTTON */}
                    <button
                      type="button"
                      onClick={() => handleExecutePayment()}
                      disabled={isProcessing}
                      className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-sm sm:text-base transition-all cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      <ShieldCheck className="w-5 h-5 text-slate-950" />
                      <span>Pagar con Paddle ({selectedPlan.price})</span>
                    </button>

                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center space-x-2 text-[11px] text-slate-400">
                      <Code2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>
                        Conector preparado: Configura tu <strong>Vendor ID / Token de Paddle</strong> en <code className="text-emerald-300">src/services/paymentGateways.ts</code>.
                      </span>
                    </div>
                  </div>
                )}

                {/* GATEWAY 3: STRIPE VIEW */}
                {selectedGateway === 'stripe' && (
                  <form onSubmit={handleExecutePayment} className="space-y-4 pt-1">
                    <div className="bg-[#635BFF]/10 border border-[#635BFF]/30 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-[#635BFF] flex items-center space-x-1.5">
                          <CreditCard className="w-4 h-4" />
                          <span>Stripe Payments Engine</span>
                        </span>
                        <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                          PCI DSS Nivel 1
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Procesa tu pago de forma instantánea con tarjetas de crédito o débito Visa, Mastercard o American Express con cifrado punto a punto.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-300">Número de tarjeta</label>
                        <button
                          type="button"
                          onClick={() => {
                            setCardNumber('4242 4242 4242 4242');
                            setExpiryDate('12/28');
                            setCvc('123');
                          }}
                          className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-0.5 rounded-lg border border-indigo-500/20 transition-all cursor-pointer flex items-center space-x-1"
                        >
                          <span>⚡ Usar Tarjeta de Prueba (4242)</span>
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="4242 •••• •••• 4242"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#635BFF] transition-all"
                        />
                        <div className="absolute right-3 top-2.5 flex items-center space-x-1.5 pointer-events-none">
                          <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">VISA</span>
                          <span className="text-[10px] font-black text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">MC</span>
                          <span className="text-[10px] font-black text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20">AMEX</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-300">Vencimiento</label>
                        <input
                          type="text"
                          placeholder="MM/AA"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#635BFF] transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-300">CVC / CVV</label>
                        <input
                          type="password"
                          placeholder="123"
                          maxLength={4}
                          value={cvc}
                          onChange={(e) => setCvc(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#635BFF] transition-all"
                        />
                      </div>
                    </div>

                    {/* DEDICATED STRIPE BUTTON */}
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full py-3.5 px-6 rounded-2xl bg-[#635BFF] hover:bg-[#5851ea] text-white font-black text-sm sm:text-base transition-all cursor-pointer shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      <Zap className="w-4 h-4 fill-white" />
                      <span>Pagar con Stripe ({selectedPlan.price})</span>
                    </button>

                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center space-x-2 text-[11px] text-slate-400">
                      <Code2 className="w-4 h-4 text-[#635BFF] shrink-0" />
                      <span>
                        {STRIPE_CONFIG.publishableKey && STRIPE_CONFIG.publishableKey !== 'pk_test_tu_clave_publica_stripe_aqui' ? (
                          <span className="text-emerald-400 font-semibold">
                            ✅ Stripe Engine activo en vivo ({STRIPE_CONFIG.publishableKey.slice(0, 16)}...)
                          </span>
                        ) : (
                          <span>
                            Conector preparado: Configura tu <strong>Publishable Key de Stripe</strong> en <code className="text-indigo-300">src/services/paymentGateways.ts</code>.
                          </span>
                        )}
                      </span>
                    </div>
                  </form>
                )}

              </div>

              {/* RIGHT COLUMN: PLAN ORDER SUMMARY */}
              <div className="lg:col-span-5 p-6 sm:p-8 bg-slate-950 flex flex-col justify-between space-y-6">
                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                      Resumen de la Orden
                    </span>
                    <h3 className="text-xl font-extrabold text-white mt-2">{selectedPlan.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">{selectedPlan.description}</p>
                  </div>

                  {/* Features list */}
                  <div className="space-y-2.5">
                    <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Beneficios Incluidos</p>
                    {selectedPlan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-xs text-slate-300">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* Price breakdown */}
                  <div className="border-t border-slate-800 pt-4 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Pasarela seleccionada</span>
                      <span className="font-bold text-indigo-400 uppercase">{selectedGateway}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Precio del Curso / Plan</span>
                      <span className="font-bold text-slate-200">{selectedPlan.price}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Impuestos & Tarifas</span>
                      <span className="font-bold text-emerald-400">Incluidos (0.00 USD)</span>
                    </div>
                    <div className="border-t border-slate-800 pt-3 flex justify-between items-baseline">
                      <span className="font-black text-sm text-white">Total a Pagar</span>
                      <span className="font-black text-xl text-emerald-400">{selectedPlan.price}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => handleExecutePayment()}
                    disabled={isProcessing}
                    className="w-full py-3.5 px-6 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-black text-sm sm:text-base transition-all cursor-pointer shadow-xl flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <span>Procesando con {selectedGateway}...</span>
                    ) : (
                      <>
                        <span>Completar Pago con {selectedGateway === 'paypal' ? 'PayPal' : selectedGateway === 'paddle' ? 'Paddle' : 'Stripe'}</span>
                        <Zap className="w-4 h-4 text-indigo-600 fill-indigo-600" />
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-slate-500 text-center leading-tight">
                    Acceso vitalicio garantizado con validación automática y activación instantánea del curso.
                  </p>
                </div>

              </div>

            </div>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

