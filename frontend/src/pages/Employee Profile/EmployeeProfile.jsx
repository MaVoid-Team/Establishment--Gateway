import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function EmployeeProfile({ employee }) {
  const { t, i18n } = useTranslation();
  const apiUrl = import.meta.env.VITE_API_URL;

  return (
    <div className="container mx-auto p-6">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">{t('employeeProfileTitle')}</CardTitle>
          {/* Profile Picture */}
          {employee.attachment?.profilePic ? (
            <img
              src={employee.attachment.profilePic.url}
              alt={t('profilePicture')}
              className="w-32 h-32 mx-auto mt-4 rounded-full border border-gray-300 object-cover"
            />
          ) : (
            <div className="w-32 h-32 mx-auto mt-4 rounded-full border border-gray-300 flex items-center justify-center bg-gray-100 text-gray-500">
              {t('noProfilePicture')}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="info" className="w-full">
            <TabsList
              className="grid w-full grid-cols-1"
              dir={i18n.language === "ar" ? "rtl" : "ltr"}
            >
              <TabsTrigger value="info">{t('personalInformation')}</TabsTrigger>
            </TabsList>
            <TabsContent value="info">
              <div
                className="grid grid-cols-2 gap-4"
                dir={i18n.language === "ar" ? "rtl" : "ltr"}
              >
                <InfoItem label={t('name')} value={employee.name} />
                <InfoItem label={t('email')} value={employee.email} />
                <InfoItem label={t('phoneNumber')} value={employee.phone_number || t('notAvailable')} />
                <InfoItem label={t('nationality')} value={employee.nationality || t('notAvailable')} />
                <InfoItem label={t('department')} value={employee.department?.name || t('notAvailable')} />
                <InfoItem label={t('extensionNumber')} value={employee.extension_number || t('notAvailable')} />
                <InfoItem label={t('role')} value={employee.employeeRole?.name || t('notAvailable')} />
                <InfoItem label={t('medicalConditions')} value={employee.Medical_conditions || t('notAvailable')} />
                <InfoItem label={t('accessibilityNeeds')} value={employee.Accessibility_Needs || t('notAvailable')} />
                <InfoItem label={t('homeAddress')} value={employee.Home_Address || t('notAvailable')} />
                <InfoItem label={t('emergencyContact')} value={employee.Emergency_Contact || t('notAvailable')} />
                <InfoItem label={t('personalEmail')} value={employee.Personal_Email || t('notAvailable')} />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="w-full max-w-4xl mx-auto mt-10">
        <CardContent>
          <Tabs defaultValue="attachments" className="w-full">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="attachments">{t('attachments')}</TabsTrigger>
            </TabsList>
            <TabsContent value="attachments" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
              <div className="grid grid-cols-2 gap-4">
                {employee.attachment && (
                  <>
                    <InfoItem 
                      label={t('nationalId')} 
                      value={employee.attachment.nationalId ? 
                        <a href={`${apiUrl}${employee.attachment.nationalId.url}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                          {t('viewDocument')}
                        </a> : 
                        t('notAvailable')
                      } 
                    />
                    <InfoItem 
                      label={t('Signature')} 
                      value={employee.attachment.passport ? 
                        <a href={`${apiUrl}${employee.attachment.passport.url}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                          {t('viewDocument')}
                        </a> : 
                        t('notAvailable')
                      } 
                    />
                    <InfoItem 
                      label={t('residencyPermit')} 
                      value={employee.attachment.residencyPermit ? 
                        <a href={`${apiUrl}${employee.attachment.residencyPermit.url}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                          {t('viewDocument')}
                        </a> : 
                        t('notAvailable')
                      } 
                    />
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="w-full max-w-4xl mx-auto mt-10">
        <CardContent>
          <Tabs defaultValue="links" className="w-full">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="links">{t('links')}</TabsTrigger>
            </TabsList>
            <TabsContent value="links" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
              {employee.links && employee.links.length > 0 ? (
                <div>
                  <Label className="font-medium">{t('links')}</Label>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc pl-5">
                    {employee.links.map((link, index) => (
                      <li key={index}>
                        <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <InfoItem label={t('links')} value={t('notAvailable')} />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <Label className="font-medium">{label}</Label>
      <p className="text-sm text-gray-600 dark:text-gray-400">{value}</p>
    </div>
  );
}

EmployeeProfile.propTypes = {
  employee: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    phone_number: PropTypes.string,
    nationality: PropTypes.string,
    department_id: PropTypes.number,
    extension_number: PropTypes.number,
    role_id: PropTypes.number,
    Medical_conditions: PropTypes.string,
    Accessibility_Needs: PropTypes.string,
    Home_Address: PropTypes.string,
    Emergency_Contact: PropTypes.string,
    Personal_Email: PropTypes.string,
    attachment: PropTypes.shape({
      nationalId: PropTypes.shape({
        path: PropTypes.string,
        url: PropTypes.string,
      }),
      passport: PropTypes.shape({
        path: PropTypes.string,
        url: PropTypes.string,
      }),
      residencyPermit: PropTypes.shape({
        path: PropTypes.string,
        url: PropTypes.string,
      }),
      profilePic: PropTypes.shape({
        path: PropTypes.string,
        url: PropTypes.string,
      }),
    }),
    links: PropTypes.arrayOf(PropTypes.string),
    employeeRole: PropTypes.shape({
      name: PropTypes.string.isRequired,
    }),
    department: PropTypes.shape({
      name: PropTypes.string.isRequired,
    }),
  }).isRequired,
};