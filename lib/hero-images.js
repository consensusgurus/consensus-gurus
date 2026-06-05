// Hero photos for the top-3 tiles on the list overview page.
// Key: list ID -> item name (exact string, parenthetical included) -> either
// a string path/URL, or preferably an object { src, credit, creditUrl }:
//   src       - a remote https image URL (preferred; optimized + cached by
//               next/image at request time, no bytes stored in the repo) or
//               a path under /public for legacy local files.
//   credit    - REQUIRED for new entries; the photo source shown as a small
//               overlay caption on the tile (publication / venue / photographer).
//   creditUrl - where the caption links.
// If a remote URL ever 404s, the tile falls back to the PhotoBox placeholder.
export const HERO_IMAGES = {
  'afterhours-bars-atlanta': {
    'The EARL (East Atlanta Village)': {
      src: 'https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_1600,ar_4:3,g_center,f_auto/Atlanta_TheEarl_AmySinclair-8_xxbo57',
      credit: 'The Infatuation · Amy Sinclair',
      creditUrl: 'https://www.theinfatuation.com/atlanta/reviews/the-earl',
    },
    "Sister Louisa's Church of the Living Room & Ping Pong Emporium (Old Fourth Ward)": {
      src: "https://media.cntraveler.com/photos/5b4e5af4bc8649092721985e/16:9/w_1600%2Cc_limit/Sister-Louisa's-Church-of-the-Living-Room-&-Ping-Pong-Emporium_DAVE-CRAWFORD__2018_DSC05419.jpg",
      credit: 'Condé Nast Traveler · Dave Crawford',
      creditUrl: 'https://www.cntraveler.com/bars/atlanta/sister-louisas-church-of-the-living-room-and-ping-pong-emporium',
    },
    'Our Bar ATL (Old Fourth Ward)': {
      src: 'https://static.wixstatic.com/media/c546f1_4351faeb8b4d4859a5c9ba27a84e689e~mv2.jpg/v1/fill/w_1678,h_800,al_c,q_85/c546f1_4351faeb8b4d4859a5c9ba27a84e689e~mv2.jpg',
      credit: 'Our Bar ATL',
      creditUrl: 'https://www.ourbaratl.com',
    },
  },
  'best-sushi-tampa-bay': {
    'Noble Rice (Channelside, Tampa)': {
      src: 'https://images.squarespace-cdn.com/content/v1/620a7dad1c252a1a17229849/1663617344151-DR3JFXFO4QOZ57DQJVPO/IMG_8129.JPG',
      credit: 'Noble Rice',
      creditUrl: 'https://www.noblericeco.com',
    },
    'SoHo Sushi (South Tampa, Tampa)': {
      src: 'https://tampamagazines.com/wp-content/uploads/2025/12/soho-sushi-spring-2024-055_1-scaled.jpg',
      credit: 'Tampa Magazine',
      creditUrl: 'https://tampamagazines.com/2026-best-restaurants-best-sushi/',
    },
    'Sunda New Asian (Midtown, Tampa)': {
      src: 'https://cdn.bckstg.app/media/4557/menu.jpg',
      credit: 'Sunda New Asian',
      creditUrl: 'https://www.sundanewasian.com',
    },
  },
  'oled-tvs': {
    'Samsung S95F OLED': {
      src: 'https://images.samsung.com/is/image/samsung/p6pim/us/qn65s95fafxza/gallery/us-oled-s95f-qn65s95fafxza-545388077?$product-details-jpg$',
      credit: 'Samsung',
      creditUrl: 'https://www.samsung.com/us/televisions-home-theater/tvs/oled-tvs/65-class-samsung-oled-s95f-qn65s95fafxza/',
    },
    'LG G5 OLED': {
      src: 'https://media.us.lg.com/transform/ecomm-PDPGallery-1100x730/992197d6-b54d-4d46-bad9-5365820c1095/TVs_OLED55G5WUA_gallery_02_3000x3000?io=transform:fill,width:1536',
      credit: 'LG Electronics',
      creditUrl: 'https://www.lg.com/us/tvs/lg-oled65g5wua-oled-4k-tv',
    },
    'Sony Bravia 8 II': {
      src: 'https://sony.scene7.com/is/image/sonyglobalsolutions/TVFY25_BRAVIA8II_PrimaryTout_0pt-image01-d?$originalDimensions$&fmt=png-alpha',
      credit: 'Sony',
      creditUrl: 'https://electronics.sony.com/tv-video/televisions/all-tvs/p/k65xr80m2',
    },
  },
  'pizza-nyc': {
    'L\'Industrie Pizzeria (Williamsburg)': {
      src: 'https://28f718d42dc92b2aa25d.cdn6.editmysite.com/uploads/b/28f718d42dc92b2aa25db0887b7d74305782ccf3a0e80480f93eecbafc0ee56a/TeddyWolff.LIndustrie.NewYorkerSlice.4_Jp8wkfn_1694278184.jpg?width=1280&optimize=medium',
      credit: 'L\'Industrie · Teddy Wolff',
      creditUrl: 'https://www.lindustriebk.com',
    },
    'Lucali (Carroll Gardens)': {
      src: 'https://platform.ny.eater.com/wp-content/uploads/sites/6/chorus/uploads/chorus_asset/file/22552619/1211492460.jpg?quality=90&strip=all&crop=0,13.104817456692,100,73.790365086616',
      credit: 'Eater NY',
      creditUrl: 'https://ny.eater.com',
    },
    'Mama\'s Too (Upper West Side)': {
      src: 'https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_1280,ar_4:3,g_center,f_auto/images/MamasTooWV_KatePrevite_PepperoniSquareSlice_NYC_00005_ljzof0',
      credit: 'The Infatuation · Kate Previte',
      creditUrl: 'https://www.theinfatuation.com/new-york/reviews/mamas-too',
    },
  },
  'best-tom-hardy-movies': {
    'Mad Max: Fury Road': {
      src: 'https://www.rollingstone.com/wp-content/uploads/2018/06/rs-195845-FRD-DS-00668.jpg?w=1581&h=1054&crop=1',
      credit: 'Rolling Stone · Warner Bros.',
      creditUrl: 'https://www.rollingstone.com',
    },
    'Warrior': {
      src: 'https://ew.com/thmb/DZ3G2ZRF8_n597geIgi4Z_RIUTs=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/warrior-63d38fed2beb461f9d767de6e166f1d8.jpg',
      credit: 'Entertainment Weekly · Lionsgate',
      creditUrl: 'https://ew.com',
    },
    'Locke': {
      src: 'https://gcp-na-images.contentstack.com/v3/assets/bltea6093859af6183b/bltb439fb1856e27acb/69868c9136176027d590bb0e/locke2.jpeg?branch=production',
      credit: 'TIME · A24',
      creditUrl: 'https://time.com',
    },
  },
  'best-denzel-washington-movies': {
    'Crimson Tide': {
      src: 'https://www.hollywoodreporter.com/wp-content/uploads/2020/05/crimson_tide_1995_7.jpg?w=1296&h=730&crop=1',
      credit: 'The Hollywood Reporter · Hollywood Pictures',
      creditUrl: 'https://www.hollywoodreporter.com',
    },
    'Malcolm X': {
      src: 'https://gcp-na-images.contentstack.com/v3/assets/bltea6093859af6183b/blt94f1eb2710276478/698a3ef8011682b082983463/top-100-movies-1990s-malcolmx.jpg?branch=production',
      credit: 'TIME · Warner Bros.',
      creditUrl: 'https://time.com',
    },
    'Training Day': {
      src: 'https://www.hollywoodreporter.com/wp-content/uploads/2016/09/training_day_-_h_-_2001.jpg?w=1296&h=730&crop=1',
      credit: 'The Hollywood Reporter · Warner Bros.',
      creditUrl: 'https://www.hollywoodreporter.com',
    },
    'Glory': {
      src: 'https://ew.com/thmb/70m87zMUWhCgPcRjVoolEGZASuQ=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/msdglor_ec018-2000-fafabf98145d4049ad41372418e6fd8e.jpg',
      credit: 'Entertainment Weekly · TriStar Pictures',
      creditUrl: 'https://ew.com',
    },
  },
  'best-robin-williams-movies': {
    'Aladdin': {
      src: 'https://media-cldnry.s-nbcnews.com/image/upload/t_fit-760w,f_auto,q_auto:best/newscms/2015_42/822761/robin-williams-aladdin-genie-today-tease-151016.jpg',
      credit: 'TODAY · Disney',
      creditUrl: 'https://www.today.com',
    },
    'Insomnia': {
      src: 'https://i.guim.co.uk/img/static/sys-images/Guardian/Pix/audio/video/2014/8/21/1408629682437/Al-Pacino-and-Robin-Willi-010.jpg?width=465&dpr=1&s=none&crop=none',
      credit: 'The Guardian · Warner Bros.',
      creditUrl: 'https://www.theguardian.com',
    },
    'Good Will Hunting': {
      src: 'https://static.independent.co.uk/s3fs-public/thumbnails/image/2014/08/12/08/robin-williams-7.jpg',
      credit: 'The Independent · Miramax',
      creditUrl: 'https://www.independent.co.uk',
    },
    'Dead Poets Society': {
      src: 'https://cdn.theatlantic.com/thumbor/fxR5aRveoUZJCt3JoF-DxTbNwyc=/0x67:1214x750/960x540/media/img/mt/2014/02/Dear_poets_society/original.jpg',
      credit: 'The Atlantic · Touchstone Pictures',
      creditUrl: 'https://www.theatlantic.com',
    },
    'Good Morning, Vietnam': {
      src: 'https://s.abcnews.com/images/Entertainment/robin-williams-good-morning-vietnam-2-gty-thg-180719_hpEmbed_7x9_992.jpg',
      credit: 'ABC News · Touchstone Pictures',
      creditUrl: 'https://abcnews.go.com',
    },
  },
  'best-matt-damon-movies': {
    'True Grit': {
      src: 'https://onceuponatimeinawestern.com/wp-content/uploads/2015/06/Matt-Damon-as-LaBoeuf-meeting-Mattie-Ross-for-the-first-time-in-True-Grit-2010.jpg',
      credit: 'Once Upon a Time in a Western · Paramount Pictures',
      creditUrl: 'https://onceuponatimeinawestern.com',
    },
    'Saving Private Ryan': {
      src: 'https://ew.com/thmb/hXirYe4etmhfJbmU5dL9d0tXF3c=/2000x0/filters:no_upscale():max_bytes(150000):strip_icc()/saving-private-ryan-matt-damon-060524-1-27570d4206364916891172e478add38c.jpg',
      credit: 'Entertainment Weekly · DreamWorks',
      creditUrl: 'https://ew.com',
    },
    'Good Will Hunting': {
      src: 'https://ychef.files.bbci.co.uk/1280x720/p02knxnj.jpg',
      credit: 'BBC · Miramax',
      creditUrl: 'https://www.bbc.com',
    },
    'The Martian': {
      src: 'https://variety.com/wp-content/uploads/2015/08/matt-damon-the-martian.jpg?w=1000',
      credit: 'Variety · 20th Century Fox',
      creditUrl: 'https://variety.com',
    },
    'The Departed': {
      src: 'https://m.media-amazon.com/images/M/MV5BOWZmNGQyMjktZDE5MS00N2RmLWE5ZmQtOWZkNTc3M2NhMDIwXkEyXkFqcGc@._V1_.jpg',
      credit: 'IMDb · Warner Bros.',
      creditUrl: 'https://www.imdb.com',
    },
  },
  'best-ben-affleck-movies': {
    'Dazed and Confused': {
      src: 'https://m.media-amazon.com/images/M/MV5BMWY3YTMwYTctY2ZkMC00NGZmLWFlNWEtMmRlM2U1NTQ5YzAzXkEyXkFqcGc@._V1_.jpg',
      credit: 'IMDb · Gramercy Pictures',
      creditUrl: 'https://www.imdb.com',
    },
    'Good Will Hunting': {
      src: 'https://static0.colliderimages.com/wordpress/wp-content/uploads/2020/04/good-will-hunting-ben-affleck-matt-damon.jpg',
      credit: 'Collider · Miramax',
      creditUrl: 'https://collider.com',
    },
    'Argo': {
      src: 'https://static01.nyt.com/images/2012/10/12/arts/12ARGO_SPAN/12ARGO-superJumbo.jpg',
      credit: 'The New York Times · Warner Bros.',
      creditUrl: 'https://www.nytimes.com',
    },
    'Gone Girl': {
      src: 'https://static.guim.co.uk/sys-images/Guardian/Pix/audio/video/2014/10/2/1412269707000/Ben-Affleck-in-Gone-Girl-019.jpg',
      credit: 'The Guardian · 20th Century Fox',
      creditUrl: 'https://www.theguardian.com',
    },
  },
  'best-meryl-streep-movies': {
    'Little Women': {
      src: 'https://cdn.mos.cms.futurecdn.net/earfktJaczuHfkNaVU97hU-1200-80.jpg',
      credit: 'CinemaBlend · Sony Pictures',
      creditUrl: 'https://www.cinemablend.com',
    },
    'Adaptation': {
      src: 'https://images.squarespace-cdn.com/content/v1/5aa69ee35ffd2038888cd0de/1545486984986-AZNW26NLGQCTZMOVQXAA/unnamed-78.jpg',
      credit: 'The Film Experience · Sony Pictures',
      creditUrl: 'https://thefilmexperience.net',
    },
    "Sophie's Choice": {
      src: 'https://m.media-amazon.com/images/M/MV5BMjIwNzQwNzAzNF5BMl5BanBnXkFtZTcwMDI3MDI0Nw@@._V1_.jpg',
      credit: 'IMDb · Universal Pictures',
      creditUrl: 'https://www.imdb.com',
    },
    'Kramer vs. Kramer': {
      src: 'https://www.hollywoodreporter.com/wp-content/uploads/2019/11/kramer_vs._kramer_still.jpg?w=1296&h=730&crop=1',
      credit: 'The Hollywood Reporter · Columbia Pictures',
      creditUrl: 'https://www.hollywoodreporter.com',
    },
    'The Devil Wears Prada': {
      src: 'https://variety.com/wp-content/uploads/2026/04/MCDDEWE_WD012.jpg?w=1000&h=667&crop=1',
      credit: 'Variety · 20th Century Fox',
      creditUrl: 'https://variety.com',
    },
  },
  'best-jodie-foster-movies': {
    'The Silence of the Lambs': {
      src: 'https://m.media-amazon.com/images/M/MV5BMDQ0ZTAzZDYtZTdmMi00ZjA5LTgxMjctNzVhZWVhMDE1MTQyXkEyXkFqcGc@._V1_.jpg',
      credit: 'IMDb · Orion Pictures',
      creditUrl: 'https://www.imdb.com',
    },
    'Taxi Driver': {
      src: 'https://variety.com/wp-content/uploads/2025/11/taxi-driver.jpg?w=1000&h=667&crop=1',
      credit: 'Variety · Columbia Pictures',
      creditUrl: 'https://variety.com',
    },
    'The Accused': {
      src: 'https://www.eastman.org/sites/default/files/styles/gallery_large/public/0505%20-%20five_TheAccusedB_PF.jpg?itok=s6mGEYYK&timestamp=1680983052',
      credit: 'George Eastman Museum · Paramount Pictures',
      creditUrl: 'https://www.eastman.org',
    },
  },
  'greek-islands-not-mykonos-santorini': {
    "Crete (Greece's largest island)": {
      src: 'https://images.pexels.com/photos/29399456/pexels-photo-29399456.jpeg?auto=compress&cs=tinysrgb&w=1920',
      credit: 'Pexels · Dzmitry Charnou',
      creditUrl: 'https://www.pexels.com/photo/29399456/',
    },
    'Hydra (Saronic Islands)': {
      src: 'https://i.guim.co.uk/img/media/c1b8c92c87979959955e901c451bde3d7b083441/0_187_5660_3398/master/5660.jpg?width=1200&quality=85&auto=format&fit=max&s=195a6b69de032aa8a0cec125ef413a20',
      credit: 'The Guardian',
      creditUrl: 'https://www.theguardian.com/travel',
    },
    'Paros (Cyclades)': {
      src: 'https://thewanderbug.com/wp-content/uploads/2019/08/Naoussa-Paros-hero_1.jpg',
      credit: 'The Wanderbug',
      creditUrl: 'https://thewanderbug.com',
    },
  },
  "no-budget-dinners-nyc": {
    "Le Bernardin (Midtown)": {
      src: "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_1280,ar_4:3,g_center,f_auto/images/DAL04623_zoorfe",
      credit: "The Infatuation · David A. Lee",
      creditUrl: "https://www.theinfatuation.com/new-york/reviews/le-bernardin",
    },
    "Atomix (NoMad)": {
      src: "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_1280,ar_4:3,g_center,f_auto/images/NYC_Atomix_FoodGroup_KatePrevite_00001_noi2jz",
      credit: "The Infatuation · Kate Previte",
      creditUrl: "https://www.theinfatuation.com/new-york/reviews/atomix",
    },
    "Sushi Sho (Midtown East)": {
      src: "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_1280,ar_4:3,g_center,f_auto/images/sushisho_ny_009_eyouol",
      credit: "The Infatuation · Sushi Sho",
      creditUrl: "https://www.theinfatuation.com/new-york/reviews/sushi-sho",
    },
  },
  'food-trucks-manhattan': {
    'Birria-Landia (Lower East Side)': {
      src: 'https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_1200,ar_4:3,g_center,f_auto/cms/guides/the-best-food-trucks-carts-in-nyc/AdamFriedlander.NYC.BirriaLandia.Exterior.002',
      credit: 'The Infatuation · Adam Friedlander',
      creditUrl: 'https://www.theinfatuation.com/new-york/guides/the-best-food-trucks-and-carts-in-nyc',
    },
    "DiSO's Italian Sandwich Society (Midtown)": {
      src: 'https://disosnyc.com/wp-content/uploads/2021/01/about-diso-1.jpg',
      credit: "DiSO's Italian Sandwich Society",
      creditUrl: 'https://disosnyc.com/',
    },
    "Billy's Hot Dog Cart (Upper West Side)": {
      src: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/29/a3/d4/39/caption.jpg?w=900&h=500&s=1',
      credit: 'Tripadvisor',
      creditUrl: 'https://www.tripadvisor.com/Restaurant_Review-g60763-d25453703-Reviews-Billy_s_Hot_Dog_Cart-New_York_City_New_York.html',
    },
  },
  "no-budget-dinners-london": {
    "The Ledbury (Notting Hill)": {
      src: "https://www.nationalrestaurantawards.co.uk/filestore/jpg/Ledbury20234.jpg",
      credit: "National Restaurant Awards",
      creditUrl: "https://www.nationalrestaurantawards.co.uk/profile/the-ledbury/",
    },
    "Da Terra (Bethnal Green)": {
      src: "https://www.daterra.co.uk/wp-content/uploads/2023/02/DaTerra-JustinDeSouza-25-683x1024.jpg",
      credit: "Da Terra · Justin De Souza",
      creditUrl: "https://daterra.co.uk",
    },
    "Kitchen Table (Fitzrovia)": {
      src: "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_1280,ar_4:3,g_center,f_auto/cms/reviews/kitchen-table/banners/1492385790.86",
      credit: "The Infatuation · Karolina Wiercigroch",
      creditUrl: "https://www.theinfatuation.com/london/reviews/kitchen-table",
    },
  },
  "no-budget-dinners-paris": {
    "Guy Savoy (Monnaie de Paris)": {
      src: "https://elitetraveler.com/wp-content/uploads/sites/8/2022/09/SalonBellesBacchantesdressagegrandestablesLaurenceMouton-min.jpg",
      credit: "Elite Traveler · Laurence Mouton",
      creditUrl: "https://elitetraveler.com/finest-dining/best-restaurants-in-paris",
    },
    "Kei (1st Arr.)": {
      src: "https://elitetraveler.com/wp-content/uploads/sites/8/2022/09/Kei4-211039BD.jpg",
      credit: "Elite Traveler · Richard Haughton",
      creditUrl: "https://elitetraveler.com/finest-dining/best-restaurants-in-paris",
    },
    "Épicure (Le Bristol, 8th Arr.)": {
      src: "https://elitetraveler.com/wp-content/uploads/sites/8/2022/09/EpicureCarteChefArnaudFaye-Rougetdemediterranee-1-ThomasDhellemmes_Fr53u-min.jpeg",
      credit: "Elite Traveler · Thomas Dhellemmes",
      creditUrl: "https://elitetraveler.com/finest-dining/best-restaurants-in-paris",
    },
  },
  'mechanical-keyboards': {
    'Ducky OK-M': {
      src: 'https://m.media-amazon.com/images/I/71xZkjcT61L._AC_SL1200_.jpg',
      credit: 'Ducky',
      creditUrl: 'https://www.amazon.com/dp/B0GKCS2WFP?tag=cgurus-20',
    },
    'SteelSeries Apex Pro': {
      src: 'https://m.media-amazon.com/images/I/71HmUNj01VL._AC_SL1200_.jpg',
      credit: 'SteelSeries',
      creditUrl: 'https://www.amazon.com/dp/B07SVJJCP3?tag=cgurus-20',
    },
    'Keychron Q6 HE': {
      src: 'https://cdn.shopify.com/s/files/1/0059/0630/1017/files/Keychron-Q6-HE-Wireless-QMK-Custom-Magnetic-Switch-Keyboard.jpg?v=1734317387',
      credit: 'Keychron',
      creditUrl: 'https://www.keychron.com/products/keychron-q6-he-qmk-wireless-custom-keyboard',
    },
  },
  'best-breweries-nyc-subway': {
    'SingleCut Beersmiths (Astoria)': {
      src: 'https://images.squarespace-cdn.com/content/v1/667191b8bce4971321367e54/cdc18c70-6195-4226-a0fa-d845d777ada7/QNS+Tap+roo.jpg',
      credit: 'SingleCut Beersmiths',
      creditUrl: 'https://www.singlecut.com/tap-rooms',
    },
    'Other Half Brewing (Gowanus)': {
      src: 'https://craftpeak-cooler-images.imgix.net/other-half-brewing/Other-Half-Brewing-Brooklyn-NY.jpg?auto=compress%2Cformat&fit=scale&h=1366&ixlib=php-3.3.1&w=2048&wpsize=2048x2048&s=aad27d3ffbff78272a8bd505c49c8ab4',
      credit: 'Other Half Brewing',
      creditUrl: 'https://otherhalfbrewing.com/location/centre-street/',
    },
    'Evil Twin Brewing (Ridgewood)': {
      src: 'https://craftpeak-cooler-images.imgix.net/evil-twin-brewing-nyc/676958F2-D69E-4FA3-990A-45EF28FD3D9F-scaled.jpeg?auto=compress%2Cformat&ixlib=php-3.3.1&s=67fffd85c84750410d6bffcbb904f0d3',
      credit: 'Evil Twin Brewing NYC',
      creditUrl: 'https://eviltwin.nyc/',
    },
  },
  'best-burgers-outside-usa': {
    'Hundred Burgers (Valencia, Spain)': {
      src: 'https://www.telegraph.co.uk/content/dam/world-news/2024/09/11/TELEMMGLPICT000393463362_17260751153940_trans_NvBQzQNjv4Bqeo_i_u9APj8RuoebjoAHt-a-90u71-_kcfkywl_shTM.jpeg',
      credit: 'The Telegraph',
      creditUrl: 'https://www.telegraph.co.uk/world-news/2024/09/11/america-loses-its-crown-as-home-of-the-worlds-best-burger/',
    },
    'Black Bear Burger (London, UK)': {
      src: 'https://images.squarespace-cdn.com/content/v1/5ff08cf466132f51ded9c10d/33368f00-20ee-4b6b-9bbd-01895672620b/Where-to-eat-in-exmouth-market.jpg',
      credit: 'Black Bear Burger',
      creditUrl: 'https://www.blackbearburger.com/',
    },
    'Bleecker (London, UK)': {
      src: 'https://media.timeout.com/images/106320215/1920/1080/image.jpg',
      credit: 'Time Out',
      creditUrl: 'https://www.timeout.com/london/restaurants/bleecker-burger',
    },
  },
  'florida-college-dive-bars': {
    'Salty Dog Saloon (UF)': {
      src: 'https://saltydogsaloon.com/wp-content/uploads/2026/02/salty-dog-saloon-9.png',
      credit: 'Salty Dog Saloon',
      creditUrl: 'https://saltydogsaloon.com/',
    },
    'Balls (UF)': {
      src: 'https://static.where-e.com/United_States/Balls_742f483419d8f86b7d3053222b77ebfc.jpg',
      credit: 'Wheree',
      creditUrl: 'https://wheree.com/',
    },
    "Potbelly's (FSU)": {
      src: 'https://images.squarespace-cdn.com/content/v1/5c5b66e751f4d44f83c023e5/1549509262314-1VZVNER1UJ2Q535UY8U7/Potbelly%27s+Bar+-+Tallahassee%2C+FL',
      credit: "Potbelly's",
      creditUrl: 'https://www.potbellys.com/',
    },
  },
  'resorts-caribbean': {
    'Jade Mountain (Soufri\u00e8re, St. Lucia)': {
      src: 'https://www.jademountain.com/images/home-bottom-aerial.jpeg',
      credit: 'Jade Mountain',
      creditUrl: 'https://www.jademountain.com/',
    },
    'Jumby Bay Island (Antigua)': {
      src: 'https://images.eu.ctfassets.net/og3b0tarlg4b/4w3emqH8kAaDZ4XWjfdirO/a84471f5e171ee1cc4cd0739b4e7eca4/Jumby_Bay_beach_tsKvh.jpg?w=3200&h=2380&fm=jpg&fit=fill',
      credit: 'Oetker Collection',
      creditUrl: 'https://www.oetkerhotels.com/hotels/jumby-bay-island/',
    },
    'Baoase Luxury Resort (Willemstad, Curacao)': {
      src: 'https://baoase.com/wp-content/uploads/2023/01/Culinary-Beach-Restaurant-scaled.jpg',
      credit: 'Baoase Luxury Resort',
      creditUrl: 'https://baoase.com/',
    },
  },
  'greek-isles-hotels': {
    'Kalesma Mykonos (Aleomandra, Mykonos)': {
      src: 'https://theluxurytravelexpert.com/wp-content/uploads/2024/10/kalesma-mykonos-hotel-review.jpg',
      credit: 'The Luxury Travel Expert',
      creditUrl: 'https://theluxurytravelexpert.com/review-kalesma-mykonos/',
    },
    'Grace Hotel Santorini, Auberge Resorts Collection (Imerovigli, Santorini)': {
      src: 'https://dreffui1gbt6t.cloudfront.net/images/gra/SAN_Exteriors_Pool_2024_14.jpg',
      credit: 'Auberge Resorts Collection',
      creditUrl: 'https://auberge.com/grace-hotel/',
    },
    'Perivolas (Oia, Santorini)': {
      src: 'https://perivolas.gr/wp-content/uploads/2024/08/P-1-2280x1400-1.jpg',
      credit: 'Perivolas',
      creditUrl: 'https://perivolas.gr/perivolas-infinity-pool/',
    },
  },
  'live-music-nyc': {
    'Bowery Ballroom (Lower East Side)': {
      src: 'https://mercuryeastpresents.com/wp-content/uploads/2024/02/2021Aug06_BoweryBallroom_2052_Main-Area_4.jpg',
      credit: 'Mercury East Presents',
      creditUrl: 'https://mercuryeastpresents.com/bowery-ballroom/',
    },
    'Mercury Lounge (Lower East Side)': {
      src: 'https://mercuryeastpresents.com/wp-content/uploads/2024/02/2023Jul06_MercuryLounge_2053_-Labate_Main-Area_1-scaled.jpg',
      credit: 'Mercury East Presents',
      creditUrl: 'https://mercuryeastpresents.com/mercurylounge/',
    },
    'Birdland Jazz Club (Theater District)': {
      src: 'https://www.birdlandjazz.com/wp-content/uploads/2026/02/rintober.jpg',
      credit: 'Birdland Jazz Club',
      creditUrl: 'https://www.birdlandjazz.com/',
    },
  },
  'pool-table-bars-lower-manhattan': {
    'Cellar Dog (West Village)': {
      src: 'https://images.squarespace-cdn.com/content/v1/601c3491da799d0ee81fef3d/173ed557-30ca-4073-addc-071b1364f3be/tempImage9mGmvh.jpg',
      credit: 'Cellar Dog',
      creditUrl: 'https://www.cellardog.net/',
    },
    'Amsterdam Billiards Club (East Village)': {
      src: 'https://media.timeout.com/images/100488733/image.jpg',
      credit: 'Time Out',
      creditUrl: 'https://www.timeout.com/newyork/bars/amsterdam-billiards-club',
    },
    "Sadie's Ward (Lower East Side)": {
      src: 'https://cdn-images-1.medium.com/max/800/0*d_cJE1NqhC2RFtu0.jpg',
      credit: 'ChalkySticks',
      creditUrl: 'https://www.chalkysticks.com/',
    },
  },
  'sec-dive-bars': {
    'The Houndstooth (Alabama)': {
      src: 'https://assets3.thrillist.com/v1/image/1168372/1200x600/scale;;webp=auto;jpeg_quality=85.jpg',
      credit: 'Thrillist',
      creditUrl: 'https://www.thrillist.com/',
    },
    'The Chimes (LSU)': {
      src: 'https://gardenandgun.com/wp-content/uploads/2020/01/chimes1.jpg',
      credit: 'Garden & Gun',
      creditUrl: 'https://gardenandgun.com/',
    },
    'Sideways (Arkansas)': {
      src: 'https://s3-media0.fl.yelpcdn.com/bphoto/3ijWDubj4Sul9bnOvKOEag/o.jpg',
      credit: 'Yelp',
      creditUrl: 'https://www.yelp.com/biz/sideways-fayetteville',
    },
  },
  'travel-strollers-double': {
    'Joovy Kooper X2': {
      src: 'https://m.media-amazon.com/images/I/51llRi3ziGL._AC_SL1500_.jpg',
      credit: 'Amazon',
      creditUrl: 'https://www.amazon.com/dp/B07PJMB6GF?tag=cgurus-20',
    },
    'Delta Children LX Side-by-Side': {
      src: 'https://m.media-amazon.com/images/I/71nbFzIgEjL._AC_SL1500_.jpg',
      credit: 'Amazon',
      creditUrl: 'https://www.amazon.com/dp/B00GJIXP5O?tag=cgurus-20',
    },
    'UPPAbaby G-Link V2': {
      src: 'https://www.destinationbabykids.com/cdn/shop/files/uppababy-glink-black.png?v=1723782527&width=2890',
      credit: 'UPPAbaby',
      creditUrl: 'https://uppababy.com/',
    },
  },
  'bakeries-nyc': {
    'Radio Bakery (Greenpoint)': {
      src: 'https://greenpointers.com/wp-content/uploads/2023/02/pastry-.jpg',
      credit: 'Greenpointers',
      creditUrl: 'https://greenpointers.com/',
    },
    "Dolly's (Bed-Stuy)": {
      src: 'https://res.cloudinary.com/the-infatuation/image/upload/f_auto/q_auto/v1738526946/images/NYC_DollysCoffeeShop_UbeMorningBun_KatePrevite_00002_oueptg.jpg',
      credit: 'The Infatuation / Kate Previte',
      creditUrl: 'https://www.theinfatuation.com/new-york/reviews/dollys-coffee-shop',
    },
    "Hani's Bakery (East Village)": {
      src: 'https://platform.ny.eater.com/wp-content/uploads/sites/6/chorus/uploads/chorus_asset/file/25742119/2024_11_15_Apple_Oatmeal_Scone_mark_weinberg_0216.jpg?quality=90&strip=all&crop=0,0,100,100',
      credit: 'Eater NY / Mark Weinberg',
      creditUrl: 'https://ny.eater.com/',
    },
  },
  'pacific-ocean-resorts': {
    'Four Seasons Resort Bora Bora (French Polynesia)': {
      src: 'https://www.fourseasons.com/alt/img-opt/~70.1920.1384,0000-0,0000-1616,0000-909,0000/publish/content/dam/fourseasons/images/web/BOR/BOR_1614_original.jpg',
      credit: 'Four Seasons',
      creditUrl: 'https://www.fourseasons.com/borabora/',
    },
    'The St. Regis Bora Bora Resort (French Polynesia)': {
      src: 'https://cache.marriott.com/content/dam/marriott-renditions/BOBXR/bobxr-aerial-9657-hor-wide.jpg?output-quality=70&interpolation=progressive-bilinear&downsize=1920px:*',
      credit: 'The St. Regis Bora Bora',
      creditUrl: 'https://www.marriott.com/en-us/hotels/bobxr-the-st-regis-bora-bora-resort/overview/',
    },
    'Conrad Bora Bora Nui (French Polynesia)': {
      src: 'https://www.hilton.com/im/en/PPTBNCI/3538941/7-conrad-bora-bora-nui-pool-ow-1.jpg?impolicy=resize&rh=1080&rw=1920',
      credit: 'Conrad Bora Bora Nui',
      creditUrl: 'https://www.hilton.com/en/hotels/pptbnci-conrad-bora-bora-nui/',
    },
  },
  'breakfast-sandwiches-hamptons': {
    'Bonfire Coffeehouse (East Hampton)': {
      src: 'https://timesreview-images.s3.amazonaws.com/wp-content/uploads/sites/12/2025/05/bonefire-coffeehouse-1024x768.jpeg',
      credit: 'Southforker',
      creditUrl: 'https://southforker.com/',
    },
    "Carissa's The Bakery (East Hampton)": {
      src: 'https://s3-media0.fl.yelpcdn.com/bphoto/m2xh2Xt8Akqo9qHbJTPH3w/o.jpg',
      credit: 'Yelp',
      creditUrl: 'https://www.yelp.com/biz/carissas-the-bakery-east-hampton',
    },
    "Goldberg's Famous Bagels (Multiple Locations)": {
      src: 'https://hamptons-social.com/wp-content/uploads/2019/08/Goldbergs21231599_124700541513874_5788191854108384602_n-e1565190975804.jpg',
      credit: 'Hamptons Social',
      creditUrl: 'https://hamptons-social.com/',
    },
  },
  'prestigious-boarding-schools': {
    'Phillips Exeter Academy (Exeter, New Hampshire)': {
      src: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Phillips_Exeter_Academy.jpg',
      credit: 'Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Phillips_Exeter_Academy.jpg',
    },
    'Phillips Academy Andover (Andover, Massachusetts)': {
      src: 'https://upload.wikimedia.org/wikipedia/commons/c/c0/Phillips_Academy%2C_Andover%2C_MA_-_Samuel_Phillips_Hall.JPG',
      credit: 'Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Phillips_Academy,_Andover,_MA_-_Samuel_Phillips_Hall.JPG',
    },
    'The Lawrenceville School (Lawrenceville, New Jersey)': {
      src: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Edith_Memorial_Chapel%2C_Lawrenceville_School_%28Lawrenceville%2C_NJ%29.JPG',
      credit: 'Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Edith_Memorial_Chapel,_Lawrenceville_School_(Lawrenceville,_NJ).JPG',
    },
  },
  'travel-monitors': {
    'Espresso 17 Pro': {
      src: 'https://m.media-amazon.com/images/I/41h-pzxfQfL._AC_SL1500_.jpg',
      credit: 'Amazon',
      creditUrl: 'https://www.amazon.com/dp/B0FHNMFCWD?tag=cgurus-20',
    },
    'ViewSonic VX1655-4K-OLED': {
      src: 'https://m.media-amazon.com/images/I/61kK+Nq74OL._AC_SL1500_.jpg',
      credit: 'Amazon',
      creditUrl: 'https://www.amazon.com/dp/B0CDJF17G5?tag=cgurus-20',
    },
    'Espresso Display 15 Touch': {
      src: 'https://m.media-amazon.com/images/I/51UwJCNIMzL._AC_SL1500_.jpg',
      credit: 'Amazon',
      creditUrl: 'https://amzn.to/4uwq87F',
    },
    'ViewSonic VP16-OLED': {
      src: 'https://m.media-amazon.com/images/I/715v0rlApBL._AC_SL1500_.jpg',
      credit: 'Amazon',
      creditUrl: 'https://www.amazon.com/dp/B0BJXRZ5C6?tag=cgurus-20',
    },
  },
  'best-air-fryer-cookbooks': {
    'The Skinnytaste Air Fryer Cookbook (Gina Homolka)': {
      src: 'https://m.media-amazon.com/images/I/918eAhGq4hL._SL1500_.jpg',
      credit: 'Amazon',
      creditUrl: 'https://www.amazon.com/dp/198482564X?tag=cgurus-20',
    },
    'Air Fryer Perfection (America\'s Test Kitchen)': {
      src: 'https://m.media-amazon.com/images/I/51idmjjVnfL._SL1500_.jpg',
      credit: 'Amazon',
      creditUrl: 'https://www.amazon.com/dp/1954210841?tag=cgurus-20',
    },
    'The I Love My Air Fryer Recipe Book (Robin Donovan)': {
      src: 'https://m.media-amazon.com/images/I/51w3+W7ERkL._SL1500_.jpg',
      credit: 'Amazon',
      creditUrl: 'https://www.amazon.com/dp/1507221983?tag=cgurus-20',
    },
  },
  "no-budget-dinners-miami": {
    "Ogawa (Little River)": {
      src: "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_1280,ar_4:3,g_center,f_auto/Ogawa_Interior_Cleveland_Miami-2_rmtnn8",
      credit: "The Infatuation · Cleveland Jennings",
      creditUrl: "https://www.theinfatuation.com/miami/guides/best-sushi-omakase-restaurants-miami",
    },
    "Shingo (Coral Gables)": {
      src: "https://media.timeout.com/images/106005391/750/422/image.jpg",
      credit: "Time Out Miami",
      creditUrl: "https://www.timeout.com/miami/restaurants/shingo",
    },
    "Cote Miami (Design District)": {
      src: "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_1280,ar_4:3,g_center,f_auto/cms/guides/the-best-restaurants-in-the-design-district/World_Red_Eye_-_Lifestyle_1",
      credit: "The Infatuation · World Red Eye",
      creditUrl: "https://www.theinfatuation.com/miami/reviews/cote-miami",
    },
  },
  'best-beach-clubs-mediterranean': {
    'Club 55 (Saint-Tropez, France)': {
      src: 'https://cornichewatches.com/wp-content/uploads/2024/03/Photo-by-Els-1.jpg',
      credit: 'Corniche Watches',
      creditUrl: 'https://cornichewatches.com',
    },
    'La Fontelina (Capri, Italy)': {
      src: 'https://www.fontelina-capri.com/images/1z.jpg',
      credit: 'La Fontelina',
      creditUrl: 'https://www.fontelina-capri.com',
    },
    'Nammos (Mykonos, Greece)': {
      src: 'https://www.nammos.com/sites/default/files/2021-11/nammos_mykonos_gallery_9_0.jpg',
      credit: 'Nammos',
      creditUrl: 'https://www.nammos.com',
    },
  },
  'three-martini-lunch-manhattan': {
    'The Grill (Midtown)': {
      src: 'https://images.ctfassets.net/7mbidstwva6z/2IfaoYr2se3z7RTmdluQKE/c9b6ed8ccea475ed9bb8cc3511b663bf/empty_dining_room.jpg?w=2400&h=1601&fl=progressive&q=50&fm=jpg',
      credit: 'The Grill',
      creditUrl: 'https://thegrillnewyork.com',
    },
    'Torrisi Bar & Restaurant (Nolita)': {
      src: 'https://cdn.sanity.io/images/gb1p0gbj/production/8cf300f09e452b234678f59a9a36f734a092b35a-750x547.jpg',
      credit: 'Torrisi',
      creditUrl: 'https://torrisinyc.com',
    },
    'Ci Siamo (Hudson Yards)': {
      src: 'https://images.squarespace-cdn.com/content/v1/64c00f77b8606a4df6a14972/6c04aae7-ed6f-438c-ac3b-9f56de3eef2b/2021-10-18-USHG-CiSiamo-ReadMcKendree-0222_V1.jpg',
      credit: 'USHG · Read McKendree',
      creditUrl: 'https://www.cisiamonyc.com',
    },
  },
  'headphones-overear': {
    'Sony WH-1000XM6': {
      src: 'https://m.media-amazon.com/images/I/61ddahpESML.jpg',
      credit: 'Amazon',
      creditUrl: 'https://www.amazon.com',
    },
    'Bose QuietComfort Ultra Headphones (2nd Gen)': {
      src: 'https://m.media-amazon.com/images/I/51ocyQ+ItKL.jpg',
      credit: 'Amazon',
      creditUrl: 'https://www.amazon.com',
    },
    'Sennheiser HDB 630': {
      src: 'https://m.media-amazon.com/images/I/71-hmb+dXbL.jpg',
      credit: 'Amazon',
      creditUrl: 'https://www.amazon.com',
    },
  },
  'miami-beach-hotels': {
    'Four Seasons Hotel at The Surf Club (Surfside)': {
      src: 'https://www.fourseasons.com/alt/img-opt/~75.701.0,0000-281,2500-3000,0000-1687,5000/publish/content/dam/fourseasons/images/web/MFL/MFL_1371_original.jpg',
      credit: 'Four Seasons',
      creditUrl: 'https://www.fourseasons.com/surfside/',
    },
    'Faena Hotel Miami Beach (Mid-Beach)': {
      src: 'https://www.faena.com/sites/default/files/styles/split_callout_d/public/media/image/_MG_7782.jpg?h=16618d07&itok=AJ6-F8qs',
      credit: 'Faena',
      creditUrl: 'https://www.faena.com',
    },
    'The Setai (South Beach)': {
      src: 'https://symphony.cdn.tambourine.com/the-setai-miami-beach/media/thesetai-homepage-intro-63190cecdb462.webp',
      credit: 'The Setai',
      creditUrl: 'https://www.thesetaihotel.com',
    },
  },
  'best-aman-resorts-world': {
    'Amanoi (Vinh Hy Bay, Vietnam)': {
      src: 'https://thehealthyholidaycompany.co.uk/wp-content/uploads/2018/08/Aerial-view-of-Central-Pavilion-and-Cliff-Pool-on-the-hilltop_High-Res_15146.jpg',
      credit: 'The Healthy Holiday Company · Aman',
      creditUrl: 'https://thehealthyholidaycompany.co.uk',
    },
    'Amangiri (Canyon Point, Utah)': {
      src: 'https://www.aman.com/sites/default/files/styles/full_size_browser%402x/public/2024-05/amangiri_utah_-_main_pool.jpg?itok=_tjth25U',
      credit: 'Aman',
      creditUrl: 'https://www.aman.com/resorts/amangiri',
    },
    'Amanyara (Turks & Caicos)': {
      src: 'https://www.aman.com/sites/default/files/2022-04/AMANYARA_Beach_1_DJI_0595-Edit-4.jpg',
      credit: 'Aman',
      creditUrl: 'https://www.aman.com/resorts/amanyara',
    },
  },
  'home-espresso-machines': {
    'Rocket R58': {
      src: 'https://m.media-amazon.com/images/I/71DPuEv-6fL.jpg',
      credit: 'Amazon',
      creditUrl: 'https://www.amazon.com',
    },
    'Lelit Bianca V3': {
      src: 'https://assets.breville.com/cdn-cgi/image/width=1300,format=auto/Lelit/PESBN03/PESBN03PSS1BXX1.png?pdp',
      credit: 'Lelit',
      creditUrl: 'https://lelit.com',
    },
    'ECM Synchronika': {
      src: 'https://www.ecm.de/wp-content/uploads/2025/04/ECM_Synchronika_II-frontal-768x504-1.jpg',
      credit: 'ECM',
      creditUrl: 'https://www.ecm.de',
    },
  },
  'caesar-wraps-nyc': {
    'Milano Market (multiple locations)': {
      src: 'https://pyxis.nymag.com/v1/imgs/00b/129/a3aee05d060baae80dd6fb9111134c8148-milano-market.2x.rhorizontal.w700.jpg',
      credit: 'Grub Street',
      creditUrl: 'https://www.grubstreet.com',
    },
    'Jacob\'s Pickles (Upper West Side)': {
      src: 'https://s3-media0.fl.yelpcdn.com/bphoto/e9Wm__w-ptGPOWSWS8sw-Q/o.jpg',
      credit: 'Yelp',
      creditUrl: 'https://www.yelp.com',
    },
    'Bobwhite Counter (multiple locations)': {
      src: 'https://pyxis.nymag.com/v1/imgs/69f/0f1/84f1e98fe6daecb49de2df518f384bc9d9-bob-white-counter.rhorizontal.w900.jpg',
      credit: 'Grub Street',
      creditUrl: 'https://www.grubstreet.com',
    },
  },
  'cocktails-williamsburg': {
    'Maison Premiere': {
      src: 'https://media.cntraveler.com/photos/5851cb6b053d277e273da5ab/16:9/w_2560%2Cc_limit/best-bars-NYC-Maison-Premiere-2016.jpg',
      credit: 'Condé Nast Traveler',
      creditUrl: 'https://www.cntraveler.com',
    },
    'Fresh Kills Bar': {
      src: 'https://freshkillsbar.com/wp-content/uploads/2020/02/bar1.jpg',
      credit: 'Fresh Kills Bar',
      creditUrl: 'https://freshkillsbar.com',
    },
    'Bar Blondeau': {
      src: 'https://static.wixstatic.com/media/3e9cbe_d694c12c15a84b789f24d436d72bbeb2~mv2.jpg',
      credit: 'Bar Blondeau',
      creditUrl: 'https://www.barblondeau.com',
    },
  },
  'burgers-nyc': {
    'Red Hook Tavern (Red Hook)': {
      src: 'https://platform.ny.eater.com/wp-content/uploads/sites/6/chorus/uploads/chorus_asset/file/18327131/RedHookTavern_Burger20932.jpg?quality=90&strip=all',
      credit: 'Eater NY',
      creditUrl: 'https://ny.eater.com',
    },
    '4 Charles Prime Rib (West Village)': {
      src: 'https://pyxis.nymag.com/v1/imgs/15e/05a/5290f89b1b5da48857fdebf766fb9b748d-21-4-charles-prime-rib-cheeseburger.2x.h473.w710.jpg',
      credit: 'Grub Street',
      creditUrl: 'https://www.grubstreet.com',
    },
    'Nowon (East Village)': {
      src: 'https://images.squarespace-cdn.com/content/v1/666a5e76661d142b1258b0f3/c6a90339-05b3-4be7-a693-4c35dee8e065/IMG_8607-2.jpg',
      credit: 'Nowon',
      creditUrl: 'https://www.nowonusa.com',
    },
  },
  "no-budget-dinners-tokyo": {
    "Sézanne (Marunouchi)": {
      src: "https://www.theworlds50best.com/asia/en/filestore/jpeg/Sezanne-dish_A50BR25-Profile.jpeg",
      credit: "Asia's 50 Best Restaurants",
      creditUrl: "https://www.theworlds50best.com/asia/en/the-list/sezanne.html",
    },
    "Sazenka (Hiroo)": {
      src: "https://www.theworlds50best.com/asia/en/filestore/jpg/A50BR26-1-50List-Sazenka3.jpg",
      credit: "Asia's 50 Best Restaurants",
      creditUrl: "https://www.theworlds50best.com/asia/en/the-list/Sazenka.html",
    },
    "Matsukawa (Akasaka)": {
      src: "https://luxeat.com/wp-content/uploads/2020/12/L1150327-1200x800-1.jpg",
      credit: "Luxeat",
      creditUrl: "https://luxeat.com/blog/introduction-only-matsukawa-2/",
    },
  },
  'kids-board-games-skill': {
    'Outfoxed!': {
      src: 'https://m.media-amazon.com/images/I/81c8K6IVBhL._AC_SL1500_.jpg',
      credit: 'Amazon',
      creditUrl: 'https://www.amazon.com/dp/B00UB7P0XY?tag=cgurus-20',
    },
    'Hoot Owl Hoot!': {
      src: 'https://m.media-amazon.com/images/I/618A7cqKYUL._AC_SL1500_.jpg',
      credit: 'Amazon',
      creditUrl: 'https://www.amazon.com/dp/B004HVKAAI?tag=cgurus-20',
    },
    'Zingo!': {
      src: 'https://m.media-amazon.com/images/I/81u7H7FiVFL._AC_SL1500_.jpg',
      credit: 'Amazon',
      creditUrl: 'https://www.amazon.com/dp/B01DY818JG?tag=cgurus-20',
    },
  },
  'burritos-san-diego': {
    "Ortiz's Taco Shop (Point Loma)": {
      src: 'https://cdn.vox-cdn.com/uploads/chorus_image/image/72169039/Ortiz_s_09.0.jpg',
      credit: 'Eater San Diego',
      creditUrl: 'https://san-diego.eater.com',
    },
    "Nico's Mexican Food (Ocean Beach)": {
      src: 'https://assets3.thrillist.com/v1/image/1263469/1200x630',
      credit: 'Thrillist',
      creditUrl: 'https://www.thrillist.com',
    },
    'La Perla Cocina Mexicana (Point Loma)': {
      src: 'https://platform.sandiego.eater.com/wp-content/uploads/sites/25/chorus/uploads/chorus_asset/file/24564621/La_Perla_King_Kong_1.jpg?quality=90&strip=all&w=2400',
      credit: 'Eater San Diego',
      creditUrl: 'https://san-diego.eater.com',
    },
  },
  "no-budget-dinners-shanghai": {
    "Fu He Hui (Changning)": {
      src: "https://www.theworlds50best.com/asia/en/filestore/jpg/A50BR26-1-50List-FuHeHui1.jpg",
      credit: "Asia's 50 Best Restaurants",
      creditUrl: "https://www.theworlds50best.com/asia/en/the-list/Fu-He-Hui.html",
    },
    "Meet the Bund (BFC)": {
      src: "https://www.theworlds50best.com/asia/en/filestore/jpg/A50BR26-1-50List-MeetTheBund1.jpg",
      credit: "Asia's 50 Best Restaurants",
      creditUrl: "https://www.theworlds50best.com/asia/en/the-list/Meet-The-Bund.html",
    },
    "102 House (Xuhui)": {
      src: "https://www.theworlds50best.com/asia/en/filestore/jpg/A50BR26-1-50List-102House1.jpg",
      credit: "Asia's 50 Best Restaurants",
      creditUrl: "https://www.theworlds50best.com/asia/en/the-list/102-house.html",
    },
  },
  'cabo-hotels': {
    'Esperanza, Auberge Resorts Collection (Cabo San Lucas)': {
      src: 'https://secure.s.forbestravelguide.com/img/properties/esperanza-an-auberge-resort/esperanza-an-auberge-resort-aerial-view-cocina-del-mar.jpg',
      credit: 'Forbes Travel Guide',
      creditUrl: 'https://www.forbestravelguide.com',
    },
    'Waldorf Astoria Los Cabos Pedregal (Cabo San Lucas)': {
      src: 'https://www.hksinc.com/wp-content/uploads/2007/10/Pedragal.jpg',
      credit: 'HKS Architects',
      creditUrl: 'https://www.hksinc.com',
    },
    'One&Only Palmilla (San José del Cabo)': {
      src: 'https://assets.simpleviewinc.com/simpleview/image/upload/crm/loscabosmx/1-Resort-Ariel_844B1B38-422E-4520-AD7FE28EFA8EB1A5_7559576a-9ecf-4337-92b42a4945eeb711.jpg',
      credit: 'Visit Los Cabos',
      creditUrl: 'https://www.visitloscabos.travel',
    },
  },
  "no-budget-dinners-toronto": {
    "Quetzal (Little Italy)": {
      src: "https://canadas100best.com/wp-content/uploads/2026/04/Quetzal-Toronto-2026-Canadas100Best-feat.jpg",
      credit: "Canada's 100 Best",
      creditUrl: "https://canadas100best.com/list/2026/quetzal-2026/",
    },
    "Edulis (King West)": {
      src: "https://canadas100best.com/wp-content/uploads/2026/04/Edulis-Toronto-2026-Canadas100Best-feat.jpg",
      credit: "Canada's 100 Best",
      creditUrl: "https://canadas100best.com/list/2026/edulis-2026/",
    },
    "Alo (Queen West)": {
      src: "https://canadas100best.com/wp-content/uploads/2026/04/Alo-Toronto-2026-Canadas100Best-feat.jpg",
      credit: "Canada's 100 Best",
      creditUrl: "https://canadas100best.com/list/2026/alo-2026/",
    },
  },
  'best-wings-nyc': {
    'Madame Vo (East Village)': {
      src: 'https://platform.ny.eater.com/wp-content/uploads/sites/6/2025/01/5KJHZEXZKFQIOOTL7UA4N2U2.jpeg?quality=90&strip=all&w=2400',
      credit: 'Eater NY',
      creditUrl: 'https://ny.eater.com',
    },
    "Dan and John's Wings (Murray Hill)": {
      src: 'https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_1280,ar_4:3,g_center,f_auto/images/Dan_John_s_Wings_-_Hot_Wings_1_wlpfxv',
      credit: 'The Infatuation',
      creditUrl: 'https://www.theinfatuation.com',
    },
    "Bonnie's Grill (Park Slope)": {
      src: 'https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_1280,ar_4:3,g_center,f_auto/images/NYC_BonniesGrill_10PcWings_KatePrevite_00001_wjyw6u',
      credit: 'The Infatuation · Kate Previte',
      creditUrl: 'https://www.theinfatuation.com/new-york/reviews/bonnies-grill',
    },
  },
  'burritos-nyc': {
    'Son Del North (Lower East Side)': {
      src: 'https://res.cloudinary.com/the-infatuation/image/upload/c_scale,w_1200,q_auto,f_auto/images/Son_Del_North_steak_burrito_ozyi4a',
      credit: 'The Infatuation',
      creditUrl: 'https://www.theinfatuation.com',
    },
    "B'Klyn Burro (Clinton Hill)": {
      src: 'https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_1280,ar_16:9,g_center,f_auto/NYC_BklynBurro_ChillReyBurrito_KatePrevite_00003_hz0u3g',
      credit: 'The Infatuation · Kate Previte',
      creditUrl: 'https://www.theinfatuation.com/new-york/reviews/bklyn-burro',
    },
    'Plaza Ortega (Bushwick)': {
      src: 'https://www.plazaortega.com/assets/images/burrito-california.png',
      credit: 'Plaza Ortega',
      creditUrl: 'https://www.plazaortega.com',
    },
    'Taqueria Tlaxcalli (Parkchester)': {
      src: 'https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_1280,ar_4:3,g_center,f_auto/images/NYC_Taqueria_Tlaxcalli_SonalShah_KPEDIT_06_hmfgvm',
      credit: 'The Infatuation · Sonal Shah',
      creditUrl: 'https://www.theinfatuation.com/new-york/reviews/taqueria-tlaxcalli',
    },
  },
  'beach-clubs-spain': {
    'Amante (Sol d\'en Serra, Ibiza)': {
      src: 'https://www.amanteibiza.com/wp-content/uploads/2023/10/AMANTE-9-1-1920x1500.jpg',
      credit: 'Amante Ibiza',
      creditUrl: 'https://www.amanteibiza.com',
    },
    'Marbella Club (Golden Mile, Marbella)': {
      src: 'https://image-tc.galaxy.tf/wijpeg-11jvjslbmk4evd8nclklh7z5t/mch-oct-19-2959-a2-low-well.jpg',
      credit: 'Marbella Club',
      creditUrl: 'https://www.marbellaclub.com',
    },
    'Nikki Beach Ibiza (S\'Argamassa, Ibiza)': {
      src: 'https://dv7zfk0hwmxgu.cloudfront.net/sites/default/files/styles/auto_1500_width/public/article-images/137201/embedded-1872585272.jpg',
      credit: 'Ibiza Spotlight',
      creditUrl: 'https://www.ibiza-spotlight.com/magazine/2024/08/best-beach-clubs-on-ibiza',
    },
  },

  'burgers-atlanta': {
    'NFA Burger (Dunwoody)': {
      src: 'https://platform.atlanta.eater.com/wp-content/uploads/sites/14/chorus/uploads/chorus_asset/file/19704766/82461237_496168277748545_5885031813239275520_o.jpg?quality=90&strip=all',
      credit: 'Eater Atlanta',
      creditUrl: 'https://atlanta.eater.com',
    },
    "Smiley's Burger Club (Decatur)": {
      src: 'https://res.cloudinary.com/the-infatuation/image/upload/q_auto,f_auto/Atlanta_Smiley_s_AmySinclair-5_pukp17',
      credit: 'The Infatuation · Amy Sinclair',
      creditUrl: 'https://www.theinfatuation.com/atlanta',
    },
    "Fred's Meat & Bread (Inman Park)": {
      src: 'https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_1280,ar_4:3,g_center,f_auto/images/7AmySinclair_Fred_s_DoubleStackBurger_dxiooz',
      credit: 'The Infatuation · Amy Sinclair',
      creditUrl: 'https://www.theinfatuation.com/atlanta/reviews/freds-meat-bread',
    },
  },
  'tacos-nyc': {
    'Taqueria Ramirez (Greenpoint)': {
      src: 'https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_1280,ar_4:3,g_center,f_auto/images/DavidALee_NYC_Taqueria_Ramirez_All_Dishes_005_lkt6ti',
      credit: 'The Infatuation · David A. Lee',
      creditUrl: 'https://www.theinfatuation.com/new-york/reviews/taqueria-ramirez',
    },
    'Los Tacos No. 1 (Chelsea)': {
      src: 'https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_1280,ar_4:3,g_center,f_auto/cms/reviews/los-tacos-no-1/Los-Tacos-tacos-1',
      credit: 'The Infatuation · Noah Devereaux',
      creditUrl: 'https://www.theinfatuation.com/new-york/reviews/los-tacos-no-1',
    },
    'Los Mariscos (Chelsea)': {
      src: 'https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_1280,ar_4:3,g_center,f_auto/cms/reviews/los-mariscos/Los_2520Mariscos_2520Shrimp_2520Tacos_2520-_2520Noah_2520Devereaux_JAy30LL',
      credit: 'The Infatuation · Noah Devereaux',
      creditUrl: 'https://www.theinfatuation.com/new-york/reviews/los-mariscos',
    },
  },
  'best-sushi-in-tokyo': {
    'Sushi Saito (Ginza)': {
      src: 'https://www.theworlds50best.com/discovery/filestore/jpg/SushiSaito-Tokyo-Japan-02.jpg',
      credit: '50 Best Discovery',
      creditUrl: 'https://www.theworlds50best.com/discovery/Establishments/Japan/Tokyo/Sushi-Saito.html',
    },
    'Nihonbashi Kakigaracho Sugita (Nihonbashi)': {
      src: 'https://luxeat.com/wp-content/uploads/2021/03/21372855_120657008667170_1271521327064285184_n-663x500.jpg',
      credit: 'Luxeat',
      creditUrl: 'https://luxeat.com/blog/sugita/',
    },
    'Udatsu Sushi (Nakameguro)': {
      src: 'https://media.timeout.com/images/105820293/750/422/image.jpg',
      credit: 'Time Out Tokyo',
      creditUrl: 'https://www.timeout.com/tokyo/restaurants/udatsu-sushi',
    },
  },
  'dive-bars-london': {
    'Slim Jim\'s Liquor Store (Islington)': {
      src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Slim_Jims_Liquor_Store%2C_Islington%2C_N1_%283590013603%29.jpg/1280px-Slim_Jims_Liquor_Store%2C_Islington%2C_N1_%283590013603%29.jpg',
      credit: 'Ewan Munro / Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Slim_Jims_Liquor_Store,_Islington,_N1_(3590013603).jpg',
    },
    'Bradley\'s Spanish Bar (Fitzrovia)': {
      src: 'https://d2s8km3brsjp0y.cloudfront.net/eyJidWNrZXQiOiJ3aGF0cHViIiwia2V5IjoiV0xEXC9XTEQrMTY1MzgtOTY1MDctMjE4My0xNzM3LmpwZyIsImVkaXRzIjp7InJlc2l6ZSI6eyJ3aWR0aCI6MjAwMCwiaGVpZ2h0IjoxNTkxLCJmaXQiOiJjb3ZlciJ9LCJyb3RhdGUiOm51bGx9fQ==',
      credit: 'CAMRA / WhatPub',
      creditUrl: 'https://whatpub.com',
    },
    'The Victoria (Dalston)': {
      src: 'https://static.designmynight.com/uploads/2016/04/The-Victoria-Review-1.jpg',
      credit: 'DesignMyNight',
      creditUrl: 'https://www.designmynight.com/london/bars/dalston/the-victoria',
    },
  },
  'dive-bars-barcelona': {
    'Cal Marino (Poble Sec)': {
      src: 'https://media.timeout.com/images/103784167/750/422/image.jpg',
      credit: 'Time Out Barcelona',
      creditUrl: 'https://www.timeout.com/barcelona',
    },
    'El Pollo Bar (El Raval)': {
      src: 'https://www.lavanguardia.com/files/og_thumbnail/files/fp/uploads/2023/09/20/650af986cca1a.r_d.570-408-0.jpeg',
      credit: 'La Vanguardia',
      creditUrl: 'https://www.lavanguardia.com',
    },
    'Bar Bodega Quimet (Gràcia)': {
      src: 'https://www.bodegaquimet.com/img-trans/productos/24272/fotos/1024-67ac8f8e4b0e1-bar-bodega-quimet.png',
      credit: 'Bar Bodega Quimet',
      creditUrl: 'https://www.bodegaquimet.com/en/',
    },
  },
  'dive-bars-istanbul': {
    'Safa Meyhanesi (Yedikule)': {
      src: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/22/11/3e/a5/caption.jpg?w=900&h=500&s=1',
      credit: 'Tripadvisor',
      creditUrl: 'https://www.tripadvisor.com',
    },
    'Asmalı Cavit (Asmalımescit)': {
      src: 'https://grablocals.com/wp-content/uploads/2022/08/asmali-cavit-restaurant-1200x900.jpeg',
      credit: 'Grablocals',
      creditUrl: 'https://grablocals.com',
    },
    'Barba Vasilis (Balat)': {
      src: 'https://www.barbavasilis.com/wp-content/uploads/2020/05/IMG_8234-e3-kucuk-e1589824592796.jpg',
      credit: 'Barba Vasilis',
      creditUrl: 'https://www.barbavasilis.com',
    },
  },
  'dive-bars-tel-aviv': {
    'HaMinzar (Allenby)': {
      src: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/08/2a/4c/f8/haminzar.jpg?w=900&h=500&s=1',
      credit: 'Tripadvisor',
      creditUrl: 'https://www.tripadvisor.com',
    },
    'Hoodna Bar (Florentin)': {
      src: 'https://www.secrettelaviv.com/wp-content/uploads/2016/07/22378_Hoodna-Bar.jpg',
      credit: 'Secret Tel Aviv',
      creditUrl: 'https://www.secrettelaviv.com',
    },
    'Levontin 7 (Florentin)': {
      src: 'https://viberate-upload.ams3.cdn.digitaloceanspaces.com/prod/entity/venue/levontin-7-EjAw2',
      credit: 'Viberate',
      creditUrl: 'https://www.viberate.com',
    },
  },
  'dive-bars-amsterdam': {
    'Café de Dokter (Centrum)': {
      src: 'https://holidayexpert.com/wp-content/uploads/2025/05/Untitled-design-2025-06-04T164802.348.webp',
      credit: 'Holiday Expert',
      creditUrl: 'https://holidayexpert.com',
    },
    'Café de Sluyswacht (Centrum)': {
      src: 'https://images.pexels.com/photos/15374517/pexels-photo-15374517.jpeg?auto=compress&cs=tinysrgb&w=1600',
      credit: 'John Tekeridis / Pexels',
      creditUrl: 'https://www.pexels.com/photo/cafe-de-sluyswacht-in-amsterdam-netherlands-15374517/',
    },
    'Café \'t Smalle (Jordaan)': {
      src: 'https://backstreettravel.com/wp-content/uploads/2025/02/Cafe-t-Smalle-bronw-bar-by-Andrew-Nash-1024x1024.png',
      credit: 'Andrew Nash / Backstreet Travel',
      creditUrl: 'https://backstreettravel.com',
    },
  },
  'dive-bars-tokyo': {
    'La Jetée (Golden Gai)': {
      src: 'https://i.pinimg.com/736x/bd/19/a7/bd19a772a854aac5c5efdcb738e86a75.jpg',
      credit: 'Pinterest',
      creditUrl: 'https://www.pinterest.com',
    },
    'Good Heavens (Shimokitazawa)': {
      src: 'https://cdn.cheapoguides.com/wp-content/uploads/sites/2/2016/07/goodheavens.jpg',
      credit: 'Tokyo Cheapo',
      creditUrl: 'https://tokyocheapo.com',
    },
    'Albatross G (Golden Gai)': {
      src: 'https://www.alba-s.com/wp-content/uploads/2023/05/TOP1.jpg',
      credit: 'Albatross G',
      creditUrl: 'https://www.alba-s.com',
    },
  },
  'dive-bars-milan': {
    'Cantine Isola dal 1896 (Moscova)': {
      src: 'https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_1600,ar_4:3,g_center,f_auto/images/IMG_2570_zwtehg',
      credit: 'The Infatuation',
      creditUrl: 'https://www.theinfatuation.com/milan',
    },
    'Radetzky (Brera)': {
      src: 'https://flawless.life/wp-content/uploads/2015/01/radetzky-cover.jpg',
      credit: 'FLAWLESS.life',
      creditUrl: 'https://flawless.life',
    },
    'N\'Ombra de Vin (Brera)': {
      src: 'https://thevanderlust.com/img/no/mb/nombra-de-vin-ia-san-marco_jpg_1377259991.jpg$i$min$822$530$cc$$.jpeg',
      credit: 'The Vanderlust',
      creditUrl: 'https://thevanderlust.com',
    },
  },
  'dive-bars-athens': {
    'The 7 Jokers (Historic Centre)': {
      src: 'https://www.theworlds50best.com/discovery/filestore/jpg/Seven%20Jokers-Athens-Greece-3.jpg',
      credit: 'The World\'s 50 Best',
      creditUrl: 'https://www.theworlds50best.com',
    },
    'Barrett (Psirri)': {
      src: 'https://i0.wp.com/images.suitcasemag.com/wp-content/uploads/2023/10/10162448/psyris-best-bars-drinking-in-the-underworld-of-athens_6533c0998cd92.jpeg?resize=720%2C480&ssl=1',
      credit: 'SUITCASE Magazine',
      creditUrl: 'https://suitcasemag.com',
    },
    'Brettos (Plaka)': {
      src: 'https://brettosplaka.com/cdn/shop/files/download_1.png?v=1672137683&width=2000',
      credit: 'Brettos Plaka',
      creditUrl: 'https://brettosplaka.com',
    },
  },
  'dive-bars-hong-kong': {
    'The Pontiac (Central)': {
      src: 'https://www.asia-bars.com/wp-content/uploads/2016/01/pontiac-4.jpg',
      credit: 'Asia Bars & Restaurants',
      creditUrl: 'https://www.asia-bars.com',
    },
    'The Wanch (Wan Chai)': {
      src: 'https://cdn.i-scmp.com/sites/default/files/styles/1020x680/public/d8/images/canvas/2022/03/24/96b0aa2b-dcc2-4ffc-aba2-e6c7909c6009_68910a0e.jpg?itok=R3q_7nK0&v=1648114521',
      credit: 'South China Morning Post',
      creditUrl: 'https://www.scmp.com',
    },
    'Tai Lung Fung (Wan Chai)': {
      src: 'https://media.timeout.com/images/105329881/image.jpg',
      credit: 'Time Out Hong Kong',
      creditUrl: 'https://www.timeout.com/hong-kong',
    },
    'Blotto (Kennedy Town)': {
      src: 'https://media.timeout.com/images/106042584/image.jpg',
      credit: 'Time Out Hong Kong',
      creditUrl: 'https://www.timeout.com/hong-kong/bars-and-pubs/blotto',
    },
  },
  'dive-bars-sydney': {
    'Fortunate Son (Enmore)': {
      src: 'https://media.timeout.com/images/105681641/750/422/image.jpg',
      credit: 'Time Out Sydney',
      creditUrl: 'https://www.timeout.com/sydney',
    },
    'Arcadia Liquors (Redfern)': {
      src: 'https://cdn.broadsheet.com.au/cache/d3/4e/d34eb360ed8b429ffa9b723cfd9d1e78.jpg',
      credit: 'Broadsheet',
      creditUrl: 'https://www.broadsheet.com.au/sydney',
    },
    'Earl\'s Juke Joint (Newtown)': {
      src: 'https://images.squarespace-cdn.com/content/v1/5e7d5c9b598f9f6f7a641185/89acf095-a5d5-4cca-ab37-cc093603f676/EARLS+JUN-1045.jpg',
      credit: 'Earl\'s Juke Joint',
      creditUrl: 'https://earlsjukejoint.com.au',
    },
  },
  'tacos-austin': {
    'Nixta Taqueria (East Austin)': {
      src: 'https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_3840,ar_4:3,g_center,f_auto/cms/reviews/nixta-taqueria/ShannaHickman_Austin_Nixta_DuckCarnitas-2',
      credit: 'The Infatuation / Shanna Hickman',
      creditUrl: 'https://www.theinfatuation.com/austin/reviews/nixta-taqueria',
    },
    'Cuantos Tacos (East Austin)': {
      src: 'https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_3840,ar_4:3,g_center,f_auto/images/CuantosTacos_AllTacos_RichardCasteel_ATX-2_zeau8v',
      credit: 'The Infatuation / Richard Casteel',
      creditUrl: 'https://www.theinfatuation.com/austin/reviews/cuantos-tacos',
    },
    'Paprika ATX (North Lamar)': {
      src: 'https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_3840,ar_4:3,g_center,f_auto/images/Paprika_MultipleItems_RichardCasteel_ATX-5_kjzoy2',
      credit: 'The Infatuation / Richard Casteel',
      creditUrl: 'https://www.theinfatuation.com/austin/reviews/paprika-atx',
    },
  },
  'best-run-sweetgreen-nyc': {
    '32 Gansevoort St (Meatpacking District)': {
      src: 'https://s3-media0.fl.yelpcdn.com/bphoto/-V7WgPDtWmnTDfLK-LKarw/o.jpg',
      credit: 'Yelp',
      creditUrl: 'https://www.yelp.com/biz/sweetgreen-new-york-16',
    },
    '60 E 55th St (Midtown)': {
      src: 'https://s3-media0.fl.yelpcdn.com/bphoto/lhKuioSKLCSLVnHO57ZYVg/o.jpg',
      credit: 'Yelp',
      creditUrl: 'https://www.yelp.com/biz/sweetgreen-new-york-21',
    },
    '100 Kenmare St (Nolita)': {
      src: 'https://s3-media0.fl.yelpcdn.com/bphoto/h6yndhriW3kEEq2Bc9PC9A/o.jpg',
      credit: 'Yelp',
      creditUrl: 'https://www.yelp.com/biz/sweetgreen-new-york-4',
    },
  },
  'top-grossing-realtors-2025': {
    'Ben Caballero (Dallas; $3.9B)': {
      src: 'https://homesusa.com/wp-content/uploads/2024/02/Ben-Caballero-Portrait-with-Background-033123-10-x-10-in.jpg',
      credit: 'HomesUSA.com',
      creditUrl: 'https://homesusa.com/ben_caballero/',
    },
    'Deborah Kern (New York City; $1.1B)': {
      src: 'https://media-cloud.corcoranlabs.com/filters:format(webp)/fit-in/1000x1000/AgentApi/NewTaxi/3552/mediarouting.vestahub.com/Media/92073919',
      credit: 'Corcoran',
      creditUrl: 'https://www.corcoran.com/',
    },
    'Christian Angle (Palm Beach; $792.4M)': {
      src: 'https://anglerealestate.com/wp-content/uploads/2019/07/Christian-Angle-Palm-Beach-Island-Real-Estate-white.jpg',
      credit: 'Christian Angle Real Estate',
      creditUrl: 'https://anglerealestate.com/',
    },
  },
  'movies': {
    'The Godfather (1972)': {
      src: 'https://upload.wikimedia.org/wikipedia/commons/3/32/Marlon_Brando_as_Vito_Corleone_%28high_quality%29.png',
      credit: 'Paramount Pictures / Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Marlon_Brando_as_Vito_Corleone_(high_quality).png',
    },
    'Citizen Kane (1941)': {
      src: 'https://upload.wikimedia.org/wikipedia/commons/3/34/Citizen-Kane-Welles-Podium.jpg',
      credit: 'RKO Radio Pictures / Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Citizen-Kane-Welles-Podium.jpg',
    },
    'Vertigo (1958)': {
      src: 'https://upload.wikimedia.org/wikipedia/commons/7/75/Vertigomovie_restoration.jpg',
      credit: 'Paramount Pictures / Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Vertigomovie_restoration.jpg',
    },
  },
  'best-wings-atlanta': {
    'The Local (Poncey-Highland)': {
      src: 'https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_3840,ar_4:3,g_center,f_auto/TheLocal_Atlanta_AmySinclair-3_1_nrbylk',
      credit: 'The Infatuation / Amy Sinclair',
      creditUrl: 'https://www.theinfatuation.com/atlanta/reviews/the-local',
    },
    'J.R. Crickets (Midtown)': {
      src: 'https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_3840,ar_4:3,g_center,f_auto/images/Atlanta_StateFarmArena_Hawks-22_nl77dv',
      credit: 'The Infatuation / Amy Sinclair',
      creditUrl: 'https://www.theinfatuation.com/atlanta/reviews/jr-crickets',
    },
    'Magic City (Downtown)': {
      src: 'https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_3840,ar_4:3,g_center,f_auto/MagicCity_LemonPepperWet_TabiaLisenbeeParker_Atlanta-1_oc0g2e',
      credit: 'The Infatuation / Tabia Lisenbee-Parker',
      creditUrl: 'https://www.theinfatuation.com/atlanta/guides/lemon-pepper-wings-ranked',
    },
  },
  'tacos-la': {
    'Mariscos Jalisco (Boyle Heights)': {
      src: 'https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_3840,ar_4:3,g_center,f_auto/cms/reviews/mariscos-jalisco/JakobLayman.MariscosJalisco.TacosDoradodeCamarones_06',
      credit: 'The Infatuation / Jakob Layman',
      creditUrl: 'https://www.theinfatuation.com/los-angeles/reviews/mariscos-jalisco',
    },
    'Tacos Los Cholos (Huntington Park)': {
      src: 'https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_3840,ar_4:3,g_center,f_auto/images/LA_TacosLosCholos_Tacos_JessieClapp-1_sszsnw',
      credit: 'The Infatuation / Jessie Clapp',
      creditUrl: 'https://www.theinfatuation.com/los-angeles/reviews/tacos-los-cholos',
    },
    "Leo's Taco Truck (multiple locations)": {
      src: 'https://cdn.prod.website-files.com/6657750805b8c6353a8f0980/665a484a37cdbebc726406e5_SQpastorplate%20Large.jpeg',
      credit: "Leo's Tacos Truck",
      creditUrl: 'https://www.leostacostruck.com/',
    },
  },
  'mario-quest-games': {
    'Super Mario Odyssey': {
      src: 'https://assets.nintendo.com/image/upload/ar_16:9,b_auto:border,c_lpad/f_auto/q_auto/c_scale,w_1240/store/software/switch/70010000001130/c497547957d9dd3668e891aa97ff4899a3f40bd1bd430020f8cbdf673f02bdeb',
      credit: 'Nintendo',
      creditUrl: 'https://www.nintendo.com/us/store/products/super-mario-odyssey-switch/',
    },
    'Super Mario World': {
      src: 'https://mario.wiki.gallery/images/d/da/Super_Mario_World_Box.png',
      credit: 'Nintendo via Super Mario Wiki',
      creditUrl: 'https://www.mariowiki.com/Super_Mario_World',
    },
    'Super Mario Galaxy 2': {
      src: 'https://assets.nintendo.com/image/upload/ar_16:9,c_lpad,w_1240/b_white/f_auto/q_auto/store/software/switch/70010000104192/5731782c9e89d2f492b44f1445f5df3d65660cdf75fe4f47a17e2bed7f82f99e',
      credit: 'Nintendo',
      creditUrl: 'https://www.nintendo.com/us/store/products/super-mario-galaxy-2-switch/',
    },
  },
  'historical-fiction-female-protagonist': {
    'The Nightingale (Kristin Hannah)': {
      src: 'https://m.media-amazon.com/images/I/51ifIPw0RxL.jpg',
      credit: 'Amazon',
      creditUrl: 'https://www.amazon.com/dp/B00JO8PEN2?tag=cgurus-20',
    },
    'The Help (Kathryn Stockett)': {
      src: 'https://m.media-amazon.com/images/I/51W-HzcFZZL.jpg',
      credit: 'Amazon',
      creditUrl: 'https://www.amazon.com/dp/B002YKOXB6?tag=cgurus-20',
    },
    'The Book Thief (Markus Zusak)': {
      src: 'https://m.media-amazon.com/images/I/41sQhggHqjL.jpg',
      credit: 'Amazon',
      creditUrl: 'https://www.amazon.com/dp/B000XUBFE2?tag=cgurus-20',
    },
  },
  'best-sandwich-types': {
    'Philly Cheesesteak': {
      src: 'https://images.pexels.com/photos/37324434/pexels-photo-37324434/free-photo-of-delicious-philly-cheesesteak-sandwich-on-white-background.jpeg?w=1260&h=750&dpr=1',
      credit: 'Tochukwu Ekeh / Pexels',
      creditUrl: 'https://www.pexels.com/photo/delicious-philly-cheesesteak-sandwich-on-white-background-37324434/',
    },
    'Bánh Mì': {
      src: 'https://images.pexels.com/photos/32961655/pexels-photo-32961655/free-photo-of-delicious-vietnamese-banh-mi-on-newspaper.jpeg?w=1260&h=750&dpr=1',
      credit: 'Hậu Mai / Pexels',
      creditUrl: 'https://www.pexels.com/photo/delicious-vietnamese-banh-mi-on-newspaper-32961655/',
    },
    'Reuben': {
      src: 'https://images.pexels.com/photos/23531331/pexels-photo-23531331/free-photo-of-close-up-of-a-ham-sandwich.jpeg?w=1260&h=750&dpr=1',
      credit: 'Anthony Rahayel / Pexels',
      creditUrl: 'https://www.pexels.com/photo/close-up-of-a-ham-sandwich-23531331/',
    },
  },
  'cocktails-west-village': {
    'Dante': {
      src: 'https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_3840,ar_4:3,g_center,f_auto/images/Dante_-_Negroni_Sessions_-_Credit_-_Steve_Freihon_efooku',
      credit: 'The Infatuation / Steve Freihon',
      creditUrl: 'https://www.theinfatuation.com/new-york/reviews/dante-nyc',
    },
    'Katana Kitten': {
      src: 'https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_3840,ar_4:3,g_center,f_auto/EmilyS_KatanaKitten_Drinks_001_b1hil2',
      credit: 'The Infatuation / Emily Schindler',
      creditUrl: 'https://www.theinfatuation.com/new-york/reviews/katana-kitten',
    },
    "Angel's Share": {
      src: 'https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_3840,ar_4:3,g_center,f_auto/images/Angels_Share_ki4hk4',
      credit: 'The Infatuation',
      creditUrl: 'https://www.theinfatuation.com/new-york/reviews/angels-share',
    },
  },
  'bagels-nyc': {
    'Ess-a-Bagel (Midtown East)': {
      src: 'https://s3-media0.fl.yelpcdn.com/bphoto/kZqdHrG5U_0yPULZAE3q1Q/o.jpg',
      credit: 'Yelp',
      creditUrl: 'https://www.yelp.com/biz/ess-a-bagel-new-york',
    },
    'Tompkins Square Bagels (East Village)': {
      src: 'https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_3840,ar_4:3,g_center,f_auto/images/DanielBrennan_NYC_TompkinsSquareBagel_BaconEggCheese_DSCF4875_qbpm6x',
      credit: 'The Infatuation / Daniel Brennan',
      creditUrl: 'https://www.theinfatuation.com/new-york/reviews/tompkins-square-bagels',
    },
    'Utopia Bagels (Whitestone)': {
      src: 'https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_3840,ar_4:3,g_center,f_auto/images/NYC_UtopiaBagelsManhattan_EverythingBagalCCLox_KatePrevite_00002_mrax8j',
      credit: 'The Infatuation / Kate Previte',
      creditUrl: 'https://www.theinfatuation.com/new-york/reviews/utopia-bagels',
    },
  },
  'trustworthy-twitter-accounts': {
    'Cluseau Investments (@blondesnmoney)': {
      src: 'https://pbs.twimg.com/profile_images/1917321594969452544/ICptXx-D_400x400.jpg',
      credit: 'Cluseau Investments on X',
      creditUrl: 'https://x.com/blondesnmoney',
    },
    'The Umpire (@EricTheUmpire)': {
      src: 'https://pbs.twimg.com/profile_images/1599078533317332992/8_jNkBhz_400x400.jpg',
      credit: 'The Umpire on X',
      creditUrl: 'https://x.com/EricTheUmpire',
    },
    'Pennycheck (@pennycheck)': {
      src: 'https://pbs.twimg.com/profile_images/2008243935995437056/SsQDGiMN_400x400.jpg',
      credit: 'Pennycheck on X',
      creditUrl: 'https://x.com/pennycheck',
    },
  },
  'taco-bell-menu-items': {
    'Crunchwrap Supreme': {
      src: 'https://www.tacobell.com/images/22362_crunchwrap_supreme_1400x800.jpg',
      credit: 'Taco Bell',
      creditUrl: 'https://www.tacobell.com/food/specialties/crunchwrap-supreme',
    },
    'Cheesy Gordita Crunch': {
      src: 'https://www.tacobell.com/images/22813_cheesy_gordita_crunch_1400x800.jpg',
      credit: 'Taco Bell',
      creditUrl: 'https://www.tacobell.com/food/specialties/cheesy-gordita-crunch',
    },
    'Mexican Pizza': {
      src: 'https://www.tacobell.com/images/22303_mexican_pizza_1400x800.jpg',
      credit: 'Taco Bell',
      creditUrl: 'https://www.tacobell.com/food/specialties/mexican-pizza',
    },
  },
  "hitchcock-movies": {
    "Rear Window (1954)": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/6/69/Rearwindow_trailer_1.jpg",
      "credit": "Paramount Pictures / Wikimedia Commons",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:Rearwindow_trailer_1.jpg"
    },
    "Psycho (1960)": {
      "src": "https://a57.foxnews.com/static.foxnews.com/foxnews.com/content/uploads/2018/09/1200/675/Getty_ETHandout_Psycho.jpg?ve=1&tl=1",
      "credit": "Paramount Pictures / Getty",
      "creditUrl": "https://www.foxnews.com/entertainment/janet-leigh-said-after-psycho-shower-scene-she-stopped-taking-showers"
    },
    "Vertigo (1958)": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/a/a7/Vertigo_1958_trailer_Kim_Novak_at_Golden_Gate_Bridge.jpg",
      "credit": "Paramount Pictures / Wikimedia Commons",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:Vertigo_1958_trailer_Kim_Novak_at_Golden_Gate_Bridge.jpg"
    }
  },
  "kubrick-movies": {
    "2001: A Space Odyssey (1968)": {
      "src": "https://cdn.theatlantic.com/thumbor/5uN5nqK6ejG54_5xz0VcGgrVbbk=/0x0:4800x2700/960x540/media/img/mt/2022/12/2001_space_odyssey/original.jpg",
      "credit": "Warner Bros. / The Atlantic",
      "creditUrl": "https://www.theatlantic.com/"
    },
    "Dr. Strangelove (1964)": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/8/85/Dr._Strangelove_-_The_War_Room.png",
      "credit": "Columbia Pictures / Wikimedia Commons",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:Dr._Strangelove_-_The_War_Room.png"
    },
    "Paths of Glory (1957)": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/2/26/Paths_of_Glory_trailer_2.jpg",
      "credit": "United Artists / Wikimedia Commons",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:Paths_of_Glory_trailer_2.jpg"
    }
  },
  "scorsese-movies": {
    "Goodfellas (1990)": {
      "src": "https://i.guim.co.uk/img/media/b91bfbcc98000de0de878a7489207c3acc25d66e/0_948_3650_2189/master/3650.jpg?width=1400&dpr=1&s=none",
      "credit": "Warner Bros. / The Guardian",
      "creditUrl": "https://www.theguardian.com/film/2020/sep/19/goodfellas-at-30-martin-scorsese"
    },
    "Raging Bull (1980)": {
      "src": "https://i.guim.co.uk/img/media/856360858e305bb1e52afe28f529c84e2766e493/0_233_2910_1746/master/2910.jpg?width=1400&dpr=1&s=none",
      "credit": "United Artists / The Guardian",
      "creditUrl": "https://www.theguardian.com/film/"
    },
    "The Departed (2006)": {
      "src": "https://acmi-website-media-prod.s3.amazonaws.com/media/images/Leonardo_Di_Caprio_and_Jack_Nicholson_in_The_.width-2160.jpg",
      "credit": "Warner Bros. / ACMI",
      "creditUrl": "https://www.acmi.net.au/works/the-departed/"
    }
  },
  "spielberg-movies": {
    "Schindler's List (1993)": {
      "src": "https://deadline.com/wp-content/uploads/2022/04/MCDSCLI_EC006-e1649362433199.jpg",
      "credit": "Universal Pictures / Deadline",
      "creditUrl": "https://deadline.com/2022/04/schindlers-list-red-coat-girl-helping-ukraine-refugees-1234998001/"
    },
    "Raiders of the Lost Ark (1981)": {
      "src": "https://www.slashfilm.com/img/gallery/the-raiders-of-the-lost-ark-boulder-chase-was-more-real-than-you-think/l-intro-1643981355.jpg",
      "credit": "Lucasfilm / SlashFilm",
      "creditUrl": "https://www.slashfilm.com/757354/the-raiders-of-the-lost-ark-boulder-chase-was-more-real-than-you-think/"
    },
    "Jaws (1975)": {
      "src": "https://www.slashfilm.com/img/gallery/the-unexpected-origin-behind-jaws-most-famous-line/l-intro-1637639177.jpg",
      "credit": "Universal Pictures / SlashFilm",
      "creditUrl": "https://www.slashfilm.com/664898/the-unexpected-origin-behind-jaws-most-famous-line/"
    }
  },
  "nolan-movies": {
    "The Dark Knight (2008)": {
      "src": "https://heroichollywood.com/wp-content/uploads/2019/10/Joaquin_Phoenix_Joker_Heath_Ledger.jpg",
      "credit": "Warner Bros. / Heroic Hollywood",
      "creditUrl": "https://heroichollywood.com/"
    },
    "Oppenheimer (2023)": {
      "src": "https://www.syfy.com/sites/syfy/files/2023/05/screen_shot_2023-05-09_at_9.18.22_am.jpg",
      "credit": "Universal Pictures / SYFY",
      "creditUrl": "https://www.syfy.com/syfy-wire/oppenheimer-explained-the-story-of-the-man-behind-the-atomic-bomb"
    },
    "The Prestige (2006)": {
      "src": "https://static0.srcdn.com/wordpress/wp-content/uploads/2020/05/The-Prestige-Movie-Christian-Bale-Hugh-Jackman.jpg?w=1200&h=675&fit=crop",
      "credit": "Touchstone Pictures / ScreenRant",
      "creditUrl": "https://screenrant.com/prestige-movie-ending-twists-explained/"
    }
  },
  "bigelow-movies": {
    "The Hurt Locker (2008)": {
      "src": "https://static0.srcdn.com/wordpress/wp-content/uploads/2023/07/the-hurt-locker.png?q=70&fit=crop&w=1400",
      "credit": "Summit Entertainment / ScreenRant",
      "creditUrl": "https://screenrant.com/"
    },
    "Zero Dark Thirty (2012)": {
      "src": "https://images.csmonitor.com/csm/2012/12/jchastain_1.jpg?alias=standard_900x600",
      "credit": "Columbia Pictures / CS Monitor",
      "creditUrl": "https://www.csmonitor.com/The-Culture/Movies/2012/1219/Jessica-Chastain-stars-in-the-troubling-engrossing-Zero-Dark-Thirty"
    },
    "Strange Days (1995)": {
      "src": "https://coolidge.org/sites/default/files/featured_images/StrangeDays_1995_8%20copy.jpg",
      "credit": "20th Century Fox / Coolidge Corner Theatre",
      "creditUrl": "https://coolidge.org/films/strange-days"
    }
  },
};
