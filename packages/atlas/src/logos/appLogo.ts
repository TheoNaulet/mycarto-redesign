// Logo d'une application connue par son nom (MOODLE, LIMESURVEY, HAL…) ou par son éditeur.
import { getApplication } from '../data/applications'
import { logoFor } from './logoFor'
import type { LogoName } from './logos'

export function appLogo(name: string): LogoName | undefined {
  return logoFor(name, getApplication(name)?.editeur)
}
