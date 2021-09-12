/* eslint-disable @next/next/no-img-element */

import { DockOption } from "../../src/core/DockOption";
import style from './DockItem.module.css'

export interface DockItemProps extends DockOption {
}

export default function DockItem({ id, name, icon, action }: DockItemProps): JSX.Element {
  return (
    <button className={style.item} title={name} onClick={action}>
      <span>
        <p className={style.tooltip}>{name}</p>
        <img className={style.icon} src={icon} alt={name}></img>
      </span>
    </button>
  )
}
