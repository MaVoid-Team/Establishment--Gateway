import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from 'axios';

export default function ChangePasswordForm() {
  const { t ,i18n} = useTranslation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError(t('passwordMismatchError'));
      return;
    }

    // Ensure apiUrl ends with a forward slash
    const baseUrl = apiUrl.endsWith('/') ? apiUrl : `${apiUrl}/`;
    const fullUrl = `${baseUrl}api/v1/auth/changePassword`;

    try {
      const response = await axios.patch(
        fullUrl,
        {
          currentPassword,
          newPassword,
          confirmPassword,
        },
        {
          withCredentials: true,
        }
      );

      if (response.data.status === 'success') {
        setSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        throw new Error(response.data.message || t('passwordChangeFailed'));
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || t('passwordChangeError'));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4"
    dir={i18n.language === "ar" ? "rtl" : "ltr"}>
      <div>
        <Label htmlFor="currentPassword">{t('currentPassword')}</Label>
        <Input
          id="currentPassword"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="newPassword">{t('newPassword')}</Label>
        <Input
          id="newPassword"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="confirmPassword">{t('confirmNewPassword')}</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {success && <p className="text-green-500 text-sm">{t('passwordChangeSuccess')}</p>}
      <Button type="submit" className="w-full">{t('changePassword')}</Button>
    </form>
  );
}
