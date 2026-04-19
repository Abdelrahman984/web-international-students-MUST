import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';

export function SubmitRequest() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Mock submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.9
          }}
          animate={{
            opacity: 1,
            scale: 1
          }}
          className="card p-8 max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-navy-900 dark:text-white mb-2">
              Request Submitted!
            </h2>
            <p className="text-navy-500 dark:text-navy-300">
              Your request has been successfully submitted to the International Students Affairs office. You can track its status in My Requests.
            </p>
          </div>
          <div className="flex flex-col gap-3 pt-4">
            <button
              onClick={() => navigate('/my-requests')}
              className="btn-primary w-full">
              Track Request
            </button>
            <button
              onClick={() => setIsSuccess(false)}
              className="btn-secondary w-full">
              Submit Another Request
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="page-container max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-navy-900 dark:text-white">
          Submit a Request
        </h1>
        <p className="text-navy-400 dark:text-navy-200 mt-1">
          Apply for official documents, visa renewals, or file a complaint.
        </p>
      </div>

      <motion.div
        initial={{
          opacity: 0,
          y: 10
        }}
        animate={{
          opacity: 1,
          y: 0
        }}
        className="card p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Request Type */}
          <div>
            <label className="block text-sm font-semibold text-navy-900 dark:text-white mb-2">
              Request Type <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                required
                className="w-full appearance-none bg-gray-50 dark:bg-navy-800 border border-gray-200 dark:border-navy-700 text-gray-900 dark:text-white rounded-lg px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow">
                <option value="" disabled selected>
                  Select a request type...
                </option>
                <option value="enrollment">Enrollment Letter</option>
                <option value="transcript">Official Transcript</option>
                <option value="visa">Visa Renewal Support Letter</option>
                <option value="major">Change of Major</option>
                <option value="complaint">File a Complaint</option>
                <option value="other">Other</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4 Asc .343 8z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-navy-900 dark:text-white mb-2">
              Description / Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              placeholder="Please provide details about your request..."
              className="w-full bg-gray-50 dark:bg-navy-800 border border-gray-200 dark:border-navy-700 text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow resize-none">
            </textarea>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Be as specific as possible to avoid delays.
            </p>
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-sm font-semibold text-navy-900 dark:text-white mb-2">
              Attachments (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-navy-600 rounded-xl p-8 text-center hover:bg-gray-50 dark:hover:bg-navy-800 transition-colors cursor-pointer group">
              <div className="w-12 h-12 bg-gray-50 dark:bg-navy-800 text-gray-500 dark:text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">PDF, JPG, PNG (Max 5MB)</p>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-6 border-t border-gray-200 dark:border-navy-700 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-accent flex items-center gap-2 min-w-[140px] justify-center text-white bg-green-500 hover:bg-green-600 rounded-xl px-4 py-2">
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <FileText className="w-4 h-4" /> Submit Request
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

