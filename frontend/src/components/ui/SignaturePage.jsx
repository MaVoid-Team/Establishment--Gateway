// components/SignaturePage.js
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SignatureCanvas from 'react-signature-canvas';

const SignaturePage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const sigCanvasRef = useRef(null);
  const [signatureData, setSignatureData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [signer, setSigner] = useState(null);
  const [signerType, setSignerType] = useState(null);
  const [object, setObject] = useState(null);
  const [objectType, setObjectType] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL; // Make sure this is correctly set in your environment

  // Fetch signer and object information based on token
  useEffect(() => {
    const fetchSignerAndObject = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/v1/signatures/getSignerAndObject`, {
          params: { token },
          withCredentials: true,
        });
        setSigner(response.data.data.signer);
        setSignerType(response.data.data.signer_type);
        setObject(response.data.data.object || null);
        setObjectType(response.data.data.object_type || null);
      } catch (err) {
        console.error(err);
        setError('Unable to retrieve signer and object information.');
      }
    };

    fetchSignerAndObject();
  }, [token, apiUrl]);

  // Clear the signature from the canvas
  const clearSignature = () => {
    if (sigCanvasRef.current) {
      sigCanvasRef.current.clear();
    }
  };

  // Submit the signature to the backend
  const submitSignature = async () => {
    if (!signer) {
      alert('Signer information not loaded.');
      return;
    }

    if (sigCanvasRef.current.isEmpty()) {
      alert('Please provide a signature before submitting.');
      return;
    }

    // Convert signature to a Data URL
    const signatureDataURL = sigCanvasRef.current
      .getTrimmedCanvas()
      .toDataURL('image/png');

    setSignatureData(signatureDataURL);
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await axios.post(
        `${apiUrl}/api/v1/signatures/submit`,
        {
          token,
          signature_data: signatureDataURL,
        },
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        alert('Signature submitted successfully!');
        navigate('/main-page'); // Redirect to a success or main page
      }
    } catch (err) {
      console.error(err);
      setError('Failed to submit signature. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!signer) {
    return <div>Loading signer and object information...</div>;
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 text-center">
      <h2 className="text-2xl font-semibold mb-4">Please Sign Below</h2>

      <p className="mb-2">
        <strong>Signer:</strong> {signer.name} (
        {capitalizeFirstLetter(signerType)})
      </p>

      {object && objectType && (
        <p className="mb-2">
          <strong>Signing Object:</strong> {capitalizeFirstLetter(objectType)} -{' '}
          {objectType === 'order' ? object.id : object.name}
        </p>
      )}

      {/* Signature Canvas */}
      <div className="bg-[#3C3C3C] w-full aspect-[3/2]">
      <SignatureCanvas
        penColor="black"
        canvasProps={{
          className: "w-full h-full",
        }}
        ref={sigCanvasRef}
        className="mt-2"
      />
      </div>
      {/* Buttons */}
      <div className="mt-4 space-x-2">
        <button
          onClick={clearSignature}
          className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded"
        >
          Clear
        </button>
        <button
          onClick={submitSignature}
          disabled={isSubmitting}
          className={`px-4 py-2 rounded text-white font-semibold ${
            isSubmitting
              ? 'bg-blue-300 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>

      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

// Helper function to capitalize the first letter
const capitalizeFirstLetter = (string) => {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export default SignaturePage;
