/**
 * Photo data for the rotating Polaroid gallery in the About section.
 *
 * `orientation` is an initial hint only; the gallery re-detects it at
 * runtime from each image's real pixel dimensions (naturalWidth /
 * naturalHeight), which the browser reports EXIF-corrected.
 *
 * @typedef {Object} AboutPhoto
 * @property {string} id
 * @property {string} src
 * @property {string} alt
 * @property {string} title     - short heading shown on the flipped card
 * @property {string} caption   - description shown beneath the title
 * @property {"portrait"|"landscape"} [orientation]
 */

/** @type {AboutPhoto[]} */
export const galleryPhotos = [
  {
    id: "ap-1", src: "photos/IMG_8405.jpeg", orientation: "portrait",
    alt: "Personal travel photograph at sunset by the water",
    title: "First solo trip to Portugal",
    caption: "My first solo trip right after graduating from undergrad."
  },
  {
    id: "ap-2", src: "photos/IMG_2021.jpeg", orientation: "landscape",
    alt: "Personal photograph pointing toward a snowy peak in the Alps",
    title: "Snowboarding in the Alps",
    caption: "Pointing toward a tiny peak after making it all the way to the top."
  },
  {
    id: "ap-3", src: "photos/IMG_6132.JPG", orientation: "portrait",
    alt: "Personal photograph at Keystone in a yellow jacket and pink pants",
    title: "Keystone, Colorado",
    caption: "A chicken-yellow jacket and bright pink pants for a sunny day on the slopes at Keystone."
  },
  {
    id: "ap-4", src: "photos/IMG_0236.JPG", orientation: "landscape",
    alt: "Personal photograph from a lead climb with friends",
    title: "First outdoor lead climb with friends",
    caption: "My first time lead climbing outside, made even better by having friends beside me."
  },
  {
    id: "ap-5", src: "photos/IMG_2195.jpeg", orientation: "portrait",
    alt: "Personal photograph skiing at Les 3 Vallées in the French Alps",
    title: "Solo skiing through Les 3 Vallées, French Alps",
    caption: "Solo laps through Les 3 Vallées, surrounded by some of the most beautiful mountains I’ve ever seen."
  },
  {
    id: "ap-6", src: "photos/d741e88561d6b5e182debbe6bea60feb.JPG", orientation: "portrait",
    alt: "Personal photograph on a steep ski run against a blue sky",
    title: "First double-black ski run at Beaver Creek, Colorado",
    caption: "My first double-black run, after a friend coached me through it on skis."
  },
  {
    id: "ap-7", src: "photos/IMG_1596.jpeg", orientation: "portrait",
    alt: "Outdoor photograph climbing a crag among green trees at Rumney",
    title: "Outdoor climbing at Rumney, New Hampshire",
    caption: "Climbing high above the trees at Rumney!"
  },
  {
    id: "ap-8", src: "photos/IMG_2923.jpeg", orientation: "portrait",
    alt: "Personal photograph of tennis rackets on a court in Chicago",
    title: "Tennis at Maggie Daley Park, Chicago",
    caption: "Sunny afternoons, long rallies, and tennis in the middle of Chicago."
  }
];
