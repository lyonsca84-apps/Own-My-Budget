import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Car, 
  Plus, 
  Trash2, 
  Wrench, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronDown,
  DollarSign,
  Info
} from 'lucide-react';

interface RepairItem {
  id: string;
  name: string;
  category: 'Routine' | 'Common' | 'Major';
  estimatedCost: number;
  description: string;
}

const REPAIR_DATABASE: RepairItem[] = [
  // Routine Maintenance
  { id: 'oil-change', name: 'Oil and Filter Change', category: 'Routine', estimatedCost: 75, description: 'Synthetic costs more. Essential every 5k-10k miles.' },
  { id: 'tire-rotation', name: 'Tire Rotation', category: 'Routine', estimatedCost: 40, description: 'Ensures even tire wear and extends tire life.' },
  { id: 'wiper-blades', name: 'Wiper Blade Replacement', category: 'Routine', estimatedCost: 30, description: 'Critical for visibility during rain/snow.' },
  { id: 'air-filter', name: 'Air Filter Replacement (Engine/Cabin)', category: 'Routine', estimatedCost: 45, description: 'Improves air quality and engine performance.' },
  { id: 'alignment', name: 'Wheel Alignment', category: 'Routine', estimatedCost: 110, description: 'Prevents uneven tire wear and steering pull.' },
  { id: 'inspection', name: 'Multi-point Inspection', category: 'Routine', estimatedCost: 50, description: 'Comprehensive check of all major systems.' },

  // Common Repairs
  { id: 'brake-pads', name: 'Brake Pad Replacement', category: 'Common', estimatedCost: 225, description: 'Price per axle. Essential for stopping power.' },
  { id: 'battery', name: 'Battery Replacement', category: 'Common', estimatedCost: 175, description: 'Typically lasts 3-5 years.' },
  { id: 'rotors', name: 'Brake Rotor/Caliper Replacement', category: 'Common', estimatedCost: 450, description: 'Often needed if pads are worn too thin.' },
  { id: 'oxygen-sensor', name: 'Oxygen Sensor Replacement', category: 'Common', estimatedCost: 250, description: 'Improves fuel economy and reduces emissions.' },
  { id: 'alternator', name: 'Alternator/Starter Replacement', category: 'Common', estimatedCost: 550, description: 'Critical for starting and charging the battery.' },
  { id: 'timing-belt', name: 'Timing Belt Replacement', category: 'Common', estimatedCost: 850, description: 'Preventative maintenance to avoid engine failure.' },
  { id: 'windshield', name: 'Windshield Replacement', category: 'Common', estimatedCost: 400, description: 'Price varies significantly by vehicle and sensors.' },

  // Major/Unexpected Repairs
  { id: 'fuel-pump', name: 'Fuel Pump/Injector Replacement', category: 'Major', estimatedCost: 750, description: 'Essential for delivering fuel to the engine.' },
  { id: 'catalytic', name: 'Catalytic Converter Replacement', category: 'Major', estimatedCost: 1600, description: 'Expensive part due to precious metals.' },
  { id: 'transmission', name: 'Transmission Replacement', category: 'Major', estimatedCost: 3500, description: 'One of the most expensive mechanical repairs.' },
  { id: 'engine', name: 'Engine Replacement', category: 'Major', estimatedCost: 5500, description: 'Major overhaul or replacement of the power unit.' },
];

interface AutoMaintenanceScreenProps {
  onAddToBudget?: (total: number, repairs: any[]) => void;
}

export const AutoMaintenanceScreen: React.FC<AutoMaintenanceScreenProps> = ({ onAddToBudget }) => {
  const [selectedRepairs, setSelectedRepairs] = useState<RepairItem[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const addRepair = (repair: RepairItem) => {
    setSelectedRepairs([...selectedRepairs, { ...repair, id: `${repair.id}-${Date.now()}` }]);
    setIsDropdownOpen(false);
  };

  const removeRepair = (id: string) => {
    setSelectedRepairs(selectedRepairs.filter(item => item.id !== id));
  };

  const totalCost = selectedRepairs.reduce((sum, item) => sum + item.estimatedCost, 0);

  const handleAddToBudget = () => {
    if (onAddToBudget && selectedRepairs.length > 0) {
      onAddToBudget(totalCost, selectedRepairs);
      setSelectedRepairs([]); // Clear after adding
    }
  };

  const categories = {
    Routine: REPAIR_DATABASE.filter(r => r.category === 'Routine'),
    Common: REPAIR_DATABASE.filter(r => r.category === 'Common'),
    Major: REPAIR_DATABASE.filter(r => r.category === 'Major'),
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-deep-navy tracking-tight flex items-center gap-3">
            <Car className="text-clarity-purple" />
            Auto Maintenance Estimator
          </h2>
          <p className="text-gray-500 mt-1">Estimate and plan for your vehicle's repair expenses.</p>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full md:w-auto bg-clarity-purple text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-opacity-90 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            <span>Add Repair Expense</span>
            <ChevronDown size={18} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-full md:w-[400px] bg-white rounded-2xl shadow-2xl border border-mist-purple z-50 max-h-[500px] overflow-y-auto p-4"
              >
                {Object.entries(categories).map(([category, items]) => (
                  <div key={category} className="mb-6 last:mb-0">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">
                      {category === 'Routine' && 'Routine Maintenance (Low-Mid)'}
                      {category === 'Common' && 'Common Repairs (Mid-High)'}
                      {category === 'Major' && 'Major/Unexpected Repairs'}
                    </h4>
                    <div className="space-y-1">
                      {items.map(item => (
                        <button
                          key={item.id}
                          onClick={() => addRepair(item)}
                          className="w-full text-left p-3 rounded-xl hover:bg-soft-lavender transition-colors group flex justify-between items-center"
                        >
                          <div>
                            <p className="font-bold text-sm text-deep-navy group-hover:text-clarity-purple transition-colors">{item.name}</p>
                            <p className="text-[10px] text-gray-500 line-clamp-1">{item.description}</p>
                          </div>
                          <span className="font-bold text-sm text-deep-navy">${item.estimatedCost}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Selected Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-card border border-mist-purple overflow-hidden shadow-sm">
            <div className="p-6 border-b border-mist-purple bg-gray-50/50">
              <h3 className="font-bold text-deep-navy flex items-center gap-2">
                <Wrench size={18} className="text-clarity-purple" />
                Repair List
              </h3>
            </div>
            
            <div className="divide-y divide-mist-purple/30">
              {selectedRepairs.length === 0 ? (
                <div className="p-12 text-center space-y-4">
                  <div className="w-16 h-16 bg-soft-lavender rounded-full flex items-center justify-center mx-auto text-clarity-purple">
                    <Car size={32} />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-deep-navy">No repairs selected</p>
                    <p className="text-sm text-gray-500">Add items from the dropdown to start estimating.</p>
                  </div>
                </div>
              ) : (
                selectedRepairs.map((item) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={item.id} 
                    className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors group"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      item.category === 'Routine' ? 'bg-calm-blue/10 text-calm-blue' :
                      item.category === 'Common' ? 'bg-clarity-purple/10 text-clarity-purple' :
                      'bg-red-100 text-red-500'
                    }`}>
                      {item.category === 'Routine' ? <CheckCircle2 size={20} /> :
                       item.category === 'Common' ? <Wrench size={20} /> :
                       <AlertTriangle size={20} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm text-deep-navy">{item.name}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          item.category === 'Routine' ? 'bg-calm-blue/10 text-calm-blue' :
                          item.category === 'Common' ? 'bg-clarity-purple/10 text-clarity-purple' :
                          'bg-red-100 text-red-500'
                        }`}>
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <p className="font-bold text-deep-navy">${item.estimatedCost}</p>
                      <button 
                        onClick={() => removeRepair(item.id)}
                        className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {selectedRepairs.length > 0 && (
              <div className="p-6 bg-deep-navy text-white flex justify-between items-center">
                <span className="font-bold text-lg">Total Estimated Cost</span>
                <span className="text-3xl font-bold">${totalCost.toLocaleString()}</span>
              </div>
            )}
          </div>

          <div className="bg-soft-lavender/30 rounded-2xl p-6 border border-clarity-purple/10 flex gap-4">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-clarity-purple shadow-sm shrink-0">
              <Info size={24} />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-deep-navy">Pro Tip: Emergency Fund</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                Experts recommend keeping at least $1,000 to $2,000 specifically for unexpected car repairs. 
                Major repairs like transmissions or engines can happen suddenly and significantly impact your budget.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Summary & Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-card p-6 border border-mist-purple shadow-sm space-y-6">
            <h3 className="font-bold text-deep-navy">Cost Breakdown</h3>
            
            <div className="space-y-4">
              {['Routine', 'Common', 'Major'].map(cat => {
                const catTotal = selectedRepairs
                  .filter(r => r.category === cat)
                  .reduce((sum, r) => sum + r.estimatedCost, 0);
                const percentage = totalCost > 0 ? (catTotal / totalCost) * 100 : 0;
                
                return (
                  <div key={cat} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 font-medium">{cat} Repairs</span>
                      <span className="font-bold text-deep-navy">${catTotal}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        className={`h-full ${
                          cat === 'Routine' ? 'bg-calm-blue' :
                          cat === 'Common' ? 'bg-clarity-purple' :
                          'bg-red-400'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-mist-purple">
              <button 
                onClick={handleAddToBudget}
                disabled={selectedRepairs.length === 0}
                className="w-full bg-deep-navy text-white py-4 rounded-xl font-bold shadow-lg hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <DollarSign size={18} />
                Add to Budget Plan
              </button>
            </div>
          </div>

          <div className="bg-white rounded-card p-6 border border-mist-purple shadow-sm">
            <h3 className="font-bold text-deep-navy mb-4">Maintenance Schedule</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-growth-teal/10 text-growth-teal flex items-center justify-center shrink-0">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-deep-navy">Every 5,000 Miles</p>
                  <p className="text-[10px] text-gray-500">Oil change, tire rotation, multi-point inspection.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-calm-blue/10 text-calm-blue flex items-center justify-center shrink-0">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-deep-navy">Every 30,000 Miles</p>
                  <p className="text-[10px] text-gray-500">Air filters, brake fluid, coolant flush.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-clarity-purple/10 text-clarity-purple flex items-center justify-center shrink-0">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-deep-navy">Every 60,000 Miles</p>
                  <p className="text-[10px] text-gray-500">Brake pads, battery, spark plugs, belts.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
