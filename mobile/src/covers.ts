import { Project } from './api';

// Showcase photos double as fallback covers.
export const SLIDE_IMAGES = [
  require('../assets/showcase/slide1.jpg'),
  require('../assets/showcase/slide2.jpg'),
  require('../assets/showcase/slide3.jpg'),
  require('../assets/showcase/slide4.jpg'),
  require('../assets/showcase/slide5.jpg'),
];

// Each project gets its own cover photo, matched by name.
const COVERS = [
  { match: 'wedding', img: require('../assets/covers/wedding.jpg') },
  { match: 'graduation', img: require('../assets/covers/graduation.jpg') },
  { match: 'brand', img: require('../assets/covers/brand.jpg') },
  { match: 'corporate', img: require('../assets/covers/corporate.jpg') },
];

export function coverFor(p: Project) {
  return (
    COVERS.find((c) => p.title.toLowerCase().includes(c.match))?.img ??
    SLIDE_IMAGES[p.id % SLIDE_IMAGES.length]
  );
}
