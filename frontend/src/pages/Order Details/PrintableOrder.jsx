// PrintableOrder.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ChainSignature from './ChainSignature';
import SpinningScreen from '@/components/ui/spinningScreen';
import { Button } from '@/components/ui/button';

const PrintableOrder = () => {
  const { id } = useParams();
  const [isColored, setIsColored] = useState(true);
  const [state, setState] = useState({
    order: null,
    employee: null,
    company: null,
    loading: true,
    error: null,
  });
  const toggleColors = () => {
    setIsColored(!isColored);
    setTimeout(() => window.print(), 3000);
  };

  const [printReady, setPrintReady] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const orderRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/v1/orders/${id}`,
          { 
            withCredentials: true, 
            headers: { 
              Authorization: `Bearer ${localStorage.getItem('token')}` 
            } 
          }
        );
        
        const orderData = orderRes.data.data.order;
        
        const [empRes, compRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/v1/employees/${orderData.employee_id}`, { 
            withCredentials: true, 
            headers: { 
              Authorization: `Bearer ${localStorage.getItem('token')}` 
            } 
          }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/v1/companies/${orderData.company_id}`, { 
            withCredentials: true, 
            headers: { 
              Authorization: `Bearer ${localStorage.getItem('token')}` 
            } 
          })
        ]);

        setState({
          order: orderData,
          employee: empRes.data.data.employee,
          company: compRes.data.data.company,
          loading: false,
          error: null,
        });
        setPrintReady(true);
        
      } catch (err) {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: err.response?.data?.message || err.message || 'Failed to load data'
        }));
      }
    };

    fetchData();
  }, [id]);


  useEffect(() => {
    if (printReady && !state.loading && !state.error) {
      const printTimer = setTimeout(() => {
        window.print();
        setPrintReady(false);
      }, 3000); 

      return () => clearTimeout(printTimer);
    }
  }, [printReady, state.loading, state.error]);

  const { order, employee, company, loading, error } = state;

  if (state.loading) return <SpinningScreen />;
  if (state.error) return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-red-500 text-lg">{error}</p>
    </div>
  );

  // Process approval chain - exclude first entry
  const processedChain = order.approval_chain.slice(1);

  return (
    <div className={`${isColored ? 'bg-gradientBg' : 'bg-white'}  printable-container text-gray-700 p-8 space-y-4 print:p-2 min-h-screen`}>
       <Button 
  onClick={toggleColors}
  className={`
    fixed bottom-12 right-12 print:hidden 
    rounded-full px-5 py-3
    transition-all duration-300
    shadow-lg hover:shadow-xl
    bg-gradient-to-r from-[#c29f7b] to-[#6d614d] 
    hover:from-white hover:to-black
    text-white/90 hover:text-white
    hover:ring-2 hover:ring-white/30
    group flex items-center gap-2
  `}
>
  
  <span className="font-medium">Change Theme</span>
</Button>
      {/* Company Header */}
      <header className={`${isColored ? 'bg-amber-600/5' : ' bg-gray-50'} p-4 rounded-lg `}>
        <div className="flex justify-between items-start">
          <div>
            <h1 className={`text-3xl font-bold ${isColored ? 'text-white ' : 'text-gray-900'}`}>{company.name}</h1>
            <div className={`grid grid-cols-2 gap-x-8 gap-y-1 text-sm mt-2 ${isColored ? 'text-gray-200 ' : 'text-gray-900'}`}>
              <p><span className="font-semibold">CR:</span> {company.cr}</p>
              <p><span className="font-semibold">VAT:</span> {company.vat}</p>
              <p><span className="font-semibold">Location:</span> {company.location || 'N/A'}</p>
              <p><span className="font-semibold">Email:</span> {company.email}</p>
            </div>
          </div>
          <img 
            src="/images/logo.png" 
            className={`h-20 filter drop-shadow-2xl ${isColored ? '' : 'invert'}`}
            alt="Company Logo"
          />
        </div>
      </header>
            {/* Order Title & Description */}
            <div className={`${isColored ? 'bg-amber-600/5' : 'bg-gray-50'} p-4 print:p-2 rounded-lg print:rounded-none`}>
                    <h1 className={`text-xl font-bold ${isColored ? 'text-white' : 'text-gray-900'}  mb-2`}>{order.title}</h1>
                    <p className={`text-xs ${isColored ? 'text-gray-200' : 'text-gray-600'}  whitespace-pre-wrap`}>
                    {order.description || 'No description provided'}
                    </p>
                </div>
      {/* Dates Section */}
      <div className={`${isColored ? 'bg-amber-600/5' : 'bg-gray-50'} p-4 rounded-lg`}>
        <h2 className={`text-lg font-bold ${isColored ? 'text-white' : 'text-gray-900'}  mb-2`}>Order Timeline</h2>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className={`font-semibold ${isColored ? 'text-gray-300' : 'text-gray-600'} `} >Created</p>
            <p className={`font-semibold ${isColored ? 'text-gray-300' : 'text-gray-600'}`}>{new Date(order.created_at).toLocaleDateString()}</p>
          </div>
          <div>
          <p className={`font-semibold ${isColored ? 'text-gray-300' : 'text-gray-600'}`}>Estimated Completion</p>
            <p className={`font-semibold ${isColored ? 'text-gray-300' : 'text-gray-600'}`}>{new Date(order.estimated_time).toLocaleDateString()}</p>
          </div>
          <div>
            <p className={`font-semibold ${isColored ? 'text-gray-300' : 'text-gray-600'}`}>Last Updated</p>
            <p className={`font-semibold ${isColored ? 'text-gray-300' : 'text-gray-600'}`}>{order.updated_at ? new Date(order.updated_at).toLocaleDateString() : 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          <div className={`${isColored ? 'bg-amber-600/5' : 'bg-gray-50'} p-4 rounded-lg`}>
            <h2 className={`text-lg font-bold ${isColored ? 'text-white' : 'text-gray-900'} mb-2`}>Prepared By</h2>
            <div className="space-y-1">
              <p className={`font-medium ${isColored ? 'text-gray-100' : 'text-gray-900'}  break-words `}>{employee?.name}</p>
              <p className={`text-sm ${isColored ? 'text-gray-300' : 'text-gray-600'}`}>{employee?.role_name}</p>
              <p className={`text-sm ${isColored ? 'text-gray-300' : 'text-gray-600'}`}>{employee?.email}</p>
              <p className={`text-sm ${isColored ? 'text-gray-300' : 'text-gray-600'}`}>Phone: {employee?.phone_number || 'N/A'}</p>
            </div>
          </div>

          {/* <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Notes</h2>
            <p className="text-sm whitespace-pre-wrap text-gray-600">
              {order.notes || 'No additional notes provided'}
            </p>
          </div> */}
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div className={`${isColored ? 'bg-amber-600/5' : 'bg-gray-50'} p-4 rounded-lg`}>
            <h2 className={`text-lg font-bold ${isColored ? 'text-white' : 'text-gray-900'} mb-2`}>Financial Details</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className={`font-semibold ${isColored ? 'text-gray-200' : 'text-gray-600'}`}>Total Amount:</span>
                <span className={`font-medium ${isColored ? 'text-gray-200' : ''}`}>{order.price.toFixed(2)} SAR </span>
              </div>
              <div className="flex justify-between">
                <span className={`font-semibold ${isColored ? 'text-gray-200' : 'text-gray-600'}`}>Payment Method:</span>
                <span className={`font-medium ${isColored ? 'text-gray-200' : ''}`}>{order.payment_method}</span>
              </div>
            </div>
          </div>
          

          {/* <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Attachments</h2>
            <div className="space-y-2 text-sm">
              {order.attachment?.length > 0 ? (
                order.attachment.map((file, index) => (
                  <div key={index} className="flex items-center text-gray-600">
                    <span className="mr-2">📎</span>
                    <span className="truncate">{file.path.split('/').pop()}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No attachments available</p>
              )}
            </div>
          </div> */}
        </div>
      </div>
      <div className={`${isColored ? 'bg-amber-600/5' : 'bg-gray-50'} p-4 rounded-lg`}>
        <h2 className={`text-lg font-bold ${isColored ? 'text-white' : 'text-gray-900'} mb-2`}>Order Timeline</h2>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className={`font-semibold ${isColored ? 'text-gray-200' : 'text-gray-600'}`}>Created</p>
            <p className={`font-semibold ${isColored ? 'text-gray-300' : 'text-gray-600'}`}>{new Date(order.created_at).toLocaleDateString()}</p>
          </div>
          <div>
            <p className={`font-semibold ${isColored ? 'text-gray-200' : 'text-gray-600'}`}>Estimated Completion</p>
            <p className={`font-semibold ${isColored ? 'text-gray-300' : 'text-gray-600'}`}>{new Date(order.estimated_time).toLocaleDateString()}</p>
          </div>
          <div>
            <p className={`font-semibold ${isColored ? 'text-gray-200' : 'text-gray-600'}`}>Last Updated</p>
            <p className={`font-semibold ${isColored ? 'text-gray-300' : 'text-gray-600'}`}>{order.updated_at ? new Date(order.updated_at).toLocaleDateString() : 'N/A'}</p>
          </div>
        </div>
      </div>
      {/* Signature Section */}
      <div className="grid grid-cols-2 gap-6 mt-4">
        {/* Left Column - Submitter Signature */}
        <div className={`${isColored ? 'bg-amber-600/5' : 'bg-gray-50'} p-4 rounded-lg`}>
          <h2 className={`text-2xl font-bold ${isColored ? 'text-white' : 'text-gray-900'} mb-3`}>Submitted By</h2>
          <div>
            <p className={`font-semibold text-lg ${isColored ? 'text-white' : 'text-gray-900'} break-words`}>{employee?.name}</p>
            <p className={`text-md ${isColored ? 'text-gray-200' : 'text-gray-600'}`}>{employee?.role_name}</p>
            {order.signatures[0]?.signature_data && (
              <div className="h-32 w-48 my-2">
                <img
                  src={order.signatures[0].signature_data}
                  className="h-full w-full object-contain"
                  alt="Signature"
                />
              </div>
            )}
            <p className={`text-sm pl-[5%] ${isColored ? 'text-gray-200' : 'text-gray-600'}`}>
              {new Date(order.signatures[0]?.signed_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Right Column - Approvals */}
        <div className={`${isColored ? 'bg-amber-600/5' : 'bg-gray-50'} p-3 rounded-lg`}>
          <h2 className={`text-2xl font-bold ${isColored ? 'text-white' : 'text-gray-900'} mb-3`}>Approval Chain</h2>
          <div className="space-y-4">
            {processedChain.map((approval, index) => (
              <div key={index} className={`border-b pb-4 last:border-b-0 ${isColored ? 'border-gray-200/20' :''}`}>
                <ChainSignature 
                  isColored={isColored}
                  employeeId={approval.employee_id}
                  signedAt={approval.timestamp}
                  roleId={approval.role_id}
                />
              </div>
            ))}
            

          </div>
        </div>
      </div>

      <style>{`
      @media print {
        @page {
          size: auto;
          margin: 0 !important;
        }
        body {
          padding: 0 !important;
          margin: 0 !important;
          background: white !important;
          -webkit-print-color-adjust: exact;
        }
        .print\\:bg-overlay {
          background: rgba(255,255,255,0.9) !important;
        }
      }
    `}</style>
    </div>
  );
};
export default PrintableOrder;