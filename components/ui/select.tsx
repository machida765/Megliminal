'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

type SelectContextValue = {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  items: { value: string; label: string }[];
  registerItem: (value: string, label: string) => void;
  setPlaceholder: (placeholder: string) => void;
};

const SelectContext = createContext<SelectContextValue | null>(null);

function useSelectContext() {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error('Select components must be used within Select');
  }
  return context;
}

export function Select({
  value,
  onValueChange,
  children,
}: {
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
}) {
  const [items, setItems] = useState<{ value: string; label: string }[]>([]);
  const [placeholder, setPlaceholder] = useState('選択してください');

  const registerItem = (itemValue: string, label: string) => {
    setItems((prev) => {
      if (prev.some((item) => item.value === itemValue)) {
        return prev.map((item) =>
          item.value === itemValue ? { value: itemValue, label } : item
        );
      }
      return [...prev, { value: itemValue, label }];
    });
  };

  return (
    <SelectContext.Provider
      value={{
        value,
        onValueChange,
        placeholder,
        items,
        registerItem,
        setPlaceholder,
      }}
    >
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger() {
  const { value, onValueChange, placeholder, items } = useSelectContext();

  return (
    <select
      className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {items.map((item) => (
        <option key={item.value} value={item.value}>
          {item.label}
        </option>
      ))}
    </select>
  );
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  const { setPlaceholder } = useSelectContext();

  useEffect(() => {
    if (placeholder) {
      setPlaceholder(placeholder);
    }
  }, [placeholder, setPlaceholder]);

  return null;
}

export function SelectContent({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function SelectItem({
  value,
  children,
}: {
  value: string;
  children: ReactNode;
}) {
  const { registerItem } = useSelectContext();

  useEffect(() => {
    registerItem(value, String(children));
  }, [value, children, registerItem]);

  return null;
}
