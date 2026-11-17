import produceTomatoes from '../assets/img/produce-tomatoes.jpeg'
import produceMaize from '../assets/img/produce-maize.jpeg'
import produceBeans from '../assets/img/produce-beans.jpeg'
import producePotatoes from '../assets/img/produce-potatoes.jpeg'
import produceCabbages from '../assets/img/produce-cabbages.jpeg'
import produceOnions from '../assets/img/produce-onions.jpeg'

const produceImages = {
  tomatoes: produceTomatoes,
  maize: produceMaize,
  beans: produceBeans,
  potatoes: producePotatoes,
  cabbage: produceCabbages,
  cabbages: produceCabbages,
  onions: produceOnions,
}

export function getProduceImage(name) {
  return produceImages[String(name || '').trim().toLowerCase()] || produceTomatoes
}
