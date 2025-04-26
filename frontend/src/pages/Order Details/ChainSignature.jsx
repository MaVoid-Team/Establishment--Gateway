// ChainSignature.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

const ChainSignature = ({ employeeId, signedAt, roleId, forceRole , isColored}) => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/v1/employees/${employeeId}`,
          { 
            withCredentials: true, 
            headers: { 
              Authorization: `Bearer ${localStorage.getItem('token')}` 
            } 
          }
        );
        setEmployee(res.data.data?.employee);
      } catch (err) {
        setError(err.message || 'Signature unavailable');
      } finally {
        setLoading(false);
      }
    };

    if (employeeId) fetchEmployee();
  }, [employeeId]);

 
  if (loading) return (
    <div className="text-center p-4 text-gray-600 text-sm">
      Loading signature...
    </div>
  );

  if (error) return (
    <div className="text-center p-4 text-red-500 text-xs">
      {error}
    </div>
  );

  return (
    <div className="print-segment">
      <div className="flex items-center justify-between">
        <div>
          <p className={`font-semibold text-md ${isColored ? 'text-gray-100' : 'text-gray-900'} break-words`}>
            {employee?.name || 'Approver Name'}
          </p>
       <p className={`text-sm ${isColored ? 'text-gray-200' : 'text-gray-600'}`}>
            {forceRole || {
              2: 'Employee',
              3: 'Manager',
              5: 'CFO',
              9: 'Chairman'
            }[roleId] || 'Approver'}
          </p>
        </div>
        <div className="w-32">
          {employee?.signature ? (
            <img
              src={employee.signature}
              className={`w-full h-12 object-contain border-b-2 ${isColored ? 'border-gray-200/30' : 'border-gray-300/50'}`}
              alt="Signature"
            />
          ) : (
            <div className="w-full h-12 border-b-2 border-gray-300" />
          )}
          <p className={`text-sm ${isColored ? 'text-gray-200' : 'text-gray-600'} text-center mt-1`}>
            {signedAt ? new Date(signedAt).toLocaleDateString() : 'Pending'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChainSignature;