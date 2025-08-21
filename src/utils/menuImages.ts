// Menu image imports
import ristretto from '@/assets/menu/ristretto.jpg';
import espresso from '@/assets/menu/espresso.jpg';
import espressoPorteno from '@/assets/menu/espresso-porteno.jpg';
import cappuccino from '@/assets/menu/cappuccino.jpg';
import latte from '@/assets/menu/latte.jpg';
import icedLatte from '@/assets/menu/iced-latte.jpg';
import mocha from '@/assets/menu/mocha.jpg';
import flatWhite from '@/assets/menu/flat-white.jpg';
import hotChocolate from '@/assets/menu/hot-chocolate.jpg';
import coldBrew from '@/assets/menu/cold-brew.jpg';
import earlGrey from '@/assets/menu/earl-grey.jpg';
import chaiLatte from '@/assets/menu/chai-latte.jpg';

// Image mapping based on menu item names or descriptions
export const getMenuItemImage = (nombre: string, imagen?: string): string => {
  // If there's already a local image path, return it
  if (imagen && imagen.startsWith('/src/assets/')) {
    const imageName = imagen.split('/').pop()?.replace('.jpg', '');
    
    switch (imageName) {
      case 'ristretto': return ristretto;
      case 'espresso': return espresso;
      case 'espresso-porteno': return espressoPorteno;
      case 'cappuccino': return cappuccino;
      case 'latte': return latte;
      case 'iced-latte': return icedLatte;
      case 'mocha': return mocha;
      case 'flat-white': return flatWhite;
      case 'hot-chocolate': return hotChocolate;
      case 'cold-brew': return coldBrew;
      case 'earl-grey': return earlGrey;
      case 'chai-latte': return chaiLatte;
      default: break;
    }
  }

  // Fallback mapping based on item name
  const name = nombre.toLowerCase();
  
  if (name.includes('ristretto')) return ristretto;
  if (name.includes('espresso') && name.includes('porteño')) return espressoPorteno;
  if (name.includes('cappuccino') || name.includes('capuccino')) return cappuccino;
  if (name.includes('latte') && name.includes('iced')) return icedLatte;
  if (name.includes('latte')) return latte;
  if (name.includes('flat white')) return flatWhite;
  if (name.includes('mocha')) return mocha;
  if (name.includes('chocolatada') || name.includes('chocolate')) return hotChocolate;
  if (name.includes('cold brew')) return coldBrew;
  if (name.includes('chai')) return chaiLatte;
  if (name.includes('earl grey') || name.includes('té') || name.includes('tea')) return earlGrey;
  if (name.includes('espresso') || name.includes('cortado') || name.includes('macchiato')) return espresso;
  
  // Default fallback
  return espresso;
};