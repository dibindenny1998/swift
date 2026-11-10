# TheWedLink: website changes to sell more

> **Status (10 Nov 2026):** Items ticked [x] are live on thewedlink.in. Unticked items need you: real couples (6), a cheap-phone and load test (20), the ad budget, the product features (21–23) and the outside work (H).

Reviewed against the live homepage of thewedlink.in on 10 Nov 2026. The changes are based on:
- the board review (`board.md`)
- the competitor map (`competitors.md`)
- three simulated buyer panels (`panel/`, `panel-v2/`, `panel-v3/`, `panel-comparison.md`)
- the pricing (`pricing.md`) and offer (`offer.md`) work

> The panels were simulated buyers. Use them to decide what to change and test, then confirm with real sales.

**If you only do five things:** items 1, 4, 8, 11 and 14.

---

## A. Fix first: claims that could hurt trust or break rules

- [x] **1. Remove the ₹499 strikethrough on Premium.**
  - ✅ Done. One honest price, ₹999, with no strikethrough.
  - Now: "~~₹499~~ ₹299, launch offer".
  - If ₹499 was never actually charged, that's a fake reference price, which Indian consumer-protection rules treat as misleading. Show one honest price.
- [x] **2. Remove the "Most Popular" tag on Premium,** unless your real sales show it sells the most.
  - ✅ Done. Tag removed.
- [x] **3. Keep the countdown honest.** "Ends in 52 days" matches 31 Dec, which is fine. Don't extend it or reset it when it runs out.
  - ✅ Done. The launch offer bar and its countdown are switched off, so there is no countdown left to reset.

## B. Trust: the #1 reason people didn't buy

Buyers in every panel said: *"I've never heard of TheWedLink and nobody in my family has used it."*

- [x] **4. Add a WhatsApp button** on every page, floating at bottom right, with a real number a person answers.
  - ✅ Built. It shows on every page as soon as you add your support number in Admin → Settings (Support phone). It stays hidden until then.
  - Text: **"Questions? WhatsApp us"**
  - There's currently no way to reach a person, and buyers said *"there's no one to call."*
- [x] **5. Make the sample site a big button.**
  - ✅ Done. The "See a live wedding site →" button goes to /sample, which is clearly labelled as a sample.
  - Now: `thewedlink.in/i/arjun-meera` appears as plain text.
  - Change to a button: **"See a live wedding site →"**
  - Don't present the sample as a real couple's wedding.
- [ ] **6. Add a "Real weddings" section** once founding couples give permission. Show their actual sites, with names hidden on request.
- [x] **7. Add an FAQ section** above the closing call to action:
  - ✅ Done. Eight questions on the homepage and pricing page, also added to Google's FAQ data.
  - *Will older relatives be able to open it?* (Yes: it opens from WhatsApp like any link, with no app or login. Add the card image once item 21 is built.)
  - *What if the link stops working near the wedding?* (Say what you actually do: monitoring, the WhatsApp support number, and the refund terms.)
  - *How long does it stay live?*
  - *Can I change times or venues after sending?* (Yes, every guest sees the update.)
  - *Is my payment and my family's data safe?* (PayU, your privacy policy, and who can see the site.)
  - *Can you build it for me?* (Yes: Built for you.)
- [x] **8b. Add business details** to the footer and Contact page: business name, city and support number.
  - ✅ Done. Footer and Contact page show TheWedLink · Bangalore, Karnataka. The phone number and email appear once added in Admin → Settings.

## C. Message: sell convenience, not "instead of a card"

The panels showed most families print cards for elders anyway, so "instead of a printed card" makes them think *"then I don't need this."*

- [x] **8. Replace the hero headline.**
  - ✅ Done.
  - Now: "Wedding website & biodata maker" / "Send one link on WhatsApp instead of a printed card."
  - New:
    > **One link. Every guest knows where to go, and you know who's coming.**
    > Maps to every venue, your story and photos, RSVP, and changes that reach everyone at once. Send it on WhatsApp.
  - Button: **"Make our wedding link, free"**
- [x] **9. Position it alongside the card, not as a replacement.** Add a line under the hero:
  - ✅ Done.
  > **Your card for the elders. Your link for everyone.**
- [x] **10. Move the feature strip up,** directly under the hero, and lead with what a card can't do:
  - ✅ Done. It sits directly under the hero.
  1. **RSVP headcount**: know who's coming, for each function
  2. **Maps to every venue**: one tap, no "where is the hall?" calls
  3. **Change once, everyone sees it**: no corrected cards
  4. **Your story and photos**

## D. Pricing section

- [x] **11. Go from 4 plans to 3:**
  - ✅ Done. Prices are editable in Admin → Settings.

| | Free | One Link Wedding | Built for you |
| --- | --- | --- | --- |
| **Price** | ₹0 | **₹999** (test ₹699 against it) | **₹1,999**, fixed |
| Events | 1 | All functions | All functions |
| Maps, countdown | ✓ | ✓ | ✓ |
| Story, 15 photos, video, all designs | — | ✓ | ✓ |
| RSVP, gift list, headcount sheet | — | ✓ | ✓ |
| "Crafted by TheWedLink" mark | Yes | No | No |
| Live for | 1 month | 1 year | 1 year |
| Who fills it in | You | You | **Us**, from your WhatsApp message |
| Button | Start free | Choose One Link Wedding | Send us your details |

- [x] **12. Drop Standard (₹199).** Nobody chose it in any panel.
  - ✅ Done. Sites already on Standard keep working until they expire.
- [x] **13. Replace "Custom: On request / Ask for a quote"** with the fixed ₹1,999 Built-for-you plan. "Price on request" put buyers off.
  - ✅ Done. /custom is now Built for you at ₹1,999.
- [x] **14. Add the founding-couples offer** under the pricing cards:
  - ✅ Done. The spots-left count comes from Admin → Settings → "Spots taken so far". Update it each time a founding couple pays. The offer hides itself after 31 Jan 2027 or when spots run out.
  > **Founding couples:** the first 25 couples get Built for you for ₹999 instead of ₹1,999, if they let us show their site as an example (names hidden on request). **[X] of 25 spots left.** Ends 31 Jan 2027.
  - Keep the number of spots left real and up to date.
- [x] **14b. Shrink the free plan** to 1 event, live 1 month. Free currently gives 2 events and maps for 3 months, and buyers said *"the free version already does the job."*
  - ✅ Done for new free sites: 1 event, live 1 month.
- [x] **14c. Keep the refund and "link not working" guarantee** in the Terms and Refunds pages, but don't headline it. In the panel, a big guarantee made buyers picture the failure.
  - ✅ Done. Terms now include a refund if your paid link stops working and we can't fix it within 24 hours.

## E. Biodata

- [x] **15. Make the biodata free, with no red strip.** Nobody paid ₹399, and free no-watermark tools already exist.
  - ✅ Done.
- [x] **16. After a biodata download, show:**
  - ✅ Done. The card appears after the first download, with "Save my details for later" linking to the account page.
  > **When the match is fixed, your wedding link is ready in 5 minutes.** [Save my details for later]
  - This is how biodata families come back as wedding-site buyers.
- [x] **17. Take "biodata maker" out of the hero headline.** Keep the biodata section and its own pages, so the homepage sells one main thing.
  - ✅ Done.

## F. Before running Meta ads

- [x] **18. Set up tracking:** a Meta Pixel plus events for:
  - ✅ Events are in place: free site created (CompleteRegistration), purchase (Purchase), Built-for-you request (Contact), plus Lead and ViewContent. To turn it on, paste your Meta Pixel ID in Admin → Settings.
  - free site created
  - One Link Wedding purchased
  - Built-for-you request sent
- [x] **19. Make a landing page for ads** that pushes the free plan: *"Make your free wedding link in 5 minutes."* Ads should bring people to make a free site, not to checkout.
  - ✅ Done: thewedlink.in/free. It is hidden from Google and saves the ad's UTM tags.
- [ ] **20. Test on a cheap Android phone over mobile data, and load-test a published site** at wedding-day traffic on your current Hostinger plan. Buyers' biggest fear was the link failing on the day.
  - ✅ Server half done (10 Nov 2026): 300 visits to a published site, 30 at a time, on the current Hostinger plan. All 300 loaded, typically in 0.5 s and 0.9 s at the slowest, about 55 visits a second. That is far more than a wedding's guest list opening the link at once.
  - ⏳ Still to do: open the site on a cheap Android phone over mobile data.
- [ ] **Budget test:** about ₹5,000 to ₹10,000 over 2 weeks. Measure cost per free site, free-to-paid rate and cost per paying customer. Stop or change the ads if one paying customer costs more than about ₹999 minus PayU fees.

## G. Build next (product)

- [ ] **21. A forwardable card image and PDF** in the same design as the site, with the link and a QR code. Elders forward images, not links.
- [ ] **22. A headcount sheet** for the caterer: RSVP counts by function, plus a list of who hasn't replied.
- [ ] **23. A "save for later" flow** linking a biodata to a future wedding site (see item 16).

## H. Outside the website: where trust comes from

These aren't website changes, but the panels pointed to them more than anything else:

- [ ] **Card printers:** offer "add a WhatsApp wedding link for ₹X" with every card order, with a revenue share for the printer.
- [ ] **Wedding planners and photographers:** include it in their packages.
- [ ] **Focus on one community and region first,** so word of mouth builds up.
- [ ] **Get the 25 founding couples through people you know** before spending on ads.

---

## Suggested order

| Week | Do |
| --- | --- |
| 1 | Items 1 to 4 and 8 to 13: fix pricing claims, WhatsApp button, new headline, 3 plans |
| 1 to 2 | Items 14 to 17: founding-couples offer, smaller free plan, free biodata. Start getting founding couples |
| 2 to 3 | Items 5 to 7 and 18 to 20: FAQ, sample button, tracking, ad landing page, load test |
| 3 to 5 | Small Meta test on the free plan. Start talking to printers and planners |
| Ongoing | Items 21 to 23: card image, headcount sheet, save-for-later |
