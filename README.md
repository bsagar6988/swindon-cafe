# Swindon Eats — Test Guide

A multi-restaurant food delivery app suite for Swindon, made up of three apps (customer, restaurant admin, delivery rider) sharing one backend. This guide has everything needed to try it out.

## Live apps

| App | URL | Who it's for |
|---|---|---|
| **Customer** | https://customer-swindon-cafe.vercel.app | Browsing restaurants and ordering food |
| **Restaurant (Kitchen)** | https://restaurant-swindon-cafe.vercel.app | Restaurant owners/staff managing menu & orders, and the platform admin |
| **Delivery (Rider)** | https://delivery-swindon-cafe.vercel.app | Delivery riders accepting and completing deliveries |

All three are web apps — just open the links in a browser (desktop or mobile). No install needed.

## Test accounts

Password for every account below is: **`password123`**

### Customer app
| Email | Name |
|---|---|
| `customer@example.com` | Casey Customer |
| `gnanashekhar@example.com` | Gnanashekhar |
| `loganathan@example.com` | Loganathan |

Or tap **"Create an account"** on the login screen to sign up as a brand new customer.

### Restaurant app
| Email | Role | What they see |
|---|---|---|
| `superadmin@example.com` | Platform admin | A "Restaurants" screen listing every restaurant on the platform, plus an "Add restaurant" button to create new ones (and their first admin login) |
| `admin@example.com` | Restaurant admin — **Swindon Eats** | Dashboard, incoming orders, menu management, riders, for the Swindon Eats restaurant only |
| `wok-admin@example.com` | Restaurant admin — **Golden Wok** | Same as above, scoped to the Golden Wok restaurant only |

### Delivery app
| Email | Name |
|---|---|
| `rider@example.com` | Dana Delivery |

## Suggested test flow (full order lifecycle)

1. **Customer app** — log in as `customer@example.com`, browse the restaurant list, pick **Swindon Eats** or **Golden Wok**, add a few items to the cart, check out with a delivery address.
2. **Restaurant app** — log in as the matching restaurant admin (`admin@example.com` for Swindon Eats, `wok-admin@example.com` for Golden Wok). The new order appears in the Orders queue — accept it, then move it through Preparing → Ready for pickup.
3. **Delivery app** — log in as `rider@example.com`. The order shows up under Available Deliveries once it's ready — accept it, mark it out for delivery, then Delivered.
4. Back in the **customer app**, refresh the order tracking screen to see the status update live, and leave a star rating once delivered.

Other things worth trying:
- **Two restaurants, one cart**: add an item from Swindon Eats, then try adding an item from Golden Wok — the app warns that it'll clear your cart before switching restaurants.
- **Platform admin**: log in as `superadmin@example.com` in the restaurant app and add a brand new restaurant (with its own admin login) — then log in as that new admin to confirm they only see their own (empty) restaurant.
- **Profile → Legal & Help / About** in the customer app for the static content pages and company info.
- **Cancel an order** from the customer app before the restaurant accepts it.
- **Restaurant open/closed toggle** in the restaurant admin's Profile tab — closing the restaurant blocks new orders from customers.

## Notes

- Payment is cash / pay-on-delivery for this version — no real card payment is processed.
- This is a demo project — addresses, phone numbers, and business names are placeholders.
