import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { buttonClasses, type ButtonSize, type ButtonVariant } from './buttonStyles'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: ReactNode
  iconRight?: ReactNode
  fullWidth?: boolean
}

export function Button({ variant = 'primary', size = 'md', icon, iconRight, fullWidth, className, children, ...props }: ButtonProps) {
  return (
    <button className={buttonClasses({ variant, size, fullWidth, className })} {...props}>
      {icon}
      {children}
      {iconRight}
    </button>
  )
}

interface ButtonLinkProps extends LinkProps {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: ReactNode
  iconRight?: ReactNode
  fullWidth?: boolean
  /** Desabilitado vira texto sem link (um <a> não tem estado disabled de verdade). */
  disabled?: boolean
}

/**
 * Link com aparência de botão. Substitui o antigo `<Link><Button/></Link>`: botão dentro de link é
 * HTML inválido, recebia foco duas vezes no teclado e continuava navegando mesmo "desabilitado".
 */
export function ButtonLink({ variant = 'primary', size = 'md', icon, iconRight, fullWidth, disabled, className, children, ...props }: ButtonLinkProps) {
  const classes = buttonClasses({ variant, size, fullWidth, className })
  if (disabled) {
    return (
      <span className={classes} aria-disabled="true">
        {icon}
        {children}
        {iconRight}
      </span>
    )
  }
  return (
    <Link className={classes} {...props}>
      {icon}
      {children}
      {iconRight}
    </Link>
  )
}
