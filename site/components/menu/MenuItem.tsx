import { MenuOption } from '../../src/view/MenuOption'
import style from './MenuItem.module.css'

export interface MenuItemProps extends MenuOption { }

export default function MenuItem({ id, name }: MenuItemProps): JSX.Element {
  return (
    <span id={id} className={style.item}>{name}</span>
  )
}
