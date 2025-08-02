import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifyEmail } from '../../api/auth';

const VerifyEmail = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('Verifying...');
  const uid = params.get('uid');
  const token = params.get('token');

  useEffect(() => {
    if (uid && token) {
      verifyEmail(uid, token)
        .then(() => {
          setMessage('Email verified successfully! Redirecting to login...');
          // Redirect to login after successful verification
          setTimeout(() => {
            navigate('/login');
          }, 2000); // Wait 2 seconds to show success message
        })
        .catch(() => setMessage('Verification failed. Invalid or expired token.'));
    } else {
      setMessage('Invalid verification link. Missing required parameters.');
    }
  }, [uid, token, navigate]);

  return (
    <div className="max-w-md mx-auto mt-32 text-center text-lg text-blue-700">
      {message}
    </div>
  );
};

export default VerifyEmail;
