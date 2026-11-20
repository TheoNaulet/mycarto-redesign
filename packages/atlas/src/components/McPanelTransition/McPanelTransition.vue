<script setup lang="ts">
// Ouverture et fermeture d'un panneau latéral (inspecteur, légende) : il glisse depuis la droite en fondu.
// À la fermeture, le panneau est figé à sa place pendant qu'il s'efface : les panneaux voisins reprennent
// leur place tout de suite, sans saut. Quand on passe d'un objet à un autre (panneau à clé),
// l'ancien s'efface sous le nouveau qui arrive : un fondu enchaîné.
function pin(el: Element) {
  const h = el as HTMLElement
  if (!h.offsetParent) return
  const { offsetTop: top, offsetLeft: left, offsetWidth: width, offsetHeight: height } = h
  Object.assign(h.style, { position: 'absolute', top: `${top}px`, left: `${left}px`, width: `${width}px`, height: `${height}px`, margin: '0', pointerEvents: 'none' })
}
</script>

<template>
  <Transition name="mc-panel" @before-leave="pin">
    <slot />
  </Transition>
</template>
