// Every English word that is hidden inside a Venn board item and is NOT a
// member of that board's category. This file is the OTHER half of the census
// gate in verify-venn.mjs: for a `hides` board, the verifier pulls every real
// dictionary word sitting inside each item and demands that each one be either
// a member in HIDDEN (so it scores) or listed here (so a human has looked at it
// and said no). A word in neither list FAILS the board.
//
// The point is that silence is no longer a pass. The old design had a hand-made
// DECOY blocklist of members the accepted list omitted, which meant a word could
// be absent from both and ship unnoticed: WOMBAT went out on the August 6 2026
// board under "hides a body part" with WOMB in neither list. Under the census a
// board carrying an unreviewed word cannot ship at all.
//
// TO ADD A BOARD: run `node scripts/verify-venn.mjs --census`. It prints the
// words your new items introduce. Read them. Anything that really is an animal,
// a body part or a number goes into HIDDEN in lib/venn-rules.js (which WIDENS
// the circle, so re-verify the whole bank); everything else goes here. Never
// regenerate this file mechanically, the whole value is the human read.
//
// Deliberate calls worth not re-litigating:
//   ANI, MUT, TEG, CUR, ROO, MARA  real creatures, but Scrabble-dictionary
//     obscure or slang; no solver scanning MEANING finds a cuckoo in it.
//   FIN  animal anatomy, and this set is human: EAR, RIB, HIP, KNEE. DEFINE
//     does not read as hiding a body part.
//   ALA, CHINE, REN  Latin or butchery terms for parts, not everyday English.
//   LID  only a body part as short for EYELID, and EYELID hides EYE already.
//   CRICK, PUS  a spasm and a fluid, neither one a part.
//   ANTS, ARMS, EARS, HIPS, HEELS  plurals whose singular is already a member,
//     so the item scores on the singular and these never decide anything.
export const REVIEWED = {
  animal: [
    'ACH','AGE','AMA','ANI','ARK','ATE','ATT','BAC','BOW','CAP','CHE','CON','COR','CUR','DAN',
    'DEB','DEF','DEN','EAN','EAT','ECO','EEN','ENE','ENG','ERS','EST','EVE','FAN','FEE','FEN',
    'FIL','FUG','GAL','GEE','GIN','HER','HES','HID','HON','ILL','ING','INS','ION','IRE','ITS',
    'KET','KIP','LAG','LEG','LES','LIE','LOW','MAN','MAR','MAT','MED','MOR','MUT','NOR','OCA',
    'ONE','ONS','OOM','ORA','ORE','OSE','PAN','PED','PER','POS','PRO','RAN','RAP','RED','REE',
    'REF','RES','RET','RIA','ROM','ROO','SER','SIT','SKI','SON','SUB','SUP','TAN','TAP','TAS',
    'TAT','TED','TEG','THE','THO','TIC','TIN','TRY','UTU','VAN','VAR','VIA','WAN','WAR','WIN',
    'ACHE','ANTA','ANTE','ANTI','ANTS','APED','ARIA','BACK','BATE','BATH','BATT','CAPE','CATE',
    'COMB','COME','CONS','CREE','DANT','DRAM','EACH','EGAL','EVER','FEED','FILM','GEES','GRAM',
    'GRAN','HEAT','HONE','INGS','IONS','KILL','KIPS','LANT','LIES','LOCA','LONG','MARA','MARK',
    'MEAN','NEST','NEVE','OAST','ONES','ONST','OSES','OWLY','PLAN','PLIE','PROG','RAMS','RANT',
    'RATE','RATH','REEN','RETE','ROMA','ROOM','SIGN','SLOW','SONS','STAT','SUPE','TATE','THON',
    'THRO','TING','TRAT','VANT','VERS','VIAL','VILL','WANT','WHEN','ACHES','ANTAS','ANTED',
    'ANTIC','CAPED','CURAT','DRAMA','DUCAT','FENCE','GRAMS','GRANT','HENCE','HONES','LANTS',
    'LOWLY','MARRI','NEVER','ORANT','ORRIS','PLIES','POSIT','QUIET','RANTS','RATHE','RIANT',
    'ROMAN','SCAPE','SCREE','SIGNS','STATE','SUPER','URATE','VANTS','VARIA','VILLA','ARRANT',
    'BATTER','CATION','CURATE','EANING','EATING','ESCAPE','GRAMMA','IGNORE','LOCATE','MANTIC',
    'PEDANT','RANTED','SCAPED','TRIVIA','WANTED','WARRAN','EDUCATE','WARRANT',
  ],
  body: [
    'ACH','AIN','AKE','ALA','ALL','ALP','AND','ANT','ANY','APP','ARD','ARE','ARS','ART','ASP',
    'AVE','BAT','BRO','BUT','CAR','CAT','CHA','CHI','COO','DEF','DIT','DOW','EDS','EEL','ELF',
    'ELS','END','ENE','ERE','ERR','ERS','EST','EVE','FAR','FEE','FIN','GER','GIT','HAN','HAT',
    'HEN','HIN','ICK','IMP','ING','ION','IRE','ISH','ITS','KET','LAR','LAS','LEA','LEV','LID',
    'LIE','LIN','LIS','LOW','MAC','MAN','MED','MIS','MOD','NAT','NED','OAT','ODE','OFF','OLD',
    'ORS','OSE','OWN','PAR','PEA','PED','PER','PIN','POS','PUS','RAS','RAY','REC','RED','REN',
    'RES','RET','REV','RIN','RIT','ROM','RUN','SEE','SER','SIC','SIN','SOL','TAK','TAN','TEA',
    'TED','TEN','TIN','TOD','TOP','UGH','UMP','URN','USE','UTE','VIE','WAR','WAY','XIS','YEA',
    'YOU','ALAR','ANCE','ARDS','ARED','ARMS','ARTS','ATMA','BEAR','BUTE','CARR','CHAR','DEFI',
    'DITS','DOWN','EACH','EARD','EARL','EARN','EARS','EELS','ENDS','ERED','EVER','FARE','FARM',
    'FEAR','FEEL','FINE','FISH','GAIN','GEAR','HEAR','HING','HIPS','ITCH','JUMP','LASS','LEAR',
    'LEVE','LIER','LING','LIST','LOAD','MACH','MIST','NEVE','OUCH','PART','PEAR','PERT','PING',
    'PUSH','RASP','READ','RELY','REST','RICK','RING','RITT','ROMA','SHIP','SING','SPEC','STED',
    'STEN','STOP','TAKE','TEND','TING','TIRE','TODY','TURN','URNS','USES','VIEW','WALK','WHEE',
    'WHEN','WRIT','ARMER','ATMAN','CATCH','CHINE','CLASS','CLEAR','COACH','CRICK','EARDS',
    'EARED','ELECT','ENTER','ERING','EXIST','FLOAT','GEARE','HANCE','HEELS','LASSI','LEARE',
    'LEARN','MACHI','NEVER','OUGHT','PEARS','PERTS','REVIE','ROUGH','SHINE','STAKE','TEACH',
    'TENDS','TOUCH','TURNS','VIEWS','YOUNG','ACHING','ARMERS','BROUGH','CHINES','EARING','ENTIRE',
    'HANCES','HIPPIN','LEARED','NATURA','PHYSIC','POSING','RICKET','ROUGHT','TOPPED','UMPING',
    'EARNING','HIPPING','LECTION','OUCHING',
  ],
  number: [
    'AGE','AIN','AMI','AND','ANT','ANY','ARD','ATE','ATT','AVO','BEN','BOD','BOO','CEP','CON',
    'COO','DEF','DON','EAT','ELF','END','ENE','ENS','EON','ERA','ESS','EST','ETH','EVE','FED',
    'FEN','FIL','FOR','FOU','HEN','HON','HOO','ICE','IMP','ING','ION','ISO','LED','LES','LEV',
    'LIS','LUD','MED','MIC','NAM','NED','NET','NON','NOR','NOS','OBO','OIS','OLE','OON','ORA',
    'ORT','OSE','OUR','OUT','PEN','PHO','POI','PRE','PRO','RAN','RAT','REE','RES','RIN','RIP',
    'RIT','SEL','SEN','SER','SIM','SOM','SON','TAG','TAT','TEE','TIN','TON','UGH','VAN','VIN',
    'WAR','WEE','XIS','YON','AGES','AINE','ANDS','BEAT','BENE','BODY','BOUT','CHUR','CLON',
    'COOL','COVE','EATH','ENDS','ESSE','EVEN','EVER','FEND','FORT','GAIN','HELP','HONE','INGS',
    'INTI','LESS','LEVA','LIST','LONE','LUDE','NEAT','OINT','ONER','ONES','OPPO','OVER','PENS',
    'PHON','POIS','PONE','PROS','RACK','RANT','RING','RITT','ROSE','SELF','SENT','SIMP','SOME',
    'SONE','SOON','STAT','STEN','TATE','TEND','TENS','TENT','TING','TONE','TREE','VANT','VERY',
    'VICE','WORK','WRIT','ANYON','COUNT','COVER','EATEN','ENDED','ERING','EVERY','EXIST','HONES',
    'NEATH','ORANT','POINT','PRESE','SENTE','SERVE','STATE','STING','TENDS','TENSE','TENTS',
    'TINGS','TONES','VENIN','WORKS','ATTEND','EXTEND','INTEND','LEVANT','POISON','PONENT',
    'PRISON','TENDED','OINTING','OVERING','RESERVE',
  ],
};
