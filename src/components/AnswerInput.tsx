import React, { useState, useEffect } from 'react';

interface AnswerInputProps {
  maxValue: number;
  onAnswerChange: (value: number) => void;
  unit?: string;
  correctAnswer: number; // Add this to determine if decimals should be used
}

const AnswerInput: React.FC<AnswerInputProps> = ({ maxValue, onAnswerChange, unit = '', correctAnswer }) => {
  // Determine if we should use decimal precision based on the correct answer
  const useDecimals = correctAnswer % 1 !== 0; // Only use decimals if correct answer has decimal places
  const decimalPlaces = useDecimals ? 2 : 0;
  const maxCharacters = 7;
  
  // Calculate initial value that avoids being exactly the correct answer
  const getInitialValue = () => {
    const midPoint = maxValue / 2;
    const correctAnswerPosition = (correctAnswer / maxValue) * 100; // Percentage position
    
    // If correct answer is in the middle 40% of the range (30%-70%), 
    // start from a different position
    if (correctAnswerPosition >= 30 && correctAnswerPosition <= 70) {
      // Start from 25% of the range instead of 50%
      return useDecimals ? maxValue * 0.25 : Math.floor(maxValue * 0.25);
    }
    
    // Otherwise use the middle as before
    return useDecimals ? midPoint : Math.floor(midPoint);
  };
  
  const [value, setValue] = useState(getInitialValue());

  // Track if user has started typing
  const [hasUserInput, setHasUserInput] = useState(false);

  useEffect(() => {
    // Only call onAnswerChange if user has actually input something
    if (hasUserInput) {
      onAnswerChange(value);
    }
  }, [value, onAnswerChange, hasUserInput]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Check character limit first
    if (inputValue.length > maxCharacters) {
      return; // Don't update if exceeds character limit
    }
    
    setHasUserInput(true);
    
    if (useDecimals) {
      // For decimal values, allow digits, decimal point, and commas
      let cleanValue = inputValue.replace(/[^0-9.]/g, ''); // Allow only digits and decimal points
      
      // Handle multiple decimal points - keep only the first one
      const decimalIndex = cleanValue.indexOf('.');
      if (decimalIndex !== -1) {
        cleanValue = cleanValue.substring(0, decimalIndex + 1) + cleanValue.substring(decimalIndex + 1).replace(/\./g, '');
      }
      
      const newValue = parseFloat(cleanValue) || 0;
      setValue(newValue);
    } else {
      // For integer values, only allow digits and commas
      const cleanValue = inputValue.replace(/[^0-9]/g, ''); // Allow only digits
      
      const newValue = parseInt(cleanValue) || 0;
      setValue(newValue);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && hasUserInput && value > 0) {
      // Trigger submit by calling onAnswerChange which will enable the submit button
      // The parent component should handle the actual submission
      e.preventDefault();
      
      // Find and click the submit button
      const submitButton = document.getElementById('submit-button') as HTMLButtonElement;
      if (submitButton && !submitButton.disabled) {
        submitButton.click();
      }
    }
  };

  const formatDisplayValue = (val: number): string => {
    if (useDecimals) {
      // For decimal display, don't add commas to avoid confusion
      return val.toFixed(decimalPlaces);
    }
    // For integers, use comma formatting
    return Math.round(val).toLocaleString();
  };

  // Format the input value for display (what user sees while typing)
  const formatInputValue = (val: number): string => {
    if (useDecimals) {
      // For decimals, show the raw number without comma formatting to avoid input confusion
      return val.toString();
    }
    // For integers, show raw number to avoid input confusion with commas
    return Math.round(val).toString();
  };

  return (
    <div className="space-y-3">
      {/* Main Answer Display */}
      <div className="text-center">
        <div className="relative">
          <input
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={maxCharacters}
            value={hasUserInput ? formatInputValue(value) : ''}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            className="w-full text-2xl font-bold text-center text-emerald-400 bg-gray-700 border-2 border-emerald-500/50 rounded-xl py-2 px-3 focus:border-emerald-400 focus:outline-none transition-all hover:border-emerald-400/70 placeholder:text-gray-400 placeholder:font-light placeholder:tracking-tight placeholder:text-left"
            placeholder="Make a guess"
          />
          {unit && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base font-semibold text-emerald-500">
              {unit}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnswerInput;