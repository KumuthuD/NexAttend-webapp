import React, { useState } from 'react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import { Mail, Shield, User, ArrowRight, Save, Trash } from 'lucide-react';

const TestComponentsPage: React.FC = () => {
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const toggleLoading = () => {
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 2000);
    };

    return (
        <div className="min-h-screen bg-gray-900 p-8 space-y-8">
            <h1 className="text-3xl font-bold text-white mb-8">UI Component Library</h1>

            {/* Buttons Section */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-300">Buttons</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card title="Primary">
                        <div className="space-y-2">
                            <Button variant="primary" onClick={toggleLoading}>Default</Button>
                            <Button variant="primary" size="sm">Small</Button>
                            <Button variant="primary" size="lg">Large</Button>
                            <Button variant="primary" disabled>Disabled</Button>
                        </div>
                    </Card>
                    <Card title="Secondary">
                        <div className="space-y-2">
                            <Button variant="secondary">Default</Button>
                            <Button variant="secondary" size="sm">Small</Button>
                            <Button variant="secondary" size="lg">Large</Button>
                        </div>
                    </Card>
                    <Card title="Outline & Ghost">
                        <div className="space-y-2">
                            <Button variant="outline">Outline</Button>
                            <Button variant="ghost">Ghost</Button>
                            <Button variant="danger">Danger</Button>
                        </div>
                    </Card>
                    <Card title="With Icons & Loading">
                        <div className="space-y-2">
                            <Button leftIcon={<Mail size={16} />}>Email</Button>
                            <Button rightIcon={<ArrowRight size={16} />}>Next</Button>
                            <Button isLoading={isLoading} onClick={toggleLoading}>Click to Load</Button>
                            <Button isLoading={true}>Loading</Button>
                        </div>
                    </Card>
                </div>
            </section>

            {/* Inputs Section */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-300">Inputs</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card title="Basic Inputs">
                        <div className="space-y-4">
                            <Input
                                label="Username"
                                placeholder="Enter your username"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                            />
                            <Input
                                label="Email"
                                type="email"
                                placeholder="example@mail.com"
                                helperText="We'll never share your email."
                            />
                        </div>
                    </Card>
                    <Card title="Input States">
                        <div className="space-y-4">
                            <Input
                                label="Error State"
                                placeholder="Invalid input"
                                error="This field is required"
                            />
                            <Input
                                label="Disabled State"
                                placeholder="Cannot type here"
                                disabled
                            />
                        </div>
                    </Card>
                    <Card title="With Icons">
                        <div className="space-y-4">
                            <Input
                                label="Search"
                                placeholder="Search..."
                                leftIcon={<Shield size={16} />}
                            />
                            <Input
                                label="Profile"
                                placeholder="Your name"
                                rightIcon={<User size={16} />}
                            />
                        </div>
                    </Card>
                </div>
            </section>

            {/* Cards Section */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-300">Cards</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card
                        title="Card with Footer"
                        description="This is a card description."
                        footer={
                            <div className="flex justify-end space-x-2">
                                <Button variant="ghost" size="sm">Cancel</Button>
                                <Button variant="primary" size="sm" leftIcon={<Save size={14} />}>Save</Button>
                            </div>
                        }
                    >
                        <p className="text-gray-300">
                            This is the main content area of the card. You can put anything here.
                        </p>
                    </Card>

                    <Card
                        title="No Padding Card"
                        noPadding
                    >
                        <div className="h-32 bg-gray-800 flex items-center justify-center border-b border-gray-700">
                            <span className="text-gray-500">Header Image Area</span>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-300">
                                This card has <code>noPadding</code> set to true, useful for cards with images flush to the edges.
                            </p>
                        </div>
                    </Card>
                </div>
            </section>
        </div>
    );
};

export default TestComponentsPage;
