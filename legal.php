<?php
require __DIR__ . '/lib/bootstrap.php';
$p = $_GET['p'] ?? 'terms';
$brand = e(setting('brand'));
$biz = e(setting('business_name'));
$email = e(setting('support_email'));
$phone = e(setting('support_phone'));
$addr = e(setting('address'));
$ps = price('standard'); $pp = price('premium');
$contactLine = trim(($email ? "Email: <a href=\"mailto:$email\">$email</a>" : '') . ($email && $phone ? '<br>' : '') . ($phone ? "Phone and WhatsApp: <a href=\"https://wa.me/91" . e(normalize_phone(setting('support_phone'))) . "\">$phone</a>" : ''));
$pages = [
  'contact' => ['Contact us', "<p>We're happy to help with your invite, payments or refunds.</p><h2>Reach us</h2><p>$contactLine</p><h2>Business</h2><p>$biz<br>$addr</p><p>We reply within one working day, usually much sooner.</p>"],
  'terms' => ['Terms of service', "<p>These terms apply when you use $brand, operated by $biz.</p>
    <h2>The service</h2><p>$brand lets you design a wedding or event invitation and publish it as a web page with its own link. You can preview your invite free. Publishing costs ₹$ps (Standard) or ₹$pp (Premium), paid once.</p>
    <h2>Your content</h2><p>You are responsible for the names, text, photos and music you add. Only upload content you have the right to use. We may remove invites with unlawful or abusive content.</p>
    <h2>Availability</h2><p>Published invites stay online for 12 months from the date of payment. You can edit your invite during that time using your private edit link. Keep that link safe: anyone with it can edit your invite.</p>
    <h2>Payments</h2><p>Payments are processed by Razorpay. Prices are in Indian rupees and include all charges shown at checkout.</p>
    <h2>Liability</h2><p>We work to keep invites online and correct, but we are not liable for indirect losses arising from downtime or errors in details you entered.</p>
    <h2>Contact</h2><p>$contactLine</p>"],
  'privacy' => ['Privacy policy', "<p>This policy explains what $biz collects through $brand and why.</p>
    <h2>What we collect</h2><ul><li>Details you enter for your invite: names, family details, event dates and venues, photos and music.</li><li>Your WhatsApp number and optional email, to save your invite and help you if something goes wrong.</li><li>RSVP replies your guests send, which only you can see.</li><li>Basic visit data and advertising identifiers (Meta Pixel) to measure our ads.</li></ul>
    <h2>How we use it</h2><p>To show your invite, process your payment, support you, and improve our service. We do not sell your data.</p>
    <h2>Payments</h2><p>Card, UPI and bank details go directly to Razorpay. We never see or store them.</p>
    <h2>Retention and deletion</h2><p>Invites and their photos are kept while the invite is live and for up to 30 days after. Ask us any time and we'll delete your invite and data.</p>
    <h2>Contact</h2><p>$contactLine</p>"],
  'refund' => ['Refund and cancellation policy', "<p>You can see your complete invite before paying, so please check it carefully first.</p>
    <h2>When we refund</h2><ul><li>You were charged more than once for the same invite.</li><li>You paid but your invite did not go live and we could not fix it within 24 hours.</li><li>You ask within 24 hours of payment and have not shared the link yet.</li></ul>
    <h2>How refunds work</h2><p>Contact us with the phone number you used. Approved refunds go back to your original payment method within 5 to 7 working days.</p>
    <h2>Cancellation</h2><p>There is no subscription to cancel. Payment is one time.</p>
    <h2>Contact</h2><p>$contactLine</p>"],
];
if (!isset($pages[$p])) $p = 'terms';
site_head($pages[$p][0] . ' | ' . setting('brand'));
?>
<body>
<header class="top"><div class="wrap top-in"><a class="logo" href="/"><?= $brand ?></a><a class="btn small" href="/create">Make our invite</a></div></header>
<main class="wrap legal"><h1><?= $pages[$p][0] ?></h1><?= $pages[$p][1] ?><p style="margin-top:28px;font-size:.9rem">Last updated <?= date('j F Y') ?>.</p></main>
<?php site_footer(); ?>
</body>
</html>
