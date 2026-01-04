export const smorfiaNapoli = {
  1: "L'Italia", 2: " 'A piccerella", 3: " 'A gatta", 4: " 'O puorco", 5: " 'A mano",
  6: " 'A guallera", 7: " 'A sciavula", 8: " 'A maronna", 9: " 'A figliata", 10: " 'E fasule",
  11: " 'E surice", 12: " 'O surdate", 13: " 'O santu", 14: " 'O mbriaco", 15: " 'O guaglione",
  16: " 'O culo", 17: " 'A disgrazia", 18: " 'O sanghe", 19: " 'A resata", 20: " 'A festa",
  21: " 'A femmena nura", 22: " 'O pazzo", 23: " 'O scemo", 24: " 'E gguardie", 25: " 'O Natale",
  26: " 'Nanninella", 27: " 'O càntaro", 28: " 'E zzizze", 29: " 'O pate d''e criature", 30: " 'E ppalle d''o tenente",
  31: " 'O padrone 'e casa", 32: " 'O capitone", 33: "L'anne 'e Cristo", 34: " 'A capa", 35: " 'L'auciello",
  36: " 'O nfamone", 37: " 'O monaco", 38: " 'E mmazzate", 39: " 'A funa n'ganna", 40: " 'A paposcia",
  41: " 'O curtiello", 42: " 'O café", 43: " 'A femmena 'o barcone", 44: " 'E ccancelle", 45: " 'O vino bbuono",
  46: " 'E sorde", 47: " 'O muorto", 48: " 'O muorto che parla", 49: " 'O piezzo 'e carne", 50: " 'O ppane",
  51: " 'O giardino", 52: " 'A mamma", 53: " 'O viecchio", 54: " 'O cappiello", 55: " 'A museca",
  56: " 'A caruta", 57: " 'O scartellato", 58: " 'O paccotto", 59: " 'E peli", 60: "Se lamente",
  61: " 'O cacciatore", 62: " 'O muorto acciso", 63: " 'A sposa", 64: " 'A sciammeria", 65: " 'O chianto",
  66: " 'E ddoie zetelle", 67: " 'O totaro dint''a chitarra", 68: " 'A zuppa cotta", 69: "Sott'e n'coppa", 70: " 'O palazzo",
  71: " 'A sedia", 72: " 'A maraviglia", 73: " 'O spitale", 74: " 'A grotta", 75: " 'O Pulcinella",
  76: " 'A funtana", 77: " 'E diavulille", 78: " 'A bella figliola", 79: " 'O lariulà", 80: " 'A vocca",
  81: " 'E sciure", 82: " 'A tavula mbandita", 83: " 'O maletiempo", 84: " 'A chiesa", 85: " 'Aneme 'o priatorio",
  86: " 'A puteca", 87: " 'E perucchie", 88: " 'E casecavalle", 89: " 'A vecchia", 90: " 'A paura"
};

export const smorfiaItaliana = {
  1: "L'Italia", 2: "La bambina", 3: "Il gatto", 4: "Il maiale", 5: "La mano",
  6: "La gallina", 7: "La schiava", 8: "La Madonna", 9: "La famiglia", 10: "I fagioli",
  11: "I topi", 12: "Il soldato", 13: "Il santo", 14: "L'ubriaco", 15: "Il ragazzo",
  16: "Il sedere", 17: "La disgrazia", 18: "Il sangue", 19: "La risata", 20: "La festa",
  21: "La donna nuda", 22: "Il pazzo", 23: "Lo sciocco", 24: "Le guardie", 25: "Il Natale",
  26: "Nanninella", 27: "La brocca", 28: "Le zizze", 29: "Il padre delle creature", 30: "Le palle del tenente",
  31: "Il padrone di casa", 32: "Il capitone", 33: "L'anno di Cristo", 34: "La testa", 35: "L'uccello",
  36: "L'infamone", 37: "Il monaco", 38: "Le mazzate", 39: "La fune in gola", 40: "La pantofola",
  41: "Il coltello", 42: "Il caffè", 43: "La donna del barcone", 44: "Le cancelle", 45: "Il vino buono",
  46: "I soldi", 47: "Il morto", 48: "Il morto che parla", 49: "Il pezzo di carne", 50: "Il pane",
  51: "Il giardino", 52: "La mamma", 53: "Il vecchio", 54: "Il cappello", 55: "La mosca",
  56: "La carota", 57: "Lo scartellato", 58: "Il pacchetto", 59: "I peli", 60: "Si lamenta",
  61: "Il cacciatore", 62: "Il morto ucciso", 63: "La sposa", 64: "La sciocchezza", 65: "Il pianto",
  66: "Le due zitelle", 67: "Il tarlo nella chitarra", 68: "La zuppa cotta", 69: "Sotto la coppa", 70: "Il palazzo",
  71: "La sedia", 72: "La meraviglia", 73: "L'ospedale", 74: "La grotta", 75: "Pulcinella",
  76: "La fontana", 77: "I diavoletti", 78: "La bella ragazza", 79: "Il lariulà", 80: "La bocca",
  81: "I fiori", 82: "La tavola imbandita", 83: "Il maltempo", 84: "La chiesa", 85: "Le anime del purgatorio",
  86: "La bottega", 87: "Le parrucche", 88: "Le casacavallo", 89: "La vecchia", 90: "La paura"
};

export const getSmorfia = () => {
  if (typeof window !== 'undefined') {
    const savedLingua = localStorage.getItem('linguaSmorfia');
    return savedLingua === 'italiano' ? smorfiaItaliana : smorfiaNapoli;
  }
  return smorfiaNapoli;
};
