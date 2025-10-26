import React, { useState } from 'react';
import { UploadIcon } from './Icons';

interface VerificationFormProps {
  userFullName: string;
  onSubmit: (data: FormData) => Promise<void>;
}

interface FormErrors {
  fullName?: string;
  phone?: string;
  govId?: string;
  selfie?: string;
}

const VerificationForm: React.FC<VerificationFormProps> = ({ userFullName, onSubmit }) => {
  const [fullName, setFullName] = useState(userFullName);
  const [phone, setPhone] = useState('');
  const [govIdFile, setGovIdFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required.';
    }
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required.';
    } else if (!/^\+?[0-9\s-]{7,15}$/.test(phone)) {
      newErrors.phone = 'Please enter a valid phone number.';
    }

    if (!govIdFile) {
      newErrors.govId = 'Government ID is required.';
    } else if (govIdFile.size > 5 * 1024 * 1024) { // 5MB limit
      newErrors.govId = 'File size must be under 5MB.';
    }

    if (!selfieFile) {
      newErrors.selfie = 'A selfie is required.';
    } else if (selfieFile.size > 5 * 1024 * 1024) { // 5MB limit
      newErrors.selfie = 'File size must be under 5MB.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('phone', phone);
    formData.append('govId', govIdFile!);
    formData.append('selfie', selfieFile!);
    
    await onSubmit(formData);
    
    setIsLoading(false);
  };

  const FileInput = ({ label, file, error, onChange, accept }: { label: string, file: File | null, error?: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, accept: string }) => (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
      <label htmlFor={label.toLowerCase().replace(' ', '-')} className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md cursor-pointer transition-colors ${error ? 'border-red-500 bg-red-500/10' : 'border-gray-500 bg-gray-700/50'} border hover:bg-gray-600/50`}>
        <UploadIcon className="w-5 h-5" />
        <span className="text-sm truncate">{file ? file.name : `Choose file...`}</span>
      </label>
      <input type="file" id={label.toLowerCase().replace(' ', '-')} className="hidden" accept={accept} onChange={onChange} />
      <p className="text-xs text-gray-400 mt-1">Accepted: {accept}. Max 5MB.</p>
      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
  );

  return (
    <div className="bg-white/10 p-6 rounded-lg shadow-lg backdrop-blur-sm border border-gray-200/20 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-2">Verify Your Account</h2>
        <p className="text-gray-300 mb-6">Please provide your details and documents to unlock all features. The name must match your government ID.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-300">Full Name</label>
            <input 
              id="fullName"
              type="text" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={`mt-1 w-full p-3 bg-gray-700/50 text-white rounded-md border ${errors.fullName ? 'border-red-500' : 'border-gray-500'} focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition`}
            />
            {errors.fullName && <p className="text-red-400 text-sm mt-1">{errors.fullName}</p>}
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-300">Phone Number</label>
            <input 
              id="phone"
              type="tel" 
              value={phone}
              placeholder="+250 123 456 789"
              onChange={(e) => setPhone(e.target.value)}
              className={`mt-1 w-full p-3 bg-gray-700/50 text-white rounded-md border ${errors.phone ? 'border-red-500' : 'border-gray-500'} focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition`}
            />
             {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
          </div>

          <FileInput 
            label="Government ID"
            file={govIdFile}
            error={errors.govId}
            onChange={(e) => e.target.files && setGovIdFile(e.target.files[0])}
            accept="image/jpeg, image/png, application/pdf"
          />

          <FileInput 
            label="Selfie"
            file={selfieFile}
            error={errors.selfie}
            onChange={(e) => e.target.files && setSelfieFile(e.target.files[0])}
            accept="image/jpeg, image/png"
          />

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-cyan-500 text-white font-bold py-3 px-4 rounded-md hover:bg-cyan-600 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Submitting...' : 'Submit for Verification'}
          </button>
        </form>
    </div>
  );
};

export default VerificationForm;
