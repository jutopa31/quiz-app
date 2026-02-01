import type { ReactNode } from 'react'

interface ContainerProps {
  children: ReactNode
  className?: string
}

export function Container({ children, className = '' }: ContainerProps) {
  return (
    <main className={`max-w-lg mx-auto px-4 pb-20 pt-4 ${className}`}>
      {children}
    </main>
  )
}
