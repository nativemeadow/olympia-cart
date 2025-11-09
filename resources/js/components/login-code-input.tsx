import React, {
    useState,
    useRef,
    useEffect,
    ChangeEvent,
    KeyboardEvent,
} from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from './input-error';

import classes from './login-code-input.module.css';

type Props = {
    value: string; // The full 6-digit code
    onChange: (value: string) => void;
    error?: string;
};

const CODE_LENGTH = 6;

const LoginCodeInput = ({ value, onChange, error }: Props) => {
    const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        // When the external value is cleared (e.g., form reset), clear the digits.
        if (value === '') {
            setDigits(Array(CODE_LENGTH).fill(''));
        }
    }, [value]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
        const newDigit = e.target.value.replace(/[^0-9]/g, '');

        if (newDigit.length <= 1) {
            const newDigits = [...digits];
            newDigits[index] = newDigit;
            setDigits(newDigits);

            onChange(newDigits.join(''));

            // Move to the next input if a digit was entered
            if (newDigit && index < CODE_LENGTH - 1) {
                inputRefs.current[index + 1]?.focus();
            }
        }
    };

    const handleKeyDown = (
        e: KeyboardEvent<HTMLInputElement>,
        index: number,
    ) => {
        if (e.key === 'Backspace' && !digits[index] && index > 0) {
            // Move to the previous input on backspace if the current input is empty
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData
            .getData('text')
            .replace(/[^0-9]/g, '');
        if (pastedData.length === CODE_LENGTH) {
            const newDigits = pastedData.split('');
            setDigits(newDigits);
            onChange(newDigits.join(''));
            inputRefs.current[CODE_LENGTH - 1]?.focus();
        }
    };

    return (
        <div className={classes.loginCodeInput}>
            <Label htmlFor="login-code">Enter your 6-digit login code:</Label>
            <div className={classes.digitContainer} onPaste={handlePaste}>
                {digits.map((digit, index) => (
                    <Input
                        key={index}
                        ref={(el) => {
                            inputRefs.current[index] = el;
                        }}
                        type="tel" // 'tel' is often better for numeric inputs on mobile
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(e, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        className={classes.digitInput}
                        aria-label={`Digit ${index + 1}`}
                    />
                ))}
            </div>
            <InputError message={error} />
        </div>
    );
};

export default LoginCodeInput;
