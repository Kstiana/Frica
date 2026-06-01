/**
 * ================================================================
 * FRICA — SEARCH.JS
 * assets/js/search.js
 * Version: 1.0
 *
 * Full client-side search engine for Frica.
 * Searches across countries, food, festivals, music, languages,
 * proverbs, traditions, and cultural terms.
 *
 * Table of Contents:
 * 01. Search Index Data
 * 02. Relevance Scoring Engine
 * 03. Search Index Builder
 * 04. Search Engine Core
 * 05. Result Renderer
 * 06. Autocomplete / Suggestions
 * 07. Search History Manager
 * 08. Search UI Controller
 * 09. Hero Search Bar
 * 10. Inline Page Search (countries.html filter)
 * 11. Keyboard Navigation
 * 12. Init
 * ================================================================
 */

'use strict';

/* ================================================================
   01. SEARCH INDEX DATA
   All searchable content across Frica.
   Each item has: type, title, subtitle, tags, country, url, emoji
================================================================ */

const SEARCH_INDEX = [

  /* ── COUNTRIES ──────────────────────────────────────────────── */
  { type:'country', emoji:'🇳🇬', title:'Nigeria',              subtitle:'West Africa · Capital: Abuja',             url:'pages/country/nigeria.html',              tags:['afrobeats','nollywood','jollof','yoruba','igbo','hausa','lagos','giant of africa','220 million'] },
  { type:'country', emoji:'🇬🇭', title:'Ghana',                subtitle:'West Africa · Capital: Accra',             url:'pages/country/ghana.html',                tags:['kente','highlife','ashanti','akwaaba','detty december','independence 1957','sankofa','cape coast'] },
  { type:'country', emoji:'🇰🇪', title:'Kenya',                subtitle:'East Africa · Capital: Nairobi',           url:'pages/country/kenya.html',                tags:['maasai','great migration','safari','nairobi','swahili','benga music'] },
  { type:'country', emoji:'🇿🇦', title:'South Africa',         subtitle:'Southern Africa · Capital: Pretoria',      url:'pages/country/south-africa.html',         tags:['amapiano','mandela','ubuntu','zulu','cape town','rainbow nation','kruger'] },
  { type:'country', emoji:'🇪🇬', title:'Egypt',                subtitle:'North Africa · Capital: Cairo',            url:'pages/country/egypt.html',                tags:['pyramids','giza','nile','pharaohs','cairo','ancient civilization','hieroglyphics'] },
  { type:'country', emoji:'🇪🇹', title:'Ethiopia',             subtitle:'East Africa · Capital: Addis Ababa',       url:'pages/country/ethiopia.html',             tags:['coffee','never colonized','lalibela','injera','rastafari','lucy fossil','simien mountains'] },
  { type:'country', emoji:'🇹🇿', title:'Tanzania',             subtitle:'East Africa · Capital: Dodoma',            url:'pages/country/tanzania.html',             tags:['kilimanjaro','serengeti','zanzibar','stone town','taarab','great migration'] },
  { type:'country', emoji:'🇲🇦', title:'Morocco',              subtitle:'North Africa · Capital: Rabat',            url:'pages/country/morocco.html',              tags:['marrakech','sahara','berber','tagine','gnawa','fes','medina','souk'] },
  { type:'country', emoji:'🇸🇳', title:'Senegal',              subtitle:'West Africa · Capital: Dakar',             url:'pages/country/senegal.html',              tags:['mbalax','teranga','gorée island','youssou ndour','thiéboudienne','dakar'] },
  { type:'country', emoji:'🇺🇬', title:'Uganda',               subtitle:'East Africa · Capital: Kampala',           url:'pages/country/uganda.html',               tags:['pearl of africa','nile','gorillas','buganda','matooke'] },
  { type:'country', emoji:'🇷🇼', title:'Rwanda',               subtitle:'East Africa · Capital: Kigali',            url:'pages/country/rwanda.html',               tags:['mountain gorillas','thousand hills','imigongo','umuganda','cleanest city'] },
  { type:'country', emoji:'🇲🇱', title:'Mali',                 subtitle:'West Africa · Capital: Bamako',            url:'pages/country/mali.html',                 tags:['timbuktu','mansa musa','griot','mali empire','djenné','kora','blues roots'] },
  { type:'country', emoji:'🇩🇿', title:'Algeria',              subtitle:'North Africa · Capital: Algiers',          url:'pages/country/algeria.html',              tags:['sahara','tassili','rai music','largest country africa','berber casbah'] },
  { type:'country', emoji:'🇸🇩', title:'Sudan',                subtitle:'North Africa · Capital: Khartoum',         url:'pages/country/sudan.html',                tags:['nubian pyramids','meroe','kush','more pyramids than egypt','sufi dervishes'] },
  { type:'country', emoji:'🇧🇼', title:'Botswana',             subtitle:'Southern Africa · Capital: Gaborone',      url:'pages/country/botswana.html',             tags:['okavango delta','kalahari','san bushmen','diamonds','chobe elephants'] },
  { type:'country', emoji:'🇳🇦', title:'Namibia',              subtitle:'Southern Africa · Capital: Windhoek',      url:'pages/country/namibia.html',              tags:['namib desert','sossusvlei','himba','skeleton coast','oldest desert'] },
  { type:'country', emoji:'🇹🇳', title:'Tunisia',              subtitle:'North Africa · Capital: Tunis',            url:'pages/country/tunisia.html',              tags:['carthage','el djem','medina tunis','harissa','maluf music'] },
  { type:'country', emoji:'🇲🇿', title:'Mozambique',           subtitle:'East Africa · Capital: Maputo',            url:'pages/country/mozambique.html',           tags:['bazaruto','makonde','marrabenta','peri peri','indian ocean'] },
  { type:'country', emoji:'🇿🇲', title:'Zambia',               subtitle:'Southern Africa · Capital: Lusaka',        url:'pages/country/zambia.html',               tags:['victoria falls','kuomboka','zamrock','bemba','kafue'] },
  { type:'country', emoji:'🇿🇼', title:'Zimbabwe',             subtitle:'Southern Africa · Capital: Harare',        url:'pages/country/zimbabwe.html',             tags:['great zimbabwe','mbira','victoria falls','shona sculpture'] },
  { type:'country', emoji:'🇨🇲', title:'Cameroon',             subtitle:'Central Africa · Capital: Yaoundé',        url:'pages/country/cameroon.html',             tags:['africa in miniature','makossa','indomitable lions','mount cameroon'] },
  { type:'country', emoji:'🇧🇯', title:'Benin',                subtitle:'West Africa · Capital: Porto-Novo',        url:'pages/country/benin.html',                tags:['vodun','voodoo','dahomey kingdom','ouidah','slave route'] },
  { type:'country', emoji:'🇲🇬', title:'Madagascar',           subtitle:'East Africa · Capital: Antananarivo',      url:'pages/country/madagascar.html',           tags:['lemurs','baobabs','endemic wildlife','famadihana','turning of bones'] },
  { type:'country', emoji:'🇸🇸', title:'South Sudan',          subtitle:'East Africa · Capital: Juba',              url:'pages/country/south-sudan.html',          tags:["world's youngest country",'2011','sudd wetlands','dinka','nuer'] },

  /* ── FOOD & CUISINE ─────────────────────────────────────────── */
  { type:'food', emoji:'🍛', title:'Jollof Rice',              subtitle:'West Africa · National Dish',              url:'culture.html#food',                       tags:['rice','tomato','ghana nigeria debate','party jollof','west african','jollof wars'] },
  { type:'food', emoji:'🫕', title:'Fufu',                     subtitle:'Ghana · Akan Cuisine',                     url:'culture.html#food',                       tags:['cassava','plantain','pounded','swallow','light soup','ghana','sunday ritual'] },
  { type:'food', emoji:'🍱', title:'Waakye',                   subtitle:'Ghana · Breakfast Bowl',                   url:'culture.html#food',                       tags:['rice beans','shito','northern ghana','hausa','ghana breakfast','sorghum'] },
  { type:'food', emoji:'🥩', title:'Suya',                     subtitle:'Nigeria · Hausa-Fulani Street Food',       url:'culture.html#food',                       tags:['beef skewers','yaji','groundnut powder','grilled','night food','hausa','nigerian street food'] },
  { type:'food', emoji:'🫙', title:'Injera',                   subtitle:'Ethiopia · National Bread',                url:'culture.html#food',                       tags:['teff','flatbread','fermented','ethiopian','east african','doro wot','unesco'] },
  { type:'food', emoji:'🍲', title:'Tagine',                   subtitle:'Morocco · Berber Stew',                    url:'culture.html#food',                       tags:['slow cooked','lamb','preserved lemon','moroccan','berber','clay pot','spices'] },
  { type:'food', emoji:'🥣', title:'Ugali',                    subtitle:'East Africa · Maize Staple',               url:'culture.html#food',                       tags:['maize','posho','sadza','kenya','tanzania','ugali','east african staple'] },
  { type:'food', emoji:'🫕', title:'Egusi Soup',               subtitle:'Nigeria · National Soup',                  url:'culture.html#food',                       tags:['melon seeds','palm oil','crayfish','pounded yam','yoruba','igbo','nigerian soup'] },
  { type:'food', emoji:'🌽', title:'Kenkey',                   subtitle:'Ghana · Ga & Fante Staple',                url:'culture.html#food',                       tags:['fermented cornmeal','shito','fried fish','ga','fante','accra harbour','ghana street food'] },
  { type:'food', emoji:'🍌', title:'Kelewele',                 subtitle:'Ghana · Street Snack',                     url:'culture.html#food',                       tags:['fried plantain','ginger','spiced','night market','ghana snack','sweet spicy'] },
  { type:'food', emoji:'🥘', title:'Banga Soup',               subtitle:'Nigeria · Niger Delta',                    url:'culture.html#food',                       tags:['palm nut','ijaw','delta','atama','oburunbebe','nigeria soup'] },
  { type:'food', emoji:'🥗', title:'Abacha (African Salad)',   subtitle:'Nigeria · Igbo Cuisine',                   url:'culture.html#food',                       tags:['cassava','ugba','palm oil','igbo','anambra','enugu','nigerian salad'] },
  { type:'food', emoji:'🍚', title:'Thiéboudienne',            subtitle:'Senegal · National Dish · UNESCO',         url:'culture.html#food',                       tags:['rice fish','senegal','wolof','unesco heritage','west africa','thieb'] },
  { type:'food', emoji:'🥘', title:'Red Red',                  subtitle:'Ghana · Black-eyed Peas Stew',             url:'culture.html#food',                       tags:['black eyed peas','palm oil','ghana','vegan','fried plantain','coastal'] },
  { type:'food', emoji:'🍳', title:'Akara',                    subtitle:'Nigeria / Brazil · Bean Cake',             url:'culture.html#food',                       tags:['bean cake','fried','yoruba','nigerian breakfast','acarajé brazil','diaspora'] },
  { type:'food', emoji:'🫙', title:'Shito',                    subtitle:'Ghana · Black Pepper Sauce',               url:'culture.html#food',                       tags:['pepper sauce','ga','accra','black pepper','condiment','dried fish','ghana sauce'] },
  { type:'food', emoji:'🥘', title:'Amala, Ewedu & Gbegiri',  subtitle:'Nigeria · Yoruba Holy Trinity',            url:'culture.html#food',                       tags:['amala','ewedu','gbegiri','abula','yoruba','ibadan','oyo','nigerian swallow'] },
  { type:'food', emoji:'🌿', title:'Couscous',                 subtitle:'North Africa · Berber · UNESCO',           url:'culture.html#food',                       tags:['semolina','friday couscous','maghreb','moroccan','algerian','tunisian','unesco'] },
  { type:'food', emoji:'🧆', title:'Bunny Chow',               subtitle:'South Africa · Durban Street Food',        url:'culture.html#food',                       tags:['bread curry','durban','south africa','indian south african','street food'] },
  { type:'food', emoji:'🥩', title:'Biltong',                  subtitle:'South Africa · Dried Meat',                url:'culture.html#food',                       tags:['dried beef','south africa','game meat','spiced','air dried','afrikaner'] },

  /* ── MUSIC & ARTISTS ────────────────────────────────────────── */
  { type:'music', emoji:'🎵', title:'Afrobeats',               subtitle:'Nigeria · Global Genre',                   url:'culture.html#music',                      tags:['lagos','nigerian pop','dancehall','yoruba rhythms','global','streaming','west african pop'] },
  { type:'music', emoji:'🎶', title:'Amapiano',                subtitle:'South Africa · Log Drum Bass',             url:'culture.html#music',                      tags:['johannesburg','east rand','deep house','log drum','piano','township','south africa 2020s'] },
  { type:'music', emoji:'🎸', title:'Highlife',                subtitle:'Ghana · 1920s Origin',                     url:'culture.html#music',                      tags:['ghana','1920s','brass band','et mensah','ancestor afrobeats','west african classic'] },
  { type:'music', emoji:'🥁', title:'Afrobeat (Original)',     subtitle:'Nigeria · Fela Kuti',                      url:'culture.html#music',                      tags:['fela kuti','fela','jazz funk','political','kalakuta','zombie','original afrobeat'] },
  { type:'music', emoji:'🎙️', title:'Mbalax',                  subtitle:'Senegal · Youssou N\'Dour',               url:'culture.html#music',                      tags:['senegal','sabar drums','youssou ndour','dakar','wolof','rhythmic'] },
  { type:'music', emoji:'🎺', title:'Gnawa',                   subtitle:'Morocco · Spiritual Healing · UNESCO',     url:'culture.html#music',                      tags:['morocco','guembri','lila','trance','healing','sufi','heritage','marrakech'] },
  { type:'music', emoji:'🎤', title:'Hiplife',                 subtitle:'Ghana · Reggie Rockstone',                 url:'culture.html#music',                      tags:['ghana','twi rap','reggie rockstone','hiplife','hip hop highlife','accra'] },
  { type:'music', emoji:'🎵', title:'Jùjú Music',             subtitle:'Nigeria · Yoruba Guitar',                  url:'culture.html#music',                      tags:['king sunny ade','yoruba','talking drum','guitar','nigerian pop','juju'] },
  { type:'music', emoji:'🎙️', title:'Fuji Music',             subtitle:'Nigeria · Yoruba Muslim',                  url:'culture.html#music',                      tags:['k1','wasiu ayinde','yoruba','ramadan','ajisari','fast paced','nigerian music'] },
  { type:'music', emoji:'🎵', title:'Asakaa / Ghana Drill',   subtitle:'Ghana · Kumasi / Kumerica',                url:'culture.html#music',                      tags:['black sherif','yaw tog','kumasi','kumerica','drill','ghana drill','twi','2020s'] },
  { type:'music', emoji:'🎵', title:'Morna',                   subtitle:'Cabo Verde · Cesária Évora',               url:'culture.html#music',                      tags:['cabo verde','cesaria evora','barefoot diva','island','portuguese creole','soulful'] },
  { type:'music', emoji:'🥁', title:'Taarab',                  subtitle:'Zanzibar / East Africa',                   url:'culture.html#music',                      tags:['zanzibar','swahili coast','arabic influence','east africa','oud','violin'] },

  /* Artist entries */
  { type:'artist', emoji:'🦍', title:'Burna Boy',              subtitle:'Afrobeats / Nigeria',                      url:'culture.html#music',                      tags:['burna boy','grammy','afrobeats','port harcourt','african giant','twice as tall'] },
  { type:'artist', emoji:'⭐', title:'Wizkid',                 subtitle:'Afrobeats / Nigeria',                      url:'culture.html#music',                      tags:['wizkid','starboy','ojuelegba','beyonce','grammy','afrobeats','lagos'] },
  { type:'artist', emoji:'💎', title:'Tems',                   subtitle:'Afrofusion / Nigeria',                     url:'culture.html#music',                      tags:['tems','grammy','nigerian female','r&b','soul','free mind','afrofusion'] },
  { type:'artist', emoji:'🔥', title:'Davido',                 subtitle:'Afrobeats / Nigeria',                      url:'culture.html#music',                      tags:['davido','fall','if','assurance','afrobeats','nigerian music'] },
  { type:'artist', emoji:'🎤', title:'Sarkodie',               subtitle:'Hiplife / Ghana',                          url:'culture.html#music',                      tags:['sarkodie','ghana','hiplife','bet award','twi','tema','rap'] },
  { type:'artist', emoji:'🌊', title:'Stonebwoy',              subtitle:'Afro-Dancehall / Ghana',                   url:'culture.html#music',                      tags:['stonebwoy','ghana','dancehall','reggae','bet award','ashaiman'] },
  { type:'artist', emoji:'🎵', title:'Shatta Wale',            subtitle:'Dancehall / Ghana',                        url:'culture.html#music',                      tags:['shatta wale','ghana','beyonce','lion king','dancehall','afrobeats'] },
  { type:'artist', emoji:'🔥', title:'Black Sherif',           subtitle:'Asakaa / Ghana',                           url:'culture.html#music',                      tags:['black sherif','second sermon','kweku traveller','ghana','asakaa','konongo'] },
  { type:'artist', emoji:'👑', title:'Fela Kuti',              subtitle:'Afrobeat / Nigeria · Legend',              url:'culture.html#music',                      tags:['fela','afrobeat','legend','kalakuta','political','nigeria','zombie','activist'] },
  { type:'artist', emoji:'🎸', title:'King Sunny Ade',         subtitle:'Jùjú Music / Nigeria · Legend',           url:'culture.html#music',                      tags:['king sunny ade','juju','nigeria','legend','grammy nomination','minister enjoyment'] },
  { type:'artist', emoji:'🎺', title:'E.T. Mensah',            subtitle:'Highlife / Ghana · Legend',                url:'culture.html#music',                      tags:['et mensah','highlife','ghana','legend','king of highlife','tempos','louis armstrong'] },
  { type:'artist', emoji:'🌹', title:'Cesária Évora',          subtitle:'Morna / Cabo Verde · Legend',              url:'culture.html#music',                      tags:['cesaria evora','morna','cabo verde','barefoot diva','grammy','legend','portuguese creole'] },
  { type:'artist', emoji:'🌊', title:'Rema',                   subtitle:'Afrobeats / Nigeria',                      url:'culture.html#music',                      tags:['rema','calm down','selena gomez','benin city','afrobeats','mavin'] },
  { type:'artist', emoji:'💫', title:'Asake',                  subtitle:'Street-pop / Nigeria',                     url:'culture.html#music',                      tags:['asake','ybnl','fuji afrobeats','street pop','olamide','mr money'] },
  { type:'artist', emoji:'🎵', title:'Youssou N\'Dour',        subtitle:'Mbalax / Senegal',                         url:'culture.html#music',                      tags:['youssou ndour','senegal','mbalax','dakar','grammy','minister culture','five octaves'] },
  { type:'artist', emoji:'🌍', title:'Miriam Makeba',          subtitle:'African Jazz / South Africa · Legend',     url:'culture.html#music',                      tags:['mama africa','makeba','south africa','apartheid','pata pata','grammy','legend'] },
  { type:'artist', emoji:'🎵', title:'Ali Farka Touré',        subtitle:'Desert Blues / Mali · Legend',             url:'culture.html#music',                      tags:['ali farka toure','mali','blues','desert','grammy','timbuktu','africa blues'] },

  /* ── FESTIVALS ──────────────────────────────────────────────── */
  { type:'festival', emoji:'🌊', title:'Osun-Osogbo Festival', subtitle:'Nigeria · Yoruba · August · UNESCO',       url:'culture.html#festivals',                  tags:['osun','osogbo','yoruba','nigeria','arugba','river goddess','sacred grove','fertility','brazil cuba'] },
  { type:'festival', emoji:'🏇', title:'Durbar Festival',      subtitle:'Nigeria · Hausa-Fulani · Eid',             url:'culture.html#festivals',                  tags:['durbar','kano','katsina','hausa','cavalry','horsemen','emir','northern nigeria','eid'] },
  { type:'festival', emoji:'🍠', title:'New Yam Festival',     subtitle:'Nigeria · Igbo · August–October',          url:'culture.html#festivals',                  tags:['new yam','iri ji','igbo','nigeria','masquerades','harvest','yam sacred','southeast'] },
  { type:'festival', emoji:'🍽️', title:'Homowo Festival',      subtitle:'Ghana · Ga · August/September',            url:'culture.html#festivals',                  tags:['homowo','ga','accra','ghana','hooting at hunger','kpokpoi','famine','ancestral feast'] },
  { type:'festival', emoji:'👑', title:'Akwasidae Festival',   subtitle:'Ghana · Ashanti · Every 42 Days',          url:'culture.html#festivals',                  tags:['akwasidae','ashanti','kumasi','asantehene','golden stool','kente','royal','akan calendar'] },
  { type:'festival', emoji:'🎭', title:'Eyo Festival',         subtitle:'Nigeria · Lagos · Isale-Eko',              url:'culture.html#festivals',                  tags:['eyo','lagos','white robes','masquerades','lagosian','carnival origin','iga idunganran'] },
  { type:'festival', emoji:'🎪', title:'Calabar Carnival',     subtitle:'Nigeria · Cross River · December',         url:'culture.html#festivals',                  tags:["africa's biggest street party",'calabar','nigeria','december','efik','cross river'] },
  { type:'festival', emoji:'🦌', title:'Aboakyir Festival',    subtitle:'Ghana · Effutu · May',                     url:'culture.html#festivals',                  tags:['aboakyir','deer hunt','winneba','fante','asafo','ghana','hunter festival'] },
  { type:'festival', emoji:'🦅', title:'Hogbetsotso Festival', subtitle:'Ghana · Anlo Ewe · November',              url:'culture.html#festivals',                  tags:['hogbetsotso','anlo ewe','volta','notsie','exodus','ghana','togo','ewe diaspora'] },
  { type:'festival', emoji:'🕯️', title:'Timkat',               subtitle:'Ethiopia · Orthodox · January · UNESCO',   url:'culture.html#festivals',                  tags:['timkat','ethiopia','epiphany','orthodox','lalibela','tabot','ark','baptism','gondar'] },
  { type:'festival', emoji:'🎨', title:'Chale Wote Festival',  subtitle:'Ghana · Accra · Street Art · August',      url:'culture.html#festivals',                  tags:['chale wote','accra','jamestown','street art','ghana','urban','creative','murals'] },
  { type:'festival', emoji:'🎉', title:'Detty December',       subtitle:'Ghana · Accra · December',                 url:'discover.html',                           tags:['detty december','ghana','accra','diaspora','afronation','new year','party','december'] },
  { type:'festival', emoji:'🎭', title:'Panafest',             subtitle:'Ghana · Cape Coast · Pan-African',         url:'discover.html',                           tags:['panafest','cape coast','ghana','diaspora','slave castle','door of no return','pan african'] },
  { type:'festival', emoji:'🌺', title:'Year of Return',       subtitle:'Ghana · 2019 · Diaspora Homecoming',       url:'discover.html',                           tags:['year of return','ghana','diaspora','2019','african american','slavery','400 years','akufo addo'] },

  /* ── LANGUAGES ──────────────────────────────────────────────── */
  { type:'language', emoji:'🗣️', title:'Yoruba',               subtitle:'47M Speakers · Nigeria, Benin, Togo',      url:'learn.html#explorer',                     tags:['yoruba','tonal','nigeria','southwest','ifa','orisha','diaspora','brazil cuba'] },
  { type:'language', emoji:'🗣️', title:'Swahili (Kiswahili)',  subtitle:'200M Speakers · East & Central Africa',    url:'learn.html#explorer',                     tags:['swahili','kiswahili','kenya','tanzania','east africa','habari','karibu','asante','hakuna matata'] },
  { type:'language', emoji:'🗣️', title:'Igbo',                 subtitle:'25M Speakers · Southeastern Nigeria',      url:'learn.html#explorer',                     tags:['igbo','tonal','nigeria','southeast','odinani','chinua achebe','things fall apart'] },
  { type:'language', emoji:'🗣️', title:'Hausa',                subtitle:'67M+ Speakers · Northern Nigeria & West Africa', url:'learn.html#explorer',             tags:['hausa','afro-asiatic','northern nigeria','niger','west africa','bbc hausa','ajami'] },
  { type:'language', emoji:'🗣️', title:'Twi (Akan)',           subtitle:'17M Speakers · Ghana · 80% Understand',   url:'learn.html#explorer',                     tags:['twi','akan','ghana','akwaaba','sankofa','gye nyame','ashanti','fante'] },
  { type:'language', emoji:'🗣️', title:'Amharic',              subtitle:'57M Speakers · Ethiopia',                  url:'learn.html#explorer',                     tags:['amharic','ethiopia','geez script','fidel','semitic','selam','never colonized'] },
  { type:'language', emoji:'🗣️', title:'Zulu (isiZulu)',       subtitle:'12M Speakers · South Africa',              url:'learn.html#explorer',                     tags:['zulu','south africa','sawubona','ubuntu','clicks','nguni','kwazulu natal'] },
  { type:'language', emoji:'🗣️', title:'Nigerian Pidgin (Naija)', subtitle:'75M Speakers · Nigeria',               url:'learn.html#explorer',                     tags:['pidgin','naija','nigerian pidgin','creole','lingua franca','wey','dey','how far'] },
  { type:'language', emoji:'🗣️', title:'Ewe',                  subtitle:'5M Speakers · Ghana, Togo, Benin',         url:'learn.html#explorer',                     tags:['ewe','ghana','volta','togo','benin','vodu vodun','polyrhythmic','agbadza'] },
  { type:'language', emoji:'🗣️', title:'Wolof',                subtitle:'Senegal · National Lingua Franca',         url:'learn.html#explorer',                     tags:['wolof','senegal','dakar','teranga','nanga def','cheikh anta diop'] },
  { type:'language', emoji:'🗣️', title:'Ga',                   subtitle:'1M Speakers · Accra, Ghana',               url:'learn.html#explorer',                     tags:['ga','accra','ghana','homowo','indigenous accra','kpanlogo'] },
  { type:'language', emoji:'🗣️', title:'Fulfulde (Fula)',      subtitle:'13M+ Speakers · Sahel Belt',               url:'learn.html#explorer',                     tags:['fulfulde','fula','fulani','sahel','west africa','pastoralist','nomadic'] },

  /* ── TRADITIONS & CULTURE TERMS ─────────────────────────────── */
  { type:'tradition', emoji:'🍷', title:'Igba Nkwu',            subtitle:'Igbo Wedding · Wine Carrying Ceremony',    url:'culture.html#traditions',                 tags:['igba nkwu','igbo','wedding','wine','palm wine','bride groom','nigeria','traditional marriage'] },
  { type:'tradition', emoji:'🙇', title:'Prostration (Idobale)',subtitle:'Yoruba · Deepest Mark of Respect',         url:'culture.html#traditions',                 tags:['idobale','prostration','yoruba','wedding','respect','nigeria','bow lie down'] },
  { type:'tradition', emoji:'💍', title:'Kamu Ceremony',         subtitle:'Hausa-Fulani · Bridal Unveiling',          url:'culture.html#traditions',                 tags:['kamu','hausa','northern nigeria','bride','unveiling','henna','lalle','wedding'] },
  { type:'tradition', emoji:'🤝', title:'Knocking Ceremony',     subtitle:'Ghana · Universal Marriage First Step',    url:'culture.html#traditions',                 tags:['knocking','ghana','marriage','abusua','libation','schnapps','akan','ga','dagomba'] },
  { type:'tradition', emoji:'🌍', title:'Ubuntu',                subtitle:'Southern Africa · "I Am Because We Are"', url:'learn.html#proverbs',                     tags:['ubuntu','south africa','nguni','mandela','desmond tutu','communal','philosophy','i am because we are'] },
  { type:'tradition', emoji:'🦅', title:'Sankofa',               subtitle:'Ghana · Akan · Go Back and Fetch It',     url:'learn.html#proverbs',                     tags:['sankofa','akan','ghana','adinkra','past','bird looking back','philosophy','symbol'] },
  { type:'tradition', emoji:'🌿', title:'Ifa Divination',        subtitle:'Yoruba · Nigeria · UNESCO Heritage',      url:'culture.html#beliefs',                    tags:['ifa','yoruba','nigeria','babalawo','oracle','divination','256 odus','unesco','orisha'] },
  { type:'tradition', emoji:'🥁', title:'Griot (Jeli/Jali)',     subtitle:'West Africa · Oral Historian & Musician',  url:'learn.html',                              tags:['griot','jeli','jali','mali','senegal','gambia','oral history','kora','storyteller','west africa'] },
  { type:'tradition', emoji:'🍵', title:'Ethiopian Coffee Ceremony', subtitle:'Ethiopia · 1,000 Year Ritual',        url:'discover.html#food-trails',               tags:['coffee ceremony','ethiopia','buna','jebena','three rounds','abol tona baraka','ritual'] },
  { type:'tradition', emoji:'🌿', title:'Famadihana',             subtitle:'Madagascar · Turning of the Bones',       url:'culture.html',                            tags:['famadihana','madagascar','malagasy','ancestors','bones','silk','ceremony','burial'] },
  { type:'tradition', emoji:'🎭', title:'Mmanwu Masquerades',    subtitle:'Igbo · Nigeria · Ancestral Spirits',       url:'culture.html#beliefs',                    tags:['mmanwu','masquerades','igbo','nigeria','ancestral','spirits','festival','odinani'] },
  { type:'tradition', emoji:'🪑', title:'Golden Stool (Sika Dwa)', subtitle:'Ghana · Ashanti · Soul of the Nation',  url:'pages/country/ghana.html',                tags:['golden stool','sika dwa','ashanti','ghana','osei tutu','okomfo anokye','soul nation','descended from heaven'] },
  { type:'tradition', emoji:'🥁', title:'Talking Drums',          subtitle:'West Africa · Communication System',      url:'learn.html',                              tags:['talking drums','yoruba','ghana','dagomba','lunsi','oral history','communication','drum language'] },
  { type:'tradition', emoji:'🌿', title:'Kola Nut Ceremony',      subtitle:'West Africa · Sacred Hospitality',        url:'culture.html#traditions',                 tags:['kola nut','obi','igbo','yoruba','hausa','hospitality','ceremony','sacred','nigeria ghana'] },

  /* ── ADINKRA SYMBOLS ────────────────────────────────────────── */
  { type:'symbol', emoji:'☀️', title:'Gye Nyame',                subtitle:'Akan · Except God · Most popular Adinkra', url:'pages/country/ghana.html#sec-adinkra',   tags:['gye nyame','adinkra','akan','ghana','god','symbol','except god','divine supremacy'] },
  { type:'symbol', emoji:'🦅', title:'Sankofa Symbol',           subtitle:'Akan · Bird Looking Backward',             url:'pages/country/ghana.html#sec-adinkra',   tags:['sankofa','bird','adinkra','ghana','past','future','africa symbol','learn from past'] },
  { type:'symbol', emoji:'🐊', title:'Funtunfunefu',             subtitle:'Akan · Siamese Crocodiles · Unity',        url:'pages/country/ghana.html#sec-adinkra',   tags:['funtunfunefu','siamese crocodiles','unity','adinkra','ghana','communal destiny'] },
  { type:'symbol', emoji:'❤️', title:'Akoma',                   subtitle:'Akan · The Heart · Patience',              url:'pages/country/ghana.html#sec-adinkra',   tags:['akoma','heart','patience','adinkra','akan','ghana','tolerance','faithfulness'] },

  /* ── TRAVEL PLACES ──────────────────────────────────────────── */
  { type:'place', emoji:'🏰', title:'Cape Coast Castle',         subtitle:'Ghana · UNESCO · Slave Trade History',    url:'discover.html',                           tags:['cape coast','ghana','slavery','slave trade','door of no return','unesco','diaspora','castle'] },
  { type:'place', emoji:'🏺', title:'Osun-Osogbo Sacred Grove', subtitle:'Nigeria · UNESCO World Heritage Site',     url:'discover.html',                           tags:['osun osogbo','nigeria','yoruba','sacred grove','UNESCO','festival','oshun'] },
  { type:'place', emoji:'🏔️', title:'Simien Mountains',         subtitle:'Ethiopia · UNESCO · Gelada Baboons',       url:'discover.html#hidden-gems',               tags:['simien','ethiopia','mountains','gelada','baboon','trekking','roof of africa','UNESCO'] },
  { type:'place', emoji:'🦁', title:'Serengeti National Park',  subtitle:'Tanzania · Great Migration',               url:'discover.html',                           tags:['serengeti','tanzania','great migration','safari','wildebeest','lions','east africa'] },
  { type:'place', emoji:'🌊', title:'Okavango Delta',           subtitle:'Botswana · UNESCO · Inland Delta',         url:'discover.html',                           tags:['okavango','botswana','delta','UNESCO','safari','elephants','hippos','wildlife'] },
  { type:'place', emoji:'🏔️', title:'Mount Kilimanjaro',        subtitle:'Tanzania · Africa\'s Highest Peak',       url:'discover.html',                           tags:['kilimanjaro','tanzania','highest peak','africa','uhuru','trekking','snow equator'] },
  { type:'place', emoji:'🏛️', title:'Pyramids of Meroe',        subtitle:'Sudan · More Pyramids than Egypt',         url:'discover.html#hidden-gems',               tags:['meroe','sudan','nubian pyramids','kush','more than egypt','sahara','UNESCO'] },
  { type:'place', emoji:'🌋', title:'Nyiragongo Volcano',        subtitle:'DRC · World\'s Largest Lava Lake',        url:'discover.html#hidden-gems',               tags:['nyiragongo','drc','lava lake','virunga','gorillas','volcano','crater','camp overnight'] },
  { type:'place', emoji:'🌊', title:'Zanzibar',                 subtitle:'Tanzania · Spice Island · Swahili Culture', url:'discover.html',                           tags:['zanzibar','tanzania','stone town','spice','indian ocean','swahili','UNESCO','beach'] },
  { type:'place', emoji:'🏛️', title:'Timbuktu',                  subtitle:'Mali · Ancient City of Manuscripts · UNESCO', url:'discover.html#hidden-gems',          tags:['timbuktu','mali','manuscripts','7th holiest','islamic scholarship','UNESCO','sahara','ancient'] },

  /* ── HISTORICAL FIGURES ─────────────────────────────────────── */
  { type:'person', emoji:'✊', title:'Kwame Nkrumah',            subtitle:'Ghana · Father of Pan-Africanism',         url:'pages/country/ghana.html#sec-history',    tags:['nkrumah','ghana','independence','pan africanism','1957','cppp','positive action','africa free'] },
  { type:'person', emoji:'✊', title:'Nelson Mandela',           subtitle:'South Africa · Anti-Apartheid Hero',       url:'pages/country/south-africa.html',         tags:['mandela','south africa','apartheid','robben island','ubuntu','reconciliation','anc','nobel peace'] },
  { type:'person', emoji:'👑', title:'Mansa Musa',               subtitle:'Mali Empire · Wealthiest Human in History', url:'pages/country/mali.html',               tags:['mansa musa','mali empire','richest','gold','hajj','timbuktu','medieval','400 billion'] },
  { type:'person', emoji:'👑', title:'Shaka Zulu',               subtitle:'South Africa · Zulu King · Military Genius', url:'pages/country/south-africa.html',       tags:['shaka zulu','zulu','south africa','military','kingdom','warrior','impis','revolution'] },
  { type:'person', emoji:'👑', title:'Osei Tutu I',              subtitle:'Ghana · Founder of Ashanti Empire',        url:'pages/country/ghana.html#sec-history',    tags:['osei tutu','ashanti','ghana','golden stool','founder','kumasi','empire 1670'] },
  { type:'person', emoji:'👑', title:'Cleopatra VII',            subtitle:'Egypt · Last Pharaoh · Scholar & Queen',   url:'pages/country/egypt.html',                tags:['cleopatra','egypt','pharaoh','ptolemaic','scholar','multiple languages','last pharaoh'] },
  { type:'person', emoji:'👑', title:'Queen Amina of Zaria',     subtitle:'Nigeria · 16th Century Warrior Queen',     url:'pages/country/nigeria.html',              tags:['amina','zaria','hausa','nigeria','warrior queen','16th century','military','zazzau'] },
  { type:'person', emoji:'✍️', title:'Chinua Achebe',            subtitle:'Nigeria · Things Fall Apart · Igbo Voice',  url:'pages/country/nigeria.html',              tags:['chinua achebe','things fall apart','igbo','nigeria','novel','literature','okonkwo','20 million'] },
  { type:'person', emoji:'✍️', title:'Chimamanda Ngozi Adichie', subtitle:'Nigeria · Author · Feminist',              url:'explore.html',                            tags:['chimamanda','adichie','nigeria','feminist','half yellow sun','americanah','ted talk','purple hibiscus'] },
  { type:'person', emoji:'🔬', title:'Philip Emeagwali',         subtitle:'Nigeria · Computing Pioneer',              url:'explore.html',                            tags:['emeagwali','nigeria','computer','gordon bell prize','internet','igbo','computing pioneer'] },
];


/* ================================================================
   02. RELEVANCE SCORING ENGINE
================================================================ */

/**
 * Score a search item against a query
 * @param {Object} item - Search index item
 * @param {string} query - Search query (lowercase)
 * @returns {number} - Relevance score (higher = more relevant)
 */
function scoreItem(item, query) {
  let score = 0;
  const q   = query.toLowerCase().trim();

  if (!q) return 0;

  const titleLower = item.title.toLowerCase();
  const subLower   = (item.subtitle || '').toLowerCase();
  const tagsStr    = (item.tags || []).join(' ').toLowerCase();

  /* Exact title match */
  if (titleLower === q) {
    score += 100;
  }
  /* Title starts with query */
  else if (titleLower.startsWith(q)) {
    score += 80;
  }
  /* Title contains query */
  else if (titleLower.includes(q)) {
    score += 60;
  }

  /* Subtitle match */
  if (subLower.includes(q)) {
    score += 30;
  }

  /* Tags exact match */
  if ((item.tags || []).some(t => t.toLowerCase() === q)) {
    score += 50;
  }

  /* Tags partial match */
  if (tagsStr.includes(q)) {
    score += 20;
  }

  /* Boost by type priority */
  const typePriority = {
    country:   10,
    food:       8,
    festival:   7,
    artist:     7,
    music:      6,
    language:   6,
    tradition:  5,
    person:     5,
    place:      4,
    symbol:     3,
  };
  score += typePriority[item.type] || 0;

  return score;
}

/**
 * Search the index with a query
 * @param {string} query - Search query
 * @param {Object} [options] - Search options
 * @param {number} [options.limit=20] - Max results
 * @param {string} [options.type] - Filter by type
 * @returns {Array} - Sorted search results with scores
 */
function searchIndex(query, options = {}) {
  const { limit = 20, type = null } = options;

  if (!query || query.trim().length < 1) return [];

  const q = query.toLowerCase().trim();

  return SEARCH_INDEX
    .filter(item => {
      // Type filter
      if (type && item.type !== type) return false;

      // Must have some match
      return scoreItem(item, q) > 0;
    })
    .map(item => ({ ...item, _score: scoreItem(item, q) }))
    .sort((a, b) => b._score - a._score)
    .slice(0, limit);
}

/**
 * Group search results by type
 * @param {Array} results - Search results
 * @returns {Object} - Results grouped by type
 */
function groupResults(results) {
  return results.reduce((groups, item) => {
    const key = item.type;
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
    return groups;
  }, {});
}


/* ================================================================
   03. SEARCH INDEX BUILDER
   Utility to add items to the search index dynamically
   (e.g. from loaded JSON data)
================================================================ */

const SearchIndexManager = {
  /**
   * Add items to the search index
   * @param {Array} items - Items to add
   */
  add(items) {
    items.forEach(item => {
      // Avoid duplicates by title + type
      const exists = SEARCH_INDEX.some(
        e => e.title === item.title && e.type === item.type
      );
      if (!exists) SEARCH_INDEX.push(item);
    });
  },

  /**
   * Add countries from countries.json data
   * @param {Array} countries - Country data array
   */
  addCountries(countries) {
    const items = countries.map(c => ({
      type:     'country',
      emoji:    c.flag_emoji,
      title:    c.name,
      subtitle: `${c.region} · Capital: ${c.capital}`,
      url:      `pages/country/${c.slug}.html`,
      tags:     [
        c.region.toLowerCase(),
        c.capital.toLowerCase(),
        c.iso_alpha2.toLowerCase(),
        ...(c.known_for || []).map(k => k.toLowerCase()),
      ],
    }));
    this.add(items);
  },
};


/* ================================================================
   04. SEARCH ENGINE CORE
================================================================ */

const SearchEngine = {
  index:   SEARCH_INDEX,
  loaded:  false,

  /**
   * Run a search
   * @param {string} query
   * @param {Object} [options]
   * @returns {Array}
   */
  search(query, options = {}) {
    return searchIndex(query, options);
  },

  /**
   * Get suggestions for autocomplete
   * @param {string} query
   * @param {number} [limit=5]
   * @returns {string[]}
   */
  suggest(query, limit = 5) {
    if (!query || query.length < 1) return [];
    const q       = query.toLowerCase();
    const matches = new Set();

    SEARCH_INDEX.forEach(item => {
      if (item.title.toLowerCase().startsWith(q)) {
        matches.add(item.title);
      }
    });

    return Array.from(matches).slice(0, limit);
  },

  /**
   * Get popular/trending searches
   * @returns {string[]}
   */
  getPopular() {
    return [
      'Afrobeats',
      'Kente cloth',
      'Jollof Rice',
      'Swahili',
      'Maasai',
      'Timbuktu',
      'Ubuntu',
      'Sankofa',
      'Fela Kuti',
      'Victoria Falls',
    ];
  },
};


/* ================================================================
   05. RESULT RENDERER
================================================================ */

const ResultRenderer = {
  /* Type display config */
  typeConfig: {
    country:   { label:'Countries',        color:'var(--gold)',        icon:'🌍' },
    food:      { label:'Food & Cuisine',   color:'#d4622a',            icon:'🍛' },
    music:     { label:'Music',            color:'#2e7d5e',            icon:'🎵' },
    artist:    { label:'Artists',          color:'#2e7d5e',            icon:'🎤' },
    festival:  { label:'Festivals',        color:'#b8420a',            icon:'🎊' },
    language:  { label:'Languages',        color:'#c8952a',            icon:'🗣️' },
    tradition: { label:'Traditions',       color:'#8b3a9e',            icon:'🤝' },
    symbol:    { label:'Symbols',          color:'#c8952a',            icon:'✨' },
    place:     { label:'Places',           color:'#2e7d5e',            icon:'📍' },
    person:    { label:'People',           color:'#1a6ea8',            icon:'👤' },
  },

  /**
   * Render grouped search results as HTML
   * @param {Array} results - Search results
   * @param {string} query - Original query (for highlighting)
   * @returns {string} - HTML string
   */
  render(results, query) {
    if (!results.length) {
      return this.renderEmpty(query);
    }

    const grouped = groupResults(results);
    const html    = [];

    // Render each group
    Object.entries(grouped).forEach(([type, items]) => {
      const cfg   = this.typeConfig[type] || { label: type, color: 'var(--gold)', icon: '●' };
      const label = `${cfg.icon} ${cfg.label}`;

      html.push(`
        <div class="search-group">
          <div class="search-group-label" style="
            font-family:'DM Mono',monospace;
            font-size:.62rem;
            letter-spacing:.12em;
            text-transform:uppercase;
            color:${cfg.color};
            padding:.65rem 1.25rem .4rem;
          ">${label}</div>
          ${items.map(item => this.renderItem(item, query)).join('')}
        </div>
      `);
    });

    return html.join('');
  },

  /**
   * Render a single result item
   * @param {Object} item - Search item
   * @param {string} query - Query for highlighting
   * @returns {string}
   */
  renderItem(item, query) {
    const highlightedTitle    = this.highlight(item.title,    query);
    const highlightedSubtitle = this.highlight(item.subtitle, query);
    const url                 = this.resolveUrl(item.url);

    return `
      <a href="${url}" class="search-result-item" style="
        display:flex; align-items:center; gap:.9rem;
        padding:.8rem 1.25rem; cursor:pointer;
        transition:background .2s;
        text-decoration:none; color:inherit;
      "
      onmouseover="this.style.background='var(--bg-raise)'"
      onmouseout="this.style.background=''"
      onclick="SearchHistory.save('${item.title.replace(/'/g, "\\'")}')">
        <span style="font-size:1.4rem;flex-shrink:0">${item.emoji || '●'}</span>
        <div style="min-width:0;flex:1">
          <div style="font-weight:600;font-size:.88rem;color:var(--cream);
                      white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
            ${highlightedTitle}
          </div>
          <div style="font-size:.72rem;color:var(--text-muted);margin-top:.1rem;
                      white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
            ${highlightedSubtitle}
          </div>
        </div>
        <span style="color:var(--text-muted);font-size:.7rem;flex-shrink:0">→</span>
      </a>
    `;
  },

  /** Render empty state */
  renderEmpty(query) {
    return `
      <div style="padding:2.5rem;text-align:center;color:var(--text-muted)">
        <div style="font-size:2rem;margin-bottom:.75rem">🔍</div>
        <div style="font-size:.9rem">
          No results for <strong style="color:var(--cream)">"${this.escape(query)}"</strong>
        </div>
        <div style="font-size:.8rem;margin-top:.35rem">
          Try searching for a country, food dish, festival, or artist
        </div>
      </div>
    `;
  },

  /** Render loading state */
  renderLoading() {
    return `
      <div style="padding:2rem;text-align:center;color:var(--text-muted);font-size:.88rem">
        Searching...
      </div>
    `;
  },

  /** Render popular searches */
  renderPopular() {
    const popular = SearchEngine.getPopular();
    return `
      <div style="padding:1rem 1.25rem">
        <div style="font-family:'DM Mono',monospace;font-size:.62rem;letter-spacing:.12em;
                    text-transform:uppercase;color:var(--gold);margin-bottom:.75rem">
          🔥 Popular Searches
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:.4rem">
          ${popular.map(term => `
            <button onclick="FricaSearch.fillAndSearch('${term}')"
              style="padding:.3rem .75rem;border-radius:999px;border:1px solid var(--border-dim);
                     font-size:.75rem;color:var(--text-soft);background:transparent;
                     cursor:pointer;transition:.2s;font-family:'DM Sans',sans-serif"
              onmouseover="this.style.borderColor='var(--border)';this.style.color='var(--cream)'"
              onmouseout="this.style.borderColor='var(--border-dim)';this.style.color='var(--text-soft)'">
              ${term}
            </button>
          `).join('')}
        </div>
      </div>
    `;
  },

  /** Highlight matching text */
  highlight(str, query) {
    if (!str || !query) return str || '';
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex   = new RegExp(`(${escaped})`, 'gi');
    return str.replace(regex,
      '<mark style="background:rgba(200,149,42,.2);color:var(--gold-light);border-radius:2px;padding:0 1px">$1</mark>'
    );
  },

  /** Escape HTML */
  escape(str) {
    return (str || '').replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;',
    }[c]));
  },

  /** Resolve URL relative to current page */
  resolveUrl(url) {
    // If we're in pages/country/, we need to go up two levels
    if (window.location.pathname.includes('/pages/country/')) {
      if (!url.startsWith('http') && !url.startsWith('/')) {
        return `../../${url}`;
      }
    }
    return url;
  },
};


/* ================================================================
   06. AUTOCOMPLETE / SUGGESTIONS
================================================================ */

const Autocomplete = {
  el:        null,
  inputEl:   null,
  active:    -1,
  items:     [],

  /**
   * Attach autocomplete to an input
   * @param {HTMLInputElement} inputEl - Input element
   * @param {Function} onSelect - Callback when suggestion selected
   */
  attach(inputEl, onSelect) {
    if (!inputEl) return;
    this.inputEl = inputEl;

    // Create dropdown
    this.el = document.createElement('div');
    this.el.style.cssText = [
      'position:absolute',
      'top:100%',
      'left:0',
      'right:0',
      'background:var(--bg-raise)',
      'border:1px solid var(--border)',
      'border-top:none',
      'border-radius:0 0 var(--radius-md) var(--radius-md)',
      'z-index:200',
      'display:none',
      'overflow:hidden',
    ].join(';');

    inputEl.parentElement.style.position = 'relative';
    inputEl.parentElement.appendChild(this.el);

    // Input handler
    inputEl.addEventListener('input', () => {
      const q = inputEl.value.trim();
      if (q.length < 1) {
        this.hide();
        return;
      }
      const suggestions = SearchEngine.suggest(q, 5);
      this.show(suggestions, q, onSelect);
    });

    // Blur to hide
    inputEl.addEventListener('blur', () => {
      setTimeout(() => this.hide(), 200);
    });
  },

  show(suggestions, query, onSelect) {
    if (!suggestions.length) { this.hide(); return; }

    this.items  = suggestions;
    this.active = -1;

    this.el.style.display = 'block';
    this.el.innerHTML = suggestions.map((s, i) => `
      <div class="ac-item" data-idx="${i}"
        style="padding:.65rem 1rem;font-size:.88rem;color:var(--text-soft);
               cursor:pointer;transition:background .15s;display:flex;align-items:center;gap:.5rem"
        onmouseover="this.style.background='var(--bg-card)';this.style.color='var(--cream)'"
        onmouseout="this.style.background='';this.style.color='var(--text-soft)'"
        onmousedown="event.preventDefault()">
        <span style="color:var(--text-muted);font-size:.75rem">🔍</span>
        ${ResultRenderer.highlight(s, query)}
      </div>
    `).join('');

    // Click handlers
    this.el.querySelectorAll('.ac-item').forEach(item => {
      item.addEventListener('mousedown', () => {
        const idx = parseInt(item.dataset.idx);
        const val = suggestions[idx];
        if (this.inputEl) this.inputEl.value = val;
        this.hide();
        onSelect?.(val);
      });
    });
  },

  hide() {
    if (this.el) this.el.style.display = 'none';
    this.active = -1;
    this.items  = [];
  },

  /** Navigate with keyboard */
  navigate(dir) {
    const items = this.el?.querySelectorAll('.ac-item');
    if (!items?.length) return;

    // Remove previous highlight
    if (this.active >= 0) {
      items[this.active].style.background = '';
      items[this.active].style.color      = 'var(--text-soft)';
    }

    this.active += dir;
    if (this.active < 0)            this.active = items.length - 1;
    if (this.active >= items.length) this.active = 0;

    items[this.active].style.background = 'var(--bg-card)';
    items[this.active].style.color      = 'var(--cream)';

    if (this.inputEl && this.items[this.active]) {
      this.inputEl.value = this.items[this.active];
    }
  },

  selectCurrent(onSelect) {
    if (this.active >= 0 && this.items[this.active]) {
      onSelect?.(this.items[this.active]);
      this.hide();
    }
  },
};


/* ================================================================
   07. SEARCH HISTORY MANAGER
================================================================ */

const SearchHistory = {
  key:   'frica_search_history',
  limit: 8,
  data:  [],

  init() {
    this.data = JSON.parse(localStorage.getItem(this.key) || '[]');
  },

  /**
   * Save a search term to history
   * @param {string} term
   */
  save(term) {
    if (!term || !term.trim()) return;
    const clean = term.trim();
    // Remove if already exists
    this.data = this.data.filter(t => t.toLowerCase() !== clean.toLowerCase());
    // Add to front
    this.data.unshift(clean);
    // Trim
    this.data = this.data.slice(0, this.limit);
    localStorage.setItem(this.key, JSON.stringify(this.data));
  },

  /**
   * Get recent searches
   * @returns {string[]}
   */
  get() {
    return [...this.data];
  },

  /**
   * Clear all history
   */
  clear() {
    this.data = [];
    localStorage.removeItem(this.key);
  },

  /**
   * Render history chips as HTML
   * @returns {string}
   */
  render() {
    if (!this.data.length) return '';
    return `
      <div style="padding:1rem 1.25rem">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.75rem">
          <div style="font-family:'DM Mono',monospace;font-size:.62rem;letter-spacing:.12em;
                      text-transform:uppercase;color:var(--gold)">Recent</div>
          <button onclick="SearchHistory.clear();FricaSearch.renderDefault()"
            style="font-size:.7rem;color:var(--text-muted);cursor:pointer;
                   font-family:'DM Sans',sans-serif;transition:color .2s"
            onmouseover="this.style.color='var(--cream)'"
            onmouseout="this.style.color='var(--text-muted)'">
            Clear
          </button>
        </div>
        <div style="display:flex;flex-direction:column;gap:.3rem">
          ${this.data.map(term => `
            <div onclick="FricaSearch.fillAndSearch('${term.replace(/'/g, "\\'")}')"
              style="display:flex;align-items:center;gap:.6rem;padding:.5rem .75rem;
                     border-radius:var(--radius-md);cursor:pointer;transition:background .15s"
              onmouseover="this.style.background='var(--bg-raise)'"
              onmouseout="this.style.background=''">
              <span style="color:var(--text-muted);font-size:.8rem">🕐</span>
              <span style="font-size:.84rem;color:var(--text-soft)">${term}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },
};


/* ================================================================
   08. SEARCH UI CONTROLLER
   The main search modal UI controller
================================================================ */

const FricaSearch = {
  modal:       null,
  backdrop:    null,
  inputEl:     null,
  resultsEl:   null,
  closeBtn:    null,
  isOpen:      false,
  debounceTimer: null,
  selectedIdx:   -1,
  currentResults: [],

  init() {
    this.modal    = document.getElementById('searchModal');
    if (!this.modal) return;

    this.backdrop  = document.getElementById('searchBackdrop');
    this.inputEl   = document.getElementById('modalSearchInput');
    this.resultsEl = document.getElementById('searchResults');
    this.closeBtn  = document.getElementById('searchClose');

    // Trigger buttons
    const triggers = [
      document.getElementById('navSearchBtn'),
      document.getElementById('heroSearchBtn'),
    ];

    triggers.forEach(btn => btn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.open();
    }));

    // Hero search input
    const heroInput = document.getElementById('heroSearch');
    if (heroInput) {
      heroInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          const q = heroInput.value.trim();
          this.open(q);
        }
      });
    }

    // Close handlers
    this.closeBtn?.addEventListener('click',   () => this.close());
    this.backdrop?.addEventListener('click',   () => this.close());

    // Search input
    this.inputEl?.addEventListener('input', () => {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.handleInput(this.inputEl.value);
      }, 150);
    });

    // Init history
    SearchHistory.init();
  },

  /**
   * Open the search modal
   * @param {string} [prefill] - Pre-fill query
   */
  open(prefill = '') {
    if (!this.modal) return;

    this.isOpen = true;
    this.modal.classList.add('open');
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
      this.inputEl?.focus();
      if (prefill) {
        this.inputEl.value = prefill;
        this.handleInput(prefill);
      } else {
        this.renderDefault();
      }
    }, 60);
  },

  /** Close the search modal */
  close() {
    if (!this.modal) return;

    this.isOpen = false;
    this.modal.classList.remove('open');
    document.body.style.overflow = '';

    if (this.inputEl) {
      this.inputEl.value = '';
    }
    this.currentResults  = [];
    this.selectedIdx     = -1;
  },

  /** Handle search input */
  handleInput(value) {
    const q = value.trim();

    if (!q) {
      this.renderDefault();
      return;
    }

    if (q.length < 1) return;

    // Run search
    const results = SearchEngine.search(q, { limit: 24 });
    this.currentResults = results;
    this.selectedIdx    = -1;

    // Render
    if (this.resultsEl) {
      this.resultsEl.innerHTML = ResultRenderer.render(results, q);
    }
  },

  /** Render default state (history + popular) */
  renderDefault() {
    if (!this.resultsEl) return;

    const historyHtml = SearchHistory.render();
    const popularHtml = ResultRenderer.renderPopular();

    this.resultsEl.innerHTML = historyHtml || popularHtml
      ? (historyHtml + popularHtml)
      : `<div style="padding:2rem;text-align:center;color:var(--text-muted);font-size:.88rem">
           Start typing to search across all of Africa...
         </div>`;
  },

  /**
   * Fill the input and run a search
   * @param {string} term
   */
  fillAndSearch(term) {
    if (this.inputEl) {
      this.inputEl.value = term;
      this.inputEl.focus();
    }
    this.handleInput(term);
  },

  /** Handle keyboard navigation through results */
  handleKeyNav(e) {
    if (!this.isOpen) return;

    const items = this.resultsEl?.querySelectorAll('.search-result-item, [onmousedown]');
    if (!items?.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.selectedIdx = Math.min(this.selectedIdx + 1, items.length - 1);
      this.highlightItem(items);
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.selectedIdx = Math.max(this.selectedIdx - 1, -1);
      this.highlightItem(items);
    }

    if (e.key === 'Enter' && this.selectedIdx >= 0) {
      e.preventDefault();
      items[this.selectedIdx]?.click();
    }
  },

  highlightItem(items) {
    items.forEach((item, i) => {
      item.style.background = i === this.selectedIdx ? 'var(--bg-raise)' : '';
    });
    if (this.selectedIdx >= 0) {
      items[this.selectedIdx]?.scrollIntoView({ block: 'nearest' });
    }
  },
};

/** Global helper for inline onclick usage */
function doSearch(term) {
  FricaSearch.open(term);
}


/* ================================================================
   09. HERO SEARCH BAR
   Handles the large search bar on the index.html homepage
================================================================ */

const HeroSearch = {
  init() {
    const input = document.getElementById('heroSearch');
    const btn   = document.getElementById('heroSearchBtn');
    if (!input) return;

    // Open modal on Enter
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const q = input.value.trim();
        FricaSearch.open(q || '');
      }
    });

    // Open modal on button click, pass current value
    btn?.addEventListener('click', () => {
      const q = input.value.trim();
      FricaSearch.open(q || '');
    });

    // Suggestion chips (quick searches)
    document.querySelectorAll('[onclick^="doSearch"]').forEach(el => {
      // Already handled via inline onclick, no additional binding needed
    });
  },
};


/* ================================================================
   10. INLINE PAGE SEARCH (countries.html live filter)
================================================================ */

const InlineSearch = {
  /**
   * Initialize an inline search input that filters visible items
   * @param {string} inputId - Input element ID
   * @param {string} gridId  - Grid container ID
   * @param {Function} renderFn - Function(query) that re-renders the grid
   */
  init(inputId, gridId, renderFn) {
    const input = document.getElementById(inputId);
    const clear = document.getElementById(`${inputId}Clear`);
    if (!input) return;

    const debouncedRender = this.debounce(renderFn, 200);

    input.addEventListener('input', () => {
      const q = input.value.trim();
      clear?.classList.toggle('show', !!q);
      debouncedRender(q);
    });

    clear?.addEventListener('click', () => {
      input.value = '';
      clear.classList.remove('show');
      renderFn('');
      input.focus();
    });

    // Highlight matching text within grid items
    input.addEventListener('input', () => {
      setTimeout(() => {
        this.highlightMatches(gridId, input.value.trim());
      }, 250);
    });
  },

  /** Highlight matching text within a container */
  highlightMatches(containerId, query) {
    if (!query) return;
    const container = document.getElementById(containerId);
    if (!container) return;

    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    // Simple implementation — just for country names
    $$('.country-name, .guide-country-name', container).forEach(el => {
      const text = el.textContent;
      if (!text) return;
      const regex   = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      el.innerHTML  = text.replace(regex,
        '<mark style="background:rgba(200,149,42,.2);color:var(--gold-light);border-radius:2px">$1</mark>'
      );
    });
  },

  debounce(fn, delay) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  },
};


/* ================================================================
   11. KEYBOARD NAVIGATION
================================================================ */

const SearchKeyboard = {
  init() {
    document.addEventListener('keydown', (e) => {
      // Arrow nav within search modal
      if (FricaSearch.isOpen) {
        FricaSearch.handleKeyNav(e);
      }

      // Autocomplete navigation
      if (Autocomplete.items.length) {
        if (e.key === 'ArrowDown') { e.preventDefault(); Autocomplete.navigate(1); }
        if (e.key === 'ArrowUp')   { e.preventDefault(); Autocomplete.navigate(-1); }
        if (e.key === 'Enter')     { Autocomplete.selectCurrent(q => FricaSearch.handleInput(q)); }
        if (e.key === 'Escape')    { Autocomplete.hide(); }
      }
    });
  },
};


/* ================================================================
   12. INIT
================================================================ */

function initSearch() {
  FricaSearch.init();
  HeroSearch.init();
  SearchKeyboard.init();
  SearchHistory.init();
}

/* Boot */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSearch);
} else {
  initSearch();
}

/* Expose globals */
window.FricaSearch         = FricaSearch;
window.SearchEngine        = SearchEngine;
window.SearchIndexManager  = SearchIndexManager;
window.SearchHistory       = SearchHistory;
window.ResultRenderer      = ResultRenderer;
window.InlineSearch        = InlineSearch;
window.doSearch            = doSearch;
