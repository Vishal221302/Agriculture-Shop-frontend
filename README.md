# E-Commerce Frontend

This is the frontend application for the E-Commerce platform, built with React.

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables manually in `src/config.js` or through an `.env` file if configured. Ensure `API_BASE_URL` points to your backend instance.

3. Run the development server:
   ```bash
   npm run dev
   ```
   Or similar command based on your package.json scripts.

4. Build for production:
   ```bash
   npm run build
   ```

## N8n Webhook Integration
When a user places an order, the frontend sends a POST request to an n8n webhook (`https://n8n.avertisystems.com/webhook/Agro-order`). 
This integration powers WhatsApp notifications to both the customer and admin.

The JSON payload structure sent to the webhook includes:
- `product_name`: A comma-separated string containing product names along with their purchased quantities e.g., "Fertilizer (x2), Seeds (x1)".
- `customer_name`: The buyer's full name.
- `phone`: The buyer's contact mobile number.
- `address`: Delivery address.
- `price`: The total cart value.
- `product_image`: A comma-separated string of the full URLs to the ordered product images.

## WhatsApp Notifications
Below are previews of the notifications sent by n8n:

### Customer Notification
![customer](https://github.com/user-attachments/assets/b9bbeb63-64bb-46f7-9afe-5ca7f7e87aeb)

### Admin Notification
![admin](https://github.com/user-attachments/assets/1bcbd290-f1ca-4fca-9b7b-c34eca3d8261)


