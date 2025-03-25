
import React, { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  error?: string;
  suffix?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  error,
  suffix,
  className,
  ...props
}) => {
  return (
    <div className="mb-4 animate-fade-up animate-delay-100">
      <label 
        htmlFor={name} 
        className="block text-sm font-medium text-white/90 mb-1"
      >
        {label}
      </label>
      <div className="relative rounded-xl overflow-hidden">
        <input
          id={name}
          name={name}
          className={cn(
            "w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl",
            "px-4 py-3 text-white placeholder:text-white/40",
            "transition-all duration-300 focus:outline-none focus:ring-2",
            "focus:ring-dam-blue/50 focus:border-dam-blue/50",
            error ? "border-red-500 focus:ring-red-500" : "",
            suffix ? "pr-12" : "",
            className
          )}
          {...props}
        />
        {suffix && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-white/60">
            {suffix}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
};

export default InputField;
