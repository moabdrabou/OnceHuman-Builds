import React from 'react'
import { 
  GiRifle, 
  GiWinchesterRifle, 
  GiPistolGun, 
  GiBowieKnife, 
  GiShotgun, 
  GiMachineGun, 
  GiSawedOffShotgun, 
  GiM3GreaseGun, 
  GiMinigun,
  GiCrossedPistols,
  GiCrossedSwords
} from "react-icons/gi"
import { Sword, Crosshair, Target } from "lucide-react"

/**
 * Dedicated icon library for tactical weapons.
 * Combines Game Icons (Gi) for specific silhouettes with Lucide for generic fallback/status icons.
 */
export const WEAPON_ICONS = {
  // Firearms
  AssaultRifle: GiRifle,
  SniperRifle: GiWinchesterRifle,
  Shotgun: GiShotgun,
  SawedOffShotgun: GiSawedOffShotgun,
  MachineGun: GiMachineGun,
  SubmachineGun: GiM3GreaseGun, // Best visual SMG match
  GatlingGun: GiMinigun,        // Best visual Gatling match
  Pistol: GiPistolGun,
  
  // Melee
  Melee: Sword,                // User preferred Lucide Sword for Melee visibility
  CombatKnife: GiBowieKnife,
  CrossedSwords: GiCrossedSwords,
  
  // Tactical/Status
  Crosshair: Crosshair,
  Target: Target,
  CrossedPistols: GiCrossedPistols,
} as const

export type WeaponIconKey = keyof typeof WEAPON_ICONS

interface WeaponIconProps {
  type: WeaponIconKey
  className?: string
}

/**
 * Helper component to render weapon icons by type name
 */
export const WeaponIcon = ({ type, className }: WeaponIconProps) => {
  const Icon = WEAPON_ICONS[type] || Crosshair
  return <Icon className={className} />
}
