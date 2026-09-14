import Image from 'next/image';
import logoSrc from './brand-icon.png';

type BrandLogoProps = {
  className?: string;
  priority?: boolean;
  size?: number;
};

export function BrandLogo({
  className = 'brand-logo',
  priority = false,
  size = 40,
}: BrandLogoProps) {
  return (
    <Image
      src={logoSrc}
      alt="メグリミナル"
      width={size}
      height={size}
      className={className}
      priority={priority}
    />
  );
}
