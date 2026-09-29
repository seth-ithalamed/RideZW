/**
 * Backend payment client for OpenAPI Africa / ClicknPay.
 * Gateway credentials, order creation, status checks, and fulfillment remain server-side.
 */
export interface ClicknPayOrderRequest { orderReference: string; amount: number; currency: 'USD' | 'ZWG'; customerName: string; customerPhone: string; customerEmail?: string; channel?: 'ecocash' | 'onemoney' | 'innbucks' | 'card' | 'zipit' | 'general'; description: string; returnUrl?: string; relatedId?: string; purpose?: 'ride' | 'driver_debt' | 'driver_topup'; productName?: string; }
export interface ClicknPayOrderResponse { success: boolean; clientReference: string; redirectUrl?: string; checkoutUrl?: string; status: 'PENDING' | 'SUCCESS' | 'FAILED'; message?: string; }
export class ClicknPayService {
  private static instance: ClicknPayService;
  private constructor() {}
  public static getInstance() { if (!ClicknPayService.instance) ClicknPayService.instance = new ClicknPayService(); return ClicknPayService.instance; }
  public async createOrder(params: ClicknPayOrderRequest): Promise<ClicknPayOrderResponse> {
    const response = await fetch('/api/payments/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(params) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Payment order could not be created');
    return { success: true, clientReference: data.clientReference, redirectUrl: data.paymeURL, checkoutUrl: data.paymeURL, status: data.status || 'PENDING' };
  }
  public async verifyTransaction(clientReference: string): Promise<{ isPaid: boolean; status: 'PENDING' | 'SUCCESS' | 'FAILED' }> {
    const response = await fetch('/api/payments/orders/' + encodeURIComponent(clientReference) + '/status');
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Payment status could not be checked');
    return { isPaid: data.status === 'SUCCESS', status: data.status || 'PENDING' };
  }
}
export const clicknpay = ClicknPayService.getInstance();
