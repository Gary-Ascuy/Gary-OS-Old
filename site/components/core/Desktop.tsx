import { DockOption } from "../../src/core/DockOption";
import Dock from "../dock/Dock";

const items: DockOption[] = [
  { id: 'finder', name: 'Finder', icon: '/assets/os/app-icons/finder/256.webp', action: async () => console.log('Finder') },
  { id: 'launchpad', name: 'Launchpad', icon: '/assets/os/app-icons/launchpad/256.png', action: async () => console.log('Launchpad') },
  { id: 'terminal', name: 'Terminal', icon: '/assets/os/app-icons/terminal/256.png', action: async () => console.log('Terminal') },
]

export function Desktop(): JSX.Element {
  return (
    <Dock items={items}></Dock>
  )
}
