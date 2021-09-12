/* eslint-disable @next/next/no-img-element */

import { DockOption } from "../../src/core/DockOption";

export interface DockItemProps extends DockOption {
}

export default function DockItem({ id, name, icon, action }: DockItemProps): JSX.Element {
  return (
    <button title={name} onClick={action}>
      <span>
        <p>{name}</p>
        <img src={icon} alt={name}></img>
      </span>
    </button>
  )
}
