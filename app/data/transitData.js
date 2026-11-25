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
export const KOLKATA_BLUE = '#1d4ed8';
export const KOLKATA_GREEN = '#15803d';
export const KOLKATA_PURPLE = '#7e22ce';
export const KOLKATA_ORANGE = '#ea580c';
export const KOLKATA_TRAM = '#0891b2';
export const KOLKATA_FERRY = '#0284c7';
export const HYD_RED = '#dc2626';
export const HYD_BLUE = '#2563eb';
export const HYD_GREEN = '#16a34a';
export const CHENNAI_BLUE = '#0284c7';
export const CHENNAI_GREEN = '#10b981';

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

// Kolkata Metro Blue Line 1 (Dakshineswar <-> Dum Dum <-> Esplanade <-> Kavi Subhash)
export const KOLKATA_BLUE_STATIONS = [
  { id: 'kol_b1', name: 'Dakshineswar (Skywalk to Kali Temple & Ferry)', latitude: 22.6552, longitude: 88.3575 },
  { id: 'kol_b2', name: 'Baranagar', latitude: 22.6416, longitude: 88.3694 },
  { id: 'kol_b3', name: 'Noapara (Depot Hub)', latitude: 22.6338, longitude: 88.3842 },
  { id: 'kol_b4', name: 'Dum Dum (Suburban Rail Interchange)', latitude: 22.6219, longitude: 88.3932, isInterchange: true },
  { id: 'kol_b5', name: 'Belgachia', latitude: 22.6072, longitude: 88.3822 },
  { id: 'kol_b6', name: 'Shyambazar (5-Point Crossing)', latitude: 22.6011, longitude: 88.3718 },
  { id: 'kol_b7', name: 'Shobhabazar Sutanuti (Kumartuli Heritage)', latitude: 22.5961, longitude: 88.3662 },
  { id: 'kol_b8', name: 'Girish Park', latitude: 22.5862, longitude: 88.3598 },
  { id: 'kol_b9', name: 'Mahatma Gandhi Road (Burrabazar Market)', latitude: 22.5815, longitude: 88.3585 },
  { id: 'kol_b10', name: 'Central (College St / Bowbazar)', latitude: 22.5735, longitude: 88.3572 },
  { id: 'kol_b11', name: 'Chandni Chowk (Electronics Market)', latitude: 22.5684, longitude: 88.3548 },
  { id: 'kol_b12', name: 'Esplanade (Mega Interchange with Green Line)', latitude: 22.5645, longitude: 88.3516, isInterchange: true },
  { id: 'kol_b13', name: 'Park Street (Dining & Flurys / Allen Park)', latitude: 22.5535, longitude: 88.3524 },
  { id: 'kol_b14', name: 'Maidan (Brigade Ground / Victoria View)', latitude: 22.5482, longitude: 88.3499 },
  { id: 'kol_b15', name: 'Rabindra Sadan (Nandan & Academy of Fine Arts)', latitude: 22.5398, longitude: 88.3483 },
  { id: 'kol_b16', name: 'Netaji Bhavan (Bose Memorial)', latitude: 22.5338, longitude: 88.3475 },
  { id: 'kol_b17', name: 'Jatin Das Park (Hazra Crossing)', latitude: 22.5248, longitude: 88.3468 },
  { id: 'kol_b18', name: 'Kalighat (Temple & Rashbehari Crossing)', latitude: 22.5186, longitude: 88.3458 },
  { id: 'kol_b19', name: 'Rabindra Sarobar (Southern Lakes)', latitude: 22.5098, longitude: 88.3462 },
  { id: 'kol_b20', name: 'Mahanayak Uttam Kumar (Tollygunge)', latitude: 22.4975, longitude: 88.3452, isInterchange: true },
  { id: 'kol_b21', name: 'Netaji (Kudghat)', latitude: 22.4878, longitude: 88.3465 },
  { id: 'kol_b22', name: 'Masterda Surya Sen (Bansdroni)', latitude: 22.4789, longitude: 88.3524 },
  { id: 'kol_b23', name: 'Gitanjali (Naktala)', latitude: 22.4715, longitude: 88.3612 },
  { id: 'kol_b24', name: 'Kavi Nazrul (Garia Bazar)', latitude: 22.4665, longitude: 88.3745 },
  { id: 'kol_b25', name: 'Shahid Khudiram (Briji)', latitude: 22.4632, longitude: 88.3842 },
  { id: 'kol_b26', name: 'Kavi Subhash (New Garia Terminal)', latitude: 22.4608, longitude: 88.3989, isInterchange: true },
];

// Kolkata Metro Green Line 2 (Howrah Underwater <-> Sealdah <-> Salt Lake Sector V)
export const KOLKATA_GREEN_STATIONS = [
  { id: 'kol_g1', name: 'Howrah Maidan (Terminal)', latitude: 22.5862, longitude: 88.3288 },
  { id: 'kol_g2', name: 'Howrah Railway Station (Underwater Metro Interchange)', latitude: 22.5839, longitude: 88.3426, isInterchange: true },
  { id: 'kol_g3', name: 'Mahakaran (BBD Bagh / Riverfront)', latitude: 22.5744, longitude: 88.3488 },
  { id: 'kol_g4', name: 'Esplanade Green Line (Interchange with Blue Line)', latitude: 22.5645, longitude: 88.3516, isInterchange: true },
  { id: 'kol_g5', name: 'Sealdah Railway Station (Eastern Rail Interchange)', latitude: 22.5670, longitude: 88.3712, isInterchange: true },
  { id: 'kol_g6', name: 'Phoolbagan', latitude: 22.5712, longitude: 88.3892 },
  { id: 'kol_g7', name: 'Salt Lake Stadium (Yuva Bharati)', latitude: 22.5701, longitude: 88.4055 },
  { id: 'kol_g8', name: 'Bengal Chemical', latitude: 22.5772, longitude: 88.4124 },
  { id: 'kol_g9', name: 'City Centre (Salt Lake)', latitude: 22.5878, longitude: 88.4129 },
  { id: 'kol_g10', name: 'Central Park', latitude: 22.5902, longitude: 88.4208 },
  { id: 'kol_g11', name: 'Karunamoyee (Bus Terminus)', latitude: 22.5872, longitude: 88.4285 },
  { id: 'kol_g12', name: 'Salt Lake Sector V (IT Tech Corridor)', latitude: 22.5735, longitude: 88.4331, isInterchange: true },
];

// Hyderabad Metro Red Line 1 (Miyapur <-> LB Nagar via Ameerpet, MGBS) - 27 stations
export const HYD_RED_STATIONS = [
  { id: 'hyd_r1', name: 'Miyapur Terminal', latitude: 17.4966, longitude: 78.3614 },
  { id: 'hyd_r2', name: 'JNTU College', latitude: 17.4984, longitude: 78.3888 },
  { id: 'hyd_r3', name: 'KPHB Colony', latitude: 17.4925, longitude: 78.4012 },
  { id: 'hyd_r4', name: 'Kukatpally', latitude: 17.4842, longitude: 78.4138 },
  { id: 'hyd_r5', name: 'Balanagar', latitude: 17.4721, longitude: 78.4285 },
  { id: 'hyd_r6', name: 'Moosapet', latitude: 17.4645, longitude: 78.4352 },
  { id: 'hyd_r7', name: 'Bharat Nagar', latitude: 17.4582, longitude: 78.4398 },
  { id: 'hyd_r8', name: 'Erragadda', latitude: 17.4524, longitude: 78.4426 },
  { id: 'hyd_r9', name: 'ESI Hospital', latitude: 17.4478, longitude: 78.4445 },
  { id: 'hyd_r10', name: 'SR Nagar', latitude: 17.4421, longitude: 78.4468 },
  { id: 'hyd_r11', name: 'Ameerpet (Red & Blue Mega Interchange)', latitude: 17.4357, longitude: 78.4485, isInterchange: true },
  { id: 'hyd_r12', name: 'Punjagutta', latitude: 17.4288, longitude: 78.4524 },
  { id: 'hyd_r13', name: 'Irrum Manzil', latitude: 17.4215, longitude: 78.4568 },
  { id: 'hyd_r14', name: 'Khairatabad (Hussain Sagar Lake)', latitude: 17.4124, longitude: 78.4612 },
  { id: 'hyd_r15', name: 'Lakdi-ka-pul', latitude: 17.4042, longitude: 78.4665 },
  { id: 'hyd_r16', name: 'Assembly', latitude: 17.3975, longitude: 78.4712 },
  { id: 'hyd_r17', name: 'Nampally (Hyderabad Deccan Railway Terminal)', latitude: 17.3921, longitude: 78.4745, isInterchange: true },
  { id: 'hyd_r18', name: 'Gandhi Bhavan', latitude: 17.3872, longitude: 78.4775 },
  { id: 'hyd_r19', name: 'Osmania Medical College', latitude: 17.3828, longitude: 78.4802 },
  { id: 'hyd_r20', name: 'MGBS (Mahatma Gandhi Bus Station Interchange)', latitude: 17.3789, longitude: 78.4826, isInterchange: true },
  { id: 'hyd_r21', name: 'Malakpet (Railway Station link)', latitude: 17.3732, longitude: 78.4925 },
  { id: 'hyd_r22', name: 'New Market', latitude: 17.3695, longitude: 78.5024 },
  { id: 'hyd_r23', name: 'Musarambagh', latitude: 17.3672, longitude: 78.5112 },
  { id: 'hyd_r24', name: 'Dilsukhnagar', latitude: 17.3688, longitude: 78.5245 },
  { id: 'hyd_r25', name: 'Chaitanyapuri', latitude: 17.3654, longitude: 78.5362 },
  { id: 'hyd_r26', name: 'Victoria Memorial (Hyderabad)', latitude: 17.3621, longitude: 78.5458 },
  { id: 'hyd_r27', name: 'LB Nagar (South Terminal)', latitude: 17.3562, longitude: 78.5524, isInterchange: true },
];

// Hyderabad Metro Blue Line 2 (Nagole <-> Raidurg/Hitec City via Ameerpet, Secunderabad) - 23 stations
export const HYD_BLUE_STATIONS = [
  { id: 'hyd_b1', name: 'Nagole Terminal', latitude: 17.3792, longitude: 78.5612 },
  { id: 'hyd_b2', name: 'Uppal (Cricket Stadium)', latitude: 17.4024, longitude: 78.5582 },
  { id: 'hyd_b3', name: 'Stadium', latitude: 17.4112, longitude: 78.5498 },
  { id: 'hyd_b4', name: 'NGRI', latitude: 17.4185, longitude: 78.5385 },
  { id: 'hyd_b5', name: 'Habsiguda', latitude: 17.4245, longitude: 78.5312 },
  { id: 'hyd_b6', name: 'Tarnaka', latitude: 17.4285, longitude: 78.5225 },
  { id: 'hyd_b7', name: 'Mettuguda', latitude: 17.4342, longitude: 78.5145 },
  { id: 'hyd_b8', name: 'Secunderabad East (Secunderabad Railway Terminal)', latitude: 17.4334, longitude: 78.5045, isInterchange: true },
  { id: 'hyd_b9', name: 'Parade Ground (Interchange with Green Line)', latitude: 17.4428, longitude: 78.4985, isInterchange: true },
  { id: 'hyd_b10', name: 'Paradise', latitude: 17.4435, longitude: 78.4872 },
  { id: 'hyd_b11', name: 'Rasoolpura', latitude: 17.4421, longitude: 78.4765 },
  { id: 'hyd_b12', name: 'Prakash Nagar', latitude: 17.4445, longitude: 78.4652 },
  { id: 'hyd_b13', name: 'Begumpet (Railway Station link)', latitude: 17.4412, longitude: 78.4578, isInterchange: true },
  { id: 'hyd_b14', name: 'Ameerpet (Red & Blue Mega Interchange)', latitude: 17.4357, longitude: 78.4485, isInterchange: true },
  { id: 'hyd_b15', name: 'Madhura Nagar', latitude: 17.4325, longitude: 78.4398 },
  { id: 'hyd_b16', name: 'Yusufguda', latitude: 17.4312, longitude: 78.4312 },
  { id: 'hyd_b17', name: 'Road No 5 Jubilee Hills', latitude: 17.4295, longitude: 78.4215 },
  { id: 'hyd_b18', name: 'Jubilee Hills Check Post', latitude: 17.4285, longitude: 78.4124 },
  { id: 'hyd_b19', name: 'Peddamma Gudi', latitude: 17.4328, longitude: 78.4035 },
  { id: 'hyd_b20', name: 'Madhapur', latitude: 17.4392, longitude: 78.3965 },
  { id: 'hyd_b21', name: 'Durgam Cheruvu', latitude: 17.4445, longitude: 78.3895 },
  { id: 'hyd_b22', name: 'Hitec City (Cyber Towers & Tech Hub)', latitude: 17.4504, longitude: 78.3808 },
  { id: 'hyd_b23', name: 'Raidurg (Terminal / Mindspace IT Park)', latitude: 17.4412, longitude: 78.3775, isInterchange: true },
];

// Chennai Metro Blue Line 1 (Wimco Nagar <-> Chennai Airport via Central, LIC, Guindy) - 25 stations
export const CHENNAI_BLUE_STATIONS = [
  { id: 'chen_b1', name: 'Wimco Nagar Depot', latitude: 13.1692, longitude: 80.3012 },
  { id: 'chen_b2', name: 'Wimco Nagar', latitude: 13.1612, longitude: 80.3005 },
  { id: 'chen_b3', name: 'Tiruvottriyur', latitude: 13.1504, longitude: 80.2995 },
  { id: 'chen_b4', name: 'Kaladipet', latitude: 13.1415, longitude: 80.2982 },
  { id: 'chen_b5', name: 'Tollgate', latitude: 13.1312, longitude: 80.2974 },
  { id: 'chen_b6', name: 'New Washermanpet', latitude: 13.1215, longitude: 80.2952 },
  { id: 'chen_b7', name: 'Tondiarpet', latitude: 13.1124, longitude: 80.2912 },
  { id: 'chen_b8', name: 'Sir Theagaraya College', latitude: 13.1042, longitude: 80.2885 },
  { id: 'chen_b9', name: 'Washermanpet', latitude: 13.0975, longitude: 80.2854 },
  { id: 'chen_b10', name: 'Mannadi', latitude: 13.0912, longitude: 80.2862 },
  { id: 'chen_b11', name: 'High Court', latitude: 13.0845, longitude: 80.2875 },
  { id: 'chen_b12', name: 'Puratchi Thalaivar Dr. MGR Central (Chennai Central)', latitude: 13.0827, longitude: 80.2755, isInterchange: true },
  { id: 'chen_b13', name: 'Government Estate', latitude: 13.0695, longitude: 80.2735 },
  { id: 'chen_b14', name: 'LIC (Anna Salai)', latitude: 13.0612, longitude: 80.2665 },
  { id: 'chen_b15', name: 'Thousand Lights', latitude: 13.0545, longitude: 80.2575 },
  { id: 'chen_b16', name: 'AG-DMS (Teynampet)', latitude: 13.0478, longitude: 80.2495 },
  { id: 'chen_b17', name: 'Teynampet', latitude: 13.0402, longitude: 80.2425 },
  { id: 'chen_b18', name: 'Nandanam', latitude: 13.0315, longitude: 80.2352 },
  { id: 'chen_b19', name: 'Saidapet', latitude: 13.0242, longitude: 80.2265 },
  { id: 'chen_b20', name: 'Little Mount', latitude: 13.0165, longitude: 80.2195 },
  { id: 'chen_b21', name: 'Guindy (Railway Station & Race Course)', latitude: 13.0085, longitude: 80.2125, isInterchange: true },
  { id: 'chen_b22', name: 'Arignar Anna Alandur (Mega Interchange with Green Line)', latitude: 13.0040, longitude: 80.2015, isInterchange: true },
  { id: 'chen_b23', name: 'Nanganallur Road', latitude: 12.9925, longitude: 80.1925 },
  { id: 'chen_b24', name: 'Meenambakkam', latitude: 12.9865, longitude: 80.1785 },
  { id: 'chen_b25', name: 'Chennai International Airport (MAA Terminal)', latitude: 12.9812, longitude: 80.1652, isInterchange: true },
];

// Chennai Metro Green Line 2 (Chennai Central <-> St. Thomas Mount via Koyambedu, CMBT, Alandur) - 17 stations
export const CHENNAI_GREEN_STATIONS = [
  { id: 'chen_g1', name: 'Puratchi Thalaivar Dr. MGR Central (Green Line)', latitude: 13.0827, longitude: 80.2755, isInterchange: true },
  { id: 'chen_g2', name: 'Chennai Egmore (Railway Station Terminal)', latitude: 13.0790, longitude: 80.2610, isInterchange: true },
  { id: 'chen_g3', name: 'Nehru Park', latitude: 13.0782, longitude: 80.2495 },
  { id: 'chen_g4', name: 'Kilpauk Medical College', latitude: 13.0789, longitude: 80.2382 },
  { id: 'chen_g5', name: 'Pachaiyappa College', latitude: 13.0775, longitude: 80.2285 },
  { id: 'chen_g6', name: 'Shenoy Nagar', latitude: 13.0771, longitude: 80.2185 },
  { id: 'chen_g7', name: 'Anna Nagar East', latitude: 13.0845, longitude: 80.2165 },
  { id: 'chen_g8', name: 'Anna Nagar Tower', latitude: 13.0862, longitude: 80.2075 },
  { id: 'chen_g9', name: 'Thirumangalam', latitude: 13.0855, longitude: 80.1985 },
  { id: 'chen_g10', name: 'Koyambedu', latitude: 13.0742, longitude: 80.1945 },
  { id: 'chen_g11', name: 'CMBT (Chennai Mofussil Bus Terminus)', latitude: 13.0675, longitude: 80.2045, isInterchange: true },
  { id: 'chen_g12', name: 'Arumbakkam', latitude: 13.0595, longitude: 80.2085 },
  { id: 'chen_g13', name: 'Vadapalani (Forum Vijaya Mall & Film Studios)', latitude: 13.0505, longitude: 80.2125 },
  { id: 'chen_g14', name: 'Ashok Nagar', latitude: 13.0365, longitude: 80.2115 },
  { id: 'chen_g15', name: 'Ekkattuthangal', latitude: 13.0215, longitude: 80.2065 },
  { id: 'chen_g16', name: 'Arignar Anna Alandur (Interchange with Blue Line)', latitude: 13.0040, longitude: 80.2015, isInterchange: true },
  { id: 'chen_g17', name: 'St. Thomas Mount (Terminal / Suburban Rail Interchange)', latitude: 12.9962, longitude: 80.1985, isInterchange: true },
];


// ============================================================================
// JAIPUR METRO (JMRC Pink Line)
// ============================================================================
export const JAIPUR_PINK = '#ec4899';
export const JAIPUR_PINK_STATIONS = [
  { id: 'jai_m1', name: 'Mansarovar', latitude: 26.8624, longitude: 75.7612 },
  { id: 'jai_m2', name: 'New Aatish Market', latitude: 26.8785, longitude: 75.7661 },
  { id: 'jai_m3', name: 'Vivek Vihar', latitude: 26.8872, longitude: 75.7705 },
  { id: 'jai_m4', name: 'Shyam Nagar', latitude: 26.8961, longitude: 75.7738 },
  { id: 'jai_m5', name: 'Ram Nagar', latitude: 26.9042, longitude: 75.7765 },
  { id: 'jai_m6', name: 'Civil Lines', latitude: 26.9102, longitude: 75.7824 },
  { id: 'jai_m7', name: 'Railway Station (Jaipur Junction)', latitude: 26.9198, longitude: 75.7885, isInterchange: true },
  { id: 'jai_m8', name: 'Sindhi Camp (ISBT Inter-state Bus)', latitude: 26.9234, longitude: 75.8012, isInterchange: true },
  { id: 'jai_m9', name: 'Chandpole', latitude: 26.9248, longitude: 75.8115 },
  { id: 'jai_m10', name: 'Chhoti Chaupar', latitude: 26.9255, longitude: 75.8202 },
  { id: 'jai_m11', name: 'Badi Chaupar (City Palace & Hawa Mahal)', latitude: 26.9239, longitude: 75.8267 },
];

// ============================================================================
// PUNE METRO (Maha Metro Line 1 Purple & Line 2 Aqua)
// ============================================================================
export const PUNE_PURPLE = '#7c3aed';
export const PUNE_AQUA = '#06b6d4';
export const PUNE_PURPLE_STATIONS = [
  { id: 'pun_p1', name: 'PCMC Pimpri', latitude: 18.6275, longitude: 73.8012 },
  { id: 'pun_p2', name: 'Bhosari (Nashik Phata)', latitude: 18.6085, longitude: 73.8182 },
  { id: 'pun_p3', name: 'Kasarwadi', latitude: 18.5982, longitude: 73.8245 },
  { id: 'pun_p4', name: 'Dapodi', latitude: 18.5854, longitude: 73.8324 },
  { id: 'pun_p5', name: 'Bopodi', latitude: 18.5721, longitude: 73.8385 },
  { id: 'pun_p6', name: 'Khadki', latitude: 18.5612, longitude: 73.8442 },
  { id: 'pun_p7', name: 'Range Hill', latitude: 18.5442, longitude: 73.8475 },
  { id: 'pun_p8', name: 'Shivajinagar Station', latitude: 18.5314, longitude: 73.8524, isInterchange: true },
  { id: 'pun_p9', name: 'Civil Court Interchange', latitude: 18.5285, longitude: 73.8562, isInterchange: true },
  { id: 'pun_p10', name: 'Kasba Peth (Budhwar Peth)', latitude: 18.5185, longitude: 73.8568 },
  { id: 'pun_p11', name: 'Mandai', latitude: 18.5135, longitude: 73.8569 },
  { id: 'pun_p12', name: 'Swargate Terminal', latitude: 18.5015, longitude: 73.8582, isInterchange: true },
];

export const PUNE_AQUA_STATIONS = [
  { id: 'pun_a1', name: 'Vanaz', latitude: 18.5072, longitude: 73.8052 },
  { id: 'pun_a2', name: 'Anand Nagar', latitude: 18.5085, longitude: 73.8135 },
  { id: 'pun_a3', name: 'Ideal Colony', latitude: 18.5098, longitude: 73.8224 },
  { id: 'pun_a4', name: 'Nal Stop', latitude: 18.5112, longitude: 73.8315 },
  { id: 'pun_a5', name: 'Garware College', latitude: 18.5142, longitude: 73.8389 },
  { id: 'pun_a6', name: 'Deccan Gymkhana', latitude: 18.5182, longitude: 73.8445 },
  { id: 'pun_a7', name: 'PMC (Pune Municipal Corp)', latitude: 18.5245, longitude: 73.8512 },
  { id: 'pun_a8', name: 'Civil Court Interchange', latitude: 18.5285, longitude: 73.8562, isInterchange: true },
  { id: 'pun_a9', name: 'Pune Railway Station', latitude: 18.5289, longitude: 73.8742, isInterchange: true },
  { id: 'pun_a10', name: 'Ruby Hall Clinic', latitude: 18.5332, longitude: 73.8812 },
  { id: 'pun_a11', name: 'Bund Garden', latitude: 18.5385, longitude: 73.8895 },
  { id: 'pun_a12', name: 'Kalyani Nagar', latitude: 18.5482, longitude: 73.9042 },
  { id: 'pun_a13', name: 'Ramwadi', latitude: 18.5524, longitude: 73.9185 },
];

// ============================================================================
// AHMEDABAD METRO (GMRC East-West & North-South Corridors)
// ============================================================================
export const AMD_BLUE = '#2563eb';
export const AMD_RED = '#dc2626';
export const AMD_BLUE_STATIONS = [
  { id: 'amd_b1', name: 'Thaltej Gam', latitude: 23.0532, longitude: 72.5085 },
  { id: 'amd_b2', name: 'Thaltej', latitude: 23.0505, longitude: 72.5175 },
  { id: 'amd_b3', name: 'Doordarshan Kendra', latitude: 23.0485, longitude: 72.5282 },
  { id: 'amd_b4', name: 'Gurukul Road', latitude: 23.0452, longitude: 72.5375 },
  { id: 'amd_b5', name: 'Gujarat University', latitude: 23.0385, longitude: 72.5482 },
  { id: 'amd_b6', name: 'Commerce Six Road', latitude: 23.0365, longitude: 72.5562 },
  { id: 'amd_b7', name: 'SP Stadium', latitude: 23.0392, longitude: 72.5654 },
  { id: 'amd_b8', name: 'Old High Court Interchange', latitude: 23.0345, longitude: 72.5712, isInterchange: true },
  { id: 'amd_b9', name: 'Shahpur', latitude: 23.0312, longitude: 72.5785 },
  { id: 'amd_b10', name: 'Gheekanta (Teen Darwaza / Old City)', latitude: 23.0275, longitude: 72.5842 },
  { id: 'amd_b11', name: 'Kalupur (Ahmedabad Railway Station)', latitude: 23.0235, longitude: 72.6012, isInterchange: true },
  { id: 'amd_b12', name: 'Kankaria East', latitude: 23.0095, longitude: 72.6085 },
  { id: 'amd_b13', name: 'Apparel Park', latitude: 23.0072, longitude: 72.6195 },
  { id: 'amd_b14', name: 'Amraiwadi', latitude: 23.0055, longitude: 72.6285 },
  { id: 'amd_b15', name: 'Rabari Colony', latitude: 23.0035, longitude: 72.6375 },
  { id: 'amd_b16', name: 'Vastral Gam', latitude: 23.0012, longitude: 72.6562 },
];

export const AMD_RED_STATIONS = [
  { id: 'amd_r1', name: 'Motera Stadium (Narendra Modi Stadium)', latitude: 23.0915, longitude: 72.5975 },
  { id: 'amd_r2', name: 'Sabarmati Railway Station', latitude: 23.0785, longitude: 72.5925, isInterchange: true },
  { id: 'amd_r3', name: 'Ranip (BRTS Interchange)', latitude: 23.0682, longitude: 72.5865, isInterchange: true },
  { id: 'amd_r4', name: 'Vadaj', latitude: 23.0565, longitude: 72.5782 },
  { id: 'amd_r5', name: 'Usmanpura', latitude: 23.0475, longitude: 72.5742 },
  { id: 'amd_r6', name: 'Old High Court Interchange', latitude: 23.0345, longitude: 72.5712, isInterchange: true },
  { id: 'amd_r7', name: 'Gandhigram', latitude: 23.0282, longitude: 72.5702 },
  { id: 'amd_r8', name: 'Paldi', latitude: 23.0165, longitude: 72.5685 },
  { id: 'amd_r9', name: 'Shreyas', latitude: 23.0082, longitude: 72.5624 },
  { id: 'amd_r10', name: 'Jivraj Park', latitude: 22.9985, longitude: 72.5482 },
  { id: 'amd_r11', name: 'APMC Vasna', latitude: 22.9912, longitude: 72.5385 },
];

// ============================================================================
// KOCHI METRO (KMRL) & KOCHI WATER METRO
// ============================================================================
export const KOCHI_METRO_COLOR = '#0284c7';
export const KOCHI_WATER_COLOR = '#0d9488';
export const KOCHI_METRO_STATIONS = [
  { id: 'koc_m1', name: 'Aluva', latitude: 10.1098, longitude: 76.3532, isInterchange: true },
  { id: 'koc_m2', name: 'Muttom', latitude: 10.0765, longitude: 76.3312 },
  { id: 'koc_m3', name: 'Kalamassery', latitude: 10.0524, longitude: 76.3195 },
  { id: 'koc_m4', name: 'CUSAT', latitude: 10.0415, longitude: 76.3142 },
  { id: 'koc_m5', name: 'Edapally (Lulu Mall)', latitude: 10.0254, longitude: 76.3082 },
  { id: 'koc_m6', name: 'Palarivattom', latitude: 10.0095, longitude: 76.3052 },
  { id: 'koc_m7', name: 'JLN Stadium', latitude: 9.9985, longitude: 76.3005 },
  { id: 'koc_m8', name: 'Kaloor', latitude: 9.9912, longitude: 76.2942 },
  { id: 'koc_m9', name: 'Lissie', latitude: 9.9865, longitude: 76.2895 },
  { id: 'koc_m10', name: 'MG Road Kochi', latitude: 9.9798, longitude: 76.2842 },
  { id: 'koc_m11', name: 'Maharajas College', latitude: 9.9725, longitude: 76.2845 },
  { id: 'koc_m12', name: 'Ernakulam South (Railway Station)', latitude: 9.9675, longitude: 76.2892, isInterchange: true },
  { id: 'koc_m13', name: 'Kadavanthra', latitude: 9.9654, longitude: 76.2995 },
  { id: 'koc_m14', name: 'Vyttila Mobility Hub', latitude: 9.9672, longitude: 76.3215, isInterchange: true },
  { id: 'koc_m15', name: 'Thykoodam', latitude: 9.9612, longitude: 76.3265 },
  { id: 'koc_m16', name: 'SN Junction (Tripunithura)', latitude: 9.9512, longitude: 76.3452 },
];

export const KOCHI_WATER_METRO_STATIONS = [
  { id: 'koc_wm1', name: 'High Court Water Metro Terminal', latitude: 9.9835, longitude: 76.2742, isInterchange: true },
  { id: 'koc_wm2', name: 'Bolgatty Island Terminal', latitude: 9.9805, longitude: 76.2685 },
  { id: 'koc_wm3', name: 'Vypin Ferry Terminal', latitude: 9.9745, longitude: 76.2482 },
  { id: 'koc_wm4', name: 'Fort Kochi Water Metro Terminal', latitude: 9.9682, longitude: 76.2435 },
  { id: 'koc_wm5', name: 'South Chittoor Terminal', latitude: 10.0385, longitude: 76.2752 },
  { id: 'koc_wm6', name: 'Cheranalloor Terminal', latitude: 10.0482, longitude: 76.2854 },
];

// ============================================================================
// GOA TRANSIT & FERRY HUBS
// ============================================================================
export const GOA_COASTAL_COLOR = '#16a34a';
export const GOA_FERRY_COLOR = '#0284c7';
export const GOA_TRANSIT_STATIONS = [
  { id: 'goa_t1', name: 'Panaji KTC Central Bus Terminal', latitude: 15.4989, longitude: 73.8342, isInterchange: true },
  { id: 'goa_t2', name: 'Panaji Ferry Jetty (Mandovi Riverfront)', latitude: 15.5012, longitude: 73.8285, isInterchange: true },
  { id: 'goa_t3', name: 'Betim Ferry Terminal', latitude: 15.5065, longitude: 73.8262 },
  { id: 'goa_t4', name: 'Mapusa KTC Bus Stand', latitude: 15.5925, longitude: 73.8142 },
  { id: 'goa_t5', name: 'Calangute Beach Circle Hub', latitude: 15.5412, longitude: 73.7554 },
  { id: 'goa_t6', name: 'Candolim Main Road Hub', latitude: 15.5185, longitude: 73.7682 },
  { id: 'goa_t7', name: 'Old Goa Heritage Terminal (Basilica)', latitude: 15.5005, longitude: 73.9115 },
  { id: 'goa_t8', name: 'Madgaon (Margao) KTC Bus Stand', latitude: 15.2842, longitude: 73.9625, isInterchange: true },
  { id: 'goa_t9', name: 'Madgaon Junction Railway Station', latitude: 15.2715, longitude: 73.9724, isInterchange: true },
  { id: 'goa_t10', name: 'Vasco da Gama KTC Bus Stand', latitude: 15.3985, longitude: 73.8142 },
  { id: 'goa_t11', name: 'Dabolim Airport Terminal', latitude: 15.3805, longitude: 73.8315 },
  { id: 'goa_t12', name: 'Mopa (Manohar) Airport GOX', latitude: 15.7512, longitude: 73.8685 },
];

// ============================================================================
// VARANASI URBAN TRANSIT & GHAT WATERWAYS
// ============================================================================
export const VARANASI_BUS_COLOR = '#ea580c';
export const VARANASI_BOAT_COLOR = '#0284c7';
export const VARANASI_TRANSIT_STATIONS = [
  { id: 'vns_t1', name: 'Varanasi Cantt (Varanasi Jn) Railway Station', latitude: 25.3282, longitude: 82.9865, isInterchange: true },
  { id: 'vns_t2', name: 'Godowlia Chowk Transit Hub', latitude: 25.3105, longitude: 83.0072, isInterchange: true },
  { id: 'vns_t3', name: 'Kashi Vishwanath Ganga Corridor Gate', latitude: 25.3112, longitude: 83.0115 },
  { id: 'vns_t4', name: 'Dashashwamedh Ghat Terminal', latitude: 25.3075, longitude: 83.0102 },
  { id: 'vns_t5', name: 'Assi Ghat Terminal (Subah-e-Banaras)', latitude: 25.2902, longitude: 83.0065 },
  { id: 'vns_t6', name: 'BHU Lanka Gate (Sir Sunderlal Hospital / VT)', latitude: 25.2795, longitude: 82.9995 },
  { id: 'vns_t7', name: 'Banaras (Manduadih) Railway Station', latitude: 25.2985, longitude: 82.9662, isInterchange: true },
  { id: 'vns_t8', name: 'Sarnath Heritage Terminal (Dhamek Stupa)', latitude: 25.3812, longitude: 83.0235 },
  { id: 'vns_t9', name: 'Namo Ghat Ro-Pax Ferry Terminal', latitude: 25.3342, longitude: 83.0375 },
  { id: 'vns_t10', name: 'Lal Bahadur Shastri Airport Babatpur', latitude: 25.4525, longitude: 82.8595 },
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
    autoFareQuoteWarning: 'Auto drivers often quote ₹150 from Majestic. Use the meter: ₹36 for the first 2 km, then ₹18/km (Aug 2025 tariff).',
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
    autoFareQuoteWarning: 'Use the meter: ₹36 for the first 2 km, then ₹18/km (Aug 2025 tariff).',
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
    autoFareQuoteWarning: 'Use the meter: ₹36 for the first 2 km, then ₹18/km (Aug 2025 tariff).',
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
    autoFareQuoteWarning: 'Use the meter: ₹36 for the first 2 km, then ₹18/km (Aug 2025 tariff).',
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
    case 'kolkata_blue': return KOLKATA_BLUE;
    case 'kolkata_green': return KOLKATA_GREEN;
    case 'hyd_red': return HYD_RED;
    case 'hyd_blue': return HYD_BLUE;
    case 'hyd_green': return HYD_GREEN;
    case 'chennai_blue': return CHENNAI_BLUE;
    case 'chennai_green': return CHENNAI_GREEN;
    case 'jaipur_pink': return JAIPUR_PINK;
    case 'pune_purple': return PUNE_PURPLE;
    case 'pune_aqua': return PUNE_AQUA;
    case 'amd_blue': return AMD_BLUE;
    case 'amd_red': return AMD_RED;
    case 'kochi_metro': return KOCHI_METRO_COLOR;
    case 'kochi_water': return KOCHI_WATER_COLOR;
    case 'goa_coastal': return GOA_COASTAL_COLOR;
    case 'goa_ferry': return GOA_FERRY_COLOR;
    case 'vns_bus': return VARANASI_BUS_COLOR;
    case 'vns_boat': return VARANASI_BOAT_COLOR;
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
    case 'kolkata_blue': return 'Blue Line 1 (Dakshineswar - Kavi Subhash)';
    case 'kolkata_green': return 'Green Line 2 (Underwater Howrah - Sector V)';
    case 'hyd_red': return 'Red Line 1 (Miyapur – LB Nagar)';
    case 'hyd_blue': return 'Blue Line 2 (Nagole – Raidurg/Hitec City)';
    case 'chennai_blue': return 'Blue Line 1 (Wimco Nagar – Chennai Airport)';
    case 'chennai_green': return 'Green Line 2 (Chennai Central – St. Thomas Mount)';
    case 'jaipur_pink': return 'Pink Line (JMRC)';
    case 'pune_purple': return 'Purple Line (Maha Metro)';
    case 'pune_aqua': return 'Aqua Line (Maha Metro)';
    case 'amd_blue': return 'Blue Line (GMRC)';
    case 'amd_red': return 'Red Line (GMRC)';
    case 'kochi_metro': return 'Kochi Metro (KMRL)';
    case 'kochi_water': return 'Kochi Water Metro';
    case 'goa_coastal': return 'Kadamba Coastal Transit';
    case 'goa_ferry': return 'Mandovi River Ferry';
    case 'vns_bus': return 'Kashi Smart City E-Bus';
    case 'vns_boat': return 'Ganga Ghat Waterway';
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
    case 'kolkata_blue': return KOLKATA_BLUE_STATIONS;
    case 'kolkata_green': return KOLKATA_GREEN_STATIONS;
    case 'hyd_red': return HYD_RED_STATIONS;
    case 'hyd_blue': return HYD_BLUE_STATIONS;
    case 'chennai_blue': return CHENNAI_BLUE_STATIONS;
    case 'chennai_green': return CHENNAI_GREEN_STATIONS;
    case 'jaipur_pink': return JAIPUR_PINK_STATIONS;
    case 'pune_purple': return PUNE_PURPLE_STATIONS;
    case 'pune_aqua': return PUNE_AQUA_STATIONS;
    case 'amd_blue': return AMD_BLUE_STATIONS;
    case 'amd_red': return AMD_RED_STATIONS;
    case 'kochi_metro': return KOCHI_METRO_STATIONS;
    case 'kochi_water': return KOCHI_WATER_METRO_STATIONS;
    case 'goa_coastal': return GOA_TRANSIT_STATIONS;
    case 'vns_bus': return VARANASI_TRANSIT_STATIONS;
    default: return PURPLE_STATIONS;
  }
}

/**
 * Detects city from coordinate latitude and longitude
 */
export function detectCityFromCoord(lat, lon) {
  if (lat == null || lon == null) return 'bengaluru';
  const centers = [
    { id: 'bengaluru', lat: 12.9716, lon: 77.5946 },
    { id: 'delhi', lat: 28.6139, lon: 77.2090 },
    { id: 'mumbai', lat: 18.9220, lon: 72.8347 },
    { id: 'kolkata', lat: 22.5726, lon: 88.3639 },
    { id: 'hyderabad', lat: 17.3850, lon: 78.4867 },
    { id: 'chennai', lat: 13.0827, lon: 80.2707 },
    { id: 'jaipur', lat: 26.9124, lon: 75.7873 },
    { id: 'pune', lat: 18.5204, lon: 73.8567 },
    { id: 'ahmedabad', lat: 23.0225, lon: 72.5714 },
    { id: 'kochi', lat: 9.9312, lon: 76.2673 },
    { id: 'goa', lat: 15.2993, lon: 74.1240 },
    { id: 'varanasi', lat: 25.3176, lon: 82.9739 },
  ];
  let closest = 'bengaluru';
  let minD2 = Infinity;
  for (const c of centers) {
    const d2 = (lat - c.lat) ** 2 + (lon - c.lon) ** 2;
    if (d2 < minD2) {
      minD2 = d2;
      closest = c.id;
    }
  }
  return closest;
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
  const isKolkata = cityId === 'kolkata' || line.startsWith('kolkata');
  const isHyderabad = cityId === 'hyderabad' || line.startsWith('hyd');
  const isChennai = cityId === 'chennai' || line.startsWith('chennai');

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
  } else if (isKolkata) {
    // Kolkata Metro: 06:50 AM to 22:45 PM
    opensAt = '06:50 AM';
    closesAt = '22:45 PM';
    isOperating = (hour > 6 || (hour === 6 && minute >= 50)) && (hour < 22 || (hour === 22 && minute <= 45));
  } else if (isHyderabad) {
    // Hyderabad Metro: 06:00 AM to 23:00 PM
    opensAt = '06:00 AM';
    closesAt = '23:00 PM';
    isOperating = (hour > 6 || (hour === 6 && minute >= 0)) && (hour < 23 || (hour === 23 && minute === 0));
  } else if (isChennai) {
    // Chennai Metro: 05:00 AM to 23:00 PM
    opensAt = '05:00 AM';
    closesAt = '23:00 PM';
    isOperating = (hour > 5 || (hour === 5 && minute >= 0)) && (hour < 23 || (hour === 23 && minute === 0));
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
  let frequencyLabel = 'Every 8 mins';

  if (isDelhi) {
    if ((hour >= 8 && hour < 11) || (hour >= 17 && hour < 21)) {
      frequency = 3;
      frequencyLabel = 'Peak rush: every 3 mins (DMRC Express)';
    } else if (hour < 7 || hour >= 22) {
      frequency = 8;
      frequencyLabel = 'Late evening: every 8 mins';
    } else {
      frequency = 5;
      frequencyLabel = 'Every 5 mins';
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
      frequencyLabel = 'Every 6 mins';
    }
  } else if (isKolkata) {
    if ((hour >= 9 && hour < 12) || (hour >= 17 && hour < 20)) {
      frequency = 5;
      frequencyLabel = 'Peak rush: every 5 mins (Metro Express)';
    } else if (hour < 8 || hour >= 21) {
      frequency = 10;
      frequencyLabel = 'Late evening: every 10 mins';
    } else {
      frequency = 7;
      frequencyLabel = 'Every 7 mins';
    }
  } else if (isHyderabad) {
    if ((hour >= 8 && hour < 11) || (hour >= 17 && hour < 20)) {
      frequency = 4;
      frequencyLabel = 'Peak rush: every 4 mins';
    } else if (hour < 7 || hour >= 22) {
      frequency = 10;
      frequencyLabel = 'Late evening: every 10 mins';
    } else {
      frequency = 7;
      frequencyLabel = 'Every 7 mins';
    }
  } else if (isChennai) {
    if ((hour >= 8 && hour < 11) || (hour >= 17 && hour < 20)) {
      frequency = 5;
      frequencyLabel = 'Peak rush: every 5 mins';
    } else if (hour < 7 || hour >= 22) {
      frequency = 10;
      frequencyLabel = 'Late evening: every 10 mins';
    } else {
      frequency = 7;
      frequencyLabel = 'Every 7 mins';
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
  for (let i = 0; i < 8; i++) {
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
  if (cityId === 'jaipur') {
    if (stopCount <= 2) return 6;
    if (stopCount <= 5) return 12;
    if (stopCount <= 8) return 18;
    return 22;
  }
  if (cityId === 'pune') {
    if (stopCount <= 3) return 10;
    if (stopCount <= 6) return 15;
    if (stopCount <= 10) return 20;
    if (stopCount <= 14) return 25;
    return 30;
  }
  if (cityId === 'ahmedabad') {
    if (stopCount <= 3) return 5;
    if (stopCount <= 7) return 10;
    if (stopCount <= 12) return 15;
    return 20;
  }
  if (cityId === 'kochi') {
    if (stopCount <= 2) return 10;
    if (stopCount <= 5) return 20;
    if (stopCount <= 9) return 30;
    if (stopCount <= 14) return 40;
    return 50;
  }
  if (cityId === 'goa') {
    if (stopCount <= 3) return 10;
    if (stopCount <= 6) return 15;
    if (stopCount <= 10) return 25;
    return 35;
  }
  if (cityId === 'varanasi') {
    if (stopCount <= 3) return 10;
    if (stopCount <= 6) return 15;
    if (stopCount <= 10) return 20;
    return 25;
  }
  if (cityId === 'hyderabad') {
    if (stopCount <= 2) return 10;
    if (stopCount <= 4) return 15;
    if (stopCount <= 7) return 25;
    if (stopCount <= 12) return 35;
    if (stopCount <= 18) return 45;
    return 55;
  }
  if (cityId === 'chennai') {
    if (stopCount <= 2) return 10;
    if (stopCount <= 5) return 20;
    if (stopCount <= 9) return 30;
    if (stopCount <= 15) return 40;
    return 50;
  }
  if (cityId === 'kolkata') {
    if (stopCount <= 2) return 5;
    if (stopCount <= 5) return 10;
    if (stopCount <= 10) return 15;
    if (stopCount <= 20) return 20;
    return 25;
  }
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

    if (city === 'jaipur') {
    for (const st of JAIPUR_PINK_STATIONS) {
      const d = getDistanceBetween(lat, lon, st.latitude, st.longitude);
      if (d < minDistance) {
        minDistance = d;
        best = { ...st, line: 'jaipur_pink', city: 'jaipur', distanceMeters: Math.round(d) };
      }
    }
  } else if (city === 'pune') {
    for (const st of PUNE_PURPLE_STATIONS) {
      const d = getDistanceBetween(lat, lon, st.latitude, st.longitude);
      if (d < minDistance) {
        minDistance = d;
        best = { ...st, line: 'pune_purple', city: 'pune', distanceMeters: Math.round(d) };
      }
    }
    for (const st of PUNE_AQUA_STATIONS) {
      const d = getDistanceBetween(lat, lon, st.latitude, st.longitude);
      if (d < minDistance) {
        minDistance = d;
        best = { ...st, line: 'pune_aqua', city: 'pune', distanceMeters: Math.round(d) };
      }
    }
  } else if (city === 'ahmedabad') {
    for (const st of AMD_BLUE_STATIONS) {
      const d = getDistanceBetween(lat, lon, st.latitude, st.longitude);
      if (d < minDistance) {
        minDistance = d;
        best = { ...st, line: 'amd_blue', city: 'ahmedabad', distanceMeters: Math.round(d) };
      }
    }
    for (const st of AMD_RED_STATIONS) {
      const d = getDistanceBetween(lat, lon, st.latitude, st.longitude);
      if (d < minDistance) {
        minDistance = d;
        best = { ...st, line: 'amd_red', city: 'ahmedabad', distanceMeters: Math.round(d) };
      }
    }
  } else if (city === 'kochi') {
    for (const st of KOCHI_METRO_STATIONS) {
      const d = getDistanceBetween(lat, lon, st.latitude, st.longitude);
      if (d < minDistance) {
        minDistance = d;
        best = { ...st, line: 'kochi_metro', city: 'kochi', distanceMeters: Math.round(d) };
      }
    }
    for (const st of KOCHI_WATER_METRO_STATIONS) {
      const d = getDistanceBetween(lat, lon, st.latitude, st.longitude);
      if (d < minDistance) {
        minDistance = d;
        best = { ...st, line: 'kochi_water', city: 'kochi', distanceMeters: Math.round(d) };
      }
    }
  } else if (city === 'goa') {
    for (const st of GOA_TRANSIT_STATIONS) {
      const d = getDistanceBetween(lat, lon, st.latitude, st.longitude);
      if (d < minDistance) {
        minDistance = d;
        best = { ...st, line: 'goa_coastal', city: 'goa', distanceMeters: Math.round(d) };
      }
    }
  } else if (city === 'varanasi') {
    for (const st of VARANASI_TRANSIT_STATIONS) {
      const d = getDistanceBetween(lat, lon, st.latitude, st.longitude);
      if (d < minDistance) {
        minDistance = d;
        best = { ...st, line: 'vns_bus', city: 'varanasi', distanceMeters: Math.round(d) };
      }
    }
  } else if (city === 'hyderabad') {
    for (const st of HYD_RED_STATIONS) {
      const d = getDistanceBetween(lat, lon, st.latitude, st.longitude);
      if (d < minDistance) {
        minDistance = d;
        best = { ...st, line: 'hyd_red', city: 'hyderabad', distanceMeters: Math.round(d) };
      }
    }
    for (const st of HYD_BLUE_STATIONS) {
      const d = getDistanceBetween(lat, lon, st.latitude, st.longitude);
      if (d < minDistance) {
        minDistance = d;
        best = { ...st, line: 'hyd_blue', city: 'hyderabad', distanceMeters: Math.round(d) };
      }
    }
  } else if (city === 'chennai') {
    for (const st of CHENNAI_BLUE_STATIONS) {
      const d = getDistanceBetween(lat, lon, st.latitude, st.longitude);
      if (d < minDistance) {
        minDistance = d;
        best = { ...st, line: 'chennai_blue', city: 'chennai', distanceMeters: Math.round(d) };
      }
    }
    for (const st of CHENNAI_GREEN_STATIONS) {
      const d = getDistanceBetween(lat, lon, st.latitude, st.longitude);
      if (d < minDistance) {
        minDistance = d;
        best = { ...st, line: 'chennai_green', city: 'chennai', distanceMeters: Math.round(d) };
      }
    }
  } else if (city === 'kolkata') {
    for (const st of KOLKATA_BLUE_STATIONS) {
      const d = getDistanceBetween(lat, lon, st.latitude, st.longitude);
      if (d < minDistance) {
        minDistance = d;
        best = { ...st, line: 'kolkata_blue', city: 'kolkata', distanceMeters: Math.round(d) };
      }
    }
    for (const st of KOLKATA_GREEN_STATIONS) {
      const d = getDistanceBetween(lat, lon, st.latitude, st.longitude);
      if (d < minDistance) {
        minDistance = d;
        best = { ...st, line: 'kolkata_green', city: 'kolkata', distanceMeters: Math.round(d) };
      }
    }
  } else if (city === 'delhi') {
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
 * Returns exact transfer instructions at Esplanade Interchange (Kolkata)
 */
export function getEsplanadeInterchangeGuide(fromLine, toLine) {
  if (fromLine === toLine) return null;
  if (fromLine === 'kolkata_blue' && toLine === 'kolkata_green') {
    return {
      title: 'Interchange at Esplanade (Blue Line ⇄ Green Line)',
      steps: [
        'Step off Blue Line (North-South) train at Esplanade Island Platform',
        'Follow GREEN Line underwater metro overhead arrows down to the subterranean interchange concourse',
        'Descend via escalators to Green Line platforms (towards Howrah / Salt Lake Sector V)',
        'Platform 1 heads West under Hooghly river to Mahakaran & Howrah Railway Station',
        'Platform 2 heads East towards Sealdah Railway Station & Salt Lake Sector V',
        'Allow 3 minutes walking time inside the paid concourse',
      ],
      tip: 'Do NOT exit through token gates! Transfers between Blue & Green lines are within the paid concourse.',
    };
  }
  return {
    title: 'Interchange at Esplanade (Green Line ⇄ Blue Line)',
    steps: [
      'Step off Green Line train at Esplanade East-West platform level',
      'Follow BLUE LINE directional signage towards North-South concourse escalators',
      'Take escalators up to Blue Line platforms',
      'Platform 1 heads North to Dum Dum & Dakshineswar; Platform 2 heads South to Kalighat & Kavi Subhash',
      'Allow 3 minutes transfer time',
    ],
    tip: 'Keep your smart card or paper QR ticket for exit scanning at your final destination.',
  };
}

/**
 * Returns exact transfer instructions at Ameerpet Interchange (Hyderabad)
 */
export function getAmeerpetInterchangeGuide(fromLine, toLine) {
  if (fromLine === toLine) return null;
  if (fromLine === 'hyd_red' && toLine === 'hyd_blue') {
    return {
      title: 'Interchange at Ameerpet (Red Line ⇄ Blue Line)',
      steps: [
        'Step off Red Line (Miyapur – LB Nagar) at Level 1 concourse platform',
        'Follow BLUE LINE overhead wayfinding signs towards escalators up to Level 2',
        'Take connecting escalators to Blue Line platforms',
        'Platform 3 heads West to Hitec City Cyber Towers & Raidurg Terminal',
        'Platform 4 heads East to Secunderabad Railway Station & Nagole Terminal',
        'Allow 2 minutes transfer time inside the station',
      ],
      tip: 'Do NOT tap out at gates! Transfers between Red and Blue lines are on the same multi-level elevated concourse.',
    };
  }
  return {
    title: 'Interchange at Ameerpet (Blue Line ⇄ Red Line)',
    steps: [
      'Step off Blue Line (Nagole – Raidurg) at Level 2 platform',
      'Follow RED LINE directional signs towards central escalators descending to Level 1',
      'Platform 1 heads North to Kukatpally & Miyapur Terminal',
      'Platform 2 heads South to Khairatabad, MGBS & LB Nagar',
      'Allow 2 minutes walking time',
    ],
    tip: 'Keep your QR or token active for final exit scanning at destination.',
  };
}

/**
 * Returns exact transfer instructions at Chennai Central / Alandur Interchange (Chennai)
 */
export function getChennaiCentralInterchangeGuide(fromLine, toLine) {
  if (fromLine === toLine) return null;
  if (fromLine === 'chennai_blue' && toLine === 'chennai_green') {
    return {
      title: 'Interchange at Chennai Central / Alandur (Blue Line ⇄ Green Line)',
      steps: [
        'Step off Blue Line train at interchange platform',
        'Follow GREEN LINE signs towards Koyambedu / Egmore concourse walkways',
        'Take connecting escalators to Green Line platforms',
        'Trains head towards Chennai Egmore, Koyambedu CMBT & St. Thomas Mount',
        'Allow 3 minutes walking time',
      ],
      tip: 'Stay inside paid concourse; transfers are free across lines.',
    };
  }
  return {
    title: 'Interchange at Chennai Central / Alandur (Green Line ⇄ Blue Line)',
    steps: [
      'Step off Green Line train at interchange platform',
      'Follow BLUE LINE airport corridor signs to the Blue Line platform',
      'Platform heads South to Guindy & Chennai International Airport (MAA), or North to Washermanpet & Wimco Nagar',
      'Allow 3 minutes transfer time',
    ],
    tip: 'Direct Blue Line trains connect to Airport terminals in under 35 minutes.',
  };
}

/**
 * General multi-city interchange guide router
 */
export function getInterchangeGuide(cityId, fromLine, toLine) {
  if (cityId === 'hyderabad' || fromLine?.startsWith('hyd') || toLine?.startsWith('hyd')) {
    return getAmeerpetInterchangeGuide(fromLine, toLine);
  }
  if (cityId === 'chennai' || fromLine?.startsWith('chennai') || toLine?.startsWith('chennai')) {
    return getChennaiCentralInterchangeGuide(fromLine, toLine);
  }
  if (cityId === 'kolkata' || fromLine?.startsWith('kolkata') || toLine?.startsWith('kolkata')) {
    return getEsplanadeInterchangeGuide(fromLine, toLine);
  }
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
  // Kolkata Key Stations
  kol_g2: {
    stationName: 'Howrah Railway Station (Metro)',
    gates: [
      { id: 'Gate 1', name: 'Old Complex Platforms 1–15', exitFor: 'Direct subway into Howrah Old Station concourse & cloakroom' },
      { id: 'Gate 2', name: 'New Complex Platforms 17–23', exitFor: 'South Eastern Railway trains & Yatri Sathi / Prepaid Taxi' },
      { id: 'Gate 3', name: 'Howrah Ferry Ghat Exit', exitFor: 'Direct riverwalk to Hooghly Ferry Ghat (to Fairlie Place / Babughat)' },
    ],
    defaultExit: 'Gate 1',
  },
  kol_b12: {
    stationName: 'Esplanade (Metro Interchange)',
    gates: [
      { id: 'Gate 1', name: 'JL Nehru Road / New Market', exitFor: 'New Market, Hogg Market, Grand Hotel & Curzon Park' },
      { id: 'Gate 2', name: 'Dharmatala / Tram Terminus', exitFor: 'Esplanade Tram Terminus, CTC Bus Stand & Rani Rashmoni Ave' },
      { id: 'Gate 3', name: 'Green Line Subterranean Link', exitFor: 'Underground interchange to Green Line (Howrah / Sector V)' },
    ],
    defaultExit: 'Gate 1',
  },
  kol_g5: {
    stationName: 'Sealdah Railway Station (Metro)',
    gates: [
      { id: 'Gate 1', name: 'Sealdah Main & North Concourse', exitFor: 'Direct footbridge into Sealdah Main Train Platforms 1–14' },
      { id: 'Gate 2', name: 'Sealdah South & Koley Market', exitFor: 'South section local trains, Beliaghata Road & auto stand' },
    ],
    defaultExit: 'Gate 1',
  },
  kol_b13: {
    stationName: 'Park Street',
    gates: [
      { id: 'Gate 1', name: 'Park Street & Allen Park', exitFor: 'Peter Cat, Mocambo, Flurys, Stephen Court & nightlife' },
      { id: 'Gate 2', name: 'Asiatic Society / Park Hotel', exitFor: 'Asiatic Society museum, Park Hotel, Camac Street link' },
    ],
    defaultExit: 'Gate 1',
  },
  kol_g12: {
    stationName: 'Salt Lake Sector V',
    gates: [
      { id: 'Gate 1', name: 'College More & Wipro Junction', exitFor: 'Tech parks, IT companies, College More food street' },
      { id: 'Gate 2', name: 'Sector V Ring Road', exitFor: 'Technopolis, Ring Road feeder buses & shared autos' },
    ],
    defaultExit: 'Gate 1',
  },
  // Hyderabad Key Stations
  hyd_r11: {
    stationName: 'Ameerpet (Red & Blue Mega Interchange)',
    gates: [
      { id: 'Gate A', name: 'NH 65 Punjagutta Side', exitFor: 'Ameerpet Commercial Hub & coaching centres' },
      { id: 'Gate B', name: 'Begumpet Link Road', exitFor: 'Blue line escalator access & Sarathi Studios' },
      { id: 'Gate C', name: 'Maitrivanam / SR Nagar Link', exitFor: 'Maitrivanam IT Complex & auto stand' },
    ],
    defaultExit: 'Gate A',
  },
  hyd_b8: {
    stationName: 'Secunderabad East',
    gates: [
      { id: 'Gate 1', name: 'Secunderabad Railway Terminal Link', exitFor: 'Direct skywalk to Secunderabad Junction Railway Station' },
      { id: 'Gate 2', name: 'St. Ann’s & Clock Tower', exitFor: 'Secunderabad Clock Tower, market & bus terminus' },
    ],
    defaultExit: 'Gate 1',
  },
  hyd_b22: {
    stationName: 'Hitec City (Cyber Towers)',
    gates: [
      { id: 'Gate 1', name: 'Cyber Towers Junction', exitFor: 'Cyber Towers, Shilparamam Crafts Village & Mindspace link' },
      { id: 'Gate 2', name: 'Madhapur Road', exitFor: 'Ascendas IT Park, hotels & corporate bus bay' },
    ],
    defaultExit: 'Gate 1',
  },
  hyd_r20: {
    stationName: 'MGBS (Mahatma Gandhi Bus Station)',
    gates: [
      { id: 'Gate 1', name: 'Interstate Bus Terminal Concourse', exitFor: 'Direct walkway into MGBS central bus platforms' },
      { id: 'Gate 2', name: 'Chaderghat & Musi Riverfront', exitFor: 'Old City link, Salar Jung Museum & auto stand' },
    ],
    defaultExit: 'Gate 1',
  },
  // Chennai Key Stations
  chen_b12: {
    stationName: 'Puratchi Thalaivar Dr. MGR Central',
    gates: [
      { id: 'Gate 1', name: 'Central Railway Station Concourse', exitFor: 'Direct underground walkway to Chennai Central Platforms 1–15' },
      { id: 'Gate 2', name: 'Park Town & Evening Bazaar', exitFor: 'Chennai Park Suburban Station & Moore Market Complex' },
      { id: 'Gate 3', name: 'Poonamallee High Road Side', exitFor: 'General Hospital, Ripon Building & City Bus Stand' },
    ],
    defaultExit: 'Gate 1',
  },
  chen_b25: {
    stationName: 'Chennai International Airport (MAA)',
    gates: [
      { id: 'Gate 1', name: 'Terminal 1 & 2 Arrivals Link', exitFor: 'Air-conditioned skywalk into Airport Domestic & International Terminals' },
      { id: 'Gate 2', name: 'Airport Metro Walkway & Cabs', exitFor: 'App cab pickup zones, airport parking & GST Road' },
    ],
    defaultExit: 'Gate 1',
  },
  chen_b22: {
    stationName: 'Arignar Anna Alandur (Interchange)',
    gates: [
      { id: 'Gate 1', name: 'GST Road Concourse', exitFor: 'Grand Southern Trunk Road, Kathipara Flyover junction' },
      { id: 'Gate 2', name: 'Asarhana Side', exitFor: 'Alandur market, St. Thomas Mount links' },
    ],
    defaultExit: 'Gate 1',
  },
  chen_g2: {
    stationName: 'Chennai Egmore (Metro)',
    gates: [
      { id: 'Gate 1', name: 'Egmore Railway Station Entrance', exitFor: 'Direct skywalk to Chennai Egmore Train Platforms 1–11' },
      { id: 'Gate 2', name: 'Gandhi Irwin Road', exitFor: 'Government Museum, Egmore bus stand & auto stand' },
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
  } else if (line === 'kolkata_blue') {
    if (toIdx > fromIdx) {
      platformNum = 2;
      towardsHeadsign = 'Towards Kavi Subhash / Garia (Southbound)';
    } else {
      platformNum = 1;
      towardsHeadsign = 'Towards Dakshineswar / Dum Dum (Northbound)';
    }
  } else if (line === 'kolkata_green') {
    if (toIdx > fromIdx) {
      platformNum = 2;
      towardsHeadsign = 'Towards Salt Lake Sector V (Eastbound)';
    } else {
      platformNum = 1;
      towardsHeadsign = 'Towards Howrah Maidan / Underwater (Westbound)';
    }
  } else if (line === 'hyd_red') {
    if (toIdx > fromIdx) {
      platformNum = 2;
      towardsHeadsign = 'Towards LB Nagar (Southbound)';
    } else {
      platformNum = 1;
      towardsHeadsign = 'Towards Miyapur Terminal (Northbound)';
    }
  } else if (line === 'hyd_blue') {
    if (toIdx > fromIdx) {
      platformNum = 2;
      towardsHeadsign = 'Towards Hitec City / Raidurg (Westbound)';
    } else {
      platformNum = 1;
      towardsHeadsign = 'Towards Secunderabad / Nagole (Eastbound)';
    }
  } else if (line === 'chennai_blue') {
    if (toIdx > fromIdx) {
      platformNum = 2;
      towardsHeadsign = 'Towards Chennai Airport / Guindy (Southbound)';
    } else {
      platformNum = 1;
      towardsHeadsign = 'Towards Wimco Nagar / Central (Northbound)';
    }
  } else if (line === 'chennai_green') {
    if (toIdx > fromIdx) {
      platformNum = 2;
      towardsHeadsign = 'Towards St. Thomas Mount / Alandur (Westbound)';
    } else {
      platformNum = 1;
      towardsHeadsign = 'Towards Chennai Central / Egmore (Eastbound)';
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
