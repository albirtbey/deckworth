import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import type { SmartFolder } from '../../types';

interface SmartFolderBuilderProps {
  onSave: (folder: SmartFolder) => void;
}

export function SmartFolderBuilder({ onSave }: SmartFolderBuilderProps) {
  const [name, setName] = useState('');
  const [rules, setRules] = useState<SmartFolder['rules']>([]);

  const addRule = () => {
    setRules([...rules, { field: 'name', operator: 'contains', value: '' }]);
  };

  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const updateRule = (index: number, updates: Partial<SmartFolder['rules'][0]>) => {
    setRules(rules.map((rule, i) => i === index ? { ...rule, ...updates } : rule));
  };

  const handleSave = () => {
    if (name && rules.length > 0) {
      onSave({
        id: crypto.randomUUID(),
        name,
        rules,
      });
      setName('');
      setRules([]);
    }
  };

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Create Smart Folder</h3>
      
      <div className="space-y-4">
        <Input
          label="Folder Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Valuable Charizards"
        />

        <div className="space-y-2">
          {rules.map((rule, index) => (
            <div key={index} className="flex items-center gap-2">
              <select
                className="input flex-1"
                value={rule.field}
                onChange={(e) => updateRule(index, { field: e.target.value as keyof CollectionCard })}
              >
                <option value="name">Card Name</option>
                <option value="setName">Set Name</option>
                <option value="rarity">Rarity</option>
                <option value="marketValue">Market Value</option>
                <option value="condition">Condition</option>
              </select>
              
              <select
                className="input w-32"
                value={rule.operator}
                onChange={(e) => updateRule(index, { operator: e.target.value as SmartFolder['rules'][0]['operator'] })}
              >
                <option value="contains">Contains</option>
                <option value="equals">Equals</option>
                <option value="greater">Greater Than</option>
                <option value="less">Less Than</option>
                <option value="between">Between</option>
              </select>
              
              <Input
                className="flex-1"
                value={rule.value}
                onChange={(e) => updateRule(index, { value: e.target.value })}
                placeholder="Value"
              />
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeRule(index)}
                className="shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={addRule}>
            <Plus className="mr-2 h-4 w-4" />
            Add Rule
          </Button>
          
          <Button onClick={handleSave} disabled={!name || rules.length === 0}>
            Create Folder
          </Button>
        </div>
      </div>
    </Card>
  );
}