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
      src: 'https://static.independent.co.uk/s3fs-public/thumbnails/image/2014/08/12/08/robin-williams-7.jpg',
      credit: 'The Independent · Miramax',
      creditUrl: 'https://www.independent.co.uk',
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
};
