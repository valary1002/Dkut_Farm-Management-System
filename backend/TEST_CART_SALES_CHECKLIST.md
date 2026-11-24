# Cart and confirmed-sales verification

## Backend

1. Start the backend and verify `GET /api/health`.
2. Log in as a customer and use the JWT for `/api/cart`.
3. Create a cart with:
   - `POST /api/cart/items` containing a valid produce id and quantity.
4. Fetch it with `GET /api/cart`.
5. Checkout with:
   - `POST /api/orders/checkout`
   - Include `deliveryAddress`, `phoneNumber`, and `paymentMethod`.
6. Record the returned `orderId` and `totalAmount`.
7. Log in as an administrator and call:
   - `PATCH /api/orders/<orderId>/confirm`
8. Fetch `GET /api/reports/dashboard`.
9. Verify `totalSales` increased by exactly the order's `totalAmount`.
10. Repeat the confirm request and verify the value does not increase again.

## UI

1. Add one or more produce cards to the cart.
2. Confirm the header badge count updates.
3. Open `/app/cart`, change quantities, and remove items.
4. Checkout and verify the cart clears and the order appears in `/app/orders`.
5. Confirm the order in the admin dashboard or `/app/orders`.
6. Verify Total Sales, Recent Orders, and payment status update without a manual page refresh.
