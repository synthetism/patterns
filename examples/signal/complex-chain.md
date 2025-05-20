```typescript
// Create a chain of operations
async function processOrder(orderId: string): Promise<Signal<OrderResult>> {
  return Signal.success(orderId, 'OrderProcess.Start')
    .mapAsync(id => validateOrder(id), 'OrderProcess.Validate')
    .mapAsync(async order => {
      const paymentResult = await processPayment(order);
      
      // Example of Signal composition - we can merge traces
      if (paymentResult.isFailure) {
        return paymentResult.annotate('Payment processing failed');
      }
      
      return Signal.success({
        order,
        paymentId: paymentResult.value
      }, 'OrderProcess.Payment');
    })
    .mapAsync(async data => {
      // Observe without affecting the chain
      return Signal.success(data)
        .observe('Metrics', signal => {
          metrics.recordSuccessfulOrder(signal.value.order.id);
        })
        .map(data => {
          return {
            orderId: data.order.id,
            status: 'complete',
            paymentId: data.paymentId
          };
        }, 'OrderProcess.Format');
    })
    .annotate('Order processing completed');
}
````