import { 
  FaUser, 
  FaFileAlt, 
  FaEdit,
  FaCalendarAlt,
  FaMale,
  FaFemale,
  FaTransgender,
  FaUserFriends,
  FaUpload,
  FaTimes,
  FaFilePdf,
  FaFileWord,
  FaImage,
  FaFile
} from 'react-icons/fa';

// Step 1: Personal Details
export const PersonalDetailsStep = ({ formData, handleInputChange }) => {
  return (
    <div className="space-y-6">
      {/* Profile Picture */}
      <div className="flex items-center space-x-6">
        <div className="relative">
          <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
            {formData.profilePicture ? (
              <img src={formData.profilePicture} alt="Profile" className="w-full h-full object-cover rounded-lg" />
            ) : (
              <FaUser className="text-gray-400 text-2xl" />
            )}
          </div>
          <button className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1 rounded-full">
            <FaEdit className="text-xs" />
          </button>
        </div>
        <div>
          <h3 className="font-medium text-gray-900">Profile Picture</h3>
          <p className="text-sm text-gray-500">Upload a clear photo of yourself</p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
          <select
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Please select title</option>
            <option value="Mr.">Mr.</option>
            <option value="Mrs.">Mrs.</option>
            <option value="Ms.">Ms.</option>
            <option value="Dr.">Dr.</option>
          </select>
        </div>

        {/* First Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            placeholder="Please enter first name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Middle Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Middle Name</label>
          <input
            type="text"
            value={formData.middleName}
            onChange={(e) => handleInputChange('middleName', e.target.value)}
            placeholder="Please enter middle name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            placeholder="Please enter last name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Marital Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Marital Status</label>
          <div className="flex space-x-4">
            <button
              onClick={() => handleInputChange('maritalStatus', 'single')}
               className={`p-3 border-2 ${
                formData.maritalStatus === 'single' 
                  ? 'border-green-500 bg-green-50 text-green-700' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
            </button>
            <button
              onClick={() => handleInputChange('maritalStatus', 'married')}
               className={`p-3 border-2 ${
                formData.maritalStatus === 'married' 
                  ? 'border-green-500 bg-green-50 text-green-700' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <FaUserFriends className="text-xl" />
            </button>
          </div>
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
          <div className="flex space-x-4">
            <button
              onClick={() => handleInputChange('gender', 'male')}
               className={`p-3 border-2 ${
                formData.gender === 'male' 
                  ? 'border-green-500 bg-green-50 text-green-700' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <FaMale className="text-xl" />
            </button>
            <button
              onClick={() => handleInputChange('gender', 'female')}
               className={`p-3 border-2 ${
                formData.gender === 'female' 
                  ? 'border-green-500 bg-green-50 text-green-700' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <FaFemale className="text-xl" />
            </button>
            <button
              onClick={() => handleInputChange('gender', 'other')}
               className={`p-3 border-2 ${
                formData.gender === 'other' 
                  ? 'border-green-500 bg-green-50 text-green-700' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <FaTransgender className="text-xl" />
            </button>
          </div>
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
          <div className="relative">
            <input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <FaCalendarAlt className="absolute right-3 top-3 text-gray-400" />
          </div>
        </div>

        {/* Father Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Father Name</label>
          <input
            type="text"
            value={formData.fatherName}
            onChange={(e) => handleInputChange('fatherName', e.target.value)}
            placeholder="Please enter father name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

// Step 2: Service Details
export const ServiceDetailsStep = ({ formData, handleInputChange }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
          <select
            value={formData.serviceType}
            onChange={(e) => handleInputChange('serviceType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Please select service type</option>
            <option value="Company Formation">Company Formation</option>
            <option value="Investment License">Investment License</option>
            <option value="Bank Account Opening">Bank Account Opening</option>
            <option value="Trademark Registration">Trademark Registration</option>
            <option value="Premium Residency">Premium Residency</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Service Description</label>
          <textarea
            value={formData.serviceDescription}
            onChange={(e) => handleInputChange('serviceDescription', e.target.value)}
            placeholder="Please describe your service requirements in detail"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        
      </div>
    </div>
  );
};

// Step 3: Contact Information
export const ContactInfoStep = ({ formData, handleInputChange }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Please enter your email"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="Please enter your phone number"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
          <textarea
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="Please enter your complete address"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            placeholder="Please enter your city"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
          <input
            type="text"
            value={formData.country}
            onChange={(e) => handleInputChange('country', e.target.value)}
            placeholder="Please enter your country"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

// Step 4: Document Upload
export const DocumentUploadStep = ({ formData, handleInputChange }) => {
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    handleInputChange('documents', [...formData.documents, ...files]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files);
    handleInputChange('documents', [...formData.documents, ...files]);
  };

  const getFileIcon = (file) => {
    const fileType = file.type || '';
    if (fileType.includes('pdf')) return <FaFilePdf className="text-red-500" />;
    if (fileType.includes('word') || fileType.includes('document')) return <FaFileWord className="text-blue-500" />;
    if (fileType.includes('image')) return <FaImage className="text-green-500" />;
    return <FaFile className="text-gray-500" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div 
        className="border-2 border-dashed border-gray-300 p-8 text-center hover:border-green-400 transition-colors"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <FaUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Documents</h3>
        <p className="text-gray-600 mb-4">
          Drag and drop files here, or click to select files
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Supported formats: JPG, PNG, PDF, DOCX (Max 2MB each, up to 10 files)
        </p>
        <input
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.pdf,.docx"
          onChange={handleFileUpload}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 cursor-pointer transition-colors"
        >
          <FaUpload className="mr-2" />
          Select Files
        </label>
      </div>

      {/* Uploaded Documents List */}
      {formData.documents.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 flex items-center">
            <FaFileAlt className="mr-2" />
            Uploaded Documents ({formData.documents.length})
          </h4>
          <div className="space-y-2">
            {formData.documents.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center flex-1">
                  <div className="mr-3">
                    {getFileIcon(file)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const newDocs = formData.documents.filter((_, i) => i !== index);
                    handleInputChange('documents', newDocs);
                  }}
                  className="ml-3 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                  title="Remove file"
                >
                  <FaTimes className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Document Categories */}
      {formData.documents.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Document Categories</h4>
          <p className="text-sm text-gray-600">
            You can categorize your documents to help with processing:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {formData.documents.map((file, index) => (
              <div key={index} className="flex items-center space-x-3">
                <span className="text-sm text-gray-600 w-32 truncate">{file.name}</span>
                <select
                  value={file.category || 'General'}
                  onChange={(e) => {
                    const newDocs = [...formData.documents];
                    newDocs[index] = { ...newDocs[index], category: e.target.value };
                    handleInputChange('documents', newDocs);
                  }}
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="General">General</option>
                  <option value="Identity">Identity Document</option>
                  <option value="Address">Address Proof</option>
                  <option value="Business">Business Document</option>
                  <option value="Financial">Financial Document</option>
                  <option value="Legal">Legal Document</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Step 5: Review
export const ReviewStep = ({ formData, handleInputChange }) => {
  return (
    <div className="space-y-6">
         <div className="bg-gray-50 border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Review Your Information</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-700">Personal Details</h4>
            <p className="text-sm text-gray-600">
              {formData.title} {formData.firstName} {formData.middleName} {formData.lastName}
            </p>
            <p className="text-sm text-gray-600">
              {formData.gender} • {formData.maritalStatus} • Born: {formData.dateOfBirth}
            </p>
          </div>

          <div>
            <h4 className="font-medium text-gray-700">Service Details</h4>
            <p className="text-sm text-gray-600">{formData.serviceType}</p>
            <p className="text-sm text-gray-600">{formData.serviceDescription}</p>
            <p className="text-sm text-gray-600">Priority: {formData.priority}</p>
          </div>

          <div>
            <h4 className="font-medium text-gray-700">Contact Information</h4>
            <p className="text-sm text-gray-600">{formData.email}</p>
            <p className="text-sm text-gray-600">{formData.phone}</p>
            <p className="text-sm text-gray-600">{formData.address}, {formData.city}, {formData.country}</p>
          </div>

          <div>
            <h4 className="font-medium text-gray-700">Documents</h4>
            {formData.documents.length > 0 ? (
              <div className="space-y-1">
                <p className="text-sm text-gray-600">{formData.documents.length} document(s) uploaded:</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  {formData.documents.map((file, index) => (
                    <li key={index} className="flex items-center">
                      <span className="mr-2">•</span>
                      <span>{file.name}</span>
                      {file.category && file.category !== 'General' && (
                        <span className="ml-2 px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs">
                          {file.category}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No documents uploaded</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-start">
        <input
          type="checkbox"
          id="terms"
          checked={formData.termsAccepted}
          onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
          I agree to the terms and conditions and confirm that all information provided is accurate.
        </label>
      </div>
    </div>
  );
};
