# WedLink

Self-serve wedding invite websites. Couples build an invite, preview it free, pay via Razorpay, and get a shareable link.

- PHP 8.1+, SQLite, GD. No build step.
- Customer data and uploads live in `../wedlink-data/` (outside `public_html`), so deploys never touch them.
- Admin: `/admin/`. Paste Razorpay keys, Meta Pixel ID and prices in Settings. Enter daily ad spend to see profit.
- Razorpay webhook: `/api.php?a=webhook` with events `order.paid` and `payment.captured`.
