import { nextTick, useTemplateRef } from 'vue'

/**
 * Keyboard support for a tablist (WAI-ARIA tabs pattern): arrows move and select, Home/End jump,
 * the selected tab is the only one in the tab order. `refKey` names the template ref set on the tabs.
 */
export function useRovingTabs(
  refKey: string,
  count: () => number,
  select: (i: number) => void,
) {
  const tabs = useTemplateRef<HTMLButtonElement[]>(refKey)

  async function onKey(e: KeyboardEvent, i: number) {
    const last = count() - 1
    const moves: Record<string, number> = {
      ArrowRight: i === last ? 0 : i + 1,
      ArrowDown: i === last ? 0 : i + 1,
      ArrowLeft: i === 0 ? last : i - 1,
      ArrowUp: i === 0 ? last : i - 1,
      Home: 0,
      End: last,
    }
    if (!(e.key in moves)) return
    e.preventDefault()
    const next = moves[e.key]
    select(next)
    await nextTick()
    tabs.value?.[next]?.focus()
  }

  return { onKey }
}
