/**
 * Comprehensive Bengaluru Transit Database:
 * - Namma Metro Purple & Green lines with coordinates & platforms
 * - Real-time schedule & departure calculator based on current time
 * - Fare calculator
 * - Interchange navigation guides (Majestic Kempegowda interchange)
 * - Major hub locations for instant autocomplete search
 */

export const PURPLE_LINE = '#6c4d8f';
export const GREEN_LINE = '#7a8a5e';
export const BUS_LINE = '#c67139';
export const DMRC_YELLOW = '#eab308';
export const DMRC_BLUE = '#2563eb';
export const DMRC_AIRPORT = '#ea580c';
export const MUMBAI_WESTERN = '#dc2626';
export const MUMBAI_CENTRAL = '#991b1b';
export const MUMBAI_METRO1 = '#0284c7';

// Namma Metro Purple Line (Challaghatta <-> Whitefield)
export const PURPLE_STATIONS = [
  { id: 'p1', name: 'Whitefield (Kadugodi)', latitude: 12.9961, longitude: 77.7606 },
  { id: 'p2', name: 'Hopefarm Channasandra', latitude: 12.9845, longitude: 77.7515 },
  { id: 'p3', name: 'Kadugodi Tree Park', latitude: 12.9885, longitude: 77.7391 },
  { id: 'p4', name: 'Pattandur Agrahara (ITPL)', latitude: 12.9877, longitude: 77.7289 },
  { id: 'p5', name: 'Sri Sathya Sai Hospital', latitude: 12.9822, longitude: 77.7198 },
  { id: 'p6', name: 'Nallurhalli', latitude: 12.9782, longitude: 77.7121 },
  { id: 'p7', name: 'Kundalahalli', latitude: 12.9734, longitude: 77.7058 },
  { id: 'p8', name: 'Seetharamapalya', latitude: 12.9774, longitude: 77.6974 },
  { id: 'p9', name: 'Hoodi', latitude: 12.9902, longitude: 77.6977 },
  { id: 'p10', name: 'Garudacharpalya', latitude: 12.9934, longitude: 77.6834 },
  { id: 'p11', name: 'Singayyanapalya', latitude: 12.9958, longitude: 77.6713 },
  { id: 'p12', name: 'KR Pura (Outer Ring Road)', latitude: 13.0014, longitude: 77.6661 },
  { id: 'p13', name: 'Benniganahalli', latitude: 12.9942, longitude: 77.6575 },
  { id: 'p14', name: 'Baiyappanahalli', latitude: 12.9909, longitude: 77.6525 },
  { id: 'p15', name: 'Swami Vivekananda Road', latitude: 12.9859, longitude: 77.6447 },
  { id: 'p16', name: 'Indiranagar (100ft Rd / 12th Main)', latitude: 12.9783, longitude: 77.6387 },
  { id: 'p17', name: 'Halasuru', latitude: 12.9768, longitude: 77.6268 },
  { id: 'p18', name: 'Trinity', latitude: 12.9729, longitude: 77.6169 },
  { id: 'p19', name: 'MG Road (Church St / Brigade Rd)', latitude: 12.9754, longitude: 77.6067 },
  { id: 'p20', name: 'Cubbon Park (High Court / Chinnaswamy)', latitude: 12.9811, longitude: 77.5976 },
  { id: 'p21', name: 'Dr. BR Ambedkar Vidhana Soudha', latitude: 12.9798, longitude: 77.5925 },
  { id: 'p22', name: 'Sir M. Visveshwaraya Central College', latitude: 12.9749, longitude: 77.5837 },
  { id: 'p23', name: 'Nadaprabhu Kempegowda (Majestic Interchange)', latitude: 12.9756, longitude: 77.5728, isInterchange: true },
  { id: 'p24', name: 'KSR Bengaluru City Railway Station', latitude: 12.9782, longitude: 77.5670 },
  { id: 'p25', name: 'Magadi Road', latitude: 12.9755, longitude: 77.5552 },
  { id: 'p26', name: 'Sri Balagangadharanatha Swamiji Stn - Hosahalli', latitude: 12.9696, longitude: 77.5451 },
  { id: 'p27', name: 'Vijayanagar', latitude: 12.9645, longitude: 77.5367 },
  { id: 'p28', name: 'Attiguppe', latitude: 12.9602, longitude: 77.5255 },
  { id: 'p29', name: 'Deepanjali Nagar', latitude: 12.9554, longitude: 77.5192 },
  { id: 'p30', name: 'Mysuru Road', latitude: 12.9478, longitude: 77.5143 },
  { id: 'p31', name: 'Pantharapalya - Nayandahalli', latitude: 12.9421, longitude: 77.5110 },
  { id: 'p32', name: 'Rajarajeshwari Nagar', latitude: 12.9351, longitude: 77.5126 },
  { id: 'p33', name: 'Jnanabharathi (Bangalore University)', latitude: 12.9287, longitude: 77.5057 },
  { id: 'p34', name: 'Pattanagere', latitude: 12.9238, longitude: 77.4989 },
  { id: 'p35', name: 'Kengeri', latitude: 12.9157, longitude: 77.4839 },
  { id: 'p36', name: 'Challaghatta', latitude: 12.9098, longitude: 77.4721 },
];

// Namma Metro Green Line (Nagasandra <-> Silk Institute)
export const GREEN_STATIONS = [
  { id: 'g1', name: 'Madavara (BIEC)', latitude: 13.0645, longitude: 77.4938 },
  { id: 'g2', name: 'Nagasandra', latitude: 13.0478, longitude: 77.5002 },
  { id: 'g3', name: 'Dasarahalli', latitude: 13.0435, longitude: 77.5132 },
  { id: 'g4', name: 'Jalahalli', latitude: 13.0389, longitude: 77.5218 },
  { id: 'g5', name: 'Peenya Industry', latitude: 13.0338, longitude: 77.5284 },
  { id: 'g6', name: 'Peenya', latitude: 13.0289, longitude: 77.5348 },
  { id: 'g7', name: 'Goraguntepalya', latitude: 13.0271, longitude: 77.5451 },
  { id: 'g8', name: 'Yeshwantpur Railway Station', latitude: 13.0232, longitude: 77.5501 },
  { id: 'g9', name: 'Sandal Soap Factory', latitude: 13.0147, longitude: 77.5539 },
  { id: 'g10', name: 'Mahalakshmi', latitude: 13.0084, longitude: 77.5541 },
  { id: 'g11', name: 'Rajajinagar', latitude: 13.0003, longitude: 77.5548 },
  { id: 'g12', name: 'Mahakavi Kuvempu Road', latitude: 12.9934, longitude: 77.5583 },
  { id: 'g13', name: 'Mantri Square Sampige Road (Malleswaram)', latitude: 12.9904, longitude: 77.5714 },
  { id: 'g14', name: 'Nadaprabhu Kempegowda (Majestic Interchange)', latitude: 12.9756, longitude: 77.5728, isInterchange: true },
  { id: 'g15', name: 'Chickpete (Textile & Electrical Market)', latitude: 12.9669, longitude: 77.5739 },
  { id: 'g16', name: 'Krishna Rajendra Market (Flower Market / VV Puram)', latitude: 12.9609, longitude: 77.5746 },
  { id: 'g17', name: 'National College (Basavanagudi)', latitude: 12.9504, longitude: 77.5727 },
  { id: 'g18', name: 'Lalbagh Botanical Garden (West Gate)', latitude: 12.9463, longitude: 77.5801 },
  { id: 'g19', name: 'South End Circle', latitude: 12.9379, longitude: 77.5802 },
  { id: 'g20', name: 'Jayanagar 4th Block', latitude: 12.9298, longitude: 77.5803 },
  { id: 'g21', name: 'Rashtriya Vidyalaya Road', latitude: 12.9213, longitude: 77.5804 },
  { id: 'g22', name: 'Banashankari (TTMC Bus Stand)', latitude: 12.9154, longitude: 77.5736 },
  { id: 'g23', name: 'Jaya Prakash Nagar (JP Nagar)', latitude: 12.9073, longitude: 77.5735 },
  { id: 'g24', name: 'Yelachenahalli', latitude: 12.8958, longitude: 77.5701 },
  { id: 'g25', name: 'Konanakunte Cross (Forum South)', latitude: 12.8856, longitude: 77.5645 },
  { id: 'g26', name: 'Doddakallasandra', latitude: 12.8744, longitude: 77.5579 },
  { id: 'g27', name: 'Vajarahalli', latitude: 12.8661, longitude: 77.5469 },
  { id: 'g28', name: 'Talaghattapura', latitude: 12.8576, longitude: 77.5381 },
  { id: 'g29', name: 'Silk Institute (Kanakapura Road)', latitude: 12.8465, longitude: 77.5284 },
];

// DMRC Yellow Line (Samaypur Badli <-> Millennium City Centre Gurugram)
export const DMRC_YELLOW_STATIONS = [
  { id: 'del_y1', name: 'Samaypur Badli', latitude: 28.7460, longitude: 77.1350 },
  { id: 'del_y2', name: 'Vishwavidyalaya (Delhi University)', latitude: 28.6946, longitude: 77.2137 },
  { id: 'del_y3', name: 'Kashmere Gate (Interchange)', latitude: 28.6675, longitude: 77.2285, isInterchange: true },
  { id: 'del_y4', name: 'Chandni Chowk (Old Delhi)', latitude: 28.6578, longitude: 77.2304 },
  { id: 'del_y5', name: 'Chawri Bazar (Jama Masjid)', latitude: 28.6496, longitude: 77.2263 },
  { id: 'del_y6', name: 'New Delhi (Railway & Airport Express)', latitude: 28.6429, longitude: 77.2217, isInterchange: true },
  { id: 'del_y7', name: 'Rajiv Chowk (Connaught Place)', latitude: 28.6328, longitude: 77.2195, isInterchange: true },
  { id: 'del_y8', name: 'Patel Chowk', latitude: 28.6232, longitude: 77.2133 },
  { id: 'del_y9', name: 'Central Secretariat (Kartavya Path)', latitude: 28.6146, longitude: 77.2119, isInterchange: true },
  { id: 'del_y10', name: 'Udyog Bhawan', latitude: 28.6115, longitude: 77.2120 },
  { id: 'del_y11', name: 'Lok Kalyan Marg', latitude: 28.5998, longitude: 77.2098 },
  { id: 'del_y12', name: 'Jor Bagh (Lodhi Gardens)', latitude: 28.5878, longitude: 77.2126 },
  { id: 'del_y13', name: 'Dilli Haat - INA', latitude: 28.5744, longitude: 77.2097, isInterchange: true },
  { id: 'del_y14', name: 'AIIMS (Ansari Nagar)', latitude: 28.5684, longitude: 77.2078 },
  { id: 'del_y15', name: 'Green Park', latitude: 28.5588, longitude: 77.2057 },
  { id: 'del_y16', name: 'Hauz Khas (Deer Park / Village)', latitude: 28.5432, longitude: 77.2064, isInterchange: true },
  { id: 'del_y17', name: 'Malviya Nagar', latitude: 28.5284, longitude: 77.2067 },
  { id: 'del_y18', name: 'Saket (Select Citywalk)', latitude: 28.5204, longitude: 77.2017 },
  { id: 'del_y19', name: 'Qutab Minar', latitude: 28.5134, longitude: 77.1859 },
  { id: 'del_y20', name: 'Chhatarpur (Temple)', latitude: 28.5065, longitude: 77.1748 },
  { id: 'del_y21', name: 'Sultanpur', latitude: 28.4988, longitude: 77.1616 },
  { id: 'del_y22', name: 'Ghitorni', latitude: 28.4939, longitude: 77.1492 },
  { id: 'del_y23', name: 'Arjan Garh', latitude: 28.4808, longitude: 77.1257 },
  { id: 'del_y24', name: 'Guru Dronacharya', latitude: 28.4819, longitude: 77.1027 },
  { id: 'del_y25', name: 'Sikanderpur (Cyber City)', latitude: 28.4818, longitude: 77.0929, isInterchange: true },
  { id: 'del_y26', name: 'MG Road Gurugram', latitude: 28.4797, longitude: 77.0801 },
  { id: 'del_y27', name: 'IFFCO Chowk', latitude: 28.4721, longitude: 77.0725 },
  { id: 'del_y28', name: 'Millennium City Centre Gurugram', latitude: 28.4593, longitude: 77.0726 },
];

// DMRC Blue Line (Dwarka Sector 21 <-> Noida Electronic City)
export const DMRC_BLUE_STATIONS = [
  { id: 'del_b1', name: 'Dwarka Sector 21', latitude: 28.5523, longitude: 77.0583, isInterchange: true },
  { id: 'del_b2', name: 'Dwarka Mor', latitude: 28.6192, longitude: 77.0326 },
  { id: 'del_b3', name: 'Uttam Nagar East', latitude: 28.6247, longitude: 77.0652 },
  { id: 'del_b4', name: 'Janakpuri West', latitude: 28.6294, longitude: 77.0777, isInterchange: true },
  { id: 'del_b5', name: 'Tilak Nagar', latitude: 28.6366, longitude: 77.0963 },
  { id: 'del_b6', name: 'Subhash Nagar', latitude: 28.6398, longitude: 77.1042 },
  { id: 'del_b7', name: 'Tagore Garden', latitude: 28.6438, longitude: 77.1132 },
  { id: 'del_b8', name: 'Rajouri Garden', latitude: 28.6492, longitude: 77.1226, isInterchange: true },
  { id: 'del_b9', name: 'Ramesh Nagar', latitude: 28.6517, longitude: 77.1308 },
  { id: 'del_b10', name: 'Moti Nagar', latitude: 28.6578, longitude: 77.1425 },
  { id: 'del_b11', name: 'Kirti Nagar', latitude: 28.6558, longitude: 77.1517, isInterchange: true },
  { id: 'del_b12', name: 'Shadipur', latitude: 28.6519, longitude: 77.1583 },
  { id: 'del_b13', name: 'Patel Nagar', latitude: 28.6496, longitude: 77.1687 },
  { id: 'del_b14', name: 'Rajendra Place', latitude: 28.6425, longitude: 77.1782 },
  { id: 'del_b15', name: 'Karol Bagh (Ghaffar Market)', latitude: 28.6441, longitude: 77.1906 },
  { id: 'del_b16', name: 'Jhandewalan', latitude: 28.6443, longitude: 77.1999 },
  { id: 'del_b17', name: 'RK Ashram Marg', latitude: 28.6393, longitude: 77.2091 },
  { id: 'del_b18', name: 'Rajiv Chowk (Connaught Place)', latitude: 28.6328, longitude: 77.2195, isInterchange: true },
  { id: 'del_b19', name: 'Barakhamba Road', latitude: 28.6298, longitude: 77.2281 },
  { id: 'del_b20', name: 'Mandi House', latitude: 28.6258, longitude: 77.2344, isInterchange: true },
  { id: 'del_b21', name: 'Supreme Court (Pragati Maidan)', latitude: 28.6209, longitude: 77.2435 },
  { id: 'del_b22', name: 'Indraprastha', latitude: 28.6186, longitude: 77.2520 },
  { id: 'del_b23', name: 'Yamuna Bank', latitude: 28.6231, longitude: 77.2687, isInterchange: true },
  { id: 'del_b24', name: 'Akshardham (Temple)', latitude: 28.6179, longitude: 77.2798 },
  { id: 'del_b25', name: 'Mayur Vihar Phase-1', latitude: 28.6053, longitude: 77.2941, isInterchange: true },
  { id: 'del_b26', name: 'Mayur Vihar Extension', latitude: 28.5937, longitude: 77.2995 },
  { id: 'del_b27', name: 'New Ashok Nagar', latitude: 28.5888, longitude: 77.3069 },
  { id: 'del_b28', name: 'Noida Sector 15', latitude: 28.5852, longitude: 77.3113 },
  { id: 'del_b29', name: 'Noida Sector 16', latitude: 28.5786, longitude: 77.3179 },
  { id: 'del_b30', name: 'Noida Sector 18 (Atta Market)', latitude: 28.5708, longitude: 77.3261 },
  { id: 'del_b31', name: 'Botanical Garden', latitude: 28.5644, longitude: 77.3344, isInterchange: true },
  { id: 'del_b32', name: 'Golf Course', latitude: 28.5672, longitude: 77.3460 },
  { id: 'del_b33', name: 'Noida City Centre', latitude: 28.5747, longitude: 77.3560 },
  { id: 'del_b34', name: 'Noida Electronic City', latitude: 28.6277, longitude: 77.3725 },
];

// DMRC Airport Express Line (New Delhi <-> IGI Airport T3 <-> Yashobhoomi)
export const DMRC_AIRPORT_STATIONS = [
  { id: 'del_a1', name: 'New Delhi (Airport Express & Railway)', latitude: 28.6429, longitude: 77.2217, isInterchange: true },
  { id: 'del_a2', name: 'Shivaji Stadium (Connaught Place)', latitude: 28.6288, longitude: 77.2118 },
  { id: 'del_a3', name: 'Dhaula Kuan', latitude: 28.5925, longitude: 77.1627 },
  { id: 'del_a4', name: 'Delhi Aerocity', latitude: 28.5501, longitude: 77.1206 },
  { id: 'del_a5', name: 'IGI Airport T3', latitude: 28.5562, longitude: 77.0999 },
  { id: 'del_a6', name: 'Yashobhoomi Dwarka Sector 25', latitude: 28.5469, longitude: 77.0436 },
];

// Mumbai Western Suburban Line (Churchgate <-> Dadar <-> Borivali)
export const MUMBAI_WESTERN_STATIONS = [
  { id: 'mum_w1', name: 'Churchgate (Terminal)', latitude: 18.9322, longitude: 72.8264 },
  { id: 'mum_w2', name: 'Marine Lines', latitude: 18.9432, longitude: 72.8230 },
  { id: 'mum_w3', name: 'Charni Road (Girgaon Chowpatty)', latitude: 18.9519, longitude: 72.8189 },
  { id: 'mum_w4', name: 'Grant Road', latitude: 18.9632, longitude: 72.8159 },
  { id: 'mum_w5', name: 'Mumbai Central', latitude: 18.9696, longitude: 72.8193, isInterchange: true },
  { id: 'mum_w6', name: 'Mahalaxmi (Race Course / Dhobi Ghat)', latitude: 18.9827, longitude: 72.8239 },
  { id: 'mum_w7', name: 'Lower Parel (High Street Phoenix)', latitude: 18.9953, longitude: 72.8302 },
  { id: 'mum_w8', name: 'Prabhadevi', latitude: 19.0069, longitude: 72.8348 },
  { id: 'mum_w9', name: 'Dadar Western (Interchange)', latitude: 19.0178, longitude: 72.8431, isInterchange: true },
  { id: 'mum_w10', name: 'Matunga Road', latitude: 19.0286, longitude: 72.8464 },
  { id: 'mum_w11', name: 'Mahim Junction', latitude: 19.0409, longitude: 72.8437 },
  { id: 'mum_w12', name: 'Bandra (Hill Road & Bandstand)', latitude: 19.0544, longitude: 72.8402 },
  { id: 'mum_w13', name: 'Khar Road', latitude: 19.0694, longitude: 72.8379 },
  { id: 'mum_w14', name: 'Santacruz', latitude: 19.0818, longitude: 72.8385 },
  { id: 'mum_w15', name: 'Vile Parle (Domestic Airport)', latitude: 19.0988, longitude: 72.8439 },
  { id: 'mum_w16', name: 'Andheri Western (Metro 1 Interchange)', latitude: 19.1197, longitude: 72.8464, isInterchange: true },
  { id: 'mum_w17', name: 'Jogeshwari', latitude: 19.1360, longitude: 72.8488 },
  { id: 'mum_w18', name: 'Goregaon', latitude: 19.1528, longitude: 72.8492 },
  { id: 'mum_w19', name: 'Malad', latitude: 19.1860, longitude: 72.8485 },
  { id: 'mum_w20', name: 'Kandivali', latitude: 19.2045, longitude: 72.8522 },
  { id: 'mum_w21', name: 'Borivali (Terminal)', latitude: 19.2290, longitude: 72.8573 },
];

// Mumbai Central Suburban Line (CSMT <-> Dadar <-> Thane)
export const MUMBAI_CENTRAL_STATIONS = [
  { id: 'mum_c1', name: 'CSMT (Chhatrapati Shivaji Maharaj Terminus)', latitude: 18.9400, longitude: 72.8353 },
  { id: 'mum_c2', name: 'Masjid Bunder', latitude: 18.9519, longitude: 72.8379 },
  { id: 'mum_c3', name: 'Sandhurst Road', latitude: 18.9610, longitude: 72.8398 },
  { id: 'mum_c4', name: 'Byculla (Zoo)', latitude: 18.9772, longitude: 72.8335 },
  { id: 'mum_c5', name: 'Chinchpokli', latitude: 18.9915, longitude: 72.8329 },
  { id: 'mum_c6', name: 'Currey Road', latitude: 18.9982, longitude: 72.8335 },
  { id: 'mum_c7', name: 'Parel', latitude: 19.0089, longitude: 72.8389 },
  { id: 'mum_c8', name: 'Dadar Central (Interchange)', latitude: 19.0178, longitude: 72.8478, isInterchange: true },
  { id: 'mum_c9', name: 'Matunga', latitude: 19.0270, longitude: 72.8548 },
  { id: 'mum_c10', name: 'Sion', latitude: 19.0444, longitude: 72.8617 },
  { id: 'mum_c11', name: 'Kurla (Harbour Interchange)', latitude: 19.0664, longitude: 72.8790, isInterchange: true },
  { id: 'mum_c12', name: 'Ghatkopar Central (Metro 1 Interchange)', latitude: 19.0863, longitude: 72.9081, isInterchange: true },
  { id: 'mum_c13', name: 'Vikhroli', latitude: 19.1118, longitude: 72.9288 },
  { id: 'mum_c14', name: 'Kanjurmarg', latitude: 19.1302, longitude: 72.9351 },
  { id: 'mum_c15', name: 'Bhandup', latitude: 19.1444, longitude: 72.9372 },
  { id: 'mum_c16', name: 'Mulund', latitude: 19.1726, longitude: 72.9563 },
  { id: 'mum_c17', name: 'Thane (Terminal)', latitude: 19.1860, longitude: 72.9759 },
];

// Mumbai Metro Line 1 (Versova <-> Andheri <-> Ghatkopar)
export const MUMBAI_METRO1_STATIONS = [
  { id: 'mum_m1', name: 'Versova', latitude: 19.1308, longitude: 72.8214 },
  { id: 'mum_m2', name: 'DN Nagar', latitude: 19.1272, longitude: 72.8306 },
  { id: 'mum_m3', name: 'Azad Nagar', latitude: 19.1251, longitude: 72.8387 },
  { id: 'mum_m4', name: 'Andheri Metro (Western Interchange)', latitude: 19.1205, longitude: 72.8465, isInterchange: true },
  { id: 'mum_m5', name: 'Western Express Highway (WEH)', latitude: 19.1158, longitude: 72.8569 },
  { id: 'mum_m6', name: 'Chakala (JB Nagar)', latitude: 19.1119, longitude: 72.8660 },
  { id: 'mum_m7', name: 'Airport Road', latitude: 19.1086, longitude: 72.8744 },
  { id: 'mum_m8', name: 'Marol Naka', latitude: 19.1065, longitude: 72.8828 },
  { id: 'mum_m9', name: 'Saki Naka', latitude: 19.0988, longitude: 72.8887 },
  { id: 'mum_m10', name: 'Asalpha', latitude: 19.0934, longitude: 72.8953 },
  { id: 'mum_m11', name: 'Jagruti Nagar', latitude: 19.0898, longitude: 72.9015 },
  { id: 'mum_m12', name: 'Ghatkopar Metro (Central Interchange)', latitude: 19.0863, longitude: 72.9081, isInterchange: true },
];

// Curated Popular Destinations across Bengaluru for instant offline search & quick picks
export const POPULAR_DESTINATIONS = [
  {
    id: 'cubbon',
    name: 'Cubbon Park',
    area: 'Central Business District',
    category: 'Park & Nature',
    latitude: 12.9763,
    longitude: 77.5929,
    nearestMetro: 'Cubbon Park (Exit A)',
    metroLine: 'purple',
    walkMinutesFromMetro: 2,
    tip: 'Sunday is pedestrian-only inside. Take Exit A for Hudson Circle corner.',
    autoFareQuoteWarning: 'Auto drivers ask ₹150 from Majestic; meter is ₹65.',
    estimatedCost: 35,
  },
  {
    id: 'lalbagh',
    name: 'Lalbagh Botanical Garden',
    area: 'Mavalli / Basavanagudi',
    category: 'Historic Gardens',
    latitude: 12.9507,
    longitude: 77.5848,
    nearestMetro: 'Lalbagh (West Gate 4)',
    metroLine: 'green',
    walkMinutesFromMetro: 3,
    tip: 'Use Gate 4 (closest to metro) for shortest ticket queue. Entry is ₹30.',
    autoFareQuoteWarning: 'Drivers at Gate 1 quote ₹250 back to Majestic. Walk 100m for meter.',
    estimatedCost: 55,
  },
  {
    id: 'mgroad',
    name: 'MG Road & Church Street',
    area: 'CBD / Brigade Road',
    category: 'Shopping & Books & Cafes',
    latitude: 12.9754,
    longitude: 77.6067,
    nearestMetro: 'MG Road (Exit C)',
    metroLine: 'purple',
    walkMinutesFromMetro: 1,
    tip: 'Church Street bookstore lane (Blossom, Bookworm) is a 2-min walk from Exit C.',
    autoFareQuoteWarning: 'Church St is pedestrianised on weekends. Autos queue at Brigade corner.',
    estimatedCost: 25,
  },
  {
    id: 'indiranagar',
    name: 'Indiranagar 100ft Road',
    area: 'East Bengaluru',
    category: 'Nightlife & Boutiques',
    latitude: 12.9783,
    longitude: 77.6387,
    nearestMetro: 'Indiranagar Metro',
    metroLine: 'purple',
    walkMinutesFromMetro: 3,
    tip: '12th Main cafes are 5 min walk south from Metro Exit B.',
    autoFareQuoteWarning: 'Auto fare to 12th Main cross is ₹40 on meter.',
    estimatedCost: 30,
  },
  {
    id: 'koramangala',
    name: 'Koramangala 5th Block',
    area: 'South-East Bengaluru',
    category: 'Startups & Food District',
    latitude: 12.9352,
    longitude: 77.6245,
    nearestMetro: 'South End Circle (take connecting bus G-2 or 10 min auto)',
    metroLine: 'green',
    walkMinutesFromMetro: 18,
    tip: 'No direct metro yet! Best route: Metro to Trinity or South End Circle, then auto/BMTC bus 201.',
    autoFareQuoteWarning: 'Auto from Trinity Metro to Koramangala 5th Block is ₹90 on meter.',
    estimatedCost: 95,
  },
  {
    id: 'vvpuram',
    name: 'VV Puram Food Street (Thindi Beedi)',
    area: 'Basavanagudi / KR Market',
    category: 'Street Food (Evening 6pm+)',
    latitude: 12.9535,
    longitude: 77.5786,
    nearestMetro: 'Krishna Rajendra Market or National College',
    metroLine: 'green',
    walkMinutesFromMetro: 8,
    tip: 'Active only after 6 PM. Start north for congress bun, finish south for holige & ice cream.',
    autoFareQuoteWarning: 'Late night autos past 10pm ask flat ₹200. Metro runs till 11:15pm.',
    estimatedCost: 40,
  },
  {
    id: 'bulltemple',
    name: 'Bull Temple & Gandhi Bazaar',
    area: 'Basavanagudi',
    category: 'Heritage & Food',
    latitude: 12.9422,
    longitude: 77.5684,
    nearestMetro: 'National College',
    metroLine: 'green',
    walkMinutesFromMetro: 11,
    tip: 'Walk down shaded Bugle Rock road. Vidyarthi Bhavan dosa is 7 mins from here.',
    autoFareQuoteWarning: 'Autos often refuse 1 km hop or ask ₹100. Walking is pleasant.',
    estimatedCost: 35,
  },
  {
    id: 'palace',
    name: 'Bangalore Palace',
    area: 'Vasanth Nagar / Sadashivanagar',
    category: 'Palace & Heritage',
    latitude: 12.9988,
    longitude: 77.5921,
    nearestMetro: 'Mantri Square Sampige Road',
    metroLine: 'green',
    walkMinutesFromMetro: 14,
    tip: 'Only buy tickets at the interior official counter (₹250 Indian / ₹500 Foreigner).',
    autoFareQuoteWarning: 'Auto from Mantri Square to Palace Gate is ₹50 on meter.',
    estimatedCost: 75,
  },
  {
    id: 'commercial',
    name: 'Commercial Street',
    area: 'Shivajinagar / Tasker Town',
    category: 'Bargain & Fabric Shopping',
    latitude: 12.9822,
    longitude: 77.6083,
    nearestMetro: 'MG Road or Cubbon Park',
    metroLine: 'purple',
    walkMinutesFromMetro: 12,
    tip: 'Walk from MG Road via Kamaraj Road, or take a ₹40 auto. Street is vibrant in evenings.',
    autoFareQuoteWarning: 'Bargain hard on shoes & garments — start at 40% of asking price.',
    estimatedCost: 30,
  },
  {
    id: 'malleswaram',
    name: 'Malleswaram 8th Cross (CTR & Markets)',
    area: 'West Bengaluru Heritage',
    category: 'Temples & Benne Dosa',
    latitude: 13.0031,
    longitude: 77.5702,
    nearestMetro: 'Mantri Square Sampige Road or Kuvempu Road',
    metroLine: 'green',
    walkMinutesFromMetro: 7,
    tip: 'CTR / Shri Sagar benne dosa is on 7th Cross. Go before 11:30am or after 4pm.',
    autoFareQuoteWarning: 'Share-autos available from Sampige Road metro for ₹15.',
    estimatedCost: 25,
  },
  {
    id: 'whitefield',
    name: 'ITPL / Whitefield Tech Corridor',
    area: 'East Tech Belt',
    category: 'Work & Modern Malls',
    latitude: 12.9877,
    longitude: 77.7289,
    nearestMetro: 'Pattandur Agrahara (ITPL) or Whitefield',
    metroLine: 'purple',
    walkMinutesFromMetro: 3,
    tip: 'Purple line connects directly to ITPL gates — avoids horrific Tin Factory traffic jams!',
    autoFareQuoteWarning: 'Cabs cost ₹600-₹800 in peak traffic; metro costs ₹60 and saves 1.5 hours.',
    estimatedCost: 60,
  },
];

/**
 * Returns line display color
 */
export function getLineColor(line) {
  switch (line) {
    case 'purple': return PURPLE_LINE;
    case 'green': return GREEN_LINE;
    case 'dmrc_yellow': return DMRC_YELLOW;
    case 'dmrc_blue': return DMRC_BLUE;
    case 'dmrc_airport': return DMRC_AIRPORT;
    case 'mumbai_western': return MUMBAI_WESTERN;
    case 'mumbai_central': return MUMBAI_CENTRAL;
    case 'mumbai_metro1': return MUMBAI_METRO1;
    default: return PURPLE_LINE;
  }
}

/**
 * Returns line display name
 */
export function getLineDisplayName(line) {
  switch (line) {
    case 'purple': return 'Purple Line';
    case 'green': return 'Green Line';
    case 'dmrc_yellow': return 'Yellow Line (DMRC)';
    case 'dmrc_blue': return 'Blue Line (DMRC)';
    case 'dmrc_airport': return 'Airport Express (DMRC)';
    case 'mumbai_western': return 'Western Line (Local)';
    case 'mumbai_central': return 'Central Line (Local)';
    case 'mumbai_metro1': return 'Metro Line 1 (Versova-Ghatkopar)';
    default: return 'Transit Line';
  }
}

/**
 * Returns station array for given line
 */
export function getStationListForLine(line) {
  switch (line) {
    case 'purple': return PURPLE_STATIONS;
    case 'green': return GREEN_STATIONS;
    case 'dmrc_yellow': return DMRC_YELLOW_STATIONS;
    case 'dmrc_blue': return DMRC_BLUE_STATIONS;
    case 'dmrc_airport': return DMRC_AIRPORT_STATIONS;
    case 'mumbai_western': return MUMBAI_WESTERN_STATIONS;
    case 'mumbai_central': return MUMBAI_CENTRAL_STATIONS;
    case 'mumbai_metro1': return MUMBAI_METRO1_STATIONS;
    default: return PURPLE_STATIONS;
  }
}

/**
 * Detects city from coordinate latitude and longitude
 */
export function detectCityFromCoord(lat, lon) {
  if (lat > 26) return 'delhi';
  if (lat > 18 && lon < 74) return 'mumbai';
  return 'bengaluru';
}

/**
 * Calculates real-time next train departure details from any station
 * based on current hour & day, including today's upcoming trains schedule.
 */
export function getNextMetroDeparture(stationId, line = 'purple', targetDate = new Date(), cityId = null) {
  const hour = targetDate.getHours();
  const minute = targetDate.getMinutes();

  const isDelhi = cityId === 'delhi' || line.startsWith('dmrc');
  const isMumbai = cityId === 'mumbai' || line.startsWith('mumbai');

  let isOperating = false;
  let opensAt = '05:00 AM';
  let closesAt = '23:15 PM';

  if (isDelhi) {
    // Delhi Metro: 05:30 AM to 23:30 PM (Airport Express opens 04:45 AM)
    opensAt = line === 'dmrc_airport' ? '04:45 AM' : '05:30 AM';
    closesAt = '23:30 PM';
    const startHour = line === 'dmrc_airport' ? 4 : 5;
    const startMin = line === 'dmrc_airport' ? 45 : 30;
    isOperating = (hour > startHour || (hour === startHour && minute >= startMin)) && (hour < 23 || (hour === 23 && minute <= 30));
  } else if (isMumbai) {
    // Mumbai Locals run almost around the clock: 04:00 AM to 01:30 AM
    opensAt = '04:00 AM';
    closesAt = '01:30 AM';
    isOperating = hour >= 4 || hour === 0 || (hour === 1 && minute <= 30);
  } else {
    // Bengaluru Namma Metro: 05:00 to 23:15
    opensAt = '05:00 AM';
    closesAt = '23:15 PM';
    isOperating = (hour > 5 || (hour === 5 && minute >= 0)) && (hour < 23 || (hour === 23 && minute <= 15));
  }

  if (!isOperating) {
    return {
      status: 'closed',
      isOperating: false,
      nextInMinutes: null,
      scheduledTime: `Opens ${opensAt}`,
      departures: [],
      frequencyMinutes: 15,
      frequencyLabel: `Closed (Resumes ${opensAt})`,
      operatingHours: `${opensAt} – ${closesAt}`,
      note: `Service closed for the night. Resumes at ${opensAt}.`,
    };
  }

  let frequency = 8;
  let frequencyLabel = 'Regular frequency: every 8 mins';

  if (isDelhi) {
    if ((hour >= 8 && hour < 11) || (hour >= 17 && hour < 21)) {
      frequency = 3;
      frequencyLabel = 'Peak rush: every 3 mins (DMRC Express)';
    } else if (hour < 7 || hour >= 22) {
      frequency = 8;
      frequencyLabel = 'Late evening: every 8 mins';
    } else {
      frequency = 5;
      frequencyLabel = 'Regular frequency: every 5 mins';
    }
  } else if (isMumbai) {
    if ((hour >= 8 && hour < 11) || (hour >= 17 && hour < 21)) {
      frequency = 4;
      frequencyLabel = 'Super-fast rush: every 3–4 mins';
    } else if (hour < 6 || hour >= 23) {
      frequency = 12;
      frequencyLabel = 'Night local: every 12 mins';
    } else {
      frequency = 6;
      frequencyLabel = 'Regular frequency: every 6 mins';
    }
  } else {
    if ((hour >= 8 && hour < 11) || (hour >= 17 && hour < 21)) {
      frequency = 5;
      frequencyLabel = 'Peak rush: every 4–5 mins';
    } else if (hour < 8 || hour >= 21) {
      frequency = 12;
      frequencyLabel = 'Late evening: every 12 mins';
    }
  }

  const remainder = minute % frequency;
  const minutesUntilNext = remainder === 0 ? frequency : frequency - remainder;

  const departures = [];
  for (let i = 0; i < 4; i++) {
    const mins = minutesUntilNext + i * frequency;
    const depDate = new Date(targetDate.getTime() + mins * 60 * 1000);
    const hoursFormatted = depDate.getHours() % 12 || 12;
    const minutesFormatted = String(depDate.getMinutes()).padStart(2, '0');
    const ampm = depDate.getHours() >= 12 ? 'PM' : 'AM';
    departures.push({
      inMinutes: mins,
      timeFormatted: `${hoursFormatted}:${minutesFormatted} ${ampm}`,
      isNext: i === 0,
    });
  }

  return {
    status: 'running',
    isOperating: true,
    nextInMinutes: minutesUntilNext,
    scheduledTime: departures[0]?.timeFormatted,
    departures,
    frequencyMinutes: frequency,
    frequencyLabel,
    operatingHours: `${opensAt} – ${closesAt}`,
    lineColor: getLineColor(line),
    lineName: getLineDisplayName(line),
    note: `Runs every ${frequency} min during this hour`,
  };
}

/**
 * Calculates fare in Indian Rupees between two station indices
 */
export function calculateMetroFare(stopCount, cityId = 'bengaluru') {
  if (cityId === 'mumbai') {
    if (stopCount <= 3) return 5;
    if (stopCount <= 8) return 10;
    if (stopCount <= 15) return 15;
    return 20;
  }
  if (cityId === 'delhi') {
    if (stopCount <= 2) return 10;
    if (stopCount <= 5) return 20;
    if (stopCount <= 12) return 30;
    if (stopCount <= 21) return 40;
    if (stopCount <= 32) return 50;
    return 60;
  }
  // Bengaluru default
  if (stopCount <= 1) return 10;
  if (stopCount <= 3) return 15;
  if (stopCount <= 6) return 25;
  if (stopCount <= 10) return 35;
  if (stopCount <= 16) return 45;
  if (stopCount <= 22) return 55;
  return 60;
}

/**
 * Calculates Haversine distance in meters between two lat/lon coordinates
 */
export function getDistanceBetween(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // metres
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // distance in meters
}

/**
 * Finds the nearest metro station to any coordinate
 */
export function findNearestMetroStation(lat, lon, cityId = null) {
  const city = cityId || detectCityFromCoord(lat, lon);
  let best = null;
  let minDistance = Infinity;

  if (city === 'delhi') {
    for (const st of DMRC_YELLOW_STATIONS) {
      const d = getDistanceBetween(lat, lon, st.latitude, st.longitude);
      if (d < minDistance) {
        minDistance = d;
        best = { ...st, line: 'dmrc_yellow', city: 'delhi', distanceMeters: Math.round(d) };
      }
    }
    for (const st of DMRC_BLUE_STATIONS) {
      const d = getDistanceBetween(lat, lon, st.latitude, st.longitude);
      if (d < minDistance) {
        minDistance = d;
        best = { ...st, line: 'dmrc_blue', city: 'delhi', distanceMeters: Math.round(d) };
      }
    }
    for (const st of DMRC_AIRPORT_STATIONS) {
      const d = getDistanceBetween(lat, lon, st.latitude, st.longitude);
      if (d < minDistance) {
        minDistance = d;
        best = { ...st, line: 'dmrc_airport', city: 'delhi', distanceMeters: Math.round(d) };
      }
    }
  } else if (city === 'mumbai') {
    for (const st of MUMBAI_WESTERN_STATIONS) {
      const d = getDistanceBetween(lat, lon, st.latitude, st.longitude);
      if (d < minDistance) {
        minDistance = d;
        best = { ...st, line: 'mumbai_western', city: 'mumbai', distanceMeters: Math.round(d) };
      }
    }
    for (const st of MUMBAI_CENTRAL_STATIONS) {
      const d = getDistanceBetween(lat, lon, st.latitude, st.longitude);
      if (d < minDistance) {
        minDistance = d;
        best = { ...st, line: 'mumbai_central', city: 'mumbai', distanceMeters: Math.round(d) };
      }
    }
    for (const st of MUMBAI_METRO1_STATIONS) {
      const d = getDistanceBetween(lat, lon, st.latitude, st.longitude);
      if (d < minDistance) {
        minDistance = d;
        best = { ...st, line: 'mumbai_metro1', city: 'mumbai', distanceMeters: Math.round(d) };
      }
    }
  } else {
    // Default to Bengaluru
    for (const st of PURPLE_STATIONS) {
      const d = getDistanceBetween(lat, lon, st.latitude, st.longitude);
      if (d < minDistance) {
        minDistance = d;
        best = { ...st, line: 'purple', city: 'bengaluru', distanceMeters: Math.round(d) };
      }
    }
    for (const st of GREEN_STATIONS) {
      const d = getDistanceBetween(lat, lon, st.latitude, st.longitude);
      if (d < minDistance) {
        minDistance = d;
        best = { ...st, line: 'green', city: 'bengaluru', distanceMeters: Math.round(d) };
      }
    }
  }

  return best;
}

/**
 * Returns exact transfer instructions at Majestic Interchange (Bengaluru)
 */
export function getMajesticInterchangeGuide(fromLine, toLine) {
  if (fromLine === toLine) return null;

  if (fromLine === 'purple' && toLine === 'green') {
    return {
      title: 'Interchange at Nadaprabhu Kempegowda (Majestic)',
      steps: [
        'Step off Purple Line train at Level 1 (Underground)',
        'Look overhead for bright GREEN wayfinding signage',
        'Take central escalators down to Green Line concourse (Level 2)',
        'Platform 3 heads North to Madavara; Platform 4 heads South to Silk Institute',
        'Allow 3 to 4 minutes walking time inside the station',
      ],
      tip: 'Do NOT tap your card/token at the gates inside — transfers are within the paid area!',
    };
  }

  return {
    title: 'Interchange at Nadaprabhu Kempegowda (Majestic)',
    steps: [
      'Step off Green Line train at Level 2',
      'Follow PURPLE arrows up via escalator to Level 1',
      'Platform 1 heads East to Whitefield; Platform 2 heads West to Challaghatta',
      'Estimated walking time: 3 minutes',
    ],
    tip: 'Transfers are completely free inside the paid concourse.',
  };
}

/**
 * Returns exact transfer instructions at Rajiv Chowk Interchange (Delhi)
 */
export function getRajivChowkInterchangeGuide(fromLine, toLine) {
  if (fromLine === toLine) return null;
  if (fromLine === 'dmrc_yellow' && toLine === 'dmrc_blue') {
    return {
      title: 'Interchange at Rajiv Chowk (Yellow ⇄ Blue)',
      steps: [
        'Step off Yellow Line at Upper Concourse level',
        'Look for BLUE Line directional signs and follow floor markers',
        'Take central escalators down to Level -2 concourse',
        'Platform 3 heads East to Noida / Vaishali; Platform 4 heads West to Dwarka Sector 21',
        'Allow 3 to 4 minutes walking time inside the station',
      ],
      tip: 'Stay inside the paid concourse; transfers are free without re-tapping your smart token or card!',
    };
  }
  if (fromLine === 'dmrc_blue' && toLine === 'dmrc_yellow') {
    return {
      title: 'Interchange at Rajiv Chowk (Blue ⇄ Yellow)',
      steps: [
        'Step off Blue Line train at Platform 3/4 (Level -2)',
        'Take escalators up following YELLOW signage to Upper Concourse',
        'Platform 1 heads South to Millennium City Centre Gurugram; Platform 2 heads North to Samaypur Badli',
        'Allow 3 to 4 minutes transfer time',
      ],
      tip: 'Keep your QR ticket active for exit at your final destination.',
    };
  }
  return {
    title: 'Interchange at Rajiv Chowk',
    steps: [
      'Follow overhead color-coded wayfinding signs to your connecting platform',
      'Transfers are fully seamless within the paid area',
    ],
    tip: 'Follow floor arrows for the fastest escalator path.',
  };
}

/**
 * Returns exact transfer instructions at Dadar Junction Interchange (Mumbai)
 */
export function getDadarInterchangeGuide(fromLine, toLine) {
  if (fromLine === toLine) return null;
  if (fromLine === 'mumbai_western' && toLine === 'mumbai_central') {
    return {
      title: 'Interchange at Dadar Junction (Western ⇄ Central)',
      steps: [
        'Step off Western local at Platforms 1–6 (West side)',
        'Ascend the wide Foot Overbridge (FOB) across the station',
        'Walk toward East side to Platforms 7–14 for Central Line locals',
        'Check indicator boards for Fast (F) vs Slow (S) trains to Thane / Kalyan',
        'Allow 3 to 4 minutes walking time across the FOB',
      ],
      tip: 'Hold handrails on stairs during rush hour. Daily UTS suburban tickets are valid across both lines.',
    };
  }
  return {
    title: 'Interchange at Dadar Junction (Central ⇄ Western)',
    steps: [
      'Step off Central local at Platforms 7–14 (East side)',
      'Cross via mid-station Foot Overbridge (FOB) heading West',
      'Descend to Platforms 1–6 for Western Line locals toward Churchgate or Borivali',
      'Check headsign indicators for Churchgate Fast locals',
    ],
    tip: 'Fast locals skip small stations between Dadar and Churchgate; choose slow local if stopping at Charni Road or Marine Lines.',
  };
}

/**
 * General multi-city interchange guide router
 */
export function getInterchangeGuide(cityId, fromLine, toLine) {
  if (cityId === 'delhi' || fromLine?.startsWith('dmrc') || toLine?.startsWith('dmrc')) {
    return getRajivChowkInterchangeGuide(fromLine, toLine);
  }
  if (cityId === 'mumbai' || fromLine?.startsWith('mumbai') || toLine?.startsWith('mumbai')) {
    return getDadarInterchangeGuide(fromLine, toLine);
  }
  return getMajesticInterchangeGuide(fromLine, toLine);
}

/**
 * Gate and exit landmarks for key Bengaluru Metro stations
 */
export const STATION_GATES = {
  p1: {
    stationName: 'Whitefield (Kadugodi)',
    gates: [
      { id: 'Gate A', name: 'Whitefield Main Road', exitFor: 'Kadugodi Bus Stand & Railway Station' },
      { id: 'Gate B', name: 'ITPL Link Road', exitFor: 'Tech parks, ITPL & Hope Farm junction' },
    ],
    defaultExit: 'Gate A',
  },
  p4: {
    stationName: 'Pattandur Agrahara (ITPL)',
    gates: [
      { id: 'Gate 1', name: 'ITPL Main Gate', exitFor: 'International Tech Park, Park Square Mall' },
      { id: 'Gate 2', name: 'Hope Farm Side', exitFor: 'AECS Layout link, residential' },
    ],
    defaultExit: 'Gate 1',
  },
  p12: {
    stationName: 'KR Pura (Outer Ring Road)',
    gates: [
      { id: 'Gate A', name: 'Outer Ring Road (ORR)', exitFor: 'Buses to Marathahalli, Bellandur, Sarjapur' },
      { id: 'Gate B', name: 'Old Madras Road', exitFor: 'KR Puram Railway Station & market' },
    ],
    defaultExit: 'Gate A',
  },
  p16: {
    stationName: 'Indiranagar',
    gates: [
      { id: 'Gate A', name: 'CMH Road (Chinmaya Mission)', exitFor: 'CMH Hospital, Double Road, Metro parking' },
      { id: 'Gate B', name: '100 Feet Road Corner', exitFor: '100 Feet Road cafes, Toit, 12th Main, shopping' },
    ],
    defaultExit: 'Gate B',
  },
  p18: {
    stationName: 'Trinity',
    gates: [
      { id: 'Gate 1', name: 'MG Road East', exitFor: '1MG Mall, Taj MG Road, Trinity Circle' },
      { id: 'Gate 2', name: 'Old Airport Road Side', exitFor: 'Command Hospital, Victoria Layout' },
    ],
    defaultExit: 'Gate 1',
  },
  p19: {
    stationName: 'MG Road',
    gates: [
      { id: 'Gate A', name: 'Church Street & Brigade Road', exitFor: 'Church St cafes, Brigade Rd, Empire, bookstores' },
      { id: 'Gate B', name: 'MG Road Boulevard', exitFor: 'Rangoli Metro Art Centre, Anil Kumble Circle' },
    ],
    defaultExit: 'Gate A',
  },
  p20: {
    stationName: 'Cubbon Park',
    gates: [
      { id: 'Gate 1', name: 'Cubbon Park Main Entrance', exitFor: 'Cubbon Park shade walk, KSLTA, Press Club' },
      { id: 'Gate 2', name: 'Chinnaswamy Stadium / GPO', exitFor: 'Cricket Stadium, High Court of Karnataka, GPO' },
    ],
    defaultExit: 'Gate 1',
  },
  p21: {
    stationName: 'Dr. BR Ambedkar Vidhana Soudha',
    gates: [
      { id: 'Gate 1', name: 'Vidhana Soudha Side', exitFor: 'Vidhana Soudha & Vikas Soudha legislative complex' },
      { id: 'Gate 2', name: 'High Court / MS Building', exitFor: 'Karnataka High Court, Government offices' },
    ],
    defaultExit: 'Gate 1',
  },
  p23: {
    stationName: 'Nadaprabhu Kempegowda (Majestic)',
    gates: [
      { id: 'Gate A', name: 'BMTC City Bus Stand', exitFor: 'Majestic Bus Station, KSRTC terminal' },
      { id: 'Gate B', name: 'KSR City Railway Station', exitFor: 'Bangalore City Railway Station footbridge' },
      { id: 'Gate C', name: 'Tank Bund Road / Chickpet', exitFor: 'Chickpet commercial market & Gandhinagar' },
    ],
    defaultExit: 'Gate A',
  },
  p24: {
    stationName: 'KSR Bengaluru City Railway Station',
    gates: [
      { id: 'Gate 1', name: 'Railway Station Footbridge', exitFor: 'Direct platform 1-10 entrance to KSR SBC' },
      { id: 'Gate 2', name: 'Subhash Nagar Side', exitFor: 'Autos & city drop-off' },
    ],
    defaultExit: 'Gate 1',
  },
  g13: {
    stationName: 'National College (Basavanagudi)',
    gates: [
      { id: 'Gate 1', name: 'Gandhi Bazaar / DVG Road', exitFor: 'Vidyarthi Bhavan, Gandhi Bazaar, Ramakrishna Ashrama' },
      { id: 'Gate 2', name: 'Pampa Mahakavi Road', exitFor: 'National College grounds, Basavanagudi post office' },
    ],
    defaultExit: 'Gate 1',
  },
  g14: {
    stationName: 'Lalbagh',
    gates: [
      { id: 'Gate 4', name: 'West Gate / Lalbagh Fort Rd', exitFor: 'Lalbagh Botanical Garden West Gate & MTR Restaurant' },
      { id: 'Gate 1', name: 'RV Road Side', exitFor: 'Krumbiegel Road, South Bengaluru links' },
    ],
    defaultExit: 'Gate 4',
  },
  g15: {
    stationName: 'South End Circle',
    gates: [
      { id: 'Gate A', name: 'Ashoka Pillar / Jayanagar 1st', exitFor: 'South End Circle, Ashoka Pillar monument' },
      { id: 'Gate B', name: 'Pattabhirama Temple Side', exitFor: 'Jayanagar 2nd & 3rd block' },
    ],
    defaultExit: 'Gate A',
  },
  g16: {
    stationName: 'Jayanagar',
    gates: [
      { id: 'Gate 1', name: 'Jayanagar 4th Block Complex', exitFor: '4th Block Shopping Complex, Maiyas, Cool Joint' },
      { id: 'Gate 2', name: '30th Cross / 11th Main', exitFor: 'Cosmopolitan Club, residential Jayanagar' },
    ],
    defaultExit: 'Gate 1',
  },
  // Delhi Key Stations
  del_y7: {
    stationName: 'Rajiv Chowk (Connaught Place)',
    gates: [
      { id: 'Gate 7', name: 'CP Inner Circle (B-Block)', exitFor: 'Connaught Place B & C Block, Palika Underground Market' },
      { id: 'Gate 8', name: 'Radial Road 2', exitFor: 'Radial Road, Janpath link, Central Park' },
      { id: 'Gate 1', name: 'Radial Road 1 / F-Block', exitFor: 'Odeon Cinema, F-Block restaurants, Kasturba Gandhi Marg' },
    ],
    defaultExit: 'Gate 7',
  },
  del_y6: {
    stationName: 'New Delhi',
    gates: [
      { id: 'Gate 1', name: 'Ajmeri Gate / Railway Station', exitFor: 'Direct footbridge into New Delhi Railway Platform 16' },
      { id: 'Gate 2', name: 'Airport Express Link', exitFor: 'Dedicated corridor to Airport Express Line concourse' },
    ],
    defaultExit: 'Gate 1',
  },
  del_y4: {
    stationName: 'Chandni Chowk',
    gates: [
      { id: 'Gate 1', name: 'Chandni Chowk Main Road', exitFor: 'Paranthe Wali Gali, Gurudwara Sis Ganj, Red Fort' },
      { id: 'Gate 3', name: 'Old Delhi Railway Station', exitFor: 'Direct underground walkway to Delhi Junction Railway' },
    ],
    defaultExit: 'Gate 1',
  },
  del_b18: {
    stationName: 'Rajiv Chowk (Blue Line)',
    gates: [
      { id: 'Gate 7', name: 'CP Inner Circle', exitFor: 'Connaught Place shopping arcade' },
      { id: 'Gate 8', name: 'Radial Road 2', exitFor: 'Palika Bazaar, Outer Circle Janpath' },
    ],
    defaultExit: 'Gate 7',
  },
  del_b15: {
    stationName: 'Karol Bagh',
    gates: [
      { id: 'Gate 1', name: 'Pusa Road (Ajmal Khan Rd)', exitFor: 'Ajmal Khan Road shopping street & clothing boutiques' },
      { id: 'Gate 2', name: 'Arya Samaj Road', exitFor: 'Ghaffar Market electronics & mobile hub' },
    ],
    defaultExit: 'Gate 1',
  },
  del_a5: {
    stationName: 'IGI Airport T3',
    gates: [
      { id: 'Gate 1', name: 'Terminal 3 Arrivals', exitFor: 'Direct covered air-conditioned concourse into T3' },
      { id: 'Gate 2', name: 'Terminal 3 Departures', exitFor: 'Escalator link to Departure Check-in Desks' },
    ],
    defaultExit: 'Gate 1',
  },
  // Mumbai Key Stations
  mum_w1: {
    stationName: 'Churchgate',
    gates: [
      { id: 'Gate 1', name: 'Veer Nariman Road', exitFor: 'Marine Drive Queens Necklace promenade, Brabourne Stadium' },
      { id: 'Gate 2', name: 'Maharshi Karve Road', exitFor: 'Oval Maidan, High Court, Eros Cinema' },
    ],
    defaultExit: 'Gate 1',
  },
  mum_w9: {
    stationName: 'Dadar Western',
    gates: [
      { id: 'Gate 1', name: 'Ranade Road (West)', exitFor: 'Dadar West Flower Market, Kirti College, Shivaji Park' },
      { id: 'Gate 2', name: 'Mid-Station FOB', exitFor: 'Transfer to Central Line Platforms 7–14' },
    ],
    defaultExit: 'Gate 1',
  },
  mum_c1: {
    stationName: 'CSMT',
    gates: [
      { id: 'Gate 1', name: 'Subway to Fort / D.N. Road', exitFor: 'Subway to Flora Fountain, Kala Ghoda, Asiatic Library' },
      { id: 'Gate 2', name: 'Platform 1 Concourse', exitFor: 'Main heritage booking hall & long-distance trains' },
    ],
    defaultExit: 'Gate 1',
  },
  mum_c8: {
    stationName: 'Dadar Central',
    gates: [
      { id: 'Gate 1', name: 'Swami Gyan Jivandas Marg (East)', exitFor: 'Dadar East, Dr. Ambedkar Road, TT Circle' },
      { id: 'Gate 2', name: 'Mid-Station FOB', exitFor: 'Transfer to Western Line Platforms 1–6' },
    ],
    defaultExit: 'Gate 1',
  },
};

/**
 * Returns platform direction and gate details for a station on a journey
 */
export function getMetroPlatformAndGateInfo({ stationId, line, fromIdx = 0, toIdx = 1 }) {
  let platformNum = 1;
  let towardsHeadsign = '';

  if (line === 'purple') {
    if (toIdx > fromIdx) {
      platformNum = 2;
      towardsHeadsign = 'Towards Challaghatta (Westbound)';
    } else {
      platformNum = 1;
      towardsHeadsign = 'Towards Whitefield / ITPL (Eastbound)';
    }
  } else if (line === 'green') {
    if (toIdx > fromIdx) {
      platformNum = 1;
      towardsHeadsign = 'Towards Silk Institute (Southbound)';
    } else {
      platformNum = 2;
      towardsHeadsign = 'Towards Madavara / Nagasandra (Northbound)';
    }
  } else if (line === 'dmrc_yellow') {
    if (toIdx > fromIdx) {
      platformNum = 1;
      towardsHeadsign = 'Towards Millennium City Centre Gurugram (Southbound)';
    } else {
      platformNum = 2;
      towardsHeadsign = 'Towards Samaypur Badli (Northbound)';
    }
  } else if (line === 'dmrc_blue') {
    if (toIdx > fromIdx) {
      platformNum = 3;
      towardsHeadsign = 'Towards Noida Electronic City / Vaishali (Eastbound)';
    } else {
      platformNum = 4;
      towardsHeadsign = 'Towards Dwarka Sector 21 (Westbound)';
    }
  } else if (line === 'dmrc_airport') {
    if (toIdx > fromIdx) {
      platformNum = 1;
      towardsHeadsign = 'Towards IGI Airport T3 / Yashobhoomi (Southbound)';
    } else {
      platformNum = 2;
      towardsHeadsign = 'Towards New Delhi Railway Station (Northbound)';
    }
  } else if (line === 'mumbai_western') {
    if (toIdx > fromIdx) {
      platformNum = 1;
      towardsHeadsign = 'Towards Borivali / Dahanu (Northbound / Up Local)';
    } else {
      platformNum = 2;
      towardsHeadsign = 'Towards Churchgate (Southbound / Down Local)';
    }
  } else if (line === 'mumbai_central') {
    if (toIdx > fromIdx) {
      platformNum = 1;
      towardsHeadsign = 'Towards Thane / Kalyan (Northbound / Up Local)';
    } else {
      platformNum = 2;
      towardsHeadsign = 'Towards CSMT Terminus (Southbound / Down Local)';
    }
  } else if (line === 'mumbai_metro1') {
    if (toIdx > fromIdx) {
      platformNum = 1;
      towardsHeadsign = 'Towards Ghatkopar (Eastbound Metro)';
    } else {
      platformNum = 2;
      towardsHeadsign = 'Towards Versova (Westbound Metro)';
    }
  }

  const gateData = STATION_GATES[stationId] || {
    gates: [
      { id: 'Gate 1', name: 'Main Road Entrance', exitFor: 'Street level access & auto stand' },
      { id: 'Gate 2', name: 'Opposite Side Entrance', exitFor: 'Pedestrian crossing & parking' },
    ],
    defaultExit: 'Gate 1',
  };

  return {
    platform: `Platform ${platformNum}`,
    platformNum,
    towards: towardsHeadsign,
    entryGate: gateData.gates[0]?.id || 'Gate 1',
    exitGate: gateData.defaultExit,
    gates: gateData.gates,
  };
}
