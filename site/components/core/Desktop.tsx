import Dock from '../dock/Dock'
import Menu from '../menu/Menu'

import { DockOption } from '../../src/view/DockOption'
import { MenuOption } from '../../src/view/MenuOption'
import Terminal from '../apps/terminal/Terminal'

const menus: MenuOption[] = [
  { id: 'home', name: 'gOS', items: [] },
  { id: 'file', name: 'File', items: [] },
  { id: 'edit', name: 'Edit', items: [] },
  { id: 'go', name: 'Go', items: [] },
  { id: 'run', name: 'Run', items: [] },
  { id: 'window', name: 'Window', items: [] },
  { id: 'Help', name: 'Help', items: [] },
]

const docks: DockOption[] = [
  { id: 'finder', name: 'Finder', icon: '/assets/os/app-icons/finder/256.webp', action: async () => console.log('Finder') },
  { id: 'launchpad', name: 'Launchpad', icon: '/assets/os/app-icons/launchpad/256.png', action: async () => console.log('Launchpad') },
  { id: 'terminal', name: 'Terminal', icon: '/assets/os/app-icons/terminal/256.png', action: async () => console.log('Terminal') },
]

export function Desktop(): JSX.Element {
  return (
    <>
      <Menu items={menus}></Menu>
      <section>
        <Terminal></Terminal>
      </section>
      <Dock items={docks}></Dock>
    </>
  )
}
