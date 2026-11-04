<?php
/* Second batch of guides: biodata and invitation wording. 'date' is the day each one goes live (IST). */
const BLOG_POSTS_2 = [
'marriage-biodata-format' => [
    'title' => 'Marriage Biodata Format: What to Include (With a Free Sample)',
    'short' => 'Marriage biodata format', 'cat' => 'Biodata',
    'desc' => 'The complete marriage biodata format: personal details, family, education, horoscope, about me and partner expectations, with a sample you can copy.',
    'read' => 6, 'cta' => ['/biodata', 'Make your biodata free'],
    'body' => <<<'HTML'
<p>A marriage biodata is the first thing a family sees about you. It is not a job resume: it is a warm, honest one-page introduction to you and your family. Here is exactly what to put in it, in the order families expect.</p>
<h2>1. Personal details</h2>
<ul><li>Full name</li><li>Date of birth (and age), time and place of birth if you share a horoscope</li><li>Height, complexion if your family usually mentions it</li><li>Religion, caste or community, mother tongue</li><li>Current city</li></ul>
<h2>2. Education and work</h2>
<ul><li>Highest qualification and college</li><li>Job title, company and city</li><li>Annual income, only if your family prefers to share it</li></ul>
<p>If you are studying or between jobs, say so simply. Honesty here builds trust.</p>
<h2>3. Family details</h2>
<ul><li>Father's name and occupation</li><li>Mother's name and occupation</li><li>Brothers and sisters, with marital status</li><li>Family type (joint or nuclear) and native place</li></ul>
<h2>4. Horoscope details (if your family uses them)</h2>
<p>Star (nakshatra), rasi, gotra, manglik status. For Muslim and Christian biodatas, this section becomes sect, maslak, parish or diocese instead.</p>
<h2>5. About me</h2>
<p>Three or four lines on your nature, values and interests. See our guide on <a href="/blog/how-to-write-about-me-in-marriage-biodata">how to write the About me section</a>.</p>
<h2>6. Partner expectations</h2>
<p>Two or three lines on what matters to you: values, education, location, willingness to relocate.</p>
<h2>7. Contact details</h2>
<p>Usually a parent's phone number, and your email if you wish.</p>
<h2>A short sample</h2>
<blockquote><b>Meera Nair</b><br>Born 12 March 1998, Kochi · 5'4" · Hindu, Nair · Malayalam<br>M.Tech, IIT Madras · Software Engineer, Bengaluru<br>Father: Suresh Nair (Retd. Bank Manager) · Mother: Anitha Nair (Teacher)<br>One younger brother, studying<br>Star: Rohini · Rasi: Vrishabham</blockquote>
<h2>Tips</h2>
<ul><li>Keep it to one page.</li><li>Use a clear, recent photo with a plain background.</li><li>Choose a simple, elegant design. Busy borders make it harder to read.</li><li>Save it as a PDF to print, and as an image to send on WhatsApp.</li></ul>
HTML,
],
'how-to-write-about-me-in-marriage-biodata' => [
    'title' => 'How to Write "About Me" in a Marriage Biodata: 12 Samples',
    'short' => 'About me in marriage biodata', 'cat' => 'Biodata',
    'desc' => 'Simple, honest About Me samples for a marriage biodata, for girls and boys, plus partner expectation lines and what to avoid.',
    'read' => 5, 'cta' => ['/biodata', 'Add your About me to a free biodata'],
    'body' => <<<'HTML'
<p>The About me section is the only part of a biodata that sounds like you. Families read it to understand your nature, not your marks. Keep it to three or four calm, honest sentences.</p>
<h2>A simple formula</h2>
<ol><li>Who you are (one line on your nature).</li><li>What you do and enjoy.</li><li>What you value in family life.</li></ol>
<h2>About me samples for girls</h2>
<blockquote>I am a calm and cheerful person who values family and simple living. I work as a teacher and love reading, cooking for my family and travelling to new places.</blockquote>
<blockquote>I am a software engineer based in Bengaluru. I am independent, but close to my family. I enjoy music, weekend treks and trying new recipes.</blockquote>
<blockquote>I believe in respect, honesty and laughter in a marriage. I am a doctor by profession, and in my free time I paint and practise yoga.</blockquote>
<blockquote>I am soft-spoken, spiritual and family-oriented. I enjoy classical dance, gardening and spending time with my nieces and nephews.</blockquote>
<h2>About me samples for boys</h2>
<blockquote>I am a hard-working and easy-going person. I work as a civil engineer in Kochi and enjoy cricket, long drives and cooking on weekends.</blockquote>
<blockquote>I value honesty, respect for elders and a sense of humour. I run my family's business and love travelling and photography.</blockquote>
<blockquote>I am a chartered accountant in Mumbai. I am calm, practical and believe in equal partnership. I enjoy fitness, books and music.</blockquote>
<blockquote>I am a simple, God-fearing person who loves my family. I work in the Gulf and plan to settle in Kerala in a few years.</blockquote>
<h2>Partner expectation samples</h2>
<blockquote>Looking for a kind, educated and understanding partner from a good family, who values both career and family.</blockquote>
<blockquote>Looking for a partner who is caring, respectful and willing to live in Bengaluru.</blockquote>
<h2>What to avoid</h2>
<ul><li>Long paragraphs: keep it short.</li><li>Words like "very rich family" or "very fair": they put people off.</li><li>Copying a sample word for word: change at least one line to make it yours.</li></ul>
HTML,
],
'hindu-marriage-biodata-format' => [
    'title' => 'Hindu Marriage Biodata Format: Gotra, Nakshatra and Rasi Explained',
    'short' => 'Hindu marriage biodata format', 'cat' => 'Biodata',
    'desc' => 'Hindu marriage biodata format with gotra, nakshatra, rasi, manglik and kuladevata fields explained, a sample and an opening shloka.',
    'read' => 5, 'cta' => ['/biodata/hindu', 'Make a Hindu biodata free'],
    'body' => <<<'HTML'
<p>A Hindu biodata follows the usual personal, family and education sections, and adds the horoscope details families use for matching.</p>
<h2>Opening line</h2>
<p>Most Hindu biodatas start with a small line at the top: <b>|| Shree Ganeshaya Namah ||</b> or <b>ॐ</b>. Keep it small and centred.</p>
<h2>Horoscope fields explained</h2>
<ul>
<li><b>Gotra:</b> your family lineage, passed down from the father's side.</li>
<li><b>Nakshatra (star):</b> the birth star, for example Rohini, Ashwini or Revati.</li>
<li><b>Rasi (moon sign):</b> for example Mesha, Vrishabha, Kanya.</li>
<li><b>Manglik:</b> yes, no or partial, if your family checks it.</li>
<li><b>Kuladevata:</b> the family deity, common in Maharashtra, Karnataka and Goa.</li>
<li><b>Time and place of birth:</b> needed for the horoscope to be made or matched.</li>
</ul>
<h2>Sample</h2>
<blockquote>|| Shree Ganeshaya Namah ||<br><b>Arjun Menon</b><br>Born 4 June 1995, 6:40 am, Thrissur<br>Star: Uthradam · Rasi: Dhanu · Gotra: Vasishta<br>B.Tech, NIT Calicut · Product Manager, Bengaluru<br>Father: Rajan Menon · Mother: Latha Menon</blockquote>
<h2>Regional touches</h2>
<ul><li><b>Kerala:</b> add your house name and star in Malayalam if you like.</li><li><b>Tamil Nadu:</b> mention your sub-sect and native village.</li><li><b>North India:</b> manglik status and gotra are usually expected.</li></ul>
<p>Our free <a href="/biodata/hindu">Hindu biodata maker</a> has all these fields ready, so you only fill in what your family uses.</p>
HTML,
],
'muslim-marriage-biodata-format' => [
    'title' => 'Muslim Marriage Biodata Format for Nikah: Fields and Sample',
    'short' => 'Muslim marriage biodata format', 'cat' => 'Biodata',
    'desc' => 'Muslim marriage biodata format for Nikah proposals: sect, maslak, religious practice, family and a sample, with tips for a respectful biodata.',
    'read' => 5, 'cta' => ['/biodata/muslim', 'Make a Muslim biodata free'],
    'body' => <<<'HTML'
<p>A Muslim biodata for a Nikah proposal is simple and respectful. It opens with Bismillah and focuses on deen, family and education.</p>
<h2>Opening</h2>
<p>Begin with <b>بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</b> or "In the name of Allah, the Most Gracious, the Most Merciful".</p>
<h2>Fields to include</h2>
<ul>
<li>Name, date of birth, height, city</li>
<li>Sect (Sunni or Shia) and maslak (Hanafi, Shafi'i and so on), if your family mentions it</li>
<li>Religious practice: prayers, hijab or beard, Quran reading, if you wish to share</li>
<li>Education and profession</li>
<li>Father's and mother's names and occupations, siblings</li>
<li>Family's native place and the masjid or mahallu you belong to</li>
<li>About me and partner expectations</li>
</ul>
<h2>Sample</h2>
<blockquote>Bismillahir Rahmanir Raheem<br><b>Zara Ismail</b><br>Born 2 August 1999 · 5'3" · Malappuram<br>Sunni, Shafi'i · Prays regularly<br>B.Sc Nursing · Staff Nurse, Kozhikode<br>Father: Ismail (Business) · Mother: Ayesha (Homemaker)</blockquote>
<h2>Tips</h2>
<ul><li>Keep photos modest and recent.</li><li>Be clear about whether you will work after marriage, and where you would like to live.</li><li>Share a guardian's number for contact.</li></ul>
HTML,
],
'christian-marriage-biodata-format' => [
    'title' => 'Christian Marriage Biodata Format: Parish, Diocese and Sample',
    'short' => 'Christian marriage biodata format', 'cat' => 'Biodata',
    'desc' => 'Christian marriage biodata format with denomination, parish and diocese, family details, a Bible verse opening and a sample you can copy.',
    'read' => 4, 'cta' => ['/biodata/christian', 'Make a Christian biodata free'],
    'body' => <<<'HTML'
<p>A Christian biodata is much like any other, but families look for denomination, parish and diocese instead of horoscope details.</p>
<h2>Opening</h2>
<p>Some families add a small cross or a verse at the top, such as <i>"Love is patient, love is kind" (1 Corinthians 13:4)</i>.</p>
<h2>Fields to include</h2>
<ul>
<li>Name, date of birth, height, city</li>
<li>Denomination: Roman Catholic (Latin or Syro-Malabar), Orthodox, Jacobite, Marthoma, CSI, Pentecostal and so on</li>
<li>Parish and diocese</li>
<li>Education and profession</li>
<li>Family name (tharavad) and native place, parents and siblings</li>
<li>About me and partner expectations</li>
</ul>
<h2>Sample</h2>
<blockquote><b>Anna George</b><br>Born 18 January 1997 · 5'5" · Kottayam<br>Syro-Malabar Catholic · St. Mary's Forane Church, Diocese of Palai<br>MBA · HR Manager, Kochi<br>Father: George Kurian (Planter) · Mother: Elizabeth (Teacher)<br>One elder brother, married, in Canada</blockquote>
<h2>Tips</h2>
<ul><li>Name the parish clearly: families often check through it.</li><li>Mention if you are working or settled abroad.</li><li>Keep it to one page with a clean design.</li></ul>
HTML,
],
'biodata-photo-tips' => [
    'title' => 'Biodata Photo Tips: How to Pick the Right Photo for Marriage',
    'short' => 'Biodata photo tips', 'cat' => 'Biodata',
    'desc' => 'How to choose a good photo for your marriage biodata: clothing, background, light, phone camera tips and mistakes to avoid.',
    'read' => 4, 'cta' => ['/biodata', 'Add your photo to a free biodata'],
    'body' => <<<'HTML'
<p>The photo is the first thing anyone looks at on a biodata. A good one doesn't need a studio, just good light and a little care.</p>
<h2>What makes a good biodata photo</h2>
<ul>
<li><b>Recent:</b> taken in the last six months.</li>
<li><b>Clear face:</b> looking at the camera, a natural smile, no sunglasses.</li>
<li><b>From the waist up</b> or a little lower, so families see you clearly.</li>
<li><b>Plain background:</b> a light wall, a garden or a curtain.</li>
<li><b>Soft daylight:</b> stand facing a window, not with the window behind you.</li>
</ul>
<h2>What to wear</h2>
<ul><li>Girls: a saree, salwar or kurti in a soft, solid colour.</li><li>Boys: a plain shirt or a kurta. Avoid loud prints and logos.</li></ul>
<h2>Taking it on your phone</h2>
<ol><li>Ask someone else to take it, at your eye level.</li><li>Use the back camera, not the selfie camera.</li><li>Tap your face to focus, and take several shots.</li><li>Don't use beauty filters: families prefer a natural look.</li></ol>
<h2>Mistakes to avoid</h2>
<ul><li>Group photos or cropped wedding photos.</li><li>Gym, party or bike photos.</li><li>Very dark or blurry pictures.</li></ul>
HTML,
],
'marriage-biodata-tips' => [
    'title' => 'Marriage Biodata Tips for Boys and Girls: 10 Things Families Notice',
    'short' => 'Marriage biodata tips', 'cat' => 'Biodata',
    'desc' => 'Ten simple marriage biodata tips for boys and girls: what families notice first, how to stay honest and how to share your biodata on WhatsApp.',
    'read' => 4, 'cta' => ['/biodata', 'Make your biodata free'],
    'body' => <<<'HTML'
<p>Families often go through many biodatas in a week. These ten simple things help yours stand out for the right reasons.</p>
<ol>
<li><b>One page only.</b> If it doesn't fit, cut, don't shrink the text.</li>
<li><b>A recent, natural photo.</b> See our <a href="/blog/biodata-photo-tips">photo tips</a>.</li>
<li><b>Correct spelling of names</b>, especially parents' names.</li>
<li><b>Honest height, age and income.</b> Small exaggerations break trust later.</li>
<li><b>Clear family details:</b> what each parent and sibling does.</li>
<li><b>A short About me</b> that sounds like you.</li>
<li><b>Clear expectations</b>, written kindly.</li>
<li><b>A clean design.</b> Elegant beats busy.</li>
<li><b>One contact number</b> that will be answered.</li>
<li><b>Both a PDF and an image:</b> the PDF to print, the image to send on WhatsApp.</li>
</ol>
<h2>For boys</h2>
<p>Families look closely at stability: where you work, where you live, and your plans. Be specific about city and job.</p>
<h2>For girls</h2>
<p>Share what matters to you, such as continuing your career after marriage, so you meet families who agree.</p>
HTML,
],
'save-the-date-message-ideas' => [
    'title' => 'Save the Date Message Ideas for Indian Weddings (WhatsApp Ready)',
    'short' => 'Save the date messages', 'cat' => 'Wording',
    'desc' => 'Save the date message ideas for Indian weddings: formal, short, fun and family versions you can send on WhatsApp before the invitation.',
    'read' => 4, 'cta' => ['/create', 'Make a save-the-date link free'],
    'body' => <<<'HTML'
<p>A save the date goes out two or three months before the wedding, so guests can book leave and tickets. The full invitation follows later.</p>
<h2>Formal</h2>
<blockquote>With the blessings of our families, we joyfully ask you to save the date for the wedding of Arjun &amp; Meera, 14 February 2027, Guruvayur, Kerala. Formal invitation to follow.</blockquote>
<h2>Short</h2>
<blockquote>Save the date! Arjun &amp; Meera · 14.02.2027 · Guruvayur 💍</blockquote>
<h2>Fun, for friends</h2>
<blockquote>Clear your calendar and start practising your dance moves! We're getting married on 14 February 2027 in Guruvayur. Save the date 🎉</blockquote>
<h2>For a destination wedding</h2>
<blockquote>Pack your bags! We're getting married in Udaipur on 14 February 2027. Please save the date and book early. Details coming soon.</blockquote>
<h2>From the family</h2>
<blockquote>Mr. &amp; Mrs. Rajan Menon request you to save the date for the wedding of their son Arjun with Meera on 14 February 2027.</blockquote>
<h2>Tips</h2>
<ul><li>Send it 2 to 3 months before, earlier for destination weddings.</li><li>Include the city so guests can plan travel.</li><li>Send a link, then update the same link with full details later. Guests won't need a new message.</li></ul>
HTML,
],
'wedding-invitation-message-for-friends' => [
    'title' => 'Wedding Invitation Messages for Friends on WhatsApp: 15 Samples',
    'short' => 'Invitation messages for friends', 'cat' => 'Wording',
    'desc' => 'Fun and heartfelt wedding invitation messages to send friends and colleagues on WhatsApp, plus messages for the office group.',
    'read' => 4, 'cta' => ['/create', 'Make your invitation link free'],
    'body' => <<<'HTML'
<p>Friends don't need a formal card. They need the date, the place and a message that sounds like you.</p>
<h2>Fun</h2>
<blockquote>It's official: I'm getting married! 🎉 14 February 2027, Kochi. Be there, eat well, dance badly. Details: <i>your link</i></blockquote>
<blockquote>The bachelor days are over! Come celebrate with us on 14 February. All the details are here: <i>your link</i></blockquote>
<blockquote>You've seen me through every crush. Now come see me get married! 14.02.27 💍</blockquote>
<h2>Heartfelt</h2>
<blockquote>You've been part of every big moment in my life, and I can't imagine my wedding without you. Please join us on 14 February 2027.</blockquote>
<blockquote>Our wedding won't feel complete without our best friends. Please come and bless us. Details and directions: <i>your link</i></blockquote>
<h2>For colleagues</h2>
<blockquote>Dear team, I'm happy to share that I am getting married on 14 February 2027 in Kochi. I would be delighted if you could join us. All details are here: <i>your link</i></blockquote>
<h2>For the office group</h2>
<blockquote>Hello everyone! Meera and I are getting married on 14 February. The reception is on the same evening at Grand Hyatt, Kochi, and we'd love to see you all there. Directions: <i>your link</i></blockquote>
<h2>Tips</h2>
<ul><li>Message close friends personally, not just in groups.</li><li>Tell friends which functions they're invited to: the sangeet and reception, for example.</li><li>Send a reminder two days before.</li></ul>
HTML,
],
'reception-invitation-wording' => [
    'title' => 'Wedding Reception Invitation Wording: Formal and WhatsApp Samples',
    'short' => 'Reception invitation wording', 'cat' => 'Wording',
    'desc' => 'Wedding reception invitation wording samples: formal family wording, reception-only invitations, after-wedding receptions and short WhatsApp messages.',
    'read' => 4, 'cta' => ['/create', 'Add your reception to a free invitation'],
    'body' => <<<'HTML'
<p>Many guests are invited only to the reception, so its invitation needs to be clear on its own: who, when, where, and what time dinner starts.</p>
<h2>Formal</h2>
<blockquote>Mr. &amp; Mrs. Rajan Menon<br>request the pleasure of your company at the wedding reception of their son<br><b>Arjun</b> with <b>Meera</b><br>on Sunday, 14 February 2027, from 7:00 pm<br>Grand Hyatt, Bolgatty, Kochi<br>Dinner to follow</blockquote>
<h2>Reception after the wedding</h2>
<blockquote>Arjun and Meera were married in Guruvayur in the presence of family. Please join us to celebrate at our reception on 20 February 2027, 7:00 pm, at Taj Gateway, Kochi.</blockquote>
<h2>Hosted by the couple</h2>
<blockquote>Join us for an evening of music, dinner and celebration as we begin our new life together. Arjun &amp; Meera · 14 February 2027 · 7 pm onwards</blockquote>
<h2>WhatsApp</h2>
<blockquote>You're invited to our wedding reception! 🥂 Sunday, 14 February 2027, 7 pm, Grand Hyatt, Kochi. Directions: <i>your link</i></blockquote>
<h2>Tips</h2>
<ul><li>Give a start time and when dinner is served.</li><li>Add a dress code if you have one.</li><li>If guests are invited only to the reception, send a separate link or message for it.</li></ul>
HTML,
],
'engagement-invitation-wording' => [
    'title' => 'Engagement Invitation Wording and Messages: Samples for Every Family',
    'short' => 'Engagement invitation wording', 'cat' => 'Wording',
    'desc' => 'Engagement invitation wording for ring ceremonies, nischayam, manasammatham and roka, with formal, short and WhatsApp samples.',
    'read' => 4, 'cta' => ['/create', 'Make an engagement invitation free'],
    'body' => <<<'HTML'
<p>Engagement invitations are usually simpler than wedding ones. Families call it by many names: ring ceremony, nischayam, manasammatham, betrothal, roka or mangni.</p>
<h2>Formal</h2>
<blockquote>With great joy, Mr. &amp; Mrs. Suresh Nair invite you to the engagement ceremony of their daughter <b>Meera</b> with <b>Arjun</b>, son of Mr. &amp; Mrs. Rajan Menon, on Saturday, 10 October 2026 at 11:00 am, Lulu Convention Centre, Thrissur.</blockquote>
<h2>Simple</h2>
<blockquote>We're getting engaged! Please join us to celebrate on 10 October 2026, 11 am, at Lulu Convention Centre, Thrissur. With love, Arjun &amp; Meera</blockquote>
<h2>Christian betrothal</h2>
<blockquote>With the blessings of God, we invite you to the betrothal of Joel &amp; Anna at St. George's Church, Edappally, on Saturday, 13 February 2027 at 4 pm.</blockquote>
<h2>Roka or mangni</h2>
<blockquote>The Sharma and Kapoor families invite you to the Roka ceremony of Rahul &amp; Ananya on 5 December 2026, 6 pm, at the Sharma residence, Delhi.</blockquote>
<h2>WhatsApp</h2>
<blockquote>Big news! 💍 Arjun and Meera are getting engaged on 10 October. We'd love for you to be there. Details: <i>your link</i></blockquote>
<p>Tip: make one wedding website and add the engagement as the first event. Later, add the wedding and reception to the same link.</p>
HTML,
],
'haldi-mehndi-sangeet-invitation-wording' => [
    'title' => 'Haldi, Mehndi and Sangeet Invitation Wording (With Dress Codes)',
    'short' => 'Haldi, mehndi and sangeet wording', 'cat' => 'Wording',
    'desc' => 'Fun and traditional invitation wording for haldi, mehndi and sangeet functions, with dress code lines and WhatsApp messages.',
    'read' => 4, 'cta' => ['/create?t=marigold', 'Use the Marigold design'],
    'body' => <<<'HTML'
<p>The pre-wedding functions are the most fun part of an Indian wedding, and their invitations can be playful.</p>
<h2>Haldi</h2>
<blockquote>Get ready to turn yellow! Join us for Meera's Haldi on 13 February 2027, 10 am, at the family home. Dress code: yellow.</blockquote>
<blockquote>Turmeric, laughter and blessings. You're invited to the Haldi ceremony of Arjun &amp; Meera.</blockquote>
<h2>Mehndi</h2>
<blockquote>An evening of henna, music and love. Join us for Meera's Mehndi on 12 February 2027 at 6 pm. Dress code: shades of green.</blockquote>
<blockquote>Come for the henna, stay for the dancing! Mehndi night, 12 February, 6 pm onwards.</blockquote>
<h2>Sangeet</h2>
<blockquote>Bring your best moves! Join us for the Sangeet of Rahul &amp; Ananya on 13 January 2027 at 7 pm, The Tamarind Tree, Bengaluru.</blockquote>
<blockquote>Music, dance and a lot of masti. You're invited to our Sangeet night!</blockquote>
<h2>One message for all functions</h2>
<blockquote>Join us for three days of celebration! Mehndi on the 12th, Haldi on the 13th and the wedding on the 14th. Timings, venues and dress codes are all here: <i>your link</i></blockquote>
<h2>Dress code ideas</h2>
<ul><li>Haldi: yellow or white</li><li>Mehndi: green, pink or bright prints</li><li>Sangeet: Indo-western, sequins, metallics</li></ul>
HTML,
],
'how-to-make-wedding-website-free' => [
    'title' => 'How to Make a Wedding Website for Free in India (5 Minutes)',
    'short' => 'Make a wedding website free', 'cat' => 'Guides',
    'desc' => 'Step-by-step guide to making a free wedding website in India: what to include, how to add events with maps, RSVP, photos and sharing on WhatsApp.',
    'read' => 5, 'cta' => ['/create', 'Make your wedding website free'],
    'body' => <<<'HTML'
<p>A wedding website is one link with everything guests need: your names, every function, maps, a countdown and RSVP. Here is how to make one free in about five minutes.</p>
<h2>What a wedding website includes</h2>
<ul><li>Your names and families</li><li>Every event with date, time, venue and Google Maps directions</li><li>A countdown to the wedding</li><li>Your photos and story (optional)</li><li>RSVP and a gift list (on Premium)</li></ul>
<h2>Step 1: Pick a design</h2>
<p>Choose one that suits your wedding: Kerala, Nikah, church, North Indian, or modern. On TheWedLink, two designs are free.</p>
<h2>Step 2: Add your names</h2>
<p>Type both names, and your parents' names as family lines. You can write in English or your own language.</p>
<h2>Step 3: Add your events</h2>
<p>Add each function. To get a map link, open the venue in Google Maps, tap Share, copy the link and paste it in.</p>
<h2>Step 4: Add photos and your story</h2>
<p>Add a pre-wedding photo and a few lines about how you met. Both are optional.</p>
<h2>Step 5: Publish and share</h2>
<p>Preview it, publish free, and copy your link. Send it on WhatsApp with a short message.</p>
<h2>Free vs paid</h2>
<p>The free plan covers the essentials for three months. Paid plans add more designs, a photo gallery, RSVP, a gift list, music, video and a longer life. You can upgrade later and keep the same link.</p>
HTML,
],
'rsvp-for-indian-wedding' => [
    'title' => 'How to Track RSVPs for an Indian Wedding (Without 100 Phone Calls)',
    'short' => 'RSVP for Indian weddings', 'cat' => 'Guides',
    'desc' => 'How to collect RSVPs for an Indian wedding: when to ask, what to ask, how to get guest counts for catering, and RSVP message samples.',
    'read' => 4, 'cta' => ['/pricing', 'Get RSVPs with Premium'],
    'body' => <<<'HTML'
<p>In Indian weddings, the guest count decides the catering bill. Yet most families still guess. Collecting RSVPs online saves money and a lot of phone calls.</p>
<h2>When to ask</h2>
<p>Ask with the invitation, and set a reply-by date about 10 days before the wedding. Send one reminder a week before.</p>
<h2>What to ask</h2>
<ul><li>Name and phone</li><li>Attending or not</li><li>How many people are coming</li><li>Which functions (if they're invited to more than one)</li><li>A note for the couple</li></ul>
<h2>RSVP request samples</h2>
<blockquote>Kindly let us know by 1 February if you can join us, so we can plan for you. Tap here to reply: <i>your link</i></blockquote>
<blockquote>Please RSVP by 1 February. It takes 10 seconds and helps us a lot! 🙏</blockquote>
<h2>Turning RSVPs into a catering count</h2>
<ol><li>Add up the confirmed guests.</li><li>Add 10 to 15% for those who come without replying, which is common at Indian weddings.</li><li>Share the final number with the caterer three days before.</li></ol>
<p>With a wedding website, every reply arrives in one list with a running guest count, so there's nothing to add up by hand.</p>
HTML,
],
];
