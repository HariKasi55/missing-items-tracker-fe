// Map each equipment type to a Med-Icons image path
export const equipmentTypeIconPaths: Record<string, string> = {
  'Telemetry Systems': '/Med-Icons/TeloBox.png',
  'Module Infusion': '/Med-Icons/Module- Infusion.png',
  'Bed East': '/Med-Icons/Bed.png',
  'Pump Infusion': '/Med-Icons/Pump- Infusion.png',
  'Monitors': '/Med-Icons/Monitors.png',
  'Wheelchairs': '/Med-Icons/wheelchair.png',
  'IV Poles': '/Med-Icons/IV-Pole.png',
  'Crash Carts': '/Med-Icons/Crash Cart.png',
  'Ventilators': '/Med-Icons/Ventilators.png',
  'Defibrillators': '/Med-Icons/Defibrillators.png',
  'Oxygen Tanks': '/Med-Icons/Tablet.png', //generic/placeholder 
  'Beds': '/Med-Icons/Bed.png',
  'Stretchers': '/Med-Icons/Strecther.png',
  'Other': '/Med-Icons/Tablet.png', // generic/placeholder
};

export function getEquipmentTypeIconPath(type: string): string {
  return equipmentTypeIconPaths[type] || equipmentTypeIconPaths['Other'];
} 