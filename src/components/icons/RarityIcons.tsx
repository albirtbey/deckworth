import { SVGProps } from 'react';
import type { FC } from 'react';
import CSvg from './SVG/C.svg';
import USvg from './SVG/U.svg';
import RSvg from './SVG/R.svg';
import RRSvg from './SVG/RR.svg';
import URSvg from './SVG/UR.svg';
import IRSvg from './SVG/IR.svg';
import SIRSvg from './SVG/SIR.svg';
import HRSvg from './SVG/HR.svg';
import PROMOSvg from './SVG/PROMO.svg';

type RarityIconProps = SVGProps<SVGSVGElement>;

// Basic rarity icons that should be black
export const CommonIcon: FC<RarityIconProps> = (props) => (
  <CSvg {...props} className={['text-black', props.className].filter(Boolean).join(' ')} />
);

export const UncommonIcon: FC<RarityIconProps> = (props) => (
  <USvg {...props} className={['text-black', props.className].filter(Boolean).join(' ')} />
);

export const RareIcon: FC<RarityIconProps> = (props) => (
  <RSvg {...props} className={['text-black', props.className].filter(Boolean).join(' ')} />
);

export const DoubleRareIcon: FC<RarityIconProps> = (props) => (
  <RRSvg {...props} className={['text-black', props.className].filter(Boolean).join(' ')} />
);

// Special rarity icons keep their original colors
export const UltraRareIcon: FC<RarityIconProps> = (props) => (
  <URSvg {...props} className={['text-black', props.className].filter(Boolean).join(' ')} />
);

export const IllustrationRareIcon: FC<RarityIconProps> = (props) => (
  <IRSvg {...props} className={['text-black', props.className].filter(Boolean).join(' ')} />
);

export const SpecialIllustrationRareIcon: FC<RarityIconProps> = (props) => (
  <SIRSvg {...props} className={['text-black', props.className].filter(Boolean).join(' ')} />
);

export const HyperRareIcon: FC<RarityIconProps> = (props) => (
  <HRSvg {...props} className={['text-black', props.className].filter(Boolean).join(' ')} />
);

export const SecretRareIcon: FC<RarityIconProps> = (props) => (
  <PROMOSvg {...props} className={['text-black', props.className].filter(Boolean).join(' ')} />
);
