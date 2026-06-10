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
  "best-restaurants-washington-dc": {
      "Albi (Navy Yard)": {
          "src": "https://washingtonian.com/wp-content/uploads/2025/03/Albi_Kitchen_Hawkeye-Johnson.jpg",
          "credit": "Hawkeye Johnson / Washingtonian",
          "creditUrl": "https://www.albidc.com"
      },
      "minibar by José Andrés (Penn Quarter)": {
          "src": "https://images.squarespace-cdn.com/content/v1/61e1992aa984ff101d920a49/c80db217-e9ad-4611-b8e9-4c519b12e4f1/minibar-6.jpg",
          "credit": "minibar by José Andrés",
          "creditUrl": "https://www.minibarbyjoseandres.com"
      },
      "Jônt (Logan Circle)": {
          "src": "https://images.getbento.com/accounts/b7afc34a90a360e516fe2f25122db225/media/images/85369untitled-0339.jpg",
          "credit": "Jônt",
          "creditUrl": "https://www.jontdc.com"
      },
  },

  "best-restaurants-los-angeles": {
      "Holbox (University Park)": {
          "src": "https://blog.resy.com/wp-content/uploads/2024/12/Holbox93911.jpg",
          "credit": "Resy",
          "creditUrl": "http://www.holboxla.com"
      },
      "Providence (Melrose)": {
          "src": "https://platform.la.eater.com/wp-content/uploads/sites/26/chorus/uploads/chorus_asset/file/24666706/230515_PROVIDENCE_MDR_01.jpg",
          "credit": "Eater LA",
          "creditUrl": "https://providencela.com"
      },
      "Somni (West Hollywood)": {
          "src": "https://platform.la.eater.com/wp-content/uploads/sites/26/chorus/uploads/chorus_asset/file/25759926/2024_11_21_Somni_026.jpg",
          "credit": "Eater LA",
          "creditUrl": "http://www.somnirestaurant.com"
      },
  },

  "best-restaurants-san-francisco": {
      "Californios (SoMa)": {
          "src": "https://christinamueller.com/wp-content/uploads/2024/10/Dish-from-dinner-at-Californios-San-Francisco-2015-scaled.jpg",
          "credit": "Christina Mueller",
          "creditUrl": "https://www.californiossf.com"
      },
      "Acquerello (Nob Hill)": {
          "src": "https://images.squarespace-cdn.com/content/v1/5b873f4d9d5abb3165aa122d/1571180284831-YVIYZFQA2EJ2W2DUSXBB/Dining+Room+%232.jpg",
          "credit": "Acquerello",
          "creditUrl": "https://www.acquerellosf.com"
      },
      "Atelier Crenn (Cow Hollow)": {
          "src": "https://secure.s.forbestravelguide.com/img/properties/atelier-crenn/atelier-crenn-black-cod-and-coastal-greens.jpg",
          "credit": "Forbes Travel Guide",
          "creditUrl": "https://www.ateliercrenn.com"
      },
  },

  "best-restaurants-chicago": {
    "Cariño (Uptown)": {
      "src": "https://images.squarespace-cdn.com/content/v1/65242e410bb72d468102c145/e06245ce-3758-41eb-b900-16e203a2e26e/Cari%C3%B1oChicago_HighRes_KellySandos_DSC_2686-Edit-Edit+%281%29.jpg",
      "credit": "Kelly Sandos / Cariño",
      "creditUrl": "https://www.carinochicago.com"
    },
    "Oriole (West Loop)": {
      "src": "https://images.squarespace-cdn.com/content/v1/5636d03ae4b05d222e994744/1736630844557-VCEQNLFLSTZ2VCJ5C5K2/Oriole-21+%281%29.jpg?format=1500w",
      "credit": "Oriole",
      "creditUrl": "https://www.oriolechicago.com"
    },
    "Kyōten (Logan Square)": {
      "src": "https://blog.resy.com/wp-content/uploads/2023/08/kyoten-2000x1125.jpeg",
      "credit": "Resy",
      "creditUrl": "https://www.kyotenchicago.com"
    }
  },
  "best-restaurants-orlando": {
    "Sorekara (Baldwin Park)": {
      "src": "https://images.squarespace-cdn.com/content/v1/60d41295093228631a23a1dc/c695396a-79a9-4213-9646-86195f57abd9/1Q9A9530.jpg",
      "credit": "Sorekara",
      "creditUrl": "https://sorekarafl.com"
    },
    "Soseki (Winter Park)": {
      "src": "https://images.squarespace-cdn.com/content/v1/5f709c6e9f73db3d4f0435bf/9e6aee53-0125-4a7d-8d60-6985e04e5315/5G1A9741.jpg?format=2500w",
      "credit": "Soseki Modern Omakase",
      "creditUrl": "https://www.sosekifl.com"
    },
    "Kadence (Audubon Park)": {
      "src": "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1b/18/fe/e0/and-on.jpg",
      "credit": "Kadence via Tripadvisor",
      "creditUrl": "https://kadenceorlando.com"
    }
  },
  "best-restaurants-tampa-bay": {
    "Koya (Tampa)": {
      "src": "https://endlessvolo.com/images/easyblog_articles/128/b2ap3_large_Koya_inside.jpg",
      "credit": "Koya",
      "creditUrl": "https://www.koyatampa.com"
    },
    "Ebbe (Tampa)": {
      "src": "https://static.prod.r53.tablethotels.com/media/ecs/global/michelin-articles/StarEbbe/Restaurant.jpg",
      "credit": "Ebbe via the MICHELIN Guide",
      "creditUrl": "https://guide.michelin.com/us/en/florida/tampa/restaurant/ebbe"
    },
    "Kōsen (Tampa)": {
      "src": "https://static1.squarespace.com/static/64d26d5a6db3b01c1ee4e1b1/t/64d3cc307a1d2e31233a4baf/1691601972452/Kosen_PR_omakase2.jpg",
      "credit": "Kōsen",
      "creditUrl": "https://www.kosentampa.com"
    }
  },
  "best-restaurants-jacksonville": {
    "Restaurant Orsay (Avondale)": {
      "src": "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/04/21/e8/08/paul-figura-photography.jpg",
      "credit": "Paul Figura Photography",
      "creditUrl": "https://restaurantorsay.com"
    },
    "Matthew's (San Marco)": {
      "src": "https://static.showit.co/1200/WZ6PjrShSuusuQy5w8uwTA/69220/matthewshomepage.jpg",
      "credit": "Matthew's Restaurant",
      "creditUrl": "https://www.matthewsrestaurant.com"
    },
    "Mesa (Avondale)": {
      "src": "https://img1.wsimg.com/isteam/ip/75a3e1d0-17d3-495c-9391-a4f6ce2d2cff/fb_116316807249015_1440x1080.jpg",
      "credit": "Mesa",
      "creditUrl": "https://mesajax.com"
    }
  },
  "bodegas-manhattan": {
    "Blue Sky Deli (Hajji's) (East Harlem)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_3840,ar_4:3,g_center,f_auto/images/IMG_6122_2_1_ezsvcs",
      "credit": "The Infatuation",
      "creditUrl": "https://www.theinfatuation.com/new-york/reviews/blue-sky-deli"
    },
    "Sunny & Annie's Deli (East Village)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_3840,ar_4:3,g_center,f_auto/cms/guides/casual-outdoor-dining-nyc/EmilyS_SunnyAndAnniesDeli_SummerGuide_Sandwiches_006",
      "credit": "Emily Schindler / The Infatuation",
      "creditUrl": "https://www.theinfatuation.com/new-york/guides/casual-outdoor-dining-nyc"
    },
    "Punjabi Grocery & Deli (East Village)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/mH8f1liPO9sJR7wiYcUSgw/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/punjabi-grocery-and-deli-new-york"
    }
  },
  "best-selling-games-all-time": {
    "Tetris (1988, 520M)": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Tetris_logo_2019.svg/1280px-Tetris_logo_2019.svg.png",
      "credit": "Tetris / The Tetris Company",
      "creditUrl": "https://tetris.com/"
    },
    "Minecraft (2011, 350M)": {
      "src": "https://upload.wikimedia.org/wikipedia/en/b/be/Minecraft_game_logo_2023.png",
      "credit": "Mojang Studios",
      "creditUrl": "https://www.minecraft.net/"
    },
    "Grand Theft Auto V (2013, 225M)": {
      "src": "https://upload.wikimedia.org/wikipedia/en/a/a5/Grand_Theft_Auto_V.png",
      "credit": "Rockstar Games",
      "creditUrl": "https://en.wikipedia.org/wiki/Grand_Theft_Auto_V"
    }
  },
  "best-basketball-player-all-time": {
    "Michael Jordan": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/8/88/Michael_Jordan.jpg",
      "credit": "Joshua Massel / Wikimedia Commons",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:Michael_Jordan.jpg"
    },
    "LeBron James": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/c/cf/LeBron_James_%2851960276445%29_%28cropped%29.jpg",
      "credit": "Erik Drost / Wikimedia Commons",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:LeBron_James_(51960276445)_(cropped).jpg"
    },
    "Kareem Abdul-Jabbar": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/d/de/Kareem_Abdul-Jabbar_1974.jpeg",
      "credit": "Frank Bryan / The Sporting News",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:Kareem_Abdul-Jabbar_1974.jpeg"
    }
  },
  "pizza-miami": {
    "Miami Slice (Wynwood)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/nOgfJeSQQBR4f7Kng7DIZw/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/miami-slice-miami"
    },
    "La Leggenda (Miami Beach)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/mPGdsOKl2vlZLQg3F5MveQ/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/la-leggenda-pizzeria-miami-beach"
    },
    "Eleventh Street Pizza (Downtown)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/w8igM5dZ5bKNnNxHU9I_Pg/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/eleventh-street-pizza-downtown-miami-miami"
    }
  },
  "green-chile-cheeseburgers-new-mexico": {
    "Sparky's (Hatch)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/NZbIi0N8Veqdr9KCNZoT4g/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/sparkys-bbq-and-espresso-hatch"
    },
    "Buckhorn Tavern (San Antonio)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/oD6HrTZivXAfb3t3pB3Jeg/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/buckhorn-tavern-san-antonio-4"
    },
    "Tumbleweeds Diner (Magdalena)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/MhUo2S_A4CAfZ1RKbiDEsA/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/tumbleweeds-diner-magdalena"
    }
  },
  "crab-cakes-maryland": {
    "Koco's Pub (Baltimore)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/HKI-Cg8S4lyqSmmebqqPZQ/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/kocos-pub-baltimore"
    },
    "G&M Restaurant (Linthicum Heights)": {
      "src": "https://gandmcrabcakes.com/media/catalog/product/cache/6517c62f5899ad6aa0ba23ceb3eeff97/c/r/crab-cake-8oz-1__34449_1_.jpg",
      "credit": "G&M Crab Cakes",
      "creditUrl": "https://gandmcrabcakes.com/crab-cake-8oz"
    },
    "Faidley's (Baltimore)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/3zZTmFUom22u69QHC52kzA/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/faidleys-seafood-baltimore-3"
    }
  },
  "meat-thermometers": {
    "Thermapen ONE": {
      "src": "https://m.media-amazon.com/images/I/71s28hOEP5L._SL1500_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B0DC8MWQ8K"
    },
    "Classic Thermapen": {
      "src": "https://m.media-amazon.com/images/I/71tvHNkQesL._SL1500_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B0DC8776HK"
    },
    "Lavatools Javelin PRO Duo": {
      "src": "https://m.media-amazon.com/images/I/51Ero6ZalNL._SL1080_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B07D3M9BB5"
    }
  },
  "french-presses": {
    "Espro P7": {
      "src": "https://m.media-amazon.com/images/I/71eDEOPKZCL._AC_SL1500_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B011WTMNWA"
    },
    "Frieling Double-Walled Stainless French Press": {
      "src": "https://m.media-amazon.com/images/I/61P1EOqVQWL._AC_SL1500_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B00009ADDR"
    },
    "Bodum Chambord": {
      "src": "https://m.media-amazon.com/images/I/61V-VGqgHqL._AC_SL1500_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B00008XEWG"
    }
  },
  "pour-over-coffee-makers": {
    "Hario V60": {
      "src": "https://m.media-amazon.com/images/I/51cCw+yG9BL._AC_SL1500_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B000P4D5HG"
    },
    "Chemex Eight Cup Classic": {
      "src": "https://m.media-amazon.com/images/I/51rEZwQAmqL._AC_SL1009_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B000I1WP7W"
    },
    "Kalita Wave": {
      "src": "https://m.media-amazon.com/images/I/51Vk5vuFw9L._AC_SL1000_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B000X1AM0Y"
    }
  },
  "cold-brew-coffee-makers": {
    "Toddy Cold Brew System": {
      "src": "https://m.media-amazon.com/images/I/31H4MYf2WqL._AC_SL1500_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B07BWWG5N4"
    },
    "OXO Good Grips Cold Brew Coffee Maker": {
      "src": "https://m.media-amazon.com/images/I/71n1eH8llzL._AC_SL1500_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B00JVSVM36"
    },
    "KitchenAid Cold Brew Coffee Maker": {
      "src": "https://m.media-amazon.com/images/I/71ECDyIAXdL._AC_SL1280_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B06XNVZDC7"
    }
  },
  "milk-frothers": {
    "Breville the Milk Café (BMF600XL)": {
      "src": "https://m.media-amazon.com/images/I/71awmB01rhL._AC_SL1500_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B004RCNJ9Q"
    },
    "Nespresso Aeroccino3": {
      "src": "https://m.media-amazon.com/images/I/61tY-TRM7CL._AC_SL1500_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B06XHWQJKN"
    },
    "Smeg MFF01 Milk Frother": {
      "src": "https://m.media-amazon.com/images/I/41uYWP7KrqL._AC_SL1080_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B0DBJ8JDN2"
    }
  },
  "bidet-attachments": {
    "Tushy Classic 3.0": {
      "src": "https://m.media-amazon.com/images/I/513apMqQW1L._AC_SL1500_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B08VS11Z1N"
    },
    "Bio Bidet Bliss BB-2000": {
      "src": "https://m.media-amazon.com/images/I/61hYGhejFlL._AC_SL1500_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B00GRM11R6"
    },
    "Toto Washlet C5": {
      "src": "https://m.media-amazon.com/images/I/51FF8wfQOoL._AC_SL1500_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B08S473TPS"
    }
  },
  "camping-tents": {
    "The North Face Wawona 6": {
      "src": "https://m.media-amazon.com/images/I/51vHSVW41eL._AC_SL1200_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B0DG5YVNRK"
    },
    "NEMO Aurora Highrise 4": {
      "src": "https://m.media-amazon.com/images/I/61rutUfut6L._AC_SL1500_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B09PH5MDLK"
    },
    "Big Agnes Copper Spur HV UL2": {
      "src": "https://m.media-amazon.com/images/I/71LHs4Z7btL._AC_SL1500_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B08175941C"
    }
  },
  "sleeping-bags": {
    "Western Mountaineering UltraLite": {
      "src": "https://m.media-amazon.com/images/I/610XR18G4WL._AC_SL1200_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B0178QPZDA"
    },
    "Feathered Friends Swallow UL 20": {
      "src": "https://featheredfriends.com/cdn/shop/files/feathered-friends-swallow-ul-ultralight-down-20-degree-30-degree-sleeping-bag--flame-orange-with-cerulean-accent-zipped.jpg?v=1760383114&width=1080",
      "credit": "Feathered Friends",
      "creditUrl": "https://featheredfriends.com"
    },
    "Western Mountaineering MegaLite": {
      "src": "https://m.media-amazon.com/images/I/71F5GU5w-UL._AC_SL1500_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B0722PXTVH"
    }
  },
  "lego-sets": {
    "LEGO Icons Titanic (10294)": {
      "src": "https://m.media-amazon.com/images/I/61l9pB4kA+L._AC_SL1000_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B09GPPP2NK"
    },
    "LEGO Star Wars UCS Millennium Falcon (75192)": {
      "src": "https://m.media-amazon.com/images/I/81nIauS111L._AC_SL1500_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B075SDMMMV"
    },
    "LEGO Icons Eiffel Tower (10307)": {
      "src": "https://m.media-amazon.com/images/I/61KXGWKURIL._AC_SL1486_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B0BMQJXNQ7"
    }
  },
  "outdoor-pizza-ovens": {
    "Gozney Arc": {
      "src": "https://m.media-amazon.com/images/I/613WxP50iEL._AC_SL1500_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B0DVZTQGV9"
    },
    "Ooni Karu 2": {
      "src": "https://m.media-amazon.com/images/I/51KFa1Jp2tL._AC_SL1000_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B0DQ8R4TYT"
    },
    "Solo Stove Pi Prime": {
      "src": "https://m.media-amazon.com/images/I/71VgHcCCUAL._AC_SL1500_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B0CG2MB8YB"
    }
  },
  "gatorade-flavors": {
    "Glacier Freeze": {
      "src": "https://i5.walmartimages.com/seo/2X-Gatorade-Glacier-Freeze-Sports-Drink-28-fl-oz-Bottle_d1cd5cb6-9d66-4e56-a1c5-7f6c6720b9ac.31332ca36a36aeec72b6645bd2c13c41.jpeg",
      "credit": "Gatorade",
      "creditUrl": "https://www.gatorade.com"
    },
    "Orange": {
      "src": "https://i5.walmartimages.com/seo/Gatorade-Thirst-Quencher-Orange-28oz-Bottle_08e92cf5-b27a-4c0f-a7f1-cc816546357c_1.871e04fcef49c26bc171ec1b51789309.jpeg",
      "credit": "Gatorade",
      "creditUrl": "https://www.gatorade.com"
    },
    "Glacier Cherry": {
      "src": "https://i5.walmartimages.com/seo/Gatorade-Frost-Glacier-Cherry-20-oz_12a5f136-ecc1-4509-b83d-2abe7558f222.9f066ae53b7669005c2b75e836ca35a6.jpeg",
      "credit": "Gatorade",
      "creditUrl": "https://www.gatorade.com"
    }
  },
  "pop-tarts-flavors": {
    "Frosted Raspberry": {
      "src": "https://i5.walmartimages.com/seo/Pop-Tarts-Frosted-Raspberry-Instant-Breakfast-Toaster-Pastries-Shelf-Stable-Ready-to-Eat-27-oz-16-Count-Box_bf626fb3-a0d5-483d-809a-cfcfe56a3e3d.5ec4bab381271ce0c37b66907d5eb37e.jpeg?odnHeight=640&odnWidth=640&odnBg=FFFFFF",
      "credit": "Pop-Tarts",
      "creditUrl": "https://www.poptarts.com"
    },
    "Frosted Blueberry": {
      "src": "https://i5.walmartimages.com/seo/Pop-Tarts-Frosted-Blueberry-Instant-Breakfast-Toaster-Pastries-Shelf-Stable-Ready-to-Eat-13-5-oz-8-Count-Box_cabf4db1-7c7a-49a7-9d5e-498d2d53c680.d7259c6c5e3bbea1e5c1f3e9f6e02f48.jpeg",
      "credit": "Pop-Tarts",
      "creditUrl": "https://www.poptarts.com"
    },
    "Frosted Cherry": {
      "src": "https://i5.walmartimages.com/seo/Pop-Tarts-Frosted-Cherry-Pack-of-12_81180d28-a851-449c-a4d2-40b48440b5a7.728626ff1d28db7c9ca8153f1500ad3b.jpeg",
      "credit": "Pop-Tarts",
      "creditUrl": "https://www.poptarts.com"
    }
  },
  "yogurt-brands": {
    "Fage": {
      "src": "https://www.instacart.com/assets/domains/product-image/file/large_1882b4d9-a02a-45ab-a9e4-24adafce8e1a.png",
      "credit": "FAGE",
      "creditUrl": "https://www.fageusa.com"
    },
    "Siggi's": {
      "src": "https://www.siggis.ca/wp-content/uploads/2025/01/newvanillaen.png",
      "credit": "Siggi's",
      "creditUrl": "https://siggis.com"
    },
    "Chobani": {
      "src": "https://i5.walmartimages.com/seo/Chobani-Non-Fat-Greek-Yogurt-Strawberry-5-3-oz-Cup_d254e4ca-5992-4056-81b7-c61f284408af.d25452f5100b0e35e2b7bdab2536b20b.png",
      "credit": "Chobani",
      "creditUrl": "https://www.chobani.com"
    }
  },
  "fast-food-fries": {
    "Arby's (Curly Fries)": {
      "src": "https://stories.inspirebrands.com/wp-content/uploads/2018/08/Arbys-1.jpg",
      "credit": "Arby's",
      "creditUrl": "https://www.arbys.com/"
    },
    "McDonald's (World Famous Fries)": {
      "src": "https://www.tasteofhome.com/wp-content/uploads/2022/10/GettyImages-1215221471.jpg",
      "credit": "Taste of Home",
      "creditUrl": "https://www.tasteofhome.com/"
    },
    "Wendy's (Natural-Cut Fries)": {
      "src": "https://media-cldnry.s-nbcnews.com/image/upload/t_social_share_1200x630_center,f_auto,q_auto:best/newscms/2021_34/1766539/wendys-fries-main-khu-210827.jpg",
      "credit": "NBC News",
      "creditUrl": "https://www.nbcnews.com/"
    },
    "Five Guys (Cajun Fries)": {
      "src": "https://www.fiveguys.at/wp-content/uploads/sites/38/2025/06/FG-Fries.jpg",
      "credit": "Five Guys",
      "creditUrl": "https://www.fiveguys.com/"
    }
  },
  "sous-vide-machines": {
    "Anova Precision Cooker 3.0": {
      "src": "https://m.media-amazon.com/images/I/61ufN4G1TeL._AC_SL1500_.jpg",
      "credit": "Anova Culinary",
      "creditUrl": "https://www.amazon.com/dp/B0BQ9F56WV"
    },
    "Breville Joule Turbo": {
      "src": "https://m.media-amazon.com/images/I/51Q5bcZKm8L._AC_SL1500_.jpg",
      "credit": "Breville",
      "creditUrl": "https://www.amazon.com/dp/B0C384T4P2"
    },
    "Greater Goods Precision Cooker": {
      "src": "https://m.media-amazon.com/images/I/71tTQDyDoZL._AC_SL1500_.jpg",
      "credit": "Greater Goods",
      "creditUrl": "https://www.amazon.com/dp/B08S316BZ8"
    }
  },
  "electric-toothbrushes": {
    "Oral-B iO Series 10": {
      "src": "https://m.media-amazon.com/images/I/71DGBb2LXVL._AC_SL1500_.jpg",
      "credit": "Oral-B",
      "creditUrl": "https://www.amazon.com/dp/B0FML4FZSF"
    },
    "Philips Sonicare 4100": {
      "src": "https://m.media-amazon.com/images/I/71Nuz9Sjl1L._AC_SL1500_.jpg",
      "credit": "Philips Sonicare",
      "creditUrl": "https://www.amazon.com/dp/B09LD7WRVS"
    },
    "Oral-B Pro 1000": {
      "src": "https://m.media-amazon.com/images/I/512V1GCv-zL._SL1000_.jpg",
      "credit": "Oral-B",
      "creditUrl": "https://www.amazon.com/dp/B003UKM9CO"
    }
  },
  "3d-printers": {
    "Prusa Core One": {
      "src": "https://m.media-amazon.com/images/I/61FlzVY0v2L._AC_SL1119_.jpg",
      "credit": "Prusa Research",
      "creditUrl": "https://www.amazon.com/dp/B0FCFKYXYS"
    },
    "Bambu Lab H2D": {
      "src": "https://portal.bblmw.com/nav/product/H2D-d64281665b97b.png",
      "credit": "Bambu Lab",
      "creditUrl": "https://bambulab.com/en-us/h2d"
    },
    "Elegoo Centauri Carbon": {
      "src": "https://m.media-amazon.com/images/I/710ZDbLvCYL._AC_SL1500_.jpg",
      "credit": "Elegoo",
      "creditUrl": "https://www.amazon.com/dp/B0FDQP54X8"
    }
  },
  "drones-beginners": {
    "DJI Mini 5 Pro": {
      "src": "https://m.media-amazon.com/images/I/61+srvHP0hL._AC_SL1500_.jpg",
      "credit": "DJI",
      "creditUrl": "https://www.amazon.com/dp/B0F6XJ7W9M"
    },
    "DJI Flip": {
      "src": "https://m.media-amazon.com/images/I/717eypARTkL._AC_SL1500_.jpg",
      "credit": "DJI",
      "creditUrl": "https://www.amazon.com/dp/B0DJ1H6KCP"
    },
    "DJI Mini 4K": {
      "src": "https://m.media-amazon.com/images/I/61TcjJ4qDZL._AC_SL1500_.jpg",
      "credit": "DJI",
      "creditUrl": "https://www.amazon.com/dp/B0CXJDDJ9X"
    }
  },
  "smart-light-bulbs": {
    "Philips Hue White and Color Ambiance A19": {
      "src": "https://m.media-amazon.com/images/I/61oNVkDsndL._AC_SL1500_.jpg",
      "credit": "Philips Hue",
      "creditUrl": "https://www.amazon.com/dp/B07QWB3H1Q"
    },
    "LIFX Color A19": {
      "src": "https://m.media-amazon.com/images/I/7177KSsa37L._AC_SL1500_.jpg",
      "credit": "LIFX",
      "creditUrl": "https://www.amazon.com/dp/B08BKZFHQQ"
    },
    "TP-Link Kasa Smart Bulb KL125": {
      "src": "https://m.media-amazon.com/images/I/61JbxseNV3L._AC_SL1500_.jpg",
      "credit": "TP-Link Kasa",
      "creditUrl": "https://www.amazon.com/dp/B08TB6VXFL"
    }
  },
  "smart-locks": {
    "Yale Assure Lock 2": {
      "src": "https://m.media-amazon.com/images/I/61KntyTh3JL._AC_SL1500_.jpg",
      "credit": "Yale",
      "creditUrl": "https://www.amazon.com/dp/B0B9HZRC7X"
    },
    "August Wi-Fi Smart Lock (4th Gen)": {
      "src": "https://m.media-amazon.com/images/I/61e592E6PqL._AC_SL1500_.jpg",
      "credit": "August",
      "creditUrl": "https://www.amazon.com/dp/B082VXK9CK"
    },
    "Schlage Encode Plus": {
      "src": "https://m.media-amazon.com/images/I/610EFNKyY4L._AC_SL1500_.jpg",
      "credit": "Schlage",
      "creditUrl": "https://www.amazon.com/dp/B09RS6C1SJ"
    }
  },
  "smart-thermostats": {
    "Google Nest Learning Thermostat (4th Gen)": {
      "src": "https://lh3.googleusercontent.com/XxwSWRqofPLTTO09iEw_xxknHCHTA_rYl59Ru4CYVAcJEuExZMJeRZhQqs3lQ6aQ5Rt2r9rUm306kzzhXa0dSHk12h75-yTgLg4=rj-sc0xffffffff",
      "credit": "Google",
      "creditUrl": "https://store.google.com/us/product/nest_learning_thermostat_4th_gen"
    },
    "Honeywell Home X8S Smart Thermostat": {
      "src": "https://m.media-amazon.com/images/I/51fJ9cGxCbL._AC_SL1500_.jpg",
      "credit": "Honeywell",
      "creditUrl": "https://www.amazon.com/dp/B0FJMSMZBB"
    },
    "Ecobee Smart Thermostat Essential": {
      "src": "https://m.media-amazon.com/images/I/51yVvRtBLBL._AC_SL1500_.jpg",
      "credit": "Ecobee",
      "creditUrl": "https://www.amazon.com/dp/B0DT9MC2Z9"
    }
  },
  "video-doorbells": {
    "Google Nest Doorbell (battery)": {
      "src": "https://m.media-amazon.com/images/I/311me62A6bL._AC_SL1000_.jpg",
      "credit": "Google",
      "creditUrl": "https://www.amazon.com/dp/B09FCLPLWX"
    },
    "Ring Wired Doorbell Pro": {
      "src": "https://m.media-amazon.com/images/I/819MRg02R2L._SL1500_.jpg",
      "credit": "Ring",
      "creditUrl": "https://www.amazon.com/dp/B0F151GFYR"
    },
    "Ring Battery Doorbell Plus": {
      "src": "https://m.media-amazon.com/images/I/71a7zFMFngL._SL1500_.jpg",
      "credit": "Ring",
      "creditUrl": "https://www.amazon.com/dp/B0F14N7HHH"
    }
  },
  "home-security-cameras": {
    "Ring Stick Up Cam Pro": {
      "src": "https://m.media-amazon.com/images/I/61Cd-BeF68L._SL1500_.jpg",
      "credit": "Ring",
      "creditUrl": "https://www.amazon.com/dp/B0C5QRZ47P"
    },
    "Arlo Pro 5S 2K": {
      "src": "https://m.media-amazon.com/images/I/61od55N7+jL._AC_SL1500_.jpg",
      "credit": "Arlo",
      "creditUrl": "https://www.amazon.com/dp/B0DDRT2T87"
    },
    "Eufy Indoor Cam S350": {
      "src": "https://m.media-amazon.com/images/I/41ABLZ+umAL._AC_SL1500_.jpg",
      "credit": "Eufy",
      "creditUrl": "https://www.amazon.com/dp/B0CD7F1M9R"
    }
  },
  "bluetooth-item-trackers": {
    "Apple AirTag": {
      "src": "https://m.media-amazon.com/images/I/611DjYhflAL._AC_SL1500_.jpg",
      "credit": "Apple",
      "creditUrl": "https://www.amazon.com/dp/B0GJTXVN9Z"
    },
    "Samsung Galaxy SmartTag2": {
      "src": "https://m.media-amazon.com/images/I/61M4PsB+WNL._AC_SL1500_.jpg",
      "credit": "Samsung",
      "creditUrl": "https://www.amazon.com/dp/B0CJYL1Q9S"
    },
    "Chipolo Pop": {
      "src": "https://m.media-amazon.com/images/I/51cwlAMjuBL._AC_SL1500_.jpg",
      "credit": "Chipolo",
      "creditUrl": "https://www.amazon.com/dp/B0DZXTLD38"
    }
  },
  "power-banks": {
    "Anker MagGo Power Bank (10K)": {
      "src": "https://m.media-amazon.com/images/I/618crocn6IL._AC_SL1500_.jpg",
      "credit": "Anker",
      "creditUrl": "https://www.amazon.com/dp/B0D7DKJ75M"
    },
    "Anker Laptop Power Bank (25K)": {
      "src": "https://m.media-amazon.com/images/I/61Kin0Hx98L._AC_SL1500_.jpg",
      "credit": "Anker",
      "creditUrl": "https://www.amazon.com/dp/B0DCBB2YTR"
    },
    "Anker Nano Power Bank": {
      "src": "https://m.media-amazon.com/images/I/617HK4HmyIL._AC_SL1500_.jpg",
      "credit": "Anker",
      "creditUrl": "https://www.amazon.com/dp/B0DGKWTQQC"
    }
  },
  "wireless-charging-stations": {
    "Belkin UltraCharge Pro 3-in-1": {
      "src": "https://m.media-amazon.com/images/I/61HYLqCnpGL._AC_SL1500_.jpg",
      "credit": "Belkin",
      "creditUrl": "https://www.amazon.com/dp/B0FMC3PW5W"
    },
    "Anker MagGo 3-in-1": {
      "src": "https://m.media-amazon.com/images/I/71by5rKEpbL._AC_SL1500_.jpg",
      "credit": "Anker",
      "creditUrl": "https://www.amazon.com/dp/B0DDQ71B9P"
    },
    "Belkin BoostCharge Pro 3-in-1 (MagSafe)": {
      "src": "https://m.media-amazon.com/images/I/61xZiF10SLL._AC_SL1500_.jpg",
      "credit": "Belkin",
      "creditUrl": "https://www.amazon.com/dp/B0D6RZT4HH"
    }
  },
  "ultrawide-monitors": {
    "Asus ROG Swift OLED PG34WCDM": {
      "src": "https://m.media-amazon.com/images/I/91cnrruFtQL._AC_SL1500_.jpg",
      "credit": "Asus",
      "creditUrl": "https://www.amazon.com/dp/B0F73CKR9D"
    },
    "Alienware AW3425DW": {
      "src": "https://m.media-amazon.com/images/I/61GmLXrqJ-L._AC_SL1500_.jpg",
      "credit": "Dell Alienware",
      "creditUrl": "https://www.amazon.com/dp/B0F6724X5N"
    },
    "Alienware AW3423DWF": {
      "src": "https://m.media-amazon.com/images/I/61TLaeZDe0L._AC_SL1500_.jpg",
      "credit": "Dell Alienware",
      "creditUrl": "https://www.amazon.com/dp/B0BP94J8VD"
    }
  },
  "dash-cams": {
    "Viofo A329S": {
      "src": "https://m.media-amazon.com/images/I/61mE3dGBFWL._AC_SL1500_.jpg",
      "credit": "Viofo",
      "creditUrl": "https://www.amazon.com/dp/B0FFT3YBH7"
    },
    "Nextbase iQ": {
      "src": "https://cdn11.bigcommerce.com/s-jpkc0tnv4j/products/1518/images/10541/iQ_4kcamera__52709.1743838838__18782.1748846533.386.513.png?c=1",
      "credit": "Nextbase",
      "creditUrl": "https://nextbase.com/smart-dash-cams/iq-smart-dash-cam/"
    },
    "Vantrue N5S": {
      "src": "https://m.media-amazon.com/images/I/71d+kyDqOzL._AC_SL1500_.jpg",
      "credit": "Vantrue",
      "creditUrl": "https://www.amazon.com/dp/B0F8BWJHW4"
    }
  },
  "webcams": {
    "Logitech MX Brio 705": {
      "src": "https://m.media-amazon.com/images/I/71XftpLbQML._AC_SL1500_.jpg",
      "credit": "Logitech",
      "creditUrl": "https://www.amazon.com/dp/B0CS32LM8W"
    },
    "Elgato Facecam MK.2": {
      "src": "https://m.media-amazon.com/images/I/61J7cBOVGWL._AC_SL1500_.jpg",
      "credit": "Elgato",
      "creditUrl": "https://www.amazon.com/dp/B0CW1S7XP5"
    },
    "Razer Kiyo Pro Ultra": {
      "src": "https://m.media-amazon.com/images/I/71UuQirlZhL._AC_SL1500_.jpg",
      "credit": "Razer",
      "creditUrl": "https://www.amazon.com/dp/B0CT6FFK4R"
    }
  },
  "mesh-wifi-systems": {
    "TP-Link Deco BE63": {
      "src": "https://m.media-amazon.com/images/I/61DeeFwkrpL._AC_SL1500_.jpg",
      "credit": "TP-Link",
      "creditUrl": "https://www.amazon.com/dp/B0CN8QLS4K"
    },
    "Asus ZenWiFi BQ16 Pro": {
      "src": "https://m.media-amazon.com/images/I/61hMRuRowfL._AC_SL1500_.jpg",
      "credit": "Asus",
      "creditUrl": "https://www.amazon.com/dp/B0D398YQPN"
    },
    "Eero Max 7": {
      "src": "https://m.media-amazon.com/images/I/61hdStMsPbL._SL1500_.jpg",
      "credit": "Amazon eero",
      "creditUrl": "https://www.amazon.com/dp/B09HJJN7MS"
    }
  },
  "portable-ssds": {
    "Samsung T9": {
      "src": "https://m.media-amazon.com/images/I/71EESd1deTL._AC_SL1500_.jpg",
      "credit": "Samsung",
      "creditUrl": "https://www.amazon.com/dp/B0CHFSWM2P"
    },
    "SanDisk Extreme Pro Portable SSD": {
      "src": "https://m.media-amazon.com/images/I/71z2lEHwfNL._AC_SL1500_.jpg",
      "credit": "SanDisk",
      "creditUrl": "https://www.amazon.com/dp/B08GV4YYV7"
    },
    "WD My Passport SSD": {
      "src": "https://m.media-amazon.com/images/I/81y8P1up-PL._AC_SL1500_.jpg",
      "credit": "Western Digital",
      "creditUrl": "https://www.amazon.com/dp/B08F27QGHX"
    }
  },
  "mini-pcs": {
    "Apple Mac mini (M4)": {
      "src": "https://m.media-amazon.com/images/I/615y53Ws-NL._AC_SL1500_.jpg",
      "credit": "Apple",
      "creditUrl": "https://www.amazon.com/dp/B0DLBX4B1K"
    },
    "Geekom A9 Max": {
      "src": "https://m.media-amazon.com/images/I/81YhbWb627L._AC_SL1500_.jpg",
      "credit": "Geekom",
      "creditUrl": "https://www.amazon.com/dp/B0GLF2KYKN"
    },
    "Minisforum G1 Pro": {
      "src": "https://m.media-amazon.com/images/I/51YcOotEzJL._AC_SL1500_.jpg",
      "credit": "Minisforum",
      "creditUrl": "https://www.amazon.com/dp/B0GHYMV62Q"
    }
  },
  "streaming-media-players": {
    "Apple TV 4K": {
      "src": "https://m.media-amazon.com/images/I/61HGvrbamzL._AC_SL1500_.jpg",
      "credit": "Apple",
      "creditUrl": "https://www.amazon.com/dp/B0BJMGB95J"
    },
    "Google TV Streamer": {
      "src": "https://m.media-amazon.com/images/I/512dcn5HYFL._AC_SL1500_.jpg",
      "credit": "Google",
      "creditUrl": "https://www.amazon.com/dp/B0FN1N8HGT"
    },
    "Roku Streaming Stick Plus": {
      "src": "https://m.media-amazon.com/images/I/71Nh6Ngs+-L._AC_SL1500_.jpg",
      "credit": "Roku",
      "creditUrl": "https://www.amazon.com/dp/B0DXY833HV"
    }
  },
  "fitness-trackers": {
    "Fitbit Charge 6": {
      "src": "https://m.media-amazon.com/images/I/61ZtqtvoD2L._AC_SL1500_.jpg",
      "credit": "Fitbit",
      "creditUrl": "https://www.amazon.com/dp/B0CC62ZG1M"
    },
    "Garmin Vivoactive 6": {
      "src": "https://m.media-amazon.com/images/I/61XnMN3n4wL._AC_SL1500_.jpg",
      "credit": "Garmin",
      "creditUrl": "https://www.amazon.com/dp/B0F38FCHD2"
    },
    "Oura Ring 4": {
      "src": "https://m.media-amazon.com/images/I/51ul5++ZdWL._AC_SL1000_.jpg",
      "credit": "Oura",
      "creditUrl": "https://www.amazon.com/dp/B0D9WT1S2T"
    }
  },
  "hotels-abu-dhabi": {
    "Emirates Palace Mandarin Oriental (Corniche)": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/3/36/Emirates_Palace.jpg",
      "credit": "Wikimedia Commons",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:Emirates_Palace.jpg"
    },
    "Conrad Abu Dhabi Etihad Towers (Corniche)": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/5/5d/Etihad_Tower%E3%81%A8%E3%82%A8%E3%83%9F%E3%83%AC%E3%83%BC%E3%83%84%E3%83%BB%E3%83%91%E3%83%AC%E3%82%B9_-_panoramio.jpg",
      "credit": "Wikimedia Commons",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:Etihad_Tower%E3%81%A8%E3%82%A8%E3%83%9F%E3%83%AC%E3%83%BC%E3%83%84%E3%83%BB%E3%83%91%E3%83%AC%E3%82%B9_-_panoramio.jpg"
    },
    "Four Seasons Hotel Abu Dhabi (Al Maryah Island)": {
      "src": "https://www.fourseasons.com/content/dam/fourseasons/images/web/ABS/ABS_568_original.jpg",
      "credit": "Four Seasons",
      "creditUrl": "https://www.fourseasons.com/abudhabi/"
    }
  },
  "historical-fiction-1980s": {
    "The Sunne in Splendour (Sharon Kay Penman)": {
      "src": "https://m.media-amazon.com/images/I/51h87Duc9IL._SL1500_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B003XYERRM?tag=cgurus-20"
    },
    "Lonesome Dove (Larry McMurtry)": {
      "src": "https://m.media-amazon.com/images/I/81diGP4f7wL._SL1500_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B003NE6HD4?tag=cgurus-20"
    },
    "The Pillars of the Earth (Ken Follett)": {
      "src": "https://m.media-amazon.com/images/I/91iROz3B17L._SL1500_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B003TO5GXU?tag=cgurus-20"
    }
  },
  "historical-fiction-1990s": {
    "Memoirs of a Geisha (Arthur Golden)": {
      "src": "https://m.media-amazon.com/images/I/81Fghf6iNTL._SL1500_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B000FCKMEM?tag=cgurus-20"
    },
    "The Poisonwood Bible (Barbara Kingsolver)": {
      "src": "https://m.media-amazon.com/images/I/61cj+lKxv7L._SL1500_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B000QTE9WU?tag=cgurus-20"
    },
    "The English Patient (Michael Ondaatje)": {
      "src": "https://m.media-amazon.com/images/I/41AkGAhWThL._SL1500_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B004JHYRYU?tag=cgurus-20"
    }
  },
  "historical-fiction-2000s": {
    "The Book Thief (Markus Zusak)": {
      "src": "https://m.media-amazon.com/images/I/812T6ZyB9HL._SL1500_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B000XUBFE2?tag=cgurus-20"
    },
    "The Kite Runner (Khaled Hosseini)": {
      "src": "https://m.media-amazon.com/images/I/81QSukPYvML._SL1500_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B000OCXGZA?tag=cgurus-20"
    },
    "A Thousand Splendid Suns (Khaled Hosseini)": {
      "src": "https://m.media-amazon.com/images/I/A1alIcqdZfL._SL1500_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B000SCHC0Q?tag=cgurus-20"
    }
  },
  "historical-fiction-2010s": {
    "Pachinko (Min Jin Lee)": {
      "src": "https://m.media-amazon.com/images/I/81o0W3k8oyL._SL1500_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B01GZY28JA?tag=cgurus-20"
    },
    "All the Light We Cannot See (Anthony Doerr)": {
      "src": "https://m.media-amazon.com/images/I/81+PKzbzR2L._SL1500_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B00DPM7TIG?tag=cgurus-20"
    },
    "Homegoing (Yaa Gyasi)": {
      "src": "https://m.media-amazon.com/images/I/91PJlFlDtdL._SL1500_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B015VACH4U?tag=cgurus-20"
    }
  },
  "cocktails-monaco": {
    "Blue Gin (Larvotto)": {
      "src": "https://asset.montecarlosbm.com/styles/hero_image_desktop/s3/media/image/009-MCBAY-BLUE-GIN.jpg.jpeg",
      "credit": "Monte-Carlo Société des Bains de Mer",
      "creditUrl": "https://www.montecarlosbm.com/en/bar-nightclub-monaco/the-blue-gin"
    },
    "Buddha-Bar Monte-Carlo": {
      "src": "https://asset.montecarlosbm.com/styles/hero_image_desktop/s3/media/orphea/bb_restaurant_0004_1_0.jpg.jpeg",
      "credit": "Monte-Carlo Société des Bains de Mer",
      "creditUrl": "https://www.montecarlosbm.com/en/restaurant-monaco/buddha-bar-monte-carlo"
    },
    "Bar Américain (Monte-Carlo)": {
      "src": "https://asset.montecarlosbm.com/styles/hero_image_desktop/s3/media/orphea/bar-americain-restaurant-hotel-de-paris-monte-carlo-bar-2024-022_0.jpg.jpeg",
      "credit": "Monte-Carlo Société des Bains de Mer",
      "creditUrl": "https://www.montecarlosbm.com/en/nightlife/le-bar-americain"
    }
  },
  "live-music-bars-tampa": {
    "Crowbar (Ybor City)": {
      "src": "https://www.crowbarybor.com/wp-content/uploads/2025/11/crowbar-outside-2048x1536.jpg",
      "credit": "Crowbar",
      "creditUrl": "https://www.crowbarybor.com"
    },
    "Skipper's Smokehouse (Tampa)": {
      "src": "https://www.tripsavvy.com/thmb/mxcOFVPCuVbgTkNZVEmoTZ7dMAA=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/Skipperdome_Pics_301-5b75a6e8c9e77c0057894f9c.jpg",
      "credit": "TripSavvy",
      "creditUrl": "https://www.skipperssmokehouse.com"
    },
    "Lowry Parcade (Ybor City)": {
      "src": "https://lowryparcade.com/wp-content/uploads/2020/02/20200209_155608-1600x778.jpg",
      "credit": "Lowry Parcade",
      "creditUrl": "https://www.lowryparcade.com"
    }
  },
  "live-music-bars-miami": {
    "Lagniappe House (Edgewater)": {
      "src": "https://media.timeout.com/images/103903978/1372/772/image.jpg",
      "credit": "Time Out",
      "creditUrl": "https://www.timeout.com/miami"
    },
    "Jass Kitchen (Buena Vista)": {
      "src": "https://static01.sh-websites.com/uploads/sites/122/2025/05/WhatsApp-Image-2025-05-01-at-00.06.31.jpeg",
      "credit": "Jass Kitchen",
      "creditUrl": "https://www.jasskitchenmiami.com"
    },
    "Ball & Chain (Little Havana)": {
      "src": "https://ballandchainmiami.com/wp-content/uploads/2015/02/ballandchain-facebook.jpg",
      "credit": "Ball & Chain",
      "creditUrl": "https://ballandchainmiami.com"
    }
  },
  "live-music-bars-boston": {
    "Club Passim (Cambridge)": {
      "src": "https://www.passim.org/wp-content/uploads/2024/04/sashasolojesse-e1711992523898.jpg",
      "credit": "Club Passim",
      "creditUrl": "https://www.passim.org"
    },
    "The Lizard Lounge (Cambridge)": {
      "src": "https://lizardloungeclub.com/wp-content/uploads/LizardLounge-HomepageHero.jpg",
      "credit": "Lizard Lounge",
      "creditUrl": "https://lizardloungeclub.com"
    },
    "The Lilypad (Cambridge)": {
      "src": "https://images.squarespace-cdn.com/content/v1/5813d44e8419c25c3b432ef4/7c111a91-73d6-4ec2-8bff-63b74dc9789b/LizLieber_LIVENYC25_Keys.jpeg?format=1500w",
      "credit": "The Lilypad",
      "creditUrl": "https://www.lilypadinman.com"
    }
  },
  "live-music-bars-new-orleans": {
    "Kermit's Tremé Mother-in-Law Lounge (Tremé)": {
      "src": "https://media.cntraveler.com/photos/5ace5a2bb26d2142c4fb30f0/16:9/w_2560,c_limit/Mother-in-Law_Rush-Jagoe_2018_DSC_3151-(1)_hires.jpg",
      "credit": "Condé Nast Traveler",
      "creditUrl": "https://www.cntraveler.com/"
    },
    "The Spotted Cat Music Club (Marigny)": {
      "src": "https://assets.simpleviewinc.com/simpleview/image/upload/crm/neworleans/marty_peters_and_the_party_meters_2_431b0e9e-0369-d8a9-4bc6fe4e5fa4f478.jpg",
      "credit": "New Orleans & Company",
      "creditUrl": "https://www.neworleans.com"
    },
    "Cafe Negril (Marigny)": {
      "src": "https://i0.wp.com/boozingabroad.com/wp-content/uploads/2022/03/New-Orleans-cafe-negril.jpg",
      "credit": "Boozing Abroad",
      "creditUrl": "https://boozingabroad.com"
    },
    "d.b.a. (Marigny)": {
      "src": "https://images.squarespace-cdn.com/content/v1/659490e7976465783a380b2b/e88bea2c-33fd-4ae4-9c9e-a6db4f18f91b/dba-hero-8.jpg?format=1500w",
      "credit": "d.b.a. New Orleans",
      "creditUrl": "https://www.dbaneworleans.com"
    }
  },
  "dive-bars-prague": {
    "U Zlatého Tygra (Staré Město)": {
      "src": "https://fnb.com-photos.com/58146/u-zlateho-tygra-AF1QipPe5lJKh4vPwHvgXPjWfEhDA0ivhfHmmcpsYiIP.jpg",
      "credit": "U Zlatého Tygra",
      "creditUrl": "https://www.uzlatehotygra.cz/en"
    },
    "Vzorkovna Dog Bar (Nové Město)": {
      "src": "https://static.tildacdn.net/tild3639-3263-4562-a636-636164323131/PXL_20220806_2000413.jpg",
      "credit": "Vzorkovna",
      "creditUrl": "https://www.tripadvisor.com/Attraction_Review-g274707-d5535422-Reviews-Vzorkovna-Prague_Bohemia.html"
    },
    "U Vystřeleného Oka (Žižkov)": {
      "src": "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2b/bf/d6/b6/great-pub.jpg",
      "credit": "Tripadvisor",
      "creditUrl": "https://www.tripadvisor.com/Restaurant_Review-g274707-d4793462-Reviews-U_vystrelenyho_oka-Prague_Bohemia.html"
    }
  },
  "dive-bars-copenhagen": {
    "Bo-Bi Bar (Indre By)": {
      "src": "https://cdn.corner.inc/place-photo/AVzFdbkL5uj_1kLLCH892asjg71wHIbyOe-k3RGqBXu4u5gJGTGXktg1epL0vvj-XCD-RuBaUJfDE9jT-iSIRmZOx4ub69y3j0XmQn3at3dxLqA3SINRaTleZC6zPgXwrX2Xb4W1Lp9ZHu6ug_fHTS-HBMcfbhbbID7u_R-NK6ze6JyuREig.jpeg",
      "credit": "Corner",
      "creditUrl": "https://www.corner.inc/guides/copenhagen"
    },
    "Eiffel Bar (Christianshavn)": {
      "src": "https://files.guidedanmark.org/files/382/115154_Eiffel_Bar.jpg",
      "credit": "VisitCopenhagen",
      "creditUrl": "https://www.visitcopenhagen.com"
    },
    "Frederik VI (Frederiksberg)": {
      "src": "https://files.guidedanmark.org/files/382/269879_Facade_Frederik_VI_format.jpg",
      "credit": "VisitCopenhagen",
      "creditUrl": "https://www.visitcopenhagen.com"
    }
  },
  "live-music-hamptons": {
    "Stephen Talkhouse (Amagansett)": {
      "src": "https://www.stephentalkhouse.com/images/our-story/fixed/history_h.jpg",
      "credit": "Stephen Talkhouse",
      "creditUrl": "https://www.stephentalkhouse.com/"
    },
    "The Clubhouse (East Hampton)": {
      "src": "https://southforker.com/files/2023/06/image0-1024x698.jpeg",
      "credit": "The Clubhouse / Southforker",
      "creditUrl": "https://southforker.com/2024/05/24/where-to-hear-live-music-this-summer-in-the-hamptons/"
    },
    "Calissa (Water Mill)": {
      "src": "https://hamptons.com/wp-content/uploads/2024/07/Calissa.jpg",
      "credit": "Hamptons.com",
      "creditUrl": "https://hamptons.com/toast-to-the-summer-the-best-bars-in-the-hamptons/"
    }
  },
  "best-hotels-nyc": {
    "Four Seasons Hotel New York Downtown (Tribeca)": {
      "src": "https://media.cntraveler.com/photos/615486c44d2f698229de0ab8/16:9/w_2560%2Cc_limit/The%2520Four%2520Seasons%2520Hotel%2520New%2520York%2520Downtown_NYD_487.jpg",
      "credit": "Condé Nast Traveler",
      "creditUrl": "https://www.cntraveler.com/hotels/new-york/four-seasons-hotel-new-york-downtown"
    },
    "Mandarin Oriental, New York (Columbus Circle)": {
      "src": "https://images.scottdunn.com/c_fill,f_auto,q_auto,h_840,w_1400/united-states-of-america/accommodation/mandarin-oriental-central-park/725307-central-park-view-suite-mandarin-oriental-central-park-new-york-united-states-of-america-north-america-americas.jpeg",
      "credit": "Mandarin Oriental, New York",
      "creditUrl": "https://www.mandarinoriental.com/en/new-york/manhattan"
    },
    "The Fifth Avenue Hotel (NoMad)": {
      "src": "https://www.thefifthavenuehotel.com/wp-content/uploads/2021/08/17163344/Website-Facade-08.05-e1692286424785.jpg",
      "credit": "The Fifth Avenue Hotel",
      "creditUrl": "https://www.thefifthavenuehotel.com"
    }
  },
  "mystery-novels-classic": {
    "And Then There Were None (Agatha Christie)": {
      "src": "https://m.media-amazon.com/images/I/71ZbxsdqQBL._SL1500_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B000FC1RCI"
    },
    "The Complete Sherlock Holmes (Arthur Conan Doyle)": {
      "src": "https://m.media-amazon.com/images/I/71xITmhQ+4L._SL1500_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B079C4J9JK"
    },
    "Rebecca (Daphne du Maurier)": {
      "src": "https://m.media-amazon.com/images/I/718IOUURHEL._SL1500_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B00CO7FLJM"
    }
  },
  "cocktails-soho": {
    "South Soho Bar": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/LjnOzP9R2SYJBQDuQM2M5g/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/south-soho-bar-new-york"
    },
    "Milady's": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/0QElV7lKekku6QC6n9DNgA/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/milady-s-new-york"
    },
    "Kabin": {
      "src": "https://blog.resy.com/wp-content/uploads/2024/06/KABIN_Int_0624_LizClayman_008-2000x1125.jpg",
      "credit": "Resy / Liz Clayman",
      "creditUrl": "https://blog.resy.com/2024/06/kabin-nyc/"
    }
  },
  "best-breweries-dallas": {
    "Turning Point Beer (Bedford)": {
      "src": "https://methodarchitecture.com/wp-content/uploads/2025/09/AL_Turning-Point_09.jpg",
      "credit": "Method Architecture",
      "creditUrl": "https://methodarchitecture.com/work/turning-point-beer/"
    },
    "Celestial Beerworks (Oak Lawn)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/e4w_YBCBn89AvoPHO9PheQ/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/celestial-beerworks-dallas"
    },
    "Peticolas Brewing (Design District)": {
      "src": "https://www.peticolasbrewing.com/wp-content/uploads/2019/02/taproom-1.jpg",
      "credit": "Peticolas Brewing",
      "creditUrl": "https://www.peticolasbrewing.com/taproom"
    },
    "Four Corners Brewing (South Dallas)": {
      "src": "https://assets.simpleviewinc.com/simpleview/image/upload/crm/dallasites101/image001-2-_CAF85935-5056-A36A-0AD9AD1FAC83828C_cb009d75-5056-a36a-0a8a63eaadfe56a9.jpg",
      "credit": "Dallasites101",
      "creditUrl": "https://www.dallasites101.com/listing/four-corners-brewing-company/1648/"
    }
  },
  "pizza-boston": {
    "Picco (South End)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_3840,ar_4:3,g_center,f_auto/cms/reviews/picco/tinapicz_boston_picco_margherita",
      "credit": "The Infatuation / Tina Picz",
      "creditUrl": "https://www.theinfatuation.com/boston/reviews/picco"
    },
    "Regina Pizzeria (North End)": {
      "src": "https://bostonglobe-prod.cdn.arcpublishing.com/resizer/v2/35BVQDWSKAI6RC56MWVIOD7PLI.jpg?auth=9d7bf17a8701d369f6d9f211d0e8223e591f639359f3f92d5ff4043d81a367df&width=1440",
      "credit": "The Boston Globe",
      "creditUrl": "https://www.bostonglobe.com"
    },
    "Florina Pizzeria (Beacon Hill)": {
      "src": "https://images.squarespace-cdn.com/content/v1/57c24d5f414fb59d818e42b3/1600638745533-IANQ9FIPU9HVH39LMW9V/fullsizeoutput_592a.jpeg?format=2500w",
      "credit": "Florina Pizzeria · Paninoteca",
      "creditUrl": "https://www.florinapizza.com"
    },
    "Santarpio's Pizza (East Boston)": {
      "src": "https://www.thefoodlens.com/uploads/2016/11/SANTARPIOS_THE-FOOD-LENS_BRIAN-SAMUELS-PHOTOGRAPHY_JULY-2016-0285.jpg",
      "credit": "The Food Lens · Brian Samuels Photography",
      "creditUrl": "https://www.thefoodlens.com"
    }
  },
  "afterhours-bars-atlanta": {
    "The EARL (East Atlanta Village)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_1600,ar_4:3,g_center,f_auto/Atlanta_TheEarl_AmySinclair-8_xxbo57",
      "credit": "The Infatuation · Amy Sinclair",
      "creditUrl": "https://www.theinfatuation.com/atlanta/reviews/the-earl"
    },
    "Sister Louisa's Church of the Living Room & Ping Pong Emporium (Old Fourth Ward)": {
      "src": "https://media.cntraveler.com/photos/5b4e5af4bc8649092721985e/16:9/w_1600%2Cc_limit/Sister-Louisa's-Church-of-the-Living-Room-&-Ping-Pong-Emporium_DAVE-CRAWFORD__2018_DSC05419.jpg",
      "credit": "Condé Nast Traveler · Dave Crawford",
      "creditUrl": "https://www.cntraveler.com/bars/atlanta/sister-louisas-church-of-the-living-room-and-ping-pong-emporium"
    },
    "Our Bar ATL (Old Fourth Ward)": {
      "src": "https://static.wixstatic.com/media/c546f1_4351faeb8b4d4859a5c9ba27a84e689e~mv2.jpg/v1/fill/w_1678,h_800,al_c,q_85/c546f1_4351faeb8b4d4859a5c9ba27a84e689e~mv2.jpg",
      "credit": "Our Bar ATL",
      "creditUrl": "https://www.ourbaratl.com"
    }
  },
  "best-sushi-tampa-bay": {
    "Noble Rice (Channelside, Tampa)": {
      "src": "https://images.squarespace-cdn.com/content/v1/620a7dad1c252a1a17229849/1663617344151-DR3JFXFO4QOZ57DQJVPO/IMG_8129.JPG",
      "credit": "Noble Rice",
      "creditUrl": "https://www.noblericeco.com"
    },
    "SoHo Sushi (South Tampa, Tampa)": {
      "src": "https://tampamagazines.com/wp-content/uploads/2025/12/soho-sushi-spring-2024-055_1-scaled.jpg",
      "credit": "Tampa Magazine",
      "creditUrl": "https://tampamagazines.com/2026-best-restaurants-best-sushi/"
    },
    "Sunda New Asian (Midtown, Tampa)": {
      "src": "https://cdn.bckstg.app/media/4557/menu.jpg",
      "credit": "Sunda New Asian",
      "creditUrl": "https://www.sundanewasian.com"
    }
  },
  "oled-tvs": {
    "Samsung S95F OLED": {
      "src": "https://images.samsung.com/is/image/samsung/p6pim/us/qn65s95fafxza/gallery/us-oled-s95f-qn65s95fafxza-545388077?$product-details-jpg$",
      "credit": "Samsung",
      "creditUrl": "https://www.samsung.com/us/televisions-home-theater/tvs/oled-tvs/65-class-samsung-oled-s95f-qn65s95fafxza/"
    },
    "LG G5 OLED": {
      "src": "https://media.us.lg.com/transform/ecomm-PDPGallery-1100x730/992197d6-b54d-4d46-bad9-5365820c1095/TVs_OLED55G5WUA_gallery_02_3000x3000?io=transform:fill,width:1536",
      "credit": "LG Electronics",
      "creditUrl": "https://www.lg.com/us/tvs/lg-oled65g5wua-oled-4k-tv"
    },
    "Sony Bravia 8 II": {
      "src": "https://sony.scene7.com/is/image/sonyglobalsolutions/TVFY25_BRAVIA8II_PrimaryTout_0pt-image01-d?$originalDimensions$&fmt=png-alpha",
      "credit": "Sony",
      "creditUrl": "https://electronics.sony.com/tv-video/televisions/all-tvs/p/k65xr80m2"
    }
  },
  "pizza-nyc": {
    "John's of Bleecker Street (Greenwich Village)": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/9/9d/The_%22John%27s_Original%22_pizza.jpg",
      "credit": "Wikimedia Commons",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:The_%22John%27s_Original%22_pizza.jpg"
    },
    "Di Fara Pizza (Midwood)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_3840,ar_4:3,g_center,f_auto/images/NYC_DiFaraPizza_RegularPie_KatePrevite_00003_cu8slr",
      "credit": "The Infatuation / Kate Previte",
      "creditUrl": "https://www.theinfatuation.com/new-york/reviews/di-fara-pizza"
    },
    "L'Industrie Pizzeria (Williamsburg)": {
      "src": "https://28f718d42dc92b2aa25d.cdn6.editmysite.com/uploads/b/28f718d42dc92b2aa25db0887b7d74305782ccf3a0e80480f93eecbafc0ee56a/TeddyWolff.LIndustrie.NewYorkerSlice.4_Jp8wkfn_1694278184.jpg?width=1280&optimize=medium",
      "credit": "L'Industrie · Teddy Wolff",
      "creditUrl": "https://www.lindustriebk.com"
    },
    "Lucali (Carroll Gardens)": {
      "src": "https://platform.ny.eater.com/wp-content/uploads/sites/6/chorus/uploads/chorus_asset/file/22552619/1211492460.jpg?quality=90&strip=all&crop=0,13.104817456692,100,73.790365086616",
      "credit": "Eater NY",
      "creditUrl": "https://ny.eater.com"
    },
    "Mama's Too (Upper West Side)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_1280,ar_4:3,g_center,f_auto/images/MamasTooWV_KatePrevite_PepperoniSquareSlice_NYC_00005_ljzof0",
      "credit": "The Infatuation · Kate Previte",
      "creditUrl": "https://www.theinfatuation.com/new-york/reviews/mamas-too"
    }
  },
  "best-tom-hardy-movies": {
    "Mad Max: Fury Road": {
      "src": "https://www.rollingstone.com/wp-content/uploads/2018/06/rs-195845-FRD-DS-00668.jpg?w=1581&h=1054&crop=1",
      "credit": "Rolling Stone · Warner Bros.",
      "creditUrl": "https://www.rollingstone.com"
    },
    "Warrior": {
      "src": "https://ew.com/thmb/DZ3G2ZRF8_n597geIgi4Z_RIUTs=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/warrior-63d38fed2beb461f9d767de6e166f1d8.jpg",
      "credit": "Entertainment Weekly · Lionsgate",
      "creditUrl": "https://ew.com"
    },
    "Locke": {
      "src": "https://gcp-na-images.contentstack.com/v3/assets/bltea6093859af6183b/bltb439fb1856e27acb/69868c9136176027d590bb0e/locke2.jpeg?branch=production",
      "credit": "TIME · A24",
      "creditUrl": "https://time.com"
    }
  },
  "best-denzel-washington-movies": {
    "Crimson Tide": {
      "src": "https://www.hollywoodreporter.com/wp-content/uploads/2020/05/crimson_tide_1995_7.jpg?w=1296&h=730&crop=1",
      "credit": "The Hollywood Reporter · Hollywood Pictures",
      "creditUrl": "https://www.hollywoodreporter.com"
    },
    "Malcolm X": {
      "src": "https://gcp-na-images.contentstack.com/v3/assets/bltea6093859af6183b/blt94f1eb2710276478/698a3ef8011682b082983463/top-100-movies-1990s-malcolmx.jpg?branch=production",
      "credit": "TIME · Warner Bros.",
      "creditUrl": "https://time.com"
    },
    "Training Day": {
      "src": "https://www.hollywoodreporter.com/wp-content/uploads/2016/09/training_day_-_h_-_2001.jpg?w=1296&h=730&crop=1",
      "credit": "The Hollywood Reporter · Warner Bros.",
      "creditUrl": "https://www.hollywoodreporter.com"
    },
    "Glory": {
      "src": "https://ew.com/thmb/70m87zMUWhCgPcRjVoolEGZASuQ=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/msdglor_ec018-2000-fafabf98145d4049ad41372418e6fd8e.jpg",
      "credit": "Entertainment Weekly · TriStar Pictures",
      "creditUrl": "https://ew.com"
    }
  },
  "best-robin-williams-movies": {
    "Aladdin": {
      "src": "https://media-cldnry.s-nbcnews.com/image/upload/t_fit-760w,f_auto,q_auto:best/newscms/2015_42/822761/robin-williams-aladdin-genie-today-tease-151016.jpg",
      "credit": "TODAY · Disney",
      "creditUrl": "https://www.today.com"
    },
    "Insomnia": {
      "src": "https://i.guim.co.uk/img/static/sys-images/Guardian/Pix/audio/video/2014/8/21/1408629682437/Al-Pacino-and-Robin-Willi-010.jpg?width=465&dpr=1&s=none&crop=none",
      "credit": "The Guardian · Warner Bros.",
      "creditUrl": "https://www.theguardian.com"
    },
    "Good Will Hunting": {
      "src": "https://static.independent.co.uk/s3fs-public/thumbnails/image/2014/08/12/08/robin-williams-7.jpg",
      "credit": "The Independent · Miramax",
      "creditUrl": "https://www.independent.co.uk"
    },
    "Dead Poets Society": {
      "src": "https://cdn.theatlantic.com/thumbor/fxR5aRveoUZJCt3JoF-DxTbNwyc=/0x67:1214x750/960x540/media/img/mt/2014/02/Dear_poets_society/original.jpg",
      "credit": "The Atlantic · Touchstone Pictures",
      "creditUrl": "https://www.theatlantic.com"
    },
    "Good Morning, Vietnam": {
      "src": "https://s.abcnews.com/images/Entertainment/robin-williams-good-morning-vietnam-2-gty-thg-180719_hpEmbed_7x9_992.jpg",
      "credit": "ABC News · Touchstone Pictures",
      "creditUrl": "https://abcnews.go.com"
    }
  },
  "best-matt-damon-movies": {
    "True Grit": {
      "src": "https://onceuponatimeinawestern.com/wp-content/uploads/2015/06/Matt-Damon-as-LaBoeuf-meeting-Mattie-Ross-for-the-first-time-in-True-Grit-2010.jpg",
      "credit": "Once Upon a Time in a Western · Paramount Pictures",
      "creditUrl": "https://onceuponatimeinawestern.com"
    },
    "Saving Private Ryan": {
      "src": "https://ew.com/thmb/hXirYe4etmhfJbmU5dL9d0tXF3c=/2000x0/filters:no_upscale():max_bytes(150000):strip_icc()/saving-private-ryan-matt-damon-060524-1-27570d4206364916891172e478add38c.jpg",
      "credit": "Entertainment Weekly · DreamWorks",
      "creditUrl": "https://ew.com"
    },
    "Good Will Hunting": {
      "src": "https://ychef.files.bbci.co.uk/1280x720/p02knxnj.jpg",
      "credit": "BBC · Miramax",
      "creditUrl": "https://www.bbc.com"
    },
    "The Martian": {
      "src": "https://variety.com/wp-content/uploads/2015/08/matt-damon-the-martian.jpg?w=1000",
      "credit": "Variety · 20th Century Fox",
      "creditUrl": "https://variety.com"
    },
    "The Departed": {
      "src": "https://m.media-amazon.com/images/M/MV5BOWZmNGQyMjktZDE5MS00N2RmLWE5ZmQtOWZkNTc3M2NhMDIwXkEyXkFqcGc@._V1_.jpg",
      "credit": "IMDb · Warner Bros.",
      "creditUrl": "https://www.imdb.com"
    }
  },
  "best-ben-affleck-movies": {
    "Dazed and Confused": {
      "src": "https://m.media-amazon.com/images/M/MV5BMWY3YTMwYTctY2ZkMC00NGZmLWFlNWEtMmRlM2U1NTQ5YzAzXkEyXkFqcGc@._V1_.jpg",
      "credit": "IMDb · Gramercy Pictures",
      "creditUrl": "https://www.imdb.com"
    },
    "Good Will Hunting": {
      "src": "https://static0.colliderimages.com/wordpress/wp-content/uploads/2020/04/good-will-hunting-ben-affleck-matt-damon.jpg",
      "credit": "Collider · Miramax",
      "creditUrl": "https://collider.com"
    },
    "Argo": {
      "src": "https://static01.nyt.com/images/2012/10/12/arts/12ARGO_SPAN/12ARGO-superJumbo.jpg",
      "credit": "The New York Times · Warner Bros.",
      "creditUrl": "https://www.nytimes.com"
    },
    "Gone Girl": {
      "src": "https://static.guim.co.uk/sys-images/Guardian/Pix/audio/video/2014/10/2/1412269707000/Ben-Affleck-in-Gone-Girl-019.jpg",
      "credit": "The Guardian · 20th Century Fox",
      "creditUrl": "https://www.theguardian.com"
    }
  },
  "best-meryl-streep-movies": {
    "Little Women": {
      "src": "https://cdn.mos.cms.futurecdn.net/earfktJaczuHfkNaVU97hU-1200-80.jpg",
      "credit": "CinemaBlend · Sony Pictures",
      "creditUrl": "https://www.cinemablend.com"
    },
    "Adaptation": {
      "src": "https://images.squarespace-cdn.com/content/v1/5aa69ee35ffd2038888cd0de/1545486984986-AZNW26NLGQCTZMOVQXAA/unnamed-78.jpg",
      "credit": "The Film Experience · Sony Pictures",
      "creditUrl": "https://thefilmexperience.net"
    },
    "Sophie's Choice": {
      "src": "https://m.media-amazon.com/images/M/MV5BMjIwNzQwNzAzNF5BMl5BanBnXkFtZTcwMDI3MDI0Nw@@._V1_.jpg",
      "credit": "IMDb · Universal Pictures",
      "creditUrl": "https://www.imdb.com"
    },
    "Kramer vs. Kramer": {
      "src": "https://www.hollywoodreporter.com/wp-content/uploads/2019/11/kramer_vs._kramer_still.jpg?w=1296&h=730&crop=1",
      "credit": "The Hollywood Reporter · Columbia Pictures",
      "creditUrl": "https://www.hollywoodreporter.com"
    },
    "The Devil Wears Prada": {
      "src": "https://variety.com/wp-content/uploads/2026/04/MCDDEWE_WD012.jpg?w=1000&h=667&crop=1",
      "credit": "Variety · 20th Century Fox",
      "creditUrl": "https://variety.com"
    }
  },
  "best-jodie-foster-movies": {
    "The Silence of the Lambs": {
      "src": "https://m.media-amazon.com/images/M/MV5BMDQ0ZTAzZDYtZTdmMi00ZjA5LTgxMjctNzVhZWVhMDE1MTQyXkEyXkFqcGc@._V1_.jpg",
      "credit": "IMDb · Orion Pictures",
      "creditUrl": "https://www.imdb.com"
    },
    "Taxi Driver": {
      "src": "https://variety.com/wp-content/uploads/2025/11/taxi-driver.jpg?w=1000&h=667&crop=1",
      "credit": "Variety · Columbia Pictures",
      "creditUrl": "https://variety.com"
    },
    "The Accused": {
      "src": "https://www.eastman.org/sites/default/files/styles/gallery_large/public/0505%20-%20five_TheAccusedB_PF.jpg?itok=s6mGEYYK&timestamp=1680983052",
      "credit": "George Eastman Museum · Paramount Pictures",
      "creditUrl": "https://www.eastman.org"
    }
  },
  "greek-islands-not-mykonos-santorini": {
    "Crete (Greece's largest island)": {
      "src": "https://images.pexels.com/photos/29399456/pexels-photo-29399456.jpeg?auto=compress&cs=tinysrgb&w=1920",
      "credit": "Pexels · Dzmitry Charnou",
      "creditUrl": "https://www.pexels.com/photo/29399456/"
    },
    "Hydra (Saronic Islands)": {
      "src": "https://i.guim.co.uk/img/media/c1b8c92c87979959955e901c451bde3d7b083441/0_187_5660_3398/master/5660.jpg?width=1200&quality=85&auto=format&fit=max&s=195a6b69de032aa8a0cec125ef413a20",
      "credit": "The Guardian",
      "creditUrl": "https://www.theguardian.com/travel"
    },
    "Paros (Cyclades)": {
      "src": "https://thewanderbug.com/wp-content/uploads/2019/08/Naoussa-Paros-hero_1.jpg",
      "credit": "The Wanderbug",
      "creditUrl": "https://thewanderbug.com"
    }
  },
  "best-fine-dining-nyc": {
    "Jungsik (Tribeca)": {
      "src": "https://www.jungsik.com/wp-content/uploads/2022/05/photo-013.jpeg",
      "credit": "Jungsik",
      "creditUrl": "https://www.jungsik.com/"
    },
    "Le Bernardin (Midtown)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_1280,ar_4:3,g_center,f_auto/images/DAL04623_zoorfe",
      "credit": "The Infatuation · David A. Lee",
      "creditUrl": "https://www.theinfatuation.com/new-york/reviews/le-bernardin"
    },
    "Atomix (NoMad)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_1280,ar_4:3,g_center,f_auto/images/NYC_Atomix_FoodGroup_KatePrevite_00001_noi2jz",
      "credit": "The Infatuation · Kate Previte",
      "creditUrl": "https://www.theinfatuation.com/new-york/reviews/atomix"
    },
    "Sushi Sho (Midtown East)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_1280,ar_4:3,g_center,f_auto/images/sushisho_ny_009_eyouol",
      "credit": "The Infatuation · Sushi Sho",
      "creditUrl": "https://www.theinfatuation.com/new-york/reviews/sushi-sho"
    }
  },
  "food-trucks-manhattan": {
    "Birria-Landia (Lower East Side)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_1200,ar_4:3,g_center,f_auto/cms/guides/the-best-food-trucks-carts-in-nyc/AdamFriedlander.NYC.BirriaLandia.Exterior.002",
      "credit": "The Infatuation · Adam Friedlander",
      "creditUrl": "https://www.theinfatuation.com/new-york/guides/the-best-food-trucks-and-carts-in-nyc"
    },
    "DiSO's Italian Sandwich Society (Midtown)": {
      "src": "https://disosnyc.com/wp-content/uploads/2021/01/about-diso-1.jpg",
      "credit": "DiSO's Italian Sandwich Society",
      "creditUrl": "https://disosnyc.com/"
    },
    "Billy's Hot Dog Cart (Upper West Side)": {
      "src": "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/29/a3/d4/39/caption.jpg?w=900&h=500&s=1",
      "credit": "Tripadvisor",
      "creditUrl": "https://www.tripadvisor.com/Restaurant_Review-g60763-d25453703-Reviews-Billy_s_Hot_Dog_Cart-New_York_City_New_York.html"
    }
  },
  "best-fine-dining-london": {
    "CORE by Clare Smyth (Notting Hill)": {
      "src": "https://corebyclaresmyth.com/wp-content/uploads/2023/10/COREbyClareSmyth-45b.jpg",
      "credit": "CORE by Clare Smyth",
      "creditUrl": "https://corebyclaresmyth.com/"
    },
    "Restaurant Gordon Ramsay (Chelsea)": {
      "src": "https://platform.london.eater.com/wp-content/uploads/sites/31/chorus/uploads/chorus_asset/file/9333173/Restaurant_Gordon_Ramsay.jpg",
      "credit": "Eater London",
      "creditUrl": "https://london.eater.com/2018/10/1/17922616/gordon-ramsay-restaurant-chelsea-michelin-stars-fay-maschler-evening-standard-review"
    },
    "The Ledbury (Notting Hill)": {
      "src": "https://www.nationalrestaurantawards.co.uk/filestore/jpg/Ledbury20234.jpg",
      "credit": "National Restaurant Awards",
      "creditUrl": "https://www.nationalrestaurantawards.co.uk/profile/the-ledbury/"
    },
    "Da Terra (Bethnal Green)": {
      "src": "https://www.daterra.co.uk/wp-content/uploads/2023/02/DaTerra-JustinDeSouza-25-683x1024.jpg",
      "credit": "Da Terra · Justin De Souza",
      "creditUrl": "https://daterra.co.uk"
    },
    "Kitchen Table (Fitzrovia)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_1280,ar_4:3,g_center,f_auto/cms/reviews/kitchen-table/banners/1492385790.86",
      "credit": "The Infatuation · Karolina Wiercigroch",
      "creditUrl": "https://www.theinfatuation.com/london/reviews/kitchen-table"
    }
  },
  "best-fine-dining-paris": {
    "Arpège (7th Arr.)": {
      "src": "https://www.alain-passard.com/wp-content/uploads/2022/02/Arpege_Salon5-1000x667.jpg",
      "credit": "Arpège",
      "creditUrl": "https://www.alain-passard.com/"
    },
    "Guy Savoy (Monnaie de Paris)": {
      "src": "https://elitetraveler.com/wp-content/uploads/sites/8/2022/09/SalonBellesBacchantesdressagegrandestablesLaurenceMouton-min.jpg",
      "credit": "Elite Traveler · Laurence Mouton",
      "creditUrl": "https://elitetraveler.com/finest-dining/best-restaurants-in-paris"
    },
    "Kei (1st Arr.)": {
      "src": "https://elitetraveler.com/wp-content/uploads/sites/8/2022/09/Kei4-211039BD.jpg",
      "credit": "Elite Traveler · Richard Haughton",
      "creditUrl": "https://elitetraveler.com/finest-dining/best-restaurants-in-paris"
    },
    "Épicure (Le Bristol, 8th Arr.)": {
      "src": "https://elitetraveler.com/wp-content/uploads/sites/8/2022/09/EpicureCarteChefArnaudFaye-Rougetdemediterranee-1-ThomasDhellemmes_Fr53u-min.jpeg",
      "credit": "Elite Traveler · Thomas Dhellemmes",
      "creditUrl": "https://elitetraveler.com/finest-dining/best-restaurants-in-paris"
    }
  },
  "mechanical-keyboards": {
    "Ducky OK-M": {
      "src": "https://m.media-amazon.com/images/I/71xZkjcT61L._AC_SL1200_.jpg",
      "credit": "Ducky",
      "creditUrl": "https://www.amazon.com/dp/B0GKCS2WFP?tag=cgurus-20"
    },
    "SteelSeries Apex Pro": {
      "src": "https://m.media-amazon.com/images/I/71HmUNj01VL._AC_SL1200_.jpg",
      "credit": "SteelSeries",
      "creditUrl": "https://www.amazon.com/dp/B07SVJJCP3?tag=cgurus-20"
    },
    "Keychron Q6 HE": {
      "src": "https://cdn.shopify.com/s/files/1/0059/0630/1017/files/Keychron-Q6-HE-Wireless-QMK-Custom-Magnetic-Switch-Keyboard.jpg?v=1734317387",
      "credit": "Keychron",
      "creditUrl": "https://www.keychron.com/products/keychron-q6-he-qmk-wireless-custom-keyboard"
    }
  },
  "best-breweries-nyc-subway": {
    "Grimm Artisanal Ales (East Williamsburg)": {
      "src": "https://craftpeak-cooler-images.imgix.net/grimm-artisanal-ales/Lalas_Interior_5-2.jpg?auto=compress%2Cformat&ixlib=php-3.3.1&s=edc08948eaec74bf966af298593b63d5",
      "credit": "Grimm Artisanal Ales",
      "creditUrl": "https://grimmales.com/location/taproom/"
    },
    "Fifth Hammer Brewing Company (Long Island City)": {
      "src": "https://images.squarespace-cdn.com/content/v1/5d852ede68787e0988342d29/1623366443701-YQ5Z3ZDZHWFXS55QRGND/Fifth+Hammer+Taproom+June+2021.jpg",
      "credit": "Fifth Hammer Brewing",
      "creditUrl": "https://fifthhammerbrewing.com"
    },
    "Eckhart Beer Co. (Bushwick)": {
      "src": "https://www.brooklynpaper.com/wp-content/uploads/2025/09/Eckhart-Brewery-Brooklyn-1069.jpg",
      "credit": "Brooklyn Paper",
      "creditUrl": "https://www.brooklynpaper.com"
    },
    "SingleCut Beersmiths (Astoria)": {
      "src": "https://images.squarespace-cdn.com/content/v1/667191b8bce4971321367e54/cdc18c70-6195-4226-a0fa-d845d777ada7/QNS+Tap+roo.jpg",
      "credit": "SingleCut Beersmiths",
      "creditUrl": "https://www.singlecut.com/tap-rooms"
    },
    "Other Half Brewing (Gowanus)": {
      "src": "https://craftpeak-cooler-images.imgix.net/other-half-brewing/Other-Half-Brewing-Brooklyn-NY.jpg?auto=compress%2Cformat&fit=scale&h=1366&ixlib=php-3.3.1&w=2048&wpsize=2048x2048&s=aad27d3ffbff78272a8bd505c49c8ab4",
      "credit": "Other Half Brewing",
      "creditUrl": "https://otherhalfbrewing.com/location/centre-street/"
    },
    "Evil Twin Brewing (Ridgewood)": {
      "src": "https://craftpeak-cooler-images.imgix.net/evil-twin-brewing-nyc/676958F2-D69E-4FA3-990A-45EF28FD3D9F-scaled.jpeg?auto=compress%2Cformat&ixlib=php-3.3.1&s=67fffd85c84750410d6bffcbb904f0d3",
      "credit": "Evil Twin Brewing NYC",
      "creditUrl": "https://eviltwin.nyc/"
    }
  },
  "best-burgers-outside-usa": {
    "Whole Beast (London, UK)": {
      "src": "https://loveincorporated.blob.core.windows.net/contentimages/gallery/d4d328f6-136b-44e7-ab22-e39e3ef3779e-best-burgers-wholebeast.jpg",
      "credit": "LoveFood",
      "creditUrl": "https://www.lovefood.com/gallerylist/339503/ranked-the-worlds-best-burgers"
    },
    "Hundred Burgers (Valencia, Spain)": {
      "src": "https://www.telegraph.co.uk/content/dam/world-news/2024/09/11/TELEMMGLPICT000393463362_17260751153940_trans_NvBQzQNjv4Bqeo_i_u9APj8RuoebjoAHt-a-90u71-_kcfkywl_shTM.jpeg",
      "credit": "The Telegraph",
      "creditUrl": "https://www.telegraph.co.uk/world-news/2024/09/11/america-loses-its-crown-as-home-of-the-worlds-best-burger/"
    },
    "Black Bear Burger (London, UK)": {
      "src": "https://images.squarespace-cdn.com/content/v1/5ff08cf466132f51ded9c10d/33368f00-20ee-4b6b-9bbd-01895672620b/Where-to-eat-in-exmouth-market.jpg",
      "credit": "Black Bear Burger",
      "creditUrl": "https://www.blackbearburger.com/"
    },
    "Bleecker (London, UK)": {
      "src": "https://media.timeout.com/images/106320215/1920/1080/image.jpg",
      "credit": "Time Out",
      "creditUrl": "https://www.timeout.com/london/restaurants/bleecker-burger"
    }
  },
  "florida-college-dive-bars": {
    "Salty Dog Saloon (UF)": {
      "src": "https://saltydogsaloon.com/wp-content/uploads/2026/02/salty-dog-saloon-9.png",
      "credit": "Salty Dog Saloon",
      "creditUrl": "https://saltydogsaloon.com/"
    },
    "Balls (UF)": {
      "src": "https://static.where-e.com/United_States/Balls_742f483419d8f86b7d3053222b77ebfc.jpg",
      "credit": "Wheree",
      "creditUrl": "https://wheree.com/"
    },
    "Potbelly's (FSU)": {
      "src": "https://images.squarespace-cdn.com/content/v1/5c5b66e751f4d44f83c023e5/1549509262314-1VZVNER1UJ2Q535UY8U7/Potbelly%27s+Bar+-+Tallahassee%2C+FL",
      "credit": "Potbelly's",
      "creditUrl": "https://www.potbellys.com/"
    }
  },
  "resorts-caribbean": {
    "Jade Mountain (Soufrière, St. Lucia)": {
      "src": "https://www.jademountain.com/images/home-bottom-aerial.jpeg",
      "credit": "Jade Mountain",
      "creditUrl": "https://www.jademountain.com/"
    },
    "Jumby Bay Island (Antigua)": {
      "src": "https://images.eu.ctfassets.net/og3b0tarlg4b/4w3emqH8kAaDZ4XWjfdirO/a84471f5e171ee1cc4cd0739b4e7eca4/Jumby_Bay_beach_tsKvh.jpg?w=3200&h=2380&fm=jpg&fit=fill",
      "credit": "Oetker Collection",
      "creditUrl": "https://www.oetkerhotels.com/hotels/jumby-bay-island/"
    },
    "Baoase Luxury Resort (Willemstad, Curacao)": {
      "src": "https://baoase.com/wp-content/uploads/2023/01/Culinary-Beach-Restaurant-scaled.jpg",
      "credit": "Baoase Luxury Resort",
      "creditUrl": "https://baoase.com/"
    }
  },
  "greek-isles-hotels": {
    "Mystique (Oia, Santorini)": {
      "src": "https://greeceinsiders.travel/wp-content/uploads/2019/11/Mystique-Hotel.jpg",
      "credit": "Mystique, a Luxury Collection Hotel",
      "creditUrl": "https://www.marriott.com/hotels/travel/jtrlc-mystique-a-luxury-collection-hotel-santorini/"
    },
    "Canaves Oia (Oia, Santorini)": {
      "src": "https://canaves.com/wp-content/uploads/2016/10/Canaves_SUITES_Oia_Santorini_Presidential_Suite-2.jpg",
      "credit": "Canaves Oia",
      "creditUrl": "https://canaves.com"
    },
    "Kalesma Mykonos (Aleomandra, Mykonos)": {
      "src": "https://theluxurytravelexpert.com/wp-content/uploads/2024/10/kalesma-mykonos-hotel-review.jpg",
      "credit": "The Luxury Travel Expert",
      "creditUrl": "https://theluxurytravelexpert.com/review-kalesma-mykonos/"
    },
    "Grace Hotel Santorini, Auberge Resorts Collection (Imerovigli, Santorini)": {
      "src": "https://dreffui1gbt6t.cloudfront.net/images/gra/SAN_Exteriors_Pool_2024_14.jpg",
      "credit": "Auberge Resorts Collection",
      "creditUrl": "https://auberge.com/grace-hotel/"
    },
    "Perivolas (Oia, Santorini)": {
      "src": "https://perivolas.gr/wp-content/uploads/2024/08/P-1-2280x1400-1.jpg",
      "credit": "Perivolas",
      "creditUrl": "https://perivolas.gr/perivolas-infinity-pool/"
    }
  },
  "live-music-nyc": {
    "Baby's All Right (Williamsburg)": {
      "src": "https://media.timeout.com/images/104085810/1920/1080/image.jpg",
      "credit": "Time Out",
      "creditUrl": "https://www.timeout.com/newyork/bars/babys-all-right"
    },
    "Bowery Ballroom (Lower East Side)": {
      "src": "https://mercuryeastpresents.com/wp-content/uploads/2024/02/2021Aug06_BoweryBallroom_2052_Main-Area_4.jpg",
      "credit": "Mercury East Presents",
      "creditUrl": "https://mercuryeastpresents.com/bowery-ballroom/"
    },
    "Mercury Lounge (Lower East Side)": {
      "src": "https://mercuryeastpresents.com/wp-content/uploads/2024/02/2023Jul06_MercuryLounge_2053_-Labate_Main-Area_1-scaled.jpg",
      "credit": "Mercury East Presents",
      "creditUrl": "https://mercuryeastpresents.com/mercurylounge/"
    },
    "Birdland Jazz Club (Theater District)": {
      "src": "https://www.birdlandjazz.com/wp-content/uploads/2026/02/rintober.jpg",
      "credit": "Birdland Jazz Club",
      "creditUrl": "https://www.birdlandjazz.com/"
    }
  },
  "pool-table-bars-lower-manhattan": {
    "Cellar Dog (West Village)": {
      "src": "https://images.squarespace-cdn.com/content/v1/601c3491da799d0ee81fef3d/173ed557-30ca-4073-addc-071b1364f3be/tempImage9mGmvh.jpg",
      "credit": "Cellar Dog",
      "creditUrl": "https://www.cellardog.net/"
    },
    "Amsterdam Billiards Club (East Village)": {
      "src": "https://media.timeout.com/images/100488733/image.jpg",
      "credit": "Time Out",
      "creditUrl": "https://www.timeout.com/newyork/bars/amsterdam-billiards-club"
    },
    "Sadie's Ward (Lower East Side)": {
      "src": "https://cdn-images-1.medium.com/max/800/0*d_cJE1NqhC2RFtu0.jpg",
      "credit": "ChalkySticks",
      "creditUrl": "https://www.chalkysticks.com/"
    }
  },
  "sec-dive-bars": {
    "The Houndstooth (Alabama)": {
      "src": "https://assets3.thrillist.com/v1/image/1168372/1200x600/scale;;webp=auto;jpeg_quality=85.jpg",
      "credit": "Thrillist",
      "creditUrl": "https://www.thrillist.com/"
    },
    "The Chimes (LSU)": {
      "src": "https://gardenandgun.com/wp-content/uploads/2020/01/chimes1.jpg",
      "credit": "Garden & Gun",
      "creditUrl": "https://gardenandgun.com/"
    },
    "Sideways (Arkansas)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/3ijWDubj4Sul9bnOvKOEag/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/sideways-fayetteville"
    }
  },
  "travel-strollers-double": {
    "Joovy Kooper X2": {
      "src": "https://m.media-amazon.com/images/I/51llRi3ziGL._AC_SL1500_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B07PJMB6GF?tag=cgurus-20"
    },
    "Delta Children LX Side-by-Side": {
      "src": "https://m.media-amazon.com/images/I/71nbFzIgEjL._AC_SL1500_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B00GJIXP5O?tag=cgurus-20"
    },
    "UPPAbaby G-Link V2": {
      "src": "https://www.destinationbabykids.com/cdn/shop/files/uppababy-glink-black.png?v=1723782527&width=2890",
      "credit": "UPPAbaby",
      "creditUrl": "https://uppababy.com/"
    }
  },
  "bakeries-nyc": {
    "Radio Bakery (Greenpoint)": {
      "src": "https://greenpointers.com/wp-content/uploads/2023/02/pastry-.jpg",
      "credit": "Greenpointers",
      "creditUrl": "https://greenpointers.com/"
    },
    "Dolly's (Bed-Stuy)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/f_auto/q_auto/v1738526946/images/NYC_DollysCoffeeShop_UbeMorningBun_KatePrevite_00002_oueptg.jpg",
      "credit": "The Infatuation / Kate Previte",
      "creditUrl": "https://www.theinfatuation.com/new-york/reviews/dollys-coffee-shop"
    },
    "Hani's Bakery (East Village)": {
      "src": "https://platform.ny.eater.com/wp-content/uploads/sites/6/chorus/uploads/chorus_asset/file/25742119/2024_11_15_Apple_Oatmeal_Scone_mark_weinberg_0216.jpg?quality=90&strip=all&crop=0,0,100,100",
      "credit": "Eater NY / Mark Weinberg",
      "creditUrl": "https://ny.eater.com/"
    }
  },
  "pacific-ocean-resorts": {
    "The Brando (Tetiaroa, French Polynesia)": {
      "src": "https://media.cntraveler.com/photos/61e631b918fe5208acfcaa12/16:9/w_2560,c_limit/The-Brando__2018_BRANDO_1BR-Rear-Twilight-5.jpg",
      "credit": "Condé Nast Traveler",
      "creditUrl": "https://www.cntraveler.com/hotels/french-polynesia/the-brando"
    },
    "Namale Resort & Spa (Savusavu, Fiji)": {
      "src": "https://www.namalefiji.com/wp-content/uploads/2023/06/honeymoon-bure-pool-with-view-1300x867-1.jpg",
      "credit": "Namale Resort & Spa",
      "creditUrl": "https://www.namalefiji.com"
    },
    "Le Taha'a by Pearl Resorts (French Polynesia)": {
      "src": "https://cdn.prod.website-files.com/5fda95cd487da57637f0cbfe/6025982603b46e2a6e87fee3_le-tahaa-by-pearl-resorts-overwater-bungalows-2-16.jpg",
      "credit": "Le Taha'a by Pearl Resorts",
      "creditUrl": "https://pearlresorts.com/en/le-tahaa-by-pearl-resorts/"
    },
    "Wakaya Island Resort (Fiji)": {
      "src": "https://wakayaislandresort.com/wp-content/uploads/2024/07/Wakaya-Island-Resort-Spa-Private-Island-Resort-Fiji-9.jpg",
      "credit": "Wakaya Island Resort",
      "creditUrl": "https://wakayaislandresort.com/"
    },
    "Four Seasons Resort Bora Bora (French Polynesia)": {
      "src": "https://www.fourseasons.com/alt/img-opt/~70.1920.1384,0000-0,0000-1616,0000-909,0000/publish/content/dam/fourseasons/images/web/BOR/BOR_1614_original.jpg",
      "credit": "Four Seasons",
      "creditUrl": "https://www.fourseasons.com/borabora/"
    },
    "The St. Regis Bora Bora Resort (French Polynesia)": {
      "src": "https://cache.marriott.com/content/dam/marriott-renditions/BOBXR/bobxr-aerial-9657-hor-wide.jpg?output-quality=70&interpolation=progressive-bilinear&downsize=1920px:*",
      "credit": "The St. Regis Bora Bora",
      "creditUrl": "https://www.marriott.com/en-us/hotels/bobxr-the-st-regis-bora-bora-resort/overview/"
    },
    "Conrad Bora Bora Nui (French Polynesia)": {
      "src": "https://www.hilton.com/im/en/PPTBNCI/3538941/7-conrad-bora-bora-nui-pool-ow-1.jpg?impolicy=resize&rh=1080&rw=1920",
      "credit": "Conrad Bora Bora Nui",
      "creditUrl": "https://www.hilton.com/en/hotels/pptbnci-conrad-bora-bora-nui/"
    }
  },
  "breakfast-sandwiches-hamptons": {
    "Bonfire Coffeehouse (Amagansett)": {
      "src": "https://timesreview-images.s3.amazonaws.com/wp-content/uploads/sites/12/2025/05/bonefire-coffeehouse-scaled.jpeg",
      "credit": "Bonfire Coffeehouse via Southforker",
      "creditUrl": "https://southforker.com/2025/05/07/brake-for-the-bec-the-best-hamptons-breakfast-sandwiches/"
    },
    "Cove Delicatessen (Sag Harbor)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/YcnHpbclB8FXY3UVO_bJGg/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/cove-delicatessen-sag-harbor"
    },
    "One Stop Market (East Hampton)": {
      "src": "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1c/72/3c/08/top-off-your-meal-with.jpg?w=1200&h=1200&s=1",
      "credit": "TripAdvisor",
      "creditUrl": "https://www.tripadvisor.com/Restaurant_Review-g47629-d15771022-Reviews-One_Stop_Market-East_Hampton_Long_Island_New_York.html"
    },
    "Carissa's The Bakery (East Hampton)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/m2xh2Xt8Akqo9qHbJTPH3w/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/carissas-the-bakery-east-hampton"
    },
    "Goldberg's Famous Bagels (Multiple Locations)": {
      "src": "https://hamptons-social.com/wp-content/uploads/2019/08/Goldbergs21231599_124700541513874_5788191854108384602_n-e1565190975804.jpg",
      "credit": "Hamptons Social",
      "creditUrl": "https://hamptons-social.com/"
    }
  },
  "prestigious-boarding-schools": {
    "Choate Rosemary Hall (Wallingford, Connecticut)": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Paul_Mellon_Humanities_Center_2_-_Choate_Rosemary_Hall.jpg/1280px-Paul_Mellon_Humanities_Center_2_-_Choate_Rosemary_Hall.jpg",
      "credit": "Wikimedia Commons",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:Paul_Mellon_Humanities_Center_2_-_Choate_Rosemary_Hall.jpg"
    },
    "Phillips Exeter Academy (Exeter, New Hampshire)": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/0/05/Phillips_Exeter_Academy.jpg",
      "credit": "Wikimedia Commons",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:Phillips_Exeter_Academy.jpg"
    },
    "Phillips Academy Andover (Andover, Massachusetts)": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/c/c0/Phillips_Academy%2C_Andover%2C_MA_-_Samuel_Phillips_Hall.JPG",
      "credit": "Wikimedia Commons",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:Phillips_Academy,_Andover,_MA_-_Samuel_Phillips_Hall.JPG"
    },
    "The Lawrenceville School (Lawrenceville, New Jersey)": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/8/8a/Edith_Memorial_Chapel%2C_Lawrenceville_School_%28Lawrenceville%2C_NJ%29.JPG",
      "credit": "Wikimedia Commons",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:Edith_Memorial_Chapel,_Lawrenceville_School_(Lawrenceville,_NJ).JPG"
    }
  },
  "travel-monitors": {
    "Espresso 17 Pro": {
      "src": "https://m.media-amazon.com/images/I/41h-pzxfQfL._AC_SL1500_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B0FHNMFCWD?tag=cgurus-20"
    },
    "ViewSonic VX1655-4K-OLED": {
      "src": "https://m.media-amazon.com/images/I/61kK+Nq74OL._AC_SL1500_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B0CDJF17G5?tag=cgurus-20"
    },
    "Espresso Display 15 Touch": {
      "src": "https://m.media-amazon.com/images/I/51UwJCNIMzL._AC_SL1500_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://amzn.to/4uwq87F"
    },
    "ViewSonic VP16-OLED": {
      "src": "https://m.media-amazon.com/images/I/715v0rlApBL._AC_SL1500_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B0BJXRZ5C6?tag=cgurus-20"
    }
  },
  "best-air-fryer-cookbooks": {
    "The Skinnytaste Air Fryer Cookbook (Gina Homolka)": {
      "src": "https://m.media-amazon.com/images/I/918eAhGq4hL._SL1500_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/198482564X?tag=cgurus-20"
    },
    "Air Fryer Perfection (America's Test Kitchen)": {
      "src": "https://m.media-amazon.com/images/I/51idmjjVnfL._SL1500_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/1954210841?tag=cgurus-20"
    },
    "The I Love My Air Fryer Recipe Book (Robin Donovan)": {
      "src": "https://m.media-amazon.com/images/I/51w3+W7ERkL._SL1500_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/1507221983?tag=cgurus-20"
    }
  },
  "best-fine-dining-miami": {
    "L'Atelier de Joël Robuchon (Design District)": {
      "src": "https://platform.miami.eater.com/wp-content/uploads/sites/12/chorus/uploads/chorus_asset/file/19085546/Latelier_8.jpg",
      "credit": "Eater Miami",
      "creditUrl": "https://miami.eater.com/"
    },
    "Ariete (Coconut Grove)": {
      "src": "https://platform.miami.eater.com/wp-content/uploads/sites/12/chorus/uploads/chorus_asset/file/15666207/DSC_4176.0.0.1503447405.jpg",
      "credit": "Eater Miami",
      "creditUrl": "https://miami.eater.com/"
    },
    "Ogawa (Little River)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_1280,ar_4:3,g_center,f_auto/Ogawa_Interior_Cleveland_Miami-2_rmtnn8",
      "credit": "The Infatuation · Cleveland Jennings",
      "creditUrl": "https://www.theinfatuation.com/miami/guides/best-sushi-omakase-restaurants-miami"
    },
    "Shingo (Coral Gables)": {
      "src": "https://media.timeout.com/images/106005391/750/422/image.jpg",
      "credit": "Time Out Miami",
      "creditUrl": "https://www.timeout.com/miami/restaurants/shingo"
    },
    "Cote Miami (Design District)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_1280,ar_4:3,g_center,f_auto/cms/guides/the-best-restaurants-in-the-design-district/World_Red_Eye_-_Lifestyle_1",
      "credit": "The Infatuation · World Red Eye",
      "creditUrl": "https://www.theinfatuation.com/miami/reviews/cote-miami"
    }
  },
  "best-beach-clubs-mediterranean": {
    "Club 55 (Saint-Tropez, France)": {
      "src": "https://cornichewatches.com/wp-content/uploads/2024/03/Photo-by-Els-1.jpg",
      "credit": "Corniche Watches",
      "creditUrl": "https://cornichewatches.com"
    },
    "La Fontelina (Capri, Italy)": {
      "src": "https://www.fontelina-capri.com/images/1z.jpg",
      "credit": "La Fontelina",
      "creditUrl": "https://www.fontelina-capri.com"
    },
    "Nammos (Mykonos, Greece)": {
      "src": "https://www.nammos.com/sites/default/files/2021-11/nammos_mykonos_gallery_9_0.jpg",
      "credit": "Nammos",
      "creditUrl": "https://www.nammos.com"
    },
    "Dukley Beach Club (Budva, Montenegro)": {
      "src": "https://cdn.prod.website-files.com/6405c894c743a95478a4e22d%2F69bac79a79fd49352f3d2ca3_DB_poster.0000000.jpg",
      "credit": "Dukley Hotel & Resort",
      "creditUrl": "https://www.dukleyhotels.com/en/dining/dukley-beach-bar"
    }
  },
  "three-martini-lunch-manhattan": {
    "The Grill (Midtown)": {
      "src": "https://images.ctfassets.net/7mbidstwva6z/2IfaoYr2se3z7RTmdluQKE/c9b6ed8ccea475ed9bb8cc3511b663bf/empty_dining_room.jpg?w=2400&h=1601&fl=progressive&q=50&fm=jpg",
      "credit": "The Grill",
      "creditUrl": "https://thegrillnewyork.com"
    },
    "Torrisi Bar & Restaurant (Nolita)": {
      "src": "https://cdn.sanity.io/images/gb1p0gbj/production/8cf300f09e452b234678f59a9a36f734a092b35a-750x547.jpg",
      "credit": "Torrisi",
      "creditUrl": "https://torrisinyc.com"
    },
    "Ci Siamo (Hudson Yards)": {
      "src": "https://images.squarespace-cdn.com/content/v1/64c00f77b8606a4df6a14972/6c04aae7-ed6f-438c-ac3b-9f56de3eef2b/2021-10-18-USHG-CiSiamo-ReadMcKendree-0222_V1.jpg",
      "credit": "USHG · Read McKendree",
      "creditUrl": "https://www.cisiamonyc.com"
    },
    "L'Artusi (West Village)": {
      "src": "https://pyxis.nymag.com/v1/imgs/964/4f7/8b7179d85bacf286aaf19a1f104dd76303-l-artusi-01.rsocial.w1200.jpg",
      "credit": "New York Magazine",
      "creditUrl": "https://nymag.com/listings/restaurant/lartusi/"
    }
  },
  "headphones-overear": {
    "Sony WH-1000XM6": {
      "src": "https://m.media-amazon.com/images/I/61ddahpESML.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com"
    },
    "Bose QuietComfort Ultra Headphones (2nd Gen)": {
      "src": "https://m.media-amazon.com/images/I/51ocyQ+ItKL.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com"
    },
    "Sennheiser HDB 630": {
      "src": "https://m.media-amazon.com/images/I/71-hmb+dXbL.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com"
    }
  },
  "miami-beach-hotels": {
    "Four Seasons Hotel at The Surf Club (Surfside)": {
      "src": "https://www.fourseasons.com/alt/img-opt/~75.701.0,0000-281,2500-3000,0000-1687,5000/publish/content/dam/fourseasons/images/web/MFL/MFL_1371_original.jpg",
      "credit": "Four Seasons",
      "creditUrl": "https://www.fourseasons.com/surfside/"
    },
    "Faena Hotel Miami Beach (Mid-Beach)": {
      "src": "https://www.faena.com/sites/default/files/styles/split_callout_d/public/media/image/_MG_7782.jpg?h=16618d07&itok=AJ6-F8qs",
      "credit": "Faena",
      "creditUrl": "https://www.faena.com"
    },
    "The Setai (South Beach)": {
      "src": "https://symphony.cdn.tambourine.com/the-setai-miami-beach/media/thesetai-homepage-intro-63190cecdb462.webp",
      "credit": "The Setai",
      "creditUrl": "https://www.thesetaihotel.com"
    }
  },
  "best-aman-resorts-world": {
    "Amanpulo (Pamalican Island, Philippines)": {
      "src": "https://www.aman.com/sites/default/files/2022-05/AMANPULO_LIFESTYLEDJI_0208-2.jpg",
      "credit": "Aman",
      "creditUrl": "https://www.aman.com/resorts/amanpulo"
    },
    "Amanzoe (Porto Heli, Greece)": {
      "src": "https://www.travelplusstyle.com/wp-content/gallery/amanzoe/amanzoe-greece-hero-image-main-terrace_original_6805.jpg",
      "credit": "Aman via TravelPlusStyle",
      "creditUrl": "https://www.travelplusstyle.com/hotels/amanzoe"
    },
    "Amanoi (Vinh Hy Bay, Vietnam)": {
      "src": "https://thehealthyholidaycompany.co.uk/wp-content/uploads/2018/08/Aerial-view-of-Central-Pavilion-and-Cliff-Pool-on-the-hilltop_High-Res_15146.jpg",
      "credit": "The Healthy Holiday Company · Aman",
      "creditUrl": "https://thehealthyholidaycompany.co.uk"
    },
    "Amangiri (Canyon Point, Utah)": {
      "src": "https://www.aman.com/sites/default/files/styles/full_size_browser%402x/public/2024-05/amangiri_utah_-_main_pool.jpg?itok=_tjth25U",
      "credit": "Aman",
      "creditUrl": "https://www.aman.com/resorts/amangiri"
    },
    "Amanyara (Turks & Caicos)": {
      "src": "https://www.aman.com/sites/default/files/2022-04/AMANYARA_Beach_1_DJI_0595-Edit-4.jpg",
      "credit": "Aman",
      "creditUrl": "https://www.aman.com/resorts/amanyara"
    },
    "Aman Venice (Italy)": {
      "src": "https://media.blacktomato.com/2017/05/Garden-View.jpg",
      "credit": "Black Tomato",
      "creditUrl": "https://www.blacktomato.com/us/destinations/italy/aman-venice/"
    }
  },
  "home-espresso-machines": {
    "La Marzocco GS3": {
      "src": "https://lamarzoccousa.com/wp-content/uploads/2023/04/gs3.png",
      "credit": "La Marzocco",
      "creditUrl": "https://lamarzoccousa.com/home-products/espresso-machines/gs3/"
    },
    "Rocket R58": {
      "src": "https://m.media-amazon.com/images/I/71DPuEv-6fL.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com"
    },
    "Lelit Bianca V3": {
      "src": "https://assets.breville.com/cdn-cgi/image/width=1300,format=auto/Lelit/PESBN03/PESBN03PSS1BXX1.png?pdp",
      "credit": "Lelit",
      "creditUrl": "https://lelit.com"
    },
    "ECM Synchronika": {
      "src": "https://www.ecm.de/wp-content/uploads/2025/04/ECM_Synchronika_II-frontal-768x504-1.jpg",
      "credit": "ECM",
      "creditUrl": "https://www.ecm.de"
    }
  },
  "caesar-wraps-nyc": {
    "Bobwhite Counter (East Village)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/Nd6sM6LE9QSHUbm1Rkm1pA/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/bobwhite-counter-new-york-7"
    },
    "La Villa Pizzeria (Park Slope)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/IBP-PL2mIaG3BKdG21toew/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/la-villa-brooklyn"
    },
    "Milano Market (Upper East Side)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/XB_U6hFWuRxZ-fswKTFcGA/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/milano-market-new-york-2"
    }
  },
  "cocktails-williamsburg": {
    "Maison Premiere": {
      "src": "https://media.cntraveler.com/photos/5851cb6b053d277e273da5ab/16:9/w_2560%2Cc_limit/best-bars-NYC-Maison-Premiere-2016.jpg",
      "credit": "Condé Nast Traveler",
      "creditUrl": "https://www.cntraveler.com"
    },
    "Fresh Kills Bar": {
      "src": "https://freshkillsbar.com/wp-content/uploads/2020/02/bar1.jpg",
      "credit": "Fresh Kills Bar",
      "creditUrl": "https://freshkillsbar.com"
    },
    "Bar Blondeau": {
      "src": "https://static.wixstatic.com/media/3e9cbe_d694c12c15a84b789f24d436d72bbeb2~mv2.jpg",
      "credit": "Bar Blondeau",
      "creditUrl": "https://www.barblondeau.com"
    },
    "Bar Madonna": {
      "src": "https://lede-admin.appetitomagazine.com/wp-content/uploads/sites/53/2024/07/Appetito_Rob_Bar-Madonna_8-11.jpg",
      "credit": "Appetito Magazine",
      "creditUrl": "https://appetitomagazine.com/features/brooklyns-williamsburg-needed-an-italian-savior-enter-bar-madonna"
    }
  },
  "burgers-nyc": {
    "Red Hook Tavern (Red Hook)": {
      "src": "https://images.squarespace-cdn.com/content/v1/6442aec9db47706856d7d156/8635499d-9137-4c92-a14b-26810136b0fe/Red+Hook+Tavern+burger.webp",
      "credit": "Red Hook Tavern",
      "creditUrl": "https://www.redhooktavern.com"
    },
    "4 Charles Prime Rib (West Village)": {
      "src": "https://pyxis.nymag.com/v1/imgs/15e/05a/5290f89b1b5da48857fdebf766fb9b748d-21-4-charles-prime-rib-cheeseburger.2x.h473.w710.jpg",
      "credit": "Grub Street",
      "creditUrl": "https://www.grubstreet.com"
    },
    "Nowon (East Village)": {
      "src": "https://images.squarespace-cdn.com/content/v1/666a5e76661d142b1258b0f3/c6a90339-05b3-4be7-a693-4c35dee8e065/IMG_8607-2.jpg",
      "credit": "Nowon",
      "creditUrl": "https://www.nowonusa.com"
    }
  },
  "best-fine-dining-tokyo": {
    "Myoujyaku (Nishi-Azabu)": {
      "src": "https://d267qvt8mf7rfa.cloudfront.net/restaurant/290/mainImage.jpg",
      "credit": "Myoujyaku",
      "creditUrl": "https://www.google.com/search?q=Myojaku%20Nishi-Azabu%20Tokyo"
    },
    "Sézanne (Marunouchi)": {
      "src": "https://www.fourseasons.com/alt/img-opt/~70.1530.0,0000-0,2500-3000,0000-1687,5000/publish/content/dam/fourseasons/images/web/MAR/MAR_1747_original.jpg",
      "credit": "Four Seasons Hotel Tokyo at Marunouchi",
      "creditUrl": "https://www.fourseasons.com/tokyo/dining/restaurants/sezanne/"
    },
    "Sazenka (Hiroo)": {
      "src": "https://www.studio-crow.jp/wp-content/uploads/2017/02/sazenka-06-1-1440x960.jpg",
      "credit": "Design Studio CROW",
      "creditUrl": "https://www.studio-crow.jp/projects/1089/"
    },
    "Matsukawa (Akasaka)": {
      "src": "https://luxeat.com/wp-content/uploads/2020/12/L1150327-1200x800-1.jpg",
      "credit": "Luxeat",
      "creditUrl": "https://luxeat.com/blog/introduction-only-matsukawa-2/"
    }
  },
  "kids-board-games-skill": {
    "Outfoxed!": {
      "src": "https://m.media-amazon.com/images/I/81c8K6IVBhL._AC_SL1500_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B00UB7P0XY?tag=cgurus-20"
    },
    "Hoot Owl Hoot!": {
      "src": "https://m.media-amazon.com/images/I/618A7cqKYUL._AC_SL1500_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B004HVKAAI?tag=cgurus-20"
    },
    "Zingo!": {
      "src": "https://m.media-amazon.com/images/I/81u7H7FiVFL._AC_SL1500_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B01DY818JG?tag=cgurus-20"
    }
  },
  "burritos-san-diego": {
    "Ortiz's Taco Shop (Point Loma)": {
      "src": "https://cdn.vox-cdn.com/uploads/chorus_image/image/72169039/Ortiz_s_09.0.jpg",
      "credit": "Eater San Diego",
      "creditUrl": "https://san-diego.eater.com"
    },
    "Nico's Mexican Food (Ocean Beach)": {
      "src": "https://assets3.thrillist.com/v1/image/1263469/1200x630",
      "credit": "Thrillist",
      "creditUrl": "https://www.thrillist.com"
    },
    "La Perla Cocina Mexicana (Point Loma)": {
      "src": "https://platform.sandiego.eater.com/wp-content/uploads/sites/25/chorus/uploads/chorus_asset/file/24564621/La_Perla_King_Kong_1.jpg?quality=90&strip=all&w=2400",
      "credit": "Eater San Diego",
      "creditUrl": "https://san-diego.eater.com"
    }
  },
  "best-fine-dining-shanghai": {
    "Taian Table (Changning)": {
      "src": "https://rachelgouk.com/wp-content/uploads/2019/04/taian-table-shanghai-michelin-restaurant-4.jpg",
      "credit": "Nomfluence",
      "creditUrl": "https://rachelgouk.com/listings/taian-table-shanghai/"
    },
    "8½ Otto e Mezzo Bombana (The Bund)": {
      "src": "https://laisundining.com/wp-content/uploads/sites/5/2021/03/202509_Bombana-Shanghai_interior-1024x682.jpg",
      "credit": "Lai Sun Dining",
      "creditUrl": "https://laisundining.com/"
    },
    "Fu He Hui (Changning)": {
      "src": "https://danielfooddiary.com/wp-content/uploads/2018/04/fuhehui1.jpg",
      "credit": "Daniel Food Diary",
      "creditUrl": "https://danielfooddiary.com/2018/05/02/fuhehui/"
    },
    "Meet the Bund (BFC)": {
      "src": "https://rachelgouk.com/wp-content/uploads/2026/01/meet-the-bund-michelin-restaurant-shanghai-21.jpg",
      "credit": "Nomfluence",
      "creditUrl": "https://rachelgouk.com/listings/meet-the-bund-bfc/"
    },
    "102 House (Xuhui)": {
      "src": "https://rachelgouk.com/wp-content/uploads/2025/03/102-house-cantonese-fine-dining-restaurant-shanghai.jpg",
      "credit": "Nomfluence",
      "creditUrl": "https://rachelgouk.com/listings/102-house-shanghai/"
    }
  },
  "cabo-hotels": {
    "Esperanza, Auberge Resorts Collection (Cabo San Lucas)": {
      "src": "https://secure.s.forbestravelguide.com/img/properties/esperanza-an-auberge-resort/esperanza-an-auberge-resort-aerial-view-cocina-del-mar.jpg",
      "credit": "Forbes Travel Guide",
      "creditUrl": "https://www.forbestravelguide.com"
    },
    "Waldorf Astoria Los Cabos Pedregal (Cabo San Lucas)": {
      "src": "https://www.hksinc.com/wp-content/uploads/2007/10/Pedragal.jpg",
      "credit": "HKS Architects",
      "creditUrl": "https://www.hksinc.com"
    },
    "One&Only Palmilla (San José del Cabo)": {
      "src": "https://assets.simpleviewinc.com/simpleview/image/upload/crm/loscabosmx/1-Resort-Ariel_844B1B38-422E-4520-AD7FE28EFA8EB1A5_7559576a-9ecf-4337-92b42a4945eeb711.jpg",
      "credit": "Visit Los Cabos",
      "creditUrl": "https://www.visitloscabos.travel"
    }
  },
  "best-fine-dining-toronto": {
    "Quetzal (Little Italy)": {
      "src": "https://canadas100best.com/wp-content/uploads/2026/04/Quetzal-Toronto-2026-Canadas100Best-feat.jpg",
      "credit": "Canada's 100 Best",
      "creditUrl": "https://canadas100best.com/list/2026/quetzal-2026/"
    },
    "Edulis (King West)": {
      "src": "https://canadas100best.com/wp-content/uploads/2026/04/Edulis-Toronto-2026-Canadas100Best-feat.jpg",
      "credit": "Canada's 100 Best",
      "creditUrl": "https://canadas100best.com/list/2026/edulis-2026/"
    },
    "Alo (Queen West)": {
      "src": "https://canadas100best.com/wp-content/uploads/2026/04/Alo-Toronto-2026-Canadas100Best-feat.jpg",
      "credit": "Canada's 100 Best",
      "creditUrl": "https://canadas100best.com/list/2026/alo-2026/"
    }
  },
  "best-wings-nyc": {
    "Madame Vo (East Village)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/kL4vlpRav2Jnz38SCHLdAA/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/madame-vo-new-york"
    },
    "Dan and John's Wings (Murray Hill)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_1280,ar_4:3,g_center,f_auto/images/Dan_John_s_Wings_-_Hot_Wings_1_wlpfxv",
      "credit": "The Infatuation",
      "creditUrl": "https://www.theinfatuation.com"
    },
    "Bonnie's Grill (Park Slope)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_1280,ar_4:3,g_center,f_auto/images/NYC_BonniesGrill_10PcWings_KatePrevite_00001_wjyw6u",
      "credit": "The Infatuation · Kate Previte",
      "creditUrl": "https://www.theinfatuation.com/new-york/reviews/bonnies-grill"
    }
  },
  "burritos-nyc": {
    "Son Del North (Lower East Side)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_scale,w_1200,q_auto,f_auto/images/Son_Del_North_steak_burrito_ozyi4a",
      "credit": "The Infatuation",
      "creditUrl": "https://www.theinfatuation.com"
    },
    "B'Klyn Burro (Clinton Hill)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_1280,ar_16:9,g_center,f_auto/NYC_BklynBurro_ChillReyBurrito_KatePrevite_00003_hz0u3g",
      "credit": "The Infatuation · Kate Previte",
      "creditUrl": "https://www.theinfatuation.com/new-york/reviews/bklyn-burro"
    },
    "Plaza Ortega (Bushwick)": {
      "src": "https://www.plazaortega.com/assets/images/burrito-california.png",
      "credit": "Plaza Ortega",
      "creditUrl": "https://www.plazaortega.com"
    },
    "Taqueria Tlaxcalli (Parkchester)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_1280,ar_4:3,g_center,f_auto/images/NYC_Taqueria_Tlaxcalli_SonalShah_KPEDIT_06_hmfgvm",
      "credit": "The Infatuation · Sonal Shah",
      "creditUrl": "https://www.theinfatuation.com/new-york/reviews/taqueria-tlaxcalli"
    },
    "Los Burritos Juárez (Fort Greene)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_1280,ar_16:9,g_center,f_auto/images/NYC_LosBurritosJuarez_VerdeBurrito_KatePrevite_00001_wiqryv",
      "credit": "The Infatuation · Kate Previte",
      "creditUrl": "https://www.theinfatuation.com/new-york/guides/best-burritos-nyc"
    }
  },
  "beach-clubs-spain": {
    "Amante (Sol d'en Serra, Ibiza)": {
      "src": "https://www.amanteibiza.com/wp-content/uploads/2023/10/AMANTE-9-1-1920x1500.jpg",
      "credit": "Amante Ibiza",
      "creditUrl": "https://www.amanteibiza.com"
    },
    "Marbella Club (Golden Mile, Marbella)": {
      "src": "https://image-tc.galaxy.tf/wijpeg-11jvjslbmk4evd8nclklh7z5t/mch-oct-19-2959-a2-low-well.jpg",
      "credit": "Marbella Club",
      "creditUrl": "https://www.marbellaclub.com"
    },
    "Nikki Beach Ibiza (S'Argamassa, Ibiza)": {
      "src": "https://dv7zfk0hwmxgu.cloudfront.net/sites/default/files/styles/auto_1500_width/public/article-images/137201/embedded-1872585272.jpg",
      "credit": "Ibiza Spotlight",
      "creditUrl": "https://www.ibiza-spotlight.com/magazine/2024/08/best-beach-clubs-on-ibiza"
    }
  },
  "burgers-atlanta": {
    "NFA Burger (Dunwoody)": {
      "src": "https://platform.atlanta.eater.com/wp-content/uploads/sites/14/chorus/uploads/chorus_asset/file/19704766/82461237_496168277748545_5885031813239275520_o.jpg?quality=90&strip=all",
      "credit": "Eater Atlanta",
      "creditUrl": "https://atlanta.eater.com"
    },
    "Smiley's Burger Club (Decatur)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/q_auto,f_auto/Atlanta_Smiley_s_AmySinclair-5_pukp17",
      "credit": "The Infatuation · Amy Sinclair",
      "creditUrl": "https://www.theinfatuation.com/atlanta"
    },
    "Fred's Meat & Bread (Inman Park)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_1280,ar_4:3,g_center,f_auto/images/7AmySinclair_Fred_s_DoubleStackBurger_dxiooz",
      "credit": "The Infatuation · Amy Sinclair",
      "creditUrl": "https://www.theinfatuation.com/atlanta/reviews/freds-meat-bread"
    },
    "Che Butter Jonez (Brookhaven)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_1280,ar_16:9,g_center,f_auto/CheButterJonez_What_sBeef_TabiaLisenbeeParker_Atlanta-6_1_mpv8s8",
      "credit": "The Infatuation · Tabia Lisenbee-Parker",
      "creditUrl": "https://www.theinfatuation.com/atlanta/guides/best-burgers-atlanta"
    },
    "Sugar Loaf Bakery & Cafe (Reynoldstown)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_1280,ar_16:9,g_center,f_auto/images/SugarLoaf_StarrRivers_Burger_fp25w1",
      "credit": "The Infatuation · Starr Rivers",
      "creditUrl": "https://www.theinfatuation.com/atlanta/guides/best-burgers-atlanta"
    }
  },
  "tacos-nyc": {
    "Taqueria Ramirez (Greenpoint)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_1280,ar_4:3,g_center,f_auto/images/DavidALee_NYC_Taqueria_Ramirez_All_Dishes_005_lkt6ti",
      "credit": "The Infatuation · David A. Lee",
      "creditUrl": "https://www.theinfatuation.com/new-york/reviews/taqueria-ramirez"
    },
    "Los Tacos No. 1 (Chelsea)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_1280,ar_4:3,g_center,f_auto/cms/reviews/los-tacos-no-1/Los-Tacos-tacos-1",
      "credit": "The Infatuation · Noah Devereaux",
      "creditUrl": "https://www.theinfatuation.com/new-york/reviews/los-tacos-no-1"
    },
    "Los Mariscos (Chelsea)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_1280,ar_4:3,g_center,f_auto/cms/reviews/los-mariscos/Los_2520Mariscos_2520Shrimp_2520Tacos_2520-_2520Noah_2520Devereaux_JAy30LL",
      "credit": "The Infatuation · Noah Devereaux",
      "creditUrl": "https://www.theinfatuation.com/new-york/reviews/los-mariscos"
    }
  },
  "best-sushi-in-tokyo": {
    "Harutaka (Ginza)": {
      "src": "https://d267qvt8mf7rfa.cloudfront.net/restaurant/45/mainImage.jpg",
      "credit": "Sushi Harutaka",
      "creditUrl": "https://www.google.com/search?q=Sushi%20Harutaka%20Ginza"
    },
    "Kanesaka (Ginza)": {
      "src": "https://d267qvt8mf7rfa.cloudfront.net/restaurant/60/mainImage.jpg",
      "credit": "Sushi Kanesaka",
      "creditUrl": "https://www.sushi-kanesaka.com/"
    },
    "Nishiazabu Sushi Shin (Nishiazabu)": {
      "src": "https://media.alotea.com/nishiazabu-sushi-shin-tokyo-cover.webp",
      "credit": "Alotea",
      "creditUrl": "https://www.alotea.com/"
    },
    "Sushi Saito (Ginza)": {
      "src": "https://www.theworlds50best.com/discovery/filestore/jpg/SushiSaito-Tokyo-Japan-02.jpg",
      "credit": "50 Best Discovery",
      "creditUrl": "https://www.theworlds50best.com/discovery/Establishments/Japan/Tokyo/Sushi-Saito.html"
    },
    "Nihonbashi Kakigaracho Sugita (Nihonbashi)": {
      "src": "https://luxeat.com/wp-content/uploads/2021/03/21372855_120657008667170_1271521327064285184_n-663x500.jpg",
      "credit": "Luxeat",
      "creditUrl": "https://luxeat.com/blog/sugita/"
    },
    "Udatsu Sushi (Nakameguro)": {
      "src": "https://media.timeout.com/images/105820293/750/422/image.jpg",
      "credit": "Time Out Tokyo",
      "creditUrl": "https://www.timeout.com/tokyo/restaurants/udatsu-sushi"
    }
  },
  "dive-bars-london": {
    "Slim Jim's Liquor Store (Islington)": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Slim_Jims_Liquor_Store%2C_Islington%2C_N1_%283590013603%29.jpg/1280px-Slim_Jims_Liquor_Store%2C_Islington%2C_N1_%283590013603%29.jpg",
      "credit": "Ewan Munro / Wikimedia Commons",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:Slim_Jims_Liquor_Store,_Islington,_N1_(3590013603).jpg"
    },
    "Bradley's Spanish Bar (Fitzrovia)": {
      "src": "https://d2s8km3brsjp0y.cloudfront.net/eyJidWNrZXQiOiJ3aGF0cHViIiwia2V5IjoiV0xEXC9XTEQrMTY1MzgtOTY1MDctMjE4My0xNzM3LmpwZyIsImVkaXRzIjp7InJlc2l6ZSI6eyJ3aWR0aCI6MjAwMCwiaGVpZ2h0IjoxNTkxLCJmaXQiOiJjb3ZlciJ9LCJyb3RhdGUiOm51bGx9fQ==",
      "credit": "CAMRA / WhatPub",
      "creditUrl": "https://whatpub.com"
    },
    "The Victoria (Dalston)": {
      "src": "https://static.designmynight.com/uploads/2016/04/The-Victoria-Review-1.jpg",
      "credit": "DesignMyNight",
      "creditUrl": "https://www.designmynight.com/london/bars/dalston/the-victoria"
    },
    "Trisha's (Soho)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/f_jpg,w_1600/v1703269707/images/Trisha_s_Interior_Aleksandra_Boruch_London-11_crop_1_wx9obv.jpg",
      "credit": "The Infatuation · Aleksandra Boruch",
      "creditUrl": "https://www.theinfatuation.com/london/reviews/trishas-soho"
    }
  },
  "dive-bars-barcelona": {
    "Cal Marino (Poble Sec)": {
      "src": "https://media.timeout.com/images/103784167/750/422/image.jpg",
      "credit": "Time Out Barcelona",
      "creditUrl": "https://www.timeout.com/barcelona"
    },
    "El Pollo Bar (El Raval)": {
      "src": "https://www.lavanguardia.com/files/og_thumbnail/files/fp/uploads/2023/09/20/650af986cca1a.r_d.570-408-0.jpeg",
      "credit": "La Vanguardia",
      "creditUrl": "https://www.lavanguardia.com"
    },
    "Bar Bodega Quimet (Gràcia)": {
      "src": "https://www.bodegaquimet.com/img-trans/productos/24272/fotos/1024-67ac8f8e4b0e1-bar-bodega-quimet.png",
      "credit": "Bar Bodega Quimet",
      "creditUrl": "https://www.bodegaquimet.com/en/"
    },
    "Gran Bodega Maestrazgo (Sant Pere)": {
      "src": "https://assets2.devourtours.com/wp-content/uploads/Bodega-Maestrazgo-BCN.png",
      "credit": "Devour Tours",
      "creditUrl": "https://devourtours.com/blog/best-bodegas-in-barcelona/"
    },
    "Bodega Montferry (Sants)": {
      "src": "https://www.bodegamontferrysants.com/img-trans/productos/23523/fotos/1200-65a69aea40e23-bodega-montferry.png",
      "credit": "Bodega Montferry",
      "creditUrl": "https://www.bodegamontferrysants.com/en/"
    }
  },
  "best-meyhanes-istanbul": {
    "Safa Meyhanesi (Yedikule)": {
      "src": "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/22/11/3e/a5/caption.jpg?w=900&h=500&s=1",
      "credit": "Tripadvisor",
      "creditUrl": "https://www.tripadvisor.com"
    },
    "Asmalı Cavit (Asmalımescit)": {
      "src": "https://grablocals.com/wp-content/uploads/2022/08/asmali-cavit-restaurant-1200x900.jpeg",
      "credit": "Grablocals",
      "creditUrl": "https://grablocals.com"
    },
    "Barba Vasilis (Balat)": {
      "src": "https://www.barbavasilis.com/wp-content/uploads/2020/05/IMG_8234-e3-kucuk-e1589824592796.jpg",
      "credit": "Barba Vasilis",
      "creditUrl": "https://www.barbavasilis.com"
    }
  },
  "dive-bars-tel-aviv": {
    "HaMinzar (Allenby)": {
      "src": "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/08/2a/4c/f8/haminzar.jpg?w=900&h=500&s=1",
      "credit": "Tripadvisor",
      "creditUrl": "https://www.tripadvisor.com"
    },
    "Hoodna Bar (Florentin)": {
      "src": "https://www.secrettelaviv.com/wp-content/uploads/2016/07/22378_Hoodna-Bar.jpg",
      "credit": "Secret Tel Aviv",
      "creditUrl": "https://www.secrettelaviv.com"
    },
    "Levontin 7 (Florentin)": {
      "src": "https://viberate-upload.ams3.cdn.digitaloceanspaces.com/prod/entity/venue/levontin-7-EjAw2",
      "credit": "Viberate",
      "creditUrl": "https://www.viberate.com"
    }
  },
  "dive-bars-amsterdam": {
    "Café de Dokter (Centrum)": {
      "src": "https://holidayexpert.com/wp-content/uploads/2025/05/Untitled-design-2025-06-04T164802.348.webp",
      "credit": "Holiday Expert",
      "creditUrl": "https://holidayexpert.com"
    },
    "Café de Sluyswacht (Centrum)": {
      "src": "https://images.pexels.com/photos/15374517/pexels-photo-15374517.jpeg?auto=compress&cs=tinysrgb&w=1600",
      "credit": "John Tekeridis / Pexels",
      "creditUrl": "https://www.pexels.com/photo/cafe-de-sluyswacht-in-amsterdam-netherlands-15374517/"
    },
    "Café 't Smalle (Jordaan)": {
      "src": "https://backstreettravel.com/wp-content/uploads/2025/02/Cafe-t-Smalle-bronw-bar-by-Andrew-Nash-1024x1024.png",
      "credit": "Andrew Nash / Backstreet Travel",
      "creditUrl": "https://backstreettravel.com"
    },
    "Café Slijterij Oosterling (Centrum)": {
      "src": "https://assets3.thrillist.com/v1/image/1149702/1200x600/scale.jpg",
      "credit": "Thrillist",
      "creditUrl": "https://www.thrillist.com/venue/drink/nation/bar/cafe-slijterij-oosterling"
    },
    "Café Chris (Jordaan)": {
      "src": "https://elizabatz.com/wp-content/uploads/2015/07/15holamscafechrishistoricpub2175w.jpg",
      "credit": "Albatz Travel Adventures",
      "creditUrl": "https://elizabatz.com/2015/08/23/cafe-chris-a-brown-cafe-historic-pub-in-amsterdam/"
    }
  },
  "dive-bars-tokyo": {
    "Saiseisakaba (Shinjuku-Sanchome)": {
      "src": "https://punchdrink.com/wp-content/uploads/2014/11/tokyo-tachinomi-saiseisakaba.jpeg",
      "credit": "PUNCH",
      "creditUrl": "https://punchdrink.com/"
    },
    "La Jetée (Golden Gai)": {
      "src": "https://i.pinimg.com/736x/bd/19/a7/bd19a772a854aac5c5efdcb738e86a75.jpg",
      "credit": "Pinterest",
      "creditUrl": "https://www.pinterest.com"
    },
    "Good Heavens (Shimokitazawa)": {
      "src": "https://cdn.cheapoguides.com/wp-content/uploads/sites/2/2016/07/goodheavens.jpg",
      "credit": "Tokyo Cheapo",
      "creditUrl": "https://tokyocheapo.com"
    },
    "Albatross G (Golden Gai)": {
      "src": "https://www.alba-s.com/wp-content/uploads/2023/05/TOP1.jpg",
      "credit": "Albatross G",
      "creditUrl": "https://www.alba-s.com"
    }
  },
  "dive-bars-milan": {
    "Cantine Isola dal 1896 (Moscova)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_1600,ar_4:3,g_center,f_auto/images/IMG_2570_zwtehg",
      "credit": "The Infatuation",
      "creditUrl": "https://www.theinfatuation.com/milan"
    },
    "Radetzky (Brera)": {
      "src": "https://flawless.life/wp-content/uploads/2015/01/radetzky-cover.jpg",
      "credit": "FLAWLESS.life",
      "creditUrl": "https://flawless.life"
    },
    "N'Ombra de Vin (Brera)": {
      "src": "https://thevanderlust.com/img/no/mb/nombra-de-vin-ia-san-marco_jpg_1377259991.jpg$i$min$822$530$cc$$.jpeg",
      "credit": "The Vanderlust",
      "creditUrl": "https://thevanderlust.com"
    }
  },
  "dive-bars-athens": {
    "The 7 Jokers (Historic Centre)": {
      "src": "https://athensexperts.com/storage/media/places/the-7-jokers/255/The-7-Jokers-Coffee-&-Cocktail-Bar-0.jpg",
      "credit": "Athens Experts",
      "creditUrl": "https://athensexperts.com/places/the-7-jokers"
    },
    "Barrett (Psirri)": {
      "src": "https://i0.wp.com/images.suitcasemag.com/wp-content/uploads/2023/10/10162448/psyris-best-bars-drinking-in-the-underworld-of-athens_6533c0998cd92.jpeg?resize=720%2C480&ssl=1",
      "credit": "SUITCASE Magazine",
      "creditUrl": "https://suitcasemag.com"
    },
    "Brettos (Plaka)": {
      "src": "https://brettosplaka.com/cdn/shop/files/download_1.png?v=1672137683&width=2000",
      "credit": "Brettos Plaka",
      "creditUrl": "https://brettosplaka.com"
    }
  },
  "dive-bars-hong-kong": {
    "The Pontiac (Central)": {
      "src": "https://www.asia-bars.com/wp-content/uploads/2016/01/pontiac-4.jpg",
      "credit": "Asia Bars & Restaurants",
      "creditUrl": "https://www.asia-bars.com"
    },
    "The Wanch (Wan Chai)": {
      "src": "https://cdn.i-scmp.com/sites/default/files/styles/1020x680/public/d8/images/canvas/2022/03/24/96b0aa2b-dcc2-4ffc-aba2-e6c7909c6009_68910a0e.jpg?itok=R3q_7nK0&v=1648114521",
      "credit": "South China Morning Post",
      "creditUrl": "https://www.scmp.com"
    },
    "Tai Lung Fung (Wan Chai)": {
      "src": "https://media.timeout.com/images/105329881/image.jpg",
      "credit": "Time Out Hong Kong",
      "creditUrl": "https://www.timeout.com/hong-kong"
    },
    "Blotto (Kennedy Town)": {
      "src": "https://media.timeout.com/images/106042584/image.jpg",
      "credit": "Time Out Hong Kong",
      "creditUrl": "https://www.timeout.com/hong-kong/bars-and-pubs/blotto"
    }
  },
  "dive-bars-sydney": {
    "Fortunate Son (Enmore)": {
      "src": "https://media.timeout.com/images/105681641/750/422/image.jpg",
      "credit": "Time Out Sydney",
      "creditUrl": "https://www.timeout.com/sydney"
    },
    "Arcadia Liquors (Redfern)": {
      "src": "https://cdn.broadsheet.com.au/cache/d3/4e/d34eb360ed8b429ffa9b723cfd9d1e78.jpg",
      "credit": "Broadsheet",
      "creditUrl": "https://www.broadsheet.com.au/sydney"
    },
    "Earl's Juke Joint (Newtown)": {
      "src": "https://images.squarespace-cdn.com/content/v1/5e7d5c9b598f9f6f7a641185/89acf095-a5d5-4cca-ab37-cc093603f676/EARLS+JUN-1045.jpg",
      "credit": "Earl's Juke Joint",
      "creditUrl": "https://earlsjukejoint.com.au"
    }
  },
  "tacos-austin": {
    "Nixta Taqueria (East Austin)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_3840,ar_4:3,g_center,f_auto/cms/reviews/nixta-taqueria/ShannaHickman_Austin_Nixta_DuckCarnitas-2",
      "credit": "The Infatuation / Shanna Hickman",
      "creditUrl": "https://www.theinfatuation.com/austin/reviews/nixta-taqueria"
    },
    "Cuantos Tacos (East Austin)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_3840,ar_4:3,g_center,f_auto/images/CuantosTacos_AllTacos_RichardCasteel_ATX-2_zeau8v",
      "credit": "The Infatuation / Richard Casteel",
      "creditUrl": "https://www.theinfatuation.com/austin/reviews/cuantos-tacos"
    },
    "Paprika ATX (North Lamar)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_3840,ar_4:3,g_center,f_auto/images/Paprika_MultipleItems_RichardCasteel_ATX-5_kjzoy2",
      "credit": "The Infatuation / Richard Casteel",
      "creditUrl": "https://www.theinfatuation.com/austin/reviews/paprika-atx"
    }
  },
  "best-run-sweetgreen-nyc": {
    "32 Gansevoort St (Meatpacking District)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/-V7WgPDtWmnTDfLK-LKarw/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/sweetgreen-new-york-16"
    },
    "60 E 55th St (Midtown)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/lhKuioSKLCSLVnHO57ZYVg/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/sweetgreen-new-york-21"
    },
    "100 Kenmare St (Nolita)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/h6yndhriW3kEEq2Bc9PC9A/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/sweetgreen-new-york-4"
    }
  },
  "top-grossing-realtors-2025": {
    "Ben Caballero (Dallas; $3.9B)": {
      "src": "https://homesusa.com/wp-content/uploads/2024/02/Ben-Caballero-Portrait-with-Background-033123-10-x-10-in.jpg",
      "credit": "HomesUSA.com",
      "creditUrl": "https://homesusa.com/ben_caballero/"
    },
    "Deborah Kern (New York City; $1.1B)": {
      "src": "https://media-cloud.corcoranlabs.com/filters:format(webp)/fit-in/1000x1000/AgentApi/NewTaxi/3552/mediarouting.vestahub.com/Media/92073919",
      "credit": "Corcoran",
      "creditUrl": "https://www.corcoran.com/"
    },
    "Christian Angle (Palm Beach; $792.4M)": {
      "src": "https://anglerealestate.com/wp-content/uploads/2019/07/Christian-Angle-Palm-Beach-Island-Real-Estate-white.jpg",
      "credit": "Christian Angle Real Estate",
      "creditUrl": "https://anglerealestate.com/"
    }
  },
  "movies": {
    "The Godfather (1972)": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/3/32/Marlon_Brando_as_Vito_Corleone_%28high_quality%29.png",
      "credit": "Paramount Pictures / Wikimedia Commons",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:Marlon_Brando_as_Vito_Corleone_(high_quality).png"
    },
    "Citizen Kane (1941)": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/3/34/Citizen-Kane-Welles-Podium.jpg",
      "credit": "RKO Radio Pictures / Wikimedia Commons",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:Citizen-Kane-Welles-Podium.jpg"
    },
    "Vertigo (1958)": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/7/75/Vertigomovie_restoration.jpg",
      "credit": "Paramount Pictures / Wikimedia Commons",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:Vertigomovie_restoration.jpg"
    }
  },
  "best-wings-atlanta": {
    "The Local (Poncey-Highland)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_3840,ar_4:3,g_center,f_auto/TheLocal_Atlanta_AmySinclair-3_1_nrbylk",
      "credit": "The Infatuation / Amy Sinclair",
      "creditUrl": "https://www.theinfatuation.com/atlanta/reviews/the-local"
    },
    "J.R. Crickets (Midtown)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_3840,ar_4:3,g_center,f_auto/images/Atlanta_StateFarmArena_Hawks-22_nl77dv",
      "credit": "The Infatuation / Amy Sinclair",
      "creditUrl": "https://www.theinfatuation.com/atlanta/reviews/jr-crickets"
    },
    "Magic City (Downtown)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_3840,ar_4:3,g_center,f_auto/MagicCity_LemonPepperWet_TabiaLisenbeeParker_Atlanta-1_oc0g2e",
      "credit": "The Infatuation / Tabia Lisenbee-Parker",
      "creditUrl": "https://www.theinfatuation.com/atlanta/guides/lemon-pepper-wings-ranked"
    }
  },
  "tacos-la": {
    "Mariscos Jalisco (Boyle Heights)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_3840,ar_4:3,g_center,f_auto/cms/reviews/mariscos-jalisco/JakobLayman.MariscosJalisco.TacosDoradodeCamarones_06",
      "credit": "The Infatuation / Jakob Layman",
      "creditUrl": "https://www.theinfatuation.com/los-angeles/reviews/mariscos-jalisco"
    },
    "Tacos Los Cholos (Huntington Park)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_3840,ar_4:3,g_center,f_auto/images/LA_TacosLosCholos_Tacos_JessieClapp-1_sszsnw",
      "credit": "The Infatuation / Jessie Clapp",
      "creditUrl": "https://www.theinfatuation.com/los-angeles/reviews/tacos-los-cholos"
    },
    "Leo's Taco Truck (multiple locations)": {
      "src": "https://cdn.prod.website-files.com/6657750805b8c6353a8f0980/665a484a37cdbebc726406e5_SQpastorplate%20Large.jpeg",
      "credit": "Leo's Tacos Truck",
      "creditUrl": "https://www.leostacostruck.com/"
    },
    "Holbox (South Los Angeles)": {
      "src": "https://images.ctfassets.net/2658fe8gbo8o/30535f036f42467bbea5cf749ba49b38-photo-asset/e00eddef6eeaeaaedbf44a7df4808069/holbox_uniceviche_yellowbg_1.jpg",
      "credit": "KCRW",
      "creditUrl": "https://www.kcrw.com/shows/good-food/stories/holbox-gilberto-cetina-seafood-best-restaurant-los-angeles-times"
    },
    "Carnitas El Momo (Boyle Heights)": {
      "src": "https://platform.la.eater.com/wp-content/uploads/sites/26/chorus/uploads/chorus_asset/file/23477244/2022_05_13_CarnitasElMomo_003.jpg",
      "credit": "Eater LA",
      "creditUrl": "https://la.eater.com/2024/3/7/24092966/carnitas-el-momo-monterey-park-reopening-los-angeles"
    }
  },
  "mario-quest-games": {
    "Super Mario Odyssey": {
      "src": "https://assets.nintendo.com/image/upload/ar_16:9,b_auto:border,c_lpad/f_auto/q_auto/c_scale,w_1240/store/software/switch/70010000001130/c497547957d9dd3668e891aa97ff4899a3f40bd1bd430020f8cbdf673f02bdeb",
      "credit": "Nintendo",
      "creditUrl": "https://www.nintendo.com/us/store/products/super-mario-odyssey-switch/"
    },
    "Super Mario World": {
      "src": "https://mario.wiki.gallery/images/d/da/Super_Mario_World_Box.png",
      "credit": "Nintendo via Super Mario Wiki",
      "creditUrl": "https://www.mariowiki.com/Super_Mario_World"
    },
    "Super Mario Galaxy 2": {
      "src": "https://assets.nintendo.com/image/upload/ar_16:9,c_lpad,w_1240/b_white/f_auto/q_auto/store/software/switch/70010000104192/5731782c9e89d2f492b44f1445f5df3d65660cdf75fe4f47a17e2bed7f82f99e",
      "credit": "Nintendo",
      "creditUrl": "https://www.nintendo.com/us/store/products/super-mario-galaxy-2-switch/"
    }
  },
  "historical-fiction-female-protagonist": {
    "The Nightingale (Kristin Hannah)": {
      "src": "https://m.media-amazon.com/images/I/51ifIPw0RxL.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B00JO8PEN2?tag=cgurus-20"
    },
    "The Help (Kathryn Stockett)": {
      "src": "https://m.media-amazon.com/images/I/51W-HzcFZZL.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B002YKOXB6?tag=cgurus-20"
    },
    "The Book Thief (Markus Zusak)": {
      "src": "https://m.media-amazon.com/images/I/41sQhggHqjL.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B000XUBFE2?tag=cgurus-20"
    }
  },
  "best-sandwich-types": {
    "Philly Cheesesteak": {
      "src": "https://images.pexels.com/photos/37324434/pexels-photo-37324434/free-photo-of-delicious-philly-cheesesteak-sandwich-on-white-background.jpeg?w=1260&h=750&dpr=1",
      "credit": "Tochukwu Ekeh / Pexels",
      "creditUrl": "https://www.pexels.com/photo/delicious-philly-cheesesteak-sandwich-on-white-background-37324434/"
    },
    "Bánh Mì": {
      "src": "https://images.pexels.com/photos/32961655/pexels-photo-32961655/free-photo-of-delicious-vietnamese-banh-mi-on-newspaper.jpeg?w=1260&h=750&dpr=1",
      "credit": "Hậu Mai / Pexels",
      "creditUrl": "https://www.pexels.com/photo/delicious-vietnamese-banh-mi-on-newspaper-32961655/"
    },
    "Reuben": {
      "src": "https://images.pexels.com/photos/23531331/pexels-photo-23531331/free-photo-of-close-up-of-a-ham-sandwich.jpeg?w=1260&h=750&dpr=1",
      "credit": "Anthony Rahayel / Pexels",
      "creditUrl": "https://www.pexels.com/photo/close-up-of-a-ham-sandwich-23531331/"
    }
  },
  "cocktails-west-village": {
    "Dante": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_3840,ar_4:3,g_center,f_auto/images/Dante_-_Negroni_Sessions_-_Credit_-_Steve_Freihon_efooku",
      "credit": "The Infatuation / Steve Freihon",
      "creditUrl": "https://www.theinfatuation.com/new-york/reviews/dante-nyc"
    },
    "Katana Kitten": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_3840,ar_4:3,g_center,f_auto/EmilyS_KatanaKitten_Drinks_001_b1hil2",
      "credit": "The Infatuation / Emily Schindler",
      "creditUrl": "https://www.theinfatuation.com/new-york/reviews/katana-kitten"
    },
    "Angel's Share": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_3840,ar_4:3,g_center,f_auto/images/Angels_Share_ki4hk4",
      "credit": "The Infatuation",
      "creditUrl": "https://www.theinfatuation.com/new-york/reviews/angels-share"
    },
    "Little Branch": {
      "src": "https://pyxis.nymag.com/v1/imgs/5ba/8ec/5a5a0e26a69ee9725929915cacd9394ae7-little-branch-01.rsocial.w1200.jpg",
      "credit": "New York Magazine",
      "creditUrl": "https://nymag.com/listings/bar/little-branch/"
    }
  },
  "bagels-nyc": {
    "Ess-a-Bagel (Midtown East)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/kZqdHrG5U_0yPULZAE3q1Q/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/ess-a-bagel-new-york"
    },
    "Tompkins Square Bagels (East Village)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_3840,ar_4:3,g_center,f_auto/images/DanielBrennan_NYC_TompkinsSquareBagel_BaconEggCheese_DSCF4875_qbpm6x",
      "credit": "The Infatuation / Daniel Brennan",
      "creditUrl": "https://www.theinfatuation.com/new-york/reviews/tompkins-square-bagels"
    },
    "Utopia Bagels (Whitestone)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_3840,ar_4:3,g_center,f_auto/images/NYC_UtopiaBagelsManhattan_EverythingBagalCCLox_KatePrevite_00002_mrax8j",
      "credit": "The Infatuation / Kate Previte",
      "creditUrl": "https://www.theinfatuation.com/new-york/reviews/utopia-bagels"
    }
  },
  "trustworthy-twitter-accounts": {
    "Cluseau Investments (@blondesnmoney)": {
      "src": "https://pbs.twimg.com/profile_images/1917321594969452544/ICptXx-D_400x400.jpg",
      "credit": "Cluseau Investments on X",
      "creditUrl": "https://x.com/blondesnmoney"
    },
    "The Umpire (@EricTheUmpire)": {
      "src": "https://pbs.twimg.com/profile_images/1599078533317332992/8_jNkBhz_400x400.jpg",
      "credit": "The Umpire on X",
      "creditUrl": "https://x.com/EricTheUmpire"
    },
    "Pennycheck (@pennycheck)": {
      "src": "https://pbs.twimg.com/profile_images/2008243935995437056/SsQDGiMN_400x400.jpg",
      "credit": "Pennycheck on X",
      "creditUrl": "https://x.com/pennycheck"
    }
  },
  "taco-bell-menu-items": {
    "Crunchwrap Supreme": {
      "src": "https://www.tacobell.com/images/22362_crunchwrap_supreme_1400x800.jpg",
      "credit": "Taco Bell",
      "creditUrl": "https://www.tacobell.com/food/specialties/crunchwrap-supreme"
    },
    "Cheesy Gordita Crunch": {
      "src": "https://www.tacobell.com/images/22813_cheesy_gordita_crunch_1400x800.jpg",
      "credit": "Taco Bell",
      "creditUrl": "https://www.tacobell.com/food/specialties/cheesy-gordita-crunch"
    },
    "Mexican Pizza": {
      "src": "https://www.tacobell.com/images/22303_mexican_pizza_1400x800.jpg",
      "credit": "Taco Bell",
      "creditUrl": "https://www.tacobell.com/food/specialties/mexican-pizza"
    }
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
  "ivy-league-dive-bars": {
    "Charlie's Kitchen (Harvard)": {
      "src": "https://cambridgedaymediafiles.s3.amazonaws.com/public_html/wp-content/uploads/2024/06/06151719/060624i-Charlies-Kitchen.jpg",
      "credit": "Cambridge Day",
      "creditUrl": "https://www.cambridgeday.com/2024/06/06/charlies-kitchen-is-taking-on-a-second-act-as-live-music-venue-friday-shows-start-june-21/"
    },
    "Smokey Joe's Tavern (Penn)": {
      "src": "https://punchdrink.com/wp-content/uploads/2014/11/philly-sports-smokeyjoes.jpg",
      "credit": "PUNCH",
      "creditUrl": "https://punchdrink.com/venues/smokey-joes/"
    },
    "Ivy Inn (Princeton)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/u6bo9W3EK-17CKnKJQLOgw/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/ivy-inn-princeton"
    }
  },
  "breweries-day-trip-boston": {
    "Bent Water Brewing (Lynn)": {
      "src": "https://i0.wp.com/absolutebeer.com/wp-content/uploads/2019/12/AB-Breweries-Bent-Water-Brewing-Company-Taproom-2.jpg",
      "credit": "Absolute Beer",
      "creditUrl": "https://absolutebeer.com"
    },
    "Tree House Brewing (Charlton)": {
      "src": "https://images.squarespace-cdn.com/content/v1/5e7219f88ebaa26f2c4795c0/508d289b-f744-42ff-9036-77cc565d9d40/1147_TH_10162022+copy.jpg",
      "credit": "Tree House Brewing Company",
      "creditUrl": "https://treehousebrew.com/visiting-charlton-1"
    },
    "Trillium Brewing (Canton)": {
      "src": "https://trilliumbrewing.com/cdn/shop/files/Canton_Spring_Drone_2023.jpg",
      "credit": "Trillium Brewing Company",
      "creditUrl": "https://trilliumbrewing.com/pages/canton"
    },
    "Night Shift Brewing (Everett)": {
      "src": "https://nightshiftbrewing.com/wp-content/uploads/2023/03/362D7F85-4270-4A4F-B454-7363183C7D38-1440x1440.jpg",
      "credit": "Night Shift Brewing",
      "creditUrl": "https://nightshiftbrewing.com/locations/everett-taproom/"
    },
    "Long Live Beerworks (Roxbury)": {
      "src": "https://www.hopculture.com/wp-content/uploads/2023/07/long-live-beerworks-boston-credit-%40longlivebeerworks-1000x667-1.jpg",
      "credit": "Long Live Beerworks via Hop Culture",
      "creditUrl": "https://www.hopculture.com/best-breweries-greater-boston/"
    },
    "Vitamin Sea Brewing (Weymouth)": {
      "src": "https://bomag.o0bc.com/wp-content/uploads/sites/2/2019/02/Vitamin-Sea-Brewing-taproom.jpg",
      "credit": "Boston Magazine",
      "creditUrl": "https://www.bostonmagazine.com/restaurants/2019/02/11/vitamin-sea-brewery-weymouth-open/"
    }
  },
  "thailand-beachfront-hotels": {
    "Amanpuri (Pansea Beach, Phuket)": {
      "src": "https://www.aman.com/sites/default/files/2021-02/210204_AmanHero_Landscape_Amanpuri.jpg",
      "credit": "Aman",
      "creditUrl": "https://www.aman.com/resorts/amanpuri"
    },
    "Six Senses Yao Noi (Koh Yao Noi, Phang Nga)": {
      "src": "https://media.sixsenses.com/B60H3R33/at/37nw6qg7fn5skhk89k6vm/Ocean_Panorama_Pool_Villa.jpg?format=webp&width=1920",
      "credit": "Six Senses",
      "creditUrl": "https://www.sixsenses.com/en/hotels-resorts/asia-the-pacific/thailand/yao-noi/"
    },
    "Trisara (Nai Thon, Phuket)": {
      "src": "https://trisara.com/wp-content/uploads/2024/12/opv-sunset-scaled.jpeg",
      "credit": "Trisara",
      "creditUrl": "https://trisara.com/"
    }
  },
  "pool-table-bars-boston": {
    "Croke Park (South Boston)": {
      "src": "https://hiddenboston.com/images/CrokeParkDive.jpg",
      "credit": "Hidden Boston",
      "creditUrl": "https://www.hiddenboston.com/dive-croke-park.html"
    },
    "Harry's Bar & Grill (Brighton)": {
      "src": "https://platform.boston.eater.com/wp-content/uploads/sites/4/chorus/uploads/chorus_asset/file/7983145/Harry_s.jpg",
      "credit": "Eater Boston",
      "creditUrl": "https://boston.eater.com/2017/2/20/14609836/harrys-bar-grill-brighton"
    },
    "The Shannon Tavern (South Boston)": {
      "src": "https://hiddenboston.com/images/ShannonTavern.jpg",
      "credit": "Hidden Boston",
      "creditUrl": "https://www.hiddenboston.com/dive-shannon.html"
    }
  },
  "best-boston-suburbs": {
    "Weston (Middlesex County)": {
      "src": "https://media-production.lp-cdn.com/cdn-cgi/image/format=auto,quality=85,fit=scale-down,width=1600/https://media-production.lp-cdn.com/media/95070ebc-8493-4b59-bd0b-3881b56cb1f3",
      "credit": "The David Green Group",
      "creditUrl": "https://thedavidgreengroup.com/neighborhoods/weston"
    },
    "Wellesley (Norfolk County)": {
      "src": "https://wellesley-college.transforms.svdcdn.com/production/news/arbor_drone_campus.jpg?w=2048&h=1365&q=90&auto=format&fit=min&dm=1709140303&s=1ce6218a88a288c917fd27a14ce7bb1d",
      "credit": "Wellesley College",
      "creditUrl": "https://www.wellesley.edu/news/the-caretakers-of-the-canopy"
    },
    "Dover (Norfolk County)": {
      "src": "https://bomag.o0bc.com/wp-content/uploads/sites/2/2017/01/mill-farm-dover-1.jpg",
      "credit": "Boston Magazine",
      "creditUrl": "https://www.bostonmagazine.com/property/2017/01/24/mill-farm-dover-otm/"
    }
  },
  "top-grossing-films-1970s": {
    "Star Wars (1977)": {
      "src": "https://image.tmdb.org/t/p/original/yUiXA68FfQeA8cRBhd0Ao0jIRZt.jpg",
      "credit": "TMDB · Lucasfilm",
      "creditUrl": "https://www.themoviedb.org/movie/11-star-wars"
    },
    "Jaws (1975)": {
      "src": "https://image.tmdb.org/t/p/original/i1yf91svRHX45l9BXL8rVFzLoPH.jpg",
      "credit": "TMDB · Universal Pictures",
      "creditUrl": "https://www.themoviedb.org/movie/578-jaws"
    },
    "The Exorcist (1973)": {
      "src": "https://image.tmdb.org/t/p/original/xcjJ5khg2yzOa282mza39Lbrm7j.jpg",
      "credit": "TMDB · Warner Bros.",
      "creditUrl": "https://www.themoviedb.org/movie/9552-the-exorcist"
    }
  },
  "top-grossing-films-1980s": {
    "E.T. the Extra-Terrestrial (1982)": {
      "src": "https://image.tmdb.org/t/p/original/mXLVA0YL6tcXi6SJSuAh9ONXFj5.jpg",
      "credit": "TMDB · Universal Pictures",
      "creditUrl": "https://www.themoviedb.org/movie/601-e-t-the-extra-terrestrial"
    },
    "Star Wars: The Empire Strikes Back (1980)": {
      "src": "https://image.tmdb.org/t/p/original/aJCtkxLLzkk1pECehVjKHA2lBgw.jpg",
      "credit": "TMDB · Lucasfilm",
      "creditUrl": "https://www.themoviedb.org/movie/1891-the-empire-strikes-back"
    },
    "Indiana Jones and the Last Crusade (1989)": {
      "src": "https://image.tmdb.org/t/p/original/12fvZHskx57kQfNEUXJ3v0flWYQ.jpg",
      "credit": "TMDB · Paramount Pictures",
      "creditUrl": "https://www.themoviedb.org/movie/89-indiana-jones-and-the-last-crusade"
    }
  },
  "top-grossing-films-1990s": {
    "Titanic (1997)": {
      "src": "https://image.tmdb.org/t/p/original/xnHVX37XZEp33hhCbYlQFq7ux1J.jpg",
      "credit": "TMDB · Paramount Pictures",
      "creditUrl": "https://www.themoviedb.org/movie/597-titanic"
    },
    "Star Wars: The Phantom Menace (1999)": {
      "src": "https://image.tmdb.org/t/p/original/3TeGmKJfkik1D1rIoqGb1aR4k9c.jpg",
      "credit": "TMDB · Lucasfilm",
      "creditUrl": "https://www.themoviedb.org/movie/1893-star-wars-episode-i-the-phantom-menace"
    },
    "Jurassic Park (1993)": {
      "src": "https://image.tmdb.org/t/p/original/o7LzVmlOSYc3EspyVMC9bsTTARc.jpg",
      "credit": "TMDB · Universal Pictures",
      "creditUrl": "https://www.themoviedb.org/movie/329-jurassic-park"
    }
  },
  "top-grossing-films-2000s": {
    "Avatar (2009)": {
      "src": "https://image.tmdb.org/t/p/original/vL5LR6WdxWPjLPFRLe133jXWsh5.jpg",
      "credit": "TMDB · 20th Century Fox",
      "creditUrl": "https://www.themoviedb.org/movie/19995-avatar"
    },
    "The Lord of the Rings: The Return of the King (2003)": {
      "src": "https://image.tmdb.org/t/p/original/ctiw6FZK4N36LmkjSklWEbuvlq9.jpg",
      "credit": "TMDB · New Line Cinema",
      "creditUrl": "https://www.themoviedb.org/movie/122-the-lord-of-the-rings-the-return-of-the-king"
    },
    "Pirates of the Caribbean: Dead Man's Chest (2006)": {
      "src": "https://image.tmdb.org/t/p/original/vr6n6ZFUZvedvIlhfYcbCWcaKyW.jpg",
      "credit": "TMDB · Walt Disney Studios",
      "creditUrl": "https://www.themoviedb.org/movie/58-pirates-of-the-caribbean-dead-man-s-chest"
    }
  },
  "top-grossing-films-2010s": {
    "Avengers: Endgame (2019)": {
      "src": "https://image.tmdb.org/t/p/original/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg",
      "credit": "TMDB · Marvel Studios",
      "creditUrl": "https://www.themoviedb.org/movie/299534-avengers-endgame"
    },
    "Star Wars: The Force Awakens (2015)": {
      "src": "https://image.tmdb.org/t/p/original/8BTsTfln4jlQrLXUBquXJ0ASQy9.jpg",
      "credit": "TMDB · Lucasfilm",
      "creditUrl": "https://www.themoviedb.org/movie/140607-star-wars-the-force-awakens"
    },
    "Avengers: Infinity War (2018)": {
      "src": "https://image.tmdb.org/t/p/original/mDfJG3LC3Dqb67AZ52x3Z0jU0uB.jpg",
      "credit": "TMDB · Marvel Studios",
      "creditUrl": "https://www.themoviedb.org/movie/299536-avengers-infinity-war"
    }
  },
  "best-wings-buffalo": {
    "Bar-Bill Tavern (East Aurora)": {
      "src": "https://popmenucloud.com/cdn-cgi/image/width%3D2400%2Cheight%3D2400%2Cfit%3Dscale-down%2Cformat%3Dauto%2Cquality%3D80/laworbdj/884fbc13-018d-468f-998e-c5b215fcc915.jpg",
      "credit": "Bar-Bill Tavern",
      "creditUrl": "https://www.barbill.com"
    },
    "Duff's Famous Wings (Amherst)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_3840,ar_4:3,g_center,f_auto/images/Duffs_WingSpread_JamesPici_Buffalo_l3sdj8",
      "credit": "The Infatuation / James Pici",
      "creditUrl": "https://www.theinfatuation.com/buffalo/reviews/duffs-famous-wings"
    },
    "Gabriel's Gate (Allentown)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_3840,ar_4:3,g_center,f_auto/images/GabrielsGate_Wings5_JamesPici_Buffalo_ubw0o7",
      "credit": "The Infatuation / James Pici",
      "creditUrl": "https://www.theinfatuation.com/buffalo/reviews/gabriels-gate"
    }
  },
  "boston-hotels": {
    "Raffles Boston (Back Bay)": {
      "src": "https://www.pmainc.com/wp-content/uploads/2023/12/Hospitality_Boston-Raffles-1-1450x1071.jpg",
      "credit": "Raffles Boston",
      "creditUrl": "https://www.raffles.com/boston/"
    },
    "Mandarin Oriental Boston (Back Bay)": {
      "src": "https://secure.s.forbestravelguide.com/img/properties/mandarin-oriental-boston/extra-large/mandarin-oriental-boston-exterior.jpg",
      "credit": "Mandarin Oriental / Forbes Travel Guide",
      "creditUrl": "https://www.forbestravelguide.com/hotels/boston-massachusetts/mandarin-oriental-boston"
    },
    "Four Seasons Hotel Boston (Back Bay)": {
      "src": "https://www.fourseasons.com/alt/img-opt/~65.1920.0,0000-242,5658-3000,0000-1687,5000/publish/content/dam/fourseasons/images/web/BOS/BOS_776_original.jpg",
      "credit": "Four Seasons Hotel Boston",
      "creditUrl": "https://www.fourseasons.com/boston/"
    },
    "The Ritz-Carlton Boston (Theater District)": {
      "src": "https://www.travoh.com/wp-content/uploads/2022/05/001-The-Ritz-Carlton-Boston-Hotel-Boston-MA-USA-Exterior.jpg",
      "credit": "The Ritz-Carlton / Travoh",
      "creditUrl": "https://www.ritzcarlton.com/en/hotels/bosrz-the-ritz-carlton-boston/overview/"
    }
  },
  "best-canned-seltzer-waters": {
    "Spindrift": {
      "src": "https://m.media-amazon.com/images/I/71zS3WG6jwL.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B0787FVBBP?tag=cgurus-20"
    },
    "Waterloo": {
      "src": "https://m.media-amazon.com/images/I/81FNzrlSw0L.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B09C7QXQRG?tag=cgurus-20"
    },
    "LaCroix": {
      "src": "https://m.media-amazon.com/images/I/71bkoohw+iL.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B0FZSLJCN7?tag=cgurus-20"
    }
  },
  "private-schools-florida": {
    "Ransom Everglades School (Coconut Grove, Miami)": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/3/36/Coco_Grove_FL_Ransom_School01.jpg",
      "credit": "Wikimedia Commons",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:Coco_Grove_FL_Ransom_School01.jpg"
    },
    "American Heritage School (Plantation, Fort Lauderdale)": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/9/91/American_Heritage_School_Aerial.jpg",
      "credit": "Wikimedia Commons",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:American_Heritage_School_Aerial.jpg"
    },
    "Pine Crest School (Imperial Point, Fort Lauderdale)": {
      "src": "https://c2.staticflickr.com/8/7197/6863490150_dd8702808b_b.jpg",
      "credit": "shullman / Flickr",
      "creditUrl": "https://www.flickr.com/photos/shullman/6863490150/"
    }
  },
  "breweries-charlotte": {
    "Heist Brewery (NoDa)": {
      "src": "https://media.cntraveler.com/photos/5d0904db75622b9eda3a74cb/16:9/w_2560%2Cc_limit/Heist-Brewery_2019_Canteen-1.jpg",
      "credit": "Condé Nast Traveler",
      "creditUrl": "https://www.cntraveler.com/activities/heist-brewery"
    },
    "Resident Culture (Plaza Midwood)": {
      "src": "https://thevendry.com/cdn-cgi/image/height=1920,width=1920,fit=contain,metadata=none/https://s3.us-east-1.amazonaws.com/uploads.thevendry.co/36211/1712661483134_IMG_9866.jpg",
      "credit": "The Vendry",
      "creditUrl": "https://thevendry.com/venue/279902/resident-culture-brewing-company-plaza-midwood-charlotte-nc"
    },
    "Birdsong Brewing Co. (Villa Heights)": {
      "src": "https://cdn.spotapps.co/spothopper/image/fetch/f_auto,q_auto:best,c_fit,h_1200/http://static.spotapps.co/spots/94/8c451b5aa44c948efa521c8eccb94e/:original",
      "credit": "Birdsong Brewing Co.",
      "creditUrl": "https://birdsongbrewing.com"
    },
    "Divine Barrel Brewing (NoDa)": {
      "src": "https://images.axios.com/xQV1d0PPa9GfI3eYTvoo5ma7u4c=/2024/04/18/1713461043500.jpg",
      "credit": "Axios Charlotte",
      "creditUrl": "https://www.axios.com/local/charlotte"
    },
    "Petty Thieves Brewing Co. (North End)": {
      "src": "https://cdn.spotapps.co/spothopper/image/fetch/f_auto,q_auto:best,c_fit,h_1200/http://static.spotapps.co/spots/e5/687e32680c4fa9b2e32f31ef86c129/:original",
      "credit": "Petty Thieves Brewing Co.",
      "creditUrl": "https://www.pettythievesbrewing.com"
    }
  },
  "mcdonalds-menu-items": {
    "Quarter Pounder with Cheese": {
      "src": "https://s7d1.scene7.com/is/image/mcdonalds/DC_202201_0007-005_QuarterPounderwithCheese_1564x1564-1?wid=1000&hei=1000",
      "credit": "McDonald's",
      "creditUrl": "https://www.mcdonalds.com/us/en-us/product/quarter-pounder-with-cheese.html"
    },
    "World Famous Fries": {
      "src": "https://s7d1.scene7.com/is/image/mcdonalds/DC_202002_6053_LargeFries_1564x1564-1?wid=1000&hei=1000",
      "credit": "McDonald's",
      "creditUrl": "https://www.mcdonalds.com/us/en-us/product/small-french-fries.html"
    },
    "Baked Apple Pie": {
      "src": "https://s7d1.scene7.com/is/image/mcdonalds/DC_202004_0706_BakedApplePie_Broken_1564x1564-1?wid=1000&hei=1000",
      "credit": "McDonald's",
      "creditUrl": "https://www.mcdonalds.com/us/en-us/product/baked-hot-apple-pie.html"
    }
  },
  "wendys-menu-items": {
    "Dave's Single": {
      "src": "https://app.wendys.com/unified/assets/menu/pg-cropped/2474_large_US_en.png",
      "credit": "Wendy's",
      "creditUrl": "https://order.wendys.com/us/en/menu/100/30422"
    },
    "Jr. Bacon Cheeseburger": {
      "src": "https://app.wendys.com/unified/assets/menu/pg-cropped/2260_large_US_en.png",
      "credit": "Wendy's",
      "creditUrl": "https://order.wendys.com/us/en/menu/100/30006"
    },
    "Jr. Cheeseburger Deluxe": {
      "src": "https://app.wendys.com/unified/assets/menu/pg-cropped/2261_large_US_en.png",
      "credit": "Wendy's",
      "creditUrl": "https://order.wendys.com/us/en/menu/100/30959"
    },
    "Asiago Ranch Club Sandwich": {
      "src": "https://app.wendys.com/unified/assets/menu/pg-cropped/2253_large_US_en.png",
      "credit": "Wendy's",
      "creditUrl": "https://order.wendys.com/us/en/menu/101/30011"
    },
    "Oreo Brownie Frosty Fusion": {
      "src": "https://app.wendys.com/unified/assets/menu/pg-cropped/2190_large_US_en.png",
      "credit": "Wendy's",
      "creditUrl": "https://order.wendys.com/us/en/menu/107/31760"
    }
  },
  "burger-king-menu-items": {
    "Rodeo Burger": {
      "src": "https://cdn.sanity.io/images/kjfd81ul/prod_bk_us/839a01014ac2f8f527a51a11389264e037f81e57-1600x1600.png",
      "credit": "Burger King",
      "creditUrl": "https://www.bk.com/menu/picker/a82cf1b3-2ceb-4384-8276-770695610232"
    },
    "Whopper": {
      "src": "https://cdn.sanity.io/images/kjfd81ul/prod_bk_us/1c9fe7bcdcb04ef9904726873c96060fcc0d7d0a-1600x1600.png",
      "credit": "Burger King",
      "creditUrl": "https://www.bk.com/menu/picker/picker_5520"
    },
    "Cheeseburger": {
      "src": "https://cdn.sanity.io/images/kjfd81ul/prod_bk_us/73bad2e8571ef9deeb190f941c1b5b53b399b206-1600x1600.png",
      "credit": "Burger King",
      "creditUrl": "https://www.bk.com/menu/picker/b8d37e4f-ae6e-42e9-8182-fd7ee9493855"
    }
  },
  "panda-express-menu-items": {
    "The Original Orange Chicken": {
      "src": "https://olo-images-live.imgix.net/78/783b6c093c4c44428516139005a621f1.png?auto=format%2Ccompress&q=60&cs=tinysrgb&w=810&h=540&fit=crop&fm=png32&s=e8191ba402e81280158b4793829b83e0",
      "credit": "Panda Express",
      "creditUrl": "https://www.pandaexpress.com/"
    },
    "Kung Pao Chicken": {
      "src": "https://olo-images-live.imgix.net/c6/c6bab5caab634b19ae91642a63fcec4e.png?auto=format%2Ccompress&q=60&cs=tinysrgb&w=810&h=540&fit=crop&fm=png32&s=023e0344c42bb51a61efa94b20b74d45",
      "credit": "Panda Express",
      "creditUrl": "https://www.pandaexpress.com/"
    },
    "Beijing Beef": {
      "src": "https://olo-images-live.imgix.net/23/23bb4f38e2b541709bc50ac2c3eb3652.png?auto=format%2Ccompress&q=60&cs=tinysrgb&w=810&h=540&fit=crop&fm=png32&s=0fa142e417bfef7acf816051229363e8",
      "credit": "Panda Express",
      "creditUrl": "https://www.pandaexpress.com/"
    }
  },
  "best-classic-chips": {
    "Ruffles Original": {
      "src": "https://www.ruffles.com/sites/ruffles.com/files//2024-02/Ruffles%20ORIGINAL%202024.png",
      "credit": "Ruffles",
      "creditUrl": "https://www.ruffles.com/products/ruffles-original-potato-chips"
    },
    "Doritos Nacho Cheese": {
      "src": "https://www.doritos.com/sites/doritos.com/files//2024-06/new-nacho-cheese%202024.png",
      "credit": "Doritos",
      "creditUrl": "https://www.doritos.com/products/doritos-nacho-cheese-flavored-tortilla-chips"
    },
    "Ruffles Cheddar & Sour Cream": {
      "src": "https://www.ruffles.com/sites/ruffles.com/files//2024-02/Ruffles%20CSC%202024.png",
      "credit": "Ruffles",
      "creditUrl": "https://www.ruffles.com/products/ruffles-cheddar-sour-cream-flavored-potato-chips"
    },
    "Lay's Sour Cream & Onion": {
      "src": "https://cms.lays.com/sites/lays.com/files//2025-12/Lays_XL_SCO_Laydown.png",
      "credit": "Lay's",
      "creditUrl": "https://www.lays.com/products/lays-sour-cream-onion-flavored-potato-chips"
    }
  },
  "national-park-campgrounds": {
    "Slough Creek Campground (Yellowstone, WY)": {
      "src": "https://cdn.yellowstoneparknet.com/images/content/3025_uxlHU_Slough_Creek_Campground_lg.jpg",
      "credit": "YellowstoneParkNet",
      "creditUrl": "https://www.yellowstoneparknet.com/"
    },
    "Fruita Campground (Capitol Reef, UT)": {
      "src": "https://www.nps.gov/care/planyourvisit/images/CG-fall-color-best.JPG",
      "credit": "NPS / Capitol Reef",
      "creditUrl": "https://www.nps.gov/care/planyourvisit/fruitacampground.htm"
    },
    "Jumbo Rocks Campground (Joshua Tree, CA)": {
      "src": "https://smilkoslens.com/wp-content/uploads/2025/08/SmilkosLens_JoshuaTree2025-096-1440x960.jpg",
      "credit": "Smilko's Lens",
      "creditUrl": "https://smilkoslens.com/"
    }
  },
  "loudest-college-football-stadiums": {
    "Husky Stadium (Washington)": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/1/12/Husky_Stadium_-_April_7%2C_2016.jpg",
      "credit": "David Schott / Wikimedia Commons (CC BY 2.0)",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:Husky_Stadium_-_April_7,_2016.jpg"
    },
    "Ben Hill Griffin Stadium (Florida)": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/7/74/Ben_Hill_Griffin_Stadium_During_%22I_Won%27t_Back_Down%22_Tradition_%28Texas_A%26M_vs._Florida_-_October_14%2C_2017%29.jpg",
      "credit": "GATORFAN2525 / Wikimedia Commons (CC BY-SA 4.0)",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:Ben_Hill_Griffin_Stadium_During_%22I_Won%27t_Back_Down%22_Tradition_(Texas_A%26M_vs._Florida_-_October_14,_2017).jpg"
    },
    "Tiger Stadium (LSU)": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/4/45/Nightgame.jpg",
      "credit": "Cmire4 / Wikimedia Commons (CC BY-SA 3.0)",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:Nightgame.jpg"
    },
    "Neyland Stadium (Tennessee)": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/d/da/Neyland_aerial_view_of_checkerboard.jpg",
      "credit": "Neomrbungle / Wikimedia Commons (CC BY-SA 4.0)",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:Neyland_aerial_view_of_checkerboard.jpg"
    }
  },
  "bachelor-party-cities": {
    "New Orleans (Louisiana)": {
      "src": "https://images.pexels.com/photos/6379409/pexels-photo-6379409.jpeg?auto=compress&cs=tinysrgb&w=1920",
      "credit": "Pexels · Ken Cooper",
      "creditUrl": "https://www.pexels.com/photo/cars-parked-on-the-roadside-near-city-buildings-6379409/"
    },
    "Austin (Texas)": {
      "src": "https://images.pexels.com/photos/34319229/pexels-photo-34319229/free-photo-of-aerial-view-of-austin-skyline-with-colorado-river.jpeg?auto=compress&cs=tinysrgb&w=1920",
      "credit": "Pexels · Drone Task Force",
      "creditUrl": "https://www.pexels.com/photo/aerial-view-of-austin-skyline-with-colorado-river-34319229/"
    },
    "San Diego (California)": {
      "src": "https://images.pexels.com/photos/8980254/pexels-photo-8980254.jpeg?auto=compress&cs=tinysrgb&w=1920",
      "credit": "Pexels · Kindel Media",
      "creditUrl": "https://www.pexels.com/photo/cityscape-scenery-during-nighttime-8980254/"
    },
    "Las Vegas (Nevada)": {
      "src": "https://images.pexels.com/photos/161772/las-vegas-nevada-cities-urban-161772.jpeg?auto=compress&cs=tinysrgb&w=1920",
      "credit": "Pexels · Pixabay",
      "creditUrl": "https://www.pexels.com/photo/aerial-photography-of-city-during-evening-161772/"
    }
  },
  "bachelorette-party-cities": {
    "Las Vegas (Nevada)": {
      "src": "https://images.pexels.com/photos/36015098/pexels-photo-36015098/free-photo-of-vibrant-nightlife-in-las-vegas-nevada.jpeg?auto=compress&cs=tinysrgb&w=1920",
      "credit": "Pexels · David Vives",
      "creditUrl": "https://www.pexels.com/photo/vibrant-nightlife-in-las-vegas-nevada-36015098/"
    },
    "Los Angeles (California)": {
      "src": "https://images.pexels.com/photos/2816168/pexels-photo-2816168.jpeg?auto=compress&cs=tinysrgb&w=1920",
      "credit": "Pexels · Roberto Nickson",
      "creditUrl": "https://www.pexels.com/photo/city-buildings-and-trees-during-golden-hour-2816168/"
    },
    "Austin (Texas)": {
      "src": "https://images.pexels.com/photos/20185085/pexels-photo-20185085/free-photo-of-skyscrapers-by-river-in-austin-at-night.jpeg?auto=compress&cs=tinysrgb&w=1920",
      "credit": "Pexels · Elsie Soto",
      "creditUrl": "https://www.pexels.com/photo/skyscrapers-by-river-in-austin-at-night-20185085/"
    }
  },
  "chilis-menu-items": {
    "Original Trio Fajitas": {
      "src": "https://olo-images-live.imgix.net/53/5389e478052844cdab28d2cb58d95d0f.jpg?auto=format%2Ccompress&q=60&cs=tinysrgb&w=1200&h=800&fit=fill&fm=png32&bg=transparent&s=8fbe7c57c611e5076fae93592bfb530a",
      "credit": "Chili's",
      "creditUrl": "https://www.chilis.com/menu/fajitas/the-original-trio"
    },
    "Baby Back Ribs": {
      "src": "https://olo-images-live.imgix.net/55/55b91b8509604c01a8f6564efad5a0e7.jpg?auto=format%2Ccompress&q=60&cs=tinysrgb&w=1200&h=800&fit=fill&fm=png32&bg=transparent&s=ef493c54b47c3862e9e18f0690bb0ca3",
      "credit": "Chili's",
      "creditUrl": "https://www.chilis.com/menu/bbq-classics/full-rack-of-ribs"
    },
    "The Big QP Burger": {
      "src": "https://olo-images-live.imgix.net/13/13c19a738b40430694c32afbeae56d9d.jpg?auto=format%2Ccompress&q=60&cs=tinysrgb&w=1200&h=800&fit=fill&fm=png32&bg=transparent&s=97b014e014003feebd7ba0688a7a3d33",
      "credit": "Chili's",
      "creditUrl": "https://www.chilis.com/menu/big-mouth-burgers/the-big-qp-burger"
    }
  },
  "outback-steakhouse-menu-items": {
    "Bloomin' Onion": {
      "src": "https://olo-images-live.imgix.net/cc/ccf2338319ed4b5ca84e1bb1bf7d5e67.jpg?auto=format%2Ccompress&q=60&cs=tinysrgb&w=1200&h=800&fit=fill&fm=png32&bg=transparent&s=243060c36d323936ede644df54acd901",
      "credit": "Outback Steakhouse",
      "creditUrl": "https://www.outback.com/menu/secaucus/category/42426/product/34356888"
    },
    "Loaded Mashed Potatoes": {
      "src": "https://olo-images-live.imgix.net/24/240f6c788486419ea59a296563b5d37f.jpg?auto=format%2Ccompress&q=60&cs=tinysrgb&w=1200&h=800&fit=fill&fm=png32&bg=transparent&s=6a3b25374a7d45f8c341ba4e0d6eb908",
      "credit": "Outback Steakhouse",
      "creditUrl": "https://www.outback.com/menu/secaucus/category/44781/product/34364026"
    },
    "Sydney Shrooms": {
      "src": "https://olo-images-live.imgix.net/44/443a811e015b4dc9ad3005e818ff6131.jpg?auto=format%2Ccompress&q=60&cs=tinysrgb&w=1200&h=800&fit=fill&fm=png32&bg=transparent&s=91a1e13a9eee8452b4ca08235d0a2c91",
      "credit": "Outback Steakhouse",
      "creditUrl": "https://www.outback.com/menu/secaucus/category/42426/product/34357024"
    }
  },
  "olive-garden-menu-items": {
    "Shrimp Scampi": {
      "src": "https://www.mashed.com/img/gallery/olive-garden-shrimp-scampi-what-to-know-before-ordering/how-olive-gardens-shrimp-scampi-is-made-1645199001.jpg",
      "credit": "Mashed",
      "creditUrl": "https://www.mashed.com/772801/olive-garden-shrimp-scampi-what-to-know-before-ordering/"
    },
    "Chicken Alfredo": {
      "src": "https://www.mashed.com/img/gallery/olive-garden-chicken-alfredo-what-to-know-before-ordering/how-does-olive-gardens-chicken-alfredo-taste-1631802402.jpg",
      "credit": "Mashed",
      "creditUrl": "https://www.mashed.com/605297/olive-garden-chicken-alfredo-what-to-know-before-ordering/"
    },
    "Chicken & Shrimp Carbonara": {
      "src": "https://www.tastingtable.com/img/gallery/26-chain-restaurant-pasta-dishes-ranked-worst-to-best/olive-garden-chicken-and-shrimp-carbonara-1690003483.jpg",
      "credit": "Tasting Table",
      "creditUrl": "https://www.tastingtable.com/1346356/chain-restaurant-pasta-dishes-ranked-worst-best/"
    }
  },
  "caesar-wraps-miami": {
    "Carrot Express (multiple locations)": {
      "src": "https://carrotexpress.com/wp-content/uploads/2025/03/chicken-caesar.jpg",
      "credit": "Carrot Express",
      "creditUrl": "https://carrotexpress.com"
    },
    "Pura Vida Miami (multiple locations)": {
      "src": "https://images.squarespace-cdn.com/content/v1/5fc6985aec917750a3ff0c92/d22e57d0-4032-4f9b-9789-2db623d3d126/KALE+CHICKEN+CAESAR.jpg",
      "credit": "Pura Vida Miami",
      "creditUrl": "https://puravidamiami.com"
    },
    "The Brightside (Coral Way)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/o0lNmD7M5LtcbJA9vhC9MQ/o.jpg",
      "credit": "Yelp / Hannah W.",
      "creditUrl": "https://www.yelp.com/biz/the-brightside-miami"
    }
  },
  "dive-bars-cape-cod": {
    "The Underground (Provincetown)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/-r0OD4tOYDLaQspUuMtP6g/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/the-underground-bar-provincetown-2"
    },
    "Old Colony Tap (Provincetown)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/Lu0z1EKauJVNLYXOIQDdWQ/o.jpg",
      "credit": "Yelp / M M.",
      "creditUrl": "https://www.yelp.com/biz/old-colony-tap-provincetown"
    },
    "19th Hole Tavern (Hyannis)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/quKfw7oX5gdDybz8oXH3JA/o.jpg",
      "credit": "Yelp / Frank N.",
      "creditUrl": "https://www.yelp.com/biz/19th-hole-tavern-hyannis"
    },
    "Chatham Squire (Chatham)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/fQDosqMWvkIXv6eO4rR7VQ/o.jpg",
      "credit": "Yelp / Tina M.",
      "creditUrl": "https://www.yelp.com/biz/chatham-squire-restaurant-and-tavern-chatham"
    }
  },
  "best-breweries-miami": {
    "Spanish Marie Brewery (Kendall)": {
      "src": "https://www.miaminewtimes.com/wp-content/uploads/sites/4/ww-media/mediaserver/mia/2018-21/spanishmarie_brewery.webp",
      "credit": "Miami New Times",
      "creditUrl": "https://www.miaminewtimes.com/food-drink/spanish-marie-brewery-opens-in-west-kendall-10372573/"
    },
    "Unseen Creatures Brewing (Bird Road)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/f_jpg,w_1600/v1713884962/images/Unseen_Creatures-4_k2bxw6.jpg",
      "credit": "The Infatuation",
      "creditUrl": "https://www.theinfatuation.com/miami/reviews/unseen-creatures-brewing"
    },
    "The Tank Brewing (Doral)": {
      "src": "https://assets.simpleviewinc.com/simpleview/image/upload/c_fit,w_1440,h_900/crm/miamifl/OffbeatMarketMarch21-1166_FA3CE5AB-2247-4409-94F1446F8A784EC1_5139370a-6c6e-4503-87de1131ee460e70.jpg",
      "credit": "Greater Miami & Miami Beach",
      "creditUrl": "https://www.miamiandbeaches.com"
    },
    "Tripping Animals Brewing (Doral)": {
      "src": "https://cestlavibe.com/wp-content/uploads/2025/01/Tripping-Animals-Brewing-in-Doral-Miami-scaled.jpg",
      "credit": "C'est La Vibe",
      "creditUrl": "https://cestlavibe.com"
    },
    "Casa La Rubia (Wynwood)": {
      "src": "https://wynwoodmiami.com/wp-content/uploads/IMG_0031-1-1024x576.jpeg",
      "credit": "Wynwood BID",
      "creditUrl": "https://wynwoodmiami.com"
    },
    "Lincoln's Beard Brewing (Bird Road)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_scale,w_3000,q_auto,f_auto/images/Lincoln_s_Beard_1_comyu7",
      "credit": "The Infatuation",
      "creditUrl": "https://www.theinfatuation.com/miami"
    }
  },
  "non-pretentious-bars-hamptons": {
    "Springs Tavern (Springs)": {
      "src": "https://behindthehedges.com/wp-content/uploads/2021/09/PrintRes_06_15-Fort-Pond-Blvd-East-Hampton_Hal-Zwick-Jeff-Sztorc-1024x768.jpg",
      "credit": "Behind The Hedges / Hal Zwick & Jeff Sztorc",
      "creditUrl": "https://behindthehedges.com"
    },
    "The Montauket (Montauk)": {
      "src": "https://cdn.outsideonline.com/wp-content/uploads/2017/09/15/montauket-hotel-sunset_h.jpg",
      "credit": "Outside Online",
      "creditUrl": "https://www.outsideonline.com"
    },
    "Murf's BackStreet Tavern (Sag Harbor)": {
      "src": "https://hamptons.com/wp-content/uploads/2023/07/murf-taver-sag-harbor.jpg",
      "credit": "Hamptons.com",
      "creditUrl": "https://hamptons.com"
    }
  },
  "best-resorts-bali": {
    "Mandapa, a Ritz-Carlton Reserve (Ubud)": {
      "src": "https://www.travoh.com/wp-content/uploads/2021/12/087-The-Ritz-Carlton-Mandapa-Reserve-Resort-Ubud-Bali-Indonesia-Aerial.jpg",
      "credit": "Mandapa, a Ritz-Carlton Reserve",
      "creditUrl": "https://www.ritzcarlton.com/en/hotels/dpsub-mandapa-a-ritz-carlton-reserve/"
    },
    "Soori Bali (Tabanan)": {
      "src": "https://www.sooribali.com/img/site_images/soori-bali-hotel-accommodations-deluxe-ocean-pool-villa.jpg",
      "credit": "Soori Bali",
      "creditUrl": "https://sooribali.com"
    },
    "Amankila (Manggis)": {
      "src": "https://www.travelplusstyle.com/wp-content/gallery/amankila-bali/rs2060_amankila-08-kila-three-tier-pool.jpg",
      "credit": "Aman / Travel Plus Style",
      "creditUrl": "https://www.travelplusstyle.com/hotels/amankila"
    },
    "Alila Villas Uluwatu (Uluwatu)": {
      "src": "https://assets.hyatt.com/content/dam/hyatt/hyattdam/images/2020/05/06/1156/Alila-Villas-Uluwatu-P122-Sunset-Cliff-Edge-Temple-View.jpg/Alila-Villas-Uluwatu-P122-Sunset-Cliff-Edge-Temple-View.16x9.jpg?imwidth=1920",
      "credit": "Alila Villas Uluwatu / Hyatt",
      "creditUrl": "https://www.hyatt.com/alila/dpsau-alila-villas-uluwatu"
    },
    "COMO Shambhala Estate (Ubud)": {
      "src": "https://media.cntraveler.com/photos/5a380460655f454b1ae52405/16:9/w_2560%2Cc_limit/Hi_064562_44184039_Tirta_Ening_pool.jpg",
      "credit": "Condé Nast Traveler",
      "creditUrl": "https://www.cntraveler.com"
    }
  },
  "steakhouses-buenos-aires": {
    "Don Julio (Palermo)": {
      "src": "https://media.cntraveler.com/photos/5b0595090f509f51788412be/16:9/w_1280%2Cc_limit/Don-Julio_Photographed-by-Javier-Pierini_MG_1585.jpg",
      "credit": "Condé Nast Traveler / Javier Pierini",
      "creditUrl": "https://www.cntraveler.com/restaurants/buenos-aires/don-julio"
    },
    "Fogón Asado (Palermo)": {
      "src": "https://fogonasado.com/wp-content/uploads/2023/09/Copy-of-_DSC7395-scaled.jpg",
      "credit": "Fogón Asado",
      "creditUrl": "https://www.fogonasado.com/"
    },
    "Elena (Recoleta)": {
      "src": "https://www.fourseasons.com/alt/img-opt/~75.701.0,0000-133,2360-2004,0000-2672,0000/publish/content/dam/fourseasons/images/web/BUE/BUE_1359_original.jpg",
      "credit": "Four Seasons Hotel Buenos Aires",
      "creditUrl": "https://www.fourseasons.com/buenosaires/dining/restaurants/elena/"
    }
  },
  "exercise-class-chains": {
    "Orangetheory Fitness": {
      "src": "https://i.insider.com/5c7947c1bde70f6d353ab972?width=1300",
      "credit": "Business Insider",
      "creditUrl": "https://www.businessinsider.com/orangetheory-heart-rate-monitoring-workout-hits-1-billion-sales-what-its-like-2019-2"
    },
    "F45 Training": {
      "src": "https://f45training.com/wp-content/uploads/2026/04/Untitled-design-2026-04-02T110204.155.jpg",
      "credit": "F45 Training",
      "creditUrl": "https://f45training.com/"
    },
    "Club Pilates": {
      "src": "https://a.mktgcdn.com/p/0ipwAyTmStVmEHcI3p2xdaHjwb6ffJfaAgIruUiPDR0/1505x1505.jpg",
      "credit": "Club Pilates",
      "creditUrl": "https://www.clubpilates.com/"
    }
  },
  "north-shore-roast-beef": {
    "Nick's Famous Roast Beef (Beverly)": {
      "src": "https://bdc2020.o0bc.com/wp-content/uploads/2024/04/https___arcmigration-prdweb.bostonglobe.com_r_Boston_2011-2020_2015_04_27_BostonGlobe.com_Business_Images_lynch_050315LocationPics_business_030-1-662822b239cea.jpg",
      "credit": "Juliette Lynch / The Boston Globe",
      "creditUrl": "https://www.boston.com/community/readers-say/best-roast-beef-sandwich-shops-2024/"
    },
    "Billy's Famous Roast Beef (Wakefield)": {
      "src": "https://www.billysroastbeef.com/uploads/tSTIr3Iq/gallery-img2.jpg",
      "credit": "Billy's Famous Roast Beef & Seafood",
      "creditUrl": "https://www.billysroastbeef.com/"
    },
    "The Modern Butcher (Danvers)": {
      "src": "https://www.nshoremag.com/wp-content/uploads/2021/12/RoastBeefModern.jpg",
      "credit": "The Modern Butcher via Northshore Magazine",
      "creditUrl": "https://www.nshoremag.com/eat-drink/north-shore-roast-beef/"
    }
  },
  "travel-strollers-single": {
    "Joolz Aer 2": {
      "src": "https://m.media-amazon.com/images/I/71PpzQv62oL.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B0FM82ZBZR?tag=cgurus-20"
    },
    "UPPAbaby Minu V3": {
      "src": "https://m.media-amazon.com/images/I/610JWD8VemL.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B0DWPB9LYC?tag=cgurus-20"
    },
    "MamaZing Ultra Air X": {
      "src": "https://m.media-amazon.com/images/I/71EGepAqf9L.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B0CX999YMH?tag=cgurus-20"
    }
  },
  "exclusive-golf-clubs": {
    "Augusta National Golf Club (Augusta, USA)": {
      "src": "https://photo-assets.masters.com/images/pics/tablet/m_clubhouse_chANGC14_1b5607Hc_web.jpg",
      "credit": "Masters.com",
      "creditUrl": "https://www.masters.com"
    },
    "Cypress Point Club (Pebble Beach, USA)": {
      "src": "https://golf.com/wp-content/uploads/2020/05/cypress-point-1.jpg",
      "credit": "Golf.com",
      "creditUrl": "https://golf.com"
    },
    "Pine Valley Golf Club (Pine Valley, USA)": {
      "src": "https://golfdigest.sports.sndimg.com/content/dam/images/golfdigest/fullset/course-photos-for-places-to-play/pine-valley-golf-club-new-jersey-eighteen-7601.jpg.rend.hgtvcom.1920.1080.suffix/1706880976540.jpeg",
      "credit": "Golf Digest",
      "creditUrl": "https://www.golfdigest.com"
    }
  },
  "best-rosewood-hotels-world": {
    "Hôtel de Crillon, a Rosewood Hotel (Paris, France)": {
      "src": "https://picasso.rosewoodhotelgroup.com/transform/26195467-2975-4172-b39d-2a23411185d7/RWCRI_Summer-2026_Terrasse-Comestibles_courtyard_top-view-1",
      "credit": "Hôtel de Crillon / Rosewood",
      "creditUrl": "https://www.rosewoodhotels.com/en/hotel-de-crillon"
    },
    "Las Ventanas al Paraíso, a Rosewood Resort (Los Cabos, Mexico)": {
      "src": "https://picasso.rosewoodhotelgroup.com/transform/ddfb3a23-519b-45e0-8f96-f61ef422489d/RWLVP_3-0_Brand-com_Assets_PHOTO_RESORT_MORNING_2",
      "credit": "Las Ventanas al Paraíso / Rosewood",
      "creditUrl": "https://www.rosewoodhotels.com/en/las-ventanas-los-cabos"
    },
    "Rosewood Hong Kong (China)": {
      "src": "https://www.cathaypacific.com/content/dam/focal-point/cx/inspiration/2025/08/Best_hotel_pools_hong_kong_Rosewood_Hong%20Kong_Asaya%20Pool_5.renditionimage.900.900.jpg",
      "credit": "Cathay Pacific",
      "creditUrl": "https://www.rosewoodhotels.com/en/hong-kong"
    }
  },
  "deli-sandwiches-greater-boston": {
    "Sam LaGrassa's (Downtown, Boston)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_3840,ar_4:3,g_center,f_auto/cms/reviews/sam-lagrassas/tinapicz_boston_sam_2520lagrassas_pastrami_2520traveler",
      "credit": "The Infatuation / Tina Picz",
      "creditUrl": "https://www.theinfatuation.com/boston/reviews/sam-lagrassas"
    },
    "Cutty's (Brookline)": {
      "src": "https://www.thefoodlens.com/uploads/2017/01/CUTTYS_THE-FOOD-LENS_BRIAN-SAMUELS-PHOTOGRAPHY-5600.jpg",
      "credit": "The Food Lens / Brian Samuels",
      "creditUrl": "https://www.thefoodlens.com"
    },
    "Pauli's (North End, Boston)": {
      "src": "https://paulisnorthend.com/wp-content/uploads/2021/01/rotator-mama-luca-scaled.jpg",
      "credit": "Pauli's North End",
      "creditUrl": "https://paulisnorthend.com"
    }
  },
  "savannah-coffee-shops": {
    "Foxy Loxy Cafe (Starland District)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/yu3RvpL4nF0X2q7mAxUjxA/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/foxy-loxy-cafe-savannah"
    },
    "The Collins Quarter (Historic District)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/W6u929CRqrrBVQ8mQuiNag/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/the-collins-quarter-savannah-2"
    },
    "Bitty & Beau's Coffee (Historic District)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/kLX5NbugWQg-j2dArAl6wA/o.jpg",
      "credit": "Yelp / Stephanie P.",
      "creditUrl": "https://www.yelp.com/biz/bitty-and-beau-s-coffee-savannah"
    },
    "PERC Coffee (Thomas Square)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/X9N7Gv_lktR1cQDyicuGOA/o.jpg",
      "credit": "Yelp / Vina H.",
      "creditUrl": "https://www.yelp.com/biz/perc-coffee-savannah-2"
    }
  },
  "most-difficult-whitewater-us": {
    "Cherry Creek / Upper Tuolumne (California)": {
      "src": "https://www.whitewaterguidebook.com/wp-content/uploads/2019/09/Cherry-Creek-Coffin.jpg",
      "credit": "All-Outdoors via Whitewater Guidebook",
      "creditUrl": "https://www.whitewaterguidebook.com/california/cherry-creek/"
    },
    "Upper Gauley River (West Virginia)": {
      "src": "https://mild2wildrafting.com/wp-content/uploads/2016/09/Upper-Gauley-1-1536x1024.jpg",
      "credit": "Adventures on the Gorge",
      "creditUrl": "https://www.adventuresonthegorge.com/whitewater-rafting/upper-gauley"
    },
    "Gore Canyon (Colorado)": {
      "src": "https://b3555130.smushcdn.com/3555130/wp-content/uploads/2019/03/heroimage.jpg?lossy=2&strip=1&webp=1",
      "credit": "Liquid Descent Rafting",
      "creditUrl": "https://liquiddescent.com/"
    }
  },
  "mens-running-shoes": {
    "Asics Novablast 5": {
      "src": "https://m.media-amazon.com/images/I/61iRrkj9NRL._AC_SL1200_.jpg",
      "credit": "ASICS",
      "creditUrl": "https://www.amazon.com/dp/B0F641N8G7?tag=cgurus-20"
    },
    "Adidas Adizero Evo SL": {
      "src": "https://m.media-amazon.com/images/I/71ecvx8KUoL._AC_SL1500_.jpg",
      "credit": "adidas",
      "creditUrl": "https://www.amazon.com/dp/B0D3JB5X67?tag=cgurus-20"
    },
    "Nike Vomero 18": {
      "src": "https://m.media-amazon.com/images/I/71LJtVhd9wL._AC_SL1500_.jpg",
      "credit": "Nike",
      "creditUrl": "https://www.amazon.com/dp/B0DZ6ZYHP4?tag=cgurus-20"
    }
  },
  "island-resorts-indian-ocean": {
    "Six Senses Laamu (Laamu Atoll, Maldives)": {
      "src": "https://discerning.wp-cdn.site/wp-content/uploads/2025/12/09133326/Overwater-Villas-at-Six-Senses-Laamu-Blending-Seamlessly-with-the-Lagoon-1920x1080.jpg",
      "credit": "Discerning Collection",
      "creditUrl": "https://www.discerningcollection.com/"
    },
    "Soneva Secret (Haa Dhaalu Atoll, Maldives)": {
      "src": "https://media.cntraveler.com/photos/6650c0bcc549c9304a678583/16:9/w_2560,c_limit/Soneva%20Secret%20-%20Glass%20Kayaks%20at%20the%20Overwater%20Hideaway_Stevie%20Mann%20for%20Soneva.jpg",
      "credit": "Stevie Mann / Soneva",
      "creditUrl": "https://soneva.com/resorts/soneva-secret/"
    },
    "Cheval Blanc Randheli (Noonu Atoll, Maldives)": {
      "src": "https://images.prismic.io/lvmh-chevalblanc/Z873ZBsAHJWomSPM_WebRGB-ChevalBlancRandheli-LagoonVilla-OliverFly-2024-1.jpg?auto=format%2Ccompress&fit=max&w=2000",
      "credit": "Oliver Fly / Cheval Blanc",
      "creditUrl": "https://www.chevalblanc.com/en/maison/randheli/"
    }
  },
  "unique-time-saving-kitchen-gadgets": {
    "Thaw Claw Rapid Defrosting Weight": {
      "src": "https://m.media-amazon.com/images/I/81mLlDlVS1L._AC_SL1500_.jpg",
      "credit": "Thaw Claw",
      "creditUrl": "https://www.amazon.com/dp/B011PY6IJ6?tag=cgurus-20"
    },
    "Souper Cubes Freezer Portion Tray": {
      "src": "https://m.media-amazon.com/images/I/713Tq5gZFaL._AC_SL1500_.jpg",
      "credit": "Souper Cubes",
      "creditUrl": "https://www.amazon.com/dp/B07GSSR5V2?tag=cgurus-20"
    },
    "Dash Rapid Egg Cooker": {
      "src": "https://m.media-amazon.com/images/I/61zAq3obq8L._AC_SL1500_.jpg",
      "credit": "Dash",
      "creditUrl": "https://www.amazon.com/dp/B0D3X1JDK4?tag=cgurus-20"
    }
  },
  "trader-joes-frozen-meals": {
    "Butter Chicken with Basmati Rice": {
      "src": "https://www.traderjoes.com/content/dam/trjo/products/m20602/99032.png",
      "credit": "Trader Joe's",
      "creditUrl": "https://www.traderjoes.com/home/products/pdp/butter-chicken-with-basmati-rice-099032"
    },
    "Mandarin Orange Chicken": {
      "src": "https://www.traderjoes.com/content/dam/trjo/products/m20602/66563.png",
      "credit": "Trader Joe's",
      "creditUrl": "https://www.traderjoes.com/home/products/pdp/mandarin-orange-chicken-066563"
    },
    "Steamed Chicken Soup Dumplings": {
      "src": "https://www.traderjoes.com/content/dam/trjo/products/m20602/54988.png",
      "credit": "Trader Joe's",
      "creditUrl": "https://www.traderjoes.com/home/products/pdp/steamed-chicken-soup-dumplings-054988"
    }
  },
  "tacos-miami": {
    "Taquiza (Miami Beach)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_3840,ar_4:3,g_center,f_auto/cms/reviews/taquiza-south-beach/Taquiza-7",
      "credit": "The Infatuation",
      "creditUrl": "https://www.theinfatuation.com/miami/reviews/taquiza-south-beach"
    },
    "Wolf of Tacos (Downtown)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/R9heAl_spZINxuACqUi-lg/o.jpg",
      "credit": "Yelp / Deena",
      "creditUrl": "https://www.yelp.com/biz/the-wolf-of-tacos-miami-2"
    },
    "The Taco Stand (Wynwood)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/iGbc551joYsQdOncWcg23w/o.jpg",
      "credit": "Yelp / Jessica B.",
      "creditUrl": "https://www.yelp.com/biz/the-taco-stand-miami"
    },
    "Bakan (Wynwood)": {
      "src": "https://media.timeout.com/images/105385080/750/422/image.jpg",
      "credit": "Time Out",
      "creditUrl": "https://www.timeout.com/miami/restaurants/bakan"
    }
  },
  "european-ski-resorts": {
    "Zermatt (Valais, Switzerland)": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/1_zermatt_evening_2022.jpg/1280px-1_zermatt_evening_2022.jpg",
      "credit": "Wikimedia Commons",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:1_zermatt_evening_2022.jpg"
    },
    "Verbier (Valais, Switzerland)": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/c/cb/Verbier%2C_Switzerland%2C_in_2011.jpg",
      "credit": "Wikimedia Commons",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:Verbier,_Switzerland,_in_2011.jpg"
    },
    "Val Thorens (Savoie, France)": {
      "src": "https://ugosnow.com/wp-content/uploads/2023/11/val-thorens-2.jpeg",
      "credit": "UgoSnow",
      "creditUrl": "https://ugosnow.com"
    }
  },
  "best-breweries-atlanta": {
    "Wrecking Bar Brewpub (Little Five Points)": {
      "src": "https://cdn.savingplaces.org/2016/10/11/11/55/41/935/WreckingBar_Keizers_Wikimedia+Commons.jpg",
      "credit": "Keizers via National Trust for Historic Preservation",
      "creditUrl": "https://savingplaces.org/stories/the-wrecking-bar-brewpub-in-atlanta-georgia"
    },
    "Monday Night Brewing (West Midtown)": {
      "src": "https://cdn.mondaynightbrewing.com/uploads/2023/12/Nr4xKHB4-50341871687_836fe4ff77_o-edited-scaled-1.jpg",
      "credit": "Monday Night Brewing",
      "creditUrl": "https://mondaynightbrewing.com"
    },
    "Fire Maker Brewing (East Atlanta Village)": {
      "src": "https://images.squarespace-cdn.com/content/v1/649300b785c3ff79231cab3b/1d85030b-5d09-425d-9466-4005ddb8a408/Main%2BTaproom%2B-%2BCovered%2BPatio%2B2.jpg",
      "credit": "Fire Maker Brewing",
      "creditUrl": "https://firemakerbeer.com"
    },
    "Scofflaw Brewing (Upper Westside)": {
      "src": "https://craftpeak-cooler-images.imgix.net/scofflaw-brewing/macarthur-sign-web.jpg?auto=compress%2Cformat&ixlib=php-3.3.1&s=417d07f01a559d09ac98dbb1fda20fc5",
      "credit": "Scofflaw Brewing Co.",
      "creditUrl": "https://www.scofflawbeer.com"
    },
    "Bold Monk Brewing (Upper Westside)": {
      "src": "https://res.cloudinary.com/atlanta/images/w_1300,h_867/f_auto,q_auto/v1661877476/newAtlanta.com/Bold-Monk-Brewing-Co/Bold-Monk-Brewing-Co.jpeg",
      "credit": "Discover Atlanta",
      "creditUrl": "https://discoveratlanta.com"
    }
  },
  "vegas-casino-hotels": {
    "The Venetian Resort Las Vegas (Center Strip)": {
      "src": "https://foresyteapp.com/wp-content/uploads/2020/04/venetian-canals-las-vegas.jpg",
      "credit": "The Venetian Resort",
      "creditUrl": "https://www.venetianlasvegas.com/"
    },
    "Wynn Las Vegas (North Strip)": {
      "src": "https://secure.s.forbestravelguide.com/img/properties/wynn-las-vegas/extra-large/wynn-las-vegas-exterior.jpg",
      "credit": "Wynn Las Vegas / Forbes Travel Guide",
      "creditUrl": "https://www.forbestravelguide.com/hotels/las-vegas-nevada/wynn-las-vegas"
    },
    "Bellagio (Center Strip)": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/b/b6/Bellagio_Fountains_at_night.jpg",
      "credit": "Wikimedia Commons",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:Bellagio_Fountains_at_night.jpg"
    },
    "Encore at Wynn Las Vegas (North Strip)": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/d/d2/Encore%2C_Las_Vegas_Strip.jpg",
      "credit": "Wikimedia Commons",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:Encore,_Las_Vegas_Strip.jpg"
    }
  },
  "burgers-boston": {
    "Neptune Oyster (North End)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/etDhEvJB71DJCwG2b1Se_Q/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/neptune-oyster-boston"
    },
    "Little Donkey (Central Square)": {
      "src": "https://www.boston.com/wp-content/uploads/2016/07/burgerBeer.jpg",
      "credit": "Boston.com",
      "creditUrl": "https://www.boston.com/food/restaurants/2016/07/18/little-donkey-opens-cambridges-central-square/"
    },
    "Bred Gourmet (Dorchester)": {
      "src": "https://savorytraveler.com/wp-content/uploads/2023/09/BredParisianBurger-e1694150715574.jpeg",
      "credit": "The Savory Traveler",
      "creditUrl": "https://savorytraveler.com"
    },
    "Hojoko (Fenway)": {
      "src": "https://cdn.vox-cdn.com/thumbor/Ycte9DW8wugRpbKOEwPFJqMRKDY=/0x0:1051x1051/1200x900/filters:focal(442x442:610x610):no_upscale()/cdn.vox-cdn.com/uploads/chorus_image/image/62567892/30590797_462304367520718_5557603920571793408_n.0.0.jpg",
      "credit": "Hojoko via Eater Boston",
      "creditUrl": "https://boston.eater.com/maps/best-boston-burgers"
    },
    "jm Curley (Downtown)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_3840,ar_4:3,g_center,f_auto/cms/guides/the-best-burgers-in-boston/25C2_25A9NatalieAnnSchaefer_JMCurleys-2",
      "credit": "The Infatuation / Natalie Ann Schaefer",
      "creditUrl": "https://www.theinfatuation.com/boston/guides/the-best-burgers-in-boston"
    },
    "The Quiet Few (East Boston)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_1280,ar_16:9,g_center,f_auto/images/Boston_QuietFew_Burger_CatherineSmart_iPhoneContent_EDIT_01_sjnigp",
      "credit": "The Infatuation · Catherine Smart",
      "creditUrl": "https://www.theinfatuation.com/boston/guides/the-best-burgers-in-boston"
    },
    "Gray's Hall (South Boston)": {
      "src": "https://bomag.o0bc.com/wp-content/uploads/sites/2/2023/12/grayshallburger-605x403.jpg",
      "credit": "Boston Magazine",
      "creditUrl": "https://www.bostonmagazine.com/restaurants/best-restaurants-south-boston/"
    },
    "Highland Kitchen (Somerville)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/QbyAkJwxNAvrAtajt3rlNA/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/highland-kitchen-somerville"
    }
  },
  "best-hotels-marrakesh": {
    "Royal Mansour Marrakech (Medina)": {
      "src": "https://www.royalmansour.com/wp-content/uploads/2023/09/RM-Marrakech-1-4.jpg",
      "credit": "Royal Mansour",
      "creditUrl": "https://www.royalmansour.com/en/marrakech/"
    },
    "Amanjena (Route de Ouarzazate)": {
      "src": "https://www.aman.com/sites/default/files/2022-07/Amanjena_Central%20Bassin_Landscape.jpg",
      "credit": "Aman",
      "creditUrl": "https://www.aman.com/resorts/amanjena"
    },
    "La Mamounia (Medina)": {
      "src": "https://mamounia.com/media/cache/jadro_resize/rc/ZTxEmTiT1776666287/jadroRoot/medias/653fcee154467/6540e50e0c796/6540e5783a736/accueil-la-mamounia-vue-drone.jpeg",
      "credit": "La Mamounia",
      "creditUrl": "https://mamounia.com/en/"
    }
  },
  "best-hotels-casablanca": {
    "Four Seasons Hotel Casablanca (Corniche)": {
      "src": "https://www.fourseasons.com/alt/img-opt/~60..31,5000-0,0000-2400,0000-3000,0000/author/content/dam/fourseasons/images/web/CBL/CBL_044_original.jpg",
      "credit": "Four Seasons",
      "creditUrl": "https://www.fourseasons.com/casablanca/"
    },
    "Royal Mansour Casablanca (City Center)": {
      "src": "https://www.royalmansour.com/wp-content/uploads/2024/07/casa-g-entree.jpg",
      "credit": "Royal Mansour",
      "creditUrl": "https://www.royalmansour.com/en/casablanca/"
    },
    "Hotel Le Doge (Gauthier)": {
      "src": "https://www.hotelledoge.com/_novaimg/5149182-1523731_37_0_1466_1099_1200_900.jpg",
      "credit": "Hotel Le Doge",
      "creditUrl": "https://www.hotelledoge.com/"
    }
  },
  "best-hotels-cape-town": {
    "Ellerman House (Bantry Bay)": {
      "src": "https://www.ellerman.co.za/storage/app/media/resources/resize/img_14c0494fb6cb698c5e8297ea5701e3ef_1920_0_0_0_auto.jpg",
      "credit": "Ellerman House",
      "creditUrl": "https://www.ellerman.co.za"
    },
    "Mount Nelson, A Belmond Hotel (Gardens)": {
      "src": "https://img.belmond.com/f_auto/t_2580x1299/photos/mnh/mnh-ext06.jpg",
      "credit": "Belmond",
      "creditUrl": "https://www.belmond.com/hotels/africa/south-africa/cape-town/belmond-mount-nelson-hotel/"
    },
    "One&Only Cape Town (V&A Waterfront)": {
      "src": "https://assets.kerzner.com/api/public/content/9966c55dbfec4d0183bfba0d9267743d",
      "credit": "One&Only Resorts",
      "creditUrl": "https://www.oneandonlyresorts.com/cape-town"
    }
  },
  "best-hotels-st-petersburg": {
    "Lion Palace Hotel (St. Isaac's Square)": {
      "src": "https://lionpalacehotel.com/upload/iblock/769/pr0hf38oz0c11d3zw6i0vcu7tad2cxrz.jpeg",
      "credit": "Lion Palace Hotel",
      "creditUrl": "https://lionpalacehotel.com/en/"
    },
    "Grand Hotel Europe (Nevsky Prospekt)": {
      "src": "https://grandhoteleurope.com/upload/iblock/238/qy4iom3zig9z0rojnnnwt1vd7j6wehju.jpg",
      "credit": "Grand Hotel Europe",
      "creditUrl": "https://grandhoteleurope.com/en/"
    },
    "Grand Hotel Moika 22 (Palace Square)": {
      "src": "https://moika22-stpetersburg.com/upload/iblock/0f2/sueo3kfq2sw0ho54ms1idydypdryc6zj.jpeg",
      "credit": "Grand Hotel Moika 22",
      "creditUrl": "https://moika22-stpetersburg.com/en/"
    }
  },
  "best-hotels-oslo": {
    "Amerikalinjen (Bjorvika)": {
      "src": "https://amerikalinjen.com/wp-content/uploads/2020/01/Amerikalinjen20011-2-2-1024x683.jpg",
      "credit": "Amerikalinjen",
      "creditUrl": "https://amerikalinjen.com/"
    },
    "The Thief (Tjuvholmen)": {
      "src": "https://static.thatsup.website/520/59579/_DSF4277.jpg",
      "credit": "The Thief",
      "creditUrl": "https://thethief.com/en"
    },
    "Sommerro (Frogner)": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Hotellet_Sommerro_tidligere_Oslo_lysverker_Solli_plass_Oslo_hovedinngang.jpg/1280px-Hotellet_Sommerro_tidligere_Oslo_lysverker_Solli_plass_Oslo_hovedinngang.jpg",
      "credit": "Wikimedia Commons",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:Hotellet_Sommerro_tidligere_Oslo_lysverker_Solli_plass_Oslo_hovedinngang.jpg"
    }
  },
  "best-hotels-helsinki": {
    "Hotel Kamp (Kluuvi)": {
      "src": "https://d2t5mz3mhhuf34.cloudfront.net/Hotel-Kamp-Exterior-2000x1150.jpg",
      "credit": "Hotel Kamp",
      "creditUrl": "https://www.hotelkamp.com/en/"
    },
    "Hotel St. George (Kluuvi)": {
      "src": "https://d2wxmbjkuhn0pi.cloudfront.net/_800x600_crop_center-center/HotelStGeorge_spring_facade_1200x800px.jpg",
      "credit": "Hotel St. George",
      "creditUrl": "https://www.stgeorgehelsinki.com/"
    },
    "Solo Sokos Hotel Pier 4 (Katajanokka)": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Katajanokan_laituri_2025_%28cropped%29.jpg/1280px-Katajanokan_laituri_2025_%28cropped%29.jpg",
      "credit": "Wikimedia Commons",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:Katajanokan_laituri_2025_(cropped).jpg"
    }
  },
  "best-hotels-kyiv": {
    "InterContinental Kyiv (St. Michael's Square)": {
      "src": "https://digital.ihg.com/is/image/ihg/intercontinental-kyiv-5925399331-2x1",
      "credit": "InterContinental Hotels",
      "creditUrl": "https://www.ihg.com/intercontinental/hotels/us/en/kiev/kbpha/hoteldetail"
    },
    "Opera Hotel (Shevchenkivskyi)": {
      "src": "https://image-tc.galaxy.tf/wijpeg-31celbz5wqjg6g0ql34mt20is/outside.jpg",
      "credit": "Opera Hotel",
      "creditUrl": "https://www.opera-hotel.com/"
    },
    "Hyatt Regency Kyiv (Old Town)": {
      "src": "https://assets.hyatt.com/content/dam/hyatt/hyattdam/images/2020/08/04/0405/Hyatt-Regency-Kiev-P189-Exterior.jpg/Hyatt-Regency-Kiev-P189-Exterior.4x3.jpg",
      "credit": "Hyatt",
      "creditUrl": "https://www.hyatt.com/hyatt-regency/en-US/kievh-hyatt-regency-kyiv"
    }
  },
  "best-hotels-rio-de-janeiro": {
    "Copacabana Palace, A Belmond Hotel (Copacabana)": {
      "src": "https://img.belmond.com/f_auto/t_2580x1299/photos/cop/cop-din-pool06.jpg",
      "credit": "Belmond",
      "creditUrl": "https://www.belmond.com/hotels/south-america/brazil/rio-de-janeiro/belmond-copacabana-palace/"
    },
    "Emiliano Rio (Copacabana)": {
      "src": "https://www.metalocus.es/sites/default/files/styles/mopis_news_carousel_item_desktop/public/metalocus_oppenheim-architecture-emiliano-hotel-rio-de-janeiro_21.jpg",
      "credit": "Metalocus · Oppenheim Architecture",
      "creditUrl": "https://www.metalocus.es/en/news/emiliano-hotel-rio-de-janeiro-oppenheim-architecture"
    },
    "Hotel Fasano Rio de Janeiro (Ipanema)": {
      "src": "https://fasano.com.br/wp-content/uploads/2023/10/Rooftop_HFRJ_credDaniel-Pinheiro%C2%A9-3.jpg",
      "credit": "Fasano · Daniel Pinheiro",
      "creditUrl": "https://fasano.com.br/en/hotel/fasano-rio-de-janeiro/"
    }
  },
  "best-hotels-sao-paulo": {
    "Emiliano Sao Paulo (Jardins)": {
      "src": "https://i0.wp.com/emiliano.com.br/wp-content/uploads/2016/09/suite-cubo1.jpg",
      "credit": "Emiliano",
      "creditUrl": "https://emiliano.com.br/en/"
    },
    "Hotel Fasano Sao Paulo (Jardins)": {
      "src": "https://fasano.com.br/wp-content/uploads/2024/05/Hotel-Fasano-Sao-Paulo-C-scaled.jpg",
      "credit": "Fasano",
      "creditUrl": "https://fasano.com.br/en/hotel/hotel-fasano-sao-paulo/"
    },
    "Palacio Tangara (Panamby)": {
      "src": "https://images.eu.ctfassets.net/og3b0tarlg4b/emBhrr2QfinJQR5qmrrcf/4f8d1775b5156b2648f991a3d61a85c3/SAO-hero-banner-cover-image_web.jpg",
      "credit": "Oetker Collection",
      "creditUrl": "https://www.oetkercollection.com/hotels/palacio-tangara/"
    }
  },
  "best-hotels-santiago": {
    "The Ritz-Carlton Santiago (El Golf)": {
      "src": "https://cache.marriott.com/is/image/marriotts7prod/new_rcsanti_00106:Classic-Hor",
      "credit": "The Ritz-Carlton",
      "creditUrl": "https://www.ritzcarlton.com/en/hotels/santiago"
    },
    "The Singular Santiago (Lastarria)": {
      "src": "https://image-tc.galaxy.tf/wijpeg-8ligxil7tau6mhecqs8564lnb/interior-rooftop-2.jpg",
      "credit": "The Singular",
      "creditUrl": "https://www.thesingular.com/santiago"
    },
    "Mandarin Oriental Santiago (Las Condes)": {
      "src": "https://www.travoh.com/wp-content/uploads/2022/07/037-Mandarin-Oriental-Santiago-Hotel-Santiago-Chile-Exterior-Garden-and-Pool-Overhead-View-1024x683.jpg",
      "credit": "Travoh",
      "creditUrl": "https://www.travoh.com/mandarin-oriental-santiago-hotel-santiago-chile/"
    }
  },
  "best-hotels-cartagena": {
    "Sofitel Legend Santa Clara (San Diego)": {
      "src": "https://s3.amazonaws.com/static-webstudio-accorhotels-usa-1.wp-ha.fastbooking.com/wp-content/uploads/sites/15/2019/12/31133224/Sofitel_Legend_santaclara_homepage_slide01-1024x559.jpg",
      "credit": "Sofitel Legend Santa Clara",
      "creditUrl": "https://www.sofitellegendsantaclara.com"
    },
    "Casa San Agustin (Old City)": {
      "src": "https://hotelcasasanagustin.com/wp-content/uploads/2024/09/OurHouse-big-gal-03.jpg",
      "credit": "Casa San Agustin",
      "creditUrl": "https://www.hotelcasasanagustin.com"
    },
    "Casa Pestagua (Old City)": {
      "src": "https://casapestagua.com/wp-content/uploads/2025/02/TRE_8309-HDR-scaled.jpg",
      "credit": "Casa Pestagua",
      "creditUrl": "https://casapestagua.com/"
    }
  },
  "frozen-pizza-brands": {
    "California Pizza Kitchen": {
      "src": "https://www.goodnes.com/sites/g/files/jgfbjl321/files/styles/gdn_hero_pdp_product_image/public/gdn_product/field_product_images/cpk-mwjvlqjamdmlqxfcfsnn.jpg.webp?itok=eW8crT4o",
      "credit": "California Pizza Kitchen",
      "creditUrl": "https://www.goodnes.com/cpk-frozen/products/signature-uncured-pepperoni-frozen-pizza/"
    },
    "Screamin' Sicilian": {
      "src": "https://admin.screaminsicilian.com/wp-content/uploads/2020/08/original_holypepperoni_overhead.png",
      "credit": "Screamin' Sicilian",
      "creditUrl": "https://screaminsicilian.com/product/holy-pepperoni/"
    },
    "DiGiorno": {
      "src": "https://www.goodnes.com/sites/g/files/jgfbjl321/files/styles/gdn_hero_pdp_product_image/public/gdn_product/field_product_images/digiorno-qhybppsxwm8ktxglpf1v.jpg.webp?itok=x08ifqnQ",
      "credit": "DiGiorno",
      "creditUrl": "https://www.goodnes.com/digiorno/products/rising-crust-pepperoni-pizza-24-oz/"
    }
  },
  "trader-joes-snacks": {
    "Chili & Lime Flavored Rolled Corn Tortilla Chips": {
      "src": "https://www.traderjoes.com/content/dam/trjo/products/m21001/61420.png",
      "credit": "Trader Joe's",
      "creditUrl": "https://www.traderjoes.com/home/products/pdp/chili-lime-flavored-rolled-corn-tortilla-chips-061420"
    },
    "Garlic Butter Irish Potato Chips": {
      "src": "https://www.traderjoes.com/content/dam/trjo/products/m21001/79817.png",
      "credit": "Trader Joe's",
      "creditUrl": "https://www.traderjoes.com/home/products/pdp/garlic-butter-irish-potato-chips-079817"
    },
    "Ode to the Classic Potato Chip": {
      "src": "https://www.traderjoes.com/content/dam/trjo/products/m21001/96695.png",
      "credit": "Trader Joe's",
      "creditUrl": "https://www.traderjoes.com/home/products/pdp/ode-to-the-classic-potato-chip-096695"
    }
  },
  "best-run-chipotle-manhattan": {
    "129 W 48th St (Midtown)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/nhdzomBlPlcejN7VkbKUpg/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/chipotle-mexican-grill-new-york-38"
    },
    "350 5th Ave (Midtown)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/4nrdTAaoIXF899m0s7FYqg/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/chipotle-mexican-grill-new-york-31"
    },
    "504 6th Ave (Greenwich Village)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/4uVaht4sSvrsxEKIFqSEOQ/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/chipotle-mexican-grill-new-york-23"
    }
  },
  "best-run-cava-nyc": {
    "1000 8th Ave (Midtown West)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/TrzsFb858QP4wvhLAZrW0w/o.jpg",
      "credit": "CAVA via Yelp",
      "creditUrl": "https://www.yelp.com/biz/cava-new-york-35"
    },
    "350 Hudson St (Hudson Square)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/w2EHX1B8Fa0Ujm3dCsGUdg/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/cava-new-york-31"
    },
    "307 7th Ave (Chelsea)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/J9gyZsEzncuhOkJdpd7Lxg/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/cava-new-york-29"
    }
  },
  "best-luxury-hotel-brands-world": {
    "Aman": {
      "src": "https://www.aman.com/sites/default/files/styles/full_size_browser%402x/public/2024-05/amangiri_utah_-_main_pool.jpg?itok=_tjth25U",
      "credit": "Aman",
      "creditUrl": "https://www.aman.com/resorts/amangiri"
    },
    "Four Seasons": {
      "src": "https://www.fourseasons.com/alt/img-opt/~70.1920.1384,0000-0,0000-1616,0000-909,0000/publish/content/dam/fourseasons/images/web/BOR/BOR_1614_original.jpg",
      "credit": "Four Seasons",
      "creditUrl": "https://www.fourseasons.com/borabora/"
    },
    "Mandarin Oriental": {
      "src": "https://secure.s.forbestravelguide.com/img/properties/mandarin-oriental-boston/extra-large/mandarin-oriental-boston-exterior.jpg",
      "credit": "Mandarin Oriental / Forbes Travel Guide",
      "creditUrl": "https://www.forbestravelguide.com/hotels/boston-massachusetts/mandarin-oriental-boston"
    }
  },
  "kirkland-signature-costco": {
    "Kirkland Signature Extra Virgin Olive Oil": {
      "src": "https://bfasset.costco-static.com/U447IH35/as/pn6bxxxcr47xnknhjrfcgn/71003-847__1",
      "credit": "Costco",
      "creditUrl": "https://www.costco.com/kirkland-signature-extra-virgin-italian-olive-oil%2C-2-l.product.100334865.html"
    },
    "Kirkland Signature Imported Basil Pesto": {
      "src": "https://bfasset.costco-static.com/U447IH35/as/2hf3q35mv9jvwg3jt4vr4n5v/990551-847__1",
      "credit": "Costco",
      "creditUrl": "https://www.costco.com"
    },
    "Kirkland Signature Super Premium Vanilla Ice Cream": {
      "src": "https://bfasset.costco-static.com/U447IH35/as/sf25fsq9v6hr99sz2ktq8c7v/948400-inc__1",
      "credit": "Costco",
      "creditUrl": "https://www.costco.com"
    }
  },
  "burgers-sf": {
    "Lovely's (Cole Valley)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_3840,ar_4:3,g_center,f_auto/images/Lovelys_DriveThruBurger_CarlyHackbarth_SF5_w2jlzq",
      "credit": "Carly Hackbarth / The Infatuation",
      "creditUrl": "https://www.theinfatuation.com/san-francisco/reviews/lovelys-sf"
    },
    "The Laundromat (Richmond)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_3840,ar_4:3,g_center,f_auto/images/MZink_SF_theLaundromat_Burger_01_n8qgvg",
      "credit": "Melissa Zink / The Infatuation",
      "creditUrl": "https://www.theinfatuation.com/san-francisco/reviews/the-laundromat"
    },
    "Beep's Burgers (Ingleside)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_3840,ar_4:3,g_center,f_auto/images/MZink_SF_Beeps_Burger_3_ddnfve",
      "credit": "Melissa Zink / The Infatuation",
      "creditUrl": "https://www.theinfatuation.com/san-francisco/reviews/beeps-burgers"
    },
    "Native Burger (Richmond)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_1280,ar_16:9,g_center,f_auto/images/Native_Burger_Native_Burger_San_Francisco_Brittany_Finnegan-2_l7cedt",
      "credit": "Brittany Finnegan / The Infatuation",
      "creditUrl": "https://www.theinfatuation.com/san-francisco/guides/best-burgers-san-francisco"
    }
  },
  "pizza-buffalo": {
    "Bocce Club Pizza (Amherst)": {
      "src": "https://www.usatoday.com/gcdn/-mm-/40e1f6fc8090f7035fa876e9b003961f8dd0d0b6/c=0-613-3996-2871/local/-/media/2016/09/19/USATODAY/USATODAY/636098871550298459-BocceClub7.JPG?width=1320",
      "credit": "USA Today",
      "creditUrl": "https://www.usatoday.com/"
    },
    "Picasso's Pizza (West Seneca)": {
      "src": "https://www.tastingtable.com/img/gallery/16-of-the-best-spots-for-pizza-in-buffalo/picassos-pizza-1710276562.jpg",
      "credit": "Picasso's Pizza / Tasting Table",
      "creditUrl": "https://www.tastingtable.com/1538675/best-pizza-places-buffalo/"
    },
    "Pizzeria Florian (East Aurora)": {
      "src": "https://visitbuffalo.com/content/uploads/2024/03/Pizzeria-Florian-12-reduced.jpg",
      "credit": "Visit Buffalo Niagara",
      "creditUrl": "https://visitbuffalo.com/"
    }
  },
  "dive-bars-williamsburg": {
    "The Commodore": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_3840,ar_4:3,g_center,f_auto/cms/media/reviews/the-commodore/banners/The-Commodore-NYC_0",
      "credit": "Noah Devereaux / The Infatuation",
      "creditUrl": "https://www.theinfatuation.com/new-york/reviews/the-commodore"
    },
    "Turkey's Nest": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/MyDYHWrSomjFcurm3elGFQ/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/turkeys-nest-tavern-brooklyn"
    },
    "Rocka Rolla": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/RYmOPxbO9uJ-UQoDkauzMw/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/rocka-rolla-williamsburg-2"
    },
    "Duff's Brooklyn": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_1600,ar_4:3,g_center,f_jpg/images/Duff_s_Williamsburg_bar_xqvitx",
      "credit": "The Infatuation",
      "creditUrl": "https://www.theinfatuation.com/new-york/reviews/duffs-brooklyn"
    },
    "Skinny Dennis": {
      "src": "https://pyxis.nymag.com/v1/imgs/0b5/767/44da3ab8d0924da4a2c5c02ef0c2c0034b-skinny-dennis-01.rsocial.w1200.jpg",
      "credit": "New York Magazine",
      "creditUrl": "https://nymag.com/listings/bar/skinny-dennis/"
    }
  },
  "ramen-tokyo": {
    "Karashibi Miso Ramen Kikanbo (Kanda)": {
      "src": "https://kikanbo.co.jp/wp-content/themes/standard_black_cmspro/img/5d34b8480fd829fed95e99694023a0c6-1000x667.jpg",
      "credit": "Kikanbo",
      "creditUrl": "https://kikanbo.co.jp/"
    },
    "Konjiki Hototogisu (Shinjuku)": {
      "src": "https://jw-webmagazine.com/wp-content/uploads/2017/09/ShinjukuRamen-SobaHouseKonjikiHototogisu-1782x1152.jpg",
      "credit": "Japan Web Magazine",
      "creditUrl": "https://jw-webmagazine.com/best-ramen-in-shinjuku/"
    },
    "Ramenya Toy Box (Minowa)": {
      "src": "https://images.squarespace-cdn.com/content/v1/601fb6457b0ff91513ebd151/1642339826743-IST0DDARH5BCP4N2HEWQ/toy-box-ramen-noodles.jpeg",
      "credit": "Nama Japan",
      "creditUrl": "https://www.namajapan.net/restaurants/ramenya-toy-box"
    },
    "Ginza Hachigou (Ginza)": {
      "src": "https://katsumoto-japan.com/wp-content/themes/done/images/ginza-hed.jpg",
      "credit": "Katsumoto Group / Ginza Hachigou",
      "creditUrl": "https://katsumoto-japan.com/"
    }
  },
  "best-four-seasons-hotels-world": {
    "Four Seasons Hotel Astir Palace (Athens, Greece)": {
      "src": "https://secure.s.forbestravelguide.com/img/properties/four-seasons-astir-palace-hotel-athens/four-seasons-astir-palace-hotel-athens-aerial2.jpg",
      "credit": "Four Seasons Astir Palace",
      "creditUrl": "https://www.fourseasons.com/athens/"
    },
    "Four Seasons Safari Lodge Serengeti (Tanzania)": {
      "src": "https://lets-travel-more.com/wp-content/uploads/2016/07/Four-Seasons-Safari-Lodge-Serengeti.jpg",
      "credit": "Four Seasons Safari Lodge Serengeti",
      "creditUrl": "https://www.fourseasons.com/serengeti/"
    },
    "Four Seasons Hotel Bangkok at Chao Phraya River (Thailand)": {
      "src": "https://www.fourseasons.com/alt/img-opt/~70.1920.0,0000-180,0000-1440,0000-1440,0000/publish/content/dam/fourseasons/images/web/BPY/BPY_ugc_teh.chatchai.jpg",
      "credit": "Four Seasons",
      "creditUrl": "https://www.fourseasons.com/bangkok/"
    },
    "Four Seasons Resort Bora Bora (French Polynesia)": {
      "src": "https://www.fourseasons.com/alt/img-opt/~70.1920.1384,0000-0,0000-1616,0000-909,0000/publish/content/dam/fourseasons/images/web/BOR/BOR_1614_original.jpg",
      "credit": "Four Seasons",
      "creditUrl": "https://www.fourseasons.com/borabora/"
    },
    "Four Seasons Hotel Firenze (Florence, Italy)": {
      "src": "https://www.fourseasons.com/alt/img-opt/~65.1920.0,0000-399,5000-3000,0000-1687,5000/publish/content/dam/fourseasons/images/web/FLO/FLO_2725_original.jpg",
      "credit": "Four Seasons",
      "creditUrl": "https://www.fourseasons.com/florence/"
    }
  },
  "historical-nonfiction-books": {
    "Say Nothing (Patrick Radden Keefe)": {
      "src": "https://m.media-amazon.com/images/I/91RXuQ75ucL._SL1500_.jpg",
      "credit": "Doubleday",
      "creditUrl": "https://www.amazon.com/dp/B07CWGBK5K?tag=cgurus-20"
    },
    "Bury My Heart at Wounded Knee (Dee Brown)": {
      "src": "https://m.media-amazon.com/images/I/81s5LYrK+SL._SL1200_.jpg",
      "credit": "Henry Holt and Company",
      "creditUrl": "https://www.amazon.com/dp/B009KY5OGC?tag=cgurus-20"
    },
    "Guns, Germs, and Steel (Jared Diamond)": {
      "src": "https://m.media-amazon.com/images/I/71V0df6wu+L._SL1200_.jpg",
      "credit": "W. W. Norton & Company",
      "creditUrl": "https://www.amazon.com/dp/B06X1CT33R?tag=cgurus-20"
    },
    "The Devil in the White City (Erik Larson)": {
      "src": "https://m.media-amazon.com/images/I/91NrJMBpqcL._SL1500_.jpg",
      "credit": "Vintage Books",
      "creditUrl": "https://www.amazon.com/dp/B000FC0ZIA?tag=cgurus-20"
    }
  },
  "best-beaches-us": {
    "Clearwater Beach (FL)": {
      "src": "https://images.pexels.com/photos/34575566/pexels-photo-34575566.jpeg?auto=compress&cs=tinysrgb&w=1600",
      "credit": "Gabi Corvi / Pexels",
      "creditUrl": "https://www.pexels.com/photo/aerial-view-of-sandy-beach-and-pier-at-sunset-34575566/"
    },
    "Poipu Beach (Kauai, HI)": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Poipu_Beach%2C_Koloa_%28503224%29_%2817190924222%29.jpg/1280px-Poipu_Beach%2C_Koloa_%28503224%29_%2817190924222%29.jpg",
      "credit": "Robert Linsdell (CC BY 2.0)",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:Poipu_Beach,_Koloa_(503224)_(17190924222).jpg"
    },
    "Assateague Island National Seashore (MD/VA)": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/2/21/Horses_on_the_beach_at_Assateague.jpg",
      "credit": "judithsweet (CC BY 2.0)",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:Horses_on_the_beach_at_Assateague.jpg"
    }
  },
  "best-run-mcdonalds-manhattan": {
    "966 3rd Ave (Midtown East)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/LsdAynXQ90h9w7MvvCjvOA/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/mcdonalds-new-york-396"
    },
    "1651 Broadway (Theater District)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/Vw9DXeIb7o_EFSxYY94MHg/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/mcdonalds-new-york-429"
    },
    "14 E 47th St (Midtown East)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/qWCBGyinFDCTVUn2FWSjww/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/mcdonalds-new-york-144"
    }
  },
  "sports-memoirs": {
    "The Mamba Mentality (Kobe Bryant)": {
      "src": "https://m.media-amazon.com/images/I/A1z7ywkr2wL.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B07DC3WRKT?tag=cgurus-20"
    },
    "Open (Andre Agassi)": {
      "src": "https://m.media-amazon.com/images/I/51k2WHTpQYL.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B003062GEE?tag=cgurus-20"
    },
    "Tiger Woods (Jeff Benedict & Armen Keteyian)": {
      "src": "https://m.media-amazon.com/images/I/41kEE3Xba0L.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B078M5J66Z?tag=cgurus-20"
    },
    "Michael Jordan: The Life (Roland Lazenby)": {
      "src": "https://m.media-amazon.com/images/I/81cisjFJk-L.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B00AFGKXOW?tag=cgurus-20"
    }
  },
  "tacos-atlanta": {
    "El Rey del Taco (Doraville)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_2400,ar_4:3,g_center,f_auto/images/El_Rey_SNP-13_z8hqo0",
      "credit": "The Infatuation / Sarah Newman",
      "creditUrl": "https://www.theinfatuation.com/atlanta/reviews/el-rey-del-taco"
    },
    "El Tesoro (Edgewood)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_2400,ar_4:3,g_center,f_auto/cms/reviews/el-tesoro/TESORO_19-8",
      "credit": "The Infatuation",
      "creditUrl": "https://www.theinfatuation.com/atlanta/reviews/el-tesoro"
    },
    "Little Rey (Piedmont Heights)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_2400,ar_4:3,g_center,f_auto/images/littlerey_052019_final_0046_xksofc",
      "credit": "The Infatuation / Andrew Thomas Lee",
      "creditUrl": "https://www.theinfatuation.com/atlanta/reviews/little-rey"
    },
    "Da Cocinita (Kirkwood)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_1600,ar_4:3,g_center,f_jpg/images/DaCocinita_Atlanta_SarahNewman-3_ofsyou",
      "credit": "The Infatuation · Sarah Newman",
      "creditUrl": "https://www.theinfatuation.com/atlanta/reviews/da-cocinita-magic-taco"
    }
  },
  "burgers-chicago": {
    "The Leavitt Street Inn & Tavern (Bucktown)": {
      "src": "https://media.timeout.com/images/106033645/1024/576/image.webp",
      "credit": "Time Out Chicago / Courtesy Leavitt Street Inn",
      "creditUrl": "https://www.timeout.com/chicago/restaurants/best-burgers-in-chicago"
    },
    "Charly's Burgers (Hermosa)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_1280,ar_16:9,g_center,f_auto/images/Charlys_Chicago_Burger",
      "credit": "The Infatuation",
      "creditUrl": "https://www.theinfatuation.com/chicago/guides/best-burger-chicago"
    },
    "Au Cheval (West Loop)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_scale,w_2000,f_auto/cms/features/so-you-got-dumped/Au_2520Cheval_2520Menu_2520Burger_Christina",
      "credit": "The Infatuation / Christina Slaton",
      "creditUrl": "https://www.theinfatuation.com/chicago/reviews/au-cheval"
    },
    "Red Hot Ranch (Logan Square)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_scale,w_2000,f_auto/cms/beta/KimKovacik_Chi_RedHotRanch_DoubleCheeseburger_01",
      "credit": "The Infatuation / Kim Kovacik",
      "creditUrl": "https://www.theinfatuation.com/chicago/reviews/red-hot-ranch"
    },
    "Best Intentions (Logan Square)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_scale,w_2000,f_auto/images/Best_Intentions_Burger_John_Ringor_Chicago_lcnvo8",
      "credit": "The Infatuation / John Ringor",
      "creditUrl": "https://www.theinfatuation.com/chicago/reviews/best-intentions"
    }
  },
  "brunch-boston": {
    "Bar Vlaha (Brookline)": {
      "src": "https://media.cntraveler.com/photos/661828c7bd96d45c6b2b80b1/16:9/w_2560,c_limit/Bar%20Vlaha%20%C2%A9%20Credit%20Adam%20Detour_23015-01-7278.jpg",
      "credit": "Condé Nast Traveler",
      "creditUrl": "https://www.cntraveler.com/restaurant/bar-vlaha-brookline"
    },
    "Moonshine 152 (South Boston)": {
      "src": "https://www.thefoodlens.com/uploads/2016/11/MOONSHINE-152_BURGER_THE-FOOD-LENS_BRIAN-SAMUELS-PHOTOGRAPHY_SEPTEMBER-2021-IMG_9623-copy-1440x960.jpg",
      "credit": "Brian Samuels Photography / The Food Lens",
      "creditUrl": "https://www.thefoodlens.com/boston/guides/south-boston/"
    },
    "Krasi (Back Bay)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_1400,ar_4:3,g_center,f_auto/images/Krasi_PR_HeatherSaide_Boston01_pjzjtr",
      "credit": "Heather Saide / The Infatuation",
      "creditUrl": "https://www.theinfatuation.com/boston/reviews/krasi"
    },
    "Via Cannuccia (Dorchester)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_1400,ar_4:3,g_center,f_auto/images/Campos_Group_Via_Cannuccia_Boston_4_vp6i8l",
      "credit": "Linda Campos / The Infatuation",
      "creditUrl": "https://www.theinfatuation.com/boston/reviews/via-cannucia"
    },
    "Brassica Kitchen + Cafe (Jamaica Plain)": {
      "src": "https://bomag.o0bc.com/wp-content/uploads/sites/2/2022/03/Brassica.jpg",
      "credit": "Boston Magazine",
      "creditUrl": "https://www.bostonmagazine.com/restaurants/best-chicken-and-waffles-boston/"
    }
  },
  "best-hamptons-towns": {
    "Southampton Village (Southampton Town)": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/7/73/Cooper%27s_Beach_Southampton.jpg",
      "credit": "Wikimedia Commons · Peetlesnumber1",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:Cooper%27s_Beach_Southampton.jpg"
    },
    "Sagaponack (Southampton Town)": {
      "src": "https://yourbrooklynguide.com/wp-content/uploads/2023/03/Sagg-Main-Beach-in-Sagaponack-in-the-hamptons-new-york.jpg",
      "credit": "Your Brooklyn Guide",
      "creditUrl": "https://yourbrooklynguide.com"
    },
    "Water Mill (Southampton Town)": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Windmill_at_Watermill%2C_Southampton_NY_20180914_080131.jpg/1280px-Windmill_at_Watermill%2C_Southampton_NY_20180914_080131.jpg",
      "credit": "Wikimedia Commons",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:Windmill_at_Watermill,_Southampton_NY_20180914_080131.jpg"
    },
    "East Hampton Village (East Hampton Town)": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/East_Hampton%2C_New_York.jpg/1280px-East_Hampton%2C_New_York.jpg",
      "credit": "Wikimedia Commons",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:East_Hampton,_New_York.jpg"
    }
  },
  "best-non-toxic-air-fryers": {
    "Ninja Crispi Pro": {
      "src": "https://m.media-amazon.com/images/I/812gTep2Q3L.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B0FPPJBKLS?tag=cgurus-20"
    },
    "Typhur Dome 2": {
      "src": "https://m.media-amazon.com/images/I/6154mct-b7L.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B0CKP6Y6KB?tag=cgurus-20"
    },
    "Our Place Wonder Oven": {
      "src": "https://m.media-amazon.com/images/I/71KuPxRENbL.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B0CLTKGWQX?tag=cgurus-20"
    }
  },
  "best-finance-novels": {
    "The Bonfire of the Vanities (Tom Wolfe)": {
      "src": "https://m.media-amazon.com/images/I/81lMvhvrB3L.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B003GYEGNO?tag=cgurus-20"
    },
    "American Psycho (Bret Easton Ellis)": {
      "src": "https://m.media-amazon.com/images/I/71YOrUgYVSL.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B003O86QBW?tag=cgurus-20"
    },
    "Reminiscences of a Stock Operator (Edwin Lefevre)": {
      "src": "https://m.media-amazon.com/images/I/51UHzfeYnTL.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B09YRCNQHB?tag=cgurus-20"
    }
  },
  "dive-bars-boston": {
    "Delux Café (South End)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/mMPHv2KvdtkaFgV7q5rrmA/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/delux-caf%C3%A9-boston-2"
    },
    "Silhouette Lounge (Allston)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/5I4ODOu0No1Bd9zL5JyoiA/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/silhouette-lounge-allston"
    },
    "Biddy Early's (Downtown)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/3e9MZL1uzYH0N3zFRJh7pg/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/biddy-earlys-boston"
    }
  },
  "best-breakfast-sandwiches-boston": {
    "Café Beatrice (East Cambridge, Cambridge)": {
      "src": "https://www.thefoodlens.com/uploads/2017/02/THE-LEXINGTON_CAFE-BEATRICE_BRIAN-SAMUELS-PHOTOGRAPHY_OCTOBER-2020-0265-copy-1440x960.jpg",
      "credit": "Brian Samuels Photography / The Food Lens",
      "creditUrl": "https://www.thefoodlens.com/boston/guides/breakfast-sandwiches/"
    },
    "Mike & Patty's (Bay Village, Boston)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/PCFT0c4yZr6gckashr083g/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/mike-and-pattys-bay-village-boston"
    },
    "Sofra Bakery & Cafe (Cambridge)": {
      "src": "https://www.thefoodlens.com/uploads/2016/10/SOFRA_THE-FOOD-LENS_BRIAN-SAMUELS-PHOTOGRAPHY_NOVEMBER-2019-0208-copy-1440x960.jpg",
      "credit": "The Food Lens / Brian Samuels",
      "creditUrl": "https://www.thefoodlens.com"
    },
    "Vinal Bakery (Somerville)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/pX9xom2QxaVygDEvl5zY_g/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/vinal-bakery-somerville"
    }
  },
  "best-red-light-therapy-mask": {
    "Omnilux Contour Face": {
      "src": "https://omniluxled.com/cdn/shop/files/Contour_Face_Cover_Image.jpg",
      "credit": "Omnilux",
      "creditUrl": "https://omniluxled.com/products/omnilux-contour-face"
    },
    "Dr. Dennis Gross DRx SpectraLite FaceWare Pro": {
      "src": "https://www.drdennisgross.com/dw/image/v2/BBSK_PRD/on/demandware.static/-/Sites-itemmaster_ddg/default/dw4e54ef8d/2025/October/FaceWarePro/01_DRx_FWP_OnWhite.jpg",
      "credit": "Dr. Dennis Gross",
      "creditUrl": "https://www.drdennisgross.com/drx-spectralite-faceware-pro-3-minute-led-device/695866568117.html"
    },
    "CurrentBody Skin LED Face Mask Series 2": {
      "src": "https://us.currentbody.com/cdn/shop/files/1_3c4dd6ee-ff67-4a7b-90a7-dceac5d1fb44.png",
      "credit": "CurrentBody",
      "creditUrl": "https://us.currentbody.com/products/currentbody-skin-led-light-therapy-face-mask-series-2"
    }
  },
  "best-dive-bars-san-diego": {
    "Aero Club Bar (Middletown)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/nLEnym6Cr8mKjMhmFQe45g/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/aero-club-bar-san-diego-2"
    },
    "Waterfront Bar & Grill (Little Italy)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/vOZCBUoL6w14ar-cS3hnKg/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/the-waterfront-bar-and-grill-san-diego"
    },
    "High Dive (Bay Park)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/jv5NYDkL8tDh8_k5teD6ZQ/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/high-dive-bar-and-grill-san-diego"
    }
  },
  "top-grossing-films-1990": {
    "Ghost": {
      "src": "https://image.tmdb.org/t/p/original/6nLdSON3ErniBZTXWG7WRqs5jGz.jpg",
      "credit": "TMDB",
      "creditUrl": "https://www.themoviedb.org/movie/251-ghost"
    },
    "Home Alone": {
      "src": "https://image.tmdb.org/t/p/original/ih2xVgeMS8R5WUetYE8Mr9hVTlB.jpg",
      "credit": "TMDB",
      "creditUrl": "https://www.themoviedb.org/movie/771-home-alone"
    },
    "Pretty Woman": {
      "src": "https://image.tmdb.org/t/p/original/lP7FWXPiruhp3ohKwqxr0QUPcyX.jpg",
      "credit": "TMDB",
      "creditUrl": "https://www.themoviedb.org/movie/114-pretty-woman"
    }
  },
  "tacos-boston": {
    "Taqueria Jalisco (East Boston)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/ISl0O-OrL9d1d4io5JJWMA/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/taqueria-jalisco-boston-2"
    },
    "Taqueria El Amigo (Waltham)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/XMIef47DQ0t-5bsR480pug/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/taqueria-el-amigo-waltham-2"
    },
    "Chilacates (Jamaica Plain)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/esm74n5aMLNZDeoCK6tSrQ/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/chilacates-mexican-street-food-jamaica-plain"
    },
    "Tenoch Mexican (North End)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/b6fM48AtEi1K3w2FuohJrQ/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/tenoch-mexican-boston"
    },
    "El Pelon Taqueria (Brighton)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/wQSD8G5k3l6Gwy8yYaNcFg/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/el-pelon-taqueria-brighton"
    }
  },
  "brunch-hamptons": {
    "Flora (Westhampton Beach)": {
      "src": "https://eatdrinkloveflora.com/wp-content/uploads/2015/05/694117487_18095532242176729_3538755835450762172_n.jpg",
      "credit": "flora",
      "creditUrl": "https://eatdrinkloveflora.com/"
    },
    "The American Hotel (Sag Harbor)": {
      "src": "https://www.danspapers.com/wp-content/uploads/2018/07/TheAmericanHotel-BL.jpg",
      "credit": "Dan's Papers",
      "creditUrl": "https://www.danspapers.com/2022/07/the-american-hotel-50-years-sag-harbor/"
    },
    "Jean-Georges at Topping Rose House (Bridgehampton)": {
      "src": "https://res.cloudinary.com/traveltripperweb/image/upload/c_limit,f_auto,h_1920,q_auto,w_1920/v1614929530/dm7zahedxbdqfy1syzvi.jpg",
      "credit": "Topping Rose House",
      "creditUrl": "https://www.toppingrosehouse.com/"
    }
  },
  "public-beaches-hamptons": {
    "Sagg Main Beach (Sagaponack)": {
      "src": "https://yourbrooklynguide.com/wp-content/uploads/2023/03/Sagg-Main-Beach-in-Sagaponack-in-the-hamptons-new-york.jpg",
      "credit": "Your Brooklyn Guide",
      "creditUrl": "https://yourbrooklynguide.com"
    },
    "Cooper's Beach (Southampton)": {
      "src": "https://www.travelandleisure.com/thmb/BmOsg9XEltOkHgWkOJ5C9Kdwaxk=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/TAL-coopers-beach-southampton-BESTNYBEACH0824-c2102202da504d779a85dab9edd5d13b.jpg",
      "credit": "Travel + Leisure",
      "creditUrl": "https://www.travelandleisure.com/coopers-beach-long-island-named-best-beach-new-york-state-8696589"
    },
    "Main Beach (East Hampton)": {
      "src": "https://storage.googleapis.com/proudcity/easthamptonvillageny/uploads/2020/11/GettyImages-922784216.jpg",
      "credit": "East Hampton Village / Getty Images",
      "creditUrl": "https://easthamptonvillage.gov/departments/village-beaches/"
    },
    "Atlantic Avenue Beach (Amagansett)": {
      "src": "https://images.trvl-media.com/place/553248635983992179/82c85ff0-742e-40fe-9855-349ce2525565.jpg",
      "credit": "Expedia",
      "creditUrl": "https://www.expedia.com/Amagansett.dx553248635983992179"
    }
  },
  "ski-resort-bars-world": {
    "La Folie Douce (Val d'Isère, France)": {
      "src": "https://www.skiweekends.com/assets/uploads/image_library/show/1747219833_folie-douce-val-d-isere-1.jpg",
      "credit": "La Folie Douce via Ski Weekends",
      "creditUrl": "https://www.skiweekends.com"
    },
    "Cloud Nine Alpine Bistro (Aspen Highlands, USA)": {
      "src": "https://www.aspensnowmass.com/-/media/aspen-snowmass/images/hero/hero-image/winter/2024-25/24-25-cloud-nine-hero.jpg",
      "credit": "Aspen Snowmass",
      "creditUrl": "https://www.aspensnowmass.com"
    },
    "Hennu Stall (Zermatt, Switzerland)": {
      "src": "https://www.hennustall.ch/files/thumbs/hennu-stall-apres-ski-1-_1_1600x900.jpg",
      "credit": "Hennu Stall",
      "creditUrl": "https://www.hennustall.ch"
    }
  },
  "burgers-miami": {
    "ViceVersa (Downtown)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_2400,ar_4:3,g_center,f_auto/images/ViceVersa_Burger_1_Photo_Credit_ViceVersa_vwvpbx",
      "credit": "ViceVersa via The Infatuation",
      "creditUrl": "https://www.theinfatuation.com/miami/guides/best-burgers-miami"
    },
    "United States Burger Service (Little River)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/UQGelC6y358QEYzEaHIRGg/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/united-states-burger-service-miami-3"
    },
    "Over Under (Downtown)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/h4q0kNYmL5pZ2Q-zX_9zMw/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/over-under-miami"
    },
    "Chug's Diner (Coconut Grove)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/zt5YaenRK4L3RWiWTAv8FQ/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/chugs-diner-miami"
    },
    "Cuento Sandwiches (Doral)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_1280,ar_16:9,g_center,f_auto/images/CuentoSandwiches_JerkSmashBurger_Miami_Cleveland-2_ejgnzb",
      "credit": "The Infatuation",
      "creditUrl": "https://www.theinfatuation.com/miami/guides/best-burgers-miami"
    },
    "La Birra Bar (North Miami Beach)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/ArlnudUZCkmJ7Q7dFZ7p4g/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/la-birra-bar-north-miami-beach"
    },
    "Are You Hungry Grill (West Kendall)": {
      "src": "https://burgerbeast.com/wp-content/uploads/2024/12/Are-You-Hungry-Grill-Wagyu-Beer-Cheese-Burger.jpg",
      "credit": "Burger Beast",
      "creditUrl": "https://burgerbeast.com/best-burgers-miami/"
    }
  },
  "resorts-turkey": {
    "Susona Bodrum, LXR Hotels & Resorts (Torba, Bodrum)": {
      "src": "https://secure.s.forbestravelguide.com/img/properties/susona-bodrum-lxr-hotels-resorts/extra-large/susona-bodrum-pool-view.jpg",
      "credit": "Susona Bodrum",
      "creditUrl": "https://www.hilton.com/en/hotels/bjvszol-susona-bodrum/"
    },
    "Amanruya (Demir, Bodrum)": {
      "src": "https://www.travelplusstyle.com/wp-content/gallery/amanruya_mg/amanruya-turkey-main-swimming-pool_27493.jpg",
      "credit": "Aman via Travel+Style",
      "creditUrl": "https://www.travelplusstyle.com/hotels/amanruya"
    },
    "Kempinski Hotel Barbaros Bay Bodrum (Yaliciftlik, Bodrum)": {
      "src": "https://storage.kempinski.com/cdn-cgi/image/w=1920,f=auto,fit=scale-down/ki-cms-prod/images/2/7/2/4/764272-1-eng-GB/685581c4d1ba-74532214_4K.jpg",
      "credit": "Kempinski",
      "creditUrl": "https://www.kempinski.com/en/hotel-barbaros-bay"
    },
    "Mandarin Oriental Bodrum (Golturkbuku, Bodrum)": {
      "src": "https://photos.mandarinoriental.com/is/image/MandarinOriental/bodrum-hotel-exterior?wid=2000",
      "credit": "Mandarin Oriental",
      "creditUrl": "https://www.mandarinoriental.com/en/bodrum/paradise-bay"
    }
  },
  "best-netflix-shows": {
    "Mindhunter": {
      "src": "https://image.tmdb.org/t/p/original/lpDVJuIro21gtMj9iXMFKHuroZN.jpg",
      "credit": "TMDB",
      "creditUrl": "https://www.themoviedb.org/tv/67744-mindhunter"
    },
    "BoJack Horseman": {
      "src": "https://image.tmdb.org/t/p/original/qFYDJUIFh8zgEDy3EvnHwhgOl0S.jpg",
      "credit": "TMDB",
      "creditUrl": "https://www.themoviedb.org/tv/61222-bojack-horseman"
    },
    "Dark": {
      "src": "https://image.tmdb.org/t/p/original/3jDXL4Xvj3AzDOF6UH1xeyHW8MH.jpg",
      "credit": "TMDB",
      "creditUrl": "https://www.themoviedb.org/tv/70523-dark"
    },
    "Arcane": {
      "src": "https://image.tmdb.org/t/p/original/q8eejQcg1bAqImEV8jh8RtBD4uH.jpg",
      "credit": "TMDB",
      "creditUrl": "https://www.themoviedb.org/tv/94605-arcane"
    }
  },
  "best-hbo-shows": {
    "The Sopranos": {
      "src": "https://image.tmdb.org/t/p/original/lNpkvX2s8LGB0mjGODMT4o6Up7j.jpg",
      "credit": "TMDB",
      "creditUrl": "https://www.themoviedb.org/tv/1398-the-sopranos"
    },
    "The Wire": {
      "src": "https://image.tmdb.org/t/p/original/layPSOJGckJv3PXZDIVluMq69mn.jpg",
      "credit": "TMDB",
      "creditUrl": "https://www.themoviedb.org/tv/1438-the-wire"
    },
    "Band of Brothers": {
      "src": "https://image.tmdb.org/t/p/original/2yDV0xLyqW88dn5qE7YCRnoYmfy.jpg",
      "credit": "TMDB",
      "creditUrl": "https://www.themoviedb.org/tv/4613-band-of-brothers"
    },
    "Succession": {
      "src": "https://image.tmdb.org/t/p/original/bcdUYUFk8GdpZJPiSAas9UeocLH.jpg",
      "credit": "TMDB",
      "creditUrl": "https://www.themoviedb.org/tv/76331-succession"
    }
  },
  "best-airlines-north-america": {
    "Delta Air Lines": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/5/5a/Delta_Air_Lines_-_Airbus_A350-941_-_N502DN.jpg",
      "credit": "formulanone (CC BY-SA 2.0, Wikimedia Commons)",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:Delta_Air_Lines_-_Airbus_A350-941_-_N502DN.jpg"
    },
    "United Airlines": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/c/c7/Frankfurt_Airport_United_Airlines_Boeing_787-10_Dreamliner_N14016_%28DSC09867%29.jpg",
      "credit": "MarcelX42 (CC BY-SA 4.0, Wikimedia Commons)",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:Frankfurt_Airport_United_Airlines_Boeing_787-10_Dreamliner_N14016_(DSC09867).jpg"
    },
    "Alaska Airlines": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/8/89/N440AS_Alaska_Airlines_2013_Boeing_737-900_-_cn_41705_-_ln_4675_%2816668623582%29.jpg",
      "credit": "Tomas Del Coro (CC BY-SA 2.0, Wikimedia Commons)",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:N440AS_Alaska_Airlines_2013_Boeing_737-900_-_cn_41705_-_ln_4675_(16668623582).jpg"
    }
  },
  "best-airlines-europe": {
    "Iberia": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/a/af/Iberia_Airbus_A350-941XWB_EC-NDR_departing_JFK_Airport.jpg",
      "credit": "Adam Moreira (CC BY-SA 4.0, Wikimedia Commons)",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:Iberia_Airbus_A350-941XWB_EC-NDR_departing_JFK_Airport.jpg"
    },
    "SAS Scandinavian Airlines": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/e/e7/SAS_A350-900_SE-RSC_on_final_approach_at_Boston_Oct_2024_1.jpg",
      "credit": "4300streetcar (CC BY 4.0, Wikimedia Commons)",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:SAS_A350-900_SE-RSC_on_final_approach_at_Boston_Oct_2024_1.jpg"
    },
    "Lufthansa": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/8/82/Lufthansa_Boeing_747-8_D-ABYI_IAD_VA1.jpg",
      "credit": "Acroterion (CC BY-SA 4.0, Wikimedia Commons)",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:Lufthansa_Boeing_747-8_D-ABYI_IAD_VA1.jpg"
    }
  },
  "best-airlines-world": {
    "Qatar Airways": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/9/91/Qatar_Airways_%28A7-ALH%29_Airbus_A350-941_MSN-012.jpg",
      "credit": "Md Shaifuzzaman Ayon (CC BY-SA 4.0, Wikimedia Commons)",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:Qatar_Airways_(A7-ALH)_Airbus_A350-941_MSN-012.jpg"
    },
    "Cathay Pacific": {
      "src": "https://www.checkerboardhill.com/wp-content/uploads/2025/05/02-Cathay-soars-again-at-Kai-Tak.jpg",
      "credit": "Sneeze Lam / Checkerboard Hill",
      "creditUrl": "https://www.checkerboardhill.com/2025/04/cathay-pacific-flyby-kai-tak-flight-cx8100/"
    },
    "Singapore Airlines": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/2/22/Singapore_a380-800_9v-skd_takeoff_heathrow_2010_arp.jpg",
      "credit": "Adrian Pingstone (public domain, Wikimedia Commons)",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:Singapore_a380-800_9v-skd_takeoff_heathrow_2010_arp.jpg"
    }
  },
  "best-breweries-austin": {
    "Jester King Brewery (Dripping Springs)": {
      "src": "https://www.themanual.com/wp-content/uploads/sites/9/2019/07/jester-king-brewing.jpg",
      "credit": "The Manual",
      "creditUrl": "https://www.themanual.com/food-and-drink/austin-breweries-tour/"
    },
    "Pinthouse Brewing (North Loop)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/GOtlxkvDj3h0-nPOinJDAA/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/pinthouse-pizza-austin"
    },
    "Meanwhile Brewing (South Austin)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/eI4KVd1-z8o3Lib-lI_n7g/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/meanwhile-brewing-austin-3"
    },
    "Oddwood Brewing (East Austin)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/DNzh29Z--bo8olh_Q2nr2Q/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/oddwood-brewing-austin"
    },
    "Hold Out Brewing (West Austin)": {
      "src": "https://cdn.spotapps.co/spothopper/image/fetch/f_auto,q_auto:best,c_fit,h_1200/http://static.spotapps.co/spots/d5/bc2537d9f44be5ac880ed4dddd8777/:original",
      "credit": "Hold Out Brewing",
      "creditUrl": "https://holdoutbrewing.com"
    }
  },
  "best-pizza-london": {
    "Short Road Pizza (Leyton)": {
      "src": "https://images.squarespace-cdn.com/content/v1/5fc6367c17e72026400e2302/3655ff32-bade-4db6-bee2-6650e9e8896d/Short+Road+Pizza+260121-46-Caitlin+Isola.jpg",
      "credit": "Short Road Pizza / Caitlin Isola",
      "creditUrl": "https://shortroadpizza.com"
    },
    "Dough Hands (Hackney)": {
      "src": "https://static.wixstatic.com/media/e0ed6c_279e5fbbaac44837a3f3449db3b48343~mv2.jpg",
      "credit": "Dough Hands",
      "creditUrl": "https://doughhands.com"
    },
    "Vincenzo's (Shoreditch)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_scale,w_2400,f_auto/Vincenzo_s_Pizza_Vincenzo_s_Margherita_AleksandraBoruch_London-4_kqhj5n",
      "credit": "The Infatuation / Aleksandra Boruch",
      "creditUrl": "https://www.theinfatuation.com/london"
    },
    "Ace Pizza (Victoria Park)": {
      "src": "https://media.timeout.com/images/106289389/image.jpg",
      "credit": "Time Out London",
      "creditUrl": "https://www.timeout.com/london/restaurants/ace-pizza"
    }
  },
  "best-hotels-tulum": {
    "La Valise Tulum (Tulum Beach)": {
      "src": "https://d1x2jsuj9gaph.cloudfront.net/imageRepo/7/0/145/749/73/La_Valise_Aerial_Shot_P.jpg",
      "credit": "La Valise Tulum",
      "creditUrl": "https://www.lavalise.com"
    },
    "La Zebra (South Beach)": {
      "src": "https://www.planet-mexiko.com/wp-content/uploads/beachfront-hotel-la-zebra-tulum-mexico.jpg",
      "credit": "La Zebra Tulum",
      "creditUrl": "https://lazebratulum.com"
    },
    "Ahau Tulum (Tulum Beach)": {
      "src": "https://ahaucollection.com/wp-content/uploads/2021/11/ahau-tulum-hotel-mexico-8-1.jpg",
      "credit": "Ahau Tulum",
      "creditUrl": "https://ahaucollection.com"
    },
    "Azulik (Tulum Beach)": {
      "src": "https://www.uniqhotels.com/media/hotels/83/22._tseen_ja_1.jpg",
      "credit": "Azulik via UniqHotels",
      "creditUrl": "https://www.uniqhotels.com/azulik-tulum"
    },
    "Jashita Hotel Tulum (Soliman Bay)": {
      "src": "https://images.squarespace-cdn.com/content/v1/6144d72377cea164063f1cd8/357e0a37-ba73-48c8-b364-7a2108c698ad/JASHITA+TULUM+HOTEL+-+Hero+Image.jpg",
      "credit": "Jashita Hotel",
      "creditUrl": "https://jashitahotel.com"
    }
  },
  "dive-bars-east-village": {
    "McSorley's Old Ale House": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/elLnfMKed1ihYhs5tWwlvQ/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/mcsorleys-old-ale-house-new-york"
    },
    "Holiday Cocktail Lounge": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/OnA3P3xAJ2G693Mqyyanrg/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/holiday-cocktail-lounge-new-york-2"
    },
    "Lucy's": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/haUzniHYtGL0R8AMaR-GDQ/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/lucys-new-york"
    }
  },
  "college-fight-songs": {
    "The Victors (Michigan)": {
      "src": "https://images.squarespace-cdn.com/content/v1/62017996186a904e6f2e6d32/cb5ce0f7-1dcc-4fab-b9ef-1f00e0e3d437/Pregame+M+copy.jpg",
      "credit": "Jeff Stokes / Michigan Marching Band",
      "creditUrl": "https://www.mmb.umich.edu/"
    },
    "Notre Dame Victory March": {
      "src": "https://i.guim.co.uk/img/media/6b9182ee5c30bbb23dc053d50febf9876d7dd007/0_130_3888_2333/master/3888.jpg?width=1200&height=900&quality=85&auto=format&fit=crop&s=83de77410955c63ca70d87e13ebeccf2",
      "credit": "The Guardian",
      "creditUrl": "https://www.theguardian.com/sport/college-football"
    },
    "Boomer Sooner (Oklahoma)": {
      "src": "https://www.oklahoman.com/gcdn/authoring/2009/01/03/NOKL/ghnewsok-OK-3335064-a0280b6f.jpeg?width=1200&disable=upscale&format=pjpg&auto=webp",
      "credit": "Bryan Terry / The Oklahoman",
      "creditUrl": "https://www.oklahoman.com/"
    },
    "Fight On (USC)": {
      "src": "https://usctrojans.com/images/2022/1/7/usc_trojan_marching_band_peristyle_1_.jpg",
      "credit": "USC Athletics",
      "creditUrl": "https://usctrojans.com/sports/2018/7/30/usc-history-traditions-spirit-of-troy-trojan-marching-band-fight-songs"
    }
  },
  "best-business-leader-biographies": {
    "Shoe Dog (Phil Knight)": {
      "src": "https://m.media-amazon.com/images/I/41k+WVPLwZL.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B0176M1A44?tag=cgurus-20"
    },
    "Steve Jobs (Walter Isaacson)": {
      "src": "https://m.media-amazon.com/images/I/4119AW7yvlL.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B004W2UBYW?tag=cgurus-20"
    },
    "Elon Musk (Ashlee Vance)": {
      "src": "https://m.media-amazon.com/images/I/510K2KR+o6L.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B00KVI76ZS?tag=cgurus-20"
    }
  },
  "best-business-leader-biopics": {
    "The Social Network": {
      "src": "https://image.tmdb.org/t/p/original/1GlZNA9L5trst3ItgRiyQTUH1uf.jpg",
      "credit": "TMDB",
      "creditUrl": "https://www.themoviedb.org/movie/37799-the-social-network"
    },
    "The Founder": {
      "src": "https://image.tmdb.org/t/p/original/5WparwIlAtSZW0tcWbK2NHEZJC6.jpg",
      "credit": "TMDB",
      "creditUrl": "https://www.themoviedb.org/movie/310307-the-founder"
    },
    "Pirates of Silicon Valley": {
      "src": "https://image.tmdb.org/t/p/original/vKgsqmYHdNjtyhQIUjXW88IPeI.jpg",
      "credit": "TMDB",
      "creditUrl": "https://www.themoviedb.org/movie/3293-pirates-of-silicon-valley"
    }
  },
  "burgers-la": {
    "Melanie Wine Bar (Beverly Grove)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/Xbk5KLth0pwERoXSBhn9DA/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/melanie-los-angeles-3"
    },
    "Doto (Silver Lake)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_1280,ar_16:9,g_center,f_auto/images/LA_Doto_ComteCheeseburger_JessieClapp-3_htrhg8",
      "credit": "Jessie Clapp, The Infatuation",
      "creditUrl": "https://www.theinfatuation.com/los-angeles/guides/best-burger-la"
    },
    "Petit Trois (Hollywood)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_2400,ar_4:3,g_center,f_auto/Petit%20Trois_Big%20Mec_LA",
      "credit": "Petit Trois via The Infatuation",
      "creditUrl": "https://www.theinfatuation.com/los-angeles/reviews/petit-trois"
    },
    "Camphor (Arts District)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_2400,ar_4:3,g_center,f_auto/images/LA_Camphor_LeBurger_CaraHarman_01-2_gimtuo",
      "credit": "Cara Harman, The Infatuation",
      "creditUrl": "https://www.theinfatuation.com/los-angeles/reviews/camphor"
    },
    "Bar 109 (Melrose Hill)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_2400,ar_4:3,g_center,f_auto/Bar_109_burger_x1pq8s",
      "credit": "The Infatuation",
      "creditUrl": "https://www.theinfatuation.com/los-angeles/guides/best-burger-la"
    }
  },
  "best-wings-chicago": {
    "Crisp (Lakeview)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/-cvYAt8Vlf2y_JvDyzwPqw/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/crisp-chicago"
    },
    "The Fifty/50 (Wicker Park)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/me5HnXT9rHcCRhDmITKqIg/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/the-fifty-50-chicago"
    },
    "Cleo's Southern Cuisine (Bronzeville)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_2400,ar_4:3,g_center,f_auto/cms/guides/best-chicken-wings-chicago/KimKovacik_Chi_Cleos_WingDinner_03",
      "credit": "Kim Kovacik, The Infatuation",
      "creditUrl": "https://www.theinfatuation.com/chicago/reviews/cleos-southern-cuisine"
    }
  },
  "resorts-abu-dhabi": {
    "Park Hyatt Abu Dhabi (Saadiyat Island)": {
      "src": "https://assets.hyatt.com/content/dam/hyatt/hyattdam/images/2025/06/16/0901/ABUPH-P0933-Exterior-With-Pool.jpg/ABUPH-P0933-Exterior-With-Pool.16x9.jpg?imwidth=1920",
      "credit": "Park Hyatt",
      "creditUrl": "https://www.hyatt.com/park-hyatt/en-US/abuph-park-hyatt-abu-dhabi-hotel-and-villas"
    },
    "The St. Regis Saadiyat Island Resort (Saadiyat Island)": {
      "src": "https://cache.marriott.com/content/dam/marriott-renditions/AUHXR/auhxr-exterior-0494-hor-wide.jpg?downsize=1920px:*",
      "credit": "Marriott",
      "creditUrl": "https://www.marriott.com/en-us/hotels/auhxr-the-st-regis-saadiyat-island-resort-abu-dhabi/overview/"
    },
    "The Ritz-Carlton Abu Dhabi, Grand Canal (Grand Canal)": {
      "src": "https://cache.marriott.com/is/image/marriotts7prod/rz-auhrz-balcony-view-39776:Wide-Hor?wid=1920&hei=1080&fit=crop,1",
      "credit": "The Ritz-Carlton",
      "creditUrl": "https://www.ritzcarlton.com/en/hotels/auhrz-the-ritz-carlton-abu-dhabi-grand-canal/overview/"
    }
  },
  "best-documentaries": {
    "Hoop Dreams (1994)": {
      "src": "https://image.tmdb.org/t/p/original/pYeiEm55NySzK9ksKlQGlFQNapz.jpg",
      "credit": "TMDB",
      "creditUrl": "https://www.themoviedb.org/movie/14275-hoop-dreams"
    },
    "Free Solo (2018)": {
      "src": "https://image.tmdb.org/t/p/original/z2uuQasY4gQJ8VDAFki746JWeQJ.jpg",
      "credit": "TMDB",
      "creditUrl": "https://www.themoviedb.org/movie/515042-free-solo"
    },
    "13th (2016)": {
      "src": "https://image.tmdb.org/t/p/original/hwn9CN2x5Qhm3laLRvZlXttL6LU.jpg",
      "credit": "TMDB",
      "creditUrl": "https://www.themoviedb.org/movie/407806-13th"
    },
    "The Thin Blue Line (1988)": {
      "src": "https://image.tmdb.org/t/p/original/9ndhlUu1VQ44pX5dVFo5Y19KqAl.jpg",
      "credit": "TMDB",
      "creditUrl": "https://www.themoviedb.org/movie/14285-the-thin-blue-line"
    }
  },
  "best-tom-cruise-movies": {
    "Top Gun: Maverick": {
      "src": "https://image.tmdb.org/t/p/original/AaV1YIdWKnjAIAOe8UUKBFm327v.jpg",
      "credit": "TMDB",
      "creditUrl": "https://www.themoviedb.org/movie/361743-top-gun-maverick"
    },
    "Magnolia": {
      "src": "https://image.tmdb.org/t/p/original/mFfyE5DPFDqoes4HIcElHc2a15y.jpg",
      "credit": "TMDB",
      "creditUrl": "https://www.themoviedb.org/movie/334-magnolia"
    },
    "Eyes Wide Shut": {
      "src": "https://image.tmdb.org/t/p/original/aC6wW62V6b0csr5iUnbOjYAqfhg.jpg",
      "credit": "TMDB",
      "creditUrl": "https://www.themoviedb.org/movie/345-eyes-wide-shut"
    }
  },
  "best-restaurants-seaport-boston": {
    "Chickadee": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_2400,ar_4:3,g_center,f_auto/images/NatalieSchaefer_Chickadee_-8_vsp1xl",
      "credit": "Natalie Schaefer, The Infatuation",
      "creditUrl": "https://www.theinfatuation.com/boston/reviews/chickadee"
    },
    "Woods Hill Pier 4": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_2400,ar_4:3,g_center,f_auto/images/WoodsHillPierFour_LobsterPopOver_BriannaColeman_Boston-27_1_lwoojr",
      "credit": "Brianna Coleman, The Infatuation",
      "creditUrl": "https://www.theinfatuation.com/boston/reviews/woods-hill-pier-4"
    },
    "Row 34": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/_OGwRrPb59fm7xMxmjuDaA/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/row-34-seaport-boston"
    },
    "Alma Gaucha": {
      "src": "https://static.spotapps.co/spots/1a/a2d22b41c547c29e310511f54027ce/full",
      "credit": "Alma Gaucha",
      "creditUrl": "https://almagauchausa.com"
    }
  },
  "best-indian-restaurants-london": {
    "Amaya (Belgravia)": {
      "src": "https://www.amaya.biz/media/zuzb0kyg/amaya_nov2023_pwf_0236-hdr_a_v2.webp",
      "credit": "Amaya",
      "creditUrl": "https://www.amaya.biz/"
    },
    "Brigadiers (City)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_2400,ar_4:3,g_center,f_auto/cms/guides/what-to-order-when-its-fcking-freezing/KarolinaWiercigroch_Brigadiers_DumBeefShinBonemarrowBiryani_4",
      "credit": "Karolina Wiercigroch, The Infatuation",
      "creditUrl": "https://www.theinfatuation.com/london/reviews/brigadiers"
    },
    "Gymkhana (Mayfair)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_2400,ar_4:3,g_center,f_auto/images/JLau-Gymkhana-46_yk3nye",
      "credit": "The Infatuation",
      "creditUrl": "https://www.theinfatuation.com/london/reviews/gymkhana"
    },
    "Ambassadors Clubhouse (Mayfair)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_2400,ar_4:3,g_center,f_auto/images/Ambassadors_Clubhouse_Group_AleksandraBoruch_London-14_zml3bm",
      "credit": "Aleksandra Boruch, The Infatuation",
      "creditUrl": "https://www.theinfatuation.com/london/reviews/ambassadors-clubhouse"
    }
  },
  "best-wings-austin": {
    "Tommy Want Wingy (South Lamar)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/01Ega3vK1-bDzOyoqyWI8g/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/tommy-want-wingy-austin-4"
    },
    "Wingzup (Hancock)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/l4Nd2uPjxgPl7jhL1foaZg/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/wingzup-austin"
    },
    "Pluckers Wing Bar (Metro Austin)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/hCURXzixhNfnzZt6a2GRbw/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/pluckers-wing-bar-south-lamar-austin-3"
    },
    "Hi Wings (Allandale)": {
      "src": "https://platform.austin.eater.com/wp-content/uploads/sites/22/chorus/uploads/chorus_asset/file/25220345/Whole_Chicken_Wings_2_credit_Jane_Yun.jpg",
      "credit": "Eater Austin · Jane Yun",
      "creditUrl": "https://austin.eater.com/venue/60609/hi-wings"
    }
  },
  "best-breweries-world": {
    "Side Project Brewing (Maplewood, MO)": {
      "src": "https://www.sideprojectbrewing.com/cdn/shop/files/SP_Barrels_Desktop.jpg?v=1691625187&width=3840",
      "credit": "Side Project Brewing",
      "creditUrl": "https://www.sideprojectbrewing.com/"
    },
    "Tree House Brewing (Charlton, MA)": {
      "src": "https://images.squarespace-cdn.com/content/v1/5e7219f88ebaa26f2c4795c0/1584540090324-PXNIDG8P29NISZ3IT8CN/sunsetsmaller.jpg",
      "credit": "Tree House Brewing Company",
      "creditUrl": "https://www.treehousebrew.com/faq"
    },
    "Toppling Goliath (Decorah, IA)": {
      "src": "https://beerrepublic.eu/cdn/shop/collections/Scherm_afbeelding_2023-03-17_om_12.58.07_9da99ee4-83cc-440f-b47c-58b155a7bcb0.png?v=1687394866",
      "credit": "Beer Republic",
      "creditUrl": "https://beerrepublic.eu/collections/toppling-goliath"
    }
  },
  "south-shore-bar-pies-boston": {
    "J's Flying Pizza (Bridgewater)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/mwJB23eJGNbrFQWanDjYIg/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/js-flying-pizza-bridgewater"
    },
    "Cape Cod Cafe (Brockton)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/j8J7Y1PKjqSUp7y0pKqk2g/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/cape-cod-cafe-brockton"
    },
    "Lynwood Cafe (Randolph)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/5e8PM9TNH6b6A4-kLRr_4w/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/lynwood-cafe-randolph"
    }
  },
  "dive-bars-greenpoint": {
    "Lake Street": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/NTPU-UfWBvcBAveWnrCNeg/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/lake-street-brooklyn"
    },
    "Sunshine Laundromat & Pinball": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/oSN9T0naTmQTamoDSe-x3Q/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/sunshine-laundromat-and-pinball-brooklyn"
    },
    "Temkin's Bar": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/Gs880hVf_h-fEx6PZPCnvA/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/temkins-bar-brooklyn"
    }
  },
  "croissants-montreal": {
    "Au Kouign Amann (Plateau)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/IGZKORpEVK6pp9WBH_0J9Q/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/au-kouing-amann-montr%C3%A9al"
    },
    "Hof Kelsten (Mile End)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/htyzTnYUgiOsh9stYdSOZg/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/hof-kelsten-montr%C3%A9al"
    },
    "Les Co'pains d'abord (Plateau)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/haseEZM398E5iMvQRmlAdg/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/les-copains-d-abord-montr%C3%A9al"
    },
    "Le Saint Louis Café (Plateau)": {
      "src": "https://images.tastet.ca/_/rs:fit:1080:720:false:0/plain/https://sesame.tastet.ca/assets/4fa00281-317a-4504-bef5-c85fe461f2df.jpg@jpg",
      "credit": "Tastet",
      "creditUrl": "https://tastet.ca/en/reviews/le-cafe-saint-louis-charming-neighbourhood-address/"
    }
  },
  "beach-clubs-croatia": {
    "Carpe Diem Beach (Pakleni Islands, Hvar)": {
      "src": "https://beach.cdhvar.com/data/public/rotator/carpe-diem-beach_16268078c9e3fd.jpg",
      "credit": "Carpe Diem Beach",
      "creditUrl": "https://beach.cdhvar.com"
    },
    "Hula Hula (Hvar)": {
      "src": "https://hulahulahvar.com/wp-content/uploads/2026/05/TLU09419-1-scaled.jpg",
      "credit": "Hula Hula Hvar",
      "creditUrl": "https://hulahulahvar.com"
    },
    "Bonj Les Bains (Hvar)": {
      "src": "https://www.beachhvar.com/wp-content/uploads/2026/03/BeachClubHvar4.webp",
      "credit": "Beach Club Hvar",
      "creditUrl": "https://www.beachhvar.com"
    }
  },
  "breweries-denver": {
    "Bierstadt Lagerhaus (RiNo)": {
      "src": "https://cdn.vox-cdn.com/thumbor/cx4KPb3VotbcD2jtUQrXptD-WIA=/0x47:900x553/1600x900/cdn.vox-cdn.com/uploads/chorus_image/image/50539065/Bierstadt_9417e.0.0.0.jpg",
      "credit": "Eater Denver",
      "creditUrl": "https://denver.eater.com/2016/8/26/12652900/bierstadt-lagerhaus-rino"
    },
    "Cohesion Brewing (RiNo)": {
      "src": "https://www.hopculture.com/wp-content/uploads/2022/12/cohesion-brewing-company-taproom-1000x667-1.jpg",
      "credit": "Hop Culture",
      "creditUrl": "https://www.hopculture.com/cohesion-brewing/"
    },
    "Black Shirt Brewing (Cole)": {
      "src": "https://i0.wp.com/happeningindenver.com/wp-content/uploads/2023/01/RiNo-Breweries_Black-Shirt-Brewing-1100x733.jpg",
      "credit": "Happening in Denver",
      "creditUrl": "https://happeningindenver.com"
    },
    "Cerebral Brewing (City Park)": {
      "src": "https://craftpeak-cooler-images.imgix.net/cerebral-brewing/2F5A0392-scaled.jpg?auto=compress%2Cformat&ixlib=php-3.3.0&s=3300dced1d107eda5a29e73512fb5e0c",
      "credit": "Cerebral Brewing",
      "creditUrl": "https://cerebralbrewing.com"
    },
    "Comrade Brewing Company (Lowry)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/Ddq2vNU9qrLzM-AvxeWWLQ/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/comrade-brewing-denver"
    },
    "Ratio Beerworks (RiNo)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/xtkW-5QMJSiTgTwfjpmqYw/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/ratio-beerworks-denver"
    }
  },
  "cocktail-bars-tampa-bay": {
    "CW's Gin Joint (Downtown, Tampa)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/AlULL7ys-ecwZALlHJpVAw/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/cws-gin-joint-tampa-2"
    },
    "Copper Shaker (Ybor City, Tampa)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/b3WlNpS-Vn3bZB4ucG-ExQ/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/copper-shaker-tampa"
    },
    "Bar Mezzo (Downtown, St. Petersburg)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/p_b5CxXhCER9yXkwHGl0hg/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/bar-mezzo-st-petersburg"
    }
  },
  "asheville-breweries": {
    "Zillicoah Beer (Woodfin)": {
      "src": "https://toashevilleandbeyond.com/wp-content/uploads/2025/09/Zillicoah-Brewing-Asheville-NC-Woodfin.jpg",
      "credit": "To Asheville and Beyond",
      "creditUrl": "https://toashevilleandbeyond.com/zillicoah-beer-co-in-asheville-nc-reopens-after-the-storm/"
    },
    "Wicked Weed Brewing (Downtown)": {
      "src": "https://www.southernliving.com/thmb/8HrEJdJxs026-Leg_OzKgrb0Mgk=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/WickedWeed-2000-1efcb6444a7e491abdc81f9f18267a19.jpg",
      "credit": "Southern Living",
      "creditUrl": "https://www.southernliving.com/travel/north-carolina/asheville-breweries"
    },
    "Burial Beer Co. (South Slope)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/ZybQFKZSXmpHfvjAxvc3xg/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/burial-beer-asheville"
    },
    "Highland Brewing (East Asheville)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/E7-1VP4vrIz_iP2iNONxuw/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/highland-brewing-company-asheville"
    },
    "Wedge Brewing Co. (River Arts District)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/Ve6sr9_eOQjjOOcXYtW2nA/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/wedge-brewing-company-asheville-2"
    }
  },
  "happy-hour-boston": {
    "Barcelona Wine Bar (South End)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/EXp6o9XH50onEotZ95rMVA/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/barcelona-wine-bar-south-end-boston-6"
    },
    "The Banks Fish House (Back Bay)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/ciBpsEAfmanikxqr-92jWg/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/the-banks-seafood-and-steak-boston"
    },
    "Boqueria (Seaport)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/wtcsd1ZenvsKbtJUz9hRRw/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/boqueria-seaport-boston"
    }
  },
  "wwii-novels": {
    "The Book Thief (Markus Zusak)": {
      "src": "https://m.media-amazon.com/images/I/41sQhggHqjL.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B000XUBFE2?tag=cgurus-20"
    },
    "All the Light We Cannot See (Anthony Doerr)": {
      "src": "https://m.media-amazon.com/images/I/51Ls4hHopKL.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B00DPM7TIG?tag=cgurus-20"
    },
    "The Nightingale (Kristin Hannah)": {
      "src": "https://m.media-amazon.com/images/I/51ifIPw0RxL.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B00JO8PEN2?tag=cgurus-20"
    }
  },
  "f1-fan-experience": {
    "Monaco Grand Prix (Monte Carlo, Monaco)": {
      "src": "https://images.pexels.com/photos/32449925/pexels-photo-32449925/free-photo-of-monaco-grand-prix-circuit-aerial-view.jpeg?auto=compress&cs=tinysrgb&w=1920",
      "credit": "Vitória Zanella, Pexels",
      "creditUrl": "https://www.pexels.com/photo/32449925/"
    },
    "British Grand Prix (Silverstone, England)": {
      "src": "https://images.pexels.com/photos/36920232/pexels-photo-36920232/free-photo-of-exciting-formula-1-race-at-silverstone-circuit.jpeg?auto=compress&cs=tinysrgb&w=1920",
      "credit": "Samuel Phillips, Pexels",
      "creditUrl": "https://www.pexels.com/photo/36920232/"
    },
    "Italian Grand Prix (Monza, Italy)": {
      "src": "https://images.pexels.com/photos/14809396/pexels-photo-14809396.jpeg?auto=compress&cs=tinysrgb&w=1920",
      "credit": "Maksym Harbar, Pexels",
      "creditUrl": "https://www.pexels.com/photo/clouds-over-monza-circuit-in-italy-14809396/"
    }
  },
  "most-scenic-beaches-new-england": {
    "Coast Guard Beach (Eastham, MA)": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/a/a9/Coast_Guard_Beach%2C_Eastham_on_Cape_Cod_-_Flickr_-_dennis.weeks8.jpg",
      "credit": "Wikimedia Commons · Dennis Weeks",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:Coast_Guard_Beach,_Eastham_on_Cape_Cod_-_Flickr_-_dennis.weeks8.jpg"
    },
    "Crane Beach (Ipswich, MA)": {
      "src": "https://thetrustees.org/wp-content/uploads/2020/06/NE_CB_Rainbow-at-Cranes_SarahRydgren_fullsize.jpg",
      "credit": "The Trustees · Sarah Rydgren",
      "creditUrl": "https://thetrustees.org/place/crane-beach-on-the-crane-estate/"
    },
    "Sand Beach (Acadia National Park, ME)": {
      "src": "https://images.pexels.com/photos/35046940/pexels-photo-35046940/free-photo-of-scenic-coastal-landscape-in-acadia-national-park.jpeg?auto=compress&w=1600",
      "credit": "Pexels",
      "creditUrl": "https://www.pexels.com/photo/scenic-coastal-landscape-in-acadia-national-park-35046940/"
    }
  },
  "most-scenic-beaches-near-boston": {
    "Crane Beach (Ipswich)": {
      "src": "https://thetrustees.org/wp-content/uploads/2020/06/NE_CB_Rainbow-at-Cranes_SarahRydgren_fullsize.jpg",
      "credit": "The Trustees · Sarah Rydgren",
      "creditUrl": "https://thetrustees.org/place/crane-beach-on-the-crane-estate/"
    },
    "Good Harbor Beach (Gloucester)": {
      "src": "https://static.wixstatic.com/media/b4d42f_ebb685c55cff4279a70c8c472a650217~mv2.jpeg/v1/fit/w_2500,h_1330,al_c/b4d42f_ebb685c55cff4279a70c8c472a650217~mv2.jpeg",
      "credit": "Save Salt Island",
      "creditUrl": "https://www.savesaltisland.com/about-salt-island"
    },
    "Singing Beach (Manchester-by-the-Sea)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/yj6vgVzShOTmzdXqEsEqfw/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/singing-beach-manchester"
    }
  },
  "best-tv-dramas": {
    "Breaking Bad (2008)": {
      "src": "https://image.tmdb.org/t/p/original/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
      "credit": "TMDB · AMC",
      "creditUrl": "https://www.themoviedb.org/tv/1396-breaking-bad"
    },
    "The Sopranos (1999)": {
      "src": "https://image.tmdb.org/t/p/original/lNpkvX2s8LGB0mjGODMT4o6Up7j.jpg",
      "credit": "TMDB · HBO",
      "creditUrl": "https://www.themoviedb.org/tv/1398-the-sopranos"
    },
    "The Wire (2002)": {
      "src": "https://image.tmdb.org/t/p/original/layPSOJGckJv3PXZDIVluMq69mn.jpg",
      "credit": "TMDB · HBO",
      "creditUrl": "https://www.themoviedb.org/tv/1438-the-wire"
    }
  },
  "most-requested-karaoke-songs": {
    "Bohemian Rhapsody (Queen)": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/e/ef/Freddie_Mercury_performing_in_New_Haven%2C_CT%2C_November_1977.jpg",
      "credit": "Carl Lender / Wikimedia Commons (CC BY-SA 3.0)",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:Freddie_Mercury_performing_in_New_Haven,_CT,_November_1977.jpg"
    },
    "Sweet Caroline (Neil Diamond)": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/6/6a/Neil_Diamond_in_concert_2015.jpg",
      "credit": "Alexander Gresbek / Wikimedia Commons (CC BY 4.0)",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:Neil_Diamond_in_concert_2015.jpg"
    },
    "Tennessee Whiskey (Chris Stapleton)": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/a/a2/Chris_Stapleton_%2849627461537%29.jpg",
      "credit": "Shawn Miller, Library of Congress / Wikimedia Commons (CC0)",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:Chris_Stapleton_(49627461537).jpg"
    }
  },
  "distilleries-kentucky": {
    "Buffalo Trace Distillery (Frankfort)": {
      "src": "https://cms.buffalotracedistillery.com/wp-content/uploads/2025/11/image-75.jpg",
      "credit": "Buffalo Trace Distillery",
      "creditUrl": "https://www.buffalotracedistillery.com/"
    },
    "Maker's Mark Distillery (Loretto)": {
      "src": "https://imbibemagazine.com/wp-content/uploads/2019/03/makers-mark-inside-look-3-crtsy-makers-mark.jpg",
      "credit": "Maker's Mark / Imbibe Magazine",
      "creditUrl": "https://imbibemagazine.com/inside-look-makers-mark-distillery/"
    },
    "Castle & Key Distillery (Frankfort)": {
      "src": "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/17/ce/5b/bf/castle-key-distillery.jpg?w=1200&h=-1&s=1",
      "credit": "Tripadvisor",
      "creditUrl": "https://www.tripadvisor.com/Attraction_Review-g39426-d13109537-Reviews-Castle_Key_Distillery-Frankfort_Kentucky.html"
    }
  },
  "midtown-happy-hour": {
    "Ardesia (Hell's Kitchen)": {
      "src": "https://images.squarespace-cdn.com/content/v1/5acfaafd2714e5901ad943ff/1576456576485-QZIUKQ7FCTLX5UZD6D9Z/Catwalkdark2.jpg?format=2500w",
      "credit": "Ardesia Wine Bar",
      "creditUrl": "https://www.ardesia-ny.com"
    },
    "Jimmy's Corner (Theater District)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/GUEg8n12Dk74bvLacz0Dqw/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/jimmys-corner-new-york"
    },
    "The Palm (Theater District)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/pA58rUlAwNdtU-mLfya2Zw/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/the-palm-new-york-3"
    },
    "Sicily Osteria (Theater District)": {
      "src": "https://imageio.forbes.com/specials-images/imageserve/62713599a078055186f7f493/0x0.jpg",
      "credit": "Forbes",
      "creditUrl": "https://www.forbes.com/sites/johnmariani/2022/05/03/sicily-osteria-in-new-yorks-theater-district-would-be-just-as-at-home-in-palermo-or-taormina/"
    }
  },
  "historical-fiction-pre-internet": {
    "Beloved (Toni Morrison)": {
      "src": "https://m.media-amazon.com/images/I/71thRAO4cXL._SL1500_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B000TWUTYG?tag=cgurus-20"
    },
    "I, Claudius (Robert Graves)": {
      "src": "https://m.media-amazon.com/images/I/81JQsNZ1ZFL._SL1500_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B07NMNS2NY?tag=cgurus-20"
    },
    "Lonesome Dove (Larry McMurtry)": {
      "src": "https://m.media-amazon.com/images/I/410TA-pLcDL._SY1000_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B003NE6HD4?tag=cgurus-20"
    },
    "Shogun (James Clavell)": {
      "src": "https://m.media-amazon.com/images/I/41bb28vsDfL._SY1000_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B0GXFYC28N?tag=cgurus-20"
    },
    "Gone with the Wind (Margaret Mitchell)": {
      "src": "https://m.media-amazon.com/images/I/81PixEW7yGL._SY1000_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B000XGMTWS?tag=cgurus-20"
    }
  },
  "ohio-college-dive-bars": {
    "Brick Street Bar (Miami University)": {
      "src": "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/07/a0/0e/d7/brick-street.jpg",
      "credit": "TripAdvisor",
      "creditUrl": "https://www.tripadvisor.com/Attraction_Review-g50561-Brick_Street_Bar-Oxford_Ohio.html"
    },
    "Out-R-Inn (Ohio State)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/iq7r1fpfYN8P7hZr4J0W3w/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/out-r-inn-columbus"
    },
    "Bier Stube (Ohio State)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/ZxW6qyd11w5GxNfMC_vgvQ/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/bier-stube-columbus"
    },
    "Smiling Skull Saloon (Ohio University)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/WRBDBHkIIVRvcaROSqXwvA/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/smiling-skull-saloon-athens"
    }
  },
  "beach-clubs-italy": {
    "Il Riccio Beach Club by Dior (Anacapri)": {
      "src": "https://images.ng.ondaplatform.com/card/3512/gallery/il-riccio-capri.jpeg/w1280_h850_csmart_u1711101982.jpeg",
      "credit": "Capri.com",
      "creditUrl": "https://www.capri.com/en/c/il-riccio-2"
    },
    "La Fontelina (Capri)": {
      "src": "https://www.fontelina-capri.com/images/slide0b.jpg",
      "credit": "La Fontelina",
      "creditUrl": "https://www.fontelina-capri.com"
    },
    "Arienzo Beach Club (Positano)": {
      "src": "https://oneworldjustgoprints.com/cdn/shop/files/R2A0464.jpg?v=1692020334&width=1946",
      "credit": "One World Just Go Prints",
      "creditUrl": "https://oneworldjustgoprints.com"
    },
    "Nikki Beach Costa Smeralda (Sardinia)": {
      "src": "https://wwd.com/wp-content/uploads/2023/07/Missoni-Resort-Club-at-Nikki-Beach_5.jpg",
      "credit": "WWD",
      "creditUrl": "https://wwd.com/fashion-news/fashion-scoops/missoni-takes-over-the-nikki-beach-costa-smeralda-resort-destination-in-porto-cervo-sardinia-1235743922/"
    }
  },
  "best-italian-restaurants-boston": {
    "Giulia (Cambridge)": {
      "src": "https://images.squarespace-cdn.com/content/v1/5ebc3cc9e2146038281381cd/1597959447836-YLYUEDHDN4EBI9DGLS1O/_MG_4376.JPG?format=2500w",
      "credit": "Giulia",
      "creditUrl": "https://www.giuliarestaurant.com"
    },
    "SRV (South End)": {
      "src": "https://images.squarespace-cdn.com/content/v1/68501e4299cccb789f5e47a3/35cb4ffd-54b2-4c1f-9395-973a36b05b85/tortellini-header-srv-restaurant",
      "credit": "SRV",
      "creditUrl": "https://www.srvboston.com"
    },
    "Carmelina's (North End)": {
      "src": "https://images.squarespace-cdn.com/content/v1/55c7b273e4b0f2e19076d6ee/1443488208477-IGSNNRP1B2BMTOZYWZ2T/IMG_8959.jpg?format=2500w",
      "credit": "Carmelina's",
      "creditUrl": "https://www.carmelinasboston.com"
    },
    "Tonino (Jamaica Plain)": {
      "src": "https://images.squarespace-cdn.com/content/v1/625dfb1e18e19300316c5fe3/d074e45b-87bd-4e20-9c4c-6bae5b7aaaf6/tonino-177.jpg",
      "credit": "Tonino",
      "creditUrl": "https://www.toninojp.com"
    }
  },
  "soundbars": {
    "Nakamichi Shockwafe Wireless": {
      "src": "https://m.media-amazon.com/images/I/71KF-UXycJL._AC_SL1500_.jpg",
      "credit": "Nakamichi",
      "creditUrl": "https://www.amazon.com/dp/B0DWSDTBNF?tag=cgurus-20"
    },
    "Sonos Arc Ultra": {
      "src": "https://m.media-amazon.com/images/I/61WbdzYBy8L._AC_SL1500_.jpg",
      "credit": "Sonos",
      "creditUrl": "https://www.amazon.com/dp/B0DFK28LBB?tag=cgurus-20"
    },
    "Samsung HW-Q990F": {
      "src": "https://m.media-amazon.com/images/I/71pp-AXR6NL._AC_SL1500_.jpg",
      "credit": "Samsung",
      "creditUrl": "https://www.amazon.com/dp/B0DY1XTF77?tag=cgurus-20"
    },
    "Sonos Beam (Gen 2)": {
      "src": "https://m.media-amazon.com/images/I/51kIR1gKWYL._AC_SL1500_.jpg",
      "credit": "Sonos",
      "creditUrl": "https://www.amazon.com/dp/B09GPYL7BJ?tag=cgurus-20"
    }
  },
  "girl-scout-cookies": {
    "Samoas (Caramel deLites)": {
      "src": "https://ibcmsmedia.blob.core.windows.net/wfpuatabcbakers/1029/caramel-delites.png",
      "credit": "ABC Bakers",
      "creditUrl": "https://www.abcbakers.com/list-of-cookies/caramel-delites/"
    },
    "Thin Mints": {
      "src": "https://ibcmsmedia.blob.core.windows.net/wfpuatabcbakers/1012/thin-mints.png",
      "credit": "ABC Bakers",
      "creditUrl": "https://www.abcbakers.com/list-of-cookies/thin-mints/"
    },
    "Tagalongs (Peanut Butter Patties)": {
      "src": "https://ibcmsmedia.blob.core.windows.net/wfpuatabcbakers/1007/pb-patties.png",
      "credit": "ABC Bakers",
      "creditUrl": "https://www.abcbakers.com/list-of-cookies/peanut-butter-patties/"
    }
  },
  "hot-sauces": {
    "Frank's RedHot Original": {
      "src": "https://m.media-amazon.com/images/I/71-Rl+VF-DL._SL1500_.jpg",
      "credit": "Frank's RedHot",
      "creditUrl": "https://www.amazon.com/dp/B000XGGX6G?tag=cgurus-20"
    },
    "Cholula Original": {
      "src": "https://m.media-amazon.com/images/I/71Uz2j9M9dL._SL1500_.jpg",
      "credit": "Cholula",
      "creditUrl": "https://www.amazon.com/dp/B008NUQA8A?tag=cgurus-20"
    },
    "Tapatio Salsa Picante": {
      "src": "https://m.media-amazon.com/images/I/71SRxWnKuWL._SL1500_.jpg",
      "credit": "Tapatio",
      "creditUrl": "https://www.amazon.com/dp/B000R4G6JS?tag=cgurus-20"
    }
  },
  "womens-running-shoes": {
    "Asics Novablast 5": {
      "src": "https://m.media-amazon.com/images/I/61p+wyr1ppL._AC_SL1200_.jpg",
      "credit": "ASICS",
      "creditUrl": "https://www.amazon.com/dp/B0F64M9J7D?tag=cgurus-20"
    },
    "Adidas Adizero Evo SL": {
      "src": "https://m.media-amazon.com/images/I/71azYVW2GcL._AC_SL1500_.jpg",
      "credit": "Adidas",
      "creditUrl": "https://www.amazon.com/dp/B0D3JBY2VP?tag=cgurus-20"
    },
    "Asics Gel-Kayano 32": {
      "src": "https://m.media-amazon.com/images/I/61fz1ft0bDL._AC_SL1200_.jpg",
      "credit": "ASICS",
      "creditUrl": "https://www.amazon.com/dp/B0FWYHDWV9?tag=cgurus-20"
    }
  },
  "carry-on-luggage": {
    "Rimowa Original Cabin": {
      "src": "https://www.rimowa.com/on/demandware.static/-/Sites-rimowa-master-catalog-final/default/dw467d3040/images/large/92553004_2.png",
      "credit": "Rimowa",
      "creditUrl": "https://www.rimowa.com/us/en/original/"
    },
    "Travelpro Platinum Elite 21-Inch Spinner": {
      "src": "https://m.media-amazon.com/images/I/71-2Fq0E35L._AC_SL1500_.jpg",
      "credit": "Travelpro",
      "creditUrl": "https://www.amazon.com/dp/B0B12P671V?tag=cgurus-20"
    },
    "Away The Carry-On": {
      "src": "https://m.media-amazon.com/images/I/71vRKOpXh5L._AC_SL1500_.jpg",
      "credit": "Away",
      "creditUrl": "https://www.amazon.com/dp/B0DLJHS52R?tag=cgurus-20"
    },
    "Briggs & Riley Baseline Essential Spinner": {
      "src": "https://m.media-amazon.com/images/I/61C4djf7moL._AC_SL1500_.jpg",
      "credit": "Briggs & Riley",
      "creditUrl": "https://www.amazon.com/dp/B09Y2B3WMG?tag=cgurus-20"
    }
  },
  "air-purifiers": {
    "Blueair Blue Pure 311i Max": {
      "src": "https://m.media-amazon.com/images/I/71NjbkKlIGL._AC_SL1500_.jpg",
      "credit": "Blueair",
      "creditUrl": "https://www.amazon.com/dp/B0BN2LZ9JH?tag=cgurus-20"
    },
    "Levoit Core 400S": {
      "src": "https://m.media-amazon.com/images/I/71zj41yHChL._AC_SL1500_.jpg",
      "credit": "Levoit",
      "creditUrl": "https://www.amazon.com/dp/B08R794ZMX?tag=cgurus-20"
    },
    "Winix 5510": {
      "src": "https://m.media-amazon.com/images/I/71a4tm4xYoL._AC_SL1500_.jpg",
      "credit": "Winix",
      "creditUrl": "https://www.amazon.com/dp/B0DJG1731C?tag=cgurus-20"
    }
  },
  "drip-coffee-makers": {
    "Ratio Six Series 2": {
      "src": "https://www.bodhileafcoffee.com/cdn/shop/products/ratio6-stainless-A4_1800x1800_f4bd9326-356b-42e4-adce-5199102f463c_2000x.jpg?v=1649868674",
      "credit": "Ratio Coffee",
      "creditUrl": "https://ratiocoffee.com/products/ratio-six-coffee-machine-series-2"
    },
    "Technivorm Moccamaster KBT": {
      "src": "https://m.media-amazon.com/images/I/71nWUz7pEdL._AC_SL1500_.jpg",
      "credit": "Technivorm",
      "creditUrl": "https://www.amazon.com/dp/B002S4DI2S?tag=cgurus-20"
    },
    "Technivorm Moccamaster KBGV Select": {
      "src": "https://m.media-amazon.com/images/I/81B9sCQui1S._AC_SL1500_.jpg",
      "credit": "Technivorm",
      "creditUrl": "https://www.amazon.com/dp/B093DYWXCS?tag=cgurus-20"
    },
    "Breville Precision Brewer": {
      "src": "https://m.media-amazon.com/images/I/512-Dw9Zx7L._AC_SL1080_.jpg",
      "credit": "Breville",
      "creditUrl": "https://www.amazon.com/dp/B078RQVQF1?tag=cgurus-20"
    }
  },
  "home-projectors": {
    "Sony Bravia Projector 9": {
      "src": "https://m.media-amazon.com/images/I/71gIN+axLRL._AC_SL1500_.jpg",
      "credit": "Sony",
      "creditUrl": "https://www.amazon.com/dp/B0DGRFKC8T?tag=cgurus-20"
    },
    "Sony VPL-XW5000ES": {
      "src": "https://m.media-amazon.com/images/I/517aJbAwDEL._AC_SL1200_.jpg",
      "credit": "Sony",
      "creditUrl": "https://www.amazon.com/dp/B09XC1K3NH?tag=cgurus-20"
    },
    "Hisense M2 Pro": {
      "src": "https://m.media-amazon.com/images/I/61IVCcifV1L._AC_SL1500_.jpg",
      "credit": "Hisense",
      "creditUrl": "https://www.amazon.com/dp/B0F6ZV1367?tag=cgurus-20"
    },
    "JVC DLA-NZ900": {
      "src": "https://m.media-amazon.com/images/I/61nDzxxFvvL.jpg",
      "credit": "JVC",
      "creditUrl": "https://www.amazon.com/dp/B0D461XLL3?tag=cgurus-20"
    }
  },
  "bluetooth-speakers": {
    "JBL Xtreme 4": {
      "src": "https://m.media-amazon.com/images/I/71ycGDj9WQL._AC_SL1500_.jpg",
      "credit": "JBL",
      "creditUrl": "https://www.amazon.com/dp/B0CTP191Z3?tag=cgurus-20"
    },
    "Bose SoundLink Max": {
      "src": "https://m.media-amazon.com/images/I/61t6uKPIumL._AC_SL1129_.jpg",
      "credit": "Bose",
      "creditUrl": "https://www.amazon.com/dp/B0CVL1K7DX?tag=cgurus-20"
    },
    "JBL Charge 6": {
      "src": "https://m.media-amazon.com/images/I/81pM9-KLvqL._AC_SL1500_.jpg",
      "credit": "JBL",
      "creditUrl": "https://www.amazon.com/dp/B0DN2ZCZX6?tag=cgurus-20"
    },
    "Marshall Bromley 750": {
      "src": "https://m.media-amazon.com/images/I/81apyFAb8qL._AC_SL1500_.jpg",
      "credit": "Marshall",
      "creditUrl": "https://www.amazon.com/dp/B0FTZXFVJ1?tag=cgurus-20"
    },
    "JBL Boombox 4": {
      "src": "https://m.media-amazon.com/images/I/81Wwx8n42KL._AC_SL1500_.jpg",
      "credit": "JBL",
      "creditUrl": "https://www.amazon.com/dp/B0F1H9CTPQ?tag=cgurus-20"
    },
    "JBL PartyBox Stage 320": {
      "src": "https://m.media-amazon.com/images/I/61F-k33n0AL._AC_SL1500_.jpg",
      "credit": "JBL",
      "creditUrl": "https://www.amazon.com/dp/B0CTD6V6S6?tag=cgurus-20"
    },
    "JBL Flip 7": {
      "src": "https://m.media-amazon.com/images/I/81aJ4547UeL._AC_SL1500_.jpg",
      "credit": "JBL",
      "creditUrl": "https://www.amazon.com/dp/B0DMV3BMGP?tag=cgurus-20"
    },
    "JBL Clip 5": {
      "src": "https://m.media-amazon.com/images/I/81BdIR8hyUL._AC_SL1500_.jpg",
      "credit": "JBL",
      "creditUrl": "https://www.amazon.com/dp/B0CTP56C5R?tag=cgurus-20"
    }
  },
  "best-dive-bars-jacksonville": {
    "Pete's Bar (Neptune Beach)": {
      "src": "https://www.jacksonville.com/gcdn/authoring/2019/11/25/NFTU/ghows_image-LK-acee9e86-79a7-4410-844c-2145a213f9a7.jpeg?width=1200&fit=crop&format=pjpg&auto=webp",
      "credit": "The Florida Times-Union",
      "creditUrl": "https://www.jacksonville.com/"
    },
    "Shantytown Pub (Springfield)": {
      "src": "https://scoundrelsfieldguide.com/wp-content/uploads/2022/02/Jacksonville-Shantytown-Pub-5-scaled.jpg",
      "credit": "Scoundrel's Field Guide",
      "creditUrl": "https://scoundrelsfieldguide.com/florida/jacksonville/"
    },
    "Broken Spoke (Arlington)": {
      "src": "https://static2.menufyy.com/broken-spoke-albums-1.jpg",
      "credit": "The Broken Spoke",
      "creditUrl": "https://www.yelp.com/biz/broken-spoke-jacksonville"
    }
  },
  "best-off-broadway-nashville-bars": {
    "The Fox Bar & Cocktail Club (East Nashville)": {
      "src": "https://cdn.shopify.com/s/files/1/0589/8898/6564/files/M25A7898_2048x2048.jpg?v=1629510105",
      "credit": "The Fox Bar & Cocktail Club",
      "creditUrl": "https://www.thefoxnashville.com/"
    },
    "The Patterson House (The Gulch)": {
      "src": "https://nashvilleguru.com/officialwebsite/wp-content/uploads/2025/05/The-Patterson-House-Nashville-_-2.jpg",
      "credit": "Nashville Guru",
      "creditUrl": "https://nashvilleguru.com/"
    },
    "Coral Club (East Nashville)": {
      "src": "https://images.axios.com/5by66EPnBYyJoIXZlrmus2J-0ec=/0x541:5800x3804/1920x1080/2024/06/25/1719347739115.jpg",
      "credit": "Axios Nashville",
      "creditUrl": "https://www.axios.com/local/nashville"
    }
  },
  "true-crime-docuseries": {
    "The Jinx (2015)": {
      "src": "https://image.tmdb.org/t/p/original/rDJei8aoHbhgKOSgFSZ4zI6sbwa.jpg",
      "credit": "HBO (via TMDB)",
      "creditUrl": "https://www.themoviedb.org/tv/61929-the-jinx-the-life-and-deaths-of-robert-durst"
    },
    "Don't F**k with Cats (2019)": {
      "src": "https://image.tmdb.org/t/p/original/5B5hpcQ4hc6ywi1MiauLhs4liem.jpg",
      "credit": "Netflix (via TMDB)",
      "creditUrl": "https://www.themoviedb.org/tv/96129-don-t-f-k-with-cats-hunting-an-internet-killer"
    },
    "Making a Murderer (2015)": {
      "src": "https://image.tmdb.org/t/p/original/clmdHJpw3NuUCZveyTTwB83wmRH.jpg",
      "credit": "Netflix (via TMDB)",
      "creditUrl": "https://www.themoviedb.org/tv/64439-making-a-murderer"
    },
    "The Keepers (2017)": {
      "src": "https://image.tmdb.org/t/p/original/ckk04w9FYAm54jEfrjnTigvEtQR.jpg",
      "credit": "Netflix (via TMDB)",
      "creditUrl": "https://www.themoviedb.org/tv/26101-the-keepers"
    }
  },
  "coffee-shops-hamptons": {
    "Sagtown Coffee (Sag Harbor)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/Ze3f0NHFo08w8DKO9P9AwQ/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/sagtown-coffee-sag-harbor-3"
    },
    "Grindstone Coffee & Donuts (Sag Harbor)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/FiLJasWwQwJOWGxh8U0_ig/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/grindstone-coffee-and-donuts-sag-harbor"
    },
    "Bambi's Cafe (Montauk)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/_Lwoz9rl69VQU8Cq775ORg/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/bambis-cafe-montauk"
    },
    "Java Nation (Bridgehampton)": {
      "src": "https://hamptons.com/wp-content/uploads/2023/05/java-nation-hamptons_0708-scaled.jpeg",
      "credit": "Hamptons.com",
      "creditUrl": "https://hamptons.com/java-nation-bridgehamptons-hidden-gem-ifykyk/"
    }
  },
  "breweries-chicago": {
    "Pilot Project Brewing (Logan Square)": {
      "src": "https://img1.10bestmedia.com/Images/Photos/405267/Pilot-Project-Brewing_54_990x660.jpg",
      "credit": "USA Today 10Best",
      "creditUrl": "https://www.10best.com"
    },
    "Revolution Brewing (Avondale)": {
      "src": "https://d37xww59oglu30.cloudfront.net/graphic-assets/RevolutionBrewPub-3.jpg",
      "credit": "Revolution Brewing",
      "creditUrl": "https://revbrew.com"
    },
    "Begyle Brewing (Ravenswood)": {
      "src": "https://illinoisbrewing.com/wp-content/uploads/2024/10/Begyle-exterior.jpg",
      "credit": "Illinois Brewing",
      "creditUrl": "https://illinoisbrewing.com"
    },
    "Dovetail Brewery (Ravenswood)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/HMp2teHEpfXp5TVvvpC5Sw/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/dovetail-brewery-chicago"
    },
    "Half Acre Beer Company (Andersonville)": {
      "src": "https://halfacrebeer.com/wp-content/uploads/2026/01/HalfAcreLight_Header-scaled.jpg",
      "credit": "Half Acre Beer Company",
      "creditUrl": "https://halfacrebeer.com"
    },
    "Off Color Brewing (Lincoln Park)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/I0nUc5_V9D7Kfa66vEZ-HA/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/off-color-brewing-chicago"
    }
  },
  "spindrift-flavors": {
    "Lemon": {
      "src": "https://m.media-amazon.com/images/I/71zS3WG6jwL._SL1500_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B0787FVBBP?tag=cgurus-20"
    },
    "Blood Orange Tangerine": {
      "src": "https://m.media-amazon.com/images/I/81yrrP3nHZL._SL1500_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B0CV64Y9Z7?tag=cgurus-20"
    },
    "Lime": {
      "src": "https://m.media-amazon.com/images/I/71Hoi4+rLPL._SL1500_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B07NC9GHM7?tag=cgurus-20"
    }
  },
  "best-sub-chains": {
    "Potbelly": {
      "src": "https://chefstandards.com/wp-content/uploads/2025/01/Potbelly-Sandwich-Shop-2.jpg",
      "credit": "Potbelly",
      "creditUrl": "https://www.potbelly.com"
    },
    "Jersey Mike's": {
      "src": "https://www.jerseymikes.ca/media/static/menu/products/lg/13-italian-reg.jpg",
      "credit": "Jersey Mike's",
      "creditUrl": "https://www.jerseymikes.com"
    },
    "Firehouse Subs": {
      "src": "https://epmgaa.media.clients.ellingtoncms.com/img/photos/2024/06/10/HookLadder_PRImage_1920x108096-1.jpg",
      "credit": "Firehouse Subs",
      "creditUrl": "https://www.firehousesubs.com"
    }
  },
  "caesar-wraps-chicago": {
    "Moonwalker Cafe (Avondale)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_1280,ar_4:3,g_center,f_auto/images/Moonwalker_Cafe_Caesar_Wrap_Veda_Kilaru_Chicago_lz1jib",
      "credit": "The Infatuation / Veda Kilaru",
      "creditUrl": "https://www.theinfatuation.com/chicago/guides/best-caesar-wraps-chicago"
    },
    "Will's Northwoods Inn (Lakeview)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_1280,ar_4:3,g_center,f_auto/images/Will_s_Northwoods_Inn_Caesar_Wrap_Veda_Kilaru_Chicago_shnn5f",
      "credit": "The Infatuation / Veda Kilaru",
      "creditUrl": "https://www.theinfatuation.com/chicago/guides/best-caesar-wraps-chicago"
    },
    "Ain't She Sweet Cafe (Bronzeville)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_1280,ar_4:3,g_center,f_auto/images/Ain_t_She_Sweet_Cafe_Caesar_Wrap_Veda_Kilaru_Chicago_xjntoe",
      "credit": "The Infatuation / Veda Kilaru",
      "creditUrl": "https://www.theinfatuation.com/chicago/guides/best-caesar-wraps-chicago"
    }
  },
  "beach-clubs-france": {
    "Paloma Beach (Saint-Jean-Cap-Ferrat)": {
      "src": "https://www.cotemagazine.com/wp-content/uploads/2019/05/0689c23f24f7ac329fc2cc0eacb4a93f_XL-8e3.jpg",
      "credit": "Côte Magazine",
      "creditUrl": "https://paloma-beach.com"
    },
    "Club 55 (Ramatuelle)": {
      "src": "https://www.insignia.com/wp-content/uploads/2024/08/Insignia-Club-55-Saint-Tropez-1242x828.jpg",
      "credit": "Club 55",
      "creditUrl": "https://www.club55.fr"
    },
    "La Reserve a la Plage (Ramatuelle)": {
      "src": "https://thetasteedit.com/wp-content/uploads/2023/03/lareserve-plage-pampelonne-beach-ramatuelle-france-thetasteedit-sarah-stanfield-6083-1920x1280.jpg",
      "credit": "The Taste Edit / Sarah Stanfield",
      "creditUrl": "https://www.lareserve-ramatuelle.com"
    },
    "Nikki Beach Saint-Tropez (Ramatuelle)": {
      "src": "https://finestclubs.com/uploads/aacb67bb8866c0acf47725f58c4ff51a.jpeg",
      "credit": "Nikki Beach",
      "creditUrl": "https://nikkibeach.com/destinations/beach-clubs/st-tropez/"
    }
  },
  "best-oetker-collection-hotels-world": {
    "Le Bristol Paris (France)": {
      "src": "https://cdn.galeriemagazine.com/wp-content/uploads/2025/04/MAIN_Le_Bristol_Paris_-_Facade_cote_jardin_Francais_-_Romain_Reglade_1737-1174x783.jpg",
      "credit": "Le Bristol Paris / Romain Réglade",
      "creditUrl": "https://www.oetkercollection.com/hotels/le-bristol-paris/"
    },
    "Hôtel du Cap-Eden-Roc (Antibes, France)": {
      "src": "https://s1.it.atcdn.net/wp-content/uploads/2013/09/Hotel-du-Cap-Eden-Roc-swimming-pool.jpg",
      "credit": "Hôtel du Cap-Eden-Roc",
      "creditUrl": "https://www.oetkercollection.com/hotels/hotel-du-cap-eden-roc/"
    },
    "Eden Rock - St Barths (Saint Barthélemy)": {
      "src": "https://www.luxethika.com/wp-content/uploads/2020/08/St-Barth-Eden-Rock-Aerial-2-1540-880.jpg",
      "credit": "Eden Rock - St Barths",
      "creditUrl": "https://www.oetkercollection.com/hotels/eden-rock-st-barths/"
    }
  },
  "caesar-wraps-la": {
    "Ggiata (Melrose Hill)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/Klet6DYU9dEw050UoZ7OeA/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/ggiata-melrose-hill-los-angeles-4"
    },
    "Goop Kitchen (multiple locations)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/bZApO6NWk0wxiUb6A5qb2A/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/goop-kitchen-santa-monica-west-los-angeles-4"
    },
    "Joan's on Third (Beverly Grove)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/E8cIkFQOjNnBWjNitTU9KQ/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/joans-on-third-los-angeles"
    }
  },
  "texas-college-dive-bars": {
    "Cool Beans (UNT)": {
      "src": "https://images.squarespace-cdn.com/content/v1/5106cf89e4b04827cc5fc5bb/1454422578314-3E9R1L2DPCUIM4Q1A6V0/image-asset.jpeg",
      "credit": "Cool Beans",
      "creditUrl": "https://coolbeansdentontx.com/"
    },
    "Dixie Chicken (Texas A&M)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/XQdF89T0-Gx_gBG1oUQ1Ng/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/dixie-chicken-college-station"
    },
    "Bash Riprock's (Texas Tech)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/9BY1pewUWNXhr7Ltjp08lQ/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/bash-riprocks-lubbock"
    },
    "Hole in the Wall (UT Austin)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/7-7du1tc7iXoSICZczUzZA/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/hole-in-the-wall-austin"
    }
  },
  "savannah-dive-bars": {
    "The Original Pinkie Masters (Historic District)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/3U3f7HP3pa8RT3rxlNwmzQ/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/the-original-pinkie-masters-savannah"
    },
    "Abe's on Lincoln (Historic District)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/yzw1mB2KJFbEEYgcZ8khbA/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/abes-on-lincoln-savannah"
    },
    "American Legion Post 135 (Historic District)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/f-ILaqYohNdjdEFj3-knMg/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/the-american-legion-post-135-savannah"
    }
  },
  "speakeasies-manhattan": {
    "George Bang Bang (Koreatown)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_1600,ar_4:3,g_center,f_auto/GBB_interior_2_turdre",
      "credit": "Moonhee Kim / The Infatuation",
      "creditUrl": "https://www.theinfatuation.com/new-york/reviews/george-bang-bang"
    },
    "The Woo Woo (Times Square)": {
      "src": "https://img.p2bars.com/d17/2509/1614543843310319.webp",
      "credit": "The Woo Woo",
      "creditUrl": "https://www.thewoowoonyc.com"
    },
    "Attaboy (Lower East Side)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_1600,ar_4:3,g_center,f_auto/images/Attaboy_LES_Bars_qpczle",
      "credit": "Noah Devereaux / The Infatuation",
      "creditUrl": "https://www.theinfatuation.com/new-york/reviews/attaboy"
    }
  },
  "coffee-grinders": {
    "OXO Brew Conical Burr Coffee Grinder": {
      "src": "https://m.media-amazon.com/images/I/71DeUg8G7kS._AC_SL1500_.jpg",
      "credit": "OXO",
      "creditUrl": "https://www.amazon.com/dp/B07CSKGLMM"
    },
    "Baratza Encore": {
      "src": "https://m.media-amazon.com/images/I/61TrvcVsXEL._AC_SL1500_.jpg",
      "credit": "Baratza",
      "creditUrl": "https://www.amazon.com/dp/B007F183LK"
    },
    "Baratza Virtuoso+": {
      "src": "https://m.media-amazon.com/images/I/61w9Ks-Rx1L._AC_SL1500_.jpg",
      "credit": "Baratza",
      "creditUrl": "https://www.amazon.com/dp/B07QMY8GLX"
    }
  },
  "pizza-chicago": {
    "Vito & Nick's (Ashburn)": {
      "src": "https://www.chicagotribune.com/wp-content/uploads/migration/2020/08/12/LJZZU6NJ6BGXLCJFKB6IURVBN4.jpg",
      "credit": "Chicago Tribune",
      "creditUrl": "https://www.chicagotribune.com"
    },
    "Milly's Pizza in the Pan (Lakeview)": {
      "src": "https://www.thetakeout.com/img/gallery/12-restaurants-in-chicago-for-the-best-deep-dish-pizza-according-to-a-local/millys-pizza-in-the-pan-1768896878.jpg",
      "credit": "The Takeout",
      "creditUrl": "https://www.thetakeout.com"
    },
    "Bob's Pizza (Pilsen)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_3840,ar_4:3,g_auto,f_auto/cms/reviews/bobs-pizza/chi_bobs_sandynoto-19_2520_25281_2529",
      "credit": "The Infatuation",
      "creditUrl": "https://www.theinfatuation.com"
    },
    "Five Squared Pizza (Goose Island)": {
      "src": "https://nomsmagazine.com/wp-content/uploads/2023/07/best-pizza-in-chicago-five-squared-pizza-770x738.jpg",
      "credit": "Noms Magazine",
      "creditUrl": "https://nomsmagazine.com"
    },
    "Robert's Pizza & Dough Co. (Streeterville)": {
      "src": "https://www.robertspizzacompany.com/wp-content/uploads/2024/07/CupNCharPepperoni-392-1400x740.jpeg",
      "credit": "Robert's Pizza & Dough Co.",
      "creditUrl": "https://www.robertspizzacompany.com"
    }
  },
  "hot-dogs-chicago": {
    "Superdawg Drive-In (Norwood Park)": {
      "src": "https://www.chicagotribune.com/wp-content/uploads/migration/2023/05/05/FOYQB4AESRAS5HULD2AM2URYL4.jpg",
      "credit": "Chicago Tribune",
      "creditUrl": "https://www.chicagotribune.com"
    },
    "Byron's Hot Dogs (Wrigleyville)": {
      "src": "https://www.enobytes.com/wp-content/uploads/2020/11/Byrons-hotdogs-chicago.jpg",
      "credit": "Enobytes",
      "creditUrl": "https://www.enobytes.com"
    },
    "Gene & Jude's (River Grove)": {
      "src": "https://www.geneandjudes.com/img/two-hot-dogs.jpg",
      "credit": "Gene & Jude's",
      "creditUrl": "https://www.geneandjudes.com"
    },
    "Fat Johnnie's (Marquette Park)": {
      "src": "https://roadfood.com/wp-content/uploads/2019/08/Fat-Johnnies-dog-0-e1567073205723.jpg",
      "credit": "Roadfood",
      "creditUrl": "https://roadfood.com"
    },
    "Flub A Dub Chub's (Lakeview)": {
      "src": "https://www.tastingtable.com/img/gallery/15-top-rated-spots-for-chicago-style-hot-dogs-in-the-windy-city/flub-a-dub-chubs-1708961125.jpg",
      "credit": "Tasting Table",
      "creditUrl": "https://www.tastingtable.com"
    }
  },
  "italian-beef-chicago": {
    "Al's #1 Italian Beef (Little Italy)": {
      "src": "https://www.chicagomag.com/wp-content/uploads/2021/06/CIE-Italian-Beef-Als-1-Italian-Beef-1024x683.jpg",
      "credit": "Chicago Magazine",
      "creditUrl": "https://www.chicagomag.com"
    },
    "Mr. Beef (River North)": {
      "src": "https://www.chowhound.com/img/gallery/the-10-best-places-to-get-italian-beef-in-chicago/mr-beef-on-orleans-1735412160.jpg",
      "credit": "Chowhound",
      "creditUrl": "https://www.chowhound.com"
    },
    "Tony's Italian Beef (West Lawn)": {
      "src": "https://www.tastingtable.com/img/gallery/12-best-spots-for-italian-beef-sandwiches-in-chicago/tonys-italian-beef-1689625796.jpg",
      "credit": "Tasting Table",
      "creditUrl": "https://www.tastingtable.com"
    }
  },
  "pizza-new-haven": {
    "Frank Pepe Pizzeria Napoletana (Wooster Square)": {
      "src": "https://www.pmq.com/wp-content/uploads/2025/01/White-Clam-Pizza2-copy-768x768.jpeg",
      "credit": "PMQ Pizza Magazine",
      "creditUrl": "https://www.pmq.com"
    },
    "Modern Apizza (East Rock)": {
      "src": "https://visitnewhaven.com/wp-content/uploads/2023/01/cover_photo-505.jpg",
      "credit": "Visit New Haven",
      "creditUrl": "https://visitnewhaven.com"
    },
    "Sally's Apizza (Wooster Square)": {
      "src": "https://www.chowhound.com/img/gallery/what-sets-new-haven-pizza-apart-from-other-thin-crusts/the-tomato-pie-is-a-classic-along-with-other-local-flavors-1699446557.jpg",
      "credit": "Chowhound",
      "creditUrl": "https://www.chowhound.com"
    }
  },
  "cheesesteaks-philadelphia": {
    "Dalessandro's Steaks (Roxborough)": {
      "src": "https://dalessandros.com/wp-content/uploads/2020/11/4-120.jpg",
      "credit": "Dalessandro's",
      "creditUrl": "https://dalessandros.com"
    },
    "Angelo's Pizzeria (Bella Vista)": {
      "src": "https://www.mashed.com/img/gallery/a-philadelphia-pizzeria-is-home-to-one-of-the-best-cheesesteaks-in-the-city/the-philly-cheesesteak-at-angelos-pizzeria-is-a-sought-after-delight-1744192722.jpg",
      "credit": "Mashed",
      "creditUrl": "https://www.mashed.com"
    },
    "Del Rossi's Cheesesteak Co. (Northern Liberties)": {
      "src": "https://images.squarespace-cdn.com/content/v1/62ab83b13613f716a6fa8ac2/1659976803530-60JT60ZBS6YKK8HGF483/image-asset.jpeg",
      "credit": "Del Rossi's",
      "creditUrl": "https://www.delrossis.com"
    },
    "Nipotina (South Philly)": {
      "src": "https://cloudfront-us-east-1.images.arcpublishing.com/pmn/FU4A3FW3WJCVXMLYCZZQX665OM.jpg",
      "credit": "The Philadelphia Inquirer",
      "creditUrl": "https://www.inquirer.com"
    }
  },
  "bbq-austin": {
    "LeRoy and Lewis Barbecue (South Austin)": {
      "src": "https://media.cntraveler.com/photos/5e165cd9489c0a000a1123b8/16:9/w_2560,c_limit/Leroy&Lewis_LoganCrable-2020-Austin2.jpg",
      "credit": "Logan Crable / Condé Nast Traveler",
      "creditUrl": "https://www.cntraveler.com"
    },
    "Franklin Barbecue (East Austin)": {
      "src": "https://img.hoodline.com/2026/3/franklin-barbecues-brisket-reign-austin-icon-snags-fifth-straight-texas-crown-1.webp",
      "credit": "Hoodline",
      "creditUrl": "https://hoodline.com"
    },
    "KG BBQ (MLK)": {
      "src": "https://media.cntraveler.com/photos/64bab4680a2887b7eb0c00e4/master/pass/Best%20Austin%20Barbecue_KG-19FEB23-Geoff-Duncan-Photography-GD1_1521.jpg",
      "credit": "Geoff Duncan / Condé Nast Traveler",
      "creditUrl": "https://www.cntraveler.com"
    }
  },
  "bbq-texas": {
    "LeRoy and Lewis Barbecue (Austin)": {
      "src": "https://media.cntraveler.com/photos/5e165cd9489c0a000a1123b8/16:9/w_2560,c_limit/Leroy&Lewis_LoganCrable-2020-Austin2.jpg",
      "credit": "Logan Crable / Condé Nast Traveler",
      "creditUrl": "https://www.cntraveler.com"
    },
    "Goldee's Barbecue (Fort Worth)": {
      "src": "https://cdn.vox-cdn.com/thumbor/xN-11wueBF6HzRev3t9E3QTsyoE=/0x0:7712x5144/3570x2008/filters:focal(3240x1956:4472x3188)/cdn.vox-cdn.com/uploads/chorus_image/image/70811188/021322_GoldeesBBQKathyTran_0639.0.jpg",
      "credit": "Eater",
      "creditUrl": "https://austin.eater.com"
    },
    "Burnt Bean Co. (Seguin)": {
      "src": "https://s.hdnux.com/photos/01/41/14/35/25478983/3/1920x0.jpg",
      "credit": "San Antonio Express-News",
      "creditUrl": "https://www.expressnews.com"
    }
  },
  "po-boys-new-orleans": {
    "Parkway Bakery & Tavern (Mid-City)": {
      "src": "https://www.roadtripsforfamilies.com/wp-content/uploads/2023/12/Roast-beef-po-boy-at-Parkway-Bakery-and-Tavern.jpg",
      "credit": "Road Trips for Families",
      "creditUrl": "https://www.roadtripsforfamilies.com"
    },
    "Domilise's (Uptown)": {
      "src": "https://www.foodrepublic.com/img/gallery/the-best-new-orleans-restaurant-for-poboys-according-to-local-chef-alon-shaya-exclusive/domilises-poboy-sandwiches-are-the-real-deal-1711010830.jpg",
      "credit": "Food Republic",
      "creditUrl": "https://www.foodrepublic.com"
    },
    "Liuzza's by the Track (Mid-City)": {
      "src": "https://40aprons.com/wp-content/uploads/2022/05/new-orleans-bbq-shrimp-poboy-5.jpg",
      "credit": "40 Aprons",
      "creditUrl": "https://40aprons.com"
    }
  },
  "dive-bars-new-orleans": {
    "Snake and Jake's Christmas Club Lounge (Uptown)": {
      "src": "https://scoundrelsfieldguide.com/wp-content/uploads/2021/07/New-Orleans-Snake-Jake-17-scaled.jpg",
      "credit": "Scoundrel's Field Guide",
      "creditUrl": "https://scoundrelsfieldguide.com"
    },
    "Brothers Three (Uptown)": {
      "src": "https://transform.octanecdn.com/cdn/https://octanecdn.com/whereyatcom/whereyatcom_176159054.jpg",
      "credit": "Where Y’at",
      "creditUrl": "https://www.whereyat.com"
    },
    "Bullet's Sports Bar (7th Ward)": {
      "src": "https://assets-prd.punchdrink.com/wp-content/uploads/2016/08/Slide2-Bullets-Sports-Bar-Best-Jazz-Bar-New-Orleans.jpg",
      "credit": "PUNCH",
      "creditUrl": "https://punchdrink.com"
    },
    "Pete's Out in the Cold (Irish Channel)": {
      "src": "https://scoundrelsfieldguide.com/wp-content/uploads/2021/08/New-Orleans-Out-In-The-Cold-7-scaled.jpg",
      "credit": "Scoundrel's Field Guide",
      "creditUrl": "https://scoundrelsfieldguide.com"
    }
  },
  "beach-clubs-greece": {
    "Scorpios (Paraga, Mykonos)": {
      "src": "https://www.abroadwithash.com/wp-content/uploads/2024/07/Scorpios-Mykonos-Sunset-Beach-1-2-1536x1097.jpg",
      "credit": "Abroad with Ash",
      "creditUrl": "https://www.abroadwithash.com"
    },
    "Pasaji (Ornos, Mykonos)": {
      "src": "https://santorinidave.com/wp-content/uploads/2020/06/pasaji-mykonos-beach-club-restaurant-ornos.jpeg",
      "credit": "Santorini Dave",
      "creditUrl": "https://santorinidave.com"
    },
    "Astir Beach (Vouliagmeni, Athens Riviera)": {
      "src": "https://www.noupou.gr/wp-content/uploads/2020/05/vouliagmeni-astir-beach-paralia-asteras-1.jpg",
      "credit": "Noupou",
      "creditUrl": "https://www.noupou.gr"
    },
    "Sani Beach Club (Sani, Halkidiki)": {
      "src": "https://www.greeka.com/hotels/photos/3335/halkidiki-sani-beach-club-top-5-1920.jpg",
      "credit": "Greeka",
      "creditUrl": "https://www.greeka.com"
    },
    "SantAnna (Paraga, Mykonos)": {
      "src": "https://santorinidave.com/wp-content/uploads/2020/09/Mykonos-SantAnna-Beach-Club-pool-4-1.jpg",
      "credit": "Santorini Dave",
      "creditUrl": "https://santorinidave.com"
    }
  },
  "movies-david-fincher": {
    "The Social Network (2010)": {
      "src": "https://m.media-amazon.com/images/M/MV5BMTc5NTY3NDc4Ml5BMl5BanBnXkFtZTcwNzY0NTUxNA@@._V1_.jpg",
      "credit": "Columbia Pictures / IMDb",
      "creditUrl": "https://www.imdb.com/title/tt1285016/"
    },
    "Se7en (1995)": {
      "src": "https://c8.alamy.com/comp/2RX38M5/seven-1995-new-line-cinema-film-with-brad-pitt-at-left-and-morgan-freeman-2RX38M5.jpg",
      "credit": "New Line Cinema / Alamy",
      "creditUrl": "https://www.imdb.com/title/tt0114369/"
    },
    "Fight Club (1999)": {
      "src": "https://m.media-amazon.com/images/M/MV5BMjk3NTYyMzc4Nl5BMl5BanBnXkFtZTcwODU3ODMzMw@@._V1_.jpg",
      "credit": "20th Century Fox / IMDb",
      "creditUrl": "https://www.imdb.com/title/tt0137523/"
    }
  },
  "college-towns-america": {
    "Ann Arbor (Michigan)": {
      "src": "https://i.pinimg.com/originals/13/52/3d/13523d564e6aafd4830041a9f580650d.jpg",
      "credit": "University of Michigan",
      "creditUrl": "https://www.visitannarbor.org"
    },
    "Gainesville (Florida)": {
      "src": "https://www.visitgainesville.com/wp-content/uploads/university-of-florida-Campus-aerial-century-tower-auditorium-2.jpg",
      "credit": "Visit Gainesville",
      "creditUrl": "https://www.visitgainesville.com"
    },
    "Austin (Texas)": {
      "src": "https://www.robgreebonphotography.com/images/xl/Spring-Aerial-over-Lady-Bird-Lake-and-Austin-331-1.jpg",
      "credit": "Rob Greebon Photography",
      "creditUrl": "https://www.robgreebonphotography.com"
    }
  },
  "restaurants-monaco": {
    "Blue Bay Marcel Ravin (Larvotto)": {
      "src": "https://images.surfacemag.com/app/uploads/2024/05/21180156/MCSBM-Blue-Bay-Marcel-Ravin-Terrasse-1.jpg",
      "credit": "Monte-Carlo Societe des Bains de Mer",
      "creditUrl": "https://www.montecarlosbm.com/en/restaurant-monaco/blue-bay-marcel-ravin"
    },
    "Les Ambassadeurs by Christophe Cussac (Monte-Carlo)": {
      "src": "https://metropole.com/wp-content/uploads/resized/2024/10/1960x1134_Restaurant_Les_Ambassadeurs_by_Christophe_Cussac_StudioPhenix-2-1-1920x0-c-default.jpg",
      "credit": "Hotel Metropole Monte-Carlo / Studio Phenix",
      "creditUrl": "https://metropole.com/en/restaurant-montecarlo/les-ambassadeurs-by-christophe-cussac/"
    },
    "Le Louis XV - Alain Ducasse (Monte-Carlo)": {
      "src": "https://rrsg.s3.amazonaws.com/wp-content/uploads/2020/03/10170701/SBM_HP-Restaurant-Louis-XV-2019-0004.jpg",
      "credit": "Monte-Carlo Societe des Bains de Mer",
      "creditUrl": "https://www.montecarlosbm.com/en/restaurant-monaco/le-louis-xv-alain-ducasse-hotel-de-paris"
    }
  },
  "comedy-clubs-nyc": {
    "Comedy Cellar (Greenwich Village)": {
      "src": "https://media.timeout.com/images/105286095/image.jpg",
      "credit": "Time Out New York",
      "creditUrl": "https://www.timeout.com/newyork/comedy/comedy-cellar"
    },
    "Gotham Comedy Club (Chelsea)": {
      "src": "https://img1.10bestmedia.com/Images/Photos/20098/p-gothaminterior_lo_8686_54_990x660_201406011054.jpg",
      "credit": "10Best / USA Today",
      "creditUrl": "https://www.gothamcomedyclub.com/"
    },
    "The Stand (Union Square)": {
      "src": "https://thestandnyc.com/images/private-events/main-showroom.jpg",
      "credit": "The Stand",
      "creditUrl": "https://thestandnyc.com/"
    }
  },
  "mattress-brands": {
    "Saatva": {
      "src": "https://www.sleepfoundation.org/wp-content/uploads/2024/11/Saatva-Classic_shadow.png",
      "credit": "Sleep Foundation",
      "creditUrl": "https://www.sleepfoundation.org/best-mattress"
    },
    "Helix": {
      "src": "https://www.sleepfoundation.org/wp-content/uploads/2024/11/Helix-Midnight-Luxe_shadow.png",
      "credit": "Sleep Foundation",
      "creditUrl": "https://www.sleepfoundation.org/best-mattress"
    },
    "Nectar": {
      "src": "https://www.sleepfoundation.org/wp-content/uploads/2026/02/Nectar-Classic1.jpg",
      "credit": "Sleep Foundation",
      "creditUrl": "https://www.sleepfoundation.org/best-mattress"
    }
  },
  "best-one-and-only-resorts-world": {
    "One&Only Palmilla (Los Cabos, Mexico)": {
      "src": "https://deluxe-escapes.com/wp-content/uploads/2016/03/one-and-only-palmilla-agua-pool.jpg",
      "credit": "One&Only Palmilla",
      "creditUrl": "https://www.oneandonlyresorts.com/palmilla"
    },
    "One&Only Reethi Rah (Maldives)": {
      "src": "https://www.travoh.com/wp-content/uploads/2021/11/015-OneOnly-Reethi-Rah-Resort-North-Male-Atoll-Maldives-Grand-Water-Villa-Aerial.jpg",
      "credit": "One&Only Reethi Rah",
      "creditUrl": "https://www.oneandonlyresorts.com/reethi-rah"
    },
    "One&Only Nyungwe House (Rwanda)": {
      "src": "https://res.cloudinary.com/take-memories/images/f_auto,dpr_auto,q_auto,w_1400,c_fill,h_840/gm/hb86tp8zipnkbhlfo03u/oneandonly-nyungwe-house-drone-clubhouse-exterior",
      "credit": "One&Only Nyungwe House",
      "creditUrl": "https://www.oneandonlyresorts.com/nyungwe-house"
    }
  },
  "best-shangri-la-hotels-world": {
    "Shangri-La Bosphorus (Istanbul, Turkey)": {
      "src": "https://cdn.luxatic.com/wp-content/uploads/2017/03/Shangri-La-Bosphorus-Istanbul-1.jpg",
      "credit": "Shangri-La Bosphorus",
      "creditUrl": "https://www.shangri-la.com/istanbul/shangrila/"
    },
    "Shangri-La Paris (France)": {
      "src": "https://worldinparis.com/wp-content/uploads/2018/04/Shangri-La-Paris-Terrace.jpg",
      "credit": "Shangri-La Paris",
      "creditUrl": "https://www.shangri-la.com/paris/shangrila/"
    },
    "Shangri-La The Shard (London, United Kingdom)": {
      "src": "https://luxuriate.life/wp-content/uploads/2020/08/Shangri-La-Hotel-At-The-Shard-London-Sky-Pool.jpg",
      "credit": "Shangri-La The Shard",
      "creditUrl": "https://www.shangri-la.com/london/shangrila/"
    },
    "Shangri-La Toronto (Canada)": {
      "src": "https://www.myboutiquehotel.com/photos/115255/shangri-la-toronto-toronto-064-74827-1110x700.jpg",
      "credit": "Shangri-La Toronto",
      "creditUrl": "https://www.shangri-la.com/toronto/shangrila/"
    }
  },
  "breweries-washington-dc": {
    "Aslin Beer Company (Logan Circle)": {
      "src": "https://cdn.vox-cdn.com/thumbor/8DYXrfsifjYUz4FrRQdgTxqvz60=/0x0:4032x3024/2420x1613/filters:focal(1694x1190:2338x1834)/cdn.vox-cdn.com/uploads/chorus_image/image/71056531/aslin_dc_tierney_view_outdoors.0.jpg",
      "credit": "Eater DC",
      "creditUrl": "https://dc.eater.com/2022/7/7/23198162/aslin-dc-opens-logan-circle-beer-garden"
    },
    "Right Proper Brewing Company (Brookland)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/c76Td9U0bkMGmgquuwZwkw/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/right-proper-brewing-washington"
    },
    "DC Brau (Woodridge)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/hGUSp0N5Amib0_6f9PLO2Q/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/dc-brau-brewing-company-washington-2"
    },
    "Other Half Brewing (Ivy City)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/AGqShR_2VYjj4HJdWnbGpg/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/other-half-brewing-washington"
    }
  },
  "breweries-orlando": {
    "Sideward Brewing Co. (Milk District)": {
      "src": "https://craftpeak-cooler-images.imgix.net/sideward-brewing-co/taproom-crop.jpg?auto=compress%2Cformat&ixlib=php-3.3.1&s=f4fdb714a05df4c845a2c6a1d8a80e68",
      "credit": "Sideward Brewing",
      "creditUrl": "https://sidewardbrewing.com/location/taproom/"
    },
    "Redlight Redlight (Audubon Park)": {
      "src": "https://static.wixstatic.com/media/2c91de_f86582c88b964341853110924f4e1bc8~mv2.jpg/v1/fill/w_1000,h_653,al_c,q_85,usm_0.66_1.00_0.01/2c91de_f86582c88b964341853110924f4e1bc8~mv2.jpg",
      "credit": "Gotta Go Orlando",
      "creditUrl": "https://www.gottagoorlando.com/post/audubon-park-s-redlight-redlight-nominated-as-one-of-the-best-beer-bars-in-the-u-s"
    },
    "RockPit Brewing (SODO)": {
      "src": "https://bungalower.com/wp-content/uploads/2023/04/278560297_1196344230770809_1631956931401717326_n-1200x814-1.jpg",
      "credit": "Bungalower",
      "creditUrl": "https://bungalower.com"
    },
    "Half Barrel Beer Project (International Drive)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/4JKFEiDYsArf0iktkfzA0g/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/half-barrel-beer-project-orlando-2"
    },
    "Ten10 Brewing Company (Mills 50)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/FF4oghSHOwb0qFEVX0m3-w/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/ten10-brewing-co-orlando"
    },
    "Twelve Talons Beerworks (Milk District)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/bH_bAV0YX7KdIf34eqzCyg/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/twelve-talons-beerworks-orlando"
    }
  },
  "best-daniel-day-lewis-movies": {
    "Phantom Thread": {
      "src": "https://www.reviewstl.com/wp-content/uploads/2018/01/Phantom-Thread-4.jpg",
      "credit": "ReviewSTL · Focus Features",
      "creditUrl": "https://www.reviewstl.com"
    },
    "My Beautiful Laundrette": {
      "src": "https://static1.srcdn.com/wordpress/wp-content/uploads/2024/01/1985-my-beautiful-laundrette-1.jpg",
      "credit": "ScreenRant · Orion Pictures",
      "creditUrl": "https://screenrant.com"
    },
    "There Will Be Blood": {
      "src": "https://static0.srcdn.com/wordpress/wp-content/uploads/2025/02/daniel-day-lewis-in-there-will-be-blood.jpg",
      "credit": "ScreenRant · Paramount Vantage",
      "creditUrl": "https://screenrant.com"
    }
  },
  "best-belmond-hotels-world": {
    "Copacabana Palace, a Belmond Hotel (Rio de Janeiro, Brazil)": {
      "src": "https://belmondcdn.azureedge.net/assets/photos/cop/2580x1299/cop-ext07_2580x1299.jpg",
      "credit": "Belmond",
      "creditUrl": "https://www.belmond.com/hotels/south-america/brazil/rio-de-janeiro/belmond-copacabana-palace/"
    },
    "Belmond Hotel das Cataratas (Iguassu Falls, Brazil)": {
      "src": "https://belmondcdn.azureedge.net/assets/photos/cat/2580x1299/cat-ext-aerial01_2580x1299.jpg",
      "credit": "Belmond",
      "creditUrl": "https://www.belmond.com/hotels/south-america/brazil/iguassu-falls/belmond-hotel-das-cataratas/"
    },
    "Maroma, a Belmond Hotel (Riviera Maya, Mexico)": {
      "src": "https://belmondcdn.azureedge.net/assets/photos/mar/2580x1299/mar-ext04_2580x1299.jpg",
      "credit": "Belmond",
      "creditUrl": "https://www.belmond.com/hotels/north-america/mexico/riviera-maya/maroma-resort/"
    },
    "Belmond Hotel Splendido (Portofino, Italy)": {
      "src": "https://media.cntraveler.com/photos/66db2d911858ba3644e56b8c/16:9/w_2560%2Cc_limit/Splendido%2520Belmond_SPL-POOL-32.jpg",
      "credit": "Condé Nast Traveler / Belmond",
      "creditUrl": "https://www.belmond.com/hotels/europe/italy/portofino/belmond-hotel-splendido/"
    },
    "Belmond Hotel Caruso (Ravello, Italy)": {
      "src": "https://belmondcdn.azureedge.net/assets/photos/car/3600x1813/car-gst-pool01_3600x1813.jpg",
      "credit": "Belmond",
      "creditUrl": "https://www.belmond.com/hotels/europe/italy/amalfi-coast/belmond-hotel-caruso/"
    }
  },
  "best-capella-hotels-world": {
    "Capella Bangkok (Thailand)": {
      "src": "https://www.wbpstars.com/wp-content/uploads/2022/03/Capella_Bangkok_wbpstars_SVC-28-2048x1153.jpg",
      "credit": "Capella Bangkok",
      "creditUrl": "https://capellahotels.com/en/capella-bangkok"
    },
    "Capella Sydney (Australia)": {
      "src": "https://images.lifestyleasia.com/wp-content/uploads/sites/3/2023/03/16212627/capella-sydney-main-entrance-farrer-place-lr-1350x900.jpeg",
      "credit": "Capella Sydney",
      "creditUrl": "https://capellahotels.com/en/capella-sydney"
    },
    "Capella Hanoi (Vietnam)": {
      "src": "https://www.bensley.com/wp-content/uploads/2021/02/4257-1920x1280.jpg",
      "credit": "Bensley / Capella Hanoi",
      "creditUrl": "https://capellahotels.com/en/capella-hanoi"
    }
  },
  "best-mandarin-oriental-hotels-world": {
    "Mandarin Oriental Bangkok (Thailand)": {
      "src": "https://cdn.audleytravel.com/1060/756/60/16004943-pool-area-mandarin-oriental.jpg",
      "credit": "Mandarin Oriental Bangkok",
      "creditUrl": "https://www.mandarinoriental.com/en/bangkok/chao-phraya-river"
    },
    "Emirates Palace Mandarin Oriental (Abu Dhabi, UAE)": {
      "src": "https://photos.mandarinoriental.com/is/image/MandarinOriental/abu-dhabi-exterior-fountain?wid=2000",
      "credit": "Mandarin Oriental",
      "creditUrl": "https://www.mandarinoriental.com/en/abu-dhabi/emirates-palace"
    },
    "Mandarin Oriental Canouan (St. Vincent and the Grenadines)": {
      "src": "https://www.travoh.com/wp-content/uploads/2022/06/001-Mandarin-Oriental-Canouan-Island-Resort-Saint-Vincent-and-the-Grenadines-Resort-Aerial-View.jpg",
      "credit": "Mandarin Oriental Canouan",
      "creditUrl": "https://www.mandarinoriental.com/en/canouan/saint-vincent"
    }
  },
  "best-six-senses-resorts-world": {
    "Six Senses Fiji (Malolo Island, Fiji)": {
      "src": "https://www.theluxevoyager.com/wp-content/uploads/2018/02/Sis-Senses-Fiji-beachfront-pool-villa.jpg",
      "credit": "The Luxe Voyager / Six Senses",
      "creditUrl": "https://www.sixsenses.com/en/resorts/fiji"
    },
    "Six Senses Laamu (Maldives)": {
      "src": "https://www.travoh.com/wp-content/uploads/2021/11/053-Six-Senses-Laamu-Resort-Laamu-Atoll-Maldives-Resort-Aerial.jpg",
      "credit": "Six Senses Laamu",
      "creditUrl": "https://www.sixsenses.com/en/resorts/laamu"
    },
    "Six Senses Zighy Bay (Musandam, Oman)": {
      "src": "https://images.squarespace-cdn.com/content/v1/61652167add14a01eaa7717c/6494244c-c15a-4e6e-8e45-8299509d9887/Six_Senses_SSZB_Aerial_View+%281%29.jpg",
      "credit": "Six Senses Zighy Bay",
      "creditUrl": "https://www.sixsenses.com/en/resorts/zighy-bay"
    }
  },
  "best-st-regis-hotels-world": {
    "The St. Regis New York (United States)": {
      "src": "https://www.rw-luxuryhotels.com/wp-content/uploads/2015/12/Courtesy-of-St-R%C3%A9gis-New-York-Exterior-1-1200x482.jpg",
      "credit": "St. Regis New York",
      "creditUrl": "https://www.marriott.com/hotels/travel/nycxr-the-st-regis-new-york/"
    },
    "The St. Regis Maldives Vommuli Resort (Dhaalu Atoll, Maldives)": {
      "src": "https://www.travoh.com/wp-content/uploads/2021/11/037-The-St.-Regis-Maldives-Vommuli-Resort-Dhaalu-Atoll-Maldives-Whale-Bar-Exterior.jpg",
      "credit": "The St. Regis Maldives Vommuli Resort",
      "creditUrl": "https://www.marriott.com/en-us/hotels/mlexr-the-st-regis-maldives-vommuli-resort/overview/"
    },
    "The St. Regis Bora Bora Resort (French Polynesia)": {
      "src": "https://cache.marriott.com/content/dam/marriott-renditions/BOBXR/bobxr-royal-suitevilla-swimmingpool-1698-hor-wide.jpg",
      "credit": "The St. Regis Bora Bora Resort",
      "creditUrl": "https://www.marriott.com/en-us/hotels/bobxr-the-st-regis-bora-bora-resort/overview/"
    },
    "The St. Regis Venice (Italy)": {
      "src": "https://cache.marriott.com/content/dam/marriott-renditions/VCEXR/vcexr-outdoor-terrace-5527-hor-clsc.jpg",
      "credit": "The St. Regis Venice",
      "creditUrl": "https://www.marriott.com/en-us/hotels/vcexr-the-st-regis-venice/overview/"
    }
  },
  "best-airport-lounges": {
    "Singapore Airlines The Private Room (Singapore SIN)": {
      "src": "https://mainlymiles.com/wp-content/uploads/2019/05/Dining.jpg",
      "credit": "Mainly Miles",
      "creditUrl": "https://mainlymiles.com/2019/05/11/review-the-private-room-by-singapore-airlines/"
    },
    "Plaza Premium Lounge (Rome FCO)": {
      "src": "https://www.plazapremiumlounge.com/PlazaPremiumLounge/media/PPLMedia/Lounges/Europe/Italy/FCO/Dep_T3_1600x800_Web3.jpg",
      "credit": "Plaza Premium Lounge",
      "creditUrl": "https://www.plazapremiumlounge.com/"
    },
    "Qatar Airways Al Mourjan Business Lounge (Doha DOH)": {
      "src": "https://mainlymiles.com/wp-content/uploads/2023/04/Al-Mourjan-Overview-Small-2-Qatar-Airways-1024x683.jpg",
      "credit": "Mainly Miles",
      "creditUrl": "https://mainlymiles.com/"
    }
  },
  "public-golf-nyc-day-trip": {
    "Bethpage Black (Farmingdale, NY)": {
      "src": "https://golf.com/wp-content/uploads/2025/09/bethpage-black-18th.jpg",
      "credit": "GOLF.com",
      "creditUrl": "https://golf.com/"
    },
    "Heron Glen Golf Course (Ringoes, NJ)": {
      "src": "https://www.heronglen.com/wp-content/uploads/sites/8753/2023/04/new_slide_01.jpg",
      "credit": "Heron Glen Golf Course",
      "creditUrl": "https://www.heronglen.com/"
    },
    "Bally's Golf Links at Ferry Point (Bronx, NY)": {
      "src": "https://offloadmedia.feverup.com/secretnyc.co/wp-content/uploads/2022/08/25090705/trump-links-1024x703.jpeg",
      "credit": "Secret NYC",
      "creditUrl": "https://secretnyc.co/"
    }
  },
  "best-wings-boston": {
    "Buff's Pub (Newton)": {
      "src": "https://d1w7312wesee68.cloudfront.net/9dfBPctzbwfzR9-QyYbZS09tpMXQcvvQOmm3byFr9cU/resize:fit:1080:1080/plain/s3:/toasttab/restaurants/restaurant-54060000000000000/menu/items/0/item-500000005154734310_1740156878.jpg",
      "credit": "Buff's Pub",
      "creditUrl": "https://www.buffspub.com/"
    },
    "Mahaniyom (Brookline)": {
      "src": "https://platform.boston.eater.com/wp-content/uploads/sites/4/chorus/uploads/chorus_asset/file/25532404/chicken_wings_vertical.jpg",
      "credit": "Eater Boston",
      "creditUrl": "https://boston.eater.com/"
    },
    "Lincoln Tavern (South Boston)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/yKbfRbtZKlBHy8I72a-sSw/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/lincoln-tavern-and-restaurant-boston"
    },
    "Firefly's BBQ (Marlborough)": {
      "src": "https://www.tasteofmass.com/wp-content/uploads/2023/11/Roo-Wings-974x1024.jpg",
      "credit": "Taste of Massachusetts",
      "creditUrl": "https://www.tasteofmass.com/fireflys-bbq-in-marlborough/"
    }
  },
  "best-wings-miami": {
    "House of Wings (Overtown)": {
      "src": "https://jeffeats.com/wp-content/uploads/2022/02/0E4A34B7-B82E-4EA9-808F-921E3844DE69.jpeg",
      "credit": "Jeff Eats",
      "creditUrl": "https://jeffeats.com/"
    },
    "Sports Grill (South Miami)": {
      "src": "https://sportsgrill.com/wp-content/uploads/2017/12/wings.jpg",
      "credit": "Sports Grill",
      "creditUrl": "https://sportsgrill.com/"
    },
    "Keg South (Pinecrest)": {
      "src": "https://burgerbeast.com/wp-content/uploads/2009/04/Keg-South-Pinecrest-Special-Grilled-Wings.jpg",
      "credit": "Burger Beast",
      "creditUrl": "https://burgerbeast.com/"
    },
    "Taste of R Cuisine (Edgewater)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/giF4DNX9wMZEYFdi1lFAJg/1000s.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/taste-of-r-cuisine-miami-4"
    },
    "Urban Rrasoi (Kendall)": {
      "src": "https://media-cdn.tripadvisor.com/media/photo-s/1a/69/14/f7/delicious-indian-food.jpg",
      "credit": "Tripadvisor",
      "creditUrl": "https://www.tripadvisor.com/LocationPhotoDirectLink-g34438-d19329611-i443094262-Urban_Rrasoi_Kendall-Miami_Florida.html"
    }
  },
  "burgers-austin": {
    "Moreno Burger Co. (Garrison Park)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_1280,ar_16:9,g_center,f_auto/images/DSCF3742_b4kb5u",
      "credit": "The Infatuation / Nicolai McCrary",
      "creditUrl": "https://www.theinfatuation.com/austin/guides/smashburgers-austin"
    },
    "Bar Toti (Cherrywood)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_1280,ar_16:9,g_center,f_auto/images/BarToti_NicolaiMcCrary_12_wpqdrn",
      "credit": "The Infatuation / Nicolai McCrary",
      "creditUrl": "https://www.theinfatuation.com/austin/guides/smashburgers-austin"
    },
    "Patty Palace (South Austin)": {
      "src": "https://alikhaneats.com/wp-content/uploads/2023/11/Patty-Palace-burger-header-1024x689.jpg",
      "credit": "Ali Khan Eats",
      "creditUrl": "https://alikhaneats.com/"
    },
    "Clark's Oyster Bar (Clarksville)": {
      "src": "https://www.atasteofkoko.com/wp-content/uploads/2015/08/Clarks-Oyster-Bar-Burger.jpg",
      "credit": "A Taste of Koko",
      "creditUrl": "https://www.atasteofkoko.com/"
    },
    "Gimme Burger (South Austin)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/CvXJJRmBDqUUc-E3vdO_Ng/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/gimme-burger-austin"
    }
  },
  "burgers-london": {
    "The Plimsoll (Finsbury Park)": {
      "src": "https://cdn.thenudge.com/wp-content/uploads/2021/10/four-legs-plimsoll-e1636110919446-768x512.jpeg",
      "credit": "The Nudge",
      "creditUrl": "https://www.thenudge.com/"
    },
    "Dove (Notting Hill)": {
      "src": "https://www.london-unattached.com/wp-content/uploads/2025/01/Dove-burger-760x573.jpg",
      "credit": "London Unattached",
      "creditUrl": "https://www.london-unattached.com/"
    },
    "Jupiter Burger (London Fields)": {
      "src": "https://www.hot-dinners.com/images/stories/blog/2025/jupiter/jupiter.jpg",
      "credit": "Hot Dinners",
      "creditUrl": "https://www.hot-dinners.com/"
    },
    "Black Bear Burger (Brixton)": {
      "src": "https://londontheinside.com/wp-content/uploads/2019/06/blackbearburger-loti.jpg",
      "credit": "London The Inside",
      "creditUrl": "https://londontheinside.com/black-bear-burger-opens-in-brixton/"
    },
    "Mother Flipper (Brockley)": {
      "src": "https://www.hot-dinners.com/images/stories/blog/2023/motherflipperbrockley.jpg",
      "credit": "Hot Dinners",
      "creditUrl": "https://www.hot-dinners.com/"
    }
  },
  "cocktail-bars-boston": {
    "Bar Lunette (Brookline)": {
      "src": "https://bomag.o0bc.com/wp-content/uploads/sites/2/2025/05/bar-lunette-nathan-tavares-4-900px.jpg",
      "credit": "Boston Magazine · Nathan Tavares",
      "creditUrl": "https://www.bostonmagazine.com/"
    },
    "Darling (Cambridge)": {
      "src": "https://bomag.o0bc.com/wp-content/uploads/sites/2/2025/07/darling-cambridge-rachel-leah-blumenthal-08-900px.jpg",
      "credit": "Boston Magazine · Rachel Leah Blumenthal",
      "creditUrl": "https://www.bostonmagazine.com/"
    },
    "Next Door (East Boston)": {
      "src": "https://blog.resy.com/wp-content/uploads/2022/04/nextdoor-2000x1333.jpg",
      "credit": "Resy",
      "creditUrl": "https://blog.resy.com/"
    },
    "Parla (North End)": {
      "src": "https://images.squarespace-cdn.com/content/v1/56186e77e4b06a43987b4433/1444448792862-FGNWUMCYIF48Y3O8309I/IMG_4921.jpg",
      "credit": "Parla",
      "creditUrl": "https://www.parlaboston.com/"
    },
    "Backbar (Somerville)": {
      "src": "https://www.bostonmagazine.com/wp-content/uploads/sites/2/2025/12/backbar-rachel-leah-blumenthal-16-1200px.jpg",
      "credit": "Boston Magazine",
      "creditUrl": "https://www.bostonmagazine.com/"
    }
  },
  "dive-bars-atlanta": {
    "Northside Tavern (West Midtown)": {
      "src": "https://scoundrelsfieldguide.com/wp-content/uploads/2022/05/Atlanta-Northside-Tavern-7-scaled.jpg",
      "credit": "Scoundrel's Field Guide",
      "creditUrl": "https://scoundrelsfieldguide.com/"
    },
    "Moe's & Joe's Tavern (Virginia-Highland)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/flbqZucPUkfaYVw7kRvaVw/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/moes-and-joes-atlanta"
    },
    "The Local (Old Fourth Ward)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/H4L--UY7U5x4A--VVdMtfg/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/the-local-atlanta"
    },
    "Bob & Harriet's Home Bar (Kirkwood)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_scale,w_1200,f_jpg/images/Bob_Harriets_ATL_Interior_c33xz9",
      "credit": "The Infatuation",
      "creditUrl": "https://www.theinfatuation.com/atlanta/reviews/bob-and-harriets-home-bar"
    },
    "The Earl (East Atlanta Village)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/f_jpg,w_1600/v1671124174/Atlanta_TheEarl_AmySinclair-8_xxbo57.jpg",
      "credit": "The Infatuation · Amy Sinclair",
      "creditUrl": "https://www.theinfatuation.com/atlanta/reviews/the-earl"
    }
  },
  "dive-bars-greenwich-village": {
    "Johnny's Bar": {
      "src": "https://scoundrelsfieldguide.com/wp-content/uploads/2024/07/New-York-Johnnys-Bar-13-scaled.jpg",
      "credit": "Scoundrel's Field Guide",
      "creditUrl": "https://scoundrelsfieldguide.com/"
    },
    "The Four-Faced Liar": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/mDwx3MlYuaQCHytRw0JprQ/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/the-four-faced-liar-new-york"
    },
    "Kettle of Fish": {
      "src": "https://media.timeout.com/images/100129467/image.jpg",
      "credit": "Time Out",
      "creditUrl": "https://www.timeout.com/"
    }
  },
  "best-bottomless-brunch-lower-manhattan": {
    "Dudley's (Lower East Side)": {
      "src": "https://www.yourlittleblackbook.me/wp-content/uploads/2019/09/beste-restaurants-lowereastside-new-york-dudleys-2.jpg",
      "credit": "Your Little Black Book",
      "creditUrl": "https://www.yourlittleblackbook.me/"
    },
    "Freemans (Lower East Side)": {
      "src": "https://images.squarespace-cdn.com/content/v1/55c8d2a4e4b0168e0edc0b4b/1439247238380-PRL9X5B0SJO9R8LLD45J/front-room.jpg",
      "credit": "Freemans",
      "creditUrl": "https://www.freemansrestaurant.com/"
    },
    "Boqueria (SoHo)": {
      "src": "https://boqueriarestaurant.com/wp-content/uploads/2024/11/Boqueria-giant-paella.jpg",
      "credit": "Boqueria",
      "creditUrl": "https://boqueriarestaurant.com/"
    }
  },
  "savannah-cocktail-bars": {
    "Artillery Bar (Historic District)": {
      "src": "https://imbibemagazine.com/wp-content/uploads/2018/08/artillery-bar-inside-look-interior-7-crdt-jeremiah-hull-1000x667.jpg",
      "credit": "Imbibe Magazine · Jeremiah Hull",
      "creditUrl": "https://imbibemagazine.com/"
    },
    "Alley Cat Lounge (Historic District)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/r7SFgQ71xdB9tGuR2iVe3Q/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/alley-cat-lounge-savannah"
    },
    "Smol (Starland District)": {
      "src": "https://s3-media0.fl.yelpcdn.com/bphoto/N-y0XbYR-1MzczFFpdKpxw/o.jpg",
      "credit": "Yelp",
      "creditUrl": "https://www.yelp.com/biz/smol-savannah"
    }
  },
  "best-mediterranean-beach-towns": {
    "Cinque Terre (Liguria, Italy)": {
      "src": "https://images.pexels.com/photos/30727629/pexels-photo-30727629.jpeg?auto=compress&cs=tinysrgb&w=1260",
      "credit": "Duc Tinh Ngo / Pexels",
      "creditUrl": "https://www.pexels.com/photo/30727629/"
    },
    "Dubrovnik (Dalmatia, Croatia)": {
      "src": "https://images.pexels.com/photos/15552995/pexels-photo-15552995.jpeg?auto=compress&cs=tinysrgb&w=1260",
      "credit": "Diego F. Parra / Pexels",
      "creditUrl": "https://www.pexels.com/photo/15552995/"
    },
    "Menton (Côte d'Azur, France)": {
      "src": "https://images.pexels.com/photos/32682886/pexels-photo-32682886.jpeg?auto=compress&cs=tinysrgb&w=1260",
      "credit": "Lara Farber / Pexels",
      "creditUrl": "https://www.pexels.com/photo/32682886/"
    }
  },
  "grateful-dead-songs": {
    "Ripple": {
      "src": "https://upload.wikimedia.org/wikipedia/en/6/6a/Grateful_Dead_-_American_Beauty.jpg",
      "credit": "American Beauty (1970) album cover",
      "creditUrl": "https://en.wikipedia.org/wiki/American_Beauty_(album)"
    },
    "Casey Jones": {
      "src": "https://upload.wikimedia.org/wikipedia/en/a/a1/Grateful_Dead_-_Workingman%27s_Dead.jpg",
      "credit": "Workingman's Dead (1970) album cover",
      "creditUrl": "https://en.wikipedia.org/wiki/Workingman%27s_Dead"
    },
    "Touch of Grey": {
      "src": "https://upload.wikimedia.org/wikipedia/en/b/bd/Grateful_Dead_-_In_the_Dark.jpg",
      "credit": "In the Dark (1987) album cover",
      "creditUrl": "https://en.wikipedia.org/wiki/In_the_Dark_(Grateful_Dead_album)"
    },
    "Truckin'": {
      "src": "https://upload.wikimedia.org/wikipedia/en/6/6a/Grateful_Dead_-_American_Beauty.jpg",
      "credit": "American Beauty (1970) album cover",
      "creditUrl": "https://en.wikipedia.org/wiki/American_Beauty_(album)"
    }
  },
  "grateful-dead-covers": {
    "Me and My Uncle (John Phillips)": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/7/7c/Grateful_Dead_10.9.94.jpg",
      "credit": "Grateful Dead in concert, 1994 / Wikimedia Commons",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:Grateful_Dead_10.9.94.jpg"
    },
    "I Know You Rider (Traditional)": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/9/93/Grateful_Dead_Arrowhead_Stadium_1978-07-01.jpg",
      "credit": "Grateful Dead at Arrowhead Stadium, 1978 / Wikimedia Commons",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:Grateful_Dead_Arrowhead_Stadium_1978-07-01.jpg"
    },
    "Not Fade Away (Buddy Holly)": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/b/b9/Grateful_Dead_%281970%29_%28high_quality%29.png",
      "credit": "Grateful Dead, 1970 / Wikimedia Commons",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:Grateful_Dead_(1970)_(high_quality).png"
    }
  },
  "beatles-songs": {
    "A Day in the Life": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/5/57/Sgt._Pepper%27s_Lonely_Hearts_Club_Band_album_art.jpg",
      "credit": "Sgt. Pepper's Lonely Hearts Club Band album art",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:Sgt._Pepper%27s_Lonely_Hearts_Club_Band_album_art.jpg"
    },
    "Strawberry Fields Forever": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/4/48/Magical_Mystery_Tour_US_Cover.jpeg",
      "credit": "Magical Mystery Tour album cover",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:Magical_Mystery_Tour_US_Cover.jpeg"
    },
    "Something": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/a/a4/The_Beatles_Abbey_Road_album_cover.jpg",
      "credit": "Abbey Road album cover",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:The_Beatles_Abbey_Road_album_cover.jpg"
    }
  },
  "largest-private-yachts": {
    "Eclipse (Roman Abramovich; $700M)": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/e/e3/Megayacht_Eclipse.jpg",
      "credit": "Superyacht Eclipse / Wikimedia Commons",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:Megayacht_Eclipse.jpg"
    },
    "Dilbar (Alisher Usmanov; $800M)": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/3/3f/Dilbar_yacht.jpg",
      "credit": "Superyacht Dilbar / Wikimedia Commons",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:Dilbar_yacht.jpg"
    },
    "Sailing Yacht A (Andrey Melnichenko; $600M)": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/e/ef/White_Pearl_A_Seite.JPG",
      "credit": "Sailing Yacht A, Kiel / Wikimedia Commons",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:White_Pearl_A_Seite.JPG"
    }
  },
  "most-expensive-homes-us": {
    "220 Central Park South Penthouse, Manhattan ($238M)": {
      "src": "https://www.lxcollection.com/wp-content/uploads/2020/09/220-Central-Park-South-1040x700.jpg",
      "credit": "LX Collection",
      "creditUrl": "https://www.lxcollection.com/condos/220-central-park-south/"
    },
    "2170-2340 Gordon Drive, Naples ($225M)": {
      "src": "https://www.naplesnews.com/gcdn/authoring/authoring-images/2024/02/08/PNDN/72522409007-dji-20231109124026-01722-d-edit.jpg?crop=3834,2157,x0,y358&width=1200&height=675&format=pjpg&auto=webp",
      "credit": "Naples Daily News",
      "creditUrl": "https://www.naplesnews.com/"
    },
    "Cliffside Estate, Malibu ($210M)": {
      "src": "https://californialuxuryhouses.net/wp-content/uploads/2024/06/Oakley-Mogul-Sells-210-Million-Malibu-Mansion-to-a-Mystery-Buyer-Setting-a-New-California-Real-Estate-Record-2.jpg",
      "credit": "California Luxury Houses",
      "creditUrl": "https://californialuxuryhouses.net/"
    }
  },
  "best-gins": {
    "Monkey 47 (Schwarzwald Dry)": {
      "src": "https://www.premierpub.co.uk/images/product/565/1/633x633-Monkey-47-gin-bottle.jpg",
      "credit": "Premier Pub & Bar",
      "creditUrl": "https://www.premierpub.co.uk"
    },
    "Nolet's Reserve (Modern Dutch)": {
      "src": "https://malibuliquorandwine.com/cdn/shop/products/noletsreserve_900x.png?v=1681930119",
      "credit": "Malibu Liquor & Wine",
      "creditUrl": "https://malibuliquorandwine.com"
    },
    "Sipsmith V.J.O.P. (London Dry)": {
      "src": "https://www.jebsenwinesandspirits.com/cdn/shop/products/sipsmith_vjop_bottle_shot_700_1800x1800.png?v=1645710081",
      "credit": "Jebsen Wines & Spirits",
      "creditUrl": "https://www.jebsenwinesandspirits.com"
    }
  },
  "best-whiskeys": {
    "George T. Stagg (Barrel-Proof Bourbon)": {
      "src": "https://flaviar.com/cdn/shop/files/assets_2FCatalog_2FBottles_2FBuffalo_20Trace_2FBourbon_2FGeorge_20T._20Stagg_20Straight_20Bourbon_20Whiskey_2F2024-George-T.-Stagg-Straight-Bourbon-Whiskey.png?v=1748430316",
      "credit": "Flaviar",
      "creditUrl": "https://flaviar.com"
    },
    "Michter's 20 Year (Kentucky Bourbon)": {
      "src": "https://www.mensjournal.com/.image/t_share/MjEwOTc2MDkzOTUwMTkxNDQx/michters-20-year-bourbon-bottle.png",
      "credit": "Men's Journal",
      "creditUrl": "https://www.mensjournal.com"
    },
    "Pappy Van Winkle 23 (Wheated Bourbon)": {
      "src": "https://smothbourbonliquor.com/wp-content/uploads/2025/07/1000012085.jpg",
      "credit": "Smoth Bourbon Liquor",
      "creditUrl": "https://smothbourbonliquor.com"
    }
  },
  "best-vodkas": {
    "Chopin Family Reserve (Polish Potato)": {
      "src": "https://www.totalwine.com/dynamic/x1000,sq/images/191377750/191377750-1-fr.png",
      "credit": "Total Wine & More",
      "creditUrl": "https://www.totalwine.com"
    },
    "Belvedere (Polish Rye)": {
      "src": "https://www.houseoftownend.com/Content/Images/Products/BELV005.png",
      "credit": "House of Townend",
      "creditUrl": "https://www.houseoftownend.com"
    },
    "Absolut Elyx (Swedish)": {
      "src": "https://www.totalwine.com/dynamic/x1000,sq/images/132661010/132661010-1-fr.png",
      "credit": "Total Wine & More",
      "creditUrl": "https://www.totalwine.com"
    },
    "Grey Goose (French Wheat)": {
      "src": "https://www.totalwine.com/dynamic/x1000,sq/images/18118175/18118175-1-fr.png",
      "credit": "Total Wine & More",
      "creditUrl": "https://www.totalwine.com"
    }
  },
  "best-tequilas": {
    "Tears of Llorona (Extra Añejo)": {
      "src": "https://www.wine.com/product/images/w_480,c_fit,q_auto:good,fl_progressive/msq3gxebbxnil4rfytxe.jpg",
      "credit": "Wine.com",
      "creditUrl": "https://www.wine.com"
    },
    "Clase Azul Ultra (Extra Añejo)": {
      "src": "https://www.houseofmalt.co.uk/wp-content/uploads/2024/01/Clase-Azul-Ultra-Extra-Anejo-Tequila-70cl.jpg",
      "credit": "House of Malt",
      "creditUrl": "https://www.houseofmalt.co.uk"
    },
    "Fortaleza Winter Blend (Añejo)": {
      "src": "https://raretequilas.com/cdn/shop/files/fortaleza-winter-blend-2025_1022x1022.jpg?v=1773797653",
      "credit": "Rare Tequilas",
      "creditUrl": "https://raretequilas.com"
    }
  },
  "best-scotches": {
    "Bowmore 21 (Islay Single Malt)": {
      "src": "https://img.thewhiskyexchange.com/900/bowob.21yo.jpg",
      "credit": "The Whisky Exchange",
      "creditUrl": "https://www.thewhiskyexchange.com"
    },
    "Highland Park 18 (Island Single Malt)": {
      "src": "https://www.rhumandwhisky.com/wp-content/uploads/2021/06/Highland_park_18-bottle-1024x1024.jpg",
      "credit": "Rhum & Whisky",
      "creditUrl": "https://www.rhumandwhisky.com"
    },
    "Glenmorangie Signet (Highland Single Malt)": {
      "src": "https://d2e83ge66y6hn.cloudfront.net/uploads/products/glenmorangie_signet.jpg",
      "credit": "Glenmorangie",
      "creditUrl": "https://www.glenmorangie.com"
    }
  },
  "highest-grossing-video-games": {
    "Dungeon Fighter Online ($22B)": {
      "src": "https://static.wikia.nocookie.net/dfo/images/2/2c/EGS_DungeonFighterOnline_NEOPLEInc_S1_2560x1440-2c7394fde0cf6d46650d44d2a0f141e3.jpg/revision/latest/scale-to-width-down/1200",
      "credit": "Neople / Nexon",
      "creditUrl": "https://www.dungeonfighteronline.com"
    },
    "Fortnite ($20B)": {
      "src": "https://cdn1.epicgames.com/offer/fn/FNECO_36-10_ForbiddenFruit_EGS_Launcher_KeyArt_Blade_2560x1440_2560x1440-abce17aa0386b48069aa42c1ebf7b864",
      "credit": "Epic Games",
      "creditUrl": "https://www.fortnite.com"
    },
    "Honor of Kings ($18.7B)": {
      "src": "https://www.honorofkings.com/img/share.jpg",
      "credit": "Tencent",
      "creditUrl": "https://www.honorofkings.com"
    }
  },
  "largest-yachts-american": {
    "Dragonfly (Sergey Brin; $450M)": {
      "src": "https://image.yachtbuyer.com/w1440/h560/qh/cs15-123-1944-754/m1/ow-1/ke5bff143/article/content/2845929/142m-lurssen-superyacht-dragonfly-everything-you-need-to-know-photo-1.jpg",
      "credit": "YachtBuyer",
      "creditUrl": "https://www.yachtbuyer.com/en-us/superyachts/dragonfly"
    },
    "Rising Sun (David Geffen; $400M)": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/1/12/Rising_Sun_%28yacht%29_2006.jpg",
      "credit": "Wikimedia Commons",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:Rising_Sun_(yacht)_2006.jpg"
    },
    "Koru (Jeff Bezos; $250M)": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/9/9f/Koru_Superyacht.jpg",
      "credit": "Wikimedia Commons",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:Koru_Superyacht.jpg"
    }
  },
  "dinner-hamptons": {
    "1770 House (East Hampton)": {
      "src": "https://www.thehotelguru.com/_images/c3/a9/c3a95665f124104d1c83f813e30f4a81/s1654x900.jpg",
      "credit": "The Hotel Guru",
      "creditUrl": "https://www.thehotelguru.com/hotels/usa/new-york/1770-house"
    },
    "Sant Ambroeus (East Hampton)": {
      "src": "https://behindthehedges.com/wp-content/uploads/2022/11/SA-East-Hampton_credit-Sant-Ambroeus_2-750x500.jpg",
      "credit": "Sant Ambroeus / Behind the Hedges",
      "creditUrl": "https://www.santambroeus.com/pages/location-east-hampton"
    },
    "Jean-Georges at Topping Rose House (Bridgehampton)": {
      "src": "https://res.cloudinary.com/traveltripperweb/image/upload/v1614768592/ispmgwrylax2ix625zle.jpg",
      "credit": "Topping Rose House",
      "creditUrl": "https://www.toppingrosehouse.com/"
    }
  },
  "lunch-hamptons": {
    "The Lobster Roll (Amagansett)": {
      "src": "https://popmenucloud.com/cdn-cgi/image/width=1200,height=630,format=auto,fit=cover/urhdfbwy/4ac2e787-c2bf-41e0-be6a-7c19847c2732.jpeg",
      "credit": "The Lobster Roll",
      "creditUrl": "https://www.lobsterroll.com/"
    },
    "Bostwick's Chowder House (East Hampton)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_3840,ar_16:9,g_center,f_auto/images/BostwicksChowderHouse_HotLobsterRoll_AlexStaniloff_NYC-3_yradqg",
      "credit": "Alex Staniloff / The Infatuation",
      "creditUrl": "https://www.theinfatuation.com/new-york/reviews/bostwicks-chowder-house"
    },
    "The Clam Bar (Amagansett)": {
      "src": "https://247wallst.com/wp-content/uploads/2022/07/Clam-Bar-at-Napeague-.jpeg",
      "credit": "24/7 Wall St.",
      "creditUrl": "https://clambarhamptons.com/"
    }
  },
  "highest-grossing-console-video-games": {
    "Fortnite ($20B)": {
      "src": "https://cdn1.epicgames.com/offer/fn/FNECO_36-10_ForbiddenFruit_EGS_Launcher_KeyArt_Blade_2560x1440_2560x1440-abce17aa0386b48069aa42c1ebf7b864",
      "credit": "Epic Games",
      "creditUrl": "https://www.fortnite.com"
    },
    "PUBG: Battlegrounds ($17.8B)": {
      "src": "https://wstatic-prod.pubg.com/web/live/static/og/img-og-pubg.jpg",
      "credit": "Krafton",
      "creditUrl": "https://pubg.com"
    },
    "Grand Theft Auto V ($8.5B)": {
      "src": "https://cdn.cloudflare.steamstatic.com/steam/apps/271590/library_hero.jpg",
      "credit": "Rockstar Games",
      "creditUrl": "https://www.rockstargames.com/gta-v"
    }
  },
  "cocktails-lisbon": {
    "Imprensa Cocktail and Oyster Bar (Príncipe Real)": {
      "src": "https://roadbook.com/wp-content/uploads/2023/06/IMPRENSA.jpg",
      "credit": "Roadbook",
      "creditUrl": "https://roadbook.com/lisbon/city-guide/best-bars-lisbon/"
    },
    "Toca da Raposa (Chiado)": {
      "src": "https://roadbook.com/wp-content/uploads/2023/06/unnamed-1.jpg",
      "credit": "Roadbook",
      "creditUrl": "https://roadbook.com/lisbon/city-guide/best-bars-lisbon/"
    },
    "Red Frog (Avenida da Liberdade)": {
      "src": "https://roadbook.com/wp-content/uploads/2023/06/RED-FROG.jpg",
      "credit": "Roadbook",
      "creditUrl": "https://roadbook.com/lisbon/city-guide/best-bars-lisbon/"
    }
  },
  "hotels-monaco": {
    "Hôtel de Paris Monte-Carlo": {
      "src": "https://asset.montecarlosbm.com/styles/hero_image_desktop/s3/media/orphea/hotel-de-paris-monte-carlo-facade-de-jour-2024-013_1.jpg.jpeg",
      "credit": "Monte-Carlo Société des Bains de Mer",
      "creditUrl": "https://www.montecarlosbm.com/en/hotel-monaco/hotel-paris-monte-carlo"
    },
    "Monte-Carlo Bay Hotel & Resort": {
      "src": "https://asset.montecarlosbm.com/styles/hero_image_desktop/s3/media/orphea/hotel-monte-carlo-bay-monaco-4-etoiles-exterior_view_2022_0037_5.jpeg",
      "credit": "Monte-Carlo Société des Bains de Mer",
      "creditUrl": "https://www.montecarlosbm.com/en/hotel-monaco/monte-carlo-bay-hotel-resort"
    },
    "Hôtel Hermitage Monte-Carlo": {
      "src": "https://asset.montecarlosbm.com/styles/hero_image_desktop/s3/media/orphea/hotel-hermitage-monaco-palace-5-etoiles-facade_2018_0003_0.jpg.jpeg",
      "credit": "Monte-Carlo Société des Bains de Mer",
      "creditUrl": "https://www.montecarlosbm.com/en/hotel-monaco/hotel-hermitage-monte-carlo"
    }
  },
  "john-hughes-movies": {
    "Ferris Bueller's Day Off (1986)": {
      "src": "https://image.tmdb.org/t/p/original/lU0v9ULZJ9A5145nLGUF8ZNZnPj.jpg",
      "credit": "TMDB",
      "creditUrl": "https://www.themoviedb.org/movie/9377-ferris-bueller-s-day-off"
    },
    "The Breakfast Club (1985)": {
      "src": "https://image.tmdb.org/t/p/original/kjVgUMsG0PKBXzlP8HGNQpWDxAX.jpg",
      "credit": "TMDB",
      "creditUrl": "https://www.themoviedb.org/movie/2108-the-breakfast-club"
    },
    "Home Alone (1990)": {
      "src": "https://image.tmdb.org/t/p/original/ih2xVgeMS8R5WUetYE8Mr9hVTlB.jpg",
      "credit": "TMDB",
      "creditUrl": "https://www.themoviedb.org/movie/771-home-alone"
    }
  },
  "chewing-gum-brands": {
    "Extra": {
      "src": "https://m.media-amazon.com/images/I/61G537GgmPL._SL1000_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B001NI0MQ0?tag=cgurus-20"
    },
    "Orbit": {
      "src": "https://m.media-amazon.com/images/I/61txxBrqeTL._SL1000_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B00008RCN8?tag=cgurus-20"
    },
    "Trident": {
      "src": "https://m.media-amazon.com/images/I/71GDlRAqlpL._SL1500_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B071FC8VPH?tag=cgurus-20"
    }
  },
  "worst-value-higher-education": {
    "Bennington College (VT)": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/5/5c/BennSC_80_AG441_se_dusk_v3.jpg",
      "credit": "TBAWinter58 · Wikimedia Commons (CC BY-SA 4.0)",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:BennSC_80_AG441_se_dusk_v3.jpg"
    },
    "Hampshire College (Amherst, MA)": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/The_R.W._Kern_Center_at_Hampshire_College_in_Amherst%2C_Massachusetts%2C_by_Carol_M._Highsmith%2C_2019%2C_from_the_Library_of_Congress_-_master-pnp-highsm-57600-57694a.tif/lossy-page1-1920px-thumbnail.tif.jpg",
      "credit": "Carol M. Highsmith · Library of Congress",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:The_R.W._Kern_Center_at_Hampshire_College_in_Amherst,_Massachusetts,_by_Carol_M._Highsmith,_2019,_from_the_Library_of_Congress_-_master-pnp-highsm-57600-57694a.tif"
    },
    "The New School (New York, NY)": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/14th_St_5th_Av_td_%282018-03-22%29_06_-_The_New_School_University_Center.jpg/1920px-14th_St_5th_Av_td_%282018-03-22%29_06_-_The_New_School_University_Center.jpg",
      "credit": "Tdorante10 · Wikimedia Commons (CC BY-SA 4.0)",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:14th_St_5th_Av_td_(2018-03-22)_06_-_The_New_School_University_Center.jpg"
    }
  },
  "spy-novels": {
    "Tinker, Tailor, Soldier, Spy (John le Carré)": {
      "src": "https://m.media-amazon.com/images/I/71zlDam41sL._SL1500_.jpg",
      "credit": "Penguin Books",
      "creditUrl": "https://www.amazon.com/dp/B004RKXNDU?tag=cgurus-20"
    },
    "The Day of the Jackal (Frederick Forsyth)": {
      "src": "https://m.media-amazon.com/images/I/71l3p0Ei-AL._SL1500_.jpg",
      "credit": "Penguin Random House",
      "creditUrl": "https://www.amazon.com/dp/B0081KZ20E?tag=cgurus-20"
    },
    "Slough House (Mick Herron)": {
      "src": "https://m.media-amazon.com/images/I/81QsOpNJL+L._SL1500_.jpg",
      "credit": "Soho Crime",
      "creditUrl": "https://www.amazon.com/dp/B088F1B72Y?tag=cgurus-20"
    }
  },
  "best-college-football-teams": {
    "1971 Nebraska Cornhuskers": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/9/9f/THE_ANNUAL_SPRING_FOOTBALL_GAME_AT_THE_UNIVERSITY_OF_NEBRASKA_IS_A_STADIUM-PACKING_EVENT._THIS_IS_AN_INTRA-MURAL_GAME..._-_NARA_-_547442.jpg",
      "credit": "U.S. National Archives / DOCUMERICA",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:THE_ANNUAL_SPRING_FOOTBALL_GAME_AT_THE_UNIVERSITY_OF_NEBRASKA_IS_A_STADIUM-PACKING_EVENT._THIS_IS_AN_INTRA-MURAL_GAME..._-_NARA_-_547442.jpg"
    },
    "2001 Miami Hurricanes": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/3/31/Miami_Orange_Bowl_%28Super_Bowl_V%29.jpg",
      "credit": "Miami Orange Bowl · Wikimedia Commons",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:Miami_Orange_Bowl_(Super_Bowl_V).jpg"
    },
    "1995 Nebraska Cornhuskers": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/5/55/Memorial_Stadium%2C_Home_of_the_University_of_Nebraska_Cornhuskers%2C_Lincoln%2C_Nebraska_%2869182817%29.jpg",
      "credit": "Ken Lund / Wikimedia Commons",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:Memorial_Stadium,_Home_of_the_University_of_Nebraska_Cornhuskers,_Lincoln,_Nebraska_(69182817).jpg"
    },
    "2019 LSU Tigers": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/e/ee/2020-0113-ClydeEdwards-Helaire.jpg",
      "credit": "Bobak Ha'Eri · Wikimedia Commons (CC BY 3.0)",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:2020-0113-ClydeEdwards-Helaire.jpg"
    }
  },
  "bottled-cold-brew": {
    "Stumptown Cold Brew Concentrate": {
      "src": "https://m.media-amazon.com/images/I/51JvEkeYH7L._SL1080_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B08RRFHJDZ?tag=cgurus-20"
    },
    "Stok Bold & Smooth Un-Sweet Black Cold Brew": {
      "src": "https://m.media-amazon.com/images/I/71ehq6ABwcL._SL1500_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B01EN6KSCQ?tag=cgurus-20"
    },
    "Califia Farms Pure Black Cold Brew Coffee": {
      "src": "https://m.media-amazon.com/images/I/71WcYg+2AOL._SL1500_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B078LG2SS6?tag=cgurus-20"
    }
  },
  "bottled-water-still": {
    "Mountain Valley Spring Water": {
      "src": "https://www.mountainvalleyspring.com/cdn/shop/files/1-Hero.jpg",
      "credit": "Mountain Valley Spring Water",
      "creditUrl": "https://www.mountainvalleyspring.com/products/333-ml-spring-water"
    },
    "Voss": {
      "src": "https://m.media-amazon.com/images/I/31j-GtUD7WL._SL1500_.jpg",
      "credit": "VOSS",
      "creditUrl": "https://www.amazon.com/dp/B004VCT1P8"
    },
    "Smeraldina": {
      "src": "https://m.media-amazon.com/images/I/31ZmGvsYNwL._SL1500_.jpg",
      "credit": "Smeraldina",
      "creditUrl": "https://www.amazon.com/dp/B0H12WYGRR"
    }
  },
  "best-chain-pizza-restaurants": {
    "Domino's": {
      "src": "https://media.dominos.com/content/images/menu_hand-tossed-pizza_2024_04.jpg",
      "credit": "Domino's",
      "creditUrl": "https://www.dominos.com"
    },
    "Jet's Pizza": {
      "src": "https://www.jetspizza.com/wp-content/uploads/2022/03/8corner-withlogo-01-01-01-01.jpg",
      "credit": "Jet's Pizza",
      "creditUrl": "https://www.jetspizza.com/corner-crunch/"
    },
    "California Pizza Kitchen": {
      "src": "https://laparent.com/wp-content/uploads/2017/10/The-Original-BBQ-Chicken-Pizza_August-2016-Square.jpg",
      "credit": "California Pizza Kitchen",
      "creditUrl": "https://www.cpk.com"
    }
  },
  "best-true-crime-podcasts": {
    "Serial": {
      "src": "https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/9a/fb/87/9afb8760-0e05-2b3e-24a2-7e14cce74570/mza_14816055607064169808.jpg/1200x1200bb.jpg",
      "credit": "Serial Productions / The New York Times",
      "creditUrl": "https://serialpodcast.org/"
    },
    "Bear Brook": {
      "src": "https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/a5/fe/98/a5fe9817-5b2d-aad9-46f6-fb130a2a4570/mza_6952306081654209574.jpg/1200x1200bb.jpg",
      "credit": "NHPR · Bear Brook",
      "creditUrl": "https://www.bearbrookpodcast.com/"
    },
    "Your Own Backyard": {
      "src": "https://is1-ssl.mzstatic.com/image/thumb/Podcasts211/v4/90/24/36/90243638-a0ce-1268-2c4e-c34761253812/mza_17261943949558976257.jpg/1200x1200bb.jpg",
      "credit": "Your Own Backyard · Chris Lambert",
      "creditUrl": "https://www.yourownbackyardpodcast.com/"
    }
  },
  "instant-ramen-cups": {
    "Nissin Cup Noodles (Original)": {
      "src": "https://m.media-amazon.com/images/I/718XPfv33SL._SL1500_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B08BQ2759B"
    },
    "Snapdragon Tonkotsu Ramen Cup": {
      "src": "https://m.media-amazon.com/images/I/71GPdOEMQEL._SL1500_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B08MV43NCZ"
    },
    "Maruchan Instant Lunch (Beef)": {
      "src": "https://m.media-amazon.com/images/I/51NPBfmwbHL._SL1500_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B003OB69PC"
    }
  },
  "best-nfl-teams": {
    "1972 Miami Dolphins": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/e/e5/28_-_Perfection%2C_The_17-0_1972_Dolphins_%282023%29.jpg",
      "credit": "Pro Football Hall of Fame · Wikimedia Commons",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:28_-_Perfection,_The_17-0_1972_Dolphins_(2023).jpg"
    },
    "1985 Chicago Bears": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/4/4c/Soldier_Field_during_Chicago_Bears_home_game_against_the_San_Francisco_49ers_on_October_29%2C_2006.jpg",
      "credit": "Soldier Field · Wikimedia Commons",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:Soldier_Field_during_Chicago_Bears_home_game_against_the_San_Francisco_49ers_on_October_29,_2006.jpg"
    },
    "1978 Pittsburgh Steelers": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/f/fb/Three_Rivers_Stadium_aerial_view_1996.jpg",
      "credit": "Paul M. Walsh · Wikimedia Commons",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:Three_Rivers_Stadium_aerial_view_1996.jpg"
    }
  },
  "strategy-board-games": {
    "Ark Nova": {
      "src": "https://m.media-amazon.com/images/I/61le3F8zYOL._AC_SL1300_.jpg",
      "credit": "Capstone Games",
      "creditUrl": "https://www.amazon.com/dp/B09L6FCP9S?tag=cgurus-20"
    },
    "Brass: Birmingham": {
      "src": "https://m.media-amazon.com/images/I/81KHlGQgqCL._AC_SL1500_.jpg",
      "credit": "Roxley Games",
      "creditUrl": "https://www.amazon.com/dp/1988884047?tag=cgurus-20"
    },
    "Gloomhaven": {
      "src": "https://m.media-amazon.com/images/I/71k-+e3xYyL._AC_SL1500_.jpg",
      "credit": "Cephalofair Games",
      "creditUrl": "https://www.amazon.com/dp/B0FP5R1KSJ?tag=cgurus-20"
    },
    "Catan": {
      "src": "https://m.media-amazon.com/images/I/71AbDpYEkgL._AC_SL1500_.jpg",
      "credit": "Catan Studio",
      "creditUrl": "https://www.amazon.com/dp/B0DYK1ZH2D?tag=cgurus-20"
    }
  },
  "best-board-games-for-adults": {
    "Twilight Imperium: Fourth Edition": {
      "src": "https://m.media-amazon.com/images/I/81YPN9RjRhL._AC_SL1500_.jpg",
      "credit": "Fantasy Flight Games",
      "creditUrl": "https://www.amazon.com/dp/B074YPSTRP?tag=cgurus-20"
    },
    "Harmonies": {
      "src": "https://m.media-amazon.com/images/I/81HaLmsD5kL._AC_SL1500_.jpg",
      "credit": "Libellud",
      "creditUrl": "https://www.amazon.com/dp/B0CVNPHPZY?tag=cgurus-20"
    },
    "Ticket to Ride": {
      "src": "https://m.media-amazon.com/images/I/91YNJM4oyhL._AC_SL1500_.jpg",
      "credit": "Days of Wonder",
      "creditUrl": "https://www.amazon.com/dp/0975277324?tag=cgurus-20"
    }
  },
  "lobster-rolls-boston": {
    "James Hook & Co (Downtown)": {
      "src": "https://jameshooklobster.com/wp-content/uploads/2024/11/slide-2-lobster-roll-1-e1754511578422.png",
      "credit": "James Hook & Co",
      "creditUrl": "https://jameshooklobster.com/"
    },
    "Neptune Oyster (North End)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_3840,ar_4:3,g_center,f_auto/cms/guides/the-lobster-roll-power-rankings/NatalieSchaefer_NeptuneOyster_LobsterRoll_2520_25281_2529",
      "credit": "Natalie Schaefer / The Infatuation",
      "creditUrl": "https://www.theinfatuation.com/boston/reviews/neptune-oyster"
    },
    "Alive & Kicking Lobsters (Cambridge)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_3840,ar_4:3,g_center,f_auto/cms/guides/best-lobster-rolls-in-boston/tina-_alive__kickin_edit",
      "credit": "The Infatuation",
      "creditUrl": "https://www.theinfatuation.com/boston/reviews/alive-kicking-lobsters"
    }
  },
  "lobster-rolls-maine": {
    "Bite Into Maine (Cape Elizabeth)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_3840,ar_4:3,g_center,f_auto/images/PortlandME_BiteIntoMaine_LobsterRoll_CarloMantuano_iPhoneContent_EDIT_01_q5yj2j",
      "credit": "Carlo Mantuano / The Infatuation",
      "creditUrl": "https://www.theinfatuation.com/portland-me/reviews/bite-into-maine"
    },
    "Five Islands Lobster Co (Georgetown)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_3840,ar_4:3,g_center,f_auto/images/fiveislandlobster-11_ogzgaz",
      "credit": "Anne Cruz / The Infatuation",
      "creditUrl": "https://www.theinfatuation.com/all/reviews/five-islands-lobster-co-georgetown-maine"
    },
    "McLoons Lobster Shack (South Thomaston)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_3840,ar_4:3,g_center,f_auto/images/McLoon_s1_gzoiuh",
      "credit": "Anne Cruz / The Infatuation",
      "creditUrl": "https://www.theinfatuation.com/all/reviews/mc-loons-lobster-shack-south-thomaston-maine"
    }
  },
  "best-nba-teams": {
    "1995-96 Chicago Bulls": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/0/07/United_Center_and_Surrounding_Neighborhood%2C_Chicago%2C_Illinois_%2814024028380%29.jpg",
      "credit": "United Center (interim) · Wikimedia Commons",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:United_Center_and_Surrounding_Neighborhood,_Chicago,_Illinois_(14024028380).jpg"
    },
    "1985-86 Boston Celtics": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/3/34/TD_Garden.JPG",
      "credit": "TD Garden, successor to Boston Garden (interim) · Wikimedia Commons",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:TD_Garden.JPG"
    },
    "1971-72 Los Angeles Lakers": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/a/a5/Forum_Inglewood.JPG",
      "credit": "The Forum, Inglewood (interim) · Wikimedia Commons",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:Forum_Inglewood.JPG"
    }
  },
  "best-mlb-teams": {
    "1939 New York Yankees": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/4/49/Yankee_Stadium_from_Coogan%27s_Bluff.JPG",
      "credit": "Original Yankee Stadium from Coogan's Bluff (interim) · Wikimedia Commons",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:Yankee_Stadium_from_Coogan%27s_Bluff.JPG"
    },
    "1998 New York Yankees": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/2/25/New_Yankee_Stadium.JPG",
      "credit": "Yankee Stadium exterior (interim) · Wikimedia Commons",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:New_Yankee_Stadium.JPG"
    },
    "1927 New York Yankees": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/5/50/Yankee_Stadium%2C_4-3-23_LCCN2014715834.jpg",
      "credit": "Original Yankee Stadium, April 3 1923 · Library of Congress / Wikimedia Commons",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:Yankee_Stadium,_4-3-23_LCCN2014715834.jpg"
    }
  },
  "best-college-basketball-teams": {
    "1971-72 UCLA Bruins": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/0/03/Pauley_Pavilion%2C_exterior.JPG",
      "credit": "Pauley Pavilion exterior (interim) · Wikimedia Commons",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:Pauley_Pavilion,_exterior.JPG"
    },
    "1966-67 UCLA Bruins": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/9/96/Pauley_Pavilion_2013.JPG",
      "credit": "Pauley Pavilion, 2013 (interim) · Wikimedia Commons",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:Pauley_Pavilion_2013.JPG"
    },
    "1991-92 Duke Blue Devils": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/0/0a/Cameron_Indoor_Stadium_north_entrance_%287792868%29.jpg",
      "credit": "Cameron Indoor Stadium north entrance (interim) · Wikimedia Commons",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:Cameron_Indoor_Stadium_north_entrance_(7792868).jpg"
    }
  },
  "standup-specials-netflix": {
    "Bo Burnham: Inside": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/9/98/Bo_Burnham_at_the_Montclair_Film_Festival_2018_12.jpg",
      "credit": "Montclair Film / Wikimedia Commons",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:Bo_Burnham_at_the_Montclair_Film_Festival_2018_12.jpg"
    },
    "Richard Pryor: Live in Concert": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/f/fb/Richard_Pryor_at_SJSU_1974.jpg",
      "credit": "Barbara Harrison / Wikimedia Commons",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:Richard_Pryor_at_SJSU_1974.jpg"
    },
    "Bo Burnham: Make Happy": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/2/21/Bo_Burnham_at_the_Montclair_Film_Festival_2018_07.jpg",
      "credit": "Montclair Film / Wikimedia Commons",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:Bo_Burnham_at_the_Montclair_Film_Festival_2018_07.jpg"
    },
    "Hannah Gadsby: Nanette": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/e/e2/Hannah-Gadsby-at-the-2024-Edinburgh-Festival-Fringe-3.jpg",
      "credit": "Bryan Berlin / Wikimedia Commons",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:Hannah-Gadsby-at-the-2024-Edinburgh-Festival-Fringe-3.jpg"
    },
    "Tig Notaro: Happy to Be Here": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/c/c2/Tig_Notaro_Sasquatch_2013.jpg",
      "credit": "Whomstweekly / Wikimedia Commons",
      "creditUrl": "https://commons.wikimedia.org/wiki/File:Tig_Notaro_Sasquatch_2013.jpg"
    }
  },
  "best-selling-soundtracks-all-time": {
    "The Bodyguard (1992)": {
      "src": "https://upload.wikimedia.org/wikipedia/en/0/03/Whitney_Houston_-_The_Bodyguard.png",
      "credit": "Arista Records",
      "creditUrl": "https://en.wikipedia.org/wiki/The_Bodyguard_(soundtrack)"
    },
    "Saturday Night Fever (1977)": {
      "src": "https://upload.wikimedia.org/wikipedia/en/0/0c/TheBeeGeesSaturdayNightFeveralbumcover.jpg",
      "credit": "RSO Records",
      "creditUrl": "https://en.wikipedia.org/wiki/Saturday_Night_Fever_(soundtrack)"
    },
    "Dirty Dancing (1987)": {
      "src": "https://upload.wikimedia.org/wikipedia/en/1/13/Drtydancingsoundtrack.jpg",
      "credit": "RCA Records",
      "creditUrl": "https://en.wikipedia.org/wiki/Dirty_Dancing_(soundtrack)"
    }
  },
  "best-selling-albums-all-time": {
    "Thriller (Michael Jackson, 1982, 70M)": {
      "src": "https://upload.wikimedia.org/wikipedia/en/5/55/Michael_Jackson_-_Thriller.png",
      "credit": "Cover art / Epic Records",
      "creditUrl": "https://en.wikipedia.org/wiki/Thriller_(album)"
    },
    "Back in Black (AC/DC, 1980, 50M)": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/9/92/ACDC_Back_in_Black.png",
      "credit": "Cover art / Atlantic Records",
      "creditUrl": "https://en.wikipedia.org/wiki/Back_in_Black"
    },
    "The Bodyguard (Whitney Houston, 1992, 45M)": {
      "src": "https://upload.wikimedia.org/wikipedia/en/0/03/Whitney_Houston_-_The_Bodyguard.png",
      "credit": "Cover art / Arista Records",
      "creditUrl": "https://en.wikipedia.org/wiki/The_Bodyguard_(soundtrack)"
    },
    "The Dark Side of the Moon (Pink Floyd, 1973, 45M)": {
      "src": "https://upload.wikimedia.org/wikipedia/en/3/3b/Dark_Side_of_the_Moon.png",
      "credit": "Cover art / Harvest Records",
      "creditUrl": "https://en.wikipedia.org/wiki/The_Dark_Side_of_the_Moon"
    },
    "Their Greatest Hits 1971-1975 (Eagles, 1976, 44M)": {
      "src": "https://upload.wikimedia.org/wikipedia/en/0/00/Eagles_-_Their_Greatest_Hits_%281971-1975%29.jpg",
      "credit": "Cover art / Asylum Records",
      "creditUrl": "https://en.wikipedia.org/wiki/Their_Greatest_Hits_(1971%E2%80%931975)"
    },
    "Hotel California (Eagles, 1976, 42M)": {
      "src": "https://upload.wikimedia.org/wikipedia/en/4/49/Hotelcalifornia.jpg",
      "credit": "Cover art / Asylum Records",
      "creditUrl": "https://en.wikipedia.org/wiki/Hotel_California_(Eagles_album)"
    },
    "Come On Over (Shania Twain, 1997, 40M)": {
      "src": "https://upload.wikimedia.org/wikipedia/en/0/0b/ShaniaTwainComeOnOver.png",
      "credit": "Cover art / Mercury Nashville",
      "creditUrl": "https://en.wikipedia.org/wiki/Come_On_Over_(Shania_Twain_album)"
    },
    "Rumours (Fleetwood Mac, 1977, 40M)": {
      "src": "https://upload.wikimedia.org/wikipedia/en/f/fb/FMacRumours.PNG",
      "credit": "Cover art / Warner Bros. Records",
      "creditUrl": "https://en.wikipedia.org/wiki/Rumours_(album)"
    },
    "Bat Out of Hell (Meat Loaf, 1977, 40M)": {
      "src": "https://upload.wikimedia.org/wikipedia/en/0/00/Bat_out_of_Hell.jpg",
      "credit": "Cover art / Cleveland International / Epic",
      "creditUrl": "https://en.wikipedia.org/wiki/Bat_Out_of_Hell"
    },
    "Saturday Night Fever (Bee Gees, 1977, 40M)": {
      "src": "https://upload.wikimedia.org/wikipedia/en/0/0c/TheBeeGeesSaturdayNightFeveralbumcover.jpg",
      "credit": "Cover art / RSO Records",
      "creditUrl": "https://en.wikipedia.org/wiki/Saturday_Night_Fever_(soundtrack)"
    },
    "Led Zeppelin IV (Led Zeppelin, 1971, 37M)": {
      "src": "https://upload.wikimedia.org/wikipedia/commons/f/fa/Zeppelin_IV.jpg",
      "credit": "Cover art / Atlantic Records",
      "creditUrl": "https://en.wikipedia.org/wiki/Led_Zeppelin_IV"
    },
    "Bad (Michael Jackson, 1987, 35M)": {
      "src": "https://upload.wikimedia.org/wikipedia/en/5/51/Michael_Jackson_-_Bad.png",
      "credit": "Cover art / Epic Records",
      "creditUrl": "https://en.wikipedia.org/wiki/Bad_(album)"
    },
    "Jagged Little Pill (Alanis Morissette, 1995, 33M)": {
      "src": "https://upload.wikimedia.org/wikipedia/en/4/47/Alanis_Morissette_-_Jagged_Little_Pill.jpg",
      "credit": "Cover art / Maverick / Reprise",
      "creditUrl": "https://en.wikipedia.org/wiki/Jagged_Little_Pill"
    },
    "Dirty Dancing (Various Artists, 1987, 32M)": {
      "src": "https://upload.wikimedia.org/wikipedia/en/1/13/Drtydancingsoundtrack.jpg",
      "credit": "Cover art / RCA Records",
      "creditUrl": "https://en.wikipedia.org/wiki/Dirty_Dancing_(soundtrack)"
    },
    "Falling Into You (Celine Dion, 1996, 32M)": {
      "src": "https://upload.wikimedia.org/wikipedia/en/c/c2/Falling_into_You.png",
      "credit": "Cover art / Columbia / Epic",
      "creditUrl": "https://en.wikipedia.org/wiki/Falling_into_You"
    },
    "Dangerous (Michael Jackson, 1991, 32M)": {
      "src": "https://upload.wikimedia.org/wikipedia/en/1/11/Michaeljacksondangerous.jpg",
      "credit": "Cover art / Epic Records",
      "creditUrl": "https://en.wikipedia.org/wiki/Dangerous_(Michael_Jackson_album)"
    },
    "21 (Adele, 2011, 31M)": {
      "src": "https://upload.wikimedia.org/wikipedia/en/1/1b/Adele_-_21.png",
      "credit": "Cover art / XL Recordings / Columbia",
      "creditUrl": "https://en.wikipedia.org/wiki/21_(Adele_album)"
    },
    "1 (The Beatles, 2000, 31M)": {
      "src": "https://upload.wikimedia.org/wikipedia/en/b/be/The_Beatles_1_album_cover.jpg",
      "credit": "Cover art / Apple Records",
      "creditUrl": "https://en.wikipedia.org/wiki/1_(Beatles_album)"
    },
    "Metallica (Metallica, 1991, 31M)": {
      "src": "https://upload.wikimedia.org/wikipedia/en/2/2c/Metallica_-_Metallica_cover.jpg",
      "credit": "Cover art / Elektra Records",
      "creditUrl": "https://en.wikipedia.org/wiki/Metallica_(album)"
    },
    "Let's Talk About Love (Celine Dion, 1997, 31M)": {
      "src": "https://upload.wikimedia.org/wikipedia/en/4/48/Lets_talk_about_love.jpg",
      "credit": "Cover art / Columbia / Epic",
      "creditUrl": "https://en.wikipedia.org/wiki/Let%27s_Talk_About_Love"
    },
    "The Wall (Pink Floyd, 1979, 30M)": {
      "src": "https://upload.wikimedia.org/wikipedia/en/1/13/PinkFloydWallCoverOriginalNoText.jpg",
      "credit": "Cover art / Harvest / Columbia",
      "creditUrl": "https://en.wikipedia.org/wiki/The_Wall"
    },
    "Brothers in Arms (Dire Straits, 1985, 30M)": {
      "src": "https://upload.wikimedia.org/wikipedia/en/6/67/DS_Brothers_in_Arms.jpg",
      "credit": "Cover art / Vertigo / Warner Bros.",
      "creditUrl": "https://en.wikipedia.org/wiki/Brothers_in_Arms_(Dire_Straits_album)"
    },
    "Appetite for Destruction (Guns N' Roses, 1987, 30M)": {
      "src": "https://upload.wikimedia.org/wikipedia/en/6/60/GunsnRosesAppetiteforDestructionalbumcover.jpg",
      "credit": "Cover art / Geffen Records",
      "creditUrl": "https://en.wikipedia.org/wiki/Appetite_for_Destruction"
    },
    "Born in the U.S.A. (Bruce Springsteen, 1984, 30M)": {
      "src": "https://upload.wikimedia.org/wikipedia/en/3/31/BruceBorn1984.JPG",
      "credit": "Cover art / Columbia Records",
      "creditUrl": "https://en.wikipedia.org/wiki/Born_in_the_U.S.A."
    },
    "Legend (Bob Marley & The Wailers, 1984, 28M)": {
      "src": "https://upload.wikimedia.org/wikipedia/en/c/c2/BobMarley-Legend.jpg",
      "credit": "Cover art / Island Records",
      "creditUrl": "https://en.wikipedia.org/wiki/Legend_(Bob_Marley_and_the_Wailers_album)"
    }
  },
  "two-player-board-games-couples": {
    "Sky Team": {
      "src": "https://m.media-amazon.com/images/I/71Kp7sgYcjL._AC_SL1500_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B0CHD8RCSJ?tag=cgurus-20"
    },
    "7 Wonders Duel": {
      "src": "https://m.media-amazon.com/images/I/81YwMWy3ttS._AC_SL1500_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B014DMSTXK?tag=cgurus-20"
    },
    "Patchwork": {
      "src": "https://m.media-amazon.com/images/I/81nF-srxKeS._AC_SL1500_.jpg",
      "credit": "Amazon",
      "creditUrl": "https://www.amazon.com/dp/B08P72V7DZ?tag=cgurus-20"
    }
  },
  "best-restaurants-nyc": {
    "Yamada (Chinatown)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_1280,ar_4:3,g_center,f_auto/images/Yamada_Hassun_2_ecrnnd",
      "credit": "The Infatuation",
      "creditUrl": "https://www.theinfatuation.com/new-york/reviews/yamada"
    },
    "Meju (Long Island City)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_1280,ar_4:3,g_center,f_auto/images/NYC_Meju_Group_AlexStaniloff-3_aqsihh",
      "credit": "The Infatuation · Alex Staniloff",
      "creditUrl": "https://www.theinfatuation.com/new-york/reviews/meju"
    },
    "Kabawa (East Village)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_1280,ar_4:3,g_center,f_auto/images/MDR_Group_Shot_1_AJB_1_fzrkiy",
      "credit": "The Infatuation",
      "creditUrl": "https://www.theinfatuation.com/new-york/reviews/kabawa"
    }
  },
  "best-restaurants-london": {
    "Bouchon Racine (Farringdon)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_1280,ar_4:3,g_center,f_auto/images/Bouchon_Racine_Group_Aleksandra_Boruch_London3_wepyle",
      "credit": "The Infatuation · Aleksandra Boruch",
      "creditUrl": "https://www.theinfatuation.com/london/reviews/bouchon-racine"
    },
    "Akoko (Fitzrovia)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_1280,ar_4:3,g_center,f_auto/Akoko_Interior_AleksandraBoruch_London-25_d8jnoz",
      "credit": "The Infatuation · Aleksandra Boruch",
      "creditUrl": "https://www.theinfatuation.com/london/reviews/akoko"
    },
    "Trinity (Clapham)": {
      "src": "https://trinityrestaurant.co.uk/wp-content/uploads/2024/12/0C4A0381crop-scaled.jpg",
      "credit": "Trinity Restaurant",
      "creditUrl": "https://trinityrestaurant.co.uk"
    }
  },
  "best-restaurants-paris": {
    "Vaisseau (Charonne, 20th Arr.)": {
      "src": "https://media.timeout.com/images/106071143/750/422/image.jpg",
      "credit": "Time Out Paris",
      "creditUrl": "https://www.timeout.com/paris/en/restaurants/best-restaurants-in-paris"
    },
    "Plénitude (1st Arr.)": {
      "src": "https://images.prismic.io/lvmh-chevalblanc/Z9f5HTiBA97GiiwI_WebRGB-ChevalBlancParis_Ple%CC%81nitude_Salle_VincentLeroux-1.jpg?w=1600&fit=max",
      "credit": "Cheval Blanc Paris · Vincent Leroux",
      "creditUrl": "https://www.chevalblanc.com/en/maison/paris/restaurants-and-bars/plenitude/"
    },
    "Pochana (11th Arr.)": {
      "src": "https://ams3.digitaloceanspaces.com/tmi-images/pocha__849/hero_img/BZXnk35ou7viuf7k5.jpg",
      "credit": "Restaurant Pochana",
      "creditUrl": "https://pocha-restaurant.fr"
    }
  },
  "best-restaurants-miami": {
    "Tâm Tâm (Downtown)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_1280,ar_4:3,g_center,f_auto/images/Tam_Tam-68_r7qi38",
      "credit": "The Infatuation",
      "creditUrl": "https://www.theinfatuation.com/miami/reviews/tam-tam"
    },
    "Boia De (Little Haiti)": {
      "src": "https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_1280,ar_4:3,g_center,f_auto/images/Boia_De-80_swtu0i",
      "credit": "The Infatuation",
      "creditUrl": "https://www.theinfatuation.com/miami/reviews/boia-de"
    },
    "Sunny's Steakhouse (Little River)": {
      "src": "https://media.timeout.com/images/106182376/750/422/image.jpg",
      "credit": "Time Out Miami",
      "creditUrl": "https://www.timeout.com/miami/restaurants/sunnys-steakhouse"
    }
  },
  "best-restaurants-tokyo": {
    "Acá 1° (Aoyama)": {
      "src": "https://maeborikoki.com/wp-content/uploads/2021/02/IMG_1014-scaled.jpg",
      "credit": "Maebori Koki",
      "creditUrl": "https://maeborikoki.com/aca/"
    },
    "Crony (Akasaka)": {
      "src": "https://starwinelist.com/storage/images/venue/5127/980x541/Crony%20main.jpg",
      "credit": "Star Wine List",
      "creditUrl": "https://starwinelist.com/wine-place/crony"
    },
    "Sazenka (Hiroo)": {
      "src": "https://www.studio-crow.jp/wp-content/uploads/2017/02/sazenka-06-1-1440x960.jpg",
      "credit": "Design Studio CROW",
      "creditUrl": "https://www.studio-crow.jp/projects/1089/"
    },
    "Myoujyaku (Nishi-Azabu)": {
      "src": "https://d267qvt8mf7rfa.cloudfront.net/restaurant/290/mainImage.jpg",
      "credit": "Myoujyaku",
      "creditUrl": "https://www.google.com/search?q=Myojaku%20Nishi-Azabu%20Tokyo"
    },
    "Sézanne (Marunouchi)": {
      "src": "https://www.fourseasons.com/alt/img-opt/~70.1530.0,0000-0,2500-3000,0000-1687,5000/publish/content/dam/fourseasons/images/web/MAR/MAR_1747_original.jpg",
      "credit": "Four Seasons Hotel Tokyo at Marunouchi",
      "creditUrl": "https://www.fourseasons.com/tokyo/dining/restaurants/sezanne/"
    }
  },
  "best-restaurants-shanghai": {
    "Fu He Hui (Changning)": {
      "src": "https://danielfooddiary.com/wp-content/uploads/2018/04/fuhehui1.jpg",
      "credit": "Daniel Food Diary",
      "creditUrl": "https://danielfooddiary.com/2018/05/02/fuhehui/"
    },
    "Meet the Bund (Bund)": {
      "src": "https://rachelgouk.com/wp-content/uploads/2026/01/meet-the-bund-michelin-restaurant-shanghai-21.jpg",
      "credit": "Nomfluence",
      "creditUrl": "https://rachelgouk.com/listings/meet-the-bund-bfc/"
    },
    "Ling Long (Jing'an)": {
      "src": "https://rachelgouk.com/wp-content/uploads/2023/03/ling-long-jason-liu-chinese-restaurant-shanghai-3.jpg",
      "credit": "Nomfluence",
      "creditUrl": "https://rachelgouk.com/listings/ling-long-shanghai/"
    }
  },
  "best-restaurants-toronto": {
    "Quetzal (Little Italy)": {
      "src": "https://torontolife.mblycdn.com/tl/resized/2018/09/1600x1200/toronto-restaurants-quetzal-mexican-kensington-market-fire-lead.jpg",
      "credit": "Toronto Life",
      "creditUrl": "https://torontolife.com/food/whats-menu-quetzal-new-mexican-restaurant-eight-metre-long-open-fire-pit/"
    },
    "aKin (Yorkville)": {
      "src": "https://images.squarespace-cdn.com/content/v1/66d0cf06515e620ff7ad59d4/6d912bd7-8269-4ae3-89c5-abd65f758622/_71A6218.jpg",
      "credit": "aKin",
      "creditUrl": "https://www.akintoronto.com/"
    },
    "Edulis (Trinity Bellwoods)": {
      "src": "https://canadas100best.com/wp-content/uploads/2018/03/EDULIS-Feature-photo.jpg",
      "credit": "Canada's 100 Best",
      "creditUrl": "https://canadas100best.com/list/2018/no-9-edulis-2018/"
    }
  },
  "best-restaurants-dallas": {
    "Mamani (Uptown)": {
      "src": "https://diningout.com/wp-content/uploads/2025/11/Mamani-Dining-Room-high-res.jpg",
      "credit": "Mamani / DiningOut",
      "creditUrl": "https://www.mamanirestaurant.com"
    },
    "Cattleack Barbeque (Farmers Branch)": {
      "src": "https://www.dallasobserver.com/wp-content/uploads/sites/3/ww-media/mediaserver/dal/2025-16/cattelack_brisket_gavin_cleaver.png",
      "credit": "Gavin Cleaver / Dallas Observer",
      "creditUrl": "https://www.dallasobserver.com/food-drink/every-dallas-restaurant-michelin-guide-2025-40611139/"
    },
    "Tatsu Dallas (Deep Ellum)": {
      "src": "https://media.timeout.com/images/106245720/image.jpg",
      "credit": "Courtesy Tatsu Dallas / Time Out",
      "creditUrl": "https://www.timeout.com/dallas/restaurants/tatsu-dallas"
    },
    "Quarter Acre (Lower Greenville)": {
      "src": "https://media.timeout.com/images/106269997/image.jpg",
      "credit": "Emily Loving / Time Out",
      "creditUrl": "https://www.timeout.com/dallas/restaurants/quarter-acre"
    },
    "Sanjh (Irving)": {
      "src": "https://media.timeout.com/images/106269996/image.jpg",
      "credit": "Courtesy Sanjh / Time Out",
      "creditUrl": "https://www.timeout.com/dallas/restaurants/sanjh-restaurant-bar"
    }
  },
  "best-restaurants-atlanta": {
    "Lazy Betty (Candler Park)": {
      "src": "https://static.wixstatic.com/media/0337ff_6047d472c7114231b60c162d8eb54537~mv2.jpg",
      "credit": "Lazy Betty",
      "creditUrl": "https://www.lazybettyatl.com"
    },
    "La Semilla (Summerhill)": {
      "src": "https://images.squarespace-cdn.com/content/v1/61263fe336b2332b3791e1d0/1684694635589-WF54FC8ON3LY2V6YASKH/Chochoyotes_Ashley%2BWilson.jpg?format=1500w",
      "credit": "Ashley Wilson / La Semilla",
      "creditUrl": "https://www.lasemilla.kitchen"
    },
    "Omakase Table (West Midtown)": {
      "src": "https://static.wixstatic.com/media/5009c7_57c2ac1c499a4a4ca4478d37029079c5~mv2.jpg",
      "credit": "Omakase Table",
      "creditUrl": "https://www.omakasetableatl.com"
    }
  },
  "best-restaurants-seattle": {
    "Archipelago (Hillman City)": {
      "src": "https://images.squarespace-cdn.com/content/v1/5b1e08c8cc8fed4594709a0d/1729035954665-AH8Q6T5LNW3V7IIE6COY/image-asset.jpeg?format=1500w",
      "credit": "Archipelago",
      "creditUrl": "https://archipelagoseattle.com"
    },
    "Cascina Spinasse (Capitol Hill)": {
      "src": "https://spinasse.com/wp-content/uploads/2020/06/pratt-table-with-tajarin.jpg",
      "credit": "Cascina Spinasse",
      "creditUrl": "https://spinasse.com"
    },
    "Il Nido (West Seattle)": {
      "src": "https://cdn.spotapps.co/spothopper/image/fetch/f_jpg,q_auto:best,c_fit,h_1200/http://static.spotapps.co/spots/59/3b7d9b7e6b49d782d288368f7e4b2d/:original",
      "credit": "Il Nido",
      "creditUrl": "https://ilnidoseattle.com"
    }
  },
  "best-pizza-italy": {
    "I Tigli (San Bonifacio)": {
      "src": "https://www.pizzeriaitigli.it/wp-content/uploads/2020/05/PHOTO-2020-05-07-22-29-59-1280x700.jpg",
      "credit": "I Tigli",
      "creditUrl": "https://www.pizzeriaitigli.it"
    },
    "I Masanielli di Francesco Martucci (Caserta)": {
      "src": "https://www.pizzeriaimasanielli.it/wp-content/uploads/2022/03/b.jpg",
      "credit": "I Masanielli di Francesco Martucci",
      "creditUrl": "https://www.pizzeriaimasanielli.it"
    },
    "Diego Vitagliano (Naples)": {
      "src": "https://www.pizzaawards.it/wp-content/uploads/2025/09/4-diego-vitigliano.jpg",
      "credit": "Pizza Awards Italia",
      "creditUrl": "https://www.pizzaawards.it/pizza-awards-2025-i-risultati/"
    }
  },
  "best-leonardo-dicaprio-movies": {
    "The Departed (2006)": {
      "src": "https://image.tmdb.org/t/p/w1280/6WRrGYalXXveItfpnipYdayFkQB.jpg",
      "credit": "The Movie Database (TMDB)",
      "creditUrl": "https://www.themoviedb.org/movie/1422-the-departed"
    },
    "Django Unchained (2012)": {
      "src": "https://image.tmdb.org/t/p/w1280/2oZklIzUbvZXXzIFzv7Hi68d6xf.jpg",
      "credit": "The Movie Database (TMDB)",
      "creditUrl": "https://www.themoviedb.org/movie/68718-django-unchained"
    },
    "Inception (2010)": {
      "src": "https://image.tmdb.org/t/p/w1280/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg",
      "credit": "The Movie Database (TMDB)",
      "creditUrl": "https://www.themoviedb.org/movie/27205-inception"
    }
  },
  "best-tarantino-movies": {
    "Pulp Fiction (1994)": {
      "src": "https://image.tmdb.org/t/p/w1280/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg",
      "credit": "The Movie Database (TMDB)",
      "creditUrl": "https://www.themoviedb.org/movie/680-pulp-fiction"
    },
    "Reservoir Dogs (1992)": {
      "src": "https://image.tmdb.org/t/p/w1280/eohMDv8x1XRSkPdjWv5xsFct4Dj.jpg",
      "credit": "The Movie Database (TMDB)",
      "creditUrl": "https://www.themoviedb.org/movie/500-reservoir-dogs"
    },
    "Inglourious Basterds (2009)": {
      "src": "https://image.tmdb.org/t/p/w1280/bMJxwgLyD47CDQ6BFCT2AMMlID7.jpg",
      "credit": "The Movie Database (TMDB)",
      "creditUrl": "https://www.themoviedb.org/movie/16869-inglourious-basterds"
    }
  },
  "top-grossing-films-inflation-adjusted": {
    "Gone with the Wind (1939)": {
      src: 'https://upload.wikimedia.org/wikipedia/commons/2/27/Poster_-_Gone_With_the_Wind_01.jpg',
      credit: 'Metro-Goldwyn-Mayer',
      creditUrl: 'https://en.wikipedia.org/wiki/Gone_with_the_Wind_(film)',
    },
    "Avatar (2009)": {
      src: 'https://upload.wikimedia.org/wikipedia/en/d/d6/Avatar_%282009_film%29_poster.jpg',
      credit: '20th Century Fox',
      creditUrl: 'https://en.wikipedia.org/wiki/Avatar_(2009_film)',
    },
    "Titanic (1997)": {
      src: 'https://upload.wikimedia.org/wikipedia/en/1/18/Titanic_%281997_film%29_poster.png',
      credit: 'Paramount Pictures',
      creditUrl: 'https://en.wikipedia.org/wiki/Titanic_(1997_film)',
    },
  },
  "top-grossing-animated-films": {
    "Ne Zha 2 (2025)": {
      src: 'https://upload.wikimedia.org/wikipedia/en/b/b6/Ne_Zha_2_poster.jpg',
      credit: 'Beijing Enlight Pictures',
      creditUrl: 'https://en.wikipedia.org/wiki/Ne_Zha_2',
    },
    "Zootopia 2 (2025)": {
      src: 'https://upload.wikimedia.org/wikipedia/en/6/6a/Zootopia_2_%282025_film%29.jpg',
      credit: 'Walt Disney Studios Motion Pictures',
      creditUrl: 'https://en.wikipedia.org/wiki/Zootopia_2',
    },
    "Inside Out 2 (2024)": {
      src: 'https://upload.wikimedia.org/wikipedia/en/f/f7/Inside_Out_2_poster.jpg',
      credit: 'Walt Disney Studios Motion Pictures',
      creditUrl: 'https://en.wikipedia.org/wiki/Inside_Out_2',
    },
  },
  "top-grossing-film-franchises": {
    "Marvel Cinematic Universe": {
      src: 'https://upload.wikimedia.org/wikipedia/commons/0/0c/Marvel_Cinematic_Universe_logo.png',
      credit: 'Marvel Studios',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Marvel_Cinematic_Universe_logo.png',
    },
    "Spider-Man": {
      src: 'https://upload.wikimedia.org/wikipedia/commons/3/35/Spider-Man_%28Marvel_Cinematic_Universe%29_film_logo.png',
      credit: 'Marvel Studios / Sony Pictures',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Spider-Man_(Marvel_Cinematic_Universe)_film_logo.png',
    },
    "Star Wars": {
      src: 'https://upload.wikimedia.org/wikipedia/commons/5/5a/Star_Wars_Logo..png',
      credit: 'Lucasfilm',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Star_Wars_Logo..png',
    },
  },
  "top-grossing-actors": {
    "Zoe Saldana": {
      src: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/Zoe_Salda%C3%B1a_at_the_2024_Toronto_International_Film_Festival_%28cropped%29.jpg',
      credit: 'Kevin Payravi (CC BY-SA 4.0)',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Zoe_Salda%C3%B1a_at_the_2024_Toronto_International_Film_Festival_(cropped).jpg',
    },
    "Scarlett Johansson": {
      src: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/Scarlett_Johansson-8588.jpg',
      credit: 'Harald Krichel (CC BY-SA 4.0)',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Scarlett_Johansson-8588.jpg',
    },
    "Samuel L. Jackson": {
      src: 'https://upload.wikimedia.org/wikipedia/commons/2/29/SamuelLJackson.jpg',
      credit: 'Philip Romano (CC BY-SA 4.0)',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:SamuelLJackson.jpg',
    },
  },
  "top-grossing-directors": {
    "Steven Spielberg": {
      src: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/MKr25402_Steven_Spielberg_%28Berlinale_2023%29_%283x4_cropped%29.jpg',
      credit: 'Martin Kraft (CC BY-SA 4.0)',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:MKr25402_Steven_Spielberg_(Berlinale_2023)_(3x4_cropped).jpg',
    },
    "James Cameron": {
      src: 'https://upload.wikimedia.org/wikipedia/commons/4/4f/James_Cameron_at_53rd_Saturn_Awards_2026-01_%28cropped%29.jpg',
      credit: 'Kevin Paul (CC BY 4.0)',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:James_Cameron_at_53rd_Saturn_Awards_2026-01_(cropped).jpg',
    },
    "The Russo Brothers": {
      src: 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Joe_Russo_%26_Anthony_Russo_by_Gage_Skidmore.jpg',
      credit: 'Gage Skidmore (CC BY-SA 3.0)',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Joe_Russo_%26_Anthony_Russo_by_Gage_Skidmore.jpg',
    },
  },
  "most-expensive-movies": {
    "Star Wars: The Force Awakens (2015)": {
      src: 'https://upload.wikimedia.org/wikipedia/en/a/a2/Star_Wars_The_Force_Awakens_Theatrical_Poster.jpg',
      credit: 'Walt Disney Studios Motion Pictures',
      creditUrl: 'https://en.wikipedia.org/wiki/Star_Wars:_The_Force_Awakens',
    },
    "Star Wars: The Rise of Skywalker (2019)": {
      src: 'https://upload.wikimedia.org/wikipedia/en/a/af/Star_Wars_The_Rise_of_Skywalker_poster.jpg',
      credit: 'Walt Disney Studios Motion Pictures',
      creditUrl: 'https://en.wikipedia.org/wiki/Star_Wars:_The_Rise_of_Skywalker',
    },
    "Jurassic World Dominion (2022)": {
      src: 'https://upload.wikimedia.org/wikipedia/en/c/ce/JurassicWorldDominion_Poster.jpeg',
      credit: 'Universal Pictures',
      creditUrl: 'https://en.wikipedia.org/wiki/Jurassic_World_Dominion',
    },
  },
  "biggest-box-office-bombs": {
    "John Carter (2012)": {
      src: 'https://upload.wikimedia.org/wikipedia/en/a/aa/John_carter_poster.jpg',
      credit: 'Walt Disney Studios Motion Pictures',
      creditUrl: 'https://en.wikipedia.org/wiki/John_Carter_(film)',
    },
    "The Lone Ranger (2013)": {
      src: 'https://upload.wikimedia.org/wikipedia/en/0/0d/TheLoneRanger2013Poster.jpg',
      credit: 'Walt Disney Studios Motion Pictures',
      creditUrl: 'https://en.wikipedia.org/wiki/The_Lone_Ranger_(2013_film)',
    },
    "The Marvels (2023)": {
      src: 'https://upload.wikimedia.org/wikipedia/en/7/7a/The_Marvels_poster.jpg',
      credit: 'Walt Disney Studios Motion Pictures',
      creditUrl: 'https://en.wikipedia.org/wiki/The_Marvels',
    },
  },
  "top-grossing-broadway-shows": {
    "The Lion King": {
      src: 'https://upload.wikimedia.org/wikipedia/commons/7/79/Minskoff_Theatre%2C_Broadway_%28926452210%29.jpg',
      credit: 'Rob Young (CC BY 2.0)',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Minskoff_Theatre,_Broadway_(926452210).jpg',
    },
    "Wicked": {
      src: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Gershwin_Theatre_NYC.jpg',
      credit: 'Andreas Praefcke (CC BY 3.0)',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Gershwin_Theatre_NYC.jpg',
    },
    "The Phantom of the Opera": {
      src: 'https://upload.wikimedia.org/wikipedia/commons/c/cc/Majestic_Theatre_-_The_Phantom_of_the_Opera_on_1_April_7.jpg',
      credit: 'SeichanGant (CC BY-SA 4.0)',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Majestic_Theatre_-_The_Phantom_of_the_Opera_on_1_April_7.jpg',
    },
  },
  "top-songs-1960s": {
    "The Twist (Chubby Checker)": {
      src: 'https://upload.wikimedia.org/wikipedia/en/e/e9/The_twist_45.jpg',
      credit: 'Parkway Records',
      creditUrl: 'https://en.wikipedia.org/wiki/The_Twist_(song)',
    },
    "Hey Jude (The Beatles)": {
      src: 'https://upload.wikimedia.org/wikipedia/en/d/d8/Heyjude1.png',
      credit: 'Apple Records',
      creditUrl: 'https://en.wikipedia.org/wiki/Hey_Jude',
    },
    "Theme from A Summer Place (Percy Faith)": {
      src: 'https://upload.wikimedia.org/wikipedia/en/6/6f/Theme_from_A_Summer_Place_-_Percy_Faith.jpg',
      credit: 'Columbia Records',
      creditUrl: 'https://en.wikipedia.org/wiki/Theme_from_A_Summer_Place',
    },
  },
  "top-songs-1970s": {
    "You Light Up My Life (Debby Boone)": {
      src: 'https://upload.wikimedia.org/wikipedia/commons/6/6d/You_light_up_my_life_original_cast_US_vinyl_vocal_side.png',
      credit: 'Warner Bros. Records',
      creditUrl: 'https://en.wikipedia.org/wiki/You_Light_Up_My_Life_(song)',
    },
    "Tonight's the Night (Rod Stewart)": {
      src: 'https://upload.wikimedia.org/wikipedia/en/5/5f/Tonight%27s_the_Night_%28Gonna_Be_Alright%29_cover.jpg',
      credit: 'Warner Bros. Records',
      creditUrl: 'https://en.wikipedia.org/wiki/Tonight%27s_the_Night_(Gonna_Be_Alright)',
    },
    "Le Freak (Chic)": {
      src: 'https://upload.wikimedia.org/wikipedia/en/8/89/Chicfreak.jpg',
      credit: 'Atlantic Records',
      creditUrl: 'https://en.wikipedia.org/wiki/Le_Freak',
    },
  },
  "top-songs-1980s": {
    "Physical (Olivia Newton-John)": {
      src: 'https://upload.wikimedia.org/wikipedia/en/c/c6/Physical_%28Olivia_Newton-John_single%29_coverart.jpg',
      credit: 'MCA Records',
      creditUrl: 'https://en.wikipedia.org/wiki/Physical_(Olivia_Newton-John_song)',
    },
    "Bette Davis Eyes (Kim Carnes)": {
      src: 'https://upload.wikimedia.org/wikipedia/en/7/7b/Kim_Carnes_BDE.jpg',
      credit: 'EMI America Records',
      creditUrl: 'https://en.wikipedia.org/wiki/Bette_Davis_Eyes',
    },
    "Endless Love (Diana Ross and Lionel Richie)": {
      src: 'https://upload.wikimedia.org/wikipedia/en/8/88/Diana-Ross-Endless-Love.jpg',
      credit: 'Motown Records',
      creditUrl: 'https://en.wikipedia.org/wiki/Endless_Love_(song)',
    },
  },
  "top-songs-1990s": {
    "How Do I Live (LeAnn Rimes)": {
      src: 'https://upload.wikimedia.org/wikipedia/en/e/ec/HowDoILive.jpg',
      credit: 'Curb Records',
      creditUrl: 'https://en.wikipedia.org/wiki/How_Do_I_Live',
    },
    "Macarena (Los Del Rio)": {
      src: 'https://upload.wikimedia.org/wikipedia/commons/7/77/Remix_of_Los_Del_Rio%27s_Macarena_by_The_Bayside_Boys_European_CD.jpeg',
      credit: 'RCA Records',
      creditUrl: 'https://en.wikipedia.org/wiki/Macarena_(song)',
    },
    "Un-Break My Heart (Toni Braxton)": {
      src: 'https://upload.wikimedia.org/wikipedia/en/c/c1/ToniBraxtonUnBreakMyHeartCDSingleCover.jpg',
      credit: 'LaFace Records',
      creditUrl: 'https://en.wikipedia.org/wiki/Un-Break_My_Heart',
    },
  },
  "top-songs-2000s": {
    "We Belong Together (Mariah Carey)": {
      src: 'https://upload.wikimedia.org/wikipedia/en/8/8b/We_Belong_Together_Mariah_Carey.png',
      credit: 'Island Records',
      creditUrl: 'https://en.wikipedia.org/wiki/We_Belong_Together',
    },
    "Yeah! (Usher feat. Lil Jon and Ludacris)": {
      src: 'https://upload.wikimedia.org/wikipedia/en/e/ea/Usher_-_Yeah%21.png',
      credit: 'Arista Records',
      creditUrl: 'https://en.wikipedia.org/wiki/Yeah!_(Usher_song)',
    },
    "Low (Flo Rida feat. T-Pain)": {
      src: 'https://upload.wikimedia.org/wikipedia/en/3/36/Low_fr_tp.JPG',
      credit: 'Atlantic Records',
      creditUrl: 'https://en.wikipedia.org/wiki/Low_(Flo_Rida_song)',
    },
  },
  "top-songs-2010s": {
    "Uptown Funk (Mark Ronson feat. Bruno Mars)": {
      src: 'https://upload.wikimedia.org/wikipedia/en/a/a7/Mark_Ronson_-_Uptown_Funk_%28feat._Bruno_Mars%29_%28Official_Single_Cover%29.png',
      credit: 'Columbia Records',
      creditUrl: 'https://en.wikipedia.org/wiki/Uptown_Funk',
    },
    "Party Rock Anthem (LMFAO)": {
      src: 'https://upload.wikimedia.org/wikipedia/en/a/a2/Party_Rock_Anthem_%28feat._Lauren_Bennet_%26_GoonRock%29_-_Single.jpeg',
      credit: 'Interscope Records',
      creditUrl: 'https://en.wikipedia.org/wiki/Party_Rock_Anthem',
    },
    "Shape of You (Ed Sheeran)": {
      src: 'https://upload.wikimedia.org/wikipedia/en/b/b4/Shape_Of_You_%28Official_Single_Cover%29_by_Ed_Sheeran.png',
      credit: 'Asylum / Atlantic Records',
      creditUrl: 'https://en.wikipedia.org/wiki/Shape_of_You',
    },
  },
  "best-coen-brothers-movies": {
    "Fargo": {
      src: "https://image.tmdb.org/t/p/original/747dgDfL5d8esobk7h4odaOFhUq.jpg",
      credit: "TMDB",
      creditUrl: "https://www.themoviedb.org/movie/275-fargo",
    },
    "The Big Lebowski": {
      src: "https://image.tmdb.org/t/p/original/hXsy4XCCHrUk81XoRhcooyWejao.jpg",
      credit: "TMDB",
      creditUrl: "https://www.themoviedb.org/movie/115-the-big-lebowski",
    },
    "No Country for Old Men": {
      src: "https://image.tmdb.org/t/p/original/gddUsvfyySrM5k8B8wwJy2VRlBx.jpg",
      credit: "TMDB",
      creditUrl: "https://www.themoviedb.org/movie/6977-no-country-for-old-men",
    },
  },
  "best-wes-anderson-movies": {
    "The Grand Budapest Hotel": {
      src: "https://image.tmdb.org/t/p/original/9udCLTxTFl28RxnK8Q05E154ZGa.jpg",
      credit: "TMDB",
      creditUrl: "https://www.themoviedb.org/movie/120467-the-grand-budapest-hotel",
    },
    "Fantastic Mr. Fox": {
      src: "https://image.tmdb.org/t/p/original/xRxSLhhjPG2D8l0BXi0KdN4IvPt.jpg",
      credit: "TMDB",
      creditUrl: "https://www.themoviedb.org/movie/10315-fantastic-mr-fox",
    },
    "Rushmore": {
      src: "https://image.tmdb.org/t/p/original/asC4h9U7pD72bkYcqzgTB7VJYLy.jpg",
      credit: "TMDB",
      creditUrl: "https://www.themoviedb.org/movie/11545-rushmore",
    },
  },
  "best-ridley-scott-movies": {
    "Alien": {
      src: "https://image.tmdb.org/t/p/original/AmR3JG1VQVxU8TfAvljUhfSFUOx.jpg",
      credit: "TMDB",
      creditUrl: "https://www.themoviedb.org/movie/348-alien",
    },
    "Blade Runner": {
      src: "https://image.tmdb.org/t/p/original/hJ5R9d6QuH3tzr8L8neZZTuzNXm.jpg",
      credit: "TMDB",
      creditUrl: "https://www.themoviedb.org/movie/78-blade-runner",
    },
    "The Martian": {
      src: "https://image.tmdb.org/t/p/original/lzMS0CI3FLQYC5EgJoWeIaEt0lm.jpg",
      credit: "TMDB",
      creditUrl: "https://www.themoviedb.org/movie/286217-the-martian",
    },
  },
  "best-denis-villeneuve-movies": {
    "Dune: Part Two": {
      src: "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
      credit: "TMDB",
      creditUrl: "https://www.themoviedb.org/movie/693134-dune-part-two",
    },
    "Incendies": {
      src: "https://image.tmdb.org/t/p/original/f3ATwil5vmUeTsogBaMEKbBYBth.jpg",
      credit: "TMDB",
      creditUrl: "https://www.themoviedb.org/movie/46738-incendies",
    },
    "Blade Runner 2049": {
      src: "https://image.tmdb.org/t/p/original/mVr0UiqyltcfqxbAUcLl9zWL8ah.jpg",
      credit: "TMDB",
      creditUrl: "https://www.themoviedb.org/movie/335984-blade-runner-2049",
    },
  },
  "best-hayao-miyazaki-movies": {
    "Spirited Away": {
      src: "https://image.tmdb.org/t/p/original/dyJvKsNs2KP8qQnAXbRwDjblViy.jpg",
      credit: "TMDB",
      creditUrl: "https://www.themoviedb.org/movie/129-spirited-away",
    },
    "Princess Mononoke": {
      src: "https://image.tmdb.org/t/p/original/gl0jzn4BupSbL2qMVeqrjKkF9Js.jpg",
      credit: "TMDB",
      creditUrl: "https://www.themoviedb.org/movie/128-princess-mononoke",
    },
    "My Neighbor Totoro": {
      src: "https://image.tmdb.org/t/p/original/zkThiZAaAie8Lw7RAc5yPTOewBV.jpg",
      credit: "TMDB",
      creditUrl: "https://www.themoviedb.org/movie/8392-my-neighbor-totoro",
    },
  },
};
