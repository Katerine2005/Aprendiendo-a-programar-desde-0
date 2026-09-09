/**
 * SERVICIO DE PASARELAS DE PAGO (PAYMENT GATEWAYS)
 * 
 * Aquí podrás configurar e integrar las APIs oficiales de:
 * 1. Stripe (Stripe.js / Stripe Checkout / Elements)
 * 2. PayPal (PayPal JS SDK / REST APIs)
 */

import { CourseId } from '../types';

export type PaymentGatewayType = 'stripe' | 'paypal';

export interface PaymentPayload {
  planId: string;
  planName: string;
  amount: number;
  currency: string;
  courseId?: CourseId | null;
  courseTitle?: string | null;
  customerEmail?: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  gateway: PaymentGatewayType;
  message?: string;
}

/* =========================================================================
 * 1. CONFIGURACIÓN DE STRIPE
 * ========================================================================= */
export const STRIPE_CONFIG = {
  // Clave pública leída automáticamente de .env o fallback por defecto
  publishableKey: (import.meta as any).env?.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51UDrBPLULCBsgwq7xujSqigageCDn0VdP2IdS4cdt2vSHSK4eIsbvmHMH5e3S23vWgN5nSRG9ZwbrefwlKmD5lUg006sjND7Ka',
  // Endpoint de backend para crear Checkout Session
  createCheckoutSessionUrl: '/api/stripe/create-checkout-session',
};

/**
 * Procesa o redirige al flujo de pago con Stripe
 */
export async function processStripePayment(payload: PaymentPayload): Promise<PaymentResponse> {
  console.log('[Stripe API] Iniciando transacción para:', payload);

  // Simulación exitosa mientras configuras tus credenciales de API
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        gateway: 'stripe',
        transactionId: `ch_stripe_${Date.now()}`,
        message: 'Pago procesado exitosamente vía Stripe'
      });
    }, 1200);
  });
}

/* =========================================================================
 * 2. CONFIGURACIÓN DE PAYPAL
 * ========================================================================= */
export const PAYPAL_CONFIG = {
  // Client ID de PayPal leído de .env (Sandbox o Live) o fallback por defecto
  clientId: (import.meta as any).env?.VITE_PAYPAL_CLIENT_ID || 'ASTZzseVgr8i4QQJNr_7OC4idL4-Id0vcpif_7p2W0hhhy0ZZt44d8ItwJrLfueu9nO0qyO3pl2_0RHV',
  currency: (import.meta as any).env?.VITE_PAYPAL_CURRENCY || 'USD',
  // Endpoint de tu backend para capturar órdenes de PayPal (opcional)
  captureOrderUrl: '/api/paypal/capture-order',
};

/**
 * Procesa o redirige al flujo de pago con PayPal
 */
export async function processPayPalPayment(payload: PaymentPayload): Promise<PaymentResponse> {
  console.log('[PayPal API] Iniciando orden de pago para:', payload);

  // Simulación exitosa mientras configuras tus credenciales de API
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        gateway: 'paypal',
        transactionId: `PAYID_${Date.now()}`,
        message: 'Pago completado exitosamente a través de PayPal'
      });
    }, 1200);
  });
}
