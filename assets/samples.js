/* Sample couples used by the landing demo, per tradition. */
window.WL_SAMPLES = (function () {
  function isoIn(days) {
    var d = new Date(Date.now() + days * 864e5);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  var S = {
    hindu: { c: 'Rajan Menon', p1: 'Arjun', p2: 'Meera', p1_family: 'Son of Rajan & Latha Menon, Thrissur', p2_family: 'Daughter of Suresh & Anitha Nair, Kochi',
      events: [['Engagement', 70, '17:00', 'Lulu Convention Centre', 'Puzhakkal, Thrissur'], ['Muhurtham', 72, '10:30', 'Sree Krishna Temple', 'Guruvayur, Kerala'], ['Reception', 72, '18:30', 'Grand Hyatt', 'Bolgatty, Kochi']] },
    christian: { c: 'Thomas Mathew', p1: 'Joel', p2: 'Anna', p1_family: 'Son of Thomas & Mary Mathew, Kottayam', p2_family: 'Daughter of George & Elizabeth Kurian, Kochi',
      events: [['Betrothal', 64, '16:00', "St. George's Church", 'Edappally, Kochi'], ['Holy Matrimony', 72, '11:00', "St. Mary's Forane Church", 'Kottayam, Kerala'], ['Reception', 72, '18:30', 'Le Méridien', 'Maradu, Kochi']] },
    muslim: { c: 'Abdul Rahman', p1: 'Ayaan', p2: 'Zara', p1_family: 'Son of Abdul Rahman & Fathima, Kozhikode', p2_family: 'Daughter of Ismail & Ayesha, Malappuram',
      events: [['Mehendi', 71, '18:00', 'Family home', 'Kottakkal, Malappuram'], ['Nikah', 72, '11:00', 'Juma Masjid', 'Kozhikode, Kerala'], ['Walima', 73, '19:00', 'Hotel Raviz', 'Kozhikode']] },
    sikh: { c: 'Gurpreet Singh', p1: 'Harman', p2: 'Simran', p1_family: 'Son of Gurpreet & Manjeet Singh, Ludhiana', p2_family: 'Daughter of Jaswinder & Harpreet Kaur, Amritsar',
      events: [['Mehendi', 71, '17:00', 'Family home', 'Model Town, Ludhiana'], ['Anand Karaj', 72, '10:00', 'Gurudwara Sahib', 'Sarabha Nagar, Ludhiana'], ['Reception', 72, '19:00', 'Hyatt Regency', 'Ludhiana']] },
    modern: { c: 'Vikram Rao', p1: 'Rahul', p2: 'Ananya', p1_family: 'Son of Vikram & Priya Rao, Bengaluru', p2_family: 'Daughter of Anil & Kavita Shetty, Mangaluru',
      events: [['Sangeet', 71, '19:00', 'The Tamarind Tree', 'Kanakapura Road, Bengaluru'], ['Wedding', 72, '11:00', 'The Leela Palace', 'Old Airport Road, Bengaluru'], ['Reception', 72, '19:30', 'The Leela Palace', 'Bengaluru']] }
  };
  var PRIMARY = { noor: 'muslim', qamar: 'muslim', chapel: 'christian', grace: 'christian', kesar: 'sikh', champagne: 'modern', velvet: 'modern', gulmohar: 'modern' };
  return {
    faith: function (theme) { return PRIMARY[theme] || 'hindu'; },
    get: function (faith) {
      var s = S[faith] || S.hindu;
      return {
        p1: s.p1, p2: s.p2, p1_family: s.p1_family, p2_family: s.p2_family,
        message: 'With the blessings of our elders, we warmly invite you and your family to share our joy.',
        events: s.events.map(function (e) { return { name: e[0], date: isoIn(e[1]), time: e[2], venue: e[3], address: e[4] }; }),
        contact_name: s.c, contact_phone: '9876543210', plan: 'premium'
      };
    }
  };
})();
