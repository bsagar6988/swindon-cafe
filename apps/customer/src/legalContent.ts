export type LegalPageKey =
  | "terms"
  | "privacy"
  | "allergy"
  | "help"
  | "cookies"
  | "addBusiness";

export interface LegalPage {
  title: string;
  body: string[];
}

// Dummy/placeholder copy for demo purposes — standard boilerplate wording,
// not drafted or reviewed legal advice.
export const LEGAL_PAGES: Record<LegalPageKey, LegalPage> = {
  terms: {
    title: "Terms and Conditions",
    body: [
      "By placing an order through Swindon Eats you agree to these terms. Swindon Eats is a marketplace that connects you with independent restaurants across Swindon — each order you place is a contract between you and the restaurant preparing it.",
      "Prices, availability, and opening hours are set by each restaurant and may change without notice. Orders are accepted once a restaurant confirms them; a restaurant may decline or cancel an order (for example if it's unexpectedly busy or an item has sold out), in which case you won't be charged.",
      "Delivery times shown in the app are estimates, not guarantees. Occasionally an order may be delayed due to traffic, weather, or kitchen volume.",
      "You're responsible for providing an accurate delivery address and being available to receive your order. If an order can't be delivered because no one is available, it may be cancelled without a refund.",
      "Payment is currently cash / pay-on-delivery for this version of the app. Card payment support may be added in future.",
      "Questions about these terms? Contact us at support@swindoneats.example.",
    ],
  },
  privacy: {
    title: "Privacy Policy",
    body: [
      "Swindon Eats collects the information needed to run the service: your name, email address, delivery addresses, and order history. Restaurant admins can see order details (items, delivery address, and how many previous orders you've placed) so they can fulfil your order; delivery riders can see the delivery address and contact details needed to complete a delivery.",
      "We don't sell your personal data to third parties. Information is used only to operate the marketplace — processing orders, coordinating delivery, and improving the service.",
      "You can review or update your saved addresses at any time from your Profile. To request a copy of your data or ask us to delete your account, email support@swindoneats.example.",
      "We use your device's local storage to keep you signed in and to remember your cart between visits — see our Cookies page for details.",
    ],
  },
  allergy: {
    title: "Allergy Policy",
    body: [
      "Restaurants on Swindon Eats prepare a wide variety of dishes, and many kitchens handle multiple common allergens (including nuts, gluten, dairy, and eggs) in the same space.",
      "While menu descriptions aim to be accurate, we can't guarantee any dish is completely free of a specific allergen due to the risk of cross-contamination during preparation.",
      "If you have a food allergy or intolerance, please contact the restaurant directly before ordering, or reach out to our support team at support@swindoneats.example and we'll help you get in touch.",
      "If you experience an allergic reaction after eating a delivered meal, seek medical attention immediately and then let us know so we can pass on your feedback to the restaurant.",
    ],
  },
  help: {
    title: "Help & Support",
    body: [
      "How do I track my order? Open the Orders tab and tap an order to see its live status, from being accepted by the restaurant through to delivery.",
      "How do I cancel an order? You can cancel from the order tracking screen as long as the restaurant hasn't started preparing it yet.",
      "My order arrived incorrect or incomplete — what do I do? Contact us with your order number and we'll help sort it out.",
      "How do I add or edit a delivery address? Go to Profile → Manage addresses.",
      "Still need help? Email us at support@swindoneats.example or call +44 1793 000000 (Mon–Sun, 9am–9pm).",
    ],
  },
  cookies: {
    title: "Cookies",
    body: [
      "Swindon Eats uses small amounts of local storage on your device (sometimes called \"cookies\" on the web version of the app) to keep you signed in between visits and to remember what's in your cart.",
      "We don't use tracking or advertising cookies. The only data stored locally is what's needed to make the app work — your session token and current cart.",
      "You can clear this data at any time by logging out, which removes your saved session from the device.",
    ],
  },
  addBusiness: {
    title: "Add your business",
    body: [
      "Own or manage a restaurant in Swindon? We'd love to have you on Swindon Eats.",
      "Joining lets you reach local customers browsing the app, manage your own menu, and track orders and sales from a dedicated restaurant dashboard.",
      "To get started, email partners@swindoneats.example with your restaurant's name and a bit about your menu, and our team will set up your account.",
    ],
  },
};
