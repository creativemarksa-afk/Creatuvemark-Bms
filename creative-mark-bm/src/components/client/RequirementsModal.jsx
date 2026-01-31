import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Briefcase,
  FileText,
  DollarSign,
  Clock,
  Users,
  Globe,
  AlertCircle,
} from "lucide-react";
import { useTranslation } from "../../i18n/TranslationContext";

// Define the colors for simplicity and maintainability
const ACCENT_COLOR = "#ffd17a";
const PRIMARY_DARK = "#242021";

export default function CompanyRequirementsModal({
  isOpen = false,
  onClose = () => {},
  onAccept = () => {},
  showTriggerButton = true,
}) {
  const { t } = useTranslation();
  const [hasRead, setHasRead] = useState(false);
  // Ref to monitor scroll position to enable the "Accept" button after scrolling through the content
  const contentRef = useRef(null);

  // Function to determine if the user has scrolled to the bottom (Simple check)
  const handleScroll = () => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      // If within 10px of the bottom, assume they've read it.
      if (scrollHeight - scrollTop - clientHeight < 10) {
        setHasRead(true);
      }
    }
  };

  // --- Data Structure (Kept identical) ---
  const requirements = {
    overview: [
      {
        title: t('requirementsModal.overview.whySaudi.title'),
        icon: Globe,
        items: [
          t('requirementsModal.overview.whySaudi.fasterProcedures'),
          t('requirementsModal.overview.whySaudi.widerVariety'),
          t('requirementsModal.overview.whySaudi.governmentSupport'),
          t('requirementsModal.overview.whySaudi.stableEnvironment'),
          t('requirementsModal.overview.whySaudi.promisingMarket'),
          t('requirementsModal.overview.whySaudi.strategicLocation'),
        ],
      },
      {
        title: t('requirementsModal.overview.investorPrivileges.title'),
        icon: Users,
        items: [
          t('requirementsModal.overview.investorPrivileges.fullOwnership'),
          t('requirementsModal.overview.investorPrivileges.freedomOfMovement'),
          t('requirementsModal.overview.investorPrivileges.premiumResidency'),
          t('requirementsModal.overview.investorPrivileges.familyResidency'),
          t('requirementsModal.overview.investorPrivileges.realEstate'),
          t('requirementsModal.overview.investorPrivileges.acquireCompanies'),
          t('requirementsModal.overview.investorPrivileges.strategicPartnerships'),
        ],
      },
    ],
    costs: [
      {
        title: t('requirementsModal.costs.establishmentFees.title'),
        icon: Briefcase,
        items: [
          {
            label: t('requirementsModal.costs.establishmentFees.setupCost'),
            value: t('requirementsModal.costs.establishmentFees.basedOnOffers'),
            note: t('requirementsModal.costs.establishmentFees.determinedByOffers')
          },
          {
            label: t('requirementsModal.costs.establishmentFees.licenseFees'),
            value: t('requirementsModal.costs.establishmentFees.paymentRequired'),
            note: t('requirementsModal.costs.establishmentFees.mayBeDelayed')
          },
        ],
      },
      {
        title: t('requirementsModal.costs.residencyPackage.title'),
        icon: Users,
        items: [
          {
            label: t('requirementsModal.costs.residencyPackage.entryVisa'),
            value: "2,000 SAR",
            note: t('requirementsModal.costs.residencyPackage.singleEntry')
          },
          {
            label: t('requirementsModal.costs.residencyPackage.passportProcessing'),
            value: "650 SAR",
            note: t('requirementsModal.costs.residencyPackage.administrativeFees')
          },
          {
            label: t('requirementsModal.costs.residencyPackage.workPermit'),
            value: "9,700 SAR",
            note: t('requirementsModal.costs.residencyPackage.fullRate')
          },
          {
            label: t('requirementsModal.costs.residencyPackage.healthInsurance'),
            value: t('requirementsModal.costs.residencyPackage.separateCost'),
            note: t('requirementsModal.costs.residencyPackage.notIncluded')
          },
        ],
      },
    ],
    requirements: [
      {
        title: t('requirementsModal.requirements.partnershipStructures.title'),
        icon: Users,
        items: [
          {
            type: t('requirementsModal.requirements.partnershipStructures.externalCompany'),
            details: [
              t('requirementsModal.requirements.partnershipStructures.validCR'),
              t('requirementsModal.requirements.partnershipStructures.authenticatedStatements'),
              t('requirementsModal.requirements.partnershipStructures.saudiEmbassyAuth'),
              t('requirementsModal.requirements.partnershipStructures.investmentLicense'),
              t('requirementsModal.requirements.partnershipStructures.articlesAmendment'),
            ],
          },
          {
            type: t('requirementsModal.requirements.partnershipStructures.gulfNational'),
            details: [
              t('requirementsModal.requirements.partnershipStructures.directAddition'),
              t('requirementsModal.requirements.partnershipStructures.simplifiedProcess'),
              t('requirementsModal.requirements.partnershipStructures.noLicenseNeeded'),
            ],
          },
        ],
      },
      {
        title: t('requirementsModal.requirements.businessActivity.title'),
        icon: Briefcase,
        items: [
          {
            type: t('requirementsModal.requirements.businessActivity.engineeringConsulting'),
            details: [
              t('requirementsModal.requirements.businessActivity.requires4Companies'),
              t('requirementsModal.requirements.businessActivity.threeCompaniesRequirements'),
              t('requirementsModal.requirements.businessActivity.oneCompanyRequirements'),
              t('requirementsModal.requirements.businessActivity.allDocumentationAuth'),
            ],
          },
          {
            type: t('requirementsModal.requirements.businessActivity.commercialActivities'),
            details: [
              t('requirementsModal.requirements.businessActivity.requires3Companies'),
              t('requirementsModal.requirements.businessActivity.differentCountries'),
              t('requirementsModal.requirements.businessActivity.validCR'),
              t('requirementsModal.requirements.businessActivity.financialStatementsRequired'),
            ],
          },
        ],
      },
    ],
    timeline: [
      {
        title: t('requirementsModal.timeline.processingTimeline.title'),
        icon: Clock,
        items: [
          {
            label: t('requirementsModal.timeline.processingTimeline.saudiEstablishment'),
            value: "~15 working days",
            note: t('requirementsModal.timeline.processingTimeline.afterDocumentsVerified')
          },
          {
            label: t('requirementsModal.timeline.processingTimeline.externalCompanySetup'),
            value: "~15 working days",
            note: t('requirementsModal.timeline.processingTimeline.ifEstablishingNew')
          },
          {
            label: t('requirementsModal.timeline.processingTimeline.totalProcess'),
            value: "~30 working days",
            note: t('requirementsModal.timeline.processingTimeline.assumingNoDelays')
          },
        ],
      },
    ],
    important: [
      t('requirementsModal.important.licenseRenewal'),
      t('requirementsModal.important.saudization'),
      t('requirementsModal.important.commercialRegister'),
      t('requirementsModal.important.nationwideOperation'),
      t('requirementsModal.important.sponsorPartnership'),
    ],
  };

  const sections = [
    { id: "overview", label: t('requirementsModal.tabs.overview'), icon: Globe, data: requirements.overview },
    { id: "costs", label: t('requirementsModal.tabs.costs'), icon: DollarSign, data: requirements.costs },
    { id: "requirements", label: t('requirementsModal.tabs.requirements'), icon: FileText, data: requirements.requirements },
    { id: "timeline", label: t('requirementsModal.tabs.timeline'), icon: Clock, data: requirements.timeline },
  ];


  // Render function for individual sections (kept simple for readability)
  const renderSectionContent = (section, index) => {
    const Icon = section.icon;
    return (
      <div key={index} className="bg-white p-4 sm:p-5 border-b border-gray-100 last:border-b-0">
        {/* Sub-Section Header */}
        <div className="flex items-start mb-3">
          <div className="w-5 h-5 mr-3 mt-0.5 flex items-center justify-center rounded-sm flex-shrink-0" style={{ backgroundColor: ACCENT_COLOR }}>
            <Icon className="w-3 h-3" style={{ color: PRIMARY_DARK }} />
          </div>
          <h3 className="text-base font-bold text-gray-900 leading-tight">{section.title}</h3>
        </div>
        
        <ul className="space-y-3 ml-8">
          {section.items.map((item, i) => (
            <li key={i}>
              {typeof item === "string" ? (
                // Simple bullet point item
                <div className="flex items-start">
                  <span className="w-1 h-1 rounded-full mt-2 mr-2 flex-shrink-0" style={{ backgroundColor: PRIMARY_DARK }}></span>
                  <p className="text-sm text-gray-700 leading-relaxed">{item}</p>
                </div>
              ) : item.type ? (
                // Detailed requirements/partnership structures
                <div className="p-3 bg-gray-50 rounded-md border-l-4 border-gray-200" style={{ borderColor: ACCENT_COLOR }}>
                  <h4 className="text-sm font-semibold text-gray-800 mb-1.5">{item.type}</h4>
                  <ul className="list-disc ml-4 space-y-0.5">
                    {item.details.map((detail, j) => (
                      <li key={j} className="text-xs text-gray-600 leading-normal">{detail}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                // Costs/Timeline item (Key-Value pair)
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-white rounded-md border border-gray-200 gap-2">
                  <div className="flex-1 min-w-0 pr-4">
                    <span className="text-sm font-medium text-gray-800 block">{item.label}</span>
                    {item.note && <p className="text-xs text-gray-500 mt-0.5">{item.note}</p>}
                  </div>
                  <span className="text-sm font-bold px-3 py-1 rounded-full flex-shrink-0" style={{ backgroundColor: ACCENT_COLOR, color: PRIMARY_DARK }}>
                    {item.value}
                  </span>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <>
      {/* Optional Trigger Button (Outside Modal) */}
      {showTriggerButton && (
        <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
          <button
            onClick={() => console.log("Open modal")} 
            className="px-6 py-3 font-semibold rounded-lg shadow-md transition-all duration-300 hover:shadow-lg text-sm sm:text-base"
            style={{ backgroundColor: ACCENT_COLOR, color: PRIMARY_DARK }}
          >
            {t('requirementsModal.viewCompanyRequirements')}
          </button>
        </div>
      )}

      {isOpen && (
        // Modal Container (Fixed, Full Screen)
        <div className="fixed inset-0 bg-gray-100 z-50 flex flex-col">
          
          {/* Main Container - Scrollable Document Body */}
          {/* Note: All sticky classes from the previous version are removed */}
          <div className="flex-1 overflow-y-auto" ref={contentRef} onScroll={handleScroll}>
            <div className="max-w-5xl mx-auto px-4 pt-6 pb-12 space-y-6 sm:space-y-8">

              {/* Header/Title Block (Non-Sticky) */}
              <div className="w-full p-4 mb-4 rounded-lg shadow-sm" style={{ backgroundColor: PRIMARY_DARK }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0" style={{ backgroundColor: ACCENT_COLOR }}>
                      <FileText className="w-5 h-5" style={{ color: PRIMARY_DARK }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-lg font-bold text-white truncate">{t('requirementsModal.title')}</h2>
                      <p className="text-xs text-gray-300 truncate">{t('requirementsModal.subtitle')}</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-white/10 transition-all flex-shrink-0"
                  >
                    <X className="w-4 h-4 text-gray-300" />
                  </button>
                </div>
              </div>

              {/* Render all sections one after the other */}
              {sections.map(section => (
                <div key={section.id} id={section.id}>
                    {/* Main Section Header */}
                    <div className="mb-4 p-4 rounded-lg flex items-center shadow-sm border-b-2" style={{ backgroundColor: 'white', borderColor: PRIMARY_DARK }}>
                        <h2 className="text-lg sm:text-xl font-extrabold" style={{ color: PRIMARY_DARK }}>{section.label}</h2>
                    </div>
                    
                    <div className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                        {section.data.map(renderSectionContent)}
                    </div>
                </div>
              ))}
              
              {/* Important Notes Section */}
              <div id="important">
                <div className="mb-4 p-4 rounded-lg flex items-center shadow-sm border-b-2" style={{ backgroundColor: 'white', borderColor: PRIMARY_DARK }}>
                  <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" style={{ color: ACCENT_COLOR }}/>
                  <h2 className="text-lg sm:text-xl font-extrabold" style={{ color: PRIMARY_DARK }}>{t('requirementsModal.importantNotes')}</h2>
                </div>
                <div className="p-4 sm:p-5 bg-white rounded-lg border border-red-300 space-y-3 shadow-sm">
                  <p className="text-sm sm:text-base text-red-700 italic font-medium">{t('requirementsModal.criticalInformation')}</p>
                  <ul className="list-disc ml-5 space-y-2">
                    {requirements.important.map((item, i) => (
                      <li key={i} className="text-sm text-gray-800 leading-relaxed">{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Confirmation Block (Non-Sticky, part of the scrollable content) */}
          <div className="w-full p-4 border-t bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.1)] flex-shrink-0">
            <div className="max-w-5xl mx-auto">
              {/* Checkbox */}
              <div className="flex items-center gap-3 mb-4 p-3 border border-gray-200 rounded-lg bg-gray-50">
                <input
                  type="checkbox"
                  id="readConfirm"
                  checked={hasRead}
                  // Allow user to manually check the box if they want
                  onChange={(e) => setHasRead(e.target.checked)}
                  className="w-5 h-5 rounded cursor-pointer flex-shrink-0"
                  style={{ accentColor: ACCENT_COLOR }}
                />
                <label htmlFor="readConfirm" className="text-sm font-semibold text-gray-800 cursor-pointer">
                  {t('requirementsModal.readAndUnderstood')}
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-6 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors font-semibold text-sm sm:text-base"
                >
                  {t('buttons.cancel')}
                </button>
                <button
                  onClick={hasRead ? onAccept : undefined}
                  // Disable the button unless the checkbox is checked (or scroll condition met)
                  disabled={!hasRead}
                  className={`flex-1 py-3 px-6 rounded-lg font-semibold text-sm sm:text-base transition-all duration-300 ${
                    hasRead
                      ? `shadow-lg hover:shadow-xl`
                      : "bg-gray-300 cursor-not-allowed opacity-60 text-gray-500"
                  }`}
                  style={hasRead ? { backgroundColor: ACCENT_COLOR, color: PRIMARY_DARK } : {}}
                >
                  {hasRead ? t('requirementsModal.continueToApplication') : t('requirementsModal.acceptRequirements')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}