type Props = {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  alt?: string
}

const sizeClasses = {
  sm: 'size-7',
  md: 'size-9',
  lg: 'size-12',
} as const

export function BrandLogo({ size = 'md', className = '', alt = 'Inkwell home' }: Props) {
  return <img src="/favicon.svg" alt={alt} className={`${sizeClasses[size]} shrink-0 rounded-[25%] ${className}`} />
}
