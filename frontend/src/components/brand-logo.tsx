type Props = {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'size-7',
  md: 'size-9',
  lg: 'size-12',
} as const

export function BrandLogo({ size = 'md', className = '' }: Props) {
  return <img src="/favicon.svg" alt="" aria-hidden="true" className={`${sizeClasses[size]} shrink-0 rounded-[25%] ${className}`} />
}
