// Utilitaire pour convertir les nombres en lettres françaises
// Spécialement adapté pour les montants en dirhams marocains

const unites = [
  '', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf',
  'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'
];

const dizaines = [
  '', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'
];

function convertirHundreds(num: number): string {
  let result = '';
  
  if (num >= 100) {
    const hundreds = Math.floor(num / 100);
    if (hundreds === 1) {
      result += 'cent';
    } else {
      result += unites[hundreds] + ' cent';
    }
    if (num % 100 !== 0) {
      result += 's';
    }
    result += ' ';
    num %= 100;
  }
  
  if (num >= 20) {
    const tens = Math.floor(num / 10);
    const units = num % 10;
    
    if (tens === 7) {
      result += 'soixante';
      if (units === 1) {
        result += ' et onze';
      } else if (units > 1) {
        result += '-' + (units + 10 < 20 ? unites[units + 10] : 'dix-' + unites[units]);
      } else {
        result += '-dix';
      }
    } else if (tens === 9) {
      result += 'quatre-vingt';
      if (units === 1) {
        result += ' et onze';
      } else if (units > 1) {
        result += '-' + (units + 10 < 20 ? unites[units + 10] : 'dix-' + unites[units]);
      } else {
        result += '-dix';
      }
    } else {
      result += dizaines[tens];
      if (units === 1 && (tens === 2 || tens === 3 || tens === 4 || tens === 5 || tens === 6)) {
        result += ' et un';
      } else if (units > 1) {
        result += '-' + unites[units];
      }
    }
  } else if (num > 0) {
    result += unites[num];
  }
  
  return result.trim();
}

function convertirThousands(num: number): string {
  if (num === 0) return '';
  
  let result = '';
  
  if (num >= 1000) {
    const thousands = Math.floor(num / 1000);
    if (thousands === 1) {
      result += 'mille';
    } else {
      result += convertirHundreds(thousands) + ' mille';
    }
    result += ' ';
    num %= 1000;
  }
  
  if (num > 0) {
    result += convertirHundreds(num);
  }
  
  return result.trim();
}

export function convertirMontantEnLettres(montant: number): string {
  if (montant === 0) {
    return 'zéro Dirham et zéro centimes';
  }
  
  let partiEntiere = Math.floor(montant);
  const centimes = Math.round((montant - partiEntiere) * 100);
  
  let result = '';
  
  if (partiEntiere === 0) {
    result = 'zéro Dirham';
  } else if (partiEntiere === 1) {
    result = 'un Dirham';
  } else {
    // Gérer les millions
    if (partiEntiere >= 1000000) {
      const millions = Math.floor(partiEntiere / 1000000);
      if (millions === 1) {
        result += 'un million';
      } else {
        result += convertirThousands(millions) + ' millions';
      }
      result += ' ';
      partiEntiere %= 1000000;
    }
    
    // Gérer le reste (milliers et unités)
    if (partiEntiere > 0) {
      result += convertirThousands(partiEntiere);
    }
    
    result = result.trim() + ' Dirham';
    const originalPartiEntiere = Math.floor(montant);
    if (originalPartiEntiere > 1) {
      result += 's';
    }
  }
  
  // Ajouter les centimes
  if (centimes === 0) {
    result += ' et zéro centimes';
  } else if (centimes === 1) {
    result += ' et un centime';
  } else {
    result += ' et ' + convertirHundreds(centimes) + ' centimes';
  }
  
  // Capitaliser la première lettre
  return result.charAt(0).toUpperCase() + result.slice(1);
}

// Fonction de test pour vérifier les conversions
export function testerConversions() {
  const tests = [
    0,
    1,
    21,
    100,
    101,
    1000,
    1001,
    19800,
    21000,
    100000,
    1000000,
    1234567.89
  ];
  
  console.log('Tests de conversion en lettres:');
  tests.forEach(montant => {
    console.log(`${montant} → ${convertirMontantEnLettres(montant)}`);
  });
}
