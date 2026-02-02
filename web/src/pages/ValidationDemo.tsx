
import React, { useState } from 'react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { validateEmail, validatePassword, validateName } from '../utils/validation';

const ValidationDemo = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: ''
    });

    const [errors, setErrors] = useState<Record<string, string | null>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error on change
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors = {
            email: validateEmail(formData.email),
            password: validatePassword(formData.password),
            name: validateName(formData.name)
        };

        setErrors(newErrors);

        const hasErrors = Object.values(newErrors).some(error => error !== null);
        if (!hasErrors) {
            alert('Form submitted successfully!');
        }
    };

    return (
        <div className="p-8 max-w-md mx-auto bg-gray-900 text-white min-h-screen">
            <h1 className="text-2xl font-bold mb-6">Validation Demo</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    error={errors.name || undefined}
                    placeholder="John Doe"
                />

                <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email || undefined}
                    placeholder="john@example.com"
                />

                <Input
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password || undefined}
                    placeholder="••••••••"
                    helperText="Must be at least 8 characters"
                />

                <Button type="submit" fullWidth>
                    Validate & Submit
                </Button>
            </form>
        </div>
    );
};

export default ValidationDemo;
