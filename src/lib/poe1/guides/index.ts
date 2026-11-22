import { GUIDE, GUIDE_PATH } from './temple/meta';

export interface GuideCard {
  href: string;
  title: string;
  desc: string;
  updatedAt: string;
}

/** Every PoE 1 guide, newest first. Add a guide by adding an entry. */
export const POE1_GUIDES: GuideCard[] = [
  {
    href: GUIDE_PATH,
    title: 'Temple of Atzoatl farm',
    desc: 'The 3.30 eight-Thread, three-map Incursion loop that builds a Cradle of Creation Temple: setup, Architect and door choices, selling and a profit calculator.',
    updatedAt: GUIDE.updatedAt,
  },
];
