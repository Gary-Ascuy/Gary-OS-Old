import { DockOption } from "../../src/core/DockOption"
import DockItem from "./DockItem"


export interface DockProps {
  items: DockOption[]
}

export default function Dock({ items }: DockProps): JSX.Element {
  return (
    <section>
      {items.map((item) => <DockItem key={item.id} {...item} />)}
    </section>
  )
}
