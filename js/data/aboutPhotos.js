/**
 * Central photo data for the "A little about me" collage.
 *
 * ── HOW TO ADD A CAPTION ─────────────────────────────────────────────
 * Type your caption between the quotes of the `caption` field, e.g.
 *     caption: "Sunset in Lisbon after a day of exploring.",
 * Leave it as "" and no caption is shown for that photo.
 * You can also reorder photos, change `featured`, or edit `alt` text.
 * `layout` is "portrait", "landscape", or "square" (controls its shape).
 * ─────────────────────────────────────────────────────────────────────
 *
 * @typedef {Object} AboutPhoto
 * @property {string} src
 * @property {string} alt
 * @property {string} caption
 * @property {boolean} featured
 * @property {"portrait"|"landscape"|"square"} layout
 */

/** @type {AboutPhoto[]} */
export const aboutPhotos = [
  {
    src: "photos/IMG_8405.jpeg",
    alt: "Personal travel photograph at sunset by the water",
    caption: "", // ← type your caption here
    featured: true,
    layout: "square"
  },
  {
    src: "photos/IMG_2021.jpeg",
    alt: "Personal photograph in front of snowy mountains",
    caption: "", // ← type your caption here
    featured: false,
    layout: "landscape"
  },
  {
    src: "photos/IMG_6132.JPG",
    alt: "Personal photograph from a snowboarding day",
    caption: "", // ← type your caption here
    featured: false,
    layout: "portrait"
  },
  {
    src: "photos/IMG_0236.JPG",
    alt: "Personal photograph from a climbing day with friends",
    caption: "", // ← type your caption here
    featured: false,
    layout: "landscape"
  },
  {
    src: "photos/IMG_2195.jpeg",
    alt: "Personal photograph on a ski slope",
    caption: "", // ← type your caption here
    featured: false,
    layout: "portrait"
  },
  {
    src: "photos/d741e88561d6b5e182debbe6bea60feb.JPG",
    alt: "Personal photograph of a ski jump against a blue sky",
    caption: "", // ← type your caption here
    featured: false,
    layout: "portrait"
  },
  {
    src: "photos/IMG_1596.jpeg",
    alt: "Outdoor photograph at a leafy climbing crag",
    caption: "", // ← type your caption here
    featured: false,
    layout: "portrait"
  },
  {
    src: "photos/IMG_2923.jpeg",
    alt: "Personal photograph of tennis rackets on a court",
    caption: "", // ← type your caption here
    featured: false,
    layout: "portrait"
  }
];
