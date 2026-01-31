"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { register } from "../../services/auth";
import { useTranslation } from "../../i18n/TranslationContext";

export default function RegisterPage() {
  const { t, language } = useTranslation();
  const isRTL = language === 'ar';
  const router = useRouter();
  const { updateUser } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    phoneCountryCode: "+966",
    nationality: "",
    residencyStatus: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [countries, setCountries] = useState([]);


  useEffect(() => {
    const fetchCountries = async () => {
      try {
        // Fetch countries with their name, code (cca2), and calling code (idd)
        const res = await fetch("https://restcountries.com/v3.1/all?fields=name,cca2,idd");
        const data = await res.json();
  
        const sorted = data
          .map(c => {
            // Combine root and suffix to form the complete phone code (e.g., +966)
            const phoneCode = c.idd.root + (c.idd.suffixes ? c.idd.suffixes[0] : "");
            return {
              name: c.name.common,
              code: c.cca2,
              phoneCode: phoneCode,
            }
          })
          .filter(c => c.phoneCode && c.name) // Filter out entries without a phone code or name
          .sort((a, b) => a.name.localeCompare(b.name));
          
        // Set countries with initial default selection logic if needed, but for now just populate
        setCountries(sorted);
      } catch (err) {
        console.error("Error fetching countries:", err);
      }
    };
  
    fetchCountries();
  }, []);
  
  
  // --- START MODIFIED handleChange FUNCTION ---
  function handleChange(e) {
    const { name, value } = e.target;
    
    // Use functional state update for reliability
    setFormData(prev => {
      let updates = {
        [name]: value
      };

      // Logic to automatically set phoneCountryCode when nationality is selected
      if (name === "nationality") {
        const selectedCountry = countries.find(c => c.name === value);
        if (selectedCountry && selectedCountry.phoneCode) {
          // Add the phoneCode to the updates object
          updates.phoneCountryCode = selectedCountry.phoneCode;
        } else if (value === "") {
          // Reset to default or clear if nationality is reset
          updates.phoneCountryCode = ""; 
        }
      }

      return {
        ...prev,
        ...updates
      };
    });

    if (error) setError("");
    if (success) setSuccess("");
  }
  // --- END MODIFIED handleChange FUNCTION ---

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");
    
    try {
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        setIsLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters long");
        setIsLoading(false);
        return;
      }

      // Prepare data for backend
      const registerData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        phoneCountryCode: formData.phoneCountryCode,
        nationality: formData.nationality,
        residencyStatus: formData.residencyStatus,
        password: formData.password,
        role: "client" // Always set role to client
      };

      // Call backend register API
      console.log("Sending register data:", registerData);
      const response = await register(registerData);
      console.log("Register response:", response);
      
      if (response.success) {
        // Show success message about email verification
        setSuccess(response.message || t('auth.registrationSuccessCheckEmail'));
        
        // Don't update AuthContext or redirect - user needs to verify email first
        // Clear the form
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          phoneCountryCode: "+966",
          nationality: "",
          residencyStatus: "",
          password: "",
          confirmPassword: ""
        });
      } else {
        setError(response.message || t('auth.registrationFailed'));
      }
      
    } catch (error) {
      console.error("Registration error:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      });
      setError(error.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  // Helper function to get flag emoji from country code
  const getFlagEmoji = (countryCode) => {
    if (!countryCode) return "🏳️";
    // Standard function to convert 2-letter country code (e.g., SA) to flag emoji (🇸🇦)
    return countryCode
        .toUpperCase()
        .split('')
        .map(char => String.fromCodePoint(127397 + char.charCodeAt()))
        .join('');
  }

  // Find the selected country code to display the flag next to the phone code selector
  const currentPhoneCountry = countries.find(c => c.phoneCode === formData.phoneCountryCode);
  const currentNationalityCountry = countries.find(c => c.name === formData.nationality);
  const phoneFlagCode = currentPhoneCountry ? currentPhoneCountry.code : null;
  const nationalityFlagCode = currentNationalityCountry ? currentNationalityCountry.code : null;


  return (
    <div className={`relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100 lg:bg-white ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Left Side with #242021 Background - Desktop Only */}
      <div className={`hidden lg:block fixed top-0 bottom-0 w-1/2 bg-[#242021] overflow-hidden ${isRTL ? 'right-0' : 'left-0'}`}>
        {/* Animated Background Gradient Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#ffd17a]/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#ffd17a]/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-[#ffd17a]/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>

        {/* Floating Shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-[15%] w-3 h-3 bg-[#ffd17a]/40 rounded-full animate-float" />
          <div className="absolute top-40 left-[30%] w-4 h-4 bg-[#ffd17a]/30 rounded-full animate-float-delayed" />
          <div className="absolute bottom-32 left-[20%] w-3 h-3 bg-[#ffd17a]/50 rounded-full animate-float-slow" />
          <div className="absolute bottom-48 left-[40%] w-4 h-4 bg-[#ffd17a]/35 rounded-full animate-float" />
          <div className="absolute top-1/3 left-[25%] w-3 h-3 bg-[#ffd17a]/45 rounded-full animate-float-delayed" />
          <div className="absolute top-1/4 left-[50%] w-2 h-2 bg-[#ffd17a]/60 rounded-full animate-float-slow" />
          <div className="absolute bottom-1/3 left-[35%] w-3 h-3 bg-[#ffd17a]/40 rounded-full animate-float" />
          <div className="absolute top-2/3 left-[45%] w-2 h-2 bg-[#ffd17a]/55 rounded-full animate-float-delayed" />
        </div>

        {/* Content for Left Side */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-12">
          <div className="text-center">
            {/* Large Logo with Glow */}
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-[#ffd17a] to-[#ffd17a]/60 rounded-3xl blur-2xl opacity-40 animate-pulse" />
              <div className="relative w-24 h-24 bg-gradient-to-br from-[#ffd17a] via-[#ffd17a]/95 to-[#ffd17a]/90 rounded-full flex items-center justify-center shadow-2xl">
                <img 
                  src="/CreativeMarkFavicon.png" 
                  alt="CreativeMark Logo" 
                  className="w-48 h-48 object-contain drop-shadow-lg"
                  onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/48x48/242021/ffd17a?text=CM"; }}
                />
              </div>
            </div>

            <h1 className="text-5xl font-black text-white mb-6 tracking-tight">
              {t('auth.welcomeToTheFuture')}
            </h1>
            <div className="h-1 w-24 mx-auto bg-gradient-to-r from-transparent via-[#ffd17a] to-transparent rounded-full mb-6" />
            <p className="text-gray-300 text-lg max-w-md">
              {t('auth.createAccountJoinClients')}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6 mt-12">
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-3xl font-bold mb-2 text-[#ffd17a]">10K+</div>
                <div className='text-sm text-white/80'>{t('auth.happyClients')}</div>
              </div>
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-3xl font-bold mb-2 text-[#ffd17a]">99.9%</div>
                <div className='text-sm text-white/80'>{t('auth.uptime')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Background Only */}
      <div className="lg:hidden absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#ffd17a]/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#242021]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-[#ffd17a]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>

      {/* Mobile Floating Shapes Only */}
      <div className="lg:hidden absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-[10%] w-2 h-2 bg-[#ffd17a] rounded-full animate-float" />
        <div className="absolute top-40 right-[15%] w-3 h-3 bg-[#242021]/20 rounded-full animate-float-delayed" />
        <div className="absolute bottom-32 left-[20%] w-2 h-2 bg-[#ffd17a]/60 rounded-full animate-float-slow" />
        <div className="absolute bottom-48 right-[25%] w-3 h-3 bg-[#242021]/30 rounded-full animate-float" />
        <div className="absolute top-1/3 right-[40%] w-2 h-2 bg-[#ffd17a]/40 rounded-full animate-float-delayed" />
      </div>

      {/* Main Content */}
      <div className={`relative z-10 min-h-screen flex items-center justify-center px-4 py-6 lg:px-12 xl:px-20 ${isRTL ? 'lg:mr-[50%]' : 'lg:ml-[50%]'}`}>
        <div className="w-full max-w-5xl">
          {/* Register Card with Glassmorphism */}
          <div className="p-6 sm:p-8 lg:p-10 transition-all duration-500">
            {/* Header */}
            <div className={`mb-6 sm:mb-8 ${isRTL ? 'text-right' : 'text-center'}`}>
              {/* Logo with Glow Effect */}
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-[#ffd17a] to-[#ffd17a]/60 rounded-2xl blur-xl opacity-60 animate-pulse" />
                <div className="relative w-24 h-24 bg-gradient-to-br from-[#ffd17a] via-[#ffd17a]/95 to-[#ffd17a]/90 rounded-full flex items-center justify-center shadow-xl backdrop-blur-sm border border-white/20">
                  <img 
                    src="/CreativeMarkFavicon.png" 
                    alt="CreativeMark Logo"
                    className="w-48 h-48 object-contain drop-shadow-lg"
                    onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/48x48/242021/ffd17a?text=CM"; }}
                  />
                </div>
              </div>
              
              <h2 className={`text-3xl sm:text-4xl font-black text-gray-900 mb-2 tracking-tight ${isRTL ? 'text-right' : 'text-center'}`}>{t('auth.createAccount')}</h2>
              <div className={`h-1 w-16 bg-gradient-to-r from-transparent via-[#ffd17a] to-transparent rounded-full mb-3 ${isRTL ? 'mr-auto' : 'mx-auto'}`} />
              <p className={`text-gray-600 text-sm sm:text-base ${isRTL ? 'text-right' : 'text-center'}`}>{t('auth.joinUsStartJourney')}</p>
            </div>

            {/* Success Message */}
            {success && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg sm:rounded-xl animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-green-800">{success}</span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg sm:rounded-xl animate-shake">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-red-800">{error}</span>
                </div>
              </div>
            )}


            <form onSubmit={handleSubmit}>
              <div className="space-y-5 sm:space-y-6">
              {/* Full Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="group">
                  <label className={`block text-sm font-semibold text-gray-700 mb-2 transition-colors duration-200 group-focus-within:text-[#242021] ${isRTL ? 'text-right' : 'text-left'}`}>{t('auth.fullName')} *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    placeholder={t('auth.fullNamePlaceholder')}
                    className={`w-full px-3 sm:px-4 py-3 sm:py-4 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#ffd17a]/20 focus:border-[#ffd17a] transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md text-sm sm:text-base placeholder-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}
                    dir={isRTL ? 'rtl' : 'ltr'}
                  />
                </div>
                <div className="group">
                  <label className={`block text-sm font-semibold text-gray-700 mb-2 transition-colors duration-200 group-focus-within:text-[#242021] ${isRTL ? 'text-right' : 'text-left'}`}>{t('auth.email')} *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder={t('auth.emailPlaceholder')}
                    className={`w-full px-3 sm:px-4 py-3 sm:py-4 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#ffd17a]/20 focus:border-[#ffd17a] transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md text-sm sm:text-base placeholder-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}
                    dir={isRTL ? 'ltr' : 'ltr'}
                  />
                </div>
              </div>

              {/* Phone with Country Code */}
              <div className="group">
                <label className={`block text-sm font-semibold text-gray-700 mb-2 transition-colors duration-200 group-focus-within:text-[#242021] ${isRTL ? 'text-right' : 'text-left'}`}>{t('auth.phoneNumber')}</label>
                <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Country Code Selector with Flag */}
                  <div className="relative flex-shrink-0">
                    <select
                      name="phoneCountryCode"
                      value={formData.phoneCountryCode}
                      onChange={handleChange}
                      className={`w-16 lg:w-48 px-3 py-3 sm:py-4 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#ffd17a]/20 focus:border-[#ffd17a] transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md text-sm appearance-none cursor-pointer ${isRTL ? 'text-right' : 'text-left'}`}
                      dir={isRTL ? 'ltr' : 'ltr'}
                    >
                      <option value=''>{t('auth.code')}</option>
                      {countries.map((country) => (
                        <option key={country.code} value={country.phoneCode}>
                          {country.phoneCode} - {country.name}
                        </option>
                      ))}
                    </select>
                 
                    
                    {/* Dropdown Arrow */}
                    <div className={`absolute inset-y-0 flex items-center pointer-events-none ${isRTL ? 'left-0 pl-3' : 'right-0 pr-3'}`}>
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Phone Number Input */}
                  <div className="flex-1">
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder={t('auth.enterPhoneNumber')}
                      className={`w-full px-3 sm:px-4 py-3 sm:py-4 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#ffd17a]/20 focus:border-[#ffd17a] transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md text-sm sm:text-base placeholder-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}
                      dir={isRTL ? 'ltr' : 'ltr'}
                    />
                  </div>
                </div>
              </div>

              {/* Nationality Dropdown with Flag */}
              <div className="group">
                <label className={`block text-sm font-semibold text-gray-700 mb-2 transition-colors duration-200 group-focus-within:text-[#242021] ${isRTL ? 'text-right' : 'text-left'}`}>{t('auth.nationality')}</label>
                <div className="relative">
                  <select
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleChange} // This is the handler that triggers the phone code update
                    className={`w-full px-3 sm:px-4 py-3 sm:py-4 pl-12 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#ffd17a]/20 focus:border-[#ffd17a] transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md text-sm sm:text-base appearance-none cursor-pointer ${isRTL ? 'text-right' : 'text-left'}`}
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    <option value=''>{t('auth.selectNationality')}</option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.name}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                  
                
                  
                  {/* Dropdown Arrow */}
                  <div className={`absolute inset-y-0 flex items-center pointer-events-none ${isRTL ? 'left-0 pl-3' : 'right-0 pr-3'}`}>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Residency Status */}
              <div className="group">
                <label className={`block text-sm font-semibold text-gray-700 mb-2 transition-colors duration-200 group-focus-within:text-[#242021] ${isRTL ? 'text-right' : 'text-left'}`}>{t('auth.residencyStatus')}</label>
                <div className="relative">
                  <select
                  name="residencyStatus"
                  value={formData.residencyStatus}
                  onChange={handleChange}
                  className={`w-full px-3 sm:px-4 py-3 sm:py-4 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#ffd17a]/20 focus:border-[#ffd17a] transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md text-sm sm:text-base appearance-none cursor-pointer ${isRTL ? 'text-right' : 'text-left'}`}
                  dir={isRTL ? 'rtl' : 'ltr'}
                >
                  <option value=''>{t('auth.selectResidencyStatus')}</option>
                  <option value='saudi'>{t('auth.saudi')}</option>
                  <option value='gulf'>{t('auth.gulfNational')}</option>
                  <option value='premium'>{t('auth.premiumResidency')}</option>
                  <option value='foreign'>{t('auth.foreign')}</option>
                </select>
                  <div className={`absolute inset-y-0 flex items-center pointer-events-none ${isRTL ? 'left-0 pl-3' : 'right-0 pr-3'}`}>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="group">
                  <label className={`block text-sm font-semibold text-gray-700 mb-2 transition-colors duration-200 group-focus-within:text-[#242021] ${isRTL ? 'text-right' : 'text-left'}`}>{t('auth.password')} *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="••••••••"
                      className={`w-full px-3 sm:px-4 py-3 sm:py-4 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#ffd17a]/20 focus:border-[#ffd17a] transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md text-sm sm:text-base placeholder-gray-400 ${isRTL ? 'pr-3 pl-12 text-right' : 'pr-12 text-left'}`}
                      dir={isRTL ? 'ltr' : 'ltr'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#242021] transition-colors ${isRTL ? 'left-3' : 'right-3'}`}
                    >
                      {showPassword ? (
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <div className="group">
                  <label className={`block text-sm font-semibold text-gray-700 mb-2 transition-colors duration-200 group-focus-within:text-[#242021] ${isRTL ? 'text-right' : 'text-left'}`}>{t('auth.confirmPassword')} *</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      placeholder="••••••••"
                      className={`w-full px-3 sm:px-4 py-3 sm:py-4 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#ffd17a]/20 focus:border-[#ffd17a] transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md text-sm sm:text-base placeholder-gray-400 ${isRTL ? 'pr-3 pl-12 text-right' : 'pr-12 text-left'}`}
                      dir={isRTL ? 'ltr' : 'ltr'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#242021] transition-colors ${isRTL ? 'left-3' : 'right-3'}`}
                    >
                      {showConfirmPassword ? (
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  required
                  className="w-5 h-5 border-gray-300 rounded mt-0.5 focus:ring-[#ffd17a]/20 focus:ring-2"
                  style={{accentColor: '#ffd17a'}}
                />
                <label className="text-sm text-gray-700 leading-relaxed">
                  {t('auth.iAgreeToThe')} {" "}
                  <button type="button" className="font-semibold cursor-pointer text-[#242021] hover:text-[#242021]/80 hover:underline transition-colors">
                    {t('auth.termsAndConditions')}
                  </button>{" "}
                  {t('auth.and')} {" "}
                  <button type="button" className="font-semibold cursor-pointer text-[#242021] hover:text-[#242021]/80 hover:underline transition-colors">
                    {t('auth.privacyPolicy')}
                  </button>
                </label>
              </div>

              {/* Submit Button with Gradient Effect */}
              <button
                type="submit"
                disabled={isLoading}
                className={`group relative overflow-hidden w-full py-4 text-base font-bold rounded-2xl transition-all cursor-pointer duration-300 transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 ${
                  isLoading
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : "bg-gradient-to-br from-[#242021] to-[#2a2422] text-white hover:shadow-2xl"
                }`}
              >
                {!isLoading && (
                  <span className="absolute inset-0 bg-gradient-to-r from-[#ffd17a]/0 via-[#ffd17a]/20 to-[#ffd17a]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                )}
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="relative">{t('auth.creatingAccount')}</span>
                  </>
                ) : (
                  <>
                    <span className="relative">{t('auth.createAccountButton')}</span>
                    <svg className="w-5 h-5 relative group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
              </div>
            </form>

            {/* Sign In Link */}
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200/50">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  {t('auth.alreadyHaveAccount')}{" "}
                  <button
                    type="button"
                    onClick={() => router.push('/')}
                    className="group font-semibold cursor-pointer text-[#242021] hover:text-[#ffd17a] transition-all duration-200 inline-flex items-center gap-2"
                  >
                    <span>{t('auth.signIn')}</span>
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-25px) translateX(-10px); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 7s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}